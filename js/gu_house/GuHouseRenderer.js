(function (global) {
"use strict";

const _FORTRESS_CACHE=new Map();

function _drawFortressSprite(ctx,houseId) {
// Canvas is 160x160 centered at (80,86)
ctx.save();
ctx.translate(80,86);

if (houseId==="bach_cot_xa") {
// Ivory Bone War Chariot with twin bone wheels & ribcage armor rails
ctx.fillStyle="#242a30";ctx.strokeStyle="#dce8f2";ctx.lineWidth=2.2;
ctx.beginPath();ctx.moveTo(-42,16);ctx.lineTo(-48,-12);ctx.lineTo(0,-38);ctx.lineTo(48,-12);ctx.lineTo(42,16);ctx.closePath();ctx.fill();ctx.stroke();
// Twin glowing bone wheels
for (const side of [-1,1]) {
ctx.fillStyle="#3a434d";ctx.strokeStyle="#7ef7f0";ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(side*44,6,10,20,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#dce8f2";ctx.beginPath();ctx.arc(side*44,6,4.5,0,Math.PI*2);ctx.fill();
}
// Curved ivory ribcage battlements
ctx.strokeStyle="#f2f7fc";ctx.lineWidth=3.6;ctx.lineCap="round";
for (const ox of [-24,-10,10,24]) {
ctx.beginPath();ctx.moveTo(ox,14);ctx.quadraticCurveTo(ox*1.35,-12,ox*0.85,-28);ctx.stroke();
}
// Front skull prow
ctx.fillStyle="#ffffff";ctx.strokeStyle="#5c6875";ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(0,-34,9,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(-3,-35,2,0,Math.PI*2);ctx.arc(3,-35,2,0,Math.PI*2);ctx.fill();
} else if (houseId==="huyet_ha_xa") {
// Crimson Blood-River War Carriage surfing a surging wave of blood
const bg=ctx.createRadialGradient(0,4,10,0,4,56);
bg.addColorStop(0,"rgba(224,38,38,0.65)");bg.addColorStop(1,"rgba(90,8,14,0)");
ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(0,8,58,34,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#3b0c12";ctx.strokeStyle="#ff5252";ctx.lineWidth=2.4;
ctx.beginPath();ctx.moveTo(-46,18);ctx.lineTo(-50,-14);ctx.lineTo(0,-42);ctx.lineTo(50,-14);ctx.lineTo(46,18);ctx.closePath();ctx.fill();ctx.stroke();
// 4 Blood Crystal Turrets at corners
for (const [bx,by] of [[-42,-12],[42,-12],[-38,14],[38,14]]) {
ctx.fillStyle="#ff3b30";ctx.strokeStyle="#ffb8b8";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(bx,by - 18);ctx.lineTo(bx + 7,by);ctx.lineTo(bx,by + 6);ctx.lineTo(bx - 7,by);ctx.closePath();ctx.fill();ctx.stroke();
}
// Crimson canopy eaves
ctx.fillStyle="#7a121c";ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-40,-24);ctx.quadraticCurveTo(0,-48,40,-24);ctx.lineTo(32,-14);ctx.quadraticCurveTo(0,-30,-32,-14);ctx.closePath();ctx.fill();ctx.stroke();
} else if (houseId==="can_thuy_lau_dai") {
// Floating 2-Tier Jade-Blue Water Pavilion atop azure waves
ctx.fillStyle="rgba(56,180,235,0.28)";ctx.beginPath();ctx.ellipse(0,14,56,28,0,0,Math.PI*2);ctx.fill();
// Octagonal jade deck
ctx.fillStyle="#12384f";ctx.strokeStyle="#4ce6ff";ctx.lineWidth=2.4;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*48;const py=Math.sin(a)*32 + 4;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
// 4 Azure Jade Pillars
for (const px of [-34,-16,16,34]) {
ctx.fillStyle="#246e8f";ctx.fillRect(px - 3,-32,6,34);
}
// Sweeping curved blue-jade eaves roof
const rg=ctx.createLinearGradient(0,-66,0,-24);
rg.addColorStop(0,"#7ef7f0");rg.addColorStop(1,"#164e6b");
ctx.fillStyle=rg;ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-54,-24);ctx.quadraticCurveTo(-24,-46,0,-64);ctx.quadraticCurveTo(24,-46,54,-24);ctx.quadraticCurveTo(0,-34,-54,-24);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(0,-66,4.5,0,Math.PI*2);ctx.fill();
} else if (houseId==="dong_hai_long_cung") {
// Golden-Azure Dragon Palace with 4 dragon columns & imperial pearl
ctx.fillStyle="#0e2942";ctx.strokeStyle="#ffd700";ctx.lineWidth=2.6;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*54;const py=Math.sin(a)*35 + 4;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
for (const px of [-38,-18,18,38]) {
ctx.fillStyle="#d4af37";ctx.fillRect(px - 4,-34,8,38);
}
const rg=ctx.createLinearGradient(0,-72,0,-24);
rg.addColorStop(0,"#ffe066");rg.addColorStop(0.55,"#2585b8");rg.addColorStop(1,"#0e3454");
ctx.fillStyle=rg;ctx.strokeStyle="#ffd700";ctx.lineWidth=2.2;
ctx.beginPath();ctx.moveTo(-60,-24);ctx.quadraticCurveTo(-28,-48,0,-70);ctx.quadraticCurveTo(28,-48,60,-24);ctx.quadraticCurveTo(0,-36,-60,-24);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(0,-72,6,0,Math.PI*2);ctx.fill();
} else if (houseId==="chan_duong_lau") {
// Iconic 88-Angle Golden True Yang Pagoda Tower!
ctx.fillStyle="#3d2c0e";ctx.strokeStyle="#ffd700";ctx.lineWidth=2.8;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*56;const py=Math.sin(a)*36 + 6;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
// 2 Golden Pagoda Eaves Tiers
for (const [ry,rw,rh] of [[-22,58,24],[-46,42,24]]) {
const rg=ctx.createLinearGradient(0,ry - rh,0,ry);
rg.addColorStop(0,"#fff5b8");rg.addColorStop(1,"#a87719");
ctx.fillStyle=rg;ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-rw,ry);ctx.quadraticCurveTo(-rw*0.5,ry - rh*0.65,0,ry - rh);ctx.quadraticCurveTo(rw*0.5,ry - rh*0.65,rw,ry);ctx.quadraticCurveTo(0,ry - 8,-rw,ry);ctx.closePath();ctx.fill();ctx.stroke();
}
// Radiant Sun Emblem Spire
ctx.fillStyle="#fff5b8";ctx.beginPath();ctx.arc(0,-74,6.5,0,Math.PI*2);ctx.fill();
} else {
// Vô Cực Vạn Kiếm Tiên Điện — Violet-Ice Floating Sword Sanctuary
ctx.fillStyle="#180d2e";ctx.strokeStyle="#b75cff";ctx.lineWidth=2.6;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*58;const py=Math.sin(a)*36 + 5;
if (i===0) ctx.moveTo(px,py);else ctx.lineTo(px,py);
}
ctx.closePath();ctx.fill();ctx.stroke();
// Floating Immortal Swords flanking the palace
for (const [sx,sy] of [[-46,-28],[-32,-42],[32,-42],[46,-28]]) {
ctx.fillStyle="#e6f9ff";ctx.strokeStyle="#7ef7f0";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(sx,sy - 18);ctx.lineTo(sx + 4,sy + 8);ctx.lineTo(sx,sy + 14);ctx.lineTo(sx - 4,sy + 8);ctx.closePath();ctx.fill();ctx.stroke();
}
const rg=ctx.createLinearGradient(0,-74,0,-24);
rg.addColorStop(0,"#e6f9ff");rg.addColorStop(0.5,"#74b9ff");rg.addColorStop(1,"#2e1659");
ctx.fillStyle=rg;ctx.strokeStyle="#ffd700";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-56,-24);ctx.quadraticCurveTo(-24,-50,0,-72);ctx.quadraticCurveTo(24,-50,56,-24);ctx.quadraticCurveTo(0,-34,-56,-24);ctx.closePath();ctx.fill();ctx.stroke();
}
ctx.restore();
}

