(function (global) {
"use strict";
const {_hash,_hexToRgb,_shadeHex,_rgba}=global.MapArtRenderer._util;
const renderProp=global.MapArtRenderer.drawCachedProp||global.MapArtRenderer.renderProp;
const _Arch={
_vis(sx,sy,pad,vw,vh) {
return sx>= -pad&&sy>= -pad&&sx<=vw + pad&&sy<=vh + pad;
},
_octCache:new Map(),
octPlatform(ctx,x,y,rx,ry,baseCol,topCol,edgeCol,t,rotRing=true) {
const key=`${rx}_${ry}_${baseCol}_${topCol}_${edgeCol}`;
let baseSpr=this._octCache.get(key);
const padX=rx + 28;
const padY=ry + 32;
if (!baseSpr) {
baseSpr=document.createElement("canvas");
baseSpr.width=Math.ceil(padX*2);
baseSpr.height=Math.ceil(padY*2);
const bctx=baseSpr.getContext("2d");
bctx.translate(padX,padY);
bctx.fillStyle="rgba(0,0,0,0.48)";bctx.beginPath();bctx.ellipse(6,16,rx + 12,ry + 10,0,0,Math.PI*2);bctx.fill();
const drawOct=(a,b,offY,fill,stroke,lw)=>{
bctx.fillStyle=fill;bctx.strokeStyle=stroke;bctx.lineWidth=lw;
bctx.beginPath();
for (let i=0;i<8;i++) {
const ang=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(ang)*a;const py=Math.sin(ang)*b + offY;
if (i===0) bctx.moveTo(px,py);else bctx.lineTo(px,py);
}
bctx.closePath();bctx.fill();bctx.stroke();
};
drawOct(rx,ry,12,baseCol,"#100d0a",2);
drawOct(rx,ry,0,topCol,edgeCol,3);
drawOct(rx*0.82,ry*0.82,0,_shadeHex(topCol,10),_rgba(edgeCol,0.55),1.5);
if (this._octCache.size>24) this._octCache.clear();
this._octCache.set(key,baseSpr);
}
ctx.drawImage(baseSpr,x - padX,y - padY);
if (rotRing) {
ctx.save();ctx.translate(x,y);ctx.scale(1,ry/rx);ctx.rotate(t*0.22);
ctx.strokeStyle=_rgba(edgeCol,0.68);ctx.lineWidth=2;
const rr=rx*0.64;
ctx.beginPath();
for (let k=0;k<4;k++) {
const a=k*Math.PI*0.5;
ctx.moveTo(Math.cos(a)*rr,Math.sin(a)*rr);
ctx.arc(0,0,rr,a,a + 1.05);
}
ctx.stroke();ctx.restore();
}
},
toriiGate(ctx,x,y,t,plaque,roofA,roofB,trim,bannerCol) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.42)";ctx.fillRect(-118,-8,236,30);
for (const cx of [-104,-44,44,104]) {
ctx.fillStyle="#3d2e1e";ctx.strokeStyle=trim;ctx.lineWidth=1.5;
ctx.fillRect(cx - 9,-58,18,70);ctx.strokeRect(cx - 9,-58,18,70);
}
const rg=ctx.createLinearGradient(0,-88,0,-52);
rg.addColorStop(0,roofA);rg.addColorStop(1,roofB);
ctx.fillStyle=rg;
ctx.beginPath();ctx.moveTo(-138,-52);ctx.quadraticCurveTo(-115,-70,-102,-78);ctx.lineTo(102,-78);ctx.quadraticCurveTo(115,-70,138,-52);ctx.closePath();
ctx.fill();ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.stroke();
ctx.fillStyle="#14100c";ctx.strokeStyle=trim;ctx.lineWidth=1.8;
ctx.fillRect(-76,-74,152,21);ctx.strokeRect(-76,-74,152,21);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=trim;
ctx.fillText(plaque,0,-63);
for (const side of [-1,1]) {
const sw=Math.sin(t*2.4 + side)*4;
ctx.fillStyle=bannerCol;ctx.strokeStyle=trim;ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(side*74,-44);ctx.lineTo(side*86,-44);ctx.lineTo(side*86 + sw,-6);ctx.lineTo(side*80 + sw,-13);ctx.lineTo(side*74 + sw,-6);ctx.closePath();ctx.fill();ctx.stroke();
}
ctx.restore();
},
palacePavilion(ctx,x,y,t,plaque,roofA,roofB,wallCol,trimCol,scale=1.0) {
ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
ctx.fillStyle="rgba(0,0,0,0.48)";ctx.fillRect(-130,-10,260,72);
ctx.fillStyle=wallCol;ctx.strokeStyle=trimCol;ctx.lineWidth=2;
ctx.fillRect(-115,-48,230,96);ctx.strokeRect(-115,-48,230,96);
// Arched central doors
ctx.fillStyle="rgba(10,12,18,0.86)";
ctx.beginPath();ctx.moveTo(-34,48);ctx.lineTo(-34,-8);ctx.quadraticCurveTo(0,-34,34,-8);ctx.lineTo(34,48);ctx.closePath();ctx.fill();
ctx.strokeStyle=trimCol;ctx.lineWidth=1.8;ctx.stroke();
// Columns
for (const px of [-96,-54,54,96]) {
ctx.fillStyle=_shadeHex(wallCol,28);ctx.fillRect(px - 7,-46,14,94);ctx.strokeRect(px - 7,-46,14,94);
}
// Lower sweeping roof
const r1=ctx.createLinearGradient(0,-92,0,-44);
r1.addColorStop(0,roofA);r1.addColorStop(1,roofB);
ctx.fillStyle=r1;
ctx.beginPath();ctx.moveTo(-152,-42);ctx.quadraticCurveTo(-125,-66,-106,-82);ctx.lineTo(106,-82);ctx.quadraticCurveTo(125,-66,152,-42);ctx.closePath();
ctx.fill();ctx.strokeStyle=trimCol;ctx.lineWidth=2.2;ctx.stroke();
// Upper imperial spire roof
ctx.beginPath();ctx.moveTo(-104,-82);ctx.quadraticCurveTo(-68,-108,0,-130);ctx.quadraticCurveTo(68,-108,104,-82);ctx.closePath();
ctx.fill();ctx.stroke();
ctx.fillStyle=trimCol;ctx.beginPath();ctx.arc(0,-134,5,0,Math.PI*2);ctx.fill();
// Plaque
ctx.fillStyle="#14100d";ctx.strokeStyle=trimCol;ctx.lineWidth=1.8;
ctx.fillRect(-72,-74,144,22);ctx.strokeRect(-72,-74,144,22);
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillStyle=trimCol;
ctx.fillText(plaque,0,-63);
ctx.restore();
},
warTent(ctx,x,y,t,plaque,roofA,roofB,trim) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.beginPath();ctx.ellipse(6,12,78,44,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#241e18";ctx.strokeStyle=trim;ctx.lineWidth=1.8;
ctx.fillRect(-62,-24,124,36);ctx.strokeRect(-62,-24,124,36);
const rg=ctx.createLinearGradient(0,-78,0,-22);
rg.addColorStop(0,roofA);rg.addColorStop(1,roofB);
ctx.fillStyle=rg;
ctx.beginPath();ctx.moveTo(-76,-22);ctx.quadraticCurveTo(-34,-48,0,-78);ctx.quadraticCurveTo(34,-48,76,-22);ctx.closePath();
ctx.fill();ctx.strokeStyle=trim;ctx.lineWidth=2;ctx.stroke();
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle=trim;
ctx.fillText(plaque,0,-86);
ctx.restore();
},
woodenBridge(ctx,x,y,w,h,vertical=true,deckCol="#4f3822",trimCol="#b89758") {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.38)";ctx.fillRect(-w/2 + 5,-h/2 + 7,w,h);
ctx.fillStyle=deckCol;ctx.fillRect(-w/2,-h/2,w,h);
ctx.strokeStyle="#1f150c";ctx.lineWidth=1.4;
if (vertical) {
for (let py=-h/2 + 12;py<h/2;py+=14) {ctx.beginPath();ctx.moveTo(-w/2,py);ctx.lineTo(w/2,py);ctx.stroke();}
for (const side of [-1,1]) {
ctx.fillStyle=_shadeHex(deckCol,22);ctx.strokeStyle=trimCol;
ctx.fillRect(side*(w/2 - 4) - 4,-h/2,8,h);ctx.strokeRect(side*(w/2 - 4) - 4,-h/2,8,h);
}
} else {
for (let px=-w/2 + 12;px<w/2;px+=14) {ctx.beginPath();ctx.moveTo(px,-h/2);ctx.lineTo(px,h/2);ctx.stroke();}
for (const side of [-1,1]) {
ctx.fillStyle=_shadeHex(deckCol,22);ctx.strokeStyle=trimCol;
ctx.fillRect(-w/2,side*(h/2 - 4) - 4,w,8);ctx.strokeRect(-w/2,side*(h/2 - 4) - 4,w,8);
}
}
ctx.restore();
},
watchtower(ctx,x,y,t,flameCol="#ff6b35",trim="#d4af37",burning=false) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(-38,-22,82,62);
ctx.fillStyle="#33261b";ctx.strokeStyle=trim;ctx.lineWidth=1.8;
ctx.fillRect(-36,-28,72,56);ctx.strokeRect(-36,-28,72,56);
ctx.fillStyle="#4a3827";ctx.fillRect(-28,-20,56,40);
for (const [px,py] of [[-32,-24],[32,-24],[-32,22],[32,22]]) {
ctx.fillStyle="#6b5238";ctx.fillRect(px - 4,py - 16,8,20);
}
renderProp(ctx,0,0,"golden_brazier",t);
if (burning) {
ctx.fillStyle="rgba(255,105,35,0.22)";ctx.beginPath();ctx.arc(0,-12,48 + Math.sin(t*7)*5,0,Math.PI*2);ctx.fill();
}
ctx.restore();
},
lightPillar(ctx,x,y,colCore,colGlow,label) {
ctx.save();
const g=ctx.createLinearGradient(x - 32,y,x + 32,y);
g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(0.35,colGlow);g.addColorStop(0.5,colCore);g.addColorStop(0.65,colGlow);g.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=g;ctx.fillRect(x - 32,y - 260,64,260);
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffffff";
ctx.fillText(label,x,y - 268);
ctx.restore();
}
};

