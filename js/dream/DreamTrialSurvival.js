(function (global) {
"use strict";

class DreamTrialSurvival {
constructor(engine,dream,cfg) {
this.engine=engine;
this.dream=dream;
this.cfg=cfg;
this.W=860;
this.H=540;
this.duration=cfg.duration||36;
this.timeLeft=this.duration;
this.orbTarget=cfg.orbTarget||12;
this.orbsCollected=0;
this.pulseCharge=0; // 3 orbs = ready to cast Định Hồn Ấn (clears all nearby blades!)
this.soulHp=100;
this.maxSoulHp=100;
this.hitCount=0;
this.finished=false;

this.pl={
x:this.W*0.5,y:this.H*0.72,
radius:13,spd:265,facing:"up",
dashCd:0,iframe:0,
pointerActive:false,ptrX:this.W*0.5,ptrY:this.H*0.72
};
this.hazards=[];
this.waves=[];
this.orbs=[];
this.fxRings=[];
this._spawnTimer=0.45;
this._waveTimer=2.8;
this._orbTimer=0.5;
for (let i=0;i<3;i++) this._spawnSoulOrb();
}

_spawnSoulOrb() {
if (this.orbs.length>=6) return;
const cx=this.W*0.5;const cy=this.H*0.5;
let ox=110 + Math.random()*(this.W - 220);
let oy=90 + Math.random()*(this.H - 180);
if (Math.hypot(ox - cx,oy - cy)<85) {ox +=110;}
this.orbs.push({x:ox,y:oy,r:11,ph:Math.random()*Math.PI*2});
}

_spawnSlashHazard() {
const edge=Math.floor(Math.random()*4);
let sx=0;let sy=0;
if (edge===0) {sx=Math.random()*this.W;sy=-20;}
else if (edge===1) {sx=this.W + 20;sy=Math.random()*this.H;}
else if (edge===2) {sx=Math.random()*this.W;sy=this.H + 20;}
else {sx=-20;sy=Math.random()*this.H;}

const aimToPlayer=(Math.random()<0.62);
const tx=aimToPlayer?(this.pl.x + (Math.random() - 0.5)*70) :(this.W*0.2 + Math.random()*this.W*0.6);
const ty=aimToPlayer?(this.pl.y + (Math.random() - 0.5)*70) :(this.H*0.2 + Math.random()*this.H*0.6);
const ang=Math.atan2(ty - sy,tx - sx);
const progress=1 - (this.timeLeft / Math.max(1,this.duration));
const spd=(this.cfg.hazardSpeed||175)*(0.92 + progress*0.42);
this.hazards.push({
x:sx,y:sy,
vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,
ang,r:10 + Math.random()*4,
color:this.cfg.hazard||"#ff2a2a"
});
}

triggerDash() {
if (this.finished||this.pl.dashCd>0) return;
this.pl.dashCd=1.45;
this.pl.iframe=0.38;
let dx=0;let dy=0;
const keys=this.engine.keys;
if (keys.KeyW||keys.ArrowUp) dy -=1;
if (keys.KeyS||keys.ArrowDown) dy +=1;
if (keys.KeyA||keys.ArrowLeft) dx -=1;
if (keys.KeyD||keys.ArrowRight) dx +=1;
if (dx===0&&dy===0&&this.pl.pointerActive) {
dx=this.pl.ptrX - this.pl.x;dy=this.pl.ptrY - this.pl.y;
}
const len=Math.hypot(dx,dy);
const ang=len>4?Math.atan2(dy,dx) : -Math.PI/2;
this.pl.x=Math.max(40,Math.min(this.W - 40,this.pl.x + Math.cos(ang)*115));
this.pl.y=Math.max(55,Math.min(this.H - 40,this.pl.y + Math.sin(ang)*115));
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:46,color:"#7ef7f0",life:0.35,maxLife:0.35});
this.engine.playSfx("dash");
}

triggerSoulPulse() {
if (this.finished||this.pulseCharge<3) return;
this.pulseCharge=0;
this.pl.iframe=Math.max(this.pl.iframe,0.55);
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:18,maxR:240,color:"#ffd700",life:0.55,maxLife:0.55});
this.hazards=this.hazards.filter(h=>Math.hypot(h.x - this.pl.x,h.y - this.pl.y)>240);
this.waves=this.waves.filter(w=>Math.abs(Math.hypot(this.pl.x - w.x,this.pl.y - w.y) - w.r)>90);
this.engine.playSfx("chime");
}

