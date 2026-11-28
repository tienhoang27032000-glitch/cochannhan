(function (global) {
"use strict";

class DreamTrialLotusDuel {
constructor(engine,dream,cfg) {
this.engine=engine;
this.dream=dream;
this.cfg=cfg;
this.W=860;
this.H=540;
this.timeLimit=cfg.timeLimit||65;
this.timeLeft=this.timeLimit;
this.finished=false;

this.pl={
x:this.W*0.5,y:this.H*0.78,
hp:100,maxHp:100,radius:14,spd:260,
facing:"up",aimX:this.W*0.5,aimY:this.H*0.26,
cd1:0,cd2:0,cd3:0,dashCd:0,iframe:0,
timeFreezeTimer:0,
pointerDown:false
};
this.boss={
x:this.W*0.5,y:this.H*0.25,
hp:cfg.bossHp||1350,maxHp:cfg.bossHp||1350,
radius:38,atkTimer:1.1,patternIdx:0,hitFlash:0
};
this.pBullets=[];
this.eBullets=[];
this.fxRings=[];
}

castSkill1() {
if (this.finished||this.pl.cd1>0) return;
const skills=this.cfg.skills||[];
const baseCd=(skills[0]&&skills[0].cd)||0.30;
this.pl.cd1=this.pl.timeFreezeTimer>0?baseCd*0.55 :baseCd;
const ang=Math.atan2(this.boss.y - this.pl.y,this.boss.x - this.pl.x);
for (const off of [-0.14,0,0.14]) {
const a=ang + off;
this.pBullets.push({
x:this.pl.x + Math.cos(a)*16,y:this.pl.y + Math.sin(a)*16,
vx:Math.cos(a)*540,vy:Math.sin(a)*540,
r:9,dmg:26,color:this.cfg.accent||"#ff3b30",life:1.4
});
}
this.engine.playSfx("star");
}

castSkill2() {
if (this.finished||this.pl.cd2>0) return;
const skills=this.cfg.skills||[];
this.pl.cd2=(skills[1]&&skills[1].cd)||3.4;
// Blossoming Red Lotus AoE burst at Boss + clears nearby enemy orbs!
const bx=this.boss.x;const by=this.boss.y;
this.fxRings.push({x:bx,y:by,r:16,maxR:155,color:this.cfg.accent||"#ff3b30",life:0.55,maxLife:0.55});
this.fxRings.push({x:bx,y:by,r:8,maxR:110,color:"#ffd700",life:0.45,maxLife:0.45});
this._damageBoss(165);
this.eBullets=this.eBullets.filter(b=>Math.hypot(b.x - this.pl.x,b.y - this.pl.y)>170);
this.engine.playSfx("chime");
}

castSkill3() {
if (this.finished||this.pl.cd3>0) return;
const skills=this.cfg.skills||[];
this.pl.cd3=(skills[2]&&skills[2].cd)||8.2;
// Quang Âm Nghịch Chuyển: Freeze Time 2.5s + Rewind HP +25% + Clear close bullets!
this.pl.timeFreezeTimer=2.5;
this.pl.hp=Math.min(this.pl.maxHp,this.pl.hp + 25);
this.eBullets=this.eBullets.filter(b=>Math.hypot(b.x - this.pl.x,b.y - this.pl.y)>150);
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:20,maxR:340,color:"#ffd700",life:0.65,maxLife:0.65});
this.engine.playSfx("victory");
}

triggerDash() {
if (this.finished||this.pl.dashCd>0) return;
this.pl.dashCd=1.35;
this.pl.iframe=0.38;
const keys=this.engine.keys;
let dx=0;let dy=0;
if (keys.KeyW||keys.ArrowUp) dy -=1;
if (keys.KeyS||keys.ArrowDown) dy +=1;
if (keys.KeyA||keys.ArrowLeft) dx -=1;
if (keys.KeyD||keys.ArrowRight) dx +=1;
if (dx===0&&dy===0) {dx=this.pl.aimX - this.pl.x;dy=this.pl.aimY - this.pl.y;}
const len=Math.hypot(dx,dy);
const ang=len>4?Math.atan2(dy,dx) :0;
this.pl.x=Math.max(40,Math.min(this.W - 40,this.pl.x + Math.cos(ang)*120));
this.pl.y=Math.max(80,Math.min(this.H - 40,this.pl.y + Math.sin(ang)*120));
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:44,color:"#ffd700",life:0.32,maxLife:0.32});
this.engine.playSfx("dash");
}

