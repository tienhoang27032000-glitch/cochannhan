(function (global) {
"use strict";

// ==============================================================================
// BLESSED LAND OPEN-WORLD EXPLORER — TRUE PROCEDURAL NON-REPEATING WORLD (v71)
// - Scale: 1 Mẫu = 3,600 m² | 1 m = 16 px (1 m² = 256 px², 1 tile 32x32 = 4 m²)
// - 100% Organic Non-Repeating Fractal Terrain (fBm + Domain Warping + Ridged Rivers)
// - 8 Natural Biomes blended smoothly per-tile (NO chunk grid, NO repeating modulo!)
// - Real full-world procedural biome/river Minimap + Live Biome HUD + Re-roll Seed!
// ==============================================================================

const CHUNK_PX=512;
const TILE_PX=32;
const CHUNK_TILES=16;
const MACRO_PX=2048;
const MACRO_CANVAS_PX=512;
const MACRO_TILES=64;
const MACRO_TILE_PX=8;
const ULTRA_PX=8192;
const ULTRA_CANVAS_PX=512;
const ULTRA_SAMPLES=128;
const ULTRA_CELL_WORLD=64;
const ULTRA_CELL_PX=4;
const SQM_PER_ACRE=3600;
const PX_PER_METER=16;

const SPEED_MODES=[
{id:"walk",label:"🚶 Đi Bộ (x1)",mult:1.0,color:"#7ef7c4"},
{id:"wind",label:"💨 Ngự Phong (x4)",mult:4.0,color:"#4ce6ff"},
{id:"void",label:"⚡ Độn Không (x14)",mult:14.0,color:"#ffd700"}
];



function _intHash(ix,iy,seed) {
let h=(Math.imul(ix | 0,374761393) + Math.imul(iy | 0,668265263) + Math.imul(seed | 0,1442695041)) | 0;
h=(h ^ (h >>> 13)) | 0;
h=Math.imul(h,1274126177);
h=(h ^ (h >>> 16)) >>> 0;
return h / 4294967296;
}

class BlessedLandExplorer {
constructor(sys) {
this.sys=sys;
this._screen=null;
this._canvas=null;
this._ctx=null;
this._rafId=null;
this._lastTs=0;
this._waterTex=null;
this._waterPat=null;
this._overviewCanvas=null;
this._bound=false;
this.active=false;
this.keys={};
this._ptrDown=false;
this._ptrX=0;
this._ptrY=0;

this._chunks=new Map();
this._chunkProps=new Map();
this._chunkWaterSpans=new Map();
this._chunkCreatures=new Map();
this._macroChunks=new Map();
this._macroWaterSpans=new Map();
this._ultraChunks=new Map();
this._ultraWaterSpans=new Map();

this.worldGen=null;
this.acres=1200;
this.totalSqM=1200*SQM_PER_ACRE;
this.sideMeters=Math.sqrt(this.totalSqM);
this.halfExtentMeters=this.sideMeters*0.5;
this.halfExtent=Math.round(this.halfExtentMeters*PX_PER_METER);
this.speedModeIdx=0;

this.pl={x:0,y:260,z:0,vz:0,jumpCount:0,maxJumps:2,spd:275,r:14,facing:"up",isMoving:false,isInWater:false,dashCd:0,_wRip:0};
this.cam={x:0,y:260,zoom:1.0};
this.petCreatures=[];
this.leaves=[];
this.ripples=[];
this.floats=[];
this.rockDebris=[];
this.projectiles=[];
this.aoeRings=[];
this.guCooldowns={};
this.killerCooldowns={};
this.speedBuffTimer=0;
this._lastHotbarSig="";
this._hudTick=0;
}

_computeWorldExtent() {
const g=this.sys&&this.sys.game;
const ap=g&&g.aperture;
let acres=1200;
if (ap&&ap.isImmortal&&ap.immortalAperture) {
acres=Math.max(100,Number(ap.immortalAperture.spaceAcres)||3200);
} else {
const rank=(ap&&ap.rank)?ap.rank :1;
const bCnt=this.sys?this.sys.getBuildingCount() :1;
acres=400 + rank*220 + bCnt*100;
}
this.acres=Math.round(acres);
this.totalSqM=this.acres*SQM_PER_ACRE;
this.sideMeters=Math.sqrt(this.totalSqM);
this.halfExtentMeters=this.sideMeters*0.5;
this.halfExtent=Math.max(960,Math.round(this.halfExtentMeters*PX_PER_METER));
}

_initWorldGenerator() {
const seed=(this.sys&&this.sys.worldSeed)?this.sys.worldSeed :Math.floor(100000 + Math.random()*900000000);
this.worldGen=new global.BlessedLandWorldGen(seed,this.halfExtent);
this._overviewCanvas=this.worldGen.buildOverviewMinimap(this.halfExtent,160);
}

_isWaterAtWorld(wx,wy) {
if (!this.worldGen) return false;
return this.worldGen.sampleTerrain(wx,wy).isWater;
}

_isInsideBoundary(wx,wy) {
return Math.abs(wx)<=this.halfExtent&&Math.abs(wy)<=this.halfExtent;
}

_getWaterPattern(ctx) {
if (this._waterPat) return this._waterPat;
const c=document.createElement("canvas");c.width=128;c.height=128;
const wctx=c.getContext("2d");
wctx.strokeStyle="rgba(145,245,255,0.28)";wctx.lineWidth=2.4;wctx.lineCap="round";
for (let row=0;row<4;row++) {
const y0=16 + row*32;
wctx.beginPath();
for (let x=0;x<=128;x+=8) {
const yy=y0 + Math.sin((x/128)*Math.PI*2 + row*1.5)*4.5;
if (x===0) wctx.moveTo(x,yy);else wctx.lineTo(x,yy);
}
wctx.stroke();
}
wctx.fillStyle="rgba(235,255,255,0.62)";
for (const [gx,gy] of [[24,22],[88,18],[44,68],[106,96],[20,108]]) {
wctx.fillRect(gx,gy,2.5,2.5);
}
this._waterTex=c;
this._waterPat=ctx.createPattern(c,"repeat");
return this._waterPat;
}

_getOrBuildChunk(cx,cy,allowBuild=true) {
const worldX0=cx*CHUNK_PX;
const worldY0=cy*CHUNK_PX;
const worldX1=worldX0 + CHUNK_PX;
const worldY1=worldY0 + CHUNK_PX;
if (worldX1< -this.halfExtent||worldX0>this.halfExtent||worldY1< -this.halfExtent||worldY0>this.halfExtent) {
return null;
}

const key=`${cx}_${cy}`;
const cached=this._chunks.get(key);
if (cached) {
this._chunks.delete(key);
this._chunks.set(key,cached);
return cached;
}
if (!allowBuild|| !this.worldGen) return null;

const off=document.createElement("canvas");
off.width=CHUNK_PX;off.height=CHUNK_PX;
const octx=off.getContext("2d");

const clipX0=Math.max(0,-this.halfExtent - worldX0);
const clipY0=Math.max(0,-this.halfExtent - worldY0);
const clipX1=Math.min(CHUNK_PX,this.halfExtent - worldX0);
const clipY1=Math.min(CHUNK_PX,this.halfExtent - worldY0);
const clipW=clipX1 - clipX0;
const clipH=clipY1 - clipY0;
if (clipW<=0||clipH<=0) return null;

const wg=this.worldGen;
const seed=wg.seed;
const startGX=cx*CHUNK_TILES;
const startGY=cy*CHUNK_TILES;

// Pre-sample 18x18 padded tile grid (1-tile border around 16x16) for seamless neighbor water & biome transitions!
const padN=CHUNK_TILES + 2;
const samples=new Array(padN*padN);
for (let py=0;py<padN;py++) {
const gy=startGY + py - 1;
const wy=gy*TILE_PX + 16;
for (let px=0;px<padN;px++) {
const gx=startGX + px - 1;
const wx=gx*TILE_PX + 16;
samples[py*padN + px]=wg.sampleTerrain(wx,wy);
}
}
const sampleAt=(lc,lr)=>samples[(lr + 1)*padN + (lc + 1)];

octx.save();
octx.beginPath();octx.rect(clipX0,clipY0,clipW,clipH);octx.clip();

const spans=[];
const props=[];
const chunkCreatures=[];

for (let lr=0;lr<CHUNK_TILES;lr++) {
const gy=startGY + lr;
const ly=lr*TILE_PX;
let runStart=-1;
for (let lc=0;lc<=CHUNK_TILES;lc++) {
const gx=startGX + lc;
const wx=gx*TILE_PX + 16;
const wy=gy*TILE_PX + 16;
const inB=(lc<CHUNK_TILES)&&this._isInsideBoundary(wx,wy);
const s=inB?sampleAt(lc,lr) :null;
const isW=Boolean(s&&s.isWater);

if (isW&&runStart=== -1) runStart=lc;
else if (!isW&&runStart!== -1) {
spans.push({x:worldX0 + runStart*TILE_PX,y:worldY0 + lr*TILE_PX,w:(lc - runStart)*TILE_PX,h:TILE_PX});
runStart=-1;
}
if (!inB|| !s) continue;

const lx=lc*TILE_PX;
const n1=_intHash(gx,gy,seed + 17);
const n2=_intHash(gx,gy,seed + 97);
const n3=_intHash(gx,gy,seed + 211);
const bm=s.biome;

if (isW) {
const wU=sampleAt(lc,lr - 1).isWater;
const wD=sampleAt(lc,lr + 1).isWater;
const wL=sampleAt(lc - 1,lr).isWater;
const wR=sampleAt(lc + 1,lr).isWater;
const isDeep=wU&&wD&&wL&&wR&&s.elev< -0.32;
octx.fillStyle=isDeep?"#0b364a" :(s.isLake?"#104963" :"#165c78");
octx.fillRect(lx,ly,TILE_PX,TILE_PX);

// Smooth natural shore shading & rounded convex corners (no blocky edges!)
if (!wU) {octx.fillStyle="rgba(22,38,30,0.52)";octx.fillRect(lx,ly,TILE_PX,6);octx.fillStyle="rgba(160,248,255,0.28)";octx.fillRect(lx,ly + 6,TILE_PX,2);}
if (!wD) {octx.fillStyle="rgba(155,245,255,0.28)";octx.fillRect(lx,ly + TILE_PX - 4,TILE_PX,4);}
if (!wL) {octx.fillStyle="rgba(22,38,30,0.42)";octx.fillRect(lx,ly,5,TILE_PX);}
if (!wR) {octx.fillStyle="rgba(22,38,30,0.42)";octx.fillRect(lx + TILE_PX - 5,ly,5,TILE_PX);}

const cr=10;
const landCol=sampleAt(lc,lr - 1).isWater?sampleAt(lc,lr + 1).biome.baseCol :sampleAt(lc,lr - 1).biome.baseCol;
octx.fillStyle=landCol||"#132d21";
if (!wU&& !wL) {octx.beginPath();octx.moveTo(lx,ly);octx.lineTo(lx + cr,ly);octx.quadraticCurveTo(lx,ly,lx,ly + cr);octx.closePath();octx.fill();}
if (!wU&& !wR) {octx.beginPath();octx.moveTo(lx + TILE_PX,ly);octx.lineTo(lx + TILE_PX - cr,ly);octx.quadraticCurveTo(lx + TILE_PX,ly,lx + TILE_PX,ly + cr);octx.closePath();octx.fill();}
if (!wD&& !wL) {octx.beginPath();octx.moveTo(lx,ly + TILE_PX);octx.lineTo(lx + cr,ly + TILE_PX);octx.quadraticCurveTo(lx,ly + TILE_PX,lx,ly + TILE_PX - cr);octx.closePath();octx.fill();}
if (!wD&& !wR) {octx.beginPath();octx.moveTo(lx + TILE_PX,ly + TILE_PX);octx.lineTo(lx + TILE_PX - cr,ly + TILE_PX);octx.quadraticCurveTo(lx + TILE_PX,ly + TILE_PX,lx + TILE_PX,ly + TILE_PX - cr);octx.closePath();octx.fill();}

if (!isDeep&&n1>0.945) props.push({x:wx,y:wy,type:"stone_lotus",isTree:false,isRock:false,hp:10,maxHp:10});
if (n2>0.964&&chunkCreatures.length<4&&global.BlessedLandCreatures) {
const sp=global.BlessedLandCreatures.pickSpeciesForBiome("water",n3);
chunkCreatures.push({
speciesId:sp.id,name:sp.name,habitat:sp.habitat,rarity:sp.rarity,scale:sp.scale,
x:wx,y:wy,homeX:wx,homeY:wy,vx:0,vy:0,spd:sp.spd,
timer:n3*2.5,phase:n1*6.28,faceDir:n1>0.5?1 :-1,isPet:false,radius:12,_ripCd:0
});
}
} else {
// Per-tile smoothly varied organic ground color
octx.fillStyle=s.isBeach?"#3d3828" :(n1>0.52?bm.baseCol :bm.altCol);
octx.fillRect(lx,ly,TILE_PX,TILE_PX);

// Subtle organic blotch blending so adjacent biomes & elevations merge naturally
if (n2>0.55) {
octx.fillStyle=s.isBeach?"rgba(195,175,120,0.16)" :(s.biomeId==="frost_peak"?"rgba(220,245,255,0.14)" :"rgba(255,255,255,0.04)");
octx.beginPath();octx.ellipse(lx + 16,ly + 16,14,9,n1*3.14,0,Math.PI*2);octx.fill();
}

const distC=Math.hypot(wx,wy);
if (distC<440&&(Math.abs(wx)<46||Math.abs(wy)<46||Math.abs(distC - 275)<26)) {
// Central Sanctuary carved jade pathways around player's built Resource Points
octx.fillStyle="#243a31";octx.fillRect(lx + 1,ly + 1,TILE_PX - 2,TILE_PX - 2);
octx.strokeStyle="rgba(126,247,196,0.18)";octx.strokeRect(lx + 2,ly + 2,TILE_PX - 4,TILE_PX - 4);
} else {
// Micro ground details tailored per biome
if (s.biomeId==="frost_peak") {
if (n1>0.68) {octx.strokeStyle="rgba(220,245,255,0.22)";octx.lineWidth=1;octx.beginPath();octx.moveTo(lx + 4,ly + 10);octx.lineTo(lx + 18,ly + 18);octx.stroke();}
} else if (s.biomeId==="peach_valley"&&n3>0.74) {
octx.fillStyle="rgba(255,170,215,0.42)";octx.beginPath();octx.arc(lx + 8 + n1*16,ly + 8 + n2*16,2.1,0,Math.PI*2);octx.fill();
} else if (s.biomeId==="crimson_autumn"&&n3>0.74) {
octx.fillStyle="rgba(230,90,45,0.40)";octx.beginPath();octx.arc(lx + 8 + n1*16,ly + 8 + n2*16,2.2,0,Math.PI*2);octx.fill();
} else if (n1>0.62&& !s.isBeach) {
octx.strokeStyle=s.biomeId==="crystal_glade"?"rgba(190,120,255,0.36)" :"rgba(78,175,112,0.44)";octx.lineWidth=1.1;
const gx0=lx + 7 + n2*16;const gy0=ly + 15 + n3*10;
octx.beginPath();octx.moveTo(gx0,gy0);octx.lineTo(gx0 - 3,gy0 - 7);octx.moveTo(gx0,gy0);octx.lineTo(gx0 + 3,gy0 - 6);octx.stroke();
}
if (n2>0.82&&n2<0.90) {
octx.fillStyle="rgba(120,128,124,0.52)";octx.beginPath();octx.ellipse(lx + 16,ly + 16,3.6,2.1,n1,0,Math.PI*2);octx.fill();
}
}

// Organic Fractal Forest Groves, Rocky Hills, Ground Cover & Wildlife (ZERO periodic waves!)
if (distC>450&&Math.abs(wx)<this.halfExtent - 48&&Math.abs(wy)<this.halfExtent - 48) {
const nearWater=sampleAt(lc + 1,lr).isWater||sampleAt(lc - 1,lr).isWater||sampleAt(lc,lr + 1).isWater||sampleAt(lc,lr - 1).isWater;
const fDens=wg.sampleForestDensity(wx,wy);
const rDens=wg.sampleRockDensity(wx,wy);

if (nearWater&&n1>0.84&&s.biomeId!=="frost_peak") {
props.push({x:wx,y:wy,type:"weeping_willow",isTree:true,isRock:false,swayPhase:n2*6.28,rustleTimer:0,leafCd:0});
} else if (!s.isBeach&&n1>(fDens>0.12?0.84 :(fDens> -0.15?0.935 :0.975))) {
const tPool=bm.trees;
const tType=tPool[Math.floor(n3*tPool.length) % tPool.length];
props.push({x:wx + (n2 - 0.5)*16,y:wy + (n1 - 0.5)*14,type:tType,isTree:true,isRock:false,swayPhase:n2*6.28,rustleTimer:0,leafCd:0});
} else if (n2>(s.biomeId==="rocky_badlands"?0.89 :(rDens>0.15?0.925 :0.968))) {
const rPool=bm.rocks;
const rType=rPool[Math.floor(n3*rPool.length) % rPool.length];
props.push({x:wx + (n1 - 0.5)*10,y:wy + (n2 - 0.5)*10,type:rType,isTree:false,isRock:true,radius:18,hp:60,maxHp:60,cracked:false,hitFlash:0,broken:false});
} else if (n1>0.78&&n1<=0.835) {
const gPool=bm.ground;
const gType=gPool[Math.floor(n3*gPool.length) % gPool.length];
if (global.MapArtRenderer&&typeof global.MapArtRenderer.renderProp==="function") {
global.MapArtRenderer.renderProp(octx,lx + 16,ly + 16,gType,0);
}
} else if (n2>0.962&&chunkCreatures.length<4&&global.BlessedLandCreatures) {
const sp=global.BlessedLandCreatures.pickSpeciesForBiome(s.biomeId,n3);
chunkCreatures.push({
speciesId:sp.id,name:sp.name,habitat:sp.habitat,rarity:sp.rarity,scale:sp.scale,
x:wx,y:wy,homeX:wx,homeY:wy,vx:0,vy:0,spd:sp.spd,
timer:n1*2.5,phase:n3*6.28,faceDir:n1>0.5?1 :-1,isPet:false,radius:13,_ripCd:0
});
}
}
}
}
}

octx.restore();
this._chunkWaterSpans.set(key,spans);
this._chunkProps.set(key,props);
this._chunkCreatures.set(key,chunkCreatures);

const cap=this._dynChunkCap||((document.body&&document.body.classList.contains("mobile-ui"))?56 :110);
while (this._chunks.size>=cap) {
const oldK=this._chunks.keys().next().value;
this._chunks.delete(oldK);
this._chunkWaterSpans.delete(oldK);
this._chunkProps.delete(oldK);
this._chunkCreatures.delete(oldK);
}
this._chunks.set(key,off);
return off;
}


_getOrBuildMacroChunk(mx,my,allowBuild=true) {
const worldX0=mx*MACRO_PX;
const worldY0=my*MACRO_PX;
const worldX1=worldX0 + MACRO_PX;
const worldY1=worldY0 + MACRO_PX;
if (worldX1< -this.halfExtent||worldX0>this.halfExtent||worldY1< -this.halfExtent||worldY0>this.halfExtent) {
return null;
}

const key=`${mx}_${my}`;
const cached=this._macroChunks.get(key);
if (cached) {
this._macroChunks.delete(key);
this._macroChunks.set(key,cached);
return cached;
}
if (!allowBuild|| !this.worldGen) return null;

const off=document.createElement("canvas");
off.width=MACRO_CANVAS_PX;off.height=MACRO_CANVAS_PX;
const octx=off.getContext("2d");

const scaleRatio=MACRO_CANVAS_PX / MACRO_PX; // 0.25 (512 / 2048)
const clipX0=Math.max(0,Math.floor((-this.halfExtent - worldX0)*scaleRatio));
const clipY0=Math.max(0,Math.floor((-this.halfExtent - worldY0)*scaleRatio));
const clipX1=Math.min(MACRO_CANVAS_PX,Math.ceil((this.halfExtent - worldX0)*scaleRatio));
const clipY1=Math.min(MACRO_CANVAS_PX,Math.ceil((this.halfExtent - worldY0)*scaleRatio));
if (clipX1<=clipX0||clipY1<=clipY0) return null;

const wg=this.worldGen;
const seed=wg.seed;
const startGX=mx*MACRO_TILES;
const startGY=my*MACRO_TILES;
const spans=[];

octx.save();
octx.beginPath();octx.rect(clipX0,clipY0,clipX1 - clipX0,clipY1 - clipY0);octx.clip();

// Render crisp 64x64 tile terrain + miniature trees, rocks & shoreline highlights onto 512x512 canvas!
for (let lr=0;lr<MACRO_TILES;lr++) {
const gy=startGY + lr;
const wy=gy*TILE_PX + 16;
const ly=lr*MACRO_TILE_PX;
let runStart=-1;
for (let lc=0;lc<=MACRO_TILES;lc++) {
const gx=startGX + lc;
const wx=gx*TILE_PX + 16;
const inB=(lc<MACRO_TILES)&&this._isInsideBoundary(wx,wy);
const s=inB?wg.sampleTerrain(wx,wy) :null;
const isW=Boolean(s&&s.isWater);

if (isW&&runStart=== -1) runStart=lc;
else if (!isW&&runStart!== -1) {
spans.push({x:worldX0 + runStart*TILE_PX,y:worldY0 + lr*TILE_PX,w:(lc - runStart)*TILE_PX,h:TILE_PX});
runStart=-1;
}
if (!inB|| !s) continue;

const lx=lc*MACRO_TILE_PX;
const n1=_intHash(gx,gy,seed + 17);
const n2=_intHash(gx,gy,seed + 97);
const bm=s.biome;

if (isW) {
octx.fillStyle=(s.elev< -0.32)?"#0b364a" :(s.isLake?"#104963" :"#165c78");
octx.fillRect(lx,ly,MACRO_TILE_PX,MACRO_TILE_PX);
if (n1>0.82) {
octx.fillStyle="rgba(165,245,255,0.22)";
octx.fillRect(lx + 1,ly + 3,MACRO_TILE_PX - 2,1.5);
}
} else {
const distC=Math.hypot(wx,wy);
if (distC<440&&(Math.abs(wx)<46||Math.abs(wy)<46||Math.abs(distC - 275)<26)) {
octx.fillStyle="#243a31";
octx.fillRect(lx,ly,MACRO_TILE_PX,MACRO_TILE_PX);
} else {
octx.fillStyle=s.isBeach?"#3d3828" :(n1>0.52?bm.baseCol :bm.altCol);
octx.fillRect(lx,ly,MACRO_TILE_PX,MACRO_TILE_PX);

// Crisp miniature trees & rock boulders matching exact detail-chunk positions!
if (distC>450&&Math.abs(wx)<this.halfExtent - 48&&Math.abs(wy)<this.halfExtent - 48) {
const fDens=wg.sampleForestDensity(wx,wy);
if (!s.isBeach&&n1>(fDens>0.12?0.84 :(fDens> -0.15?0.935 :0.975))) {
// Shadow + layered crisp tree canopy
octx.fillStyle="rgba(0,0,0,0.34)";
octx.beginPath();octx.arc(lx + 5,ly + 5.5,4.2,0,Math.PI*2);octx.fill();
octx.fillStyle=bm.treeCol||"#287a4e";
octx.beginPath();octx.arc(lx + 4,ly + 3.5,4.0,0,Math.PI*2);octx.fill();
octx.fillStyle="rgba(255,255,255,0.18)";
octx.beginPath();octx.arc(lx + 3,ly + 2.5,1.8,0,Math.PI*2);octx.fill();
} else if (n2>(s.biomeId==="rocky_badlands"?0.89 :0.935)) {
octx.fillStyle=bm.rockCol||"#707872";
octx.fillRect(lx + 2,ly + 2,4.2,3.6);
octx.fillStyle="rgba(255,255,255,0.22)";
octx.fillRect(lx + 2,ly + 2,3.5,1.2);
}
}
}
}
}
}

octx.restore();
this._macroWaterSpans.set(key,spans);

const mCap=(document.body&&document.body.classList.contains("mobile-ui"))?36 :64;
while (this._macroChunks.size>=mCap) {
const oldK=this._macroChunks.keys().next().value;
this._macroChunks.delete(oldK);
this._macroWaterSpans.delete(oldK);
}
this._macroChunks.set(key,off);
return off;
}


_getOrBuildUltraChunk(ux,uy,allowBuild=true) {
const worldX0=ux*ULTRA_PX;
const worldY0=uy*ULTRA_PX;
const worldX1=worldX0 + ULTRA_PX;
const worldY1=worldY0 + ULTRA_PX;
if (worldX1< -this.halfExtent||worldX0>this.halfExtent||worldY1< -this.halfExtent||worldY0>this.halfExtent) {
return null;
}

const key=`${ux}_${uy}`;
const cached=this._ultraChunks.get(key);
if (cached) {
this._ultraChunks.delete(key);
this._ultraChunks.set(key,cached);
return cached;
}
if (!allowBuild|| !this.worldGen) return null;

const off=document.createElement("canvas");
off.width=ULTRA_CANVAS_PX;off.height=ULTRA_CANVAS_PX;
const octx=off.getContext("2d");

const scaleRatio=ULTRA_CANVAS_PX / ULTRA_PX; // 512 / 8192 = 0.0625
const clipX0=Math.max(0,Math.floor((-this.halfExtent - worldX0)*scaleRatio));
const clipY0=Math.max(0,Math.floor((-this.halfExtent - worldY0)*scaleRatio));
const clipX1=Math.min(ULTRA_CANVAS_PX,Math.ceil((this.halfExtent - worldX0)*scaleRatio));
const clipY1=Math.min(ULTRA_CANVAS_PX,Math.ceil((this.halfExtent - worldY0)*scaleRatio));
if (clipX1<=clipX0||clipY1<=clipY0) return null;

const wg=this.worldGen;
const seed=wg.seed;
const spans=[];

octx.save();
octx.beginPath();octx.rect(clipX0,clipY0,clipX1 - clipX0,clipY1 - clipY0);octx.clip();

for (let lr=0;lr<ULTRA_SAMPLES;lr++) {
const wy=worldY0 + lr*ULTRA_CELL_WORLD + ULTRA_CELL_WORLD*0.5;
const ly=lr*ULTRA_CELL_PX;
let runStart=-1;
for (let lc=0;lc<=ULTRA_SAMPLES;lc++) {
const wx=worldX0 + lc*ULTRA_CELL_WORLD + ULTRA_CELL_WORLD*0.5;
const inB=(lc<ULTRA_SAMPLES)&&this._isInsideBoundary(wx,wy);
const s=inB?wg.sampleTerrain(wx,wy) :null;
const isW=Boolean(s&&s.isWater);

if (isW&&runStart=== -1) runStart=lc;
else if (!isW&&runStart!== -1) {
spans.push({x:worldX0 + runStart*ULTRA_CELL_WORLD,y:worldY0 + lr*ULTRA_CELL_WORLD,w:(lc - runStart)*ULTRA_CELL_WORLD,h:ULTRA_CELL_WORLD});
runStart=-1;
}
if (!inB|| !s) continue;

const lx=lc*ULTRA_CELL_PX;
const n1=_intHash(ux*ULTRA_SAMPLES + lc,uy*ULTRA_SAMPLES + lr,seed + 43);
const bm=s.biome;

if (isW) {
octx.fillStyle=(s.elev< -0.32)?"#0b364a" :(s.isLake?"#104963" :"#176280");
octx.fillRect(lx,ly,ULTRA_CELL_PX,ULTRA_CELL_PX);
} else {
octx.fillStyle=s.isBeach?"#3d3828" :(n1>0.52?bm.baseCol :bm.altCol);
octx.fillRect(lx,ly,ULTRA_CELL_PX,ULTRA_CELL_PX);
// Subtle forest cluster dither on continent view so jungles & peach valleys stay rich & textured
const fDens=wg.sampleForestDensity(wx,wy);
if (!s.isBeach&&fDens>0.06&&n1>0.46) {
octx.fillStyle=bm.treeCol||"#287a4e";
octx.fillRect(lx + 0.5,ly + 0.5,ULTRA_CELL_PX - 1,ULTRA_CELL_PX - 1);
}
}
}
}

octx.restore();
this._ultraWaterSpans.set(key,spans);

const uCap=(document.body&&document.body.classList.contains("mobile-ui"))?24 :48;
while (this._ultraChunks.size>=uCap) {
const oldK=this._ultraChunks.keys().next().value;
this._ultraChunks.delete(oldK);
this._ultraWaterSpans.delete(oldK);
}
this._ultraChunks.set(key,off);
return off;
}

_ensureDOM() {
if (this._screen) return this._screen;
let scr=document.getElementById("bl-explorer-screen");
if (!scr) {
scr=document.createElement("div");
scr.id="bl-explorer-screen";
scr.className="dream-realm-screen hidden";
scr.innerHTML=`
<div class="dream-topbar" style="border-color:#5cc995;">
<div class="dream-top-title">
<strong id="ble-title" style="color:#7ef7c4;font-size:15px;">🏡 Bên Trong Phúc Địa</strong>
<span id="ble-sub" class="sub-text" style="color:#ffd700;"></span>
</div>
<div class="dream-top-stats">
<span id="ble-ess-pill" class="badge" style="border-color:#7ef7c4;color:#7ef7c4;">💧 100%</span>
<span id="ble-coord" class="badge" style="border-color:#4ce6ff;color:#4ce6ff;">📍 (0m, 0m)</span>
<button id="ble-zoom-out" class="btn-mini" title="Mở rộng tầm nhìn (-)">➖</button>
<button id="ble-zoom-lbl" class="btn-mini" title="Đặt lại 100% (Phím 0)" style="min-width:48px;color:#ffd700;">100%</button>
<button id="ble-zoom-in" class="btn-mini" title="Phóng gần (+)">➕</button>
<button id="ble-btn-bag" class="btn-mini btn-secondary" title="Mở Kho Đồ / Hành Trang (Phím I)">🎒 Kho Đồ [I]</button>
<button id="ble-btn-aperture" class="btn-mini btn-accent" title="Mở Không Khiếu & Kho Cổ Trùng (Phím O)">☯️ Khiếu/Cổ [O]</button>
<button id="ble-btn-collect" class="btn-mini btn-primary">🌾 Thu Hoạch [E]</button>
<button id="ble-btn-exit" class="btn-danger" style="padding:5px 10px;font-size:11.5px;">↩️ Rời Phúc Địa</button>
</div>
</div>
<div class="dream-stage-wrap">
<canvas id="blExplorerCanvas"></canvas>
</div>
<div id="ble-gu-hotbar" class="ble-gu-hotbar"></div>
<div class="dream-action-bar">
<button id="ble-act-speed" class="btn-primary dream-act-btn">🚶 Đi Bộ (x1) [F]</button>
<button id="ble-act-hit" class="btn-secondary dream-act-btn">⛏️ Đập Đá [Click/J]</button>
<button id="ble-act-jump" class="btn-accent dream-act-btn">🦘 Nhảy [SPACE]</button>
<button id="ble-act-dash" class="btn-secondary dream-act-btn">💨 Lướt [G]</button>
<button id="ble-act-bestiary" class="btn-accent dream-act-btn" title="Xem toàn bộ 20 loài sinh vật trong Phúc Địa">🐾 Đồ Giám (0/20)</button>
<button id="ble-act-reroll" class="btn-secondary dream-act-btn" title="Tạo ngẫu nhiên địa hình, sông hồ & sinh cảnh hoàn toàn mới">🎲 Tái Tạo Địa Mạch</button>
<button id="ble-act-edge" class="btn-secondary dream-act-btn">🧭 Tới Khiếu Bích</button>
<button id="ble-act-home" class="btn-secondary dream-act-btn">🏡 Trung Tâm (0m)</button>
</div>
`;
document.body.appendChild(scr);
}
this._screen=scr;
this._canvas=scr.querySelector("#blExplorerCanvas");
this._ctx=this._canvas.getContext("2d",{alpha:false})||this._canvas.getContext("2d");

if (!this._bound) {
this._bound=true;
scr.querySelector("#ble-btn-exit").addEventListener("click",()=>this.close());
scr.querySelector("#ble-zoom-out").addEventListener("click",()=>{this._adjustZoom(-0.15);});
scr.querySelector("#ble-zoom-lbl").addEventListener("click",()=>{this._setZoom(1.0);
this._syncBestiaryBtn();
this._syncGuHotbar(true);});
scr.querySelector("#ble-zoom-in").addEventListener("click",()=>{this._adjustZoom(0.15);});
scr.querySelector("#ble-btn-bag").addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("bag");});
scr.querySelector("#ble-btn-aperture").addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("gu");});
scr.querySelector("#ble-btn-collect").addEventListener("click",()=>this._interactOrHarvest());
scr.querySelector("#ble-act-speed").addEventListener("click",()=>this._cycleSpeedMode());
scr.querySelector("#ble-act-hit").addEventListener("click",()=>this._strikeNearbyRocks());
scr.querySelector("#ble-act-jump").addEventListener("click",()=>this._triggerJump());
scr.querySelector("#ble-act-dash").addEventListener("click",()=>this._triggerDash());
scr.querySelector("#ble-act-bestiary").addEventListener("click",()=>this._openBestiaryModal());
scr.querySelector("#ble-act-reroll").addEventListener("click",()=>{
if (!this.sys) return;
this.sys.regenerateWorldSeed();
this._chunks.clear();
this._chunkProps.clear();
this._chunkWaterSpans.clear();
this._chunkCreatures.clear();
this._macroChunks.clear();
this._macroWaterSpans.clear();
this._ultraChunks.clear();
this._ultraWaterSpans.clear();
this._initWorldGenerator();
this.pl.x=0;this.pl.y=260;this.cam.x=0;this.cam.y=260;
this.floats.push({x:0,y:215,text:`🎲 Địa Mạch Mới (#${this.worldGen.seed % 100000})!`,color:"#ffd700",life:1.6,maxLife:1.6});
});
scr.querySelector("#ble-act-edge").addEventListener("click",()=>{
const targetX=Math.max(0,this.halfExtent - 140);
this.pl.x=targetX;this.pl.y=0;this.cam.x=targetX;this.cam.y=0;
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:`⚡ Khiếu Bích Đông (${Math.round(this.halfExtentMeters)}m)!`,color:"#7ef7f0",life:1.5,maxLife:1.5});
});
scr.querySelector("#ble-act-home").addEventListener("click",()=>{this.pl.x=0;this.pl.y=260;this.cam.x=0;this.cam.y=260;});

