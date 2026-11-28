(function (global) {
"use strict";

const D=global.VanCoReverseFlowData;

class ReverseFlowArena {
constructor(sys) {
this.sys=sys;
this._screen=null;
this._canvas=null;
this._ctx=null;
this._riverTex=null;
this._riverPat=null;
this._rafId=null;
this._lastTs=0;
this._audioCtx=null;
this.active=false;
this.pausedForBoon=false;
this.finished=false;
this.W=900;
this.H=560;
this.keys={};
this._ptrDown=false;
this._ptrX=450;
this._ptrY=220;
this._hudTick=0;
this._bound=false;
}

_playSfx(kind="shot") {
const st=global.vanCoSettings;
if (st&& !st.get("soundEnabled")) return;
const vol=st?st.getVolumeMultiplier() :0.8;
if (vol<=0.01) return;
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return;
if (!this._audioCtx) this._audioCtx=new AudioCtx();
if (this._audioCtx.state==="suspended") this._audioCtx.resume();
const ac=this._audioCtx;const now=ac.currentTime;
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
if (kind==="shot") tone(540,780,0.08,"triangle",0.07);
else if (kind==="jump") tone(310,640,0.12,"sine",0.09);
else if (kind==="dash") tone(260,820,0.14,"triangle",0.10);
else if (kind==="boom") {tone(190,65,0.22,"sawtooth",0.13);tone(460,210,0.16,"triangle",0.08,0.03);}
else if (kind==="boon") {tone(523,784,0.16,"triangle",0.12,0);tone(784,1046,0.24,"sine",0.12,0.08);}
else if (kind==="hit") tone(175,65,0.16,"sawtooth",0.13);
else if (kind==="revive") {tone(392,784,0.22,"sine",0.14,0);tone(784,1568,0.34,"triangle",0.14,0.12);}
} catch (e) {}
}

_getRiverPattern(ctx) {
if (this._riverPat) return this._riverPat;
const c=document.createElement("canvas");
c.width=128;c.height=128;
const rctx=c.getContext("2d");
rctx.strokeStyle="rgba(145,240,255,0.22)";
rctx.lineWidth=2.6;rctx.lineCap="round";
for (let col=0;col<4;col++) {
const x0=16 + col*32;
rctx.beginPath();
for (let y=0;y<=128;y+=8) {
const xx=x0 + Math.sin((y/128)*Math.PI*2 + col*1.5)*5;
if (y===0) rctx.moveTo(xx,y);else rctx.lineTo(xx,y);
}
rctx.stroke();
}
rctx.fillStyle="rgba(235,255,255,0.48)";
for (const [gx,gy] of [[20,24],[82,18],[46,72],[108,96],[28,112]]) {
rctx.fillRect(gx,gy,2.5,7);
}
this._riverTex=c;
this._riverPat=ctx.createPattern(c,"repeat");
return this._riverPat;
}

_ensureDOM() {
if (this._screen) return this._screen;
let scr=document.getElementById("reverse-flow-screen");
if (!scr) {
scr=document.createElement("div");
scr.id="reverse-flow-screen";
scr.className="dream-realm-screen hidden";
scr.innerHTML=`
<div class="dream-topbar" style="border-color:#4ce6ff;">
<div class="dream-top-title">
<strong id="rf-title" style="color:#7ef7f0;font-size:15px;">🌊 Nghịch Lưu Hà — Chế Độ Vô Tận</strong>
<span id="rf-sub" class="sub-text" style="color:#ffd700;"></span>
</div>
<div class="dream-top-stats">
<span id="rf-hud-hp" class="badge" style="border-color:#5cc995;color:#7ef7c4;"></span>
<span id="rf-hud-floor" class="badge" style="border-color:#ffd700;color:#ffd700;"></span>
<span id="rf-hud-bank" class="badge" style="border-color:#4ce6ff;color:#4ce6ff;"></span>
<button id="rf-btn-bag" class="btn-mini btn-secondary" title="Mở Nhanh Kho Đồ (Phím I)">🎒 [I]</button>
<button id="rf-btn-ap" class="btn-mini btn-accent" title="Mở Nhanh Không Khiếu & Kho Cổ (Phím O)">☯️ [O]</button>
<button id="rf-btn-retreat" class="btn-danger" style="padding:5px 10px;font-size:11.5px;">🏃 Rút Lui Nhận Thưởng</button>
</div>
</div>
<div class="dream-stage-wrap">
<canvas id="reverseFlowCanvas" width="900" height="560"></canvas>
<div id="rf-boon-overlay" class="rf-boon-overlay hidden">
<div class="rf-boon-header">
<h2 id="rf-boon-title" style="margin:0;color:#ffd700;">✨ VƯỢT TẦNG THÀNH CÔNG — CHỌN 1 TRONG 3 ĐẠO NGÂN / TIÊN CỔ</h2>
<div style="display:flex;gap:8px;align-items:center;justify-content:center;margin-top:6px;flex-wrap:wrap;">
<span id="rf-boon-bank-sub" class="sub-text" style="color:#7ef7c4;"></span>
<button id="rf-btn-reroll" class="btn-mini btn-accent">🎲 Đổi 3 Thẻ Khác (1)</button>
<button id="rf-btn-cashout-boon" class="btn-mini btn-secondary">💎 Dừng Leo & Nhận Toàn Bộ Thưởng</button>
</div>
</div>
<div id="rf-boon-cards" class="rf-boon-cards"></div>
</div>
<div id="rf-result-overlay" class="dream-overlay-card hidden">
<h2 id="rf-res-title" style="margin:0 0 8px 0;color:#ffd700;"></h2>
<p id="rf-res-summary" style="color:#e6dfd5;margin-bottom:8px;"></p>
<p id="rf-res-reward" style="color:#7ef7c4;font-weight:bold;margin-bottom:14px;"></p>
<button id="rf-btn-close" class="btn-primary" style="padding:8px 22px;">↩️ Quay Về Đại Bản Doanh</button>
</div>
</div>
<div id="rf-action-bar" class="dream-action-bar">
<button id="rf-act-1" class="btn-primary dream-act-btn">🌙 Cổ Thuật [1/Click]</button>
<button id="rf-act-2" class="btn-accent dream-act-btn">⚡ Sát Chiêu [2/Q]</button>
<button id="rf-act-3" class="btn-primary dream-act-btn">🌊 Nghịch Lưu Đại Chiêu [3/E]</button>
<button id="rf-act-jump" class="btn-secondary dream-act-btn">🦘 Nhảy Vượt Sóng [SPACE]</button>
<button id="rf-act-dash" class="btn-secondary dream-act-btn">💨 Lướt Ngược Dòng [G]</button>
</div>
`;
document.body.appendChild(scr);
}
this._screen=scr;
this._canvas=scr.querySelector("#reverseFlowCanvas");
this._ctx=this._canvas.getContext("2d",{alpha:false})||this._canvas.getContext("2d");

if (!this._bound) {
this._bound=true;
scr.querySelector("#rf-btn-bag").addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("bag");});
scr.querySelector("#rf-btn-ap").addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("gu");});
scr.querySelector("#rf-btn-retreat").addEventListener("click",()=>{
if (!this.active) return;
if (!this.finished) this._finishRun(true);
else this.close();
});
scr.querySelector("#rf-btn-cashout-boon").addEventListener("click",()=>{
if (!this.active||this.finished) return;
this._finishRun(true);
});
scr.querySelector("#rf-btn-close").addEventListener("click",()=>this.close());
scr.querySelector("#rf-btn-reroll").addEventListener("click",()=>this._rerollBoons());
scr.querySelector("#rf-act-1").addEventListener("click",()=>this._castPrimary());
scr.querySelector("#rf-act-2").addEventListener("click",()=>this._castKillerBurst());
scr.querySelector("#rf-act-3").addEventListener("click",()=>this._castUltimate());
scr.querySelector("#rf-act-jump").addEventListener("click",()=>this._triggerJump());
scr.querySelector("#rf-act-dash").addEventListener("click",()=>this._triggerDash());

