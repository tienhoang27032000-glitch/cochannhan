(function (global) {
"use strict";
const {_esc,IMMORTAL_POEM_LINES,SECOND_APERTURE_STEPS}=global.ThreeKingsStory._shared;
Object.assign(global.ThreeKingsStory.prototype, {
_sitAtCauldron() {
const pr=this.progress;
if (!pr) return;
pr.isSeatedAtCauldron=true;
pr.stageStep=13;
pr.delayCount=0;
this.player.x=1300;
this.player.y=975;
this.player.facing="up";
this.player.moveTarget=null;
if (this.scene) this.scene.cauldronPrompt=null;
this.camera.mode="focus";
this.camera.focusX=1300;
this.camera.focusY=960;
this._setMovementLock("Đang Tọa Thiền Chủ Trì Cửu Long Thanh Đồng Đỉnh",false);
this._playSfx("talk");
this._updateQuestHUD();
this._renderCauldronPanel();
},
_renderCauldronPanel() {
if (!this._screen|| !this.progress) return;
const panel=this._screen.querySelector("#tk-cauldron-panel");
const pr=this.progress;
const showStep15=(pr.stageStep===15&& !this.dialogueOpen&& !this.cutscene&& !this.transition&& !this.fx.yangGuFlight);
const showSky=(pr.stageStep===17&&pr.skyMode&&pr.sky&& !this.dialogueOpen&& !this.transition&& !this.cutscene);
const showPart5=(pr.stageStep===18&&pr.skyMode&& !this.dialogueOpen&& !this.transition&& !this.cutscene);
const showSeated=(pr.isSeatedAtCauldron&& !this.dialogueOpen&& !this.cutscene&&(pr.stageStep===13||pr.stageStep===14));
if (!showSeated&& !showStep15&& !showSky&& !showPart5) {
panel.classList.add("hidden");
return;
}
panel.classList.remove("hidden");
if (showPart5) {
this._renderPart5FarewellPanel(panel);
return;
}

if (showStep15) {
panel.innerHTML=`
<div class="tk-cauldron-head">
<strong style="color:#74eaff;">❄️ PHẦN 4 — Bạch Ngưng Băng Giả Tự Bạo Bắc Minh Băng Phách Thể!</strong>
<span class="sub-text" style="color:#ffd700;">🔒 Khóa Di Chuyển • Tay trái: Hoa Vàng Không Khiếu Thứ 2 | Tay phải: Dương Cổ</span>
</div>
<p class="sub-text" style="margin:5px 0 8px 0;color:#f0ebe1;">Băng sương đang lan thẳng tới chỗ ngươi! Bạch Ngưng Băng giả vờ mất hết ý thức hòng ép ngươi bắn <strong>Dương Cổ</strong> sang cứu ả — hãy lập tức thi triển nước cờ phản kích của Phương Nguyên!</p>
<button id="tk-s15-yang" class="btn-primary momentum-btn-ready" style="width:100%;padding:11px;font-size:14px;border-color:#ffd700;">
☀️ Bắn Dương Cổ Nửa Đường Rồi Thu Ngược Về Tay Phải → "Bạch Ngưng Băng, Ngươi Diễn Đủ Chưa?!" [K]
</button>
`;
panel.querySelector("#tk-s15-yang").addEventListener("click",()=>this._fireYangGuExpose());
return;
}

if (showSky) {
this._renderSkyPanelHTML(panel);
return;
}

// --- STEP 13: DELIBERATE DELAY WAITING FOR TIÊU MANG'S THÁI CỔ QUANG QUYỀN ---
if (pr.stageStep===13) {
if (!pr.skyRiftOpen) {
const msg=pr.delayCount===0
?"Ngươi ngồi xếp bằng nhắm mắt bất động trước Cửu Long Thanh Đồng Đỉnh. Bạch Ngưng Băng đứng hộ pháp phía sau bắt đầu mất kiên nhẫn..."
:"Bạch Ngưng Băng phá vỡ im lặng: <em>\"Ngươi còn chờ cái gì nữa? Thời gian không còn nhiều đâu!\"</em> — Địa Linh Bá Quy cũng truyền âm giận dữ thúc giục!";
panel.innerHTML=`
<div class="tk-cauldron-head">
<strong style="color:#ffd700;">🧘 Thanh Đồng Đại Điện — Tọa Thiền Trì Hoãn Chờ Thời Cơ (${pr.delayCount}/2)</strong>
<span class="sub-text" style="color:#7ef7f0;">🔒 Khóa Di Chuyển (Đang Tọa Thiền)</span>
</div>
<p class="sub-text" style="margin:5px 0 8px 0;color:#f0ebe1;">${msg}</p>
<div class="action-grid-2">
<button id="tk-c-wait" class="btn-primary">🧘 "Ngưng Băng, Yên Tâm Đừng Vội!" — Tiếp Tục Trì Hoãn (${pr.delayCount}/2)</button>
<button id="tk-c-rush" class="btn-secondary">🔥 Ném Ngụy Cổ Khai Lò Ngay Lập Tức! (Mạo Hiểm)</button>
</div>
`;
panel.querySelector("#tk-c-wait").addEventListener("click",()=>{
this._playSfx("talk");
pr.delayCount +=1;
if (pr.delayCount===1) {
const bnb=this.scene&&this.scene.entities.find(e=>e.id==="bach_ngung_bang");
const bq=this.scene&&this.scene.entities.find(e=>e.id==="ba_quy");
if (bnb) {bnb.bubble="Ngươi còn chờ cái gì nữa? Thời gian không còn nhiều đâu!";bnb.bubbleTimer=3.8;}
if (bq) {bq.bubble="Chàng thanh niên, sao vẫn còn trì hoãn không ra tay luyện cổ?!";bq.bubbleTimer=3.8;}
this._renderCauldronPanel();
} else {
this._playThaiCoQuangQuyenCutscene();
}
});
panel.querySelector("#tk-c-rush").addEventListener("click",()=>{
this._playSfx("shatter");
this.fx.shake=14;this.fx.flashAlpha=0.7;
this._spawnBurst(1300,860,"#ff5252",42);
this._openDialogue(
"💥 Khai Lò Quá Sớm — Bị Chấn Động Phá Hỏng!",
"Hậu Quả Của Sự Nóng Vội",
"Ngươi vừa ném Ngụy Cổ Không Khiếu Thứ Hai vào đỉnh đồng thì trên đỉnh Tam Xoa Sơn, <strong>Tiêu Mang</strong> bất ngờ tung sát chiêu <strong>Thái Cổ Quang Quyền</strong> làm cả Phúc Địa rung chuyển dữ dội! Mây khói mất kiểm soát nổ tung!<br><br>Hãy kiên nhẫn trì hoãn chờ cơn chấn động thứ nhất đi qua rồi mới khai lò!",
[{label:"🔄 Ngồi Lại Trì Hoãn Chờ Cơn Chấn Động Thứ Nhất",primary:true,onClick:()=>{pr.delayCount=0;this._renderCauldronPanel();}}]
);
});
} else {
panel.innerHTML=`
<div class="tk-cauldron-head">
<strong style="color:#7ef7c4;">✅ Cơn Chấn Động Thứ Nhất Đã Qua — Màng Thai Phúc Địa Đã Thủng!</strong>
<span class="sub-text" style="color:#ffd700;">Địa Linh Bá Quy bội phục sát đất</span>
</div>
<p class="sub-text" style="margin:5px 0 8px 0;color:#ffeaa7;"><strong>Địa Linh Bá Quy truyền âm:</strong> <em>"Thì ra ngươi chờ cơn chấn động này! Nếu trong quá trình luyện cổ xuất hiện sự quấy nhiễu khổng lồ như thế, hậu quả thiết tưởng không chịu nổi. Ngươi không hổ danh Cổ Tiên trùng sinh!"</em></p>
<button id="tk-c-begin-ref" class="btn-primary momentum-btn-ready" style="width:100%;padding:10px;border-color:#38e8a8;color:#7ef7c4;">
🔥 "Tiếp Theo Còn Hai Đợt Chấn Động Nữa! Bây Giờ Ném Ngụy Cổ Không Khiếu Thứ Hai — KHAI LÒ!"
</button>
`;
panel.querySelector("#tk-c-begin-ref").addEventListener("click",()=>this._startSecondApertureRefinement());
}
return;
}

// --- STEP 14: REAL-TIME REFINEMENT + LIVE MULTI-WORLD RESONANCE VIEWER ---
if (pr.stageStep===14) {
const curS=SECOND_APERTURE_STEPS[pr.refStepIdx]||SECOND_APERTURE_STEPS[3];
const stepReady=Boolean(SECOND_APERTURE_STEPS[pr.refStepIdx]&&pr.refProgress>=curS.threshold);
const zMin=curS.minHeat;const zMax=curS.maxHeat;
const inZone=(pr.refHeat>=zMin&&pr.refHeat<=zMax);
const heatCol=pr.refHeatLockTimer>0?"#7ef7f0" :(inZone?"#5cc995" :(pr.refHeat>zMax?"#ff4d4d" :"#67b7d1"));
const prog=Math.round(pr.refProgress);
const ticks=SECOND_APERTURE_STEPS.map((s,idx)=>
`<div style="position:absolute;left:${s.threshold}%;top:0;bottom:0;width:2px;background:${idx<pr.refStepIdx?"#7ef7c4" :"#ffd700"};z-index:3;"></div>`
).join("");
const stepBtnTxt=SECOND_APERTURE_STEPS[pr.refStepIdx]
?(stepReady?`${curS.icon} THỰC HIỆN NGAY: ${curS.name} (Dải lửa ${zMin}%–${zMax}%)` :`🔒 Mốc ${curS.threshold}%: ${curS.name}`)
:"✅ Đã Hoàn Thành 4 Bước — Ngưng Tụ Đóa Hoa Vàng Vân Máu Đỏ!";

panel.innerHTML=`
<div class="tk-cam-bar">
<span style="font-size:11px;color:#ffd700;font-weight:bold;">👁️ Cộng Hưởng Tầm Nhìn Bá Quy (Chuyển Thế Giới):</span>
<button class="btn-mini tk-cam-btn ${!this.resonanceView?"btn-primary" :""}" data-view="hall">[1] 🏯 Thanh Đồng Đại Điện</button>
<button class="btn-mini tk-cam-btn" data-view="righteous">[2] 🏹 Trại Chính Đạo (Tiêu Mang)</button>
<button class="btn-mini tk-cam-btn" data-view="demon">[3] 😈 Trại Quần Ma (Cừu Cửu)</button>
<button class="btn-mini tk-cam-btn" data-view="frontline">[4] 🐕 Phòng Tuyến Khuyển Trận</button>
</div>
<div class="tk-gauges-grid" style="margin:6px 0;">
<div class="tk-gauge-item">
<div class="bar-label"><span>🌺 Bán Thành Phẩm Không Khiếu Thứ 2 (${pr.refStepIdx}/4)</span><strong id="tk-ref-prog-lbl">${prog}%</strong></div>
<div class="progress-track">${ticks}<div id="tk-ref-prog-fill" class="progress-fill" style="width:${prog}%;background:linear-gradient(90deg,#b8860b,#ffd700);"></div></div>
</div>
<div class="tk-gauge-item">
<div class="bar-label"><span>🔥 Hỏa Hầu (Dải chuẩn: ${zMin}%–${zMax}%)${pr.refBoilingMode?" ⚠️ SÔI TRÀO!" :""}</span><strong id="tk-ref-heat-lbl" style="color:${heatCol}">${pr.refHeatLockTimer>0?`🔒 ${pr.refHeatLockTimer.toFixed(1)}s` :`${Math.round(pr.refHeat)}%`}</strong></div>
<div class="progress-track">
<div style="position:absolute;left:${zMin}%;width:${zMax - zMin}%;top:0;bottom:0;background:rgba(92,201,149,0.24);border-left:1.5px dashed #5cc995;border-right:1.5px dashed #5cc995;z-index:2;"></div>
<div id="tk-ref-heat-fill" class="progress-fill" style="width:${Math.max(0,Math.min(100,pr.refHeat))}%;background:${heatCol};"></div>
</div>
</div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:6px;">
<button id="tk-ref-push" class="btn-primary" ${stepReady?"disabled" :""}>🔥 Rót Tinh Thần (+9% Tiến Độ, +10% Hỏa)</button>
<button id="tk-ref-cool" class="btn-accent">❄️ Điều Tiết Mây Khói (-16% Hỏa)</button>
<button id="tk-ref-baquy" class="btn-secondary" ${pr.refBaQuyAssistCd>0?"disabled" :""}>🐢 Bá Quy Ổn Lò${pr.refBaQuyAssistCd>0?` (${pr.refBaQuyAssistCd.toFixed(1)}s)` :""}</button>
</div>
<button id="tk-ref-step-btn" class="${stepReady?"btn-primary momentum-btn-ready" :"btn-secondary"}" style="width:100%;" ${stepReady?"" :"disabled"}>
${_esc(stepBtnTxt)}
</button>
`;

panel.querySelectorAll(".tk-cam-btn").forEach(btn=>{
btn.addEventListener("click",()=>this._switchResonanceView(btn.getAttribute("data-view")));
});
panel.querySelector("#tk-ref-push").addEventListener("click",()=>{
if (pr.refStepWaiting) return;
this._playSfx("fire");
const inZ=(pr.refHeat>=zMin - 4&&pr.refHeat<=zMax + 4);
const gain=inZ?9.2 :4.8;
pr.refProgress=Math.min(100,pr.refProgress + gain);
if (pr.refHeatLockTimer<=0) pr.refHeat=Math.min(98,pr.refHeat + 10);
if (this.scene&&this.scene.id==="bronze_hall") this._spawnBurst(1300,835,"#ffd700",14);
this._checkPart3RefinementMilestones();
});
panel.querySelector("#tk-ref-cool").addEventListener("click",()=>{
this._playSfx("ice");
pr.refHeat=Math.max(8,pr.refHeat - 16);
if (this.scene&&this.scene.id==="bronze_hall") this._spawnBurst(1300,835,"#85c1e9",12);
});
panel.querySelector("#tk-ref-baquy").addEventListener("click",()=>{
if (pr.refBaQuyAssistCd>0) return;
this._playSfx("teleport");
pr.refBaQuyAssistCd=6.5;
const mid=Math.round((zMin + zMax)/2);
pr.refHeat=mid;pr.refHeatLockTimer=3.0;
if (this.scene&&this.scene.id==="bronze_hall") {
this._spawnBurst(1300,835,"#7ef7f0",20);
this._spawnFloatText(1300,795,`🐢 Bá Quy ổn định Hỏa Hầu về ${mid}% (Khóa 3s)!`,"#7ef7f0");
}
this._renderCauldronPanel();
});
panel.querySelector("#tk-ref-step-btn").addEventListener("click",()=>{
if (!stepReady|| !SECOND_APERTURE_STEPS[pr.refStepIdx]) return;
if (pr.refHeat<zMin - 5||pr.refHeat>zMax + 5) {
this._playSfx("warning");this.fx.shake=6;
this._spawnFloatText(this.camera.x,this.camera.y - 40,`⚠️ Hỏa Hầu (${Math.round(pr.refHeat)}%) chưa nằm trong dải ${zMin}%–${zMax}%!`,"#ff8a8a");
return;
}
this._executeSecondApertureStep(SECOND_APERTURE_STEPS[pr.refStepIdx]);
});
}
},
_playThaiCoQuangQuyenCutscene() {
if (this.cinema) {
this.cinema.play("thai_co_quang_quyen",()=>{
this.progress.skyRiftOpen=true;
this.resonanceView=false;
this._loadWorldImmediate("bronze_hall",1300,975);
this.player.x=1300;this.player.y=975;this.player.facing="up";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=960;
this.fx.shake=12;this.fx.flashAlpha=0.55;
this._setMovementLock("Đang Tọa Thiền Chủ Trì Cửu Long Thanh Đồng Đỉnh",false);
this._renderCauldronPanel();
});
return;
}
this.progress.skyRiftOpen=true;
this._renderCauldronPanel();
},
_startSecondApertureRefinement() {
const pr=this.progress;
this._playSfx("fire");
pr.stageStep=14;
pr.isRefiningSecondAperture=true;
pr.refProgress=0;pr.refHeat=52;pr.refStepIdx=0;pr.refStepWaiting=false;pr.refBoilingMode=false;
pr.battleWave=1;
if (this.scene&&this.scene.id==="bronze_hall") this.scene.refStageIdx=0;
this._spawnBurst(1300,835,"#5cc995",34);
this._spawnFloatText(1300,790,"🔥 Đỉnh Đồng Không Lửa Tự Đốt — Khói Xanh Bao Trùm Ngụy Cổ!","#7ef7c4");
this._setTicker("📡 [Chiến Báo] Ám kỳ Cừu Cửu đã tập hợp quần ma tại Trại Quần Ma (Thế Giới 6), cố ý vòng vo kìm chân Ma Vô Thiên! (Bấm [3] xem trực tiếp!)");
this._updateQuestHUD();
this._renderCauldronPanel();
},
_executeSecondApertureStep(step) {
const pr=this.progress;
if (this.resonanceView) this._switchResonanceView("hall");
this._playSfx("loot");
pr.refStepIdx +=1;
pr.refStepWaiting=false;
pr.refProgress=Math.min(100,pr.refProgress + 5);
pr.refHeat=54;
if (this.scene&&this.scene.id==="bronze_hall") this.scene.refStageIdx=pr.refStepIdx;
this.fx.flashAlpha=0.45;this.fx.shake=7;
this._spawnBurst(1300,835,step.color,38);
this._spawnFloatText(1300,785,`${step.icon} ${step.name}!`,step.color);
if (step.id==="blood_sea") {
this._spawnBurst(1300,950,"#ff3b30",28);
this._spawnFloatText(1300,900,"🩸 Cắt động mạch đổ tinh huyết → Thúc cổ trị thương hồi phục!","#ff6b6b");
} else if (step.id==="lifespan_300") {
pr.refBoilingMode=true;pr.refHeat=76;
this._spawnFloatText(1300,870,"⚠️ Cổ Thọ 300 Năm khiến mây khói sôi trào kịch liệt!","#ff9f43");
} else if (step.id==="lifespan_500") {
pr.refBoilingMode=false;
}
this._checkPart3RefinementMilestones();
if (pr.stageStep===14&& !this.cutscene) this._renderCauldronPanel();
},
_checkPart3RefinementMilestones() {
const pr=this.progress;
if (!pr||pr.stageStep!==14) return;

// WAVE 2 (30%): Cutscene on World 6 — Tiêu Mang unleashes Vinh Diệu Ngô Thương blasting away ALL Mê Vụ!
if (pr.refProgress>=30&&pr.battleWave===1) {
pr.battleWave=2;
this._playVinhDieuNgoThuongCutscene();
return;
}
// WAVE 3 (58%): Cutscene on World 6 — Ma Vô Thiên separates from Cừu Cửu, Chính Ma Liên Thủ All-Out Assault!
if (pr.refProgress>=58&&pr.battleWave===2) {
pr.battleWave=3;
this._playAllOutAssaultCutscene();
return;
}
// WAVE 4 (82%): Cutscene on World 6 — Thiết Bạch Kỳ opens Third Eye -> White Ape Army -> Thiết Nhược Nam & 4 Elders storm into Bronze Hall!
if (pr.refProgress>=82&&pr.battleWave===3) {
pr.battleWave=4;
this._playWhiteApeBreakthroughCutscene();
return;
}

const nextS=SECOND_APERTURE_STEPS[pr.refStepIdx];
if (nextS&&pr.refProgress>=nextS.threshold) {
pr.refProgress=Math.min(pr.refProgress,nextS.threshold + 1);
pr.refStepWaiting=true;
this._renderCauldronPanel();
return;
}
if (pr.refProgress>=100&&pr.refStepIdx>=SECOND_APERTURE_STEPS.length) {
this._completePart3IceClimax();
}
},
_playVinhDieuNgoThuongCutscene() {
if (this.cinema) {
this.cinema.play("vinh_dieu_ngo_thuong",()=>{
this.progress.mistCleared=true;
this.resonanceView=false;
this._loadWorldImmediate("bronze_hall",1300,975);
this.player.x=1300;this.player.y=975;this.player.facing="up";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=960;
this.fx.shake=10;this.fx.flashAlpha=0.45;
this._setMovementLock("Đang Tọa Thiền Chủ Trì Cửu Long Thanh Đồng Đỉnh",false);
this._setTicker("⚡ [Chấn Động Lần 2 Đã Qua] Vinh Diệu Ngô Thương đã thổi tan màn Mê Vụ! Chính Ma hai đạo đang giằng co nhìn nhau ngoài phòng tuyến!");
this._renderCauldronPanel();
});
return;
}
this.progress.mistCleared=true;
this._renderCauldronPanel();
},
_playAllOutAssaultCutscene() {
this._playSfx("warning");
this.resonanceView=true;
this._loadWorldImmediate("outer_battlefield",1400,1520);
this.camera.mode="focus";this.camera.focusX=1400;this.camera.focusY=1520;this.camera.zoom=0.60;
const mvt=this.scene&&this.scene.entities.find(e=>e.id==="ma_vo_thien");
const cuu=this.scene&&this.scene.entities.find(e=>e.id==="cuu_cuu");
const tm=this.scene&&this.scene.entities.find(e=>e.id==="tieu_mang");
if (mvt) {mvt.bubble="Cừu Cửu lão nhi! Lão tử tự đi đoạt bảo tàng Cổ Tiên trước!!";mvt.bubbleTimer=4.0;}
if (cuu) {cuu.bubble="Trẻ tuổi xúc động quá! Chư vị cứ chậm rãi lợi dụng y mở đường!";cuu.bubbleTimer=4.0;}
if (tm) {tm.bubble="Chính Ma liên thủ tổng công kích! Phá đại trận đàn chó!";tm.bubbleTimer=4.0;}
this._setMovementLock("Cắt Cảnh Cộng Hưởng (Đợt 3): Chính Ma Liên Thủ Tổng Công Kích!",true);
this._renderCauldronPanel();
this.cutscene={
type:"all_out_assault",t:0,duration:2.75,
onDone:()=>{
this.cutscene=null;
this.resonanceView=false;
this._loadWorldImmediate("bronze_hall",1300,975);
this.player.x=1300;this.player.y=975;this.player.facing="up";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=960;
this._setMovementLock("Đang Tọa Thiền Chủ Trì Cửu Long Thanh Đồng Đỉnh",false);
this._setTicker("⚔️ [Đại Chiến Bùng Nổ] Bá Hoàng chặn Ma Vô Thiên, Anh Minh chặn Tiêu Mang! Dịch Hỏa, Dực Trùng, Viêm Quân, Lý Nhàn, Khổng Nhật Thiên đồng loạt thi triển thần thông!");
this._renderCauldronPanel();
}
};
},
_playWhiteApeBreakthroughCutscene() {
this._playSfx("shatter");
this.resonanceView=true;
this._loadWorldImmediate("outer_battlefield",1060,1480);
this.camera.mode="focus";this.camera.focusX=1060;this.camera.focusY=1480;this.camera.zoom=0.72;
const tbk=this.scene&&this.scene.entities.find(e=>e.id==="thiet_bach_ky");
const tnn=this.scene&&this.scene.entities.find(e=>e.id==="thiet_nhuoc_nam");
if (tbk) {tbk.bubble="Thiếu chủ xông lên đi! Nơi này đã có đại quân vượn trắng của lão phu cản lại!";tbk.bubbleTimer=4.5;}
if (tnn) {tnn.bubble="Tiên cổ rất quan trọng — nhất định phải bắt sống Phương Nguyên!";tnn.bubbleTimer=4.5;}
this._setMovementLock("Cắt Cảnh Cộng Hưởng (Đợt 4): Thiết Bạch Kỳ Mở Mắt Thứ 3 Thả Đại Quân Vượn Trắng!",true);
this._renderCauldronPanel();
this.cutscene={
type:"white_ape_portal",t:0,duration:2.65,
onDone:()=>{
this.cutscene=null;
this.resonanceView=false;
this._loadWorldImmediate("bronze_hall",1300,975);
this.player.x=1300;this.player.y=975;this.player.facing="up";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=1050;
const bnb=this.scene&&this.scene.entities.find(e=>e.id==="bach_ngung_bang");
if (bnb) {bnb.bubble="Phương Chính, ta không duy trì được nữa! Rốt cuộc ngươi còn bao lâu?!";bnb.bubbleTimer=5.0;}
this._setMovementLock("Đang Tọa Thiền Chủ Trì Cửu Long Thanh Đồng Đỉnh",false);
this._setTicker("🦍 [Đột Phá Đại Điện] Thiết Nhược Nam cùng bốn vị Trưởng Lão Thiết Gia đã xông thẳng vào Thanh Đồng Đại Điện giao chiến với Bạch Ngưng Băng ngay sau lưng ngươi!");
this._renderCauldronPanel();
}
};
},
_completePart3IceClimax() {
const pr=this.progress;
if (this.resonanceView) {
this.resonanceView=false;
this._loadWorldImmediate("bronze_hall",1300,975);
}
pr.isSeatedAtCauldron=false;
pr.isRefiningSecondAperture=false;
pr.hasSecondApertureSemi=true;
pr.hallFrozen=true;
pr.stageStep=15;
if (this.scene) {
this.scene.hallFrostLevel=1.0;
this.scene.refStageIdx=4;
}
this._playSfx("ice");
this.fx.shake=12;this.fx.flashAlpha=0.78;
this._spawnBurst(1300,1115,"#74eaff",60);
this._spawnBurst(1300,835,"#ffd700",40);
const bnb=this.scene&&this.scene.entities.find(e=>e.id==="bach_ngung_bang");
if (bnb) {bnb.bubble="Không còn kịp nữa rồi...!";bnb.bubbleTimer=5.0;}

this._awardPart3Rewards();
this._setTicker("❄️ Răng rắc! Bạch Ngưng Băng trôi nổi hóa thân băng tinh — Bắc Minh Băng Phách Thể đóng băng Thiết Nhược Nam và 4 vị Trưởng Lão Thiết Gia!");
this._setMovementLock("Băng Sương Lan Tới — Bắn Dương Cổ Phản Kích!",false);
this._renderCauldronPanel();
this._updateQuestHUD();

this._openDialogue(
"🌺 Bán Thành Phẩm Cổ Không Khiếu Thứ Hai Thành Hình — Đại Điện Hóa Băng!",
"Hoàn Tất Phần 3 → Tiến Thẳng Vào Phần 4!",
"<strong>Răng rắc! Răng rắc!</strong> Hàn khí bốn phía, nhiệt độ trong <strong>Thanh Đồng Đại Điện</strong> giảm mạnh! <strong>Bạch Ngưng Băng</strong> trôi nổi giữa không trung, toàn thân biến thành băng tinh — tầng băng dày đặc đóng cứng <strong>Thiết Nhược Nam</strong> cùng <strong>4 vị Trưởng Lão Thiết Gia</strong> rồi lan thẳng về phía ngươi!<br><br>Đúng khoảnh khắc ấy, mây khói trong <strong>Cửu Long Thanh Đồng Đỉnh</strong> hóa thành <strong>🌺 Bán Thành Phẩm Cổ Không Khiếu Thứ Hai (trường tồn 40 năm)</strong> rơi xuống tay trái ngươi!<br><br><strong style='color:#7ef7c4;'>🏆 ĐÃ HOÀN THÀNH PHẦN 3!</strong> (+140💎 Nguyên Thạch, +65 Nhân Khí, +100 EXP Luyện Cổ — Checkpoint đã lưu!)",
[
{label:"❄️ Tiếp Tục Phần 4 — Đối Mặt Bạch Ngưng Băng Giả Tự Bạo!",primary:true,onClick:()=>this._enterStep15FrozenHall()},
{label:"🏯 Lưu Checkpoint & Về Đại Bản Doanh",primary:false,onClick:()=>this.close(true)}
]
);
},
_awardPart3Rewards() {
if (!this.progress||this.progress.part3Rewarded|| !this.game) return;
this.progress.part3Rewarded=true;
const g=this.game;
const key="story_tam_vuong_p3";
const prev=g.stageClears[key]||0;
g.stageClears[key]=prev + 1;
if (prev===0) {
g.player.primevalStones +=140;
g.aperture.humanQi +=65;
if (g.guSystem) g.guSystem.refinementExp=(g.guSystem.refinementExp||0) + 100;
if (g.ui) g.ui.addLog("🌺 [Tam Vương Truyền Thừa — Phần 3 Hoàn Thành] Đã hoàn thành Bán Thành Phẩm Cổ Không Khiếu Thứ Hai giữa đại chiến ngoại điện (+140💎, +65 Nhân Khí, +100 EXP Luyện Cổ)!","loot");
g.autoSaveNow("tk_part3_clear");
}
}


// ==============================================================================
// PART 4: "BẠCH NGƯNG BĂNG, NGƯƠI DIỄN ĐỦ CHƯA?", STANDOFF & SKY LIGHT RIVER WORLD!
// ==============================================================================
});
})(window);