function getFortressSprite(houseId) {
let c=_FORTRESS_CACHE.get(houseId);
if (c) return c;
c=document.createElement("canvas");
c.width=160;c.height=160;
const sctx=c.getContext("2d");
_drawFortressSprite(sctx,houseId);
_FORTRESS_CACHE.set(houseId,c);
return c;
}

function renderGuHouseBack(ctx,houseSys,player,camera) {
if (!ctx|| !houseSys|| !houseSys.isBoarded|| !player) return;
const cfg=houseSys.getEquippedConfig();
if (!cfg) return;
const {tpl}=cfg;
const sx=Math.round(player.x - (camera?camera.x :0));
const sy=Math.round(player.y - (camera?camera.y :0));
const zH=Math.max(0,player.z||0);
const t=performance.now()*0.004;
const hover=Math.sin(t*2.4)*3.5;

ctx.save();
ctx.translate(sx,sy);

// Ground shadow beneath floating Gu House
ctx.fillStyle="rgba(0,0,0,0.42)";
ctx.beginPath();ctx.ellipse(0,24,56,22,0,0,Math.PI*2);ctx.fill();

// Rotating 4-Arc Dao Formation Ring under Fortress (ZERO setLineDash!)
ctx.save();
ctx.translate(0,14);ctx.scale(1,0.44);ctx.rotate(t*0.55);
ctx.strokeStyle=tpl.color;ctx.globalAlpha=0.62;ctx.lineWidth=2.6;
for (let k=0;k<4;k++) {
const a=k*Math.PI*0.5;
ctx.beginPath();ctx.arc(0,0,66,a,a + 1.05);ctx.stroke();
}
ctx.restore();

// Draw Pre-Cached Fortress Base Sprite (instant 144 FPS drawImage!)
const spr=getFortressSprite(tpl.id);
ctx.drawImage(spr,-80,-86 - zH + hover);
ctx.restore();
}