const toLogical=(e)=>{
const rect=this._canvas.getBoundingClientRect();
const cx=(e.touches&&e.touches[0])?e.touches[0].clientX :e.clientX;
const cy=(e.touches&&e.touches[0])?e.touches[0].clientY :e.clientY;
return {x:((cx - rect.left)/Math.max(1,rect.width))*900,y:((cy - rect.top)/Math.max(1,rect.height))*560};
};
this._canvas.addEventListener("pointerdown",(e)=>{
if (!this.active||this.pausedForBoon||this.finished) return;
e.preventDefault();
this._ptrDown=true;
const pt=toLogical(e);this._ptrX=pt.x;this._ptrY=pt.y;
this._castPrimary(pt.x,pt.y);
});
this._canvas.addEventListener("pointermove",(e)=>{
if (!this.active||this.pausedForBoon||this.finished) return;
const pt=toLogical(e);this._ptrX=pt.x;this._ptrY=pt.y;
});
const endP=()=>{this._ptrDown=false;};
window.addEventListener("pointerup",endP);
window.addEventListener("pointercancel",endP);

window.addEventListener("keydown",(e)=>{
if (!this.active) return;
if (global.vanCoSettings&&global.vanCoSettings.isOpen()) return;
if (global.vanCoQuickBag&&global.vanCoQuickBag.isOpen()) return;
this.keys[e.code]=true;
if (e.code==="Escape") {e.preventDefault();if (!this.finished) this._finishRun(true);else this.close();return;}
if (this.pausedForBoon||this.finished) return;
if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
if (e.code==="Space") this._triggerJump();
else if (e.code==="KeyG"||e.code==="ShiftLeft") this._triggerDash();
else if (e.code==="Digit1"||e.code==="KeyJ") this._castPrimary();
else if (e.code==="Digit2"||e.code==="KeyQ"||e.code==="KeyK") this._castKillerBurst();
else if (e.code==="Digit3"||e.code==="KeyE"||e.code==="KeyL") this._castUltimate();
});
window.addEventListener("keyup",(e)=>{this.keys[e.code]=false;});
}
return scr;
}

open() {
const g=this.sys&&this.sys.game;
if (!g|| !g.player) return;
const pl=g.player;
const gs=g.guSystem;

// Nghịch Lưu Hà Law: ALL Gu worms & Killer Moves below Rank 9 are SEALED!
// Only Rank 9 Venerable Gu can be activated; otherwise the cultivator fights with Perseverance Martial Will!
const eqGus=[];
if (gs&&typeof gs.getEquippedGuAt==="function") {
for (let si=0;si<8;si++) {const g0=gs.getEquippedGuAt(si);if (g0&&(g0.rank||1)>=9) eqGus.push(g0);}
}
const eqKm9=(gs&&typeof gs.getEquippedKillerMoveAt==="function")
?[0,1,2,3].map(k=>gs.getEquippedKillerMoveAt(k)).find(m=>m&&(m.moveRank||1)>=9)
:null;
this.hasRank9Gu=eqGus.length>0;
this.hasRank9Km=Boolean(eqKm9);
this.primaryName=this.hasRank9Gu?`👑 ${eqGus[0].name} (9C)` :"👊 Quyền Cước Kiên Trì";
this.primaryColor=this.hasRank9Gu?(eqGus[0].projectileColor||"#ffd700") :"#7ef7f0";
this.killerName=this.hasRank9Km?`👑 ${eqKm9.name} (9C)` :"🌊 Ý Chí Phá Lãng";
this.killerColor=this.hasRank9Km?"#ffd700" :"#4ce6ff";

// Run state
this.floor=1;
this.floorsCleared=0;
this.totalKills=0;
this.rerollsLeft=2;
this.bankedStones=0;
this.bankedDaoExp=0;
this.bankedMerit=0;
this.boonCounts={};
this.activeBoons=[];
this.boonStats={
dmgMult:this.hasRank9Gu?1.35 :1.0,skillMult:this.hasRank9Km?1.35 :1.0,spdMult:1.0,cdMult:1.0,
extraShots:0,pierce:1,critChance:0.15,critMult:1.75,
lifesteal:0,maxHpBonus:0,shieldPerFloor:0,instantHealPct:0,
chainLightning:0,frostJump:0,dashNova:0,currentResist:0,dmgReduce:0,
reflectPct:0,autoSwords:0,revives:0,regenPctPerSec:0,orbitBlades:0,timeStopOnUlt:false
};

const baseMaxHp=Math.max(160,Math.min(2400,Math.round(160 + (g.aperture?g.aperture.rank :1)*95)));
this.pl={
x:this.W*0.5,y:this.H*0.72,z:0,vz:0,jumpCount:0,maxJumps:2,
hp:baseMaxHp,baseMaxHp,maxHp:baseMaxHp,shield:0,
r:14,spd:265,facing:"up",
cd1:0,cd2:0,cd3:0,dashCd:0,iframe:0,autoSwordCd:0.8,orbitAngle:0
};

this.enemies=[];
this.pBullets=[];
this.eBullets=[];
this.logs=[]; // Floating river obstacles (jump over them!)
this.islands=[]; // Safe jade stone platforms in the river
this.fxRings=[];
this.arcs=[];
this.floats=[];
this.surgeTimer=9.0;
this.surgeActive=0;
this.timeStopTimer=0;
this.spawnLeft=0;
this.spawnTimer=0.5;
this.pausedForBoon=false;
this.finished=false;
this.active=true;
this.keys={};
this._ptrDown=false;

const scr=this._ensureDOM();
scr.querySelector("#rf-sub").textContent=this.hasRank9Gu
?"👑 Đang mang Cửu Chuyển Tiên Cổ (+35% Uy Lực — Phá Áp Chế Nghịch Lưu Hà)!"
:"🌊 Luật Nghịch Lưu Hà: Phong ấn toàn bộ Cổ Trùng < 9 Chuyển! Dùng Quyền Cước Kiên Trì & Ý Chí Phá Lãng!";
scr.querySelector("#rf-act-1").textContent=`${this.primaryName.slice(0,16)} [1]`;
scr.querySelector("#rf-act-2").textContent=`⚡ ${this.killerName.slice(0,14)} [2/Q]`;
scr.querySelector("#rf-boon-overlay").classList.add("hidden");
scr.querySelector("#rf-result-overlay").classList.add("hidden");
scr.classList.remove("hidden");

this._startFloor(1);
this._syncHud();

if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") {
global.vanCoSettings.syncBgmForScreen("battle");
}
this._lastTs=performance.now();
if (this._rafId) cancelAnimationFrame(this._rafId);
this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
}

