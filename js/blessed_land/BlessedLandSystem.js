(function (global) {
"use strict";

const D=global.VanCoBlessedLandData;

class BlessedLandSystem {
constructor(game) {
this.game=game||null;
this.defenseArena=global.BlessedLandDefenseArena?new global.BlessedLandDefenseArena(this) :null;
this.explorer=global.BlessedLandExplorer?new global.BlessedLandExplorer(this) :null;
this.reset();
}

reset() {
// 5x4 grid (20 plots); center plot (row 1..2, col 2) is open or buildable; give 1 starter Spirit Spring!
this.plots=new Array(D.GRID_COLS*D.GRID_ROWS).fill(null);
this.plots[7]={typeId:"spirit_spring",level:1,beastUid:null}; // Center-ish starter Nguyên Tuyền!
this.formationLevel=1; // 1..5
this.selectedPlotIdx=7;
this.selectedBuildType="bamboo_grove";
this.storedStones=0;
this.storedImmortalStones=0;
this.storedItems={}; // { [itemId]: float_progress_or_count }
this.activeThreat=null; // { type:"thief_raid"|"calamity_siege", startedAt, deadlineSec }
this.nextThreatCooldown=210; // ~3.5 mins between periodic raids when >=2 buildings exist
this.defensesWon=0;
this.worldSeed=Math.floor(100000 + Math.random()*900000000);
this.discoveredSpecies=[];
this._accTick=0;
}

_rcToIdx(r,c) {return r*D.GRID_COLS + c;}
_idxToRC(idx) {return {r:Math.floor(idx / D.GRID_COLS),c:idx % D.GRID_COLS};}

getBuildingCount() {
let n=0;
for (let i=0;i<this.plots.length;i++) if (this.plots[i]) n +=1;
return n;
}

getPlotSynergyInfo(idx) {
const plot=this.plots[idx];
if (!plot) return {mult:1.0,links:[]};
const {r,c}=this._idxToRC(idx);
const dirs=[[-1,0],[1,0],[0,-1],[0,1]];
let bonus=0;
const links=[];
for (const [dr,dc] of dirs) {
const nr=r + dr;const nc=c + dc;
if (nr<0||nr>=D.GRID_ROWS||nc<0||nc>=D.GRID_COLS) continue;
const nIdx=this._rcToIdx(nr,nc);
const nb=this.plots[nIdx];
if (!nb) continue;
const syn=D.getPairSynergy(plot.typeId,nb.typeId);
if (syn) {
bonus +=syn.bonus;
links.push({toIdx:nIdx,name:syn.name,bonus:syn.bonus,color:syn.color});
}
// Extra +30% ecology boost if adjacent pasture actually has a living beast grazing in it!
if (nb.typeId==="beast_pasture"&&nb.beastUid) {
bonus +=0.30;
}
}
// Own pasture with a grazing beast boosts itself by +35%
if (plot.typeId==="beast_pasture"&&plot.beastUid) {
bonus +=0.35;
}
return {mult:Number((1 + bonus).toFixed(2)),links};
}

getAllSynergyEdges() {
const edges=[];
for (let r=0;r<D.GRID_ROWS;r++) {
for (let c=0;c<D.GRID_COLS;c++) {
const idx=this._rcToIdx(r,c);
const p=this.plots[idx];
if (!p) continue;
for (const [dr,dc] of [[0,1],[1,0]]) {
const nr=r + dr;const nc=c + dc;
if (nr>=D.GRID_ROWS||nc>=D.GRID_COLS) continue;
const nIdx=this._rcToIdx(nr,nc);
const nb=this.plots[nIdx];
if (!nb) continue;
const syn=D.getPairSynergy(p.typeId,nb.typeId);
if (syn) edges.push({from:idx,to:nIdx,name:syn.name,color:syn.color,bonus:syn.bonus});
}
}
}
return edges;
}

getProductionSummary() {
const ap=this.game&&this.game.aperture;
const rankScale=ap?(1 + Math.max(0,(ap.rank||1) - 1)*0.22 + (ap.isImmortal?0.6 :0)) :1.0;
let stonesPerMin=0;
let immPerMin=0;
const itemsPerMin={};
let totalSynergyCount=this.getAllSynergyEdges().length;

for (let i=0;i<this.plots.length;i++) {
const plot=this.plots[i];
if (!plot) continue;
const tpl=D.getBuildingType(plot.typeId);
if (!tpl) continue;
const syn=this.getPlotSynergyInfo(i);
const lvMult=1 + ((plot.level||1) - 1)*0.45;
const rate=tpl.baseYieldPerMin*lvMult*syn.mult*rankScale;
if (tpl.yieldType==="stones") {
stonesPerMin +=rate;
} else if (tpl.yieldType==="immortal") {
immPerMin +=rate;
} else if (tpl.itemId) {
itemsPerMin[tpl.itemId]=(itemsPerMin[tpl.itemId]||0) + rate;
}
}
return {
stonesPerMin:Number(stonesPerMin.toFixed(1)),
immPerMin:Number(immPerMin.toFixed(2)),
itemsPerMin,
totalSynergyCount
};
}

// ============================================================================
// BUILD / UPGRADE / DEMOLISH / GRAZE BEASTS
// ============================================================================
buildAtPlot(idx,typeId) {
const g=this.game;
const pl=g&&g.player;
const ap=g&&g.aperture;
if (!pl|| !ap||idx<0||idx>=this.plots.length) return {success:false,message:"Ô đất không hợp lệ."};
if (this.plots[idx]) return {success:false,message:"Ô này đã có công trình! Hãy nâng cấp hoặc tháo dỡ trước."};
const tpl=D.getBuildingType(typeId);
if (!tpl) return {success:false,message:"Không tìm thấy loại Tài Nguyên Điểm."};
if ((ap.rank||1)<tpl.reqRank) {
return {success:false,message:`Cần tu vi tối thiểu ${tpl.reqRank} Chuyển để xây dựng 【${tpl.name}】!`};
}
if (pl.primevalStones<tpl.costStones) {
return {success:false,message:`Thiếu Nguyên Thạch (Cần 💎 ${tpl.costStones.toLocaleString("vi-VN")})!`};
}
if ((tpl.costImmortal||0)>0&&(pl.immortalStones||0)<tpl.costImmortal) {
return {success:false,message:`Thiếu Tiên Nguyên Thạch (Cần 🌟 ${tpl.costImmortal})!`};
}
pl.primevalStones -=tpl.costStones;
if ((tpl.costImmortal||0)>0) pl.consumeItem("immortal_stone",tpl.costImmortal);
this.plots[idx]={typeId:tpl.id,level:1,beastUid:null};
this.selectedPlotIdx=idx;
const syn=this.getPlotSynergyInfo(idx);
const synNote=syn.links.length>0?` ✨ Kích hoạt ${syn.links.length} chuỗi sinh thái (x${syn.mult})!` :"";
if (g.autoSaveNow) g.autoSaveNow("blessed_build");
return {success:true,message:`🏡 Đã xây dựng 【${tpl.icon} ${tpl.name}】 tại Ô #${idx + 1}!${synNote}`};
}

upgradePlot(idx) {
const g=this.game;
const pl=g&&g.player;
const plot=this.plots[idx];
if (!pl|| !plot) return {success:false,message:"Ô đất trống."};
if ((plot.level||1)>=5) return {success:false,message:"Công trình này đã đạt Cấp 5 (Đỉnh Phong)!"};
const tpl=D.getBuildingType(plot.typeId);
const cost=D.getUpgradeCost(tpl,plot.level||1);
if (pl.primevalStones<cost.stones) return {success:false,message:`Thiếu Nguyên Thạch (Cần 💎 ${cost.stones.toLocaleString("vi-VN")})!`};
if (cost.immortal>0&&(pl.immortalStones||0)<cost.immortal) return {success:false,message:`Thiếu Tiên Thạch (Cần 🌟 ${cost.immortal})!`};
pl.primevalStones -=cost.stones;
if (cost.immortal>0) pl.consumeItem("immortal_stone",cost.immortal);
plot.level=(plot.level||1) + 1;
if (g.autoSaveNow) g.autoSaveNow("blessed_upgrade");
return {success:true,message:`⬆️ Nâng cấp 【${tpl.icon} ${tpl.name}】 lên Cấp ${plot.level}! (+45% tốc độ sản xuất)`};
}

demolishPlot(idx) {
const g=this.game;
const pl=g&&g.player;
const plot=this.plots[idx];
if (!pl|| !plot) return {success:false,message:"Ô đất trống."};
const tpl=D.getBuildingType(plot.typeId);
const refund=Math.round((tpl?tpl.costStones :80)*0.5);
pl.primevalStones +=refund;
this.plots[idx]=null;
if (g.autoSaveNow) g.autoSaveNow("blessed_demolish");
return {success:true,message:`🔨 Đã tháo dỡ 【${tpl?tpl.name :"Công trình"}】 và thu hồi +${refund}💎 Nguyên Thạch.`};
}

assignBeastToPasture(idx,beastUid) {
const plot=this.plots[idx];
if (!plot||plot.typeId!=="beast_pasture") return {success:false,message:"Chỉ có thể thả Dị Thú vào ô Bãi Chăn Dị Thú!"};
if (!beastUid) {
plot.beastUid=null;
return {success:true,message:"Đã thu hồi Dị Thú khỏi bãi chăn nuôi."};
}
const army=this.game&&this.game.beastArmy;
const rec=army?army.getStoredBeast(beastUid) :null;
if (!rec) return {success:false,message:"Không tìm thấy Linh Thú này trong Thú Quyển!"};
// Remove beast from any other pasture first
for (const p of this.plots) {
if (p&&p.beastUid===beastUid) p.beastUid=null;
}
plot.beastUid=beastUid;
if (this.game&&this.game.autoSaveNow) this.game.autoSaveNow("blessed_beast");
return {success:true,message:`🐺 Đã thả 【${rec.icon} ${rec.name}】 vào Phúc Địa! Thú sẽ tự tăng EXP, buff +30% cho các ô xung quanh và trực tiếp tham chiến phòng thủ!`};
}

upgradeDefenseFormation() {
const g=this.game;
const pl=g&&g.player;
if (!pl) return {success:false,message:"Hệ thống chưa sẵn sàng."};
if (this.formationLevel>=5) return {success:false,message:"Trận Pháp Hộ Địa đã đạt Cấp 5 (Tối Thượng)!"};
const cost=D.getFormationUpgradeCost(this.formationLevel);
if (pl.primevalStones<cost.stones) return {success:false,message:`Thiếu Nguyên Thạch (Cần 💎 ${cost.stones.toLocaleString("vi-VN")})!`};
if (cost.immortal>0&&(pl.immortalStones||0)<cost.immortal) return {success:false,message:`Thiếu Tiên Thạch (Cần 🌟 ${cost.immortal})!`};
pl.primevalStones -=cost.stones;
if (cost.immortal>0) pl.consumeItem("immortal_stone",cost.immortal);
this.formationLevel +=1;
if (g.autoSaveNow) g.autoSaveNow("blessed_formation");
return {success:true,message:`🛡️ Đã cường hóa Trận Pháp Hộ Địa lên Cấp ${this.formationLevel}! (+30% HP Địa Linh Trụ & tăng hỏa lực Tháp Trận)`};
}

collectAllYield() {
const g=this.game;
const pl=g&&g.player;
if (!pl) return {success:false,message:"Hệ thống chưa sẵn sàng."};
const wholeStones=Math.floor(this.storedStones||0);
const wholeImm=Math.floor(this.storedImmortalStones||0);
const collectedLabels=[];

if (wholeStones>0) {
pl.primevalStones +=wholeStones;
this.storedStones -=wholeStones;
collectedLabels.push(`+${wholeStones.toLocaleString("vi-VN")}💎 Nguyên Thạch`);
}
if (wholeImm>0) {
pl.addItem("immortal_stone",wholeImm);
this.storedImmortalStones -=wholeImm;
collectedLabels.push(`+${wholeImm}🌟 Tiên Thạch`);
}
const itemDb=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
for (const [itemId,val] of Object.entries(this.storedItems||{})) {
const whole=Math.floor(val||0);
if (whole>0) {
pl.addItem(itemId,whole);
this.storedItems[itemId]=val - whole;
const meta=itemDb[itemId]||{name:itemId,icon:"📦"};
collectedLabels.push(`+${whole}x ${meta.icon} ${meta.name}`);
}
}
if (collectedLabels.length===0) {
return {success:false,message:"Sản vật trong Phúc Địa đang tích tụ — hãy chờ thêm một chút hoặc xây thêm Tài Nguyên Điểm!"};
}
if (g.autoSaveNow) g.autoSaveNow("blessed_collect");
return {success:true,message:`🌾 [Thu Hoạch Phúc Địa] Đã thu về: ${collectedLabels.join(", ")}!`};
}

// ============================================================================
// REAL-TIME TICK (PASSIVE ECOLOGY PRODUCTION + GRAZING BEASTS + THREAT TIMER)
// ============================================================================
update(dt) {
const g=this.game;
if (!g|| !g.player||g.isPermadead) return;
const bCount=this.getBuildingCount();
if (bCount<=0) return;

// Accumulate ecology yields smoothly every 1 second
this._accTick +=dt;
if (this._accTick>=1.0) {
const stepSec=this._accTick;
this._accTick=0;
const prod=this.getProductionSummary();
const minFrac=stepSec / 60;
const capStones=Math.max(400,(g.aperture?g.aperture.rank :1)*650);

this.storedStones=Math.min(capStones,(this.storedStones||0) + prod.stonesPerMin*minFrac);
if (prod.immPerMin>0) {
this.storedImmortalStones=Math.min(20,(this.storedImmortalStones||0) + prod.immPerMin*minFrac);
}
for (const [itemId,perMin] of Object.entries(prod.itemsPerMin)) {
const cur=this.storedItems[itemId]||0;
this.storedItems[itemId]=Math.min(25,cur + perMin*minFrac);
}

// Passive healing & EXP for beasts grazing in Pastures!
const army=g.beastArmy;
if (army) {
for (const p of this.plots) {
if (p&&p.typeId==="beast_pasture"&&p.beastUid) {
const rec=army.getStoredBeast(p.beastUid);
if (rec) {
const bData=global.VanCoBeastArmyData;
const st=bData?bData.computeBeastStats(rec,g.player) :{maxHp:rec.maxHp||150};
rec.maxHp=st.maxHp;
if (rec.hp<rec.maxHp) rec.hp=Math.min(rec.maxHp,Math.round(rec.hp + rec.maxHp*0.04));
rec.exp=(rec.exp||0) + Math.max(1,Math.round((p.level||1)*1.2));
if (bData&&rec.level<30&&rec.exp>=bData.getExpForNextLevel(rec.level)) {
rec.exp -=bData.getExpForNextLevel(rec.level);
rec.level +=1;
const ns=bData.computeBeastStats(rec,g.player);
rec.maxHp=ns.maxHp;rec.hp=ns.maxHp;
}
} else {
p.beastUid=null;
}
}
}
}

// Periodic Raid / Calamity Threat Logic (only when >=2 buildings built & not currently inside defense)
if (!this.activeThreat&&bCount>=2&& !(this.defenseArena&&this.defenseArena.active)) {
this.nextThreatCooldown -=stepSec;
if (this.nextThreatCooldown<=0) {
this.nextThreatCooldown=220 + Math.random()*80;
const isImm=Boolean(g.aperture&&g.aperture.isImmortal);
const rType=(Math.random()<(isImm?0.52 :0.35))?"calamity_siege" :"thief_raid";
this.triggerThreatAlert(rType);
}
} else if (this.activeThreat&& !(this.defenseArena&&this.defenseArena.active)) {
this.activeThreat.deadlineSec -=stepSec;
if (this.activeThreat.deadlineSec<=0) {
// Player ignored the raid -> thieves steal 40% of uncollected yield!
const stolenStones=Math.round((this.storedStones||0)*0.40);
this.storedStones=Math.max(0,(this.storedStones||0) - stolenStones);
for (const k of Object.keys(this.storedItems)) {
this.storedItems[k]=Math.max(0,(this.storedItems[k]||0)*0.65);
}
const tInfo=D.RAID_TYPES[this.activeThreat.type]||D.RAID_TYPES.thief_raid;
this.activeThreat=null;
if (g.ui) {
g.ui.addLog(`⚠️ [Phúc Địa Bị Tổn Thất] Không kịp về phòng thủ ${tInfo.name}! Bị tổn thất -${stolenStones}💎 & 35% sản vật chưa thu hoạch!`,"danger");
}
this._syncSidebarAlertBadge();
}
}
}
}

triggerThreatAlert(raidType="thief_raid") {
const info=D.RAID_TYPES[raidType]||D.RAID_TYPES.thief_raid;
this.activeThreat={type:info.id,deadlineSec:180};
const g=this.game;
if (g&&g.ui) {
g.ui.addLog(`🚨 [CẢNH BÁO PHÚC ĐỊA] ${info.icon} ${info.name}! Hãy mở tab 【🏡 Phúc Địa & Sinh Thái】 để dịch chuyển về trực tiếp chiến đấu bảo vệ cơ nghiệp!`,"danger");
}
this._syncSidebarAlertBadge();
}

markSpeciesDiscovered(speciesId) {
if (!speciesId) return false;
if (!Array.isArray(this.discoveredSpecies)) this.discoveredSpecies=[];
if (this.discoveredSpecies.includes(speciesId)) return false;
this.discoveredSpecies.push(speciesId);
if (this.game&&this.game.autoSaveNow) this.game.autoSaveNow("blessed_species");
return true;
}
regenerateWorldSeed() {
this.worldSeed=Math.floor(100000 + Math.random()*900000000);
if (this.game&&this.game.autoSaveNow) this.game.autoSaveNow("blessed_seed_reroll");
return this.worldSeed;
}
openExplorer() {
if (!this.explorer) return {success:false,message:"Chưa nạp chế độ khám phá Phúc Địa."};
this.explorer.open();
return {success:true};
}
startDefenseBattle(forcedType=null) {
if (!this.defenseArena) return {success:false,message:"Hệ thống phòng thủ chưa sẵn sàng."};
const rType=forcedType||(this.activeThreat?this.activeThreat.type :"thief_raid");
this.defenseArena.open(rType);
return {success:true};
}

onDefenseCompleted(result) {
const g=this.game;
const pl=g&&g.player;
const ap=g&&g.aperture;
if (!pl) return;
const rank=(ap&&ap.rank)?ap.rank :1;
const rInfo=D.RAID_TYPES[result.raidType]||D.RAID_TYPES.thief_raid;

if (result.success) {
this.activeThreat=null;
this.defensesWon +=1;
const bonusStones=Math.round((130 + rank*125)*(1 + this.getBuildingCount()*0.08));
const daoGain=Math.round(18 + rank*14);
pl.primevalStones +=bonusStones;
if (typeof pl.addPathAttainmentExp==="function") pl.addPathAttainmentExp(pl.mainPath||"Luyện Đạo",daoGain);
if (ap&&ap.isImmortal) {
pl.addDaoMarks(pl.mainPath||"Luyện Đạo",daoGain*3);
if (ap.immortalAperture) ap.immortalAperture.spaceAcres=(ap.immortalAperture.spaceAcres||2500) + 180;
}
if (ap) ap.humanQi +=Math.round(10 + rank*4);
const dropItem=rank>=6?"immortal_stone" :(result.raidType==="calamity_siege"?"soul_crystal" :"remnant_recipe");
pl.addItem(dropItem,1);
const meta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[dropItem])||{name:dropItem,icon:"📦"};

const rewardLine=`+${bonusStones.toLocaleString("vi-VN")}💎 Nguyên Thạch • +${daoGain} Lĩnh Ngộ • 1x ${meta.icon} ${meta.name}`;
if (g.ui) g.ui.addLog(`🏆 [PHÒNG THỦ PHÚC ĐỊA THÀNH CÔNG] Đã đẩy lùi ${rInfo.name}! Bảo toàn 100% sản vật & thưởng: ${rewardLine}!`,"loot");
if (g.autoSaveNow) g.autoSaveNow("blessed_defense_win");
this._syncSidebarAlertBadge();
return rewardLine;
} else {
// Partial loss if core fell
const lostStones=Math.round((this.storedStones||0)*0.30);
this.storedStones=Math.max(0,(this.storedStones||0) - lostStones);
this.activeThreat=null;
if (g.ui) g.ui.addLog(`💥 [Địa Linh Trụ Thất Thủ] Địch cướp mất ${lostStones}💎 chưa thu hoạch trước khi rút lui. Hãy nâng cấp Trận Pháp Hộ Địa & thả thêm Linh Thú giữ nhà!`,"warning");
this._syncSidebarAlertBadge();
return `Tổn thất -${lostStones}💎 chưa thu hoạch (các công trình vẫn được Địa Linh bảo toàn).`;
}
}

_syncSidebarAlertBadge() {
const badge=document.getElementById("bl-sidebar-alert-dot");
if (!badge) return;
badge.classList.toggle("hidden",!this.activeThreat);
}

toSaveData() {
return {
plots:this.plots.map(p=>p?{...p} :null),
formationLevel:this.formationLevel,
storedStones:Number((this.storedStones||0).toFixed(2)),
storedImmortalStones:Number((this.storedImmortalStones||0).toFixed(2)),
storedItems:{...this.storedItems},
defensesWon:this.defensesWon,
worldSeed:this.worldSeed,
discoveredSpecies:Array.isArray(this.discoveredSpecies)?[...this.discoveredSpecies] :[]
};
}

fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
if (Array.isArray(data.plots)&&data.plots.length===D.GRID_COLS*D.GRID_ROWS) {
this.plots=data.plots.map(p=>{
if (!p||typeof p!=="object"|| !D.getBuildingType(p.typeId)) return null;
return {
typeId:p.typeId,
level:Math.max(1,Math.min(5,Math.floor(Number(p.level)||1))),
beastUid:p.beastUid||null
};
});
}
this.formationLevel=Math.max(1,Math.min(5,Math.floor(Number(data.formationLevel)||1)));
this.storedStones=Math.max(0,Number(data.storedStones)||0);
this.storedImmortalStones=Math.max(0,Number(data.storedImmortalStones)||0);
if (data.storedItems&&typeof data.storedItems==="object") {
this.storedItems={...data.storedItems};
}
this.defensesWon=Math.max(0,Math.floor(Number(data.defensesWon)||0));
this.worldSeed=(Number.isFinite(Number(data.worldSeed))&&Number(data.worldSeed)>0)?Math.floor(Number(data.worldSeed)) :Math.floor(100000 + Math.random()*900000000);
this.discoveredSpecies=Array.isArray(data.discoveredSpecies)?data.discoveredSpecies.filter(x=>typeof x==="string") :[];
this._syncSidebarAlertBadge();
}
}

global.BlessedLandSystem=BlessedLandSystem;
})(window);
