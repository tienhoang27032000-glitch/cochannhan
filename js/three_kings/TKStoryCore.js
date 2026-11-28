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


const IMMORTAL_POEM_LINES=[
"Địa Tiên thiên cổ theo gió thoảng, tam vương ngày xưa về với đất.",
"Dương Mãng thất vọng vì bất bại? Quay đầu trở lại lại xưng vương.",
"Thiên Hà một trận nghịch long ngư, một mình đối nghịch với Bát Hoang.",
"Hôm nay tạm thời giương cánh đi, Minh triều thành tiên quất Phượng Hoàng!"
];

const SECOND_APERTURE_STEPS=[
{
threshold:20,id:"grass_flower",name:"Cỏ Dại Phương Hoa",icon:"🌼",color:"#5cc995",minHeat:36,maxHeat:66,
desc:"Khói xanh Thanh Đề Tiên Nguyên hóa cỏ xanh mọc giữa không trung, ánh sáng vàng ngụy cổ hóa đóa hoa rơi xuống tô điểm!"
},
{
threshold:45,id:"blood_sea",name:"Huyết Khí Như Biển (Cắt Động Mạch)",icon:"🩸",color:"#ff3b30",minHeat:44,maxHeat:74,
desc:"Phương Nguyên cầm dao cắt vỡ động mạch! Máu tươi phun vào mây khói phát tiếng xèo xèo hóa huyết hải và đồng ruộng lúa đỏ!"
},
{
threshold:70,id:"lifespan_300",name:"Ba Trăm Tuổi Vì Xuân (Cổ Thọ 300 Năm)",icon:"🌿",color:"#7ef7c4",minHeat:34,maxHeat:64,
desc:"Ném Cổ Thọ 300 năm hình râu sâm vào đồng ruộng khói! Mây khói sôi trào kịch liệt như nước sôi!"
},
{
threshold:92,id:"lifespan_500",name:"Năm Trăm Tuổi Thành Thu (Cổ Thọ 500 Năm)",icon:"🌾",color:"#ffd700",minHeat:46,maxHeat:76,
desc:"Thả Cổ Thọ 500 năm! Đồng ruộng máu mọc đầy bông lúa vàng nặng trĩu, thu nhỏ từ vại nước thành chậu rửa mặt!"
}
];

