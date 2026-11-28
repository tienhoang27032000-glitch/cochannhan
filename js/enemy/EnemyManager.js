(function (global) {
"use strict";
const {VENERABLE_MAX_SINGLE_HIT_DAMAGE,VENERABLE_MAX_KILLER_MOVE_DAMAGE,VENERABLE_MAX_REFLECT_DAMAGE,BEAST_TEMPLATES,INITIAL_FACTIONS,INITIAL_NPCS}=global.VanCoEnemyData;
class EnemyManager {
constructor() {
this.map=null;
this.player=null;
this.guSystem=null;
this.ui=null;
this.beasts=[];
this.npcs=[];
this.factions=[];
this.quests=[];
this.nextBeastId=1;
this.worldSimulationTimer=0;
this.marketFluctuationFactor=1.0;
this.reset();
}
init(systems) {
this.map=systems.map||null;
this.player=systems.player||null;
this.guSystem=systems.guSystem||null;
this.ui=systems.ui||null;
}
reset() {
this.beasts=[];
this.npcs=[];
this.factions=JSON.parse(JSON.stringify(INITIAL_FACTIONS));
this.quests=this._createInitialQuests();
this.nextBeastId=1;
this.worldSimulationTimer=25;
this.marketFluctuationFactor=1.0;
this._spawnInitialBeasts();
this._spawnInitialNpcs();
}
_createInitialQuests() {
return [
{
id:"q_hunt_wolves",
title:"Thanh Trừ Dã Thú Quanh Chiến Trường",
category:"Chính Đạo",
type:"kill_beast",
progress:0,
target:5,
completed:false,
rewardStones:35,
rewardHumanQi:8,
rewardText:"35 Nguyên Thạch + 8 Nhân Khí + Hảo cảm Cổ Nguyệt Sơn Trại",
description:"Đàn dã thú và cổ sư địch đang uy hiếp chiến trường. Hãy tiêu diệt 5 mục tiêu trong ải."
},
{
id:"q_gather_resources",
title:"Tích Lũy Tư Lương Tu Luyện",
category:"Trung Lập",
type:"harvest_node",
progress:0,
target:4,
completed:false,
rewardStones:25,
rewardHumanQi:5,
rewardText:"25 Nguyên Thạch + 5 Nhân Khí + 1x Nguyệt Lan Hoa",
description:"Đến các mỏ khoáng hoặc bụi thảo dược rải rác trên bản đồ, nhấn phím [E] khai thác 4 lần tài nguyên."
},
{
id:"q_slay_beast_king",
title:"Trảm Sát Thủ Lĩnh Chinh Phạt",
category:"Cơ Duyên",
type:"kill_boss",
progress:0,
target:1,
completed:false,
rewardStones:80,
rewardHumanQi:20,
rewardText:"80 Nguyên Thạch + 20 Nhân Khí + 1x Đãng Hồn Thạch Đan",
description:"Đánh bại một Thủ Lĩnh Ải (Bách Thú Vương, Tộc Trưởng, Cổ Tiên hoặc Tôn Giả) trong Bản Đồ Lịch Luyện."
}
];
}
_spawnInitialBeasts() {
this.beasts=[];
const regions=(global.MapManager&&global.MapManager.WORLD_REGIONS)||[];
for (const reg of regions) {
if (reg.id==="trade_city") continue;
const matchingTemplates=Object.values(BEAST_TEMPLATES).filter(
t=>t.regions.includes(reg.id)
);
if (matchingTemplates.length===0) continue;
const count=reg.id==="clan_territory"?2 :5;
for (let i=0;i<count;i++) {
const tpl=matchingTemplates[i % matchingTemplates.length];
const bx=Math.round(reg.x + 80 + Math.random()*(reg.width - 160));
const by=Math.round(reg.y + 80 + Math.random()*(reg.height - 160));
this._createBeastEntity(tpl,bx,by,reg.id);
}
}
}
_createBeastEntity(tpl,x,y,regionId) {
const beast={
id:`beast_${this.nextBeastId++}`,
entityType:"beast",
typeId:tpl.typeId,
name:tpl.name,
title:tpl.title,
icon:tpl.icon,
rank:tpl.rank,
isBoss:Boolean(tpl.isBoss),
isElite:false,
isHuman:false,
isVenerable:false,
x:x,
y:y,
spawnX:x,
spawnY:y,
regionId:regionId,
radius:tpl.isBoss?20 :14,
hp:tpl.hp,
maxHp:tpl.hp,
shieldHp:0,
maxShieldHp:0,
atk:tpl.atk,
def:tpl.def,
spd:tpl.spd,
aggroRange:tpl.aggroRange,
attackRange:tpl.attackRange,
rangedGuId:tpl.rangedGuId||null,
projectileColor:tpl.projectileColor||"#5cc995",
color:tpl.color,
drops:tpl.drops||[],
aiState:"patrol",
patrolTargetX:x,
patrolTargetY:y,
patrolTimer:2 + Math.random()*4,
attackCooldown:0,
dashSkillCooldown:4 + Math.random()*4,
slowTimer:0,
slowFactor:1.0,
calledAllies:false,
isHostile:true,
isDead:false,
respawnTimer:0
};
this.beasts.push(beast);
return beast;
}
_spawnInitialNpcs() {
this.npcs=INITIAL_NPCS.map(cfg=>this._hydrateNpcObject({...cfg}));
}
_hydrateNpcObject(npcData) {
const npc={
...npcData,
entityType:"npc",
radius:14,
isDead:Boolean(npcData.isDead),
isHostile:Boolean(npcData.isHostile),
lethalCombat:Boolean(npcData.lethalCombat),
aiState:npcData.aiState||"idle",
aiStateText:npcData.aiStateText||"Đang tuần tra lãnh địa",
aiTimer:3 + Math.random()*5,
targetX:npcData.x,
targetY:npcData.y,
attackCooldown:0,
slowTimer:0,
slowFactor:1.0,
respawnTimer:npcData.respawnTimer||0
};
npc.getGreetingDialogue=(player)=>{
if (npc.relation>=30) {
return `Đạo hữu ${player?player.name :""} đến thật đúng lúc! Gần đây thiên địa linh khí biến động, ta vừa thu thập được ít cổ tài thượng hạng.`;
}
if (npc.relation<0) {
return `Hừ, khí tức trên người ngươi đầy mùi máu tanh. Nếu không có việc giao dịch bằng Nguyên Thạch thì chớ lại gần ta!`;
}
return `Tại hạ là ${npc.name} thuộc ${npc.factionName}. Thế giới Cổ Sư cá lớn nuốt cá bé, muốn sống sót thì phải không ngừng thăng Chuyển Cổ Trùng và Sát Chiêu.`;
};
npc.becomeHostile=(isLethal=false)=>{
npc.isHostile=true;
npc.lethalCombat=Boolean(isLethal);
npc.aiState="combat";
npc.aiStateText=isLethal?"Đang tử chiến với ngươi!" :"Đang tỷ thí cổ thuật";
if (isLethal) {
npc.relation=Math.min(-50,npc.relation - 60);
}
};
return npc;
}
update(dt,player,mapManager,combatSystem) {
for (const beast of this.beasts) {
if (beast.isDead) {
beast.respawnTimer -=dt;
if (beast.respawnTimer<=0) {
beast.isDead=false;
beast.hp=beast.maxHp;
beast.shieldHp=0;
beast.x=beast.spawnX;
beast.y=beast.spawnY;
beast.aiState="patrol";
beast.calledAllies=false;
}
continue;
}
if (beast.isHuman) {
this._updateHumanCultivatorAI(beast,dt,player,mapManager,combatSystem);
} else {
this._updateBeastAI(beast,dt,player,mapManager,combatSystem);
}
}
for (const npc of this.npcs) {
if (npc.isDead) {
npc.respawnTimer -=dt;
if (npc.respawnTimer<=0) {
npc.isDead=false;
npc.isHostile=false;
npc.hp=npc.maxHp;
npc.x=npc.homeX;
npc.y=npc.homeY;
npc.aiState="cultivate";
npc.aiStateText="Vừa bình phục thương thế";
}
continue;
}
this._updateNpcAI(npc,dt,player,mapManager,combatSystem);
}
this.worldSimulationTimer -=dt;
if (this.worldSimulationTimer<=0) {
this.worldSimulationTimer=45;
this._simulateWorldAndFactions();
}
}
_getEnemyRealmPressureMult(attacker,player) {
if (!attacker|| !player|| !player.aperture) return 1.0;
const eRank=attacker.rank||1;
const pRank=player.aperture.rank||1;
if (eRank<=pRank) return 1.0;
const diff=eRank - pRank;
let mult=1 + diff*0.30;
if (eRank>=6&&pRank<=5) mult*=2.2;
return mult;
}
_computeBossEffectiveDamage(boss,player,scaleMult=1.0,isKillerMove=false) {
const isVen=Boolean(boss.isVenerable);
const enrageMult=boss.enraged?1.25 :1.0;
const realmPressure=this._getEnemyRealmPressureMult(boss,player);
const rawDmg=Math.round((boss.atk||100)*scaleMult*enrageMult*realmPressure);
if (isVen) {
const maxCap=isKillerMove
?VENERABLE_MAX_KILLER_MOVE_DAMAGE
:VENERABLE_MAX_SINGLE_HIT_DAMAGE;
return Math.min(rawDmg,maxCap);
}
return rawDmg;
}
_updateHumanCultivatorAI(boss,dt,player,mapManager,combatSystem) {
const isVen=Boolean(boss.isVenerable);
if (boss.staggeredTimer&&boss.staggeredTimer>0) {
boss.staggeredTimer=Math.max(0,boss.staggeredTimer - dt);
return;
}
if (boss.isStageBoss&& !boss.phase2Triggered&&boss.hp>0&&boss.hp<=boss.maxHp*0.52) {
boss.phase2Triggered=true;
const sh=Math.round(boss.maxHp*0.14);
boss.shieldHp=Math.max(boss.shieldHp||0,sh);
if (combatSystem) {
combatSystem.triggerScreenShake(8,0.28);
combatSystem.spawnFloatingText(boss.x,boss.y - 48,`⚡ GIAI ĐOẠN 2: 【${boss.name}】 GIẢI PHÓNG SÁT CHIÊU!`,"#ffd700");
}
if (this.ui) {
this.ui.addLog(`⚠️ Thủ Lĩnh 【${boss.name}】 tiến vào GIAI ĐOẠN 2 — Tốc độ xuất chiêu tăng mạnh & triển khai liên hoàn trận!`,"danger");
}
}
if ((boss.isStageBoss||boss.isElite)&& !boss.enraged&&boss.hp>0&&boss.hp<=boss.maxHp*0.35) {
boss.enraged=true;
if (combatSystem) {
combatSystem.spawnFloatingText(boss.x,boss.y - 42,"🔥 CUỒNG BẠO ĐẠO CƠ (+25% SÁT LỰC)!","#ff4d4d");
}
}
const cdSpeedMult=boss.enraged?(isVen?1.45 :1.28) :1.0;
if (boss.attackCooldown>0) boss.attackCooldown -=dt*cdSpeedMult;
if (boss.guSkillCooldown>0) boss.guSkillCooldown -=dt*cdSpeedMult;
if (boss.defGuCooldown>0) boss.defGuCooldown -=dt*cdSpeedMult;
if (boss.moveGuCooldown>0) boss.moveGuCooldown -=dt*cdSpeedMult;
if (boss.healGuCooldown>0) boss.healGuCooldown -=dt*cdSpeedMult;
if (boss.killerMoveCooldown>0) boss.killerMoveCooldown -=dt*cdSpeedMult;
if (boss.slowTimer>0) {
boss.slowTimer -=dt;
if (boss.slowTimer<=0) boss.slowFactor=1.0;
}
if (!player||player.hp<=0) return;
const effectiveSpd=boss.spd*boss.slowFactor*(boss.enraged?1.25 :1.0);
const distToPlayer=Math.hypot(player.x - boss.x,player.y - boss.y);
const angleToPlayer=Math.atan2(player.y - boss.y,player.x - boss.x);
if (boss.telegraphState) {
if (isVen&&boss.telegraphState.timer>boss.telegraphState.maxTimer*0.35) {
boss.telegraphState.x +=(player.x - boss.telegraphState.x)*dt*3.2;
boss.telegraphState.y +=(player.y - boss.telegraphState.y)*dt*3.2;
}
boss.telegraphState.timer -=dt;
if (boss.telegraphState.timer<=0) {
const ts=boss.telegraphState;
boss.telegraphState=null;
this._executeBossKillerMoveImpact(boss,ts,player,combatSystem);
}
return;
}
if (distToPlayer>(boss.aggroRange||560)*1.4&& !boss.isStageBoss) {
boss.patrolTimer=(boss.patrolTimer||0) - dt;
if (boss.patrolTimer<=0) {
boss.patrolTimer=3 + Math.random()*4;
boss.patrolTargetX=boss.spawnX + (Math.random() - 0.5)*420;
boss.patrolTargetY=boss.spawnY + (Math.random() - 0.5)*420;
}
const dPatrol=Math.hypot(boss.patrolTargetX - boss.x,boss.patrolTargetY - boss.y);
if (dPatrol>16) {
const pAng=Math.atan2(boss.patrolTargetY - boss.y,boss.patrolTargetX - boss.x);
this._moveEntity(boss,Math.cos(pAng)*effectiveSpd*0.55,Math.sin(pAng)*effectiveSpd*0.55,dt,mapManager);
}
return;
}
if (boss.isStageBoss||boss.isElite) {
const shieldTriggerHpRatio=isVen?0.95 :0.85;
if (
(!boss.shieldHp||boss.shieldHp<=0)&&
boss.hp<=boss.maxHp*shieldTriggerHpRatio&&
(boss.defGuCooldown||0)<=0
) {
boss.defGuCooldown=isVen?10.5 :(boss.isStageBoss?13.0 :16.0);
const shieldPct=isVen?0.22 :(boss.rank>=6?0.16 :0.14);
const shieldVal=Math.round(boss.maxHp*shieldPct);
boss.shieldHp=shieldVal;
boss.maxShieldHp=shieldVal;
const defGuName=boss.defGuName||(isVen?"Cửu Chuyển Vạn Pháp Bất Xâm Ấn" :"Kim Chung Phòng Ngự Cổ");
if (combatSystem) {
combatSystem.spawnFloatingText(boss.x,boss.y - 34,`🛡️ ${defGuName} (+${shieldVal})`,"#ffd700");
}
}
}
if (boss.isStageBoss) {
const maxHeals=isVen?2 :1;
boss.healsUsed=boss.healsUsed||0;
if (
boss.hp<boss.maxHp*0.45&&
boss.healsUsed<maxHeals&&
(boss.healGuCooldown||0)<=0
) {
boss.healsUsed +=1;
boss.healGuCooldown=isVen?14.0 :18.0;
const healVal=Math.round(boss.maxHp*(isVen?0.15 :0.14));
boss.hp=Math.min(boss.maxHp,boss.hp + healVal);
const healName=isVen
?"Cửu Chuyển Sát Chiêu: Vạn Kiếp Trường Sinh Nguyên"
:(boss.rank>=6?"Tiên Nguyên Bảo Liên Cổ" :"Xuân Quang Trị Liệu Cổ");
if (combatSystem) {
combatSystem.spawnFloatingText(boss.x,boss.y - 38,`💚 ${healName} (+${healVal.toLocaleString("vi-VN")} HP)`,"#4cd964");
}
}
}
if ((boss.isStageBoss||boss.isElite)&&(boss.moveGuCooldown||0)<=0&&distToPlayer<600) {
boss.moveGuCooldown=isVen?4.5 :(boss.isStageBoss?6.5 :9.0);
const strafeDir=Math.random()<0.5?1 :-1;
const dashAngle=distToPlayer<145
?angleToPlayer + Math.PI + (Math.random() - 0.5)*0.8
:angleToPlayer + strafeDir*0.65;
const dashDist=isVen?210 :(boss.rank>=6?165 :120);
const nx=boss.x + Math.cos(dashAngle)*dashDist;
const ny=boss.y + Math.sin(dashAngle)*dashDist;
if (!mapManager||mapManager.isWalkable(nx,ny,boss.radius)) {
boss.x=nx;
boss.y=ny;
const moveGuName=boss.moveGuName||(isVen?"Định Tiên Du Cửu Chuyển" :"Thanh Phong Thân Pháp Cổ");
if (combatSystem) {
combatSystem.spawnFloatingText(boss.x,boss.y - 26,`💨 ${moveGuName}!`,"#6ce6b8");
}
}
}
if (boss.isStageBoss&&(boss.killerMoveCooldown||0)<=0&&distToPlayer<=680) {
boss.killerMoveCooldown=isVen?4.2 :Math.max(5.5,9.5 - boss.rank*0.45);
let kmName=boss.killerMoveName||"Tiên Đạo Sát Chiêu";
let kmIndex=0;
if (Array.isArray(boss.killerMoveList)&&boss.killerMoveList.length>0) {
boss.currentKillerMoveIdx=((boss.currentKillerMoveIdx||0) + 1) % boss.killerMoveList.length;
kmIndex=boss.currentKillerMoveIdx;
kmName=boss.killerMoveList[kmIndex];
}
const warnRadius=isVen?260 :(115 + boss.rank*18);
const castTime=isVen?0.78 :(boss.rank>=8?0.90 :1.05);
boss.telegraphState={
name:kmName,
patternIndex:kmIndex,
x:player.x,
y:player.y,
radius:warnRadius,
timer:castTime,
maxTimer:castTime,
color:boss.projectileColor||"#ff4d4d"
};
if (combatSystem) {
combatSystem.spawnFloatingText(boss.x,boss.y - 44,`👑 Sát Chiêu: 【${kmName}】!`,"#ffd700");
}
if (this.ui) {
this.ui.addLog(`⚠️ [${boss.name}] phát động 【${kmName}】! Hãy dùng Thân Pháp lướt khỏi vùng cảnh báo!`,"danger");
}
return;
}
boss.strafeAngleOffset=(boss.strafeAngleOffset||0.55);
if (Math.random()<0.025) boss.strafeAngleOffset= -boss.strafeAngleOffset;
const preferredDist=isVen?245 :(boss.isStageBoss?210 :175);
if (distToPlayer>preferredDist + 45) {
const moveAng=angleToPlayer + boss.strafeAngleOffset*0.45;
this._moveEntity(boss,Math.cos(moveAng)*effectiveSpd,Math.sin(moveAng)*effectiveSpd,dt,mapManager);
} else if (distToPlayer<preferredDist - 45) {
const retreatAng=angleToPlayer + Math.PI + boss.strafeAngleOffset*0.4;
this._moveEntity(boss,Math.cos(retreatAng)*effectiveSpd*0.85,Math.sin(retreatAng)*effectiveSpd*0.85,dt,mapManager);
} else {
const orbitAng=angleToPlayer + (boss.strafeAngleOffset>0?Math.PI / 2 :-Math.PI / 2);
this._moveEntity(boss,Math.cos(orbitAng)*effectiveSpd*0.78,Math.sin(orbitAng)*effectiveSpd*0.78,dt,mapManager);
}
if (distToPlayer<=(boss.attackRange||480)&&(boss.attackCooldown||0)<=0&&combatSystem) {
boss.attackCooldown=isVen?1.00 :(boss.isStageBoss?1.25 :1.65);
let guAttackName=boss.attackGuName||`${boss.name} Cổ Thuật`;
if (Array.isArray(boss.guLoadout)&&boss.guLoadout.length>0) {
boss.currentGuLoadoutIdx=((boss.currentGuLoadoutIdx||0) + 1) % boss.guLoadout.length;
guAttackName=boss.guLoadout[boss.currentGuLoadoutIdx];
if (isVen&&Math.random()<0.55) {
combatSystem.spawnFloatingText(boss.x,boss.y - 28,`🪲 ${guAttackName}`,boss.projectileColor||"#7ef7f0");
}
}
const shotCount=isVen?5 :(boss.isStageBoss?Math.min(3,1 + Math.floor(boss.rank / 3)) :(boss.isElite?2 :1));
const spread=isVen?0.65 :0.40;
const perShotScale=shotCount>=4?0.72 :(shotCount>=2?0.85 :1.0);
const projDamage=this._computeBossEffectiveDamage(boss,player,perShotScale,false);
for (let i=0;i<shotCount;i++) {
const offset=shotCount===1?0 :-spread / 2 + (spread / (shotCount - 1))*i;
combatSystem.spawnProjectile({
owner:"enemy",
attackerRef:boss,
name:guAttackName,
skillRank:boss.rank,
x:boss.x + Math.cos(angleToPlayer + offset)*20,
y:boss.y + Math.sin(angleToPlayer + offset)*20,
angle:angleToPlayer + offset,
speed:(isVen?560 :410) + boss.rank*20,
maxRange:(boss.attackRange||480) + 140,
radius:isVen?24 :(16 + Math.min(8,boss.rank)),
damage:projDamage,
color:boss.projectileColor||"#ff5733",
homing:isVen&&(i===0||i===shotCount - 1),
spinning:isVen
});
}
}
}
_executeBossKillerMoveImpact(boss,telegraph,player,combatSystem) {
if (!combatSystem) return;
const isVen=Boolean(boss.isVenerable);
const killerDmg=this._computeBossEffectiveDamage(
boss,
player,
isVen?1.75 :(boss.rank>=6?1.55 :1.40),
true
);
combatSystem.triggerScreenShake(isVen?14 :(4 + boss.rank),isVen?0.38 :0.28);
combatSystem.spawnAoEEffect({
owner:"enemy",
attackerRef:boss,
name:telegraph.name,
skillRank:boss.rank,
x:telegraph.x,
y:telegraph.y,
radius:telegraph.radius,
damage:killerDmg,
color:telegraph.color,
duration:isVen?0.65 :0.55
});
if (isVen&&player) {
const subDmg=this._computeBossEffectiveDamage(boss,player,1.05,true);
for (let k=0;k<4;k++) {
const subAng=(Math.PI / 2)*k + (telegraph.patternIndex*0.4);
const sx=telegraph.x + Math.cos(subAng)*185;
const sy=telegraph.y + Math.sin(subAng)*185;
combatSystem.spawnAoEEffect({
owner:"enemy",
attackerRef:boss,
name:`${telegraph.name} (Dư Chấn)`,
skillRank:9,
x:sx,
y:sy,
radius:130,
damage:subDmg,
color:"#b75cff",
duration:0.55
});
}
}
if (boss.rank>=3) {
const ringCount=isVen?12 :Math.min(12,4 + boss.rank);
const ringProjDmg=this._computeBossEffectiveDamage(boss,player,isVen?0.78 :0.82,false);
for (let i=0;i<ringCount;i++) {
const ang=(Math.PI*2*i) / ringCount;
combatSystem.spawnProjectile({
owner:"enemy",
attackerRef:boss,
name:telegraph.name,
skillRank:boss.rank,
x:boss.x + Math.cos(ang)*22,
y:boss.y + Math.sin(ang)*22,
angle:ang,
speed:(isVen?500 :380) + boss.rank*20,
maxRange:(isVen?600 :340) + boss.rank*25,
radius:isVen?22 :18,
damage:ringProjDmg,
color:telegraph.color,
homing:isVen&&(i % 3===0),
spinning:true
});
}
}
if (isVen&&player&&typeof combatSystem.spawnLaserBeam==="function") {
const aimAngle=Math.atan2(player.y - boss.y,player.x - boss.x);
const beamCount=3;
const beamDmg=this._computeBossEffectiveDamage(boss,player,1.25,true);
for (let b=0;b<beamCount;b++) {
const offset=(b - 1)*0.22;
combatSystem.spawnLaserBeam({
owner:"enemy",
attackerRef:boss,
name:telegraph.name,
skillRank:9,
x:boss.x,
y:boss.y,
angle:aimAngle + offset,
length:720,
width:44,
damage:beamDmg,
color:telegraph.color
});
}
}
}
_updateBeastAI(beast,dt,player,mapManager,combatSystem) {
if (beast.staggeredTimer&&beast.staggeredTimer>0) {
beast.staggeredTimer=Math.max(0,beast.staggeredTimer - dt);
return;
}
if (beast.attackCooldown>0) beast.attackCooldown -=dt;
if (beast.dashSkillCooldown>0) beast.dashSkillCooldown -=dt;
if (beast.slowTimer>0) {
beast.slowTimer -=dt;
if (beast.slowTimer<=0) beast.slowFactor=1.0;
}
const effectiveSpd=beast.spd*beast.slowFactor;
const distToPlayer=player?Math.hypot(player.x - beast.x,player.y - beast.y) :9999;
if (beast.hp<beast.maxHp*0.18&& !beast.isBoss&& !beast.isElite) {
beast.aiState="retreat";
if (!beast.calledAllies) {
beast.calledAllies=true;
this._alertNearbyBeasts(beast,360);
if (combatSystem) {
combatSystem.spawnFloatingText(beast.x,beast.y - 24,"Hú gọi bầy đàn!","#ff9f43");
}
}
} else if (player&&player.hp>0&&distToPlayer<=beast.aggroRange) {
beast.aiState="chase";
} else if (distToPlayer>beast.aggroRange*1.5) {
beast.aiState="patrol";
}
if ((beast.isBoss||beast.isElite)&& !beast.enraged&&beast.hp>0&&beast.hp<=beast.maxHp*0.35) {
beast.enraged=true;
if (combatSystem) {
combatSystem.spawnFloatingText(beast.x,beast.y - 34,"🔥 THÚ VƯƠNG CUỒNG BẠO (+25% SÁT LỰC)!","#ff4d4d");
}
}
const enrageMult=beast.enraged?1.25 :1.0;
const beastSpd=effectiveSpd*(beast.enraged?1.20 :1.0);
const realmPressure=this._getEnemyRealmPressureMult(beast,player);
if (beast.aiState==="retreat"&&player) {
const fleeAngle=Math.atan2(beast.y - player.y,beast.x - player.x);
this._moveEntity(beast,Math.cos(fleeAngle)*beastSpd*0.9,Math.sin(fleeAngle)*beastSpd*0.9,dt,mapManager);
beast.hp=Math.min(beast.maxHp,beast.hp + Math.max(3,beast.maxHp*0.025)*dt);
} else if (beast.aiState==="chase"&&player) {
const angleToPlayer=Math.atan2(player.y - beast.y,player.x - beast.x);
if ((beast.isElite||beast.isBoss)&&(beast.dashSkillCooldown||0)<=0&&distToPlayer<380&&distToPlayer>65) {
beast.dashSkillCooldown=beast.isBoss?4.5 :6.5;
const leapDist=135;
const nx=beast.x + Math.cos(angleToPlayer)*leapDist;
const ny=beast.y + Math.sin(angleToPlayer)*leapDist;
if (!mapManager||mapManager.isWalkable(nx,ny,beast.radius)) {
beast.x=nx;
beast.y=ny;
}
if (combatSystem) {
combatSystem.spawnFloatingText(beast.x,beast.y - 24,`💥 Thú Vương Phác Kích!`,"#ff9f43");
combatSystem.spawnAoEEffect({
owner:"enemy",
attackerRef:beast,
name:`${beast.name} Giẫm Đạp`,
skillRank:beast.rank,
x:beast.x,
y:beast.y,
radius:(beast.isBoss?105 :75) + beast.rank*12,
damage:Math.round(beast.atk*(beast.isBoss?1.50 :1.25)*enrageMult*realmPressure),
color:beast.color||"#ff5733",
duration:0.42
});
}
}
const flankOffset=((parseInt(beast.id.replace(/\D/g,""),10)||1) % 2===0?1 :-1)*0.24;
if (distToPlayer>beast.attackRange*0.85) {
const moveAngle=distToPlayer>140?angleToPlayer + flankOffset :angleToPlayer;
this._moveEntity(beast,Math.cos(moveAngle)*beastSpd,Math.sin(moveAngle)*beastSpd,dt,mapManager);
}
if (distToPlayer<=beast.attackRange&&beast.attackCooldown<=0) {
beast.attackCooldown=(beast.rangedGuId?1.50 :1.12) / (beast.enraged?1.25 :1.0);
const finalBeastDmg=Math.round(beast.atk*enrageMult*realmPressure);
if (beast.rangedGuId&&combatSystem) {
const burst=beast.isBoss?Math.min(5,2 + Math.floor(beast.rank / 2)) :(beast.isElite?2 :1);
for (let b=0;b<burst;b++) {
const off=burst===1?0 :(b - (burst - 1) / 2)*0.20;
combatSystem.spawnProjectile({
owner:"enemy",
attackerRef:beast,
name:beast.name,
skillRank:beast.rank,
x:beast.x,
y:beast.y,
angle:angleToPlayer + off,
speed:400 + beast.rank*22,
maxRange:beast.attackRange + 85,
radius:16 + Math.min(6,beast.rank),
damage:finalBeastDmg,
color:beast.projectileColor
});
}
} else if (player) {
const dmgRes=player.takeDamage(finalBeastDmg,beast.name,beast.rank||1,beast);
if (combatSystem&& !dmgRes.dodged&& !dmgRes.blocked&&dmgRes.damageTaken>0) {
combatSystem.spawnFloatingText(player.x,player.y - 18,`-${dmgRes.damageTaken}`,"#ff4d4d");
}
}
}
} else {
beast.patrolTimer -=dt;
if (beast.patrolTimer<=0) {
beast.patrolTimer=2.5 + Math.random()*4.0;
beast.patrolTargetX=beast.spawnX + (Math.random() - 0.5)*440;
beast.patrolTargetY=beast.spawnY + (Math.random() - 0.5)*440;
}
const distToPatrol=Math.hypot(beast.patrolTargetX - beast.x,beast.patrolTargetY - beast.y);
if (distToPatrol>14) {
const ang=Math.atan2(beast.patrolTargetY - beast.y,beast.patrolTargetX - beast.x);
this._moveEntity(beast,Math.cos(ang)*effectiveSpd*0.55,Math.sin(ang)*effectiveSpd*0.55,dt,mapManager);
}
}
}
_alertNearbyBeasts(callerBeast,radius) {
for (const other of this.beasts) {
if (other.id===callerBeast.id||other.isDead) continue;
const d=Math.hypot(other.x - callerBeast.x,other.y - callerBeast.y);
if (d<=radius) {
other.aiState="chase";
}
}
}
_updateNpcAI(npc,dt,player,mapManager,combatSystem) {
if (npc.attackCooldown>0) npc.attackCooldown -=dt;
if (npc.slowTimer>0) {
npc.slowTimer -=dt;
if (npc.slowTimer<=0) npc.slowFactor=1.0;
}
const effectiveSpd=npc.spd*npc.slowFactor;
if (npc.isHostile&&player&&player.hp>0) {
const dist=Math.hypot(player.x - npc.x,player.y - npc.y);
if (!npc.lethalCombat&&npc.hp<=npc.maxHp*0.22) {
npc.isHostile=false;
npc.hp=Math.round(npc.maxHp*0.5);
npc.aiState="cultivate";
npc.aiStateText="Đang vận công hồi phục sau tỷ thí";
npc.relation +=5;
if (this.ui) {
this.ui.addLog(`[Tỷ Thí] ${npc.name} chắp tay nhận thua: "Cổ thuật của đạo hữu thật tinh diệu, tại hạ bái phục!" (+10 Nguyên Thạch chiến thắng)`,"cultivation");
}
player.primevalStones +=10;
return;
}
if (dist>650) {
npc.isHostile=false;
npc.aiState="patrol";
npc.aiStateText="Tuần tra cảnh giác";
return;
}
const ang=Math.atan2(player.y - npc.y,player.x - npc.x);
if (dist>180) {
this._moveEntity(npc,Math.cos(ang)*effectiveSpd,Math.sin(ang)*effectiveSpd,dt,mapManager);
} else if (dist<95) {
this._moveEntity(npc,-Math.cos(ang)*effectiveSpd*0.6,-Math.sin(ang)*effectiveSpd*0.6,dt,mapManager);
}
if (npc.attackCooldown<=0&&combatSystem) {
npc.attackCooldown=1.7;
combatSystem.spawnProjectile({
owner:"npc",
attackerRef:npc,
name:`${npc.name} Cổ Thuật`,
skillRank:npc.rank||1,
x:npc.x,
y:npc.y,
angle:ang,
speed:420,
maxRange:340,
radius:18,
damage:npc.atk,
color:npc.color
});
}
return;
}
npc.aiTimer -=dt;
if (npc.aiTimer<=0) {
npc.aiTimer=6 + Math.random()*8;
const roll=Math.random();
if (roll<0.35&&mapManager) {
const nearNode=mapManager.getNearestInteractableNode(npc.x,npc.y,520);
if (nearNode) {
npc.aiState="gather";
npc.targetX=nearNode.x;
npc.targetY=nearNode.y;
npc.aiStateText=`Đang khai thác ${nearNode.name}`;
} else {
npc.aiState="patrol";
npc.targetX=npc.homeX + (Math.random() - 0.5)*280;
npc.targetY=npc.homeY + (Math.random() - 0.5)*280;
npc.aiStateText="Đang dạo quanh tìm cơ duyên";
}
} else if (roll<0.68) {
npc.aiState="cultivate";
npc.aiStateText="Đang ngồi thiền ôn dưỡng Không Khiếu";
npc.primevalStones +=npc.rank*2;
npc.hp=Math.min(npc.maxHp,npc.hp + 25);
} else {
npc.aiState="patrol";
npc.targetX=npc.homeX + (Math.random() - 0.5)*260;
npc.targetY=npc.homeY + (Math.random() - 0.5)*260;
npc.aiStateText="Đang tuần tra lãnh địa";
}
}
if (npc.aiState==="patrol"||npc.aiState==="gather") {
const d=Math.hypot(npc.targetX - npc.x,npc.targetY - npc.y);
if (d>14) {
const ang=Math.atan2(npc.targetY - npc.y,npc.targetX - npc.x);
this._moveEntity(npc,Math.cos(ang)*effectiveSpd*0.5,Math.sin(ang)*effectiveSpd*0.5,dt,mapManager);
} else if (npc.aiState==="gather") {
npc.primevalStones +=3;
npc.aiState="cultivate";
npc.aiStateText="Thu hoạch xong, đang tĩnh tọa";
}
}
}
_moveEntity(entity,vx,vy,dt,mapManager) {
const nx=entity.x + vx*dt;
const ny=entity.y + vy*dt;
if (!mapManager||mapManager.isWalkable(nx,entity.y,entity.radius)) {
entity.x=nx;
}
if (!mapManager||mapManager.isWalkable(entity.x,ny,entity.radius)) {
entity.y=ny;
}
}
_simulateWorldAndFactions() {
this.marketFluctuationFactor=Number((0.85 + Math.random()*0.40).toFixed(2));
for (const npc of this.npcs) {
if (npc.isDead|| !Array.isArray(npc.shopInventory)) continue;
for (const item of npc.shopInventory) {
if (item.stock<3&&Math.random()<0.5) {
item.stock +=1;
}
}
}
const f1=this.factions[Math.floor(Math.random()*this.factions.length)];
const f2=this.factions[Math.floor(Math.random()*this.factions.length)];
if (f1&&f2&&f1.id!==f2.id) {
const delta=Math.floor(15 + Math.random()*35);
f1.power +=delta;
f2.power=Math.max(200,f2.power - Math.floor(delta*0.6));
if (this.ui) {
this.ui.addLog(
`[Thiên Hạ Đại Thế] Cổ sư của ${f1.name} vừa giao tranh với ${f2.name} tại biên cảnh để tranh đoạt mạch Nguyên Tuyền!`,
"system"
);
}
}
}
getHostileTargetsInRadius(x,y,radius) {
const results=[];
for (const b of this.beasts) {
if (!b.isDead&&Math.hypot(b.x - x,b.y - y)<=radius + b.radius) {
results.push(b);
}
}
for (const n of this.npcs) {
if (!n.isDead&&n.isHostile&&Math.hypot(n.x - x,n.y - y)<=radius + n.radius) {
results.push(n);
}
}
return results;
}
findCollidingHostile(x,y,radius,excludeSet) {
for (const b of this.beasts) {
if (b.isDead||(excludeSet&&excludeSet.has(b.id))) continue;
if (Math.hypot(b.x - x,b.y - y)<=radius + b.radius) {
return b;
}
}
for (const n of this.npcs) {
if (n.isDead|| !n.isHostile||(excludeSet&&excludeSet.has(n.id))) continue;
if (Math.hypot(n.x - x,n.y - y)<=radius + n.radius) {
return n;
}
}
return null;
}
damageEntity(target,rawDamage,attackerPlayer,combatSystem,ignoreFlatDef=false) {
if (!target||target.isDead) return 0;
const minPen=Math.max(1,Math.round(rawDamage*0.20));
let postDefDamage=ignoreFlatDef
?Math.max(1,Math.round(rawDamage))
:Math.max(minPen,Math.round(rawDamage - (target.def||0)*0.72));
if (Boolean(target.isVenerable)) {
const livingVenerables=this.beasts.filter(b=>Boolean(b.isVenerable)&& !b.isDead).length;
if (livingVenerables>=2) {
postDefDamage=Math.max(1,Math.round(postDefDamage*0.80));
}
}
let hpDamage=postDefDamage;
let shieldAbsorbed=0;
if (target.shieldHp&&target.shieldHp>0) {
if (Boolean(target.isVenerable)&&attackerPlayer&&Math.random()<0.35) {
const reflectDmg=Math.min(
VENERABLE_MAX_REFLECT_DAMAGE,
Math.round((target.atk||50000)*0.25)
);
const refRes=attackerPlayer.takeDamage(reflectDmg,`${target.name} Hộ Thuẫn Phản Chấn`,target.rank||9,target);
if (combatSystem&& !refRes.dodged&& !refRes.blocked&&refRes.damageTaken>0) {
combatSystem.spawnFloatingText(attackerPlayer.x,attackerPlayer.y - 26,`☯ Phản Chấn -${refRes.damageTaken}`,"#ffd700");
}
}
shieldAbsorbed=Math.min(target.shieldHp,hpDamage);
target.shieldHp -=shieldAbsorbed;
hpDamage -=shieldAbsorbed;
if (target.shieldHp<=0&&combatSystem) {
combatSystem.spawnFloatingText(target.x,target.y - 28,"💥 Phá Vỡ Hộ Thuẫn!","#ffd700");
}
}
target.hp=Math.max(0,target.hp - hpDamage);
if (target.entityType==="npc"&& !target.isHostile) {
target.becomeHostile(true);
} else if (target.entityType==="beast") {
target.aiState="chase";
}
if (target.hp<=0) {
this._handleEntityDeath(target,attackerPlayer,combatSystem);
}
return hpDamage + shieldAbsorbed;
}
_handleEntityDeath(target,player,combatSystem) {
target.isDead=true;
target.respawnTimer=target.isBoss?180 :60;
if (!player) return;
player.kills +=1;
if (this.player&&this.player.aperture) {
this.player.aperture.humanQi +=target.isBoss?target.rank*4 :(target.isElite?2 :1);
}
if (target.entityType==="beast") {
const lootTexts=[];
for (const drop of (target.drops||[])) {
if (Math.random()<=drop.chance) {
if (drop.itemId) {
const count=Math.floor(drop.min + Math.random()*(drop.max - drop.min + 1));
player.addItem(drop.itemId,count);
const meta=global.PlayerManager.ITEM_DATABASE[drop.itemId]||{name:drop.itemId};
lootTexts.push(`${count}x ${meta.name}`);
} else if (drop.wildGuId&&this.guSystem) {
const captured=this.guSystem.addGuToStorage(drop.wildGuId,{
rank:drop.wildRank||target.rank||1,
isRefined:false,
refinementProgress:0,
isVital:false
});
if (captured) {
const fullGuName=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(captured)
:captured.name;
lootTexts.push(`Cổ Hoang Dã [${fullGuName}]`);
}
}
}
}
if (this.ui&&(target.isBoss||target.isElite||lootTexts.length>0)) {
this.ui.addLog(
`Đã tiêu diệt [${target.name}]! Thu được: ${lootTexts.length?lootTexts.join(", ") :"Kinh nghiệm thực chiến"}.`,
"loot"
);
}
this.notifyQuestProgress("kill_beast",1);
if (target.isBoss) {
this.notifyQuestProgress("kill_boss",1);
}
} else if (target.entityType==="npc") {
const stolenStones=Math.max(15,target.primevalStones);
player.primevalStones +=stolenStones;
if (global.vanCoTienDoGame&&global.vanCoTienDoGame.bountySystem) {
global.vanCoTienDoGame.bountySystem.onNpcKilled(target);
}
target.primevalStones=20;
let stolenGuMsg="";
if (target.equippedGu&&this.guSystem) {
const capturedGu=this.guSystem.addGuToStorage(target.equippedGu,{
rank:target.equippedGuRank||target.rank||1,
isRefined:false,
refinementProgress:0,
isVital:false
});
if (capturedGu) {
const fullGuName=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(capturedGu)
:capturedGu.name;
stolenGuMsg=` và đoạt được [${fullGuName}]`;
}
}
if (this.ui) {
this.ui.addLog(
`Ngươi đã đánh bại Cổ Sư [${target.name}], lục soát được 💎 ${stolenStones} Nguyên Thạch${stolenGuMsg}!`,
"loot"
);
}
}
if (combatSystem) {
combatSystem.spawnFloatingText(target.x,target.y - 24,"Đã Tiêu Diệt!","#5cc995");
}
}
getNearestInteractableNpc(x,y,maxDist=56) {
let best=null;
let bestDist=maxDist;
for (const npc of this.npcs) {
if (npc.isDead||npc.isHostile) continue;
const d=Math.hypot(npc.x - x,npc.y - y);
if (d<=bestDist) {
bestDist=d;
best=npc;
}
}
return best;
}
buyFromNpc(npc,itemIdx,player,guSystem) {
if (!npc|| !Array.isArray(npc.shopInventory)|| !npc.shopInventory[itemIdx]) {
return {success:false,message:"Mặt hàng không tồn tại."};
}
const entry=npc.shopInventory[itemIdx];
if (entry.stock<=0) {
return {success:false,message:`${entry.name} đã bán hết! Hãy chờ thương nhân nhập đợt hàng mới.`};
}
const discount=player?(player.tradeDiscount||0) :0;
const finalPrice=Math.max(1,Math.round(entry.price*(1 - discount)));
if (player.primevalStones<finalPrice) {
return {
success:false,
message:`Không đủ Nguyên Thạch! Cần 💎 ${finalPrice} Nguyên Thạch để mua ${entry.name}.`
};
}
player.primevalStones -=finalPrice;
npc.primevalStones +=finalPrice;
entry.stock -=1;
if (entry.guId&&guSystem) {
const newGu=guSystem.addGuToStorage(entry.guId,{
rank:entry.guRank||1,
isRefined:false,
refinementProgress:0,
isVital:false
});
if (!newGu) {
return {success:false,message:"Tiên Cổ là duy nhất! Ngươi đã sở hữu con Tiên Cổ này rồi."};
}
const fullGuName=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(newGu)
:newGu.name;
return {
success:true,
message:`Giao dịch thành công! Đã mua [${fullGuName}] (Chưa luyện hóa) với giá 💎 ${finalPrice}. Hãy dùng Nguyên Thạch & Tinh Thần để Luyện Hóa tại Kho Cổ!`
};
} else if (entry.itemId) {
player.addItem(entry.itemId,1);
return {
success:true,
message:`Đã mua 1x [${entry.name}] với giá 💎 ${finalPrice} Nguyên Thạch.`
};
}
return {success:false,message:"Lỗi giao dịch."};
}
assignDynamicQuestFromNpc(npc) {
const newQuestId=`q_npc_${npc.id}_${Date.now()}`;
const isDemonic=npc.factionId==="huyet_ma_cult";
const newQuest={
id:newQuestId,
title:isDemonic
?`Ủy Thác Của ${npc.name}: Thu Thập Huyết Thực`
:`Ủy Thác Của ${npc.name}: Tuần Tra Tiễu Thú`,
category:isDemonic?"Ma Đạo" :"Chính Đạo",
type:"kill_beast",
progress:0,
target:3,
completed:false,
rewardStones:45,
rewardHumanQi:10,
rewardText:"45 Nguyên Thạch + 10 Nhân Khí",
description:`${npc.name} nhờ ngươi tiêu diệt 3 con quái thú quanh chiến trường để thu thập nguyên liệu luyện cổ.`
};
this.quests.push(newQuest);
return {
success:true,
quest:newQuest,
message:`Đã nhận nhiệm vụ mới: [${newQuest.title}]! Mở bảng Thế Lực để theo dõi.`
};
}
notifyQuestProgress(questType,amount=1) {
for (const q of this.quests) {
if (q.completed||q.type!==questType) continue;
q.progress=Math.min(q.target,q.progress + amount);
if (q.progress>=q.target) {
q.completed=true;
if (this.player) {
this.player.primevalStones +=q.rewardStones||30;
if (q.type==="harvest_node") {
this.player.addItem("moon_orchid",1);
} else if (q.type==="kill_boss") {
this.player.addItem("soul_crystal",1);
}
}
if (this.player&&this.player.aperture) {
this.player.aperture.humanQi +=q.rewardHumanQi||8;
}
if (this.ui) {
this.ui.addLog(
`🎉 Hoàn thành nhiệm vụ [${q.title}]! Nhận thưởng: ${q.rewardText}.`,
"loot"
);
}
}
}
}
getActiveQuests() {
return this.quests;
}
getFactions() {
return this.factions;
}
getLivingNpcs() {
return this.npcs.filter(n=> !n.isDead);
}
render(ctx,camera) {
if (!ctx) return;
const camX=camera?camera.x :0;
const camY=camera?camera.y :0;
const w=camera?camera.width :1280;
const h=camera?camera.height :720;
const zoom=(camera&&camera.zoom)?camera.zoom :1.0;
const isMobUI=Boolean(document.body&&document.body.classList.contains("mobile-ui"));
const useCharCache=(zoom<0.80||isMobUI);
const compactLabels=(zoom<0.72||isMobUI);
const t=performance.now()*0.005;

// Twin-Venerable Resonance Energy Tether
const livingVenerables=this.beasts.filter(b=>Boolean(b.isVenerable)&& !b.isDead);
if (livingVenerables.length>=2) {
const v1=livingVenerables[0];
const v2=livingVenerables[1];
const x1=v1.x - camX;
const y1=v1.y - camY;
const x2=v2.x - camX;
const y2=v2.y - camY;
ctx.save();
const tGrad=ctx.createLinearGradient(x1,y1,x2,y2);
tGrad.addColorStop(0,"#4ce6ff");
tGrad.addColorStop(0.5,"#ffffff");
tGrad.addColorStop(1,"#ffd700");
ctx.strokeStyle=tGrad;
ctx.lineWidth=4 + Math.sin(t*3.5)*1.4;
ctx.globalAlpha=0.72;
ctx.beginPath();
ctx.moveTo(x1,y1);
const mx=(x1 + x2)/2 + Math.sin(t*6)*14;
const my=(y1 + y2)/2 + Math.cos(t*6)*14;
ctx.quadraticCurveTo(mx,my,x2,y2);
ctx.stroke();
ctx.restore();
}

// Boss Telegraph Danger Zones (Upgraded with Dao Rune Ring)
for (const b of this.beasts) {
if (b.isDead|| !b.telegraphState) continue;
const ts=b.telegraphState;
const tx=Math.round(ts.x - camX);
const ty=Math.round(ts.y - camY);
const chargePct=Math.max(0,Math.min(1,1 - ts.timer / ts.maxTimer));
ctx.save();
const tRad=ctx.createRadialGradient(tx,ty,4,tx,ty,ts.radius);
tRad.addColorStop(0,b.isVenerable?"rgba(255,215,0,0.28)" :"rgba(255,60,60,0.22)");
tRad.addColorStop(1,b.isVenerable?"rgba(183,92,255,0.14)" :"rgba(224,52,52,0.08)");
ctx.fillStyle=tRad;
ctx.beginPath();
ctx.arc(tx,ty,ts.radius,0,Math.PI*2);
ctx.fill();
ctx.lineWidth=b.isVenerable?3.2 :2.2;
ctx.strokeStyle=ts.color||"#ff4d4d";

ctx.stroke();

ctx.beginPath();
ctx.arc(tx,ty,ts.radius*chargePct,0,Math.PI*2);
ctx.fillStyle=b.isVenerable?"rgba(255,215,0,0.34)" :"rgba(255,90,90,0.30)";
ctx.fill();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=1.2;
ctx.stroke();
ctx.font="bold 13px Georgia";
ctx.textAlign="center";
ctx.fillStyle="#000000";
ctx.fillText(`⚠️ ${ts.name}!`,tx + 1,ty - 5);
ctx.fillStyle="#ffdf6b";
ctx.fillText(`⚠️ ${ts.name}!`,tx,ty - 6);
ctx.restore();
}

// Render All Beasts & Bosses
for (const b of this.beasts) {
if (b.isDead) continue;
const sx=Math.round(b.x - camX);
const sy=Math.round(b.y - camY);
if (sx< -120||sy< -120||sx>w + 120||sy>h + 120) continue;
ctx.save();
ctx.translate(sx,sy);

// Venerable / Boss Supreme Dao Formation Array
if (b.isVenerable) {
const vCol=b.enraged?"#ff3b30" :(b.projectileColor||"#ffd700");
ctx.save();
ctx.rotate(t*(b.enraged?1.4 :0.75));
ctx.strokeStyle=vCol;
ctx.lineWidth=b.enraged?3.2 :2.2;

ctx.beginPath();
ctx.arc(0,0,b.radius + 26,0,Math.PI*2);
ctx.stroke();

ctx.restore();
ctx.save();
ctx.rotate(-t*(b.enraged?1.1 :0.55));
ctx.strokeStyle="rgba(255,255,255,0.45)";
ctx.lineWidth=1.4;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4;
const rx=Math.cos(a)*(b.radius + 22);
const ry=Math.sin(a)*(b.radius + 22);
if (i===0) ctx.moveTo(rx,ry);
else ctx.lineTo(rx,ry);
}
ctx.closePath();
ctx.stroke();
ctx.restore();
const starCount=b.enraged?8 :6;
for (let orbIdx=0;orbIdx<starCount;orbIdx++) {
const orbAng=t*1.6 + (orbIdx*Math.PI*2)/starCount;
const ox=Math.cos(orbAng)*(b.radius + 26);
const oy=Math.sin(orbAng)*(b.radius + 26);
const oGrad=ctx.createRadialGradient(ox,oy,0.5,ox,oy,5.5);
oGrad.addColorStop(0,"#ffffff");
oGrad.addColorStop(0.5,vCol);
oGrad.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=oGrad;
ctx.beginPath();
ctx.arc(ox,oy,5.5,0,Math.PI*2);
ctx.fill();
}
} else if (b.isBoss&&b.isHuman) {
ctx.save();
ctx.translate(0,16);
ctx.scale(1,0.45);
ctx.rotate(t*0.7);
ctx.strokeStyle=b.enraged?"#ff3b30" :"#ffd700";
ctx.lineWidth=2.2;

ctx.beginPath();
ctx.arc(0,0,b.radius + 12,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}

// Shield Barrier Dome
if (b.shieldHp&&b.shieldHp>0) {
const shCol=b.isVenerable?"#7ef7f0" :"#ffd700";
const shR=b.radius + 14 + Math.sin(t*2)*2;
const shGrad=ctx.createRadialGradient(0,0,shR*0.4,0,0,shR);
shGrad.addColorStop(0,"rgba(255,255,255,0)");
shGrad.addColorStop(1,b.isVenerable?"rgba(126,247,240,0.34)" :"rgba(255,215,0,0.24)");
ctx.fillStyle=shGrad;
ctx.beginPath();
ctx.arc(0,0,shR,0,Math.PI*2);
ctx.fill();
ctx.lineWidth=2.2;
ctx.strokeStyle=shCol;
ctx.stroke();
}

// Human Cultivator Boss/Mob vs Detailed Beast Art
if (b.isHuman&&global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
const skinCfg=this._getHumanEnemyVisualSkin(b);
const scale=b.isVenerable?(b.enraged?1.72 :1.58) :(b.isBoss?1.38 :(b.isElite?1.18 :1.05));
ctx.save();
ctx.scale(scale,scale);
const faceH=(this.player&&Math.abs(this.player.x - b.x)>Math.abs(this.player.y - b.y))
?(this.player.x<b.x?"left" :"right")
:"down";
global.PlayerManager.drawSkinPixelSprite(ctx,skinCfg,{
bobY:Math.sin(t*2 + (b.x||0)*0.02)*1.6,
legOffset:Math.sin(t*3)*1.8,
armSwing:b.telegraphState? -5 :Math.sin(t*2.4)*1.5,
facing:faceH,
isMoving:true,
allowCache:useCharCache&& !b.isVenerable&& !b.isBoss
});
ctx.restore();
} else {
this._drawBeastArt(ctx,b,t);
}

const barColor=b.isVenerable
?(b.enraged?"#ff2a2a" :"#00e5ff")
:(b.isBoss?"#ff3b30" :(b.isElite?"#c278ff" :"#e05252"));
const displayName=b.enraged?`🔥 [Cuồng Bạo] ${b.name}` :b.name;
const hideLabel=compactLabels&& !b.isBoss&& !b.isElite&& !b.isVenerable&&(b.hp>=b.maxHp);
this._renderEntityHealthBar(
ctx,
displayName,
b.rank,
b.hp,
b.maxHp,
b.isVenerable? -58 :(b.isHuman? -44 : -b.radius - 20),
barColor,
b.shieldHp||0,
b.isBoss,
b.rankBadge||null,
b.maxPoise?(b.poise / b.maxPoise) :null,
Boolean(b.staggeredTimer&&b.staggeredTimer>0),
hideLabel
);
ctx.restore();
}

// Render All 5 NPCs with Full Xianxia Character Art
for (const npc of this.npcs) {
if (npc.isDead) continue;
const sx=Math.round(npc.x - camX);
const sy=Math.round(npc.y - camY);
if (sx< -60||sy< -60||sx>w + 60||sy>h + 60) continue;
ctx.save();
ctx.translate(sx,sy);
if (npc.aiState==="cultivate"&& !npc.isHostile) {
ctx.save();
ctx.translate(0,13);
ctx.scale(1,0.45);
ctx.rotate(t*0.8);
ctx.strokeStyle="rgba(126,247,240,0.6)";
ctx.lineWidth=1.6;

ctx.beginPath();
ctx.arc(0,0,22,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
const npcSkin=this._getNpcVisualSkin(npc);
ctx.save();
ctx.scale(1.06,1.06);
global.PlayerManager.drawSkinPixelSprite(ctx,npcSkin,{
bobY:Math.sin(t*1.8 + sx)*1.0,
legOffset:npc.aiState==="patrol"||npc.aiState==="gather"?Math.sin(t*3)*2 :0,
armSwing:npc.isHostile? -3 :0,
facing:"down",
isMoving:npc.aiState==="patrol"||npc.aiState==="gather",
allowCache:useCharCache
});
ctx.restore();
}
const barColor=npc.isHostile?"#ff4d4d" :"#5aa9e6";
this._renderEntityHealthBar(ctx,npc.name,npc.rank,npc.hp,npc.maxHp,-40,barColor,0,false);
ctx.restore();
}
}
_renderEntityHealthBar(ctx,name,rank,hp,maxHp,offsetY,barColor,shieldHp=0,isBoss=false,rankBadge=null,poiseRatio=null,isStaggered=false,hideLabel=false) {
const barW=isBoss?122 :56;
const barH=isBoss?8.5 :5.5;
const pct=Math.max(0,Math.min(1,hp / Math.max(1,maxHp)));
if (!hideLabel) {
const badgeText=rankBadge||`${rank} Chuyển`;
const label=`${name} [${badgeText}]`;
ctx.font=isBoss?"bold 12px Georgia" :"11px Georgia";
ctx.textAlign="center";
const textY=offsetY - (shieldHp>0?11 :6);
if (isBoss) {
ctx.fillStyle="rgba(0,0,0,0.85)";
ctx.fillText(label,1,textY + 1);
}
ctx.fillStyle=isBoss?"#ffd700" :"#f0ebe1";
ctx.fillText(label,0,textY);
}
ctx.fillStyle="rgba(7,9,14,0.92)";
ctx.fillRect(-barW/2 - 1,offsetY - 1,barW + 2,barH + 2);
if (isBoss) {
const hpGrad=ctx.createLinearGradient(-barW/2,offsetY,barW/2,offsetY);
hpGrad.addColorStop(0,barColor);
hpGrad.addColorStop(1,"#ff9a76");
ctx.fillStyle=hpGrad;
} else {
ctx.fillStyle=barColor;
}
ctx.fillRect(-barW/2,offsetY,barW*pct,barH);
ctx.fillStyle="rgba(255,255,255,0.22)";
ctx.fillRect(-barW/2,offsetY,barW*pct,barH*0.38);
ctx.strokeStyle=isBoss?"#d4af37" :"#453c2e";
ctx.lineWidth=1;
ctx.strokeRect(-barW/2,offsetY,barW,barH);
if (shieldHp>0) {
const sPct=Math.min(1,shieldHp / Math.max(1,maxHp*0.40));
ctx.fillStyle="#07131a";
ctx.fillRect(-barW/2,offsetY - 5,barW,3.8);
ctx.fillStyle="#4ce6ff";
ctx.fillRect(-barW/2,offsetY - 5,barW*sPct,3.8);
}
if (isBoss&&poiseRatio!==null) {
ctx.fillStyle="#181410";
ctx.fillRect(-barW/2,offsetY + barH + 1.5,barW,3.2);
ctx.fillStyle=isStaggered?"#ff3b30" :"#ffd700";
ctx.fillRect(-barW/2,offsetY + barH + 1.5,barW*Math.max(0,Math.min(1,poiseRatio)),3.2);
}
}
toSaveData() {
return {
factions:this.factions,
quests:this.quests,
npcs:this.npcs.map(n=>({
id:n.id,
name:n.name,
title:n.title,
age:n.age,
aptitude:n.aptitude,
rank:n.rank,
factionId:n.factionId,
factionName:n.factionName,
personality:n.personality,
goal:n.goal,
x:Math.round(n.x),
y:Math.round(n.y),
homeX:n.homeX,
homeY:n.homeY,
hp:n.hp,
maxHp:n.maxHp,
atk:n.atk,
def:n.def,
spd:n.spd,
primevalStones:n.primevalStones,
relation:n.relation,
color:n.color,
equippedGu:n.equippedGu,
equippedGuRank:n.equippedGuRank||n.rank||1,
shopInventory:n.shopInventory,
isDead:n.isDead,
respawnTimer:n.respawnTimer
}))
};
}
fromSaveData(data) {
if (!data||typeof data!=="object") return;
if (Array.isArray(data.factions)) {
const validF=data.factions.filter(f=>f&&typeof f==="object"&&typeof f.name==="string");
if (validF.length>0) this.factions=validF;
}
if (Array.isArray(data.quests)) {
const validQ=data.quests.filter(q=>q&&typeof q==="object"&&typeof q.title==="string");
if (validQ.length>0) this.quests=validQ;
}
if (Array.isArray(data.npcs)) {
const validN=data.npcs.filter(n=>n&&typeof n==="object"&&typeof n.name==="string");
if (validN.length>0) this.npcs=validN.map(nData=>this._hydrateNpcObject(nData));
}
}
}
global.EnemyManager=EnemyManager;
})(window);
