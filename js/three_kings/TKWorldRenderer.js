(function (global) {
"use strict";
const {Arch}=global.ThreeKingsWorlds;
let _TK_MIST_SPR=null;
function _getTkMistSprite() {
if (_TK_MIST_SPR) return _TK_MIST_SPR;
const c=document.createElement("canvas");c.width=128;c.height=128;
const gctx=c.getContext("2d");
const mg=gctx.createRadialGradient(64,64,8,64,64,64);
mg.addColorStop(0,"rgba(218,230,224,0.34)");mg.addColorStop(1,"rgba(218,230,224,0)");
gctx.fillStyle=mg;gctx.beginPath();gctx.arc(64,64,64,0,Math.PI*2);gctx.fill();
_TK_MIST_SPR=c;
return c;
}
function renderWorldTerrainAndArchitecture(ctx,scene,t,player) {
// ==================== WORLD 1: THANH ĐỒNG ĐẠI ĐIỆN ====================
if (scene.id==="bronze_hall") {
const bg=ctx.createRadialGradient(1300,1040,180,1300,1040,1550);
bg.addColorStop(0,"#3d3122");bg.addColorStop(0.45,"#261e16");bg.addColorStop(0.82,"#161210");bg.addColorStop(1,"#0b0809");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);
ctx.fillStyle="#2e2418";ctx.strokeStyle="rgba(184,151,88,0.28)";ctx.lineWidth=4;
ctx.beginPath();ctx.ellipse(1300,1060,880,720,0,0,Math.PI*2);ctx.fill();ctx.stroke();

Arch.drawStonePlatform(ctx,960,1380,680,310,{baseCol:"#1e1710",topCol:"#2b2217",edgeCol:"#8c7244",tileSize:52});
Arch.drawStonePlatform(ctx,700,1240,230,220,{baseCol:"#1b150e",topCol:"#281f15",edgeCol:"#8c7244",tileSize:44});
Arch.drawStonePlatform(ctx,1670,1240,230,220,{baseCol:"#1b150e",topCol:"#281f15",edgeCol:"#8c7244",tileSize:44});
Arch.drawStonePlatform(ctx,880,580,840,660,{baseCol:"#1a130b",topCol:"#292014",edgeCol:"#b89758",tileSize:56,bevel:16});
Arch.drawStonePlatform(ctx,930,620,740,580,{baseCol:"#21180e",topCol:"#322618",edgeCol:"#ffd700",tileSize:48,bevel:10});

ctx.fillStyle="#4f1616";ctx.fillRect(1235,940,130,450);
ctx.strokeStyle="#d4af37";ctx.lineWidth=2.5;ctx.strokeRect(1235,940,130,450);
ctx.strokeStyle="rgba(255,215,0,0.38)";ctx.lineWidth=1;ctx.strokeRect(1244,946,112,438);

ctx.save();ctx.translate(1300,860);ctx.strokeStyle="rgba(212,175,55,0.42)";ctx.lineWidth=2;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*165;const py=Math.sin(a)*122;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.stroke();ctx.restore();

Arch.drawGrandStaircase(ctx,1185,1235,230,155,8);
Arch.drawNineDragonBronzeCauldron(ctx,1300,860,t,typeof scene.refStageIdx==="number"?scene.refStageIdx :-1,scene.cauldronPrompt||null);
for (const [bx,by] of [[1110,740],[1490,740],[1110,1040],[1490,1040]]) Arch.drawIncenseBrazier(ctx,bx,by,t,"#38e8a8");
for (const ob of scene.obstacles) {if (ob.type==="pillar") Arch.drawOrnateBronzePillar(ctx,ob.x,ob.y,t,1.0);}
Arch.drawBronzeToriiGate(ctx,1300,1425,t,"THANH ĐỒNG ĐẠI ĐIỆN","#7a1616","#ffd700");
Arch.drawStoneHoundStatue(ctx,1140,1460,1,"#7ef7c4");
Arch.drawStoneHoundStatue(ctx,1460,1460,-1,"#7ef7c4");
for (const [lx,ly] of [[1010,1420],[1590,1420],[1170,1660],[1430,1660]]) Arch.drawStoneLantern(ctx,lx,ly,t,"#ffd700");
for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);
for (const h of scene.hounds) {
ctx.fillStyle="rgba(0,0,0,0.38)";ctx.beginPath();ctx.ellipse(h.x,h.y + 5,h.size,h.size*0.45,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=h.color;ctx.beginPath();ctx.ellipse(h.x,h.y,h.size,h.size*0.65,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.fillRect(h.x + 3,h.y - 2,2.2,2.2);
}
if (!scene.mistCleared) {
const _ms1=_getTkMistSprite();
ctx.save();ctx.globalAlpha=0.68;
for (const m of scene.mists) {
const a=m.ang + t*m.speed;const mx=1300 + Math.cos(a)*m.rx;const my=1060 + Math.sin(a)*m.ry;
ctx.drawImage(_ms1,mx - m.r,my - m.r,m.r*2,m.r*2);
}
ctx.restore();
}
if (scene.hallFrostLevel>0) {
ctx.save();
ctx.fillStyle=`rgba(133,225,255,${0.26*scene.hallFrostLevel})`;
ctx.fillRect(880,580,840,660);
ctx.strokeStyle="#bff0ff";ctx.lineWidth=2.2;
for (let i=0;i<14;i++) {
const a=(i*Math.PI*2)/14 + t*0.2;
ctx.beginPath();ctx.moveTo(1300,1115);ctx.lineTo(1300 + Math.cos(a)*290,1115 + Math.sin(a)*210);ctx.stroke();
}
ctx.restore();
}
if (scene.hallRoofShattered) {
Arch.drawShatteredBronzeRoofCrater(ctx,1300,960,t);
}
return;
}

// ==================== WORLD 2: ĐỘC MÙ TRÚC LÂM ====================
if (scene.id==="poison_grove") {
const bg=ctx.createRadialGradient(1300,920,160,1300,920,1450);
bg.addColorStop(0,"#163329");bg.addColorStop(0.55,"#0f241d");bg.addColorStop(1,"#08120e");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);
ctx.strokeStyle="#2d3b34";ctx.lineWidth=96;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(1300,1850);ctx.lineTo(1300,1130);ctx.stroke();
ctx.strokeStyle="rgba(126,247,196,0.16)";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(1300,1850);ctx.lineTo(1300,1130);ctx.stroke();
ctx.strokeStyle="#26332d";ctx.lineWidth=64;
ctx.beginPath();ctx.moveTo(1300,1420);ctx.quadraticCurveTo(960,1420,820,1280);ctx.stroke();
ctx.beginPath();ctx.moveTo(1300,1420);ctx.quadraticCurveTo(1640,1420,1780,1280);ctx.stroke();
Arch.drawToxicJadePond(ctx,scene.pond.x,scene.pond.y,scene.pond.rx,scene.pond.ry,t);
Arch.drawWoodenBridge(ctx,1300,1045,92,290,true);
Arch.drawWoodenBridge(ctx,1300,795,88,165,true);
Arch.drawOctagonalJadePavilion(ctx,scene.pavilion.x,scene.pavilion.y,t);
for (const mp of scene.miasmaPools) Arch.drawPoisonMiasmaPool(ctx,mp.x,mp.y,mp.r,t);
Arch.drawBambooToriiGate(ctx,1300,1660,t);
for (const [lx,ly] of [[1170,1690],[1430,1690],[1215,1210],[1385,1210],[1225,885],[1375,885]]) Arch.drawStoneLantern(ctx,lx,ly,t,"#38e8a8");
for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);
for (const ob of scene.obstacles) {if (ob.type==="bamboo") Arch.drawBambooCluster(ctx,ob.x,ob.y,ob.r,t,ob.seed);}
ctx.fillStyle="rgba(92,230,168,0.55)";
for (const lf of scene.leaves) {
ctx.save();ctx.translate(lf.x,lf.y);ctx.rotate(lf.ang);
ctx.beginPath();ctx.ellipse(0,0,6,2.2,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
return;
}

// ==================== WORLD 3: RỪNG ĐÁ KHUYỂN VƯƠNG ====================
if (scene.id==="dog_forest") {
const bg=ctx.createRadialGradient(1300,980,180,1300,980,1520);
bg.addColorStop(0,"#242d3b");bg.addColorStop(0.55,"#181f29");bg.addColorStop(1,"#0c1017");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);

// Ancient stone roads winding through monolith maze up to the Dog King Arena
ctx.strokeStyle="#2d3747";ctx.lineWidth=96;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(1300,1920);ctx.lineTo(1300,820);ctx.stroke();
ctx.strokeStyle="#262f3d";ctx.lineWidth=68;
ctx.beginPath();ctx.moveTo(1300,1420);ctx.quadraticCurveTo(960,1380,880,1150);ctx.quadraticCurveTo(880,920,1080,820);ctx.stroke();
ctx.beginPath();ctx.moveTo(1300,1420);ctx.quadraticCurveTo(1640,1380,1720,1150);ctx.quadraticCurveTo(1720,920,1520,820);ctx.stroke();

// Dog King Stone Monolith Arena at North
Arch.drawDogKingArena(ctx,scene.arena.x,scene.arena.y,t);
// Grand Stairs up into the Arena
Arch.drawGrandStaircase(ctx,1200,810,200,120,6,{topCol:"#475266",riserCol:"#212833",trimCol:"#5aa9e6"});
// Blue Light Pillar of Dog King Inheritance
Arch.drawInheritancePillar(ctx,1300,595,t,"rgba(155,220,255,0.82)","rgba(90,169,230,0.42)","🔵 Cột Sáng Lam — Truyền Thừa Khuyển Vương");

// South Entrance Gate & Stone Hound Statues
Arch.drawBronzeToriiGate(ctx,1300,1700,t,"RỪNG ĐÁ KHUYỂN VƯƠNG","#1c406b","#5aa9e6");
Arch.drawStoneHoundStatue(ctx,1150,930,1,"#5aa9e6");
Arch.drawStoneHoundStatue(ctx,1450,930,-1,"#5aa9e6");
for (const [lx,ly] of [[1160,1735],[1440,1735],[1180,1180],[1420,1180],[1140,835],[1460,835]]) Arch.drawStoneLantern(ctx,lx,ly,t,"#5aa9e6");

for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);
for (const ob of scene.obstacles) {if (ob.type==="monolith") Arch.drawStoneMonolith(ctx,ob.x,ob.y,ob.r,t,"#5aa9e6");}

// Active Beast-Bone Traps dropped by Chương Tam Tam!
for (const tr of scene.traps) {
ctx.save();ctx.translate(tr.x,tr.y);
ctx.strokeStyle="#5aa9e6";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,tr.r,0,Math.PI*2);ctx.stroke();
ctx.fillStyle="rgba(90,169,230,0.22)";ctx.beginPath();ctx.arc(0,0,tr.r,0,Math.PI*2);ctx.fill();
ctx.font="16px sans-serif";ctx.textAlign="center";ctx.fillText("🦴",0,5);
ctx.restore();
}
return;
}