function renderGuHouseFront(ctx,houseSys,player,camera) {
if (!ctx|| !houseSys|| !houseSys.isBoarded|| !player) return;
const cfg=houseSys.getEquippedConfig();
if (!cfg) return;
const {tpl}=cfg;
const sx=Math.round(player.x - (camera?camera.x :0));
const sy=Math.round(player.y - (camera?camera.y :0));
const zH=Math.max(0,player.z||0);
const t=performance.now()*0.004;

ctx.save();
ctx.translate(sx,sy - zH);

// Translucent Protective Energy Dome around Gu House
const shPct=Math.max(0,Math.min(1,houseSys.shieldHp / Math.max(1,houseSys.maxShieldHp)));
ctx.strokeStyle=houseSys.hitFlashTimer>0?"#ffffff" :tpl.accent;
ctx.globalAlpha=houseSys.hitFlashTimer>0?0.92 :(0.32 + shPct*0.35);
ctx.lineWidth=houseSys.hitFlashTimer>0?3.4 :2.2;
ctx.beginPath();ctx.ellipse(0,-4,62,48,0,0,Math.PI*2);ctx.stroke();

if (houseSys.ultFlashTimer>0) {
const ur=64 + (1 - houseSys.ultFlashTimer/0.65)*140;
ctx.strokeStyle=tpl.color;ctx.globalAlpha=houseSys.ultFlashTimer;ctx.lineWidth=4;
ctx.beginPath();ctx.arc(0,-4,ur,0,Math.PI*2);ctx.stroke();
}

// Crisp Fortress Shield Bar right above the roof
ctx.globalAlpha=1;
const bw=86;const bh=6;const by=-78;
ctx.fillStyle="rgba(6,10,16,0.9)";ctx.fillRect(-bw/2 - 1,by - 1,bw + 2,bh + 2);
ctx.fillStyle=tpl.color;ctx.fillRect(-bw/2,by,bw*shPct,bh);
ctx.strokeStyle="#ffd700";ctx.lineWidth=1;ctx.strokeRect(-bw/2,by,bw,bh);
ctx.font="bold 10.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText(`🏛️ ${tpl.name} (${Math.round(shPct*100)}%)`,0,by - 5);

ctx.restore();
}

global.GuHouseRenderer={
getFortressSprite,
renderGuHouseBack,
renderGuHouseFront
};
})(window);