_damageBoss(amt) {
if (this.finished) return;
this.boss.hp=Math.max(0,this.boss.hp - amt);
this.boss.hitFlash=0.12;
if (this.boss.hp<=0) {
this.finished=true;
this.engine.playSfx("victory");
const hpRatio=this.pl.hp / this.pl.maxHp;
const bonusMult=Number((1.15 + hpRatio*0.35).toFixed(2));
const grade=hpRatio>=0.75?"SS" :(hpRatio>=0.45?"S" :"A");
this.engine.finishTrial({
success:true,
grade,
bonusMult,
summary:`Đánh nát 【${this.boss.name||this.cfg.bossName}】 khi còn ${Math.ceil(this.timeLeft)}s (Hồn Phách còn ${Math.ceil(this.pl.hp)}%)!`
});
}
}

onPointerDown(lx,ly) {
this.pl.pointerDown=true;this.pl.aimX=lx;this.pl.aimY=ly;
this.castSkill1();
}
onPointerMove(lx,ly,isDown) {
this.pl.aimX=lx;this.pl.aimY=ly;
if (isDown) this.pl.pointerDown=true;
}
onPointerUp() {this.pl.pointerDown=false;}

onKeyDown(code) {
if (code==="Digit1"||code==="KeyJ") this.castSkill1();
else if (code==="Digit2"||code==="KeyK"||code==="KeyQ") this.castSkill2();
else if (code==="Digit3"||code==="KeyL"||code==="KeyE") this.castSkill3();
else if (code==="Space"||code==="ShiftLeft") this.triggerDash();
}

update(dt) {
if (this.finished) return;
this.timeLeft -=dt;
if (this.timeLeft<=0) {
this.timeLeft=0;
this.finished=true;
const dmgPct=1 - (this.boss.hp / Math.max(1,this.boss.maxHp));
this.engine.playSfx("fail");
this.engine.finishTrial({
success:false,
grade:"B",
bonusMult:Number((0.35 + dmgPct*0.30).toFixed(2)),
summary:`Hết thời gian mộng cảnh (đã gây ${Math.round(dmgPct*100)}% sát thương lên ${this.cfg.bossName}) — kịp thu nhận một phần chân ý!`
});
return;
}

if (this.pl.cd1>0) this.pl.cd1=Math.max(0,this.pl.cd1 - dt);
if (this.pl.cd2>0) this.pl.cd2=Math.max(0,this.pl.cd2 - dt);
if (this.pl.cd3>0) this.pl.cd3=Math.max(0,this.pl.cd3 - dt);
if (this.pl.dashCd>0) this.pl.dashCd=Math.max(0,this.pl.dashCd - dt);
if (this.pl.iframe>0) this.pl.iframe=Math.max(0,this.pl.iframe - dt);
if (this.pl.timeFreezeTimer>0) this.pl.timeFreezeTimer=Math.max(0,this.pl.timeFreezeTimer - dt);
if (this.boss.hitFlash>0) this.boss.hitFlash=Math.max(0,this.boss.hitFlash - dt);

// Movement: WASD/Arrows or Touch/Mouse gentle follow while holding pointer
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
} else if (this.pl.pointerDown) {
const dx=this.pl.aimX - this.pl.x;const dy=this.pl.aimY - this.pl.y;
const d=Math.hypot(dx,dy);
if (d>18) {
this.pl.x +=(dx / d)*this.pl.spd*0.95*dt;
this.pl.y +=(dy / d)*this.pl.spd*0.95*dt;
}
}
this.pl.x=Math.max(36,Math.min(this.W - 36,this.pl.x));
this.pl.y=Math.max(120,Math.min(this.H - 36,this.pl.y));
if (this.pl.pointerDown&&this.pl.cd1<=0) this.castSkill1();

// Boss Movement & Attack Patterns (frozen during Quang Âm Nghịch Chuyển!)
const frozen=(this.pl.timeFreezeTimer>0);
if (!frozen) {
const tNow=this.timeLimit - this.timeLeft;
this.boss.x=this.W*0.5 + Math.sin(tNow*0.95)*230;
this.boss.y=135 + Math.sin(tNow*1.7)*32;
this.boss.atkTimer -=dt;
const hpPct=this.boss.hp / Math.max(1,this.boss.maxHp);
if (this.boss.atkTimer<=0) {
this.boss.atkTimer=hpPct<0.4?0.95 :(hpPct<0.7?1.25 :1.55);
const pat=this.boss.patternIdx % 3;
this.boss.patternIdx +=1;
const aimP=Math.atan2(this.pl.y - this.boss.y,this.pl.x - this.boss.x);
if (pat===0) {
// Radial Fate Ring
const cnt=hpPct<0.4?12 :9;
for (let i=0;i<cnt;i++) {
const a=(Math.PI*2*i)/cnt + tNow;
this.eBullets.push({x:this.boss.x,y:this.boss.y,vx:Math.cos(a)*175,vy:Math.sin(a)*175,r:9,color:this.cfg.bossColor||"#ffd700"});
}
} else if (pat===1) {
// Aimed 5-fan Fate Barrage
for (let i=-2;i<=2;i++) {
const a=aimP + i*0.18;
this.eBullets.push({x:this.boss.x,y:this.boss.y,vx:Math.cos(a)*235,vy:Math.sin(a)*235,r:10,color:"#ff5252"});
}
} else {
// Twin Spiral Streams
for (let i=0;i<6;i++) {
const a=aimP + (i - 2.5)*0.26;
this.eBullets.push({x:this.boss.x,y:this.boss.y,vx:Math.cos(a)*195,vy:Math.sin(a)*195,r:8.5,color:"#ffeaa7"});
}
}
}
}