_startFloor(fNum) {
this.floor=fNum;
this.pausedForBoon=false;
this.enemies=[];
this.eBullets=[];
this.logs=[];
this.isBossFloor=(fNum % 3===0);
this.spawnLeft=this.isBossFloor?(4 + Math.min(8,Math.floor(fNum*0.6))) :(5 + Math.min(14,fNum));
this.spawnTimer=0.45;
this.surgeTimer=Math.max(5.5,10.5 - fNum*0.3);
this.surgeActive=0;

// Refresh player maxHp & floor shield from boons
this.pl.maxHp=Math.round(this.pl.baseMaxHp*(1 + this.boonStats.maxHpBonus));
if (this.boonStats.shieldPerFloor>0) {
this.pl.shield=Math.round(this.pl.maxHp*this.boonStats.shieldPerFloor);
}
if (this.boonStats.instantHealPct>0) {
this.pl.hp=Math.min(this.pl.maxHp,this.pl.hp + Math.round(this.pl.maxHp*this.boonStats.instantHealPct));
this.boonStats.instantHealPct=0;
}
this.pl.x=this.W*0.5;this.pl.y=this.H*0.72;this.pl.z=0;this.pl.vz=0;this.pl.jumpCount=0;

// Place 2 safe Jade Stone River Islands (standing on them cancels river push!)
this.islands=[
{x:220 + Math.random()*160,y:170 + Math.random()*170,rx:56,ry:34},
{x:540 + Math.random()*160,y:210 + Math.random()*170,rx:56,ry:34}
];

if (this.isBossFloor) {
const bTpl=D.BOSS_POOL[(Math.floor(fNum/3) - 1) % D.BOSS_POOL.length];
const bHp=Math.round((420 + fNum*165)*Math.pow(1.10,Math.max(0,fNum - 3)));
this.enemies.push({
isBoss:true,isHuman:true,skinKey:bTpl.skinKey,
name:`${bTpl.icon} [Tầng ${fNum}] ${bTpl.name}`,
x:this.W*0.5,y:115,r:24,
hp:bHp,maxHp:bHp,atk:Math.round(16 + fNum*3.4),spd:92 + Math.min(60,fNum*3),
color:bTpl.color,atkCd:1.2,hitFlash:0,slowTimer:0
});
this._addFloat(this.W*0.5,140,`👑 THỦ LĨNH TẦNG ${fNum}: ${bTpl.name}!`,"#ffd700");
} else {
this._addFloat(this.W*0.5,150,`🌊 TẦNG ${fNum} — NGHỊCH LƯU THƯỢNG DU!`,"#7ef7f0");
}
this._syncHud();
}

_spawnRiverEnemy() {
const sx=60 + Math.random()*(this.W - 120);
const sy=-18;
const isRanged=(Math.random()<0.36);
const hp=Math.round((68 + this.floor*24)*Math.pow(1.08,Math.max(0,this.floor - 1)));
this.enemies.push({
isBoss:false,isHuman:false,isRanged,
name:isRanged?"Thủy Linh Mãng" :"Nghịch Lưu Lang",
x:sx,y:sy,r:isRanged?14 :15,
hp,maxHp:hp,atk:Math.round(11 + this.floor*2.2),
spd:(isRanged?78 :105) + Math.min(65,this.floor*2.8),
color:isRanged?"#4ce6ff" :"#ff6b6b",
atkCd:0.9 + Math.random()*0.8,hitFlash:0,slowTimer:0
});
}

_spawnRiverLog() {
if (this.logs.length>=5) return;
const w=72 + Math.random()*58;
this.logs.push({
x:70 + Math.random()*(this.W - 140),
y:-26,
w,h:18,
vy:95 + Math.min(120,this.floor*8) + (this.surgeActive>0?85 :0),
isIce:Math.random()<0.45
});
}

_addFloat(x,y,text,color="#ffd700") {
if (this.floats.length>=16) this.floats.shift();
this.floats.push({x,y,text,color,life:0.85,maxLife:0.85});
}

_triggerJump() {
if (this.pausedForBoon||this.finished) return;
if (this.pl.jumpCount>=this.pl.maxJumps) return;
const isDouble=(this.pl.jumpCount>=1||this.pl.z>4);
this.pl.vz=isDouble?320 :360;
this.pl.z=Math.max(this.pl.z,2);
this.pl.jumpCount +=1;
this._playSfx("jump");
this.fxRings.push({x:this.pl.x,y:this.pl.y + 8,r:10,maxR:isDouble?44 :34,color:isDouble?"#7ef7c4" :"#a8f0ff",life:0.32,maxLife:0.32});
if (this.boonStats.frostJump>0) {
const rad=115 + this.boonStats.frostJump*22;
const dmg=Math.round((34 + this.floor*8)*this.boonStats.dmgMult*this.boonStats.frostJump);
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:16,maxR:rad,color:"#85c1e9",life:0.38,maxLife:0.38});
for (const en of this.enemies) {
if (Math.hypot(en.x - this.pl.x,en.y - this.pl.y)<=rad + en.r) {
this._damageEnemy(en,dmg,false);en.slowTimer=2.4;
}
}
}
}

_triggerDash() {
if (this.pausedForBoon||this.finished||this.pl.dashCd>0) return;
this.pl.dashCd=Math.max(0.55,1.45*this.boonStats.cdMult);
this.pl.iframe=0.40;
let dx=0;let dy=0;
if (this.keys.KeyW||this.keys.ArrowUp) dy -=1;
if (this.keys.KeyS||this.keys.ArrowDown) dy +=1;
if (this.keys.KeyA||this.keys.ArrowLeft) dx -=1;
if (this.keys.KeyD||this.keys.ArrowRight) dx +=1;
const len=Math.hypot(dx,dy);
const ang=len>0.1?Math.atan2(dy,dx) : -Math.PI*0.5; // Default dash UPSTREAM!
this.pl.x=Math.max(36,Math.min(this.W - 36,this.pl.x + Math.cos(ang)*135));
this.pl.y=Math.max(46,Math.min(this.H - 36,this.pl.y + Math.sin(ang)*135));
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:48,color:"#7ef7c4",life:0.32,maxLife:0.32});
this._playSfx("dash");
if (this.boonStats.dashNova>0) {
const rad=125 + this.boonStats.dashNova*25;
const dmg=Math.round((48 + this.floor*12)*this.boonStats.dmgMult*this.boonStats.dashNova);
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:14,maxR:rad,color:"#ff6b35",life:0.42,maxLife:0.42});
for (const en of this.enemies) {
if (Math.hypot(en.x - this.pl.x,en.y - this.pl.y)<=rad + en.r) {
this._damageEnemy(en,dmg,false);
}
}
}
}

