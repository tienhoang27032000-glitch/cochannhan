(function (global) {
"use strict";
const {RANK_NAMES,RANK_POWER_MULTIPLIERS,RANK_ESSENCE_COST_BASE,REALM_CATEGORY_LABELS,WILD_REFINE_CONFIG,GU_DATABASE,LEGACY_GU_ALIASES,REFINEMENT_RECIPES,REFINEMENT_TECHNIQUES,REFINEMENT_CATALYSTS,REFINEMENT_MASTERY_TIERS,MATERIAL_SYNTHESIS_RECIPES,PRESET_KILLER_MOVES}=global.VanCoGuData;
class GuSystem {
constructor() {
this.refinement=global.GuRefinement?new global.GuRefinement(this) :null;
this.synthesis=global.GuSynthesis?new global.GuSynthesis(this) :null;
this.evolution=global.GuEvolution?new global.GuEvolution(this) :null;
this.reset();
}
getWildGuRefinementInfo(instanceId,player,aperture,suppressorInstanceId="auto") {
return this.refinement.getWildInfo(instanceId,player,aperture,suppressorInstanceId);
}
refineWildGuStep(instanceId,player,aperture,suppressorInstanceId="auto") {
return this.refinement.refineWildStep(instanceId,player,aperture,suppressorInstanceId);
}
previewRefinement(slots,player,aperture,options={}) {
return this.refinement.previewFurnace(slots,player,aperture,options);
}
executeRefinement(slots,player,aperture,options={}) {
return this.refinement.executeFurnace(slots,player,aperture,options);
}
getGuUpgradeRequirements(instanceId,player) {
return this.evolution.getRequirements(instanceId,player);
}
upgradeGuRank(instanceId,player,aperture) {
return this.evolution.evolveRank(instanceId,player,aperture);
}
synthesizeMaterial(synId,player) {
return this.synthesis.synthesizeMaterial(synId,player);
}
salvageGu(instanceId,player) {
return this.synthesis.salvageOne(instanceId,player);
}
salvageDuplicateMortalGus(player) {
return this.synthesis.salvageDuplicates(player);
}
reset() {
this.ownedGuList=[];
this.nextInstanceCounter=1;
this.equippedGuSlots=[null,null,null,null,null,null,null,null];
this.savedKillerMoves=[];
this.equippedKillerSlots=[null,null,null,null];
this.unlockedRecipeIds=REFINEMENT_RECIPES
.filter(r=>r.unlockedByDefault)
.map(r=>r.id);
this.refinementExp=0;
this.refinementPityStreak=0;
}
getRefinementMasteryInfo() {
const exp=this.refinementExp||0;
let current=REFINEMENT_MASTERY_TIERS[0];
let next=REFINEMENT_MASTERY_TIERS[1]||null;
for (let i=0;i<REFINEMENT_MASTERY_TIERS.length;i++) {
if (exp>=REFINEMENT_MASTERY_TIERS[i].minExp) {
current=REFINEMENT_MASTERY_TIERS[i];
next=REFINEMENT_MASTERY_TIERS[i + 1]||null;
}
}
const pityBonus=Math.min(0.35,(this.refinementPityStreak||0)*0.07);
return {
level:current.level,
title:current.title,
exp:exp,
nextMinExp:next?next.minExp :null,
masteryBonus:current.bonus,
pityStreak:this.refinementPityStreak||0,
pityBonus:pityBonus
};
}
static getRankName(rank) {
return RANK_NAMES[rank]||`${rank} Chuyển`;
}
static getRealmCategoryLabel(category) {
return REALM_CATEGORY_LABELS[category]||"Phàm Cổ (1–5 Chuyển)";
}
static formatGuNameWithRank(guOrTpl,customRank) {
if (!guOrTpl) return "Chưa rõ";
const r=customRank!==undefined?customRank :(guOrTpl.rank||guOrTpl.defaultRank||1);
return `${guOrTpl.name} ${GuSystem.getRankName(r)}`;
}
static computeStatsForRank(tpl,requestedRank) {
const minR=tpl.minRank||1;
const maxR=tpl.maxRank||5;
const clampedRank=Math.max(minR,Math.min(maxR,requestedRank||tpl.defaultRank||minR));
const mult=RANK_POWER_MULTIPLIERS[clampedRank]||1.0;
const basePower=tpl.basePower||tpl.power||22;
const calcPower=Math.max(10,Math.round(basePower*mult));
const calcShield=tpl.baseShield
?Math.max(25,Math.round(tpl.baseShield*mult))
:(tpl.type==="defensive"?Math.round(calcPower*1.35) :0);
const essenceCost=RANK_ESSENCE_COST_BASE[clampedRank]||10;
const tradeValue=Math.max(20,Math.round((tpl.baseTradeValue||40)*mult*0.85));
return {
rank:clampedRank,
minRank:minR,
maxRank:maxR,
realmCategory:tpl.realmCategory||"mortal_only",
power:calcPower,
shieldAmount:calcShield,
essenceCost:essenceCost,
range:(tpl.range||280) + (clampedRank - 1)*24,
radius:(tpl.radius||24) + (clampedRank - 1)*4,
tradeValue:tradeValue
};
}
_syncGuInstanceStats(gu) {
if (!gu) return null;
let tpl=GU_DATABASE[gu.id];
if (!tpl&&LEGACY_GU_ALIASES[gu.id]) {
const alias=LEGACY_GU_ALIASES[gu.id];
gu.id=alias.id;
if (!gu.rank||gu.rank<alias.rank) gu.rank=alias.rank;
tpl=GU_DATABASE[gu.id];
}
if (!tpl) return gu;
const stats=GuSystem.computeStatsForRank(tpl,gu.rank);
gu.name=tpl.name;
gu.icon=tpl.icon;
gu.rank=stats.rank;
gu.minRank=stats.minRank;
gu.maxRank=stats.maxRank;
gu.realmCategory=stats.realmCategory;
gu.path=tpl.path;
gu.type=tpl.type;
gu.subType=tpl.subType||null;
gu.castType=tpl.castType;
gu.power=stats.power;
gu.shieldAmount=stats.shieldAmount;
gu.essenceCost=stats.essenceCost;
gu.range=stats.range;
gu.radius=stats.radius;
gu.tradeValue=stats.tradeValue;
gu.killerTrait=tpl.killerTrait||gu.killerTrait;
gu.description=tpl.description;
return gu;
}
initializeStartingGu(vitalGuTemplateId,originType="righteous_clan") {
this.reset();
const resolved=LEGACY_GU_ALIASES[vitalGuTemplateId]||{id:vitalGuTemplateId,rank:1};
const vitalId=GU_DATABASE[resolved.id]?resolved.id :"nguyet_quang_gu";
const vitalInstance=this.addGuToStorage(vitalId,{
rank:resolved.rank||1,
isRefined:true,
refinementProgress:100,
isVital:true
});
this.equipGuToSlot(vitalInstance.instanceId,0);
const starterIds=["phong_nhan_gu","thiet_bi_gu","thanh_phong_gu","hoi_xuong_gu"];
if (originType==="demonic_inheritor"||originType==="inheritance") {
starterIds.push("huyet_nguyet_gu");
} else {
starterIds.push("hung_luc_gu");
}
for (const gId of starterIds) {
if (gId===vitalId) continue;
this.addGuToStorage(gId,{
rank:1,
isRefined:false,
refinementProgress:0,
isVital:false
});
}
if (
this.hasRefinedGuByTemplate("nguyet_quang_gu")&&
this.hasRefinedGuByTemplate("phong_nhan_gu")&&
this.hasRefinedGuByTemplate("thanh_phong_gu")
) {
const preset=JSON.parse(JSON.stringify(PRESET_KILLER_MOVES[0]));
this.savedKillerMoves.push(preset);
this.equippedKillerSlots[0]=preset.id;
this._recalculateSavedKillerMoves();
}
}
addGuToStorage(templateId,options={}) {
let resolvedId=templateId;
let forcedRank=options.rank;
if (!GU_DATABASE[resolvedId]&&LEGACY_GU_ALIASES[resolvedId]) {
resolvedId=LEGACY_GU_ALIASES[templateId].id;
if (forcedRank===undefined) {
forcedRank=LEGACY_GU_ALIASES[templateId].rank;
}
}
const tpl=GU_DATABASE[resolvedId];
if (!tpl) return null;
const instanceId=options.instanceId||`gu_inst_${this.nextInstanceCounter++}`;
const isRefined=options.isRefined!==undefined?Boolean(options.isRefined) :true;
const stats=GuSystem.computeStatsForRank(tpl,forcedRank!==undefined?forcedRank :tpl.defaultRank);
if (stats.rank>=6&&this.hasImmortalGu(tpl.id)) {
return null;
}
const guInstance={
instanceId:instanceId,
id:tpl.id,
name:tpl.name,
icon:tpl.icon,
rank:stats.rank,
minRank:stats.minRank,
maxRank:stats.maxRank,
realmCategory:stats.realmCategory,
path:tpl.path,
type:tpl.type,
subType:tpl.subType||null,
castType:tpl.castType,
essenceCost:stats.essenceCost,
cooldown:tpl.cooldown,
range:stats.range,
radius:stats.radius,
power:stats.power,
speedBoost:tpl.speedBoost||0,
projectileSpeed:tpl.projectileSpeed||440,
projectileColor:tpl.projectileColor||"#38c992",
visualColor:tpl.visualColor||"#e0be77",
slowEffect:tpl.slowEffect||0,
lifesteal:tpl.lifesteal||0,
shieldAmount:stats.shieldAmount,
buffDuration:tpl.buffDuration||8,
foodItemId:tpl.foodItemId,
tradeValue:stats.tradeValue,
rarity:tpl.rarity,
killerTrait:tpl.killerTrait||null,
description:tpl.description,
isRefined:isRefined,
refinementProgress:isRefined?100 :(options.refinementProgress||15),
isVital:Boolean(options.isVital),
hunger:options.hunger!==undefined?options.hunger :100,
equippedSlot:null
};
this.ownedGuList.push(guInstance);
this._recalculateSavedKillerMoves();
return guInstance;
}
update(dt) {
const hungerDecay=0.03*dt;
for (const gu of this.ownedGuList) {
if (gu.hunger>0) {
gu.hunger=Math.max(0,Number((gu.hunger - hungerDecay).toFixed(2)));
}
}
}
feedGu(instanceId,player) {
const gu=this.getGuByInstanceId(instanceId);
if (!gu) return {success:false,message:"Không tìm thấy Cổ Trùng này."};
if (!player) return {success:false,message:"Thiếu dữ liệu người chơi."};
const foodMeta=global.PlayerManager.ITEM_DATABASE[gu.foodItemId]||{name:"Nguyên Thạch"};
if (player.getItemCount(gu.foodItemId)<=0) {
return {
success:false,
message:`Không có [${foodMeta.name}] trong túi đồ để nuôi ${GuSystem.formatGuNameWithRank(gu)}!`
};
}
if (gu.hunger>=99) {
return {
success:false,
message:`${GuSystem.formatGuNameWithRank(gu)} hiện đang no bụng (${Math.round(gu.hunger)}%), chưa cần cho ăn thêm.`
};
}
player.removeItem(gu.foodItemId,1);
gu.hunger=100;
return {
success:true,
message:`Đã cho [${GuSystem.formatGuNameWithRank(gu)}] ăn 1x ${foodMeta.name}. Độ no đạt 100%!`
};
}
attemptCaptureWildGu(player,regionDangerRank=1) {
const targetRank=Math.min(5,Math.max(1,regionDangerRank));
const candidates=Object.values(GU_DATABASE).filter(
g=>g.minRank<=targetRank&&g.maxRank>=targetRank
);
const chosenTpl=candidates[Math.floor(Math.random()*candidates.length)]||GU_DATABASE.nguyet_quang_gu;
const wildInstance=this.addGuToStorage(chosenTpl.id,{
rank:targetRank,
isRefined:false,
refinementProgress:0,
isVital:false,
hunger:85
});
return {
success:true,
guInstance:wildInstance,
message:`Đã trấn áp và thu giữ một con [${GuSystem.formatGuNameWithRank(wildInstance)} - Hoang Dã]! Hãy về [Kho Cổ] để Luyện Hóa.`
};
}
getEligibleSuppressorGus(wildGu) {
if (!wildGu) return [];
return this.ownedGuList
.filter(g=>g.isRefined&&g.rank>wildGu.rank&&(g.hunger===undefined||g.hunger>0))
.sort((a,b)=>(b.rank - a.rank)||(b.power - a.power));
}
setVitalGu(instanceId,aperture) {
const gu=this.getGuByInstanceId(instanceId);
if (!gu|| !gu.isRefined) {
return {success:false,message:"Chỉ cổ trùng đã luyện hóa hoàn toàn mới có thể liên kết Bản Mệnh."};
}
const currentVital=this.ownedGuList.find(g=>g.isVital);
if (currentVital&&currentVital.instanceId!==gu.instanceId) {
if (gu.path!==currentVital.path&&gu.rank<currentVital.rank) {
return {
success:false,
message:`Đổi Cổ Bản Mệnh khác lưu phái đòi hỏi Cổ Trùng mới phải có Chuyển số không thấp hơn Cổ Bản Mệnh hiện tại (${GuSystem.getRankName(currentVital.rank)})!`
};
}
currentVital.isVital=false;
}
gu.isVital=true;
if (aperture) {
aperture.vitalGuId=gu.id;
aperture.vitalGuName=`${gu.name} (${GuSystem.getRankName(gu.rank)} - ${gu.path})`;
}
return {
success:true,
message:`[${GuSystem.formatGuNameWithRank(gu)}] đã trở thành Cổ Bản Mệnh trấn giữ Không Khiếu của ngươi!`
};
}
getKnownRecipes() {
return REFINEMENT_RECIPES.filter(r=>this.unlockedRecipeIds.includes(r.id));
}
studyRemnantRecipe(player) {
if (!player||player.getItemCount("remnant_recipe")<=0) {
return {
success:false,
message:"Không có [📜 Cổ Phương Tàn Quyển] trong túi đồ! Hãy vượt các Bản Đồ Lịch Luyện hoặc mua tại Thương Hội."
};
}
const lockedRecipes=REFINEMENT_RECIPES.filter(r=> !this.unlockedRecipeIds.includes(r.id));
if (lockedRecipes.length===0) {
return {
success:false,
message:"Ngươi đã lĩnh ngộ toàn bộ Bí Phương Hợp Luyện hiện có trong thiên hạ!"
};
}
player.removeItem("remnant_recipe",1);
const unlocked=lockedRecipes[0];
this.unlockedRecipeIds.push(unlocked.id);
player.addPathAttainmentExp("Trí Đạo",4);
player.addPathAttainmentExp("Luyện Đạo",3);
const isImm=typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator();
if (isImm) {
player.addPathAttainmentExp("Trí Đạo",4);if (typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator()) player.addDaoMarks("Trí Đạo",4);
player.addDaoMarks("Luyện Đạo",3);
}
return {
success:true,
recipe:unlocked,
message:`📜 Giải mã Tàn Quyển thành công! Lĩnh ngộ cổ phương 【${unlocked.resultName}】 (${isImm?"+4 ĐN Trí Đạo, +3 ĐN Luyện Đạo" :"+4 Lĩnh Ngộ Trí Đạo, +3 Lĩnh Ngộ Luyện Đạo"})!`
};
}
autoFillRecipeSlots(recipeId,player) {
const recipe=REFINEMENT_RECIPES.find(r=>r.id===recipeId);
if (!recipe) return {success:false,message:"Không tìm thấy bí phương."};
const slots=[null,null,null];
const usedInstances=new Set();
for (let i=0;i<recipe.requiredGuIds.length;i++) {
const reqGuId=recipe.requiredGuIds[i];
const matchGu=this.ownedGuList.find(
g=>g.id===reqGuId&&g.isRefined&& !usedInstances.has(g.instanceId)
);
if (!matchGu) {
const tpl=GU_DATABASE[reqGuId];
return {
success:false,
message:`Thiếu Cổ Trùng đầu vào: [${tpl?tpl.name :reqGuId}] đã luyện hóa!`
};
}
usedInstances.add(matchGu.instanceId);
slots[i]=matchGu.instanceId;
}
if (recipe.requiredItemId) {
if (!player||player.getItemCount(recipe.requiredItemId)<=0) {
const itemMeta=global.PlayerManager.ITEM_DATABASE[recipe.requiredItemId];
return {
success:false,
message:`Thiếu cổ tài phụ trợ: [${itemMeta?itemMeta.name :recipe.requiredItemId}] trong túi đồ!`
};
}
slots[2]=recipe.requiredItemId;
}
return {
success:true,
slots:slots,
message:`Đã đặt đủ nguyên liệu theo cổ phương [${recipe.resultName}] vào Đỉnh Lò.`
};
}
canCraftRecipe(recipe,player) {
if (!recipe|| !player) return {ready:false,missing:["Thiếu dữ liệu"]};
const missing=[];
const usedIds=new Set();
for (const reqGuId of (recipe.requiredGuIds||[])) {
const match=this.ownedGuList.find(g=>g.id===reqGuId&&g.isRefined&& !usedIds.has(g.instanceId));
if (match) usedIds.add(match.instanceId);
else {
const tpl=GU_DATABASE[reqGuId];
missing.push(tpl?tpl.name :reqGuId);
}
}
if (recipe.requiredItemId&&player.getItemCount(recipe.requiredItemId)<=0) {
const meta=global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[recipe.requiredItemId];
missing.push(meta?meta.name :recipe.requiredItemId);
}
return {ready:missing.length===0,missing};
}
feedAllHungryGu(player,threshold=85) {
if (!player) return {success:false,message:"Thiếu dữ liệu người chơi."};
let fedCount=0;
let missingFoods=new Set();
for (const gu of this.ownedGuList) {
if (gu.hunger>=threshold) continue;
if (player.getItemCount(gu.foodItemId)>0) {
const res=this.feedGu(gu.instanceId,player);
if (res.success) fedCount +=1;
} else {
const fMeta=global.PlayerManager.ITEM_DATABASE[gu.foodItemId];
if (fMeta) missingFoods.add(fMeta.name);
}
}
if (fedCount===0) {
if (missingFoods.size>0) {
return {
success:false,
message:`Chưa cho ăn được con nào — Thiếu thức ăn: ${Array.from(missingFoods).slice(0,4).join(", ")}!`
};
}
return {success:false,message:"Toàn bộ Cổ Trùng trong kho đều đang no bụng (>= 85%)!"};
}
const missingNote=missingFoods.size>0?` (Còn thiếu: ${Array.from(missingFoods).slice(0,3).join(", ")})` :"";
return {
success:true,
message:`🍖 Đã cho ăn no ${fedCount} Cổ Trùng đang đói chỉ với 1 lần bấm!${missingNote}`
};
}
autoEquipBestLoadout(player) {
const refined=this.ownedGuList.filter(g=>g.isRefined);
if (refined.length===0) {
return {success:false,message:"Chưa có Cổ Trùng nào đã luyện hóa để tự động lắp!"};
}
const scoreGu=(g)=>{
const amp=player?player.calculateDaoAmplification(g.path,[]).multiplier :1.0;
return g.rank*10000 + Math.round((g.power||10)*amp);
};
const sorted=[...refined].sort((a,b)=>scoreGu(b) - scoreGu(a));
const chosen=[];
const pickedIds=new Set();
const bestDef=sorted.find(g=>g.type==="defensive");
const bestHeal=sorted.find(g=>g.castType==="heal");
if (bestDef) {chosen.push(bestDef);pickedIds.add(bestDef.instanceId);}
if (bestHeal&& !pickedIds.has(bestHeal.instanceId)) {chosen.push(bestHeal);pickedIds.add(bestHeal.instanceId);}
for (const g of sorted) {
if (chosen.length>=8) break;
if (pickedIds.has(g.instanceId)) continue;
chosen.push(g);
pickedIds.add(g.instanceId);
}
chosen.sort((a,b)=>{
const aSup=(a.type==="defensive"||a.castType==="heal")?1 :0;
const bSup=(b.type==="defensive"||b.castType==="heal")?1 :0;
if (aSup!==bSup) return aSup - bSup;
return scoreGu(b) - scoreGu(a);
});
this.equippedGuSlots=[null,null,null,null,null,null,null,null];
for (const g of this.ownedGuList) g.equippedSlot=null;
chosen.forEach((g,idx)=>{
this.equippedGuSlots[idx]=g.instanceId;
g.equippedSlot=idx;
});
return {
success:true,
message:`⚔️ Đã tự động lắp ${chosen.length} Cổ Trùng mạnh nhất vào 8 Ô Xuất Chiến (kèm ưu tiên Phòng Ngự & Trị Liệu)!`
};
}
_getHighestOwnedGuOrTemplate(templateId) {
let resolvedId=templateId;
if (!GU_DATABASE[resolvedId]&&LEGACY_GU_ALIASES[resolvedId]) {
resolvedId=LEGACY_GU_ALIASES[resolvedId].id;
}
const ownedMatches=this.ownedGuList
.filter(g=>g.id===resolvedId&&g.isRefined)
.sort((a,b)=>b.rank - a.rank);
if (ownedMatches.length>0) {
this._syncGuInstanceStats(ownedMatches[0]);
return ownedMatches[0];
}
const tpl=GU_DATABASE[resolvedId];
if (!tpl) return null;
const stats=GuSystem.computeStatsForRank(tpl,tpl.defaultRank||tpl.minRank||1);
return {
...tpl,
rank:stats.rank,
power:stats.power,
shieldAmount:stats.shieldAmount,
essenceCost:stats.essenceCost,
range:stats.range,
radius:stats.radius
};
}
_buildDynamicKillerMoveProfile(coreGu,subGus) {
const coreTrait=coreGu.killerTrait||{
deliveryType:"crescent_barrage",
modifierTag:"moon_slash",
modifierDesc:"Tăng cường uy lực công kích"
};
const moveRank=coreGu.rank;
const modifiers=[coreTrait.modifierTag];
const traitDescriptions=[`[Cốt lõi - ${GuSystem.formatGuNameWithRank(coreGu)}]: ${coreTrait.modifierDesc}`];
let rawPowerSum=coreGu.power*1.30;
let rawEssenceSum=coreGu.essenceCost;
let shieldAmount=coreGu.shieldAmount?Math.round(coreGu.shieldAmount*1.15) :0;
let healAmount=coreGu.castType==="heal"?Math.round(coreGu.power*1.15) :0;
let speedBoost=coreGu.speedBoost||0;
let lifesteal=coreGu.lifesteal||0;
let essenceDiscount=1.0;
for (const sub of subGus) {
const subTrait=sub.killerTrait||{modifierTag:"power_boost",modifierDesc:"Gia tăng uy năng"};
if (!modifiers.includes(subTrait.modifierTag)) {
modifiers.push(subTrait.modifierTag);
}
let rankFitFactor=0.78;
if (sub.rank>coreGu.rank) {
rankFitFactor=Math.max(0.25,0.60 / Math.pow(1.5,sub.rank - coreGu.rank));
} else if (sub.rank===coreGu.rank) {
rankFitFactor=0.85;
} else {
rankFitFactor=0.68;
}
const contributedPower=Math.round(sub.power*rankFitFactor);
rawPowerSum +=contributedPower;
if (moveRank>=6) {
if (sub.rank<=5) {
rawEssenceSum +=0.02;
} else {
const subScale=sub.rank<moveRank?Math.pow(0.35,moveRank - sub.rank) :1.0;
rawEssenceSum +=sub.essenceCost*0.35*subScale;
}
} else {
rawEssenceSum +=sub.essenceCost*0.65;
}
if (sub.shieldAmount) {
shieldAmount +=Math.round(sub.shieldAmount*rankFitFactor);
}
if (sub.castType==="heal") {
healAmount +=Math.round(sub.power*rankFitFactor);
}
if (sub.speedBoost) {
speedBoost=Math.max(speedBoost,Number((sub.speedBoost*0.95).toFixed(2)));
}
if (sub.lifesteal) {
lifesteal=Math.min(0.45,lifesteal + sub.lifesteal*0.8);
}
if (subTrait.modifierTag==="essence_saver") {
essenceDiscount*=0.72;
}
traitDescriptions.push(
`[Phụ trợ - ${GuSystem.formatGuNameWithRank(sub)}]: ${subTrait.modifierDesc} (+${contributedPower} Uy lực)`
);
}
const minComponentRank=Math.min(coreGu.rank,...subGus.map(s=>s.rank));
const rankSynergyBonus=1 + (minComponentRank - 1)*0.08;
const finalPower=Math.max(20,Math.round(rawPowerSum*rankSynergyBonus));
const finalEssenceCost=moveRank>=6
?Math.max(0.25,Number((rawEssenceSum*essenceDiscount).toFixed(2)))
:Math.max(1,Math.round(rawEssenceSum*essenceDiscount));
const baseProjCount=Math.min(10,1 + moveRank + (modifiers.includes("moon_slash")?2 :0));
const baseAoeRadius=Math.round((coreGu.radius||65) + moveRank*16 + subGus.length*12);
const phantomIconsByRank={1:"🐗",2:"🐻",3:"🐯",4:"🦣",5:"🐉",6:"🐉",7:"👥",8:"🐉",9:"🐉"};
return {
moveRank:moveRank,
finalPower:finalPower,
finalEssenceCost:finalEssenceCost,
cooldown:Number((4.0 + Math.min(5,moveRank)*0.4 + subGus.length*0.3).toFixed(1)),
traitSummaryText:traitDescriptions.join(" | "),
combatProfile:{
deliveryType:coreTrait.deliveryType,
moveRank:moveRank,
primaryColor:coreGu.projectileColor||coreGu.visualColor||"#7ef7f0",
secondaryColor:(subGus[0]&&(subGus[0].projectileColor||subGus[0].visualColor))||"#e2bf75",
projectileCount:baseProjCount,
projectileSpeed:(coreGu.projectileSpeed||450) + (modifiers.includes("swift_step")?90 :0),
range:(coreGu.range||310) + moveRank*24,
aoeRadius:baseAoeRadius,
phantomIcon:phantomIconsByRank[moveRank]||"🐯",
phantomCount:Math.min(5,Math.max(1,Math.floor((moveRank + 1) / 2))),
modifiers:modifiers,
speedBoost:speedBoost,
boostDuration:5 + Math.min(6,moveRank),
shieldAmount:shieldAmount,
healAmount:healAmount,
lifesteal:Number(lifesteal.toFixed(2))
}
};
}
_recalculateSavedKillerMoves() {
for (const move of this.savedKillerMoves) {
if (!Array.isArray(move.requiredGuIds)||move.requiredGuIds.length===0) continue;
const coreGu=this._getHighestOwnedGuOrTemplate(move.requiredGuIds[0]);
const subGus=move.requiredGuIds.slice(1).map(id=>this._getHighestOwnedGuOrTemplate(id)).filter(Boolean);
if (!coreGu||subGus.length===0) continue;
const built=this._buildDynamicKillerMoveProfile(coreGu,subGus);
move.moveRank=built.moveRank;
move.isImmortal=built.moveRank>=6;
move.power=built.finalPower;
move.essenceCost=built.finalEssenceCost;
move.cooldown=built.cooldown;
move.combatProfile=built.combatProfile;
move.typeLabel=`${built.moveRank>=6?"Tiên Đạo" :"Phàm Đạo"} Sát Chiêu (${GuSystem.getRankName(built.moveRank)} - ${coreGu.path})`;
}
}
previewKillerMoveDeduction(coreId,sub1Id,sub2Id,player) {
const chosenIds=[coreId,sub1Id,sub2Id].filter(Boolean);
const uniqueIds=[...new Set(chosenIds)];
if (!coreId||uniqueIds.length<2) {
return {
valid:false,
name:"---",
typeLabel:"---",
essenceCost:0,
description:"Cần chọn ít nhất 1 Cổ Cốt Lõi và 1 Cổ Phụ Trợ khác nhau để cấu thành Sát Chiêu."
};
}
const coreGu=this._getHighestOwnedGuOrTemplate(uniqueIds[0]);
const subGus=uniqueIds.slice(1).map(id=>this._getHighestOwnedGuOrTemplate(id)).filter(Boolean);
if (!coreGu||subGus.length===0) {
return {valid:false,description:"Dữ liệu cổ trùng không hợp lệ."};
}
const secPaths=subGus.map(t=>t.path);
const daoCheck=player
?player.calculateDaoAmplification(coreGu.path,secPaths)
:{multiplier:1.0,hasConflict:false};
if (daoCheck.hasConflict) {
return {
valid:false,
hasConflict:true,
name:"Xung Đột Đạo Ngân!",
typeLabel:"Tổ hợp Bài Xích",
essenceCost:15,
description:`Đạo ngân của [${coreGu.name} (${coreGu.path})] và [${subGus.map(s=>s.name + " (" + s.path + ")").join(", ")}] xung đột kịch liệt! Hãy chọn các cổ trùng tương sinh hoặc đạt Tông Sư lưu phái.`
};
}
const built=this._buildDynamicKillerMoveProfile(coreGu,subGus);
const isImmortalMove=built.moveRank>=6;
const rankLabel=`${GuSystem.getRankName(built.moveRank)} ${isImmortalMove?"Tiên Đạo" :"Phàm Đạo"}`;
const moveName=`${coreGu.name.replace(" Cổ","")} • ${subGus.map(s=>s.name.replace(" Cổ","")).join(" ")} Sát`;
const fullDesc=`[${rankLabel} | Uy lực gốc: ${built.finalPower} | Hồi chiêu: ${built.cooldown}s] ${built.traitSummaryText}`;
return {
valid:true,
isPreset:false,
customData:{
id:`km_custom_${coreGu.id}_${subGus.map(s=>s.id).join("_")}`,
name:moveName,
icon:isImmortalMove?"🌟" :coreGu.icon,
moveRank:built.moveRank,
path:coreGu.path,
type:coreGu.type,
typeLabel:`${rankLabel} Sát Chiêu (${coreGu.path})`,
requiredGuIds:[coreGu.id,...subGus.map(s=>s.id)],
essenceCost:built.finalEssenceCost,
cooldown:built.cooldown,
power:built.finalPower,
isImmortal:isImmortalMove,
combatProfile:built.combatProfile,
description:fullDesc
},
name:`${moveName} (${GuSystem.getRankName(built.moveRank)})`,
typeLabel:`${rankLabel} Sát Chiêu (${coreGu.path})`,
isImmortal:isImmortalMove,
moveRank:built.moveRank,
essenceCost:built.finalEssenceCost,
description:fullDesc
};
}
deduceAndSaveKillerMove(coreId,sub1Id,sub2Id,player) {
const preview=this.previewKillerMoveDeduction(coreId,sub1Id,sub2Id,player);
if (!coreId||(!sub1Id&& !sub2Id)) {
return {
success:false,
message:"Hãy chọn ít nhất 1 Cổ Cốt Lõi và 1 Cổ Phụ Trợ để thôi diễn Sát Chiêu!"
};
}
if (player&&player.mental<20) {
return {
success:false,
message:"Tinh thần lực không đủ (cần 20) để thôi diễn Sát Chiêu!"
};
}
if (player) {
player.mental=Math.max(0,player.mental - 20);
}
if (!preview.valid) {
return {
success:false,
message:"Thôi diễn thất bại! Các cổ trùng bài xích lẫn nhau khiến linh quang tan vỡ (-20 Tinh Thần Lực)."
};
}
const moveObj=JSON.parse(JSON.stringify(preview.customData));
const existingIdx=this.savedKillerMoves.findIndex(m=>m.id===moveObj.id);
if (existingIdx!== -1) {
this.savedKillerMoves[existingIdx]=moveObj;
return {
success:true,
move:moveObj,
message:`⚡ Đã cập nhật Sát Chiêu 【${moveObj.name}】 lên ${GuSystem.getRankName(moveObj.moveRank)} (Uy lực gốc: ${moveObj.power})!`
};
}
this.savedKillerMoves.push(moveObj);
if (player) {
player.addDaoMarks("Trí Đạo",4);
}
const emptyKSlot=this.equippedKillerSlots.findIndex(s=>s===null);
if (emptyKSlot!== -1) {
this.equippedKillerSlots[emptyKSlot]=moveObj.id;
}
return {
success:true,
move:moveObj,
message:`⚡ Thôi diễn thành công 【${moveObj.name} (${GuSystem.getRankName(moveObj.moveRank)})】 (Uy lực gốc: ${moveObj.power})!`
};
}
getSavedKillerMoves() {
this._recalculateSavedKillerMoves();
return this.savedKillerMoves;
}
equipKillerMoveToSlot(moveId,kSlotIdx) {
if (kSlotIdx<0||kSlotIdx>3) {
return {success:false,message:"Ô Sát Chiêu không hợp lệ."};
}
const move=this.savedKillerMoves.find(m=>m.id===moveId);
if (!move) {
return {success:false,message:"Không tìm thấy Sát Chiêu này."};
}
this.equippedKillerSlots[kSlotIdx]=move.id;
const keys=["Z","X","C","V"];
return {
success:true,
message:`Đã gán Sát Chiêu [${move.name} (${GuSystem.getRankName(move.moveRank)})] vào phím [${keys[kSlotIdx]}].`
};
}
getEquippedKillerMoveAt(kSlotIdx) {
const moveId=this.equippedKillerSlots[kSlotIdx];
if (!moveId) return null;
return this.savedKillerMoves.find(m=>m.id===moveId)||null;
}
validateKillerMoveComponents(move) {
if (!move|| !Array.isArray(move.requiredGuIds)) {
return {valid:false,reason:"Dữ liệu Sát Chiêu bị lỗi."};
}
for (const reqGuId of move.requiredGuIds) {
const resolvedId=LEGACY_GU_ALIASES[reqGuId]?LEGACY_GU_ALIASES[reqGuId].id :reqGuId;
const owned=this.ownedGuList.find(g=>g.id===resolvedId&&g.isRefined);
if (!owned) {
const tpl=GU_DATABASE[resolvedId];
return {
valid:false,
reason:`Thiếu cổ trùng thành phần [${tpl?tpl.name :reqGuId}] trong Kho Cổ! Sát chiêu [${move.name}] không thể vận hành.`
};
}
if (owned.hunger<=0) {
return {
valid:false,
reason:`Cổ trùng thành phần [${GuSystem.formatGuNameWithRank(owned)}] đang đói kiệt sức (0%)! Hãy cho ăn trước.`
};
}
}
return {valid:true};
}
equipGuToSlot(instanceId,slotIdx) {
if (slotIdx<0||slotIdx>7) {
return {success:false,message:"Ô kỹ năng phải từ 1 đến 8."};
}
const gu=this.getGuByInstanceId(instanceId);
if (!gu) return {success:false,message:"Không tìm thấy Cổ Trùng."};
if (!gu.isRefined) {
return {
success:false,
message:`[${GuSystem.formatGuNameWithRank(gu)}] là Cổ Hoang Dã chưa được luyện hóa, không thể trang bị!`
};
}
if (gu.equippedSlot!==null&&gu.equippedSlot!==slotIdx) {
this.equippedGuSlots[gu.equippedSlot]=null;
}
const prevInstanceId=this.equippedGuSlots[slotIdx];
if (prevInstanceId&&prevInstanceId!==instanceId) {
const prevGu=this.getGuByInstanceId(prevInstanceId);
if (prevGu) prevGu.equippedSlot=null;
}
this.equippedGuSlots[slotIdx]=gu.instanceId;
gu.equippedSlot=slotIdx;
return {
success:true,
message:`Đã trang bị [${GuSystem.formatGuNameWithRank(gu)}] vào Ô Xuất Chiến ${slotIdx + 1}.`
};
}
getEquippedGuAt(slotIdx) {
const instId=this.equippedGuSlots[slotIdx];
if (!instId) return null;
return this.getGuByInstanceId(instId);
}
getGuByInstanceId(instanceId) {
if (!instanceId) return null;
return this.ownedGuList.find(g=>g.instanceId===instanceId)||null;
}
hasImmortalGu(templateId,excludeInstanceId=null) {
if (!templateId) return false;
const resolvedId=LEGACY_GU_ALIASES[templateId]?LEGACY_GU_ALIASES[templateId].id :templateId;
return this.ownedGuList.some(
g=>g.id===resolvedId&&g.rank>=6&&g.instanceId!==excludeInstanceId
);
}
getImmortalGuByTemplate(templateId) {
if (!templateId) return null;
const resolvedId=LEGACY_GU_ALIASES[templateId]?LEGACY_GU_ALIASES[templateId].id :templateId;
return this.ownedGuList.find(g=>g.id===resolvedId&&g.rank>=6)||null;
}
hasRefinedGuByTemplate(templateId) {
const resolvedId=LEGACY_GU_ALIASES[templateId]?LEGACY_GU_ALIASES[templateId].id :templateId;
return this.ownedGuList.some(g=>g.id===resolvedId&&g.isRefined);
}
getRefinedGuList() {
const byIdHighest=new Map();
for (const gu of this.ownedGuList) {
if (!gu.isRefined) continue;
this._syncGuInstanceStats(gu);
const prev=byIdHighest.get(gu.id);
if (!prev||gu.rank>prev.rank) {
byIdHighest.set(gu.id,gu);
}
}
return Array.from(byIdHighest.values());
}
removeGuByInstanceId(instanceId) {
const idx=this.ownedGuList.findIndex(g=>g.instanceId===instanceId);
if (idx=== -1) return false;
const gu=this.ownedGuList[idx];
if (gu.equippedSlot!==null) {
this.equippedGuSlots[gu.equippedSlot]=null;
}
this.ownedGuList.splice(idx,1);
return true;
}
getFilteredGuList(filter="all") {
return this.ownedGuList.filter(gu=>{
this._syncGuInstanceStats(gu);
switch (filter) {
case "all":return true;
case "rank-1":return gu.rank===1;
case "rank-2":return gu.rank===2;
case "rank-3":return gu.rank===3;
case "rank-4":return gu.rank===4;
case "rank-5":return gu.rank===5;
case "immortal":return gu.rank>=6;
case "offensive":return gu.type==="offensive";
case "defensive":return gu.type==="defensive";
case "movement":return gu.type==="movement";
case "support":return gu.type==="support";
default:return true;
}
});
}
toSaveData() {
return {
ownedGuList:this.ownedGuList,
nextInstanceCounter:this.nextInstanceCounter,
equippedGuSlots:this.equippedGuSlots,
savedKillerMoves:this.savedKillerMoves,
equippedKillerSlots:this.equippedKillerSlots,
unlockedRecipeIds:this.unlockedRecipeIds,
refinementExp:this.refinementExp||0,
refinementPityStreak:this.refinementPityStreak||0
};
}
fromSaveData(data) {
if (!data||typeof data!=="object") return;
this.reset();
if (Array.isArray(data.ownedGuList)) {
const synced=data.ownedGuList
.filter(g=>g&&typeof g==="object"&&typeof g.id==="string")
.map(g=>this._syncGuInstanceStats(g))
.filter(g=>g&&GU_DATABASE[g.id]);
const seenImmortal=new Map();
const cleaned=[];
for (const g of synced) {
if (g&&g.rank>=6) {
const prev=seenImmortal.get(g.id);
if (!prev) {
seenImmortal.set(g.id,g);
cleaned.push(g);
} else if (g.rank>prev.rank) {
const idx=cleaned.indexOf(prev);
if (idx!== -1) cleaned[idx]=g;
seenImmortal.set(g.id,g);
}
} else if (g) {
cleaned.push(g);
}
}
this.ownedGuList=cleaned;
}
const validIds=new Set(this.ownedGuList.map(g=>g.instanceId));
this.nextInstanceCounter=(typeof data.nextInstanceCounter==="number"&&Number.isFinite(data.nextInstanceCounter))
?Math.max(this.ownedGuList.length + 1,Math.floor(data.nextInstanceCounter))
:(this.ownedGuList.length + 1);
this.equippedGuSlots=[null,null,null,null,null,null,null,null];
if (Array.isArray(data.equippedGuSlots)) {
for (let i=0;i<8;i++) {
const instId=data.equippedGuSlots[i];
if (typeof instId==="string"&&validIds.has(instId)) {
this.equippedGuSlots[i]=instId;
}
}
}
for (const g of this.ownedGuList) {
const idx=this.equippedGuSlots.indexOf(g.instanceId);
g.equippedSlot=idx>=0?idx :null;
}
if (Array.isArray(data.savedKillerMoves)) {
this.savedKillerMoves=data.savedKillerMoves.filter(m=>m&&typeof m==="object"&&typeof m.id==="string"&&Array.isArray(m.requiredGuIds));
}
const validMoveIds=new Set(this.savedKillerMoves.map(m=>m.id));
this.equippedKillerSlots=[null,null,null,null];
if (Array.isArray(data.equippedKillerSlots)) {
for (let i=0;i<4;i++) {
const mId=data.equippedKillerSlots[i];
if (typeof mId==="string"&&validMoveIds.has(mId)) {
this.equippedKillerSlots[i]=mId;
}
}
}
if (Array.isArray(data.unlockedRecipeIds)) {
this.unlockedRecipeIds=data.unlockedRecipeIds.filter(r=>typeof r==="string");
}
this.refinementExp=(typeof data.refinementExp==="number"&&Number.isFinite(data.refinementExp))?Math.max(0,Math.floor(data.refinementExp)) :0;
this.refinementPityStreak=(typeof data.refinementPityStreak==="number"&&Number.isFinite(data.refinementPityStreak))?Math.max(0,Math.min(5,Math.floor(data.refinementPityStreak))) :0;
this._recalculateSavedKillerMoves();
}
}
GuSystem.RANK_NAMES=RANK_NAMES;
GuSystem.GU_DATABASE=GU_DATABASE;
GuSystem.LEGACY_GU_ALIASES=LEGACY_GU_ALIASES;
GuSystem.REFINEMENT_RECIPES=REFINEMENT_RECIPES;
GuSystem.PRESET_KILLER_MOVES=PRESET_KILLER_MOVES;
GuSystem.REFINEMENT_TECHNIQUES=REFINEMENT_TECHNIQUES;
GuSystem.REFINEMENT_CATALYSTS=REFINEMENT_CATALYSTS;
GuSystem.REFINEMENT_MASTERY_TIERS=REFINEMENT_MASTERY_TIERS;
GuSystem.MATERIAL_SYNTHESIS_RECIPES=MATERIAL_SYNTHESIS_RECIPES;
GuSystem.WILD_REFINE_CONFIG=WILD_REFINE_CONFIG;
GuSystem.RANK_ESSENCE_COST_BASE=RANK_ESSENCE_COST_BASE;
global.GuSystem=GuSystem;
})(window);
