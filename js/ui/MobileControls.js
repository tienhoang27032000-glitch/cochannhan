(function (global) {
"use strict";
const MOBILE_MODE_STORAGE_KEY="van_co_tien_do_mobile_ui_mode";
function safeReadPref(key,fallback) {
try {
return localStorage.getItem(key)||fallback;
} catch (e) {
return fallback;
}
}
function safeWritePref(key,val) {
try {
localStorage.setItem(key,val);
} catch (e) {}
}
class MobileControls {
constructor(gameEngine) {
this.game=gameEngine;
this.isMobileActive=false;
this.modePreference=safeReadPref(MOBILE_MODE_STORAGE_KEY,"auto");
this._destroyed=false;
this.joystickPointerId=null;
this.lastMoveAngle=0;
this._joystickMetrics=null;
this._joystickPendingPos=null;
this._joystickRafId=null;
this._joystickSprinting=false;
this._canvasPointers=new Map();
this._pinchStartDist=0;
this._pinchStartZoom=1.0;
this.manualAim={
active:false,
worldX:0,
worldY:0,
expireAt:0
};
this._syncRafId=null;
this._cooldownRafId=null;
this._lastCooldownTickAt=0;
this._resizeDebounceTimer=null;
this._fsResizeTimer=null;
this._triedAutoFs=false;
this._listeners=[];
this.el={};
this._guBtnRefs=[];
this._killerBtnRefs=[];
this._hudCache={
gu:[],
killer:[],
dashText:null,
dashOpacity:null,
stoneText:null,
herbText:null,
hasTarget:null,
toastText:null
};
this._init();
}
_on(target,eventName,handler,options) {
if (!target||typeof target.addEventListener!=="function") return;
target.addEventListener(eventName,handler,options);
this._listeners.push({target,eventName,handler,options});
}
_init() {
this._injectRotateOverlay();
this._injectHubUtilities();
this._injectBattleControls();
this._injectSettingsOption();
this._bindGlobalViewportAndFocusEvents();
this._bindCanvasTouchAim();
this._evaluateMobileMode();
this.requestSync(true);
}
_detectTouchDevice() {
const hasTouch=("ontouchstart" in window)||(navigator.maxTouchPoints>0);
const smallSide=Math.min(window.innerWidth,window.innerHeight);
return hasTouch&&smallSide<=920;
}
_evaluateMobileMode() {
if (this._destroyed) return;
const prevActive=this.isMobileActive;
if (this.modePreference==="on") {
this.isMobileActive=true;
} else if (this.modePreference==="off") {
this.isMobileActive=false;
} else {
this.isMobileActive=this._detectTouchDevice();
}
document.body.classList.toggle("mobile-ui",this.isMobileActive);
this._joystickMetrics=null;
if (prevActive&& !this.isMobileActive) {
this.resetAllControls();
this._stopAllSyncLoops();
} else if (this.isMobileActive) {
this.requestSync(true);
}
if (this.game&&typeof this.game._handleResize==="function") {
this.game._handleResize();
}
}
async enterFullscreenAndLandscape() {
if (this._destroyed) return;
try {
const docEl=document.documentElement;
const reqFs=
docEl.requestFullscreen||
docEl.webkitRequestFullscreen||
docEl.mozRequestFullScreen||
docEl.msRequestFullscreen;
if (reqFs&& !document.fullscreenElement&& !document.webkitFullscreenElement) {
await reqFs.call(docEl);
}
} catch (e) {}
try {
if (screen.orientation&&typeof screen.orientation.lock==="function") {
await screen.orientation.lock("landscape");
}
} catch (e) {}
if (this._fsResizeTimer) clearTimeout(this._fsResizeTimer);
this._fsResizeTimer=setTimeout(()=>{
this._fsResizeTimer=null;
if (this._destroyed) return;
this._joystickMetrics=null;
if (this.game&&typeof this.game._handleResize==="function") {
this.game._handleResize();
}
},220);
}
async toggleFullscreen() {
const isFs=Boolean(document.fullscreenElement||document.webkitFullscreenElement);
if (!isFs) {
await this.enterFullscreenAndLandscape();
} else {
try {
const exitFs=document.exitFullscreen||document.webkitExitFullscreen;
if (exitFs) await exitFs.call(document);
} catch (e) {}
}
}
_scheduleViewportRecompute(resetControls=false) {
if (this._destroyed) return;
this._joystickMetrics=null;
if (resetControls) {
this.resetAllControls();
}
if (this._resizeDebounceTimer) {
clearTimeout(this._resizeDebounceTimer);
}
this._resizeDebounceTimer=setTimeout(()=>{
this._resizeDebounceTimer=null;
if (this._destroyed) return;
this._evaluateMobileMode();
},120);
}
_bindGlobalViewportAndFocusEvents() {
this._on(window,"orientationchange",()=>this._scheduleViewportRecompute(true));
this._on(window,"fullscreenchange",()=>this._scheduleViewportRecompute(false));
this._on(window,"webkitfullscreenchange",()=>this._scheduleViewportRecompute(false));
this._on(window,"resize",()=>this._scheduleViewportRecompute(false));
this._on(window,"blur",()=>{
this.resetAllControls();
this._stopAllSyncLoops();
});
this._on(window,"pagehide",()=>{
this.resetAllControls();
this._stopAllSyncLoops();
});
this._on(document,"visibilitychange",()=>{
if (document.hidden) {
this.resetAllControls();
this._stopAllSyncLoops();
} else if (this.isMobileActive&&this.game&&this.game.currentScreen==="battle") {
this._joystickMetrics=null;
this.requestSync(true);
}
});
this._on(document,"pointerdown",()=>{
if (
this.isMobileActive&&
this.game&&
this.game.currentScreen==="battle"&&
!document.fullscreenElement&&
!this._triedAutoFs
) {
this._triedAutoFs=true;
this.enterFullscreenAndLandscape();
}
},{passive:true});
}
onScreenChange(screenName) {
if (this._destroyed) return;
if (screenName!=="battle") {
this.resetAllControls();
this._stopAllSyncLoops();
} else if (this.isMobileActive) {
this._joystickMetrics=null;
this.requestSync(true);
}
}
_injectRotateOverlay() {
let overlay=document.getElementById("mobile-rotate-overlay");
if (!overlay) {
overlay=document.createElement("div");
overlay.id="mobile-rotate-overlay";
overlay.innerHTML=`
<div class="rotate-phone-icon">📱</div>
<h2>VẠN CỔ TIÊN ĐỒ</h2>
<p>Hãy xoay ngang điện thoại và bật chế độ Toàn Màn Hình để có tầm nhìn chiến trường rộng nhất và bố cục nút bấm hợp lý.</p>
<div class="rotate-actions">
<button id="btn-mobile-enter-landscape" class="btn-primary">⛶ Toàn Màn Hình &amp; Xoay Ngang</button>
<button id="btn-mobile-bypass-portrait" class="btn-secondary">Tạm bỏ qua (Dùng màn hình dọc)</button>
</div>
                `;
document.body.appendChild(overlay);
}
const btnEnter=overlay.querySelector("#btn-mobile-enter-landscape");
const btnBypass=overlay.querySelector("#btn-mobile-bypass-portrait");
this._on(btnEnter,"click",()=>this.enterFullscreenAndLandscape());
this._on(btnBypass,"click",()=>document.body.classList.add("ignore-portrait-lock"));
}
_injectHubUtilities() {
const topbar=document.querySelector(".hub-topbar");
const rightLog=document.querySelector(".hub-right-log");
if (!topbar) return;
let utilWrap=document.getElementById("mobile-hub-utility-btns");
if (!utilWrap) {
utilWrap=document.createElement("div");
utilWrap.id="mobile-hub-utility-btns";
utilWrap.className="mobile-hub-utility-btns";
utilWrap.innerHTML=`
<button id="btn-mobile-toggle-log" class="btn-mobile-util" title="Mở Thiên Cơ Nhật Ký">📜</button>
<button id="btn-mobile-hub-fs" class="btn-mobile-util" title="Toàn màn hình &amp; Xoay ngang">⛶</button>
                `;
topbar.appendChild(utilWrap);
}
this._on(utilWrap.querySelector("#btn-mobile-hub-fs"),"click",()=>this.toggleFullscreen());
this._on(utilWrap.querySelector("#btn-mobile-toggle-log"),"click",()=>{
if (rightLog) rightLog.classList.toggle("drawer-open");
});
if (rightLog) {
const logHeader=rightLog.querySelector(".log-header");
if (logHeader) {
let closeBtn=logHeader.querySelector("#btn-mobile-close-log");
if (!closeBtn) {
closeBtn=document.createElement("button");
closeBtn.id="btn-mobile-close-log";
closeBtn.className="btn-mini";
closeBtn.textContent="✕";
closeBtn.style.marginLeft="6px";
logHeader.appendChild(closeBtn);
}
this._on(closeBtn,"click",()=>rightLog.classList.remove("drawer-open"));
}
}
}
_injectSettingsOption() {
const keybindSelect=document.getElementById("keybind-mode-select");
if (!keybindSelect|| !keybindSelect.parentElement) return;
let group=document.getElementById("mobile-ui-mode-group");
if (!group) {
group=document.createElement("div");
group.id="mobile-ui-mode-group";
group.className="form-group";
group.innerHTML=`
<label for="mobile-ui-mode-select">Giao diện Điều Khiển Mobile (Cảm ứng &amp; Xoay ngang):</label>
<select id="mobile-ui-mode-select">
<option value="auto">Tự động nhận diện thiết bị</option>
<option value="on">Luôn bật giao diện Mobile</option>
<option value="off">Tắt (Chỉ dùng giao diện PC)</option>
</select>
                `;
keybindSelect.parentElement.insertAdjacentElement("afterend",group);
}
const selectEl=group.querySelector("#mobile-ui-mode-select");
if (selectEl) {
selectEl.value=this.modePreference;
this._on(selectEl,"change",()=>{
this.modePreference=selectEl.value;
if (global.vanCoSettings) global.vanCoSettings.set("mobileMode",this.modePreference,true);
safeWritePref(MOBILE_MODE_STORAGE_KEY,this.modePreference);
this._evaluateMobileMode();
});
}
}
_injectBattleControls() {
const battleScreen=document.getElementById("battle-screen");
if (!battleScreen) return;
const topRight=battleScreen.querySelector(".battle-hud-top-right");
if (topRight) {
let fsBtn=document.getElementById("btn-mobile-battle-fs");
if (!fsBtn) {
fsBtn=document.createElement("button");
fsBtn.id="btn-mobile-battle-fs";
fsBtn.textContent="⛶ Toàn Màn Hình";
topRight.appendChild(fsBtn);
}
this._on(fsBtn,"click",()=>this.toggleFullscreen());
}
let wrapper=document.getElementById("mobile-battle-controls");
if (!wrapper) {
wrapper=document.createElement("div");
wrapper.id="mobile-battle-controls";
const killerKeys=["Z","X","C","V"];
const killerBtnsHtml=killerKeys.map((k,idx)=>`
<button class="m-btn m-skill-btn m-killer-btn" data-mkiller="${idx}">
<span class="m-key">${k}</span>
<span class="m-icon"></span>
<span class="m-cost"></span>
<div class="m-cd-overlay"></div>
<span class="m-cd-text"></span>
</button>
                `).join("");
const guBtnsHtml=[0,1,2,3,4,5,6,7].map((idx)=>`
<button class="m-btn m-skill-btn m-gu-btn" data-mgu="${idx}">
<span class="m-key">${idx + 1}</span>
<span class="m-icon"></span>
<span class="m-cost"></span>
<div class="m-cd-overlay"></div>
<span class="m-cd-text"></span>
<div class="m-no-essence hidden">Cạn</div>
</button>
                `).join("");
wrapper.innerHTML=`
<div id="mobile-interact-toast" class="hidden"></div>

<div id="mobile-joystick-zone">
<div class="joystick-base" id="mobile-joystick-base">
<div class="joystick-knob" id="mobile-joystick-knob"></div>
</div>
<span class="joystick-hint" id="mobile-joystick-hint">Di chuyển</span>
</div>

<div id="mobile-action-cluster">
<div class="mobile-aux-column">
<div class="mobile-quick-items-row">
<button class="m-btn m-btn-small" id="m-btn-stone" title="Hấp thu Nguyên Thạch">
<span>💎</span>
<span class="m-sub" id="m-stone-count">0</span>
</button>
<button class="m-btn m-btn-small" id="m-btn-herb" title="Dùng Thảo Dược hồi máu">
<span>🌿</span>
<span class="m-sub" id="m-herb-count">0</span>
</button>
</div>

<button class="m-btn m-btn-interact" id="m-btn-interact" title="Tương tác NPC / Thu thập Cổ Tài">
<span>🤝</span>
<span class="m-sub">Tương tác</span>
</button>

<div class="mobile-move-row">
<button class="m-btn m-btn-jump" id="m-btn-jump" title="Nhảy Lên / Khinh Công Nhị Đoạn">
<span>🦘</span>
<span class="m-sub">Nhảy</span>
</button>
<button class="m-btn m-btn-dash" id="m-btn-dash" title="Phá Không Thân Pháp">
<span>💨</span>
<span class="m-sub" id="m-dash-cd">Lướt</span>
</button>
</div>
</div>

<div class="mobile-skills-panel">
<div class="mobile-killer-row">${killerBtnsHtml}</div>
<div class="mobile-gu-grid">${guBtnsHtml}</div>
</div>
</div>
                `;
battleScreen.appendChild(wrapper);
}
this.el.wrapper=wrapper;
this.el.joystickZone=wrapper.querySelector("#mobile-joystick-zone");
this.el.joystickBase=wrapper.querySelector("#mobile-joystick-base");
this.el.joystickKnob=wrapper.querySelector("#mobile-joystick-knob");
this.el.joystickHint=wrapper.querySelector("#mobile-joystick-hint");
this.el.interactToast=wrapper.querySelector("#mobile-interact-toast");
this.el.btnInteract=wrapper.querySelector("#m-btn-interact");
this.el.btnJump=wrapper.querySelector("#m-btn-jump");
this.el.btnDash=wrapper.querySelector("#m-btn-dash");
this.el.dashCdText=wrapper.querySelector("#m-dash-cd");
this.el.btnStone=wrapper.querySelector("#m-btn-stone");
this.el.btnHerb=wrapper.querySelector("#m-btn-herb");
this.el.stoneCount=wrapper.querySelector("#m-stone-count");
this.el.herbCount=wrapper.querySelector("#m-herb-count");
this.el.origPrompt=document.getElementById("interaction-prompt");
this.el.guBtns=Array.from(wrapper.querySelectorAll(".m-gu-btn"));
this.el.killerBtns=Array.from(wrapper.querySelectorAll(".m-killer-btn"));
this._guBtnRefs=this.el.guBtns.map((btn)=>({
btn,
iconEl:btn.querySelector(".m-icon"),
costEl:btn.querySelector(".m-cost"),
cdOverlay:btn.querySelector(".m-cd-overlay"),
cdText:btn.querySelector(".m-cd-text"),
noEssEl:btn.querySelector(".m-no-essence")
}));
this._killerBtnRefs=this.el.killerBtns.map((btn)=>({
btn,
iconEl:btn.querySelector(".m-icon"),
costEl:btn.querySelector(".m-cost"),
cdOverlay:btn.querySelector(".m-cd-overlay"),
cdText:btn.querySelector(".m-cd-text")
}));
this._hudCache.gu=this._guBtnRefs.map(()=>({}));
this._hudCache.killer=this._killerBtnRefs.map(()=>({}));
this._bindJoystickEvents();
this._bindBattleActionButtons();
}
_computeJoystickMetrics() {
const base=this.el.joystickBase;
if (!base) return null;
const rect=base.getBoundingClientRect();
if (rect.width<=0||rect.height<=0) return null;
this._joystickMetrics={
cx:rect.left + rect.width / 2,
cy:rect.top + rect.height / 2,
maxR:Math.max(28,rect.width*0.38)
};
return this._joystickMetrics;
}
_applyJoystickFrame() {
this._joystickRafId=null;
if (this._destroyed||this.joystickPointerId===null|| !this._joystickPendingPos) return;
const metrics=this._joystickMetrics||this._computeJoystickMetrics();
const knob=this.el.joystickKnob;
const base=this.el.joystickBase;
if (!metrics|| !knob|| !base|| !this.game|| !this.game.input) return;
let dx=this._joystickPendingPos.x - metrics.cx;
let dy=this._joystickPendingPos.y - metrics.cy;
const dist=Math.hypot(dx,dy);
const maxR=metrics.maxR;
if (dist>maxR) {
dx=(dx / dist)*maxR;
dy=(dy / dist)*maxR;
}
knob.style.transform=`translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0)`;
const normX=dx / maxR;
const normY=dy / maxR;
const magnitude=Math.min(1,dist / maxR);
const inp=this.game.input;
if (magnitude>0.14) {
this.lastMoveAngle=Math.atan2(normY,normX);
inp.analogX=normX;
inp.analogY=normY;
inp.left=normX< -0.32;
inp.right=normX>0.32;
inp.up=normY< -0.32;
inp.down=normY>0.32;
const isSprint=magnitude>=0.84;
inp.sprint=isSprint;
if (isSprint!==this._joystickSprinting) {
this._joystickSprinting=isSprint;
base.classList.toggle("sprinting",isSprint);
if (this.el.joystickHint) {
this.el.joystickHint.textContent=isSprint?"Chạy nhanh" :"Di chuyển";
}
}
} else {
this._resetJoystickInput();
if (this._joystickSprinting) {
this._joystickSprinting=false;
base.classList.remove("sprinting");
if (this.el.joystickHint) this.el.joystickHint.textContent="Di chuyển";
}
}
}
_bindJoystickEvents() {
const zone=this.el.joystickZone;
if (!zone) return;
this._on(zone,"pointerdown",(e)=>{
if (this._destroyed) return;
e.preventDefault();
if (this.joystickPointerId!==null) return;
if (!this.game||this.game.currentScreen!=="battle"||this.game.isBattlePaused||this.game.isPermadead) return;
this.joystickPointerId=e.pointerId;
this._computeJoystickMetrics();
try {
if (typeof zone.setPointerCapture==="function") {
zone.setPointerCapture(e.pointerId);
}
} catch (err) {}
this._joystickPendingPos={x:e.clientX,y:e.clientY};
this._applyJoystickFrame();
});
this._on(zone,"pointermove",(e)=>{
if (e.pointerId!==this.joystickPointerId) return;
e.preventDefault();
this._joystickPendingPos={x:e.clientX,y:e.clientY};
if (this._joystickRafId===null) {
this._joystickRafId=requestAnimationFrame(()=>this._applyJoystickFrame());
}
});
const releaseStick=(e)=>{
if (e&&e.pointerId!==undefined&&e.pointerId!==this.joystickPointerId) return;
this._releaseJoystickVisualAndInput();
};
this._on(zone,"pointerup",releaseStick);
this._on(zone,"pointercancel",releaseStick);
this._on(zone,"lostpointercapture",releaseStick);
this._on(zone,"contextmenu",(e)=>e.preventDefault());
}
_releaseJoystickVisualAndInput() {
if (this._joystickRafId!==null) {
cancelAnimationFrame(this._joystickRafId);
this._joystickRafId=null;
}
this._joystickPendingPos=null;
if (this.joystickPointerId!==null&&this.el.joystickZone) {
try {
if (typeof this.el.joystickZone.releasePointerCapture==="function") {
this.el.joystickZone.releasePointerCapture(this.joystickPointerId);
}
} catch (e) {}
}
this.joystickPointerId=null;
if (this.el.joystickKnob) {
this.el.joystickKnob.style.transform="translate3d(0px, 0px, 0)";
}
if (this._joystickSprinting&&this.el.joystickBase) {
this.el.joystickBase.classList.remove("sprinting");
}
this._joystickSprinting=false;
if (this.el.joystickHint&&this.el.joystickHint.textContent!=="Di chuyển") {
this.el.joystickHint.textContent="Di chuyển";
}
this._resetJoystickInput();
}
_resetJoystickInput() {
if (!this.game|| !this.game.input) return;
const inp=this.game.input;
inp.analogX=0;
inp.analogY=0;
inp.up=false;
inp.down=false;
inp.left=false;
inp.right=false;
inp.sprint=false;
}
resetAllControls() {
this._releaseJoystickVisualAndInput();
this._canvasPointers.clear();
this._pinchStartDist=0;
this.manualAim.active=false;
if (this.el.wrapper) {
const pressed=this.el.wrapper.querySelectorAll(".m-btn.is-pressed");
pressed.forEach(b=>b.classList.remove("is-pressed"));
}
}
_bindCanvasTouchAim() {
const canvas=document.getElementById("gameCanvas");
if (!canvas) return;
this._on(canvas,"pointerdown",(e)=>{
if (!this.game||this.game.currentScreen!=="battle"|| !this.game.map) return;
if (this.game.isBattlePaused||this.game.isPermadead) return;
this._canvasPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
if (this._canvasPointers.size===2) {
const pts=Array.from(this._canvasPointers.values());
this._pinchStartDist=Math.hypot(pts[1].x - pts[0].x,pts[1].y - pts[0].y);
this._pinchStartZoom=this.game.map.camera.zoom||1.0;
return;
}
if (!this.isMobileActive) return;
const worldPt=this.game.map.screenToWorld(e.clientX,e.clientY);
this.manualAim={
active:true,
worldX:worldPt.x,
worldY:worldPt.y,
expireAt:performance.now() + 1800
};
this.game.input.mouseX=e.clientX;
this.game.input.mouseY=e.clientY;
this.game.input.mouseWorldX=worldPt.x;
this.game.input.mouseWorldY=worldPt.y;
});
this._on(canvas,"pointermove",(e)=>{
if (!this._canvasPointers.has(e.pointerId)) return;
this._canvasPointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
if (this._canvasPointers.size===2&&this._pinchStartDist>12&&this.game&&this.game.currentScreen==="battle") {
const pts=Array.from(this._canvasPointers.values());
const curDist=Math.hypot(pts[1].x - pts[0].x,pts[1].y - pts[0].y);
const scaleFactor=curDist / this._pinchStartDist;
this.game.setBattleZoom(this._pinchStartZoom*scaleFactor,true);
}
});
const clearPtr=(e)=>{
this._canvasPointers.delete(e.pointerId);
if (this._canvasPointers.size<2) {
this._pinchStartDist=0;
}
};
this._on(canvas,"pointerup",clearPtr);
this._on(canvas,"pointercancel",clearPtr);
this._on(canvas,"lostpointercapture",clearPtr);
}
_resolveMobileAimTarget() {
const pl=this.game.player;
if (!pl) return {x:2400,y:2400};
const now=performance.now();
if (this.manualAim.active&&now<=this.manualAim.expireAt) {
this._syncCursorToWorld(this.manualAim.worldX,this.manualAim.worldY);
return {x:this.manualAim.worldX,y:this.manualAim.worldY};
}
if (this.game.enemies) {
const candidates=this.game.enemies.getHostileTargetsInRadius(pl.x,pl.y,620);
if (candidates.length>0) {
candidates.sort((a,b)=>{
const dA=Math.hypot(a.x - pl.x,a.y - pl.y) - (a.isBoss?80 :0);
const dB=Math.hypot(b.x - pl.x,b.y - pl.y) - (b.isBoss?80 :0);
return dA - dB;
});
const best=candidates[0];
this._syncCursorToWorld(best.x,best.y);
return {x:best.x,y:best.y};
}
}
const tx=pl.x + Math.cos(this.lastMoveAngle)*240;
const ty=pl.y + Math.sin(this.lastMoveAngle)*240;
this._syncCursorToWorld(tx,ty);
return {x:tx,y:ty};
}
_syncCursorToWorld(wx,wy) {
if (!this.game|| !this.game.input|| !this.game.map) return;
this.game.input.mouseWorldX=wx;
this.game.input.mouseWorldY=wy;
const scr=this.game.map.worldToScreen(wx,wy);
this.game.input.mouseX=scr.x;
this.game.input.mouseY=scr.y;
}
_bindPressVisual(btn) {
if (!btn) return;
const clearPress=()=>btn.classList.remove("is-pressed");
this._on(btn,"pointerup",clearPress);
this._on(btn,"pointercancel",clearPress);
this._on(btn,"pointerleave",clearPress);
this._on(btn,"contextmenu",(e)=>e.preventDefault());
}
_bindBattleActionButtons() {
this.el.guBtns.forEach((btn)=>{
this._bindPressVisual(btn);
this._on(btn,"pointerdown",(e)=>{
e.preventDefault();
btn.classList.add("is-pressed");
const slotIdx=parseInt(btn.getAttribute("data-mgu"),10);
const aim=this._resolveMobileAimTarget();
if (this.game&&this.game.combat) {
this.game.combat.activateGuSlot(slotIdx,aim.x,aim.y);
this.requestSync(false);
}
});
});
this.el.killerBtns.forEach((btn)=>{
this._bindPressVisual(btn);
this._on(btn,"pointerdown",(e)=>{
e.preventDefault();
btn.classList.add("is-pressed");
const kIdx=parseInt(btn.getAttribute("data-mkiller"),10);
const aim=this._resolveMobileAimTarget();
if (this.game&&this.game.combat) {
this.game.combat.activateKillerMoveSlot(kIdx,aim.x,aim.y);
this.requestSync(false);
}
});
});
if (this.el.btnJump) {
this._bindPressVisual(this.el.btnJump);
this._on(this.el.btnJump,"pointerdown",(e)=>{
e.preventDefault();
this.el.btnJump.classList.add("is-pressed");
if (this.game&&this.game.player&&typeof this.game.player.triggerJump==="function") {
const jRes=this.game.player.triggerJump(this.game.map);
if (jRes&&jRes.jumped&&jRes.isDoubleJump&&this.game.combat) {
this.game.combat._spawnParticleBurst(this.game.player.x,this.game.player.y - this.game.player.z + 10,"#7ef7c4",6);
}
}
});
}
if (this.el.btnDash) {
this._bindPressVisual(this.el.btnDash);
this._on(this.el.btnDash,"pointerdown",(e)=>{
e.preventDefault();
this.el.btnDash.classList.add("is-pressed");
if (this.game&&this.game.combat) {
this.game.player.aimAngle=this.lastMoveAngle;
this.game.combat.performPhantomDash(false);
this.requestSync(false);
}
});
}
if (this.el.btnInteract) {
this._bindPressVisual(this.el.btnInteract);
this._on(this.el.btnInteract,"pointerdown",(e)=>{
e.preventDefault();
this.el.btnInteract.classList.add("is-pressed");
if (this.game&&typeof this.game._handleInteractKeyInBattle==="function") {
this.game._handleInteractKeyInBattle();
this.requestSync(false);
}
});
}
if (this.el.btnStone) {
this._bindPressVisual(this.el.btnStone);
this._on(this.el.btnStone,"pointerdown",(e)=>{
e.preventDefault();
this.el.btnStone.classList.add("is-pressed");
const orig=document.getElementById("btn-battle-use-stone");
if (orig) orig.click();
this.requestSync(false);
});
}
if (this.el.btnHerb) {
this._bindPressVisual(this.el.btnHerb);
this._on(this.el.btnHerb,"pointerdown",(e)=>{
e.preventDefault();
this.el.btnHerb.classList.add("is-pressed");
const orig=document.getElementById("btn-battle-use-herb");
if (orig) orig.click();
this.requestSync(false);
});
}
}
_stopAllSyncLoops() {
if (this._syncRafId!==null) {
cancelAnimationFrame(this._syncRafId);
this._syncRafId=null;
}
if (this._cooldownRafId!==null) {
cancelAnimationFrame(this._cooldownRafId);
this._cooldownRafId=null;
}
}
requestSync(force=false) {
if (this._destroyed||document.hidden) return;
if (!this.isMobileActive|| !this.game||this.game.currentScreen!=="battle") return;
if (force) {
this._invalidateHudCache();
}
if (this._syncRafId!==null) return;
this._syncRafId=requestAnimationFrame(()=>{
this._syncRafId=null;
this._syncMobileBattleUI();
});
}
_invalidateHudCache() {
this._hudCache.gu=this._guBtnRefs.map(()=>({}));
this._hudCache.killer=this._killerBtnRefs.map(()=>({}));
this._hudCache.dashText=null;
this._hudCache.dashOpacity=null;
this._hudCache.stoneText=null;
this._hudCache.herbText=null;
this._hudCache.hasTarget=null;
this._hudCache.toastText=null;
}
_scheduleCooldownFollowup() {
if (this._destroyed||document.hidden||this._cooldownRafId!==null) return;
if (!this.isMobileActive|| !this.game||this.game.currentScreen!=="battle") return;
this._cooldownRafId=requestAnimationFrame((ts)=>{
this._cooldownRafId=null;
if (this._destroyed||document.hidden|| !this.isMobileActive|| !this.game||this.game.currentScreen!=="battle") {
return;
}
if (ts - this._lastCooldownTickAt>=95) {
this._lastCooldownTickAt=ts;
this._syncMobileBattleUI();
} else {
this._scheduleCooldownFollowup();
}
});
}
_syncMobileBattleUI() {
if (this._destroyed||document.hidden) return;
if (!this.isMobileActive|| !this.game||this.game.currentScreen!=="battle") return;
const guSys=this.game.guSystem;
const combat=this.game.combat;
const ap=this.game.aperture;
const pl=this.game.player;
if (!guSys|| !combat|| !ap|| !pl) return;
let anyActiveCooldown=false;
for (let idx=0;idx<this._guBtnRefs.length;idx++) {
const ref=this._guBtnRefs[idx];
const cache=this._hudCache.gu[idx];
const gu=guSys.getEquippedGuAt(idx);
if (!gu) {
if (cache.empty!==true) {
cache.empty=true;
cache.icon="";
cache.cost="";
cache.cdHeight="0%";
cache.cdText="";
cache.noEssHidden=true;
ref.btn.classList.add("empty-slot");
ref.iconEl.textContent="";
ref.costEl.textContent="";
ref.cdOverlay.style.height="0%";
ref.cdText.textContent="";
ref.noEssEl.classList.add("hidden");
}
continue;
}
if (cache.empty!==false) {
cache.empty=false;
ref.btn.classList.remove("empty-slot");
}
const iconVal=`${gu.id}_${gu.rank||1}`;
if (cache.icon!==iconVal) {
cache.icon=iconVal;
if (global.vanCoGuArt) {
ref.iconEl.innerHTML=global.vanCoGuArt.renderImgHtml(gu,30,"gu-mobile-art");
} else {
ref.iconEl.textContent=gu.icon||"";
}
}
const calc=ap.calculateEssenceCost(gu.essenceCost,gu.rank,gu.path);
const costVal=calc.isImmortalCost?`${calc.cost}T` :`${calc.cost}%`;
if (cache.cost!==costVal) {
cache.cost=costVal;
ref.costEl.textContent=costVal;
}
const cdRem=combat.getGuCooldownRemaining(gu.instanceId);
if (cdRem>0.05) anyActiveCooldown=true;
const cdPct=gu.cooldown>0?Math.min(100,Math.round((cdRem / gu.cooldown)*100)) :0;
const cdHeight=`${cdPct}%`;
if (cache.cdHeight!==cdHeight) {
cache.cdHeight=cdHeight;
ref.cdOverlay.style.height=cdHeight;
}
const cdTextVal=cdRem>0.05?cdRem.toFixed(1) :"";
if (cache.cdText!==cdTextVal) {
cache.cdText=cdTextVal;
ref.cdText.textContent=cdTextVal;
}
const enough=ap.hasEnoughEssence(gu.essenceCost,gu.rank,gu.path);
if (cache.noEssHidden!==enough) {
cache.noEssHidden=enough;
ref.noEssEl.classList.toggle("hidden",enough);
}
}
for (let idx=0;idx<this._killerBtnRefs.length;idx++) {
const ref=this._killerBtnRefs[idx];
const cache=this._hudCache.killer[idx];
const move=guSys.getEquippedKillerMoveAt(idx);
if (!move) {
if (cache.empty!==true) {
cache.empty=true;
cache.icon="";
cache.cost="";
cache.cdHeight="0%";
cache.cdText="";
ref.btn.classList.add("empty-slot");
ref.iconEl.textContent="";
ref.costEl.textContent="";
ref.cdOverlay.style.height="0%";
ref.cdText.textContent="";
}
continue;
}
if (cache.empty!==false) {
cache.empty=false;
ref.btn.classList.remove("empty-slot");
}
const iconVal=move.icon||"⚡";
if (cache.icon!==iconVal) {
cache.icon=iconVal;
ref.iconEl.textContent=iconVal;
}
const kmRank=move.moveRank||(move.isImmortal?6 :1);
const kmCalc=ap.calculateEssenceCost(move.essenceCost,kmRank,move.path);
const costVal=kmCalc.isImmortalCost?`${kmCalc.cost}T` :`${kmCalc.cost}%`;
if (cache.cost!==costVal) {
cache.cost=costVal;
ref.costEl.textContent=costVal;
}
const cdRem=combat.getKillerMoveCooldownRemaining(move.id);
if (cdRem>0.05) anyActiveCooldown=true;
const cdPct=move.cooldown>0?Math.min(100,Math.round((cdRem / move.cooldown)*100)) :0;
const cdHeight=`${cdPct}%`;
if (cache.cdHeight!==cdHeight) {
cache.cdHeight=cdHeight;
ref.cdOverlay.style.height=cdHeight;
}
const cdTextVal=cdRem>0.05?cdRem.toFixed(1) :"";
if (cache.cdText!==cdTextVal) {
cache.cdText=cdTextVal;
ref.cdText.textContent=cdTextVal;
}
}
if (combat.dashCooldown>0.05) anyActiveCooldown=true;
const dashText=combat.dashCooldown>0.05?`${combat.dashCooldown.toFixed(1)}s` :"Lướt";
const dashOpacity=combat.dashCooldown>0.05?"0.55" :"1";
if (this.el.dashCdText&&this._hudCache.dashText!==dashText) {
this._hudCache.dashText=dashText;
this.el.dashCdText.textContent=dashText;
}
if (this.el.btnDash&&this._hudCache.dashOpacity!==dashOpacity) {
this._hudCache.dashOpacity=dashOpacity;
this.el.btnDash.style.opacity=dashOpacity;
}
const stoneText=pl.primevalStones>999?"999+" :String(pl.primevalStones);
if (this.el.stoneCount&&this._hudCache.stoneText!==stoneText) {
this._hudCache.stoneText=stoneText;
this.el.stoneCount.textContent=stoneText;
}
const herbText=String(pl.getItemCount("spirit_herb") + pl.getItemCount("ration_meat"));
if (this.el.herbCount&&this._hudCache.herbText!==herbText) {
this._hudCache.herbText=herbText;
this.el.herbCount.textContent=herbText;
}
const origPrompt=this.el.origPrompt||document.getElementById("interaction-prompt");
const hasTarget=Boolean(origPrompt&& !origPrompt.classList.contains("hidden"));
if (this.el.btnInteract&&this._hudCache.hasTarget!==hasTarget) {
this._hudCache.hasTarget=hasTarget;
this.el.btnInteract.classList.toggle("active-prompt",hasTarget);
}
if (this.el.interactToast) {
if (hasTarget) {
const toastText=origPrompt.textContent.replace("Nhấn E","Chạm nút 🤝 để").trim();
if (this._hudCache.toastText!==toastText) {
this._hudCache.toastText=toastText;
this.el.interactToast.textContent=toastText;
}
this.el.interactToast.classList.remove("hidden");
} else if (this._hudCache.toastText!=="") {
this._hudCache.toastText="";
this.el.interactToast.classList.add("hidden");
}
}
if (anyActiveCooldown) {
this._scheduleCooldownFollowup();
}
}
destroy() {
if (this._destroyed) return;
this._destroyed=true;
this.resetAllControls();
this._stopAllSyncLoops();
if (this._resizeDebounceTimer) {
clearTimeout(this._resizeDebounceTimer);
this._resizeDebounceTimer=null;
}
if (this._fsResizeTimer) {
clearTimeout(this._fsResizeTimer);
this._fsResizeTimer=null;
}
for (const entry of this._listeners) {
try {
entry.target.removeEventListener(entry.eventName,entry.handler,entry.options);
} catch (e) {}
}
this._listeners=[];
}
}
global.MobileControls=MobileControls;
let _bootPollTimer=null;
window.addEventListener("DOMContentLoaded",()=>{
let attempts=0;
const waitEngine=()=>{
if (global.vanCoTienDoGame) {
_bootPollTimer=null;
if (global.vanCoMobileControls&&typeof global.vanCoMobileControls.destroy==="function") {
global.vanCoMobileControls.destroy();
}
global.vanCoMobileControls=new MobileControls(global.vanCoTienDoGame);
} else if (attempts<100) {
attempts +=1;
_bootPollTimer=setTimeout(waitEngine,60);
}
};
waitEngine();
});
window.addEventListener("unload",()=>{
if (_bootPollTimer) clearTimeout(_bootPollTimer);
if (global.vanCoMobileControls&&typeof global.vanCoMobileControls.destroy==="function") {
global.vanCoMobileControls.destroy();
}
});
})(window);
