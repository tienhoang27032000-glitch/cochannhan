(function (global) {
"use strict";

const D=global.VanCoBlessedLandData;

class BlessedLandDefenseArena {
constructor(sys) {
this.sys=sys;
this._screen=null;
this._canvas=null;
this._ctx=null;
this._rafId=null;
this._lastTs=0;
this._audioCtx=null;
this.active=false;
this.finished=false;
this.raidType="thief_raid";
this.W=860;
this.H=540;
this.keys={};
this._ptrDown=false;
this._ptrX=430;
this._ptrY=270;
this._hudTick=0;
this._bound=false;
this._resetArenaState();
}

_resetArenaState() {
const fLv=this.sys?(this.sys.formationLevel||1) :1;
const coreHp=420 + (fLv - 1)*150;
this.core={x:this.W*0.5,y:this.H*0.5,hp:coreHp,maxHp:coreHp,r:34,turretCd:0.5,hitFlash:0};
this.pl={x:this.W*0.5,y:this.H*0.68,r:14,spd:265,facing:"up",cd1:0,cd2:0,cd3:0,dashCd:0,iframe:0};
this.wave=1;
this.totalWaves=3;
this.waveSpawnLeft=0;
this.spawnTimer=0.6;
this.waveDelay=0;
this.invaders=[];
this.allies=[];
this.pBullets=[];
this.fxRings=[];
this.lightningWarnings=[];
this.kills=0;
this.formationLv=fLv;
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
if (kind==="shot") tone(520,760,0.09,"triangle",0.08);
else if (kind==="boom") {tone(220,75,0.22,"sawtooth",0.13);tone(480,220,0.18,"triangle",0.09,0.02);}
else if (kind==="array") {tone(440,880,0.25,"sine",0.12);tone(660,1320,0.28,"triangle",0.10,0.06);}
else if (kind==="win") {tone(523,523,0.16,"triangle",0.12,0);tone(659,659,0.16,"triangle",0.12,0.08);tone(784,1046,0.34,"triangle",0.14,0.16);}
else if (kind==="fail") tone(280,110,0.34,"sawtooth",0.12);
} catch (e) {}
}

_ensureDOM() {
if (this._screen) return this._screen;
let scr=document.getElementById("bl-defense-screen");
if (!scr) {
scr=document.createElement("div");
scr.id="bl-defense-screen";
scr.className="dream-realm-screen hidden";
scr.innerHTML=`
<div class="dream-topbar" style="border-color:#ff6b35;">
<div class="dream-top-title">
<strong id="bld-title" style="color:#ffd700;font-size:15px;">🏡 Phòng Thủ Phúc Địa</strong>
<span id="bld-sub" class="sub-text" style="color:#7ef7f0;"></span>
</div>
<div class="dream-top-stats">
<span id="bld-hud-left" class="badge" style="border-color:#7ef7c4;color:#7ef7c4;"></span>
<span id="bld-hud-right" class="badge" style="border-color:#ffd700;color:#ffd700;"></span>
<button id="bld-btn-exit" class="btn-danger" style="padding:5px 10px;font-size:11.5px;">🏃 Rút Lui</button>
</div>
</div>
<div class="dream-stage-wrap">
<canvas id="blDefenseCanvas" width="860" height="540"></canvas>
<div id="bld-result-overlay" class="dream-overlay-card hidden">
<h2 id="bld-res-title" style="margin:0 0 8px 0;"></h2>
<p id="bld-res-summary" style="color:#e6dfd5;margin-bottom:8px;"></p>
<p id="bld-res-reward" style="color:#7ef7c4;font-weight:bold;margin-bottom:14px;"></p>
<button id="bld-btn-return" class="btn-primary" style="padding:8px 22px;">↩️ Quay Về Phúc Địa</button>
</div>
</div>
<div id="bld-action-bar" class="dream-action-bar">
<button id="bld-act-1" class="btn-primary dream-act-btn">⚡ Cổ Thuật [1/Click]</button>
<button id="bld-act-2" class="btn-accent dream-act-btn">💥 Sát Chiêu Hộ Địa [2/Q]</button>
<button id="bld-act-3" class="btn-primary dream-act-btn">🛡️ Kích Trận Hộ Địa [3/E]</button>
<button id="bld-act-dash" class="btn-secondary dream-act-btn">💨 Thuấn Di [SPACE]</button>
</div>
`;
document.body.appendChild(scr);
}
this._screen=scr;
this._canvas=scr.querySelector("#blDefenseCanvas");
this._ctx=this._canvas.getContext("2d",{alpha:false})||this._canvas.getContext("2d");

if (!this._bound) {
this._bound=true;
scr.querySelector("#bld-btn-exit").addEventListener("click",()=>{
if (!this.active) return;
if (!this.finished) this._conclude(false);
this.close();
});
scr.querySelector("#bld-btn-return").addEventListener("click",()=>this.close());
scr.querySelector("#bld-act-1").addEventListener("click",()=>this._castSkill1());
scr.querySelector("#bld-act-2").addEventListener("click",()=>this._castSkill2());
scr.querySelector("#bld-act-3").addEventListener("click",()=>this._castSkill3());
scr.querySelector("#bld-act-dash").addEventListener("click",()=>this._castDash());

const toLogical=(e)=>{
const rect=this._canvas.getBoundingClientRect();
const cx=(e.touches&&e.touches[0])?e.touches[0].clientX :e.clientX;
const cy=(e.touches&&e.touches[0])?e.touches[0].clientY :e.clientY;
return {x:((cx - rect.left)/Math.max(1,rect.width))*860,y:((cy - rect.top)/Math.max(1,rect.height))*540};
};
this._canvas.addEventListener("pointerdown",(e)=>{
if (!this.active||this.finished) return;
e.preventDefault();
this._ptrDown=true;
const pt=toLogical(e);
this._ptrX=pt.x;this._ptrY=pt.y;
this._castSkill1(pt.x,pt.y);
});
this._canvas.addEventListener("pointermove",(e)=>{
if (!this.active||this.finished) return;
const pt=toLogical(e);
this._ptrX=pt.x;this._ptrY=pt.y;
});
const endP=()=>{this._ptrDown=false;};
window.addEventListener("pointerup",endP);
window.addEventListener("pointercancel",endP);

window.addEventListener("keydown",(e)=>{
if (!this.active) return;
if (global.vanCoSettings&&global.vanCoSettings.isOpen()) return;
this.keys[e.code]=true;
if (e.code==="Escape") {e.preventDefault();this.close();return;}
if (this.finished) return;
if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
if (e.code==="Digit1"||e.code==="KeyJ") this._castSkill1();
else if (e.code==="Digit2"||e.code==="KeyQ"||e.code==="KeyK") this._castSkill2();
else if (e.code==="Digit3"||e.code==="KeyE"||e.code==="KeyL") this._castSkill3();
else if (e.code==="Space"||e.code==="ShiftLeft") this._castDash();
});
window.addEventListener("keyup",(e)=>{this.keys[e.code]=false;});
}
return scr;
}

open(raidType="thief_raid") {
this.raidType=D.RAID_TYPES[raidType]?raidType :"thief_raid";
const rInfo=D.RAID_TYPES[this.raidType];
this._resetArenaState();
this.finished=false;
this.active=true;
this.keys={};
this._ptrDown=false;

// Populate allied grazing beasts from pastures to fight alongside player!
const army=this.sys&&this.sys.game&&this.sys.game.beastArmy;
const plots=this.sys?this.sys.plots :[];
for (let i=0;i<plots.length;i++) {
const p=plots[i];
if (p&&p.typeId==="beast_pasture"&&p.beastUid&&army) {
const rec=army.getStoredBeast(p.beastUid);
if (rec) {
const pos=this._getPlotScreenCenter(i);
this.allies.push({
name:rec.name,icon:rec.icon||"🐺",color:rec.color||"#5cc995",
x:pos.x,y:pos.y,homeX:pos.x,homeY:pos.y,
atk:24 + (rec.level||1)*4 + (rec.tier||0)*12,
spd:165,cd:0.4
});
}
}
}

this._startWave(1);
const scr=this._ensureDOM();
scr.querySelector("#bld-title").textContent=`${rInfo.icon} Phòng Thủ Phúc Địa — ${rInfo.name}`;
scr.querySelector("#bld-sub").textContent=`Trận Pháp Hộ Địa Cấp ${this.formationLv} • Thú Giữ Nhà: ${this.allies.length} • Di chuyển WASD / Kéo tay, bảo vệ Địa Linh Trụ!`;
scr.querySelector("#bld-result-overlay").classList.add("hidden");
scr.classList.remove("hidden");
this._syncHud();

if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") {
global.vanCoSettings.syncBgmForScreen("battle");
}
this._lastTs=performance.now();
if (this._rafId) cancelAnimationFrame(this._rafId);
this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
}

_getPlotScreenCenter(idx) {
const r=Math.floor(idx / D.GRID_COLS);
const c=idx % D.GRID_COLS;
const cw=128;const ch=94;
const ox=(this.W - D.GRID_COLS*cw)*0.5;
const oy=(this.H - D.GRID_ROWS*ch)*0.5 + 16;
return {x:ox + c*cw + cw*0.5,y:oy + r*ch + ch*0.5,w:cw - 12,h:ch - 12};
}

_startWave(wNum) {
this.wave=wNum;
this.waveSpawnLeft=4 + wNum*2;
this.spawnTimer=0.4;
this.fxRings.push({x:this.core.x,y:this.core.y,r:24,maxR:140,color:this.raidType==="calamity_siege"?"#b75cff" :"#ff5252",life:0.55,maxLife:0.55});
}

_spawnInvader(isWaveBoss=false) {
const edge=Math.floor(Math.random()*4);
let sx=0;let sy=0;
if (edge===0) {sx=40 + Math.random()*(this.W - 80);sy=-16;}
else if (edge===1) {sx=this.W + 16;sy=40 + Math.random()*(this.H - 80);}
else if (edge===2) {sx=40 + Math.random()*(this.W - 80);sy=this.H + 16;}
else {sx=-16;sy=40 + Math.random()*(this.H - 80);}

const isCal=(this.raidType==="calamity_siege");
const hp=Math.round((isWaveBoss?230 :64)*(1 + (this.wave - 1)*0.32));
this.invaders.push({
x:sx,y:sy,
hp,maxHp:hp,
r:isWaveBoss?21 :13,
spd:(isWaveBoss?68 :82) + this.wave*8,
atk:isWaveBoss?22 :11,
atkCd:0.5,
isBoss:isWaveBoss,
icon:isCal?(isWaveBoss?"🌩️" :"🔥") :(isWaveBoss?"🦹" :"🗡️"),
color:isCal?(isWaveBoss?"#c56cf0" :"#ff6b35") :(isWaveBoss?"#ff3b30" :"#ff9f43"),
hitFlash:0,slowTimer:0
});
}

_castSkill1(tx=null,ty=null) {
if (this.finished||this.pl.cd1>0) return;
this.pl.cd1=0.26;
let targetX=tx;let targetY=ty;
if (targetX===null&&this.invaders.length>0) {
let best=this.invaders[0];let bd=Infinity;
for (const inv of this.invaders) {
const d=Math.hypot(inv.x - this.pl.x,inv.y - this.pl.y);
if (d<bd) {bd=d;best=inv;}
}
targetX=best.x;targetY=best.y;
}
const ang=Math.atan2((targetY!==null?targetY :this._ptrY) - this.pl.y,(targetX!==null?targetX :this._ptrX) - this.pl.x);
for (const off of [-0.12,0,0.12]) {
const a=ang + off;
this.pBullets.push({x:this.pl.x + Math.cos(a)*14,y:this.pl.y + Math.sin(a)*14,vx:Math.cos(a)*540,vy:Math.sin(a)*540,r:8,dmg:28,color:"#7ef7f0",life:1.3});
}
this._playSfx("shot");
}

_castSkill2() {
if (this.finished||this.pl.cd2>0) return;
this.pl.cd2=3.5;
const rad=155;
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:16,maxR:rad,color:"#ffd700",life:0.45,maxLife:0.45});
for (const inv of this.invaders) {
if (Math.hypot(inv.x - this.pl.x,inv.y - this.pl.y)<=rad + inv.r) {
inv.hp -=95;inv.hitFlash=0.14;inv.slowTimer=2.0;
}
}
this._playSfx("boom");
}

