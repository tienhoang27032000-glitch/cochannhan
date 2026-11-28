(function (global) {
"use strict";
const SECRET_REALM_EXPEDITIONS=[
{
id:"exp_thanh_mao_grotto",
name:"Bí Cảnh: Hang Động Hoa Tửu Ngầm",
icon:"🍶",
region:"nam_cuong",
reqRank:1,
mentalCost:20,
desc:"Khe núi ẩn giấu sau thác nước Thanh Mao Sơn — ẩn chứa Dã Cổ hiếm, cổ tài và cơ duyên Tửu Trùng!",
outcomes:[
{weight:40,type:"stones",amount:55,text:"Phát hiện hòm Nguyên Thạch cổ bị lãng quên! Thu về 💎 +55 Nguyên Thạch & +15 Danh Vọng Nam Cương."},
{weight:30,type:"item",itemId:"remnant_recipe",count:1,text:"Tìm thấy một cuộn da thú rách nát ghi Cổ Phương Hợp Luyện! (+1 📜 Cổ Phương Tàn Quyển)."},
{weight:20,type:"wild_gu",rank:1,text:"Gặp một con Dã Cổ đang ngủ say bên suối rượu! Đã nhanh tay thu phục vào Kho Cổ!"},
{weight:10,type:"trap",hpLossPct:0.15,stones:85,text:"Kích hoạt bẫy độc cổ xưa (-15% HP), nhưng bù lại phá rương thu được 💎 +85 Nguyên Thạch!"}
]
},
{
id:"exp_lac_phach_valley",
name:"Bí Cảnh: Lạc Phách Cốc — Mê Cung Hồn Phong",
icon:"🌪️",
region:"bac_nguyen",
reqRank:3,
mentalCost:38,
desc:"Một trong Tam Đại Bí Cảnh Thiên Địa! Gió Lạc Phách mài giũa hồn phách, ẩn giấu Đãng Hồn Thạch và cơ duyên Linh Cổ.",
outcomes:[
{weight:35,type:"item",itemId:"soul_crystal",count:2,text:"Giữa cơn gió Lạc Phách thu được 2x 🔮 Đãng Hồn Thạch Đan và +20 Nhân Khí!"},
{weight:30,type:"stones",amount:240,text:"Tìm thấy hài cốt Cổ Sư Tứ Chuyển để lại 💎 +240 Nguyên Thạch & +35 Danh Vọng Bắc Nguyên!"},
{weight:20,type:"wild_gu",rank:3,text:"Trấn áp thành công một con Linh Cổ Tam Chuyển hoang dã giữa sương mù Lạc Phách!"},
{weight:15,type:"dao_exp",path:"Hồn Đạo",amount:35,text:"Tâm thần chịu mài giũa bởi Lạc Phách Phong — Cảnh giới Hồn Đạo đại tiến (+35 Lĩnh Ngộ / Đạo Ngân)!"}
]
},
{
id:"exp_sinh_tu_mon",
name:"Bí Cảnh: Ngoại Vi Sinh Tử Môn",
icon:"⛩️",
region:"trung_chau",
reqRank:6,
mentalCost:65,
desc:"Cánh cửa thông tới đất chết trong Nhân Tổ Truyện! Đầy rẫy hồn thú nhưng ẩn chứa Tiên Nguyên Thạch và Đạo Ngân Thượng Cổ.",
outcomes:[
{weight:40,type:"immortal_stones",count:3,text:"Đoạt được 3 viên 🌟 Tiên Nguyên Thạch giữa khe nứt Sinh Tử Môn & +55 Danh Vọng Trung Châu!"},
{weight:30,type:"dao_exp",path:"Hồn Đạo",amount:1200,text:"Hấp thu tinh hoa hồn khí thượng cổ: +1.200 Đạo Ngân Hồn Đạo & +45 Nhân Khí!"},
{weight:20,type:"item",itemId:"soul_crystal",count:4,text:"Thu hoạch 4x 🔮 Đãng Hồn Thạch Đan thượng phẩm!"},
{weight:10,type:"trap",hpLossPct:0.20,immStones:5,text:"Bị Hồn Thú Thái Cổ tập kích (-20% HP), nhưng cướp được 🌟 +5 Tiên Nguyên Thạch!"}
]
},
{
id:"exp_chaos_rift",
name:"Bí Cảnh: Khe Nứt Hỗn Độn Thiên Ngoại",
icon:"🌌",
region:"dong_hai",
reqRank:8,
mentalCost:95,
desc:"Vết rách không gian nối tới Hỗn Độn ngoài Giới Bích — chỉ Bát Chuyển / Á Tiên Tôn mới dám bước vào tìm cơ duyên Thành Tôn!",
outcomes:[
{weight:40,type:"dao_main",amount:8500,text:"Lĩnh hội một tia Hỗn Độn Đạo Ý! Lưu phái chính tăng vọt +8.500 Đạo Ngân!"},
{weight:35,type:"immortal_stones",count:8,text:"Nhặt được mảnh vỡ Tiên Cổ Ốc đổi thành 🌟 +8 Tiên Nguyên Thạch & +90 Danh Vọng Đông Hải!"},
{weight:25,type:"human_qi",amount:90,text:"Chứng kiến sinh diệt thiên địa, Nhân Khí tăng mạnh +90 & hồi đầy 100% Tinh Thần!"}
]
}
];
const AUCTION_RIVALS=[
{name:"Thương Yến Phi (Thương Gia Tộc Trưởng)",aggressiveness:0.65},
{name:"Thiết Nhược Nam (Thiết Gia Thần Bộ)",aggressiveness:0.55},
{name:"Hắc Lâu Lan (Bắc Nguyên Minh Chủ)",aggressiveness:0.75},
{name:"Tuyết Hồ Lão Tổ (Bát Chuyển Ma Đạo)",aggressiveness:0.80},
{name:"Phượng Cửu Ca (Trung Châu Đệ Nhất)",aggressiveness:0.70}
];
const LIVE_AUCTION_LOTS=[
{id:"lot_bronze_relic",type:"item",itemId:"bronze_relic_gu",name:"🟢 Thanh Đồng Xá Lợi Cổ (Cực Phẩm)",reqRank:1,startPrice:280,maxRivalBid:650,step:45,currency:"stones",desc:"Lập tức tăng 1 tiểu cảnh giới Nhất Chuyển — đang được các gia tộc tranh giành!"},
{id:"lot_liquor_worm",type:"gu",guId:"tuu_trung_gu",guRank:2,name:"🍶 Tửu Trùng Nhị Chuyển (Quý Hiếm)",reqRank:1,startPrice:360,maxRivalBid:820,step:60,currency:"stones",desc:"Tửu Trùng đã luyện lên Nhị Chuyển, tăng tốc tu luyện & giảm 25% tiêu hao Sát Chiêu!"},
{id:"lot_yinyang_gu",type:"item",itemId:"am_duong_chuyen_than_gu",name:"☯️ Âm Dương Chuyển Thân Cổ (Cứu Thập Tuyệt)",reqRank:1,startPrice:420,maxRivalBid:920,step:70,currency:"stones",desc:"Cổ trùng cứu mệnh hiếm có giúp Thập Tuyệt Thể phong ấn an toàn xuống 90% Giáp Đẳng!"},
{id:"lot_silver_relic",type:"item",itemId:"white_silver_relic_gu",name:"⚪ Bạch Ngân Xá Lợi Cổ",reqRank:3,startPrice:1800,maxRivalBid:4500,step:300,currency:"stones",desc:"Tăng thẳng 1 tiểu cảnh giới Tam Chuyển — giá khởi điểm cực hời so với mua thẳng!"},
{id:"lot_blood_skull",type:"gu",guId:"huyet_lo_gu",guRank:4,name:"💀 Huyết Lô Cổ Tứ Chuyển",reqRank:3,startPrice:2400,maxRivalBid:5600,step:350,currency:"stones",desc:"Linh Cổ Huyết Đạo Tứ Chuyển (Thăng được lên 9 Chuyển), hút 30% máu diện rộng!"},
{id:"lot_purple_relic",type:"item",itemId:"purple_crystal_relic_gu",name:"🟣 Tử Tinh Xá Lợi Cổ (Ngũ Chuyển)",reqRank:5,startPrice:11000,maxRivalBid:26000,step:1500,currency:"stones",desc:"Thần vật phàm trần Ngũ Chuyển tăng thẳng 1 tiểu cảnh giới!"},
{id:"lot_immortal_bundle",type:"item",itemId:"immortal_stone",count:6,name:"🌟 Lô 6 Viên Tiên Nguyên Thạch",reqRank:5,startPrice:9500,maxRivalBid:21000,step:1200,currency:"stones",desc:"Lô Tiên Thạch hiếm gặp từ Bảo Hoàng Thiên đưa xuống sàn đấu giá!"},
{id:"lot_fixed_immortal",type:"gu",guId:"dinh_tien_du_gu",guRank:6,name:"🦋 Định Tiên Du Lục Chuyển (Tiên Cổ)",reqRank:6,startPrice:220,maxRivalBid:520,step:35,currency:"immortal",desc:"Tiên Cổ Không Gian Đạo duy nhất — đấu giá trực tiếp bằng Tiên Nguyên Thạch!"}
,
{id:"lot_kim_long",type:"gu",guId:"kim_long_gu",guRank:3,name:"🐉 Kim Long Cổ Tam Chuyển (Linh Cổ)",reqRank:2,startPrice:1450,maxRivalBid:3400,step:220,currency:"stones",desc:"Linh cổ Kim Đạo Tam Chuyển (1–9 Chuyển), phóng Kim Long hư ảnh xuyên phá mọi giáp!"},
{id:"lot_hoa_phuong",type:"gu",guId:"hoa_phuong_gu",guRank:4,name:"🔥 Hỏa Phượng Cổ Tứ Chuyển (Linh Cổ)",reqRank:3,startPrice:2600,maxRivalBid:5800,step:350,currency:"stones",desc:"Linh cổ Viêm Đạo Tứ Chuyển (1–9 Chuyển), gọi Phượng Hoàng Lửa giáng thiên thạch!"},
{id:"lot_kiem_don",type:"gu",guId:"kiem_don_tien_gu",guRank:7,name:"⚡ Kiếm Độn Tiên Cổ Thất Chuyển (Tiên Cổ)",reqRank:6,startPrice:850,maxRivalBid:2100,step:120,currency:"immortal",desc:"Tiên Cổ thân pháp Kiếm Đạo danh chấn Ngũ Vực của Kiếm Tiên Bạc Thanh!"},
{id:"lot_tuc_menh",type:"gu",guId:"tuc_menh_tan_phien_gu",guRank:9,name:"☀️ Túc Mệnh Tàn Phiến Tiên Cổ Cửu Chuyển",reqRank:8,startPrice:12000,maxRivalBid:28000,step:1500,currency:"immortal",desc:"Mảnh tàn phiến Túc Mệnh Cổ Cửu Chuyển — bảo vật nghịch thiên hiếm có nhất sàn đấu giá!"}
];
const TRIBULATION_WAVES=[
{
name:"Đợt 1/3: Kiếp Vân Áp Đỉnh — Cửu Thiên Lôi Xà",
desc:"Hàng trăm tia lôi đình màu tím đánh thẳng xuống trung tâm Phúc Địa! Hãy chọn đối sách:",
choices:[
{id:"shield",label:"🛡️ Dựng Hộ Thuẫn Đạo Ngân (An toàn: +18% Ổn Định, ít tốn HP)",integrityDelta:18,hpPctCost:0.08,bonusDaoPct:0.05},
{id:"counter",label:"⚔️ Phóng Sát Chiêu Nghênh Địch (Cân bằng: +25% Ổn Định, +15% Đạo Ngân)",integrityDelta:25,hpPctCost:0.14,bonusDaoPct:0.15},
{id:"absorb",label:"🔥 Luyện Hóa Kiếp Lôi Vào Thân (Mạo hiểm: +30% Đạo Ngân, tốn 22% HP)",integrityDelta:12,hpPctCost:0.22,bonusDaoPct:0.30}
]
},
{
name:"Đợt 2/3: Địa Tai Dâng Trào — Hư Không Liệt Phùng",
desc:"Mặt đất Phúc Địa rung chuyển, địa hỏa và khí độc trào lên ăn mòn linh mạch!",
choices:[
{id:"stabilize",label:"☯️ Điều Hòa Thiên Địa Nhị Khí (+24% Ổn Định, tốn 10% HP)",integrityDelta:24,hpPctCost:0.10,bonusDaoPct:0.10},
{id:"human_qi",label:"🌟 Dẫn Nhân Khí Trấn Áp (+32% Ổn Định, +20% Đạo Ngân, -20 Nhân Khí)",integrityDelta:32,hpPctCost:0.06,humanQiCost:20,bonusDaoPct:0.20},
{id:"greed",label:"💎 Nuốt Chửng Hư Không Khoáng Mạch (+2 Tiên Thạch & +25% Đạo Ngân, tốn 20% HP)",integrityDelta:10,hpPctCost:0.20,bonusImmStones:2,bonusDaoPct:0.25}
]
},
{
name:"Đợt 3/3: Chung Cực Thiên Kiếp — Hỗn Độn Thiên Phạt",
desc:"Đòn đánh cuối cùng của Ý Trời giáng xuống! Chống đỡ thành công sẽ khắc sâu Đạo Ngân và mở rộng Tiên Khiếu!",
choices:[
{id:"vital_gu",label:"🪲 Thúc Giục Cổ Bản Mệnh Hộ Đạo (+28% Ổn Định, +15% Đạo Ngân)",integrityDelta:28,hpPctCost:0.10,bonusDaoPct:0.15},
{id:"all_out",label:"⚡ Toàn Lực Phản Kích Đánh Tan Kiếp Vân (+35% Đạo Ngân & +200 mẫu, tốn 22% HP)",integrityDelta:18,hpPctCost:0.22,bonusAcres:200,bonusDaoPct:0.35},
{id:"defend_all",label:"🏛️ Thu Hẹp Kết Giới Bảo Toàn Linh Mạch (+35% Ổn Định, tốn 5% HP)",integrityDelta:35,hpPctCost:0.05,bonusDaoPct:0.05}
]
}
];
class EventManager {
constructor(gameEngine) {
this.game=gameEngine||null;
this.activeBattleEvent=null;
this.battleEventCooldown=18;
this.liveAuction=null;
this.activeTribulation=null;
}
resetBattleEvents() {
this.activeBattleEvent=null;
this.battleEventCooldown=16;
}
updateBattleEvents(dt,stage,player,mapManager,enemies,combatSystem) {
if (!stage|| !player||player.hp<=0) return;
if (this.activeBattleEvent) {
this.activeBattleEvent.timer -=dt;
if (this.activeBattleEvent.timer<=0) {
const expired=this.activeBattleEvent;
this.activeBattleEvent=null;
this.battleEventCooldown=26;
if (this.game&&this.game.ui) {
this.game.ui.addLog(`⏳ Cơ duyên 【${expired.name}】 đã biến mất vào hư không!`,"system");
}
}
return;
}
this.battleEventCooldown -=dt;
if (this.battleEventCooldown<=0) {
this.battleEventCooldown=32;
this._spawnRandomBattleEvent(stage,player,mapManager,combatSystem);
}
}
_spawnRandomBattleEvent(stage,player,mapManager,combatSystem) {
const pt=mapManager
?mapManager.getRandomWalkablePoint(player.x,player.y,170,440)
:{x:player.x + 220,y:player.y - 120};
const pool=[
{
type:"wild_gu_anomaly",
icon:"🦋",
name:"Cơ Duyên: Dã Cổ Quý Hiếm Xuất Hiện",
color:"#7ef7f0",
duration:28,
hint:"Lại gần bấm [E] / 🤝 để thu phục ngay Dã Cổ đúng bậc Chuyển!"
},
{
type:"merchant_distress",
icon:"🐪",
name:"Biến Cố: Thương Nhân Ngũ Vực Cầu Cứu",
color:"#ffd700",
duration:30,
hint:"Lại gần bấm [E] / 🤝 để giải cứu nhận Nguyên Thạch & +25 Danh Vọng khu vực!"
},
{
type:"qi_surge",
icon:"✨",
name:"Thiên Tượng: Mạch Linh Khí Bộc Phát",
color:"#5cc995",
duration:24,
hint:"Chạm [E] / 🤝 vào Mạch Linh Khí để hồi 100% Chân Nguyên (hoặc +3 Tiên Nguyên) & 30% HP!"
},
{
type:"ruin_rift",
icon:"🗿",
name:"Kỳ Ngộ: Bia Di Tích Cổ Xưa Hiện Hình",
color:"#c278ff",
duration:30,
hint:"Chạm [E] / 🤝 để giải mã Cổ Bia — nhận Tàn Phương / Nhân Khí & Danh Vọng!"
}
];
const pick=pool[Math.floor(Math.random()*pool.length)];
this.activeBattleEvent={
id:`evt_${Date.now()}`,
...pick,
x:pt.x,
y:pt.y,
radius:26,
timer:pick.duration,
maxTimer:pick.duration,
stageRank:stage.reqRank||1
};
if (combatSystem) {
combatSystem.spawnFloatingText(pt.x,pt.y - 30,`${pick.icon} ${pick.name}!`,pick.color);
}
if (this.game&&this.game.ui) {
this.game.ui.addLog(`🌟 [SỰ KIỆN GIỮA TRẬN] ${pick.icon} ${pick.name}! ${pick.hint} (Còn ${pick.duration}s)`,"loot");
}
}
getNearestBattleEvent(px,py,maxDist=64) {
if (!this.activeBattleEvent) return null;
const d=Math.hypot(this.activeBattleEvent.x - px,this.activeBattleEvent.y - py);
return d<=maxDist?this.activeBattleEvent :null;
}
interactWithBattleEvent(player,aperture,guSystem,combatSystem) {
const ev=this.activeBattleEvent;
if (!ev|| !player) return {success:false};
this.activeBattleEvent=null;
this.battleEventCooldown=30;
const rank=ev.stageRank||1;
const regionKey=this._regionNameToKey(this.game&&this.game.activeStage?this.game.activeStage.regionName :"Nam Cương");
let msg="";
if (ev.type==="wild_gu_anomaly"&&guSystem) {
const cap=guSystem.attemptCaptureWildGu(player,rank);
msg=`🦋 [Cơ Duyên Giữa Trận] ${cap.message}`;
} else if (ev.type==="merchant_distress") {
const stones=Math.max(25,rank*35);
player.primevalStones +=stones;
if (this.game&&this.game.questManager) {
this.game.questManager.addReputation(regionKey,25);
}
msg=`🐪 [Cứu Thương Nhân] Thương nhân cảm kích tặng 💎 +${stones} Nguyên Thạch & +25 Danh Vọng khu vực!`;
} else if (ev.type==="qi_surge") {
if (aperture&& !aperture.isImmortal) {
aperture.currentEssence=aperture.aptitude.maxSeaPercent;
} else if (aperture) {
aperture.immortalEssence[aperture.rank]=Number(((aperture.immortalEssence[aperture.rank]||0) + 3).toFixed(2));
}
const healed=player.heal(Math.round(player.maxHp*0.30));
msg=`✨ [Mạch Linh Khí] Hấp thu linh khí thiên địa: Hồi phục Chân/Tiên Nguyên & +${healed} HP!`;
} else if (ev.type==="ruin_rift") {
player.addItem("remnant_recipe",1);
if (aperture) aperture.humanQi +=Math.max(5,rank*3);
if (this.game&&this.game.questManager) {
this.game.questManager.addReputation(regionKey,20);
}
msg=`🗿 [Bia Di Tích Cổ] Giải mã văn bia cổ thu được 1x 📜 Cổ Phương Tàn Quyển, +${Math.max(5,rank*3)} Nhân Khí & +20 Danh Vọng!`;
}
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("battle_event",ev.type,1);
}
if (combatSystem) {
combatSystem.spawnFloatingText(ev.x,ev.y - 24,`${ev.icon} Hoàn Thành Cơ Duyên!`,ev.color);
}
if (this.game&&this.game.ui&&msg) {
this.game.ui.addLog(msg,"loot");
}
return {success:true,message:msg};
}
_regionNameToKey(rName) {
const s=String(rName||"").toLowerCase();
if (s.includes("bắc nguyên")) return "bac_nguyen";
if (s.includes("trung châu")||s.includes("thiên đình")) return "trung_chau";
if (s.includes("đông hải")) return "dong_hai";
if (s.includes("tây mạc")) return "tay_mac";
return "nam_cuong";
}
renderBattleEvents(ctx,camera) {
const ev=this.activeBattleEvent;
if (!ev|| !ctx) return;
const camX=camera?camera.x :0;
const camY=camera?camera.y :0;
const sx=Math.round(ev.x - camX);
const sy=Math.round(ev.y - camY);
const t=performance.now()*0.005;
ctx.save();
ctx.translate(sx,sy);
ctx.beginPath();
ctx.arc(0,0,ev.radius + 8 + Math.sin(t*2)*4,0,Math.PI*2);
ctx.fillStyle="rgba(255, 215, 0, 0.16)";
ctx.fill();
ctx.lineWidth=2.5;
ctx.strokeStyle=ev.color;

ctx.stroke();

ctx.beginPath();
ctx.arc(0,0,ev.radius - 4,0,Math.PI*2);
ctx.fillStyle="rgba(12, 18, 26, 0.88)";
ctx.fill();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=1.5;
ctx.stroke();
ctx.font="20px sans-serif";
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillText(ev.icon,0,0);
ctx.font="bold 11px Georgia";
ctx.fillStyle=ev.color;
ctx.fillText(`${ev.name} (${Math.ceil(ev.timer)}s)`,0,-ev.radius - 12);
ctx.restore();
}
startLiveAuction() {
const ap=this.game&&this.game.aperture;
const rank=ap?ap.rank :1;
const eligible=LIVE_AUCTION_LOTS.filter(l=>l.reqRank<=Math.max(1,rank + 1));
const lot=eligible[Math.floor(Math.random()*eligible.length)]||LIVE_AUCTION_LOTS[0];
const rival=AUCTION_RIVALS[Math.floor(Math.random()*AUCTION_RIVALS.length)];
this.liveAuction={
lot:lot,
rival:rival,
currentBid:lot.startPrice,
highestBidder:"Khởi điểm",
round:1,
maxRounds:5,
finished:false,
won:false,
log:[`🔨 Đấu Giá Sư gõ búa mở màn: 【${lot.name}】 — Giá khởi điểm: ${lot.startPrice.toLocaleString("vi-VN")} ${lot.currency==="immortal"?"🌟 Tiên Thạch" :"💎 Nguyên Thạch"}! Đối thủ cạnh tranh: ${rival.name}.`]
};
return this.liveAuction;
}
placeAuctionBid(raiseMultiplier=1) {
const a=this.liveAuction;
const pl=this.game&&this.game.player;
if (!a||a.finished|| !pl) return {success:false,message:"Phiên đấu giá đã kết thúc."};
const increment=a.lot.step*raiseMultiplier;
const nextBid=a.highestBidder==="Khởi điểm"?a.currentBid :(a.currentBid + increment);
const isImm=a.lot.currency==="immortal";
const playerBal=isImm?(pl.immortalStones||0) :(pl.primevalStones||0);
if (playerBal<nextBid) {
return {
success:false,
message:`Không đủ ${isImm?"🌟 Tiên Thạch" :"💎 Nguyên Thạch"} để ra giá ${nextBid.toLocaleString("vi-VN")}!`
};
}
a.currentBid=nextBid;
a.highestBidder=pl.name;
a.log.push(`🙋 Ngươi ra giá ${nextBid.toLocaleString("vi-VN")} ${isImm?"🌟" :"💎"}!`);
const canRivalOutbid=(a.currentBid + a.lot.step)<=a.lot.maxRivalBid&&a.round<a.maxRounds;
const rivalWants=canRivalOutbid&&(Math.random()<a.rival.aggressiveness);
if (rivalWants) {
a.round +=1;
a.currentBid +=a.lot.step;
a.highestBidder=a.rival.name;
a.log.push(`🔥 ${a.rival.name} không chịu thua, nâng giá lên ${a.currentBid.toLocaleString("vi-VN")} ${isImm?"🌟" :"💎"}! (Hiệp ${a.round}/${a.maxRounds})`);
return {success:true,state:a};
}
return this._finalizeAuctionWin();
}
_finalizeAuctionWin() {
const a=this.liveAuction;
const pl=this.game&&this.game.player;
const gs=this.game&&this.game.guSystem;
if (!a|| !pl) return {success:false};
a.finished=true;
a.won=true;
const isImm=a.lot.currency==="immortal";
if (isImm) pl.removeItem("immortal_stone",a.currentBid);
else pl.primevalStones -=a.currentBid;
if (a.lot.type==="gu"&&gs) {
const added=gs.addGuToStorage(a.lot.guId,{
rank:a.lot.guRank||1,
isRefined:false,
refinementProgress:0
});
if (!added) {
pl.addItem("immortal_stone",10);
a.log.push("🏆 ĐÃ CHỐT BÚA! Vì ngươi đã sở hữu Tiên Cổ duy nhất này, đấu giá trường bồi hoàn 🌟 +10 Tiên Thạch!");
} else {
a.log.push(`🏆 ĐÃ CHỐT BÚA! Chúc mừng đạo hữu đấu thắng 【${a.lot.name}】 với giá ${a.currentBid.toLocaleString("vi-VN")} ${isImm?"🌟" :"💎"}!`);
}
} else if (a.lot.type==="item") {
pl.addItem(a.lot.itemId,a.lot.count||1);
a.log.push(`🏆 ĐÃ CHỐT BÚA! Thu về 【${a.lot.name}】 với giá ${a.currentBid.toLocaleString("vi-VN")} ${isImm?"🌟" :"💎"}!`);
}
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("auction_win",a.lot.id,1);
this.game.questManager.addReputation("nam_cuong",20);
}
if (this.game) this.game.autoSaveNow("auction_win");
return {success:true,won:true,state:a};
}
passAuctionRound() {
const a=this.liveAuction;
if (!a||a.finished) return;
a.finished=true;
a.won=false;
a.log.push(`🚪 Ngươi rút lui khỏi phiên đấu giá. 【${a.lot.name}】 thuộc về ${a.rival.name}.`);
}
startTribulationTrial() {
const ap=this.game&&this.game.aperture;
const pl=this.game&&this.game.player;
if (!ap|| !ap.isImmortal) {
return {success:false,message:"Chỉ Cổ Tiên (Lục Chuyển trở lên) mới có thể khởi phát Thử Thách Thiên Kiếp Tương Tác!"};
}
const req=ap.getManualTribulationRequirements();
const curEss=ap.immortalEssence[ap.rank]||0;
if (curEss<req.essenceCost) {
return {success:false,message:`Không đủ Tiên Nguyên (Cần ${req.essenceCost} viên, hiện có ${curEss.toFixed(1)} viên)!`};
}
if (ap.humanQi<req.humanQiCost) {
return {success:false,message:`Không đủ Nhân Khí (Cần ${req.humanQiCost}, hiện có ${Math.floor(ap.humanQi)})!`};
}
if (pl&&pl.mental<req.mentalCost) {
return {success:false,message:`Tinh Thần Lực chưa đủ (${Math.floor(pl.mental)}/${req.mentalCost})!`};
}
this.activeTribulation={
waveIndex:0,
totalWaves:TRIBULATION_WAVES.length,
integrity:55,
bonusDaoPct:0,
bonusAcres:0,
bonusImmStones:0,
tribulationName:req.tribulationName,
logs:[`⛈️ Kiếp Vân tụ hội trên bầu trời Tiên Khiếu! Chuẩn bị đối mặt 3 đợt 【${req.tribulationName}】!`]
};
return {success:true,trial:this.activeTribulation,wave:TRIBULATION_WAVES[0]};
}
chooseTribulationAction(choiceId) {
const tr=this.activeTribulation;
const pl=this.game&&this.game.player;
const ap=this.game&&this.game.aperture;
if (!tr|| !pl|| !ap) return {success:false,message:"Không có phiên Thiên Kiếp đang diễn ra."};
const wave=TRIBULATION_WAVES[tr.waveIndex];
const choice=wave&&wave.choices.find(c=>c.id===choiceId);
if (!choice) return {success:false,message:"Đối sách không hợp lệ."};
if (choice.humanQiCost&&ap.humanQi<choice.humanQiCost) {
return {success:false,message:`Không đủ Nhân Khí dự trữ (cần thêm ${choice.humanQiCost})!`};
}
if (choice.humanQiCost) ap.humanQi -=choice.humanQiCost;
const hpLoss=Math.round(pl.maxHp*(choice.hpPctCost||0.10));
pl.hp=Math.max(1,pl.hp - hpLoss);
tr.integrity=Math.min(100,Math.max(10,tr.integrity + (choice.integrityDelta||15)));
tr.bonusDaoPct +=choice.bonusDaoPct||0;
tr.bonusAcres +=choice.bonusAcres||0;
tr.bonusImmStones +=choice.bonusImmStones||0;
tr.logs.push(`⚡ [Đợt ${tr.waveIndex + 1}/3] Chọn: ${choice.label} (-${hpLoss} HP | Độ Ổn Định: ${tr.integrity}%).`);
tr.waveIndex +=1;
if (tr.waveIndex<tr.totalWaves) {
return {success:true,finished:false,trial:tr,nextWave:TRIBULATION_WAVES[tr.waveIndex]};
}
const baseRes=ap._triggerApertureCalamity(pl,true);
const bonusDao=Math.round((ap.rank>=8?5000 :(ap.rank===7?1500 :400))*tr.bonusDaoPct);
if (baseRes&&baseRes.success) {
if (bonusDao>0&&typeof pl.addDaoMarksFromTribulation==="function") {
pl.addDaoMarksFromTribulation(bonusDao,0.85);
}
if (tr.bonusAcres>0&&ap.immortalAperture) {
ap.immortalAperture.spaceAcres +=tr.bonusAcres;
}
if (tr.bonusImmStones>0) {
pl.addItem("immortal_stone",tr.bonusImmStones);
}
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("tribulation_trial",tr.tribulationName,1);
}
if (this.game) this.game.autoSaveNow("tribulation_trial");
}
const finalSummary=baseRes&&baseRes.success
?`${baseRes.message} | 🎖️ Thưởng Chiến Thuật Thiên Kiếp (Ổn Định ${tr.integrity}%): +${bonusDao.toLocaleString("vi-VN")} Đạo Ngân phụ trợ${tr.bonusAcres?`, +${tr.bonusAcres} mẫu` :""}${tr.bonusImmStones?`, +${tr.bonusImmStones}🌟 Tiên Thạch` :""}!`
:(baseRes?baseRes.message :"Độ Kiếp thất bại!");
this.activeTribulation=null;
return {success:Boolean(baseRes&&baseRes.success),finished:true,message:finalSummary};
}
exploreSecretRealm(expId) {
const exp=SECRET_REALM_EXPEDITIONS.find(e=>e.id===expId);
const pl=this.game&&this.game.player;
const ap=this.game&&this.game.aperture;
const gs=this.game&&this.game.guSystem;
if (!exp|| !pl|| !ap) return {success:false,message:"Bí cảnh không tồn tại."};
if (ap.rank<exp.reqRank) {
return {success:false,message:`Cần đạt ${exp.reqRank} Chuyển mới đủ thực lực thám hiểm 【${exp.name}】!`};
}
if (pl.mental<exp.mentalCost) {
return {success:false,message:`Không đủ Tinh Thần Lực (${Math.floor(pl.mental)}/${exp.mentalCost})!`};
}
pl.mental=Math.max(0,pl.mental - exp.mentalCost);
const totalW=exp.outcomes.reduce((s,o)=>s + o.weight,0);
let roll=Math.random()*totalW;
let chosen=exp.outcomes[0];
for (const o of exp.outcomes) {
if (roll<o.weight) {chosen=o;break;}
roll -=o.weight;
}
if (chosen.type==="stones") {
pl.primevalStones +=chosen.amount;
} else if (chosen.type==="item") {
pl.addItem(chosen.itemId,chosen.count||1);
ap.humanQi +=20;
} else if (chosen.type==="wild_gu"&&gs) {
gs.attemptCaptureWildGu(pl,chosen.rank||ap.rank);
} else if (chosen.type==="trap") {
pl.hp=Math.max(1,pl.hp - Math.round(pl.maxHp*(chosen.hpLossPct||0.15)));
if (chosen.stones) pl.primevalStones +=chosen.stones;
if (chosen.immStones) pl.addItem("immortal_stone",chosen.immStones);
} else if (chosen.type==="immortal_stones") {
pl.addItem("immortal_stone",chosen.count||1);
} else if (chosen.type==="dao_exp") {
pl.addPathAttainmentExp(chosen.path,chosen.amount);
if (ap.isImmortal) pl.addDaoMarks(chosen.path,chosen.amount);
ap.humanQi +=25;
} else if (chosen.type==="dao_main") {
if (ap.isImmortal) pl.addDaoMarks(pl.mainPath,chosen.amount);
else pl.addPathAttainmentExp(pl.mainPath,chosen.amount);
} else if (chosen.type==="human_qi") {
ap.humanQi +=chosen.amount;
pl.mental=pl.maxMental;
}
if (this.game&&this.game.questManager) {
this.game.questManager.addReputation(exp.region,25);
this.game.questManager.recordEvent("secret_realm",exp.id,1);
this.game.questManager.recordEvent("battle_event",exp.id,1);
}
if (this.game) this.game.autoSaveNow("explore_secret_realm");
return {
success:true,
message:`🌌 [${exp.name}] ${chosen.text}`
};
}
}
EventManager.SECRET_REALM_EXPEDITIONS=SECRET_REALM_EXPEDITIONS;
EventManager.LIVE_AUCTION_LOTS=LIVE_AUCTION_LOTS;
EventManager.TRIBULATION_WAVES=TRIBULATION_WAVES;
global.EventManager=EventManager;
})(window);
