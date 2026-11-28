(function (global) {
"use strict";
function _synthesizeMaterial(synId,player) {
const syn=global.GuSystem.MATERIAL_SYNTHESIS_RECIPES.find(s=>s.id===synId);
if (!syn|| !player) return {success:false,message:"Không tìm thấy công thức tinh luyện."};
if (player.primevalStones<syn.stoneCost) {
return {success:false,message:`Không đủ Nguyên Thạch (Cần 💎 ${syn.stoneCost})!`};
}
for (const req of syn.materials) {
if (player.getItemCount(req.itemId)<req.count) {
const meta=global.PlayerManager.ITEM_DATABASE[req.itemId]||{name:req.itemId};
return {success:false,message:`Thiếu cổ tài: Cần ${req.count}x [${meta.name}]!`};
}
}
player.primevalStones -=syn.stoneCost;
for (const req of syn.materials) {
player.removeItem(req.itemId,req.count);
}
player.addItem(syn.resultItemId,syn.resultCount||1);
this.refinementExp=(this.refinementExp||0) + 8;
player.addPathAttainmentExp("Luyện Đạo",2);
const isImmSyn=typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator();
if (isImmSyn) player.addDaoMarks("Luyện Đạo",2);
return {
success:true,
message:`⚗️ Tinh luyện thành công ${syn.resultCount||1}x 【${syn.icon} ${syn.name}】 (+8 EXP Luyện Cổ${isImmSyn?", +2 ĐN Luyện Đạo" :", +2 Lĩnh Ngộ Luyện Đạo"})!`
};
}
function _salvageOne(instanceId,player) {
const gu=this.getGuByInstanceId(instanceId);
if (!gu|| !player) return {success:false,message:"Không tìm thấy Cổ Trùng để phân giải."};
if (gu.isVital) {
return {success:false,message:"Không thể phân giải Cổ Bản Mệnh đang trấn thủ Không Khiếu!"};
}
const stonesByRank={1:18,2:55,3:160,4:420,5:1100,6:2600,7:5500,8:12000,9:30000};
const stoneGain=stonesByRank[gu.rank]||18;
const daoGain=Math.max(2,gu.rank*3);
const expGain=6 + gu.rank*5;
const foodItemId=gu.foodItemId;
const fullName=global.GuSystem.formatGuNameWithRank(gu);
this.removeGuByInstanceId(gu.instanceId);
player.primevalStones +=stoneGain;
if (foodItemId&&global.PlayerManager.ITEM_DATABASE[foodItemId]) {
player.addItem(foodItemId,Math.min(3,Math.max(1,Math.ceil(gu.rank / 2))));
}
if (gu.rank>=6) {
player.addItem("immortal_stone",gu.rank - 4);
}
player.addPathAttainmentExp("Luyện Đạo",daoGain);
const isImmSal=typeof player.isImmortalCultivator==="function"&&player.isImmortalCultivator();
if (isImmSal) player.addDaoMarks("Luyện Đạo",daoGain);
this.refinementExp=(this.refinementExp||0) + expGain;
this._recalculateSavedKillerMoves();
const foodMeta=global.PlayerManager.ITEM_DATABASE[foodItemId];
return {
success:true,
message:`♻️ Đã phân giải 【${fullName}】 thu hồi 💎 +${stoneGain} Nguyên Thạch${foodMeta?`, +${Math.min(3,Math.max(1,Math.ceil(gu.rank / 2)))}x ${foodMeta.name}` :""}${gu.rank>=6?`, 🌟 +${gu.rank - 4} Tiên Thạch` :""}, ${isImmSal?`+${daoGain} ĐN Luyện Đạo` :`+${daoGain} Lĩnh Ngộ Luyện Đạo`} & +${expGain} EXP!`
};
}
function _salvageDuplicates(player) {
if (!player) return {success:false,message:"Thiếu dữ liệu người chơi."};
const bestByTemplate=new Map();
for (const g of this.ownedGuList) {
if (!g.isRefined||g.rank>=6) continue;
const prev=bestByTemplate.get(g.id);
if (!prev||g.rank>prev.rank||(g.rank===prev.rank&&(g.isVital||g.equippedSlot!==null))) {
bestByTemplate.set(g.id,g);
}
}
const toSalvage=this.ownedGuList.filter(g=>{
if (!g.isRefined||g.isVital||g.equippedSlot!==null||g.rank>=6) return false;
return bestByTemplate.get(g.id)!==g;
});
if (toSalvage.length===0) {
return {success:false,message:"Không có Phàm Cổ trùng lặp chưa lắp nào để phân giải!"};
}
let totalStones=0;
let count=0;
const stonesByRank={1:18,2:55,3:160,4:420,5:1100};
for (const g of toSalvage) {
totalStones +=stonesByRank[g.rank]||18;
this.salvageGu(g.instanceId,player);
count +=1;
}
return {
success:true,
message:`♻️ Đã phân giải nhanh ${count} Phàm Cổ trùng lặp dư thừa, thu về tổng cộng 💎 +${totalStones.toLocaleString("vi-VN")} Nguyên Thạch cùng Cổ Tài & EXP Luyện Đạo!`
};
}
class GuSynthesis {
constructor(guSystem) {this.guSystem=guSystem||null;}
synthesizeMaterial(synId,player) {return _synthesizeMaterial.call(this.guSystem,synId,player);}
salvageOne(instanceId,player) {return _salvageOne.call(this.guSystem,instanceId,player);}
salvageDuplicates(player) {return _salvageDuplicates.call(this.guSystem,player);}
}
global.GuSynthesis=GuSynthesis;
})(window);
