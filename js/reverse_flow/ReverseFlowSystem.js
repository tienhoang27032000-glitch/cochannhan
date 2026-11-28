(function (global) {
"use strict";

const D=global.VanCoReverseFlowData;

class ReverseFlowSystem {
constructor(game) {
this.game=game||null;
this.arena=global.ReverseFlowArena?new global.ReverseFlowArena(this) :null;
this.reset();
}

reset() {
this.bestFloor=0;
this.totalRuns=0;
this.totalFloorsCleared=0;
this.claimedMilestones=[];
}

startRun() {
if (!this.arena) return {success:false,message:"Hệ thống Nghịch Lưu Hà chưa sẵn sàng."};
this.arena.open();
return {success:true};
}

recordAndPayRun(summary) {
const g=this.game;
const pl=g&&g.player;
const ap=g&&g.aperture;
const fc=Math.max(0,Math.floor(summary.floorsCleared||0));
this.totalRuns +=1;
this.totalFloorsCleared +=fc;
const isNewRecord=(fc>this.bestFloor);
if (isNewRecord) this.bestFloor=fc;

const stones=Math.max(0,Math.round(summary.bankedStones||0));
const daoExp=Math.max(0,Math.round(summary.bankedDaoExp||0));
const merit=Math.max(0,Math.round(summary.bankedMerit||0));
const parts=[];
if (pl) {
if (stones>0) {pl.primevalStones +=stones;parts.push(`+${stones.toLocaleString("vi-VN")}💎`);}
if (merit>0) {pl.meritPoints=(pl.meritPoints||0) + merit;parts.push(`+${merit}🏅`);}
if (daoExp>0) {
const mp=pl.mainPath||"Thủy Đạo";
pl.addPathAttainmentExp(mp,daoExp);
if (ap&&ap.isImmortal) pl.addDaoMarks(mp,daoExp*2);
parts.push(`+${daoExp} Lĩnh Ngộ (${mp})`);
}
if (ap&&fc>0) {
const qi=fc*3;
ap.humanQi +=qi;
parts.push(`+${qi} Nhân Khí`);
}
}

// Auto-grant any newly unlocked Milestone Rewards!
const newMilestones=[];
for (const m of D.MILESTONES) {
if (fc>=m.floor&& !this.claimedMilestones.includes(m.floor)) {
this.claimedMilestones.push(m.floor);
newMilestones.push(m);
if (pl) {
pl.primevalStones +=m.stones;
pl.meritPoints=(pl.meritPoints||0) + m.merit;
if (m.itemId) pl.addItem(m.itemId,m.itemQty||1);
}
}
}
if (newMilestones.length>0) {
parts.push(`🏆 Mốc Kỷ Lục: ${newMilestones.map(m=>m.title).join(", ")}!`);
}

const rewardLine=parts.length>0?`✨ Thu Hoạch: ${parts.join(" • ")}` :"Chưa vượt qua tầng nào — hãy thử lại!";
if (g&&g.ui) {
g.ui.addLog(`🌊 [Nghịch Lưu Hà Vô Tận] Vượt ${fc} tầng${isNewRecord?" (KỶ LỤC MỚI!)" :""} — ${rewardLine}`,fc>0?"loot" :"system");
}
if (g&&g.autoSaveNow) g.autoSaveNow("reverse_flow_end");
return {isNewRecord,rewardLine,newMilestones};
}

toSaveData() {
return {
bestFloor:this.bestFloor,
totalRuns:this.totalRuns,
totalFloorsCleared:this.totalFloorsCleared,
claimedMilestones:[...this.claimedMilestones]
};
}

fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
this.bestFloor=Math.max(0,Math.floor(Number(data.bestFloor)||0));
this.totalRuns=Math.max(0,Math.floor(Number(data.totalRuns)||0));
this.totalFloorsCleared=Math.max(0,Math.floor(Number(data.totalFloorsCleared)||0));
if (Array.isArray(data.claimedMilestones)) {
this.claimedMilestones=data.claimedMilestones.map(Number).filter(n=>Number.isFinite(n));
}
}
}

global.ReverseFlowSystem=ReverseFlowSystem;
})(window);
