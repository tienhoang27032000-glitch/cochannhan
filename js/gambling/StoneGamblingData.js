(function (global) {
"use strict";

const STONE_TIERS=[
{
id:"black_basalt",
name:"Hắc Nham Phàm Thạch",
badge:"Phàm Thạch",
color:"#95a5a6",
shellA:"#4a4f54",shellB:"#26292e",veinCol:"#6b737a",
price:40,
currency:"stones",
reqRank:1,
weights:{dud:30,stones:28,material:20,gu:20,jackpot:2},
guRankRange:[1,2],
stoneReturn:[45,110],
desc:"Đá núi Thanh Mao phổ thông, vỏ đen thô ráp. Giá rẻ thích hợp luyện mắt soi đá, thi thoảng ẩn giấu Phàm Cổ Nhất–Nhị Chuyển."
},
{
id:"bronze_fossil",
name:"Thanh Đồng Hóa Thạch",
badge:"Trung Phẩm",
color:"#5cc995",
shellA:"#4d6358",shellB:"#1f2e28",veinCol:"#7ef7c4",
price:135,
currency:"stones",
reqRank:1,
weights:{dud:26,stones:22,material:20,gu:26,jackpot:6},
guRankRange:[1,3],
stoneReturn:[160,360],
desc:"Hóa thạch phủ rêu đồng cổ đại Nam Cương. Thường chứa Cổ Phương Tàn Quyển, Nô Thú Cổ hoặc Phàm Cổ Nhị–Tam Chuyển."
},
{
id:"white_jade_ore",
name:"Bạch Ngọc Linh Thạch",
badge:"Thượng Phẩm",
color:"#7ef7f0",
shellA:"#7c8f99",shellB:"#32414a",veinCol:"#bff0ff",
price:380,
currency:"stones",
reqRank:2,
weights:{dud:22,stones:20,material:20,gu:28,jackpot:10},
guRankRange:[2,4],
stoneReturn:[440,980],
desc:"Linh thạch trắng mịn khai thác từ cổ mạch Thương Gia Thành. Xác suất cao mở ra Xá Lợi Cổ, Cổ Phương và Linh Cổ Tam–Tứ Chuyển."
},
{
id:"purple_gold_ore",
name:"Tử Tinh Cổ Khoáng",
badge:"Trân Phẩm",
color:"#c278ff",
shellA:"#5c3b73",shellB:"#221230",veinCol:"#ffd700",
price:980,
currency:"stones",
reqRank:3,
weights:{dud:18,stones:18,material:18,gu:32,jackpot:14},
guRankRange:[3,5],
stoneReturn:[1200,2600],
desc:"Tử Kim Khoáng trứ danh Đổ Thạch Phường! Vết nứt ẩn ánh vàng — từng có người mài ra Khổ Lực Cổ, Toàn Lực Dĩ Phó Cổ và Hoàng Kim Xá Lợi Cổ."
},
{
id:"immemorial_amber",
name:"Thái Cổ Tiên Hóa Thạch",
badge:"Chí Bảo",
color:"#ffd700",
shellA:"#805d1c",shellB:"#2b1c07",veinCol:"#fff5b8",
price:2800,
currency:"stones",
reqRank:5,
weights:{dud:14,stones:18,material:18,gu:34,jackpot:16},
guRankRange:[4,6],
stoneReturn:[3400,7200],
desc:"Mảnh hóa thạch rơi từ Thái Cổ Cửu Thiên. Có cơ hội mài ra Tiên Nguyên Thạch, Linh Cổ Ngũ–Lục Chuyển hoặc thậm chí Tiên Cổ hiếm!"
}
];

const SURFACE_VEINS={
dud:[
"Vỏ đá xám xịt khô khốc, gõ vào vang tiếng đục nặng nề.",
"Bề mặt nhiều vết rỗ vụn, cảm giác nhẹ tay bất thường.",
"Đường vân đứt gãy rời rạc, khó cảm nhận được chút linh khí nào."
],
stones:[
"Vân đá ánh lên vài tia lấp lánh li ti như cát nguyên thạch.",
"Cầm nặng trĩu tay, khe đá hơi mát lạnh như gần nguyên tuyền.",
"Bề mặt mịn màng, góc đá hằn nhẹ đường mạch khoáng ánh lục."
],
material:[
"Khe nứt tỏa hương thảo dược thoang thoảng hòa lẫn mùi khoáng cổ.",
"Vỏ đá có vệt rêu linh khí và dấu vết tinh huyết khô đọng.",
"Cạnh đá vương bụi ngọc mịn, nhiệt độ hơi ấm hơn đá thường."
],
gu:[
"Áp tai vào nghe tiếng rung khe khẽ như có sinh vật đang ngủ say!",
"Vân đá uốn lượn tụ về tâm, khe nứt hắt ra tia cổ quang mờ ảo.",
"Cảm giác ấm nóng nhè nhẹ nơi lòng bàn tay, linh khí hội tụ rõ rệt!"
],
jackpot:[
"Vết nứt lóe tia kim quang rực rỡ, linh khí bên trong chấn động không ngừng!",
"Gõ nhẹ phát âm thanh trong vắt như tiếng ngọc bích, uy áp cổ trùng tràn ra!",
"Toàn khối đá phát nhiệt kỳ dị, mạch vân tạo thành hình trận đồ thiên nhiên!"
]
};

const RECON_GU_IDS=["thien_ly_nhan_gu","trinh_sat_gu","tri_tue_tien_gu","thien_co_tien_gu"];

function getTierById(id) {
return STONE_TIERS.find(t=>t.id===id)||STONE_TIERS[0];
}

function _weightedPick(weights) {
const entries=Object.entries(weights);
const total=entries.reduce((s,[,w])=>s + w,0);
let roll=Math.random()*total;
for (const [k,w] of entries) {
roll -=w;
if (roll<=0) return k;
}
return entries[entries.length - 1][0];
}

function _pickGuReward(minR,maxR,isJackpot,guSystem) {
const db=(global.GuSystem&&global.GuSystem.GU_DATABASE)||{};
const all=Object.values(db);
if (all.length===0) return null;
const targetRank=isJackpot?maxR :(minR + Math.floor(Math.random()*(maxR - minR + 1)));

let pool=all.filter(g=>{
if (targetRank>=6) {
if (g.maxRank<6) return false;
if (guSystem&&typeof guSystem.hasImmortalGu==="function"&&guSystem.hasImmortalGu(g.id)) return false;
return true;
}
return (g.minRank||1)<=targetRank&&(g.maxRank||5)>=targetRank&&g.realmCategory!=="immortal_only";
});
if (pool.length===0) {
pool=all.filter(g=>g.realmCategory!=="immortal_only"&&(g.minRank||1)<=Math.min(5,targetRank));
}
if (pool.length===0) return null;
const picked=pool[Math.floor(Math.random()*pool.length)];
const finalRank=Math.max(picked.minRank||1,Math.min(picked.maxRank||5,targetRank));
return {guId:picked.id,rank:finalRank,name:picked.name,icon:picked.icon||"🪲",path:picked.path||""};
}

function _pickMaterialReward(tier) {
const pools={
black_basalt:["spirit_herb","moon_orchid","bronze_ore","no_le_gu_r1"],
bronze_fossil:["remnant_recipe","wind_essence_crystal","red_iron_ore","no_le_gu_r2","beast_blood_core"],
white_jade_ore:["remnant_recipe","jade_bone","hundred_year_ginseng","no_le_gu_r3","bronze_relic_gu"],
purple_gold_ore:["soul_crystal","hundred_year_ginseng","remnant_recipe","red_iron_relic_gu","white_silver_relic_gu","no_le_gu_r4"],
immemorial_amber:["soul_crystal","immortal_stone","yellow_gold_relic_gu","purple_crystal_relic_gu","no_le_gu_r5"]
};
const list=pools[tier.id]||pools.black_basalt;
const itemId=list[Math.floor(Math.random()*list.length)];
const qty=(itemId==="spirit_herb"||itemId==="moon_orchid"||itemId==="bronze_ore")?(2 + Math.floor(Math.random()*2)) :1;
const db=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
const meta=db[itemId]||{name:itemId,icon:"📦"};
return {itemId,qty,name:meta.name,icon:meta.icon||"📦"};
}

function generateStoneOffer(tier,slotIdx,player,guSystem) {
// Subtle luck influence from player's Vận Đạo marks
const luckMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Vận Đạo") :0;
const luckShift=Math.min(10,Math.floor(luckMarks / 120));
const w={
dud:Math.max(8,tier.weights.dud - luckShift),
stones:tier.weights.stones,
material:tier.weights.material,
gu:tier.weights.gu + Math.floor(luckShift*0.6),
jackpot:tier.weights.jackpot + Math.ceil(luckShift*0.4)
};
const outcomeType=_weightedPick(w);
const [minR,maxR]=tier.guRankRange;
let payload=null;
let auraColor="#7f8c8d";
let rarityLabel="Bùn Chết (Trống Rỗng)";

if (outcomeType==="dud") {
payload={kind:"dud",fallbackStones:Math.max(4,Math.round(tier.price*0.12))};
auraColor="#636e72";
rarityLabel="Đá Rỗng / Bùn Chết";
} else if (outcomeType==="stones") {
const [sMin,sMax]=tier.stoneReturn;
const amt=Math.round(sMin + Math.random()*(sMax - sMin));
payload={kind:"stones",amount:amt};
auraColor="#5cc995";
rarityLabel=`Mạch Nguyên Thạch (+${amt.toLocaleString("vi-VN")}💎)`;
} else if (outcomeType==="material") {
const mat=_pickMaterialReward(tier);
payload={kind:"item",...mat};
auraColor="#4ce6ff";
rarityLabel=`Cổ Tài / Bảo Vật (${mat.qty}x ${mat.name})`;
} else if (outcomeType==="gu") {
const gu=_pickGuReward(minR,maxR,false,guSystem);
if (gu) {
payload={kind:"gu",...gu};
auraColor=gu.rank>=4?"#c278ff" :"#7ef7f0";
rarityLabel=`Cổ Trùng Phong Ấn (${gu.rank} Chuyển)`;
} else {
payload={kind:"stones",amount:Math.round(tier.price*1.6)};
auraColor="#5cc995";
rarityLabel="Nguyên Thạch Tinh Thuần";
}
} else {
// JACKPOT! Rare high-rank Gu OR Relic Gu + Immortal Stones
const rollJ=Math.random();
if (tier.id==="immemorial_amber"&&rollJ<0.40) {
const immCnt=2 + Math.floor(Math.random()*3);
payload={kind:"immortal_stones",amount:immCnt};
auraColor="#ffd700";
rarityLabel=`🌟 KHO TIÊN NGUYÊN THẠCH (+${immCnt}🌟)`;
} else {
const gu=_pickGuReward(maxR,maxR,true,guSystem);
if (gu) {
payload={kind:"gu",...gu,isJackpot:true};
auraColor="#ffd700";
rarityLabel=`👑 ĐẠI THẮNG: CỔ QUÝ ${gu.rank} CHUYỂN!`;
} else {
payload={kind:"stones",amount:Math.round(tier.price*3.0)};
auraColor="#ffd700";
rarityLabel="👑 ĐẠI THẮNG NGUYÊN THẠCH!";
}
}
}

// Surface visual hint: 72% truthful, 28% deceptive (classic stone gambling mind-game!)
const truthful=(Math.random()<0.72);
const clueKey=truthful?outcomeType :(outcomeType==="dud"?"stones" :(outcomeType==="jackpot"?"gu" :"dud"));
const cluePool=SURFACE_VEINS[clueKey]||SURFACE_VEINS.dud;
const surfaceClue=cluePool[Math.floor(Math.random()*cluePool.length)];
const weightKg=Number((1.8 + Math.random()*14.5 + STONE_TIERS.indexOf(tier)*3.2).toFixed(1));

return {
uid:`ore_${Date.now().toString(36)}_${slotIdx}_${Math.floor(Math.random()*999)}`,
tierId:tier.id,
name:tier.name,
badge:tier.badge,
color:tier.color,
shellA:tier.shellA,
shellB:tier.shellB,
veinCol:tier.veinCol,
price:tier.price,
guRankRange:tier.guRankRange,
weightKg,
seed:Math.floor(Math.random()*10000),
surfaceClue,
outcomeType,
payload,
auraColor,
rarityLabel,
scoutLevel:0, // 0=unscouted, 1=Wisdom scouted, 2=Recon Gu deep scouted
scoutText:"",
opened:false
};
}

global.VanCoStoneGamblingData={
STONE_TIERS,
RECON_GU_IDS,
getTierById,
generateStoneOffer
};
})(window);
