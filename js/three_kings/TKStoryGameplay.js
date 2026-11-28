(function (global) {
"use strict";
const {_esc,IMMORTAL_POEM_LINES,SECOND_APERTURE_STEPS}=global.ThreeKingsStory._shared;
Object.assign(global.ThreeKingsStory.prototype, {
_openDialogue(speaker,role,text,choices) {
if (!this._screen) return;
this._playSfx("talk");this.dialogueOpen=true;
if (this.player) this.player.moveTarget=null;
const box=this._screen.querySelector("#tk-dialogue-box");
box.querySelector("#tk-dlg-speaker").textContent=speaker;
box.querySelector("#tk-dlg-role").textContent=role;
box.querySelector("#tk-dlg-text").innerHTML=text;
const chWrap=box.querySelector("#tk-dlg-choices");chWrap.innerHTML="";
choices.forEach(c=>{
const btn=document.createElement("button");
btn.className=c.primary?"btn-primary" :"btn-secondary";
btn.innerHTML=c.label;
btn.addEventListener("click",()=>{this._closeDialogue();if (typeof c.onClick==="function") c.onClick();});
chWrap.appendChild(btn);
});
box.classList.remove("hidden");
this._syncLockUI(false);
},
_closeDialogue() {
if (!this._screen) return;
this.dialogueOpen=false;
this._screen.querySelector("#tk-dialogue-box").classList.add("hidden");
this._syncLockUI(false);
},
_bindEvents() {
this._keys={};
this._keydownFn=(e)=>{
const _st=global.vanCoSettings;
if (_st&&(_st.isListeningKey()||_st.isOpen())) return;
if (global.vanCoQuickBag&&global.vanCoQuickBag.isOpen()) return;
const code=e.code;this._keys[code]=true;
const isK=(act,def)=>_st?_st.isActionKey(act,code) :(code===def);
if (this.cinema&&this.cinema.isActive()) {
if (code==="Escape") {e.preventDefault();this.cinema.stop(true);}
return;
}
if (!this.scene) return;
if (this.dialogueOpen) {if (code==="Escape") this._closeDialogue();return;}
if (this.progress&&this.progress.isSeatedAtCauldron&&this.progress.stageStep===14&& !this.cutscene) {
if (code==="Digit1") this._switchResonanceView("hall");
else if (code==="Digit2") this._switchResonanceView("righteous");
else if (code==="Digit3") this._switchResonanceView("demon");
else if (code==="Digit4") this._switchResonanceView("frontline");
return;
}
if (this.progress&&this.progress.teleportCinema) return;
if (this.progress&&this.progress.skyMode&& !this.transition&& !this.cutscene) {
if (this.progress.stageStep===18) {
if (this.progress.part5SubStep===2&&(isK("tkAttack","KeyJ")||code==="Space")) {e.preventDefault();this._reciteNextPoemLine();}
return;
}
if (isK("tkAttack","KeyJ")||code==="Space") {e.preventDefault();this._triggerSkyAction();}
else if (isK("tkSpecial","KeyK")) {e.preventDefault();this._triggerSkyKimHaBoost();}
return;
}
if (this.progress&&this.progress.stageStep===15&& !this.transition&& !this.cutscene&&(isK("tkSpecial","KeyK")||isK("tkAttack","KeyJ")||code==="Space")) {
e.preventDefault();
this._fireYangGuExpose();
return;
}
if (this._isMovementLocked()) return;
if (isK("jump","Space")) {e.preventDefault();this._performJump();return;}
if (isK("tkAttack","KeyJ")) {e.preventDefault();this._performAttack();}
else if (isK("tkSpecial","KeyK")) {e.preventDefault();this._performSpecial();}
else if (isK("interact","KeyE")) {e.preventDefault();this._performInteract();}
else if (isK("tkTeleport","KeyT")) {e.preventDefault();this._openTeleportMenu();}
};
this._keyupFn=(e)=>{this._keys[e.code]=false;};
this._resizeFn=()=>this._handleResize();
window.addEventListener("keydown",this._keydownFn);
window.addEventListener("keyup",this._keyupFn);
window.addEventListener("resize",this._resizeFn);
},
_unbindEvents() {
if (this._keydownFn) window.removeEventListener("keydown",this._keydownFn);
if (this._keyupFn) window.removeEventListener("keyup",this._keyupFn);
if (this._resizeFn) window.removeEventListener("resize",this._resizeFn);
this._keys={};
},
_handleResize() {
if (!this._canvas|| !this._screen) return;
const isMobDpr=document.body&&document.body.classList.contains("mobile-ui");
const dpr=isMobDpr?1 :Math.min(1.5,window.devicePixelRatio||1);
const w=window.innerWidth;const h=window.innerHeight;
this._canvas.width=Math.round(w*dpr);this._canvas.height=Math.round(h*dpr);
this._canvas.style.width=`${w}px`;this._canvas.style.height=`${h}px`;
if (this._ctx) this._ctx.setTransform(dpr,0,0,dpr,0,0);
},
_spawnBurst(x,y,color,count=18) {
if (!this.fx) return;
for (let i=0;i<count;i++) {
const a=Math.random()*Math.PI*2;const s=45 + Math.random()*165;
this.fx.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,size:2 + Math.random()*3.5,color,life:0.35 + Math.random()*0.4,maxLife:0.75});
}
},
_spawnFloatText(x,y,text,color="#ffd700") {if (this.fx) this.fx.floatingTexts.push({x,y,text,color,life:1.45,maxLife:1.45});},
_spawnRing(x,y,color,maxR=48) {if (this.fx) this.fx.rings.push({x,y,r:6,maxR,color,life:0.42,maxLife:0.42});},
_performJump() {
if (!this.scene|| !this.player||this._isMovementLocked()) return;
const p=this.player;
if ((p.jumpCount||0)>=(p.maxJumps||2)) return;
const isAir=(p.jumpCount>=1||p.z>4);
p.vz=isAir?310 :350;
p.z=Math.max(p.z||0,2);
p.jumpCount=(p.jumpCount||0) + 1;
p.isJumping=true;
this._playSfx("dash");
this._spawnRing(p.x,p.y - (isAir?p.z :0) + 10,isAir?"#7ef7c4" :"#ffd700",isAir?34 :26);
},
_performAttack() {
if (this.progress&&this.progress.skyMode&& !this.dialogueOpen&& !this.transition&& !this.cutscene) {this._triggerSkyAction();return;}
if (this.progress&&this.progress.stageStep===15&& !this.dialogueOpen) {this._fireYangGuExpose();return;}
if (!this.scene|| !this.player||this._isMovementLocked()) return;
const p=this.player;if (p.attackCd>0) return;
p.attackCd=0.34;p.attackAnim=0.22;this._playSfx("punch");
this._spawnRing(p.x + Math.cos(p.aimAngle)*44,p.y + Math.sin(p.aimAngle)*44,"#ffd700",38);

for (const ent of this.scene.entities) {
if (ent.dead) continue;
if (Math.hypot(ent.x - p.x,ent.y - p.y)>102) continue;
if (ent.id==="long_thanh_thien"&&ent.activeCombat) {
ent.hp=Math.max(0,ent.hp - 24);ent.poisonCharge=Math.max(0,ent.poisonCharge - 10);
const ang=Math.atan2(ent.y - p.y,ent.x - p.x);
ent.x=Math.max(1155,Math.min(1445,ent.x + Math.cos(ang)*22));ent.y=Math.max(495,Math.min(685,ent.y + Math.sin(ang)*22));
this.fx.shake=7;this._spawnBurst(ent.x,ent.y,"#38e8a8",16);this._spawnFloatText(ent.x,ent.y - 32,"-24 Lực Đạo! (-10% Giải Ấn)","#ffd700");
if (ent.hp<=0) {
ent.dead=true;this.progress.longThanhThienDead=true;this.progress.stageStep=3;this._playSfx("victory");
this.scene.loots.push({id:"bich_khong_gu",name:"Cổ Bích Không (Ngũ Chuyển)",icon:"🎋",x:ent.x,y:ent.y,color:"#38e8a8"});
this._spawnBurst(ent.x,ent.y,"#38e8a8",44);this._updateQuestHUD();
}
return;
}
if (ent.id==="chuong_tam_tam"&&ent.activeCombat) {
ent.hp=Math.max(0,ent.hp - 28);
const ang=Math.atan2(ent.y - p.y,ent.x - p.x);
ent.x=Math.max(760,Math.min(1840,ent.x + Math.cos(ang)*32));ent.y=Math.max(440,Math.min(1560,ent.y + Math.sin(ang)*32));
this.fx.shake=7;this._spawnBurst(ent.x,ent.y,"#5aa9e6",18);this._spawnFloatText(ent.x,ent.y - 32,"-28 Toàn Lực Dĩ Phó!","#ffd700");
if (ent.hp<=0) {
ent.dead=true;this.progress.chuongTamTamDead=true;this.progress.stageStep=6;this._playSfx("victory");
this.scene.loots.push({id:"no_le_gu",name:"Cổ Nô Lệ Ngũ Chuyển",icon:"⛓️",x:ent.x,y:ent.y,color:"#ffd700"});
this._spawnBurst(ent.x,ent.y,"#ffd700",44);this._updateQuestHUD();
}
return;
}
if (ent.id==="cuu_cuu"&&ent.enslaveActive) {
const ang=Math.atan2(ent.y - p.y,ent.x - p.x);
ent.x=Math.max(1080,Math.min(1520,ent.x + Math.cos(ang)*46));ent.y=Math.max(460,Math.min(760,ent.y + Math.sin(ang)*46));
ent.bruisedLevel=Math.min(5,ent.bruisedLevel + 1);ent.soulProgress=Math.min(88,ent.soulProgress + 14);
this.fx.shake=8;this._spawnBurst(ent.x,ent.y,"#ffd700",20);this._spawnFloatText(ent.x,ent.y - 34,"BỐP! +14% Quang Ảnh Vàng!","#ffd700");
const cries=["Dừng tay, ngươi dám đánh ta?!","Ngươi lại đạp vào mặt của ta, ta nổi nóng rồi đấy!","Mẹ nó, ngươi còn đạp, ta liều mạng với ngươi!","Đừng đánh nữa, đừng đánh nữa... Không, không thích...","Á! Quang ảnh vàng bám chặt trên trán ta rồi!"];
ent.bubble=cries[Math.min(cries.length - 1,ent.bruisedLevel - 1)];ent.bubbleTimer=2.5;
this._updateQuestHUD();
return;
}
}
},
_performSpecial() {
if (this.progress&&this.progress.skyMode&& !this.dialogueOpen&& !this.transition&& !this.cutscene) {this._triggerSkyKimHaBoost();return;}
if (this.progress&&this.progress.stageStep===15&& !this.dialogueOpen) {this._fireYangGuExpose();return;}
if (!this.scene|| !this.player||this._isMovementLocked()) return;
const p=this.player;
if (this.scene.id==="bao_wasteland"&&this.progress.stageStep===8) {
const cuu=this.scene.entities.find(e=>e.id==="cuu_cuu"&&e.enslaveActive);
if (cuu&&cuu.soulProgress>=75) {
if (Math.hypot(cuu.x - p.x,cuu.y - p.y)<=250) {this._startCuuCuuMentalBreakCutscene(cuu);return;}
else this._spawnFloatText(p.x,p.y - 34,"Tiến gần Cừu Cửu để tung đòn tâm lý!","#ffd700");
}
}
if (p.dashCd>0) return;
p.dashCd=1.35;p.dashTimer=0.22;p.dashVx=Math.cos(p.aimAngle)*700;p.dashVy=Math.sin(p.aimAngle)*700;
this._playSfx("dash");this._spawnBurst(p.x,p.y,"#f7c948",14);
},
_performInteract() {
if (!this.scene|| !this.player||this._isMovementLocked()) return;
const p=this.player;
for (let i=this.scene.loots.length - 1;i>=0;i--) {
if (Math.hypot(this.scene.loots[i].x - p.x,this.scene.loots[i].y - p.y)<=92) {this._pickupLoot(this.scene.loots[i],i);return;}
}
if (this.scene.id==="bronze_hall"&&this.progress.stageStep===12&&Math.hypot(1300 - p.x,860 - p.y)<=185) {
this._sitAtCauldron();
return;
}
let bestEnt=null;let bestD=135;
for (const ent of this.scene.entities) {if (!ent.dead) {const d=Math.hypot(ent.x - p.x,ent.y - p.y);if (d<bestD) {bestD=d;bestEnt=ent;}}}
if (bestEnt) {this._interactWithEntity(bestEnt);return;}
let bestProp=null;let bestPD=115;
for (const pr of this.scene.props) {const d=Math.hypot(pr.x - p.x,pr.y - p.y);if (d<bestPD) {bestPD=d;bestProp=pr;}}
if (bestProp) {this._interactWithProp(bestProp);return;}
this._spawnFloatText(p.x,p.y - 30,"Không có nhân vật hay công trình tương tác nào ở gần!","#c8c2b6");
},
_pickupLoot(lt,idx) {
this._playSfx("loot");this.scene.loots.splice(idx,1);this._spawnBurst(lt.x,lt.y,lt.color,32);
if (lt.id==="bich_khong_gu") this._startApertureDevourCutscene("long_thanh_thien");
else if (lt.id==="no_le_gu") this._startApertureDevourCutscene("chuong_tam_tam");
},
_interactWithProp(pr) {
this._openDialogue(pr.title||pr.label,"Khảo Cổ Tam Vương Phúc Địa",pr.text,[{label:"Đóng",primary:true}]);
},
_interactWithEntity(ent) {
if (ent.id==="ba_quy") {
if (!this.progress.unlockedWorlds.poison_grove) {
this._openDialogue(
"🐢 Địa Linh Bá Quy",
"Địa Linh Tam Vương Phúc Địa",
"\"Chàng thanh niên, hiện tại sức mạnh Phúc Địa của ta vẫn đang áp chế toàn bộ phàm cổ của những cổ sư xông vào. Long Thanh Thiên đang ẩn thân trong <strong>Thế Giới Độc Mù Trúc Lâm</strong> — ngươi có muốn ta truyền tống sang đó ngay không?\"",
[
{label:"🎋 \"Bá Quy, truyền tống ta sang Thế Giới Độc Mù Trúc Lâm ngay!\"",primary:true,onClick:()=>{
this.progress.unlockedWorlds.poison_grove=true;this.progress.stageStep=1;
this._transitionToWorld("poison_grove",1300,1760,()=>{
this._spawnBurst(1300,1760,"#38e8a8",32);this._spawnFloatText(1300,1720,"🎋 Đã Tới Độc Mù Trúc Lâm! Tiến Về Đình Độc Trúc Phía Bắc!","#7ef7c4");
});
}},
{label:"🏯 \"Mở quyền Truyền Tống [T] trước, ta muốn tham quan thêm Thanh Đồng Đại Điện\"",primary:false,onClick:()=>{this.progress.unlockedWorlds.poison_grove=true;this.progress.stageStep=1;this._updateQuestHUD();}}
]
);
} else if (this.progress.stageStep===16) {
this._startBaGuiPersuasionDialogue();
} else {
this._openTeleportMenu();
}
return;
}

if (this.progress.stageStep===16&&ent.id==="thiet_nhuoc_nam") {
this._openDialogue(
"⛓️ Thiết Nhược Nam",
"Đối Đầu Trong Thanh Đồng Đại Điện",
"<strong>Thiết Nhược Nam chỉ tay quát lớn:</strong> \"Phương Nguyên! Đàn chó bên ngoài không cản nổi quần hùng đâu. Không bao lâu nữa Tiêu Mang, Cừu Cửu, Ma Vô Thiên, Dịch Hỏa, Dực Trùng đều xông vào đây! Đường ra duy nhất của ngươi chính là đầu hàng gia nhập Thiết gia, nộp Tiên Cổ và vào Tháp Trấn Ma cải tạo!\"<br><br><strong>Ngươi cười ha hả, thản nhiên giơ cẳng tay trái lên:</strong> <em>\"Ngươi chỉ Cổ Định Tinh sao? Nếu ta chặt đứt cánh tay trái này của mình thì thế nào?\"</em><br><br>Bốn vị Trưởng Lão Thiết Gia lập tức chau mày — với tâm tính tàn nhẫn của Phương Nguyên, chặt một cánh tay chẳng đáng kể chút nào!",
[{label:"🐢 Quay Sang Truyền Âm Thuyết Phục Địa Linh Bá Quy [E]",primary:true}]
);
return;
}

if (ent.id==="bach_ngung_bang"&&this.progress.stageStep===11) {
this._openDialogue(
"❄️ Bạch Ngưng Băng",
"Trước Cổng Tam Quan Thanh Đồng Đại Điện (Gần 10 Vạn Khuyển Thú)",
"<strong>Ngươi thản nhiên cười:</strong> \"Bạch Ngưng Băng, mau đưa cổ trùng chỉ huy đàn chó trong tay ngươi cho địa linh Bá Quy đi!\"<br><br><strong>Bạch Ngưng Băng kinh hãi:</strong> \"Cái gì?! Không phải do ta chỉ huy đàn chó này sao?\"<br><br><strong>Địa Linh Bá Quy lo lắng hiện ra:</strong> \"Chàng thanh niên, ta đã điều động tiên nguyên phụ trợ ngươi luyện cổ, giờ phân tâm chỉ huy đàn chó chỉ sợ không đủ lực!\"<br><br><strong>Ngươi tự tin đáp:</strong> \"Không sao! Bên trong quần địch ta đã có quân cờ (Cừu Cửu), lại có đủ nguyên thạch cho ngươi khống chế đàn chó. Còn ngươi, Bạch Ngưng Băng, đi theo ta vào trong điện — lúc ta luyện cổ cần người đáng tin cậy ở bên phòng vệ!\"",
[
{label:"🏯 Tước Quyền Chỉ Huy Giao Bá Quy → Dẫn Bạch Ngưng Băng Vào Trong Điện & Mở Thế Giới 6!",primary:true,onClick:()=>{
this._playSfx("loot");
this.progress.bnbStripped=true;
this.progress.unlockedWorlds.outer_battlefield=true;
this.progress.stageStep=12;
ent.x=1300;ent.y=1115;ent.facing="up";
ent.bubble="Hừ, tùy ngươi vậy... (Hắn bảo ta vào điện, hẳn vẫn còn tin tưởng ta!)";ent.bubbleTimer=4.5;
if (this.scene) this.scene.cauldronPrompt="[E] Ngồi Xếp Bằng Trước Đỉnh Đồng";
this._spawnFloatText(1300,1040,"🔥 Đã tước quyền 10 vạn khuyển thú & mở Thế Giới 6 (Chiến Trường Ngoại Vi)!","#ffd700");
this._updateQuestHUD();
}}
]
);
return;
}

if (ent.id==="cuu_cuu") {
if (this.scene.id==="bao_wasteland"&&this.progress.stageStep===9&&ent.enslaved) {
this._openDialogue(
"🙇 Quỷ Sát Nhân Y — Cừu Cửu",
"Thuộc Hạ Ngũ Chuyển (Đang Quỳ Rạp)",
"<strong>Ngươi nheo mắt hỏi:</strong> \"Cừu Cửu, năm đó ngươi từng dùng Cổ Thề Độc với Tố Thủ Y Sư Trần Cửu. Ngươi có biết ả ta đã làm cách nào thoát khỏi sự trói buộc của thề độc không?\"<br><br><strong>Cừu Cửu mặt mũi sưng vù đáp:</strong> \"Trần Cửu không có khả năng hóa giải thề độc! Ả ta vì tên tiểu bạch kiểm Thương Yến Phi mà liều mạng để thề độc phát tác giết chết chính mình, sau đó dùng thủ đoạn trị liệu khởi tử hồi sinh!\"",
[
{label:"🦶 Đạp Cừu Cửu Ngã Lăn: \"Cái này là lỗi của ngươi đó!\" → Sai Lão Sang Cổ Tự Tín Vương Đoạt Cổ Trăm Trận Trăm Thắng!",primary:true,onClick:()=>{
this._playSfx("punch");this.fx.shake=8;ent.x +=42;
this.progress.cuuCuuSentToXin=true;this.progress.unlockedWorlds.xin_temple=true;this.progress.stageStep=10;
this._spawnBurst(ent.x,ent.y,"#ffd700",22);
this._openDialogue(
"🟡 Mở Khóa Thế Giới 5: Cổ Tự Tín Vương!",
"Cừu Cửu Lĩnh Mệnh Khởi Hành",
"Cừu Cửu cung kính lĩnh mệnh tiến sang <strong>Thế Giới 5: Cổ Tự Tín Vương</strong>!",
[
{label:"🐢 Truyền Tống Ngay Sang Thế Giới 5: Cổ Tự Tín Vương!",primary:true,onClick:()=>{
this._transitionToWorld("xin_temple",1300,1760,()=>{
this._spawnBurst(1300,1760,"#ffd700",34);this._spawnFloatText(1300,1720,"🟡 Đã Tới Cổ Tự Tín Vương! Tiến Lên Chính Điện Gặp Cừu Cửu!","#ffd700");
});
}},
{label:"🗺️ Ở Lại Hoang Nguyên Bạo Vương",primary:false,onClick:()=>this._updateQuestHUD()}
]
);
}}
]
);
return;
}
if (this.scene.id==="xin_temple"&&this.progress.stageStep===10) {
this._startXinTempleBreakCutscene(ent);
return;
}
}

if (ent.id==="tieu_ho_tien"&&this.scene&&this.scene.id==="dang_hun_mountain") {
if (!this.progress.huImmortalClaimed) {
this._startClaimHuImmortalCutscene(ent);
} else {
this._openDialogue(
"🦊 Tiểu Hồ Tiên",
"Địa Linh Phúc Địa Hồ Tiên (Đã Nhận Chủ)",
"<em>\"Chủ nhân ơi! Đỉnh Đãng Hồn Sơn và Đãng Hồn Cung đã hoàn toàn thuộc về ngài! Tiểu Hồ Tiên sẽ trông coi Đảm Thức Cổ và chờ ngài trở lại bất cứ lúc nào!\"</em>",
[
{label:"🏯 Mang Định Tiên Du Trở Về Đại Bản Doanh",primary:true,onClick:()=>this.close(true)},
{label:"🗺️ Ở Lại Dạo Quanh Đỉnh Đãng Hồn Sơn",primary:false}
]
);
}
return;
}
this._openDialogue(ent.name,ent.title||"Cổ Sư Tam Vương Phúc Địa",`<em>"${_esc(ent.idleQuote||"...")}"</em>`,[{label:"Đóng",primary:true}]);
},
_updateQuestHUD() {
if (!this._screen|| !this.progress) return;
const pr=this.progress;
const badgeEl=this._screen.querySelector("#tk-act-badge");
const titleEl=this._screen.querySelector("#tk-obj-title");
const subEl=this._screen.querySelector("#tk-obj-sub");
const beltEl=this._screen.querySelector("#tk-relic-belt");
const spLbl=this._screen.querySelector("#tk-special-lbl");

if (badgeEl) {
const pLbl=pr.stageStep<=3?"PHẦN 1" :(pr.stageStep<=10?"PHẦN 2" :(pr.stageStep<=14?"PHẦN 3" :(pr.stageStep<=17?"PHẦN 4" :"PHẦN 5 • ĐẠI KẾT CỤC")));
badgeEl.textContent=`🦋 TAM VƯƠNG TRUYỀN THỪA • ${pLbl}`;
}

const texts={
0:["Gặp Địa Linh Bá Quy bên Cửu Long Thanh Đồng Đỉnh","Nhấn [E] nói chuyện Địa Linh Bá Quy để mở truyền tống sang Thế Giới 2: Độc Mù Trúc Lâm."],
1:["Truyền Tống Sang Thế Giới 2: Độc Mù Trúc Lâm","Nhấn [T] nạp Độc Mù Trúc Lâm! Vượt Cầu Gỗ Cổ qua Đầm Độc Bích Thủy tiến lên Đình Độc Trúc Bát Giác!"],
2:["Hạ Gục Long Thanh Thiên Tại Đình Độc Trúc Bát Giác!","Dùng Lực Đạo [J] đánh hạ Long Thanh Thiên & gián đoạn tiến độ giải ấn Cổ Bích Không!"],
3:["Nhặt Cổ Bích Không (Ngũ Chuyển)","Lại gần đoạn trúc xanh ngọc trên bệ Đình Độc Trúc nhấn [E] đoạt Cổ Bích Không!"],
4:["Truyền Tống Sang Thế Giới 3: Rừng Đá Khuyển Vương","Nhấn [T] nạp Rừng Đá Khuyển Vương! Tiến lên Đấu Trường Thạch Trụ chạm trán Chương Tam Tam!"],
5:["Truy Sát Ngự Thú Đại Sư Chương Tam Tam!","Dùng Xung Phong [K] né bẫy Khuyển Cốt và Lực Đạo [J] đánh hạ Chương Tam Tam!"],
6:["Nhặt Cổ Nô Lệ Ngũ Chuyển","Chạy lại nhặt Cổ Nô Lệ Ngũ Chuyển trên mặt đất & nuốt Không Khiếu!"],
7:["Truyền Tống Sang Thế Giới 4: Hoang Nguyên Bạo Vương","Nhấn [T] nạp Hoang Nguyên Bạo Vương! Băng qua Cầu Hắc Diện Thạch lên Đài Hỏa Trì gặp Cừu Cửu!"],
8:["Đọ Hồn & Quyền Đấm Cước Đá Thu Phục Cừu Cửu!","Đấm [J] bầm mặt Cừu Cửu đẩy Quang Ảnh Vàng ≥ 75%, rồi bấm [K] gọi tên 'Tăng A Ngưu'!"],
9:["Tra Hỏi Cừu Cửu Về Cổ Thề Độc & Giao Nhiệm Vụ","Lại gần Cừu Cửu đang quỳ rạp nhấn [E] tra hỏi bí mật Tố Thủ Y Sư rồi sai lão sang Cổ Tự Tín Vương!"],
10:["Truyền Tống Sang Thế Giới 5: Cổ Tự Tín Vương","Nhấn [T] nạp Cổ Tự Tín Vương! Tiến lên Chính Điện gặp Cừu Cửu nhận Cổ Trăm Trận Trăm Thắng!"],
11:["Về Thanh Đồng Đại Điện — Tước Quyền Chỉ Huy Bạch Ngưng Băng","Đi tới trước Cổng Tam Quan Thanh Đồng nói chuyện [E] với Bạch Ngưng Băng để tước cổ trùng chỉ huy gần 10 vạn khuyển thú giao cho Địa Linh Bá Quy!"],
12:["Ngồi Xếp Bằng Trước Cửu Long Thanh Đồng Đỉnh","Có thể nhấn [T] sang Thế Giới 6 (Chiến Trường Ngoại Vi) dạo xem 17 nhân vật trước, sau đó đi tới trước Cửu Long Thanh Đồng Đỉnh nhấn [E] ngồi tọa thiền!"],
13:["Tọa Thiền Chờ Đợt Chấn Động Thứ Nhất (Thái Cổ Quang Quyền)!","Ngươi đang ngồi khóa di chuyển trước Đỉnh Đồng — hãy trì hoãn mặc Bạch Ngưng Băng và Bá Quy thúc giục chờ Tiêu Mang đấm thủng màng thai Phúc Địa!"],
14:["Luyện Bán Thành Phẩm Cổ Không Khiếu Thứ Hai & Cộng Hưởng Tầm Nhìn!","Điều hòa Hỏa Hầu qua 4 bước (Cỏ Dại Phương Hoa → Huyết Khí Như Biển → Cổ Thọ 300 Năm → Cổ Thọ 500 Năm)! Bấm phím [1]–[4] chuyển thẳng sang Thế Giới 6 xem đại chiến ngoại điện!"],
15:["❄️ PHẦN 4: Bạch Ngưng Băng Giả Tự Bạo Đóng Băng Thanh Đồng Đại Điện!","Băng sương Bắc Minh Băng Phách Thể đang lan tới! Bấm nút bên dưới (hoặc phím [K]) bắn Dương Cổ nửa đường thu ngược về tay phải bóc trần màn diễn!"],
16:["🐢 PHẦN 4: Đối Đầu Thanh Đồng Đại Điện & Thuyết Phục Địa Linh Bá Quy","Bạch Ngưng Băng, Thiết Nhược Nam, bốn vị Trưởng Lão Thiết Gia và Viêm Quân đang vây kín nội điện! Đối đáp với họ rồi lại gần Địa Linh Bá Quy [E] thuyết phục luyện Tiên Cổ!"],
17:["🦋 PHẦN 4: GIỮA LÒNG THIÊN BỘC QUANG HÀ — LUYỆN LỤC CHUYỂN ĐỊNH TIÊN DU!","Ngươi đã bay vọt vào giữa thác ánh sáng! Phá Vô Cực Sưu Tỏa [J], giữ Kén Tằm hấp thu Ánh Sáng Thái Cổ (né Quang Lưu & dùng [K] Cổ Kim Hà ổn định), rồi tung 2x Cổ Tam Canh + Cổ Trăm Trận Trăm Thắng!"],
18:["📜 PHẦN 5: Ly Biệt Địa Linh Bá Quy — Khắc Họa Địa Điểm & Ngâm 4 Câu Thơ Bất Hủ!","Cổ Định Tiên Du đang lượn quanh thân! Chọn chuẩn Đỉnh Núi Đãng Hồn rồi cất giọng ngâm từng câu trong 4 câu thơ trước quần hùng Nam Cương!"],
19:["✨ ĐỊNH TIÊN DU PHÁT ĐỘNG — BỎ LẠI QUẦN ÁO GIỮA GIÓ ĐẠI ĐỒNG!","Ánh sáng xanh ngọc lóe tan vượt Giới Bích từ Nam Cương sang Trung Châu — Núi Thiên Thê!"],
20:["🦊 THẾ GIỚI 7: ĐỈNH NÚI ĐÃNG HỒN & ĐÃNG HỒN CUNG — THU PHỤC PHÚC ĐỊA HỒ TIÊN!","Tự do dạo quanh nói chuyện [E] với Phượng Kim Hoàng, Cổ Nguyệt Phương Chính, Thiên Hạc Thượng Nhân, Ứng Sinh Cơ, Tiêu Thất Tinh rồi gặp Tiểu Hồ Tiên [E] nhận chủ & nhận Lục Chuyển Định Tiên Du!"],
21:["🏆 ĐẠI KẾT CỤC VIÊN MÃN — CHỦ NHÂN PHÚC ĐỊA HỒ TIÊN & LỤC CHUYỂN ĐỊNH TIÊN DU!","Đã mở khóa tự do truyền tống [T] cả 7 Thế Giới Độc Lập! Nhấn 'Rời Phúc Địa' bất cứ lúc nào để mang Định Tiên Du về Đại Bản Doanh!"]
};
const pair=texts[pr.stageStep]||texts[21];
titleEl.textContent=pair[0];
subEl.textContent=pair[1];

beltEl.innerHTML=`
<span class="tk-relic-pill ${pr.hasBichKhong?"got" :""}">🎋 Cổ Bích Không ${pr.hasBichKhong?"✓" :""}</span>
<span class="tk-relic-pill ${pr.hasNoLeGu?"got" :""}">⛓️ Cổ Nô Lệ 5C ${pr.hasNoLeGu?"✓" :""}</span>
<span class="tk-relic-pill ${pr.hasTramTran?"got" :""}">🪨 Trăm Trận Trăm Thắng ${pr.hasTramTran?"✓" :""}</span>
<span class="tk-relic-pill ${pr.hasSecondApertureSemi?"got" :""}">🌺 Không Khiếu Thứ 2 ${pr.hasSecondApertureSemi?"✓" :""}</span>
<span class="tk-relic-pill ${pr.hasDinhTienDu?"got" :""}">🦋 Định Tiên Du 6C ${pr.hasDinhTienDu?"✓" :""}</span>
`;

const _kl=(act,def)=>global.vanCoSettings?global.vanCoSettings.getKeyLabel(act) :def;
const kAtk=_kl("tkAttack","J");
const kSp=_kl("tkSpecial","K");
const kInt=_kl("interact","E");
const kTp=_kl("tkTeleport","T");
const intLbl=this._screen.querySelector("#tk-act-interact small");
const tpBtn=this._screen.querySelector("#tk-btn-tp");
if (intLbl) intLbl.textContent=`Tương Tác [${kInt}]`;
if (tpBtn) tpBtn.textContent=`🐢 Truyền Tống [${kTp}]`;
const atkLbl=this._screen.querySelector("#tk-act-attack small");
if (pr.skyMode) {
if (spLbl) spLbl.textContent=`Cổ Kim Hà [${kSp}]`;
if (atkLbl) atkLbl.textContent=`Hành Động [${kAtk}]`;
} else {
if (atkLbl) atkLbl.textContent=`Lực Đạo [${kAtk}]`;
if (spLbl) {
const cuu=this.scene&&this.scene.entities.find(e=>e.id==="cuu_cuu"&&e.enslaveActive);
if (pr.stageStep===8&&cuu&&cuu.soulProgress>=75) spLbl.textContent=`Tăng A Ngưu! [${kSp}]`;
else spLbl.textContent=`Xung Phong [${kSp}]`;
}
}
},
_getObjectivePointInCurrentScene() {
if (!this.scene|| !this.progress||this.resonanceView) return null;
const s=this.progress.stageStep;
if (this.scene.id==="bronze_hall") {
if (s===0) {const bq=this.scene.entities.find(e=>e.id==="ba_quy");return bq?{x:bq.x,y:bq.y} :null;}
if (s===11) {const bnb=this.scene.entities.find(e=>e.id==="bach_ngung_bang");return bnb?{x:bnb.x,y:bnb.y} :null;}
if (s===12) return {x:1300,y:880};
if (s===16) {const bq=this.scene.entities.find(e=>e.id==="ba_quy");return bq?{x:bq.x,y:bq.y} :null;}
}
if (this.scene.id==="poison_grove") {
if (s===1||s===2) {const e=this.scene.entities.find(x=>x.id==="long_thanh_thien"&& !x.dead);return e?{x:e.x,y:e.y} :null;}
if (s===3) {const l=this.scene.loots.find(x=>x.id==="bich_khong_gu");return l?{x:l.x,y:l.y} :null;}
}
if (this.scene.id==="dog_forest") {
if (s===4||s===5) {const e=this.scene.entities.find(x=>x.id==="chuong_tam_tam"&& !x.dead);return e?{x:e.x,y:e.y} :null;}
if (s===6) {const l=this.scene.loots.find(x=>x.id==="no_le_gu");return l?{x:l.x,y:l.y} :null;}
}
if (this.scene.id==="bao_wasteland"&&(s===7||s===8||s===9)) {
const e=this.scene.entities.find(x=>x.id==="cuu_cuu"&& !x.dead);return e?{x:e.x,y:e.y} :null;
}
if (this.scene.id==="xin_temple"&&s===10) {
const e=this.scene.entities.find(x=>x.id==="cuu_cuu"&& !x.dead);return e?{x:e.x,y:e.y} :null;
}
if (this.scene.id==="dang_hun_mountain"&&s===20) {
const e=this.scene.entities.find(x=>x.id==="tieu_ho_tien"&& !x.dead);return e?{x:e.x,y:e.y} :null;
}
return null;
},

// ==============================================================================
// MAIN LOOP, WATER/LAVA COLLISION & LIVE WORLD UPDATES
// ==============================================================================
_loop(ts) {
if (!this.scene|| !this._ctx|| !this._canvas) return;
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs)/1000));
this._lastTs=ts;
this._update(dt);
this._render();
this._renderMinimap();
this._rafId=requestAnimationFrame((nextTs)=>this._loop(nextTs));
},
_isPointBlockedByWaterOrLava(x,y) {
const sc=this.scene;
if (!sc) return false;
if (sc.id==="poison_grove"&&sc.pond) {
const pv=sc.pavilion;
const dxPv=(x - pv.x)/198;const dyPv=(y - pv.y)/142;
if (dxPv*dxPv + dyPv*dyPv<=1.0) return false;
if (Math.abs(x - 1300)<=44&&y>=680&&y<=1210) return false;
const pd=sc.pond;
const dx=(x - pd.x)/(pd.rx - 14);const dy=(y - pd.y)/(pd.ry - 14);
return (dx*dx + dy*dy)<1.0;
}
if (sc.id==="bao_wasteland"&&sc.lavaRiver) {
const lr=sc.lavaRiver;
if (Math.abs(y - lr.y)<lr.halfH - 8) {
for (const bx of lr.bridges) {if (Math.abs(x - bx)<=50) return false;}
return true;
}
}
return false;
},
_update(dt) {
if (this.cinema&&this.cinema.isActive()) {
this.cinema.update(dt);
return;
}
const sc=this.scene;
const fx=this.fx;
const p=this.player;
const pr=this.progress;
fx.t +=dt;
fx.shake=Math.max(0,fx.shake - dt*24);
fx.flashAlpha=Math.max(0,fx.flashAlpha - dt*1.3);

// 1. World Transition Curtain
if (this.transition) {
const tr=this.transition;tr.t +=dt;
const pct=Math.min(100,(tr.t / tr.duration)*100);
const fillEl=this._screen&&this._screen.querySelector("#tk-curtain-fill");
if (fillEl) fillEl.style.width=`${pct}%`;
if (tr.t>=tr.duration*0.52&& !tr.swapped) {
tr.swapped=true;
if (!tr.isSkyWorld) this._loadWorldImmediate(tr.worldId,tr.spawnX,tr.spawnY);
}
if (tr.t>=tr.duration) {
const cb=tr.onArrived;this.transition=null;
const curtain=this._screen&&this._screen.querySelector("#tk-world-curtain");
if (curtain) curtain.classList.add("hidden");
this._clearMovementLock();
if (typeof cb==="function") cb();
}
return;
}

// 1A. Grand Teleport Cinema (Falling Clothes + Winds of Assimilation + Space Tunnel)
if (pr.teleportCinema) {
this._updateGrandTeleportCinema(dt);
return;
}
// 1B. Sky Light River Aerial World Mode!
if (pr.skyMode) {
this._updateSkyFlight(dt);
return;
}

// 1C. Step 15: Curved Golden Yang Gu Flight animation!
if (fx.yangGuFlight) {
fx.yangGuFlight.progress +=dt*1.12;
if (fx.yangGuFlight.progress>=1) {
fx.yangGuFlight=null;
this._finishYangGuExpose();
return;
}
}

// 2. Active Cutscenes
if (this.cutscene) {
const cs=this.cutscene;cs.t +=dt;
if (cs.type==="devour_aperture"&&Math.random()<0.48) {
const ang=Math.random()*Math.PI*2;const dist=75 + Math.random()*45;
fx.particles.push({x:p.x + Math.cos(ang)*dist,y:p.y + Math.sin(ang)*dist,vx:-Math.cos(ang)*140,vy:-Math.sin(ang)*140,size:3.2,color:Math.random()<0.5?"#38e8a8" :"#ffd700",life:0.52,maxLife:0.52});
}
if (cs.type==="xin_break") {
if (Math.random()<0.42) this._spawnBurst(1300 + (Math.random()-0.5)*90,680 + (Math.random()-0.5)*70,"#ffd700",5);
if (cs.t>=1.25&& !cs.extinguished) {
cs.extinguished=true;pr.xinPillarExtinguished=true;sc.pillarLit=false;
this._playSfx("shatter");fx.flashAlpha=0.85;fx.shake=16;
this._spawnRing(1300,665,"#ffd700",220);this._spawnBurst(1300,665,"#ffeaa7",65);
this._spawnFloatText(1300,630,"💥 CỘT SÁNG VÀNG TÍN VƯƠNG VỤT TẮT — ĐOẠT CỔ TRĂM TRẬN TRĂM THẮNG!","#ffd700");
}
}
if (cs.type==="thai_co_quang_quyen"&&fx.fistEffect) {
fx.fistEffect.progress=Math.min(1,cs.t / 1.35);
fx.fistEffect.y=-160 + fx.fistEffect.progress*370;
if (fx.fistEffect.progress>=1&& !cs.smashed) {
cs.smashed=true;pr.skyRiftOpen=true;sc.skyRiftOpen=true;
this._playSfx("shatter");fx.shake=18;fx.flashAlpha=0.92;
this._spawnBurst(1400,210,"#fff2a6",65);this._spawnRing(1400,210,"#ffd700",260);
this._spawnFloatText(1400,175,"💥 MÀNG THAI PHÚC ĐỊA ĐÃ THỦNG! QUẦN HÙNG TRÀN VÀO!","#fff2a6");
}
}
if (cs.type==="vinh_dieu_ngo_thuong"&&fx.spearEffect) {
fx.spearEffect.progress=Math.min(1,cs.t / 1.05);
if (fx.spearEffect.progress>=1&& !cs.hit) {
cs.hit=true;pr.mistCleared=true;sc.mistCleared=true;
this._playSfx("shatter");fx.shake=16;fx.flashAlpha=0.88;
this._spawnBurst(1400,1650,"#fff2a6",65);this._spawnRing(1400,1650,"#ffd700",360);
this._spawnFloatText(1400,1590,"💥 VINH DIỆU NGÔ THƯƠNG — TOÀN BỘ SƯƠNG MÙ TAN BIẾN!","#fff2a6");
}
}
if (cs.type==="all_out_assault"&&Math.random()<0.38) {
this._spawnBurst(1040,1580,"#c56cf0",7);
this._spawnBurst(1760,1580,"#fff2a6",7);
this._spawnBurst(2180,1540,"#ff5733",7);
this._spawnRing(1920,1580,"#4ce6ff",38);
this._spawnBurst(1540,1480,"#ffb3d9",6);
}
if (cs.type==="white_ape_portal"&&Math.random()<0.35) {
this._spawnBurst(1020,1360,"#c56cf0",8);
}
if (cs.type==="thien_boc_intro") {
if (fx.waterfallBeam) fx.waterfallBeam.progress=Math.min(1,cs.t / 1.15);
if (cs.t>=1.35&& !cs.swappedToHall) {
cs.swappedToHall=true;
pr.hallRoofShattered=true;
this.resonanceView=false;
this._loadWorldImmediate("bronze_hall",1300,985);
this.player.facing="up";
this.camera.mode="focus";this.camera.focusX=1300;this.camera.focusY=960;this.camera.zoom=0.88;
this._playSfx("shatter");fx.shake=18;fx.flashAlpha=0.95;
this._spawnBurst(1300,960,"#fff2a6",75);this._spawnRing(1300,960,"#ffd700",300);
const bq=this.scene&&this.scene.entities.find(e=>e.id==="ba_quy");
if (bq) {bq.bubble="ÁNH SÁNG VINH QUANG THÁI CỔ!!";bq.bubbleTimer=4.5;}
}
}
if (cs.t>=cs.duration) {
const fn=cs.onDone;
if (typeof fn==="function") fn();
}
}

// 3. Part 3 Real-Time Cauldron Heat Simulation (runs even while viewing Resonance World 6!)
if (pr.stageStep===14&&pr.isSeatedAtCauldron&& !this.dialogueOpen&& !this.cutscene) {
if (pr.refBaQuyAssistCd>0) pr.refBaQuyAssistCd=Math.max(0,pr.refBaQuyAssistCd - dt);
if (pr.refHeatLockTimer>0) {
pr.refHeatLockTimer=Math.max(0,pr.refHeatLockTimer - dt);
} else {
const amp=pr.refBoilingMode?11.2 :5.2;
const drift=Math.sin(fx.t*(pr.refBoilingMode?3.6 :2.1))*amp - 1.8;
pr.refHeat=Math.max(0,Math.min(100,pr.refHeat + drift*dt));
}
if (pr.refHeat>=96) {
pr.refOverheatTimer +=dt;fx.shake=Math.max(fx.shake,3.2);
if (pr.refOverheatTimer>=2.2) {
pr.refHeat=55;pr.refOverheatTimer=0;pr.refProgress=Math.max(0,pr.refProgress - 12);
this._playSfx("warning");this._spawnFloatText(this.camera.x,this.camera.y - 40,"⚠️ Mây khói quá nóng bị chấn động (-12% Tiến Độ)!","#ff6b6b");
}
} else {pr.refOverheatTimer=Math.max(0,pr.refOverheatTimer - dt*1.5);}
if (pr.refHeat<=4) {
pr.refColdTimer +=dt;
if (pr.refColdTimer>=2.2) {
pr.refHeat=45;pr.refColdTimer=0;pr.refProgress=Math.max(0,pr.refProgress - 10);
this._playSfx("warning");this._spawnFloatText(this.camera.x,this.camera.y - 40,"⚠️ Hỏa hầu quá yếu (-10% Tiến Độ)!","#67b7d1");
}
} else {pr.refColdTimer=Math.max(0,pr.refColdTimer - dt*1.5);}
this._syncCauldronGaugesFast();

// Live battle VFX in background when viewing World 6 or inside Bronze Hall Wave 4!
fx.battleFxTimer -=dt;
if (fx.battleFxTimer<=0) {
fx.battleFxTimer=0.48;
if (sc.id==="outer_battlefield"&&pr.battleWave>=3) {
this._spawnBurst(1040,1580,"#c56cf0",6);this._spawnBurst(1760,1580,"#fff2a6",6);
this._spawnBurst(2180,1540,"#ff5733",7);this._spawnRing(1920,1580,"#4ce6ff",34);
this._spawnBurst(1540,1480,"#ffb3d9",6);
} else if (sc.id==="bronze_hall"&&pr.battleWave>=4) {
this._spawnBurst(1300,1155,"#74eaff",7);this._spawnBurst(1300,1185,"#ffd700",5);
}
}
}

// 4. Player Movement (ONLY when NOT locked!)
if (p.attackCd>0) p.attackCd=Math.max(0,p.attackCd - dt);
if (p.attackAnim>0) p.attackAnim=Math.max(0,p.attackAnim - dt);
if (p.dashCd>0) p.dashCd=Math.max(0,p.dashCd - dt);
if (p.slowTimer>0) p.slowTimer=Math.max(0,p.slowTimer - dt);
if (p.isJumping||p.z>0||p.vz!==0) {
p.z =(p.z||0) + (p.vz||0)*dt;
p.vz =(p.vz||0) - 980*dt;
if (p.z<=0) {
p.z=0;p.vz=0;p.isJumping=false;p.jumpCount=0;
this._spawnRing(p.x,p.y + 10,"rgba(255,234,167,0.6)",22);
}
}

if (!this._isMovementLocked()) {
let mx=0;let my=0;
const _km=(act,def)=>global.vanCoSettings?global.vanCoSettings.getKeybind(act) :def;
if (this._keys[_km("moveUp","KeyW")]||this._keys["ArrowUp"]) my -=1;
if (this._keys[_km("moveDown","KeyS")]||this._keys["ArrowDown"]) my +=1;
if (this._keys[_km("moveLeft","KeyA")]||this._keys["ArrowLeft"]) mx -=1;
if (this._keys[_km("moveRight","KeyD")]||this._keys["ArrowRight"]) mx +=1;
if (this._joy.active&&(Math.abs(this._joy.dx)>0.08||Math.abs(this._joy.dy)>0.08)) {mx=this._joy.dx;my=this._joy.dy;}
if (mx!==0||my!==0) {p.moveTarget=null;const len=Math.hypot(mx,my)||1;mx /=len;my /=len;}
else if (p.moveTarget) {const dx=p.moveTarget.x - p.x;const dy=p.moveTarget.y - p.y;const d=Math.hypot(dx,dy);if (d<10) p.moveTarget=null;else {mx=dx/d;my=dy/d;}}

const spdMult=p.slowTimer>0?0.52 :1.0;
let vx=mx*p.speed*spdMult;let vy=my*p.speed*spdMult;
if (p.dashTimer>0) {p.dashTimer=Math.max(0,p.dashTimer - dt);vx=p.dashVx;vy=p.dashVy;}
if (Math.abs(vx)>2||Math.abs(vy)>2) {
p.aimAngle=Math.atan2(vy,vx);p.walkPhase +=dt*10;
if (Math.abs(vx)>Math.abs(vy)) p.facing=vx<0?"left" :"right";else p.facing=vy<0?"up" :"down";
}
let nx=Math.max(100,Math.min(sc.width - 100,p.x + vx*dt));
let ny=Math.max(100,Math.min(sc.height - 100,p.y + vy*dt));
if (sc.id==="bronze_hall"&&pr.stageStep===16) {
nx=Math.max(960,Math.min(1640,nx));
ny=Math.max(650,Math.min(1195,ny));
}
for (const ob of sc.obstacles) {
const dx=nx - ob.x;const dy=ny - ob.y;const d=Math.hypot(dx,dy);const minD=ob.r + p.radius;
if (d<minD&&d>0.01) {nx=ob.x + (dx/d)*minD;ny=ob.y + (dy/d)*minD;}
}
if (this._isPointBlockedByWaterOrLava(nx,ny)) {
if (!this._isPointBlockedByWaterOrLava(nx,p.y)) ny=p.y;
else if (!this._isPointBlockedByWaterOrLava(p.x,ny)) nx=p.x;
else {nx=p.x;ny=p.y;p.moveTarget=null;}
}
p.x=nx;p.y=ny;

for (const mp of sc.miasmaPools) {
if (Math.hypot(p.x - mp.x,p.y - mp.y)<mp.r - 10&&p.dashTimer<=0&&(p.z||0)<12) {
if (p.slowTimer<=0) this._spawnFloatText(p.x,p.y - 34,"☠️ Chướng Khí Độc Làm Chậm! Dùng Xung Phong [K]!","#38e8a8");
p.slowTimer=0.45;
}
}
for (let i=sc.traps.length - 1;i>=0;i--) {
const tr=sc.traps[i];tr.life -=dt;
if (tr.life<=0) {sc.traps.splice(i,1);continue;}
if (Math.hypot(p.x - tr.x,p.y - tr.y)<tr.r&&p.dashTimer<=0&&(p.z||0)<12) {
p.slowTimer=1.25;this._playSfx("warning");this._spawnBurst(tr.x,tr.y,"#5aa9e6",16);
this._spawnFloatText(p.x,p.y - 34,"🦴 Giẫm Bẫy Khuyển Cốt Phù Văn! Làm chậm!","#85c1e9");
sc.traps.splice(i,1);
}
}
for (let i=sc.loots.length - 1;i>=0;i--) {
if (Math.hypot(sc.loots[i].x - p.x,sc.loots[i].y - p.y)<=36) {this._pickupLoot(sc.loots[i],i);break;}
}
}

// 5. Camera Follow
const camTx=this.camera.mode==="focus"?this.camera.focusX :p.x;
const camTy=this.camera.mode==="focus"?this.camera.focusY :p.y;
this.camera.x +=(camTx - this.camera.x)*Math.min(1,dt*7.5);
this.camera.y +=(camTy - this.camera.y)*Math.min(1,dt*7.5);

// 6. Ambient World Loops & White Apes
for (const h of sc.hounds) {h.x=h.homeX + Math.cos(fx.t*1.1 + h.phase)*18;h.y=h.homeY + Math.sin(fx.t*0.9 + h.phase)*14;}
for (const lf of sc.leaves) {lf.x +=lf.vx*dt;lf.y +=lf.vy*dt;lf.ang +=lf.spin*dt;if (lf.x<0) lf.x=sc.width;if (lf.y>sc.height) {lf.y=0;lf.x=Math.random()*sc.width;}}
for (const em of sc.embers) {em.x +=em.vx*dt;em.y +=em.vy*dt;if (em.y<0) {em.y=sc.height;em.x=Math.random()*sc.width;}}
if (Array.isArray(sc.whiteApes)) {
for (const ape of sc.whiteApes) {
const dx=ape.tx - ape.x;const dy=ape.ty - ape.y;const d=Math.hypot(dx,dy);
if (d>14) {ape.x +=(dx/d)*95*dt;ape.y +=(dy/d)*95*dt;}
else {ape.x +=Math.cos(fx.t*4 + ape.phase)*26*dt;ape.y +=Math.sin(fx.t*4 + ape.phase)*26*dt;}
}
}

// 7. Per-World Character AI (Parts 1 & 2 preserved!)
if (sc.id==="poison_grove") {
const ltt=sc.entities.find(e=>e.id==="long_thanh_thien"&& !e.dead);
if (ltt) {
const d=Math.hypot(p.x - ltt.x,p.y - ltt.y);
if (!ltt.introPlayed&&d<=245&& !this._isMovementLocked()) this._startLongThanhThienEncounterCutscene(ltt);
else if (ltt.activeCombat&& !this._isMovementLocked()) {
ltt.poisonCharge=Math.min(100,ltt.poisonCharge + 6.0*dt);
if (d<135) {const away=Math.atan2(ltt.y - p.y,ltt.x - p.x) + Math.sin(fx.t*2.4)*0.5;ltt.x=Math.max(1155,Math.min(1445,ltt.x + Math.cos(away)*78*dt));ltt.y=Math.max(495,Math.min(685,ltt.y + Math.sin(away)*78*dt));}
ltt.poisonWaveCd -=dt;
if (ltt.poisonWaveCd<=0) {ltt.poisonWaveCd=3.4;this._playSfx("warning");fx.shockwaves.push({x:ltt.x,y:ltt.y,r:14,maxR:155,speed:185,hit:false});ltt.bubble="Chướng Khí Độc Bộc Phát — Cút Ra!!";ltt.bubbleTimer=2.0;}
if (ltt.poisonCharge>=100) {ltt.poisonCharge=0;ltt.hp=ltt.maxHp;this._playSfx("warning");this._spawnBurst(ltt.x,ltt.y,"#38e8a8",36);this._spawnFloatText(ltt.x,ltt.y - 38,"☠️ Long Thanh Thiên kịp kích độc Bích Không! Đánh nhanh hơn!","#ff5252");}
}
}
}
if (sc.id==="dog_forest") {
const ctt=sc.entities.find(e=>e.id==="chuong_tam_tam"&& !e.dead);
if (ctt) {
const d=Math.hypot(p.x - ctt.x,p.y - ctt.y);
if (!ctt.introPlayed&&d<=270&& !this._isMovementLocked()) this._startChuongTamTamEncounterCutscene(ctt);
else if (ctt.activeCombat&& !this._isMovementLocked()) {
if (d<310) {
const away=Math.atan2(ctt.y - p.y,ctt.x - p.x) + Math.sin(fx.t*2.1)*0.7;
let nx=Math.max(760,Math.min(1840,ctt.x + Math.cos(away)*152*dt));let ny=Math.max(440,Math.min(1560,ctt.y + Math.sin(away)*152*dt));
for (const ob of sc.obstacles) {const odx=nx - ob.x;const ody=ny - ob.y;const od=Math.hypot(odx,ody);if (od<ob.r + 22&&od>0.01) {nx=ob.x + (odx/od)*(ob.r + 22);ny=ob.y + (ody/od)*(ob.r + 22);}}
ctt.x=nx;ctt.y=ny;ctt.facing=Math.cos(away)<0?"left" :"right";
}
ctt.trapCd -=dt;
if (ctt.trapCd<=0&&d<360) {ctt.trapCd=2.9;sc.traps.push({x:ctt.x,y:ctt.y,r:34,life:9.0});ctt.bubble="Đừng đuổi theo ta! Khuyển Cốt Phù Văn — chặn hắn lại!";ctt.bubbleTimer=2.2;}
}
}
}
if (sc.id==="bao_wasteland") {
const cuu=sc.entities.find(e=>e.id==="cuu_cuu"&& !e.dead);
if (cuu) {
const d=Math.hypot(p.x - cuu.x,p.y - cuu.y);
if (!cuu.introPlayed&& !cuu.enslaved&&pr.stageStep===7&&d<=250&& !this._isMovementLocked()) this._startCuuCuuEncounterCutscene(cuu);
else if (cuu.enslaveActive&& !this._isMovementLocked()) {
cuu.soulProgress=Math.max(6,cuu.soulProgress - 3.4*dt);
if (d<190) {const away=Math.atan2(cuu.y - p.y,cuu.x - p.x) + Math.sin(fx.t*2.8)*0.55;cuu.x=Math.max(1070,Math.min(1530,cuu.x + Math.cos(away)*116*dt));cuu.y=Math.max(465,Math.min(755,cuu.y + Math.sin(away)*116*dt));cuu.facing=Math.cos(away)<0?"left" :"right";}
this._updateQuestHUD();
}
}
}
if (sc.id==="xin_temple"&&pr.stageStep===10&& !this._isMovementLocked()) {
const cuu=sc.entities.find(e=>e.id==="cuu_cuu"&& !e.dead);
if (cuu&&Math.hypot(p.x - cuu.x,p.y - cuu.y)<=160) this._startXinTempleBreakCutscene(cuu);
}

for (let i=fx.shockwaves.length - 1;i>=0;i--) {
const sw=fx.shockwaves[i];sw.r +=sw.speed*dt;
const dp=Math.hypot(p.x - sw.x,p.y - sw.y);
if (!sw.hit&&Math.abs(dp - sw.r)<22&&p.dashTimer<=0&& !this._isMovementLocked()) {
sw.hit=true;const push=Math.atan2(p.y - sw.y,p.x - sw.x);
p.x=Math.max(1120,Math.min(1480,p.x + Math.cos(push)*58));p.y=Math.max(470,Math.min(720,p.y + Math.sin(push)*58));
p.slowTimer=0.9;fx.shake=8;this._spawnFloatText(p.x,p.y - 34,"☠️ Trúng Sóng Chướng Khí! (Đẩy lùi & Làm chậm)","#38e8a8");
}
if (sw.r>=sw.maxR) fx.shockwaves.splice(i,1);
}
for (const ent of sc.entities) {
if (ent.bubbleTimer>0) ent.bubbleTimer=Math.max(0,ent.bubbleTimer - dt);
if (sc.id==="dang_hun_mountain"&&typeof ent.targetX==="number"&&typeof ent.targetY==="number") {
const dx=ent.targetX - ent.x;const dy=ent.targetY - ent.y;const d=Math.hypot(dx,dy);
if (d>6) {ent.x +=(dx/d)*28*dt;ent.y +=(dy/d)*28*dt;}
}
}
for (let i=fx.particles.length - 1;i>=0;i--) {const pt=fx.particles[i];pt.x +=pt.vx*dt;pt.y +=pt.vy*dt;pt.life -=dt;if (pt.life<=0) fx.particles.splice(i,1);}
for (let i=fx.floatingTexts.length - 1;i>=0;i--) {const ft=fx.floatingTexts[i];ft.y -=28*dt;ft.life -=dt;if (ft.life<=0) fx.floatingTexts.splice(i,1);}
for (let i=fx.rings.length - 1;i>=0;i--) {const rg=fx.rings[i];rg.life -=dt;rg.r=rg.maxR*(1 - rg.life/rg.maxLife);if (rg.life<=0) fx.rings.splice(i,1);}

this._updateTargetBarDOM();
},
_syncCauldronGaugesFast() {
if (!this._screen|| !this.progress) return;
const pr=this.progress;
const curS=SECOND_APERTURE_STEPS[pr.refStepIdx]||SECOND_APERTURE_STEPS[3];
const inZone=(pr.refHeat>=curS.minHeat&&pr.refHeat<=curS.maxHeat);
const heatCol=pr.refHeatLockTimer>0?"#7ef7f0" :(inZone?"#5cc995" :(pr.refHeat>curS.maxHeat?"#ff4d4d" :"#67b7d1"));
const pLbl=this._screen.querySelector("#tk-ref-prog-lbl");
const pFill=this._screen.querySelector("#tk-ref-prog-fill");
const hLbl=this._screen.querySelector("#tk-ref-heat-lbl");
const hFill=this._screen.querySelector("#tk-ref-heat-fill");
const bqBtn=this._screen.querySelector("#tk-ref-baquy");
if (pLbl) pLbl.textContent=`${Math.round(pr.refProgress)}%`;
if (pFill) pFill.style.width=`${Math.round(pr.refProgress)}%`;
if (hLbl) {hLbl.textContent=pr.refHeatLockTimer>0?`🔒 ${pr.refHeatLockTimer.toFixed(1)}s` :`${Math.round(pr.refHeat)}%`;hLbl.style.color=heatCol;}
if (hFill) {hFill.style.width=`${Math.max(0,Math.min(100,pr.refHeat))}%`;hFill.style.background=heatCol;}
if (bqBtn) {bqBtn.disabled=pr.refBaQuyAssistCd>0;bqBtn.textContent=`🐢 Bá Quy Ổn Lò${pr.refBaQuyAssistCd>0?` (${pr.refBaQuyAssistCd.toFixed(1)}s)` :""}`;}
},
_updateTargetBarDOM() {
if (!this._screen|| !this.scene) return;
const bar=this._screen.querySelector("#tk-target-bar");
const ltt=this.scene.entities.find(e=>e.id==="long_thanh_thien"&& !e.dead&&e.activeCombat);
if (ltt) {
bar.classList.remove("hidden");
bar.innerHTML=`<div class="bar-label"><span>🎋 Long Thanh Thiên (Ngũ Chuyển Độc Đạo)</span><strong>HP ${ltt.hp}/${ltt.maxHp}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${(ltt.hp/ltt.maxHp)*100}%;background:#e05252;"></div></div><div class="bar-label" style="margin-top:3px;font-size:10.5px;"><span>☠️ Tiến Độ Giải Ấn Cổ Bích Không</span><strong style="color:#38e8a8;">${Math.round(ltt.poisonCharge)}%</strong></div><div class="progress-track" style="height:5px;"><div class="progress-fill" style="width:${ltt.poisonCharge}%;background:#38e8a8;"></div></div>`;
return;
}
const ctt=this.scene.entities.find(e=>e.id==="chuong_tam_tam"&& !e.dead&&e.activeCombat);
if (ctt) {
bar.classList.remove("hidden");
bar.innerHTML=`<div class="bar-label"><span>⛓️ Chương Tam Tam (Ngự Thú Đại Sư — Đang Luồn Lách Bỏ Chạy!)</span><strong>HP ${ctt.hp}/${ctt.maxHp}</strong></div><div class="progress-track"><div class="progress-fill" style="width:${(ctt.hp/ctt.maxHp)*100}%;background:#5aa9e6;"></div></div>`;
return;
}
const cuu=this.scene.entities.find(e=>e.id==="cuu_cuu"&& !e.dead&&e.enslaveActive);
if (cuu) {
const pct=Math.round(cuu.soulProgress);
bar.classList.remove("hidden");
bar.innerHTML=`<div class="bar-label"><span>⛓️ Đọ Hồn Phách: Quang Ảnh Vàng Trên Người Cừu Cửu (${pct>=75?"ĐỦ 75% — BẤM [K] GỌI TĂNG A NGƯU!" :"Đấm [J] lên ≥75%!"})</span><strong style="color:${pct>=75?"#7ef7c4" :"#ffd700"}">${pct}%</strong></div><div class="progress-track"><div style="position:absolute;left:75%;top:0;bottom:0;width:2px;background:#38e8a8;z-index:3;"></div><div class="progress-fill" style="width:${pct}%;background:linear-gradient(90deg,#b8860b,#ffd700);"></div></div>`;
return;
}
bar.classList.add("hidden");
},