_castSkill3() {
if (this.finished||this.pl.cd3>0) return;
this.pl.cd3=9.5;
// Activate Blessed Land Guardian Formation: Heal Core +20% + Global Shockwave + Slow all invaders!
this.core.hp=Math.min(this.core.maxHp,this.core.hp + Math.round(this.core.maxHp*0.20));
this.fxRings.push({x:this.core.x,y:this.core.y,r:28,maxR:420,color:"#7ef7c4",life:0.65,maxLife:0.65});
const dmg=75 + this.formationLv*28;
for (const inv of this.invaders) {
inv.hp -=dmg;inv.hitFlash=0.18;inv.slowTimer=3.2;
}
this._playSfx("array");
}

_castDash() {
if (this.finished||this.pl.dashCd>0) return;
this.pl.dashCd=1.3;this.pl.iframe=0.35;
let dx=0;let dy=0;
if (this.keys.KeyW||this.keys.ArrowUp) dy -=1;
if (this.keys.KeyS||this.keys.ArrowDown) dy +=1;
if (this.keys.KeyA||this.keys.ArrowLeft) dx -=1;
if (this.keys.KeyD||this.keys.ArrowRight) dx +=1;
if (dx===0&&dy===0) {dx=this._ptrX - this.pl.x;dy=this._ptrY - this.pl.y;}
const len=Math.hypot(dx,dy);
const ang=len>4?Math.atan2(dy,dx) :0;
this.pl.x=Math.max(36,Math.min(this.W - 36,this.pl.x + Math.cos(ang)*120));
this.pl.y=Math.max(46,Math.min(this.H - 36,this.pl.y + Math.sin(ang)*120));
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:8,maxR:40,color:"#7ef7c4",life:0.3,maxLife:0.3});
this._playSfx("shot");
}

