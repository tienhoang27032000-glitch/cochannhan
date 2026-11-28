(function (global) {
"use strict";
class CombatSystem {
constructor() {
this.game=null;
this.aperture=null;
this.player=null;
this.map=null;
this.guSystem=null;
this.enemies=null;
this.ui=null;
this.guCooldowns={};
this.killerCooldowns={};
this.dashCooldown=0;
this.projectiles=[];
this.aoeEffects=[];
this.groundZones=[];
this.fallingStrikes=[];
this.orbiters=[];
this.beastPhantoms=[];
this.summons=[];
this.beams=[];
this.lightningArcs=[];
this.afterimages=[];
this.particles=[];
this.floatingTexts=[];
this.comboCount=0;
this.comboTimer=0;
this.maxComboReached=0;
this.screenShakeTime=0;
this.screenShakeMagnitude=0;
this.iframeTimer=0;
this.momentum=0;
this.maxMomentum=100;
this.overdriveTimer=0;
this.guaranteedNextCrit=false;
this._inReaction=false;
this._fxFrameId=0;
this._fxBurstThisFrame=0;
this._fxTextThisFrame=0;
this._iconSpriteCache=new Map();
this.stageBlessings=[];
this._boundExtraControls=false;
this._castingKillerMove=false;
this.damageCalculator=global.DamageCalculator?new global.DamageCalculator(this) :null;
this.skillSystem=global.SkillSystem?new global.SkillSystem(this) :null;
this.buffSystem=global.BuffSystem?new global.BuffSystem(this) :null;
}
init(systems) {
this.game=systems.game||null;
this.aperture=systems.aperture||null;
this.player=systems.player||null;
this.map=systems.map||null;
this.guSystem=systems.guSystem||null;
this.enemies=systems.enemies||null;
this.ui=systems.ui||null;
this._bindAdvancedCombatInputs();
this._hookPlayerReflectAndIframe();
}
reset() {
this.guCooldowns={};
this.killerCooldowns={};
this.dashCooldown=0;
this.projectiles=[];
this.aoeEffects=[];
this.groundZones=[];
this.fallingStrikes=[];
this.orbiters=[];
this.beastPhantoms=[];
this.summons=[];
this.beams=[];
this.lightningArcs=[];
this.afterimages=[];
this.particles=[];
this.floatingTexts=[];
this.comboCount=0;
this.comboTimer=0;
this.screenShakeTime=0;
this.screenShakeMagnitude=0;
this.iframeTimer=0;
this.momentum=0;
this.overdriveTimer=0;
this.guaranteedNextCrit=false;
this.stageBlessings=[];
}
_bindAdvancedCombatInputs() {
if (this._boundExtraControls) return;
this._boundExtraControls=true;
window.addEventListener("keydown",(e)=>{
const tag=document.activeElement?document.activeElement.tagName.toLowerCase() :"";
if (tag==="input"||tag==="select"||tag==="textarea") return;
const _st=global.vanCoSettings;
if (_st&&(_st.isListeningKey()||_st.isOpen())) return;
if (global.vanCoQuickBag&&global.vanCoQuickBag.isOpen()) return;
if (this.game&&this.game.currentScreen==="battle"&& !e.repeat) {
const isJump=_st?_st.isActionKey("jump",e.code) :(e.code==="Space");
if (isJump) {
e.preventDefault();
if (this.player&&typeof this.player.triggerJump==="function") {
const jRes=this.player.triggerJump(this.map);
if (jRes&&jRes.jumped) {
if (global.vanCoSfx) global.vanCoSfx.play("jump");
if (jRes.isDoubleJump) {
this._spawnParticleBurst(this.player.x,this.player.y - this.player.z + 10,"#7ef7c4",6);
this.spawnFloatingText(this.player.x,this.player.y - this.player.z - 28,"Khinh Công!","#7ef7c4");
} else if (this.map&&this.map.isWaterAt&&this.map.isWaterAt(this.player.x,this.player.y)) {
this._spawnParticleBurst(this.player.x,this.player.y + 6,"#a8f0ff",7);
}
}
}
return;
}
const isDash=_st?_st.isActionKey("dash",e.code) :(e.code==="KeyG");
if (isDash) {
e.preventDefault();
this.performPhantomDash();
return;
}
const isOverdrive=_st?_st.isActionKey("overdrive",e.code) :(e.code==="KeyB");
if (isOverdrive) {
e.preventDefault();
this.activateBattleOverdrive();
return;
}
}
});
window.addEventListener("contextmenu",(e)=>{
if (this.game&&this.game.currentScreen==="battle") {
e.preventDefault();
this.performPhantomDash(true);
}
});
}
_hookPlayerReflectAndIframe() {
if (!this.player||this.player._combatHooked) return;
this.player._combatHooked=true;
const origTakeDamage=this.player.takeDamage.bind(this.player);
this.player.takeDamage=(rawDamage,sourceName="Đòn tấn công",attackerRank=null,attackerRef=null)=>{
if (this.iframeTimer>0&& !sourceName.includes("Khiếu Bích")) {
this.spawnFloatingText(this.player.x,this.player.y - 24,"Tàn Ảnh Né Tránh!","#6ce6b8");
return {damageTaken:0,isDead:false,dodged:true,source:sourceName};
}
if (this.game&&this.game.guHouse&&this.game.guHouse.isBoarded&&this.game.guHouse.shieldHp>0) {
const abs=this.game.guHouse.absorbIncomingDamage(rawDamage,sourceName);
if (abs.absorbed>0) {
if (abs.remaining<=0) {
this.spawnFloatingText(this.player.x,this.player.y - 34,`🏛️ Hộ Thuẫn -${abs.absorbed}`,"#7ef7f0");
return {damageTaken:0,isDead:false,absorbedByHouse:abs.absorbed,source:sourceName};
}
rawDamage=abs.remaining;
}
}
const activeDefBuff=this.player.activeBuffs.find(
b=>b.statMods&&(b.statMods.def>0||b.shieldHp>0)
);
const res=origTakeDamage(rawDamage,sourceName,attackerRank,attackerRef);
if (res.blocked) {
const nowMs=performance.now();
if (!this._lastRealmBlockTextAt||nowMs - this._lastRealmBlockTextAt>450) {
this._lastRealmBlockTextAt=nowMs;
const label=res.blockLabel||"🛡️ Hộ Thể Cảnh Giới (0)";
this.spawnFloatingText(this.player.x,this.player.y - 24,label,label.includes("👑")?"#ffd700" :"#7ef7f0");
}
return res;
}
if (activeDefBuff&&this.enemies&& !sourceName.includes("Khiếu Bích")) {
const playerRank=this.aperture?this.aperture.rank :1;
const reflectDmg=Math.max(3,Math.round(activeDefBuff.statMods.def*0.85));
const nearTargets=this.enemies.getHostileTargetsInRadius(this.player.x,this.player.y,105);
for (const t of nearTargets) {
const sup=this._calculateRankSuppression(playerRank,t.rank||1,t);
if (sup.blocked) continue;
const dealt=this.enemies.damageEntity(t,Math.round(reflectDmg*sup.multiplier),this.player,this);
if (dealt>0) {
this.spawnFloatingText(t.x,t.y - 22,`Phản Chấn -${dealt}`,"#e0be77");
}
}
this._spawnParticleBurst(this.player.x,this.player.y,"#e0be77",6);
}
return res;
};
}
performPhantomDash(towardCursor=false) {
if (!this.player||this.player.hp<=0) return false;
if (this.game&&(this.game.isBattlePaused||this.game.isPermadead)) return false;
if (this.dashCooldown>0) return false;
if (this.player.stamina<12) {
this.spawnFloatingText(this.player.x,this.player.y - 22,"Thiếu Thể Lực!","#ff9f43");
return false;
}
this.player.stamina=Math.max(0,this.player.stamina - 12);
this.dashCooldown=1.45;
this.iframeTimer=0.40;
let angle=this.player.aimAngle;
if (!towardCursor&&this.game&&this.game.input) {
const inp=this.game.input;
if (Math.abs(inp.analogX||0)>0.05||Math.abs(inp.analogY||0)>0.05) {
angle=Math.atan2(inp.analogY,inp.analogX);
} else {
const mx=(inp.right?1 :0) - (inp.left?1 :0);
const my=(inp.down?1 :0) - (inp.up?1 :0);
if (mx!==0||my!==0) {
angle=Math.atan2(my,mx);
}
}
}
let isPerfectDodge=false;
for (let i=0;i<this.projectiles.length;i++) {
const pr=this.projectiles[i];
if (pr.owner!=="player"&&Math.hypot(pr.x - this.player.x,pr.y - this.player.y)<=84) {
isPerfectDodge=true;
break;
}
}
if (!isPerfectDodge&&this.enemies&&Array.isArray(this.enemies.beasts)) {
for (let i=0;i<this.enemies.beasts.length;i++) {
const b=this.enemies.beasts[i];
if (!b.isDead&&b.telegraphState&&Math.hypot(b.telegraphState.x - this.player.x,b.telegraphState.y - this.player.y)<=b.telegraphState.radius + 22) {
isPerfectDodge=true;
break;
}
}
}
this._dashPlayerAlongAngle(angle,155,isPerfectDodge?"#ffd700" :"#6ce6b8");
if (isPerfectDodge) {
this.iframeTimer=0.72;
this.guaranteedNextCrit=true;
this.addMomentum(25);
this.player.addBuff({
id:"buff_perfect_dodge_counter",
name:"Thiên Cơ Phản Kích",
icon:"⚡",
duration:4.0,
statMods:{atk:Math.max(8,Math.round(this.player.atk*0.35))},
visualColor:"#ffd700"
});
if (global.vanCoSfx) global.vanCoSfx.play("reaction");
for (const k of Object.keys(this.guCooldowns)) {
this.guCooldowns[k]=Math.max(0,this.guCooldowns[k] - 2.0);
}
if (this.aperture) {
if (!this.aperture.isImmortal) {
this.aperture.currentEssence=Math.min(this.aperture.aptitude.maxSeaPercent,this.aperture.currentEssence + 12);
} else {
const r=this.aperture.rank||6;
this.aperture.immortalEssence[r]=Number(((this.aperture.immortalEssence[r]||0) + 1.2).toFixed(2));
}
}
this.triggerScreenShake(5,0.16);
this._spawnParticleBurst(this.player.x,this.player.y,"#ffd700",16);
this.spawnFloatingText(this.player.x,this.player.y - 34,"⚡ NÉ TRÁNH CỰC HẠN! (+Chân Nguyên & Bạo Kích)","#ffd700");
} else {
this.spawnFloatingText(this.player.x,this.player.y - 26,"Phá Không Thân Pháp!","#6ce6b8");
}
return true;
}
_dashPlayerAlongAngle(angle,dashDist=145,trailColor="#6ce6b8") {
const steps=6;
const stepX=(Math.cos(angle)*dashDist) / steps;
const stepY=(Math.sin(angle)*dashDist) / steps;
for (let i=1;i<=steps;i++) {
if (this.afterimages.length>=10) this.afterimages.shift();
this.afterimages.push({
x:this.player.x,
y:this.player.y,
facing:this.player.facing,
color:trailColor,
alpha:0.65 - i*0.08,
life:0.26 + i*0.04
});
const nx=this.player.x + stepX;
const ny=this.player.y + stepY;
if (!this.map||this.map.isWalkable(nx,ny,this.player.radius)) {
this.player.x=nx;
this.player.y=ny;
} else {
break;
}
}
this._spawnParticleBurst(this.player.x,this.player.y,trailColor,12);
}
getGuCooldownRemaining(instanceId) {
if (!instanceId) return 0;
return Math.max(0,this.guCooldowns[instanceId]||0);
}
getKillerMoveCooldownRemaining(moveId) {
if (!moveId) return 0;
return Math.max(0,this.killerCooldowns[moveId]||0);
}
_rollCriticalAndComboDamage(baseDamage) {return this.damageCalculator.rollCriticalAndCombo(baseDamage);}
_calculateRankSuppression(skillRank=1,targetRank=1,target=null) {return this.damageCalculator.calculateRankSuppression(skillRank,targetRank,target);}
addMomentum(amount=4) {
if (this.overdriveTimer>0) return;
this.momentum=Math.min(this.maxMomentum,Number((this.momentum + amount).toFixed(1)));
}
activateBattleOverdrive() {
if (!this.player||this.player.hp<=0) return false;
if (this.momentum<100||this.overdriveTimer>0) return false;
this.momentum=0;
this.overdriveTimer=10.0;
this.player.addBuff({
id:"battle_overdrive_dao",
name:"🔥 Đạo Ngân Bộc Phát",
icon:"🔥",
duration:10.0,
statMods:{
atk:Math.max(15,Math.round(this.player.atk*0.35)),
spdMult:1.24
},
visualColor:"#ffd700"
});
for (const k of Object.keys(this.guCooldowns)) this.guCooldowns[k]=0;
this.triggerScreenShake(8,0.25);
this._spawnParticleBurst(this.player.x,this.player.y,"#ffd700",24);
this.spawnFloatingText(this.player.x,this.player.y - 42,"🔥 CHIẾN Ý BỘC PHÁT — VẠN CỔ ĐỒNG MINH (10s)!","#ffd700");
if (this.ui) {
this.ui.addLog("🔥 Kích hoạt 【Chiến Ý Bộc Phát】 (10s): +35% Công Kích, +24% Tốc Độ, Xóa Hồi Chiêu Cổ Trùng!","combat");
this.ui.updateBattleHUD();
}
return true;
}
applyStageBlessing(blessing) {
if (!blessing) return;
this.stageBlessings.push(blessing);
if (this.player) {
if (blessing.id==="bless_heal_shield") {
this.player.heal(Math.round(this.player.maxHp*0.65));
this.player.addBuff({
id:"blessing_aegis",
name:"🛡️ Phúc Duyên Hộ Thuẫn",
icon:"🛡️",
duration:30,
statMods:{def:Math.max(12,Math.round(this.player.def*0.35))},
shieldHp:Math.round(this.player.maxHp*0.45),
visualColor:"#4ce6ff"
});
} else if (blessing.id==="bless_atk_surge") {
this.player.addBuff({
id:"blessing_atk",
name:"⚔️ Sát Ý Lăng Lệ (+32% ATK)",
icon:"⚔️",
duration:45,
statMods:{atk:Math.max(12,Math.round(this.player.atk*0.32))},
visualColor:"#ff5733"
});
} else if (blessing.id==="bless_essence_fountain") {
if (this.aperture&& !this.aperture.isImmortal) {
this.aperture.currentEssence=this.aperture.aptitude.maxSeaPercent;
} else if (this.aperture) {
const r=this.aperture.rank||6;
this.aperture.immortalEssence[r]=Number(((this.aperture.immortalEssence[r]||0) + 4).toFixed(2));
}
this.momentum=100;
}
}
if (this.ui) {
this.ui.addLog(`✨ Đã lĩnh ngộ Cơ Duyên Chiến Thuật: 【${blessing.name}】!`,"loot");
this.ui.updateBattleHUD();
}
}
_checkDaoElementalReaction(target,incomingPath,actualDmg) {
if (this._inReaction|| !target||target.isDead|| !incomingPath) return;
const now=performance.now();
if (target._lastReactionAt&&now - target._lastReactionAt<900) return;
const prevPath=target._auraPath;
const prevAt=target._auraPathAt||0;
target._auraPath=incomingPath;
target._auraPathAt=now;
if (!prevPath||prevPath===incomingPath||(now - prevAt)>6500) return;
const pair=[prevPath,incomingPath];
const has=(a,b)=>pair.includes(a)&&pair.includes(b);
let triggered=false;
this._inReaction=true;
try {
if (has("Băng Đạo","Viêm Đạo")) {
triggered=true;
const bonus=Math.max(8,Math.round(actualDmg*0.75));
this.enemies.damageEntity(target,bonus,this.player,this,true);
this.spawnFloatingText(target.x,target.y - 38,`💨 DUNG GIẢI BỘC PHÁ -${bonus}!`,"#ff9f43");
this._spawnParticleBurst(target.x,target.y,"#ff9f43",14);
} else if ((has("Lôi Đạo","Thủy Đạo")||has("Lôi Đạo","Băng Đạo"))&&this.enemies) {
triggered=true;
this.triggerChainLightning(target.x,target.y,Math.max(10,Math.round(actualDmg*0.55)),3,"#4ce6ff",this.aperture?this.aperture.rank :1);
this.spawnFloatingText(target.x,target.y - 38,"⚡ CẢM ĐIỆN LIÊN HOÀN!","#4ce6ff");
} else if (has("Độc Đạo","Viêm Đạo")) {
triggered=true;
const blast=Math.max(10,Math.round(actualDmg*0.65));
this.spawnAoEEffect({owner:"player",name:"Hủ Độc Bạo Tạc",skillRank:this.aperture?this.aperture.rank :1,x:target.x,y:target.y,radius:105,damage:blast,color:"#9b59b6",duration:0.35});
this.spawnFloatingText(target.x,target.y - 38,"💥 HỦ ĐỘC BẠO TẠC!","#c278ff");
} else if (pair.includes("Phong Đạo")&&(pair.includes("Viêm Đạo")||pair.includes("Băng Đạo")||pair.includes("Độc Đạo"))) {
triggered=true;
const swirl=Math.max(8,Math.round(actualDmg*0.5));
this.spawnAoEEffect({owner:"player",name:"Khuếch Tán Phong Bạo",skillRank:this.aperture?this.aperture.rank :1,x:target.x,y:target.y,radius:120,damage:swirl,color:"#6ce6b8",duration:0.35});
this.spawnFloatingText(target.x,target.y - 38,"🌪️ KHUẾCH TÁN PHONG BẠO!","#6ce6b8");
} else if (has("Huyết Đạo","Hồn Đạo")&&this.player) {
triggered=true;
const healV=this.player.heal(Math.max(8,Math.round(this.player.maxHp*0.08)));
this.player.mental=Math.min(this.player.maxMental,this.player.mental + 15);
this.spawnFloatingText(this.player.x,this.player.y - 34,`🩸 HUYẾT HỒN PHẢN PHỆ (+${healV} HP, +15🧠)`,"#ff85d5");
} else if (has("Kim Đạo","Kiếm Đạo")) {
triggered=true;
const bonus=Math.max(10,Math.round(actualDmg*0.80));
this.enemies.damageEntity(target,bonus,this.player,this,true);
this._applyStatusEffect(target,"bleed",this.aperture?this.aperture.rank :1);
this.spawnFloatingText(target.x,target.y - 38,`⚔️ KIM KIẾM CỘNG HƯỞNG -${bonus}!`,"#e6f2fa");
} else if (has("Thổ Đạo","Mộc Đạo")) {
triggered=true;
const bonus=Math.max(8,Math.round(actualDmg*0.55));
target.stunTimer=Math.max(target.stunTimer||0,1.4);
this.spawnAoEEffect({owner:"player",name:"Địa Mạch Quấn Trói",skillRank:this.aperture?this.aperture.rank :1,x:target.x,y:target.y,radius:110,damage:bonus,color:"#5cc995",duration:0.35});
this.spawnFloatingText(target.x,target.y - 38,"🌿 ĐỊA MẠCH QUẤN TRÓI (Choáng)!","#7ef7c4");
} else if (has("Quang Đạo","Ám Đạo")) {
triggered=true;
const bonus=Math.max(12,Math.round(actualDmg*0.85));
this.enemies.damageEntity(target,bonus,this.player,this,true);
this.addMomentum(12);
this.spawnFloatingText(target.x,target.y - 38,`☯️ ÂM DƯƠNG NỔ TUNG -${bonus}!`,"#ffd700");
} else if (has("Lực Đạo","Hồn Đạo")) {
triggered=true;
const bonus=Math.max(10,Math.round(actualDmg*0.65));
target.stunTimer=Math.max(target.stunTimer||0,1.1);
this.enemies.damageEntity(target,bonus,this.player,this,true);
this.spawnFloatingText(target.x,target.y - 38,`💥 LỰC HỒN CHẤN PHÁ -${bonus}!`,"#ff9f43");
} else if (pair.includes("Thời Gian Đạo")||pair.includes("Không Gian Đạo")) {
triggered=true;
for (const k of Object.keys(this.guCooldowns)) this.guCooldowns[k]=Math.max(0,this.guCooldowns[k] - 1.0);
for (const k of Object.keys(this.killerCooldowns)) this.killerCooldowns[k]=Math.max(0,this.killerCooldowns[k] - 1.2);
const bonus=Math.max(8,Math.round(actualDmg*0.45));
this.enemies.damageEntity(target,bonus,this.player,this,true);
this.spawnFloatingText(target.x,target.y - 38,"⏳ THỜI KHÔNG GIA TỐC (-1.2s CD)!","#7ef7f0");
}
if (triggered) {
target._lastReactionAt=now;
target._auraPath=null;
this.addMomentum(16);
this.triggerScreenShake(4,0.14);
if (global.vanCoSfx) global.vanCoSfx.play("reaction");
}
} finally {
this._inReaction=false;
}
}
_registerComboHit() {
this.comboCount +=1;
this.addMomentum(4.5);
this.comboTimer=4.0;
if (this.comboCount>this.maxComboReached) {
this.maxComboReached=this.comboCount;
}
if (this.comboCount % 12===0&&this.aperture) {
if (!this.aperture.isImmortal) {
this.aperture.currentEssence=Math.min(
this.aperture.aptitude.maxSeaPercent,
this.aperture.currentEssence + 1.5
);
this.spawnFloatingText(this.player.x,this.player.y - 34,`${this.comboCount} Liên Kích! (+1.5% Chân Nguyên)`,"#ffd700");
} else {
const immGain=this.aperture.rank>=9?0.60 :(this.aperture.rank>=8?0.45 :0.35);
this.aperture.immortalEssence[this.aperture.rank]=Number(((this.aperture.immortalEssence[this.aperture.rank]||0) + immGain).toFixed(2));
this.spawnFloatingText(this.player.x,this.player.y - 34,`${this.comboCount} Liên Kích! (+${immGain} Tiên Nguyên)`,"#7ef7f0");
}
}
}
triggerScreenShake(magnitude=5,duration=0.20) {
this.screenShakeMagnitude=Math.max(this.screenShakeMagnitude,magnitude);
this.screenShakeTime=Math.max(this.screenShakeTime,duration);
}
_applyPlayerDamageToTarget(target,rawDamage,sourceEffect={}) {
if (!target||target.isDead) return false;
const skillRank=sourceEffect.skillRank||(this.aperture?this.aperture.rank :1);
const targetRank=target.rank||1;
const suppression=this._calculateRankSuppression(skillRank,targetRank,target);
if (suppression.blocked||suppression.multiplier<=0) {
const nowMs=performance.now();
if (!target._lastBlockTextAt||nowMs - target._lastBlockTextAt>380) {
target._lastBlockTextAt=nowMs;
this.spawnFloatingText(target.x,target.y - 30,`🛡️ ${suppression.label}`,"#90caf9");
}
if (target.entityType==="npc"&& !target.isHostile) {
target.becomeHostile(true);
} else if (target.entityType==="beast") {
target.aiState="chase";
}
return false;
}
let bonusMult=1.0;
if (target.poisonTimer&&target.poisonTimer>0) bonusMult +=0.25;
if (target.freezeTimer&&target.freezeTimer>0) bonusMult +=0.20;
let killerMoveMit=1.0;
if (sourceEffect.isKillerMove) {
const nowMs=performance.now();
if (!target._kmBurstExpireAt||nowMs>target._kmBurstExpireAt) {
target._kmBurstCount=0;
}
target._kmBurstCount=(target._kmBurstCount||0) + 1;
target._kmBurstExpireAt=nowMs + 750;
const multiHitFalloff=target._kmBurstCount===1
?1.0
:(target._kmBurstCount===2?0.75 :(target._kmBurstCount===3?0.58 :0.45));
const tierFortitude=target.isVenerable
?0.88
:(target.isBoss?0.75 :(target.isElite?0.82 :0.90));
killerMoveMit=multiHitFalloff*tierFortitude;
}
if (target.staggeredTimer&&target.staggeredTimer>0) bonusMult +=0.45;
if (this.overdriveTimer>0) bonusMult +=0.25;
const adjustedDamage=Math.max(0,rawDamage*bonusMult*suppression.multiplier*killerMoveMit);
const roll=this._rollCriticalAndComboDamage(adjustedDamage);
if (this.guaranteedNextCrit) {
this.guaranteedNextCrit=false;
if (!roll.isCrit) {
roll.isCrit=true;
roll.damage=Math.round(roll.damage*1.85);
}
}
const actualDmg=this.enemies
?this.enemies.damageEntity(target,roll.damage,this.player,this)
:roll.damage;
if (actualDmg<=0) {
const nowMs=performance.now();
if (!target._lastDefTextAt||nowMs - target._lastDefTextAt>360) {
target._lastDefTextAt=nowMs;
this.spawnFloatingText(target.x,target.y - 26,"🛡️ Không Phá Nổi Giáp (0)","#b0bec5");
}
return false;
}
this._registerComboHit();
target.hitFlashTimer=0.14;
if ((target.isBoss||target.isElite)&&(!target.staggeredTimer||target.staggeredTimer<=0)) {
if (!target.maxPoise) {
target.maxPoise=target.isVenerable?240 :(target.isBoss?120 :60);
target.poise=target.maxPoise;
}
const poiseHit=sourceEffect.isKillerMove?26 :(roll.isCrit?14 :8);
target.poise=Math.max(0,target.poise - poiseHit);
if (target.poise<=0) {
target.staggeredTimer=2.6;
target.stunTimer=Math.max(target.stunTimer||0,2.2);
target.poise=target.maxPoise;
this.addMomentum(20);
this.triggerScreenShake(7,0.22);
this.spawnFloatingText(target.x,target.y - 46,"💥 PHÁ THẾ! (+45% Sát Thương 2.6s)","#ffd700");
}
}
if (sourceEffect.path) {
this._checkDaoElementalReaction(target,sourceEffect.path,actualDmg);
}
if (suppression.suppressed&&target.isBoss&&Math.random()<0.35) {
this.spawnFloatingText(target.x,target.y - 40,`🛡️ ${suppression.label}`,"#ff9f43");
}
if (roll.isCrit) {
this.spawnFloatingText(target.x,target.y - 26,`BẠO KÍCH -${Math.round(actualDmg)}!`,"#ffd700");
this.triggerScreenShake(3.5,0.14);
} else {
this.spawnFloatingText(target.x,target.y - 20,`-${Math.round(actualDmg)}`,"#f7c948");
}
this._spawnParticleBurst(target.x,target.y,sourceEffect.color||"#e05252",roll.isCrit?12 :6);
const totalLifesteal=(sourceEffect.lifesteal||0) + (roll.extraLifesteal||0);
if (totalLifesteal>0&&this.player) {
const healVal=Math.max(1,Math.round(actualDmg*totalLifesteal));
const healed=this.player.heal(healVal);
if (healed>0) {
this.spawnFloatingText(this.player.x,this.player.y - 24,`+${healed} HP`,"#ff6b6b");
}
}
if (sourceEffect.slowEffect&&sourceEffect.slowEffect>0) {
target.slowTimer=Math.max(target.slowTimer||0,3.5);
target.slowFactor=1 - sourceEffect.slowEffect;
}
if (sourceEffect.statusEffect) {
this._applyStatusEffect(target,sourceEffect.statusEffect,4.0,Math.max(2,Math.round(actualDmg*0.14)));
}
}
_applyStatusEffect(target,statusType,duration=4.0,dotDamage=4) {this.buffSystem.applyStatus(target,statusType,duration,dotDamage);}
_knockbackTarget(target,sourceX,sourceY,force=80) {
if (!target||target.isDead) return;
const actualForce=(target.isVenerable||target.rank>=9)
?force*0.15
:(target.isBoss?force*0.35 :force);
const ang=Math.atan2(target.y - sourceY,target.x - sourceX);
const nx=target.x + Math.cos(ang)*actualForce;
const ny=target.y + Math.sin(ang)*actualForce;
if (!this.map||this.map.isWalkable(nx,ny,target.radius)) {
target.x=nx;
target.y=ny;
}
}
_pointToSegmentDistance(px,py,x1,y1,x2,y2) {
const A=px - x1;
const B=py - y1;
const C=x2 - x1;
const D=y2 - y1;
const dot=A*C + B*D;
const lenSq=C*C + D*D;
let param= -1;
if (lenSq!==0) param=dot / lenSq;
let xx,yy;
if (param<0) {
xx=x1;
yy=y1;
} else if (param>1) {
xx=x2;
yy=y2;
} else {
xx=x1 + param*C;
yy=y1 + param*D;
}
return Math.hypot(px - xx,py - yy);
}
_spawnParticleBurst(x,y,color,count=10) {
if (this._fxBurstThisFrame>=5) return;
this._fxBurstThisFrame +=1;
const _q=global.vanCoSettings?global.vanCoSettings.get("graphicsQuality") :"high";
const _qMult=_q==="low"?0.28 :(_q==="medium"?0.58 :1.0);
const isMob=document.body&&document.body.classList.contains("mobile-ui");
const cap=Math.max(16,Math.round((isMob?42 :72)*_qMult));
const actualCount=Math.max(1,Math.min(10,Math.round((isMob?Math.min(count,6) :Math.min(count,10))*_qMult)));
if (this.particles.length>=cap) {
this.particles.splice(0,Math.min(actualCount,this.particles.length));
}
for (let i=0;i<actualCount;i++) {
const ang=Math.random()*Math.PI*2;
const spd=35 + Math.random()*120;
this.particles.push({
x:x,
y:y,
vx:Math.cos(ang)*spd,
vy:Math.sin(ang)*spd,
size:2.5 + Math.random()*3.5,
color:color,
alpha:1.0,
life:0.25 + Math.random()*0.35
});
}
}
spawnFloatingText(x,y,text,color="#ffffff") {
if (global.vanCoSettings&& !global.vanCoSettings.get("floatingTextEnabled")) return;
const isImportant=text.includes("【")||text.includes("PHÁ THẾ")||text.includes("BẠO KÍCH");
if (!isImportant&&this._fxTextThisFrame>=4) return;
this._fxTextThisFrame +=1;
const maxTexts=14;
if (this.floatingTexts.length>=maxTexts) this.floatingTexts.shift();
this.floatingTexts.push({
x:x + (Math.random() - 0.5)*18,
y:y,
text:text,
color:color,
isBig:isImportant,
vy:-42,
alpha:1.0,
life:0.9
});
}
}
global.CombatSystem=CombatSystem;
})(window);
