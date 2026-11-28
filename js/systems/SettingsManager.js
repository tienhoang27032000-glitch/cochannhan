(function (global) {
"use strict";

const STORAGE_KEY="vanco_external_settings_v2";

const DEFAULT_KEYBINDS={
moveUp:"KeyW",
moveDown:"KeyS",
moveLeft:"KeyA",
moveRight:"KeyD",
sprint:"ShiftLeft",
jump:"Space",
dash:"KeyG",
interact:"KeyE",
overdrive:"KeyB",
enslave:"KeyH",
formationCycle:"KeyY",
guHouseBoard:"KeyN",
guHouseUlt:"KeyU",
openBag:"KeyI",
openAperture:"KeyO",
gu0:"Digit1",
gu1:"Digit2",
gu2:"Digit3",
gu3:"Digit4",
gu4:"Digit5",
gu5:"Digit6",
gu6:"Digit7",
gu7:"Digit8",
killer0:"KeyZ",
killer1:"KeyX",
killer2:"KeyC",
killer3:"KeyV",
tkAttack:"KeyJ",
tkSpecial:"KeyK",
tkTeleport:"KeyT"
};

const KEYBIND_GROUPS=[
{
title:"🏃 Di Chuyển & Chiến Đấu Cơ Bản",
items:[
{id:"moveUp",label:"Di chuyển Lên"},
{id:"moveDown",label:"Di chuyển Xuống"},
{id:"moveLeft",label:"Di chuyển Trái"},
{id:"moveRight",label:"Di chuyển Phải"},
{id:"sprint",label:"Chạy Nhanh (Giữ)"},
{id:"jump",label:"Nhảy Lên / Khinh Công Nhị Đoạn"},
{id:"dash",label:"Lướt Tàn Ảnh (Hoặc Chuột Phải)"},
{id:"interact",label:"Tương Tác / Nhặt Cổ Tài / Đối Thoại"},
{id:"overdrive",label:"Bộc Phát Chân Nguyên (Overdrive)"},
{id:"enslave",label:"Nô Đạo: Thu Phục Dị Thú / Thú Vương"},
{id:"formationCycle",label:"Nô Đạo: Đổi Trận Hình Thú Triều"},
{id:"guHouseBoard",label:"Tiên Cổ Ốc: Triệu Hồi / Thu Hồi"},
{id:"guHouseUlt",label:"Tiên Cổ Ốc: Đại Chiêu Trấn Phái"},
{id:"openBag",label:"Mở Nhanh Kho Đồ / Hành Trang (Mọi Map)"},
{id:"openAperture",label:"Mở Nhanh Không Khiếu & Kho Cổ (Mọi Map)"}
]
},
{
title:"🪲 8 Ô Cổ Trùng (Chiến Trường)",
items:[
{id:"gu0",label:"Ô Cổ Trùng 1"},
{id:"gu1",label:"Ô Cổ Trùng 2"},
{id:"gu2",label:"Ô Cổ Trùng 3"},
{id:"gu3",label:"Ô Cổ Trùng 4"},
{id:"gu4",label:"Ô Cổ Trùng 5"},
{id:"gu5",label:"Ô Cổ Trùng 6"},
{id:"gu6",label:"Ô Cổ Trùng 7"},
{id:"gu7",label:"Ô Cổ Trùng 8"}
]
},
{
title:"⚡ 4 Ô Sát Chiêu (Chiến Trường)",
items:[
{id:"killer0",label:"Ô Sát Chiêu 1"},
{id:"killer1",label:"Ô Sát Chiêu 2"},
{id:"killer2",label:"Ô Sát Chiêu 3"},
{id:"killer3",label:"Ô Sát Chiêu 4"}
]
},
{
title:"🦋 Cốt Truyện Tam Vương Truyền Thừa",
items:[
{id:"tkAttack",label:"Đòn Lực Đạo / Hành Động (Tam Vương)"},
{id:"tkSpecial",label:"Xung Phong / Cổ Nô Lệ / Cổ Kim Hà"},
{id:"tkTeleport",label:"Truyền Tống Địa Linh Bá Quy"}
]
}
];

const DEFAULT_SETTINGS={
// Graphics & Display
graphicsQuality:"high", // "high" | "medium" | "low"
weatherEffects:true,
vignetteEnabled:true,
floatingTextEnabled:true,
screenShakeEnabled:true,
showFps:false,
uiFontScale:100, // 90 | 100 | 110 | 120
// Audio & BGM
soundEnabled:true,
sfxVolume:80, // 0..100
uiClickSfx:true,
bgmEnabled:true,
bgmVolume:45, // 0..100
bgmTrack:"auto", // "auto" | "guqin_zen" | "battle_drums" | "immortal_wind" | "custom"
// Controls & UI
mobileMode:"auto", // "auto" | "on" | "off"
keybindMode:"hybrid", // "hybrid" | "numbers"
defaultBattleZoom:1.0, // 0.15..20.00
showMinimap:true,
showToasts:true,
// Keybinds
keybinds:{...DEFAULT_KEYBINDS},
// Save & Protection (NO difficulty or essence regen cheat sliders!)
autoSaveEnabled:true,
autoSaveInterval:8, // 5 | 8 | 15 | 30 | 60
tenExtremeSafeMode:false
};

function _formatKeyCode(code) {
if (!code) return "---";
if (code.startsWith("Key")) return code.slice(3);
if (code.startsWith("Digit")) return code.slice(5);
if (code.startsWith("Numpad")) return "Num" + code.slice(6);
const map={
Space:"SPACE",
ShiftLeft:"L-SHIFT",
ShiftRight:"R-SHIFT",
ControlLeft:"L-CTRL",
ControlRight:"R-CTRL",
AltLeft:"L-ALT",
AltRight:"R-ALT",
Tab:"TAB",
Enter:"ENTER",
Backspace:"BKSP",
ArrowUp:"↑",
ArrowDown:"↓",
ArrowLeft:"←",
ArrowRight:"→",
Backquote:"`",
Minus:"-",
Equal:"=",
BracketLeft:"[",
BracketRight:"]",
Semicolon:";",
Quote:"'",
Comma:",",
Period:".",
Slash:"/"
};
return map[code]||code;
}

class SettingsManager {
constructor() {
this.settings={...DEFAULT_SETTINGS,keybinds:{...DEFAULT_KEYBINDS}};
this.activeTab="graphics";
this._modal=null;
this._fpsBadge=null;
this._fpsRafId=null;
this._fpsFrames=0;
this._fpsLastTs=0;
this._audioCtx=null;
this._boundGlobalKeys=false;
this._listeningAction=null;
this._rebindNotice="";
this.load();
}

load() {
try {
const raw=localStorage.getItem(STORAGE_KEY)||localStorage.getItem("vanco_external_settings_v1");
if (raw) {
const parsed=JSON.parse(raw);
if (parsed&&typeof parsed==="object") {
const rawKb=(parsed.keybinds&&typeof parsed.keybinds==="object")?{...parsed.keybinds} :{};
if (!rawKb.jump&&rawKb.dash==="Space") {rawKb.dash="KeyG";rawKb.jump="Space";}
const mergedKb={...DEFAULT_KEYBINDS,...rawKb};
this.settings={...DEFAULT_SETTINGS,...parsed,keybinds:mergedKb};
// Strip legacy removed fields if migrated from v1
delete this.settings.difficulty;
delete this.settings.cultivationSpeed;
// Custom blob URLs don't survive page reload; fallback cleanly to auto
if (this.settings.bgmTrack==="custom"&&(!global.vanCoBgm|| !global.vanCoBgm.hasCustomFile())) {
this.settings.bgmTrack="auto";
}
}
}
const legacyMob=localStorage.getItem("vanco_mobile_ui_mode");
if (legacyMob&&["auto","on","off"].includes(legacyMob)&& !raw) {
this.settings.mobileMode=legacyMob;
}
} catch (e) {
this.settings={...DEFAULT_SETTINGS,keybinds:{...DEFAULT_KEYBINDS}};
}
return this.settings;
}

save() {
try {
localStorage.setItem(STORAGE_KEY,JSON.stringify(this.settings));
} catch (e) {}
}

get(key) {
if (key in this.settings) return this.settings[key];
return DEFAULT_SETTINGS[key];
}

getKeybind(action) {
if (this.settings.keybinds&&this.settings.keybinds[action]) {
return this.settings.keybinds[action];
}
return DEFAULT_KEYBINDS[action]||"";
}

formatKeyCode(code) {
return _formatKeyCode(code);
}

getKeyLabel(action) {
return _formatKeyCode(this.getKeybind(action));
}

isActionKey(action,code) {
if (!code) return false;
const bound=this.getKeybind(action);
if (code===bound) return true;
// Keep ShiftRight as natural fallback if bound to ShiftLeft (and vice versa)
if (action==="sprint"&&((bound==="ShiftLeft"&&code==="ShiftRight")||(bound==="ShiftRight"&&code==="ShiftLeft"))) {
return true;
}
return false;
}

isListeningKey() {
return Boolean(this._listeningAction);
}

getVolumeMultiplier() {
if (!this.settings.soundEnabled) return 0;
return Math.max(0,Math.min(1,(Number(this.settings.sfxVolume)||0) / 100));
}

set(key,value,silent=false) {
this.settings[key]=value;
this.save();
this.applyAll();
if (!silent&&this.settings.uiClickSfx) this.playUiSfx("click");
}

setKeybind(action,newCode) {
if (!action|| !newCode|| !(action in DEFAULT_KEYBINDS)) return;
const forbidden=["Escape","F2","F5","F11","F12"];
if (forbidden.includes(newCode)) {
this._rebindNotice=`⚠️ Phím ${_formatKeyCode(newCode)} là phím hệ thống — hãy chọn phím khác!`;
this._listeningAction=null;
this._renderActiveTabBody();
return;
}
const oldCode=this.getKeybind(action);
// Check if another action already uses newCode -> swap cleanly so no duplicates!
let swappedAction=null;
for (const k of Object.keys(this.settings.keybinds)) {
if (k!==action&&this.settings.keybinds[k]===newCode) {
this.settings.keybinds[k]=oldCode;
swappedAction=k;
break;
}
}
this.settings.keybinds[action]=newCode;
this._listeningAction=null;
this._rebindNotice=swappedAction
?`✓ Đã gán phím [${_formatKeyCode(newCode)}] (tự động hoán đổi phím trùng với hành động khác).`
:`✓ Đã gán phím [${_formatKeyCode(newCode)}] thành công!`;
this.save();
this.applyAll();
if (this.settings.uiClickSfx) this.playUiSfx("confirm");
this._renderActiveTabBody();
}

resetKeybindsOnly() {
this.settings.keybinds={...DEFAULT_KEYBINDS};
this._listeningAction=null;
this._rebindNotice="✓ Đã khôi phục toàn bộ phím bấm về mặc định!";
this.save();
this.applyAll();
if (this.settings.uiClickSfx) this.playUiSfx("confirm");
this._renderActiveTabBody();
}

resetDefaults() {
this.settings={...DEFAULT_SETTINGS,keybinds:{...DEFAULT_KEYBINDS}};
this._listeningAction=null;
this._rebindNotice="";
this.save();
this.applyAll();
this._renderActiveTabBody();
if (this.settings.uiClickSfx) this.playUiSfx("confirm");
const g=global.vanCoTienDoGame;
if (g&&g.ui&&typeof g.ui.showToast==="function") {
g.ui.showToast("⚙️ Đã khôi phục toàn bộ cài đặt về mặc định!","system");
}
}

syncBgmForScreen(screenName) {
if (global.vanCoBgm&&typeof global.vanCoBgm.setScreen==="function") {
global.vanCoBgm.setScreen(screenName);
}
}

playUiSfx(kind="click") {
if (!this.settings.soundEnabled) return;
const vol=this.getVolumeMultiplier();
if (vol<=0.01) return;
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return;
if (!this._audioCtx) this._audioCtx=new AudioCtx();
if (this._audioCtx.state==="suspended") this._audioCtx.resume();
const ac=this._audioCtx;
const now=ac.currentTime;
const osc=ac.createOscillator();
const gain=ac.createGain();
if (kind==="test") {
osc.type="triangle";
osc.frequency.setValueAtTime(440,now);
osc.frequency.exponentialRampToValueAtTime(880,now + 0.16);
gain.gain.setValueAtTime(0.0001,now);
gain.gain.linearRampToValueAtTime(0.14*vol,now + 0.02);
gain.gain.exponentialRampToValueAtTime(0.0001,now + 0.34);
osc.connect(gain);gain.connect(ac.destination);
osc.start(now);osc.stop(now + 0.36);
} else if (kind==="confirm") {
osc.type="sine";
osc.frequency.setValueAtTime(523.25,now);
osc.frequency.exponentialRampToValueAtTime(783.99,now + 0.14);
gain.gain.setValueAtTime(0.0001,now);
gain.gain.linearRampToValueAtTime(0.10*vol,now + 0.015);
gain.gain.exponentialRampToValueAtTime(0.0001,now + 0.22);
osc.connect(gain);gain.connect(ac.destination);
osc.start(now);osc.stop(now + 0.24);
} else {
osc.type="sine";
osc.frequency.setValueAtTime(580,now);
osc.frequency.exponentialRampToValueAtTime(460,now + 0.055);
gain.gain.setValueAtTime(0.0001,now);
gain.gain.linearRampToValueAtTime(0.065*vol,now + 0.01);
gain.gain.exponentialRampToValueAtTime(0.0001,now + 0.065);
osc.connect(gain);gain.connect(ac.destination);
osc.start(now);osc.stop(now + 0.075);
}
} catch (e) {}
}

applyAll() {
const s=this.settings;
const scalePct=Number(s.uiFontScale)||100;
document.documentElement.style.setProperty("--ui-font-scale",`${scalePct}%`);
if (document.body) {
document.body.style.fontSize=`${(14*scalePct/100).toFixed(1)}px`;
document.body.classList.toggle("hide-minimap-pref",!s.showMinimap);
document.body.classList.toggle("low-fx-mode",s.graphicsQuality==="low");
}

// Sync BGM Engine
if (global.vanCoBgm&&typeof global.vanCoBgm.applyConfig==="function") {
global.vanCoBgm.applyConfig({
bgmEnabled:Boolean(s.bgmEnabled),
bgmVolume:Number(s.bgmVolume)||0,
bgmTrack:s.bgmTrack||"auto"
});
}

// Sync GameEngine, UIManager & ThreeKingsStory
const g=global.vanCoTienDoGame;
if (g) {
if (g.ui) {
g.ui.keybindMode=s.keybindMode||"hybrid";
if (g.ui.dom&&g.ui.dom.keybindSelect) {
g.ui.dom.keybindSelect.value=g.ui.keybindMode;
}
if (typeof g.ui.updateKeybindLabels==="function") {
g.ui.updateKeybindLabels();
}
if (g.ui.dom&&g.ui.dom.hubAutoSaveStatus) {
g.ui.dom.hubAutoSaveStatus.textContent=s.autoSaveEnabled?`Bật (${s.autoSaveInterval}s)` :"Đang tắt";
g.ui.dom.hubAutoSaveStatus.style.color=s.autoSaveEnabled?"#5cc995" :"#ff9f43";
}
}
if (g.threeKingsStory) {
g.threeKingsStory.soundEnabled=Boolean(s.soundEnabled);
const sfxBtn=document.getElementById("tk-btn-sfx");
if (sfxBtn) sfxBtn.textContent=s.soundEnabled?"🔊" :"🔇";
if (typeof g.threeKingsStory._updateQuestHUD==="function") {
g.threeKingsStory._updateQuestHUD();
}
}
if (g.map&&g.currentScreen==="battle"&&typeof g.setBattleZoom==="function"&& !g.hasUserSetZoom) {
g.setBattleZoom(Number(s.defaultBattleZoom)||1.0,false);
}
}

// Also sync Killer Move hotbar badges directly even if UIManager hasn't booted yet
for (let k=0;k<4;k++) {
const kSlot=document.querySelector(`.killer-slot[data-kslot="${k}"] .slot-key`);
if (kSlot) kSlot.textContent=this.getKeyLabel(`killer${k}`);
}
// Sync Tam Vuong button labels if screen exists
const tkTpBtn=document.getElementById("tk-btn-tp");
if (tkTpBtn) tkTpBtn.textContent=`🐢 Truyền Tống [${this.getKeyLabel("tkTeleport")}]`;
const tkIntSmall=document.querySelector("#tk-act-interact small");
if (tkIntSmall) tkIntSmall.textContent=`Tương Tác [${this.getKeyLabel("interact")}]`;

const mc=global.vanCoMobileControls;
if (mc&&typeof mc._evaluateMobileMode==="function") {
if (mc.modePreference!==s.mobileMode) {
mc.modePreference=s.mobileMode;
try {localStorage.setItem("vanco_mobile_ui_mode",s.mobileMode);} catch (e) {}
mc._evaluateMobileMode();
}
const mobSel=document.getElementById("mobile-ui-mode-select");
if (mobSel) mobSel.value=s.mobileMode;
}

this._syncFpsCounter();
}

_syncFpsCounter() {
if (this.settings.showFps) {
if (!this._fpsBadge) {
const el=document.createElement("div");
el.id="vanco-fps-badge";
el.className="ext-fps-badge";
el.textContent="FPS: --";
document.body.appendChild(el);
this._fpsBadge=el;
}
this._fpsBadge.classList.remove("hidden");
if (!this._fpsRafId) {
this._fpsFrames=0;
this._fpsLastTs=performance.now();
const tick=(ts)=>{
if (!this.settings.showFps) {this._fpsRafId=null;return;}
this._fpsFrames +=1;
const diff=ts - this._fpsLastTs;
if (diff>=500) {
const fps=Math.round((this._fpsFrames*1000)/diff);
if (this._fpsBadge) {
this._fpsBadge.textContent=`FPS: ${fps}`;
this._fpsBadge.style.color=fps>=50?"#5cc995" :(fps>=30?"#ffd700" :"#ff5252");
}
this._fpsFrames=0;
this._fpsLastTs=ts;
}
this._fpsRafId=requestAnimationFrame(tick);
};
this._fpsRafId=requestAnimationFrame(tick);
}
} else {
if (this._fpsBadge) this._fpsBadge.classList.add("hidden");
if (this._fpsRafId) {cancelAnimationFrame(this._fpsRafId);this._fpsRafId=null;}
}
}

_ensureModal() {
if (this._modal) return this._modal;
let modal=document.getElementById("external-settings-modal");
if (!modal) {
modal=document.createElement("div");
modal.id="external-settings-modal";
modal.className="modal-backdrop hidden ext-settings-backdrop";
modal.innerHTML=`
<div class="modal-window ext-settings-window">
<div class="modal-header ext-settings-header">
<div>
<h2 style="margin:0;font-size:17.5px;color:#ffd700;">⚙️ Cài Đặt Hệ Thống — Vạn Cổ Tiên Đồ</h2>
<span class="sub-text" style="color:#7ef7f0;">Tùy chỉnh đồ họa, nhạc nền, gán phím, điều khiển & lưu trữ (tự động lưu tức thì)</span>
</div>
<button id="ext-set-close" class="btn-mini">✕ Đóng [Esc]</button>
</div>
<div class="ext-settings-tabs" id="ext-set-tabs">
<button class="ext-set-tab active" data-stab="graphics">🎨 Đồ Họa</button>
<button class="ext-set-tab" data-stab="audio">🎵 Âm Thanh & Nhạc Nền</button>
<button class="ext-set-tab" data-stab="keybinds">⌨️ Gán Phím</button>
<button class="ext-set-tab" data-stab="controls">🎮 Giao Diện</button>
<button class="ext-set-tab" data-stab="gameplay">💾 Bảo Hộ & Lưu Trữ</button>
</div>
<div class="modal-body ext-settings-body" id="ext-set-body"></div>
<div class="ext-settings-footer">
<button id="ext-set-reset" class="btn-danger" style="padding:7px 12px;font-size:12px;">↺ Khôi Phục Mặc Định</button>
<div style="display:flex;gap:8px;align-items:center;">
<span class="sub-text" style="color:#5cc995;">✓ Tự động lưu vào trình duyệt</span>
<button id="ext-set-done" class="btn-primary" style="padding:7px 16px;">Hoàn Tất</button>
</div>
</div>
</div>
`;
document.body.appendChild(modal);

modal.addEventListener("click",(e)=>{if (e.target===modal) this.close();});
modal.querySelector("#ext-set-close").addEventListener("click",()=>this.close());
modal.querySelector("#ext-set-done").addEventListener("click",()=>this.close());
modal.querySelector("#ext-set-reset").addEventListener("click",()=>{
if (confirm("Khôi phục toàn bộ cài đặt đồ họa, nhạc nền, phím bấm & lưu trữ về mặc định?\n(Không ảnh hưởng đến nhân vật và file lưu game!)")) {
this.resetDefaults();
}
});
modal.querySelectorAll(".ext-set-tab").forEach(btn=>{
btn.addEventListener("click",()=>{
this._listeningAction=null;
this._rebindNotice="";
this.activeTab=btn.getAttribute("data-stab")||"graphics";
if (this.settings.uiClickSfx) this.playUiSfx("click");
this._renderTabsChrome();
this._renderActiveTabBody();
});
});
}
this._modal=modal;
return modal;
}

isOpen() {
return Boolean(this._modal&& !this._modal.classList.contains("hidden"));
}

open(initialTab=null) {
if (initialTab) this.activeTab=initialTab;
this._listeningAction=null;
this._rebindNotice="";
this._ensureModal();
const g=global.vanCoTienDoGame;
if (g&&g.ui&&g.ui.keybindMode) this.settings.keybindMode=g.ui.keybindMode;
const mc=global.vanCoMobileControls;
if (mc&&mc.modePreference) this.settings.mobileMode=mc.modePreference;

this._renderTabsChrome();
this._renderActiveTabBody();
this._modal.classList.remove("hidden");
if (this.settings.uiClickSfx) this.playUiSfx("click");
}

close() {
this._listeningAction=null;
if (this._modal) this._modal.classList.add("hidden");
if (this.settings.uiClickSfx) this.playUiSfx("click");
}

_renderTabsChrome() {
if (!this._modal) return;
this._modal.querySelectorAll(".ext-set-tab").forEach(btn=>{
btn.classList.toggle("active",btn.getAttribute("data-stab")===this.activeTab);
});
}

_renderActiveTabBody() {
if (!this._modal) return;
const body=this._modal.querySelector("#ext-set-body");
const s=this.settings;

// ==================== TAB 1: GRAPHICS ====================
if (this.activeTab==="graphics") {
body.innerHTML=`
<div class="ext-set-list">
<div class="ext-set-row">
<div class="ext-set-info">
<strong>✨ Chất Lượng Hiệu Ứng & Hạt</strong>
<small>Giảm số hạt chiêu thức & thời tiết để tối ưu mượt cho điện thoại hoặc máy yếu.</small>
</div>
<select id="set-graphics-quality" class="ext-set-select">
<option value="high" ${s.graphicsQuality==="high"?"selected" :""}>Cao (Đầy đủ hiệu ứng)</option>
<option value="medium" ${s.graphicsQuality==="medium"?"selected" :""}>Trung Bình (Cân bằng)</option>
<option value="low" ${s.graphicsQuality==="low"?"selected" :""}>Thấp (Tiết kiệm pin / Mượt tối đa)</option>
</select>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🌧️ Hiệu Ứng Thời Tiết & Sắc Thái Bản Đồ</strong>
<small>Hiển thị mưa linh vũ, lôi bão, gió lốc và màu sắc thời tiết trên chiến trường.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-weather" ${s.weatherEffects?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🌗 Ánh Sáng Ngày/Đêm & Viền Tối (Vignette)</strong>
<small>Bật lớp tối dần theo giờ Tý–Hợi và khung viền điện ảnh khi chiến đấu.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-vignette" ${s.vignetteEnabled?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>💥 Hiện Số Sát Thương & Chữ Bay</strong>
<small>Hiển thị con số sát thương, bạo kích, né tránh và chữ nhận tài nguyên bay lên.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-floating-text" ${s.floatingTextEnabled?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>📳 Rung Màn Hình Khi Đánh & Cắt Cảnh</strong>
<small>Tạo cảm giác chấn động khi tung sát chiêu lớn hoặc xem đoạn phim Tam Vương.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-screen-shake" ${s.screenShakeEnabled?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>📊 Hiển Thị Bộ Đếm FPS</strong>
<small>Hiện tốc độ khung hình (FPS) thời gian thực ở góc trên bên trái màn hình.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-show-fps" ${s.showFps?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🔤 Cỡ Chữ Giao Diện</strong>
<small>Phóng to hoặc thu gọn cỡ chữ hiển thị trên toàn bộ bảng điều khiển.</small>
</div>
<select id="set-font-scale" class="ext-set-select">
<option value="90" ${Number(s.uiFontScale)===90?"selected" :""}>90% (Nhỏ gọn)</option>
<option value="100" ${Number(s.uiFontScale)===100?"selected" :""}>100% (Chuẩn)</option>
<option value="110" ${Number(s.uiFontScale)===110?"selected" :""}>110% (Lớn rõ)</option>
<option value="120" ${Number(s.uiFontScale)===120?"selected" :""}>120% (Rất lớn)</option>
</select>
</div>
</div>
`;
body.querySelector("#set-graphics-quality").addEventListener("change",(e)=>this.set("graphicsQuality",e.target.value));
body.querySelector("#set-weather").addEventListener("change",(e)=>this.set("weatherEffects",e.target.checked));
body.querySelector("#set-vignette").addEventListener("change",(e)=>this.set("vignetteEnabled",e.target.checked));
body.querySelector("#set-floating-text").addEventListener("change",(e)=>this.set("floatingTextEnabled",e.target.checked));
body.querySelector("#set-screen-shake").addEventListener("change",(e)=>this.set("screenShakeEnabled",e.target.checked));
body.querySelector("#set-show-fps").addEventListener("change",(e)=>this.set("showFps",e.target.checked));
body.querySelector("#set-font-scale").addEventListener("change",(e)=>this.set("uiFontScale",parseInt(e.target.value,10)||100));
return;
}

// ==================== TAB 2: AUDIO & BGM CUSTOMIZATION ====================
if (this.activeTab==="audio") {
const bgm=global.vanCoBgm;
const statusTxt=bgm?bgm.getStatusText() :"Chưa khởi tạo";
const hasCustom=bgm&&bgm.hasCustomFile();
const customName=hasCustom?bgm.getCustomFileName() :"";
const playing=Boolean(bgm&&bgm.isPlaying);

body.innerHTML=`
<div class="ext-set-list">
<div class="ext-bgm-card">
<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
<div>
<strong style="color:#ffd700;font-size:13.5px;">🎵 Trình Tùy Chỉnh Nhạc Nền Cổ Phong (BGM)</strong>
<div id="set-bgm-status" class="sub-text" style="color:#7ef7c4;margin-top:2px;">${statusTxt}</div>
</div>
<div style="display:flex;gap:6px;align-items:center;">
<button id="set-bgm-toggle-play" class="btn-primary" style="padding:5px 11px;font-size:12px;">${playing?"⏸ Tạm Dừng" :"▶ Phát Nhạc"}</button>
</div>
</div>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🎶 Bật / Tắt Nhạc Nền (BGM)</strong>
<small>Phát nhạc nền xuyên suốt Đại Bản Doanh, Chiến Trường và màn Tam Vương Truyền Thừa.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-bgm-on" ${s.bgmEnabled?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🎚️ Âm Lượng Nhạc Nền (BGM)</strong>
<small>Chỉnh độ lớn nhạc nền độc lập với hiệu ứng chiêu thức (SFX).</small>
</div>
<div class="ext-slider-wrap">
<input type="range" id="set-bgm-vol" min="0" max="100" step="5" value="${s.bgmVolume}">
<strong id="set-bgm-vol-lbl" style="color:#7ef7c4;min-width:40px;text-align:right;">${s.bgmVolume}%</strong>
</div>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🎼 Chọn Chủ Đề Nhạc Nền</strong>
<small>Chọn phát tự động đổi theo bản đồ, chọn cố định một giai điệu Cổ Phong, hoặc dùng file nhạc riêng của bạn.</small>
</div>
<select id="set-bgm-track" class="ext-set-select">
<option value="auto" ${s.bgmTrack==="auto"?"selected" :""}>✨ Tự Động Đổi Theo Bối Cảnh</option>
<option value="guqin_zen" ${s.bgmTrack==="guqin_zen"?"selected" :""}>🪕 Cổ Cầm U Tĩnh (Thanh Mao Sơn)</option>
<option value="battle_drums" ${s.bgmTrack==="battle_drums"?"selected" :""}>🥁 Chiến Cổ Hào Hùng (Chiến Trường)</option>
<option value="immortal_wind" ${s.bgmTrack==="immortal_wind"?"selected" :""}>🎐 Tiên Phong Đạo Cốt (Phúc Địa)</option>
<option value="custom" ${s.bgmTrack==="custom"?"selected" :""} ${hasCustom?"" :"disabled"}>📂 Nhạc Tự Chọn Từ Máy${hasCustom?` (${customName.slice(0,18)})` :" (Chưa tải)"}</option>
</select>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>📂 Tải Nhạc Nền Riêng Từ Thiết Bị (.mp3 / .wav / .ogg)</strong>
<small>${hasCustom?`Đang nạp: <strong style="color:#ffd700;">${customName}</strong> (phát lặp vòng liên tục)` :"Chọn bất kỳ bản nhạc yêu thích nào trong máy để làm nhạc nền riêng trong phiên chơi."}</small>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
<input type="file" id="set-bgm-file-input" accept="audio/*" style="display:none;">
<button id="set-bgm-upload" class="btn-accent" style="padding:6px 11px;font-size:12px;">📁 Chọn File Nhạc</button>
${hasCustom?`<button id="set-bgm-clear-custom" class="btn-danger" style="padding:6px 10px;font-size:12px;">✕ Gỡ</button>` :""}
</div>
</div>

<hr style="border:none;border-top:1px solid rgba(184,151,88,0.28);margin:2px 0;">

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🔊 Bật / Tắt Âm Thanh Hiệu Ứng (SFX)</strong>
<small>Kiểm soát tiếng chiêu thức, truyền tống, chuông đồng & đoạn phim điện ảnh.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-sound-on" ${s.soundEnabled?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🎚️ Âm Lượng Hiệu Ứng (SFX)</strong>
<small>Điều chỉnh độ lớn âm thanh hành động & đoạn phim.</small>
</div>
<div class="ext-slider-wrap">
<input type="range" id="set-sfx-vol" min="0" max="100" step="5" value="${s.sfxVolume}">
<strong id="set-sfx-vol-lbl" style="color:#ffd700;min-width:40px;text-align:right;">${s.sfxVolume}%</strong>
</div>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🔔 Âm Thanh Khi Bấm Nút & Kiểm Tra</strong>
<small>Phát tiếng chuông nhẹ khi thao tác cài đặt.</small>
</div>
<div style="display:flex;gap:10px;align-items:center;">
<label class="ext-switch"><input type="checkbox" id="set-ui-sfx" ${s.uiClickSfx?"checked" :""}><span></span></label>
<button id="set-test-sfx" class="btn-secondary" style="padding:5px 10px;font-size:12px;">🔊 Thử SFX</button>
</div>
</div>
</div>
`;

const refreshBgmStatus=()=>{
const stEl=body.querySelector("#set-bgm-status");
const pBtn=body.querySelector("#set-bgm-toggle-play");
if (stEl&&bgm) stEl.textContent=bgm.getStatusText();
if (pBtn&&bgm) pBtn.textContent=bgm.isPlaying?"⏸ Tạm Dừng" :"▶ Phát Nhạc";
};

body.querySelector("#set-bgm-on").addEventListener("change",(e)=>{
this.set("bgmEnabled",e.target.checked);
if (e.target.checked&&bgm) {bgm._userUnlocked=true;bgm.start();}
refreshBgmStatus();
});
const bgmVol=body.querySelector("#set-bgm-vol");
const bgmVolLbl=body.querySelector("#set-bgm-vol-lbl");
bgmVol.addEventListener("input",(e)=>{
const v=parseInt(e.target.value,10)||0;
if (bgmVolLbl) bgmVolLbl.textContent=`${v}%`;
this.set("bgmVolume",v,true);
});
body.querySelector("#set-bgm-track").addEventListener("change",(e)=>{
this.set("bgmTrack",e.target.value);
if (bgm&&this.settings.bgmEnabled) {bgm._userUnlocked=true;bgm.restart();}
refreshBgmStatus();
});
body.querySelector("#set-bgm-toggle-play").addEventListener("click",()=>{
if (!bgm) return;
const nowPlaying=bgm.togglePlayPause();
this.settings.bgmEnabled=nowPlaying;
this.save();
const sw=body.querySelector("#set-bgm-on");
if (sw) sw.checked=nowPlaying;
refreshBgmStatus();
});
const fileInput=body.querySelector("#set-bgm-file-input");
body.querySelector("#set-bgm-upload").addEventListener("click",()=>fileInput.click());
fileInput.addEventListener("change",(e)=>{
const f=e.target.files&&e.target.files[0];
if (f&&bgm) {
const ok=bgm.loadCustomFile(f);
if (ok) {
this.settings.bgmEnabled=true;
this.settings.bgmTrack="custom";
this.save();
this.applyAll();
this._renderActiveTabBody();
}
}
});
const clearBtn=body.querySelector("#set-bgm-clear-custom");
if (clearBtn) {
clearBtn.addEventListener("click",()=>{
if (bgm) bgm.clearCustomFile();
this.settings.bgmTrack="auto";
this.save();
this.applyAll();
this._renderActiveTabBody();
});
}

body.querySelector("#set-sound-on").addEventListener("change",(e)=>this.set("soundEnabled",e.target.checked));
const volSlider=body.querySelector("#set-sfx-vol");
const volLbl=body.querySelector("#set-sfx-vol-lbl");
volSlider.addEventListener("input",(e)=>{
const v=parseInt(e.target.value,10)||0;
if (volLbl) volLbl.textContent=`${v}%`;
this.set("sfxVolume",v,true);
});
volSlider.addEventListener("change",()=>this.playUiSfx("test"));
body.querySelector("#set-ui-sfx").addEventListener("change",(e)=>this.set("uiClickSfx",e.target.checked));
body.querySelector("#set-test-sfx").addEventListener("click",()=>this.playUiSfx("test"));
return;
}

// ==================== TAB 3: INTERACTIVE KEYBIND REMAPPING ====================
if (this.activeTab==="keybinds") {
const groupsHtml=KEYBIND_GROUPS.map(grp=>`
<div class="ext-kb-group">
<div class="ext-kb-group-title">${grp.title}</div>
<div class="ext-kb-grid">
${grp.items.map(it=>{
const isListening=(this._listeningAction===it.id);
const curLabel=this.getKeyLabel(it.id);
return `
<div class="ext-kb-item">
<span class="ext-kb-label">${it.label}</span>
<button class="ext-kb-btn ${isListening?"listening" :""}" data-action="${it.id}">
${isListening?"⌨️ Nhấn phím... (Esc hủy)" :`[${curLabel}]`}
</button>
</div>`;
}).join("")}
</div>
</div>
`).join("");

body.innerHTML=`
<div class="ext-kb-toolbar">
<div>
<strong style="color:#ffd700;font-size:13px;">⌨️ Tùy Chỉnh Gán Phím Bất Kỳ</strong>
<div class="sub-text" style="color:${this._rebindNotice?"#7ef7c4" :"#b3aa9c"};margin-top:2px;">
${this._rebindNotice||"Bấm vào ô phím muốn đổi rồi nhấn phím mới trên bàn phím. Nếu trùng phím, hệ thống tự động hoán đổi!"}
</div>
</div>
<button id="set-kb-reset" class="btn-secondary" style="padding:6px 11px;font-size:11.5px;white-space:nowrap;">↺ Phím Mặc Định</button>
</div>
<div class="ext-set-row" style="margin-bottom:10px;">
<div class="ext-set-info">
<strong>⚡ Phím Phụ Hỗ Trợ Ô Cổ Trùng (Q, R, T, F)</strong>
<small>Ngoài phím tự gán bên dưới, cho phép dùng thêm Q (Ô 1), R (Ô 3), T (Ô 4), F (Ô 8) trên chiến trường.</small>
</div>
<select id="set-keybind-mode-kb" class="ext-set-select">
<option value="hybrid" ${s.keybindMode==="hybrid"?"selected" :""}>Bật phím phụ (Q, R, T, F)</option>
<option value="numbers" ${s.keybindMode==="numbers"?"selected" :""}>Tắt (Chỉ dùng phím đã gán)</option>
</select>
</div>
${groupsHtml}
`;

body.querySelector("#set-kb-reset").addEventListener("click",()=>this.resetKeybindsOnly());
body.querySelector("#set-keybind-mode-kb").addEventListener("change",(e)=>this.set("keybindMode",e.target.value));
body.querySelectorAll(".ext-kb-btn").forEach(btn=>{
btn.addEventListener("click",()=>{
const act=btn.getAttribute("data-action");
this._listeningAction=(this._listeningAction===act)?null :act;
this._rebindNotice=this._listeningAction?"⌨️ Đang chờ nhận phím mới... (Nhấn Esc để hủy)" :"";
if (this.settings.uiClickSfx) this.playUiSfx("click");
this._renderActiveTabBody();
});
});
return;
}

// ==================== TAB 4: CONTROLS & UI ====================
if (this.activeTab==="controls") {
const zoomPct=Math.round((Number(s.defaultBattleZoom)||1.0)*100);
body.innerHTML=`
<div class="ext-set-list">
<div class="ext-set-row">
<div class="ext-set-info">
<strong>📱 Chế Độ Giao Diện Thiết Bị (Mobile / PC)</strong>
<small>Chuyển đổi giữa giao diện phím cảm ứng Mobile (Joystick + Nút chiêu) và giao diện PC.</small>
</div>
<select id="set-mobile-mode" class="ext-set-select">
<option value="auto" ${s.mobileMode==="auto"?"selected" :""}>Tự động nhận diện thiết bị</option>
<option value="on" ${s.mobileMode==="on"?"selected" :""}>Luôn bật giao diện Mobile (Cảm ứng)</option>
<option value="off" ${s.mobileMode==="off"?"selected" :""}>Luôn dùng giao diện PC (Chuột & Phím)</option>
</select>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🔍 Tầm Nhìn Camera Chiến Đấu Mặc Định</strong>
<small>Mức phóng to / thu nhỏ bản đồ khi bước vào chiến trường (thu nhỏ giúp nhìn bao quát rộng hơn).</small>
</div>
<div class="ext-slider-wrap" style="flex-wrap:wrap;justify-content:flex-end;">
<input type="range" id="set-default-zoom" min="15" max="2000" step="5" value="${zoomPct}">
<strong id="set-default-zoom-lbl" style="color:#7ef7f0;min-width:54px;text-align:right;">${zoomPct}%</strong>
<div style="display:flex;gap:4px;width:100%;justify-content:flex-end;margin-top:4px;">
<button class="btn-mini set-zoom-preset" data-zpct="25">25%</button>
<button class="btn-mini set-zoom-preset" data-zpct="100">100%</button>
<button class="btn-mini set-zoom-preset" data-zpct="500">500%</button>
<button class="btn-mini set-zoom-preset" data-zpct="2000">2000%</button>
</div>
</div>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>🗺️ Hiển Thị Bản Đồ Nhỏ (Minimap)</strong>
<small>Bật hoặc ẩn khung Minimap ở góc phải màn hình chiến đấu và cốt truyện Tam Vương.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-show-minimap" ${s.showMinimap?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>💬 Hiển Thị Thông Báo Nổi (Toast)</strong>
<small>Hiện pop-up báo nhặt đồ, đột phá và sự kiện ở góc trên phải màn hình.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-show-toasts" ${s.showToasts?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>⛶ Chế Độ Toàn Màn Hình Trình Duyệt</strong>
<small>Mở rộng trò chơi toàn màn hình để tăng không gian quan sát (khuyên dùng trên điện thoại).</small>
</div>
<button id="set-toggle-fs" class="btn-primary" style="padding:6px 12px;font-size:12px;">⛶ Bật / Tắt Toàn Màn Hình</button>
</div>
</div>
`;
body.querySelector("#set-mobile-mode").addEventListener("change",(e)=>this.set("mobileMode",e.target.value));
const zSlider=body.querySelector("#set-default-zoom");
const zLbl=body.querySelector("#set-default-zoom-lbl");
const applyZoomPct=(pct)=>{
const clampedPct=Math.max(15,Math.min(2000,parseInt(pct,10)||100));
if (zSlider) zSlider.value=String(clampedPct);
if (zLbl) zLbl.textContent=`${clampedPct}%`;
const zVal=Number((clampedPct / 100).toFixed(2));
this.settings.defaultBattleZoom=zVal;
this.save();
const g=global.vanCoTienDoGame;
if (g&&g.currentScreen==="battle"&&typeof g.setBattleZoom==="function") {
g.setBattleZoom(zVal,false);
}
};
zSlider.addEventListener("input",(e)=>applyZoomPct(e.target.value));
body.querySelectorAll(".set-zoom-preset").forEach(btn=>{
btn.addEventListener("click",()=>applyZoomPct(btn.getAttribute("data-zpct")));
});
body.querySelector("#set-show-minimap").addEventListener("change",(e)=>this.set("showMinimap",e.target.checked));
body.querySelector("#set-show-toasts").addEventListener("change",(e)=>this.set("showToasts",e.target.checked));
body.querySelector("#set-toggle-fs").addEventListener("click",()=>{
if (global.vanCoMobileControls&&typeof global.vanCoMobileControls.toggleFullscreen==="function") {
global.vanCoMobileControls.toggleFullscreen();
return;
}
try {
if (!document.fullscreenElement&&document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
else if (document.fullscreenElement&&document.exitFullscreen) document.exitFullscreen();
} catch (e) {}
});
return;
}

// ==================== TAB 5: PROTECTION & AUTO-SAVE (PURE CANONICAL — NO DIFFICULTY/REGEN!) ====================
if (this.activeTab==="gameplay") {
body.innerHTML=`
<div class="ext-set-list">
<div class="ext-set-row">
<div class="ext-set-info">
<strong>🛡️ Bảo Hộ Thập Tuyệt Thể (Chống Bạo Tạc Chết Hẳn)</strong>
<small>Nếu bật, áp lực Không Khiếu của Thập Tuyệt Thể tối đa chỉ dừng ở 99% thay vì tự bạo xóa nhân vật.</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-ten-safe" ${s.tenExtremeSafeMode?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>☁️ Tự Động Lưu Định Kỳ (Auto-Save)</strong>
<small>Tự động sao lưu vào vùng nhớ Auto-Save trình duyệt (không ghi đè 3 Ô Lưu Thủ Công).</small>
</div>
<label class="ext-switch"><input type="checkbox" id="set-autosave-on" ${s.autoSaveEnabled?"checked" :""}><span></span></label>
</div>

<div class="ext-set-row">
<div class="ext-set-info">
<strong>⏱️ Chu Kỳ Tự Động Lưu</strong>
<small>Khoảng thời gian giữa các lần Auto-Save tự động khi đang chơi.</small>
</div>
<select id="set-autosave-int" class="ext-set-select" ${s.autoSaveEnabled?"" :"disabled"}>
<option value="5" ${Number(s.autoSaveInterval)===5?"selected" :""}>Mỗi 5 giây</option>
<option value="8" ${Number(s.autoSaveInterval)===8?"selected" :""}>Mỗi 8 giây (Mặc định)</option>
<option value="15" ${Number(s.autoSaveInterval)===15?"selected" :""}>Mỗi 15 giây</option>
<option value="30" ${Number(s.autoSaveInterval)===30?"selected" :""}>Mỗi 30 giây</option>
<option value="60" ${Number(s.autoSaveInterval)===60?"selected" :""}>Mỗi 60 giây</option>
</select>
</div>
</div>
`;
body.querySelector("#set-ten-safe").addEventListener("change",(e)=>this.set("tenExtremeSafeMode",e.target.checked));
body.querySelector("#set-autosave-on").addEventListener("change",(e)=>{
this.set("autoSaveEnabled",e.target.checked);
const intSel=body.querySelector("#set-autosave-int");
if (intSel) intSel.disabled= !e.target.checked;
});
body.querySelector("#set-autosave-int").addEventListener("change",(e)=>{
const sec=parseInt(e.target.value,10)||8;
this.set("autoSaveInterval",sec);
const g=global.vanCoTienDoGame;
if (g) g.autoSaveTimer=sec;
});
}
}

initDomBindings() {
this.applyAll();
const bindBtn=(id)=>{
const el=document.getElementById(id);
if (el&& !el.dataset.extSetBound) {
el.dataset.extSetBound="1";
el.addEventListener("click",()=>this.open());
}
};
bindBtn("btn-open-external-settings-top");
bindBtn("btn-open-external-settings-form");
bindBtn("btn-open-external-settings-hub");
bindBtn("btn-open-external-settings-battle");

if (!this._boundGlobalKeys) {
this._boundGlobalKeys=true;
window.addEventListener("keydown",(e)=>{
// Capture new key when user is rebinding in the Keybinds tab!
if (this._listeningAction&&this.isOpen()) {
e.preventDefault();
e.stopImmediatePropagation();
if (e.code==="Escape") {
this._listeningAction=null;
this._rebindNotice="Đã hủy đổi phím.";
this._renderActiveTabBody();
return;
}
this.setKeybind(this._listeningAction,e.code);
return;
}
if (e.code==="F2") {
e.preventDefault();
if (this.isOpen()) this.close();
else this.open();
return;
}
if (e.code==="Escape"&&this.isOpen()) {
e.preventDefault();
e.stopImmediatePropagation();
this.close();
}
},true);
}
}
}

SettingsManager.DEFAULT_KEYBINDS=DEFAULT_KEYBINDS;
const instance=new SettingsManager();
global.SettingsManager=SettingsManager;
global.vanCoSettings=instance;

if (document.readyState==="loading") {
document.addEventListener("DOMContentLoaded",()=>instance.initDomBindings());
} else {
instance.initDomBindings();
}
})(window);