_loop(ts) {
if (!this.active) {this._rafId=null;return;}
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs) / 1000));
this._lastTs=ts;
if (!this.finished) this._update(dt);
this._render(ts*0.001);
this._hudTick +=dt;
if (this._hudTick>=0.12) {this._hudTick=0;this._syncHud();}
if (this.active) this._rafId=requestAnimationFrame((nts)=>this._loop(nts));
}

_update(dt) {
if (this.pl.cd1>0) this.pl.cd1=Math.max(0,this.pl.cd1 - dt);
if (this.pl.cd2>0) this.pl.cd2=Math.max(0,this.pl.cd2 - dt);
if (this.pl.cd3>0) this.pl.cd3=Math.max(0,this.pl.cd3 - dt);
if (this.pl.dashCd>0) this.pl.dashCd=Math.max(0,this.pl.dashCd - dt);
if (this.pl.iframe>0) this.pl.iframe=Math.max(0,this.pl.iframe - dt);
if (this.core.hitFlash>0) this.core.hitFlash=Math.max(0,this.core.hitFlash - dt);

// Player movement
let mx=0;let my=0;
if (this.keys.KeyW||this.keys.ArrowUp) my -=1;
if (this.keys.KeyS||this.keys.ArrowDown) my +=1;
if (this.keys.KeyA||this.keys.ArrowLeft) mx -=1;
if (this.keys.KeyD||this.keys.ArrowRight) mx +=1;
if (mx!==0||my!==0) {
const l=Math.hypot(mx,my);mx /=l;my /=l;
this.pl.x +=mx*this.pl.spd*dt;this.pl.y +=my*this.pl.spd*dt;
this.pl.facing=Math.abs(mx)>Math.abs(my)?(mx>0?"right" :"left") :(my>0?"down" :"up");
} else if (this._ptrDown) {
const dx=this._ptrX - this.pl.x;const dy=this._ptrY - this.pl.y;const d=Math.hypot(dx,dy);
if (d>16) {this.pl.x +=(dx/d)*this.pl.spd*0.95*dt;this.pl.y +=(dy/d)*this.pl.spd*0.95*dt;}
}
this.pl.x=Math.max(30,Math.min(this.W - 30,this.pl.x));
this.pl.y=Math.max(40,Math.min(this.H - 30,this.pl.y));
if (this._ptrDown&&this.pl.cd1<=0) this._castSkill1(this._ptrX,this._ptrY);

// Wave Spawning
if (this.waveDelay>0) {
this.waveDelay -=dt;
if (this.waveDelay<=0) this._startWave(this.wave + 1);
} else if (this.waveSpawnLeft>0) {
this.spawnTimer -=dt;
if (this.spawnTimer<=0) {
this.spawnTimer=Math.max(0.55,1.25 - this.wave*0.18);
const isBoss=(this.waveSpawnLeft===1);
this.waveSpawnLeft -=1;
this._spawnInvader(isBoss);
}
} else if (this.invaders.length===0) {
if (this.wave>=this.totalWaves) {
this._conclude(true);
return;
} else {
this.waveDelay=1.6;
}
}

// Auto-Turret Defense Formation from Land Spirit Core!
this.core.turretCd -=dt;
if (this.core.turretCd<=0&&this.invaders.length>0) {
this.core.turretCd=Math.max(0.38,1.15 - this.formationLv*0.14);
let near=this.invaders[0];let nd=Infinity;
for (const inv of this.invaders) {
const d=Math.hypot(inv.x - this.core.x,inv.y - this.core.y);
if (d<nd) {nd=d;near=inv;}
}
if (nd<360) {
const a=Math.atan2(near.y - this.core.y,near.x - this.core.x);
this.pBullets.push({x:this.core.x,y:this.core.y,vx:Math.cos(a)*480,vy:Math.sin(a)*480,r:7,dmg:18 + this.formationLv*9,color:"#ffd700",life:1.1});
}
}

// Grazing Allied Beasts Fight Invaders!
for (const al of this.allies) {
if (al.cd>0) al.cd -=dt;
let tgt=null;let bd=260;
for (const inv of this.invaders) {
const d=Math.hypot(inv.x - al.x,inv.y - al.y);
if (d<bd) {bd=d;tgt=inv;}
}
if (tgt) {
const ang=Math.atan2(tgt.y - al.y,tgt.x - al.x);
if (bd>28) {al.x +=Math.cos(ang)*al.spd*dt;al.y +=Math.sin(ang)*al.spd*dt;}
else if (al.cd<=0) {
al.cd=0.85;tgt.hp -=al.atk;tgt.hitFlash=0.12;
this.fxRings.push({x:tgt.x,y:tgt.y,r:4,maxR:22,color:"#5cc995",life:0.22,maxLife:0.22});
}
} else {
const dh=Math.hypot(al.homeX - al.x,al.homeY - al.y);
if (dh>14) {al.x +=((al.homeX - al.x)/dh)*al.spd*0.7*dt;al.y +=((al.homeY - al.y)/dh)*al.spd*0.7*dt;}
}
}

// Player & Turret Bullets
for (let i=this.pBullets.length - 1;i>=0;i--) {
const b=this.pBullets[i];
b.x +=b.vx*dt;b.y +=b.vy*dt;b.life -=dt;
if (b.life<=0||b.x< -20||b.y< -20||b.x>this.W + 20||b.y>this.H + 20) {this.pBullets.splice(i,1);continue;}
for (let j=this.invaders.length - 1;j>=0;j--) {
const inv=this.invaders[j];
if (Math.hypot(b.x - inv.x,b.y - inv.y)<=b.r + inv.r) {
inv.hp -=b.dmg;inv.hitFlash=0.11;
this.pBullets.splice(i,1);
break;
}
}
}

// Update Invaders marching toward Land Spirit Core!
for (let i=this.invaders.length - 1;i>=0;i--) {
const inv=this.invaders[i];
if (inv.hitFlash>0) inv.hitFlash -=dt;
if (inv.slowTimer>0) inv.slowTimer -=dt;
if (inv.atkCd>0) inv.atkCd -=dt;
if (inv.hp<=0) {
this.kills +=1;
this.fxRings.push({x:inv.x,y:inv.y,r:8,maxR:36,color:inv.color,life:0.32,maxLife:0.32});
this.invaders.splice(i,1);
continue;
}
const dx=this.core.x - inv.x;const dy=this.core.y - inv.y;
const d=Math.hypot(dx,dy);
const spdNow=inv.spd*(inv.slowTimer>0?0.48 :1.0);
if (d>this.core.r + inv.r + 6) {
inv.x +=(dx / d)*spdNow*dt;
inv.y +=(dy / d)*spdNow*dt;
} else if (inv.atkCd<=0) {
inv.atkCd=1.05;
this.core.hp=Math.max(0,this.core.hp - inv.atk);
this.core.hitFlash=0.16;
this.fxRings.push({x:this.core.x,y:this.core.y,r:24,maxR:62,color:"#ff3b30",life:0.28,maxLife:0.28});
if (this.core.hp<=0) {
this._conclude(false);
return;
}
}
}

for (let i=this.fxRings.length - 1;i>=0;i--) {
this.fxRings[i].life -=dt;
if (this.fxRings[i].life<=0) this.fxRings.splice(i,1);
}
}

