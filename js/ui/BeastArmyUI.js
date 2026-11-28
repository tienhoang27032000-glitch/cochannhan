(function (global) {
"use strict";

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#39;");
}

function _renderBeastArmyTab() {
const host=document.getElementById("beast-army-tab-root");
const army=this.game&&this.game.beastArmy;
const pl=this.player;
const D=global.VanCoBeastArmyData;
if (!host|| !army|| !pl|| !D) return;

const maxSlots=army.getMaxSquadSlots();
const deployed=army.getDeployedBeasts();
const form=army.getFormationInfo();
const counts=army.getEnslaveGuCounts();
const noDaoAmp=pl.calculateDaoAmplification("Nô Đạo",[]).multiplier;
const meatCount=pl.getItemCount("ration_meat");
const bloodCount=pl.getItemCount("beast_blood_core");
const ginsengCount=pl.getItemCount("hundred_year_ginseng");

const guChipsHtml=D.ENSLAVE_GU_TIERS.map(gt=>{
const cnt=counts[gt.id]||0;
return `<span class="badge" style="border-color:${cnt>0?"#ffd700" :"#453c2e"};color:${cnt>0?"#ffd700" :"#8c857b"};">⛓️ ${gt.rank}C: <strong>${cnt}</strong></span>`;
}).join("");

const formBtnsHtml=D.FORMATION_ORDER.map(fid=>{
const f=D.FORMATIONS[fid];
const active=(army.formation===fid);
return `<button class="btn-mini ba-form-btn ${active?"btn-primary" :""}" data-form="${fid}" style="${active?`border-color:${f.color};color:${f.color};` :""}">${f.icon} ${f.name}</button>`;
}).join("");

const squadSlotsHtml=[];
for (let i=0;i<maxSlots;i++) {
const rec=deployed[i]||null;
if (!rec) {
squadSlotsHtml.push(`
<div class="ba-squad-slot empty">
<span class="ba-slot-idx">Ô ${i + 1}</span>
<span class="sub-text">Trống</span>
</div>`);
} else {
const st=D.computeBeastStats(rec,pl);
const hpPct=Math.max(0,Math.min(100,Math.round((rec.hp / Math.max(1,st.maxHp))*100)));
squadSlotsHtml.push(`
<div class="ba-squad-slot filled" data-uid="${_esc(rec.uid)}" title="Nhấn để xem / thu hồi">
<span class="ba-slot-idx" style="color:${st.tierInfo.color};">${st.tierInfo.badge} ${rec.rank}C</span>
<div class="ba-slot-icon">${_esc(rec.icon)}</div>
<div class="ba-slot-name">${_esc(rec.name)}</div>
<div class="ba-slot-sub">Lv.${rec.level} • ${hpPct}% HP</div>
<div class="gu-hunger-mini"><div class="gu-hunger-mini-fill ${hpPct<35?"low" :""}" style="width:${hpPct}%;"></div></div>
</div>`);
}
}

// Storage grid
let storageHtml="";
if (army.storedBeasts.length===0) {
storageHtml=`<p class="empty-hint" style="grid-column:1/-1;">Chưa thu phục Linh Thú nào!<br>Hãy bước vào Chiến Trường, đánh yếu Dị Thú / Bách Thú Vương rồi nhấn phím <strong>[H]</strong> (hoặc nút <strong>⛓️ Thu Thú</strong>) để thu phục vào Thú Quyển!</p>`;
} else {
storageHtml=army.storedBeasts.map(rec=>{
const st=D.computeBeastStats(rec,pl);
const isDep=army.deployedIds.includes(rec.uid);
const isSel=(army.selectedBeastUid===rec.uid);
const hpPct=Math.max(0,Math.min(100,Math.round((rec.hp / Math.max(1,st.maxHp))*100)));
return `
<div class="item-card rank-border-${Number(rec.rank)||1} ${isSel?"selected" :""}" data-beast-uid="${_esc(rec.uid)}">
<div class="icon" style="font-size:28px;">${_esc(rec.icon)}</div>
<div class="name" style="color:${st.tierInfo.color};">${st.tierInfo.badge} ${_esc(rec.name)}</div>
<div class="rank-tag">${rec.rank}C • Lv.${rec.level} ${isDep?"[Xuất Chiến]" :""}</div>
<div class="gu-hunger-mini"><div class="gu-hunger-mini-fill ${hpPct<35?"low" :""}" style="width:${hpPct}%;"></div></div>
</div>`;
}).join("");
}

// Detail panel
let detailHtml=`<p class="empty-hint">Chọn một Linh Thú trong Thú Quyển bên trái để xem chỉ số, xuất chiến, cho ăn tăng cấp hoặc Tấn Thăng lên <strong>Bách Thú Vương → Thiên Thú Vương → Thú Hoàng</strong>!</p>`;
const sel=army.getStoredBeast(army.selectedBeastUid);
if (sel) {
const st=D.computeBeastStats(sel,pl);
const isDep=army.deployedIds.includes(sel.uid);
const expNeed=D.getExpForNextLevel(sel.level);
const expPct=Math.min(100,Math.round(((sel.exp||0) / Math.max(1,expNeed))*100));
const hpPct=Math.max(0,Math.min(100,Math.round((sel.hp / Math.max(1,st.maxHp))*100)));
const nextTier=(sel.tier||0)<D.BEAST_TIERS.length - 1?D.BEAST_TIERS[(sel.tier||0) + 1] :null;

const promoteBox=nextTier?`
<div class="recipe-preview-box mt-10" style="border-color:${nextTier.color};">
<p><strong style="color:${nextTier.color};">👑 Tấn Thăng Lên 【${nextTier.badge} ${nextTier.name}】 (ATK x${nextTier.atkMult}, HP x${nextTier.hpMult}):</strong></p>
<p class="sub-text">Yêu cầu: <strong>Lv.${nextTier.reqLevel}</strong> (Có: Lv.${sel.level}) | 🩸 <strong>${nextTier.bloodCost}</strong> Tinh Huyết (Có: ${bloodCount}) | 🍖 <strong>${nextTier.meatCost}</strong> Thịt (Có: ${meatCount}) | 💎 <strong>${nextTier.stoneCost.toLocaleString("vi-VN")}</strong> Nguyên Thạch</p>
<button id="ba-btn-promote" class="btn-primary mt-5" style="width:100%;">🔥 Tấn Thăng ${nextTier.name} Ngay</button>
</div>` :`<div class="recipe-preview-box mt-10"><p class="highlight-gold">🐉 Đã đạt phẩm cấp tối thượng: Thái Cổ Hoang Thú!</p></div>`;

detailHtml=`
<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3a3124;padding-bottom:8px;gap:8px;flex-wrap:wrap;">
<strong style="font-size:16px;color:${st.tierInfo.color};">${_esc(sel.icon)} ${st.tierInfo.badge} ${_esc(sel.name)}</strong>
<span class="badge" style="border-color:${st.tierInfo.color};color:${st.tierInfo.color};">${st.tierInfo.name} • ${sel.rank} Chuyển</span>
</div>
<div class="info-list mt-10">
<div class="info-row"><span>Cấp độ / Kinh nghiệm:</span> <strong>Lv.${sel.level} (${sel.exp||0} / ${expNeed} EXP — ${expPct}%)</strong></div>
<div class="info-row"><span>Sinh Mệnh (HP):</span> <strong style="color:${hpPct<35?"#ff6b6b" :"#5cc995"};">${Math.round(sel.hp)} / ${st.maxHp} (${hpPct}%)</strong></div>
<div class="info-row"><span>Công Kích / Phòng Ngự:</span> <strong class="highlight-gold">⚔️ ${st.atk} ATK | 🛡️ ${st.def} DEF</strong></div>
<div class="info-row"><span>Tốc Độ / Kiểu Đánh:</span> <strong>💨 ${st.spd} SPD | ${sel.rangedGuId?"✨ Bắn Cổ Thuật Tầm Xa" :"🐾 Cận Chiến Xung Phong"}</strong></div>
<div class="info-row"><span>Chiến Tích / Khuếch Đại Nô Đạo:</span> <strong>💀 ${sel.kills||0} mạng | x${st.daoAmp.toFixed(2)} Nô Đạo</strong></div>
</div>
${promoteBox}
<div class="action-grid-2 mt-10">
<button id="ba-btn-toggle-dep" class="${isDep?"btn-secondary" :"btn-primary"}">${isDep?"↩️ Thu Hồi Về Thú Quyển" :"🐺 Xuất Chiến Đội Hình"}</button>
<button id="ba-btn-feed-meat" class="btn-accent" ${meatCount<=0?"disabled" :""}>🍖 Cho Ăn Thịt (+45% HP, +20 EXP | Có: ${meatCount})</button>
<button id="ba-btn-feed-blood" class="btn-secondary" ${bloodCount<=0?"disabled" :""}>🩸 Nuôi Tinh Huyết (+75% HP, +60 EXP | Có: ${bloodCount})</button>
<button id="ba-btn-feed-ginseng" class="btn-secondary" ${ginsengCount<=0?"disabled" :""}>🥕 Nuôi Khổ Sâm (Đầy HP, +45 EXP | Có: ${ginsengCount})</button>
</div>
<div class="action-row mt-10" style="justify-content:flex-end;">
<button id="ba-btn-release" class="btn-danger" style="padding:5px 10px;font-size:11.5px;">🕊️ Phóng Sinh</button>
</div>
`;
}

host.innerHTML=`
<div class="card-box mb-10" style="border-color:#5cc995;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
<div>
<strong style="color:#ffd700;font-size:14.5px;">🐺 Đội Hình Thú Triều Xuất Chiến (${deployed.length} / ${maxSlots} Ô)</strong>
<div class="sub-text" style="margin-top:2px;">Khuếch đại Nô Đạo: <strong style="color:#7ef7c4;">x${noDaoAmp.toFixed(2)}</strong> • Trận hình: <strong style="color:${form.color};">${form.icon} ${form.name}</strong> — ${_esc(form.desc)}</div>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;">${formBtnsHtml}</div>
</div>
<div class="ba-squad-row mt-10">${squadSlotsHtml.join("")}</div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px;padding-top:8px;border-top:1px solid rgba(184,151,88,0.25);">
<div style="display:flex;gap:5px;flex-wrap:wrap;align-items:center;">
<span class="sub-text">Nô Lệ Cổ đang có:</span>
${guChipsHtml}
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<button id="ba-btn-heal-all" class="btn-accent" style="padding:6px 11px;font-size:12px;">🍖 Hồi Máu Toàn Đàn</button>
<button id="ba-btn-auto-dep" class="btn-primary" style="padding:6px 11px;font-size:12px;">⚡ Tự Xếp Mạnh Nhất</button>
</div>
</div>
</div>

<div class="split-2">
<div class="card-box">
<h3>📜 Thú Quyển Trong Không Khiếu (${army.storedBeasts.length} / ${D.MAX_STORED_BEASTS})</h3>
<p class="sub-text">Mẹo: Vào trận dùng <strong>[H]</strong> (hoặc nút <strong>⛓️ Thu Thú</strong>) để thu phục Dị Thú / Thú Vương đang bị thương. Thúc <strong>Lang Yên Cổ</strong>, <strong>Thú Lực Tinh Hồn Cổ</strong> hay <strong>Hoàng Kim Sư Cổ</strong> sẽ buff cuồng bạo + hồi máu cho cả đàn!</p>
<div class="item-grid mt-10">${storageHtml}</div>
</div>
<div class="card-box">
<h3>🔍 Chi Tiết & Bồi Dưỡng Linh Thú</h3>
${detailHtml}
</div>
</div>
`;

// Bind events
host.querySelectorAll(".ba-form-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
army.setFormation(btn.getAttribute("data-form"),false);
this.renderBeastArmyTab();
});
});
host.querySelectorAll(".ba-squad-slot.filled").forEach(slot=>{
slot.addEventListener("click",()=>{
army.selectedBeastUid=slot.getAttribute("data-uid");
this.renderBeastArmyTab();
});
});
host.querySelectorAll("[data-beast-uid]").forEach(card=>{
card.addEventListener("click",()=>{
army.selectedBeastUid=card.getAttribute("data-beast-uid");
this.renderBeastArmyTab();
});
});
const bHealAll=host.querySelector("#ba-btn-heal-all");
if (bHealAll) bHealAll.addEventListener("click",()=>{
const res=army.feedAndHealAllBeasts();
this.addLog(res.message,res.success?"cultivation" :"warning");
this.updateHubTopbar();
this.renderBeastArmyTab();
if (res.success&&this.game) this.game.autoSaveNow("beast_heal");
});
const bAuto=host.querySelector("#ba-btn-auto-dep");
if (bAuto) bAuto.addEventListener("click",()=>{
const res=army.autoDeployStrongest();
this.addLog(res.message,"system");
this.renderBeastArmyTab();
if (this.game) this.game.autoSaveNow("beast_deploy");
});

