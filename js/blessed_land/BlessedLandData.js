(function (global) {
"use strict";

const GRID_COLS=5;
const GRID_ROWS=4;

const BUILDING_TYPES={
spirit_spring:{
id:"spirit_spring",
name:"Nguyên Tuyền Cổ Mạch",
icon:"💎",
color:"#4ce6ff",
bgCol:"#102b38",
reqRank:1,
costStones:80,
costImmortal:0,
yieldType:"stones",
baseYieldPerMin:38,
synergyWith:["bamboo_grove","herb_garden","ore_vein","immortal_altar"],
synergyDesc:"Cạnh Rừng Trúc, Dược Viên hoặc Mạch Khoáng: +35% sản lượng!",
desc:"Suối nguyên khí dồi dào tự động kết tụ Nguyên Thạch theo thời gian và tưới mát thực vật xung quanh."
},
bamboo_grove:{
id:"bamboo_grove",
name:"Thanh Trúc Linh Lâm",
icon:"🎋",
color:"#5cc995",
bgCol:"#10291c",
reqRank:1,
costStones:95,
costImmortal:0,
yieldType:"item",
itemId:"spirit_herb",
altItemId:"moon_orchid",
baseYieldPerMin:1.6,
synergyWith:["spirit_spring","herb_garden","beast_pasture","immortal_altar"],
synergyDesc:"Cạnh Nguyên Tuyền hoặc Bãi Dị Thú: +35% tốc độ sinh trưởng!",
desc:"Rừng trúc linh khí tự động sinh sản Thanh Linh Thảo & Nguyệt Lan Hoa dùng nuôi Cổ Trùng."
},
herb_garden:{
id:"herb_garden",
name:"Dược Viên Ngũ Vực",
icon:"🌸",
color:"#ff85c2",
bgCol:"#2b1422",
reqRank:2,
costStones:180,
costImmortal:0,
yieldType:"item",
itemId:"hundred_year_ginseng",
altItemId:"moon_orchid",
baseYieldPerMin:1.1,
synergyWith:["spirit_spring","bamboo_grove","beast_pasture","immortal_altar"],
synergyDesc:"Cạnh Nguyên Tuyền hoặc Rừng Trúc: +35% dược tính!",
desc:"Vườn linh dược quý hiếm nuôi trồng Bách Niên Khổ Sâm và Nguyệt Lan Hoa liên tục."
},
blood_pool:{
id:"blood_pool",
name:"Huyết Hồ Ma Trì",
icon:"🩸",
color:"#ff4d4d",
bgCol:"#2e0d12",
reqRank:2,
costStones:220,
costImmortal:0,
yieldType:"item",
itemId:"beast_blood_core",
altItemId:"ration_meat",
baseYieldPerMin:1.2,
synergyWith:["beast_pasture","soul_mountain","immortal_altar"],
synergyDesc:"Cạnh Bãi Chăn Dị Thú: +40% tinh huyết ngưng tụ!",
desc:"Hồ huyết khí ngưng tụ Bách Thú Tinh Huyết và Thịt Thú Rừng, cực hợp bồi dưỡng Thú Triều."
},
beast_pasture:{
id:"beast_pasture",
name:"Bãi Chăn Dị Thú",
icon:"🐺",
color:"#e6a84c",
bgCol:"#291e10",
reqRank:1,
costStones:140,
costImmortal:0,
yieldType:"pasture",
itemId:"ration_meat",
baseYieldPerMin:1.5,
synergyWith:["bamboo_grove","herb_garden","blood_pool","immortal_altar"],
synergyDesc:"Thả Dị Thú từ Thú Quyển vào nuôi: +30% sản lượng ô kế bên, Thú tự lên EXP & tham gia Phòng Thủ!",
desc:"Thảo nguyên chăn nuôi Linh Thú trong Phúc Địa. Sản sinh Thịt Thú, giúp Thú tự hồi máu/EXP và bảo vệ Phúc Địa."
},
ore_vein:{
id:"ore_vein",
name:"Mạch Khoáng Cổ Thạch",
icon:"🪨",
color:"#b89758",
bgCol:"#241f18",
reqRank:2,
costStones:195,
costImmortal:0,
yieldType:"item",
itemId:"bronze_ore",
altItemId:"red_iron_ore",
baseYieldPerMin:1.4,
synergyWith:["spirit_spring","immortal_altar"],
synergyDesc:"Cạnh Nguyên Tuyền: +30% kết tinh khoáng thạch!",
desc:"Mỏ khoáng sản ngầm liên tục sinh ra Thanh Đồng Thạch Khoáng & Xích Thiết Tinh Khoáng."
},
soul_mountain:{
id:"soul_mountain",
name:"Tiểu Đãng Hồn Sơn",
icon:"🔮",
color:"#c278ff",
bgCol:"#241033",
reqRank:3,
costStones:520,
costImmortal:0,
yieldType:"item",
itemId:"soul_crystal",
altItemId:"jade_bone",
baseYieldPerMin:0.9,
synergyWith:["blood_pool","immortal_altar"],
synergyDesc:"Cạnh Huyết Hồ hoặc Tiên Mạch Đàn: +40% Đảm Thức Tinh Thạch!",
desc:"Ngọn núi pha lê mô phỏng Đãng Hồn Sơn, sản sinh Đãng Hồn Thạch Đan và Bạch Ngọc Cốt Tủy."
},
immortal_altar:{
id:"immortal_altar",
name:"Tiên Mạch Tụ Linh Đàn",
icon:"🌟",
color:"#ffd700",
bgCol:"#2e240c",
reqRank:6,
costStones:2400,
costImmortal:1,
yieldType:"immortal",
itemId:"immortal_stone",
altItemId:"remnant_recipe",
baseYieldPerMin:0.55,
synergyWith:["spirit_spring","bamboo_grove","herb_garden","blood_pool","beast_pasture","ore_vein","soul_mountain"],
synergyDesc:"Cộng hưởng với MỌI Tài Nguyên Điểm lân cận (+45% sản lượng toàn chuỗi sinh thái)!",
desc:"Tế đàn dẫn Tiên Khí Cửu Thiên, tự động kết tụ Tiên Nguyên Thạch và Cổ Phương Tàn Quyển!"
}
};

const BUILDING_LIST=Object.values(BUILDING_TYPES);

const SYNERGY_RULES=[
{a:"spirit_spring",b:"bamboo_grove",bonus:0.35,name:"Thủy Dưỡng Thanh Trúc",color:"#5cc995"},
{a:"spirit_spring",b:"herb_garden", bonus:0.35,name:"Nguyên Tuyền Dưỡng Dược",color:"#ff85c2"},
{a:"spirit_spring",b:"ore_vein",    bonus:0.30,name:"Thủy Mạch Kết Khoáng",color:"#7ef7f0"},
{a:"bamboo_grove", b:"beast_pasture",bonus:0.35,name:"Linh Lâm Dưỡng Thú",color:"#7ef7c4"},
{a:"herb_garden",  b:"beast_pasture",bonus:0.35,name:"Dược Thảo Bồi Thú",color:"#ff9be0"},
{a:"blood_pool",   b:"beast_pasture",bonus:0.40,name:"Huyết Trì Luyện Thú Vương",color:"#ff5252"},
{a:"blood_pool",   b:"soul_mountain",bonus:0.40,name:"Huyết Hồn Cộng Minh",color:"#c278ff"}
];

const RAID_TYPES={
thief_raid:{
id:"thief_raid",
name:"Cổ Tiên / Đạo Tặc Ngoại Vực Trộm Tài Nguyên",
shortName:"Đạo Tặc Xâm Nhập!",
icon:"🦹",
color:"#ff5252",
waves:3,
desc:"Kẻ trộm từ ngoại vực đã phá rách khiếu bích lẻn vào Phúc Địa! Hãy đánh đuổi chúng trước khi chúng cướp sạch kho tài nguyên và phá hủy Địa Linh Trụ!"
},
calamity_siege:{
id:"calamity_siege",
name:"Thiên Kiếp • Địa Tai Giáng Lâm Phúc Địa",
shortName:"Tai Kiếp Giáng Lâm!",
icon:"🌩️",
color:"#b75cff",
waves:3,
desc:"Thiên Đạo giáng hạ Tai Kiếp thẳng xuống Phúc Địa! Trực tiếp chiến đấu tiêu diệt Kiếp Thú & phá giải lôi trụ để nhận Đạo Ngân & mở rộng Phúc Địa!"
}
};

function getBuildingType(id) {
return BUILDING_TYPES[id]||null;
}

function getUpgradeCost(typeObj,curLevel) {
const lv=Math.max(1,Number(curLevel)||1);
const stones=Math.round((typeObj.costStones||100)*(0.65 + lv*0.55));
const immortal=(typeObj.costImmortal||0)>0?Math.max(1,Math.floor(lv / 2)) :0;
return {stones,immortal};
}

function getFormationUpgradeCost(curLevel) {
const lv=Math.max(1,Number(curLevel)||1);
return {stones:Math.round(160*Math.pow(2.1,lv - 1)),immortal:lv>=4?lv - 3 :0};
}

function getPairSynergy(typeA,typeB) {
if (!typeA|| !typeB||typeA===typeB) return null;
if (typeA==="immortal_altar"||typeB==="immortal_altar") {
return {bonus:0.45,name:"Tiên Linh Quy Tụ",color:"#ffd700"};
}
for (const r of SYNERGY_RULES) {
if ((r.a===typeA&&r.b===typeB)||(r.a===typeB&&r.b===typeA)) {
return {bonus:r.bonus,name:r.name,color:r.color};
}
}
return null;
}

global.VanCoBlessedLandData={
GRID_COLS,
GRID_ROWS,
BUILDING_TYPES,
BUILDING_LIST,
SYNERGY_RULES,
RAID_TYPES,
getBuildingType,
getUpgradeCost,
getFormationUpgradeCost,
getPairSynergy
};
})(window);
