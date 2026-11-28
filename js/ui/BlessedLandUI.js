(function (global) {
"use strict";

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function _drawInteractiveMapCanvas(canvas,sys) {
if (!canvas|| !sys) return;
const ctx=canvas.getContext("2d");
const D=global.VanCoBlessedLandData;
const W=canvas.width;const H=canvas.height;
const cols=D.GRID_COLS;const rows=D.GRID_ROWS;
const padX=16;const padY=16;
const cellW=(W - padX*2)/cols;
const cellH=(H - padY*2)/rows;

// Background meadow / celestial jade terrain
const bg=ctx.createRadialGradient(W*0.5,H*0.5,30,W*0.5,H*0.5,W*0.62);
bg.addColorStop(0,"#142e24");bg.addColorStop(0.65,"#0c1b17");bg.addColorStop(1,"#060b0f");
ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);

const centerOf=(idx)=>{
const r=Math.floor(idx / cols);const c=idx % cols;
return {x:padX + c*cellW + cellW*0.5,y:padY + r*cellH + cellH*0.5};
};

// Draw glowing Synergy Connection Lines FIRST!
const edges=sys.getAllSynergyEdges();
for (const e of edges) {
const p1=centerOf(e.from);const p2=centerOf(e.to);
ctx.save();
ctx.strokeStyle=e.color||"#7ef7c4";
ctx.globalAlpha=0.72;
ctx.lineWidth=4.5;
ctx.beginPath();ctx.moveTo(p1.x,p1.y);ctx.lineTo(p2.x,p2.y);ctx.stroke();
ctx.restore();
}

// Draw 5x4 Plots
const army=sys.game&&sys.game.beastArmy;
for (let i=0;i<cols*rows;i++) {
const r=Math.floor(i / cols);const c=i % cols;
const x=padX + c*cellW + 5;
const y=padY + r*cellH + 5;
const w=cellW - 10;const h=cellH - 10;
const plot=sys.plots[i];
const isSel=(sys.selectedPlotIdx===i);

if (plot) {
const tpl=D.getBuildingType(plot.typeId);
const syn=sys.getPlotSynergyInfo(i);
ctx.fillStyle=tpl?tpl.bgCol :"#172922";
ctx.fillRect(x,y,w,h);
ctx.strokeStyle=isSel?"#ffd700" :(tpl?tpl.color :"#5cc995");
ctx.lineWidth=isSel?3.0 :1.6;
ctx.strokeRect(x,y,w,h);

ctx.font="24px sans-serif";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillText(tpl?tpl.icon :"🏡",x + w*0.5,y + h*0.38);

ctx.font="bold 10.5px Georgia";ctx.fillStyle="#f2e9d8";
const shortName=(tpl?tpl.name :"Ô").split(" ").slice(0,2).join(" ");
ctx.fillText(shortName,x + w*0.5,y + h*0.72);

ctx.font="bold 9.5px Georgia";ctx.fillStyle="#ffd700";
ctx.fillText(`Lv.${plot.level||1}${syn.mult>1?` (x${syn.mult})` :""}`,x + w*0.5,y + h*0.89);

// Show grazing beast badge if pasture has a beast!
if (plot.typeId==="beast_pasture"&&plot.beastUid&&army) {
const rec=army.getStoredBeast(plot.beastUid);
if (rec) {
ctx.font="15px sans-serif";ctx.fillText(rec.icon||"🐺",x + w - 14,y + 15);
}
}
} else {
ctx.fillStyle=isSel?"rgba(255,215,0,0.14)" :"rgba(10,16,22,0.58)";
ctx.fillRect(x,y,w,h);
ctx.strokeStyle=isSel?"#ffd700" :"rgba(184,151,88,0.28)";
ctx.lineWidth=isSel?2.6 :1.1;
ctx.strokeRect(x,y,w,h);
ctx.font="11px Georgia";ctx.textAlign="center";ctx.textBaseline="middle";
ctx.fillStyle=isSel?"#ffd700" :"rgba(170,185,175,0.45)";
ctx.fillText(`+ Ô #${i + 1}`,x + w*0.5,y + h*0.5);
}
}
}

function _renderBlessedLandTab() {
const host=document.getElementById("blessed-land-tab-root");
const sys=this.game&&this.game.blessedLand;
const pl=this.player;
const ap=this.aperture;
const D=global.VanCoBlessedLandData;
if (!host|| !sys|| !pl|| !D) return;

const prod=sys.getProductionSummary();
const bCount=sys.getBuildingCount();
const rank=(ap&&ap.rank)?ap.rank :1;
const landTitle=(ap&&ap.isImmortal)?`${ap.immortalAperture.gradeName} (${ap.immortalAperture.spaceAcres.toLocaleString("vi-VN")} mẫu)` :"Tiểu Linh Địa Trong Không Khiếu";
const fCost=D.getFormationUpgradeCost(sys.formationLevel);

// Format currently stored uncollected yields
const itemDb=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
const storedParts=[];
if (Math.floor(sys.storedStones||0)>0) storedParts.push(`💎 ${Math.floor(sys.storedStones).toLocaleString("vi-VN")}`);
if (Math.floor(sys.storedImmortalStones||0)>0) storedParts.push(`🌟 ${Math.floor(sys.storedImmortalStones)}`);
for (const [iid,val] of Object.entries(sys.storedItems||{})) {
const cnt=Math.floor(val||0);
if (cnt>0) {
const m=itemDb[iid]||{icon:"📦",name:iid};
storedParts.push(`${m.icon} ${cnt}x ${m.name}`);
}
}
const storedText=storedParts.length>0?storedParts.join(" • ") :"Đang tích tụ sản vật sinh thái...";

// Threat Banner (if Raid/Calamity active!)
let threatBannerHtml="";
if (sys.activeThreat) {
const rInfo=D.RAID_TYPES[sys.activeThreat.type]||D.RAID_TYPES.thief_raid;
threatBannerHtml=`
<div class="card-box mb-10 bl-threat-banner" style="border-color:${rInfo.color};">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
<div>
<strong style="color:${rInfo.color};font-size:15px;">🚨 KHẨN CẤP: ${rInfo.icon} ${_esc(rInfo.name)} (Còn ${Math.ceil(sys.activeThreat.deadlineSec)}s)</strong>
<p class="sub-text" style="margin-top:3px;">${_esc(rInfo.desc)}</p>
</div>
<button id="bl-btn-defend-now" class="btn-danger" style="padding:9px 16px;font-weight:bold;">⚔️ Dịch Chuyển Về Phòng Thủ Ngay!</button>
</div>
</div>`;
}

// Inspector Panel for selected plot
const idx=Math.max(0,Math.min(D.GRID_COLS*D.GRID_ROWS - 1,sys.selectedPlotIdx||0));
const selPlot=sys.plots[idx];
let inspectorHtml="";
if (selPlot) {
const tpl=D.getBuildingType(selPlot.typeId);
const syn=sys.getPlotSynergyInfo(idx);
const upCost=D.getUpgradeCost(tpl,selPlot.level||1);
const synListHtml=syn.links.length>0
?syn.links.map(l=>`<span class="badge" style="border-color:${l.color};color:${l.color};">✨ ${_esc(l.name)} (+${Math.round(l.bonus*100)}%)</span>`).join(" ")
:`<span class="sub-text">Chưa có liên kết — ${_esc(tpl.synergyDesc)}</span>`;

let pastureHtml="";
if (selPlot.typeId==="beast_pasture") {
const army=this.game&&this.game.beastArmy;
const beasts=army?army.storedBeasts :[];
const opts=[
`<option value="">— Không thả Linh Thú —</option>`,
...beasts.map(b=>`<option value="${_esc(b.uid)}" ${selPlot.beastUid===b.uid?"selected" :""}>${_esc(b.icon)} ${_esc(b.name)} (${b.rank}C • Lv.${b.level})</option>`)
].join("");
pastureHtml=`
<div class="recipe-preview-box mt-10" style="border-color:#e6a84c;">
<label for="bl-pasture-select" style="font-size:12px;color:#ffd700;display:block;margin-bottom:5px;">🐺 Thả Dị Thú Từ Thú Quyển Vào Nuôi (+30% ô cạnh & tự chiến đấu phòng thủ):</label>
<select id="bl-pasture-select" style="width:100%;">${opts}</select>
</div>`;
}

inspectorHtml=`
<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #3a3124;padding-bottom:6px;">
<strong style="color:${tpl.color};font-size:15px;">${tpl.icon} ${_esc(tpl.name)} (Ô #${idx + 1} • Cấp ${selPlot.level}/5)</strong>
<span class="badge" style="border-color:#7ef7c4;color:#7ef7c4;">Hệ số sinh thái: x${syn.mult}</span>
</div>
<p class="sub-text mt-5">${_esc(tpl.desc)}</p>
<div class="mt-5" style="display:flex;gap:5px;flex-wrap:wrap;">${synListHtml}</div>
${pastureHtml}
<div class="action-grid-2 mt-10">
<button id="bl-btn-upgrade" class="btn-primary" ${(selPlot.level||1)>=5?"disabled" :""}>${(selPlot.level||1)>=5?"Đã Cấp Tối Đa (Lv.5)" :`⬆️ Nâng Cấp Lv.${(selPlot.level||1) + 1} (💎${upCost.stones}${upCost.immortal>0?` + 🌟${upCost.immortal}` :""})`}</button>
<button id="bl-btn-demolish" class="btn-danger">🔨 Tháo Dỡ (Hoàn 50%💎)</button>
</div>`;
} else {
const buildCards=D.BUILDING_LIST.map(b=>{
const okRank=(rank>=b.reqRank);
return `
<div class="bl-build-item ${okRank?"" :"locked"}" data-btype="${b.id}" style="border-color:${b.color};">
<div style="display:flex;justify-content:space-between;align-items:center;">
<strong style="color:${b.color};font-size:12.5px;">${b.icon} ${_esc(b.name)}</strong>
<span class="sub-text">💎${b.costStones}${b.costImmortal>0?` + 🌟${b.costImmortal}` :""}</span>
</div>
<div class="sub-text" style="font-size:11px;margin-top:2px;">${_esc(b.synergyDesc)}</div>
<button class="btn-mini btn-primary bl-btn-place mt-5" data-btype="${b.id}" style="width:100%;" ${okRank?"" :"disabled"}>${okRank?`Xây Tại Ô #${idx + 1}` :`Yêu Cầu ${b.reqRank} Chuyển`}</button>
</div>`;
}).join("");
inspectorHtml=`
<div style="border-bottom:1px solid #3a3124;padding-bottom:6px;">
<strong style="color:#ffd700;font-size:15px;">🌱 Ô Đất Trống #${idx + 1} — Chọn Tài Nguyên Điểm Để Xây Dựng</strong>
<p class="sub-text">Đặt các ô có cộng hưởng sát cạnh nhau (trên/dưới/trái/phải) để nối thành <strong>Chuỗi Sinh Thái</strong> tăng mạnh sản lượng!</p>
</div>
<div class="bl-build-grid mt-10">${buildCards}</div>`;
}

host.innerHTML=`
${threatBannerHtml}
<div class="card-box mb-10" style="border-color:#5cc995;">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
<div>
<strong style="color:#ffd700;font-size:15px;">🏡 ${_esc(landTitle)} — ${bCount}/20 Ô Đã Xây • ${prod.totalSynergyCount} Chuỗi Sinh Thái</strong>
<div class="sub-text" style="margin-top:3px;">Sản lượng tự động: <strong style="color:#7ef7c4;">💎 +${prod.stonesPerMin}/phút</strong>${prod.immPerMin>0?` • <strong style="color:#ffd700;">🌟 +${prod.immPerMin}/phút</strong>` :""} • Trận Pháp Hộ Địa: <strong style="color:#4ce6ff;">Lv.${sys.formationLevel}/5</strong> • Thắng Phòng Thủ: <strong>${sys.defensesWon}</strong></div>
<div class="sub-text" style="margin-top:3px;color:#ffeaa7;">Kho đang tích tụ: <strong>${storedText}</strong></div>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<button id="bl-btn-enter-world" class="btn-primary" style="padding:7px 13px;border-color:#7ef7f0;color:#7ef7f0;">🚪 Tiến Vào Phúc Địa (Khám Phá)</button>
<button id="bl-btn-collect" class="btn-primary" style="padding:7px 12px;">🌾 Thu Hoạch Tất Cả</button>
<button id="bl-btn-up-form" class="btn-accent" style="padding:7px 12px;" ${sys.formationLevel>=5?"disabled" :""}>${sys.formationLevel>=5?"🛡️ Trận Pháp Lv.5 (Max)" :`🛡️ Nâng Trận Pháp Lv.${sys.formationLevel + 1} (💎${fCost.stones})`}</button>
<button id="bl-btn-drill-thief" class="btn-secondary" style="padding:7px 10px;" title="Chủ động đón đánh Cổ Tiên trộm đồ để kiếm thưởng">🦹 Đánh Đạo Tặc</button>
<button id="bl-btn-drill-calamity" class="btn-danger" style="padding:7px 10px;" title="Chủ động dẫn Thiên Kiếp / Địa Tai vào Phúc Địa để độ kiếp trực tiếp">🌩️ Đón Tai Kiếp</button>
</div>
</div>
</div>

<div class="split-2">
<div class="card-box">
<h3>🗺️ Bản Đồ Phúc Địa Tương Tác (Nhấn vào ô để Xây / Nâng Cấp)</h3>
<canvas id="blessedLandMapCanvas" width="520" height="330" style="width:100%;height:auto;border:1.5px solid #5cc995;border-radius:8px;cursor:pointer;"></canvas>
<p class="sub-text mt-5">Đường sáng nối giữa các ô biểu thị <strong>Chuỗi Sinh Thái Cộng Hưởng</strong> đang hoạt động! Nhấn vào ô bất kỳ để chỉnh sửa.</p>
</div>
<div class="card-box">
<h3>🔧 Quản Lý Ô Đất Đã Chọn</h3>
${inspectorHtml}
</div>
</div>
`;

// Draw interactive map & bind click handler
const cv=host.querySelector("#blessedLandMapCanvas");
_drawInteractiveMapCanvas(cv,sys);
if (cv) {
cv.addEventListener("click",(e)=>{
const rect=cv.getBoundingClientRect();
const lx=((e.clientX - rect.left)/Math.max(1,rect.width))*cv.width;
const ly=((e.clientY - rect.top)/Math.max(1,rect.height))*cv.height;
const padX=16;const padY=16;
const cellW=(cv.width - padX*2)/D.GRID_COLS;
const cellH=(cv.height - padY*2)/D.GRID_ROWS;
const col=Math.floor((lx - padX)/cellW);
const row=Math.floor((ly - padY)/cellH);
if (col>=0&&col<D.GRID_COLS&&row>=0&&row<D.GRID_ROWS) {
sys.selectedPlotIdx=row*D.GRID_COLS + col;
this.renderBlessedLandTab();
}
});
}

// Bind actions
const bDef=host.querySelector("#bl-btn-defend-now");
if (bDef) bDef.addEventListener("click",()=>sys.startDefenseBattle());
const bEntW=host.querySelector("#bl-btn-enter-world");
if (bEntW) bEntW.addEventListener("click",()=>sys.openExplorer());
const bCol=host.querySelector("#bl-btn-collect");
if (bCol) bCol.addEventListener("click",()=>{
const res=sys.collectAllYield();
this.addLog(res.message,res.success?"loot" :"warning");
this.updateHubTopbar();
this.renderBlessedLandTab();
});
const bUpF=host.querySelector("#bl-btn-up-form");
if (bUpF) bUpF.addEventListener("click",()=>{
const res=sys.upgradeDefenseFormation();
this.addLog(res.message,res.success?"cultivation" :"warning");
this.updateHubTopbar();
this.renderBlessedLandTab();
});
const bDrT=host.querySelector("#bl-btn-drill-thief");
if (bDrT) bDrT.addEventListener("click",()=>sys.startDefenseBattle("thief_raid"));
const bDrC=host.querySelector("#bl-btn-drill-calamity");
if (bDrC) bDrC.addEventListener("click",()=>sys.startDefenseBattle("calamity_siege"));

host.querySelectorAll(".bl-btn-place").forEach(btn=>{
btn.addEventListener("click",()=>{
const res=sys.buildAtPlot(idx,btn.getAttribute("data-btype"));
this.addLog(res.message,res.success?"loot" :"warning");
this.updateHubTopbar();
this.renderBlessedLandTab();
});
});
const bUp=host.querySelector("#bl-btn-upgrade");
if (bUp) bUp.addEventListener("click",()=>{
const res=sys.upgradePlot(idx);
this.addLog(res.message,res.success?"cultivation" :"warning");
this.updateHubTopbar();
this.renderBlessedLandTab();
});
const bDem=host.querySelector("#bl-btn-demolish");
if (bDem) bDem.addEventListener("click",()=>{
if (confirm("Tháo dỡ công trình tại ô này (hoàn lại 50% Nguyên Thạch)?")) {
const res=sys.demolishPlot(idx);
this.addLog(res.message,"warning");
this.updateHubTopbar();
this.renderBlessedLandTab();
}
});
const selPasture=host.querySelector("#bl-pasture-select");
if (selPasture) selPasture.addEventListener("change",()=>{
const res=sys.assignBeastToPasture(idx,selPasture.value||null);
this.addLog(res.message,res.success?"system" :"warning");
this.renderBlessedLandTab();
});
}

global.BlessedLandUI={
renderBlessedLandTab:_renderBlessedLandTab
};
})(window);