_getAimAngle(tx=null,ty=null) {
if (tx!==null&&ty!==null) return Math.atan2(ty - this.pl.y,tx - this.pl.x);
if (this.enemies.length>0) {
let best=this.enemies[0];let bd=Infinity;
for (const en of this.enemies) {
const d=Math.hypot(en.x - this.pl.x,en.y - this.pl.y);
if (d<bd) {bd=d;best=en;}
}
return Math.atan2(best.y - this.pl.y,best.x - this.pl.x);
}
return Math.atan2(this._ptrY - this.pl.y,this._ptrX - this.pl.x);
}

_castPrimary(tx=null,ty=null) {
if (this.pausedForBoon||this.finished||this.pl.cd1>0) return;
this.pl.cd1=Math.max(0.14,0.26*this.boonStats.cdMult);
const baseAng=this._getAimAngle(tx,ty);
const count=1 + this.boonStats.extraShots;
const spread=Math.min(0.95,(count - 1)*0.15);
const dmg=Math.round((32 + this.floor*8)*this.boonStats.dmgMult);
for (let i=0;i<count;i++) {
const off=count===1?0 : -spread*0.5 + (spread / (count - 1))*i;
const a=baseAng + off;
this.pBullets.push({
x:this.pl.x + Math.cos(a)*14,y:this.pl.y - this.pl.z + Math.sin(a)*14,
vx:Math.cos(a)*560,vy:Math.sin(a)*560,
r:8 + Math.min(4,this.boonStats.pierce),
dmg,pierce:this.boonStats.pierce,hitSet:new Set(),
color:this.primaryColor,life:1.3,canChain:true
});
}
this._playSfx("shot");
}

_castKillerBurst() {
if (this.pausedForBoon||this.finished||this.pl.cd2>0) return;
this.pl.cd2=Math.max(1.2,3.4*this.boonStats.cdMult);
const ang=this._getAimAngle();
const dmg=Math.round((68 + this.floor*18)*this.boonStats.dmgMult*this.boonStats.skillMult);
for (let i=-3;i<=3;i++) {
const a=ang + i*0.18;
this.pBullets.push({
x:this.pl.x + Math.cos(a)*18,y:this.pl.y - this.pl.z + Math.sin(a)*18,
vx:Math.cos(a)*520,vy:Math.sin(a)*520,
r:12,dmg,pierce:this.boonStats.pierce + 2,hitSet:new Set(),
color:this.killerColor,life:1.4,canChain:true
});
}
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:16,maxR:135,color:this.killerColor,life:0.4,maxLife:0.4});
this._playSfx("boom");
}

_castUltimate() {
if (this.pausedForBoon||this.finished||this.pl.cd3>0) return;
this.pl.cd3=Math.max(3.5,8.5*this.boonStats.cdMult);
const rad=250;
const dmg=Math.round((135 + this.floor*32)*this.boonStats.dmgMult*this.boonStats.skillMult);
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:24,maxR:rad,color:"#4ce6ff",life:0.55,maxLife:0.55});
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:12,maxR:rad*0.72,color:"#ffd700",life:0.45,maxLife:0.45});
// Clear nearby enemy bullets!
this.eBullets=this.eBullets.filter(b=>Math.hypot(b.x - this.pl.x,b.y - this.pl.y)>rad);
for (const en of this.enemies) {
if (Math.hypot(en.x - this.pl.x,en.y - this.pl.y)<=rad + en.r) {
this._damageEnemy(en,dmg,true);
en.slowTimer=2.2;
}
}
if (this.boonStats.timeStopOnUlt) {
this.timeStopTimer=2.2;
this._addFloat(this.pl.x,this.pl.y - 44,"⏳ QUANG ÂM NGƯNG ĐỌNG (2.2s)!","#ffe066");
}
this._playSfx("boon");
}

_damageEnemy(en,rawDmg,allowChain=false) {
if (!en||en.hp<=0) return;
const isCrit=(Math.random()<this.boonStats.critChance);
const dmg=Math.max(1,Math.round(rawDmg*(isCrit?this.boonStats.critMult :1.0)));
en.hp -=dmg;
en.hitFlash=0.11;
if (isCrit) this._addFloat(en.x,en.y - 20,`⚡-${dmg}`,"#ffd700");
if (this.boonStats.lifesteal>0) {
this.pl.hp=Math.min(this.pl.maxHp,this.pl.hp + Math.max(1,Math.round(dmg*this.boonStats.lifesteal)));
}
if (allowChain&&this.boonStats.chainLightning>0&&Math.random()<0.42) {
const cDmg=Math.round(dmg*(0.45 + this.boonStats.chainLightning*0.12));
let prevX=en.x;let prevY=en.y;let jumps=0;
for (const o of this.enemies) {
if (o===en||o.hp<=0) continue;
if (Math.hypot(o.x - prevX,o.y - prevY)<=210) {
o.hp -=cDmg;o.hitFlash=0.1;
this.arcs.push({x1:prevX,y1:prevY,x2:o.x,y2:o.y,life:0.18,maxLife:0.18});
prevX=o.x;prevY=o.y;jumps +=1;
if (jumps>=3) break;
}
}
}
}

_takePlayerHit(rawDmg,attacker=null) {
if (this.pl.iframe>0||this.finished) return;
const reduced=Math.max(1,Math.round(rawDmg*(1 - this.boonStats.dmgReduce)));
this.pl.iframe=0.45;
if (this.boonStats.reflectPct>0&&attacker&&attacker.hp>0) {
this._damageEnemy(attacker,Math.round(rawDmg*this.boonStats.reflectPct*2.2),false);
}
let rem=reduced;
if (this.pl.shield>0) {
const abs=Math.min(this.pl.shield,rem);
this.pl.shield -=abs;rem -=abs;
}
this.pl.hp=Math.max(0,this.pl.hp - rem);
this._playSfx("hit");
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:40,color:"#ff3b30",life:0.28,maxLife:0.28});

if (this.pl.hp<=0) {
if (this.boonStats.revives>0) {
this.boonStats.revives -=1;
this.pl.hp=Math.round(this.pl.maxHp*0.60);
this.pl.iframe=1.6;
this.eBullets=[];
this.timeStopTimer=1.5;
this._playSfx("revive");
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:18,maxR:320,color:"#ffd700",life:0.65,maxLife:0.65});
this._addFloat(this.pl.x,this.pl.y - 46,"🦗 XUÂN THU THIỀN ĐẢO NGƯỢC THỜI GIAN!","#ffd700");
return;
}
this._finishRun(false);
}
}

_openBoonSelection() {
this.pausedForBoon=true;
this.floorsCleared=this.floor;
const g=this.sys&&this.sys.game;
const rank=(g&&g.aperture)?g.aperture.rank :1;
const floorStones=Math.round((32 + this.floor*22)*(1 + rank*0.18)*(this.isBossFloor?1.75 :1.0));
const floorDao=Math.round((8 + this.floor*5)*(this.isBossFloor?1.6 :1.0));
const floorMerit=Math.round((14 + this.floor*8)*(this.isBossFloor?1.6 :1.0));
this.bankedStones +=floorStones;
this.bankedDaoExp +=floorDao;
this.bankedMerit +=floorMerit;

this._playSfx("boon");
this._currentOffer=D.rollThreeBoons(this.boonCounts);
this._renderBoonOverlay();
this._screen.querySelector("#rf-boon-overlay").classList.remove("hidden");
}

