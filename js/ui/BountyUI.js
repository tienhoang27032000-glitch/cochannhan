(function (global) {
"use strict";

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function _renderBountyPanel(host) {
const sys=this.game&&this.game.bountySystem;
const pl=this.player;
const ap=this.aperture;
const D=global.VanCoBountyData;
if (!host|| !sys|| !pl|| !D) return;

const wTier=sys.getWantedTier();
const alignLabel=typeof pl.getAlignmentLabel==="function"?pl.getAlignmentLabel() :`Chính/Ma (${pl.alignment||0})`;
const rank=(ap&&ap.rank)?ap.rank :1;
const activeB=sys.getActiveBounty();
const triExp=(pl.pathAttainmentExp&&pl.pathAttainmentExp["Trí Đạo"])||0;
const hasAttitude=Boolean(this.guSystem&&this.guSystem.ownedGuList&&this.guSystem.ownedGuList.some(x=>x.id==="thai_do_tien_gu"&&x.isRefined));
const cleanseDisc=Math.min(0.45,triExp*0.001 + (hasAttitude?0.30 :0));
const cleanseCost=Math.max(40,Math.round((85 + sys.notoriety*2.2)*(1 - cleanseDisc)));
const donateCost=Math.max(60,rank*90);

const bountyCardsHtml=D.DEMONIC_BOUNTIES.map(b=>{
const isActive=(sys.activeBountyId===b.id);
const cleared=(sys.completedCounts&&sys.completedCounts[b.id])||0;
const rankOk=(rank>=b.reqRank);
const guMeta=(global.GuSystem&&global.GuSystem.GU_DATABASE&&global.GuSystem.GU_DATABASE[b.guDropId])||{name:b.guDropId,icon:"🪲"};
const guImg=global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(b.guDropId,20,"gu-inline-art",Math.min(5,b.rank)) :_esc(guMeta.icon);
return `
<div class="list-card ${isActive?"bounty-card-active" :""}" style="border-color:${isActive?"#ffd700" :b.color};">
<div class="list-card-header" style="flex-wrap:wrap;gap:6px;">
<span style="color:${b.color};font-weight:bold;">🎯 ${_esc(b.name)} (${b.rank} Chuyển)</span>
<span class="badge" style="border-color:${isActive?"#ffd700" :"#5cc995"};color:${isActive?"#ffd700" :"#7ef7c4"};">${isActive?"🔥 Đang Truy Sát" :`Đã diệt: ${cleared}`}</span>
</div>
<p class="sub-text">${_esc(b.desc)}</p>
<div class="sub-text" style="margin-top:4px;color:#e2bf75;">📍 Ẩn nấp: <strong>${_esc(b.stageName)}</strong> (hoặc mọi ải ${b.reqRank}C+)</div>
<div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;margin-top:5px;">
<span style="font-size:11.5px;color:#5cc995;display:inline-flex;align-items:center;gap:4px;flex-wrap:wrap;">
Thưởng: 💎${b.rewardStones.toLocaleString("vi-VN")} • 🏅${b.rewardMerit} • +${b.rewardAlignment} Chính • ${guImg} ${_esc(guMeta.name)}
</span>
<div style="display:flex;gap:5px;">
${isActive
?`<button class="btn-mini btn-primary bnt-btn-go" data-stage="${b.stageId}">⚔️ Vào Map Truy Sát</button>
<button class="btn-mini btn-danger bnt-btn-abandon">Hủy</button>`
:`<button class="btn-mini btn-accent bnt-btn-accept" data-bid="${b.id}" ${rankOk?"" :"disabled"}>${rankOk?"🎯 Nhận Lệnh Truy Nã" :`Cần ${b.reqRank} Chuyển`}</button>`
}
</div>
</div>
</div>`;
}).join("");

host.innerHTML=`
<div class="card-box mt-15" style="border-color:${wTier.color};">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;border-bottom:1px solid rgba(184,151,88,0.3);padding-bottom:8px;">
<div>
<h3 style="margin:0;color:#ffd700;">⚖️ Bảng Truy Nã, Mai Phục & Đấu Trí Chính – Ma</h3>
<p class="sub-text" style="margin-top:2px;">Cướp giết NPC & làm việc Ma Đạo sẽ tăng Độ Truy Nã và kích hoạt <strong>Thiết Gia Thần Bộ / Giám Sát Trung Châu mai phục</strong> ngay trong trận! Hoặc nhận Lệnh Truy Nã đi săn Ma Đầu đoạt Túi Trữ Vật.</p>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
<span class="badge" style="border-color:#7ef7f0;color:#7ef7f0;">☯ ${alignLabel}</span>
<span class="badge" style="border-color:${wTier.color};color:${wTier.color};">${wTier.badge} (${sys.notoriety}đ)</span>
<span class="badge" style="border-color:#ffd700;color:#ffd700;">⚔️ Phá Mai Phục: ${sys.ambushesDefeated}</span>
</div>
</div>

<div class="bnt-status-row mt-10">
<div class="bnt-wanted-box" style="border-color:${wTier.color};">
<strong style="color:${wTier.color};">${wTier.badge} — ${_esc(wTier.name)}</strong>
<p class="sub-text" style="margin-top:3px;">${_esc(wTier.desc)}${sys.forcedAmbushNext?" <strong style='color:#ff5252;'>(⚡ Đã gửi Chiến Thư: chắc chắn có Mai Phục trận tới!)</strong>" :""}</p>
<div class="progress-track mt-5" style="height:7px;">
<div class="progress-fill" style="width:${Math.min(100,Math.round((sys.notoriety/300)*100))}%;background:linear-gradient(90deg,#f7c948,#ff5252,#c278ff);"></div>
</div>
</div>
<div class="bnt-intrigue-grid">
<button id="bnt-act-cleanse" class="btn-mini btn-secondary" ${sys.notoriety<=0?"disabled" :""} title="Dùng Trí Đạo & Nguyên Thạch xóa Hải Bộ Văn Thư">🎭 Tẩy Trắng Truy Nã (-${cleanseCost}💎)</button>
<button id="bnt-act-donate" class="btn-mini btn-primary" title="Quyên góp Chính Đạo nhận Cống Hiến & Chính Khí">🏛️ Quyên Góp Chính Đạo (-${donateCost}💎)</button>
<button id="bnt-act-raid" class="btn-mini btn-accent" title="Đột kích cướp thương đội bóng đêm lấy nhiều Nguyên Thạch (+38 Truy Nã)">🩸 Cướp Thương Đội Đêm (-25🧠)</button>
<button id="bnt-act-provoke" class="btn-mini btn-danger" title="Chủ động dụ Thiết Gia Thần Bộ mai phục trận tới để phản sát cướp túi đồ">⚔️ Khiêu Chiến Thần Bộ</button>
</div>
</div>

<div style="margin-top:12px;">
<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;flex-wrap:wrap;gap:6px;">
<strong style="color:#ffd700;">📜 Hải Bộ Văn Thư — Danh Sách Truy Nã Ma Đầu (8 Mục Tiêu)</strong>
<span class="sub-text">${activeB?`Đang theo dõi: <strong style="color:#ffd700;">${_esc(activeB.name)}</strong> (${_esc(activeB.stageName)})` :"Chưa nhận Lệnh Truy Nã nào"}</span>
</div>
<div class="bnt-bounty-grid">${bountyCardsHtml}</div>
</div>
</div>
`;

const bindAct=(id,act)=>{
const el=host.querySelector(id);
if (!el) return;
el.addEventListener("click",()=>{
const res=sys.performIntrigueAction(act);
this.addLog(res.message,res.success?(act==="demonic_raid"||act==="provoke_ambush"?"warning" :"cultivation") :"warning");
this.updateHubTopbar();
this.renderFactionTab();
});
};
bindAct("#bnt-act-cleanse","bribe_cleanse");
bindAct("#bnt-act-donate","righteous_donation");
bindAct("#bnt-act-raid","demonic_raid");
bindAct("#bnt-act-provoke","provoke_ambush");

host.querySelectorAll(".bnt-btn-accept").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=sys.acceptBounty(btn.getAttribute("data-bid"));
this.addLog(res.message,res.success?"system" :"warning");
this.renderFactionTab();
});
});
const bAb=host.querySelector(".bnt-btn-abandon");
if (bAb) bAb.addEventListener("click",()=>{
const res=sys.abandonBounty();
this.addLog(res.message,"warning");
this.renderFactionTab();
});
host.querySelectorAll(".bnt-btn-go").forEach(btn=>{
btn.addEventListener("click",()=>{
const sid=btn.getAttribute("data-stage");
if (this.game&&typeof this.game.enterStageBattle==="function") {
this.game.enterStageBattle(sid);
}
});
});
}

function _updateBattleBountyAlert() {
const el=document.getElementById("battle-bounty-alert");
const sys=this.game&&this.game.bountySystem;
if (!el|| !sys) return;
const txt=sys.alertBannerTimer>0?sys.alertBannerText :"";
if (this._lastBountyAlertSig===txt) return;
this._lastBountyAlertSig=txt;
if (!txt) {
el.classList.add("hidden");
el.textContent="";
} else {
el.textContent=txt;
el.style.borderColor=sys.alertBannerColor||"#ff5252";
el.style.color=sys.alertBannerColor||"#ff8a8a";
el.classList.remove("hidden");
}
}

global.BountyUI={
renderBountyPanel:_renderBountyPanel,
updateBattleBountyAlert:_updateBattleBountyAlert
};
})(window);
