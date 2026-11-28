(function (global) {
"use strict";
const {_esc,IMMORTAL_POEM_LINES,SECOND_APERTURE_STEPS}=global.ThreeKingsStory._shared;
Object.assign(global.ThreeKingsStory.prototype, {
_startAwakeningIntroCutscene() {
this._playSfx("cicada");
this._setMovementLock("Cắt Cảnh: Xuân Thu Thiền Trùng Sinh",true);
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=910;
this.fx.flashAlpha=0.75;
this._spawnRing(1300,1010,"#ffd700",130);this._spawnBurst(1300,1010,"#7ef7c4",36);
this.cutscene={
type:"awakening",t:0,duration:1.35,
onDone:()=>{
this.cutscene=null;
this._openDialogue(
"🦗 Trùng Sinh Trở Lại — Thanh Đồng Đại Điện",
"Cắt Cảnh Khởi Màn (Khóa Di Chuyển)",
"Ánh sáng quang âm tan dần. Ngươi mở mắt đứng giữa <strong>Thanh Đồng Đại Điện</strong> rộng lớn, ngay trước <strong>Cửu Long Thanh Đồng Đỉnh</strong> đang tỏa khói xanh ngát. Kiếp trước vì cổ độc Bích Không nên giết Long Thanh Thiên mà không lấy được chiến lợi phẩm; kiếp này có <strong>Địa Linh Bá Quy</strong> áp chế cổ trùng, ngươi tuyệt đối không thể bỏ lỡ!<br><br>Hãy đi tới nói chuyện <strong>[E]</strong> với <strong>Địa Linh Bá Quy</strong> ngay cạnh Đỉnh Đồng để bắt đầu kế hoạch truyền tống!",
[{label:"🏯 Đứng Dậy — Mở Tự Do Di Chuyển",primary:true,onClick:()=>{this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}]
);
}
};
},
_startLongThanhThienEncounterCutscene(ltt) {
ltt.introPlayed=true;
this._playSfx("warning");
this._setMovementLock("Cắt Cảnh: Chạm Trán Long Thanh Thiên",true);
this.camera.mode="focus";this.camera.focusX=ltt.x;this.camera.focusY=ltt.y + 30;
ltt.bubble="Ồ?! Tiểu Thú Vương?! Sao ngươi đột nhiên xuất hiện trong Đình Độc Trúc của ta?!";
ltt.bubbleTimer=4.5;
this.cutscene={
type:"ltt_intro",t:0,duration:1.1,
onDone:()=>{
this.cutscene=null;
this._openDialogue(
"🎋 Ngũ Chuyển Độc Đạo — Long Thanh Thiên",
"Đình Độc Trúc Bát Giác (Khóa Di Chuyển)",
"<strong>Long Thanh Thiên</strong> kinh hãi lùi bước dưới mái ngói xanh của Đình Độc Trúc Bát Giác, tay siết chặt đoạn trúc xanh thẫm bóng loáng như ngọc:<br><br><em>\"Khốn kiếp! Toàn bộ cổ trùng của ta đều bị Phúc Địa áp chế! Đợi ta cưỡng ép giải ấn độc Bích Không, ngươi sẽ hóa thành ánh sáng xanh tiêu tán ngay tại đây!\"</em><br><br><span style='color:#7ef7c4;'>👉 Đánh Lực Đạo <strong>[J]</strong> vừa gây sát thương vừa gián đoạn tiến độ giải ấn Cổ Bích Không! Dùng Xung Phong <strong>[K]</strong> né sóng chướng khí độc!</span>",
[{label:"👊 Ra Tay Ngay — Kết Liễu Long Thanh Thiên!",primary:true,onClick:()=>{ltt.activeCombat=true;this.progress.stageStep=2;this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}]
);
}
};
},
_startApertureDevourCutscene(type) {
this._playSfx("absorb");
const isLTT=(type==="long_thanh_thien");
this._setMovementLock(isLTT?"Nghi Thức: Thu Cổ Bích Không & Nuốt Không Khiếu" :"Nghi Thức: Thu Cổ Nô Lệ 5C & Nuốt Không Khiếu",true);
this.camera.mode="focus";this.camera.focusX=this.player.x;this.camera.focusY=this.player.y;
this._spawnRing(this.player.x,this.player.y,isLTT?"#38e8a8" :"#ffd700",115);
this.cutscene={
type:"devour_aperture",t:0,duration:1.65,
onDone:()=>{
this.cutscene=null;
if (isLTT) {
this.progress.hasBichKhong=true;this.progress.unlockedWorlds.dog_forest=true;this.progress.stageStep=4;
this._awardPart1Rewards();
this._openDialogue(
"🎋 Đoạt Cổ Bích Không Ngũ Chuyển & Nuốt Sạch Không Khiếu!",
"Mở Khóa Thế Giới 3: Rừng Đá Khuyển Vương",
"Ngươi cất kỹ <strong>🎋 Cổ Bích Không (Ngũ Chuyển)</strong> — đoạn trúc xanh thẫm cỡ bàn tay, giữa không thông, trơn bóng như ngọc! Đồng thời nuốt sạch Không Khiếu của Long Thanh Thiên.<br><br><em>\"Bá Quy, mau truyền tống ta đến chỗ Ngự Thú Đại Sư Chương Tam Tam trong Rừng Đá Khuyển Vương!\"</em>",
[
{label:"🐢 Truyền Tống Ngay Sang Thế Giới 3: Rừng Đá Khuyển Vương",primary:true,onClick:()=>{
this._clearMovementLock();
this._transitionToWorld("dog_forest",1300,1830,()=>{
this._spawnBurst(1300,1830,"#5aa9e6",34);
this._spawnFloatText(1300,1790,"🔵 Đã Tới Rừng Đá Khuyển Vương! Tiến Lên Đấu Trường Phía Bắc!","#85c1e9");
});
}},
{label:"🗺️ Ở Lại Độc Mù Trúc Lâm",primary:false,onClick:()=>{this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}
]
);
} else {
this.progress.hasNoLeGu=true;this.progress.unlockedWorlds.bao_wasteland=true;this.progress.stageStep=7;
this._openDialogue(
"⛓️ Đoạt Cổ Nô Lệ Ngũ Chuyển & Tăng Tư Chất Cổ Cuống Rốn Thú Lực!",
"Mở Khóa Thế Giới 4: Hoang Nguyên Bạo Vương",
"Giết người đoạt cổ, xe nhẹ đường quen! Ngươi nuốt sạch Không Khiếu của <strong>Chương Tam Tam</strong> khiến tư chất <strong>Cổ Cuống Rốn Thú Lực</strong> tăng thêm nhất đẳng và thu lấy <strong>⛓️ Cổ Nô Lệ Ngũ Chuyển</strong>!<br><br>Mục tiêu tiếp theo nắm bí mật <em>Sinh Tử Môn</em> chính là <strong>Quỷ Sát Nhân Y Cừu Cửu</strong> đang ở <strong>Hoang Nguyên Bạo Vương</strong>!",
[
{label:"🐢 Truyền Tống Ngay Sang Thế Giới 4: Hoang Nguyên Bạo Vương!",primary:true,onClick:()=>{
this._clearMovementLock();
this._transitionToWorld("bao_wasteland",1300,1830,()=>{
this._spawnBurst(1300,1830,"#ff5733",34);
this._spawnFloatText(1300,1790,"🔴 Đã Tới Hoang Nguyên Bạo Vương! Vượt Cầu Hắc Diện Thạch Lên Đài Hỏa Trì!","#ff8a65");
});
}},
{label:"🗺️ Ở Lại Rừng Đá Khuyển Vương",primary:false,onClick:()=>{this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}
]
);
}
}
};
},
_startChuongTamTamEncounterCutscene(ctt) {
ctt.introPlayed=true;this._playSfx("warning");
this._setMovementLock("Cắt Cảnh: Chạm Trán Ngự Thú Đại Sư Chương Tam Tam",true);
this.camera.mode="focus";this.camera.focusX=ctt.x;this.camera.focusY=ctt.y + 30;
ctt.bubble="Á!! Tiểu Thú Vương?! Ngươi từ đâu chui ra thế này?!";ctt.bubbleTimer=4.0;
this.cutscene={
type:"ctt_intro",t:0,duration:1.05,
onDone:()=>{
this.cutscene=null;
this._openDialogue(
"⛓️ Tứ Chuyển Ngự Thú Đại Sư — Chương Tam Tam",
"Đấu Trường Thạch Trụ Khuyển Vương (Khóa Di Chuyển)",
"<strong>Chương Tam Tam</strong> hoảng loạn phát hiện cổ trùng bị Phúc Địa áp chế, vội quay đầu luồn lách qua mê cung cột đá bỏ chạy và thả <strong>Khuyển Cốt Phù Văn</strong> cản đường!<br><br><span style='color:#85c1e9;'>👉 Dùng <strong>Xung Phong [K]</strong> áp sát & <strong>Lực Đạo [J]</strong> đánh gục Chương Tam Tam để đoạt <strong>Cổ Nô Lệ Ngũ Chuyển</strong>!</span>",
[{label:"👊 Truy Sát Chương Tam Tam!",primary:true,onClick:()=>{ctt.activeCombat=true;this.progress.stageStep=5;this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}]
);
}
};
},
_startCuuCuuEncounterCutscene(cuu) {
cuu.introPlayed=true;this._playSfx("enslave");
this._setMovementLock("Cắt Cảnh: Phóng Cổ Nô Lệ Lên Quỷ Sát Nhân Y Cừu Cửu",true);
this.camera.mode="focus";this.camera.focusX=cuu.x;this.camera.focusY=cuu.y + 20;
this._spawnRing(cuu.x,cuu.y,"#ffd700",95);this._spawnBurst(cuu.x,cuu.y,"#ffd700",36);
cuu.bubble="Ồ, Tiểu Thú Vương?! Cái gì — Cổ Nô Lệ Ngũ Chuyển?!";cuu.bubbleTimer=4.5;
this.cutscene={
type:"cuu_intro",t:0,duration:1.3,
onDone:()=>{
this.cutscene=null;
this._openDialogue(
"⛓️ Quỷ Sát Nhân Y — Cừu Cửu",
"Đài Hỏa Trì Bạo Vương (Khóa Di Chuyển)",
"<strong>Cổ Nô Lệ Ngũ Chuyển</strong> hóa thành luồng <strong>Quang Ảnh Màu Vàng</strong> rơi xuống người <strong>Cừu Cửu</strong>! Cừu Cửu cười lạnh: <em>\"Sĩ khả sát bất khả nhục! Nội tình hồn phách của ngươi còn non lắm, muốn vượt cấp nô lệ lão quái trăm năm như ta quả thật si tâm vọng tưởng!\"</em><br><br><span style='color:#ffd700;'>👉 Đuổi theo tung <strong>Lực Đạo [J]</strong> đấm đạp làm Cừu Cửu bầm mặt phân tâm đẩy <strong>Quang Ảnh Vàng ≥ 75%</strong>, rồi bấm <strong>[K]</strong> gọi tên thật của lão!</span>",
[{label:"👊 Bốp Bốp Bốp! Đấm Đạp Làm Cừu Cửu Phân Tâm!",primary:true,onClick:()=>{cuu.enslaveActive=true;cuu.soulProgress=26;cuu.bruisedLevel=0;this.progress.stageStep=8;this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}]
);
}
};
},
_startCuuCuuMentalBreakCutscene(cuu) {
this._playSfx("victory");
this._setMovementLock("Cắt Cảnh: Đòn Tâm Lý Chí Mạng — Thu Phục Cừu Cửu!",true);
this.camera.mode="focus";this.camera.focusX=cuu.x;this.camera.focusY=cuu.y;
cuu.enslaveActive=false;cuu.enslaved=true;cuu.soulProgress=100;
this.progress.cuuCuuEnslaved=true;this.progress.stageStep=9;
this.fx.flashAlpha=0.7;this.fx.shake=10;
this._spawnBurst(cuu.x,cuu.y,"#ffd700",55);this._spawnRing(cuu.x,cuu.y,"#7ef7c4",130);
cuu.bubble="Ngươi... tại sao ngươi biết?! — Thuộc hạ bái kiến chủ nhân!";cuu.bubbleTimer=5.0;
this.cutscene={
type:"cuu_break",t:0,duration:1.35,
onDone:()=>{
this.cutscene=null;
this._openDialogue(
"🗣️ \"Tăng A Ngưu! Trần Cửu Đang Sống Rất Tốt Với Thương Yến Phi Đấy!\"",
"Tinh Thần Cừu Cửu Thất Thủ Hoàn Toàn (Khóa Di Chuyển)",
"Nghe thấy tên thật và nỗi đau sâu nhất, tinh thần Cừu Cửu lập tức thất thủ! Quang ảnh vàng dung nhập hoàn toàn! Cừu Cửu quỳ rạp: <strong>\"Thuộc hạ bái kiến chủ nhân!\"</strong><br><br>Hãy lại gần nhấn <strong>[E]</strong> tra hỏi Cừu Cửu về bí mật <strong>Cổ Thề Độc</strong> của Tố Thủ Y Sư!",
[{label:"💬 Mở Di Chuyển — Tra Hỏi Cừu Cửu [E]",primary:true,onClick:()=>{this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}]
);
}
};
},
_startXinTempleBreakCutscene(cuu) {
this._playSfx("shatter");
this._setMovementLock("Cắt Cảnh: Cừu Cửu Bạo Lực Phá Quan Cổ Tự Tín Vương!",true);
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=730;
cuu.x=1300;cuu.y=845;cuu.facing="up";
cuu.bubble="Phúc Địa suy yếu rồi! Xem lão phu dùng sức Ngũ Chuyển phá nát cửa ải Tín Vương!!";cuu.bubbleTimer=4.5;
this.fx.shake=14;
this.cutscene={
type:"xin_break",t:0,duration:2.2,extinguished:false,
onDone:()=>{
this.cutscene=null;
this.progress.hasTramTran=true;
this.progress.stageStep=11;
this._awardPart2Rewards();
this._openDialogue(
"🪨 Nhận Cổ Trăm Trận Trăm Thắng — Tiến Vào Phần 3 (Ngày 24 Tháng 10)!",
"Chính Điện Cổ Tự Tín Vương",
"<strong>ẦM!!</strong> Cừu Cửu bạo lực phá quan làm tắt <strong>Cột Sáng Vàng Tín Vương</strong> rồi quỳ rạp hai tay dâng lên cục đá tròn màu xám xấu xí — <strong>🪨 Cổ Trăm Trận Trăm Thắng</strong>!<br><br>Ngươi cất kỹ bảo vật, căn dặn Cừu Cửu đi bố trí <strong>ám kỳ</strong> kéo chậm chân Ma Vô Thiên ở vòng ngoài! Rốt cuộc <strong>ngày 24 tháng 10</strong> đã tới — <strong>Bạch Ngưng Băng</strong> đã dẫn gần 10 vạn khuyển thú về trước Cổng Tam Quan <strong>Thanh Đồng Đại Điện</strong>!",
[
{label:"🐢 Truyền Tống Ngay Về Thanh Đồng Đại Điện Gặp Bạch Ngưng Băng (Phần 3)",primary:true,onClick:()=>{
this._clearMovementLock();
this._transitionToWorld("bronze_hall",1300,1470,()=>{
this._spawnBurst(1300,1470,"#ffd700",34);
this._spawnFloatText(1300,1430,"🔥 Phần 3: Nói Chuyện Với Bạch Ngưng Băng Trước Cổng Điện [E]!","#ffd700");
});
}},
{label:"🗺️ Ở Lại Tham Quan Cổ Tự Tín Vương",primary:false,onClick:()=>{this.camera.mode="player";this._clearMovementLock();this._updateQuestHUD();}}
]
);
}
};
},
_awardPart1Rewards() {
if (!this.progress||this.progress.part1Rewarded|| !this.game) return;
this.progress.part1Rewarded=true;const g=this.game;const key="story_tam_vuong_p1";
const prev=g.stageClears[key]||0;g.stageClears[key]=prev + 1;
if (prev===0) {
g.player.primevalStones +=80;g.aperture.humanQi +=35;
if (g.guSystem) g.guSystem.refinementExp=(g.guSystem.refinementExp||0) + 50;
if (g.ui) g.ui.addLog("🎋 [Tam Vương Truyền Thừa — Phần 1 Hoàn Thành] Đã đoạt Cổ Bích Không Ngũ Chuyển (+80💎, +35 Nhân Khí, +50 EXP Luyện Cổ)!","loot");
g.autoSaveNow("tk_part1_clear");
}
},
_awardPart2Rewards() {
if (!this.progress||this.progress.part2Rewarded|| !this.game) return;
this.progress.part2Rewarded=true;const g=this.game;const key="story_tam_vuong_p2";
const prev=g.stageClears[key]||0;g.stageClears[key]=prev + 1;
if (prev===0) {
g.player.primevalStones +=120;g.aperture.humanQi +=55;
if (g.guSystem) g.guSystem.refinementExp=(g.guSystem.refinementExp||0) + 80;
if (g.ui) g.ui.addLog("🪨 [Tam Vương Truyền Thừa — Phần 2 Hoàn Thành] Đã thu phục Cừu Cửu & đoạt Cổ Trăm Trận Trăm Thắng (+120💎, +55 Nhân Khí, +80 EXP Luyện Cổ)!","loot");
g.autoSaveNow("tk_part2_clear");
}
}

// ==============================================================================
// DIALOGUE, EVENTS, COMBAT & INTERACTIONS
// ==============================================================================
});
})(window);
