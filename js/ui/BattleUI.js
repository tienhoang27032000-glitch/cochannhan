(function (global) {
"use strict";
function esc(val) {
if (val===null||val===undefined) return "";
return String(val)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#39;");
}
function _updateBattleHUD() {
if (!this.player|| !this.aperture) return;
const d=this.dom;
const pl=this.player;
const ap=this.aperture;
d.battlePlayerName.textContent=pl.name;
d.battleRealmBadge.textContent=ap.getRealmDisplayName();
const hpPct=Math.max(0,Math.min(100,(pl.hp / pl.maxHp)*100));
d.battleHpText.textContent=`${Math.ceil(pl.hp)} / ${pl.maxHp}`;
d.battleHpFill.style.width=`${hpPct}%`;
d.battleEssenceName.textContent=ap.getEssenceQualityName();
d.battleEssenceFill.className=`progress-fill ${ap.getEssenceCssClass()}`;
if (!ap.isImmortal) {
const curEss=Number(ap.currentEssence.toFixed(1));
const maxCap=ap.aptitude.maxSeaPercent;
d.battleEssenceText.textContent=`${curEss}% / ${maxCap}%`;
d.battleEssenceCapMarker.style.left=`${maxCap}%`;
d.battleEssenceCapMarker.classList.remove("hidden");
d.battleEssenceFill.style.width=`${curEss}%`;
} else {
const immRegen=typeof ap.getImmortalEssenceRegenPerSec==="function"?ap.getImmortalEssenceRegenPerSec() :0;
d.battleEssenceName.textContent=`${ap.getEssenceQualityName()} (+${immRegen.toFixed(2)}/s)`;
d.battleEssenceText.textContent=`${(ap.immortalEssence[ap.rank]||0).toFixed(2)} viên`;
d.battleEssenceCapMarker.classList.add("hidden");
d.battleEssenceFill.style.width="100%";
}
if (d.battlePressureWarning&&d.battlePressureVal) {
const isTenExtremeActive= !ap.isImmortal&&ap.aptitude&&ap.aptitude.physique&& !ap.tenExtremeSealed;
if (isTenExtremeActive) {
const pVal=Number(ap.wallPressure.toFixed(1));
const freezeSuffix=(ap.pressureFreezeTimer||0)>0?` ⏳${Math.ceil(ap.pressureFreezeTimer)}s` :"";
d.battlePressureVal.textContent=`${pVal.toFixed(1)}%${freezeSuffix}`;
d.battlePressureWarning.classList.remove("hidden");
d.battlePressureWarning.classList.toggle("critical",pVal>=80&&(ap.pressureFreezeTimer||0)<=0);
} else {
d.battlePressureWarning.classList.add("hidden");
}
}
if (d.battleActiveBuffs) {
const buffSig=pl.activeBuffs.map(b=>`${b.name||""}:${Math.ceil(b.duration)}`).join("|");
if (this._lastBattleBuffSig!==buffSig) {
this._lastBattleBuffSig=buffSig;
global.UIManager._clearEl(d.battleActiveBuffs);
for (const b of pl.activeBuffs) {
const badge=document.createElement("div");
badge.className="buff-badge";
badge.textContent=`${b.icon||"✨"} ${b.name||"Cổ Thuật"} (${Math.ceil(b.duration)}s)`;
d.battleActiveBuffs.appendChild(badge);
}
}
}
if (this.game&&this.game.activeStage) {
const st=this.game.activeStage;
d.battleStageTitle.textContent=`${st.icon} ${st.name}`;
if (st.isSpecialResourceStage||st.noBoss) {
global.UIManager._clearEl(d.battleStageObjective);
const tag=document.createElement("span");
tag.style.color="#7ef7c4";
tag.textContent="🌾 Farm Tự Do (Không Boss)";
const kEl=document.createElement("strong");
kEl.textContent=String(st.kills||0);
const hEl=document.createElement("strong");
hEl.textContent=String(st.harvests||0);
d.battleStageObjective.append(
tag,
document.createTextNode(" | Diệt: "),
kEl,
document.createTextNode(" quái | Khai thác: "),
hEl,
document.createTextNode(" mỏ — Rút lui bất cứ lúc nào!")
);
const cyclePct=st.kills>0&&st.kills % 10===0?100 :((st.kills % 10) / 10)*100;
d.battleStageProgressFill.style.width=`${cyclePct}%`;
} else if (!st.bossSpawned) {
const mobListStr=(Array.isArray(st.mobPool)&&st.mobPool.length>0)?st.mobPool.map(m=>m.name).join(", ") :st.mobName;
d.battleStageObjective.textContent=`Mục tiêu: Tiêu diệt ${st.kills}/${st.targetKills} mục tiêu (${mobListStr}; Tinh Anh +2) để dẫn dụ Thủ Lĩnh xuất hiện`;
const pct=Math.min(100,(st.kills / st.targetKills)*100);
d.battleStageProgressFill.style.width=`${pct}%`;
} else if (!st.bossDefeated) {
global.UIManager._clearEl(d.battleStageObjective);
const strongObj=document.createElement("strong");
if (st.bossTotalCount>1&&this.enemies&&Array.isArray(this.enemies.beasts)) {
const activeBosses=this.enemies.beasts.filter(b=>b.isStageBoss&& !b.isDead);
const bossStatusStr=activeBosses.map(b=>{
const bPct=Math.ceil((b.hp / Math.max(1,b.maxHp))*100);
const shText=b.shieldHp>0?" [🛡️Khiên]" :"";
return `${b.name.split(" (")[0]}: ${bPct}% HP${shText}`;
}).join(" | ");
const isVenBattle=Array.isArray(st.venerableBosses)&&st.venerableBosses.length>0;
strongObj.style.color=isVenBattle?"#00e5ff" :"#ff8a65";
strongObj.textContent=isVenBattle
?`👑 ĐỘC CHIẾN SONG TÔN (Còn ${st.bossesRemaining}/${st.bossTotalCount}): ${bossStatusStr}`
:`⚔️ THỦ LĨNH XUẤT TRẬN (Còn ${st.bossesRemaining}/${st.bossTotalCount}): ${bossStatusStr}`;
} else {
strongObj.style.color="#ff6b6b";
strongObj.textContent=`⚠️ THỦ LĨNH XUẤT HIỆN: Hãy trảm sát 【${st.bossName}】!`;
}
d.battleStageObjective.appendChild(strongObj);
d.battleStageProgressFill.style.width="100%";
} else {
d.battleStageObjective.textContent="🎉 Đã hoàn thành chinh phạt bản đồ!";
}
}
this.updateQuickbars();
if (typeof this.updateBattleBeastBar==="function") this.updateBattleBeastBar(false);
if (typeof this.updateBattleGuHouseBar==="function") this.updateBattleGuHouseBar(false);
if (typeof this.updateBattleBountyAlert==="function") this.updateBattleBountyAlert();
if (global.vanCoMobileControls&&typeof global.vanCoMobileControls.requestSync==="function") {
global.vanCoMobileControls.requestSync(false);
}
}
function _updateQuickbars() {
if (!this.guSystem|| !this.aperture|| !this.dom.guQuickbar) return;
if (!this._cachedGuSlotRefs) {
this._cachedGuSlotRefs=Array.from(this.dom.guQuickbar.querySelectorAll(".gu-slot")).map(slotEl=>({
slotEl,
iconEl:slotEl.querySelector(".slot-icon"),
costEl:slotEl.querySelector(".slot-cost"),
cdOverlay:slotEl.querySelector(".cooldown-overlay"),
noEssenceEl:slotEl.querySelector(".no-essence-overlay")
}));
}
this._cachedGuSlotRefs.forEach(({iconEl,costEl,cdOverlay,noEssenceEl},idx)=>{
const gu=this.guSystem.getEquippedGuAt(idx);
if (!gu) {
if (iconEl.dataset.guArtKey!=="") {
iconEl.dataset.guArtKey="";
iconEl.textContent="";
}
costEl.textContent="";
cdOverlay.style.height="0%";
noEssenceEl.classList.add("hidden");
return;
}
const artKey=`${gu.id}_${gu.rank||1}`;
if (iconEl.dataset.guArtKey!==artKey) {
iconEl.dataset.guArtKey=artKey;
if (global.vanCoGuArt) {
iconEl.innerHTML=global.vanCoGuArt.renderImgHtml(gu,34,"gu-slot-art");
} else {
iconEl.textContent=gu.icon;
}
}
const costCalc=this.aperture.calculateEssenceCost(gu.essenceCost,gu.rank,gu.path);
costEl.textContent=costCalc.isImmortalCost?`${costCalc.cost}T` :`${costCalc.cost}%`;
const cdRem=this.combat?this.combat.getGuCooldownRemaining(gu.instanceId) :0;
const cdPct=gu.cooldown>0?Math.min(100,(cdRem / gu.cooldown)*100) :0;
cdOverlay.style.height=`${cdPct}%`;
const enough=this.aperture.hasEnoughEssence(gu.essenceCost,gu.rank,gu.path);
noEssenceEl.classList.toggle("hidden",enough);
});
if (!this._cachedKillerSlotRefs) {
this._cachedKillerSlotRefs=Array.from(this.dom.killerQuickbar.querySelectorAll(".killer-slot")).map(kSlotEl=>({
kSlotEl,
iconEl:kSlotEl.querySelector(".slot-icon"),
costEl:kSlotEl.querySelector(".slot-cost"),
cdOverlay:kSlotEl.querySelector(".cooldown-overlay")
}));
}
this._cachedKillerSlotRefs.forEach(({iconEl,costEl,cdOverlay},idx)=>{
const move=this.guSystem.getEquippedKillerMoveAt(idx);
if (!move) {
if (iconEl.dataset.kmArtKey!=="") {
iconEl.dataset.kmArtKey="";
iconEl.textContent="";
}
costEl.textContent="";
cdOverlay.style.height="0%";
return;
}
const coreGuId=(Array.isArray(move.requiredGuIds)&&move.requiredGuIds[0])||"";
const kmRank0=move.moveRank||(move.isImmortal?6 :1);
const kmKey=coreGuId?`${coreGuId}_${kmRank0}` :`em_${move.icon||"☯"}`;
if (iconEl.dataset.kmArtKey!==kmKey) {
iconEl.dataset.kmArtKey=kmKey;
if (coreGuId&&global.vanCoGuArt) {
iconEl.innerHTML=global.vanCoGuArt.renderImgHtml(coreGuId,34,"gu-slot-art gu-km-art",kmRank0);
} else {
iconEl.textContent=move.icon||"☯";
}
}
const kmRank=move.moveRank||(move.isImmortal?6 :1);
const kmCostCalc=this.aperture.calculateEssenceCost(move.essenceCost,kmRank,move.path);
costEl.textContent=kmCostCalc.isImmortalCost?`${kmCostCalc.cost}T` :`${kmCostCalc.cost}%`;
const cdRem=this.combat?this.combat.getKillerMoveCooldownRemaining(move.id) :0;
const cdPct=move.cooldown>0?Math.min(100,(cdRem / move.cooldown)*100) :0;
cdOverlay.style.height=`${cdPct}%`;
});
}
function _showStageVictoryModal(stage,rewardData) {
const d=this.dom;
if (!d.stageVictoryModal|| !d.stageRewardSummary) return;
d.stageResultTitle.textContent=`🎉 Chinh Phạt 【${stage?stage.name :"Bản Đồ"}】 Thành Công!`;
global.UIManager._clearEl(d.stageRewardSummary);
if (rewardData&&typeof rewardData==="object") {
const intro=document.createElement("p");
const bStrong=document.createElement("strong");
bStrong.textContent=rewardData.bossName||"";
const sStrong=document.createElement("strong");
sStrong.textContent=rewardData.stageName||"";
const cSpan=document.createElement("span");
cSpan.style.color=rewardData.clearTypeColor||"#ffd700";
cSpan.textContent=rewardData.clearTypeText||"";
intro.append(
document.createTextNode("Chúc mừng đạo hữu đã đánh bại "),
bStrong,
document.createTextNode(" tại "),
sStrong,
document.createTextNode("! "),
cSpan
);
d.stageRewardSummary.appendChild(intro);
const list=document.createElement("div");
list.className="info-list mt-10";
const addRow=(label,value,cls="highlight-gold",color=null)=>{
const row=document.createElement("div");
row.className="info-row";
const lSpan=document.createElement("span");
lSpan.textContent=label;
const vEl=document.createElement("strong");
if (cls) vEl.className=cls;
if (color) vEl.style.color=color;
vEl.textContent=value;
row.append(lSpan,vEl);
list.appendChild(row);
};
const _stBonusTxt=rewardData.stoneBonusPct>0?` (+${rewardData.stoneBonusPct}% thưởng)` :"";
addRow("💎 Nguyên Thạch thu được:",`+${Number(rewardData.actualStones||0).toLocaleString("vi-VN")}${_stBonusTxt}`);
addRow("🏅 Điểm Cống Hiến Thế Lực:",`+${Number(rewardData.actualMerit||0).toLocaleString("vi-VN")}`);
addRow("☯ Nhân Khí tích lũy:",`+${rewardData.actualHumanQi||0}`);
addRow(`🪲 Cổ Trùng ngẫu nhiên (${rewardData.stageRank||1} Chuyển, 0–2 con):`,rewardData.guRewardText||"0 con","","#ffd700");
addRow("🎁 Vật phẩm rơi ra (Xá Lợi Cổ 1%):",rewardData.itemsText||"Không rơi thêm bảo vật hiếm","","#5cc995");
d.stageRewardSummary.appendChild(list);
} else {
const p=document.createElement("p");
p.textContent=String(rewardData||"Đã hoàn thành chinh phạt bản đồ!");
d.stageRewardSummary.appendChild(p);
}
d.stageVictoryModal.classList.remove("hidden");
}
function _updateInteractionBanner(promptInfo) {
if (!this.dom.interactionPrompt) return;
if (promptInfo) {
global.UIManager._clearEl(this.dom.interactionPrompt);
if (typeof promptInfo==="object"&&promptInfo.target) {
const keyBadge=document.createElement("span");
keyBadge.className="key-badge";
keyBadge.textContent="E";
const targetEl=document.createElement("strong");
targetEl.textContent=String(promptInfo.target);
this.dom.interactionPrompt.append(
document.createTextNode("Nhấn "),
keyBadge,
document.createTextNode(` ${promptInfo.action||"tương tác"} `),
targetEl
);
} else {
this.dom.interactionPrompt.textContent=String(promptInfo);
}
this.dom.interactionPrompt.classList.remove("hidden");
} else {
this.dom.interactionPrompt.classList.add("hidden");
}
if (global.vanCoMobileControls&&typeof global.vanCoMobileControls.requestSync==="function") {
global.vanCoMobileControls.requestSync(false);
}
}
function _showBattleDefeatModal(stageName,penalty) {
const d=this.dom;
if (!d.battleDefeatModal|| !d.battleDefeatSummary) return;
global.UIManager._clearEl(d.battleDefeatSummary);
const p1=document.createElement("p");
const stEl=document.createElement("strong");
stEl.className="highlight-gold";
stEl.textContent=String(stageName||"Chiến Trường");
p1.append(document.createTextNode("Ngươi đã cạn kiệt Sinh Mệnh (0 HP) khi chiến đấu tại "),stEl,document.createTextNode("!"));
d.battleDefeatSummary.appendChild(p1);
const box=document.createElement("div");
box.className="mt-10";
const headP=document.createElement("p");
const headStrong=document.createElement("strong");
headStrong.textContent="⚖️ Hình Phạt Tổn Thất Tu Vi:";
headP.appendChild(headStrong);
box.appendChild(headP);
const lines=(penalty&&Array.isArray(penalty.details)&&penalty.details.length>0)
?penalty.details
:["Đạo cơ chấn động, tổn thất một phần tiến độ tu luyện."];
for (const line of lines) {
const lp=document.createElement("p");
lp.style.color="#ff9c9c";
lp.textContent=`• ${line}`;
box.appendChild(lp);
}
const realmP=document.createElement("p");
realmP.className="mt-5";
const realmStrong=document.createElement("strong");
realmStrong.className="highlight-gold";
realmStrong.textContent=penalty&&penalty.newRealmName?penalty.newRealmName :(this.aperture?this.aperture.getRealmDisplayName() :"---");
realmP.append(document.createTextNode("Cảnh giới hiện tại: "),realmStrong);
box.appendChild(realmP);
d.battleDefeatSummary.appendChild(box);
d.battleDefeatModal.classList.remove("hidden");
}
function _showPermadeathModal(reason) {
const d=this.dom;
if (!d.permadeathModal|| !d.permadeathSummary) return;
if (d.battleDefeatModal) d.battleDefeatModal.classList.add("hidden");
if (d.stageVictoryModal) d.stageVictoryModal.classList.add("hidden");
this.closeNpcInteractionModal();
global.UIManager._clearEl(d.permadeathSummary);
const p1=document.createElement("p");
const s1=document.createElement("strong");
s1.style.color="#ff5252";
s1.style.fontSize="15px";
s1.textContent=`💀 ${this.player?this.player.name :"Cổ Sư"} đã tử vong vĩnh viễn!`;
p1.appendChild(s1);
const p2=document.createElement("p");
p2.className="mt-5";
const s2=document.createElement("strong");
s2.textContent="Nguyên nhân: ";
p2.append(s2,document.createTextNode(String(reason||"Không Khiếu bạo tạc!")));
const p3=document.createElement("p");
p3.className="mt-5";
const s3=document.createElement("strong");
s3.textContent="Cảnh giới lúc ngã xuống: ";
p3.append(s3,document.createTextNode(this.aperture?this.aperture.getRealmDisplayName() :"---"));
d.permadeathSummary.append(p1,p2,p3);
d.permadeathModal.classList.remove("hidden");
}
class BattleUI {
constructor(uiManager) {
this.ui=uiManager||null;
this.activeWorldSubtab="sect";
}
updateBattleHUD() {
if (!this.ui) return;
_updateBattleHUD.call(this.ui);
this._updateCreativeObjectiveBanner();
this._updateMomentumHudBar();
}
updateQuickbars() {if (this.ui) _updateQuickbars.call(this.ui);}
showStageVictoryModal(stage,rewardData) {if (this.ui) _showStageVictoryModal.call(this.ui,stage,rewardData);}
updateInteractionBanner(promptInfo) {if (this.ui) _updateInteractionBanner.call(this.ui,promptInfo);}
showBattleDefeatModal(stageName,penalty) {if (this.ui) _showBattleDefeatModal.call(this.ui,stageName,penalty);}
showPermadeathModal(reason) {if (this.ui) _showPermadeathModal.call(this.ui,reason);}
_updateCreativeObjectiveBanner() {
const ui=this.ui;
const game=ui&&ui.game;
if (!game|| !game.stageManager) return;
const mechText=game.stageManager.getObjectiveSummaryText();
const ev=game.eventManager&&game.eventManager.activeBattleEvent;
let bar=document.getElementById("battle-creative-mechanic-banner");
if (!mechText&& !ev) {
if (bar) bar.classList.add("hidden");
return;
}
if (!bar) {
const objEl=ui.dom&&ui.dom.battleStageObjective;
if (!objEl|| !objEl.parentElement) return;
bar=document.createElement("div");
bar.id="battle-creative-mechanic-banner";
bar.style.cssText="margin-top:4px;padding:3px 7px;border:1px solid rgba(255,215,0,0.45);background:rgba(12,18,28,0.82);border-radius:4px;font-size:11.5px;color:#ffd700;";
objEl.parentElement.appendChild(bar);
}
const parts=[];
if (mechText) parts.push(`🧩 ${mechText}`);
if (ev) parts.push(`🌟 ${ev.icon} ${ev.name} (${Math.ceil(ev.timer)}s)`);
bar.textContent=parts.join("   |   ");
bar.classList.remove("hidden");
}
_updateMomentumHudBar() {
const ui=this.ui;
const combat=ui&&ui.combat;
const buffsHost=ui&&ui.dom&&ui.dom.battleActiveBuffs;
if (!combat|| !buffsHost|| !buffsHost.parentElement) return;
let mRow=document.getElementById("battle-momentum-hud-row");
if (!mRow) {
mRow=document.createElement("div");
mRow.id="battle-momentum-hud-row";
mRow.className="momentum-hud-bar";
mRow.innerHTML=`
<div style="flex:1;">
<div class="progress-track" style="height:7px;">
<div id="battle-momentum-fill" class="progress-fill" style="width:0%;background:linear-gradient(90deg,#e67e22,#ffd700);"></div>
</div>
</div>
<button id="btn-battle-overdrive" class="btn-mini" style="padding:2px 7px;font-size:10.5px;">🔥 Chiến Ý 0%</button>
                `;
buffsHost.parentElement.insertBefore(mRow,buffsHost);
mRow.querySelector("#btn-battle-overdrive").addEventListener("click",()=>{
combat.activateBattleOverdrive();
});
}
const fill=mRow.querySelector("#battle-momentum-fill");
const btn=mRow.querySelector("#btn-battle-overdrive");
const isActive=combat.overdriveTimer>0;
const pct=isActive?Math.round((combat.overdriveTimer / 10)*100) :Math.round(combat.momentum||0);
if (fill) fill.style.width=`${Math.max(0,Math.min(100,pct))}%`;
if (btn) {
if (isActive) {
btn.textContent=`🔥 Bộc Phát ${combat.overdriveTimer.toFixed(1)}s`;
btn.classList.add("momentum-btn-ready");
} else if (pct>=100) {
btn.textContent="🔥 BỘC PHÁT [B]!";
btn.classList.add("momentum-btn-ready");
} else {
btn.textContent=`🔥 Chiến Ý ${pct}%`;
btn.classList.remove("momentum-btn-ready");
}
}
}
openTacticalBlessingModal(triggerTitle="Cơ Duyên Giữa Trận") {
const ui=this.ui;
const game=ui&&ui.game;
if (!game|| !game.combat||game.currentScreen!=="battle") return;
game.isBattlePaused=true;
let modal=document.getElementById("tactical-blessing-modal");
if (!modal) {
modal=document.createElement("div");
modal.id="tactical-blessing-modal";
modal.className="modal-backdrop hidden";
modal.style.zIndex="95";
modal.innerHTML=`
<div class="modal-window" style="max-width:600px;">
<div class="modal-header">
<h2 id="blessing-modal-title">✨ Cơ Duyên Chiến Thuật — Chọn 1 Phúc Duyên</h2>
</div>
<div class="modal-body" id="blessing-modal-body"></div>
</div>
                `;
document.body.appendChild(modal);
}
const titleEl=modal.querySelector("#blessing-modal-title");
const bodyEl=modal.querySelector("#blessing-modal-body");
if (titleEl) titleEl.textContent=`✨ ${triggerTitle} — Chọn 1 Phúc Duyên Chiến Đấu`;
const choices=[
{id:"bless_atk_surge",icon:"⚔️",name:"Sát Ý Lăng Lệ (+32% ATK)",desc:"Tăng +32% Công Kích toàn diện trong 45 giây để nhanh chóng phá Thế & trảm sát Boss!"},
{id:"bless_heal_shield",icon:"🛡️",name:"Phúc Duyên Hộ Đạo (Hồi 65% HP + 45% Khiên)",desc:"Lập tức hồi 65% Sinh Mệnh tối đa và khoác Hộ Thuẫn dày đặc 45% HP trong 30 giây!"},
{id:"bless_essence_fountain",icon:"🔥",name:"Bộc Phát Nguyên Tuyền (Đầy Nguyên + 100% Chiến Ý)",desc:"Lập tức bơm đầy 100% Biển Nguyên (hoặc +4 Tiên Nguyên) & nạp đầy 100% thanh Chiến Ý Bộc Phát!"}
];
bodyEl.innerHTML=`
<div style="display:grid;grid-template-columns:1fr;gap:10px;">
                    ${choices.map(ch=>`
<div class="blessing-choice-card" data-bless-id="${ch.id}">
<strong style="color:#ffd700;font-size:14.5px;">${ch.icon} ${esc(ch.name)}</strong>
<p class="sub-text mt-5">${esc(ch.desc)}</p>
</div>
                    `).join("")}
</div>
            `;
bodyEl.querySelectorAll(".blessing-choice-card").forEach(card=>{
card.addEventListener("click",()=>{
const bid=card.getAttribute("data-bless-id");
const picked=choices.find(c=>c.id===bid);
modal.classList.add("hidden");
game.isBattlePaused=false;
if (picked) game.combat.applyStageBlessing(picked);
});
});
modal.classList.remove("hidden");
}
openTribulationTrialModal() {
const ui=this.ui;
const game=ui&&ui.game;
if (!game|| !game.eventManager) return;
const startRes=game.eventManager.startTribulationTrial();
if (!startRes.success) {
ui.addLog(startRes.message,"warning");
return;
}
let modal=document.getElementById("tribulation-trial-modal");
if (!modal) {
modal=document.createElement("div");
modal.id="tribulation-trial-modal";
modal.className="modal-backdrop hidden";
modal.innerHTML=`
<div class="modal-window" style="max-width:560px;">
<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
<h2 id="trib-modal-title">⛈️ Thử Thách Thiên Kiếp</h2>
<button id="btn-close-trib-modal" class="btn-mini">✕ Hủy</button>
</div>
<div class="modal-body" id="trib-modal-body"></div>
</div>
                `;
document.body.appendChild(modal);
modal.querySelector("#btn-close-trib-modal").addEventListener("click",()=>{
if (game.apertureFX) game.apertureFX.stop();
game.eventManager.activeTribulation=null;
modal.classList.add("hidden");
});
}
this._renderTribulationModalStep(modal,startRes.trial,startRes.wave);
modal.classList.remove("hidden");
}
_renderTribulationModalStep(modal,trial,wave) {
const ui=this.ui;
const game=ui&&ui.game;
const titleEl=modal.querySelector("#trib-modal-title");
const bodyEl=modal.querySelector("#trib-modal-body");
if (titleEl) titleEl.textContent=`⛈️ ${trial.tribulationName} — Đợt ${trial.waveIndex + 1}/${trial.totalWaves}`;
if (!bodyEl) return;
const logsHtml=(trial.logs||[]).slice(-4).map(l=>`<p class="sub-text" style="margin:2px 0;">${esc(l)}</p>`).join("");
const choicesHtml=(wave.choices||[]).map(ch=>`
<button class="btn-secondary btn-trib-choice" data-choice="${esc(ch.id)}" style="width:100%;text-align:left;padding:9px 10px;margin-top:6px;">
                    ${esc(ch.label)}
</button>
            `).join("");
let fxCanvas=modal.querySelector("#trib-fx-canvas");
let stepHost=modal.querySelector("#trib-step-host");
if (!fxCanvas) {
bodyEl.innerHTML=`
<div class="afx-canvas-frame" style="margin-bottom:10px;">
<canvas id="trib-fx-canvas" width="540" height="205"></canvas>
<div class="afx-hud-badge-tl" id="trib-fx-badge-l">${esc(trial.tribulationName)}</div>
<div class="afx-hud-badge-tr" id="trib-fx-badge-r">Ổn Định: ${trial.integrity}%</div>
</div>
<div id="trib-step-host"></div>
                `;
fxCanvas=modal.querySelector("#trib-fx-canvas");
stepHost=modal.querySelector("#trib-step-host");
if (game.apertureFX) {
game.apertureFX.attachTribulationCanvas(fxCanvas,trial.tribulationName,trial.waveIndex);
}
}
const bR=modal.querySelector("#trib-fx-badge-r");
if (bR) bR.textContent=`Ổn Định: ${trial.integrity}%`;
stepHost.innerHTML=`
<div class="recipe-preview-box">
<p><strong style="color:#ffd700;">${esc(wave.name)}</strong></p>
<p class="sub-text mt-5">${esc(wave.desc)}</p>
<p class="mt-5">Độ Ổn Định Tiên Khiếu: <strong style="color:#5cc995">${trial.integrity}%</strong> | Thưởng Đạo Ngân Cộng Thêm: <strong style="color:#ffd700">+${Math.round(trial.bonusDaoPct*100)}%</strong></p>
</div>
<div class="mt-10">${choicesHtml}</div>
<div class="mt-10" style="border-top:1px solid #2b261f;padding-top:6px;">${logsHtml}</div>
            `;
stepHost.querySelectorAll(".btn-trib-choice").forEach(btn=>{
btn.addEventListener("click",()=>{
const cid=btn.getAttribute("data-choice");
const res=game.eventManager.chooseTribulationAction(cid);
if (!res.success&& !res.finished) {
ui.addLog(res.message,"warning");
return;
}
if (game.apertureFX) {
game.apertureFX.triggerTribulationStrikeEffect(cid,res.trial?res.trial.integrity :100,res.trial?res.trial.waveIndex :2);
}
if (res.finished) {
stepHost.innerHTML=`<p style="text-align:center;color:#ffd700;font-weight:bold;padding:12px;">✨ Đang kết tụ Đạo Ngân Thiên Địa...</p>`;
const finishNow=()=>{
modal.classList.add("hidden");
bodyEl.innerHTML="";
ui.addLog(res.message,res.success?"loot" :"danger");
ui.renderApertureTab();
ui.updateHubTopbar();
};
if (res.success&&game.apertureFX) {
game.apertureFX.playTribulationVictoryClimax(finishNow);
} else {
if (game.apertureFX) game.apertureFX.stop();
finishNow();
}
} else {
this._renderTribulationModalStep(modal,res.trial,res.nextWave);
ui.updateHubTopbar();
}
});
});
}
renderLiveAuctionPanel(container) {
const ui=this.ui;
const game=ui&&ui.game;
if (!container|| !game|| !game.eventManager) return;
const em=game.eventManager;
const a=em.liveAuction;
if (!a) {
container.innerHTML=`
<div class="card-box" style="grid-column:1/-1;border-color:#ffd700;">
<h3 style="color:#ffd700;">🔨 Sàn Đấu Giá Cạnh Tranh Trực Tiếp Ngũ Vực</h3>
<p class="sub-text mt-5">Cạnh tranh trực tiếp với các cường giả (Thương Yến Phi, Hắc Lâu Lan, Tuyết Hồ Lão Tổ, Phượng Cửu Ca...) để đoạt Xá Lợi Cổ, Cổ Trùng hiếm và Tiên Cổ với giá thấp hơn mua thẳng!</p>
<button id="btn-start-live-auction" class="btn-primary mt-10">🔨 Mở Phiên Đấu Giá Mới Ngay</button>
</div>
                `;
const btnStart=container.querySelector("#btn-start-live-auction");
if (btnStart) {
btnStart.addEventListener("click",()=>{
em.startLiveAuction();
this.renderLiveAuctionPanel(container);
});
}
return;
}
const isImm=a.lot.currency==="immortal";
const unit=isImm?"🌟 Tiên Thạch" :"💎 Nguyên Thạch";
const nextMin=a.highestBidder==="Khởi điểm"?a.currentBid :(a.currentBid + a.lot.step);
const nextJump=a.highestBidder==="Khởi điểm"?(a.currentBid + a.lot.step) :(a.currentBid + a.lot.step*2);
const logsHtml=a.log.slice(-6).map(line=>`<p style="font-size:12px;margin:3px 0;">${esc(line)}</p>`).join("");
container.innerHTML=`
<div class="card-box" style="grid-column:1/-1;border-color:#ffd700;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
<h3 style="color:#ffd700;">🔨 ${esc(a.lot.name)}</h3>
<span class="badge">Hiệp ${a.round}/${a.maxRounds} | Đối thủ: ${esc(a.rival.name)}</span>
</div>
<p class="sub-text mt-5">${esc(a.lot.desc)}</p>
<div class="recipe-preview-box mt-10">
<p>Giá cao nhất hiện tại: <strong class="highlight-gold" style="font-size:16px;">${a.currentBid.toLocaleString("vi-VN")} ${unit}</strong> (Người giữ giá: <strong>${esc(a.highestBidder)}</strong>)</p>
<div style="margin-top:6px;max-height:125px;overflow-y:auto;">${logsHtml}</div>
</div>
<div class="action-row mt-10">
                        ${!a.finished?`
<button id="btn-auc-bid-1" class="btn-primary">💰 Trả Giá (+1 Bước: ${nextMin.toLocaleString("vi-VN")} ${isImm?"🌟" :"💎"})</button>
<button id="btn-auc-bid-2" class="btn-accent">🔥 Ép Giá Mạnh (+2 Bước: ${nextJump.toLocaleString("vi-VN")} ${isImm?"🌟" :"💎"})</button>
<button id="btn-auc-pass" class="btn-secondary">🚪 Bỏ Cuộc</button>
                        ` :`
<button id="btn-auc-next" class="btn-primary">🔨 Mở Phiên Đấu Giá Tiếp Theo</button>
                        `}
</div>
</div>
            `;
const b1=container.querySelector("#btn-auc-bid-1");
const b2=container.querySelector("#btn-auc-bid-2");
const bp=container.querySelector("#btn-auc-pass");
const bn=container.querySelector("#btn-auc-next");
if (b1) b1.addEventListener("click",()=>{
const r=em.placeAuctionBid(1);
if (!r.success&&r.message) ui.addLog(r.message,"warning");
else if (r.won) ui.addLog(`🏆 Đã đấu thắng 【${a.lot.name}】!`,"loot");
ui.updateHubTopbar();
this.renderLiveAuctionPanel(container);
});
if (b2) b2.addEventListener("click",()=>{
const r=em.placeAuctionBid(2);
if (!r.success&&r.message) ui.addLog(r.message,"warning");
else if (r.won) ui.addLog(`🏆 Đã đấu thắng 【${a.lot.name}】!`,"loot");
ui.updateHubTopbar();
this.renderLiveAuctionPanel(container);
});
if (bp) bp.addEventListener("click",()=>{
em.passAuctionRound();
this.renderLiveAuctionPanel(container);
});
if (bn) bn.addEventListener("click",()=>{
em.startLiveAuction();
this.renderLiveAuctionPanel(container);
});
}
renderWorldExpansionPanel(hostEl) {
const ui=this.ui;
const game=ui&&ui.game;
const qm=game&&game.questManager;
const em=game&&game.eventManager;
if (!hostEl|| !qm|| !global.QuestManager) return;
const tabs=[
{id:"sect",label:"🏯 Tông Môn"},
{id:"quests",label:"📜 Chuỗi & Ẩn"},
{id:"ruins",label:"🗿 Di Tích & Bí Thuật"},
{id:"secret_realms",label:"🌌 Khám Phá Bí Cảnh"},
{id:"reputation",label:"🌟 Danh Vọng"},
{id:"achievements",label:"🏆 Thành Tựu"},
{id:"npcs",label:"🤝 Quan Hệ NPC"}
];
const tabButtonsHtml=tabs.map(t=>
`<button class="tab-btn ${this.activeWorldSubtab===t.id?"active" :""}" data-wtab="${t.id}">${t.label}</button>`
).join("");
hostEl.innerHTML=`
<div class="card-box mt-15" style="border-color:#b89758;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;">
<h3 style="margin:0;color:#ffd700;">🌍 Hệ Thống Thế Giới Ngũ Vực (Tông Môn • Di Tích • Bí Cảnh • Danh Vọng • Thành Tựu • NPC)</h3>
<div class="filter-tabs" id="world-expansion-subtabs">${tabButtonsHtml}</div>
</div>
<div id="world-expansion-body"></div>
</div>
            `;
hostEl.querySelectorAll("[data-wtab]").forEach(btn=>{
btn.addEventListener("click",()=>{
this.activeWorldSubtab=btn.getAttribute("data-wtab");
this.renderWorldExpansionPanel(hostEl);
});
});
const body=hostEl.querySelector("#world-expansion-body");
if (!body) return;
if (this.activeWorldSubtab==="sect") this._renderSectSubtab(body,qm);
else if (this.activeWorldSubtab==="quests") this._renderQuestChainsSubtab(body,qm);
else if (this.activeWorldSubtab==="ruins") this._renderRuinsAndArtsSubtab(body,qm);
else if (this.activeWorldSubtab==="secret_realms") this._renderSecretRealmsSubtab(body,em);
else if (this.activeWorldSubtab==="reputation") this._renderReputationSubtab(body,qm);
else if (this.activeWorldSubtab==="achievements") this._renderAchievementsSubtab(body,qm);
else if (this.activeWorldSubtab==="npcs") this._renderNpcRelationsSubtab(body,qm);
}
_renderSectSubtab(body,qm) {
const ui=this.ui;
const curSect=qm.getCurrentSect();
const curRank=qm.getCurrentSectRankInfo();
const nextRank=global.QuestManager.SECT_RANKS[qm.sect.rankLevel + 1]||null;
const cd=qm.getSectStipendCooldown();
const statusHtml=curSect?`
<div class="recipe-preview-box" style="border-color:#5cc995;">
<p><strong style="font-size:15px;color:#ffd700;">${curSect.icon} ${esc(curSect.name)}</strong> — <span class="badge">${esc(curRank.title)}</span> (${esc(curSect.alignment)})</p>
<p class="sub-text mt-5">Đặc quyền Tông Môn: <strong>${esc(curSect.perkDesc)}</strong> | Chức vụ cộng: <strong style="color:#5cc995">+${Math.round(curRank.statBonusPct*100)}% HP/ATK/DEF</strong></p>
<p class="mt-5">Cống hiến Tông Môn: <strong class="highlight-gold">${qm.sect.contribution}</strong> ${nextRank?`| Lên 【${esc(nextRank.title)}】 cần: <strong>${nextRank.reqContribution} Cống Hiến & ${nextRank.reqRank} Chuyển</strong>` :"| Đã đạt đỉnh cao Tông Môn!"}</p>
<div class="action-row mt-10">
<button id="btn-sect-contrib-50" class="btn-secondary">💎 Cống Hiến 50 Nguyên Thạch</button>
<button id="btn-sect-contrib-200" class="btn-secondary">💎 Cống Hiến 200 Nguyên Thạch</button>
<button id="btn-sect-promote" class="btn-primary" ${nextRank?"" :"disabled"}>👑 Tấn Phong Chức Vụ</button>
<button id="btn-sect-stipend" class="btn-accent" ${cd>0?"disabled" :""}>${cd>0?`⏳ Bổng Lộc (${Math.floor(cd/60)}:${String(cd%60).padStart(2,"0")})` :`🎁 Lĩnh Bổng Lộc (+${curRank.dailyStones}💎)`}</button>
</div>
</div>
            ` :`<p class="sub-text" style="margin-bottom:8px;">Ngươi hiện đang là Tán Tu tự do. Hãy chọn một Tông Môn / Gia Tộc bên dưới để gia nhập, tích lũy cống hiến và nhận đặc quyền!</p>`;
const listHtml=global.QuestManager.SECTS_DB.map(s=>{
const isMine=curSect&&curSect.id===s.id;
return `
<div class="list-card" style="${isMine?"border-color:#5cc995;" :""}">
<div class="list-card-header">
<span>${s.icon} <strong>${esc(s.name)}</strong> (${esc(s.regionName)})</span>
<span class="badge">${esc(s.alignment)} • Yêu cầu ${s.reqRank} Chuyển</span>
</div>
<p class="sub-text">${esc(s.desc)}</p>
<p style="font-size:11.5px;color:#7ef7c4;">Đặc quyền: ${esc(s.perkDesc)}</p>
<button class="btn-mini btn-join-sect mt-5" data-sect="${esc(s.id)}" ${isMine?"disabled" :""}>
                            ${isMine?"✅ Đang Gia Nhập" :"🏯 Gia Nhập Tông Môn"}
</button>
</div>
                `;
}).join("");
body.innerHTML=`${statusHtml}<div class="split-2 mt-10">${listHtml}</div>`;
const bind=(id,fn)=>{
const el=body.querySelector(id);
if (el) el.addEventListener("click",()=>{
const res=fn();
if (res&&res.message) ui.addLog(res.message,res.success?"loot" :"warning");
ui.updateHubTopbar();
ui.renderFactionTab();
});
};
bind("#btn-sect-contrib-50",()=>qm.contributeToSect(50));
bind("#btn-sect-contrib-200",()=>qm.contributeToSect(200));
bind("#btn-sect-promote",()=>qm.promoteSectRank());
bind("#btn-sect-stipend",()=>qm.claimSectStipend());
body.querySelectorAll(".btn-join-sect").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=qm.joinSect(btn.getAttribute("data-sect"));
ui.addLog(res.message,res.success?"cultivation" :"warning");
ui.updateHubTopbar();
ui.renderFactionTab();
});
});
}
_renderQuestChainsSubtab(body,qm) {
const chainsHtml=global.QuestManager.QUEST_CHAINS.map(ch=>{
const curIdx=qm.chainStepIndex[ch.chainId]||0;
const doneAll=curIdx>=ch.steps.length;
const step=doneAll?ch.steps[ch.steps.length - 1] :ch.steps[curIdx];
const prog=doneAll?step.target :(qm.chainStepProgress[step.id]||0);
return `
<div class="list-card" style="${doneAll?"border-color:#5cc995;" :"border-color:#ffd700;"}">
<div class="list-card-header">
<span>📖 <strong>${esc(ch.name)}</strong></span>
<span class="badge">${doneAll?"✅ Đã Hoàn Thành Chuỗi" :`Bước ${curIdx + 1}/${ch.steps.length}`}</span>
</div>
<p style="font-size:13px;color:#e2bf75;margin:4px 0;">${esc(step.title)} (${prog}/${step.target})</p>
<p class="sub-text">${esc(step.desc)}</p>
<p style="font-size:11.5px;color:#5cc995;">Thưởng: 💎 +${step.rewardStones} | 🏅 +${step.rewardMerit} | 🌟 +${step.rewardRep||0} Danh Vọng${step.rewardImmStones?` | 🌟 +${step.rewardImmStones} Tiên Thạch` :""}</p>
</div>
                `;
}).join("");
const hiddenHtml=global.QuestManager.HIDDEN_QUESTS_DB.map(hq=>{
const unlocked=qm.unlockedHiddenQuests.includes(hq.id);
const claimed=qm.claimedHiddenQuests.includes(hq.id);
const prog=qm.hiddenQuestProgress[hq.id]||0;
if (!unlocked&& !claimed) {
return `
<div class="list-card" style="opacity:0.7;">
<div class="list-card-header">
<span>🔒 Nhiệm Vụ Ẩn (Chưa Phát Hiện)</span>
<span class="badge">Manh mối</span>
</div>
<p class="sub-text">Gợi ý mở khóa: ${esc(hq.triggerHint)}</p>
</div>
                    `;
}
return `
<div class="list-card" style="border-color:${claimed?"#5cc995" :"#c278ff"};">
<div class="list-card-header">
<span>🔍 <strong>${esc(hq.title)}</strong></span>
<span class="badge">${claimed?"✅ Đã Xong" :`${prog}/${hq.target}`}</span>
</div>
<p class="sub-text">${esc(hq.desc)}</p>
<p style="font-size:11.5px;color:#7ef7c4;">Thưởng: 💎 +${hq.rewardStones} | ☯ +${hq.rewardHumanQi} Nhân Khí${hq.rewardImmStones?` | 🌟 +${hq.rewardImmStones} Tiên Thạch` :""}</p>
</div>
                `;
}).join("");
body.innerHTML=`
<div class="split-2">
<div><h4 style="color:#ffd700;margin-bottom:6px;">📖 Nhiệm Vụ Chuỗi Chính Tuyến</h4><div class="scroll-list">${chainsHtml}</div></div>
<div><h4 style="color:#c278ff;margin-bottom:6px;">🔍 Nhiệm Vụ Ẩn Ngũ Vực</h4><div class="scroll-list">${hiddenHtml}</div></div>
</div>
            `;
}
_renderRuinsAndArtsSubtab(body,qm) {
const ui=this.ui;
const ruinsHtml=global.QuestManager.ANCIENT_RUINS.map(r=>{
const done=qm.exploredRuins.includes(r.id);
const regRep=qm.reputation[r.region]||0;
return `
<div class="list-card" style="${done?"border-color:#5cc995;" :""}">
<div class="list-card-header">
<span>${r.icon} <strong>${esc(r.name)}</strong> (${esc(r.regionName)})</span>
<span class="badge">${done?"✅ Đã Giải Mã" :`${r.reqRank}C • ${r.reqRep} DV`}</span>
</div>
<p class="sub-text">${done?esc(r.lore) :`Cần ${r.reqRank} Chuyển, ${r.reqRep} Danh Vọng ${esc(r.regionName)} (Có: ${regRep}) & ${r.mentalCost} Tinh Thần.`}</p>
                        ${!done?`<button class="btn-mini btn-primary btn-explore-ruin mt-5" data-ruin="${esc(r.id)}">🗿 Khám Phá Di Tích (-${r.mentalCost}🧠)</button>` :""}
</div>
                `;
}).join("");
const artsHtml=Object.values(global.QuestManager.SECRET_ARTS_DB).map(art=>{
const learned=qm.learnedSecretArts.includes(art.id);
return `
<div class="list-card" style="${learned?"border-color:#ffd700;background:rgba(50,38,14,0.45);" :"opacity:0.65;"}">
<div class="list-card-header">
<span>${art.icon} <strong>${esc(art.name)}</strong></span>
<span class="badge">${learned?"✅ Đang Hiệu Lực" :"🔒 Chưa Lĩnh Ngộ"}</span>
</div>
<p class="sub-text">${esc(art.desc)}</p>
<p style="font-size:11px;color:#85c1e9;">Nguồn: ${esc(art.source)}</p>
</div>
                `;
}).join("");
body.innerHTML=`
<div class="split-2">
<div><h4 style="color:#ffd700;margin-bottom:6px;">🗿 Di Tích Lịch Sử & Bí Mật Cổ Xưa</h4><div class="scroll-list">${ruinsHtml}</div></div>
<div><h4 style="color:#7ef7f0;margin-bottom:6px;">📖 Công Pháp & Bí Thuật Truyền Thừa (Bị Động Vĩnh Viễn)</h4><div class="scroll-list">${artsHtml}</div></div>
</div>
            `;
body.querySelectorAll(".btn-explore-ruin").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=qm.exploreRuin(btn.getAttribute("data-ruin"));
ui.addLog(res.message,res.success?"loot" :"warning");
ui.updateHubTopbar();
ui.renderFactionTab();
});
});
}
_renderSecretRealmsSubtab(body,em) {
const ui=this.ui;
if (!em|| !global.EventManager) return;
const listHtml=global.EventManager.SECRET_REALM_EXPEDITIONS.map(exp=>`
<div class="list-card">
<div class="list-card-header">
<span>${exp.icon} <strong>${esc(exp.name)}</strong></span>
<span class="badge">Yêu cầu ${exp.reqRank} Chuyển</span>
</div>
<p class="sub-text">${esc(exp.desc)}</p>
<button class="btn-mini btn-accent btn-exp-realm mt-5" data-exp="${esc(exp.id)}">🌌 Thám Hiểm Bí Cảnh (-${exp.mentalCost}🧠 Tinh Thần)</button>
</div>
            `).join("");
body.innerHTML=`<div class="split-2">${listHtml}</div>`;
body.querySelectorAll(".btn-exp-realm").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=em.exploreSecretRealm(btn.getAttribute("data-exp"));
ui.addLog(res.message,res.success?"loot" :"warning");
ui.updateHubTopbar();
ui.renderFactionTab();
});
});
}
_renderReputationSubtab(body,qm) {
const atlas=(global.WorldMap&&global.WorldMap.FIVE_REGION_ATLAS)||{};
const html=Object.values(atlas).map(reg=>{
const info=qm.getRegionReputationTier(reg.id);
return `
<div class="list-card" style="border-color:${info.color};">
<div class="list-card-header">
<span>${reg.icon} <strong>${esc(reg.name)}</strong></span>
<span style="color:${info.color};font-weight:bold;">${info.points} điểm — ${esc(info.title)}</span>
</div>
<p class="sub-text">${esc(reg.desc)}</p>
<p style="font-size:11.5px;color:#5cc995;">Đặc quyền Danh Vọng: Giảm ${Math.round(info.discount*100)}% giá mua tại Thương Hội & mở khóa Di Tích ${esc(reg.name)}.</p>
</div>
                `;
}).join("");
body.innerHTML=`<div class="split-2">${html}</div>`;
}
_renderAchievementsSubtab(body,qm) {
const ui=this.ui;
const html=global.QuestManager.ACHIEVEMENTS_DB.map(ach=>{
const cur=qm.getAchievementProgress(ach);
const claimed=qm.claimedAchievements.includes(ach.id);
const ready= !claimed&&cur>=ach.target;
return `
<div class="list-card" style="${claimed?"border-color:#5cc995;" :(ready?"border-color:#ffd700;background:rgba(55,44,12,0.45);" :"")}">
<div class="list-card-header">
<span>${ach.icon} <strong>${esc(ach.name)}</strong></span>
<span class="badge">${claimed?"✅ Đã Nhận" :`${Math.min(cur,ach.target)} / ${ach.target}`}</span>
</div>
<p class="sub-text">${esc(ach.desc)}</p>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px;gap:8px;">
<span style="font-size:11.5px;color:#ffd700;">💎 +${ach.rewardStones} | ☯ +${ach.rewardHumanQi} Nhân Khí${ach.rewardImmStones?` | 🌟 +${ach.rewardImmStones}` :""}</span>
                            ${ready?`<button class="btn-mini btn-primary btn-claim-ach" data-ach="${esc(ach.id)}">🎁 Nhận Thưởng</button>` :""}
</div>
</div>
                `;
}).join("");
body.innerHTML=`<div class="split-2">${html}</div>`;
body.querySelectorAll(".btn-claim-ach").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=qm.claimAchievement(btn.getAttribute("data-ach"));
ui.addLog(res.message,res.success?"loot" :"warning");
ui.updateHubTopbar();
ui.renderFactionTab();
});
});
}
_renderNpcRelationsSubtab(body,qm) {
const ui=this.ui;
const npcs=(ui.enemies&&Array.isArray(ui.enemies.npcs))?ui.enemies.npcs :[];
const pl=ui.player;
const giftOptions=[
{id:"moon_orchid",label:"🌸 Nguyệt Lan Hoa"},
{id:"spirit_herb",label:"🌿 Thanh Linh Thảo"},
{id:"hundred_year_ginseng",label:"🥕 Khổ Sâm"},
{id:"soul_crystal",label:"🔮 Đãng Hồn Thạch"}
];
const html=npcs.map(npc=>{
const tier=qm.getNpcRelationTier(npc.relation);
const giftBtns=giftOptions.map(g=>{
const cnt=pl?pl.getItemCount(g.id) :0;
return `<button class="btn-mini btn-gift-npc" data-npc="${esc(npc.id)}" data-item="${g.id}" ${cnt<=0?"disabled" :""}>Tặng ${g.label} (${cnt})</button>`;
}).join("");
return `
<div class="list-card" style="border-color:${tier.color};">
<div class="list-card-header">
<span>🤝 <strong>${esc(npc.name)}</strong> (${npc.rank} Chuyển)</span>
<span style="color:${tier.color};font-weight:bold;">${esc(tier.label)} (${npc.relation||0})</span>
</div>
<p class="sub-text">${esc(npc.title)} — ${esc(npc.factionName)} | Giảm giá giao dịch riêng: <strong>${Math.round(tier.discount*100)}%</strong></p>
<div class="action-row mt-5">${giftBtns}</div>
</div>
                `;
}).join("");
body.innerHTML=`<div class="split-2">${html}</div>`;
body.querySelectorAll(".btn-gift-npc").forEach(btn=>{
btn.addEventListener("click",()=>{
const npc=npcs.find(n=>n.id===btn.getAttribute("data-npc"));
const res=qm.giftNpc(npc,btn.getAttribute("data-item"));
ui.addLog(res.message,res.success?"cultivation" :"warning");
ui.updateHubTopbar();
ui.renderFactionTab();
});
});
}
}
global.BattleUI=BattleUI;
})(window);