class ThreeKingsStory {
constructor(gameEngine) {
this.game=gameEngine||null;
this._rafId=null;
this._lastTs=0;
this._screen=null;
this._canvas=null;
this._ctx=null;
this._miniCanvas=null;
this._miniCtx=null;
this.scene=null;
this.progress=null;
this.player=null;
this.camera=null;
this.fx=null;
this.movementLockReason=null;
this.dialogueOpen=false;
this.transition=null;
this.cutscene=null;
this.resonanceView=false;
this.soundEnabled=true;
this._audioCtx=null;
this._keys={};
this._keydownFn=null;
this._keyupFn=null;
this._resizeFn=null;
this._joy={active:false,id:null,dx:0,dy:0,cx:0,cy:0};
this.cinema=global.ThreeKingsCinema?new global.ThreeKingsCinema(this) :null;
}
_playSfx(type) {
if (!this.soundEnabled) return;
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return;
if (!this._audioCtx) this._audioCtx=new AudioCtx();
if (this._audioCtx.state==="suspended") this._audioCtx.resume();
const ac=this._audioCtx;
const now=ac.currentTime;
const tone=(freq,dur,wave="sine",vol=0.11,endFreq=null,delay=0)=>{
const osc=ac.createOscillator();
const g=ac.createGain();
osc.type=wave;
osc.frequency.setValueAtTime(freq,now + delay);
if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20,endFreq),now + delay + dur);
g.gain.setValueAtTime(0.0001,now + delay);
const _vMult=global.vanCoSettings?global.vanCoSettings.getVolumeMultiplier() :1;
g.gain.linearRampToValueAtTime(Math.max(0.0001,vol*_vMult),now + delay + 0.015);
g.gain.exponentialRampToValueAtTime(0.0001,now + delay + dur);
osc.connect(g);
g.connect(ac.destination);
osc.start(now + delay);
osc.stop(now + delay + dur + 0.03);
};
if (type==="punch") {tone(145,0.14,"sawtooth",0.13,44,0);tone(92,0.18,"triangle",0.12,35,0.01);}
else if (type==="dash") {tone(260,0.18,"triangle",0.09,520,0);}
else if (type==="teleport") {tone(392,0.24,"sine",0.10,784,0);tone(587,0.34,"triangle",0.08,1174,0.06);}
else if (type==="cicada") {tone(523.25,0.26,"sine",0.09,659.25,0);tone(659.25,0.26,"sine",0.09,783.99,0.12);tone(783.99,0.42,"triangle",0.10,1046.5,0.24);}
else if (type==="loot") {tone(523,0.15,"triangle",0.10,659,0);tone(659,0.22,"triangle",0.10,1046,0.08);}
else if (type==="enslave") {tone(330,0.35,"sine",0.10,494,0);tone(660,0.45,"triangle",0.08,880,0.08);}
else if (type==="fire") {tone(165,0.22,"sawtooth",0.07,265,0);tone(245,0.18,"triangle",0.08,340,0.04);}
else if (type==="ice") {tone(880,0.24,"sine",0.09,620,0);tone(1320,0.20,"triangle",0.06,990,0.03);}
else if (type==="shatter") {tone(135,0.52,"sawtooth",0.14,38,0);tone(880,0.24,"square",0.06,220,0.02);tone(620,0.28,"triangle",0.07,180,0.08);}
else if (type==="victory") {[392,493.88,587.33,783.99,987.77].forEach((n,i)=>tone(n,0.55,"triangle",0.09,n*1.01,i*0.07));}
else if (type==="talk") {tone(420,0.09,"sine",0.06,460,0);}
else if (type==="warning") {tone(190,0.26,"sawtooth",0.10,120,0);}
else if (type==="absorb") {tone(220,0.45,"sine",0.09,440,0);tone(330,0.55,"triangle",0.08,660,0.15);}
} catch (e) {}
}
openPreviewModal() {
const g=this.game;
const rank=(g&&g.aperture)?g.aperture.rank :1;
const rankName=(global.GuSystem&&global.GuSystem.getRankName)?global.GuSystem.getRankName(rank) :`${rank} Chuyển`;
const hasP1=Boolean(g&&g.getStageClearCount&&g.getStageClearCount("story_tam_vuong_p1")>0);
const hasP2=Boolean(g&&g.getStageClearCount&&g.getStageClearCount("story_tam_vuong_p2")>0);
const hasP3=Boolean(g&&g.getStageClearCount&&g.getStageClearCount("story_tam_vuong_p3")>0);
const hasP4=Boolean(g&&g.getStageClearCount&&(g.getStageClearCount("story_tam_vuong_p4")>0||g.getStageClearCount("story_tam_vuong_dinh_tien_du")>0));
let pModal=document.getElementById("tk-preview-modal");
if (!pModal) {
pModal=document.createElement("div");
pModal.id="tk-preview-modal";
pModal.className="modal-backdrop hidden";
pModal.style.position="fixed";
pModal.style.zIndex="200";
pModal.innerHTML=`
<div class="modal-window tk-story-window" style="max-width:690px;">
<div class="modal-header tk-story-header" style="display:flex;justify-content:space-between;align-items:center;">
<h2 style="margin:0;font-size:16.5px;color:#ffd700;">🦋 Tam Vương Truyền Thừa — Kiến Trúc 6 Thế Giới Độc Lập</h2>
<button id="tk-prev-close" class="btn-mini">✕ Đóng</button>
</div>
<div class="modal-body" id="tk-prev-body"></div>
</div>
`;
document.body.appendChild(pModal);
pModal.querySelector("#tk-prev-close").addEventListener("click",()=>{pModal.classList.add("hidden");});
}
const body=pModal.querySelector("#tk-prev-body");
body.innerHTML=`
<div class="recipe-preview-box" style="border-color:#38e8a8;">
<p><strong style="color:#7ef7c4;font-size:14.5px;">🏯 6 Thế Giới Độc Lập Nạp Riêng Khi Truyền Tống — Công Trình Tỉ Mỉ & Khóa Di Chuyển Chuẩn Điện Ảnh!</strong></p>
<p class="sub-text mt-5">Mỗi khu vực là một bản đồ độc lập rộng lớn, chỉ nạp khi <strong>Địa Linh Bá Quy</strong> truyền tống hoặc kích hoạt <strong>👁️ Cộng Hưởng Tầm Nhìn</strong>:</p>
<ul class="keybind-guide-list mt-10" style="margin-top:8px;">
<li><strong>Phần 1 (Thế Giới 1 & 2):</strong> <strong>Thanh Đồng Đại Điện</strong> & <strong>Độc Mù Trúc Lâm</strong> — hạ <strong>Long Thanh Thiên</strong> đoạt <strong>🎋 Cổ Bích Không</strong>.</li>
<li><strong>Phần 2 (Thế Giới 3, 4 & 5):</strong> <strong>Rừng Đá Khuyển Vương</strong> (hạ Chương Tam Tam đoạt <strong>⛓️ Cổ Nô Lệ 5C</strong>) → <strong>Hoang Nguyên Bạo Vương</strong> (đọ hồn & đấm đạp thu phục <strong>Cừu Cửu</strong>) → <strong>Cổ Tự Tín Vương</strong> (phá quan đoạt <strong>🪨 Cổ Trăm Trận Trăm Thắng</strong>).</li>
<li><strong>Phần 3 (Thế Giới 6):</strong> <strong>Chiến Trường Ngoại Vi Tam Xoa Sơn</strong> — tước 10 vạn khuyển thú Bạch Ngưng Băng, ngồi khóa di chuyển luyện <strong>Bán Thành Phẩm Cổ Không Khiếu Thứ Hai</strong> kèm <strong>👁️ Cộng Hưởng Tầm Nhìn Bá Quy</strong> xem trực tiếp đại chiến ngoại điện!</li>
<li><strong>Phần 4 (Không Gian Trên Cao: Thiên Bộc Quang Hà):</strong> Bóc trần <strong>"Bạch Ngưng Băng, ngươi diễn đủ chưa?"</strong>, thuyết phục Địa Linh Bá Quy & nạp <strong>Thế Giới Trên Không: Thiên Bộc Quang Hà</strong> bay ngược thác ánh sáng luyện thành <strong>🦋 Lục Chuyển Tiên Cổ ĐỊNH TIÊN DU</strong>!</li>
<li><strong>Phần 5 — Đại Kết Cục (Thế Giới 7: Đỉnh Núi Đãng Hồn — Hoàn Thiện Trọn Bộ!):</strong> Ly biệt Địa Linh Bá Quy, khắc họa địa điểm & cất giọng ngâm trọn <strong>4 câu thơ bất hủ</strong> → Lóe lục quang bỏ lại bộ quần áo rơi giữa <strong>Gió Đại Đồng</strong> → Nạp riêng <strong>Thế Giới 7: Đỉnh Núi Đãng Hồn & Đãng Hồn Cung (Phúc Địa Hồ Tiên — Trung Châu)</strong> với <strong>6 nhân vật Trung Châu tách riêng</strong> (<em>Tiểu Hồ Tiên, Phượng Kim Hoàng Mộng Dực, Cổ Nguyệt Phương Chính, Thiên Hạc Thượng Nhân, Ứng Sinh Cơ, Tiêu Thất Tinh</em>) → Thu phục Phúc Địa Hồ Tiên & chính thức nhận vĩnh viễn <strong>🦋 Lục Chuyển Định Tiên Du Tiên Cổ</strong>!</li>
</ul>
<p class="mt-10" style="color:${rank>=4?"#5cc995" :"#ff9f43"};font-weight:bold;">
${rank>=4?"✅ Ngươi đã đạt Tứ Chuyển! Chọn điểm khởi đầu để bước vào Tam Vương Phúc Địa!" :`🔒 Mở khóa tại Tứ Chuyển (4 Chuyển) — Cảnh giới hiện tại: ${rankName}. Hãy tu luyện đạt Tứ Chuyển để tiến vào!`}
</p>
</div>
<div class="action-row mt-10" style="justify-content:flex-end;flex-wrap:wrap;">
${rank>=4?`<button id="tk-prev-p1" class="btn-primary">🏯 Phần 1 (Thanh Đồng Đại Điện)</button>` :""}
${rank>=4&&hasP1?`<button id="tk-prev-p2" class="btn-primary" style="border-color:#ffd700;">⛓️ Phần 2 (Rừng Đá → Cừu Cửu)</button>` :""}
${rank>=4&&hasP2?`<button id="tk-prev-p3" class="btn-primary" style="border-color:#ff9f43;color:#ffeaa7;">🔥 Phần 3 (Luyện Cổ & Ngoại Vi)</button>` :""}
${rank>=4&&hasP3?`<button id="tk-prev-p4" class="btn-primary" style="border-color:#38e8a8;color:#7ef7c4;">🌊 Phần 4 (Thiên Bộc Quang Hà)</button>` :""}
${rank>=4&&hasP4?`<button id="tk-prev-p5" class="btn-primary" style="border-color:#ff85d5;color:#ffd1f2;">🦊 Phần 5 (Đại Kết Cục: Ngâm Thơ & Đãng Hồn Sơn!)</button>` :""}
${rank>=4?`<button id="tk-prev-cinema" class="btn-accent" style="border-color:#fff2a6;color:#fff2a6;">🎬 Xem Phim: Thiên Bộc Quang Hà & Bay Vào Cột Sáng</button>` :""}
<button id="tk-prev-ok" class="btn-secondary">Đóng</button>
</div>
`;
body.querySelector("#tk-prev-ok").addEventListener("click",()=>pModal.classList.add("hidden"));
const b1=body.querySelector("#tk-prev-p1");if (b1) b1.addEventListener("click",()=>{pModal.classList.add("hidden");this.open(1);});
const b2=body.querySelector("#tk-prev-p2");if (b2) b2.addEventListener("click",()=>{pModal.classList.add("hidden");this.open(2);});
const b3=body.querySelector("#tk-prev-p3");if (b3) b3.addEventListener("click",()=>{pModal.classList.add("hidden");this.open(3);});
const b4=body.querySelector("#tk-prev-p4");if (b4) b4.addEventListener("click",()=>{pModal.classList.add("hidden");this.open(4);});
const b5=body.querySelector("#tk-prev-p5");if (b5) b5.addEventListener("click",()=>{pModal.classList.add("hidden");this.open(5);});
const bCin=body.querySelector("#tk-prev-cinema");if (bCin) bCin.addEventListener("click",()=>{pModal.classList.add("hidden");this.openCinemaShowcase();});
pModal.classList.remove("hidden");
}
open(startPart=null) {
const g=this.game;
if (!g|| !g.aperture|| !g.player) return;
if (!global.ThreeKingsWorlds) {
if (g.ui) g.ui.addLog("⚠️ Không tìm thấy module ThreeKingsWorlds.js!","danger");
return;
}
if (g.aperture.rank<4) {
const rName=(global.GuSystem&&global.GuSystem.getRankName)?global.GuSystem.getRankName(g.aperture.rank) :`${g.aperture.rank} Chuyển`;
if (g.ui) g.ui.addLog(`🔒 【Tam Vương Truyền Thừa】 mở khóa tại Tứ Chuyển (4 Chuyển)! Cảnh giới hiện tại: ${rName}.`,"warning");
this.openPreviewModal();
return;
}

const hasAny=Boolean(g.getStageClearCount&&(g.getStageClearCount("story_tam_vuong_p1")>0||g.getStageClearCount("story_tam_vuong_p2")>0||g.getStageClearCount("story_tam_vuong_p3")>0||g.getStageClearCount("story_tam_vuong_p4")>0||g.getStageClearCount("story_tam_vuong_dinh_tien_du")>0));
if (startPart===null&&hasAny) {
this.openPreviewModal();
return;
}
const prevModal=document.getElementById("tk-preview-modal");
if (prevModal) prevModal.classList.add("hidden");
const chosenPart=startPart||1;
this.close(false);
this._ensureScreenDOM();
this._initSessionState(chosenPart);
this._bindEvents();
g.currentScreen="tk_story";
if (g.ui&&typeof g.ui.showScreen==="function") g.ui.showScreen("tk_story");
this._screen.classList.add("active");
this._handleResize();

if (chosenPart>=5) {
this._enterPart5FarewellInSky();
} else if (chosenPart===4) {
this._loadWorldImmediate("bronze_hall",1300,975);
this.player.facing="down";
this._enterStep15FrozenHall();
} else if (chosenPart===3) {
this._loadWorldImmediate("bronze_hall",1300,1470);
this._playSfx("teleport");
this._spawnBurst(1300,1470,"#ffd700",36);
this._spawnFloatText(1300,1430,"🔥 Ngày 24 Tháng 10 — Tiến Gần Bạch Ngưng Băng Trước Cổng Điện [E]!","#ffd700");
} else if (chosenPart===2) {
this._loadWorldImmediate("dog_forest",1300,1830);
this._playSfx("teleport");
this._spawnBurst(1300,1830,"#5aa9e6",36);
this._spawnFloatText(1300,1790,"🔵 Đã Truyền Tống Tới Thế Giới 3: Rừng Đá Khuyển Vương!","#85c1e9");
} else {
this._loadWorldImmediate("bronze_hall",1300,1010);
this._startAwakeningIntroCutscene();
}

this._lastTs=performance.now();
this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
}
openCinemaShowcase() {
const g=this.game;
if (!g|| !g.aperture|| !g.player||g.aperture.rank<4) {
if (g&&g.ui) g.ui.addLog("🔒 Cần đạt Tứ Chuyển (4 Chuyển) để mở khóa Tam Vương Truyền Thừa!","warning");
return;
}
this.close(false);
this._ensureScreenDOM();
this._initSessionState(4);
this._bindEvents();
g.currentScreen="tk_story";
if (g.ui&&typeof g.ui.showScreen==="function") g.ui.showScreen("tk_story");
this._screen.classList.add("active");
this._handleResize();
this._loadWorldImmediate("bronze_hall",1300,985);
if (this.cinema) {
this.cinema.play("thien_boc_quang_ha",()=>{
this.close(true);
});
}
this._lastTs=performance.now();
this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
}
close(returnToHub=true) {
if (this.cinema&&this.cinema.isActive()) this.cinema.stop(false);
if (this._rafId) {cancelAnimationFrame(this._rafId);this._rafId=null;}
this._unbindEvents();
if (this._screen) {
this._screen.classList.remove("active");
const curtain=this._screen.querySelector("#tk-world-curtain");
if (curtain) curtain.classList.add("hidden");
}
this.scene=null;this.progress=null;this.transition=null;this.cutscene=null;
this.movementLockReason=null;this.resonanceView=false;
if (returnToHub&&this.game&&this.game.ui) {
this.game.currentScreen="hub";
this.game.ui.showScreen("hub");
}
}
_initSessionState(startPart=1) {
const isMob=document.body&&document.body.classList.contains("mobile-ui");
this.progress={
stageStep:0,
// PART 1 (0..3) | PART 2 (4..10)
// PART 3 (11..15):
// 11: Quay về Thanh Đồng Đại Điện tước cổ trùng chỉ huy đàn chó từ Bạch Ngưng Băng -> Mở Thế Giới 6!
// 12: Đi tới Cửu Long Thanh Đồng Đỉnh nhấn [E] ngồi xếp bằng chờ thời cơ (Hoặc sang Thế Giới 6 thám thính trước)
// 13: Đang ngồi khóa di chuyển trước Đỉnh Đồng: Trì hoãn 2 lần -> Xem cắt cảnh Tiêu Mang tung Thái Cổ Quang Quyền ở Thế Giới 6!
// 14: Đang ngồi khóa di chuyển Luyện Bán Thành Phẩm Cổ Không Khiếu Thứ Hai (4 bước + 3 đợt chuyển cảnh đại chiến ở Thế Giới 6!)
// 15: Hoàn tất Phần 3! Đại Điện hóa băng (Bắc Minh Băng Phách Thể), nhận Bán Thành Phẩm Không Khiếu Thứ 2 (40 năm)!
unlockedWorlds:{
bronze_hall:true,
poison_grove:false,
dog_forest:false,
bao_wasteland:false,
xin_temple:false,
outer_battlefield:false,
dang_hun_mountain:false
},
longThanhThienDead:false,hasBichKhong:false,
chuongTamTamDead:false,hasNoLeGu:false,
cuuCuuEnslaved:false,cuuCuuSentToXin:false,xinPillarExtinguished:false,hasTramTran:false,
// Part 3 states
bnbStripped:false,
skyRiftOpen:false,
mistCleared:false,
isSeatedAtCauldron:false,
isRefiningSecondAperture:false,
hasSecondApertureSemi:false,
hallFrozen:false,
delayCount:0,
battleWave:0,
refProgress:0,refHeat:52,refStepIdx:0,refStepWaiting:false,
refOverheatTimer:0,refColdTimer:0,refBaQuyAssistCd:0,refHeatLockTimer:0,refBoilingMode:false,
part1Rewarded:false,part2Rewarded:false,part3Rewarded:false,part4Rewarded:false,
// Part 4 states
standoffExposed:false,
hallRoofShattered:false,
hasDinhTienDu:false,
skyMode:false,
sky:null,
// Part 5 Grand Finale states
part5SubStep:1, // 1: Destination choice, 2: Recite 4 Poem Lines
poemLineIdx:0,
teleportCinema:null,
huImmortalClaimed:false
};

if (startPart>=2) {
const pr=this.progress;
pr.stageStep=4;
pr.unlockedWorlds.poison_grove=true;
pr.unlockedWorlds.dog_forest=true;
pr.longThanhThienDead=true;pr.hasBichKhong=true;pr.part1Rewarded=true;
}
if (startPart>=3) {
const pr=this.progress;
pr.stageStep=11;
pr.unlockedWorlds.bao_wasteland=true;
pr.unlockedWorlds.xin_temple=true;
pr.chuongTamTamDead=true;pr.hasNoLeGu=true;
pr.cuuCuuEnslaved=true;pr.cuuCuuSentToXin=true;pr.xinPillarExtinguished=true;pr.hasTramTran=true;
pr.part2Rewarded=true;
}
if (startPart>=4) {
const pr=this.progress;
pr.stageStep=15;
pr.unlockedWorlds.outer_battlefield=true;
pr.bnbStripped=true;
pr.skyRiftOpen=true;
pr.mistCleared=true;
pr.hasSecondApertureSemi=true;
pr.hallFrozen=true;
pr.battleWave=4;
pr.refStepIdx=4;
pr.part3Rewarded=true;
}
if (startPart>=5) {
const pr=this.progress;
pr.stageStep=18;
pr.hallFrozen=false;
pr.standoffExposed=true;
pr.hallRoofShattered=true;
pr.hasDinhTienDu=true;
pr.part4Rewarded=true;
pr.part5SubStep=1;
pr.poemLineIdx=0;
}

this.player={
x:1300,y:1010,z:0,vz:0,isJumping:false,jumpCount:0,maxJumps:2,
speed:268,radius:17,
facing:"up",aimAngle:-Math.PI/2,
moveTarget:null,attackCd:0,attackAnim:0,
dashCd:0,dashTimer:0,dashVx:0,dashVy:0,walkPhase:0,slowTimer:0
};
this.camera={x:1300,y:960,zoom:isMob?0.78 :0.95,mode:"player",focusX:1300,focusY:960};
this.fx={t:0,particles:[],floatingTexts:[],rings:[],shockwaves:[],fistEffect:null,spearEffect:null,yangGuFlight:null,waterfallBeam:null,battleFxTimer:0,shake:0,flashAlpha:0.45};
this.movementLockReason=null;this.dialogueOpen=false;this.transition=null;this.cutscene=null;this.resonanceView=false;
}
_ensureScreenDOM() {
let scr=document.getElementById("tk-world-screen");
if (!scr) {
scr=document.createElement("div");
scr.id="tk-world-screen";
scr.className="screen tk-world-screen";
scr.innerHTML=`
<canvas id="tk-world-canvas"></canvas>

<div id="tk-letterbox-top" class="tk-letterbox tk-letterbox-top"></div>
<div id="tk-letterbox-bot" class="tk-letterbox tk-letterbox-bot"></div>
<div id="tk-lock-banner" class="tk-lock-banner hidden"></div>

<div class="tk-hud-top">
<div class="tk-objective-panel">
<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
<span id="tk-act-badge" class="badge" style="border-color:#38e8a8;color:#7ef7c4;background:rgba(15,52,40,0.85);">🦋 TAM VƯƠNG TRUYỀN THỪA</span>
<span id="tk-zone-name" style="font-size:12px;color:#ffd700;font-weight:bold;">Thanh Đồng Đại Điện</span>
</div>
<div id="tk-obj-title" class="tk-obj-title">Tỉnh dậy sau Xuân Thu Thiền trùng sinh</div>
<div id="tk-obj-sub" class="tk-obj-sub">Đang khởi động...</div>
<div id="tk-relic-belt" class="tk-relic-belt"></div>
</div>

<div class="tk-top-right">
<div class="tk-minimap-wrap">
<canvas id="tk-minimap-canvas" width="168" height="112"></canvas>
<div id="tk-minimap-lbl" class="tk-minimap-lbl">Thanh Đồng Đại Điện</div>
</div>
<div class="tk-top-btns">
<button id="tk-btn-bag" class="btn-mini btn-secondary" title="Mở Nhanh Kho Đồ / Hành Trang (Phím I)">🎒 [I]</button>
<button id="tk-btn-ap" class="btn-mini btn-accent" title="Mở Nhanh Không Khiếu & Kho Cổ (Phím O)">☯️ [O]</button>
<button id="tk-btn-tp" class="btn-mini btn-accent" title="Truyền Tống Sang Thế Giới Khác (Phím T)">🐢 Truyền Tống [T]</button>
<button id="tk-btn-zoom" class="btn-mini" title="Đổi Tầm Nhìn Camera">🔍 0.95x</button>
<button id="tk-btn-sfx" class="btn-mini">🔊</button>
<button id="tk-btn-ext-settings" class="btn-mini" title="Cài Đặt Hệ Thống (Phím F2)">⚙️</button>
<button id="tk-btn-exit" class="btn-mini btn-danger">🏯 Rời Phúc Địa</button>
</div>
</div>
</div>

<div id="tk-target-bar" class="tk-target-bar hidden"></div>
<div id="tk-battle-ticker" class="tk-battle-ticker hidden"></div>
<div id="tk-cauldron-panel" class="tk-cauldron-panel hidden"></div>

<div id="tk-dialogue-box" class="tk-dialogue-box hidden">
<div class="tk-dlg-head">
<strong id="tk-dlg-speaker" style="color:#ffd700;font-size:14.5px;"></strong>
<span id="tk-dlg-role" class="sub-text" style="color:#7ef7f0;font-size:11.5px;"></span>
</div>
<p id="tk-dlg-text" class="tk-dlg-text"></p>
<div id="tk-dlg-choices" class="tk-dlg-choices"></div>
</div>

<div id="tk-tp-modal" class="modal-backdrop hidden" style="position:fixed;z-index:210;">
<div class="modal-window tk-story-window" style="max-width:570px;">
<div class="modal-header tk-story-header" style="display:flex;justify-content:space-between;align-items:center;">
<h3 style="margin:0;color:#ffd700;">🐢 Truyền Tống Địa Linh Bá Quy (7 Thế Giới Độc Lập)</h3>
<button id="tk-tp-close" class="btn-mini">✕</button>
</div>
<div class="modal-body" id="tk-tp-list"></div>
</div>
</div>

<div id="tk-world-curtain" class="tk-world-curtain hidden">
<div class="tk-curtain-inner">
<div class="tk-curtain-ring">🐢</div>
<div id="tk-curtain-tag" class="tk-curtain-tag">TRUYỀN TỐNG ĐỊA LINH BÁ QUY</div>
<h2 id="tk-curtain-title" class="tk-curtain-title">Đang Nạp Thế Giới...</h2>
<p id="tk-curtain-sub" class="tk-curtain-sub"></p>
<div class="progress-track" style="width:min(360px,78vw);height:8px;margin:12px auto 0 auto;">
<div id="tk-curtain-fill" class="progress-fill" style="width:0%;background:linear-gradient(90deg,#1d8348,#38e8a8,#ffd700);"></div>
</div>
</div>
</div>

<div id="tk-controls-overlay" class="tk-controls-overlay">
<div id="tk-joystick-zone" class="tk-joystick-zone">
<div class="tk-joystick-base">
<div id="tk-joystick-knob" class="tk-joystick-knob"></div>
</div>
</div>
<div class="tk-action-pad">
<button id="tk-act-jump" class="tk-act-btn tk-btn-interact" title="Phím Space">
<span>🦘</span><small>Nhảy [SPACE]</small>
</button>
<button id="tk-act-interact" class="tk-act-btn tk-btn-interact" title="Phím E">
<span>💬</span><small>Tương Tác [E]</small>
</button>
<button id="tk-act-special" class="tk-act-btn tk-btn-special" title="Phím K">
<span>⚡</span><small id="tk-special-lbl">Xung Phong [K]</small>
</button>
<button id="tk-act-attack" class="tk-act-btn tk-btn-attack" title="Phím J / Space">
<span>👊</span><small>Lực Đạo [J]</small>
</button>
</div>
</div>
`;
document.body.appendChild(scr);

scr.querySelector("#tk-btn-exit").addEventListener("click",()=>this.close(true));
scr.querySelector("#tk-btn-sfx").addEventListener("click",(e)=>{
this.soundEnabled= !this.soundEnabled;
e.currentTarget.textContent=this.soundEnabled?"🔊" :"🔇";
if (global.vanCoSettings) global.vanCoSettings.set("soundEnabled",this.soundEnabled,true);
});
scr.querySelector("#tk-btn-ext-settings").addEventListener("click",()=>{
if (global.vanCoSettings) global.vanCoSettings.open();
});
scr.querySelector("#tk-btn-bag").addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("bag");});
scr.querySelector("#tk-btn-ap").addEventListener("click",()=>{if (global.vanCoQuickBag) global.vanCoQuickBag.open("gu");});
scr.querySelector("#tk-btn-tp").addEventListener("click",()=>this._openTeleportMenu());
scr.querySelector("#tk-tp-close").addEventListener("click",()=>{scr.querySelector("#tk-tp-modal").classList.add("hidden");});
scr.querySelector("#tk-btn-zoom").addEventListener("click",(e)=>{
if (!this.camera) return;
const levels=[0.25,0.50,0.95,1.50,3.00,6.00,12.00,20.00];
const curIdx=levels.findIndex(v=>Math.abs(v - this.camera.zoom)/Math.max(0.2,v)<0.14);
const next=levels[(curIdx + 1) % levels.length];
this.camera.zoom=next;
e.currentTarget.textContent=`🔍 ${Math.round(next*100)}%`;
});