// ==============================================================================
// RENDERING CURRENT SEPARATE WORLD ONLY
// ==============================================================================
_render() {
const ctx=this._ctx;
const sc=this.scene;
const fx=this.fx;
const W=global.ThreeKingsWorlds;
if (!ctx|| !W) return;
if (this.cinema&&this.cinema.isActive()) {
this.cinema.render(ctx,window.innerWidth,window.innerHeight);
return;
}
if (this.progress&&this.progress.teleportCinema) {
this._renderGrandTeleportCinema();
return;
}
if (this.progress&&this.progress.skyMode) {
this._renderSkyFlight();
return;
}
if (!sc) return;
const vw=window.innerWidth;const vh=window.innerHeight;
const cam=this.camera;const t=fx.t;

ctx.clearRect(0,0,vw,vh);
ctx.fillStyle="#0a0808";
ctx.fillRect(0,0,vw,vh);

const _shOn=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
const sx=(_shOn&&fx.shake>0)?(Math.random() - 0.5)*fx.shake :0;
const sy=(_shOn&&fx.shake>0)?(Math.random() - 0.5)*fx.shake :0;

ctx.save();
ctx.translate(vw/2 + sx,vh/2 + sy);
ctx.scale(cam.zoom,cam.zoom);
ctx.translate(-cam.x,-cam.y);

W.renderWorldTerrainAndArchitecture(ctx,sc,t,this.player);

for (const lt of sc.loots) {
const bob=Math.sin(t*4)*4;
const lg=ctx.createRadialGradient(lt.x,lt.y + bob,2,lt.x,lt.y + bob,32);
lg.addColorStop(0,lt.color);lg.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=lg;ctx.beginPath();ctx.arc(lt.x,lt.y + bob,32,0,Math.PI*2);ctx.fill();
ctx.font="22px sans-serif";ctx.textAlign="center";ctx.fillText(lt.icon,lt.x,lt.y + bob + 7);
ctx.font="bold 12px Georgia";ctx.fillStyle="#ffffff";
ctx.fillText(`[E] Nhặt ${lt.name}`,lt.x,lt.y + bob - 22);
}

// Y-sorted render list (do NOT draw Phương Nguyên inside World 6 when viewing via Bá Quy Resonance!)
const renderList=[];
if (!this.resonanceView) renderList.push({type:"player",y:this.player.y});
for (const ent of sc.entities) {if (!ent.dead) renderList.push({type:"npc",y:ent.y,ent});}
renderList.sort((a,b)=>a.y - b.y);

const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
const mcSkin=(this.game&&this.game.player&&this.game.player.getSkinConfig)?this.game.player.getSkinConfig() :pSkins.phuong_nguyen;

for (const item of renderList) {
if (item.type==="player") {
const p=this.player;
const pz=Math.max(0,p.z||0);
ctx.save();ctx.translate(p.x,p.y);
if (pz>1) {
const shS=Math.max(0.45,1 - pz/120);
ctx.fillStyle=`rgba(0,0,0,${(0.45*shS).toFixed(2)})`;
ctx.beginPath();ctx.ellipse(0,14,12*shS,4.5*shS,0,0,Math.PI*2);ctx.fill();
}
ctx.translate(0,-pz);
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
ctx.scale(1.2,1.2);
global.PlayerManager.drawSkinPixelSprite(ctx,mcSkin,{
bobY:this.progress.isSeatedAtCauldron?0 :Math.abs(Math.sin(p.walkPhase))* -2.2,
legOffset:this.progress.isSeatedAtCauldron?0 :Math.sin(p.walkPhase)*3,
armSwing:p.attackAnim>0? -7 :(this.progress.isSeatedAtCauldron? -4 :Math.sin(p.walkPhase)*2),
facing:p.facing,isMoving:p.walkPhase>0&& !this._isMovementLocked()
});
}
if (p.attackAnim>0) {
ctx.save();ctx.rotate(p.aimAngle);
ctx.strokeStyle="#ffd700";ctx.lineWidth=4.5;ctx.lineCap="round";
ctx.beginPath();ctx.arc(6,0,30,-0.9,0.9);ctx.stroke();ctx.restore();
}
ctx.restore();
if (this.progress&&this.progress.hasDinhTienDu) {
W.Arch.drawJadeButterfly(ctx,p.x + Math.cos(t*2.8)*36,p.y - 26 + Math.sin(t*3.2)*8,0.82,t);
}
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="#000";ctx.fillText("Phương Nguyên",p.x + 1,p.y - 38 - pz);
ctx.fillStyle="#7ef7c4";ctx.fillText("Phương Nguyên",p.x,p.y - 39 - pz);
} else {
const ent=item.ent;
if (ent.isTortoise) {
W.Arch.drawTortoiseLandSpirit(ctx,ent.x,ent.y,t);
} else if (ent.isHoundEmperor) {
W.Arch.drawHoundEmperor(ctx,ent.x,ent.y,t,ent.houndColor,ent.facing);
} else if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function") {
const floatIce=(sc.id==="bronze_hall"&&ent.id==="bach_ngung_bang"&&this.progress.hallFrozen);
const floatHover=(ent.hasDreamWings||ent.isSpiritGhost)?Math.sin(t*3.2)*5 :0;
ctx.save();
ctx.translate(ent.x,ent.y - (floatIce?18 :0) + floatHover);
// Phượng Kim Hoàng colorful Dream Wings (Mộng Dực)!
if (ent.hasDreamWings) {
const fl=Math.sin(t*10)*0.24;
for (const side of [-1,1]) {
ctx.save();ctx.scale(side,1);ctx.rotate(-0.12 + fl);
const dw=ctx.createLinearGradient(0,-14,40,10);
dw.addColorStop(0,"#ff85d5");dw.addColorStop(0.5,"#ffd700");dw.addColorStop(1,"#7ef7f0");
ctx.fillStyle=dw;ctx.strokeStyle="#ffffff";ctx.lineWidth=1.1;
ctx.beginPath();ctx.moveTo(4,-4);ctx.quadraticCurveTo(25,-28,44,-8);ctx.quadraticCurveTo(27,10,4,4);ctx.closePath();ctx.fill();ctx.stroke();
ctx.restore();
}
}
// Tiểu Hồ Tiên fluffy white fox tail!
if (ent.isFoxSpirit) {
const wag=Math.sin(t*4.2)*6;
ctx.fillStyle="#fff5fa";ctx.strokeStyle="#ffb8e6";ctx.lineWidth=1.2;
ctx.beginPath();ctx.moveTo(4,6);ctx.quadraticCurveTo(22,2 + wag,25,-11 + wag);ctx.quadraticCurveTo(14,-15 + wag,6,0);ctx.closePath();ctx.fill();ctx.stroke();
}
if (ent.id==="viem_quan"&&this.progress.battleWave>=3) ctx.globalAlpha=0.45 + Math.sin(t*6)*0.22;
if (ent.id==="ly_nhan"&&this.progress.battleWave>=3) ctx.globalAlpha=0.28 + Math.sin(t*5)*0.18;
if (ent.isSpiritGhost) ctx.globalAlpha=0.68 + Math.sin(t*4)*0.14;
ctx.scale(ent.isFoxSpirit?1.04 :1.16,ent.isFoxSpirit?1.04 :1.16);
global.PlayerManager.drawSkinPixelSprite(ctx,ent.skin||mcSkin,{
bobY:Math.sin(t*2 + ent.x*0.01)*1.2,
legOffset:(ent.activeCombat||ent.enslaveActive)?Math.sin(t*10)*2.5 :0,
facing:ent.facing||"down",
allowCache:(cam.zoom<0.75||(document.body&&document.body.classList.contains("mobile-ui")))
});
if (ent.isFoxSpirit) {
ctx.fillStyle="#fff5fa";ctx.strokeStyle="#ff85c2";ctx.lineWidth=0.9;
ctx.beginPath();ctx.moveTo(-5.2,-20.5);ctx.lineTo(-8.2,-29.2);ctx.lineTo(-2.0,-22.2);ctx.closePath();ctx.fill();ctx.stroke();
ctx.beginPath();ctx.moveTo(5.2,-20.5);ctx.lineTo(8.2,-29.2);ctx.lineTo(2.0,-22.2);ctx.closePath();ctx.fill();ctx.stroke();
}

if (ent.id==="cuu_cuu"&&ent.enslaveActive) {
const pct=ent.soulProgress / 100;
const g=ctx.createLinearGradient(0,-66,0,16);
g.addColorStop(0,"rgba(255,215,0,0.92)");g.addColorStop(1,"rgba(255,215,0,0.14)");
ctx.fillStyle=g;ctx.fillRect(-18,-62,36,76*pct);
}
ctx.restore();
// Ice Prison Block over Thiết Nhược Nam & 4 Elders when Hall is Frozen!
if (sc.id==="bronze_hall"&&this.progress.hallFrozen&&["thiet_nhuoc_nam","thiet_gia_dai_lao","thiet_gia_nhi_lao","thiet_gia_tam_lao","thiet_gia_tu_lao"].includes(ent.id)) {
ctx.save();
ctx.fillStyle="rgba(133,225,255,0.42)";ctx.strokeStyle="#e0f7ff";ctx.lineWidth=1.8;
ctx.fillRect(ent.x - 19,ent.y - 28,38,44);ctx.strokeRect(ent.x - 19,ent.y - 28,38,44);
ctx.restore();
}
}
const nCol=ent.hostile?"#ff8a8a" :(ent.id==="ba_quy"?"#ffd700" :(ent.isFoxSpirit?"#ffb8e6" :(ent.hasDreamWings?"#ffd700" :(ent.enslaved?"#7ef7c4" :"#f0ebe1"))));
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(ent.name,ent.x + 1,ent.y - 37);
ctx.fillStyle=nCol;ctx.fillText(ent.name,ent.x,ent.y - 38);
if (ent.isFoxSpirit&&this.progress&& !this.progress.huImmortalClaimed) {
ctx.font="bold 11px Georgia";ctx.fillStyle="#7ef7c4";ctx.fillText("[E] Thu Phục Phúc Địa Hồ Tiên!",ent.x,ent.y - 53);
}

if (ent.bubble&&ent.bubbleTimer>0) {
ctx.font="11px Georgia";
const txt=ent.bubble.slice(0,52);
const bw=Math.min(285,ctx.measureText(txt).width + 18);
ctx.fillStyle="rgba(12,15,22,0.92)";ctx.strokeStyle="#ffd700";ctx.lineWidth=1.2;
ctx.fillRect(ent.x - bw/2,ent.y - 69,bw,22);ctx.strokeRect(ent.x - bw/2,ent.y - 69,bw,22);
ctx.fillStyle="#ffeaa7";ctx.fillText(txt,ent.x,ent.y - 54);
}
}
}

