(function (global) {
"use strict";
const {TK_SKINS,WORLD_META}=global.ThreeKingsWorlds;
function createWorldData(worldId,progress) {
const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};

// ==================== WORLD 1: THANH ĐỒNG ĐẠI ĐIỆN ====================
if (worldId==="bronze_hall") {
const hounds=[];
for (let i=0;i<28;i++) {
const ang=(i*Math.PI*2)/28;
const rx=(i % 2===0)?690 :820;const ry=(i % 2===0)?560 :670;
const hx=1300 + Math.cos(ang)*rx;const hy=1060 + Math.sin(ang)*ry;
hounds.push({x:hx,y:hy,homeX:hx,homeY:hy,phase:Math.random()*Math.PI*2,color:(i % 3===0)?"#4a3b2c" :((i % 3===1)?"#6e563f" :"#2f2720"),size:8 + (i % 3)*1.5});
}
const mists=[];
for (let i=0;i<24;i++) {
const ang=(i*Math.PI*2)/24;
mists.push({ang,rx:940 + (i % 3)*65,ry:760 + (i % 3)*55,r:95 + (i % 4)*25,speed:0.032 + (i % 3)*0.012});
}
const obstacles=[
{x:980,y:680,r:24,type:"pillar"},{x:1620,y:680,r:24,type:"pillar"},
{x:980,y:850,r:24,type:"pillar"},{x:1620,y:850,r:24,type:"pillar"},
{x:980,y:1020,r:24,type:"pillar"},{x:1620,y:1020,r:24,type:"pillar"},
{x:980,y:1160,r:24,type:"pillar"},{x:1620,y:1160,r:24,type:"pillar"},
{x:1300,y:860,r:56,type:"cauldron"},
{x:1140,y:1460,r:26,type:"statue"},{x:1460,y:1460,r:26,type:"statue"}
];
const props=[
{
id:"stele_tam_vuong",x:820,y:1350,label:"Bia Cổ Tam Vương",glowCol:"#ffd700",
title:"📜 Bia Đá Truyền Thừa Tam Vương",
text:"<em>\"Xưa có ba vị Ma Đạo Ngũ Chuyển: Khuyển Vương, Bạo Vương, Tín Vương cùng phát hiện tòa Phúc Địa Lục Chuyển sắp chết này, bèn lập ba cột truyền thừa bên trong. Toàn bộ cổ sư phàm nhân tiến vào đều chịu áp chế của Địa Linh Bá Quy.\"</em>"
},
{
id:"stele_nhan_to",x:1780,y:1350,label:"Bia Cổ Luyện Đạo",glowCol:"#7ef7f0",
title:"📜 Cổ Bia Ghi Chép Luyện Đạo",
text:"<em>\"Chấp niệm duy nhất của Địa Linh Bá Quy là luyện thành Tiên Cổ Không Khiếu Thứ Hai. Nhưng trong Nhân Tổ Truyện còn ẩn giấu bí mật về Ngọc Trúc Bích Không của Thanh Thiên, Kim Cương Bát Giác của Lam Thiên và Ánh Sáng Vinh Quang Thái Cổ...\"</em>"
},
{
id:"brazier_altar",x:1300,y:650,label:"Cổ Bàn Luyện Đạo",glowCol:"#38e8a8",
title:"⚗️ Bàn Đá Cất Cổ Tài Cổ Xưa",
text:"Trên bàn đá khắc đầy văn tự luyện cổ thời thái cổ. Những tia Thanh Đề Tiên Nguyên mỏng manh vẫn tỏa ra từ khe nứt trên nền đồng — dấu hiệu Tam Vương Phúc Địa đang từng ngày tiến gần đại nạn."
}
];
const entities=[
{
id:"ba_quy",name:"Địa Linh Bá Quy",title:"Địa Linh Tam Vương Phúc Địa",
x:1195,y:870,radius:28,isTortoise:true,hostile:false,dead:false,
bubble:progress.hasTramTran?"Cổ Trăm Trận Trăm Thắng đã ở trong tay ngươi rồi sao?!" :(progress.hasBichKhong?"Ngươi muốn truyền tống tới thế giới nào tiếp theo?" :"Chàng thanh niên, ngươi đã tỉnh lại rồi sao?"),
bubbleTimer:4.5,
idleQuote:"Chấp niệm lớn nhất của ta là luyện thành Cổ Không Khiếu Thứ Hai! Ta có thể truyền tống ngươi tới bất cứ khu vực nào trong Phúc Địa."
},
{
id:"bach_ngung_bang",name:"Bạch Ngưng Băng",title:"Bắc Minh Băng Phách Thể",
x:progress.bnbStripped?1300 :1365,y:progress.bnbStripped?1115 :1590,radius:20,skin:pSkins.bach_ngung_bang||TK_SKINS.bach_ngung_bang,
hostile:false,dead:false,facing:"up",bubble:"",bubbleTimer:0,
idleQuote:progress.bnbStripped
?"Hừ, tùy ngươi vậy. Chỉ cần ngươi không chết, luyện cổ thất bại hay thành công cũng chẳng liên quan đến ta."
:"Phương Nguyên, gần 10 vạn khuyển thú ta đã gom xong ngoài gò. Ngươi còn tính bày trò gì nữa?"
},
{
id:"ba_hoang",name:"Khuyển Hoàng Bá Hoàng",title:"Khuyển Hoàng Đỉnh Phong",
x:760,y:1060,radius:28,isHoundEmperor:true,houndColor:"#b8860b",
hostile:false,dead:false,facing:"left",bubble:"",bubbleTimer:0,
idleQuote:"GẦM!! Bá Hoàng đang trấn giữ cánh Tây Gò Thanh Đồng."
},
{
id:"anh_minh",name:"Khuyển Hoàng Anh Minh",title:"Khuyển Hoàng Đỉnh Phong",
x:1840,y:1060,radius:28,isHoundEmperor:true,houndColor:"#4a6fa5",
hostile:false,dead:false,facing:"right",bubble:"",bubbleTimer:0,
idleQuote:"GẦM!! Anh Minh đang trấn giữ cánh Đông Gò Thanh Đồng."
}
];
if (progress.battleWave>=4) {
entities.push(
{id:"thiet_nhuoc_nam",name:"Thiết Nhược Nam",title:"Thiếu Chủ Thiết Gia",x:progress.standoffExposed?1355 :1300,y:1165,radius:18,skin:TK_SKINS.thiet_nhuoc_nam,hostile:false,dead:false,facing:"up",bubble:"",bubbleTimer:0,idleQuote:"Phương Nguyên, hôm nay ngươi có mọc cánh cũng khó thoát! Đường ra duy nhất của ngươi chính là đầu hàng gia nhập Thiết gia!"},
{id:"thiet_gia_dai_lao",name:"Thiết Gia Đại Lão",title:"Trưởng Lão Thiết Gia",x:1145,y:1150,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"right",bubble:"",bubbleTimer:0,idleQuote:"Chỉ cần ngươi còn Cổ Định Tinh trên cẳng tay trái, Vô Cực Sưu Tỏa của bốn huynh đệ ta tất sẽ tóm gọn!"},
{id:"thiet_gia_nhi_lao",name:"Thiết Gia Nhị Lão",title:"Trưởng Lão Thiết Gia",x:1215,y:1210,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"up",bubble:"",bubbleTimer:0,idleQuote:"Hừ! Ma đầu tâm tính tàn nhẫn, chớ để hắn giở trò chặt đứt cẳng tay trái!"},
{id:"thiet_gia_tam_lao",name:"Thiết Gia Tam Lão",title:"Trưởng Lão Thiết Gia",x:1385,y:1210,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"up",bubble:"",bubbleTimer:0,idleQuote:"Đàn chó bên ngoài không trụ được bao lâu nữa đâu!"},
{id:"thiet_gia_tu_lao",name:"Thiết Gia Tứ Lão",title:"Trưởng Lão Thiết Gia",x:1455,y:1150,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"left",bubble:"",bubbleTimer:0,idleQuote:"Hôm nay nợ máu Thiết gia nhất định phải đòi đủ!"}
);
}
if (progress.standoffExposed) {
entities.push(
{id:"viem_quan",name:"Viêm Quân",title:"Thiếu Tộc Trưởng Viêm Gia",x:1505,y:985,radius:19,skin:TK_SKINS.viem_quan,hostile:false,dead:false,facing:"left",bubble:"Luyện chế Tiên cổ? Không nghĩ tới lại náo nhiệt như vậy!",bubbleTimer:4.5,idleQuote:"Ha ha, đại điện Thanh Đồng tụ tập toàn nhân vật lớn thế này, Viêm Quân ta sao có thể vắng mặt?"}
);
}
return {
id:"bronze_hall",meta:WORLD_META.bronze_hall,
width:2600,height:2200,obstacles,props,entities,hounds,mists,
loots:[],miasmaPools:[],leaves:[],traps:[],embers:[],
whiteApes:[],
mistCleared:Boolean(progress.mistCleared),
hallFrostLevel:progress.hallFrozen?1.0 :0,
hallRoofShattered:Boolean(progress.hallRoofShattered),
refStageIdx:progress.isRefiningSecondAperture?progress.refStepIdx :(progress.hasSecondApertureSemi?4 :-1),
cauldronPrompt:progress.stageStep===12?"[E] Ngồi Xếp Bằng Trước Đỉnh Đồng" :null
};
}

// ==================== WORLD 2: ĐỘC MÙ TRÚC LÂM ====================
if (worldId==="poison_grove") {
const bambooCoords=[
[520,1680,34],[720,1740,38],[960,1680,32],[1640,1690,34],[1890,1730,38],[2080,1640,34],
[460,1420,38],[680,1480,34],[920,1450,30],[1680,1440,32],[1920,1490,38],[2140,1380,36],
[440,1120,38],[640,1180,32],[1980,1140,36],[2160,1080,38],
[480,760,36],[680,680,34],[1940,700,36],[2120,780,36],
[660,390,38],[940,320,34],[1660,320,34],[1940,390,38]
];
const obstacles=bambooCoords.map(([bx,by,br],idx)=>({x:bx,y:by,r:br,type:"bamboo",seed:idx + 1}));
const miasmaPools=[
{x:1140,y:1490,r:74},{x:1460,y:1450,r:72},
{x:960,y:1220,r:76},{x:1640,y:1220,r:76},
{x:1120,y:860,r:62},{x:1480,y:860,r:62}
];
const leaves=[];
for (let i=0;i<36;i++) {
leaves.push({x:Math.random()*2600,y:Math.random()*2000,vx:-18 - Math.random()*22,vy:12 + Math.random()*16,ang:Math.random()*Math.PI*2,spin:(Math.random()-0.5)*2});
}
const props=[
{
id:"stele_poison_warn",x:1150,y:1660,label:"Bia Độc Đạo",glowCol:"#38e8a8",
title:"☠️ Bia Đá Cảnh Giới Độc Mù Trúc Lâm",
text:"<em>\"Đầm Độc Bích Thủy sinh chướng khí ăn mòn chân nguyên. Kẻ xâm nhập chớ bước vào vũng chướng khí tím-lục; hãy đi qua Cầu Gỗ Cổ tiến thẳng lên Đình Độc Trúc Bát Giác!\"</em>"
},
{
id:"poison_furnace_ruin",x:810,y:1290,label:"Lò Độc Cổ",glowCol:"#c56cf0",
title:"⚗️ Lò Luyện Độc Đổ Nát",
text:"Di tích lò luyện độc của cổ sư tiền nhân. Trên mặt đất vẫn vương vãi vài mảnh trúc xanh đã mất linh tính — chứng tỏ Cổ Bích Không của Long Thanh Thiên cực kỳ hiếm có."
}
];
const entities=[];
if (!progress.longThanhThienDead) {
entities.push({
id:"long_thanh_thien",name:"Long Thanh Thiên",title:"Ngũ Chuyển Độc Đạo",
x:1300,y:580,homeX:1300,homeY:580,radius:21,skin:TK_SKINS.long_thanh_thien,
hostile:true,activeCombat:false,introPlayed:false,dead:false,
hp:120,maxHp:120,poisonCharge:0,poisonWaveCd:3.5,facing:"down",
bubble:"Hừ! Cổ trùng đều bị Phúc Địa áp chế rồi sao...",bubbleTimer:3.5,
idleQuote:"Khốn kiếp! Ai dám xông vào Đình Độc Trúc của ta?!"
});
}
const loots=[];
if (progress.longThanhThienDead&& !progress.hasBichKhong) {
loots.push({id:"bich_khong_gu",name:"Cổ Bích Không (Ngũ Chuyển)",icon:"🎋",x:1300,y:580,color:"#38e8a8"});
}
return {
id:"poison_grove",meta:WORLD_META.poison_grove,
width:2600,height:2000,obstacles,props,entities,hounds:[],mists:[],
loots,miasmaPools,leaves,traps:[],embers:[],
pond:{x:1300,y:810,rx:520,ry:350},pavilion:{x:1300,y:590}
};
}

// ==================== WORLD 3: RỪNG ĐÁ KHUYỂN VƯƠNG ====================
if (worldId==="dog_forest") {
const monoCoords=[
// Outer stone maze rocks & monoliths framing the chase!
[760,1620,38],[1020,1520,34],[1580,1520,34],[1840,1620,38],
[660,1320,42],[940,1260,32],[1200,1340,28],[1400,1340,28],[1660,1260,32],[1940,1320,42],
[740,1040,36],[1060,1010,30],[1540,1010,30],[1860,1040,36],
[820,760,38],[1780,760,38],[920,420,36],[1680,420,36]
];
const obstacles=monoCoords.map(([mx,my,mr])=>({x:mx,y:my,r:mr,type:"monolith"}));
obstacles.push({x:1150,y:930,r:26,type:"statue"},{x:1450,y:930,r:26,type:"statue"});

const props=[
{
id:"stele_dog_king",x:1140,y:1680,label:"Bia Thạch Trận",glowCol:"#5aa9e6",
title:"📜 Bia Đá Truyền Thừa Khuyển Vương",
text:"<em>\"Khuyển Vương thuở sinh tiền hiệu lệnh vạn khuyển tung hoành Nam Cương. Người vượt qua thạch trận này sẽ bước vào Đấu Trường Thạch Trụ dưới Cột Sáng Lam.\"</em>"
},
{
id:"bone_relic_mound",x:1520,y:1160,label:"Tàn Cốt Thú Vương",glowCol:"#85c1e9",
title:"🦴 Di Chỉ Tàn Cốt Thú Vương",
text:"Xương cốt của những con Khuyển Vương cổ xưa xếp chồng quanh chân cột đá. Dấu chân vội vã của một Ngự Thú Đại Sư vừa mới đi qua hướng về phía Đấu Trường phía Bắc."
}
];

const entities=[];
if (!progress.chuongTamTamDead) {
entities.push({
id:"chuong_tam_tam",name:"Chương Tam Tam",title:"Tứ Chuyển Ngự Thú Đại Sư",
x:1300,y:620,homeX:1300,homeY:620,radius:20,skin:TK_SKINS.chuong_tam_tam,
hostile:true,activeCombat:false,introPlayed:false,dead:false,
hp:110,maxHp:110,trapCd:2.6,facing:"down",
bubble:"Truyền thừa Khuyển Vương này thật huyền diệu...",bubbleTimer:3.5,
idleQuote:"Ai đó?! Tiểu Thú Vương?!"
});
}
const loots=[];
if (progress.chuongTamTamDead&& !progress.hasNoLeGu) {
loots.push({id:"no_le_gu",name:"Cổ Nô Lệ Ngũ Chuyển",icon:"⛓️",x:1300,y:640,color:"#ffd700"});
}
return {
id:"dog_forest",meta:WORLD_META.dog_forest,
width:2600,height:2100,obstacles,props,entities,hounds:[],mists:[],
loots,miasmaPools:[],leaves:[],traps:[],embers:[],
arena:{x:1300,y:600}
};
}

// ==================== WORLD 4: HOANG NGUYÊN BẠO VƯƠNG ====================
if (worldId==="bao_wasteland") {
const rockCoords=[
[620,1680,40],[920,1620,34],[1680,1620,34],[1980,1680,40],
[540,1410,38],[1080,1440,30],[1520,1440,30],[2060,1410,38],
[580,820,38],[840,720,32],[1760,720,32],[2020,820,38],
[760,420,36],[1840,420,36]
];
const obstacles=rockCoords.map(([rx,ry,rr])=>({x:rx,y:ry,r:rr,type:"lava_rock"}));

const embers=[];
for (let i=0;i<42;i++) {
embers.push({x:Math.random()*2600,y:Math.random()*2100,vy:-22 - Math.random()*36,vx:(Math.random()-0.5)*18,size:2 + Math.random()*2.5});
}

const props=[
{
id:"stele_bao_king",x:1145,y:1710,label:"Bia Bạo Vương",glowCol:"#ff6b35",
title:"🔥 Bia Đá Truyền Thừa Bạo Vương",
text:"<em>\"Bạo Vương tính tình cuồng bạo, luyện Viêm Đạo tới đỉnh phong Ngũ Chuyển. Vực Dung Nham chắn ngang hoang nguyên chỉ có thể đi qua hai nhịp Cầu Đá Hắc Diện Thạch!\"</em>"
},
{
id:"fire_altar_ruin",x:1840,y:1520,label:"Hỏa Đàn Cổ Tàn",glowCol:"#ff9f43",
title:"🌋 Hỏa Đàn Cổ Tàn",
text:"Khói lưu huỳnh bốc lên nghi ngút từ khe đá đỏ. Xa xa bên kia vực lửa, Cột Sáng Đỏ Bạo Vương đang soi rọi bóng dáng một lão y sư áo đen âm trầm."
}
];

const entities=[];
// Quỷ Sát Nhân Y Cừu Cửu (stands on Bao King Fire Altar until sent to Xin Temple!)
if (!progress.cuuCuuSentToXin) {
entities.push({
id:"cuu_cuu",name:"Cừu Cửu",title:"Quỷ Sát Nhân Y • Ngũ Chuyển",
x:1300,y:615,homeX:1300,homeY:615,radius:20,skin:TK_SKINS.cuu_cuu,
hostile:false,introPlayed:false,enslaveActive:false,enslaved:Boolean(progress.cuuCuuEnslaved),dead:false,
soulProgress:progress.cuuCuuEnslaved?100 :0,bruisedLevel:0,facing:"down",
bubble:progress.cuuCuuEnslaved?"Thuộc hạ chờ lệnh chủ nhân!" :"Kỳ lạ... Tại sao mấy vị Ngũ Chuyển khác vẫn chưa thấy bóng dáng?",
bubbleTimer:3.5,
idleQuote:"Ồ, Tiểu Thú Vương? Tại sao ngươi lại xuất hiện trước mặt ta?"
});
}
// 3 separate outer wasteland spectators (individual named characters — ZERO merged names!)
entities.push(
{
id:"dich_hoa",name:"Dịch Hỏa",title:"Ngũ Chuyển Viêm Đạo",
x:2160,y:1560,radius:20,skin:TK_SKINS.dich_hoa,hostile:false,dead:false,facing:"left",
bubble:"",bubbleTimer:0,
idleQuote:"Hoang nguyên Bạo Vương này thật hợp với Viêm Đạo của Dịch Hỏa ta! Đợi áp chế Phúc Địa tan đi, tất cả sẽ phải quỳ dưới biển lửa!"
},
{
id:"duc_trung",name:"Dực Trùng",title:"Cổ Sư Ngũ Chuyển Thủy Đạo",
x:460,y:1560,radius:19,skin:TK_SKINS.duc_trung,hostile:false,dead:false,facing:"right",
bubble:"",bubbleTimer:0,
idleQuote:"Vùng dung nham nóng bức này thật khó chịu... Đợi Cửa Phúc Địa mở rộng, ta sẽ tiến thẳng tới Gò Thanh Đồng!"
},
{
id:"khong_nhat_thien",name:"Khổng Nhật Thiên",title:"Ma Đạo Tán Tu",
x:2050,y:580,radius:18,skin:TK_SKINS.khong_nhat_thien,hostile:false,dead:false,facing:"left",
bubble:"",bubbleTimer:0,
idleQuote:"Hoa vũ phiêu tán trên miệng núi lửa... Quả thật là kỳ cảnh khó gặp trên núi Tam Xoa!"
}
);

return {
id:"bao_wasteland",meta:WORLD_META.bao_wasteland,
width:2600,height:2100,obstacles,props,entities,hounds:[],mists:[],
loots:[],miasmaPools:[],leaves:[],traps:[],embers,
lavaRiver:{y:1130,halfH:140,bridges:[920,1680]},
altar:{x:1300,y:610}
};
}

// ==================== WORLD 5: CỔ TỰ TÍN VƯƠNG ====================
if (worldId==="xin_temple") {
const obstacles=[
{x:1040,y:540,r:24,type:"pillar"},{x:1560,y:540,r:24,type:"pillar"},
{x:1040,y:690,r:24,type:"pillar"},{x:1560,y:690,r:24,type:"pillar"},
{x:1040,y:835,r:24,type:"pillar"},{x:1560,y:835,r:24,type:"pillar"},
{x:730,y:1180,r:34,type:"monolith"},{x:1870,y:1180,r:34,type:"monolith"}
];

const props=[
{
id:"stele_xin_word",x:1120,y:1460,label:"Bia Cổ Chữ Tín",glowCol:"#ffd700",
title:"📜 Bia Đá Tín Vương Truyền Thừa",
text:"<em>\"Tín Vương tinh thông Luyện Đạo, để lại thử thách luyện cổ tinh vi nhất trong Tam Vương Phúc Địa — phần thưởng tối thượng chính là Cổ Trăm Trận Trăm Thắng Ngũ Chuyển!\"</em>"
},
{
id:"xin_cauldron_ruin",x:780,y:1040,label:"Đài Khảo Nghiệm Tây",glowCol:"#ffeaa7",
title:"⚗️ Đài Khảo Nghiệm Luyện Đạo Tín Vương",
text:"Trên đài đặt hàng chục cổ phương tàn khuyết dành cho các cổ sư Luyện Đạo thử tài. Nhưng khi Phúc Địa suy sụp, cường giả Ngũ Chuyển hoàn toàn có thể cưỡng ép bạo lực phá quan!"
}
];

const entities=[];
if (progress.cuuCuuSentToXin&& !progress.hasTramTran) {
entities.push({
id:"cuu_cuu",name:"Cừu Cửu",title:"Quỷ Sát Nhân Y • Thuộc Hạ",
x:1300,y:960,homeX:1300,homeY:960,radius:20,skin:TK_SKINS.cuu_cuu,
hostile:false,enslaved:true,dead:false,facing:"up",
bubble:"Chủ nhân! Thuộc hạ đã tới trước Chính Điện Tín Vương, sẵn sàng bạo lực phá quan!",
bubbleTimer:5.0,
idleQuote:"Thuộc hạ không phải cổ sư Luyện Đạo, nhưng Phúc Địa suy yếu rồi, cứ dốc sức Ngũ Chuyển đánh vỡ cửa ải đoạt Cổ Trăm Trận Trăm Thắng!"
});
}
// Phong Thiên Ngữ observing from the East Courtyard (individual character!)
entities.push({
id:"phong_thien_ngu",name:"Phong Thiên Ngữ",title:"Luyện Đạo Đại Sư",
x:1840,y:1040,radius:19,skin:TK_SKINS.phong_thien_ngu,hostile:false,dead:false,facing:"left",
bubble:"",bubbleTimer:0,
idleQuote:progress.hasTramTran
?"Trời đất! Kẻ nào lại dùng vũ lực phá nát cửa ải Truyền Thừa Tín Vương làm tắt luôn cột sáng vàng thế kia?! Thật lãng phí mấy trăm người lông!"
:"Truyền Thừa Tín Vương ẩn chứa vô vàn bí mật Luyện Đạo... Ta nhất định phải tìm hiểu thấu đáo!"
});

return {
id:"xin_temple",meta:WORLD_META.xin_temple,
width:2600,height:2000,obstacles,props,entities,hounds:[],mists:[],
loots:[],miasmaPools:[],leaves:[],traps:[],embers:[],
temple:{x:1300,y:700},
pillarLit:!progress.xinPillarExtinguished
};
}


// ==================== WORLD 6: CHIẾN TRƯỜNG NGOẠI VI TAM XOA SƠN (2800x2200) ====================
if (worldId==="outer_battlefield") {
const wave=progress.battleWave||0;
const obstacles=[
// Righteous Camp Tent & Watchtower
{x:1400,y:440,r:62,type:"tent_righteous"},
{x:1020,y:560,r:48,type:"watchtower_tie"},
// Demon Camp Tent & Boulder Cover
{x:2260,y:540,r:62,type:"tent_demon"},
{x:2050,y:760,r:34,type:"monolith"},
{x:2460,y:780,r:36,type:"monolith"},
// Western Flank Rocks
{x:560,y:920,r:40,type:"monolith"},
{x:720,y:1260,r:36,type:"monolith"},
// Eastern Flank Rocks
{x:2320,y:1280,r:38,type:"monolith"}
];

const hounds=[];
for (let i=0;i<36;i++) {
const row=(i % 2);
const hx=560 + (i*48);
const hy=1760 + row*58 + Math.sin(i*0.7)*18;
hounds.push({x:hx,y:hy,homeX:hx,homeY:hy,phase:Math.random()*Math.PI*2,color:(i%3===0)?"#4a3b2c" :((i%3===1)?"#6e563f" :"#2f2720"),size:8 + (i%3)*1.5});
}

const mists=[];
for (let i=0;i<26;i++) {
mists.push({
x:420 + i*80,y:1640 + Math.sin(i*0.9)*45,
r:95 + (i%4)*22,alpha:progress.mistCleared?0 :1.0,speed:0.5 + (i%3)*0.2
});
}

const props=[
{
id:"stele_righteous_plan",x:1215,y:590,label:"Sa Bàn Chính Đạo",glowCol:"#ffd700",
title:"📜 Sa Bàn Tác Chiến Chính Đạo",
text:"Tiêu Mang đứng đầu liên quân Chính Đạo đang chờ thời cơ tung sát chiêu <em>Thái Cổ Quang Quyền</em> và <em>Vinh Diệu Ngô Thương</em>; trong khi Thiết Nhược Nam mật bàn cùng Thiết Bạch Kỳ chuẩn bị mở đường vượn trắng thẳng tiến Thanh Đồng Đại Điện!"
},
{
id:"stele_demon_plan",x:2100,y:660,label:"Cờ Hiệu Quần Ma",glowCol:"#c56cf0",
title:"🚩 Doanh Trại Tập Kết Quần Ma",
text:"Quỷ Sát Nhân Y Cừu Cửu đã tung tin bảo tàng Cổ Tiên ra khắp Phúc Địa, dùng uy vọng Tứ Đại Y Sư Nam Cương tập kết đại đa số cổ sư Ma Đạo — cố tình vòng vo kéo dài thời gian khiến Ma Vô Thiên tức giận không làm gì được!"
},
{
id:"stele_mist_front",x:1400,y:1520,label:"Tiền Đồn Mê Vụ",glowCol:"#7ef7c4",
title:"🌫️ Ranh Giới Sương Mù Gò Thanh Đồng",
text:"Phía Nam màn sương mù dày đặc này là Gò Thanh Đồng với đại trận gần 10 vạn khuyển thú do Địa Linh Bá Quy trực tiếp chỉ huy, có hai đại Khuyển Hoàng Bá Hoàng và Anh Minh trấn giữ hai cánh!"
}
];

// ALL 17 INDIVIDUAL NAMED CHARACTERS ON OUTER BATTLEFIELD — ZERO MERGED NAMES!
const entities=[
// Righteous Faction (North Camp -> advancing south as waves progress!)
{
id:"tieu_mang",name:"Tiêu Mang",title:"Nhị Tộc Trưởng Tiêu Gia • Ngũ Chuyển",
x:wave>=3?1760 :1400,y:wave>=3?1520 :(wave>=2?1120 :560),radius:20,skin:TK_SKINS.tieu_mang,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Đường đường Nhị tộc trưởng Tiêu gia sao có thể cúi đầu trước Ma đạo? Nhưng đàn chó khổng lồ thế kia, không liên thủ sao xông vào được!"
},
{
id:"thiet_nhuoc_nam",name:"Thiết Nhược Nam",title:"Thiếu Chủ Thiết Gia",
x:wave>=4?1120 :(wave>=3?1080 :1060),y:wave>=4?1680 :(wave>=3?1340 :660),radius:18,skin:TK_SKINS.thiet_nhuoc_nam,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Chỉ cách Thanh Đồng Đại Điện mấy nghìn bước nữa thôi! Thiết Bạch Kỳ đại nhân, đã đến lúc rồi!"
},
{
id:"thiet_bach_ky",name:"Thiết Bạch Kỳ",title:"Cường Giả Ngũ Chuyển Thiết Gia",
x:wave>=3?1020 :980,y:wave>=3?1280 :630,radius:20,skin:TK_SKINS.thiet_bach_ky,hasThirdEye:true,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Haha, lão phu đã sớm nhìn thấy đàn chó kia rồi, trong lòng ngứa ngáy khó nhịn — đại quân vượn trắng sẵn sàng xuất trận!"
},
{id:"thiet_gia_dai_lao",name:"Thiết Gia Đại Lão",title:"Trưởng Lão Thiết Gia",x:wave>=3?990 :920,y:wave>=3?1380 :695,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,idleQuote:"Hộ vệ thiếu chủ xông thẳng vào Thanh Đồng Đại Điện!"},
{id:"thiet_gia_nhi_lao",name:"Thiết Gia Nhị Lão",title:"Trưởng Lão Thiết Gia",x:wave>=3?1040 :970,y:wave>=3?1410 :720,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,idleQuote:"Bốn huynh đệ ta nhất định bắt sống Phương Nguyên!"},
{id:"thiet_gia_tam_lao",name:"Thiết Gia Tam Lão",title:"Trưởng Lão Thiết Gia",x:wave>=3?1125 :1140,y:wave>=3?1410 :720,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,idleQuote:"Cổ Định Tinh đã gieo sẵn, hắn không thoát nổi!"},
{id:"thiet_gia_tu_lao",name:"Thiết Gia Tứ Lão",title:"Trưởng Lão Thiết Gia",x:wave>=3?1175 :1190,y:wave>=3?1380 :695,radius:18,skin:TK_SKINS.thiet_lao,hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,idleQuote:"Chỉ chờ lệnh thiếu chủ Thiết Nhược Nam!"},
{
id:"viem_quan",name:"Viêm Quân",title:"Thiếu Tộc Trưởng Viêm Gia",
x:wave>=3?820 :740,y:wave>=3?1460 :860,radius:19,skin:TK_SKINS.viem_quan,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Thừa dịp không ai chú ý, từ thực hóa hư tránh né tấn công — thong thả tiến vào đại điện mới là thượng sách."
},
// Demon Faction (North-East Camp -> Cừu Cửu stalling Ma Vô Thiên!)
{
id:"cuu_cuu",name:"Cừu Cửu",title:"Quỷ Sát Nhân Y • Ám Kỳ Của Phương Nguyên",
x:wave>=1?2180 :2240,y:wave>=1?1180 :660,radius:20,skin:TK_SKINS.cuu_cuu,enslaved:true,
hostile:false,dead:false,facing:"left",bubble:"",bubbleTimer:0,
idleQuote:"Mọi người đều biết quy củ của ta, cứu một người giết một người — lúc này ta cứu thương trước! Cứ chậm rãi để Chính đạo xông vào chịu trận trước!"
},
{
id:"ma_vo_thien",name:"Ma Vô Thiên",title:"Cổ Sư Ngũ Chuyển Ma Đạo",
x:wave>=3?1040 :(wave>=1?2100 :2140),y:wave>=3?1520 :(wave>=1?1140 :640),radius:20,skin:TK_SKINS.ma_vo_thien,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Cừu Cửu lão nhi âm hiểm vô cùng! Không thể chờ đợi nữa — lão tử tự một ngựa đi đầu đoạt bảo tàng Cổ Tiên!"
},
{
id:"ho_mi_nhi",name:"Hồ Mị Nhi",title:"Ma Đạo Cao Thủ",
x:wave>=1?2270 :2340,y:wave>=1?1150 :690,radius:18,skin:TK_SKINS.ho_mi_nhi,
hostile:false,dead:false,facing:"left",bubble:"",bubbleTimer:0,
idleQuote:"Vô Thiên công tử nóng ruột thật đấy, nhưng đại đa số đồng đạo Ma đạo đều đang nghe theo Quỷ Y đại nhân."
},
{
id:"ly_nhan",name:"Lý Nhàn",title:"Ma Đạo Thương Nhân",
x:wave>=3?2020 :(wave>=1?2240 :2160),y:wave>=3?1420 :(wave>=1?1250 :740),radius:18,skin:TK_SKINS.ly_nhan,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Vận dụng cổ trùng ngũ chuyển biến mất ngay tại chỗ — ai dại gì làm bia đỡ đạn cho đám chó kia!"
},
{
id:"dich_hoa",name:"Dịch Hỏa",title:"Ngũ Chuyển Viêm Đạo",
x:wave>=3?2180 :2360,y:wave>=3?1540 :1060,radius:20,skin:TK_SKINS.dich_hoa,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Dịch Hỏa ta như thần Lửa xông pha — chỗ nào ngọn lửa lan tới, đàn chó kêu rên!"
},
{
id:"duc_trung",name:"Dực Trùng",title:"Cổ Sư Ngũ Chuyển Thủy Đạo",
x:wave>=3?1920 :2240,y:wave>=3?1580 :1380,radius:19,skin:TK_SKINS.duc_trung,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Toàn thân vảy lam, sau lưng đôi vây cá đen vờn vòng xoáy — một ngựa đi đầu xé rách đại trận khuyển thú!"
},
{
id:"khong_nhat_thien",name:"Khổng Nhật Thiên",title:"Ma Đạo Tán Tu",
x:wave>=3?1540 :1860,y:wave>=3?1480 :1260,radius:18,skin:TK_SKINS.khong_nhat_thien,
hostile:false,dead:false,facing:"down",bubble:"",bubbleTimer:0,
idleQuote:"Hoa vũ đầy trời, phiêu tán đi mất — kẻ khôn ngoan không bao giờ đối đầu trực diện!"
},
// Two Hound Emperors defending the Southern Mist Line!
{
id:"ba_hoang",name:"Khuyển Hoàng Bá Hoàng",title:"Khuyển Hoàng Đỉnh Phong",
x:1040,y:1640,radius:28,isHoundEmperor:true,houndColor:"#b8860b",
hostile:false,dead:false,facing:"up",bubble:"",bubbleTimer:0,
idleQuote:"GẦM!! Bá Hoàng ngăn cản hướng tiến công của Ma Vô Thiên!"
},
{
id:"anh_minh",name:"Khuyển Hoàng Anh Minh",title:"Khuyển Hoàng Đỉnh Phong",
x:1760,y:1640,radius:28,isHoundEmperor:true,houndColor:"#4a6fa5",
hostile:false,dead:false,facing:"up",bubble:"",bubbleTimer:0,
idleQuote:"GẦM!! Anh Minh ngăn cản hướng tiến công của Tiêu Mang!"
}
];

const whiteApes=[];
if (wave>=4) {
for (let i=0;i<16;i++) {
whiteApes.push({
x:1060 + (Math.random()-0.5)*150,
y:1460 + (Math.random()-0.5)*160,
tx:1140 + (Math.random()-0.5)*180,
ty:1760 + (Math.random()-0.5)*100,
phase:i*0.8
});
}
}

return {
id:"outer_battlefield",meta:WORLD_META.outer_battlefield,
width:2800,height:2200,obstacles,props,entities,hounds,mists,
loots:[],miasmaPools:[],leaves:[],traps:[],embers:[],
whiteApes,
skyRiftOpen:Boolean(progress.skyRiftOpen),
mistCleared:Boolean(progress.mistCleared),
apePortalActive:Boolean(wave>=4),
wave
};
}


// ==================== WORLD 7: ĐỈNH NÚI ĐÃNG HỒN — PHÚC ĐỊA HỒ TIÊN (2600x2200) ====================
if (worldId==="dang_hun_mountain") {
const spireCoords=[
[620,680,34,"#ff85d5"],[820,520,30,"#c56cf0"],[1780,520,30,"#c56cf0"],[1980,680,34,"#ff85d5"],
[560,1040,38,"#c56cf0"],[790,940,28,"#ff85d5"],[1810,940,28,"#ff85d5"],[2040,1040,38,"#c56cf0"],
[660,1420,36,"#ff85d5"],[1940,1420,36,"#ff85d5"],
[820,1740,34,"#c56cf0"],[1780,1740,34,"#c56cf0"],
[1300,1420,32,"#ff85d5"],[1240,1680,30,"#c56cf0"],[1360,1680,30,"#ff85d5"]
];
const obstacles=spireCoords.map(([sx,sy,sr,scol])=>({x:sx,y:sy,r:sr,type:"crystal",col:scol}));
// Fox statues flanking palace steps
obstacles.push({x:1145,y:740,r:28,type:"fox_statue"},{x:1455,y:740,r:28,type:"fox_statue"});

const props=[
{
id:"stele_dang_hun",x:1010,y:960,label:"Bia Đãng Hồn Sơn",glowCol:"#ff85d5",
title:"💎 Bia Đá Thiên Địa Bí Cảnh — Đãng Hồn Sơn",
text:"<em>\"Đãng Hồn Sơn toàn thân kết tinh bằng pha lê hồng tím, chấn động hồn phách vạn vật. Kẻ nào đứng vững trên đỉnh núi này mà không tan hồn sẽ trở thành chủ nhân mới của Phúc Địa Hồ Tiên!\"</em>"
},
{
id:"stele_dam_thuc",x:1590,y:960,label:"Bia Đảm Thức Cổ",glowCol:"#ffd700",
title:"📜 Ghi Chép Về Đảm Thức Cổ",
text:"<em>\"Mỗi khi sinh linh hồn phi phách tán trên núi Đãng Hồn, tinh hoa hồn phách sẽ tưới tẩm mặt núi sản sinh Đảm Thức Cổ — kỳ bảo tráng đại hồn phách khiến cả Thiên Hạ Cổ Tiên thèm khát!\"</em>"
}
];

// ALL 6 INDIVIDUAL CENTRAL CONTINENT CHARACTERS — ZERO MERGED NAMES!
const entities=[
{
id:"tieu_ho_tien",name:"Tiểu Hồ Tiên",title:"Địa Linh Phúc Địa Hồ Tiên",
x:1300,y:815,radius:22,skin:TK_SKINS.tieu_ho_tien,isFoxSpirit:true,
hostile:false,dead:false,facing:"down",
bubble:progress.huImmortalClaimed?"Chủ nhân ơi! Phúc Địa Hồ Tiên và Đãng Hồn Sơn đã thuộc về ngài rồi!" :"A!! Có người từ trên trời giáng thẳng xuống Đỉnh Đãng Hồn Sơn rồi!!",
bubbleTimer:5.5,
idleQuote:"Tiểu Hồ Tiên bái kiến chủ nhân mới của Phúc Địa Hồ Tiên! Từ nay Đãng Hồn Sơn và Đảm Thức Cổ đều thuộc quyền định đoạt của ngài!"
},
{
id:"phuong_kim_hoang",name:"Phượng Kim Hoàng",title:"Thiên Chi Kiêu Nữ Linh Duyên Trai",
x:1540,y:1265,targetX:1485,targetY:1185,radius:20,skin:TK_SKINS.phuong_kim_hoang,hasDreamWings:true,
hostile:false,dead:false,facing:"up",
bubble:"Ra đi, Mộng Dực! — Khoan đã, kẻ nào vừa dùng Lục Chuyển Tiên Cổ giáng thẳng xuống đỉnh núi?!",
bubbleTimer:5.5,
idleQuote:"Ta đường đường là Phượng Kim Hoàng, từ khi ra đời đến nay chưa từng thua bao giờ! Sao lại có kẻ thần bí dùng Lục Chuyển Định Tiên Du cướp mất Phúc Địa Hồ Tiên ngay trước mắt ta?!"
},
{
id:"phuong_chinh",name:"Cổ Nguyệt Phương Chính",title:"Đệ Tử Tinh Anh Tiên Hạc Môn",
x:1060,y:1285,targetX:1115,targetY:1200,radius:19,skin:TK_SKINS.phuong_chinh,
hostile:false,dead:false,facing:"up",
bubble:"Tay chân máu me đầm đìa, đỉnh núi ngay trước mắt... Khoan đã — bóng dáng kia là... CA CA?!",
bubbleTimer:5.5,
idleQuote:"Ta đã liên tục vượt qua Ứng Sinh Cơ, Tiêu Thất Tinh, tay chân ma sát đến hỏng chỉ để lên đỉnh Đãng Hồn Sơn... Tại sao ca ca Phương Nguyên lại xuất hiện ở đây?!"
},
{
id:"thien_hac_thuong_nhan",name:"Thiên Hạc Thượng Nhân",title:"Linh Hồn Ký Sinh Tiên Hạc Môn",
x:995,y:1255,targetX:1050,targetY:1170,radius:18,skin:TK_SKINS.thien_hac_thuong_nhan,isSpiritGhost:true,
hostile:false,dead:false,facing:"right",
bubble:"Phương Chính cố lên, chiến thắng gần trong gang tấc... HẢ?! Khí tức Tiên Cổ gì kia?!",
bubbleTimer:5.5,
idleQuote:"Không thể nào! Đó là Lục Chuyển Tiên Cổ Định Tiên Du trong Nhân Tổ Truyện! Tên ma đầu Phương Nguyên làm sao vượt Giới Bích từ Nam Cương sang Trung Châu trong chớp mắt?!"
},
{
id:"ung_sinh_co",name:"Ứng Sinh Cơ",title:"Đệ Tử Tinh Anh Cổ Hồn Môn",
x:980,y:1640,radius:18,skin:TK_SKINS.ung_sinh_co,
hostile:false,dead:false,facing:"up",
bubble:"Đã bị Phương Chính vượt qua, nay lại có kẻ trực tiếp rơi xuống đỉnh Đãng Hồn Sơn!",
bubbleTimer:4.5,
idleQuote:"Chấn động linh hồn trên Đãng Hồn Sơn đáng sợ quá... Kẻ đứng trên đỉnh kia rốt cuộc là ai?"
},
{
id:"tieu_that_tinh",name:"Tiêu Thất Tinh",title:"Đệ Tử Tinh Anh Thập Đại Cổ Phái",
x:1620,y:1650,radius:18,skin:TK_SKINS.tieu_that_tinh,
hostile:false,dead:false,facing:"up",
bubble:"Ánh sáng xanh ngọc bích kia... Chẳng lẽ là Định Tiên Du trong truyền thuyết?!",
bubbleTimer:4.5,
idleQuote:"Thập Đại Cổ Phái chúng ta trù tính bao lâu, cuối cùng lại bị một kẻ thần bí hớt tay trên ngay phút chót!"
}
];

const petals=[];
for (let i=0;i<36;i++) {
petals.push({x:Math.random()*2600,y:Math.random()*2200,vx:(Math.random()-0.5)*22,vy:12 + Math.random()*18,ang:Math.random()*Math.PI*2,spin:(Math.random()-0.5)*2});
}

return {
id:"dang_hun_mountain",meta:WORLD_META.dang_hun_mountain,
width:2600,height:2200,obstacles,props,entities,hounds:[],mists:[],
loots:[],miasmaPools:[],leaves:petals,traps:[],embers:[],whiteApes:[],
palace:{x:1300,y:450},
summit:{x:1300,y:990}
};
}

return null;
}

// ==============================================================================
// BESPOKE WORLD TERRAIN + ARCHITECTURE RENDERERS (5 WORLDS)
// ==============================================================================
global.ThreeKingsWorlds.createWorldData=createWorldData;
})(window);