scr.querySelector("#tk-act-attack").addEventListener("click",()=>this._performAttack());
scr.querySelector("#tk-act-special").addEventListener("click",()=>this._performSpecial());
scr.querySelector("#tk-act-interact").addEventListener("click",()=>this._performInteract());
scr.querySelector("#tk-act-jump").addEventListener("click",()=>this._performJump());

const joyZone=scr.querySelector("#tk-joystick-zone");
const joyKnob=scr.querySelector("#tk-joystick-knob");
const resetJoy=()=>{
this._joy.active=false;this._joy.id=null;this._joy.dx=0;this._joy.dy=0;
if (joyKnob) joyKnob.style.transform="translate(-50%,-50%)";
};
joyZone.addEventListener("touchstart",(e)=>{
if (this._isMovementLocked()) return;
e.preventDefault();
const t=e.changedTouches[0];const rect=joyZone.getBoundingClientRect();
this._joy.active=true;this._joy.id=t.identifier;
this._joy.cx=rect.left + rect.width/2;this._joy.cy=rect.top + rect.height/2;
},{passive:false});
joyZone.addEventListener("touchmove",(e)=>{
if (!this._joy.active||this._isMovementLocked()) {resetJoy();return;}
e.preventDefault();
for (const t of e.changedTouches) {
if (t.identifier!==this._joy.id) continue;
const dx=t.clientX - this._joy.cx;const dy=t.clientY - this._joy.cy;
const dist=Math.hypot(dx,dy);const maxR=42;
const clamped=Math.min(dist,maxR);const ang=Math.atan2(dy,dx);
const nx=dist>4?(Math.cos(ang)*clamped)/maxR :0;
const ny=dist>4?(Math.sin(ang)*clamped)/maxR :0;
this._joy.dx=nx;this._joy.dy=ny;
if (joyKnob) joyKnob.style.transform=`translate(calc(-50% + ${nx*maxR}px), calc(-50% + ${ny*maxR}px))`;
if (this.player) this.player.moveTarget=null;
}
},{passive:false});
joyZone.addEventListener("touchend",resetJoy);
joyZone.addEventListener("touchcancel",resetJoy);

