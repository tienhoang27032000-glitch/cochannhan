(function (global) {
"use strict";

// ==============================================================================
// UNIVERSAL IN-MAP QUICK BAG (I) & APERTURE / GU STORAGE (O) OVERLAY (v76)
// Works seamlessly across:
// - Chiến Trường (25 Ải chính + 6 Bí Cảnh / Farm Quái)
// - Cốt Truyện Tam Vương Truyền Thừa
// - Bên Trong Phúc Địa (Khám Phá)
// - Nghịch Lưu Hà Vô Tận
// ==============================================================================

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v)
.replace(/&/g,"&amp;")
.replace(/</g,"&lt;")
.replace(/>/g,"&gt;")
.replace(/"/g,"&quot;")
.replace(/'/g,"&#39;");
}

class QuickBagApertureUI {
constructor() {
this._modal=null;
this._isOpen=false;
this.activeTab="bag"; // "bag" | "gu" | "aperture"
this.bagFilter="all";
this.guFilter="all";
this.selectedEquipSlot=0;
this._bound=false;
this._bindGlobalHotkeys();
}

_getGame() {
return global.vanCoTienDoGame||null;
}

isOpen() {
return Boolean(this._isOpen&&this._modal&& !this._modal.classList.contains("hidden"));
}

_canOpenInCurrentContext() {
const g=this._getGame();
if (!g|| !g.player|| !g.aperture) return false;
if (g.currentScreen==="creation"|| !g.aperture.isAwakened||g.isPermadead) return false;
if (global.vanCoSettings&&(global.vanCoSettings.isOpen()||global.vanCoSettings.isListeningKey())) return false;
return true;
}

_getActiveContextTag() {
const g=this._getGame();
if (!g) return "hub";
if (g.blessedLand&&g.blessedLand.explorer&&g.blessedLand.explorer.active) return "blessed_land";
if (g.reverseFlow&&g.reverseFlow.arena&&g.reverseFlow.arena.active) return "reverse_flow";
if (g.threeKingsStory&&g.currentScreen==="tk_story") return "tk_story";
if (g.currentScreen==="battle") return "battle";
return "hub";
}

_bindGlobalHotkeys() {
if (this._bound) return;
this._bound=true;
// Capture phase ensures Escape / I / O intercept cleanly before battle/story retreat handlers!
window.addEventListener("keydown",(e)=>{
const tag=document.activeElement?document.activeElement.tagName.toLowerCase() :"";
if (tag==="input"||tag==="select"||tag==="textarea") return;
if (global.vanCoSettings&&(global.vanCoSettings.isOpen()||global.vanCoSettings.isListeningKey())) return;

if (this.isOpen()&&e.code==="Escape") {
e.preventDefault();
e.stopImmediatePropagation();
this.close();
return;
}

if (e.repeat) return;
const st=global.vanCoSettings;
const isBagKey=st?st.isActionKey("openBag",e.code) :(e.code==="KeyI");
const isApKey=st?st.isActionKey("openAperture",e.code) :(e.code==="KeyO");
if (!isBagKey&& !isApKey) return;
if (!this._canOpenInCurrentContext()) return;

const targetTab=isBagKey?"bag" :"gu";
e.preventDefault();
e.stopImmediatePropagation();
if (this.isOpen()&&this.activeTab===targetTab) {
this.close();
} else if (this.isOpen()&&isApKey&&this.activeTab==="gu") {
this.activeTab="aperture";
this.render();
} else {
this.open(targetTab);
}
},true);
}

_ensureModal() {
if (this._modal) return this._modal;
let m=document.getElementById("quick-bag-aperture-modal");
if (!m) {
m=document.createElement("div");
m.id="quick-bag-aperture-modal";
m.className="modal-backdrop hidden qba-backdrop";
m.innerHTML=`
<div class="modal-window qba-window">
<div class="modal-header qba-header">
<div class="qba-title-wrap">
<h2 id="qba-title" style="margin:0;font-size:16.5px;color:#ffd700;">🎒 Hành Trang • Không Khiếu • Kho Cổ</h2>
<span id="qba-context-pill" class="badge" style="border-color:#7ef7f0;color:#7ef7f0;font-size:10.5px;"></span>
</div>
<div class="qba-header-right">
<div class="qba-tabs">
<button class="btn-mini qba-tab-btn" data-qtab="bag">🎒 Kho Đồ [I]</button>
<button class="btn-mini qba-tab-btn" data-qtab="gu">🪲 Kho Cổ Trùng [O]</button>
<button class="btn-mini qba-tab-btn" data-qtab="aperture">☯️ Không Khiếu</button>
</div>
<button id="qba-close-btn" class="btn-mini btn-danger" title="Đóng (Esc)">✕ Đóng</button>
</div>
</div>
<div id="qba-stats-strip" class="qba-stats-strip"></div>
<div id="qba-body" class="modal-body qba-body"></div>
</div>
`;
document.body.appendChild(m);
m.querySelector("#qba-close-btn").addEventListener("click",()=>this.close());
m.addEventListener("click",(e)=>{if (e.target===m) this.close();});
m.querySelectorAll(".qba-tab-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
this.activeTab=btn.getAttribute("data-qtab")||"bag";
if (global.vanCoSfx) global.vanCoSfx.play("tab");
this.render();
});
});
}
this._modal=m;
return m;
}