// ==============================================================================
// 5. BESPOKE ARCHITECTURAL LANDMARKS FOR ALL 31 MAPS (STAGES 1-25 + 6 SPECIALS!)
// ==============================================================================
function renderStageLandmarks(ctx,map,camX,camY,t) {
const stageId=map.currentStageId||"stage_1";
const cx=map.arenaCenterX - camX;
const cy=map.arenaCenterY - camY;
const vw=map.camera.width;
const vh=map.camera.height;
const vis=(x,y,pad)=>_Arch._vis(x,y,pad,vw,vh);

// Helper to draw 4 scenic outer-ring shrines/outposts at r = 1480 for the expanded 8000x8000 map!
const drawOuterOutposts=(baseCol,topCol,edgeCol,propA,propB,labels)=>{
const pts=[[0,-1480],[0,1480],[-1480,0],[1480,0]];
for (let i=0;i<4;i++) {
const ox=cx + pts[i][0];const oy=cy + pts[i][1];
if (!vis(ox,oy,190)) continue;
_Arch.octPlatform(ctx,ox,oy,112,86,baseCol,topCol,edgeCol,t,false);
renderProp(ctx,ox - 48,oy - 12,propA,t);
renderProp(ctx,ox + 48,oy - 12,propA,t);
renderProp(ctx,ox,oy + 18,propB,t);
if (labels&&labels[i]) {
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle=edgeCol;
ctx.fillText(labels[i],ox,oy - 96);
}
}
};

// -------------------- STAGE 1: SƯỜN NÚI THANH MAO --------------------
if (stageId==="stage_1") {
if (vis(cx,cy,280)) {
_Arch.octPlatform(ctx,cx,cy,185,144,"#14291f","#1e3d2e","#7ef7c4",t,true);
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
ctx.fillStyle="#11402b";ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(cx + Math.cos(a)*146,cy + Math.sin(a)*112,9,0,Math.PI*2);ctx.fill();ctx.stroke();
}
ctx.save();ctx.strokeStyle="rgba(30,115,78,0.68)";ctx.lineWidth=16;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=cx + Math.cos(a)*168;const py=cy + Math.sin(a)*130 - 10;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.stroke();ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;ctx.stroke();ctx.restore();
ctx.fillStyle="#124a59";ctx.strokeStyle="#7ef7f0";ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(cx,cy,44,30,0,0,Math.PI*2);ctx.fill();ctx.stroke();
renderProp(ctx,cx,cy - 2,"moon_flower",t);
ctx.font="bold 12px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7f0";
ctx.fillText("🌸 NGUYỆT LAN ĐÌNH — THANH MAO SƠN",cx,cy - 158);
}
if (vis(cx,cy + 680,220)) {
_Arch.toriiGate(ctx,cx,cy + 680,t,"CỔ NGUYỆT SƠN TRẠI","#2a7d5c","#123b2b","#7ef7c4","#1f5e7a");
renderProp(ctx,cx - 125,cy + 705,"stone_lantern",t);renderProp(ctx,cx + 125,cy + 705,"stone_lantern",t);
}
if (vis(cx - 680,cy,150)) _Arch.woodenBridge(ctx,cx - 680,cy,112,155,true,"#523923","#7ef7c4");
if (vis(cx + 680,cy,150)) _Arch.woodenBridge(ctx,cx + 680,cy,112,155,true,"#523923","#7ef7c4");
for (const [dx,dy] of [[-580,-540],[580,-540],[-580,540],[580,540]]) {
if (vis(cx + dx,cy + dy,120)) _Arch.watchtower(ctx,cx + dx,cy + dy,t,"#7ef7c4","#7ef7c4",false);
}
drawOuterOutposts("#14291f","#1e3d2e","#7ef7c4","ancient_banyan","moon_flower",["🎋 Rừng Trúc Bắc","🏡 Thôn Chân Núi Nam","🌿 Suối Nguyệt Tây","🪨 Vách Đá Đông"]);
return;
}

