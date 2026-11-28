(function (global) {
"use strict";

const D=global.VanCoBountyData;

class BountySystem {
constructor(game) {
this.game=game||null;
this.reset();
}

reset() {
this.notoriety=0;
this.activeBountyId=null;
this.completedCounts={};
this.ambushesDefeated=0;
this.forcedAmbushNext=false;
this.activeAmbushIds=[];
this.activeBountyEntityId=null;
this.ambushTriggeredInStage=false;
this.ambushCheckTimer=18;
this.alertBannerText="";
this.alertBannerColor="#ff5252";
this.alertBannerTimer=0;
}

getWantedTier() {
return D.getWantedTier(this.notoriety);
}

getActiveBounty() {
return this.activeBountyId?D.getBountyById(this.activeBountyId) :null;
}

addNotoriety(amount,reason="") {
const prevTier=this.getWantedTier().level;
this.notoriety=Math.max(0,Math.min(400,Math.round(this.notoriety + amount)));
const nextTier=this.getWantedTier();
const g=this.game;
if (amount>0&&nextTier.level>prevTier&&g&&g.ui) {
g.ui.addLog(
`🚨 [HẢI BỘ VĂN THƯ TĂNG CẤP] Độ Truy Nã đạt ${this.notoriety} — 【${nextTier.badge}: ${nextTier.name}】! ${nextTier.desc}`,
"danger"
);
} else if (reason&&g&&g.ui&&amount!==0) {
g.ui.addLog(reason,amount>0?"warning" :"system");
}
return nextTier;
}

// Called when player murders an NPC in battle!
onNpcKilled(npc) {
const g=this.game;
if (!g|| !g.player) return;
const gain=npc&&npc.rank>=4?45 :32;
g.player.alignment=Math.max(-1000,(g.player.alignment||0) - 25);
this.addNotoriety(gain,`🩸 Sát hại Cổ Sư 【${npc?npc.name :"NPC"}】 khiến Độ Truy Nã tăng +${gain} (Hiện: ${this.notoriety})! Cẩn thận Thiết Gia Thần Bộ mai phục!`);
}

onNpcAttacked(npc) {
this.addNotoriety(14,"");
}

// Accept / Abandon Demonic Bounty Contract
acceptBounty(bountyId) {
const g=this.game;
const ap=g&&g.aperture;
const b=D.getBountyById(bountyId);
if (!b) return {success:false,message:"Không tìm thấy Lệnh Truy Nã này."};
if (ap&&(ap.rank||1)<b.reqRank) {
return {success:false,message:`Tu vi chưa đủ! Cần tối thiểu ${b.reqRank} Chuyển để nhận lệnh truy nã 【${b.name}】.`};
}
this.activeBountyId=b.id;
if (g&&g.autoSaveNow) g.autoSaveNow("bounty_accept");
return {
success:true,
message:`🎯 Đã tiếp nhận Lệnh Truy Nã 【${b.name} (${b.rank} Chuyển)】! Hãy tiến vào 【${b.stageName}】 (hoặc bất kỳ ải cùng cấp trở lên) để truy sát đoạt túi trữ vật!`
};
}

abandonBounty() {
if (!this.activeBountyId) return {success:false,message:"Hiện không nhận Lệnh Truy Nã nào."};
const prev=this.getActiveBounty();
this.activeBountyId=null;
return {success:true,message:`Đã hủy Lệnh Truy Nã 【${prev?prev.name :""}】.`};
}

// ============================================================================
// RIGHTEOUS vs DEMONIC INTRIGUE SCHEMES (ĐẤU TRÍ CHÍNH – MA)
// ============================================================================
performIntrigueAction(actionId) {
const g=this.game;
const pl=g&&g.player;
const ap=g&&g.aperture;
if (!pl|| !ap) return {success:false,message:"Hệ thống chưa sẵn sàng."};
const rank=ap.rank||1;

if (actionId==="bribe_cleanse") {
if (this.notoriety<=0) return {success:false,message:"Ngươi hiện đang trong sạch (0 Độ Truy Nã), không cần tẩy trắng!"};
const hasAttitude=Boolean(g.guSystem&&g.guSystem.ownedGuList&&g.guSystem.ownedGuList.some(x=>x.id==="thai_do_tien_gu"&&x.isRefined));
const triExp=(pl.pathAttainmentExp&&pl.pathAttainmentExp["Trí Đạo"])||0;
const discount=Math.min(0.45,triExp*0.001 + (hasAttitude?0.30 :0));
const cost=Math.max(40,Math.round((85 + this.notoriety*2.2)*(1 - discount)));
if (pl.primevalStones<cost) return {success:false,message:`Cần 💎 ${cost.toLocaleString("vi-VN")} Nguyên Thạch để đút lót & ngụy trang xóa Hải Bộ Văn Thư!`};
pl.primevalStones -=cost;
const drop=hasAttitude?95 :55;
this.notoriety=Math.max(0,this.notoriety - drop);
pl.alignment=Math.min(1000,(pl.alignment||0) + 12);
if (typeof pl.addPathAttainmentExp==="function") pl.addPathAttainmentExp("Trí Đạo",5);
if (g.autoSaveNow) g.autoSaveNow("bounty_cleanse");
return {
success:true,
message:`🎭 [Đấu Trí Ngụy Trang] Chi ${cost.toLocaleString("vi-VN")}💎 mua chuộc tình báo & thay hình đổi dạng${hasAttitude?" (Thái Độ Tiên Cổ hỗ trợ!)" :""}: Giảm -${drop} Độ Truy Nã (Còn: ${this.notoriety}), +12 Chính Khí!`
};
}

if (actionId==="righteous_donation") {
const cost=Math.max(60,rank*90);
if (pl.primevalStones<cost) return {success:false,message:`Cần 💎 ${cost.toLocaleString("vi-VN")} Nguyên Thạch để quyên góp cho Chính Đạo Liên Minh!`};
pl.primevalStones -=cost;
const meritGain=35 + rank*18;
pl.meritPoints=(pl.meritPoints||0) + meritGain;
pl.alignment=Math.min(1000,(pl.alignment||0) + 18);
pl.fame=(pl.fame||0) + 25;
this.notoriety=Math.max(0,this.notoriety - 20);
if (g.autoSaveNow) g.autoSaveNow("righteous_donate");
return {
success:true,
message:`🏛️ [Quyên Góp Chính Đạo] Đóng góp ${cost.toLocaleString("vi-VN")}💎: Nhận +${meritGain}🏅 Cống Hiến, +18 Chính Khí, +25 Danh Vọng và giảm -20 Độ Truy Nã!`
};
}

if (actionId==="demonic_raid") {
const mentalCost=25;
if (pl.mental<mentalCost) return {success:false,message:`Cần ${mentalCost} Tinh Thần để lập mưu cướp thương đội bóng đêm!`};
pl.mental -=mentalCost;
const stoneGain=Math.round((95 + rank*110)*(0.85 + Math.random()*0.45));
pl.primevalStones +=stoneGain;
pl.alignment=Math.max(-1000,(pl.alignment||0) - 22);
const matPool=["ration_meat","spirit_herb","beast_blood_core","remnant_recipe","no_le_gu_r1"];
const pickId=matPool[Math.floor(Math.random()*matPool.length)];
pl.addItem(pickId,1);
const meta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[pickId])||{name:pickId,icon:"📦"};
this.addNotoriety(38,"");
if (g.autoSaveNow) g.autoSaveNow("demonic_raid");
return {
success:true,
message:`🩸 [Ám Tập Thương Đội Đêm] Ra tay chớp nhoáng đoạt được +${stoneGain.toLocaleString("vi-VN")}💎 Nguyên Thạch & 1x ${meta.icon} ${meta.name}! (-22 Chính Khí, +38 Độ Truy Nã -> ${this.notoriety})`
};
}

if (actionId==="provoke_ambush") {
if (this.notoriety<20) {
this.notoriety=25;
}
this.forcedAmbushNext=true;
pl.alignment=Math.max(-1000,(pl.alignment||0) - 10);
if (g.autoSaveNow) g.autoSaveNow("bounty_provoke");
return {
success:true,
message:`⚔️ [Khiêu Chiến Thần Bộ] Đã gửi chiến thư khiêu khích Chính Đạo! Đội Thần Bộ / Chấp Pháp chắc chắn sẽ MAI PHỤC ngươi trong trận chiến tới — hạ gục chúng để đoạt Túi Trữ Vật Thần Bộ!`
};
}

return {success:false,message:"Thao tác không hợp lệ."};
}

// ============================================================================
// BATTLE LIFECYCLE: SPAWN TARGET BOUNTY & TRIGGER DYNAMIC AMBUSHS!
// ============================================================================
onEnterBattle(stage) {
this.activeAmbushIds=[];
this.activeBountyEntityId=null;
this.ambushTriggeredInStage=false;
this.ambushCheckTimer=14 + Math.random()*10;
this.alertBannerText="";
this.alertBannerTimer=0;

if (!stage||stage.isStoryStage) return;

// 1. Spawn Active Demonic Bounty Target if player entered matching stage (or any stage with reqRank >= bounty.reqRank)!
const bounty=this.getActiveBounty();
if (bounty&&(stage.id===bounty.stageId||(!stage.isSpecialResourceStage&&(stage.reqRank||1)>=bounty.reqRank))) {
this._spawnBountyTargetEntity(bounty,stage);
}

// 2. If player deliberately sent a Provocation Letter, schedule rapid ambush in 5 seconds!
if (this.forcedAmbushNext) {
this.ambushCheckTimer=5.0;
}
}

_spawnBountyTargetEntity(bounty,stage) {
const g=this.game;
if (!g|| !g.enemies|| !g.map) return;
const cx=stage.arenaCenterX||4000;
const cy=stage.arenaCenterY||4000;
const pt=g.map.getRandomWalkablePoint(cx,cy,520,1450);
const rank=bounty.rank||1;
const hpMap={1:360,2:780,3:1650,4:3600,5:8200,6:32000,7:95000,8:240000};
const atkMap={1:26,2:46,3:85,4:160,5:310,6:1150,7:3200,8:7800};
const defMap={1:14,2:28,3:55,4:105,5:210,6:820,7:2200,8:5400};
const maxHp=hpMap[rank]||600;
const ent={
id:`bounty_target_${bounty.id}_${Date.now()}`,
entityType:"beast",
typeId:"human_bounty",
isHuman:true,
isBoss:true,
isElite:true,
isStageBoss:false,
isBountyTarget:true,
bountyId:bounty.id,
skinKey:bounty.skinKey||"phuong_nguyen",
name:`🎯 [TRUY NÃ] ${bounty.name}`,
title:bounty.title,
icon:"🎯",
rank,
rankBadge:`Truy Nã ${rank}C`,
color:bounty.color||"#ff3b30",
projectileColor:bounty.color||"#ff3b30",
attackGuName:bounty.attackGuName,
killerMoveName:bounty.killerMoveName,
x:pt.x,y:pt.y,homeX:pt.x,homeY:pt.y,
radius:22,
hp:maxHp,maxHp,
shieldHp:Math.round(maxHp*0.25),maxShieldHp:Math.round(maxHp*0.25),
atk:atkMap[rank]||45,def:defMap[rank]||25,spd:142 + rank*6,
aggroRange:540,attackRange:290,rangedGuId:bounty.guDropId||"nguyet_quang_gu",
drops:[],
aiState:"patrol",patrolTargetX:pt.x,patrolTargetY:pt.y,patrolTimer:2,
attackCooldown:0,guSkillCooldown:1.2,defGuCooldown:4,moveGuCooldown:3,healGuCooldown:6,killerMoveCooldown:5.5,dashSkillCooldown:4.5,
slowTimer:0,slowFactor:1,calledAllies:false,isHostile:true,isDead:false,respawnTimer:9999
};
g.enemies.beasts.push(ent);
this.activeBountyEntityId=ent.id;
this.alertBannerText=`🎯 Ma Đầu Truy Nã 【${bounty.name} (${rank} Chuyển)】 đang ẩn nấp trong bản đồ! (Chấm tím trên Minimap)`;
this.alertBannerColor="#c278ff";
this.alertBannerTimer=12;
if (g.ui) g.ui.addLog(`🎯 [Lệnh Truy Nã] Phát hiện tung tích Ma Đầu 【${bounty.name} (${rank} Chuyển)】 đang ẩn náu trong 【${stage.name}】! Hãy theo chấm tím trên Minimap để truy sát!`,"warning");
}

tryTriggerAmbush(triggerReason="roaming") {
if (this.ambushTriggeredInStage) return false;
const g=this.game;
if (!g|| !g.player|| !g.enemies|| !g.map||g.currentScreen!=="battle") return false;
if (g.isBattlePaused||g.isPermadead||g.player.hp<=0) return false;

const tier=this.getWantedTier();
if (tier.level<=0&& !this.forcedAmbushNext) return false;

let chance=tier.ambushChance;
if (triggerReason==="harvest") chance +=0.16;
else if (triggerReason==="post_boss") chance +=0.22;
if (this.forcedAmbushNext) chance=1.0;
if (Math.random()>chance) return false;

this.ambushTriggeredInStage=true;
this.forcedAmbushNext=false;

const leaderCfg=D.getAmbushLeaderForTier(Math.max(1,tier.level));
const pRank=(g.aperture&&g.aperture.rank)?g.aperture.rank :1;
const ambRank=Math.max(1,Math.min(8,pRank));
const hpMap={1:290,2:640,3:1380,4:3000,5:6800,6:26000,7:76000,8:195000};
const atkMap={1:22,2:40,3:74,4:140,5:270,6:980,7:2750,8:6600};
const defMap={1:12,2:24,3:48,4:92,5:185,6:700,7:1900,8:4600};

const squadCount=Math.max(2,tier.squadSize||2);
const baseAng=Math.random()*Math.PI*2;
for (let i=0;i<squadCount;i++) {
const isLeader=(i===0);
const ang=baseAng + (Math.PI*2*i)/squadCount;
const dist=235 + Math.random()*75;
let sx=Math.round(g.player.x + Math.cos(ang)*dist);
let sy=Math.round(g.player.y + Math.sin(ang)*dist);
if (!g.map.isWalkable(sx,sy,18)) {
const pt=g.map.getRandomWalkablePoint(g.player.x,g.player.y,180,340);
sx=pt.x;sy=pt.y;
}
const mHp=Math.round((hpMap[ambRank]||450)*(isLeader?1.15 :0.55));
const ent={
id:`ambush_${Date.now()}_${i}`,
entityType:"beast",
typeId:"human_ambush",
isHuman:true,
isBoss:isLeader,
isElite:true,
isStageBoss:false,
isAmbushEnforcer:true,
isAmbushLeader:isLeader,
wantedLevel:Math.max(1,tier.level),
skinKey:isLeader?leaderCfg.skinKey :"phuong_chinh",
name:isLeader?`🚨 [THẦN BỘ] ${leaderCfg.name}` :`🚨 ${leaderCfg.minionName}`,
title:leaderCfg.title,
icon:"🚨",
rank:ambRank,
rankBadge:`Thần Bộ ${ambRank}C`,
color:leaderCfg.color||"#ffd700",
projectileColor:leaderCfg.color||"#ffd700",
attackGuName:leaderCfg.attackGuName,
killerMoveName:leaderCfg.killerMoveName,
x:sx,y:sy,homeX:sx,homeY:sy,
radius:isLeader?21 :16,
hp:mHp,maxHp:mHp,
shieldHp:isLeader?Math.round(mHp*0.22) :0,
maxShieldHp:isLeader?Math.round(mHp*0.22) :0,
atk:Math.round((atkMap[ambRank]||35)*(isLeader?1.05 :0.68)),
def:Math.round((defMap[ambRank]||18)*(isLeader?1.0 :0.72)),
spd:140 + ambRank*6,
aggroRange:750,attackRange:280,rangedGuId:"nguyet_quang_gu",
drops:[],
aiState:"chase",patrolTargetX:g.player.x,patrolTargetY:g.player.y,patrolTimer:1,
attackCooldown:0.4,guSkillCooldown:1.2,defGuCooldown:4,moveGuCooldown:3,healGuCooldown:6,killerMoveCooldown:5.0,dashSkillCooldown:4,
slowTimer:0,slowFactor:1,calledAllies:false,isHostile:true,isDead:false,respawnTimer:9999
};
g.enemies.beasts.push(ent);
this.activeAmbushIds.push(ent.id);
if (g.combat) g.combat._spawnParticleBurst(sx,sy,leaderCfg.color||"#ffd700",8);
}

const reasonTag=triggerReason==="harvest"?"ngay lúc ngươi đang khai thác mỏ" :(triggerReason==="post_boss"?"ngay khi ngươi vừa huyết chiến xong" :"giữa chiến trường");
this.alertBannerText=`🚨 MAI PHỤC! 【${leaderCfg.name}】 dẫn ${squadCount} Thần Bộ phục kích ${reasonTag}!`;
this.alertBannerColor="#ff4d4d";
this.alertBannerTimer=14;

if (g.combat) {
g.combat.triggerScreenShake(7,0.28);
g.combat.spawnFloatingText(g.player.x,g.player.y - 46,`🚨 MAI PHỤC: ${leaderCfg.name}!`,"#ff4d4d");
}
if (g.ui) {
g.ui.addLog(`🚨 [MAI PHỤC CHÍNH ĐẠO] ${leaderCfg.name} (${leaderCfg.title}) dẫn theo ${squadCount} Thần Bộ bất ngờ phục kích ${reasonTag}! ${leaderCfg.quote}`,"danger");
}
return true;
}

onEntityKilled(target) {
const g=this.game;
if (!g|| !g.player|| !target) return false;
const pl=g.player;

// Case 1: Killed a Bounty Demonic Outlaw!
if (target.isBountyTarget&&target.bountyId) {
const b=D.getBountyById(target.bountyId);
if (!b) return false;
this.activeBountyEntityId=null;
if (this.activeBountyId===b.id) this.activeBountyId=null;
this.completedCounts[b.id]=(this.completedCounts[b.id]||0) + 1;

pl.primevalStones +=b.rewardStones;
pl.meritPoints=(pl.meritPoints||0) + b.rewardMerit;
pl.alignment=Math.min(1000,(pl.alignment||0) + b.rewardAlignment);
pl.fame=(pl.fame||0) + b.rewardFame;
this.notoriety=Math.max(0,this.notoriety - 25);
if (b.rewardItem) pl.addItem(b.rewardItem,1);
const itemMeta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[b.rewardItem])||{name:b.rewardItem,icon:"📦"};

let guNote="";
if (b.guDropId&&g.guSystem&&Math.random()<0.65) {
const added=g.guSystem.addGuToStorage(b.guDropId,{rank:Math.min(5,b.rank),isRefined:false,refinementProgress:0});
if (added) {
const fn=global.GuSystem&&global.GuSystem.formatGuNameWithRank?global.GuSystem.formatGuNameWithRank(added) :added.name;
guNote=` + 🪲 [${fn}]`;
}
}
if (g.combat) {
g.combat._spawnParticleBurst(target.x,target.y,"#ffd700",10);
g.combat.spawnFloatingText(target.x,target.y - 40,`🎯 TRẢM MA THÀNH CÔNG! +${b.rewardStones}💎`,"#ffd700");
}
if (g.ui) {
g.ui.addLog(
`🎯 [HOÀN THÀNH LỆNH TRUY NÃ] Đã tiêu diệt Ma Đầu 【${b.name}】! Đoạt Túi Trữ Vật: +${b.rewardStones.toLocaleString("vi-VN")}💎, +${b.rewardMerit}🏅 Cống Hiến, +${b.rewardAlignment} Chính Khí, 1x ${itemMeta.icon} ${itemMeta.name}${guNote}!`,
"loot"
);
}
this.alertBannerText=`✅ Đã trảm Ma Đầu 【${b.name}】 — Hoàn thành Lệnh Truy Nã!`;
this.alertBannerColor="#5cc995";
this.alertBannerTimer=6;
if (g.autoSaveNow) g.autoSaveNow("bounty_complete");
return true;
}

// Case 2: Killed an Ambush Enforcer (Thần Bộ / Giám Sát Sứ)
if (target.isAmbushEnforcer) {
const idx=this.activeAmbushIds.indexOf(target.id);
if (idx>=0) this.activeAmbushIds.splice(idx,1);
const wLv=target.wantedLevel||1;
const r=target.rank||1;
const stones=Math.round((target.isAmbushLeader?140 :55)*r*(1 + wLv*0.25));
pl.primevalStones +=stones;
pl.fame=(pl.fame||0) + (target.isAmbushLeader?45 :15);
pl.alignment=Math.max(-1000,(pl.alignment||0) - (target.isAmbushLeader?12 :4));

let bonusLoot="";
if (target.isAmbushLeader) {
this.ambushesDefeated +=1;
this.addNotoriety(16,"");
const dropId=r>=6?"immortal_stone" :(r>=3?"remnant_recipe" :"no_le_gu_r2");
pl.addItem(dropId,1);
const meta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[dropId])||{name:dropId,icon:"📦"};
bonusLoot=` + 1x ${meta.icon} ${meta.name}`;
if (g.combat) g.combat.spawnFloatingText(target.x,target.y - 38,`💀 PHẢN SÁT THẦN BỘ! +${stones}💎`,"#ff8a8a");
}
if (g.ui) {
g.ui.addLog(`⚔️ [Phản Sát Mai Phục] Đã hạ gục 【${target.name}】! Đoạt Túi Trữ Vật Thần Bộ: +${stones.toLocaleString("vi-VN")}💎${bonusLoot}!`,"loot");
}
if (this.activeAmbushIds.length===0) {
this.alertBannerText="🔥 Đã phá tan toàn bộ Đội Mai Phục Chính Đạo — Uy chấn Ma Đạo!";
this.alertBannerColor="#ffd700";
this.alertBannerTimer=6;
if (g.autoSaveNow) g.autoSaveNow("ambush_defeated");
}
return true;
}
return false;
}

