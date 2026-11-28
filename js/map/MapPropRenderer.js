(function (global) {
"use strict";
function renderProp(ctx,dx,dy,type,t=0) {
ctx.save();
ctx.translate(dx,dy);

// Grounded contact shadow (scaled per prop size)
const bigShadow=(type==="ancient_banyan"||type==="weeping_willow"||type==="peach_blossom_tree"||type==="crimson_maple"||type==="spirit_cypress"||type==="boulder_group"||type==="ruined_wall_seg"||type==="giant_mushroom_tree"||type==="crystal_tree"||type==="bone_rib_arch");
ctx.fillStyle="rgba(0,0,0,0.36)";
ctx.beginPath();ctx.ellipse(3,5,bigShadow?22 :13,bigShadow?9 :5.5,0,0,Math.PI*2);ctx.fill();

switch (type) {
// ==================== NEW TREES & LUSH FOLIAGE ====================
case "ancient_banyan":{
// Towering gnarled ancient Xianxia banyan tree with aerial roots & layered emerald canopy
ctx.strokeStyle="#3d2817";ctx.lineWidth=8;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-3,-14,1,-26);ctx.stroke();
// Exposed surface roots gripping the earth
ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(-2,2);ctx.quadraticCurveTo(-11,5,-15,8);ctx.moveTo(2,2);ctx.quadraticCurveTo(10,5,14,7);ctx.stroke();
// Hanging aerial vines
ctx.strokeStyle="#2d6e46";ctx.lineWidth=1.1;
for (const vx of [-14,-7,8,15]) {ctx.beginPath();ctx.moveTo(vx,-20);ctx.lineTo(vx - 1,-5);ctx.stroke();}
// Lush 4-lobe shaded canopy
for (const [cx,cy,rx,ry,col] of [[-14,-24,14,10,"#14422a"],[14,-24,14,10,"#14422a"],[0,-30,19,13,"#1f633e"],[-4,-34,13,9,"#2e8c58"],[6,-32,11,8,"#27784b"]]) {
ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
}
// Sunlit foliage speckles
ctx.fillStyle="rgba(126,247,196,0.32)";
ctx.beginPath();ctx.arc(-8,-35,3,0,Math.PI*2);ctx.arc(4,-37,2.6,0,Math.PI*2);ctx.arc(10,-28,2.2,0,Math.PI*2);ctx.fill();
break;
}
case "weeping_willow":{
// Graceful waterside weeping willow with cascading emerald curtains
ctx.strokeStyle="#473322";ctx.lineWidth=6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(4,-14,-2,-28);ctx.stroke();
// Cascading willow leaf curtains
for (let i=-3;i<=3;i++) {
const sx=i*5.5;const sy=-30 + Math.abs(i)*2;
ctx.strokeStyle=(i % 2===0)?"#2ecc71" :"#1d8348";ctx.lineWidth=2.1;
ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx + i*1.4,sy + 14,sx + i*0.8,sy + 26);ctx.stroke();
}
ctx.fillStyle="#279958";ctx.beginPath();ctx.ellipse(0,-31,18,9,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#5ce096";ctx.beginPath();ctx.ellipse(-3,-34,11,5.5,0,0,Math.PI*2);ctx.fill();
break;
}
case "peach_blossom_tree":{
// Xianxia immortal peach blossom tree with glowing pink canopy & fallen petals
ctx.fillStyle="rgba(255,155,205,0.28)";
for (const [px,py] of [[-14,5],[12,6],[-4,8],[16,3]]) {ctx.beginPath();ctx.arc(px,py,2.2,0,Math.PI*2);ctx.fill();}
ctx.strokeStyle="#4d2c20";ctx.lineWidth=6.5;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-5,-12,2,-26);ctx.stroke();
ctx.lineWidth=3;
ctx.beginPath();ctx.moveTo(0,-16);ctx.lineTo(-12,-25);ctx.moveTo(1,-18);ctx.lineTo(13,-26);ctx.stroke();
for (const [cx,cy,rx,ry,col] of [[-12,-25,12,9,"#c94b82"],[12,-26,12,9,"#c94b82"],[0,-31,17,12,"#ff77b7"],[-4,-35,11,8,"#ffb8db"],[7,-32,10,7,"#ff99cc"]]) {
ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
}
break;
}
case "crimson_maple":{
// Autumn blood-crimson Xianxia maple tree
ctx.fillStyle="rgba(224,62,48,0.28)";
for (const [px,py] of [[-13,6],[13,5],[2,8]]) {ctx.beginPath();ctx.arc(px,py,2.3,0,Math.PI*2);ctx.fill();}
ctx.strokeStyle="#361c16";ctx.lineWidth=6.5;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(3,-14,-1,-26);ctx.stroke();
for (const [cx,cy,rx,ry,col] of [[-13,-24,13,9,"#7a1612"],[13,-24,13,9,"#7a1612"],[0,-30,17,12,"#c0291d"],[-5,-34,11,8,"#ff5733"],[6,-32,10,7,"#e6482e"]]) {
ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
}
break;
}
case "spirit_cypress":{
// Tall noble Immortal Cypress (Tùng Bách Tiên Gia) with layered blue-green foliage pads
ctx.strokeStyle="#47301e";ctx.lineWidth=6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-4,-15,2,-36);ctx.stroke();
for (const [cx,cy,rx,ry,col] of [[-10,-16,12,5.5,"#12453c"],[11,-22,12,5.5,"#12453c"],[-9,-29,11,5.2,"#1b6355"],[9,-35,10,5,"#1b6355"],[0,-41,13,6,"#2a8c78"]]) {
ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(126,247,220,0.25)";ctx.beginPath();ctx.ellipse(cx,cy - 2,rx*0.65,ry*0.45,0,0,Math.PI*2);ctx.fill();
}
break;
}
case "bamboo_clump_tall":{
// Dense 5-stalk towering emerald bamboo grove cluster
for (let i=-2;i<=2;i++) {
const bx=i*5.2;const bh=32 + ((i*7 + 15) % 14);
const bg=ctx.createLinearGradient(bx - 2,0,bx + 2,0);
bg.addColorStop(0,"#0a3622");bg.addColorStop(0.5,"#32c478");bg.addColorStop(1,"#104a2e");
ctx.strokeStyle=bg;ctx.lineWidth=3.8;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(bx,4);ctx.quadraticCurveTo(bx + i*1.4,-bh*0.5,bx + i*2.6,-bh);ctx.stroke();
ctx.strokeStyle="#a6f7cc";ctx.lineWidth=0.9;
for (let s=0.3;s<=0.85;s+=0.26) {
const jx=bx + i*1.8*s;const jy=-bh*s;
ctx.beginPath();ctx.moveTo(jx - 2.4,jy);ctx.lineTo(jx + 2.4,jy);ctx.stroke();
}
ctx.fillStyle=(i % 2===0)?"#2ecc71" :"#1b7a43";
ctx.beginPath();
ctx.ellipse(bx + i*2.6 - 7,-bh - 1,8,3,-0.35,0,Math.PI*2);
ctx.ellipse(bx + i*2.6 + 7,-bh - 3,8,3,0.35,0,Math.PI*2);
ctx.fill();
}
break;
}
case "desert_palm":{
// Oasis Date Palm tree (Western Desert)
ctx.strokeStyle="#6e4b2a";ctx.lineWidth=5.5;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-6,-14,2,-32);ctx.stroke();
// Curved palm fronds radiating from crown
for (const [ang,len] of [[-2.7,19],[-2.0,18],[-1.1,18],[-0.4,19],[0.3,16],[2.9,16]]) {
ctx.strokeStyle="#278246";ctx.lineWidth=3.4;
ctx.beginPath();ctx.moveTo(2,-32);
ctx.quadraticCurveTo(2 + Math.cos(ang)*len*0.6,-32 + Math.sin(ang)*len*0.4 - 4,2 + Math.cos(ang)*len,-32 + Math.sin(ang)*len + 5);
ctx.stroke();
}
ctx.fillStyle="#d48914";ctx.beginPath();ctx.arc(0,-29,2.4,0,Math.PI*2);ctx.arc(4,-29,2.4,0,Math.PI*2);ctx.fill();
break;
}
case "dead_gnarled_oak":{
// Ancient twisted dead mountain oak with mossy bark & eerie branches
ctx.strokeStyle="#2e241d";ctx.lineWidth=7;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-5,-12,2,-28);ctx.stroke();
ctx.lineWidth=3.4;
ctx.beginPath();
ctx.moveTo(-1,-14);ctx.quadraticCurveTo(-13,-20,-18,-31);
ctx.moveTo(1,-18);ctx.quadraticCurveTo(13,-24,18,-34);
ctx.moveTo(2,-25);ctx.lineTo(-4,-37);
ctx.stroke();
ctx.fillStyle="#386641";ctx.beginPath();ctx.ellipse(-6,-10,5,2.5,0.3,0,Math.PI*2);ctx.fill();
break;
}
case "giant_mushroom_tree":{
// Towering bioluminescent cave / swamp mushroom tree
const gl=ctx.createRadialGradient(0,-24,4,0,-24,28);
gl.addColorStop(0,"rgba(72,240,185,0.42)");gl.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,-24,28,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#d6e6de";ctx.strokeStyle="#5c786c";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(-5,5);ctx.quadraticCurveTo(-4,-12,-3,-24);ctx.lineTo(3,-24);ctx.quadraticCurveTo(4,-12,5,5);ctx.closePath();ctx.fill();ctx.stroke();
const cg=ctx.createRadialGradient(-4,-30,3,0,-26,20);
cg.addColorStop(0,"#ffffff");cg.addColorStop(0.45,"#38e8a8");cg.addColorStop(1,"#164a3b");
ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(0,-24,19,11,0,Math.PI,0);ctx.closePath();ctx.fill();
ctx.fillStyle="rgba(255,255,255,0.75)";
ctx.beginPath();ctx.arc(-8,-29,2.2,0,Math.PI*2);ctx.arc(5,-31,1.8,0,Math.PI*2);ctx.arc(10,-26,1.5,0,Math.PI*2);ctx.fill();
break;
}
case "crystal_tree":{
// Rose-violet or Ice Spirit Crystal Tree (Đãng Hồn Sơn / Immortal Blessed Land)
const gl=ctx.createRadialGradient(0,-22,4,0,-22,28);
gl.addColorStop(0,"rgba(255,155,224,0.42)");gl.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,-22,28,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#5e2458";ctx.lineWidth=5.5;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-22);ctx.moveTo(0,-14);ctx.lineTo(-11,-25);ctx.moveTo(0,-16);ctx.lineTo(11,-27);ctx.stroke();
for (const [cx,cy,r] of [[-12,-27,8],[12,-29,8],[0,-33,10],[-5,-22,6],[6,-23,6]]) {
const cg=ctx.createLinearGradient(cx - r,cy - r,cx + r,cy + r);
cg.addColorStop(0,"#ffffff");cg.addColorStop(0.45,"#ff85d5");cg.addColorStop(1,"#6e1b69");
ctx.fillStyle=cg;
ctx.beginPath();ctx.moveTo(cx,cy - r);ctx.lineTo(cx + r*0.7,cy);ctx.lineTo(cx,cy + r*0.6);ctx.lineTo(cx - r*0.7,cy);ctx.closePath();ctx.fill();
}
break;
}
case "wild_bush":{
// Plump lush leafy shrub with bright blossoms
for (const [bx,by,rx,ry,col] of [[-7,-4,8,6,"#144a2c"],[7,-4,8,6,"#144a2c"],[0,-8,10,7.5,"#217545"],[-3,-10,6,4.5,"#32a866"]]) {
ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(bx,by,rx,ry,0,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(-5,-7,1.6,0,Math.PI*2);ctx.arc(4,-9,1.6,0,Math.PI*2);ctx.arc(1,-4,1.4,0,Math.PI*2);ctx.fill();
break;
}
case "fern_cluster":{
// Fan of curved mountain fern fronds
for (let i=-2;i<=2;i++) {
const ang=-Math.PI/2 + i*0.42;
ctx.strokeStyle=(i % 2===0)?"#2ecc71" :"#1b7a43";ctx.lineWidth=2.6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,3);ctx.quadraticCurveTo(Math.cos(ang)*10,Math.sin(ang)*10,Math.cos(ang)*16,Math.sin(ang)*14 + 3);ctx.stroke();
}
break;
}
case "wildflowers":{
// Colorful cluster of mountain wildflowers & grass stems
ctx.strokeStyle="#279958";ctx.lineWidth=1.4;
for (const [fx,fy,col] of [[-8,-6,"#ff85a2"],[-2,-10,"#ffd700"],[5,-8,"#7ef7f0"],[9,-4,"#ff9be0"],[0,-4,"#ffffff"]]) {
ctx.beginPath();ctx.moveTo(fx*0.6,4);ctx.lineTo(fx,fy);ctx.stroke();
ctx.fillStyle=col;ctx.beginPath();ctx.arc(fx,fy,2.6,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff5b8";ctx.beginPath();ctx.arc(fx,fy,1.0,0,Math.PI*2);ctx.fill();
}
break;
}
case "fallen_log":{
// Moss-covered fallen ancient tree trunk with tiny mushrooms
const lg=ctx.createLinearGradient(-16,-6,16,6);
lg.addColorStop(0,"#5c3d26");lg.addColorStop(0.5,"#3d2817");lg.addColorStop(1,"#24160b");
ctx.fillStyle=lg;ctx.strokeStyle="#170e07";ctx.lineWidth=1.2;
ctx.beginPath();ctx.ellipse(0,0,17,5.5,-0.15,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#7a5738";ctx.beginPath();ctx.ellipse(15,-2,3.5,5,-0.15,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#2d804d";ctx.beginPath();ctx.ellipse(-5,-3,7,2.8,-0.15,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(-6,-5,2.2,0,Math.PI*2);ctx.arc(-2,-4,1.7,0,Math.PI*2);ctx.fill();
break;
}

// ==================== NEW EARTH, ROCKS & RUIN DETAILS ====================
case "boulder_group":{
// Layered cluster of 3 faceted mountain boulders with grass & moss at base
for (const [bx,by,rw,rh,c0,c1] of [[-11,2,11,13,"#6b7370","#262c29"],[11,3,10,11,"#5f6865","#212624"],[0,1,15,21,"#838c88","#2f3633"]]) {
const rg=ctx.createLinearGradient(bx - rw,by - rh,bx + rw,by + 4);
rg.addColorStop(0,c0);rg.addColorStop(1,c1);
ctx.fillStyle=rg;ctx.strokeStyle="#161a18";ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(bx - rw,by + 3);ctx.lineTo(bx - rw*0.78,by - rh*0.72);ctx.lineTo(bx - rw*0.1,by - rh);
ctx.lineTo(bx + rw*0.65,by - rh*0.75);ctx.lineTo(bx + rw,by + 3);ctx.closePath();
ctx.fill();ctx.stroke();
}
ctx.fillStyle="#2d7047";ctx.beginPath();ctx.ellipse(-2,-13,8,3.2,-0.15,0,Math.PI*2);ctx.fill();
break;
}
case "craggy_spire":{
// Tall jagged slate mountain rock spire
const rg=ctx.createLinearGradient(-12,-38,12,4);
rg.addColorStop(0,"#8c969e");rg.addColorStop(0.5,"#4a535c");rg.addColorStop(1,"#1c2126");
ctx.fillStyle=rg;ctx.strokeStyle="#14181c";ctx.lineWidth=1.3;
ctx.beginPath();
ctx.moveTo(-12,4);ctx.lineTo(-8,-24);ctx.lineTo(-1,-38);ctx.lineTo(7,-26);ctx.lineTo(12,4);ctx.closePath();
ctx.fill();ctx.stroke();
ctx.strokeStyle="rgba(255,255,255,0.22)";ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(-1,-38);ctx.lineTo(-3,-8);ctx.stroke();
break;
}
case "earth_mound":{
// Natural raised earth/soil mound studded with small stones & tufts of grass
const eg=ctx.createRadialGradient(-3,-4,2,0,1,16);
eg.addColorStop(0,"#6e563b");eg.addColorStop(0.65,"#453523");eg.addColorStop(1,"#241b12");
ctx.fillStyle=eg;
ctx.beginPath();ctx.ellipse(0,2,16,8,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#8a8278";
ctx.beginPath();ctx.ellipse(-6,1,3.5,2.2,0.2,0,Math.PI*2);ctx.ellipse(7,3,3,1.8,-0.2,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#2f8c54";ctx.lineWidth=1.3;
ctx.beginPath();ctx.moveTo(0,-3);ctx.lineTo(-3,-10);ctx.moveTo(0,-3);ctx.lineTo(2,-11);ctx.moveTo(0,-3);ctx.lineTo(5,-9);ctx.stroke();
break;
}
case "pebble_cluster":{
// Natural cluster of 5 smooth ground stones & dirt flecks
for (const [px,py,rx,ry,col] of [[-7,2,4.5,2.8,"#6c736f"],[6,3,4,2.4,"#59615d"],[0,-1,5.2,3.2,"#7f8783"],[-2,5,3.2,2,"#4f5652"],[8,-2,2.8,1.8,"#727a76"]]) {
ctx.fillStyle=col;ctx.beginPath();ctx.ellipse(px,py,rx,ry,0.15,0,Math.PI*2);ctx.fill();
}
break;
}
case "ruined_wall_seg":{
// Weathered broken Xianxia stone wall segment with moss & fallen bricks
ctx.fillStyle="#453f38";ctx.strokeStyle="#1f1c18";ctx.lineWidth=1.3;
ctx.beginPath();
ctx.moveTo(-20,4);ctx.lineTo(-20,-16);ctx.lineTo(-6,-16);ctx.lineTo(-2,-22);ctx.lineTo(10,-22);ctx.lineTo(14,-11);ctx.lineTo(20,-11);ctx.lineTo(20,4);ctx.closePath();
ctx.fill();ctx.stroke();
ctx.strokeStyle="rgba(255,234,167,0.22)";ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(-20,-6);ctx.lineTo(20,-6);ctx.moveTo(-8,-16);ctx.lineTo(-8,4);ctx.moveTo(6,-22);ctx.lineTo(6,4);ctx.stroke();
ctx.fillStyle="#2c7548";ctx.beginPath();ctx.ellipse(-13,-16,6,2.5,0,0,Math.PI*2);ctx.ellipse(4,-22,6,2.2,0,0,Math.PI*2);ctx.fill();
break;
}
case "mossy_steps":{
// Cracked ancient stone steps overgrown with moss
for (let i=0;i<3;i++) {
ctx.fillStyle=i%2===0?"#595248" :"#4a443c";ctx.strokeStyle="#211e1a";ctx.lineWidth=1.1;
ctx.fillRect(-15 + i*1.5,-10 + i*6,30 - i*3,6);ctx.strokeRect(-15 + i*1.5,-10 + i*6,30 - i*3,6);
}
ctx.fillStyle="#2e7d4b";ctx.beginPath();ctx.arc(-10,-9,3,0,Math.PI*2);ctx.arc(9,-3,2.6,0,Math.PI*2);ctx.fill();
break;
}
case "bone_rib_arch":{
// Half-buried giant ancient beast ribcage emerging from earth
ctx.strokeStyle="#dfe8f0";ctx.lineWidth=4.2;ctx.lineCap="round";
for (const ox of [-10,0,10]) {
ctx.beginPath();ctx.moveTo(ox - 5,5);ctx.quadraticCurveTo(ox - 6,-16,ox + 5,-22);ctx.stroke();
}
ctx.strokeStyle="#5c6975";ctx.lineWidth=1;
for (const ox of [-10,0,10]) {
ctx.beginPath();ctx.moveTo(ox - 4,5);ctx.quadraticCurveTo(ox - 5,-14,ox + 5,-21);ctx.stroke();
}
break;
}

// ==================== ORIGINAL 26 HIGH-CRAFT PROPS ====================
case "bamboo_stalk":{
for (let i=-1;i<=1;i++) {
const bx=i*6.5;const bh=28 + (i===0?10 :(i<0?4 :0));
const bg=ctx.createLinearGradient(bx - 2.5,0,bx + 2.5,0);
bg.addColorStop(0,"#0d422a");bg.addColorStop(0.5,"#34c77b");bg.addColorStop(1,"#135436");
ctx.strokeStyle=bg;ctx.lineWidth=4.2;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(bx,4);ctx.quadraticCurveTo(bx + i*2,-bh*0.5,bx + i*3.5,-bh);ctx.stroke();
ctx.strokeStyle="#9df7c6";ctx.lineWidth=1;
for (let s=0.32;s<=0.82;s+=0.26) {
const jx=bx + i*2.4*s;const jy=-bh*s;
ctx.beginPath();ctx.moveTo(jx - 2.8,jy);ctx.lineTo(jx + 2.8,jy);ctx.stroke();
}
ctx.fillStyle=i===0?"#2ecc71" :"#1d8348";
ctx.beginPath();
ctx.ellipse(bx + i*3.5 - 7,-bh - 1,8.5,3.2,-0.38,0,Math.PI*2);
ctx.ellipse(bx + i*3.5 + 7,-bh - 3,8.5,3.2,0.38,0,Math.PI*2);
ctx.fill();
}
break;
}
case "moon_flower":{
const g=ctx.createRadialGradient(0,-10,2,0,-10,18);
g.addColorStop(0,"rgba(126,247,240,0.55)");g.addColorStop(1,"rgba(126,247,240,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-10,18,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#24382c";ctx.beginPath();ctx.ellipse(0,2,10,5,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#2ecc71";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(-2,1);ctx.quadraticCurveTo(-5,-6,-4,-11);ctx.moveTo(2,1);ctx.quadraticCurveTo(6,-5,4,-12);ctx.stroke();
for (const [fx,fy,r] of [[-4,-12,4.5],[4,-13,5],[0,-16,4]]) {
ctx.fillStyle="#7ef7f0";
for (let p=0;p<5;p++) {
const a=(p*Math.PI*2)/5;
ctx.beginPath();ctx.ellipse(fx + Math.cos(a)*r*0.65,fy + Math.sin(a)*r*0.65,r*0.55,r*0.32,a,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(fx,fy,1.8,0,Math.PI*2);ctx.fill();
}
break;
}
case "moss_rock":
case "rock_pillar":{
const tall=(type==="rock_pillar");
const h=tall?34 :18;const w=tall?14 :16;
const rg=ctx.createLinearGradient(-w,-h,w,4);
rg.addColorStop(0,"#6a736e");rg.addColorStop(0.55,"#3f4743");rg.addColorStop(1,"#1e2421");
ctx.fillStyle=rg;
ctx.beginPath();
ctx.moveTo(-w,4);ctx.lineTo(-w*0.82,-h*0.72);ctx.lineTo(-w*0.18,-h);ctx.lineTo(w*0.6,-h*0.78);ctx.lineTo(w,4);
ctx.quadraticCurveTo(0,8,-w,4);ctx.closePath();ctx.fill();
ctx.strokeStyle="#171c19";ctx.lineWidth=1.3;ctx.stroke();
ctx.fillStyle="#2d6e46";ctx.beginPath();ctx.ellipse(-2,-h*0.76,w*0.58,4.2,-0.12,0,Math.PI*2);ctx.fill();
break;
}
case "wine_jar":{
ctx.fillStyle="rgba(220,165,65,0.28)";ctx.beginPath();ctx.ellipse(8,5,12,5,0,0,Math.PI*2);ctx.fill();
const jg=ctx.createRadialGradient(-4,-11,2,0,-8,14);
jg.addColorStop(0,"#c47843");jg.addColorStop(0.6,"#7d3e1d");jg.addColorStop(1,"#3b1a0b");
ctx.fillStyle=jg;ctx.beginPath();ctx.ellipse(0,-8,11,12,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#2b1207";ctx.lineWidth=1.2;ctx.stroke();
ctx.strokeStyle="#d9b37c";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-10,-8);ctx.quadraticCurveTo(0,-5,10,-8);ctx.stroke();
ctx.fillStyle="#c0392b";ctx.beginPath();ctx.ellipse(0,-19,6.5,3.5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.fillRect(-2,-14,4,6);
break;
}
case "glowing_shroom":{
const gl=ctx.createRadialGradient(0,-12,2,0,-12,22);
gl.addColorStop(0,"rgba(72,240,185,0.45)");gl.addColorStop(1,"rgba(72,240,185,0)");
ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,-12,22,0,Math.PI*2);ctx.fill();
for (const [mx,mh,mr,col] of [[-7,12,7,"#28b485"],[6,10,6,"#8e44ad"],[0,18,10,"#38e8a8"]]) {
ctx.fillStyle="#dce8e2";ctx.fillRect(mx - 2.2,-mh + 3,4.4,mh);
const cg=ctx.createRadialGradient(mx - 2,-mh - 2,1,mx,-mh,mr);
cg.addColorStop(0,"#ffffff");cg.addColorStop(0.45,col);cg.addColorStop(1,"#162b24");
ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(mx,-mh + 2,mr,mr*0.58,0,Math.PI,0);ctx.closePath();ctx.fill();
ctx.fillStyle="rgba(255,255,255,0.75)";
ctx.beginPath();ctx.arc(mx - mr*0.35,-mh - 1,1.3,0,Math.PI*2);ctx.arc(mx + mr*0.25,-mh - 2,1.1,0,Math.PI*2);ctx.fill();
}
break;
}
case "stalagmite":{
for (const [sx,sh,sw] of [[-8,18,6],[7,15,5.5],[0,32,9.5]]) {
const sg=ctx.createLinearGradient(sx - sw,-sh,sx + sw,4);
sg.addColorStop(0,"#9c8d7a");sg.addColorStop(0.5,"#594d40");sg.addColorStop(1,"#241d17");
ctx.fillStyle=sg;
ctx.beginPath();ctx.moveTo(sx - sw,4);ctx.lineTo(sx - sw*0.35,-sh*0.7);ctx.lineTo(sx,-sh);ctx.lineTo(sx + sw*0.4,-sh*0.65);ctx.lineTo(sx + sw,4);ctx.closePath();ctx.fill();
ctx.strokeStyle="rgba(255,240,210,0.22)";ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx,-sh);ctx.lineTo(sx - sw*0.2,2);ctx.stroke();
}
break;
}
case "blood_crystal":
case "blood_altar":{
const gl=ctx.createRadialGradient(0,-14,2,0,-14,26);
gl.addColorStop(0,"rgba(235,38,52,0.52)");gl.addColorStop(1,"rgba(180,10,20,0)");
ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,-14,26,0,Math.PI*2);ctx.fill();
if (type==="blood_altar") {
ctx.fillStyle="#2e171a";ctx.strokeStyle="#b83232";ctx.lineWidth=1.6;
ctx.beginPath();ctx.ellipse(0,0,15,8,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#9e111b";ctx.beginPath();ctx.ellipse(0,-1,11,5,0,0,Math.PI*2);ctx.fill();
}
const cg=ctx.createLinearGradient(-9,-30,9,4);
cg.addColorStop(0,"#ff99a1");cg.addColorStop(0.35,"#e02424");cg.addColorStop(1,"#4d080d");
ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(9,-8);ctx.lineTo(6,4);ctx.lineTo(-6,4);ctx.lineTo(-9,-8);ctx.closePath();ctx.fill();
ctx.strokeStyle="#ffb3b8";ctx.lineWidth=1;ctx.stroke();
break;
}
case "skull_pile":{
ctx.strokeStyle="#cfd8de";ctx.lineWidth=2.2;
ctx.beginPath();ctx.moveTo(-11,3);ctx.lineTo(11,-3);ctx.moveTo(-9,-4);ctx.lineTo(10,4);ctx.stroke();
for (const [sx,sy,sr] of [[-6,0,5.2],[6,1,5],[0,-6,5.8]]) {
const sk=ctx.createRadialGradient(sx - 1.5,sy - 1.5,1,sx,sy,sr);
sk.addColorStop(0,"#ffffff");sk.addColorStop(0.65,"#d5dde3");sk.addColorStop(1,"#7f8c94");
ctx.fillStyle=sk;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#1f2428";ctx.fillRect(sx - 2.6,sy - 1,1.8,2);ctx.fillRect(sx + 0.8,sy - 1,1.8,2);
}
break;
}
case "broken_fence":{
for (let i=-1;i<=1;i++) {
const px=i*9;const h=20 + (i===0?6 :0);
ctx.fillStyle="#593d25";ctx.strokeStyle="#26170b";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(px - 3,4);ctx.lineTo(px - 3,-h + 5);ctx.lineTo(px,-h);ctx.lineTo(px + 3,-h + 5);ctx.lineTo(px + 3,4);ctx.closePath();ctx.fill();ctx.stroke();
}
ctx.fillStyle="#6e4d30";ctx.fillRect(-13,-10,26,4);ctx.strokeRect(-13,-10,26,4);
ctx.fillStyle="#3b8beb";ctx.beginPath();ctx.moveTo(2,-22);ctx.lineTo(13,-19);ctx.lineTo(9,-12);ctx.lineTo(2,-15);ctx.closePath();ctx.fill();
break;
}
case "pine_tree":
case "frozen_pine":{
const isIce=(type==="frozen_pine");
ctx.fillStyle="#3d2716";ctx.fillRect(-3.8,-6,7.6,12);
const tiers=[[0,-8,17,13],[0,-19,14,12],[0,-29,10.5,11]];
for (const [tx,ty,tw,th] of tiers) {
const g=ctx.createLinearGradient(0,ty - th,0,ty + 4);
if (isIce) {g.addColorStop(0,"#dff4ff");g.addColorStop(0.55,"#5d9ec4");g.addColorStop(1,"#1f3f57");}
else {g.addColorStop(0,"#2f704c");g.addColorStop(0.55,"#1a452d");g.addColorStop(1,"#0c2417");}
ctx.fillStyle=g;
ctx.beginPath();ctx.moveTo(tx,ty - th);ctx.lineTo(tx - tw,ty + 3);ctx.quadraticCurveTo(tx,ty + 6,tx + tw,ty + 3);ctx.closePath();ctx.fill();
if (isIce) {ctx.strokeStyle="#ffffff";ctx.lineWidth=1;ctx.stroke();}
}
break;
}
case "wolf_totem":{
ctx.fillStyle="#453f3a";ctx.strokeStyle="#1f1b18";ctx.lineWidth=1.3;
ctx.fillRect(-7,-24,14,28);ctx.strokeRect(-7,-24,14,28);
ctx.fillStyle="#dfe6eb";
ctx.beginPath();ctx.moveTo(-10,-22);ctx.lineTo(-7,-32);ctx.lineTo(0,-28);ctx.lineTo(7,-32);ctx.lineTo(10,-22);ctx.lineTo(0,-15);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#ff3b30";ctx.beginPath();ctx.arc(-3.2,-23,1.8,0,Math.PI*2);ctx.arc(3.2,-23,1.8,0,Math.PI*2);ctx.fill();
break;
}
case "bone_pillar":
case "bone_spikes":{
const bg=ctx.createLinearGradient(-8,-30,8,4);
bg.addColorStop(0,"#ffffff");bg.addColorStop(0.55,"#cfd8e0");bg.addColorStop(1,"#5b6873");
ctx.fillStyle=bg;ctx.strokeStyle="#2b333b";ctx.lineWidth=1.2;
if (type==="bone_spikes") {
for (const [ang,len] of [[-0.38,24],[0,32],[0.38,24]]) {
ctx.save();ctx.rotate(ang);
ctx.beginPath();ctx.moveTo(-4,4);ctx.quadraticCurveTo(-2,-len*0.6,0,-len);ctx.quadraticCurveTo(3,-len*0.5,4,4);ctx.closePath();ctx.fill();ctx.stroke();
ctx.restore();
}
} else {
ctx.fillRect(-7,-28,14,32);ctx.strokeRect(-7,-28,14,32);
ctx.beginPath();ctx.arc(-6,-28,5,0,Math.PI*2);ctx.arc(6,-28,5,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.arc(-7,2,5,0,Math.PI*2);ctx.arc(7,2,5,0,Math.PI*2);ctx.fill();ctx.stroke();
}
break;
}
case "charred_tree":{
ctx.strokeStyle="#1f1a18";ctx.lineWidth=6;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(0,5);ctx.quadraticCurveTo(-5,-10,2,-24);ctx.stroke();
ctx.lineWidth=3.2;
ctx.beginPath();ctx.moveTo(0,-12);ctx.quadraticCurveTo(-12,-18,-15,-27);ctx.moveTo(1,-16);ctx.quadraticCurveTo(11,-22,14,-30);ctx.stroke();
ctx.fillStyle="#7ef7c4";ctx.beginPath();ctx.arc(-15,-27,2.4,0,Math.PI*2);ctx.arc(14,-30,2.2,0,Math.PI*2);ctx.fill();
break;
}
case "stone_lantern":{
const g=ctx.createRadialGradient(0,-20,2,0,-20,26);
g.addColorStop(0,"rgba(255,215,95,0.48)");g.addColorStop(1,"rgba(255,180,50,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-20,26,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#524b42";ctx.strokeStyle="#24201c";ctx.lineWidth=1.2;
ctx.fillRect(-8,0,16,5);ctx.fillRect(-4,-16,8,16);
ctx.fillStyle="#ffeaa7";ctx.fillRect(-5,-24,10,8);ctx.strokeRect(-6,-25,12,10);
ctx.fillStyle="#3d3730";ctx.beginPath();ctx.moveTo(-12,-24);ctx.lineTo(0,-33);ctx.lineTo(12,-24);ctx.closePath();ctx.fill();ctx.stroke();
break;
}
case "golden_brazier":{
const g=ctx.createRadialGradient(0,-16,3,0,-16,30);
g.addColorStop(0,"rgba(255,130,45,0.52)");g.addColorStop(1,"rgba(255,90,20,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-16,30,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#8a6c34";ctx.lineWidth=2.6;
ctx.beginPath();ctx.moveTo(-7,-3);ctx.lineTo(-9,5);ctx.moveTo(7,-3);ctx.lineTo(9,5);ctx.moveTo(0,-2);ctx.lineTo(0,6);ctx.stroke();
const bg=ctx.createLinearGradient(-12,-14,12,0);
bg.addColorStop(0,"#59411b");bg.addColorStop(0.5,"#d4af37");bg.addColorStop(1,"#3b2a10");
ctx.fillStyle=bg;ctx.beginPath();ctx.ellipse(0,-8,12,7.5,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.2;ctx.stroke();
ctx.fillStyle="#ff5733";ctx.beginPath();ctx.moveTo(-6,-10);ctx.quadraticCurveTo(0,-28,6,-10);ctx.closePath();ctx.fill();
ctx.fillStyle="#fff2a6";ctx.beginPath();ctx.arc(0,-13,3.5,0,Math.PI*2);ctx.fill();
break;
}
case "jade_pillar":
case "dragon_pillar":{
const isDrag=(type==="dragon_pillar");
ctx.fillStyle="#3d362c";ctx.strokeStyle="#d4af37";ctx.lineWidth=1.4;
ctx.fillRect(-10,-1,20,7);ctx.strokeRect(-10,-1,20,7);
const cg=ctx.createLinearGradient(-7,0,7,0);
if (isDrag) {cg.addColorStop(0,"#5e4414");cg.addColorStop(0.5,"#f0c967");cg.addColorStop(1,"#3b290a");}
else {cg.addColorStop(0,"#0f4d3b");cg.addColorStop(0.5,"#4ee0ad");cg.addColorStop(1,"#0a2e23");}
ctx.fillStyle=cg;ctx.fillRect(-7,-32,14,32);ctx.strokeRect(-7,-32,14,32);
ctx.strokeStyle="#fff2a6";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(-6,-6);ctx.bezierCurveTo(6,-13,-6,-21,6,-28);ctx.stroke();
ctx.fillStyle="#d4af37";ctx.fillRect(-10,-36,20,5);
break;
}
case "sword_monument":{
ctx.fillStyle="#3d3c3b";ctx.beginPath();ctx.ellipse(0,3,13,6,0,0,Math.PI*2);ctx.fill();
const sg=ctx.createLinearGradient(-5,-36,5,0);
sg.addColorStop(0,"#ffffff");sg.addColorStop(0.5,"#99a8b5");sg.addColorStop(1,"#3d464f");
ctx.fillStyle=sg;ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(5,-28);ctx.lineTo(4,2);ctx.lineTo(-4,2);ctx.lineTo(-5,-28);ctx.closePath();ctx.fill();
ctx.strokeStyle="#1f252b";ctx.lineWidth=1;ctx.stroke();
ctx.fillStyle="#d4af37";ctx.fillRect(-9,-18,18,3.5);
break;
}
case "lava_vent":{
const g=ctx.createRadialGradient(0,-4,3,0,-4,24);
g.addColorStop(0,"rgba(255,115,35,0.65)");g.addColorStop(1,"rgba(255,60,10,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-4,24,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#241614";ctx.strokeStyle="#4d261c";ctx.lineWidth=1.4;
ctx.beginPath();ctx.moveTo(-14,5);ctx.lineTo(-9,-10);ctx.lineTo(9,-10);ctx.lineTo(14,5);ctx.closePath();ctx.fill();ctx.stroke();
ctx.fillStyle="#ff6b35";ctx.beginPath();ctx.ellipse(0,-9,7.5,3.5,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#fff2a6";ctx.beginPath();ctx.ellipse(0,-9,4,1.8,0,0,Math.PI*2);ctx.fill();
break;
}
case "ice_crystal":
case "pink_soul_crystal":{
const isPink=(type==="pink_soul_crystal");
const cHi=isPink?"#ffb8e6" :"#bff0ff";
const cMid=isPink?"#e854b0" :"#4cb5e6";
const cDk=isPink?"#4a123a" :"#123c59";
const gl=ctx.createRadialGradient(0,-14,2,0,-14,24);
gl.addColorStop(0,isPink?"rgba(255,133,213,0.48)" :"rgba(116,234,255,0.48)");gl.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=gl;ctx.beginPath();ctx.arc(0,-14,24,0,Math.PI*2);ctx.fill();
for (const [ox,h,w,rot] of [[-7,17,5,-0.25],[7,15,4.5,0.28],[0,30,8.5,0]]) {
ctx.save();ctx.translate(ox,2);ctx.rotate(rot);
const cg=ctx.createLinearGradient(-w,-h,w,0);
cg.addColorStop(0,"#ffffff");cg.addColorStop(0.35,cMid);cg.addColorStop(1,cDk);
ctx.fillStyle=cg;ctx.beginPath();ctx.moveTo(0,-h);ctx.lineTo(w,-h*0.28);ctx.lineTo(w*0.65,2);ctx.lineTo(-w*0.65,2);ctx.lineTo(-w,-h*0.28);ctx.closePath();ctx.fill();
ctx.strokeStyle=cHi;ctx.lineWidth=1;ctx.stroke();ctx.restore();
}
break;
}
case "refinement_cauldron":{
const g=ctx.createRadialGradient(0,-16,2,0,-16,26);
g.addColorStop(0,"rgba(76,230,255,0.5)");g.addColorStop(1,"rgba(76,230,255,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-16,26,0,Math.PI*2);ctx.fill();
const cg=ctx.createLinearGradient(-12,-18,12,2);
cg.addColorStop(0,"#1c5c6b");cg.addColorStop(0.5,"#4ce6ff");cg.addColorStop(1,"#0e2f38");
ctx.fillStyle=cg;ctx.beginPath();ctx.ellipse(0,-8,12,10,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.6;ctx.stroke();
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.ellipse(0,-16,9,4,0,0,Math.PI*2);ctx.fill();
break;
}
case "stone_lotus":
case "lotus_pad":{
ctx.fillStyle="#1f7a4d";ctx.strokeStyle="#5cc995";ctx.lineWidth=1.2;
ctx.beginPath();ctx.arc(0,0,12,0.2,Math.PI*2 - 0.2);ctx.lineTo(0,0);ctx.closePath();ctx.fill();ctx.stroke();
for (let p=0;p<6;p++) {
const a=(p*Math.PI)/3;
ctx.fillStyle=(p % 2===0)?"#ff85a2" :"#ffc2d4";
ctx.beginPath();ctx.ellipse(Math.cos(a)*5,Math.sin(a)*4 - 2,5,2.6,a,0,Math.PI*2);ctx.fill();
}
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(0,-2,2.8,0,Math.PI*2);ctx.fill();
break;
}
case "chaos_monolith":{
const g=ctx.createRadialGradient(0,-18,3,0,-18,30);
g.addColorStop(0,"rgba(183,92,255,0.58)");g.addColorStop(1,"rgba(90,20,160,0)");
ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,-18,30,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#11081f";ctx.strokeStyle="#b75cff";ctx.lineWidth=1.6;
ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(9,-26);ctx.lineTo(7,-4);ctx.lineTo(0,2);ctx.lineTo(-7,-4);ctx.lineTo(-9,-26);ctx.closePath();ctx.fill();ctx.stroke();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-7,-18);ctx.lineTo(7,-14);ctx.moveTo(-7,-10);ctx.lineTo(7,-22);ctx.stroke();
break;
}
default:{
ctx.fillStyle="#3a403d";ctx.beginPath();ctx.ellipse(0,-4,11,8,0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#6a756f";ctx.lineWidth=1.2;ctx.stroke();
break;
}
}
ctx.restore();
}

// ==============================================================================
// 3. FAST 144-FPS RESOURCE NODE PEDESTAL RENDERER (CACHED ICON SPRITE!)
// ==============================================================================
const LIVING_TREE_TYPES=new Set([
"ancient_banyan","weeping_willow","peach_blossom_tree","crimson_maple",
"spirit_cypress","bamboo_clump_tall","bamboo_stalk","pine_tree",
"frozen_pine","crystal_tree","giant_mushroom_tree","desert_palm",
"dead_gnarled_oak","charred_tree"
]);

const INTERACTIVE_ROCK_TYPES=new Set([
"boulder_group","craggy_spire","moss_rock","rock_pillar",
"stalagmite","ruined_wall_seg","ice_crystal","blood_crystal","pink_soul_crystal"
]);

function isLivingTree(type) {return LIVING_TREE_TYPES.has(type);}
function isInteractiveRock(type) {return INTERACTIVE_ROCK_TYPES.has(type);}

function getPropLeafColor(type) {
if (type==="peach_blossom_tree") return "#ff9be0";
if (type==="crimson_maple") return "#ff5733";
if (type==="frozen_pine") return "#bff0ff";
if (type==="crystal_tree") return "#ff85d5";
if (type==="giant_mushroom_tree") return "#52e3a8";
if (type==="dead_gnarled_oak"||type==="charred_tree") return "#9e8b76";
return "#5cc995";
}

const _PROP_SPRITE_CACHE=new Map();
function drawCachedProp(ctx,x,y,type) {
let spr=_PROP_SPRITE_CACHE.get(type);
if (!spr) {
spr=document.createElement("canvas");
spr.width=96;
spr.height=112;
const sctx=spr.getContext("2d");
// Soft directional Xianxia sunlight ground shadow
sctx.fillStyle="rgba(0,0,0,0.22)";
sctx.beginPath();sctx.ellipse(54,84,22,8,0.18,0,Math.PI*2);sctx.fill();
renderProp(sctx,48,80,type,0);
if (_PROP_SPRITE_CACHE.size>64) _PROP_SPRITE_CACHE.clear();
_PROP_SPRITE_CACHE.set(type,spr);
}
ctx.drawImage(spr,x - 48,y - 80);
}

function drawDynamicProp(ctx,dec,camX,camY,t,player) {
if (!dec||dec.broken) return;
const sx=dec.x - camX;
const sy=dec.y - camY;
ctx.save();
if (dec.isTree) {
// Semi-transparent canopy fade when player walks behind the tree canopy!
const behind=Boolean(player&&player.y<dec.y&&player.y>dec.y - 54&&Math.abs(player.x - dec.x)<32);
if (behind) ctx.globalAlpha=0.46;
// Gentle living wind sway + extra rustle when player brushes past!
const rustle=dec.rustleTimer>0?Math.sin(t*24)*0.08*(dec.rustleTimer/0.45) :0;
const sway=Math.sin(t*1.9 + (dec.swayPhase||0))*0.042 + rustle;
ctx.translate(sx,sy);
ctx.transform(1,0,sway,1,0,0);
drawCachedProp(ctx,0,0,dec.type);
} else {
// 2.5D Interactive Rock with damage shake & glowing fracture cracks!
const sh=dec.hitFlash>0?(Math.random() - 0.5)*4 :0;
drawCachedProp(ctx,sx + sh,sy,dec.type);
if (dec.cracked) {
ctx.strokeStyle=dec.type==="ice_crystal"?"#bff0ff" :(dec.type==="blood_crystal"?"#ff5252" :"#ffd700");
ctx.lineWidth=1.8;
ctx.beginPath();
ctx.moveTo(sx - 8,sy - 14);ctx.lineTo(sx + 1,sy - 5);ctx.lineTo(sx + 8,sy - 12);
ctx.moveTo(sx + 1,sy - 5);ctx.lineTo(sx - 2,sy + 2);
ctx.stroke();
}
}
ctx.restore();
}

global.MapArtRenderer=global.MapArtRenderer||{};
global.MapArtRenderer.renderProp=renderProp;
global.MapArtRenderer.drawCachedProp=drawCachedProp;
global.MapArtRenderer.drawDynamicProp=drawDynamicProp;
global.MapArtRenderer.isLivingTree=isLivingTree;
global.MapArtRenderer.isInteractiveRock=isInteractiveRock;
global.MapArtRenderer.getPropLeafColor=getPropLeafColor;
})(window);