_rerollBoons() {
if (this.rerollsLeft<=0|| !this.pausedForBoon) return;
this.rerollsLeft -=1;
this._currentOffer=D.rollThreeBoons(this.boonCounts);
this._renderBoonOverlay();
this._playSfx("shot");
}

_renderBoonOverlay() {
const ov=this._screen.querySelector("#rf-boon-overlay");
ov.querySelector("#rf-boon-title").textContent=`✨ VƯỢT TẦNG ${this.floor} THÀNH CÔNG — CHỌN 1 CƯỜNG HÓA TIẾN LÊN TẦNG ${this.floor + 1}!`;
ov.querySelector("#rf-boon-bank-sub").textContent=`Đã tích lũy: 💎${this.bankedStones.toLocaleString("vi-VN")} • 🏅${this.bankedMerit} • +${this.bankedDaoExp} Lĩnh Ngộ`;
const rrBtn=ov.querySelector("#rf-btn-reroll");
rrBtn.disabled=this.rerollsLeft<=0;
rrBtn.textContent=`🎲 Đổi 3 Thẻ Khác (${this.rerollsLeft})`;

const cardsHost=ov.querySelector("#rf-boon-cards");
cardsHost.innerHTML=(this._currentOffer||[]).map((b,idx)=>{
const rLbl=b.rarity==="supreme"?"👑 CHÍ TÔN" :(b.rarity==="rare"?"✨ HIẾM" :"📜 THƯỜNG");
return `
<button class="rf-boon-card rf-rarity-${b.rarity}" data-bidx="${idx}" style="border-color:${b.color};">
<div class="rf-boon-tag" style="color:${b.color};">${rLbl}</div>
<div class="rf-boon-icon">${b.icon}</div>
<strong class="rf-boon-name" style="color:${b.color};">${b.name}</strong>
<p class="rf-boon-desc">${b.desc}</p>
</button>`;
}).join("");

cardsHost.querySelectorAll(".rf-boon-card").forEach(btn=>{
btn.addEventListener("click",()=>{
const b=this._currentOffer[parseInt(btn.getAttribute("data-bidx"),10)];
if (!b) return;
b.apply(this.boonStats);
this.boonCounts[b.id]=(this.boonCounts[b.id]||0) + 1;
this.activeBoons.push(b);
ov.classList.add("hidden");
this._playSfx("boon");
this._startFloor(this.floor + 1);
});
});
}

_finishRun(voluntaryRetreat=false) {
if (this.finished) return;
this.finished=true;
this.pausedForBoon=false;
this._screen.querySelector("#rf-boon-overlay").classList.add("hidden");
const res=this.sys.recordAndPayRun({
floorsCleared:this.floorsCleared,
reachedFloor:this.floor,
kills:this.totalKills,
bankedStones:this.bankedStones,
bankedDaoExp:this.bankedDaoExp,
bankedMerit:this.bankedMerit,
voluntaryRetreat
});
const ov=this._screen.querySelector("#rf-result-overlay");
ov.querySelector("#rf-res-title").textContent=res.isNewRecord
?`👑 KỶ LỤC MỚI: VƯỢT TẦNG ${this.floorsCleared} NGHỊCH LƯU HÀ!`
:(voluntaryRetreat?`🌊 RÚT LUI AN TOÀN TẠI TẦNG ${this.floor}` :`💥 KẾT THÚC HÀNH TRÌNH TẠI TẦNG ${this.floor}`);
ov.querySelector("#rf-res-summary").textContent=`Vượt thành công ${this.floorsCleared} tầng • Tiêu diệt ${this.totalKills} địch • Đã tích hợp ${this.activeBoons.length} cường hóa Roguelike.`;
ov.querySelector("#rf-res-reward").textContent=res.rewardLine;
ov.classList.remove("hidden");
}

_loop(ts) {
if (!this.active) {this._rafId=null;return;}
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs) / 1000));
this._lastTs=ts;
if (!this.pausedForBoon&& !this.finished) this._update(dt);
this._render(ts*0.001);
this._hudTick +=dt;
if (this._hudTick>=0.12) {this._hudTick=0;this._syncHud();}
if (this.active) this._rafId=requestAnimationFrame((nts)=>this._loop(nts));
}

