(function (global) {
"use strict";

const BIOME_SPECS={
water:{
id:"water",name:"🌊 Hồ & Sông Linh Thủy",
baseCol:"#14536e",altCol:"#0d3c52",mapCol:"#1a6d8f",
treeCol:"#2d8a68",rockCol:"#4e615d",
trees:["weeping_willow"],rocks:["moss_rock"],ground:["stone_lotus"]
},
jade_meadow:{
id:"jade_meadow",name:"🌿 Thảo Nguyên Ngọc",
baseCol:"#132d21",altCol:"#1a3d2c",mapCol:"#23593e",
treeCol:"#287a4e",rockCol:"#69736e",
trees:["ancient_banyan","pine_tree","spirit_cypress","bamboo_clump_tall"],
rocks:["boulder_group","moss_rock","earth_mound"],
ground:["wild_bush","fern_cluster","wildflowers","fallen_log","pebble_cluster"]
},
peach_valley:{
id:"peach_valley",name:"🌸 Thung Lũng Đào Tiên",
baseCol:"#1a2e22",altCol:"#28362a",mapCol:"#4d6b47",
treeCol:"#e07eb8",rockCol:"#707872",
trees:["peach_blossom_tree","ancient_banyan","weeping_willow"],
rocks:["moss_rock","boulder_group","mossy_steps"],
ground:["wildflowers","moon_flower","wild_bush","pebble_cluster"]
},
bamboo_highland:{
id:"bamboo_highland",name:"🎋 Rừng Trúc Cao Nguyên",
baseCol:"#0d261c",altCol:"#153829",mapCol:"#184a36",
treeCol:"#38a86b",rockCol:"#5a6961",
trees:["bamboo_clump_tall","bamboo_stalk","spirit_cypress","ancient_banyan"],
rocks:["moss_rock","boulder_group","craggy_spire"],
ground:["fern_cluster","wild_bush","fallen_log","pebble_cluster"]
},
crimson_autumn:{
id:"crimson_autumn",name:"🍁 Rừng Phong Huyết",
baseCol:"#261d15",altCol:"#332419",mapCol:"#6e3824",
treeCol:"#c94a28",rockCol:"#756657",
trees:["crimson_maple","dead_gnarled_oak","pine_tree"],
rocks:["boulder_group","earth_mound","ruined_wall_seg"],
ground:["fallen_log","pebble_cluster","wild_bush","earth_mound"]
},
frost_peak:{
id:"frost_peak",name:"❄️ Hàn Ngọc Tuyết Sơn",
baseCol:"#25333d",altCol:"#324552",mapCol:"#6b8ca3",
treeCol:"#89c8e0",rockCol:"#a8dcf0",
trees:["frozen_pine","spirit_cypress"],
rocks:["ice_crystal","craggy_spire","boulder_group"],
ground:["pebble_cluster","mossy_steps","ice_crystal"]
},
crystal_glade:{
id:"crystal_glade",name:"🔮 Rừng Pha Lê Linh Mạch",
baseCol:"#1a152b",altCol:"#271d3d",mapCol:"#56367a",
treeCol:"#a862e8",rockCol:"#e078c8",
trees:["crystal_tree","peach_blossom_tree","giant_mushroom_tree"],
rocks:["pink_soul_crystal","craggy_spire","boulder_group"],
ground:["moon_flower","glowing_shroom","wildflowers","pebble_cluster"]
},
rocky_badlands:{
id:"rocky_badlands",name:"🪨 Đồi Đá Cổ Thạch",
baseCol:"#24211c",altCol:"#302b24",mapCol:"#595043",
treeCol:"#6e5d47",rockCol:"#857a6c",
trees:["dead_gnarled_oak","charred_tree","pine_tree"],
rocks:["craggy_spire","boulder_group","ruined_wall_seg","earth_mound"],
ground:["pebble_cluster","earth_mound","fallen_log","mossy_steps"]
}
};

function hash2D(ix,iy,seed) {
let h=(Math.imul(ix | 0,374761393) + Math.imul(iy | 0,668265263) + Math.imul(seed | 0,1442695041)) | 0;
h=(h ^ (h >>> 13)) | 0;
h=Math.imul(h,1274126177);
h=(h ^ (h >>> 16)) >>> 0;
return h / 4294967296;
}

function valueNoise2D(x,y,seed) {
const ix=Math.floor(x);
const iy=Math.floor(y);
const fx=x - ix;
const fy=y - iy;
const ux=fx*fx*fx*(fx*(fx*6 - 15) + 10);
const uy=fy*fy*fy*(fy*(fy*6 - 15) + 10);
const a=hash2D(ix,iy,seed);
const b=hash2D(ix + 1,iy,seed);
const c=hash2D(ix,iy + 1,seed);
const d=hash2D(ix + 1,iy + 1,seed);
const top=a + (b - a)*ux;
const bot=c + (d - c)*ux;
return (top + (bot - top)*uy)*2 - 1;
}

function fbm2D(x,y,seed,octaves=3) {
let sum=0;
let amp=0.5;
let norm=0;
let px=x;
let py=y;
for (let i=0;i<octaves;i++) {
sum +=valueNoise2D(px,py,seed + i*1013)*amp;
norm +=amp;
const nx=px*1.61 - py*1.21 + 31.7;
const ny=px*1.21 + py*1.61 - 19.3;
px=nx;
py=ny;
amp *=0.5;
}
return sum / norm;
}

class BlessedLandWorldGen {
constructor(worldSeed,halfExtent=24000) {
this.seed=(Number(worldSeed)|0)||Math.floor(100000 + Math.random()*900000000);
this.halfExtent=Math.max(960,Number(halfExtent)||24000);
// Adaptive continent scale so both 1,000 mẫu and 100,000 mẫu have grand, sweeping continents & rivers!
const cScale=Math.max(0.85,Math.min(4.2,this.halfExtent / 18000));
this.invScale=1 / cScale;
this.warpAmp=580*Math.min(2.6,cScale);

this.sWarpX=(this.seed ^ 0x1a2b3c4d) | 0;
this.sWarpY=(this.seed ^ 0x5e6f7a8b) | 0;
this.sElev=(this.seed ^ 0x2c4d6e8f) | 0;
this.sMoist=(this.seed ^ 0x71359bd3) | 0;
this.sTemp=(this.seed ^ 0x4f91a2c7) | 0;
this.sQi=(this.seed ^ 0x6b2e8351) | 0;
this.sRiverA=(this.seed ^ 0x3d7a19e5) | 0;
this.sRiverB=(this.seed ^ 0x9c4e21b7) | 0;
this.sForest=(this.seed ^ 0x528b74d1) | 0;
this.sRock=(this.seed ^ 0x18f3c6a9) | 0;
}

sampleTerrain(wx,wy) {
const inv=this.invScale;
const warpScale=0.00020*inv;
const wdx=fbm2D(wx*warpScale,wy*warpScale,this.sWarpX,2)*this.warpAmp;
const wdy=fbm2D(wx*warpScale + 17.3,wy*warpScale - 23.1,this.sWarpY,2)*this.warpAmp;
const ux=wx + wdx;
const uy=wy + wdy;

let elev=fbm2D(ux*0.00022*inv,uy*0.00022*inv,this.sElev,4);
const moist=fbm2D(ux*0.00018*inv,uy*0.00018*inv,this.sMoist,3);
const temp=fbm2D(ux*0.00016*inv,uy*0.00016*inv,this.sTemp,3);
const qi=fbm2D(ux*0.00025*inv,uy*0.00025*inv,this.sQi,3);

const distC=Math.hypot(wx,wy);
if (distC<560) {
const blend=Math.max(0,1 - distC / 560);
elev=elev*(1 - blend) + 0.08*blend;
}

let isRiver=false;
if (distC>470) {
const rNoiseA=fbm2D(ux*0.00026*inv,uy*0.00026*inv,this.sRiverA,3);
const rNoiseB=fbm2D(ux*0.00022*inv + 41.2,uy*0.00022*inv - 18.7,this.sRiverB,2);
const rWidthA=elev<0.24?(0.022 + Math.max(0,-elev)*0.020) :0;
const rWidthB=elev<0.16?(0.017 + Math.max(0,-elev)*0.016) :0;
if ((rWidthA>0&&Math.abs(rNoiseA)<rWidthA)||(rWidthB>0&&Math.abs(rNoiseB)<rWidthB)) {
isRiver=true;
}
}

const isLake=(distC>470&&elev< -0.26);
const isWater=isLake||isRiver;
const isBeach=(!isWater&&distC>470&&elev< -0.20);

let biomeId="jade_meadow";
if (isWater) {
biomeId="water";
} else if (qi>0.31) {
biomeId="crystal_glade";
} else if (elev>0.29&&temp<0.04) {
biomeId="frost_peak";
} else if (elev>0.25&&moist<0.07) {
biomeId="rocky_badlands";
} else if (temp>0.13&&moist>0.02) {
biomeId="peach_valley";
} else if (temp>0.07&&moist<=0.02) {
biomeId="crimson_autumn";
} else if (moist>0.18) {
biomeId="bamboo_highland";
} else {
biomeId="jade_meadow";
}

return {
biomeId,
biome:BIOME_SPECS[biomeId]||BIOME_SPECS.jade_meadow,
elev,moist,temp,qi,
isWater,isLake,isRiver,isBeach
};
}

sampleForestDensity(wx,wy) {
return fbm2D(wx*0.0014,wy*0.0014,this.sForest,2);
}

sampleRockDensity(wx,wy) {
return fbm2D(wx*0.0017,wy*0.0017,this.sRock,2);
}

buildOverviewMinimap(halfExtent,size=160) {
const c=document.createElement("canvas");
c.width=size;c.height=size;
const mctx=c.getContext("2d");
const img=mctx.createImageData(size,size);
const data=img.data;
const span=halfExtent*2;

const rgbMap={
water:[22,114,152],
jade_meadow:[32,96,64],
peach_valley:[96,124,84],
bamboo_highland:[20,76,54],
crimson_autumn:[124,62,38],
frost_peak:[122,158,184],
crystal_glade:[102,62,148],
rocky_badlands:[98,86,70]
};

for (let py=0;py<size;py++) {
const wy=-halfExtent + ((py + 0.5)/size)*span;
for (let px=0;px<size;px++) {
const wx=-halfExtent + ((px + 0.5)/size)*span;
const s=this.sampleTerrain(wx,wy);
const base=rgbMap[s.biomeId]||rgbMap.jade_meadow;
const shade=s.isWater?(s.isLake?0.85 :1.08) :(0.82 + Math.max(-0.2,Math.min(0.35,s.elev))*0.62);
const idx=(py*size + px)*4;
data[idx]=Math.max(0,Math.min(255,Math.round(base[0]*shade)));
data[idx + 1]=Math.max(0,Math.min(255,Math.round(base[1]*shade)));
data[idx + 2]=Math.max(0,Math.min(255,Math.round(base[2]*shade)));
data[idx + 3]=255;
}
}
mctx.putImageData(img,0,0);
return c;
}
}

global.BlessedLandWorldGen=BlessedLandWorldGen;
global.VanCoBlessedLandBiomes=BIOME_SPECS;
})(window);