// -------------------- STAGE 2: MẬT ĐỘNG HOA TỬU HÀNH GIẢ --------------------
if (stageId==="stage_2") {
if (vis(cx,cy,280)) {
_Arch.octPlatform(ctx,cx,cy,200,156,"#21170f","#332316","#e6a84c",t,true);
ctx.save();ctx.translate(cx,cy - 118);
ctx.fillStyle="rgba(255,205,95,0.22)";ctx.beginPath();ctx.arc(0,0,82,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#453322";ctx.strokeStyle="#ffd700";ctx.lineWidth=2.4;
ctx.fillRect(-74,-34,148,46);ctx.strokeRect(-74,-34,148,46);
ctx.fillStyle="rgba(255,220,130,0.28)";ctx.fillRect(-64,-26,128,30);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffeaa7";
ctx.fillText("📜 BỨC TƯỜNG LƯU ẢNH HOA TỬU",0,-42);ctx.restore();
for (const [vx,vy] of [[-96,-28],[96,-28],[-96,46],[96,46]]) renderProp(ctx,cx + vx,cy + vy,"wine_jar",t);
renderProp(ctx,cx,cy + 12,"giant_mushroom_tree",t);
}
for (const [dx,dy,lbl] of [[0,-680,"🍶 Hầm Rượu Bắc"],[0,680,"🍶 Hầm Rượu Nam"],[-680,0,"🍄 Vườn Nấm Tây"],[680,0,"🍄 Vườn Nấm Đông"]]) {
if (vis(cx + dx,cy + dy,180)) {
_Arch.octPlatform(ctx,cx + dx,cy + dy,110,86,"#1c140e","#2b1f15","#c48f38",t,false);
renderProp(ctx,cx + dx - 38,cy + dy - 10,"wine_jar",t);
renderProp(ctx,cx + dx + 38,cy + dy - 10,"wine_jar",t);
renderProp(ctx,cx + dx,cy + dy + 22,"glowing_shroom",t);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#e6a84c";ctx.fillText(lbl,cx + dx,cy + dy - 94);
}
}
drawOuterOutposts("#1c140e","#2b1f15","#e6a84c","stalagmite","giant_mushroom_tree",["🕯️ Mật Thất Bắc","🪨 Thạch Nhũ Nam","🍄 Hang Nấm Tây","🍶 Tửu Khố Đông"]);
return;
}

// -------------------- STAGE 3: ĐỊA ĐẠO HUYẾT HỒ CỔ NGUYỆT --------------------
if (stageId==="stage_3") {
if (vis(cx,cy,380)) {
ctx.fillStyle="rgba(143,17,28,0.68)";ctx.beginPath();ctx.ellipse(cx,cy,270,218,0,0,Math.PI*2);ctx.fill();
_Arch.woodenBridge(ctx,cx,cy - 195,86,120,true,"#2e161a","#e03838");
_Arch.woodenBridge(ctx,cx,cy + 195,86,120,true,"#2e161a","#e03838");
_Arch.woodenBridge(ctx,cx - 225,cy,120,86,false,"#2e161a","#e03838");
_Arch.woodenBridge(ctx,cx + 225,cy,120,86,false,"#2e161a","#e03838");
_Arch.octPlatform(ctx,cx,cy,156,124,"#24090d","#3d0f16","#ff3b30",t,true);
ctx.save();ctx.strokeStyle=`rgba(255,65,75,${0.45 + Math.sin(t*3.5)*0.25})`;ctx.lineWidth=3.5;
for (const [bx,by] of [[-115,-85],[115,-85],[-115,85],[115,85]]) {
ctx.beginPath();ctx.moveTo(cx + bx,cy + by);ctx.lineTo(cx,cy);ctx.stroke();
renderProp(ctx,cx + bx,cy + by,"blood_crystal",t);
}
ctx.restore();
ctx.font="bold 12px Georgia";ctx.textAlign="center";ctx.fillStyle="#ff7675";
ctx.fillText("🩸 TẾ ĐÀN HUYẾT HỒ CỔ NGUYỆT",cx,cy - 136);
}
if (vis(cx,cy - 680,220)) {
_Arch.octPlatform(ctx,cx,cy - 680,142,102,"#1f0a0e","#331016","#e03838",t,false);
ctx.fillStyle="#2b1e21";ctx.strokeStyle="#ff5252";ctx.lineWidth=2.2;
ctx.fillRect(cx - 48,cy - 705,96,48);ctx.strokeRect(cx - 48,cy - 705,96,48);
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.4;ctx.strokeRect(cx - 38,cy - 697,76,32);
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#ff8a8a";
ctx.fillText("⚰️ THẠCH QUAN NHẤT ĐẠI CỔ NGUYỆT",cx,cy - 722);
}
drawOuterOutposts("#21090c","#360d13","#ff3b30","blood_crystal","blood_altar",["🩸 Huyết Trì Bắc","💀 Cốt Đàn Nam","🩸 Huyết Tháp Tây","🩸 Huyết Tháp Đông"]);
return;
}

// -------------------- STAGE 4: HUYẾT LANG TRIỀU THANH MAO SƠN --------------------
if (stageId==="stage_4") {
if (vis(cx,cy,260)) {
_Arch.octPlatform(ctx,cx,cy,178,140,"#182026","#243038","#ff6b35",t,true);
ctx.fillStyle="rgba(255,120,35,0.22)";ctx.beginPath();ctx.arc(cx,cy - 10,76 + Math.sin(t*5)*6,0,Math.PI*2);ctx.fill();
renderProp(ctx,cx,cy + 6,"golden_brazier",t);
for (const [bx,by] of [[-95,-58],[95,-58],[-95,58],[95,58]]) renderProp(ctx,cx + bx,cy + by,"broken_fence",t);
ctx.font="bold 12px Georgia";ctx.textAlign="center";ctx.fillStyle="#ff9f43";
ctx.fillText("🔥 ĐÀI TỤ HỎA TRẤN HUYẾT LANG TRIỀU",cx,cy - 152);
}
for (const [dx,dy] of [[-580,-520],[580,-520],[-580,520],[580,520]]) {
if (vis(cx + dx,cy + dy,140)) _Arch.watchtower(ctx,cx + dx,cy + dy,t,"#ff5733","#ff9f43",true);
}
drawOuterOutposts("#182026","#243038","#ff9f43","ruined_wall_seg","wolf_totem",["🐺 Phòng Tuyến Bắc","🐺 Phòng Tuyến Nam","🔥 Đồn Tây","🔥 Đồn Đông"]);
return;
}

// -------------------- STAGE 5: BẠCH CỐT SƠN — CUNG ĐIỆN XƯƠNG --------------------
if (stageId==="stage_5") {
if (vis(cx,cy,340)) {
_Arch.octPlatform(ctx,cx,cy,232,178,"#252a30","#3a414a","#dce8f2",t,true);
ctx.save();ctx.strokeStyle="#e6eff7";ctx.lineWidth=6;ctx.lineCap="round";
for (const ry of [-95,-35,25,85]) {
ctx.beginPath();ctx.moveTo(cx - 148,cy + ry);ctx.quadraticCurveTo(cx - 110,cy + ry - 36,cx - 66,cy + ry - 18);ctx.stroke();
ctx.beginPath();ctx.moveTo(cx + 148,cy + ry);ctx.quadraticCurveTo(cx + 110,cy + ry - 36,cx + 66,cy + ry - 18);ctx.stroke();
}
ctx.restore();
ctx.save();ctx.translate(cx,cy - 22);
ctx.fillStyle="#cfd9e3";ctx.strokeStyle="#5c6875";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-36,24);ctx.lineTo(-42,-28);ctx.lineTo(-18,-14);ctx.lineTo(0,-42);ctx.lineTo(18,-14);ctx.lineTo(42,-28);ctx.lineTo(36,24);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(0,-16,6,0,Math.PI*2);ctx.fill();ctx.restore();
ctx.font="bold 12.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#e6eff7";
ctx.fillText("🦴 BẠCH CỐT CUNG — NGAI VÀNG BẠCH CỐT",cx,cy - 190);
}
drawOuterOutposts("#22272e","#333a42","#cbd6e2","bone_rib_arch","skull_pile",["🦴 Cốt Môn Bắc","🦴 Cốt Môn Nam","💀 Hầm Xương Tây","💀 Hầm Xương Đông"]);
return;
}

