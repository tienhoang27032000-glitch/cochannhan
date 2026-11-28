(function (global) {
"use strict";

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function _renderGuHouseTab() {
const host=document.getElementById("gu-house-tab-root");
const sys=this.game&&this.game.guHouse;
const pl=this.player;
const D=global.VanCoGuHouseData;
if (!host|| !sys|| !pl|| !D) return;

const eq=sys.getEquippedConfig();
const st=global.vanCoSettings;
const kBoard=st?st.getKeyLabel("guHouseBoard") :"N";
const kUlt=st?st.getKeyLabel("guHouseUlt") :"U";

const eqBanner=eq?`
<div class="card-box mb-10" style="border-color:${eq.tpl.color};background:linear-gradient(90deg,rgba(22,34,46,0.88),rgba(12,16,24,0.96));">
<div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
<div>
<strong style="color:#ffd700;font-size:15.5px;">🏛️ Tiên Cổ Ốc Xuất Chiến: ${eq.tpl.icon} ${_esc(eq.tpl.name)} (Cấp ${eq.rec.level}/10)</strong>
<div class="sub-text" style="margin-top:3px;">Hộ Thuẫn: <strong style="color:#7ef7f0;">🛡️ ${eq.stats.maxShield.toLocaleString("vi-VN")}</strong> • Pháo Đài Tự Động: <strong style="color:#ffd700;">⚔️ ${eq.stats.turretDmg.toLocaleString("vi-VN")} x${eq.tpl.turretShots}</strong> • Đại Chiêu: <strong style="color:#ff9f43;">${eq.tpl.ultimate.icon} ${_esc(eq.tpl.ultimate.name)} (${eq.stats.ultDmg.toLocaleString("vi-VN")})</strong></div>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<span class="badge" style="border-color:#7ef7c4;color:#7ef7c4;">Chiến trường: [${kBoard}] Triệu Hồi • [${kUlt}] Đại Chiêu</span>
</div>
</div>
</div>` :`
<div class="card-box mb-10" style="border-color:#b89758;">
<strong style="color:#ffd700;">🏛️ Chưa lắp ghép Tiên Cổ Ốc nào!</strong>
<p class="sub-text" style="margin-top:4px;">Khi sở hữu đủ Cổ Trùng theo bản vẽ bên dưới (<strong>không tiêu hủy Cổ Trùng</strong>), ngươi có thể lắp ghép thành Tòa Thành Di Động để lái trực tiếp trên chiến trường: Hộ thuẫn cực dày, tự động bắn đa tia cổ thuật và tung Đại Chiêu Trấn Phái!</p>
</div>`;

const cardsHtml=D.GU_HOUSES.map(h=>{
const owned=sys.getOwnedHouse(h.id);
const isEq=(sys.equippedHouseId===h.id);
const chk=sys.checkAssembleRequirements(h.id);
const lv=owned?(owned.level||1) :1;
const stats=D.computeGuHouseStats(h,lv,pl);
const upCost=owned?D.getUpgradeCost(h,lv) :null;

const guChips=chk.guChecks.map(gc=>{
const img=global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gc.id,20,"gu-inline-art") :_esc(gc.icon);
return `<span class="gh-gu-chip ${gc.has?"has" :"miss"}">${img} ${_esc(gc.name)} ${gc.has?"✓" :"✕"}</span>`;
}).join("");

const c=h.assembleCost;
const matMeta=c.itemId&&global.PlayerManager&&global.PlayerManager.ITEM_DATABASE[c.itemId];
const costLine=`💎 ${c.stones.toLocaleString("vi-VN")}${c.immortalStones>0?` + 🌟 ${c.immortalStones}` :""}${matMeta?` + ${c.itemCount}x ${matMeta.icon} ${matMeta.name}` :""}`;

let actionArea="";
if (owned) {
const upLabel=lv>=10?"Đã Đỉnh Phong (Lv.10)" :`⬆️ Cường Hóa Lv.${lv + 1} (💎 ${upCost.stones.toLocaleString("vi-VN")}${upCost.immortalStones>0?` + 🌟${upCost.immortalStones}` :""})`;
actionArea=`
<div class="action-grid-2 mt-10">
<button class="btn-mini ${isEq?"btn-secondary" :"btn-primary"} gh-btn-equip" data-hid="${h.id}" ${isEq?"disabled" :""}>${isEq?"✅ Đang Trang Bị Xuất Chiến" :"🏛️ Chọn Xuất Chiến"}</button>
<button class="btn-mini btn-accent gh-btn-upgrade" data-hid="${h.id}" ${lv>=10?"disabled" :""}>${upLabel}</button>
</div>`;
} else {
actionArea=`
<div class="sub-text mt-5">Chi phí lắp ghép: <strong style="color:#ffd700;">${costLine}</strong></div>
${chk.missing.length>0?`<div class="sub-text" style="color:#ff8a8a;margin-top:2px;">Còn thiếu: ${_esc(chk.missing.slice(0,3).join(" • "))}</div>` :""}
<button class="btn-primary gh-btn-assemble mt-5" data-hid="${h.id}" style="width:100%;" ${chk.canAssemble?"" :"disabled"}>🔨 Lắp Ghép 【${_esc(h.name)}】 Ngay</button>`;
}

return `
<div class="card-box gh-card ${isEq?"gh-equipped" :""}" style="border-color:${owned?h.color :"#3c3429"};justify-content:space-between;gap:8px;">
<div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;">
<strong style="font-size:15px;color:${h.color};">${h.icon} ${_esc(h.name)} ${owned?`<span style="color:#ffd700;">(Lv.${lv})</span>` :""}</strong>
<span class="badge" style="border-color:${h.color};color:${h.color};">${_esc(h.tierLabel)}</span>
</div>
<p class="sub-text mt-5">${_esc(h.desc)}</p>
<div class="info-list mt-5">
<div class="info-row"><span>Hộ Thuẫn / Tốc Độ:</span> <strong style="color:#7ef7f0;">🛡️ ${stats.maxShield.toLocaleString("vi-VN")} | 💨 +${Math.round((h.speedMult - 1)*100)}% SPD</strong></div>
<div class="info-row"><span>Pháo Đài Tự Động:</span> <strong class="highlight-gold">⚔️ ${stats.turretDmg.toLocaleString("vi-VN")} × ${h.turretShots} tia / ${h.turretInterval}s</strong></div>
<div class="info-row"><span>Đại Chiêu Trấn Phái:</span> <strong style="color:#ff9f43;">${h.ultimate.icon} ${_esc(h.ultimate.name)} (${stats.ultDmg.toLocaleString("vi-VN")})</strong></div>
</div>
<p class="sub-text" style="margin-top:4px;color:#b8d4e8;">${_esc(h.ultimate.desc)}</p>
<div class="gh-gu-list mt-5">${guChips}</div>
</div>
<div>${actionArea}</div>
</div>`;
}).join("");

host.innerHTML=`
${eqBanner}
<div class="gh-grid">${cardsHtml}</div>
`;

host.querySelectorAll(".gh-btn-assemble").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=sys.assembleHouse(btn.getAttribute("data-hid"));
this.addLog(res.message,res.success?"loot" :"warning");
this.updateHubTopbar();
this.renderGuHouseTab();
});
});
host.querySelectorAll(".gh-btn-equip").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=sys.equipHouse(btn.getAttribute("data-hid"));
this.addLog(res.message,"system");
this.renderGuHouseTab();
});
});
host.querySelectorAll(".gh-btn-upgrade").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=sys.upgradeHouse(btn.getAttribute("data-hid"));
this.addLog(res.message,res.success?"cultivation" :"warning");
this.updateHubTopbar();
this.renderGuHouseTab();
});
});
}

