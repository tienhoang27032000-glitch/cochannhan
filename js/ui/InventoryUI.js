(function (global) {
"use strict";
function _renderInventory() {
if (!this.player) return;
const d=this.dom;
let items=[...(this.player.inventory||[])];
if (this.currentInventoryFilter!=="all") {
items=items.filter(slot=>{
const meta=global.PlayerManager.ITEM_DATABASE[slot.id]||{};
if (this.currentInventoryFilter==="special") {
return meta.category==="relic_gu"||meta.category==="physique_gu"||meta.category==="recipe_scroll"||meta.category==="immortal_material"||meta.category==="enslave_gu";
}
if (this.currentInventoryFilter==="consumable") {
return Boolean(meta.hpRestore||meta.mentalRestore||meta.staminaRestore);
}
if (this.currentInventoryFilter==="material") {
return meta.category==="ore"||meta.category==="material"||meta.category==="herb"||meta.category==="food";
}
return true;
});
}
if (items.length===0) {
global.UIManager._setEmptyHint(d.inventoryGrid,"Hành trang trống rỗng.",true);
} else {
d.inventoryGrid.innerHTML=items.map(slot=>{
const meta=global.PlayerManager.ITEM_DATABASE[slot.id]||{name:slot.id,icon:"📦"};
const isSel=slot.id===this.selectedInventoryItemId;
return `
<div class="item-card ${isSel?"selected" :""}" data-item-id="${global.UIManager.escapeHtml(slot.id)}">
<div class="icon">${global.UIManager.escapeHtml(meta.icon)}</div>
<div class="name">${global.UIManager.escapeHtml(meta.name)}</div>
<div class="rank-tag">x${Number(slot.count)||0}</div>
</div>
                    `;
}).join("");
}
d.inventoryGrid.querySelectorAll(".item-card").forEach(card=>{
card.addEventListener("click",()=>{
this.selectedInventoryItemId=card.getAttribute("data-item-id");
this.renderInventoryTab();
});
});
const selMeta=global.PlayerManager.ITEM_DATABASE[this.selectedInventoryItemId];
const selCount=this.player.getItemCount(this.selectedInventoryItemId);
if (!selMeta||selCount<=0) {
global.UIManager._setEmptyHint(d.inventoryDetailBox,"Chọn một vật phẩm bên trái để sử dụng (Xá Lợi Cổ / Thảo Dược) hoặc bán lấy Nguyên Thạch.");
} else {
const sellValue=Math.max(1,Math.floor(selMeta.value*0.6));
d.inventoryDetailBox.innerHTML=`
<strong style="font-size:16px;color:#e2bf75;">${selMeta.icon} ${selMeta.name} (Đang có: ${selCount})</strong>
<p class="sub-text">${selMeta.desc}</p>
<p>Giá bán lại cho Thương Hội: <strong>💎 ${sellValue} Nguyên Thạch / cái</strong></p>
<div class="action-row mt-10">
<button id="btn-use-inv-item" class="btn-primary">✨ Sử Dụng Vật Phẩm</button>
<button id="btn-sell-inv-item" class="btn-secondary">💰 Bán 1 (+${sellValue}💎)</button>
                        ${selCount>=5?`<button id="btn-sell-inv-item-5" class="btn-secondary">💰 Bán 5 (+${sellValue*5}💎)</button>` :""}
<button id="btn-send-item-to-refine" class="btn-accent">⚗️ Đưa Vào Lò Hợp Luyện</button>
</div>
                `;
document.getElementById("btn-use-inv-item").addEventListener("click",()=>{
const res=this.player.useItem(this.selectedInventoryItemId);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderInventoryTab();
this.updateHubTopbar();
});
document.getElementById("btn-sell-inv-item").addEventListener("click",()=>{
if (this.player.removeItem(this.selectedInventoryItemId,1)) {
this.player.primevalStones +=sellValue;
this.addLog(`Đã bán 1x [${selMeta.name}] thu về 💎 ${sellValue} Nguyên Thạch.`,"loot");
this.renderInventoryTab();
this.updateHubTopbar();
}
});
const btnSell5=document.getElementById("btn-sell-inv-item-5");
if (btnSell5) {
btnSell5.addEventListener("click",()=>{
if (this.player.removeItem(this.selectedInventoryItemId,5)) {
this.player.primevalStones +=sellValue*5;
this.addLog(`Đã bán 5x [${selMeta.name}] thu về 💎 ${sellValue*5} Nguyên Thạch.`,"loot");
this.renderInventoryTab();
this.updateHubTopbar();
}
});
}
document.getElementById("btn-send-item-to-refine").addEventListener("click",()=>{
this.refinementSlots[2]=this.selectedInventoryItemId;
this.switchHubTab("tab-refinement");
});
}
}
class InventoryUI {
constructor(uiManager) {this.ui=uiManager||null;}
render() {if (this.ui) _renderInventory.call(this.ui);}
}
global.InventoryUI=InventoryUI;
})(window);
