(function (global) {
"use strict";
const {CHARACTER_SKINS,FIVE_REGIONS,FACTION_ORIGINS,DAO_PATHS,DAO_PATH_PASSIVES,ITEM_DATABASE,DREAM_REALMS}=global.VanCoPlayerData;
class PlayerManager {
constructor(apertureSystem) {
this.aperture=apertureSystem||null;
this.reset();
}
reset() {
this.name="Cổ Nguyệt Phương Nguyên";
this.skinId="phuong_nguyen";
this.region="nam_cuong";
this.origin="righteous_clan";
this.alignment=20;
this.fame=0;
this.kills=0;
this.x=600;
this.y=600;
this.vx=0;
this.vy=0;
this.z=0;
this.vz=0;
this.isJumping=false;
this.jumpCount=0;
this.maxJumps=2;
this.jumpSquash=0;
this.isInWater=false;
this._waterRippleTimer=0;
this._jumpRings=[];
this.radius=14;
this.facing="down";
this.aimAngle=0;
this.isMoving=false;
this.isSprinting=false;
this.animState="idle";
this.animTimer=0;
this.animFrame=0;
this.attackAnimCooldown=0;
this.baseMaxHp=110;
this.hp=110;
this.maxHp=110;
this.baseAtk=14;
this.atk=14;
this.baseDef=6;
this.def=6;
this.baseSpd=140;
this.spd=140;
this.baseVision=260;
this.vision=260;
this.baseMaxMental=100;
this.mental=100;
this.maxMental=100;
this.stamina=100;
this.maxStamina=100;
this.primevalStones=60;
this.meritPoints=100;
this.immortalStones=0;
this.refinementBonus=0;
this.tradeDiscount=0;
this.activeBuffs=[];
this.mainPath="Quang Đạo";
this.daoMarks={};
this.pathAttainment={};
this.pathAttainmentExp={};
for (const pathName of Object.keys(DAO_PATHS)) {
this.daoMarks[pathName]=0;
this.pathAttainment[pathName]="Phàm Cấp";
this.pathAttainmentExp[pathName]=0;
}
this.dreamClears={};
this.inventory=[];
}
initializeNewCharacter(name,originKey="righteous_clan",regionKey="nam_cuong",skinKey="phuong_nguyen") {
this.reset();
this.name=(name&&name.trim())?name.trim() :"Cổ Nguyệt Phương Nguyên";
this.skinId=CHARACTER_SKINS[skinKey]?skinKey :"phuong_nguyen";
this.region=FIVE_REGIONS[regionKey]?regionKey :"nam_cuong";
this.origin=FACTION_ORIGINS[originKey]?originKey :"righteous_clan";
const regCfg=FIVE_REGIONS[this.region];
const oriCfg=FACTION_ORIGINS[this.origin];
this.primevalStones=oriCfg.primevalStones;
this.meritPoints=oriCfg.meritPoints||0;
this.alignment=oriCfg.alignment;
this.refinementBonus=oriCfg.refinementBonus||0;
this.tradeDiscount=oriCfg.tradeDiscount||0;
this.baseMaxHp +=(oriCfg.bonusStats.hp||0) + (regCfg.bonusStats.hp||0);
this.baseAtk +=(oriCfg.bonusStats.atk||0) + (regCfg.bonusStats.atk||0);
this.baseDef +=(oriCfg.bonusStats.def||0) + (regCfg.bonusStats.def||0);
this.baseMaxMental +=(oriCfg.bonusStats.mental||0) + (regCfg.bonusStats.mental||0);
for (const item of oriCfg.initialItems) {
this.addItem(item.id,item.count);
}
if (regCfg.initialDaoMarks) {
for (const [p,val] of Object.entries(regCfg.initialDaoMarks)) {
this.addPathAttainmentExp(p,val);
}
}
if (oriCfg.extraDaoMarks) {
for (const [p,val] of Object.entries(oriCfg.extraDaoMarks)) {
this.addPathAttainmentExp(p,val);
}
}
if (this.aperture&&this.aperture.aptitude&&this.aperture.aptitude.physique) {
const phy=this.aperture.aptitude.physique;
this.mainPath=phy.favoredPaths[0];
for (const p of phy.favoredPaths) {
this.addPathAttainmentExp(p,25);
}
this.addItem("thach_khieu_gu",1);
}
this.addItem("no_le_gu_r1",2);
this.recalculateStats();
this.hp=this.maxHp;
this.mental=this.maxMental;
}
setSkin(skinKey) {
if (!CHARACTER_SKINS[skinKey]) return false;
this.skinId=skinKey;
return CHARACTER_SKINS[skinKey];
}
getSkinConfig() {
return CHARACTER_SKINS[this.skinId]||CHARACTER_SKINS.phuong_nguyen;
}
static getSkinInfo(skinKey) {
return CHARACTER_SKINS[skinKey]||CHARACTER_SKINS.phuong_nguyen;
}
static getOriginDescription(originKey,regionKey="nam_cuong") {
const ori=FACTION_ORIGINS[originKey]||FACTION_ORIGINS.righteous_clan;
const reg=FIVE_REGIONS[regionKey]||FIVE_REGIONS.nam_cuong;
return `[${reg.name} — ${ori.name}] ${ori.desc} (${reg.desc})`;
}
getRegionName() {
return (FIVE_REGIONS[this.region]&&FIVE_REGIONS[this.region].name)||"Nam Cương";
}
getFactionOriginName() {
return (FACTION_ORIGINS[this.origin]&&FACTION_ORIGINS[this.origin].name)||"Chính Đạo Gia Tộc";
}
useRelicGu(aperture) {
const ap=aperture||this.aperture;
if (!ap|| !ap.isAwakened) {
return {success:false,message:"Ngươi chưa Khai Khiếu, không thể sử dụng Xá Lợi Cổ!"};
}
if (ap.isImmortal) {
return {success:false,message:"Xá Lợi Cổ chỉ có tác dụng với Phàm Khiếu từ Nhất Chuyển đến Ngũ Chuyển!"};
}
const relicMap={
1:"bronze_relic_gu",
2:"red_iron_relic_gu",
3:"white_silver_relic_gu",
4:"yellow_gold_relic_gu",
5:"purple_crystal_relic_gu"
};
const requiredRelicId=relicMap[ap.rank];
const relicMeta=ITEM_DATABASE[requiredRelicId];
if (this.getItemCount(requiredRelicId)<=0) {
return {
success:false,
message:`Không có [${relicMeta.name}] trong hành trang! Hãy mua tại Thương Hội/Đấu Giá hoặc đổi trong Gia Tộc Khố Phòng.`
};
}
if (ap.subStage===3&&ap.wallProgress>=ap.maxWallProgress) {
return {
success:false,
message:`Ngươi đã đạt ${ap.getRealmDisplayName()} viên mãn! Hãy bấm nút 'Xung Kích Đột Phá' hoặc 'Phá Khiếu Thăng Tiên'.`
};
}
this.removeItem(requiredRelicId,1);
if (ap.subStage<3) {
ap.subStage +=1;
ap.wallProgress=0;
const rankCfg=global.ApertureSystem.MORTAL_RANKS[ap.rank];
const subCfg=global.ApertureSystem.MORTAL_SUBSTAGES[ap.subStage];
ap.maxWallProgress=Math.round(rankCfg.baseWallReq*subCfg.statMult);
if (!ap.aptitude|| !ap.aptitude.physique) {
ap.wallPressure=Math.max(8,(ap.wallPressure||0) - 55);
if (ap.wallPressure<70) ap._pressureWarned=false;
}
ap.humanQi +=8*ap.rank;
this.recalculateStats();
this.hp=this.maxHp;
return {
success:true,
message:`✨ Đã dung hợp [${relicMeta.name}]! Quang mang rực rỡ, Không Khiếu lập tức đột phá lên 【${ap.getRealmDisplayName()}】 (${ap.getApertureWallName()})!`
};
} else {
ap.wallProgress=ap.maxWallProgress;
if (!ap.aptitude|| !ap.aptitude.physique) {
ap.wallPressure=Math.max(8,(ap.wallPressure||0) - 45);
if (ap.wallPressure<70) ap._pressureWarned=false;
}
return {
success:true,
message:`✨ Đã dung hợp [${relicMeta.name}]! Khiếu Bích Tinh Mạc đạt trạng thái viên mãn 100%, sẵn sàng xung kích Đại Cảnh Giới!`
};
}
}
exploreDreamRealm(dreamId) {
const dream=DREAM_REALMS.find(d=>d.id===dreamId);
if (!dream) return {success:false,message:"Không tìm thấy Mộng Cảnh này."};
const rank=this.aperture?this.aperture.rank :1;
if (rank<dream.reqRank) {
return {
success:false,
message:`Tu vi chưa đủ! Cần đạt tối thiểu ${dream.reqRank} Chuyển để chịu đựng uy áp của [${dream.name}].`
};
}
if (this.mental<dream.mentalCost) {
return {
success:false,
message:`Tinh Thần Lực không đủ (${Math.floor(this.mental)}/${dream.mentalCost})! Hãy dùng Thanh Linh Thảo hoặc Đãng Hồn Thạch Đan để hồi phục.`
};
}
this.mental=Math.max(0,this.mental - dream.mentalCost);
const isImmortal=this.isImmortalCultivator();
const triScore=isImmortal?(this.daoMarks["Trí Đạo"]||0) :(this.pathAttainmentExp["Trí Đạo"]||0);
const honScore=isImmortal?(this.daoMarks["Hồn Đạo"]||0) :(this.pathAttainmentExp["Hồn Đạo"]||0);
const chance=Math.min(0.95,0.72 + (triScore + honScore)*0.0015);
if (Math.random()<=chance) {
this.dreamClears[dream.id]=(this.dreamClears[dream.id]||0) + 1;
const targetPaths=dream.useMainPath?[this.mainPath] :dream.paths.filter(p=>DAO_PATHS[p]);
for (const p of targetPaths) {
this.addPathAttainmentExp(p,dream.daoMarksReward);
if (isImmortal) {
this.addDaoMarks(p,dream.daoMarksReward);
}
}
if (this.aperture) {
this.aperture.humanQi +=dream.humanQiReward;
}
return {
success:true,
message:isImmortal
?`🌙 Thăm dò [${dream.name}] thành công! Hấp thu chân ý nhận +${dream.daoMarksReward.toLocaleString("vi-VN")} Đạo Ngân & Lĩnh Ngộ (${targetPaths.join(", ")}) và +${dream.humanQiReward} Nhân Khí!`
:`🌙 Thăm dò [${dream.name}] thành công! Nâng cao +${dream.daoMarksReward} Lĩnh Ngộ Lưu Phái (${targetPaths.join(", ")}) và +${dream.humanQiReward} Nhân Khí! (Phàm nhân chưa có Đạo Ngân)`
};
} else {
const minGain=Math.max(4,Math.floor(dream.daoMarksReward*0.3));
const firstPath=dream.useMainPath?this.mainPath :dream.paths[0];
this.addPathAttainmentExp(firstPath,minGain);
if (isImmortal) {
this.addDaoMarks(firstPath,minGain);
}
return {
success:false,
message:isImmortal
?`Mộng cảnh mê hoặc tâm thần khiến ngươi phải rút lui sớm, nhưng vẫn kịp lĩnh ngộ +${minGain} Đạo Ngân ${firstPath}.`
:`Mộng cảnh mê hoặc tâm thần khiến ngươi phải rút lui sớm, nhưng vẫn kịp tăng +${minGain} Lĩnh Ngộ ${firstPath}.`
};
}
}
recalculateStats() {
let rank=1;
let subStage=0;
let isImmortal=false;
let isPseudo=false;
let isDaoLord=false;
if (this.aperture&&this.aperture.isAwakened) {
rank=this.aperture.rank;
subStage=this.aperture.subStage;
isImmortal=this.aperture.isImmortal;
isPseudo=typeof this.aperture.isPseudoVenerable==="function"&&this.aperture.isPseudoVenerable();
isDaoLord=Boolean(isImmortal&&rank>=9&&this.aperture.daoLordPath);
}
const playerRankTable={
1:1.0,
2:1.85,
3:3.4,
4:6.2,
5:11.2,
6:48.0,
7:120.0,
8:295.0,
9:1450.0
};
const rankMult=playerRankTable[rank]||(isImmortal?48.0 :1.0);
let subMult=1 + subStage*0.16;
if (isImmortal) {
if (isPseudo) subMult=1.56;
else if (rank>=9) subMult=1.28 + subStage*0.18 + (isDaoLord?0.18 :0);
else subMult=1.0 + subStage*0.12;
}
const totalRealmMult=rankMult*subMult;
const curveMarks=(m)=>{
const v=Math.max(0,m||0);
if (v<=2000) return v;
return 2000 + Math.sqrt(v - 2000)*18;
};
const mainMarks=isImmortal?curveMarks(this.daoMarks[this.mainPath]||0) :curveMarks((this.pathAttainmentExp[this.mainPath]||0)*0.35);
let bonusHp=mainMarks*1.1;
let bonusAtk=mainMarks*0.24;
let bonusDef=mainMarks*0.18;
let bonusSpd=0;
let bonusMental=mainMarks*0.08;
let bonusCrit=0;
let bonusLifesteal=0;
let bonusCdRed=0;
const passivesMap=DAO_PATH_PASSIVES||{};
for (const pName of Object.keys(DAO_PATHS)) {
const rawScore=isImmortal?(this.daoMarks[pName]||0) :((this.pathAttainmentExp[pName]||0)*0.45);
if (rawScore<=0) continue;
const cm=curveMarks(rawScore);
const pf=passivesMap[pName];
if (!pf) continue;
if (pf.hp) bonusHp +=cm*pf.hp;
if (pf.atk) bonusAtk +=cm*pf.atk;
if (pf.def) bonusDef +=cm*pf.def;
if (pf.spd) bonusSpd +=cm*pf.spd;
if (pf.mental) bonusMental +=cm*pf.mental;
if (pf.crit) bonusCrit +=Math.min(0.18,cm*pf.crit*0.18);
if (pf.lifesteal) bonusLifesteal +=Math.min(0.12,cm*pf.lifesteal*0.15);
if (pf.cdRed) bonusCdRed +=Math.min(0.25,cm*pf.cdRed*0.15);
}
this.daoPassiveCrit=Math.min(0.30,bonusCrit);
this.daoPassiveLifesteal=Math.min(0.18,bonusLifesteal);
this.daoPassiveCdRed=Math.min(0.32,bonusCdRed);
let calcMaxHp=Math.round(this.baseMaxHp*totalRealmMult + bonusHp);
let calcAtk=Math.round(this.baseAtk*totalRealmMult + bonusAtk);
let calcDef=Math.round(this.baseDef*totalRealmMult + bonusDef);
let calcSpd=Math.round(this.baseSpd + (rank - 1)*8 + (isPseudo?16 :0) + Math.min(105,bonusSpd));
let calcVision=Math.round(this.baseVision + (rank - 1)*20 + Math.min(120,isImmortal?curveMarks(this.daoMarks["Không Gian Đạo"]||0)*0.08 :0));
let calcMaxMental=Math.round(this.baseMaxMental*(1 + (rank - 1)*0.38) + bonusMental);
for (const buff of this.activeBuffs) {
if (!buff.statMods) continue;
if (buff.statMods.atk) calcAtk +=buff.statMods.atk;
if (buff.statMods.def) calcDef +=buff.statMods.def;
if (buff.statMods.spd) calcSpd +=buff.statMods.spd;
if (buff.statMods.vision) calcVision +=buff.statMods.vision;
if (buff.statMods.spdMult) calcSpd=Math.round(calcSpd*buff.statMods.spdMult);
}
const qm=global.vanCoTienDoGame&&global.vanCoTienDoGame.questManager;
if (qm&&typeof qm.getPassiveBonuses==="function") {
const pb=qm.getPassiveBonuses();
if (pb.hpPct) calcMaxHp=Math.round(calcMaxHp*(1 + pb.hpPct));
if (pb.atkPct) calcAtk=Math.round(calcAtk*(1 + pb.atkPct));
if (pb.defPct) calcDef=Math.round(calcDef*(1 + pb.defPct));
if (pb.mentalPct) calcMaxMental=Math.round(calcMaxMental*(1 + pb.mentalPct));
}
if (this.isSprinting&&this.stamina>5) {
calcSpd=Math.round(calcSpd*1.42);
}
this.maxHp=Math.max(10,calcMaxHp);
this.hp=Math.min(this.hp,this.maxHp);
this.atk=Math.max(1,calcAtk);
this.def=Math.max(0,calcDef);
this.spd=Math.max(40,calcSpd);
this.vision=Math.max(120,calcVision);
this.maxMental=Math.max(20,calcMaxMental);
this.mental=Math.min(this.mental,this.maxMental);
}
isImmortalCultivator() {
return Boolean(this.aperture&&this.aperture.isImmortal);
}
getEffectiveDaoMarks(pathName) {
if (!this.isImmortalCultivator()) return 0;
return Math.max(0,this.daoMarks[pathName]||0);
}
_updatePathAttainmentLabel(pathName) {
const score=Math.max(
this.pathAttainmentExp[pathName]||0,
this.isImmortalCultivator()?(this.daoMarks[pathName]||0) :0
);
if (score>=10000) this.pathAttainment[pathName]="Vô Thượng Đại Tông Sư";
else if (score>=2000) this.pathAttainment[pathName]="Đại Tông Sư";
else if (score>=400) this.pathAttainment[pathName]="Tông Sư";
else if (score>=100) this.pathAttainment[pathName]="Đại Sư";
else if (score>=25) this.pathAttainment[pathName]="Chuẩn Đại Sư";
else this.pathAttainment[pathName]="Phàm Cấp";
}
addPathAttainmentExp(pathName,amount=1) {
if (!DAO_PATHS[pathName]||amount<=0) return false;
this.pathAttainmentExp[pathName]=Math.max(0,(this.pathAttainmentExp[pathName]||0) + amount);
this._updatePathAttainmentLabel(pathName);
if (!this.isImmortalCultivator()) {
let highestPath=this.mainPath;
let highestVal=this.pathAttainmentExp[highestPath]||0;
for (const [p,val] of Object.entries(this.pathAttainmentExp)) {
if (val>highestVal) {
highestVal=val;
highestPath=p;
}
}
this.mainPath=highestPath;
}
return true;
}
grantInitialImmortalDaoMarks() {
if (!this.isImmortalCultivator()) return;
const regCfg=FIVE_REGIONS[this.region];
const oriCfg=FACTION_ORIGINS[this.origin];
if (regCfg&&regCfg.initialDaoMarks) {
for (const [p,val] of Object.entries(regCfg.initialDaoMarks)) {
this.addDaoMarks(p,val*15);
}
}
if (oriCfg&&oriCfg.extraDaoMarks) {
for (const [p,val] of Object.entries(oriCfg.extraDaoMarks)) {
this.addDaoMarks(p,val*15);
}
}
if (this.aperture&&this.aperture.aptitude&&this.aperture.aptitude.physique) {
for (const p of this.aperture.aptitude.physique.favoredPaths) {
this.addDaoMarks(p,350);
}
}
this.addDaoMarks(this.mainPath,200);
}
addDaoMarks(pathName,amount=1) {
if (!DAO_PATHS[pathName]) return false;
if (!this.isImmortalCultivator()) {
this.daoMarks[pathName]=0;
return false;
}
this.daoMarks[pathName]=Math.max(0,(this.daoMarks[pathName]||0) + amount);
let highestPath=this.mainPath;
let highestVal=this.daoMarks[highestPath]||0;
for (const [p,val] of Object.entries(this.daoMarks)) {
if (val>highestVal) {
highestVal=val;
highestPath=p;
}
}
this.mainPath=highestPath;
this._updatePathAttainmentLabel(pathName);
this.recalculateStats();
return true;
}
addDaoMarksFromTribulation(totalMarks,mainRatio=0.80) {
if (!this.isImmortalCultivator()) return false;
const mainShare=Math.floor(totalMarks*mainRatio);
const rest=Math.max(0,totalMarks - mainShare);
this.addDaoMarks(this.mainPath,mainShare);
if (rest>0) {
const pathInfo=DAO_PATHS[this.mainPath];
const secondary=(pathInfo&&pathInfo.synergyWith&&pathInfo.synergyWith[0])||"Luyện Đạo";
this.addDaoMarks(secondary,rest);
}
return true;
}
calculateDaoAmplification(primaryPath,secondaryPaths=[]) {
const sameMarks=this.getEffectiveDaoMarks(primaryPath);
let amplification=1.0;
if (sameMarks<=2000) {
amplification +=sameMarks / 2000;
} else {
amplification +=1.0 + Math.sqrt((sameMarks - 2000) / 10000)*0.45;
}
if (
this.aperture&&
this.aperture.aptitude&&
this.aperture.aptitude.physique&&
!this.aperture.tenExtremeSealed&&
this.aperture.aptitude.physique.favoredPaths.includes(primaryPath)
) {
amplification +=this.aperture.aptitude.physique.guPowerBonus;
}
const attainment=this.pathAttainment[primaryPath]||"Phàm Cấp";
const isGrandmaster=attainment.includes("Tông Sư");
const pathInfo=DAO_PATHS[primaryPath];
let conflictPenalty=0;
if (pathInfo) {
for (const secPath of secondaryPaths) {
if (pathInfo.conflictWith.includes(secPath)) {
conflictPenalty +=isGrandmaster?0.08 :0.25;
} else if (pathInfo.synergyWith.includes(secPath)) {
amplification +=0.14;
}
}
}
let daoLordBonusMult=1.0;
if (this.aperture&&this.aperture.rank>=9&&this.aperture.daoLordPath===primaryPath) {
const refinedNat=this.aperture.naturalDaoMarksRefined||0;
daoLordBonusMult=1.35 + Math.min(0.35,refinedNat / 500000);
}
const finalMultiplier=Math.max(0.45,Number(((amplification - conflictPenalty)*daoLordBonusMult).toFixed(2)));
return {
multiplier:finalMultiplier,
sameMarks:sameMarks,
conflictPenalty:Number(conflictPenalty.toFixed(2)),
hasConflict:conflictPenalty>0.12,
isDaoLordPath:daoLordBonusMult>1.0
};
}
update(dt,input,mapManager) {
let buffChanged=false;
for (let i=this.activeBuffs.length - 1;i>=0;i--) {
this.activeBuffs[i].duration -=dt;
if (this.activeBuffs[i].duration<=0) {
this.activeBuffs.splice(i,1);
buffChanged=true;
}
}
if (buffChanged) this.recalculateStats();
if (this.mental<this.maxMental) {
const mentalRegen=Math.max(1.5,this.maxMental*0.015);
this.mental=Math.min(this.maxMental,this.mental + mentalRegen*dt);
}
if (this.hp<this.maxHp) {
const hpRegen=Math.max(0.6,this.maxHp*0.003);
this.hp=Math.min(this.maxHp,this.hp + hpRegen*dt);
}
if (input&&typeof input.mouseWorldX==="number"&&typeof input.mouseWorldY==="number") {
this.aimAngle=Math.atan2(input.mouseWorldY - this.y,input.mouseWorldX - this.x);
}
let moveX=0;
let moveY=0;
if (input&&(Math.abs(input.analogX||0)>0.05||Math.abs(input.analogY||0)>0.05)) {
moveX=input.analogX;
moveY=input.analogY;
} else if (input) {
if (input.up) moveY -=1;
if (input.down) moveY +=1;
if (input.left) moveX -=1;
if (input.right) moveX +=1;
}
this.isMoving=(moveX!==0||moveY!==0);
const wantsSprint=Boolean(input&&input.sprint&&this.isMoving&&this.stamina>5);
if (wantsSprint!==this.isSprinting) {
this.isSprinting=wantsSprint;
this.recalculateStats();
}
// Vertical Jump Physics (Gravity & Smooth Landing)
if (this.isJumping||this.z>0||this.vz!==0) {
this.z +=this.vz*dt;
this.vz -=980*dt;
if (this.z<=0) {
const landedHard=(this.vz< -180);
this.z=0;
this.vz=0;
this.isJumping=false;
this.jumpCount=0;
this.jumpSquash=landedHard? -0.22 : -0.10;
// If player vaulted over a rock and landed directly on an interior wall tile, nudge cleanly out!
if (mapManager&& !mapManager.isWalkable(this.x,this.y,this.radius,0)) {
const safe=mapManager.getRandomWalkablePoint(this.x,this.y,16,80);
if (safe) {this.x=safe.x;this.y=safe.y;}
}
if (mapManager&&typeof mapManager.isWaterAt==="function"&&mapManager.isWaterAt(this.x,this.y)) {
mapManager.spawnWaterRipple(this.x,this.y + 8,true);
this._spawnJumpRing(this.x,this.y + 8,"#7ef7f0",28,true);
} else if (landedHard) {
this._spawnJumpRing(this.x,this.y + 10,"rgba(226,191,117,0.65)",22,false);
}
}
}
if (Math.abs(this.jumpSquash)>0.005) {
this.jumpSquash *=Math.max(0,1 - dt*14);
} else {
this.jumpSquash=0;
}
if (this._jumpRings&&this._jumpRings.length>0) {
for (let i=this._jumpRings.length - 1;i>=0;i--) {
this._jumpRings[i].life -=dt;
if (this._jumpRings[i].life<=0) this._jumpRings.splice(i,1);
}
}

// Check if wading in water (only when grounded!)
const onWater=Boolean(mapManager&&typeof mapManager.isWaterAt==="function"&&mapManager.isWaterAt(this.x,this.y));
this.isInWater=onWater&&(this.z<=2);

if (this.isMoving) {
const len=Math.hypot(moveX,moveY);
moveX /=len;
moveY /=len;
if (Math.abs(moveX)>Math.abs(moveY)) {
this.facing=moveX>0?"right" :"left";
} else {
this.facing=moveY>0?"down" :"up";
}
// Wading in water slightly slows walking (0.84x) — jumping leaps cleanly over water at 1.08x speed!
const terrainMult=this.z>4?1.08 :(this.isInWater?0.84 :1.0);
this.vx=moveX*this.spd*terrainMult;
this.vy=moveY*this.spd*terrainMult;
const nextX=this.x + this.vx*dt;
const nextY=this.y + this.vy*dt;
if (!mapManager||mapManager.isWalkable(nextX,this.y,this.radius,this.z)) {
this.x=nextX;
}
if (!mapManager||mapManager.isWalkable(this.x,nextY,this.radius,this.z)) {
this.y=nextY;
}
const staminaDrain=this.isSprinting?4.0 :0.25;
this.stamina=Math.max(0,this.stamina - staminaDrain*dt);
if (this.isInWater&&mapManager&&typeof mapManager.spawnWaterRipple==="function") {
this._waterRippleTimer -=dt;
if (this._waterRippleTimer<=0) {
this._waterRippleTimer=this.isSprinting?0.16 :0.24;
mapManager.spawnWaterRipple(this.x,this.y + 10,false);
}
}
} else {
this.vx=0;
this.vy=0;
if (this.stamina<this.maxStamina) {
this.stamina=Math.min(this.maxStamina,this.stamina + 2.0*dt);
}
if (this.isInWater&&mapManager&&typeof mapManager.spawnWaterRipple==="function") {
this._waterRippleTimer -=dt;
if (this._waterRippleTimer<=0) {
this._waterRippleTimer=0.72;
mapManager.spawnWaterRipple(this.x,this.y + 10,false);
}
}
}
if (this.attackAnimCooldown>0) {
this.attackAnimCooldown -=dt;
this.animState="attack";
} else if (this.isMoving) {
this.animState=this.isSprinting?"run" :"walk";
} else {
this.animState="idle";
}
this.animTimer +=dt*(this.isSprinting?10 :6);
this.animFrame=Math.floor(this.animTimer) % 4;
}
triggerAttackAnimation() {
this.attackAnimCooldown=0.25;
}
_spawnJumpRing(x,y,color="#7ef7c4",maxR=28,isSplash=false) {
if (!this._jumpRings) this._jumpRings=[];
if (this._jumpRings.length>=10) this._jumpRings.shift();
this._jumpRings.push({x,y,color,maxR,isSplash,life:0.34,maxLife:0.34});
}
triggerJump(mapManager=null) {
if (this.hp<=0) return false;
if (this.jumpCount>=this.maxJumps) return false;
const isAirJump=(this.jumpCount>=1||this.z>4);
if (isAirJump) {
if (this.stamina<6) return false;
this.stamina=Math.max(0,this.stamina - 6);
this.vz=305;
this.jumpCount=2;
this.isJumping=true;
this.jumpSquash=0.22;
this._spawnJumpRing(this.x,this.y - this.z + 12,"#7ef7c4",32,false);
return {jumped:true,isDoubleJump:true};
}
this.vz=345;
this.z=Math.max(this.z,2);
this.jumpCount=1;
this.isJumping=true;
this.jumpSquash=0.18;
if (mapManager&&typeof mapManager.isWaterAt==="function"&&mapManager.isWaterAt(this.x,this.y)) {
mapManager.spawnWaterRipple(this.x,this.y + 10,true);
this._spawnJumpRing(this.x,this.y + 10,"#7ef7f0",30,true);
} else {
this._spawnJumpRing(this.x,this.y + 12,"rgba(255,234,167,0.68)",24,false);
}
return {jumped:true,isDoubleJump:false};
}
addBuff(buffData) {
const existingIdx=this.activeBuffs.findIndex(b=>b.id===buffData.id);
const newBuff={
id:buffData.id,
name:buffData.name||"Cổ Thuật",
icon:buffData.icon||"✨",
duration:buffData.duration||8,
maxDuration:buffData.duration||8,
statMods:buffData.statMods||{},
shieldHp:buffData.shieldHp||0,
visualColor:buffData.visualColor||"#e0be77"
};
if (existingIdx>=0) {
this.activeBuffs[existingIdx]=newBuff;
} else {
this.activeBuffs.push(newBuff);
}
this.recalculateStats();
}
takeDamage(rawDamage,sourceName="Đòn tấn công",attackerRank=null,attackerRef=null) {
let actualDamage=rawDamage;
if (!sourceName.includes("Khiếu Bích")&& !sourceName.includes("Đồng Hóa")) {
// Không miễn sát thương theo cấp độ — mọi đòn đánh đều xuyên tối thiểu 20% sát thương qua phòng ngự
const minPenetration=Math.max(1,rawDamage*0.20);
actualDamage=Math.max(minPenetration,rawDamage - this.def*0.55);
}
for (const buff of this.activeBuffs) {
if (buff.shieldHp&&buff.shieldHp>0) {
const absorbed=Math.min(buff.shieldHp,actualDamage);
buff.shieldHp -=absorbed;
actualDamage -=absorbed;
if (buff.shieldHp<=0) buff.duration=0;
if (actualDamage<=0) break;
}
}
this.hp=Math.max(0,Number((this.hp - actualDamage).toFixed(1)));
return {
damageTaken:Number(actualDamage.toFixed(1)),
isDead:this.hp<=0,
source:sourceName
};
}
heal(amount) {
const before=this.hp;
this.hp=Math.min(this.maxHp,Number((this.hp + amount).toFixed(1)));
return Number((this.hp - before).toFixed(1));
}
addItem(itemId,count=1) {
if (!ITEM_DATABASE[itemId]||count<=0) return false;
if (itemId==="primeval_stone") {
this.primevalStones +=count;
return true;
}
if (itemId==="immortal_stone") {
this.immortalStones +=count;
const existing=this.inventory.find(i=>i.id===itemId);
if (existing) existing.count +=count;
else this.inventory.push({id:itemId,count:count});
return true;
}
const existing=this.inventory.find(i=>i.id===itemId);
if (existing) {
existing.count +=count;
} else {
this.inventory.push({id:itemId,count:count});
}
return true;
}
removeItem(itemId,count=1) {
if (itemId==="primeval_stone") {
if (this.primevalStones<count) return false;
this.primevalStones -=count;
return true;
}
const idx=this.inventory.findIndex(i=>i.id===itemId);
if (itemId==="immortal_stone") {
const invCount=idx>=0?this.inventory[idx].count :0;
const available=Math.max(this.immortalStones||0,invCount);
if (available<count) return false;
const nextVal=Math.max(0,available - count);
this.immortalStones=nextVal;
if (idx>=0) {
if (nextVal<=0) this.inventory.splice(idx,1);
else this.inventory[idx].count=nextVal;
} else if (nextVal>0) {
this.inventory.push({id:"immortal_stone",count:nextVal});
}
return true;
}
if (idx=== -1||this.inventory[idx].count<count) return false;
this.inventory[idx].count -=count;
if (this.inventory[idx].count<=0) {
this.inventory.splice(idx,1);
}
return true;
}
getItemCount(itemId) {
if (itemId==="primeval_stone") return this.primevalStones;
const found=this.inventory.find(i=>i.id===itemId);
return found?found.count :0;
}
useItem(itemId) {
const meta=ITEM_DATABASE[itemId];
if (!meta) return {success:false,message:"Vật phẩm không tồn tại."};
if (this.getItemCount(itemId)<=0) {
return {success:false,message:`Không còn ${meta.name} trong hành trang.`};
}
if (meta.category==="relic_gu") {
if (!this.aperture||this.aperture.rank!==meta.targetRank) {
return {
success:false,
message:`[${meta.name}] chỉ dùng được khi ngươi đang ở cảnh giới ${meta.targetRank} Chuyển!`
};
}
return this.useRelicGu(this.aperture);
}
if (meta.category==="physique_gu") {
if (!this.aperture) {
return {success:false,message:"Chưa có dữ liệu Không Khiếu!"};
}
let res={success:false,message:"Không thể sử dụng Cổ Trùng này."};
if (itemId==="am_duong_chuyen_than_gu"&&typeof this.aperture.applyYinYangRotationGu==="function") {
res=this.aperture.applyYinYangRotationGu();
} else if (itemId==="thach_khieu_gu"&&typeof this.aperture.applyStoneApertureGu==="function") {
res=this.aperture.applyStoneApertureGu();
} else if (itemId==="tinh_khieu_dinh_nguyen_gu"&&typeof this.aperture.applyFreezePressureGu==="function") {
res=this.aperture.applyFreezePressureGu();
}
if (res.success) {
this.removeItem(itemId,1);
this.recalculateStats();
}
return res;
}
if (itemId==="immortal_stone") {
if (!this.aperture|| !this.aperture.isImmortal) {
return {success:false,message:"Chỉ Cổ Tiên Lục Chuyển trở lên mới có thể luyện hóa Tiên Nguyên Thạch thành Tiên Nguyên!"};
}
this.removeItem(itemId,1);
const curRank=this.aperture.rank||6;
const gainBeads=5;
this.aperture.immortalEssence[curRank]=Number(((this.aperture.immortalEssence[curRank]||0) + gainBeads).toFixed(2));
const essName=this.aperture.getEssenceQualityName?this.aperture.getEssenceQualityName() :"Tiên Nguyên";
return {success:true,message:`🌟 Đã luyện hóa 1 Tiên Nguyên Thạch thành +${gainBeads} viên ${essName}!`};
}
if (itemId==="remnant_recipe") {
return {
success:false,
message:"Hãy chuyển sang phân khu [⚗️ Luyện Đạo Các] và bấm nút 'Giải Mã Tàn Phương'!"
};
}
if (!meta.hpRestore&& !meta.staminaRestore&& !meta.mentalRestore) {
return {
success:false,
message:`${meta.name} là cổ tài nuôi dưỡng / hợp luyện. Hãy sử dụng trong mục [Kho Cổ] hoặc [Luyện Đạo Các].`
};
}
this.removeItem(itemId,1);
const effects=[];
if (meta.hpRestore) {
const healed=this.heal(meta.hpRestore);
effects.push(`+${healed} Sinh Mệnh`);
}
if (meta.staminaRestore) {
this.stamina=Math.min(this.maxStamina,this.stamina + meta.staminaRestore);
effects.push(`+${meta.staminaRestore}% Thể Lực`);
}
if (meta.mentalRestore) {
this.mental=Math.min(this.maxMental,this.mental + meta.mentalRestore);
effects.push(`+${meta.mentalRestore} Tinh Thần Lực`);
}
return {
success:true,
message:`Đã sử dụng ${meta.name} (${effects.join(", ")}).`
};
}
getAlignmentTitle() {
if (this.alignment>=50) return `Chính Đạo Tiên Phong (+${this.alignment})`;
if (this.alignment>=15) return `Chính Đạo Cổ Sư (+${this.alignment})`;
if (this.alignment<= -50) return `Đại Ma Đầu (${this.alignment})`;
if (this.alignment<= -15) return `Ma Đạo Cổ Sư (${this.alignment})`;
return `Tán Tu Trung Lập (${this.alignment})`;
}
static _drawRoundedRect(ctx,x,y,w,h,r) {
const rr=Math.min(r,w/2,h/2);
ctx.beginPath();
ctx.moveTo(x+rr,y);
ctx.lineTo(x+w-rr,y);
ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
ctx.lineTo(x+w,y+h-rr);
ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);
ctx.lineTo(x+rr,y+h);
ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
ctx.lineTo(x,y+rr);
ctx.quadraticCurveTo(x,y,x+rr,y);
ctx.closePath();
}
static drawSkinPixelSprite(ctx,skinCfg,state={}) {
const skin=skinCfg||CHARACTER_SKINS.phuong_nguyen;
if (!global.CharacterArtRenderer) return;
if (state&&state.allowCache&&typeof global.CharacterArtRenderer.drawCharacterCached==="function") {
global.CharacterArtRenderer.drawCharacterCached(ctx,skin,state);
} else if (typeof global.CharacterArtRenderer.drawCharacter==="function") {
global.CharacterArtRenderer.drawCharacter(ctx,skin,state);
}
}
static renderSkinPreview(ctx,skinKey) {
if (!ctx) return;
const skin=CHARACTER_SKINS[skinKey]||CHARACTER_SKINS.phuong_nguyen;
if (global.CharacterArtRenderer&&typeof global.CharacterArtRenderer.renderPortraitPreview==="function") {
global.CharacterArtRenderer.renderPortraitPreview(ctx,skin);
}
}
render(ctx,camera) {
if (!ctx) return;
const screenX=Math.round(this.x - (camera?camera.x :0));
const screenY=Math.round(this.y - (camera?camera.y :0));
const skin=this.getSkinConfig();
ctx.save();
ctx.translate(screenX,screenY);
const pRank=(this.aperture&&this.aperture.rank)?this.aperture.rank :1;
const rt=performance.now()*0.0028;
const haloColors={1:"#38c992",2:"#e6483d",3:"#dce8f2",4:"#f7c948",5:"#b75cff",6:"#4cd964",7:"#ff3b30",8:"#99d6ff",9:"#ffd700"};
const hCol=haloColors[pRank]||"#38c992";

// Rotating Dao Formation Array under feet
ctx.save();
ctx.translate(0,13);
ctx.scale(1,0.44);
ctx.rotate(rt*(pRank>=6?0.9 :0.5));
const arrayR=18 + Math.min(11,pRank*1.1);
ctx.strokeStyle=hCol;
ctx.globalAlpha=pRank>=6?0.68 :0.38;
ctx.lineWidth=pRank>=6?2.2 :1.3;
ctx.beginPath();
ctx.arc(0,0,arrayR,0,Math.PI*2);
ctx.stroke();

ctx.beginPath();
ctx.arc(0,0,arrayR - 4.5,0,Math.PI*2);
ctx.stroke();

if (pRank>=5) {
ctx.beginPath();
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
const x=Math.cos(a)*arrayR;
const y=Math.sin(a)*arrayR;
if (i===0) ctx.moveTo(x,y);
else ctx.lineTo(x,y);
}
ctx.closePath();
ctx.globalAlpha=0.32;
ctx.stroke();
}
ctx.restore();

// Dynamic Ground Shadow when Jumping (shrinks & softens with height!)
const zH=Math.max(0,this.z||0);
if (zH>1) {
const shScale=Math.max(0.45,1 - zH / 120);
ctx.fillStyle=`rgba(0,0,0,${(0.42*shScale).toFixed(2)})`;
ctx.beginPath();
ctx.ellipse(0,15,11*shScale,4.2*shScale,0,0,Math.PI*2);
ctx.fill();
}

// Airborne Khinh Công Jump Rings / Dust / Water Splash Rings
if (this._jumpRings&&this._jumpRings.length>0) {
ctx.save();
for (let i=0;i<this._jumpRings.length;i++) {
const jr=this._jumpRings[i];
const ratio=jr.life / jr.maxLife;
const rad=6 + (jr.maxR - 6)*(1 - ratio);
const rx=jr.x - this.x;
const ry=jr.y - this.y;
ctx.globalAlpha=Math.max(0,ratio*0.85);
ctx.strokeStyle=jr.color;
ctx.lineWidth=jr.isSplash?2.2 :1.8;
ctx.beginPath();
ctx.ellipse(rx,ry,rad,rad*0.48,0,0,Math.PI*2);
ctx.stroke();
}
ctx.restore();
}

// Elevate Character, Orbs, Shield & Slash cleanly by -zH with crisp squash-and-stretch!
ctx.save();
ctx.translate(0,-zH);
if (Math.abs(this.jumpSquash||0)>0.01) {
const sy=1 + this.jumpSquash;
const sx=1 - this.jumpSquash*0.55;
ctx.scale(sx,sy);
}

// Immortal Essence Orbs (Rank 6-9)
if (pRank>=6) {
ctx.save();
const orbCnt=Math.min(6,pRank - 4);
for (let oi=0;oi<orbCnt;oi++) {
const oa=rt*1.5 + (oi*Math.PI*2)/orbCnt;
const ox=Math.cos(oa)*(23 + (pRank>=9?4 :0));
const oy=-4 + Math.sin(oa)*12;
const oGrad=ctx.createRadialGradient(ox,oy,0.5,ox,oy,4.5);
oGrad.addColorStop(0,"#ffffff");
oGrad.addColorStop(0.5,hCol);
oGrad.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=oGrad;
ctx.beginPath();
ctx.arc(ox,oy,4.5,0,Math.PI*2);
ctx.fill();
}
ctx.restore();
}

// Defensive Buff Shimmering Shield Dome
for (const buff of this.activeBuffs) {
if (buff.statMods&&(buff.statMods.def>0||buff.shieldHp>0)) {
const sc=buff.visualColor||"#e0be77";
ctx.save();
const sGrad=ctx.createRadialGradient(0,-2,10,0,-2,26);
sGrad.addColorStop(0,"rgba(255,255,255,0)");
sGrad.addColorStop(0.75,"rgba(255,255,255,0.06)");
sGrad.addColorStop(1,sc);
ctx.globalAlpha=0.35 + Math.sin(rt*3)*0.1;
ctx.fillStyle=sGrad;
ctx.beginPath();
ctx.arc(0,-2,25,0,Math.PI*2);
ctx.fill();
ctx.globalAlpha=0.85;
ctx.strokeStyle=sc;
ctx.lineWidth=2.0;
ctx.beginPath();
ctx.arc(0,-2,25,0,Math.PI*2);
ctx.stroke();
ctx.restore();
break;
}
}

let bobY=0;
let legOffset=0;
if (this.animState==="walk"||this.animState==="run") {
bobY=(this.animFrame % 2===0)? -2.2 :0;
legOffset=(this.animFrame===1)?3.2 :(this.animFrame===3? -3.2 :0);
}
const armSwing=(this.animState==="attack")? -6 :(legOffset*0.8);
PlayerManager.drawSkinPixelSprite(ctx,skin,{
bobY:bobY,
legOffset:legOffset,
armSwing:armSwing,
facing:this.facing,
isMoving:this.isMoving
});

// Crescent Dao-Energy Slash Arc on Attack
if (this.animState==="attack") {
ctx.save();
ctx.rotate(this.aimAngle);
const slashCol=skin.weaponColor||"#e3c178";
ctx.strokeStyle=slashCol;
ctx.globalAlpha=0.88;
ctx.lineWidth=4.5;
ctx.lineCap="round";
ctx.beginPath();
ctx.arc(6,0,22,-0.88,0.88);
ctx.stroke();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=1.8;
ctx.beginPath();
ctx.arc(7,0,22,-0.65,0.65);
ctx.stroke();
ctx.restore();
}
// Close Jump Elevation Transform
ctx.restore();

// Translucent Live Water Ring around ankles when wading in water!
if (this.isInWater&&zH<=2) {
const wPulse=Math.sin(rt*4.2)*1.6;
ctx.save();
ctx.fillStyle="rgba(26,115,148,0.34)";
ctx.beginPath();
ctx.ellipse(0,12,11.5 + wPulse*0.5,4.2,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="rgba(190,248,255,0.72)";
ctx.lineWidth=1.4;
ctx.beginPath();
ctx.ellipse(0,12,12.5 + wPulse,4.8,0,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
ctx.restore();
}
toSaveData() {
return {
name:this.name,
skinId:this.skinId,
region:this.region,
origin:this.origin,
alignment:this.alignment,
fame:this.fame,
kills:this.kills,
baseMaxHp:this.baseMaxHp,
hp:this.hp,
baseAtk:this.baseAtk,
baseDef:this.baseDef,
baseSpd:this.baseSpd,
baseVision:this.baseVision,
baseMaxMental:this.baseMaxMental,
mental:this.mental,
stamina:this.stamina,
primevalStones:this.primevalStones,
meritPoints:this.meritPoints,
immortalStones:this.immortalStones,
refinementBonus:this.refinementBonus,
tradeDiscount:this.tradeDiscount,
mainPath:this.mainPath,
daoMarks:this.daoMarks,
pathAttainment:this.pathAttainment,
pathAttainmentExp:this.pathAttainmentExp,
dreamClears:this.dreamClears,
inventory:this.inventory
};
}
fromSaveData(data) {
if (!data||typeof data!=="object") return;
this.reset();
const safeNum=(v,fb,min= -Infinity,max=Infinity)=>{
const n=Number(v);
return Number.isFinite(n)?Math.max(min,Math.min(max,n)) :fb;
};
const rawName=typeof data.name==="string"?data.name.replace(/[\x00-\x1F\x7F<>]/g,"").trim() :"";
this.name=rawName?rawName.slice(0,32) :"Cổ Nguyệt Phương Nguyên";
this.skinId=CHARACTER_SKINS[data.skinId]?data.skinId :"phuong_nguyen";
this.region=FIVE_REGIONS[data.region]?data.region :"nam_cuong";
this.origin=FACTION_ORIGINS[data.origin]?data.origin :"righteous_clan";
this.alignment=Math.round(safeNum(data.alignment,20,-1000,1000));
this.fame=Math.floor(safeNum(data.fame,0,0,99999999));
this.kills=Math.floor(safeNum(data.kills,0,0,99999999));
this.baseMaxHp=Math.round(safeNum(data.baseMaxHp,110,50,5000));
this.baseAtk=Math.round(safeNum(data.baseAtk,14,5,1000));
this.baseDef=Math.round(safeNum(data.baseDef,6,1,1000));
this.baseSpd=Math.round(safeNum(data.baseSpd,140,60,500));
this.baseVision=Math.round(safeNum(data.baseVision,260,120,1000));
this.baseMaxMental=Math.round(safeNum(data.baseMaxMental,100,40,5000));
this.primevalStones=Math.floor(safeNum(data.primevalStones,60,0,999999999));
this.meritPoints=Math.floor(safeNum(data.meritPoints,100,0,999999999));
this.immortalStones=Math.floor(safeNum(data.immortalStones,0,0,999999999));
this.refinementBonus=safeNum(data.refinementBonus,0,0,0.5);
this.tradeDiscount=safeNum(data.tradeDiscount,0,0,0.5);
this.mainPath=DAO_PATHS[data.mainPath]?data.mainPath :"Quang Đạo";
if (data.pathAttainmentExp&&typeof data.pathAttainmentExp==="object") {
for (const p of Object.keys(DAO_PATHS)) {
this.pathAttainmentExp[p]=safeNum(data.pathAttainmentExp[p],0,0,99999999);
}
}
if (data.daoMarks&&typeof data.daoMarks==="object") {
if (this.isImmortalCultivator()) {
for (const p of Object.keys(DAO_PATHS)) {
this.daoMarks[p]=safeNum(data.daoMarks[p],0,0,99999999);
}
} else {
for (const [p,val] of Object.entries(data.daoMarks)) {
if (DAO_PATHS[p]) {
this.daoMarks[p]=0;
const numVal=safeNum(val,0,0,99999999);
if (!data.pathAttainmentExp&&numVal>0) {
this.pathAttainmentExp[p]=Math.max(this.pathAttainmentExp[p]||0,numVal);
}
}
}
}
}
for (const p of Object.keys(DAO_PATHS)) {
if (!this.isImmortalCultivator()) this.daoMarks[p]=0;
this._updatePathAttainmentLabel(p);
}
if (data.dreamClears&&typeof data.dreamClears==="object") {
this.dreamClears={...data.dreamClears};
}
if (Array.isArray(data.inventory)) {
this.inventory=data.inventory
.filter(s=>s&&typeof s==="object"&&typeof s.id==="string"&&ITEM_DATABASE[s.id])
.map(s=>({id:s.id,count:Math.max(1,Math.floor(safeNum(s.count,1,1,9999999)))}));
}
this.recalculateStats();
this.hp=Math.min(this.maxHp,safeNum(data.hp,this.maxHp,1,this.maxHp));
this.mental=Math.min(this.maxMental,safeNum(data.mental,this.maxMental,0,this.maxMental));
this.stamina=safeNum(data.stamina,100,0,100);
}
}
PlayerManager.CHARACTER_SKINS=CHARACTER_SKINS;
PlayerManager.FIVE_REGIONS=FIVE_REGIONS;
PlayerManager.FACTION_ORIGINS=FACTION_ORIGINS;
PlayerManager.ORIGIN_CONFIGS=FACTION_ORIGINS;
PlayerManager.DAO_PATHS=DAO_PATHS;
PlayerManager.DAO_PATH_PASSIVES=DAO_PATH_PASSIVES;
PlayerManager.ITEM_DATABASE=ITEM_DATABASE;
PlayerManager.DREAM_REALMS=DREAM_REALMS;
global.PlayerManager=PlayerManager;
})(window);
