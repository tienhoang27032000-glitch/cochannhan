(function (global) {
"use strict";
function _calcRankSuppressionCore(skillRank=1,targetRank=1,target=null) {
const playerRank=this.aperture?(this.aperture.rank||1) :1;
const effTargetRank=(target&&target.isVenerable)?Math.max(9,targetRank) :targetRank;
// Không còn cơ chế miễn sát thương hay khóa sát thương theo chênh lệch cảnh giới!
// Cấp cao đánh cấp thấp vẫn có ưu thế nhẹ theo chênh lệch tu vi; cấp thấp đánh cấp cao vẫn gây đủ sát thương thực.
if (playerRank>effTargetRank) {
const adv=playerRank - effTargetRank;
const mult=(playerRank>=6&&effTargetRank<=5)?2.0 :(1 + adv*0.25);
return {multiplier:mult,suppressed:false,blocked:false,label:""};
}
return {multiplier:1.0,suppressed:false,blocked:false,label:""};
}
class DamageCalculator {
constructor(combatSystem) {
this.combat=combatSystem||null;
}
getPassiveDamageMultiplier() {
const game=this.combat&&this.combat.game;
if (!game|| !game.questManager) return {dmgMult:1.0,extraCrit:0,extraLifesteal:0};
const b=game.questManager.getPassiveBonuses();
return {
dmgMult:1 + (b.dmgPct||0),
extraCrit:b.critChance||0,
extraLifesteal:b.lifestealBonus||0
};
}
calculateRankSuppression(skillRank=1,targetRank=1,target=null) {
if (!this.combat) return {multiplier:1.0,suppressed:false,blocked:false,label:""};
const res=_calcRankSuppressionCore.call(this.combat,skillRank,targetRank,target);
const sm=this.combat.game&&this.combat.game.stageManager;
if (res&& !res.blocked&&target&&target.isStageBoss&&sm&&sm.bossSealShieldActive) {
return {
...res,
multiplier:res.multiplier*0.30,
suppressed:true,
label:"🔒 Trận Nhãn Chưa Phá (-70% Sát Thương)"
};
}
return res;
}
rollCriticalAndCombo(baseDamage) {
const c=this.combat;
const passive=this.getPassiveDamageMultiplier();
const vanMarks=(c&&c.player&&typeof c.player.getEffectiveDaoMarks==="function")
?c.player.getEffectiveDaoMarks("Vận Đạo")
:0;
const combo=c?(c.comboCount||0) :0;
const pathCrit=(c&&c.player&&c.player.daoPassiveCrit)?c.player.daoPassiveCrit :0;
const pathLife=(c&&c.player&&c.player.daoPassiveLifesteal)?c.player.daoPassiveLifesteal :0;
const critChance=Math.min(0.78,0.10 + vanMarks*0.0014 + pathCrit + combo*0.006 + passive.extraCrit);
const isCrit=Math.random()<critChance;
const comboMultiplier=1 + Math.min(0.30,combo*0.01);
const critMultiplier=isCrit?1.75 :1.0;
const finalDamage=Math.max(1,Math.round(baseDamage*passive.dmgMult*comboMultiplier*critMultiplier));
return {damage:finalDamage,isCrit:isCrit,extraLifesteal:(passive.extraLifesteal||0) + pathLife};
}
}
global.DamageCalculator=DamageCalculator;
})(window);
