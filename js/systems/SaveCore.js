(function (global) {
"use strict";
const SAVE_VERSION=5;
const SAVE_KEY_PREFIX="van_co_tien_do_v2_slot_";
const BACKUP_KEY_PREFIX="van_co_tien_do_v2_backup_slot_";
const AUTO_SAVE_KEY="van_co_tien_do_v2_autosave";
const AUTO_SAVE_BACKUP_KEY="van_co_tien_do_v2_autosave_backup";
const CRASH_RECOVERY_KEY="van_co_tien_do_v2_session_state";
const GRAVEYARD_KEY="van_co_tien_do_v2_dead_uids";
const MIN_SAVE_SLOTS=3;
const MAX_SAVE_SLOTS=10;
const MAX_IMPORT_FILE_BYTES=5*1024*1024;
function _sanitizeSaveString(val,fallback="",maxLen=160) {
if (typeof val!=="string") {
if (typeof val==="number"||typeof val==="boolean") val=String(val);
else return fallback;
}
const cleaned=val
.replace(/[\x00-\x1F\x7F]/g," ")
.replace(/[<>]/g,"")
.trim();
if (!cleaned) return fallback;
return cleaned.length>maxLen?cleaned.slice(0,maxLen) :cleaned;
}
function _safeFiniteNumber(val,fallback=0,minVal= -Infinity,maxVal=Infinity) {
const num=Number(val);
if (!Number.isFinite(num)) return fallback;
return Math.max(minVal,Math.min(maxVal,num));
}
function _isPlainObject(v) {
return Boolean(v)&&typeof v==="object"&& !Array.isArray(v);
}
function _computeIntegrityHash(str) {
let h=0x811c9dc5;
for (let i=0;i<str.length;i++) {
h ^=str.charCodeAt(i);
h=Math.imul(h,0x01000193);
}
return "fnv1a_" + (h>>>0).toString(16).padStart(8,"0");
}
class SaveManager {
constructor(gameEngine) {
this.game=gameEngine;
}
_isQuotaExceededError(err) {
if (!err) return false;
const name=String(err.name||"");
const msg=String(err.message||"").toLowerCase();
return (
name==="QuotaExceededError"||
name==="NS_ERROR_DOM_QUOTA_REACHED"||
err.code===22||
err.code===1014||
msg.includes("quota")||
msg.includes("exceeded")||
msg.includes("full")
);
}
_safeStorageGet(key) {
try {
return localStorage.getItem(key);
} catch (err) {
console.error(`Lỗi đọc localStorage [${key}]:`,err);
return null;
}
}
_safeStorageRemove(key) {
try {
localStorage.removeItem(key);
return true;
} catch (err) {
console.error(`Lỗi xóa localStorage [${key}]:`,err);
return false;
}
}
_safeStorageSet(key,value,options={}) {
try {
localStorage.setItem(key,value);
this.game.lastSaveError=null;
return {ok:true};
} catch (err) {
if (this._isQuotaExceededError(err)&& !options.noPruneRetry) {
const freed=this._pruneNonCriticalBackups(key);
if (freed>0) {
try {
localStorage.setItem(key,value);
this.game.lastSaveError=null;
if (this.game.ui&& !options.silent) {
this.game.ui.addLog(`🧹 Bộ nhớ trình duyệt gần đầy — đã tự dọn ${freed} bản backup cũ để lưu thành công! Hãy xuất file .json dự phòng.`,"warning");
}
return {ok:true,pruned:freed};
} catch (retryErr) {
err=retryErr;
}
}
}
const isQuota=this._isQuotaExceededError(err);
const reason=isQuota
?"Dung lượng localStorage của trình duyệt đã ĐẦY! Hãy xóa bớt Ô Lưu cũ hoặc bấm 'Xuất File Lưu (.json)' về máy ngay để tránh mất tiến trình."
:`Trình duyệt từ chối ghi bộ nhớ (${err&&err.name?err.name :"StorageError"}). Hãy kiểm tra chế độ Ẩn danh hoặc Xuất file .json!`;
this.game.lastSaveError={isQuota,reason,at:Date.now()};
console.error(`Lưu thất bại [${key}]:`,err);
const now=Date.now();
if (this.game.ui&& !options.silent&&(now - (this.game._lastQuotaAlertAt||0)>6000)) {
this.game._lastQuotaAlertAt=now;
this.game.ui.addLog(`❌ LƯU GAME THẤT BẠI: ${reason}`,"danger");
}
return {ok:false,isQuota,reason};
}
}
_pruneNonCriticalBackups(protectedKey=null) {
let removed=0;
for (let slot=MAX_SAVE_SLOTS;slot>=4;slot--) {
const bKey=`${BACKUP_KEY_PREFIX}${slot}`;
if (bKey===protectedKey) continue;
if (this._safeStorageGet(bKey)!==null) {
if (this._safeStorageRemove(bKey)) removed +=1;
}
}
return removed;
}
getStorageUsageInfo() {
let totalChars=0;
let gameChars=0;
try {
for (let i=0;i<localStorage.length;i++) {
const k=localStorage.key(i);
if (!k) continue;
const v=localStorage.getItem(k)||"";
const len=k.length + v.length;
totalChars +=len;
if (k.startsWith("van_co_tien_do_")) {
gameChars +=len;
}
}
} catch (e) {
return {unavailable:true,usedKB:0,gameKB:0,estimatedMaxKB:5120,percent:0};
}
const usedKB=Math.round((totalChars*2) / 1024);
const gameKB=Math.round((gameChars*2) / 1024);
const estimatedMaxKB=5120;
const percent=Math.min(100,Math.round((usedKB / estimatedMaxKB)*100));
return {unavailable:false,usedKB,gameKB,estimatedMaxKB,percent};
}
_updateSessionMarker(isActive,cleanExit=false) {
const payload={
active:Boolean(isActive),
cleanExit:Boolean(cleanExit),
characterUid:this.game.characterUid||null,
playerName:this.game.player?_sanitizeSaveString(this.game.player.name,"Cổ Sư",32) :null,
screen:this.game.currentScreen||"creation",
activeSaveSlot:this.game.activeSaveSlot||null,
updatedAt:Date.now()
};
this._safeStorageSet(CRASH_RECOVERY_KEY,JSON.stringify(payload),{silent:true,noPruneRetry:true});
}
_checkCrashRecoveryOnBoot() {
this.game.crashRecoveryNotice=null;
const rawMarker=this._safeStorageGet(CRASH_RECOVERY_KEY);
let marker=null;
if (rawMarker) {
try {
marker=JSON.parse(rawMarker);
} catch (e) {
marker=null;
}
}
const rawAuto=this._safeStorageGet(AUTO_SAVE_KEY);
if (rawAuto) {
const check=this._parseAndValidateRawSave(rawAuto,{verifyChecksum:true});
if (!check.valid) {
const rawBak=this._safeStorageGet(AUTO_SAVE_BACKUP_KEY);
if (rawBak) {
const bakCheck=this._parseAndValidateRawSave(rawBak,{verifyChecksum:false});
if (bakCheck.valid) {
this._safeStorageSet(AUTO_SAVE_KEY,rawBak,{silent:true});
this.game.crashRecoveryNotice=`⚠️ Phát hiện Auto-Save bị hỏng do đóng trình duyệt đột ngột — đã tự động khôi phục từ bản dự phòng an toàn (${bakCheck.data.playerName||"Cổ Sư"})!`;
return;
}
}
this.game.crashRecoveryNotice="⚠️ Bản Auto-Save bị hỏng; hãy tải từ Ô Lưu 1–3 hoặc Nhập file .json dự phòng.";
return;
}
}
if (marker&&marker.active&& !marker.cleanExit) {
this.game.crashRecoveryNotice=`🛡️ Phiên chơi trước (${marker.playerName||"Cổ Sư"}) đóng đột ngột — tiến trình gần nhất đã được bảo toàn trong Auto-Save!`;
}
}
_attachChecksum(payload) {
const copy={...payload};
delete copy.integrityHash;
const coreStr=JSON.stringify(copy);
return {
...copy,
integrityHash:_computeIntegrityHash(coreStr)
};
}
_verifyChecksum(data) {
if (!_isPlainObject(data)||typeof data.integrityHash!=="string") {
return {hasChecksum:false,ok:true};
}
const copy={...data};
const expected=copy.integrityHash;
delete copy.integrityHash;
const actual=_computeIntegrityHash(JSON.stringify(copy));
return {hasChecksum:true,ok:actual===expected};
}
_validateSavePayload(data,options={}) {
const errors=[];
const warnings=[];
if (!_isPlainObject(data)) {
return {valid:false,errors:["Dữ liệu không phải đối tượng JSON hợp lệ."],warnings};
}
if (data.gameTitle&&data.gameTitle!=="VAN_CO_TIEN_DO") {
errors.push(`Sai định dạng gameTitle (${String(data.gameTitle).slice(0,32)}).`);
}
if (data.isPermadead===true) {
return {valid:true,isPermadead:true,errors,warnings};
}
if (options.verifyChecksum) {
const csum=this._verifyChecksum(data);
if (csum.hasChecksum&& !csum.ok) {
return {
valid:false,
checksumMismatch:true,
errors:["Mã kiểm tra toàn vẹn (integrityHash) không khớp — dữ liệu có thể bị hỏng hoặc cắt cụt."],
warnings
};
}
}
if (!_isPlainObject(data.aperture)) {
errors.push("Thiếu đối tượng Không Khiếu (aperture).");
} else {
const rank=Number(data.aperture.rank);
if (!Number.isFinite(rank)||rank<1||rank>9) {
errors.push("Cảnh giới aperture.rank không hợp lệ (phải là số từ 1 đến 9).");
}
if (data.aperture.aptitude!==undefined&&data.aperture.aptitude!==null&& !_isPlainObject(data.aperture.aptitude)) {
errors.push("Thuộc tính aperture.aptitude sai kiểu dữ liệu.");
}
}
if (!_isPlainObject(data.player)) {
errors.push("Thiếu đối tượng Nhân Vật (player).");
} else {
if (data.player.inventory!==undefined&& !Array.isArray(data.player.inventory)) {
errors.push("Hành trang player.inventory sai kiểu dữ liệu (không phải mảng).");
}
if (data.player.daoMarks!==undefined&&data.player.daoMarks!==null&& !_isPlainObject(data.player.daoMarks)) {
errors.push("Dữ liệu Đạo Ngân player.daoMarks sai kiểu dữ liệu.");
}
}
if (data.guSystem!==undefined&&data.guSystem!==null) {
if (!_isPlainObject(data.guSystem)) {
errors.push("Dữ liệu Kho Cổ (guSystem) sai kiểu dữ liệu.");
} else if (data.guSystem.ownedGuList!==undefined&& !Array.isArray(data.guSystem.ownedGuList)) {
errors.push("Danh sách Cổ Trùng (ownedGuList) không phải mảng.");
}
}
if (data.saveVersion!==undefined&&(!Number.isFinite(Number(data.saveVersion))||Number(data.saveVersion)<0)) {
warnings.push("saveVersion không hợp lệ, sẽ tự chuẩn hóa.");
}
return {
valid:errors.length===0,
errors,
warnings
};
}
_migrateSavePayload(rawData) {
const data=JSON.parse(JSON.stringify(rawData));
const originalVersion=Number.isFinite(Number(data.saveVersion))?Math.floor(Number(data.saveVersion)) :1;
data.gameTitle="VAN_CO_TIEN_DO";
data.version="3.1.0";
data.saveVersion=SAVE_VERSION;
data.migratedFromVersion=originalVersion<SAVE_VERSION?originalVersion :undefined;
data.characterUid=_sanitizeSaveString(
data.characterUid,
`char_${Date.now()}_${Math.random().toString(36).slice(2,10)}`,
64
);
data.isPermadead=Boolean(data.isPermadead);
data.savedTimestamp=_safeFiniteNumber(data.savedTimestamp,Date.now(),0);
data.savedAt=_sanitizeSaveString(data.savedAt,new Date(data.savedTimestamp).toLocaleString("vi-VN"),48);
data.savedAtIso=typeof data.savedAtIso==="string"?data.savedAtIso :new Date(data.savedTimestamp).toISOString();
const cleanClears={};
if (_isPlainObject(data.stageClears)) {
for (const [k,v] of Object.entries(data.stageClears)) {
const cleanKey=_sanitizeSaveString(k,"",48);
const count=Math.floor(_safeFiniteNumber(v,0,0,999999));
if (cleanKey&&count>0) cleanClears[cleanKey]=count;
}
}
data.stageClears=cleanClears;
data.claimedInheritances=Array.isArray(data.claimedInheritances)
?data.claimedInheritances.map(x=>_sanitizeSaveString(x,"",48)).filter(Boolean)
:[];
const ap=_isPlainObject(data.aperture)?data.aperture :{};
const rank=Math.floor(_safeFiniteNumber(ap.rank,1,1,9));
const isImmortal=Boolean(ap.isImmortal||rank>=6);
const maxSub=(isImmortal&&rank===8)?4 :3;
const subStage=Math.floor(_safeFiniteNumber(ap.subStage,0,0,maxSub));
const rawApt=_isPlainObject(ap.aptitude)?ap.aptitude :{};
const cleanAptitude={
grade:_sanitizeSaveString(rawApt.grade,"B",8),
gradeName:_sanitizeSaveString(rawApt.gradeName,"Ất Đẳng",48),
maxSeaPercent:Math.round(_safeFiniteNumber(rawApt.maxSeaPercent,72,20,100)),
baseRegen:_safeFiniteNumber(rawApt.baseRegen,1.5,0.2,20),
cultivateMult:_safeFiniteNumber(rawApt.cultivateMult,1.2,0.4,10),
breakthroughBonus:_safeFiniteNumber(rawApt.breakthroughBonus,0.05,0,1),
physique:_isPlainObject(rawApt.physique)?{
...rawApt.physique,
name:_sanitizeSaveString(rawApt.physique.name,"Thập Tuyệt Thể",48),
favoredPaths:Array.isArray(rawApt.physique.favoredPaths)?rawApt.physique.favoredPaths.map(p=>_sanitizeSaveString(p,"",32)).filter(Boolean) :[],
guPowerBonus:_safeFiniteNumber(rawApt.physique.guPowerBonus,0.25,0,2)
} :null,
desc:_sanitizeSaveString(rawApt.desc,"Không Khiếu Cổ Sư.",220)
};
const rawImmEss=_isPlainObject(ap.immortalEssence)?ap.immortalEssence :{};
const cleanImmEss={
"6":_safeFiniteNumber(rawImmEss["6"]!==undefined?rawImmEss["6"] :rawImmEss[6],0,0,9999999),
"7":_safeFiniteNumber(rawImmEss["7"]!==undefined?rawImmEss["7"] :rawImmEss[7],0,0,9999999),
"8":_safeFiniteNumber(rawImmEss["8"]!==undefined?rawImmEss["8"] :rawImmEss[8],0,0,9999999),
"9":_safeFiniteNumber(rawImmEss["9"]!==undefined?rawImmEss["9"] :rawImmEss[9],0,0,9999999)
};
const rawImmAp=_isPlainObject(ap.immortalAperture)?ap.immortalAperture :{};
const rawRes=_isPlainObject(rawImmAp.resources)?rawImmAp.resources :{};
const rawLiv=_isPlainObject(rawImmAp.livingBeings)?rawImmAp.livingBeings :{};
const cleanImmAp={
active:Boolean(rawImmAp.active||isImmortal),
gradeId:_sanitizeSaveString(rawImmAp.gradeId,isImmortal?"MEDIUM" :"NONE",24),
gradeName:_sanitizeSaveString(rawImmAp.gradeName,isImmortal?"Phúc Địa Thượng Đẳng" :"Chưa Khai Tiên Khiếu",64),
spaceAcres:Math.floor(_safeFiniteNumber(rawImmAp.spaceAcres,isImmortal?6000 :0,0,9999999)),
timeRatio:_safeFiniteNumber(rawImmAp.timeRatio,isImmortal?12 :1,1,120),
internalDays:_safeFiniteNumber(rawImmAp.internalDays,0,0,99999999),
calamityCountdownDays:_safeFiniteNumber(rawImmAp.calamityCountdownDays,365,1,99999),
lastYieldAt:_safeFiniteNumber(rawImmAp.lastYieldAt,0,0),
subStageTribulationsPassed:Math.floor(_safeFiniteNumber(rawImmAp.subStageTribulationsPassed,0,0,9999)),
subStageTribulationsRequired:Math.floor(_safeFiniteNumber(rawImmAp.subStageTribulationsRequired,8,1,9999)),
earthlyCalamitiesPassed:Math.floor(_safeFiniteNumber(rawImmAp.earthlyCalamitiesPassed,0,0,99999)),
heavenlyTribulationsPassed:Math.floor(_safeFiniteNumber(rawImmAp.heavenlyTribulationsPassed,0,0,99999)),
grandTribulationsPassed:Math.floor(_safeFiniteNumber(rawImmAp.grandTribulationsPassed,0,0,99999)),
myriadTribulationsPassed:Math.floor(_safeFiniteNumber(rawImmAp.myriadTribulationsPassed,0,0,99999)),
originCoreStability:_safeFiniteNumber(rawImmAp.originCoreStability,100,0,100),
resources:{
primevalStonesOutput:Math.floor(_safeFiniteNumber(rawRes.primevalStonesOutput,6,0,99999)),
herbsNodes:Math.floor(_safeFiniteNumber(rawRes.herbsNodes,2,0,9999)),
oreVeins:Math.floor(_safeFiniteNumber(rawRes.oreVeins,2,0,9999)),
guWormsWild:Math.floor(_safeFiniteNumber(rawRes.guWormsWild,3,0,9999)),
immortalMaterialPoints:Math.floor(_safeFiniteNumber(rawRes.immortalMaterialPoints,1,0,9999))
},
livingBeings:{
mortals:Math.floor(_safeFiniteNumber(rawLiv.mortals,100,0,9999999)),
beasts:Math.floor(_safeFiniteNumber(rawLiv.beasts,15,0,9999999)),
variantHumans:Math.floor(_safeFiniteNumber(rawLiv.variantHumans,0,0,9999999))
},
environmentNodes:Array.isArray(rawImmAp.environmentNodes)
?rawImmAp.environmentNodes.filter(_isPlainObject).slice(0,24).map((n,idx)=>({
id:_sanitizeSaveString(n.id,`node_${idx}`,24),
name:_sanitizeSaveString(n.name,"Linh Mạch",48),
color:typeof n.color==="string"&& /^#[0-9a-fA-F]{3,8}$/.test(n.color)?n.color :"#4cd964",
icon:_sanitizeSaveString(n.icon,"💎",8),
normX:_safeFiniteNumber(n.normX,0.5,0.05,0.95),
normY:_safeFiniteNumber(n.normY,0.5,0.05,0.95),
level:Math.floor(_safeFiniteNumber(n.level,1,1,10))
}))
:[]
};
data.aperture={
isAwakened:ap.isAwakened!==undefined?Boolean(ap.isAwakened) :true,
isImmortal:isImmortal,
aptitude:cleanAptitude,
rank:rank,
subStage:subStage,
currentEssence:_safeFiniteNumber(ap.currentEssence,cleanAptitude.maxSeaPercent,0,cleanAptitude.maxSeaPercent),
wallProgress:_safeFiniteNumber(ap.wallProgress,0,0,99999999),
maxWallProgress:_safeFiniteNumber(ap.maxWallProgress,450,1,99999999),
wallPressure:_safeFiniteNumber(ap.wallPressure,5,0,100),
wallIntegrity:_safeFiniteNumber(ap.wallIntegrity,100,0,100),
hasExploded:Boolean(ap.hasExploded),
tenExtremeSealed:Boolean(ap.tenExtremeSealed),
pressureFreezeTimer:_safeFiniteNumber(ap.pressureFreezeTimer,0,0,36000),
daoBlockadeBroken:Boolean(ap.daoBlockadeBroken||rank>=9),
daoLordPath:ap.daoLordPath?_sanitizeSaveString(ap.daoLordPath,null,32) :(isImmortal&&rank>=9?"Trí Đạo" :null),
naturalDaoMarksRefined:Math.floor(_safeFiniteNumber(ap.naturalDaoMarksRefined,isImmortal&&rank>=9?50000 :0,0,99999999)),
vitalGuId:_sanitizeSaveString(ap.vitalGuId,"nguyet_quang_gu",64),
vitalGuName:_sanitizeSaveString(ap.vitalGuName,"Nguyệt Quang Cổ",96),
humanQi:_safeFiniteNumber(ap.humanQi,20,0,99999999),
immortalEssence:cleanImmEss,
immortalAperture:cleanImmAp,
ascensionState:_isPlainObject(ap.ascensionState)?{
inProgress:Boolean(ap.ascensionState.inProgress),
stage:Math.floor(_safeFiniteNumber(ap.ascensionState.stage,0,0,4)),
heavenQi:_safeFiniteNumber(ap.ascensionState.heavenQi,0,0,99999),
earthQi:_safeFiniteNumber(ap.ascensionState.earthQi,0,0,99999),
humanQiCommitted:_safeFiniteNumber(ap.ascensionState.humanQiCommitted,0,0,99999),
balanceScore:_safeFiniteNumber(ap.ascensionState.balanceScore,0,0,100),
tribulationHp:_safeFiniteNumber(ap.ascensionState.tribulationHp,100,0,10000),
tribulationMaxHp:_safeFiniteNumber(ap.ascensionState.tribulationMaxHp,100,1,10000),
logs:Array.isArray(ap.ascensionState.logs)
?ap.ascensionState.logs.slice(-20).map(l=>_sanitizeSaveString(l,"",220)).filter(Boolean)
:[]
} :{
inProgress:false,stage:0,heavenQi:0,earthQi:0,humanQiCommitted:0,
balanceScore:0,tribulationHp:100,tribulationMaxHp:100,logs:[]
}
};
const pl=_isPlainObject(data.player)?data.player :{};
const itemDb=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
const daoDb=(global.PlayerManager&&global.PlayerManager.DAO_PATHS)||{};
const cleanName=_sanitizeSaveString(pl.name||data.playerName,"Cổ Nguyệt Phương Nguyên",32);
const cleanDaoMarks={};
const cleanAttainExp={};
const cleanAttain={};
for (const pName of Object.keys(daoDb)) {
cleanDaoMarks[pName]=isImmortal&&_isPlainObject(pl.daoMarks)
?_safeFiniteNumber(pl.daoMarks[pName],0,0,99999999)
:0;
const legacyExp= !isImmortal&&_isPlainObject(pl.daoMarks)?_safeFiniteNumber(pl.daoMarks[pName],0,0,99999999) :0;
cleanAttainExp[pName]=_isPlainObject(pl.pathAttainmentExp)
?_safeFiniteNumber(pl.pathAttainmentExp[pName],legacyExp,0,99999999)
:Math.max(legacyExp,cleanDaoMarks[pName]);
cleanAttain[pName]=_isPlainObject(pl.pathAttainment)&&typeof pl.pathAttainment[pName]==="string"
?_sanitizeSaveString(pl.pathAttainment[pName],"Phàm Cấp",32)
:"Phàm Cấp";
}
const cleanInventory=[];
const invMap=new Map();
if (Array.isArray(pl.inventory)) {
for (const entry of pl.inventory) {
if (!_isPlainObject(entry)) continue;
const itemId=_sanitizeSaveString(entry.id,"",48);
const cnt=Math.floor(_safeFiniteNumber(entry.count,0,0,9999999));
if (!itemId||cnt<=0) continue;
if (Object.keys(itemDb).length>0&& !itemDb[itemId]) continue;
invMap.set(itemId,(invMap.get(itemId)||0) + cnt);
}
}
for (const [id,count] of invMap.entries()) {
cleanInventory.push({id,count});
}
const immStonesInv=invMap.get("immortal_stone")||0;
const immStonesClean=Math.max(Math.floor(_safeFiniteNumber(pl.immortalStones,0,0,9999999)),immStonesInv);
if (immStonesClean>0&&immStonesInv!==immStonesClean) {
const idxImm=cleanInventory.findIndex(i=>i.id==="immortal_stone");
if (idxImm>=0) cleanInventory[idxImm].count=immStonesClean;
else cleanInventory.push({id:"immortal_stone",count:immStonesClean});
}
const cleanDreams={};
if (_isPlainObject(pl.dreamClears)) {
for (const [k,v] of Object.entries(pl.dreamClears)) {
const ck=_sanitizeSaveString(k,"",48);
const cv=Math.floor(_safeFiniteNumber(v,0,0,99999));
if (ck&&cv>0) cleanDreams[ck]=cv;
}
}
data.player={
name:cleanName,
skinId:_sanitizeSaveString(pl.skinId,"phuong_nguyen",32),
region:_sanitizeSaveString(pl.region,"nam_cuong",32),
origin:_sanitizeSaveString(pl.origin,"righteous_clan",32),
alignment:Math.round(_safeFiniteNumber(pl.alignment,20,-1000,1000)),
fame:Math.floor(_safeFiniteNumber(pl.fame,0,0,99999999)),
kills:Math.floor(_safeFiniteNumber(pl.kills,0,0,99999999)),
baseMaxHp:Math.round(_safeFiniteNumber(pl.baseMaxHp,125,50,5000)),
hp:_safeFiniteNumber(pl.hp,125,1,999999999),
baseAtk:Math.round(_safeFiniteNumber(pl.baseAtk,16,5,1000)),
baseDef:Math.round(_safeFiniteNumber(pl.baseDef,8,1,1000)),
baseSpd:Math.round(_safeFiniteNumber(pl.baseSpd,140,60,500)),
baseVision:Math.round(_safeFiniteNumber(pl.baseVision,260,120,1000)),
baseMaxMental:Math.round(_safeFiniteNumber(pl.baseMaxMental,110,40,5000)),
mental:_safeFiniteNumber(pl.mental,110,0,99999999),
stamina:_safeFiniteNumber(pl.stamina,100,0,100),
primevalStones:Math.floor(_safeFiniteNumber(pl.primevalStones,60,0,999999999)),
meritPoints:Math.floor(_safeFiniteNumber(pl.meritPoints,100,0,999999999)),
immortalStones:immStonesClean,
refinementBonus:_safeFiniteNumber(pl.refinementBonus,0,0,0.5),
tradeDiscount:_safeFiniteNumber(pl.tradeDiscount,0,0,0.5),
mainPath:daoDb[pl.mainPath]?pl.mainPath :"Quang Đạo",
daoMarks:cleanDaoMarks,
pathAttainment:cleanAttain,
pathAttainmentExp:cleanAttainExp,
dreamClears:cleanDreams,
inventory:cleanInventory
};
data.playerName=cleanName;
data.realmName=_sanitizeSaveString(data.realmName,`${rank} Chuyển`,80);
if (_isPlainObject(data.guSystem)) {
const gs=data.guSystem;
const guDb=(global.GuSystem&&global.GuSystem.GU_DATABASE)||{};
const aliases=(global.GuSystem&&global.GuSystem.LEGACY_GU_ALIASES)||{};
const cleanOwned=[];
if (Array.isArray(gs.ownedGuList)) {
gs.ownedGuList.forEach((g,idx)=>{
if (!_isPlainObject(g)) return;
let gid=_sanitizeSaveString(g.id,"",64);
if (!guDb[gid]&&aliases[gid]) gid=aliases[gid].id;
if (!guDb[gid]) return;
cleanOwned.push({
...g,
instanceId:_sanitizeSaveString(g.instanceId,`gu_inst_${idx + 1}`,48),
id:gid,
rank:Math.floor(_safeFiniteNumber(g.rank,guDb[gid].defaultRank||1,1,9)),
isRefined:g.isRefined!==undefined?Boolean(g.isRefined) :true,
refinementProgress:Math.round(_safeFiniteNumber(g.refinementProgress,g.isRefined===false?0 :100,0,100)),
isVital:Boolean(g.isVital),
hunger:_safeFiniteNumber(g.hunger,100,0,100),
equippedSlot:(typeof g.equippedSlot==="number"&&g.equippedSlot>=0&&g.equippedSlot<=7)?Math.floor(g.equippedSlot) :null
});
});
}
const ownedIdSet=new Set(cleanOwned.map(g=>g.instanceId));
const cleanEqSlots=[null,null,null,null,null,null,null,null];
if (Array.isArray(gs.equippedGuSlots)) {
for (let i=0;i<8;i++) {
const slotVal=gs.equippedGuSlots[i];
if (typeof slotVal==="string"&&ownedIdSet.has(slotVal)) {
cleanEqSlots[i]=slotVal;
}
}
}
const cleanMoves=[];
if (Array.isArray(gs.savedKillerMoves)) {
for (const m of gs.savedKillerMoves) {
if (!_isPlainObject(m)|| !Array.isArray(m.requiredGuIds)||m.requiredGuIds.length===0) continue;
cleanMoves.push({
...m,
id:_sanitizeSaveString(m.id,`km_${cleanMoves.length + 1}`,80),
name:_sanitizeSaveString(m.name,"Sát Chiêu Vô Danh",80),
icon:_sanitizeSaveString(m.icon,"⚡",8),
path:_sanitizeSaveString(m.path,"Quang Đạo",32),
typeLabel:_sanitizeSaveString(m.typeLabel,"Sát Chiêu",64),
description:_sanitizeSaveString(m.description,"",320),
moveRank:Math.floor(_safeFiniteNumber(m.moveRank,1,1,9)),
power:_safeFiniteNumber(m.power,40,10,99999999),
essenceCost:_safeFiniteNumber(m.essenceCost,15,0.1,100),
cooldown:_safeFiniteNumber(m.cooldown,5.0,1.0,60),
requiredGuIds:m.requiredGuIds.map(id=>_sanitizeSaveString(id,"",64)).filter(Boolean)
});
}
}
const moveIdSet=new Set(cleanMoves.map(m=>m.id));
const cleanKSlots=[null,null,null,null];
if (Array.isArray(gs.equippedKillerSlots)) {
for (let i=0;i<4;i++) {
const mvId=gs.equippedKillerSlots[i];
if (typeof mvId==="string"&&moveIdSet.has(mvId)) {
cleanKSlots[i]=mvId;
}
}
}
data.guSystem={
ownedGuList:cleanOwned,
nextInstanceCounter:Math.max(cleanOwned.length + 1,Math.floor(_safeFiniteNumber(gs.nextInstanceCounter,cleanOwned.length + 1,1,9999999))),
equippedGuSlots:cleanEqSlots,
savedKillerMoves:cleanMoves,
equippedKillerSlots:cleanKSlots,
unlockedRecipeIds:Array.isArray(gs.unlockedRecipeIds)
?gs.unlockedRecipeIds.map(r=>_sanitizeSaveString(r,"",64)).filter(Boolean)
:[],
refinementExp:Math.floor(_safeFiniteNumber(gs.refinementExp,0,0,9999999)),
refinementPityStreak:Math.floor(_safeFiniteNumber(gs.refinementPityStreak,0,0,5))
};
}
if (_isPlainObject(data.map)) {
const wt=_isPlainObject(data.map.worldTime)?data.map.worldTime :{};
data.map={
worldTime:{
year:Math.floor(_safeFiniteNumber(wt.year,1,1,99999)),
day:Math.floor(_safeFiniteNumber(wt.day,1,1,365)),
hourFloat:_safeFiniteNumber(wt.hourFloat,8,0,24),
weatherIndex:Math.floor(_safeFiniteNumber(wt.weatherIndex,0,0,10)),
weatherTimer:_safeFiniteNumber(wt.weatherTimer,60,1,600)
},
cameraZoom:_safeFiniteNumber(data.map.cameraZoom,1.0,0.15,20.0)
};
}
if (_isPlainObject(data.enemies)) {
const en=data.enemies;
if (Array.isArray(en.quests)) {
en.quests=en.quests.filter(_isPlainObject).map((q,idx)=>({
...q,
id:_sanitizeSaveString(q.id,`q_${idx}`,64),
title:_sanitizeSaveString(q.title,"Ủy Thác Nhiệm Vụ",96),
description:_sanitizeSaveString(q.description,"",240),
rewardText:_sanitizeSaveString(q.rewardText,"",160),
progress:Math.floor(_safeFiniteNumber(q.progress,0,0,99999)),
target:Math.max(1,Math.floor(_safeFiniteNumber(q.target,1,1,99999))),
completed:Boolean(q.completed)
}));
}
if (Array.isArray(en.npcs)) {
en.npcs=en.npcs.filter(_isPlainObject).map((n,idx)=>({
...n,
id:_sanitizeSaveString(n.id,`npc_${idx}`,48),
name:_sanitizeSaveString(n.name,"Cổ Sư Vô Danh",48),
title:_sanitizeSaveString(n.title,"Tán Tu",64),
factionName:_sanitizeSaveString(n.factionName,"Trung Lập",64),
rank:Math.floor(_safeFiniteNumber(n.rank,2,1,9)),
hp:_safeFiniteNumber(n.hp,400,1,9999999),
maxHp:_safeFiniteNumber(n.maxHp,400,1,9999999)
}));
}
}
data.worldProgression=_isPlainObject(rawData.worldProgression)?rawData.worldProgression :{};
data.beastArmy=_isPlainObject(rawData.beastArmy)?rawData.beastArmy :null;
data.stoneGambling=_isPlainObject(rawData.stoneGambling)?rawData.stoneGambling :null;
data.guHouse=_isPlainObject(rawData.guHouse)?rawData.guHouse :null;
data.bountySystem=_isPlainObject(rawData.bountySystem)?rawData.bountySystem :null;
data.blessedLand=_isPlainObject(rawData.blessedLand)?rawData.blessedLand :null;
data.reverseFlow=_isPlainObject(rawData.reverseFlow)?rawData.reverseFlow :null;
return data;
}
_parseAndValidateRawSave(rawStr,options={}) {
if (typeof rawStr!=="string"|| !rawStr.trim()) {
return {valid:false,error:"Dữ liệu lưu trống rỗng."};
}
let parsed=null;
try {
parsed=JSON.parse(rawStr);
} catch (e) {
return {valid:false,error:"Lỗi cú pháp JSON (dữ liệu bị hỏng hoặc cắt cụt)."};
}
const check=this._validateSavePayload(parsed,options);
if (!check.valid) {
return {valid:false,error:check.errors.join(" "),checksumMismatch:Boolean(check.checksumMismatch)};
}
if (check.isPermadead||this._isPayloadPermadead(parsed)) {
return {valid:true,isPermadead:true,data:parsed};
}
const migrated=this._migrateSavePayload(parsed);
return {
valid:true,
isPermadead:false,
data:migrated,
wasMigrated:Boolean(migrated.migratedFromVersion),
migratedFrom:migrated.migratedFromVersion
};
}
_readSaveWithBackupFallback(primaryKey,backupKey,label="Lưu Trữ") {
const rawPrimary=this._safeStorageGet(primaryKey);
if (rawPrimary) {
const primaryCheck=this._parseAndValidateRawSave(rawPrimary,{verifyChecksum:true});
if (primaryCheck.valid) {
return {
ok:true,
usedBackup:false,
isPermadead:Boolean(primaryCheck.isPermadead),
data:primaryCheck.data,
wasMigrated:primaryCheck.wasMigrated,
migratedFrom:primaryCheck.migratedFrom
};
}
console.warn(`Phát hiện [${label}] bị hỏng (${primaryCheck.error}). Đang thử bản backup...`);
}
const rawBackup=backupKey?this._safeStorageGet(backupKey) :null;
if (rawBackup) {
const bakCheck=this._parseAndValidateRawSave(rawBackup,{verifyChecksum:false});
if (bakCheck.valid) {
this._safeStorageSet(primaryKey,rawBackup,{silent:true});
return {
ok:true,
usedBackup:true,
isPermadead:Boolean(bakCheck.isPermadead),
data:bakCheck.data,
wasMigrated:bakCheck.wasMigrated,
migratedFrom:bakCheck.migratedFrom
};
}
}
if (!rawPrimary&& !rawBackup) {
return {ok:false,empty:true,error:`${label} hiện đang trống.`};
}
return {
ok:false,
corrupted:true,
error:`${label} bị hỏng và không tìm thấy bản dự phòng hợp lệ!`
};
}
checkSaveConsistency() {
const issues=[];
let autoData=null;
const rawAuto=this._safeStorageGet(AUTO_SAVE_KEY);
if (rawAuto) {
const autoCheck=this._parseAndValidateRawSave(rawAuto,{verifyChecksum:true});
if (!autoCheck.valid) {
const bakOk=Boolean(this._safeStorageGet(AUTO_SAVE_BACKUP_KEY));
issues.push({
level:"danger",
text:bakOk
?"Auto-Save chính bị hỏng nhưng đã có bản dự phòng — bấm [📂 Tải Auto] để tự khôi phục."
:"Auto-Save chính bị hỏng — hãy tải từ Ô Lưu 1–3 hoặc nhập file .json!"
});
} else if (!autoCheck.isPermadead) {
autoData=autoCheck.data;
}
}
const slotSummaries=[];
for (let slot=1;slot<=MAX_SAVE_SLOTS;slot++) {
const rawSlot=this._safeStorageGet(`${SAVE_KEY_PREFIX}${slot}`);
if (!rawSlot) continue;
const sCheck=this._parseAndValidateRawSave(rawSlot,{verifyChecksum:true});
if (!sCheck.valid) {
const hasBak=Boolean(this._safeStorageGet(`${BACKUP_KEY_PREFIX}${slot}`));
issues.push({
level:"danger",
text:`Ô Lưu ${slot} bị lỗi cấu trúc JSON${hasBak?" (có bản dự phòng — bấm 📂 Tải để tự khôi phục)" :""}!`
});
continue;
}
if (!sCheck.isPermadead) {
slotSummaries.push({slot,data:sCheck.data});
}
}
if (autoData&&autoData.characterUid) {
const matchingSlots=slotSummaries.filter(s=>s.data.characterUid===autoData.characterUid);
if (matchingSlots.length===0) {
issues.push({
level:"info",
text:`Nhân vật đang chơi (${autoData.playerName}) chỉ mới nằm ở Auto-Save, chưa được sao lưu vào Ô Lưu Thủ Công 1–3.`
});
} else {
for (const ms of matchingSlots) {
const autoTs=autoData.savedTimestamp||0;
const slotTs=ms.data.savedTimestamp||0;
const autoRank=(autoData.aperture&&autoData.aperture.rank)||1;
const slotRank=(ms.data.aperture&&ms.data.aperture.rank)||1;
if (autoTs>slotTs + 60000||autoRank>slotRank) {
issues.push({
level:"warning",
text:`Auto-Save của 【${autoData.playerName}】 mới hơn Ô Lưu ${ms.slot} — hãy bấm [💾 Lưu] vào Ô ${ms.slot} để đồng bộ.`
});
} else if (slotRank>autoRank||slotTs>autoTs + 60000) {
issues.push({
level:"warning",
text:`Ô Lưu ${ms.slot} có tiến trình mới hơn Auto-Save cho cùng nhân vật 【${autoData.playerName}】.`
});
}
}
}
}
const storage=this.getStorageUsageInfo();
if (storage.unavailable) {
issues.push({level:"danger",text:"Trình duyệt đang chặn localStorage — hãy dùng Xuất/Nhập file .json để lưu!"});
} else if (storage.percent>=80) {
issues.push({level:"danger",text:`Bộ nhớ trình duyệt đã dùng ${storage.percent}% (${storage.usedKB} KB) — hãy xóa bớt Ô Lưu cũ hoặc xuất file .json!`});
}
return {
consistent:issues.filter(i=>i.level==="danger"||i.level==="warning").length===0,
issues,
storage
};
}
_getDeadUidSet() {
try {
const raw=this._safeStorageGet(GRAVEYARD_KEY);
const arr=raw?JSON.parse(raw) :[];
return new Set(Array.isArray(arr)?arr :[]);
} catch (e) {
return new Set();
}
}
_markUidPermadead(uid) {
if (!uid) return;
try {
const set=this._getDeadUidSet();
set.add(uid);
this._safeStorageSet(GRAVEYARD_KEY,JSON.stringify(Array.from(set)),{silent:true});
} catch (e) {}
}
isUidPermadead(uid) {
if (!uid) return false;
return this._getDeadUidSet().has(uid);
}
_isPayloadPermadead(data) {
if (!data) return false;
if (data.isPermadead) return true;
if (data.aperture&&data.aperture.hasExploded) return true;
if (data.characterUid&&this.isUidPermadead(data.characterUid)) return true;
return false;
}
}
SaveManager._INTERNAL={SAVE_VERSION,SAVE_KEY_PREFIX,BACKUP_KEY_PREFIX,AUTO_SAVE_KEY,AUTO_SAVE_BACKUP_KEY,CRASH_RECOVERY_KEY,GRAVEYARD_KEY,MIN_SAVE_SLOTS,MAX_SAVE_SLOTS,MAX_IMPORT_FILE_BYTES,_sanitizeSaveString,_safeFiniteNumber,_isPlainObject,_computeIntegrityHash};
global.SaveManager=SaveManager;
})(window);