open(tab="bag") {
if (!this._canOpenInCurrentContext()) return false;
this.activeTab=tab||"bag";
const m=this._ensureModal();
this._isOpen=true;
m.classList.remove("hidden");
const g=this._getGame();
if (g&&typeof g.resetAllInputs==="function") g.resetAllInputs();
if (g&&g.blessedLand&&g.blessedLand.explorer&&g.blessedLand.explorer.active) {
g.blessedLand.explorer.keys={};
g.blessedLand.explorer._ptrDown=false;
}
if (g&&g.threeKingsStory&&g.currentScreen==="tk_story") {
g.threeKingsStory._keys={};
}
this.render();
if (global.vanCoSfx) global.vanCoSfx.play("click");
return true;
}

close() {
this._isOpen=false;
if (this._modal) this._modal.classList.add("hidden");
this._syncAllLiveHUDs();
}

_syncAllLiveHUDs() {
const g=this._getGame();
if (!g) return;
if (g.ui) {
g.ui.updateHubTopbar();
if (g.currentScreen==="battle") {
g.ui.updateBattleHUD();
g.ui.updateQuickbars();
} else if (g.currentScreen==="hub") {
g.ui.renderActiveHubTab();
}
}
if (g.blessedLand&&g.blessedLand.explorer&&g.blessedLand.explorer.active) {
if (typeof g.blessedLand.explorer._syncGuHotbar==="function") g.blessedLand.explorer._syncGuHotbar(true);
}
}

_notify(msg,type="system") {
const g=this._getGame();
if (g&&g.ui&&typeof g.ui.addLog==="function") g.ui.addLog(msg,type);
if (g&&g.ui&&typeof g.ui.showToast==="function") g.ui.showToast(msg,type);
if (g&&g.blessedLand&&g.blessedLand.explorer&&g.blessedLand.explorer.active) {
const ex=g.blessedLand.explorer;
ex.floats.push({x:ex.pl.x,y:ex.pl.y - 38,text:String(msg).slice(0,54),color:type==="warning"||type==="danger"?"#ff9f43" :"#7ef7c4",life:1.5,maxLife:1.5});
}
}