onPointerDown(lx,ly) {
this.pl.pointerActive=true;this.pl.ptrX=lx;this.pl.ptrY=ly;
}
onPointerMove(lx,ly,isDown) {
if (isDown) {this.pl.pointerActive=true;this.pl.ptrX=lx;this.pl.ptrY=ly;}
}
onPointerUp() {
this.pl.pointerActive=false;
}
onKeyDown(code) {
if (code==="Space"||code==="ShiftLeft") this.triggerDash();
else if (code==="KeyQ"||code==="KeyE") this.triggerSoulPulse();
}

update(dt) {
if (this.finished) return;
this.timeLeft -=dt;
if (this.pl.dashCd>0) this.pl.dashCd=Math.max(0,this.pl.dashCd - dt);
if (this.pl.iframe>0) this.pl.iframe=Math.max(0,this.pl.iframe - dt);

// Player Movement (Keyboard WASD/Arrows OR Touch/Mouse Drag)
const keys=this.engine.keys;
let mx=0;let my=0;
if (keys.KeyW||keys.ArrowUp) my -=1;
if (keys.KeyS||keys.ArrowDown) my +=1;
if (keys.KeyA||keys.ArrowLeft) mx -=1;
if (keys.KeyD||keys.ArrowRight) mx +=1;
if (mx!==0||my!==0) {
const len=Math.hypot(mx,my);mx /=len;my /=len;
this.pl.x +=mx*this.pl.spd*dt;
this.pl.y +=my*this.pl.spd*dt;
if (Math.abs(mx)>Math.abs(my)) this.pl.facing=mx>0?"right" :"left";
else this.pl.facing=my>0?"down" :"up";
} else if (this.pl.pointerActive) {
const dx=this.pl.ptrX - this.pl.x;const dy=this.pl.ptrY - this.pl.y;
const d=Math.hypot(dx,dy);
if (d>6) {
const step=Math.min(d,this.pl.spd*1.12*dt);
this.pl.x +=(dx / d)*step;
this.pl.y +=(dy / d)*step;
if (Math.abs(dx)>Math.abs(dy)) this.pl.facing=dx>0?"right" :"left";
else this.pl.facing=dy>0?"down" :"up";
}
}
this.pl.x=Math.max(36,Math.min(this.W - 36,this.pl.x));
this.pl.y=Math.max(58,Math.min(this.H - 36,this.pl.y));

// Spawn Hazards & Expanding Gate Shockwaves
const progress=1 - (this.timeLeft / Math.max(1,this.duration));
const rate=(this.cfg.hazardRate||1.1)*(1 + progress*0.65);
this._spawnTimer -=dt*rate;
if (this._spawnTimer<=0) {
this._spawnTimer=0.44;
this._spawnSlashHazard();
if (progress>0.55&&Math.random()<0.45) this._spawnSlashHazard();
}
this._waveTimer -=dt;
if (this._waveTimer<=0) {
this._waveTimer=Math.max(2.1,3.5 - progress*1.1);
this.waves.push({x:this.W*0.5,y:this.H*0.5,r:28,maxR:440,spd:145 + progress*55,hit:false});
}
this._orbTimer -=dt;
if (this._orbTimer<=0) {
this._orbTimer=2.0;
this._spawnSoulOrb();
}

// Collect Soul Orbs
for (let i=this.orbs.length - 1;i>=0;i--) {
const ob=this.orbs[i];
if (Math.hypot(this.pl.x - ob.x,this.pl.y - ob.y)<=this.pl.radius + ob.r + 8) {
this.orbs.splice(i,1);
this.orbsCollected +=1;
this.pulseCharge=Math.min(3,this.pulseCharge + 1);
this.soulHp=Math.min(this.maxSoulHp,this.soulHp + 7);
this.fxRings.push({x:ob.x,y:ob.y,r:8,maxR:38,color:"#ffd700",life:0.32,maxLife:0.32});
this.engine.playSfx("star");
}
}

// Update Blades
for (let i=this.hazards.length - 1;i>=0;i--) {
const h=this.hazards[i];
h.x +=h.vx*dt;h.y +=h.vy*dt;
if (h.x< -50||h.y< -50||h.x>this.W + 50||h.y>this.H + 50) {
this.hazards.splice(i,1);continue;
}
if (this.pl.iframe<=0&&Math.hypot(this.pl.x - h.x,this.pl.y - h.y)<=this.pl.radius + h.r*0.78) {
this.hazards.splice(i,1);
this._takeSoulHit(18);
}
}

// Update Expanding Waves (can be dashed through cleanly with Space!)
for (let i=this.waves.length - 1;i>=0;i--) {
const w=this.waves[i];
w.r +=w.spd*dt;
if (w.r>=w.maxR) {this.waves.splice(i,1);continue;}
const d=Math.hypot(this.pl.x - w.x,this.pl.y - w.y);
if (!w.hit&&this.pl.iframe<=0&&Math.abs(d - w.r)<=11) {
w.hit=true;
this._takeSoulHit(15);
}
}

for (let i=this.fxRings.length - 1;i>=0;i--) {
this.fxRings[i].life -=dt;
if (this.fxRings[i].life<=0) this.fxRings.splice(i,1);
}

// Victory check
if (this.timeLeft<=0) {
this.timeLeft=0;
this.finished=true;
this.engine.playSfx("victory");
const orbBonus=Math.min(0.40,this.orbsCollected*0.03);
const perfBonus=this.hitCount===0?0.20 :(this.hitCount<=2?0.10 :0);
const bonusMult=Number((1.05 + orbBonus + perfBonus).toFixed(2));
const grade=(bonusMult>=1.40)?"SS" :(bonusMult>=1.22?"S" :"A");
this.engine.finishTrial({
success:true,
grade,
bonusMult,
summary:`Sống sót trọn vẹn ${this.duration}s tại 【${this.cfg.gateTitle}】! Thu gom ${this.orbsCollected} Hồn Hạch (trúng đòn: ${this.hitCount} lần).`
});
}
}

