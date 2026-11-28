(function (global) {
"use strict";

class StoneCarvingCanvas {
constructor(system) {
this.system=system;
this._modal=null;
this._canvas=null;
this._ctx=null;
this._rafId=null;
this._lastTs=0;
this._audioCtx=null;
this.active=false;
this.stone=null;
this.progress=0; // 0..100 (0=raw rock, 35=layer 1 off, 75=layer 2 glowing cracks, 100=cracked open!)
this.revealed=false;
this.isDragging=false;
this._lastPtr=null;
this._sparks=[];
this._chips=[];
this._sfxCd=0;
this._shake=0;
this._revealT=0;
this._rewardSummary="";
this._bound=false;
}

_playGrindSfx(kind="chip") {
const st=global.vanCoSettings;
if (st&& !st.get("soundEnabled")) return;
const vol=st?st.getVolumeMultiplier() :0.8;
if (vol<=0.01) return;
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return;
if (!this._audioCtx) this._audioCtx=new AudioCtx();
if (this._audioCtx.state==="suspended") this._audioCtx.resume();
const ac=this._audioCtx;
const now=ac.currentTime;
const tone=(f0,f1,dur,type,v,delay=0)=>{
const o=ac.createOscillator();const g=ac.createGain();
o.type=type;o.frequency.setValueAtTime(f0,now + delay);
if (f1) o.frequency.exponentialRampToValueAtTime(f1,now + delay + dur);
g.gain.setValueAtTime(0.0001,now + delay);
g.gain.linearRampToValueAtTime(Math.max(0.0001,v*vol),now + delay + 0.01);
g.gain.exponentialRampToValueAtTime(0.0001,now + delay + dur);
o.connect(g);g.connect(ac.destination);
o.start(now + delay);o.stop(now + delay + dur + 0.03);
};
if (kind==="chip") {
tone(240 + Math.random()*160,110,0.06,"triangle",0.08);
} else if (kind==="crack") {
tone(420,140,0.16,"sawtooth",0.12);
tone(640,880,0.14,"sine",0.08,0.04);
} else if (kind==="jackpot") {
tone(523,523,0.18,"triangle",0.13,0);
tone(659,659,0.18,"triangle",0.13,0.09);
tone(784,1046,0.38,"triangle",0.15,0.18);
tone(1046,1567,0.42,"sine",0.12,0.30);
} else if (kind==="dud") {
tone(210,95,0.28,"sawtooth",0.10);
}
} catch (e) {}
}

_ensureModal() {
if (this._modal) return this._modal;
let modal=document.getElementById("stone-carving-modal");
if (!modal) {
modal=document.createElement("div");
modal.id="stone-carving-modal";
modal.className="modal-backdrop hidden sg-carve-backdrop";
modal.innerHTML=`
<div class="modal-window sg-carve-window">
<div class="modal-header sg-carve-header">
<div>
<h3 id="sg-carve-title" style="margin:0;color:#ffd700;">🪨 Đổ Thạch Đài — Mài Đá Tìm Cổ</h3>
<span id="sg-carve-sub" class="sub-text" style="color:#7ef7f0;">Di chuột / vuốt tay qua khối đá để mài từng lớp vỏ đá!</span>
</div>
<button id="sg-carve-close" class="btn-mini">✕ Đóng</button>
</div>
<div class="sg-carve-stage">
<canvas id="stoneCarvingCanvas" width="560" height="330"></canvas>
</div>
<div class="sg-carve-progress-wrap">
<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
<span id="sg-layer-lbl" style="color:#ffd700;font-weight:bold;">Lớp 1/3: Đang mài vỏ đá thô ngoài cùng...</span>
<strong id="sg-pct-lbl" style="color:#7ef7c4;">0%</strong>
</div>
<div class="progress-track" style="height:10px;">
<div id="sg-prog-fill" class="progress-fill" style="width:0%;background:linear-gradient(90deg,#b89758,#ffd700,#7ef7c4);"></div>
</div>
</div>
<div id="sg-reveal-banner" class="sg-reveal-banner hidden"></div>
<div class="sg-carve-actions">
<button id="sg-btn-chip" class="btn-accent">🔨 Mài Cẩn Thận (+22%)</button>
<button id="sg-btn-crack" class="btn-primary">⚡ Bổ Đôi Mở Ngay</button>
<button id="sg-btn-collect" class="btn-primary hidden">✨ Nhận Bảo Vật & Đóng</button>
</div>
</div>
`;
document.body.appendChild(modal);
}
this._modal=modal;
this._canvas=modal.querySelector("#stoneCarvingCanvas");
this._ctx=this._canvas.getContext("2d",{alpha:false})||this._canvas.getContext("2d");

if (!this._bound) {
this._bound=true;
modal.querySelector("#sg-carve-close").addEventListener("click",()=>{
if (!this.revealed&&this.stone) this._completeReveal();
this.close();
});
modal.querySelector("#sg-btn-collect").addEventListener("click",()=>this.close());
modal.querySelector("#sg-btn-chip").addEventListener("click",()=>{
if (this.revealed) return;
this._applyGrind(22,280 + (Math.random() - 0.5)*90,165 + (Math.random() - 0.5)*70);
});
modal.querySelector("#sg-btn-crack").addEventListener("click",()=>{
if (this.revealed) return;
this._applyGrind(100 - this.progress,280,165);
});

const toLocal=(e)=>{
const rect=this._canvas.getBoundingClientRect();
const cx=(e.touches&&e.touches[0])?e.touches[0].clientX :e.clientX;
const cy=(e.touches&&e.touches[0])?e.touches[0].clientY :e.clientY;
return {
x:((cx - rect.left) / Math.max(1,rect.width))*560,
y:((cy - rect.top) / Math.max(1,rect.height))*330
};
};
this._canvas.addEventListener("pointerdown",(e)=>{
if (!this.active||this.revealed) return;
e.preventDefault();
this.isDragging=true;
const pt=toLocal(e);
this._lastPtr=pt;
if (Math.hypot(pt.x - 280,pt.y - 165)<=118) {
this._applyGrind(4.5,pt.x,pt.y);
}
});
this._canvas.addEventListener("pointermove",(e)=>{
if (!this.active||this.revealed|| !this.isDragging) return;
const pt=toLocal(e);
const dist=this._lastPtr?Math.hypot(pt.x - this._lastPtr.x,pt.y - this._lastPtr.y) :0;
this._lastPtr=pt;
if (dist>3&&Math.hypot(pt.x - 280,pt.y - 165)<=122) {
this._applyGrind(Math.min(5.2,dist*0.14),pt.x,pt.y);
}
});
const endDrag=()=>{this.isDragging=false;this._lastPtr=null;};
window.addEventListener("pointerup",endDrag);
window.addEventListener("pointercancel",endDrag);
}
return modal;
}

open(stone) {
this.stone=stone;
this.progress=0;
this.revealed=false;
this.isDragging=false;
this._sparks=[];
this._chips=[];
this._shake=0;
this._revealT=0;
this._rewardSummary="";
this.active=true;

const modal=this._ensureModal();
modal.querySelector("#sg-carve-title").textContent=`🪨 Đổ Thạch Đài — ${stone.name} (${stone.weightKg} cân)`;
modal.querySelector("#sg-carve-sub").textContent="Kéo chuột hoặc vuốt ngón tay trực tiếp lên khối đá để mài từng lớp vỏ!";
modal.querySelector("#sg-reveal-banner").classList.add("hidden");
modal.querySelector("#sg-btn-chip").classList.remove("hidden");
modal.querySelector("#sg-btn-crack").classList.remove("hidden");
modal.querySelector("#sg-btn-collect").classList.add("hidden");
this._syncProgressUI();
modal.classList.remove("hidden");

this._lastTs=performance.now();
if (this._rafId) cancelAnimationFrame(this._rafId);
this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
}

_applyGrind(amount,px,py) {
if (!this.stone||this.revealed) return;
const prev=this.progress;
this.progress=Math.min(100,this.progress + amount);
this._shake=Math.min(7,this._shake + 2.4);

// Spawn rock dust chips & golden light sparks if treasure inside!
const hasTreasure=(this.stone.outcomeType!=="dud");
const chipCount=Math.min(10,Math.max(3,Math.round(amount*0.6)));
for (let i=0;i<chipCount;i++) {
const a=Math.random()*Math.PI*2;
const spd=55 + Math.random()*155;
this._chips.push({
x:px,y:py,
vx:Math.cos(a)*spd,vy:Math.sin(a)*spd - 40,
sz:2.5 + Math.random()*4.2,
col:(i % 3===0&&hasTreasure&&this.progress>=35)?this.stone.auraColor :this.stone.shellA,
life:0.45 + Math.random()*0.25,maxLife:0.7
});
}

if (this._sfxCd<=0) {
this._sfxCd=0.09;
this._playGrindSfx((prev<35&&this.progress>=35)||(prev<72&&this.progress>=72)?"crack" :"chip");
}
this._syncProgressUI();
if (this.progress>=100) {
this._completeReveal();
}
}

_syncProgressUI() {
if (!this._modal|| !this.stone) return;
const pct=Math.round(this.progress);
this._modal.querySelector("#sg-pct-lbl").textContent=`${pct}%`;
this._modal.querySelector("#sg-prog-fill").style.width=`${pct}%`;
const lbl=this._modal.querySelector("#sg-layer-lbl");
const hasGood=(this.stone.outcomeType!=="dud");
if (pct<35) {
lbl.textContent="Lớp 1/3: Đang bào mòn lớp vỏ đá thô bên ngoài...";
lbl.style.color="#e2bf75";
} else if (pct<75) {
lbl.textContent=hasGood
?"✨ Lớp 2/3: KHE NỨT PHÁT SÁNG! Linh khí bên trong đang tràn ra!"
:"Lớp 2/3: Lớp đá giữa khá xám xịt, tiếp tục mài sâu hơn...";
lbl.style.color=hasGood?"#7ef7c4" :"#b3aa9c";
} else if (pct<100) {
lbl.textContent=hasGood
?"🔥 Lớp 3/3: SẮP NỔ VỠ PHONG ẤN! Bảo quang chói lọi!"
:"Lớp 3/3: Sắp chạm lõi đá...";
lbl.style.color=hasGood?"#ffd700" :"#ff9f43";
} else {
lbl.textContent="🎉 Đã mài xong hoàn toàn!";
lbl.style.color="#7ef7c4";
}
}

_completeReveal() {
if (this.revealed|| !this.stone) return;
this.revealed=true;
this.progress=100;
this._shake=10;
const res=this.system.claimOpenedStone(this.stone);
this._rewardSummary=res.bannerText||res.message;
this._playGrindSfx(this.stone.outcomeType==="dud"?"dud" :"jackpot");

// Explosion burst of light sparks
const col=this.stone.outcomeType==="dud"?"#7f8c8d" :this.stone.auraColor;
for (let i=0;i<28;i++) {
const a=(Math.PI*2*i)/28 + Math.random()*0.2;
const spd=90 + Math.random()*210;
this._sparks.push({
x:280,y:165,
vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,
r:2.5 + Math.random()*3.5,
col:(i % 2===0)?"#ffffff" :col,
life:0.8 + Math.random()*0.4,maxLife:1.2
});
}

this._syncProgressUI();
const banner=this._modal.querySelector("#sg-reveal-banner");
banner.innerHTML=this._rewardSummary;
banner.style.borderColor=col;
banner.classList.remove("hidden");
this._modal.querySelector("#sg-btn-chip").classList.add("hidden");
this._modal.querySelector("#sg-btn-crack").classList.add("hidden");
this._modal.querySelector("#sg-btn-collect").classList.remove("hidden");
}

close() {
this.active=false;
if (this._rafId) {cancelAnimationFrame(this._rafId);this._rafId=null;}
if (this._modal) this._modal.classList.add("hidden");
const g=this.system&&this.system.game;
if (g&&g.ui) {
g.ui.updateHubTopbar();
if (g.ui.activeHubTab==="tab-market") g.ui.renderMarketTab();
}
}

_loop(ts) {
if (!this.active) {this._rafId=null;return;}
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs) / 1000));
this._lastTs=ts;
if (this._sfxCd>0) this._sfxCd=Math.max(0,this._sfxCd - dt);
if (this._shake>0) this._shake=Math.max(0,this._shake - dt*24);
if (this.revealed) this._revealT +=dt;