// ==================== WORLD 4: HOANG NGUYÊN BẠO VƯƠNG ====================
if (scene.id==="bao_wasteland") {
const bg=ctx.createRadialGradient(1300,960,180,1300,960,1520);
bg.addColorStop(0,"#361c17");bg.addColorStop(0.52,"#241310");bg.addColorStop(1,"#120908");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);

// Volcanic ash paths leading to Twin Bridges & Fire Altar
ctx.strokeStyle="#3d241f";ctx.lineWidth=88;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(1300,1920);ctx.lineTo(1300,1520);ctx.stroke();
ctx.beginPath();ctx.moveTo(1300,1520);ctx.lineTo(920,1360);ctx.lineTo(920,860);ctx.lineTo(1300,720);ctx.stroke();
ctx.beginPath();ctx.moveTo(1300,1520);ctx.lineTo(1680,1360);ctx.lineTo(1680,860);ctx.lineTo(1300,720);ctx.stroke();

// Molten Lava Chasm River cutting across the Wasteland!
Arch.drawLavaChasmRiver(ctx,scene.width,scene.lavaRiver.y,scene.lavaRiver.halfH,t);

// Twin Carved Obsidian Bridges crossing the Lava Chasm!
for (const bx of scene.lavaRiver.bridges) {
Arch.drawWoodenBridge(ctx,bx,scene.lavaRiver.y,110,scene.lavaRiver.halfH*2 + 64,true,{
deckCol:"#2d2424",railCol:"#4a3836",trimCol:"#ff6b35"
});
}

