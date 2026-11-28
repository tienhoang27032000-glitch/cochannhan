(function (global) {
"use strict";

// ==============================================================================
// HIGH-CRAFT BALANCED XIANXIA / MANHUA CHARACTER ART RENDERER (v51)
// Harmonious, athletic Manhua proportions — neither bulky nor toothpick-thin:
// Defined shoulders, natural athletic waist, stately flowing Hanfu, expressive face.
// ==============================================================================

function _hexToRgb(hex) {
if (!hex||typeof hex!=="string"|| !hex.startsWith("#")) return null;
const clean=hex.slice(1);
const full=clean.length===3?clean.split("").map(c=>c + c).join("") :clean;
const n=parseInt(full,16);
if (isNaN(n)) return null;
return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}

function _shade(hex,delta,alpha=1) {
const c=_hexToRgb(hex);
if (!c) return hex;
const r=Math.max(0,Math.min(255,c.r + delta));
const g=Math.max(0,Math.min(255,c.g + delta));
const b=Math.max(0,Math.min(255,c.b + delta));
return alpha<1?`rgba(${r},${g},${b},${alpha})` :`rgb(${r},${g},${b})`;
}

function _roundRect(ctx,x,y,w,h,r) {
const rad=Math.min(r,w/2,h/2);
ctx.beginPath();
ctx.moveTo(x + rad,y);
ctx.lineTo(x + w - rad,y);
ctx.quadraticCurveTo(x + w,y,x + w,y + rad);
ctx.lineTo(x + w,y + h - rad);
ctx.quadraticCurveTo(x + w,y + h,x + w - rad,y + h);
ctx.lineTo(x + rad,y + h);
ctx.quadraticCurveTo(x,y + h,x,y + h - rad);
ctx.lineTo(x,y + rad);
ctx.quadraticCurveTo(x,y,x + rad,y);
ctx.closePath();
}

function _inferArchetype(skin) {
const hs=skin.hairStyle||"long_flowing";
const feat=skin.specialFeature||"";
const isFemale=Boolean(
skin.gender==="female"||
hs==="jade_hairpin"||
hs==="silver_long"||
hs==="star_crown"||
hs==="fairy_buns"||
skin.isFoxSpirit
);
const isArmored=Boolean(skin.isArmored||hs==="war_helm");
const isElder=Boolean(skin.hasBeard||hs==="elder_sage");
const isDemonic=Boolean(hs==="demonic_wild"||feat==="soul_shadows");
const isVenerable=Boolean(
feat==="red_lotus_halo"||
feat==="orbiting_stars"||
(feat==="soul_shadows"&&skin.id==="u_hon")||
skin.isVenerableSkin
);
return {isFemale,isArmored,isElder,isDemonic,isVenerable};
}

function drawCharacter(ctx,skinCfg,state={}) {
const skin=skinCfg||{};
const bobY=state.bobY||0;
const legOffset=state.legOffset||0;
const armSwing=state.armSwing||0;
const facing=state.facing||"down";
const isMoving=Boolean(state.isMoving||Math.abs(legOffset)>0.15);
const t=performance.now()*0.0036;
const breath=Math.sin(t*1.5)*0.6;
const by=bobY + breath;
const sway=Math.sin(t*1.9)*(isMoving?2.6 :1.15);

const robeMain=skin.robeColor||"#14171f";
const robeSub=skin.robeSecondary||_shade(robeMain,22);
const robeDark=_shade(robeMain,-24);
const trimCol=skin.trimColor||"#8a1c1c";
const beltCol=skin.beltColor||"#d4af37";
const hairCol=skin.hairColor||"#0c0e14";
const hairHi=_shade(hairCol,48);
const hairDark=_shade(hairCol,-22);
const skinCol=skin.skinTone||"#efd4b8";
const eyeCol=skin.eyeColor||"#121620";
const crownCol=skin.crownColor||"#d4af37";
const auraCol=skin.auraColor||"rgba(224,62,62,0.22)";
const partCol=skin.particleColor||trimCol;
const innerCollar=skin.innerCollarColor||"#f5efe6";
const feat=skin.specialFeature||"";
const hs=skin.hairStyle||"long_flowing";
const arch=_inferArchetype(skin);

// Balanced Heroic Manhua Proportions (fit, graceful, well-structured)
const shW=arch.isFemale?5.8 :(arch.isArmored?7.6 :6.8);    // shoulders half-width
const waistW=arch.isFemale?3.6 :(arch.isArmored?5.1 :4.4); // natural athletic waist
const hemW=arch.isFemale?8.8 :(arch.isArmored?8.4 :8.2);   // stately flowing robe hem
const shY=-8.6 + by;                                        // shoulder line
const waistY=-0.8 + by;                                     // natural waistline
const hemY=12.6 + by;                                       // ankle-length robe hem
const headCY=-15.4 + by;                                    // well-proportioned head center

ctx.save();

// ============================================================================
// 1. SOFT SPIRIT AURA & GROUND CONTACT SHADOW
// ============================================================================
const auraGrad=ctx.createRadialGradient(0,-4 + by,2,0,-4 + by,23 + Math.sin(t*1.6)*2.0);
auraGrad.addColorStop(0,auraCol);
auraGrad.addColorStop(0.58,auraCol);
auraGrad.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=auraGrad;
ctx.beginPath();ctx.ellipse(0,-3.5 + by,19,24,0,0,Math.PI*2);ctx.fill();

ctx.fillStyle="rgba(0,0,0,0.45)";
ctx.beginPath();ctx.ellipse(0,15.2,9.8,3.8,0,0,Math.PI*2);ctx.fill();

if (arch.isVenerable||feat==="light_sun_halo"||feat==="phoenix_halo") {
ctx.save();
ctx.translate(0,15.0);ctx.scale(1,0.36);ctx.rotate(t*0.55);
ctx.strokeStyle=crownCol;ctx.globalAlpha=0.45;ctx.lineWidth=1.3;
ctx.beginPath();ctx.arc(0,0,13.5,0,Math.PI*2);ctx.stroke();
ctx.restore();
}

// ============================================================================
// 2. SIGNATURE BACK-LAYER ARTIFACTS & HALOS
// ============================================================================
if (feat==="red_lotus_halo") {
ctx.save();ctx.translate(0,headCY);ctx.rotate(t*0.42);
ctx.strokeStyle="rgba(255,215,0,0.82)";ctx.lineWidth=1.05;
ctx.beginPath();ctx.arc(0,0,15.0,0,Math.PI*2);ctx.stroke();
for (let p=0;p<8;p++) {
ctx.save();ctx.rotate((p*Math.PI)/4);
const pGrad=ctx.createLinearGradient(0,-4.5,0,-16.0);
pGrad.addColorStop(0,"rgba(255,48,40,0.88)");pGrad.addColorStop(0.6,"rgba(255,140,40,0.92)");pGrad.addColorStop(1,"rgba(255,235,130,0.98)");
ctx.fillStyle=pGrad;
ctx.beginPath();ctx.moveTo(0,-5.0);ctx.quadraticCurveTo(3.4,-10.5,0,-16.0);ctx.quadraticCurveTo(-3.4,-10.5,0,-5.0);ctx.fill();
ctx.restore();
}
ctx.restore();
} else if (feat==="orbiting_stars") {
ctx.save();ctx.translate(0,headCY + 2);ctx.rotate(-t*0.35);
ctx.strokeStyle="rgba(126,247,240,0.62)";ctx.lineWidth=0.95;
ctx.beginPath();ctx.arc(0,0,15.5,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle="rgba(165,225,255,0.38)";ctx.lineWidth=0.75;
ctx.beginPath();
for (let i=0;i<6;i++) {
const a=(i*Math.PI)/3;const a2=((i + 2)*Math.PI)/3;
ctx.moveTo(Math.cos(a)*15.5,Math.sin(a)*15.5);ctx.lineTo(Math.cos(a2)*15.5,Math.sin(a2)*15.5);
}
ctx.stroke();ctx.restore();
} else if (feat==="light_sun_halo") {
ctx.save();ctx.translate(0,headCY);ctx.rotate(t*0.3);
const sg=ctx.createRadialGradient(0,0,4,0,0,16.5);
sg.addColorStop(0,"rgba(255,255,220,0.72)");sg.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=sg;ctx.beginPath();ctx.arc(0,0,16.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="rgba(255,235,140,0.78)";ctx.lineWidth=1.05;
for (let i=0;i<12;i++) {
const a=(i*Math.PI)/6;
ctx.beginPath();ctx.moveTo(Math.cos(a)*9,Math.sin(a)*9);ctx.lineTo(Math.cos(a)*(i%2===0?16.2 :12.8),Math.sin(a)*(i%2===0?16.2 :12.8));ctx.stroke();
}
ctx.restore();
} else if (feat==="soul_shadows") {
ctx.save();
for (const side of [-1,1]) {
for (let row=0;row<2;row++) {
const wv=Math.sin(t*2.5 + row*1.8 + side)*2.4;
const sy=-8.0 + row*6.5 + by;
const sx=side*6.5;
const g=ctx.createLinearGradient(sx,sy,side*18.5,sy - 1 + wv);
g.addColorStop(0,"rgba(88,35,155,0.88)");g.addColorStop(1,"rgba(185,120,255,0.18)");
ctx.strokeStyle=g;ctx.lineWidth=2.6 - row*0.35;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(side*13,sy - 4 + wv,side*18.5,sy - 1 + wv*1.2);ctx.stroke();
ctx.fillStyle="#ff5252";ctx.beginPath();ctx.arc(side*17.5,sy - 1 + wv*1.1,1.25,0,Math.PI*2);ctx.fill();
}
}
ctx.restore();
} else if (feat==="martial_flames") {
ctx.save();
for (let i=0;i<5;i++) {
const fx=-11 + i*5.5;const fh=8.5 + Math.sin(t*4.5 + i*1.4)*4.2;
const fg=ctx.createLinearGradient(fx,1 + by,fx,1 + by - fh);
fg.addColorStop(0,"rgba(255,95,25,0.78)");fg.addColorStop(0.55,"rgba(255,195,55,0.64)");fg.addColorStop(1,"rgba(255,245,170,0)");
ctx.fillStyle=fg;
ctx.beginPath();ctx.moveTo(fx - 3.0,1.5 + by);ctx.quadraticCurveTo(fx + Math.sin(t*5.5 + i)*1.8,-fh + by,fx + 3.0,1.5 + by);ctx.closePath();ctx.fill();
}
ctx.restore();
} else if (feat==="shark_fins") {
ctx.save();
for (const side of [-1,1]) {
ctx.fillStyle="#102238";ctx.strokeStyle="#4ce6ff";ctx.lineWidth=1.0;
ctx.beginPath();
ctx.moveTo(side*5.8,-8.5 + by);ctx.quadraticCurveTo(side*15.5,-13.5 + by,side*14,-3.5 + by);ctx.quadraticCurveTo(side*10.5,-0.5 + by,side*6,0.5 + by);
ctx.closePath();ctx.fill();ctx.stroke();
}
ctx.restore();
} else if (feat==="medicine_gourd") {
ctx.save();ctx.translate(9.0,-5.5 + by);ctx.rotate(0.42);
const gg=ctx.createRadialGradient(-1,-2,1,0,0,6.5);
gg.addColorStop(0,"#7ef7c4");gg.addColorStop(0.5,"#1e6b4d");gg.addColorStop(1,"#0c261c");
ctx.fillStyle=gg;ctx.strokeStyle="#d4af37";ctx.lineWidth=0.85;
ctx.beginPath();ctx.arc(0,2.8,3.8,0,Math.PI*2);ctx.arc(0,-2.6,2.5,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#e05252";ctx.fillRect(-1.8,-5.8,3.6,1.4);
ctx.restore();
} else if (feat==="destiny_song_notes") {
ctx.save();
ctx.strokeStyle="rgba(118,215,196,0.55)";ctx.lineWidth=1.15;
ctx.beginPath();ctx.ellipse(0,-5.5 + by,16.5 + Math.sin(t*2)*1.3,8.5,Math.sin(t*0.6)*0.2,0,Math.PI*2);ctx.stroke();
ctx.restore();
}

// ============================================================================
// 3. LIGHTWEIGHT CELESTIAL RIBBONS ONLY (NO BULKY CAPE HIDING THE WAIST!)
// ============================================================================
if (arch.isFemale||arch.isVenerable||feat==="destiny_song_notes") {
// Airy floating silk ribbon arcing cleanly away from the body so the waist stays crisp
ctx.save();
ctx.strokeStyle=trimCol;ctx.globalAlpha=0.68;ctx.lineWidth=1.65;ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-(shW + 1.2),shY + 0.8);
ctx.bezierCurveTo(-(shW + 7.2),shY - 2.5 + sway*0.4,-(shW + 8.0),2.0 + by - sway*0.35,-(hemW + 3.2),10.5 + by + sway*0.5);
ctx.moveTo(shW + 1.2,shY + 0.8);
ctx.bezierCurveTo(shW + 7.2,shY - 2.5 - sway*0.4,shW + 8.0,2.0 + by + sway*0.35,hemW + 3.2,10.5 + by - sway*0.5);
ctx.stroke();
ctx.strokeStyle="#ffffff";ctx.globalAlpha=0.32;ctx.lineWidth=0.6;ctx.stroke();
ctx.restore();
}

// ============================================================================
// 4. TAPERED BACK HAIR (TUCKED NARROWLY BEHIND SHOULDERS — NEVER WIDENS WAIST)
// ============================================================================
if (hs!=="war_helm"||arch.isFemale) {
ctx.save();
const hGrad=ctx.createLinearGradient(0,headCY - 3,0,8 + by);
hGrad.addColorStop(0,hairCol);
hGrad.addColorStop(0.65,hs==="silver_long"?"#d6ecff" :hairCol);
hGrad.addColorStop(1,hs==="silver_long"?"#a8d0f0" :hairDark);
ctx.fillStyle=hGrad;
const hairBot=(arch.isFemale||hs==="long_flowing"||hs==="demonic_wild"||hs==="immortal_lotus")?(5.8 + by) :(1.2 + by);
ctx.beginPath();
ctx.moveTo(-4.8,headCY - 1.2);
ctx.quadraticCurveTo(-5.4,-7 + by,-4.2 + sway*0.35,hairBot);
ctx.lineTo(-1.8 + sway*0.22,hairBot - 1.8);
ctx.lineTo(0 + sway*0.16,hairBot + 0.6);
ctx.lineTo(1.8 + sway*0.22,hairBot - 1.8);
ctx.lineTo(4.2 + sway*0.35,hairBot);
ctx.quadraticCurveTo(5.4,-7 + by,4.8,headCY - 1.2);
ctx.closePath();ctx.fill();
ctx.strokeStyle=hairHi;ctx.globalAlpha=0.22;ctx.lineWidth=0.6;
ctx.beginPath();
ctx.moveTo(-2.5,-10 + by);ctx.quadraticCurveTo(-2.8,-3 + by,-2.4 + sway*0.2,hairBot - 1.5);
ctx.moveTo(2.5,-10 + by);ctx.quadraticCurveTo(2.8,-3 + by,2.4 + sway*0.2,hairBot - 1.5);
ctx.stroke();
ctx.restore();
}

// ============================================================================
// 5. BOOTS & STRIDE
// ============================================================================
for (const [bx,off] of [[-2.9,legOffset*0.6],[2.9,-legOffset*0.6]]) {
ctx.fillStyle="#141820";
ctx.beginPath();ctx.ellipse(bx,13.6 + by + off,2.2,2.7,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=beltCol;ctx.lineWidth=0.72;ctx.stroke();
}

// ============================================================================
// 6. BALANCED HEROIC HANFU ROBE / WAR ARMOR (ATHLETIC V-TAPER & HOURGLASS)
// ============================================================================
// 6a. Pleated Inner Under-Skirt (Thường)
ctx.fillStyle=robeSub;
ctx.beginPath();
ctx.moveTo(-waistW,waistY);
ctx.lineTo(waistW,waistY);
ctx.quadraticCurveTo(hemW*0.88,5.5 + by,hemW + sway*0.24,hemY);
ctx.quadraticCurveTo(0,hemY + 2.0,-hemW + sway*0.24,hemY);
ctx.quadraticCurveTo(-hemW*0.88,5.5 + by,-waistW,waistY);
ctx.closePath();ctx.fill();

ctx.strokeStyle="rgba(0,0,0,0.22)";ctx.lineWidth=0.65;
for (const px of [-4.4,-2.1,2.1,4.4]) {
ctx.beginPath();ctx.moveTo(px*0.58,waistY + 2);ctx.lineTo(px*1.32 + sway*0.2,hemY);ctx.stroke();
}

// 6b. Sculpted Upper Torso & Flowing Outer Coat (Đại Tụ Sam)
const coatGrad=ctx.createLinearGradient(-shW,shY,shW,hemY);
coatGrad.addColorStop(0,robeSub);
coatGrad.addColorStop(0.45,robeMain);
coatGrad.addColorStop(1,robeDark);
ctx.fillStyle=coatGrad;
ctx.beginPath();
ctx.moveTo(-shW,shY);
ctx.lineTo(shW,shY);
ctx.quadraticCurveTo(shW*0.92,(shY + waistY)*0.5,waistW + 0.35,waistY);
ctx.quadraticCurveTo(hemW*0.86,5.2 + by,(hemW - 0.4) + sway*0.24,hemY - 0.5);
ctx.lineTo(2.4 + sway*0.16,hemY + 0.4);
ctx.lineTo(1.85,waistY + 2.0);
ctx.lineTo(-1.85,waistY + 2.0);
ctx.lineTo(-2.4 + sway*0.16,hemY + 0.4);
ctx.lineTo(-(hemW - 0.4) + sway*0.24,hemY - 0.5);
ctx.quadraticCurveTo(-hemW*0.86,5.2 + by,-(waistW + 0.35),waistY);
ctx.quadraticCurveTo(-shW*0.92,(shY + waistY)*0.5,-shW,shY);
ctx.closePath();ctx.fill();
ctx.strokeStyle="rgba(255,245,220,0.16)";ctx.lineWidth=0.75;ctx.stroke();

// Ornamental Embroidered Hem Trim
ctx.strokeStyle=trimCol;ctx.lineWidth=1.35;
ctx.beginPath();
ctx.moveTo(-(hemW - 0.7) + sway*0.24,hemY - 1.0);
ctx.quadraticCurveTo(0,hemY + 1.1,(hemW - 0.7) + sway*0.24,hemY - 1.0);
ctx.stroke();

// 6c. Layered Crossed-Collar Hanfu V-Lapel (Giao Lĩnh)
ctx.fillStyle=innerCollar;
ctx.beginPath();
ctx.moveTo(-3.6,shY);ctx.lineTo(0,shY + 4.8);ctx.lineTo(3.6,shY);
ctx.lineTo(2.1,shY);ctx.lineTo(0,shY + 2.8);ctx.lineTo(-2.1,shY);
ctx.closePath();ctx.fill();

ctx.fillStyle=trimCol;
ctx.beginPath();
ctx.moveTo(-4.8,shY);ctx.lineTo(0.9,waistY - 1.0);ctx.lineTo(-0.7,waistY - 0.4);ctx.lineTo(-6.0,shY);ctx.closePath();
ctx.moveTo(4.8,shY);ctx.lineTo(0.2,waistY - 2.3);ctx.lineTo(1.5,waistY - 1.6);ctx.lineTo(6.0,shY);ctx.closePath();
ctx.fill();

// 6d. Armored Pauldrons (Warriors) OR Vân Kiên Cloud Shawl (Females)
if (arch.isArmored) {
const pGrad=ctx.createLinearGradient(-shW - 2.2,shY - 1,shW + 2.2,shY + 4.2);
pGrad.addColorStop(0,crownCol);pGrad.addColorStop(0.5,robeSub);pGrad.addColorStop(1,crownCol);
ctx.fillStyle=pGrad;ctx.strokeStyle="#1a120a";ctx.lineWidth=0.75;
for (const side of [-1,1]) {
ctx.beginPath();
ctx.moveTo(side*3.8,shY - 0.8);
ctx.quadraticCurveTo(side*(shW + 2.2),shY - 1.3,side*(shW + 2.5),shY + 3.4);
ctx.quadraticCurveTo(side*(shW - 0.5),shY + 4.0,side*4.0,shY + 2.4);
ctx.closePath();ctx.fill();ctx.stroke();
}
ctx.fillStyle=crownCol;ctx.beginPath();ctx.arc(0,shY + 4.5,2.0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#fff5cc";ctx.lineWidth=0.55;ctx.stroke();
} else if (arch.isFemale) {
ctx.fillStyle=trimCol;ctx.globalAlpha=0.72;
ctx.beginPath();
ctx.moveTo(-(shW + 1.1),shY + 0.8);ctx.quadraticCurveTo(-4.2,shY + 3.5,-2.0,shY + 1.9);
ctx.quadraticCurveTo(0,shY + 4.1,2.0,shY + 1.9);
ctx.quadraticCurveTo(4.2,shY + 3.5,(shW + 1.1),shY + 0.8);
ctx.lineTo(shW,shY - 0.3);ctx.lineTo(-shW,shY - 0.3);ctx.closePath();ctx.fill();
ctx.globalAlpha=1;
}

// 6e. Embroidered Center Apron (Bế Tất) & Balanced Waistband + Jade Pendant
ctx.fillStyle=robeSub;
ctx.beginPath();
ctx.moveTo(-1.85,waistY + 1.5);ctx.lineTo(1.85,waistY + 1.5);
ctx.lineTo(2.75 + sway*0.16,hemY - 0.2);ctx.lineTo(-2.75 + sway*0.16,hemY - 0.2);
ctx.closePath();ctx.fill();
ctx.strokeStyle=beltCol;ctx.lineWidth=0.72;ctx.stroke();
ctx.fillStyle=trimCol;
ctx.beginPath();ctx.moveTo(sway*0.1,waistY + 5.0);ctx.lineTo(1.3 + sway*0.1,waistY + 6.8);ctx.lineTo(sway*0.1,waistY + 8.6);ctx.lineTo(-1.3 + sway*0.1,waistY + 6.8);ctx.closePath();ctx.fill();

const bGrad=ctx.createLinearGradient(-waistW - 0.7,waistY - 1.1,waistW + 0.7,waistY + 1.4);
bGrad.addColorStop(0,_shade(beltCol,-22));bGrad.addColorStop(0.5,beltCol);bGrad.addColorStop(1,_shade(beltCol,-22));
ctx.fillStyle=bGrad;
_roundRect(ctx,-(waistW + 0.7),waistY - 1.1,(waistW + 0.7)*2,2.4,1.1);
ctx.fill();
ctx.fillStyle=trimCol;ctx.beginPath();ctx.arc(0,waistY + 0.1,1.75,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#fff5d6";ctx.lineWidth=0.6;ctx.stroke();

ctx.strokeStyle=partCol;ctx.lineWidth=1.0;ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(2.3,waistY + 1.3);ctx.quadraticCurveTo(3.2 + sway*0.2,waistY + 5.8,2.8 + sway*0.34,waistY + 9.8);
ctx.moveTo(-2.3,waistY + 1.3);ctx.quadraticCurveTo(-3.1 + sway*0.15,waistY + 4.8,-2.6 + sway*0.28,waistY + 8.2);
ctx.stroke();

// ============================================================================
// 7. GRACEFUL XIANXIA SLEEVES & HANDS
// ============================================================================
const drawSleeve=(side,swing)=>{
ctx.save();
const slGrad=ctx.createLinearGradient(side*shW,shY,side*(shW + 3.6),3.5 + by);
slGrad.addColorStop(0,robeMain);slGrad.addColorStop(1,robeSub);
ctx.fillStyle=slGrad;
ctx.beginPath();
ctx.moveTo(side*(shW - 0.3),shY + 0.3);
ctx.quadraticCurveTo(side*(shW + 3.3),shY + 3.8 + swing*0.38,side*(shW + 3.6),3.0 + by + swing*0.75);
ctx.quadraticCurveTo(side*(shW + 1.4),5.0 + by + swing*0.72,side*(waistW + 1.8),3.4 + by + swing*0.6);
ctx.quadraticCurveTo(side*(shW - 0.7),shY + 4.5,side*(shW - 0.3),shY + 0.3);
ctx.closePath();ctx.fill();
ctx.strokeStyle="rgba(0,0,0,0.34)";ctx.lineWidth=0.65;ctx.stroke();
ctx.strokeStyle=trimCol;ctx.lineWidth=1.25;
ctx.beginPath();
ctx.moveTo(side*(shW + 3.4),2.6 + by + swing*0.75);
ctx.quadraticCurveTo(side*(shW + 1.3),4.6 + by + swing*0.72,side*(waistW + 1.9),3.1 + by + swing*0.6);
ctx.stroke();
ctx.fillStyle=skinCol;ctx.beginPath();ctx.arc(side*(shW + 1.4),3.8 + by + swing*0.78,1.5,0,Math.PI*2);ctx.fill();
ctx.restore();
};
drawSleeve(-1,armSwing*0.72);
drawSleeve(1,-armSwing*0.72);

// ============================================================================
// 8. WELL-PROPORTIONED NECK & EXPRESSIVE MANHUA HEAD (WIDTH 10px, HEIGHT 11.4px)
// ============================================================================
ctx.fillStyle=_shade(skinCol,-16);
ctx.fillRect(-1.55,shY - 2.4,3.1,2.8);
ctx.fillStyle=skinCol;
ctx.fillRect(-1.3,shY - 2.2,2.6,2.3);

// Ears
ctx.fillStyle=_shade(skinCol,-8);
ctx.beginPath();ctx.ellipse(-5.15,headCY + 0.2,0.95,1.55,0,0,Math.PI*2);ctx.ellipse(5.15,headCY + 0.2,0.95,1.55,0,0,Math.PI*2);ctx.fill();

// Sculpted Manhua Head with Clean Jawline
const faceGrad=ctx.createRadialGradient(-1.3,headCY - 1.6,1.2,0,headCY,6.6);
faceGrad.addColorStop(0,"#fff5eb");
faceGrad.addColorStop(0.58,skinCol);
faceGrad.addColorStop(1,_shade(skinCol,-23));
ctx.fillStyle=faceGrad;
ctx.beginPath();
ctx.moveTo(-5.0,headCY - 1.7);
ctx.quadraticCurveTo(-5.15,headCY + 2.6,-2.9,headCY + 4.5);
ctx.quadraticCurveTo(0,headCY + 5.7,2.9,headCY + 4.5);
ctx.quadraticCurveTo(5.15,headCY + 2.6,5.0,headCY - 1.7);
ctx.quadraticCurveTo(4.75,headCY - 5.7,0,headCY - 5.7);
ctx.quadraticCurveTo(-4.75,headCY - 5.7,-5.0,headCY - 1.7);
ctx.closePath();ctx.fill();
ctx.strokeStyle="rgba(75,45,28,0.32)";ctx.lineWidth=0.6;ctx.stroke();

// Expressive Face Features
if (facing!=="up") {
const eyeShift=facing==="left"? -1.55 :(facing==="right"?1.55 :0);
const ey=headCY + 0.5;

if (arch.isFemale||skin.isFoxSpirit) {
ctx.fillStyle="rgba(255,130,155,0.22)";
ctx.beginPath();
ctx.ellipse(-3.0 + eyeShift,ey + 1.75,1.45,0.75,0,0,Math.PI*2);
ctx.ellipse(3.0 + eyeShift,ey + 1.75,1.45,0.75,0,0,Math.PI*2);
ctx.fill();
}

// Eyebrows
ctx.strokeStyle=arch.isElder?"#e8eef5" :hairCol;
ctx.lineWidth=arch.isFemale?0.78 :1.0;ctx.lineCap="round";
ctx.beginPath();
if (arch.isDemonic||arch.isArmored) {
ctx.moveTo(-3.9 + eyeShift,ey - 2.3);ctx.lineTo(-0.95 + eyeShift,ey - 1.55);
ctx.moveTo(3.9 + eyeShift,ey - 2.3);ctx.lineTo(0.95 + eyeShift,ey - 1.55);
} else {
ctx.moveTo(-3.8 + eyeShift,ey - 1.9);ctx.quadraticCurveTo(-2.3 + eyeShift,ey - 2.65,-1.0 + eyeShift,ey - 1.9);
ctx.moveTo(1.0 + eyeShift,ey - 1.9);ctx.quadraticCurveTo(2.3 + eyeShift,ey - 2.65,3.8 + eyeShift,ey - 1.9);
}
ctx.stroke();

// Detailed Anime Eyes
for (const side of [-1,1]) {
const ex=side*2.32 + eyeShift;
ctx.fillStyle="#ffffff";
ctx.beginPath();ctx.ellipse(ex,ey,1.52,arch.isFemale?1.25 :1.02,0,0,Math.PI*2);ctx.fill();
const iGrad=ctx.createRadialGradient(ex,ey + 0.3,0.18,ex,ey,1.18);
iGrad.addColorStop(0,_shade(eyeCol,45));iGrad.addColorStop(0.65,eyeCol);iGrad.addColorStop(1,_shade(eyeCol,-35));
ctx.fillStyle=iGrad;
ctx.beginPath();ctx.arc(ex + eyeShift*0.13,ey,arch.isFemale?1.02 :0.9,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#090a0e";ctx.beginPath();ctx.arc(ex + eyeShift*0.13,ey,0.42,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffffff";
ctx.beginPath();ctx.arc(ex - 0.35,ey - 0.35,0.4,0,Math.PI*2);ctx.arc(ex + 0.38,ey + 0.32,0.19,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#12141a";ctx.lineWidth=arch.isFemale?0.95 :0.8;
ctx.beginPath();
ctx.moveTo(ex - side*1.4,ey - 0.6);
ctx.quadraticCurveTo(ex,ey - (arch.isFemale?1.42 :1.15),ex + side*(arch.isFemale?1.9 :1.58),ey - (arch.isFemale?0.7 :0.45));
ctx.stroke();
}

// Nose & mouth
ctx.fillStyle="rgba(120,75,55,0.42)";
ctx.beginPath();ctx.arc(eyeShift*0.55,ey + 1.65,0.38,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=arch.isFemale?"#d46a7e" :"rgba(115,65,50,0.72)";ctx.lineWidth=0.75;
ctx.beginPath();
if (arch.isFemale) {
ctx.moveTo(-1.0 + eyeShift*0.48,ey + 2.95);ctx.quadraticCurveTo(eyeShift*0.48,ey + 3.55,1.0 + eyeShift*0.48,ey + 2.95);
} else {
ctx.moveTo(-1.1 + eyeShift*0.48,ey + 3.05);ctx.quadraticCurveTo(eyeShift*0.48,ey + 3.3,1.25 + eyeShift*0.48,ey + 2.8);
}
ctx.stroke();

// Flowing Elder Beard
if (arch.isElder) {
ctx.fillStyle="#e2e8f0";ctx.strokeStyle="#94a3b8";ctx.lineWidth=0.5;
ctx.beginPath();
ctx.moveTo(-2.7 + eyeShift*0.38,ey + 3.0);
ctx.quadraticCurveTo(eyeShift*0.38,ey + 1.9,2.7 + eyeShift*0.38,ey + 3.0);
ctx.quadraticCurveTo(2.0 + eyeShift*0.38,ey + 8.2,eyeShift*0.38 + sway*0.18,ey + 10.2);
ctx.quadraticCurveTo(-2.0 + eyeShift*0.38,ey + 8.2,-2.7 + eyeShift*0.38,ey + 3.0);
ctx.closePath();ctx.fill();ctx.stroke();
}

// Forehead Marks & Third Eye
if (skin.hasThirdEye) {
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(eyeShift*0.55,headCY - 2.3,1.8,0.92,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(eyeShift*0.55,headCY - 2.3,0.75,0,Math.PI*2);ctx.fill();
} else if (feat==="red_lotus_halo"||skin.foreheadMark==="lotus") {
ctx.fillStyle="#ff2a2a";
ctx.beginPath();ctx.moveTo(eyeShift*0.55,headCY - 3.4);ctx.lineTo(1.1 + eyeShift*0.55,headCY - 2.0);ctx.lineTo(eyeShift*0.55,headCY - 1.0);ctx.lineTo(-1.1 + eyeShift*0.55,headCY - 2.0);ctx.closePath();ctx.fill();
} else if (feat==="orbiting_stars"||skin.foreheadMark==="star") {
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(eyeShift*0.55,headCY - 2.2,0.95,0,Math.PI*2);ctx.fill();
} else if (skin.foreheadMark==="phoenix") {
ctx.fillStyle="#ffd700";
ctx.beginPath();ctx.moveTo(eyeShift*0.55,headCY - 3.2);ctx.lineTo(1.3 + eyeShift*0.55,headCY - 1.8);ctx.lineTo(eyeShift*0.55,headCY - 1.1);ctx.lineTo(-1.3 + eyeShift*0.55,headCY - 1.8);ctx.closePath();ctx.fill();
}
}

// ============================================================================
// 9. ANIME FRONT HAIR, BANGS, SIDE LOCKS & GLOSSY SHEEN
// ============================================================================
const hairGrad=ctx.createLinearGradient(0,headCY - 6.8,0,headCY + 3.5);
hairGrad.addColorStop(0,hairHi);hairGrad.addColorStop(0.45,hairCol);hairGrad.addColorStop(1,hairDark);
ctx.fillStyle=hairGrad;

ctx.beginPath();
ctx.arc(0,headCY - 1.7,5.7,Math.PI*1.02,Math.PI*1.98);
ctx.lineTo(5.8,headCY + 1.2);
ctx.quadraticCurveTo(3.8,headCY - 1.6,2.6,headCY + 0.3);
ctx.quadraticCurveTo(1.4,headCY - 2.1,0.3,headCY + 0.6);
ctx.quadraticCurveTo(-1.2,headCY - 2.2,-2.5,headCY + 0.15);
ctx.quadraticCurveTo(-4.0,headCY - 1.7,-5.8,headCY + 1.2);
ctx.closePath();ctx.fill();

// Cheek-framing hair strands
ctx.beginPath();
ctx.moveTo(-5.4,headCY - 1.4);
ctx.quadraticCurveTo(-6.8,headCY + 3.2,-5.3 + sway*0.15,headCY + 8.4);
ctx.quadraticCurveTo(-4.2,headCY + 4.2,-3.9,headCY + 0.7);ctx.closePath();
ctx.moveTo(5.4,headCY - 1.4);
ctx.quadraticCurveTo(6.8,headCY + 3.2,5.3 + sway*0.15,headCY + 8.4);
ctx.quadraticCurveTo(4.2,headCY + 4.2,3.9,headCY + 0.7);ctx.closePath();
ctx.fill();

if (hs==="fairy_buns") {
ctx.beginPath();ctx.arc(-4.5,headCY - 6.0,2.45,0,Math.PI*2);ctx.arc(4.5,headCY - 6.0,2.45,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ff85c2";ctx.lineWidth=0.9;ctx.stroke();
} else {
ctx.beginPath();ctx.ellipse(0,headCY - 6.9,2.9,2.4,0,0,Math.PI*2);ctx.fill();
}

ctx.strokeStyle="rgba(255,255,255,0.34)";ctx.lineWidth=1.05;ctx.lineCap="round";
ctx.beginPath();ctx.arc(0,headCY - 2.0,4.2,Math.PI*1.16,Math.PI*1.46);ctx.stroke();
ctx.beginPath();ctx.arc(0,headCY - 2.0,4.2,Math.PI*1.58,Math.PI*1.74);ctx.stroke();

// ============================================================================
// 10. BESPOKE CROWNS, HAIRPINS & WAR HELMS
// ============================================================================
const crY=headCY - 6.0;
if (hs==="immortal_lotus") {
const crG=ctx.createLinearGradient(0,crY - 5.5,0,crY + 1);
crG.addColorStop(0,"#fff5b8");crG.addColorStop(1,crownCol);
ctx.fillStyle=crG;
ctx.beginPath();
ctx.moveTo(-4.4,crY);ctx.lineTo(-3.0,crY - 4.6);ctx.lineTo(-1.0,crY - 2.1);
ctx.lineTo(0,crY - 6.0);ctx.lineTo(1.0,crY - 2.1);ctx.lineTo(3.0,crY - 4.6);ctx.lineTo(4.4,crY);
ctx.closePath();ctx.fill();
ctx.fillStyle="#ff3b30";ctx.beginPath();ctx.arc(0,crY - 1.7,1.3,0,Math.PI*2);ctx.fill();
} else if (hs==="noble_crown"||hs==="elder_sage") {
ctx.fillStyle=crownCol;
_roundRect(ctx,-3.8,crY - 3.0,7.6,3.2,1.1);ctx.fill();
ctx.fillStyle=trimCol;ctx.beginPath();ctx.arc(0,crY - 1.4,1.15,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=crownCol;ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(-6.0,crY - 1.4);ctx.lineTo(6.0,crY - 1.4);ctx.stroke();
} else if (hs==="war_helm") {
ctx.fillStyle=crownCol;
ctx.beginPath();
ctx.moveTo(-6.1,crY + 2.5);ctx.quadraticCurveTo(0,crY - 3.6,6.1,crY + 2.5);
ctx.lineTo(5.0,crY + 3.9);ctx.quadraticCurveTo(0,crY + 1.1,-5.0,crY + 3.9);ctx.closePath();ctx.fill();
ctx.fillStyle=trimCol;
ctx.beginPath();ctx.moveTo(0,crY - 6.4);ctx.quadraticCurveTo(2.8,crY - 2.2 + sway*0.2,2.1,crY);ctx.lineTo(-2.1,crY);ctx.closePath();ctx.fill();
} else if (hs==="jade_hairpin"||hs==="fairy_buns") {
ctx.strokeStyle=crownCol;ctx.lineWidth=1.35;
ctx.beginPath();ctx.moveTo(-6.0,crY - 0.2);ctx.lineTo(6.2,crY - 1.1);ctx.stroke();
ctx.fillStyle="#ff85a2";
for (let p=0;p<5;p++) {
const pa=(p*Math.PI*2)/5;
ctx.beginPath();ctx.arc(5.1 + Math.cos(pa)*1.5,crY - 1.1 + Math.sin(pa)*1.5,1.05,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(5.1,crY - 1.1,0.85,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffeaa7";ctx.lineWidth=0.75;
ctx.beginPath();ctx.moveTo(5.6,crY);ctx.lineTo(6.0 + sway*0.14,crY + 3.6);ctx.stroke();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(6.0 + sway*0.14,crY + 3.8,0.8,0,Math.PI*2);ctx.fill();
} else if (hs==="star_crown") {
ctx.strokeStyle=crownCol;ctx.lineWidth=1.55;
ctx.beginPath();ctx.arc(0,crY - 1.1,4.2,Math.PI*0.15,Math.PI*0.85,true);ctx.stroke();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(0,crY - 4.8,1.5,0,Math.PI*2);ctx.fill();
} else if (hs==="silver_long") {
ctx.strokeStyle="#bff0ff";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(-5.1,crY + 0.9);ctx.lineTo(-2.1,crY - 2.1);ctx.lineTo(0,crY - 3.6);ctx.lineTo(2.1,crY - 2.1);ctx.lineTo(5.1,crY + 0.9);ctx.stroke();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(0,crY - 3.4,1.3,0,Math.PI*2);ctx.fill();
} else if (hs==="demonic_wild") {
ctx.strokeStyle=crownCol;ctx.lineWidth=1.35;
ctx.beginPath();ctx.moveTo(-4.2,crY + 0.5);ctx.lineTo(-6.7,crY - 3.8);ctx.moveTo(4.2,crY + 0.5);ctx.lineTo(6.7,crY - 3.8);ctx.stroke();
ctx.fillStyle="#ff2a2a";ctx.beginPath();ctx.arc(0,crY - 0.6,1.4,0,Math.PI*2);ctx.fill();
} else {
ctx.fillStyle=crownCol;
_roundRect(ctx,-3.5,crY - 1.4,7.0,1.9,0.9);ctx.fill();
ctx.strokeStyle=trimCol;ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(3.2,crY - 0.5);ctx.quadraticCurveTo(7.6,crY + 1.8,8.4 + sway*0.42,crY + 8.4);ctx.stroke();
}

// ============================================================================
// 11. SIGNATURE FOREGROUND FLOATING ARTIFACTS & MOTES
// ============================================================================
if (feat==="spring_autumn_cicada") {
const cx=12.8 + Math.cos(t*1.9)*2.2;
const cy=-14.0 + by + Math.sin(t*2.6)*2.6;
ctx.save();ctx.translate(cx,cy);ctx.rotate(Math.sin(t*4)*0.18);
const cg=ctx.createRadialGradient(0,0,1,0,0,6.0);
cg.addColorStop(0,"rgba(255,245,170,0.65)");cg.addColorStop(1,"rgba(56,232,168,0)");
ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,6.0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(126,247,196,0.9)";
ctx.beginPath();ctx.ellipse(-2.1,-0.9,3.1,1.25,-0.5,0,Math.PI*2);ctx.ellipse(2.1,-0.9,3.1,1.25,0.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#f2d16b";ctx.beginPath();ctx.ellipse(0,0.4,1.5,2.7,0,0,Math.PI*2);ctx.fill();
ctx.restore();
} else if (feat==="frost_crystals") {
for (let i=0;i<3;i++) {
const ang=t*1.3 + (i*Math.PI*2)/3;
const fx=Math.cos(ang)*15.0;const fy=-8 + by + Math.sin(ang)*7.5;
ctx.save();ctx.translate(fx,fy);ctx.rotate(t*2 + i);
ctx.strokeStyle="#d6f4ff";ctx.lineWidth=1.05;
for (let k=0;k<3;k++) {ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(-2.7,0);ctx.lineTo(2.7,0);ctx.stroke();}
ctx.restore();
}
} else if (feat==="orbiting_stars") {
for (let s=0;s<4;s++) {
const ang=t*1.5 + (s*Math.PI)/2;
const sx=Math.cos(ang)*16.0;const sy=-8 + by + Math.sin(ang)*8.2;
ctx.fillStyle=s%2===0?"#7ef7f0" :"#ffffff";
ctx.beginPath();ctx.arc(sx,sy,1.95,0,Math.PI*2);ctx.fill();
}
} else if (feat==="jade_lotus"||feat==="flower_rain") {
for (let i=0;i<3;i++) {
const ang=t*1.15 + (i*Math.PI*2)/3;
const lx=Math.cos(ang)*14.2;const ly=-5 + by + Math.sin(ang)*7.0;
ctx.fillStyle=(feat==="flower_rain"||i===0)?"#ff9eb8" :"#98f5c8";
ctx.beginPath();ctx.ellipse(lx,ly,2.6,1.4,ang,0,Math.PI*2);ctx.fill();
}
} else if (feat==="poison_bamboo_aura") {
const bx=12.2;const by2=-11 + by + Math.sin(t*2.4)*2.4;
ctx.save();ctx.translate(bx,by2);ctx.rotate(0.25);
ctx.fillStyle="#1f9e6b";ctx.strokeStyle="#7ef7c4";ctx.lineWidth=0.9;
ctx.fillRect(-1.9,-5.2,3.8,10.4);ctx.strokeRect(-1.9,-5.2,3.8,10.4);
ctx.restore();
} else if (feat==="destiny_song_notes") {
for (let i=0;i<2;i++) {
const ang=t*1.5 + i*Math.PI;
const nx=Math.cos(ang)*15.0;const ny=-11 + by + Math.sin(ang)*6.5;
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(nx,ny,1.7,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#76d7c4";ctx.lineWidth=1.05;
ctx.beginPath();ctx.moveTo(nx + 1.4,ny);ctx.lineTo(nx + 1.4,ny - 4.8);ctx.lineTo(nx + 4.2,ny - 3.8);ctx.stroke();
}
}

ctx.restore();
}

function renderPortraitPreview(ctx,skinCfg) {
if (!ctx) return;
const w=ctx.canvas.width;
const h=ctx.canvas.height;
const skin=skinCfg||{};
ctx.clearRect(0,0,w,h);

const bg=ctx.createRadialGradient(w/2,h*0.44,4,w/2,h/2,w*0.62);
bg.addColorStop(0,skin.auraColor||"rgba(226,191,117,0.34)");
bg.addColorStop(0.55,"rgba(18,24,36,0.82)");
bg.addColorStop(1,"rgba(5,7,12,0.98)");
ctx.fillStyle=bg;
ctx.fillRect(0,0,w,h);

ctx.fillStyle="rgba(255,255,255,0.04)";
ctx.beginPath();
ctx.moveTo(0,h);ctx.lineTo(w*0.24,h*0.68);ctx.lineTo(w*0.52,h*0.82);ctx.lineTo(w*0.78,h*0.64);ctx.lineTo(w,h);
ctx.closePath();ctx.fill();

ctx.save();
ctx.strokeStyle=skin.beltColor||"#d4af37";
ctx.globalAlpha=0.42;ctx.lineWidth=1.3;
ctx.beginPath();ctx.arc(w/2,h*0.50,w*0.41,0,Math.PI*2);ctx.stroke();
ctx.globalAlpha=0.25;
ctx.beginPath();ctx.arc(w/2,h*0.50,w*0.45,0,Math.PI*2);ctx.stroke();

ctx.restore();

const scale=w<=56?1.04 :1.72;
ctx.save();
ctx.translate(w/2,h/2 + (w<=56?5.5 :10));
ctx.scale(scale,scale);
drawCharacter(ctx,skin,{bobY:0,legOffset:0,armSwing:0,facing:"down",isMoving:false});
ctx.restore();
}

const _CHAR_SPRITE_CACHE=new Map();
function drawCharacterCached(ctx,skinCfg,state={}) {
const skin=skinCfg||{};
const facing=state.facing||"down";
const isMoving=Boolean(state.isMoving||Math.abs(state.legOffset||0)>0.15);
const frame=isMoving?(Math.floor(performance.now()*0.006) % 2) :0;
const key=`${skin.id||skin.robeColor||"c"}_${skin.hairStyle||"h"}_${facing}_${frame}`;
let spr=_CHAR_SPRITE_CACHE.get(key);
if (!spr) {
spr=document.createElement("canvas");
spr.width=72;
spr.height=84;
const sctx=spr.getContext("2d");
sctx.translate(36,48);
drawCharacter(sctx,skin,{
bobY:frame===1? -1.6 :0,
legOffset:frame===1?2.2 :(isMoving? -2.2 :0),
armSwing:frame===1? -2 :1,
facing,
isMoving
});
if (_CHAR_SPRITE_CACHE.size>64) {
const oldK=_CHAR_SPRITE_CACHE.keys().next().value;
_CHAR_SPRITE_CACHE.delete(oldK);
}
_CHAR_SPRITE_CACHE.set(key,spr);
} else {
_CHAR_SPRITE_CACHE.delete(key);
_CHAR_SPRITE_CACHE.set(key,spr);
}
ctx.drawImage(spr,-36,-48);
}
global.CharacterArtRenderer={
drawCharacter,
drawCharacterCached,
renderPortraitPreview
};
})(window);