if (sel) {
const bTog=host.querySelector("#ba-btn-toggle-dep");
if (bTog) bTog.addEventListener("click",()=>{
const res=army.toggleDeployBeast(sel.uid);
this.addLog(res.message,res.success?"system" :"warning");
this.renderBeastArmyTab();
if (res.success&&this.game) this.game.autoSaveNow("beast_deploy");
});
const bindFeed=(id,itemId)=>{
const b=host.querySelector(id);
if (!b) return;
b.addEventListener("click",()=>{
const res=army.feedBeast(sel.uid,itemId);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.updateHubTopbar();
this.renderBeastArmyTab();
if (res.success&&this.game) this.game.autoSaveNow("beast_feed");
});
};
bindFeed("#ba-btn-feed-meat","ration_meat");
bindFeed("#ba-btn-feed-blood","beast_blood_core");
bindFeed("#ba-btn-feed-ginseng","hundred_year_ginseng");
const bProm=host.querySelector("#ba-btn-promote");
if (bProm) bProm.addEventListener("click",()=>{
const res=army.promoteBeast(sel.uid);
this.addLog(res.message,res.success?"loot" :"warning");
this.updateHubTopbar();
this.renderBeastArmyTab();
if (res.success&&this.game) this.game.autoSaveNow("beast_promote");
});
const bRel=host.querySelector("#ba-btn-release");
if (bRel) bRel.addEventListener("click",()=>{
if (confirm(`Phóng sinh 【${sel.name}】 khỏi Thú Quyển?`)) {
const res=army.releaseBeast(sel.uid);
this.addLog(res.message,"warning");
this.renderBeastArmyTab();
if (this.game) this.game.autoSaveNow("beast_release");
}
});
}
}