_castGuInCurrentWorld(gu) {
const g=this._getGame();
if (!g|| !gu) return;
const ctxTag=this._getActiveContextTag();
if (ctxTag==="blessed_land"&&g.blessedLand&&g.blessedLand.explorer) {
const ok=g.blessedLand.explorer.castGuInstanceDirect(gu);
if (ok) {
this.close();
} else {
this.render();
}
return;
}
if (ctxTag==="battle"&&g.combat&&g.guSystem) {
// Equip temporarily or cast directly if already in a slot!
let slotIdx=g.guSystem.equippedGuSlots.indexOf(gu.instanceId);
if (slotIdx<0) {
const empty=g.guSystem.equippedGuSlots.indexOf(null);
slotIdx=empty>=0?empty :7;
g.guSystem.equipGuToSlot(gu.instanceId,slotIdx);
}
const ok=g.combat.activateGuSlot(slotIdx);
if (ok) {
this.close();
} else {
this.render();
}
return;
}
if (ctxTag==="tk_story") {
this._notify("🦋 Trong Tam Vương Phúc Địa, Địa Linh Bá Quy đang áp chế cổ trùng ngoài cốt truyện — chỉ dùng được Đạo cụ/Thảo dược trong Kho Đồ!","warning");
return;
}
if (ctxTag==="reverse_flow") {
this._notify("🌊 Trong Nghịch Lưu Hà Vô Tận, chỉ Cổ 9 Chuyển & thẻ cường hóa Roguelike mới có hiệu lực chiến đấu!","warning");
return;
}
this._notify("Hãy vào Chiến Trường hoặc Phúc Địa để thúc giục Cổ Trùng trực tiếp!","system");
}

render() {
if (!this._modal) return;
const g=this._getGame();
if (!g|| !g.player|| !g.aperture) return;
const pl=g.player;
const ap=g.aperture;
const ctxTag=this._getActiveContextTag();
const ctxLabels={
blessed_land:"🏡 Đang ở Bên Trong Phúc Địa (Dùng Cổ Trực Tiếp!)",
battle:"⚔️ Đang trong Chiến Trường / Bí Cảnh",
tk_story:"🦋 Đang trong Tam Vương Truyền Thừa",
reverse_flow:"🌊 Đang trong Nghịch Lưu Hà",
hub:"🏯 Đại Bản Doanh"
};
const pill=this._modal.querySelector("#qba-context-pill");
if (pill) pill.textContent=ctxLabels[ctxTag]||"";

this._modal.querySelectorAll(".qba-tab-btn").forEach(b=>{
b.classList.toggle("active",b.getAttribute("data-qtab")===this.activeTab);
});

// Top live stats strip
const essStr=ap.isImmortal
?`🌟 ${Number((ap.immortalEssence&&ap.immortalEssence[ap.rank])||0).toFixed(1)} ${ap.getEssenceQualityName()}`
:`💧 ${Number(ap.currentEssence||0).toFixed(1)}% / ${ap.aptitude?ap.aptitude.maxSeaPercent :100}% Chân Nguyên`;

const strip=this._modal.querySelector("#qba-stats-strip");
strip.innerHTML=`
<span>❤️ <strong>${Math.ceil(pl.hp)}/${Math.ceil(pl.maxHp)}</strong></span>
<span>🧠 <strong>${Math.floor(pl.mental)}/${Math.ceil(pl.maxMental)}</strong></span>
<span style="color:#7ef7f0;">${_esc(essStr)}</span>
<span style="color:#ffd700;">💎 <strong>${Math.floor(pl.primevalStones||0).toLocaleString("vi-VN")}</strong></span>
<span style="color:#7ef7c4;">🌟 <strong>${Math.floor(pl.immortalStones||0).toLocaleString("vi-VN")}</strong></span>
<span class="sub-text">${_esc(ap.getRealmDisplayName())}</span>
`;

const body=this._modal.querySelector("#qba-body");
if (this.activeTab==="bag") this._renderBagTab(body);
else if (this.activeTab==="gu") this._renderGuTab(body);
else this._renderApertureTab(body);
}

