(function (global) {
"use strict";

const GLOSSARY_TERMS=[
{term:"Không Khiếu & Khiếu Bích",cat:"Tu Luyện",desc:"Không gian chứa Biển Chân Nguyên trong bụng Cổ Sư (Nhất → Ngũ Chuyển). Vận công cọ rửa Khiếu Bích đạt 100% sẽ đột phá tiểu cảnh giới; đến Đỉnh Phong sẽ xung kích Đại Cảnh Giới."},
{term:"Chân Nguyên & Tiên Nguyên",cat:"Tu Luyện",desc:"Năng lượng dùng để thúc giục Cổ Trùng. Phàm nhân (1–5 Chuyển) dùng Biển Chân Nguyên tính theo % (Thanh Đồng → Xích Thiết → Bạch Ngân → Hoàng Kim → Tử Tinh). Cổ Tiên (6–9 Chuyển) dùng hạt Tiên Nguyên (Thanh Đề → Hồng Tảo → Bạch Lệ → Hoàng Hạnh)."},
{term:"Cổ Bản Mệnh",cat:"Cổ Trùng",desc:"Con Cổ Trùng đầu tiên gắn liền với tính mạng Cổ Sư lúc Khai Khiếu. Luyện hóa thành công sẽ không thể bị phá hủy trừ khi Cổ Sư bỏ mạng."},
{term:"Thập Tuyệt Thể",cat:"Tu Luyện",desc:"Tư chất hiếm 100% Biển Nguyên (như Bắc Minh Băng Phách Thể, Cổ Nguyệt Âm Hoang Thể...). Rất mạnh nhưng áp lực Không Khiếu tăng dần, dễ bạo tạc nếu không dùng Thạch Khiếu Cổ, Định Nguyên Cổ hoặc Âm Dương Chuyển Thân Cổ."},
{term:"Xá Lợi Cổ",cat:"Cổ Trùng",desc:"Bảo vật tiêu hao giúp lập tức tăng thẳng 1 tiểu cảnh giới Khiếu Bích đúng cấp (Thanh Đồng 1C, Xích Thiết 2C, Bạch Ngân 3C, Hoàng Kim 4C, Tử Tinh 5C)."},
{term:"Đạo Ngân (Dao Marks)",cat:"Cổ Tiên",desc:"Chỉ tồn tại trên thân thể Cổ Tiên (Lục Chuyển trở lên). Đạo Ngân lưu phái nào càng cao thì Cổ Trùng & Sát Chiêu lưu phái đó càng uy lực; tích đủ 300.000 Đạo Ngân lưu phái chính tại Á Tiên Tôn để Chứng Đạo Thành Tôn!"},
{term:"Cảnh Giới Lĩnh Ngộ Lưu Phái",cat:"Tu Luyện",desc:"Trình độ am hiểu từng lưu phái (Phàm Cấp → Đại Sư → Tông Sư → Đại Tông Sư → Vô Thượng). Tăng qua Mộng Cảnh, Nô Đạo, Đổ Thạch — giúp giảm xung đột Sát Chiêu và mở khóa thêm hiệu ứng đặc biệt."},
{term:"21 Lưu Phái & Phản Ứng Đạo",cat:"Chiến Đấu",desc:"Cả 21 lưu phái đều có nội tại chỉ số riêng. Đánh liên tiếp 2 lưu phái khắc/hợp (như Băng+Viêm, Lôi+Thủy, Kim+Kiếm, Thổ+Mộc, Quang+Ám, Lực+Hồn, Thời/Không+bất kỳ) sẽ nổ Phản Ứng Đạo cực mạnh!"},
{term:"Thiên Cơ Sát Chiêu (Z, X, C, V)",cat:"Chiến Đấu",desc:"Phối hợp 1 Cổ Cốt Lõi + 1–2 Cổ Phụ Trợ tại tab Thiên Cơ Sát Chiêu để tạo chiêu thức tổng hợp vượt xa sức mạnh Cổ đơn lẻ."},
{term:"Luyện Cổ & Pity (Bảo Hiểm)",cat:"Luyện Đạo",desc:"Hợp luyện Cổ theo Cổ Phương tại Luyện Đạo Các. Mỗi lần thất bại tăng +7% tỷ lệ thành công cho lần sau (tối đa +35%), và có thể bật 'Bảo Vệ Cổ Cốt Lõi' để tránh mất cổ quý."},
{term:"Tam Khí Thăng Tiên",cat:"Cổ Tiên",desc:"Khi đạt Ngũ Chuyển Đỉnh Phong + đủ Nhân Khí, Cổ Sư đập vỡ Phàm Khiếu hòa hợp Thiên Khí – Địa Khí – Nhân Khí để thành tựu Lục Chuyển Cổ Tiên và khai mở Phúc Địa."},
{term:"Phúc Địa & Động Thiên (1 Mẫu = 3.600 m²)",cat:"Phúc Địa",desc:"Thế giới riêng trong Tiên Khiếu! Xây dựng 8 loại Tài Nguyên Điểm cạnh nhau tạo Chuỗi Sinh Thái tự sinh sản tài nguyên, và bấm 'Tiến Vào Phúc Địa' để tự do du ngoạn theo tỷ lệ thực 3.600 m²/mẫu cho tới tận tường Khiếu Bích."},
{term:"Nô Đạo & Thú Triều",cat:"Nô Đạo",desc:"Đánh yếu Dị Thú / Thú Vương (<=48% HP) rồi bấm [H] dùng Nô Thú Cổ thu phục vào Thú Quyển. Ra trận dẫn 3–6 Linh Thú với 3 lệnh [Y]: Hộ Chủ, Tập Kích, Tản Ra."},
{term:"Mộng Cảnh Tương Tác",cat:"Mộng Cảnh",desc:"10 Mộng Cảnh chơi được thực sự theo 3 lối chơi: Giải đố Tinh Tượng Kỳ Cục (Trí Đạo), Sinh Tồn Sinh Tử Môn (Hồn Đạo) và Nhập Vai Tôn Giả Quyết Chiến (Hồng Liên/Tam Vương/Cuồng Man)."},
{term:"Đổ Thạch Phường",cat:"Kinh Tế",desc:"Sạp mài đá tại Thương Hội. Mỗi khối đá có ruột cố định — hãy dùng Trí Đạo hoặc Cổ Trinh Sát (Thiên Lý Nhãn / Địa Thính) soi xuyên vỏ đá trước khi mua và tự tay mài mở thưởng."},
{term:"Tiên Cổ Ốc",cat:"Chiến Đấu",desc:"Tòa thành di động ghép từ 4–5 Cổ Trùng (Bạch Cốt Xa, Huyết Hà Xa, Cận Thủy Lâu Đài, Long Cung, Chân Dương Lâu, Vạn Kiếm Tiên Điện). Bấm [N] để lái trực tiếp và [U] tung Đại Chiêu Trấn Phái."},
{term:"Truy Nã & Mai Phục Chính – Ma",cat:"Thế Lực",desc:"Sát hại NPC hoặc cướp thương đội làm tăng Độ Truy Nã, khiến Thiết Gia Thần Bộ / Trung Châu Chấp Pháp mai phục giữa trận. Chính Đạo có thể nhận Lệnh Truy Nã săn 8 Ma Đầu đoạt Cổ độc môn."},
{term:"Nghịch Lưu Hà (Cấm Cổ < 9 Chuyển)",cat:"Bí Cảnh",desc:"Thiên Địa Bí Cảnh đặc biệt áp chế mọi Cổ Trùng & Sát Chiêu dưới Cửu Chuyển! Chỉ Cổ 9 Chuyển hoặc Quyền Cước Ý Chí Kiên Trì mới thi triển được. Hỗ trợ chế độ Leo Tầng Vô Tận chọn 1 trong 3 cường hóa."},
{term:"Tam Vương Truyền Thừa",cat:"Cốt Truyện",desc:"Màn cốt truyện đặc biệt mở khóa tại Tứ Chuyển (4 Chuyển), tái hiện trọn bộ 5 phần hành trình Phương Nguyên đoạt cổ và nghịch thiên luyện thành Lục Chuyển Tiên Cổ Định Tiên Du."},
{term:"Á Tiên Tôn & Đạo Chủ Cửu Chuyển",cat:"Cổ Tiên",desc:"Vượt 3 Vạn Kiếp tại Bát Chuyển sẽ đạt Á Tiên Tôn. Khi tích đủ 300.000 Đạo Ngân lưu phái chính và phá Phong Tỏa Thiên Đạo (đã vượt Ải 24 Thiên Đình), ngươi sẽ Chứng Đạo Thành Tôn!"}
];

function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function renderOnboardingChecklist(container,ui) {
if (!container|| !ui|| !ui.game|| !ui.player|| !ui.aperture) return;
const dismissed=localStorage.getItem("vanco_onboarding_dismissed_v1")==="1";
const ap=ui.aperture;
if (dismissed||ap.rank>=3) {
container.innerHTML="";
container.classList.add("hidden");
return;
}
const g=ui.game;
const s1=ap.wallProgress>0||ap.subStage>0||ap.rank>1;
const s2=Boolean(ui.guSystem&&ui.guSystem.equippedGuSlots&&ui.guSystem.equippedGuSlots.some(Boolean));
const s3=g.getStageClearCount("stage_1")>0;
const s4=Boolean(g.beastArmy&&g.beastArmy.storedBeasts.length>0);
const s5=Boolean(g.blessedLand&&g.blessedLand.getBuildingCount()>=2);
const steps=[
{done:s1,label:"1. Vận Công cọ rửa Khiếu Bích (Tab Không Khiếu)",tab:"tab-aperture"},
{done:s2,label:"2. Kiểm tra & lắp Cổ Trùng vào 8 ô chiến đấu",tab:"tab-gu-storage"},
{done:s3,label:"3. Chinh phạt Ải 1: Sườn Núi Thanh Mao",action:"enter_stage_1"},
{done:s4,label:"4. Thu phục Linh Thú đầu tiên trên chiến trường [H]",tab:"tab-beast-army"},
{done:s5,label:"5. Xây thêm Tài Nguyên Điểm nối chuỗi sinh thái Phúc Địa",tab:"tab-blessed-land"}
];
const doneCount=steps.filter(s=>s.done).length;
if (doneCount===steps.length) {container.innerHTML="";container.classList.add("hidden");return;}
container.classList.remove("hidden");
container.innerHTML=`
<div class="onboarding-card">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
<strong style="color:#ffd700;font-size:13.5px;">🧭 Lộ Trình Tân Thủ (${doneCount}/${steps.length} bước hoàn thành)</strong>
<div style="display:flex;gap:6px;">
<button id="ob-open-guide" class="btn-mini btn-accent">📖 Mở Cẩm Nang & Từ Điển</button>
<button id="ob-dismiss" class="btn-mini btn-secondary">Ẩn</button>
</div>
</div>
<div class="onboarding-steps">
${steps.map((s,idx)=>`
<div class="ob-step ${s.done?"done" :""}">
<span>${s.done?"✅" :"⬜"} ${_esc(s.label)}</span>
${s.done?"" :`<button class="btn-mini btn-primary ob-go-btn" data-idx="${idx}">Đi Ngay →</button>`}
</div>`).join("")}
</div>
</div>`;
const bGuide=container.querySelector("#ob-open-guide");
if (bGuide) bGuide.addEventListener("click",()=>openGuideModal("guide"));
const bDis=container.querySelector("#ob-dismiss");
if (bDis) bDis.addEventListener("click",()=>{
try {localStorage.setItem("vanco_onboarding_dismissed_v1","1");} catch (e) {}
container.classList.add("hidden");
});
container.querySelectorAll(".ob-go-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
const st=steps[parseInt(btn.getAttribute("data-idx"),10)];
if (!st) return;
if (st.action==="enter_stage_1") g.enterStageBattle("stage_1");
else if (st.tab) ui.switchHubTab(st.tab);
});
});
}

