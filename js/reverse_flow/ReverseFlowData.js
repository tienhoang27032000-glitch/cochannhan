(function (global) {
"use strict";

const ROGUELIKE_BOONS=[
// --- COMMON / RARE DAO MARK & STAT BOONS ---
{
id:"boon_atk_30",rarity:"common",color:"#ff6b35",icon:"⚔️",
name:"Lực Đạo Thần Ấn",
desc:"Tăng +30% Sát Thương toàn bộ Cổ Thuật & Sát Chiêu trong lượt leo tầng.",
apply:(b)=>{b.dmgMult +=0.30;}
},
{
id:"boon_multishot",rarity:"rare",color:"#7ef7f0",icon:"🌙",
name:"Nguyệt Quang Phân Ảnh",
desc:"Đòn đánh chính [1/Click] bắn thêm +2 tia đạn rẽ quạt.",
apply:(b)=>{b.extraShots +=2;}
},
{
id:"boon_haste",rarity:"common",color:"#5cc995",icon:"💨",
name:"Thanh Phong Đạp Lãng",
desc:"Tăng +22% Tốc Độ bơi ngược dòng & giảm 25% hồi chiêu Thuấn Di / Nhảy.",
apply:(b)=>{b.spdMult +=0.22;b.cdMult *=0.80;}
},
{
id:"boon_crit",rarity:"common",color:"#ffd700",icon:"🎯",
name:"Vận Đạo Tụ Khí",
desc:"Tăng +22% Tỷ lệ Bạo Kích & +45% Sát Thương Bạo Kích.",
apply:(b)=>{b.critChance +=0.22;b.critMult +=0.45;}
},
{
id:"boon_lifesteal",rarity:"rare",color:"#e03e3e",icon:"🩸",
name:"Huyết Đạo Thực Nguyên",
desc:"Mỗi đòn trúng địch hút 10% Sinh Mệnh & tăng +25% HP tối đa.",
apply:(b)=>{b.lifesteal +=0.10;b.maxHpBonus +=0.25;}
},
{
id:"boon_pierce",rarity:"common",color:"#dce8f2",icon:"🦴",
name:"Lao Toàn Xuyên Giáp",
desc:"Đạn Cổ Thuật xuyên thấu thêm +2 mục tiêu & tăng +20% kích cỡ đạn.",
apply:(b)=>{b.pierce +=2;b.dmgMult +=0.12;}
},
{
id:"boon_chain_lightning",rarity:"rare",color:"#b75cff",icon:"⚡",
name:"Cửu Thiên Lôi Liên",
desc:"Đòn đánh chính có 40% kích phát tia sét nhảy sang 3 kẻ địch lân cận.",
apply:(b)=>{b.chainLightning +=1;}
},
{
id:"boon_frost_jump",rarity:"common",color:"#85c1e9",icon:"❄️",
name:"Hàn Sương Đạp Ba",
desc:"Mỗi lần Nhảy [SPACE] hoặc tiếp đất tạo sóng băng làm chậm 50% & gây sát thương địch xung quanh.",
apply:(b)=>{b.frostJump +=1;}
},
{
id:"boon_dash_nova",rarity:"rare",color:"#ff9f43",icon:"🔥",
name:"Phong Hỏa Xung Lãng",
desc:"Mỗi lần Lướt [G/Shift] bùng nổ vòng lửa thiêu đốt toàn bộ địch trên đường lướt.",
apply:(b)=>{b.dashNova +=1;}
},
{
id:"boon_cd_reduction",rarity:"rare",color:"#4ce6ff",icon:"⏳",
name:"Trụ Đạo Lưu Niên",
desc:"Giảm 28% thời gian hồi chiêu của Sát Chiêu [2/Q] & Đại Chiêu [3/E].",
apply:(b)=>{b.cdMult *=0.72;}
},
{
id:"boon_heal_shield",rarity:"common",color:"#7ef7c4",icon:"🪷",
name:"Xuân Quang Hộ Tâm",
desc:"Lập tức hồi đầy 60% Sinh Mệnh và tạo lớp Hộ Thuẫn +35% HP tối đa mỗi tầng.",
apply:(b)=>{b.shieldPerFloor +=0.35;b.instantHealPct +=0.60;}
},
{
id:"boon_river_resist",rarity:"common",color:"#3b8beb",icon:"🪨",
name:"Bàn Sơn Định Thân",
desc:"Giảm 45% lực đẩy xuôi dòng của Nghịch Lưu Hà & giảm 15% sát thương nhận vào.",
apply:(b)=>{b.currentResist=Math.min(0.85,b.currentResist + 0.45);b.dmgReduce=Math.min(0.55,b.dmgReduce + 0.15);}
},
// --- SUPREME TEMPORARY IMMORTAL GU RELICS (CHÍ TÔN) ---
{
id:"gu_nghich_luu_an",rarity:"supreme",color:"#00e5ff",icon:"🌊",
name:"[Tiên Cổ Tạm] Nghịch Lưu Hộ Thân Ấn",
desc:"MIỄN HOÀN TOÀN lực đẩy dòng nước Nghịch Lưu Hà + phản ngược 45% sát thương mọi đòn đánh của địch!",
apply:(b)=>{b.currentResist=1.0;b.reflectPct +=0.45;b.dmgReduce=Math.min(0.60,b.dmgReduce + 0.20);}
},
{
id:"gu_phi_kiem_tien",rarity:"supreme",color:"#c2f0ff",icon:"⚔️",
name:"[Tiên Cổ Tạm] Phi Kiếm Tiên Cổ",
desc:"Triệu hồi Tiên Kiếm tự động bay truy kích & trảm sát kẻ địch mỗi 0.85 giây!",
apply:(b)=>{b.autoSwords +=2;}
},
{
id:"gu_xuan_thu_thien",rarity:"supreme",color:"#ffd700",icon:"🦗",
name:"[Tiên Cổ Tạm] Xuân Thu Thiền Ảnh",
desc:"Chí bảo nghịch thiên: Khi HP giảm về 0, tự động đảo ngược thời gian hồi 60% HP & quét sạch đạn (1 lần)!",
apply:(b)=>{b.revives +=1;}
},
{
id:"gu_bao_lien_tien",rarity:"supreme",color:"#52e3a8",icon:"🪷",
name:"[Tiên Cổ Tạm] Thiên Nguyên Bảo Liên",
desc:"Hồi phục liên tục 4.5% Sinh Mệnh/giây & +40% uy lực Sát Chiêu [2/Q] và [3/E]!",
apply:(b)=>{b.regenPctPerSec +=0.045;b.skillMult +=0.40;}
},
{
id:"gu_orbit_blades",rarity:"rare",color:"#a8e6ff",icon:"🌀",
name:"[Linh Cổ Tạm] Kiếm Ảnh Hộ Thân",
desc:"Triệu hồi 3 thanh Kiếm Quang xoay quanh thân thể liên tục chém kẻ địch áp sát.",
apply:(b)=>{b.orbitBlades +=3;}
},
{
id:"gu_quang_am_freeze",rarity:"supreme",color:"#ffe066",icon:"🌙",
name:"[Tiên Cổ Tạm] Quang Âm Phi Nhận",
desc:"Đại Chiêu [3/E] kèm Ngưng Đọng Thời Gian đóng băng toàn bộ kẻ địch & dòng sông trong 2.2 giây!",
apply:(b)=>{b.timeStopOnUlt=true;b.dmgMult +=0.25;}
}
];

const MILESTONES=[
{floor:3,  title:"Nghịch Thủy Hành Giả", stones:280,  merit:120, itemId:"spirit_herb",         itemQty:3, desc:"Vượt qua Tầng 3 Nghịch Lưu Hà"},
{floor:5,  title:"Phá Lãng Cổ Sư",      stones:650,  merit:220, itemId:"remnant_recipe",      itemQty:1, desc:"Vượt qua Tầng 5 Nghịch Lưu Hà"},
{floor:9,  title:"Kiên Trì Tiên Nhân",  stones:1600, merit:420, itemId:"soul_crystal",        itemQty:2, desc:"Vượt qua Tầng 9 Nghịch Lưu Hà"},
{floor:12, title:"Nghịch Lưu Chấp Niệm",stones:3600, merit:750, itemId:"hundred_year_ginseng",itemQty:3, desc:"Vượt qua Tầng 12 Nghịch Lưu Hà"},
{floor:15, title:"Nghịch Lưu Chi Chủ",  stones:8500, merit:1300,itemId:"immortal_stone",      itemQty:3, desc:"Vượt qua Tầng 15 Nghịch Lưu Hà"},
{floor:20, title:"Chí Tôn Kiên Trì",    stones:22000,merit:2500,itemId:"immortal_stone",      itemQty:8, desc:"Vượt qua Tầng 20 Nghịch Lưu Hà"}
];

const BOSS_POOL=[
{name:"Bạch Ngưng Băng Ảnh",  skinKey:"bach_ngung_bang",color:"#74eaff",icon:"❄️"},
{name:"Hắc Lâu Lan Chiến Ý",  skinKey:"hac_lau_lan",    color:"#ff9f43",icon:"🔥"},
{name:"Phượng Cửu Ca Âm Ảnh", skinKey:"phuong_cuu_ca",  color:"#76d7c4",icon:"🎵"},
{name:"Hồng Liên Quang Ảnh",  skinKey:"hong_lien",      color:"#ff3b30",icon:"🪷"},
{name:"U Hồn Sát Ý Phân Thân",skinKey:"u_hon",          color:"#b75cff",icon:"👻"},
{name:"Tinh Tú Kỳ Hồn",       skinKey:"tinh_tu",        color:"#4ce6ff",icon:"⭐"}
];

function rollThreeBoons(existingCounts={}) {
const pool=ROGUELIKE_BOONS.filter(b=>{
if (b.id==="gu_nghich_luu_an"&&(existingCounts[b.id]||0)>=1) return false;
if (b.id==="gu_quang_am_freeze"&&(existingCounts[b.id]||0)>=1) return false;
if (b.id==="gu_xuan_thu_thien"&&(existingCounts[b.id]||0)>=2) return false;
return true;
});
// Weighted random pick without duplicates
const chosen=[];
const avail=[...pool];
for (let k=0;k<3&&avail.length>0;k++) {
const weights=avail.map(x=>x.rarity==="supreme"?16 :(x.rarity==="rare"?32 :52));
const tot=weights.reduce((a,b)=>a + b,0);
let r=Math.random()*tot;
let pickIdx=avail.length - 1;
for (let i=0;i<avail.length;i++) {
r -=weights[i];
if (r<=0) {pickIdx=i;break;}
}
chosen.push(avail.splice(pickIdx,1)[0]);
}
return chosen;
}

global.VanCoReverseFlowData={
ROGUELIKE_BOONS,
MILESTONES,
BOSS_POOL,
rollThreeBoons
};
})(window);