function _updateBattleGuHouseBar(force=false) {
const bar=document.getElementById("battle-gu-house-bar");
const sys=this.game&&this.game.guHouse;
if (!bar|| !sys) return;
const cfg=sys.getEquippedConfig();
if (!cfg) {
if (!bar.classList.contains("hidden")) bar.classList.add("hidden");
return;
}
bar.classList.remove("hidden");
const {tpl}=cfg;
const shPct=Math.max(0,Math.min(100,Math.round((sys.shieldHp / Math.max(1,sys.maxShieldHp))*100)));
const uCd=sys.ultimateCooldown>0?sys.ultimateCooldown.toFixed(1) :"0";
const rCd=sys.repairCooldown>0?Math.ceil(sys.repairCooldown) :0;
const st=global.vanCoSettings;
const kBoard=st?st.getKeyLabel("guHouseBoard") :"N";
const kUlt=st?st.getKeyLabel("guHouseUlt") :"U";
const sig=`${tpl.id}|${sys.isBoarded?1 :0}|${shPct}|${uCd}|${rCd}|${kBoard}|${kUlt}`;
if (!force&&this._lastGuHouseBarSig===sig) return;
this._lastGuHouseBarSig=sig;

const boardLabel=rCd>0?`🔧 Tu Sửa (${rCd}s)` :(sys.isBoarded?`↩️ Thu Hồi [${kBoard}]` :`🏛️ Lên Cổ Ốc [${kBoard}]`);
const ultLabel=sys.ultimateCooldown>0?`${tpl.ultimate.icon} (${uCd}s)` :`${tpl.ultimate.icon} Đại Chiêu [${kUlt}]`;

bar.innerHTML=`
<div class="gh-bat-head">
<span style="color:${tpl.color};font-weight:bold;">${tpl.icon} ${_esc(tpl.name)}</span>
<span style="color:#7ef7f0;">🛡️ ${shPct}%</span>
</div>
<div class="progress-track" style="height:5px;">
<div class="progress-fill" style="width:${shPct}%;background:${tpl.color};"></div>
</div>
<div class="gh-bat-btns">
<button id="gh-bat-board" class="btn-mini ${sys.isBoarded?"btn-secondary" :"btn-primary"}" ${rCd>0?"disabled" :""}>${boardLabel}</button>
<button id="gh-bat-ult" class="btn-mini btn-accent" ${(!sys.isBoarded||sys.ultimateCooldown>0)?"disabled" :""}>${ultLabel}</button>
</div>
`;
const bBoard=bar.querySelector("#gh-bat-board");
if (bBoard) bBoard.addEventListener("click",(e)=>{e.stopPropagation();sys.toggleBoard(true);});
const bUlt=bar.querySelector("#gh-bat-ult");
if (bUlt) bUlt.addEventListener("click",(e)=>{e.stopPropagation();sys.triggerUltimate();});
}

global.GuHouseUI={
renderGuHouseTab:_renderGuHouseTab,
updateBattleGuHouseBar:_updateBattleGuHouseBar
};
})(window);