this._canvas.addEventListener("wheel",(e)=>{
if (!this.active) return;
e.preventDefault();
this._adjustZoom(e.deltaY<0?0.10 :-0.10);
},{passive:false});
// Two-finger Pinch-to-Zoom on Mobile inside Blessed Land Explorer!
this._blePtrs=new Map();
this._blePinchDist=0;
this._blePinchZoom=1.0;

this._canvas.addEventListener("pointerdown",(e)=>{
if (!this.active) return;
e.preventDefault();
this._blePtrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
if (this._blePtrs.size===2) {
const pts=Array.from(this._blePtrs.values());
this._blePinchDist=Math.hypot(pts[1].x - pts[0].x,pts[1].y - pts[0].y);
this._blePinchZoom=this.cam.zoom||1.0;
this._ptrDown=false;
return;
}
this._ptrDown=true;
const rect=this._canvas.getBoundingClientRect();
this._ptrX=e.clientX - rect.left;this._ptrY=e.clientY - rect.top;
this._strikeNearbyRocks();
});
this._canvas.addEventListener("pointermove",(e)=>{
if (!this.active) return;
if (this._blePtrs.has(e.pointerId)) {
this._blePtrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
if (this._blePtrs.size===2&&this._blePinchDist>10) {
const pts=Array.from(this._blePtrs.values());
const nd=Math.hypot(pts[1].x - pts[0].x,pts[1].y - pts[0].y);
this._setZoom(this._blePinchZoom*(nd / this._blePinchDist));
return;
}
}
const rect=this._canvas.getBoundingClientRect();
this._ptrX=e.clientX - rect.left;this._ptrY=e.clientY - rect.top;
});
const endP=(e)=>{
if (e&&this._blePtrs) this._blePtrs.delete(e.pointerId);
if (!this._blePtrs||this._blePtrs.size<2) this._blePinchDist=0;
if (!this._blePtrs||this._blePtrs.size===0) this._ptrDown=false;
};
window.addEventListener("pointerup",endP);
window.addEventListener("pointercancel",endP);

