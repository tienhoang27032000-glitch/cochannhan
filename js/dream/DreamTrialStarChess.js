(function (global) {
"use strict";

class DreamTrialStarChess {
constructor(engine,dream,cfg) {
this.engine=engine;
this.dream=dream;
this.cfg=cfg;
this.W=860;
this.H=540;
this.totalRounds=cfg.rounds||3;
this.round=1;
this.gridSize=cfg.gridSize||4;
this.timeLeft=cfg.timeLimit||80;
this.maxMoves=cfg.maxMoves||16;
this.movesLeft=this.maxMoves;
this.movesUsedTotal=0;
this.hintsLeft=3;
this.hintNode=null;
this.hintTimer=0;
this.hoverCell=null;
this.grid=[];
this.solutionSet=new Set(); // exact toggle-parity set (guaranteed solvable!)
this.stars=[];
this.fxRings=[];
this.roundClearPause=0;
this.finished=false;

for (let i=0;i<60;i++) {
this.stars.push({
x:Math.random()*this.W,
y:Math.random()*this.H,
r:0.8 + Math.random()*1.8,
ph:Math.random()*Math.PI*2
});
}
this._generateRound(1);
}

_cellKey(r,c) {return `${r}_${c}`;}

_toggleInGrid(grid,r,c,size) {
const dirs=[[0,0],[-1,0],[1,0],[0,-1],[0,1]];
for (const [dr,dc] of dirs) {
const nr=r + dr;const nc=c + dc;
if (nr>=0&&nr<size&&nc>=0&&nc<size) {
grid[nr][nc]= !grid[nr][nc];
}
}
}

_generateRound(roundNum) {
this.round=roundNum;
const sz=(roundNum===1&&this.gridSize>=4)?3 :this.gridSize;
this.curSize=sz;
this.movesLeft=this.maxMoves + (roundNum===1?0 :2);
this.hintNode=null;
this.hintTimer=0;
this.solutionSet.clear();

// Start from all-LIT (solved) board, then scramble with K distinct clicks!
this.grid=[];
for (let r=0;r<sz;r++) {
const row=[];
for (let c=0;c<sz;c++) row.push(true);
this.grid.push(row);
}
const steps=Math.min(sz*sz - 1,Math.max(3,(this.cfg.scrambleSteps||4) + (roundNum - 1)));
const allCells=[];
for (let r=0;r<sz;r++) for (let c=0;c<sz;c++) allCells.push([r,c]);
for (let i=allCells.length - 1;i>0;i--) {
const j=Math.floor(Math.random()*(i + 1));
const tmp=allCells[i];allCells[i]=allCells[j];allCells[j]=tmp;
}
for (let k=0;k<steps;k++) {
const [rr,cc]=allCells[k];
this._toggleInGrid(this.grid,rr,cc,sz);
this.solutionSet.add(this._cellKey(rr,cc));
}
// Guarantee at least 1 unlit star
if (this._isBoardSolved()) {
this._toggleInGrid(this.grid,1,1,sz);
this.solutionSet.add(this._cellKey(1,1));
}
}

_isBoardSolved() {
for (let r=0;r<this.curSize;r++) {
for (let c=0;c<this.curSize;c++) {
if (!this.grid[r][c]) return false;
}
}
return true;
}

_getBoardMetrics() {
const sz=this.curSize;
const spacing=sz===3?112 :86;
const total=(sz - 1)*spacing;
const ox=(this.W - total)*0.5;
const oy=(this.H - total)*0.5 + 18;
return {sz,spacing,ox,oy,nodeR:sz===3?26 :22};
}

_hitTest(lx,ly) {
const m=this._getBoardMetrics();
for (let r=0;r<m.sz;r++) {
for (let c=0;c<m.sz;c++) {
const nx=m.ox + c*m.spacing;
const ny=m.oy + r*m.spacing;
if (Math.hypot(lx - nx,ly - ny)<=m.nodeR + 12) {
return {r,c,nx,ny};
}
}
}
return null;
}

useHint() {
if (this.finished||this.roundClearPause>0) return;
if (this.hintsLeft<=0) return;
const firstKey=this.solutionSet.values().next().value;
if (!firstKey) return;
const [r,c]=firstKey.split("_").map(Number);
this.hintsLeft -=1;
this.hintNode={r,c};
this.hintTimer=3.5;
this.engine.playSfx("chime");
}

onPointerMove(lx,ly) {
this.hoverCell=this._hitTest(lx,ly);
}

onPointerDown(lx,ly) {
if (this.finished||this.roundClearPause>0) return;
const hit=this._hitTest(lx,ly);
if (!hit) return;
this._activateCell(hit.r,hit.c,hit.nx,hit.ny);
}

onKeyDown(code) {
if (code==="KeyH"||code==="Space") {
this.useHint();
}
}

_activateCell(r,c,nx,ny) {
this._toggleInGrid(this.grid,r,c,this.curSize);
const key=this._cellKey(r,c);
if (this.solutionSet.has(key)) this.solutionSet.delete(key);
else this.solutionSet.add(key);

this.movesLeft -=1;
this.movesUsedTotal +=1;
if (this.hintNode&&this.hintNode.r===r&&this.hintNode.c===c) {
this.hintNode=null;this.hintTimer=0;
}
this.fxRings.push({x:nx,y:ny,r:16,maxR:78,color:this.cfg.accent||"#7ef7f0",life:0.42,maxLife:0.42});
this.engine.playSfx("star");

if (this._isBoardSolved()) {
this.engine.playSfx("victory");
const m=this._getBoardMetrics();
for (let rr=0;rr<m.sz;rr++) {
for (let cc=0;cc<m.sz;cc++) {
this.fxRings.push({x:m.ox + cc*m.spacing,y:m.oy + rr*m.spacing,r:12,maxR:64,color:"#ffd700",life:0.65,maxLife:0.65});
}
}
if (this.round>=this.totalRounds) {
this.finished=true;
const efficiency=Math.min(1,this.timeLeft / Math.max(1,this.cfg.timeLimit*0.55));
const bonusMult=efficiency>0.65?1.45 :(efficiency>0.35?1.25 :1.10);
const grade=efficiency>0.65?"SS" :(efficiency>0.35?"S" :"A");
setTimeout(()=>{
this.engine.finishTrial({
success:true,
grade,
bonusMult,
summary:`Phá giải trọn vẹn ${this.totalRounds}/${this.totalRounds} Tinh Tượng Kỳ Cục trong ${this.movesUsedTotal} nước đi (còn ${Math.ceil(this.timeLeft)}s)!`
});
},550);
} else {
this.roundClearPause=0.95;
}
} else if (this.movesLeft<=0) {
this.finished=true;
this.engine.playSfx("fail");
this.engine.finishTrial({
success:false,
grade:"B",
bonusMult:0.45 + (this.round - 1)*0.12,
summary:`Hết số nước đi tại Ván ${this.round}/${this.totalRounds} — tâm thần bị kỳ trận phản phệ, kịp thu về một phần chân ý!`
});
}
}

update(dt) {
if (this.finished) return;
if (this.hintTimer>0) {
this.hintTimer=Math.max(0,this.hintTimer - dt);
if (this.hintTimer<=0) this.hintNode=null;
}
for (let i=this.fxRings.length - 1;i>=0;i--) {
this.fxRings[i].life -=dt;
if (this.fxRings[i].life<=0) this.fxRings.splice(i,1);
}
if (this.roundClearPause>0) {
this.roundClearPause -=dt;
if (this.roundClearPause<=0) {
this._generateRound(this.round + 1);
}
return;
}
this.timeLeft -=dt;
if (this.timeLeft<=0) {
this.timeLeft=0;
this.finished=true;
this.engine.playSfx("fail");
this.engine.finishTrial({
success:false,
grade:"B",
bonusMult:0.40 + (this.round - 1)*0.15,
summary:`Hết thời gian phá giải Ván ${this.round}/${this.totalRounds} — kịp giữ lại một phần lĩnh ngộ Trí Đạo!`
});
}
}

getHudInfo() {
return {
leftText:`Ván Kỳ Cục: ${this.round}/${this.totalRounds} | Nước còn: ${this.movesLeft}`,
rightText:`⏱️ ${Math.ceil(this.timeLeft)}s | 🧠 Thôi Diễn: ${this.hintsLeft}`,
actionButtons:[
{id:"hint",label:`🧠 Thôi Diễn Gợi Ý (${this.hintsLeft}) [H]`,onClick:()=>this.useHint(),disabled:this.hintsLeft<=0}
]
};
}

render(ctx,t) {
const W=this.W;const H=this.H;
const bg=ctx.createRadialGradient(W*0.5,H*0.5,40,W*0.5,H*0.5,W*0.65);
bg.addColorStop(0,this.cfg.bgA||"#0c1c38");
bg.addColorStop(1,this.cfg.bgB||"#040812");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

// Drifting background starfield
for (let i=0;i<this.stars.length;i++) {
const s=this.stars[i];
const a=0.25 + 0.55*(0.5 + 0.5*Math.sin(t*2.2 + s.ph));
ctx.fillStyle=`rgba(215,245,255,${a.toFixed(2)})`;
ctx.fillRect(s.x,s.y,s.r*1.5,s.r*1.5);
}

// Rotating Celestial Dao Ring behind board (ZERO setLineDash!)
const m=this._getBoardMetrics();
const bcx=W*0.5;const bcy=H*0.5 + 18;
const outerR=(m.sz*m.spacing)*0.56;
ctx.save();ctx.translate(bcx,bcy);ctx.rotate(t*0.18);
ctx.strokeStyle=this.cfg.accent||"#7ef7f0";ctx.globalAlpha=0.22;ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,outerR,0,Math.PI*2);ctx.stroke();
for (let k=0;k<8;k++) {
const a=(k*Math.PI)/4;
ctx.beginPath();ctx.moveTo(Math.cos(a)*(outerR - 8),Math.sin(a)*(outerR - 8));ctx.lineTo(Math.cos(a)*(outerR + 8),Math.sin(a)*(outerR + 8));ctx.stroke();
}
ctx.restore();

// Title & instructions
ctx.font="bold 15px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText(`✦ ${this.cfg.boardTitle||"TINH TƯỢNG KỲ CỤC"} — VÁN ${this.round}/${this.totalRounds} ✦`,W*0.5,32);
ctx.font="12px Georgia";ctx.fillStyle="#b8d4e8";
ctx.fillText("Chạm vào một Tinh Tử để đảo sáng/tối chính nó và 4 Tinh Tử liền kề (+) — Thắp sáng TẤT CẢ để phá trận!",W*0.5,54);

// Constellation connection lines
ctx.lineWidth=2.4;
for (let r=0;r<m.sz;r++) {
for (let c=0;c<m.sz;c++) {
const x1=m.ox + c*m.spacing;const y1=m.oy + r*m.spacing;
const lit1=this.grid[r][c];
if (c + 1<m.sz) {
const lit2=this.grid[r][c + 1];
ctx.strokeStyle=(lit1&&lit2)?(this.cfg.accent||"#7ef7f0") :"rgba(110,145,180,0.28)";
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1 + m.spacing,y1);ctx.stroke();
}
if (r + 1<m.sz) {
const lit2=this.grid[r + 1][c];
ctx.strokeStyle=(lit1&&lit2)?(this.cfg.accent||"#7ef7f0") :"rgba(110,145,180,0.28)";
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1,y1 + m.spacing);ctx.stroke();
}
}
}

// Star Nodes
for (let r=0;r<m.sz;r++) {
for (let c=0;c<m.sz;c++) {
const nx=m.ox + c*m.spacing;const ny=m.oy + r*m.spacing;
const lit=this.grid[r][c];
const isHovered=Boolean(this.hoverCell&&Math.abs(this.hoverCell.r - r) + Math.abs(this.hoverCell.c - c)<=1);
const isHint=Boolean(this.hintNode&&this.hintNode.r===r&&this.hintNode.c===c);

if (lit) {
ctx.fillStyle="rgba(126,247,240,0.18)";
ctx.beginPath();ctx.arc(nx,ny,m.nodeR + 10 + Math.sin(t*3 + r + c)*2,0,Math.PI*2);ctx.fill();
}
if (isHovered) {
ctx.strokeStyle="rgba(255,215,0,0.75)";ctx.lineWidth=2.2;
ctx.beginPath();ctx.arc(nx,ny,m.nodeR + 6,0,Math.PI*2);ctx.stroke();
}
if (isHint) {
ctx.strokeStyle="#ffd700";ctx.lineWidth=3.2;
ctx.beginPath();ctx.arc(nx,ny,m.nodeR + 10 + Math.sin(t*8)*4,0,Math.PI*2);ctx.stroke();
}

ctx.fillStyle=lit?(this.cfg.accent||"#7ef7f0") :"rgba(18,26,42,0.92)";
ctx.strokeStyle=lit?"#ffffff" :"rgba(120,155,195,0.55)";
ctx.lineWidth=lit?2.4 :1.6;
ctx.beginPath();ctx.arc(nx,ny,m.nodeR,0,Math.PI*2);ctx.fill();ctx.stroke();

// Inner 4-point star emblem
ctx.fillStyle=lit?"#ffffff" :"rgba(120,155,195,0.4)";
const sr=lit?m.nodeR*0.58 :m.nodeR*0.36;
ctx.beginPath();
ctx.moveTo(nx,ny - sr);ctx.lineTo(nx + sr*0.32,ny - sr*0.32);ctx.lineTo(nx + sr,ny);
ctx.lineTo(nx + sr*0.32,ny + sr*0.32);ctx.lineTo(nx,ny + sr);ctx.lineTo(nx - sr*0.32,ny + sr*0.32);
ctx.lineTo(nx - sr,ny);ctx.lineTo(nx - sr*0.32,ny - sr*0.32);ctx.closePath();ctx.fill();
}
}

// Expanding FX rings
for (let i=0;i<this.fxRings.length;i++) {
const fx=this.fxRings[i];
const ratio=Math.max(0,fx.life / fx.maxLife);
const rad=fx.r + (fx.maxR - fx.r)*(1 - ratio);
ctx.save();ctx.globalAlpha=ratio;ctx.strokeStyle=fx.color;ctx.lineWidth=2.6;
ctx.beginPath();ctx.arc(fx.x,fx.y,rad,0,Math.PI*2);ctx.stroke();ctx.restore();
}

if (this.roundClearPause>0) {
ctx.fillStyle="rgba(6,10,18,0.58)";ctx.fillRect(0,H*0.5 - 32,W,64);
ctx.font="bold 22px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText(`✨ PHÁ GIẢI VÁN ${this.round} THÀNH CÔNG!`,W*0.5,H*0.5 + 8);
}
}
}

global.DreamTrialStarChess=DreamTrialStarChess;
})(window);