function openGuideModal(initialTab="guide") {
let modal=document.getElementById("vanco-guide-glossary-modal");
if (!modal) {
modal=document.createElement("div");
modal.id="vanco-guide-glossary-modal";
modal.className="modal-backdrop hidden";
modal.style.position="fixed";
modal.style.zIndex="260";
modal.innerHTML=`
<div class="modal-window" style="max-width:740px;width:94vw;max-height:88dvh;display:flex;flex-direction:column;">
<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
<h2 style="margin:0;color:#ffd700;font-size:17px;">📖 Cẩm Nang Cổ Sư & Từ Điển Cổ Chân Nhân</h2>
<div style="display:flex;gap:6px;align-items:center;">
<button class="btn-mini guide-tab-btn active" data-gtab="guide">🎮 Hướng Dẫn & Phím Tắt</button>
<button class="btn-mini guide-tab-btn" data-gtab="glossary">📚 Từ Điển (${GLOSSARY_TERMS.length} Thuật Ngữ)</button>
<button id="guide-modal-close" class="btn-mini btn-danger">✕</button>
</div>
</div>
<div class="modal-body" id="guide-modal-body" style="overflow-y:auto;padding:14px 16px;"></div>
</div>`;
document.body.appendChild(modal);
modal.querySelector("#guide-modal-close").addEventListener("click",()=>modal.classList.add("hidden"));
modal.addEventListener("click",(e)=>{if (e.target===modal) modal.classList.add("hidden");});
modal.querySelectorAll(".guide-tab-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
modal.querySelectorAll(".guide-tab-btn").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");
_renderGuideBody(modal,btn.getAttribute("data-gtab")||"guide");
});
});
}
modal.querySelectorAll(".guide-tab-btn").forEach(b=>b.classList.toggle("active",b.getAttribute("data-gtab")===initialTab));
_renderGuideBody(modal,initialTab);
modal.classList.remove("hidden");
if (global.vanCoSfx) global.vanCoSfx.play("click");
}