// North Bao King Obsidian Fire Altar + Red Light Pillar
Arch.drawBaoKingFireAltar(ctx,scene.altar.x,scene.altar.y,t);
Arch.drawInheritancePillar(ctx,1300,605,t,"rgba(255,190,145,0.85)","rgba(255,87,51,0.46)","🔴 Cột Sáng Đỏ — Truyền Thừa Bạo Vương");

// South Volcanic Gate + Flame Lanterns
Arch.drawBronzeToriiGate(ctx,1300,1715,t,"HOANG NGUYÊN BẠO VƯƠNG","#7d1b0e","#ff6b35");
for (const [lx,ly] of [[1160,1750],[1440,1750],[840,1310],[1000,1310],[1600,1310],[1760,1310]]) Arch.drawStoneLantern(ctx,lx,ly,t,"#ff5733");

for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);
for (const ob of scene.obstacles) {if (ob.type==="lava_rock") Arch.drawStoneMonolith(ctx,ob.x,ob.y,ob.r,t,"#ff5733",1.45);}

// Rising Glowing Volcanic Embers
ctx.fillStyle="rgba(255,155,70,0.65)";
for (const em of scene.embers) {
ctx.beginPath();ctx.arc(em.x,em.y,em.size,0,Math.PI*2);ctx.fill();
}
return;
}

