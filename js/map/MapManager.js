(function (global) {
"use strict";
const {TILE_SIZE,GRID_COLS,GRID_ROWS,WORLD_WIDTH,WORLD_HEIGHT,ARENA_RADIUS,TILE_TYPES,STAGE_THEMES,BIOME_FLORA_PACKS,WORLD_REGIONS,TRADITIONAL_HOURS,WEATHER_TYPES}=global.VanCoMapData;
class MapManager {
constructor() {
this.tileSize=TILE_SIZE;
this.cols=GRID_COLS;
this.rows=GRID_ROWS;
this.worldWidth=WORLD_WIDTH;
this.worldHeight=WORLD_HEIGHT;
this.arenaRadius=ARENA_RADIUS;
this.camera={
x:1600,
y:1600,
width:1280,
height:720,
screenWidth:1280,
screenHeight:720,
zoom:1.0,
minZoom:0.15,
maxZoom:20.0
};
this.worldTime={
year:1,
day:1,
hourFloat:9.0,
weatherIndex:0,
weatherTimer:90
};
this.currentStageId=null;
this.activeTheme=STAGE_THEMES.stage_1;
this.arenaCenterX=4000;
this.arenaCenterY=4000;
this.grid=[];
this.decorations=[];
this.resourceNodes=[];
this.weatherParticles=[];
this._chunkSizeTiles=16;
this._chunkCache=new Map();
this._decorByChunk=new Map();
this._waterSpansByChunk=new Map();
this._waterShoresByChunk=new Map();
this.waterRipples=[];
this._dynamicPropsByChunk=new Map();
this.fallingLeaves=[];
this.rockDebris=[];
this._vignetteCanvas=null;
this._vignetteKey='';
this.worldMap=global.WorldMap?new global.WorldMap(this) :null;
this._initWeatherParticles();
this.applyStageTheme({
id:"stage_1",
arenaCenterX:4000,
arenaCenterY:4000,
reqRank:1
});
}
_seededRandom(x,y,seedOffset=0) {
const sin=Math.sin((x + seedOffset)*12.9898 + (y + seedOffset)*78.233)*43758.5453;
return sin - Math.floor(sin);
}
getRandomWalkablePoint(centerX=this.arenaCenterX,centerY=this.arenaCenterY,minRadius=180,maxRadius=1220) {
for (let attempt=0;attempt<35;attempt++) {
const angle=Math.random()*Math.PI*2;
const dist=minRadius + Math.random()*Math.max(40,maxRadius - minRadius);
const px=Math.round(centerX + Math.cos(angle)*dist);
const py=Math.round(centerY + Math.sin(angle)*dist);
if (this.isWalkable(px,py,18)) {
return {x:px,y:py};
}
}
return {
x:Math.max(160,Math.min(this.worldWidth - 160,Math.round(centerX + 220))),
y:Math.max(160,Math.min(this.worldHeight - 160,Math.round(centerY + 220)))
};
}
applyStageTheme(stageObj) {
if (!stageObj) return;
const stageId=stageObj.id||"stage_1";
this.currentStageId=stageId;
this.activeTheme=STAGE_THEMES[stageId]||STAGE_THEMES.stage_1;
this.arenaCenterX=stageObj.arenaCenterX||4000;
this.arenaCenterY=stageObj.arenaCenterY||4000;
const wIdx=WEATHER_TYPES.findIndex(w=>w.id===this.activeTheme.weatherId);
this.worldTime.weatherIndex=wIdx>=0?wIdx :0;
let seed=parseInt(stageId.replace("stage_",""),10);
if (isNaN(seed)) {
seed=Array.from(stageId).reduce((acc,ch)=>acc + ch.charCodeAt(0),0) % 97 + 31;
}
this._buildThemedArenaGrid(seed);
this._spawnStageResourceNodes(stageObj);
}
_buildThemedArenaGrid(seed) {
this.grid=new Array(this.rows);
this.decorations=[];
this._chunkCache.clear();
this._decorByChunk.clear();
this._waterSpansByChunk.clear();
this._waterShoresByChunk.clear();
this.waterRipples=[];
this._dynamicPropsByChunk.clear();
this.fallingLeaves=[];
this.rockDebris=[];
const cx=this.arenaCenterX;
const cy=this.arenaCenterY;
const pattern=this.activeTheme.gridPattern;
const props=this.activeTheme.propTypes||["pine_tree"];
const flora=BIOME_FLORA_PACKS[this.currentStageId]||{
trees:["ancient_banyan","pine_tree","weeping_willow"],
rocks:["boulder_group","moss_rock","craggy_spire"],
ground:["wild_bush","fern_cluster","wildflowers","earth_mound","pebble_cluster","fallen_log"]
};

for (let r=0;r<this.rows;r++) {
this.grid[r]=new Array(this.cols);
for (let c=0;c<this.cols;c++) {
if (r<=2||r>=this.rows - 3||c<=2||c>=this.cols - 3) {
this.grid[r][c]=TILE_TYPES.CLIFF_BORDER;
continue;
}
const wx=c*TILE_SIZE + TILE_SIZE / 2;
const wy=r*TILE_SIZE + TILE_SIZE / 2;
const distFromArena=Math.hypot(wx - cx,wy - cy);
const noise=this._seededRandom(c,r,seed*17);
const noise2=this._seededRandom(c + 53,r - 31,seed*29 + 7);
// Smooth natural grove clustering wave for forests & rocky outcrops
const groveWave=Math.sin(c*0.14 + seed*0.7)*Math.cos(r*0.14 - seed*0.5) + 0.45*Math.sin((c + r)*0.09 + seed);

let tile=((r + c) % 2===0)?TILE_TYPES.GROUND_PRIMARY :TILE_TYPES.GROUND_SECONDARY;
if (distFromArena<=this.arenaRadius) {
const dxC=wx - cx;
const dyC=wy - cy;
const isMainRoad=Math.abs(dxC)<54||Math.abs(dyC)<54;
const isDiagRoad=Math.abs(Math.abs(dxC) - Math.abs(dyC))<40&&distFromArena<2180;
const isRingRoad=Math.abs(distFromArena - 680)<38||Math.abs(distFromArena - 1480)<40||Math.abs(distFromArena - 2280)<36;
const riverWave=Math.sin(wx*0.0036 + seed)*320;
const riverWave2=Math.cos(wy*0.0034 - seed)*300;
const inWindingStream=(Math.abs(dyC - riverWave)<78)||(Math.abs(dxC - riverWave2)<68&&distFromArena>950);

if (pattern==="imperial_plaza") {
const octDist=Math.max(Math.abs(dxC),Math.abs(dyC),(Math.abs(dxC) + Math.abs(dyC))*0.707);
if (isMainRoad||isDiagRoad||Math.abs(octDist - 680)<38||Math.abs(octDist - 1480)<40||Math.abs(octDist - 2220)<34) {
tile=TILE_TYPES.ANCIENT_PATH;
} else if (octDist<260||Math.abs(octDist - 1080)<48) {
tile=TILE_TYPES.SPIRIT_FLOOR;
}
} else if (pattern==="blood_pool"||pattern==="lava_cracks") {
if (isMainRoad||isDiagRoad||Math.abs(distFromArena - 1480)<36) {
tile=TILE_TYPES.ANCIENT_PATH;
} else if ((Math.abs(distFromArena - 560)<135||Math.abs(distFromArena - 1880)<145)&&noise>0.22) {
tile=TILE_TYPES.HAZARD_SHALLOW;
} else if (distFromArena<210) {
tile=TILE_TYPES.SPIRIT_FLOOR;
}
} else if (pattern==="river_waves") {
if (distFromArena<=260||Math.abs(distFromArena - 1060)<60||Math.abs(distFromArena - 1960)<55) {
tile=TILE_TYPES.SPIRIT_FLOOR;
} else if (isMainRoad||isDiagRoad) {
tile=TILE_TYPES.ANCIENT_PATH;
} else if (Math.abs(dyC - Math.sin(wx*0.0026)*380)<460||((r + Math.floor(c / 2)) % 4===0)) {
tile=TILE_TYPES.HAZARD_SHALLOW;
}
} else if (pattern==="crystal_rings"||pattern==="cloud_rings") {
if (isRingRoad||distFromArena<230||(Math.abs(distFromArena - 1080)<52&&noise>0.32)) {
tile=TILE_TYPES.SPIRIT_FLOOR;
} else if (isMainRoad||isDiagRoad) {
tile=TILE_TYPES.ANCIENT_PATH;
} else if (inWindingStream&&distFromArena>340) {
tile=TILE_TYPES.HAZARD_SHALLOW;
}
} else if (pattern==="sand_dunes") {
const oasisDist=Math.min(
Math.hypot(dxC - 680,dyC - 420),
Math.hypot(dxC + 720,dyC + 360),
Math.hypot(dxC - 160,dyC + 880),
Math.hypot(dxC + 1280,dyC - 920),
Math.hypot(dxC - 1340,dyC + 860)
);
if (oasisDist<145) tile=TILE_TYPES.HAZARD_SHALLOW;
else if (oasisDist<215||distFromArena<200) tile=TILE_TYPES.SPIRIT_FLOOR;
else if (isMainRoad||isRingRoad) tile=TILE_TYPES.ANCIENT_PATH;
} else if (pattern==="bone_palace") {
if (isMainRoad||isDiagRoad||(Math.abs(dxC)<200&&Math.abs(dyC)<200)) {
tile=TILE_TYPES.SPIRIT_FLOOR;
} else if (isRingRoad) {
tile=TILE_TYPES.ANCIENT_PATH;
}
} else {
if (isMainRoad||isRingRoad||isDiagRoad) {
tile=TILE_TYPES.ANCIENT_PATH;
} else if (inWindingStream&&distFromArena>280) {
tile=TILE_TYPES.HAZARD_SHALLOW;
} else if (distFromArena<205||(noise>0.87&&distFromArena>240)) {
tile=TILE_TYPES.SPIRIT_FLOOR;
}
}

// Natural rocky cliff outcrops scattered off roads for genuine terrain cover
if (
distFromArena>420&&
distFromArena<this.arenaRadius - 140&&
!isMainRoad&&
!isDiagRoad&&
!isRingRoad&&
!inWindingStream&&
((noise>0.978)||(groveWave< -0.88&&noise>0.945))
) {
tile=TILE_TYPES.CLIFF_BORDER;
}
} else if (distFromArena>this.arenaRadius + 75&&noise>0.46) {
tile=TILE_TYPES.CLIFF_BORDER;
}
this.grid[r][c]=tile;

// 3-LAYER RICH NATURAL DECORATION PLACEMENT (BAKED INTO CHUNKS -> 144 FPS!)
if (
tile!==TILE_TYPES.CLIFF_BORDER&&
tile!==TILE_TYPES.ANCIENT_PATH&&
distFromArena>220&&
distFromArena<this.arenaRadius + 140
) {
let chosenProp=null;
const inOuterForest=(distFromArena>this.arenaRadius - 220);

if (tile===TILE_TYPES.HAZARD_SHALLOW) {
// Occasional lotus / water rock in streams & pools
if (noise>0.955) {
chosenProp=(pattern==="blood_pool"||pattern==="lava_cracks")?flora.rocks[0] :"stone_lotus";
}
} else {
// Layer 1: Natural Forest Groves (cluster-based trees!)
const treeThresh=inOuterForest?0.78 :(groveWave>0.38?0.83 :0.935);
if (noise>treeThresh) {
chosenProp=flora.trees[(r*3 + c*5) % flora.trees.length];
} else if (noise2>0.925&&groveWave< -0.12) {
// Layer 2: Rocky Outcrops, Boulders, Ruins & Earth Mounds
chosenProp=flora.rocks[(r*7 + c*3) % flora.rocks.length];
} else if (noise>0.79&&noise<=0.855) {
// Layer 3: Lush Ground Cover (Wild Bushes, Ferns, Flowers, Soil Mounds, Fallen Logs, Pebbles)
chosenProp=flora.ground[(r*11 + c*7) % flora.ground.length];
} else if (noise2>0.885&&noise2<=0.915) {
// Layer 4: Signature Theme Props
chosenProp=props[(r + c) % props.length];
}
}

if (chosenProp) {
// Subtle jitter inside tile so forests & rocks look organic, never grid-aligned!
const jx=(noise2 - 0.5)*16;
const jy=(noise - 0.5)*14;
const maRef=global.MapArtRenderer;
const isTree=Boolean(maRef&&typeof maRef.isLivingTree==="function"&&maRef.isLivingTree(chosenProp));
const isRock=Boolean(maRef&&typeof maRef.isInteractiveRock==="function"&&maRef.isInteractiveRock(chosenProp));
const ck=`${Math.floor(c / this._chunkSizeTiles)}_${Math.floor(r / this._chunkSizeTiles)}`;
if (isTree||isRock) {
const dynItem={
x:wx + jx,y:wy + jy,type:chosenProp,
isTree,isRock,
radius:isRock?16 :12,
swayPhase:noise2*6.28,
rustleTimer:0,leafCd:0,
hp:isRock?85 :100,maxHp:85,cracked:false,hitFlash:0,broken:false
};
let dBucket=this._dynamicPropsByChunk.get(ck);
if (!dBucket) {dBucket=[];this._dynamicPropsByChunk.set(ck,dBucket);}
dBucket.push(dynItem);
} else {
const decItem={x:wx + jx,y:wy + jy,type:chosenProp};
this.decorations.push(decItem);
let bucket=this._decorByChunk.get(ck);
if (!bucket) {bucket=[];this._decorByChunk.set(ck,bucket);}
bucket.push(decItem);
}
}
}
}
}
this._buildWaterChunkMetadata();
}
_buildWaterChunkMetadata() {
this._waterSpansByChunk.clear();
this._waterShoresByChunk.clear();
const cs=this._chunkSizeTiles;
const maxCX=Math.ceil(this.cols / cs);
const maxCY=Math.ceil(this.rows / cs);
const isW=(rr,cc)=>(rr>=0&&rr<this.rows&&cc>=0&&cc<this.cols&&this.grid[rr][cc]===TILE_TYPES.HAZARD_SHALLOW);
for (let cy=0;cy<maxCY;cy++) {
const r0=cy*cs;const r1=Math.min(this.rows,r0 + cs);
for (let cx=0;cx<maxCX;cx++) {
const c0=cx*cs;const c1=Math.min(this.cols,c0 + cs);
const spans=[];
const shores=[];
for (let r=r0;r<r1;r++) {
let runStart=-1;
let topStart=-1;
let botStart=-1;
for (let c=c0;c<=c1;c++) {
const w=(c<c1)&&isW(r,c);
if (w&&runStart=== -1) runStart=c;
else if (!w&&runStart!== -1) {
spans.push({x:runStart*TILE_SIZE,y:r*TILE_SIZE,w:(c - runStart)*TILE_SIZE,h:TILE_SIZE});
runStart=-1;
}
const hasTop=w&& !isW(r - 1,c);
if (hasTop&&topStart=== -1) topStart=c;
else if (!hasTop&&topStart!== -1) {
shores.push({x1:topStart*TILE_SIZE + 2,y1:r*TILE_SIZE + 5,x2:c*TILE_SIZE - 2,y2:r*TILE_SIZE + 5,horiz:true});
topStart=-1;
}
const hasBot=w&& !isW(r + 1,c);
if (hasBot&&botStart=== -1) botStart=c;
else if (!hasBot&&botStart!== -1) {
shores.push({x1:botStart*TILE_SIZE + 2,y1:(r + 1)*TILE_SIZE - 4,x2:c*TILE_SIZE - 2,y2:(r + 1)*TILE_SIZE - 4,horiz:true});
botStart=-1;
}
if (w&& !isW(r,c - 1)) {
shores.push({x1:c*TILE_SIZE + 4,y1:r*TILE_SIZE + 2,x2:c*TILE_SIZE + 4,y2:(r + 1)*TILE_SIZE - 2,horiz:false});
}
if (w&& !isW(r,c + 1)) {
shores.push({x1:(c + 1)*TILE_SIZE - 4,y1:r*TILE_SIZE + 2,x2:(c + 1)*TILE_SIZE - 4,y2:(r + 1)*TILE_SIZE - 2,horiz:false});
}
}
}
if (spans.length>0) this._waterSpansByChunk.set(`${cx}_${cy}`,spans);
if (shores.length>0) this._waterShoresByChunk.set(`${cx}_${cy}`,shores);
}
}
}
isWaterAt(x,y) {
const col=Math.floor(x / TILE_SIZE);
const row=Math.floor(y / TILE_SIZE);
if (row<0||row>=this.rows||col<0||col>=this.cols) return false;
return this.grid[row][col]===TILE_TYPES.HAZARD_SHALLOW;
}
getLiquidStyle() {
if (global.MapArtRenderer&&typeof global.MapArtRenderer.getLiquidStyle==="function") {
return global.MapArtRenderer.getLiquidStyle(this.activeTheme,this.currentStageId);
}
return {kind:"water",rippleCol:"rgba(205,248,255,0.78)"};
}
spawnWaterRipple(x,y,isSplash=false,color=null) {
if (!this.waterRipples) this.waterRipples=[];
if (this.waterRipples.length>=28) this.waterRipples.shift();
const liq=this.getLiquidStyle();
this.waterRipples.push({
x,y,
startR:isSplash?6 :4,
maxR:isSplash?38 :24,
life:isSplash?0.58 :0.48,
maxLife:isSplash?0.58 :0.48,
isSplash:Boolean(isSplash),
color:color||liq.rippleCol
});
}
_spawnStageResourceNodes(stageObj) {
this.resourceNodes=[];
const rank=stageObj.reqRank||1;
const isSpecial=Boolean(stageObj.isSpecialResourceStage);
const resPool=this.activeTheme.stageResources||["spirit_herb","primeval_stone","wild_gu"];
const nodeMetaMap={
primeval_stone:{name:"Mạch Nguyên Thạch Lộ Thiên",icon:"💎",color:"#4cd964",itemId:"primeval_stone",min:Math.max(1,rank),max:Math.max(2,Math.round(rank*2))},
spirit_herb:{name:"Bụi Thanh Linh Thảo",icon:"🌿",color:"#5cc995",itemId:"spirit_herb",min:1,max:1},
ration_meat:{name:"Bãi Săn Thịt Thú Rừng",icon:"🍖",color:"#e67e22",itemId:"ration_meat",min:1,max:1},
moon_orchid:{name:"Khóm Nguyệt Lan Hoa",icon:"🌸",color:"#e6a8d7",itemId:"moon_orchid",min:1,max:1},
bronze_ore:{name:"Mạch Thanh Đồng Khoáng",icon:"🪨",color:"#8aa69b",itemId:"bronze_ore",min:1,max:1},
red_iron_ore:{name:"Mạch Xích Thiết Tinh Khoáng",icon:"🧱",color:"#e05252",itemId:"red_iron_ore",min:1,max:1},
wind_essence_crystal:{name:"Phong Tuyền Tinh Thạch",icon:"🎐",color:"#6ce6b8",itemId:"wind_essence_crystal",min:1,max:1},
beast_blood_core:{name:"Huyết Tinh Ngưng Tụ",icon:"🩸",color:"#d93838",itemId:"beast_blood_core",min:1,max:1},
jade_bone:{name:"Cốt Tủy Bạch Ngọc",icon:"🦴",color:"#dce8f2",itemId:"jade_bone",min:1,max:1},
hundred_year_ginseng:{name:"Bách Niên Khổ Sâm",icon:"🥕",color:"#f7c948",itemId:"hundred_year_ginseng",min:1,max:1},
soul_crystal:{name:"Đãng Hồn Tinh Thạch",icon:"🔮",color:"#c278ff",itemId:"soul_crystal",min:1,max:1},
remnant_recipe:{name:"Bia Đá Cổ Phương Tàn Quyển",icon:"📜",color:"#f7c948",itemId:"remnant_recipe",min:1,max:1},
relic_chest:{name:"Cổ Mộ Xá Lợi Cổ (1% Xá Lợi)",icon:"⚱️",color:"#ffd700",isRelicChest:true,min:1,max:1},
human_qi_lotus:{name:"Nhân Khí Linh Liên",icon:"☯️",color:"#00e5ff",isHumanQiNode:true,min:1,max:1},
immortal_stone_vein:{name:"Mạch Tiên Nguyên Thạch (Hiếm)",icon:"🌟",color:"#ffd700",isImmortalVein:true,veinTier:1,min:1,max:1},
supreme_immortal_vein:{name:"Thánh Mạch Tiên Thạch Chí Tôn",icon:"👑",color:"#00e5ff",isImmortalVein:true,veinTier:2,min:1,max:2},
wild_gu:{name:"Cổ Trùng Hoang Dã Ẩn Nấp",icon:"🪲",color:"#ffd700",isWildGu:true}
};
const totalNodes=isSpecial?18 :24;
const nodeCharges=isSpecial?1 :2;
const nodeRespawn=isSpecial?75 :55;
for (let i=0;i<totalNodes;i++) {
const key=resPool[i % resPool.length];
const meta=nodeMetaMap[key]||nodeMetaMap.primeval_stone;
const pt=this.getRandomWalkablePoint(this.arenaCenterX,this.arenaCenterY,220,this.arenaRadius - 160);
this.resourceNodes.push({
id:`stage_node_${i + 1}`,
type:key,
name:meta.name,
icon:meta.icon,
color:meta.color,
x:pt.x,
y:pt.y,
dangerRank:rank,
itemId:(meta.isWildGu||meta.isRelicChest||meta.isHumanQiNode||meta.isImmortalVein)?null :(meta.itemId||key),
isWildGu:Boolean(meta.isWildGu),
isRelicChest:Boolean(meta.isRelicChest),
isHumanQiNode:Boolean(meta.isHumanQiNode),
isImmortalVein:Boolean(meta.isImmortalVein),
veinTier:meta.veinTier||1,
minYield:meta.min||1,
maxYield:meta.max||1,
charges:nodeCharges,
maxCharges:nodeCharges,
respawnTime:nodeRespawn,
respawnTimer:0
});
}
}
_initWeatherParticles() {
this.weatherParticles=[];
for (let i=0;i<95;i++) {
this.weatherParticles.push({
x:Math.random()*2800,
y:Math.random()*1800,
len:6 + Math.random()*10,
speedX:-1.5,
speedY:5 + Math.random()*4
});
}
}
setZoom(newZoom) {
const clamped=Math.max(
this.camera.minZoom,
Math.min(this.camera.maxZoom,Number(newZoom)||1.0)
);
this.camera.zoom=Number(clamped.toFixed(2));
if (this.camera.screenWidth&&this.camera.screenHeight) {
this.camera.width=this.camera.screenWidth / this.camera.zoom;
this.camera.height=this.camera.screenHeight / this.camera.zoom;
}
return this.camera.zoom;
}
adjustZoom(delta) {
const cur=this.camera.zoom||1.0;
const steps=Math.abs(delta) / 0.10;
const mult=delta>=0?Math.pow(1.18,steps) :Math.pow(1 / 1.18,steps);
return this.setZoom(cur*mult);
}
screenToWorld(screenX,screenY) {
const z=this.camera.zoom||1.0;
return {
x:(screenX / z) + this.camera.x,
y:(screenY / z) + this.camera.y
};
}
worldToScreen(worldX,worldY) {
const z=this.camera.zoom||1.0;
return {
x:(worldX - this.camera.x)*z,
y:(worldY - this.camera.y)*z
};
}
update(dt,player,canvasWidth,canvasHeight) {
const activeStage=global.vanCoTienDoGame&&global.vanCoTienDoGame.activeStage;
if (activeStage&&activeStage.id!==this.currentStageId) {
this.applyStageTheme(activeStage);
}
const z=this.camera.zoom||1.0;
if (canvasWidth&&canvasHeight) {
this.camera.screenWidth=canvasWidth;
this.camera.screenHeight=canvasHeight;
this.camera.width=canvasWidth / z;
this.camera.height=canvasHeight / z;
}
if (player) {
const targetX=player.x - this.camera.width / 2;
const targetY=player.y - this.camera.height / 2;
this.camera.x +=(targetX - this.camera.x)*Math.min(1,dt*8);
this.camera.y +=(targetY - this.camera.y)*Math.min(1,dt*8);
if (this.camera.width>=this.worldWidth) {
this.camera.x=(this.worldWidth - this.camera.width)*0.5;
} else {
this.camera.x=Math.max(0,Math.min(this.worldWidth - this.camera.width,this.camera.x));
}
if (this.camera.height>=this.worldHeight) {
this.camera.y=(this.worldHeight - this.camera.height)*0.5;
} else {
this.camera.y=Math.max(0,Math.min(this.worldHeight - this.camera.height,this.camera.y));
}
}
this.worldTime.hourFloat +=dt*0.08;
if (this.worldTime.hourFloat>=24) {
this.worldTime.hourFloat -=24;
this.worldTime.day +=1;
}
if (this.waterRipples&&this.waterRipples.length>0) {
for (let i=this.waterRipples.length - 1;i>=0;i--) {
this.waterRipples[i].life -=dt;
if (this.waterRipples[i].life<=0) this.waterRipples.splice(i,1);
}
}
if (this.fallingLeaves&&this.fallingLeaves.length>0) {
for (let i=this.fallingLeaves.length - 1;i>=0;i--) {
const lf=this.fallingLeaves[i];
lf.x +=lf.vx*dt;lf.y +=lf.vy*dt;lf.life -=dt;
if (lf.life<=0) this.fallingLeaves.splice(i,1);
}
}
if (this.rockDebris&&this.rockDebris.length>0) {
for (let i=this.rockDebris.length - 1;i>=0;i--) {
const rd=this.rockDebris[i];
rd.x +=rd.vx*dt;rd.y +=rd.vy*dt;rd.vy +=340*dt;rd.life -=dt;
if (rd.life<=0) this.rockDebris.splice(i,1);
}
}
// Player brushing past living trees triggers wind rustle & falling leaves!
if (player&&this._dynamicPropsByChunk&&this._dynamicPropsByChunk.size>0) {
const chunkPx=this._chunkSizeTiles*TILE_SIZE;
const pcx=Math.floor(player.x / chunkPx);
const pcy=Math.floor(player.y / chunkPx);
const dProps=this._dynamicPropsByChunk.get(`${pcx}_${pcy}`);
if (dProps) {
for (let i=0;i<dProps.length;i++) {
const pr=dProps[i];
if (pr.broken) continue;
if (pr.rustleTimer>0) pr.rustleTimer=Math.max(0,pr.rustleTimer - dt);
if (pr.leafCd>0) pr.leafCd=Math.max(0,pr.leafCd - dt);
if (pr.hitFlash>0) pr.hitFlash=Math.max(0,pr.hitFlash - dt);
if (pr.isTree&&player.isMoving&&pr.leafCd<=0&&Math.hypot(player.x - pr.x,player.y - pr.y)<44) {
pr.rustleTimer=0.45;pr.leafCd=1.0;
const col=(global.MapArtRenderer&&global.MapArtRenderer.getPropLeafColor)?global.MapArtRenderer.getPropLeafColor(pr.type) :"#5cc995";
const _lowQ=global.vanCoSettings&&global.vanCoSettings.get("graphicsQuality")==="low";
if (!_lowQ&&this.fallingLeaves.length<36) {
for (let k=0;k<3;k++) {
this.fallingLeaves.push({x:pr.x + (Math.random() - 0.5)*26,y:pr.y - 26 + Math.random()*12,vx:14 + Math.random()*22,vy:18 + Math.random()*16,col,life:1.1,maxLife:1.1});
}
}
}
}
}
}
for (const node of this.resourceNodes) {
if (node.charges<=0) {
node.respawnTimer -=dt;
if (node.respawnTimer<=0) {
node.charges=node.maxCharges;
node.respawnTimer=0;
}
}
}
}
isWalkable(x,y,radius=12,jumpZ=0) {
if (
x - radius<TILE_SIZE*3||
y - radius<TILE_SIZE*3||
x + radius>this.worldWidth - TILE_SIZE*3||
y + radius>this.worldHeight - TILE_SIZE*3
) {
return false;
}
const col=Math.floor(x / TILE_SIZE);
const row=Math.floor(y / TILE_SIZE);
if (row<0||row>=this.rows||col<0||col>=this.cols) return false;
if (this.grid[row][col]===TILE_TYPES.CLIFF_BORDER) {
if (jumpZ>=22&&Math.hypot(x - this.arenaCenterX,y - this.arenaCenterY)<this.arenaRadius - 60) {
return true;
}
return false;
}
// 2.5D Interactive Rock Collision (leaped over cleanly when jumping with jumpZ >= 20!)
if (jumpZ<20&&radius>=10&&this._dynamicPropsByChunk&&this._dynamicPropsByChunk.size>0) {
const chunkPx=this._chunkSizeTiles*TILE_SIZE;
const rcx=Math.floor(x / chunkPx);
const rcy=Math.floor(y / chunkPx);
const dProps=this._dynamicPropsByChunk.get(`${rcx}_${rcy}`);
if (dProps) {
for (let i=0;i<dProps.length;i++) {
const pr=dProps[i];
if (pr.isRock&& !pr.broken&&Math.hypot(x - pr.x,y - pr.y)<(pr.radius + radius - 6)) {
return false;
}
}
}
}
return true;
}
damageRocksInRadius(x,y,radius,damage,player=null,combatSystem=null) {
if (!this._dynamicPropsByChunk||this._dynamicPropsByChunk.size===0) return 0;
const chunkPx=this._chunkSizeTiles*TILE_SIZE;
const c0x=Math.floor((x - radius - 24)/chunkPx);
const c1x=Math.floor((x + radius + 24)/chunkPx);
const c0y=Math.floor((y - radius - 24)/chunkPx);
const c1y=Math.floor((y + radius + 24)/chunkPx);
let brokenCount=0;
for (let cy=c0y;cy<=c1y;cy++) {
for (let cx=c0x;cx<=c1x;cx++) {
const dProps=this._dynamicPropsByChunk.get(`${cx}_${cy}`);
if (!dProps) continue;
for (let i=0;i<dProps.length;i++) {
const pr=dProps[i];
if (!pr.isRock||pr.broken) continue;
if (Math.hypot(pr.x - x,pr.y - y)<=radius + pr.radius) {
pr.hp -=Math.max(25,damage*0.35);
pr.cracked=true;pr.hitFlash=0.14;
if (this.rockDebris.length<40) {
for (let k=0;k<4;k++) {
const a=Math.random()*Math.PI*2;const s=50 + Math.random()*110;
this.rockDebris.push({x:pr.x,y:pr.y - 8,vx:Math.cos(a)*s,vy:Math.sin(a)*s - 35,sz:3 + Math.random()*3,col:"#838c88",life:0.5,maxLife:0.5});
}
}
if (pr.hp<=0) {
pr.broken=true;brokenCount +=1;
if (player) {
const bonus=3 + Math.floor(Math.random()*6);
player.primevalStones +=bonus;
if (combatSystem) combatSystem.spawnFloatingText(pr.x,pr.y - 22,`🪨 Vỡ Đá +${bonus}💎`,"#e2bf75");
}
}
}
}
}
}
return brokenCount;
}
getRegionAt(x,y) {
for (const reg of WORLD_REGIONS) {
if (x>=reg.x&&x<=reg.x + reg.width&&y>=reg.y&&y<=reg.y + reg.height) {
return reg;
}
}
return {
id:"stage_arena",
name:this.activeTheme?this.activeTheme.name :"Bí Cảnh Lịch Luyện",
category:"Chiến Trường",
dangerRank:1,
heavenQi:120,
earthQi:120
};
}
getEnvironmentQiAt(x,y) {
const reg=this.getRegionAt(x,y);
return {
regionName:reg.name,
heaven:reg.heavenQi||120,
earth:reg.earthQi||120
};
}
getNearestInteractableNode(x,y,maxDist=56) {
let best=null;
let bestDist=maxDist;
for (const node of this.resourceNodes) {
if (node.charges<=0) continue;
const d=Math.hypot(node.x - x,node.y - y);
if (d<=bestDist) {
bestDist=d;
best=node;
}
}
return best;
}
harvestNode(nodeId,player,guSystem) {
const node=this.resourceNodes.find(n=>n.id===nodeId);
if (!node||node.charges<=0) {
return {success:false,message:"Điểm tài nguyên này đã khai thác hết, đang hấp thu linh khí tái sinh."};
}
if (node.isWildGu) {
node.charges -=1;
if (node.charges<=0) node.respawnTimer=node.respawnTime;
if (guSystem&&typeof guSystem.attemptCaptureWildGu==="function") {
const res=guSystem.attemptCaptureWildGu(player,node.dangerRank||1);
res.floatingText="🪲 Bắt Cổ Hoang Dã!";
return res;
}
return {success:true,floatingText:"🪲 Bắt Cổ Hoang Dã!",message:"Đã bắt được một Cổ Trùng Hoang Dã!"};
}
if (node.isRelicChest) {
node.charges -=1;
if (node.charges<=0) node.respawnTimer=node.respawnTime;
const playerRank=(player&&player.aperture)?player.aperture.rank :1;
const relicByRank={
1:"bronze_relic_gu",
2:"red_iron_relic_gu",
3:"white_silver_relic_gu",
4:"yellow_gold_relic_gu",
5:"purple_crystal_relic_gu"
};
if (Math.random()<=0.01) {
const chosenRelicId=relicByRank[Math.min(5,Math.max(1,playerRank))]||"white_silver_relic_gu";
if (player&&typeof player.addItem==="function") player.addItem(chosenRelicId,1);
const rMeta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[chosenRelicId])||{name:"Xá Lợi Cổ",icon:"⚪"};
return {
success:true,
itemId:chosenRelicId,
amount:1,
floatingText:`${rMeta.icon} CỰC HIẾM +1 ${rMeta.name}!`,
message:`⚱️ Cơ duyên nghịch thiên (1%)! Khai quật [${node.name}] nhận được 1x 【${rMeta.name}】!`
};
} else {
const stones=2 + Math.floor(Math.random()*4);
const gotRecipe=Math.random()<=0.06;
if (player&&typeof player.addItem==="function") {
player.addItem("primeval_stone",stones);
if (gotRecipe) player.addItem("remnant_recipe",1);
}
return {
success:true,
itemId:gotRecipe?"remnant_recipe" :"primeval_stone",
amount:stones,
floatingText:gotRecipe?`📜 +1 Tàn Phương & +${stones}💎` :`💎 +${stones} Nguyên Thạch`,
message:`⚱️ Khai quật [${node.name}] thu được 💎 ${stones} Nguyên Thạch${gotRecipe?" và 1x [Cổ Phương Tàn Quyển]" :""}.`
};
}
}
if (node.isHumanQiNode) {
const qiGain=1;
node.charges -=1;
if (node.charges<=0) node.respawnTimer=node.respawnTime;
if (player&&player.aperture) {
player.aperture.humanQi +=qiGain;
}
const gotSoul=Math.random()<=0.08;
if (gotSoul&&player&&typeof player.addItem==="function") {
player.addItem("soul_crystal",1);
}
return {
success:true,
amount:qiGain,
floatingText:`☯️ +${qiGain} Nhân Khí${gotSoul?" & +1🔮" :""}`,
message:`☯️ Hấp thu tinh hoa từ [${node.name}] nhận +${qiGain} Nhân Khí${gotSoul?" và 1x [Đãng Hồn Thạch Đan]" :""}!`
};
}
if (node.isImmortalVein) {
node.charges -=1;
if (node.charges<=0) node.respawnTimer=node.respawnTime;
const isSupreme=node.veinTier>=2;
const roll=Math.random();
const hitChance=isSupreme?0.65 :0.40;
if (roll<=hitChance) {
const qty=(isSupreme&&Math.random()<=0.25)?2 :1;
if (player&&typeof player.addItem==="function") player.addItem("immortal_stone",qty);
return {
success:true,
itemId:"immortal_stone",
amount:qty,
floatingText:`🌟 +${qty} Tiên Thạch`,
message:`🌟 Khai thác [${node.name}] tách được ${qty} viên [Tiên Nguyên Thạch]!`
};
} else {
const fallbackStones=isSupreme?(18 + Math.floor(Math.random()*20)) :(8 + Math.floor(Math.random()*12));
if (player&&typeof player.addItem==="function") player.addItem("primeval_stone",fallbackStones);
return {
success:true,
itemId:"primeval_stone",
amount:fallbackStones,
floatingText:`💎 +${fallbackStones} Nguyên Thạch`,
message:`💎 Mạch Tiên Thạch chỉ kết tinh được phần rìa: thu được ${fallbackStones} Nguyên Thạch.`
};
}
}
const amount=Math.floor(node.minYield + Math.random()*(node.maxYield - node.minYield + 1));
node.charges -=1;
if (node.charges<=0) {
node.respawnTimer=node.respawnTime;
}
if (player&&typeof player.addItem==="function") {
player.addItem(node.itemId,amount);
}
const itemMeta=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[node.itemId])||{name:node.name,icon:node.icon||"📦"};
return {
success:true,
itemId:node.itemId,
amount:amount,
floatingText:`${itemMeta.icon||node.icon} +${amount} ${itemMeta.name}`,
message:`Thu thập thành công ${amount}x [${itemMeta.name}] từ ${node.name}!`
};
}
getCurrentHourInfo() {
const idx=Math.floor((this.worldTime.hourFloat / 24)*12) % 12;
return TRADITIONAL_HOURS[idx];
}
getCurrentWeather() {
return WEATHER_TYPES[this.worldTime.weatherIndex]||WEATHER_TYPES[0];
}
getWorldClockText() {
const hInfo=this.getCurrentHourInfo();
return `Năm ${this.worldTime.year} - Ngày ${this.worldTime.day} - ${hInfo.name}`;
}
_getOrBuildTerrainChunk(cxIdx,cyIdx,allowBuild=true,maxCacheSize=160) {
const key=`${cxIdx}_${cyIdx}`;
const cached=this._chunkCache.get(key);
if (cached) {
// True LRU touch: keep recently visible chunks from ever being evicted!
this._chunkCache.delete(key);
this._chunkCache.set(key,cached);
return cached;
}
if (!allowBuild) return null;
const chunkTiles=this._chunkSizeTiles;
const chunkPx=chunkTiles*TILE_SIZE;
const off=document.createElement("canvas");
off.width=chunkPx;
off.height=chunkPx;
// Opaque offscreen canvas skips alpha blending during GPU drawImage blit!
const octx=off.getContext("2d",{alpha:false})||off.getContext("2d");
const startCol=cxIdx*chunkTiles;
const startRow=cyIdx*chunkTiles;
if (global.MapArtRenderer&&typeof global.MapArtRenderer.renderTerrainChunk==="function") {
global.MapArtRenderer.renderTerrainChunk(octx,this,cxIdx,cyIdx,TILE_TYPES);
} else {
const th=this.activeTheme||STAGE_THEMES.stage_1;
octx.fillStyle=th.cPrimary;
octx.fillRect(0,0,chunkPx,chunkPx);
}
const decs=this._decorByChunk.get(key);
if (decs&&decs.length) {
if (!decs._sorted) {
decs.sort((a,b)=>a.y - b.y);
decs._sorted=true;
}
const ox=startCol*TILE_SIZE;
const oy=startRow*TILE_SIZE;
for (let i=0;i<decs.length;i++) {
const dec=decs[i];
this._renderDecorationProp(octx,dec.x - ox,dec.y - oy,dec.type,0);
}
}
const cap=Math.max(64,maxCacheSize||160);
while (this._chunkCache.size>=cap) {
const oldestKey=this._chunkCache.keys().next().value;
this._chunkCache.delete(oldestKey);
}
this._chunkCache.set(key,off);
return off;
}
renderWorld(ctx) {
if (!ctx) return;
const activeStage=global.vanCoTienDoGame&&global.vanCoTienDoGame.activeStage;
if (activeStage&&activeStage.id!==this.currentStageId) {
this.applyStageTheme(activeStage);
}
const camX=Math.floor(this.camera.x);
const camY=Math.floor(this.camera.y);
const chunkPx=this._chunkSizeTiles*TILE_SIZE;
const maxChunkX=Math.floor((this.cols - 1) / this._chunkSizeTiles);
const maxChunkY=Math.floor((this.rows - 1) / this._chunkSizeTiles);
const cStartX=Math.max(0,Math.floor(camX / chunkPx));
const cEndX=Math.min(maxChunkX,Math.floor((camX + this.camera.width) / chunkPx));
const cStartY=Math.max(0,Math.floor(camY / chunkPx));
const cEndY=Math.min(maxChunkY,Math.floor((camY + this.camera.height) / chunkPx));
const isMob=document.body&&document.body.classList.contains("mobile-ui");
const visibleCount=(cEndX - cStartX + 1)*(cEndY - cStartY + 1);
// Dynamic LRU cache capacity GUARANTEES visible chunks NEVER evict each other at ANY zoom!
const dynamicCap=Math.min(272,Math.max(visibleCount + 40,isMob?96 :220));
// Progressive frame budget scales gently on wide zoom-out without frame drops!
const wideZoom=(this.camera.zoom||1.0)<0.45;
const maxNewBuildsPerFrame=(this._chunkCache.size===0)?(isMob?4 :8) :(wideZoom?(isMob?3 :6) :(isMob?2 :4));
const centerCX=(camX + this.camera.width*0.5) / chunkPx;
const centerCY=(camY + this.camera.height*0.5) / chunkPx;
const th=this.activeTheme||STAGE_THEMES.stage_1;
const missingList=[];

for (let cy=cStartY;cy<=cEndY;cy++) {
const drawY=cy*chunkPx - camY;
for (let cx=cStartX;cx<=cEndX;cx++) {
const chunkCanvas=this._getOrBuildTerrainChunk(cx,cy,false,dynamicCap);
if (chunkCanvas) {
ctx.drawImage(chunkCanvas,cx*chunkPx - camX,drawY);
} else {
missingList.push({cx,cy,drawX:cx*chunkPx - camX,drawY,d2:(cx + 0.5 - centerCX)*(cx + 0.5 - centerCX) + (cy + 0.5 - centerCY)*(cy + 0.5 - centerCY)});
}
}
}
if (missingList.length>0) {
if (missingList.length>maxNewBuildsPerFrame) {
missingList.sort((a,b)=>a.d2 - b.d2);
}
for (let i=0;i<missingList.length;i++) {
const m=missingList[i];
if (i<maxNewBuildsPerFrame) {
const built=this._getOrBuildTerrainChunk(m.cx,m.cy,true,dynamicCap);
if (built) ctx.drawImage(built,m.drawX,m.drawY);
} else {
// Instant biome base fill for 1–3 frames until progressive baker finishes this chunk
ctx.fillStyle=th.cPrimary||"#102118";
ctx.fillRect(m.drawX,m.drawY,chunkPx,chunkPx);
}
}
}

const t=performance.now()*0.004;
if (global.MapArtRenderer&&typeof global.MapArtRenderer.renderLiveWater==="function") {
global.MapArtRenderer.renderLiveWater(ctx,this,camX,camY,t,cStartX,cEndX,cStartY,cEndY);
}
if (global.MapArtRenderer&&typeof global.MapArtRenderer.renderStageLandmarks==="function") {
global.MapArtRenderer.renderStageLandmarks(ctx,this,camX,camY,t);
}
for (let i=0;i<this.resourceNodes.length;i++) {
const node=this.resourceNodes[i];
if (node.charges<=0) continue;
const nx=node.x - camX;
const ny=node.y - camY;
if (nx< -50||ny< -50||nx>this.camera.width + 50||ny>this.camera.height + 50) continue;
if (global.MapArtRenderer&&typeof global.MapArtRenderer.renderResourceNode==="function") {
global.MapArtRenderer.renderResourceNode(ctx,nx,ny,node,t);
}
}
}
renderDynamicPropsForeground(ctx,player) {
if (!ctx|| !this._dynamicPropsByChunk||this._dynamicPropsByChunk.size===0) return;
if (!global.MapArtRenderer||typeof global.MapArtRenderer.drawDynamicProp!=="function") return;
const camX=Math.floor(this.camera.x);
const camY=Math.floor(this.camera.y);
const viewW=this.camera.width;
const viewH=this.camera.height;
const chunkPx=this._chunkSizeTiles*TILE_SIZE;
const maxChunkX=Math.floor((this.cols - 1) / this._chunkSizeTiles);
const maxChunkY=Math.floor((this.rows - 1) / this._chunkSizeTiles);
const cStartX=Math.max(0,Math.floor(camX / chunkPx));
const cEndX=Math.min(maxChunkX,Math.floor((camX + viewW) / chunkPx));
const cStartY=Math.max(0,Math.floor(camY / chunkPx));
const cEndY=Math.min(maxChunkY,Math.floor((camY + viewH) / chunkPx));
const t=performance.now()*0.004;
const curZoom=(this.camera&&this.camera.zoom)?this.camera.zoom :1.0;
const fastStaticLod=(curZoom<0.45);
const stride=(curZoom<0.32)?2 :1;
const drawFast=global.MapArtRenderer.drawCachedProp;

for (let cy=cStartY;cy<=cEndY;cy++) {
for (let cx=cStartX;cx<=cEndX;cx++) {
const list=this._dynamicPropsByChunk.get(`${cx}_${cy}`);
if (!list||list.length===0) continue;
if (!list._sorted) {list.sort((a,b)=>a.y - b.y);list._sorted=true;}
for (let i=0;i<list.length;i+=stride) {
const dec=list[i];
if (dec.broken) continue;
const sx=dec.x - camX;const sy=dec.y - camY;
if (sx< -64||sy< -74||sx>viewW + 64||sy>viewH + 64) continue;
if (fastStaticLod&&drawFast&& !dec.cracked) {
drawFast(ctx,sx,sy,dec.type);
} else {
global.MapArtRenderer.drawDynamicProp(ctx,dec,camX,camY,t,player);
}
}
}
}
// Draw falling leaves & shattered stone debris!
if (this.fallingLeaves&&this.fallingLeaves.length>0) {
ctx.save();
for (let i=0;i<this.fallingLeaves.length;i++) {
const lf=this.fallingLeaves[i];
const lx=lf.x - camX;const ly=lf.y - camY;
if (lx< -20||ly< -20||lx>viewW + 20||ly>viewH + 20) continue;
ctx.globalAlpha=Math.max(0,lf.life / lf.maxLife);
ctx.fillStyle=lf.col;
ctx.beginPath();ctx.ellipse(lx,ly,3.5,2,t*4 + i,0,Math.PI*2);ctx.fill();
}
ctx.restore();
}
if (this.rockDebris&&this.rockDebris.length>0) {
ctx.save();
for (let i=0;i<this.rockDebris.length;i++) {
const rd=this.rockDebris[i];
const rx=rd.x - camX;const ry=rd.y - camY;
if (rx< -20||ry< -20||rx>viewW + 20||ry>viewH + 20) continue;
ctx.globalAlpha=Math.max(0,rd.life / rd.maxLife);
ctx.fillStyle=rd.col;
ctx.fillRect(rx,ry,rd.sz,rd.sz);
}
ctx.restore();
}
}
_renderDecorationProp(ctx,dx,dy,type,t) {
if (global.MapArtRenderer&&typeof global.MapArtRenderer.renderProp==="function") {
global.MapArtRenderer.renderProp(ctx,dx,dy,type,t);
}
}
renderLightingAndWeather(ctx,player) {
if (!ctx) return;
// Runs in 1:1 SCREEN SPACE (outside ctx.scale(zoom,zoom)) so zoom-out has ZERO extra fillrate!
const w=this.camera.screenWidth||ctx.canvas.width||1280;
const h=this.camera.screenHeight||ctx.canvas.height||720;
const hourInfo=this.getCurrentHourInfo();
const weather=this.getCurrentWeather();
const _weatherOn=global.vanCoSettings?global.vanCoSettings.get("weatherEffects") :true;
const _vigOn=global.vanCoSettings?global.vanCoSettings.get("vignetteEnabled") :true;
const _gQual=global.vanCoSettings?global.vanCoSettings.get("graphicsQuality") :"high";
if (_weatherOn&&(weather.id==="spirit_rain"||weather.id==="thunder_storm"||weather.id==="gale")) {
ctx.save();
ctx.strokeStyle=weather.id==="gale"
?"rgba(180, 235, 210, 0.28)"
:"rgba(120, 195, 255, 0.35)";
ctx.lineWidth=1.2;
const isMob=document.body&&document.body.classList.contains("mobile-ui");
const _qScale=_gQual==="low"?0.3 :(_gQual==="medium"?0.65 :1.0);
const pLimit=Math.max(12,Math.round((isMob?Math.min(36,this.weatherParticles.length) :this.weatherParticles.length)*_qScale));
const isGale=weather.id==="gale";
ctx.beginPath();
for (let i=0;i<pLimit;i++) {
const p=this.weatherParticles[i];
p.x +=isGale? -7 :p.speedX;
p.y +=isGale?2 :p.speedY;
if (p.y>h) p.y=0;
if (p.x<0) p.x=w;
else if (p.x>w) p.x=p.x % Math.max(1,w);
ctx.moveTo(p.x,p.y);
ctx.lineTo(p.x + (isGale? -14 :-3),p.y + p.len);
}
ctx.stroke();
ctx.restore();
}
if (_weatherOn&&weather.tint!=="rgba(0, 0, 0, 0)") {
ctx.fillStyle=weather.tint;
ctx.fillRect(0,0,w,h);
}
const darknessAlpha=Number((1.0 - hourInfo.lightLevel).toFixed(2));
if (_vigOn&&darknessAlpha>0.05&&player) {
// Fixed ultra-fast 256x144 vignette texture — NEVER rebuilds on zoom & 100x lighter fillrate!
const vw=256;
const vh=144;
const alphaKey=Math.min(0.46,darknessAlpha).toFixed(2);
if (this._vignetteKey!==alphaKey) {
this._vignetteKey=alphaKey;
if (!this._vignetteCanvas) {
this._vignetteCanvas=document.createElement("canvas");
this._vignetteCanvas.width=vw;
this._vignetteCanvas.height=vh;
}
const vctx=this._vignetteCanvas.getContext("2d");
const vGrad=vctx.createRadialGradient(vw / 2,vh / 2,vh*0.30,vw / 2,vh / 2,vw*0.58);
vGrad.addColorStop(0,"rgba(4, 6, 12, 0)");
vGrad.addColorStop(1,`rgba(4, 6, 14, ${alphaKey})`);
vctx.clearRect(0,0,vw,vh);
vctx.fillStyle=vGrad;
vctx.fillRect(0,0,vw,vh);
}
if (this._vignetteCanvas) {
ctx.drawImage(this._vignetteCanvas,0,0,w,h);
}
}
}
renderMinimap(ctx,player,enemies=[],npcs=[],stageManager=null,eventManager=null) {
if (!ctx|| !player) return;
const mw=ctx.canvas.width;
const mh=ctx.canvas.height;
const th=this.activeTheme||STAGE_THEMES.stage_1;
const viewSpan=this.arenaRadius*2 + 200;
const originX=this.arenaCenterX - viewSpan / 2;
const originY=this.arenaCenterY - viewSpan / 2;
const scale=mw / viewSpan;
ctx.fillStyle=th.cPrimary||"#070a0f";
ctx.fillRect(0,0,mw,mh);
ctx.strokeStyle="#b89758";
ctx.lineWidth=1.2;
ctx.beginPath();
ctx.arc(mw / 2,mh / 2,this.arenaRadius*scale,0,Math.PI*2);
ctx.stroke();
for (const node of this.resourceNodes) {
if (node.charges<=0) continue;
const nx=(node.x - originX)*scale;
const ny=(node.y - originY)*scale;
ctx.fillStyle=node.isWildGu?"#ffd700" :"#5cc995";
ctx.fillRect(nx - 1.5,ny - 1.5,3,3);
}
if (stageManager) {
if (stageManager.defenseCore) {
const cxm=(stageManager.defenseCore.x - originX)*scale;
const cym=(stageManager.defenseCore.y - originY)*scale;
ctx.fillStyle="#4ce6ff";
ctx.fillRect(cxm - 3,cym - 3,6,6);
}
for (const prop of (stageManager.props||[])) {
const pxm=(prop.x - originX)*scale;
const pym=(prop.y - originY)*scale;
ctx.fillStyle=prop.activated?"#5cc995" :"#ffd700";
ctx.beginPath();
ctx.arc(pxm,pym,3,0,Math.PI*2);
ctx.fill();
}
}
if (eventManager&&eventManager.activeBattleEvent) {
const ev=eventManager.activeBattleEvent;
const exm=(ev.x - originX)*scale;
const eym=(ev.y - originY)*scale;
ctx.fillStyle="#ff85d5";
ctx.beginPath();
ctx.arc(exm,eym,3.5,0,Math.PI*2);
ctx.fill();
}
for (const npc of npcs) {
if (npc.isDead) continue;
const nx=(npc.x - originX)*scale;
const ny=(npc.y - originY)*scale;
ctx.fillStyle=npc.isHostile?"#ff6b6b" :"#5aa9e6";
ctx.beginPath();
ctx.arc(nx,ny,3.0,0,Math.PI*2);
ctx.fill();
}
for (const en of enemies) {
if (en.isDead) continue;
const ex=(en.x - originX)*scale;
const ey=(en.y - originY)*scale;
if (en.isBountyTarget) {
ctx.fillStyle="#d966ff";
ctx.beginPath();ctx.arc(ex,ey,4.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=1;ctx.stroke();
} else if (en.isAmbushEnforcer) {
ctx.fillStyle="#ff3b30";
ctx.beginPath();ctx.arc(ex,ey,en.isAmbushLeader?4.2 :3.0,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffd700";ctx.lineWidth=1;ctx.stroke();
} else if (en.isBoss) {
ctx.fillStyle=en.isVenerable?"#00ffff" :"#ffd700";
ctx.fillRect(ex - 3.5,ey - 3.5,7,7);
} else if (en.isElite) {
ctx.fillStyle="#c278ff";
ctx.fillRect(ex - 2.2,ey - 2.2,4.4,4.4);
} else {
ctx.fillStyle="#ff4d4d";
ctx.fillRect(ex - 1.8,ey - 1.8,3.6,3.6);
}
}
const armyRef=global.vanCoTienDoGame&&global.vanCoTienDoGame.beastArmy;
if (armyRef&&Array.isArray(armyRef.activeUnits)) {
ctx.fillStyle="#38e8a8";
for (const u of armyRef.activeUnits) {
if (u.isDead) continue;
const ux=(u.x - originX)*scale;
const uy=(u.y - originY)*scale;
ctx.beginPath();ctx.arc(ux,uy,2.6,0,Math.PI*2);ctx.fill();
}
}
const px=(player.x - originX)*scale;
const py=(player.y - originY)*scale;
ctx.fillStyle="#ffffff";
ctx.beginPath();
ctx.arc(px,py,3.5,0,Math.PI*2);
ctx.fill();
}
renderFullWorldMap(ctx,player) {
if (!ctx) return;
const w=ctx.canvas.width;
const h=ctx.canvas.height;
ctx.fillStyle="#080b10";
ctx.fillRect(0,0,w,h);
}
toSaveData() {
return {
worldTime:this.worldTime,
currentStageId:this.currentStageId,
cameraZoom:this.camera.zoom
};
}
fromSaveData(data) {
if (!data) return;
if (data.worldTime) {
this.worldTime={...this.worldTime,...data.worldTime};
}
if (typeof data.cameraZoom==="number") {
this.setZoom(data.cameraZoom);
}
}
}
MapManager.WORLD_REGIONS=WORLD_REGIONS;
MapManager.WEATHER_TYPES=WEATHER_TYPES;
MapManager.STAGE_THEMES=STAGE_THEMES;
MapManager.ARENA_RADIUS=ARENA_RADIUS;
global.MapManager=MapManager;
})(window);
