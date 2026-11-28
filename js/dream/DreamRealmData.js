(function (global) {
"use strict";

const DREAM_TRIAL_CONFIGS={
dream_co_nguyet:{
mode:"soul_survival",
modeLabel:"🩸 Sinh Tồn Huyết Hồ",
badgeColor:"#ff5252",
bgA:"#29090e",bgB:"#0c0305",accent:"#ff5252",accent2:"#ffd700",hazard:"#ff2a2a",
protagonistSkin:"phuong_nguyen",
duration:26,
orbTarget:8,
hazardRate:1.0,
hazardSpeed:155,
gateTitle:"HUYẾT HỒ CỔ NGUYỆT",
introQuote:"\"Huyết Đạo nhập mộng — giữa Huyết Hồ cuộn sóng, kẻ giữ vững tâm thần thu gom Huyết Tinh mới lĩnh ngộ được chân ý!\""
},
dream_bach_cot:{
mode:"star_chess",
modeLabel:"🦴 Giải Trận Cốt Đạo",
badgeColor:"#dce8f2",
bgA:"#1a2029",bgB:"#090b10",accent:"#7ef7f0",accent2:"#dce8f2",hazard:"#95a5a6",
rounds:2,
gridSize:3,
scrambleSteps:4,
maxMoves:12,
timeLimit:65,
boardTitle:"BẠCH CỐT TRẬN ĐỒ",
introQuote:"\"Hôi Cốt Tài Tuấn lưu lại trận đồ cốt đạo — thắp sáng toàn bộ Cốt Tinh Nhãn để phá giải huyền cơ!\""
},
dream_tam_vuong:{
mode:"lotus_duel",
modeLabel:"🔥 Nhập Vai Tam Vương",
badgeColor:"#ff9f43",
bgA:"#2b150c",bgB:"#0d0604",accent:"#ff6b35",accent2:"#ffd700",hazard:"#ff4500",
protagonistSkin:"hac_lau_lan",
protagonistName:"Hỏa Hồn Tam Vương",
bossName:"Hồn Lò Tam Vương Kiếp",
bossColor:"#ff5733",
bossHp:950,
timeLimit:55,
skills:[
{name:"Liệt Diễm Đao",icon:"🔥",cd:0.32},
{name:"Bạo Vương Nộ Hống",icon:"💥",cd:3.4},
{name:"Tín Vương Luyện Tâm",icon:"⏳",cd:8.0}
],
introQuote:"\"Hồi ức Tam Vương Sơn bùng cháy — khống chế Hỏa Hồn, phá vỡ Hồn Lò Kiếp để đoạt chân ý Luyện & Nô Đạo!\""
},
dream_chan_duong:{
mode:"soul_survival",
modeLabel:"🎲 Sinh Tồn Chân Dương Lâu",
badgeColor:"#ffd700",
bgA:"#29200b",bgB:"#0d0904",accent:"#ffd700",accent2:"#7ef7c4",hazard:"#ff9f43",
protagonistSkin:"phuong_cuu_ca",
duration:32,
orbTarget:10,
hazardRate:1.18,
hazardSpeed:175,
gateTitle:"CHÂN DƯƠNG VẬN ĐÀN",
introQuote:"\"Khí vận Cự Dương Tiên Tôn xoay chuyển vô thường — né tránh Kiếp Vận Quang Trụ và thu gom Kim Vận Châu!\""
},
dream_tinh_tu:{
mode:"star_chess",
modeLabel:"⭐ Tinh Tượng Kỳ Cục",
badgeColor:"#4ce6ff",
bgA:"#0c1c38",bgB:"#050914",accent:"#7ef7f0",accent2:"#ffd700",hazard:"#3b8beb",
rounds:3,
gridSize:4,
scrambleSteps:5,
maxMoves:16,
timeLimit:85,
boardTitle:"TINH TƯỢNG KỲ CỤC — TINH TÚ TIÊN TÔN",
introQuote:"\"Ba triệu năm mưu tính hóa thành Tinh Tượng Kỳ Cục. Nối thông toàn bộ Tinh Thần Kỳ Tử để phá ván cờ Trí Đạo!\""
},
dream_hong_lien:{
mode:"lotus_duel",
modeLabel:"🪷 Nhập Vai Hồng Liên",
badgeColor:"#ff4d4d",
bgA:"#2e0a12",bgB:"#0b0306",accent:"#ff3b30",accent2:"#ffd700",hazard:"#ffeaa7",
protagonistSkin:"hong_lien",
protagonistName:"Hồng Liên Ma Tôn",
bossName:"Ý Chí Túc Mệnh (Thiên Đình)",
bossColor:"#ffd700",
bossHp:1350,
timeLimit:65,
skills:[
{name:"Xuân Thu Phi Nhận",icon:"🌙",cd:0.30},
{name:"Hồng Liên Nộ Phóng",icon:"🪷",cd:3.4},
{name:"Quang Âm Nghịch Chuyển",icon:"⏳",cd:8.2}
],
introQuote:"\"Ngươi hóa thân thành Hồng Liên Ma Tôn giữa Quang Âm Trường Hà! Dùng Xuân Thu & Quang Âm Nghịch Chuyển đánh nát Ý Chí Túc Mệnh!\""
},
dream_nguyen_lien:{
mode:"star_chess",
modeLabel:"🪷 Linh Mạch Kỳ Trận",
badgeColor:"#5cc995",
bgA:"#0d261a",bgB:"#040d09",accent:"#7ef7c4",accent2:"#ffd700",hazard:"#2ecc71",
rounds:3,
gridSize:4,
scrambleSteps:5,
maxMoves:16,
timeLimit:85,
boardTitle:"THANH LIÊN LINH MẠCH TRẬN",
introQuote:"\"Nguyên Liên Tiên Tôn khai mở đại đạo sinh cơ — khơi thông toàn bộ mạch sen linh khí để lĩnh ngộ Mộc & Thời Gian Đạo!\""
},
dream_u_hon:{
mode:"soul_survival",
modeLabel:"👻 Sinh Tử Môn Sinh Tồn",
badgeColor:"#b75cff",
bgA:"#1c0a2e",bgB:"#07030d",accent:"#c56cf0",accent2:"#7ef7f0",hazard:"#ff2a2a",
protagonistSkin:"u_hon",
duration:40,
orbTarget:14,
hazardRate:1.45,
hazardSpeed:200,
gateTitle:"SINH TỬ MÔN — U HỒN MA TÔN",
introQuote:"\"Sát tính thao thiên nơi Sinh Tử Môn! Sống sót 40 giây giữa luồng Sát Khí U Hồn và thu thập Hồn Hạch để đắc đạo Tông Sư!\""
},
dream_tien_canh_cuong_man:{
mode:"lotus_duel",
modeLabel:"🦁 Quyết Chiến Cuồng Man",
badgeColor:"#ff6b35",
bgA:"#24120a",bgB:"#090503",accent:"#ff9f43",accent2:"#ff5252",hazard:"#e67e22",
protagonistSkin:"hac_lau_lan",
protagonistName:"Cuồng Man Chiến Ý",
bossName:"Thái Cổ Thú Tôn Huyễn Ảnh",
bossColor:"#ff6b35",
bossHp:1650,
timeLimit:70,
skills:[
{name:"Man Lực Quyền Cương",icon:"👊",cd:0.30},
{name:"Thú Vương Hư Ảnh",icon:"🦁",cd:3.3},
{name:"Huyết Chiến Nghịch Thế",icon:"⏳",cd:8.0}
],
introQuote:"\"Nam nhi phải ngang tàng như thế! Nhập mộng hóa thân Cuồng Man Chiến Ý, nghiền nát Thái Cổ Thú Tôn Huyễn Ảnh!\""
},
dream_vo_cuc_hon_don:{
mode:"star_chess",
modeLabel:"🌌 Vô Cực Thiên Địa Trận",
badgeColor:"#b75cff",
bgA:"#150a29",bgB:"#06030d",accent:"#b75cff",accent2:"#ffd700",hazard:"#00e5ff",
rounds:3,
gridSize:4,
scrambleSteps:6,
maxMoves:18,
timeLimit:95,
boardTitle:"VÔ CỰC THIÊN ĐỊA KỲ CỤC",
introQuote:"\"Bàn cờ Thiên Địa tại Tầng Chín Phong Ma Quật — dung hợp toàn bộ Đạo Tinh để chạm tới chân ý Vô Cực Ma Tôn!\""
}
};

function getDreamTrialConfig(dreamId) {
return DREAM_TRIAL_CONFIGS[dreamId]||DREAM_TRIAL_CONFIGS.dream_co_nguyet;
}

global.VanCoDreamData={
DREAM_TRIAL_CONFIGS,
getDreamTrialConfig
};
})(window);