// ==================== WORLD 5: CỔ TỰ TÍN VƯƠNG ====================
if (scene.id==="xin_temple") {
const bg=ctx.createRadialGradient(1300,960,160,1300,960,1480);
bg.addColorStop(0,"#362c1c");bg.addColorStop(0.52,"#211b12");bg.addColorStop(1,"#0f0c09");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);

// Outer Ancient Temple Courtyard & Side Testing Pavilions
Arch.drawStonePlatform(ctx,920,1040,760,550,{baseCol:"#1c160d",topCol:"#2b2316",edgeCol:"#b89758",tileSize:52});
Arch.drawStonePlatform(ctx,640,940,260,260,{baseCol:"#1a140c",topCol:"#261e13",edgeCol:"#b89758",tileSize:44});
Arch.drawStonePlatform(ctx,1700,940,260,260,{baseCol:"#1a140c",topCol:"#261e13",edgeCol:"#b89758",tileSize:44});

// Golden-Bronze Sacred Avenue (Thần Đạo)
ctx.fillStyle="#45361d";ctx.fillRect(1225,1035,150,740);
ctx.strokeStyle="#d4af37";ctx.lineWidth=2.5;ctx.strokeRect(1225,1035,150,740);

// Main Xin King Temple Hall + 6 Golden Columns + "信" Altar
Arch.drawXinKingTempleHall(ctx,scene.temple.x,scene.temple.y,t,scene.pillarLit);

// Yellow Light Pillar of Xin King Inheritance (EXTINGUISHES when Cừu Cửu breaks through!)
if (scene.pillarLit) {
Arch.drawInheritancePillar(ctx,1300,665,t,"rgba(255,246,180,0.88)","rgba(247,201,72,0.48)","🟡 Cột Sáng Vàng — Truyền Thừa Tín Vương");
}

// South Temple Mountain Gate (Sơn Môn Cổ Tự) + 6 Golden Lanterns
Arch.drawBronzeToriiGate(ctx,1300,1625,t,"CỔ TỰ TÍN VƯƠNG","#5e4414","#ffd700");
for (const [lx,ly] of [[1165,1655],[1435,1655],[1185,1340],[1415,1340],[1185,1120],[1415,1120]]) Arch.drawStoneLantern(ctx,lx,ly,t,"#ffd700");

for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);
for (const ob of scene.obstacles) {if (ob.type==="monolith") Arch.drawStoneMonolith(ctx,ob.x,ob.y,ob.r,t,"#ffd700",1.6);}
}

// ==================== WORLD 6: CHIẾN TRƯỜNG NGOẠI VI TAM XOA SƠN ====================
if (scene.id==="outer_battlefield") {
// 1. Rugged Highland Battlefield Terrain
const bg=ctx.createRadialGradient(1400,1150,200,1400,1150,1750);
bg.addColorStop(0,"#382d23");bg.addColorStop(0.55,"#241d17");bg.addColorStop(1,"#100d0b");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);

// Carved dirt march roads connecting North Righteous Camp, East Demon Camp, and South Mist Front!
ctx.strokeStyle="rgba(165,135,88,0.18)";ctx.lineWidth=94;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(1400,320);ctx.lineTo(1400,1880);ctx.stroke();
ctx.beginPath();ctx.moveTo(2240,600);ctx.quadraticCurveTo(2120,1150,1740,1640);ctx.stroke();
ctx.beginPath();ctx.moveTo(1060,640);ctx.quadraticCurveTo(1040,1180,1060,1660);ctx.stroke();