_conclude(success) {
if (this.finished) return;
this.finished=true;
this._playSfx(success?"win" :"fail");
const rewardText=this.sys?this.sys.onDefenseCompleted({success,raidType:this.raidType,kills:this.kills}) :"";
const ov=this._screen.querySelector("#bld-result-overlay");
const tEl=this._screen.querySelector("#bld-res-title");
tEl.textContent=success?"🏆 PHÒNG THỦ PHÚC ĐỊA THÀNH CÔNG!" :"💥 ĐỊA LINH TRỤ THẤT THỦ!";
tEl.style.color=success?"#7ef7c4" :"#ff6b6b";
this._screen.querySelector("#bld-res-summary").textContent=success
?`Ngươi cùng Trận Pháp Hộ Địa & ${this.allies.length} Linh Thú đã tiêu diệt toàn bộ ${this.kills} kẻ xâm nhập qua ${this.totalWaves} đợt công kích!`
:`Đã tiêu diệt ${this.kills} kẻ địch nhưng Địa Linh Trụ bị phá vỡ tại Đợt ${this.wave}/${this.totalWaves}.`;
this._screen.querySelector("#bld-res-reward").textContent=rewardText;
ov.classList.remove("hidden");
}

_syncHud() {
if (!this._screen) return;
const corePct=Math.max(0,Math.round((this.core.hp / Math.max(1,this.core.maxHp))*100));
this._screen.querySelector("#bld-hud-left").textContent=`🛡️ Địa Linh Trụ: ${Math.ceil(this.core.hp)}/${this.core.maxHp} (${corePct}%)`;
this._screen.querySelector("#bld-hud-right").textContent=`⚔️ Đợt ${this.wave}/${this.totalWaves} | Địch: ${this.invaders.length + this.waveSpawnLeft} | Đã diệt: ${this.kills}`;
const b2=this._screen.querySelector("#bld-act-2");
const b3=this._screen.querySelector("#bld-act-3");
const bd=this._screen.querySelector("#bld-act-dash");
if (b2) {b2.disabled=this.pl.cd2>0;b2.textContent=this.pl.cd2>0?`💥 (${this.pl.cd2.toFixed(1)}s)` :"💥 Sát Chiêu Hộ Địa [2/Q]";}
if (b3) {b3.disabled=this.pl.cd3>0;b3.textContent=this.pl.cd3>0?`🛡️ (${this.pl.cd3.toFixed(1)}s)` :"🛡️ Kích Trận Hộ Địa [3/E]";}
if (bd) {bd.disabled=this.pl.dashCd>0;bd.textContent=this.pl.dashCd>0?`💨 (${this.pl.dashCd.toFixed(1)}s)` :"💨 Thuấn Di [SPACE]";}
}