window.addEventListener("keydown",(e)=>{
if (!this.active) return;
if (global.vanCoSettings&&(global.vanCoSettings.isOpen()||global.vanCoSettings.isListeningKey())) return;
if (global.vanCoQuickBag&&global.vanCoQuickBag.isOpen()) return;
const st=global.vanCoSettings;
const code=e.code;
const isK=(act,fb)=>st?st.isActionKey(act,code) :(code===fb);
this.keys[code]=true;
if (code==="Escape") {e.preventDefault();this.close();return;}
if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(code)) e.preventDefault();
if (isK("jump","Space")) this._triggerJump();
else if (isK("dash","KeyG")||code==="ShiftLeft") this._triggerDash();
else if (isK("interact","KeyE")) this._interactOrHarvest();
else if (code==="KeyJ") this._strikeNearbyRocks();
else if (code==="KeyF") this._cycleSpeedMode();
else if (code==="Equal"||code==="NumpadAdd") {e.preventDefault();this._adjustZoom(0.10);}
else if (code==="Minus"||code==="NumpadSubtract") {e.preventDefault();this._adjustZoom(-0.10);}
else if (code==="Digit0"||code==="Numpad0") {e.preventDefault();this._setZoom(1.0);}
else if (!e.repeat) {
for (let s=0;s<8;s++) {
if (isK(`gu${s}`,`Digit${s + 1}`)) {e.preventDefault();this._castEquippedGuSlot(s);return;}
}
const kDefs=["KeyZ","KeyX","KeyC","KeyV"];
for (let k=0;k<4;k++) {
if (isK(`killer${k}`,kDefs[k])) {e.preventDefault();this._castEquippedKillerSlot(k);return;}
}
}
});
window.addEventListener("keyup",(e)=>{this.keys[e.code]=false;});
window.addEventListener("resize",()=>{if (this.active) this._handleResize();});
}
return scr;
}

