(function (global) {
"use strict";
const SECTS_DB=[
{
id:"co_nguyet_clan",
name:"Cổ Nguyệt Sơn Trại",
region:"nam_cuong",
regionName:"Nam Cương",
alignment:"Chính Đạo",
icon:"🌙",
favoredPath:"Quang Đạo",
reqRank:1,
desc:"Gia tộc danh môn trên đỉnh Thanh Mao Sơn. Mạnh về Nguyệt Quang Cổ, hỗ trợ tân thủ ổn định & thưởng thêm Nguyên Thạch.",
perkDesc:"+10% Nguyên Thạch vượt ải, +8% tỷ lệ Luyện Hóa Dã Cổ"
},
{
id:"thuong_gia_guild",
name:"Thương Gia Thành Thương Minh",
region:"nam_cuong",
regionName:"Nam Cương",
alignment:"Trung Lập",
icon:"⚖️",
favoredPath:"Vận Đạo",
reqRank:1,
desc:"Thánh địa giao thương lớn nhất Nam Cương dưới sự lãnh đạo của Thương Yến Phi. Độc quyền giảm giá thương hội & đấu giá.",
perkDesc:"Giảm thêm 10% giá Thương Hội & Đấu Giá, +10% Bạo Kích"
},
{
id:"truong_sinh_thien",
name:"Hoàng Kim Bộ Tộc — Trường Sinh Thiên",
region:"bac_nguyen",
regionName:"Bắc Nguyên",
alignment:"Chính Đạo",
icon:"👑",
favoredPath:"Lực Đạo",
reqRank:3,
desc:"Liên minh hậu duệ Cự Dương Tiên Tôn tại Bắc Nguyên. Nổi tiếng dân phong dũng mãnh, tăng mạnh Sinh Mệnh & Công Kích.",
perkDesc:"+12% Công Kích & +12% Sinh Mệnh tối đa"
},
{
id:"tien_hac_mon",
name:"Tiên Hạc Môn — Thập Đại Cổ Phái",
region:"trung_chau",
regionName:"Trung Châu",
alignment:"Chính Đạo",
icon:"🦢",
favoredPath:"Kiếm Đạo",
reqRank:3,
desc:"Một trong Thập Đại Cổ Phái Trung Châu phụng sự Thiên Đình. Tinh thông Kiếm Đạo, Luyện Đạo và kinh doanh Phúc Địa.",
perkDesc:"+10% tỷ lệ Hợp Luyện Đỉnh Lò & +15% tốc độ hồi Tinh Thần"
},
{
id:"anh_tong_cult",
name:"Ảnh Tông — Cương Minh",
region:"dong_hai",
regionName:"Ngũ Vực",
alignment:"Ma Đạo",
icon:"👻",
favoredPath:"Hồn Đạo",
reqRank:2,
desc:"Tổ chức bí ẩn do phân hồn U Hồn Ma Tôn sáng lập, trải rộng Ngũ Vực. Bất chấp thủ đoạn để nghịch thiên đoạt cơ duyên!",
perkDesc:"+15% Sát thương Chí Mạng, +20% Nhân Khí nhận được"
}
];
const SECT_RANKS=[
{level:0,title:"Ngoại Môn Đệ Tử",reqContribution:0,reqRank:1,statBonusPct:0.03,dailyStones:25,dailyMerit:15},
{level:1,title:"Nội Môn Đệ Tử",reqContribution:120,reqRank:2,statBonusPct:0.06,dailyStones:60,dailyMerit:35},
{level:2,title:"Chân Truyền Đệ Tử",reqContribution:350,reqRank:3,statBonusPct:0.10,dailyStones:140,dailyMerit:75},
{level:3,title:"Gia Lão / Trưởng Lão",reqContribution:800,reqRank:5,statBonusPct:0.15,dailyStones:320,dailyMerit:150},
{level:4,title:"Thái Thượng Trưởng Lão",reqContribution:1800,reqRank:6,statBonusPct:0.22,dailyStones:800,dailyMerit:350,dailyImmStones:2},
{level:5,title:"Tông Chủ / Thái Thượng Đại Trưởng Lão",reqContribution:4000,reqRank:8,statBonusPct:0.30,dailyStones:2000,dailyMerit:800,dailyImmStones:6}
];
const REPUTATION_TIERS=[
{min:0,title:"Vô Danh Tiểu Tốt",discount:0,color:"#9c9487"},
{min:50,title:"Có Chút Danh Tiếng",discount:0.03,color:"#7ef7c4"},
{min:150,title:"Nổi Danh Nhất Phương",discount:0.06,color:"#67b7d1"},
{min:350,title:"Uy Chấn Nhất Vực",discount:0.10,color:"#ffd700"},
{min:700,title:"Cự Phách Ngũ Vực",discount:0.14,color:"#c278ff"},
{min:1200,title:"Truyền Kỳ Vạn Cổ",discount:0.18,color:"#00e5ff"}
];
const ANCIENT_RUINS=[
{
id:"ruin_thanh_mao_crypt",
name:"Bia Đá Cổ Nguyệt Đệ Nhất Đời",
region:"nam_cuong",
regionName:"Nam Cương",
reqRank:1,
reqRep:0,
mentalCost:18,
icon:"🗿",
lore:"Khắc ghi bí mật về nguồn gốc Cổ Nguyệt Nhất Thế — kẻ từng là Ma Đạo Ngũ Chuyển trốn chạy từ Trung Châu, lập nên huyết trì ngầm dưới sơn trại để luyện Huyết Lô Cổ.",
rewardStones:45,
rewardHumanQi:10,
rewardRep:30,
unlocksHiddenQuest:"hq_blood_secret",
secretArtId:"art_blood_scripture"
},
{
id:"ruin_bach_cot_altar",
name:"Hôi Cốt Di Chỉ — Thạch Điện Ngầm",
region:"nam_cuong",
regionName:"Nam Cương",
reqRank:2,
reqRep:40,
mentalCost:26,
icon:"🦴",
lore:"Bút ký cuối đời của Hôi Cốt Tài Tuấn ghi lại cách khắc đạo ngân Cốt Đạo vào tủy sống, giúp thân thể cứng như Bạch Ngọc Cổ.",
rewardStones:95,
rewardHumanQi:16,
rewardRep:45,
unlocksHiddenQuest:"hq_bone_legacy",
secretArtId:"art_white_bone_heart"
},
{
id:"ruin_tam_vuong_monument",
name:"Tế Đàn Tam Vương — Nam Cương",
region:"nam_cuong",
regionName:"Nam Cương",
reqRank:4,
reqRep:120,
mentalCost:42,
icon:"🔥",
lore:"Tàn tích Phúc Địa Tam Vương ghi chép bí pháp 'Định Tiên Du' từng được Phương Nguyên đoạt lấy giữa vòng vây trăm vị Cổ Sư.",
rewardStones:260,
rewardHumanQi:30,
rewardRep:70,
unlocksHiddenQuest:"hq_fixed_immortal_clue",
secretArtId:"art_three_kings_flame"
},
{
id:"ruin_chan_duong_stele",
name:"Hoàng Kim Bia — Chân Dương Di Tích",
region:"bac_nguyen",
regionName:"Bắc Nguyên",
reqRank:5,
reqRep:150,
mentalCost:55,
icon:"🏯",
lore:"Mảnh vỡ của Bát Thập Bát Giác Chân Dương Lâu, lưu lại chân ý Kỷ Vận của Cự Dương Tiên Tôn: 'Vận đến như sông trào, họa chuyển thành phúc'.",
rewardStones:520,
rewardHumanQi:45,
rewardRep:95,
unlocksHiddenQuest:"hq_luck_path_omen",
secretArtId:"art_giant_sun_luck"
},
{
id:"ruin_nghia_thien_pit",
name:"Hố Thẳm Nghĩa Thiên — Ấn Ký Sinh Tử",
region:"trung_chau",
regionName:"Trung Châu",
reqRank:6,
reqRep:220,
mentalCost:75,
icon:"💀",
lore:"Nơi Thập Tuyệt Tiên Cương Đại Trận từng nổ tung! Trong khe nứt còn sót lại tàn niệm của U Hồn Ma Tôn về phương pháp Tráng Hồn Luyện Hồn.",
rewardStones:980,
rewardHumanQi:65,
rewardRep:120,
rewardImmStones:3,
unlocksHiddenQuest:"hq_spectral_soul_echo",
secretArtId:"art_spectral_soul_sutra"
},
{
id:"ruin_crazed_demon_tablet",
name:"Đạo Bi Vô Cực — Tầng Chín Phong Ma",
region:"bac_nguyen",
regionName:"Bắc Nguyên",
reqRank:8,
reqRep:350,
mentalCost:110,
icon:"🌌",
lore:"Vô Cực Ma Tôn khắc lại phương trình diễn hóa Hỗn Độn thành Thiên Địa Đạo Ngân — bí mật tối thượng giúp các bậc Á Tiên Tôn nhìn thấu con đường Thành Tôn!",
rewardStones:2800,
rewardHumanQi:120,
rewardRep:180,
rewardImmStones:8,
unlocksHiddenQuest:"hq_limitless_truth",
secretArtId:"art_limitless_dao_manual"
}
];
const SECRET_ARTS_DB={
art_blood_scripture:{
id:"art_blood_scripture",
name:"Huyết Hải Chân Kinh (Tàn Thiên)",
icon:"🩸",
source:"Di Tích Cổ Nguyệt Đệ Nhất Đời",
bonuses:{atkPct:0.08,lifestealBonus:0.04},
desc:"Bí thuật Huyết Đạo cổ xưa: +8% Công Kích & +4% Hút Máu toàn bộ đòn đánh."
},
art_white_bone_heart:{
id:"art_white_bone_heart",
name:"Bạch Ngọc Cốt Tâm Quyết",
icon:"🦴",
source:"Di Tích Bạch Cốt Sơn",
bonuses:{hpPct:0.10,defPct:0.12},
desc:"Công pháp phòng ngự Hôi Cốt Tài Tuấn: +10% Sinh Mệnh tối đa & +12% Phòng Ngự."
},
art_three_kings_flame:{
id:"art_three_kings_flame",
name:"Tam Vương Luyện Hỏa Bí Thuật",
icon:"🔥",
source:"Tế Đàn Tam Vương",
bonuses:{refineBonus:0.06,atkPct:0.08},
desc:"Bí pháp luyện cổ & công phạt của Tam Vương: +6% tỷ lệ Hợp Luyện & +8% Công Kích."
},
art_giant_sun_luck:{
id:"art_giant_sun_luck",
name:"Cự Dương Kỷ Vận Chân Giải",
icon:"🎲",
source:"Chân Dương Di Tích",
bonuses:{critChance:0.10,stoneDropPct:0.15},
desc:"Chân truyền Vận Đạo Bắc Nguyên: +10% Tỷ Lệ Bạo Kích & +15% Nguyên Thạch thưởng ải."
},
art_spectral_soul_sutra:{
id:"art_spectral_soul_sutra",
name:"U Hồn Tráng Hồn Bí Lục",
icon:"👻",
source:"Hố Thẳm Nghĩa Thiên",
bonuses:{mentalPct:0.20,dmgPct:0.12},
desc:"Tuyệt học Hồn Đạo của U Hồn Ma Tôn: +20% Tinh Thần Lực tối đa & +12% Sát Thương thực chiến."
},
art_limitless_dao_manual:{
id:"art_limitless_dao_manual",
name:"Vô Cực Hỗn Độn Đạo Kinh",
icon:"🌌",
source:"Đạo Bi Vô Cực",
bonuses:{hpPct:0.15,defPct:0.15,dmgPct:0.18},
desc:"Đạo pháp chí cao của Vô Cực Ma Tôn: +15% HP, +15% DEF & +18% Sát Thương mọi chiêu thức!"
},
art_red_lotus_time:{
id:"art_red_lotus_time",
name:"Hồng Liên Quang Âm Tàn Quyết",
icon:"⏳",
source:"Hoàn thành Chuỗi Nhiệm Vụ Cổ Tiên",
bonuses:{cdReducePct:0.10,dmgPct:0.10},
desc:"Bí thuật Trụ Đạo Hồng Liên Ma Tôn: Giảm 10% hồi chiêu & +10% Sát Thương."
}
};
const QUEST_CHAINS=[
{
chainId:"chain_mortal_rise",
name:"Chuỗi Chính Tuyến I: Thanh Mao Quật Khởi",
steps:[
{
id:"qc1_1",
title:"Bước 1: Đêm Trăng Thanh Mao",
desc:"Vượt qua 【Ải 1: Sườn Núi Thanh Mao】 (thắp đủ Đuốc Hộ Sơn & hạ Điện Lang Vương).",
eventType:"clear_stage",
targetKey:"stage_1",
target:1,
rewardStones:40,
rewardMerit:30,
rewardRepRegion:"nam_cuong",
rewardRep:25
},
{
id:"qc1_2",
title:"Bước 2: Phá Giải Mật Động & Lang Triều",
desc:"Hoàn thành 【Ải 4: Huyết Lang Triều Thanh Mao Sơn】 bảo vệ Sơn Trại Hộ Trận.",
eventType:"clear_stage",
targetKey:"stage_4",
target:1,
rewardStones:80,
rewardMerit:60,
rewardRepRegion:"nam_cuong",
rewardRep:40
},
{
id:"qc1_3",
title:"Bước 3: Đấu Vũ Trường Thương Gia",
desc:"Toàn thắng 3 hiệp Lôi Đài tại 【Ải 7: Thương Gia Thành — Đấu Vũ Trường】.",
eventType:"clear_stage",
targetKey:"stage_7",
target:1,
rewardStones:160,
rewardMerit:100,
rewardRepRegion:"nam_cuong",
rewardRep:60,
rewardItem:"remnant_recipe"
},
{
id:"qc1_4",
title:"Bước 4: Phá Cục Tam Vương Sơn",
desc:"Đoạt 3 Lệnh Bài & đánh bại Thiết Ba Tu tại 【Ải 10: Tam Vương Sơn】.",
eventType:"clear_stage",
targetKey:"stage_10",
target:1,
rewardStones:350,
rewardMerit:180,
rewardRepRegion:"nam_cuong",
rewardRep:90,
rewardItem:"soul_crystal"
}
]
},
{
chainId:"chain_immortal_path",
name:"Chuỗi Chính Tuyến II: Bắc Nguyên & Thăng Tiên",
steps:[
{
id:"qc2_1",
title:"Bước 1: Vương Đình Tranh Bá",
desc:"Giành chiến thắng Lôi Đài trước Hắc Lâu Lan tại 【Ải 14: Vương Đình Tranh Bá】.",
eventType:"clear_stage",
targetKey:"stage_14",
target:1,
rewardStones:500,
rewardMerit:260,
rewardRepRegion:"bac_nguyen",
rewardRep:85
},
{
id:"qc2_2",
title:"Bước 2: Đắc Đạo Cổ Tiên Lục Chuyển",
desc:"Phá Khiếu Thăng Tiên, mở ra Phúc Địa & đạt cảnh giới Lục Chuyển Cổ Tiên.",
eventType:"reach_rank",
targetKey:"6",
target:1,
rewardStones:900,
rewardMerit:400,
rewardRepRegion:"trung_chau",
rewardRep:100,
rewardImmStones:4
},
{
id:"qc2_3",
title:"Bước 3: Nghịch Lưu Hà Chi Chủ",
desc:"Ngược dòng Nghịch Lưu Hà & đánh bại Phượng Cửu Ca tại 【Ải 21】.",
eventType:"clear_stage",
targetKey:"stage_21",
target:1,
rewardStones:2000,
rewardMerit:900,
rewardRepRegion:"bac_nguyen",
rewardRep:140,
rewardImmStones:6,
rewardSecretArt:"art_red_lotus_time"
},
{
id:"qc2_4",
title:"Bước 4: Đập Nát Túc Mệnh — Độc Chiến Song Tôn",
desc:"Chứng Đạo Cửu Chuyển & đánh bại Song Tôn tại 【Ải 25: Tầng Chín Phong Ma Quật】!",
eventType:"clear_stage",
targetKey:"stage_25",
target:1,
rewardStones:10000,
rewardMerit:3000,
rewardRepRegion:"trung_chau",
rewardRep:300,
rewardImmStones:25
}
]
}
];
const HIDDEN_QUESTS_DB=[
{
id:"hq_blood_secret",
title:"[Ẩn] Huyết Trì Cổ Nguyệt Bí Mật",
triggerHint:"Khám phá Di Tích Bia Đá Cổ Nguyệt Đệ Nhất Đời",
desc:"Phá hủy 3 Trận Nhãn Huyết Hồ & đánh bại Huyết Thi Cổ Sư tại Ải 3.",
eventType:"clear_stage",
targetKey:"stage_3",
target:1,
rewardStones:120,
rewardHumanQi:15,
rewardItem:"beast_blood_core"
},
{
id:"hq_bone_legacy",
title:"[Ẩn] Bạch Cốt Trụ Tàn Dư",
triggerHint:"Khám phá Di Tích Hôi Cốt Thạch Điện",
desc:"Tiêu diệt 20 mục tiêu bằng Cổ Trùng / Sát Chiêu sau khi khám phá bí mật Bạch Cốt.",
eventType:"kill_any",
target:20,
rewardStones:180,
rewardHumanQi:20,
rewardItem:"jade_bone"
},
{
id:"hq_npc_confidant",
title:"[Ẩn] Tri Kỷ Ngũ Vực",
triggerHint:"Nâng hảo cảm 1 vị NPC Cổ Sư lên mức Hữu Hảo (50+)",
desc:"Tặng quà hoặc giao lưu giúp 1 vị NPC đạt hảo cảm >= 65 để nhận bí tin cơ duyên.",
eventType:"npc_affinity",
target:65,
rewardStones:250,
rewardHumanQi:25,
rewardItem:"remnant_recipe"
},
{
id:"hq_auction_tycoon",
title:"[Ẩn] Khách Quý Đấu Giá Trường",
triggerHint:"Thắng ít nhất 1 phiên Đấu Giá Cạnh Tranh Trực Tiếp",
desc:"Thắng 2 phiên Đấu Giá Trực Tiếp cạnh tranh với các cường giả Ngũ Vực.",
eventType:"auction_win",
target:2,
rewardStones:450,
rewardHumanQi:30,
rewardItem:"hundred_year_ginseng"
},
{
id:"hq_fixed_immortal_clue",
title:"[Ẩn] Truyền Thuyết Định Tiên Du",
triggerHint:"Khám phá Tế Đàn Tam Vương",
desc:"Hoàn thành 3 lần sự kiện Cơ Duyên Giữa Trận hoặc Khám Phá Bí Cảnh.",
eventType:"battle_event",
target:3,
rewardStones:600,
rewardHumanQi:45,
rewardItem:"soul_crystal"
},
{
id:"hq_limitless_truth",
title:"[Ẩn] Chân Lý Hỗn Độn Vô Cực",
triggerHint:"Khám phá Đạo Bi Vô Cực",
desc:"Vượt qua 2 lần Thử Thách Thiên Kiếp Tương Tác trong Tiên Khiếu.",
eventType:"tribulation_trial",
target:2,
rewardStones:2500,
rewardHumanQi:100,
rewardImmStones:6
}
];
const ACHIEVEMENTS_DB=[
{id:"ach_first_blood",name:"Bước Chân Cổ Sư",icon:"⚔️",desc:"Tiêu diệt tổng cộng 25 kẻ địch.",statKey:"kills",target:25,rewardStones:60,rewardHumanQi:10},
{id:"ach_slayer_200",name:"Sát Phạt Ngũ Vực",icon:"🩸",desc:"Tiêu diệt tổng cộng 200 kẻ địch.",statKey:"kills",target:200,rewardStones:350,rewardHumanQi:30},
{id:"ach_mechanic_5",name:"Phá Trận Kỳ Tài",icon:"🧩",desc:"Hoàn thành 5 cơ chế đặc biệt của Bản Đồ (Phá Trận Nhãn, Thủ Thành, Đoạt Bảo...).",statKey:"mechanicsCleared",target:5,rewardStones:180,rewardHumanQi:20},
{id:"ach_event_5",name:"Hồng Vận Đương Đầu",icon:"🍀",desc:"Hoàn thành 5 Sự Kiện Ngẫu Nhiên Giữa Trận / Bí Cảnh.",statKey:"eventsCompleted",target:5,rewardStones:240,rewardHumanQi:25},
{id:"ach_ruin_3",name:"Nhà Khảo Cổ Ngũ Vực",icon:"🗿",desc:"Khám phá 3 Di Tích Lịch Sử Thượng Cổ.",statKey:"ruinsExplored",target:3,rewardStones:320,rewardHumanQi:35},
{id:"ach_auction_3",name:"Phú Giáp Nhất Phương",icon:"🔨",desc:"Thắng 3 phiên Đấu Giá Trực Tiếp.",statKey:"auctionsWon",target:3,rewardStones:480,rewardHumanQi:25},
{id:"ach_sect_elder",name:"Trưởng Lão Tông Môn",icon:"🏯",desc:"Đạt chức vụ Trưởng Lão (Cấp 3) trở lên trong Tông Môn.",statKey:"sectRank",target:3,rewardStones:400,rewardHumanQi:35},
{id:"ach_rep_350",name:"Uy Chấn Nhất Vực",icon:"🌟",desc:"Đạt 350 Danh Vọng tại bất kỳ khu vực nào trong Ngũ Vực.",statKey:"maxRegionRep",target:350,rewardStones:500,rewardHumanQi:40},
{id:"ach_npc_friend",name:"Kết Giao Hào Kiệt",icon:"🤝",desc:"Đạt mức Tri Kỷ (80+ hảo cảm) với ít nhất 1 NPC Cổ Sư.",statKey:"maxNpcRelation",target:80,rewardStones:300,rewardHumanQi:25},
{id:"ach_immortal_6",name:"Đắc Đạo Cổ Tiên",icon:"✨",desc:"Phá Khiếu Thăng Tiên đạt Lục Chuyển Cổ Tiên.",statKey:"rank",target:6,rewardStones:1200,rewardHumanQi:60,rewardImmStones:5},
{id:"ach_trib_3",name:"Nghịch Thiên Độ Kiếp",icon:"⚡",desc:"Vượt qua 3 lần Thử Thách Thiên Kiếp Tương Tác.",statKey:"tribulationsCleared",target:3,rewardStones:1500,rewardHumanQi:80,rewardImmStones:6},
{id:"ach_venerable_9",name:"Vô Địch Cửu Chuyển Tôn Giả",icon:"👑",desc:"Chứng Đạo Thành Tôn & trở thành Đạo Chủ Cửu Chuyển!",statKey:"rank",target:9,rewardStones:10000,rewardHumanQi:200,rewardImmStones:20}
];
const NPC_RELATION_TIERS=[
{min:-999,label:"Thù Địch",color:"#ff5252",discount:0},
{min:0,label:"Xa Lạ",color:"#9c9487",discount:0},
{min:20,label:"Quen Biết",color:"#e6dfd5",discount:0.04},
{min:50,label:"Hữu Hảo",color:"#5cc995",discount:0.08},
{min:80,label:"Tri Kỷ",color:"#67b7d1",discount:0.14},
{min:120,label:"Kết Bái / Đạo Lữ",color:"#ffd700",discount:0.20}
];
class QuestManager {
constructor(gameEngine) {
this.game=gameEngine||null;
this.reset();
}
reset() {
this.sect={
id:null,
rankLevel:0,
contribution:0,
lastStipendAt:0
};
this.reputation={
nam_cuong:15,
bac_nguyen:0,
trung_chau:0,
dong_hai:0,
tay_mac:0
};
this.exploredRuins=[];
this.learnedSecretArts=[];
this.chainStepIndex={};
this.chainStepProgress={};
for (const c of QUEST_CHAINS) {
this.chainStepIndex[c.chainId]=0;
}
this.unlockedHiddenQuests=[];
this.hiddenQuestProgress={};
this.claimedHiddenQuests=[];
this.claimedAchievements=[];
this.stats={
mechanicsCleared:0,
eventsCompleted:0,
auctionsWon:0,
tribulationsCleared:0,
secretRealmsExplored:0,
giftsGiven:0
};
}
getCurrentSect() {
if (!this.sect.id) return null;
return SECTS_DB.find(s=>s.id===this.sect.id)||null;
}
getCurrentSectRankInfo() {
return SECT_RANKS[this.sect.rankLevel]||SECT_RANKS[0];
}
joinSect(sectId) {
const sect=SECTS_DB.find(s=>s.id===sectId);
if (!sect) return {success:false,message:"Tông môn không tồn tại."};
const ap=this.game&&this.game.aperture;
if (ap&&ap.rank<sect.reqRank) {
return {success:false,message:`Cần đạt tối thiểu ${sect.reqRank} Chuyển để gia nhập 【${sect.name}】!`};
}
if (this.sect.id===sectId) {
return {success:false,message:`Ngươi đã là đệ tử của 【${sect.name}】 rồi.`};
}
const switched=Boolean(this.sect.id);
this.sect.id=sectId;
this.sect.rankLevel=0;
this.sect.contribution=switched?Math.floor(this.sect.contribution*0.25) :20;
this.addReputation(sect.region,20);
if (this.game&&this.game.player) this.game.player.recalculateStats();
return {
success:true,
message:`🏯 Đã gia nhập 【${sect.icon} ${sect.name}】 với thân phận ${SECT_RANKS[0].title}! (${sect.perkDesc})`
};
}
contributeToSect(stoneAmount=50) {
const sect=this.getCurrentSect();
const pl=this.game&&this.game.player;
if (!sect|| !pl) return {success:false,message:"Hãy gia nhập một Tông Môn trước khi cống hiến!"};
if (pl.primevalStones<stoneAmount) {
return {success:false,message:`Không đủ Nguyên Thạch (Cần 💎 ${stoneAmount})!`};
}
pl.primevalStones -=stoneAmount;
const contribGain=Math.max(10,Math.round(stoneAmount*0.8));
const meritGain=Math.max(10,Math.round(stoneAmount*0.6));
this.sect.contribution +=contribGain;
pl.meritPoints=(pl.meritPoints||0) + meritGain;
this.addReputation(sect.region,Math.max(5,Math.round(stoneAmount*0.25)));
return {
success:true,
message:`🏅 Đã cống hiến 💎 ${stoneAmount} Nguyên Thạch cho 【${sect.name}】 (+${contribGain} Cống Hiến Tông Môn, +${meritGain} Điểm Cống Hiến Khố Phòng)!`
};
}
promoteSectRank() {
const sect=this.getCurrentSect();
const ap=this.game&&this.game.aperture;
if (!sect) return {success:false,message:"Chưa gia nhập Tông Môn."};
const nextIdx=this.sect.rankLevel + 1;
const nextRank=SECT_RANKS[nextIdx];
if (!nextRank) return {success:false,message:"Ngươi đã đạt chức vị cao nhất trong Tông Môn!"};
if (ap&&ap.rank<nextRank.reqRank) {
return {success:false,message:`Cần đạt tu vi ${nextRank.reqRank} Chuyển để tấn phong 【${nextRank.title}】!`};
}
if (this.sect.contribution<nextRank.reqContribution) {
return {success:false,message:`Cần ${nextRank.reqContribution} điểm Cống Hiến Tông Môn (Hiện có: ${this.sect.contribution})!`};
}
this.sect.rankLevel=nextIdx;
this.addReputation(sect.region,45);
if (this.game&&this.game.player) this.game.player.recalculateStats();
return {
success:true,
message:`👑 Tấn phong thành công chức vụ 【${nextRank.title}】 tại 【${sect.name}】! Tăng +${Math.round(nextRank.statBonusPct*100)}% Toàn Thuộc Tính & bổng lộc định kỳ tăng mạnh!`
};
}
getSectStipendCooldown() {
const elapsed=(Date.now() - (this.sect.lastStipendAt||0)) / 1000;
return Math.max(0,Math.ceil(180 - elapsed));
}
claimSectStipend() {
const sect=this.getCurrentSect();
const pl=this.game&&this.game.player;
if (!sect|| !pl) return {success:false,message:"Chưa gia nhập Tông Môn!"};
const cd=this.getSectStipendCooldown();
if (cd>0) {
return {success:false,message:`⏳ Bổng lộc Tông Môn đang chuẩn bị (Chờ ${Math.floor(cd / 60)}:${String(cd % 60).padStart(2,"0")})!`};
}
const rInfo=this.getCurrentSectRankInfo();
this.sect.lastStipendAt=Date.now();
pl.primevalStones +=rInfo.dailyStones;
pl.meritPoints=(pl.meritPoints||0) + rInfo.dailyMerit;
if (rInfo.dailyImmStones) pl.addItem("immortal_stone",rInfo.dailyImmStones);
return {
success:true,
message:`🎁 Đã lĩnh bổng lộc 【${rInfo.title} — ${sect.name}】: 💎 +${rInfo.dailyStones} Nguyên Thạch, 🏅 +${rInfo.dailyMerit} Cống Hiến${rInfo.dailyImmStones?`, 🌟 +${rInfo.dailyImmStones} Tiên Thạch` :""}!`
};
}
addReputation(regionKey,amount) {
const key=this.reputation[regionKey]!==undefined?regionKey :"nam_cuong";
this.reputation[key]=Math.max(0,Math.floor((this.reputation[key]||0) + amount));
return this.reputation[key];
}
getRegionReputationTier(regionKey) {
const pts=this.reputation[regionKey]||0;
let best=REPUTATION_TIERS[0];
for (const t of REPUTATION_TIERS) {
if (pts>=t.min) best=t;
}
return {...best,points:pts};
}
getMaxRegionReputation() {
return Math.max(0,...Object.values(this.reputation));
}
exploreRuin(ruinId) {
const ruin=ANCIENT_RUINS.find(r=>r.id===ruinId);
const pl=this.game&&this.game.player;
const ap=this.game&&this.game.aperture;
if (!ruin|| !pl|| !ap) return {success:false,message:"Di tích không tồn tại."};
if (this.exploredRuins.includes(ruinId)) {
return {success:false,message:`Ngươi đã khám phá hết bí mật của 【${ruin.name}】 rồi.`};
}
if (ap.rank<ruin.reqRank) {
return {success:false,message:`Cần tu vi tối thiểu ${ruin.reqRank} Chuyển để bước vào 【${ruin.name}】!`};
}
const regPts=this.reputation[ruin.region]||0;
if (regPts<ruin.reqRep) {
return {success:false,message:`Cần ${ruin.reqRep} Danh Vọng tại ${ruin.regionName} để dò hỏi vị trí 【${ruin.name}】 (Hiện có: ${regPts})!`};
}
if (pl.mental<ruin.mentalCost) {
return {success:false,message:`Không đủ Tinh Thần Lực (${Math.floor(pl.mental)}/${ruin.mentalCost}) để giải mã văn bia di tích!`};
}
pl.mental=Math.max(0,pl.mental - ruin.mentalCost);
this.exploredRuins.push(ruinId);
pl.primevalStones +=ruin.rewardStones||0;
ap.humanQi +=ruin.rewardHumanQi||0;
if (ruin.rewardImmStones) pl.addItem("immortal_stone",ruin.rewardImmStones);
this.addReputation(ruin.region,ruin.rewardRep||30);
let extraNotes=[];
if (ruin.secretArtId&&this.learnSecretArt(ruin.secretArtId)) {
const art=SECRET_ARTS_DB[ruin.secretArtId];
extraNotes.push(`📖 Lĩnh ngộ Bí Thuật 【${art.name}】`);
}
if (ruin.unlocksHiddenQuest&&this.unlockHiddenQuest(ruin.unlocksHiddenQuest)) {
const hq=HIDDEN_QUESTS_DB.find(q=>q.id===ruin.unlocksHiddenQuest);
extraNotes.push(`🔍 Mở khóa Nhiệm Vụ Ẩn 【${hq?hq.title :"Bí Ẩn"}】`);
}
if (this.game) this.game.autoSaveNow("explore_ruin");
return {
success:true,
ruin,
message:`🗿 Khám phá 【${ruin.name}】 thành công! Thu +${ruin.rewardStones}💎, +${ruin.rewardHumanQi} Nhân Khí, +${ruin.rewardRep} Danh Vọng ${ruin.regionName}${extraNotes.length?" | " + extraNotes.join(" & ") :""}!`
};
}
learnSecretArt(artId) {
if (!SECRET_ARTS_DB[artId]||this.learnedSecretArts.includes(artId)) return false;
this.learnedSecretArts.push(artId);
if (this.game&&this.game.player) this.game.player.recalculateStats();
return true;
}
getPassiveBonuses() {
const res={
hpPct:0,
atkPct:0,
defPct:0,
mentalPct:0,
dmgPct:0,
critChance:0,
lifestealBonus:0,
refineBonus:0,
cdReducePct:0,
stoneDropPct:0,
shopDiscount:0
};
const sect=this.getCurrentSect();
if (sect) {
const rInfo=this.getCurrentSectRankInfo();
res.hpPct +=rInfo.statBonusPct;
res.atkPct +=rInfo.statBonusPct;
res.defPct +=rInfo.statBonusPct;
if (sect.id==="co_nguyet_clan") res.stoneDropPct +=0.10;
else if (sect.id==="thuong_gia_guild") {res.shopDiscount +=0.10;res.critChance +=0.10;}
else if (sect.id==="truong_sinh_thien") {res.hpPct +=0.12;res.atkPct +=0.12;}
else if (sect.id==="tien_hac_mon") {res.refineBonus +=0.10;res.mentalPct +=0.15;}
else if (sect.id==="anh_tong_cult") {res.dmgPct +=0.15;}
}
for (const artId of this.learnedSecretArts) {
const art=SECRET_ARTS_DB[artId];
if (!art|| !art.bonuses) continue;
for (const [k,v] of Object.entries(art.bonuses)) {
if (res[k]!==undefined) res[k] +=v;
}
}
const maxTier=this.getRegionReputationTier(
Object.keys(this.reputation).sort((a,b)=>(this.reputation[b]||0) - (this.reputation[a]||0))[0]
);
res.shopDiscount=Math.min(0.35,res.shopDiscount + (maxTier.discount||0));
return res;
}
unlockHiddenQuest(hqId) {
if (!HIDDEN_QUESTS_DB.some(q=>q.id===hqId)) return false;
if (this.unlockedHiddenQuests.includes(hqId)||this.claimedHiddenQuests.includes(hqId)) return false;
this.unlockedHiddenQuests.push(hqId);
if (this.hiddenQuestProgress[hqId]===undefined) this.hiddenQuestProgress[hqId]=0;
return true;
}
recordEvent(eventType,key=null,amount=1) {
if (eventType==="mechanic_clear") this.stats.mechanicsCleared +=amount;
if (eventType==="battle_event") this.stats.eventsCompleted +=amount;
if (eventType==="auction_win") {
this.stats.auctionsWon +=amount;
this.unlockHiddenQuest("hq_auction_tycoon");
}
if (eventType==="tribulation_trial") this.stats.tribulationsCleared +=amount;
if (eventType==="secret_realm") this.stats.secretRealmsExplored +=amount;
if (eventType==="npc_affinity"&&amount>=50) {
this.unlockHiddenQuest("hq_npc_confidant");
}
for (const chain of QUEST_CHAINS) {
const idx=this.chainStepIndex[chain.chainId]||0;
const step=chain.steps[idx];
if (!step) continue;
if (step.eventType===eventType&&(!step.targetKey||String(step.targetKey)===String(key))) {
const prev=this.chainStepProgress[step.id]||0;
const next=Math.min(step.target,prev + amount);
this.chainStepProgress[step.id]=next;
if (next>=step.target) {
this._completeChainStep(chain,step);
}
}
}
for (const hqId of this.unlockedHiddenQuests) {
if (this.claimedHiddenQuests.includes(hqId)) continue;
const hq=HIDDEN_QUESTS_DB.find(q=>q.id===hqId);
if (!hq||hq.eventType!==eventType) continue;
if (hq.targetKey&&String(hq.targetKey)!==String(key)) continue;
const prev=this.hiddenQuestProgress[hqId]||0;
const next=eventType==="npc_affinity"
?Math.max(prev,amount)
:Math.min(hq.target,prev + amount);
this.hiddenQuestProgress[hqId]=next;
if (next>=hq.target) {
this._completeHiddenQuest(hq);
}
}
}
_completeChainStep(chain,step) {
const pl=this.game&&this.game.player;
const ui=this.game&&this.game.ui;
this.chainStepIndex[chain.chainId]=(this.chainStepIndex[chain.chainId]||0) + 1;
if (pl) {
pl.primevalStones +=step.rewardStones||0;
pl.meritPoints=(pl.meritPoints||0) + (step.rewardMerit||0);
if (step.rewardItem) pl.addItem(step.rewardItem,1);
if (step.rewardImmStones) pl.addItem("immortal_stone",step.rewardImmStones);
}
if (step.rewardRepRegion&&step.rewardRep) {
this.addReputation(step.rewardRepRegion,step.rewardRep);
}
if (step.rewardSecretArt) {
this.learnSecretArt(step.rewardSecretArt);
}
if (ui) {
ui.addLog(
`📜 Hoàn thành Nhiệm Vụ Chuỗi 【${step.title}】! Nhận 💎 +${step.rewardStones||0}, 🏅 +${step.rewardMerit||0}${step.rewardImmStones?`, 🌟 +${step.rewardImmStones} Tiên Thạch` :""}${step.rewardSecretArt?" & 📖 Bí Thuật Hồng Liên!" :""}`,
"loot"
);
}
}
_completeHiddenQuest(hq) {
if (this.claimedHiddenQuests.includes(hq.id)) return;
this.claimedHiddenQuests.push(hq.id);
const pl=this.game&&this.game.player;
const ap=this.game&&this.game.aperture;
const ui=this.game&&this.game.ui;
if (pl) {
pl.primevalStones +=hq.rewardStones||0;
if (hq.rewardItem) pl.addItem(hq.rewardItem,1);
if (hq.rewardImmStones) pl.addItem("immortal_stone",hq.rewardImmStones);
}
if (ap&&hq.rewardHumanQi) ap.humanQi +=hq.rewardHumanQi;
if (ui) {
ui.addLog(`🔍 Hoàn thành Nhiệm Vụ Ẩn 【${hq.title}】! Nhận 💎 +${hq.rewardStones||0}, ☯ +${hq.rewardHumanQi||0} Nhân Khí!`,"loot");
}
}
getAchievementProgress(ach) {
const pl=this.game&&this.game.player;
const ap=this.game&&this.game.aperture;
const enemies=this.game&&this.game.enemies;
switch (ach.statKey) {
case "kills":return pl?(pl.kills||0) :0;
case "mechanicsCleared":return this.stats.mechanicsCleared||0;
case "eventsCompleted":return this.stats.eventsCompleted||0;
case "ruinsExplored":return this.exploredRuins.length;
case "auctionsWon":return this.stats.auctionsWon||0;
case "sectRank":return this.sect.id?this.sect.rankLevel :0;
case "maxRegionRep":return this.getMaxRegionReputation();
case "maxNpcRelation":
if (!enemies|| !Array.isArray(enemies.npcs)) return 0;
return Math.max(0,...enemies.npcs.map(n=>n.relation||0));
case "rank":return ap?(ap.rank||1) :1;
case "tribulationsCleared":return this.stats.tribulationsCleared||0;
default:return 0;
}
}
claimAchievement(achId) {
const ach=ACHIEVEMENTS_DB.find(a=>a.id===achId);
if (!ach) return {success:false,message:"Thành tựu không tồn tại."};
if (this.claimedAchievements.includes(achId)) return {success:false,message:"Đã nhận thưởng thành tựu này rồi."};
const cur=this.getAchievementProgress(ach);
if (cur<ach.target) return {success:false,message:`Chưa đạt mốc thành tựu (${cur}/${ach.target})!`};
this.claimedAchievements.push(achId);
const pl=this.game&&this.game.player;
const ap=this.game&&this.game.aperture;
if (pl) {
pl.primevalStones +=ach.rewardStones||0;
if (ach.rewardImmStones) pl.addItem("immortal_stone",ach.rewardImmStones);
}
if (ap&&ach.rewardHumanQi) ap.humanQi +=ach.rewardHumanQi;
if (this.game) this.game.autoSaveNow("claim_achievement");
return {
success:true,
message:`🏆 Đạt Thành Tựu 【${ach.icon} ${ach.name}】! Thưởng 💎 +${ach.rewardStones||0}, ☯ +${ach.rewardHumanQi||0} Nhân Khí${ach.rewardImmStones?`, 🌟 +${ach.rewardImmStones} Tiên Thạch` :""}!`
};
}
getNpcRelationTier(relationScore) {
const score=Number(relationScore)||0;
let tier=NPC_RELATION_TIERS[0];
for (const t of NPC_RELATION_TIERS) {
if (score>=t.min) tier=t;
}
return tier;
}
giftNpc(npc,itemId) {
const pl=this.game&&this.game.player;
if (!npc|| !pl) return {success:false,message:"Không thể tặng quà lúc này."};
if (pl.getItemCount(itemId)<=0) return {success:false,message:"Không còn vật phẩm này trong hành trang!"};
const meta=global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[itemId];
if (!meta) return {success:false,message:"Vật phẩm không hợp lệ."};
pl.removeItem(itemId,1);
const gain=meta.rarity==="epic"||meta.rarity==="legendary"?28 :(meta.rarity==="rare"?18 :10);
npc.relation=(npc.relation||0) + gain;
this.stats.giftsGiven +=1;
this.recordEvent("npc_affinity",npc.id,npc.relation);
const tier=this.getNpcRelationTier(npc.relation);
return {
success:true,
message:`🎁 Đã tặng [${meta.name}] cho ${npc.name}! Hảo cảm +${gain} (Hiện tại: ${npc.relation} — ${tier.label}, giảm ${Math.round(tier.discount*100)}% giá mua)!`
};
}
toSaveData() {
return {
sect:this.sect,
reputation:this.reputation,
exploredRuins:this.exploredRuins,
learnedSecretArts:this.learnedSecretArts,
chainStepIndex:this.chainStepIndex,
chainStepProgress:this.chainStepProgress,
unlockedHiddenQuests:this.unlockedHiddenQuests,
hiddenQuestProgress:this.hiddenQuestProgress,
claimedHiddenQuests:this.claimedHiddenQuests,
claimedAchievements:this.claimedAchievements,
stats:this.stats
};
}
fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
if (data.sect&&typeof data.sect==="object") {
this.sect={...this.sect,...data.sect};
}
if (data.reputation&&typeof data.reputation==="object") {
this.reputation={...this.reputation,...data.reputation};
}
if (Array.isArray(data.exploredRuins)) this.exploredRuins=[...data.exploredRuins];
if (Array.isArray(data.learnedSecretArts)) this.learnedSecretArts=[...data.learnedSecretArts];
if (data.chainStepIndex&&typeof data.chainStepIndex==="object") {
this.chainStepIndex={...this.chainStepIndex,...data.chainStepIndex};
}
if (data.chainStepProgress&&typeof data.chainStepProgress==="object") {
this.chainStepProgress={...data.chainStepProgress,...data.chainStepProgress};
}
if (Array.isArray(data.unlockedHiddenQuests)) this.unlockedHiddenQuests=[...data.unlockedHiddenQuests];
if (data.hiddenQuestProgress&&typeof data.hiddenQuestProgress==="object") {
this.hiddenQuestProgress={...data.hiddenQuestProgress,...data.hiddenQuestProgress};
}
if (Array.isArray(data.claimedHiddenQuests)) this.claimedHiddenQuests=[...data.claimedHiddenQuests];
if (Array.isArray(data.claimedAchievements)) this.claimedAchievements=[...data.claimedAchievements];
if (data.stats&&typeof data.stats==="object") {
this.stats={...this.stats,...data.stats};
}
}
}
QuestManager.SECTS_DB=SECTS_DB;
QuestManager.SECT_RANKS=SECT_RANKS;
QuestManager.REPUTATION_TIERS=REPUTATION_TIERS;
QuestManager.ANCIENT_RUINS=ANCIENT_RUINS;
QuestManager.SECRET_ARTS_DB=SECRET_ARTS_DB;
QuestManager.QUEST_CHAINS=QUEST_CHAINS;
QuestManager.HIDDEN_QUESTS_DB=HIDDEN_QUESTS_DB;
QuestManager.ACHIEVEMENTS_DB=ACHIEVEMENTS_DB;
QuestManager.NPC_RELATION_TIERS=NPC_RELATION_TIERS;
global.QuestManager=QuestManager;
})(window);