for (let i=this._chips.length - 1;i>=0;i--) {
const c=this._chips[i];
c.x +=c.vx*dt;c.y +=c.vy*dt;c.vy +=380*dt;c.life -=dt;
if (c.life<=0) this._chips.splice(i,1);
}
for (let i=this._sparks.length - 1;i>=0;i--) {
const s=this._sparks[i];
s.x +=s.vx*dt;s.y +=s.vy*dt;s.vx *=0.96;s.vy *=0.96;s.life -=dt;
if (s.life<=0) this._sparks.splice(i,1);
}

this._render(ts*0.001);
this._rafId=requestAnimationFrame((nts)=>this._loop(nts));
}

_drawRockPolygon(ctx,cx,cy,rad,seed) {
ctx.beginPath();
const pts=11;
for (let i=0;i<pts;i++) {
const a=(Math.PI*2*i)/pts;
const jitter=0.84 + ((Math.sin(seed*1.7 + i*3.1)*0.5 + 0.5)*0.28);
const rx=cx + Math.cos(a)*rad*jitter;
const ry=cy + Math.sin(a)*rad*0.84*jitter;
if (i===0) ctx.moveTo(rx,ry);else ctx.lineTo(rx,ry);
}
ctx.closePath();
}

_render(t) {
const ctx=this._ctx;
const st=this.stone;
if (!ctx|| !st) return;
const W=560;const H=330;
const cx=W*0.5;const cy=H*0.5;

// Rich wooden Thương Gia Thành Stone-Cutting Pedestal backdrop
const bg=ctx.createRadialGradient(cx,cy,25,cx,cy,W*0.6);
bg.addColorStop(0,"#261e16");bg.addColorStop(0.65,"#120e0b");bg.addColorStop(1,"#070506");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Pedestal circular carved stone tray
ctx.fillStyle="#1c1611";ctx.strokeStyle="#8a6c34";ctx.lineWidth=2.5;
ctx.beginPath();ctx.ellipse(cx,cy + 58,170,56,0,0,Math.PI*2);ctx.fill();ctx.stroke();

const shX=this._shake>0?(Math.random() - 0.5)*this._shake :0;
const shY=this._shake>0?(Math.random() - 0.5)*this._shake :0;
const hasGood=(st.outcomeType!=="dud");

ctx.save();
ctx.translate(shX,shY);

if (!this.revealed) {
// Glow leaking out of stone as progress increases!
if (hasGood&&this.progress>=25) {
const glowRatio=(this.progress - 25) / 75;
const gr=ctx.createRadialGradient(cx,cy,14,cx,cy,135 + glowRatio*45);
gr.addColorStop(0,st.auraColor);
gr.addColorStop(1,"rgba(0,0,0,0)");
ctx.save();ctx.globalAlpha=0.22 + glowRatio*0.55;
ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,175,0,Math.PI*2);ctx.fill();
ctx.restore();
}

// Shrinking rock radius as outer layers chip off
const rockR=108 - this.progress*0.26;
ctx.fillStyle="rgba(0,0,0,0.48)";
ctx.beginPath();ctx.ellipse(cx + 6,cy + 56,rockR*1.05,rockR*0.38,0,0,Math.PI*2);ctx.fill();

// Main raw ore rock body
const rg=ctx.createRadialGradient(cx - 26,cy - 28,12,cx,cy,rockR*1.1);
rg.addColorStop(0,st.shellA);rg.addColorStop(1,st.shellB);
ctx.fillStyle=rg;
this._drawRockPolygon(ctx,cx,cy,rockR,st.seed);
ctx.fill();
ctx.strokeStyle="#120e0b";ctx.lineWidth=2.5;ctx.stroke();

// Natural surface ore veins
ctx.strokeStyle=st.veinCol;ctx.globalAlpha=0.45;ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(cx - rockR*0.55,cy - rockR*0.2);ctx.lineTo(cx - rockR*0.1,cy + rockR*0.1);ctx.lineTo(cx + rockR*0.48,cy - rockR*0.15);
ctx.stroke();ctx.globalAlpha=1;

// Glowing Fracture Cracks growing with grinding progress!
if (this.progress>12) {
const cracks=Math.min(7,Math.floor(this.progress / 13));
ctx.strokeStyle=hasGood?st.auraColor :"#16181c";
ctx.lineWidth=hasGood?(2.2 + (this.progress / 45)) :2.0;
ctx.lineCap="round";
for (let k=0;k<cracks;k++) {
const a=(k*Math.PI*2)/7 + (st.seed % 5)*0.3;
const len=rockR*(0.35 + (this.progress / 100)*0.55);
ctx.beginPath();
ctx.moveTo(cx,cy);
ctx.lineTo(cx + Math.cos(a + 0.14)*len*0.55,cy + Math.sin(a + 0.14)*len*0.55);
ctx.lineTo(cx + Math.cos(a)*len,cy + Math.sin(a)*len);
ctx.stroke();
}
}
} else {
// REVEALED TREASURE SHOWCASE!
const p=Math.min(1,this._revealT*2.4);
if (hasGood) {
// Rotating Celestial Halo behind treasure (ZERO setLineDash!)
const gr=ctx.createRadialGradient(cx,cy,10,cx,cy,155);
gr.addColorStop(0,st.auraColor);gr.addColorStop(1,"rgba(0,0,0,0)");
ctx.save();ctx.globalAlpha=0.52*p;ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,155,0,Math.PI*2);ctx.fill();ctx.restore();

ctx.save();ctx.translate(cx,cy);ctx.rotate(t*0.7);
ctx.strokeStyle=st.auraColor;ctx.lineWidth=2.5;ctx.globalAlpha=0.75*p;
for (let k=0;k<4;k++) {
const a=k*Math.PI*0.5;
ctx.beginPath();ctx.arc(0,0,76,a,a + 1.0);ctx.stroke();
}
ctx.restore();
}

