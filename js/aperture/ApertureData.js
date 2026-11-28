(function (global) {
"use strict";
const MIN_ASCENSION_HUMAN_QI=240;
const VENERABLE_REQ_DAO_MARKS=300000;
const VENERABLE_REQ_MYRIAD_TRIBULATIONS=3;
const APTITUDE_TIERS={
D:{
id:"D",
name:"Đinh Đẳng",
minSea:20,
maxSea:39,
baseRegen:0.22,
cultivateMult:0.60,
breakthroughBonus:-0.12,
desc:"Dung lượng biển nguyên thấp (20–39%), hồi phục rất chậm, tu luyện gian nan, phải dựa vào Tửu Trùng, Xá Lợi Cổ và cơ duyên."
},
C:{
id:"C",
name:"Bính Đẳng",
minSea:40,
maxSea:59,
baseRegen:0.45,
cultivateMult:0.90,
breakthroughBonus:-0.02,
desc:"Dung lượng biển nguyên trung bình (40–59%), tốc độ tu luyện bình thường, cần tích lũy tài nguyên kiên trì."
},
B:{
id:"B",
name:"Ất Đẳng",
minSea:60,
maxSea:79,
baseRegen:0.85,
cultivateMult:1.25,
breakthroughBonus:0.06,
desc:"Dung lượng biển nguyên khá (60–79%), hạt giống nòng cốt của các gia tộc."
},
A:{
id:"A",
name:"Giáp Đẳng",
minSea:80,
maxSea:99,
baseRegen:1.40,
cultivateMult:1.65,
breakthroughBonus:0.14,
desc:"Dung lượng biển nguyên lớn (80–99%), thiên phú tu luyện thượng thừa, có tiềm năng chạm tới Ngũ Chuyển."
},
TEN_EXTREME:{
id:"TEN_EXTREME",
name:"Thập Tuyệt Thể",
minSea:100,
maxSea:100,
baseRegen:2.80,
cultivateMult:2.65,
breakthroughBonus:0.25,
desc:"Dung lượng biển nguyên viên mãn 100%, nhân khí cực kỳ dồi dào, chắc chắn kết thành Siêu Cấp Phúc Địa khi thăng tiên, nhưng ở Phàm Cảnh áp lực lên Không Khiếu tăng đều 1% mỗi 45 giây và chỉ reset về 0% khi đột phá lên một Đại Cảnh Giới mới — nếu đạt 100% sẽ BẠO TẠC CHẾT HẲN!"
},
SPECIAL_DREAM:{
id:"SPECIAL_DREAM",
name:"Thuần Mộng Cầu Chân Thể",
minSea:100,
maxSea:100,
baseRegen:2.60,
cultivateMult:2.25,
breakthroughBonus:0.22,
isArtificial:true,
desc:"Thể chất đặc thù từ Mộng Đạo, biển nguyên 100%, tốc độ tu luyện cực nhanh."
}
};
const TEN_EXTREME_PHYSIQUES=[
{
id:"thai_nhat_duong_mang",
name:"Thái Nhật Dương Mãng Thể",
favoredPaths:["Quang Đạo","Thời Gian Đạo","Viêm Đạo"],
guPowerBonus:0.25,
pressureRate:0.035,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Tương thích cực cao với Thời Gian Đạo và Quang Đạo."
},
{
id:"co_nguyet_am_hoang",
name:"Cổ Nguyệt Âm Hoang Thể",
favoredPaths:["Ám Đạo","Không Gian Đạo","Hồn Đạo"],
guPowerBonus:0.25,
pressureRate:0.035,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Mang khí tức âm hàn cổ xưa, tăng cường cổ trùng Ám Đạo và Không Gian Đạo."
},
{
id:"bac_minh_bang_phach",
name:"Bắc Minh Băng Phách Thể",
favoredPaths:["Băng Đạo","Thủy Đạo"],
guPowerBonus:0.25,
pressureRate:0.035,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Hàn khí cực hạn, tăng mạnh uy lực cổ trùng Băng Đạo và Thủy Đạo."
},
{
id:"sam_hai_luan_hoi",
name:"Sâm Hải Luân Hồi Thể",
favoredPaths:["Mộc Đạo"],
guPowerBonus:0.25,
pressureRate:0.032,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Sinh cơ dồi dào, tương thích tuyệt đối với Mộc Đạo."
},
{
id:"viem_hoang_loi_trach",
name:"Viêm Hoàng Lôi Trạch Thể",
favoredPaths:["Viêm Đạo","Lôi Đạo"],
guPowerBonus:0.25,
pressureRate:0.038,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Chứa đựng uy năng hỏa diễm và lôi đình cuồng bạo."
},
{
id:"van_kim_dieu_hoa",
name:"Vạn Kim Diệu Hoa Thể",
favoredPaths:["Kim Đạo","Kiếm Đạo"],
guPowerBonus:0.25,
pressureRate:0.035,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Sắc bén vô song, tăng cường cổ trùng Kim Đạo."
},
{
id:"dai_luc_chan_vu",
name:"Đại Lực Chân Vũ Thể",
favoredPaths:["Lực Đạo"],
guPowerBonus:0.28,
pressureRate:0.035,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Nội hàm thần lực bẩm sinh, phát huy cực đại uy năng Lực Đạo."
},
{
id:"tieu_dao_tri_tam",
name:"Tiêu Dao Trí Tâm Thể",
favoredPaths:["Trí Đạo"],
guPowerBonus:0.25,
pressureRate:0.030,
isCanonical:true,
desc:"Một trong Thập Tuyệt Thể nguyên thủy. Tư duy nhạy bén, tăng mạnh hiệu quả thôi diễn sát chiêu và cổ trùng Trí Đạo."
},
{
id:"hau_tho_nguyen_uong",
name:"Hậu Thổ Nguyên Ương Thể",
favoredPaths:["Thổ Đạo"],
guPowerBonus:0.25,
pressureRate:0.030,
isCanonical:false,
isExtended:true,
desc:"[Thiết kế mở rộng] Thể chất đại diện cho Thổ Đạo trầm ổn, gia tăng phòng ngự và nền tảng địa khí."
},
{
id:"vu_tru_dai_dien",
name:"Vũ Trụ Đại Diễn Thể",
favoredPaths:["Luyện Đạo","Vận Đạo","Không Gian Đạo"],
guPowerBonus:0.25,
pressureRate:0.035,
isCanonical:false,
isExtended:true,
desc:"[Thiết kế mở rộng] Thể chất thiên về diễn hóa quy luật thiên địa và hỗ trợ Luyện Đạo."
}
];
const MORTAL_SUBSTAGES=[
{
index:0,
name:"Sơ Giai",
wallName:"Khinh Mạc (Màng Ánh Sáng)",
statMult:1.0,
wallHpMax:100,
immortalTribulationsReq:14
},
{
index:1,
name:"Trung Giai",
wallName:"Thủy Mạc (Màng Nước)",
statMult:1.45,
wallHpMax:180,
immortalTribulationsReq:20
},
{
index:2,
name:"Cao Giai",
wallName:"Thạch Mạc (Màng Đá)",
statMult:2.05,
wallHpMax:300,
immortalTribulationsReq:28
},
{
index:3,
name:"Đỉnh Phong",
wallName:"Tinh Mạc (Màng Kết Tinh)",
statMult:2.85,
wallHpMax:450,
immortalTribulationsReq:36
},
{
index:4,
name:"Á Tiên Tôn",
wallName:"Thái Cổ Động Thiên Cực Hạn",
statMult:3.60,
wallHpMax:700,
immortalTribulationsReq:3
}
];
const MORTAL_RANKS={
1:{
rank:1,
name:"Nhất Chuyển",
essenceName:"Thanh Đồng Chân Nguyên",
shortEssence:"Thanh Đồng",
cssClass:"essence-rank-1",
colorPrimary:"#196b4d",
colorSecondary:"#38c992",
densityMultiplier:1,
baseWallReq:1200
},
2:{
rank:2,
name:"Nhị Chuyển",
essenceName:"Xích Thiết Chân Nguyên",
shortEssence:"Xích Thiết",
cssClass:"essence-rank-2",
colorPrimary:"#801f19",
colorSecondary:"#e6483d",
densityMultiplier:8,
baseWallReq:4800
},
3:{
rank:3,
name:"Tam Chuyển",
essenceName:"Bạch Ngân Chân Nguyên",
shortEssence:"Bạch Ngân",
cssClass:"essence-rank-3",
colorPrimary:"#6e7d85",
colorSecondary:"#e1eef5",
densityMultiplier:64,
baseWallReq:18000
},
4:{
rank:4,
name:"Tứ Chuyển",
essenceName:"Hoàng Kim Chân Nguyên",
shortEssence:"Hoàng Kim",
cssClass:"essence-rank-4",
colorPrimary:"#8f6812",
colorSecondary:"#f7c948",
densityMultiplier:512,
baseWallReq:65000
},
5:{
rank:5,
name:"Ngũ Chuyển",
essenceName:"Tử Tinh Chân Nguyên",
shortEssence:"Tử Tinh",
cssClass:"essence-rank-5",
colorPrimary:"#531b8f",
colorSecondary:"#b75cff",
densityMultiplier:4096,
baseWallReq:220000
}
};
const IMMORTAL_RANKS={
6:{
rank:6,
name:"Lục Chuyển",
titleSuffix:"Cổ Tiên",
essenceName:"Lục Đề Tiên Nguyên",
apertureType:"Phúc Địa",
cssClass:"essence-rank-6",
colorPrimary:"#4cd964",
beadValueInRank6:1
},
7:{
rank:7,
name:"Thất Chuyển",
titleSuffix:"Cổ Tiên",
essenceName:"Hồng Táo Tiên Nguyên",
apertureType:"Phúc Địa",
cssClass:"essence-rank-7",
colorPrimary:"#ff3b30",
beadValueInRank6:100
},
8:{
rank:8,
name:"Bát Chuyển",
titleSuffix:"Cổ Tiên",
essenceName:"Bạch Lệ Tiên Nguyên",
apertureType:"Động Thiên",
cssClass:"essence-rank-8",
colorPrimary:"#d9ecff",
beadValueInRank6:10000
},
9:{
rank:9,
name:"Cửu Chuyển",
titleSuffix:"Tôn Giả",
essenceName:"Hoàng Hạnh Tiên Nguyên",
apertureType:"Chí Tôn Động Thiên",
cssClass:"essence-rank-9",
colorPrimary:"#ffcc00",
beadValueInRank6:1000000
}
};
const BLESSED_LAND_GRADES={
SMALL:{
id:"SMALL",
name:"Tiểu Cấp Phúc Địa",
minSpaceAcres:1500,
maxSpaceAcres:2900,
timeRatio:10,
essenceBeadPerYear:10
},
MEDIUM:{
id:"MEDIUM",
name:"Trung Cấp Phúc Địa",
minSpaceAcres:3200,
maxSpaceAcres:5900,
timeRatio:16,
essenceBeadPerYear:18
},
LARGE:{
id:"LARGE",
name:"Đại Cấp Phúc Địa",
minSpaceAcres:6200,
maxSpaceAcres:9800,
timeRatio:24,
essenceBeadPerYear:30
},
SUPER:{
id:"SUPER",
name:"Siêu Cấp Phúc Địa",
minSpaceAcres:10500,
maxSpaceAcres:18000,
timeRatio:36,
essenceBeadPerYear:50
}
};
const RITUAL_STEPS_DATA=[
{
step:1,
title:"Bước 1/7: Đến Địa Điểm Khai Khiếu",
text:"Ngươi theo chân tộc lão bước xuống địa đạo tối tăm, tiến vào Tinh Hà Điện dưới lòng đất. Trước mắt là dòng suối ngầm lấp lánh ánh sáng của hàng vạn con Hy Vọng Cổ."
},
{
step:2,
title:"Bước 2/7: Tham Gia Nghi Thức",
text:"Tộc trưởng trầm giọng tuyên đọc tổ huấn. Ngươi hít sâu một hơi, bước xuống dòng nước lạnh buốt, bắt đầu lội qua dòng sông ánh sáng."
},
{
step:3,
title:"Bước 3/7: Cảm Ứng Hy Vọng Cổ (Xác Định Tư Chất)",
text:"Từng điểm sáng của Hy Vọng Cổ bị khí tức sinh mệnh của ngươi thu hút, lũ lượt chui vào cơ thể và tụ tập dưới vùng bụng dưới!"
},
{
step:4,
title:"Bước 4/7: Phá Vỡ Hư Không — Mở Khiếu",
text:"ẦM! Giữa hư không tăm tối trong cơ thể vang lên một tiếng nổ vô hình. Ánh sáng Hy Vọng Cổ xé toạc bóng tối, mở ra một không gian Không Khiếu độc lập!"
},
{
step:5,
title:"Bước 5/7: Hình Thành Biển Nguyên & Khiếu Bích",
text:"Bốn phía Không Khiếu ngưng tụ thành một lớp màng ánh sáng mỏng (Khinh Mạc). Bên dưới đáy khiếu, dòng nước màu xanh đồng bắt đầu dâng lên tạo thành Biển Nguyên."
},
{
step:6,
title:"Bước 6/7: Định Hình Tư Chất & Thu Hút Nguyên Khí",
text:"Mực nước Thanh Đồng Biển Nguyên dần ổn định, phản ánh rõ ràng giới hạn tư chất bẩm sinh và khả năng hấp thu nguyên khí thiên địa của ngươi."
},
{
step:7,
title:"Bước 7/7: Trở Thành Cổ Sư Nhất Chuyển Sơ Giai",
text:"Nghi thức hoàn tất! Ngươi đã chính thức thoát khỏi thân phận phàm nhân, bước vào con đường Cổ Sư Nhất Chuyển Sơ Giai đầy máu lửa và cơ duyên."
}
];
global.VanCoApertureData={MIN_ASCENSION_HUMAN_QI,VENERABLE_REQ_DAO_MARKS,VENERABLE_REQ_MYRIAD_TRIBULATIONS,APTITUDE_TIERS,TEN_EXTREME_PHYSIQUES,MORTAL_SUBSTAGES,MORTAL_RANKS,IMMORTAL_RANKS,BLESSED_LAND_GRADES,RITUAL_STEPS_DATA};
})(window);
