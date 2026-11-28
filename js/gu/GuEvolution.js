(function (global) {
"use strict";
function _getUpgradeReqs(instanceId,player) {
const gu=this.getGuByInstanceId(instanceId);
if (!gu) return {canUpgrade:false,reason:"Không tìm thấy Cổ Trùng."};
if (!gu.isRefined) return {canUpgrade:false,reason:"Phải Luyện Hóa Cổ Hoang Dã trước khi thăng Chuyển!"};
this._syncGuInstanceStats(gu);
if (gu.rank>=gu.maxRank) {
return {
canUpgrade:false,
atMaxRank:true,
reason:gu.realmCategory==="mortal_only"
?`[${gu.name}] là Phàm Cổ, đã đạt giới hạn tối đa ở ${global.GuSystem.getRankName(gu.maxRank)}!`
:`[${gu.name}] đã đạt đỉnh phong ${global.GuSystem.getRankName(gu.maxRank)}!`
};
}
const nextRank=gu.rank + 1;
const isImmortalStep=nextRank>=6;
if (isImmortalStep&&this.hasImmortalGu(gu.id,gu.instanceId)) {
return {
canUpgrade:false,
blockedUnique:true,
reason:`Tiên Cổ là duy nhất! Ngươi đã sở hữu Tiên Cổ 【${gu.name}】, không thể thăng cấp thêm con Tiên Cổ thứ hai cùng loại!`
};
}
const stoneCostByNextRank={
2:24,
3:75,
4:210,
5:480,
6:1050,
7:2400,
8:5400,
9:12000
};
const immortalStoneCostByNextRank={
6:1,
7:2,
8:5,
9:12
};
const baseChanceByNextRank={
2:0.82,
3:0.70,
4:0.60,
5:0.52,
6:0.44,
7:0.40,
8:0.36,
9:0.32
};
const luyenMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Luyện Đạo") :0;
const triMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Trí Đạo") :0;
const vanMarks=(player&&typeof player.getEffectiveDaoMarks==="function")?player.getEffectiveDaoMarks("Vận Đạo") :0;
const bonusChance=(luyenMarks*0.0018) + (triMarks*0.001) + (vanMarks*0.0012) + (player?player.refinementBonus :0);
const finalChance=Math.min(0.95,Number(((baseChanceByNextRank[nextRank]||0.4) + bonusChance).toFixed(2)));
return {
canUpgrade:true,
currentRank:gu.rank,
nextRank:nextRank,
nextRankName:global.GuSystem.getRankName(nextRank),
reqCultivationRank:Math.max(1,nextRank - 1),
stoneCost:stoneCostByNextRank[nextRank]||500,
immortalStoneCost:isImmortalStep?(immortalStoneCostByNextRank[nextRank]||1) :0,
foodItemId:gu.foodItemId,
foodCount:1,
successChance:finalChance
};
}
function _upgradeRank(instanceId,player,aperture) {
const gu=this.getGuByInstanceId(instanceId);
if (!gu) return {success:false,message:"Không tìm thấy Cổ Trùng."};
const req=this.getGuUpgradeRequirements(instanceId,player);
if (!req.canUpgrade) {
return {success:false,message:req.reason};
}
if (aperture&&aperture.rank<req.reqCultivationRank) {
return {
success:false,
message:`Tu vi chưa đủ! Cần đạt tối thiểu ${global.GuSystem.getRankName(req.reqCultivationRank)} để thăng [${gu.name}] lên ${req.nextRankName}.`
};
}
if (player.primevalStones<req.stoneCost) {
return {
success:false,
message:`Không đủ Nguyên Thạch! Cần 💎 ${req.stoneCost} Nguyên Thạch để hợp luyện thăng lên ${req.nextRankName}.`
};
}
if (req.immortalStoneCost>0&&player.immortalStones<req.immortalStoneCost) {
return {
success:false,
message:`Thăng cấp Tiên Cổ lên ${req.nextRankName} cần 🌟 ${req.immortalStoneCost} Tiên Nguyên Thạch!`
};
}
const foodMeta=global.PlayerManager.ITEM_DATABASE[req.foodItemId]||{name:"Cổ Tài"};
if (player.getItemCount(req.foodItemId)<req.foodCount) {
return {
success:false,
message:`Thiếu phụ liệu bản mệnh: Cần ${req.foodCount}x [${foodMeta.name}] để thăng Chuyển cho ${gu.name}!`
};
}
player.primevalStones -=req.stoneCost;
if (req.immortalStoneCost>0) {
player.removeItem("immortal_stone",req.immortalStoneCost);
}
player.removeItem(req.foodItemId,req.foodCount);
if (Math.random()<=req.successChance) {
const oldRankName=global.GuSystem.getRankName(gu.rank);
gu.rank=req.nextRank;
gu.hunger=100;
this._syncGuInstanceStats(gu);
if (gu.isVital&&aperture) {
aperture.vitalGuName=`${gu.name} (${global.GuSystem.getRankName(gu.rank)} - ${gu.path})`;
}
player.addPathAttainmentExp("Luyện Đạo",4*gu.rank);
if (player.isImmortalCultivator()) player.addDaoMarks("Luyện Đạo",4*gu.rank);
if (aperture) aperture.humanQi +=3*gu.rank;
this._recalculateSavedKillerMoves();
return {
success:true,
gu:gu,
message:`🔥 Thăng Chuyển đại thành! 【${gu.name}】 đã tấn thăng từ ${oldRankName} lên 【${global.GuSystem.getRankName(gu.rank)}】 (Uy lực gốc đạt: ${gu.power})!`
};
} else {
gu.hunger=Math.max(15,gu.hunger - 30);
player.addPathAttainmentExp("Luyện Đạo",2);
if (player.isImmortalCultivator()) player.addDaoMarks("Luyện Đạo",2);
return {
success:false,
message:`Thăng Chuyển [${gu.name}] lên ${req.nextRankName} thất bại! Cổ trùng bị chấn thương nhẹ (Độ no giảm còn ${Math.round(gu.hunger)}%), may mắn bảo toàn tính mạng (${player.isImmortalCultivator()?"+2 Đạo Ngân Luyện Đạo" :"+2 Lĩnh Ngộ Luyện Đạo"}).`
};
}
}
class GuEvolution {
constructor(guSystem) {this.guSystem=guSystem||null;}
getRequirements(instanceId,player) {
return _getUpgradeReqs.call(this.guSystem,instanceId,player);
}
evolveRank(instanceId,player,aperture) {
return _upgradeRank.call(this.guSystem,instanceId,player,aperture);
}
getEvolutionLineageSummary(gu) {
if (!gu) return "";
const G=global.GuSystem;
const curName=G&&G.getRankName?G.getRankName(gu.rank) :`${gu.rank} Chuyển`;
const maxName=G&&G.getRankName?G.getRankName(gu.maxRank) :`${gu.maxRank} Chuyển`;
if (gu.realmCategory==="mortal_only") return `Phàm Cổ (${curName} → Tối đa ${maxName})`;
if (gu.realmCategory==="immortal_only") return `Tiên Cổ Duy Nhất (${curName} → Đỉnh Phong ${maxName})`;
return `Linh Cổ Thăng Tiên (${curName} → Có thể tiến hóa lên ${maxName})`;
}
}
global.GuEvolution=GuEvolution;
})(window);
