(function (global) {
"use strict";

const MAX_STORED_BEASTS=24;

const FORMATIONS={
guard:{
id:"guard",
name:"Hộ Chủ",
icon:"🛡️",
color:"#5cc995",
atkMult:1.0,
defMult:1.25,
spdMult:1.05,
aggroRadius:280,
desc:"Bao bọc hộ vệ quanh Cổ Sư (+25% Phòng Ngự), đánh chặn quái áp sát và che chắn cho chủ nhân."
},
assault:{
id:"assault",
name:"Tập Kích",
icon:"⚔️",
color:"#ff6b35",
atkMult:1.28,
defMult:0.92,
spdMult:1.18,
aggroRadius:620,
desc:"Tổng lực xông pha tập kích Boss và mục tiêu gần nhất (+28% Công Kích, +18% Tốc Độ)."
},
scatter:{
id:"scatter",
name:"Tản Ra",
icon:"🌪️",
color:"#4ce6ff",
atkMult:1.12,
defMult:1.05,
spdMult:1.24,
aggroRadius:480,
desc:"Tản đội hình đánh tạt sườn nhiều mục tiêu cùng lúc (+24% Tốc Độ, né AoE cực tốt)."
}
};

const FORMATION_ORDER=["guard","assault","scatter"];

const BEAST_TIERS=[
{tier:0,name:"Dã Thú",       badge:"★",     hpMult:1.00,atkMult:1.00,defMult:1.00,scale:0.96,reqLevel:1, bloodCost:0, meatCost:0, stoneCost:0,   color:"#a8b8b0"},
{tier:1,name:"Bách Thú Vương",badge:"★★",   hpMult:1.45,atkMult:1.35,defMult:1.30,scale:1.06,reqLevel:3, bloodCost:1, meatCost:3, stoneCost:120, color:"#5cc995"},
{tier:2,name:"Thiên Thú Vương",badge:"★★★", hpMult:2.10,atkMult:1.85,defMult:1.70,scale:1.16,reqLevel:6, bloodCost:3, meatCost:5, stoneCost:450, color:"#4ce6ff"},
{tier:3,name:"Vạn Thú Vương", badge:"★★★★", hpMult:3.10,atkMult:2.55,defMult:2.25,scale:1.26,reqLevel:10,bloodCost:6, meatCost:8, stoneCost:1400,color:"#c278ff"},
{tier:4,name:"Thú Hoàng",     badge:"👑",    hpMult:4.60,atkMult:3.55,defMult:3.00,scale:1.36,reqLevel:15,bloodCost:10,meatCost:12,stoneCost:3800,color:"#ffd700"},
{tier:5,name:"Thái Cổ Hoang Thú",badge:"🐉",hpMult:7.00,atkMult:5.20,defMult:4.20,scale:1.48,reqLevel:22,bloodCost:18,meatCost:18,stoneCost:9500,color:"#ff5252"}
];

const ENSLAVE_GU_TIERS=[
{id:"no_le_gu_r1",rank:1,maxTargetRank:2,bonusChance:0.10,name:"Nhất Chuyển Nô Thú Cổ"},
{id:"no_le_gu_r2",rank:2,maxTargetRank:3,bonusChance:0.18,name:"Nhị Chuyển Nô Thú Cổ"},
{id:"no_le_gu_r3",rank:3,maxTargetRank:5,bonusChance:0.26,name:"Tam Chuyển Nô Thú Cổ"},
{id:"no_le_gu_r4",rank:4,maxTargetRank:7,bonusChance:0.34,name:"Tứ Chuyển Nô Thú Cổ"},
{id:"no_le_gu_r5",rank:5,maxTargetRank:9,bonusChance:0.45,name:"Ngũ Chuyển Nô Lệ Cổ"}
];

function getMaxSquadSlots(aperture,player) {
const rank=(aperture&&aperture.rank)?aperture.rank :1;
let slots=3;
if (rank>=3) slots=4;
if (rank>=5) slots=5;
if (player&&player.pathAttainment&&player.pathAttainment["Nô Đạo"]) {
const att=String(player.pathAttainment["Nô Đạo"]);
if (att.includes("Đại Sư")||att.includes("Tông Sư")||att.includes("Vô Thượng")) {
slots +=1;
}
}
return Math.min(6,slots);
}

function getTierInfo(tierIdx) {
const i=Math.max(0,Math.min(BEAST_TIERS.length - 1,Number(tierIdx)||0));
return BEAST_TIERS[i];
}

function getExpForNextLevel(level) {
const lv=Math.max(1,Number(level)||1);
return Math.round(45 + lv*28 + lv*lv*6);
}

function computeBeastStats(rec,player) {
const rank=Math.max(1,Math.min(9,Number(rec.rank)||1));
const lv=Math.max(1,Number(rec.level)||1);
const tierInfo=getTierInfo(rec.tier||0);
const daoAmp=(player&&typeof player.calculateDaoAmplification==="function")
?Math.min(3.5,player.calculateDaoAmplification("Nô Đạo",[]).multiplier)
:1.0;
const lvMult=1 + (lv - 1)*0.11;
const maxHp=Math.max(80,Math.round((rec.baseHp||160)*tierInfo.hpMult*lvMult*(0.85 + daoAmp*0.15)));
const atk=Math.max(10,Math.round((rec.baseAtk||18)*tierInfo.atkMult*lvMult*daoAmp));
const def=Math.max(5,Math.round((rec.baseDef||10)*tierInfo.defMult*lvMult*(0.85 + daoAmp*0.15)));
const spd=Math.min(265,Math.round((rec.baseSpd||132)*(1 + (tierInfo.tier*0.04))));
return {maxHp,atk,def,spd,daoAmp,tierInfo};
}

function calculateCaptureChance(target,guTier,player,aperture) {
if (!target) return 0;
const hpPct=Math.max(0,Math.min(1,(target.hp||1) / Math.max(1,target.maxHp||1)));
const missingHpBonus=(1 - hpPct)*0.48; // up to +48% when low HP!
const pRank=(aperture&&aperture.rank)?aperture.rank :1;
const tRank=target.rank||1;
const rankDelta=(pRank - tRank)*0.07;
const guBonus=guTier?guTier.bonusChance :0.02;
const noDaoExp=(player&&player.pathAttainmentExp&&player.pathAttainmentExp["Nô Đạo"])||0;
const pathBonus=Math.min(0.22,noDaoExp*0.0008);
const bossPenalty=target.isBoss? -0.18 :(target.isElite? -0.07 :0);
const raw=0.34 + missingHpBonus + guBonus + rankDelta + pathBonus + bossPenalty;
return Math.max(0.08,Math.min(0.95,raw));
}

global.VanCoBeastArmyData={
MAX_STORED_BEASTS,
FORMATIONS,
FORMATION_ORDER,
BEAST_TIERS,
ENSLAVE_GU_TIERS,
getMaxSquadSlots,
getTierInfo,
getExpForNextLevel,
computeBeastStats,
calculateCaptureChance
};
})(window);