// -------------------- STAGE 6: HOÀNG KIM SƠN — ĐẦM LẦY HỦ ĐỘC --------------------
if (stageId==="stage_6") {
if (vis(cx,cy,340)) {
ctx.fillStyle="rgba(105,40,145,0.45)";ctx.beginPath();ctx.ellipse(cx,cy,265,210,0,0,Math.PI*2);ctx.fill();
_Arch.woodenBridge(ctx,cx,cy - 188,82,115,true,"#3b3022","#7ef7c4");
_Arch.woodenBridge(ctx,cx,cy + 188,82,115,true,"#3b3022","#7ef7c4");
_Arch.woodenBridge(ctx,cx - 218,cy,115,82,false,"#3b3022","#7ef7c4");
_Arch.woodenBridge(ctx,cx + 218,cy,115,82,false,"#3b3022","#7ef7c4");
_Arch.octPlatform(ctx,cx,cy,154,120,"#24291b","#353d27","#a5c95c",t,true);
renderProp(ctx,cx,cy + 6,"refinement_cauldron",t);
for (const [mx,my] of [[-78,-42],[78,-42],[-78,48],[78,48]]) renderProp(ctx,cx + mx,cy + my,"glowing_shroom",t);
ctx.font="bold 12px Georgia";ctx.textAlign="center";ctx.fillStyle="#c5f77e";
ctx.fillText("☠️ HỦ ĐỘC CỔ ĐÀN — HOÀNG KIM SƠN",cx,cy - 132);
}
drawOuterOutposts("#1f2418","#2c3322","#7ef7c4","dead_gnarled_oak","giant_mushroom_tree",["☠️ Đầm Độc Bắc","☠️ Đầm Độc Nam","🍄 Đảo Nấm Tây","🍄 Đảo Nấm Đông"]);
return;
}

