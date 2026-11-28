(function (global) {
"use strict";
Object.assign(global.EnemyManager.prototype, {
_getHumanEnemyVisualSkin(b) {
const skinMap=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
if (b.skinKey&&skinMap[b.skinKey]) return skinMap[b.skinKey];
const nm=String(b.name||"").toLowerCase();
if (nm.includes("tinh tú")) return skinMap.tinh_tu||skinMap.phuong_nguyen;
if (nm.includes("u hồn")) return skinMap.u_hon||skinMap.phuong_nguyen;
if (nm.includes("hồng liên")) return skinMap.hong_lien||skinMap.phuong_nguyen;
if (nm.includes("hắc lâu lan")) return skinMap.hac_lau_lan||skinMap.phuong_nguyen;
if (nm.includes("bạch ngưng băng")) return skinMap.bach_ngung_bang||skinMap.phuong_nguyen;
if (nm.includes("phượng cửu ca")) return skinMap.phuong_cuu_ca||skinMap.phuong_nguyen;
const isFemale=nm.includes("tiên tử")||nm.includes("nữ")||nm.includes("kim hoàng")||nm.includes("mị")||nm.includes("tử vi")||nm.includes("nhược nam");
const isElder=nm.includes("lão")||nm.includes("nhất đại")||nm.includes("trường phàm")||nm.includes("long công")||nm.includes("cự dương")||nm.includes("thượng nhân")||nm.includes("vương");
const isVen=Boolean(b.isVenerable);
const mainCol=b.color||"#7a1616";
return {
gender:isFemale?"female" :"male",
hasBeard:isElder&& !isFemale,
isArmored:Boolean(b.isBoss&& !isFemale&&(nm.includes("long công")||nm.includes("chiến")||nm.includes("tướng")||nm.includes("thiết"))),
isVenerableSkin:isVen,
robeColor:mainCol,
robeSecondary:"#1c222e",
capeColor:"#14101a",
trimColor:isVen?"#ffd700" :(b.isBoss?"#ffd700" :"#d4af37"),
beltColor:"#e2bf75",
hairColor:isElder?"#dce4ed" :"#0f121a",
hairStyle:isFemale?"jade_hairpin" :(isVen?"immortal_lotus" :(isElder?"elder_sage" :"noble_crown")),
skinTone:"#efd4b8",
eyeColor:isVen?"#00e5ff" :(b.enraged?"#ff2a2a" :"#ffd700"),
crownColor:"#ffd700",
auraColor:isVen?"rgba(255,215,0,0.38)" :"rgba(255,77,77,0.30)",
particleColor:"#ffd700",
specialFeature:isVen?"light_sun_halo" :(b.isBoss&&nm.includes("huyết")?"martial_flames" :(nm.includes("tử vi")||nm.includes("trường phàm")?"orbiting_stars" :""))
};
},
_getNpcVisualSkin(npc) {
const skins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
if (npc.id==="npc_kim_van_tai"&&skins.thuong_tam_tu) return skins.thuong_tam_tu;
if (npc.id==="npc_han_nhu_suong"&&skins.bach_ngung_bang) return skins.bach_ngung_bang;
if (npc.id==="npc_luc_thanh_y") {
return {
robeColor:"#18365c",robeSecondary:"#28558c",trimColor:"#7ef7f0",beltColor:"#d4af37",
hairColor:"#10141d",hairStyle:"noble_crown",skinTone:"#f0d6ba",eyeColor:"#3b8beb",
crownColor:"#7ef7f0",auraColor:"rgba(90,169,230,0.28)",particleColor:"#7ef7f0",specialFeature:"orbiting_stars"
};
}
if (npc.id==="npc_luc_ba_thien") {
return {
robeColor:"#184734",robeSecondary:"#266b4e",trimColor:"#98f5c8",beltColor:"#e2bf75",
gender:"male",hasBeard:true,hairColor:"#dce4ed",hairStyle:"elder_sage",skinTone:"#e8cba8",eyeColor:"#4cd964",
crownColor:"#e2bf75",auraColor:"rgba(76,217,100,0.26)",particleColor:"#98f5c8",specialFeature:"jade_lotus"
};
}
if (npc.id==="npc_le_huyet_cuong") {
return {
robeColor:"#2b0b11",robeSecondary:"#54131f",trimColor:"#ff3b30",beltColor:"#b89758",
gender:"male",capeColor:"#1c060a",hairColor:"#14080a",hairStyle:"demonic_wild",skinTone:"#dec2b8",eyeColor:"#ff2a2a",
crownColor:"#ff3b30",auraColor:"rgba(224,52,52,0.32)",particleColor:"#ff4d4d",specialFeature:"martial_flames"
};
}
return {
robeColor:npc.color||"#254d7a",robeSecondary:"#162436",trimColor:"#e2bf75",beltColor:"#d4af37",
hairColor:"#12151c",hairStyle:"long_flowing",skinTone:"#edd2b5",eyeColor:"#5aa9e6",
crownColor:"#e2bf75",auraColor:"rgba(90,169,230,0.24)",particleColor:"#e2bf75",specialFeature:""
};
},
_drawBeastArt(ctx,b,t) {
// Fast Offscreen Sprite Cache for regular & elite mobs (cuts 30-mob zoom-out cost by ~12x!)
if (!b.isBoss&& !b.isVenerable) {
if (!this._beastSpriteCache) this._beastSpriteCache=new Map();
const r0=Math.round(b.radius||16);
const fDir=(this.player&&this.player.x<b.x)? -1 :1;
const animF=Math.floor((t*1.6) + (b.x||0)*0.01) % 2;
const key=`${b.typeId||"wolf"}_${b.color||""}_${b.isElite?1 :0}_${b.enraged?1 :0}_${r0}_${fDir}_${animF}`;
let spr=this._beastSpriteCache.get(key);
const dim=Math.max(84,Math.ceil(r0*5.2));
const half=dim*0.5;
if (!spr) {
spr=document.createElement("canvas");
spr.width=dim;spr.height=dim;
const sctx=spr.getContext("2d");
sctx.translate(half,half);
this._drawBeastArtDirect(sctx,b,animF===0?0.3 :1.85,fDir);
if (this._beastSpriteCache.size>=96) {
const oldK=this._beastSpriteCache.keys().next().value;
this._beastSpriteCache.delete(oldK);
}
this._beastSpriteCache.set(key,spr);
} else {
this._beastSpriteCache.delete(key);
this._beastSpriteCache.set(key,spr);
}
ctx.drawImage(spr,-half,-half);
return;
}
const fDirBoss=(this.player&&this.player.x<b.x)? -1 :1;
this._drawBeastArtDirect(ctx,b,t,fDirBoss);
},
_drawBeastArtDirect(ctx,b,t,forcedFaceDir) {
const r=b.radius||16;
const scale=Math.max(0.85,r / 15.5);
const tid=b.typeId||"green_wolf";
const nm=String(b.name||"").toLowerCase();
const enraged=Boolean(b.enraged);
const isBoss=Boolean(b.isBoss);
const isElite=Boolean(b.isElite);
const stride=Math.sin(t*3.2 + (b.x||0)*0.03);
const flap=Math.sin(t*4.4 + (b.y||0)*0.02);
const breath=Math.sin(t*1.8)*1.2;
const faceDir=(typeof forcedFaceDir==="number")?forcedFaceDir :((this.player&&this.player.x<b.x)? -1 :1);

ctx.save();
// Ground Shadow
ctx.fillStyle="rgba(0,0,0,0.48)";
ctx.beginPath();
ctx.ellipse(0,r*0.78,r*1.08,r*0.38,0,0,Math.PI*2);
ctx.fill();

// Boss / Elite / Enraged Aura Ring under creature
if (isBoss||isElite||enraged) {
ctx.save();
ctx.translate(0,r*0.72);
ctx.scale(1,0.42);
ctx.rotate(t*(enraged?1.4 :0.65));
ctx.strokeStyle=enraged?"#ff3b30" :(isBoss?"#ffd700" :"#c278ff");
ctx.lineWidth=isBoss?2.8 :2.0;

ctx.beginPath();
ctx.arc(0,0,r*1.38,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}

// Soft Ambient Glow
const glowR=r*1.55;
const gGlow=ctx.createRadialGradient(0,-2,2,0,-2,glowR);
gGlow.addColorStop(0,enraged?"rgba(255,59,48,0.34)" :(isBoss?"rgba(255,215,0,0.24)" :"rgba(110,200,170,0.16)"));
gGlow.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=gGlow;
ctx.beginPath();
ctx.arc(0,-2,glowR,0,Math.PI*2);
ctx.fill();

ctx.scale(faceDir*scale,scale);

// --- 1. DESOLATE THUNDER DRAGON (Thái Cổ Lôi Giao Hoang Thú) ---
if (tid==="desolate_thunder_dragon"||nm.includes("giao")||nm.includes("long")||nm.includes("niên thú")) {
const mainCol=enraged?"#ff4d6d" :(b.color||"#9b59b6");
const bellyCol="#e8d5ff";
// Sinuous 8-segment coiling dragon body
for (let seg=7;seg>=1;seg--) {
const sx=-seg*4.2 + Math.sin(t*2.6 + seg*0.75)*3.2;
const sy=4 + Math.cos(t*2.4 + seg*0.8)*5.5;
const sr=Math.max(3.2,9.2 - seg*0.82);
const segGrad=ctx.createRadialGradient(sx - 1.5,sy - 1.5,1,sx,sy,sr);
segGrad.addColorStop(0,"#d8a6ff");
segGrad.addColorStop(0.55,mainCol);
segGrad.addColorStop(1,"#201038");
ctx.fillStyle=segGrad;
ctx.beginPath();
ctx.arc(sx,sy,sr,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="rgba(255,215,0,0.45)";
ctx.lineWidth=0.7;
ctx.stroke();
// Dorsal spine fin
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.moveTo(sx - 1.5,sy - sr + 1);
ctx.lineTo(sx - 3.5,sy - sr - 4.2);
ctx.lineTo(sx + 2,sy - sr + 1);
ctx.closePath();
ctx.fill();
}
// Dragon Head
ctx.save();
ctx.translate(4,-2 + breath*0.6);
const hGrad=ctx.createLinearGradient(-8,-8,14,6);
hGrad.addColorStop(0,"#c78cff");
hGrad.addColorStop(0.6,mainCol);
hGrad.addColorStop(1,"#2a144a");
ctx.fillStyle=hGrad;
ctx.beginPath();
ctx.moveTo(-8,-6);
ctx.quadraticCurveTo(4,-9,14,-3);
ctx.lineTo(15,2);
ctx.quadraticCurveTo(6,6,-6,4);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#ffd700";
ctx.lineWidth=1.1;
ctx.stroke();
// Golden Dragon Antlers
ctx.strokeStyle="#ffd700";
ctx.lineWidth=1.9;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-2,-6);
ctx.lineTo(-9,-16);
ctx.moveTo(-6,-12);
ctx.lineTo(-3,-15);
ctx.moveTo(2,-6);
ctx.lineTo(-2,-15);
ctx.stroke();
// Flowing Whiskers
ctx.strokeStyle="#7ef7f0";
ctx.lineWidth=1.1;
ctx.beginPath();
ctx.moveTo(12,0);
ctx.quadraticCurveTo(18,-4 + Math.sin(t*5)*3,23,1 + Math.cos(t*4)*2.5);
ctx.moveTo(11,2);
ctx.quadraticCurveTo(16,6 + Math.cos(t*5)*2,21,7);
ctx.stroke();
// Glowing Dragon Eye & Fangs
ctx.fillStyle="#ffe600";
ctx.beginPath();
ctx.ellipse(5,-2.5,2.4,1.5,-0.2,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.fillRect(10,2,1.6,2.8);
ctx.fillRect(13,1.5,1.4,2.4);
// Orbiting Thunder Pearl in front of jaws
const px=19 + Math.cos(t*3)*1.8;
const py=-5 + Math.sin(t*3)*1.8;
const pGrad=ctx.createRadialGradient(px,py,0.5,px,py,4.5);
pGrad.addColorStop(0,"#ffffff");
pGrad.addColorStop(0.5,"#7ef7f0");
pGrad.addColorStop(1,"rgba(183,92,255,0)");
ctx.fillStyle=pGrad;
ctx.beginPath();
ctx.arc(px,py,4.5,0,Math.PI*2);
ctx.fill();
ctx.restore();
// Crackling Purple Lightning Arc
ctx.strokeStyle="#c56cf0";
ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(-14,-8);
ctx.lineTo(-7,-12 + Math.sin(t*14)*3);
ctx.lineTo(0,-8);
ctx.lineTo(7,-13 + Math.cos(t*15)*3);
ctx.stroke();

// --- 2. ANCIENT ROCK BEHEMOTH (Thái Cổ Huyền Thạch Cự Tượng) ---
} else if (tid==="ancient_rock_behemoth"||nm.includes("cự tượng")||nm.includes("thạch")) {
// Orbiting Earth-Dao Stones
for (let k=0;k<3;k++) {
const a=t*1.2 + (k*Math.PI*2)/3;
const ox=Math.cos(a)*19;
const oy=-4 + Math.sin(a)*9;
ctx.fillStyle="#574e45";
ctx.strokeStyle="#ffd700";
ctx.lineWidth=0.9;
ctx.beginPath();
ctx.moveTo(ox,oy - 3);
ctx.lineTo(ox + 3,oy);
ctx.lineTo(ox,oy + 3);
ctx.lineTo(ox - 3,oy);
ctx.closePath();
ctx.fill();
ctx.stroke();
}
// Heavy Pillar Legs
ctx.fillStyle="#3a3530";
ctx.fillRect(-11,5 + stride*1.5,5.5,7);
ctx.fillRect(-3,6 - stride*1.5,5.5,6.5);
ctx.fillRect(5,5 + stride*1.5,5.5,7);
// Colossal Armored Stone Torso
const bGrad=ctx.createRadialGradient(-2,-5,3,0,-1,16);
bGrad.addColorStop(0,"#786c5e");
bGrad.addColorStop(0.6,"#423b34");
bGrad.addColorStop(1,"#1c1814");
ctx.fillStyle=bGrad;
ctx.beginPath();
ctx.ellipse(-1,-1 + breath*0.5,14.5,11.2,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="#d4af37";
ctx.lineWidth=1.3;
ctx.stroke();
// Glowing Golden Earth-Dao Fissure Cracks on Armor
ctx.strokeStyle="#ffd700";
ctx.lineWidth=1.1;
ctx.beginPath();
ctx.moveTo(-9,-4);ctx.lineTo(-4,-1);ctx.lineTo(-6,4);
ctx.moveTo(-1,-9);ctx.lineTo(1,-3);ctx.lineTo(5,-1);
ctx.stroke();
// Elephant Ears & Armored Head
ctx.fillStyle="#4e463d";
ctx.beginPath();
ctx.ellipse(5,-6 + breath*0.5,6.2,7.8,0.2,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="#b89758";
ctx.lineWidth=1;
ctx.stroke();
// Raised Trunk
ctx.strokeStyle="#574e45";
ctx.lineWidth=4.2;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(11,-2 + breath*0.5);
ctx.quadraticCurveTo(17,1,16,-7 + Math.sin(t*2)*2);
ctx.stroke();
// Enormous Curving Golden Ivory Tusks
ctx.strokeStyle="#fff5cc";
ctx.lineWidth=2.6;
ctx.beginPath();
ctx.moveTo(10,1);
ctx.quadraticCurveTo(18,5,21,-2);
ctx.moveTo(9,3);
ctx.quadraticCurveTo(16,8,19,2);
ctx.stroke();
// Glowing Eyes & Forehead Rune
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.arc(10,-4.5 + breath*0.5,2.0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ff3b30";
ctx.beginPath();
ctx.arc(11.5,-1.8 + breath*0.5,1.6,0,Math.PI*2);
ctx.fill();

// --- 3. FROST PYTHON LORD (Hàn Sương Bạch Ngọc Mãng) ---
} else if (tid==="frost_python_lord"||nm.includes("mãng")||nm.includes("xà")) {
for (let seg=7;seg>=1;seg--) {
const sx=-seg*3.8 + Math.sin(t*2.8 + seg*0.85)*3.4;
const sy=3 + Math.cos(t*2.5 + seg*0.85)*5.0;
const sr=Math.max(2.8,7.8 - seg*0.65);
const sGrad=ctx.createRadialGradient(sx - 1,sy - 1,1,sx,sy,sr);
sGrad.addColorStop(0,"#ffffff");
sGrad.addColorStop(0.55,"#b8e8ff");
sGrad.addColorStop(1,"#2f6b8f");
ctx.fillStyle=sGrad;
ctx.beginPath();
ctx.arc(sx,sy,sr,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="rgba(255,255,255,0.65)";
ctx.lineWidth=0.7;
ctx.stroke();
// Ice Dorsal Crystal
if (seg % 2===1) {
ctx.fillStyle="#7ef7f0";
ctx.beginPath();
ctx.moveTo(sx - 1.5,sy - sr + 1);
ctx.lineTo(sx,sy - sr - 4.0);
ctx.lineTo(sx + 1.5,sy - sr + 1);
ctx.closePath();
ctx.fill();
}
}
// Horned White-Jade Serpent Head
ctx.save();
ctx.translate(4,-2 + breath*0.6);
const shGrad=ctx.createLinearGradient(-6,-6,13,5);
shGrad.addColorStop(0,"#ffffff");
shGrad.addColorStop(0.6,"#85c1e9");
shGrad.addColorStop(1,"#2b5d7a");
ctx.fillStyle=shGrad;
ctx.beginPath();
ctx.moveTo(-6,-5);
ctx.quadraticCurveTo(4,-8,14,-1);
ctx.quadraticCurveTo(5,6,-6,4);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=1;
ctx.stroke();
// Ice Crystal Horns
ctx.fillStyle="#bff6ff";
ctx.beginPath();
ctx.moveTo(-2,-5);ctx.lineTo(-7,-13);ctx.lineTo(1,-6);ctx.closePath();
ctx.moveTo(2,-5);ctx.lineTo(-1,-12);ctx.lineTo(4,-5);ctx.closePath();
ctx.fill();
// Forked Frost Tongue
if (Math.sin(t*3)>0.1) {
ctx.strokeStyle="#4ce6ff";
ctx.lineWidth=1.1;
ctx.beginPath();
ctx.moveTo(13,0);ctx.lineTo(18,0);
ctx.lineTo(20,-2);ctx.moveTo(18,0);ctx.lineTo(20,2);
ctx.stroke();
}
// Glowing Ice Eye
ctx.fillStyle="#00e5ff";
ctx.beginPath();
ctx.ellipse(6,-2,2.2,1.3,-0.25,0,Math.PI*2);
ctx.fill();
ctx.restore();

// --- 4. BLOOD BAT KING (Huyết Dực Biên Bức Vương / Huyết Bức) ---
} else if (tid==="blood_bat_king"||nm.includes("bức")||nm.includes("huyết")) {
const wFlap=flap*7;
ctx.save();
ctx.translate(0,-2 + breath);
// Left & Right Jagged Crimson Demon Wings
for (const side of [-1,1]) {
const wGrad=ctx.createLinearGradient(0,-6,side*22,4);
wGrad.addColorStop(0,"#3a0912");
wGrad.addColorStop(0.55,"#b81d2c");
wGrad.addColorStop(1,"#ff4d4d");
ctx.fillStyle=wGrad;
ctx.beginPath();
ctx.moveTo(side*3,-2);
ctx.quadraticCurveTo(side*12,-14 + wFlap,side*23,-7 + wFlap);
ctx.lineTo(side*19,3 + wFlap*0.5);
ctx.quadraticCurveTo(side*14,-1 + wFlap*0.3,side*13,6);
ctx.quadraticCurveTo(side*8,2,side*4,5);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#1a0408";
ctx.lineWidth=1.1;
ctx.stroke();
// Wing Bone Spikes
ctx.strokeStyle="#ffd0d0";
ctx.lineWidth=0.9;
ctx.beginPath();
ctx.moveTo(side*4,-2);
ctx.lineTo(side*21,-7 + wFlap);
ctx.moveTo(side*12,-6 + wFlap*0.6);
ctx.lineTo(side*18,2 + wFlap*0.5);
ctx.stroke();
}
// Bat Demon Body & Horned Head
const bdGrad=ctx.createRadialGradient(0,-3,2,0,0,10);
bdGrad.addColorStop(0,"#6e1222");
bdGrad.addColorStop(1,"#1c050a");
ctx.fillStyle=bdGrad;
ctx.beginPath();
ctx.ellipse(0,1,6.5,8.2,0,0,Math.PI*2);
ctx.fill();
// Pointed Demon Ears
ctx.fillStyle="#3a0912";
ctx.beginPath();
ctx.moveTo(-4,-5);ctx.lineTo(-8,-14);ctx.lineTo(-1,-7);ctx.closePath();
ctx.moveTo(4,-5);ctx.lineTo(8,-14);ctx.lineTo(1,-7);ctx.closePath();
ctx.fill();
// Glowing Blood-Red Eyes & Fangs
ctx.fillStyle="#ff2a2a";
ctx.beginPath();
ctx.arc(-2.6,-3,1.7,0,Math.PI*2);
ctx.arc(2.6,-3,1.7,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.beginPath();
ctx.moveTo(-2.5,1);ctx.lineTo(-1.5,4.2);ctx.lineTo(-0.5,1);
ctx.moveTo(2.5,1);ctx.lineTo(1.5,4.2);ctx.lineTo(0.5,1);
ctx.fill();
ctx.restore();

// --- 5. WIND FALCON (Thanh Phong Linh Điêu) ---
} else if (tid==="wind_falcon"||nm.includes("điêu")||nm.includes("hạc")||nm.includes("cầm")) {
const wFlap=flap*8;
ctx.save();
ctx.translate(0,-3 + breath);
// Wind Swirl Ring Underneath
ctx.strokeStyle="rgba(108,230,184,0.45)";
ctx.lineWidth=1.2;
ctx.beginPath();
ctx.ellipse(0,10,14,4.5,0,0,Math.PI*2);
ctx.stroke();
// Fanned Emerald Tail Feathers
ctx.fillStyle="#246e55";
ctx.beginPath();
ctx.moveTo(-5,3);
ctx.lineTo(-16,9);
ctx.lineTo(-14,3);
ctx.lineTo(-17,-1);
ctx.lineTo(-6,0);
ctx.closePath();
ctx.fill();
// Sweeping Feathered Wings
for (const side of [-1,1]) {
const fGrad=ctx.createLinearGradient(0,-8,side*21,4);
fGrad.addColorStop(0,"#1c5945");
fGrad.addColorStop(0.55,"#48c99b");
fGrad.addColorStop(1,"#b5ffe4");
ctx.fillStyle=fGrad;
ctx.beginPath();
ctx.moveTo(0,-2);
ctx.quadraticCurveTo(side*10,-15 + wFlap,side*22,-8 + wFlap);
ctx.lineTo(side*17,-1 + wFlap*0.6);
ctx.lineTo(side*19,2 + wFlap*0.4);
ctx.lineTo(side*10,3 + wFlap*0.2);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#0f3327";
ctx.lineWidth=0.9;
ctx.stroke();
}
// Sleek Avian Body & Head
ctx.fillStyle="#2e8b6a";
ctx.beginPath();
ctx.ellipse(2,0,7.5,5.2,-0.15,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#7ef7c4";
ctx.beginPath();
ctx.arc(8,-4,4.2,0,Math.PI*2);
ctx.fill();
// Sharp Hooked Golden Beak & Fierce Eye
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.moveTo(11,-5);
ctx.quadraticCurveTo(16,-4.5,15,-1);
ctx.lineTo(11,-2.2);
ctx.closePath();
ctx.fill();
ctx.fillStyle="#ffe600";
ctx.beginPath();
ctx.arc(9.2,-4.6,1.3,0,Math.PI*2);
ctx.fill();
ctx.restore();

// --- 6. THUNDER WOLF KING (Lôi Quan Đầu Lang) ---
} else if (tid==="thunder_wolf_king"||nm.includes("lang vương")||nm.includes("đầu lang")) {
const cMain=enraged?"#ff5733" :"#3b8beb";
const cLight=enraged?"#ffd700" :"#7ef7f0";
// Bushy Electric Twin Tail
ctx.fillStyle=cMain;
ctx.beginPath();
ctx.moveTo(-11,0);
ctx.quadraticCurveTo(-21,-8 + stride*3,-18,-13);
ctx.quadraticCurveTo(-13,-8,-9,-3);
ctx.closePath();
ctx.fill();
// 4 Running Legs
ctx.strokeStyle="#1a3b66";
ctx.lineWidth=3.2;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-8,4);ctx.lineTo(-10 - stride*3,11);
ctx.moveTo(-4,5);ctx.lineTo(-5 + stride*3,11);
ctx.moveTo(5,4);ctx.lineTo(6 - stride*3,11);
ctx.moveTo(8,4);ctx.lineTo(10 + stride*3,11);
ctx.stroke();
// Muscular Alpha Wolf Torso
const wfGrad=ctx.createLinearGradient(-12,-8,12,8);
wfGrad.addColorStop(0,"#1c3f70");
wfGrad.addColorStop(0.5,cMain);
wfGrad.addColorStop(1,cLight);
ctx.fillStyle=wfGrad;
ctx.beginPath();
ctx.ellipse(0,0 + breath*0.5,12.5,7.2,0,0,Math.PI*2);
ctx.fill();
// Spiky Thunder Mane
ctx.fillStyle=cLight;
ctx.beginPath();
ctx.moveTo(-2,-6);ctx.lineTo(1,-12);ctx.lineTo(4,-7);
ctx.lineTo(7,-13);ctx.lineTo(9,-6);ctx.lineTo(12,-10);ctx.lineTo(11,-2);
ctx.closePath();
ctx.fill();
// Wolf Head, Pointed Ears & Snout
ctx.fillStyle=cMain;
ctx.beginPath();
ctx.ellipse(10,-4 + breath*0.5,6.2,5.0,0,0,Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.moveTo(14,-5 + breath*0.5);
ctx.lineTo(20,-2.5 + breath*0.5);
ctx.lineTo(15,1 + breath*0.5);
ctx.closePath();
ctx.fill();
// Ears
ctx.fillStyle="#18345c";
ctx.beginPath();
ctx.moveTo(6,-7);ctx.lineTo(5,-14);ctx.lineTo(9,-8);ctx.closePath();
ctx.moveTo(10,-7);ctx.lineTo(11,-14);ctx.lineTo(13,-7);ctx.closePath();
ctx.fill();
// BLAZING LIGHTNING CROWN (Lôi Quan) above brow
ctx.strokeStyle="#ffd700";
ctx.lineWidth=1.8;
ctx.beginPath();
ctx.moveTo(6,-14);
ctx.lineTo(8,-19);
ctx.lineTo(10.5,-15.5);
ctx.lineTo(13,-20);
ctx.lineTo(15,-14);
ctx.stroke();
// Glowing Electric Eye & Fangs
ctx.fillStyle="#ffffff";
ctx.beginPath();
ctx.arc(13,-4.8 + breath*0.5,1.8,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.arc(13.2,-4.8 + breath*0.5,1.0,0,Math.PI*2);
ctx.fill();
// Crackling Lightning Arcs
ctx.strokeStyle="#7ef7f0";
ctx.lineWidth=1.2;
ctx.beginPath();
ctx.moveTo(-10,-5);ctx.lineTo(-4,-10 + Math.sin(t*14)*2);ctx.lineTo(3,-6);
ctx.stroke();

// --- 7. IRON BOAR / BONE BEAST / TOXIC TOAD (Thiết Bì Dã Trư & Variants) ---
} else if (tid==="iron_boar"||nm.includes("trư")||nm.includes("cốt")||nm.includes("độc")||nm.includes("khôi lỗi")) {
const isBone=nm.includes("cốt")||nm.includes("xương");
const isToxic=nm.includes("độc")||nm.includes("thiềm");
const bodyA=isBone?"#e8eff5" :(isToxic?"#6c3483" :"#7d736b");
const bodyB=isBone?"#7f8c8d" :(isToxic?"#2c1538" :"#332d28");
const accent=isBone?"#ffffff" :(isToxic?"#5cc995" :"#d4af37");
// Hoofed Legs
ctx.fillStyle="#1f1c1a";
ctx.fillRect(-9,5 + stride*2,3.6,6);
ctx.fillRect(-3,6 - stride*2,3.6,5.5);
ctx.fillRect(4,5 + stride*2,3.6,6);
ctx.fillRect(8,5 - stride*2,3.6,6);
// Heavy Armored Boar Body
const ibGrad=ctx.createRadialGradient(-1,-4,2,0,0,13);
ibGrad.addColorStop(0,bodyA);
ibGrad.addColorStop(1,bodyB);
ctx.fillStyle=ibGrad;
ctx.beginPath();
ctx.ellipse(0,0 + breath*0.4,12.5,8.8,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle=accent;
ctx.lineWidth=1.1;
ctx.stroke();
// Overlapping Armor Plates & Dorsal Spikes
ctx.fillStyle=bodyB;
for (let i=-6;i<=6;i+=4) {
ctx.beginPath();
ctx.moveTo(i - 1.5,-8);
ctx.lineTo(i,-13);
ctx.lineTo(i + 2,-8);
ctx.closePath();
ctx.fill();
}
ctx.strokeStyle="rgba(255,255,255,0.25)";
ctx.lineWidth=1;
ctx.beginPath();
ctx.arc(-2,0,8,-1.1,1.1);
ctx.arc(3,0,7,-1.0,1.0);
ctx.stroke();
// Armored Snout
ctx.fillStyle=bodyB;
ctx.beginPath();
ctx.ellipse(12.5,0.5 + breath*0.4,3.4,4.2,0,0,Math.PI*2);
ctx.fill();
// Sharp Curving Ivory Tusks
ctx.strokeStyle="#fff8dc";
ctx.lineWidth=2.2;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(11,2.5);
ctx.quadraticCurveTo(16,3.5,17,-3.5);
ctx.moveTo(10,4);
ctx.quadraticCurveTo(14.5,5.5,15.5,-0.5);
ctx.stroke();
// Fierce Glowing Eye
ctx.fillStyle=isToxic?"#5cc995" :"#ff5733";
ctx.beginPath();
ctx.arc(8.5,-2.8 + breath*0.4,1.8,0,Math.PI*2);
ctx.fill();

// --- 7B. WINE APE KING / CAVE APE (Xích Nhãn Tửu Viên Vương / Thạch Động Hầu Yêu) ---
} else if (tid==="wine_ape_king"||nm.includes("viên")||nm.includes("hầu")) {
const furA=enraged?"#ff5733" :"#b84a27";
const furB="#42190d";
// Muscular Back & Front Arms (knuckle-walking ape stance)
ctx.strokeStyle=furB;
ctx.lineWidth=4.2;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-7,3);ctx.lineTo(-9 - stride*2,11);
ctx.moveTo(6,-1);ctx.lineTo(10 + stride*3,10);
ctx.stroke();
// Heavy Broad Ape Torso
const apGrad=ctx.createRadialGradient(0,-3,2,0,0,13);
apGrad.addColorStop(0,furA);
apGrad.addColorStop(1,furB);
ctx.fillStyle=apGrad;
ctx.beginPath();
ctx.ellipse(-1,0 + breath*0.5,11.5,9.5,-0.2,0,Math.PI*2);
ctx.fill();
// Fiery Shoulder Mane
ctx.fillStyle="#e67e22";
ctx.beginPath();
ctx.moveTo(-6,-8);ctx.lineTo(-2,-13);ctx.lineTo(2,-8);ctx.lineTo(6,-12);ctx.lineTo(9,-6);
ctx.closePath();
ctx.fill();
// Ape Head & Snout
ctx.fillStyle=furA;
ctx.beginPath();
ctx.arc(7,-6 + breath*0.5,5.6,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#d69e7a";
ctx.beginPath();
ctx.ellipse(9.5,-4.5 + breath*0.5,3.2,2.8,0,0,Math.PI*2);
ctx.fill();
// Crimson Glowing Wine-Drunk Eyes & Fangs
ctx.fillStyle="#ff1e1e";
ctx.beginPath();
ctx.arc(8.6,-7.2 + breath*0.5,1.8,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.fillRect(10.2,-3.2 + breath*0.5,1.2,2.2);
// Wine Gourd slung on back for Boss Ape
if (isBoss) {
ctx.fillStyle="#f7c948";
ctx.beginPath();
ctx.arc(-9,-4,3.6,0,Math.PI*2);
ctx.arc(-11,-8,2.2,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="#8a4b12";
ctx.lineWidth=0.9;
ctx.stroke();
}

// --- 7C. VENOM TOAD (Hủ Độc Thiềm Thừ) ---
} else if (tid==="venom_toad"||nm.includes("thiềm")) {
const puff=Math.sin(t*3.2)*1.6;
// Bent Amphibian Hind & Front Legs
ctx.fillStyle="#351947";
ctx.beginPath();
ctx.ellipse(-8,6,5.5,3.5,0.4,0,Math.PI*2);
ctx.ellipse(7,7,4.2,2.6,-0.2,0,Math.PI*2);
ctx.fill();
// Squat Bulbous Poison Toad Body
const tdGrad=ctx.createRadialGradient(-1,-3,2,0,1,13);
tdGrad.addColorStop(0,"#8e44ad");
tdGrad.addColorStop(0.6,"#4a235a");
tdGrad.addColorStop(1,"#1d0e26");
ctx.fillStyle=tdGrad;
ctx.beginPath();
ctx.ellipse(0,1 + breath*0.3,12.2,8.4,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="#5cc995";
ctx.lineWidth=1.0;
ctx.stroke();
// Inflating Toxic Throat Sac
ctx.fillStyle="rgba(92,201,149,0.75)";
ctx.beginPath();
ctx.ellipse(9,4,4.2 + puff*0.4,3.4 + puff*0.35,0,0,Math.PI*2);
ctx.fill();
// Glowing Emerald Venom Pustules on Back
ctx.fillStyle="#5cc995";
for (const [px,py,pr] of [[-6,-4,2.0],[-1,-6,2.3],[4,-4.5,1.8],[-3,-1,1.6]]) {
ctx.beginPath();
ctx.arc(px,py,pr,0,Math.PI*2);
ctx.fill();
}
// Bulging Golden-Green Eyes
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.arc(6.5,-5.5,2.5,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#080a0e";
ctx.fillRect(6.2,-6.5,1.2,2.2);
// Floating Poison Bubbles
const bubY=-11 + Math.sin(t*4)*2.5;
ctx.strokeStyle="#7ef7c4";
ctx.lineWidth=0.9;
ctx.beginPath();
ctx.arc(-4,bubY,2.1,0,Math.PI*2);
ctx.arc(3,bubY - 2,1.5,0,Math.PI*2);
ctx.stroke();

// --- 7D. SWAMP CROCODILE (Đầm Lầy Ngạc Ngư) ---
} else if (tid==="swamp_croc"||nm.includes("ngạc")) {
// Sinuous Armored Tail
ctx.fillStyle="#1f543e";
ctx.beginPath();
ctx.moveTo(-9,0);
ctx.quadraticCurveTo(-18,stride*3.5,-23,-1 + stride*2);
ctx.lineTo(-10,4);
ctx.closePath();
ctx.fill();
// Squat Clawed Legs
ctx.fillStyle="#143829";
ctx.fillRect(-7,4 + stride*1.8,3.6,5.5);
ctx.fillRect(4,4 - stride*1.8,3.6,5.5);
// Long Scaled Torso
const crGrad=ctx.createLinearGradient(-11,-5,12,5);
crGrad.addColorStop(0,"#1b4d38");
crGrad.addColorStop(0.5,"#358563");
crGrad.addColorStop(1,"#1c4f3a");
ctx.fillStyle=crGrad;
ctx.beginPath();
ctx.ellipse(0,1,12.5,5.6,0,0,Math.PI*2);
ctx.fill();
// Jagged Back Scutes
ctx.fillStyle="#7ef7c4";
for (let sx=-8;sx<=5;sx+=3.5) {
ctx.beginPath();
ctx.moveTo(sx - 1.2,-4);ctx.lineTo(sx,-7.5);ctx.lineTo(sx + 1.5,-4);
ctx.closePath();
ctx.fill();
}
// Elongated Snapping Crocodile Jaws
ctx.fillStyle="#246348";
ctx.beginPath();
ctx.moveTo(8,-3);ctx.lineTo(21,-1.5);ctx.lineTo(20,1.2);ctx.lineTo(8,2);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.moveTo(8,2);ctx.lineTo(19,3.8);ctx.lineTo(8,5);
ctx.closePath();
ctx.fill();
// White Saw Teeth & Amber Eye
ctx.fillStyle="#ffffff";
for (let tx=11;tx<=18;tx+=2.4) {
ctx.fillRect(tx,1.0,1.0,1.8);
}
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.arc(9.5,-3.2,1.7,0,Math.PI*2);
ctx.fill();

// --- 7E. WHITE STRIPED TIGER (Bạch Văn Mãnh Hổ) ---
} else if (tid==="white_tiger"||nm.includes("hổ")) {
// Long Striped Tail
ctx.strokeStyle="#dce6ee";
ctx.lineWidth=2.6;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-10,0);
ctx.quadraticCurveTo(-19,-7 + stride*3,-17,-13);
ctx.stroke();
// 4 Agile Tiger Legs
ctx.strokeStyle="#c5d3de";
ctx.lineWidth=3.0;
ctx.beginPath();
ctx.moveTo(-7,4);ctx.lineTo(-9 - stride*3,11);
ctx.moveTo(-3,4);ctx.lineTo(-4 + stride*3,11);
ctx.moveTo(4,4);ctx.lineTo(5 - stride*3,11);
ctx.moveTo(8,4);ctx.lineTo(10 + stride*3,11);
ctx.stroke();
// Sleek White Tiger Body
const tgGrad=ctx.createLinearGradient(-11,-7,11,7);
tgGrad.addColorStop(0,"#ffffff");
tgGrad.addColorStop(0.65,"#d8e4ed");
tgGrad.addColorStop(1,"#8da1b2");
ctx.fillStyle=tgGrad;
ctx.beginPath();
ctx.ellipse(0,0 + breath*0.4,12.2,6.8,0,0,Math.PI*2);
ctx.fill();
// Black Tiger Stripes
ctx.strokeStyle="#141920";
ctx.lineWidth=1.5;
for (const sx of [-6,-2,2,6]) {
ctx.beginPath();
ctx.moveTo(sx,-5.5);ctx.lineTo(sx - 1,1.5);
ctx.stroke();
}
// Tiger Head, Rounded Ears & Fierce Golden Eyes
ctx.fillStyle="#f2f7fa";
ctx.beginPath();
ctx.arc(10,-3.5 + breath*0.4,5.4,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#141920";
ctx.beginPath();
ctx.arc(7.5,-8.5,2.0,0,Math.PI*2);
ctx.arc(12,-8.5,2.0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ff9f43";
ctx.beginPath();
ctx.arc(12.2,-4.0 + breath*0.4,1.7,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.fillRect(14,-0.5 + breath*0.4,1.4,2.5);

// --- 7F. DESERT FIRE SCORPION (Sa Mạc Hỏa Hạt) ---
} else if (tid==="fire_scorpion"||nm.includes("hạt")) {
// 6 Segmented Insect Legs
ctx.strokeStyle="#7a210c";
ctx.lineWidth=1.8;
ctx.beginPath();
for (let i=0;i<3;i++) {
const lx=-5 + i*4;
const off=(i % 2===0?stride :-stride)*2.2;
ctx.moveTo(lx,3);ctx.lineTo(lx - 2,10 + off);
ctx.moveTo(lx,3);ctx.lineTo(lx + 2,10 - off);
}
ctx.stroke();
// Magma Carapace Body
const scGrad=ctx.createRadialGradient(0,-1,2,0,0,12);
scGrad.addColorStop(0,"#ff6b35");
scGrad.addColorStop(0.6,"#a8240c");
scGrad.addColorStop(1,"#3b0c06");
ctx.fillStyle=scGrad;
ctx.beginPath();
ctx.ellipse(0,1,11.5,6.2,0,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle="#ffd700";
ctx.lineWidth=0.9;
ctx.stroke();
// Arching Overhead Fiery Stinger Tail
ctx.strokeStyle="#c0392b";
ctx.lineWidth=3.6;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-9,0);
ctx.bezierCurveTo(-18,-12,-6,-20,4,-13 + Math.sin(t*4)*2);
ctx.stroke();
// Glowing Flame Stinger Tip
ctx.fillStyle="#ffd700";
ctx.beginPath();
ctx.arc(5,-13 + Math.sin(t*4)*2,3.0,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.beginPath();
ctx.arc(5,-13 + Math.sin(t*4)*2,1.4,0,Math.PI*2);
ctx.fill();
// Twin Giant Pincers
ctx.fillStyle="#d35400";
ctx.beginPath();
ctx.ellipse(14,-3,4.2,2.4,-0.3,0,Math.PI*2);
ctx.ellipse(14,4,4.2,2.4,0.3,0,Math.PI*2);
ctx.fill();
// Glowing Eyes
ctx.fillStyle="#ffe600";
ctx.beginPath();
ctx.arc(9,-1.5,1.4,0,Math.PI*2);
ctx.arc(9,1.8,1.4,0,Math.PI*2);
ctx.fill();

// --- 7G. STONE GOLEM / ROCKMAN (Đãng Hồn Thạch Nhân / Thạch Linh) ---
} else if (tid==="stone_golem"||nm.includes("thạch nhân")||nm.includes("thạch linh")) {
const coreCol=nm.includes("đãng hồn")?"#ff85d5" :"#4cd964";
// Heavy Floating Stone Legs
ctx.fillStyle="#525a63";
ctx.fillRect(-7.5,5 + stride*1.8,5.2,7);
ctx.fillRect(2.5,5 - stride*1.8,5.2,7);
// Massive Floating Rock Arms
ctx.fillStyle="#636d78";
ctx.beginPath();
ctx.ellipse(-12.5,0 + breath*0.6 + stride*2,4.2,6.2,0.15,0,Math.PI*2);
ctx.ellipse(12.5,0 + breath*0.6 - stride*2,4.2,6.2,-0.15,0,Math.PI*2);
ctx.fill();
ctx.strokeStyle=coreCol;
ctx.lineWidth=0.9;
ctx.stroke();
// Faceted Boulder Torso
const rkGrad=ctx.createLinearGradient(-10,-10,10,8);
rkGrad.addColorStop(0,"#8c96a1");
rkGrad.addColorStop(0.55,"#4a525c");
rkGrad.addColorStop(1,"#22262b");
ctx.fillStyle=rkGrad;
ctx.beginPath();
ctx.moveTo(-8,-9 + breath*0.5);
ctx.lineTo(8,-9 + breath*0.5);
ctx.lineTo(10,3 + breath*0.5);
ctx.lineTo(5,7 + breath*0.5);
ctx.lineTo(-5,7 + breath*0.5);
ctx.lineTo(-10,3 + breath*0.5);
ctx.closePath();
ctx.fill();
ctx.strokeStyle="#1b1f24";
ctx.lineWidth=1.1;
ctx.stroke();
// Glowing Spirit Core in Chest
const cGrad=ctx.createRadialGradient(0,-1 + breath*0.5,0.5,0,-1 + breath*0.5,5.0);
cGrad.addColorStop(0,"#ffffff");
cGrad.addColorStop(0.5,coreCol);
cGrad.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=cGrad;
ctx.beginPath();
ctx.arc(0,-1 + breath*0.5,5.0,0,Math.PI*2);
ctx.fill();
// Stone Head + Glowing Visor Eyes
ctx.fillStyle="#6c7580";
ctx.fillRect(-5.5,-16 + breath*0.5,11,7);
ctx.fillStyle=coreCol;
ctx.fillRect(-3.5,-13.5 + breath*0.5,2.6,1.8);
ctx.fillRect(1.0,-13.5 + breath*0.5,2.6,1.8);

// --- 7H. SOUL BEAST / HEAVENLY DEMON (U Minh Hồn Thú / Thiên Ngoại Thiên Ma) ---
} else if (tid==="soul_beast"||nm.includes("hồn thú")||nm.includes("thiên ma")) {
const floatY=Math.sin(t*2.6)*2.6;
ctx.save();
ctx.translate(0,floatY);
// Ethereal Spectral Smoke Tail
const spGrad=ctx.createLinearGradient(0,-12,0,14);
spGrad.addColorStop(0,"rgba(155,89,182,0.92)");
spGrad.addColorStop(0.6,"rgba(74,35,90,0.82)");
spGrad.addColorStop(1,"rgba(20,10,36,0)");
ctx.fillStyle=spGrad;
ctx.beginPath();
ctx.moveTo(-9,-4);
ctx.quadraticCurveTo(-13,5,-5 + Math.sin(t*4)*3,14);
ctx.quadraticCurveTo(0,9,5 + Math.cos(t*4)*3,14);
ctx.quadraticCurveTo(13,5,9,-4);
ctx.quadraticCurveTo(0,-15,-9,-4);
ctx.closePath();
ctx.fill();
// Curved Demonic Soul Horns
ctx.strokeStyle="#d2a6ff";
ctx.lineWidth=2.0;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-5,-9);ctx.quadraticCurveTo(-11,-15,-7,-19);
ctx.moveTo(5,-9);ctx.quadraticCurveTo(11,-15,7,-19);
ctx.stroke();
// Spectral Claws
ctx.strokeStyle="#c56cf0";
ctx.lineWidth=2.2;
ctx.beginPath();
ctx.moveTo(-8,-1);ctx.lineTo(-15,3 + stride*2);
ctx.moveTo(8,-1);ctx.lineTo(15,3 - stride*2);
ctx.stroke();
// Burning Soul Eyes
ctx.fillStyle="#ff3860";
ctx.beginPath();
ctx.ellipse(-3.5,-4.5,2.2,1.3,0.25,0,Math.PI*2);
ctx.ellipse(3.5,-4.5,2.2,1.3,-0.25,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.beginPath();
ctx.arc(-3.5,-4.5,0.7,0,Math.PI*2);
ctx.arc(3.5,-4.5,0.7,0,Math.PI*2);
ctx.fill();
ctx.restore();

// --- 8. GREEN ELECTRIC WOLF (Thanh Mao Điện Lang & Default Spirit Wolf) ---
} else {
const wMain=b.color||"#2e7d5b";
const wGlow="#6ce6b8";
// Wagging Tail
ctx.fillStyle=wMain;
ctx.beginPath();
ctx.moveTo(-10,0);
ctx.quadraticCurveTo(-19,-6 + stride*3,-16,-11);
ctx.quadraticCurveTo(-11,-6,-8,-2);
ctx.closePath();
ctx.fill();
// 4 Running Legs
ctx.strokeStyle="#163b2a";
ctx.lineWidth=2.6;
ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-7,4);ctx.lineTo(-9 - stride*3,10.5);
ctx.moveTo(-3,4);ctx.lineTo(-4 + stride*3,10.5);
ctx.moveTo(4,4);ctx.lineTo(5 - stride*3,10.5);
ctx.moveTo(7,4);ctx.lineTo(9 + stride*3,10.5);
ctx.stroke();
// Sleek Wolf Body
const gwGrad=ctx.createLinearGradient(-11,-6,11,6);
gwGrad.addColorStop(0,"#1a4733");
gwGrad.addColorStop(0.55,wMain);
gwGrad.addColorStop(1,"#58b88a");
ctx.fillStyle=gwGrad;
ctx.beginPath();
ctx.ellipse(0,0 + breath*0.4,11.2,6.2,0,0,Math.PI*2);
ctx.fill();
// Spiky Jade Fur Mane
ctx.fillStyle=wGlow;
ctx.beginPath();
ctx.moveTo(-1,-5.5);ctx.lineTo(2,-10.5);ctx.lineTo(4.5,-6);
ctx.lineTo(7,-11);ctx.lineTo(9,-5);
ctx.closePath();
ctx.fill();
// Wolf Head, Ears & Snout
ctx.fillStyle=wMain;
ctx.beginPath();
ctx.ellipse(9,-3.5 + breath*0.4,5.4,4.4,0,0,Math.PI*2);
ctx.fill();
ctx.beginPath();
ctx.moveTo(13,-4.5 + breath*0.4);
ctx.lineTo(18.5,-2 + breath*0.4);
ctx.lineTo(13.5,1 + breath*0.4);
ctx.closePath();
ctx.fill();
ctx.fillStyle="#143626";
ctx.beginPath();
ctx.moveTo(6,-6.5);ctx.lineTo(5,-12.5);ctx.lineTo(8.5,-7.5);ctx.closePath();
ctx.moveTo(9.5,-6.5);ctx.lineTo(10.5,-12.5);ctx.lineTo(12,-6.5);ctx.closePath();
ctx.fill();
// Glowing Jade Eyes & Fangs
ctx.fillStyle="#7ef7f0";
ctx.beginPath();
ctx.arc(11.6,-4.2 + breath*0.4,1.6,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#ffffff";
ctx.fillRect(14.5,-0.8 + breath*0.4,1.2,2.2);
// Subtle Electric Spark along spine
if (Math.sin(t*6)>0.2) {
ctx.strokeStyle="#7ef7f0";
ctx.lineWidth=1.0;
ctx.beginPath();
ctx.moveTo(-7,-5);ctx.lineTo(-2,-8.5);ctx.lineTo(3,-5.5);
ctx.stroke();
}
}

ctx.restore();
}
});
})(window);