_update(dt) {
const pl=this.pl;
const b=this.boonStats;
if (pl.cd1>0) pl.cd1=Math.max(0,pl.cd1 - dt);
if (pl.cd2>0) pl.cd2=Math.max(0,pl.cd2 - dt);
if (pl.cd3>0) pl.cd3=Math.max(0,pl.cd3 - dt);
if (pl.dashCd>0) pl.dashCd=Math.max(0,pl.dashCd - dt);
if (pl.iframe>0) pl.iframe=Math.max(0,pl.iframe - dt);
if (this.timeStopTimer>0) this.timeStopTimer=Math.max(0,this.timeStopTimer - dt);
if (b.regenPctPerSec>0&&pl.hp<pl.maxHp) pl.hp=Math.min(pl.maxHp,pl.hp + pl.maxHp*b.regenPctPerSec*dt);

// Jump Physics
if (pl.z>0||pl.vz!==0) {
pl.z +=pl.vz*dt;pl.vz -=980*dt;
if (pl.z<=0) {pl.z=0;pl.vz=0;pl.jumpCount=0;}
}

// River Surge Timer (periodic rushing wave!)
const frozen=(this.timeStopTimer>0);
if (!frozen) {
if (this.surgeActive>0) {
this.surgeActive -=dt;
} else {
this.surgeTimer -=dt;
if (this.surgeTimer<=0) {
this.surgeTimer=Math.max(6,11 - this.floor*0.25);
this.surgeActive=3.2;
this._spawnRiverLog();this._spawnRiverLog();
this._addFloat(this.W*0.5,85,"🌊 HỒNG THỦY CUỒNG LƯU! NHẢY [SPACE] VƯỢT SÓNG!","#4ce6ff");
}
}
}

// Check if standing on a safe Jade Island
let onIsland=false;
for (const isl of this.islands) {
const dx=(pl.x - isl.x)/isl.rx;const dy=(pl.y - isl.y)/isl.ry;
if (dx*dx + dy*dy<=1.0) {onIsland=true;break;}
}

// Player Movement + Reverse Flow River Downward Push!
let mx=0;let my=0;
if (this.keys.KeyW||this.keys.ArrowUp) my -=1;
if (this.keys.KeyS||this.keys.ArrowDown) my +=1;
if (this.keys.KeyA||this.keys.ArrowLeft) mx -=1;
if (this.keys.KeyD||this.keys.ArrowRight) mx +=1;
const effSpd=pl.spd*b.spdMult*(pl.z>6?1.10 :1.0);
if (mx!==0||my!==0) {
const l=Math.hypot(mx,my);mx /=l;my /=l;
pl.x +=mx*effSpd*dt;pl.y +=my*effSpd*dt;
pl.facing=Math.abs(mx)>Math.abs(my)?(mx>0?"right" :"left") :(my>0?"down" :"up");
} else if (this._ptrDown) {
const dx=this._ptrX - pl.x;const dy=this._ptrY - pl.y;const d=Math.hypot(dx,dy);
if (d>18) {pl.x +=(dx/d)*effSpd*0.92*dt;pl.y +=(dy/d)*effSpd*0.92*dt;}
}
// Apply River Current ONLY when grounded, not on an island, and not time-stopped!
if (!frozen&&pl.z<=6&& !onIsland&&b.currentResist<1.0) {
const basePush=(44 + Math.min(85,this.floor*5.5) + (this.surgeActive>0?75 :0))*(1 - b.currentResist);
pl.y +=basePush*dt;
}
pl.x=Math.max(32,Math.min(this.W - 32,pl.x));
pl.y=Math.max(44,Math.min(this.H - 34,pl.y));
if (this._ptrDown&&pl.cd1<=0) this._castPrimary(this._ptrX,this._ptrY);

// Auto-Flying Swords Boon (Phi Kiếm Tiên Cổ!)
if (b.autoSwords>0&&this.enemies.length>0) {
pl.autoSwordCd -=dt;
if (pl.autoSwordCd<=0) {
pl.autoSwordCd=0.85;
for (let s=0;s<b.autoSwords;s++) {
const tgt=this.enemies[s % this.enemies.length];
const a=Math.atan2(tgt.y - pl.y,tgt.x - pl.x);
this.pBullets.push({
x:pl.x,y:pl.y - 12,vx:Math.cos(a)*640,vy:Math.sin(a)*640,
r:9,dmg:Math.round((28 + this.floor*9)*b.dmgMult),
pierce:2,hitSet:new Set(),color:"#c2f0ff",life:1.1,canChain:false
});
}
}
}

// Orbiting Blades Boon
if (b.orbitBlades>0) {
pl.orbitAngle +=dt*4.8;
const oDmg=Math.round((20 + this.floor*6)*b.dmgMult);
for (let k=0;k<b.orbitBlades;k++) {
const a=pl.orbitAngle + (Math.PI*2*k)/b.orbitBlades;
const ox=pl.x + Math.cos(a)*62;const oy=pl.y - pl.z + Math.sin(a)*62;
for (const en of this.enemies) {
if (Math.hypot(en.x - ox,en.y - oy)<=en.r + 14&&(!en._orbHitCd||en._orbHitCd<=0)) {
en._orbHitCd=0.35;
this._damageEnemy(en,oDmg,false);
}
}
}
}

// Spawn Wave Enemies & River Logs
if (this.spawnLeft>0) {
this.spawnTimer -=dt;
if (this.spawnTimer<=0) {
this.spawnTimer=Math.max(0.45,1.15 - this.floor*0.04);
this.spawnLeft -=1;
this._spawnRiverEnemy();
if (Math.random()<0.38) this._spawnRiverLog();
}
}

// Update Floating River Logs / Icebergs (JUMP OVER THEM!)
const eStep=frozen?0.05 :1.0;
for (let i=this.logs.length - 1;i>=0;i--) {
const lg=this.logs[i];
lg.y +=lg.vy*dt*eStep;
if (lg.y>this.H + 35) {this.logs.splice(i,1);continue;}
if (pl.z<14&&Math.abs(pl.x - lg.x)<lg.w*0.5 + pl.r*0.6&&Math.abs(pl.y - lg.y)<lg.h*0.5 + pl.r*0.6) {
this._takePlayerHit(Math.round(12 + this.floor*2.0));
pl.y=Math.min(this.H - 34,pl.y + 34);
}
}

// Update Player Bullets
for (let i=this.pBullets.length - 1;i>=0;i--) {
const pb=this.pBullets[i];
pb.x +=pb.vx*dt;pb.y +=pb.vy*dt;pb.life -=dt;
if (pb.life<=0||pb.x< -25||pb.y< -25||pb.x>this.W + 25||pb.y>this.H + 25) {this.pBullets.splice(i,1);continue;}
for (let j=this.enemies.length - 1;j>=0;j--) {
const en=this.enemies[j];
if (pb.hitSet.has(en)) continue;
if (Math.hypot(pb.x - en.x,pb.y - en.y)<=pb.r + en.r) {
pb.hitSet.add(en);
this._damageEnemy(en,pb.dmg,pb.canChain);
pb.pierce -=1;
if (pb.pierce<=0) {this.pBullets.splice(i,1);break;}
}
}
}

// Update Enemies
for (let i=this.enemies.length - 1;i>=0;i--) {
const en=this.enemies[i];
if (en.hitFlash>0) en.hitFlash -=dt;
if (en.slowTimer>0) en.slowTimer -=dt;
if (en._orbHitCd>0) en._orbHitCd -=dt;
if (en.hp<=0) {
this.totalKills +=1;
this.fxRings.push({x:en.x,y:en.y,r:8,maxR:en.isBoss?68 :34,color:en.color,life:0.35,maxLife:0.35});
this.enemies.splice(i,1);
continue;
}
if (frozen) continue;
const dx=pl.x - en.x;const dy=pl.y - en.y;const d=Math.hypot(dx,dy)||1;
const sNow=en.spd*(en.slowTimer>0?0.48 :1.0);
if (en.isBoss) {
en.x=Math.max(60,Math.min(this.W - 60,en.x + (dx/d)*sNow*0.65*dt));
en.y=Math.max(60,Math.min(240,en.y + (dy/d)*sNow*0.4*dt));
en.atkCd -=dt;
if (en.atkCd<=0) {
en.atkCd=Math.max(0.85,1.55 - this.floor*0.03);
const aim=Math.atan2(dy,dx);
const fan=this.floor>=6?5 :3;
for (let k=0;k<fan;k++) {
const a=aim + (k - (fan - 1)*0.5)*0.22;
this.eBullets.push({x:en.x,y:en.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,r:9,dmg:en.atk,color:en.color,owner:en});
}
}
} else if (en.isRanged) {
if (d>210) {en.x +=(dx/d)*sNow*dt;en.y +=(dy/d)*sNow*dt;}
en.atkCd -=dt;
if (en.atkCd<=0) {
en.atkCd=1.7;
const a=Math.atan2(dy,dx);
this.eBullets.push({x:en.x,y:en.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,r:7.5,dmg:en.atk,color:en.color,owner:en});
}
} else {
en.x +=(dx/d)*sNow*dt;en.y +=(dy/d)*sNow*dt;
if (d<=en.r + pl.r + 4&&pl.z<16) {
this._takePlayerHit(en.atk,en);
}
}
}

// Update Enemy Bullets
for (let i=this.eBullets.length - 1;i>=0;i--) {
const eb=this.eBullets[i];
eb.x +=eb.vx*dt*eStep;eb.y +=eb.vy*dt*eStep;
if (eb.x< -25||eb.y< -25||eb.x>this.W + 25||eb.y>this.H + 25) {this.eBullets.splice(i,1);continue;}
if (pl.z<22&&Math.hypot(eb.x - pl.x,eb.y - pl.y)<=pl.r + eb.r*0.75) {
this.eBullets.splice(i,1);
this._takePlayerHit(eb.dmg,eb.owner);
}
}

for (let i=this.fxRings.length - 1;i>=0;i--) {this.fxRings[i].life -=dt;if (this.fxRings[i].life<=0) this.fxRings.splice(i,1);}
for (let i=this.arcs.length - 1;i>=0;i--) {this.arcs[i].life -=dt;if (this.arcs[i].life<=0) this.arcs.splice(i,1);}
for (let i=this.floats.length - 1;i>=0;i--) {this.floats[i].y -=38*dt;this.floats[i].life -=dt;if (this.floats[i].life<=0) this.floats.splice(i,1);}

// Floor Cleared Check!
if (this.spawnLeft<=0&&this.enemies.length===0&& !this.finished) {
this._openBoonSelection();
}
}

