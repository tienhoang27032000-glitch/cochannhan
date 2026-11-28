(function (global) {
"use strict";
const CHARACTER_SKINS={
phuong_nguyen:{
id:"phuong_nguyen",
name:"Cổ Nguyệt Phương Nguyên",
gender:"male",
capeColor:"#0e1017",
innerCollarColor:"#e6dfd5",
title:"Luyện Thiên Ma Tôn",
robeColor:"#14171f",
robeSecondary:"#232836",
trimColor:"#8a1c1c",
beltColor:"#b89758",
hairColor:"#0a0b0e",
hairStyle:"long_flowing",
skinTone:"#ead0b3",
eyeColor:"#050505",
crownColor:"#63533b",
auraColor:"rgba(224, 62, 62, 0.22)",
weaponColor:"#e03e3e",
particleColor:"#f2d16b",
specialFeature:"spring_autumn_cicada",
desc:"Trường bào đen tuyền, tóc đen dài xõa vai, đôi mắt sâu thẳm như cổ đàm năm trăm năm không gợn sóng."
},
bach_ngung_bang:{
id:"bach_ngung_bang",
name:"Bạch Ngưng Băng",
gender:"female",
innerCollarColor:"#ffffff",
title:"Bắc Minh Băng Phách Thể",
robeColor:"#e6f2f8",
robeSecondary:"#b8d8eb",
trimColor:"#3b8beb",
beltColor:"#4ce6ff",
hairColor:"#f2f8ff",
hairStyle:"silver_long",
skinTone:"#f5e6d8",
eyeColor:"#00c8ff",
crownColor:"#85c1e9",
auraColor:"rgba(133, 193, 233, 0.30)",
weaponColor:"#85c1e9",
particleColor:"#ffffff",
specialFeature:"frost_crystals",
desc:"Bạch y thắng tuyết, mái tóc bạc trắng như sương hàn, đôi mắt lam băng tỏa ra hàn khí đóng băng vạn vật."
},
phuong_cuu_ca:{
id:"phuong_cuu_ca",
name:"Phượng Cửu Ca",
gender:"male",
capeColor:"#9e1f1f",
innerCollarColor:"#fffaf0",
title:"Đạo Thiên Ma Tôn Hộ Đạo Nhân",
robeColor:"#f0ebe1",
robeSecondary:"#a82424",
trimColor:"#d4af37",
beltColor:"#e2bf75",
hairColor:"#171a21",
hairStyle:"noble_crown",
skinTone:"#edd2b5",
eyeColor:"#2c3e50",
crownColor:"#ffd700",
auraColor:"rgba(118, 215, 196, 0.26)",
weaponColor:"#76d7c4",
particleColor:"#76d7c4",
specialFeature:"destiny_song_notes",
desc:"Cẩm bào hồng bạch tiêu sái, phong thái nho nhã tuyệt đại của người đứng đầu thập đại cổ phái Trung Châu."
},
thuong_tam_tu:{
id:"thuong_tam_tu",
name:"Thương Tâm Từ",
gender:"female",
innerCollarColor:"#f5fff9",
title:"Thương Gia Tộc Trưởng",
robeColor:"#1e5c42",
robeSecondary:"#38a376",
trimColor:"#98f5c8",
beltColor:"#e2bf75",
hairColor:"#14181f",
hairStyle:"jade_hairpin",
skinTone:"#f5dec6",
eyeColor:"#27ae60",
crownColor:"#5cc995",
auraColor:"rgba(92, 201, 149, 0.25)",
weaponColor:"#5cc995",
particleColor:"#98f5c8",
specialFeature:"jade_lotus",
desc:"Bích lục tiên quần dịu dàng thanh nhã, trâm ngọc cài đầu, mang khí chất thiện lương ấm áp của Thương Gia Thành."
},
hac_lau_lan:{
id:"hac_lau_lan",
name:"Hắc Lâu Lan",
gender:"male",
isArmored:true,
capeColor:"#3b1d12",
innerCollarColor:"#e6ccb2",
title:"Đại Lực Chân Vũ Thể",
robeColor:"#292018",
robeSecondary:"#4a3723",
trimColor:"#e07a45",
beltColor:"#ffd700",
hairColor:"#1c140d",
hairStyle:"war_helm",
skinTone:"#e0bc96",
eyeColor:"#ff9f43",
crownColor:"#d4af37",
auraColor:"rgba(224, 122, 69, 0.30)",
weaponColor:"#e07a45",
particleColor:"#ff9f43",
specialFeature:"martial_flames",
desc:"Chiến giáp huyền kim uy vũ bá khí, mang huyết mạch Hoàng Kim Bắc Nguyên và thần lực Đại Lực Chân Vũ."
},
hong_lien:{
id:"hong_lien",
name:"Hồng Liên Ma Tôn",
gender:"male",
isVenerableSkin:true,
foreheadMark:"lotus",
capeColor:"#6e0d0d",
innerCollarColor:"#fff5d6",
title:"Quang Âm Trường Hà Chi Chủ",
robeColor:"#8f1616",
robeSecondary:"#d62828",
trimColor:"#ffd700",
beltColor:"#ffdf6b",
hairColor:"#240808",
hairStyle:"immortal_lotus",
skinTone:"#f2d6b8",
eyeColor:"#ff3b30",
crownColor:"#ffd700",
auraColor:"rgba(255, 77, 77, 0.32)",
weaponColor:"#ffd700",
particleColor:"#ff5733",
specialFeature:"red_lotus_halo",
desc:"Huyết hồng tiên bào thêu hoa sen vàng rực rỡ, nghịch chuyển dòng chảy Quang Âm Trường Hà phá nát Túc Mệnh."
},
u_hon:{
id:"u_hon",
name:"U Hồn Ma Tôn",
gender:"male",
isVenerableSkin:true,
capeColor:"#0d0617",
innerCollarColor:"#c5a3ff",
title:"Thiên Hạ Đệ Nhất Sát Tính",
robeColor:"#11091c",
robeSecondary:"#281542",
trimColor:"#8f6ee6",
beltColor:"#9b59b6",
hairColor:"#1f1230",
hairStyle:"demonic_wild",
skinTone:"#d8d0e5",
eyeColor:"#ff2a2a",
crownColor:"#8f6ee6",
auraColor:"rgba(143, 110, 230, 0.36)",
weaponColor:"#b75cff",
particleColor:"#8f6ee6",
specialFeature:"soul_shadows",
desc:"Ma ảnh u minh quấn quanh thân thể, đôi mắt đỏ rực sát cơ vạn cổ, sáng lập Hồn Đạo thống trị Sinh Tử Môn."
},
tinh_tu:{
id:"tinh_tu",
name:"Tinh Tú Tiên Tôn",
gender:"female",
isVenerableSkin:true,
foreheadMark:"star",
innerCollarColor:"#eef8ff",
title:"Trí Đạo Thủy Tổ — Thiên Đình Tiên Vương",
robeColor:"#142847",
robeSecondary:"#24477a",
trimColor:"#7ef7f0",
beltColor:"#dce8f2",
hairColor:"#0f1c33",
hairStyle:"star_crown",
skinTone:"#f5e1ce",
eyeColor:"#4ce6ff",
crownColor:"#7ef7f0",
auraColor:"rgba(103, 183, 209, 0.34)",
weaponColor:"#4ce6ff",
particleColor:"#7ef7f0",
specialFeature:"orbiting_stars",
desc:"Tinh lam tiên y lấp lánh ánh sao, xung quanh có tinh thần kỳ tử xoay chuyển, tính kế thiên hạ suốt ba triệu năm."
}
};
const FIVE_REGIONS={
nam_cuong:{
id:"nam_cuong",
name:"Nam Cương",
favoredPaths:["Mộc Đạo","Lực Đạo","Độc Đạo","Huyết Đạo"],
bonusStats:{hp:20,def:2},
initialDaoMarks:{"Mộc Đạo":8,"Lực Đạo":8},
desc:"Thập vạn đại sơn trùng điệp, chướng khí dày đặc. Các sơn trại gia tộc san sát, thịnh hành Lực Đạo, Mộc Đạo và Độc Đạo."
},
bac_nguyen:{
id:"bac_nguyen",
name:"Bắc Nguyên",
favoredPaths:["Nô Đạo","Lực Đạo","Phong Đạo","Vận Đạo"],
bonusStats:{atk:4,hp:15},
initialDaoMarks:{"Nô Đạo":8,"Phong Đạo":8},
desc:"Thảo nguyên mênh mông của huyết mạch Hoàng Kim Cự Dương Tiên Tôn. Dân phong hung hãn, cực thịnh Nô Đạo và Phong Đạo."
},
trung_chau:{
id:"trung_chau",
name:"Trung Châu",
favoredPaths:["Kiếm Đạo","Trí Đạo","Luyện Đạo","Hồn Đạo"],
bonusStats:{mental:25,atk:2},
initialDaoMarks:{"Kiếm Đạo":8,"Luyện Đạo":8},
desc:"Trung tâm Ngũ Vực, nơi Thập Đại Cổ Phái thống trị dưới sự chỉ đạo của Thiên Đình. Nền tảng Luyện Đạo và Kiếm Đạo sâu dày."
},
dong_hai:{
id:"dong_hai",
name:"Đông Hải",
favoredPaths:["Thủy Đạo","Trí Đạo","Thời Gian Đạo","Băng Đạo"],
bonusStats:{mental:15,hp:15},
initialDaoMarks:{"Thủy Đạo":10,"Băng Đạo":6},
desc:"Vạn đảo linh uyên, tài nguyên tu luyện phong phú bậc nhất Ngũ Vực. Thịnh hành Thủy Đạo và các tán tu giàu có."
},
tay_mac:{
id:"tay_mac",
name:"Tây Mạc",
favoredPaths:["Viêm Đạo","Thổ Đạo","Phong Đạo"],
bonusStats:{atk:3,def:3},
initialDaoMarks:{"Viêm Đạo":10,"Thổ Đạo":6},
desc:"Sa mạc vô tận điểm xuyết những ốc đảo linh tuyền. Các đại thương đội liên kết chặt chẽ, cực thịnh Viêm Đạo và Thổ Đạo."
}
};
const FACTION_ORIGINS={
righteous_clan:{
id:"righteous_clan",
name:"Chính Đạo Gia Tộc",
primevalStones:60,
meritPoints:100,
alignment:25,
bonusStats:{hp:15,atk:2,def:2,mental:10},
initialItems:[
{id:"bronze_relic_gu",count:1},
{id:"spirit_herb",count:3},
{id:"moon_orchid",count:3},
{id:"ration_meat",count:4}
],
desc:"Đệ tử nòng cốt của gia tộc Chính Đạo trên núi Thanh Mao. Được ban 60 Nguyên Thạch, 100 Điểm Cống Hiến và 1 Thanh Đồng Xá Lợi Cổ."
},
central_sect:{
id:"central_sect",
name:"Đệ Tử Môn Phái",
primevalStones:50,
meritPoints:120,
alignment:30,
bonusStats:{hp:10,atk:3,def:2,mental:20},
extraDaoMarks:{"Kiếm Đạo":10,"Luyện Đạo":5},
initialItems:[
{id:"remnant_recipe",count:1},
{id:"spirit_herb",count:4},
{id:"red_iron_ore",count:2}
],
desc:"Đệ tử ngoại môn của đại phái. Có nền tảng Lĩnh Ngộ Kiếm Đạo sâu dày, 120 Điểm Cống Hiến và 1 Cổ Phương Tàn Quyển."
},
lone_cultivator:{
id:"lone_cultivator",
name:"Tán Tu Sơn Dã",
primevalStones:30,
meritPoints:20,
alignment:0,
bonusStats:{hp:25,atk:3,def:3,mental:15},
refinementBonus:0.15,
initialItems:[
{id:"ration_meat",count:6},
{id:"spirit_herb",count:5},
{id:"bronze_ore",count:4},
{id:"wind_essence_crystal",count:2}
],
desc:"Tán tu độc hành lăn lộn nơi rừng hoang, ý chí kiên cường (+15% tỷ lệ bắt & luyện hóa Cổ Hoang Dã) cùng nhiều cổ tài dự trữ."
},
demonic_inheritor:{
id:"demonic_inheritor",
name:"Truyền Nhân Ma Đạo",
primevalStones:25,
meritPoints:0,
alignment:-40,
bonusStats:{hp:20,atk:6,def:1,mental:20},
extraDaoMarks:{"Huyết Đạo":15,"Lực Đạo":5},
initialItems:[
{id:"beast_blood_core",count:3},
{id:"remnant_recipe",count:1},
{id:"soul_crystal",count:1}
],
desc:"Tình cờ kế thừa huyết truyền của một cự phách Ma Đạo. Sát lực hung hãn, có nền tảng Lĩnh Ngộ Huyết Đạo và 1 Tàn Phương."
},
merchant_heir:{
id:"merchant_heir",
name:"Thiếu Chủ Thương Hội",
primevalStones:120,
meritPoints:80,
alignment:10,
bonusStats:{hp:10,atk:1,def:2,mental:15},
tradeDiscount:0.15,
initialItems:[
{id:"bronze_relic_gu",count:1},
{id:"moon_orchid",count:4},
{id:"wind_essence_crystal",count:2},
{id:"ration_meat",count:4}
],
desc:"Thiếu đông gia của thương đội liên vực, khởi đầu giàu có với 120 Nguyên Thạch, 1 Thanh Đồng Xá Lợi Cổ và giảm 15% giá mua hàng."
}
};
FACTION_ORIGINS.clan=FACTION_ORIGINS.righteous_clan;
FACTION_ORIGINS.commoner=FACTION_ORIGINS.lone_cultivator;
FACTION_ORIGINS.orphan=FACTION_ORIGINS.lone_cultivator;
FACTION_ORIGINS.adopted=FACTION_ORIGINS.merchant_heir;
FACTION_ORIGINS.inheritance=FACTION_ORIGINS.demonic_inheritor;
const DAO_PATHS={
"Lực Đạo":{
id:"luc_dao",
name:"Lực Đạo",
icon:"💪",
color:"#e07a45",
conflictWith:["Trí Đạo","Phong Đạo"],
synergyWith:["Huyết Đạo","Thổ Đạo"],
desc:"Lấy thân thể và thú lực thuần túy nghiền ép vạn vật, công thủ toàn diện."
},
"Nô Đạo":{
id:"no_dao",
name:"Nô Đạo",
icon:"🐺",
color:"#a88256",
conflictWith:["Kiếm Đạo"],
synergyWith:["Hồn Đạo","Trí Đạo"],
desc:"Khống chế vạn thú, một người thành quân đoàn, tiêu hao nhiều tinh thần lực."
},
"Trí Đạo":{
id:"tri_dao",
name:"Trí Đạo",
icon:"♟️",
color:"#67b7d1",
conflictWith:["Lực Đạo"],
synergyWith:["Nô Đạo","Luyện Đạo","Vận Đạo"],
desc:"Niệm, Ý, Tình tam yếu tố. Thôi diễn cổ phương, sát chiêu và bố cục thiên hạ."
},
"Hồn Đạo":{
id:"hon_dao",
name:"Hồn Đạo",
icon:"👻",
color:"#8f6ee6",
conflictWith:["Quang Đạo","Lôi Đạo"],
synergyWith:["Nô Đạo","Ám Đạo"],
desc:"Do U Hồn Ma Tôn sáng lập. Cường hóa tráng hồn, luyện hồn và sát thương linh hồn."
},
"Huyết Đạo":{
id:"huyet_dao",
name:"Huyết Đạo",
icon:"🩸",
color:"#d93838",
conflictWith:["Mộc Đạo","Quang Đạo"],
synergyWith:["Lực Đạo"],
desc:"Do Huyết Hải Lão Tổ sáng lập. Chi phí nuôi luyện cực thấp, thành hình nhanh, sát phạt tàn bạo."
},
"Kiếm Đạo":{
id:"kiem_dao",
name:"Kiếm Đạo",
icon:"⚔️",
color:"#dce8f2",
conflictWith:["Nô Đạo","Thổ Đạo"],
synergyWith:["Kim Đạo","Phong Đạo"],
desc:"Sát lực sắc bén đứng đầu ngũ vực, xuyên thủng mọi lớp phòng ngự."
},
"Viêm Đạo":{
id:"viem_dao",
name:"Viêm Đạo",
icon:"🔥",
color:"#ff5733",
conflictWith:["Thủy Đạo","Băng Đạo"],
synergyWith:["Phong Đạo","Luyện Đạo"],
desc:"Bùng nổ sát thương diện rộng và thiêu đốt mục tiêu liên tục."
},
"Thủy Đạo":{
id:"thuy_dao",
name:"Thủy Đạo",
icon:"💧",
color:"#3b8beb",
conflictWith:["Viêm Đạo","Lôi Đạo"],
synergyWith:["Băng Đạo","Mộc Đạo"],
desc:"Miên man bất tuyệt, công thủ nhu hòa và hỗ trợ khôi phục."
},
"Mộc Đạo":{
id:"moc_dao",
name:"Mộc Đạo",
icon:"🌿",
color:"#4cd964",
conflictWith:["Huyết Đạo","Kim Đạo"],
synergyWith:["Thủy Đạo","Thổ Đạo"],
desc:"Do Nguyên Liên Tiên Tôn phát triển đỉnh phong. Trị liệu sinh cơ và kinh doanh Tiên Khiếu."
},
"Phong Đạo":{
id:"phong_dao",
name:"Phong Đạo",
icon:"🌪️",
color:"#6ce6b8",
conflictWith:["Thổ Đạo","Lực Đạo"],
synergyWith:["Viêm Đạo","Kiếm Đạo"],
desc:"Thân pháp tiêu dật, tốc độ di chuyển và lưỡi gió cắt xé tầm xa."
},
"Thời Gian Đạo":{
id:"thoi_gian_dao",
name:"Thời Gian Đạo",
icon:"⏳",
color:"#f2d16b",
conflictWith:[],
synergyWith:["Không Gian Đạo","Trí Đạo"],
desc:"Chi phối dòng chảy Quang Âm Trường Hà, giảm thời gian hồi chiêu và điều tiết nhịp độ Tiên Khiếu."
},
"Không Gian Đạo":{
id:"khong_gian_dao",
name:"Không Gian Đạo",
icon:"🌀",
color:"#9b72cf",
conflictWith:[],
synergyWith:["Thời Gian Đạo"],
desc:"Xuyên toa hư không, mở rộng diện tích Phúc Địa Động Thiên."
},
"Luyện Đạo":{
id:"luyen_dao",
name:"Luyện Đạo",
icon:"⚗️",
color:"#e6a84c",
conflictWith:[],
synergyWith:["Trí Đạo","Viêm Đạo","Băng Đạo"],
desc:"Tinh thông hỏa pháp và băng pháp luyện cổ, tăng mạnh tỷ lệ thành công khi Hợp Luyện."
},
"Vận Đạo":{
id:"van_dao",
name:"Vận Đạo",
icon:"🎲",
color:"#ffd700",
conflictWith:[],
synergyWith:["Trí Đạo"],
desc:"Do Cự Dương Tiên Tôn sáng lập. Tăng khí vận bản thân, tăng tỷ lệ bạo kích và thành công luyện cổ."
},
"Âm Đạo":{
id:"am_thanh_dao",
name:"Âm Đạo",
icon:"🔔",
color:"#76d7c4",
conflictWith:[],
synergyWith:["Phong Đạo","Hồn Đạo"],
desc:"Sóng âm vô hình xuyên thấu phòng ngự và hỗ trợ trinh sát."
},
"Quang Đạo":{
id:"quang_dao",
name:"Quang Đạo",
icon:"☀️",
color:"#fff2a6",
conflictWith:["Ám Đạo","Hồn Đạo","Huyết Đạo"],
synergyWith:["Viêm Đạo"],
desc:"Tốc độ cực nhanh như cực quang, khắc chế Hồn Đạo và Ám Đạo."
},
"Ám Đạo":{
id:"am_dao",
name:"Ám Đạo",
icon:"🌑",
color:"#5d6d7e",
conflictWith:["Quang Đạo"],
synergyWith:["Hồn Đạo","Độc Đạo"],
desc:"Ẩn tàng khí tức, đánh lén chí mạng và ăn mòn hộ thuẫn."
},
"Kim Đạo":{
id:"kim_dao",
name:"Kim Đạo",
icon:"🛡️",
color:"#d4af37",
conflictWith:["Mộc Đạo","Viêm Đạo"],
synergyWith:["Kiếm Đạo","Thổ Đạo"],
desc:"Cường hóa nhục thân đồng bì thiết cốt, công phạt sắc bén."
},
"Thổ Đạo":{
id:"tho_dao",
name:"Thổ Đạo",
icon:"⛰️",
color:"#b8860b",
conflictWith:["Phong Đạo","Kiếm Đạo"],
synergyWith:["Lực Đạo","Kim Đạo"],
desc:"Phòng ngự hậu trọng như sơn nhạc, củng cố Địa Khí Tiên Khiếu."
},
"Băng Đạo":{
id:"bang_dao",
name:"Băng Đạo",
icon:"❄️",
color:"#85c1e9",
conflictWith:["Viêm Đạo"],
synergyWith:["Thủy Đạo","Luyện Đạo"],
desc:"Đóng băng vạn vật, làm chậm tốc độ di chuyển và xuất chiêu của kẻ địch."
},
"Độc Đạo":{
id:"doc_dao",
name:"Độc Đạo",
icon:"☠️",
color:"#9b59b6",
conflictWith:["Quang Đạo"],
synergyWith:["Ám Đạo","Mộc Đạo"],
desc:"Ăn mòn sinh mệnh theo thời gian, khiến kẻ địch trúng độc suy kiệt mà chết."
}
};
const ITEM_DATABASE={
primeval_stone:{
id:"primeval_stone",
name:"Nguyên Thạch",
icon:"💎",
category:"currency",
rarity:"common",
value:1,
desc:"Đá ngưng tụ nguyên khí thiên địa. Tiền tệ giao dịch của Cổ Sư và dùng để khôi phục nhanh Chân Nguyên."
},
immortal_stone:{
id:"immortal_stone",
name:"Tiên Nguyên Thạch",
icon:"🌟",
category:"immortal_material",
rarity:"legendary",
value:1000,
desc:"Tiền tệ tối cao do Thiên Đình phát hành hoặc giao dịch trên Bảo Hoàng Thiên. Sử dụng giúp luyện hóa ngay thành +5 viên Tiên Nguyên đúng cảnh giới hiện tại."
},
remnant_recipe:{
id:"remnant_recipe",
name:"Cổ Phương Tàn Quyển",
icon:"📜",
category:"recipe_scroll",
rarity:"rare",
value:65,
desc:"Mảnh da thú cổ xưa ghi chép tàn phương hợp luyện cổ. Mở tab [Luyện Đạo Các] để giải mã và lĩnh ngộ Bí Phương mới."
},
bronze_relic_gu:{
id:"bronze_relic_gu",
name:"Thanh Đồng Xá Lợi Cổ",
icon:"🟢",
category:"relic_gu",
targetRank:1,
rarity:"rare",
value:120,
desc:"Cổ trùng tiêu hao quý giá cho Cổ Sư Nhất Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới!"
},
red_iron_relic_gu:{
id:"red_iron_relic_gu",
name:"Xích Thiết Xá Lợi Cổ",
icon:"🔴",
category:"relic_gu",
targetRank:2,
rarity:"rare",
value:350,
desc:"Cổ trùng tiêu hao vô giá cho Cổ Sư Nhị Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới!"
},
white_silver_relic_gu:{
id:"white_silver_relic_gu",
name:"Bạch Ngân Xá Lợi Cổ",
icon:"⚪",
category:"relic_gu",
targetRank:3,
rarity:"epic",
value:950,
desc:"Bảo vật cầu mà không được của Cổ Sư Tam Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới!"
},
yellow_gold_relic_gu:{
id:"yellow_gold_relic_gu",
name:"Hoàng Kim Xá Lợi Cổ",
icon:"🟡",
category:"relic_gu",
targetRank:4,
rarity:"epic",
value:2600,
desc:"Chí bảo của Cổ Sư Tứ Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới mà không tốn hàng năm trời khổ tu!"
},
purple_crystal_relic_gu:{
id:"purple_crystal_relic_gu",
name:"Tử Tinh Xá Lợi Cổ",
icon:"🟣",
category:"relic_gu",
targetRank:5,
rarity:"legendary",
value:6800,
desc:"Thần vật phàm trần dành cho Cổ Sư Ngũ Chuyển. Sử dụng giúp Khiếu Bích lập tức tấn thăng 1 tiểu cảnh giới tiến thẳng Đỉnh Phong!"
},
ration_meat:{
id:"ration_meat",
name:"Thịt Thú Rừng Tươi",
icon:"🍖",
category:"food",
rarity:"common",
value:4,
hpRestore:25,
staminaRestore:40,
desc:"Thức ăn nuôi Hắc Thỉ Cổ, Toàn Lực Dĩ Phó Cổ và khôi phục 25 Sinh Mệnh cho Cổ Sư."
},
spirit_herb:{
id:"spirit_herb",
name:"Thanh Linh Thảo",
icon:"🌿",
category:"herb",
rarity:"common",
value:6,
hpRestore:40,
mentalRestore:20,
desc:"Linh thảo trị thương hồi 40 Sinh Mệnh & 20 Tinh Thần Lực. Thức ăn của cổ trùng Mộc Đạo và Tửu Trùng."
},
moon_orchid:{
id:"moon_orchid",
name:"Nguyệt Lan Hoa",
icon:"🌸",
category:"herb",
rarity:"uncommon",
value:10,
mentalRestore:35,
desc:"Cánh hoa mọc trên núi Thanh Mao. Thức ăn bắt buộc của dòng Nguyệt Quang Cổ và nguyên liệu hợp luyện Nguyệt Toàn Cổ."
},
bronze_ore:{
id:"bronze_ore",
name:"Thanh Đồng Thạch Khoáng",
icon:"🪨",
category:"ore",
rarity:"common",
value:8,
desc:"Khoáng thạch đồng xanh dùng để nuôi dưỡng Đồng Bì Cổ và làm cổ tài hợp luyện."
},
red_iron_ore:{
id:"red_iron_ore",
name:"Xích Thiết Tinh Khoáng",
icon:"🧱",
category:"ore",
rarity:"uncommon",
value:20,
desc:"Tinh thiết đỏ rực chứa đạo ngân Kim/Viêm. Cổ tài trọng yếu để hợp luyện cổ trùng Nhị và Tam Chuyển."
},
beast_blood_core:{
id:"beast_blood_core",
name:"Bách Thú Tinh Huyết",
icon:"🩸",
category:"material",
rarity:"uncommon",
value:18,
hpRestore:50,
desc:"Máu tim của Bách Thú Vương. Thức ăn nuôi dưỡng cổ trùng Huyết Đạo và phụ liệu hợp luyện cổ công kích."
},
wind_essence_crystal:{
id:"wind_essence_crystal",
name:"Phong Tuyền Tinh Thạch",
icon:"🎐",
category:"material",
rarity:"uncommon",
value:22,
desc:"Kết tinh của gió lốc trên đỉnh núi. Dùng nuôi dưỡng và hợp luyện Phong Nhận Cổ, Thanh Phong Luân Cổ."
},
jade_bone:{
id:"jade_bone",
name:"Bạch Ngọc Cốt Tủy",
icon:"🦴",
category:"material",
rarity:"rare",
value:32,
desc:"Cốt tủy thu thập từ Bạch Cốt Sơn. Nguyên liệu cốt lõi để hợp luyện Lao Toàn Cốt Thương Cổ và Bạch Ngọc Cổ."
},
hundred_year_ginseng:{
id:"hundred_year_ginseng",
name:"Bách Niên Khổ Sâm",
icon:"🥕",
category:"herb",
rarity:"rare",
value:45,
hpRestore:90,
mentalRestore:45,
desc:"Nhân sâm trăm năm tuổi. Vừa đại bổ Sinh Mệnh & Tinh Thần, vừa là nguyên liệu hợp luyện Thiên Nguyên Bảo Liên."
},
soul_crystal:{
id:"soul_crystal",
name:"Đãng Hồn Thạch Đan",
icon:"🔮",
category:"material",
rarity:"epic",
value:60,
mentalRestore:85,
desc:"Mảnh đá rơi ra từ Đãng Hồn Sơn. Khôi phục tới 85 Tinh Thần Lực để thăm dò Mộng Cảnh và hợp luyện cổ Tứ Chuyển."
},
am_duong_chuyen_than_gu:{
id:"am_duong_chuyen_than_gu",
name:"Âm Dương Chuyển Thân Cổ",
icon:"☯️",
category:"physique_gu",
rarity:"epic",
value:280,
desc:"[Chuẩn Nguyên Tác — Cứu Mệnh Thập Tuyệt Thể] Chuyển đổi Âm Dương nhục thân: Phong ấn Thập Tuyệt Thể xuống Giáp Đẳng (90% Biển Nguyên), reset áp lực về 0% & NGỪNG HOÀN TOÀN bạo tạc! Dùng thêm 1 con nữa khi muốn giải phong ấn khôi phục 100% Thập Tuyệt Thể để Thăng Tiên."
},
thach_khieu_gu:{
id:"thach_khieu_gu",
name:"Thạch Khiếu Cổ",
icon:"🪨",
category:"physique_gu",
rarity:"rare",
value:95,
desc:"[Cứu Mệnh Thập Tuyệt Thể] Gia cố Khiếu Bích bằng thạch mạch: Xả ngay -50% áp lực Không Khiếu mà vẫn giữ nguyên 100% Biển Nguyên Thập Tuyệt Thể!"
},
tinh_khieu_dinh_nguyen_gu:{
id:"tinh_khieu_dinh_nguyen_gu",
name:"Định Nguyên Tịnh Khiếu Cổ",
icon:"⏳",
category:"physique_gu",
rarity:"rare",
value:140,
desc:"[Trụ Đạo — Cứu Mệnh Thập Tuyệt Thể] Xả ngay -25% áp lực và ĐÓNG BĂNG hoàn toàn tốc độ tăng áp lực Không Khiếu trong 300 giây (5 phút)!"
},
no_le_gu_r1:{
id:"no_le_gu_r1",
name:"Nhất Chuyển Nô Thú Cổ",
icon:"⛓️",
category:"enslave_gu",
rarity:"common",
value:35,
desc:"Phàm cổ Nô Đạo Nhất Chuyển. Bấm [H] trên chiến trường để thu phục Dã Thú 1–2 Chuyển vào Thú Quyển Không Khiếu!"
},
no_le_gu_r2:{
id:"no_le_gu_r2",
name:"Nhị Chuyển Nô Thú Cổ",
icon:"⛓️",
category:"enslave_gu",
rarity:"uncommon",
value:110,
desc:"Phàm cổ Nô Đạo Nhị Chuyển. Dùng phím [H] thu phục Dị Thú & Bách Thú Vương (1–3 Chuyển) vào Thú Quyển!"
},
no_le_gu_r3:{
id:"no_le_gu_r3",
name:"Tam Chuyển Nô Thú Cổ",
icon:"⛓️",
category:"enslave_gu",
rarity:"rare",
value:340,
desc:"Phàm cổ Nô Đạo Tam Chuyển. Dùng phím [H] thu phục Thiên Thú Vương (1–5 Chuyển) với tỷ lệ cao!"
},
no_le_gu_r4:{
id:"no_le_gu_r4",
name:"Tứ Chuyển Nô Thú Cổ",
icon:"⛓️",
category:"enslave_gu",
rarity:"epic",
value:1100,
desc:"Phàm cổ Nô Đạo Tứ Chuyển. Dùng phím [H] thu phục Vạn Thú Vương & Hoang Thú tới Thất Chuyển!"
},
no_le_gu_r5:{
id:"no_le_gu_r5",
name:"Ngũ Chuyển Nô Lệ Cổ",
icon:"⛓️",
category:"enslave_gu",
rarity:"legendary",
value:3500,
desc:"Chí bảo Nô Đạo Ngũ Chuyển. Dùng phím [H] thu phục Thú Hoàng & Thái Cổ Hoang Thú tới Cửu Chuyển!"
}
};
const DREAM_REALMS=[
{
id:"dream_co_nguyet",
name:"Mộng Cảnh Cổ Nguyệt Nhất Thế",
paths:["Huyết Đạo","Quang Đạo"],
reqRank:1,
mentalCost:25,
daoMarksReward:15,
humanQiReward:8,
desc:"Tái hiện cảnh tượng tổ tiên Cổ Nguyệt Nhất Thế sáng lập sơn trại và tu luyện Huyết Đạo trong huyết hồ."
},
{
id:"dream_bach_cot",
name:"Mộng Cảnh Hôi Cốt Tài Tuấn",
paths:["Kim Đạo","Luyện Đạo"],
reqRank:2,
mentalCost:35,
daoMarksReward:24,
humanQiReward:12,
desc:"Diễn hóa quá trình Hôi Cốt Tài Tuấn nghiên cứu Cốt Đạo và bố trí truyền thừa trên Bạch Cốt Sơn."
},
{
id:"dream_tam_vuong",
name:"Mộng Cảnh Tam Vương Sơn",
paths:["Luyện Đạo","Nô Đạo","Viêm Đạo"],
reqRank:3,
mentalCost:45,
daoMarksReward:38,
humanQiReward:18,
desc:"Hồi ức của Bạo Vương, Khuyển Vương và Tín Vương khi đồng tâm hiệp lực luyện cổ và khống chế vạn thú."
},
{
id:"dream_chan_duong",
name:"Mộng Cảnh Cự Dương Tiên Tôn",
paths:["Vận Đạo","Huyết Đạo"],
reqRank:4,
mentalCost:60,
daoMarksReward:60,
humanQiReward:30,
desc:"Một tia chân ý sót lại trong Bát Thập Bát Giác Chân Dương Lâu, ẩn chứa huyền cơ của Vận Đạo."
},
{
id:"dream_tinh_tu",
name:"Mộng Cảnh Tinh Tú Tiên Tôn",
paths:["Trí Đạo"],
reqRank:4,
mentalCost:65,
daoMarksReward:70,
humanQiReward:35,
desc:"Tinh Tượng Kỳ Cục biến hóa khôn lường. Vượt qua sẽ giúp cảnh giới Trí Đạo tăng vọt."
},
{
id:"dream_hong_lien",
name:"Mộng Cảnh Hồng Liên Ma Tôn",
paths:["Thời Gian Đạo","Quang Đạo"],
reqRank:5,
mentalCost:75,
daoMarksReward:105,
humanQiReward:50,
desc:"Nhập vai Hồng Liên Ma Tôn giữa Quang Âm Trường Hà, dùng Xuân Thu Thiền & Quang Âm Nghịch Chuyển đánh nát Ý Chí Túc Mệnh!"
},
{
id:"dream_nguyen_lien",
name:"Mộng Cảnh Nguyên Liên Tiên Tôn",
paths:["Mộc Đạo","Thời Gian Đạo"],
reqRank:5,
mentalCost:75,
daoMarksReward:95,
humanQiReward:45,
desc:"Chân ý của bậc Tôn Giả giàu có nhất lịch sử, khai mở đại đạo kinh doanh Tiên Khiếu và Xuân Thu Thiền."
},
{
id:"dream_u_hon",
name:"Mộng Cảnh U Hồn Ma Tôn",
paths:["Hồn Đạo","Kiếm Đạo","Ám Đạo"],
reqRank:5,
mentalCost:85,
daoMarksReward:120,
humanQiReward:60,
desc:"Sát tính ngập trời nơi Sinh Tử Môn! Kẻ tâm chí yếu ớt sẽ bị thương tổn hồn phách, kẻ vượt qua sẽ đắc đạo Tông Sư."
},
{
id:"dream_tien_canh_cuong_man",
name:"Tiên Mộng: Cuồng Man Ma Tôn Đạo Ý",
paths:["Lực Đạo","Biến Hóa","Huyết Đạo","Kiếm Đạo"],
reqRank:6,
mentalCost:110,
daoMarksReward:950,
humanQiReward:85,
useMainPath:true,
desc:"[Lục Chuyển+] Chân ý Cuồng Man lưu lại nơi Bắc Nguyên, trực tiếp bồi đắp Đạo Ngân cho lưu phái chính của ngươi!"
},
{
id:"dream_vo_cuc_hon_don",
name:"Tôn Giả Mộng: Vô Cực Thiên Địa Chân Ý",
paths:["Trí Đạo","Luyện Đạo"],
reqRank:8,
mentalCost:150,
daoMarksReward:6500,
humanQiReward:130,
useMainPath:true,
desc:"[Bát Chuyển / Á Tiên Tôn] Mộng cảnh Tôn Giả tại Phong Ma Quật, giúp tích lũy lượng lớn Đạo Ngân lưu phái chính hướng tới mốc 30 Vạn Đạo Ngân Thành Tôn!"
}
];

const DAO_PATH_PASSIVES={
"Lực Đạo":      {hp:2.0, atk:0.46,def:0.12,spd:0.0, mental:0.0, crit:0.0,   cdRed:0.0,  lifesteal:0.0,  label:"+HP mạnh, +ATK mạnh"},
"Kim Đạo":      {hp:0.7, atk:0.28,def:0.42,spd:0.0, mental:0.0, crit:0.0,   cdRed:0.0,  lifesteal:0.0,  label:"+DEF cực cao, +ATK"},
"Thổ Đạo":      {hp:1.8, atk:0.12,def:0.40,spd:0.0, mental:0.0, crit:0.0,   cdRed:0.0,  lifesteal:0.0,  label:"+HP cao, +DEF bền bỉ"},
"Hồn Đạo":      {hp:0.5, atk:0.26,def:0.10,spd:0.0, mental:0.42,crit:0.0,   cdRed:0.0,  lifesteal:0.0,  label:"+Tinh Thần cực lớn, +ATK"},
"Phong Đạo":    {hp:0.4, atk:0.24,def:0.08,spd:0.14,mental:0.0, crit:0.0008,cdRed:0.0,  lifesteal:0.0,  label:"+SPD vượt trội, +Bạo Kích"},
"Kiếm Đạo":     {hp:0.4, atk:0.50,def:0.06,spd:0.04,mental:0.0, crit:0.0014,cdRed:0.0,  lifesteal:0.0,  label:"+ATK sắc bén nhất, +Bạo Kích"},
"Huyết Đạo":    {hp:1.5, atk:0.32,def:0.06,spd:0.0, mental:0.0, crit:0.0,   cdRed:0.0,  lifesteal:0.0005,label:"+HP cao, +Hút Máu nội tại"},
"Viêm Đạo":     {hp:0.5, atk:0.46,def:0.06,spd:0.02,mental:0.0, crit:0.0010,cdRed:0.0,  lifesteal:0.0,  label:"+ATK bùng nổ, +Bạo Kích"},
"Thủy Đạo":     {hp:1.3, atk:0.22,def:0.24,spd:0.04,mental:0.18,crit:0.0,   cdRed:0.0,  lifesteal:0.0,  label:"+HP/DEF cân bằng, +Tinh Thần"},
"Băng Đạo":     {hp:0.9, atk:0.28,def:0.30,spd:0.0, mental:0.14,crit:0.0006,cdRed:0.0,  lifesteal:0.0,  label:"+DEF cao, +Khống chế & Bạo Kích"},
"Mộc Đạo":      {hp:2.1, atk:0.18,def:0.20,spd:0.0, mental:0.16,crit:0.0,   cdRed:0.0,  lifesteal:0.0003,label:"+HP cao nhất, +Hồi phục sinh cơ"},
"Độc Đạo":      {hp:0.8, atk:0.36,def:0.10,spd:0.03,mental:0.12,crit:0.0008,cdRed:0.0,  lifesteal:0.0002,label:"+ATK xuyên ăn mòn, +Hút Máu nhẹ"},
"Trí Đạo":      {hp:0.4, atk:0.22,def:0.10,spd:0.02,mental:0.44,crit:0.0008,cdRed:0.0010,lifesteal:0.0, label:"+Tinh Thần tối đa, -Hồi Chiêu"},
"Nô Đạo":       {hp:1.2, atk:0.20,def:0.22,spd:0.04,mental:0.34,crit:0.0,   cdRed:0.0,  lifesteal:0.0,  label:"+Tinh Thần & HP giữ trận, +Uy lực Thú Triều"},
"Luyện Đạo":    {hp:0.8, atk:0.24,def:0.18,spd:0.0, mental:0.30,crit:0.0006,cdRed:0.0006,lifesteal:0.0, label:"+Tỷ lệ Luyện Cổ, +Tinh Thần & DEF"},
"Thời Gian Đạo":{hp:0.6, atk:0.26,def:0.12,spd:0.08,mental:0.20,crit:0.0,   cdRed:0.0016,lifesteal:0.0, label:"-Hồi Chiêu mạnh nhất, +SPD"},
"Không Gian Đạo":{hp:0.6,atk:0.28,def:0.12,spd:0.13,mental:0.16,crit:0.0008,cdRed:0.0008,lifesteal:0.0, label:"+SPD/Tầm nhìn cực cao, -Hồi Chiêu"},
"Vận Đạo":      {hp:0.8, atk:0.24,def:0.14,spd:0.04,mental:0.14,crit:0.0022,cdRed:0.0,  lifesteal:0.0,  label:"+Bạo Kích cực cao & May mắn Đổ Thạch/Luyện Cổ"},
"Quang Đạo":    {hp:0.6, atk:0.38,def:0.10,spd:0.06,mental:0.14,crit:0.0012,cdRed:0.0,  lifesteal:0.0,  label:"+ATK Quang năng, +SPD & Bạo Kích"},
"Ám Đạo":       {hp:0.5, atk:0.40,def:0.06,spd:0.10,mental:0.10,crit:0.0016,cdRed:0.0,  lifesteal:0.0002,label:"+Sát thủ Bạo Kích & SPD cao"},
"Âm Đạo":       {hp:0.6, atk:0.34,def:0.12,spd:0.05,mental:0.28,crit:0.0008,cdRed:0.0006,lifesteal:0.0, label:"+ATK Xuyên Giáp & Tinh Thần"}
};

global.VanCoPlayerData={CHARACTER_SKINS,FIVE_REGIONS,FACTION_ORIGINS,DAO_PATHS,DAO_PATH_PASSIVES,ITEM_DATABASE,DREAM_REALMS};
})(window);