function _renderGuideBody(modal,tab) {
const body=modal.querySelector("#guide-modal-body");
if (!body) return;
if (tab==="guide") {
body.innerHTML=`
<div class="recipe-preview-box" style="border-color:#7ef7c4;margin-bottom:10px;">
<strong style="color:#7ef7c4;font-size:14px;">⌨️ Phím Tắt Chiến Trường (Tùy chỉnh tự do trong ⚙️ Cài Đặt [F2])</strong>
<ul class="keybind-guide-list mt-5">
<li><strong>W / A / S / D</strong> (hoặc Joystick Mobile): Di chuyển 8 hướng; giữ <strong>Shift</strong> chạy nhanh.</li>
<li><strong>SPACE:</strong> Nhảy Lên / Khinh Công Nhị Đoạn (nhảy vượt suối nước, đá 2.5D & né AoE mặt đất).</li>
<li><strong>G hoặc Chuột Phải:</strong> Lướt Tàn Ảnh né đòn — né sát đạn địch kích hoạt <strong>⚡ Thiên Cơ Phản Kích</strong> (+35% ATK, chắc chắn Bạo Kích, giảm 2s hồi chiêu!).</li>
<li><strong>1–8 (hoặc Q, R, T, F):</strong> Thúc giục 8 Cổ Trùng • <strong>Z / X / C / V:</strong> Tung 4 Sát Chiêu • <strong>B:</strong> Bộc Phát Chân Nguyên (Overdrive).</li>
<li><strong>E:</strong> Tương tác NPC, khai thác Mỏ Cổ Tài, kích hoạt Cơ Duyên • <strong>H:</strong> Nô Đạo thu phục Dị Thú • <strong>Y:</strong> Đổi trận hình Thú Triều.</li>
<li><strong>N / U:</strong> Triệu hồi Tiên Cổ Ốc & tung Đại Chiêu Trấn Phái • <strong>Lăn Chuột / + / -:</strong> Phóng to/thu nhỏ tầm nhìn.</li>
<li><strong>I / O (Mọi Map):</strong> Mở nhanh <strong>🎒 Kho Đồ [I]</strong> và <strong>☯️ Không Khiếu & Kho Cổ [O]</strong> ngay trong Chiến Trường, Farm Quái, Bí Cảnh, Tam Vương & Phúc Địa!</li>
</ul>
</div>
<div class="recipe-preview-box" style="border-color:#ffd700;margin-bottom:10px;">
<strong style="color:#ffd700;font-size:14px;">🔥 10 Phản Ứng Đạo Nguyên Tố (Đánh nối tiếp 2 lưu phái trên cùng mục tiêu!)</strong>
<ul class="keybind-guide-list mt-5">
<li><strong>Băng + Viêm:</strong> 💨 Dung Giải Bộc Phá (+75% sát thương xuyên giáp).</li>
<li><strong>Lôi + Thủy/Băng:</strong> ⚡ Cảm Điện Liên Hoàn (phóng sét nhảy 3 mục tiêu).</li>
<li><strong>Độc + Viêm:</strong> 💥 Hủ Độc Bạo Tạc (nổ diện rộng). • <strong>Phong + Viêm/Băng/Độc:</strong> 🌪️ Khuếch Tán Phong Bạo.</li>
<li><strong>Huyết + Hồn:</strong> 🩸 Huyết Hồn Phản Phệ (hồi 8% HP + 15 Tinh Thần).</li>
<li><strong>Kim + Kiếm:</strong> ⚔️ Kim Kiếm Cộng Hưởng (+80% xuyên giáp + Chảy Máu).</li>
<li><strong>Thổ + Mộc:</strong> 🌿 Địa Mạch Quấn Trói (Choáng 1.4s + nổ AoE).</li>
<li><strong>Quang + Ám:</strong> ☯️ Âm Dương Nổ Tung (+85% sát thương chuẩn + Chiến Ý).</li>
<li><strong>Lực + Hồn:</strong> 💥 Lực Hồn Chấn Phá (Choáng 1.1s + xuyên giáp).</li>
<li><strong>Thời Gian / Không Gian + bất kỳ:</strong> ⏳ Thời Không Gia Tốc (giảm ngay -1.2s hồi chiêu!).</li>
</ul>
</div>
<div class="recipe-preview-box" style="border-color:#4ce6ff;">
<strong style="color:#4ce6ff;font-size:14px;">🗺️ Các Chế Độ Chơi Nổi Bật</strong>
<ul class="keybind-guide-list mt-5">
<li><strong>🦋 Tam Vương Truyền Thừa:</strong> Mở khóa tại <strong>Tứ Chuyển (4 Chuyển)</strong> — 5 phần cốt truyện, 7 thế giới độc lập luyện Tiên Cổ Định Tiên Du.</li>
<li><strong>🏡 Phúc Địa & Sinh Thái:</strong> Xây Tài Nguyên Điểm nối chuỗi + bấm <strong>🚪 Tiến Vào Phúc Địa</strong> khám phá theo tỷ lệ thực <strong>1 mẫu = 3.600 m²</strong> (bấm <strong>[F]</strong> bay Độn Không x14).</li>
<li><strong>🌊 Nghịch Lưu Hà:</strong> Áp chế mọi Cổ Trùng dưới <strong>9 Chuyển</strong> (dùng Quyền Cước Ý Chí Kiên Trì hoặc Cổ 9 Chuyển); có chế độ Leo Tầng Vô Tận chọn 1/3 cường hóa.</li>
<li><strong>🪨 Đổ Thạch Phường (Thương Hội):</strong> Dùng Trí Đạo / Cổ Trinh Sát soi đá rồi tự tay mài từng lớp tìm Cổ quý.</li>
</ul>
</div>`;
} else {
body.innerHTML=`
<input type="text" id="glossary-search-input" placeholder="🔍 Tìm kiếm thuật ngữ (VD: Đạo Ngân, Thập Tuyệt, Phúc Địa, Nghịch Lưu Hà...)" style="width:100%;padding:8px 10px;margin-bottom:10px;background:#0d121b;color:#f0ebe1;border:1px solid #b89758;border-radius:6px;">
<div id="glossary-items-host" class="glossary-grid"></div>`;
const renderList=(q="")=>{
const clean=q.trim().toLowerCase();
const list=GLOSSARY_TERMS.filter(item=> !clean||item.term.toLowerCase().includes(clean)||item.desc.toLowerCase().includes(clean)||item.cat.toLowerCase().includes(clean));
const host=body.querySelector("#glossary-items-host");
host.innerHTML=list.length===0
?`<p class="empty-hint">Không tìm thấy thuật ngữ phù hợp.</p>`
:list.map(it=>`
<div class="list-card" style="border-color:#453c2e;">
<div class="list-card-header">
<strong style="color:#ffd700;">📘 ${_esc(it.term)}</strong>
<span class="badge" style="border-color:#5cc995;color:#7ef7c4;">${_esc(it.cat)}</span>
</div>
<p class="sub-text" style="margin-top:4px;line-height:1.45;">${_esc(it.desc)}</p>
</div>`).join("");
};
renderList("");
const inp=body.querySelector("#glossary-search-input");
if (inp) inp.addEventListener("input",()=>renderList(inp.value));
}
}

global.GuideAndOnboardingUI={
GLOSSARY_TERMS,
renderOnboardingChecklist,
openGuideModal
};
})(window);