_setZoom(zVal) {
const clamped=Math.max(0.05,Math.min(20.0,Number(zVal)||1.0));
this.cam.zoom=Number(clamped.toFixed(3));
const zEl=this._screen&&this._screen.querySelector("#ble-zoom-lbl");
if (zEl) zEl.textContent=`${Math.round(this.cam.zoom*100)}%`;
return this.cam.zoom;
}
_adjustZoom(delta) {
const cur=this.cam.zoom||1.0;
const steps=Math.abs(delta) / 0.10;
const mult=delta>=0?Math.pow(1.18,steps) :Math.pow(1 / 1.18,steps);
return this._setZoom(cur*mult);
}
_cycleSpeedMode() {
this.speedModeIdx=(this.speedModeIdx + 1) % SPEED_MODES.length;
const m=SPEED_MODES[this.speedModeIdx];
const btn=this._screen&&this._screen.querySelector("#ble-act-speed");
if (btn) {
btn.textContent=`${m.label} [F]`;
btn.style.borderColor=m.color;
btn.style.color=m.color;
}
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:m.label,color:m.color,life:1.0,maxLife:1.0});
}

_handleResize() {
if (!this._canvas|| !this._screen) return;
const wrap=this._screen.querySelector(".dream-stage-wrap");
const w=Math.max(320,(wrap?wrap.clientWidth :window.innerWidth) - 8);
const h=Math.max(240,(wrap?wrap.clientHeight :window.innerHeight - 130) - 8);
this._canvas.width=w;this._canvas.height=h;
this._canvas.style.width=`${w}px`;this._canvas.style.height=`${h}px`;
}

_spawnPasturePets() {
this.petCreatures=[];
const army=this.sys&&this.sys.game&&this.sys.game.beastArmy;
const plots=this.sys?this.sys.plots :[];
for (let i=0;i<plots.length;i++) {
const p=plots[i];
if (p&&p.typeId==="beast_pasture"&&p.beastUid&&army) {
const rec=army.getStoredBeast(p.beastUid);
if (rec) {
const pos=this._getBuildingWorldPos(i);
this.petCreatures.push({
typeId:rec.typeId||"green_wolf",name:rec.name,icon:rec.icon||"🐺",color:rec.color||"#5cc995",
x:pos.x + 24,y:pos.y + 18,homeX:pos.x,homeY:pos.y,
vx:0,vy:0,spd:72,timer:1.5,phase:i*1.3,faceDir:1,isPet:true,radius:16
});
}
}
}
// Also populate 10 vibrant ambient sanctuary wildlife around the central meadow so the Blessed Land feels alive immediately!
if (global.BlessedLandCreatures) {
const starterIds=["bach_loc","ngoc_tho","thanh_diep","hoang_kim_phong","linh_ho","tien_hac","kim_tri","hoa_linh_vien","truc_hung","luc_khong_tuoc"];
for (let k=0;k<starterIds.length;k++) {
const sp=global.BlessedLandCreatures.getSpecies(starterIds[k]);
const ang=(Math.PI*2*k)/starterIds.length + 0.25;
const rad=210 + (k % 3)*75;
const sx=Math.cos(ang)*rad;
const sy=Math.sin(ang)*rad;
this.petCreatures.push({
speciesId:sp.id,name:sp.name,habitat:sp.habitat,rarity:sp.rarity,scale:sp.scale,
x:sx,y:sy,homeX:sx,homeY:sy,vx:0,vy:0,spd:sp.spd,
timer:k*0.6,phase:k*1.1,faceDir:Math.cos(ang)>=0?1 :-1,isPet:false,isSanctuaryWild:true,radius:13,_ripCd:0
});
}
}
}
_syncBestiaryBtn() {
const btn=this._screen&&this._screen.querySelector("#ble-act-bestiary");
if (!btn) return;
const cnt=(this.sys&&Array.isArray(this.sys.discoveredSpecies))?this.sys.discoveredSpecies.length :0;
const tot=global.BlessedLandCreatures?global.BlessedLandCreatures.SPECIES_LIST.length :20;
btn.textContent=`🐾 Đồ Giám (${cnt}/${tot})`;
}
_openBestiaryModal() {
const C=global.BlessedLandCreatures;
if (!C) return;
let modal=document.getElementById("ble-bestiary-modal");
if (!modal) {
modal=document.createElement("div");
modal.id="ble-bestiary-modal";
modal.className="modal-backdrop hidden";
modal.style.position="fixed";
modal.style.zIndex="275";
modal.innerHTML=`
<div class="modal-window" style="max-width:860px;width:94vw;max-height:88dvh;display:flex;flex-direction:column;border-color:#5cc995;">
<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
<div>
<h2 id="ble-bestiary-title" style="margin:0;color:#ffd700;font-size:17px;">🐾 Phúc Địa Bách Thú Đồ Giám (20 Loài Sinh Vật)</h2>
<span class="sub-text" style="color:#7ef7c4;">Khám phá các sinh cảnh khác nhau trong Phúc Địa để gặp gỡ & ghi nhận đủ 20 loài linh thú!</span>
</div>
<button id="ble-bestiary-close" class="btn-mini btn-danger">✕ Đóng</button>
</div>
<div id="ble-bestiary-grid" class="ble-bestiary-grid" style="overflow-y:auto;padding:12px 14px;"></div>
</div>`;
document.body.appendChild(modal);
modal.querySelector("#ble-bestiary-close").addEventListener("click",()=>modal.classList.add("hidden"));
modal.addEventListener("click",(e)=>{if (e.target===modal) modal.classList.add("hidden");});
}
const discSet=new Set((this.sys&&Array.isArray(this.sys.discoveredSpecies))?this.sys.discoveredSpecies :[]);
modal.querySelector("#ble-bestiary-title").textContent=`🐾 Phúc Địa Bách Thú Đồ Giám (${discSet.size} / ${C.SPECIES_LIST.length} Loài Đã Gặp)`;
const bNames=global.VanCoBlessedLandBiomes||{};
const grid=modal.querySelector("#ble-bestiary-grid");
grid.innerHTML=C.SPECIES_LIST.map(sp=>{
const found=discSet.has(sp.id);
const habLbl=sp.habitat==="water"?"🌊 Thủy Sinh" :(sp.habitat==="air"?"🕊️ Phi Hành" :"🌿 Lục Địa");
const rCol=sp.rarity==="Linh Thú"?"#ffd700" :(sp.rarity==="Hiếm"?"#c278ff" :"#7ef7c4");
const bioText=sp.biomes.map(bid=>(bNames[bid]&&bNames[bid].name)||bid).join(", ");
return `
<div class="ble-bestiary-card ${found?"found" :""}" style="border-color:${found?rCol :"#3a3e47"};">
<canvas class="ble-bestiary-cv" data-spid="${sp.id}" width="92" height="74"></canvas>
<div class="ble-bestiary-info">
<div style="display:flex;justify-content:space-between;align-items:center;gap:4px;">
<strong style="color:${found?rCol :"#d0d6dc"};font-size:12.5px;">${sp.name}</strong>
<span class="badge" style="border-color:${rCol};color:${rCol};font-size:9.5px;padding:1px 5px;">${sp.rarity}</span>
</div>
<div class="sub-text" style="font-size:10.5px;color:#7ef7f0;">${habLbl} • ${found?"✅ Đã gặp" :"🔍 Chưa gặp"}</div>
<div class="sub-text" style="font-size:10.5px;margin-top:2px;">${sp.desc}</div>
<div class="sub-text" style="font-size:10px;color:#b89758;margin-top:2px;">📍 ${bioText}</div>
</div>
</div>`;
}).join("");
grid.querySelectorAll(".ble-bestiary-cv").forEach(cv=>{
C.renderPortraitToCanvas(cv,cv.getAttribute("data-spid"));
});
modal.classList.remove("hidden");
if (global.vanCoSfx) global.vanCoSfx.play("click");
}

_getBuildingWorldPos(idx) {
const D=global.VanCoBlessedLandData;
const r=Math.floor(idx / D.GRID_COLS);
const c=idx % D.GRID_COLS;
return {x:(c - 2)*145,y:(r - 1.5)*135};
}

open() {
this._computeWorldExtent();
this._chunks.clear();
this._chunkProps.clear();
this._chunkWaterSpans.clear();
this._chunkCreatures.clear();
this._macroChunks.clear();
this._macroWaterSpans.clear();
this._ultraChunks.clear();
this._ultraWaterSpans.clear();
this._initWorldGenerator();
this.speedModeIdx=0;
this.pl={x:0,y:260,z:0,vz:0,jumpCount:0,maxJumps:2,spd:275,r:14,facing:"up",isMoving:false,isInWater:false,dashCd:0,_wRip:0};
this.cam={x:0,y:260,zoom:1.0};
this.leaves=[];this.ripples=[];this.floats=[];this.rockDebris=[];this.projectiles=[];this.aoeRings=[];this.guCooldowns={};this.killerCooldowns={};this.speedBuffTimer=0;this._lastHotbarSig="";
this._spawnPasturePets();
this.active=true;
this.keys={};this._ptrDown=false;

const scr=this._ensureDOM();
const ap=this.sys&&this.sys.game&&this.sys.game.aperture;
const title=(ap&&ap.isImmortal)?`${ap.immortalAperture.gradeName}` :"Tiểu Linh Địa Không Khiếu";
const km2=(this.totalSqM / 1000000).toFixed(2);
const sideM=Math.round(this.sideMeters);
const halfM=Math.round(this.halfExtentMeters);
scr.querySelector("#ble-title").textContent=`🏡 ${title} — ${this.acres.toLocaleString("vi-VN")} mẫu (${km2} km²)`;
scr.querySelector("#ble-sub").textContent=`Thế giới sinh ngẫu nhiên 100% (Mã Địa Mạch #${this.worldGen.seed % 100000}) • ${sideM.toLocaleString("vi-VN")}m × ${sideM.toLocaleString("vi-VN")}m (±${halfM.toLocaleString("vi-VN")}m) • [F] Đổi tốc độ bay`;
const spBtn=scr.querySelector("#ble-act-speed");
if (spBtn) {spBtn.textContent=`${SPEED_MODES[0].label} [F]`;spBtn.style.borderColor="";spBtn.style.color="";}
this._setZoom(1.0);
scr.classList.remove("hidden");
this._handleResize();

if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") {
global.vanCoSettings.syncBgmForScreen("hub");
}
this._lastTs=performance.now();
if (this._rafId) cancelAnimationFrame(this._rafId);
this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
}


_getAimWorldPoint() {
if (this._canvas&&this._ptrX&&this._ptrY) {
const z=this.cam.zoom||1.0;
const viewW=this._canvas.width / z;
const viewH=this._canvas.height / z;
const camX=this.cam.x - viewW*0.5;
const camY=this.cam.y - viewH*0.5;
return {x:camX + this._ptrX / z,y:camY + this._ptrY / z};
}
const dirAng=this.pl.facing==="up"? -Math.PI*0.5 :(this.pl.facing==="down"?Math.PI*0.5 :(this.pl.facing==="left"?Math.PI :0));
return {x:this.pl.x + Math.cos(dirAng)*220,y:this.pl.y + Math.sin(dirAng)*220};
}

_castEquippedGuSlot(slotIdx) {
const g=this.sys&&this.sys.game;
const gs=g&&g.guSystem;
if (!gs) return false;
const gu=gs.getEquippedGuAt(slotIdx);
if (!gu) {
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:`Ô ${slotIdx + 1} trống — Bấm [O] lắp Cổ!`,color:"#ff9f43",life:1.1,maxLife:1.1});
return false;
}
return this.castGuInstanceDirect(gu);
}

castGuInstanceDirect(gu) {
const g=this.sys&&this.sys.game;
if (!g|| !g.player|| !g.aperture|| !gu) return false;
const plObj=g.player;
const ap=g.aperture;
const fullName=(global.GuSystem&&global.GuSystem.formatGuNameWithRank)?global.GuSystem.formatGuNameWithRank(gu) :gu.name;
if (!gu.isRefined) {
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:`[${gu.name}] chưa luyện hóa!`,color:"#ff9f43",life:1.2,maxLife:1.2});
return false;
}
if ((gu.hunger||0)<=0) {
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:`[${gu.name}] đói (0%) — Cho ăn trong [O]!`,color:"#ff6b6b",life:1.3,maxLife:1.3});
return false;
}
if ((this.guCooldowns[gu.instanceId]||0)>0) return false;
if (!ap.hasEnoughEssence(gu.essenceCost,gu.rank,gu.path)) {
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:"Thiếu Chân/Tiên Nguyên! Bấm [I] nạp thạch!",color:"#ff6b6b",life:1.3,maxLife:1.3});
return false;
}
const cRes=ap.consumeEssence(gu.essenceCost,gu.rank,gu.path);
if (!cRes.success) return false;
this.guCooldowns[gu.instanceId]=Math.max(0.35,Number(gu.cooldown||1.2));
gu.hunger=Math.max(0,Number(((gu.hunger||100) - 0.15).toFixed(2)));

