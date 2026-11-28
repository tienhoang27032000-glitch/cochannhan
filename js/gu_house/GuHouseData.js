(function (global) {
"use strict";

const GU_HOUSES=[
{
id:"bach_cot_xa",
name:"Bạch Cốt Xa",
tierLabel:"Phàm Cổ Ốc • Nhị Chuyển",
rank:2,
reqRank:1,
path:"Kim Đạo",
icon:"🦴",
color:"#dce8f2",
accent:"#7ef7f0",
requiredGuIds:["thiet_bi_gu","thiet_cot_gu","thanh_phong_gu","phong_nhan_gu"],
assembleCost:{stones:150,immortalStones:0,itemId:"bronze_ore",itemCount:2},
baseShield:420,
baseTurretDmg:36,
turretInterval:0.85,
turretRange:390,
turretShots:2,
turretColor:"#e6f2fa",
speedMult:1.15,
ultimate:{
name:"Bạch Cốt Trùng Trận",
icon:"🦴",
cooldown:9.0,
essenceCost:18,
powerMult:3.6,
desc:"Phóng 8 mũi Cốt Thương xoay vòng kèm chấn động gây Choáng 1.5s toàn bộ kẻ địch xung quanh."
},
desc:"Chiến xa bằng bạch cốt của Hôi Cốt Tài Tuấn. Vừa lướt nhanh bằng Phong Luân, vừa tự động phóng cốt thương liên hoàn xuyên phá đội hình địch."
},
{
id:"huyet_ha_xa",
name:"Huyết Hà Xa",
tierLabel:"Linh Cổ Ốc • Tứ Chuyển",
rank:4,
reqRank:3,
path:"Huyết Đạo",
icon:"🩸",
color:"#e03e3e",
accent:"#ff8a8a",
requiredGuIds:["huyet_nguyet_gu","huyet_tich_gu","huyet_lo_gu","huyet_sat_nhan_gu"],
assembleCost:{stones:680,immortalStones:0,itemId:"beast_blood_core",itemCount:3},
baseShield:1650,
baseTurretDmg:125,
turretInterval:0.78,
turretRange:440,
turretShots:3,
turretColor:"#ff4d4d",
lifesteal:0.20,
speedMult:1.22,
ultimate:{
name:"Huyết Hà Thao Thiên",
icon:"🩸",
cooldown:10.0,
essenceCost:24,
powerMult:4.0,
desc:"Gọi sóng máu càn quét diện rộng + phóng 10 Huyết Nhận truy kích và tự hồi 30% Hộ Thuẫn Cổ Ốc!"
},
desc:"Ma đạo chiến xa nổi tiếng của Huyết Hải Lão Tổ. Lướt trên sóng huyết, mỗi phát bắn tự động hút 20% máu tự sửa chữa Hộ Thuẫn Cổ Ốc."
},
{
id:"can_thuy_lau_dai",
name:"Cận Thủy Lâu Đài",
tierLabel:"Tiên Cổ Ốc • Lục Chuyển",
rank:6,
reqRank:5,
path:"Thủy Đạo",
icon:"🌊",
color:"#4ce6ff",
accent:"#7ef7f0",
requiredGuIds:["thuy_tien_gu","thuy_tien_giap_gu","xoay_nuoc_gu","thuy_long_gu"],
assembleCost:{stones:2200,immortalStones:0,itemId:"spirit_herb",itemCount:4},
baseShield:7200,
baseTurretDmg:520,
turretInterval:0.72,
turretRange:490,
turretShots:3,
turretColor:"#4ce6ff",
chillSlow:0.45,
speedMult:1.20,
ultimate:{
name:"Thủy Nguyệt Kính Hoa",
icon:"🌊",
cooldown:11.0,
essenceCost:0.8,
powerMult:4.4,
desc:"Bùng phát Băng Thủy Toàn Phong đóng băng kẻ địch trong bán kính lớn và hồi ngay 40% Hộ Thuẫn Cổ Ốc!"
},
desc:"Tiên Cổ Ốc lừng danh của Linh Duyên Trai Trung Châu. Mái ngói lưu ly bồng bềnh trên sóng nước, tự động phóng Thủy Long Tiễn làm chậm quần địch."
},
{
id:"dong_hai_long_cung",
name:"Đông Hải Long Cung",
tierLabel:"Tiên Cổ Ốc • Thất Chuyển",
rank:7,
reqRank:6,
path:"Thủy Đạo",
icon:"🐉",
color:"#ffd700",
accent:"#4ce6ff",
requiredGuIds:["kim_long_gu","thuy_long_gu","thai_co_long_luc_gu","kim_chung_trao_gu","nghich_luu_ho_than_gu"],
assembleCost:{stones:6500,immortalStones:3,itemId:"jade_bone",itemCount:4},
baseShield:24000,
baseTurretDmg:1850,
turretInterval:0.68,
turretRange:540,
turretShots:4,
turretColor:"#ffd700",
speedMult:1.26,
ultimate:{
name:"Long Uy Chấn Hải",
icon:"🐉",
cooldown:11.5,
essenceCost:1.2,
powerMult:4.8,
desc:"Bắn 3 đạo Long Quang Trụ xuyên thấu toàn chiến trường kèm sóng chấn động làm Choáng Boss!"
},
desc:"Bát Chuyển Tiên Cổ Ốc huyền thoại ẩn sâu đáy Đông Hải. Kim trụ chạm rồng tỏa uy áp vạn cổ, hộ thuẫn kiên cố bậc nhất."
},
{
id:"chan_duong_lau",
name:"Bát Thập Bát Giác Chân Dương Lâu",
tierLabel:"Chí Tôn Cổ Ốc • Bát Chuyển",
rank:8,
reqRank:7,
path:"Vận Đạo",
icon:"🏛️",
color:"#ffe066",
accent:"#ff9f43",
requiredGuIds:["cam_ly_van_gu","tinh_quang_gu","cau_thi_van_tien_gu","kiep_van_dan_tien_gu","chu_van_oa_tien_gu"],
assembleCost:{stones:18000,immortalStones:8,itemId:"soul_crystal",itemCount:5},
baseShield:78000,
baseTurretDmg:5800,
turretInterval:0.62,
turretRange:590,
turretShots:4,
turretColor:"#ffe066",
speedMult:1.24,
ultimate:{
name:"Chân Dương Phổ Chiếu",
icon:"☀️",
cooldown:12.0,
essenceCost:1.6,
powerMult:5.2,
desc:"Phóng 12 chùm Thái Dương Vận Quang hủy diệt tứ phía, hồi 45% Hộ Thuẫn và kích hoạt Chiến Ý Bạo Kích!"
},
desc:"Tiên Cổ Ốc trấn tộc của Cự Dương Tiên Tôn tại Vương Đình Bắc Nguyên. Tháp bát giác hoàng kim tỏa ánh dương bất diệt, xoay chuyển khí vận trời đất."
},
{
id:"van_kiem_tien_dien",
name:"Vô Cực Vạn Kiếm Tiên Điện",
tierLabel:"Chí Tôn Tiên Cổ Ốc • Cửu Chuyển",
rank:9,
reqRank:8,
path:"Kiếm Đạo",
icon:"🌌",
color:"#c2f0ff",
accent:"#b75cff",
requiredGuIds:["phi_kiem_tien_gu","kiem_don_tien_gu","kiem_mi_tien_gu","thien_phong_kiem_gu","dinh_tien_du_gu"],
assembleCost:{stones:45000,immortalStones:16,itemId:"soul_crystal",itemCount:8},
baseShield:240000,
baseTurretDmg:19500,
turretInterval:0.55,
turretRange:650,
turretShots:5,
turretColor:"#a8f0ff",
speedMult:1.32,
ultimate:{
name:"Vạn Kiếm Quy Tông • Tru Tiên Trận",
icon:"⚔️",
cooldown:12.5,
essenceCost:2.2,
powerMult:5.8,
desc:"Phóng 16 thanh Tiên Kiếm tự truy kích + 4 đạo Kiếm Quang Trụ xé rách hư không, quét sạch Song Tôn!"
},
desc:"Tòa Tiên Điện tối thượng kết hợp tinh hoa Kiếm Đạo và Không Gian Đạo. Lơ lửng giữa tinh vân, vạn kiếm hộ thân tự động trảm sát bất kỳ kẻ địch nào tiến gần."
}
];

function getGuHouseById(id) {
return GU_HOUSES.find(h=>h.id===id)||null;
}

function getUpgradeCost(house,curLevel) {
const lv=Math.max(1,Number(curLevel)||1);
const baseS=house.assembleCost.stones||200;
const stones=Math.round(baseS*(0.45 + lv*0.35));
const imm=(house.assembleCost.immortalStones||0)>0?Math.max(1,Math.floor(lv / 2)) :0;
return {stones,immortalStones:imm};
}

function computeGuHouseStats(house,level=1,player=null) {
const lv=Math.max(1,Math.min(10,Number(level)||1));
const shieldLvMult=1 + (lv - 1)*0.18;
const dmgLvMult=1 + (lv - 1)*0.16;
const daoAmp=(player&&typeof player.calculateDaoAmplification==="function")
?Math.min(4.0,player.calculateDaoAmplification(house.path,[]).multiplier)
:1.0;
const maxShield=Math.round(house.baseShield*shieldLvMult*(0.85 + daoAmp*0.15));
const turretDmg=Math.round(house.baseTurretDmg*dmgLvMult*daoAmp);
const ultDmg=Math.round(turretDmg*(house.ultimate.powerMult||4.0));
return {maxShield,turretDmg,ultDmg,daoAmp,level:lv};
}

global.VanCoGuHouseData={
GU_HOUSES,
getGuHouseById,
getUpgradeCost,
computeGuHouseStats
};
})(window);