_renderBagTab(body) {
const g=this._getGame();
const pl=g.player;
const ap=g.aperture;
const itemDb=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
let items=(pl.inventory||[]).filter(s=>s&&s.count>0&&itemDb[s.id]);
if (this.bagFilter==="consumable") {
items=items.filter(s=>{const m=itemDb[s.id];return Boolean(m.hpRestore||m.mentalRestore||m.staminaRestore);});
} else if (this.bagFilter==="special") {
items=items.filter(s=>{const m=itemDb[s.id];return m.category==="relic_gu"||m.category==="physique_gu"||m.category==="recipe_scroll"||m.category==="immortal_material"||m.category==="enslave_gu";});
} else if (this.bagFilter==="material") {
items=items.filter(s=>{const m=itemDb[s.id];return m.category==="ore"||m.category==="material"||m.category==="herb"||m.category==="food";});
}

const filters=[
["all","Tất Cả"],
["consumable","💚 Hồi Phục"],
["special","✨ Đặc Biệt / Xá Lợi"],
["material","🪨 Cổ Tài / Thức Ăn"]
];
const filterHtml=filters.map(([k,lbl])=>`<button class="btn-mini qba-fbtn ${this.bagFilter===k?"active" :""}" data-bf="${k}">${lbl}</button>`).join("");

const quickUseRow=`
<div class="qba-quick-bar">
<button id="qba-abs-stone" class="btn-mini btn-accent" ${ap.isImmortal?"disabled" :""}>💎 Hấp Thu 1 Nguyên Thạch (Nạp Chân Nguyên)</button>
<button id="qba-abs-full" class="btn-mini btn-secondary" ${ap.isImmortal?"disabled" :""}>💎 Bơm Đầy Biển Nguyên</button>
<button id="qba-use-relic" class="btn-mini btn-primary" ${ap.isImmortal?"disabled" :""}>✨ Dùng Xá Lợi Cổ Đúng Cấp</button>
</div>`;

const cardsHtml=items.length===0
?`<p class="empty-hint" style="grid-column:1/-1;">Không có vật phẩm nào trong mục này.</p>`
:items.map(slot=>{
const m=itemDb[slot.id];
const usable=Boolean(m.hpRestore||m.mentalRestore||m.staminaRestore||m.category==="relic_gu"||m.category==="physique_gu"||slot.id==="immortal_stone");
return `
<div class="qba-item-card">
<div class="qba-item-head">
<span style="font-size:18px;">${_esc(m.icon)}</span>
<strong style="color:#f0ebe1;font-size:12.5px;flex:1;">${_esc(m.name)}</strong>
<span class="badge" style="border-color:#ffd700;color:#ffd700;">x${slot.count}</span>
</div>
<p class="sub-text" style="font-size:11px;margin:4px 0 6px 0;line-height:1.35;">${_esc(m.desc)}</p>
<div style="display:flex;justify-content:flex-end;">
${usable
?`<button class="btn-mini btn-primary qba-use-item" data-iid="${_esc(slot.id)}">✨ Sử Dụng Ngay</button>`
:`<span class="sub-text" style="font-size:10.5px;">Nguyên liệu / Nuôi Cổ</span>`
}
</div>
</div>`;
}).join("");

body.innerHTML=`
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
<div style="display:flex;gap:5px;flex-wrap:wrap;">${filterHtml}</div>
<span class="sub-text">Tổng: ${items.length} loại vật phẩm</span>
</div>
${quickUseRow}
<div class="qba-item-grid mt-10">${cardsHtml}</div>
`;

body.querySelectorAll(".qba-fbtn").forEach(btn=>{
btn.addEventListener("click",()=>{this.bagFilter=btn.getAttribute("data-bf")||"all";this.render();});
});
const bAbs1=body.querySelector("#qba-abs-stone");
if (bAbs1) bAbs1.addEventListener("click",()=>{
const r=ap.absorbPrimevalStone(1);
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
const bAbsF=body.querySelector("#qba-abs-full");
if (bAbsF) bAbsF.addEventListener("click",()=>{
const r=ap.absorbPrimevalStonesToFull(pl);
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
const bRel=body.querySelector("#qba-use-relic");
if (bRel) bRel.addEventListener("click",()=>{
const r=pl.useRelicGu(ap);
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
body.querySelectorAll(".qba-use-item").forEach(btn=>{
btn.addEventListener("click",()=>{
const iid=btn.getAttribute("data-iid");
const r=pl.useItem(iid);
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
});
}

_renderGuTab(body) {
const g=this._getGame();
const gs=g.guSystem;
const pl=g.player;
const ap=g.aperture;
if (!gs) return;
const ctxTag=this._getActiveContextTag();
const canCastDirect=(ctxTag==="blessed_land"||ctxTag==="battle");

// 1. Equipped 8-slot bar at top (click slot to select target slot for equipping!)
const slotCards=[];
for (let i=0;i<8;i++) {
const eqGu=gs.getEquippedGuAt(i);
const sel=(this.selectedEquipSlot===i);
const art=eqGu?(global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(eqGu,28,"gu-inline-art") :_esc(eqGu.icon)) :"—";
slotCards.push(`
<div class="qba-eq-slot ${sel?"selected" :""} ${eqGu?"filled" :"empty"}" data-sidx="${i}" title="Chọn Ô ${i + 1} để lắp Cổ từ bên dưới">
<span class="qba-eq-num">${i + 1}</span>
<div class="qba-eq-art">${art}</div>
<div class="qba-eq-name">${eqGu?_esc(eqGu.name.replace(" Cổ","")) :"Trống"}</div>
${eqGu?`<div class="qba-eq-sub">${eqGu.rank}C</div>` :""}
</div>`);
}

// 2. Owned Gu list
let list=[...(gs.ownedGuList||[])];
if (this.guFilter==="refined") list=list.filter(x=>x.isRefined);
else if (this.guFilter==="wild") list=list.filter(x=> !x.isRefined);
else if (this.guFilter==="immortal") list=list.filter(x=>(x.rank||1)>=6);
list.sort((a,b)=>(b.rank - a.rank)||(b.isRefined?1 :0) - (a.isRefined?1 :0));

const guFilters=[["all","Tất Cả"],["refined","Đã Luyện Hóa"],["wild","Cổ Hoang Dã"],["immortal","Tiên Cổ (6C+)"]];
const gfHtml=guFilters.map(([k,lbl])=>`<button class="btn-mini qba-gfbtn ${this.guFilter===k?"active" :""}" data-gf="${k}">${lbl}</button>`).join("");

const listHtml=list.length===0
?`<p class="empty-hint" style="grid-column:1/-1;">Chưa có Cổ Trùng nào trong mục này.</p>`
:list.map(gu=>{
const fullName=global.GuSystem&&global.GuSystem.formatGuNameWithRank?global.GuSystem.formatGuNameWithRank(gu) :`${gu.name} ${gu.rank}C`;
const art=global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gu,32,"gu-inline-art") :_esc(gu.icon);
const eqSlot=gs.equippedGuSlots.indexOf(gu.instanceId);
const hungerPct=Math.round(gu.hunger||0);
const costLbl=gu.rank>=6?`${gu.essenceCost} Tiên Nguyên` :`${gu.essenceCost}% Chân Nguyên`;

let btns="";
if (!gu.isRefined) {
btns=`<button class="btn-mini btn-accent qba-gu-wildref" data-gid="${_esc(gu.instanceId)}">⚗️ Luyện Hóa (${Math.round(gu.refinementProgress||0)}%)</button>`;
} else {
btns=`
<button class="btn-mini btn-primary qba-gu-equip" data-gid="${_esc(gu.instanceId)}">${eqSlot>=0?`✅ Ô ${eqSlot + 1} → Đổi Ô ${this.selectedEquipSlot + 1}` :`📥 Lắp Ô ${this.selectedEquipSlot + 1}`}</button>
${canCastDirect?`<button class="btn-mini btn-accent qba-gu-cast" data-gid="${_esc(gu.instanceId)}">⚡ Dùng Ngay</button>` :""}
${hungerPct<90?`<button class="btn-mini btn-secondary qba-gu-feed" data-gid="${_esc(gu.instanceId)}">🍖 Cho Ăn</button>` :""}
`;
}

return `
<div class="qba-gu-card rank-border-${Number(gu.rank)||1}">
<div style="display:flex;gap:8px;align-items:center;">
${art}
<div style="flex:1;min-width:0;">
<div style="font-weight:bold;color:${gu.rank>=6?"#ffd700" :"#f0ebe1"};font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${_esc(fullName)} ${gu.isVital?"⭐" :""}</div>
<div class="sub-text" style="font-size:10.5px;">${_esc(gu.path)} • Uy lực: ${gu.power} • ${costLbl} • No: <strong style="color:${hungerPct<30?"#ff6b6b" :"#5cc995"};">${hungerPct}%</strong></div>
</div>
</div>
<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:6px;">${btns}</div>
</div>`;
}).join("");

body.innerHTML=`
<div style="margin-bottom:8px;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:5px;">
<strong style="color:#ffd700;font-size:12.5px;">⚡ 8 Ô Cổ Trùng Xuất Chiến (Đang chọn Ô ${this.selectedEquipSlot + 1} để lắp Cổ)</strong>
<div style="display:flex;gap:5px;">
<button id="qba-gu-feedall" class="btn-mini btn-secondary">🍖 Cho Ăn Toàn Bộ</button>
<button id="qba-gu-auto" class="btn-mini btn-accent">⚡ Tự Lắp Mạnh Nhất</button>
</div>
</div>
<div class="qba-eq-grid">${slotCards.join("")}</div>
</div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin:8px 0;">
<div style="display:flex;gap:5px;flex-wrap:wrap;">${gfHtml}</div>
<span class="sub-text">Kho Cổ: ${list.length} con</span>
</div>
<div class="qba-gu-grid">${listHtml}</div>
`;

body.querySelectorAll(".qba-eq-slot").forEach(el=>{
el.addEventListener("click",()=>{
this.selectedEquipSlot=parseInt(el.getAttribute("data-sidx"),10)||0;
this.render();
});
});
body.querySelectorAll(".qba-gfbtn").forEach(btn=>{
btn.addEventListener("click",()=>{this.guFilter=btn.getAttribute("data-gf")||"all";this.render();});
});
const bFA=body.querySelector("#qba-gu-feedall");
if (bFA) bFA.addEventListener("click",()=>{
const r=gs.feedAllHungryGu(pl,85);
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
const bAuto=body.querySelector("#qba-gu-auto");
if (bAuto) bAuto.addEventListener("click",()=>{
const r=gs.autoEquipBestLoadout(pl);
this._notify(r.message,"system");
this._syncAllLiveHUDs();this.render();
});
body.querySelectorAll(".qba-gu-equip").forEach(btn=>{
btn.addEventListener("click",()=>{
const gid=btn.getAttribute("data-gid");
const r=gs.equipGuToSlot(gid,this.selectedEquipSlot);
this._notify(r.message,r.success?"system" :"warning");
this._syncAllLiveHUDs();this.render();
});
});
body.querySelectorAll(".qba-gu-feed").forEach(btn=>{
btn.addEventListener("click",()=>{
const gid=btn.getAttribute("data-gid");
const r=gs.feedGu(gid,pl);
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
});
body.querySelectorAll(".qba-gu-wildref").forEach(btn=>{
btn.addEventListener("click",()=>{
const gid=btn.getAttribute("data-gid");
const r=gs.refineWildGuStep(gid,pl,ap,"auto");
this._notify(r.message,r.success?"cultivation" :"warning");
this._syncAllLiveHUDs();this.render();
});
});
body.querySelectorAll(".qba-gu-cast").forEach(btn=>{
btn.addEventListener("click",()=>{
const gid=btn.getAttribute("data-gid");
const gu=gs.getGuByInstanceId(gid);
if (gu) this._castGuInCurrentWorld(gu);
});
});
}

_renderApertureTab(body) {
const g=this._getGame();
const ap=g.aperture;
const pl=g.player;
const gs=g.guSystem;
const vitalGu=gs&&Array.isArray(gs.ownedGuList)?gs.ownedGuList.find(x=>x.isVital) :null;
const wallPct=Math.min(100,Math.round((ap.wallProgress / Math.max(1,ap.maxWallProgress))*100));
const canBreak=!ap.isImmortal&&ap.wallProgress>=ap.maxWallProgress&& !(ap.rank===5&&ap.subStage>=3);

const showTen=!ap.isImmortal&&ap.aptitude&&ap.aptitude.physique;
let tenHtml="";
if (showTen) {
const cYY=pl.getItemCount("am_duong_chuyen_than_gu");
const cSt=pl.getItemCount("thach_khieu_gu");
const cFr=pl.getItemCount("tinh_khieu_dinh_nguyen_gu");
tenHtml=`
<div class="recipe-preview-box mt-10" style="border-color:#ff9f43;">
<strong style="color:#ffd700;">☯️ Thập Tuyệt Thể — Áp Lực Khiếu Bích: ${Number(ap.wallPressure||0).toFixed(1)}%</strong>
<div class="action-grid-2 mt-5">
<button id="qba-ten-stone" class="btn-mini btn-secondary" ${cSt<=0?"disabled" :""}>🪨 Thạch Khiếu Cổ (-50% | Có: ${cSt})</button>
<button id="qba-ten-freeze" class="btn-mini btn-secondary" ${cFr<=0?"disabled" :""}>⏳ Định Nguyên Cổ (Có: ${cFr})</button>
<button id="qba-ten-yy" class="btn-mini btn-accent" ${cYY<=0?"disabled" :""}>☯️ Âm Dương Chuyển Thân (Có: ${cYY})</button>
</div>
</div>`;
}

let immHtml="";
if (ap.isImmortal&&ap.immortalAperture) {
const ia=ap.immortalAperture;
immHtml=`
<div class="recipe-preview-box mt-10" style="border-color:#5cc995;">
<strong style="color:#7ef7c4;">🌌 Tiên Khiếu: ${_esc(ia.gradeName||"Phúc Địa")} • ${(ia.spaceAcres||0).toLocaleString("vi-VN")} mẫu (${((ia.spaceAcres||0)*3600/1000000).toFixed(2)} km²)</strong>
<div class="info-list mt-5">
<div class="info-row"><span>Tiên Nguyên Lục / Thất / Bát / Cửu:</span> <strong style="color:#ffd700;">${Number(ap.immortalEssence[6]||0).toFixed(1)} | ${Number(ap.immortalEssence[7]||0).toFixed(1)} | ${Number(ap.immortalEssence[8]||0).toFixed(1)} | ${Number(ap.immortalEssence[9]||0).toFixed(1)}</strong></div>
<div class="info-row"><span>Nhân Khí tích lũy:</span> <strong>☯ ${Math.floor(ap.humanQi||0)}</strong></div>
</div>
<div class="action-grid-2 mt-5">
<button id="qba-ap-yield" class="btn-mini btn-primary">🌾 Thu Hoạch Sản Vật Tiên Khiếu</button>
<button id="qba-ap-use-immstone" class="btn-mini btn-accent" ${pl.getItemCount("immortal_stone")<=0?"disabled" :""}>🌟 Luyện Hóa 1 Tiên Thạch (+5 Tiên Nguyên)</button>
</div>
</div>`;
}

body.innerHTML=`
<div class="card-box" style="border-color:#b89758;">
<div class="info-list">
<div class="info-row"><span>Cảnh giới hiện tại:</span> <strong class="highlight-gold">${_esc(ap.getRealmDisplayName())}</strong></div>
<div class="info-row"><span>Tư chất / Biển Nguyên:</span> <strong>${_esc(ap.aptitude?ap.aptitude.gradeName :"---")} (${ap.aptitude?ap.aptitude.maxSeaPercent :0}%)</strong></div>
<div class="info-row"><span>Khiếu Bích / Phẩm chất:</span> <strong>${_esc(ap.getApertureWallName())} • ${_esc(ap.getEssenceQualityName())}</strong></div>
<div class="info-row"><span>Cổ Bản Mệnh trấn khiếu:</span> <strong style="color:#7ef7c4;">${vitalGu?_esc(vitalGu.name) :"---"}</strong></div>
</div>
${!ap.isImmortal?`
<div class="mt-10">
<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px;">
<span>Tiến độ cọ rửa Khiếu Bích:</span>
<strong>${Math.floor(ap.wallProgress||0)} / ${ap.maxWallProgress||100} (${wallPct}%)</strong>
</div>
<div class="progress-track" style="height:8px;"><div class="progress-fill" style="width:${wallPct}%;background:linear-gradient(90deg,#5cc995,#ffd700);"></div></div>
</div>
<div class="action-grid-2 mt-10">
<button id="qba-ap-cult1" class="btn-mini btn-primary">🧘 Vận Công x1</button>
<button id="qba-ap-cult5" class="btn-mini btn-primary">⚡ Vận Công x5</button>
<button id="qba-ap-abs1" class="btn-mini btn-secondary">💎 Hấp Thu 1 Thạch</button>
<button id="qba-ap-absfull" class="btn-mini btn-secondary">💎 Bơm Đầy Biển Nguyên</button>
<button id="qba-ap-relic" class="btn-mini btn-accent">✨ Dùng Xá Lợi Cổ</button>
<button id="qba-ap-break" class="btn-mini btn-primary" ${canBreak?"" :"disabled"}>⚡ Xung Kích Đột Phá</button>
</div>` :""}
${tenHtml}
${immHtml}
</div>
`;

const bind=(id,fn)=>{const el=body.querySelector(id);if (el) el.addEventListener("click",()=>{fn();this._syncAllLiveHUDs();this.render();});};
bind("#qba-ap-cult1",()=>{const r=ap.cultivateStep(5.0,1.0);this._notify(r.success?`🧘 Vận công +${Math.round(r.rawGain||r.gainedXp||0)} XP!` :(r.reason||"Không đủ Chân Nguyên!"),r.success?"cultivation" :"warning");});
bind("#qba-ap-cult5",()=>{
let cnt=0;let tot=0;
for (let i=0;i<5;i++) {const r=ap.cultivateStep(5.0,1.0);if (!r.success) break;cnt++;tot +=Math.round(r.rawGain||r.gainedXp||0);if (r.canBreakthrough) break;}
this._notify(cnt>0?`⚡ Vận công ${cnt} lần (+${tot} XP)!` :"Không đủ Chân Nguyên để vận công!",cnt>0?"cultivation" :"warning");
});
bind("#qba-ap-abs1",()=>{const r=ap.absorbPrimevalStone(1);this._notify(r.message,r.success?"cultivation" :"warning");});
bind("#qba-ap-absfull",()=>{const r=ap.absorbPrimevalStonesToFull(pl);this._notify(r.message,r.success?"cultivation" :"warning");});
bind("#qba-ap-relic",()=>{const r=pl.useRelicGu(ap);this._notify(r.message,r.success?"cultivation" :"warning");});
bind("#qba-ap-break",()=>{const r=ap.attemptBreakthrough();this._notify(r.message,r.success?"cultivation" :"warning");if (r.success&&global.vanCoSfx) global.vanCoSfx.play("breakthrough");});
bind("#qba-ten-stone",()=>{const r=pl.useItem("thach_khieu_gu");this._notify(r.message,r.success?"cultivation" :"warning");});
bind("#qba-ten-freeze",()=>{const r=pl.useItem("tinh_khieu_dinh_nguyen_gu");this._notify(r.message,r.success?"cultivation" :"warning");});
bind("#qba-ten-yy",()=>{const r=pl.useItem("am_duong_chuyen_than_gu");this._notify(r.message,r.success?"cultivation" :"warning");});
bind("#qba-ap-yield",()=>{const r=ap.collectApertureYield(pl);this._notify(r.message,r.success?"loot" :"warning");});
bind("#qba-ap-use-immstone",()=>{const r=pl.useItem("immortal_stone");this._notify(r.message,r.success?"cultivation" :"warning");});
}
}

global.QuickBagApertureUI=QuickBagApertureUI;
global.vanCoQuickBag=new QuickBagApertureUI();
})(window);