// -------------------- STAGE 7: THƯƠNG GIA THÀNH — ĐẤU VŨ TRƯỜNG --------------------
if (stageId==="stage_7") {
if (vis(cx,cy,340)) {
_Arch.octPlatform(ctx,cx,cy,260,202,"#2e2213","#45341c","#d4af37",t,false);
_Arch.octPlatform(ctx,cx,cy,208,160,"#3d2e18","#594322","#ffd700",t,true);
ctx.font="bold 58px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillStyle="rgba(255,215,0,0.28)";ctx.fillText("商",cx,cy + 2);
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
renderProp(ctx,cx + Math.cos(a)*228,cy + Math.sin(a)*175,"golden_brazier",t);
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText("🏮 ĐẠI ĐẤU VŨ TRƯỜNG THƯƠNG GIA THÀNH",cx,cy - 216);
}
if (vis(cx,cy - 680,260)) _Arch.toriiGate(ctx,cx,cy - 680,t,"KHÁN ĐÀI THƯƠNG GIA","#c49a3b","#594115","#ffd700","#8a1c1c");
if (vis(cx,cy + 680,260)) _Arch.toriiGate(ctx,cx,cy + 680,t,"THƯƠNG GIA THÀNH","#c49a3b","#594115","#ffd700","#8a1c1c");
drawOuterOutposts("#2b2114","#42321c","#ffd700","jade_pillar","peach_blossom_tree",["🏮 Bắc Uyển","🏮 Nam Môn","💎 Tây Thương Các","💎 Đông Thương Các"]);
return;
}

// -------------------- STAGE 8: TAM XOA SƠN — PHONG MA ĐỈNH --------------------
if (stageId==="stage_8") {
if (vis(cx,cy,300)) {
_Arch.octPlatform(ctx,cx,cy,212,164,"#121d24","#1d2f3b","#7ef7f0",t,true);
renderProp(ctx,cx,cy - 18,"sword_monument",t);
ctx.font="bold 12.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#85e3f5";
ctx.fillText("⛰️ PHONG MA ĐỈNH — TAM XOA SƠN",cx,cy - 178);
}
for (const [dx,dy,lbl] of [[0,-680,"⚔️ ĐỈNH BẮC TAM XOA"],[-640,520,"⚔️ ĐỈNH TÂY TAM XOA"],[640,520,"⚔️ ĐỈNH ĐÔNG TAM XOA"]]) {
if (vis(cx + dx,cy + dy,180)) {
_Arch.octPlatform(ctx,cx + dx,cy + dy,124,94,"#101b21","#1c2e38","#5aa9e6",t,false);
renderProp(ctx,cx + dx - 42,cy + dy - 12,"sword_monument",t);
renderProp(ctx,cx + dx + 42,cy + dy - 12,"sword_monument",t);
renderProp(ctx,cx + dx,cy + dy + 24,"wolf_totem",t);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#85c1e9";ctx.fillText(lbl,cx + dx,cy + dy - 104);
}
}
drawOuterOutposts("#101b21","#1c2e38","#7ef7f0","craggy_spire","dead_gnarled_oak",["⛰️ Hẻm Gió Bắc","⛰️ Hẻm Đá Nam","⚔️ Kiếm Trũng Tây","⚔️ Kiếm Trũng Đông"]);
return;
}

// -------------------- STAGE 9: VẠN THÚ SƠN LĨNH — NAM CƯƠNG --------------------
if (stageId==="stage_9") {
if (vis(cx,cy,300)) {
_Arch.octPlatform(ctx,cx,cy,205,160,"#0d1f14","#183622","#5cc995",t,true);
for (const [bx,by] of [[-110,-65],[110,-65],[-110,65],[110,65]]) renderProp(ctx,cx + bx,cy + by,"wolf_totem",t);
renderProp(ctx,cx,cy - 10,"bone_rib_arch",t);
ctx.font="bold 12.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText("🦁 VẠN THÚ VƯƠNG ĐÀN — NAM CƯƠNG",cx,cy - 174);
}
drawOuterOutposts("#0f2116","#1a3824","#5cc995","ancient_banyan","boulder_group",["🐺 Hang Lang Bắc","🐯 Hang Hổ Nam","🐻 Hang Hùng Tây","🦅 Đỉnh Ưng Đông"]);
return;
}

// -------------------- STAGE 10: TAM VƯƠNG SƠN — PHÚC ĐỊA MỞ CỬA --------------------
if (stageId==="stage_10") {
if (vis(cx,cy,320)) {
_Arch.octPlatform(ctx,cx,cy,225,172,"#241c11","#3b2d1b","#ffd700",t,true);
renderProp(ctx,cx,cy + 6,"refinement_cauldron",t);
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText("👑 TAM VƯƠNG ĐỈNH ĐÀI — PHÚC ĐỊA MỞ CỬA",cx,cy - 186);
}
if (vis(cx,cy - 680,220)) {
_Arch.octPlatform(ctx,cx,cy - 680,118,90,"#182430","#25384a","#5aa9e6",t,false);
_Arch.lightPillar(ctx,cx,cy - 680,"rgba(155,220,255,0.85)","rgba(90,169,230,0.4)","🔵 Cột Sáng Khuyển Vương");
}
if (vis(cx - 680,cy + 420,220)) {
_Arch.octPlatform(ctx,cx - 680,cy + 420,118,90,"#2e1410","#471f18","#ff5733",t,false);
_Arch.lightPillar(ctx,cx - 680,cy + 420,"rgba(255,190,145,0.85)","rgba(255,87,51,0.42)","🔴 Cột Sáng Bạo Vương");
}
if (vis(cx + 680,cy + 420,220)) {
_Arch.octPlatform(ctx,cx + 680,cy + 420,118,90,"#2e2410","#4a3a18","#ffd700",t,false);
_Arch.lightPillar(ctx,cx + 680,cy + 420,"rgba(255,246,180,0.88)","rgba(247,201,72,0.45)","🟡 Cột Sáng Tín Vương");
}
drawOuterOutposts("#21180f","#332516","#d4af37","golden_brazier","ruined_wall_seg",["⚔️ Chiến Trận Bắc","⚔️ Chiến Trận Nam","🔥 Doanh Tây","🔥 Doanh Đông"]);
return;
}

