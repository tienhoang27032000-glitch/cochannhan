(function (global) {
"use strict";
const STAGE_CATALOG=[
{
id:"story_tam_vuong_dinh_tien_du",
order:0,
isStoryStage:true,
noBoss:true,
name:"📖 Cốt Truyện: Tam Vương Truyền Thừa — Luyện Định Tiên Du",
icon:"🦋",
regionName:"Nam Cương (Tam Vương Phúc Địa)",
reqRank:4,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(56, 232, 168, 0.16)",
arenaBorderColor:"#38e8a8",
mobTemplateId:"green_wolf",
mobName:"Không Farm Quái (Màn Luyện Cổ Cốt Truyện)",
mobIsHuman:false,
targetKills:0,
bossTemplateId:null,
bossName:"Thử Thách Luyện Chế Lục Chuyển Định Tiên Du",
bossIsHuman:false,
rewardStones:250,
rewardMerit:150,
rewardHumanQi:120,
dropPreview:"🦋 Định Tiên Du Tiên Cổ Lục Chuyển (Lần đầu) + 250–350💎 + 140 Nhân Khí + 180 Cống Hiến + 2 Tàn Phương + 180 EXP Luyện Cổ",
drops:[],
description:"[Trọn Bộ Kiến Trúc Đa Thế Giới — 5 Phần • 7 Thế Giới Mặt Đất & Không Gian Trên Cao — Chỉ Mở Từ Tứ Chuyển] Không farm quái, không dồn bản đồ! Mỗi khu vực là một Thế Giới Độc Lập rộng rãi dựng công trình tỉ mỉ, nạp riêng khi Địa Linh Bá Quy truyền tống, với 28 nhân vật tách riêng hoàn toàn & Khóa Di Chuyển Thông Minh trong cắt cảnh! Phần 1–2: Thanh Đồng Đại Điện, Độc Mù Trúc Lâm, Rừng Đá Khuyển Vương, Hoang Nguyên Bạo Vương, Cổ Tự Tín Vương (hạ Long Thanh Thiên, Chương Tam Tam, thu phục Cừu Cửu, đoạt Cổ Bích Không, Cổ Nô Lệ 5C & Cổ Trăm Trận Trăm Thắng). Phần 3: Chiến Trường Ngoại Vi Tam Xoa Sơn & Luyện Bán Thành Phẩm Cổ Không Khiếu Thứ Hai. Phần 4: Bóc trần Bạch Ngưng Băng & Không Gian Trên Cao Thiên Bộc Quang Hà luyện Lục Chuyển Tiên Cổ ĐỊNH TIÊN DU. Phần 5 (Đại Kết Cục): Ngâm 4 câu thơ bất hủ, vượt Gió Đại Đồng giáng lâm Thế Giới 7: Đỉnh Núi Đãng Hồn & Đãng Hồn Cung (Phúc Địa Hồ Tiên) thu phục Tiểu Hồ Tiên và nhận vĩnh viễn Định Tiên Du Tiên Cổ Lục Chuyển!"
},
{
id:"stage_1",
order:1,
name:"Ải 1: Sườn Núi Thanh Mao",
icon:"🎋",
regionName:"Nam Cương",
reqRank:1,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(25, 85, 55, 0.14)",
arenaBorderColor:"#4cd964",
mobTemplateId:"green_wolf",
mobName:"Thanh Mao Điện Lang",
mobIsHuman:false,
mobPool:[
{
name:"Thanh Mao Điện Lang",
templateId:"green_wolf",
isHuman:false,
color:"#3b6e52"
},
{
name:"Hào Điện Lang",
templateId:"green_wolf",
isHuman:false,
color:"#4ca885",
spdScale:1.12
}
],
eliteName:"Bạch Nhãn Điện Lang",
targetKills:8,
bossTemplateId:"thunder_wolf_king",
bossName:"Thanh Mao Điện Lang Vương",
bossRankBadge:"1 Chuyển • Bách Thú Vương",
bossPowerScale:0.95,
bossIsHuman:false,
rewardStones:6,
rewardMerit:5,
rewardHumanQi:2,
dropPreview:"Nguyệt Lan Hoa (45%), Thanh Linh Thảo (45%), Thịt Thú Rừng (50%)",
drops:[
{
itemId:"moon_orchid",
count:1,
chance:0.45
},
{
itemId:"spirit_herb",
count:1,
chance:0.45
},
{
itemId:"ration_meat",
count:1,
chance:0.5
}
],
description:"Rừng trúc rộng lớn dưới chân Cổ Nguyệt Sơn Trại. Đàn Thanh Mao Điện Lang và Hào Điện Lang rải rác khắp sườn núi do Thanh Mao Điện Lang Vương dẫn đầu."
},
{
id:"stage_2",
order:2,
name:"Ải 2: Mật Động Hoa Tửu Hành Giả",
icon:"🍶",
regionName:"Nam Cương",
reqRank:1,
prevStageId:"stage_1",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(95, 65, 20, 0.18)",
arenaBorderColor:"#f7c948",
mobTemplateId:"iron_boar",
mobName:"Thiết Bì Dã Trư",
mobIsHuman:false,
mobPool:[
{
name:"Thiết Bì Dã Trư",
templateId:"iron_boar",
isHuman:false,
color:"#6e655f"
},
{
name:"Thạch Động Hầu Yêu",
templateId:"wine_ape_king",
isHuman:false,
color:"#a85232"
}
],
eliteName:"Hùng Lực Thiết Trư",
targetKills:9,
bossTemplateId:"wine_ape_king",
bossName:"Xích Nhãn Tửu Viên Vương",
bossRankBadge:"1 Chuyển • Hung Thú",
bossPowerScale:1.0,
bossIsHuman:false,
rewardStones:9,
rewardMerit:7,
rewardHumanQi:3,
dropPreview:"Thanh Đồng Khoáng (45%), Cổ Phương Tàn Quyển (12%), Thanh Đồng Xá Lợi Cổ (1%)",
drops:[
{
itemId:"bronze_ore",
count:1,
chance:0.45
},
{
itemId:"remnant_recipe",
count:1,
chance:0.12
},
{
itemId:"bronze_relic_gu",
count:1,
chance:0.01
}
],
description:"Hang đá ngầm nơi Ma Đạo Hoa Tửu Hành Giả từng lưu lại di chỉ Tửu Trùng, bị bầy Thiết Bì Dã Trư và Thạch Động Hầu Yêu chiếm cứ."
},
{
id:"stage_3",
order:3,
name:"Ải 3: Địa Đạo Huyết Hồ Cổ Nguyệt",
icon:"🩸",
regionName:"Nam Cương",
reqRank:1,
prevStageId:"stage_2",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(130, 15, 25, 0.24)",
arenaBorderColor:"#e03e3e",
mobTemplateId:"blood_bat_king",
mobName:"Thiết Đao Sí Huyết Bức",
mobIsHuman:false,
mobPool:[
{
name:"Thiết Đao Sí Huyết Bức",
templateId:"blood_bat_king",
isHuman:false,
color:"#b82828"
},
{
name:"Huyết Trì Bạch Cốt Xà",
templateId:"frost_python_lord",
isHuman:false,
color:"#c93838"
}
],
eliteName:"Huyết Dực Biên Bức Vương",
targetKills:10,
bossTemplateId:"blood_bat_king",
bossName:"Huyết Thi Cổ Sư",
bossRankBadge:"1 Chuyển Đỉnh Phong",
bossPowerScale:1.08,
bossIsHuman:true,
bossSkinKey:"u_hon",
bossKillerMove:"Huyết Lãng Thôn Phệ Sát",
bossAttackGu:"Huyết Nguyệt Cổ Nhất Chuyển",
bossDefGu:"Huyết Thuẫn Cổ",
rewardStones:13,
rewardMerit:10,
rewardHumanQi:4,
dropPreview:"Bách Thú Tinh Huyết (45%), Cổ Phương Tàn Quyển (14%), Thanh Đồng Xá Lợi Cổ (1%)",
drops:[
{
itemId:"beast_blood_core",
count:1,
chance:0.45
},
{
itemId:"remnant_recipe",
count:1,
chance:0.14
},
{
itemId:"bronze_relic_gu",
count:1,
chance:0.01
}
],
description:"Hồ máu bí mật sâu dưới lòng đất sơn trại. Thủ lĩnh Huyết Thi Cổ Sư biết thúc giục Huyết Nguyệt Cổ và Huyết Đạo Sát Chiêu."
},
{
id:"stage_4",
order:4,
name:"Ải 4: Huyết Lang Triều Thanh Mao Sơn",
icon:"🐺",
regionName:"Nam Cương",
reqRank:2,
prevStageId:"stage_3",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(35, 70, 95, 0.20)",
arenaBorderColor:"#5aa9e6",
mobTemplateId:"green_wolf",
mobName:"Cuồng Điện Lang",
mobIsHuman:false,
mobPool:[
{
name:"Cuồng Điện Lang",
templateId:"green_wolf",
isHuman:false,
color:"#4588a8"
},
{
name:"Huyết Nhãn Điện Lang",
templateId:"thunder_wolf_king",
isHuman:false,
color:"#5aa9e6"
}
],
eliteName:"Bách Thú Điện Lang",
targetKills:10,
bossTemplateId:"thunder_wolf_king",
bossName:"Lôi Quan Đầu Lang",
bossRankBadge:"2 Chuyển • Bách Thú Vương",
bossPowerScale:1.0,
bossIsHuman:false,
rewardStones:18,
rewardMerit:14,
rewardHumanQi:5,
dropPreview:"Phong Tuyền Tinh Thạch (45%), Xích Thiết Tinh Khoáng (42%)",
drops:[
{
itemId:"wind_essence_crystal",
count:1,
chance:0.45
},
{
itemId:"red_iron_ore",
count:1,
chance:0.42
}
],
description:"Lang triều quy mô lớn bao vây ba sơn trại trên đỉnh Thanh Mao Sơn! Cần thăng Cổ Trùng lên Nhị Chuyển để phá giáp đàn Cuồng Điện Lang."
},
{
id:"stage_5",
order:5,
name:"Ải 5: Bạch Cốt Sơn — Cung Điện Xương",
icon:"🦴",
regionName:"Nam Cương",
reqRank:2,
prevStageId:"stage_4",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(210, 220, 235, 0.16)",
arenaBorderColor:"#dce8f2",
mobTemplateId:"iron_boar",
mobName:"Bạch Cốt Khôi Lỗi Thú",
mobIsHuman:false,
mobPool:[
{
name:"Bạch Cốt Khôi Lỗi Thú",
templateId:"iron_boar",
isHuman:false,
color:"#dce8f2"
},
{
name:"Bạch Cốt Đao Binh",
templateId:"iron_boar",
isHuman:true,
skinKey:"bach_ngung_bang",
color:"#cfd8dc"
}
],
eliteName:"Bạch Cốt Thống Lĩnh",
targetKills:11,
bossTemplateId:"frost_python_lord",
bossName:"Bạch Cốt Thủ Điện",
bossRankBadge:"2 Chuyển • Hộ Điện",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"bach_ngung_bang",
bossKillerMove:"Vạn Cốt Phi Thương Trận",
bossAttackGu:"Lao Toàn Cốt Thương Cổ Nhị Chuyển",
bossDefGu:"Bạch Ngọc Cổ Nhị Chuyển",
rewardStones:24,
rewardMerit:18,
rewardHumanQi:6,
dropPreview:"Bạch Ngọc Cốt Tủy (50%), Cổ Phương Tàn Quyển (14%), Xích Thiết Xá Lợi Cổ (1%)",
drops:[
{
itemId:"jade_bone",
count:1,
chance:0.5
},
{
itemId:"remnant_recipe",
count:1,
chance:0.14
},
{
itemId:"red_iron_relic_gu",
count:1,
chance:0.01
}
],
description:"Ngọn núi toàn xương trắng dựng đứng nơi Hôi Cốt Tài Tuấn để lại truyền thừa Lao Toàn Cốt Thương Cổ và Bạch Ngọc Cổ."
},
{
id:"stage_6",
order:6,
name:"Ải 6: Hoàng Kim Sơn — Đầm Lầy Hủ Độc",
icon:"🌋",
regionName:"Nam Cương",
reqRank:2,
prevStageId:"stage_5",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(140, 45, 15, 0.22)",
arenaBorderColor:"#ff5733",
mobTemplateId:"venom_toad",
mobName:"Hủ Độc Thiềm Thừ",
mobIsHuman:false,
mobPool:[
{
name:"Hủ Độc Thiềm Thừ",
templateId:"venom_toad",
isHuman:false,
color:"#6c3483"
},
{
name:"Đầm Lầy Ngạc Ngư",
templateId:"swamp_croc",
isHuman:false,
color:"#2b6e52"
}
],
eliteName:"Chướng Độc Cự Thiềm",
targetKills:11,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Lục Giao Đầm Lầy",
bossRankBadge:"2 Chuyển Đỉnh Phong • Thú Vương",
bossPowerScale:1.08,
bossIsHuman:false,
bossColor:"#2ecc71",
rewardStones:30,
rewardMerit:22,
rewardHumanQi:7,
dropPreview:"Xích Thiết Tinh Khoáng (50%), Bách Niên Khổ Sâm (28%), Xích Thiết Xá Lợi Cổ (1%)",
drops:[
{
itemId:"red_iron_ore",
count:1,
chance:0.5
},
{
itemId:"hundred_year_ginseng",
count:1,
chance:0.28
},
{
itemId:"red_iron_relic_gu",
count:1,
chance:0.01
}
],
description:"Đầm lầy chướng khí trên hành trình từ Bạch Cốt Sơn tiến về Thương Gia Thành, đầy rẫy Hủ Độc Thiềm Thừ và Đầm Lầy Ngạc Ngư."
},
{
id:"stage_7",
order:7,
name:"Ải 7: Thương Gia Thành — Đấu Vũ Trường",
icon:"🏮",
regionName:"Nam Cương",
reqRank:3,
prevStageId:"stage_6",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(180, 130, 35, 0.16)",
arenaBorderColor:"#f7c948",
mobTemplateId:"wind_falcon",
mobName:"Đấu Vũ Kiếm Khách",
mobIsHuman:true,
mobPool:[
{
name:"Đấu Vũ Kiếm Khách",
templateId:"wind_falcon",
isHuman:true,
skinKey:"phuong_cuu_ca",
color:"#dce8f2"
},
{
name:"Đấu Vũ Lực Sư",
templateId:"iron_boar",
isHuman:true,
skinKey:"hac_lau_lan",
color:"#e07a45"
}
],
eliteName:"Thương Gia Đấu Vũ Cao Thủ",
targetKills:12,
bossTemplateId:"frost_python_lord",
bossName:"Thiết Đao Khổ",
bossRankBadge:"3 Chuyển • Đao Đạo Đấu Vũ",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"hac_lau_lan",
bossKillerMove:"Đao Đạo Sát Chiêu: Đoạn Nhai Cuồng Đao Trảm",
bossAttackGu:"Kim Châm Cổ Tam Chuyển",
bossDefGu:"Bạch Ngọc Cổ Tam Chuyển",
rewardStones:42,
rewardMerit:30,
rewardHumanQi:8,
dropPreview:"Bách Niên Khổ Sâm (42%), Cổ Phương Tàn Quyển (15%), Bạch Ngân Xá Lợi Cổ (1%)",
drops:[
{
itemId:"hundred_year_ginseng",
count:1,
chance:0.42
},
{
itemId:"remnant_recipe",
count:1,
chance:0.15
},
{
itemId:"white_silver_relic_gu",
count:1,
chance:0.01
}
],
description:"Đấu Vũ Trường nội thành Thương Gia! Các đối thủ đều là Cổ Sư Tam Chuyển tinh thông phối hợp Cổ Trùng và Sát Chiêu."
},
{
id:"stage_8",
order:8,
name:"Ải 8: Tam Xoa Sơn — Phong Ma Đỉnh",
icon:"⛰️",
regionName:"Nam Cương",
reqRank:3,
prevStageId:"stage_7",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(55, 110, 145, 0.20)",
arenaBorderColor:"#67b7d1",
mobTemplateId:"thunder_wolf_king",
mobName:"Ma Đạo Tán Tu",
mobIsHuman:true,
mobPool:[
{
name:"Ma Đạo Tán Tu",
templateId:"thunder_wolf_king",
isHuman:true,
skinKey:"u_hon",
color:"#8f6ee6"
},
{
name:"Thiết Gia Tuần Tra Sứ",
templateId:"iron_boar",
isHuman:true,
skinKey:"hac_lau_lan",
color:"#d4af37"
}
],
eliteName:"Tam Xoa Sơn Ma Đầu",
targetKills:12,
bossTemplateId:"ancient_rock_behemoth",
bossName:"Thiết Gia Tứ Lão",
bossRankBadge:"3 Chuyển Đỉnh Phong • Thiết Gia",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"phuong_cuu_ca",
bossKillerMove:"Tứ Lão Hợp Kích: Thiết Tỏa Đại Trận",
bossAttackGu:"Kiếm Ảnh Cổ Tam Chuyển",
bossDefGu:"Bạch Ngọc Cổ Tam Chuyển",
stageBosses:[
{
name:"Thiết Gia Đại Lão",
rankBadge:"3 Chuyển Đỉnh Phong • Kim Đạo",
skinKey:"hac_lau_lan",
projectileColor:"#ffd700",
hpScale:0.42,
attackGuName:"Kim Châm Cổ Tam Chuyển",
defGuName:"Kim Cang Cổ Tam Chuyển",
killerMoveName:"Thiết Tỏa Trấn Sơn Trảm"
},
{
name:"Thiết Gia Nhị Lão",
rankBadge:"3 Chuyển Đỉnh Phong • Kiếm Đạo",
skinKey:"phuong_cuu_ca",
projectileColor:"#7ef7f0",
hpScale:0.42,
attackGuName:"Kiếm Ảnh Cổ Tam Chuyển",
defGuName:"Bạch Ngọc Cổ Tam Chuyển",
killerMoveName:"Tứ Lão Kiếm Quang Trận"
},
{
name:"Thiết Gia Tam Lão",
rankBadge:"3 Chuyển Đỉnh Phong • Thổ Đạo",
skinKey:"phuong_nguyen",
projectileColor:"#e6a84c",
hpScale:0.42,
attackGuName:"Hắc Thạch Cổ Tam Chuyển",
defGuName:"Thổ Long Giáp Cổ Tam Chuyển",
killerMoveName:"Trọng Thạch Khóa Mạch Ấn"
},
{
name:"Thiết Gia Tứ Lão",
rankBadge:"3 Chuyển Đỉnh Phong • Lôi Đạo",
skinKey:"tinh_tu",
projectileColor:"#c56cf0",
hpScale:0.42,
attackGuName:"Cuồng Lôi Cổ Tam Chuyển",
defGuName:"Bạch Ngọc Cổ Tam Chuyển",
killerMoveName:"Lôi Tỏa Phá Ma Kích"
}
],
rewardStones:52,
rewardMerit:38,
rewardHumanQi:9,
dropPreview:"Bách Thú Tinh Huyết (50%), Đãng Hồn Thạch Đan (25%), Bạch Ngân Xá Lợi Cổ (1%)",
drops:[
{
itemId:"beast_blood_core",
count:1,
chance:0.5
},
{
itemId:"soul_crystal",
count:1,
chance:0.25
},
{
itemId:"white_silver_relic_gu",
count:1,
chance:0.01
}
],
description:"Ba ngọn núi hiểm trở nơi Chính Ma lưỡng đạo tụ tập. Phá tan Thiết Tỏa Đại Trận để trực diện giao chiến cùng 4 vị trưởng lão Thiết Gia!"
},
{
id:"stage_9",
order:9,
name:"Ải 9: Vạn Thú Sơn Lĩnh — Nam Cương",
icon:"🦁",
regionName:"Nam Cương",
reqRank:3,
prevStageId:"stage_8",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(95, 50, 20, 0.22)",
arenaBorderColor:"#e67e22",
mobTemplateId:"white_tiger",
mobName:"Bạch Văn Mãnh Hổ",
mobIsHuman:false,
mobPool:[
{
name:"Bạch Văn Mãnh Hổ",
templateId:"white_tiger",
isHuman:false,
color:"#e8eef2"
},
{
name:"Thanh Phong Linh Điêu",
templateId:"wind_falcon",
isHuman:false,
color:"#48a888"
},
{
name:"Thiết Giáp Dã Trư Vương",
templateId:"iron_boar",
isHuman:false,
color:"#7d736b"
}
],
eliteName:"Thiên Thú Mãnh Hổ Vương",
targetKills:12,
bossTemplateId:"frost_python_lord",
bossName:"Hàn Sương Bạch Ngọc Mãng",
bossRankBadge:"3 Chuyển • Thiên Thú Vương",
bossPowerScale:1.08,
bossIsHuman:false,
rewardStones:62,
rewardMerit:45,
rewardHumanQi:10,
dropPreview:"Đãng Hồn Thạch Đan (30%), Bạch Ngân Xá Lợi Cổ (1%)",
drops:[
{
itemId:"soul_crystal",
count:1,
chance:0.3
},
{
itemId:"white_silver_relic_gu",
count:1,
chance:0.01
}
],
description:"Rừng nguyên sinh rậm rạp của Nam Cương, nơi Bạch Văn Mãnh Hổ, Thanh Phong Linh Điêu và Hàn Sương Bạch Ngọc Mãng hùng cứ."
},
{
id:"stage_10",
order:10,
name:"Ải 10: Tam Vương Sơn — Phúc Địa Mở Cửa",
icon:"👑",
regionName:"Nam Cương",
reqRank:4,
prevStageId:"stage_9",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(180, 140, 30, 0.22)",
arenaBorderColor:"#ffd700",
mobTemplateId:"thunder_wolf_king",
mobName:"Thiết Bì Khuyển Vương",
mobIsHuman:false,
mobPool:[
{
name:"Tam Vương Tán Tu",
templateId:"blood_bat_king",
isHuman:true,
skinKey:"phuong_nguyen",
color:"#e07a45"
},
{
name:"Thiết Bì Khuyển Vương",
templateId:"thunder_wolf_king",
isHuman:false,
color:"#b8860b"
}
],
eliteName:"Bạo Hỏa Tán Tu Tứ Chuyển",
targetKills:13,
bossTemplateId:"ancient_rock_behemoth",
bossName:"Thiết Ba Tu",
bossRankBadge:"4 Chuyển Đỉnh Phong • Thiết Gia",
bossPowerScale:1.1,
bossIsHuman:true,
bossSkinKey:"hac_lau_lan",
bossKillerMove:"Kim Đạo Sát Chiêu: Hoàng Kim Khuynh Thành Kích",
bossAttackGu:"Khổ Lực Cổ Tứ Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Tứ Chuyển",
rewardStones:85,
rewardMerit:60,
rewardHumanQi:12,
dropPreview:"Đãng Hồn Thạch Đan (42%), Cổ Phương Tàn Quyển (18%), Hoàng Kim Xá Lợi Cổ (1%)",
drops:[
{
itemId:"soul_crystal",
count:1,
chance:0.42
},
{
itemId:"remnant_recipe",
count:1,
chance:0.18
},
{
itemId:"yellow_gold_relic_gu",
count:1,
chance:0.01
}
],
description:"Đỉnh Tam Vương Sơn nơi Phương Nguyên đại chiến Thiết Ba Tu cùng quần hùng Tứ Chuyển và bầy Khuyển Vương để tranh đoạt Tam Vương Truyền Thừa!"
},
{
id:"stage_11",
order:11,
name:"Ải 11: Sa Mạc Lửa Thiêu — Tây Mạc Thương Đạo",
icon:"🏜️",
regionName:"Tây Mạc",
reqRank:4,
prevStageId:"stage_10",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(175, 110, 25, 0.24)",
arenaBorderColor:"#e6a84c",
mobTemplateId:"fire_scorpion",
mobName:"Sa Mạc Hỏa Hạt",
mobIsHuman:false,
mobPool:[
{
name:"Sa Mạc Hỏa Hạt",
templateId:"fire_scorpion",
isHuman:false,
color:"#d35400"
},
{
name:"Tây Mạc Sa Tặc Cổ Sư",
templateId:"fire_scorpion",
isHuman:true,
skinKey:"hong_lien",
color:"#e67e22"
}
],
eliteName:"Xích Viêm Độc Hạt Vương",
targetKills:13,
bossTemplateId:"ancient_rock_behemoth",
bossName:"Mạc Gia Đại Trưởng Lão",
bossRankBadge:"4 Chuyển • Tây Mạc",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"hong_lien",
bossKillerMove:"Viêm Đạo Sát Chiêu: Xích Long Thiên Hỏa Trận",
bossAttackGu:"Xích Viêm Hỏa Long Cổ Tứ Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Tứ Chuyển",
rewardStones:105,
rewardMerit:72,
rewardHumanQi:14,
dropPreview:"Xích Thiết Tinh Khoáng (55%), Hoàng Kim Xá Lợi Cổ (1%)",
drops:[
{
itemId:"red_iron_ore",
count:2,
chance:0.55
},
{
itemId:"yellow_gold_relic_gu",
count:1,
chance:0.01
}
],
description:"Sa mạc rực lửa Tây Mạc với những bầy Sa Mạc Hỏa Hạt hung hãn cùng các Cổ Sư Sa Tặc bảo vệ ốc đảo linh tuyền."
},
{
id:"stage_12",
order:12,
name:"Ải 12: Thiên Thê Sơn — Quần Hùng Trung Châu",
icon:"🗡️",
regionName:"Trung Châu",
reqRank:4,
prevStageId:"stage_11",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(55, 130, 175, 0.22)",
arenaBorderColor:"#67b7d1",
mobTemplateId:"wind_falcon",
mobName:"Tiên Hạc Môn Đệ Tử",
mobIsHuman:true,
mobPool:[
{
name:"Tiên Hạc Môn Đệ Tử",
templateId:"wind_falcon",
isHuman:true,
skinKey:"bach_ngung_bang",
color:"#85c1e9"
},
{
name:"Linh Duyên Trai Đệ Tử",
templateId:"wind_falcon",
isHuman:true,
skinKey:"thuong_tam_tu",
color:"#7ef7f0"
}
],
eliteName:"Thập Đại Cổ Phái Chấp Sự",
targetKills:14,
bossTemplateId:"ancient_rock_behemoth",
bossName:"Cổ Nguyệt Phương Chính",
bossRankBadge:"4 Chuyển Đỉnh Phong • Cổ Phái",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"phuong_cuu_ca",
bossKillerMove:"Kiếm Đạo Sát Chiêu: Phi Hạc Xuyên Vân Kiếm",
bossAttackGu:"Thiên Phong Kiếm Vũ Cổ Tứ Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Tứ Chuyển",
stageBosses:[
{
name:"Cổ Nguyệt Phương Chính",
rankBadge:"4 Chuyển Đỉnh Phong • Tiên Hạc Môn",
skinKey:"phuong_nguyen",
projectileColor:"#7ef7f0",
hpScale:0.68,
attackGuName:"Thiên Phong Kiếm Vũ Cổ Tứ Chuyển",
defGuName:"Bạch Ngọc Cổ Tứ Chuyển",
killerMoveName:"Tiên Hạc Môn Sát Chiêu: Phi Hạc Đoạt Mệnh Kiếm"
},
{
name:"Tôn Nguyên Hóa",
rankBadge:"4 Chuyển Đỉnh Phong • Linh Duyên Trai",
skinKey:"phuong_cuu_ca",
projectileColor:"#ffd700",
hpScale:0.68,
attackGuName:"Tinh Quang Cổ Tứ Chuyển",
defGuName:"Hoàng Kim Chung Cổ Tứ Chuyển",
killerMoveName:"Quang Đạo Sát Chiêu: Thiên Hà Lưu Tinh Bộc"
}
],
rewardStones:130,
rewardMerit:88,
rewardHumanQi:16,
dropPreview:"Đãng Hồn Thạch Đan (48%), Cổ Phương Tàn Quyển (20%), Hoàng Kim Xá Lợi Cổ (1%)",
drops:[
{
itemId:"soul_crystal",
count:1,
chance:0.48
},
{
itemId:"remnant_recipe",
count:1,
chance:0.2
},
{
itemId:"yellow_gold_relic_gu",
count:1,
chance:0.01
}
],
description:"Chân núi Thiên Thê Sơn Trung Châu, nơi đệ tử Thập Đại Cổ Phái tranh đoạt tư cách leo núi truyền thừa, đối đầu hai thiên kiêu Cổ Nguyệt Phương Chính và Tôn Nguyên Hóa."
},
{
id:"stage_13",
order:13,
name:"Ải 13: Bắc Nguyên Thảo Nguyên — Hoàng Kim Bộ Tộc",
icon:"🌾",
regionName:"Bắc Nguyên",
reqRank:5,
prevStageId:"stage_12",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(95, 125, 45, 0.22)",
arenaBorderColor:"#b89758",
mobTemplateId:"thunder_wolf_king",
mobName:"Bắc Nguyên Lang Vương",
mobIsHuman:false,
mobPool:[
{
name:"Bắc Nguyên Lang Vương",
templateId:"thunder_wolf_king",
isHuman:false,
color:"#5aa9e6"
},
{
name:"Hoàng Kim Bộ Tộc Chiến Sĩ",
templateId:"iron_boar",
isHuman:true,
skinKey:"hac_lau_lan",
color:"#d4af37"
}
],
eliteName:"Lưu Gia Bộ Tộc Tộc Trưởng",
targetKills:14,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Lưu Văn Võ",
bossRankBadge:"5 Chuyển • Bắc Nguyên",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"phuong_cuu_ca",
bossKillerMove:"Ngũ Chuyển Sát Chiêu: Tam Đầu Lục Tí Bá Quyền",
bossAttackGu:"Thái Cổ Giao Long Lực Cổ Ngũ Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Ngũ Chuyển",
stageBosses:[
{
name:"Lưu Văn Võ",
rankBadge:"5 Chuyển • Lưu Gia Thiếu Chủ",
skinKey:"phuong_cuu_ca",
projectileColor:"#ffd700",
hpScale:0.68,
attackGuName:"Thái Cổ Giao Long Lực Cổ Ngũ Chuyển",
defGuName:"Hoàng Kim Chung Cổ Ngũ Chuyển",
killerMoveName:"Ngũ Chuyển Sát Chiêu: Tam Đầu Lục Tí Trấn Thiên"
},
{
name:"Mặc Sư Cuồng",
rankBadge:"5 Chuyển • Cuồng Khí Mãnh Tướng",
skinKey:"hac_lau_lan",
projectileColor:"#6ce6b8",
hpScale:0.68,
attackGuName:"Toàn Phong Cổ Ngũ Chuyển",
defGuName:"Bàn Sơn Lực Cổ Ngũ Chuyển",
killerMoveName:"Ngũ Chuyển Sát Chiêu: Cuồng Khí Phá Quân Trảm"
}
],
rewardStones:175,
rewardMerit:115,
rewardHumanQi:20,
dropPreview:"Tử Tinh Xá Lợi Cổ (1%), Đãng Hồn Thạch Đan (50%)",
drops:[
{
itemId:"purple_crystal_relic_gu",
count:1,
chance:0.01
},
{
itemId:"soul_crystal",
count:1,
chance:0.5
}
],
description:"Thảo nguyên Bắc Nguyên rộng lớn, đối đầu đại quân Hoàng Kim Bộ Tộc và hai vị mãnh tướng Lưu Văn Võ cùng Mặc Sư Cuồng."
},
{
id:"stage_14",
order:14,
name:"Ải 14: Vương Đình Tranh Bá — Đại Chiến Hắc Lâu Lan",
icon:"🔥",
regionName:"Bắc Nguyên",
reqRank:5,
prevStageId:"stage_13",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(165, 35, 35, 0.24)",
arenaBorderColor:"#ff4d4d",
mobTemplateId:"iron_boar",
mobName:"Hắc Gia Đao Thuẫn Vệ",
mobIsHuman:true,
mobPool:[
{
name:"Hắc Gia Đao Thuẫn Vệ",
templateId:"iron_boar",
isHuman:true,
skinKey:"hac_lau_lan",
color:"#e07a45"
},
{
name:"Hắc Gia Lực Đạo Tướng",
templateId:"white_tiger",
isHuman:true,
skinKey:"phuong_nguyen",
color:"#d4af37"
}
],
eliteName:"Hắc Gia Quân Đại Thống Lĩnh",
targetKills:15,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Hắc Lâu Lan",
bossRankBadge:"5 Chuyển Đỉnh Phong • Thập Tuyệt Thể",
bossPowerScale:1.14,
bossIsHuman:true,
bossSkinKey:"hac_lau_lan",
bossKillerMove:"Ngũ Chuyển Sát Chiêu: Đại Lực Chân Vũ Bá Hoàng Quyền",
bossAttackGu:"Thái Cổ Giao Long Lực Cổ Ngũ Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Ngũ Chuyển",
rewardStones:225,
rewardMerit:145,
rewardHumanQi:24,
dropPreview:"Tử Tinh Xá Lợi Cổ (1%), Tiên Nguyên Thạch (12%), Đãng Hồn Thạch Đan (55%)",
drops:[
{
itemId:"purple_crystal_relic_gu",
count:1,
chance:0.01
},
{
itemId:"immortal_stone",
count:1,
chance:0.12
},
{
itemId:"soul_crystal",
count:1,
chance:0.55
}
],
description:"Trận quyết chiến giành ngôi vị Vương Đình Chi Chủ Bắc Nguyên với Hắc Lâu Lan mang Đại Lực Chân Vũ Thể!"
},
{
id:"stage_15",
order:15,
name:"Ải 15: Bát Thập Bát Giác Chân Dương Lâu",
icon:"🏯",
regionName:"Bắc Nguyên (Vương Đình Phúc Địa)",
reqRank:5,
prevStageId:"stage_14",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(215, 165, 35, 0.25)",
arenaBorderColor:"#ffd700",
mobTemplateId:"soul_beast",
mobName:"Thiên Ngoại Thiên Ma",
mobIsHuman:false,
mobPool:[
{
name:"Thiên Ngoại Thiên Ma",
templateId:"soul_beast",
isHuman:false,
color:"#b75cff"
},
{
name:"Chân Dương Hộ Lâu Thú",
templateId:"ancient_rock_behemoth",
isHuman:false,
color:"#ffd700"
}
],
eliteName:"Chân Dương Kim Giáp Lâu Vệ",
targetKills:15,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Tàn Ý Cự Dương",
bossRankBadge:"5 Chuyển Cực Hạn • Chân Dương Lâu",
bossPowerScale:1.18,
bossIsHuman:true,
bossSkinKey:"hong_lien",
bossKillerMove:"Vận Đạo Sát Chiêu: Hoàng Kim Khí Vận Trấn Thiên Địa",
bossAttackGu:"Huyết Hà Đại Trận Cổ Ngũ Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Ngũ Chuyển",
rewardStones:290,
rewardMerit:185,
rewardHumanQi:30,
dropPreview:"Tử Tinh Xá Lợi Cổ (1%), Tiên Nguyên Thạch (25%), Đãng Hồn Thạch Đan (65%)",
drops:[
{
itemId:"purple_crystal_relic_gu",
count:1,
chance:0.01
},
{
itemId:"immortal_stone",
count:1,
chance:0.25
},
{
itemId:"soul_crystal",
count:1,
chance:0.65
}
],
description:"Đánh tan Tàn Ý Cự Dương trấn giữ Bát Thập Bát Giác Chân Dương Lâu trong Vương Đình Phúc Địa để tích lũy đủ 240 Nhân Khí Phá Khiếu Thăng Tiên!"
},
{
id:"stage_16",
order:16,
name:"Ải 16: Hồ Tiên Phúc Địa — Đãng Hồn Sơn Bảo Vệ Chiến",
icon:"🦊",
regionName:"Trung Châu (Lục Chuyển Tiên Cảnh)",
reqRank:6,
prevStageId:"stage_15",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(195, 90, 165, 0.22)",
arenaBorderColor:"#c278ff",
mobTemplateId:"wind_falcon",
mobName:"Cửu Cung Phi Hạc",
mobIsHuman:false,
mobPool:[
{
name:"Cửu Cung Phi Hạc",
templateId:"wind_falcon",
isHuman:false,
color:"#dce8f2"
},
{
name:"Tiên Hạc Môn Cổ Tiên",
templateId:"wind_falcon",
isHuman:true,
skinKey:"thuong_tam_tu",
color:"#7ef7c4"
}
],
eliteName:"Tiên Hạc Môn Thái Thượng Lão",
targetKills:15,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Hạc Phong Dương",
bossRankBadge:"6 Chuyển • Tiên Hạc Môn",
bossPowerScale:1.0,
bossIsHuman:true,
bossSkinKey:"thuong_tam_tu",
bossKillerMove:"Lục Chuyển Tiên Đạo Sát Chiêu: Cửu Cung Tiên Hạc Đại Trận",
bossAttackGu:"Thiên Phong Kiếm Vũ Cổ Lục Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Lục Chuyển",
rewardStones:380,
rewardMerit:230,
rewardHumanQi:35,
dropPreview:"Tiên Nguyên Thạch (45%), Đãng Hồn Thạch Đan (65%)",
drops:[
{
itemId:"immortal_stone",
count:1,
chance:0.45
},
{
itemId:"soul_crystal",
count:1,
chance:0.65
}
],
description:"[Lục Chuyển Tiên Cảnh] Tiên Hạc Môn điều động đàn Cửu Cung Phi Hạc cùng Hạc Phong Dương tấn công Hồ Tiên Phúc Địa!"
},
{
id:"stage_17",
order:17,
name:"Ải 17: Lang Gia Phúc Địa — Vân Các Bảo Vệ Chiến",
icon:"☁️",
regionName:"Bắc Nguyên (Lục Chuyển Tiên Cảnh)",
reqRank:6,
prevStageId:"stage_16",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(115, 195, 225, 0.22)",
arenaBorderColor:"#7ef7f0",
mobTemplateId:"wind_falcon",
mobName:"Vân Cầm Hoang Thú",
mobIsHuman:false,
mobPool:[
{
name:"Vân Cầm Hoang Thú",
templateId:"wind_falcon",
isHuman:false,
color:"#7ef7f0"
},
{
name:"Ảnh Tông Xâm Lược Tiên",
templateId:"soul_beast",
isHuman:true,
skinKey:"u_hon",
color:"#8f6ee6"
}
],
eliteName:"Tuyết Hồ Sơn Ma Tiên",
targetKills:16,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Tuyết Tùng Tử",
bossRankBadge:"6 Chuyển • Tuyết Đạo Cổ Tiên",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"hac_lau_lan",
bossKillerMove:"Lục Chuyển Tiên Đạo Sát Chiêu: Hàn Tùng Băng Tuyết Bạo",
bossAttackGu:"Băng Tinh Tuyết Hoa Cổ Lục Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Lục Chuyển",
rewardStones:460,
rewardMerit:280,
rewardHumanQi:40,
dropPreview:"Tiên Nguyên Thạch (60%), Cổ Phương Tàn Quyển (30%)",
drops:[
{
itemId:"immortal_stone",
count:1,
chance:0.6
},
{
itemId:"remnant_recipe",
count:1,
chance:0.3
},
{
itemId:"soul_crystal",
count:1,
chance:0.65
}
],
description:"[Lục Chuyển Tiên Cảnh] Ma Đạo Cổ Tiên Tuyết Tùng Tử dẫn thế lực Bắc Nguyên đột kích Lang Gia Phúc Địa cướp đoạt Luyện Đạo tài nguyên!"
},
{
id:"stage_18",
order:18,
name:"Ải 18: Thanh Thành Sơn — Đấu Trí Đông Phương Trường Phàm",
icon:"❄️",
regionName:"Bắc Nguyên (Lục Chuyển Tiên Cảnh)",
reqRank:6,
prevStageId:"stage_17",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(95, 185, 245, 0.25)",
arenaBorderColor:"#85c1e9",
mobTemplateId:"thunder_wolf_king",
mobName:"Thanh Thành Hoang Lang",
mobIsHuman:false,
mobPool:[
{
name:"Thanh Thành Hoang Lang",
templateId:"thunder_wolf_king",
isHuman:false,
color:"#85c1e9"
},
{
name:"Đông Phương Tộc Cổ Tiên",
templateId:"frost_python_lord",
isHuman:true,
skinKey:"tinh_tu",
color:"#4ce6ff"
}
],
eliteName:"Đông Phương Tinh Tượng Sứ",
targetKills:16,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Đông Phương Trường Phàm",
bossRankBadge:"6 Chuyển Đỉnh Phong • Trí Đạo",
bossPowerScale:1.12,
bossIsHuman:true,
bossSkinKey:"bach_ngung_bang",
bossKillerMove:"Lục Chuyển Trí Đạo Sát Chiêu: Vạn Tinh Đom Đóm Đại Trận",
bossAttackGu:"Tinh Quang Cổ Lục Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Lục Chuyển",
rewardStones:550,
rewardMerit:330,
rewardHumanQi:45,
dropPreview:"Tiên Nguyên Thạch (75%), Đãng Hồn Thạch Đan (75%)",
drops:[
{
itemId:"immortal_stone",
count:1,
chance:0.75
},
{
itemId:"soul_crystal",
count:2,
chance:0.75
}
],
description:"[Lục Chuyển Đỉnh Phong] Đông Phương Trường Phàm đoạt xá trùng sinh ở tu vi Lục Chuyển, bày Tinh Tượng Đại Trận tại Thanh Thành Sơn!"
},
{
id:"stage_19",
order:19,
name:"Ải 19: Đại Chiến Nghĩa Thiên Sơn — Thập Tuyệt Tiên Cương",
icon:"⚔️",
regionName:"Nam Cương (Thất Chuyển Tiên Cảnh)",
reqRank:7,
prevStageId:"stage_18",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(165, 25, 45, 0.28)",
arenaBorderColor:"#ff3b30",
mobTemplateId:"soul_beast",
mobName:"Ảnh Tông Tiên Cương",
mobIsHuman:true,
mobPool:[
{
name:"Ảnh Tông Tiên Cương",
templateId:"soul_beast",
isHuman:true,
skinKey:"u_hon",
color:"#b75cff"
},
{
name:"Giám Thiên Tháp Hộ Vệ",
templateId:"ancient_rock_behemoth",
isHuman:true,
skinKey:"phuong_cuu_ca",
color:"#ffd700"
}
],
eliteName:"Thập Tuyệt Tiên Cương Tướng",
targetKills:16,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Tần Bách Thắng",
bossRankBadge:"7 Chuyển Đỉnh Phong • Ảnh Tông",
bossPowerScale:1.12,
bossIsHuman:true,
bossSkinKey:"u_hon",
bossKillerMove:"Thất Chuyển Tiên Đạo Sát Chiêu: Ngũ Chỉ Quyền Tâm Kiếm",
bossAttackGu:"Nhiếp Hồn Âm Cổ Thất Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Thất Chuyển",
stageBosses:[
{
name:"Tần Bách Thắng",
rankBadge:"7 Chuyển Đỉnh Phong • Kim Hồn Đạo",
skinKey:"hac_lau_lan",
projectileColor:"#ffd700",
hpScale:0.7,
attackGuName:"Kiếm Mi Tiên Cổ Thất Chuyển",
defGuName:"Hoàng Kim Chung Cổ Thất Chuyển",
killerMoveName:"Thất Chuyển Sát Chiêu: Ngũ Chỉ Quyền Tâm Kiếm"
},
{
name:"Ảnh Vô Tà",
rankBadge:"7 Chuyển • Phân Hồn U Hồn",
skinKey:"u_hon",
projectileColor:"#c56cf0",
hpScale:0.65,
attackGuName:"Thực Hồn Tiên Cổ Thất Chuyển",
defGuName:"Ám Độ Tiên Cổ Thất Chuyển",
killerMoveName:"Thất Chuyển Sát Chiêu: Dẫn Hồn Nhập Mộng"
}
],
rewardStones:720,
rewardMerit:420,
rewardHumanQi:55,
dropPreview:"Tiên Nguyên Thạch (x2), Mở khóa cơ duyên Chí Tôn Tiên Thai Cổ",
drops:[
{
itemId:"immortal_stone",
count:2,
chance:0.85
},
{
itemId:"soul_crystal",
count:2,
chance:0.8
}
],
description:"[Thất Chuyển Tiên Cảnh] Trận đại chiến Nghĩa Thiên Sơn! Hai vị đại cao thủ Ảnh Tông là Tần Bách Thắng và Ảnh Vô Tà trực tiếp hộ pháp cho Thập Tuyệt Tiên Cương Đại Trận!"
},
{
id:"stage_20",
order:20,
name:"Ải 20: Hắc Phàm Động Thiên — Huyết Chiến Thất Chuyển",
icon:"⏳",
regionName:"Bắc Nguyên (Thất Chuyển Tiên Cảnh)",
reqRank:7,
prevStageId:"stage_19",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(35, 125, 95, 0.24)",
arenaBorderColor:"#5cc995",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Hắc Phàm Niên Thú",
mobIsHuman:false,
mobPool:[
{
name:"Hắc Phàm Niên Thú",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#5cc995"
},
{
name:"Hắc Phàm Tộc Cổ Tiên",
templateId:"frost_python_lord",
isHuman:true,
skinKey:"phuong_nguyen",
color:"#f2d16b"
}
],
eliteName:"Thượng Cổ Niên Thú Vương",
targetKills:17,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Bá Tiên Sở Độ",
bossRankBadge:"7 Chuyển Đỉnh Phong • Bá Tiên",
bossPowerScale:1.12,
bossIsHuman:true,
bossSkinKey:"hac_lau_lan",
bossKillerMove:"Thất Chuyển Tiên Đạo Sát Chiêu: Nội Cảnh Phá Không Thần Quyền",
bossAttackGu:"Vạn Ngã Tiên Cổ Thất Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Thất Chuyển",
rewardStones:880,
rewardMerit:500,
rewardHumanQi:65,
dropPreview:"Tiên Nguyên Thạch (x2), Đãng Hồn Thạch Đan (x2)",
drops:[
{
itemId:"immortal_stone",
count:2,
chance:0.9
},
{
itemId:"soul_crystal",
count:2,
chance:0.85
}
],
description:"[Thất Chuyển Tiên Cảnh] Tiến vào Hắc Phàm Động Thiên kế thừa Thời Gian Đạo chân truyền và giao chiến cùng Bá Tiên Sở Độ!"
},
{
id:"stage_21",
order:21,
name:"Ải 21: Bí Cảnh Nghịch Lưu Hà — Cấm Cổ Dưới Cửu Chuyển",
icon:"🌊",
regionName:"Bắc Nguyên (Thất Chuyển Đỉnh Phong)",
reqRank:7,
prevStageId:"stage_20",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(45, 165, 195, 0.28)",
arenaBorderColor:"#4ce6ff",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Nghịch Lưu Thủy Giao",
mobIsHuman:false,
mobPool:[
{
name:"Nghịch Lưu Thủy Giao",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#4ce6ff"
},
{
name:"Trường Sinh Thiên Tiên Sứ",
templateId:"wind_falcon",
isHuman:true,
skinKey:"phuong_cuu_ca",
color:"#ffd700"
}
],
eliteName:"Thái Cổ Nghịch Lưu Long",
targetKills:18,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Phượng Cửu Ca",
bossRankBadge:"7 Chuyển Đỉnh Phong • Trung Châu",
bossPowerScale:1.18,
bossIsHuman:true,
bossSkinKey:"phuong_cuu_ca",
bossKillerMove:"Tiên Đạo Chí Cao Sát Chiêu: Ngọc Thanh Tích Phong • Mệnh Ca",
bossAttackGu:"Thiên Phong Kiếm Vũ Cổ Thất Chuyển",
bossDefGu:"Thiên Nguyên Bảo Liên Thất Chuyển",
rewardStones:1100,
rewardMerit:600,
rewardHumanQi:75,
dropPreview:"Tiên Nguyên Thạch (x3), Đãng Hồn Thạch Đan (x3)",
drops:[
{
itemId:"immortal_stone",
count:3,
chance:0.95
},
{
itemId:"soul_crystal",
count:3,
chance:0.9
}
],
description:"[Thất Chuyển Đỉnh Phong] Một trong Tam Đại Bí Cảnh Thiên Địa! Đối đầu Phượng Cửu Ca trên dòng sông Nghịch Lưu để luyện thành Nghịch Lưu Hộ Thân Ấn!"
},
{
id:"stage_22",
order:22,
name:"Ải 22: Quang Âm Trường Hà — Thạch Liên Đảo Đại Chiến",
icon:"⏳",
regionName:"Quang Âm Trường Hà (Bát Chuyển)",
reqRank:8,
prevStageId:"stage_21",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(240, 195, 65, 0.26)",
arenaBorderColor:"#f2d16b",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Thái Cổ Niên Thú",
mobIsHuman:false,
mobPool:[
{
name:"Thái Cổ Niên Thú",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#f2d16b"
},
{
name:"Thiên Đình Trụ Đạo Cổ Tiên",
templateId:"frost_python_lord",
isHuman:true,
skinKey:"tinh_tu",
color:"#7ef7f0"
}
],
eliteName:"Thiên Đình Trụ Đạo Thống Lĩnh",
targetKills:18,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Tử Vi Tiên Tử",
bossRankBadge:"8 Chuyển • Thiên Đình",
bossPowerScale:1.05,
bossIsHuman:true,
bossSkinKey:"tinh_tu",
bossKillerMove:"Bát Chuyển Tiên Đạo Sát Chiêu: Tinh Tượng Kỳ Cục",
bossAttackGu:"Trí Tuệ Cổ Bát Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Bát Chuyển",
stageBosses:[
{
name:"Tử Vi Tiên Tử",
rankBadge:"8 Chuyển • Thiên Đình Trí Đạo",
skinKey:"tinh_tu",
projectileColor:"#c56cf0",
hpScale:0.68,
attackGuName:"Trí Tuệ Cổ Bát Chuyển",
defGuName:"Tinh Tượng Hộ Thân Trận",
killerMoveName:"Bát Chuyển Sát Chiêu: Tinh Tượng Kỳ Cục • Tử Vi Trấn Phách"
},
{
name:"Hạ Tra",
rankBadge:"8 Chuyển • Nam Cương Trụ Đạo",
skinKey:"thuong_tam_tu",
projectileColor:"#f2d16b",
hpScale:0.68,
attackGuName:"Quang Âm Phi Nhận Tiên Cổ Bát Chuyển",
defGuName:"Tự Thủy Lưu Niên Hộ Ấn",
killerMoveName:"Bát Chuyển Sát Chiêu: Xuân Hạ Thu Đông • Quang Âm Luân"
}
],
rewardStones:1500,
rewardMerit:800,
rewardHumanQi:90,
dropPreview:"Tiên Nguyên Thạch (x4), Mở khóa Chân Truyền Hồng Liên Ma Tôn",
drops:[
{
itemId:"immortal_stone",
count:4,
chance:1.0
},
{
itemId:"soul_crystal",
count:3,
chance:0.9
}
],
description:"[Bát Chuyển Tiên Cảnh] Phá vòng vây Thái Cổ Niên Thú giữa Quang Âm Trường Hà và đánh bại hai vị Bát Chuyển Tử Vi Tiên Tử cùng Hạ Tra!"
},
{
id:"stage_23",
order:23,
name:"Ải 23: Đông Hải Long Cung — Quần Tiên Tranh Đoạt",
icon:"🐉",
regionName:"Đông Hải (Bát Chuyển Tiên Cảnh)",
reqRank:8,
prevStageId:"stage_22",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(35, 110, 195, 0.26)",
arenaBorderColor:"#3b8beb",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Đông Hải Thái Cổ Giao",
mobIsHuman:false,
mobPool:[
{
name:"Đông Hải Thái Cổ Giao",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#3b8beb"
},
{
name:"Đông Hải Bát Chuyển Tán Tiên",
templateId:"frost_python_lord",
isHuman:true,
skinKey:"bach_ngung_bang",
color:"#7ef7f0"
}
],
eliteName:"Long Cung Hộ Điện Long Tướng",
targetKills:19,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Tuyết Hồ Lão Tổ",
bossRankBadge:"8 Chuyển Đỉnh Phong",
bossPowerScale:1.12,
bossIsHuman:true,
bossSkinKey:"bach_ngung_bang",
bossKillerMove:"Bát Chuyển Tiên Đạo Sát Chiêu: Vạn Tuyết Băng Thiên",
bossAttackGu:"Băng Hồn Tiên Cổ Bát Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Bát Chuyển",
stageBosses:[
{
name:"Tuyết Hồ Lão Tổ",
rankBadge:"8 Chuyển Đỉnh Phong • Băng Đạo",
skinKey:"bach_ngung_bang",
projectileColor:"#74eaff",
hpScale:0.7,
attackGuName:"Băng Hồn Tiên Cổ Bát Chuyển",
defGuName:"Vạn Niên Huyền Băng Giáp",
killerMoveName:"Bát Chuyển Sát Chiêu: Vạn Tuyết Băng Thiên Phá"
},
{
name:"Kiếm Hồn Bạc Thanh",
rankBadge:"8 Chuyển Á Tiên Tôn • Kiếm Đạo",
skinKey:"phuong_cuu_ca",
projectileColor:"#ffffff",
hpScale:0.7,
attackGuName:"Phi Kiếm Tiên Cổ Bát Chuyển",
defGuName:"Kiếm Khí Hộ Thể Ấn",
killerMoveName:"Á Tiên Tôn Tuyệt Kỹ: Ngũ Chỉ Quyền Tâm Kiếm"
}
],
rewardStones:1950,
rewardMerit:1050,
rewardHumanQi:110,
dropPreview:"Tiên Nguyên Thạch (x5), Đãng Hồn Thạch Đan (x4)",
drops:[
{
itemId:"immortal_stone",
count:5,
chance:1.0
},
{
itemId:"soul_crystal",
count:4,
chance:1.0
}
],
description:"[Bát Chuyển Đỉnh Phong] Đại chiến Đông Hải Long Cung tranh đoạt Tiên Cổ Ốc Bát Chuyển với Tuyết Hồ Lão Tổ và Kiếm Hồn Bạc Thanh!"
},
{
id:"stage_24",
order:24,
name:"Ải 24: Thiên Đình Trung Châu — Túc Mệnh Đại Chiến",
icon:"⚡",
regionName:"Trung Châu Thiên Đình (Bát Chuyển)",
reqRank:8,
prevStageId:"stage_23",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(215, 165, 35, 0.26)",
arenaBorderColor:"#ffd700",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Thiên Đình Cổ Tiên",
mobIsHuman:true,
mobPool:[
{
name:"Thiên Đình Cổ Tiên",
templateId:"desolate_thunder_dragon",
isHuman:true,
skinKey:"tinh_tu",
color:"#ffd700"
},
{
name:"Giám Thiên Tháp Kim Giáp Vệ",
templateId:"ancient_rock_behemoth",
isHuman:true,
skinKey:"phuong_cuu_ca",
color:"#ffeaa7"
}
],
eliteName:"Thiên Đình Bát Chuyển Lão Tổ",
targetKills:20,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Long Công",
isPseudoVenerableBoss:true,
bossRankBadge:"8 Chuyển • Á Tiên Tôn",
bossPowerScale:1.18,
bossIsHuman:true,
bossSkinKey:"hong_lien",
bossKillerMove:"Á Tiên Tôn Tuyệt Kỹ: Nhất Khí Tam Thanh • Long Ngự Thượng Tân",
bossAttackGu:"Thái Cổ Giao Long Lực Cổ Bát Chuyển",
bossDefGu:"Hoàng Kim Chung Cổ Bát Chuyển",
rewardStones:2800,
rewardMerit:1500,
rewardHumanQi:150,
dropPreview:"Tiên Nguyên Thạch (x8), Phá Hủy Túc Mệnh Cổ — Mở Đường Vào Phong Ma Quật!",
drops:[
{
itemId:"immortal_stone",
count:8,
chance:1.0
},
{
itemId:"soul_crystal",
count:5,
chance:1.0
}
],
description:"[Bát Chuyển Á Tiên Tôn] Ngũ Vực Cổ Tiên hội tụ đánh thẳng vào Bạch Ngọc Kinh Thiên Đình! Đánh bại Long Công và nghiền nát Túc Mệnh Cổ!"
},
{
id:"stage_25",
order:25,
name:"Ải 25: Tầng Chín Phong Ma Quật — Độc Chiến Song Tôn",
icon:"👑",
regionName:"Tầng Chín Phong Ma Quật (Cửu Chuyển)",
reqRank:9,
prevStageId:"stage_24",
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(155, 35, 225, 0.28)",
arenaBorderColor:"#00e5ff",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Thái Cổ Truyền Kỳ Hoang Thú",
mobIsHuman:false,
mobPool:[
{
name:"Thái Cổ Truyền Kỳ Hoang Thú",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#b75cff"
},
{
name:"Phong Ma Quật Thủ Trận Tiên",
templateId:"soul_beast",
isHuman:true,
skinKey:"tinh_tu",
color:"#00e5ff"
}
],
eliteName:"Hỗn Độn Đạo Thú Thái Cổ",
targetKills:20,
bossTemplateId:"desolate_thunder_dragon",
bossName:"Song Tôn Cửu Chuyển",
bossRankBadge:"9 Chuyển • Song Tôn",
bossIsHuman:true,
bossSkinKey:"tinh_tu",
bossKillerMove:"Cửu Chuyển Sát Chiêu: Tinh Tượng Vô Cực • Chúng Sinh Thiên Địa",
bossAttackGu:"Trí Tuệ Cổ Cửu Chuyển",
bossDefGu:"Cửu Chuyển Sát Chiêu: Tâm Cảnh Chúng Sinh",
venerableBosses:[
{
name:"Tinh Tú Tiên Tôn",
rankBadge:"9 Chuyển • Trí Đạo Tôn Giả",
skinKey:"tinh_tu",
projectileColor:"#4ce6ff",
defGuName:"Cửu Chuyển Sát Chiêu: Tâm Cảnh Chúng Sinh Thiên Địa Lung",
moveGuName:"Tinh Tiêu Không Gian Dịch Chuyển Cửu Chuyển",
guLoadout:[
"Trí Tuệ Cổ Cửu Chuyển",
"Tinh Mâu Tiên Cổ Cửu Chuyển",
"Thiên Cơ Tiên Cổ Cửu Chuyển",
"Tinh Tú Kỳ Bàn Cổ Cửu Chuyển",
"Huyền Quang Tinh Trận Cổ Cửu Chuyển",
"Tâm Cảnh Mộng Đạo Tiên Cổ Cửu Chuyển"
],
killerMoveList:[
"Cửu Chuyển Sát Chiêu: Phồn Tinh Toán Tẫn Vạn Vật Trận",
"Cửu Chuyển Sát Chiêu: Thất Sát Hồng Quang • Tinh Hà Khuynh Phúc",
"Cửu Chuyển Sát Chiêu: Thiên Đình Tinh Tượng Vô Cực Kiếp",
"Cửu Chuyển Sát Chiêu: Tam Đạo Thần Niệm Vô Bờ Bến",
"Cửu Chuyển Sát Chiêu: Tinh Vân Ma Bàn Nghiền Nát Càn Khôn"
]
},
{
name:"Cự Dương Tiên Tôn",
rankBadge:"9 Chuyển • Vận Đạo Tôn Giả",
skinKey:"hong_lien",
projectileColor:"#ffd700",
defGuName:"Cửu Chuyển Sát Chiêu: Hoàng Kim Khí Vận Bất Bại Kim Thân",
moveGuName:"Kim Quang Hồng Vận Độn Pháp Cửu Chuyển",
guLoadout:[
"Kiếp Vận Đàn Cửu Chuyển",
"Huyết Bản Mệnh Tiên Cổ Cửu Chuyển",
"Thiên Địa Vận Tiên Cổ Cửu Chuyển",
"Càn Khôn Tinh Hải Cổ Cửu Chuyển",
"Chân Dương Lâu Chủ Ấn Cửu Chuyển",
"Chúng Sinh Vận Tiên Cổ Cửu Chuyển"
],
killerMoveList:[
"Cửu Chuyển Sát Chiêu: Chúng Sinh Thiên Địa Ngã Cư Trung",
"Cửu Chuyển Sát Chiêu: Vạn Lưu Huyết Hà • Kim Quang Trảm Tiên",
"Cửu Chuyển Sát Chiêu: Khí Vận Phản Phệ Vô Thượng Kiếp",
"Cửu Chuyển Sát Chiêu: Hoàng Kim Lưu Quang Khí Vận Trảm",
"Cửu Chuyển Sát Chiêu: Huyết Hải Vô Biên • Vạn Kiếp Bất Phục"
]
}
],
rewardStones:8000,
rewardMerit:5000,
rewardHumanQi:500,
dropPreview:"Tiên Nguyên Thạch (x20), Thành Tựu Luyện Thiên Ma Tôn Độc Bá Vạn Cổ!",
drops:[
{
itemId:"immortal_stone",
count:20,
chance:1.0
},
{
itemId:"soul_crystal",
count:12,
chance:1.0
}
],
description:"[Cửu Chuyển Tôn Giả Chiến] Giữa Vô Cực Hỗn Độn Đại Trận tại Tầng Chín Phong Ma Quật, Tinh Tú Tiên Tôn và Cự Dương Tiên Tôn đích thân liên thủ vây sát ngươi!"
},
{
id:"special_spirit_spring",
order:101,
isSpecialResourceStage:true,
noBoss:true,
resourceFocus:"💎 Nguyên Thạch & Khoáng Thạch",
name:"⭐ Bí Cảnh: Mỏ Nguyên Tuyền Cổ Mạch",
icon:"💎",
regionName:"Bí Cảnh Tài Nguyên (1 Chuyển+)",
reqRank:1,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(35, 165, 110, 0.14)",
arenaBorderColor:"#4cd964",
mobTemplateId:"stone_golem",
mobName:"Thạch Linh Thủ Mỏ",
mobIsHuman:false,
mobPool:[
{
name:"Thạch Linh Thủ Mỏ",
templateId:"stone_golem",
isHuman:false,
color:"#4cd964"
},
{
name:"Thiết Bì Dã Trư",
templateId:"iron_boar",
isHuman:false,
color:"#6e655f"
}
],
eliteName:"Huyền Thạch Thủ Mỏ Vương",
targetKills:0,
bossTemplateId:null,
bossName:"Không có Boss (Farm Tự Do)",
bossIsHuman:false,
mobMeritReward:0,
mobHumanQiReward:0,
mobHumanQiChance:0,
mobDrops:[
{
itemId:"primeval_stone",
chance:0.35,
min:1,
max:2
},
{
itemId:"bronze_ore",
chance:0.12,
min:1,
max:1
},
{
itemId:"spirit_herb",
chance:0.1,
min:1,
max:1
},
{
itemId:"ration_meat",
chance:0.12,
min:1,
max:1
}
],
dropPreview:"Quái rơi 1–2💎 Nguyên Thạch (35%), Thanh Đồng Khoáng (12%), Thanh Linh Thảo (10%) + 10 Mỏ (hồi 75s)",
description:"[Farm Tự Do — Không Có Boss] Mạch Nguyên Tuyền khai thác chậm và ổn định — thích hợp tích góp dần Nguyên Thạch nuôi Cổ."
},
{
id:"special_herb_valley",
order:102,
isSpecialResourceStage:true,
noBoss:true,
resourceFocus:"🌸 Cổ Tài Nuôi Cổ & Hợp Luyện",
name:"⭐ Bí Cảnh: Dược Cốc Ngũ Vực — Vườn Cổ Tài",
icon:"🌿",
regionName:"Bí Cảnh Tài Nguyên (2 Chuyển+)",
reqRank:2,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(50, 145, 75, 0.16)",
arenaBorderColor:"#5cc995",
mobTemplateId:"wind_falcon",
mobName:"Dược Cốc Linh Điêu",
mobIsHuman:false,
mobPool:[
{
name:"Dược Cốc Linh Điêu",
templateId:"wind_falcon",
isHuman:false,
color:"#5cc995"
},
{
name:"Linh Dược Thanh Xà",
templateId:"frost_python_lord",
isHuman:false,
color:"#4cd964"
}
],
eliteName:"Thảo Mộc Linh Hầu",
targetKills:0,
bossTemplateId:null,
bossName:"Không có Boss (Farm Tự Do)",
bossIsHuman:false,
mobMeritReward:0,
mobHumanQiReward:0,
mobHumanQiChance:0,
mobDrops:[
{
itemId:"primeval_stone",
chance:0.3,
min:1,
max:3
},
{
itemId:"moon_orchid",
chance:0.14,
min:1,
max:1
},
{
itemId:"wind_essence_crystal",
chance:0.11,
min:1,
max:1
},
{
itemId:"red_iron_ore",
chance:0.11,
min:1,
max:1
},
{
itemId:"beast_blood_core",
chance:0.11,
min:1,
max:1
},
{
itemId:"jade_bone",
chance:0.07,
min:1,
max:1
}
],
dropPreview:"Nguyệt Lan Hoa (14%), Phong Tuyền / Xích Thiết / Tinh Huyết (11%), Bạch Ngọc Cốt Tủy (7%) + 10 Bụi Cổ Tài (hồi 75s)",
description:"[Farm Tự Do — Không Có Boss] Vườn thảo dược cổ tài giúp tìm thức ăn nuôi Cổ Trùng và phụ liệu hợp luyện."
},
{
id:"special_relic_tomb",
order:103,
isSpecialResourceStage:true,
noBoss:true,
resourceFocus:"⚪ Tàn Phương & Cơ Duyên Xá Lợi (1%)",
name:"⭐ Bí Cảnh: Cổ Mộ Xá Lợi — Tàn Phương Bí Điện",
icon:"🏛️",
regionName:"Bí Cảnh Tài Nguyên (3 Chuyển+)",
reqRank:3,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(185, 145, 40, 0.18)",
arenaBorderColor:"#ffd700",
mobTemplateId:"stone_golem",
mobName:"Khôi Lỗi Thủ Mộ Sư",
mobIsHuman:true,
mobPool:[
{
name:"Khôi Lỗi Thủ Mộ Sư",
templateId:"blood_bat_king",
isHuman:true,
skinKey:"bach_ngung_bang",
color:"#ffd700"
},
{
name:"Thiết Giáp Thạch Khôi",
templateId:"stone_golem",
isHuman:false,
color:"#b89758"
}
],
eliteName:"Cổ Mộ Thủ Lăng Tướng",
targetKills:0,
bossTemplateId:null,
bossName:"Không có Boss (Farm Tự Do)",
bossIsHuman:false,
mobMeritReward:1,
mobHumanQiReward:0,
mobHumanQiChance:0.15,
mobDrops:[
{
itemId:"primeval_stone",
chance:0.35,
min:2,
max:4
},
{
itemId:"remnant_recipe",
chance:0.04,
min:1,
max:1
},
{
itemId:"white_silver_relic_gu",
chance:0.01,
min:1,
max:1
}
],
dropPreview:"Cổ Mộ Xá Lợi (1% ra Xá Lợi Cổ) + Quái rơi 2–4💎 (35%), Tàn Phương (4%), Bạch Ngân Xá Lợi Cổ (1%)",
description:"[Farm Tự Do — Không Có Boss] Cổ mộ lưu giữ tàn phương cổ xưa và cơ duyên cực hiếm (1%) tìm thấy Xá Lợi Cổ."
},
{
id:"special_dang_hun",
order:104,
isSpecialResourceStage:true,
noBoss:true,
resourceFocus:"🔮 Đãng Hồn Thạch & Nhân Khí",
name:"⭐ Bí Cảnh: Đãng Hồn Sơn — Đảm Thức Bảo Địa",
icon:"🔮",
regionName:"Bí Cảnh Tài Nguyên (4 Chuyển+)",
reqRank:4,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(210, 75, 175, 0.20)",
arenaBorderColor:"#ff85d5",
mobTemplateId:"stone_golem",
mobName:"Đãng Hồn Thạch Nhân",
mobIsHuman:false,
mobPool:[
{
name:"Đãng Hồn Thạch Nhân",
templateId:"stone_golem",
isHuman:false,
color:"#ff85d5"
},
{
name:"U Minh Hồn Thú",
templateId:"soul_beast",
isHuman:false,
color:"#9b59b6"
}
],
eliteName:"Thái Cổ Hồn Thú Vương",
targetKills:0,
bossTemplateId:null,
bossName:"Không có Boss (Farm Tự Do)",
bossIsHuman:false,
mobMeritReward:1,
mobHumanQiReward:0,
mobHumanQiChance:0.25,
mobDrops:[
{
itemId:"primeval_stone",
chance:0.35,
min:3,
max:6
},
{
itemId:"soul_crystal",
chance:0.12,
min:1,
max:1
},
{
itemId:"hundred_year_ginseng",
chance:0.1,
min:1,
max:1
},
{
itemId:"purple_crystal_relic_gu",
chance:0.01,
min:1,
max:1
}
],
dropPreview:"Mỏ Đãng Hồn Tinh Thạch (1🔮), Nhân Khí Linh Liên (+1 Nhân Khí) + Quái rơi Đãng Hồn Thạch (12%), Tử Tinh Xá Lợi Cổ (1%)",
description:"[Farm Tự Do — Không Có Boss] Thánh địa Hồn Đạo với Đãng Hồn Thạch Nhân và U Minh Hồn Thú canh giữ Đãng Hồn Thạch Đan."
},
{
id:"special_immortal_vein",
order:105,
isSpecialResourceStage:true,
noBoss:true,
resourceFocus:"🌟 Tiên Nguyên Thạch (Lục Chuyển+)",
name:"⭐ Bí Cảnh: Thái Cổ Linh Mạch — Kho Tiên Thạch",
icon:"🌟",
regionName:"Bí Cảnh Tiên Tài (6 Chuyển+)",
reqRank:6,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(65, 170, 235, 0.20)",
arenaBorderColor:"#4ce6ff",
mobTemplateId:"desolate_thunder_dragon",
mobName:"Tiên Quáng Lôi Giao",
mobIsHuman:false,
mobPool:[
{
name:"Tiên Quáng Lôi Giao",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#4ce6ff"
},
{
name:"Thái Cổ Huyền Thạch Tượng",
templateId:"ancient_rock_behemoth",
isHuman:false,
color:"#d4af37"
}
],
eliteName:"Thượng Cổ Hộ Mạch Long Vương",
targetKills:0,
bossTemplateId:null,
bossName:"Không có Boss (Farm Tự Do)",
bossIsHuman:false,
mobMeritReward:2,
mobHumanQiReward:0,
mobHumanQiChance:0.3,
mobDrops:[
{
itemId:"immortal_stone",
chance:0.12,
min:1,
max:1
},
{
itemId:"primeval_stone",
chance:0.4,
min:10,
max:25
},
{
itemId:"soul_crystal",
chance:0.12,
min:1,
max:1
}
],
dropPreview:"Mạch Tiên Thạch (40% tách ra 1🌟) + Quái rơi 1🌟 Tiên Thạch (12%) & Đãng Hồn Thạch (12%)",
description:"[Farm Tự Do — Không Có Boss] Linh mạch Tiên Nguyên Thạch hiếm hoi cho Cổ Tiên Lục Chuyển+ tích lũy từng viên Tiên Thạch."
},
{
id:"special_chaos_vault",
order:106,
isSpecialResourceStage:true,
noBoss:true,
resourceFocus:"👑 Kho Báu Tiên Thạch Chí Tôn (Bát Chuyển+)",
name:"⭐ Bí Cảnh: Bảo Khố Vô Cực — Thánh Địa Chí Tôn",
icon:"👑",
regionName:"Bí Cảnh Tiên Tài (8 Chuyển+)",
reqRank:8,
prevStageId:null,
arenaCenterX:4000,
arenaCenterY:4000,
themeTint:"rgba(145, 50, 235, 0.22)",
arenaBorderColor:"#ffd700",
mobTemplateId:"soul_beast",
mobName:"Hỗn Độn Tiên Cương",
mobIsHuman:true,
mobPool:[
{
name:"Hỗn Độn Tiên Cương",
templateId:"soul_beast",
isHuman:true,
skinKey:"u_hon",
color:"#c56cf0"
},
{
name:"Thái Cổ Hỗn Độn Long",
templateId:"desolate_thunder_dragon",
isHuman:false,
color:"#ffd700"
}
],
eliteName:"Vô Cực Thủ Khố Cổ Tiên",
targetKills:0,
bossTemplateId:null,
bossName:"Không có Boss (Farm Tự Do)",
bossIsHuman:false,
mobMeritReward:4,
mobHumanQiReward:1,
mobHumanQiChance:0,
mobDrops:[
{
itemId:"immortal_stone",
chance:0.22,
min:1,
max:2
},
{
itemId:"primeval_stone",
chance:0.45,
min:25,
max:55
},
{
itemId:"soul_crystal",
chance:0.15,
min:1,
max:1
}
],
dropPreview:"Thánh Mạch Tiên Thạch (65% ra 1–2🌟) + Quái rơi 1–2🌟 Tiên Thạch (22%) & Đãng Hồn Thạch (15%)",
description:"[Farm Tự Do — Không Có Boss] Kho báu Tiên Nguyên Thạch cho Bát Chuyển / Á Tiên Tôn kiên trì tích góp đợi Tiên Cổ về chợ."
}
];
global.VanCoStageCatalog=STAGE_CATALOG;
})(window);
