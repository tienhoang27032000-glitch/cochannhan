(function (global) {
"use strict";
function _renderGuStorage() {
if (!this.guSystem|| !this.player) return;
const d=this.dom;
const G=global.GuSystem;
if (d.hubEquippedGuBar) {
d.hubEquippedGuBar.innerHTML=[0,1,2,3,4,5,6,7].map(idx=>{
const gu=this.guSystem.getEquippedGuAt(idx);
const fullGuTitle=gu&&G.formatGuNameWithRank?G.formatGuNameWithRank(gu) :"Ô trống";
return `
<div class="skill-slot" title="${global.UIManager.escapeHtml(fullGuTitle)}">
<span class="slot-key">Ô ${idx + 1}</span>
<div class="slot-icon">${gu?(global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gu,34,"gu-slot-art") :global.UIManager.escapeHtml(gu.icon)) :""}</div>
<span class="slot-cost">${gu?Number(gu.rank) + "C" :""}</span>
</div>
                    `;
}).join("");
}
let list=[...this.guSystem.getFilteredGuList(this.currentGuFilter)];
if (this.guSearchQuery) {
const q=this.guSearchQuery;
list=list.filter(g=>
(g.name||"").toLowerCase().includes(q)||
(g.path||"").toLowerCase().includes(q)
);
}
if (this.guSortBy==="rank_desc") {
list.sort((a,b)=>(b.rank - a.rank)||(b.power - a.power));
} else if (this.guSortBy==="power_desc") {
list.sort((a,b)=>(b.power - a.power)||(b.rank - a.rank));
} else if (this.guSortBy==="hunger_asc") {
list.sort((a,b)=>(a.hunger - b.hunger));
} else if (this.guSortBy==="path_asc") {
list.sort((a,b)=>(a.path||"").localeCompare(b.path||"")||(b.rank - a.rank));
}
if (list.length===0) {
global.UIManager._setEmptyHint(d.guStorageGrid,"Không tìm thấy Cổ Trùng phù hợp.",true);
} else {
d.guStorageGrid.innerHTML=list.map(gu=>{
const isSel=gu.instanceId===this.selectedGuInstanceId;
const vitalStar=gu.isVital?"★" :"";
const rankName=G.getRankName?G.getRankName(gu.rank) :`${gu.rank} Chuyển`;
const statusTag= !gu.isRefined?"[Hoang Dã]" :(gu.equippedSlot!==null?`[Ô ${gu.equippedSlot + 1}]` :"");
const hungerPct=Math.max(0,Math.min(100,Math.round(gu.hunger||0)));
return `
<div class="item-card rank-border-${Number(gu.rank)||1} ${isSel?"selected" :""}" data-gu-inst="${global.UIManager.escapeHtml(gu.instanceId)}">
<div class="icon gu-card-icon-wrap">${global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gu,48,"gu-card-art") :global.UIManager.escapeHtml(gu.icon)}</div>
<div class="name">${vitalStar}${global.UIManager.escapeHtml(gu.name)}</div>
<div class="rank-tag">${global.UIManager.escapeHtml(rankName)} ${global.UIManager.escapeHtml(statusTag)}</div>
<div class="gu-hunger-mini" title="Độ no: ${hungerPct}%">
<div class="gu-hunger-mini-fill ${hungerPct<30?"low" :""}" style="width:${hungerPct}%;"></div>
</div>
</div>
                    `;
}).join("");
}
d.guStorageGrid.querySelectorAll(".item-card").forEach(card=>{
card.addEventListener("click",()=>{
this.selectedGuInstanceId=card.getAttribute("data-gu-inst");
this.renderGuStorageTab();
});
});
const gu=this.guSystem.getGuByInstanceId(this.selectedGuInstanceId);
if (!gu) {
global.UIManager._setEmptyHint(d.guDetailBox,"Chọn một Cổ Trùng bên trái để xem cấp Chuyển (1–9), Thăng Chuyển trực tiếp, cho ăn hoặc gán vào 8 ô chiến đấu.");
return;
}
const fullGuName=G.formatGuNameWithRank?G.formatGuNameWithRank(gu) :`${gu.name} ${gu.rank} Chuyển`;
const realmCatLabel=G.getRealmCategoryLabel?G.getRealmCategoryLabel(gu.realmCategory) :"Phàm Cổ (1–5 Chuyển)";
const foodMeta=global.PlayerManager.ITEM_DATABASE[gu.foodItemId]||{name:"Nguyên Thạch"};
const foodCount=this.player.getItemCount(gu.foodItemId);
const daoAmp=this.player.calculateDaoAmplification(gu.path,[]);
const effectivePower=Math.round(gu.power*daoAmp.multiplier);
const traitDesc=(gu.killerTrait&&gu.killerTrait.modifierDesc)
?gu.killerTrait.modifierDesc
:"Gia tăng uy năng Sát Chiêu cùng lưu phái";
const upReq=this.guSystem.getGuUpgradeRequirements
?this.guSystem.getGuUpgradeRequirements(gu.instanceId,this.player)
:{canUpgrade:false,reason:"Không hỗ trợ"};
let wildRefineBoxHtml="";
if (!gu.isRefined&&typeof this.guSystem.getWildGuRefinementInfo==="function") {
const wInfo=this.guSystem.getWildGuRefinementInfo(gu.instanceId,this.player,this.aperture,this.selectedSuppressorGuId);
if (wInfo.valid) {
const eligible=wInfo.eligibleSuppressors||[];
const supOptions=[
`<option value="auto" ${this.selectedSuppressorGuId==="auto"?"selected" :""}>🤖 Tự chọn Cổ chuyển cao nhất (${eligible[0]?G.formatGuNameWithRank(eligible[0]) :"Chưa có"})</option>`,
`<option value="none" ${this.selectedSuppressorGuId==="none"?"selected" :""}>✖ Không dùng Cổ áp chế</option>`,
...eligible.map(sg=>
`<option value="${sg.instanceId}" ${this.selectedSuppressorGuId===sg.instanceId?"selected" :""}>🐉 ${sg.icon} ${G.formatGuNameWithRank(sg)} (+${sg.rank - gu.rank} Chuyển)</option>`
)
].join("");
const pctBar=Math.max(0,Math.min(100,Math.round(gu.refinementProgress||0)));
const btnText=wInfo.instantRefine
?`⚡ Áp Chế Luyện Hóa Tức Thì 100% (-${wInfo.stoneCost}💎, -${wInfo.mentalCost} Tinh Thần)`
:`🔥 Luyện Hóa Dã Cổ (-${wInfo.stoneCost.toLocaleString("vi-VN")}💎, -${wInfo.mentalCost} Tinh Thần)`;
wildRefineBoxHtml=`
<div class="recipe-preview-box mt-10" style="border-color:#ff9f43;margin-bottom:4px;">
<p><strong style="color:#ffd700;">🔥 Luyện Hóa Dã Cổ (Bằng Nguyên Thạch & Tinh Thần):</strong></p>
<div class="progress-track mt-5" style="height:10px;">
<div class="progress-fill cultivation-fill" style="width:${pctBar}%;"></div>
</div>
<p class="mt-5">Tiến độ: <strong>${pctBar}% / 100%</strong> | Tỷ lệ thành công: <strong style="color:#5cc995">${Math.round(wInfo.successChance*100)}%</strong> | Tiến độ/lần: <strong>+${wInfo.minGain}%–${wInfo.maxGain}%</strong></p>
<p>Chi phí mỗi lần: <strong>💎 ${wInfo.stoneCost.toLocaleString("vi-VN")} Nguyên Thạch</strong> (Có: ${this.player.primevalStones}) & <strong>🧠 ${wInfo.mentalCost} Tinh Thần</strong> (Có: ${Math.floor(this.player.mental)})</p>
<div class="form-group mt-5" style="margin-bottom:6px;">
<label for="wild-gu-suppressor-select" style="font-size:12px;">🐉 Chọn Cổ Cấp Chuyển Cao Hơn Áp Chế Khí Tức:</label>
<select id="wild-gu-suppressor-select">${supOptions}</select>
</div>
<p class="sub-text" style="color:${wInfo.suppressor?"#7ef7c4" :"#b3aa9c"};">${wInfo.suppressionLabel}</p>
<div class="action-grid-2 mt-5">
<button id="btn-inner-aperture-refine" class="btn-accent" title="Đưa Ý Niệm vào Không Khiếu áp chế & luyện hóa (-25% Nguyên Thạch, +15% tỷ lệ)">🧠 Hóa Niệm Nhập Khiếu (-25%💎)</button>
<button id="btn-refine-wild-gu" class="btn-primary">${btnText}</button>
</div>
</div>
                    `;
}
}
let upgradeBoxHtml="";
if (gu.isRefined) {
if (upReq.canUpgrade) {
const immStoneText=upReq.immortalStoneCost>0?` + 🌟 ${upReq.immortalStoneCost} Tiên Thạch` :"";
upgradeBoxHtml=`
<div class="recipe-preview-box mt-10" style="margin-bottom:4px;">
<p><strong class="highlight-gold">⬆️ Thăng Cấp Lên 【${gu.name} ${upReq.nextRankName}】:</strong></p>
<p>Chi phí: <strong>💎 ${upReq.stoneCost} Nguyên Thạch${immStoneText} + 1x ${foodMeta.name}</strong></p>
<p>Tỷ lệ thành công: <strong style="color:#5cc995">${Math.round(upReq.successChance*100)}%</strong> (Yêu cầu tu vi: ${G.getRankName(upReq.reqCultivationRank)})</p>
<button id="btn-upgrade-gu-rank" class="btn-primary mt-5" style="width:100%;">
                                🔥 Thăng Lên ${upReq.nextRankName} Ngay
</button>
</div>
                    `;
} else {
upgradeBoxHtml=`
<div class="recipe-preview-box mt-10" style="margin-bottom:4px;">
<p class="sub-text">${upReq.reason}</p>
</div>
                    `;
}
}
const equipBtns=gu.isRefined?`
<div class="mt-10">
<div class="sub-text" style="margin-bottom:4px;">Gán vào Ô Xuất Chiến (1–8):</div>
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;">
                        ${[0,1,2,3,4,5,6,7].map(sIdx=>
`<button class="btn-mini btn-equip-gu-slot" data-slot="${sIdx}">Ô ${sIdx + 1}</button>`
).join("")}
</div>
</div>
            ` :"";
d.guDetailBox.innerHTML=`
<div class="gu-detail-hero">
<div class="gu-detail-portrait rank-border-${Number(gu.rank)||1} ${gu.rank>=6?"immortal-portrait" :""}">
${global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gu,72,"gu-showcase-art") :global.UIManager.escapeHtml(gu.icon)}
</div>
<div class="gu-detail-hero-meta">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
<strong style="font-size:16.5px;color:#ffd700;">${global.UIManager.escapeHtml(fullGuName)}</strong>
<span class="badge">${global.UIManager.escapeHtml(gu.path)}</span>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;">
<span class="badge" style="border-color:${gu.rank>=6?"#4cd964" :"#b89758"};color:${gu.rank>=6?"#7ef7c4" :"#e2bf75"};">${global.UIManager.escapeHtml(realmCatLabel)}</span>
${gu.isVital?`<span class="badge" style="border-color:#ffd700;color:#ffd700;">★ Cổ Bản Mệnh</span>` :""}
${!gu.isRefined?`<span class="badge" style="border-color:#e05252;color:#ff9c9c;">Hoang Dã</span>` :""}
</div>
</div>
</div>
<p class="sub-text">${global.UIManager.escapeHtml(gu.description)}</p>
<div class="info-list">
<div class="info-row"><span>Phẩm cấp & Giới hạn:</span> <strong class="highlight-gold">${realmCatLabel} (${gu.minRank} → ${gu.maxRank} Chuyển)</strong></div>
<div class="info-row"><span>Trạng thái Luyện Hóa:</span> <strong>${gu.isRefined?"Đã Luyện Hóa (100%)" :`<span style="color:#e05252">Hoang Dã (${gu.refinementProgress}%)</span>`}</strong></div>
<div class="info-row"><span>Độ No / Thức Ăn:</span> <strong>${Math.round(gu.hunger)}% | ${foodMeta.name} (Có: ${foodCount})</strong></div>
<div class="info-row"><span>Tiêu hao / Hồi chiêu:</span> <strong>${gu.rank>=6?gu.essenceCost + " viên Tiên Nguyên" :gu.essenceCost + "% Chân Nguyên"} | ${gu.cooldown}s</strong></div>
<div class="info-row"><span>Uy lực (${G.getRankName(gu.rank)}):</span> <strong>${gu.power} (Thực chiến Đạo Ngân: <span class="highlight-gold">${effectivePower}</span>)</strong></div>
<div class="info-row"><span>Đặc tính ghép Sát Chiêu:</span> <strong style="color:#5cc995">${traitDesc}</strong></div>
</div>

                ${wildRefineBoxHtml}
                ${upgradeBoxHtml}

<div class="action-row mt-10">
                    ${gu.isRefined
?`<button id="btn-set-vital-gu" class="btn-secondary" ${gu.isVital?"disabled" :""}>☯ Đặt Làm Cổ Bản Mệnh</button>`
:""
}
<button id="btn-feed-gu" class="btn-accent">🍖 Cho Cổ Ăn (${foodMeta.name})</button>
<button id="btn-send-gu-to-refine" class="btn-secondary">⚗️ Đưa Sang Lò Hợp Luyện</button>
                    ${!gu.isVital?`<button id="btn-salvage-this-gu" class="btn-danger">♻️ Phân Giải Cổ</button>` :""}
</div>
                ${equipBtns}
            `;
const btnUpgradeRank=document.getElementById("btn-upgrade-gu-rank");
if (btnUpgradeRank) {
btnUpgradeRank.addEventListener("click",()=>{
const res=this.guSystem.upgradeGuRank(gu.instanceId,this.player,this.aperture);
this.addLog(res.message,res.success?"loot" :"warning");
if (this.game) this.game.autoSaveNow("upgrade_gu");
this.renderGuStorageTab();
this.updateHubTopbar();
});
}
const supSelect=document.getElementById("wild-gu-suppressor-select");
if (supSelect) {
supSelect.addEventListener("change",()=>{
this.selectedSuppressorGuId=supSelect.value||"auto";
this.renderGuStorageTab();
});
}
const btnInnerRefine=document.getElementById("btn-inner-aperture-refine");
if (btnInnerRefine) {
btnInnerRefine.addEventListener("click",()=>{
if (this.game&&this.game.apertureFX) {
this.game.apertureFX.openInnerApertureRefinement(gu.instanceId,this.selectedSuppressorGuId);
}
});
}
const btnRefineWild=document.getElementById("btn-refine-wild-gu");
if (btnRefineWild) {
btnRefineWild.addEventListener("click",()=>{
const res=this.guSystem.refineWildGuStep(gu.instanceId,this.player,this.aperture,this.selectedSuppressorGuId);
this.addLog(res.message,res.success?(res.completed?"loot" :"cultivation") :"warning");
if (res.completed&&this.game) this.game.autoSaveNow("refine_wild_gu");
this.renderGuStorageTab();
this.updateHubTopbar();
});
}
const btnVital=document.getElementById("btn-set-vital-gu");
if (btnVital) {
btnVital.addEventListener("click",()=>{
const res=this.guSystem.setVitalGu(gu.instanceId,this.aperture);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderGuStorageTab();
this.updateHubTopbar();
});
}
const btnFeed=document.getElementById("btn-feed-gu");
if (btnFeed) {
btnFeed.addEventListener("click",()=>{
const res=this.guSystem.feedGu(gu.instanceId,this.player);
this.addLog(res.message,res.success?"system" :"warning");
this.renderGuStorageTab();
this.updateHubTopbar();
});
}
const btnSendRefine=document.getElementById("btn-send-gu-to-refine");
if (btnSendRefine) {
btnSendRefine.addEventListener("click",()=>{
if (!this.refinementSlots.includes(gu.instanceId)) {
const emptyIdx=this.refinementSlots.findIndex(s=>s===null);
if (emptyIdx!== -1) this.refinementSlots[emptyIdx]=gu.instanceId;
}
this.switchHubTab("tab-refinement");
});
}
const btnSalvageThis=document.getElementById("btn-salvage-this-gu");
if (btnSalvageThis) {
btnSalvageThis.addEventListener("click",()=>{
if (!this.guSystem||typeof this.guSystem.salvageGu!=="function") return;
if (!confirm(`Xác nhận phân giải 【${fullGuName}】 lấy Nguyên Thạch & Cổ Tài?`)) return;
const res=this.guSystem.salvageGu(gu.instanceId,this.player);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success) {
this.selectedGuInstanceId=null;
if (this.game) this.game.autoSaveNow("salvage_gu");
}
this.renderGuStorageTab();
this.updateHubTopbar();
});
}
d.guDetailBox.querySelectorAll(".btn-equip-gu-slot").forEach(btn=>{
btn.addEventListener("click",()=>{
const slotIdx=parseInt(btn.getAttribute("data-slot"),10);
const res=this.guSystem.equipGuToSlot(gu.instanceId,slotIdx);
this.addLog(res.message,res.success?"system" :"warning");
this.renderGuStorageTab();
});
});
}
class GuUI {
constructor(uiManager) {this.ui=uiManager||null;}
render() {if (this.ui) _renderGuStorage.call(this.ui);}
}
global.GuUI=GuUI;
})(window);
