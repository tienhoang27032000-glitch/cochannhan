(function (global) {
"use strict";

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function _renderReverseFlowTab() {
const host=document.getElementById("reverse-flow-tab-root");
const sys=this.game&&this.game.reverseFlow;
const D=global.VanCoReverseFlowData;
if (!host|| !sys|| !D) return;

const itemDb=(global.PlayerManager&&global.PlayerManager.ITEM_DATABASE)||{};
const milestonesHtml=D.MILESTONES.map(m=>{
const done=sys.claimedMilestones.includes(m.floor);
const meta=itemDb[m.itemId]||{icon:"📦",name:m.itemId};
return `
<div class="list-card" style="border-color:${done?"#5cc995" :"#3c4b5c"};">
<div class="list-card-header">
<strong style="color:${done?"#7ef7c4" :"#ffd700"};">🏆 Tầng ${m.floor} — ${_esc(m.title)}</strong>
<span class="badge" style="border-color:${done?"#5cc995" :"#8c9aa8"};color:${done?"#7ef7c4" :"#b3aa9c"};">${done?"✅ Đã Nhận" :`Kỷ lục: ${sys.bestFloor}/${m.floor}`}</span>
</div>
<div class="sub-text" style="margin-top:4px;">Thưởng mốc đầu tiên: <strong style="color:#ffd700;">💎 ${m.stones.toLocaleString("vi-VN")}</strong> • 🏅 ${m.merit} Cống Hiến • ${m.itemQty}x ${meta.icon} ${_esc(meta.name)}</div>
</div>`;
}).join("");

const boonPreviewHtml=D.ROGUELIKE_BOONS.filter(b=>b.rarity==="supreme").map(b=>`
<div class="list-card" style="border-color:${b.color};">
<strong style="color:${b.color};">${b.icon} ${_esc(b.name)}</strong>
<p class="sub-text" style="margin-top:3px;">${_esc(b.desc)}</p>
</div>`).join("");

host.innerHTML=`
<div class="card-box mb-10" style="border-color:#4ce6ff;background:linear-gradient(120deg,rgba(14,48,68,0.92),rgba(9,16,28,0.96));">
<div style="display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;">
<div style="flex:1;min-width:260px;">
<h3 style="margin:0;color:#7ef7f0;font-size:18px;">🌊 NGHỊCH LƯU HÀ — CHẾ ĐỘ LEO TẦNG VÔ TẬN (ROGUELIKE)</h3>
<p class="sub-text" style="margin-top:5px;line-height:1.5;">
Bơi ngược dòng nước xiết cuộn trào giữa Thiên Địa Bí Cảnh! <strong style='color:#ffd700;'>Luật Nghịch Lưu Hà: Phong ấn toàn bộ Cổ Trùng dưới Cửu Chuyển</strong> (chỉ Cổ 9 Chuyển hoặc Quyền Cước Ý Chí Kiên Trì mới thi triển được)! Kết hợp <strong>Nhảy / Khinh Công [SPACE]</strong> vượt qua thân gỗ & tảng băng trôi, <strong>Lướt Ngược Dòng [G]</strong> né Hồng Thủy, mỗi tầng hạ xong địch sẽ <strong>chọn 1 trong 3 Đạo Ngân / Tiên Cổ Tạm Thời</strong> để xây dựng bộ Sát Chiêu vô địch!
</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
<span class="badge" style="border-color:#ffd700;color:#ffd700;">👑 Kỷ Lục Cao Nhất: Tầng ${sys.bestFloor}</span>
<span class="badge" style="border-color:#7ef7c4;color:#7ef7c4;">🌊 Tổng Số Tầng Đã Vượt: ${sys.totalFloorsCleared}</span>
<span class="badge" style="border-color:#4ce6ff;color:#4ce6ff;">🔁 Số Lượt Khiêu Chiến: ${sys.totalRuns}</span>
</div>
</div>
<button id="rf-btn-start-run" class="btn-primary" style="padding:12px 22px;font-size:14.5px;font-weight:bold;border-color:#7ef7f0;">
🌊 Nhập Nghịch Lưu Hà Ngay!
</button>
</div>
</div>

<div class="split-2">
<div class="card-box">
<h3>🏆 Phần Thưởng Mốc Kỷ Lục Tầng (Tự Động Trao Khi Đạt Mốc)</h3>
<div class="scroll-list mt-10">${milestonesHtml}</div>
</div>
<div class="card-box">
<h3>👑 Tiên Cổ Tạm Thời Chí Tôn Có Thể Rút Được Trong Màn Chơi</h3>
<p class="sub-text">Tổng cộng <strong>${D.ROGUELIKE_BOONS.length} thẻ cường hóa Roguelike</strong> có thể cộng dồn qua từng tầng (mỗi tầng 3, 6, 9... là Thủ Lĩnh Cổ Tiên / Tôn Giả Phân Thân)!</p>
<div class="scroll-list mt-10">${boonPreviewHtml}</div>
</div>
</div>
`;

const bStart=host.querySelector("#rf-btn-start-run");
if (bStart) bStart.addEventListener("click",()=>sys.startRun());
}

global.ReverseFlowUI={
renderReverseFlowTab:_renderReverseFlowTab
};
})(window);