_syncHud() {
if (!this._screen) return;
const pl=this.pl;
const shStr=pl.shield>0?` (+${Math.round(pl.shield)}🛡️)` :"";
this._screen.querySelector("#rf-hud-hp").textContent=`❤️ ${Math.ceil(pl.hp)}/${pl.maxHp}${shStr}`;
this._screen.querySelector("#rf-hud-floor").textContent=`🌊 Tầng ${this.floor}${this.isBossFloor?" (BOSS)" :""} | Địch: ${this.enemies.length + this.spawnLeft}`;
this._screen.querySelector("#rf-hud-bank").textContent=`💎 ${this.bankedStones.toLocaleString("vi-VN")} | ✨ ${this.activeBoons.length} Cường Hóa`;
const b2=this._screen.querySelector("#rf-act-2");
const b3=this._screen.querySelector("#rf-act-3");
const bd=this._screen.querySelector("#rf-act-dash");
if (b2) {b2.disabled=pl.cd2>0;b2.textContent=pl.cd2>0?`⚡ (${pl.cd2.toFixed(1)}s)` :`⚡ ${this.killerName.slice(0,13)} [2/Q]`;}
if (b3) {b3.disabled=pl.cd3>0;b3.textContent=pl.cd3>0?`🌊 (${pl.cd3.toFixed(1)}s)` :"🌊 Nghịch Lưu Bạo [3/E]";}
if (bd) {bd.disabled=pl.dashCd>0;bd.textContent=pl.dashCd>0?`💨 (${pl.dashCd.toFixed(1)}s)` :"💨 Lướt Ngược [G]";}
}

_render(t) {
const ctx=this._ctx;
const W=this.W;const H=this.H;
const frozen=(this.timeStopTimer>0);

// 1. Upgraded High-Craft Reverse Flow River (Multi-Layer Currents, Whirlpools & Rocky Gorge Banks!)
const bg=ctx.createLinearGradient(0,0,0,H);
bg.addColorStop(0,frozen?"#1f4868" :"#125678");
bg.addColorStop(0.5,frozen?"#15334d" :"#0c3b57");
bg.addColorStop(1,"#061d2e");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Gorge rocky cliff embankments along left & right river edges
const leftBank=ctx.createLinearGradient(0,0,54,0);
leftBank.addColorStop(0,"#1a242b");leftBank.addColorStop(0.65,"#112b38");leftBank.addColorStop(1,"rgba(12,59,87,0)");
ctx.fillStyle=leftBank;ctx.fillRect(0,0,54,H);
const rightBank=ctx.createLinearGradient(W,0,W - 54,0);
rightBank.addColorStop(0,"#1a242b");rightBank.addColorStop(0.65,"#112b38");rightBank.addColorStop(1,"rgba(12,59,87,0)");
ctx.fillStyle=rightBank;ctx.fillRect(W - 54,0,54,H);

// Dual-speed scrolling GPU water caustic layers
const pat=this._getRiverPattern(ctx);
const flowSpd=frozen?0 :(this.surgeActive>0?210 :(88 + this.floor*4.5));
const offY=(t*flowSpd) % 128;
ctx.save();
ctx.translate(0,offY - 128);
ctx.fillStyle=pat;
ctx.fillRect(0,0,W,H + 256);
ctx.restore();
ctx.save();
ctx.globalAlpha=0.45;
ctx.translate(28,((t*flowSpd*1.45) % 128) - 128);
ctx.fillStyle=pat;
ctx.fillRect(-28,0,W + 28,H + 256);
ctx.restore();

// Animated rushing white-silver foam streaks & river whirlpools!
ctx.strokeStyle=this.surgeActive>0?"rgba(220,252,255,0.42)" :"rgba(165,242,255,0.22)";
ctx.lineWidth=2.0;ctx.lineCap="round";
for (let s=0;s<9;s++) {
const sx=80 + ((s*97) % (W - 160));
const sy=((t*(flowSpd*1.3) + s*79) % (H + 90)) - 45;
const slen=28 + (s % 3)*18;
ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx + Math.sin(t*3 + s)*4,sy + slen);ctx.stroke();
}
for (let w=0;w<2;w++) {
const wx=w===0?165 :(W - 165);
const wy=((t*35 + w*280) % (H + 100)) - 50;
ctx.save();ctx.translate(wx,wy);ctx.rotate(t*(w===0?1.8 :-1.8));
ctx.strokeStyle="rgba(185,248,255,0.28)";ctx.lineWidth=2;
for (let k=0;k<3;k++) {const a=(k*Math.PI*2)/3;ctx.beginPath();ctx.arc(0,0,22,a,a + 1.2);ctx.stroke();}
ctx.restore();
}