_render(t) {
const ctx=this._ctx;
const W=this.W;const H=this.H;
const bg=ctx.createRadialGradient(W*0.5,H*0.5,35,W*0.5,H*0.5,W*0.66);
bg.addColorStop(0,this.raidType==="calamity_siege"?"#1c1230" :"#122921");
bg.addColorStop(1,"#06090e");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Render the player's actual built 5x4 Blessed Land Resource Points right on the battlefield!
const plots=this.sys?this.sys.plots :[];
for (let i=0;i<plots.length;i++) {
const pos=this._getPlotScreenCenter(i);
const p=plots[i];
if (p) {
const tpl=D.getBuildingType(p.typeId);
ctx.fillStyle=tpl?tpl.bgCol :"rgba(20,36,28,0.6)";
ctx.strokeStyle=tpl?tpl.color :"#5cc995";
ctx.globalAlpha=0.58;ctx.lineWidth=1.4;
ctx.fillRect(pos.x - pos.w*0.5,pos.y - pos.h*0.5,pos.w,pos.h);
ctx.strokeRect(pos.x - pos.w*0.5,pos.y - pos.h*0.5,pos.w,pos.h);
ctx.globalAlpha=0.85;
ctx.font="22px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillText(tpl?tpl.icon :"🏡",pos.x,pos.y - 4);
ctx.font="bold 10px Georgia";ctx.fillStyle="#e2bf75";
ctx.fillText(`Lv.${p.level||1}`,pos.x,pos.y + 22);
ctx.globalAlpha=1;
} else {
ctx.strokeStyle="rgba(184,151,88,0.12)";ctx.lineWidth=1;
ctx.strokeRect(pos.x - pos.w*0.5,pos.y - pos.h*0.5,pos.w,pos.h);
}
}

// Central Land Spirit Core (Địa Linh Trụ) + Rotating 4-Arc Formation (ZERO setLineDash!)
const cx=this.core.x;const cy=this.core.y;
ctx.save();ctx.translate(cx,cy);ctx.rotate(t*0.65);
ctx.strokeStyle="#7ef7c4";ctx.lineWidth=2.6;
for (let k=0;k<4;k++) {
const a=k*Math.PI*0.5;
ctx.beginPath();ctx.arc(0,0,this.core.r + 14,a,a + 1.0);ctx.stroke();
}
ctx.restore();
const cg=ctx.createRadialGradient(cx,cy,4,cx,cy,this.core.r);
cg.addColorStop(0,"#ffffff");
cg.addColorStop(0.55,this.core.hitFlash>0?"#ff5252" :"#38e8a8");
cg.addColorStop(1,"#0e382a");
ctx.fillStyle=cg;ctx.beginPath();ctx.arc(cx,cy,this.core.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.stroke();
ctx.font="22px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("☯️",cx,cy);
// Core HP bar
const cp=Math.max(0,this.core.hp / Math.max(1,this.core.maxHp));
ctx.fillStyle="rgba(6,10,14,0.9)";ctx.fillRect(cx - 46,cy - 52,92,8);
ctx.fillStyle="#38e8a8";ctx.fillRect(cx - 45,cy - 51,90*cp,6);

// Allied Grazing Beasts
for (const al of this.allies) {
ctx.fillStyle="rgba(56,232,168,0.28)";ctx.beginPath();ctx.arc(al.x,al.y,18,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#5cc995";ctx.lineWidth=1.6;ctx.stroke();
ctx.font="18px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(al.icon,al.x,al.y);
}

// Invaders
for (const inv of this.invaders) {
ctx.fillStyle=inv.hitFlash>0?"#ffffff" :inv.color;
ctx.beginPath();ctx.arc(inv.x,inv.y,inv.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=inv.slowTimer>0?"#7ef7f0" :"#ffffff";ctx.lineWidth=1.6;ctx.stroke();
ctx.font=`${inv.isBoss?20 :14}px sans-serif`;ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillText(inv.icon,inv.x,inv.y);
const ip=Math.max(0,inv.hp / Math.max(1,inv.maxHp));
const bw=inv.isBoss?44 :28;
ctx.fillStyle="#080a0f";ctx.fillRect(inv.x - bw*0.5,inv.y - inv.r - 9,bw,4.5);
ctx.fillStyle="#ff4d4d";ctx.fillRect(inv.x - bw*0.5,inv.y - inv.r - 9,bw*ip,4.5);
}

// Bullets
for (const b of this.pBullets) {
ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1;ctx.stroke();
}

// Player Avatar
const plObj=this.sys&&this.sys.game&&this.sys.game.player;
const sk=(plObj&&typeof plObj.getSkinConfig==="function")?plObj.getSkinConfig() :null;
ctx.save();ctx.translate(this.pl.x,this.pl.y);
if (global.CharacterArtRenderer&&typeof global.CharacterArtRenderer.drawCharacter==="function") {
ctx.scale(1.15,1.15);
global.CharacterArtRenderer.drawCharacter(ctx,sk,{bobY:Math.sin(t*5)*1.5,facing:this.pl.facing,isMoving:true});
} else {
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
}
ctx.restore();

// FX Rings
for (const fx of this.fxRings) {
const r=Math.max(0,fx.life / fx.maxLife);
const rad=fx.r + (fx.maxR - fx.r)*(1 - r);
ctx.save();ctx.globalAlpha=r;ctx.strokeStyle=fx.color;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(fx.x,fx.y,rad,0,Math.PI*2);ctx.stroke();ctx.restore();
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
if (g.ui.activeHubTab==="tab-blessed-land") g.ui.renderBlessedLandTab();
}
}
}

global.BlessedLandDefenseArena=BlessedLandDefenseArena;
})(window);
