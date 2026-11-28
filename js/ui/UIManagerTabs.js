(function (global) {
"use strict";
const {escapeHtml,_clearEl,_setEmptyHint,_setSubSpan}=global.UIManager._helpers;
const {CARAVAN_SHOP_ITEMS,AUCTION_HOUSE_ITEMS,TREASURE_YELLOW_HEAVEN_ITEMS,CLAN_TREASURY_ITEMS,TRUE_INHERITANCES}=global.VanCoMarketCatalogs;
Object.assign(global.UIManager.prototype, {
renderGuStorageTab() {if (this.guUI) this.guUI.render();},
renderRefinementTab() {
if (!this.guSystem|| !this.player) return;
const d=this.dom;
const G=global.GuSystem;
if (typeof this.guSystem.getRefinementMasteryInfo==="function") {
const m=this.guSystem.getRefinementMasteryInfo();
if (d.refineMasteryTitle) {
d.refineMasteryTitle.textContent=`🔥 Cấp ${m.level}: ${m.title} (+${Math.round(m.masteryBonus*100)}% Tỷ lệ thành công)`;
}
if (d.refineMasteryDesc) {
const nextStr=m.nextMinExp?`${m.exp} / ${m.nextMinExp} EXP` :`${m.exp} EXP (Đỉnh Phong)`;
const isImmMastery=this.aperture&&this.aperture.isImmortal;
const daoText=isImmMastery
?`Đạo Ngân Luyện Đạo: ${Math.floor(this.player.getEffectiveDaoMarks("Luyện Đạo"))}`
:`Cảnh giới Luyện Đạo: ${this.player.pathAttainment["Luyện Đạo"]||"Phàm Cấp"} (Phàm nhân chưa có Đạo Ngân)`;
d.refineMasteryDesc.textContent=`Kinh nghiệm Luyện Lô: ${nextStr} | ${daoText} | Mỗi lần thất bại cộng +5% Hỏa Hầu (tối đa +25%).`;
}
if (d.refinePityBadge) {
d.refinePityBadge.textContent=`+${Math.round(m.pityBonus*100)}%`;
}
}
const sub=this.currentRefinementSubtab||"furnace";
if (d.refinePanelFurnace) d.refinePanelFurnace.classList.toggle("hidden",sub!=="furnace");
if (d.refinePanelSynthesis) d.refinePanelSynthesis.classList.toggle("hidden",sub!=="synthesis");
if (d.refinePanelSalvage) d.refinePanelSalvage.classList.toggle("hidden",sub!=="salvage");
if (sub==="synthesis") {
this._renderMaterialSynthesisPanel();
return;
}
if (sub==="salvage") {
this._renderSalvageAndWildPanel();
return;
}
const slotEls=[d.refineSlot1,d.refineSlot2,d.refineSlot3];
slotEls.forEach((el,idx)=>{
if (!el) return;
const val=this.refinementSlots[idx];
if (!val) {
el.classList.remove("filled");
el.textContent=idx===2?"Cổ Tài Phụ Trợ (Ô 3)" :`Cổ Trùng ${idx + 1} (Ô ${idx + 1})`;
} else {
el.classList.add("filled");
const gu=this.guSystem.getGuByInstanceId(val);
_clearEl(el);
const box=document.createElement("div");
box.style.display="flex";box.style.flexDirection="column";box.style.alignItems="center";box.style.gap="2px";
if (gu) {
if (global.vanCoGuArt) {
const imgWrap=document.createElement("span");
imgWrap.innerHTML=global.vanCoGuArt.renderImgHtml(gu,32,"gu-slot-art");
box.appendChild(imgWrap);
}
const lbl=document.createElement("span");
lbl.style.fontSize="11px";
lbl.textContent=G.formatGuNameWithRank?G.formatGuNameWithRank(gu) :gu.name;
box.appendChild(lbl);
} else {
const itemMeta=global.PlayerManager.ITEM_DATABASE[val];
const labelText=itemMeta?`${itemMeta.icon} ${itemMeta.name}` :String(val);
box.appendChild(document.createTextNode(labelText));
}
box.appendChild(document.createElement("br"));
const sm=document.createElement("small");
sm.style.color="#ff9c9c";
sm.textContent="(Nhấn để gỡ)";
box.appendChild(sm);
el.appendChild(box);
}
});
if (d.refineTechniqueSelect) d.refineTechniqueSelect.value=this.refineTechniqueId;
if (d.refineCatalystSelect) d.refineCatalystSelect.value=this.refineCatalystId;
if (d.chkRefineProtectGu) d.chkRefineProtectGu.checked=Boolean(this.refineProtectGu);
const techMap=G.REFINEMENT_TECHNIQUES||{};
const curTech=techMap[this.refineTechniqueId]||techMap.fire_method;
if (d.refineTechniqueDesc&&curTech) {
d.refineTechniqueDesc.textContent=curTech.desc;
}
const opts={
techniqueId:this.refineTechniqueId,
catalystId:this.refineCatalystId,
protectGu:this.refineProtectGu
};
const preview=this.guSystem.previewRefinement(this.refinementSlots,this.player,this.aperture,opts);
if (preview.valid) {
const riskPct=Math.round((preview.breakRisk||0)*100);
const protectStr=preview.protectGu
?`<span style="color:#5cc995">🛡️ Đang Bảo Cổ (0% vỡ Cổ${preview.protectNeedsSoulCrystal?", tốn 1x 🔮 Đãng Hồn Thạch" :""})</span>`
:`<span style="color:#ff9f43">Rủi ro vỡ Cổ phụ nếu trượt: ${riskPct}%</span>`;
d.refinePreview.innerHTML=`
<p>Thành phẩm: <strong class="highlight-gold">${escapeHtml(preview.resultName)}</strong></p>
<p>Tỷ lệ thành công: <strong style="color:#5cc995;font-size:15px;">${Math.round(preview.successChance*100)}%</strong> (Gồm Thủ Pháp, Đạo Ngân, Luyện Cổ Sư & Hỏa Hầu)</p>
<p>Chi phí: <strong>${preview.essenceCost}${preview.resultRank>=6?" Tiên Nguyên" :"% Chân Nguyên"} | 💎 ${preview.stoneCost.toLocaleString("vi-VN")} Nguyên Thạch</strong></p>
<p>${protectStr}</p>
                `;
d.btnExecuteRefine.disabled=false;
} else {
d.refinePreview.innerHTML=`
<p>Trạng thái Đỉnh Lò: <strong>${escapeHtml(preview.reason)}</strong></p>
<p>Mẹo: Đặt <strong>1 Cổ Trùng + Thức ăn của nó</strong> để Thăng Chuyển trực tiếp, hoặc bấm 1 Bí Phương bên phải!</p>
                `;
d.btnExecuteRefine.disabled=true;
}
const remnantCount=this.player.getItemCount("remnant_recipe");
if (d.btnStudyRemnant) {
d.btnStudyRemnant.textContent=`📜 Giải Mã Tàn Phương (Đang có: ${remnantCount})`;
}
if (d.refineQuickPickerGu) {
const refinedList=this.guSystem.getRefinedGuList();
if (refinedList.length===0) {
_setSubSpan(d.refineQuickPickerGu,"Chưa có Cổ Trùng đã luyện hóa.");
} else {
d.refineQuickPickerGu.innerHTML=refinedList.map(g=>{
const inFurnace=this.refinementSlots.includes(g.instanceId);
const label=G.formatGuNameWithRank?G.formatGuNameWithRank(g) :g.name;
const gArt=global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(g,18,"gu-inline-art") :escapeHtml(g.icon);
return `<button class="picker-chip ${inFurnace?"in-furnace" :""}" data-pick-gu="${escapeHtml(g.instanceId)}">${gArt} ${escapeHtml(label)}</button>`;
}).join("");
d.refineQuickPickerGu.querySelectorAll("[data-pick-gu]").forEach(chip=>{
chip.addEventListener("click",()=>{
const instId=chip.getAttribute("data-pick-gu");
const existingIdx=this.refinementSlots.indexOf(instId);
if (existingIdx!== -1) {
this.refinementSlots[existingIdx]=null;
} else if (!this.refinementSlots[0]) {
this.refinementSlots[0]=instId;
} else if (!this.refinementSlots[1]) {
this.refinementSlots[1]=instId;
} else {
this.refinementSlots[1]=instId;
}
this.renderRefinementTab();
});
});
}
}
if (d.refineQuickPickerItems) {
const matItems=(this.player.inventory||[]).filter(slot=>{
const meta=global.PlayerManager.ITEM_DATABASE[slot.id];
return meta&&slot.count>0&&meta.category!=="relic_gu"&&meta.category!=="recipe_scroll"&&meta.category!=="physique_gu"&&meta.category!=="enslave_gu";
});
if (matItems.length===0) {
_setSubSpan(d.refineQuickPickerItems,"Chưa có Cổ Tài trong hành trang.");
} else {
d.refineQuickPickerItems.innerHTML=matItems.map(slot=>{
const meta=global.PlayerManager.ITEM_DATABASE[slot.id];
const inSlot3=this.refinementSlots[2]===slot.id;
return `<button class="picker-chip ${inSlot3?"in-furnace" :""}" data-pick-item="${escapeHtml(slot.id)}">${escapeHtml(meta.icon)} ${escapeHtml(meta.name)} (x${Number(slot.count)||0})</button>`;
}).join("");
d.refineQuickPickerItems.querySelectorAll("[data-pick-item]").forEach(chip=>{
chip.addEventListener("click",()=>{
const itemId=chip.getAttribute("data-pick-item");
this.refinementSlots[2]=(this.refinementSlots[2]===itemId)?null :itemId;
this.renderRefinementTab();
});
});
}
}
let recipes=this.guSystem.getKnownRecipes().map(r=>{
const check=typeof this.guSystem.canCraftRecipe==="function"
?this.guSystem.canCraftRecipe(r,this.player)
:{ready:false,missing:[]};
return {recipe:r,ready:check.ready,missing:check.missing};
});
if (this.currentRecipeFilter==="ready") {
recipes=recipes.filter(x=>x.ready);
} else if (this.currentRecipeFilter==="immortal") {
recipes=recipes.filter(x=>x.recipe.resultRank>=6);
}
recipes.sort((a,b)=>(b.ready?1 :0) - (a.ready?1 :0));
if (recipes.length===0) {
_clearEl(d.knownRecipesList);
const emptyLi=document.createElement("li");
emptyLi.style.cursor="default";
_setSubSpan(emptyLi,"Chưa có Bí Phương nào khớp bộ lọc này.");
d.knownRecipesList.appendChild(emptyLi);
} else {
d.knownRecipesList.innerHTML=recipes.map(({recipe:r,ready,missing})=>`
<li data-recipe-id="${r.id}" style="${ready?"border-color:#3ca67d;background:rgba(20,54,42,0.45);" :""}">
<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
<strong>📜 ${r.resultName}</strong>
<span class="badge" style="color:${ready?"#7ef7c4" :"#ff9f43"}">${ready?"✅ Đủ Nguyên Liệu" :"Thiếu Đồ"}</span>
</div>
<span class="sub-text">Nguyên liệu: ${r.ingredientsDesc} | Gốc: ${Math.round(r.baseChance*100)}%</span>
                        ${!ready&&missing.length?`<br><span style="font-size:11px;color:#ff9c9c;">Thiếu: ${missing.join(", ")}</span>` :""}
</li>
                `).join("");
d.knownRecipesList.querySelectorAll("li[data-recipe-id]").forEach(li=>{
li.addEventListener("click",()=>{
const recipeId=li.getAttribute("data-recipe-id");
const fillRes=this.guSystem.autoFillRecipeSlots(recipeId,this.player);
if (fillRes.success) {
this.refinementSlots=fillRes.slots;
this.addLog(fillRes.message,"system");
this.renderRefinementTab();
} else {
this.addLog(fillRes.message,"warning");
}
});
});
}
},
_renderMaterialSynthesisPanel() {
const d=this.dom;
if (!d.materialSynthesisGrid|| !this.player|| !global.GuSystem) return;
const list=global.GuSystem.MATERIAL_SYNTHESIS_RECIPES||[];
d.materialSynthesisGrid.innerHTML=list.map(syn=>{
let canMake=this.player.primevalStones>=syn.stoneCost;
const matsHtml=syn.materials.map(m=>{
const meta=global.PlayerManager.ITEM_DATABASE[m.itemId]||{name:m.itemId,icon:"📦"};
const owned=this.player.getItemCount(m.itemId);
if (owned<m.count) canMake=false;
return `<span style="color:${owned>=m.count?"#7ef7c4" :"#ff9c9c"}">${meta.icon} ${meta.name}: ${owned}/${m.count}</span>`;
}).join("<br>");
return `
<div class="card-box" style="justify-content:space-between;gap:10px;${canMake?"border-color:#3ca67d;" :""}">
<div>
<strong style="color:#e2bf75;font-size:14.5px;">${syn.icon} ${syn.name}</strong>
<p class="sub-text mt-5">${syn.desc}</p>
<div class="recipe-preview-box mt-10" style="margin-bottom:0;font-size:12px;">
                                ${matsHtml}
<span style="color:${this.player.primevalStones>=syn.stoneCost?"#ffd700" :"#ff9c9c"}">💎 Nguyên Thạch: ${this.player.primevalStones}/${syn.stoneCost}</span>
</div>
</div>
<button class="btn-primary btn-do-synthesize" data-syn-id="${syn.id}" ${canMake?"" :"disabled"} style="width:100%;">
                            ${canMake?"⚗️ Tinh Luyện Ngay" :"Thiếu Nguyên Liệu"}
</button>
</div>
                `;
}).join("");
d.materialSynthesisGrid.querySelectorAll(".btn-do-synthesize").forEach(btn=>{
btn.addEventListener("click",()=>{
const synId=btn.getAttribute("data-syn-id");
const res=this.guSystem.synthesizeMaterial(synId,this.player);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("synthesize");
this.renderRefinementTab();
this.updateHubTopbar();
});
});
},
_renderSalvageAndWildPanel() {
const d=this.dom;
const G=global.GuSystem;
if (!this.guSystem|| !this.player) return;
if (d.salvageGuList) {
const salvageable=this.guSystem.ownedGuList
.filter(g=> !g.isVital)
.sort((a,b)=>a.rank - b.rank);
if (salvageable.length===0) {
_setEmptyHint(d.salvageGuList,"Không có Cổ Trùng phụ nào có thể phân giải.");
} else {
d.salvageGuList.innerHTML=salvageable.map(g=>{
const label=G.formatGuNameWithRank?G.formatGuNameWithRank(g) :g.name;
const eqTag=g.equippedSlot!==null?`<span class="badge" style="color:#ffd700">Đang ở Ô ${g.equippedSlot + 1}</span>` :"";
return `
<div class="list-card" style="flex-direction:row;justify-content:space-between;align-items:center;gap:8px;">
<div>
<strong>${escapeHtml(g.icon)} ${escapeHtml(label)}</strong> ${eqTag}
<div class="sub-text">${escapeHtml(g.path)} | Uy lực: ${Number(g.power)||0} | ${g.isRefined?"Đã luyện hóa" :"Hoang dã"}</div>
</div>
<button class="btn-mini btn-danger btn-salvage-one" data-gu-inst="${escapeHtml(g.instanceId)}">♻️ Phân Giải</button>
</div>
                        `;
}).join("");
d.salvageGuList.querySelectorAll(".btn-salvage-one").forEach(btn=>{
btn.addEventListener("click",()=>{
const instId=btn.getAttribute("data-gu-inst");
const res=this.guSystem.salvageGu(instId,this.player);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("salvage_one");
this.renderRefinementTab();
this.updateHubTopbar();
});
});
}
}
if (d.wildGuRefineList) {
const wilds=this.guSystem.ownedGuList.filter(g=> !g.isRefined);
if (wilds.length===0) {
_setEmptyHint(d.wildGuRefineList,"Toàn bộ Cổ Trùng trong kho đều đã được luyện hóa 100%!");
} else {
d.wildGuRefineList.innerHTML=wilds.map(g=>{
const label=G.formatGuNameWithRank?G.formatGuNameWithRank(g) :g.name;
const wInfo=this.guSystem.getWildGuRefinementInfo(g.instanceId,this.player,this.aperture,"auto");
const supText=wInfo.suppressor
?`<span style="color:#7ef7c4">🐉 Tự áp chế bằng ${G.formatGuNameWithRank(wInfo.suppressor)} (+${wInfo.rankDiff}C)</span>`
:`<span class="sub-text">Không có Cổ chuyển cao hơn áp chế</span>`;
const btnLabel=wInfo.instantRefine
?`⚡ Áp Chế 100% (-${wInfo.stoneCost}💎, -${wInfo.mentalCost}🧠)`
:`🔥 Luyện Hóa (-${wInfo.stoneCost}💎, -${wInfo.mentalCost}🧠)`;
return `
<div class="list-card" style="gap:6px;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
<div>
<strong>${g.icon} ${label}</strong>
<div class="sub-text">Tiến độ: <strong style="color:#ffd700">${g.refinementProgress||0}%</strong> | Tỷ lệ: <strong style="color:#5cc995">${Math.round(wInfo.successChance*100)}%</strong></div>
<div style="font-size:11.5px;">${supText}</div>
</div>
<button class="btn-mini btn-primary btn-refine-wild-quick" data-gu-inst="${g.instanceId}">${btnLabel}</button>
</div>
</div>
                        `;
}).join("");
d.wildGuRefineList.querySelectorAll(".btn-refine-wild-quick").forEach(btn=>{
btn.addEventListener("click",()=>{
const instId=btn.getAttribute("data-gu-inst");
const res=this.guSystem.refineWildGuStep(instId,this.player,this.aperture,"auto");
this.addLog(res.message,res.success?(res.completed?"loot" :"cultivation") :"warning");
if (res.completed&&this.game) this.game.autoSaveNow("refine_wild_gu");
this.renderRefinementTab();
this.updateHubTopbar();
});
});
}
}
},
renderKillerMovesTab() {
if (!this.guSystem) return;
const d=this.dom;
const G=global.GuSystem;
const refinedGu=this.guSystem.getRefinedGuList();
const prevCore=d.killerCoreSelect.value;
const prevSub1=d.killerSub1Select.value;
const prevSub2=d.killerSub2Select.value;
const fillGuSelect=(selectEl)=>{
if (!selectEl) return;
_clearEl(selectEl);
const defOpt=document.createElement("option");
defOpt.value="";
defOpt.textContent="-- Chọn Cổ Trùng Đã Luyện Hóa --";
selectEl.appendChild(defOpt);
for (const gu of refinedGu) {
const opt=document.createElement("option");
opt.value=gu.id;
const fullName=G.formatGuNameWithRank?G.formatGuNameWithRank(gu) :`${gu.name} ${gu.rank} Chuyển`;
opt.textContent=`${gu.icon} ${fullName} (Uy lực ${gu.power} - ${gu.path})`;
selectEl.appendChild(opt);
}
};
fillGuSelect(d.killerCoreSelect);
fillGuSelect(d.killerSub1Select);
fillGuSelect(d.killerSub2Select);
if (prevCore) d.killerCoreSelect.value=prevCore;
if (prevSub1) d.killerSub1Select.value=prevSub1;
if (prevSub2) d.killerSub2Select.value=prevSub2;
this._updateKillerMoveDeductionPreview();
const savedMoves=this.guSystem.getSavedKillerMoves();
const keys=["Z","X","C","V"];
if (savedMoves.length===0) {
_setEmptyHint(d.savedKillerList,"Chưa nắm giữ Sát Chiêu nào. Hãy chọn Cổ Cốt Lõi và Cổ Phụ Trợ bên trái để thôi diễn.");
} else {
d.savedKillerList.innerHTML=savedMoves.map(move=>{
const mRank=move.moveRank||1;
const rankName=G.getRankName?G.getRankName(mRank) :`${mRank} Chuyển`;
const daoAmp=this.player?this.player.calculateDaoAmplification(move.path,[]) :{multiplier:1.0};
const realPower=Math.round(move.power*daoAmp.multiplier);
const compNames=(move.requiredGuIds||[]).map(id=>{
const inst=this.guSystem._getHighestOwnedGuOrTemplate?this.guSystem._getHighestOwnedGuOrTemplate(id) :null;
return inst&&G.formatGuNameWithRank?G.formatGuNameWithRank(inst) :id;
}).join(" + ");
return `
<div class="list-card">
<div class="list-card-header">
<span>${escapeHtml(move.icon||"⚡")} ${escapeHtml(move.name)}</span>
<span class="badge">${escapeHtml(rankName)} — ${escapeHtml(move.path)}</span>
</div>
<div style="font-size:12px;color:#5cc995;margin-top:2px;">
                                ⚔️ Uy lực gốc Cổ: <strong>${Number(move.power)||0}</strong> | Khuếch đại Đạo Ngân (x${daoAmp.multiplier}): <strong class="highlight-gold">${realPower}</strong> | Tiêu hao: <strong>${mRank>=6?move.essenceCost + " Tiên Nguyên" :move.essenceCost + "%"}</strong>
</div>
<div style="font-size:11.5px;color:#e6dfd5;">
                                🧩 Cổ thành phần: ${escapeHtml(compNames)}
</div>
<p class="sub-text">${escapeHtml(move.description)}</p>
<div class="action-row mt-5">
                                ${keys.map((k,kIdx)=>{
const isBound=this.guSystem.equippedKillerSlots[kIdx]===move.id;
return `
<button class="btn-mini btn-bind-killer ${isBound?"highlight-gold" :""}" data-move-id="${escapeHtml(move.id)}" data-kslot="${kIdx}">
                                            ${isBound?`✓ Đang ở Phím ${k}` :`Gán Phím ${k}`}
</button>
                                    `;
}).join("")}
</div>
</div>
                    `;
}).join("");
d.savedKillerList.querySelectorAll(".btn-bind-killer").forEach(btn=>{
btn.addEventListener("click",()=>{
const moveId=btn.getAttribute("data-move-id");
const kSlot=parseInt(btn.getAttribute("data-kslot"),10);
const res=this.guSystem.equipKillerMoveToSlot(moveId,kSlot);
this.addLog(res.message,res.success?"system" :"warning");
this.renderKillerMovesTab();
});
});
}
},
_updateKillerMoveDeductionPreview() {
if (!this.guSystem) return;
const d=this.dom;
const preview=this.guSystem.previewKillerMoveDeduction(
d.killerCoreSelect.value,
d.killerSub1Select.value,
d.killerSub2Select.value,
this.player
);
d.deduceName.textContent=preview.name||"---";
d.deduceType.textContent=preview.typeLabel||"---";
d.deduceCost.textContent=preview.essenceCost
?(preview.isImmortal?`${preview.essenceCost} viên Tiên Nguyên` :`${preview.essenceCost}% Chân Nguyên`)
:"0";
d.deduceDesc.textContent=preview.description||"Hãy chọn ít nhất 1 Cổ Cốt Lõi và 1 Cổ Phụ Trợ.";
},
renderDaoAttainmentTab() {
if (!this.player) return;
const d=this.dom;
const pl=this.player;
const paths=global.PlayerManager.DAO_PATHS;
const isImmortal=Boolean(this.aperture&&this.aperture.isImmortal);
if (d.daoMarksRealmBanner) {
if (!isImmortal) {
d.daoMarksRealmBanner.style.borderColor="#ff9f43";
d.daoMarksRealmBanner.innerHTML=`
<p><strong style="color:#ffd700;">🔒 PHÀM NHÂN CHƯA CÓ ĐẠO NGÂN (Hiện tại: ${this.aperture?this.aperture.getRealmDisplayName() :"Phàm Cảnh"})</strong></p>
<p class="sub-text">Theo đúng nguyên tác Cổ Chân Nhân, Đạo Ngân chỉ tồn tại trên thân thể <strong>Cổ Tiên (Lục Chuyển trở lên)</strong>. Ở Phàm Cảnh, ngươi vẫn có thể thăm dò Mộng Cảnh để nâng cao <strong>Cảnh Giới Lĩnh Ngộ Lưu Phái</strong> (giảm xung đột Sát Chiêu) và tích lũy <strong>Nhân Khí</strong> chuẩn bị Thăng Tiên!</p>
                    `;
} else {
d.daoMarksRealmBanner.style.borderColor="#3ca67d";
d.daoMarksRealmBanner.innerHTML=`
<p><strong style="color:#7ef7c4;">✨ ĐẠO NGÂN CỔ TIÊN ĐÃ KHAI MỞ (${this.aperture.getRealmDisplayName()})</strong></p>
<p class="sub-text">Đạo Ngân khắc ấn trên Tiên Thể trực tiếp khuếch đại uy lực Cổ Trùng, Sát Chiêu và chỉ số chiến đấu. Tích lũy <strong>300.000 Đạo Ngân</strong> lưu phái chính tại Á Tiên Tôn là điều kiện cốt lõi để Chứng Đạo Thành Tôn!</p>
                    `;
}
}
const daoLordPath=(isImmortal&&this.aperture.rank>=9)?this.aperture.daoLordPath :null;
d.daoMarksList.innerHTML=Object.keys(paths).map(pathName=>{
const meta=paths[pathName];
const marks=isImmortal?Math.floor(pl.getEffectiveDaoMarks(pathName)) :0;
const attain=pl.pathAttainment[pathName]||"Phàm Cấp";
const attainExp=Math.floor((pl.pathAttainmentExp&&pl.pathAttainmentExp[pathName])||0);
const amp=pl.calculateDaoAmplification(pathName,[]);
const isMain=pathName===pl.mainPath;
const isLord=daoLordPath===pathName;
const tag=isLord?" 👑 ĐẠO CHỦ" :(isMain?" ★ Chính" :"");
const mainGoalNote=isMain&&isImmortal&&this.aperture.rank<9?` / 300.000` :"";
const rightInfo=isImmortal
?`${marks.toLocaleString("vi-VN")}${mainGoalNote} ĐN (x${amp.multiplier} | ${attain})`
:`0 ĐN (Phàm nhân) | ${attain} (${attainExp}đ)`;
const pfObj=(global.PlayerManager&&global.PlayerManager.DAO_PATH_PASSIVES&&global.PlayerManager.DAO_PATH_PASSIVES[pathName])||null;
const pfLabel=pfObj?`<small class="sub-text" style="display:block;font-size:10.5px;color:#8fa69d;">${pfObj.label}</small>` :"";
return `
<div class="dao-mark-card" style="${isLord?"border-color:#ffd700;background:rgba(55,40,12,0.5);" :(isMain?"border-color:#67b7d1;" :"")}" title="${meta.desc}">
<div><span>${meta.icon} <strong>${pathName}${tag}</strong></span>${pfLabel}</div>
<span style="color:${isImmortal?meta.color :"#b3aa9c"}">${rightInfo}</span>
</div>
                `;
}).join("");
const dreams=global.PlayerManager.DREAM_REALMS||[];
const dreamData=global.VanCoDreamData;
d.dreamRealmList.innerHTML=dreams.map(dr=>{
const cleared=(pl.dreamClears&&pl.dreamClears[dr.id])||0;
const tCfg=dreamData?dreamData.getDreamTrialConfig(dr.id) :null;
const modeBadge=tCfg
?`<span class="badge" style="border-color:${tCfg.badgeColor};color:${tCfg.badgeColor};font-size:10.5px;">${tCfg.modeLabel}</span>`
:"";
const rewardLabel=isImmortal
?`+${dr.daoMarksReward.toLocaleString("vi-VN")} ĐN & Lĩnh Ngộ (${dr.useMainPath?pl.mainPath :dr.paths.join(", ")}) & +${dr.humanQiReward} Nhân Khí`
:`+${dr.daoMarksReward} Lĩnh Ngộ (${dr.useMainPath?pl.mainPath :dr.paths.join(", ")}) & +${dr.humanQiReward} Nhân Khí`;
const quickBtn=cleared>0
?`<button class="btn-mini btn-secondary btn-quick-dream" data-dream-id="${dr.id}" title="Đã vượt qua: cho phép quét nhanh không cần chơi lại">⚡ Quét Nhanh</button>`
:"";
return `
<div class="list-card" style="border-color:${tCfg?tCfg.badgeColor :"#3a3124"};">
<div class="list-card-header" style="flex-wrap:wrap;gap:6px;">
<span>🌙 <strong>${dr.name}</strong> [YC: ${dr.reqRank} Chuyển] ${modeBadge}</span>
<span class="sub-text">Đã phá mộng: <strong style="color:#ffd700;">${cleared}</strong> lần</span>
</div>
<p class="sub-text">${dr.desc}</p>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;gap:8px;flex-wrap:wrap;">
<span style="font-size:12px;color:#5cc995;">Thưởng gốc (tới x150% khi Hạng SS): ${rewardLabel}</span>
<div style="display:flex;gap:6px;align-items:center;">
${quickBtn}
<button class="btn-mini btn-primary btn-play-dream" data-dream-id="${dr.id}">
🌙 Nhập Mộng Chơi (-${dr.mentalCost}🧠)
</button>
</div>
</div>
</div>
                `;
}).join("");
d.dreamRealmList.querySelectorAll(".btn-play-dream").forEach(btn=>{
btn.addEventListener("click",()=>{
const dreamId=btn.getAttribute("data-dream-id");
if (this.game&&this.game.dreamRealmEngine) {
const res=this.game.dreamRealmEngine.open(dreamId);
if (!res.success) {
this.addLog(res.message,"warning");
} else {
this.addLog(res.message,"cultivation");
}
} else {
const res=this.player.exploreDreamRealm(dreamId);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderDaoAttainmentTab();
this.updateHubTopbar();
}
});
});
d.dreamRealmList.querySelectorAll(".btn-quick-dream").forEach(btn=>{
btn.addEventListener("click",()=>{
const dreamId=btn.getAttribute("data-dream-id");
const res=this.player.exploreDreamRealm(dreamId);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderDaoAttainmentTab();
this.updateHubTopbar();
if (this.game) this.game.autoSaveNow("dream_quick");
});
});
},
renderInventoryTab() {if (this.inventoryUI) this.inventoryUI.render();},
renderMarketTab() {
if (!this.player|| !this.guSystem|| !this.game) return;
const d=this.dom;
const passiveDisc=(this.game.questManager&&typeof this.game.questManager.getPassiveBonuses==="function")
?(this.game.questManager.getPassiveBonuses().shopDiscount||0)
:0;
const discount=Math.min(0.45,(this.player.tradeDiscount||0) + passiveDisc);
this.game.ensureMarketRotation(false);
this.updateMarketCountdownText();
const marketKey=this.currentMarketTab||"caravan";
if (marketKey==="live_auction"&&this.battleUI) {
this.battleUI.renderLiveAuctionPanel(d.marketContent);
return;
}
if (marketKey==="stone_gambling"&&this.game&&this.game.stoneGambling) {
this.game.stoneGambling.renderPanel(d.marketContent);
return;
}
let catalog=CARAVAN_SHOP_ITEMS;
if (marketKey==="auction") catalog=AUCTION_HOUSE_ITEMS;
else if (marketKey==="treasure_heaven") catalog=TREASURE_YELLOW_HEAVEN_ITEMS;
const enriched=catalog.map((entry,idx)=>{
const stockKey=entry.stockKey||`${entry.type}_${entry.id}_${entry.guRank||0}_${idx}`;
const stock=this.game.getMarketItemStock(marketKey,stockKey);
const isUniqueImmortalOwned=
entry.type==="gu"&&
(entry.guRank||1)>=6&&
typeof this.guSystem.hasImmortalGu==="function"&&
this.guSystem.hasImmortalGu(entry.id);
return {entry,idx,stockKey,stock,isUniqueImmortalOwned};
});
enriched.sort((a,b)=>{
const aAvail=(a.stock>0&& !a.isUniqueImmortalOwned)?1 :0;
const bAvail=(b.stock>0&& !b.isUniqueImmortalOwned)?1 :0;
if (aAvail!==bAvail) return bAvail - aAvail;
const aEx=(a.entry.type==="exchange_immortal"||a.entry.type==="exchange_stones")?1 :0;
const bEx=(b.entry.type==="exchange_immortal"||b.entry.type==="exchange_stones")?1 :0;
if (aAvail===1&&aEx!==bEx) return bEx - aEx;
return a.idx - b.idx;
});
const displayedMarket=this.marketInStockOnly
?enriched.filter(x=>x.entry.unlimited||(x.stock>0&& !x.isUniqueImmortalOwned))
:enriched;
d.marketContent.innerHTML=displayedMarket.length===0
?`<p class="empty-hint" style="grid-column:1/-1;">Đợt hàng này chưa có mặt hàng nào khả dụng. Hãy chờ đồng hồ đếm ngược làm mới!</p>`
:displayedMarket.map(({entry,idx,stockKey,stock,isUniqueImmortalOwned})=>{
const isImmortalCurr=entry.currency==="immortal";
const finalPrice=isImmortalCurr
?entry.price
:Math.max(1,Math.round(entry.price*(1 - discount)));
const priceStr=finalPrice.toLocaleString("vi-VN");
const currencyLabel=isImmortalCurr?`🌟 ${priceStr} Tiên Thạch` :`💎 ${priceStr} Nguyên Thạch`;
const lightBadge=entry.light?`<span class="badge highlight-gold">${entry.light}</span>` :"";
const chancePct=entry.spawnChance!==undefined
?(entry.spawnChance*100<1?(entry.spawnChance*100).toFixed(1) :Math.round(entry.spawnChance*100))
:50;
const isUnlimited=Boolean(entry.unlimited)||stock>=9999;
const inStock=isUnlimited||stock>0;
const isExchangeLimited=entry.type==="exchange_stones";
const stockBadge=isUnlimited
?`<span style="color:#5cc995">♾️ Luôn Mở</span>`
:(inStock
?(isExchangeLimited
?`<span style="color:#5cc995">📦 Giới hạn còn: <strong>${stock}/${entry.maxStock||stock}</strong> lượt</span>`
:`<span style="color:#5cc995">📦 Đợt này còn: <strong>${stock}</strong></span>`)
:`<span style="color:#ff8a8a">⏳ ${isExchangeLimited?"Hết lượt đổi đợt này" :"Chưa có hàng đợt này"}</span>`);
const rateBadge=`<span class="sub-text">Tỷ lệ xuất hiện: <strong>${chancePct}%</strong>/đợt</span>`;
let btnHtml="";
if (isUniqueImmortalOwned) {
btnHtml=`<button class="btn-secondary" disabled style="width:100%;">🔒 Đã Sở Hữu (Tiên Cổ Là Duy Nhất)</button>`;
} else if (!inStock) {
btnHtml=`<button class="btn-secondary" disabled style="width:100%;">⏳ Chưa Có Hàng — Chờ Đợt Sau (${currencyLabel})</button>`;
} else {
const canBuy5=entry.type==="item"&& !isImmortalCurr&&(isUnlimited||stock>=5);
if (canBuy5) {
const price5Str=(finalPrice*5).toLocaleString("vi-VN");
btnHtml=`<div class="action-grid-2">
<button class="btn-primary btn-market-buy" data-idx="${idx}" data-stock-key="${stockKey}" data-buy-qty="1">Mua 1 (${currencyLabel})</button>
<button class="btn-accent btn-market-buy" data-idx="${idx}" data-stock-key="${stockKey}" data-buy-qty="5">Mua x5 (💎 ${price5Str})</button>
</div>`;
} else {
const actionVerb=(entry.type==="exchange_immortal"||entry.type==="exchange_stones")?"Đổi Ngay" :"Mua Ngay";
btnHtml=`<button class="btn-primary btn-market-buy" data-idx="${idx}" data-stock-key="${stockKey}" data-buy-qty="1" style="width:100%;">${actionVerb} (${currencyLabel})</button>`;
}
}
const extraCardClass=(!inStock&& !isUniqueImmortalOwned)?"market-card-out-of-stock" :"";
const ownedStyle=isUniqueImmortalOwned?"opacity:0.72;border-color:#3ca67d;" :"";
return `
<div class="card-box ${extraCardClass}" style="justify-content:space-between;gap:10px;${ownedStyle}">
<div>
<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:6px;">
<strong style="color:#e2bf75;font-size:14.5px;display:inline-flex;align-items:center;gap:7px;">${(entry.type==="gu"&&global.vanCoGuArt)?global.vanCoGuArt.renderImgHtml(entry.id,30,"gu-inline-art",entry.guRank||1) :entry.icon} <span>${entry.name}</span></strong>
                                ${lightBadge}
</div>
<p class="sub-text mt-5">${entry.desc}</p>
<div class="market-stock-row">
                                ${stockBadge}
                                ${rateBadge}
</div>
</div>
                        ${btnHtml}
</div>
                `;
}).join("");
d.marketContent.querySelectorAll(".btn-market-buy").forEach(btn=>{
btn.addEventListener("click",()=>{
const idx=parseInt(btn.getAttribute("data-idx"),10);
const stockKey=btn.getAttribute("data-stock-key");
const buyQty=Math.max(1,parseInt(btn.getAttribute("data-buy-qty")||"1",10));
const entry=catalog[idx];
if (!entry) return;
if (
entry.type==="gu"&&
(entry.guRank||1)>=6&&
typeof this.guSystem.hasImmortalGu==="function"&&
this.guSystem.hasImmortalGu(entry.id)
) {
this.addLog(`🔒 Tiên Cổ là duy nhất trong thiên địa! Ngươi đã sở hữu 【${entry.name}】, không thể mua thêm con thứ hai.`,"warning");
this.renderMarketTab();
return;
}
const curStock=this.game.getMarketItemStock(marketKey,stockKey);
if (!entry.unlimited&&curStock<buyQty) {
this.addLog(`⏳ 【${entry.name}】 hiện không đủ tồn kho trong đợt này (Còn: ${curStock})! Hãy đợi đợt hàng mới sau 5 phút.`,"warning");
this.renderMarketTab();
return;
}
const isImmortalCurr=entry.currency==="immortal";
const unitPrice=isImmortalCurr
?entry.price
:Math.max(1,Math.round(entry.price*(1 - discount)));
const finalPrice=unitPrice*buyQty;
if (isImmortalCurr) {
if (this.player.immortalStones<finalPrice) {
this.addLog(`Không đủ Tiên Nguyên Thạch (Cần 🌟 ${finalPrice.toLocaleString("vi-VN")})! Hãy cày Bí Cảnh Tài Nguyên Tiên Cấp.`,"warning");
return;
}
this.player.removeItem("immortal_stone",finalPrice);
} else {
if (this.player.primevalStones<finalPrice) {
this.addLog(`Không đủ Nguyên Thạch (Cần 💎 ${finalPrice.toLocaleString("vi-VN")})!`,"warning");
return;
}
this.player.primevalStones -=finalPrice;
}
if (!entry.unlimited) {
this.game.consumeMarketItemStock(marketKey,stockKey,buyQty);
}
if (entry.type==="exchange_immortal") {
this.player.addItem("immortal_stone",1);
this.addLog(`🌟 Đã tụ hợp ${finalPrice.toLocaleString("vi-VN")} Nguyên Thạch đổi thành công 1 viên Tiên Nguyên Thạch tại Bảo Hoàng Thiên!`,"loot");
} else if (entry.type==="exchange_stones") {
const stonesGain=(entry.stoneReward||3000)*buyQty;
this.player.primevalStones +=stonesGain;
this.addLog(`💎 Đã quy đổi ${finalPrice.toLocaleString("vi-VN")} Tiên Nguyên Thạch nhận +${stonesGain.toLocaleString("vi-VN")} Nguyên Thạch (Còn ${this.game.getMarketItemStock(marketKey,stockKey)} lượt trong đợt này)!`,"loot");
} else if (entry.type==="gu") {
const newGu=this.guSystem.addGuToStorage(entry.id,{
rank:entry.guRank||1,
isRefined:false,
refinementProgress:0,
isVital:false
});
if (!newGu) {
this.addLog(`🔒 Tiên Cổ là duy nhất! Không thể sở hữu 2 con cùng loại.`,"warning");
} else {
const fullGuName=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(newGu)
:newGu.name;
this.addLog(`⚖️ Đã mua 【${fullGuName}】 (Chưa Luyện Hóa)! Hãy vào Kho Cổ dùng Nguyên Thạch & Tinh Thần để Luyện Hóa.`,"loot");
}
} else {
const qty=(entry.count||1)*buyQty;
this.player.addItem(entry.id,qty);
this.addLog(`⚖️ Đã mua ${qty}x [${entry.name}] thành công.`,"loot");
}
if (this.game) this.game.autoSaveNow("market_buy");
this.updateHubTopbar();
this.renderMarketTab();
});
});
},
renderFactionTab() {
if (!this.player|| !this.game) return;
const d=this.dom;
const quests=(this.enemies&&this.enemies.getActiveQuests)?this.enemies.getActiveQuests() :[];
d.questList.innerHTML=quests.map(q=>`
<div class="list-card">
<div class="list-card-header">
<span>📜 ${escapeHtml(q.title)}</span>
<span>${q.completed?"✅ Đã hoàn thành" :`${Number(q.progress)||0}/${Number(q.target)||1}`}</span>
</div>
<p class="sub-text">${escapeHtml(q.description)}</p>
<p style="font-size:11.5px;color:#5cc995;">Thưởng: ${escapeHtml(q.rewardText)}</p>
</div>
            `).join("");
this.game.ensureMarketRotation(false);
this.updateMarketCountdownText();
const enrichedTreasury=CLAN_TREASURY_ITEMS.map((item,idx)=>{
const stockKey=item.stockKey||`${item.type}_${item.id}_${item.guRank||0}_${idx}`;
const stock=this.game.getMarketItemStock("clan_treasury",stockKey);
return {item,idx,stockKey,stock};
});
enrichedTreasury.sort((a,b)=>(b.stock>0?1 :0) - (a.stock>0?1 :0)||a.idx - b.idx);
d.clanTreasury.innerHTML=enrichedTreasury.map(({item,idx,stockKey,stock})=>{
const inStock=stock>0;
const pct=Math.round((item.spawnChance||0.3)*100);
return `
<div class="list-card ${inStock?"" :"market-card-out-of-stock"}">
<div class="list-card-header">
<span style="display:inline-flex;align-items:center;gap:6px;">${(item.type==="gu"&&global.vanCoGuArt)?global.vanCoGuArt.renderImgHtml(item.id,26,"gu-inline-art",item.guRank||1) :item.icon} <span>${item.name}</span></span>
<span>🏅 ${item.meritCost.toLocaleString("vi-VN")} Cống Hiến</span>
</div>
<p class="sub-text">${item.desc}</p>
<div class="market-stock-row">
<span>${inStock?`<strong style="color:#5cc995">📦 Còn: ${stock}</strong>` :`<span style="color:#ff8a8a">⏳ Chưa về đợt này</span>`}</span>
<span class="sub-text">Tỷ lệ: ${pct}%/đợt</span>
</div>
<button class="btn-mini btn-redeem-merit mt-5" data-idx="${idx}" data-stock-key="${stockKey}" ${inStock?"" :"disabled"}>
                            ${inStock?"Đổi Vật Phẩm" :"⏳ Chờ Đợt Sau (5 phút)"}
</button>
</div>
                `;
}).join("");
d.clanTreasury.querySelectorAll(".btn-redeem-merit").forEach(btn=>{
btn.addEventListener("click",()=>{
const idx=parseInt(btn.getAttribute("data-idx"),10);
const stockKey=btn.getAttribute("data-stock-key");
const item=CLAN_TREASURY_ITEMS[idx];
if (!item) return;
if (this.game.getMarketItemStock("clan_treasury",stockKey)<=0) {
this.addLog(`⏳ [${item.name}] hiện chưa có hàng trong Gia Tộc Khố Phòng đợt này!`,"warning");
this.renderFactionTab();
return;
}
if ((this.player.meritPoints||0)<item.meritCost) {
this.addLog(`Điểm Cống Hiến không đủ (Cần 🏅 ${item.meritCost.toLocaleString("vi-VN")})! Hãy vượt các Bản Đồ Lịch Luyện để tích lũy.`,"warning");
return;
}
this.player.meritPoints -=item.meritCost;
this.game.consumeMarketItemStock("clan_treasury",stockKey,1);
if (item.type==="gu") {
this.guSystem.addGuToStorage(item.id,{
rank:item.guRank||1,
isRefined:false,
refinementProgress:0
});
this.addLog(`🏛️ Đã dùng ${item.meritCost.toLocaleString("vi-VN")} Điểm Cống Hiến đổi lấy [${item.name}] (Chưa Luyện Hóa — cần Luyện Hóa tại Kho Cổ)!`,"loot");
} else {
this.player.addItem(item.id,1);
this.addLog(`🏛️ Đã dùng ${item.meritCost.toLocaleString("vi-VN")} Điểm Cống Hiến đổi lấy [${item.name}] từ Gia Tộc Khố Phòng!`,"loot");
}
if (this.game) this.game.autoSaveNow("treasury_redeem");
this.updateHubTopbar();
this.renderFactionTab();
});
});
d.inheritanceList.innerHTML=TRUE_INHERITANCES.map(inh=>{
const isClaimed=this.game.isInheritanceClaimed(inh.id);
const rankOk=this.aperture.rank>=inh.reqRank;
const stageOk=this.game.getStageClearCount(inh.reqStageCleared)>0;
const canClaim= !isClaimed&&rankOk&&stageOk;
return `
<div class="list-card">
<div class="list-card-header">
<span>🕯️ ${inh.name}</span>
<span>${isClaimed?"✅ Đã Kế Thừa" :`${inh.reqRank} Chuyển`}</span>
</div>
<p class="sub-text">${inh.desc}</p>
<button class="btn-mini btn-claim-inheritance mt-5" data-id="${inh.id}" ${canClaim?"" :"disabled"}>
                            ${isClaimed?"Đã Nhận Chân Truyền" :(canClaim?"✨ Kế Thừa Chân Truyền Ngay!" :"Chưa Đủ Điều Kiện")}
</button>
</div>
                `;
}).join("");
d.inheritanceList.querySelectorAll(".btn-claim-inheritance").forEach(btn=>{
btn.addEventListener("click",()=>{
const inhId=btn.getAttribute("data-id");
const inh=TRUE_INHERITANCES.find(i=>i.id===inhId);
if (!inh) return;
this.game.claimInheritance(inh);
this.renderFactionTab();
this.updateHubTopbar();
});
});
const bountyHost=document.getElementById("bounty-intrigue-host");
if (bountyHost&&typeof this.renderBountyPanel==="function") {
this.renderBountyPanel(bountyHost);
}
const worldHost=document.getElementById("world-expansion-host");
if (worldHost&&this.battleUI&&typeof this.battleUI.renderWorldExpansionPanel==="function") {
this.battleUI.renderWorldExpansionPanel(worldHost);
}
},
renderSettingsTab() {if (this.saveUI) this.saveUI.render();}
});
})(window);
