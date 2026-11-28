(function (global) {
"use strict";

function _hash(x,y,seed) {
const s=Math.sin((x + seed*1.37)*12.9898 + (y - seed*0.91)*78.233)*43758.5453;
return s - Math.floor(s);
}

function _hexToRgb(hex) {
if (!hex||typeof hex!=="string") return {r:24,g:28,b:32};
if (hex.startsWith("rgb")) {
const m=hex.match(/\d+/g);
if (m&&m.length>=3) return {r:Number(m[0])||0,g:Number(m[1])||0,b:Number(m[2])||0};
}
const clean=hex.replace("#","");
const full=clean.length===3?clean.split("").map(c=>c + c).join("") :clean;
const n=parseInt(full,16);
if (isNaN(n)) return {r:24,g:28,b:32};
return {r:(n>>16)&255,g:(n>>8)&255,b:n&255};
}

function _shadeHex(hex,delta) {
const c=_hexToRgb(hex);
const r=Math.max(0,Math.min(255,c.r + delta));
const g=Math.max(0,Math.min(255,c.g + delta));
const b=Math.max(0,Math.min(255,c.b + delta));
return `rgb(${r},${g},${b})`;
}

function _rgba(hex,a) {
const c=_hexToRgb(hex);
return `rgba(${c.r},${c.g},${c.b},${a})`;
}

// Determine liquid visual theme from stage theme
function getLiquidStyle(th,stageId) {
const pat=(th&&th.gridPattern)||"bamboo_grove";
const sid=stageId||"";
if (sid==="stage_3"||sid==="stage_14"||sid==="stage_19") {
return {
kind:"blood",
deep:"#47070e",
mid:"#7d0e1a",
shallow:"#b01c2b",
foam:"rgba(255,155,165,0.46)",
waveA:"rgba(255,95,105,0.28)",
waveB:"rgba(255,210,210,0.22)",
spark:"rgba(255,190,190,0.58)",
bankCol:"#38181a",
rippleCol:"rgba(255,135,145,0.72)"
};
}
if (sid==="stage_11"||pat==="lava_cracks") {
return {
kind:"lava",
deep:"#4a1004",
mid:"#9e2808",
shallow:"#e85a14",
foam:"rgba(255,220,110,0.52)",
waveA:"rgba(255,175,45,0.36)",
waveB:"rgba(255,245,175,0.28)",
spark:"rgba(255,248,195,0.75)",
bankCol:"#2b1a12",
rippleCol:"rgba(255,200,85,0.78)"
};
}
if (sid==="stage_6") {
return {
kind:"poison",
deep:"#1f102b",
mid:"#3a1d4f",
shallow:"#2b6e4d",
foam:"rgba(126,247,196,0.42)",
waveA:"rgba(92,232,168,0.26)",
waveB:"rgba(195,120,255,0.22)",
spark:"rgba(175,255,215,0.52)",
bankCol:"#24291b",
rippleCol:"rgba(126,247,196,0.70)"
};
}
if (sid==="stage_22") {
return {
kind:"time_river",
deep:"#1d3238",
mid:"#2c525c",
shallow:"#6b7d54",
foam:"rgba(255,236,160,0.48)",
waveA:"rgba(255,222,120,0.26)",
waveB:"rgba(126,247,240,0.24)",
spark:"rgba(255,250,205,0.68)",
bankCol:"#3d3522",
rippleCol:"rgba(255,232,145,0.75)"
};
}
// Default: Crystal Clear Jade-Blue Flowing Water (streams, rivers, lakes, oases, sea!)
const baseShallow=(th&&th.cShallow)||"#15526b";
const cDeep=_shadeHex(baseShallow,-22);
const cMid=baseShallow;
const cLit=_shadeHex(baseShallow,32);
return {
kind:"water",
deep:cDeep,
mid:cMid,
shallow:cLit,
foam:"rgba(220,250,255,0.48)",
waveA:"rgba(135,235,255,0.26)",
waveB:"rgba(255,255,255,0.22)",
spark:"rgba(235,255,255,0.68)",
bankCol:_shadeHex((th&&th.cPrimary)||"#16261d",16),
rippleCol:"rgba(205,248,255,0.78)"
};
}

// Pre-rendered seamless 128x128 tileable caustic & wave textures (cached per liquid kind -> 144 FPS!)
const _LIQUID_TEX_CACHE=new Map();
function _getLiquidTextures(style) {
const key=`${style.kind}_${style.mid}`;
let pair=_LIQUID_TEX_CACHE.get(key);
if (pair) return pair;

const sz=128;
// Layer A: Flowing smooth wave bands & depth troughs
const cA=document.createElement("canvas");
cA.width=sz;cA.height=sz;
const ctxA=cA.getContext("2d");
ctxA.strokeStyle=style.waveA;
ctxA.lineCap="round";
for (let row=0;row<4;row++) {
const y0=16 + row*32;
ctxA.lineWidth=3.2;
ctxA.beginPath();
for (let x=0;x<=sz;x+=8) {
const yy=y0 + Math.sin((x/sz)*Math.PI*2 + row*1.57)*5.5;
if (x===0) ctxA.moveTo(x,yy);else ctxA.lineTo(x,yy);
}
ctxA.stroke();
// Subtle darker trough beneath wave crest
ctxA.strokeStyle="rgba(0,12,24,0.16)";
ctxA.lineWidth=2.0;
ctxA.beginPath();
for (let x=0;x<=sz;x+=8) {
const yy=y0 + 5 + Math.sin((x/sz)*Math.PI*2 + row*1.57)*5.5;
if (x===0) ctxA.moveTo(x,yy);else ctxA.lineTo(x,yy);
}
ctxA.stroke();
ctxA.strokeStyle=style.waveA;
}

// Layer B: Crossing sunlit caustic light webs & crisp water sparkles
const cB=document.createElement("canvas");
cB.width=sz;cB.height=sz;
const ctxB=cB.getContext("2d");
ctxB.strokeStyle=style.waveB;
ctxB.lineWidth=1.6;
for (let k=0;k<4;k++) {
const y0=8 + k*32;
ctxB.beginPath();
for (let x=0;x<=sz;x+=8) {
const yy=y0 + Math.cos((x/sz)*Math.PI*2 - k*1.2)*4.2;
if (x===0) ctxB.moveTo(x,yy);else ctxB.lineTo(x,yy);
}
ctxB.stroke();
}
// Caustic diamond glints
ctxB.fillStyle=style.spark;
const glints=[[20,22,2.2],[74,14,1.8],[108,44,2.4],[42,58,1.9],[92,82,2.1],[18,98,1.7],[62,114,2.3],[116,108,1.6]];
for (const [gx,gy,gr] of glints) {
ctxB.beginPath();
ctxB.moveTo(gx,gy - gr*1.6);ctxB.lineTo(gx + gr,gy);ctxB.lineTo(gx,gy + gr*1.6);ctxB.lineTo(gx - gr,gy);
ctxB.closePath();ctxB.fill();
}

pair={canvasA:cA,canvasB:cB,patA:null,patB:null};
if (_LIQUID_TEX_CACHE.size>12) _LIQUID_TEX_CACHE.clear();
_LIQUID_TEX_CACHE.set(key,pair);
return pair;
}

// ==============================================================================
// 1. MULTI-LAYER ORGANIC TERRAIN CHUNK BAKER (SEAMLESS ROUNDED WATER SHORELINES!)
// ==============================================================================
function renderTerrainChunk(octx,map,cxIdx,cyIdx,TILE_TYPES) {
const chunkTiles=map._chunkSizeTiles;
const TS=map.tileSize;
const chunkPx=chunkTiles*TS;
const th=map.activeTheme;
const startCol=cxIdx*chunkTiles;
const startRow=cyIdx*chunkTiles;
const endCol=Math.min(map.cols,startCol + chunkTiles);
const endRow=Math.min(map.rows,startRow + chunkTiles);
const seed=Array.from(map.currentStageId||"stage_1").reduce((a,c)=>a + c.charCodeAt(0),0) % 89 + 7;
const pat=th.gridPattern||"bamboo_grove";
const liq=getLiquidStyle(th,map.currentStageId);

// 1A. Base fill
octx.fillStyle=th.cPrimary;
octx.fillRect(0,0,chunkPx,chunkPx);

// 1B. Multi-octave organic soil / moss / sand / snow patches
for (let i=0;i<22;i++) {
const h1=_hash(cxIdx*19 + i,cyIdx*23 + i,seed);
const h2=_hash(cxIdx*31 + i,cyIdx*13 + i,seed + 3);
const h3=_hash(cxIdx*7 + i,cyIdx*41 + i,seed + 9);
const px=h1*chunkPx;
const py=h2*chunkPx;
const rad=34 + h3*96;
const useSoil=(i % 3===0);
const col=useSoil?_shadeHex(th.cPath,-10) :th.cSecondary;
const g=octx.createRadialGradient(px,py,5,px,py,rad);
g.addColorStop(0,_rgba(col,useSoil?0.34 :0.62));
g.addColorStop(1,_rgba(col,0));
octx.fillStyle=g;
octx.beginPath();octx.arc(px,py,rad,0,Math.PI*2);octx.fill();
}

const cPathLight=_shadeHex(th.cPath,20);
const cPathDark=_shadeHex(th.cPath,-18);
const cWallTop=_shadeHex(th.cWall,24);
const cWallDark=_shadeHex(th.cWall,-26);
const cSpiritHi=_shadeHex(th.cSpirit,26);
const grassHi=_shadeHex(th.cSecondary,28);
const soilTone=_shadeHex(th.cPrimary,18);
const isW=(rr,cc)=>(rr>=0&&rr<map.rows&&cc>=0&&cc<map.cols&&map.grid[rr][cc]===TILE_TYPES.HAZARD_SHALLOW);

for (let r=startRow;r<endRow;r++) {
const ly=(r - startRow)*TS;
for (let c=startCol;c<endCol;c++) {
const lx=(c - startCol)*TS;
const tile=map.grid[r][c];
const n1=_hash(c,r,seed);
const n2=_hash(c + 17,r - 11,seed + 5);
const n3=_hash(c - 29,r + 37,seed + 13);

if (tile===TILE_TYPES.GROUND_PRIMARY||tile===TILE_TYPES.GROUND_SECONDARY) {
if (n1>0.60) {
octx.fillStyle=_rgba(th.cSecondary,0.42);
octx.beginPath();
octx.ellipse(lx + 16,ly + 16,13 + n2*7,8 + n2*5,n1*Math.PI,0,Math.PI*2);
octx.fill();
}
if (n3>0.82) {
octx.fillStyle=_rgba(soilTone,0.38);
octx.beginPath();
octx.ellipse(lx + 14,ly + 18,11,6.5,n2*2,0,Math.PI*2);
octx.fill();
}
if (pat==="sand_dunes") {
if ((r + c) % 2===0) {
octx.strokeStyle="rgba(255,222,165,0.12)";octx.lineWidth=1.5;
octx.beginPath();octx.moveTo(lx,ly + 14);octx.quadraticCurveTo(lx + 16,ly + 7,lx + TS,ly + 14);octx.stroke();
}
if (n2>0.84) {
octx.fillStyle="rgba(110,72,32,0.45)";
octx.beginPath();octx.arc(lx + 10 + n1*12,ly + 10 + n3*12,2.2,0,Math.PI*2);octx.fill();
}
} else if (pat==="ice_field") {
if (n1>0.65) {
octx.strokeStyle="rgba(210,245,255,0.18)";octx.lineWidth=1.1;
octx.beginPath();octx.moveTo(lx + 3,ly + 7);octx.lineTo(lx + 16,ly + 17);octx.lineTo(lx + 28,ly + 12);octx.stroke();
}
if (n2>0.82) {
octx.fillStyle="rgba(255,255,255,0.22)";
octx.beginPath();octx.arc(lx + 16,ly + 16,2.6,0,Math.PI*2);octx.fill();
}
} else if (pat==="blood_pool"||pat==="lava_cracks") {
if (n1>0.74) {
octx.strokeStyle=_rgba(th.cShallow,0.48);octx.lineWidth=1.3;
octx.beginPath();octx.moveTo(lx + 2,ly + 11);octx.lineTo(lx + 14,ly + 20);octx.lineTo(lx + 29,ly + 13);octx.stroke();
}
} else if (pat==="bamboo_grove"||pat==="ruined_fort"||pat==="bone_palace") {
if (n1>0.58) {
octx.strokeStyle=_rgba(grassHi,0.52);octx.lineWidth=1.15;
const gx=lx + 7 + n2*16;const gy=ly + 14 + n3*12;
octx.beginPath();
octx.moveTo(gx,gy);octx.lineTo(gx - 3.5,gy - 7);
octx.moveTo(gx,gy);octx.lineTo(gx + 0.5,gy - 8.5);
octx.moveTo(gx,gy);octx.lineTo(gx + 4,gy - 6.5);
octx.stroke();
}
if (n2>0.86) {
octx.fillStyle=n3>0.5?"rgba(255,232,140,0.45)" :"rgba(126,247,196,0.42)";
octx.beginPath();octx.arc(lx + 16,ly + 15,2.0,0,Math.PI*2);octx.fill();
}
}
if (n2>0.78&&n2<0.89) {
const px=lx + 6 + n1*18;const py=ly + 8 + n3*16;
octx.fillStyle="rgba(0,0,0,0.26)";
octx.beginPath();octx.ellipse(px + 1,py + 2,4.2,2.4,0,0,Math.PI*2);octx.fill();
octx.fillStyle=_rgba(_shadeHex(th.cWall,16),0.65);
octx.beginPath();octx.ellipse(px,py,3.8,2.1,n1,0,Math.PI*2);octx.fill();
}
} else if (tile===TILE_TYPES.ANCIENT_PATH) {
octx.fillStyle=cPathDark;
octx.fillRect(lx,ly,TS,TS);
const offX=(r % 2===0)?0 :5;
octx.fillStyle=n1>0.5?th.cPath :_shadeHex(th.cPath,7);
octx.fillRect(lx + 1.5,ly + 1.5,TS - 3,TS - 3);
octx.fillStyle=_rgba(cPathLight,0.35);
octx.fillRect(lx + 2,ly + 2,TS - 4,2.5);
octx.fillRect(lx + 2,ly + 2,2.5,TS - 4);
octx.strokeStyle="rgba(0,0,0,0.30)";octx.lineWidth=1;
octx.beginPath();octx.moveTo(lx + 13 + offX,ly + 2);octx.lineTo(lx + 13 + offX,ly + TS - 2);octx.stroke();
if (n3>0.82&&(pat==="bamboo_grove"||pat==="ruined_fort")) {
octx.fillStyle="rgba(46,160,92,0.42)";
octx.beginPath();octx.arc(lx + 13 + offX,ly + 16,3.2,0,Math.PI*2);octx.fill();
}
const upTile=r>0?map.grid[r - 1][c] :tile;
const dnTile=r<map.rows - 1?map.grid[r + 1][c] :tile;
if (upTile!==TILE_TYPES.ANCIENT_PATH&&upTile!==TILE_TYPES.SPIRIT_FLOOR) {
octx.fillStyle="rgba(212,175,55,0.28)";octx.fillRect(lx,ly,TS,2.5);
}
if (dnTile!==TILE_TYPES.ANCIENT_PATH&&dnTile!==TILE_TYPES.SPIRIT_FLOOR) {
octx.fillStyle="rgba(0,0,0,0.38)";octx.fillRect(lx,ly + TS - 3,TS,3);
}
} else if (tile===TILE_TYPES.SPIRIT_FLOOR) {
octx.fillStyle=_shadeHex(th.cSpirit,-14);
octx.fillRect(lx,ly,TS,TS);
octx.fillStyle=th.cSpirit;
octx.fillRect(lx + 1.5,ly + 1.5,TS - 3,TS - 3);
octx.strokeStyle=_rgba(cSpiritHi,0.38);octx.lineWidth=1;
octx.strokeRect(lx + 3,ly + 3,TS - 6,TS - 6);
if ((r + c) % 2===0) {
octx.fillStyle="rgba(255,228,148,0.18)";
octx.beginPath();
octx.moveTo(lx + 16,ly + 9);octx.lineTo(lx + 23,ly + 16);octx.lineTo(lx + 16,ly + 23);octx.lineTo(lx + 9,ly + 16);
octx.closePath();octx.fill();
}
} else if (tile===TILE_TYPES.HAZARD_SHALLOW) {
// SEAMLESS ORGANIC WATER BED — NO 32x32 BLOCKY BORDERS!
const wU=isW(r - 1,c);
const wD=isW(r + 1,c);
const wL=isW(r,c - 1);
const wR=isW(r,c + 1);
const isDeepCenter=(wU&&wD&&wL&&wR);

// Seamless deep/mid liquid fill (edge-to-edge, zero tile seams!)
octx.fillStyle=isDeepCenter?liq.deep :liq.mid;
octx.fillRect(lx,ly,TS,TS);

// Subtle organic depth blotch inside deep water
if (isDeepCenter&&n1>0.48) {
octx.fillStyle=_rgba(liq.mid,0.45);
octx.beginPath();
octx.ellipse(lx + 16,ly + 16,15,10,n2*Math.PI,0,Math.PI*2);
octx.fill();
}

// Shallow translucent shelf & smooth curved shore banks along land-touching edges!
if (!wU) {
const g=octx.createLinearGradient(lx,ly,lx,ly + 15);
g.addColorStop(0,liq.bankCol);g.addColorStop(0.28,"rgba(0,0,0,0.40)");g.addColorStop(0.55,_rgba(liq.shallow,0.65));g.addColorStop(1,"rgba(0,0,0,0)");
octx.fillStyle=g;octx.fillRect(lx,ly,TS,15);
}
if (!wD) {
const g=octx.createLinearGradient(lx,ly + TS,lx,ly + TS - 12);
g.addColorStop(0,liq.bankCol);g.addColorStop(0.32,_rgba(liq.shallow,0.7));g.addColorStop(1,"rgba(0,0,0,0)");
octx.fillStyle=g;octx.fillRect(lx,ly + TS - 12,TS,12);
}
if (!wL) {
const g=octx.createLinearGradient(lx,ly,lx + 12,ly);
g.addColorStop(0,liq.bankCol);g.addColorStop(0.32,_rgba(liq.shallow,0.62));g.addColorStop(1,"rgba(0,0,0,0)");
octx.fillStyle=g;octx.fillRect(lx,ly,12,TS);
}
if (!wR) {
const g=octx.createLinearGradient(lx + TS,ly,lx + TS - 12,ly);
g.addColorStop(0,liq.bankCol);g.addColorStop(0.32,_rgba(liq.shallow,0.62));g.addColorStop(1,"rgba(0,0,0,0)");
octx.fillStyle=g;octx.fillRect(lx + TS - 12,ly,12,TS);
}

// Round off convex corners with natural earth/bank arcs so water never looks like square blocks!
octx.fillStyle=th.cPrimary;
const cr=11;
if (!wU&& !wL) {octx.beginPath();octx.moveTo(lx,ly);octx.lineTo(lx + cr,ly);octx.quadraticCurveTo(lx,ly,lx,ly + cr);octx.closePath();octx.fill();}
if (!wU&& !wR) {octx.beginPath();octx.moveTo(lx + TS,ly);octx.lineTo(lx + TS - cr,ly);octx.quadraticCurveTo(lx + TS,ly,lx + TS,ly + cr);octx.closePath();octx.fill();}
if (!wD&& !wL) {octx.beginPath();octx.moveTo(lx,ly + TS);octx.lineTo(lx + cr,ly + TS);octx.quadraticCurveTo(lx,ly + TS,lx,ly + TS - cr);octx.closePath();octx.fill();}
if (!wD&& !wR) {octx.beginPath();octx.moveTo(lx + TS,ly + TS);octx.lineTo(lx + TS - cr,ly + TS);octx.quadraticCurveTo(lx + TS,ly + TS,lx + TS,ly + TS - cr);octx.closePath();octx.fill();}

// Submerged riverbed pebbles visible through clear shallow shore water!
if (!isDeepCenter&&n2>0.55&&liq.kind==="water") {
octx.fillStyle="rgba(22,42,48,0.45)";
octx.beginPath();octx.ellipse(lx + 10 + n1*12,ly + 11 + n3*10,3.8,2.2,n2,0,Math.PI*2);octx.fill();
}
} else if (tile===TILE_TYPES.CLIFF_BORDER) {
octx.fillStyle=cWallDark;
octx.fillRect(lx,ly,TS,TS);
octx.fillStyle=cWallTop;
octx.fillRect(lx + 1,ly,TS - 2,TS*0.58);
octx.fillStyle=th.cWall;
octx.fillRect(lx + 1,ly + TS*0.55,TS - 2,TS*0.33);
octx.fillStyle="rgba(255,255,255,0.18)";
octx.fillRect(lx + 2,ly + 1,TS - 4,3);
octx.strokeStyle="rgba(0,0,0,0.44)";octx.lineWidth=1.2;
octx.beginPath();
octx.moveTo(lx + 3,ly + TS*0.55);octx.lineTo(lx + 13 + n1*9,ly + TS*0.63);octx.lineTo(lx + TS - 2,ly + TS*0.52);
octx.stroke();
if (n3>0.65) {
octx.fillStyle=pat==="ice_field"?"rgba(230,248,255,0.5)" :_rgba(grassHi,0.38);
octx.fillRect(lx + 3,ly + 2,TS - 6,5);
}
octx.fillStyle="rgba(0,0,0,0.54)";
octx.fillRect(lx,ly + TS - 5,TS,5);
}
}
}
}

// ==============================================================================
// 2. REAL-TIME ANIMATED WATER SURFACE, FLOWING CAUSTICS, FOAM & SPLASH RIPPLES!
//    Uses 1 single clip path + 2 GPU-scrolled CanvasPatterns -> 144 FPS locked!
// ==============================================================================
function renderLiveWater(ctx,map,camX,camY,t,cStartX,cEndX,cStartY,cEndY) {
if (!map|| !map._waterSpansByChunk||map._waterSpansByChunk.size===0) return;
const th=map.activeTheme;
const style=getLiquidStyle(th,map.currentStageId);
const tex=_getLiquidTextures(style);
if (!tex.patA) tex.patA=ctx.createPattern(tex.canvasA,"repeat");
if (!tex.patB) tex.patB=ctx.createPattern(tex.canvasB,"repeat");

// Gather visible water spans & shore lines from visible chunks only
let hasWater=false;
ctx.save();
ctx.beginPath();
for (let cy=cStartY;cy<=cEndY;cy++) {
for (let cx=cStartX;cx<=cEndX;cx++) {
const spans=map._waterSpansByChunk.get(`${cx}_${cy}`);
if (!spans||spans.length===0) continue;
hasWater=true;
for (let i=0;i<spans.length;i++) {
const sp=spans[i];
ctx.rect(sp.x - camX,sp.y - camY,sp.w,sp.h);
}
}
}

if (hasWater) {
ctx.clip();
const vw=map.camera.width + 64;
const vh=map.camera.height + 64;

// Layer 1: Primary flowing water current waves scrolling smoothly
const flowX1=((t*24 - camX) % 128 + 128) % 128;
const flowY1=((Math.sin(t*0.9)*10 - camY) % 128 + 128) % 128;
ctx.save();
ctx.translate(flowX1 - 128,flowY1 - 128);
ctx.fillStyle=tex.patA;
ctx.fillRect(0,0,vw + 256,vh + 256);
ctx.restore();

// Layer 2: Counter-drifting sunlit caustics & shimmering highlights
const flowX2=((-t*14 - camX) % 128 + 128) % 128;
const flowY2=((t*11 - camY) % 128 + 128) % 128;
ctx.save();
ctx.globalAlpha=0.72 + Math.sin(t*2.4)*0.18;
ctx.translate(flowX2 - 128,flowY2 - 128);
ctx.fillStyle=tex.patB;
ctx.fillRect(0,0,vw + 256,vh + 256);
ctx.restore();
}
ctx.restore();

// Animated gentle shoreline foam waves pulsing along banks
if (hasWater&&map._waterShoresByChunk) {
const foamShift=Math.sin(t*2.8)*1.8;
const foamAlpha=0.30 + Math.sin(t*2.2)*0.12;
ctx.save();
ctx.strokeStyle=style.foam;
ctx.globalAlpha=foamAlpha;
ctx.lineWidth=2.0;
ctx.lineCap="round";
ctx.beginPath();
for (let cy=cStartY;cy<=cEndY;cy++) {
for (let cx=cStartX;cx<=cEndX;cx++) {
const shores=map._waterShoresByChunk.get(`${cx}_${cy}`);
if (!shores||shores.length===0) continue;
for (let i=0;i<shores.length;i++) {
const sh=shores[i];
const sx=sh.x1 - camX;
const sy=sh.y1 - camY;
const ex=sh.x2 - camX;
const ey=sh.y2 - camY;
if (sh.horiz) {
ctx.moveTo(sx,sy + foamShift);
ctx.lineTo(ex,ey + foamShift);
} else {
ctx.moveTo(sx + foamShift,sy);
ctx.lineTo(ex + foamShift,ey);
}
}
}
}
ctx.stroke();
ctx.restore();
}

// Dynamic expanding circular ripples & water splash droplets (from wading & jumping!)
const ripples=map.waterRipples;
if (ripples&&ripples.length>0) {
ctx.save();
const vw=map.camera.width;
const vh=map.camera.height;
for (let i=0;i<ripples.length;i++) {
const rp=ripples[i];
const sx=rp.x - camX;
const sy=rp.y - camY;
if (sx< -60||sy< -60||sx>vw + 60||sy>vh + 60) continue;
const ratio=rp.life / rp.maxLife;
const rad=rp.startR + (rp.maxR - rp.startR)*(1 - ratio);
ctx.globalAlpha=Math.max(0,ratio*0.85);
ctx.strokeStyle=rp.color||style.rippleCol;
ctx.lineWidth=rp.isSplash?2.2 :1.5;
ctx.beginPath();
ctx.ellipse(sx,sy,rad,rad*0.58,0,0,Math.PI*2);
ctx.stroke();
if (rp.isSplash&&rad>8) {
ctx.lineWidth=1.1;
ctx.beginPath();
ctx.ellipse(sx,sy,rad*0.62,rad*0.36,0,0,Math.PI*2);
ctx.stroke();
}
}
ctx.restore();
}
}

// ==============================================================================
// 3. FAST 144-FPS RESOURCE NODE PEDESTAL RENDERER (CACHED ICON SPRITE!)
// ==============================================================================
const _RES_ICON_CACHE=new Map();
function _getResIconCanvas(icon) {
let c=_RES_ICON_CACHE.get(icon);
if (c) return c;
c=document.createElement("canvas");
c.width=32;c.height=32;
const ictx=c.getContext("2d");
ictx.font="17px sans-serif";
ictx.textAlign="center";
ictx.textBaseline="middle";
ictx.fillText(icon||"💎",16,16);
_RES_ICON_CACHE.set(icon,c);
return c;
}
function renderResourceNode(ctx,nx,ny,node,t) {
const pulse=Math.sin(t*1.8 + node.x*0.02)*2.0;
const col=node.color||"#ffd700";
ctx.save();ctx.translate(nx,ny);
ctx.fillStyle=_rgba(col,0.16);ctx.beginPath();ctx.arc(0,2,25 + pulse,0,Math.PI*2);ctx.fill();
ctx.fillStyle=_rgba(col,0.22);ctx.beginPath();ctx.arc(0,2,18,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(14,18,26,0.92)";ctx.strokeStyle=col;ctx.lineWidth=1.7;
ctx.beginPath();
for (let i=0;i<8;i++) {
const a=(i*Math.PI)/4 + Math.PI/8;
const px=Math.cos(a)*16.5;const py=Math.sin(a)*12.5;
if (i===0) ctx.moveTo(px,py + 3);else ctx.lineTo(px,py + 3);
}
ctx.closePath();ctx.fill();ctx.stroke();
ctx.strokeStyle=_rgba(col,0.68);ctx.lineWidth=1.3;
const rot=t*0.7;
ctx.beginPath();
for (let k=0;k<4;k++) {
const a=rot + k*Math.PI*0.5;
ctx.moveTo(Math.cos(a)*21,3 + Math.sin(a)*16);
ctx.ellipse(0,3,21,16,0,a,a + 0.92);
}
ctx.stroke();
const bob=Math.sin(t*2.4 + node.y)*3.2;
const spr=_getResIconCanvas(node.icon);
ctx.drawImage(spr,-16,-18 + bob);
ctx.restore();
}
global.MapArtRenderer=global.MapArtRenderer||{};
global.MapArtRenderer._util={_hash,_hexToRgb,_shadeHex,_rgba};
global.MapArtRenderer.getLiquidStyle=getLiquidStyle;
global.MapArtRenderer.renderTerrainChunk=renderTerrainChunk;
global.MapArtRenderer.renderLiveWater=renderLiveWater;
global.MapArtRenderer.renderResourceNode=renderResourceNode;
})(window);
