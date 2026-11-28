(function (global) {
"use strict";
const TK_SKINS={
long_thanh_thien:{
gender:"male",robeColor:"#0f3b2e",robeSecondary:"#1a5946",trimColor:"#38e8a8",beltColor:"#b89758",
capeColor:"#09241c",innerCollarColor:"#d8fff0",hairColor:"#14191e",hairStyle:"noble_crown",
skinTone:"#e3cfb8",eyeColor:"#38e8a8",crownColor:"#38e8a8",auraColor:"rgba(56,232,168,0.32)",
particleColor:"#38e8a8",specialFeature:"poison_bamboo_aura"
},
bach_ngung_bang:{
gender:"female",robeColor:"#e8f3fa",robeSecondary:"#b0d4eb",trimColor:"#4ce6ff",beltColor:"#85c1e9",
innerCollarColor:"#ffffff",hairColor:"#f2f8ff",hairStyle:"silver_long",
skinTone:"#f7eae0",eyeColor:"#00c8ff",crownColor:"#bff0ff",auraColor:"rgba(116,234,255,0.32)",
particleColor:"#ffffff",specialFeature:"frost_crystals"
},
chuong_tam_tam:{
gender:"male",robeColor:"#3b2d22",robeSecondary:"#594433",trimColor:"#5aa9e6",beltColor:"#8c6b3a",
capeColor:"#261c15",hairColor:"#211a14",hairStyle:"demonic_wild",
skinTone:"#deb895",eyeColor:"#5aa9e6",crownColor:"#5aa9e6",auraColor:"rgba(90,169,230,0.26)",particleColor:"#5aa9e6"
},
cuu_cuu:{
gender:"male",hasBeard:true,robeColor:"#181c21",robeSecondary:"#26332c",trimColor:"#52e3a8",beltColor:"#8a998e",
capeColor:"#111715",hairColor:"#4d555e",hairStyle:"demonic_wild",
skinTone:"#d6c5b3",eyeColor:"#52e3a8",crownColor:"#52e3a8",auraColor:"rgba(82,227,168,0.28)",
particleColor:"#52e3a8",specialFeature:"medicine_gourd"
},
dich_hoa:{
gender:"male",isArmored:true,robeColor:"#59110d",robeSecondary:"#9c1e16",trimColor:"#ff6b35",beltColor:"#ffd700",
capeColor:"#420a07",hairColor:"#2b0907",hairStyle:"war_helm",
skinTone:"#e3bfa1",eyeColor:"#ff5733",crownColor:"#ffd700",auraColor:"rgba(255,87,51,0.38)",
particleColor:"#ff6b35",specialFeature:"martial_flames"
},
duc_trung:{
gender:"male",isArmored:true,robeColor:"#12355c",robeSecondary:"#1d5896",trimColor:"#4ce6ff",beltColor:"#1c2633",
capeColor:"#0c213b",hairColor:"#0e1e33",hairStyle:"war_helm",
skinTone:"#cde0eb",eyeColor:"#4ce6ff",crownColor:"#4ce6ff",auraColor:"rgba(76,230,255,0.32)",
particleColor:"#4ce6ff",specialFeature:"shark_fins"
},
khong_nhat_thien:{
gender:"male",robeColor:"#3d2247",robeSecondary:"#613670",trimColor:"#ffb3d9",beltColor:"#e2bf75",
innerCollarColor:"#fff0f7",hairColor:"#1c1221",hairStyle:"jade_hairpin",
skinTone:"#f2d8c5",eyeColor:"#ff9be0",crownColor:"#ffb3d9",auraColor:"rgba(255,155,224,0.30)",
particleColor:"#ffb3d9",specialFeature:"flower_rain"
},
phong_thien_ngu:{
gender:"male",hasBeard:true,robeColor:"#2e241b",robeSecondary:"#4f3d2e",trimColor:"#7ef7f0",beltColor:"#b89758",
capeColor:"#1f1812",hairColor:"#cfd6de",hairStyle:"elder_sage",
skinTone:"#e0c5aa",eyeColor:"#7ef7f0",crownColor:"#7ef7f0",auraColor:"rgba(126,247,240,0.28)",particleColor:"#7ef7f0"
},
tieu_mang:{
gender:"male",robeColor:"#f2f6fa",robeSecondary:"#d2dfeb",trimColor:"#ffd700",beltColor:"#d4af37",
capeColor:"#dde7f0",innerCollarColor:"#ffffff",hairColor:"#181c24",hairStyle:"noble_crown",
skinTone:"#f2d9c2",eyeColor:"#ffd700",crownColor:"#ffd700",auraColor:"rgba(255,242,166,0.40)",
particleColor:"#fff2a6",specialFeature:"light_sun_halo"
},
ma_vo_thien:{
gender:"male",robeColor:"#1a1026",robeSecondary:"#2e1845",trimColor:"#b75cff",beltColor:"#d4af37",
capeColor:"#12091c",hairColor:"#0c0a12",hairStyle:"demonic_wild",
skinTone:"#ebd3c5",eyeColor:"#c56cf0",crownColor:"#b75cff",auraColor:"rgba(183,92,255,0.38)",
particleColor:"#c56cf0",specialFeature:"soul_shadows"
},
ho_mi_nhi:{
gender:"female",robeColor:"#75183e",robeSecondary:"#b0285e",trimColor:"#ff85a2",beltColor:"#ffd700",
innerCollarColor:"#ffe8f0",hairColor:"#170d12",hairStyle:"jade_hairpin",
skinTone:"#f7decb",eyeColor:"#ff85a2",crownColor:"#ffd700",auraColor:"rgba(255,133,162,0.30)",
particleColor:"#ff85a2",specialFeature:"flower_rain"
},
ly_nhan:{
gender:"male",robeColor:"#28364a",robeSecondary:"#3b4f6b",trimColor:"#94b8d7",beltColor:"#b89758",
capeColor:"#1b2533",hairColor:"#14181f",hairStyle:"noble_crown",
skinTone:"#ebd0b5",eyeColor:"#85c1e9",crownColor:"#b89758",auraColor:"rgba(133,193,233,0.24)",particleColor:"#85c1e9"
},
viem_quan:{
gender:"male",robeColor:"#421810",robeSecondary:"#782c1d",trimColor:"#ff9f43",beltColor:"#d4af37",
capeColor:"#2b0f0a",hairColor:"#1c100d",hairStyle:"noble_crown",
skinTone:"#eed2b8",eyeColor:"#ff9f43",crownColor:"#ffd700",auraColor:"rgba(255,159,67,0.30)",
particleColor:"#ff9f43",specialFeature:"martial_flames"
},
thiet_nhuoc_nam:{
gender:"female",isArmored:true,robeColor:"#1f242e",robeSecondary:"#343c4d",trimColor:"#d4af37",beltColor:"#ffd700",
capeColor:"#161922",hairColor:"#0e1014",hairStyle:"war_helm",
skinTone:"#f2d9c2",eyeColor:"#ffd700",crownColor:"#ffd700",auraColor:"rgba(212,175,55,0.30)",particleColor:"#ffd700"
},
thiet_bach_ky:{
gender:"male",hasBeard:true,hasThirdEye:true,robeColor:"#232833",robeSecondary:"#3c4354",trimColor:"#e6e8ed",beltColor:"#d4af37",
capeColor:"#171b24",hairColor:"#dce3ed",hairStyle:"elder_sage",
skinTone:"#e3ccb5",eyeColor:"#ffd700",crownColor:"#ffd700",auraColor:"rgba(230,232,237,0.36)",particleColor:"#ffffff"
},
thiet_lao:{
gender:"male",hasBeard:true,robeColor:"#25272e",robeSecondary:"#3c404a",trimColor:"#b89758",beltColor:"#d4af37",
capeColor:"#1a1c22",hairColor:"#c2c9d4",hairStyle:"elder_sage",
skinTone:"#dec4aa",eyeColor:"#e2bf75",crownColor:"#b89758",auraColor:"rgba(184,151,88,0.26)",particleColor:"#b89758"
},
tieu_ho_tien:{
gender:"female",isFoxSpirit:true,robeColor:"#ffe6f2",robeSecondary:"#ffc2e0",trimColor:"#ff77b7",beltColor:"#ffd700",
innerCollarColor:"#ffffff",hairColor:"#2b1b24",hairStyle:"fairy_buns",
skinTone:"#fff0e6",eyeColor:"#ff4da6",crownColor:"#ff85c2",auraColor:"rgba(255,155,224,0.38)",
particleColor:"#ffb8e6",specialFeature:"jade_lotus"
},
phuong_kim_hoang:{
gender:"female",foreheadMark:"phoenix",robeColor:"#801635",robeSecondary:"#bf2852",trimColor:"#ffd700",beltColor:"#ffeaa7",
innerCollarColor:"#fff5e6",hairColor:"#140d12",hairStyle:"immortal_lotus",
skinTone:"#f7decb",eyeColor:"#ff9f43",crownColor:"#ffd700",auraColor:"rgba(255,165,220,0.36)",
particleColor:"#ffd700",specialFeature:"phoenix_halo"
},
phuong_chinh:{
gender:"male",robeColor:"#21354a",robeSecondary:"#345270",trimColor:"#dce8f2",beltColor:"#b89758",
capeColor:"#152433",hairColor:"#0c0e12",hairStyle:"noble_crown",
skinTone:"#e3c6ad",eyeColor:"#3b8beb",crownColor:"#dce8f2",auraColor:"rgba(133,193,233,0.28)",particleColor:"#85c1e9"
},
thien_hac_thuong_nhan:{
gender:"male",hasBeard:true,robeColor:"#e8f1f8",robeSecondary:"#c7daeb",trimColor:"#7ef7f0",beltColor:"#d4af37",
capeColor:"#d2e3f0",innerCollarColor:"#ffffff",hairColor:"#f2f5f8",hairStyle:"elder_sage",
skinTone:"#f2e6dc",eyeColor:"#7ef7f0",crownColor:"#7ef7f0",auraColor:"rgba(126,247,240,0.40)",particleColor:"#ffffff"
},
ung_sinh_co:{
gender:"male",robeColor:"#1e2836",robeSecondary:"#314157",trimColor:"#7ef7c4",beltColor:"#8c9aa8",
capeColor:"#141b24",hairColor:"#11151c",hairStyle:"demonic_wild",
skinTone:"#e6cbb3",eyeColor:"#7ef7c4",crownColor:"#7ef7c4",auraColor:"rgba(126,247,196,0.24)",particleColor:"#7ef7c4"
},
tieu_that_tinh:{
gender:"male",foreheadMark:"star",robeColor:"#262045",robeSecondary:"#3f3570",trimColor:"#c56cf0",beltColor:"#d4af37",
capeColor:"#191430",hairColor:"#141124",hairStyle:"star_crown",
skinTone:"#ebd1ba",eyeColor:"#c56cf0",crownColor:"#ffd700",auraColor:"rgba(197,108,240,0.30)",
particleColor:"#c56cf0",specialFeature:"orbiting_stars"
}
};

// ==============================================================================
// HIGH-CRAFT 2D XIANXIA ARCHITECTURAL DRAWING PRIMITIVES (5 WORLDS)
// ==============================================================================
const WORLD_META={
bronze_hall:{
id:"bronze_hall",
name:"Thanh Đồng Đại Điện",
subtitle:"Thế Giới 1 • Tâm Điểm Tam Vương Phúc Địa & Gò Khuyển Trận",
lore:"Tòa cổ điện bằng thanh đồng tọa lạc trên đỉnh gò cao giữa Tam Vương Phúc Địa, nơi Địa Linh Bá Quy gìn giữ Cửu Long Thanh Đồng Đỉnh và những giọt Thanh Đề Tiên Nguyên cuối cùng.",
width:2600,height:2200,themeColor:"#ffd700",defaultSpawn:{x:1300,y:1010}
},
poison_grove:{
id:"poison_grove",
name:"Độc Mù Trúc Lâm",
subtitle:"Thế Giới 2 • Đầm Độc Bích Thủy & Đình Độc Trúc Bát Giác",
lore:"Khu rừng thanh trúc quanh năm chìm trong làn độc mù xanh thẫm bốc lên từ Đầm Độc Bích Thủy — nơi Ngũ Chuyển Độc Đạo Long Thanh Thiên đang ẩn thân mang theo Cổ Bích Không quý hiếm.",
width:2600,height:2000,themeColor:"#38e8a8",defaultSpawn:{x:1300,y:1760}
},
dog_forest:{
id:"dog_forest",
name:"Rừng Đá Khuyển Vương",
subtitle:"Thế Giới 3 • Mê Cung Thạch Trụ & Đấu Trường Cột Sáng Lam",
lore:"Vùng rừng đá hiểm trở bao quanh Cột Sáng Lam của Truyền Thừa Khuyển Vương, nơi Ngự Thú Đại Sư Chương Tam Tam đang truy tìm bí mật nô thú và giữ trong tay Cổ Nô Lệ Ngũ Chuyển.",
width:2600,height:2100,themeColor:"#5aa9e6",defaultSpawn:{x:1300,y:1830}
},
bao_wasteland:{
id:"bao_wasteland",
name:"Hoang Nguyên Bạo Vương",
subtitle:"Thế Giới 4 • Vực Dung Nham & Đài Hỏa Trì Bạo Vương",
lore:"Vùng hoang nguyên rực lửa bị Vực Dung Nham chia cắt, dẫn qua hai nhịp Cầu Hắc Diện Thạch tới Đài Hỏa Trì Bạo Vương — nơi Quỷ Sát Nhân Y Cừu Cửu nắm giữ bí mật Sinh Tử Môn đang dừng chân.",
width:2600,height:2100,themeColor:"#ff5733",defaultSpawn:{x:1300,y:1830}
},
xin_temple:{
id:"xin_temple",
name:"Cổ Tự Tín Vương",
subtitle:"Thế Giới 5 • Sơn Môn Cổ Tự & Chính Điện Truyền Thừa Tín Vương",
lore:"Ngôi cổ tự uy nghiêm xây bằng đá vàng đồng rêu phong quanh Cột Sáng Vàng Tín Vương — nơi cất giữ Cổ Trăm Trận Trăm Thắng Ngũ Chuyển có năng lực luyện cổ một lần tất thành!",
width:2600,height:2000,themeColor:"#f7c948",defaultSpawn:{x:1300,y:1760}
},
outer_battlefield:{
id:"outer_battlefield",
name:"Chiến Trường Ngoại Vi Tam Xoa Sơn",
subtitle:"Thế Giới 6 • Doanh Trại Chính Đạo, Trại Quần Ma & Phòng Tuyến Mê Vụ",
lore:"Khu vực rộng lớn bao quanh Gò Thanh Đồng phía ngoài màn sương mù — nơi Chính Đạo (Tiêu Mang, Thiết Nhược Nam, Thiết Bạch Kỳ, bốn vị Trưởng Lão Thiết Gia) và Ma Đạo (Cừu Cửu, Ma Vô Thiên, Hồ Mị Nhi, Lý Nhàn, Dịch Hỏa, Dực Trùng, Khổng Nhật Thiên) cùng quy tụ chờ giờ tổng công kích!",
width:2800,height:2200,themeColor:"#ff9f43",defaultSpawn:{x:1400,y:1780}
},
sky_light_river:{
id:"sky_light_river",
name:"Thiên Bộc Quang Hà — Không Gian Trên Cao",
subtitle:"Thế Giới Trên Không • Ánh Sáng Vinh Quang Thái Cổ",
lore:"Thác ánh sáng khổng lồ do sát chiêu Ngũ Chuyển Thiên Bộc Quang Hà của Tiêu Mang đổ ngược từ chín tầng trời phá toác nóc Thanh Đồng Đại Điện — nơi Phương Nguyên giương Cổ Cốt Dực, khoác Cổ Kim Thang bay ngược dòng luyện Lục Chuyển Tiên Cổ Định Tiên Du!",
width:1600,height:1200,themeColor:"#fff2a6",defaultSpawn:{x:800,y:720}
},
dang_hun_mountain:{
id:"dang_hun_mountain",
name:"Đỉnh Núi Đãng Hồn — Phúc Địa Hồ Tiên",
subtitle:"Thế Giới 7 • Trung Châu • Núi Thiên Thê & Đãng Hồn Cung",
lore:"Thánh địa kỳ tuyệt của Trung Châu với toàn thân núi kết tinh bằng pha lê hồng tím chấn động hồn phách — nơi mười đại cổ phái đang tranh đoạt quyền sở hữu Phúc Địa Hồ Tiên ngay trước giây phút lục quang Định Tiên Du giáng lâm!",
width:2600,height:2200,themeColor:"#ff85d5",defaultSpawn:{x:1300,y:990}
}
};

global.ThreeKingsWorlds=global.ThreeKingsWorlds||{};
global.ThreeKingsWorlds.TK_SKINS=TK_SKINS;
global.ThreeKingsWorlds.WORLD_META=WORLD_META;
})(window);