// Player Bullets
for (let i=this.pBullets.length - 1;i>=0;i--) {
const b=this.pBullets[i];
b.x +=b.vx*dt;b.y +=b.vy*dt;b.life -=dt;
if (b.life<=0||b.x< -20||b.y< -20||b.x>this.W + 20||b.y>this.H + 20) {
this.pBullets.splice(i,1);continue;
}
if (Math.hypot(b.x - this.boss.x,b.y - this.boss.y)<=this.boss.radius + b.r) {
this.pBullets.splice(i,1);
this.fxRings.push({x:b.x,y:b.y,r:4,maxR:24,color:b.color,life:0.2,maxLife:0.2});
this._damageBoss(b.dmg);
}
}

// Enemy Bullets (frozen in time during Time Rewind!)
const eStep=frozen?0.08 :1.0;
for (let i=this.eBullets.length - 1;i>=0;i--) {
const b=this.eBullets[i];
b.x +=b.vx*dt*eStep;b.y +=b.vy*dt*eStep;
if (b.x< -30||b.y< -30||b.x>this.W + 30||b.y>this.H + 30) {
this.eBullets.splice(i,1);continue;
}
if (this.pl.iframe<=0&&Math.hypot(b.x - this.pl.x,b.y - this.pl.y)<=this.pl.radius + b.r*0.75) {
this.eBullets.splice(i,1);
this.pl.hp=Math.max(0,this.pl.hp - 14);
this.pl.iframe=0.50;
this.fxRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:40,color:"#ff3b30",life:0.3,maxLife:0.3});
this.engine.playSfx("hit");
if (this.pl.hp<=0) {
this.finished=true;
const dmgPct=1 - (this.boss.hp / Math.max(1,this.boss.maxHp));
this.engine.playSfx("fail");
this.engine.finishTrial({
success:false,
grade:"B",
bonusMult:Number((0.35 + dmgPct*0.28).toFixed(2)),
summary:`Hóa thân mộng cảnh tan vỡ (đã phá ${Math.round(dmgPct*100)}% sinh lực ${this.cfg.bossName}) — kịp lĩnh ngộ một phần chân ý!`
});
return;
}
}
}

for (let i=this.fxRings.length - 1;i>=0;i--) {
this.fxRings[i].life -=dt;
if (this.fxRings[i].life<=0) this.fxRings.splice(i,1);
}
}

getHudInfo() {
const sk=this.cfg.skills||[];
const s1=sk[0]||{name:"Chiêu 1",icon:"🌙"};
const s2=sk[1]||{name:"Chiêu 2",icon:"🪷"};
const s3=sk[2]||{name:"Nghịch Chuyển",icon:"⏳"};
return {
leftText:`❤️ Hóa Thân: ${Math.ceil(this.pl.hp)}% | 👑 ${this.cfg.bossName}: ${Math.ceil((this.boss.hp/this.boss.maxHp)*100)}%`,
rightText:`⏱️ ${Math.ceil(this.timeLeft)}s${this.pl.timeFreezeTimer>0?" | ⏳ NGƯNG ĐỌNG THỜI GIAN!" :""}`,
actionButtons:[
{id:"s1",label:`${s1.icon} ${s1.name} [1]`,onClick:()=>this.castSkill1(),disabled:this.pl.cd1>0},
{id:"s2",label:this.pl.cd2>0?`${s2.icon} (${this.pl.cd2.toFixed(1)}s)` :`${s2.icon} ${s2.name} [2]`,onClick:()=>this.castSkill2(),disabled:this.pl.cd2>0},
{id:"s3",label:this.pl.cd3>0?`${s3.icon} (${this.pl.cd3.toFixed(1)}s)` :`${s3.icon} ${s3.name} [3]`,onClick:()=>this.castSkill3(),disabled:this.pl.cd3>0},
{id:"dash",label:this.pl.dashCd>0?`💨 (${this.pl.dashCd.toFixed(1)}s)` :"💨 Thuấn Di [SPACE]",onClick:()=>this.triggerDash(),disabled:this.pl.dashCd>0}
]
};
}

