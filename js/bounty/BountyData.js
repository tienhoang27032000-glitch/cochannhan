(function (global) {
"use strict";

const WANTED_TIERS=[
{level:0,minNotoriety:0,  name:"Bình An Vô Sự",           badge:"🕊️ Trong Sạch",   color:"#5cc995",ambushChance:0.00,squadSize:0,desc:"Không bị Chính Đạo truy nã. Có thể tự do nhận Lệnh Truy Nã săn Ma Đầu."},
{level:1,minNotoriety:20, name:"Nghi Phạm Ma Đạo",        badge:"⚠️ Truy Nã Cấp 1", color:"#f7c948",ambushChance:0.24,squadSize:2,desc:"Thiết Gia tuần tra đã chú ý tung tích của ngươi. Có thể bị Đệ Tử Thần Bộ chặn đường khi khai thác mỏ."},
{level:2,minNotoriety:55, name:"Hải Bộ Văn Thư Thanh Đồng",badge:"🔥 Truy Nã Cấp 2", color:"#ff9f43",ambushChance:0.38,squadSize:2,desc:"Thiết Nhược Nam phát lệnh truy nã Nam Cương! Đội Thần Bộ sẵn sàng mai phục bất ngờ trên chiến trường."},
{level:3,minNotoriety:110,name:"Hải Bộ Văn Thư Hoàng Kim",badge:"🚨 Truy Nã Cấp 3", color:"#ff5252",ambushChance:0.52,squadSize:3,desc:"Thiết Bạch Kỳ & Trưởng Lão Chính Đạo đích thân dẫn đội săn lùng. Phần thưởng phản sát cực kỳ hậu hĩnh!"},
{level:4,minNotoriety:190,name:"Đại Ma Đầu Ngũ Vực",      badge:"💀 Truy Nã Cấp 4", color:"#c278ff",ambushChance:0.65,squadSize:3,desc:"Giám Sát Sứ Trung Châu treo thưởng lớn. Cao thủ Chính Đạo sẽ tập kích cả khi đang đánh trận!"},
{level:5,minNotoriety:290,name:"Thiên Hạ Công Địch",      badge:"👑 Cực Đạo Ma Tôn",color:"#ff2a2a",ambushChance:0.78,squadSize:3,desc:"Thiên Đình phát lệnh Tru Ma toàn Ngũ Vực! Tru Ma Cổ Tiên đích thân mai phục — phản sát sẽ đoạt đại cơ duyên!"}
];

const AMBUSH_LEADERS=[
{
minWanted:1,maxWanted:1,
name:"Thiết Gia Tuần Sát Sứ",
title:"Thần Bộ Nam Cương",
skinKey:"phuong_chinh",
color:"#5aa9e6",
attackGuName:"Thiết Xích Trói Ma Cổ",
killerMoveName:"Thiết Gia Tỏa Ma Trận",
minionName:"Đệ Tử Thần Bộ Thiết Gia",
quote:"\"Hừ! Dám làm càn dưới mắt Thiết Gia? Đứng lại chịu trói!\""
},
{
minWanted:2,maxWanted:2,
name:"Thiết Nhược Nam",
title:"Thiếu Tộc Trưởng Thiết Gia • Tiểu Thần Bộ",
skinKey:"thuong_tam_tu",
color:"#ffd700",
attackGuName:"Kim Cương Châm Cổ",
killerMoveName:"Thiết Gia Trảm Ma Kiếm",
minionName:"Thiết Diện Thần Bộ",
quote:"\"Tội ác chất chồng! Bản tiểu thư thay mặt Thiết Gia trừng trị ma đầu ngươi tại đây!\""
},
{
minWanted:3,maxWanted:3,
name:"Thiết Bạch Kỳ",
title:"Trưởng Lão Thiết Gia • Thần Nhãn Truy Hung",
skinKey:"phuong_cuu_ca",
color:"#e6e8ed",
attackGuName:"Kim Thạch Phá Ma Tiễn",
killerMoveName:"Thiên Nhãn Tỏa Hồn Trận",
minionName:"Thiết Gia Hộ Pháp",
quote:"\"Dưới con mắt thứ ba của lão phu, ma đầu ngươi có chạy đằng trời!\""
},
{
minWanted:4,maxWanted:4,
name:"Trung Châu Giám Sát Sứ",
title:"Thập Đại Cổ Phái • Chính Đạo Chấp Pháp",
skinKey:"bach_ngung_bang",
color:"#4ce6ff",
attackGuName:"Chính Khí Kiếm Quang",
killerMoveName:"Trung Châu Trấn Ma Quang Trụ",
minionName:"Chấp Pháp Đệ Tử Trung Châu",
quote:"\"Ngũ Vực không dung thứ ma đầu tác quái! Chấp Pháp Đường phụng mệnh tru sát!\""
},
{
minWanted:5,maxWanted:5,
name:"Thiên Đình Tru Ma Cổ Tiên",
title:"Thiên Đình Giám Thiên Tháp",
skinKey:"tinh_tu",
color:"#00e5ff",
attackGuName:"Túc Mệnh Quang Mâu",
killerMoveName:"Thiên Đình Tru Ma Đại Trận",
minionName:"Thiên Đình Tiên Vệ",
quote:"\"Nghịch thiên hành sự, tội đáng tru diệt! Thiên Đình đích thân thanh lý môn hộ Ngũ Vực!\""
}
];

const DEMONIC_BOUNTIES=[
{
id:"bounty_huyet_thu",
name:"Huyết Thủ Tàn Đao",
title:"Ma Đầu Nhất Chuyển • Huyết Đạo",
rank:1,
reqRank:1,
stageId:"stage_1",
stageName:"Ải 1: Sườn Núi Thanh Mao",
skinKey:"phuong_nguyen",
color:"#e03e3e",
guDropId:"huyet_tich_gu",
attackGuName:"Huyết Tích Trảm",
killerMoveName:"Huyết Thủ Đoạt Mệnh",
rewardStones:180,
rewardMerit:85,
rewardAlignment:16,
rewardFame:40,
rewardItem:"beast_blood_core",
desc:"Kẻ phản đồ tàn sát thương đội dưới chân Thanh Mao Sơn, ẩn náu trong rừng trúc săn Cổ Sư yếu thế."
},
{
id:"bounty_doc_lao",
name:"Âm Phong Độc Lão",
title:"Ma Đầu Nhị Chuyển • Độc Đạo",
rank:2,
reqRank:2,
stageId:"stage_5",
stageName:"Ải 5: Bạch Cốt Sơn",
skinKey:"u_hon",
color:"#9b59b6",
guDropId:"doc_vu_gu",
attackGuName:"Hủ Cốt Độc Vụ",
killerMoveName:"Vạn Độc Thực Tâm Trận",
rewardStones:460,
rewardMerit:160,
rewardAlignment:20,
rewardFame:75,
rewardItem:"remnant_recipe",
desc:"Lão ma Độc Đạo chuyên dùng xương người luyện độc trong hang động Bạch Cốt Sơn."
},
{
id:"bounty_ho_co",
name:"Mị Ảnh Hồ Cơ",
title:"Ma Đầu Tam Chuyển • Hồn Đạo",
rank:3,
reqRank:3,
stageId:"stage_7",
stageName:"Ải 7: Thương Gia Thành",
skinKey:"thuong_tam_tu",
color:"#ff85a2",
guDropId:"quy_dien_hoa_gu",
attackGuName:"Mị Hồn Hoa Vũ",
killerMoveName:"Bách Quỷ Đoạt Hồn Khúc",
rewardStones:1100,
rewardMerit:280,
rewardAlignment:24,
rewardFame:120,
rewardItem:"soul_crystal",
desc:"Nữ ma đầu giả trang thương nhân trà trộn vào Thương Gia Thành để hút hồn phách thiên tài trẻ tuổi."
},
{
id:"bounty_kho_cot",
name:"Khô Cốt Ma Sư",
title:"Ma Đầu Tứ Chuyển • Kim/Cốt Đạo",
rank:4,
reqRank:4,
stageId:"stage_10",
stageName:"Ải 10: Tam Vương Sơn",
skinKey:"hac_lau_lan",
color:"#dce8f2",
guDropId:"cot_thuong_gu",
attackGuName:"Lao Toàn Cốt Thương",
killerMoveName:"Bạch Cốt Sâm La Trận",
rewardStones:2600,
rewardMerit:450,
rewardAlignment:28,
rewardFame:190,
rewardItem:"jade_bone",
desc:"Cường giả Ma Đạo thừa lúc Tam Vương Phúc Địa mở cửa đã phục kích cướp cổ của nhiều gia tộc Nam Cương."
},
{
id:"bounty_huyet_hai",
name:"Huyết Hải Hộ Pháp",
title:"Ma Đầu Ngũ Chuyển • Huyết Đạo",
rank:5,
reqRank:5,
stageId:"stage_14",
stageName:"Ải 14: Vương Đình Tranh Bá",
skinKey:"hong_lien",
color:"#ff3b30",
guDropId:"huyet_lo_gu",
attackGuName:"Huyết Hà Phi Nhận",
killerMoveName:"Huyết Hải Thao Thiên Kiếp",
rewardStones:6200,
rewardMerit:720,
rewardAlignment:34,
rewardFame:280,
rewardItem:"remnant_recipe",
desc:"Truyền nhân bí mật của Huyết Hải Lão Tổ, ẩn mình giữa Vương Đình Bắc Nguyên thu gom tinh huyết."
},
{
id:"bounty_u_minh_tien",
name:"U Minh Đạo Tặc",
title:"Tán Tiên Lục Chuyển • Ám/Hồn Đạo",
rank:6,
reqRank:6,
stageId:"stage_17",
stageName:"Ải 17: Lang Gia Phúc Địa",
skinKey:"u_hon",
color:"#b75cff",
guDropId:"u_minh_hon_gu",
attackGuName:"U Minh Ám Tiễn",
killerMoveName:"Quỷ Ảnh Thôn Tiên Ấn",
rewardStones:14500,
rewardMerit:1200,
rewardAlignment:42,
rewardFame:420,
rewardItem:"immortal_stone",
desc:"Tán Tiên Ma Đạo chuyên lẻn vào Phúc Địa các tông môn để trộm Tiên Tài và Luyện Đạo bí phương."
},
{
id:"bounty_kiem_ma",
name:"Vô Ảnh Kiếm Ma",
title:"Cổ Tiên Thất Chuyển • Kiếm Đạo",
rank:7,
reqRank:7,
stageId:"stage_20",
stageName:"Ải 20: Hắc Phàm Động Thiên",
skinKey:"phuong_cuu_ca",
color:"#7ef7f0",
guDropId:"kiem_quang_gu",
attackGuName:"Vô Ảnh Đoạn Hồn Kiếm",
killerMoveName:"Thất Tuyệt Tru Tiên Kiếm Vũ",
rewardStones:28000,
rewardMerit:1900,
rewardAlignment:50,
rewardFame:600,
rewardItem:"immortal_stone",
desc:"Kiếm Tiên Ma Đạo hung danh hiển hách, từng một kiếm chém vỡ ba tòa Cổ Ốc của Chính Đạo."
},
{
id:"bounty_phong_ma_tien",
name:"Phong Ma Tàn Tiên",
title:"Bát Chuyển Ma Tiên • Hỗn Độn",
rank:8,
reqRank:8,
stageId:"stage_23",
stageName:"Ải 23: Đông Hải Long Cung",
skinKey:"hong_lien",
color:"#ffd700",
guDropId:"tinh_hai_gu",
attackGuName:"Hỗn Độn Tinh Bạo",
killerMoveName:"Bát Chuyển Diệt Thế Ma Trận",
rewardStones:55000,
rewardMerit:3000,
rewardAlignment:65,
rewardFame:950,
rewardItem:"immortal_stone",
desc:"Cổ Tiên Bát Chuyển điên loạn trốn thoát từ Phong Ma Quật, đang hoành hành cướp đoạt tại Đông Hải!"
}
];

function getWantedTier(notoriety=0) {
const n=Math.max(0,Number(notoriety)||0);
let cur=WANTED_TIERS[0];
for (const t of WANTED_TIERS) {
if (n>=t.minNotoriety) cur=t;
}
return cur;
}

function getAmbushLeaderForTier(wantedLevel) {
const lv=Math.max(1,Math.min(5,Number(wantedLevel)||1));
return AMBUSH_LEADERS.find(a=>lv>=a.minWanted&&lv<=a.maxWanted)||AMBUSH_LEADERS[0];
}

function getBountyById(id) {
return DEMONIC_BOUNTIES.find(b=>b.id===id)||null;
}

global.VanCoBountyData={
WANTED_TIERS,
AMBUSH_LEADERS,
DEMONIC_BOUNTIES,
getWantedTier,
getAmbushLeaderForTier,
getBountyById
};
})(window);
