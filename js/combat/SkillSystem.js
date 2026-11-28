(function (global) {
"use strict";
class SkillSystem {
constructor(combatSystem) {
this.combat=combatSystem||null;
}
getCooldownMultiplier(player) {
const timeMarks=(player&&typeof player.getEffectiveDaoMarks==="function")
?player.getEffectiveDaoMarks("Thời Gian Đạo")
:0;
let cdMult=Math.max(0.50,1 - timeMarks*0.0015);
const qm=this.combat&&this.combat.game&&this.combat.game.questManager;
if (qm) {
const pb=qm.getPassiveBonuses();
if (pb.cdReducePct>0) {
cdMult=Math.max(0.40,cdMult*(1 - pb.cdReducePct));
}
}
if (this.combat&&this.combat.overdriveTimer>0) cdMult*=0.60;
return cdMult;
}
tickCooldowns(dt) {
const c=this.combat;
if (!c) return;
for (const key of Object.keys(c.guCooldowns)) {
c.guCooldowns[key]=Math.max(0,c.guCooldowns[key] - dt);
if (c.guCooldowns[key]===0) delete c.guCooldowns[key];
}
for (const key of Object.keys(c.killerCooldowns)) {
c.killerCooldowns[key]=Math.max(0,c.killerCooldowns[key] - dt);
if (c.killerCooldowns[key]===0) delete c.killerCooldowns[key];
}
if (c.dashCooldown>0) c.dashCooldown=Math.max(0,c.dashCooldown - dt);
if (c.iframeTimer>0) c.iframeTimer=Math.max(0,c.iframeTimer - dt);
if (c.screenShakeTime>0) c.screenShakeTime=Math.max(0,c.screenShakeTime - dt);
if (c.comboTimer>0) {
c.comboTimer -=dt;
if (c.comboTimer<=0) c.comboCount=0;
}
}
}
global.SkillSystem=SkillSystem;
})(window);