const aim=this._getAimWorldPoint();
const ang=Math.atan2(aim.y - this.pl.y,aim.x - this.pl.x);
const col=gu.projectileColor||gu.visualColor||"#7ef7f0";
const px=this.pl.x;const py=this.pl.y;

// 1. Định Tiên Du — Spatial Teleport inside Blessed Land!
if (gu.id==="dinh_tien_du_gu") {
const dist=Math.min(680,Math.max(180,Math.hypot(aim.x - px,aim.y - py)));
const nx=Math.max(-this.halfExtent + 30,Math.min(this.halfExtent - 30,px + Math.cos(ang)*dist));
const ny=Math.max(-this.halfExtent + 30,Math.min(this.halfExtent - 30,py + Math.sin(ang)*dist));
this.aoeRings.push({x:px,y:py,r:10,maxR:85,color:"#5cc995",life:0.45,maxLife:0.45});
this.pl.x=nx;this.pl.y=ny;
this.aoeRings.push({x:nx,y:ny,r:12,maxR:110,color:"#7ef7c4",life:0.5,maxLife:0.5});
this.floats.push({x:nx,y:ny - 36,text:`🦋 ${fullName}!`,color:"#7ef7c4",life:1.3,maxLife:1.3});
if (global.vanCoSfx) global.vanCoSfx.play("dash");
this._syncGuHotbar(true);
return true;
}

// 2. Healing Gu
if (gu.castType==="heal") {
const healed=plObj.heal(Math.max(25,Math.round(gu.power||50)));
this.aoeRings.push({x:px,y:py,r:10,maxR:72,color:"#5cc995",life:0.48,maxLife:0.48});
this.floats.push({x:px,y:py - 36,text:`💚 ${fullName} (+${healed} HP)`,color:"#5cc995",life:1.3,maxLife:1.3});
if (global.vanCoSfx) global.vanCoSfx.play("refine_ok");
this._syncGuHotbar(true);
return true;
}

// 3. Defensive Shield Gu
if (gu.type==="defensive") {
const shHp=Math.max(40,Math.round((gu.shieldAmount||gu.power||60)*1.2));
plObj.addBuff({id:`buff_${gu.id}`,name:fullName,icon:gu.icon||"🛡️",duration:gu.buffDuration||10,shieldHp:shHp,statMods:{def:Math.round((gu.power||20)*0.4)},visualColor:col});
this.aoeRings.push({x:px,y:py,r:14,maxR:68,color:col,life:0.45,maxLife:0.45});
this.floats.push({x:px,y:py - 36,text:`🛡️ ${fullName} (+${shHp} Khiên)`,color:col,life:1.3,maxLife:1.3});
if (global.vanCoSfx) global.vanCoSfx.play("click");
this._syncGuHotbar(true);
return true;
}

// 4. Movement Gu (Dash + Speed Boost!)
if (gu.type==="movement") {
const dashDist=185 + (gu.rank||1)*24;
this.aoeRings.push({x:px,y:py,r:10,maxR:58,color:col,life:0.35,maxLife:0.35});
this.pl.x=Math.max(-this.halfExtent + 28,Math.min(this.halfExtent - 28,px + Math.cos(ang)*dashDist));
this.pl.y=Math.max(-this.halfExtent + 28,Math.min(this.halfExtent - 28,py + Math.sin(ang)*dashDist));
this.speedBuffTimer=Math.max(this.speedBuffTimer,6.0);
this.aoeRings.push({x:this.pl.x,y:this.pl.y,r:10,maxR:65,color:col,life:0.4,maxLife:0.4});
this.floats.push({x:this.pl.x,y:this.pl.y - 36,text:`💨 ${fullName}!`,color:col,life:1.2,maxLife:1.2});
if (global.vanCoSfx) global.vanCoSfx.play("dash");
this._syncGuHotbar(true);
return true;
}

// 5. AoE / Offensive / Projectile Gu — Fires visual energy into Blessed Land & shatters rocks / rustles trees!
if (gu.castType==="aoe_cursor"||gu.castType==="aoe_self") {
const dist=gu.castType==="aoe_self"?0 :Math.min(gu.range||340,Math.hypot(aim.x - px,aim.y - py));
const tx=px + Math.cos(ang)*dist;
const ty=py + Math.sin(ang)*dist;
const rad=Math.max(68,gu.radius||90);
this.aoeRings.push({x:tx,y:ty,r:12,maxR:rad,color:col,life:0.5,maxLife:0.5});
this._damageBlessedPropsInRadius(tx,ty,rad,gu.power||60);
this.floats.push({x:tx,y:ty - 30,text:`✨ ${fullName}`,color:col,life:1.1,maxLife:1.1});
} else {
const shots=Math.min(5,1 + Math.floor((gu.rank||1)/3));
const spread=(shots - 1)*0.16;
for (let i=0;i<shots;i++) {
const off=shots===1?0 : -spread*0.5 + (spread / (shots - 1))*i;
const a=ang + off;
this.projectiles.push({
x:px + Math.cos(a)*18,y:py - (this.pl.z||0) + Math.sin(a)*18,
vx:Math.cos(a)*(gu.projectileSpeed||520),vy:Math.sin(a)*(gu.projectileSpeed||520),
r:Math.min(20,Math.max(8,(gu.radius||12)*0.75)),
color:col,power:gu.power||45,life:Math.min(1.4,(gu.range||360)/480 + 0.35),maxLife:1.4
});
}
this.floats.push({x:px,y:py - 34,text:`⚡ ${fullName}`,color:col,life:0.95,maxLife:0.95});
}
if (global.vanCoSfx) global.vanCoSfx.play("reaction");
this._syncGuHotbar(true);
return true;
}

_castEquippedKillerSlot(kIdx) {
const g=this.sys&&this.sys.game;
const gs=g&&g.guSystem;
const ap=g&&g.aperture;
if (!gs|| !ap) return false;
const move=gs.getEquippedKillerMoveAt(kIdx);
if (!move) {
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:`Ô Sát Chiêu ${["Z","X","C","V"][kIdx]} chưa gán!`,color:"#ff9f43",life:1.1,maxLife:1.1});
return false;
}
if ((this.killerCooldowns[move.id]||0)>0) return false;
const mRank=move.moveRank||(move.isImmortal?6 :1);
if (!ap.hasEnoughEssence(move.essenceCost,mRank,move.path)) {
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:"Thiếu Chân/Tiên Nguyên! Bấm [I] nạp thạch!",color:"#ff6b6b",life:1.3,maxLife:1.3});
return false;
}
ap.consumeEssence(move.essenceCost,mRank,move.path);
this.killerCooldowns[move.id]=Math.max(1.5,Number(move.cooldown||5.0));

const aim=this._getAimWorldPoint();
const ang=Math.atan2(aim.y - this.pl.y,aim.x - this.pl.x);
const col=(move.combatProfile&&move.combatProfile.primaryColor)||"#ffd700";
const px=this.pl.x;const py=this.pl.y;
const cnt=Math.min(9,4 + mRank);
for (let i=0;i<cnt;i++) {
const a=ang + (i - (cnt - 1)*0.5)*0.16;
this.projectiles.push({
x:px + Math.cos(a)*22,y:py - (this.pl.z||0) + Math.sin(a)*22,
vx:Math.cos(a)*580,vy:Math.sin(a)*580,
r:13,color:col,power:(move.power||120),life:1.15,maxLife:1.15
});
}
this.aoeRings.push({x:px,y:py,r:18,maxR:155,color:col,life:0.55,maxLife:0.55});
this._damageBlessedPropsInRadius(px,py,155,move.power||120);
this.floats.push({x:px,y:py - 42,text:`⚡ Sát Chiêu: ${move.name}!`,color:"#ffd700",life:1.4,maxLife:1.4});
if (global.vanCoSfx) global.vanCoSfx.play("breakthrough");
this._syncGuHotbar(true);
return true;
}

_damageBlessedPropsInRadius(wx,wy,rad,power) {
const c0x=Math.floor((wx - rad - 24)/CHUNK_PX);
const c1x=Math.floor((wx + rad + 24)/CHUNK_PX);
const c0y=Math.floor((wy - rad - 24)/CHUNK_PX);
const c1y=Math.floor((wy + rad + 24)/CHUNK_PX);
if (this._isWaterAtWorld(wx,wy)&&this.ripples.length<30) {
this.ripples.push({x:wx,y:wy,r:8,maxR:44,life:0.55,maxLife:0.55});
}
for (let cy=c0y;cy<=c1y;cy++) {
for (let cx=c0x;cx<=c1x;cx++) {
const props=this._chunkProps.get(`${cx}_${cy}`);
if (!props) continue;
for (let i=0;i<props.length;i++) {
const pr=props[i];
if (pr.broken) continue;
const d=Math.hypot(pr.x - wx,pr.y - wy);
if (d>rad + 20) continue;
if (pr.isTree) {
pr.rustleTimer=0.45;
const lCol=(global.MapArtRenderer&&global.MapArtRenderer.getPropLeafColor)?global.MapArtRenderer.getPropLeafColor(pr.type) :"#5cc995";
if (this.leaves.length<40) {
for (let k=0;k<2;k++) this.leaves.push({x:pr.x + (Math.random() - 0.5)*24,y:pr.y - 24,vx:18 + Math.random()*24,vy:18 + Math.random()*18,col:lCol,life:1.0,maxLife:1.0});
}
} else if (pr.isRock) {
pr.hp -=Math.max(30,power*0.6);
pr.cracked=true;pr.hitFlash=0.14;
if (this.rockDebris.length<40) {
for (let k=0;k<4;k++) {
const a=Math.random()*Math.PI*2;const s=55 + Math.random()*120;
this.rockDebris.push({x:pr.x,y:pr.y - 6,vx:Math.cos(a)*s,vy:Math.sin(a)*s - 35,sz:3 + Math.random()*3,col:"#7f8783",life:0.5,maxLife:0.5});
}
}
if (pr.hp<=0) {
pr.broken=true;
const bonus=4 + Math.floor(Math.random()*8);
if (this.sys&&this.sys.game&&this.sys.game.player) this.sys.game.player.primevalStones +=bonus;
this.floats.push({x:pr.x,y:pr.y - 24,text:`💥 Vỡ Đá +${bonus}💎!`,color:"#ffd700",life:1.0,maxLife:1.0});
}
}
}
}
}
}

_syncGuHotbar(force=false) {
const bar=this._screen&&this._screen.querySelector("#ble-gu-hotbar");
const g=this.sys&&this.sys.game;
const gs=g&&g.guSystem;
if (!bar|| !gs) return;
const sigParts=[];
for (let i=0;i<8;i++) {
const gu=gs.getEquippedGuAt(i);
const cd=gu?Math.ceil((this.guCooldowns[gu.instanceId]||0)*10) :0;
sigParts.push(gu?`${gu.instanceId}:${cd}` :"_");
}
for (let k=0;k<4;k++) {
const mv=gs.getEquippedKillerMoveAt(k);
const cd=mv?Math.ceil((this.killerCooldowns[mv.id]||0)*10) :0;
sigParts.push(mv?`${mv.id}:${cd}` :"_");
}
const sig=sigParts.join("|");
if (!force&&this._lastHotbarSig===sig) return;
this._lastHotbarSig=sig;

const guBtns=[];
for (let i=0;i<8;i++) {
const gu=gs.getEquippedGuAt(i);
const cd=gu?(this.guCooldowns[gu.instanceId]||0) :0;
const art=gu?(global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gu,22,"gu-inline-art") :gu.icon) :"—";
guBtns.push(`<button class="ble-gu-slot ${gu?"filled" :"empty"} ${cd>0?"on-cd" :""}" data-gslot="${i}" title="${gu?`${gu.name} (${gu.rank}C) — Phím ${i + 1}` :`Ô ${i + 1} trống — Bấm [O] lắp Cổ`}">
<span class="ble-slot-k">${i + 1}</span>
<span class="ble-slot-art">${art}</span>
${cd>0?`<span class="ble-slot-cd">${cd.toFixed(1)}s</span>` :""}
</button>`);
}
const kmKeys=["Z","X","C","V"];
const kmBtns=[];
for (let k=0;k<4;k++) {
const mv=gs.getEquippedKillerMoveAt(k);
const cd=mv?(this.killerCooldowns[mv.id]||0) :0;
kmBtns.push(`<button class="ble-km-slot ${mv?"filled" :"empty"} ${cd>0?"on-cd" :""}" data-kslot="${k}" title="${mv?`Sát Chiêu: ${mv.name} — Phím ${kmKeys[k]}` :`Sát Chiêu ${kmKeys[k]} trống`}">
<span class="ble-slot-k">${kmKeys[k]}</span>
<span class="ble-slot-art">${mv?"⚡" :"—"}</span>
${cd>0?`<span class="ble-slot-cd">${cd.toFixed(1)}s</span>` :""}
</button>`);
}
bar.innerHTML=`<div class="ble-slots-row">${guBtns.join("")}<span class="ble-slot-sep"></span>${kmBtns.join("")}</div>`;
bar.querySelectorAll("[data-gslot]").forEach(btn=>{
btn.addEventListener("click",(e)=>{e.stopPropagation();this._castEquippedGuSlot(parseInt(btn.getAttribute("data-gslot"),10));});
});
bar.querySelectorAll("[data-kslot]").forEach(btn=>{
btn.addEventListener("click",(e)=>{e.stopPropagation();this._castEquippedKillerSlot(parseInt(btn.getAttribute("data-kslot"),10));});
});
}

