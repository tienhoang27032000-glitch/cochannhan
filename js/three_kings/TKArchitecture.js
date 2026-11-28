(function (global) {
"use strict";
const Arch={
drawStonePlatform(ctx,x,y,w,h,opts={}) {
const baseCol=opts.baseCol||"#241c13";
const topCol=opts.topCol||"#332719";
const edgeCol=opts.edgeCol||"#b89758";
const bevel=opts.bevel||12;

ctx.save();
ctx.fillStyle="rgba(0,0,0,0.48)";
ctx.fillRect(x + 10,y + 12,w,h);
ctx.fillStyle=baseCol;
ctx.fillRect(x,y + bevel,w,h);
ctx.strokeStyle="#16100a";
ctx.lineWidth=2;
ctx.strokeRect(x,y + bevel,w,h);
ctx.fillStyle=topCol;
ctx.fillRect(x,y,w,h);
ctx.strokeStyle=opts.gridCol||"rgba(212,175,55,0.11)";
ctx.lineWidth=1;
const step=opts.tileSize||48;
ctx.beginPath();
for (let gx=x + step;gx<x + w;gx+=step) {ctx.moveTo(gx,y);ctx.lineTo(gx,y + h);}
for (let gy=y + step;gy<y + h;gy+=step) {ctx.moveTo(x,gy);ctx.lineTo(x + w,gy);}
ctx.stroke();
ctx.strokeStyle=edgeCol;ctx.lineWidth=3;ctx.strokeRect(x,y,w,h);
ctx.strokeStyle="rgba(255,234,167,0.35)";ctx.lineWidth=1;ctx.strokeRect(x + 8,y + 8,w - 16,h - 16);
const corners=[[x + 12,y + 12],[x + w - 12,y + 12],[x + 12,y + h - 12],[x + w - 12,y + h - 12]];
ctx.fillStyle=edgeCol;
for (const [cx,cy] of corners) {ctx.beginPath();ctx.arc(cx,cy,4.5,0,Math.PI*2);ctx.fill();}
ctx.restore();
},

drawGrandStaircase(ctx,x,y,w,h,steps=6,opts={}) {
const topCol=opts.topCol||"#4a3b26";
const riserCol=opts.riserCol||"#261d12";
const trimCol=opts.trimCol||"#d4af37";
const stepH=h / steps;
ctx.save();
ctx.fillStyle="rgba(0,0,0,0.42)";
ctx.fillRect(x - 10,y + 6,w + 20,h + 6);
for (let i=0;i<steps;i++) {
const sy=y + i*stepH;
const sw=w + i*4;
const sx=x - i*2;
ctx.fillStyle=topCol;ctx.fillRect(sx,sy,sw,stepH - 3);
ctx.fillStyle=riserCol;ctx.fillRect(sx,sy + stepH - 3,sw,3);
ctx.strokeStyle="rgba(212,175,55,0.28)";ctx.lineWidth=1;ctx.strokeRect(sx,sy,sw,stepH);
}
const rampW=Math.min(46,w*0.28);
ctx.fillStyle="#3a2d1b";
ctx.fillRect(x + (w - rampW)/2,y,rampW,h);
ctx.strokeStyle=trimCol;ctx.lineWidth=1.5;
ctx.strokeRect(x + (w - rampW)/2,y,rampW,h);
ctx.strokeStyle="rgba(255,234,167,0.35)";
for (let ry=y + 12;ry<y + h - 8;ry+=16) {
ctx.beginPath();ctx.arc(x + w/2,ry,rampW*0.28,0,Math.PI);ctx.stroke();
}
for (const side of [-1,1]) {
const bx=side<0?(x - 14) :(x + w + 2);
ctx.fillStyle="#52422c";ctx.strokeStyle=trimCol;ctx.lineWidth=1.5;
ctx.fillRect(bx,y - 4,12,h + 8);ctx.strokeRect(bx,y - 4,12,h + 8);
ctx.fillStyle=trimCol;ctx.fillRect(bx - 2,y - 8,16,8);ctx.fillRect(bx - 2,y + h + 2,16,8);
}
ctx.restore();
},

drawOrnateBronzePillar(ctx,x,y,t,scale=1.0,accentCol="#ffd700") {
ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
ctx.fillStyle="rgba(0,0,0,0.45)";
ctx.beginPath();ctx.ellipse(16,12,24,13,0.3,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#453827";ctx.strokeStyle="#b89758";ctx.lineWidth=1.8;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*22;const py=Math.sin(a)*19;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
const colGrad=ctx.createLinearGradient(-13,0,13,0);
colGrad.addColorStop(0,"#2a1f10");colGrad.addColorStop(0.35,"#7d6236");colGrad.addColorStop(0.55,"#b89352");colGrad.addColorStop(1,"#21170b");
ctx.fillStyle=colGrad;ctx.fillRect(-13,-46,26,48);
ctx.strokeStyle=accentCol;ctx.lineWidth=1.2;ctx.strokeRect(-13,-46,26,48);
ctx.strokeStyle=accentCol;ctx.globalAlpha=0.6;ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(-12,-8);ctx.bezierCurveTo(10,-16,-10,-28,12,-38);ctx.stroke();
ctx.globalAlpha=1;
ctx.fillStyle="#594321";ctx.fillRect(-19,-56,38,11);
ctx.strokeStyle=accentCol;ctx.strokeRect(-19,-56,38,11);
ctx.fillStyle="#8a6c34";ctx.beginPath();ctx.arc(0,-51,6,0,Math.PI*2);ctx.fill();
ctx.restore();
},

drawIncenseBrazier(ctx,x,y,t,flameCol="#38e8a8") {
ctx.save();ctx.translate(x,y);
const g=ctx.createRadialGradient(0,-14,4,0,-14,54 + Math.sin(t*4)*5);
g.addColorStop(0,flameCol==="#38e8a8"?"rgba(56,232,168,0.34)" :(flameCol==="#ff5733"?"rgba(255,95,45,0.38)" :"rgba(255,215,85,0.36)"));
g.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-14,58,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.beginPath();ctx.ellipse(0,8,18,8,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#6e5630";ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(-9,0);ctx.lineTo(-12,9);ctx.moveTo(9,0);ctx.lineTo(12,9);ctx.moveTo(0,2);ctx.lineTo(0,11);ctx.stroke();
const bGrad=ctx.createLinearGradient(-15,-12,15,4);
bGrad.addColorStop(0,"#3a2b16");bGrad.addColorStop(0.5,"#94743e");bGrad.addColorStop(1,"#261b0d");
ctx.fillStyle=bGrad;ctx.beginPath();ctx.ellipse(0,-4,15,10,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.4;ctx.stroke();
const fh=14 + Math.sin(t*7 + x)*4;
ctx.fillStyle=flameCol;
ctx.beginPath();ctx.moveTo(-7,-8);ctx.quadraticCurveTo(Math.sin(t*6)*4,-8 - fh,0,-10 - fh);ctx.quadraticCurveTo(-Math.sin(t*5)*3,-8 - fh*0.5,7,-8);ctx.closePath();ctx.fill();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(0,-11,3.5,0,Math.PI*2);ctx.fill();
ctx.restore();
},

drawNineDragonBronzeCauldron(ctx,x,y,t,refStageIdx=-1,promptLabel=null) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.52)";ctx.beginPath();ctx.ellipse(0,14,78,52,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#21190f";ctx.strokeStyle="#d4af37";ctx.lineWidth=2.5;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*72;const py=Math.sin(a)*46;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
ctx.save();ctx.scale(1,0.64);ctx.rotate(t*0.35);
ctx.strokeStyle="rgba(126,247,205,0.65)";ctx.lineWidth=1.8;
ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.stroke();ctx.restore();
ctx.strokeStyle="#7d6133";ctx.lineWidth=6.5;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-22,2);ctx.quadraticCurveTo(-30,18,-25,25);ctx.moveTo(22,2);ctx.quadraticCurveTo(30,18,25,25);ctx.moveTo(0,8);ctx.lineTo(0,28);ctx.stroke();
ctx.strokeStyle="#ffd700";ctx.lineWidth=3.5;
ctx.beginPath();ctx.arc(-34,-18,9,Math.PI*0.3,Math.PI*1.65);ctx.stroke();
ctx.beginPath();ctx.arc(34,-18,9,-Math.PI*0.65,Math.PI*0.7);ctx.stroke();
const cGrad=ctx.createRadialGradient(-10,-16,6,0,-10,38);
cGrad.addColorStop(0,"#c49e59");cGrad.addColorStop(0.5,"#6e5429");cGrad.addColorStop(1,"#24190a");
ctx.fillStyle=cGrad;ctx.beginPath();ctx.ellipse(0,-10,35,24,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.stroke();
ctx.strokeStyle="rgba(255,230,140,0.55)";ctx.lineWidth=1.4;
ctx.beginPath();ctx.arc(0,-6,28,0.2,Math.PI - 0.2);ctx.stroke();
ctx.fillStyle="#142e24";ctx.beginPath();ctx.ellipse(0,-22,26,11,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffeaa7";ctx.lineWidth=2;ctx.stroke();
const stageCols=["#5cc995","#5cc995","#ff3b30","#ff7675","#ffd700"];
const colMain=(refStageIdx>=0)?stageCols[Math.min(4,refStageIdx)] :"#38e8a8";
const flGlow=ctx.createRadialGradient(0,-34,4,0,-34,50 + Math.sin(t*5)*6);
flGlow.addColorStop(0,"rgba(255,255,255,0.95)");flGlow.addColorStop(0.38,colMain);flGlow.addColorStop(0.72,"rgba(255,215,0,0.24)");flGlow.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=flGlow;ctx.beginPath();ctx.arc(0,-34,54,0,Math.PI*2);ctx.fill();
if (refStageIdx>=0) {
// Evolving floating alchemy cloud right above the cauldron!
const cy=-52 + Math.sin(t*3.2)*4;
ctx.save();
ctx.fillStyle=colMain;ctx.globalAlpha=0.52;
ctx.beginPath();ctx.ellipse(0,cy,32,18,0,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=0.92;
ctx.strokeStyle="#fff2a6";ctx.lineWidth=1.5;
if (refStageIdx===1) {
// Cỏ dại phương hoa
ctx.fillStyle="#5cc995";ctx.fillRect(-16,cy,32,6);
ctx.fillStyle="#ffd700";
for (const fx of [-10,0,10]) {ctx.beginPath();ctx.arc(fx,cy - 2,3,0,Math.PI*2);ctx.fill();}
} else if (refStageIdx===2||refStageIdx===3) {
// Huyết hải & đồng ruộng lúa đỏ
ctx.fillStyle="#c0392b";ctx.beginPath();ctx.ellipse(0,cy + 2,24,11,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ff9999";
for (let sx=-14;sx<=14;sx+=7) {ctx.beginPath();ctx.moveTo(sx,cy + 5);ctx.lineTo(sx + Math.sin(t*5 + sx)*2,cy - 8);ctx.stroke();}
} else if (refStageIdx>=4) {
// Năm trăm tuổi thành thu: bông lúa vàng rực / hoa vàng vân máu đỏ
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(0,cy,14,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#e03e3e";ctx.lineWidth=1.4;ctx.stroke();
}
ctx.restore();
}
for (let r=0;r<3;r++) {
const p=((t*0.6 + r*0.33) % 1);
ctx.save();ctx.globalAlpha=(1 - p)*0.65;ctx.strokeStyle=colMain;ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(Math.sin(t*2 + r)*4,-28 - p*38,14 + p*12,5 + p*4,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}
const lbl=promptLabel||(refStageIdx>=0?["Khói Xanh & Ánh Vàng","🌼 Cỏ Dại Phương Hoa","🩸 Huyết Khí Như Biển","🌿 Cổ Thọ 300 Năm","🌾 Cổ Thọ 500 Năm"][Math.min(4,refStageIdx)] :"🔥 Cửu Long Thanh Đồng Đỉnh");
ctx.font="bold 12px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(lbl,1,-78);
ctx.fillStyle="#ffeaa7";ctx.fillText(lbl,0,-79);
ctx.restore();
},

drawBronzeToriiGate(ctx,x,y,t,plaqueText="THANH ĐỒNG ĐẠI ĐIỆN",bannerCol="#7a1616",accentCol="#ffd700") {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(-130,-10,260,34);
const cols=[-115,-48,48,115];
for (const cx of cols) {
ctx.fillStyle="#453520";ctx.strokeStyle=accentCol;ctx.lineWidth=1.6;
ctx.fillRect(cx - 10,-62,20,76);ctx.strokeRect(cx - 10,-62,20,76);
ctx.fillStyle="#594a38";ctx.fillRect(cx - 14,8,28,12);ctx.strokeRect(cx - 14,8,28,12);
}
ctx.fillStyle="#3a2a16";ctx.strokeStyle=accentCol;ctx.lineWidth=1.8;
ctx.fillRect(-135,-58,270,14);ctx.strokeRect(-135,-58,270,14);
const roofG=ctx.createLinearGradient(0,-94,0,-56);
roofG.addColorStop(0,"#7a6234");roofG.addColorStop(0.5,"#42331b");roofG.addColorStop(1,"#1f170c");
ctx.fillStyle=roofG;
ctx.beginPath();ctx.moveTo(-152,-56);ctx.quadraticCurveTo(-132,-74,-115,-82);ctx.lineTo(115,-82);ctx.quadraticCurveTo(132,-74,152,-56);ctx.closePath();
ctx.fill();ctx.strokeStyle=accentCol;ctx.lineWidth=2.2;ctx.stroke();
ctx.fillStyle="#1f140b";ctx.strokeStyle=accentCol;ctx.lineWidth=2;
ctx.fillRect(-68,-78,136,22);ctx.strokeRect(-68,-78,136,22);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle=accentCol;
ctx.fillText(plaqueText,0,-63);
for (const side of [-1,1]) {
const sw=Math.sin(t*2.4 + side)*5;
ctx.fillStyle=bannerCol;ctx.strokeStyle=accentCol;ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(side*82,-44);ctx.lineTo(side*96,-44);ctx.lineTo(side*96 + sw,-4);ctx.lineTo(side*89 + sw,-12);ctx.lineTo(side*82 + sw,-4);ctx.closePath();ctx.fill();ctx.stroke();
}
ctx.restore();
},

drawStoneHoundStatue(ctx,x,y,facing=1,eyeCol="#7ef7c4") {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.beginPath();ctx.ellipse(0,12,24,11,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#453f38";ctx.strokeStyle="#b89758";ctx.lineWidth=1.6;
ctx.fillRect(-20,-2,40,16);ctx.strokeRect(-20,-2,40,16);
ctx.scale(facing,1);
const stG=ctx.createLinearGradient(-12,-34,12,0);
stG.addColorStop(0,"#8c857b");stG.addColorStop(1,"#3d3832");
ctx.fillStyle=stG;
ctx.beginPath();ctx.ellipse(-2,-14,13,15,0.15,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#1f1c18";ctx.lineWidth=1.2;ctx.stroke();
ctx.beginPath();ctx.arc(6,-28,9,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(2,-35);ctx.lineTo(1,-44);ctx.lineTo(7,-36);ctx.closePath();ctx.fill();
ctx.fillStyle=eyeCol;ctx.beginPath();ctx.arc(10,-29,2.2,0,Math.PI*2);ctx.fill();
ctx.restore();
},

drawAncientStele(ctx,x,y,t,label,glowCol="#ffd700") {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.42)";ctx.beginPath();ctx.ellipse(0,10,20,8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#474139";ctx.strokeStyle="#8a7c66";ctx.lineWidth=1.4;
ctx.beginPath();ctx.ellipse(0,4,18,9,0,0,Math.PI*2);ctx.fill();ctx.stroke();
const tg=ctx.createLinearGradient(-12,-42,12,0);
tg.addColorStop(0,"#635c52");tg.addColorStop(1,"#2e2a25");
ctx.fillStyle=tg;
ctx.beginPath();ctx.moveTo(-12,2);ctx.lineTo(-12,-36);ctx.quadraticCurveTo(0,-48,12,-36);ctx.lineTo(12,2);ctx.closePath();
ctx.fill();ctx.strokeStyle=glowCol;ctx.lineWidth=1.3;ctx.stroke();
ctx.strokeStyle=glowCol;ctx.globalAlpha=0.55 + Math.sin(t*3)*0.3;ctx.lineWidth=1.2;
for (let ry=-30;ry<=-8;ry+=7) {ctx.beginPath();ctx.moveTo(-6,ry);ctx.lineTo(6,ry);ctx.stroke();}
ctx.globalAlpha=1;
ctx.font="bold 10.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(label,1,-51);
ctx.fillStyle=glowCol;ctx.fillText(label,0,-52);
ctx.restore();
},

drawStoneLantern(ctx,x,y,t,flameCol="#ffd700") {
ctx.save();ctx.translate(x,y);
const g=ctx.createRadialGradient(0,-24,2,0,-24,42 + Math.sin(t*5 + x)*4);
g.addColorStop(0,flameCol==="#38e8a8"?"rgba(56,232,168,0.42)" :(flameCol==="#5aa9e6"?"rgba(90,169,230,0.44)" :(flameCol==="#ff5733"?"rgba(255,90,45,0.44)" :"rgba(255,215,90,0.40)")));
g.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-24,44,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#454038";ctx.strokeStyle="#221e1a";ctx.lineWidth=1.2;
ctx.fillRect(-7,-2,14,10);ctx.fillRect(-4,-20,8,18);
ctx.fillStyle=flameCol;ctx.fillRect(-5,-29,10,9);
ctx.strokeStyle="#5c554a";ctx.strokeRect(-6,-30,12,11);
ctx.fillStyle="#3a352e";
ctx.beginPath();ctx.moveTo(-12,-29);ctx.lineTo(0,-38);ctx.lineTo(12,-29);ctx.closePath();ctx.fill();
ctx.restore();
},

drawInheritancePillar(ctx,x,y,t,colCore,colGlow,label) {
ctx.save();
const w=38 + Math.sin(t*4)*5;
const g=ctx.createLinearGradient(x - w,y,x + w,y);
g.addColorStop(0,"rgba(0,0,0,0)");
g.addColorStop(0.32,colGlow);
g.addColorStop(0.5,colCore);
g.addColorStop(0.68,colGlow);
g.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=g;
ctx.fillRect(x - w,y - 340,w*2,340);
// Floor impact halo
const fg=ctx.createRadialGradient(x,y,6,x,y,64);
fg.addColorStop(0,colCore);fg.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=fg;ctx.beginPath();ctx.ellipse(x,y,64,34,0,0,Math.PI*2);ctx.fill();
ctx.font="bold 12px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(label,x + 1,y - 346);
ctx.fillStyle="#ffffff";ctx.fillText(label,x,y - 347);
ctx.restore();
},

// ==============================================================================
// WORLD 2 ARCHITECTURAL PRIMITIVES (ĐỘC MÙ TRÚC LÂM)
// ==============================================================================
drawBambooToriiGate(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(-105,-4,210,24);
for (const side of [-1,1]) {
ctx.fillStyle="#33423b";ctx.strokeStyle="#5c7d6e";ctx.lineWidth=1.8;
ctx.fillRect(side*78 - 10,-68,20,78);ctx.strokeRect(side*78 - 10,-68,20,78);
ctx.fillStyle="#216e4e";ctx.fillRect(side*78 - 8,-20,16,12);
}
ctx.fillStyle="#184d3b";ctx.strokeStyle="#38e8a8";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-116,-64);ctx.quadraticCurveTo(0,-84,116,-64);ctx.lineTo(106,-52);ctx.quadraticCurveTo(0,-66,-106,-52);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#0d261d";ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.4;
ctx.fillRect(-54,-68,108,19);ctx.strokeRect(-54,-68,108,19);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText("ĐỘC MÙ TRÚC LÂM",0,-55);
ctx.restore();
},

drawToxicJadePond(ctx,x,y,rx,ry,t) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="#1a2923";ctx.beginPath();ctx.ellipse(0,0,rx + 18,ry + 14,0,0,Math.PI*2);ctx.fill();
const wg=ctx.createRadialGradient(0,-10,30,0,0,rx);
wg.addColorStop(0,"#1f8a63");wg.addColorStop(0.55,"#12543e");wg.addColorStop(1,"#09291e");
ctx.fillStyle=wg;ctx.beginPath();ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#38e8a8";ctx.lineWidth=2.5;ctx.stroke();
for (let i=0;i<14;i++) {
const ang=i*2.3 + t*0.18;const dist=(0.25 + ((i*0.19) % 0.65));
const bx=Math.cos(ang)*rx*dist;const by=Math.sin(ang)*ry*dist;
const bp=((t*0.7 + i*0.23) % 1);
ctx.strokeStyle=`rgba(126,247,196,${(1 - bp)*0.55})`;ctx.lineWidth=1.4;
ctx.beginPath();ctx.ellipse(bx,by,5 + bp*18,3 + bp*10,0,0,Math.PI*2);ctx.stroke();
}
ctx.restore();
},

drawWoodenBridge(ctx,x,y,w,h,vertical=true,opts={}) {
const deckCol=opts.deckCol||"#4a3522";
const railCol=opts.railCol||"#6b4d32";
const trimCol=opts.trimCol||"#b89758";
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.fillRect(-w/2 + 6,-h/2 + 8,w,h);
ctx.fillStyle=deckCol;ctx.fillRect(-w/2,-h/2,w,h);
ctx.strokeStyle="#1a1410";ctx.lineWidth=1.6;
if (vertical) {
for (let py=-h/2 + 12;py<h/2;py+=14) {ctx.beginPath();ctx.moveTo(-w/2,py);ctx.lineTo(w/2,py);ctx.stroke();}
for (const side of [-1,1]) {
const rx=side*(w/2 - 5);
ctx.fillStyle=railCol;ctx.strokeStyle=trimCol;ctx.lineWidth=1.4;
ctx.fillRect(rx - 4,-h/2,8,h);ctx.strokeRect(rx - 4,-h/2,8,h);
for (let py=-h/2;py<=h/2;py+=h/4) {ctx.fillStyle=trimCol;ctx.fillRect(rx - 5,py - 4,10,8);}
}
} else {
for (let px=-w/2 + 12;px<w/2;px+=14) {ctx.beginPath();ctx.moveTo(px,-h/2);ctx.lineTo(px,h/2);ctx.stroke();}
for (const side of [-1,1]) {
const ry=side*(h/2 - 5);
ctx.fillStyle=railCol;ctx.strokeStyle=trimCol;ctx.lineWidth=1.4;
ctx.fillRect(-w/2,ry - 4,w,8);ctx.strokeRect(-w/2,ry - 4,w,8);
}
}
ctx.restore();
},

drawOctagonalJadePavilion(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.52)";ctx.beginPath();ctx.ellipse(0,18,215,155,0,0,Math.PI*2);ctx.fill();
const drawOct=(rx,ry,fill,stroke,lw)=>{
ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=lw;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*rx;const py=Math.sin(a)*ry;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
};
drawOct(205,148,"#24332d","#38e8a8",2.6);
drawOct(172,122,"#1b2924","#7ef7c4",1.6);
ctx.save();ctx.scale(1,0.72);ctx.rotate(-t*0.3);
ctx.strokeStyle="rgba(56,232,168,0.55)";ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,108,0,Math.PI*2);ctx.stroke();ctx.restore();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*156;const py=Math.sin(a)*110;
ctx.fillStyle="#103629";ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(px,py,10,0,Math.PI*2);ctx.fill();ctx.stroke();
const lg=ctx.createRadialGradient(px,py - 12,1,px,py - 12,18);
lg.addColorStop(0,"rgba(126,247,196,0.75)");lg.addColorStop(1,"rgba(56,232,168,0)");
ctx.fillStyle=lg;ctx.beginPath();ctx.arc(px,py - 12,18,0,Math.PI*2);ctx.fill();
}
ctx.save();
ctx.strokeStyle="#196b4d";ctx.lineWidth=18;ctx.globalAlpha=0.72;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*182;const py=Math.sin(a)*128 - 14;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.stroke();ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.globalAlpha=0.88;ctx.stroke();
ctx.restore();
ctx.font="bold 13px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText("🏯 ĐÌNH ĐỘC TRÚC BÁT GIÁC",1,-148);
ctx.fillStyle="#7ef7c4";ctx.fillText("🏯 ĐÌNH ĐỘC TRÚC BÁT GIÁC",0,-149);
ctx.restore();
},

drawBambooCluster(ctx,x,y,r,t,seed=0) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.38)";ctx.beginPath();ctx.ellipse(6,8,r*1.15,r*0.52,0,0,Math.PI*2);ctx.fill();
const sway=Math.sin(t*1.9 + seed)*4.5;
for (let i=-2;i<=2;i++) {
const bx=i*7.5;const bh=r*1.8 + ((i*13 + seed*7) % 18);
const bGrad=ctx.createLinearGradient(bx - 3,0,bx + 3,0);
bGrad.addColorStop(0,"#0d3d2b");bGrad.addColorStop(0.5,"#2ea877");bGrad.addColorStop(1,"#124f38");
ctx.strokeStyle=bGrad;ctx.lineWidth=5.2;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(bx,4);ctx.quadraticCurveTo(bx + sway*0.4,-bh*0.5,bx + sway,-bh);ctx.stroke();
ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.1;
for (let s=0.3;s<=0.85;s+=0.26) {
const jx=bx + sway*s*0.8;const jy=-bh*s;
ctx.beginPath();ctx.moveTo(jx - 3.5,jy);ctx.lineTo(jx + 3.5,jy);ctx.stroke();
}
ctx.fillStyle=i%2===0?"#248f64" :"#38c992";
ctx.beginPath();ctx.ellipse(bx + sway - 8,-bh - 2,11,4.2,-0.35,0,Math.PI*2);ctx.ellipse(bx + sway + 8,-bh - 4,11,4.2,0.35,0,Math.PI*2);ctx.fill();
}
ctx.restore();
},

drawPoisonMiasmaPool(ctx,x,y,r,t) {
ctx.save();ctx.translate(x,y);
const pulse=1 + Math.sin(t*3 + x*0.02)*0.08;
const g=ctx.createRadialGradient(0,0,4,0,0,r*pulse);
g.addColorStop(0,"rgba(56,232,168,0.48)");g.addColorStop(0.55,"rgba(90,40,130,0.34)");g.addColorStop(1,"rgba(20,10,30,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,r*pulse,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="rgba(126,247,196,0.45)";ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(0,0,r*0.82*pulse,0,Math.PI*2);ctx.stroke();
ctx.restore();
},

// ==============================================================================
// WORLD 3 ARCHITECTURAL PRIMITIVES (RỪNG ĐÁ KHUYỂN VƯƠNG)
// ==============================================================================
drawStoneMonolith(ctx,x,y,r,t,runeCol="#5aa9e6",heightMult=1.65) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.beginPath();ctx.ellipse(10,8,r*1.15,r*0.52,0.2,0,Math.PI*2);ctx.fill();
// Jagged carved grey-slate stone pillar
const sg=ctx.createLinearGradient(-r,-r*heightMult,r,r*0.4);
sg.addColorStop(0,"#718093");sg.addColorStop(0.5,"#47525e");sg.addColorStop(1,"#20262e");
ctx.fillStyle=sg;
ctx.beginPath();
ctx.moveTo(-r*0.85,6);
ctx.lineTo(-r*0.65,-r*heightMult*0.85);
ctx.lineTo(-r*0.15,-r*heightMult);
ctx.lineTo(r*0.55,-r*heightMult*0.78);
ctx.lineTo(r*0.85,6);
ctx.quadraticCurveTo(0,r*0.45,-r*0.85,6);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#181d24";ctx.lineWidth=1.8;ctx.stroke();
// Glowing etched beast-path rune on face
ctx.strokeStyle=runeCol;ctx.globalAlpha=0.45 + Math.sin(t*2.6 + x*0.02)*0.25;ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(-r*0.2,-r*heightMult*0.55);ctx.lineTo(0,-r*heightMult*0.75);ctx.lineTo(r*0.2,-r*heightMult*0.55);ctx.moveTo(0,-r*heightMult*0.75);ctx.lineTo(0,-r*0.2);ctx.stroke();
ctx.restore();
},

drawDogKingArena(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
// Deep shadow
ctx.fillStyle="rgba(0,0,0,0.52)";ctx.beginPath();ctx.ellipse(0,18,315,225,0,0,Math.PI*2);ctx.fill();
// Outer circular stone ring
ctx.fillStyle="#242c38";ctx.strokeStyle="#5aa9e6";ctx.lineWidth=3.2;
ctx.beginPath();ctx.ellipse(0,0,305,215,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Inner battle circle
ctx.fillStyle="#1b222c";ctx.strokeStyle="#85c1e9";ctx.lineWidth=1.8;
ctx.beginPath();ctx.ellipse(0,0,245,172,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Radial carved stone lines
ctx.strokeStyle="rgba(90,169,230,0.22)";ctx.lineWidth=1.4;
for (let i=0;i<12;i++) {
const a=(i*Math.PI)/6;
ctx.beginPath();ctx.moveTo(Math.cos(a)*85,Math.sin(a)*60);ctx.lineTo(Math.cos(a)*245,Math.sin(a)*172);ctx.stroke();
}
// Rotating Beast-Enslavement Array at center
ctx.save();ctx.scale(1,0.7);ctx.rotate(t*0.35);
ctx.strokeStyle="rgba(90,169,230,0.65)";ctx.lineWidth=2.2;
ctx.beginPath();ctx.arc(0,0,100,0,Math.PI*2);ctx.stroke();ctx.restore();
// 10 perimeter carved stone columns
for (let i=0;i<10;i++) {
const a=(i*Math.PI*2)/10;
if (Math.abs(a - Math.PI/2)<0.42) continue; // Keep south entrance clear!
const px=Math.cos(a)*278;const py=Math.sin(a)*195;
this.drawStoneMonolith(ctx,px,py,19,t,"#5aa9e6",1.85);
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText("🔵 ĐẤU TRƯỜNG THẠCH TRỤ KHUYỂN VƯƠNG",1,-228);
ctx.fillStyle="#85c1e9";ctx.fillText("🔵 ĐẤU TRƯỜNG THẠCH TRỤ KHUYỂN VƯƠNG",0,-229);
ctx.restore();
},

// ==============================================================================
// WORLD 4 ARCHITECTURAL PRIMITIVES (HOANG NGUYÊN BẠO VƯƠNG)
// ==============================================================================
drawLavaChasmRiver(ctx,w,yCenter,halfH,t) {
ctx.save();
// Jagged obsidian chasm rim
ctx.fillStyle="#1a0d0a";
ctx.fillRect(0,yCenter - halfH - 22,w,halfH*2 + 44);
// Molten magma gradient
const lg=ctx.createLinearGradient(0,yCenter - halfH,0,yCenter + halfH);
lg.addColorStop(0,"#8a1a08");
lg.addColorStop(0.25,"#e64819");
lg.addColorStop(0.5,"#ff9f43");
lg.addColorStop(0.75,"#e64819");
lg.addColorStop(1,"#7a1506");
ctx.fillStyle=lg;
ctx.fillRect(0,yCenter - halfH,w,halfH*2);
// Flowing magma veins & glowing embers
ctx.strokeStyle="rgba(255,240,160,0.55)";ctx.lineWidth=3.5;
for (let row=0;row<4;row++) {
const ry=yCenter - halfH*0.6 + row*(halfH*0.4);
ctx.beginPath();
for (let x=0;x<=w;x+=48) {
const wy=ry + Math.sin(x*0.012 - t*2.4 + row*1.5)*9;
if (x===0) ctx.moveTo(x,wy);else ctx.lineTo(x,wy);
}
ctx.stroke();
}
// Glowing cracked rims
ctx.strokeStyle="#ff5733";ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(0,yCenter - halfH);ctx.lineTo(w,yCenter - halfH);
ctx.moveTo(0,yCenter + halfH);ctx.lineTo(w,yCenter + halfH);ctx.stroke();
ctx.restore();
},

drawBaoKingFireAltar(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.55)";ctx.beginPath();ctx.ellipse(0,18,310,220,0,0,Math.PI*2);ctx.fill();
// Octagonal Obsidian Fire Dais
const drawOct=(rx,ry,fill,stroke,lw)=>{
ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=lw;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*rx;const py=Math.sin(a)*ry;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
};
drawOct(295,205,"#241412","#ff5733",3.2);
drawOct(242,168,"#1c0f0e","#ff9f43",1.8);
// Magma moat veins glowing inside platform
ctx.save();ctx.scale(1,0.7);ctx.rotate(-t*0.4);
ctx.strokeStyle="rgba(255,107,53,0.72)";ctx.lineWidth=2.5;
ctx.beginPath();ctx.arc(0,0,126,0,Math.PI*2);ctx.stroke();ctx.restore();
// 6 Flaming Obsidian Fire Pillars around dais
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;
const px=Math.cos(a)*248;const py=Math.sin(a)*172;
this.drawIncenseBrazier(ctx,px,py,t,"#ff5733");
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText("🔴 ĐÀI HỎA TRÌ BẠO VƯƠNG",1,-220);
ctx.fillStyle="#ff8a65";ctx.fillText("🔴 ĐÀI HỎA TRÌ BẠO VƯƠNG",0,-221);
ctx.restore();
},

// ==============================================================================
// WORLD 5 ARCHITECTURAL PRIMITIVES (CỔ TỰ TÍN VƯƠNG)
// ==============================================================================
drawXinKingTempleHall(ctx,x,y,t,pillarLit) {
ctx.save();
// 2-tier Golden-Bronze Ancient Temple Foundation
this.drawStonePlatform(ctx,x - 360,y - 250,720,470,{
baseCol:"#241c0f",topCol:"#332815",edgeCol:pillarLit?"#ffd700" :"#8c7a56",tileSize:52,bevel:16
});
this.drawStonePlatform(ctx,x - 310,y - 210,620,390,{
baseCol:"#2b2110",topCol:"#3d3019",edgeCol:pillarLit?"#ffeaa7" :"#a39068",tileSize:44,bevel:10
});
// Grand 7-step staircase leading down to courtyard
this.drawGrandStaircase(ctx,x - 110,y + 215,220,130,7,{topCol:"#544428",riserCol:"#2b2110",trimCol:"#ffd700"});
// 6 Tall Cracked Golden Pillars
for (const [px,py] of [[x - 260,y - 160],[x + 260,y - 160],[x - 260,y - 10],[x + 260,y - 10],[x - 260,y + 135],[x + 260,y + 135]]) {
this.drawOrnateBronzePillar(ctx,px,py,t,1.02,pillarLit?"#ffd700" :"#9c8a62");
}
// Central Carved "Tín" Inheritance Altar
ctx.save();ctx.translate(x,y - 35);
ctx.fillStyle="#1f170b";ctx.strokeStyle=pillarLit?"#ffd700" :"#7d6e4e";ctx.lineWidth=2.6;
ctx.beginPath();ctx.ellipse(0,0,96,64,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.font="bold 40px Georgia";ctx.textAlign="center";
ctx.fillStyle=pillarLit?"rgba(255,215,0,0.45)" :"rgba(150,135,100,0.22)";
ctx.fillText("信",0,14);
ctx.restore();
ctx.font="bold 13.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText("🟡 CHÍNH ĐIỆN TRUYỀN THỪA TÍN VƯƠNG",x + 1,y - 262);
ctx.fillStyle=pillarLit?"#ffd700" :"#c8c2b6";ctx.fillText("🟡 CHÍNH ĐIỆN TRUYỀN THỪA TÍN VƯƠNG",x,y - 263);
ctx.restore();
},

drawTortoiseLandSpirit(ctx,x,y,t) {
const bob=Math.sin(t*2)*2.2;
ctx.save();ctx.translate(x,y + bob);
// Celestial Golden Immortal Mist Halo
const g=ctx.createRadialGradient(0,0,6,0,0,46 + Math.sin(t*2.6)*3);
g.addColorStop(0,"rgba(255,232,140,0.58)");g.addColorStop(0.55,"rgba(126,247,240,0.24)");g.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,48,0,Math.PI*2);ctx.fill();
// Ground Shadow & Rotating Spirit Ring
ctx.fillStyle="rgba(0,0,0,0.46)";ctx.beginPath();ctx.ellipse(0,14,27,10,0,0,Math.PI*2);ctx.fill();
ctx.save();ctx.translate(0,14);ctx.scale(1,0.36);ctx.rotate(t*0.45);
ctx.strokeStyle="rgba(255,215,0,0.5)";ctx.lineWidth=1.4;
ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.stroke();ctx.restore();
// Sturdy Bronze-Jade Tortoise Legs & Tail
ctx.fillStyle="#6b5c3e";ctx.strokeStyle="#2b210c";ctx.lineWidth=1.2;
for (const [lx,ly] of [[-16,9],[-6,12],[8,12],[16,9]]) {
ctx.beginPath();ctx.ellipse(lx,ly,4.8,3.8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
}
// Ornate Domed Bronze-Gold Carapace
const sh=ctx.createRadialGradient(-4,-9,3,0,2,27);
sh.addColorStop(0,"#fff5c2");sh.addColorStop(0.38,"#d4af37");sh.addColorStop(0.75,"#78591c");sh.addColorStop(1,"#261b08");
ctx.fillStyle=sh;
ctx.beginPath();ctx.ellipse(0,5,25,18,0,Math.PI,0);ctx.quadraticCurveTo(0,11,-25,5);ctx.closePath();ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;ctx.stroke();
// Hexagonal Carved Carapace Pattern & Glowing Turquoise Immortal Essence Cracks
ctx.strokeStyle="#7ef7f0";ctx.lineWidth=1.35;
ctx.beginPath();
ctx.moveTo(-7,-5);ctx.lineTo(0,-10);ctx.lineTo(7,-5);ctx.lineTo(7,2);ctx.lineTo(0,6);ctx.lineTo(-7,2);ctx.closePath();
ctx.moveTo(-7,-5);ctx.lineTo(-17,-2);ctx.moveTo(7,-5);ctx.lineTo(17,-2);ctx.moveTo(0,-10);ctx.lineTo(0,-14);
ctx.stroke();
// Ancient Wise Tortoise Neck & Head
const hg=ctx.createRadialGradient(24,-1,1,24,1,10);
hg.addColorStop(0,"#d9c598");hg.addColorStop(0.65,"#917e52");hg.addColorStop(1,"#3d331d");
ctx.fillStyle=hg;ctx.strokeStyle="#42351a";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(25,0,9.5,6.5,0.08,0,Math.PI*2);ctx.fill();ctx.stroke();
// Wise Luminous Turquoise Eye & White Eyebrow
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(28.5,-1.2,2.4,1.8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#38e8a8";ctx.beginPath();ctx.arc(29,-1.2,1.2,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(25.5,-3.6);ctx.quadraticCurveTo(28.5,-5.2,31.5,-3.2);ctx.stroke();
// Flowing Immortal White Beard & Jade Whiskers
const wv=Math.sin(t*2.4)*2;
ctx.strokeStyle="#f0f7ff";ctx.lineWidth=1.8;ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(27,5.5);ctx.quadraticCurveTo(30 + wv,13,22 + wv,18);
ctx.moveTo(29,4.5);ctx.quadraticCurveTo(34 + wv,11,29 + wv,16);
ctx.stroke();
ctx.restore();
},

drawHoundEmperor(ctx,x,y,t,col,facing) {
const breath=Math.sin(t*3.2)*0.8;
ctx.save();ctx.translate(x,y + breath);ctx.scale(facing==="left"? -1.48 :1.48,1.48);
// Ground Shadow & Beast Aura
const ag=ctx.createRadialGradient(0,0,4,0,0,26);
ag.addColorStop(0,"rgba(255,215,0,0.32)");ag.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=ag;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(0,0,0,0.48)";ctx.beginPath();ctx.ellipse(0,12,18,6.5,0,0,Math.PI*2);ctx.fill();
// Sweeping Bushy Tail
const wag=Math.sin(t*5)*3;
ctx.strokeStyle=col;ctx.lineWidth=3.6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-14,-1);ctx.quadraticCurveTo(-22,-8 + wag,-19,-15 + wag);ctx.stroke();
// Muscular Legs with Golden Paw Guards
ctx.strokeStyle="#261c12";ctx.lineWidth=3.8;
ctx.beginPath();ctx.moveTo(-10,4);ctx.lineTo(-12,12);ctx.moveTo(-5,5);ctx.lineTo(-6,12);ctx.moveTo(6,5);ctx.lineTo(7,12);ctx.moveTo(11,4);ctx.lineTo(13,12);ctx.stroke();
// Muscular Fur Body
const bg=ctx.createLinearGradient(-15,-9,15,9);
bg.addColorStop(0,col);bg.addColorStop(0.65,"#3d2c1b");bg.addColorStop(1,"#1c140c");
ctx.fillStyle=bg;ctx.strokeStyle="#ffd700";ctx.lineWidth=1.1;
ctx.beginPath();ctx.ellipse(0,0,16,9.5,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Spiked Royal Mane & Gold Battle Collar
ctx.fillStyle="#241910";ctx.strokeStyle="#ffd700";ctx.lineWidth=1.0;
ctx.beginPath();
ctx.moveTo(5,-9);ctx.lineTo(9,-14);ctx.lineTo(12,-9);ctx.lineTo(15,-12);ctx.lineTo(15,4);ctx.lineTo(6,6);ctx.closePath();ctx.fill();ctx.stroke();
// Fierce Hound Head, Pointed Ears & Snout
ctx.fillStyle=bg;
ctx.beginPath();ctx.ellipse(14.5,-5.5,7.2,5.6,0.1,0,Math.PI*2);ctx.fill();ctx.stroke();
// Ears
ctx.beginPath();ctx.moveTo(11,-10);ctx.lineTo(9,-16.5);ctx.lineTo(14.5,-11);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(14,-10);ctx.lineTo(16,-16);ctx.lineTo(18,-9.5);ctx.closePath();ctx.fill();ctx.stroke();
// Glowing Predator Eye & Sharp White Fangs
ctx.fillStyle="#ffe600";ctx.beginPath();ctx.arc(17.5,-6.5,1.9,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.moveTo(18,-2.5);ctx.lineTo(19,-0.2);ctx.lineTo(20,-2.5);ctx.closePath();ctx.fill();
ctx.restore();
},

// ==============================================================================
// WORLD 6 ARCHITECTURAL PRIMITIVES (CHIẾN TRƯỜNG NGOẠI VI TAM XOA SƠN)
// ==============================================================================
drawWarPavilionTent(ctx,x,y,t,opts={}) {
const roofA=opts.roofA||"#dfe6ed";
const roofB=opts.roofB||"#7c8c9e";
const trim=opts.trim||"#ffd700";
const wall=opts.wall||"#26303d";
const title=opts.title||"SOÁI TRƯỚNG";
ctx.save();ctx.translate(x,y);
// Ground drop shadow
ctx.fillStyle="rgba(0,0,0,0.48)";
ctx.beginPath();ctx.ellipse(10,16,94,54,0,0,Math.PI*2);ctx.fill();
// Stone base dais
ctx.fillStyle="#24201c";ctx.strokeStyle=trim;ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(0,10,88,48,0,0,Math.PI*2);ctx.fill();ctx.stroke();
// Tent cloth walls
ctx.fillStyle=wall;ctx.strokeStyle=trim;ctx.lineWidth=1.5;
ctx.fillRect(-72,-32,144,42);ctx.strokeRect(-72,-32,144,42);
// Open arched doorway
ctx.fillStyle="#0d0e14";
ctx.beginPath();ctx.moveTo(-22,10);ctx.lineTo(-22,-16);ctx.quadraticCurveTo(0,-28,22,-16);ctx.lineTo(22,10);ctx.closePath();ctx.fill();
ctx.strokeStyle=trim;ctx.stroke();
// Conical layered tent roof
const rg=ctx.createLinearGradient(0,-92,0,-26);
rg.addColorStop(0,roofA);rg.addColorStop(1,roofB);
ctx.fillStyle=rg;
ctx.beginPath();ctx.moveTo(-88,-28);ctx.quadraticCurveTo(-40,-58,0,-92);ctx.quadraticCurveTo(40,-58,88,-28);ctx.closePath();ctx.fill();
ctx.strokeStyle=trim;ctx.lineWidth=2.2;ctx.stroke();
// Roof rib seams
ctx.strokeStyle="rgba(255,255,255,0.28)";ctx.lineWidth=1.1;
for (const rx of [-50,-22,22,50]) {ctx.beginPath();ctx.moveTo(0,-90);ctx.lineTo(rx,-28);ctx.stroke();}
// Golden finial & fluttering pennant at apex
ctx.fillStyle=trim;ctx.beginPath();ctx.arc(0,-94,5,0,Math.PI*2);ctx.fill();
const wave=Math.sin(t*4 + x)*6;
ctx.fillStyle=trim;
ctx.beginPath();ctx.moveTo(0,-96);ctx.lineTo(32,-104 + wave);ctx.lineTo(26,-92 + wave);ctx.closePath();ctx.fill();
// Title banner
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(title,1,-108);
ctx.fillStyle=trim;ctx.fillText(title,0,-109);
ctx.restore();
},

drawWarBannerPole(ctx,x,y,t,flagCol="#b8860b",trimCol="#ffd700",charMark="正") {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.4)";ctx.beginPath();ctx.ellipse(8,6,14,6,0,0,Math.PI*2);ctx.fill();
// Stone anchor block
ctx.fillStyle="#453f38";ctx.strokeStyle="#8c7e6a";ctx.lineWidth=1.2;
ctx.fillRect(-8,-4,16,10);ctx.strokeRect(-8,-4,16,10);
// Tall spear shaft
ctx.strokeStyle="#7a6240";ctx.lineWidth=3.5;
ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-76);ctx.stroke();
// Spearhead
ctx.fillStyle="#e2e8f0";ctx.beginPath();ctx.moveTo(0,-88);ctx.lineTo(-4,-75);ctx.lineTo(4,-75);ctx.closePath();ctx.fill();
// Fluttering war banner
const w1=Math.sin(t*3.8 + x*0.03)*6;
const w2=Math.cos(t*4.2 + y*0.03)*5;
ctx.fillStyle=flagCol;ctx.strokeStyle=trimCol;ctx.lineWidth=1.4;
ctx.beginPath();
ctx.moveTo(2,-72);
ctx.quadraticCurveTo(22,-74 + w1,42,-68 + w2);
ctx.lineTo(36,-54 + w2);
ctx.lineTo(42,-40 + w2);
ctx.quadraticCurveTo(22,-46 + w1,2,-42);
ctx.closePath();ctx.fill();ctx.stroke();
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle=trimCol;
ctx.fillText(charMark,20,-52 + w1*0.5);
ctx.restore();
},

drawCampfire(ctx,x,y,t,flameCol="#ff6b35") {
ctx.save();ctx.translate(x,y);
const g=ctx.createRadialGradient(0,-6,4,0,-6,56 + Math.sin(t*7)*6);
g.addColorStop(0,flameCol==="#c56cf0"?"rgba(197,108,240,0.42)" :"rgba(255,130,45,0.42)");
g.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-6,58,0,Math.PI*2);ctx.fill();
// Ring of stones
ctx.fillStyle="#4f4842";
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4;
ctx.beginPath();ctx.arc(Math.cos(a)*16,Math.sin(a)*11,4.5,0,Math.PI*2);ctx.fill();
}
// Crossed charred logs
ctx.strokeStyle="#3d2414";ctx.lineWidth=4;
ctx.beginPath();ctx.moveTo(-12,-4);ctx.lineTo(12,4);ctx.moveTo(-12,4);ctx.lineTo(12,-4);ctx.stroke();
// Dancing fire tongues
const fh=18 + Math.sin(t*9 + x)*5;
ctx.fillStyle=flameCol;
ctx.beginPath();ctx.moveTo(-9,0);ctx.quadraticCurveTo(Math.sin(t*8)*4,-fh,0,-fh - 4);ctx.quadraticCurveTo(-Math.sin(t*7)*4,-fh*0.5,9,0);ctx.closePath();ctx.fill();
ctx.fillStyle="#fff2a6";ctx.beginPath();ctx.arc(0,-5,4.2,0,Math.PI*2);ctx.fill();
ctx.restore();
},

drawWatchtowerPlatform(ctx,x,y,t,trimCol="#ffd700",label="ĐÀI KỲ TRẬN PHÁP") {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.48)";ctx.fillRect(-68,-44,146,102);
// Timber/Stone Tower Base
ctx.fillStyle="#33291e";ctx.strokeStyle=trimCol;ctx.lineWidth=2.2;
ctx.fillRect(-64,-48,128,88);ctx.strokeRect(-64,-48,128,88);
// Inner Command Platform
ctx.fillStyle="#453728";ctx.fillRect(-54,-38,108,68);
ctx.strokeStyle="rgba(255,215,0,0.32)";ctx.lineWidth=1;ctx.strokeRect(-54,-38,108,68);
// Corner Watch Posts
for (const [cx,cy] of [[-58,-42],[58,-42],[-58,34],[58,34]]) {
ctx.fillStyle="#5c4932";ctx.strokeStyle=trimCol;ctx.lineWidth=1.4;
ctx.fillRect(cx - 5,cy - 22,10,26);ctx.strokeRect(cx - 5,cy - 22,10,26);
}
// Formation Flag Stand at Center
ctx.save();ctx.rotate(t*0.5);
ctx.strokeStyle=trimCol;ctx.lineWidth=1.6;
ctx.beginPath();ctx.arc(0,-4,24,0,Math.PI*2);ctx.stroke();ctx.restore();
ctx.font="bold 10.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(label,1,-56);
ctx.fillStyle=trimCol;ctx.fillText(label,0,-57);
ctx.restore();
},

drawSanChaCliffArch(ctx,x,y,t,riftOpen=false) {
ctx.save();ctx.translate(x,y);
// Twin jagged San Cha Mountain cliff peaks framing North Entrance
ctx.fillStyle="#241d1a";ctx.strokeStyle="#594a3d";ctx.lineWidth=2.5;
ctx.beginPath();ctx.moveTo(-420,90);ctx.lineTo(-340,-95);ctx.lineTo(-220,-50);ctx.lineTo(-140,85);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(420,90);ctx.lineTo(340,-95);ctx.lineTo(220,-50);ctx.lineTo(140,85);ctx.closePath();ctx.fill();ctx.stroke();
// Blessed Land Boundary Barrier OR Shattered Sky Rift!
if (riftOpen) {
const rg=ctx.createRadialGradient(0,-15,12,0,-15,155 + Math.sin(t*5)*10);
rg.addColorStop(0,"rgba(255,255,235,0.96)");
rg.addColorStop(0.4,"rgba(255,230,120,0.62)");
rg.addColorStop(0.75,"rgba(255,190,60,0.20)");
rg.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=rg;ctx.beginPath();ctx.arc(0,-15,165,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=3;
ctx.beginPath();ctx.ellipse(0,-15,105,36,0,0,Math.PI*2);ctx.stroke();
ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#fff2a6";
ctx.fillText("🌟 LỖ THỦNG MÀNG THAI PHÚC ĐỊA (THÁI CỔ QUANG QUYỀN)",0,-68);
} else {
ctx.strokeStyle="rgba(255,230,150,0.42)";ctx.lineWidth=4;
ctx.beginPath();ctx.moveTo(-165,-10);ctx.quadraticCurveTo(0,-55,165,-10);ctx.stroke();
ctx.font="bold 12px Georgia";ctx.textAlign="center";ctx.fillStyle="#d4af37";
ctx.fillText("⛰️ Màng Thai Đỉnh Tam Xoa Sơn (Sắp Hủy Diệt)",0,-48);
}
ctx.restore();
},

drawWhiteApePortalAndArmy(ctx,x,y,apes,t) {
ctx.save();
// Spinning Black Hole Portal opened by Thiết Bạch Kỳ's Third Eye!
ctx.save();ctx.translate(x,y);ctx.rotate(t*3.2);
const pg=ctx.createRadialGradient(0,0,6,0,0,58);
pg.addColorStop(0,"#030306");pg.addColorStop(0.55,"#3b1a5e");pg.addColorStop(1,"rgba(183,92,255,0)");
ctx.fillStyle=pg;ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#e0b3ff";ctx.lineWidth=2.6;
ctx.beginPath();ctx.arc(0,0,42,0,Math.PI*2);ctx.stroke();
ctx.restore();
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#e0b3ff";
ctx.fillText("🌀 Lỗ Đen Đại Quân Vượn Trắng (Thiết Bạch Kỳ)",x,y - 60);
// White Apes pouring out!
for (const a of apes) {
ctx.fillStyle="rgba(0,0,0,0.38)";ctx.beginPath();ctx.ellipse(a.x,a.y + 9,12,5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#eef4fa";ctx.beginPath();ctx.arc(a.x,a.y,9.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#8da1b2";ctx.lineWidth=1.2;ctx.stroke();
ctx.fillStyle="#ff3b30";ctx.fillRect(a.x + 2.5,a.y - 3,2.5,2.5);
}
ctx.restore();
},

drawShatteredBronzeRoofCrater(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
// Glowing Immemorial Light shaft pouring down into the shattered hall!
const g=ctx.createRadialGradient(0,0,18,0,0,220 + Math.sin(t*6)*12);
g.addColorStop(0,"rgba(255,255,235,0.92)");
g.addColorStop(0.38,"rgba(255,235,140,0.48)");
g.addColorStop(0.72,"rgba(255,205,70,0.16)");
g.addColorStop(1,"rgba(255,205,70,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,235,0,Math.PI*2);ctx.fill();
// Jagged bronze & stone rubble chunks around the blast crater
for (let i=0;i<14;i++) {
const a=(i*Math.PI*2)/14;
const dist=135 + (i % 3)*28;
const rx=Math.cos(a)*dist;
const ry=Math.sin(a)*(dist*0.76);
ctx.fillStyle=(i % 2===0)?"#4a3922" :"#2c2216";
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(rx - 10,ry - 4);ctx.lineTo(rx + 6,ry - 9);ctx.lineTo(rx + 12,ry + 5);ctx.lineTo(rx - 5,ry + 8);ctx.closePath();
ctx.fill();ctx.stroke();
}
ctx.restore();
},

drawJadeButterfly(ctx,x,y,scale,t) {
ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
const flap=Math.sin(t*11)*0.34;
const glow=ctx.createRadialGradient(0,0,2,0,0,32);
glow.addColorStop(0,"rgba(210,255,235,0.98)");
glow.addColorStop(0.48,"rgba(56,232,168,0.55)");
glow.addColorStop(1,"rgba(56,232,168,0)");
ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,32,0,Math.PI*2);ctx.fill();
for (const side of [-1,1]) {
ctx.save();ctx.scale(side*(0.82 + flap),1);
const wg=ctx.createLinearGradient(0,-14,21,13);
wg.addColorStop(0,"#ffffff");wg.addColorStop(0.42,"#5cf5b8");wg.addColorStop(1,"#0e5c3c");
ctx.fillStyle=wg;
ctx.beginPath();ctx.moveTo(0,-2);ctx.bezierCurveTo(9,-20,25,-15,19,0);ctx.bezierCurveTo(14,5,4,2,0,-2);ctx.fill();
ctx.beginPath();ctx.moveTo(0,1);ctx.bezierCurveTo(13,2,18,14,6,14);ctx.bezierCurveTo(2,12,1,6,0,1);ctx.fill();
ctx.strokeStyle="#eafff5";ctx.lineWidth=1;ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,0.65)";ctx.lineWidth=0.6;
ctx.beginPath();ctx.moveTo(2,-2);ctx.quadraticCurveTo(10,-9,16,-6);ctx.moveTo(2,2);ctx.quadraticCurveTo(8,7,11,9);ctx.stroke();
ctx.restore();
}
ctx.fillStyle="#eafff5";ctx.beginPath();ctx.ellipse(0,0,2.2,8.5,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#7ef7c4";ctx.lineWidth=0.9;
ctx.beginPath();ctx.moveTo(-1,-8);ctx.quadraticCurveTo(-5,-14,-7,-13);ctx.moveTo(1,-8);ctx.quadraticCurveTo(5,-14,7,-13);ctx.stroke();
ctx.restore();
},

// ==============================================================================
// WORLD 7 ARCHITECTURAL PRIMITIVES (ĐỈNH NÚI ĐÃNG HỒN & ĐÃNG HỒN CUNG)
// ==============================================================================
drawCrystalSpire(ctx,x,y,r,t,col="#ff85d5",tallMult=1.85) {
ctx.save();ctx.translate(x,y);
// Soft crystal ground reflection & shadow
ctx.fillStyle="rgba(0,0,0,0.38)";
ctx.beginPath();ctx.ellipse(8,10,r*1.15,r*0.48,0.15,0,Math.PI*2);ctx.fill();
const gl=ctx.createRadialGradient(0,-r*0.6,2,0,-r*0.6,r*1.65);
gl.addColorStop(0,col==="#ff85d5"?"rgba(255,133,213,0.32)" :"rgba(197,108,240,0.32)");
gl.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,-r*0.6,r*1.65,0,Math.PI*2);ctx.fill();

// Secondary side crystal shard
ctx.fillStyle=col==="#ff85d5"?"#b83b92" :"#6c2ea8";
ctx.strokeStyle="#ffe6f7";ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(r*0.2,4);ctx.lineTo(r*0.95,-r*tallMult*0.62);ctx.lineTo(r*0.72,6);ctx.closePath();ctx.fill();ctx.stroke();

// Main faceted crystal spire
const cg=ctx.createLinearGradient(-r*0.7,-r*tallMult,r*0.7,r*0.3);
cg.addColorStop(0,"#ffffff");
cg.addColorStop(0.28,col);
cg.addColorStop(0.75,col==="#ff85d5"?"#9c2978" :"#582191");
cg.addColorStop(1,"#2b0d33");
ctx.fillStyle=cg;
ctx.beginPath();
ctx.moveTo(0,-r*tallMult);
ctx.lineTo(r*0.72,-r*0.25);
ctx.lineTo(r*0.48,8);
ctx.lineTo(-r*0.48,8);
ctx.lineTo(-r*0.72,-r*0.25);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#ffe6f7";ctx.lineWidth=1.4;ctx.stroke();

// Inner facet highlight ridge
ctx.strokeStyle="rgba(255,255,255,0.62)";ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(0,-r*tallMult);ctx.lineTo(-r*0.14,-r*0.2);ctx.lineTo(-r*0.48,8);ctx.stroke();
ctx.restore();
},

drawCrystalLantern(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
const g=ctx.createRadialGradient(0,-26,2,0,-26,48 + Math.sin(t*4 + x)*5);
g.addColorStop(0,"rgba(255,175,235,0.52)");g.addColorStop(1,"rgba(255,133,213,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-26,50,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#45214a";ctx.strokeStyle="#ffb8e6";ctx.lineWidth=1.3;
ctx.fillRect(-7,-2,14,10);ctx.fillRect(-4,-21,8,19);
ctx.fillStyle="#ff9be0";
ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(7,-26);ctx.lineTo(0,-19);ctx.lineTo(-7,-26);ctx.closePath();ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.1;ctx.stroke();
ctx.restore();
},

drawNineTailedFoxStatue(ctx,x,y,facing=1) {
ctx.save();ctx.translate(x,y);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.beginPath();ctx.ellipse(0,14,28,12,0,0,Math.PI*2);ctx.fill();
// Pink-marble carved pedestal
ctx.fillStyle="#4a224d";ctx.strokeStyle="#ffb8e6";ctx.lineWidth=1.6;
ctx.fillRect(-24,0,48,16);ctx.strokeRect(-24,0,48,16);
ctx.scale(facing,1);
// Fan of crystalline fox tails behind statue
ctx.fillStyle="#d472b8";ctx.strokeStyle="#ffe6f7";ctx.lineWidth=1;
for (let i=-2;i<=2;i++) {
ctx.save();ctx.translate(-8,-12);ctx.rotate(-0.45 + i*0.24);
ctx.beginPath();ctx.ellipse(-10,-8,14,4.5,-0.3,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.restore();
}
// Seated graceful white-pink jade fox body & head
const fg=ctx.createLinearGradient(-10,-36,12,2);
fg.addColorStop(0,"#fff0fa");fg.addColorStop(0.55,"#e89fd0");fg.addColorStop(1,"#782e69");
ctx.fillStyle=fg;
ctx.beginPath();ctx.ellipse(0,-13,12,15,0.1,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.arc(6,-29,8.5,0,Math.PI*2);ctx.fill();ctx.stroke();
// Twin pointed fox ears
ctx.beginPath();ctx.moveTo(1,-35);ctx.lineTo(-2,-46);ctx.lineTo(5,-37);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(7,-36);ctx.lineTo(10,-46);ctx.lineTo(12,-35);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(10,-30,2,0,Math.PI*2);ctx.fill();
ctx.restore();
},

drawDangHunPalace(ctx,x,y,t) {
ctx.save();
// 2-tier Crystal Palace Foundation Platform
this.drawStonePlatform(ctx,x - 360,y - 190,720,390,{
baseCol:"#2e1036",topCol:"#47194f",edgeCol:"#ffb8e6",gridCol:"rgba(255,184,230,0.14)",tileSize:48,bevel:16
});
this.drawStonePlatform(ctx,x - 310,y - 155,620,320,{
baseCol:"#3b1442",topCol:"#571e60",edgeCol:"#ffd700",gridCol:"rgba(255,215,0,0.12)",tileSize:44,bevel:10
});

// Grand 8-Step Pink Crystal Staircase leading down to Summit Altar
this.drawGrandStaircase(ctx,x - 115,y + 195,230,145,8,{
topCol:"#7a2d7c",riserCol:"#38123d",trimCol:"#ffb8e6"
});

// Palace Main Facade & Double-Eaved Upturned Crystal Roof!
ctx.save();ctx.translate(x,y - 50);
// Palace rear wall & arched crimson-jade double gates
ctx.fillStyle="#2e1038";ctx.strokeStyle="#ffd700";ctx.lineWidth=2.4;
ctx.fillRect(-230,-95,460,150);ctx.strokeRect(-230,-95,460,150);
// Glowing inner sanctum doors
const doorG=ctx.createLinearGradient(0,-55,0,55);
doorG.addColorStop(0,"#ff85d5");doorG.addColorStop(1,"#4a1452");
ctx.fillStyle=doorG;
ctx.beginPath();ctx.moveTo(-58,55);ctx.lineTo(-58,-28);ctx.quadraticCurveTo(0,-66,58,-28);ctx.lineTo(58,55);ctx.closePath();ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=2.5;ctx.stroke();

// 6 Glowing Crystal Palace Columns along veranda
for (const px of [-205,-125,-72,72,125,205]) {
const cg=ctx.createLinearGradient(px - 10,0,px + 10,0);
cg.addColorStop(0,"#5e1b66");cg.addColorStop(0.5,"#ffb8e6");cg.addColorStop(1,"#3b1042");
ctx.fillStyle=cg;ctx.fillRect(px - 10,-92,20,148);
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.2;ctx.strokeRect(px - 10,-92,20,148);
}

// Lower Sweeping Palace Roof Eaves
const r1=ctx.createLinearGradient(0,-152,0,-88);
r1.addColorStop(0,"#ff9be0");r1.addColorStop(0.5,"#9c2978");r1.addColorStop(1,"#3d1145");
ctx.fillStyle=r1;
ctx.beginPath();ctx.moveTo(-290,-86);ctx.quadraticCurveTo(-245,-118,-210,-142);ctx.lineTo(210,-142);ctx.quadraticCurveTo(245,-118,290,-86);ctx.closePath();
ctx.fill();ctx.strokeStyle="#ffd700";ctx.lineWidth=2.4;ctx.stroke();

// Upper Second-Tier Imperial Roof
const r2=ctx.createLinearGradient(0,-225,0,-142);
r2.addColorStop(0,"#ffe0f7");r2.addColorStop(0.45,"#c43b9a");r2.addColorStop(1,"#571863");
ctx.fillStyle=r2;
ctx.beginPath();ctx.moveTo(-205,-142);ctx.quadraticCurveTo(-150,-185,0,-222);ctx.quadraticCurveTo(150,-185,205,-142);ctx.closePath();
ctx.fill();ctx.strokeStyle="#ffd700";ctx.lineWidth=2.6;ctx.stroke();

// Radiant Golden-Pink Pearl Finial atop Roof Ridge
const pG=ctx.createRadialGradient(0,-232,3,0,-232,34 + Math.sin(t*4)*5);
pG.addColorStop(0,"#ffffff");pG.addColorStop(0.4,"#ffd700");pG.addColorStop(1,"rgba(255,133,213,0)");
ctx.fillStyle=pG;ctx.beginPath();ctx.arc(0,-232,36,0,Math.PI*2);ctx.fill();

// Imperial Gold Plaque
ctx.fillStyle="#240b2b";ctx.strokeStyle="#ffd700";ctx.lineWidth=2.2;
ctx.fillRect(-86,-126,172,28);ctx.strokeRect(-86,-126,172,28);
ctx.font="bold 14px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText("ĐÃNG HỒN CUNG",0,-107);
ctx.restore();
ctx.restore();
},

drawCrystalSummitAltar(ctx,x,y,t) {
ctx.save();ctx.translate(x,y);
// Radiant Pink Soul-Shaking Mountain Pulse Waves
for (let wv=0;wv<2;wv++) {
const p=((t*0.35 + wv*0.5) % 1);
ctx.strokeStyle=`rgba(255,155,224,${(1 - p)*0.48})`;ctx.lineWidth=2.5;
ctx.beginPath();ctx.ellipse(0,0,160 + p*240,115 + p*175,0,0,Math.PI*2);ctx.stroke();
}
ctx.fillStyle="rgba(0,0,0,0.48)";ctx.beginPath();ctx.ellipse(0,16,245,172,0,0,Math.PI*2);ctx.fill();
const drawOct=(rx,ry,fill,stroke,lw)=>{
ctx.fillStyle=fill;ctx.strokeStyle=stroke;ctx.lineWidth=lw;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*rx;const py=Math.sin(a)*ry;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
};
drawOct(238,164,"#47194f","#ffb8e6",3.0);
drawOct(194,132,"#592063","#ffd700",1.8);
// Spinning Hu Immortal Blessed Land Array
ctx.save();ctx.scale(1,0.68);ctx.rotate(t*0.38);
ctx.strokeStyle="rgba(255,215,0,0.72)";ctx.lineWidth=2.2;
ctx.beginPath();ctx.arc(0,0,118,0,Math.PI*2);ctx.stroke();ctx.restore();
ctx.font="bold 12.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText("🦊 ĐỈNH ĐÃNG HỒN SƠN • PHÚC ĐỊA HỒ TIÊN",1,-176);
ctx.fillStyle="#ffd1f2";ctx.fillText("🦊 ĐỈNH ĐÃNG HỒN SƠN • PHÚC ĐỊA HỒ TIÊN",0,-177);
ctx.restore();
}
};

// ==============================================================================
// 5 SEPARATE WORLDS METADATA (LOADED ONE WORLD AT A TIME ON TELEPORT!)
// ==============================================================================
global.ThreeKingsWorlds=global.ThreeKingsWorlds||{};
global.ThreeKingsWorlds.Arch=Arch;
})(window);
