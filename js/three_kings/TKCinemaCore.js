(function (global) {
"use strict";
function _clamp(v,a,b) {return Math.max(a,Math.min(b,v));}
function _lerp(a,b,t) {return a + (b - a)*_clamp(t,0,1);}
function _easeOutCubic(t) {const u=1 - _clamp(t,0,1);return 1 - u*u*u;}
function _easeInCubic(t) {const u=_clamp(t,0,1);return u*u*u;}
function _easeInOutSine(t) {return -(Math.cos(Math.PI*_clamp(t,0,1)) - 1)/2;}
function _fmtSec(s) {
const n=Math.max(0,Math.floor(s));
const m=Math.floor(n/60);
const r=n % 60;
return `${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
}

class ThreeKingsCinema {
constructor(story) {
this.story=story||null;
this.active=false;
this.clipId=null;
this.t=0;
this.duration=11.8;
this.onComplete=null;
this.debris=[];
this.sparks=[];
this.cuesFired={};
this._overlay=null;
}
isActive() {
return Boolean(this.active);
}
_ensureVideoOverlay() {
if (!this.story|| !this.story._screen) return null;
let ov=this.story._screen.querySelector("#tk-cinema-overlay");
if (!ov) {
ov=document.createElement("div");
ov.id="tk-cinema-overlay";
ov.className="tk-cinema-overlay hidden";
ov.innerHTML=`
<div class="tk-cine-topbar">
<div class="tk-cine-rec"><span class="tk-cine-dot"></span><span id="tk-cine-title">ĐOẠN PHIM CỐT TRUYỆN</span></div>
<div class="tk-cine-actions">
<button id="tk-cine-replay" class="btn-mini">🔄 Xem Lại</button>
<button id="tk-cine-skip" class="btn-mini btn-accent">⏭ Bỏ Qua [Esc]</button>
</div>
</div>
<div class="tk-cine-subbar">
<div id="tk-cine-sub-box" class="tk-cine-sub-box hidden">
<span id="tk-cine-speaker" class="tk-cine-speaker"></span>
<span id="tk-cine-line" class="tk-cine-line"></span>
</div>
<div class="tk-cine-timeline-row">
<span id="tk-cine-time" class="tk-cine-time">00:00 / 00:12</span>
<div class="tk-cine-track"><div id="tk-cine-fill" class="tk-cine-fill"></div></div>
</div>
</div>
`;
this.story._screen.appendChild(ov);
ov.querySelector("#tk-cine-skip").addEventListener("click",()=>this.stop(true));
ov.querySelector("#tk-cine-replay").addEventListener("click",()=>{
if (this.clipId) this.play(this.clipId,this.onComplete);
});
}
this._overlay=ov;
return ov;
}
_playCinemaAudio(cue) {
const st=this.story;
if (!st|| !st.soundEnabled) return;
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return;
if (!st._audioCtx) st._audioCtx=new AudioCtx();
if (st._audioCtx.state==="suspended") st._audioCtx.resume();
const ac=st._audioCtx;
const now=ac.currentTime;

const oscTone=(f0,f1,dur,type="sine",vol=0.10,delay=0)=>{
const o=ac.createOscillator();
const g=ac.createGain();
o.type=type;
o.frequency.setValueAtTime(f0,now + delay);
if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),now + delay + dur);
g.gain.setValueAtTime(0.0001,now + delay);
const _vm=global.vanCoSettings?global.vanCoSettings.getVolumeMultiplier() :1;
g.gain.linearRampToValueAtTime(Math.max(0.0001,vol*_vm),now + delay + Math.min(0.04,dur*0.2));
g.gain.exponentialRampToValueAtTime(0.0001,now + delay + dur);
o.connect(g);g.connect(ac.destination);
o.start(now + delay);o.stop(now + delay + dur + 0.04);
};

const noiseBurst=(dur,vol=0.12,delay=0,lowpass=900)=>{
const len=Math.max(1,Math.floor(ac.sampleRate*dur));
const buf=ac.createBuffer(1,len,ac.sampleRate);
const data=buf.getChannelData(0);
for (let i=0;i<len;i++) data[i]=(Math.random()*2 - 1)*Math.pow(1 - i/len,1.4);
const src=ac.createBufferSource();
src.buffer=buf;
const flt=ac.createBiquadFilter();
flt.type="lowpass";
flt.frequency.setValueAtTime(lowpass,now + delay);
const g=ac.createGain();
const _vm2=global.vanCoSettings?global.vanCoSettings.getVolumeMultiplier() :1;
g.gain.setValueAtTime(Math.max(0.0001,vol*_vm2),now + delay);
g.gain.exponentialRampToValueAtTime(0.0001,now + delay + dur);
src.connect(flt);flt.connect(g);g.connect(ac.destination);
src.start(now + delay);
};

if (cue==="rise") {
oscTone(110,220,1.4,"sawtooth",0.06,0);
oscTone(220,440,1.4,"triangle",0.07,0.1);
} else if (cue==="gu1") {
oscTone(440,880,0.45,"triangle",0.11,0);
oscTone(659,1318,0.40,"sine",0.08,0.04);
} else if (cue==="gu2") {
oscTone(554,1108,0.55,"triangle",0.12,0);
oscTone(830,1660,0.50,"sine",0.09,0.05);
} else if (cue==="gu3") {
oscTone(659,1318,0.65,"sawtooth",0.09,0);
oscTone(987,1975,0.60,"triangle",0.10,0.04);
} else if (cue==="beam_drop") {
oscTone(180,42,0.85,"sawtooth",0.15,0);
oscTone(95,30,1.15,"sine",0.18,0);
noiseBurst(1.4,0.16,0.02,1400);
} else if (cue==="roof_crash") {
oscTone(130,28,0.75,"sawtooth",0.17,0);
oscTone(72,24,0.95,"sine",0.18,0);
noiseBurst(1.1,0.20,0,750);
oscTone(880,210,0.32,"square",0.06,0.03);
} else if (cue==="bone_wings") {
oscTone(95,52,0.45,"sawtooth",0.13,0);
noiseBurst(0.45,0.14,0.02,1100);
oscTone(310,620,0.35,"triangle",0.08,0.08);
} else if (cue==="gold_armor") {
const chord=[293.66,440.0,587.33,880.0];
chord.forEach((f,i)=>oscTone(f,f*1.02,0.85,"triangle",0.09,i*0.05));
oscTone(146.8,293.6,0.55,"sine",0.10,0);
} else if (cue==="launch_into_beam") {
oscTone(130,540,0.75,"sawtooth",0.12,0);
oscTone(260,1040,0.85,"triangle",0.11,0.04);
noiseBurst(0.95,0.16,0.03,2200);
} else if (cue==="wings_gold") {
const chord=[261.63,329.63,392.0,523.25,659.25,783.99];
chord.forEach((f,i)=>oscTone(f,f*1.015,1.25,"triangle",0.08,i*0.06));
noiseBurst(0.6,0.09,0.05,1800);
}
} catch (e) {}
}
play(clipId,onComplete) {
this.active=true;
this.clipId=clipId;
this.t=0;
this.onComplete=onComplete||null;
this.cuesFired={};
this.debris=[];
this.sparks=[];

const durations={
thien_boc_quang_ha:17.6,
thai_co_quang_quyen:6.2,
vinh_dieu_ngo_thuong:6.0
};
const titles={
thien_boc_quang_ha:"🎬 THIÊN BỘC QUANG HÀ & PHƯƠNG NGUYÊN BAY NGƯỢC THÁC ÁNH SÁNG",
thai_co_quang_quyen:"🎬 SÁT CHIÊU NGŨ CHUYỂN — THÁI CỔ QUANG QUYỀN",
vinh_dieu_ngo_thuong:"🎬 SÁT CHIÊU NGŨ CHUYỂN — VINH DIỆU NGÔ THƯƠNG"
};
this.duration=durations[clipId]||11.8;

// Pre-seed deterministic architectural debris for roof-shatter shot
for (let i=0;i<44;i++) {
const ang=-Math.PI + Math.random()*Math.PI;
const spd=150 + Math.random()*460;
this.debris.push({
x:(Math.random()-0.5)*150,
y:(Math.random()-0.5)*36,
vx:Math.cos(ang)*spd,
vy:Math.sin(ang)*spd - 140 - Math.random()*220,
rot:Math.random()*Math.PI*2,
vrot:(Math.random()-0.5)*11,
w:12 + Math.random()*24,
h:6 + Math.random()*14,
col:(i % 3===0)?"#b89352" :((i % 3===1)?"#4a3720" :"#ffd700")
});
}
for (let i=0;i<70;i++) {
this.sparks.push({
x:Math.random(),
y:Math.random(),
spd:0.4 + Math.random()*1.4,
sz:1.5 + Math.random()*3.2
});
}

const ov=this._ensureVideoOverlay();
if (ov) {
ov.classList.remove("hidden");
const tEl=ov.querySelector("#tk-cine-title");
if (tEl) tEl.textContent=titles[clipId]||"ĐOẠN PHIM CỐT TRUYỆN";
}
if (this.story) {
this.story._setMovementLock("Đang Phát Đoạn Phim Cốt Truyện...",false);
const topHud=this.story._screen&&this.story._screen.querySelector(".tk-hud-top");
const cPanel=this.story._screen&&this.story._screen.querySelector("#tk-cauldron-panel");
const tick=this.story._screen&&this.story._screen.querySelector("#tk-battle-ticker");
const lockB=this.story._screen&&this.story._screen.querySelector("#tk-lock-banner");
if (topHud) topHud.classList.add("tk-cine-hidden");
if (cPanel) cPanel.classList.add("tk-cine-hidden");
if (tick) tick.classList.add("tk-cine-hidden");
if (lockB) lockB.classList.add("tk-cine-hidden");
}
this._fireCue("rise");
}
stop(runCallback=true) {
if (!this.active) return;
this.active=false;
const cb=this.onComplete;
this.onComplete=null;
if (this._overlay) this._overlay.classList.add("hidden");
if (this.story&&this.story._screen) {
const topHud=this.story._screen.querySelector(".tk-hud-top");
const cPanel=this.story._screen.querySelector("#tk-cauldron-panel");
const tick=this.story._screen.querySelector("#tk-battle-ticker");
const lockB=this.story._screen.querySelector("#tk-lock-banner");
if (topHud) topHud.classList.remove("tk-cine-hidden");
if (cPanel) cPanel.classList.remove("tk-cine-hidden");
if (tick) tick.classList.remove("tk-cine-hidden");
if (lockB) lockB.classList.remove("tk-cine-hidden");
}
if (runCallback&&typeof cb==="function") cb();
}
_fireCue(name) {
if (this.cuesFired[name]) return;
this.cuesFired[name]=true;
this._playCinemaAudio(name);
}
_setSubtitle(speaker,line) {
if (!this._overlay) return;
const box=this._overlay.querySelector("#tk-cine-sub-box");
const spEl=this._overlay.querySelector("#tk-cine-speaker");
const lnEl=this._overlay.querySelector("#tk-cine-line");
if (!line) {
if (box) box.classList.add("hidden");
return;
}
if (box) box.classList.remove("hidden");
if (spEl) spEl.textContent=speaker?`${speaker}: ` :"";
if (lnEl) lnEl.textContent=line;
}
update(dt) {
if (!this.active) return;
this.t +=dt;

// Audio timeline cues
if (this.clipId==="thien_boc_quang_ha") {
if (this.t>=2.0) this._fireCue("gu1");
if (this.t>=2.75) this._fireCue("gu2");
if (this.t>=3.45) this._fireCue("gu3");
if (this.t>=4.35) this._fireCue("beam_drop");
if (this.t>=6.30) this._fireCue("roof_crash");
if (this.t>=10.25) this._fireCue("bone_wings");
if (this.t>=11.05) this._fireCue("gold_armor");
if (this.t>=11.80) this._fireCue("gu3");
if (this.t>=12.75) this._fireCue("launch_into_beam");
if (this.t>=15.20) this._fireCue("wings_gold");
} else if (this.clipId==="thai_co_quang_quyen") {
if (this.t>=1.2) this._fireCue("gu1");
if (this.t>=2.0) this._fireCue("gu2");
if (this.t>=3.1) this._fireCue("beam_drop");
if (this.t>=4.15) this._fireCue("roof_crash");
} else if (this.clipId==="vinh_dieu_ngo_thuong") {
if (this.t>=1.1) this._fireCue("gu1");
if (this.t>=1.9) this._fireCue("gu3");
if (this.t>=2.9) this._fireCue("beam_drop");
if (this.t>=3.85) this._fireCue("roof_crash");
}

// Update video progress bar
if (this._overlay) {
const fill=this._overlay.querySelector("#tk-cine-fill");
const tm=this._overlay.querySelector("#tk-cine-time");
const pct=_clamp((this.t / this.duration)*100,0,100);
if (fill) fill.style.width=`${pct}%`;
if (tm) tm.textContent=`${_fmtSec(this.t)} / ${_fmtSec(this.duration)}`;
}

if (this.t>=this.duration) {
this.stop(true);
}
}

// ==============================================================================
// SHARED VIDEO-GRADE DRAWING HELPERS (SPEEDLINES, GOD-RAYS, ANIME CHARACTERS)
// ==============================================================================
_drawSpeedlines(ctx,cx,cy,w,h,t,color="rgba(255,245,190,0.34)",count=46) {
ctx.save();
ctx.strokeStyle=color;
const maxR=Math.hypot(w,h)*0.65;
for (let i=0;i<count;i++) {
const ang=(i*Math.PI*2)/count + Math.sin(t*3 + i)*0.025;
const inner=maxR*(0.24 + ((i*19 + Math.floor(t*24)) % 17)*0.02);
ctx.lineWidth=1 + (i % 3)*1.1;
ctx.beginPath();
ctx.moveTo(cx + Math.cos(ang)*inner,cy + Math.sin(ang)*inner);
ctx.lineTo(cx + Math.cos(ang)*maxR,cy + Math.sin(ang)*maxR);
ctx.stroke();
}
ctx.restore();
}
_drawVolumetricLightBeam(ctx,x,topY,botY,halfW,t,intensity=1.0) {
ctx.save();
const h=Math.max(10,botY - topY);
// Outer ambient golden bloom
const og=ctx.createLinearGradient(x - halfW*1.9,0,x + halfW*1.9,0);
og.addColorStop(0,"rgba(255,235,140,0)");
og.addColorStop(0.25,`rgba(255,230,120,${0.22*intensity})`);
og.addColorStop(0.5,`rgba(255,255,235,${0.95*intensity})`);
og.addColorStop(0.75,`rgba(255,230,120,${0.22*intensity})`);
og.addColorStop(1,"rgba(255,235,140,0)");
ctx.fillStyle=og;
ctx.fillRect(x - halfW*1.9,topY,halfW*3.8,h);

// Inner white-hot blazing core
const ig=ctx.createLinearGradient(x - halfW*0.6,0,x + halfW*0.6,0);
ig.addColorStop(0,"rgba(255,255,255,0)");
ig.addColorStop(0.5,`rgba(255,255,255,${0.98*intensity})`);
ig.addColorStop(1,"rgba(255,255,255,0)");
ctx.fillStyle=ig;
ctx.fillRect(x - halfW*0.6,topY,halfW*1.2,h);

// Cascading waterfall streaks rushing violently downward!
ctx.strokeStyle=`rgba(255,255,255,${0.65*intensity})`;
for (let i=0;i<18;i++) {
const lx=x - halfW*0.88 + (i/17)*(halfW*1.76);
const ly=topY + ((t*780 + i*89) % h);
ctx.lineWidth=1.5 + (i % 3)*1.1;
ctx.beginPath();
ctx.moveTo(lx,ly);
ctx.lineTo(lx,Math.min(botY,ly + 65 + (i % 4)*20));
ctx.stroke();
}

// Swirling horizontal torrent rings along the light waterfall
for (let r=0;r<4;r++) {
const ry=topY + ((t*420 + r*(h/4)) % h);
ctx.strokeStyle=`rgba(255,245,190,${0.48*intensity})`;
ctx.lineWidth=2.5;
ctx.beginPath();
ctx.ellipse(x,ry,halfW*(0.9 + Math.sin(t*8 + r)*0.08),14,0,0,Math.PI*2);
ctx.stroke();
}
ctx.restore();
}
_drawXiaoMangHeroic(ctx,x,y,scale,t,armRaise=0,auraPower=0) {
ctx.save();
ctx.translate(x,y);
ctx.scale(scale,scale);

// Blazing Immemorial Light halo behind Tiêu Mang
if (auraPower>0.02) {
const hr=85 + auraPower*80 + Math.sin(t*9)*8;
const hg=ctx.createRadialGradient(0,-20,6,0,-20,hr);
hg.addColorStop(0,`rgba(255,255,235,${0.92*auraPower})`);
hg.addColorStop(0.45,`rgba(255,220,100,${0.48*auraPower})`);
hg.addColorStop(1,"rgba(255,200,60,0)");
ctx.fillStyle=hg;ctx.beginPath();ctx.arc(0,-20,hr,0,Math.PI*2);ctx.fill();
}

// Wind-swept immortal scarf ribbon flowing cleanly to one side (never widens waist!)
const wind=Math.sin(t*11)*8;
ctx.strokeStyle="#ffd700";ctx.lineWidth=3.2;ctx.lineCap="round";
ctx.beginPath();
ctx.moveTo(-16,-20);
ctx.bezierCurveTo(-38,-14 - wind*0.4,-46,16,-32 - wind,58);
ctx.moveTo(16,-20);
ctx.bezierCurveTo(36,-14 + wind*0.4,44,14,32 - wind*0.6,54);
ctx.stroke();

// Tall, V-tapered white-gold immortal tunic (broad shoulders -> slim waist -> long flowing hem)
const rG=ctx.createLinearGradient(-16,-24,16,66);
rG.addColorStop(0,"#ffffff");rG.addColorStop(0.55,"#e3ecf5");rG.addColorStop(1,"#9fb2c7");
ctx.fillStyle=rG;
ctx.beginPath();
ctx.moveTo(-16,-22);ctx.lineTo(16,-22);
ctx.quadraticCurveTo(14,-4,10,12);
ctx.lineTo(19,68);ctx.lineTo(-19,68);
ctx.lineTo(-10,12);
ctx.quadraticCurveTo(-14,-4,-16,-22);
ctx.closePath();
ctx.fill();ctx.strokeStyle="#d4af37";ctx.lineWidth=1.6;ctx.stroke();
// Slim cinched gold waist sash
ctx.fillStyle="#d4af37";ctx.fillRect(-11,8,22,7);

// Sleeves & raised arms channeling Light Path Gu!
for (const side of [-1,1]) {
ctx.save();
ctx.translate(side*18,-16);
ctx.rotate(side*(-0.35 - armRaise*0.85));
ctx.fillStyle="#f4f8fc";ctx.strokeStyle="#ffd700";ctx.lineWidth=1.6;
ctx.beginPath();
ctx.moveTo(0,-6);ctx.lineTo(side*36,-10);ctx.lineTo(side*32,14 + wind*0.2);ctx.lineTo(0,8);ctx.closePath();
ctx.fill();ctx.stroke();
// Glowing palms
if (auraPower>0.1) {
const pg=ctx.createRadialGradient(side*36,-4,2,side*36,-4,18*auraPower);
pg.addColorStop(0,"#ffffff");pg.addColorStop(1,"rgba(255,220,90,0)");
ctx.fillStyle=pg;ctx.beginPath();ctx.arc(side*36,-4,18*auraPower,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}

// Long black hair whipping behind head
ctx.fillStyle="#12151c";
ctx.beginPath();
ctx.moveTo(-13,-48);
ctx.quadraticCurveTo(-34 - wind,-28,-28 - wind*1.2,12);
ctx.lineTo(14,-18);
ctx.closePath();ctx.fill();

// Sculpted Manhua Head & Jawline
const fG=ctx.createRadialGradient(-3,-42,3,0,-38,17);
fG.addColorStop(0,"#fff5eb");fG.addColorStop(0.6,"#f5dcc4");fG.addColorStop(1,"#cfa888");
ctx.fillStyle=fG;
ctx.beginPath();
ctx.moveTo(-13.5,-42);ctx.quadraticCurveTo(-14,-30,-8,-25.5);ctx.quadraticCurveTo(0,-22.5,8,-25.5);ctx.quadraticCurveTo(14,-30,13.5,-42);ctx.quadraticCurveTo(12,-53,0,-53);ctx.quadraticCurveTo(-12,-53,-13.5,-42);ctx.closePath();ctx.fill();
// Sharp sword-brows, fierce luminous golden phoenix eyes, nose & determined mouth
ctx.strokeStyle="#141820";ctx.lineWidth=1.8;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-10,-43);ctx.lineTo(-2.5,-41);ctx.moveTo(10,-43);ctx.lineTo(2.5,-41);ctx.stroke();
for (const side of [-1,1]) {
const ex=side*6;
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.ellipse(ex,-38.5,3.8,2.2,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=auraPower>0.2?"#fff2a6" :"#ffd700";ctx.beginPath();ctx.arc(ex,-38.5,2.1,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(ex - 0.8,-39.2,0.8,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#12141c";ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(ex - side*3.6,-39.5);ctx.quadraticCurveTo(ex,-41.5,ex + side*4.2,-39.2);ctx.stroke();
}
ctx.strokeStyle="rgba(120,70,50,0.7)";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(-2.8,-30.5);ctx.quadraticCurveTo(0,-29.2,3.0,-31.2);ctx.stroke();
// Layered Anime Hair Crown, Sweeping Bangs & Ornate Gold Scholar Crown
ctx.fillStyle="#141822";
ctx.beginPath();ctx.arc(0,-43,15,Math.PI,0);ctx.lineTo(15,-36);ctx.quadraticCurveTo(9,-43,5,-37);ctx.quadraticCurveTo(1,-44,-4,-37);ctx.quadraticCurveTo(-9,-43,-15,-36);ctx.closePath();ctx.fill();
ctx.strokeStyle="rgba(255,255,255,0.28)";ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(0,-44,11,Math.PI*1.18,Math.PI*1.62);ctx.stroke();
// Gold Imperial Scholar Crown & Hairpin
const crG=ctx.createLinearGradient(-8,-62,8,-52);
crG.addColorStop(0,"#fff5b8");crG.addColorStop(1,"#c4911d");
ctx.fillStyle=crG;ctx.fillRect(-8,-60,16,8);
ctx.beginPath();ctx.moveTo(-8,-60);ctx.lineTo(-4,-66);ctx.lineTo(0,-62);ctx.lineTo(4,-66);ctx.lineTo(8,-60);ctx.closePath();ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-14,-56);ctx.lineTo(14,-56);ctx.stroke();
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(0,-56,2.4,0,Math.PI*2);ctx.fill();

ctx.restore();
}
_drawBronzeHallSideElevation(ctx,cx,groundY,scale,t,craterOpen=0) {
ctx.save();
ctx.translate(cx,groundY);
ctx.scale(scale,scale);

// Raised hill mound & stone terrace
const mG=ctx.createLinearGradient(0,-40,0,120);
mG.addColorStop(0,"#4a3a26");mG.addColorStop(1,"#17110b");
ctx.fillStyle=mG;
ctx.beginPath();ctx.moveTo(-360,110);ctx.lineTo(-270,-12);ctx.lineTo(270,-12);ctx.lineTo(360,110);ctx.closePath();ctx.fill();
ctx.strokeStyle="#b89758";ctx.lineWidth=2;ctx.stroke();

// Stone base & 6 bronze columns
ctx.fillStyle="#241b11";ctx.fillRect(-210,-98,420,86);
ctx.strokeStyle="#d4af37";ctx.lineWidth=2;ctx.strokeRect(-210,-98,420,86);
for (const px of [-180,-115,-50,50,115,180]) {
ctx.fillStyle="#70562e";ctx.fillRect(px - 8,-96,16,84);
ctx.strokeStyle="#ffd700";ctx.lineWidth=1;ctx.strokeRect(px - 8,-96,16,84);
}
// Central Doorway
ctx.fillStyle="#0d0a08";ctx.fillRect(-34,-74,68,62);
ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.strokeRect(-34,-74,68,62);

// Sweeping 2-tier bronze palace roof (splits apart dramatically when craterOpen > 0!)
const split=craterOpen*48;
for (const side of [-1,1]) {
ctx.save();
ctx.translate(side*split,craterOpen*8);
ctx.rotate(side*craterOpen*0.18);
const rG=ctx.createLinearGradient(0,-170,0,-96);
rG.addColorStop(0,"#8c703c");rG.addColorStop(0.55,"#45341b");rG.addColorStop(1,"#1f170c");
ctx.fillStyle=rG;
ctx.beginPath();
if (side<0) {
ctx.moveTo(-268,-96);ctx.quadraticCurveTo(-225,-125,-190,-152);ctx.lineTo(-6,-168);ctx.lineTo(-14,-96);
} else {
ctx.moveTo(268,-96);ctx.quadraticCurveTo(225,-125,190,-152);ctx.lineTo(6,-168);ctx.lineTo(14,-96);
}
ctx.closePath();ctx.fill();ctx.strokeStyle="#ffd700";ctx.lineWidth=2.2;ctx.stroke();
ctx.restore();
}

// Plaque
if (craterOpen<0.5) {
ctx.fillStyle="#1c120a";ctx.strokeStyle="#ffd700";ctx.lineWidth=1.8;
ctx.fillRect(-68,-126,136,22);ctx.strokeRect(-68,-126,136,22);
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText("THANH ĐỒNG ĐẠI ĐIỆN",0,-111);
}

// Center Stairs
ctx.fillStyle="#52412a";ctx.fillRect(-56,-12,112,38);
ctx.strokeStyle="#b89758";
for (let sy=-4;sy<=22;sy+=8) {ctx.beginPath();ctx.moveTo(-56,sy);ctx.lineTo(56,sy);ctx.stroke();}

ctx.restore();
}
_getPlayerSkinAndName() {
const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
const pl=this.story&&this.story.game&&this.story.game.player;
const mcSkin=(pl&&typeof pl.getSkinConfig==="function")?pl.getSkinConfig() :pSkins.phuong_nguyen;
const mcName=(pl&&pl.name)?pl.name :"Phương Nguyên";
return {mcSkin,mcName};
}
_drawPlayerWingedHero(ctx,x,y,scale,t,wingOpen=1.0,goldCoat=1.0,facing="up",jetFlame=0) {
const {mcSkin}=this._getPlayerSkinAndName();
ctx.save();
ctx.translate(x,y);
ctx.scale(scale,scale);

// Golden Kim Ha thrust jet underneath when launching!
if (jetFlame>0.02) {
const jh=55 + jetFlame*95 + Math.sin(t*28)*14;
const jG=ctx.createLinearGradient(0,8,0,8 + jh);
jG.addColorStop(0,"rgba(255,255,240,0.96)");
jG.addColorStop(0.45,`rgba(255,215,0,${0.78*jetFlame})`);
jG.addColorStop(1,"rgba(255,165,0,0)");
ctx.fillStyle=jG;
ctx.beginPath();
ctx.moveTo(-18,8);ctx.lineTo(18,8);ctx.lineTo(0,8 + jh);ctx.closePath();
ctx.fill();
}

// Huge sweeping Cổ Cốt Dực (Black Bone Wings -> turning Molten Gold under Cổ Kim Thang!)
if (wingOpen>0.02) {
const wingSpan=76*wingOpen;
const flap=Math.sin(t*15)*0.24;
for (const side of [-1,1]) {
ctx.save();
ctx.scale(side,1);
ctx.rotate(-0.14 + flap);
const wG=ctx.createLinearGradient(0,-24,wingSpan,14);
if (goldCoat>0.28) {
wG.addColorStop(0,"#ffffff");
wG.addColorStop(0.42,"#ffd700");
wG.addColorStop(0.82,"#b8860b");
wG.addColorStop(1,"#5e3f08");
} else {
wG.addColorStop(0,"#323742");
wG.addColorStop(0.55,"#15171d");
wG.addColorStop(1,"#08090c");
}
ctx.fillStyle=wG;
ctx.strokeStyle=goldCoat>0.22?"#fff7c2" :"#697285";
ctx.lineWidth=1.8;
ctx.beginPath();
ctx.moveTo(5,-6);
ctx.quadraticCurveTo(wingSpan*0.52,-42,wingSpan,-14);
ctx.quadraticCurveTo(wingSpan*0.78,10,wingSpan*0.35,14);
ctx.lineTo(5,6);
ctx.closePath();
ctx.fill();ctx.stroke();
// Bone wing ribs
ctx.strokeStyle=goldCoat>0.25?"rgba(255,255,240,0.75)" :"rgba(155,165,185,0.48)";
ctx.lineWidth=1.0;
ctx.beginPath();
ctx.moveTo(8,-4);ctx.lineTo(wingSpan*0.86,-12);
ctx.moveTo(8,0);ctx.lineTo(wingSpan*0.64,4);
ctx.stroke();
ctx.restore();
}
}

// Golden Molten Armor Aura Sphere (Cổ Kim Thang)
if (goldCoat>0.05) {
const aG=ctx.createRadialGradient(0,-2,4,0,-2,44*goldCoat);
aG.addColorStop(0,`rgba(255,255,235,${0.9*goldCoat})`);
aG.addColorStop(0.48,`rgba(255,215,0,${0.52*goldCoat})`);
aG.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=aG;ctx.beginPath();ctx.arc(0,-2,46*goldCoat,0,Math.PI*2);ctx.fill();
}

// Actual Player Character Sprite
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
ctx.save();ctx.scale(1.25,1.25);
global.PlayerManager.drawSkinPixelSprite(ctx,mcSkin,{bobY:0,facing});
ctx.restore();
}

// Molten Gold Glaze Ring coating the body
if (goldCoat>0.3) {
ctx.strokeStyle=`rgba(255,242,166,${0.7*goldCoat})`;
ctx.lineWidth=1.6;
ctx.beginPath();ctx.ellipse(0,-2,20,28,0,0,Math.PI*2);ctx.stroke();
}

ctx.restore();
}

// ==============================================================================
// MAIN RENDER DISPATCHER (3 FULL VIDEO-STYLE CINEMA CLIPS!)
// ==============================================================================
render(ctx,vw,vh) {
if (!this.active|| !ctx) return;

ctx.save();
if (this.clipId==="thien_boc_quang_ha") {
this._renderThienBocQuangHaVideo(ctx,vw,vh);
} else if (this.clipId==="thai_co_quang_quyen") {
this._renderThaiCoQuangQuyenVideo(ctx,vw,vh);
} else if (this.clipId==="vinh_dieu_ngo_thuong") {
this._renderVinhDieuNgoThuongVideo(ctx,vw,vh);
}

// Subtle widescreen cinema vignette + top/bottom movie bars
const vig=ctx.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*0.32,vw/2,vh/2,Math.max(vw,vh)*0.72);
vig.addColorStop(0,"rgba(0,0,0,0)");
vig.addColorStop(1,"rgba(0,0,0,0.58)");
ctx.fillStyle=vig;ctx.fillRect(0,0,vw,vh);

const barH=Math.max(46,Math.round(vh*0.095));
ctx.fillStyle="#030407";
ctx.fillRect(0,0,vw,barH);
ctx.fillRect(0,vh - barH - 22,vw,barH + 22);
ctx.strokeStyle="rgba(212,175,55,0.45)";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(0,barH);ctx.lineTo(vw,barH);ctx.moveTo(0,vh - barH - 22);ctx.lineTo(vw,vh - barH - 22);ctx.stroke();
ctx.restore();
}

// ==============================================================================
// CLIP 1: GRAND 6-SHOT ANIME VIDEO — THIÊN BỘC QUANG HÀ (11.8s)
// ==============================================================================
}
ThreeKingsCinema._math={_clamp,_lerp,_easeOutCubic,_easeInCubic,_easeInOutSine,_fmtSec};
global.ThreeKingsCinema=ThreeKingsCinema;
})(window);
