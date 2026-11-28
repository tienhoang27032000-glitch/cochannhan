(function (global) {
"use strict";
const {MIN_ASCENSION_HUMAN_QI,VENERABLE_REQ_DAO_MARKS,VENERABLE_REQ_MYRIAD_TRIBULATIONS,APTITUDE_TIERS,TEN_EXTREME_PHYSIQUES,MORTAL_SUBSTAGES,MORTAL_RANKS,IMMORTAL_RANKS,BLESSED_LAND_GRADES,RITUAL_STEPS_DATA}=global.VanCoApertureData;
class ApertureSystem {
constructor() {
this.game=null;
this.ui=null;
this.reset();
}
init(systems={}) {
if (systems.game) {
this.game=systems.game;
}
if (systems.ui) {
this.ui=systems.ui;
}
}
reset() {
this.isAwakened=false;
this.isImmortal=false;
this.aptitude={
grade:"C",
gradeName:"Bính Đẳng",
maxSeaPercent:50,
baseRegen:0.45,
cultivateMult:0.90,
breakthroughBonus:-0.02,
physique:null
};
this.rank=1;
this.subStage=0;
this.currentEssence=0;
this.maxEssenceCap=100;
this.wallProgress=0;
this.maxWallProgress=MORTAL_RANKS[1].baseWallReq;
this.wallPressure=0;
this.wallIntegrity=100;
this.hasExploded=false;
this._pressureWarned=false;
this.tenExtremeSealed=false;
this.pressureFreezeTimer=0;
this.daoBlockadeBroken=false;
this.daoLordPath=null;
this.naturalDaoMarksRefined=0;
this.isMeditating=false;
this.vitalGuId=null;
this.vitalGuName="Chưa luyện hóa";
this.humanQi=10;
this.immortalEssence={
6:0,
7:0,
8:0,
9:0
};
this.immortalAperture={
active:false,
gradeId:"MEDIUM",
gradeName:"Trung Cấp Phúc Địa",
spaceAcres:0,
timeRatio:16,
internalDays:0,
calamityCountdownDays:1200,
lastYieldAt:0,
subStageTribulationsPassed:0,
subStageTribulationsRequired:14,
earthlyCalamitiesPassed:0,
heavenlyTribulationsPassed:0,
grandTribulationsPassed:0,
myriadTribulationsPassed:0,
originCoreStability:100,
resources:{
primevalStonesOutput:5,
herbsNodes:2,
oreVeins:1,
guWormsWild:3,
immortalMaterialPoints:0
},
livingBeings:{
mortals:0,
beasts:12,
variantHumans:0
},
environmentNodes:[]
};
this.ascensionState={
inProgress:false,
stage:0,
heavenQi:100,
earthQi:100,
humanQiCommitted:100,
balanceScore:90,
tribulationHp:100,
tribulationMaxHp:100,
logs:[]
};
this.ritualState={
currentStep:1,
originType:"righteous_clan",
particles:[],
animTick:0,
rolledAptitude:null,
rolledVitalGu:null
};
this._initRitualParticles();
}
_initRitualParticles() {
this.ritualState.particles=[];
for (let i=0;i<48;i++) {
this.ritualState.particles.push({
x:Math.random()*420,
y:Math.random()*210,
r:1.5 + Math.random()*2.5,
vx:(Math.random() - 0.5)*0.6,
vy:-0.3 - Math.random()*0.7,
alpha:0.3 + Math.random()*0.7
});
}
}
startAwakeningRitual(originType="righteous_clan") {
this.ritualState.currentStep=1;
this.ritualState.originType=originType;
this.ritualState.rolledAptitude=this._rollAptitudeByOrigin(originType);
this.ritualState.rolledVitalGu=this._rollInitialVitalGu(originType,this.ritualState.rolledAptitude);
return this.getCurrentRitualStepData();
}
_rollAptitudeByOrigin(originType) {
let weights={D:30,C:42,B:19,A:7.5,TEN_EXTREME:1.5};
if (originType==="righteous_clan"||originType==="clan") {
weights={D:22,C:44,B:23,A:9.0,TEN_EXTREME:2.0};
} else if (originType==="central_sect") {
weights={D:18,C:42,B:27,A:11.0,TEN_EXTREME:2.0};
} else if (originType==="lone_cultivator"||originType==="commoner") {
weights={D:34,C:42,B:16,A:6.0,TEN_EXTREME:2.0};
} else if (originType==="demonic_inheritor"||originType==="inheritance") {
weights={D:25,C:38,B:23,A:11.0,TEN_EXTREME:3.0};
}
const total=Object.values(weights).reduce((a,b)=>a + b,0);
let roll=Math.random()*total;
let chosenTierKey="C";
for (const [key,weight] of Object.entries(weights)) {
if (roll<weight) {
chosenTierKey=key;
break;
}
roll -=weight;
}
const tierInfo=APTITUDE_TIERS[chosenTierKey];
const seaCap=Math.floor(
tierInfo.minSea + Math.random()*(tierInfo.maxSea - tierInfo.minSea + 1)
);
let physique=null;
if (chosenTierKey==="TEN_EXTREME") {
const randIndex=Math.floor(Math.random()*TEN_EXTREME_PHYSIQUES.length);
physique=TEN_EXTREME_PHYSIQUES[randIndex];
}
return {
grade:chosenTierKey,
gradeName:physique?`${tierInfo.name} — ${physique.name}` :tierInfo.name,
maxSeaPercent:seaCap,
baseRegen:Number((tierInfo.baseRegen*(seaCap / 60)).toFixed(2)),
cultivateMult:tierInfo.cultivateMult,
breakthroughBonus:tierInfo.breakthroughBonus,
physique:physique,
desc:physique?physique.desc :tierInfo.desc
};
}
_rollInitialVitalGu(originType,aptitude) {
if (aptitude.physique) {
const path=aptitude.physique.favoredPaths[0];
if (path==="Lực Đạo") return {id:"hung_luc_gu",name:"Hắc Thỉ Cổ (Nhất Chuyển - Lực Đạo)"};
if (path==="Viêm Đạo") return {id:"hoa_cau_gu",name:"Xích Diễm Cổ (Nhất Chuyển - Viêm Đạo)"};
if (path==="Băng Đạo"||path==="Thủy Đạo") return {id:"han_bang_gu",name:"Hàn Sương Cổ (Nhất Chuyển - Băng Đạo)"};
}
switch (originType) {
case "righteous_clan":
case "clan":
return {id:"nguyet_quang_gu",name:"Nguyệt Quang Cổ (Nhất Chuyển - Quang Đạo)"};
case "central_sect":
return {id:"phong_nhan_gu",name:"Phong Nhận Cổ (Nhất Chuyển - Phong Đạo)"};
case "lone_cultivator":
case "commoner":
case "orphan":
return {id:"thiet_bi_gu",name:"Đồng Bì Cổ (Nhất Chuyển - Kim Đạo)"};
case "merchant_heir":
case "adopted":
return {id:"thanh_phong_gu",name:"Thanh Phong Luân Cổ (Nhất Chuyển - Phong Đạo)"};
case "demonic_inheritor":
case "inheritance":
return {id:"huyet_nguyet_gu",name:"Huyết Nguyệt Cổ (Nhất Chuyển - Huyết Đạo)"};
default:
return {id:"nguyet_quang_gu",name:"Nguyệt Quang Cổ (Nhất Chuyển - Quang Đạo)"};
}
}
advanceRitualStep() {
if (this.ritualState.currentStep<7) {
this.ritualState.currentStep +=1;
}
if (this.ritualState.currentStep===7&& !this.isAwakened) {
this.finalizeAwakening();
}
return this.getCurrentRitualStepData();
}
getCurrentRitualStepData() {
const stepObj=RITUAL_STEPS_DATA[this.ritualState.currentStep - 1];
return {
step:stepObj.step,
title:stepObj.title,
text:stepObj.text,
isFinished:this.ritualState.currentStep>=7,
aptitudeResult:this.ritualState.rolledAptitude,
vitalGuResult:this.ritualState.rolledVitalGu
};
}
finalizeAwakening() {
const rolled=this.ritualState.rolledAptitude||this._rollAptitudeByOrigin("righteous_clan");
const vital=this.ritualState.rolledVitalGu||{id:"nguyet_quang_gu",name:"Nguyệt Quang Cổ"};
this.isAwakened=true;
this.isImmortal=false;
this.aptitude={...rolled};
this.rank=1;
this.subStage=0;
this.currentEssence=rolled.maxSeaPercent;
this.wallProgress=0;
this.maxWallProgress=MORTAL_RANKS[1].baseWallReq;
this.wallPressure=rolled.physique?0 :5;
this.vitalGuId=vital.id;
this.vitalGuName=vital.name;
if (rolled.physique) {
this.humanQi=40;
} else if (rolled.grade==="A") {
this.humanQi=18;
} else {
this.humanQi=10;
}
}
update(dt,player) {
if (!this.isAwakened) return;
this.ritualState.animTick +=dt;
if (!this.isImmortal) {
const maxCap=this.aptitude.maxSeaPercent;
if (this.currentEssence<maxCap) {
let regenRate=this.aptitude.baseRegen;
if (this.isMeditating) regenRate*=1.5;
this.currentEssence=Math.min(maxCap,this.currentEssence + regenRate*dt);
}
if (this.isMeditating) {
this.cultivateStep(dt,0.35);
} else {
if (!this.aptitude.physique&&this.wallPressure>5) {
this.wallPressure=Math.max(5,this.wallPressure - 1.2*dt);
}
}
if (this.aptitude.physique&& !this.hasExploded) {
if (this.tenExtremeSealed) {
this.wallPressure=0;
this._pressureWarned=false;
} else if (this.pressureFreezeTimer>0) {
this.pressureFreezeTimer=Math.max(0,this.pressureFreezeTimer - dt);
} else {
const pRate=1 / 45;
this.wallPressure=Math.min(100,this.wallPressure + pRate*dt);
const uiRef=this.ui||(global.vanCoTienDoGame&&global.vanCoTienDoGame.ui);
if (this.wallPressure>=80&& !this._pressureWarned) {
this._pressureWarned=true;
if (uiRef&&typeof uiRef.addLog==="function") {
uiRef.addLog(
"🚨 [CẢNH BÁO SINH TỬ - THẬP TUYỆT THỂ] Áp lực Không Khiếu đã vượt 80%! Hãy nhanh chóng đột phá Đại Cảnh Giới hoặc dùng Âm Dương Chuyển Thân Cổ / Thạch Khiếu Cổ trước khi đạt 100% (Bạo tạc chết hẳn)!",
"danger"
);
}
} else if (this.wallPressure<70) {
this._pressureWarned=false;
}
if (this.wallPressure>=100) {
if (global.vanCoSettings&&global.vanCoSettings.get("tenExtremeSafeMode")) {
this.wallPressure=99;
return;
}
this.hasExploded=true;
const gameRef=this.game||global.vanCoTienDoGame;
if (gameRef&&typeof gameRef.triggerPermadeath==="function") {
gameRef.triggerPermadeath(
`Áp lực 【${this.aptitude.physique.name}】 chạm ngưỡng 100% ở Phàm Cảnh (${this.getRealmDisplayName()}) — Không Khiếu nứt toác, tự bạo thành tro bụi!`
);
}
return;
}
}
}
} else if (this.immortalAperture.active) {
const internalDaysDelta=(dt / 72)*this.immortalAperture.timeRatio;
this.immortalAperture.internalDays +=internalDaysDelta;
this.immortalAperture.calamityCountdownDays=Math.max(
0,
this.immortalAperture.calamityCountdownDays - internalDaysDelta
);
const essencePerSec=this.getImmortalEssenceRegenPerSec();
this.immortalEssence[this.rank]=Number(((this.immortalEssence[this.rank]||0) + essencePerSec*dt).toFixed(4));
if (this.immortalAperture.calamityCountdownDays<=0) {
this.immortalAperture.calamityCountdownDays=1200;
const calamityRes=this._triggerApertureCalamity(player,false);
const uiRef=this.ui||(global.vanCoTienDoGame&&global.vanCoTienDoGame.ui);
if (calamityRes&&calamityRes.message&&uiRef&&typeof uiRef.addLog==="function") {
uiRef.addLog(calamityRes.message,calamityRes.didAdvance?"loot" :"warning");
if (typeof uiRef.updateHUD==="function") {
uiRef.updateHUD();
}
}
}
}
}
getImmortalEssenceRegenPerSec() {
if (!this.isImmortal|| !this.immortalAperture|| !this.immortalAperture.active) return 0;
const baseByGrade={SMALL:0.10,MEDIUM:0.18,LARGE:0.28,SUPER:0.45};
const baseRate=baseByGrade[this.immortalAperture.gradeId]||0.18;
const acres=Math.max(1500,this.immortalAperture.spaceAcres||3200);
const spaceMult=1 + Math.min(1.20,Math.max(0,(acres - 2000) / 18000));
const rankMult=1 + Math.max(0,(this.rank||6) - 6)*0.20;
const pseudoMult=(typeof this.isPseudoVenerable==="function"&&this.isPseudoVenerable())?1.25 :1.0;
const daoLordMult=(this.rank>=9&&this.daoLordPath)?1.30 :1.0;
const restMult=(this.game&&this.game.currentScreen==="hub")?1.25 :1.0;
return Number((baseRate*spaceMult*rankMult*pseudoMult*daoLordMult*restMult).toFixed(3));
}
calculateEssenceCost(baseCost,guRank=1,guPath=null) {
if (this.isImmortal) {
if (guRank<=5) {
return {canUse:true,isImmortalCost:true,rank:this.rank,cost:0.01};
}
const rankDiff=guRank - this.rank;
let beadCost=baseCost*Math.pow(15,Math.max(0,rankDiff))*(rankDiff<0?Math.pow(0.15,-rankDiff) :1);
if (this.rank>=9&&this.daoLordPath&&guPath&&guPath===this.daoLordPath) {
beadCost*=0.70;
}
return {canUse:true,isImmortalCost:true,rank:this.rank,cost:Number(Math.max(0.01,beadCost).toFixed(2))};
}
if (guRank>=6) {
return {canUse:false,reason:"Phàm nhân không có Tiên Nguyên để thúc giục Tiên Cổ!"};
}
const playerDensity=MORTAL_RANKS[this.rank].densityMultiplier;
const guDensity=MORTAL_RANKS[guRank].densityMultiplier;
let ratio=guDensity / playerDensity;
if (guRank<this.rank) {
ratio=Math.max(0.10,Math.pow(0.48,this.rank - guRank));
} else if (guRank>this.rank) {
ratio=Math.pow(2.6,guRank - this.rank);
}
const finalCost=Number((baseCost*ratio).toFixed(2));
return {
canUse:true,
isImmortalCost:false,
cost:finalCost,
overRankPenalty:Math.max(0,guRank - this.rank)
};
}
hasEnoughEssence(baseCost,guRank=1,guPath=null) {
if (!this.isAwakened) return false;
const calc=this.calculateEssenceCost(baseCost,guRank,guPath);
if (calc.canUse===false) return false;
if (calc.isImmortalCost) {
return this.immortalEssence[this.rank]>=calc.cost;
}
return this.currentEssence>=calc.cost&&this.currentEssence>0;
}
consumeEssence(baseCost,guRank=1,guPath=null) {
if (!this.hasEnoughEssence(baseCost,guRank,guPath)) {
return {
success:false,
reason:this.currentEssence<=0
?"Biển Nguyên đã cạn kiệt (0%)! Không thể thúc giục Cổ Trùng."
:"Không đủ Chân Nguyên để kích hoạt!"
};
}
const calc=this.calculateEssenceCost(baseCost,guRank,guPath);
if (calc.isImmortalCost) {
this.immortalEssence[this.rank]=Math.max(0,this.immortalEssence[this.rank] - calc.cost);
return {success:true,cost:calc.cost,isImmortal:true};
}
this.currentEssence=Math.max(0,Number((this.currentEssence - calc.cost).toFixed(2)));
if (!this.aptitude.physique) {
if (calc.overRankPenalty>0) {
this.wallPressure=Math.min(100,this.wallPressure + calc.overRankPenalty*10);
} else {
this.wallPressure=Math.min(100,this.wallPressure + 0.3);
}
}
return {
success:true,
cost:calc.cost,
remaining:this.currentEssence,
depleted:this.currentEssence<=0
};
}
absorbPrimevalStone(stoneCount=1) {
if (!this.isAwakened) {
return {success:false,message:"Chưa Khai Khiếu, không thể hấp thu Nguyên Thạch!"};
}
if (this.isImmortal) {
this.immortalAperture.originCoreStability=Math.min(100,this.immortalAperture.originCoreStability + 1*stoneCount);
return {success:true,restored:0,message:`Đã ném ${stoneCount} Nguyên Thạch vào Tiên Khiếu để bồi bổ nguyên khí.`};
}
const maxCap=this.aptitude.maxSeaPercent;
if (this.currentEssence>=maxCap) {
return {success:false,message:`Biển Nguyên đã đầy ở mức giới hạn tư chất (${maxCap}%)!`};
}
const restoreByRank={1:12,2:7.5,3:4.5,4:2.5,5:1.4};
const restorePerStone=restoreByRank[this.rank]||2.0;
const totalRestore=restorePerStone*stoneCount;
const before=this.currentEssence;
this.currentEssence=Math.min(maxCap,Number((this.currentEssence + totalRestore).toFixed(1)));
return {
success:true,
restored:Number((this.currentEssence - before).toFixed(1)),
message:`Hấp thu ${stoneCount} Nguyên Thạch, khôi phục ${(this.currentEssence - before).toFixed(1)}% ${MORTAL_RANKS[this.rank].essenceName}.`
};
}
absorbPrimevalStonesToFull(player) {
if (!this.isAwakened) {
return {success:false,message:"Chưa Khai Khiếu, không thể hấp thu Nguyên Thạch!"};
}
if (this.isImmortal) {
return {success:false,message:"Cổ Tiên dùng Tiên Nguyên Thạch hoặc chờ Phúc Địa sinh Tiên Nguyên!"};
}
if (!player||player.primevalStones<=0) {
return {success:false,message:"Không còn Nguyên Thạch trong hành trang!"};
}
const maxCap=this.aptitude.maxSeaPercent;
const deficit=maxCap - this.currentEssence;
if (deficit<=0.1) {
return {success:false,message:`Biển Nguyên đã đầy ở mức giới hạn (${maxCap}%)!`};
}
const restoreByRank={1:12,2:7.5,3:4.5,4:2.5,5:1.4};
const perStone=restoreByRank[this.rank]||1.4;
const needed=Math.ceil(deficit / perStone);
const actualUse=Math.min(player.primevalStones,Math.max(1,needed));
const res=this.absorbPrimevalStone(actualUse);
if (res.success) {
player.primevalStones -=actualUse;
res.stonesUsed=actualUse;
}
return res;
}
hasLiquorWormAssist() {
const guSys=(this.game&&this.game.guSystem)||(global.vanCoTienDoGame&&global.vanCoTienDoGame.guSystem);
if (!guSys|| !Array.isArray(guSys.ownedGuList)) return false;
return guSys.ownedGuList.some(
g=>g.id==="tuu_trung_gu"&&g.isRefined&&(g.hunger===undefined||g.hunger>0)
);
}
cultivateStep(dt=5.0,externalBonus=1.0) {
if (!this.isAwakened) return {success:false};
if (this.isImmortal) {
return {
success:false,
reason:"Đã thành tựu Cổ Tiên! Hãy tích lũy Tiên Nguyên, Nhân Khí và vượt Tai Kiếp để tấn thăng tiểu cảnh giới."
};
}
const essenceNeeded=Number((3.2*dt).toFixed(1));
if (this.currentEssence<essenceNeeded) {
this.isMeditating=false;
return {
success:false,
reason:`Chân nguyên trong Biển Nguyên không đủ (cần ${essenceNeeded}%)! Hãy chờ hồi phục hoặc hấp thu Nguyên Thạch.`
};
}
this.currentEssence=Math.max(0,Number((this.currentEssence - essenceNeeded).toFixed(1)));
const hasLiquorWorm=this.hasLiquorWormAssist();
let gain=0;
if (dt>=4.5) {
gain=hasLiquorWorm
?Math.floor(50 + Math.random()*21)
:Math.floor(15 + Math.random()*8);
} else {
const perCycleAvg=hasLiquorWorm?60 :18.5;
gain=Number(((perCycleAvg / 5)*dt).toFixed(2));
}
const before=this.wallProgress;
this.wallProgress=Math.min(this.maxWallProgress,Number((this.wallProgress + gain).toFixed(1)));
if (!this.aptitude.physique) {
this.wallPressure=Math.min(100,this.wallPressure + 0.65*dt);
}
return {
success:true,
gainedXp:Number((this.wallProgress - before).toFixed(1)),
rawGain:gain,
hasLiquorWorm:hasLiquorWorm,
wallProgress:this.wallProgress,
maxWallProgress:this.maxWallProgress,
canBreakthrough:this.wallProgress>=this.maxWallProgress
};
}
attemptBreakthrough() {
if (!this.isAwakened) {
return {success:false,message:"Ngươi vẫn là phàm nhân chưa Khai Khiếu!"};
}
if (this.isImmortal) {
return {success:false,message:"Cổ Tiên tấn thăng cảnh giới bằng cách Độ Tai Kiếp trong Tiên Khiếu!"};
}
if (this.wallProgress<this.maxWallProgress) {
return {
success:false,
message:`Khiếu Bích chưa ôn dưỡng viên mãn (${Math.floor(this.wallProgress)}/${this.maxWallProgress})!`
};
}
if (this.rank===5&&this.subStage===3) {
return {
success:false,
requireAscension:true,
message:"Đã đạt Ngũ Chuyển Đỉnh Phong viên mãn! Hãy bấm nút '🌌 Phá Khiếu Thăng Tiên (Tam Khí Hợp Nhất)' bên dưới!"
};
}
const isMajorRankBreakthrough=this.subStage===3;
const reqEssence=isMajorRankBreakthrough
?Math.min(this.aptitude.maxSeaPercent,45)
:Math.min(this.aptitude.maxSeaPercent,28);
if (this.currentEssence<reqEssence) {
return {
success:false,
message:`Cần tối thiểu ${reqEssence}% Chân Nguyên trong Biển Nguyên để xung kích rào cản cảnh giới!`
};
}
let baseChance=isMajorRankBreakthrough?0.58 :0.78;
baseChance +=this.aptitude.breakthroughBonus;
baseChance +=(this.currentEssence / 100)*0.14;
baseChance -=(this.rank - 1)*0.05;
baseChance=Math.max(0.25,Math.min(0.95,baseChance));
this.currentEssence=Math.max(0,Number((this.currentEssence - reqEssence).toFixed(1)));
if (Math.random()<=baseChance) {
if (isMajorRankBreakthrough) {
this.rank +=1;
this.subStage=0;
this.humanQi +=6*this.rank;
} else {
this.subStage +=1;
this.humanQi +=2*this.rank;
}
let pressureResetNote="";
if (this.aptitude.physique) {
if (isMajorRankBreakthrough) {
this.wallPressure=0;
this._pressureWarned=false;
pressureResetNote=" Áp lực Thập Tuyệt Thể đã được reset hoàn toàn về 0%!";
}
} else {
const relief=isMajorRankBreakthrough?80 :55;
this.wallPressure=Math.max(5,this.wallPressure - relief);
if (this.wallPressure<70) this._pressureWarned=false;
}
this.wallProgress=0;
this.maxWallProgress=Math.round(
MORTAL_RANKS[this.rank].baseWallReq*MORTAL_SUBSTAGES[this.subStage].statMult
);
return {
success:true,
newRealmName:this.getRealmDisplayName(),
wallName:this.getApertureWallName(),
message:`⚡ Đột phá thành công! Cảnh giới tấn thăng lên 【${this.getRealmDisplayName()}】, Khiếu Bích ngưng tụ thành ${this.getApertureWallName()}!${pressureResetNote}`
};
} else {
this.wallProgress=Math.floor(this.maxWallProgress*0.60);
if (!this.aptitude.physique) {
this.wallPressure=Math.min(100,this.wallPressure + 18);
}
return {
success:false,
message:`Xung kích cảnh giới thất bại! Khiếu Bích chấn động dữ dội, tiến độ ôn dưỡng sụt xuống còn ${this.wallProgress}/${this.maxWallProgress}.`
};
}
}
applyYinYangRotationGu() {
if (!this.isAwakened) {
return {success:false,message:"Ngươi chưa Khai Khiếu, không thể thúc giục Âm Dương Chuyển Thân Cổ!"};
}
if (this.isImmortal) {
return {success:false,message:"Ngươi đã thành tựu Tiên Khiếu, không còn chịu áp lực bạo tạc của Thập Tuyệt Thể ở Phàm Cảnh!"};
}
if (!this.aptitude|| !this.aptitude.physique) {
this.wallPressure=5;
return {
success:true,
message:"☯ Âm Dương Chuyển Thân Cổ phát quang chuyển đổi âm dương nhục thân! Áp lực Không Khiếu đã ổn định về 5%."
};
}
if (!this.tenExtremeSealed) {
this.tenExtremeSealed=true;
this.aptitude.maxSeaPercent=90;
this.currentEssence=Math.min(90,this.currentEssence);
this.wallPressure=0;
this.pressureFreezeTimer=0;
this._pressureWarned=false;
return {
success:true,
sealed:true,
message:`☯ Âm Dương Chuyển Thân Cổ linh quang đại phóng! Âm dương đảo lộn giúp 【${this.aptitude.physique.name}】 tạm thời hạ xuống 90% Biển Nguyên (Giáp Đẳng Đỉnh Phong) — Áp lực Không Khiếu reset về 0% và NGỪNG TÍCH TỤ HOÀN TOÀN! (Dùng thêm 1 con nữa khi muốn khôi phục 100% Thập Tuyệt Thể để Thăng Tiên).`
};
} else {
this.tenExtremeSealed=false;
this.aptitude.maxSeaPercent=100;
this.currentEssence=100;
this.wallPressure=0;
this._pressureWarned=false;
return {
success:true,
sealed:false,
message:`☯ Âm Dương Chuyển Thân Cổ tái chuyển hóa! Phong ấn được giải trừ, 【${this.aptitude.physique.name}】 khôi phục 100% Biển Nguyên viên mãn (Áp lực khởi động lại từ 0%)!`
};
}
}
applyStoneApertureGu() {
if (!this.isAwakened||this.isImmortal) {
return {success:false,message:"Thạch Khiếu Cổ chỉ dùng để ổn định Phàm Khiếu (Nhất -> Ngũ Chuyển)!"};
}
const before=Number(this.wallPressure.toFixed(1));
this.wallPressure=Math.max(0,Number((this.wallPressure - 50).toFixed(1)));
if (this.wallPressure<70) this._pressureWarned=false;
return {
success:true,
message:`🪨 Thạch Khiếu Cổ hóa thạch gia cố Khiếu Bích! Áp lực Không Khiếu giảm mạnh từ ${before}% xuống còn ${this.wallPressure}% (vẫn giữ nguyên tư chất hiện tại).`
};
}
applyFreezePressureGu() {
if (!this.isAwakened||this.isImmortal) {
return {success:false,message:"Định Nguyên Tịnh Khiếu Cổ chỉ có tác dụng lên Phàm Khiếu!"};
}
const before=Number(this.wallPressure.toFixed(1));
this.wallPressure=Math.max(0,Number((this.wallPressure - 25).toFixed(1)));
this.pressureFreezeTimer=Math.max(this.pressureFreezeTimer||0,300);
if (this.wallPressure<70) this._pressureWarned=false;
return {
success:true,
message:`⏳ Định Nguyên Tịnh Khiếu Cổ kích hoạt Trụ Đạo đạo ngân! Áp lực giảm từ ${before}% xuống ${this.wallPressure}% và ĐÓNG BĂNG hoàn toàn trong 300 giây (5 phút)!`
};
}
}
ApertureSystem.MIN_ASCENSION_HUMAN_QI=MIN_ASCENSION_HUMAN_QI;
ApertureSystem.VENERABLE_REQ_DAO_MARKS=VENERABLE_REQ_DAO_MARKS;
ApertureSystem.VENERABLE_REQ_MYRIAD_TRIBULATIONS=VENERABLE_REQ_MYRIAD_TRIBULATIONS;
ApertureSystem.APTITUDE_TIERS=APTITUDE_TIERS;
ApertureSystem.TEN_EXTREME_PHYSIQUES=TEN_EXTREME_PHYSIQUES;
ApertureSystem.MORTAL_SUBSTAGES=MORTAL_SUBSTAGES;
ApertureSystem.MORTAL_RANKS=MORTAL_RANKS;
ApertureSystem.IMMORTAL_RANKS=IMMORTAL_RANKS;
ApertureSystem.BLESSED_LAND_GRADES=BLESSED_LAND_GRADES;
global.ApertureSystem=ApertureSystem;
})(window);
