(function (global) {
"use strict";

// ==============================================================================
// BLESSED LAND WILDLIFE — 20 HAND-DRAWN 2D CANVAS XIANXIA CREATURES (v75)
// - 100% bespoke multi-layer Canvas 2D vector art (ZERO emojis, ZERO setLineDash!)
// - Dual-mode rendering: crisp live vector when zoomed in (>=1.5x up to 2000%)
//   and 2-frame offscreen sprite cache at normal zoom (144 FPS PC / 60 FPS Mobile!)
// ==============================================================================

const SPECIES_LIST=[
{
id:"bach_loc",name:"Bạch Lộc Linh Thú",habitat:"land",rarity:"Linh Thú",
biomes:["jade_meadow","peach_valley"],spd:64,scale:1.12,auraColor:"#e8f6e8",
desc:"Hươu trắng sừng vàng ngọc, bước chân nhẹ như gió, mang theo linh khí thảo nguyên."
},
{
id:"ngoc_tho",name:"Nguyệt Ngọc Thỏ",habitat:"land",rarity:"Thường",
biomes:["jade_meadow","bamboo_highland","peach_valley"],spd:76,scale:0.86,auraColor:"#dff4ff",
desc:"Thỏ ngọc tai dài nhảy nhót linh hoạt giữa bãi cỏ xanh, bộ lông ánh bạc dưới ánh trăng."
},
{
id:"thanh_diep",name:"Thanh Điệp Linh Cổ",habitat:"air",rarity:"Thường",
biomes:["jade_meadow","peach_valley","crystal_glade"],spd:88,scale:0.92,auraColor:"#7ef7c4",
desc:"Bướm linh cánh ngọc bích bốn cánh dập dờn, rắc bụi linh khí lấp lánh mỗi khi bay qua."
},
{
id:"hoang_kim_phong",name:"Hoàng Kim Mật Phong",habitat:"air",rarity:"Thường",
biomes:["jade_meadow","peach_valley"],spd:94,scale:0.82,auraColor:"#ffd700",
desc:"Ong vàng thu thập mật hoa linh thảo, đôi cánh rung tốc độ cao tạo ánh kim rực rỡ."
},
{
id:"linh_ho",name:"Cửu Vĩ Linh Hồ",habitat:"land",rarity:"Hiếm",
biomes:["jade_meadow","crimson_autumn","peach_valley"],spd:78,scale:1.05,auraColor:"#ff9f43",
desc:"Hồ ly linh trí cao với ba chùm đuôi lửa bồng bềnh, rất tinh ranh khi thấy Cổ Tiên tới gần."
},
{
id:"tien_hac",name:"Bạch Vũ Tiên Hạc",habitat:"air",rarity:"Linh Thú",
biomes:["peach_valley","frost_peak","jade_meadow"],spd:82,scale:1.18,auraColor:"#ffffff",
desc:"Tiên hạc đỉnh đầu son đỏ, sải cánh rộng lượn êm ái trên các thung lũng và đỉnh tuyết."
},
{
id:"kim_tri",name:"Thải Phượng Kim Trĩ",habitat:"land",rarity:"Hiếm",
biomes:["peach_valley","crimson_autumn"],spd:72,scale:1.02,auraColor:"#ffd700",
desc:"Trĩ vàng ngũ sắc đuôi dài thướt tha, bộ lông ánh lục kim lấp lánh dưới nắng."
},
{
id:"hoa_linh_vien",name:"Đào Hoa Linh Viên",habitat:"land",rarity:"Hiếm",
biomes:["peach_valley","rocky_badlands"],spd:74,scale:1.00,auraColor:"#ff9be0",
desc:"Linh hầu nhanh nhẹn ôm quả đào tiên phát sáng, thích leo trèo trên các tảng đá."
},
{
id:"truc_hung",name:"Thái Cực Trúc Hùng",habitat:"land",rarity:"Linh Thú",
biomes:["bamboo_highland"],spd:48,scale:1.16,auraColor:"#d8fff0",
desc:"Gấu trúc âm dương khoan thai gặm măng ngọc trong rừng trúc cao nguyên."
},
{
id:"thanh_truc_xa",name:"Thanh Trúc Linh Xà",habitat:"land",rarity:"Thường",
biomes:["bamboo_highland","rocky_badlands"],spd:68,scale:1.02,auraColor:"#4cd964",
desc:"Linh xà vảy xanh biếc uốn lượn mềm mại như thân trúc non, lưỡi đỏ nhạy bén."
},
{
id:"luc_khong_tuoc",name:"Lục Ngọc Khổng Tước",habitat:"land",rarity:"Linh Thú",
biomes:["bamboo_highland","peach_valley"],spd:56,scale:1.18,auraColor:"#38e8a8",
desc:"Khổng tước ngọc xòe đuôi rực rỡ điểm mắt sao vàng, biểu tượng thịnh vượng của Phúc Địa."
},
{
id:"kim_ly_ngu",name:"Cẩm Lý Kim Ngư",habitat:"water",rarity:"Thường",
biomes:["water"],spd:56,scale:0.96,auraColor:"#ffb84d",
desc:"Cá chép gấm đỏ vàng uốn đuôi bơi lượn thành đàn dưới mặt nước linh thủy trong vắt."
},
{
id:"huyen_quy",name:"Huyền Giáp Linh Quy",habitat:"water",rarity:"Hiếm",
biomes:["water"],spd:34,scale:1.08,auraColor:"#5cc995",
desc:"Linh quy mai ngọc khắc vân lục giác cổ xưa, mang hơi thở bình an của Địa Linh."
},
{
id:"thuy_giao",name:"Bích Thủy Ấu Giao",habitat:"water",rarity:"Linh Thú",
biomes:["water"],spd:72,scale:1.22,auraColor:"#4ce6ff",
desc:"Ấu giao long thân xanh ngọc có sừng san hô, lướt sóng tạo vệt bọt trắng dài."
},
{
id:"lien_hoa_thiem",name:"Liên Hoa Kim Thiềm",habitat:"water",rarity:"Hiếm",
biomes:["water"],spd:52,scale:0.92,auraColor:"#ffd700",
desc:"Thiềm thừ ngọc đội ấn tiền vàng trên trán, thích nhảy trên các hồ sen tụ tài."
},
{
id:"xich_diem_lang",name:"Xích Diễm Yêu Lang",habitat:"land",rarity:"Hiếm",
biomes:["crimson_autumn","rocky_badlands"],spd:84,scale:1.10,auraColor:"#ff5733",
desc:"Sói lửa lông đỏ thẫm bờm cháy rực, thường tuần tra trong rừng phong huyết và đồi đá."
},
{
id:"hoa_tuoc",name:"Chu Tước Hỏa Điểu",habitat:"air",rarity:"Linh Thú",
biomes:["crimson_autumn","crystal_glade"],spd:92,scale:1.14,auraColor:"#ff6b35",
desc:"Hỏa điểu cánh rực lửa đỏ vàng, vỗ cánh rắc tia tàn lửa giữa tầng không."
},
{
id:"tuyet_dieu",name:"Hàn Sương Tuyết Điêu",habitat:"land",rarity:"Thường",
biomes:["frost_peak"],spd:82,scale:0.94,auraColor:"#bff0ff",
desc:"Chồn tuyết trắng muốt thân thon dài, đuôi phủ sương băng chạy lướt trên tuyết."
},
{
id:"bang_ky_lan",name:"Băng Tinh Tiểu Kỳ Lân",habitat:"land",rarity:"Linh Thú",
biomes:["frost_peak","crystal_glade"],spd:74,scale:1.18,auraColor:"#74eaff",
desc:"Tiểu kỳ lân vảy băng tinh trong suốt, sừng pha lê phát sáng, đi đến đâu tỏa hàn khí thanh khiết."
},
{
id:"thach_linh_giap",name:"Tử Tinh Giáp Thú",habitat:"land",rarity:"Hiếm",
biomes:["crystal_glade","rocky_badlands"],spd:50,scale:1.08,auraColor:"#c278ff",
desc:"Tê tê giáp tử tinh mang gai pha lê tím ánh vàng trên lưng, chuyên ăn quặng đá cổ."
}
];

const SPECIES_BY_ID={};
const SPECIES_BY_BIOME={};
for (const sp of SPECIES_LIST) {
SPECIES_BY_ID[sp.id]=sp;
for (const b of sp.biomes) {
if (!SPECIES_BY_BIOME[b]) SPECIES_BY_BIOME[b]=[];
SPECIES_BY_BIOME[b].push(sp);
}
}

function getSpecies(id) {
return SPECIES_BY_ID[id]||SPECIES_LIST[0];
}

function pickSpeciesForBiome(biomeId,rand01) {
const pool=SPECIES_BY_BIOME[biomeId]||SPECIES_BY_BIOME.jade_meadow;
const idx=Math.floor(Math.abs(rand01)*pool.length) % pool.length;
return pool[idx];
}

// ==============================================================================
// BESPOKE HAND-DRAWN CANVAS 2D VECTOR ART FOR ALL 20 SPECIES
// Centered at (0, 0), facing RIGHT (+X); caller flips scaleX(-1) when facing left!
// ==============================================================================
function _drawSpeciesVector(ctx,id,t,phase) {
const stride=Math.sin(t*6.5 + phase);
const flap=Math.sin(t*11.0 + phase);
const breath=Math.sin(t*3.0 + phase);

if (id==="bach_loc") {
// 1. Bạch Lộc Linh Thú (White Jade Spirit Deer)
const l1=stride*3.5;const l2=-stride*3.5;
ctx.strokeStyle="#d9cfc0";ctx.lineWidth=2.4;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-7,4);ctx.lineTo(-9 + l2,14);ctx.moveTo(-4,4);ctx.lineTo(-3 + l1,14);ctx.moveTo(5,4);ctx.lineTo(4 + l2,14);ctx.moveTo(8,4);ctx.lineTo(10 + l1,14);ctx.stroke();
ctx.fillStyle="#2b2623";ctx.fillRect(-10 + l2,13,2.5,2);ctx.fillRect(9 + l1,13,2.5,2);
// Tail
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(-12,-1,3.5,2.2,-0.5,0,Math.PI*2);ctx.fill();
// Body
const bg=ctx.createLinearGradient(-12,-6,12,6);bg.addColorStop(0,"#ffffff");bg.addColorStop(1,"#d6e5dc");
ctx.fillStyle=bg;ctx.strokeStyle="#8fa89a";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,1,11.5,6.2,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Spirit spots
ctx.fillStyle="rgba(126,247,196,0.65)";ctx.beginPath();ctx.arc(-4,-1,1.6,0,Math.PI*2);ctx.arc(0,-2,1.3,0,Math.PI*2);ctx.arc(3,0,1.4,0,Math.PI*2);ctx.fill();
// Neck & Head
ctx.fillStyle="#f7fbf8";ctx.beginPath();ctx.moveTo(7,-2);ctx.lineTo(11,-12);ctx.lineTo(15,-10);ctx.lineTo(11,3);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.ellipse(14.5,-11.5,5.2,3.4,0.15,0,Math.PI*2);ctx.fill();ctx.stroke();
// Ear & Eye
ctx.fillStyle="#e8d5d5";ctx.beginPath();ctx.ellipse(10,-14.5,3.2,1.6,-0.7,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#182b24";ctx.beginPath();ctx.arc(16,-12,1.15,0,Math.PI*2);ctx.fill();
// Golden Branching Antlers
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.7;
ctx.beginPath();ctx.moveTo(12,-14);ctx.lineTo(10,-22);ctx.lineTo(13,-25);ctx.moveTo(10,-19);ctx.lineTo(6,-22);ctx.moveTo(13.5,-14);ctx.lineTo(15,-21);ctx.lineTo(18,-23);ctx.stroke();
return;
}

if (id==="ngoc_tho") {
// 2. Nguyệt Ngọc Thỏ (Moon Jade Rabbit with hopping bounce!)
const hop=Math.abs(Math.sin(t*5.5 + phase))*6.5;
ctx.translate(0,-hop);
// Fluffy moon tail
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(-9.5,2,3.6,0,Math.PI*2);ctx.fill();
// Hind leg
ctx.fillStyle="#dbeaf2";ctx.beginPath();ctx.ellipse(-4,6,5.2,3.4,0.2,0,Math.PI*2);ctx.fill();
// Body
const bg=ctx.createRadialGradient(0,-1,1,0,1,10);bg.addColorStop(0,"#ffffff");bg.addColorStop(1,"#cce3f0");
ctx.fillStyle=bg;ctx.strokeStyle="#8fb2c9";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(-1,2.5,8.5,6.2,-0.15,0,Math.PI*2);ctx.fill();ctx.stroke();
// Head
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(7,-2.5,5.2,0,Math.PI*2);ctx.fill();ctx.stroke();
// Long ears with pink interior
ctx.save();ctx.translate(5,-6);ctx.rotate(-0.35 + breath*0.08);
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(0,-6,2.2,6.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#ffb3cc";ctx.beginPath();ctx.ellipse(0,-6,1.0,4.5,0,0,Math.PI*2);ctx.fill();
ctx.restore();
ctx.save();ctx.translate(8,-6.5);ctx.rotate(0.12 - breath*0.08);
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(0,-6.2,2.2,6.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#ffb3cc";ctx.beginPath();ctx.ellipse(0,-6.2,1.0,4.5,0,0,Math.PI*2);ctx.fill();
ctx.restore();
// Ruby eye & tiny nose
ctx.fillStyle="#ff4d6d";ctx.beginPath();ctx.arc(9.2,-3.2,1.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ff99b8";ctx.beginPath();ctx.arc(11.8,-1.6,1.0,0,Math.PI*2);ctx.fill();
return;
}

if (id==="thanh_diep") {
// 3. Thanh Điệp Linh Cổ (Emerald Spirit Butterfly — airborne!)
const wScale=0.35 + Math.abs(flap)*0.75;
ctx.translate(0,-10 + breath*3);
// Upper & lower wings
for (const side of [-1,1]) {
ctx.save();ctx.scale(1,side*wScale);
const wg=ctx.createRadialGradient(-2,-6,1,-2,-8,14);
wg.addColorStop(0,"#ffffff");wg.addColorStop(0.4,"#7ef7c4");wg.addColorStop(1,"#168a62");
ctx.fillStyle=wg;ctx.strokeStyle="#d8fff0";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(2,0);ctx.bezierCurveTo(10,-14,-6,-18,-10,-6);ctx.bezierCurveTo(-12,-1,-4,0,2,0);ctx.fill();ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(-4,-8,1.8,0,Math.PI*2);ctx.fill();
ctx.restore();
}
// Slender body & antennae
ctx.fillStyle="#14382c";ctx.beginPath();ctx.ellipse(0,0,7.5,1.8,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(7,-0.5);ctx.quadraticCurveTo(11,-5,13,-4);ctx.moveTo(7,0.5);ctx.quadraticCurveTo(11,5,13,4);ctx.stroke();
return;
}

if (id==="hoang_kim_phong") {
// 4. Hoàng Kim Mật Phong (Golden Spirit Bee — airborne!)
const buzz=Math.sin(t*28 + phase)*3.5;
ctx.translate(0,-9 + breath*2.5);
// Translucent buzzing wings
ctx.fillStyle="rgba(220,250,255,0.68)";ctx.strokeStyle="#ffffff";ctx.lineWidth=0.9;
ctx.beginPath();ctx.ellipse(-1,-6 - buzz*0.3,6.5,3.2,-0.5,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.ellipse(2,-5 + buzz*0.3,5.2,2.6,-0.2,0,Math.PI*2);ctx.fill();ctx.stroke();
// Stinger
ctx.fillStyle="#24180c";ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-14,0);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();
// Golden striped body
const bg=ctx.createLinearGradient(-9,-5,9,5);bg.addColorStop(0,"#ffe066");bg.addColorStop(1,"#d48806");
ctx.fillStyle=bg;ctx.strokeStyle="#3d2405";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,1,9.5,5.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#2b1a07";ctx.fillRect(-5,-4,2.4,9.8);ctx.fillRect(-0.5,-4.3,2.4,10.2);ctx.fillRect(4,-3.8,2.2,9.2);
// Head & eye
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(8.5,0.5,3.8,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#111111";ctx.beginPath();ctx.arc(10,0,1.2,0,Math.PI*2);ctx.fill();
return;
}

if (id==="linh_ho") {
// 5. Cửu Vĩ Linh Hồ (Spirit Fox with multi-plume waving tail!)
const l1=stride*3.5;
// 3 Flowing Fox Tails
for (let k=-1;k<=1;k++) {
ctx.save();ctx.translate(-9,1);ctx.rotate(-0.4 + k*0.34 + Math.sin(t*4 + phase + k)*0.18);
ctx.fillStyle=k===0?"#ff7b29" :"#ff9f43";
ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-10,-5,-16,0);ctx.quadraticCurveTo(-10,5,0,0);ctx.fill();
ctx.fillStyle="#fff5e6";ctx.beginPath();ctx.arc(-13.5,0,2.5,0,Math.PI*2);ctx.fill();
ctx.restore();
}
// Legs
ctx.strokeStyle="#3d1e0e";ctx.lineWidth=2.3;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-5,5);ctx.lineTo(-6 - l1,13);ctx.moveTo(5,5);ctx.lineTo(6 + l1,13);ctx.stroke();
// Sleek amber body & white chest
const bg=ctx.createLinearGradient(-10,-4,10,6);bg.addColorStop(0,"#ff6b2b");bg.addColorStop(1,"#ffaa4c");
ctx.fillStyle=bg;ctx.strokeStyle="#7a2c0c";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,2,10.5,5.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#fff5e6";ctx.beginPath();ctx.ellipse(7.5,2.5,4.2,4.5,0.2,0,Math.PI*2);ctx.fill();
// Fox head & pointed ears
ctx.fillStyle="#ff7b29";ctx.beginPath();ctx.moveTo(6,-5);ctx.lineTo(17,-2);ctx.lineTo(9,3);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(7,-4);ctx.lineTo(5,-11);ctx.lineTo(10,-6);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(10,-5);ctx.lineTo(11,-11);ctx.lineTo(13,-5);ctx.closePath();ctx.fill();
ctx.fillStyle="#1a120e";ctx.beginPath();ctx.arc(16.5,-2,1.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(11.8,-3.2,1.15,0,Math.PI*2);ctx.fill();
return;
}

if (id==="tien_hac") {
// 6. Bạch Vũ Tiên Hạc (Immortal Red-Crowned Crane — gliding!)
const wf=flap*8;
ctx.translate(0,-14 + breath*3);
// Trailing slender legs
ctx.strokeStyle="#262c30";ctx.lineWidth=1.4;
ctx.beginPath();ctx.moveTo(-6,3);ctx.lineTo(-17,7);ctx.moveTo(-5,4);ctx.lineTo(-16,9);ctx.stroke();
// Back wing
ctx.fillStyle="#e2edf5";ctx.beginPath();ctx.moveTo(-2,-2);ctx.quadraticCurveTo(-8,-16 - wf,-16,-6 - wf);ctx.quadraticCurveTo(-8,0,-2,-2);ctx.fill();
// Body
ctx.fillStyle="#ffffff";ctx.strokeStyle="#9cb0bf";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,1,11,5.2,-0.1,0,Math.PI*2);ctx.fill();ctx.stroke();
// Front sweeping wing with black ink tips
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.moveTo(2,0);ctx.quadraticCurveTo(-4,-18 + wf,-15,-8 + wf);ctx.quadraticCurveTo(-5,4,2,0);ctx.fill();ctx.stroke();
ctx.fillStyle="#1a2228";ctx.beginPath();ctx.arc(-13,-7 + wf,3.2,0,Math.PI*2);ctx.fill();
// Graceful S-neck, red crown & golden beak
ctx.strokeStyle="#ffffff";ctx.lineWidth=3.2;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(9,0);ctx.quadraticCurveTo(15,-6,17,-9);ctx.stroke();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(17.5,-9.5,3.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ff2a2a";ctx.beginPath();ctx.arc(17.2,-11.5,1.8,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#e8b848";ctx.beginPath();ctx.moveTo(20,-10);ctx.lineTo(26,-8.8);ctx.lineTo(20,-8);ctx.closePath();ctx.fill();
return;
}

if (id==="kim_tri") {
// 7. Thải Phượng Kim Trĩ (Rainbow Golden Pheasant)
const l1=stride*3;
// Long flowing golden-red tail plumes
ctx.strokeStyle="#ff5733";ctx.lineWidth=2.6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-7,1);ctx.quadraticCurveTo(-18,-3 + breath*2,-25,2 + breath*2);ctx.stroke();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(-7,0);ctx.quadraticCurveTo(-17,-6 + breath,-23,-1 + breath);ctx.stroke();
// Legs
ctx.strokeStyle="#d4af37";ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-1,6);ctx.lineTo(-2 - l1,13);ctx.moveTo(3,6);ctx.lineTo(4 + l1,13);ctx.stroke();
// Emerald-crimson body
const bg=ctx.createLinearGradient(-9,-4,9,6);bg.addColorStop(0,"#1d8348");bg.addColorStop(0.55,"#e03e3e");bg.addColorStop(1,"#ffd700");
ctx.fillStyle=bg;ctx.strokeStyle="#5c2808";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,1.5,10,5.8,-0.1,0,Math.PI*2);ctx.fill();ctx.stroke();
// Golden ruff & head + crest
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(9,-4.5,4.2,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.strokeStyle="#ff3b30";ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(8,-8);ctx.quadraticCurveTo(3,-13,1,-10);ctx.stroke();
ctx.fillStyle="#111111";ctx.beginPath();ctx.arc(10.5,-5,1.1,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ff9f43";ctx.beginPath();ctx.moveTo(13,-5);ctx.lineTo(17,-4);ctx.lineTo(13,-3);ctx.closePath();ctx.fill();
return;
}

if (id==="hoa_linh_vien") {
// 8. Đào Hoa Linh Viên (Peach Blossom Spirit Ape holding Spirit Peach!)
const l1=stride*3;
// Curled tail
ctx.strokeStyle="#9c4832";ctx.lineWidth=2.4;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-7,4);ctx.bezierCurveTo(-16,6,-17,-7,-11,-8 + breath*2);ctx.stroke();
// Legs
ctx.strokeStyle="#783220";ctx.lineWidth=2.6;
ctx.beginPath();ctx.moveTo(-3,6);ctx.lineTo(-4 - l1,13);ctx.moveTo(3,6);ctx.lineTo(4 + l1,13);ctx.stroke();
// Torso
ctx.fillStyle="#b85a40";ctx.strokeStyle="#4d1e12";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,1.5,7.5,8.2,0.15,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#f5d5c6";ctx.beginPath();ctx.ellipse(2,2,4.2,5.5,0.1,0,Math.PI*2);ctx.fill();
// Head & face
ctx.fillStyle="#b85a40";ctx.beginPath();ctx.arc(2,-9,5.8,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#f7d9cb";ctx.beginPath();ctx.arc(4,-8.5,3.8,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#1f1410";ctx.beginPath();ctx.arc(5,-9.5,1.1,0,Math.PI*2);ctx.fill();
// Glowing Immortal Peach held in front paw!
ctx.fillStyle="#ff7aa8";ctx.beginPath();ctx.arc(10,0,4.0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffe6f0";ctx.beginPath();ctx.arc(9,-1,1.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#5cc995";ctx.beginPath();ctx.ellipse(10,-4,2.8,1.2,-0.4,0,Math.PI*2);ctx.fill();
return;
}

if (id==="truc_hung") {
// 9. Thái Cực Trúc Hùng (Yin-Yang Spirit Panda with Jade Bamboo!)
const l1=stride*2.5;
// Black legs
ctx.fillStyle="#181c20";
ctx.beginPath();ctx.ellipse(-6,9 + l1*0.4,3.8,4.2,0,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.ellipse(6,9 - l1*0.4,3.8,4.2,0,0,Math.PI*2);ctx.fill();
// Plump white body + black shoulder band
ctx.fillStyle="#f7f9fa";ctx.strokeStyle="#262d33";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(0,2,11.5,8.8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#181c20";ctx.beginPath();ctx.ellipse(4.5,1.5,4.2,8.2,0.15,0,Math.PI*2);ctx.fill();
// Head & black ears
ctx.fillStyle="#181c20";ctx.beginPath();ctx.arc(5,-11.5,3.0,0,Math.PI*2);ctx.arc(12.5,-11,3.0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(9,-6.5,6.4,0,Math.PI*2);ctx.fill();ctx.stroke();
// Iconic black eye patch & bright eye
ctx.fillStyle="#181c20";ctx.beginPath();ctx.ellipse(11.5,-7,2.5,1.9,-0.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(12,-7.2,0.8,0,Math.PI*2);ctx.fill();
// Jade Bamboo shoot held in front!
ctx.strokeStyle="#38e8a8";ctx.lineWidth=2.6;
ctx.beginPath();ctx.moveTo(14,7);ctx.lineTo(18,-7);ctx.stroke();
ctx.fillStyle="#7ef7c4";ctx.beginPath();ctx.ellipse(19,-5,3.2,1.3,0.4,0,Math.PI*2);ctx.fill();
return;
}

if (id==="thanh_truc_xa") {
// 10. Thanh Trúc Linh Xà (Jade Bamboo Spirit Serpent — sinuous S-slither!)
ctx.lineCap="round";
for (let seg=7;seg>=0;seg--) {
const sx=-seg*3.2;
const sy=Math.sin(t*6.5 + phase + seg*0.72)*4.2 + 2;
const sr=Math.max(2.0,5.0 - seg*0.38);
ctx.fillStyle=(seg % 2===0)?"#2ecc71" :"#1b8a4b";
ctx.strokeStyle="#0c3d22";ctx.lineWidth=0.9;
ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();ctx.stroke();
}
// Diamond serpent head + glowing yellow eyes + flicking forked tongue
const hy=Math.sin(t*6.5 + phase)*4.2 + 2;
ctx.fillStyle="#38e8a8";ctx.strokeStyle="#0c3d22";ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(10,hy);ctx.lineTo(2,hy - 4.5);ctx.lineTo(-2,hy);ctx.lineTo(2,hy + 4.5);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(4.5,hy - 1.6,1.1,0,Math.PI*2);ctx.arc(4.5,hy + 1.6,1.1,0,Math.PI*2);ctx.fill();
if (Math.sin(t*8 + phase)>0.1) {
ctx.strokeStyle="#ff3b30";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(10,hy);ctx.lineTo(15,hy);ctx.lineTo(17,hy - 2);ctx.moveTo(15,hy);ctx.lineTo(17,hy + 2);ctx.stroke();
}
return;
}

if (id==="luc_khong_tuoc") {
// 11. Lục Ngọc Khổng Tước (Emerald Spirit Peacock with fanned eye-spotted tail!)
const fanPulse=0.92 + breath*0.08;
// Fanned Peacock Tail behind body
ctx.save();ctx.translate(-5,0);ctx.scale(fanPulse,fanPulse);
for (let k=-3;k<=3;k++) {
const a=Math.PI + k*0.26;
const ex=Math.cos(a)*17;const ey=Math.sin(a)*14 - 2;
ctx.strokeStyle="#16a085";ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(ex,ey);ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(ex,ey,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#2980b9";ctx.beginPath();ctx.arc(ex,ey,1.3,0,Math.PI*2);ctx.fill();
}
ctx.restore();
// Legs
ctx.strokeStyle="#b89758";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(-1,6);ctx.lineTo(-2,13);ctx.moveTo(3,6);ctx.lineTo(4,13);ctx.stroke();
// Royal Teal-Blue Body & Graceful Neck
const bg=ctx.createLinearGradient(-6,-4,10,6);bg.addColorStop(0,"#1abc9c");bg.addColorStop(1,"#1b4f72");
ctx.fillStyle=bg;ctx.strokeStyle="#7ef7f0";ctx.lineWidth=1.0;
ctx.beginPath();ctx.ellipse(0,2,8.5,5.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.strokeStyle="#2471a3";ctx.lineWidth=3.5;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(6,0);ctx.quadraticCurveTo(10,-7,12,-11);ctx.stroke();
ctx.fillStyle="#2e86c1";ctx.beginPath();ctx.arc(12.5,-11.5,3.4,0,Math.PI*2);ctx.fill();
// Golden crown crest
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(11,-14);ctx.lineTo(9,-18);ctx.moveTo(12.5,-14.5);ctx.lineTo(12.5,-19);ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.moveTo(15.5,-12);ctx.lineTo(19,-11);ctx.lineTo(15.5,-10);ctx.closePath();ctx.fill();
return;
}

if (id==="kim_ly_ngu") {
// 12. Cẩm Lý Kim Ngư (Golden Brocade Koi — swimming!)
const wag=Math.sin(t*9 + phase)*4.5;
// Flowing translucent tail fin
ctx.fillStyle="rgba(255,215,120,0.82)";ctx.strokeStyle="#d35400";ctx.lineWidth=0.9;
ctx.beginPath();ctx.moveTo(-8,0);ctx.lineTo(-17,-6 + wag);ctx.quadraticCurveTo(-13,wag*0.4,-17,6 + wag);ctx.closePath();ctx.fill();ctx.stroke();
// Side pectoral fins
ctx.fillStyle="rgba(255,235,180,0.78)";
ctx.beginPath();ctx.ellipse(1,-6,4.5,2.2,-0.5,0,Math.PI*2);ctx.ellipse(1,6,4.5,2.2,0.5,0,Math.PI*2);ctx.fill();
// Sleek Koi body (orange-gold & white calico markings)
const bg=ctx.createLinearGradient(-9,0,11,0);bg.addColorStop(0,"#ff9f43");bg.addColorStop(0.55,"#ff5733");bg.addColorStop(1,"#ffd700");
ctx.fillStyle=bg;ctx.strokeStyle="#872e0a";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(1,0,10.5,4.8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(-2,-1,3.2,2.2,0.2,0,Math.PI*2);ctx.arc(5,1,2.0,0,Math.PI*2);ctx.fill();
// Whiskers & dark eye
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(10.5,-1);ctx.lineTo(14,-3.5);ctx.moveTo(10.5,1);ctx.lineTo(14,3.5);ctx.stroke();
ctx.fillStyle="#111111";ctx.beginPath();ctx.arc(8,-1.2,1.1,0,Math.PI*2);ctx.fill();
return;
}

if (id==="huyen_quy") {
// 13. Huyền Giáp Linh Quy (Mystic Jade Turtle — swimming!)
const pad=Math.sin(t*5 + phase)*2.5;
// 4 Flippers
ctx.fillStyle="#2e7d5b";ctx.strokeStyle="#123828";ctx.lineWidth=1.0;
ctx.beginPath();ctx.ellipse(-7,-7 - pad*0.4,4.2,2.4,-0.6,0,Math.PI*2);ctx.ellipse(-7,7 + pad*0.4,4.2,2.4,0.6,0,Math.PI*2);
ctx.ellipse(6,-7 + pad*0.5,4.8,2.6,0.5,0,Math.PI*2);ctx.ellipse(6,7 - pad*0.5,4.8,2.6,-0.5,0,Math.PI*2);ctx.fill();ctx.stroke();
// Head & tail
ctx.fillStyle="#389c72";ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-14,0);ctx.lineTo(-10,2);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.ellipse(12.5,0,4.5,3.2,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(14,-1.2,1.0,0,Math.PI*2);ctx.fill();
// Hexagonal Rune-Carved Jade Shell
const sg=ctx.createRadialGradient(-2,-2,2,0,0,11);sg.addColorStop(0,"#5cc995");sg.addColorStop(0.65,"#1a593f");sg.addColorStop(1,"#0c2b1f");
ctx.fillStyle=sg;ctx.strokeStyle="#d4af37";ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(0,0,10.5,8.2,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.strokeStyle="rgba(255,215,0,0.55)";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(4,-3);ctx.lineTo(6,0);ctx.lineTo(4,3);ctx.lineTo(-4,3);ctx.lineTo(-6,0);ctx.closePath();ctx.stroke();
return;
}

if (id==="thuy_giao") {
// 14. Bích Thủy Ấu Giao (Azure River Flood Dragonling — serpentine swimmer!)
for (let seg=8;seg>=0;seg--) {
const sx=-seg*3.3;
const sy=Math.sin(t*7.2 + phase + seg*0.65)*4.5;
const sr=Math.max(2.2,5.6 - seg*0.36);
ctx.fillStyle=(seg % 2===0)?"#4ce6ff" :"#1b7ea6";
ctx.strokeStyle="#0a3347";ctx.lineWidth=0.9;
ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();ctx.stroke();
}
const hy=Math.sin(t*7.2 + phase)*4.5;
// Horned Dragon Head & Whiskers
ctx.fillStyle="#7ef7f0";ctx.strokeStyle="#0d445c";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(5,hy,6.8,4.6,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(2,hy - 3.5);ctx.lineTo(-2,hy - 9);ctx.moveTo(4,hy - 3.5);ctx.lineTo(3,hy - 8.5);ctx.stroke();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(11,hy - 1);ctx.quadraticCurveTo(15,hy - 5,17,hy - 3);ctx.moveTo(11,hy + 1);ctx.quadraticCurveTo(15,hy + 5,17,hy + 3);ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(7.5,hy - 1.5,1.3,0,Math.PI*2);ctx.fill();
return;
}

if (id==="lien_hoa_thiem") {
// 15. Liên Hoa Kim Thiềm (Lotus Golden Toad)
const hop=Math.abs(Math.sin(t*4.5 + phase))*4.5;
// Floating lotus leaf underneath
ctx.fillStyle="#1d8348";ctx.strokeStyle="#5cc995";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,5,12,6.5,0,0.3,Math.PI*1.9);ctx.lineTo(0,5);ctx.closePath();ctx.fill();ctx.stroke();
ctx.translate(0,-hop);
// Plump gilded-jade toad body
const bg=ctx.createRadialGradient(0,-2,2,0,1,9);bg.addColorStop(0,"#ffe066");bg.addColorStop(0.6,"#4cd964");bg.addColorStop(1,"#1b6e3c");
ctx.fillStyle=bg;ctx.strokeStyle="#2b4d18";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(0,1,8.5,6.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Bulging golden eyes & fortune coin crest
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(5,-5,2.6,0,Math.PI*2);ctx.arc(1,-5.5,2.4,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#111111";ctx.beginPath();ctx.arc(5.8,-5,1.0,0,Math.PI*2);ctx.arc(1.8,-5.5,1.0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(-2,-5,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#2b1a07";ctx.fillRect(-2.8,-5.8,1.6,1.6);
return;
}

if (id==="xich_diem_lang") {
// 16. Xích Diễm Yêu Lang (Crimson Flame Spirit Wolf)
const l1=stride*4;
// Blazing flame tail
ctx.fillStyle="#ff9f43";ctx.beginPath();ctx.moveTo(-9,0);ctx.quadraticCurveTo(-18,-7 + breath*2,-16,4);ctx.closePath();ctx.fill();
ctx.fillStyle="#ff3b30";ctx.beginPath();ctx.moveTo(-9,0);ctx.quadraticCurveTo(-15,-4 + breath,-13,3);ctx.closePath();ctx.fill();
// Legs
ctx.strokeStyle="#4d1010";ctx.lineWidth=2.6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-6,4);ctx.lineTo(-8 - l1,13);ctx.moveTo(-3,4);ctx.lineTo(-2 + l1,13);ctx.moveTo(5,4);ctx.lineTo(4 - l1,13);ctx.moveTo(8,4);ctx.lineTo(10 + l1,13);ctx.stroke();
// Muscular crimson-dark body
const bg=ctx.createLinearGradient(-11,-4,11,6);bg.addColorStop(0,"#591212");bg.addColorStop(0.6,"#c02828");bg.addColorStop(1,"#ff5733");
ctx.fillStyle=bg;ctx.strokeStyle="#2e0808";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(0,1,11.5,6.2,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Fiery mane & wolf head
ctx.fillStyle="#ff6b35";ctx.beginPath();ctx.moveTo(4,-6);ctx.lineTo(10,-10);ctx.lineTo(13,-2);ctx.lineTo(6,5);ctx.closePath();ctx.fill();
ctx.fillStyle="#b81d1d";ctx.beginPath();ctx.moveTo(7,-6);ctx.lineTo(18,-2.5);ctx.lineTo(16,2);ctx.lineTo(8,2);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(8,-6);ctx.lineTo(6,-12);ctx.lineTo(11,-7);ctx.closePath();ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(12.5,-4,1.3,0,Math.PI*2);ctx.fill();
return;
}

if (id==="hoa_tuoc") {
// 17. Chu Tước Hỏa Điểu (Vermilion Flame Bird — airborne!)
const wf=flap*8;
ctx.translate(0,-13 + breath*3);
// Fiery streaming tail ribbons
ctx.strokeStyle="#ff9f43";ctx.lineWidth=2.4;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-8,1);ctx.quadraticCurveTo(-18,-3 + breath*3,-25,2 - breath*2);ctx.stroke();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(-8,3);ctx.quadraticCurveTo(-16,7 - breath*2,-22,6 + breath*2);ctx.stroke();
// Blazing Wings
const wg=ctx.createLinearGradient(-14,-16,6,4);wg.addColorStop(0,"#ffd700");wg.addColorStop(0.5,"#ff5733");wg.addColorStop(1,"#b81d1d");
ctx.fillStyle=wg;ctx.strokeStyle="#fff0a6";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(3,0);ctx.quadraticCurveTo(-3,-18 + wf,-15,-9 + wf);ctx.quadraticCurveTo(-5,3,3,0);ctx.fill();ctx.stroke();
// Body, head & flame crest
ctx.fillStyle="#e03224";ctx.beginPath();ctx.ellipse(1,1,9.5,4.8,-0.1,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ff6b35";ctx.beginPath();ctx.arc(10,-3,4.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.moveTo(9,-6);ctx.lineTo(4,-12);ctx.lineTo(12,-7);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(14,-3.5);ctx.lineTo(19,-2);ctx.lineTo(14,-1);ctx.closePath();ctx.fill();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(11.5,-3.6,1.1,0,Math.PI*2);ctx.fill();
return;
}

if (id==="tuyet_dieu") {
// 18. Hàn Sương Tuyết Điêu (Frost Snow Mink/Ermine)
const l1=stride*3.5;
// Frosty long fluffy tail
ctx.fillStyle="#d6f5ff";ctx.strokeStyle="#7cc7e8";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(-9,2);ctx.quadraticCurveTo(-18,-4 + breath*2,-21,1);ctx.quadraticCurveTo(-15,6,-9,2);ctx.fill();ctx.stroke();
// Short nimble paws
ctx.strokeStyle="#c7e2ed";ctx.lineWidth=2.2;
ctx.beginPath();ctx.moveTo(-6,4);ctx.lineTo(-7 - l1,10);ctx.moveTo(6,4);ctx.lineTo(7 + l1,10);ctx.stroke();
// Sleek elongated snow-white body
const bg=ctx.createLinearGradient(-11,-3,11,5);bg.addColorStop(0,"#ffffff");bg.addColorStop(1,"#d2eefc");
ctx.fillStyle=bg;ctx.strokeStyle="#7fb3cc";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,2,11.5,4.4,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Head, rounded ears & icy blue eyes
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(10.5,-1,4.8,3.6,0.1,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.arc(8,-4.5,2.0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#1a2c38";ctx.beginPath();ctx.arc(14.8,-0.8,1.1,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#00c8ff";ctx.beginPath();ctx.arc(11.5,-1.8,1.2,0,Math.PI*2);ctx.fill();
return;
}

if (id==="bang_ky_lan") {
// 19. Băng Tinh Tiểu Kỳ Lân (Ice Crystal Qilin Foal)
const l1=stride*3.5;
// Cloud-frost tail
ctx.fillStyle="#8ee4ff";ctx.beginPath();ctx.arc(-12,-1 + breath,4.2,0,Math.PI*2);ctx.arc(-15,1 - breath,3.0,0,Math.PI*2);ctx.fill();
// Legs with glowing frost hooves
ctx.strokeStyle="#a8ecff";ctx.lineWidth=2.6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-7,4);ctx.lineTo(-8 - l1,14);ctx.moveTo(-3,4);ctx.lineTo(-2 + l1,14);ctx.moveTo(5,4);ctx.lineTo(4 - l1,14);ctx.moveTo(8,4);ctx.lineTo(10 + l1,14);ctx.stroke();
// Crystalline sky-blue scaled body
const bg=ctx.createLinearGradient(-12,-6,12,6);bg.addColorStop(0,"#e6faff");bg.addColorStop(0.55,"#74d8ff");bg.addColorStop(1,"#2f80a8");
ctx.fillStyle=bg;ctx.strokeStyle="#ffffff";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(0,1,11.5,6.8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Icy mane & noble Qilin head
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.moveTo(5,-5);ctx.lineTo(9,-14);ctx.lineTo(16,-10);ctx.lineTo(12,2);ctx.closePath();ctx.fill();ctx.stroke();
// Twin Crystal Horns
ctx.strokeStyle="#e0f9ff";ctx.lineWidth=2.0;
ctx.beginPath();ctx.moveTo(10,-13);ctx.lineTo(8,-21);ctx.moveTo(12,-13);ctx.lineTo(14,-20);ctx.stroke();
ctx.fillStyle="#005580";ctx.beginPath();ctx.arc(13,-10.5,1.25,0,Math.PI*2);ctx.fill();
return;
}

// 20. Tử Tinh Giáp Thú (Amethyst Crystal Pangolin / Armadillo)
const l1=stride*2.5;
// Armored crystal tail
ctx.fillStyle="#5b2c82";ctx.strokeStyle="#d29eff";ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(-9,3);ctx.lineTo(-19,6);ctx.lineTo(-10,7);ctx.closePath();ctx.fill();ctx.stroke();
// Sturdy clawed legs
ctx.fillStyle="#3a264d";
ctx.beginPath();ctx.ellipse(-5,8 + l1*0.4,3.4,3.0,0,0,Math.PI*2);ctx.ellipse(5,8 - l1*0.4,3.4,3.0,0,0,Math.PI*2);ctx.fill();
// Overlapping Violet-Gold Crystal Armor Plates
const bg=ctx.createLinearGradient(-11,-8,11,6);bg.addColorStop(0,"#3a1959");bg.addColorStop(0.5,"#8e44ad");bg.addColorStop(1,"#d29eff");
ctx.fillStyle=bg;ctx.strokeStyle="#ffd700";ctx.lineWidth=1.3;
ctx.beginPath();ctx.arc(0,5,11,Math.PI,0);ctx.closePath();ctx.fill();ctx.stroke();
// Dorsal Amethyst Spikes
ctx.fillStyle="#e0aaff";
for (const [sx,sy] of [[-6,-4],[0,-6],[6,-4]]) {
ctx.beginPath();ctx.moveTo(sx - 2.5,sy + 2);ctx.lineTo(sx,sy - 4.5);ctx.lineTo(sx + 2.5,sy + 2);ctx.closePath();ctx.fill();
}
// Snout & glowing eye
ctx.fillStyle="#734599";ctx.strokeStyle="#e0aaff";ctx.lineWidth=1.0;
ctx.beginPath();ctx.moveTo(9,1);ctx.lineTo(16,4.5);ctx.lineTo(9,6);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(11.2,2.6,1.15,0,Math.PI*2);ctx.fill();
}

// 2-Frame Offscreen Sprite Cache for ultra-fast 144 FPS PC / 60 FPS Mobile normal zoom!
const _CREATURE_SPRITE_CACHE=new Map();

function drawCreature(ctx,cr,t,zoom=1.0) {
const sp=getSpecies(cr.speciesId);
const scale=(cr.scale||sp.scale||1.0);
const faceDir=(cr.vx< -2)? -1 :((cr.vx>2)?1 :(cr.faceDir||1));
cr.faceDir=faceDir;
const isWater=(sp.habitat==="water");
const isAir=(sp.habitat==="air");

ctx.save();
ctx.translate(cr.x,cr.y);

// Ground / Water Shadow
if (isWater) {
ctx.strokeStyle="rgba(185,248,255,0.42)";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(0,4,12*scale + Math.sin(t*4 + cr.phase)*1.5,5*scale,0,0,Math.PI*2);ctx.stroke();
} else if (isAir) {
ctx.fillStyle="rgba(0,0,0,0.22)";
ctx.beginPath();ctx.ellipse(0,11,9*scale,3.5*scale,0,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle="rgba(0,0,0,0.34)";
ctx.beginPath();ctx.ellipse(0,11*scale,11*scale,4.2*scale,0,0,Math.PI*2);ctx.fill();
}

// Subtle Spirit Aura for Rare / Linh Thú species
if (sp.rarity==="Linh Thú") {
ctx.fillStyle=sp.auraColor||"#7ef7c4";
ctx.globalAlpha=0.14 + Math.sin(t*3 + (cr.phase||0))*0.05;
ctx.beginPath();ctx.arc(0,isAir? -10 :0,16*scale,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=1;
}

// High-Zoom Live Crisp Vector (>= 1.45x up to 2000%!) vs Fast 2-Frame Sprite Cache!
if (zoom>=1.45) {
ctx.scale(faceDir*scale,scale);
_drawSpeciesVector(ctx,sp.id,t,cr.phase||0);
} else {
const animF=Math.floor(t*3.2 + (cr.phase||0)) % 2;
const key=`${sp.id}_${faceDir}_${animF}`;
let spr=_CREATURE_SPRITE_CACHE.get(key);
if (!spr) {
spr=document.createElement("canvas");
spr.width=72;spr.height=72;
const sctx=spr.getContext("2d");
sctx.translate(36,42);
sctx.scale(faceDir,1);
_drawSpeciesVector(sctx,sp.id,animF===0?0.25 :1.82,0);
if (_CREATURE_SPRITE_CACHE.size>=120) {
const oldK=_CREATURE_SPRITE_CACHE.keys().next().value;
_CREATURE_SPRITE_CACHE.delete(oldK);
}
_CREATURE_SPRITE_CACHE.set(key,spr);
}
const drawW=72*scale;const drawH=72*scale;
ctx.drawImage(spr,-36*scale,-42*scale,drawW,drawH);
}

ctx.restore();
}

function renderPortraitToCanvas(canvas,speciesId) {
if (!canvas) return;
const ctx=canvas.getContext("2d");
const w=canvas.width;const h=canvas.height;
ctx.clearRect(0,0,w,h);
const sp=getSpecies(speciesId);
const bg=ctx.createRadialGradient(w*0.5,h*0.5,4,w*0.5,h*0.5,w*0.56);
bg.addColorStop(0,sp.habitat==="water"?"#165a75" :"#1b382c");
bg.addColorStop(1,"#091118");
ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
ctx.save();
ctx.translate(w*0.5,sp.habitat==="air"?h*0.66 :h*0.58);
ctx.scale(1.45,1.45);
_drawSpeciesVector(ctx,sp.id,0.35,0);
ctx.restore();
}

global.BlessedLandCreatures={
SPECIES_LIST,
SPECIES_BY_ID,
SPECIES_BY_BIOME,
getSpecies,
pickSpeciesForBiome,
drawCreature,
renderPortraitToCanvas
};
})(window);
