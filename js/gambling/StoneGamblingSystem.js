(function (global) {
"use strict";

const D=global.VanCoStoneGamblingData;

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

class StoneGamblingSystem {
constructor(game) {
this.game=game||null;
this.carver=global.StoneCarvingCanvas?new global.StoneCarvingCanvas(this) :null;
this.reset();
}

reset() {
this.stallStones=[];
this.lastCycleId=-1;
this.stats={opened:0,guFound:0,jackpots:0,duds:0};
}

_hasReconGu() {
const gs=this.game&&this.game.guSystem;
if (!gs|| !Array.isArray(gs.ownedGuList)) return null;
for (const gid of D.RECON_GU_IDS) {
const found=gs.ownedGuList.find(g=>g.id===gid&&g.isRefined);
if (found) return found;
}
return null;
}

ensureStallSynced() {
const g=this.game;
const cycleId=(g&&g.marketRotation&&g.marketRotation.cycleId)?g.marketRotation.cycleId :1;
if (this.stallStones.length===0||this.lastCycleId!==cycleId) {
this.refreshStall(false);
this.lastCycleId=cycleId;
}
}

refreshStall(chargeFee=false) {
const g=this.game;
const pl=g&&g.player;
const ap=g&&g.aperture;
if (chargeFee&&pl) {
if (pl.primevalStones<30) {
if (g.ui) g.ui.addLog("Không đủ 30💎 Nguyên Thạch để đổi lô đá mới tại Đổ Thạch Phường!","warning");
return false;
}
pl.primevalStones -=30;
}
const rank=(ap&&ap.rank)?ap.rank :1;
// Pick 6 diverse stones appropriate for player's rank (always includes accessible + 1-2 aspirational high-tier stones!)
const eligible=D.STONE_TIERS.filter(t=>t.reqRank<=Math.max(3,rank + 1));
const list=[];
for (let i=0;i<6;i++) {
let tier=eligible[i % eligible.length];
if (i===5&&rank>=5) tier=D.STONE_TIERS[D.STONE_TIERS.length - 1];
else if (i===4&&rank>=3) tier=D.getTierById("purple_gold_ore");
list.push(D.generateStoneOffer(tier,i,pl,g?g.guSystem :null));
}
this.stallStones=list;
if (chargeFee&&g&&g.ui) {
g.ui.addLog("🪨 Tiểu nhị Thương Gia Thành vừa đẩy ra 1 lô 6 khối nguyên thạch mới tinh (-30💎)!","system");
g.ui.updateHubTopbar();
}
return true;
}

inspectStone(uid,useReconGu=false) {
const g=this.game;
const pl=g&&g.player;
if (!pl) return;
const stone=this.stallStones.find(s=>s.uid===uid);
if (!stone||stone.opened) return;

const reconGu=this._hasReconGu();
if (useReconGu) {
if (!reconGu) {
if (g.ui) g.ui.addLog("Cần sở hữu Thiên Lý Nhãn Cổ, Địa Thính Nhục Nhĩ Thảo, Trí Tuệ Cổ hoặc Thiên Cơ Tiên Cổ để soi sâu!","warning");
return;
}
if (stone.scoutLevel>=2) return;
const costM=10;
if (pl.mental<costM) {
if (g.ui) g.ui.addLog(`Tinh Thần Lực không đủ (${Math.floor(pl.mental)}/${costM})!`,"warning");
return;
}
pl.mental -=costM;
stone.scoutLevel=2;
// 92% accurate deep reveal using Reconnaissance Gu!
const accurate=(Math.random()<0.92);
if (accurate) {
stone.scoutText=`👁️ [${reconGu.name}] Xuyên thấu vỏ đá: ${this._describeTrueContent(stone,true)}`;
} else {
stone.scoutText=`👁️ [${reconGu.name}] Mạch đá nhiễu loạn nhẹ — dường như ẩn giấu linh khí trung bình.`;
}
if (typeof pl.addPathAttainmentExp==="function") pl.addPathAttainmentExp("Trí Đạo",2);
if (g.ui) {g.ui.addLog(stone.scoutText,"cultivation");g.ui.updateHubTopbar();g.ui.renderMarketTab();}
return;
}

// Standard Wisdom Path / Intuition Inspection (-15 Mental)
if (stone.scoutLevel>=1) return;
const costM=15;
if (pl.mental<costM) {
if (g.ui) g.ui.addLog(`Tinh Thần Lực không đủ (${Math.floor(pl.mental)}/${costM}) để vận dụng Trí Đạo soi đá!`,"warning");
return;
}
pl.mental -=costM;
stone.scoutLevel=1;
const triExp=(pl.pathAttainmentExp&&pl.pathAttainmentExp["Trí Đạo"])||0;
const acc=Math.min(0.90,0.68 + triExp*0.0008);
if (Math.random()<=acc) {
stone.scoutText=`🧠 [Trí Đạo Soi Vân]: ${this._describeTrueContent(stone,false)}`;
} else {
stone.scoutText="🧠 [Trí Đạo Soi Vân]: Linh khí mơ hồ khó đoán — có thể là Nguyên Thạch hoặc đá rỗng.";
}
if (typeof pl.addPathAttainmentExp==="function") pl.addPathAttainmentExp("Trí Đạo",3);
if (g.ui) {g.ui.addLog(stone.scoutText,"system");g.ui.updateHubTopbar();g.ui.renderMarketTab();}
}

_describeTrueContent(stone,deep=false) {
const t=stone.outcomeType;
const pay=stone.payload||{};
if (t==="dud") return deep?"Rỗng tuếch — bên trong chỉ toàn bùn chết, KHÔNG nên mua!" :"Linh khí gần như bằng 0, nghi là đá rỗng.";
if (t==="stones") return deep?`Chứa mạch Nguyên Thạch (~${pay.amount}💎)!` :"Bên trong ánh lên mạch Nguyên Thạch khá dày.";
if (t==="material") return deep?`Ẩn giấu bảo vật 【${pay.name}】!` :"Có khí tức Cổ Tài / Tàn Phương quý giá.";
if (t==="gu") return deep?`CÓ CỔ TRÙNG CÒN SỐNG — 【${pay.rank} Chuyển ${pay.path||"Linh Cổ"}】!` :"Cảm nhận rõ nhịp tim của Cổ Trùng đang ngủ say!";
return deep?`🔥 CỰC PHẨM HIẾM CÓ — 【${stone.rarityLabel}】! MUA NGAY!` :"🔥 Bảo quang rực cháy bên trong — chắc chắn là đại bảo vật!";
}

buyAndCarveStone(uid) {
const g=this.game;
const pl=g&&g.player;
if (!pl) return;
const stone=this.stallStones.find(s=>s.uid===uid);
if (!stone||stone.opened) return;

const passiveDisc=(g.questManager&&typeof g.questManager.getPassiveBonuses==="function")?(g.questManager.getPassiveBonuses().shopDiscount||0) :0;
const discount=Math.min(0.45,(pl.tradeDiscount||0) + passiveDisc);
const finalPrice=Math.max(1,Math.round(stone.price*(1 - discount)));
if (pl.primevalStones<finalPrice) {
if (g.ui) g.ui.addLog(`Không đủ Nguyên Thạch để mua 【${stone.name}】 (Cần ${finalPrice.toLocaleString("vi-VN")}💎)!`,"warning");
return;
}
pl.primevalStones -=finalPrice;
if (g.ui) g.ui.updateHubTopbar();
if (this.carver) {
this.carver.open(stone);
} else {
this.claimOpenedStone(stone);
if (g.ui) g.ui.renderMarketTab();
}
}

claimOpenedStone(stone) {
if (!stone||stone.opened) return {message:"",bannerText:""};
stone.opened=true;
this.stats.opened +=1;
const g=this.game;
const pl=g&&g.player;
const gs=g&&g.guSystem;
const pay=stone.payload||{kind:"dud",fallbackStones:5};
let msg="";
let bannerText="";

if (pay.kind==="dud") {
this.stats.duds +=1;
const fb=pay.fallbackStones||5;
if (pl) pl.primevalStones +=fb;
msg=`🪨 Mài vỡ 【${stone.name}】 — bên trong chỉ là bùn đá chết, thu lại ${fb}💎 vụn nguyên thạch an ủi.`;
bannerText=`<strong style="color:#95a5a6;">BÙN ĐÁ CHẾT!</strong><br><span class="sub-text">Rất tiếc, khối đá này trống rỗng (thu lại ${fb}💎 vụn). Hãy dùng Trí Đạo hoặc Cổ Trinh Sát để chọn đá chuẩn hơn!</span>`;
} else if (pay.kind==="stones") {
if (pl) pl.primevalStones +=pay.amount;
msg=`💎 [Đổ Thạch Thành Công] Mài 【${stone.name}】 trúng mạch Nguyên Thạch tinh thuần: +${pay.amount.toLocaleString("vi-VN")}💎 Nguyên Thạch!`;
bannerText=`<strong style="color:#5cc995;">💎 TRÚNG MẠCH NGUYÊN THẠCH!</strong><br>Nhận ngay <strong>+${pay.amount.toLocaleString("vi-VN")} Nguyên Thạch</strong>!`;
} else if (pay.kind==="immortal_stones") {
this.stats.jackpots +=1;
if (pl) pl.addItem("immortal_stone",pay.amount);
msg=`🌟 [ĐẠI THẮNG ĐỔ THẠCH] Mài vỡ 【${stone.name}】 phát hiện Tiên Thạch Cổ Mạch: +${pay.amount}🌟 Tiên Nguyên Thạch!`;
bannerText=`<strong style="color:#ffd700;">🌟 ĐẠI THẮNG — TIÊN NGUYÊN THẠCH!</strong><br>Nhận ngay <strong>+${pay.amount}🌟 Tiên Nguyên Thạch</strong>!`;
} else if (pay.kind==="item") {
if (pl) pl.addItem(pay.itemId,pay.qty||1);
msg=`📦 [Đổ Thạch Thành Công] Mài vỡ 【${stone.name}】 thu được ${pay.qty||1}x 【${pay.icon} ${pay.name}】!`;
bannerText=`<strong style="color:#4ce6ff;">✨ MÀI RA BẢO VẬT!</strong><br>Thu được <strong>${pay.qty||1}x ${pay.icon} ${_esc(pay.name)}</strong>!`;
} else if (pay.kind==="gu") {
this.stats.guFound +=1;
if (pay.isJackpot) this.stats.jackpots +=1;
let added=null;
if (gs) {
added=gs.addGuToStorage(pay.guId,{rank:pay.rank||1,isRefined:true,refinementProgress:100});
}
const fullLabel=(added&&global.GuSystem&&global.GuSystem.formatGuNameWithRank)
?global.GuSystem.formatGuNameWithRank(added)
:`${pay.name} (${pay.rank} Chuyển)`;
msg=`🪲 [${pay.isJackpot?"ĐẠI THẮNG ĐỔ THẠCH" :"MÀI RA CỔ TRÙNG"}] Khai thạch 【${stone.name}】 giải phong ấn thành công 【${fullLabel}】 (Đã Luyện Hóa sẵn trong Kho Cổ)!`;
bannerText=`<strong style="color:#ffd700;">${pay.isJackpot?"👑 ĐẠI THẮNG ĐỔ THẠCH!" :"🪲 GIẢI PHONG ẤN CỔ TRÙNG!"}</strong><br>Thu phục ngay <strong>${_esc(fullLabel)}</strong> vào Kho Cổ!`;
}

if (pl&&typeof pl.addPathAttainmentExp==="function") {
pl.addPathAttainmentExp("Trí Đạo",2);
pl.addPathAttainmentExp("Vận Đạo",2);
}
if (g&&g.ui) g.ui.addLog(msg,pay.kind==="dud"?"warning" :"loot");
if (g&&g.autoSaveNow) g.autoSaveNow("stone_gamble");
return {message:msg,bannerText};
}

renderPanel(container) {
if (!container|| !this.game|| !this.game.player) return;
this.ensureStallSynced();
const g=this.game;
const pl=g.player;
const reconGu=this._hasReconGu();
const passiveDisc=(g.questManager&&typeof g.questManager.getPassiveBonuses==="function")?(g.questManager.getPassiveBonuses().shopDiscount||0) :0;
const discount=Math.min(0.45,(pl.tradeDiscount||0) + passiveDisc);
const triAtt=pl.pathAttainment["Trí Đạo"]||"Phàm Cấp";
const vanMarks=Math.floor(pl.getEffectiveDaoMarks("Vận Đạo")||0);

const cardsHtml=this.stallStones.map(st=>{
const price=Math.max(1,Math.round(st.price*(1 - discount)));
const openedCls=st.opened?"sg-card-opened" :"";
const scoutHtml=st.scoutText
?`<div class="sg-scout-box">${_esc(st.scoutText)}</div>`
:`<div class="sg-clue-box">🔎 <em>"${_esc(st.surfaceClue)}"</em></div>`;

const actionsHtml=st.opened
?`<div class="badge" style="width:100%;text-align:center;border-color:${st.auraColor};color:${st.auraColor};padding:6px;">Đã mài: ${_esc(st.rarityLabel)}</div>`
:`
<div class="action-grid-2 mt-5">
<button class="btn-mini btn-secondary sg-btn-scout" data-uid="${_esc(st.uid)}" ${st.scoutLevel>=1?"disabled" :""}>🧠 Soi Trí Đạo (-15🧠)</button>
<button class="btn-mini btn-accent sg-btn-recon" data-uid="${_esc(st.uid)}" ${(!reconGu||st.scoutLevel>=2)?"disabled" :""} title="${reconGu?`Dùng ${reconGu.name} xuyên thấu vỏ đá` :"Cần có Thiên Lý Nhãn Cổ / Địa Thính Nhục Nhĩ Thảo"}">👁️ Cổ Trinh Sát (-10🧠)</button>
</div>
<button class="btn-primary sg-btn-buy mt-5" data-uid="${_esc(st.uid)}" style="width:100%;">🪨 Mua & Mài Đá (💎 ${price.toLocaleString("vi-VN")})</button>
`;

return `
<div class="card-box sg-stone-card ${openedCls}" style="border-color:${st.color};justify-content:space-between;gap:8px;">
<div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;">
<strong style="color:${st.color};font-size:14px;">🪨 ${_esc(st.name)}</strong>
<span class="badge" style="border-color:${st.color};color:${st.color};">${_esc(st.badge)}</span>
</div>
<div class="sub-text" style="margin-top:3px;">Trọng lượng: <strong>${st.weightKg} cân</strong> • Phẩm cổ tiềm năng: <strong>${st.guRankRange?`${st.guRankRange[0]}–${st.guRankRange[1]}C` :st.badge}</strong></div>
${scoutHtml}
</div>
<div>${actionsHtml}</div>
</div>`;
}).join("");

container.innerHTML=`
<div class="card-box sg-header-banner" style="grid-column:1/-1;border-color:#d4af37;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
<div>
<strong style="color:#ffd700;font-size:15.5px;">🪨 Đổ Thạch Phường — Thương Gia Thành Đệ Nhất Thạch Phường</strong>
<p class="sub-text" style="margin-top:3px;">Mỗi khối nguyên thạch đều có ruột cố định thật 100%! Hãy đọc vân đá, dùng <strong>Trí Đạo (${_esc(triAtt)})</strong> hoặc <strong>Cổ Trinh Sát</strong> (${reconGu?`<strong style="color:#7ef7c4;">${_esc(reconGu.name)} ✓</strong>` :`<span style="color:#ff9f43;">Chưa có — mua Thiên Lý Nhãn / Địa Thính ở Thương Đội</span>`}) để soi xuyên vỏ đá rồi tự tay mài từng lớp!</p>
</div>
<div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
<span class="badge" style="border-color:#7ef7c4;color:#7ef7c4;">Đã mài: ${this.stats.opened} | Cổ: ${this.stats.guFound} | Đại Thắng: ${this.stats.jackpots}</span>
<span class="badge" style="border-color:#ffd700;color:#ffd700;">🎲 Vận Đạo: ${vanMarks}</span>
<button id="sg-btn-refresh-stall" class="btn-accent" style="padding:6px 12px;font-size:12px;">🔄 Đổi Lô Đá Mới (-30💎)</button>
</div>
</div>
</div>
${cardsHtml}
`;

const refBtn=container.querySelector("#sg-btn-refresh-stall");
if (refBtn) refBtn.addEventListener("click",()=>{
if (this.refreshStall(true)) this.renderPanel(container);
});
container.querySelectorAll(".sg-btn-scout").forEach(btn=>{
btn.addEventListener("click",()=>this.inspectStone(btn.getAttribute("data-uid"),false));
});
container.querySelectorAll(".sg-btn-recon").forEach(btn=>{
btn.addEventListener("click",()=>this.inspectStone(btn.getAttribute("data-uid"),true));
});
container.querySelectorAll(".sg-btn-buy").forEach(btn=>{
btn.addEventListener("click",()=>this.buyAndCarveStone(btn.getAttribute("data-uid")));
});
}

toSaveData() {
return {
stats:{...this.stats},
lastCycleId:this.lastCycleId
};
}

fromSaveData(data) {
this.reset();
if (!data||typeof data!=="object") return;
if (data.stats&&typeof data.stats==="object") {
this.stats={
opened:Math.max(0,Number(data.stats.opened)||0),
guFound:Math.max(0,Number(data.stats.guFound)||0),
jackpots:Math.max(0,Number(data.stats.jackpots)||0),
duds:Math.max(0,Number(data.stats.duds)||0)
};
}
}
}

global.StoneGamblingSystem=StoneGamblingSystem;
})(window);