const bob=Math.sin(t*3.2)*6;
const pay=st.payload;
if (pay&&pay.kind==="gu"&&global.vanCoGuArt) {
const drawn=global.vanCoGuArt.drawOnCanvas(ctx,pay.guId,cx,cy + bob,108*p,pay.rank);
if (!drawn) {
ctx.font="54px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillText(pay.icon||"🪲",cx,cy + bob);
}
} else {
const ico=pay.kind==="dud"?"🪨" :(pay.kind==="stones"?"💎" :(pay.kind==="immortal_stones"?"🌟" :(pay.icon||"📦")));
ctx.font=`${Math.round(58*p)}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillText(ico,cx,cy + bob);
}

ctx.font="bold 16px Georgia";ctx.textAlign="center";
ctx.fillStyle=hasGood?"#ffd700" :"#95a5a6";
ctx.fillText(st.rarityLabel,cx,cy + 92);
}

// Rock chips & light sparks
for (let i=0;i<this._chips.length;i++) {
const c=this._chips[i];
ctx.globalAlpha=Math.max(0,c.life / c.maxLife);
ctx.fillStyle=c.col;
ctx.fillRect(c.x - c.sz*0.5,c.y - c.sz*0.5,c.sz,c.sz);
}
for (let i=0;i<this._sparks.length;i++) {
const s=this._sparks[i];
ctx.globalAlpha=Math.max(0,s.life / s.maxLife);
ctx.fillStyle=s.col;
ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;
ctx.restore();
}
}

global.StoneCarvingCanvas=StoneCarvingCanvas;
})(window);