const cv=scr.querySelector("#tk-world-canvas");
cv.addEventListener("wheel",(e)=>{
if (!this.camera||(this.cinema&&this.cinema.isActive())||(this.progress&&this.progress.skyMode)) return;
e.preventDefault();
const cur=this.camera.zoom||0.95;
const mult=e.deltaY<0?1.18 :(1 / 1.18);
this.camera.zoom=Number(Math.max(0.20,Math.min(20.0,cur*mult)).toFixed(2));
const zb=scr.querySelector("#tk-btn-zoom");
if (zb) zb.textContent=`🔍 ${Math.round(this.camera.zoom*100)}%`;
},{passive:false});
this._skyPointer={active:false,x:0,y:0};
cv.addEventListener("pointermove",(e)=>{
if (!this.progress|| !this.progress.skyMode|| !this._skyPointer.active) return;
const rect=cv.getBoundingClientRect();
this._skyPointer.x=e.clientX - rect.left;
this._skyPointer.y=e.clientY - rect.top;
});
window.addEventListener("pointerup",()=>{if (this._skyPointer) this._skyPointer.active=false;});
cv.addEventListener("pointerdown",(e)=>{
if (this.progress&&this.progress.skyMode&& !this.dialogueOpen&& !this.transition&& !this.cutscene) {
const rect=cv.getBoundingClientRect();
this._skyPointer.active=true;
this._skyPointer.x=e.clientX - rect.left;
this._skyPointer.y=e.clientY - rect.top;
return;
}
if (!this.scene|| !this.player||this._isMovementLocked()) return;
const rect=cv.getBoundingClientRect();
const sx=e.clientX - rect.left;const sy=e.clientY - rect.top;
const wx=(sx - rect.width/2)/this.camera.zoom + this.camera.x;
const wy=(sy - rect.height/2)/this.camera.zoom + this.camera.y;

// Direct click on Nine-Dragon Bronze Cauldron in Step 12!
if (this.scene.id==="bronze_hall"&&this.progress.stageStep===12&&Math.hypot(1300 - wx,860 - wy)<=82&&Math.hypot(1300 - this.player.x,860 - this.player.y)<=185) {
this._sitAtCauldron();
return;
}

for (const ent of this.scene.entities) {
if (ent.dead) continue;
if (Math.hypot(ent.x - wx,ent.y - wy)<=42) {
const dp=Math.hypot(ent.x - this.player.x,ent.y - this.player.y);
if ((ent.hostile||ent.enslaveActive)&&dp<=105) {this._performAttack();return;}
if (!ent.hostile&& !ent.enslaveActive&&dp<=135) {this._interactWithEntity(ent);return;}
}
}
for (const pr of this.scene.props) {
if (Math.hypot(pr.x - wx,pr.y - wy)<=36&&Math.hypot(pr.x - this.player.x,pr.y - this.player.y)<=120) {
this._interactWithProp(pr);
return;
}
}
this.player.moveTarget={
x:Math.max(100,Math.min(this.scene.width - 100,wx)),
y:Math.max(100,Math.min(this.scene.height - 100,wy))
};
this._spawnRing(wx,wy,"#7ef7c4",22);
});
}
this._screen=scr;
this._canvas=scr.querySelector("#tk-world-canvas");
this._ctx=this._canvas.getContext("2d");
this._miniCanvas=scr.querySelector("#tk-minimap-canvas");
this._miniCtx=this._miniCanvas.getContext("2d");
}