_takeSoulHit(dmg) {
this.soulHp=Math.max(0,this.soulHp - dmg);
this.hitCount +=1;
this.pl.iframe=0.55;
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:44,color:"#ff3b30",life:0.32,maxLife:0.32});
this.engine.playSfx("hit");
if (this.soulHp<=0) {
this.finished=true;
const survRatio=1 - (this.timeLeft / Math.max(1,this.duration));
this.engine.playSfx("fail");
this.engine.finishTrial({
success:false,
grade:"B",
bonusMult:Number((0.35 + survRatio*0.25).toFixed(2)),
summary:`Hồn Phách bị sát khí bào mòn khi còn ${Math.ceil(this.timeLeft)}s — kịp thu ${this.orbsCollected} Hồn Hạch và lĩnh ngộ một phần chân ý!`
});
}
}

getHudInfo() {
return {
leftText:`👻 Hồn Phách: ${Math.ceil(this.soulHp)}% | ✨ Hồn Hạch: ${this.orbsCollected}/${this.orbTarget}`,
rightText:`⏱️ Sống Sót: ${Math.ceil(this.timeLeft)}s`,
actionButtons:[
{id:"dash",label:this.pl.dashCd>0?`💨 Lướt (${this.pl.dashCd.toFixed(1)}s)` :"💨 Hồn Độn Lướt [SPACE]",onClick:()=>this.triggerDash(),disabled:this.pl.dashCd>0},
{id:"pulse",label:this.pulseCharge>=3?"💥 Định Hồn Ấn Sẵn Sàng! [Q]" :`🔮 Tụ Ấn (${this.pulseCharge}/3)`,onClick:()=>this.triggerSoulPulse(),disabled:this.pulseCharge<3}
]
};
}

