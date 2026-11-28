(function (global) {
"use strict";
function _getWildInfo(instanceId,player,aperture,suppressorInstanceId="auto") {
const gu=this.getGuByInstanceId(instanceId);
if (!gu) return {valid:false,reason:"Cổ trùng không tồn tại."};
if (gu.isRefined) return {valid:false,reason:"Cổ trùng này đã được luyện hóa hoàn toàn."};
const cfg=global.GuSystem.WILD_REFINE_CONFIG[gu.rank]||global.GuSystem.WILD_REFINE_CONFIG[1];
const eligibleSuppressors=this.getEligibleSuppressorGus(gu);
let suppressor=null;
if (suppressorInstanceId==="auto") {
suppressor=eligibleSuppressors[0]||null;
} else if (suppressorInstanceId&&suppressorInstanceId!=="none") {
suppressor=eligibleSuppressors.find(g=>g.instanceId===suppressorInstanceId)||null;
}
const rankDiff=suppressor?Math.max(0,suppressor.rank - gu.rank) :0;
let costMult=1.0;
let gainMult=1.0;
let suppressSuccessBonus=0;
let instantRefine=false;
let suppressionLabel="Không dùng Cổ áp chế";
if (suppressor&&rankDiff>=3) {
costMult=0.30;
gainMult=10.0;
suppressSuccessBonus=1.0;
instantRefine=true;
suppressionLabel=`🐉 Tuyệt Đối Áp Chế (+${rankDiff} Chuyển — Luyện Hóa Tức Thì 100%, -70% chi phí!)`;
} else if (suppressor&&rankDiff===2) {
costMult=0.50;
gainMult=2.80;
suppressSuccessBonus=0.48;
suppressionLabel=`🐉 Áp Chế Cực Mạnh (+2 Chuyển: +48% tỷ lệ, x2.8 tiến độ, -50% chi phí)`;
} else if (suppressor&&rankDiff===1) {
costMult=0.70;
gainMult=1.85;
suppressSuccessBonus=0.28;
suppressionLabel=`🐉 Áp Chế Khí Tức (+1 Chuyển: +28% tỷ lệ, x1.85 tiến độ, -30% chi phí)`;
}
const stoneCost=Math.max(1,Math.round(cfg.stones*costMult));
const mentalCost=Math.max(4,Math.round(cfg.mental*costMult));
const mastery=this.getRefinementMasteryInfo();
const luyenMarks=(player&&typeof player.getEffectiveDaoMarks==="function")
?player.getEffectiveDaoMarks("Luyện Đạo")
:0;
const playerRank=aperture?aperture.rank :1;
const realmPenalty=gu.rank>playerRank?(gu.rank - playerRank)*0.14 :0;
const realmBonus=playerRank>gu.rank?Math.min(0.16,(playerRank - gu.rank)*0.04) :0;
let successChance=instantRefine
?1.0
:(cfg.baseSuccess + mastery.masteryBonus + Math.min(0.18,luyenMarks*0.0005) + (player?(player.refinementBonus||0) :0) + realmBonus + suppressSuccessBonus - realmPenalty);
successChance=instantRefine?1.0 :Math.max(0.05,Math.min(0.98,Number(successChance.toFixed(2))));
const realmGainScale=gu.rank>playerRank?0.75 :1.0;
const minGain=instantRefine?100 :Math.min(100,Math.max(3,Math.round(cfg.minGain*gainMult*realmGainScale)));
const maxGain=instantRefine?100 :Math.min(100,Math.max(minGain,Math.round(cfg.maxGain*gainMult*realmGainScale)));
return {
valid:true,
gu:gu,
stoneCost:stoneCost,
mentalCost:mentalCost,
successChance:successChance,
minGain:minGain,
maxGain:maxGain,
instantRefine:instantRefine,
suppressor:suppressor,
rankDiff:rankDiff,
suppressionLabel:suppressionLabel,
eligibleSuppressors:eligibleSuppressors
};
}
function _refineWildStep(instanceId,player,aperture,suppressorInstanceId="auto") {
const info=this.getWildGuRefinementInfo(instanceId,player,aperture,suppressorInstanceId);
if (!info.valid) {
return {success:false,message:info.reason||"Không thể luyện hóa Cổ Trùng này."};
}
const gu=info.gu;
if (!aperture|| !aperture.isAwakened) {
return {success:false,message:"Chưa Khai Khiếu, không thể luyện hóa Cổ Trùng!"};
}
if (!player||player.primevalStones<info.stoneCost) {
return {
success:false,
message:`Không đủ Nguyên Thạch để luyện hóa [${global.GuSystem.formatGuNameWithRank(gu)}]! Cần 💎 ${info.stoneCost.toLocaleString("vi-VN")} Nguyên Thạch (Hiện có: ${player?player.primevalStones :0}).`
};
}
if (player.mental<info.mentalCost) {
return {
success:false,
message:`Tinh Thần Lực không đủ (${Math.floor(player.mental)}/${info.mentalCost})! Hãy dùng Thanh Linh Thảo hoặc Đãng Hồn Thạch Đan để hồi phục.`
};
}
player.primevalStones -=info.stoneCost;
player.mental=Math.max(0,player.mental - info.mentalCost);
const supName=info.suppressor?global.GuSystem.formatGuNameWithRank(info.suppressor) :null;
const supPrefix=supName?`🐉 [Áp Chế bằng ${supName}] ` :"";
if (!info.instantRefine&&Math.random()>info.successChance) {
const setback=info.suppressor?0 :Math.min(8,2 + Math.floor(gu.rank / 2));
gu.refinementProgress=Math.max(0,gu.refinementProgress - setback);
this.refinementExp=(this.refinementExp||0) + 2;
return {
success:false,
message:`${supPrefix}[${global.GuSystem.formatGuNameWithRank(gu)}] phản kháng dữ dội! Tiêu hao 💎 ${info.stoneCost} Nguyên Thạch & ${info.mentalCost} Tinh Thần.${setback>0?` Tiến độ lùi -${setback}% còn ${gu.refinementProgress}%` :` Nhờ khí tức áp chế nên giữ nguyên tiến độ ${gu.refinementProgress}%`}.`
};
}
const progressGain=info.instantRefine
?100
:Math.floor(info.minGain + Math.random()*(info.maxGain - info.minGain + 1));
gu.refinementProgress=Math.min(100,(gu.refinementProgress||0) + progressGain);
this.refinementExp=(this.refinementExp||0) + Math.max(3,gu.rank*3);
if (gu.refinementProgress>=100) {
gu.isRefined=true;
gu.refinementProgress=100;
const isImmortal=typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator();
player.addPathAttainmentExp("Luyện Đạo",2*gu.rank);
let bonusTag=`+${2*gu.rank} Lĩnh Ngộ Luyện Đạo`;
if (isImmortal) {
player.addDaoMarks("Luyện Đạo",2*gu.rank);
bonusTag=`+${2*gu.rank} Đạo Ngân Luyện Đạo`;
}
aperture.humanQi +=Math.max(1,gu.rank);
const emptySlot=this.equippedGuSlots.findIndex(s=>s===null);
if (emptySlot!== -1) {
this.equipGuToSlot(gu.instanceId,emptySlot);
}
this._recalculateSavedKillerMoves();
return {
success:true,
completed:true,
message:`${supPrefix}✨ Luyện hóa hoàn tất 100%! 【${global.GuSystem.formatGuNameWithRank(gu)}】 đã hoàn toàn khuất phục (-${info.stoneCost}💎, -${info.mentalCost} Tinh Thần, ${bonusTag}).`
};
}
return {
success:true,
completed:false,
message:`${supPrefix}Thần niệm & Nguyên Thạch thẩm thấu vào [${global.GuSystem.formatGuNameWithRank(gu)}]: +${progressGain}% (Đạt ${gu.refinementProgress}% | -${info.stoneCost}💎, -${info.mentalCost} Tinh Thần).`
};
}
function _previewFurnace(slots,player,aperture,options={}) {
const cleanSlots=(slots||[]).filter(Boolean);
const tech=global.GuSystem.REFINEMENT_TECHNIQUES[options.techniqueId]||global.GuSystem.REFINEMENT_TECHNIQUES.fire_method;
const cat=global.GuSystem.REFINEMENT_CATALYSTS[options.catalystId]||global.GuSystem.REFINEMENT_CATALYSTS.none;
const protectGu=Boolean(options.protectGu);
const mastery=this.getRefinementMasteryInfo();
if (cleanSlots.length<2) {
return {valid:false,reason:"Hãy nhấn vào Ô Đỉnh Lò (hoặc chọn 1 Cổ Phương bên phải) để đặt đủ Cổ Trùng & Cổ Tài."};
}
const inputGuInstances=[];
const inputItemIds=[];
for (const entry of cleanSlots) {
const gu=this.getGuByInstanceId(entry);
if (gu) {
if (!gu.isRefined) {
return {valid:false,reason:`[${global.GuSystem.formatGuNameWithRank(gu)}] vẫn là Cổ Hoang Dã, phải Luyện Hóa trước!`};
}
inputGuInstances.push(gu);
} else if (global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[entry]) {
inputItemIds.push(entry);
}
}
const computeExtras=(baseChance,baseEssence,baseStones,resRank)=>{
const luyenMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Luyện Đạo") :0;
const triMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Trí Đạo") :0;
const vanMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Vận Đạo") :0;
const daoBonus=(luyenMarks*0.002) + (triMarks*0.001) + (vanMarks*0.0012) + (player?player.refinementBonus :0);
const catBonus=(cat.itemId&&player&&player.getItemCount(cat.itemId)>0)?cat.chanceBonus :0;
const totalChance=Math.min(0.98,Math.max(0.05,Number((baseChance + daoBonus + tech.chanceBonus + catBonus + mastery.masteryBonus + mastery.pityBonus).toFixed(2))));
const protectStoneExtra=protectGu?Math.max(15,Math.round(baseStones*0.25)) :0;
const protectNeedsSoulCrystal=protectGu&&resRank>=6;
const finalEssence=Math.max(1,Number((baseEssence*tech.essenceMult).toFixed(1)));
const finalStones=baseStones + protectStoneExtra;
const breakRisk=protectGu?0 :Math.min(0.85,Number((0.45*tech.breakRiskMult).toFixed(2)));
return {
successChance:totalChance,
essenceCost:finalEssence,
stoneCost:finalStones,
protectStoneExtra,
protectNeedsSoulCrystal,
breakRisk,
technique:tech,
catalyst:cat,
protectGu,
mastery
};
};
if (inputGuInstances.length===1&&inputItemIds.length===1) {
const singleGu=inputGuInstances[0];
if (inputItemIds[0]===singleGu.foodItemId&&singleGu.rank<singleGu.maxRank) {
const upReq=this.getGuUpgradeRequirements(singleGu.instanceId,player);
if (upReq.canUpgrade) {
const baseEss=global.GuSystem.RANK_ESSENCE_COST_BASE[singleGu.rank]||20;
const ext=computeExtras(upReq.successChance,baseEss,upReq.stoneCost,upReq.nextRank);
return {
valid:true,
isDirectRankUpgrade:true,
targetGuInstance:singleGu,
upgradeReq:upReq,
inputGuInstances:[singleGu],
resultName:`${singleGu.name} ${upReq.nextRankName}`,
resultRank:upReq.nextRank,
...ext
};
}
}
}
const inputGuTemplateIds=inputGuInstances.map(g=>g.id).sort();
for (const recipe of global.GuSystem.REFINEMENT_RECIPES) {
const reqGuSorted=[...recipe.requiredGuIds].sort();
const guMatch=
reqGuSorted.length===inputGuTemplateIds.length&&
reqGuSorted.every((val,idx)=>val===inputGuTemplateIds[idx]);
const itemMatch= !recipe.requiredItemId||inputItemIds.includes(recipe.requiredItemId);
if (guMatch&&itemMatch) {
if (recipe.resultRank>=6) {
const existingImm=this.getImmortalGuByTemplate(recipe.resultGuId);
const consumedExisting=existingImm&&inputGuInstances.some(g=>g.instanceId===existingImm.instanceId);
if (existingImm&& !consumedExisting) {
return {
valid:false,
blockedUnique:true,
reason:`Tiên Cổ là duy nhất! Ngươi đã sở hữu 【${global.GuSystem.formatGuNameWithRank(existingImm)}】, không thể hợp luyện con thứ hai cùng loại!`
};
}
}
const ext=computeExtras(recipe.baseChance,recipe.essenceCost,recipe.stoneCost,recipe.resultRank);
return {
valid:true,
isDirectRankUpgrade:false,
recipe:recipe,
inputGuInstances:inputGuInstances,
resultName:recipe.resultName,
resultRank:recipe.resultRank,
...ext
};
}
}
return {
valid:false,
reason:"Tổ hợp không khớp với Cổ Phương nào (Hoặc Cổ Trùng đã đạt giới hạn Chuyển tối đa)!"
};
}
function _executeFurnace(slots,player,aperture,options={}) {
const preview=this.previewRefinement(slots,player,aperture,options);
if (!preview.valid) {
return {success:false,message:preview.reason};
}
const tech=preview.technique||global.GuSystem.REFINEMENT_TECHNIQUES.fire_method;
const cat=preview.catalyst||global.GuSystem.REFINEMENT_CATALYSTS.none;
const protectGu=Boolean(preview.protectGu);
if (tech.mentalCost>0&&player.mental<tech.mentalCost) {
return {
success:false,
message:`Tinh Thần Lực không đủ cho [${tech.name}] (Cần ${tech.mentalCost}, hiện có ${Math.floor(player.mental)})!`
};
}
if (tech.hpCostPct>0&&player.hp<=Math.round(player.maxHp*(tech.hpCostPct + 0.05))) {
return {
success:false,
message:`Sinh Mệnh quá thấp để thi triển [${tech.name}] (Cần trên ${Math.round((tech.hpCostPct + 0.05)*100)}% HP)!`
};
}
if (cat.itemId&&player.getItemCount(cat.itemId)<=0) {
return {success:false,message:`Thiếu vật phẩm phụ trợ [${cat.name}] trong hành trang!`};
}
if (preview.protectNeedsSoulCrystal&&player.getItemCount("soul_crystal")<=0) {
return {success:false,message:"Chế độ Bảo Cổ Hộ Lô cho Tiên Cổ yêu cầu thêm 1x [🔮 Đãng Hồn Thạch Đan]!"};
}
if (preview.isDirectRankUpgrade&&preview.targetGuInstance) {
const gu=preview.targetGuInstance;
const upReq=preview.upgradeReq;
if (aperture&&aperture.rank<upReq.reqCultivationRank) {
return {success:false,message:`Tu vi chưa đủ! Cần đạt ${global.GuSystem.getRankName(upReq.reqCultivationRank)} để thăng Chuyển.`};
}
if (player.primevalStones<preview.stoneCost) {
return {success:false,message:`Không đủ Nguyên Thạch (Cần 💎 ${preview.stoneCost})!`};
}
if (upReq.immortalStoneCost>0&&player.immortalStones<upReq.immortalStoneCost) {
return {success:false,message:`Không đủ Tiên Nguyên Thạch (Cần 🌟 ${upReq.immortalStoneCost})!`};
}
if (player.getItemCount(gu.foodItemId)<=0) {
return {success:false,message:"Thiếu Cổ Tài thức ăn trong túi đồ!"};
}
player.primevalStones -=preview.stoneCost;
if (upReq.immortalStoneCost>0) player.removeItem("immortal_stone",upReq.immortalStoneCost);
player.removeItem(gu.foodItemId,1);
if (cat.itemId) player.removeItem(cat.itemId,1);
if (preview.protectNeedsSoulCrystal) player.removeItem("soul_crystal",1);
if (tech.mentalCost>0) player.mental=Math.max(0,player.mental - tech.mentalCost);
if (tech.hpCostPct>0) player.hp=Math.max(1,player.hp - Math.round(player.maxHp*tech.hpCostPct));
const expGain=Math.round((10 + upReq.nextRank*6)*tech.expMult);
this.refinementExp=(this.refinementExp||0) + expGain;
if (Math.random()<=preview.successChance) {
gu.rank=upReq.nextRank;
this._syncGuInstanceStats(gu);
gu.hunger=100;
this.refinementPityStreak=0;
if (gu.isVital&&aperture) {
aperture.vitalGuName=`${gu.name} (${global.GuSystem.getRankName(gu.rank)} - ${gu.path})`;
}
player.addPathAttainmentExp("Luyện Đạo",3*gu.rank);
const isImmUp=typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator();
if (isImmUp) player.addDaoMarks("Luyện Đạo",3*gu.rank);
this._recalculateSavedKillerMoves();
return {
success:true,
newGu:gu,
message:`🔥 [${tech.name}] Thăng Chuyển thành công! 【${global.GuSystem.formatGuNameWithRank(gu)}】 uy lực đạt ${gu.power} (+${expGain} EXP Luyện Cổ${isImmUp?`, +${3*gu.rank} ĐN Luyện Đạo` :`, +${3*gu.rank} Lĩnh Ngộ Luyện Đạo`})!`
};
} else {
this.refinementPityStreak=Math.min(5,(this.refinementPityStreak||0) + 1);
player.addDaoMarks("Luyện Đạo",2);
return {
success:false,
message:`Thăng Chuyển [${gu.name}] thất bại (tổn hao cổ tài & Nguyên Thạch, Cổ Trùng được bảo toàn). Hỏa hầu tích lũy tăng lên +${this.refinementPityStreak*5}% cho lần sau!`
};
}
}
const recipe=preview.recipe;
if (aperture.rank<recipe.requiredRealmRank) {
return {
success:false,
message:`Tu vi chưa đủ! Cần đạt tối thiểu ${global.GuSystem.getRankName(recipe.requiredRealmRank)} để hợp luyện ${recipe.resultName}.`
};
}
if (player.primevalStones<preview.stoneCost) {
return {
success:false,
message:`Không đủ Nguyên Thạch để duy trì hỏa hầu (Cần ${preview.stoneCost} Nguyên Thạch)!`
};
}
if (recipe.requiredItemId&&player.getItemCount(recipe.requiredItemId)<=0) {
return {success:false,message:"Thiếu cổ tài phụ trợ trong túi đồ!"};
}
if (!aperture.hasEnoughEssence(preview.essenceCost,recipe.requiredRealmRank)) {
return {success:false,message:"Không đủ Chân Nguyên / Tiên Nguyên để khởi lò Hợp Luyện!"};
}
aperture.consumeEssence(preview.essenceCost,recipe.requiredRealmRank);
player.primevalStones -=preview.stoneCost;
if (recipe.requiredItemId) player.removeItem(recipe.requiredItemId,1);
if (cat.itemId) player.removeItem(cat.itemId,1);
if (preview.protectNeedsSoulCrystal) player.removeItem("soul_crystal",1);
if (tech.mentalCost>0) player.mental=Math.max(0,player.mental - tech.mentalCost);
if (tech.hpCostPct>0) player.hp=Math.max(1,player.hp - Math.round(player.maxHp*tech.hpCostPct));
const hasVitalInput=preview.inputGuInstances.some(g=>g.isVital);
const expGain=Math.round((14 + recipe.resultRank*9)*tech.expMult);
this.refinementExp=(this.refinementExp||0) + expGain;
if (Math.random()<=preview.successChance) {
let inheritedSlot=null;
for (const oldGu of preview.inputGuInstances) {
if (oldGu.equippedSlot!==null&&inheritedSlot===null) {
inheritedSlot=oldGu.equippedSlot;
}
this.removeGuByInstanceId(oldGu.instanceId);
}
const newGu=this.addGuToStorage(recipe.resultGuId,{
rank:recipe.resultRank,
isRefined:true,
refinementProgress:100,
isVital:hasVitalInput,
hunger:100
});
this.refinementPityStreak=0;
if (!this.unlockedRecipeIds.includes(recipe.id)) {
this.unlockedRecipeIds.push(recipe.id);
}
if (hasVitalInput&&aperture&&newGu) {
aperture.vitalGuId=newGu.id;
aperture.vitalGuName=`${newGu.name} (${global.GuSystem.getRankName(newGu.rank)} - ${newGu.path})`;
}
if (inheritedSlot!==null&&newGu) {
this.equipGuToSlot(newGu.instanceId,inheritedSlot);
}
player.addPathAttainmentExp("Luyện Đạo",4*recipe.resultRank);
const isImmRef=typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator();
if (isImmRef) player.addDaoMarks("Luyện Đạo",4*recipe.resultRank);
aperture.humanQi +=3*recipe.resultRank;
this._recalculateSavedKillerMoves();
return {
success:true,
newGu:newGu,
message:`🔥 [${tech.name}] Hợp luyện đại thành! Luyện ra 【${global.GuSystem.formatGuNameWithRank(newGu)}】 (Uy lực: ${newGu.power}, ${isImmRef?`+${4*recipe.resultRank} ĐN Luyện Đạo` :`+${4*recipe.resultRank} Lĩnh Ngộ Luyện Đạo`}, +${expGain} EXP Luyện Cổ)!`
};
} else {
this.refinementPityStreak=Math.min(5,(this.refinementPityStreak||0) + 1);
let lostGuNames=[];
if (!protectGu) {
for (const oldGu of preview.inputGuInstances) {
if (oldGu.isVital) {
oldGu.hunger=Math.max(10,oldGu.hunger - 40);
} else if (Math.random()<preview.breakRisk) {
lostGuNames.push(global.GuSystem.formatGuNameWithRank(oldGu));
this.removeGuByInstanceId(oldGu.instanceId);
}
}
}
player.addDaoMarks("Luyện Đạo",2);
this._recalculateSavedKillerMoves();
const penaltyMsg=protectGu
?"Nhờ chế độ 🛡️ Bảo Cổ Hộ Lô, toàn bộ Cổ Trùng đầu vào đều bình an vô sự!"
:(lostGuNames.length>0
?`Cổ trùng [${lostGuNames.join(", ")}] đã tổn hao trong lúc phản phệ!`
:"May mắn giữ lại được Cổ Trùng nhưng cổ tài và Nguyên Thạch đã tiêu hao.");
return {
success:false,
message:`Hợp luyện [${recipe.resultName}] thất bại! ${penaltyMsg} (+${expGain} EXP Luyện Cổ, Hỏa hầu tích lũy lần sau: +${this.refinementPityStreak*5}%)`
};
}
}
class GuRefinement {
constructor(guSystem) {this.guSystem=guSystem||null;}
getWildInfo(instanceId,player,aperture,suppressorInstanceId="auto") {
return _getWildInfo.call(this.guSystem,instanceId,player,aperture,suppressorInstanceId);
}
refineWildStep(instanceId,player,aperture,suppressorInstanceId="auto") {
return _refineWildStep.call(this.guSystem,instanceId,player,aperture,suppressorInstanceId);
}
previewFurnace(slots,player,aperture,options={}) {
return _previewFurnace.call(this.guSystem,slots,player,aperture,options);
}
executeFurnace(slots,player,aperture,options={}) {
return _executeFurnace.call(this.guSystem,slots,player,aperture,options);
}
}
global.GuRefinement=GuRefinement;
})(window);
