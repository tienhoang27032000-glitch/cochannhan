(function (global) {
"use strict";

function renderBeastArmy(ctx,army,enemies,camera) {
if (!ctx|| !army) return;
const camX=camera?camera.x :0;
const camY=camera?camera.y :0;
const viewW=camera?camera.width :1280;
const viewH=camera?camera.height :720;
const t=performance.now()*0.005;
const form=army.getFormationInfo();

// 1. Render Active Enslavement Capture Beams (Golden Soul-Chain Tethers!)
if (army.enslaveBeams&&army.enslaveBeams.length>0) {
ctx.save();
for (let i=0;i<army.enslaveBeams.length;i++) {
const bm=army.enslaveBeams[i];
const ratio=Math.max(0,bm.life / bm.maxLife);
const x1=bm.x1 - camX;const y1=bm.y1 - camY;
const x2=bm.x2 - camX;const y2=bm.y2 - camY;
ctx.globalAlpha=ratio;
ctx.strokeStyle=bm.color;
ctx.lineWidth=4.5*ratio + 1.5;
ctx.beginPath();
ctx.moveTo(x1,y1);
const mx=(x1 + x2)*0.5 + Math.sin(t*14)*16;
const my=(y1 + y2)*0.5 - 18;
ctx.quadraticCurveTo(mx,my,x2,y2);
ctx.stroke();
// Expanding golden capture lotus ring around target
const ringR=14 + (1 - ratio)*46;
ctx.lineWidth=2.5;
ctx.beginPath();ctx.arc(x2,y2,ringR,0,Math.PI*2);ctx.stroke();
}
ctx.restore();
}

// 1B. Golden Capture-Ready Halo on Nearby Wounded Capturable Beasts (<=48% HP)
const plRef=army.game&&army.game.player;
if (plRef&&enemies&&Array.isArray(enemies.beasts)) {
ctx.save();
for (let ei=0;ei<enemies.beasts.length;ei++) {
const en=enemies.beasts[ei];
if (en.isDead||en.isHuman||en.isVenerable) continue;
if ((en.hp / Math.max(1,en.maxHp))>0.48) continue;
if (Math.hypot(en.x - plRef.x,en.y - plRef.y)>400) continue;
const ex=Math.round(en.x - camX);const ey=Math.round(en.y - camY);
if (ex< -60||ey< -60||ex>viewW + 60||ey>viewH + 60) continue;
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;ctx.globalAlpha=0.55 + Math.sin(t*5)*0.25;
ctx.beginPath();ctx.arc(ex,ey,(en.radius||16) + 9,0,Math.PI*2);ctx.stroke();
ctx.globalAlpha=0.95;ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText("⛓️ [H] Thu Thú!",ex,ey - (en.radius||16) - 24);
}
ctx.restore();
}

// 2. Render All Deployed Allied Beasts (reusing cached beast sprite renderer for 144 FPS!)
const units=army.activeUnits||[];
if (units.length===0) return;

const hasBeastDraw=Boolean(enemies&&typeof enemies._drawBeastArt==="function");
const compact=(camera&&camera.zoom<0.72)||(document.body&&document.body.classList.contains("mobile-ui"));

for (let i=0;i<units.length;i++) {
const u=units[i];
if (u.isDead) continue;
const sx=Math.round(u.x - camX);
const sy=Math.round(u.y - camY);
if (sx< -90||sy< -90||sx>viewW + 90||sy>viewH + 90) continue;

ctx.save();
ctx.translate(sx,sy);

// Allied Jade-Gold Enslavement Seal Ring under feet (ZERO setLineDash!)
const sealR=u.radius + 7;
ctx.strokeStyle=army.armyBuffTimer>0?"#ffd700" :form.color;
ctx.globalAlpha=army.armyBuffTimer>0?0.85 :0.55;
ctx.lineWidth=army.armyBuffTimer>0?2.4 :1.6;
ctx.beginPath();
ctx.ellipse(0,u.radius*0.72,sealR,sealR*0.42,0,0,Math.PI*2);
ctx.stroke();
ctx.globalAlpha=1;

// Draw Beast Art (leverages EnemyArtRenderer's cached sprites!)
if (hasBeastDraw) {
enemies._drawBeastArt(ctx,u,t);
} else {
ctx.fillStyle=u.color||"#38e8a8";
ctx.beginPath();ctx.arc(0,0,u.radius,0,Math.PI*2);ctx.fill();
}

// Hit flash overlay
if (u.hitFlashTimer>0) {
ctx.fillStyle="rgba(255,255,255,0.48)";
ctx.beginPath();ctx.arc(0,0,u.radius + 2,0,Math.PI*2);ctx.fill();
}

// Crisp Allied Emerald HP Bar + Tier Star
const barW=48;
const barH=5;
const barY=-u.radius - 16;
const pct=Math.max(0,Math.min(1,u.hp / Math.max(1,u.maxHp)));
ctx.fillStyle="rgba(6,10,14,0.88)";
ctx.fillRect(-barW/2 - 1,barY - 1,barW + 2,barH + 2);
ctx.fillStyle=army.armyBuffTimer>0?"#ffd700" :"#38e8a8";
ctx.fillRect(-barW/2,barY,barW*pct,barH);
ctx.strokeStyle="#7ef7c4";
ctx.lineWidth=0.8;
ctx.strokeRect(-barW/2,barY,barW,barH);

if (!compact) {
ctx.font="bold 10.5px Georgia";
ctx.textAlign="center";
ctx.fillStyle=u.tierColor||"#7ef7c4";
ctx.fillText(`${u.tierBadge} ${u.name}`,0,barY - 4);
}

ctx.restore();
}
}

global.BeastArmyRenderer={renderBeastArmy};
})(window);