// ==============================================================================
// MOVEMENT LOCK & CINEMATIC LETTERBOX SYSTEM
// ==============================================================================
_isMovementLocked() {
return Boolean(this.movementLockReason||this.dialogueOpen||this.transition||this.cutscene||(this.cinema&&this.cinema.isActive())||(this.progress&&this.progress.isSeatedAtCauldron));
}
_setMovementLock(reasonText,showLetterbox=false) {
this.movementLockReason=reasonText||"Đang Diễn Ra Sự Kiện";
if (this.player) this.player.moveTarget=null;
this._joy.active=false;this._joy.dx=0;this._joy.dy=0;
this._syncLockUI(showLetterbox);
}
_clearMovementLock() {
this.movementLockReason=null;
this._syncLockUI(false);
}
_syncLockUI(showLetterbox=false) {
if (!this._screen) return;
const locked=this._isMovementLocked();
const ctrl=this._screen.querySelector("#tk-controls-overlay");
const banner=this._screen.querySelector("#tk-lock-banner");
const lbTop=this._screen.querySelector("#tk-letterbox-top");
const lbBot=this._screen.querySelector("#tk-letterbox-bot");
if (ctrl) ctrl.classList.toggle("hidden",locked);
if (lbTop) lbTop.classList.toggle("active",Boolean(showLetterbox||this.cutscene));
if (lbBot) lbBot.classList.toggle("active",Boolean(showLetterbox||this.cutscene));
if (banner) {
if (this.movementLockReason&& !this.transition) {
banner.textContent=`🔒 ${this.movementLockReason}`;
banner.classList.remove("hidden");
} else {
banner.classList.add("hidden");
}
}
}
_setTicker(msg) {
if (!this._screen) return;
const el=this._screen.querySelector("#tk-battle-ticker");
if (!el) return;
if (!msg) {el.classList.add("hidden");return;}
el.classList.remove("hidden");
el.innerHTML=msg;
}

