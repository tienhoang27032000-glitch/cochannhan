(function (global) {
"use strict";

const D=global.VanCoGuHouseData;

class GuHouseSystem {
constructor(game) {
this.game=game||null;
this.reset();
}

reset() {
this.ownedHouses={}; // { [houseId]: { id, level:1, assembledAt } }
this.equippedHouseId=null;
this.isBoarded=false;
this.shieldHp=0;
this.maxShieldHp=0;
this.turretTimer=0;
this.ultimateCooldown=0;
this.repairCooldown=0;
this.hitFlashTimer=0;
this.ultFlashTimer=0;
}

getOwnedHouse(houseId) {
return this.ownedHouses[houseId]||null;
}

getEquippedConfig() {
if (!this.equippedHouseId|| !this.ownedHouses[this.equippedHouseId]) return null;
const tpl=D.getGuHouseById(this.equippedHouseId);
if (!tpl) return null;
const rec=this.ownedHouses[this.equippedHouseId];
const stats=D.computeGuHouseStats(tpl,rec.level||1,this.game?this.game.player :null);
return {tpl,rec,stats};
}

checkAssembleRequirements(houseId) {
const g=this.game;
const pl=g&&g.player;
const ap=g&&g.aperture;
const gs=g&&g.guSystem;
const tpl=D.getGuHouseById(houseId);
if (!tpl|| !pl|| !ap|| !gs) return {canAssemble:false,missing:["Hệ thống chưa sẵn sàng"],guChecks:[]};
if (this.ownedHouses[houseId]) return {canAssemble:false,alreadyOwned:true,missing:[],guChecks:[]};

const missing=[];
if ((ap.rank||1)<tpl.reqRank) {
missing.push(`Cần tu vi ${tpl.reqRank} Chuyển`);
}
const guChecks=tpl.requiredGuIds.map(gid=>{
const owned=gs.ownedGuList.find(x=>x.id===gid&&x.isRefined);
const dbTpl=(global.GuSystem&&global.GuSystem.GU_DATABASE&&global.GuSystem.GU_DATABASE[gid])||{id:gid,name:gid,icon:"🪲"};
if (!owned) missing.push(`Thiếu ${dbTpl.name}`);
return {id:gid,name:dbTpl.name,icon:dbTpl.icon||"🪲",has:Boolean(owned)};
});
const c=tpl.assembleCost;
if (pl.primevalStones<c.stones) missing.push(`Thiếu ${c.stones.toLocaleString("vi-VN")}💎 Nguyên Thạch`);
if ((c.immortalStones||0)>0&&(pl.immortalStones||0)<c.immortalStones) missing.push(`Thiếu ${c.immortalStones}🌟 Tiên Thạch`);
if (c.itemId&&pl.getItemCount(c.itemId)<(c.itemCount||1)) {
const meta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[c.itemId])||{name:c.itemId};
missing.push(`Thiếu ${c.itemCount||1}x ${meta.name}`);
}
return {canAssemble:missing.length===0,alreadyOwned:false,missing,guChecks};
}

assembleHouse(houseId) {
const g=this.game;
const pl=g&&g.player;
const tpl=D.getGuHouseById(houseId);
const check=this.checkAssembleRequirements(houseId);
if (check.alreadyOwned) return {success:false,message:`Ngươi đã lắp ghép 【${tpl.name}】 rồi!`};
if (!check.canAssemble) return {success:false,message:`Chưa đủ điều kiện lắp ghép 【${tpl.name}】: ${check.missing.slice(0,3).join("; ")}`};

const c=tpl.assembleCost;
pl.primevalStones -=c.stones;
if ((c.immortalStones||0)>0) pl.consumeItem("immortal_stone",c.immortalStones);
if (c.itemId&&(c.itemCount||0)>0) pl.consumeItem(c.itemId,c.itemCount);

this.ownedHouses[houseId]={
id:houseId,
level:1,
assembledAt:new Date().toLocaleTimeString("vi-VN")
};
this.equippedHouseId=houseId;
const stats=D.computeGuHouseStats(tpl,1,pl);
this.maxShieldHp=stats.maxShield;
this.shieldHp=stats.maxShield;
if (typeof pl.addPathAttainmentExp==="function") {
pl.addPathAttainmentExp("Luyện Đạo",18 + tpl.rank*6);
pl.addPathAttainmentExp(tpl.path,15 + tpl.rank*5);
}
if (g.autoSaveNow) g.autoSaveNow("gu_house_assemble");
return {
success:true,
message:`🏛️ [LẮP GHÉP THÀNH CÔNG] Cổ Trùng quy vị — tòa 【${tpl.icon} ${tpl.name}】 (${tpl.tierLabel}) đã hoàn thành! Vào Chiến Trường bấm [N] để triệu hồi và điều khiển trực tiếp!`
};
}

equipHouse(houseId) {
if (!this.ownedHouses[houseId]) return {success:false,message:"Chưa sở hữu Cổ Ốc này."};
this.equippedHouseId=houseId;
const cfg=this.getEquippedConfig();
if (cfg) {
this.maxShieldHp=cfg.stats.maxShield;
this.shieldHp=cfg.stats.maxShield;
}
if (this.game&&this.game.autoSaveNow) this.game.autoSaveNow("gu_house_equip");
return {success:true,message:`🏛️ Đã chọn 【${cfg.tpl.name}】 làm Tiên Cổ Ốc Xuất Chiến!`};
}

upgradeHouse(houseId) {
const g=this.game;
const pl=g&&g.player;
const rec=this.ownedHouses[houseId];
const tpl=D.getGuHouseById(houseId);
if (!rec|| !tpl|| !pl) return {success:false,message:"Không tìm thấy Cổ Ốc."};
if (rec.level>=10) return {success:false,message:`【${tpl.name}】 đã đạt cấp tối đa (Lv.10)!`};
const cost=D.getUpgradeCost(tpl,rec.level);
if (pl.primevalStones<cost.stones) return {success:false,message:`Thiếu Nguyên Thạch (Cần ${cost.stones.toLocaleString("vi-VN")}💎)!`};
if (cost.immortalStones>0&&(pl.immortalStones||0)<cost.immortalStones) return {success:false,message:`Thiếu Tiên Thạch (Cần ${cost.immortalStones}🌟)!`};
pl.primevalStones -=cost.stones;
if (cost.immortalStones>0) pl.consumeItem("immortal_stone",cost.immortalStones);
rec.level +=1;
if (this.equippedHouseId===houseId) {
const ns=D.computeGuHouseStats(tpl,rec.level,pl);
this.maxShieldHp=ns.maxShield;
this.shieldHp=ns.maxShield;
}
if (g.autoSaveNow) g.autoSaveNow("gu_house_upgrade");
return {success:true,message:`⬆️ Cường hóa thành công 【${tpl.name}】 lên Cấp ${rec.level}! (+18% Hộ Thuẫn, +16% Hỏa Lực Pháo Đài)`};
}

// ============================================================================
// BATTLE INTEGRATION (BOARD, STOW, SHIELD ABSORPTION, AUTO-TURRET, ULTIMATE!)
// ============================================================================
prepareForBattle() {
this.isBoarded=false;
this.turretTimer=0.3;
this.ultimateCooldown=0;
this.repairCooldown=0;
this.hitFlashTimer=0;
this.ultFlashTimer=0;
const cfg=this.getEquippedConfig();
if (cfg) {
this.maxShieldHp=cfg.stats.maxShield;
this.shieldHp=cfg.stats.maxShield;
} else {
this.maxShieldHp=0;
this.shieldHp=0;
}
if (this.game&&this.game.ui&&typeof this.game.ui.updateBattleGuHouseBar==="function") {
this.game.ui.updateBattleGuHouseBar(true);
}
}

cleanupAfterBattle() {
this.isBoarded=false;
}

toggleBoard(notify=true) {
const g=this.game;
if (!g|| !g.player||g.currentScreen!=="battle") return false;
if (g.isBattlePaused||g.isPermadead||g.player.hp<=0) return false;
const cfg=this.getEquippedConfig();
if (!cfg) {
if (notify&&g.combat) g.combat.spawnFloatingText(g.player.x,g.player.y - 34,"Chưa lắp Tiên Cổ Ốc (Mở tab 🏛️ Tiên Cổ Ốc)!","#ff9f43");
return false;
}
if (this.isBoarded) {
this.isBoarded=false;
if (notify&&g.combat) {
g.combat._spawnParticleBurst(g.player.x,g.player.y,cfg.tpl.color,8);
g.combat.spawnFloatingText(g.player.x,g.player.y - 34,`Thu hồi 【${cfg.tpl.name}】 (tự hồi Hộ Thuẫn)`,"#7ef7f0");
}
if (g.ui&&typeof g.ui.updateBattleGuHouseBar==="function") g.ui.updateBattleGuHouseBar(true);
return true;
}
if (this.repairCooldown>0) {
if (notify&&g.combat) g.combat.spawnFloatingText(g.player.x,g.player.y - 34,`Cổ Ốc đang tu sửa (${this.repairCooldown.toFixed(1)}s)!`,"#ff9f43");
return false;
}
// Refresh stats from current player Dao marks
this.maxShieldHp=cfg.stats.maxShield;
if (this.shieldHp<=0) this.shieldHp=Math.round(this.maxShieldHp*0.6);
this.isBoarded=true;
this.turretTimer=0.25;
if (notify&&g.combat) {
g.combat._spawnParticleBurst(g.player.x,g.player.y,cfg.tpl.color,10);
g.combat.triggerScreenShake(4,0.18);
g.combat.spawnFloatingText(g.player.x,g.player.y - 42,`🏛️ TRIỆU HỒI 【${cfg.tpl.name}】!`,cfg.tpl.color);
}
if (g.ui&&typeof g.ui.updateBattleGuHouseBar==="function") g.ui.updateBattleGuHouseBar(true);
return true;
}

absorbIncomingDamage(rawDamage,sourceName="") {
if (!this.isBoarded||this.shieldHp<=0) return {absorbed:0,remaining:rawDamage};
if (sourceName.includes("Khiếu Bích")||sourceName.includes("Đồng Hóa")) return {absorbed:0,remaining:rawDamage};
const dmg=Math.max(1,Math.round(rawDamage*0.78)); // Fortress armor reduces incoming damage by 22%
const absorbed=Math.min(this.shieldHp,dmg);
this.shieldHp=Math.max(0,this.shieldHp - absorbed);
this.hitFlashTimer=0.14;
const remaining=Math.max(0,dmg - absorbed);
const g=this.game;

if (this.shieldHp<=0) {
this.isBoarded=false;
this.repairCooldown=16.0;
if (g&&g.combat&&g.player) {
g.combat.iframeTimer=Math.max(g.combat.iframeTimer||0,0.85);
g.combat.triggerScreenShake(7,0.24);
g.combat._spawnParticleBurst(g.player.x,g.player.y,"#ff6b6b",10);
g.combat.spawnFloatingText(g.player.x,g.player.y - 42,"💥 Hộ Thuẫn Cổ Ốc vỡ — Tự thu hồi tu sửa (16s)!","#ff6b6b");
}
if (g&&g.ui&&typeof g.ui.updateBattleGuHouseBar==="function") g.ui.updateBattleGuHouseBar(true);
}
return {absorbed,remaining};
}

triggerUltimate() {
const g=this.game;
if (!g|| !g.player|| !g.combat||g.currentScreen!=="battle") return false;
if (g.isBattlePaused||g.isPermadead||g.player.hp<=0) return false;
if (!this.isBoarded) {
if (!this.toggleBoard(false)) return false;
}
if (this.ultimateCooldown>0) return false;
const cfg=this.getEquippedConfig();
if (!cfg) return false;
const {tpl,stats}=cfg;
const ult=tpl.ultimate;

// Check essence cost
if (g.aperture&& !g.aperture.hasEnoughEssence(ult.essenceCost,tpl.rank,tpl.path)) {
g.combat.spawnFloatingText(g.player.x,g.player.y - 38,"Không đủ Chân/Tiên Nguyên cho Đại Chiêu Cổ Ốc!","#ff6b6b");
return false;
}
if (g.aperture) g.aperture.consumeEssence(ult.essenceCost,tpl.rank,tpl.path);

this.ultimateCooldown=ult.cooldown||10.0;
this.ultFlashTimer=0.65;
const px=g.player.x;const py=g.player.y;
const aimAngle=g.player.aimAngle||0;
const uDmg=stats.ultDmg;

g.combat.triggerScreenShake(6 + Math.min(5,tpl.rank*0.6),0.26);
g.combat.spawnFloatingText(px,py - 48,`🏛️ 【${ult.name}】!`,tpl.color);
if (g.ui) g.ui.addLog(`🏛️ [${tpl.name}] Kích hoạt Đại Chiêu Trấn Phái 【${ult.name}】 (Uy lực: ${uDmg.toLocaleString("vi-VN")})!`,"combat");

if (tpl.id==="bach_cot_xa") {
// 8-way spinning ivory bone spears + stun shockwave
for (let i=0;i<8;i++) {
const a=aimAngle + (Math.PI*2*i)/8;
g.combat.spawnProjectile({
owner:"player",name:ult.name,skillRank:tpl.rank,path:tpl.path,
x:px + Math.cos(a)*26,y:py + Math.sin(a)*26,angle:a,
speed:520,maxRange:440,radius:20,damage:Math.round(uDmg*0.52),
color:"#dce8f2",pierce:4,spinning:true,statusEffect:"bleed"
});
}
g.combat.spawnAoEEffect({owner:"player",name:ult.name,skillRank:tpl.rank,x:px,y:py,radius:175,damage:Math.round(uDmg*0.65),color:"#dce8f2",duration:0.45,statusEffect:"stun",knockbackForce:110});
} else if (tpl.id==="huyet_ha_xa") {
// Blood River Nova + 10 homing blood sickles + 30% shield restore
this.shieldHp=Math.min(this.maxShieldHp,this.shieldHp + Math.round(this.maxShieldHp*0.30));
g.combat.spawnAoEEffect({owner:"player",name:ult.name,skillRank:tpl.rank,x:px,y:py,radius:220,damage:Math.round(uDmg*0.75),color:"#e03e3e",duration:0.50,lifesteal:0.25,statusEffect:"bleed"});
for (let i=0;i<10;i++) {
const a=(Math.PI*2*i)/10;
g.combat.spawnProjectile({
owner:"player",name:ult.name,skillRank:tpl.rank,path:tpl.path,
x:px + Math.cos(a)*28,y:py + Math.sin(a)*28,angle:a,
speed:470,maxRange:480,radius:22,damage:Math.round(uDmg*0.48),
color:"#ff3b30",pierce:3,homing:true,lifesteal:0.25,statusEffect:"bleed"
});
}
} else if (tpl.id==="can_thuy_lau_dai") {
// Frost-Water Vortex + 40% Shield Restore + Freeze
this.shieldHp=Math.min(this.maxShieldHp,this.shieldHp + Math.round(this.maxShieldHp*0.40));
g.combat.spawnAoEEffect({owner:"player",name:ult.name,skillRank:tpl.rank,x:px,y:py,radius:250,damage:Math.round(uDmg*0.90),color:"#4ce6ff",duration:0.55,slowEffect:0.65,statusEffect:"chill",knockbackForce:95});
for (let i=0;i<8;i++) {
const a=(Math.PI*2*i)/8;
g.combat.spawnProjectile({
owner:"player",name:ult.name,skillRank:tpl.rank,path:tpl.path,
x:px + Math.cos(a)*30,y:py + Math.sin(a)*30,angle:a,
speed:500,maxRange:520,radius:24,damage:Math.round(uDmg*0.52),
color:"#7ef7f0",pierce:4,slowEffect:0.55,statusEffect:"chill"
});
}
} else if (tpl.id==="dong_hai_long_cung") {
// 3 Golden-Azure Dragon Laser Beams + Stun Nova
for (const off of [-0.28,0,0.28]) {
g.combat.spawnLaserBeam({
owner:"player",name:ult.name,skillRank:tpl.rank,
x:px,y:py,angle:aimAngle + off,length:640,width:38,
damage:Math.round(uDmg*0.85),color:"#ffd700",statusEffect:"stun"
});
}
g.combat.spawnAoEEffect({owner:"player",name:ult.name,skillRank:tpl.rank,x:px,y:py,radius:240,damage:Math.round(uDmg*0.75),color:"#4ce6ff",duration:0.50,statusEffect:"stun",knockbackForce:130});
} else if (tpl.id==="chan_duong_lau") {
// 12-beam True Yang Octagonal Sunburst + 45% Shield Restore + Momentum!
this.shieldHp=Math.min(this.maxShieldHp,this.shieldHp + Math.round(this.maxShieldHp*0.45));
g.combat.addMomentum(35);
g.combat.guaranteedNextCrit=true;
for (let i=0;i<12;i++) {
const a=(Math.PI*2*i)/12;
g.combat.spawnProjectile({
owner:"player",name:ult.name,skillRank:tpl.rank,path:tpl.path,
x:px + Math.cos(a)*32,y:py + Math.sin(a)*32,angle:a,
speed:580,maxRange:620,radius:24,damage:Math.round(uDmg*0.62),
color:"#ffe066",pierce:5,statusEffect:"burn"
});
}
g.combat.spawnAoEEffect({owner:"player",name:ult.name,skillRank:tpl.rank,x:px,y:py,radius:270,damage:Math.round(uDmg*0.95),color:"#ffd700",duration:0.55,statusEffect:"stun"});
} else {
// Vạn Kiếm Tiên Điện: 16 Homing Immortal Swords + 4 Cardinal Sword Beams!
for (let i=0;i<14;i++) {
const a=(Math.PI*2*i)/14;
g.combat.spawnProjectile({
owner:"player",name:ult.name,skillRank:tpl.rank,path:tpl.path,
x:px + Math.cos(a)*34,y:py + Math.sin(a)*34,angle:a,
speed:680,maxRange:680,radius:22,damage:Math.round(uDmg*0.60),
color:"#c2f0ff",pierce:5,homing:true,statusEffect:"bleed"
});
}
for (let k=0;k<4;k++) {
g.combat.spawnLaserBeam({
owner:"player",name:ult.name,skillRank:tpl.rank,
x:px,y:py,angle:aimAngle + (Math.PI*k)/2,length:680,width:34,
damage:Math.round(uDmg*0.85),color:"#b75cff",statusEffect:"bleed"
});
}
}
if (g.ui&&typeof g.ui.updateBattleGuHouseBar==="function") g.ui.updateBattleGuHouseBar(true);
return true;
}

update(dt) {
const g=this.game;
if (!g|| !g.player) return;
if (this.ultimateCooldown>0) this.ultimateCooldown=Math.max(0,this.ultimateCooldown - dt);
if (this.hitFlashTimer>0) this.hitFlashTimer=Math.max(0,this.hitFlashTimer - dt);
if (this.ultFlashTimer>0) this.ultFlashTimer=Math.max(0,this.ultFlashTimer - dt);

if (this.repairCooldown>0) {
this.repairCooldown=Math.max(0,this.repairCooldown - dt);
if (this.repairCooldown<=0&&this.maxShieldHp>0) {
this.shieldHp=Math.round(this.maxShieldHp*0.75);
}
}

const cfg=this.getEquippedConfig();
if (!cfg) return;
const {tpl,stats}=cfg;
this.maxShieldHp=stats.maxShield;

// Passive shield regeneration while stowed (4%/sec)
if (!this.isBoarded) {
if (this.repairCooldown<=0&&this.shieldHp<this.maxShieldHp) {
this.shieldHp=Math.min(this.maxShieldHp,this.shieldHp + this.maxShieldHp*0.04*dt);
}
return;
}

// Slight speed bonus while piloting a Gu House
if (g.player.isMoving&&tpl.speedMult>1.0) {
const extraMult=(tpl.speedMult - 1.0)*0.65;
const nx=g.player.x + (g.player.vx||0)*extraMult*dt;
const ny=g.player.y + (g.player.vy||0)*extraMult*dt;
if (!g.map||g.map.isWalkable(nx,g.player.y,g.player.radius,g.player.z||0)) g.player.x=nx;
if (!g.map||g.map.isWalkable(g.player.x,ny,g.player.radius,g.player.z||0)) g.player.y=ny;
}

// Auto-Turret Multi-Directional Firing at Nearby Hostile Enemies!
this.turretTimer -=dt;
if (this.turretTimer<=0&&g.enemies&&g.combat) {
const targets=g.enemies.getHostileTargetsInRadius(g.player.x,g.player.y,tpl.turretRange||420);
if (targets.length>0) {
this.turretTimer=tpl.turretInterval||0.8;
targets.sort((a,b)=>Math.hypot(a.x - g.player.x,a.y - g.player.y) - Math.hypot(b.x - g.player.x,b.y - g.player.y));
const shots=Math.min(tpl.turretShots||2,Math.max(1,targets.length));
for (let s=0;s<shots;s++) {
const tgt=targets[s % targets.length];
const ang=Math.atan2(tgt.y - g.player.y,tgt.x - g.player.x);
const turretOffAng=ang + (s - (shots - 1)*0.5)*0.35;
g.combat.spawnProjectile({
owner:"player",
name:`${tpl.name} Pháo Đài`,
skillRank:tpl.rank,
path:tpl.path,
x:g.player.x + Math.cos(turretOffAng)*30,
y:g.player.y + Math.sin(turretOffAng)*24,
angle:ang,
speed:540,
maxRange:(tpl.turretRange||420) + 80,
radius:15,
damage:stats.turretDmg,
color:tpl.turretColor||tpl.color,
pierce:tpl.rank>=6?3 :2,
homing:tpl.rank>=4,
spinning:tpl.id==="bach_cot_xa",
lifesteal:tpl.lifesteal||0,
slowEffect:tpl.chillSlow||0,
statusEffect:tpl.id==="huyet_ha_xa"?"bleed" :(tpl.id==="can_thuy_lau_dai"?"chill" :null)
});
}
if (tpl.lifesteal&&this.shieldHp<this.maxShieldHp) {
this.shieldHp=Math.min(this.maxShieldHp,this.shieldHp + Math.round(stats.turretDmg*tpl.lifesteal*0.35));
}
} else {
this.turretTimer=0.25;
}
}
}

toSaveData() {
return {
ownedHouses:JSON.parse(JSON.stringify(this.ownedHouses)),
equippedHouseId:this.equippedHouseId||null
};
}

fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
if (data.ownedHouses&&typeof data.ownedHouses==="object") {
for (const [k,v] of Object.entries(data.ownedHouses)) {
if (D.getGuHouseById(k)&&v&&typeof v==="object") {
this.ownedHouses[k]={
id:k,
level:Math.max(1,Math.min(10,Math.floor(Number(v.level)||1))),
assembledAt:String(v.assembledAt||"")
};
}
}
}
if (data.equippedHouseId&&this.ownedHouses[data.equippedHouseId]) {
this.equippedHouseId=data.equippedHouseId;
} else {
const first=Object.keys(this.ownedHouses)[0]||null;
this.equippedHouseId=first;
}
}
}

global.GuHouseSystem=GuHouseSystem;
})(window);