// Giant Killer Moves during World 6 Cutscenes (Thái Cổ Quang Quyền & Vinh Diệu Ngô Thương!)
if (fx.fistEffect) {
const fy=fx.fistEffect.y;
const fg=ctx.createRadialGradient(1400,fy,15,1400,fy,150);
fg.addColorStop(0,"#ffffff");fg.addColorStop(0.45,"#fff2a6");fg.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=fg;ctx.beginPath();ctx.arc(1400,fy,150,0,Math.PI*2);ctx.fill();
ctx.font="bold 19px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffffff";
ctx.fillText("👊 THÁI CỔ QUANG QUYỀN!",1400,fy - 85);
}
if (fx.yangGuFlight) {
const yg=fx.yangGuFlight;const p0=yg.progress;
const u=p0<=0.5?(p0*2) :((1 - p0)*2);
const curX=yg.sx + (yg.mx - yg.sx)*u + Math.sin(p0*Math.PI*2)*22;
const curY=yg.sy + (yg.my - yg.sy)*u;
const ygg=ctx.createRadialGradient(curX,curY,2,curX,curY,24);
ygg.addColorStop(0,"#ffffff");ygg.addColorStop(0.45,"#ffd700");ygg.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=ygg;ctx.beginPath();ctx.arc(curX,curY,24,0,Math.PI*2);ctx.fill();
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle="#fff2a6";ctx.fillText("☀️ Dương Cổ",curX,curY - 19);
}
if (fx.waterfallBeam) {
const wb=fx.waterfallBeam;
const ex=wb.sx + (wb.tx - wb.sx)*wb.progress;const ey=wb.sy + (wb.ty - wb.sy)*wb.progress;
ctx.save();
ctx.strokeStyle="rgba(255,245,180,0.85)";ctx.lineWidth=72;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(wb.sx,wb.sy);ctx.lineTo(ex,ey);ctx.stroke();
ctx.strokeStyle="#ffffff";ctx.lineWidth=30;ctx.beginPath();ctx.moveTo(wb.sx,wb.sy);ctx.lineTo(ex,ey);ctx.stroke();
ctx.restore();
}
if (fx.spearEffect) {
const sp=fx.spearEffect;
const ex=sp.sx + (sp.tx - sp.sx)*sp.progress;const ey=sp.sy + (sp.ty - sp.sy)*sp.progress;
ctx.save();
ctx.strokeStyle="#fff2a6";ctx.lineWidth=38;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(sp.sx,sp.sy);ctx.lineTo(ex,ey);ctx.stroke();
ctx.strokeStyle="#ffffff";ctx.lineWidth=16;ctx.beginPath();ctx.moveTo(sp.sx,sp.sy);ctx.lineTo(ex,ey);ctx.stroke();
ctx.restore();
}

