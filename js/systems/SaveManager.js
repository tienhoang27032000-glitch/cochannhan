(function (global) {
"use strict";
const SaveManager=global.SaveManager;
const {SAVE_VERSION,SAVE_KEY_PREFIX,BACKUP_KEY_PREFIX,AUTO_SAVE_KEY,AUTO_SAVE_BACKUP_KEY,CRASH_RECOVERY_KEY,GRAVEYARD_KEY,MIN_SAVE_SLOTS,MAX_SAVE_SLOTS,MAX_IMPORT_FILE_BYTES,_sanitizeSaveString,_safeFiniteNumber,_isPlainObject,_computeIntegrityHash}=SaveManager._INTERNAL;
Object.assign(SaveManager.prototype,{
_buildSavePayload() {
if (!this.game.characterUid) {
this.game.characterUid=`char_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
}
const nowMs=Date.now();
const rawPayload={
gameTitle:"VAN_CO_TIEN_DO",
version:"3.1.0",
saveVersion:SAVE_VERSION,
characterUid:this.game.characterUid,
isPermadead:Boolean(this.game.isPermadead),
savedAt:new Date(nowMs).toLocaleString("vi-VN"),
savedAtIso:new Date(nowMs).toISOString(),
savedTimestamp:nowMs,
activeSaveSlotHint:this.game.activeSaveSlot||null,
playerName:_sanitizeSaveString(this.game.player.name,"Cổ Sư",32),
realmName:_sanitizeSaveString(this.game.aperture.getRealmDisplayName(),"---",80),
stageClears:this.game.stageClears,
claimedInheritances:this.game.claimedInheritances,
marketRotation:this.game.marketRotation,
aperture:this.game.aperture.toSaveData(),
player:this.game.player.toSaveData(),
map:this.game.map.toSaveData(),
guSystem:this.game.guSystem.toSaveData(),
enemies:this.game.enemies.toSaveData(),
worldProgression:this.game.questManager?this.game.questManager.toSaveData() :{},
beastArmy:this.game.beastArmy?this.game.beastArmy.toSaveData() :null,
stoneGambling:this.game.stoneGambling?this.game.stoneGambling.toSaveData() :null,
guHouse:this.game.guHouse?this.game.guHouse.toSaveData() :null,
bountySystem:this.game.bountySystem?this.game.bountySystem.toSaveData() :null,
blessedLand:this.game.blessedLand?this.game.blessedLand.toSaveData() :null,
reverseFlow:this.game.reverseFlow?this.game.reverseFlow.toSaveData() :null
};
return this._attachChecksum(rawPayload);
},
_buildAndSerializeValidatedPayload() {
const payload=this._buildSavePayload();
const check=this._validateSavePayload(payload,{verifyChecksum:true});
if (!check.valid) {
return {
ok:false,
error:`Dữ liệu trạng thái game không hợp lệ (${check.errors.join(" ")}) — đã HỦY ghi để bảo vệ bản lưu cũ!`
};
}
let serialized="";
try {
serialized=JSON.stringify(payload);
const roundTrip=JSON.parse(serialized);
if (!roundTrip||roundTrip.gameTitle!=="VAN_CO_TIEN_DO") {
throw new Error("Round-trip parse check failed");
}
} catch (err) {
return {
ok:false,
error:"Không thể tuần tự hóa dữ liệu thành JSON hợp lệ — đã HỦY ghi đè để bảo toàn bản lưu cũ!"
};
}
return {ok:true,payload,serialized};
},
_applySavePayload(rawData) {
const check=this._validateSavePayload(rawData,{verifyChecksum:false});
if (!check.valid) {
throw new Error(check.errors.join(" ")||"Cấu trúc file lưu không hợp lệ!");
}
if (check.isPermadead||this._isPayloadPermadead(rawData)) {
throw new Error("PERMADEAD");
}
const data=this._migrateSavePayload(rawData);
this.game.characterUid=data.characterUid;
this.game.isPermadead=false;
this.game.isBattlePaused=false;
this.game.stageClears=data.stageClears||{};
this.game.claimedInheritances=data.claimedInheritances||[];
this.game.marketRotation=data.marketRotation||null;
this.game.ensureMarketRotation(false);
this.game.aperture.fromSaveData(data.aperture);
this.game.player.fromSaveData(data.player);
if (data.map) this.game.map.fromSaveData(data.map);
if (data.guSystem) this.game.guSystem.fromSaveData(data.guSystem);
if (data.enemies) this.game.enemies.fromSaveData(data.enemies);
const safeRestore=(sys,payload,name)=>{
if (!sys||typeof sys.fromSaveData!=="function") return;
try {sys.fromSaveData(payload);}
catch (err) {
console.warn(`[SaveManager] Khôi phục lỗi phân hệ ${name}, tự reset an toàn:`,err);
if (typeof sys.reset==="function") sys.reset();
}
};
safeRestore(this.game.questManager,data.worldProgression||{},"questManager");
safeRestore(this.game.beastArmy,data.beastArmy||null,"beastArmy");
safeRestore(this.game.stoneGambling,data.stoneGambling||null,"stoneGambling");
safeRestore(this.game.guHouse,data.guHouse||null,"guHouse");
safeRestore(this.game.bountySystem,data.bountySystem||null,"bountySystem");
safeRestore(this.game.blessedLand,data.blessedLand||null,"blessedLand");
safeRestore(this.game.reverseFlow,data.reverseFlow||null,"reverseFlow");
this.game.player.recalculateStats();
this.game.combat.reset();
this._updateSessionMarker(true,false);
return data;
},
autoSaveNow(reason="auto") {
if (this.game.isPermadead||this.game.currentScreen==="creation"|| !this.game.aperture|| !this.game.aperture.isAwakened) {
return false;
}
const built=this._buildAndSerializeValidatedPayload();
if (!built.ok) {
console.error("Hủy Auto-Save để chống ghi đè dữ liệu lỗi:",built.error);
if (this.game.ui&&reason==="manual") {
this.game.ui.addLog(`❌ ${built.error}`,"danger");
}
return false;
}
const prevAuto=this._safeStorageGet(AUTO_SAVE_KEY);
if (prevAuto) {
const prevCheck=this._parseAndValidateRawSave(prevAuto,{verifyChecksum:true});
if (prevCheck.valid&& !prevCheck.isPermadead) {
this._safeStorageSet(AUTO_SAVE_BACKUP_KEY,prevAuto,{silent:true});
}
}
const writeRes=this._safeStorageSet(AUTO_SAVE_KEY,built.serialized,{
silent:reason!=="manual"&&reason!=="stage_clear"&&reason!=="breakthrough"
});
if (!writeRes.ok) {
if (this.game.ui&&typeof this.game.ui.updateAutoSaveIndicator==="function") {
this.game.ui.updateAutoSaveIndicator("Lỗi bộ nhớ!",true);
}
return false;
}
this._updateSessionMarker(true,false);
const now=new Date();
const hh=String(now.getHours()).padStart(2,"0");
const mm=String(now.getMinutes()).padStart(2,"0");
const ss=String(now.getSeconds()).padStart(2,"0");
this.game.lastAutoSaveLabel=`${hh}:${mm}:${ss}`;
if (this.game.ui&&typeof this.game.ui.updateAutoSaveIndicator==="function") {
this.game.ui.updateAutoSaveIndicator(this.game.lastAutoSaveLabel,false);
}
return true;
},
saveGame(slotNum=1,isAuto=false) {
if (this.game.isPermadead) {
if (!isAuto&&this.game.ui) {
this.game.ui.addLog("💀 Nhân vật đã bạo tạc chết hẳn, không thể lưu đè để hồi sinh!","danger");
}
return false;
}
const built=this._buildAndSerializeValidatedPayload();
if (!built.ok) {
if (this.game.ui) this.game.ui.addLog(`❌ Lưu thất bại: ${built.error}`,"danger");
return false;
}
const slot=Math.max(1,Math.min(MAX_SAVE_SLOTS,Number(slotNum)||1));
const slotKey=`${SAVE_KEY_PREFIX}${slot}`;
const backupKey=`${BACKUP_KEY_PREFIX}${slot}`;
const existingRaw=this._safeStorageGet(slotKey);
if (existingRaw) {
const existingCheck=this._parseAndValidateRawSave(existingRaw,{verifyChecksum:false});
if (existingCheck.valid&& !isAuto) {
const existing=existingCheck.data;
const isDifferentChar=existing.characterUid&&this.game.characterUid&&existing.characterUid!==this.game.characterUid;
const existingRank=(existing.aperture&&existing.aperture.rank)||1;
const currentRank=(this.game.aperture&&this.game.aperture.rank)||1;
const isHigherRealm=existingRank>currentRank;
if (isDifferentChar||isHigherRealm) {
const ok=confirm(
`⚠️ CẢNH BÁO GHI ĐÈ Ô LƯU ${slot}!

` +
`• Dữ liệu CŨ trong Ô ${slot}: ${existing.playerName||"Cổ Sư"} (${existing.realmName||existingRank + " Chuyển"})
` +
`• Dữ liệu MỚI sắp lưu: ${this.game.player.name} (${this.game.aperture.getRealmDisplayName()})

` +
`Bạn có CHẮC CHẮN muốn ghi đè Ô Lưu ${slot} không?
` +
`(Nếu chỉ muốn TẢI lại nhân vật cũ, hãy bấm HỦY rồi bấm nút [📂 Tải]!)`
);
if (!ok) {
if (this.game.ui) {
this.game.ui.addLog(`🛡️ Đã hủy ghi đè Ô Lưu ${slot} — dữ liệu cũ được giữ nguyên an toàn.`,"system");
}
return false;
}
}
this._safeStorageSet(backupKey,existingRaw,{silent:true});
}
}
this.game.activeSaveSlot=slot;
const finalBuilt=this._buildAndSerializeValidatedPayload();
const serializedToWrite=finalBuilt.ok?finalBuilt.serialized :built.serialized;
const writeRes=this._safeStorageSet(slotKey,serializedToWrite,{silent:false});
if (!writeRes.ok) {
if (this.game.ui) {
this.game.ui.addLog(`❌ Không thể lưu vào Ô Lưu ${slot}: ${writeRes.reason}`,"danger");
}
return false;
}
this._safeStorageSet(AUTO_SAVE_KEY,serializedToWrite,{silent:true});
this._updateSessionMarker(true,false);
const now=new Date();
this.game.lastAutoSaveLabel=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
if (this.game.ui&&typeof this.game.ui.updateAutoSaveIndicator==="function") {
this.game.ui.updateAutoSaveIndicator(this.game.lastAutoSaveLabel,false);
}
if (!isAuto&&this.game.ui) {
this.game.ui.addLog(`💾 Đã lưu 【${this.game.player.name} — ${this.game.aperture.getRealmDisplayName()}】 vào Ô Lưu ${slot} thành công (Save v${SAVE_VERSION})!`,"system");
}
return true;
},
restoreSlotBackup(slotNum=1) {
const slot=Math.max(1,Math.min(MAX_SAVE_SLOTS,Number(slotNum)||1));
const slotKey=`${SAVE_KEY_PREFIX}${slot}`;
const backupKey=`${BACKUP_KEY_PREFIX}${slot}`;
const backupRaw=this._safeStorageGet(backupKey);
if (!backupRaw) {
if (this.game.ui) this.game.ui.addLog(`Ô Lưu ${slot} chưa có bản dự phòng trước đó.`,"warning");
return false;
}
const check=this._parseAndValidateRawSave(backupRaw,{verifyChecksum:false});
if (!check.valid) {
if (this.game.ui) this.game.ui.addLog(`❌ Bản dự phòng của Ô Lưu ${slot} bị lỗi cấu trúc (${check.error}), không thể khôi phục!`,"danger");
return false;
}
const parsed=check.data;
const ok=confirm(
`↩️ Khôi phục lại dữ liệu trước khi ghi đè của Ô Lưu ${slot}?

` +
`Bản dự phòng: ${parsed.playerName||"Cổ Sư"} (${parsed.realmName||"---"}) — Lưu lúc: ${parsed.savedAt||"---"}`
);
if (!ok) return false;
const currentRaw=this._safeStorageGet(slotKey);
const writeRes=this._safeStorageSet(slotKey,backupRaw,{silent:false});
if (!writeRes.ok) return false;
if (currentRaw&&this._parseAndValidateRawSave(currentRaw,{verifyChecksum:false}).valid) {
this._safeStorageSet(backupKey,currentRaw,{silent:true});
} else {
this._safeStorageRemove(backupKey);
}
if (this.game.ui) {
this.game.ui.addLog(`↩️ Đã khôi phục bản dự phòng cho Ô Lưu ${slot}: 【${parsed.playerName} — ${parsed.realmName}】! Hãy bấm [📂 Tải] để vào chơi.`,"loot");
this.game.ui.renderSettingsTab();
}
return true;
},
hasSlotBackup(slotNum=1) {
const raw=this._safeStorageGet(`${BACKUP_KEY_PREFIX}${slotNum}`);
if (!raw) return null;
const check=this._parseAndValidateRawSave(raw,{verifyChecksum:false});
if (!check.valid) return null;
const d=check.data;
return `${d.playerName||"Cổ Sư"} (${d.realmName||"---"})`;
},
loadGame(slotNum=1) {
const slot=Math.max(1,Math.min(MAX_SAVE_SLOTS,Number(slotNum)||1));
const readRes=this._readSaveWithBackupFallback(
`${SAVE_KEY_PREFIX}${slot}`,
`${BACKUP_KEY_PREFIX}${slot}`,
`Ô Lưu ${slot}`
);
if (!readRes.ok) {
if (this.game.ui) {
this.game.ui.addLog(`❌ ${readRes.error}`,readRes.empty?"warning" :"danger");
}
return false;
}
if (readRes.isPermadead) {
alert("💀 Không Khiếu của Cổ Sư trong ô lưu này đã BẠO TẠC VĨNH VIỄN do áp lực Thập Tuyệt Thể! Không thể tải lại file lưu đã chết hẳn.");
return false;
}
const data=readRes.data;
if (
this.game.currentScreen!=="creation"&&
this.game.characterUid&&
data.characterUid&&
data.characterUid!==this.game.characterUid
) {
const ok=confirm(
`📂 Tải Ô Lưu ${slot}: 【${data.playerName||"Cổ Sư"} — ${data.realmName||"---"}】?

` +
`Nhân vật hiện tại (${this.game.player.name}) sẽ được chuyển ra sau (nếu muốn giữ lâu dài hãy lưu nhân vật hiện tại vào một ô trống trước).`
);
if (!ok) return false;
}
try {
this.game.activeSaveSlot=slot;
this._applySavePayload(data);
const normalizedBuilt=this._buildAndSerializeValidatedPayload();
if (normalizedBuilt.ok) {
this._safeStorageSet(AUTO_SAVE_KEY,normalizedBuilt.serialized,{silent:true});
if (readRes.wasMigrated||readRes.usedBackup) {
this._safeStorageSet(`${SAVE_KEY_PREFIX}${slot}`,normalizedBuilt.serialized,{silent:true});
}
}
this.game.currentScreen="hub";
this.game.ui.showScreen("hub");
if (readRes.usedBackup) {
this.game.ui.addLog(`🛡️ Phát hiện Ô Lưu ${slot} bị hỏng — đã TỰ ĐỘNG KHÔI PHỤC an toàn từ bản dự phòng!`,"warning");
}
if (readRes.wasMigrated) {
this.game.ui.addLog(`🔄 Đã tự động chuyển đổi dữ liệu lưu cũ (v${readRes.migratedFrom}) lên chuẩn Save v${SAVE_VERSION}!`,"system");
}
this.game.ui.addLog(
`📂 Đã tải tiến trình từ Ô Lưu ${slot}: ${this.game.player.name} (${this.game.aperture.getRealmDisplayName()}).`,
"cultivation"
);
return true;
} catch (err) {
if (err&&err.message==="PERMADEAD") {
alert("💀 Nhân vật trong file lưu này đã bạo tạc Không Khiếu chết hẳn, không thể hồi sinh!");
} else {
console.error("Lỗi khi tải game:",err);
if (this.game.ui) this.game.ui.addLog(`❌ Tải Ô Lưu ${slot} thất bại: ${err&&err.message?err.message :"Lỗi không xác định"}`,"danger");
}
return false;
}
},
loadAutoSave() {
const readRes=this._readSaveWithBackupFallback(
AUTO_SAVE_KEY,
AUTO_SAVE_BACKUP_KEY,
"Auto-Save"
);
if (!readRes.ok) {
if (readRes.corrupted&&this.game.ui) {
this.game.ui.addLog(`❌ ${readRes.error}`,"danger");
}
return this.loadAnyExistingSave(true);
}
if (readRes.isPermadead) {
alert("💀 Bản lưu tự động này thuộc về Cổ Sư Thập Tuyệt Thể đã bạo tạc chết hẳn! Hãy tải từ Ô Lưu 1–3 hoặc tạo nhân vật mới.");
return false;
}
try {
this.game.activeSaveSlot=readRes.data.activeSaveSlotHint||null;
this._applySavePayload(readRes.data);
const normalizedBuilt=this._buildAndSerializeValidatedPayload();
if (normalizedBuilt.ok&&(readRes.wasMigrated||readRes.usedBackup)) {
this._safeStorageSet(AUTO_SAVE_KEY,normalizedBuilt.serialized,{silent:true});
}
this.game.currentScreen="hub";
this.game.ui.showScreen("hub");
if (this.game.crashRecoveryNotice) {
this.game.ui.addLog(this.game.crashRecoveryNotice,"warning");
this.game.crashRecoveryNotice=null;
}
if (readRes.usedBackup) {
this.game.ui.addLog("🛡️ Phát hiện Auto-Save bị hỏng — đã TỰ ĐỘNG KHÔI PHỤC an toàn từ bản dự phòng Auto-Save!","warning");
}
if (readRes.wasMigrated) {
this.game.ui.addLog(`🔄 Đã chuyển đổi Auto-Save cũ (v${readRes.migratedFrom}) lên chuẩn Save v${SAVE_VERSION}!`,"system");
}
this.game.ui.addLog(
`📂 Đã tiếp tục hành trình từ Ô Tự Động Lưu: ${this.game.player.name} (${this.game.aperture.getRealmDisplayName()}).`,
"cultivation"
);
return true;
} catch (err) {
console.error("Lỗi khi đọc bản tự động lưu:",err);
if (this.game.ui) this.game.ui.addLog("❌ Không thể nạp Auto-Save do lỗi dữ liệu.","danger");
return false;
}
},
getAutoSaveSummary() {
const readRes=this._readSaveWithBackupFallback(AUTO_SAVE_KEY,AUTO_SAVE_BACKUP_KEY,"Auto-Save");
if (readRes.ok) {
if (readRes.isPermadead) {
return {isPermadead:true,label:`💀 ${readRes.data.playerName||"Cổ Sư"} (Đã Bạo Tạc Chết Hẳn)`};
}
return {
isPermadead:false,
usedBackup:readRes.usedBackup,
recoveredCrash:Boolean(this.game.crashRecoveryNotice),
playerName:readRes.data.playerName,
realmName:readRes.data.realmName,
savedAt:readRes.data.savedAt,
saveVersion:readRes.data.saveVersion||SAVE_VERSION,
label:`${readRes.data.playerName} — ${readRes.data.realmName}${readRes.usedBackup?" [Đã phục hồi backup]" :""}`
};
}
for (let slot=1;slot<=MAX_SAVE_SLOTS;slot++) {
const sRes=this._readSaveWithBackupFallback(`${SAVE_KEY_PREFIX}${slot}`,`${BACKUP_KEY_PREFIX}${slot}`,`Ô Lưu ${slot}`);
if (sRes.ok&& !sRes.isPermadead) {
return {
isPermadead:false,
playerName:sRes.data.playerName,
realmName:sRes.data.realmName,
savedAt:sRes.data.savedAt,
saveVersion:sRes.data.saveVersion||SAVE_VERSION,
label:`${sRes.data.playerName} — ${sRes.data.realmName} (Ô ${slot})`
};
}
}
return null;
},
exportSaveToFile() {
if (this.game.isPermadead) {
alert("💀 Nhân vật đã bạo tạc Không Khiếu chết hẳn, không thể xuất file lưu!");
return false;
}
try {
const built=this._buildAndSerializeValidatedPayload();
if (!built.ok) {
if (this.game.ui) this.game.ui.addLog(`❌ Xuất file thất bại: ${built.error}`,"danger");
return false;
}
const jsonString=JSON.stringify(built.payload,null,2);
const blob=new Blob([jsonString],{type:"application/json;charset=utf-8"});
const url=URL.createObjectURL(blob);
const safeName=(this.game.player.name||"CoSu")
.normalize("NFD")
.replace(/[\u0300-\u036f]/g,"")
.replace(/[^a-zA-Z0-9_-]/g,"_");
const fileName=`VanCoTienDo_${safeName}_Rank${this.game.aperture.rank}.json`;
const a=document.createElement("a");
a.href=url;
a.download=fileName;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
if (this.game.ui) {
this.game.ui.addLog(`⬇️ Đã xuất file lưu trữ [${fileName}] (Save v${SAVE_VERSION}) về máy thành công!`,"loot");
}
return true;
} catch (err) {
console.error("Lỗi khi xuất file lưu:",err);
if (this.game.ui) {
this.game.ui.addLog("❌ Không thể xuất file lưu trữ!","danger");
}
return false;
}
},
getSaveSlotCount() {
let highest=MIN_SAVE_SLOTS;
for (let slot=MIN_SAVE_SLOTS + 1;slot<=MAX_SAVE_SLOTS;slot++) {
if (this._safeStorageGet(`${SAVE_KEY_PREFIX}${slot}`)||this._safeStorageGet(`${BACKUP_KEY_PREFIX}${slot}`)) {
highest=slot;
}
}
return highest;
},
hasSlotData(slotNum=1) {
return Boolean(this._safeStorageGet(`${SAVE_KEY_PREFIX}${slotNum}`));
},
deleteSaveSlot(slotNum=1) {
const slot=Math.max(1,Math.min(MAX_SAVE_SLOTS,Number(slotNum)||1));
const slotKey=`${SAVE_KEY_PREFIX}${slot}`;
const raw=this._safeStorageGet(slotKey);
if (!raw) return false;
let label=`Ô Lưu ${slot}`;
const check=this._parseAndValidateRawSave(raw,{verifyChecksum:false});
if (check.valid&&check.data) {
label=`${check.data.playerName||"Cổ Sư"} (${check.data.realmName||"---"})`;
}
if (!confirm(`🗑️ Xóa dữ liệu trong Ô Lưu ${slot}: 【${label}】?
(Bản cũ vẫn được giữ trong nút ↩️ Hoàn Tác cho đến lần ghi tiếp theo.)`)) {
return false;
}
if (check.valid) {
this._safeStorageSet(`${BACKUP_KEY_PREFIX}${slot}`,raw,{silent:true});
}
this._safeStorageRemove(slotKey);
if (this.game.activeSaveSlot===slot) this.game.activeSaveSlot=null;
if (this.game.ui) {
this.game.ui.addLog(`🗑️ Đã xóa dữ liệu tại Ô Lưu ${slot} (có thể bấm ↩️ Hoàn Tác nếu đổi ý).`,"warning");
this.game.ui.renderSettingsTab();
}
return true;
},
_pushSaveDownToSlots(previousRaw,importedUid=null) {
if (!previousRaw) return {pushed:false};
const prevCheck=this._parseAndValidateRawSave(previousRaw,{verifyChecksum:false});
if (!prevCheck.valid||prevCheck.isPermadead) {
return {pushed:false};
}
const prevObj=prevCheck.data;
const prevUid=prevObj.characterUid||null;
const isDifferentFromImported= !prevUid|| !importedUid||prevUid!==importedUid;
let existingDupSlot=null;
if (isDifferentFromImported&&prevUid) {
for (let s=1;s<=MAX_SAVE_SLOTS;s++) {
const sRaw=this._safeStorageGet(`${SAVE_KEY_PREFIX}${s}`);
if (!sRaw) continue;
try {
const sObj=JSON.parse(sRaw);
if (sObj&&sObj.characterUid===prevUid) {
existingDupSlot=s;
break;
}
} catch (e) {}
}
}
if (existingDupSlot!==null) {
const oldDupRaw=this._safeStorageGet(`${SAVE_KEY_PREFIX}${existingDupSlot}`);
if (oldDupRaw) {
this._safeStorageSet(`${BACKUP_KEY_PREFIX}${existingDupSlot}`,oldDupRaw,{silent:true});
}
this._safeStorageRemove(`${SAVE_KEY_PREFIX}${existingDupSlot}`);
}
let carryRaw=previousRaw;
let carryBackup=null;
let shiftedCount=0;
for (let slot=1;slot<=MAX_SAVE_SLOTS;slot++) {
const slotKey=`${SAVE_KEY_PREFIX}${slot}`;
const backupKey=`${BACKUP_KEY_PREFIX}${slot}`;
const displacedRaw=this._safeStorageGet(slotKey);
const displacedBackup=this._safeStorageGet(backupKey);
const writeRes=this._safeStorageSet(slotKey,carryRaw,{silent:false});
if (!writeRes.ok) {
break;
}
if (slot>1) {
if (carryBackup) this._safeStorageSet(backupKey,carryBackup,{silent:true});
else this._safeStorageRemove(backupKey);
}
if (!displacedRaw) {
break;
}
if (slot===MAX_SAVE_SLOTS) {
this._safeStorageSet(backupKey,displacedRaw,{silent:true});
break;
}
carryRaw=displacedRaw;
carryBackup=displacedBackup;
shiftedCount +=1;
}
return {
pushed:true,
targetSlot:1,
shiftedCount:shiftedCount,
prevName:prevObj.playerName||(prevObj.player&&prevObj.player.name)||"Cổ Sư",
prevRealm:prevObj.realmName||""
};
},
importSaveFromFile(file) {
if (!file) return;
if (typeof file.size==="number"&&file.size>MAX_IMPORT_FILE_BYTES) {
alert("❌ File quá lớn (vượt quá 5 MB)! Vui lòng chọn đúng file lưu .json của Vạn Cổ Tiên Đồ.");
return;
}
const reader=new FileReader();
reader.onerror=()=>{
alert("❌ Không thể đọc file từ thiết bị. Vui lòng thử lại!");
};
reader.onload=(e)=>{
try {
const text=e.target&&typeof e.target.result==="string"?e.target.result :"";
const check=this._parseAndValidateRawSave(text,{verifyChecksum:false});
if (!check.valid) {
alert(`❌ File .json không hợp lệ!
Chi tiết: ${check.error}`);
return;
}
if (check.isPermadead) {
alert("💀 File lưu này thuộc về Cổ Sư Thập Tuyệt Thể đã BẠO TẠC KHÔNG KHIẾU CHẾT HẲN! Vĩnh viễn không thể sử dụng lại file lưu này.");
return;
}
const data=check.data;
let previousRaw=null;
if (
this.game.currentScreen!=="creation"&&
!this.game.isPermadead&&
this.game.aperture&&
this.game.aperture.isAwakened
) {
const prevBuilt=this._buildAndSerializeValidatedPayload();
if (prevBuilt.ok) previousRaw=prevBuilt.serialized;
} else {
previousRaw=this._safeStorageGet(AUTO_SAVE_KEY);
}
const pushInfo=this._pushSaveDownToSlots(previousRaw,data.characterUid||null);
this.game.activeSaveSlot=null;
this._applySavePayload(data);
const newBuilt=this._buildAndSerializeValidatedPayload();
if (newBuilt.ok) {
this._safeStorageSet(AUTO_SAVE_KEY,newBuilt.serialized,{silent:false});
}
this.game.currentScreen="hub";
this.game.ui.showScreen("hub");
if (this.game.ui&&typeof this.game.ui.renderSettingsTab==="function") {
this.game.ui.renderSettingsTab();
}
const safeFileName=_sanitizeSaveString(file.name,"save.json",64);
const migrateNote=check.wasMigrated
?` (Đã tự chuyển đổi từ Save v${check.migratedFrom} → v${SAVE_VERSION})`
:"";
const pushNote=pushInfo.pushed
?` Bản cũ 【${pushInfo.prevName}${pushInfo.prevRealm?" — " + pushInfo.prevRealm :""}】 đã được tự động đẩy xuống Ô Lưu 1${pushInfo.shiftedCount>0?` (và dời ${pushInfo.shiftedCount} bản cũ hơn xuống các ô kế tiếp)` :""}!`
:"";
this.game.ui.addLog(
`⬆️ Đã nhập file lưu [${safeFileName}]${migrateNote} thành công! Chào mừng trở lại: ${this.game.player.name} (${this.game.aperture.getRealmDisplayName()}).${pushNote}`,
"cultivation"
);
} catch (err) {
if (err&&err.message==="PERMADEAD") {
alert("💀 File lưu này thuộc về nhân vật đã bạo tạc chết hẳn, không thể sử dụng nữa!");
} else {
console.error("Lỗi đọc file lưu .json:",err);
alert(`❌ File .json không hợp lệ hoặc bị hỏng!
(${err&&err.message?err.message :"Sai định dạng Vạn Cổ Tiên Đồ"})`);
}
}
};
reader.readAsText(file,"utf-8");
},
loadAnyExistingSave(skipAutoSave=false) {
if (!skipAutoSave) {
const autoRes=this._readSaveWithBackupFallback(AUTO_SAVE_KEY,AUTO_SAVE_BACKUP_KEY,"Auto-Save");
if (autoRes.ok&& !autoRes.isPermadead) {
return this.loadAutoSave();
}
}
for (let slot=1;slot<=MAX_SAVE_SLOTS;slot++) {
const sRes=this._readSaveWithBackupFallback(`${SAVE_KEY_PREFIX}${slot}`,`${BACKUP_KEY_PREFIX}${slot}`,`Ô Lưu ${slot}`);
if (sRes.ok&& !sRes.isPermadead) {
return this.loadGame(slot);
}
}
return false;
},
getSaveSlotSummary(slotNum=1) {
const raw=this._safeStorageGet(`${SAVE_KEY_PREFIX}${slotNum}`);
if (!raw) return "Trống — Chưa có dữ liệu lưu trữ";
const check=this._parseAndValidateRawSave(raw,{verifyChecksum:true});
if (!check.valid) {
const hasBak=Boolean(this._safeStorageGet(`${BACKUP_KEY_PREFIX}${slotNum}`));
return hasBak
?"⚠️ Dữ liệu chính bị hỏng — Có bản Backup an toàn (Bấm 📂 Tải để tự khôi phục)"
:"❌ Dữ liệu bị hỏng (Không thể đọc)";
}
if (check.isPermadead) {
return `💀 ${check.data.playerName||"Cổ Sư"} | ĐÃ BẠO TẠC CHẾT HẲN (Không thể tải lại)`;
}
const verTag=check.wasMigrated?` [Save cũ v${check.migratedFrom}]` :` [v${check.data.saveVersion||SAVE_VERSION}]`;
return `${check.data.playerName} | ${check.data.realmName} | Lúc: ${check.data.savedAt}${verTag}`;
},
clearAllSaves() {
this._safeStorageRemove(AUTO_SAVE_KEY);
this._safeStorageRemove(AUTO_SAVE_BACKUP_KEY);
this._safeStorageRemove(CRASH_RECOVERY_KEY);
for (let slot=1;slot<=MAX_SAVE_SLOTS;slot++) {
this._safeStorageRemove(`${SAVE_KEY_PREFIX}${slot}`);
this._safeStorageRemove(`${BACKUP_KEY_PREFIX}${slot}`);
}
}
});
const DELEGATED_METHODS=[
"_safeStorageGet","_safeStorageRemove","_safeStorageSet",
"_updateSessionMarker","_checkCrashRecoveryOnBoot","_markUidPermadead",
"isUidPermadead","getStorageUsageInfo","checkSaveConsistency",
"autoSaveNow","saveGame","restoreSlotBackup","hasSlotBackup",
"loadGame","loadAutoSave","getAutoSaveSummary","exportSaveToFile",
"getSaveSlotCount","hasSlotData","deleteSaveSlot","importSaveFromFile",
"loadAnyExistingSave","getSaveSlotSummary","clearAllSaves"
];
SaveManager.attachDelegates=function (targetProto) {
for (const methodName of DELEGATED_METHODS) {
targetProto[methodName]=function (...args) {
return this.saveManager?this.saveManager[methodName](...args) :false;
};
}
};
SaveManager.SAVE_VERSION=SAVE_VERSION;
SaveManager.sanitizeString=_sanitizeSaveString;
SaveManager.KEYS={
SAVE_KEY_PREFIX,BACKUP_KEY_PREFIX,AUTO_SAVE_KEY,AUTO_SAVE_BACKUP_KEY,
CRASH_RECOVERY_KEY,GRAVEYARD_KEY,MIN_SAVE_SLOTS,MAX_SAVE_SLOTS,MAX_IMPORT_FILE_BYTES
};
global.SaveManager=SaveManager;
})(window);