// -------------------- STAGE 11: SA MẠC LỬA THIÊU — TÂY MẠC --------------------
if (stageId==="stage_11") {
if (vis(cx,cy,320)) {
_Arch.octPlatform(ctx,cx,cy,215,166,"#36220f","#543618","#ff9f43",t,true);
_Arch.warTent(ctx,cx,cy - 45,t,"🐪 THƯƠNG TRẠM TÂY MẠC","#f5deb3","#c49448","#ffd700");
renderProp(ctx,cx - 120,cy + 25,"desert_palm",t);renderProp(ctx,cx + 120,cy + 25,"desert_palm",t);
}
drawOuterOutposts("#331f0e","#4d2e14","#ff6b35","desert_palm","lava_vent",["🌋 Khe Lửa Bắc","🌴 Ốc Đảo Nam","🏜️ Cồn Cát Tây","🏜️ Cồn Cát Đông"]);
return;
}

// -------------------- STAGE 12: THIÊN THÊ SƠN — TRUNG CHÂU --------------------
if (stageId==="stage_12") {
if (vis(cx,cy,300)) {
_Arch.octPlatform(ctx,cx,cy,215,165,"#152830","#23424f","#7ef7f0",t,true);
renderProp(ctx,cx - 85,cy - 20,"jade_pillar",t);renderProp(ctx,cx + 85,cy - 20,"jade_pillar",t);
renderProp(ctx,cx,cy - 18,"sword_monument",t);
ctx.font="bold 12.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7f0";
ctx.fillText("⛰️ ĐỈNH THIÊN THÊ SƠN — THẬP ĐẠI CỔ PHÁI",cx,cy - 180);
}
if (vis(cx,cy + 680,240)) _Arch.toriiGate(ctx,cx,cy + 680,t,"THIÊN THÊ SƠN MÔN","#4a8fa8","#1b3d4a","#7ef7f0","#1d5e7a");
drawOuterOutposts("#14242b","#213a45","#7ef7f0","spirit_cypress","mossy_steps",["☁️ Thiên Thê Bắc","☁️ Thiên Thê Nam","⚔️ Kiếm Đài Tây","⚔️ Kiếm Đài Đông"]);
return;
}

// -------------------- STAGE 13: BẮC NGUYÊN THẢO NGUYÊN --------------------
if (stageId==="stage_13") {
if (vis(cx,cy,320)) {
_Arch.octPlatform(ctx,cx,cy,215,165,"#1f2614","#303b1e","#ffd700",t,true);
_Arch.warTent(ctx,cx,cy - 38,t,"👑 HOÀNG KIM VƯƠNG TRƯỚNG","#f2efe9","#b8a98a","#ffd700");
for (const [bx,by] of [[-115,35],[115,35]]) renderProp(ctx,cx + bx,cy + by,"golden_brazier",t);
}
drawOuterOutposts("#1c2112","#2c341c","#e2bf75","wolf_totem","golden_brazier",["🐎 Doanh Bắc Nguyên","🐎 Doanh Nam","🔥 Trại Tây","🔥 Trại Đông"]);
return;
}

// -------------------- STAGE 14: VƯƠNG ĐÌNH TRANH BÁ --------------------
if (stageId==="stage_14") {
if (vis(cx,cy,340)) {
_Arch.octPlatform(ctx,cx,cy,245,190,"#2b1212","#471d1d","#ff5252",t,true);
ctx.font="bold 56px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillStyle="rgba(255,215,0,0.28)";ctx.fillText("王",cx,cy + 2);
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
renderProp(ctx,cx + Math.cos(a)*205,cy + Math.sin(a)*158,"dragon_pillar",t);
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText("⚔️ HUYẾT CHIẾN VƯƠNG ĐÌNH ĐÀI",cx,cy - 204);
}
if (vis(cx,cy - 680,250)) _Arch.toriiGate(ctx,cx,cy - 680,t,"VƯƠNG ĐÌNH BẮC MÔN","#8f1c1c","#3b0a0a","#ffd700","#8f1616");
drawOuterOutposts("#241212","#3b1d1d","#ff6b6b","crimson_maple","blood_crystal",["🚩 Chiến Kỳ Bắc","🚩 Chiến Kỳ Nam","⚔️ Trại Hắc Gia","⚔️ Trại Lưu Gia"]);
return;
}

// -------------------- STAGE 15: BÁT THẬP BÁT GIÁC CHÂN DƯƠNG LÂU --------------------
if (stageId==="stage_15") {
if (vis(cx,cy,360)) {
_Arch.octPlatform(ctx,cx,cy,265,205,"#36280d","#594216","#ffd700",t,false);
_Arch.octPlatform(ctx,cx,cy,205,158,"#4d3912","#78591c","#fff2a6",t,true);
_Arch.palacePavilion(ctx,cx,cy - 18,t,"CHÂN DƯƠNG LÂU","#ffe066","#9c6d14","#4a3510","#ffd700",0.92);
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
renderProp(ctx,cx + Math.cos(a)*235,cy + Math.sin(a)*180,"dragon_pillar",t);
}
}
drawOuterOutposts("#2b200c","#453314","#ffd700","dragon_pillar","golden_brazier",["☀️ Chân Dương Bắc","☀️ Chân Dương Nam","☀️ Chân Dương Tây","☀️ Chân Dương Đông"]);
return;
}