// ==============================================================================
// SEPARATE WORLD LOADING & TELEPORTATION CURTAIN
// ==============================================================================
_loadWorldImmediate(worldId,spawnX,spawnY) {
const W=global.ThreeKingsWorlds;
this.scene=W.createWorldData(worldId,this.progress);
const sx=(typeof spawnX==="number")?spawnX :this.scene.meta.defaultSpawn.x;
const sy=(typeof spawnY==="number")?spawnY :this.scene.meta.defaultSpawn.y;
if (!this.resonanceView) {
this.player.x=sx;
this.player.y=sy;
this.player.moveTarget=null;
this.camera.mode="player";
this.camera.x=sx;
this.camera.y=sy;
} else {
this.camera.mode="focus";
this.camera.focusX=sx;this.camera.focusY=sy;
this.camera.x=sx;this.camera.y=sy;
}
this.fx.particles=[];this.fx.floatingTexts=[];this.fx.rings=[];this.fx.shockwaves=[];
const zLbl=this._screen&&this._screen.querySelector("#tk-zone-name");
const mLbl=this._screen&&this._screen.querySelector("#tk-minimap-lbl");
if (zLbl) zLbl.textContent=this.resonanceView?`👁️ Cộng Hưởng Bá Quy: ${this.scene.meta.name}` :this.scene.meta.name;
if (mLbl) mLbl.textContent=this.scene.meta.name;
this._updateQuestHUD();
}
_transitionToWorld(worldId,spawnX,spawnY,onArrived) {
const W=global.ThreeKingsWorlds;
const meta=W.WORLD_META[worldId];
if (!meta|| !this._screen) return;
this.resonanceView=false;
this._playSfx("teleport");
this._setMovementLock("Đang Truyền Tống Sang Thế Giới Khác...",true);
const curtain=this._screen.querySelector("#tk-world-curtain");
const titleEl=this._screen.querySelector("#tk-curtain-title");
const subEl=this._screen.querySelector("#tk-curtain-sub");
const fillEl=this._screen.querySelector("#tk-curtain-fill");
if (titleEl) titleEl.textContent=meta.name;
if (subEl) subEl.textContent=meta.lore;
if (fillEl) fillEl.style.width="0%";
if (curtain) curtain.classList.remove("hidden");
this.transition={worldId,spawnX,spawnY,onArrived,t:0,duration:1.1,swapped:false};
}

