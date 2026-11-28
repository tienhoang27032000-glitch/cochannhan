(function (global) {
"use strict";
const {escapeHtml,_clearEl,_setEmptyHint,_setSubSpan}=global.UIManager._helpers;
const {CARAVAN_SHOP_ITEMS,AUCTION_HOUSE_ITEMS,TREASURE_YELLOW_HEAVEN_ITEMS,CLAN_TREASURY_ITEMS,TRUE_INHERITANCES}=global.VanCoMarketCatalogs;
Object.assign(global.UIManager.prototype, {
_bindHubFeatureEvents() {
const d=this.dom;
if (d.mapRankFilter) {
const btns=d.mapRankFilter.querySelectorAll(".tab-btn");
btns.forEach(btn=>{
btn.addEventListener("click",()=>{
btns.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
this.currentMapRankFilter=btn.getAttribute("data-mfilter")||"all";
this.renderMapsTab();
});
});
}
if (d.chkMapsUnlockedOnly) {
d.chkMapsUnlockedOnly.addEventListener("change",()=>{
this.mapsUnlockedOnly=Boolean(d.chkMapsUnlockedOnly.checked);
this.renderMapsTab();
});
}
if (d.btnQuickEnterHighest) {
d.btnQuickEnterHighest.addEventListener("click",()=>{
if (!this.game) return;
const mainStages=this.game.getStageCatalog()
.filter(s=> !s.isSpecialResourceStage&& !s.isStoryStage&&this.game.isStageUnlocked(s.id).unlocked);
if (mainStages.length===0) {
this.addLog("Chưa có Bản Đồ chính nào được mở khóa!","warning");
return;
}
const highest=mainStages[mainStages.length - 1];
this.game.enterStageBattle(highest.id);
});
}
if (d.hubSkinSelect) {
d.hubSkinSelect.addEventListener("change",()=>{
const newSkinKey=d.hubSkinSelect.value;
const skinObj=this.player.setSkin(newSkinKey);
if (skinObj) {
this.addLog(`🎭 Đã đổi diện mạo sang 【${skinObj.name} — ${skinObj.title}】!`,"system");
this.renderApertureTab();
this.updateHubTopbar();
}
});
}
if (d.btnHubCultivate) {
d.btnHubCultivate.addEventListener("click",()=>{
const res=this.aperture.cultivateStep(5.0,1.0);
if (res.success) {
const tag=res.hasLiquorWorm?"🍶 [Tửu Trùng Phụ Trợ] " :"🧘 ";
this.addLog(
`${tag}Vận chuyển Chân Nguyên cọ rửa Khiếu Bích (+${Math.round(res.rawGain||res.gainedXp)} XP), tiến độ đạt ${Math.floor(res.wallProgress)}/${res.maxWallProgress}.`,
"cultivation"
);
} else if (res.reason) {
this.addLog(res.reason,"warning");
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubCultivateX5) {
d.btnHubCultivateX5.addEventListener("click",()=>{
let count=0;
let totalXp=0;
let usedLiquor=false;
let lastRes=null;
for (let i=0;i<5;i++) {
const res=this.aperture.cultivateStep(5.0,1.0);
lastRes=res;
if (!res.success) break;
count +=1;
totalXp +=Math.round(res.rawGain||res.gainedXp||0);
if (res.hasLiquorWorm) usedLiquor=true;
if (res.canBreakthrough) break;
}
if (count>0) {
this.addLog(
`⚡ Đã vận công liên tiếp ${count} lần (+${totalXp} XP${usedLiquor?" — có 🍶 Tửu Trùng phụ trợ" :""})! Khiếu Bích đạt ${Math.floor(this.aperture.wallProgress)}/${this.aperture.maxWallProgress}.`,
"cultivation"
);
} else if (lastRes&&lastRes.reason) {
this.addLog(lastRes.reason,"warning");
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubAutoMeditate) {
d.btnHubAutoMeditate.addEventListener("click",()=>{
if (this.aperture.isImmortal) {
this.addLog("Cổ Tiên tu luyện bằng Độ Tai Kiếp trong Tiên Khiếu!","warning");
return;
}
this.aperture.isMeditating= !this.aperture.isMeditating;
this.addLog(
this.aperture.isMeditating
?"🔁 Đã BẬT Bế Quan Tự Động — Không Khiếu sẽ tự động hồi phục (x1.5) và cọ rửa Khiếu Bích liên tục!"
:"⏹️ Đã TẮT Bế Quan Tự Động.",
"cultivation"
);
this.renderApertureTab();
});
}
if (d.btnHubAbsorbFull) {
d.btnHubAbsorbFull.addEventListener("click",()=>{
if (!this.aperture||typeof this.aperture.absorbPrimevalStonesToFull!=="function") return;
const res=this.aperture.absorbPrimevalStonesToFull(this.player);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubQuickHeal) {
d.btnHubQuickHeal.addEventListener("click",()=>{
if (!this.player) return;
const needHp=this.player.hp<this.player.maxHp - 1;
const needMental=this.player.mental<this.player.maxMental - 1;
if (!needHp&& !needMental) {
this.addLog("💚 Sinh Mệnh và Tinh Thần Lực đều đã ở trạng thái viên mãn!","system");
return;
}
const healOrder=needMental?["spirit_herb","hundred_year_ginseng","soul_crystal","ration_meat"] :["spirit_herb","ration_meat","hundred_year_ginseng"];
let usedAny=false;
for (let tries=0;tries<10;tries++) {
if (this.player.hp>=this.player.maxHp - 1&&this.player.mental>=this.player.maxMental - 1) break;
const pick=healOrder.find(id=>this.player.getItemCount(id)>0);
if (!pick) break;
const r=this.player.useItem(pick);
if (r.success) usedAny=true;
else break;
}
this.addLog(
usedAny
?`💚 Đã dùng thảo dược hồi phục nhanh: HP ${Math.ceil(this.player.hp)}/${this.player.maxHp}, Tinh Thần ${Math.floor(this.player.mental)}/${this.player.maxMental}.`
:"Không còn thảo dược / thực phẩm hồi phục trong hành trang!",
usedAny?"cultivation" :"warning"
);
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubAbsorbStone) {
d.btnHubAbsorbStone.addEventListener("click",()=>{
if (this.player.primevalStones<=0) {
this.addLog("Không còn Nguyên Thạch để hấp thu! Hãy vào Bản Đồ Lịch Luyện cày quái.","warning");
return;
}
const res=this.aperture.absorbPrimevalStone(1);
if (res.success) {
this.player.primevalStones -=1;
this.addLog(res.message,"cultivation");
} else {
this.addLog(res.message,"warning");
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubUseRelic) {
d.btnHubUseRelic.addEventListener("click",()=>{
const res=this.player.useRelicGu(this.aperture);
this.addLog(res.message,res.success?"cultivation" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("use_relic");
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubBreakthrough) {
d.btnHubBreakthrough.addEventListener("click",()=>{
if (!this.aperture.isImmortal&&this.aperture.wallProgress>=this.aperture.maxWallProgress&&this.game&&this.game.apertureFX) {
this.game.apertureFX.openMortalBreakthroughTrial();
return;
}
const res=this.aperture.attemptBreakthrough();
this.addLog(res.message,res.success?"cultivation" :"warning");
if (res.success) {
this.player.recalculateStats();
this.player.hp=this.player.maxHp;
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("reach_rank",String(this.aperture.rank),1);
}
if (this.game) this.game.autoSaveNow("breakthrough");
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnHubAscend) {
d.btnHubAscend.addEventListener("click",()=>{
if (!this.aperture.isImmortal&&this.game&&this.game.apertureFX&&typeof this.game.apertureFX.openImmortalAscensionCinema==="function") {
this.game.apertureFX.openImmortalAscensionCinema();
return;
}
if (!this.aperture.ascensionState.inProgress) {
const startRes=this.aperture.startImmortalAscension({heaven:150,earth:150});
this.addLog(startRes.message,startRes.success?"cultivation" :"warning");
} else {
const stepRes=this.aperture.advanceAscensionStage(this.player);
const logs=stepRes.state&&stepRes.state.logs?stepRes.state.logs :[];
const lastLog=logs[logs.length - 1];
if (lastLog) this.addLog(lastLog,stepRes.failed?"danger" :"cultivation");
if (stepRes.completed) {
this.player.recalculateStats();
this.player.hp=this.player.maxHp;
if (this.game&&this.game.questManager) {
this.game.questManager.recordEvent("reach_rank",String(this.aperture.rank),1);
}
if (this.game) this.game.autoSaveNow("ascend");
}
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnCollectApertureYield) {
d.btnCollectApertureYield.addEventListener("click",()=>{
if (!this.aperture||typeof this.aperture.collectApertureYield!=="function") return;
const res=this.aperture.collectApertureYield(this.player);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("collect_aperture");
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnTriggerTribulation) {
d.btnTriggerTribulation.addEventListener("click",()=>{
if (!this.aperture.isImmortal) {
this.addLog("Phàm nhân chưa có Tiên Khiếu để độ Tai Kiếp!","warning");
return;
}
if (this.battleUI&&typeof this.battleUI.openTribulationTrialModal==="function") {
this.battleUI.openTribulationTrialModal();
return;
}
const res=this.aperture._triggerApertureCalamity(this.player,true);
if (!res|| !res.success) {
this.addLog(res?res.message :"Chưa đủ điều kiện dẫn động Tai Kiếp!","warning");
} else {
this.addLog(res.message,res.didAdvance?"loot" :"cultivation");
if (this.game) this.game.autoSaveNow("tribulation");
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
const bindPhysiqueItemBtn=(btnEl,itemId)=>{
if (!btnEl) return;
btnEl.addEventListener("click",()=>{
if (!this.player) return;
const res=this.player.useItem(itemId);
this.addLog(res.message,res.success?"cultivation" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("use_physique_gu");
this.renderApertureTab();
this.updateHubTopbar();
});
};
bindPhysiqueItemBtn(d.btnUseYinYangGu,"am_duong_chuyen_than_gu");
bindPhysiqueItemBtn(d.btnUseStoneApGu,"thach_khieu_gu");
bindPhysiqueItemBtn(d.btnUseFreezeApGu,"tinh_khieu_dinh_nguyen_gu");
if (d.btnBreakDaoBlockade) {
d.btnBreakDaoBlockade.addEventListener("click",()=>{
if (!this.aperture||typeof this.aperture.attemptBreakDaoBlockade!=="function") return;
const res=this.aperture.attemptBreakDaoBlockade(this.player,this.game);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("break_dao_blockade");
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnAscendVenerable) {
d.btnAscendVenerable.addEventListener("click",()=>{
if (!this.aperture||typeof this.aperture.attemptAscendToVenerable!=="function") return;
const res=this.aperture.attemptAscendToVenerable(this.player,this.game);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) {
if (this.game.questManager) this.game.questManager.recordEvent("reach_rank",String(this.aperture.rank),1);
this.game.autoSaveNow("ascend_venerable");
}
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.btnRefineNaturalDao) {
d.btnRefineNaturalDao.addEventListener("click",()=>{
if (!this.aperture||typeof this.aperture.refineNaturalDaoMarks!=="function") return;
const res=this.aperture.refineNaturalDaoMarks(this.player);
this.addLog(res.message,res.success?"cultivation" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("refine_natural_dao");
this.renderApertureTab();
this.updateHubTopbar();
});
}
if (d.guFilterTabs) {
const tabs=d.guFilterTabs.querySelectorAll(".tab-btn");
tabs.forEach(tab=>{
tab.addEventListener("click",()=>{
tabs.forEach(t=>t.classList.remove("active"));
tab.classList.add("active");
this.currentGuFilter=tab.getAttribute("data-filter")||"all";
this.renderGuStorageTab();
});
});
}
if (d.guSearchInput) {
d.guSearchInput.addEventListener("input",()=>{
this.guSearchQuery=(d.guSearchInput.value||"").trim().toLowerCase();
this.renderGuStorageTab();
});
}
if (d.guSortSelect) {
d.guSortSelect.addEventListener("change",()=>{
this.guSortBy=d.guSortSelect.value||"rank_desc";
this.renderGuStorageTab();
});
}
if (d.btnGuFeedAll) {
d.btnGuFeedAll.addEventListener("click",()=>{
if (!this.guSystem||typeof this.guSystem.feedAllHungryGu!=="function") return;
const res=this.guSystem.feedAllHungryGu(this.player,85);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderGuStorageTab();
this.updateHubTopbar();
});
}
if (d.btnGuAutoEquip) {
d.btnGuAutoEquip.addEventListener("click",()=>{
if (!this.guSystem||typeof this.guSystem.autoEquipBestLoadout!=="function") return;
const res=this.guSystem.autoEquipBestLoadout(this.player);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("auto_equip");
this.renderGuStorageTab();
});
}
if (d.refinementSubtabs) {
const rBtns=d.refinementSubtabs.querySelectorAll(".tab-btn");
rBtns.forEach(btn=>{
btn.addEventListener("click",()=>{
rBtns.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
this.currentRefinementSubtab=btn.getAttribute("data-rsub")||"furnace";
this.renderRefinementTab();
});
});
}
if (d.recipeFilterTabs) {
const rfBtns=d.recipeFilterTabs.querySelectorAll(".tab-btn");
rfBtns.forEach(btn=>{
btn.addEventListener("click",()=>{
rfBtns.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
this.currentRecipeFilter=btn.getAttribute("data-recfilter")||"all";
this.renderRefinementTab();
});
});
}
[d.refineSlot1,d.refineSlot2,d.refineSlot3].forEach((slotEl,idx)=>{
if (!slotEl) return;
slotEl.addEventListener("click",()=>{
if (this.refinementSlots[idx]!==null) {
this.refinementSlots[idx]=null;
this.renderRefinementTab();
}
});
});
if (d.refineTechniqueSelect) {
d.refineTechniqueSelect.addEventListener("change",()=>{
this.refineTechniqueId=d.refineTechniqueSelect.value||"fire_method";
this.renderRefinementTab();
});
}
if (d.refineCatalystSelect) {
d.refineCatalystSelect.addEventListener("change",()=>{
this.refineCatalystId=d.refineCatalystSelect.value||"none";
this.renderRefinementTab();
});
}
if (d.chkRefineProtectGu) {
d.chkRefineProtectGu.addEventListener("change",()=>{
this.refineProtectGu=Boolean(d.chkRefineProtectGu.checked);
this.renderRefinementTab();
});
}
if (d.btnClearRefine) {
d.btnClearRefine.addEventListener("click",()=>{
this.refinementSlots=[null,null,null];
this.renderRefinementTab();
});
}
if (d.btnExecuteRefine) {
d.btnExecuteRefine.addEventListener("click",()=>{
const opts={
techniqueId:this.refineTechniqueId,
catalystId:this.refineCatalystId,
protectGu:this.refineProtectGu
};
const res=this.guSystem.executeRefinement(this.refinementSlots,this.player,this.aperture,opts);
this.addLog(res.message,res.success?"loot" :"danger");
if (this.game) this.game.autoSaveNow("refine_gu");
this.refinementSlots=[null,null,null];
this.renderRefinementTab();
this.updateHubTopbar();
});
}
if (d.btnStudyRemnant) {
d.btnStudyRemnant.addEventListener("click",()=>{
const res=this.guSystem.studyRemnantRecipe(this.player);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderRefinementTab();
this.updateHubTopbar();
});
}
if (d.btnSalvageDuplicates) {
d.btnSalvageDuplicates.addEventListener("click",()=>{
if (!this.guSystem||typeof this.guSystem.salvageDuplicateMortalGus!=="function") return;
const res=this.guSystem.salvageDuplicateMortalGus(this.player);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.game) this.game.autoSaveNow("salvage_dups");
this.renderRefinementTab();
this.updateHubTopbar();
});
}
if (d.inventoryFilterTabs) {
const iBtns=d.inventoryFilterTabs.querySelectorAll(".tab-btn");
iBtns.forEach(btn=>{
btn.addEventListener("click",()=>{
iBtns.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
this.currentInventoryFilter=btn.getAttribute("data-ifilter")||"all";
this.renderInventoryTab();
});
});
}
const updateDeducePreview=()=>this._updateKillerMoveDeductionPreview();
if (d.killerCoreSelect) d.killerCoreSelect.addEventListener("change",updateDeducePreview);
if (d.killerSub1Select) d.killerSub1Select.addEventListener("change",updateDeducePreview);
if (d.killerSub2Select) d.killerSub2Select.addEventListener("change",updateDeducePreview);
if (d.btnDeduceKiller) {
d.btnDeduceKiller.addEventListener("click",()=>{
const res=this.guSystem.deduceAndSaveKillerMove(
d.killerCoreSelect.value,
d.killerSub1Select.value,
d.killerSub2Select.value,
this.player
);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.renderKillerMovesTab();
this.updateHubTopbar();
});
}
if (d.marketSubtabs) {
const btns=d.marketSubtabs.querySelectorAll(".tab-btn");
btns.forEach(btn=>{
btn.addEventListener("click",()=>{
btns.forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
this.currentMarketTab=btn.getAttribute("data-market")||"caravan";
this.renderMarketTab();
});
});
}
if (d.chkMarketInStockOnly) {
d.chkMarketInStockOnly.addEventListener("change",()=>{
this.marketInStockOnly=Boolean(d.chkMarketInStockOnly.checked);
this.renderMarketTab();
});
}
if (d.saveSlotsContainer) {
d.saveSlotsContainer.addEventListener("click",(e)=>{
const btn=e.target.closest("button[data-slot]");
if (!btn|| !this.game) return;
const slot=parseInt(btn.getAttribute("data-slot"),10);
if (btn.classList.contains("btn-save-slot")) {
this.game.saveGame(slot);
this.renderSettingsTab();
} else if (btn.classList.contains("btn-load-slot")) {
this.game.loadGame(slot);
this.renderSettingsTab();
} else if (btn.classList.contains("btn-restore-slot")) {
if (typeof this.game.restoreSlotBackup==="function") {
this.game.restoreSlotBackup(slot);
}
} else if (btn.classList.contains("btn-delete-slot")) {
if (typeof this.game.deleteSaveSlot==="function") {
this.game.deleteSaveSlot(slot);
}
}
});
}
if (d.btnManualAutoSaveNow) {
d.btnManualAutoSaveNow.addEventListener("click",()=>{
if (this.game&&this.game.autoSaveNow("manual")) {
this.addLog("☁️ Đã lưu vào Ô Tự Động Lưu riêng (không ảnh hưởng 3 Ô Lưu Thủ Công)!","system");
this.renderSettingsTab();
}
});
}
if (d.btnLoadAutoSaveNow) {
d.btnLoadAutoSaveNow.addEventListener("click",()=>{
if (this.game) {
this.game.loadAutoSave();
this.renderSettingsTab();
}
});
}
if (d.btnCreateNewCharSafe) {
d.btnCreateNewCharSafe.addEventListener("click",()=>{
if (!this.game) return;
const ok=confirm(
"🆕 Quay về màn hình Khai Khiếu để tạo nhân vật mới?\n\n" +
"🛡️ 3 Ô Lưu Thủ Công (Ô 1, 2, 3) của bạn sẽ được GIỮ NGUYÊN 100%, không bị ghi đè!\n" +
"(Hãy nhớ bấm [💾 Lưu] nhân vật hiện tại vào một Ô Lưu trước nếu bạn muốn giữ lại nhân vật đang chơi.)"
);
if (!ok) return;
this.game.returnToCharacterCreationAfterPermadeath();
});
}
if (d.btnResetSaves) {
d.btnResetSaves.addEventListener("click",()=>{
if (confirm("Ngươi có chắc chắn muốn xóa toàn bộ dữ liệu lưu trữ trong trình duyệt?")) {
if (this.game) {
this.game.clearAllSaves();
this.renderSettingsTab();
this.addLog("Đã xóa toàn bộ các ô lưu trữ.","warning");
}
}
});
}
if (d.keybindSelect) {
d.keybindSelect.addEventListener("change",()=>{
this.keybindMode=d.keybindSelect.value;
if (global.vanCoSettings) global.vanCoSettings.set("keybindMode",this.keybindMode,true);
this.updateKeybindLabels();
this.addLog(
`Đã đổi chế độ phím tắt Cổ Trùng sang: ${this.keybindMode==="numbers"?"Chỉ phím số 1–8" :"Kết hợp 1–8 & Q,R,T,F"}.`,
"system"
);
});
}
},
renderMapsTab() {
const d=this.dom;
if (!d.stageMapsGrid|| !this.game) return;
const obHost=document.getElementById("newbie-onboarding-host");
if (obHost&&global.GuideAndOnboardingUI) global.GuideAndOnboardingUI.renderOnboardingChecklist(obHost,this);
const tkBanner=document.getElementById("three-kings-featured-banner");
if (tkBanner) {
const pRank=(this.aperture&&this.aperture.rank)?this.aperture.rank :1;
const rankText=(global.GuSystem&&global.GuSystem.getRankName)?global.GuSystem.getRankName(pRank) :`${pRank} Chuyển`;
const clearedCnt=this.game.getStageClearCount("story_tam_vuong_dinh_tien_du");
const isOpen=pRank>=4;
tkBanner.innerHTML=`
<div class="tk-featured-inner">
<div class="tk-featured-text">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
<span class="badge" style="border-color:#38e8a8;color:#7ef7c4;background:rgba(20,75,58,0.5);">📖 MÀN CỐT TRUYỆN ĐỘC QUYỀN • KHÔNG FARM QUÁI</span>
<span class="badge" style="border-color:${isOpen?"#ffd700" :"#ff9f43"};color:${isOpen?"#ffd700" :"#ff9f43"};">${isOpen?"🔓 ĐÃ MỞ KHÓA (TỨ CHUYỂN+)" :`🔒 MỞ KHÓA TẠI TỨ CHUYỂN (Hiện tại: ${rankText})`}</span>
${clearedCnt>0?`<span class="badge" style="border-color:#5cc995;color:#7ef7c4;">✅ Đã hoàn thành ${clearedCnt} lần</span>` :""}
</div>
<h3 style="margin:6px 0 4px 0;color:#ffd700;font-size:17px;">🦋 TAM VƯƠNG TRUYỀN THỪA — NGHỊCH THIÊN LUYỆN LỤC CHUYỂN ĐỊNH TIÊN DU!</h3>
<p class="sub-text" style="color:#e6dfd5;"><strong>Trọn Bộ 5 Phần • 7 Thế Giới Mặt Đất Độc Lập + Không Gian Trên Cao (28 Nhân Vật Tách Riêng Hoàn Toàn)!</strong> <strong>Phần 1–3:</strong> Thanh Đồng Đại Điện, Độc Mù Trúc Lâm, Rừng Đá Khuyển Vương, Hoang Nguyên Bạo Vương, Cổ Tự Tín Vương, Chiến Trường Ngoại Vi Tam Xoa Sơn → <strong>Phần 4:</strong> Bóc trần Bạch Ngưng Băng & <strong>Không Gian Trên Cao Thiên Bộc Quang Hà</strong> luyện <strong>Định Tiên Du</strong> → <strong>Phần 5 (Hoàn Thiện Đại Kết Cục!):</strong> Ngâm trọn 4 câu thơ bất hủ, bỏ lại quần áo giữa <strong>Gió Đại Đồng</strong>, giáng lâm <strong>Thế Giới 7: Đỉnh Núi Đãng Hồn & Đãng Hồn Cung (Phúc Địa Hồ Tiên)</strong> thu phục <strong>Tiểu Hồ Tiên</strong> ngay trước mắt <strong>Phượng Kim Hoàng (Mộng Dực)</strong> & <strong>Cổ Nguyệt Phương Chính</strong> để nhận vĩnh viễn <strong>🦋 Lục Chuyển Định Tiên Du Tiên Cổ!</strong></p>
</div>
<div class="tk-featured-actions">
${isOpen
?`<button id="btn-banner-enter-tk" class="btn-primary momentum-btn-ready" style="padding:10px 16px;font-size:13.5px;border-color:#38e8a8;">🦋 Bắt Đầu Luyện Định Tiên Du!</button>`
:`<button id="btn-banner-preview-tk" class="btn-accent" style="padding:10px 14px;font-size:13px;">📜 Xem Trước Tam Vương Phúc Địa (Cần 4 Chuyển)</button>`}
</div>
</div>
`;
const bEnter=tkBanner.querySelector("#btn-banner-enter-tk");
if (bEnter) bEnter.addEventListener("click",()=>{if (this.game.threeKingsStory) this.game.threeKingsStory.open();});
const bPrev=tkBanner.querySelector("#btn-banner-preview-tk");
if (bPrev) bPrev.addEventListener("click",()=>{if (this.game.threeKingsStory) this.game.threeKingsStory.openPreviewModal();});
}
const stages=this.game.getStageCatalog();
const filtered=stages.filter(st=>{
if (this.mapsUnlockedOnly&& !this.game.isStageUnlocked(st.id).unlocked) return false;
if (this.currentMapRankFilter==="all") return true;
if (this.currentMapRankFilter==="story") return Boolean(st.isStoryStage);
if (this.currentMapRankFilter==="special") return Boolean(st.isSpecialResourceStage);
return!st.isSpecialResourceStage&&String(st.reqRank)===this.currentMapRankFilter;
});
d.stageMapsGrid.innerHTML=filtered.map(st=>{
const unlockStatus=this.game.isStageUnlocked(st.id);
const clearCount=this.game.getStageClearCount(st.id);
const isFirstClear=clearCount===0;
const isSpecial=Boolean(st.isSpecialResourceStage);
const isStory=Boolean(st.isStoryStage);
const statusClass=(!unlockStatus.unlocked?"locked" :(!isFirstClear?"cleared" :"")) + (isStory?" story-stage-card" :(isSpecial?" special-resource-card" :""));
const repeatFactor=(isFirstClear||isSpecial)
?1.0
:(typeof this.game.getStageRepeatFactor==="function"
?this.game.getStageRepeatFactor(st.id)
:Math.max(0.08,Number((0.22 / (1 + (clearCount - 1)*0.15)).toFixed(2))));
const repeatPct=Math.round(repeatFactor*100);
const _stPassiveMult=(this.game&&this.game.questManager&&typeof this.game.questManager.getPassiveBonuses==="function")
?(1 + (this.game.questManager.getPassiveBonuses().stoneDropPct||0))
:1.0;
const _baseExpStones=(isFirstClear||isSpecial)
?st.rewardStones
:Math.max(1,Math.round(st.rewardStones*repeatFactor));
const expectedStones=Math.round(_baseExpStones*_stPassiveMult);
const expectedMerit=(isFirstClear||isSpecial)
?st.rewardMerit
:Math.max(1,Math.round(st.rewardMerit*repeatFactor));
const expectedHumanQiText=(isFirstClear||isSpecial)
?`+${st.rewardHumanQi} Nhân Khí`
:`+1 Nhân Khí (20% cơ hội)`;
const rewardNote=isSpecial
?"(⭐ Bí Cảnh Tài Nguyên — Luôn 100% Thưởng)"
:(isFirstClear
?"(Vượt lần đầu: 100% thưởng)"
:`(Cày lại lần ${clearCount + 1}: ${repeatPct}% thưởng — Tối thiểu 8%)`);
const rankBadgeLabel=global.GuSystem&&global.GuSystem.getRankName
?`${global.GuSystem.getRankName(st.reqRank)}${st.reqRank>=9?" Tôn Giả" :(st.reqRank>=6?" Tiên Cảnh" :"")}`
:`${st.reqRank} Chuyển`;
const mobNamesDisplay=(Array.isArray(st.mobPool)&&st.mobPool.length>0)
?st.mobPool.map(m=>m.name).join(", ")
:st.mobName;
const multiBossArr=(Array.isArray(st.venerableBosses)&&st.venerableBosses.length>0)
?st.venerableBosses
:((Array.isArray(st.stageBosses)&&st.stageBosses.length>0)?st.stageBosses :null);
const bossNamesDisplay=multiBossArr
?multiBossArr.map(b=>b.name).join(", ")
:st.bossName;
let bossCombatNote="";
if (Array.isArray(st.venerableBosses)&&st.venerableBosses.length>0) {
const venListHtml=st.venerableBosses.map(vb=>
`<div style="margin-top:3px;color:#7ef7f0;">• <strong>${vb.name}:</strong> ${vb.guLoadout.slice(0,2).join(", ")} | <span style="color:#ffd700">${vb.killerMoveList[0]}</span></div>`
).join("");
bossCombatNote=`
<div style="margin-top:4px;padding:6px;background:rgba(20,12,34,0.85);border:1px solid #b75cff;">
<strong style="color:#00e5ff;">👑 Độc Chiến Song Tôn Cửu Chuyển (2 Thực Thể Riêng):</strong>
                            ${venListHtml}
</div>
                    `;
} else if (Array.isArray(st.stageBosses)&&st.stageBosses.length>0) {
const sbListHtml=st.stageBosses.map(sb=>
`<div style="margin-top:2px;color:#ffd8a8;">• <strong>${sb.name}</strong> <span style="color:#9cc2cf">(${sb.rankBadge})</span> — <span style="color:#ffd700">${sb.killerMoveName}</span></div>`
).join("");
bossCombatNote=`
<div style="margin-top:4px;padding:6px;background:rgba(26,18,16,0.85);border:1px solid #b89758;">
<strong style="color:#ffd700;">⚔️ Tổ Hợp ${st.stageBosses.length} Thủ Lĩnh Xuất Trận Riêng Biệt:</strong>
                            ${sbListHtml}
</div>
                    `;
} else if (st.bossIsHuman) {
bossCombatNote=`<div><strong>Tuyệt kỹ Boss:</strong> <span style="color:#ffd700">⚡ ${st.bossKillerMove||"Sát Chiêu"}</span> (${st.bossAttackGu||"Cổ Thuật"})</div>`;
} else {
bossCombatNote=`<div><strong>Loại Boss:</strong> Hung Thú / Hoang Thú Thượng Cổ</div>`;
}
if (isStory) {
const storyStatusText=isFirstClear
?"Chưa hoàn thành (Lần đầu nhận Lục Chuyển Định Tiên Du!)"
:`Đã tái hiện ${clearCount} lần (Có thể chơi lại bất cứ lúc nào)`;
return `
<div class="stage-map-card ${statusClass}">
<div>
<div class="map-card-header">
<span class="map-card-title">${st.icon} ${st.name}</span>
<span class="map-rank-tag" style="border-color:#38e8a8;color:#7ef7c4;">📖 Cốt Truyện • ${rankBadgeLabel}</span>
</div>
<p class="sub-text" style="margin: 8px 0;">${st.description}</p>
<div style="margin:6px 0;padding:6px 8px;border-left:3px solid #38e8a8;background:rgba(12,34,28,0.82);font-size:11.5px;">
<strong style="color:#7ef7c4;">⚗️ Màn Luyện Cổ Độc Quyền (Không Farm Quái / Không Đánh Boss):</strong>
<div class="sub-text" style="margin-top:2px;">Khởi Màn: Xuân Thu Thiền → Hồi I: Thuyết Phục Bá Quy → Hồi II: Đón Thái Cổ Chi Quang → Hồi III: Tự Cắt Huyết Nhục Luyện Định Tiên Du → Hồi IV: Khắc Ấn Đãng Hồn Sơn!</div>
</div>
<div class="map-card-meta">
<div><strong>Địa điểm:</strong> ${st.regionName}</div>
<div><strong>Trạng thái:</strong> <span style="color:#ffd700">${storyStatusText}</span></div>
</div>
</div>
<div>
<div class="map-card-rewards" style="border-color:#38e8a8;">
                                    🦋 <strong>Phần thưởng cốt truyện chuẩn nguyên tác:</strong><br>
                                    ${st.dropPreview}
</div>
<div class="mt-10">
                                    ${unlockStatus.unlocked
?`<button class="btn-primary btn-enter-stage" data-stage-id="${st.id}" style="width:100%;border-color:#38e8a8;color:#7ef7c4;">
                                               🦋 Tiến Vào Tam Vương Truyền Thừa — Luyện Định Tiên Du
</button>`
:`<button class="btn-accent btn-preview-story-stage" style="width:100%;">
                                               🔒 ${unlockStatus.reason} — 📜 Xem Trước Cốt Truyện
</button>`
}
</div>
</div>
</div>
                    `;
}
if (isSpecial) {
return `
<div class="stage-map-card ${statusClass}">
<div>
<div class="map-card-header">
<span class="map-card-title">${st.icon} ${st.name}</span>
<span class="map-rank-tag">${rankBadgeLabel}</span>
</div>
<p class="sub-text" style="margin: 8px 0;">${st.description}</p>
<div class="map-card-meta">
<div><strong>Chế độ:</strong> <span style="color:#7ef7c4">🌾 Farm Tự Do — Không có Boss (Rút lui bất cứ lúc nào)</span></div>
<div><strong>Quái tái sinh:</strong> ${mobNamesDisplay}${st.eliteName?` (+Tinh Anh: ${st.eliteName})` :" (+1 Tinh Anh)"}</div>
<div><strong>Tài nguyên bản đồ:</strong> <span style="color:#ffd700">10 Mỏ Cổ Tài & Nguyên Mạch (1 lượt / hồi 75s)</span></div>
</div>
</div>

<div>
<div class="map-card-rewards">
                                    🎁 <strong>Tài nguyên farm trực tiếp (${st.resourceFocus||"Đa Dạng"}):</strong><br>
                                    📦 ${st.dropPreview}
</div>

<div class="mt-10">
                                    ${unlockStatus.unlocked
?`<button class="btn-accent btn-enter-stage" data-stage-id="${st.id}" style="width:100%;">
                                               🌾 Vào Bí Cảnh Farm Tự Do (${rankBadgeLabel})
</button>`
:`<button class="btn-secondary" disabled style="width:100%;">
                                               🔒 ${unlockStatus.reason}
</button>`
}
</div>
</div>
</div>
                    `;
}
return `
<div class="stage-map-card ${statusClass}">
<div>
<div class="map-card-header">
<span class="map-card-title">${st.icon} ${st.name}</span>
<span class="map-rank-tag">${rankBadgeLabel}</span>
</div>
<p class="sub-text" style="margin: 8px 0;">${st.description}</p>
                            ${(()=>{
const mech=global.StageManager&&global.StageManager.getMechanicProfile?global.StageManager.getMechanicProfile(st.id) :null;
return mech?`<div style="margin:6px 0;padding:6px 8px;border-left:3px solid ${mech.propColor||"#ffd700"};background:rgba(16,24,36,0.75);font-size:11.5px;"><strong style="color:${mech.propColor||"#ffd700"};">🧩 Cơ Chế Ải: ${escapeHtml(mech.badge)}</strong><div class="sub-text" style="margin-top:2px;">${escapeHtml(mech.summary)}</div></div>` :"";
})()}
<div class="map-card-meta">
<div><strong>Vùng:</strong> ${st.regionName} | <strong>Đã vượt:</strong> ${clearCount} lần</div>
<div><strong>Quái phân bố (${st.targetKills} mục tiêu):</strong> ${mobNamesDisplay}${st.eliteName?` • Tinh Anh: <span style="color:#c278ff">${st.eliteName}</span>` :""}</div>
<div><strong>Thủ lĩnh ải:</strong> <span style="color:#ff8080">${bossNamesDisplay}</span> ${(!multiBossArr&&st.bossRankBadge)?`<span class="badge">[${st.bossRankBadge}]</span>` :""}</div>
                                ${bossCombatNote}
</div>
</div>

<div>
<div class="map-card-rewards">
                                🎁 <strong>Chiến lợi phẩm ${rewardNote}:</strong><br>
                                💎 +${expectedStones.toLocaleString("vi-VN")} Nguyên Thạch | 🏅 +${expectedMerit.toLocaleString("vi-VN")} Cống Hiến | ☯ ${expectedHumanQiText}<br>
                                🪲 Thưởng qua ải: <strong>0–2 Cổ Trùng ngẫu nhiên (${st.reqRank} Chuyển)</strong><br>
                                📦 Rơi: ${st.dropPreview}${!isFirstClear?" <em>(Cày lại: 35% tỷ lệ rơi; Xá Lợi Cổ cố định 1%)</em>" :""}
</div>

<div class="mt-10">
                                ${unlockStatus.unlocked
?`<button class="btn-primary btn-enter-stage" data-stage-id="${st.id}" style="width:100%;">
                                           ⚔️ Tiến Vào Chiến Trường (${rankBadgeLabel})
</button>`
:`<button class="btn-secondary" disabled style="width:100%;">
                                           🔒 ${unlockStatus.reason}
</button>`
}
</div>
</div>
</div>
                `;
}).join("");
d.stageMapsGrid.querySelectorAll(".btn-enter-stage").forEach(btn=>{
btn.addEventListener("click",()=>{
const stageId=btn.getAttribute("data-stage-id");
if (this.game) {
this.game.enterStageBattle(stageId);
}
});
});
d.stageMapsGrid.querySelectorAll(".btn-preview-story-stage").forEach(btn=>{
btn.addEventListener("click",()=>{
if (this.game&&this.game.threeKingsStory) {
this.game.threeKingsStory.openPreviewModal();
}
});
});
},
renderApertureTab() {
if (!this.aperture|| !this.player) return;
const d=this.dom;
const ap=this.aperture;
const pl=this.player;
if (d.apertureCanvas) {
ap.renderApertureCanvas(d.apertureCanvas.getContext("2d"));
}
if (d.immortalApertureCanvas) {
ap.renderImmortalApertureMap(d.immortalApertureCanvas.getContext("2d"));
}
if (d.hubSkinSelect) {
d.hubSkinSelect.value=pl.skinId||"phuong_nguyen";
}
const skinCfg=pl.getSkinConfig?pl.getSkinConfig() :null;
if (d.hubSkinDesc&&skinCfg) {
d.hubSkinDesc.textContent=`[${skinCfg.title}] ${skinCfg.desc}`;
}
if (d.hubSkinCanvas&&global.PlayerManager) {
global.PlayerManager.renderSkinPreview(d.hubSkinCanvas.getContext("2d"),pl.skinId);
}
d.apTypeText.textContent=ap.isImmortal
?`${ap.immortalAperture.gradeName} (${ap.immortalAperture.spaceAcres} mẫu)`
:`Phàm Khiếu (${ap.aptitude.gradeName} - ${ap.aptitude.maxSeaPercent}%)`;
d.apRealmText.textContent=ap.getRealmDisplayName();
if (!ap.isImmortal) {
d.apWallText.textContent=`${ap.getApertureWallName()} (${Math.floor(ap.wallProgress)}/${ap.maxWallProgress})`;
} else {
const passed=ap.immortalAperture.subStageTribulationsPassed||0;
const req=ap.immortalAperture.subStageTribulationsRequired||
(ap.getManualTribulationRequirements?ap.getManualTribulationRequirements().tribulationsNeededForNextStage :2);
d.apWallText.textContent=`${ap.immortalAperture.gradeName} (Tiến độ Tiểu Cảnh Giới: ${passed}/${req} Tai Kiếp)`;
}
d.apEssenceName.textContent=ap.getEssenceQualityName();
const _vGu=this.guSystem&&Array.isArray(this.guSystem.ownedGuList)?this.guSystem.ownedGuList.find(g=>g.isVital) :null;
if (_vGu&&global.vanCoGuArt) {
d.apVitalGuName.innerHTML=`<span style="display:inline-flex;align-items:center;gap:6px;">${global.vanCoGuArt.renderImgHtml(_vGu,22,"gu-inline-art")}<span>${escapeHtml(ap.vitalGuName||_vGu.name)}</span></span>`;
} else {
d.apVitalGuName.textContent=ap.vitalGuName||"Chưa có";
}
const hasLiquor=typeof ap.hasLiquorWormAssist==="function"&&ap.hasLiquorWormAssist();
if (d.apLiquorWormStatus) {
if (ap.isImmortal) {
d.apLiquorWormStatus.textContent="Đã thành Cổ Tiên (Tu bằng Độ Tai Kiếp)";
d.apLiquorWormStatus.style.color="#67b7d1";
} else if (hasLiquor) {
d.apLiquorWormStatus.textContent="🍶 Tửu Trùng Đang Phụ Trợ (50–70 XP / lần!)";
d.apLiquorWormStatus.style.color="#5cc995";
} else {
d.apLiquorWormStatus.textContent="Chưa có Tửu Trùng đã luyện hóa (15–22 XP / lần)";
d.apLiquorWormStatus.style.color="#b3aa9c";
}
}
if (d.btnHubCultivate) {
d.btnHubCultivate.textContent=hasLiquor
?"🧘 Vận Công x1 (🍶 50–70 XP | -16% CN)"
:"🧘 Vận Công x1 (15–22 XP | -16% CN)";
}
if (d.btnHubCultivateX5) {
d.btnHubCultivateX5.textContent=hasLiquor
?"⚡ Vận Công x5 (🍶 250–350 XP)"
:"⚡ Vận Công x5 (75–110 XP)";
}
if (d.btnHubAutoMeditate) {
if (ap.isImmortal) {
d.btnHubAutoMeditate.disabled=true;
d.btnHubAutoMeditate.textContent="🔁 Bế Quan Tự Động (Chỉ Phàm Cảnh)";
} else {
d.btnHubAutoMeditate.disabled=false;
d.btnHubAutoMeditate.textContent=ap.isMeditating
?"⏹️ Đang Bế Quan Tự Động (Bấm để Dừng)"
:"🔁 Bế Quan Tự Động: ĐANG TẮT";
}
}
if (d.btnCollectApertureYield) {
if (!ap.isImmortal) {
d.btnCollectApertureYield.disabled=true;
d.btnCollectApertureYield.textContent="🔒 Thu Hoạch Tiên Khiếu (Cần Thăng Tiên)";
} else {
const yRem=typeof ap.getApertureYieldCooldownRemaining==="function"
?ap.getApertureYieldCooldownRemaining()
:0;
if (yRem>0) {
const mm=Math.floor(yRem / 60);
const ss=String(yRem % 60).padStart(2,"0");
d.btnCollectApertureYield.disabled=true;
d.btnCollectApertureYield.textContent=`⏳ Tái Sinh Sản Vật (${mm}:${ss})`;
} else {
d.btnCollectApertureYield.disabled=false;
d.btnCollectApertureYield.textContent="🌱 Thu Hoạch Sản Vật Tiên Khiếu (Hồi 3 phút)";
}
}
}
if (d.immortalYieldPreview) {
if (ap.isImmortal&&ap.immortalAperture&&ap.immortalAperture.active&&typeof ap.getApertureYieldProfile==="function") {
const yp=ap.getApertureYieldProfile();
d.immortalYieldPreview.classList.remove("hidden");
d.immortalYieldPreview.innerHTML=`
<p><strong style="color:#7ef7c4;">🌾 Sản Lượng Thu Hoạch Hiện Tại (${escapeHtml(ap.immortalAperture.gradeName)} — ${ap.immortalAperture.spaceAcres.toLocaleString("vi-VN")} mẫu):</strong></p>
<p>💎 <strong>+${yp.stonesYield.toLocaleString("vi-VN")}</strong> Nguyên Thạch | 🌟 <strong>+${yp.immortalStonesYield}</strong> Tiên Thạch | ✨ <strong>+${yp.essenceYield}</strong> ${yp.essenceName} | ☯ <strong>+${yp.humanQiYield}</strong> Nhân Khí</p>
<p class="sub-text">📦 Cổ Tài: +${yp.spiritHerbCount} Thanh Linh Thảo, +${yp.moonOrchidCount} Nguyệt Lan Hoa, +${yp.ginsengCount} Khổ Sâm, +${yp.soulCrystalCount} Đãng Hồn Thạch, +2 loại Cổ Tài đặc sản (x${yp.bonusMatCount}) & ${Math.round(yp.remnantChance*100)}% rơi 📜 Tàn Phương.</p>
                    `;
} else {
d.immortalYieldPreview.classList.add("hidden");
}
}
if (d.btnTriggerTribulation) {
if (!ap.isImmortal) {
d.btnTriggerTribulation.disabled=true;
d.btnTriggerTribulation.textContent="🔒 Chủ Động Độ Tai Kiếp (Cần Thăng Tiên)";
} else if (ap.rank===9&&ap.subStage===3) {
d.btnTriggerTribulation.disabled=true;
d.btnTriggerTribulation.textContent="👑 Đã Đạt Cửu Chuyển Đỉnh Phong";
} else if (typeof ap.isPseudoVenerable==="function"&&ap.isPseudoVenerable()) {
const req=ap.getManualTribulationRequirements();
const mPassed=ap.immortalAperture.myriadTribulationsPassed||0;
d.btnTriggerTribulation.disabled=false;
d.btnTriggerTribulation.textContent=`🌩️ Độ Vạn Kiếp [${mPassed}/3] (+35.000 ĐN | -${req.essenceCost} Tiên Nguyên, -${req.humanQiCost} Nhân Khí, -${req.mentalCost} Tinh Thần)`;
} else {
const req=ap.getManualTribulationRequirements();
const passed=ap.immortalAperture.subStageTribulationsPassed||0;
const totalNeed=ap.immortalAperture.subStageTribulationsRequired||req.tribulationsNeededForNextStage;
d.btnTriggerTribulation.disabled=false;
d.btnTriggerTribulation.textContent=`⚡ Độ ${req.tribulationName||"Tai Kiếp"} [${passed}/${totalNeed}] (-${req.essenceCost} Tiên Nguyên, -${req.humanQiCost} Nhân Khí, -${req.mentalCost} Tinh Thần)`;
}
}
if (d.tenExtremeSurvivalBox) {
const showTenBox= !ap.isImmortal&&ap.aptitude&&ap.aptitude.physique;
d.tenExtremeSurvivalBox.classList.toggle("hidden",!showTenBox);
if (showTenBox) {
const cYinYang=pl.getItemCount("am_duong_chuyen_than_gu");
const cStone=pl.getItemCount("thach_khieu_gu");
const cFreeze=pl.getItemCount("tinh_khieu_dinh_nguyen_gu");
if (d.tenExtremeStatusLine) {
_clearEl(d.tenExtremeStatusLine);
const span=document.createElement("span");
if (ap.tenExtremeSealed) {
span.style.color="#5cc995";
span.textContent="☯️ Đã Phong Ấn Âm Dương (90% Giáp Đẳng) — An toàn tuyệt đối, không tăng áp lực! Dùng thêm 1 Âm Dương Chuyển Thân Cổ khi muốn khôi phục 100% Thập Tuyệt Thể.";
} else if ((ap.pressureFreezeTimer||0)>0) {
span.style.color="#67b7d1";
span.textContent=`⏳ Đang Đóng Băng Áp Lực (còn ${Math.ceil(ap.pressureFreezeTimer)}s) — Hiện tại: ${ap.wallPressure.toFixed(1)}%.`;
} else {
span.style.color="#ff9f43";
span.appendChild(document.createTextNode("⚠️ Đang kích hoạt 100% Thập Tuyệt Thể — Áp lực hiện tại: "));
const strongP=document.createElement("strong");
strongP.textContent=`${ap.wallPressure.toFixed(1)}%`;
span.appendChild(strongP);
span.appendChild(document.createTextNode(" (+1%/45s, chỉ reset khi lên Đại Cảnh Giới). Mua cổ cứu mệnh tại Thương Đội / Đấu Giá / Khố Phòng!"));
}
d.tenExtremeStatusLine.appendChild(span);
}
if (d.btnUseYinYangGu) {
d.btnUseYinYangGu.textContent=ap.tenExtremeSealed
?`☯️ Dùng Âm Dương Chuyển Thân Cổ (Giải Phong Ấn 100% | Có: ${cYinYang})`
:`☯️ Dùng Âm Dương Chuyển Thân Cổ (Phong Ấn 90% An Toàn | Có: ${cYinYang})`;
d.btnUseYinYangGu.disabled=cYinYang<=0;
}
if (d.btnUseStoneApGu) {
d.btnUseStoneApGu.textContent=`🪨 Dùng Thạch Khiếu Cổ (-50% Áp Lực | Có: ${cStone})`;
d.btnUseStoneApGu.disabled=cStone<=0;
}
if (d.btnUseFreezeApGu) {
d.btnUseFreezeApGu.textContent=`⏳ Dùng Định Nguyên Cổ (-25% & Đóng Băng 5 Phút | Có: ${cFreeze})`;
d.btnUseFreezeApGu.disabled=cFreeze<=0;
}
}
}
if (d.venerableAscensionBox&&typeof ap.getVenerableReadiness==="function") {
const vCheck=ap.getVenerableReadiness(pl,this.game);
d.venerableAscensionBox.classList.toggle("hidden",!vCheck.isPseudoVenerable);
if (vCheck.isPseudoVenerable&&d.venerableChecklist) {
const okIcon=(b)=>b?"✅" :"❌";
d.venerableChecklist.innerHTML=`
<div class="info-list">
<div class="info-row">
<span>${okIcon(vCheck.hasDaoMarks)} 1. Tích lũy 30 Vạn Đạo Ngân (${escapeHtml(vCheck.mainPath)}):</span>
<strong style="color:${vCheck.hasDaoMarks?"#5cc995" :"#ffd700"}">${vCheck.mainMarks.toLocaleString("vi-VN")} / 300.000</strong>
</div>
<div class="info-row">
<span>${okIcon(vCheck.hasBlockade)} 2. Đột phá Phong Tỏa Thiên Đạo ${vCheck.fateDestroyed?"(Đã phá Túc Mệnh Ải 24)" :"(Cần vượt Ải 24 trước)"}:</span>
<strong style="color:${vCheck.hasBlockade?"#5cc995" :"#ff9f43"}">${vCheck.hasBlockade?"Đã Đột Phá" :"Chưa Đột Phá"}</strong>
</div>
<div class="info-row">
<span>${okIcon(vCheck.hasMyriad)} 3. Độ qua 3 lần Vạn Kiếp:</span>
<strong style="color:${vCheck.hasMyriad?"#5cc995" :"#ffd700"}">${vCheck.myriadPassed} / 3 lần</strong>
</div>
</div>
                    `;
if (d.btnBreakDaoBlockade) {
d.btnBreakDaoBlockade.disabled=vCheck.hasBlockade|| !vCheck.fateDestroyed;
d.btnBreakDaoBlockade.textContent=vCheck.hasBlockade
?"✅ Đã Đột Phá Phong Tỏa Thiên Đạo"
:(vCheck.fateDestroyed
?"⚡ Xung Kích Đột Phá Phong Tỏa Thiên Đạo (-60 Tiên Nguyên Bát Chuyển, -250 Nhân Khí)"
:"🔒 Phá Hủy Túc Mệnh Cổ (Vượt Ải 24) Để Mở Xung Kích Phong Tỏa");
}
if (d.btnAscendVenerable) {
d.btnAscendVenerable.disabled= !vCheck.canAscendVenerable;
d.btnAscendVenerable.textContent=vCheck.canAscendVenerable
?`👑 CHỨNG ĐẠO THÀNH TÔN — TRỞ THÀNH 【${vCheck.mainPath.toUpperCase()} ĐẠO CHỦ】!`
:"🔒 Hoàn Thành Đủ 3 Điều Kiện Trên Để Thành Tôn Cửu Chuyển";
}
}
}
if (d.daoLordPanelBox) {
const isDaoLord=ap.isImmortal&&ap.rank>=9&&ap.daoLordPath;
d.daoLordPanelBox.classList.toggle("hidden",!isDaoLord);
if (isDaoLord) {
const natMarks=ap.naturalDaoMarksRefined||0;
const ownMarks=Math.floor(pl.daoMarks[ap.daoLordPath]||0);
const amp=pl.calculateDaoAmplification(ap.daoLordPath,[]);
if (d.daoLordTitle) {
d.daoLordTitle.textContent=`👑 ${ap.daoLordPath.toUpperCase()} ĐẠO CHỦ — CHÍ TÔN CỬU CHUYỂN`;
}
if (d.daoLordStats) {
d.daoLordStats.innerHTML=`
                            Đạo Ngân bản thân (${escapeHtml(ap.daoLordPath)}): <strong class="highlight-gold">${ownMarks.toLocaleString("vi-VN")}</strong> |
                            Đạo Ngân Tự Nhiên đã luyện hóa: <strong style="color:#5cc995">${natMarks.toLocaleString("vi-VN")}</strong><br>
                            Quyền năng Đạo Chủ: Tổng khuếch đại chiêu thức ${escapeHtml(ap.daoLordPath)} đạt <strong style="color:#00e5ff">x${amp.multiplier}</strong> &amp; <strong>giảm 30% tiêu hao Hoàng Hạnh Tiên Nguyên</strong>!
                        `;
}
}
}
const canBreakMortal= !ap.isImmortal&&ap.wallProgress>=ap.maxWallProgress&& !(ap.rank===5&&ap.subStage===3);
d.btnHubBreakthrough.disabled= !canBreakMortal;
let extraAscensionBox=document.getElementById("ascension-status-helper-box");
if (!extraAscensionBox&&d.btnHubAscend&&d.btnHubAscend.parentNode) {
extraAscensionBox=document.createElement("div");
extraAscensionBox.id="ascension-status-helper-box";
extraAscensionBox.className="recipe-preview-box hidden mt-10";
d.btnHubAscend.parentNode.appendChild(extraAscensionBox);
}
if (!ap.isImmortal&&(ap.rank>=5||ap.ascensionState.inProgress)) {
d.btnHubAscend.classList.remove("hidden");
if (ap.ascensionState.inProgress) {
const st=ap.ascensionState;
const stageTitles={
1:"Bước 2/4: Dẫn Động Thiên Địa Nhị Khí",
2:"Bước 3/4: Nghênh Đón Thiên Kiếp Địa Tai",
3:"Bước 4/4: Tam Khí Nổ Khiếu — Hóa Thành Phúc Địa!"
};
d.btnHubAscend.disabled=false;
d.btnHubAscend.textContent=`🌌 ${stageTitles[st.stage]||"Tiếp Tục Độ Kiếp Thăng Tiên"} (Cân bằng: ${st.balanceScore}%)`;
if (extraAscensionBox) {
extraAscensionBox.classList.remove("hidden");
extraAscensionBox.innerHTML=`
<p><strong class="highlight-gold">⚡ Trạng Thái Độ Kiếp Thăng Tiên (Giai đoạn ${st.stage}/4):</strong></p>
<p>Thiên Khí: <strong>${st.heavenQi}</strong> | Địa Khí: <strong>${st.earthQi}</strong> | Nhân Khí: <strong>${st.humanQiCommitted}</strong></p>
<p>Độ Dung Hợp Tam Khí: <strong style="color:#5cc995">${st.balanceScore}%</strong> (Càng cao Phúc Địa càng lớn)</p>
<div class="action-row mt-5">
<button id="btn-asc-stabilize" class="btn-mini">☯ Điều Hòa Tam Khí (+6%)</button>
<button id="btn-asc-burn-human" class="btn-mini">🔥 Đốt 10 Nhân Khí (+8% Dung Hợp)</button>
</div>
                        `;
const btnStab=document.getElementById("btn-asc-stabilize");
if (btnStab) {
btnStab.addEventListener("click",()=>{
ap.adjustThreeQi("stabilize");
this.addLog(`☯ Đã vận thần niệm điều hòa Thiên - Địa - Nhân Tam Khí (Độ dung hợp: ${ap.ascensionState.balanceScore}%)!`,"cultivation");
this.renderApertureTab();
});
}
const btnBurn=document.getElementById("btn-asc-burn-human");
if (btnBurn) {
btnBurn.addEventListener("click",()=>{
if (ap.humanQi<10) {
this.addLog("Không đủ Nhân Khí dự trữ để thiêu đốt thêm!","warning");
return;
}
ap.adjustThreeQi("burn_human_qi");
this.addLog(`🔥 Thiêu đốt 10 Nhân Khí kích phát tiềm năng, Độ dung hợp Tam Khí đạt ${ap.ascensionState.balanceScore}%!`,"cultivation");
this.renderApertureTab();
this.updateHubTopbar();
});
}
}
} else {
if (extraAscensionBox) extraAscensionBox.classList.add("hidden");
const readiness=typeof ap.getAscensionReadiness==="function"
?ap.getAscensionReadiness()
:{
canAscend:ap.rank>=5&&ap.subStage>=3&&ap.wallProgress>=ap.maxWallProgress&&ap.humanQi>=120,
isPeakRank5:ap.rank>=5&&ap.subStage>=3,
isWallFull:ap.wallProgress>=ap.maxWallProgress,
hasEnoughQi:ap.humanQi>=120,
minHumanQi:120,
currentHumanQi:Math.floor(ap.humanQi),
wallProgress:Math.floor(ap.wallProgress),
maxWallProgress:ap.maxWallProgress
};
if (!readiness.isPeakRank5) {
d.btnHubAscend.disabled=true;
d.btnHubAscend.textContent=`🔒 Phá Khiếu Thăng Tiên (Cần đạt Ngũ Chuyển Đỉnh Phong — Hiện tại: ${ap.getRealmDisplayName()})`;
} else if (!readiness.isWallFull) {
d.btnHubAscend.disabled=true;
d.btnHubAscend.textContent=`🔒 Phá Khiếu Thăng Tiên (Cần ôn dưỡng 100% Tinh Mạc: ${readiness.wallProgress}/${readiness.maxWallProgress})`;
} else if (!readiness.hasEnoughQi) {
d.btnHubAscend.disabled=true;
d.btnHubAscend.textContent=`🔒 Phá Khiếu Thăng Tiên (Cần ${readiness.minHumanQi} Nhân Khí — Hiện có: ${readiness.currentHumanQi}/${readiness.minHumanQi})`;
} else {
d.btnHubAscend.disabled=false;
d.btnHubAscend.textContent=`🌌 Phá Khiếu Thăng Tiên — Tam Khí Hợp Nhất (Nhân Khí: ${readiness.currentHumanQi}/${readiness.minHumanQi})`;
}
}
} else {
d.btnHubAscend.classList.add("hidden");
if (extraAscensionBox) extraAscensionBox.classList.add("hidden");
}
d.statHp.textContent=`${Math.ceil(pl.hp)} / ${pl.maxHp}`;
d.statAtk.textContent=pl.atk;
d.statDef.textContent=pl.def;
d.statSpd.textContent=pl.spd;
d.statMental.textContent=`${Math.floor(pl.mental)} / ${pl.maxMental}`;
d.statAlignment.textContent=pl.getAlignmentTitle();
}
});
})(window);
