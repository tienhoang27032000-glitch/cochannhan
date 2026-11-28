(function (global) {
"use strict";
const {MIN_ASCENSION_HUMAN_QI,VENERABLE_REQ_DAO_MARKS,VENERABLE_REQ_MYRIAD_TRIBULATIONS,APTITUDE_TIERS,TEN_EXTREME_PHYSIQUES,MORTAL_SUBSTAGES,MORTAL_RANKS,IMMORTAL_RANKS,BLESSED_LAND_GRADES,RITUAL_STEPS_DATA}=global.VanCoApertureData;
Object.assign(global.ApertureSystem.prototype, {
isPseudoVenerable() {
return Boolean(this.isImmortal&&this.rank===8&&this.subStage===4);
},
getVenerableReadiness(player,game) {
const mainPath=(player&&player.mainPath)?player.mainPath :"Lực Đạo";
const mainMarks=(player&&player.daoMarks&&player.daoMarks[mainPath])?Math.floor(player.daoMarks[mainPath]) :0;
const myriadPassed=(this.immortalAperture&&this.immortalAperture.myriadTribulationsPassed)?this.immortalAperture.myriadTribulationsPassed :0;
const fateDestroyed=game&&typeof game.getStageClearCount==="function"
?game.getStageClearCount("stage_24")>0
:false;
const isPseudo=this.isPseudoVenerable();
const hasDaoMarks=mainMarks>=VENERABLE_REQ_DAO_MARKS;
const hasBlockade=Boolean(this.daoBlockadeBroken);
const hasMyriad=myriadPassed>=VENERABLE_REQ_MYRIAD_TRIBULATIONS;
return {
isPseudoVenerable:isPseudo,
isAlreadyVenerable:this.isImmortal&&this.rank>=9,
mainPath:mainPath,
mainMarks:mainMarks,
reqMarks:VENERABLE_REQ_DAO_MARKS,
hasDaoMarks:hasDaoMarks,
fateDestroyed:fateDestroyed,
hasBlockade:hasBlockade,
myriadPassed:myriadPassed,
reqMyriad:VENERABLE_REQ_MYRIAD_TRIBULATIONS,
hasMyriad:hasMyriad,
canBreakBlockade:isPseudo&& !hasBlockade&&fateDestroyed,
canAscendVenerable:isPseudo&&hasDaoMarks&&hasBlockade&&hasMyriad
};
},
attemptBreakDaoBlockade(player,game) {
if (!this.isPseudoVenerable()) {
return {success:false,message:"Chỉ cường giả đạt cảnh giới 【Á Tiên Tôn】 mới đủ tư cách xung kích Phong Tỏa Thiên Đạo!"};
}
if (this.daoBlockadeBroken) {
return {success:false,message:"Ngươi đã đột phá Phong Tỏa Thiên Đạo rồi!"};
}
const fateDestroyed=game&&typeof game.getStageClearCount==="function"
?game.getStageClearCount("stage_24")>0
:false;
if (!fateDestroyed) {
return {
success:false,
message:"Túc Mệnh Cổ tại Thiên Đình vẫn còn tồn tại! Hãy vượt qua 【Ải 24: Thiên Đình Trung Châu — Túc Mệnh Đại Chiến】 để phá hủy Túc Mệnh Cổ trước khi đột phá Phong Tỏa Thiên Đạo!"
};
}
const essenceReq=60;
const qiReq=250;
const mentalReq=160;
const curEss=this.immortalEssence[8]||0;
if (curEss<essenceReq) {
return {success:false,message:`Không đủ Bạch Lệ Tiên Nguyên (Cần ${essenceReq} viên, hiện có ${curEss.toFixed(1)} viên)!`};
}
if (this.humanQi<qiReq) {
return {success:false,message:`Nhân Khí chưa đủ hùng hậu để phá vỡ xiềng xích Thiên Đạo (Cần ${qiReq}, hiện có ${Math.floor(this.humanQi)})!`};
}
if (player&&player.mental<mentalReq) {
return {success:false,message:`Tinh Thần Lực không đủ (${Math.floor(player.mental)}/${mentalReq})!`};
}
if (player&&player.hp<Math.round(player.maxHp*0.65)) {
return {success:false,message:"Sinh Mệnh phải đạt trên 65% mới chịu nổi phản phệ của Thiên Đạo!"};
}
this.immortalEssence[8]=Math.max(0,curEss - essenceReq);
this.humanQi=Math.max(0,this.humanQi - qiReq);
if (player) {
player.mental=Math.max(0,player.mental - mentalReq);
player.hp=Math.max(1,player.hp - Math.round(player.maxHp*0.55));
}
this.daoBlockadeBroken=true;
return {
success:true,
message:"🌌 OANH!! Đạo ngân bản mệnh va chạm trực diện với ý chí trời đất — NGƯƠI ĐÃ ĐỘT PHÁ THÀNH CÔNG PHONG TỎA THIÊN ĐẠO! Con đường chứng đạo Cửu Chuyển Tôn Giả đã mở toang!"
};
},
attemptAscendToVenerable(player,game) {
const check=this.getVenerableReadiness(player,game);
if (check.isAlreadyVenerable) {
return {success:false,message:"Ngươi đã là Cửu Chuyển Tôn Giả đứng trên đỉnh thiên địa!"};
}
if (!check.isPseudoVenerable) {
return {success:false,message:"Cần đột phá lên cảnh giới 【Á Tiên Tôn】 trước khi chứng đạo Thành Tôn!"};
}
if (!check.hasDaoMarks) {
return {
success:false,
message:`Chưa đủ 30 Vạn Đạo Ngân! Lưu phái 【${check.mainPath}】 hiện mới đạt ${check.mainMarks.toLocaleString("vi-VN")} / 300.000 Đạo Ngân.`
};
}
if (!check.hasBlockade) {
return {
success:false,
message:"Chưa Đột Phá Phong Tỏa Thiên Đạo! Hãy hoàn thành Ải 24 (phá Túc Mệnh Cổ) rồi bấm nút 'Xung Kích Đột Phá Phong Tỏa Thiên Đạo'."
};
}
if (!check.hasMyriad) {
return {
success:false,
message:`Chưa vượt qua đủ 3 lần Vạn Kiếp! Hiện mới độ qua ${check.myriadPassed} / 3 lần Vạn Kiếp.`
};
}
this.rank=9;
this.subStage=0;
this.daoLordPath=check.mainPath;
this.naturalDaoMarksRefined=50000;
this.immortalAperture.gradeName="Chí Tôn Tiên Khiếu Động Thiên";
this.immortalAperture.spaceAcres +=25000;
this.immortalAperture.subStageTribulationsPassed=0;
this.immortalAperture.subStageTribulationsRequired=this.getManualTribulationRequirements().tribulationsNeededForNextStage;
this.wallProgress=0;
this.maxWallProgress=this.immortalAperture.subStageTribulationsRequired;
this.immortalEssence[9]=Math.max(15,(this.immortalEssence[9]||0) + 15);
if (player&&typeof player.recalculateStats==="function") {
player.recalculateStats();
player.hp=player.maxHp;
player.mental=player.maxMental;
}
return {
success:true,
daoLordPath:this.daoLordPath,
message:`👑 [CHỨNG ĐẠO THÀNH TÔN — ĐỘC BÁ VẠN CỔ] Ngũ Vực chấn động, Lưỡng Thiên rung chuyển! Ngươi chính thức tấn thăng 【Cửu Chuyển Tôn Giả】, trở thành 【${this.daoLordPath} ĐẠO CHỦ】 (khởi đầu luyện hóa 50.000 Đạo Ngân tự nhiên, +15 viên Hoàng Hạnh Tiên Nguyên, giảm 30% tiêu hao Tiên Nguyên & khuếch đại cực hạn toàn bộ cổ thuật ${this.daoLordPath})!`
};
},
refineNaturalDaoMarks(player) {
if (!this.isImmortal||this.rank<9|| !this.daoLordPath) {
return {success:false,message:"Chỉ Cửu Chuyển Tôn Giả đã trở thành Đạo Chủ mới có thể Luyện Hóa Đạo Ngân Tự Nhiên!"};
}
const essCost=8;
const mentalCost=50;
const curEss=this.immortalEssence[9]||0;
if (curEss<essCost) {
return {success:false,message:`Cần ${essCost} viên Hoàng Hạnh Tiên Nguyên để luyện hóa Đạo Ngân Tự Nhiên (Hiện có: ${curEss.toFixed(1)} viên)!`};
}
if (player&&player.mental<mentalCost) {
return {success:false,message:`Cần ${mentalCost} Tinh Thần Lực để dẫn động Đạo Ngân Thiên Địa!`};
}
this.immortalEssence[9]=Math.max(0,curEss - essCost);
if (player) {
player.mental=Math.max(0,player.mental - mentalCost);
player.addDaoMarks(this.daoLordPath,15000);
}
this.naturalDaoMarksRefined=(this.naturalDaoMarksRefined||0) + 25000;
return {
success:true,
message:`👑 [Quyền Năng ${this.daoLordPath} Đạo Chủ] Ngươi luyện hóa thêm +25.000 Đạo Ngân Tự Nhiên (Tổng: ${this.naturalDaoMarksRefined.toLocaleString("vi-VN")}) và +15.000 Đạo Ngân bản thân! Uy áp ${this.daoLordPath} bao trùm Ngũ Vực!`
};
},
getAscensionReadiness() {
const minHumanQi=MIN_ASCENSION_HUMAN_QI;
const isPeakRank5=this.rank>=5&&this.subStage>=3;
const isWallFull=this.wallProgress>=this.maxWallProgress;
const hasEnoughQi=this.humanQi>=minHumanQi;
return {
canAscend:!this.isImmortal&&isPeakRank5&&isWallFull&&hasEnoughQi,
isPeakRank5:isPeakRank5,
isWallFull:isWallFull,
hasEnoughQi:hasEnoughQi,
minHumanQi:minHumanQi,
currentHumanQi:Math.floor(this.humanQi),
wallProgress:Math.floor(this.wallProgress),
maxWallProgress:this.maxWallProgress
};
},
startImmortalAscension(environmentQi={heaven:150,earth:150}) {
if (this.isImmortal) {
return {success:false,message:"Ngươi đã là Cổ Tiên!"};
}
const readiness=this.getAscensionReadiness();
if (!readiness.isPeakRank5) {
return {
success:false,
message:`Chỉ Cổ Sư đạt Ngũ Chuyển Đỉnh Phong mới đủ tư cách Phá Khiếu Thăng Tiên (Hiện tại: ${this.getRealmDisplayName()})!`
};
}
if (!readiness.isWallFull) {
return {
success:false,
message:`Khiếu Bích Tinh Mạc Ngũ Chuyển Đỉnh Phong chưa đạt viên mãn (${readiness.wallProgress}/${readiness.maxWallProgress})! Chưa thể đập vỡ Khiếu Bích.`
};
}
if (!readiness.hasEnoughQi) {
return {
success:false,
message:`Nhân Khí tích lũy chưa đủ sâu dày (${readiness.currentHumanQi}/${readiness.minHumanQi})! Hãy vượt thêm Bản Đồ Lịch Luyện hoặc thăm dò Mộng Cảnh.`
};
}
const committedHumanQi=Math.max(MIN_ASCENSION_HUMAN_QI,Math.floor(this.humanQi));
const baseHeavenQi=Math.round(committedHumanQi*0.96);
const baseEarthQi=Math.round(committedHumanQi*0.98);
const initialBalance=Math.min(99,Math.round(78 + Math.min(20,(committedHumanQi - MIN_ASCENSION_HUMAN_QI)*0.10)));
this.ascensionState={
inProgress:true,
stage:1,
heavenQi:baseHeavenQi||environmentQi.heaven||150,
earthQi:baseEarthQi||environmentQi.earth||150,
humanQiCommitted:committedHumanQi,
balanceScore:initialBalance,
tribulationHp:100,
tribulationMaxHp:100,
logs:[
`🌌 [Giai đoạn 1/4 - Phá Khiếu] Ngươi dốc toàn bộ Tử Tinh Chân Nguyên đập nát Tinh Mạc Khiếu Bích! Bước đường thành Tiên chính thức bắt đầu (Độ cân bằng Tam Khí: ${initialBalance}%). Hãy bấm tiếp nút Thăng Tiên để dẫn động Thiên Địa Nhị Khí!`
]
};
return {
success:true,
ascensionState:this.ascensionState,
message:this.ascensionState.logs[0]
};
},
adjustThreeQi(actionType="stabilize") {
if (!this.ascensionState.inProgress) {
return {success:false,message:"Hiện chưa bắt đầu quá trình Thăng Tiên."};
}
if (actionType==="absorb_heaven") {
this.ascensionState.heavenQi +=15;
this.ascensionState.balanceScore=Math.min(100,this.ascensionState.balanceScore + 4);
} else if (actionType==="absorb_earth") {
this.ascensionState.earthQi +=15;
this.ascensionState.balanceScore=Math.min(100,this.ascensionState.balanceScore + 4);
} else if (actionType==="burn_human_qi") {
if (this.humanQi>=10) {
this.humanQi -=10;
this.ascensionState.humanQiCommitted +=20;
this.ascensionState.balanceScore=Math.min(100,this.ascensionState.balanceScore + 8);
}
} else if (actionType==="stabilize") {
this.ascensionState.balanceScore=Math.min(100,Math.max(82,this.ascensionState.balanceScore + 6));
}
return {
success:true,
balanceScore:this.ascensionState.balanceScore,
ascensionState:this.ascensionState
};
},
advanceAscensionStage(player) {
if (!this.ascensionState.inProgress) {
return this.startImmortalAscension();
}
const st=this.ascensionState;
if (st.stage===1) {
st.stage=2;
this.currentEssence=0;
this.adjustThreeQi("stabilize");
st.logs.push(
`🌩️ [Giai đoạn 2/4 - Tam Khí Hội Tụ] Thiên Khí từ chín tầng trời giáng xuống, Địa Khí từ lòng đất trào dâng hòa cùng ${st.humanQiCommitted} điểm Nhân Khí của ngươi thành kén khí khổng lồ! Hãy bấm tiếp để nghênh đón Thiên Kiếp Địa Tai!`
);
return {success:true,stage:2,state:st};
}
if (st.stage===2) {
st.stage=3;
st.logs.push(
`⚡ [Giai đoạn 3/4 - Độ Lôi Kiếp] Lôi kiếp vạn trượng giáng xuống khảo nghiệm đạo cơ! Nhờ nền tảng Nhân Khí hùng hậu (Độ dung hợp: ${st.balanceScore}%), ngươi hiên ngang đánh tan kiếp vân! Bấm lần cuối để Nổ Khiếu Hóa Phúc Địa!`
);
return {success:true,stage:3,state:st};
}
if (st.stage>=3) {
st.stage=4;
this._completeImmortalApertureFormation();
st.inProgress=false;
const successMsg=`🎉 [Đắc Đạo Thành Tiên] Tam Khí nổ tung khai thiên lập địa, hóa thành 【${this.immortalAperture.gradeName} (${this.immortalAperture.spaceAcres} mẫu)】! Chúc mừng đạo hữu chính thức tấn thăng 【${this.getRealmDisplayName()}】, sở hữu Lục Đề Tiên Nguyên!`;
st.logs.push(successMsg);
if (player) {
if (typeof player.grantInitialImmortalDaoMarks==="function") {
player.grantInitialImmortalDaoMarks();
}
if (typeof player.addDaoMarksFromTribulation==="function") {
player.addDaoMarksFromTribulation(120);
}
}
return {
success:true,
stage:4,
completed:true,
blessedLandGrade:this.immortalAperture.gradeName,
state:st
};
}
return {success:true,state:st};
},
_completeImmortalApertureFormation() {
const isTrueTenExtremeUnsealed=Boolean(this.aptitude.physique&& !this.tenExtremeSealed);
this.isImmortal=true;
this.rank=6;
this.subStage=0;
this.wallPressure=0;
this.hasExploded=false;
this._pressureWarned=false;
this.pressureFreezeTimer=0;
let gradeKey="MEDIUM";
const totalQi=this.ascensionState.heavenQi + this.ascensionState.earthQi + this.ascensionState.humanQiCommitted;
if (isTrueTenExtremeUnsealed||totalQi>=580||this.humanQi>=220) {
gradeKey="SUPER";
} else if (totalQi>=420||this.humanQi>=165) {
gradeKey="LARGE";
} else if (totalQi>=300) {
gradeKey="MEDIUM";
} else {
gradeKey="SMALL";
}
const cfg=BLESSED_LAND_GRADES[gradeKey];
const acres=Math.floor(cfg.minSpaceAcres + Math.random()*(cfg.maxSpaceAcres - cfg.minSpaceAcres));
this.humanQi=Math.max(10,Math.floor(this.humanQi - MIN_ASCENSION_HUMAN_QI));
this.immortalEssence[6]=Math.max(6,Math.round(cfg.essenceBeadPerYear*0.35));
const firstReq=MORTAL_SUBSTAGES[0].immortalTribulationsReq;
this.wallProgress=0;
this.maxWallProgress=firstReq;
this.immortalAperture={
active:true,
gradeId:gradeKey,
gradeName:cfg.name,
spaceAcres:acres,
timeRatio:cfg.timeRatio,
internalDays:1,
calamityCountdownDays:1200,
lastYieldAt:0,
subStageTribulationsPassed:0,
subStageTribulationsRequired:firstReq,
earthlyCalamitiesPassed:1,
heavenlyTribulationsPassed:1,
grandTribulationsPassed:0,
myriadTribulationsPassed:0,
originCoreStability:100,
resources:{
primevalStonesOutput:Math.max(4,Math.round(acres / 350)),
herbsNodes:Math.max(2,Math.round(acres / 1400)),
oreVeins:Math.max(1,Math.round(acres / 2000)),
guWormsWild:Math.max(4,Math.round(acres / 900)),
immortalMaterialPoints:gradeKey==="SUPER"?4 :2
},
livingBeings:{
mortals:gradeKey==="SUPER"?500 :120,
beasts:35,
variantHumans:0
},
environmentNodes:this._generateInitialApertureNodes(acres)
};
},
_generateInitialApertureNodes(acres) {
const count=Math.min(10,Math.max(5,Math.floor(acres / 1400)));
const types=[
{name:"Mỏ Nguyên Thạch",color:"#4cd964",icon:"💎"},
{name:"Vườn Linh Thảo",color:"#5cc995",icon:"🌿"},
{name:"Đàn Hoang Thú",color:"#e08e45",icon:"🐺"},
{name:"Mạch Đạo Ngân",color:"#b75cff",icon:"☯"},
{name:"Suối Linh Tuyền",color:"#5aa9e6",icon:"💧"}
];
const nodes=[];
for (let i=0;i<count;i++) {
const t=types[i % types.length];
nodes.push({
id:`node_${i}`,
name:t.name,
color:t.color,
icon:t.icon,
normX:0.16 + ((i % 5)*0.17) + (Math.random() - 0.5)*0.04,
normY:i<5?0.52 :0.78,
level:1
});
}
return nodes;
},
getApertureYieldCooldownRemaining() {
if (!this.isImmortal|| !this.immortalAperture) return 0;
const last=this.immortalAperture.lastYieldAt||0;
const elapsedSec=(Date.now() - last) / 1000;
return Math.max(0,Math.ceil(180 - elapsedSec));
},
getApertureYieldProfile() {
const ap=this.immortalAperture||{};
const rank=Math.max(6,Math.min(9,this.rank||6));
const rankOffset=rank - 6;
const isPseudo=typeof this.isPseudoVenerable==="function"&&this.isPseudoVenerable();
const gradeMultMap={SMALL:1.0,MEDIUM:1.35,LARGE:1.75,SUPER:2.30};
const gradeMult=gradeMultMap[ap.gradeId]||1.35;
const acres=Math.max(1500,ap.spaceAcres||3200);
const spaceBonus=1 + Math.min(1.5,Math.max(0,(acres - 2000) / 15000));
const pseudoMult=isPseudo?1.30 :1.0;
const baseStones={6:450,7:1100,8:2600,9:6500}[rank]||450;
const baseImmStones={6:2,7:5,8:12,9:28}[rank]||2;
const baseEssence={6:4.5,7:6.5,8:9.0,9:12.0}[rank]||4.5;
const baseHumanQi={6:12,7:20,8:32,9:50}[rank]||12;
const stonesYield=Math.round(baseStones*gradeMult*spaceBonus*pseudoMult);
const immortalStonesYield=Math.max(2,Math.round(baseImmStones*gradeMult*(1 + Math.min(0.75,(acres - 2000) / 22000))*pseudoMult));
const essenceYield=Number((baseEssence*gradeMult*(1 + Math.min(0.60,acres / 30000))*(isPseudo?1.15 :1.0)).toFixed(1));
const humanQiYield=Math.round(baseHumanQi*gradeMult*(isPseudo?1.25 :1.0));
const herbScale=Math.max(1,Math.round((gradeMult + rankOffset*0.65)*(isPseudo?1.2 :1.0)));
const spiritHerbCount=2 + herbScale*2;
const moonOrchidCount=2 + herbScale*2;
const ginsengCount=1 + herbScale;
const soulCrystalCount=1 + herbScale;
const bonusMatCount=2 + herbScale;
const remnantChance=(ap.gradeId==="SUPER"||ap.gradeId==="LARGE"||rank>=8)?0.40 :0.25;
return {
stonesYield,
immortalStonesYield,
essenceYield,
essenceName:(IMMORTAL_RANKS[rank]&&IMMORTAL_RANKS[rank].essenceName)||"Tiên Nguyên",
humanQiYield,
spiritHerbCount,
moonOrchidCount,
ginsengCount,
soulCrystalCount,
bonusMatCount,
remnantChance
};
},
collectApertureYield(player) {
if (!this.isImmortal|| !this.immortalAperture.active) {
return {success:false,message:"Chỉ Cổ Tiên Lục Chuyển trở lên mới sở hữu Phúc Địa để thu hoạch sản vật!"};
}
const cdRem=this.getApertureYieldCooldownRemaining();
if (cdRem>0) {
const m=Math.floor(cdRem / 60);
const s=String(cdRem % 60).padStart(2,"0");
return {
success:false,
cooldownRemaining:cdRem,
message:`⏳ Phúc Địa đang tái sinh nguyên khí! Cần chờ thêm ${m}:${s} nữa mới có thể thu hoạch đợt kế tiếp.`
};
}
this.immortalAperture.lastYieldAt=Date.now();
const y=this.getApertureYieldProfile();
const bonusMatPool=[
"red_iron_ore",
"beast_blood_core",
"wind_essence_crystal",
"jade_bone",
"bronze_ore",
"ration_meat"
];
const shuffled=[...bonusMatPool].sort(()=>Math.random() - 0.5);
const pickedMats=shuffled.slice(0,2);
const gotRemnant=Math.random()<=y.remnantChance;
if (player) {
player.primevalStones +=y.stonesYield;
player.addItem("immortal_stone",y.immortalStonesYield);
player.addItem("spirit_herb",y.spiritHerbCount);
player.addItem("moon_orchid",y.moonOrchidCount);
player.addItem("hundred_year_ginseng",y.ginsengCount);
player.addItem("soul_crystal",y.soulCrystalCount);
for (const mId of pickedMats) {
player.addItem(mId,y.bonusMatCount);
}
if (gotRemnant) {
player.addItem("remnant_recipe",1);
}
}
this.immortalEssence[this.rank]=Number(((this.immortalEssence[this.rank]||0) + y.essenceYield).toFixed(2));
this.humanQi +=y.humanQiYield;
const itemDb=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
const bonusMatLabels=pickedMats.map(id=>`+${y.bonusMatCount} ${(itemDb[id]&&itemDb[id].name)||id}`).join(", ");
const remnantNote=gotRemnant?", +1 📜 Cổ Phương Tàn Quyển" :"";
return {
success:true,
yieldProfile:y,
message:`🌱 Đại thu hoạch ${this.immortalAperture.gradeName} (${this.immortalAperture.spaceAcres.toLocaleString("vi-VN")} mẫu): 💎 +${y.stonesYield.toLocaleString("vi-VN")} Nguyên Thạch, 🌟 +${y.immortalStonesYield} Tiên Thạch, ✨ +${y.essenceYield} viên ${y.essenceName}, ☯ +${y.humanQiYield} Nhân Khí, +${y.spiritHerbCount} Thanh Linh Thảo, +${y.moonOrchidCount} Nguyệt Lan Hoa, +${y.ginsengCount} Khổ Sâm, +${y.soulCrystalCount} Đãng Hồn Thạch, ${bonusMatLabels}${remnantNote}!`
};
},
getManualTribulationRequirements() {
if (this.isPseudoVenerable()) {
return {
isMyriadTribulation:true,
tribulationName:"Vạn Kiếp (Myriad Tribulation)",
essenceCost:65,
humanQiCost:260,
mentalCost:165,
hpDamagePct:0.65,
tribulationsNeededForNextStage:VENERABLE_REQ_MYRIAD_TRIBULATIONS
};
}
const rankOffset=Math.max(0,this.rank - 6);
const subReq=MORTAL_SUBSTAGES[this.subStage]
?MORTAL_SUBSTAGES[this.subStage].immortalTribulationsReq
:14;
const nameByRank={
6:this.subStage<2?"Địa Tai" :"Thiên Kiếp",
7:this.subStage<2?"Thiên Kiếp" :"Hạo Kiếp",
8:"Hạo Kiếp",
9:"Hỗn Độn Kiếp"
};
return {
isMyriadTribulation:false,
tribulationName:nameByRank[this.rank]||"Tai Kiếp",
essenceCost:14 + rankOffset*12 + this.subStage*6,
humanQiCost:65 + rankOffset*40 + this.subStage*20,
mentalCost:70 + rankOffset*20 + this.subStage*8,
hpDamagePct:0.50,
tribulationsNeededForNextStage:subReq + rankOffset*6
};
},
_triggerApertureCalamity(player,isManual=true) {
if (!this.isImmortal) {
return {success:false,message:"Phàm nhân chưa có Tiên Khiếu để độ Tai Kiếp!"};
}
if (this.rank===9&&this.subStage===3) {
return {
success:false,
message:"Ngươi đã đứng trên đỉnh cao nhất vạn cổ 【Cửu Chuyển Đỉnh Phong — Vô Địch Thiên Hạ】!"
};
}
const isPseudo=this.isPseudoVenerable();
const req=this.getManualTribulationRequirements();
const currentEssenceBeads=this.immortalEssence[this.rank]||0;
const essenceName=IMMORTAL_RANKS[this.rank].essenceName;
if (!isManual&&isPseudo) {
this.immortalAperture.calamityCountdownDays=1200;
this.immortalAperture.grandTribulationsPassed=(this.immortalAperture.grandTribulationsPassed||0) + 1;
const naturalDaoGain=6000;
this.immortalAperture.spaceAcres +=350;
if (player) {
player.hp=Math.max(1,player.hp - Math.round(player.maxHp*0.18));
if (typeof player.addDaoMarksFromTribulation==="function") {
player.addDaoMarksFromTribulation(naturalDaoGain,0.85);
}
}
return {
success:true,
isManual:false,
didAdvance:false,
newRealmName:this.getRealmDisplayName(),
message:`🌩️ [Hạo Kiếp Định Kỳ 1200 Ngày — Á Tiên Tôn] Động Thiên vượt qua 1 đợt Hạo Kiếp tự nhiên (+350 mẫu, +${naturalDaoGain.toLocaleString("vi-VN")} Đạo Ngân)! Hãy chủ động Độ Vạn Kiếp (3 lần) để chuẩn bị Thành Tôn.`
};
}
if (isManual) {
if (currentEssenceBeads<req.essenceCost) {
return {
success:false,
message:`Không đủ ${essenceName}! Cần tối thiểu ${req.essenceCost} viên (Hiện có: ${currentEssenceBeads.toFixed(1)} viên). Hãy dùng Tiên Nguyên Thạch hoặc chờ Phúc Địa sản sinh.`
};
}
if (this.humanQi<req.humanQiCost) {
return {
success:false,
message:`Nhân Khí không đủ để dẫn động ${req.tribulationName} (Cần ${req.humanQiCost} Nhân Khí, hiện có: ${Math.floor(this.humanQi)})! Hãy vượt các Bản Đồ hoặc thăm dò Mộng Cảnh.`
};
}
if (player) {
if (player.mental<req.mentalCost) {
return {
success:false,
message:`Tinh Thần Lực quá suy yếu (${Math.floor(player.mental)}/${req.mentalCost})! Độ ${req.tribulationName} lúc này sẽ tan hồn phách.`
};
}
const minHpNeeded=Math.round(player.maxHp*(req.hpDamagePct + 0.08));
if (player.hp<minHpNeeded) {
return {
success:false,
message:`Sinh Mệnh quá thấp (${Math.ceil(player.hp)}/${minHpNeeded})! Không đủ sức chống đỡ ${req.tribulationName} oanh kích.`
};
}
}
this.immortalEssence[this.rank]=Math.max(0,currentEssenceBeads - req.essenceCost);
this.humanQi=Math.max(0,this.humanQi - req.humanQiCost);
if (player) {
player.mental=Math.max(0,player.mental - req.mentalCost);
const tribDamage=Math.round(player.maxHp*req.hpDamagePct);
player.hp=Math.max(1,player.hp - tribDamage);
}
} else if (player) {
const naturalDamage=Math.round(player.maxHp*0.16);
player.hp=Math.max(1,player.hp - naturalDamage);
}
this.immortalAperture.calamityCountdownDays=1200;
if (isPseudo&&isManual) {
this.immortalAperture.myriadTribulationsPassed=(this.immortalAperture.myriadTribulationsPassed||0) + 1;
this.immortalAperture.grandTribulationsPassed=(this.immortalAperture.grandTribulationsPassed||0) + 1;
const acreGain=1200;
const daoMarkGain=35000;
this.immortalAperture.spaceAcres +=acreGain;
if (player&&typeof player.addDaoMarksFromTribulation==="function") {
player.addDaoMarksFromTribulation(daoMarkGain,0.85);
}
const mCount=this.immortalAperture.myriadTribulationsPassed;
this.wallProgress=Math.min(VENERABLE_REQ_MYRIAD_TRIBULATIONS,mCount);
this.maxWallProgress=VENERABLE_REQ_MYRIAD_TRIBULATIONS;
if (player&&typeof player.recalculateStats==="function") {
player.recalculateStats();
}
const readyNote=mCount>=VENERABLE_REQ_MYRIAD_TRIBULATIONS
?"🎉 ĐÃ HOÀN THÀNH ĐỦ 3 LẦN VẠN KIẾP! Hãy kiểm tra 30 Vạn Đạo Ngân & Đột Phá Phong Tỏa Thiên Đạo để chính thức Thành Tôn!"
:`Tiến độ Vạn Kiếp Thành Tôn: ${mCount}/${VENERABLE_REQ_MYRIAD_TRIBULATIONS} lần.`;
return {
success:true,
isManual:true,
isMyriad:true,
didAdvance:mCount===VENERABLE_REQ_MYRIAD_TRIBULATIONS,
newRealmName:this.getRealmDisplayName(),
message:`🌩️ [ĐỘ VẠN KIẾP THÀNH CÔNG — LẦN ${mCount}] Ngươi vượt qua Vạn Kiếp hủy thiên diệt địa (+${acreGain} mẫu Động Thiên, +${daoMarkGain.toLocaleString("vi-VN")} Đạo Ngân)! ${readyNote}`
};
}
this.immortalAperture.earthlyCalamitiesPassed +=1;
this.immortalAperture.heavenlyTribulationsPassed +=1;
if (this.rank>=8) {
this.immortalAperture.grandTribulationsPassed=(this.immortalAperture.grandTribulationsPassed||0) + 1;
}
this.immortalAperture.subStageTribulationsRequired=req.tribulationsNeededForNextStage;
this.immortalAperture.subStageTribulationsPassed=(this.immortalAperture.subStageTribulationsPassed||0) + 1;
const daoGainByRank={
6:450,
7:1800,
8:5500,
9:18000
};
const acreGain=110*(this.rank - 5);
const daoMarkGain=daoGainByRank[this.rank]||650;
this.immortalAperture.spaceAcres +=acreGain;
if (player&&typeof player.addDaoMarksFromTribulation==="function") {
player.addDaoMarksFromTribulation(daoMarkGain,0.80);
}
let breakthroughMsg="";
let didAdvance=false;
if (this.immortalAperture.subStageTribulationsPassed>=this.immortalAperture.subStageTribulationsRequired) {
didAdvance=true;
this.immortalAperture.subStageTribulationsPassed=0;
if (this.subStage<3) {
this.subStage +=1;
this.immortalEssence[this.rank] +=3;
breakthroughMsg=`🎉 Đạo cơ viên mãn, tu vi đột phá lên 【${this.getRealmDisplayName()}】 (+3 viên ${IMMORTAL_RANKS[this.rank].essenceName})!`;
} else if (this.rank===8&&this.subStage===3) {
this.subStage=4;
this.immortalAperture.gradeName="Thái Cổ Động Thiên (Á Tiên Tôn)";
this.immortalEssence[8]=(this.immortalEssence[8]||0) + 15;
breakthroughMsg=`🌟 Đột phá giới hạn Bát Chuyển Đỉnh Phong, bước vào cảnh giới 【Á TIÊN TÔN】! Để chứng đạo Cửu Chuyển Tôn Giả & trở thành Đạo Chủ, ngươi cần: (1) Tích lũy 300.000 Đạo Ngân lưu phái chính, (2) Đột phá Phong Tỏa Thiên Đạo, (3) Độ qua 3 lần Vạn Kiếp!`;
} else if (this.rank<8) {
this.rank +=1;
this.subStage=0;
this.immortalEssence[this.rank]=Math.max(8,(this.immortalEssence[this.rank]||0) + 8);
if (this.rank===8) {
this.immortalAperture.gradeName="Thái Cổ Động Thiên";
}
breakthroughMsg=`🌟 Vượt qua Đại Kiếp sinh tử, chính thức bước vào đại cảnh giới mới 【${this.getRealmDisplayName()}】, sở hữu ${IMMORTAL_RANKS[this.rank].essenceName}!`;
}
const nextReq=this.getManualTribulationRequirements().tribulationsNeededForNextStage;
this.immortalAperture.subStageTribulationsRequired=nextReq;
}
if (this.isPseudoVenerable()) {
this.wallProgress=Math.min(VENERABLE_REQ_MYRIAD_TRIBULATIONS,this.immortalAperture.myriadTribulationsPassed||0);
this.maxWallProgress=VENERABLE_REQ_MYRIAD_TRIBULATIONS;
} else {
this.wallProgress=this.immortalAperture.subStageTribulationsPassed;
this.maxWallProgress=this.immortalAperture.subStageTribulationsRequired;
}
if (player&&typeof player.recalculateStats==="function") {
player.recalculateStats();
}
const progressStr=this.isPseudoVenerable()
?`(Vạn Kiếp: ${this.immortalAperture.myriadTribulationsPassed||0}/${VENERABLE_REQ_MYRIAD_TRIBULATIONS})`
:`(${this.immortalAperture.subStageTribulationsPassed}/${this.immortalAperture.subStageTribulationsRequired} ${req.tribulationName} để lên tiểu cảnh giới kế tiếp)`;
const prefixLabel=isManual?`⚡ [Chủ Động Độ ${req.tribulationName}]` :`🌩️ [${req.tribulationName} Định Kỳ 1200 Ngày]`;
return {
success:true,
isManual:isManual,
didAdvance:didAdvance,
newRealmName:this.getRealmDisplayName(),
message:didAdvance
?`${prefixLabel} Thành công (+${acreGain} mẫu Tiên Khiếu, +${daoMarkGain.toLocaleString("vi-VN")} Đạo Ngân)! ${breakthroughMsg}`
:`${prefixLabel} Vượt qua 1 đợt ${req.tribulationName} (+${acreGain} mẫu Tiên Khiếu, +${daoMarkGain.toLocaleString("vi-VN")} Đạo Ngân)! Tiến độ tu vi: 【${this.getRealmDisplayName()}】 ${progressStr}.`
};
},
applyDeathCultivationPenalty(player) {
const details=[];
let droppedSubStage=false;
if (!this.isImmortal) {
const wallLoss=Math.max(20,Math.round(this.maxWallProgress*0.30));
if (this.wallProgress<Math.round(this.maxWallProgress*0.15)&&this.subStage>0) {
const oldRealm=this.getRealmDisplayName();
this.subStage -=1;
droppedSubStage=true;
const rankCfg=MORTAL_RANKS[this.rank]||MORTAL_RANKS[1];
const subCfg=MORTAL_SUBSTAGES[this.subStage]||MORTAL_SUBSTAGES[0];
this.maxWallProgress=Math.round(rankCfg.baseWallReq*subCfg.statMult);
this.wallProgress=Math.round(this.maxWallProgress*0.65);
details.push(`Đạo cơ chấn động, rớt 1 tiểu cảnh giới từ 【${oldRealm}】 xuống 【${this.getRealmDisplayName()}】!`);
} else {
const before=Math.floor(this.wallProgress);
this.wallProgress=Math.max(0,Math.floor(this.wallProgress - wallLoss));
const actualLoss=before - this.wallProgress;
details.push(`Tổn thất -${actualLoss} điểm Ôn Dưỡng Khiếu Bích (còn ${this.wallProgress}/${this.maxWallProgress}).`);
}
const qiLoss=Math.min(Math.floor(this.humanQi),Math.max(1,Math.round(this.humanQi*0.08)));
this.humanQi=Math.max(0,Number((this.humanQi - qiLoss).toFixed(1)));
if (qiLoss>0) details.push(`Tán mất -${qiLoss} Nhân Khí.`);
} else {
if (!this.isPseudoVenerable()&&(this.immortalAperture.subStageTribulationsPassed||0)>0) {
this.immortalAperture.subStageTribulationsPassed=Math.max(0,this.immortalAperture.subStageTribulationsPassed - 1);
this.wallProgress=this.immortalAperture.subStageTribulationsPassed;
details.push(`Tiên Khiếu chấn động, tổn thất -1 tiến độ Độ Tai Kiếp (còn ${this.wallProgress}/${this.maxWallProgress}).`);
} else if (player&&player.mainPath) {
const baseMarkLoss=this.rank>=8?1500 :(this.rank===7?450 :120);
const lostMarks=Math.min(player.daoMarks[player.mainPath]||0,baseMarkLoss);
if (lostMarks>0) {
player.addDaoMarks(player.mainPath,-lostMarks);
details.push(`Tổn thất -${lostMarks.toLocaleString("vi-VN")} Đạo Ngân ${player.mainPath}.`);
}
}
const qiLoss=Math.min(Math.floor(this.humanQi),Math.max(3,Math.round(this.humanQi*0.10)));
this.humanQi=Math.max(0,Number((this.humanQi - qiLoss).toFixed(1)));
if (qiLoss>0) details.push(`Tán mất -${qiLoss} Nhân Khí.`);
}
if (player&&typeof player.recalculateStats==="function") {
player.recalculateStats();
}
return {
droppedSubStage:droppedSubStage,
newRealmName:this.getRealmDisplayName(),
details:details,
summary:details.join(" ")
};
},
getTotalImmortalEssenceInRank6() {
return (
this.immortalEssence[6]*1 +
this.immortalEssence[7]*100 +
this.immortalEssence[8]*10000 +
this.immortalEssence[9]*1000000
);
},
getRealmDisplayName() {
if (!this.isAwakened) return "Phàm Nhân (Chưa Khai Khiếu)";
if (this.isPseudoVenerable()) {
return "Á Tiên Tôn (Bát Chuyển Cực Hạn)";
}
const sName=MORTAL_SUBSTAGES[this.subStage]?MORTAL_SUBSTAGES[this.subStage].name :"Sơ Giai";
if (this.isImmortal) {
const rankCfg=IMMORTAL_RANKS[this.rank]||IMMORTAL_RANKS[6];
const daoLordTag=(this.rank>=9&&this.daoLordPath)?` — 👑 ${this.daoLordPath} Đạo Chủ` :"";
return `${rankCfg.name} ${sName} (${rankCfg.titleSuffix})${daoLordTag}`;
}
const rName=MORTAL_RANKS[this.rank]?MORTAL_RANKS[this.rank].name :"Nhất Chuyển";
return `${rName} ${sName}`;
},
getApertureWallName() {
if (!this.isAwakened) return "Chưa mở khiếu";
if (this.isImmortal) return this.immortalAperture.gradeName;
return MORTAL_SUBSTAGES[this.subStage]?MORTAL_SUBSTAGES[this.subStage].wallName :"Khinh Mạc";
},
getEssenceQualityName() {
if (!this.isAwakened) return "Không có";
if (this.isImmortal) return IMMORTAL_RANKS[this.rank].essenceName;
return MORTAL_RANKS[this.rank].essenceName;
},
getEssenceCssClass() {
if (this.isImmortal) return IMMORTAL_RANKS[this.rank].cssClass;
return MORTAL_RANKS[this.rank].cssClass;
},
renderRitualCanvas(ctx) {
if (!ctx) return;
const w=ctx.canvas.width;
const h=ctx.canvas.height;
const step=this.ritualState.currentStep||1;
const t=this.ritualState.animTick||0;
const cx=w / 2;
const cy=h / 2;
const bgGrad=ctx.createRadialGradient(cx,cy,12,cx,cy,w*0.72);
bgGrad.addColorStop(0,step>=4?"#162d38" :"#112233");
bgGrad.addColorStop(1,"#05070a");
ctx.fillStyle=bgGrad;
ctx.fillRect(0,0,w,h);
if (step<=3) {
const riverGrad=ctx.createLinearGradient(0,h*0.55,0,h);
riverGrad.addColorStop(0,"rgba(56, 201, 146, 0.28)");
riverGrad.addColorStop(1,"rgba(12, 46, 56, 0.75)");
ctx.fillStyle=riverGrad;
ctx.fillRect(0,h*0.56,w,h*0.44);
ctx.strokeStyle="rgba(126, 247, 240, 0.25)";
ctx.lineWidth=1.5;
for (let row=0;row<3;row++) {
ctx.beginPath();
const baseY=h*(0.64 + row*0.12);
for (let x=0;x<=w;x +=14) {
const y=baseY + Math.sin(x*0.04 + t*2.5 + row)*3;
if (x===0) ctx.moveTo(x,y);
else ctx.lineTo(x,y);
}
ctx.stroke();
}
const personY=step===1?h*0.42 :h*0.52;
ctx.save();
ctx.fillStyle="rgba(226, 191, 117, 0.22)";
ctx.beginPath();
ctx.arc(cx,personY + 8,22 + Math.sin(t*3)*3,0,Math.PI*2);
ctx.fill();
ctx.fillStyle="#18202c";
ctx.fillRect(cx - 9,personY - 4,18,30);
ctx.fillStyle="#e0be77";
ctx.fillRect(cx - 9,personY + 7,18,3);
ctx.fillStyle="#edd2b5";
ctx.beginPath();
ctx.arc(cx,personY - 12,8,0,Math.PI*2);
ctx.fill();
ctx.restore();
for (const p of this.ritualState.particles) {
if (step===3) {
const dx=cx - p.x;
const dy=(personY + 8) - p.y;
p.x +=dx*0.025 + p.vx;
p.y +=dy*0.025 + p.vy*0.4;
if (Math.hypot(dx,dy)<8) {
p.x=Math.random()*w;
p.y=h - 8;
}
} else {
p.x +=p.vx;
p.y +=p.vy;
if (p.y<10) p.y=h - 10;
if (p.x<0) p.x=w;
if (p.x>w) p.x=0;
}
ctx.beginPath();
ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
ctx.fillStyle=`rgba(255, 223, 128, ${p.alpha})`;
ctx.fill();
}
} else {
const radius=72;
ctx.save();
ctx.beginPath();
ctx.arc(cx,cy,radius + 12 + Math.sin(t*4)*3,0,Math.PI*2);
ctx.strokeStyle=this.ritualState.rolledAptitude?.physique
?"rgba(255, 82, 82, 0.45)"
:"rgba(56, 201, 146, 0.38)";
ctx.lineWidth=3;
ctx.stroke();
ctx.restore();
ctx.save();
ctx.beginPath();
ctx.arc(cx,cy,radius,0,Math.PI*2);
ctx.clip();
ctx.fillStyle="#080c12";
ctx.fillRect(cx - radius,cy - radius,radius*2,radius*2);
const targetPct=this.ritualState.rolledAptitude
?this.ritualState.rolledAptitude.maxSeaPercent / 100
:0.5;
const fillRatio=step===4?targetPct*0.35 :(step===5?targetPct*0.72 :targetPct);
const seaHeight=radius*2*fillRatio;
const seaTopY=cy + radius - seaHeight;
const seaGrad=ctx.createLinearGradient(0,seaTopY,0,cy + radius);
seaGrad.addColorStop(0,"#38c992");
seaGrad.addColorStop(1,"#0d3b2a");
ctx.fillStyle=seaGrad;
ctx.beginPath();
ctx.moveTo(cx - radius,cy + radius);
for (let x= -radius;x<=radius;x +=8) {
const yWave=seaTopY + Math.sin(x*0.06 + t*3.2)*3.5;
ctx.lineTo(cx + x,yWave);
}
ctx.lineTo(cx + radius,cy + radius);
ctx.closePath();
ctx.fill();
if (step>=6) {
const orbY=cy - 16 + Math.sin(t*3)*4;
ctx.beginPath();
ctx.arc(cx,orbY,10,0,Math.PI*2);
ctx.fillStyle="#ffd700";
ctx.fill();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=1.5;
ctx.stroke();
}
ctx.restore();
ctx.beginPath();
ctx.arc(cx,cy,radius,0,Math.PI*2);
ctx.lineWidth=4;
ctx.strokeStyle=this.ritualState.rolledAptitude?.physique?"#ff5c5c" :"#e3c178";
ctx.stroke();
if (step>=6&&this.ritualState.rolledAptitude) {
ctx.fillStyle="#ffd700";
ctx.font="bold 12px Georgia";
ctx.textAlign="center";
ctx.fillText(
`${this.ritualState.rolledAptitude.maxSeaPercent}% Biển Nguyên`,
cx,
cy + radius + 16
);
}
}
},
renderApertureCanvas(ctx) {
if (!ctx) return;
const w=ctx.canvas.width;
const h=ctx.canvas.height;
const cx=w / 2;
const cy=h / 2;
const r=Math.min(w,h)*0.40;
const t=performance.now()*0.002;
ctx.clearRect(0,0,w,h);
ctx.fillStyle="#06080b";
ctx.fillRect(0,0,w,h);
if (!this.isAwakened) {
ctx.fillStyle="#968f83";
ctx.font="13px Georgia";
ctx.textAlign="center";
ctx.fillText("Chưa Khai Khiếu",cx,cy);
return;
}
ctx.save();
ctx.beginPath();
ctx.arc(cx,cy,r,0,Math.PI*2);
ctx.clip();
ctx.fillStyle=this.isImmortal?"#10212b" :"#090d14";
ctx.fillRect(cx - r,cy - r,r*2,r*2);
if (!this.isImmortal) {
const pct=Math.max(0,Math.min(100,this.currentEssence)) / 100;
const seaH=r*2*pct;
const topY=cy + r - seaH;
const rankCfg=MORTAL_RANKS[this.rank]||MORTAL_RANKS[1];
const grad=ctx.createLinearGradient(0,topY,0,cy + r);
grad.addColorStop(0,rankCfg.colorSecondary);
grad.addColorStop(1,rankCfg.colorPrimary);
ctx.fillStyle=grad;
ctx.beginPath();
ctx.moveTo(cx - r,cy + r);
for (let x= -r;x<=r;x +=8) {
const yWave=topY + Math.sin(x*0.06 + t*2.2)*3.5;
ctx.lineTo(cx + x,yWave);
}
ctx.lineTo(cx + r,cy + r);
ctx.closePath();
ctx.fill();
const capY=cy + r - (r*2*(this.aptitude.maxSeaPercent / 100));
ctx.strokeStyle="rgba(224, 190, 119, 0.55)";
ctx.setLineDash([4,4]);
ctx.beginPath();
ctx.moveTo(cx - r,capY);
ctx.lineTo(cx + r,capY);
ctx.stroke();
ctx.setLineDash([]);
} else {
ctx.fillStyle="#1f4732";
ctx.fillRect(cx - r,cy + 10,r*2,r);
ctx.fillStyle=IMMORTAL_RANKS[this.rank]?.colorPrimary||"#4cd964";
ctx.beginPath();
ctx.arc(cx,cy - 18,14,0,Math.PI*2);
ctx.fill();
}
const guY=cy - 12 + Math.sin(t*2.5)*5;
ctx.beginPath();
ctx.arc(cx,guY,9,0,Math.PI*2);
ctx.fillStyle="#e0be77";
ctx.fill();
ctx.restore();
ctx.beginPath();
ctx.arc(cx,cy,r,0,Math.PI*2);
ctx.lineWidth=3 + this.subStage*1.2;
ctx.strokeStyle=this.wallPressure>80?"#e05252" :"#b89758";
ctx.stroke();
},
renderImmortalApertureMap(ctx) {
if (!ctx) return;
const w=ctx.canvas.width;
const h=ctx.canvas.height;
ctx.fillStyle="#080b10";
ctx.fillRect(0,0,w,h);
if (!this.isImmortal|| !this.immortalAperture.active) {
ctx.fillStyle="#e0be77";
ctx.font="bold 13px Georgia";
ctx.textAlign="center";
ctx.fillText("CHƯA MỞ TIÊN KHIẾU (CẦN ĐẠT NGŨ CHUYỂN ĐỈNH PHONG)",w / 2,h / 2 - 10);
ctx.fillStyle="#968f83";
ctx.font="12px Georgia";
ctx.fillText(
`Hiện tại: ${this.getRealmDisplayName()} | Nhân Khí: ${Math.floor(this.humanQi)}/${MIN_ASCENSION_HUMAN_QI}`,
w / 2,
h / 2 + 14
);
return;
}
const ap=this.immortalAperture;
const passed=ap.subStageTribulationsPassed||0;
const req=ap.subStageTribulationsRequired||this.getManualTribulationRequirements().tribulationsNeededForNextStage;
const grad=ctx.createRadialGradient(w / 2,h / 2,20,w / 2,h / 2,w*0.55);
grad.addColorStop(0,"#163026");
grad.addColorStop(1,"#091217");
ctx.fillStyle=grad;
ctx.fillRect(8,8,w - 16,h - 16);
ctx.strokeStyle="#b89758";
ctx.lineWidth=1.5;
ctx.strokeRect(8,8,w - 16,h - 16);
const nodes=ap.environmentNodes||[];
nodes.forEach((node,idx)=>{
const nx=node.normX?node.normX*w :(40 + (idx % 5)*58);
const ny=node.normY?node.normY*h :(idx<5?h*0.58 :h*0.82);
ctx.beginPath();
ctx.arc(nx,ny,9,0,Math.PI*2);
ctx.fillStyle=node.color||"#4cd964";
ctx.fill();
ctx.strokeStyle="#000";
ctx.stroke();
ctx.fillStyle="#e6dfd5";
ctx.font="10px Georgia";
ctx.textAlign="center";
ctx.fillText(node.name,nx,ny + 18);
});
ctx.fillStyle="rgba(8, 12, 18, 0.90)";
ctx.fillRect(14,12,w - 28,54);
ctx.strokeStyle="#5e4f38";
ctx.strokeRect(14,12,w - 28,54);
ctx.fillStyle="#e0be77";
ctx.font="bold 12px Georgia";
ctx.textAlign="left";
ctx.fillText(`${ap.gradeName} (${ap.spaceAcres} mẫu) — ${this.getRealmDisplayName()}`,22,29);
ctx.fillStyle="#5cc995";
ctx.font="11px Georgia";
const subLineText=this.isPseudoVenerable()
?`Vạn Kiếp Thành Tôn: ${ap.myriadTribulationsPassed||0}/3 | Phong Tỏa Thiên Đạo: ${this.daoBlockadeBroken?"Đã Phá" :"Chưa Phá"}`
:(this.rank>=9&&this.daoLordPath
?`👑 Đạo Chủ ${this.daoLordPath} | Đạo Ngân Tự Nhiên: ${(this.naturalDaoMarksRefined||0).toLocaleString("vi-VN")}`
:`Tiến độ Tiểu Cảnh Giới: ${passed}/${req} Tai Kiếp | Tổng đã độ: ${ap.heavenlyTribulationsPassed} Kiếp`);
ctx.fillText(subLineText,22,48);
},
toSaveData() {
return {
isAwakened:this.isAwakened,
isImmortal:this.isImmortal,
aptitude:this.aptitude,
rank:this.rank,
subStage:this.subStage,
currentEssence:this.currentEssence,
wallProgress:this.wallProgress,
maxWallProgress:this.maxWallProgress,
wallPressure:this.wallPressure,
wallIntegrity:this.wallIntegrity,
hasExploded:this.hasExploded,
tenExtremeSealed:this.tenExtremeSealed,
pressureFreezeTimer:this.pressureFreezeTimer,
daoBlockadeBroken:this.daoBlockadeBroken,
daoLordPath:this.daoLordPath,
naturalDaoMarksRefined:this.naturalDaoMarksRefined,
vitalGuId:this.vitalGuId,
vitalGuName:this.vitalGuName,
humanQi:this.humanQi,
immortalEssence:this.immortalEssence,
immortalAperture:this.immortalAperture,
ascensionState:this.ascensionState
};
},
fromSaveData(data) {
if (!data||typeof data!=="object") return;
this.reset();
const safeNum=(v,fb,min= -Infinity,max=Infinity)=>{
const n=Number(v);
return Number.isFinite(n)?Math.max(min,Math.min(max,n)) :fb;
};
this.isAwakened=Boolean(data.isAwakened);
this.rank=Math.floor(safeNum(data.rank,1,1,9));
this.isImmortal=Boolean(data.isImmortal||this.rank>=6);
if (data.aptitude&&typeof data.aptitude==="object") {
this.aptitude={
...this.aptitude,
...data.aptitude,
maxSeaPercent:Math.round(safeNum(data.aptitude.maxSeaPercent,this.aptitude.maxSeaPercent||72,20,100)),
baseRegen:safeNum(data.aptitude.baseRegen,this.aptitude.baseRegen||1.5,0.2,20),
cultivateMult:safeNum(data.aptitude.cultivateMult,this.aptitude.cultivateMult||1.2,0.4,10)
};
}
const maxSub=(this.isImmortal&&this.rank===8)?4 :3;
this.subStage=Math.floor(safeNum(data.subStage,0,0,maxSub));
this.currentEssence=safeNum(data.currentEssence,this.aptitude.maxSeaPercent,0,this.aptitude.maxSeaPercent);
this.wallProgress=safeNum(data.wallProgress,0,0,99999999);
if (!this.isImmortal) {
const rankCfg=MORTAL_RANKS[this.rank]||MORTAL_RANKS[1];
const subCfg=MORTAL_SUBSTAGES[this.subStage]||MORTAL_SUBSTAGES[0];
this.maxWallProgress=Math.round(rankCfg.baseWallReq*subCfg.statMult);
} else {
this.maxWallProgress=safeNum(data.maxWallProgress,8,1,99999999);
}
this.wallPressure=safeNum(data.wallPressure,5,0,100);
this.wallIntegrity=safeNum(data.wallIntegrity,100,0,100);
this.hasExploded=Boolean(data.hasExploded);
this.tenExtremeSealed=Boolean(data.tenExtremeSealed);
this.pressureFreezeTimer=safeNum(data.pressureFreezeTimer,0,0,36000);
this.daoBlockadeBroken=Boolean(data.daoBlockadeBroken||this.rank>=9);
this.daoLordPath=data.daoLordPath||(this.isImmortal&&this.rank>=9?"Trí Đạo" :null);
this.naturalDaoMarksRefined=Math.floor(safeNum(data.naturalDaoMarksRefined,this.isImmortal&&this.rank>=9?50000 :0,0,99999999));
if (typeof data.vitalGuId==="string"&&data.vitalGuId) this.vitalGuId=data.vitalGuId;
if (typeof data.vitalGuName==="string"&&data.vitalGuName) this.vitalGuName=data.vitalGuName;
this.humanQi=safeNum(data.humanQi,20,0,99999999);
if (data.immortalEssence&&typeof data.immortalEssence==="object") {
for (const rKey of ["6","7","8","9"]) {
const rawVal=data.immortalEssence[rKey]!==undefined?data.immortalEssence[rKey] :data.immortalEssence[Number(rKey)];
this.immortalEssence[rKey]=safeNum(rawVal,0,0,9999999);
}
}
if (data.immortalAperture&&typeof data.immortalAperture==="object") {
const defaultRes={...this.immortalAperture.resources};
const defaultLiv={...this.immortalAperture.livingBeings};
this.immortalAperture={
...this.immortalAperture,
...data.immortalAperture,
resources:(data.immortalAperture.resources&&typeof data.immortalAperture.resources==="object")
?{...defaultRes,...data.immortalAperture.resources}
:defaultRes,
livingBeings:(data.immortalAperture.livingBeings&&typeof data.immortalAperture.livingBeings==="object")
?{...defaultLiv,...data.immortalAperture.livingBeings}
:defaultLiv,
environmentNodes:Array.isArray(data.immortalAperture.environmentNodes)
?data.immortalAperture.environmentNodes
:this.immortalAperture.environmentNodes
};
this.immortalAperture.subStageTribulationsPassed=Math.floor(safeNum(this.immortalAperture.subStageTribulationsPassed,0,0,9999));
this.immortalAperture.subStageTribulationsRequired=this.getManualTribulationRequirements().tribulationsNeededForNextStage;
if (this.isImmortal) {
this.maxWallProgress=this.immortalAperture.subStageTribulationsRequired;
}
}
if (data.ascensionState&&typeof data.ascensionState==="object") {
this.ascensionState={...this.ascensionState,...data.ascensionState};
}
}
});
})(window);