// 2. San Cha Mountain North Cliff Arch & Blessed Land Sky Rift
Arch.drawSanChaCliffArch(ctx,1400,220,t,scene.skyRiftOpen);

// 3. NORTH RIGHTEOUS CAMP (Doanh Trại Chính Đạo)
Arch.drawStonePlatform(ctx,880,340,940,390,{baseCol:"#1c2026",topCol:"#262c36",edgeCol:"#d4af37",tileSize:56,bevel:10});
Arch.drawWarPavilionTent(ctx,1400,440,t,{roofA:"#f0f4f8",roofB:"#8c9db0",trim:"#ffd700",wall:"#263140",title:"🏮 SOÁI TRƯỚNG CHÍNH ĐẠO (TIÊU MANG)"});
Arch.drawWatchtowerPlatform(ctx,1020,560,t,"#ffd700","⛓️ ĐÀI KỲ TRẬN PHÁP THIẾT GIA");
for (const [bx,by,ch] of [[1160,395,"正"],[1640,395,"正"],[930,685,"鐵"],[1240,685,"蕭"]]) {
Arch.drawWarBannerPole(ctx,bx,by,t,"#b8860b","#ffeaa7",ch);
}
Arch.drawCampfire(ctx,1310,605,t,"#ff8a3d");
Arch.drawCampfire(ctx,1505,605,t,"#ff8a3d");

// 4. NORTH-EAST DEMON CAMP (Trại Quần Ma)
Arch.drawStonePlatform(ctx,1960,420,620,410,{baseCol:"#1e1226",topCol:"#291836",edgeCol:"#b75cff",tileSize:52,bevel:10});
Arch.drawWarPavilionTent(ctx,2260,540,t,{roofA:"#4a236b",roofB:"#1e0f2e",trim:"#c56cf0",wall:"#190f24",title:"🚩 ĐẠI TRẠI QUẦN MA"});
for (const [bx,by,ch] of [[2020,475,"魔"],[2510,475,"魔"],[2020,765,"醫"],[2510,765,"魔"]]) {
Arch.drawWarBannerPole(ctx,bx,by,t,"#4a146b","#e0b3ff",ch);
}
Arch.drawCampfire(ctx,2170,695,t,"#c56cf0");
Arch.drawCampfire(ctx,2355,695,t,"#c56cf0");

// 5. SOUTH HOUND ARMY FRONT LINE & DEFENSIVE TRENCHES
ctx.fillStyle="#241c14";ctx.strokeStyle="rgba(212,175,55,0.42)";ctx.lineWidth=3;
ctx.fillRect(360,1710,2080,220);ctx.strokeRect(360,1710,2080,220);
// Stone Barricades along front
for (let bx=440;bx<=2360;bx+=190) {
ctx.fillStyle="#453b31";ctx.strokeStyle="#8a7962";ctx.lineWidth=1.5;
ctx.fillRect(bx - 36,1698,72,18);ctx.strokeRect(bx - 36,1698,72,18);
}
Arch.drawStoneHoundStatue(ctx,920,1700,1,"#ffd700");
Arch.drawStoneHoundStatue(ctx,1880,1700,-1,"#5aa9e6");
ctx.font="bold 13.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText("🐕 PHÒNG TUYẾN ĐẠI TRẬN KHUYỂN THÚ (HƯỚNG VỀ THANH ĐỒNG ĐẠI ĐIỆN)",1401,1962);
ctx.fillStyle="#ffd700";ctx.fillText("🐕 PHÒNG TUYẾN ĐẠI TRẬN KHUYỂN THÚ (HƯỚNG VỀ THANH ĐỒNG ĐẠI ĐIỆN)",1400,1961);

// 6. Props & Monoliths
for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);
for (const ob of scene.obstacles) {if (ob.type==="monolith") Arch.drawStoneMonolith(ctx,ob.x,ob.y,ob.r,t,"#ff9f43",1.5);}

