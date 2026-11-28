(function (global) {
"use strict";
const {_esc,IMMORTAL_POEM_LINES,SECOND_APERTURE_STEPS}=global.ThreeKingsStory._shared;
Object.assign(global.ThreeKingsStory.prototype, {
_enterStep15FrozenHall() {
const pr=this.progress;
if (!pr) return;
pr.stageStep=15;
pr.hallFrozen=true;
if (this.scene&&this.scene.id==="bronze_hall") {
this.scene.hallFrostLevel=1.0;
this.scene.refStageIdx=4;
}
this.player.x=1300;this.player.y=975;this.player.facing="down";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=1060;
this._setMovementLock("Băng Sương Lan Tới — Bắn Dương Cổ Phản Kích! [K]",false);
this._setTicker("❄️ Bạch Ngưng Băng giả tự bạo Bắc Minh Băng Phách Thể đóng băng đại điện — Bấm [K] bắn Dương Cổ nửa đường thu ngược!");
this._updateQuestHUD();
this._renderCauldronPanel();
},
_fireYangGuExpose() {
if (!this.progress||this.progress.stageStep!==15||this.fx.yangGuFlight) return;
this._playSfx("enslave");
const bnb=this.scene&&this.scene.entities.find(e=>e.id==="bach_ngung_bang");
const tx=bnb?bnb.x :1300;
const ty=bnb?bnb.y :1115;
this.fx.yangGuFlight={
sx:this.player.x + 12,sy:this.player.y,
mx:(this.player.x + tx)/2,my:(this.player.y + ty)/2,
progress:0
};
this._setMovementLock("Cắt Cảnh: Bắn Dương Cổ Thu Ngược Về Tay Phải!",true);
this._renderCauldronPanel();
this._spawnFloatText(this.player.x,this.player.y - 36,"☀️ Bắn Dương Cổ Nửa Đường...","#ffd700");
},
_finishYangGuExpose() {
const pr=this.progress;
if (!pr) return;
this._playSfx("shatter");
pr.hallFrozen=false;
pr.standoffExposed=true;
pr.stageStep=16;
this.fx.shake=11;this.fx.flashAlpha=0.58;
this._loadWorldImmediate("bronze_hall",1300,985);
this.player.facing="down";
this._spawnBurst(1300,1115,"#74eaff",45);

const setB=(id,x,y,f,bub)=>{
const e=this.scene&&this.scene.entities.find(item=>item.id===id);
if (!e) return;
e.x=x;e.y=y;if (f) e.facing=f;
if (bub) {e.bubble=bub;e.bubbleTimer=5.0;}
};
setB("bach_ngung_bang",1240,1120,"up","Ngươi... tại sao ngươi phát hiện ra mọi thứ?!");
setB("thiet_nhuoc_nam",1365,1155,"up","Phương Nguyên! Hôm nay ngươi có mọc cánh cũng khó thoát!");
setB("viem_quan",1505,985,"left","Luyện chế Tiên cổ? Không nghĩ tới lại náo nhiệt như vậy!");
const bq=this.scene&&this.scene.entities.find(e=>e.id==="ba_quy");
if (bq) {bq.bubble="Huhu... Chàng thanh niên, chúng ta luyện chế Tiên cổ thất bại rồi!";bq.bubbleTimer=6.5;}

this._clearMovementLock();
this._setTicker("⚔️ ĐỐI ĐẦU NỘI ĐIỆN: Bạch Ngưng Băng, Thiết Nhược Nam, bốn vị Trưởng Lão Thiết Gia và Viêm Quân đang vây kín! Lại gần Địa Linh Bá Quy [E]!");
this._updateQuestHUD();
this._renderCauldronPanel();

this._openDialogue(
"😏 \"Bạch Ngưng Băng, Ngươi Diễn Đủ Chưa?\"",
"Bóc Trần Màn Phản Bội Tại Thanh Đồng Đại Điện",
"<strong>Dương Cổ</strong> bay được một nửa đột nhiên vòng ngược rơi về tay phải ngươi! Tay trái ngươi nâng <strong>🌺 Bán Thành Phẩm Cổ Không Khiếu Thứ Hai</strong> chống cự hàn khí rồi ngửa đầu cười dài:<br><br><em>\"Bạch Ngưng Băng, ngươi diễn đủ chưa? Hợp tác với Thiết gia, vui quá nhỉ? Trong thành Thương Gia, ngươi cố ý bại trước Viêm Đột, nhờ Tố Thủ Y Sư thoát Cổ Thề Độc rồi lén liên lạc Thiết Nhược Nam; trên núi Tam Xoa lại cùng bốn vị trưởng lão Thiết gia giăng bẫy gieo Cổ Định Tinh — ngươi cho rằng ta không biết sao?\"</em><br><br>Băng sương lập tức ngừng tan! <strong>Bạch Ngưng Băng</strong> chết lặng! <strong>Thiết Nhược Nam</strong> cùng 4 vị Trưởng Lão Thiết Gia phá băng lao ra, còn <strong>Viêm Quân</strong> cũng thản nhiên bước vào điện! Lúc này <strong>Địa Linh Bá Quy</strong> đang nước mắt giàn giụa bên Cửu Long Thanh Đồng Đỉnh — hãy đi lại đối đáp với họ rồi truyền âm thuyết phục <strong>Địa Linh Bá Quy [E]</strong>!",
[{label:"🐢 Mở Di Chuyển Nội Điện — Đối Đáp & Thuyết Phục Địa Linh Bá Quy!",primary:true}]
);
},
_startBaGuiPersuasionDialogue() {
this._openDialogue(
"🐢 Địa Linh Bá Quy (Khóc Lóc Tuyệt Vọng)",
"Truyền Âm Bí Mật Trong Đầu",
"<strong>Địa Linh Bá Quy nước mắt rơi đầy mặt:</strong> \"Sẽ vô dụng thôi... Giết bọn họ sẽ tốn hết tiên nguyên, phúc địa có quá nhiều lỗ thủng, không bao lâu nữa sẽ sụp đổ hoàn toàn. Chàng thanh niên, chúng ta luyện chế Cổ Không Khiếu Thứ Hai thất bại rồi!\"<br><br><strong>Ngươi bình tĩnh truyền âm:</strong> \"Bá Quy, luyện cổ lần này quả thực thất bại — nhưng chỉ là thất bại tạm thời! Sau khi ngươi chết, chỉ một mình ta biết rõ bí phương, lại đang cầm bán thành phẩm Cổ Không Khiếu Thứ Hai trong tay. Cho nên ngươi nhất định phải bảo vệ ta!\"",
[
{
label:"📖 \"Bá Quy, Ngươi Còn Nhớ Điển Tích Thái Nhật Dương Mãng Trong Nhân Tổ Truyện Không?!\"",
primary:true,
onClick:()=>{
this._openDialogue(
"🐢 Địa Linh Bá Quy (Sửng Sốt)",
"Lật Quân Bài Nghịch Thiên!",
"<strong>Địa Linh Bá Quy đoán ra ý ngươi, giọng lưỡng lự:</strong> \"Ngươi muốn nói là luyện chế con Tiên Cổ Không Gian Đạo kia sao?! Không, không được! Còn thiếu điều kiện quan trọng nhất không thể thỏa mãn — đầu tiên ngươi cần có <strong>Ánh Sáng Vinh Quang của Thái Cổ</strong>!\"<br><br>Ngươi âm thầm cộng hưởng tầm nhìn với Bá Quy nhìn thấu tình hình bên ngoài điện — đúng khoảnh khắc <strong>Tiêu Mang</strong> đang bị <strong>Khuyển Hoàng Anh Minh</strong> quấn lấy mất hết kiên nhẫn bay thẳng lên bầu trời!<br><br><strong>Ngươi ngửa mặt cười to, chỉ thẳng lên đỉnh Thanh Đồng Đại Điện:</strong> <em>\"Ha ha ha! Ngươi nhìn đi — ÁNH SÁNG ĐẾN RỒI!!\"</em>",
[{label:"🌊 Chuyển Cảnh Cộng Hưởng — Xem Tiêu Mang Tung THIÊN BỘC QUANG HÀ!!",primary:true,onClick:()=>this._playThienBocQuangHaCutscene()}]
);
}
}
]
);
},
_playThienBocQuangHaCutscene() {
const enterMidAirRefinement=()=>{
this.progress.hallRoofShattered=true;
this.resonanceView=false;
this.fx.flashAlpha=0.95;
this.fx.shake=12;
// Nhân vật ĐÃ bay vút lên giữa lòng Thiên Bộc Quang Hà trong đoạn phim rồi -> vào thẳng màn phá Vô Cực Sưu Tỏa & luyện Định Tiên Du!
this._initSkyLightRiverState();
};
if (this.cinema) {
this.cinema.play("thien_boc_quang_ha",enterMidAirRefinement);
return;
}
enterMidAirRefinement();
},
_transitionToSkyLightRiver() {
const W=global.ThreeKingsWorlds;
const meta=W.WORLD_META.sky_light_river;
if (!meta|| !this._screen) return;
this.resonanceView=false;
this._playSfx("teleport");
this._setMovementLock("Đang Khởi Động Không Gian Trên Cao: Thiên Bộc Quang Hà...",true);
const curtain=this._screen.querySelector("#tk-world-curtain");
const titleEl=this._screen.querySelector("#tk-curtain-title");
const subEl=this._screen.querySelector("#tk-curtain-sub");
const fillEl=this._screen.querySelector("#tk-curtain-fill");
if (titleEl) titleEl.textContent=meta.name;
if (subEl) subEl.textContent=meta.lore;
if (fillEl) fillEl.style.width="0%";
if (curtain) curtain.classList.remove("hidden");
this.transition={
worldId:"sky_light_river",isSkyWorld:true,
t:0,duration:1.15,swapped:false,
onArrived:()=>this._initSkyLightRiverState()
};
},
_initSkyLightRiverState() {
const pr=this.progress;
if (!pr) return;
this._playSfx("shatter");
pr.stageStep=17;
pr.skyMode=true;
pr.hallRoofShattered=true;
this.resonanceView=false;
this._clearMovementLock();

const vh=window.innerHeight||720;
pr.sky={
stage:2, // Bắt đầu thẳng ở giữa lòng Thiên Bộc Quang Hà: 2: Phá Vô Cực Sưu Tỏa -> 3: Giữ Kén hấp thu & 2x Cổ Tam Canh -> 4: Cổ Trăm Trận Trăm Thắng -> 5: Định Tiên Du ra đời!
px:0,
py:vh*0.46,
altitude:100,
armor:100,
kimHaCd:0,
kimHaTimer:0,
surges:[],
surgeSpawnTimer:0.65,
chainsTimer:9.5,
chainsMax:9.5,
cocoonAbsorb:0,
riverCut:false,
cutCountdown:9.0,
riverTopY:0,
instability:0,
stoneArc:null,
hatchedTimer:0,
crowdBubbles:[
{speaker:"Thiết Nhược Nam",text:"TỨ LÃO!! Không thể để hắn đạt được — mau thi triển Vô Cực Sưu Tỏa!!",color:"#ffd700",life:4.6,maxLife:4.6},
{speaker:"Thiết Gia Tam Lão",text:"Đã rõ! Bốn phương Đông Tây Nam Bắc — VÔ CỰC SƯU TỎA!!",color:"#e2bf75",life:4.6,maxLife:4.6}
],
crowdTimer:1.4,
t:0
};

const zLbl=this._screen&&this._screen.querySelector("#tk-zone-name");
const mLbl=this._screen&&this._screen.querySelector("#tk-minimap-lbl");
if (zLbl) zLbl.textContent="Lòng Thiên Bộc Quang Hà (Luyện Tiên Cổ)";
if (mLbl) mLbl.textContent="Luyện Định Tiên Du";
this._setTicker("⛓️ NGUY HIỂM! Cổ Thần Du và Cổ Bích Không đã ở trong tay, nhưng Thiết Gia Tứ Lão vừa tung 【Vô Cực Sưu Tỏa】 khóa Cổ Định Tinh trên cẳng tay trái! Bấm [J] NGAY!!");
this._updateQuestHUD();
this._renderCauldronPanel();
},
_renderSkyPanelHTML(panel) {
const sk=this.progress.sky;
if (!sk) return;
const armCol=sk.armor>45?"#ffd700" :(sk.armor>20?"#ff9f43" :"#ff3b30");
let rightBar="";
let actionBtnHtml="";
if (sk.stage===1) {
rightBar=`<div class="tk-gauge-item"><div class="bar-label"><span>🦅 Độ Cao Bay Ngược Thiên Bộc Quang Hà</span><strong id="tk-sky-m-lbl" style="color:#7ef7c4">${Math.round(sk.altitude)}%</strong></div><div class="progress-track"><div id="tk-sky-m-fill" class="progress-fill" style="width:${Math.round(sk.altitude)}%;background:linear-gradient(90deg,#3b8beb,#7ef7f0);"></div></div></div>`;
actionBtnHtml=`<div class="action-grid-2"><button id="tk-sky-boost" class="btn-primary" ${sk.kimHaCd>0?"disabled" :""}>✨ Thúc Cổ Kim Hà Vọt Lên & Bất Bại${sk.kimHaCd>0?` (${sk.kimHaCd.toFixed(1)}s)` :" [K]"}</button><div class="sub-text" style="display:flex;align-items:center;justify-content:center;color:#ffeaa7;">🎮 WASD / Joystick / Kéo màn hình né Quang Lưu & hứng Tia Sáng!</div></div>`;
} else if (sk.stage===2) {
const cPct=Math.max(0,Math.min(100,(sk.chainsTimer/sk.chainsMax)*100));
rightBar=`<div class="tk-gauge-item"><div class="bar-label"><span>⛓️ Vô Cực Sưu Tỏa Đang Siết Chặt Cẳng Tay Trái!</span><strong id="tk-sky-m-lbl" style="color:#ff5252">${sk.chainsTimer.toFixed(1)}s</strong></div><div class="progress-track"><div id="tk-sky-m-fill" class="progress-fill" style="width:${cPct}%;background:#ff5252;"></div></div></div>`;
actionBtnHtml=`<button id="tk-sky-act" class="btn-primary momentum-btn-ready" style="width:100%;padding:11px;font-size:13.5px;border-color:#38e8a8;color:#7ef7c4;">🦋 PHÓNG CỔ THẦN DU ĐÂM CẲNG TAY TRÁI NUỐT CỔ ĐỊNH TINH → NHẬP CỔ BÍCH KHÔNG KẾT KÉN TẰM! [J]</button>`;
} else if (sk.stage===3&& !sk.riverCut) {
rightBar=`<div class="tk-gauge-item"><div class="bar-label"><span>🟢 Kén Tằm Hấp Thu Ánh Sáng Vinh Quang Thái Cổ</span><strong id="tk-sky-m-lbl" style="color:#38e8a8">${Math.round(sk.cocoonAbsorb)}%</strong></div><div class="progress-track"><div id="tk-sky-m-fill" class="progress-fill" style="width:${Math.round(sk.cocoonAbsorb)}%;background:linear-gradient(90deg,#1d8348,#38e8a8);"></div></div></div>`;
actionBtnHtml=`<div class="action-grid-2"><button id="tk-sky-boost" class="btn-primary" ${sk.kimHaCd>0?"disabled" :""}>✨ Thúc Cổ Kim Hà Ổn Định Vị Trí${sk.kimHaCd>0?` (${sk.kimHaCd.toFixed(1)}s)` :" [K]"}</button><div class="sub-text" style="display:flex;align-items:center;justify-content:center;color:#7ef7c4;">☀️ Giữ thân ở giữa dòng Thiên Bộc Quang Hà để Kén Tằm hấp thu nhanh!</div></div>`;
} else if (sk.stage===3&&sk.riverCut) {
const tPct=Math.max(0,Math.min(100,(sk.cutCountdown/9.0)*100));
rightBar=`<div class="tk-gauge-item"><div class="bar-label"><span>⚠️ TIÊU MANG ĐÃ CẮT THIÊN BỘC QUANG HÀ! (3 Nhịp Thở!)</span><strong id="tk-sky-m-lbl" style="color:#ff5252">${sk.cutCountdown.toFixed(1)}s</strong></div><div class="progress-track"><div id="tk-sky-m-fill" class="progress-fill" style="width:${tPct}%;background:#ff5252;"></div></div></div>`;
actionBtnHtml=`<button id="tk-sky-act" class="btn-primary momentum-btn-ready" style="width:100%;padding:11px;font-size:14px;border-color:#ffd700;">⏳ "CỔ TAM CANH! CỔ TAM CANH!" — THỨC TỈNH KÉN TẰM TĂNG TỐC THỜI GIAN GẤP 9 LẦN! [J]</button>`;
} else if (sk.stage===4) {
rightBar=`<div class="tk-gauge-item"><div class="bar-label"><span>☢️ Áp Lực Kén Tiên Cổ Tăng Tốc x9 Sắp Tự Nổ!</span><strong id="tk-sky-m-lbl" style="color:#ff5252">${Math.round(sk.instability)}%</strong></div><div class="progress-track"><div id="tk-sky-m-fill" class="progress-fill" style="width:${Math.min(100,Math.round(sk.instability))}%;background:linear-gradient(90deg,#ff9f43,#ff3b30);"></div></div></div>`;
actionBtnHtml=`<button id="tk-sky-act" class="btn-primary momentum-btn-ready" style="width:100%;padding:12px;font-size:14.5px;border-color:#38e8a8;color:#7ef7c4;">🪨 NÉM CỔ TRĂM TRẬN TRĂM THẮNG VÀO KÉN TẰM — MỘT LẦN TẤT THÀNH ĐỊNH TIÊN DU!! [J]</button>`;
} else {
rightBar=`<div class="tk-gauge-item"><div class="bar-label"><span>🦋 Lục Chuyển Tiên Cổ ĐỊNH TIÊN DU</span><strong style="color:#7ef7c4">ĐÃ THÀNH HÌNH!</strong></div><div class="progress-track"><div class="progress-fill" style="width:100%;background:#38e8a8;"></div></div></div>`;
actionBtnHtml=`<p class="sub-text" style="text-align:center;color:#7ef7c4;margin:4px 0;">✨ Kén tằm vỡ ra — Hồ Điệp Ngọc Bích Định Tiên Du đang bay lượn quanh thân ngươi...</p>`;
}

panel.innerHTML=`
<div class="tk-gauges-grid" style="margin-bottom:7px;">
<div class="tk-gauge-item">
<div class="bar-label"><span>🛡️ Cổ Kim Thang (Hoàng Kim Hộ Thể)</span><strong id="tk-sky-arm-lbl" style="color:${armCol}">${Math.ceil(sk.armor)}%</strong></div>
<div class="progress-track"><div id="tk-sky-arm-fill" class="progress-fill" style="width:${Math.max(0,Math.min(100,sk.armor))}%;background:${armCol};"></div></div>
</div>
${rightBar}
</div>
${actionBtnHtml}
`;
const bBoost=panel.querySelector("#tk-sky-boost");
if (bBoost) bBoost.addEventListener("click",()=>this._triggerSkyKimHaBoost());
const bAct=panel.querySelector("#tk-sky-act");
if (bAct) bAct.addEventListener("click",()=>this._triggerSkyAction());
},
_triggerSkyKimHaBoost() {
const pr=this.progress;
if (!pr|| !pr.skyMode|| !pr.sky) return;
const sk=pr.sky;
if (sk.kimHaCd>0||sk.stage>=5) return;
this._playSfx("dash");
sk.kimHaCd=2.4;sk.kimHaTimer=1.15;
if (sk.stage===1) sk.altitude=Math.min(100,sk.altitude + 11);
else if (sk.stage===3&& !sk.riverCut) sk.cocoonAbsorb=Math.min(70,sk.cocoonAbsorb + 8);
const vw=window.innerWidth;
this._spawnBurst(vw/2 + sk.px,sk.py,"#ffd700",20);
this._spawnFloatText(vw/2 + sk.px,sk.py - 36,"✨ CỔ KIM HÀ — GIỮ VỮNG LÒNG THÁC & TĂNG HẤP THU!","#ffd700");
this._renderCauldronPanel();
},
_triggerSkyAction() {
const pr=this.progress;
if (!pr|| !pr.skyMode|| !pr.sky) return;
const sk=pr.sky;
const vw=window.innerWidth;
const cx=vw/2 + sk.px;

if (sk.stage===2) {
this._playSfx("victory");
sk.stage=3;sk.cocoonAbsorb=14;
this.fx.flashAlpha=0.72;this.fx.shake=12;
this._spawnBurst(cx,sk.py - 20,"#38e8a8",44);
this._spawnFloatText(cx,sk.py - 48,"🦋 THẦN DU NUỐT CỔ ĐỊNH TINH → NHẬP CỔ BÍCH KHÔNG KẾT KÉN TẰM!","#7ef7c4");
this._pushSkyCrowdBubble("Thiết Gia Đại Lão","PHỤT!! Mất liên hệ Cổ Định Tinh rồi!!","#ff6b6b");
this._pushSkyCrowdBubble("Thiết Gia Nhị Lão","Phụt! Xiềng xích bị thác ánh sáng ăn mòn mất rồi!","#ff8a8a");
this._pushSkyCrowdBubble("Phong Thiên Ngữ","Không thể nào... Hắn đang luyện cổ ngay trong sát chiêu!!","#7ef7f0");
this._setTicker("🟢 KÉN TẰM ĐÃ THÀNH HÌNH! Giữ thân ở giữa dòng Thiên Bộc Quang Hà để Kén Tằm hấp thu Ánh Sáng Vinh Quang Thái Cổ!");
this._renderCauldronPanel();
return;
}

if (sk.stage===3&&sk.riverCut) {
this._playSfx("enslave");
sk.stage=4;sk.instability=26;
this.fx.flashAlpha=0.65;this.fx.shake=10;
this._spawnBurst(cx,sk.py - 50,"#fff2a6",42);
this._spawnFloatText(cx,sk.py - 72,"⏳ \"CỔ TAM CANH! CỔ TAM CANH!\" — THỜI GIAN TĂNG GẤP 9 LẦN!!","#ffd700");
this._pushSkyCrowdBubble("Phong Thiên Ngữ","Uống rượu độc giải khát!! Kén Tiên Cổ phát triển quá nhanh sắp TỰ NỔ TUNG RỒI!!","#ff6b6b");
this._setTicker("☢️ KÉN TIÊN CỔ TĂNG TỐC 9 LẦN SẮP TỰ NỔ TUNG! Ném ngay 🪨 Cổ Trăm Trận Trăm Thắng [J] để một lần tất thành!!");
this._renderCauldronPanel();
return;
}

if (sk.stage===4&& !sk.stoneArc) {
this._playSfx("victory");
sk.stoneArc={sx:cx + 26,sy:sk.py + 12,tx:cx,ty:sk.py - 56,p:0};
this._spawnFloatText(cx,sk.py - 30,"🪨 NÉM CỔ TRĂM TRẬN TRĂM THẮNG!!","#7ef7c4");
return;
}

this._triggerSkyKimHaBoost();
},
_pushSkyCrowdBubble(speaker,text,color="#ffeaa7") {
if (!this.progress|| !this.progress.sky) return;
const list=this.progress.sky.crowdBubbles;
list.push({speaker,text,color,life:4.2,maxLife:4.2});
if (list.length>3) list.shift();
},
_failSkyFlight(reason) {
this._playSfx("warning");
this.fx.shake=14;this.fx.flashAlpha=0.65;
this._openDialogue(
"💥 Thất Bại Khi Luyện Định Tiên Du — Kích Hoạt Xuân Thu Thiền?",
"Thử Lại Ngay Khoảnh Khắc Phá Vô Cực Sưu Tỏa",
`<span style="color:#ffb3b3;">${_esc(reason)}</span><br><br>Trong khoảnh khắc sinh tử, <strong>Xuân Thu Thiền</strong> khẽ rung cánh đưa ngươi quay lại đúng khoảnh khắc vừa bay vào lòng <strong>Thiên Bộc Quang Hà</strong> với <strong>Cổ Thần Du</strong> & <strong>Cổ Bích Không</strong> trong tay!`,
[
{label:"🦗 Thử Lại Ngay (Phá Vô Cực Sưu Tỏa & Luyện Định Tiên Du)!",primary:true,onClick:()=>this._initSkyLightRiverState()},
{label:"🎬 Xem Lại Đoạn Phim Thiên Bộc Quang Hà",primary:false,onClick:()=>this._playThienBocQuangHaCutscene()},
{label:"🏯 Rút Lui Về Đại Bản Doanh",primary:false,onClick:()=>this.close(true)}
]
);
},
_updateSkyFlight(dt) {
const pr=this.progress;
const sk=pr.sky;
const fx=this.fx;
if (!sk) return;
sk.t +=dt;
if (this.dialogueOpen) return;

const vw=window.innerWidth;const vh=window.innerHeight;
const riverHalf=Math.min(185,vw*0.26);

if (sk.kimHaCd>0) sk.kimHaCd=Math.max(0,sk.kimHaCd - dt);
if (sk.kimHaTimer>0) sk.kimHaTimer=Math.max(0,sk.kimHaTimer - dt);

// Steering (WASD / Arrows / Joystick / Pointer Drag — locked once Stage 5 hatched!)
let mx=0;let my=0;
if (sk.stage<5) {
const _skm=(act,def)=>global.vanCoSettings?global.vanCoSettings.getKeybind(act) :def;
if (this._keys[_skm("moveLeft","KeyA")]||this._keys["ArrowLeft"]) mx -=1;
if (this._keys[_skm("moveRight","KeyD")]||this._keys["ArrowRight"]) mx +=1;
if (this._keys[_skm("moveUp","KeyW")]||this._keys["ArrowUp"]) my -=1;
if (this._keys[_skm("moveDown","KeyS")]||this._keys["ArrowDown"]) my +=1;
if (this._joy.active&&(Math.abs(this._joy.dx)>0.08||Math.abs(this._joy.dy)>0.08)) {mx=this._joy.dx;my=this._joy.dy;}
else if (this._skyPointer&&this._skyPointer.active) {
const dx=(this._skyPointer.x - vw/2) - sk.px;const dy=this._skyPointer.y - sk.py;
if (Math.abs(dx)>8) mx=Math.max(-1,Math.min(1,dx/55));
if (Math.abs(dy)>8) my=Math.max(-1,Math.min(1,dy/55));
}
const steerSpd=sk.kimHaTimer>0?430 :310;
sk.px=Math.max(-riverHalf + 26,Math.min(riverHalf - 26,sk.px + mx*steerSpd*dt));
const pushDown=(sk.stage===3&& !sk.riverCut&&sk.kimHaTimer<=0)?38 :0;
sk.py=Math.max(vh*0.26,Math.min(vh*0.72,sk.py + (my*240 + pushDown)*dt));
}

// Falling waterfall surges & uplift orbs (Stage 1 & pre-cut Stage 3)
if (sk.stage===1||(sk.stage===3&& !sk.riverCut)) {
sk.surgeSpawnTimer -=dt;
if (sk.surgeSpawnTimer<=0) {
sk.surgeSpawnTimer=sk.stage===1?0.58 :0.64;
const isBonus=Math.random()<0.35;
sk.surges.push({x:(Math.random()*2 - 1)*(riverHalf - 28),y:-24,vy:isBonus?(205 + Math.random()*70) :(265 + Math.random()*110),r:isBonus?15 :(18 + Math.random()*8),isBonus});
}
const playerScreenX=vw/2 + sk.px;
for (let i=sk.surges.length - 1;i>=0;i--) {
const s=sk.surges[i];s.y +=s.vy*dt;
const sx=vw/2 + s.x;
if (Math.hypot(sx - playerScreenX,s.y - sk.py)<=s.r + 22) {
if (s.isBonus) {
this._playSfx("loot");sk.armor=Math.min(100,sk.armor + 6);
if (sk.stage===1) sk.altitude=Math.min(100,sk.altitude + 10);
else if (sk.stage===3) sk.cocoonAbsorb=Math.min(70,sk.cocoonAbsorb + 9);
this._spawnBurst(sx,s.y,"#7ef7c4",12);this._spawnFloatText(sx,s.y - 16,sk.stage===1?"+10% Độ Cao!" :"+9% Hấp Thu!","#7ef7c4");
} else if (sk.kimHaTimer<=0) {
this._playSfx("punch");sk.armor=Math.max(0,sk.armor - 12);fx.shake=8;
this._spawnBurst(sx,s.y,"#ff9f43",14);this._spawnFloatText(sx,s.y - 16,"💥 Quang Lưu Va Đập! -12% Kim Thang","#ff8a8a");
}
sk.surges.splice(i,1);continue;
}
if (s.y>vh + 40) sk.surges.splice(i,1);
}
} else {
sk.surges=[];
}

if (sk.stage<=3&& !sk.riverCut) {
sk.armor=Math.max(0,sk.armor - (sk.kimHaTimer>0?0.6 :2.4)*dt);
if (sk.armor<=0) {this._failSkyFlight("Lớp hoàng kim Cổ Kim Thang đã bị sát chiêu Ngũ Chuyển Thiên Bộc Quang Hà rửa sạch hoàn toàn!");return;}
}

if (sk.stage===1) {
sk.altitude=Math.min(100,sk.altitude + ((my< -0.2)?6.5 :2.9)*dt);
sk.crowdTimer -=dt;
if (sk.crowdTimer<=0) {
sk.crowdTimer=2.7;
const lines=[
["Thiết Nhược Nam","Rốt cuộc hắn muốn làm gì? Sao lại bay thẳng nghênh đón sát chiêu?!","#ffd700"],
["Viêm Quân","Tiểu Thú Vương nghĩ quẩn muốn tìm cái chết sao?!","#ff9f43"],
["Tiêu Mang","Hả? Sao lại có tên quái nhân bay lên đỡ lấy sát chiêu của ta?!","#fff2a6"],
["Dịch Hỏa","Chiến sĩ Hoàng Kim Kiêu Trúc?! Hắn là thần thánh phương nào?!","#ff6b35"],
["Ma Vô Thiên","Có thể luyện cổ ngay bên trong sát chiêu, thật sự gan to bằng trời!","#c56cf0"],
["Bạch Ngưng Băng","Không đúng! Ta hiểu rõ hắn — tuyệt đối không thể để hắn đạt được!!","#74eaff"]
];
const pick=lines[Math.floor(Math.random()*lines.length)];
this._pushSkyCrowdBubble(pick[0],pick[1],pick[2]);
}
if (sk.altitude>=100) {
sk.stage=2;sk.chainsTimer=sk.chainsMax;this._playSfx("shatter");fx.shake=11;
this._pushSkyCrowdBubble("Thiết Nhược Nam","TỨ LÃO!! Mau thi triển Vô Cực Sưu Tỏa!!","#ffd700");
this._pushSkyCrowdBubble("Thiết Gia Tam Lão","Đã rõ! Bốn phương Đông Tây Nam Bắc — VÔ CỰC SƯU TỎA!!","#e2bf75");
this._setTicker("⛓️ NGUY HIỂM! Cổ Thần Du và Cổ Bích Không đã ở trong tay, nhưng Thiết Gia Tứ Lão vừa tung 【Vô Cực Sưu Tỏa】 khóa Cổ Định Tinh trên cẳng tay trái! Bấm [J] NGAY!!");
this._renderCauldronPanel();
}
} else if (sk.stage===2) {
sk.chainsTimer=Math.max(0,sk.chainsTimer - dt);
if (sk.chainsTimer<=0) {this._failSkyFlight("Bốn sợi xiềng xích Vô Cực Sưu Tỏa đã siết chặt Cổ Định Tinh trên cẳng tay trái kéo ngươi rơi khỏi Thiên Bộc Quang Hà!");return;}
} else if (sk.stage===3) {
if (!sk.riverCut) {
const inCore=Math.abs(sk.px)<riverHalf*0.55;
sk.cocoonAbsorb=Math.min(70,sk.cocoonAbsorb + (inCore?7.2 :3.2)*dt);
sk.crowdTimer -=dt;
if (sk.crowdTimer<=0) {
sk.crowdTimer=2.5;
const lines=[
["Lý Nhàn","Đợi một chút! Tình cảnh này đã được ghi chép trong Nhân Tổ Truyện!!","#85c1e9"],
["Dực Trùng","Thái Nhật Dương Mãng!! Chẳng lẽ hắn đang luyện Tiên Cổ Định Tiên Du?!","#4ce6ff"],
["Phong Thiên Ngữ","Định Tiên Du! Không thể ngờ đời này ta được tận mắt thấy luyện chế Tiên Cổ!!","#7ef7f0"],
["Hồ Mị Nhi","Người lông xung quanh đều quỳ rạp sùng bái hết rồi kìa!!","#ff85a2"]
];
const pick=lines[Math.floor(Math.random()*lines.length)];
this._pushSkyCrowdBubble(pick[0],pick[1],pick[2]);
}
if (sk.cocoonAbsorb>=70) {
sk.riverCut=true;sk.cutCountdown=9.0;this._playSfx("shatter");fx.shake=12;
this._pushSkyCrowdBubble("Tiêu Mang","Muốn mượn sức mạnh của ta luyện thành Tiên Cổ à? Hừ! CẮT DÒNG!!","#fff2a6");
this._pushSkyCrowdBubble("Phong Thiên Ngữ","KHÔNG!! Chỉ còn ba nhịp thở, tuyệt đối không kịp luyện thành Tiên Cổ!!","#ff6b6b");
this._setTicker("⚠️ TIÊU MANG ĐÃ CẮT ĐỨT THIÊN BỘC QUANG HÀ! Chỉ còn 3 nhịp thở — bấm [J] tung 【2x Cổ Tam Canh】 tăng tốc thời gian gấp 9 lần ngay!!");
this._renderCauldronPanel();
}
} else {
sk.cutCountdown=Math.max(0,sk.cutCountdown - dt);
sk.riverTopY=Math.min(vh*0.65,(1 - sk.cutCountdown/9.0)*vh*0.65);
if (sk.cutCountdown<=0) {this._failSkyFlight("Quá 3 nhịp thở! Thác ánh sáng Thiên Bộc Quang Hà đã tắt lịm mà ngươi chưa kịp tung 2 con Cổ Tam Canh!");return;}
}
} else if (sk.stage===4) {
if (sk.stoneArc) {
sk.stoneArc.p +=dt*2.4;
if (sk.stoneArc.p>=1) {
sk.stoneArc=null;sk.stage=5;sk.hatchedTimer=0;sk.armor=0;
pr.hasDinhTienDu=true;this._playSfx("victory");fx.flashAlpha=1.0;fx.shake=14;
const cx=vw/2 + sk.px;
this._spawnBurst(cx,sk.py - 56,"#38e8a8",70);this._spawnBurst(cx,sk.py - 56,"#ffd700",40);
this._setMovementLock("Cắt Cảnh: Lục Chuyển Tiên Cổ ĐỊNH TIÊN DU Ra Đời!",true);
this._pushSkyCrowdBubble("Phong Thiên Ngữ","KHÔNG THỂ NÀO!! Khí tức Tiên Cổ kỳ tích ổn định rồi — ĐỊNH TIÊN DU RA ĐỜI!!","#7ef7c4");
this._pushSkyCrowdBubble("Ma Vô Thiên","Hắn... là Tiểu Thú Vương!!","#c56cf0");
this._pushSkyCrowdBubble("Hồ Mị Nhi","Thần thoại đang tái diễn trước mắt sao?!","#ff85a2");
this._pushSkyCrowdBubble("Bạch Ngưng Băng","Phương Nguyên...!!","#74eaff");
this._renderCauldronPanel();this._updateQuestHUD();
}
} else {
sk.instability=Math.min(100,sk.instability + 11.2*dt);fx.shake=Math.max(fx.shake,3.2);
if (sk.instability>=100) {this._failSkyFlight("Kén Tiên Cổ tăng tốc 9 lần quá bất ổn đã TỰ NỔ TUNG ngay trước mắt Phong Thiên Ngữ! Hãy ném Cổ Trăm Trận Trăm Thắng nhanh hơn!");return;}
}
} else if (sk.stage===5) {
sk.hatchedTimer +=dt;
if (sk.hatchedTimer>=3.0&&pr.stageStep===17) {
this._completePart4ImmortalGuBorn();
}
}

for (let i=sk.crowdBubbles.length - 1;i>=0;i--) {sk.crowdBubbles[i].life -=dt;if (sk.crowdBubbles[i].life<=0) sk.crowdBubbles.splice(i,1);}
for (let i=fx.particles.length - 1;i>=0;i--) {const pt=fx.particles[i];pt.x +=pt.vx*dt;pt.y +=pt.vy*dt;pt.life -=dt;if (pt.life<=0) fx.particles.splice(i,1);}
for (let i=fx.floatingTexts.length - 1;i>=0;i--) {const ft=fx.floatingTexts[i];ft.y -=30*dt;ft.life -=dt;if (ft.life<=0) fx.floatingTexts.splice(i,1);}

// Fast DOM sync
const aLbl=this._screen&&this._screen.querySelector("#tk-sky-arm-lbl");
const aFill=this._screen&&this._screen.querySelector("#tk-sky-arm-fill");
const mLbl=this._screen&&this._screen.querySelector("#tk-sky-m-lbl");
const mFill=this._screen&&this._screen.querySelector("#tk-sky-m-fill");
const bBoost=this._screen&&this._screen.querySelector("#tk-sky-boost");
if (aLbl) aLbl.textContent=`${Math.ceil(sk.armor)}%`;
if (aFill) aFill.style.width=`${Math.max(0,Math.min(100,sk.armor))}%`;
if (bBoost) {bBoost.disabled=sk.kimHaCd>0;bBoost.textContent=`✨ Thúc Cổ Kim Hà${sk.kimHaCd>0?` (${sk.kimHaCd.toFixed(1)}s)` :" [K]"}`;}
if (mLbl&&mFill) {
if (sk.stage===1) {mLbl.textContent=`${Math.round(sk.altitude)}%`;mFill.style.width=`${Math.round(sk.altitude)}%`;}
else if (sk.stage===2) {mLbl.textContent=`${sk.chainsTimer.toFixed(1)}s`;mFill.style.width=`${Math.max(0,(sk.chainsTimer/sk.chainsMax)*100)}%`;}
else if (sk.stage===3&& !sk.riverCut) {mLbl.textContent=`${Math.round(sk.cocoonAbsorb)}%`;mFill.style.width=`${Math.round(sk.cocoonAbsorb)}%`;}
else if (sk.stage===3&&sk.riverCut) {mLbl.textContent=`${sk.cutCountdown.toFixed(1)}s`;mFill.style.width=`${Math.max(0,(sk.cutCountdown/9.0)*100)}%`;}
else if (sk.stage===4) {mLbl.textContent=`${Math.round(sk.instability)}%`;mFill.style.width=`${Math.min(100,Math.round(sk.instability))}%`;}
}
},
_completePart4ImmortalGuBorn() {
const pr=this.progress;
pr.stageStep=18;
this._awardPart4Rewards();
this._renderCauldronPanel();
this._updateQuestHUD();
this._setTicker("🦋 LỤC CHUYỂN TIÊN CỔ ĐỊNH TIÊN DU ĐÃ RA ĐỜI! Toàn bộ chiến trường chết lặng ngước nhìn Tiểu Thú Vương lơ lửng trên đôi cánh đen tan nát!");

this._openDialogue(
"🦋 LỤC CHUYỂN TIÊN CỔ — ĐỊNH TIÊN DU RA ĐỜI!",
"Hoàn Tất Phần 4 • Sẵn Sàng Cho Phần 5 (Đại Kết Cục)",
"Kén tằm vỡ tan! Một con <strong>Hồ Điệp trong suốt ánh màu xanh lục ngọc bích — Lục Chuyển Tiên Cổ ĐỊNH TIÊN DU</strong> — bay ra lượn vòng quanh thân ngươi, mỗi lần vỗ cánh đều tỏa lục quang dịu nhẹ đẹp không sao tả xiết!<br><br>Lớp hoàng kim <strong>Cổ Kim Thang</strong> tiêu tán hết, đôi cánh đen <strong>Cổ Cốt Dực</strong> sau lưng tan nát để lộ chân thân <strong>Tiểu Thú Vương Phương Nguyên</strong>! Bên dưới, <strong>Tiêu Mang</strong> trợn tròn mắt, <strong>Ma Vô Thiên</strong> ngớ người, <strong>Hồ Mị Nhi</strong>, <strong>Lý Nhàn</strong>, <strong>Dịch Hỏa</strong>, <strong>Bạch Ngưng Băng</strong> và <strong>Thiết Nhược Nam</strong> đều chết lặng như tượng đá!<br><br><strong>Địa Linh Bá Quy truyền âm thán phục:</strong> <em>\"Ngươi thật sự luyện thành Cổ Định Tiên Du, khá lắm! Bên trong đỉnh đồng còn lại chút Thanh Đề Tiên Nguyên cuối cùng để thức tỉnh nó. Trước khi ly biệt, ngươi muốn đi nơi nào và còn lời gì muốn nói với ta không?\"</em><br><br><strong style='color:#7ef7c4;'>🏆 ĐÃ HOÀN THÀNH PHẦN 4!</strong> (+160💎 Nguyên Thạch, +85 Nhân Khí, +120 EXP Luyện Cổ — Checkpoint đã lưu! Bấm tiếp tục để bước ngay vào <strong>Phần 5 (Đại Kết Cục): Ngâm 4 Câu Thơ Bất Hủ & Giáng Lâm Thế Giới 7: Đỉnh Núi Đãng Hồn!</strong>)",
[
{label:"📜 Tiếp Tục Phần 5 — Ly Biệt Địa Linh Bá Quy & Khắc Họa Đỉnh Đãng Hồn Sơn!",primary:true,onClick:()=>this._enterPart5FarewellInSky()},
{label:"🏯 Lưu Checkpoint & Về Đại Bản Doanh",primary:false,onClick:()=>this.close(true)}
]
);
},
_awardPart4Rewards() {
if (!this.progress||this.progress.part4Rewarded|| !this.game) return;
this.progress.part4Rewarded=true;const g=this.game;const key="story_tam_vuong_p4";
const prev=g.stageClears[key]||0;g.stageClears[key]=prev + 1;
if (prev===0) {
g.player.primevalStones +=160;g.aperture.humanQi +=85;
if (g.guSystem) g.guSystem.refinementExp=(g.guSystem.refinementExp||0) + 120;
if (g.ui) g.ui.addLog("🦋 [Tam Vương Truyền Thừa — Phần 4 Hoàn Thành] Đã bóc trần Bạch Ngưng Băng & bay ngược Thiên Bộc Quang Hà luyện thành Lục Chuyển Tiên Cổ ĐỊNH TIÊN DU (+160💎, +85 Nhân Khí, +120 EXP Luyện Cổ)!","loot");
g.autoSaveNow("tk_part4_clear");
}
},


// ==============================================================================
// PART 5 (GRAND FINALE): FAREWELL BA GUI, 4-LINE POEM, WINDS OF ASSIMILATION & WORLD 7!
// ==============================================================================
_enterPart5FarewellInSky() {
const pr=this.progress;
if (!pr) return;
pr.stageStep=18;
pr.skyMode=true;
pr.hasDinhTienDu=true;
pr.part5SubStep=1;
pr.poemLineIdx=0;
this.resonanceView=false;
const vh=window.innerHeight||720;
if (!pr.sky||pr.sky.stage!==5) {
pr.sky={
stage:5,px:0,py:vh*0.44,altitude:100,armor:0,kimHaCd:0,kimHaTimer:0,
surges:[],surgeSpawnTimer:99,chainsTimer:0,chainsMax:8.5,
cocoonAbsorb:100,riverCut:true,cutCountdown:0,riverTopY:vh,
instability:0,stoneArc:null,hatchedTimer:4.0,
crowdBubbles:[
{speaker:"Địa Linh Bá Quy",text:"Bên trong đỉnh đồng còn chút Tiên Nguyên cuối — ngươi muốn đi nơi nào?",color:"#ffeaa7",life:99,maxLife:99}
],
crowdTimer:99,t:0
};
}
this._setMovementLock("Hồi Kết Trên Không: Ly Biệt Địa Linh Bá Quy",true);
const zLbl=this._screen&&this._screen.querySelector("#tk-zone-name");
const mLbl=this._screen&&this._screen.querySelector("#tk-minimap-lbl");
if (zLbl) zLbl.textContent="Bầu Trời Tam Vương Phúc Địa";
if (mLbl) mLbl.textContent="Hồi Kết • Định Tiên Du";
this._setTicker("🦋 Địa Linh Bá Quy: \"Bên trong đỉnh đồng còn lại chút Thanh Đề Tiên Nguyên cuối cùng để thức tỉnh Định Tiên Du — ngươi muốn đi nơi nào?\"");
this._updateQuestHUD();
this._renderCauldronPanel();
},
_renderPart5FarewellPanel(panel) {
const pr=this.progress;
if (!panel|| !pr) return;

if (pr.part5SubStep===1) {
panel.innerHTML=`
<div class="tk-cauldron-head">
<strong style="color:#7ef7c4;">🦋 PHẦN 5 (1/2) — Lời Dặn Của Địa Linh Bá Quy: Khắc Họa Địa Điểm Truyền Tống</strong>
<span class="sub-text" style="color:#ffd700;">🔒 Khóa Di Chuyển • Thanh Đề Tiên Nguyên Cuối Cùng</span>
</div>
<p class="sub-text" style="margin:5px 0 8px 0;color:#ffeaa7;"><strong>Địa Linh Bá Quy:</strong> <em>"Ngươi tốt nhất nên chọn nơi nào đó an toàn, hơn nữa phải chú ý: hình ảnh hồi tưởng trong đầu ngươi phải gần giống với địa điểm ở hiện thực, không thể chênh lệch quá nhiều!"</em></p>
<div class="action-grid-2">
<button class="btn-secondary tk-p5-dest" data-dest="thanh_mao">⛰️ Núi Thanh Mao (Nam Cương — Đã thành núi băng)</button>
<button class="btn-secondary tk-p5-dest" data-dest="thuong_gia">🏮 Thành Thương Gia (Thương Yến Phi tọa trấn)</button>
<button class="btn-primary tk-p5-dest momentum-btn-ready" data-dest="dang_hon" style="border-color:#ff85d5;color:#ffd1f2;">🦊 Đỉnh Núi Đãng Hồn — Phúc Địa Hồ Tiên (Núi Thiên Thê, Trung Châu)</button>
<button class="btn-secondary tk-p5-dest" data-dest="thien_dinh">⚡ Thiên Đình Trung Châu (Chưa từng tận mắt nhìn thấy)</button>
</div>
`;
panel.querySelectorAll(".tk-p5-dest").forEach(btn=>{
btn.addEventListener("click",()=>{
const d=btn.getAttribute("data-dest");
if (d==="dang_hon") {
this._playSfx("victory");
pr.part5SubStep=2;
pr.poemLineIdx=0;
this.fx.flashAlpha=0.55;
this._pushSkyCrowdBubble("Địa Linh Bá Quy","Chỉ mong ngươi sau này luyện thành Cổ Không Khiếu Thứ Hai! Trước khi ly biệt, còn lời gì muốn nói không?","#ffeaa7");
this._setTicker("📜 Đỉnh Đãng Hồn Sơn đã khắc rõ trong tâm trí! Cất giọng ngâm trọn 4 câu thơ bất hủ trước quần hùng Nam Cương!");
this._renderCauldronPanel();
} else {
this._playSfx("warning");
const tips={
thanh_mao:"Núi Thanh Mao đã thành băng nguyên hoang phế, vừa hiện thân liền rơi vào ổ phục kích của Thiết Gia!",
thuong_gia:"Thành Thương Gia có Ngũ Chuyển Thương Yến Phi tọa trấn — tự chui đầu vào lưới!",
thien_dinh:"Bá Quy đã dặn hình ảnh hồi tưởng phải khớp hiện thực! Ngươi chưa từng thấy Thiên Đình nên không thể truyền tống!"
};
this._spawnFloatText(window.innerWidth/2,window.innerHeight*0.35,`⚠️ ${tips[d]||"Sai địa điểm!"}`,"#ff8a8a");
}
});
});
} else {
const idx=pr.poemLineIdx||0;
const recited=IMMORTAL_POEM_LINES.slice(0,idx).map(l=>`<div style="color:#ffd700;font-style:italic;font-size:12px;">❝ ${l} ❞</div>`).join("");
const nextLine=IMMORTAL_POEM_LINES[idx]||"";
panel.innerHTML=`
<div class="tk-cauldron-head">
<strong style="color:#ffd700;">📜 PHẦN 5 (2/2) — Đôi Cánh Đen Tan Nát & Bài Thơ Tuyệt Thế (${idx}/4)</strong>
<span class="sub-text" style="color:#7ef7c4;">Tạm biệt Bạch Ngưng Băng. Tạm biệt Thiết Nhược Nam. Tạm biệt Nam Cương.</span>
</div>
<div style="margin:5px 0 7px 0;padding:6px 10px;background:rgba(10,18,16,0.86);border-left:3px solid #38e8a8;min-height:24px;">
${recited||`<span class="sub-text" style="font-style:italic;">Nam nhi phải có chí lớn, không phụ trời sinh tám thước thân thể! Nhấn nút bên dưới (hoặc phím [Space]) để cất giọng ngâm từng câu thơ...</span>`}
</div>
<button id="tk-p5-poem" class="btn-primary momentum-btn-ready" style="width:100%;padding:11px;font-size:13px;border-color:#38e8a8;color:#7ef7c4;">
📜 ${idx<3?`Ngâm Câu ${idx + 1}/4:` :"🔥 NGÂM CÂU KẾT & PHÁT ĐỘNG ĐỊNH TIÊN DU:"} "${_esc(nextLine)}" [Space]
</button>
`;
panel.querySelector("#tk-p5-poem").addEventListener("click",()=>this._reciteNextPoemLine());
}
},
_reciteNextPoemLine() {
const pr=this.progress;
if (!pr||pr.stageStep!==18||pr.part5SubStep!==2) return;
const idx=pr.poemLineIdx||0;
if (idx>=4) return;
const line=IMMORTAL_POEM_LINES[idx];
pr.poemLineIdx=idx + 1;
this._playSfx(pr.poemLineIdx===4?"victory" :"enslave");
this.fx.flashAlpha=0.45;
this.fx.shake=pr.poemLineIdx===4?12 :5;
const vw=window.innerWidth;const vh=window.innerHeight;
this._spawnBurst(vw/2,vh*0.44,"#38e8a8",pr.poemLineIdx===4?58 :22);
this._spawnFloatText(vw/2,vh*0.32,`❝ ${line} ❞`,"#ffd700");

if (pr.poemLineIdx<4) {
this._renderCauldronPanel();
} else {
this._pushSkyCrowdBubble("Địa Linh Bá Quy","CHÍ HƯỚNG TỐT!! Ta lập tức tiễn các hạ một đoạn đường!!","#ffd700");
this._setTicker("✨ Địa Linh Bá Quy truyền nốt Thanh Đề Tiên Nguyên vào Cổ Định Tiên Du — Lục quang bùng nổ xé toạc không gian!!");
this._renderCauldronPanel();
setTimeout(()=>{
if (!this.progress||this.progress.stageStep!==18) return;
this._startGrandTeleportCinema();
},950);
}
},
_startGrandTeleportCinema() {
const pr=this.progress;
if (!pr) return;
this._playSfx("shatter");
pr.stageStep=19;
pr.skyMode=false;
pr.teleportCinema={
t:0,
fleeingCrowd:[
{x:0.18,y:0.78,vx:-95,name:"Bạch Ngưng Băng",col:"#74eaff",skinKey:"bach_ngung_bang"},
{x:0.32,y:0.80,vx:-75,name:"Thiết Nhược Nam",col:"#ffd700",skinKey:"thiet_nhuoc_nam"},
{x:0.68,y:0.80,vx:85,name:"Tiêu Mang",col:"#fff2a6",skinKey:"tieu_mang"},
{x:0.82,y:0.78,vx:105,name:"Ma Vô Thiên",col:"#c56cf0",skinKey:"ma_vo_thien"}
]
};
this.fx.flashAlpha=1.0;this.fx.shake=14;
this._setMovementLock("Cắt Cảnh: Ánh Sáng Xanh Ngọc Lóe Tan & Gió Đại Đồng!",true);
this._renderCauldronPanel();
this._updateQuestHUD();
},
_updateGrandTeleportCinema(dt) {
const pr=this.progress;
const tc=pr&&pr.teleportCinema;
if (!tc) return;
tc.t +=dt;
const vw=window.innerWidth;
for (const fc of tc.fleeingCrowd) {
fc.x +=(fc.vx*dt)/Math.max(300,vw);
}
if (tc.t>=5.5) {
pr.teleportCinema=null;
this._enterDangHunWorld();
}
},
_renderGrandTeleportCinema() {
const ctx=this._ctx;
const pr=this.progress;
const tc=pr&&pr.teleportCinema;
const W=global.ThreeKingsWorlds;
if (!ctx|| !tc|| !W) return;
const vw=window.innerWidth;const vh=window.innerHeight;
const cx=vw/2;const cy=vh/2;const t=tc.t;

if (t<3.3) {
// Scene 1: Jade Flash Vanishing — ONLY BLACK ROBE FALLS LIKE A CUT KITE! Winds of Assimilation destroy Three Kings Blessed Land!
const sky=ctx.createLinearGradient(0,0,0,vh);
sky.addColorStop(0,"#102e26");sky.addColorStop(0.55,"#1a1321");sky.addColorStop(1,"#09080f");
ctx.fillStyle=sky;ctx.fillRect(0,0,vw,vh);

// Green-black Winds of Assimilation (Gió Đại Đồng) gusts!
ctx.strokeStyle="rgba(46,232,148,0.45)";ctx.lineWidth=3.5;
for (let i=0;i<9;i++) {
const wy=45 + i*(vh/10);
const ox=((t*280 + i*140) % (vw + 220)) - 110;
ctx.beginPath();ctx.moveTo(ox,wy);ctx.quadraticCurveTo(ox + 60,wy - 18,ox + 120,wy);ctx.stroke();
}

const fl=Math.max(0,1 - t*0.55);
if (fl>0) {
const jg=ctx.createRadialGradient(cx,vh*0.36,5,cx,vh*0.36,165*fl);
jg.addColorStop(0,"rgba(210,255,235,0.98)");jg.addColorStop(0.5,"rgba(56,232,168,0.5)");jg.addColorStop(1,"rgba(56,232,168,0)");
ctx.fillStyle=jg;ctx.beginPath();ctx.arc(cx,vh*0.36,165*fl,0,Math.PI*2);ctx.fill();
}

// Empty Black Clothes Falling Like a Cut Kite!
const clothY=vh*0.36 + t*76;
const clothX=cx + Math.sin(t*3.8)*32;
ctx.save();ctx.translate(clothX,clothY);ctx.rotate(Math.sin(t*2.8)*0.42);
ctx.fillStyle="#161922";ctx.strokeStyle="#8a1c1c";ctx.lineWidth=1.8;
ctx.beginPath();ctx.moveTo(-18,-10);ctx.lineTo(18,-10);ctx.lineTo(24,16);ctx.lineTo(-24,16);ctx.closePath();ctx.fill();ctx.stroke();
ctx.restore();

// Panicked Crowd Fleeing Winds of Assimilation below!
ctx.fillStyle="#241a12";ctx.fillRect(0,vh*0.74,vw,vh*0.26);
const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
for (const fc of tc.fleeingCrowd) {
const fx0=fc.x*vw;const fy0=fc.y*vh;
const sk=pSkins[fc.skinKey]||W.TK_SKINS[fc.skinKey]||pSkins.phuong_nguyen;
ctx.save();ctx.translate(fx0,fy0);ctx.scale(1.05,1.05);
global.PlayerManager.drawSkinPixelSprite(ctx,sk,{bobY:Math.sin(t*14)*2,legOffset:Math.sin(t*16)*3,facing:fc.vx<0?"left" :"right",isMoving:true});
ctx.restore();
ctx.font="bold 10.5px Georgia";ctx.textAlign="center";ctx.fillStyle=fc.col;
ctx.fillText(fc.name,fx0,fy0 - 26);
}
}
ctx.font="bold 15.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText("✨ ÁNH SÁNG XANH NGỌC LÓE TAN — CHỈ CÒN QUẦN ÁO RƠI NHƯ DIỀU ĐỨT DÂY!",cx,vh*0.18);
ctx.font="italic 13px Georgia";ctx.fillStyle="#ffd700";
ctx.fillText("Gió Đại Đồng nổi lên hủy diệt Tam Vương Phúc Địa — Quần hùng núi Tam Xoa tán loạn bỏ chạy!",cx,vh*0.92);
} else {
// Scene 2: Crossing the Space Path Warp Tunnel to Central Continent — Tian Ti Mountain!
const lt=t - 3.3;
ctx.fillStyle="#040b12";ctx.fillRect(0,0,vw,vh);
for (let r=0;r<14;r++) {
const rad=((r*48 + lt*340) % (Math.max(vw,vh)*0.65)) + 16;
ctx.strokeStyle=r%2===0?"rgba(56,232,168,0.58)" :"rgba(255,155,224,0.38)";
ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,rad,0,Math.PI*2);ctx.stroke();
}
W.Arch.drawJadeButterfly(ctx,cx,cy,1.9,t);
ctx.font="bold 16px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText("🌀 VƯỢT GIỚI BÍCH NAM CƯƠNG → TRUNG CHÂU • NÚI THIÊN THÊ!",cx,vh*0.2);
ctx.font="italic 13px Georgia";ctx.fillStyle="#ffb8e6";
ctx.fillText("Đang nạp Thế Giới 7: Đỉnh Núi Đãng Hồn — Phúc Địa Hồ Tiên...",cx,vh*0.82);
}

if (this.fx.flashAlpha>0.01) {
ctx.fillStyle=`rgba(180,255,220,${this.fx.flashAlpha*0.62})`;
ctx.fillRect(0,0,vw,vh);
}
},
_enterDangHunWorld() {
const pr=this.progress;
if (!pr) return;
this._playSfx("victory");
pr.stageStep=20;
pr.unlockedWorlds.dang_hun_mountain=true;
pr.skyMode=false;
this.resonanceView=false;
this._loadWorldImmediate("dang_hun_mountain",1300,990);
this.player.facing="down";
this.fx.flashAlpha=0.95;this.fx.shake=10;
this._spawnBurst(1300,990,"#38e8a8",65);
this._spawnRing(1300,990,"#ff85d5",210);
this._clearMovementLock();
this._setTicker("🦊 TRUNG CHÂU • NÚI THIÊN THÊ — ĐỈNH NÚI ĐÃNG HỒN! Ngươi đã giáng lâm ngay trên đỉnh núi trước mắt Phượng Kim Hoàng và Cổ Nguyệt Phương Chính! Tiến lên gặp Tiểu Hồ Tiên [E]!");
this._updateQuestHUD();
this._renderCauldronPanel();

this._openDialogue(
"🦊 GIÁNG LÂM THẾ GIỚI 7: ĐỈNH NÚI ĐÃNG HỒN — PHÚC ĐỊA HỒ TIÊN!",
"Trung Châu • Núi Thiên Thê",
"Lục quang ngọc bích lóe lên giữa bầu trời Trung Châu — ngươi nhanh tay khoác bộ hắc bào dự phòng từ Không Khiếu, sừng sững đứng giữa <strong>Đỉnh Đãng Hồn Sơn</strong> kết tinh bằng pha lê hồng tím ngay trước <strong>Đãng Hồn Cung</strong>!<br><br>Nhìn xuống triền núi dốc đứng ngay dưới chân: <strong>Cổ Nguyệt Phương Chính</strong> tay chân máu me đầm đìa đang được <strong>Thiên Hạc Thượng Nhân</strong> cổ vũ liều mạng leo lên đỉnh; phía triền Đông Nam, <strong>Phượng Kim Hoàng</strong> vừa bung đôi cánh <strong>Mộng Dực</strong> ngũ sắc rực rỡ — cả hai cùng <strong>Ứng Sinh Cơ</strong> và <strong>Tiêu Thất Tinh</strong> đều chết sững khi thấy ngươi từ trên trời giáng xuống cướp đỉnh núi!<br><br>Hãy tự do dạo quanh Đỉnh Đãng Hồn Sơn đối thoại với 6 nhân vật Trung Châu, đọc cổ bia rồi lại gần <strong>🦊 Tiểu Hồ Tiên nhấn [E]</strong> để chính thức tiếp quản <strong>Phúc Địa Hồ Tiên</strong> và nhận vĩnh viễn <strong>🦋 Lục Chuyển Định Tiên Du Tiên Cổ</strong>!",
[{label:"🦊 Khám Phá Thế Giới 7: Đỉnh Núi Đãng Hồn & Đãng Hồn Cung!",primary:true}]
);
},
_startClaimHuImmortalCutscene(tht) {
this._playSfx("victory");
this._setMovementLock("Cắt Cảnh: Tiểu Hồ Tiên Nhận Chủ — Tiếp Quản Phúc Địa Hồ Tiên!",true);
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=820;
this.fx.flashAlpha=0.92;this.fx.shake=10;
this._spawnBurst(1300,820,"#ffb8e6",70);
this._spawnBurst(1300,820,"#38e8a8",55);
this._spawnRing(1300,820,"#ffd700",220);
tht.bubble="Tiểu Hồ Tiên bái kiến chủ nhân mới của Phúc Địa Hồ Tiên!!";
tht.bubbleTimer=6.0;
this.cutscene={
type:"claim_hu_immortal",t:0,duration:1.55,
onDone:()=>{
this.cutscene=null;
this._grantFinalImmortalGuRewards();
}
};
},
_grantFinalImmortalGuRewards() {
const pr=this.progress;
const g=this.game;
if (!pr|| !g) return;
pr.huImmortalClaimed=true;
pr.stageStep=21;
// Unlock all 7 worlds for free sightseeing!
for (const k of Object.keys(pr.unlockedWorlds)) pr.unlockedWorlds[k]=true;

const prevClears=g.getStageClearCount("story_tam_vuong_dinh_tien_du");
const isFirst=prevClears===0;
g.stageClears["story_tam_vuong_dinh_tien_du"]=prevClears + 1;

let guText="";
let resText="";
let daoText="";

if (isFirst) {
const alreadyHas=g.guSystem&&typeof g.guSystem.hasImmortalGu==="function"&&g.guSystem.hasImmortalGu("dinh_tien_du_gu");
if (!alreadyHas&&g.guSystem) {
const added=g.guSystem.addGuToStorage("dinh_tien_du_gu",{
rank:6,isRefined:true,refinementProgress:100,isVital:false,hunger:100
});
guText=added?"🦋 Định Tiên Du Tiên Cổ Lục Chuyển (Đã Luyện Hóa 100% — Đã đưa vào Kho Cổ!)" :"🌟 +15 Tiên Nguyên Thạch";
} else {
g.player.addItem("immortal_stone",15);
guText="🌟 +15 Tiên Nguyên Thạch (vì Định Tiên Du là Tiên Cổ duy nhất và ngươi đã sở hữu!)";
}
g.player.primevalStones +=350;
g.player.meritPoints=(g.player.meritPoints||0) + 220;
g.aperture.humanQi +=180;
g.player.addItem("remnant_recipe",2);
g.player.addPathAttainmentExp("Không Gian Đạo",60);
g.player.addPathAttainmentExp("Luyện Đạo",60);
const isImm=typeof g.player.isImmortalCultivator==="function"&&g.player.isImmortalCultivator();
if (isImm) {
g.player.addDaoMarks("Không Gian Đạo",60);
g.player.addDaoMarks("Luyện Đạo",60);
}
if (g.guSystem) g.guSystem.refinementExp=(g.guSystem.refinementExp||0) + 200;
if (g.questManager) {
g.questManager.addReputation("nam_cuong",100);
g.questManager.addReputation("trung_chau",100);
g.questManager.recordEvent("clear_stage","story_tam_vuong_dinh_tien_du",1);
}
resText="💎 +350 Nguyên Thạch | 🏅 +220 Cống Hiến | ☯ +180 Nhân Khí | 📜 +2 Tàn Phương";
daoText=isImm?"+60 Đạo Ngân Không Gian Đạo & Luyện Đạo | +200 EXP Luyện Cổ" :"+60 Lĩnh Ngộ Không Gian Đạo & Luyện Đạo | +200 EXP Luyện Cổ";
if (g.ui) g.ui.addLog("🦋 [ĐẠI KẾT CỤC TAM VƯƠNG TRUYỀN THỪA] Hoàn thành trọn bộ 7 Thế Giới, luyện thành Lục Chuyển Tiên Cổ 【Định Tiên Du】 và tiếp quản Phúc Địa Hồ Tiên trên đỉnh Đãng Hồn Sơn!","loot");
} else {
g.player.primevalStones +=90;
g.aperture.humanQi +=15;
if (g.guSystem) g.guSystem.refinementExp=(g.guSystem.refinementExp||0) + 50;
guText="(Đã sở hữu Lục Chuyển Tiên Cổ Định Tiên Du — Tái hiện Đại Kết Cục viên mãn!)";
resText="💎 +90 Nguyên Thạch | ☯ +15 Nhân Khí";
daoText="+50 EXP Luyện Cổ";
if (g.ui) g.ui.addLog("🦋 Tái hiện viên mãn Đại Kết Cục 【Tam Vương Truyền Thừa — Đỉnh Núi Đãng Hồn】 (+90💎, +50 EXP Luyện Cổ)!","cultivation");
}

g.autoSaveNow("story_tam_vuong_final_clear");
if (g.ui) g.ui.updateHubTopbar();
this.camera.mode="player";
this._clearMovementLock();
this._updateQuestHUD();

this._openDialogue(
"🏆 ĐẠI KẾT CỤC VIÊN MÃN — THU PHỤC HỒ TIÊN PHÚC ĐỊA & ĐỊNH TIÊN DU!",
"Chủ Nhân Mới Của Đỉnh Núi Đãng Hồn (Trung Châu)",
"<strong>Tiểu Hồ Tiên</strong> mừng rỡ cúi lạy trước bậc thang Đãng Hồn Cung: <em>\"Tiểu Hồ Tiên bái kiến chủ nhân! Từ giờ phút này, toàn bộ Phúc Địa Hồ Tiên và Đãng Hồn Sơn đều thuộc quyền định đoạt của ngài!\"</em><br><br>Màn lật kèo kinh thiên từ Nam Cương sang Trung Châu đã khép lại trọn vẹn — một mình phàm thân Tứ Chuyển nghịch lưu Thiên Bộc Quang Hà luyện thành Lục Chuyển Tiên Cổ, đoạt lấy Phúc Địa Hồ Tiên ngay trước mắt Phượng Kim Hoàng và Thập Đại Cổ Phái Trung Châu!<br><br><div class='info-list'><div class='info-row'><span>🦋 Chí Bảo Vĩnh Viễn:</span> <strong style='color:#38e8a8;'>"+_esc(guText)+"</strong></div><div class='info-row'><span>💎 Phần Thưởng:</span> <strong class='highlight-gold'>"+_esc(resText)+"</strong></div><div class='info-row'><span>🌌 Cảm Ngộ Đại Đạo:</span> <strong style='color:#7ef7f0;'>"+_esc(daoText)+"</strong></div></div>",
[
{label:"🏯 Mang Định Tiên Du Trở Về Đại Bản Doanh",primary:true,onClick:()=>this.close(true)},
{label:"🗺️ Ở Lại Tự Do Tham Quan Cả 7 Thế Giới (Phím [T])",primary:false}
]
);
},
_renderSkyFlight() {
const ctx=this._ctx;
const pr=this.progress;
const sk=pr.sky;
const fx=this.fx;
const W=global.ThreeKingsWorlds;
if (!ctx|| !sk|| !W) return;
const vw=window.innerWidth;const vh=window.innerHeight;
const t=sk.t;const cx=vw/2;
const riverHalf=Math.min(185,vw*0.26);

const _shOn=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
const sx=(_shOn&&fx.shake>0)?(Math.random() - 0.5)*fx.shake :0;
const sy=(_shOn&&fx.shake>0)?(Math.random() - 0.5)*fx.shake :0;

ctx.save();
ctx.translate(sx,sy);

// 1. High-Craft Twilight Sky of Collapsing Three Kings Blessed Land
const skyGrad=ctx.createLinearGradient(0,0,0,vh);
skyGrad.addColorStop(0,sk.stage===5?"#0b262f" :"#12192e");
skyGrad.addColorStop(0.55,"#1b1426");
skyGrad.addColorStop(1,"#0d0910");
ctx.fillStyle=skyGrad;ctx.fillRect(-16,-16,vw + 32,vh + 32);

// Layered Distant Cloud Bands & Cracked Sky Veins
ctx.strokeStyle="rgba(255,215,120,0.22)";ctx.lineWidth=1.8;
for (let i=0;i<6;i++) {
const ry=55 + ((i*105 + t*28) % (vh*0.68));
ctx.beginPath();ctx.moveTo(0,ry);ctx.quadraticCurveTo(vw*0.25,ry - 15,vw*0.5,ry);ctx.quadraticCurveTo(vw*0.75,ry + 15,vw,ry);ctx.stroke();
}

// 2. Receding Ground Silhouette: Shattered Bronze Hall Roof & Onlookers below!
const groundY=vh - 60;
ctx.fillStyle="#241b13";ctx.fillRect(0,groundY,vw,vh - groundY + 24);
// Shattered Ornate Bronze Roof Eaves flanking the waterfall crater!
ctx.fillStyle="#3d2f1c";ctx.strokeStyle="#d4af37";ctx.lineWidth=2;
ctx.beginPath();ctx.moveTo(cx - riverHalf - 160,groundY + 12);ctx.lineTo(cx - riverHalf - 130,groundY - 18);ctx.lineTo(cx - riverHalf + 4,groundY - 10);ctx.lineTo(cx - riverHalf - 6,groundY + 22);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(cx + riverHalf + 160,groundY + 12);ctx.lineTo(cx + riverHalf + 130,groundY - 18);ctx.lineTo(cx + riverHalf - 4,groundY - 10);ctx.lineTo(cx + riverHalf + 6,groundY + 22);ctx.closePath();ctx.fill();ctx.stroke();

const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
const mcSkin=(this.game&&this.game.player&&this.game.player.getSkinConfig)?this.game.player.getSkinConfig() :pSkins.phuong_nguyen;
const crowdLayout=[
{x:cx - riverHalf - 95,name:"Bạch Ngưng Băng",col:"#74eaff",skin:pSkins.bach_ngung_bang||W.TK_SKINS.bach_ngung_bang},
{x:cx - riverHalf - 30,name:"Thiết Nhược Nam",col:"#ffd700",skin:W.TK_SKINS.thiet_nhuoc_nam},
{x:cx + riverHalf + 30,name:"Phong Thiên Ngữ",col:"#7ef7f0",skin:W.TK_SKINS.phong_thien_ngu},
{x:cx + riverHalf + 98,name:"Ma Vô Thiên",col:"#c56cf0",skin:W.TK_SKINS.ma_vo_thien}
];
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
for (const c of crowdLayout) {
if (c.x<20||c.x>vw - 20) continue;
ctx.save();ctx.translate(c.x,groundY + 12);ctx.scale(0.88,0.88);
global.PlayerManager.drawSkinPixelSprite(ctx,c.skin||mcSkin,{bobY:0,facing:"up"});
ctx.restore();
ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle=c.col;
ctx.fillText(c.name,c.x,groundY + 34);
}
}

// 3. THE COLOSSAL THIÊN BỘC QUANG HÀ (HEAVENLY WATERFALL LIGHT RIVER!)
if (sk.stage<5) {
const topY=sk.riverCut?sk.riverTopY :0;
const rGrad=ctx.createLinearGradient(cx - riverHalf,0,cx + riverHalf,0);
rGrad.addColorStop(0,"rgba(255,245,190,0)");
rGrad.addColorStop(0.18,"rgba(255,235,140,0.34)");
rGrad.addColorStop(0.5,"rgba(255,255,235,0.88)");
rGrad.addColorStop(0.82,"rgba(255,235,140,0.34)");
rGrad.addColorStop(1,"rgba(255,245,190,0)");
ctx.fillStyle=rGrad;ctx.fillRect(cx - riverHalf,topY,riverHalf*2,vh - topY);

ctx.strokeStyle="rgba(255,255,255,0.58)";ctx.lineWidth=2.2;
for (let i=0;i<16;i++) {
const lx=cx - riverHalf*0.8 + (i/15)*riverHalf*1.6;
const ly=topY + ((t*420 + i*73) % Math.max(40,vh - topY));
ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx,Math.min(vh,ly + 44));ctx.stroke();
}
if (sk.riverCut&&topY>4) {
ctx.strokeStyle="#ff9f43";ctx.lineWidth=4;
ctx.beginPath();ctx.moveTo(cx - riverHalf*0.85,topY);ctx.quadraticCurveTo(cx,topY + 18,cx + riverHalf*0.85,topY);ctx.stroke();
}
}

// 4. Falling Surges & Uplift Orbs
for (const s of sk.surges) {
const ox=cx + s.x;
const g=ctx.createRadialGradient(ox,s.y,2,ox,s.y,s.r*1.5);
if (s.isBonus) {g.addColorStop(0,"#ffffff");g.addColorStop(0.45,"#7ef7c4");g.addColorStop(1,"rgba(56,232,168,0)");}
else {g.addColorStop(0,"#ffffff");g.addColorStop(0.45,"#ff6b35");g.addColorStop(1,"rgba(255,87,51,0)");}
ctx.fillStyle=g;ctx.beginPath();ctx.arc(ox,s.y,s.r*1.5,0,Math.PI*2);ctx.fill();
}

// 5. Phương Nguyên with Cổ Cốt Dực (Black Bone Wings) & Cổ Kim Thang (Molten Gold Armor)
const px=cx + sk.px;const py=sk.py;
const armRatio=sk.armor / 100;
const wingFlap=Math.sin(t*13)*0.26;
ctx.save();ctx.translate(px,py - 4);
for (const side of [-1,1]) {
ctx.save();ctx.scale(side,1);ctx.rotate(-0.18 + wingFlap);
ctx.fillStyle=armRatio>0.35?"rgba(255,215,0,0.88)" :"#14161c";
ctx.strokeStyle=armRatio>0.2?"#fff2a6" :"#484f5c";ctx.lineWidth=2.2;
ctx.beginPath();ctx.moveTo(5,-5);ctx.quadraticCurveTo(32,-28,56,-12);
if (sk.stage===5||armRatio<0.35) {ctx.lineTo(46,0);ctx.lineTo(39,-5);ctx.lineTo(30,6);ctx.lineTo(20,-2);}
else {ctx.quadraticCurveTo(44,5,25,10);}
ctx.lineTo(5,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
ctx.restore();

if (sk.kimHaTimer>0) {
const jg=ctx.createRadialGradient(px,py + 22,3,px,py + 22,42);
jg.addColorStop(0,"#ffffff");jg.addColorStop(0.45,"#ffd700");jg.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=jg;ctx.beginPath();ctx.arc(px,py + 22,42,0,Math.PI*2);ctx.fill();
}
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
ctx.save();ctx.translate(px,py);ctx.scale(1.42,1.42);
global.PlayerManager.drawSkinPixelSprite(ctx,mcSkin,{bobY:Math.sin(t*5)*1.5,facing:"down"});
ctx.restore();
}
if (armRatio>0.06) {
ctx.save();ctx.globalAlpha=armRatio*0.42;
const ag=ctx.createRadialGradient(px,py - 4,4,px,py - 4,36);
ag.addColorStop(0,"#fff7c2");ag.addColorStop(0.6,"#ffd700");ag.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=ag;ctx.beginPath();ctx.arc(px,py - 4,36,0,Math.PI*2);ctx.fill();ctx.restore();
}

// 6. Stage 2: Vô Cực Sưu Tỏa Chains + Cổ Định Tinh + Cổ Bích Không
if (sk.stage===2) {
const closeRatio=1 - (sk.chainsTimer / sk.chainsMax);
const corners=[[0,0],[vw,0],[0,vh],[vw,vh]];
const armX=px - 20;const armY=py - 4;
ctx.save();ctx.strokeStyle="#4ce6ff";ctx.lineWidth=4;ctx.setLineDash([9,5]);
for (const [bx,by] of corners) {
const ex=bx + (armX - bx)*(0.35 + closeRatio*0.62);const ey=by + (armY - by)*(0.35 + closeRatio*0.62);
ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(ex,ey);ctx.stroke();
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(ex,ey,6,0,Math.PI*2);ctx.fill();
}
ctx.setLineDash([]);
ctx.fillStyle="#7ef7f0";ctx.beginPath();ctx.arc(armX,armY,8 + Math.sin(t*14)*2.5,0,Math.PI*2);ctx.fill();
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7f0";
ctx.fillText("💎 Cổ Định Tinh (Kim Cương Bát Giác)",armX - 18,armY - 16);
ctx.fillStyle="#1e9c68";ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.5;
ctx.fillRect(px + 20,py - 16,10,24);ctx.strokeRect(px + 20,py - 16,10,24);
ctx.restore();
}

// 7. Stage 3 & 4: Emerald Cocoon + Time Acceleration Rings + Flying Cổ Trăm Trận Trăm Thắng!
if (sk.stage===3||sk.stage===4) {
const cY=py - 56;
const pulse=Math.sin(t*(sk.stage===4?24 :7))*(sk.stage===4?5 :2);
if (sk.stage===4) {
ctx.save();ctx.translate(px,cY);ctx.rotate(t*4.5);
ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(0,0,34 + pulse,0,Math.PI*2);ctx.stroke();
ctx.rotate(-t*7);ctx.strokeStyle="#ff5252";ctx.beginPath();ctx.arc(0,0,44,0,Math.PI*2);ctx.stroke();ctx.restore();
}
const cg=ctx.createRadialGradient(px,cY,4,px,cY,28 + pulse);
cg.addColorStop(0,"#ffffff");cg.addColorStop(0.45,sk.stage===4?"#ff7675" :"#38e8a8");cg.addColorStop(1,"rgba(56,232,168,0)");
ctx.fillStyle=cg;ctx.beginPath();ctx.arc(px,cY,28 + pulse,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#2ecc71";ctx.strokeStyle="#eafff5";ctx.lineWidth=1.8;
ctx.beginPath();ctx.ellipse(px,cY,13 + pulse*0.4,20 + pulse*0.4,0,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle=sk.stage===4?"#ff6b6b" :"#7ef7c4";
ctx.fillText(sk.stage===4?"☢️ Kén Tiên Cổ Tăng Tốc x9 Sắp Nổ!" :`🟢 Kén Tằm (${Math.round(sk.cocoonAbsorb)}%)`,px,cY - 28);
if (sk.stoneArc) {
const stA=sk.stoneArc;const stx=stA.sx + (stA.tx - stA.sx)*stA.p;const sty=stA.sy + (stA.ty - stA.sy)*stA.p;
ctx.fillStyle="#90a4ae";ctx.strokeStyle="#ffd700";ctx.lineWidth=2;ctx.beginPath();ctx.arc(stx,sty,10,0,Math.PI*2);ctx.fill();ctx.stroke();
}
}

// 8. Stage 5: HATCHED RANK 6 IMMORTAL GU — ĐỊNH TIÊN DU JADE BUTTERFLY!
if (sk.stage===5) {
W.Arch.drawJadeButterfly(ctx,px + Math.cos(t*2.8)*58,py - 28 + Math.sin(t*3.2)*16,1.55,t);
ctx.font="bold 15.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="#000";ctx.fillText("🦋 LỤC CHUYỂN TIÊN CỔ — ĐỊNH TIÊN DU RA ĐỜI! 🦋",cx + 1,vh*0.20 + 1);
ctx.fillStyle="#7ef7c4";ctx.fillText("🦋 LỤC CHUYỂN TIÊN CỔ — ĐỊNH TIÊN DU RA ĐỜI! 🦋",cx,vh*0.18);
if (pr.stageStep===18&&pr.poemLineIdx>0) {
for (let li=0;li<pr.poemLineIdx;li++) {
const ly=vh*0.23 + li*22;
ctx.font="italic bold 13px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.88)";ctx.fillText(IMMORTAL_POEM_LINES[li],cx + 1,ly + 1);
ctx.fillStyle="#ffd700";ctx.fillText(IMMORTAL_POEM_LINES[li],cx,ly);
}
}
}

// 9. Live Crowd Reaction Feed on right
sk.crowdBubbles.forEach((cb,idx)=>{
ctx.save();ctx.globalAlpha=Math.min(1,cb.life/1.2);
const bw=Math.min(310,vw*0.40);const bx=vw - bw - 14;const by=vh*0.36 + idx*44;
ctx.fillStyle="rgba(10,13,20,0.90)";ctx.strokeStyle=cb.color;ctx.lineWidth=1.4;
ctx.fillRect(bx,by,bw,36);ctx.strokeRect(bx,by,bw,36);
ctx.font="bold 10.5px Georgia";ctx.textAlign="left";ctx.fillStyle=cb.color;ctx.fillText(cb.speaker + ":",bx + 8,by + 14);
ctx.font="10.5px Georgia";ctx.fillStyle="#f0ebe1";ctx.fillText(cb.text.slice(0,48),bx + 8,by + 28);
ctx.restore();
});

for (const pt of fx.particles) {ctx.save();ctx.globalAlpha=Math.max(0,pt.life/pt.maxLife);ctx.fillStyle=pt.color;ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2);ctx.fill();ctx.restore();}
for (const ft of fx.floatingTexts) {ctx.save();ctx.globalAlpha=Math.max(0,ft.life/ft.maxLife);ctx.font="bold 13.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#000";ctx.fillText(ft.text,ft.x + 1,ft.y + 1);ctx.fillStyle=ft.color;ctx.fillText(ft.text,ft.x,ft.y);ctx.restore();}

ctx.restore();

if (fx.flashAlpha>0.01) {
ctx.fillStyle=`rgba(180,255,220,${fx.flashAlpha*0.62})`;
ctx.fillRect(0,0,vw,vh);
}
}

// ==============================================================================
// PART 1 & PART 2 CUTSCENES (PRESERVED INTACT)
// ==============================================================================
});
})(window);
