(function (global) {
"use strict";
class BuffSystem {
constructor(combatSystem) {
this.combat=combatSystem||null;
}
applyStatus(target,statusType,duration=4.0,dotDamage=4) {
const c=this.combat;
if (!target||target.isDead|| !c) return;
const ccResistance=(target.isVenerable||target.rank>=9)
?0.20
:((target.isBoss&&target.rank>=8)?0.50 :1.0);
switch (statusType) {
case "burn":
target.burnTimer=duration;
target.burnDamage=dotDamage;
break;
case "bleed":
target.bleedTimer=duration;
target.bleedStacks=Math.min(5,(target.bleedStacks||0) + 1);
target.bleedDamage=dotDamage;
break;
case "chill":
target.slowTimer=duration*ccResistance;
target.slowFactor=(target.isVenerable||target.rank>=9)?0.80 :0.45;
target.chillStacks=(target.chillStacks||0) + 1;
if (target.chillStacks>=3) {
target.chillStacks=0;
target.freezeTimer=2.0*ccResistance;
c.spawnFloatingText(target.x,target.y - 28,"❄️ ĐÓNG BĂNG!","#85c1e9");
}
break;
case "stun":
target.stunTimer=Math.max(target.stunTimer||0,1.3*ccResistance);
c.spawnFloatingText(target.x,target.y - 26,"💫 Choáng!","#f7c948");
break;
case "poison":
target.poisonTimer=duration;
target.poisonDamage=dotDamage;
break;
}
}
updateEnemyStatuses(dt) {
const c=this.combat;
if (!c|| !c.enemies) return;
const lists=[c.enemies.beasts,c.enemies.npcs];
for (let li=0;li<lists.length;li++) {
const arr=lists[li];
if (!arr) continue;
for (let ei=0;ei<arr.length;ei++) {
const ent=arr[ei];
if (ent.isDead) continue;
if (ent.hitFlashTimer>0) ent.hitFlashTimer=Math.max(0,ent.hitFlashTimer - dt);
if ((ent.stunTimer&&ent.stunTimer>0)||(ent.freezeTimer&&ent.freezeTimer>0)) {
if (ent.stunTimer>0) ent.stunTimer=Math.max(0,ent.stunTimer - dt);
if (ent.freezeTimer>0) ent.freezeTimer=Math.max(0,ent.freezeTimer - dt);
ent.slowTimer=0.2;
ent.slowFactor=0;
ent.attackCooldown=Math.max(ent.attackCooldown||0,0.4);
}
ent._dotTick=(ent._dotTick||0) + dt;
if (ent._dotTick>=0.6) {
ent._dotTick=0;
const pRank=c.aperture?(c.aperture.rank||1) :1;
const dotBlocked=((ent.rank||1) - pRank>=2)||(pRank<=5&&(ent.rank||1)>=6);
if (ent.burnTimer&&ent.burnTimer>0) {
ent.burnTimer=Math.max(0,ent.burnTimer - 0.6);
if (!dotBlocked) {
const dealt=c.enemies.damageEntity(ent,ent.burnDamage||4,c.player,c,true);
if (dealt>0) c.spawnFloatingText(ent.x,ent.y - 16,`🔥 -${dealt}`,"#ff5733");
}
}
if (ent.bleedTimer&&ent.bleedTimer>0) {
ent.bleedTimer=Math.max(0,ent.bleedTimer - 0.6);
if (!dotBlocked) {
const dealt=c.enemies.damageEntity(ent,(ent.bleedDamage||4)*(ent.bleedStacks||1),c.player,c,true);
if (dealt>0) c.spawnFloatingText(ent.x,ent.y - 16,`🩸 -${dealt}`,"#e03e3e");
}
}
if (ent.poisonTimer&&ent.poisonTimer>0) {
ent.poisonTimer=Math.max(0,ent.poisonTimer - 0.6);
if (!dotBlocked) {
const dealt=c.enemies.damageEntity(ent,ent.poisonDamage||4,c.player,c,true);
if (dealt>0) c.spawnFloatingText(ent.x,ent.y - 16,`☠️ -${dealt}`,"#9b59b6");
}
}
}
}
}
}
}
global.BuffSystem=BuffSystem;
})(window);