_triggerJump() {
if (this.pl.jumpCount>=this.pl.maxJumps) return;
const isD=(this.pl.jumpCount>=1||this.pl.z>4);
this.pl.vz=isD?320 :365;
this.pl.z=Math.max(this.pl.z,2);
this.pl.jumpCount +=1;
if (global.vanCoSfx) global.vanCoSfx.play("jump");
if (this.pl.isInWater) this.ripples.push({x:this.pl.x,y:this.pl.y + 8,r:6,maxR:38,life:0.5,maxLife:0.5});
}

_triggerDash() {
if (this.pl.dashCd>0) return;
this.pl.dashCd=1.0;
let dx=0;let dy=0;
if (this.keys.KeyW||this.keys.ArrowUp) dy -=1;
if (this.keys.KeyS||this.keys.ArrowDown) dy +=1;
if (this.keys.KeyA||this.keys.ArrowLeft) dx -=1;
if (this.keys.KeyD||this.keys.ArrowRight) dx +=1;
const l=Math.hypot(dx,dy);
const a=l>0.1?Math.atan2(dy,dx) :(this.pl.facing==="up"? -Math.PI/2 :(this.pl.facing==="down"?Math.PI/2 :(this.pl.facing==="left"?Math.PI :0)));
const spdM=SPEED_MODES[this.speedModeIdx].mult;
const dist=140*Math.min(4,spdM);
this.pl.x=Math.max(-this.halfExtent + 24,Math.min(this.halfExtent - 24,this.pl.x + Math.cos(a)*dist));
this.pl.y=Math.max(-this.halfExtent + 24,Math.min(this.halfExtent - 24,this.pl.y + Math.sin(a)*dist));
if (global.vanCoSfx) global.vanCoSfx.play("dash");
}

_interactOrHarvest() {
const res=this.sys.collectAllYield();
this.floats.push({x:this.pl.x,y:this.pl.y - 34,text:res.success?"🌾 Thu Hoạch Thành Công!" :"Sản vật đang tích tụ...",color:res.success?"#7ef7c4" :"#ffd700",life:1.2,maxLife:1.2});
if (this.sys&&this.sys.game&&this.sys.game.ui) {
this.sys.game.ui.addLog(res.message,res.success?"loot" :"system");
this.sys.game.ui.updateHubTopbar();
}
}

_strikeNearbyRocks() {
const px=this.pl.x;const py=this.pl.y;
const cx=Math.floor(px / CHUNK_PX);const cy=Math.floor(py / CHUNK_PX);
for (let dy=-1;dy<=1;dy++) {
for (let dx=-1;dx<=1;dx++) {
const props=this._chunkProps.get(`${cx + dx}_${cy + dy}`);
if (!props) continue;
for (const pr of props) {
if (!pr.isRock||pr.broken) continue;
if (Math.hypot(pr.x - px,pr.y - py)<=78) {
pr.hp -=34;pr.cracked=true;pr.hitFlash=0.14;
for (let k=0;k<7;k++) {
const a=Math.random()*Math.PI*2;const spd=50 + Math.random()*120;
this.rockDebris.push({x:pr.x,y:pr.y - 6,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd - 35,sz:3 + Math.random()*3.5,col:"#7f8783",life:0.55,maxLife:0.55});
}
if (pr.hp<=0) {
pr.broken=true;
const bonus=4 + Math.floor(Math.random()*8);
if (this.sys&&this.sys.game&&this.sys.game.player) this.sys.game.player.primevalStones +=bonus;
this.floats.push({x:pr.x,y:pr.y - 24,text:`💥 Vỡ Đá +${bonus}💎!`,color:"#ffd700",life:1.1,maxLife:1.1});
} else {
this.floats.push({x:pr.x,y:pr.y - 22,text:"⛏️ Nứt Vỡ!",color:"#dce8f2",life:0.65,maxLife:0.65});
}
return;
}
}
}
}
}

_isBlockedByRock(nx,ny) {
if (this.pl.z>=20||this.speedModeIdx>=1) return false;
const cx=Math.floor(nx / CHUNK_PX);const cy=Math.floor(ny / CHUNK_PX);
for (let dy=-1;dy<=1;dy++) {
for (let dx=-1;dx<=1;dx++) {
const props=this._chunkProps.get(`${cx + dx}_${cy + dy}`);
if (!props) continue;
for (const pr of props) {
if (pr.isRock&& !pr.broken&&Math.hypot(nx - pr.x,ny - pr.y)<(pr.radius + this.pl.r - 4)) {
return true;
}
}
}
}
return false;
}

_loop(ts) {
if (!this.active) {this._rafId=null;return;}
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs) / 1000));
this._lastTs=ts;
this._update(dt);
this._render(ts*0.001);
this._hudTick +=dt;
if (this._hudTick>=0.16) {
this._hudTick=0;
const cEl=this._screen&&this._screen.querySelector("#ble-coord");
if (cEl&&this.worldGen) {
const xm=Math.round(this.pl.x / PX_PER_METER);
const ym=Math.round(this.pl.y / PX_PER_METER);
const curBm=this.worldGen.sampleTerrain(this.pl.x,this.pl.y).biome;
cEl.textContent=`📍 (${xm.toLocaleString("vi-VN")}m, ${ym.toLocaleString("vi-VN")}m) • ${curBm.name}`;
}
const eEl=this._screen&&this._screen.querySelector("#ble-ess-pill");
const gRef=this.sys&&this.sys.game;
if (eEl&&gRef&&gRef.aperture&&gRef.player) {
const ap=gRef.aperture;
const essStr=ap.isImmortal
?`🌟 ${Number((ap.immortalEssence&&ap.immortalEssence[ap.rank])||0).toFixed(1)}`
:`💧 ${Math.floor(ap.currentEssence||0)}%`;
eEl.textContent=`❤️ ${Math.ceil(gRef.player.hp)}/${Math.ceil(gRef.player.maxHp)} • ${essStr}`;
}
this._syncGuHotbar(false);
}
this._rafId=requestAnimationFrame((nts)=>this._loop(nts));
}

_update(dt) {
const pl=this.pl;
const gRef=this.sys&&this.sys.game;
if (gRef&&gRef.aperture&&gRef.player) gRef.aperture.update(dt,gRef.player);
if (this.speedBuffTimer>0) this.speedBuffTimer=Math.max(0,this.speedBuffTimer - dt);
for (const k of Object.keys(this.guCooldowns)) {
this.guCooldowns[k]=Math.max(0,this.guCooldowns[k] - dt);
if (this.guCooldowns[k]<=0) delete this.guCooldowns[k];
}
for (const k of Object.keys(this.killerCooldowns)) {
this.killerCooldowns[k]=Math.max(0,this.killerCooldowns[k] - dt);
if (this.killerCooldowns[k]<=0) delete this.killerCooldowns[k];
}
const spdMode=SPEED_MODES[this.speedModeIdx];
if (pl.dashCd>0) pl.dashCd=Math.max(0,pl.dashCd - dt);
if (pl.z>0||pl.vz!==0) {
pl.z +=pl.vz*dt;pl.vz -=980*dt;
if (pl.z<=0) {
pl.z=0;pl.vz=0;pl.jumpCount=0;
if (pl.isInWater) this.ripples.push({x:pl.x,y:pl.y + 8,r:6,maxR:38,life:0.5,maxLife:0.5});
}
}

pl.isInWater=(pl.z<=2&&this.speedModeIdx===0)&&this._isWaterAtWorld(pl.x,pl.y);

let mx=0;let my=0;
if (this.keys.KeyW||this.keys.ArrowUp) my -=1;
if (this.keys.KeyS||this.keys.ArrowDown) my +=1;
if (this.keys.KeyA||this.keys.ArrowLeft) mx -=1;
if (this.keys.KeyD||this.keys.ArrowRight) mx +=1;
if (mx===0&&my===0&&this._ptrDown&&this._canvas) {
const dx=this._ptrX - this._canvas.width*0.5;const dy=this._ptrY - this._canvas.height*0.5;
const d=Math.hypot(dx,dy);
if (d>24) {mx=dx/d;my=dy/d;}
}
pl.isMoving=(mx!==0||my!==0);
if (pl.isMoving) {
const l=Math.hypot(mx,my)||1;mx /=l;my /=l;
pl.facing=Math.abs(mx)>Math.abs(my)?(mx>0?"right" :"left") :(my>0?"down" :"up");
const mult=spdMode.mult*(this.speedBuffTimer>0?1.35 :1.0)*(pl.z>4?1.08 :(pl.isInWater?0.84 :1.0));
const nx=Math.max(-this.halfExtent + 22,Math.min(this.halfExtent - 22,pl.x + mx*pl.spd*mult*dt));
const ny=Math.max(-this.halfExtent + 22,Math.min(this.halfExtent - 22,pl.y + my*pl.spd*mult*dt));
if (!this._isBlockedByRock(nx,pl.y)) pl.x=nx;
if (!this._isBlockedByRock(pl.x,ny)) pl.y=ny;

if (pl.isInWater) {
pl._wRip -=dt;
if (pl._wRip<=0) {pl._wRip=0.22;this.ripples.push({x:pl.x,y:pl.y + 9,r:4,maxR:24,life:0.46,maxLife:0.46});}
}
}

const pCX=Math.floor(pl.x / CHUNK_PX);const pCY=Math.floor(pl.y / CHUNK_PX);
const curProps=this._chunkProps.get(`${pCX}_${pCY}`);
if (curProps) {
for (const pr of curProps) {
if (pr.rustleTimer>0) pr.rustleTimer=Math.max(0,pr.rustleTimer - dt);
if (pr.hitFlash>0) pr.hitFlash=Math.max(0,pr.hitFlash - dt);
if (!pr.isTree) continue;
if (pr.leafCd>0) pr.leafCd -=dt;
if (pl.isMoving&&pr.leafCd<=0&&Math.hypot(pl.x - pr.x,pl.y - pr.y)<48) {
pr.rustleTimer=0.45;pr.leafCd=0.85;
const lCol=(global.MapArtRenderer&&global.MapArtRenderer.getPropLeafColor)?global.MapArtRenderer.getPropLeafColor(pr.type) :"#5cc995";
if (this.leaves.length<36) {
for (let k=0;k<3;k++) {
this.leaves.push({x:pr.x + (Math.random() - 0.5)*28,y:pr.y - 26 + Math.random()*14,vx:16 + Math.random()*22,vy:18 + Math.random()*16,col:lCol,life:1.1,maxLife:1.1});
}
}
}
}
}

const camLerp=Math.min(1,dt*(this.speedModeIdx>=2?18 :(this.speedModeIdx===1?12 :8)));
this.cam.x +=(pl.x - this.cam.x)*camLerp;
this.cam.y +=(pl.y - this.cam.y)*camLerp;

const updCreature=(cr)=>{
cr.timer -=dt;
const distPl=Math.hypot(cr.x - pl.x,cr.y - pl.y);
// Auto-discover wild species into Bách Thú Đồ Giám when player approaches within 220px!
if (cr.speciesId&&distPl<220&&this.sys&&typeof this.sys.markSpeciesDiscovered==="function") {
if (this.sys.markSpeciesDiscovered(cr.speciesId)) {
const tot=global.BlessedLandCreatures?global.BlessedLandCreatures.SPECIES_LIST.length :20;
const cnt=this.sys.discoveredSpecies.length;
this.floats.push({x:cr.x,y:cr.y - 26,text:`🐾 Gặp loài mới: ${cr.name} (${cnt}/${tot})!`,color:"#ffd700",life:1.7,maxLife:1.7});
this._syncBestiaryBtn();
if (global.vanCoSfx) global.vanCoSfx.play("click");
}
}
// Gentle flee reaction for timid land wildlife when player rushes very close
if (!cr.isPet&&cr.habitat==="land"&&distPl<72&&pl.isMoving) {
const away=Math.atan2(cr.y - pl.y,cr.x - pl.x);
cr.vx=Math.cos(away)*cr.spd*1.25;
cr.vy=Math.sin(away)*cr.spd*1.25;
cr.timer=0.65;
} else if (cr.timer<=0) {
cr.timer=1.6 + Math.random()*2.6;
const a=Math.random()*Math.PI*2;
const idleChance=(cr.habitat==="air"||cr.habitat==="water")?0.12 :0.30;
cr.vx=Math.cos(a)*cr.spd*(Math.random()<idleChance?0 :0.82);
cr.vy=Math.sin(a)*cr.spd*(Math.random()<idleChance?0 :0.82);
}
const nextX=Math.max(-this.halfExtent + 40,Math.min(this.halfExtent - 40,cr.x + cr.vx*dt));
const nextY=Math.max(-this.halfExtent + 40,Math.min(this.halfExtent - 40,cr.y + cr.vy*dt));
// Habitat constraint: swimmers stay in water, land animals stay out of water, flyers roam freely!
if (cr.habitat==="water") {
if (this._isWaterAtWorld(nextX,nextY)) {
cr.x=nextX;cr.y=nextY;
cr._ripCd=(cr._ripCd||0) - dt;
if (cr._ripCd<=0&&Math.hypot(cr.vx,cr.vy)>16&&this.ripples.length<28) {
cr._ripCd=0.65;
this.ripples.push({x:cr.x,y:cr.y + 4,r:4,maxR:20,life:0.45,maxLife:0.45});
}
} else {
cr.vx= -cr.vx*0.8;cr.vy= -cr.vy*0.8;cr.timer=0.5;
}
} else if (cr.habitat==="land"||cr.isPet) {
if (!this._isWaterAtWorld(nextX,nextY)) {
cr.x=nextX;cr.y=nextY;
} else {
cr.vx= -cr.vx*0.8;cr.vy= -cr.vy*0.8;cr.timer=0.5;
}
} else {
cr.x=nextX;cr.y=nextY;
}
if (Math.hypot(cr.x - cr.homeX,cr.y - cr.homeY)>280) {
const a=Math.atan2(cr.homeY - cr.y,cr.homeX - cr.x);
cr.vx=Math.cos(a)*cr.spd*0.65;cr.vy=Math.sin(a)*cr.spd*0.65;
}
};
for (const cr of this.petCreatures) updCreature(cr);
for (let dy=-1;dy<=1;dy++) {
for (let dx=-1;dx<=1;dx++) {
const list=this._chunkCreatures.get(`${pCX + dx}_${pCY + dy}`);
if (list) for (const cr of list) updCreature(cr);
}
}

for (let i=this.ripples.length - 1;i>=0;i--) {this.ripples[i].life -=dt;if (this.ripples[i].life<=0) this.ripples.splice(i,1);}
for (let i=this.leaves.length - 1;i>=0;i--) {const l=this.leaves[i];l.x +=l.vx*dt;l.y +=l.vy*dt;l.life -=dt;if (l.life<=0) this.leaves.splice(i,1);}
for (let i=this.rockDebris.length - 1;i>=0;i--) {const d=this.rockDebris[i];d.x +=d.vx*dt;d.y +=d.vy*dt;d.vy +=320*dt;d.life -=dt;if (d.life<=0) this.rockDebris.splice(i,1);}
for (let i=this.projectiles.length - 1;i>=0;i--) {
const pr=this.projectiles[i];
pr.x +=pr.vx*dt;pr.y +=pr.vy*dt;pr.life -=dt;
if (pr.life<=0|| !this._isInsideBoundary(pr.x,pr.y)) {this.projectiles.splice(i,1);continue;}
// Hit interactive 2.5D rocks along projectile flight path!
const rcx=Math.floor(pr.x / CHUNK_PX);const rcy=Math.floor(pr.y / CHUNK_PX);
const dProps=this._chunkProps.get(`${rcx}_${rcy}`);
if (dProps) {
let hitRock=false;
for (let j=0;j<dProps.length;j++) {
const ob=dProps[j];
if (ob.isRock&& !ob.broken&&Math.hypot(ob.x - pr.x,ob.y - pr.y)<=ob.radius + pr.r) {
this._damageBlessedPropsInRadius(pr.x,pr.y,28,pr.power);
this.aoeRings.push({x:pr.x,y:pr.y,r:4,maxR:28,color:pr.color,life:0.25,maxLife:0.25});
hitRock=true;break;
}
}
if (hitRock) {this.projectiles.splice(i,1);continue;}
}
}
for (let i=this.aoeRings.length - 1;i>=0;i--) {
this.aoeRings[i].life -=dt;
if (this.aoeRings[i].life<=0) this.aoeRings.splice(i,1);
}
for (let i=this.floats.length - 1;i>=0;i--) {this.floats[i].y -=36*dt;this.floats[i].life -=dt;if (this.floats[i].life<=0) this.floats.splice(i,1);}
}