// Instant Resonance Switch between Bronze Hall (World 1) and Outer Battlefield (World 6) while seated at the Cauldron!
_switchResonanceView(targetPreset) {
const pr=this.progress;
if (!pr|| !pr.isSeatedAtCauldron) return;
const isMob=document.body&&document.body.classList.contains("mobile-ui");
this._playSfx("talk");
if (targetPreset==="hall") {
this.resonanceView=false;
if (!this.scene||this.scene.id!=="bronze_hall") {
this._loadWorldImmediate("bronze_hall",1300,975);
}
this.player.x=1300;this.player.y=975;this.player.facing="up";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=960;
this.camera.zoom=isMob?0.78 :0.95;
} else {
this.resonanceView=true;
if (!this.scene||this.scene.id!=="outer_battlefield") {
this._loadWorldImmediate("outer_battlefield",1400,1120);
}
if (targetPreset==="righteous") {
this.camera.mode="focus";this.camera.focusX=1320;this.camera.focusY=560;this.camera.zoom=isMob?0.68 :0.82;
} else if (targetPreset==="demon") {
this.camera.mode="focus";this.camera.focusX=2160;this.camera.focusY=960;this.camera.zoom=isMob?0.68 :0.82;
} else {
this.camera.mode="focus";this.camera.focusX=1400;this.camera.focusY=1480;this.camera.zoom=isMob?0.52 :0.64;
}
}
this._renderCauldronPanel();
}
_getTargetWorldForCurrentStep() {
const s=this.progress?this.progress.stageStep :0;
if (s===0||s>=11) return "bronze_hall";
if (s<=3) return "poison_grove";
if (s<=6) return "dog_forest";
if (s<=9) return "bao_wasteland";
if (s===10) return "xin_temple";
return "bronze_hall";
}
_openTeleportMenu() {
if (!this._screen|| !this.progress||this.transition||this.cutscene) return;
if (this.progress.isSeatedAtCauldron) {
this._spawnFloatText(this.player.x,this.player.y - 36,"Đang ngồi chủ trì Đỉnh Đồng — hãy dùng các nút 👁️ Cộng Hưởng Bá Quy phía dưới!","#ffd700");
return;
}
if (this.progress.stageStep===15||this.progress.stageStep===16) {
this._spawnFloatText(this.player.x,this.player.y - 36,"Đang đối đầu sinh tử trong Thanh Đồng Đại Điện — hãy thuyết phục Địa Linh Bá Quy [E]!","#ffd700");
return;
}
if (this.progress.skyMode) {
this._spawnFloatText(window.innerWidth/2,window.innerHeight*0.35,"Đang bay ngược dòng Thiên Bộc Quang Hà — không thể truyền tống lúc này!","#fff2a6");
return;
}
const pr=this.progress;
if (!pr.unlockedWorlds.poison_grove) {
this._spawnFloatText(this.player.x,this.player.y - 36,"Hãy nói chuyện [E] với Địa Linh Bá Quy trước để mở Truyền Tống!","#ffd700");
return;
}
const W=global.ThreeKingsWorlds;
const modal=this._screen.querySelector("#tk-tp-modal");
const list=this._screen.querySelector("#tk-tp-list");
const curId=this.scene?this.scene.id :"bronze_hall";
const tgtId=this._getTargetWorldForCurrentStep();

const order=["bronze_hall","poison_grove","dog_forest","bao_wasteland","xin_temple","outer_battlefield","dang_hun_mountain"];
list.innerHTML=`
<p class="sub-text" style="margin-bottom:8px;">Mỗi khu vực là một <strong>Thế Giới Độc Lập</strong> — khi dịch chuyển, Địa Linh Bá Quy thu hồi cảnh cũ và nạp trọn vẹn thế giới mới:</p>
<div class="action-stack">
${order.map(wid=>{
const m=W.WORLD_META[wid];
const unlocked=Boolean(pr.unlockedWorlds[wid]);
const isHere=wid===curId;
const isTarget=(wid===tgtId&& !isHere&&unlocked);
const statusTag=isHere?"📍 Đang Ở Đây" :(unlocked?(isTarget?"🎯 Mục Tiêu Hiện Tại" :"🔓 Đã Mở Khóa") :"🔒 Chưa Mở Khóa");
return `
<button class="btn-secondary tk-tp-item ${isTarget?"btn-primary" :""}" data-wid="${wid}" ${(!unlocked||isHere)?"disabled" :""} style="text-align:left;display:flex;justify-content:space-between;align-items:center;gap:10px;">
<span><strong>${_esc(m.name)}</strong> <small style="color:${unlocked?m.themeColor :"#8c857b"};">(${statusTag})</small><br><small style="color:#c8c2b6;">${_esc(m.subtitle)}</small></span>
<span style="color:${unlocked?m.themeColor :"#706a62"};font-weight:bold;white-space:nowrap;">${isHere?"Tại Chỗ" :(unlocked?"Nạp Thế Giới →" :"🔒 Khóa")}</span>
</button>`;
}).join("")}
</div>
`;
list.querySelectorAll(".tk-tp-item").forEach(btn=>{
btn.addEventListener("click",()=>{
const wid=btn.getAttribute("data-wid");
modal.classList.add("hidden");
if (wid&&wid!==curId&&pr.unlockedWorlds[wid]) {
const spx=(wid==="bronze_hall"&&pr.stageStep===11)?1300 :null;
const spy=(wid==="bronze_hall"&&pr.stageStep===11)?1470 :null;
this._transitionToWorld(wid,spx,spy,()=>{
this._spawnBurst(this.player.x,this.player.y,W.WORLD_META[wid].themeColor,30);
this._spawnFloatText(this.player.x,this.player.y - 36,`🐢 Đã Nạp Thế Giới: ${W.WORLD_META[wid].name}`,"#7ef7f0");
});
}
});
});
modal.classList.remove("hidden");
}

// ==============================================================================
// PART 3: CAULDRON PANEL, DELIBERATE DELAY, LIVE REFINEMENT & RESONANCE CUTSCENES
// ==============================================================================
}
ThreeKingsStory._shared={_esc,IMMORTAL_POEM_LINES,SECOND_APERTURE_STEPS};
global.ThreeKingsStory=ThreeKingsStory;
})(window);