// -------------------- STAGE 16: HỒ TIÊN PHÚC ĐỊA — ĐÃNG HỒN SƠN --------------------
if (stageId==="stage_16") {
if (vis(cx,cy,360)) {
_Arch.octPlatform(ctx,cx,cy,245,190,"#331230","#541d4f","#ff85d5",t,true);
_Arch.palacePavilion(ctx,cx,cy - 24,t,"ĐÃNG HỒN CUNG","#ff9be0","#7a1e69","#3b1138","#ffd700",0.9);
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
renderProp(ctx,cx + Math.cos(a)*205,cy + Math.sin(a)*156,"pink_soul_crystal",t);
}
}
drawOuterOutposts("#291026","#451940","#ff85d5","crystal_tree","pink_soul_crystal",["🦊 Pha Lê Bắc","🦊 Pha Lê Nam","💎 Đảm Thức Tây","💎 Đảm Thức Đông"]);
return;
}

// -------------------- STAGE 17: LANG GIA PHÚC ĐỊA — VÂN CÁC --------------------
if (stageId==="stage_17") {
if (vis(cx,cy,360)) {
_Arch.octPlatform(ctx,cx,cy,250,192,"#182d3d","#274a63","#7ef7f0",t,true);
_Arch.palacePavilion(ctx,cx,cy - 20,t,"LANG GIA VÂN CÁC","#99e6ff","#2b6285","#1a364a","#ffd700",0.92);
for (const [rx,ry] of [[-155,40],[155,40],[0,120]]) renderProp(ctx,cx + rx,cy + ry,"refinement_cauldron",t);
}
drawOuterOutposts("#162836","#244259","#7ef7f0","spirit_cypress","refinement_cauldron",["☁️ Luyện Các Bắc","☁️ Luyện Các Nam","⚗️ Vân Đài Tây","⚗️ Vân Đài Đông"]);
return;
}

// -------------------- STAGE 18: THANH THÀNH SƠN --------------------
if (stageId==="stage_18") {
if (vis(cx,cy,320)) {
_Arch.octPlatform(ctx,cx,cy,228,175,"#182433","#283c54","#85c1e9",t,true);
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
renderProp(ctx,cx + Math.cos(a)*182,cy + Math.sin(a)*138,"ice_crystal",t);
}
ctx.font="bold 12.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#bff0ff";
ctx.fillText("❄️ THANH THÀNH SƠN — TINH TƯỢNG KỲ TRẬN",cx,cy - 188);
}
drawOuterOutposts("#16202b","#233447","#85c1e9","frozen_pine","sword_monument",["❄️ Hàn Đỉnh Bắc","❄️ Hàn Đỉnh Nam","⚔️ Kiếm Tháp Tây","⚔️ Kiếm Tháp Đông"]);
return;
}

// -------------------- STAGE 19: ĐẠI CHIẾN NGHĨA THIÊN SƠN --------------------
if (stageId==="stage_19") {
if (vis(cx,cy,360)) {
_Arch.octPlatform(ctx,cx,cy,260,200,"#261016","#421924","#ff5252",t,true);
// 10-Extreme Immortal Zombie Formation Pillars!
for (let i=0;i<10;i++) {
const a=(i*Math.PI*2)/10;
renderProp(ctx,cx + Math.cos(a)*218,cy + Math.sin(a)*168,"blood_crystal",t);
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#ff8a8a";
ctx.fillText("💀 THẬP TUYỆT TIÊN CƯƠNG VÔ SINH ĐẠI TRẬN",cx,cy - 214);
}
drawOuterOutposts("#210f14","#381820","#ff6b6b","crimson_maple","sword_monument",["⚔️ Nghĩa Thiên Bắc","⚔️ Nghĩa Thiên Nam","🩸 Huyết Trận Tây","🩸 Huyết Trận Đông"]);
return;
}

// -------------------- STAGE 20: HẮC PHÀM ĐỘNG THIÊN --------------------
if (stageId==="stage_20") {
if (vis(cx,cy,340)) {
_Arch.octPlatform(ctx,cx,cy,235,180,"#142921","#204537","#7ef7c4",t,true);
_Arch.palacePavilion(ctx,cx,cy - 22,t,"HẮC PHÀM TIÊN ĐIỆN","#5cc995","#144a34","#102e22","#ffd700",0.88);
for (const [lx,ly] of [[-145,55],[145,55],[-90,115],[90,115]]) renderProp(ctx,cx + lx,cy + ly,"stone_lotus",t);
}
drawOuterOutposts("#12241d","#1d3b30","#5cc995","weeping_willow","stone_lotus",["🪷 Liên Trì Bắc","🪷 Liên Trì Nam","🌿 Tiên Lâm Tây","🌿 Tiên Lâm Đông"]);
return;
}

// -------------------- STAGE 21: BÍ CẢNH NGHỊCH LƯU HÀ --------------------
if (stageId==="stage_21") {
if (vis(cx,cy,340)) {
_Arch.octPlatform(ctx,cx,cy,230,176,"#0e2433","#1a4059","#4ce6ff",t,true);
for (const [ix,iy] of [[-140,-75],[140,-75],[-140,75],[140,75]]) renderProp(ctx,cx + ix,cy + iy,"ice_crystal",t);
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7f0";
ctx.fillText("🌊 NGHỊCH LƯU THẠCH ĐẢO — CHỨNG ĐẠO NGHỊCH LƯU",cx,cy - 190);
}
drawOuterOutposts("#0d202e","#18384f","#4ce6ff","ice_crystal","stone_lotus",["🌊 Thượng Nguồn Bắc","🌊 Hạ Lưu Nam","🧊 Đảo Băng Tây","🧊 Đảo Băng Đông"]);
return;
}

// -------------------- STAGE 22: QUANG ÂM TRƯỜNG HÀ — THẠCH LIÊN ĐẢO --------------------
if (stageId==="stage_22") {
if (vis(cx,cy,350)) {
_Arch.octPlatform(ctx,cx,cy,248,192,"#292412","#453d1e","#ffd700",t,true);
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4;
renderProp(ctx,cx + Math.cos(a)*195,cy + Math.sin(a)*150,"stone_lotus",t);
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffeaa7";
ctx.fillText("⏳ THẠCH LIÊN ĐẢO — QUANG ÂM TRƯỜNG HÀ",cx,cy - 206);
}
drawOuterOutposts("#242010","#3d361b","#ffd700","dragon_pillar","stone_lotus",["⏳ Sóng Thời Gian Bắc","⏳ Sóng Thời Gian Nam","🪷 Thạch Liên Tây","🪷 Thạch Liên Đông"]);
return;
}

// -------------------- STAGE 23: ĐÔNG HẢI LONG CUNG --------------------
if (stageId==="stage_23") {
if (vis(cx,cy,360)) {
_Arch.octPlatform(ctx,cx,cy,260,200,"#0d1e30","#173654","#4ce6ff",t,true);
_Arch.palacePavilion(ctx,cx,cy - 20,t,"ĐÔNG HẢI LONG CUNG","#67d4ff","#164873","#0e2942","#ffd700",0.94);
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
renderProp(ctx,cx + Math.cos(a)*215,cy + Math.sin(a)*165,"dragon_pillar",t);
}
}
drawOuterOutposts("#0c1c2c","#15304a","#4ce6ff","dragon_pillar","stone_lotus",["🐉 Long Môn Bắc","🐉 Long Môn Nam","🌊 Thủy Các Tây","🌊 Thủy Các Đông"]);
return;
}