for (const sw of fx.shockwaves) {ctx.save();ctx.globalAlpha=Math.max(0,1 - sw.r/sw.maxR);ctx.strokeStyle="#38e8a8";ctx.lineWidth=5;ctx.beginPath();ctx.arc(sw.x,sw.y,sw.r,0,Math.PI*2);ctx.stroke();ctx.restore();}
for (const rg of fx.rings) {ctx.save();ctx.globalAlpha=Math.max(0,rg.life/rg.maxLife);ctx.strokeStyle=rg.color;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(rg.x,rg.y,rg.r,0,Math.PI*2);ctx.stroke();ctx.restore();}
for (const pt of fx.particles) {ctx.save();ctx.globalAlpha=Math.max(0,pt.life/pt.maxLife);ctx.fillStyle=pt.color;ctx.beginPath();ctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2);ctx.fill();ctx.restore();}
for (const ft of fx.floatingTexts) {ctx.save();ctx.globalAlpha=Math.max(0,ft.life/ft.maxLife);ctx.font="bold 13px Georgia";ctx.textAlign="center";ctx.fillStyle="#000";ctx.fillText(ft.text,ft.x + 1,ft.y + 1);ctx.fillStyle=ft.color;ctx.fillText(ft.text,ft.x,ft.y);ctx.restore();}