update(dt) {
if (this.alertBannerTimer>0) {
this.alertBannerTimer=Math.max(0,this.alertBannerTimer - dt);
if (this.alertBannerTimer<=0) this.alertBannerText="";
}
if (!this.ambushTriggeredInStage&&(this.notoriety>=20||this.forcedAmbushNext)) {
this.ambushCheckTimer -=dt;
if (this.ambushCheckTimer<=0) {
this.ambushCheckTimer=22 + Math.random()*12;
this.tryTriggerAmbush("roaming");
}
}
}

toSaveData() {
return {
notoriety:this.notoriety,
activeBountyId:this.activeBountyId,
completedCounts:{...this.completedCounts},
ambushesDefeated:this.ambushesDefeated,
forcedAmbushNext:Boolean(this.forcedAmbushNext)
};
}

fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
this.notoriety=Math.max(0,Math.min(400,Math.round(Number(data.notoriety)||0)));
if (data.activeBountyId&&D.getBountyById(data.activeBountyId)) {
this.activeBountyId=data.activeBountyId;
}
if (data.completedCounts&&typeof data.completedCounts==="object") {
this.completedCounts={...data.completedCounts};
}
this.ambushesDefeated=Math.max(0,Math.floor(Number(data.ambushesDefeated)||0));
this.forcedAmbushNext=Boolean(data.forcedAmbushNext);
}
}

global.BountySystem=BountySystem;
})(window);