// -------------------- STAGE 24: THIÊN ĐÌNH TRUNG CHÂU --------------------
if (stageId==="stage_24") {
if (vis(cx,cy,380)) {
_Arch.octPlatform(ctx,cx,cy,275,212,"#2e2716","#4d4226","#ffd700",t,false);
_Arch.octPlatform(ctx,cx,cy,215,165,"#42381e","#6b5b31","#fff5b8",t,true);
_Arch.palacePavilion(ctx,cx,cy - 22,t,"TÚC MỆNH THÁP • THIÊN ĐÌNH","#fff5c2","#b89232","#3d331a","#ffd700",0.98);
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
renderProp(ctx,cx + Math.cos(a)*245,cy + Math.sin(a)*188,"dragon_pillar",t);
}
}
if (vis(cx,cy + 690,260)) _Arch.toriiGate(ctx,cx,cy + 690,t,"NAM THIÊN MÔN","#fff0b3","#8c6b22","#ffd700","#c9972b");
drawOuterOutposts("#292314","#423820","#ffd700","spirit_cypress","golden_brazier",["☀️ Tiên Điện Bắc","☀️ Nam Thiên Môn","⚔️ Giám Thiên Tây","⚔️ Giám Thiên Đông"]);
return;
}

// -------------------- STAGE 25: TẦNG CHÍN PHONG MA QUẬT --------------------
if (stageId==="stage_25") {
if (vis(cx,cy,380)) {
_Arch.octPlatform(ctx,cx,cy,275,212,"#140a24","#261345","#b75cff",t,false);
_Arch.octPlatform(ctx,cx,cy,210,162,"#1e0e38","#381b66","#ffd700",t,true);
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
renderProp(ctx,cx + Math.cos(a)*235,cy + Math.sin(a)*180,"chaos_monolith",t);
}
ctx.font="bold 13.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#e0b3ff";
ctx.fillText("🌌 VÔ CỰC HỖN ĐỘN ĐẠI TRẬN — TẦNG CHÍN PHONG MA QUẬT",cx,cy - 224);
}
drawOuterOutposts("#130921","#241140","#b75cff","chaos_monolith","pink_soul_crystal",["👑 Tôn Giả Đài Bắc","👑 Tôn Giả Đài Nam","🌀 Hỗn Độn Tây","🌀 Hỗn Độn Đông"]);
return;
}

// -------------------- 6 SPECIAL RESOURCE REALMS --------------------
const specialSpecs={
special_spirit_spring:{title:"💎 CỔ MẠCH NGUYÊN TUYỀN",pA:"bamboo_clump_tall",pB:"stone_lotus",edge:"#5cc995",base:"#0e261c",top:"#1a4735"},
special_herb_valley:  {title:"🌿 DƯỢC CỐC NGŨ VỰC",pA:"peach_blossom_tree",pB:"moon_flower",edge:"#7ef7c4",base:"#132917",top:"#224a29"},
special_relic_tomb:   {title:"⚱️ CỔ MỘ XÁ LỢI BÍ ĐIỆN",pA:"ruined_wall_seg",pB:"golden_brazier",edge:"#ffd700",base:"#261e12",top:"#40321c"},
special_dang_hun:     {title:"🔮 ĐÃNG HỒN BẢO ĐỊA",pA:"crystal_tree",pB:"pink_soul_crystal",edge:"#ff85d5",base:"#2b1029",top:"#4a1c46"},
special_immortal_vein:{title:"🌟 THÁI CỔ LINH MẠCH",pA:"spirit_cypress",pB:"refinement_cauldron",edge:"#7ef7f0",base:"#122436",top:"#1f3e5c"},
special_chaos_vault:  {title:"👑 BẢO KHỐ VÔ CỰC CHÍ TÔN",pA:"chaos_monolith",pB:"dragon_pillar",edge:"#ffd700",base:"#1a0d2e",top:"#301854"}
};
const sp=specialSpecs[stageId];
if (sp) {
if (vis(cx,cy,320)) {
_Arch.octPlatform(ctx,cx,cy,215,166,sp.base,sp.top,sp.edge,t,true);
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
renderProp(ctx,cx + Math.cos(a)*168,cy + Math.sin(a)*128,i%2===0?sp.pA :sp.pB,t);
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle=sp.edge;
ctx.fillText(sp.title,cx,cy - 180);
}
drawOuterOutposts(sp.base,sp.top,sp.edge,sp.pA,sp.pB,["⭐ Khu Khai Thác Bắc","⭐ Khu Khai Thác Nam","⭐ Khu Khai Thác Tây","⭐ Khu Khai Thác Đông"]);
return;
}

if (vis(cx,cy,260)) {
const th=map.activeTheme;
_Arch.octPlatform(ctx,cx,cy,185,142,_shadeHex(th.cPrimary,-8),_shadeHex(th.cSpirit,8),_shadeHex(th.cSpirit||"#d4af37",48),t,true);
}
}

global.MapArtRenderer.renderStageLandmarks=renderStageLandmarks;
})(window);
