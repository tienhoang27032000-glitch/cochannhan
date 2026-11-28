(function (global) {
"use strict";
function escapeHtml(val) {
if (val===null||val===undefined) return "";
return String(val)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#39;");
}
function _clearEl(el) {
if (!el) return;
while (el.firstChild) el.removeChild(el.firstChild);
}
function _setEmptyHint(el,text,fullGrid=false) {
if (!el) return;
_clearEl(el);
const p=document.createElement("p");
p.className="empty-hint";
if (fullGrid) p.style.gridColumn="1/-1";
p.textContent=text;
el.appendChild(p);
}
function _setSubSpan(el,text) {
if (!el) return;
_clearEl(el);
const sp=document.createElement("span");
sp.className="sub-text";
sp.textContent=text;
el.appendChild(sp);
}
const {CARAVAN_SHOP_ITEMS,AUCTION_HOUSE_ITEMS,TREASURE_YELLOW_HEAVEN_ITEMS,CLAN_TREASURY_ITEMS,TRUE_INHERITANCES}=global.VanCoMarketCatalogs;
class UIManager {
constructor() {
this.game=null;
this.aperture=null;
this.player=null;
this.map=null;
this.guSystem=null;
this.combat=null;
this.enemies=null;
this.activeHubTab="tab-maps";
this.currentMapRankFilter="all";
this.mapsUnlockedOnly=false;
this.currentGuFilter="all";
this.guSearchQuery="";
this.guSortBy="rank_desc";
this.currentRefinementSubtab="furnace";
this.currentRecipeFilter="all";
this.refineTechniqueId="fire_method";
this.refineCatalystId="none";
this.refineProtectGu=false;
this.currentInventoryFilter="all";
this.currentMarketTab="caravan";
this.marketInStockOnly=false;
this.selectedGuInstanceId=null;
this.selectedSuppressorGuId="auto";
this.selectedInventoryItemId=null;
this.refinementSlots=[null,null,null];
this.keybindMode="hybrid";
this.activeInteractingNpc=null;
this.dom={};
this.inventoryUI=global.InventoryUI?new global.InventoryUI(this) :null;
this.guUI=global.GuUI?new global.GuUI(this) :null;
this.battleUI=global.BattleUI?new global.BattleUI(this) :null;
this.saveUI=global.SaveUI?new global.SaveUI(this) :null;
}
init(systems) {
this.game=systems.game||null;
this.aperture=systems.aperture||null;
this.player=systems.player||null;
this.map=systems.map||null;
this.guSystem=systems.guSystem||null;
this.combat=systems.combat||null;
this.enemies=systems.enemies||null;
this._cacheDomElements();
this._bindCreationScreenEvents();
this._bindHubNavigationEvents();
this._bindHubFeatureEvents();
this._bindBattleScreenEvents();
this._bindFileImportExportEvents();
this.updateKeybindLabels();
this.renderCreationSkinPreview();
}
_cacheDomElements() {
const $=(id)=>document.getElementById(id);
this.dom={
saveFileInput:$("save-file-input"),
creationScreen:$("character-creation-screen"),
hubScreen:$("hub-screen"),
battleScreen:$("battle-screen"),
stepForm:$("creation-step-form"),
stepRitual:$("creation-step-ritual"),
inputName:$("player-name"),
selectRegion:$("region-select"),
selectSkin:$("skin-select"),
creationSkinCanvas:$("creationSkinPreviewCanvas"),
skinDescText:$("skin-description-text"),
selectOrigin:$("faction-origin-select"),
originDescBox:$("origin-description-box"),
btnImportFileStart:$("btn-import-file-start"),
btnStartRitual:$("btn-start-ritual"),
btnLoadExisting:$("btn-load-existing"),
ritualCanvas:$("ritualCanvas"),
ritualStepBadge:$("ritual-step-indicator"),
ritualLog:$("ritual-narrative-log"),
aptitudeResultBox:$("aptitude-result-box"),
resAptitudeGrade:$("result-aptitude-grade"),
resSeaCap:$("result-sea-capacity"),
resRegenRate:$("result-regen-rate"),
resInitialRealm:$("result-initial-realm"),
resVitalGu:$("result-vital-gu"),
btnNextRitual:$("btn-next-ritual-step"),
btnEnterHub:$("btn-enter-hub"),
hubAvatar:$("hub-avatar-icon"),
hubTopAvatarCanvas:$("hubTopAvatarCanvas"),
hubName:$("hub-player-name"),
hubRegionBadge:$("hub-region-badge"),
hubFactionBadge:$("hub-faction-badge"),
hubAptitudeBadge:$("hub-aptitude-badge"),
hubRealmName:$("hub-realm-name"),
hubWallType:$("hub-wall-type"),
hubCultivateFill:$("hub-cultivate-fill"),
hubCultivateText:$("hub-cultivate-text"),
hubPressureText:$("hub-pressure-text"),
hubEssenceTitle:$("hub-essence-title"),
hubEssenceText:$("hub-essence-text"),
hubEssenceCapMarker:$("hub-essence-cap-marker"),
hubEssenceFill:$("hub-essence-fill"),
hubHpText:$("hub-hp-text"),
hubMentalText:$("hub-mental-text"),
hubStonesCount:$("hub-stones-count"),
hubMeritCount:$("hub-merit-count"),
hubHumanQiCount:$("hub-human-qi-count"),
hubImmortalStonesCount:$("hub-immortal-stones-count"),
worldLog:$("world-log-content"),
btnClearLog:$("btn-clear-log"),
mapRankFilter:$("map-rank-filter"),
stageMapsGrid:$("stage-maps-grid"),
apertureCanvas:$("apertureVisualCanvas"),
apTypeText:$("ap-type-text"),
apRealmText:$("ap-realm-text"),
apWallText:$("ap-wall-text"),
apEssenceName:$("ap-essence-name"),
apVitalGuName:$("ap-vital-gu-name"),
btnHubCultivate:$("btn-hub-cultivate"),
btnHubAbsorbStone:$("btn-hub-absorb-stone"),
btnHubUseRelic:$("btn-hub-use-relic"),
btnHubBreakthrough:$("btn-hub-breakthrough"),
btnHubAscend:$("btn-hub-ascend"),
hubSkinCanvas:$("hubSkinPreviewCanvas"),
hubSkinSelect:$("hub-skin-select"),
hubSkinDesc:$("hub-skin-desc"),
statHp:$("stat-hp"),
statAtk:$("stat-atk"),
statDef:$("stat-def"),
statSpd:$("stat-spd"),
statMental:$("stat-mental"),
statAlignment:$("stat-alignment"),
immortalApertureCanvas:$("immortalApertureCanvas"),
btnCollectApertureYield:$("btn-collect-aperture-yield"),
btnTriggerTribulation:$("btn-trigger-tribulation"),
guFilterTabs:$("gu-filter-tabs"),
hubEquippedGuBar:$("hub-equipped-gu-bar"),
guStorageGrid:$("gu-storage-grid"),
guDetailBox:$("gu-detail-box"),
refineSlot1:$("refine-slot-1"),
refineSlot2:$("refine-slot-2"),
refineSlot3:$("refine-slot-3"),
refinePreview:$("refinement-recipe-preview"),
btnExecuteRefine:$("btn-execute-refinement"),
btnClearRefine:$("btn-clear-refinement"),
btnStudyRemnant:$("btn-study-remnant-recipe"),
knownRecipesList:$("known-recipes-list"),
killerCoreSelect:$("killer-core-select"),
killerSub1Select:$("killer-sub1-select"),
killerSub2Select:$("killer-sub2-select"),
deduceName:$("deduce-name"),
deduceType:$("deduce-type"),
deduceCost:$("deduce-cost"),
deduceDesc:$("deduce-desc"),
btnDeduceKiller:$("btn-deduce-killer-move"),
savedKillerList:$("saved-killer-moves-list"),
daoMarksList:$("dao-marks-list"),
dreamRealmList:$("dream-realm-list"),
inventoryGrid:$("inventory-grid"),
inventoryDetailBox:$("inventory-detail-box"),
marketSubtabs:$("market-subtabs"),
marketContent:$("market-content-container"),
questList:$("quest-list-container"),
clanTreasury:$("clan-treasury-container"),
inheritanceList:$("inheritance-list-container"),
saveSlotsContainer:$("save-slots-container"),
btnExportSaveFile:$("btn-export-save-file"),
btnImportSaveFile:$("btn-import-save-file"),
btnResetSaves:$("btn-reset-all-saves"),
keybindSelect:$("keybind-mode-select"),
battlePlayerName:$("battle-player-name"),
battleRealmBadge:$("battle-realm-badge"),
battleHpText:$("battle-hp-text"),
battleHpFill:$("battle-hp-fill"),
battleEssenceName:$("battle-essence-name"),
battleEssenceText:$("battle-essence-text"),
battleEssenceCapMarker:$("battle-essence-cap-marker"),
battleEssenceFill:$("battle-essence-fill"),
battleActiveBuffs:$("battle-active-buffs"),
battleStageTitle:$("battle-stage-title"),
battleStageObjective:$("battle-stage-objective"),
battleStageProgressFill:$("battle-stage-progress-fill"),
btnRetreatToHub:$("btn-retreat-to-hub"),
interactionPrompt:$("interaction-prompt"),
guQuickbar:$("gu-quickbar"),
killerQuickbar:$("killer-quickbar"),
btnBattleUseStone:$("btn-battle-use-stone"),
btnBattleUseHerb:$("btn-battle-use-herb"),
stageVictoryModal:$("stage-victory-modal"),
stageResultTitle:$("stage-result-title"),
stageRewardSummary:$("stage-reward-summary"),
btnReplayStage:$("btn-replay-stage"),
btnVictoryReturnHub:$("btn-victory-return-hub"),
npcInteractionModal:$("npc-interaction-modal"),
npcModalTitle:$("npc-modal-title"),
npcModalBody:$("npc-modal-body"),
hubAutoSaveStatus:$("hub-autosave-status"),
settingsAutoSaveInfo:$("settings-autosave-info"),
btnManualAutoSaveNow:$("btn-manual-autosave-now"),
battlePressureWarning:$("battle-pressure-warning"),
battlePressureVal:$("battle-pressure-val"),
btnZoomOut:$("btn-zoom-out"),
btnZoomReset:$("btn-zoom-reset"),
btnZoomIn:$("btn-zoom-in"),
battleDefeatModal:$("battle-defeat-modal"),
battleDefeatSummary:$("battle-defeat-summary"),
btnDefeatRespawnHub:$("btn-defeat-respawn-hub"),
permadeathModal:$("permadeath-modal"),
permadeathSummary:$("permadeath-summary"),
btnPermadeathNewLife:$("btn-permadeath-new-life"),
tenExtremeSurvivalBox:$("ten-extreme-survival-box"),
tenExtremeStatusLine:$("ten-extreme-status-line"),
btnUseYinYangGu:$("btn-use-yinyang-gu"),
btnUseStoneApGu:$("btn-use-stone-ap-gu"),
btnUseFreezeApGu:$("btn-use-freeze-ap-gu"),
venerableAscensionBox:$("venerable-ascension-box"),
venerableChecklist:$("venerable-checklist"),
btnBreakDaoBlockade:$("btn-break-dao-blockade"),
btnAscendVenerable:$("btn-ascend-venerable"),
daoLordPanelBox:$("dao-lord-panel-box"),
daoLordTitle:$("dao-lord-title"),
daoLordStats:$("dao-lord-stats"),
btnRefineNaturalDao:$("btn-refine-natural-dao"),
marketCycleNum:$("market-cycle-num"),
marketResetCountdown:$("market-reset-countdown"),
treasuryResetCountdown:$("treasury-reset-countdown"),
toastStack:$("toast-notification-stack"),
btnQuickEnterHighest:$("btn-quick-enter-highest-stage"),
chkMapsUnlockedOnly:$("chk-maps-unlocked-only"),
btnHubCultivateX5:$("btn-hub-cultivate-x5"),
btnHubAutoMeditate:$("btn-hub-auto-meditate"),
btnHubAbsorbFull:$("btn-hub-absorb-full"),
btnHubQuickHeal:$("btn-hub-quick-heal"),
guSearchInput:$("gu-search-input"),
guSortSelect:$("gu-sort-select"),
btnGuFeedAll:$("btn-gu-feed-all"),
btnGuAutoEquip:$("btn-gu-auto-equip"),
refinementSubtabs:$("refinement-subtabs"),
refineMasteryTitle:$("refine-mastery-title"),
refineMasteryDesc:$("refine-mastery-desc"),
refinePityBadge:$("refine-pity-badge"),
refinePanelFurnace:$("refine-panel-furnace"),
refinePanelSynthesis:$("refine-panel-synthesis"),
refinePanelSalvage:$("refine-panel-salvage"),
refineTechniqueSelect:$("refine-technique-select"),
refineTechniqueDesc:$("refine-technique-desc"),
refineCatalystSelect:$("refine-catalyst-select"),
chkRefineProtectGu:$("chk-refine-protect-gu"),
refineQuickPickerGu:$("refine-quick-picker-gu"),
refineQuickPickerItems:$("refine-quick-picker-items"),
recipeFilterTabs:$("recipe-filter-tabs"),
materialSynthesisGrid:$("material-synthesis-grid"),
salvageGuList:$("salvage-gu-list"),
btnSalvageDuplicates:$("btn-salvage-duplicates"),
wildGuRefineList:$("wild-gu-refine-list"),
inventoryFilterTabs:$("inventory-filter-tabs"),
chkMarketInStockOnly:$("chk-market-instock-only"),
apLiquorWormStatus:$("ap-liquor-worm-status"),
daoMarksRealmBanner:$("dao-marks-realm-banner"),
immortalYieldPreview:$("immortal-yield-preview"),
btnLoadAutoSaveNow:$("btn-load-autosave-now"),
btnCreateNewCharSafe:$("btn-create-new-char-safe")
};
}
_bindCreationScreenEvents() {
const d=this.dom;
const updateOriginPreview=()=>{
const origin=d.selectOrigin?d.selectOrigin.value :"righteous_clan";
const region=d.selectRegion?d.selectRegion.value :"nam_cuong";
const desc=global.PlayerManager.getOriginDescription(origin,region);
if (d.originDescBox) {
_clearEl(d.originDescBox);
const p=document.createElement("p");
const st=document.createElement("strong");
st.textContent="Bối cảnh khởi đầu: ";
p.appendChild(st);
p.appendChild(document.createTextNode(desc));
d.originDescBox.appendChild(p);
}
};
if (d.selectOrigin) d.selectOrigin.addEventListener("change",updateOriginPreview);
if (d.selectRegion) d.selectRegion.addEventListener("change",updateOriginPreview);
if (d.selectSkin) {
d.selectSkin.addEventListener("change",()=>{
this.renderCreationSkinPreview();
const skinInfo=global.PlayerManager.getSkinInfo(d.selectSkin.value);
const allSkinNames=Object.values(global.PlayerManager.CHARACTER_SKINS).map(s=>s.name);
if (d.inputName&&(!d.inputName.value.trim()||allSkinNames.includes(d.inputName.value.trim()))) {
d.inputName.value=skinInfo.name;
}
});
}
if (d.btnStartRitual) {
d.btnStartRitual.addEventListener("click",()=>{
const origin=d.selectOrigin?d.selectOrigin.value :"righteous_clan";
const stepData=this.aperture.startAwakeningRitual(origin);
d.stepForm.classList.add("hidden");
d.stepRitual.classList.remove("hidden");
d.aptitudeResultBox.classList.add("hidden");
d.btnNextRitual.classList.remove("hidden");
d.btnEnterHub.classList.add("hidden");
_clearEl(d.ritualLog);
this._renderRitualStepInfo(stepData);
});
}
if (d.btnLoadExisting) {
d.btnLoadExisting.addEventListener("click",()=>{
if (this.game&&typeof this.game.loadAnyExistingSave==="function") {
const ok=this.game.loadAnyExistingSave();
if (!ok) {
const sum=this.game.getAutoSaveSummary?this.game.getAutoSaveSummary() :null;
if (sum&&sum.isPermadead) {
alert("💀 Nhân vật trong bản lưu trình duyệt đã BẠO TẠC KHÔNG KHIẾU CHẾT HẲN! Không thể tiếp tục file lưu này, hãy khởi tạo Cổ Sư mới.");
} else {
alert("Chưa có dữ liệu lưu trữ khả dụng trên trình duyệt! Bạn có thể dùng nút 'Nhập File Lưu (.json)' hoặc tiến hành Khai Khiếu.");
}
}
}
});
}
if (d.btnNextRitual) {
d.btnNextRitual.addEventListener("click",()=>{
const stepData=this.aperture.advanceRitualStep();
this._renderRitualStepInfo(stepData);
});
}
if (d.btnEnterHub) {
d.btnEnterHub.addEventListener("click",()=>{
const name=d.inputName?d.inputName.value :"Cổ Nguyệt Phương Nguyên";
const origin=d.selectOrigin?d.selectOrigin.value :"righteous_clan";
const region=d.selectRegion?d.selectRegion.value :"nam_cuong";
const skinKey=d.selectSkin?d.selectSkin.value :"phuong_nguyen";
if (this.game&&typeof this.game.startNewGameFromRitual==="function") {
this.game.startNewGameFromRitual(name,origin,region,skinKey);
}
this.showScreen("hub");
});
}
}
renderCreationSkinPreview() {
const d=this.dom;
if (!d.selectSkin|| !global.PlayerManager) return;
const skinKey=d.selectSkin.value;
const skinInfo=global.PlayerManager.getSkinInfo(skinKey);
if (d.skinDescText&&skinInfo) {
d.skinDescText.textContent=`[${skinInfo.title}] ${skinInfo.desc}`;
}
if (d.creationSkinCanvas) {
global.PlayerManager.renderSkinPreview(d.creationSkinCanvas.getContext("2d"),skinKey);
}
}
_renderRitualStepInfo(stepData) {
const d=this.dom;
if (!stepData) return;
d.ritualStepBadge.textContent=stepData.title;
const p=document.createElement("p");
const stepStrong=document.createElement("strong");
stepStrong.textContent=`[Bước ${stepData.step}] `;
p.appendChild(stepStrong);
p.appendChild(document.createTextNode(String(stepData.text||"")));
d.ritualLog.appendChild(p);
d.ritualLog.scrollTop=d.ritualLog.scrollHeight;
if (stepData.step>=6&&stepData.aptitudeResult) {
const apt=stepData.aptitudeResult;
const vital=stepData.vitalGuResult;
d.aptitudeResultBox.classList.remove("hidden");
d.resAptitudeGrade.textContent=apt.gradeName;
d.resSeaCap.textContent=`${apt.maxSeaPercent}% Biển Nguyên`;
d.resRegenRate.textContent=`+${apt.baseRegen}% / giây`;
d.resInitialRealm.textContent="Nhất Chuyển Sơ Giai (Thanh Đồng Chân Nguyên)";
d.resVitalGu.textContent=vital?vital.name :"Nguyệt Quang Cổ Nhất Chuyển";
}
if (stepData.isFinished) {
d.btnNextRitual.classList.add("hidden");
d.btnEnterHub.classList.remove("hidden");
}
}
_bindFileImportExportEvents() {
const d=this.dom;
if (d.btnExportSaveFile) {
d.btnExportSaveFile.addEventListener("click",()=>{
if (this.game&&typeof this.game.exportSaveToFile==="function") {
this.game.exportSaveToFile();
}
});
}
const triggerFileDialog=()=>{
if (d.saveFileInput) {
d.saveFileInput.value="";
d.saveFileInput.click();
}
};
if (d.btnImportFileStart) {
d.btnImportFileStart.addEventListener("click",triggerFileDialog);
}
if (d.btnImportSaveFile) {
d.btnImportSaveFile.addEventListener("click",triggerFileDialog);
}
if (d.saveFileInput) {
d.saveFileInput.addEventListener("change",(e)=>{
const file=e.target.files&&e.target.files[0];
if (file&&this.game&&typeof this.game.importSaveFromFile==="function") {
this.game.importSaveFromFile(file);
}
});
}
}
showScreen(screenName) {
const d=this.dom;
d.creationScreen.classList.toggle("active",screenName==="creation");
d.hubScreen.classList.toggle("active",screenName==="hub");
if (screenName==="hub"&&this._logNeedsScroll&&d.worldLog) {this._logNeedsScroll=false;d.worldLog.scrollTop=d.worldLog.scrollHeight;}
d.battleScreen.classList.toggle("active",screenName==="battle");
const tkScr=document.getElementById("tk-world-screen");
if (tkScr) tkScr.classList.toggle("active",screenName==="tk_story");
if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") global.vanCoSettings.syncBgmForScreen(screenName);
if (screenName!=="battle") {
this.closeNpcInteractionModal();
}
if (screenName==="hub") {
this.updateHUD();
this.renderActiveHubTab();
} else if (screenName==="battle") {
this.updateBattleHUD();
}
if (global.vanCoMobileControls&&typeof global.vanCoMobileControls.onScreenChange==="function") {
global.vanCoMobileControls.onScreenChange(screenName);
}
}
switchToGameScreen() {
this.showScreen("hub");
}
_bindHubNavigationEvents() {
const navBtns=document.querySelectorAll(".hub-sidebar .nav-btn[data-tab]");
navBtns.forEach(btn=>{
btn.addEventListener("click",()=>{
const tabId=btn.getAttribute("data-tab");
this.switchHubTab(tabId);
});
});
const btnStorySidebar=document.getElementById("btn-sidebar-three-kings");
if (btnStorySidebar) {
btnStorySidebar.addEventListener("click",()=>{
if (!this.game|| !this.game.threeKingsStory) return;
const pRank=(this.aperture&&this.aperture.rank)?this.aperture.rank :1;
if (pRank<4) {
const rName=(global.GuSystem&&global.GuSystem.getRankName)?global.GuSystem.getRankName(pRank) :`${pRank} Chuyển`;
this.addLog(`🔒 【Tam Vương Truyền Thừa】 chỉ mở khóa tại Tứ Chuyển (4 Chuyển)! Hiện tại: ${rName}.`,"warning");
this.game.threeKingsStory.openPreviewModal();
return;
}
this.game.threeKingsStory.open();
});
}
if (this.dom.hubAvatar) {
this.dom.hubAvatar.addEventListener("click",()=>{
this.switchHubTab("tab-aperture");
});
}
const btnGuideHub=document.getElementById("btn-open-guide-hub");
if (btnGuideHub) {
btnGuideHub.addEventListener("click",()=>{
if (global.GuideAndOnboardingUI) global.GuideAndOnboardingUI.openGuideModal("guide");
});
}
if (this.dom.btnClearLog) {
this.dom.btnClearLog.addEventListener("click",()=>{
_clearEl(this.dom.worldLog);
this.addLog("Đã làm sạch Thiên Cơ Nhật Ký.","system");
});
}
}
switchHubTab(tabId) {
if (this.activeHubTab!==tabId&&global.vanCoSfx) global.vanCoSfx.play("tab");
this.activeHubTab=tabId;
document.querySelectorAll(".hub-sidebar .nav-btn").forEach(btn=>{
btn.classList.toggle("active",btn.getAttribute("data-tab")===tabId);
});
document.querySelectorAll(".hub-tab-panel").forEach(panel=>{
const isTarget=panel.id===tabId;
panel.classList.toggle("active",isTarget);
panel.classList.toggle("hidden",!isTarget);
});
const contentArea=document.querySelector(".hub-content-area");
if (contentArea) contentArea.scrollTop=0;
this.renderActiveHubTab();
}
renderActiveHubTab() {
this.updateHubTopbar();
switch (this.activeHubTab) {
case "tab-maps":
this.renderMapsTab();
break;
case "tab-reverse-flow":
this.renderReverseFlowTab();
break;
case "tab-aperture":
this.renderApertureTab();
break;
case "tab-blessed-land":
this.renderBlessedLandTab();
break;
case "tab-gu-storage":
this.renderGuStorageTab();
break;
case "tab-beast-army":
this.renderBeastArmyTab();
break;
case "tab-gu-house":
this.renderGuHouseTab();
break;
case "tab-refinement":
this.renderRefinementTab();
break;
case "tab-killer-moves":
this.renderKillerMovesTab();
break;
case "tab-dao-attainment":
this.renderDaoAttainmentTab();
break;
case "tab-inventory":
this.renderInventoryTab();
break;
case "tab-market":
this.renderMarketTab();
break;
case "tab-faction":
this.renderFactionTab();
break;
case "tab-settings":
this.renderSettingsTab();
break;
}
}
showToast(message,category="system") {
if (global.vanCoSettings&& !global.vanCoSettings.get("showToasts")) return;
const stack=this.dom.toastStack;
if (!stack|| !message) return;
const toast=document.createElement("div");
toast.className=`toast-item ${category}`;
toast.textContent=message.length>140?message.slice(0,137) + "..." :message;
stack.appendChild(toast);
while (stack.children.length>3) {
stack.removeChild(stack.firstChild);
}
setTimeout(()=>{
toast.classList.add("fade-out");
setTimeout(()=>{
if (toast.parentNode) toast.parentNode.removeChild(toast);
},260);
},3000);
}
addLog(message,category="system") {
if (this.dom.worldLog) {
const entry=document.createElement("div");
entry.className=`log-entry ${category}`;
entry.textContent=message;
this.dom.worldLog.appendChild(entry);
while (this.dom.worldLog.children.length>70) {
this.dom.worldLog.removeChild(this.dom.worldLog.firstChild);
}
if (!this.game||this.game.currentScreen==="hub") {
this.dom.worldLog.scrollTop=this.dom.worldLog.scrollHeight;
} else {
this._logNeedsScroll=true;
}
}
if (
this.game&&
this.game.currentScreen==="hub"&&
(category==="loot"||category==="cultivation"||category==="warning"||category==="danger")
) {
this.showToast(message,category);
}
}
updateHUD() {
this.updateHubTopbar();
if (this.game&&this.game.currentScreen==="battle") {
this.updateBattleHUD();
}
}
updateHubTopbar() {
if (!this.player|| !this.aperture) return;
const d=this.dom;
const pl=this.player;
const ap=this.aperture;
if (d.hubTopAvatarCanvas&&global.PlayerManager&&this._lastTopbarSkinId!==pl.skinId) {
this._lastTopbarSkinId=pl.skinId;
global.PlayerManager.renderSkinPreview(d.hubTopAvatarCanvas.getContext("2d"),pl.skinId);
}
d.hubName.textContent=pl.name;
d.hubRegionBadge.textContent=pl.getRegionName?pl.getRegionName() :"Nam Cương";
d.hubFactionBadge.textContent=pl.getFactionOriginName?pl.getFactionOriginName() :"Chính Đạo Gia Tộc";
d.hubAptitudeBadge.textContent=`${ap.aptitude.gradeName} (${ap.aptitude.maxSeaPercent}%)`;
d.hubRealmName.textContent=ap.getRealmDisplayName();
d.hubWallType.textContent=ap.isImmortal
?`${ap.immortalAperture.gradeName}`
:`Khiếu bích: ${ap.getApertureWallName()}`;
if (!ap.isImmortal) {
const wallPct=Math.min(100,(ap.wallProgress / Math.max(1,ap.maxWallProgress))*100);
d.hubCultivateFill.style.width=`${wallPct}%`;
d.hubCultivateText.textContent=`${Math.floor(ap.wallProgress)} / ${ap.maxWallProgress}`;
const pVal=Number(ap.wallPressure.toFixed(1));
if (ap.aptitude&&ap.aptitude.physique) {
if (ap.tenExtremeSealed) {
d.hubPressureText.textContent="☯️ 0% (Đã Phong Ấn Âm Dương 90%)";
d.hubPressureText.style.color="#5cc995";
} else if ((ap.pressureFreezeTimer||0)>0) {
d.hubPressureText.textContent=`⏳ ${pVal.toFixed(1)}% (Đóng băng ${Math.ceil(ap.pressureFreezeTimer)}s)`;
d.hubPressureText.style.color="#67b7d1";
} else {
d.hubPressureText.textContent=pVal>=80?`🚨 ${pVal.toFixed(1)}% (SẮP BẠO TẠC!)` :`⚠️ ${pVal.toFixed(1)}% (+1%/45s)`;
d.hubPressureText.style.color=pVal>=80?"#ff3b30" :(pVal>=55?"#ff9f43" :"#ffd700");
}
} else {
d.hubPressureText.textContent=`${pVal}%`;
d.hubPressureText.style.color="";
}
const curEss=Number(ap.currentEssence.toFixed(1));
const maxCap=ap.aptitude.maxSeaPercent;
d.hubEssenceTitle.textContent=ap.getEssenceQualityName();
d.hubEssenceText.textContent=`${curEss}% / ${maxCap}%`;
d.hubEssenceCapMarker.style.left=`${maxCap}%`;
d.hubEssenceCapMarker.classList.remove("hidden");
d.hubEssenceFill.className=`progress-fill ${ap.getEssenceCssClass()}`;
d.hubEssenceFill.style.width=`${curEss}%`;
} else {
const isPseudo=typeof ap.isPseudoVenerable==="function"&&ap.isPseudoVenerable();
if (isPseudo) {
const mPassed=ap.immortalAperture.myriadTribulationsPassed||0;
const tribPct=Math.min(100,(mPassed / 3)*100);
d.hubCultivateFill.style.width=`${tribPct}%`;
d.hubCultivateText.textContent=`Vạn Kiếp: ${mPassed} / 3 | Đạo Ngân: ${Math.floor(pl.daoMarks[pl.mainPath]||0).toLocaleString("vi-VN")}/300.000`;
d.hubPressureText.textContent=ap.daoBlockadeBroken?"✅ Đã Phá Phong Tỏa Thiên Đạo" :"🔒 Chưa Phá Phong Tỏa Thiên Đạo";
d.hubPressureText.style.color=ap.daoBlockadeBroken?"#5cc995" :"#ff9f43";
} else {
const passed=ap.immortalAperture.subStageTribulationsPassed||0;
const req=ap.immortalAperture.subStageTribulationsRequired||
(ap.getManualTribulationRequirements?ap.getManualTribulationRequirements().tribulationsNeededForNextStage :8);
const tribPct=Math.min(100,(passed / Math.max(1,req))*100);
d.hubCultivateFill.style.width=`${tribPct}%`;
d.hubCultivateText.textContent=`${passed} / ${req} Tai Kiếp (Tổng: ${ap.immortalAperture.heavenlyTribulationsPassed})`;
d.hubPressureText.textContent=ap.daoLordPath
?`👑 Đạo Chủ ${ap.daoLordPath}`
:`Kiếp tự nhiên: ${Math.ceil(ap.immortalAperture.calamityCountdownDays)} ngày`;
d.hubPressureText.style.color=ap.daoLordPath?"#ffd700" :"";
}
const immRegen=typeof ap.getImmortalEssenceRegenPerSec==="function"?ap.getImmortalEssenceRegenPerSec() :0;
d.hubEssenceTitle.textContent=`${ap.getEssenceQualityName()} (+${immRegen.toFixed(2)}/s)`;
d.hubEssenceText.textContent=`${(ap.immortalEssence[ap.rank]||0).toFixed(2)} viên`;
d.hubEssenceCapMarker.classList.add("hidden");
d.hubEssenceFill.className=`progress-fill ${ap.getEssenceCssClass()}`;
d.hubEssenceFill.style.width="100%";
}
d.hubHpText.textContent=`${Math.ceil(pl.hp)}/${pl.maxHp}`;
d.hubMentalText.textContent=`${Math.floor(pl.mental)}/${pl.maxMental}`;
d.hubStonesCount.textContent=pl.primevalStones;
d.hubMeritCount.textContent=pl.meritPoints||0;
d.hubHumanQiCount.textContent=Math.floor(ap.humanQi);
d.hubImmortalStonesCount.textContent=pl.immortalStones||0;
}
_bindBattleScreenEvents() {
const d=this.dom;
if (d.btnRetreatToHub) {
d.btnRetreatToHub.addEventListener("click",()=>{
if (this.game) {
this.game.retreatToHub();
}
});
}
if (d.btnBattleUseStone) {
d.btnBattleUseStone.addEventListener("click",()=>{
if (!this.player|| !this.aperture) return;
if (this.aperture.isImmortal) {
if (this.player.getItemCount("immortal_stone")>0) {
const res=this.player.useItem("immortal_stone");
if (res.success) {
this.addLog(res.message,"cultivation");
if (this.combat) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 24,"+5 Tiên Nguyên!","#7ef7f0");
}
this.updateBattleHUD();
}
return;
}
if (this.player.primevalStones>=100) {
this.player.primevalStones -=100;
const r=this.aperture.rank||6;
this.aperture.immortalEssence[r]=Number(((this.aperture.immortalEssence[r]||0) + 0.8).toFixed(2));
if (this.combat) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 24,"+0.8 Tiên Nguyên (-100💎)","#7ef7f0");
}
this.updateBattleHUD();
return;
}
this.addLog("Không còn Tiên Nguyên Thạch (hoặc 100 Nguyên Thạch) để hồi nhanh Tiên Nguyên!","warning");
return;
}
if (this.player.primevalStones<=0) {
this.addLog("Không còn Nguyên Thạch để hồi Chân Nguyên!","warning");
return;
}
const res=this.aperture.absorbPrimevalStone(1);
if (res.success) {
this.player.primevalStones -=1;
if (this.combat) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 24,`+${res.restored}% Chân Nguyên`,"#38c992");
}
this.updateBattleHUD();
}
});
}
if (d.btnBattleUseHerb) {
d.btnBattleUseHerb.addEventListener("click",()=>{
const herbId=this.player.getItemCount("spirit_herb")>0?"spirit_herb" :"ration_meat";
const res=this.player.useItem(herbId);
if (res.success&&this.combat) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 24,"+Sinh Mệnh","#4cd964");
}
this.updateBattleHUD();
});
}
if (d.guQuickbar) {
d.guQuickbar.querySelectorAll(".gu-slot").forEach(slotEl=>{
slotEl.addEventListener("click",()=>{
const slotIdx=parseInt(slotEl.getAttribute("data-slot"),10);
if (this.combat) this.combat.activateGuSlot(slotIdx);
});
});
}
if (d.killerQuickbar) {
d.killerQuickbar.querySelectorAll(".killer-slot").forEach(kSlotEl=>{
kSlotEl.addEventListener("click",()=>{
const kIdx=parseInt(kSlotEl.getAttribute("data-kslot"),10);
if (this.combat) this.combat.activateKillerMoveSlot(kIdx);
});
});
}
if (d.btnReplayStage) {
d.btnReplayStage.addEventListener("click",()=>{
d.stageVictoryModal.classList.add("hidden");
if (this.game&&this.game.activeStage) {
this.game.enterStageBattle(this.game.activeStage.id);
}
});
}
if (d.btnVictoryReturnHub) {
d.btnVictoryReturnHub.addEventListener("click",()=>{
d.stageVictoryModal.classList.add("hidden");
if (this.game) {
this.game.retreatToHub();
}
});
}
const bQBag=document.getElementById("btn-battle-quick-bag");
if (bQBag) bQBag.addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("bag");});
const bQAp=document.getElementById("btn-battle-quick-aperture");
if (bQAp) bQAp.addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("gu");});
if (d.btnZoomOut) {
d.btnZoomOut.addEventListener("click",()=>{
if (this.game) this.game.adjustBattleZoom(-0.15);
});
}
if (d.btnZoomReset) {
d.btnZoomReset.addEventListener("click",()=>{
if (this.game) this.game.setBattleZoom(1.0,true);
});
}
if (d.btnZoomIn) {
d.btnZoomIn.addEventListener("click",()=>{
if (this.game) this.game.adjustBattleZoom(0.15);
});
}
if (d.btnDefeatRespawnHub) {
d.btnDefeatRespawnHub.addEventListener("click",()=>{
if (d.battleDefeatModal) d.battleDefeatModal.classList.add("hidden");
if (this.game) this.game.respawnAfterCombatDeath();
});
}
if (d.btnPermadeathNewLife) {
d.btnPermadeathNewLife.addEventListener("click",()=>{
if (d.permadeathModal) d.permadeathModal.classList.add("hidden");
if (this.game) this.game.returnToCharacterCreationAfterPermadeath();
});
}
}
_ensureNpcInteractionModal() {
let modal=document.getElementById("npc-interaction-modal");
if (!modal&&this.dom.battleScreen) {
modal=document.createElement("div");
modal.id="npc-interaction-modal";
modal.className="modal-backdrop hidden";
modal.innerHTML=`
<div class="modal-window" style="max-width: 580px;">
<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
<h2 id="npc-modal-title">🤝 Giao Lưu Cổ Sư</h2>
<button id="btn-close-npc-modal" class="btn-mini">✕ Đóng</button>
</div>
<div class="modal-body" id="npc-modal-body"></div>
</div>
                `;
this.dom.battleScreen.appendChild(modal);
}
this.dom.npcInteractionModal=modal;
this.dom.npcModalTitle=document.getElementById("npc-modal-title");
this.dom.npcModalBody=document.getElementById("npc-modal-body");
const btnClose=document.getElementById("btn-close-npc-modal");
if (btnClose&& !btnClose._boundClose) {
btnClose._boundClose=true;
btnClose.addEventListener("click",()=>this.closeNpcInteractionModal());
}
return modal;
}
openNpcInteractionModal(npc) {
if (!npc||npc.isDead|| !this.player) return;
const modal=this._ensureNpcInteractionModal();
if (!modal) return;
this.activeInteractingNpc=npc;
const greeting=typeof npc.getGreetingDialogue==="function"
?npc.getGreetingDialogue(this.player)
:`Tại hạ là ${npc.name} thuộc ${npc.factionName}.`;
const npcTier=(this.game&&this.game.questManager)
?this.game.questManager.getNpcRelationTier(npc.relation)
:{label:"Quen Biết",color:"#e6dfd5",discount:0};
const discount=Math.min(0.45,(this.player.tradeDiscount||0) + (npcTier.discount||0));
const shopItems=Array.isArray(npc.shopInventory)?npc.shopInventory :[];
const shopHtml=shopItems.length===0
?`<p class="sub-text">Hiện tại đạo hữu này không có vật phẩm nào mang ra trao đổi.</p>`
:shopItems.map((entry,idx)=>{
const finalPrice=Math.max(1,Math.round(entry.price*(1 - discount)));
const canBuy=entry.stock>0&&this.player.primevalStones>=finalPrice;
return `
<div class="list-card" style="flex-direction:row;justify-content:space-between;align-items:center;gap:10px;">
<div>
<strong>${escapeHtml(entry.icon||"📦")} ${escapeHtml(entry.name)}</strong> <span class="badge">Còn: ${Number(entry.stock)||0}</span>
<p class="sub-text">${escapeHtml(entry.desc||"")}</p>
</div>
<button class="btn-mini btn-npc-buy" data-item-idx="${idx}" ${canBuy?"" :"disabled"}>
                                ${entry.stock<=0?"Hết hàng" :`Mua (💎 ${finalPrice})`}
</button>
</div>
                    `;
}).join("");
if (this.dom.npcModalTitle) {
_clearEl(this.dom.npcModalTitle);
this.dom.npcModalTitle.appendChild(document.createTextNode(`🤝 ${npc.name||"Cổ Sư"} — `));
const sub=document.createElement("span");
sub.className="sub-text";
sub.textContent=`${npc.title||"Tán Tu"} (${npc.rank||1} Chuyển)`;
this.dom.npcModalTitle.appendChild(sub);
}
if (this.dom.npcModalBody) {
this.dom.npcModalBody.innerHTML=`
<div class="recipe-preview-box">
<p><strong>Thế lực:</strong> ${escapeHtml(npc.factionName)} | <strong>Tư chất:</strong> ${escapeHtml(npc.aptitude||"Ất Đẳng")} | <strong>Quan hệ:</strong> <span style="color:${npcTier.color};font-weight:bold;">${escapeHtml(npcTier.label)} (${Number(npc.relation)||0}, -${Math.round((npcTier.discount||0)*100)}% giá)</span></p>
<p><strong>Trạng thái:</strong> ${escapeHtml(npc.aiStateText||"Đang du lịch")} | <strong>Tài sản NPC:</strong> 💎 ${Number(npc.primevalStones)||0} Nguyên Thạch</p>
<p class="mt-5" style="color:#7ef7f0;font-style:italic;">"${escapeHtml(greeting)}"</p>
</div>

<h3 style="font-size:14px;color:#e2bf75;margin:10px 0 6px 0;">⚖️ Vật Phẩm & Cổ Trùng Đang Giao Dịch (Đang có: 💎 ${this.player.primevalStones} Nguyên Thạch)</h3>
<div class="scroll-list" style="max-height:190px;">
                        ${shopHtml}
</div>

<div class="action-row mt-15" style="justify-content:space-between;">
<button id="btn-npc-gift" class="btn-primary">🎁 Tặng Quà (+Hảo Cảm)</button>
<button id="btn-npc-quest" class="btn-accent">📜 Nhận Ủy Thác Nhiệm Vụ</button>
<button id="btn-npc-spar" class="btn-secondary">⚔️ Tỷ Thí Cổ Thuật</button>
<button id="btn-npc-kill" class="btn-danger">🩸 Sát Nhân Đoạt Cổ</button>
</div>
                `;
this.dom.npcModalBody.querySelectorAll(".btn-npc-buy").forEach(btn=>{
btn.addEventListener("click",()=>{
const idx=parseInt(btn.getAttribute("data-item-idx"),10);
if (!this.enemies) return;
const res=this.enemies.buyFromNpc(npc,idx,this.player,this.guSystem);
this.addLog(res.message,res.success?"loot" :"warning");
if (res.success&&this.combat) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 24,"Giao Dịch Thành Công!","#5cc995");
}
this.openNpcInteractionModal(npc);
this.updateBattleHUD();
});
});
const btnGift=document.getElementById("btn-npc-gift");
if (btnGift) {
btnGift.addEventListener("click",()=>{
if (!this.game|| !this.game.questManager) return;
const giftPool=["moon_orchid","spirit_herb","hundred_year_ginseng","soul_crystal","ration_meat"];
const foundItem=giftPool.find(id=>this.player.getItemCount(id)>0);
if (!foundItem) {
this.addLog("Không còn thảo dược / cổ tài để tặng cho đạo hữu này!","warning");
return;
}
const res=this.game.questManager.giftNpc(npc,foundItem);
this.addLog(res.message,res.success?"cultivation" :"warning");
if (res.success&&this.combat) {
this.combat.spawnFloatingText(npc.x,npc.y - 26,"🎁 Hảo Cảm Tăng!","#ffd700");
}
this.openNpcInteractionModal(npc);
});
}
const btnQuest=document.getElementById("btn-npc-quest");
if (btnQuest) {
btnQuest.addEventListener("click",()=>{
if (!this.enemies) return;
const res=this.enemies.assignDynamicQuestFromNpc(npc);
this.addLog(res.message,"cultivation");
if (this.combat) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 26,"📜 Nhận Ủy Thác Mới!","#ffd700");
}
this.closeNpcInteractionModal();
});
}
const btnSpar=document.getElementById("btn-npc-spar");
if (btnSpar) {
btnSpar.addEventListener("click",()=>{
if (typeof npc.becomeHostile==="function") {
npc.becomeHostile(false);
}
this.addLog(`⚔️ Ngươi chắp tay mời [${npc.name}] tỷ thí cổ thuật! Đánh giảm máu đối phương xuống dưới 22% để phân thắng bại.`,"combat");
if (this.combat) {
this.combat.spawnFloatingText(npc.x,npc.y - 26,"Bắt Đầu Tỷ Thí!","#5aa9e6");
}
this.closeNpcInteractionModal();
});
}
const btnKill=document.getElementById("btn-npc-kill");
if (btnKill) {
btnKill.addEventListener("click",()=>{
if (typeof npc.becomeHostile==="function") {
npc.becomeHostile(true);
}
this.player.alignment -=15;
if (this.game&&this.game.bountySystem) this.game.bountySystem.onNpcAttacked(npc);
this.addLog(`🩸 Ngươi bất ngờ ra tay sát phạt [${npc.name}] để đoạt Nguyên Thạch và Cổ Trùng!`,"danger");
if (this.combat) {
this.combat.spawnFloatingText(npc.x,npc.y - 26,"Tử Chiến Đoạt Cổ!","#ff4d4d");
}
this.closeNpcInteractionModal();
});
}
}
modal.classList.remove("hidden");
}
closeNpcInteractionModal() {
this.activeInteractingNpc=null;
const modal=this.dom.npcInteractionModal||document.getElementById("npc-interaction-modal");
if (modal) {
modal.classList.add("hidden");
}
}
updateBattleHUD() {if (this.battleUI) this.battleUI.updateBattleHUD();}
renderBeastArmyTab() {if (global.BeastArmyUI) global.BeastArmyUI.renderBeastArmyTab.call(this);}
updateBattleBeastBar(force=false) {if (global.BeastArmyUI) global.BeastArmyUI.updateBattleBeastBar.call(this,force);}
renderGuHouseTab() {if (global.GuHouseUI) global.GuHouseUI.renderGuHouseTab.call(this);}
updateBattleGuHouseBar(force=false) {if (global.GuHouseUI) global.GuHouseUI.updateBattleGuHouseBar.call(this,force);}
renderBountyPanel(host) {if (global.BountyUI) global.BountyUI.renderBountyPanel.call(this,host);}
updateBattleBountyAlert() {if (global.BountyUI) global.BountyUI.updateBattleBountyAlert.call(this);}
renderBlessedLandTab() {if (global.BlessedLandUI) global.BlessedLandUI.renderBlessedLandTab.call(this);}
renderReverseFlowTab() {if (global.ReverseFlowUI) global.ReverseFlowUI.renderReverseFlowTab.call(this);}
updateQuickbars() {if (this.battleUI) this.battleUI.updateQuickbars();}
showStageVictoryModal(stage,rewardData) {if (this.battleUI) this.battleUI.showStageVictoryModal(stage,rewardData);}
updateInteractionBanner(promptInfo) {if (this.battleUI) this.battleUI.updateInteractionBanner(promptInfo);}
showBattleDefeatModal(stageName,penalty) {if (this.battleUI) this.battleUI.showBattleDefeatModal(stageName,penalty);}
showPermadeathModal(reason) {if (this.battleUI) this.battleUI.showPermadeathModal(reason);}
updateKeybindLabels() {
const st=global.vanCoSettings;
const hybridAlts={0:"Q",2:"R",3:"T",7:"F"};
for (let i=0;i<8;i++) {
const el=document.getElementById(`key-label-gu-${i}`);
if (!el) continue;
const primary=st?st.getKeyLabel(`gu${i}`) :String(i + 1);
const alt=(this.keybindMode!=="numbers"&&hybridAlts[i]&&hybridAlts[i]!==primary)?`/${hybridAlts[i]}` :"";
el.textContent=`${primary}${alt}`;
}
for (let k=0;k<4;k++) {
const kEl=document.querySelector(`.killer-slot[data-kslot="${k}"] .slot-key`);
if (kEl) kEl.textContent=st?st.getKeyLabel(`killer${k}`) :["Z","X","C","V"][k];
}
}
updateZoomDisplay(zoomVal) {
if (this.dom.btnZoomReset) {
this.dom.btnZoomReset.textContent=`${Math.round((zoomVal||1.0)*100)}%`;
}
}
updateAutoSaveIndicator(timeStr,isError=false) {
if (this.dom.hubAutoSaveStatus) {
this.dom.hubAutoSaveStatus.textContent=isError?`⚠️ ${timeStr}` :`Đã lưu ${timeStr}`;
this.dom.hubAutoSaveStatus.style.color=isError?"#ff6b6b" :"";
}
if (this.dom.settingsAutoSaveInfo) {
this.dom.settingsAutoSaveInfo.textContent=isError
?`❌ Lưu tự động thất bại (${timeStr}). Hãy xóa bớt Ô Lưu cũ hoặc bấm 'Xuất File Lưu (.json)' về máy ngay!`
:`Đã tự động lưu trực tiếp trên trình duyệt lúc ${timeStr}. Tiến trình được bảo vệ ngay cả khi bạn quên bấm Lưu.`;
this.dom.settingsAutoSaveInfo.style.color=isError?"#ff8a8a" :"";
}
}
refreshStartScreenContinueButton() {
const btn=this.dom.btnLoadExisting;
if (!btn|| !this.game||typeof this.game.getAutoSaveSummary!=="function") return;
const summary=this.game.getAutoSaveSummary();
if (!summary) {
btn.textContent="Đọc Lưu Trữ Trình Duyệt";
btn.classList.remove("btn-accent");
btn.classList.add("btn-secondary");
} else if (summary.isPermadead) {
btn.textContent=summary.label;
btn.classList.remove("btn-accent");
btn.classList.add("btn-secondary");
} else {
btn.textContent=`▶️ Tiếp Tục: ${summary.label}`;
btn.classList.remove("btn-secondary");
btn.classList.add("btn-accent");
}
let recoveryBanner=document.getElementById("creation-crash-recovery-banner");
if (this.game.crashRecoveryNotice) {
if (!recoveryBanner&&btn.parentElement) {
recoveryBanner=document.createElement("p");
recoveryBanner.id="creation-crash-recovery-banner";
recoveryBanner.style.cssText="margin-top:8px;padding:8px 10px;border:1px solid #e2bf75;background:rgba(45,35,12,0.75);color:#ffd700;font-size:12px;border-radius:4px;";
btn.parentElement.insertAdjacentElement("afterend",recoveryBanner);
}
if (recoveryBanner) {
recoveryBanner.textContent=this.game.crashRecoveryNotice;
recoveryBanner.classList.remove("hidden");
}
} else if (recoveryBanner) {
recoveryBanner.classList.add("hidden");
}
}
updateMarketCountdownText() {
if (!this.game||typeof this.game.getMarketRemainingSeconds!=="function") return;
const rem=this.game.getMarketRemainingSeconds();
const mm=String(Math.floor(rem / 60)).padStart(2,"0");
const ss=String(rem % 60).padStart(2,"0");
const timeStr=`${mm}:${ss}`;
if (this.dom.marketResetCountdown) {
this.dom.marketResetCountdown.textContent=timeStr;
}
if (this.dom.marketCycleNum&&this.game.marketRotation) {
this.dom.marketCycleNum.textContent=`#${this.game.marketRotation.cycleId||1}`;
}
if (this.dom.treasuryResetCountdown) {
this.dom.treasuryResetCountdown.textContent=`⏳ ${timeStr}`;
}
if (this.activeHubTab==="tab-aperture"&&this.aperture&&this.aperture.isImmortal&&this.dom.btnCollectApertureYield) {
const yRem=typeof this.aperture.getApertureYieldCooldownRemaining==="function"
?this.aperture.getApertureYieldCooldownRemaining()
:0;
if (yRem>0) {
const ym=Math.floor(yRem / 60);
const ys=String(yRem % 60).padStart(2,"0");
this.dom.btnCollectApertureYield.disabled=true;
this.dom.btnCollectApertureYield.textContent=`⏳ Tái Sinh Sản Vật (${ym}:${ys})`;
} else {
this.dom.btnCollectApertureYield.disabled=false;
this.dom.btnCollectApertureYield.textContent="🌱 Thu Hoạch Sản Vật Tiên Khiếu (Hồi 3 phút)";
}
}
}
resetCreationScreenToForm() {
const d=this.dom;
if (d.stepForm) d.stepForm.classList.remove("hidden");
if (d.stepRitual) d.stepRitual.classList.add("hidden");
if (d.aptitudeResultBox) d.aptitudeResultBox.classList.add("hidden");
if (d.btnNextRitual) d.btnNextRitual.classList.remove("hidden");
if (d.btnEnterHub) d.btnEnterHub.classList.add("hidden");
this.renderCreationSkinPreview();
}
}
UIManager.getMarketCatalogs=function () {
return {
caravan:CARAVAN_SHOP_ITEMS,
auction:AUCTION_HOUSE_ITEMS,
treasure_heaven:TREASURE_YELLOW_HEAVEN_ITEMS,
clan_treasury:CLAN_TREASURY_ITEMS
};
};
UIManager.escapeHtml=escapeHtml;
UIManager._clearEl=_clearEl;
UIManager._setEmptyHint=_setEmptyHint;
UIManager._setSubSpan=_setSubSpan;
global.UIManager=UIManager;
UIManager._helpers={escapeHtml,_clearEl,_setEmptyHint,_setSubSpan};
})(window);