render(ctx,t) {
const W=this.W;const H=this.H;
const frozen=(this.pl.timeFreezeTimer>0);
const bg=ctx.createRadialGradient(W*0.5,H*0.42,30,W*0.5,H*0.5,W*0.68);
bg.addColorStop(0,frozen?"#1a2b42" :(this.cfg.bgA||"#2e0a12"));
bg.addColorStop(1,this.cfg.bgB||"#0b0306");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Flowing Time River / Dream Arena background ribbons
ctx.strokeStyle=frozen?"rgba(126,247,240,0.22)" :"rgba(255,215,0,0.14)";
ctx.lineWidth=2;
for (let row=0;row<5;row++) {
const ry=95 + row*95;
const shift=frozen?0 :((t*36 + row*45) % 160);
ctx.beginPath();
for (let x=-160;x<=W + 160;x+=40) {
const y=ry + Math.sin((x + shift)*0.02 + row)*10;
if (x===-160) ctx.moveTo(x + shift,y);else ctx.lineTo(x + shift,y);
}
ctx.stroke();
}

// Boss HP Bar at top
const bPct=Math.max(0,this.boss.hp / Math.max(1,this.boss.maxHp));
ctx.fillStyle="rgba(8,10,16,0.85)";ctx.fillRect(W*0.5 - 210,14,420,16);
ctx.fillStyle=this.cfg.bossColor||"#ffd700";ctx.fillRect(W*0.5 - 208,16,416*bPct,12);
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.4;ctx.strokeRect(W*0.5 - 210,14,420,16);
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffffff";
ctx.fillText(`${this.cfg.bossName} (${Math.ceil(this.boss.hp)} / ${this.boss.maxHp})`,W*0.5,44);

// Fate Boss Core (Geometric Rotating Dao Mandala — ZERO setLineDash!)
const bx=this.boss.x;const by=this.boss.y;
ctx.save();ctx.translate(bx,by);
ctx.save();ctx.rotate(frozen?0 :t*0.9);
ctx.strokeStyle=this.boss.hitFlash>0?"#ffffff" :(this.cfg.bossColor||"#ffd700");
ctx.lineWidth=3;
for (let k=0;k<4;k++) {
const a=k*Math.PI*0.5;
ctx.beginPath();ctx.arc(0,0,this.boss.radius + 14,a,a + 1.05);ctx.stroke();
}
ctx.restore();
const cg=ctx.createRadialGradient(0,0,4,0,0,this.boss.radius);
cg.addColorStop(0,"#ffffff");
cg.addColorStop(0.55,this.boss.hitFlash>0?"#ffffff" :(this.cfg.bossColor||"#ffd700"));
cg.addColorStop(1,"rgba(0,0,0,0.4)");
ctx.fillStyle=cg;ctx.beginPath();ctx.arc(0,0,this.boss.radius,0,Math.PI*2);ctx.fill();
ctx.restore();

// Enemy Bullets
for (let i=0;i<this.eBullets.length;i++) {
const b=this.eBullets[i];
ctx.fillStyle=frozen?"#7ef7f0" :b.color;
ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.2;ctx.stroke();
}

// Player Bullets (Crescent Lotus Blades)
for (let i=0;i<this.pBullets.length;i++) {
const b=this.pBullets[i];
ctx.fillStyle=b.color;
ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#fff5b8";ctx.lineWidth=1.4;ctx.stroke();
}

// Protagonist Avatar (Hồng Liên Ma Tôn / Hỏa Hồn / Cuồng Man!)
const skins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
const sk=skins[this.cfg.protagonistSkin]||skins.hong_lien;
ctx.save();ctx.translate(this.pl.x,this.pl.y);
if (this.pl.iframe>0) ctx.globalAlpha=0.55 + Math.sin(t*30)*0.3;
if (global.CharacterArtRenderer&&typeof global.CharacterArtRenderer.drawCharacter==="function") {
ctx.scale(1.22,1.22);
global.CharacterArtRenderer.drawCharacter(ctx,sk,{bobY:Math.sin(t*5)*1.5,facing:this.pl.facing,isMoving:true});
}
ctx.restore();

// FX Rings
for (let i=0;i<this.fxRings.length;i++) {
const fx=this.fxRings[i];
const ratio=Math.max(0,fx.life / fx.maxLife);
const rad=fx.r + (fx.maxR - fx.r)*(1 - ratio);
ctx.save();ctx.globalAlpha=ratio;ctx.strokeStyle=fx.color;ctx.lineWidth=3.2;
ctx.beginPath();ctx.arc(fx.x,fx.y,rad,0,Math.PI*2);ctx.stroke();ctx.restore();
}
}
}

global.DreamTrialLotusDuel=DreamTrialLotusDuel;
})(window);