// 2. Upgraded 2.5D Layered Jade Stone River Islands with Foaming Upstream Wakes
for (const isl of this.islands) {
// Upstream white foam wake wrapping around rock island
ctx.strokeStyle="rgba(220,252,255,0.58)";ctx.lineWidth=3.2;
ctx.beginPath();ctx.ellipse(isl.x,isl.y - 3,isl.rx + 7 + Math.sin(t*5)*2,isl.ry + 5,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();
// Submerged rocky shelf
ctx.fillStyle="rgba(8,28,38,0.55)";ctx.beginPath();ctx.ellipse(isl.x,isl.y + 8,isl.rx + 6,isl.ry + 4,0,0,Math.PI*2);ctx.fill();
// Sculpted stone pedestal
const ig=ctx.createRadialGradient(isl.x - 10,isl.y - 8,6,isl.x,isl.y,isl.rx);
ig.addColorStop(0,"#367a63");ig.addColorStop(0.65,"#1b4538");ig.addColorStop(1,"#0e241d");
ctx.fillStyle=ig;ctx.strokeStyle="#7ef7c4";ctx.lineWidth=2.2;
ctx.beginPath();ctx.ellipse(isl.x,isl.y,isl.rx,isl.ry,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle="#d8fff0";
ctx.fillText("🪨 Bệ Đá Chống Dòng",isl.x,isl.y + 4);
}

// 3. Upgraded 2.5D Floating River Logs & Crystalline Icebergs with Water Wakes!
for (const lg of this.logs) {
const lx=lg.x - lg.w*0.5;const ly=lg.y - lg.h*0.5;
// White water splash wake behind floating obstacle
ctx.strokeStyle="rgba(220,252,255,0.52)";ctx.lineWidth=2.2;
ctx.beginPath();ctx.moveTo(lx + 4,ly - 4);ctx.lineTo(lx + lg.w - 4,ly - 4);ctx.stroke();
ctx.fillStyle="rgba(0,0,0,0.36)";ctx.fillRect(lx + 3,ly + 6,lg.w,lg.h);
if (lg.isIce) {
const ig=ctx.createLinearGradient(lx,ly,lx,ly + lg.h);
ig.addColorStop(0,"#ffffff");ig.addColorStop(0.5,"#8ee4ff");ig.addColorStop(1,"#2f80a8");
ctx.fillStyle=ig;ctx.strokeStyle="#d6f7ff";ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(lx + 8,ly);ctx.lineTo(lx + lg.w - 8,ly);ctx.lineTo(lx + lg.w,ly + lg.h*0.6);ctx.lineTo(lx + lg.w - 10,ly + lg.h);ctx.lineTo(lx + 10,ly + lg.h);ctx.lineTo(lx,ly + lg.h*0.6);ctx.closePath();ctx.fill();ctx.stroke();
} else {
const wg=ctx.createLinearGradient(lx,ly,lx,ly + lg.h);
wg.addColorStop(0,"#7a5434");wg.addColorStop(0.55,"#4f331c");wg.addColorStop(1,"#26160a");
ctx.fillStyle=wg;ctx.strokeStyle="#1f1208";ctx.lineWidth=1.6;
ctx.fillRect(lx,ly,lg.w,lg.h);ctx.strokeRect(lx,ly,lg.w,lg.h);
ctx.fillStyle="#2d7a4a";ctx.beginPath();ctx.ellipse(lg.x - 10,ly + 4,10,3.5,0,0,Math.PI*2);ctx.fill();
}
}

// 4. Enemies
const skins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
for (const en of this.enemies) {
ctx.save();ctx.translate(en.x,en.y);
if (en.isHuman&&global.CharacterArtRenderer) {
ctx.scale(1.3,1.3);
global.CharacterArtRenderer.drawCharacter(ctx,skins[en.skinKey]||skins.phuong_nguyen,{bobY:Math.sin(t*4)*1.5,facing:"down",isMoving:true});
} else {
ctx.fillStyle=en.hitFlash>0?"#ffffff" :en.color;
ctx.beginPath();ctx.arc(0,0,en.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=en.slowTimer>0?"#bff0ff" :"#ffffff";ctx.lineWidth=1.6;ctx.stroke();
}
const ep=Math.max(0,en.hp / Math.max(1,en.maxHp));
const bw=en.isBoss?68 :30;const by=en.isBoss? -46 : -en.r - 10;
ctx.fillStyle="#070a10";ctx.fillRect(-bw*0.5,by,bw,5);
ctx.fillStyle=en.isBoss?"#ffd700" :"#ff4d4d";ctx.fillRect(-bw*0.5,by,bw*ep,5);
if (en.isBoss) {
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText(en.name,0,by - 5);
}
ctx.restore();
}

// 5. Bullets & Chain Lightning Arcs
for (const pb of this.pBullets) {
ctx.fillStyle=pb.color;ctx.beginPath();ctx.arc(pb.x,pb.y,pb.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.2;ctx.stroke();
}
for (const eb of this.eBullets) {
ctx.fillStyle=frozen?"#7ef7f0" :eb.color;ctx.beginPath();ctx.arc(eb.x,eb.y,eb.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.1;ctx.stroke();
}
for (const a of this.arcs) {
ctx.save();ctx.globalAlpha=a.life/a.maxLife;ctx.strokeStyle="#d29eff";ctx.lineWidth=2.6;
ctx.beginPath();ctx.moveTo(a.x1,a.y1);ctx.lineTo((a.x1+a.x2)*0.5 + (Math.random()-0.5)*16,(a.y1+a.y2)*0.5 + (Math.random()-0.5)*16);ctx.lineTo(a.x2,a.y2);ctx.stroke();ctx.restore();
}

// 6. Player Avatar with Jump Height & Orbiting Blades
const pl=this.pl;
const pz=Math.max(0,pl.z||0);
ctx.save();ctx.translate(pl.x,pl.y);
// Ground / water shadow
const shS=Math.max(0.45,1 - pz/120);
ctx.fillStyle=`rgba(0,0,0,${(0.42*shS).toFixed(2)})`;
ctx.beginPath();ctx.ellipse(0,14,13*shS,5*shS,0,0,Math.PI*2);ctx.fill();
if (pz<=2) {
ctx.strokeStyle="rgba(205,248,255,0.68)";ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(0,12,14 + Math.sin(t*5)*2,5.5,0,0,Math.PI*2);ctx.stroke();
}
ctx.translate(0,-pz);
if (pl.iframe>0) ctx.globalAlpha=0.55 + Math.sin(t*28)*0.3;
const plObj=this.sys&&this.sys.game&&this.sys.game.player;
const mcSkin=(plObj&&typeof plObj.getSkinConfig==="function")?plObj.getSkinConfig() :skins.phuong_nguyen;
if (global.CharacterArtRenderer) {
ctx.scale(1.15,1.15);
global.CharacterArtRenderer.drawCharacter(ctx,mcSkin,{bobY:Math.sin(t*5)*1.5,facing:pl.facing,isMoving:true});
}
ctx.restore();

// Orbiting Blades visual
if (this.boonStats.orbitBlades>0) {
ctx.fillStyle="#c2f0ff";ctx.strokeStyle="#ffffff";ctx.lineWidth=1.2;
for (let k=0;k<this.boonStats.orbitBlades;k++) {
const a=pl.orbitAngle + (Math.PI*2*k)/this.boonStats.orbitBlades;
const ox=pl.x + Math.cos(a)*62;const oy=pl.y - pz + Math.sin(a)*62;
ctx.beginPath();ctx.arc(ox,oy,6.5,0,Math.PI*2);ctx.fill();ctx.stroke();
}
}

// 7. FX Rings & Floating Texts
for (const fx of this.fxRings) {
const r=Math.max(0,fx.life / fx.maxLife);
const rad=fx.r + (fx.maxR - fx.r)*(1 - r);
ctx.save();ctx.globalAlpha=r;ctx.strokeStyle=fx.color;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(fx.x,fx.y,rad,0,Math.PI*2);ctx.stroke();ctx.restore();
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";
for (const ft of this.floats) {
ctx.save();ctx.globalAlpha=Math.max(0,ft.life / ft.maxLife);
ctx.fillStyle=ft.color;ctx.fillText(ft.text,ft.x,ft.y);ctx.restore();
}
}

close() {
this.active=false;
if (this._rafId) {cancelAnimationFrame(this._rafId);this._rafId=null;}
this.keys={};
if (this._screen) this._screen.classList.add("hidden");
if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") {
global.vanCoSettings.syncBgmForScreen("hub");
}
const g=this.sys&&this.sys.game;
if (g&&g.ui) {
g.ui.updateHubTopbar();
if (g.ui.activeHubTab==="tab-reverse-flow") g.ui.renderReverseFlowTab();
}
}
}

global.ReverseFlowArena=ReverseFlowArena;
})(window);