_render(t) {
const ctx=this._ctx;
const W=this._canvas.width;const H=this._canvas.height;
const z=this.cam.zoom;
const viewW=W / z;const viewH=H / z;
const camX=this.cam.x - viewW*0.5;
const camY=this.cam.y - viewH*0.5;

ctx.fillStyle="#05070d";
ctx.fillRect(0,0,W,H);

ctx.save();
ctx.scale(z,z);
ctx.translate(-camX,-camY);

// RAZOR-SHARP 3-TIER LOD CHUNK RENDERING:
// Tier 1 (42%–2000%): Detail 512px | Tier 2 (14%–41%): Macro 2048px | Tier 3 (5%–13%): Continent 8192px
const isUltraWide=(z<0.14);
const isEagleEye=(z<0.42);
const isMobBle=document.body&&document.body.classList.contains("mobile-ui");
const cStartX=Math.floor(camX / CHUNK_PX);
const cEndX=Math.floor((camX + viewW) / CHUNK_PX);
const cStartY=Math.floor(camY / CHUNK_PX);
const cEndY=Math.floor((camY + viewH) / CHUNK_PX);

const mStartX=Math.floor(camX / MACRO_PX);
const mEndX=Math.floor((camX + viewW) / MACRO_PX);
const mStartY=Math.floor(camY / MACRO_PX);
const mEndY=Math.floor((camY + viewH) / MACRO_PX);

const uStartX=Math.floor(camX / ULTRA_PX);
const uEndX=Math.floor((camX + viewW) / ULTRA_PX);
const uStartY=Math.floor(camY / ULTRA_PX);
const uEndY=Math.floor((camY + viewH) / ULTRA_PX);

if (!isEagleEye) {
const visCnt=(cEndX - cStartX + 1)*(cEndY - cStartY + 1);
this._dynChunkCap=Math.min(180,Math.max(visCnt + 24,isMobBle?56 :110));
const maxBuilds=isMobBle?2 :(this.speedModeIdx>=2?5 :4);
const centerCX=(camX + viewW*0.5) / CHUNK_PX;
const centerCY=(camY + viewH*0.5) / CHUNK_PX;
const missing=[];

for (let cy=cStartY;cy<=cEndY;cy++) {
for (let cx=cStartX;cx<=cEndX;cx++) {
const ch=this._getOrBuildChunk(cx,cy,false);
if (ch) {
ctx.drawImage(ch,cx*CHUNK_PX,cy*CHUNK_PX);
} else {
missing.push({cx,cy,d2:(cx + 0.5 - centerCX)*(cx + 0.5 - centerCX) + (cy + 0.5 - centerCY)*(cy + 0.5 - centerCY)});
}
}
}
if (missing.length>0) {
if (missing.length>maxBuilds) missing.sort((a,b)=>a.d2 - b.d2);
for (let i=0;i<missing.length;i++) {
const m=missing[i];
if (i<maxBuilds) {
const built=this._getOrBuildChunk(m.cx,m.cy,true);
if (built) ctx.drawImage(built,m.cx*CHUNK_PX,m.cy*CHUNK_PX);
} else {
// Crisp dark-jade base inside bounds while waiting 1–2 frames
const x0=Math.max(-this.halfExtent,m.cx*CHUNK_PX);
const y0=Math.max(-this.halfExtent,m.cy*CHUNK_PX);
const x1=Math.min(this.halfExtent,(m.cx + 1)*CHUNK_PX);
const y1=Math.min(this.halfExtent,(m.cy + 1)*CHUNK_PX);
if (x1>x0&&y1>y0) {ctx.fillStyle="#11291e";ctx.fillRect(x0,y0,x1 - x0,y1 - y0);}
}
}
}
} else if (!isUltraWide) {
// Tier 2: Wide-FOV Macro LOD Chunks (2048x2048 world px on crisp 512x512 canvas)
const maxMacroBuilds=isMobBle?2 :4;
const centerMX=(camX + viewW*0.5) / MACRO_PX;
const centerMY=(camY + viewH*0.5) / MACRO_PX;
const missingM=[];

for (let my=mStartY;my<=mEndY;my++) {
for (let mx=mStartX;mx<=mEndX;mx++) {
const mch=this._getOrBuildMacroChunk(mx,my,false);
if (mch) {
ctx.drawImage(mch,mx*MACRO_PX,my*MACRO_PX,MACRO_PX,MACRO_PX);
} else {
missingM.push({mx,my,d2:(mx + 0.5 - centerMX)*(mx + 0.5 - centerMX) + (my + 0.5 - centerMY)*(my + 0.5 - centerMY)});
}
}
}
if (missingM.length>0) {
if (missingM.length>maxMacroBuilds) missingM.sort((a,b)=>a.d2 - b.d2);
for (let i=0;i<missingM.length;i++) {
const m=missingM[i];
if (i<maxMacroBuilds) {
const built=this._getOrBuildMacroChunk(m.mx,m.my,true);
if (built) ctx.drawImage(built,m.mx*MACRO_PX,m.my*MACRO_PX,MACRO_PX,MACRO_PX);
} else {
const x0=Math.max(-this.halfExtent,m.mx*MACRO_PX);
const y0=Math.max(-this.halfExtent,m.my*MACRO_PX);
const x1=Math.min(this.halfExtent,(m.mx + 1)*MACRO_PX);
const y1=Math.min(this.halfExtent,(m.my + 1)*MACRO_PX);
if (x1>x0&&y1>y0) {ctx.fillStyle="#11291e";ctx.fillRect(x0,y0,x1 - x0,y1 - y0);}
}
}
}
} else {
// Tier 3: Ultra-Wide Continent LOD Chunks (8192x8192 world px on 512x512 canvas — razor sharp at 5%–13%!)
const maxUltraBuilds=isMobBle?1 :2;
const centerUX=(camX + viewW*0.5) / ULTRA_PX;
const centerUY=(camY + viewH*0.5) / ULTRA_PX;
const missingU=[];
for (let uy=uStartY;uy<=uEndY;uy++) {
for (let ux=uStartX;ux<=uEndX;ux++) {
const uch=this._getOrBuildUltraChunk(ux,uy,false);
if (uch) {
ctx.drawImage(uch,ux*ULTRA_PX,uy*ULTRA_PX,ULTRA_PX,ULTRA_PX);
} else {
missingU.push({ux,uy,d2:(ux + 0.5 - centerUX)*(ux + 0.5 - centerUX) + (uy + 0.5 - centerUY)*(uy + 0.5 - centerUY)});
}
}
}
if (missingU.length>0) {
if (missingU.length>maxUltraBuilds) missingU.sort((a,b)=>a.d2 - b.d2);
for (let i=0;i<missingU.length;i++) {
const m=missingU[i];
if (i<maxUltraBuilds) {
const built=this._getOrBuildUltraChunk(m.ux,m.uy,true);
if (built) ctx.drawImage(built,m.ux*ULTRA_PX,m.uy*ULTRA_PX,ULTRA_PX,ULTRA_PX);
} else {
const x0=Math.max(-this.halfExtent,m.ux*ULTRA_PX);
const y0=Math.max(-this.halfExtent,m.uy*ULTRA_PX);
const x1=Math.min(this.halfExtent,(m.ux + 1)*ULTRA_PX);
const y1=Math.min(this.halfExtent,(m.uy + 1)*ULTRA_PX);
if (x1>x0&&y1>y0) {ctx.fillStyle="#11291e";ctx.fillRect(x0,y0,x1 - x0,y1 - y0);}
}
}
}
}

// Live Flowing Water Surface (matches Tier 1 / Tier 2 / Tier 3 spans cleanly!)
const wPat=this._getWaterPattern(ctx);
ctx.save();
ctx.beginPath();
let hasW=false;
if (!isEagleEye) {
for (let cy=cStartY;cy<=cEndY;cy++) {
for (let cx=cStartX;cx<=cEndX;cx++) {
const spans=this._chunkWaterSpans.get(`${cx}_${cy}`);
if (!spans||spans.length===0) continue;
hasW=true;
for (let i=0;i<spans.length;i++) {
const sp=spans[i];ctx.rect(sp.x,sp.y,sp.w,sp.h);
}
}
}
} else if (!isUltraWide) {
for (let my=mStartY;my<=mEndY;my++) {
for (let mx=mStartX;mx<=mEndX;mx++) {
const spans=this._macroWaterSpans.get(`${mx}_${my}`);
if (!spans||spans.length===0) continue;
hasW=true;
for (let i=0;i<spans.length;i++) {
const sp=spans[i];ctx.rect(sp.x,sp.y,sp.w,sp.h);
}
}
}
} else {
for (let uy=uStartY;uy<=uEndY;uy++) {
for (let ux=uStartX;ux<=uEndX;ux++) {
const spans=this._ultraWaterSpans.get(`${ux}_${uy}`);
if (!spans||spans.length===0) continue;
hasW=true;
for (let i=0;i<spans.length;i++) {
const sp=spans[i];ctx.rect(sp.x,sp.y,sp.w,sp.h);
}
}
}
}
if (hasW) {
ctx.clip();
const fx=((t*24) % 128);const fy=((Math.sin(t*0.9)*10) % 128);
ctx.translate(Math.floor(camX/128)*128 + fx - 128,Math.floor(camY/128)*128 + fy - 128);
ctx.fillStyle=wPat;
ctx.fillRect(0,0,viewW + 384,viewH + 384);
}
ctx.restore();

for (const rp of this.ripples) {
const ratio=rp.life / rp.maxLife;
const rad=rp.r + (rp.maxR - rp.r)*(1 - ratio);
ctx.save();ctx.globalAlpha=ratio*0.8;ctx.strokeStyle="#bff0ff";ctx.lineWidth=1.6;
ctx.beginPath();ctx.ellipse(rp.x,rp.y,rad,rad*0.55,0,0,Math.PI*2);ctx.stroke();ctx.restore();
}

// Viewport-Clipped Crystalline Aperture Boundary Wall (Khiếu Bích)
const he=this.halfExtent;
const vx0=Math.max(-he,camX - 40);const vx1=Math.min(he,camX + viewW + 40);
const vy0=Math.max(-he,camY - 40);const vy1=Math.min(he,camY + viewH + 40);
const drawWallEdge=(x1,y1,x2,y2)=>{
ctx.strokeStyle="#7ef7f0";ctx.lineWidth=7;ctx.globalAlpha=0.72 + Math.sin(t*2.5)*0.18;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.globalAlpha=0.9;
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
};
ctx.save();
if (vy0<= -he + 40&&vx1>vx0) drawWallEdge(vx0,-he,vx1,-he);
if (vy1>=he - 40&&vx1>vx0) drawWallEdge(vx0,he,vx1,he);
if (vx0<= -he + 40&&vy1>vy0) drawWallEdge(-he,vy0,-he,vy1);
if (vx1>=he - 40&&vy1>vy0) drawWallEdge(he,vy0,he,vy1);
ctx.restore();

// Player's Built Resource Point Buildings around (0,0)
const D=global.VanCoBlessedLandData;
const plots=this.sys?this.sys.plots :[];
for (let i=0;i<plots.length;i++) {
const p=plots[i];if (!p) continue;
const pos=this._getBuildingWorldPos(i);
if (pos.x<camX - 100||pos.x>camX + viewW + 100||pos.y<camY - 100||pos.y>camY + viewH + 100) continue;
const tpl=D.getBuildingType(p.typeId);
ctx.fillStyle="rgba(0,0,0,0.42)";ctx.beginPath();ctx.ellipse(pos.x,pos.y + 18,44,18,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle=tpl?tpl.bgCol :"#172922";ctx.strokeStyle=tpl?tpl.color :"#5cc995";ctx.lineWidth=2.2;
ctx.beginPath();ctx.ellipse(pos.x,pos.y,40,26,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.font="26px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(tpl?tpl.icon :"🏡",pos.x,pos.y - 4);
ctx.font="bold 11px Georgia";ctx.fillStyle="#ffd700";ctx.fillText(`${tpl?tpl.name :"Ô"} (Lv.${p.level||1})`,pos.x,pos.y - 34);
}

// Y-Sorted Dynamic Props, Wildlife, Pasture Pets & Player
const renderables=[{kind:"player",y:this.pl.y}];
for (const cr of this.petCreatures) {
if (cr.x<camX - 50||cr.x>camX + viewW + 50||cr.y<camY - 50||cr.y>camY + viewH + 50) continue;
renderables.push({kind:"creature",y:cr.y,cr});
}
if (!isEagleEye) {
for (let cy=cStartY;cy<=cEndY;cy++) {
for (let cx=cStartX;cx<=cEndX;cx++) {
const cList=this._chunkCreatures.get(`${cx}_${cy}`);
if (cList) {
for (let i=0;i<cList.length;i++) {
const cr=cList[i];
if (cr.x<camX - 40||cr.x>camX + viewW + 40||cr.y<camY - 40||cr.y>camY + viewH + 40) continue;
renderables.push({kind:"creature",y:cr.y,cr});
}
}
const props=this._chunkProps.get(`${cx}_${cy}`);
if (!props) continue;
for (let i=0;i<props.length;i++) {
const pr=props[i];
if (pr.broken) continue;
if (pr.x<camX - 60||pr.x>camX + viewW + 60||pr.y<camY - 70||pr.y>camY + viewH + 70) continue;
renderables.push({kind:"prop",y:pr.y,pr});
}
}
}
}
renderables.sort((a,b)=>a.y - b.y);

const skins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
const plObj=this.sys&&this.sys.game&&this.sys.game.player;
const mcSkin=(plObj&&typeof plObj.getSkinConfig==="function")?plObj.getSkinConfig() :skins.phuong_nguyen;

for (const item of renderables) {
if (item.kind==="prop") {
if (global.MapArtRenderer&&typeof global.MapArtRenderer.drawDynamicProp==="function") {
global.MapArtRenderer.drawDynamicProp(ctx,item.pr,0,0,t,this.pl);
}
} else if (item.kind==="creature") {
const cr=item.cr;
if (cr.speciesId&&global.BlessedLandCreatures) {
global.BlessedLandCreatures.drawCreature(ctx,cr,t,z);
if (z>=1.25||(cr.rarity==="Linh Thú"&&z>=0.75)) {
ctx.font="bold 9.5px Georgia";ctx.textAlign="center";
ctx.fillStyle=cr.rarity==="Linh Thú"?"#ffd700" :"#d8fff0";
ctx.fillText(cr.name,cr.x,cr.y - (cr.habitat==="air"?28 :21));
}
} else if (cr.isPet) {
const em=this.sys&&this.sys.game&&this.sys.game.enemies;
if (em&&typeof em._drawBeastArt==="function") {
ctx.save();ctx.translate(cr.x,cr.y);em._drawBeastArt(ctx,cr,t);ctx.restore();
} else if (global.BlessedLandCreatures) {
global.BlessedLandCreatures.drawCreature(ctx,{...cr,speciesId:"xich_diem_lang"},t,z);
}
ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText(cr.name,cr.x,cr.y - 22);
}
} else {
const pl=this.pl;
const flyH=this.speedModeIdx>=2?22 :(this.speedModeIdx===1?12 :0);
const pz=Math.max(0,(pl.z||0) + flyH);
ctx.save();ctx.translate(pl.x,pl.y);
const shS=Math.max(0.42,1 - pz/130);
ctx.fillStyle=`rgba(0,0,0,${(0.44*shS).toFixed(2)})`;
ctx.beginPath();ctx.ellipse(0,14,12*shS,4.5*shS,0,0,Math.PI*2);ctx.fill();
if (pl.isInWater&&pz<=2) {
ctx.strokeStyle="rgba(200,248,255,0.75)";ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(0,12,13 + Math.sin(t*5)*1.5,5,0,0,Math.PI*2);ctx.stroke();
}
ctx.translate(0,-pz);
if (plObj&&Array.isArray(plObj.activeBuffs)) {
const defB=plObj.activeBuffs.find(b=>b.shieldHp>0||(b.statMods&&b.statMods.def>0));
if (defB) {
ctx.strokeStyle=defB.visualColor||"#7ef7f0";ctx.lineWidth=2.0;ctx.globalAlpha=0.72;
ctx.beginPath();ctx.arc(0,-4,24,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
}
}
if (this.speedModeIdx>=1) {
ctx.fillStyle=this.speedModeIdx>=2?"rgba(255,215,0,0.28)" :"rgba(126,247,240,0.26)";
ctx.beginPath();ctx.ellipse(0,14,18,7,0,0,Math.PI*2);ctx.fill();
}
if (global.CharacterArtRenderer) {
ctx.scale(1.15,1.15);
global.CharacterArtRenderer.drawCharacter(ctx,mcSkin,{bobY:pl.isMoving?Math.sin(t*10)*1.8 :0,facing:pl.facing,isMoving:pl.isMoving});
}
if (isEagleEye) {
ctx.strokeStyle="#ffd700";ctx.lineWidth=3.0 / Math.max(0.05,z);
ctx.beginPath();ctx.arc(0,-4,18 / Math.max(0.05,z),0,Math.PI*2);ctx.stroke();
}
ctx.restore();
}
}

for (const lf of this.leaves) {
ctx.save();ctx.globalAlpha=lf.life/lf.maxLife;ctx.fillStyle=lf.col;
ctx.beginPath();ctx.ellipse(lf.x,lf.y,3.5,2,t*4,0,Math.PI*2);ctx.fill();ctx.restore();
}
for (const rd of this.rockDebris) {
ctx.save();ctx.globalAlpha=rd.life/rd.maxLife;ctx.fillStyle=rd.col;
ctx.fillRect(rd.x,rd.y,rd.sz,rd.sz);ctx.restore();
}
for (const ar of this.aoeRings) {
const ratio=Math.max(0,ar.life / ar.maxLife);
const rad=ar.r + (ar.maxR - ar.r)*(1 - ratio);
ctx.save();ctx.globalAlpha=ratio*0.85;ctx.strokeStyle=ar.color;ctx.lineWidth=3.2;
ctx.beginPath();ctx.arc(ar.x,ar.y,rad,0,Math.PI*2);ctx.stroke();ctx.restore();
}
for (const pb of this.projectiles) {
ctx.save();ctx.fillStyle=pb.color;ctx.beginPath();ctx.arc(pb.x,pb.y,pb.r,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
}
ctx.font="bold 13px Georgia";ctx.textAlign="center";
for (const ft of this.floats) {
ctx.save();ctx.globalAlpha=ft.life/ft.maxLife;ctx.fillStyle=ft.color;ctx.fillText(ft.text,ft.x,ft.y);ctx.restore();
}
ctx.restore();

// FULL-WORLD PROCEDURAL BIOME & RIVER MINIMAP HUD (displays unique non-repeating continents!)
const mmSz=(W<640)?102 :138;
const mmX=W - mmSz - 12;
const mmY=12;
ctx.save();
if (this._overviewCanvas) {
ctx.drawImage(this._overviewCanvas,mmX,mmY,mmSz,mmSz);
} else {
ctx.fillStyle="rgba(6,12,18,0.86)";
ctx.fillRect(mmX,mmY,mmSz,mmSz);
}
ctx.strokeStyle="#7ef7f0";ctx.lineWidth=1.8;
ctx.strokeRect(mmX,mmY,mmSz,mmSz);
const span=this.halfExtent*2;
const toMMX=(wx)=>mmX + ((wx + this.halfExtent)/Math.max(1,span))*mmSz;
const toMMY=(wy)=>mmY + ((wy + this.halfExtent)/Math.max(1,span))*mmSz;
ctx.fillStyle="#ffd700";
ctx.fillRect(toMMX(0) - 2.5,toMMY(0) - 2.5,5,5);
const pmx=toMMX(this.pl.x);const pmy=toMMY(this.pl.y);
ctx.fillStyle="#ffffff";ctx.strokeStyle="#000000";ctx.lineWidth=1.2;
ctx.beginPath();ctx.arc(pmx,pmy,3.5,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.font="bold 9.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7f0";
ctx.fillText(`${this.acres.toLocaleString("vi-VN")} mẫu • #${this.worldGen?(this.worldGen.seed % 100000) :0}`,mmX + mmSz*0.5,mmY + mmSz + 12);
ctx.restore();
}

close() {
this.active=false;
if (this._rafId) {cancelAnimationFrame(this._rafId);this._rafId=null;}
this.keys={};
if (this._screen) this._screen.classList.add("hidden");
const g=this.sys&&this.sys.game;
if (g&&g.ui) {
g.ui.updateHubTopbar();
if (g.ui.activeHubTab==="tab-blessed-land") g.ui.renderBlessedLandTab();
}
}
}

global.BlessedLandExplorer=BlessedLandExplorer;
})(window);