// 7. Patrolling Frontline Hounds
for (const h of scene.hounds) {
ctx.fillStyle="rgba(0,0,0,0.38)";ctx.beginPath();ctx.ellipse(h.x,h.y + 5,h.size,h.size*0.45,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=h.color;ctx.beginPath();ctx.ellipse(h.x,h.y,h.size,h.size*0.65,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.fillRect(h.x + 3,h.y - 2,2.2,2.2);
}

// 8. White Ape Black Portal (Wave 4 — Thiết Bạch Kỳ's Third Eye!)
if (scene.apePortalActive) {
Arch.drawWhiteApePortalAndArmy(ctx,1020,1360,scene.whiteApes||[],t);
}

// 9. Thick Mist Curtain along South Front (vanishes when Tiêu Mang casts Vinh Diệu Ngô Thương!)
if (!scene.mistCleared) {
const _ms2=_getTkMistSprite();
ctx.save();
for (const m of scene.mists) {
if (m.alpha<=0.02) continue;
const mx=m.x + Math.sin(t*m.speed + m.x)*22;
ctx.globalAlpha=m.alpha;
ctx.drawImage(_ms2,mx - m.r,m.y - m.r,m.r*2,m.r*2);
}
ctx.restore();
}
return;
}

// ==================== WORLD 7: ĐỈNH NÚI ĐÃNG HỒN & ĐÃNG HỒN CUNG (2600x2200) ====================
if (scene.id==="dang_hun_mountain") {
// 1. Pink-Purple Crystal Mountain Slopes Background
const bg=ctx.createRadialGradient(1300,820,160,1300,1040,1650);
bg.addColorStop(0,"#5e245c");
bg.addColorStop(0.35,"#401642");
bg.addColorStop(0.70,"#260e2e");
bg.addColorStop(1,"#110617");
ctx.fillStyle=bg;ctx.fillRect(0,0,scene.width,scene.height);

// Concentric crystal mountain altitude ridge rings
for (let r=1;r<=6;r++) {
ctx.strokeStyle=`rgba(255,155,224,${0.26 - r*0.032})`;ctx.lineWidth=2.6;
ctx.beginPath();ctx.ellipse(1300,900 + r*65,280 + r*190,195 + r*135,0,0,Math.PI*2);ctx.stroke();
}

// 2. Twin Steep Crystal Climbing Trails ascending from South-West & South-East to the Summit!
ctx.strokeStyle="rgba(255,195,235,0.20)";ctx.lineWidth=86;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(960,1850);ctx.quadraticCurveTo(980,1450,1180,1080);ctx.stroke();
ctx.beginPath();ctx.moveTo(1640,1850);ctx.quadraticCurveTo(1620,1450,1420,1080);ctx.stroke();
// Carved stepped rungs along climbing trails
ctx.strokeStyle="rgba(255,215,0,0.22)";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(960,1850);ctx.quadraticCurveTo(980,1450,1180,1080);ctx.stroke();
ctx.beginPath();ctx.moveTo(1640,1850);ctx.quadraticCurveTo(1620,1450,1420,1080);ctx.stroke();


// 3. GRAND DANG HUN PALACE (ĐÃNG HỒN CUNG — North)
Arch.drawDangHunPalace(ctx,scene.palace.x,scene.palace.y,t);

// 4. CENTRAL CRYSTAL SUMMIT ALTAR (ĐỈNH ĐÃNG HỒN SƠN)
Arch.drawCrystalSummitAltar(ctx,scene.summit.x,scene.summit.y,t);

// 5. Twin Carved Nine-Tailed Fox Statues & 6 Crystal Lanterns
Arch.drawNineTailedFoxStatue(ctx,1145,740,1);
Arch.drawNineTailedFoxStatue(ctx,1455,740,-1);
for (const [lx,ly] of [[1040,860],[1560,860],[1080,1120],[1520,1120],[970,1480],[1630,1480]]) {
Arch.drawCrystalLantern(ctx,lx,ly,t);
}

// 6. Interactive Crystal Lore Steles
for (const pr of scene.props) Arch.drawAncientStele(ctx,pr.x,pr.y,t,pr.label,pr.glowCol);

// 7. Faceted Pink & Violet Crystal Spires scattered around slopes
for (const ob of scene.obstacles) {
if (ob.type==="crystal") Arch.drawCrystalSpire(ctx,ob.x,ob.y,ob.r,t,ob.col);
}

// 8. Drifting Glowing Crystal Spirit Petals
ctx.fillStyle="rgba(255,184,230,0.62)";
for (const lf of scene.leaves) {
ctx.save();ctx.translate(lf.x,lf.y);ctx.rotate(lf.ang);
ctx.beginPath();ctx.ellipse(0,0,5.5,2.4,0,0,Math.PI*2);ctx.fill();ctx.restore();
}
return;
}


}

global.ThreeKingsWorlds.renderWorldTerrainAndArchitecture=renderWorldTerrainAndArchitecture;
})(window);
