(function (global) {
"use strict";

const D=global.VanCoBeastArmyData;

class BeastArmySystem {
constructor(game) {
this.game=game||null;
this.reset();
}

reset() {
this.storedBeasts=[];
this.deployedIds=[];
this.formation="guard";
this.activeUnits=[];
this.enslaveBeams=[];
this.enslaveCooldown=0;
this.armyBuffTimer=0;
this.armyBuffMult=1.0;
this.armyBuffName="";
this.selectedBeastUid=null;
this._nextUid=1;
}

getMaxSquadSlots() {
const g=this.game;
return D.getMaxSquadSlots(g?g.aperture :null,g?g.player :null);
}

getFormationInfo(mode=this.formation) {
return D.FORMATIONS[mode]||D.FORMATIONS.guard;
}

setFormation(mode,notify=true) {
if (!D.FORMATIONS[mode]) return false;
this.formation=mode;
const f=D.FORMATIONS[mode];
if (notify&&this.game&&this.game.combat&&this.game.player) {
this.game.combat.spawnFloatingText(
this.game.player.x,
this.game.player.y - 36,
`${f.icon} Lệnh Thú Triều: ${f.name}!`,
f.color
);
}
if (this.game&&this.game.ui&&typeof this.game.ui.updateBattleBeastBar==="function") {
this.game.ui.updateBattleBeastBar(true);
}
return true;
}

cycleFormation() {
const idx=D.FORMATION_ORDER.indexOf(this.formation);
const next=D.FORMATION_ORDER[(idx + 1) % D.FORMATION_ORDER.length];
this.setFormation(next,true);
return next;
}

getStoredBeast(uid) {
return this.storedBeasts.find(b=>b.uid===uid)||null;
}

getDeployedBeasts() {
return this.deployedIds.map(id=>this.getStoredBeast(id)).filter(Boolean);
}

getEnslaveGuCounts() {
const pl=this.game&&this.game.player;
const out={};
let total=0;
for (const gt of D.ENSLAVE_GU_TIERS) {
const c=pl?pl.getItemCount(gt.id) :0;
out[gt.id]=c;
total +=c;
}
out._total=total;
return out;
}

_selectBestEnslaveGuForTarget(targetRank) {
const pl=this.game&&this.game.player;
if (!pl) return null;
// Prefer the lowest-tier Nô Lệ Cổ whose maxTargetRank >= targetRank
for (const gt of D.ENSLAVE_GU_TIERS) {
if (gt.maxTargetRank>=targetRank&&pl.getItemCount(gt.id)>0) {
return gt;
}
}
// Fallback: highest-tier Nô Lệ Cổ the player currently owns
for (let i=D.ENSLAVE_GU_TIERS.length - 1;i>=0;i--) {
const gt=D.ENSLAVE_GU_TIERS[i];
if (pl.getItemCount(gt.id)>0) return gt;
}
return null;
}

_inferInitialTier(enemy) {
if (enemy.isBoss) return Math.min(4,Math.max(2,Math.floor((enemy.rank||1)*0.7)));
if (enemy.isElite) return Math.min(3,Math.max(1,Math.floor((enemy.rank||1)*0.5)));
return 0;
}

_createBeastRecordFromEnemy(enemy) {
const uid=`beast_${Date.now().toString(36)}_${this._nextUid++}`;
const tier=this._inferInitialTier(enemy);
const tierInfo=D.getTierInfo(tier);
const baseHp=Math.max(110,Math.round((enemy.maxHp||160) / Math.max(1,tierInfo.hpMult)));
const baseAtk=Math.max(14,Math.round((enemy.atk||18) / Math.max(1,tierInfo.atkMult)));
const baseDef=Math.max(8,Math.round((enemy.def||10) / Math.max(1,tierInfo.defMult)));
const rec={
uid,
typeId:enemy.typeId||"green_wolf",
name:(enemy.name||"Dị Thú").replace(/^🔥\s*\[Cuồng Bạo\]\s*/,"").replace(/\s*\(Tinh Anh\)$/,"").trim(),
icon:enemy.icon||"🐺",
color:enemy.color||"#3b6e52",
projectileColor:enemy.projectileColor||enemy.color||"#7ef7c4",
rangedGuId:enemy.rangedGuId||null,
attackRange:enemy.rangedGuId?Math.max(210,enemy.attackRange||240) :48,
radius:Math.max(13,Math.min(26,enemy.radius||16)),
rank:Math.max(1,Math.min(9,enemy.rank||1)),
tier,
level:1,
exp:0,
baseHp,
baseAtk,
baseDef,
baseSpd:Math.max(115,Math.min(220,enemy.spd||135)),
hp:100,
maxHp:100,
hunger:90,
kills:0,
capturedAt:new Date().toLocaleTimeString("vi-VN")
};
const stats=D.computeBeastStats(rec,this.game?this.game.player :null);
rec.maxHp=stats.maxHp;
rec.hp=Math.max(1,Math.round(stats.maxHp*0.75));
return rec;
}

attemptEnslaveNearestBeast() {
const g=this.game;
if (!g|| !g.player|| !g.enemies||g.currentScreen!=="battle") return false;
if (g.isBattlePaused||g.isPermadead||g.player.hp<=0) return false;
if (this.enslaveCooldown>0) return false;
if (this.storedBeasts.length>=D.MAX_STORED_BEASTS) {
if (g.combat) g.combat.spawnFloatingText(g.player.x,g.player.y - 34,"Thú Quyển đã đầy (24/24)!","#ff9f43");
return false;
}

// Find nearest capturable beast (non-human, non-venerable) within 400px
const pl=g.player;
const candidates=(g.enemies.beasts||[]).filter(b=>
!b.isDead&& !b.isHuman&& !b.isVenerable&&Math.hypot(b.x - pl.x,b.y - pl.y)<=400
);
if (candidates.length===0) {
if (g.combat) g.combat.spawnFloatingText(pl.x,pl.y - 30,"Không có Dị Thú nào trong tầm (400px)!","#b3aa9c");
return false;
}
// Prefer beast closest to cursor if close, else lowest HP% beast near player
const mx=(g.input&&typeof g.input.mouseWorldX==="number")?g.input.mouseWorldX :pl.x;
const my=(g.input&&typeof g.input.mouseWorldY==="number")?g.input.mouseWorldY :pl.y;
candidates.sort((a,b)=>{
const scoreA=Math.hypot(a.x - mx,a.y - my)*0.55 + (a.hp / Math.max(1,a.maxHp))*140;
const scoreB=Math.hypot(b.x - mx,b.y - my)*0.55 + (b.hp / Math.max(1,b.maxHp))*140;
return scoreA - scoreB;
});
const target=candidates[0];
const tRank=target.rank||1;

// Select Nô Lệ Cổ item or allow mental-only basic binding for weak Rank 1-2 beasts (<45% HP)
const guTier=this._selectBestEnslaveGuForTarget(tRank);
let usedMentalOnly=false;
if (!guTier) {
if (tRank<=2&&(target.hp / Math.max(1,target.maxHp))<=0.48) {
if (pl.mental<20) {
if (g.combat) g.combat.spawnFloatingText(pl.x,pl.y - 30,"Thiếu Tinh Thần (20) & chưa có Nô Thú Cổ!","#ff6b6b");
return false;
}
pl.mental=Math.max(0,pl.mental - 20);
usedMentalOnly=true;
} else {
if (g.combat) g.combat.spawnFloatingText(pl.x,pl.y - 34,`Cần Nô Thú Cổ (mua ở Thương Hội) hoặc đánh yếu <48% HP!`,"#ff9f43");
return false;
}
} else {
pl.consumeItem(guTier.id,1);
}

this.enslaveCooldown=1.25;
pl.triggerAttackAnimation();
const chance=D.calculateCaptureChance(target,guTier,pl,g.aperture);
const roll=Math.random();
const success=roll<=chance;
const pctLabel=Math.round(chance*100);

// Launch visible golden Soul-Chain capture tether
this.enslaveBeams.push({
x1:pl.x,y1:pl.y - 10,
x2:target.x,y2:target.y - 8,
success,
color:success?"#ffd700" :"#ff6b6b",
life:0.55,
maxLife:0.55
});

if (success) {
// Capture succeeds! Convert enemy cleanly into allied beast
target.isDead=true;
target.hp=0;
target.respawnTimer=target.isBoss?180 :60;
const rec=this._createBeastRecordFromEnemy(target);
this.storedBeasts.push(rec);

// Grant Nô Đạo path attainment EXP!
const expGain=Math.max(4,tRank*4 + (target.isBoss?12 :(target.isElite?6 :0)));
if (typeof pl.addPathAttainmentExp==="function") {
pl.addPathAttainmentExp("Nô Đạo",expGain);
}
if (g.combat) {
g.combat._spawnParticleBurst(target.x,target.y,"#ffd700",10);
g.combat.spawnFloatingText(target.x,target.y - 34,`⛓️ THU PHỤC THÀNH CÔNG: ${rec.name}! (+${expGain} Nô Đạo)`,"#ffd700");
}
if (g.ui) {
g.ui.addLog(`⛓️ [Nô Đạo] Đã thu phục thành công 【${rec.name} (${rec.rank} Chuyển)】 vào Thú Quyển! (Tỷ lệ: ${pctLabel}%, +${expGain} Lĩnh Ngộ Nô Đạo)`,"loot");
}
// Auto-deploy right into current battle if squad has an open slot!
if (this.deployedIds.length<this.getMaxSquadSlots()) {
this.deployedIds.push(rec.uid);
this._spawnActiveUnitFromRecord(rec,target.x,target.y);
}
// Still count toward normal stage kills if it wasn't a Stage Boss so player never gets stuck!
if (g.activeStage&& !target.isStageBoss&& !g.activeStage.bossSpawned) {
g.activeStage.kills +=(target.isElite?2 :1);
}
if (g.autoSaveNow) g.autoSaveNow("beast_capture");
} else {
// Capture resisted — deal a bit of soul shock & aggro target
target.aiState="chase";
target.stunTimer=Math.max(target.stunTimer||0,0.65);
if (g.combat) {
g.combat._spawnParticleBurst(target.x,target.y,"#ff6b6b",6);
g.combat.spawnFloatingText(target.x,target.y - 30,`Thu phục thất bại (${pctLabel}%) — Đánh yếu thêm!`,"#ff9f43");
}
}
if (g.ui&&typeof g.ui.updateBattleBeastBar==="function") g.ui.updateBattleBeastBar(true);
return true;
}

_spawnActiveUnitFromRecord(rec,spawnX,spawnY) {
const g=this.game;
const stats=D.computeBeastStats(rec,g?g.player :null);
rec.maxHp=stats.maxHp;
if (rec.hp<=0) return null;
rec.hp=Math.min(rec.maxHp,rec.hp);
const unit={
uid:rec.uid,
recRef:rec,
typeId:rec.typeId,
name:rec.name,
icon:rec.icon,
color:rec.color,
projectileColor:rec.projectileColor,
rangedGuId:rec.rangedGuId,
attackRange:rec.attackRange||48,
radius:Math.round((rec.radius||15)*stats.tierInfo.scale),
rank:rec.rank,
tier:rec.tier||0,
tierBadge:stats.tierInfo.badge,
tierColor:stats.tierInfo.color,
x:spawnX,
y:spawnY,
vx:0,vy:0,
hp:rec.hp,
maxHp:stats.maxHp,
atk:stats.atk,
def:stats.def,
spd:stats.spd,
attackCooldown:0.3,
hitFlashTimer:0,
isDead:false,
isAllyBeast:true,
isBoss:rec.tier>=4,
isElite:rec.tier>=1,
enraged:false,
_wRip:0
};
this.activeUnits.push(unit);
return unit;
}

deploySquadForBattle() {
this.activeUnits=[];
this.enslaveBeams=[];
this.enslaveCooldown=0;
this.armyBuffTimer=0;
this.armyBuffMult=1.0;
const g=this.game;
if (!g|| !g.player) return;
const deployed=this.getDeployedBeasts();
const count=deployed.length;
for (let i=0;i<count;i++) {
const rec=deployed[i];
if (rec.hp<=0) continue;
const ang=(Math.PI*2*i)/Math.max(1,count);
const dist=78;
let sx=g.player.x + Math.cos(ang)*dist;
let sy=g.player.y + Math.sin(ang)*dist;
if (g.map&& !g.map.isWalkable(sx,sy,14)) {sx=g.player.x;sy=g.player.y;}
this._spawnActiveUnitFromRecord(rec,sx,sy);
}
if (g.ui&&typeof g.ui.updateBattleBeastBar==="function") g.ui.updateBattleBeastBar(true);
}

recallSquadAfterBattle() {
for (const u of this.activeUnits) {
if (u.recRef) {
u.recRef.hp=Math.max(0,Math.round(u.hp));
}
}
this.activeUnits=[];
this.enslaveBeams=[];
}

applyEnslavementPathBuff(guRank=1,guName="Nô Đạo Cổ") {
if (!this.activeUnits||this.activeUnits.length===0) return false;
const g=this.game;
this.armyBuffTimer=8.5;
this.armyBuffMult=1.35 + Math.min(0.45,guRank*0.05);
this.armyBuffName=guName;
const healPct=Math.min(0.35,0.16 + guRank*0.03);
let healedAny=0;
for (const u of this.activeUnits) {
if (u.isDead) continue;
const hAmt=Math.max(12,Math.round(u.maxHp*healPct));
u.hp=Math.min(u.maxHp,u.hp + hAmt);
if (u.recRef) u.recRef.hp=Math.round(u.hp);
healedAny +=1;
}
if (healedAny>0&&g&&g.combat&&g.player) {
g.combat._spawnParticleBurst(g.player.x,g.player.y,"#ffd700",10);
g.combat.spawnFloatingText(
g.player.x,
g.player.y - 42,
`🐺 THÚ TRIỀU CUỒNG BẠO (+${Math.round((this.armyBuffMult - 1)*100)}% ATK, +${Math.round(healPct*100)}% HP)!`,
"#ffd700"
);
}
return healedAny>0;
}

_grantBeastExp(unit,expAmount) {
const rec=unit&&unit.recRef;
if (!rec) return;
rec.exp=(rec.exp||0) + expAmount;
rec.kills=(rec.kills||0) + 1;
let leveled=false;
while (rec.level<30&&rec.exp>=D.getExpForNextLevel(rec.level)) {
rec.exp -=D.getExpForNextLevel(rec.level);
rec.level +=1;
leveled=true;
}
if (leveled) {
const stats=D.computeBeastStats(rec,this.game?this.game.player :null);
rec.maxHp=stats.maxHp;
rec.hp=stats.maxHp;
unit.maxHp=stats.maxHp;
unit.hp=stats.maxHp;
unit.atk=stats.atk;
unit.def=stats.def;
unit.spd=stats.spd;
if (this.game&&this.game.combat) {
this.game.combat.spawnFloatingText(unit.x,unit.y - 34,`⬆️ ${unit.name} Lv.${rec.level}!`,"#7ef7c4");
}
}
}

update(dt) {
const g=this.game;
if (!g|| !g.player|| !g.enemies) return;
if (this.enslaveCooldown>0) this.enslaveCooldown=Math.max(0,this.enslaveCooldown - dt);
if (this.armyBuffTimer>0) {
this.armyBuffTimer=Math.max(0,this.armyBuffTimer - dt);
if (this.armyBuffTimer<=0) this.armyBuffMult=1.0;
}
for (let i=this.enslaveBeams.length - 1;i>=0;i--) {
this.enslaveBeams[i].life -=dt;
if (this.enslaveBeams[i].life<=0) this.enslaveBeams.splice(i,1);
}

const form=this.getFormationInfo();
const pl=g.player;
const enemies=g.enemies.beasts||[];
const unitCount=this.activeUnits.length;
const nowT=performance.now()*0.0018;

for (let i=0;i<unitCount;i++) {
const u=this.activeUnits[i];
if (u.isDead) continue;
if (u.attackCooldown>0) u.attackCooldown -=dt;
if (u.hitFlashTimer>0) u.hitFlashTimer -=dt;
u.enraged=(this.armyBuffTimer>0);

// 1. Find best hostile target according to current formation
let target=null;
let bestScore=Infinity;
const searchR=form.aggroRadius;
for (let ei=0;ei<enemies.length;ei++) {
const en=enemies[ei];
if (en.isDead) continue;
const dFromPlayer=Math.hypot(en.x - pl.x,en.y - pl.y);
if (dFromPlayer>searchR + 120) continue;
const dFromUnit=Math.hypot(en.x - u.x,en.y - u.y);
if (dFromUnit>searchR) continue;
let score=dFromUnit;
if (this.formation==="assault"&&en.isBoss) score -=160;
else if (this.formation==="scatter") score +=((ei % Math.max(1,unitCount))===i? -120 :40);
if (score<bestScore) {bestScore=score;target=en;}
}

const spdNow=u.spd*form.spdMult*(this.armyBuffTimer>0?1.20 :1.0);
let vx=0;let vy=0;

if (target) {
const dist=Math.hypot(target.x - u.x,target.y - u.y);
const ang=Math.atan2(target.y - u.y,target.x - u.x);
const desiredRange=u.rangedGuId?Math.min(230,u.attackRange) :(u.radius + (target.radius||16) + 12);

if (dist>desiredRange) {
vx=Math.cos(ang)*spdNow;
vy=Math.sin(ang)*spdNow;
} else if (u.attackCooldown<=0) {
u.attackCooldown=u.rangedGuId?1.05 :0.78;
const rawAtk=Math.round(u.atk*form.atkMult*this.armyBuffMult);
if (u.rangedGuId&&g.combat) {
g.combat.spawnProjectile({
owner:"player",
name:`${u.name} Cổ Thuật`,
skillRank:u.rank,
path:"Nô Đạo",
x:u.x + Math.cos(ang)*14,
y:u.y + Math.sin(ang)*14,
angle:ang,
speed:440,
maxRange:310,
radius:14,
damage:rawAtk,
color:u.projectileColor||"#7ef7c4",
pierce:1
});
} else if (g.combat) {
const wasAlive= !target.isDead;
g.combat._applyPlayerDamageToTarget(target,rawAtk,{
skillRank:u.rank,
path:"Nô Đạo",
color:u.color||"#7ef7c4",
lifesteal:0
});
if (wasAlive&&target.isDead) {
this._grantBeastExp(u,target.isBoss?45 :(target.isElite?22 :12));
}
}
}
// Enemy retaliation against melee beast (keeps battles lively & tactical!)
if (dist<(target.radius||16) + u.radius + 14&&Math.random()<0.85*dt) {
const eDmg=Math.max(2,Math.round((target.atk||12)*0.45 - u.def*form.defMult*0.45));
u.hp=Math.max(0,u.hp - eDmg);
u.hitFlashTimer=0.14;
if (u.recRef) u.recRef.hp=Math.round(u.hp);
if (u.hp<=0) {
u.isDead=true;
if (g.combat) {
g.combat._spawnParticleBurst(u.x,u.y,"#ff6b6b",8);
g.combat.spawnFloatingText(u.x,u.y - 24,`💀 ${u.name} trọng thương rút về Thú Quyển!`,"#ff8a8a");
}
}
}
} else {
// Formation positioning around Player
const slotAng=(Math.PI*2*i)/Math.max(1,unitCount) + (this.formation==="guard"?nowT*0.5 :0);
const orbitR=this.formation==="guard"?78 :(this.formation==="scatter"?185 :110);
const tx=pl.x + Math.cos(slotAng)*orbitR;
const ty=pl.y + Math.sin(slotAng)*orbitR;
const distHome=Math.hypot(tx - u.x,ty - u.y);
if (distHome>16) {
const ang=Math.atan2(ty - u.y,tx - u.x);
const catchup=distHome>340?1.45 :1.0;
vx=Math.cos(ang)*spdNow*catchup;
vy=Math.sin(ang)*spdNow*catchup;
}
}

// Soft separation between allied beasts so they form a real pack instead of stacking on 1 pixel!
for (let j=0;j<unitCount;j++) {
if (i===j) continue;
const other=this.activeUnits[j];
if (other.isDead) continue;
const dx=u.x - other.x;const dy=u.y - other.y;
const d=Math.hypot(dx,dy);
const minSep=u.radius + other.radius + 10;
if (d>0.1&&d<minSep) {
const push=(minSep - d)*3.5;
vx +=(dx / d)*push;
vy +=(dy / d)*push;
}
}

const nx=u.x + vx*dt;
const ny=u.y + vy*dt;
if (!g.map||g.map.isWalkable(nx,u.y,u.radius)) u.x=nx;
if (!g.map||g.map.isWalkable(u.x,ny,u.radius)) u.y=ny;
// Teleport catchup if beast ever got stuck too far away (>700px)
if (Math.hypot(pl.x - u.x,pl.y - u.y)>700) {
u.x=pl.x + (Math.random() - 0.5)*90;
u.y=pl.y + (Math.random() - 0.5)*90;
}
// Water ripples when beasts wade through rivers/lakes!
if (g.map&&typeof g.map.isWaterAt==="function"&&Math.hypot(vx,vy)>24) {
u._wRip=(u._wRip||0) - dt;
if (u._wRip<=0&&g.map.isWaterAt(u.x,u.y)) {
u._wRip=0.45;
g.map.spawnWaterRipple(u.x,u.y + 8,false);
}
}
}
}

// ============================================================================
// HUB MANAGEMENT ACTIONS (DEPLOY, FEED, PROMOTE, RELEASE)
// ============================================================================
toggleDeployBeast(uid) {
const rec=this.getStoredBeast(uid);
if (!rec) return {success:false,message:"Không tìm thấy Linh Thú."};
const idx=this.deployedIds.indexOf(uid);
if (idx>=0) {
this.deployedIds.splice(idx,1);
return {success:true,message:`Đã thu hồi 【${rec.name}】 về Thú Quyển.`};
}
const maxSlots=this.getMaxSquadSlots();
if (this.deployedIds.length>=maxSlots) {
return {success:false,message:`Đội hình xuất chiến đã đầy (${maxSlots}/${maxSlots})! Hãy thu hồi bớt 1 con trước.`};
}
if (rec.hp<=0) {
return {success:false,message:`【${rec.name}】 đang trọng thương (0 HP) — hãy cho ăn hồi máu trước khi xuất chiến!`};
}
this.deployedIds.push(uid);
return {success:true,message:`🐺 Đã xếp 【${rec.name}】 vào đội hình Thú Triều Xuất Chiến!`};
}

autoDeployStrongest() {
const maxSlots=this.getMaxSquadSlots();
const sorted=[...this.storedBeasts]
.filter(b=>b.hp>0)
.sort((a,b)=>(b.rank - a.rank)||(b.tier - a.tier)||(b.level - a.level));
this.deployedIds=sorted.slice(0,maxSlots).map(b=>b.uid);
return {success:true,message:`⚡ Đã tự động xếp ${this.deployedIds.length}/${maxSlots} Linh Thú mạnh nhất xuất chiến!`};
}

feedBeast(uid,itemId="ration_meat") {
const rec=this.getStoredBeast(uid);
const pl=this.game&&this.game.player;
if (!rec|| !pl) return {success:false,message:"Không tìm thấy Linh Thú."};
if (pl.getItemCount(itemId)<=0) {
return {success:false,message:"Không đủ vật phẩm trong Hành Trang!"};
}
pl.consumeItem(itemId,1);
const stats=D.computeBeastStats(rec,pl);
rec.maxHp=stats.maxHp;
const healRatio=itemId==="hundred_year_ginseng"?1.0 :(itemId==="beast_blood_core"?0.75 :0.45);
const expGain=itemId==="beast_blood_core"?60 :(itemId==="hundred_year_ginseng"?45 :20);
rec.hp=Math.min(rec.maxHp,Math.round(rec.hp + rec.maxHp*healRatio));
rec.hunger=Math.min(100,(rec.hunger||80) + 35);
rec.exp=(rec.exp||0) + expGain;
let lvUp=0;
while (rec.level<30&&rec.exp>=D.getExpForNextLevel(rec.level)) {
rec.exp -=D.getExpForNextLevel(rec.level);
rec.level +=1;
lvUp +=1;
}
if (lvUp>0) {
const ns=D.computeBeastStats(rec,pl);
rec.maxHp=ns.maxHp;
rec.hp=ns.maxHp;
}
return {
success:true,
message:`🍖 Đã cho 【${rec.name}】 ăn (+${Math.round(healRatio*100)}% HP, +${expGain} EXP${lvUp>0?`, Lên Lv.${rec.level}!` :""})!`
};
}

feedAndHealAllBeasts() {
const pl=this.game&&this.game.player;
if (!pl||this.storedBeasts.length===0) return {success:false,message:"Thú Quyển hiện chưa có Linh Thú nào!"};
let healed=0;
for (const rec of this.storedBeasts) {
const stats=D.computeBeastStats(rec,pl);
rec.maxHp=stats.maxHp;
if (rec.hp>=rec.maxHp&&(rec.hunger||100)>=90) continue;
if (pl.getItemCount("ration_meat")>0) {
pl.consumeItem("ration_meat",1);
rec.hp=rec.maxHp;
rec.hunger=100;
healed +=1;
} else if (pl.primevalStones>=12) {
pl.primevalStones -=12;
rec.hp=rec.maxHp;
rec.hunger=100;
healed +=1;
} else {
break;
}
}
if (healed===0) return {success:false,message:"Toàn đàn đã đầy máu hoặc không đủ Thịt Thú Rừng / 12💎 Nguyên Thạch!"};
return {success:true,message:`🍖 Đã hồi phục đầy đủ Sinh Mệnh & Độ No cho ${healed} Linh Thú trong Thú Quyển!`};
}

promoteBeast(uid) {
const rec=this.getStoredBeast(uid);
const pl=this.game&&this.game.player;
if (!rec|| !pl) return {success:false,message:"Không tìm thấy Linh Thú."};
const curTier=rec.tier||0;
if (curTier>=D.BEAST_TIERS.length - 1) {
return {success:false,message:"Linh Thú này đã đạt phẩm cấp tối đa (Thái Cổ Hoang Thú)!"};
}
const nextT=D.BEAST_TIERS[curTier + 1];
if ((rec.level||1)<nextT.reqLevel) {
return {success:false,message:`Cần đạt Lv.${nextT.reqLevel} để tấn thăng 【${nextT.name}】 (Hiện tại: Lv.${rec.level})!`};
}
if (pl.getItemCount("beast_blood_core")<nextT.bloodCost) {
return {success:false,message:`Thiếu Bách Thú Tinh Huyết (Cần ${nextT.bloodCost}, đang có ${pl.getItemCount("beast_blood_core")})!`};
}
if (pl.getItemCount("ration_meat")<nextT.meatCost) {
return {success:false,message:`Thiếu Thịt Thú Rừng (Cần ${nextT.meatCost}, đang có ${pl.getItemCount("ration_meat")})!`};
}
if (pl.primevalStones<nextT.stoneCost) {
return {success:false,message:`Thiếu Nguyên Thạch (Cần ${nextT.stoneCost}💎)!`};
}
pl.consumeItem("beast_blood_core",nextT.bloodCost);
pl.consumeItem("ration_meat",nextT.meatCost);
pl.primevalStones -=nextT.stoneCost;
rec.tier=curTier + 1;
rec.rank=Math.min(9,Math.max(rec.rank,rec.tier + 1));
const ns=D.computeBeastStats(rec,pl);
rec.maxHp=ns.maxHp;
rec.hp=ns.maxHp;
if (typeof pl.addPathAttainmentExp==="function") pl.addPathAttainmentExp("Nô Đạo",15 + rec.tier*10);
return {success:true,message:`👑 Tấn thăng thành công 【${rec.name}】 lên phẩm cấp 【${nextT.badge} ${nextT.name}】!`};
}

releaseBeast(uid) {
const idx=this.storedBeasts.findIndex(b=>b.uid===uid);
if (idx<0) return {success:false,message:"Không tìm thấy Linh Thú."};
const rec=this.storedBeasts[idx];
this.storedBeasts.splice(idx,1);
const dIdx=this.deployedIds.indexOf(uid);
if (dIdx>=0) this.deployedIds.splice(dIdx,1);
if (this.selectedBeastUid===uid) this.selectedBeastUid=null;
return {success:true,message:`Đã phóng sinh 【${rec.name}】 về núi rừng.`};
}

toSaveData() {
return {
storedBeasts:this.storedBeasts.map(b=>({...b})),
deployedIds:[...this.deployedIds],
formation:this.formation||"guard"
};
}

fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
if (Array.isArray(data.storedBeasts)) {
this.storedBeasts=data.storedBeasts.slice(0,D.MAX_STORED_BEASTS).map((b,i)=>({
uid:b.uid||`beast_loaded_${i + 1}`,
typeId:b.typeId||"green_wolf",
name:b.name||"Linh Thú",
icon:b.icon||"🐺",
color:b.color||"#3b6e52",
projectileColor:b.projectileColor||b.color||"#7ef7c4",
rangedGuId:b.rangedGuId||null,
attackRange:Number(b.attackRange)||48,
radius:Number(b.radius)||16,
rank:Math.max(1,Math.min(9,Number(b.rank)||1)),
tier:Math.max(0,Math.min(D.BEAST_TIERS.length - 1,Number(b.tier)||0)),
level:Math.max(1,Number(b.level)||1),
exp:Math.max(0,Number(b.exp)||0),
baseHp:Math.max(80,Number(b.baseHp)||150),
baseAtk:Math.max(10,Number(b.baseAtk)||18),
baseDef:Math.max(5,Number(b.baseDef)||10),
baseSpd:Math.max(100,Number(b.baseSpd)||135),
hp:Math.max(0,Number(b.hp)||100),
maxHp:Math.max(80,Number(b.maxHp)||150),
hunger:Math.max(0,Math.min(100,Number(b.hunger)||90)),
kills:Math.max(0,Number(b.kills)||0),
capturedAt:b.capturedAt||""
}));
}
const validSet=new Set(this.storedBeasts.map(b=>b.uid));
if (Array.isArray(data.deployedIds)) {
this.deployedIds=data.deployedIds.filter(id=>validSet.has(id)).slice(0,6);
}
if (data.formation&&D.FORMATIONS[data.formation]) {
this.formation=data.formation;
}
}
}

global.BeastArmySystem=BeastArmySystem;
})(window);
