(function (global) {
"use strict";
const STAGE_MECHANICS={
stage_1:{
mode:"beacon_conquest",
badge:"🔥 Thắp 3 Đuốc Hộ Sơn Thanh Mao",
propName:"Đuốc Hộ Sơn Thanh Mao",
propIcon:"🔥",
propColor:"#ff9f43",
propCount:3,
summary:"Thắp sáng 3 Đuốc Hộ Sơn Thanh Mao (chạm [E]/🤝) để xua đuổi sương rừng (+20% ATK mỗi đuốc) và dẫn dụ Điện Lang Vương!"
},
stage_2:{
mode:"relic_hunt",
badge:"🍶 Truy Tìm 3 Dấu Vết Hoa Tửu",
propName:"Vò Rượu Cổ Hoa Tửu",
propIcon:"🍶",
propColor:"#f7c948",
propCount:3,
summary:"Khám phá hang đá tìm đủ 3 Vò Rượu Cổ của Hoa Tửu Hành Giả để mở mật thất gọi Xích Nhãn Tửu Viên Vương!"
},
stage_3:{
mode:"seal_break",
badge:"🩸 Phá 3 Trận Nhãn Huyết Hồ",
propName:"Trận Nhãn Huyết Trì",
propIcon:"🩸",
propColor:"#e03e3e",
propCount:3,
summary:"Phá hủy hoặc giải trừ 3 Trận Nhãn Huyết Trì đang hút máu tạo khiên bất tử cho Huyết Thi Cổ Sư!"
},
stage_4:{
mode:"defense_hold",
badge:"🛡️ Thủ Thành: Bảo Vệ Hộ Trại Đại Trận",
coreName:"Cổ Nguyệt Hộ Trại Đại Trận",
coreIcon:"🏯",
propColor:"#5aa9e6",
summary:"Đàn Huyết Lang đang tràn vào Sơn Trại! Đứng gần Đại Trận để hồi máu & thủ vững đến khi Lôi Quan Đầu Lang xuất trận!"
},
stage_5:{
mode:"spawner_destroy",
badge:"🦴 Phá 3 Bạch Cốt Trụ Triệu Hồi",
propName:"Bạch Cốt Trụ Triệu Hồi",
propIcon:"🦴",
propColor:"#dce8f2",
propCount:3,
summary:"3 Bạch Cốt Trụ liên tục triệu hồi Khôi Lỗi mỗi 11s! Hãy đập nát hoặc giải ấn cả 3 Trụ để ép Thủ Điện hiện thân!"
},
stage_6:{
mode:"hazard_survival",
hazardType:"toxic_mire",
badge:"☠️ Chướng Khí Hủ Độc — Thắp 3 Linh Hỏa Đàn",
propName:"Linh Hỏa Đàn Giải Độc",
propIcon:"🔥",
propColor:"#5cc995",
propCount:3,
summary:"Đầm lầy phun Chướng Khí Hủ Độc mỗi 6s! Hãy thắp sáng 3 Linh Hỏa Đàn (vùng lửa giải độc & hồi máu) để khu trừ độc chướng!"
},
stage_7:{
mode:"arena_duel",
badge:"🏮 Lôi Đài Đấu Vũ 3 Hiệp Quyết Đấu",
propColor:"#ffd700",
rounds:3,
summary:"Quyết đấu 3 hiệp Lôi Đài liên hoàn tại Thương Gia Thành! Hạ mỗi hiệp nhận reo hò khán giả (+25% Sát Lực & hồi 40% HP) trước khi đấu Thiết Đao Khổ!"
},
stage_8:{
mode:"seal_break",
badge:"⛓️ Phá 3 Thiết Tỏa Phong Ấn",
propName:"Thiết Tỏa Trận Cơ",
propIcon:"⛓️",
propColor:"#67b7d1",
propCount:3,
summary:"Thiết Gia Tứ Lão bày Thiết Tỏa Đại Trận! Phá giải 3 Trận Cơ để xóa bỏ lớp giáp giảm thương của Boss!"
},
stage_9:{
mode:"beacon_conquest",
badge:"🦁 Áp Chế 3 Tế Đàn Vạn Thú",
propName:"Tế Đàn Thú Vương",
propIcon:"🗿",
propColor:"#e67e22",
propCount:3,
summary:"Trấn áp 3 Tế Đàn Vạn Thú giữa rừng nguyên sinh Nam Cương để cắt nguồn cuồng bạo của Hàn Sương Bạch Ngọc Mãng!"
},
stage_10:{
mode:"relic_hunt",
badge:"👑 Đoạt 3 Tam Vương Lệnh Bài",
propName:"Tam Vương Khí Vận Lệnh",
propIcon:"👑",
propColor:"#ffd700",
propCount:3,
summary:"Tranh đoạt 3 Tam Vương Lệnh Bài rải rác trên đỉnh Tam Vương Sơn trước sự cản phá của Thiết Ba Tu!"
},
stage_11:{
mode:"hazard_survival",
hazardType:"sand_firestorm",
badge:"🏜️ Bão Cát Lửa Thiêu — Nấp Ốc Đảo Linh Tuyền",
propName:"Ốc Đảo Linh Tuyền",
propIcon:"🌴",
propColor:"#4ce6ff",
propCount:3,
summary:"Mỗi 13s Bão Cát Lửa quét toàn sa mạc! Chạy vào vòng xanh Ốc Đảo Linh Tuyền để miễn nhiễm bão lửa & kích hoạt đủ 3 Ốc Đảo!"
},
stage_12:{
mode:"beacon_conquest",
badge:"🪜 Chinh Phục 3 Bậc Thềm Thiên Thê",
propName:"Cổ Bia Thiên Thê Sơn",
propIcon:"🗡️",
propColor:"#67b7d1",
propCount:3,
summary:"Đánh bật tinh anh Thập Đại Cổ Phái và khắc tên lên 3 Cổ Bia Thiên Thê để khiêu chiến Phương Chính & Tôn Nguyên Hóa!"
},
stage_13:{
mode:"beacon_conquest",
badge:"🚩 Đoạt 3 Chiến Kỳ Hoàng Kim Bộ Tộc",
propName:"Chiến Kỳ Bắc Nguyên",
propIcon:"🚩",
propColor:"#f7c948",
propCount:3,
summary:"Cắm lại 3 Chiến Kỳ trên thảo nguyên Bắc Nguyên (+20% Sĩ Khí mỗi kỳ) để bức Song Hùng Bắc Nguyên xuất chiến!"
},
stage_14:{
mode:"arena_duel",
badge:"🔥 Vương Đình Tranh Bá — 3 Hiệp Khiêu Chiến",
propColor:"#ff4d4d",
rounds:3,
summary:"Đại hội Anh Hùng Vương Đình: Lần lượt đánh bại 3 đợt Thống Lĩnh Hắc Gia Quân để trực diện quyết chiến Hắc Lâu Lan!"
},
stage_15:{
mode:"spawner_destroy",
badge:"🏯 Phá 3 Tầng Ấn Chân Dương Lâu",
propName:"Chân Dương Lâu Ấn Trụ",
propIcon:"🏯",
propColor:"#ffd700",
propCount:3,
summary:"Phá hủy 3 Ấn Trụ đang triệu hồi Hộ Lâu Thú trong Bát Thập Bát Giác Chân Dương Lâu để ép Tàn Ý Cự Dương lộ diện!"
},
stage_16:{
mode:"defense_hold",
badge:"🦊 Bảo Vệ Đãng Hồn Sơn Linh Căn",
coreName:"Đãng Hồn Sơn Linh Căn",
coreIcon:"🔮",
propColor:"#ff85d5",
summary:"Tiên Hạc Môn tấn công Hồ Tiên Phúc Địa! Bảo vệ Đãng Hồn Sơn Linh Căn cho tới khi đánh lui Hạc Phong Dương!"
},
stage_17:{
mode:"defense_hold",
badge:"☁️ Thủ Vững Vân Các Luyện Cổ Lô",
coreName:"Lang Gia Vân Các Đại Lô",
coreIcon:"🏺",
propColor:"#7ef7f0",
summary:"Bảo vệ Lang Gia Vân Các khỏi đợt tập kích của Ảnh Tông & Tuyết Tùng Tử! Đứng gần Đại Lô hồi nhanh Tiên Nguyên!"
},
stage_18:{
mode:"beacon_conquest",
badge:"🌟 Phá 3 Tinh Bàn Ảo Ảnh Đông Phương",
propName:"Tinh Tượng Kỳ Bàn",
propIcon:"🌟",
propColor:"#85c1e9",
propCount:3,
summary:"Đông Phương Trường Phàm bày Tinh Tượng Đại Trận! Tìm & phá giải 3 Tinh Tượng Kỳ Bàn để phá tan ảo trận!"
},
stage_19:{
mode:"seal_break",
badge:"⚔️ Phá 4 Cột Thập Tuyệt Tiên Cương Trận",
propName:"Tiên Cương Trận Trụ",
propIcon:"💀",
propColor:"#ff3b30",
propCount:4,
summary:"Phá hủy 4 Trụ Thập Tuyệt Tiên Cương tại Nghĩa Thiên Sơn để ngăn Ảnh Tông luyện Chí Tôn Tiên Thai Cổ!"
},
stage_20:{
mode:"beacon_conquest",
badge:"⏳ Trấn Áp 3 Đồng Hồ Quang Âm Hắc Phàm",
propName:"Quang Âm Trụ Hắc Phàm",
propIcon:"⏳",
propColor:"#5cc995",
propCount:3,
summary:"Đoạt quyền khống chế 3 Quang Âm Trụ trong Hắc Phàm Động Thiên để giảm hồi chiêu & thách đấu Bá Tiên Sở Độ!"
},
stage_21:{
mode:"hazard_survival",
hazardType:"reverse_flow_river",
badge:"🌊 Nghịch Lưu Hà — Ngược Dòng Chạm 3 Cổ Bia",
propName:"Nghịch Lưu Hà Cổ Bia",
propIcon:"🌊",
propColor:"#4ce6ff",
propCount:3,
summary:"Dòng sông Nghịch Lưu đẩy lùi liên tục mọi Cổ Tiên! Hãy vận Thân Pháp ngược dòng kích hoạt 3 Cổ Bia nhận 【Nghịch Lưu Hộ Thể】!"
},
stage_22:{
mode:"hazard_survival",
hazardType:"time_ripples",
badge:"⏳ Quang Âm Trường Hà — Xoáy Thời Gian",
propName:"Thạch Liên Mảnh Thời Quang",
propIcon:"⏳",
propColor:"#f2d16b",
propCount:3,
summary:"Sóng Quang Âm tạo các Vùng Gia Tốc (+40% Tốc Độ) & Vùng Trì Hoãn! Thu thập 3 Mảnh Thời Quang Thạch Liên Đảo!"
},
stage_23:{
mode:"relic_hunt",
badge:"🐉 Đoạt 3 Đông Hải Long Cung Bảo Châu",
propName:"Long Cung Định Hải Châu",
propIcon:"🫧",
propColor:"#3b8beb",
propCount:3,
summary:"Thu thập 3 viên Định Hải Châu trong Long Cung để mở kho Tiên Cổ Ốc & quyết chiến Tuyết Hồ Lão Tổ cùng Bạc Thanh!"
},
stage_24:{
mode:"seal_break",
badge:"⚡ Phá 4 Mạch Giám Thiên Tháp — Nghiền Túc Mệnh",
propName:"Giám Thiên Tháp Trận Cơ",
propIcon:"⚡",
propColor:"#ffd700",
propCount:4,
summary:"Phá hủy 4 Trận Cơ bảo vệ Giám Thiên Tháp để làm lộ Túc Mệnh Cổ và bức Á Tiên Tôn Long Công tung toàn lực!"
},
stage_25:{
mode:"hazard_survival",
hazardType:"chaos_rifts",
badge:"👑 Phong Ma Quật — Đóng 3 Vết Nứt Hỗn Độn Vô Cực",
propName:"Vết Nứt Hỗn Độn Thiên Ngoại",
propIcon:"🌌",
propColor:"#00e5ff",
propCount:3,
summary:"Vô Cực Hỗn Độn Đại Trận đang rò rỉ Hỗn Độn Khí! Đóng 3 Vết Nứt Hỗn Độn để phá kết giới & độc chiến Song Tôn Cửu Chuyển!"
}
};
class StageManager {
constructor(gameEngine) {
this.game=gameEngine||null;
this.reset();
}
reset() {
this.activeMechanic=null;
this.props=[];
this.hazardZones=[];
this.defenseCore=null;
this.completedObjectiveCount=0;
this.requiredObjectiveCount=0;
this.mechanicCompleted=false;
this.hazardTimer=0;
this.hazardActiveTimer=0;
this.hazardTelegraphTimer=0;
this.spawnerTimer=0;
this.duelRound=1;
this.duelMaxRounds=3;
this.duelWaveClearing=false;
this.riverPushTick=0;
this.bossSealShieldActive=false;
}
static getMechanicProfile(stageId) {
return STAGE_MECHANICS[stageId]||null;
}
setupStageMechanics(stage,mapManager,player) {
this.reset();
if (!stage) return;
if (stage.isSpecialResourceStage||stage.noBoss) {
this.activeMechanic={
mode:"secret_realm_trial",
badge:"🌾 Bí Cảnh Khám Phá — Cơ Duyên & Cổ Tài",
summary:"Tự do khai thác 10 Mỏ Cổ Tài & canh Cơ Duyên Giữa Trận (Dã Cổ, Bia Di Tích, Thương Nhân) xuất hiện định kỳ!"
};
return;
}
const prof=STAGE_MECHANICS[stage.id]||{
mode:"beacon_conquest",
badge:"🔥 Chinh Phạt Trận Địa",
propName:"Cổ Trận Ấn",
propIcon:"🔥",
propColor:"#ffd700",
propCount:3,
summary:"Kích hoạt 3 Cổ Trận Ấn trên bản đồ để mở đường gọi Thủ Lĩnh!"
};
this.activeMechanic={...prof};
const cx=stage.arenaCenterX||4000;
const cy=stage.arenaCenterY||4000;
if (prof.mode==="defense_hold") {
const rank=stage.reqRank||1;
const coreMaxHp=Math.round(600*Math.pow(2.2,Math.min(8,rank - 1)));
this.defenseCore={
name:prof.coreName||"Hộ Trận Đại Trận",
icon:prof.coreIcon||"🏯",
color:prof.propColor||"#5aa9e6",
x:cx,
y:cy,
radius:36,
hp:coreMaxHp,
maxHp:coreMaxHp,
healTimer:0
};
this.requiredObjectiveCount=1;
this.completedObjectiveCount=0;
} else if (prof.mode==="arena_duel") {
this.duelRound=1;
this.duelMaxRounds=prof.rounds||3;
this.requiredObjectiveCount=this.duelMaxRounds;
this.completedObjectiveCount=0;
this._spawnDuelRoundEnemies(stage,1);
} else {
const count=prof.propCount||3;
this.requiredObjectiveCount=count;
this.completedObjectiveCount=0;
this.bossSealShieldActive=(prof.mode==="seal_break");
if (prof.mode==="seal_break"&&this.game&&typeof this.game.spawnStageBossNow==="function") {
stage.kills=stage.targetKills;
this.game.spawnStageBossNow();
if (this.game.ui) {
this.game.ui.addLog(`🔒 【${stage.bossName}】 đã đích thân tọa trấn ngay từ đầu dưới lớp Khiên Trận Nhãn (-70% sát thương)! Hãy phá hết ${count} Trận Nhãn để tước bỏ bất tử hộ thuẫn!`,"warning");
}
}
for (let i=0;i<count;i++) {
const ang=(Math.PI*2*i) / count + 0.4;
const dist=540 + (i % 2)*260;
const rawX=cx + Math.cos(ang)*dist;
const rawY=cy + Math.sin(ang)*dist;
const pt=mapManager
?mapManager.getRandomWalkablePoint(rawX,rawY,10,95)
:{x:rawX,y:rawY};
this.props.push({
id:`prop_${stage.id}_${i}`,
name:`${prof.propName} #${i + 1}`,
icon:prof.propIcon||"🔥",
color:prof.propColor||"#ffd700",
mode:prof.mode,
hazardType:prof.hazardType||null,
x:pt.x,
y:pt.y,
radius:28,
activated:false,
isSafeZone:prof.hazardType==="toxic_mire"||prof.hazardType==="sand_firestorm"
});
}
if (prof.hazardType==="time_ripples") {
for (let z=0;z<4;z++) {
const a=(Math.PI / 2)*z;
this.hazardZones.push({
x:cx + Math.cos(a)*280,
y:cy + Math.sin(a)*280,
radius:110,
kind:z % 2===0?"haste" :"slow",
color:z % 2===0?"#5cc995" :"#85c1e9"
});
}
}
}
if (this.game&&this.game.ui) {
this.game.ui.addLog(`🧩 [CƠ CHẾ BẢN ĐỒ] ${prof.badge} — ${prof.summary}`,"cultivation");
}
}
_spawnDuelRoundEnemies(stage,roundNum) {
if (!this.game|| !this.game.enemies) return;
this.game.enemies.beasts=[];
const cx=stage.arenaCenterX||4000;
const cy=stage.arenaCenterY||4000;
const count=roundNum===1?2 :(roundNum===2?3 :4);
for (let i=0;i<count;i++) {
const ang=(Math.PI*2*i) / count;
const ex=cx + Math.cos(ang)*230;
const ey=cy + Math.sin(ang)*230;
const pool=Array.isArray(stage.mobPool)&&stage.mobPool.length>0?stage.mobPool :null;
const mobCfg=pool?pool[i % pool.length] :null;
const mob=this.game._createStageEnemy(stage,ex,ey,false,i===0,null,mobCfg);
if (mob) {
mob.name=`[Hiệp ${roundNum}] ${mob.name}`;
mob.aiState="chase";
}
}
if (this.game.combat&&this.game.player) {
this.game.combat.spawnFloatingText(this.game.player.x,this.game.player.y - 40,`🏮 LÔI ĐÀI HIỆP ${roundNum}/${this.duelMaxRounds} BẮT ĐẦU!`,"#ffd700");
}
}
update(dt,stage,player,mapManager,enemies,combatSystem) {
if (!stage|| !this.activeMechanic|| !player||player.hp<=0) return;
const m=this.activeMechanic;
if (m.mode==="defense_hold"&&this.defenseCore) {
const core=this.defenseCore;
const dPlayer=Math.hypot(player.x - core.x,player.y - core.y);
if (dPlayer<=130) {
core.healTimer +=dt;
if (core.healTimer>=1.5) {
core.healTimer=0;
player.heal(Math.max(4,Math.round(player.maxHp*0.025)));
}
}
if (enemies&&Array.isArray(enemies.beasts)) {
for (const b of enemies.beasts) {
if (b.isDead) continue;
const dCore=Math.hypot(b.x - core.x,b.y - core.y);
if (dCore<=core.radius + b.radius + 18) {
core.hp=Math.max(0,core.hp - Math.max(1,(b.atk||15)*0.12*dt));
}
}
}
if (stage.bossSpawned&& !this.mechanicCompleted) {
this.mechanicCompleted=true;
this.completedObjectiveCount=1;
if (core.hp>=core.maxHp*0.5&&this.game&&this.game.questManager) {
this.game.questManager.recordEvent("mechanic_clear",stage.id,1);
}
}
return;
}
if (m.mode==="arena_duel"&& !stage.bossSpawned) {
const living=enemies?enemies.beasts.filter(b=> !b.isDead&& !b.isStageBoss).length :0;
if (living===0) {
if (this.duelRound<this.duelMaxRounds) {
this.duelRound +=1;
this.completedObjectiveCount=this.duelRound - 1;
player.heal(Math.round(player.maxHp*0.35));
player.addBuff({
id:"arena_crowd_cheer",
name:"Sĩ Khí Lôi Đài (+25% ATK)",
icon:"🏮",
duration:14,
statMods:{atk:Math.max(10,Math.round(player.atk*0.25))},
visualColor:"#ffd700"
});
if (this.game&&this.game.ui) {
this.game.ui.addLog(`🏮 Khán giả Đấu Vũ Trường reo hò! Thắng Hiệp ${this.duelRound - 1} (+35% HP & +25% Sát Lực). Chuẩn bị Hiệp ${this.duelRound}!`,"loot");
if (this.game.ui.battleUI&&typeof this.game.ui.battleUI.openTacticalBlessingModal==="function") {
this.game.ui.battleUI.openTacticalBlessingModal(`Thắng Lôi Đài Hiệp ${this.duelRound - 1}`);
}
}
this._spawnDuelRoundEnemies(stage,this.duelRound);
} else if (!this.mechanicCompleted) {
this.mechanicCompleted=true;
this.completedObjectiveCount=this.duelMaxRounds;
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("mechanic_clear",stage.id,1);
}
stage.kills=stage.targetKills;
this._triggerBossFromMechanic(stage);
}
}
return;
}
if (m.mode==="spawner_destroy"&& !this.mechanicCompleted) {
this.spawnerTimer +=dt;
if (this.spawnerTimer>=11) {
this.spawnerTimer=0;
const activeSpawners=this.props.filter(p=> !p.activated);
if (activeSpawners.length>0&&enemies&&enemies.beasts.filter(b=> !b.isDead).length<18) {
const sp=activeSpawners[Math.floor(Math.random()*activeSpawners.length)];
if (this.game&&typeof this.game._createStageEnemy==="function") {
const spawned=this.game._createStageEnemy(stage,sp.x + 25,sp.y + 25,false,false);
if (spawned) spawned.aiState="chase";
if (combatSystem) {
combatSystem.spawnFloatingText(sp.x,sp.y - 26,`${sp.icon} Trụ Triệu Hồi Khôi Lỗi!`,"#ff9f43");
}
}
}
}
}
if (m.mode==="hazard_survival") {
const hType=m.hazardType;
if (hType==="toxic_mire"&& !this.mechanicCompleted) {
this.hazardTimer +=dt;
if (this.hazardTimer>=6.0) {
this.hazardTimer=0;
const inSafe=this.props.some(p=>p.activated&&Math.hypot(player.x - p.x,player.y - p.y)<=135);
if (!inSafe) {
const dmg=Math.max(4,Math.round(player.maxHp*0.045));
player.hp=Math.max(1,player.hp - dmg);
if (combatSystem) combatSystem.spawnFloatingText(player.x,player.y - 26,`☠️ Chướng Khí -${dmg}`,"#9b59b6");
} else {
const heal=Math.max(3,Math.round(player.maxHp*0.04));
player.heal(heal);
if (combatSystem) combatSystem.spawnFloatingText(player.x,player.y - 26,`🔥 Linh Hỏa Giải Độc +${heal}`,"#5cc995");
}
}
} else if (hType==="sand_firestorm") {
this.hazardTimer +=dt;
if (this.hazardTelegraphTimer>0) {
this.hazardTelegraphTimer -=dt;
if (this.hazardTelegraphTimer<=0) {
const inOasis=this.props.some(p=>Math.hypot(player.x - p.x,player.y - p.y)<=125);
if (!inOasis) {
const dmg=Math.max(8,Math.round(player.maxHp*0.12));
player.hp=Math.max(1,player.hp - dmg);
if (combatSystem) {
combatSystem.triggerScreenShake(8,0.35);
combatSystem.spawnFloatingText(player.x,player.y - 30,`🔥 BÃO CÁT LỬA -${dmg}!`,"#ff5733");
}
} else if (combatSystem) {
player.heal(Math.round(player.maxHp*0.06));
combatSystem.spawnFloatingText(player.x,player.y - 30,`🌴 Ốc Đảo Che Chở!`,"#4ce6ff");
}
}
} else if (this.hazardTimer>=13.0) {
this.hazardTimer=0;
this.hazardTelegraphTimer=3.0;
if (combatSystem) combatSystem.spawnFloatingText(player.x,player.y - 42,`⚠️ BÃO CÁT LỬA ẬP TỚI SAU 3s — CHẠY VÀO ỐC ĐẢO!`,"#ff9f43");
}
} else if (hType==="reverse_flow_river") {
if (!this.mechanicCompleted) {
const pushSpd=46;
const nx=player.x - pushSpd*dt;
if (!mapManager||mapManager.isWalkable(nx,player.y,player.radius)) {
player.x=nx;
}
}
} else if (hType==="time_ripples") {
for (const z of this.hazardZones) {
if (Math.hypot(player.x - z.x,player.y - z.y)<=z.radius) {
if (z.kind==="haste") {
player.addBuff({id:"time_ripple_haste",name:"Quang Âm Gia Tốc",icon:"⏳",duration:1.5,statMods:{spdMult:1.38},visualColor:"#5cc995"});
} else {
player.addBuff({id:"time_ripple_slow",name:"Quang Âm Trì Hoãn",icon:"❄️",duration:1.2,statMods:{spdMult:0.72},visualColor:"#85c1e9"});
}
}
}
} else if (hType==="chaos_rifts"&& !this.mechanicCompleted) {
this.hazardTimer +=dt;
if (this.hazardTimer>=8.0) {
this.hazardTimer=0;
const openRifts=this.props.filter(p=> !p.activated).length;
if (openRifts>0&&combatSystem) {
const dmg=Math.max(15,Math.round(player.maxHp*0.025*openRifts));
player.hp=Math.max(1,player.hp - dmg);
combatSystem.spawnFloatingText(player.x,player.y - 28,`🌌 Hỗn Độn Thiên Ngoại Khí -${dmg}`,"#00e5ff");
}
}
}
}
}
getNearestInteractableProp(px,py,maxDist=72) {
let best=null;
let bestDist=maxDist;
for (const p of this.props) {
if (p.activated) continue;
const d=Math.hypot(p.x - px,p.y - py);
if (d<=bestDist) {
bestDist=d;
best=p;
}
}
return best;
}
interactWithProp(prop,stage,player,combatSystem) {
if (!prop||prop.activated) return {success:false};
prop.activated=true;
this.completedObjectiveCount=this.props.filter(p=>p.activated).length;
if (player) {
player.addBuff({
id:`stage_prop_buff_${this.completedObjectiveCount}`,
name:`${prop.icon} Thế Trận Gia Trì (+15% ATK)`,
icon:prop.icon,
duration:18,
statMods:{atk:Math.max(8,Math.round(player.atk*0.15))},
visualColor:prop.color
});
player.heal(Math.round(player.maxHp*0.12));
}
if (combatSystem) {
combatSystem.spawnFloatingText(prop.x,prop.y - 26,`✅ ${prop.name} (${this.completedObjectiveCount}/${this.requiredObjectiveCount})!`,"#7ef7c4");
}
if (this.game&&this.game.ui) {
this.game.ui.addLog(`🧩 Đã hoàn thành 【${prop.name}】 (${this.completedObjectiveCount}/${this.requiredObjectiveCount}) — Nhận +15% Công Kích & hồi 12% Sinh Mệnh!`,"cultivation");
}
if (this.completedObjectiveCount>=this.requiredObjectiveCount&& !this.mechanicCompleted) {
this.mechanicCompleted=true;
this.bossSealShieldActive=false;
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("mechanic_clear",stage?stage.id :"",1);
}
if (this.game&&this.game.ui) {
this.game.ui.addLog(`🔥 ĐÃ HOÀN TẤT TOÀN BỘ CƠ CHẾ BẢN ĐỒ 【${this.activeMechanic.badge}】! Phong ấn tan vỡ — tiến vào quyết chiến Thủ Lĩnh!`,"loot");
}
if (this.game&&this.game.ui&&this.game.ui.battleUI&&typeof this.game.ui.battleUI.openTacticalBlessingModal==="function") {
this.game.ui.battleUI.openTacticalBlessingModal("Hoàn Thành Cơ Chế Bản Đồ");
}
if (stage&& !stage.bossSpawned) {
stage.kills=stage.targetKills;
this._triggerBossFromMechanic(stage);
}
}
if (this.game&&this.game.ui) this.game.ui.updateBattleHUD();
return {success:true};
}
_triggerBossFromMechanic(stage) {
if (!stage||stage.bossSpawned|| !this.game) return;
if (typeof this.game.spawnStageBossNow==="function") {
this.game.spawnStageBossNow();
}
}
getObjectiveSummaryText() {
if (!this.activeMechanic) return null;
const m=this.activeMechanic;
if (m.mode==="secret_realm_trial") return null;
if (m.mode==="defense_hold"&&this.defenseCore) {
const pct=Math.ceil((this.defenseCore.hp / Math.max(1,this.defenseCore.maxHp))*100);
return `${m.badge} | HP Đại Trận: ${pct}%`;
}
if (m.mode==="arena_duel") {
return this.mechanicCompleted
?`🏮 Lôi Đài Quyết Đấu: Đã thắng 3/3 Hiệp — Thủ Lĩnh xuất trận!`
:`🏮 Lôi Đài Quyết Đấu: Hiệp ${this.duelRound}/${this.duelMaxRounds}`;
}
const status=this.mechanicCompleted?"✅ Đã Hoàn Thành" :`${this.completedObjectiveCount}/${this.requiredObjectiveCount} (Lại gần bấm [E]/🤝)`;
const stormNote=this.hazardTelegraphTimer>0?` | ⚠️ BÃO LỬA (${this.hazardTelegraphTimer.toFixed(1)}s)!` :"";
return `${m.badge}: ${status}${stormNote}`;
}
render(ctx,camera) {
if (!ctx|| !this.activeMechanic) return;
const camX=camera?camera.x :0;
const camY=camera?camera.y :0;
const t=performance.now()*0.004;
for (const z of this.hazardZones) {
const sx=z.x - camX;
const sy=z.y - camY;
ctx.save();
ctx.beginPath();
ctx.arc(sx,sy,z.radius,0,Math.PI*2);
ctx.fillStyle=z.kind==="haste"?"rgba(92, 201, 149, 0.14)" :"rgba(133, 193, 233, 0.14)";
ctx.fill();
ctx.strokeStyle=z.color;
ctx.lineWidth=2;

ctx.stroke();
ctx.font="bold 11px Georgia";
ctx.textAlign="center";
ctx.fillStyle=z.color;
ctx.fillText(z.kind==="haste"?"⏳ Vùng Gia Tốc (+38%)" :"❄️ Vùng Trì Hoãn",sx,sy - z.radius + 16);
ctx.restore();
}
if (this.activeMechanic.hazardType==="reverse_flow_river"&& !this.mechanicCompleted) {
ctx.save();
ctx.strokeStyle="rgba(76, 230, 255, 0.25)";
ctx.lineWidth=2;
for (let row=0;row<5;row++) {
const yy=120 + row*120;
const offset=(t*120) % 160;
for (let xx=160 - offset;xx<(camera?camera.width :1280);xx +=160) {
ctx.beginPath();
ctx.moveTo(xx + 40,yy);
ctx.lineTo(xx,yy);
ctx.lineTo(xx + 10,yy - 6);
ctx.moveTo(xx,yy);
ctx.lineTo(xx + 10,yy + 6);
ctx.stroke();
}
}
ctx.restore();
}
if (this.hazardTelegraphTimer>0) {
ctx.save();
ctx.fillStyle=`rgba(255, 87, 51, ${0.12 + Math.abs(Math.sin(t*4))*0.14})`;
ctx.fillRect(0,0,camera?camera.width :1280,camera?camera.height :720);
ctx.restore();
}
if (this.defenseCore) {
const c=this.defenseCore;
const sx=Math.round(c.x - camX);
const sy=Math.round(c.y - camY);
ctx.save();
ctx.translate(sx,sy);
ctx.beginPath();
ctx.arc(0,0,130,0,Math.PI*2);
ctx.fillStyle="rgba(90, 169, 230, 0.10)";
ctx.fill();
ctx.strokeStyle=c.color;
ctx.lineWidth=2;

ctx.stroke();

ctx.beginPath();
ctx.arc(0,0,c.radius,0,Math.PI*2);
ctx.fillStyle="#101c28";
ctx.fill();
ctx.strokeStyle="#ffd700";
ctx.lineWidth=3;
ctx.stroke();
ctx.font="28px sans-serif";
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillText(c.icon,0,0);
const pct=Math.max(0,Math.min(1,c.hp / Math.max(1,c.maxHp)));
ctx.fillStyle="#080b10";
ctx.fillRect(-52,-c.radius - 16,104,8);
ctx.fillStyle=pct>0.5?"#5cc995" :"#ff5252";
ctx.fillRect(-52,-c.radius - 16,104*pct,8);
ctx.strokeStyle="#ffd700";
ctx.lineWidth=1;
ctx.strokeRect(-52,-c.radius - 16,104,8);
ctx.font="bold 12px Georgia";
ctx.fillStyle="#ffd700";
ctx.fillText(`${c.name} (${Math.ceil(pct*100)}%)`,0,-c.radius - 24);
ctx.restore();
}
for (const p of this.props) {
const sx=Math.round(p.x - camX);
const sy=Math.round(p.y - camY);
ctx.save();
ctx.translate(sx,sy);
if (p.isSafeZone&&(p.activated||p.hazardType==="sand_firestorm")) {
ctx.beginPath();
ctx.arc(0,0,128,0,Math.PI*2);
ctx.fillStyle=p.hazardType==="sand_firestorm"?"rgba(76, 230, 255, 0.14)" :"rgba(92, 201, 149, 0.15)";
ctx.fill();
ctx.strokeStyle=p.color;
ctx.lineWidth=2;

ctx.stroke();

}
ctx.beginPath();
ctx.arc(0,0,p.radius + (p.activated?0 :Math.sin(t*2.5)*4),0,Math.PI*2);
ctx.fillStyle=p.activated?"rgba(60, 166, 125, 0.25)" :"rgba(255, 215, 0, 0.18)";
ctx.fill();
ctx.lineWidth=2.5;
ctx.strokeStyle=p.activated?"#5cc995" :p.color;
ctx.stroke();
ctx.font="22px sans-serif";
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillText(p.activated?"✅" :p.icon,0,0);
ctx.font="bold 11px Georgia";
ctx.fillStyle=p.activated?"#7ef7c4" :"#ffd700";
ctx.fillText(p.activated?`${p.name} [Xong]` :`${p.name} [E]`,0,-p.radius - 10);
ctx.restore();
}
const pl=this.game&&this.game.player;
if (pl&& !this.mechanicCompleted) {
let targetPt=null;
let bestD=Infinity;
for (let i=0;i<this.props.length;i++) {
const pr=this.props[i];
if (pr.activated) continue;
const d=Math.hypot(pr.x - pl.x,pr.y - pl.y);
if (d<bestD) {bestD=d;targetPt=pr;}
}
if (!targetPt&&this.defenseCore) {
const d=Math.hypot(this.defenseCore.x - pl.x,this.defenseCore.y - pl.y);
if (d>160) {bestD=d;targetPt=this.defenseCore;}
}
if (targetPt&&bestD>110) {
const ang=Math.atan2(targetPt.y - pl.y,targetPt.x - pl.x);
const ax=(pl.x - camX) + Math.cos(ang)*44;
const ay=(pl.y - camY) + Math.sin(ang)*44;
ctx.save();
ctx.translate(ax,ay);
ctx.rotate(ang);
ctx.fillStyle="#ffd700";
ctx.strokeStyle="#000000";
ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(10,0);
ctx.lineTo(-6,-6);
ctx.lineTo(-3,0);
ctx.lineTo(-6,6);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.restore();
}
}
}
}
StageManager.STAGE_MECHANICS=STAGE_MECHANICS;
global.StageManager=StageManager;
})(window);