render(ctx,t) {
const W=this.W;const H=this.H;
const cx=W*0.5;const cy=H*0.5;
const bg=ctx.createRadialGradient(cx,cy,30,cx,cy,W*0.65);
bg.addColorStop(0,this.cfg.bgA||"#1c0a2e");
bg.addColorStop(1,this.cfg.bgB||"#07030d");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Central Sinh Tử Môn / Huyết Hồ Vortex Gate (ZERO setLineDash!)
ctx.save();ctx.translate(cx,cy);ctx.rotate(t*0.5);
ctx.fillStyle="rgba(0,0,0,0.45)";ctx.beginPath();ctx.arc(0,0,58,0,Math.PI*2);ctx.fill();
ctx.strokeStyle=this.cfg.accent||"#c56cf0";ctx.lineWidth=3;
for (let k=0;k<4;k++) {
const a=k*Math.PI*0.5;
ctx.beginPath();ctx.arc(0,0,64,a,a + 1.0);ctx.stroke();
}
ctx.restore();

// Title
ctx.font="bold 14px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText(`✦ ${this.cfg.gateTitle||"SINH TỬ MÔN"} — NÉ SÁT KHÍ & THU HỒN HẠCH ✦`,cx,28);
ctx.font="11.5px Georgia";ctx.fillStyle="#d6c8e8";
ctx.fillText("Di chuyển bằng WASD hoặc Kéo Ngón Tay / Chuột • [SPACE] Lướt xuyên vòng sóng • Đủ 3 Hồn Hạch bấm [Q] xóa đạn!",cx,48);

// Expanding Shockwaves
for (let i=0;i<this.waves.length;i++) {
const w=this.waves[i];
const alpha=Math.max(0.1,1 - w.r / w.maxR);
ctx.save();ctx.globalAlpha=alpha*0.8;ctx.strokeStyle=this.cfg.accent||"#c56cf0";ctx.lineWidth=4;
ctx.beginPath();ctx.arc(w.x,w.y,w.r,0,Math.PI*2);ctx.stroke();ctx.restore();
}

// Soul Orbs
for (let i=0;i<this.orbs.length;i++) {
const ob=this.orbs[i];
const bob=Math.sin(t*4 + ob.ph)*3;
ctx.fillStyle="rgba(255,215,0,0.25)";ctx.beginPath();ctx.arc(ob.x,ob.y + bob,ob.r + 7,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.strokeStyle="#ffffff";ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(ob.x,ob.y + bob,ob.r*0.75,0,Math.PI*2);ctx.fill();ctx.stroke();
}

// Slash Hazards
for (let i=0;i<this.hazards.length;i++) {
const h=this.hazards[i];
ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.ang);
ctx.fillStyle=h.color;
ctx.beginPath();ctx.moveTo(h.r*1.5,0);ctx.lineTo(-h.r,h.r*0.65);ctx.lineTo(-h.r*0.5,0);ctx.lineTo(-h.r,-h.r*0.65);ctx.closePath();ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1;ctx.stroke();
ctx.restore();
}

// Player Soul Avatar
const skins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
const sk=skins[this.cfg.protagonistSkin]||skins.phuong_nguyen;
ctx.save();ctx.translate(this.pl.x,this.pl.y);
if (this.pl.iframe>0) ctx.globalAlpha=0.55 + Math.sin(t*30)*0.3;
if (global.CharacterArtRenderer&&typeof global.CharacterArtRenderer.drawCharacter==="function") {
ctx.scale(1.1,1.1);
global.CharacterArtRenderer.drawCharacter(ctx,sk,{bobY:Math.sin(t*5)*1.5,facing:this.pl.facing,isMoving:true});
} else {
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();
}
ctx.restore();

// FX Rings
for (let i=0;i<this.fxRings.length;i++) {
const fx=this.fxRings[i];
const ratio=Math.max(0,fx.life / fx.maxLife);
const rad=fx.r + (fx.maxR - fx.r)*(1 - ratio);
ctx.save();ctx.globalAlpha=ratio;ctx.strokeStyle=fx.color;ctx.lineWidth=3;
ctx.beginPath();ctx.arc(fx.x,fx.y,rad,0,Math.PI*2);ctx.stroke();ctx.restore();
}
}
}

global.DreamTrialSurvival=DreamTrialSurvival;
})(window);
