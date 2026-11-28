(function (global) {
"use strict";
Object.assign(global.CombatSystem.prototype, {
activateGuSlot(slotIdx,targetX,targetY) {
if (!this.guSystem|| !this.player|| !this.aperture) return false;
if (this.player.hp<=0) return false;
if (this.game&&(this.game.isBattlePaused||this.game.isPermadead)) return false;
const gu=this.guSystem.getEquippedGuAt(slotIdx);
if (!gu) {
if (this.ui) this.ui.addLog(`Ô kỹ năng ${slotIdx + 1} chưa trang bị Cổ Trùng!`,"warning");
return false;
}
const fullGuName=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(gu)
:`${gu.name} (${gu.rank} Chuyển)`;
if (!gu.isRefined) {
if (this.ui) this.ui.addLog(`[${fullGuName}] chưa được luyện hóa!`,"warning");
return false;
}
if (gu.hunger<=0) {
if (this.ui) this.ui.addLog(`[${fullGuName}] đang đói kiệt sức (0%)! Hãy cho ăn trong Kho Cổ.`,"danger");
return false;
}
// Nghịch Lưu Hà Law: ALL Gu worms below Rank 9 are suppressed! Use Perseverance Martial Strike instead!
const inReverseFlowStage=Boolean(this.game&&this.game.activeStage&&this.game.activeStage.id==="stage_21");
if (inReverseFlowStage&&(gu.rank||1)<9) {
const nowMs=performance.now();
if (this._rfMartialCd&&nowMs<this._rfMartialCd) return false;
this._rfMartialCd=nowMs + 420;
const aimX=typeof targetX==="number"?targetX :(this.game&&this.game.input?this.game.input.mouseWorldX :this.player.x + 120);
const aimY=typeof targetY==="number"?targetY :(this.game&&this.game.input?this.game.input.mouseWorldY :this.player.y);
const ang=Math.atan2(aimY - this.player.y,aimX - this.player.x);
this.player.aimAngle=ang;
this.player.triggerAttackAnimation();
const strikePower=Math.max(45,Math.round((this.player.atk||120)*3.2));
this.spawnProjectile({
owner:"player",name:"👊 Quyền Cước Ý Chí Kiên Trì",skillRank:this.aperture?this.aperture.rank :7,path:"Lực Đạo",
x:this.player.x + Math.cos(ang)*16,y:this.player.y + Math.sin(ang)*16,angle:ang,
speed:520,maxRange:290,radius:22,damage:strikePower,color:"#7ef7f0",pierce:3
});
if (!this._lastRfBlockLog||nowMs - this._lastRfBlockLog>2200) {
this._lastRfBlockLog=nowMs;
this.spawnFloatingText(this.player.x,this.player.y - 34,"🌊 Nghịch Lưu Hà cấm Cổ < 9 Chuyển! Tung Quyền Cước Ý Chí!","#4ce6ff");
}
return true;
}
if (this.getGuCooldownRemaining(gu.instanceId)>0) return false;
if (!this.aperture.hasEnoughEssence(gu.essenceCost,gu.rank,gu.path)) {
this.spawnFloatingText(this.player.x,this.player.y - 24,"Thiếu Chân Nguyên!","#ff6b6b");
return false;
}
const consumeRes=this.aperture.consumeEssence(gu.essenceCost,gu.rank,gu.path);
if (!consumeRes.success) return false;
const cdMultiplier=this.skillSystem
?this.skillSystem.getCooldownMultiplier(this.player)
:Math.max(0.50,1 - ((this.player&&typeof this.player.getEffectiveDaoMarks==="function")?this.player.getEffectiveDaoMarks("Thời Gian Đạo") :0)*0.0015);
this.guCooldowns[gu.instanceId]=Number((gu.cooldown*cdMultiplier).toFixed(2));
gu.hunger=Math.max(0,Number((gu.hunger - 0.30).toFixed(2)));
const daoAmp=this.player.calculateDaoAmplification(gu.path,[]);
const pRankNow=this.aperture?(this.aperture.rank||1) :1;
const venEssenceBoost=(pRankNow>=9&&gu.rank>=6&&gu.rank<9)
?({6:3.2,7:2.2,8:1.5}[gu.rank]||1.0)
:1.0;
const finalPower=Math.max(5,Math.round(gu.power*daoAmp.multiplier*venEssenceBoost));
const aimX=typeof targetX==="number"
?targetX
:(this.game&&this.game.input?this.game.input.mouseWorldX :this.player.x + Math.cos(this.player.aimAngle)*160);
const aimY=typeof targetY==="number"
?targetY
:(this.game&&this.game.input?this.game.input.mouseWorldY :this.player.y + Math.sin(this.player.aimAngle)*160);
const angle=Math.atan2(aimY - this.player.y,aimX - this.player.x);
this.player.aimAngle=angle;
this.player.triggerAttackAnimation();
this._executeSingleGuSkill(gu,finalPower,angle,aimX,aimY);
if (this.game) this.game.hudRefreshTimer=0.2;
else if (this.ui&&typeof this.ui.updateBattleHUD==="function") this.ui.updateBattleHUD();
return true;
},
_executeSingleGuSkill(gu,finalPower,angle,aimX,aimY) {
const guRank=gu.rank||1;
if (gu.path==="Nô Đạo"&&this.game&&this.game.beastArmy) {
this.game.beastArmy.applyEnslavementPathBuff(guRank,gu.name||"Nô Đạo Cổ");
}
const fullGuName=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(gu)
:gu.name;
if (gu.path==="Lực Đạo") {
this.spawnBeastPhantom({
name:`${fullGuName} Thú Ảnh`,
skillRank:guRank,
icon:gu.icon||"🐗",
x:this.player.x,
y:this.player.y,
angle:angle,
speed:350 + guRank*30,
maxDistance:160 + guRank*35,
radius:30 + guRank*8,
damage:finalPower,
color:gu.visualColor||"#e07a45",
stunDuration:0.9 + guRank*0.2,
knockbackForce:65 + guRank*12
});
this.triggerScreenShake(2 + guRank,0.18);
return;
}
if (gu.path==="Lôi Đạo") {
if (gu.type==="movement") {
this.player.addBuff({
id:`buff_${gu.id}`,
name:fullGuName,
icon:gu.icon,
duration:gu.buffDuration||8,
statMods:{spdMult:gu.speedBoost||1.75},
visualColor:"#a569bd"
});
this._dashPlayerAlongAngle(angle,140,"#a569bd");
}
this.triggerChainLightning(
this.player.x + Math.cos(angle)*45,
this.player.y + Math.sin(angle)*45,
finalPower,
1 + guRank,
"#b75cff",
guRank
);
return;
}
if (gu.id==="dinh_tien_du_gu") {
const dist=Math.min(gu.range||520,Math.hypot(aimX - this.player.x,aimY - this.player.y));
const destX=this.player.x + Math.cos(angle)*dist;
const destY=this.player.y + Math.sin(angle)*dist;
if (!this.map||this.map.isWalkable(destX,destY,this.player.radius)) {
this._spawnParticleBurst(this.player.x,this.player.y,"#5cc995",20);
this.player.x=destX;
this.player.y=destY;
}
this.spawnAoEEffect({
owner:"player",
name:fullGuName,
skillRank:guRank,
x:this.player.x,
y:this.player.y,
radius:140,
damage:finalPower,
color:"#5cc995",
duration:0.45
});
return;
}
if (gu.castType==="projectile") {
const isHoming=gu.path==="Kiếm Đạo"||guRank>=6;
const isSpinning=gu.id==="cot_thuong_gu"||guRank>=2;
let statusType=null;
if (gu.path==="Huyết Đạo"||gu.path==="Kiếm Đạo") statusType="bleed";
else if (gu.path==="Băng Đạo") statusType="chill";
else if (gu.path==="Viêm Đạo") statusType="burn";
else if (gu.path==="Độc Đạo"||gu.path==="Ám Đạo") statusType="poison";
this.spawnProjectile({
owner:"player",
guId:gu.id,
name:fullGuName,
skillRank:guRank,
path:gu.path,
x:this.player.x + Math.cos(angle)*16,
y:this.player.y + Math.sin(angle)*16,
angle:angle,
speed:gu.projectileSpeed||450,
maxRange:gu.range||320,
radius:gu.radius||18,
damage:finalPower,
color:gu.projectileColor||"#38c992",
slowEffect:gu.slowEffect||0,
lifesteal:gu.lifesteal||0,
pierce:Math.min(5,Math.ceil(guRank / 2)),
homing:isHoming,
spinning:isSpinning,
ricochet:(gu.id==="nguyet_quang_gu"&&guRank>=2)?1 :0,
statusEffect:statusType
});
return;
}
if (gu.castType==="aoe_cursor") {
const dist=Math.hypot(aimX - this.player.x,aimY - this.player.y);
const clampedDist=Math.min(dist,gu.range||300);
const castX=this.player.x + Math.cos(angle)*clampedDist;
const castY=this.player.y + Math.sin(angle)*clampedDist;
let statusType="burn";
if (gu.path==="Băng Đạo") statusType="chill";
else if (gu.path==="Độc Đạo") statusType="poison";
else if (gu.path==="Huyết Đạo") statusType="bleed";
this.spawnAoEEffect({
owner:"player",
name:fullGuName,
skillRank:guRank,
x:castX,
y:castY,
radius:gu.radius||75,
damage:finalPower,
color:gu.projectileColor||"#ff5733",
duration:0.45,
lifesteal:gu.lifesteal||0,
statusEffect:statusType
});
if (guRank>=2||gu.path==="Độc Đạo"||gu.path==="Viêm Đạo") {
if (this.groundZones.length>=6) this.groundZones.shift();
this.groundZones.push({
isKillerMove:Boolean(this._castingKillerMove),
x:castX,
y:castY,
skillRank:guRank,
radius:(gu.radius||75)*0.85,
color:gu.projectileColor||"#ff5733",
damagePerTick:Math.max(2,Math.round(finalPower*0.20)),
tickTimer:0.45,
duration:2.5 + guRank*0.5,
statusEffect:statusType,
pullForce:0
});
}
return;
}
if (gu.castType==="aoe_self") {
this.spawnAoEEffect({
owner:"player",
name:fullGuName,
skillRank:guRank,
x:this.player.x,
y:this.player.y,
radius:gu.radius||110,
damage:finalPower,
color:gu.visualColor||"#c0392b",
duration:0.45,
lifesteal:gu.lifesteal||0,
statusEffect:gu.path==="Hồn Đạo"?"stun" :"bleed",
knockbackForce:65
});
return;
}
if (gu.castType==="self_buff") {
if (gu.type==="defensive") {
const shieldHp=Math.round((gu.shieldAmount||gu.power)*(this.player.calculateDaoAmplification(gu.path,[]).multiplier));
this.player.addBuff({
id:`buff_${gu.id}`,
name:fullGuName,
icon:gu.icon,
duration:gu.buffDuration||10,
statMods:{def:gu.power},
shieldHp:shieldHp,
visualColor:gu.visualColor||"#e8f6f3"
});
this.spawnFloatingText(this.player.x,this.player.y - 28,`🛡️ Hộ Thuẫn +${shieldHp}`,"#e0be77");
} else if (gu.type==="movement") {
this.player.addBuff({
id:`buff_${gu.id}`,
name:fullGuName,
icon:gu.icon,
duration:gu.buffDuration||7,
statMods:{spdMult:gu.speedBoost||1.45},
visualColor:gu.visualColor||"#6ce6b8"
});
this._dashPlayerAlongAngle(angle,115 + guRank*20,gu.visualColor||"#6ce6b8");
} else if (gu.subType==="recon") {
this.player.addBuff({
id:`buff_${gu.id}`,
name:fullGuName,
icon:gu.icon,
duration:gu.buffDuration||15,
statMods:{vision:160},
visualColor:"#76d7c4"
});
this.spawnFloatingText(this.player.x,this.player.y - 26,"👁️ Trinh Sát Lộ Điểm Yếu!","#76d7c4");
} else if (gu.subType==="cultivation") {
const wallGain=Math.max(3,Math.round(gu.power*0.18));
if (!this.aperture.isImmortal) {
this.aperture.wallProgress=Math.min(
this.aperture.maxWallProgress,
this.aperture.wallProgress + wallGain
);
}
this.spawnFloatingText(this.player.x,this.player.y - 26,`+${wallGain} Ôn Dưỡng Khiếu`,"#f7c948");
}
this._spawnParticleBurst(this.player.x,this.player.y,gu.visualColor||"#e0be77",14);
return;
}
if (gu.castType==="heal") {
const actualHealed=this.player.heal(finalPower);
this.spawnFloatingText(this.player.x,this.player.y - 28,`💚 +${actualHealed} HP`,"#4cd964");
this._spawnParticleBurst(this.player.x,this.player.y,"#4cd964",16);
}
},
activateKillerMoveSlot(kSlotIdx,targetX,targetY) {
if (!this.guSystem|| !this.player|| !this.aperture) return false;
if (this.player.hp<=0) return false;
if (this.game&&(this.game.isBattlePaused||this.game.isPermadead)) return false;
const keys=["Z","X","C","V"];
const move=this.guSystem.getEquippedKillerMoveAt(kSlotIdx);
if (!move) {
if (this.ui) {
this.ui.addLog(`Phím [${keys[kSlotIdx]}] chưa gán Sát Chiêu! Mở [Thiên Cơ Sát Chiêu] để thiết lập.`,"warning");
}
return false;
}
if (!move.combatProfile&&typeof this.guSystem._recalculateSavedKillerMoves==="function") {
this.guSystem._recalculateSavedKillerMoves();
}
const checkComp=this.guSystem.validateKillerMoveComponents(move);
if (!checkComp.valid) {
if (this.ui) this.ui.addLog(checkComp.reason,"danger");
this.spawnFloatingText(this.player.x,this.player.y - 26,"Thiếu Cổ Thành Phần!","#e05252");
return false;
}
if (this.getKillerMoveCooldownRemaining(move.id)>0) return false;
const moveRank=move.moveRank||(move.isImmortal?6 :1);
const inReverseFlowStageKm=Boolean(this.game&&this.game.activeStage&&this.game.activeStage.id==="stage_21");
if (inReverseFlowStageKm&&moveRank<9) {
this.spawnFloatingText(this.player.x,this.player.y - 36,"🌊 Nghịch Lưu Hà cấm Sát Chiêu < 9 Chuyển!","#ff6b6b");
if (this.ui) this.ui.addLog("🌊 [Luật Nghịch Lưu Hà] Không thể thúc giục Cổ Trùng hay Sát Chiêu dưới Cửu Chuyển trong Nghịch Lưu Hà! Hãy dùng Cổ 9 Chuyển hoặc Quyền Cước Ý Chí!","warning");
return false;
}
if (!this.aperture.hasEnoughEssence(move.essenceCost,moveRank,move.path)) {
this.spawnFloatingText(this.player.x,this.player.y - 24,"Không Đủ Chân Nguyên!","#ff6b6b");
return false;
}
this.aperture.consumeEssence(move.essenceCost,moveRank,move.path);
this.killerCooldowns[move.id]=move.cooldown||5.5;
for (const reqId of move.requiredGuIds) {
const compGu=this.guSystem.ownedGuList.find(g=>g.id===reqId&&g.isRefined);
if (compGu) {
compGu.hunger=Math.max(0,Number((compGu.hunger - 0.35).toFixed(2)));
}
}
const daoAmp=this.player.calculateDaoAmplification(move.path,[]);
const pRankNow=this.aperture?(this.aperture.rank||1) :1;
const venEssenceBoost=(pRankNow>=9&&moveRank>=6&&moveRank<9)
?({6:3.2,7:2.2,8:1.5}[moveRank]||1.0)
:1.0;
const totalPower=Math.max(20,Math.round(move.power*daoAmp.multiplier*venEssenceBoost));
const aimX=typeof targetX==="number"
?targetX
:(this.game&&this.game.input?this.game.input.mouseWorldX :this.player.x + Math.cos(this.player.aimAngle)*200);
const aimY=typeof targetY==="number"
?targetY
:(this.game&&this.game.input?this.game.input.mouseWorldY :this.player.y + Math.sin(this.player.aimAngle)*200);
const baseAngle=Math.atan2(aimY - this.player.y,aimX - this.player.x);
this.player.aimAngle=baseAngle;
const profile=move.combatProfile||{
deliveryType:"crescent_barrage",
moveRank:moveRank,
primaryColor:"#7ef7f0",
secondaryColor:"#5cc995",
projectileCount:1 + moveRank,
projectileSpeed:480,
range:340,
aoeRadius:85 + moveRank*15,
phantomIcon:"🐗",
phantomCount:1,
modifiers:[],
speedBoost:move.speedBoost||0,
boostDuration:6,
shieldAmount:move.shieldAmount||0,
healAmount:move.healAmount||0,
lifesteal:move.lifesteal||0
};
const rankName=global.GuSystem.getRankName?global.GuSystem.getRankName(moveRank) :`${moveRank} Chuyển`;
this.player.triggerAttackAnimation();
this.triggerScreenShake(2 + moveRank*1.2,0.22);
this.spawnFloatingText(this.player.x,this.player.y - 38,`⚡ 【${move.name} (${rankName})】`,"#ffd700");
if (this.ui) {
this.ui.addLog(`⚡ Phát động Sát Chiêu 【${move.name} (${rankName})】 (Uy lực thực tế: ${totalPower})!`,"combat");
}
this._castingKillerMove=true;
try {
if (move.path==="Nô Đạo"&&this.game&&this.game.beastArmy) {
this.game.beastArmy.applyEnslavementPathBuff(moveRank,move.name||"Nô Đạo Sát Chiêu");
}
this._executeKillerMovePrimaryDelivery(move,profile,totalPower,baseAngle,aimX,aimY);
this._executeKillerMoveSupportModifiers(move,profile,totalPower,baseAngle,aimX,aimY);
} finally {
this._castingKillerMove=false;
}
if (this.ui) this.ui.updateHUD();
return true;
},
_executeKillerMovePrimaryDelivery(move,profile,totalPower,baseAngle,aimX,aimY) {
const rank=profile.moveRank||move.moveRank||1;
const mods=profile.modifiers||[];
const isHoming=mods.includes("homing_guidance")||profile.deliveryType==="sword_formation";
const isSpinning=mods.includes("ricochet_spin")||profile.deliveryType==="bone_spear_rain";
const ricochetCount=mods.includes("ricochet_spin")?Math.min(3,rank) :0;
const distToCursor=Math.min(profile.range||360,Math.hypot(aimX - this.player.x,aimY - this.player.y));
const targetPointX=this.player.x + Math.cos(baseAngle)*distToCursor;
const targetPointY=this.player.y + Math.sin(baseAngle)*distToCursor;
switch (profile.deliveryType) {
case "crescent_barrage":{
const count=profile.projectileCount||(2 + rank);
const spread=0.42 + rank*0.05;
for (let i=0;i<count;i++) {
const offset=count===1?0 :-spread / 2 + (spread / (count - 1))*i;
this.spawnProjectile({
owner:"player",
name:move.name,
skillRank:rank,
path:move.path,
x:this.player.x + Math.cos(baseAngle + offset)*18,
y:this.player.y + Math.sin(baseAngle + offset)*18,
angle:baseAngle + offset,
speed:profile.projectileSpeed||480,
maxRange:profile.range||350,
radius:18 + rank*3,
damage:Math.round(totalPower / Math.max(1.5,count*0.55)),
color:profile.primaryColor||"#7ef7f0",
lifesteal:profile.lifesteal||0,
pierce:Math.min(5,rank),
homing:isHoming,
spinning:isSpinning,
ricochet:ricochetCount,
statusEffect:mods.includes("frost_chill")?"chill" :(mods.includes("burn_ground")?"burn" :null)
});
}
break;
}
case "wind_tornado":{
const bladeCount=1 + Math.min(6,rank);
for (let i=0;i<bladeCount;i++) {
const offset=bladeCount===1?0 :(i - (bladeCount - 1) / 2)*0.22;
this.spawnProjectile({
owner:"player",
name:move.name,
skillRank:rank,
path:"Phong Đạo",
x:this.player.x + Math.cos(baseAngle + offset)*20,
y:this.player.y + Math.sin(baseAngle + offset)*20,
angle:baseAngle + offset,
speed:400 + rank*25,
maxRange:profile.range||370,
radius:26 + rank*4,
damage:Math.round(totalPower*0.75),
color:"#5cc995",
pierce:4,
spinning:true,
lifesteal:profile.lifesteal||0,
statusEffect:"bleed"
});
}
if (this.groundZones.length>=6) this.groundZones.shift();
this.groundZones.push({
isKillerMove:Boolean(this._castingKillerMove),
x:targetPointX,
y:targetPointY,
skillRank:rank,
radius:75 + rank*16,
color:"#38c992",
damagePerTick:Math.max(4,Math.round(totalPower*0.22)),
tickTimer:0.35,
duration:2.5 + rank*0.4,
statusEffect:null,
pullForce:80 + rank*15
});
break;
}
case "beast_stampede":{
const pCount=profile.phantomCount||Math.min(5,Math.max(1,Math.ceil(rank / 1.5)));
const spread=0.32;
for (let i=0;i<pCount;i++) {
const offset=pCount===1?0 :(i - (pCount - 1) / 2)*spread;
this.spawnBeastPhantom({
name:move.name,
skillRank:rank,
icon:profile.phantomIcon||"🐗",
x:this.player.x,
y:this.player.y,
angle:baseAngle + offset,
speed:380 + rank*25,
maxDistance:190 + rank*35,
radius:34 + rank*7,
damage:Math.round(totalPower / Math.max(1,pCount*0.65)),
color:profile.primaryColor||"#e07a45",
stunDuration:1.1 + rank*0.25,
knockbackForce:85 + rank*15
});
}
break;
}
case "bone_spear_rain":{
const spearCount=2 + Math.min(7,rank);
for (let i=0;i<spearCount;i++) {
const offset=(i - (spearCount - 1) / 2)*0.15;
this.spawnProjectile({
owner:"player",
name:move.name,
skillRank:rank,
path:"Kim Đạo",
x:this.player.x + Math.cos(baseAngle + offset)*18,
y:this.player.y + Math.sin(baseAngle + offset)*18,
angle:baseAngle + offset,
speed:550,
maxRange:profile.range||380,
radius:20 + rank*2,
damage:Math.round(totalPower*0.62),
color:"#f5f7fa",
pierce:3 + rank,
spinning:true,
homing:isHoming,
lifesteal:profile.lifesteal||0,
statusEffect:"bleed"
});
}
break;
}
case "sword_formation":{
const swordCount=2 + Math.min(8,rank);
const spread=0.65;
for (let i=0;i<swordCount;i++) {
const offset=(i - (swordCount - 1) / 2)*(spread / Math.max(1,swordCount - 1));
this.spawnProjectile({
owner:"player",
name:move.name,
skillRank:rank,
path:"Kiếm Đạo",
x:this.player.x + Math.cos(baseAngle + offset)*22,
y:this.player.y + Math.sin(baseAngle + offset)*22,
angle:baseAngle + offset,
speed:640,
maxRange:450 + rank*25,
radius:22 + rank*3,
damage:Math.round(totalPower*0.58),
color:"#dce8f2",
pierce:2 + Math.floor(rank / 2),
homing:true,
lifesteal:profile.lifesteal||0,
statusEffect:"bleed"
});
}
break;
}
case "fire_meteor":{
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:targetPointX,
y:targetPointY,
radius:profile.aoeRadius||(80 + rank*18),
damage:Math.round(totalPower*0.75),
color:"#ff5733",
duration:0.5,
lifesteal:profile.lifesteal||0,
statusEffect:"burn"
});
const meteorCount=1 + Math.min(6,rank);
for (let m=0;m<meteorCount;m++) {
if (this.fallingStrikes.length>=12) this.fallingStrikes.shift();
this.fallingStrikes.push({
isKillerMove:Boolean(this._castingKillerMove),
targetX:targetPointX + (Math.random() - 0.5)*(profile.aoeRadius||85),
targetY:targetPointY + (Math.random() - 0.5)*(profile.aoeRadius||85),
skillRank:rank,
currentYOffset:180 + m*65,
fallSpeed:620,
radius:38 + rank*5,
damage:Math.round(totalPower*0.45),
color:"#ff5733",
statusEffect:"burn"
});
}
break;
}
case "frost_lance":{
this.spawnLaserBeam({
owner:"player",
x:this.player.x,
y:this.player.y,
skillRank:rank,
angle:baseAngle,
length:distToCursor + 45,
width:16 + rank*5,
damage:Math.round(totalPower*0.65),
color:"#85c1e9",
lifesteal:profile.lifesteal||0,
statusEffect:"chill"
});
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:targetPointX,
y:targetPointY,
radius:profile.aoeRadius||(75 + rank*16),
damage:Math.round(totalPower*0.65),
color:"#85c1e9",
duration:0.5,
slowEffect:0.60,
statusEffect:"chill"
});
break;
}
case "thunder_chain":{
this.triggerChainLightning(
this.player.x + Math.cos(baseAngle)*50,
this.player.y + Math.sin(baseAngle)*50,
totalPower,
2 + rank*2,
"#b75cff",
rank
);
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:targetPointX,
y:targetPointY,
radius:70 + rank*12,
damage:Math.round(totalPower*0.5),
color:"#b75cff",
duration:0.35,
statusEffect:"stun"
});
break;
}
case "poison_miasma":{
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:targetPointX,
y:targetPointY,
radius:profile.aoeRadius||(85 + rank*18),
damage:Math.round(totalPower*0.55),
color:"#9b59b6",
duration:0.5,
statusEffect:"poison"
});
if (this.groundZones.length>=6) this.groundZones.shift();
this.groundZones.push({
isKillerMove:Boolean(this._castingKillerMove),
x:targetPointX,
y:targetPointY,
skillRank:rank,
radius:profile.aoeRadius||(85 + rank*18),
color:"#9b59b6",
damagePerTick:Math.max(5,Math.round(totalPower*0.30)),
tickTimer:0.4,
duration:4.5 + rank*0.5,
statusEffect:"poison",
pullForce:0
});
break;
}
case "blood_wave":{
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:this.player.x,
y:this.player.y,
radius:95 + rank*18,
damage:Math.round(totalPower*0.70),
color:"#e03e3e",
duration:0.45,
lifesteal:Math.max(0.25,profile.lifesteal||0.25),
statusEffect:"bleed"
});
const waveCount=1 + Math.min(6,rank);
for (let i=0;i<waveCount;i++) {
const offset=waveCount===1?0 :(i - (waveCount - 1) / 2)*0.22;
this.spawnProjectile({
owner:"player",
name:move.name,
skillRank:rank,
path:"Huyết Đạo",
x:this.player.x + Math.cos(baseAngle + offset)*18,
y:this.player.y + Math.sin(baseAngle + offset)*18,
angle:baseAngle + offset,
speed:460,
maxRange:profile.range||340,
radius:22 + rank*3,
damage:Math.round(totalPower*0.55),
color:"#e03e3e",
lifesteal:Math.max(0.25,profile.lifesteal||0.25),
pierce:2 + rank,
statusEffect:"bleed"
});
}
break;
}
case "fortress_aegis":{
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:this.player.x,
y:this.player.y,
radius:95 + rank*16,
damage:Math.round(totalPower*0.80),
color:"#ffd700",
duration:0.45,
statusEffect:"stun",
knockbackForce:110 + rank*15
});
break;
}
case "soul_howl_wave":{
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:this.player.x,
y:this.player.y,
radius:140 + rank*22,
damage:totalPower,
color:"#8f6ee6",
duration:0.55,
statusEffect:"stun",
knockbackForce:75
});
break;
}
case "water_torrent":{
this.spawnLaserBeam({
owner:"player",
x:this.player.x,
y:this.player.y,
skillRank:rank,
angle:baseAngle,
length:350 + rank*25,
width:24 + rank*4,
damage:totalPower,
color:"#3b8beb",
lifesteal:profile.lifesteal||0,
statusEffect:"chill"
});
break;
}
case "dash_blitz":{
this.iframeTimer=0.45;
this._dashPlayerAlongAngle(baseAngle,145 + rank*20,"#6ce6b8");
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:this.player.x,
y:this.player.y,
radius:90 + rank*15,
damage:totalPower,
color:"#6ce6b8",
duration:0.4,
statusEffect:"bleed"
});
break;
}
case "space_rift_slash":{
if (!this.map||this.map.isWalkable(targetPointX,targetPointY,this.player.radius)) {
this._spawnParticleBurst(this.player.x,this.player.y,"#5cc995",22);
this.player.x=targetPointX;
this.player.y=targetPointY;
}
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:this.player.x,
y:this.player.y,
radius:175,
damage:totalPower,
color:"#9b72cf",
duration:0.55,
statusEffect:"bleed"
});
break;
}
case "time_river_storm":{
this.spawnLaserBeam({
owner:"player",
x:this.player.x,
y:this.player.y,
skillRank:rank,
angle:baseAngle,
length:490,
width:50,
damage:totalPower,
color:"#f2d16b",
statusEffect:"stun"
});
this.spawnAoEEffect({
owner:"player",
name:move.name,
skillRank:rank,
x:this.player.x,
y:this.player.y,
radius:185,
damage:Math.round(totalPower*0.75),
color:"#f2d16b",
duration:0.6,
statusEffect:"chill"
});
break;
}
default:{
this.spawnLaserBeam({
owner:"player",
x:this.player.x,
y:this.player.y,
skillRank:rank,
angle:baseAngle,
length:340 + rank*25,
width:22 + rank*4,
damage:totalPower,
color:profile.primaryColor||"#f7c948",
lifesteal:profile.lifesteal||0
});
break;
}
}
},
_executeKillerMoveSupportModifiers(move,profile,totalPower,baseAngle,aimX,aimY) {
const rank=profile.moveRank||move.moveRank||1;
const mods=profile.modifiers||[];
const daoMult=this.player.calculateDaoAmplification(move.path,[]).multiplier;
const distToCursor=Math.min(profile.range||340,Math.hypot(aimX - this.player.x,aimY - this.player.y));
const targetPointX=this.player.x + Math.cos(baseAngle)*distToCursor;
const targetPointY=this.player.y + Math.sin(baseAngle)*distToCursor;
if (profile.shieldAmount>0||mods.includes("aegis_shield")||mods.includes("water_barrier")) {
const shieldHp=Math.max(25,Math.round((profile.shieldAmount||rank*45)*daoMult));
this.player.addBuff({
id:`km_shield_${move.id}`,
name:`${move.name} Thuẫn`,
icon:"🛡️",
duration:profile.boostDuration||(6 + rank),
statMods:{def:10*rank},
shieldHp:shieldHp,
visualColor:mods.includes("water_barrier")?"#3b8beb" :"#f7c948"
});
this.spawnFloatingText(this.player.x,this.player.y - 26,`🛡️ +${shieldHp} Hộ Thuẫn`,"#f7c948");
}
if (profile.healAmount>0||mods.includes("life_bloom")) {
const healVal=Math.max(20,Math.round((profile.healAmount||rank*40)*daoMult));
const healed=this.player.heal(healVal);
this.spawnFloatingText(this.player.x,this.player.y - 22,`💚 +${healed} HP`,"#4cd964");
}
if (profile.speedBoost>0||mods.includes("swift_step")) {
this.player.addBuff({
id:`km_spd_${move.id}`,
name:`${move.name} Tốc`,
icon:"💨",
duration:profile.boostDuration||(5 + rank),
statMods:{spdMult:profile.speedBoost||1.45},
visualColor:"#6ce6b8"
});
}
if (mods.includes("orbiting_blades")) {
const bladeCount=Math.min(5,Math.max(1,rank));
for (let k=0;k<bladeCount;k++) {
this.spawnOrbiter({
name:move.name,
skillRank:rank,
color:profile.secondaryColor||"#dce8f2",
damage:Math.max(8,Math.round(totalPower*0.25)),
radius:65 + rank*4,
initialAngle:(Math.PI*2*k) / bladeCount,
duration:4.5 + rank*0.8,
speed:5.2
});
}
}
if (mods.includes("chain_lightning")&&profile.deliveryType!=="thunder_chain") {
this.triggerChainLightning(
targetPointX,
targetPointY,
Math.round(totalPower*0.45),
1 + rank,
"#b75cff",
rank
);
}
if (mods.includes("beast_phantom")&&profile.deliveryType!=="beast_stampede") {
this.spawnBeastPhantom({
name:move.name,
skillRank:rank,
icon:profile.phantomIcon||"🐗",
x:this.player.x,
y:this.player.y,
angle:baseAngle,
speed:390,
maxDistance:185 + rank*25,
radius:32 + rank*6,
damage:Math.round(totalPower*0.45),
color:"#e07a45",
stunDuration:1.2,
knockbackForce:75
});
}
if (mods.includes("burn_ground")) {
if (this.groundZones.length>=6) this.groundZones.shift();
this.groundZones.push({
x:targetPointX,
y:targetPointY,
skillRank:rank,
radius:65 + rank*14,
color:"#ff5733",
damagePerTick:Math.max(4,Math.round(totalPower*0.20)),
tickTimer:0.45,
duration:3.5 + rank*0.5,
statusEffect:"burn",
pullForce:0
});
}
if (mods.includes("vortex_pull")&&profile.deliveryType!=="wind_tornado") {
if (this.groundZones.length>=6) this.groundZones.shift();
this.groundZones.push({
x:targetPointX,
y:targetPointY,
skillRank:rank,
radius:70 + rank*12,
color:"#5cc995",
damagePerTick:Math.max(3,Math.round(totalPower*0.15)),
tickTimer:0.45,
duration:2.8,
statusEffect:null,
pullForce:65 + rank*12
});
}
if (mods.includes("blood_servant")&&this.summons.length<2) {
this.spawnSummon({
name:`Huyết Thú (${rank} Chuyển)`,
skillRank:rank,
icon:"🐺",
color:"#e03e3e",
x:this.player.x + 26,
y:this.player.y + 26,
hp:Math.round(totalPower*1.4),
atk:Math.max(8,Math.round(totalPower*0.32)),
duration:10 + rank*2
});
}
if (mods.includes("time_accelerate")) {
for (const key of Object.keys(this.guCooldowns)) {
this.guCooldowns[key]=Number((this.guCooldowns[key]*0.6).toFixed(2));
}
this.spawnFloatingText(this.player.x,this.player.y - 30,"⏳ Quang Âm Gia Tốc (-40% Hồi Chiêu)!","#f2d16b");
}
},
spawnProjectile(cfg) {
if (this.projectiles.length>=36) this.projectiles.shift();
this.projectiles.push({
owner:cfg.owner||"player",
attackerRef:cfg.attackerRef||null,
isKillerMove:Boolean(cfg.isKillerMove||this._castingKillerMove),
attackerRef:cfg.attackerRef||null,
name:cfg.name||"Cổ Thuật",
skillRank:cfg.skillRank||1,
path:cfg.path||"Phong Đạo",
x:cfg.x,
y:cfg.y,
startX:cfg.x,
startY:cfg.y,
vx:Math.cos(cfg.angle)*(cfg.speed||420),
vy:Math.sin(cfg.angle)*(cfg.speed||420),
speed:cfg.speed||420,
angle:cfg.angle,
spinAngle:0,
maxRange:cfg.maxRange||340,
radius:cfg.radius||18,
damage:cfg.damage||18,
color:cfg.color||"#38c992",
slowEffect:cfg.slowEffect||0,
lifesteal:cfg.lifesteal||0,
pierce:cfg.pierce||1,
homing:Boolean(cfg.homing),
spinning:Boolean(cfg.spinning),
ricochet:cfg.ricochet||0,
statusEffect:cfg.statusEffect||null,
trail:[],
hitTargets:new Set()
});
},
spawnOrbiter(cfg) {
if (this.orbiters.length>=8) this.orbiters.shift();
this.orbiters.push({
name:cfg.name||"Hộ Thân Nhận",
isKillerMove:Boolean(cfg.isKillerMove||this._castingKillerMove),
skillRank:cfg.skillRank||1,
color:cfg.color||"#4ce6ff",
damage:cfg.damage||15,
radius:cfg.radius||65,
angle:cfg.initialAngle!==undefined?cfg.initialAngle :Math.random()*Math.PI*2,
speed:cfg.speed||5.0,
duration:cfg.duration||5.0,
hitCooldowns:{}
});
},
spawnBeastPhantom(cfg) {
if (this.beastPhantoms.length>=6) this.beastPhantoms.shift();
this.beastPhantoms.push({
name:cfg.name||"Lực Đạo Thú Ảnh",
isKillerMove:Boolean(cfg.isKillerMove||this._castingKillerMove),
skillRank:cfg.skillRank||1,
icon:cfg.icon||"🐗",
x:cfg.x,
y:cfg.y,
startX:cfg.x,
startY:cfg.y,
vx:Math.cos(cfg.angle)*(cfg.speed||380),
vy:Math.sin(cfg.angle)*(cfg.speed||380),
angle:cfg.angle,
maxDistance:cfg.maxDistance||200,
radius:cfg.radius||38,
damage:cfg.damage||35,
color:cfg.color||"#e07a45",
stunDuration:cfg.stunDuration||1.2,
knockbackForce:cfg.knockbackForce||80,
hitTargets:new Set()
});
},
spawnSummon(cfg) {
this.summons.push({
id:`sum_${Date.now()}_${Math.random()}`,
name:cfg.name||"Huyết Chiến Thú",
skillRank:cfg.skillRank||1,
icon:cfg.icon||"🐺",
color:cfg.color||"#e03e3e",
x:cfg.x,
y:cfg.y,
hp:cfg.hp||100,
maxHp:cfg.hp||100,
atk:cfg.atk||20,
spd:155,
attackCooldown:0,
duration:cfg.duration||12
});
this.spawnFloatingText(cfg.x,cfg.y - 20,`Triệu Hồi ${cfg.name}!`,"#ff6b6b");
},
spawnLaserBeam(cfg) {
const owner=cfg.owner||"player";
const endX=cfg.x + Math.cos(cfg.angle)*cfg.length;
const endY=cfg.y + Math.sin(cfg.angle)*cfg.length;
if (this.beams.length>=8) this.beams.shift();
this.beams.push({
x1:cfg.x,
y1:cfg.y,
x2:endX,
y2:endY,
width:cfg.width||22,
color:cfg.color||"#7ef7f0",
life:0.38,
maxLife:0.38
});
if (owner==="player"&&this.enemies) {
const allHostiles=this.enemies.getHostileTargetsInRadius(cfg.x,cfg.y,cfg.length + 40);
for (const t of allHostiles) {
const distToLine=this._pointToSegmentDistance(t.x,t.y,cfg.x,cfg.y,endX,endY);
if (distToLine<=(cfg.width / 2) + t.radius) {
this._applyPlayerDamageToTarget(t,cfg.damage,{
skillRank:cfg.skillRank||1,
isKillerMove:Boolean(cfg.isKillerMove||this._castingKillerMove),
color:cfg.color,
lifesteal:cfg.lifesteal||0,
statusEffect:cfg.statusEffect||"bleed"
});
}
}
} else if (owner!=="player"&&this.player&&this.player.hp>0) {
const distToLine=this._pointToSegmentDistance(this.player.x,this.player.y,cfg.x,cfg.y,endX,endY);
if (distToLine<=(cfg.width / 2) + this.player.radius) {
const res=this.player.takeDamage(cfg.damage,cfg.name||"Tôn Giả Quang Trụ",cfg.skillRank||null,cfg.attackerRef||null);
if (!res.dodged&& !res.blocked&&res.damageTaken>0) {
this.spawnFloatingText(this.player.x,this.player.y - 22,`-${res.damageTaken}`,"#ff4d4d");
}
}
}
},
triggerChainLightning(startX,startY,damage,maxJumps=3,color="#b75cff",skillRank=1) {
if (!this.enemies) return;
const visited=new Set();
let currX=startX;
let currY=startY;
let currDmg=damage;
for (let j=0;j<maxJumps;j++) {
const candidates=this.enemies.getHostileTargetsInRadius(currX,currY,240)
.filter(t=> !visited.has(t.id));
if (candidates.length===0) break;
candidates.sort((a,b)=>Math.hypot(a.x - currX,a.y - currY) - Math.hypot(b.x - currX,b.y - currY));
const nextTarget=candidates[0];
visited.add(nextTarget.id);
if (this.lightningArcs.length>=12) this.lightningArcs.shift();
this.lightningArcs.push({
x1:currX,
y1:currY,
x2:nextTarget.x,
y2:nextTarget.y,
color:color,
life:0.28
});
this._applyPlayerDamageToTarget(nextTarget,currDmg,{
skillRank:skillRank,
isKillerMove:Boolean(this._castingKillerMove),
color:color,
statusEffect:"stun"
});
currX=nextTarget.x;
currY=nextTarget.y;
currDmg=Math.max(4,Math.round(currDmg*0.80));
}
},
spawnAoEEffect(cfg) {
const effect={
owner:cfg.owner||"player",
isKillerMove:Boolean(cfg.isKillerMove||this._castingKillerMove),
name:cfg.name||"Sát Chiêu",
skillRank:cfg.skillRank||1,
x:cfg.x,
y:cfg.y,
radius:cfg.radius||80,
damage:cfg.damage||25,
color:cfg.color||"#ff5733",
duration:cfg.duration||0.45,
maxDuration:cfg.duration||0.45,
lifesteal:cfg.lifesteal||0,
slowEffect:cfg.slowEffect||0,
statusEffect:cfg.statusEffect||null,
knockbackForce:cfg.knockbackForce||0
};
if (this.aoeEffects.length>=10) this.aoeEffects.shift();
this.aoeEffects.push(effect);
this._spawnParticleBurst(cfg.x,cfg.y,effect.color,10);
if (effect.owner==="player"&&this.map&&typeof this.map.damageRocksInRadius==="function") {
this.map.damageRocksInRadius(effect.x,effect.y,effect.radius,effect.damage,this.player,this);
}
if (effect.owner==="player"&&this.enemies) {
const targets=this.enemies.getHostileTargetsInRadius(effect.x,effect.y,effect.radius);
for (const target of targets) {
const didPenetrate=this._applyPlayerDamageToTarget(target,effect.damage,effect);
if (didPenetrate!==false&&effect.knockbackForce>0) {
this._knockbackTarget(target,effect.x,effect.y,effect.knockbackForce);
}
}
} else if (effect.owner!=="player"&&this.player) {
const d=Math.hypot(this.player.x - effect.x,this.player.y - effect.y);
if (d<=effect.radius + this.player.radius&&(this.player.z||0)<26) {
const res=this.player.takeDamage(effect.damage,effect.name,effect.skillRank||null,effect.attackerRef||null);
if (!res.dodged&& !res.blocked&&res.damageTaken>0) {
this.spawnFloatingText(this.player.x,this.player.y - 18,`-${res.damageTaken}`,"#ff4d4d");
}
}
}
}
});
})(window);