const objPt=this._getObjectivePointInCurrentScene();
if (objPt&& !this._isMovementLocked()) {
const dist=Math.hypot(objPt.x - this.player.x,objPt.y - this.player.y);
if (dist>135) {
const ang=Math.atan2(objPt.y - this.player.y,objPt.x - this.player.x);
const ax=this.player.x + Math.cos(ang)*62;const ay=this.player.y + Math.sin(ang)*62;
ctx.save();ctx.translate(ax,ay);ctx.rotate(ang);ctx.fillStyle="#ffd700";
ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-7);ctx.lineTo(-4,0);ctx.lineTo(-7,7);ctx.closePath();ctx.fill();ctx.restore();
}
}

ctx.restore();

if (fx.flashAlpha>0.01) {
ctx.fillStyle=`rgba(180,255,220,${fx.flashAlpha*0.55})`;
ctx.fillRect(0,0,vw,vh);
}
},
_renderMinimap() {
const ctx=this._miniCtx;
const sc=this.scene;
if (!ctx) return;
if (this.cinema&&this.cinema.isActive()) return;
if (this.progress&&this.progress.teleportCinema) {
const mw=this._miniCanvas.width;const mh=this._miniCanvas.height;
ctx.fillStyle="rgba(8,14,20,0.95)";ctx.fillRect(0,0,mw,mh);
ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText("🦋 Định Tiên Du Truyền Tống",mw/2,mh/2 + 4);
return;
}
if (this.progress&&this.progress.skyMode&&this.progress.sky) {
const sk=this.progress.sky;
const mw=this._miniCanvas.width;const mh=this._miniCanvas.height;
ctx.fillStyle="rgba(10,14,24,0.95)";ctx.fillRect(0,0,mw,mh);
ctx.fillStyle="rgba(255,245,180,0.26)";ctx.fillRect(mw*0.26,0,mw*0.48,mh);
const stepNum=Math.max(1,Math.min(4,sk.stage - 1));
const pxDot=mw/2 + (sk.px / 185)*(mw*0.22);
ctx.fillStyle=sk.stage>=5?"#7ef7c4" :"#ffd700";
ctx.beginPath();ctx.arc(pxDot,mh*0.54,5,0,Math.PI*2);ctx.fill();
ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle="#ffd700";
ctx.fillText(sk.stage>=5?"🦋 Định Tiên Du Thành!" :`Luyện Tiên Cổ: ${stepNum}/4`,mw/2,14);
return;
}
if (!sc|| !this.player) return;
const mw=this._miniCanvas.width;const mh=this._miniCanvas.height;
const sx=mw / sc.width;const sy=mh / sc.height;

const bgMap={
bronze_hall:"rgba(14,12,10,0.94)",
poison_grove:"rgba(8,22,16,0.94)",
dog_forest:"rgba(12,16,24,0.94)",
bao_wasteland:"rgba(26,12,10,0.94)",
xin_temple:"rgba(22,18,10,0.94)",
outer_battlefield:"rgba(24,18,14,0.94)",
dang_hun_mountain:"rgba(30,12,38,0.94)"
};
ctx.fillStyle=bgMap[sc.id]||"rgba(12,12,16,0.94)";
ctx.fillRect(0,0,mw,mh);

if (sc.id==="bronze_hall") {
ctx.fillStyle="rgba(212,175,55,0.28)";ctx.fillRect(880*sx,580*sy,840*sx,660*sy);
ctx.fillStyle="rgba(140,114,68,0.24)";ctx.fillRect(960*sx,1380*sy,680*sx,310*sy);
} else if (sc.id==="poison_grove") {
ctx.fillStyle="rgba(56,232,168,0.28)";ctx.beginPath();ctx.ellipse(sc.pond.x*sx,sc.pond.y*sy,sc.pond.rx*sx,sc.pond.ry*sy,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="rgba(255,215,0,0.45)";ctx.beginPath();ctx.arc(sc.pavilion.x*sx,sc.pavilion.y*sy,11,0,Math.PI*2);ctx.fill();
} else if (sc.id==="dog_forest") {
ctx.fillStyle="rgba(90,169,230,0.34)";ctx.beginPath();ctx.ellipse(sc.arena.x*sx,sc.arena.y*sy,300*sx,210*sy,0,0,Math.PI*2);ctx.fill();
} else if (sc.id==="bao_wasteland") {
ctx.fillStyle="rgba(255,95,45,0.45)";ctx.fillRect(0,(sc.lavaRiver.y - sc.lavaRiver.halfH)*sy,mw,sc.lavaRiver.halfH*2*sy);
ctx.fillStyle="rgba(255,215,0,0.4)";ctx.beginPath();ctx.arc(sc.altar.x*sx,sc.altar.y*sy,14,0,Math.PI*2);ctx.fill();
} else if (sc.id==="xin_temple") {
ctx.fillStyle="rgba(247,201,72,0.32)";ctx.fillRect((sc.temple.x - 360)*sx,(sc.temple.y - 250)*sy,720*sx,470*sy);
} else if (sc.id==="outer_battlefield") {
ctx.fillStyle="rgba(255,215,0,0.28)";ctx.fillRect(880*sx,340*sy,940*sx,390*sy);
ctx.fillStyle="rgba(183,92,255,0.28)";ctx.fillRect(1960*sx,420*sy,620*sx,410*sy);
ctx.fillStyle="rgba(212,175,55,0.22)";ctx.fillRect(360*sx,1710*sy,2080*sx,220*sy);
} else if (sc.id==="dang_hun_mountain") {
ctx.fillStyle="rgba(255,155,224,0.34)";ctx.fillRect((sc.palace.x - 360)*sx,(sc.palace.y - 190)*sy,720*sx,390*sy);
ctx.fillStyle="rgba(255,215,0,0.4)";ctx.beginPath();ctx.ellipse(sc.summit.x*sx,sc.summit.y*sy,238*sx,164*sy,0,0,Math.PI*2);ctx.fill();
}

for (const ent of sc.entities) {
if (ent.dead) continue;
ctx.fillStyle=(ent.hostile||ent.enslaveActive)?"#ff5252" :(ent.id==="ba_quy"?"#ffd700" :(ent.enslaved?"#7ef7c4" :"#85c1e9"));
ctx.beginPath();ctx.arc(ent.x*sx,ent.y*sy,2.8,0,Math.PI*2);ctx.fill();
}

const objPt=this._getObjectivePointInCurrentScene();
if (objPt) {
ctx.strokeStyle="#ffd700";ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(objPt.x*sx,objPt.y*sy,5 + Math.sin(this.fx.t*6)*2,0,Math.PI*2);ctx.stroke();
}
if (!this.resonanceView) {
ctx.fillStyle="#38e8a8";ctx.beginPath();ctx.arc(this.player.x*sx,this.player.y*sy,3.8,0,Math.PI*2);ctx.fill();
}
}
});
})(window);