function _updateBattleBeastBar(force=false) {
const bar=document.getElementById("battle-beast-bar");
const army=this.game&&this.game.beastArmy;
const D=global.VanCoBeastArmyData;
if (!bar|| !army|| !D) return;

const alive=army.activeUnits.filter(u=> !u.isDead).length;
const total=army.activeUnits.length;
const counts=army.getEnslaveGuCounts();
const st=global.vanCoSettings;
const kEns=st?st.getKeyLabel("enslave") :"H";
const kFrm=st?st.getKeyLabel("formationCycle") :"Y";
const buffSec=army.armyBuffTimer>0?Math.ceil(army.armyBuffTimer) :0;
const sig=`${alive}/${total}|${army.formation}|${counts._total}|${kEns}|${kFrm}|${buffSec}`;
if (!force&&this._lastBeastBarSig===sig) return;
this._lastBeastBarSig=sig;

const fBtns=D.FORMATION_ORDER.map(fid=>{
const f=D.FORMATIONS[fid];
const act=(army.formation===fid);
return `<button class="btn-mini ba-bat-form ${act?"active" :""}" data-bform="${fid}" title="${_esc(f.desc)}" style="${act?`border-color:${f.color};color:${f.color};` :""}">${f.icon} ${f.name}</button>`;
}).join("");

bar.innerHTML=`
<div class="ba-bat-head">
<span>🐺 Thú Triều: <strong style="color:${alive>0?"#38e8a8" :"#a8a092"};">${alive}/${total}</strong>${buffSec>0?` <strong style="color:#ffd700;">🔥+${buffSec}s</strong>` :""}</span>
<button id="ba-bat-enslave" class="btn-mini btn-accent" title="Thu phục Dị Thú / Thú Vương gần nhất (Phím ${kEns})">⛓️ Thu Thú [${kEns}] (${counts._total})</button>
</div>
<div class="ba-bat-forms" title="Đổi nhanh bằng phím [${kFrm}]">
${fBtns}
</div>
`;
bar.querySelectorAll(".ba-bat-form").forEach(btn=>{
btn.addEventListener("click",(e)=>{
e.stopPropagation();
army.setFormation(btn.getAttribute("data-bform"),true);
});
});
const bEns=bar.querySelector("#ba-bat-enslave");
if (bEns) {
bEns.addEventListener("click",(e)=>{
e.stopPropagation();
army.attemptEnslaveNearestBeast();
});
}
}

global.BeastArmyUI={
renderBeastArmyTab:_renderBeastArmyTab,
updateBattleBeastBar:_updateBattleBeastBar
};
})(window);
