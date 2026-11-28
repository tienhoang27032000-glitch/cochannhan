(function (global) {
"use strict";

// ==============================================================================
// XIANXIA PROCEDURAL + CUSTOM AUDIO BGM ENGINE (100% OFFLINE READY)
// ==============================================================================
const TRACK_INFO={
auto:{name:"Tự Động Đổi Theo Bối Cảnh",desc:"Đại Bản Doanh phát Cổ Cầm, Chiến Trường phát Chiến Cổ, Tam Vương phát Tiên Phong"},
guqin_zen:{name:"Cổ Cầm U Tĩnh (Thanh Mao Sơn)",desc:"Âm sắc cổ cầm ngũ cung êm dịu kết hợp tiếng chuông chùa xa xăm"},
battle_drums:{name:"Chiến Cổ Hào Hùng (Ngũ Vực Tranh Bá)",desc:"Nhịp trống trận dồn dập và giai điệu chiến đấu hào khí"},
immortal_wind:{name:"Tiên Phong Đạo Cốt (Phúc Địa Động Thiên)",desc:"Hòa âm huyền ảo ngân vang mang khí tức Tiên Gia thượng cổ"},
custom:{name:"Nhạc Tự Chọn Từ Máy",desc:"Phát lặp vòng tệp nhạc (.mp3/.wav/.ogg) bạn tải lên từ thiết bị"}
};

// Pentatonic note frequencies (Hz)
const N={
D3:146.83,E3:164.81,Fs3:185.00,A3:220.00,B3:246.94,
D4:293.66,E4:329.63,Fs4:369.99,A4:440.00,B4:493.88,
D5:587.33,E5:659.25,Fs5:739.99,A5:880.00,
C3:130.81,G3:196.00,C4:261.63,G4:392.00,F4:349.23,C5:523.25
};

const MELODIES={
guqin_zen:{
tempoMs:620,
bass:[N.D3,0,0,0,N.A3,0,0,0,N.B3,0,0,0,N.Fs3,0,N.A3,0],
lead:[N.D4,N.Fs4,N.A4,0,N.B4,N.A4,N.Fs4,0,N.E4,N.Fs4,N.A4,N.D5,N.B4,0,N.A4,0,N.Fs4,N.E4,N.D4,0,N.A3,N.D4,N.E4,0,N.Fs4,N.A4,N.B4,0,N.A4,N.Fs4,N.D4,0],
bellEvery:16
},
battle_drums:{
tempoMs:270,
bass:[N.D3,0,N.D3,N.D3,N.E3,0,N.A3,0,N.D3,0,N.D3,N.Fs3,N.A3,0,N.E3,0],
lead:[N.D4,0,N.A4,N.B4,N.D5,0,N.A4,0,N.Fs4,N.A4,N.B4,0,N.A4,N.Fs4,N.E4,0,N.D4,0,N.E4,N.Fs4,N.A4,0,N.B4,N.D5,N.E5,0,N.D5,N.B4,N.A4,0,N.Fs4,0],
drumPattern:[1,0,2,0,1,2,0,2,1,0,2,1,1,0,2,2]
},
immortal_wind:{
tempoMs:760,
bass:[N.C3,0,0,0,N.G3,0,0,0,N.A3,0,0,0,N.G3,0,0,0],
lead:[N.C5,0,N.G4,N.A4,N.E5,0,N.D5,0,N.C5,0,N.A4,N.G4,N.E4,0,N.G4,0,N.A4,N.C5,N.D5,0,N.E5,0,N.C5,0,N.A4,0,N.G4,0,N.E4,0,N.C4,0],
bellEvery:12
}
};

class BgmManager {
constructor() {
this.enabled=true;
this.volume=0.45;
this.trackPref="auto";
this.currentScreen="creation";
this.isPlaying=false;
this._ac=null;
this._masterGain=null;
this._timer=null;
this._step=0;
this._userUnlocked=false;
this._customAudio=null;
this._customUrl=null;
this._customName="";
this._pausedByVisibility=false;
this._bindUnlockEvents();
}

_bindUnlockEvents() {
const unlock=()=>{
this._userUnlocked=true;
if (this._ac&&this._ac.state==="suspended") {
this._ac.resume().catch(()=>{});
}
if (this.enabled&& !this.isPlaying&& !document.hidden) {
this.start();
}
};
window.addEventListener("pointerdown",unlock,{passive:true});
window.addEventListener("keydown",unlock,{passive:true});
document.addEventListener("visibilitychange",()=>{
if (document.hidden) {
if (this.isPlaying) {
this._pausedByVisibility=true;
this.pause();
}
} else if (this._pausedByVisibility) {
this._pausedByVisibility=false;
if (this.enabled) this.start();
}
});
}

_ensureAudioContext() {
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return null;
if (!this._ac) {
this._ac=new AudioCtx();
this._masterGain=this._ac.createGain();
this._masterGain.gain.setValueAtTime(this.enabled?this.volume :0.0001,this._ac.currentTime);
this._masterGain.connect(this._ac.destination);
}
if (this._ac.state==="suspended") {
this._ac.resume().catch(()=>{});
}
return this._ac;
} catch (e) {
return null;
}
}

getResolvedTrackId() {
if (this.trackPref==="custom"&&this._customAudio&&this._customUrl) return "custom";
if (this.trackPref!=="auto"&&MELODIES[this.trackPref]) return this.trackPref;
if (this.currentScreen==="battle") return "battle_drums";
if (this.currentScreen==="tk_story") return "immortal_wind";
return "guqin_zen";
}

getStatusText() {
const rid=this.getResolvedTrackId();
if (!this.enabled) return "Đang tắt";
if (rid==="custom") {
return `${this.isPlaying?"▶ Đang phát" :"⏸ Tạm dừng"}: ${this._customName||"Nhạc tùy chọn"}`;
}
const info=TRACK_INFO[rid]||TRACK_INFO.guqin_zen;
return `${this.isPlaying?"▶ Đang phát" :"⏸ Chờ chạm màn hình"}: ${info.name}`;
}

setScreen(screenName) {
if (!screenName||screenName===this.currentScreen) return;
const prevResolved=this.getResolvedTrackId();
this.currentScreen=screenName;
const nextResolved=this.getResolvedTrackId();
if (this.enabled&&this.isPlaying&&prevResolved!==nextResolved) {
this.restart();
}
}

applyConfig(cfg={}) {
const prevTrack=this.getResolvedTrackId();
if (typeof cfg.bgmEnabled==="boolean") this.enabled=cfg.bgmEnabled;
if (typeof cfg.bgmVolume==="number") this.volume=Math.max(0,Math.min(1,cfg.bgmVolume / 100));
if (typeof cfg.bgmTrack==="string") this.trackPref=cfg.bgmTrack;

this._applyVolumeLive();
const nextTrack=this.getResolvedTrackId();

if (!this.enabled) {
this.pause();
} else if (this._userUnlocked) {
if (!this.isPlaying||prevTrack!==nextTrack) {
this.restart();
}
}
}

_applyVolumeLive() {
if (this._masterGain&&this._ac) {
try {
this._masterGain.gain.setTargetAtTime(this.enabled?this.volume*0.42 :0.0001,this._ac.currentTime,0.08);
} catch (e) {}
}
if (this._customAudio) {
this._customAudio.volume=this.enabled?Math.max(0,Math.min(1,this.volume)) :0;
}
}

loadCustomFile(file) {
if (!file) return false;
try {
if (this._customUrl) {
URL.revokeObjectURL(this._customUrl);
this._customUrl=null;
}
if (this._customAudio) {
this._customAudio.pause();
this._customAudio=null;
}
const url=URL.createObjectURL(file);
const audio=new Audio(url);
audio.loop=true;
audio.volume=this.enabled?this.volume :0;
this._customUrl=url;
this._customAudio=audio;
this._customName=file.name||"Custom Track";
this.trackPref="custom";
this._userUnlocked=true;
if (this.enabled) this.restart();
return true;
} catch (e) {
return false;
}
}

clearCustomFile() {
if (this._customAudio) {
this._customAudio.pause();
this._customAudio=null;
}
if (this._customUrl) {
URL.revokeObjectURL(this._customUrl);
this._customUrl=null;
}
this._customName="";
if (this.trackPref==="custom") {
this.trackPref="auto";
}
if (this.enabled&&this.isPlaying) this.restart();
}

hasCustomFile() {
return Boolean(this._customAudio&&this._customUrl);
}

getCustomFileName() {
return this._customName||"";
}

start() {
if (!this.enabled) return;
const rid=this.getResolvedTrackId();
this.pause();
this.isPlaying=true;

if (rid==="custom"&&this._customAudio) {
this._customAudio.volume=this.volume;
this._customAudio.play().catch(()=>{this.isPlaying=false;});
return;
}

const ac=this._ensureAudioContext();
if (!ac) {this.isPlaying=false;return;}
this._applyVolumeLive();
const mel=MELODIES[rid]||MELODIES.guqin_zen;
this._step=0;
this._playStep(rid,mel);
this._timer=setInterval(()=>{
if (!this.enabled|| !this.isPlaying) return;
this._playStep(rid,mel);
},mel.tempoMs);
}

pause() {
this.isPlaying=false;
if (this._timer) {
clearInterval(this._timer);
this._timer=null;
}
if (this._customAudio) {
try {this._customAudio.pause();} catch (e) {}
}
}

restart() {
this.pause();
if (this.enabled) this.start();
}

togglePlayPause() {
this._userUnlocked=true;
if (this.isPlaying) {
this.pause();
} else {
this.enabled=true;
this.start();
}
return this.isPlaying;
}

_playStep(rid,mel) {
if (!this._ac|| !this._masterGain||this._ac.state!=="running") return;
const ac=this._ac;
const now=ac.currentTime;
const idx=this._step;
this._step +=1;

// 1. Lead Guqin / Harp plucked voice
const leadFreq=mel.lead[idx % mel.lead.length];
if (leadFreq>0) {
const osc=ac.createOscillator();
const g=ac.createGain();
osc.type=(rid==="immortal_wind")?"sine" :"triangle";
osc.frequency.setValueAtTime(leadFreq,now);
const dur=(rid==="battle_drums")?0.36 :1.35;
const peak=(rid==="battle_drums")?0.18 :0.22;
g.gain.setValueAtTime(0.0001,now);
g.gain.linearRampToValueAtTime(peak,now + 0.015);
g.gain.exponentialRampToValueAtTime(0.0001,now + dur);
osc.connect(g);g.connect(this._masterGain);
osc.start(now);osc.stop(now + dur + 0.04);

// Gentle upper harmonic shimmer for Guqin/Immortal timbre
if (rid!=="battle_drums") {
const hOsc=ac.createOscillator();
const hG=ac.createGain();
hOsc.type="sine";
hOsc.frequency.setValueAtTime(leadFreq*2,now);
hG.gain.setValueAtTime(0.0001,now);
hG.gain.linearRampToValueAtTime(0.045,now + 0.02);
hG.gain.exponentialRampToValueAtTime(0.0001,now + dur*0.7);
hOsc.connect(hG);hG.connect(this._masterGain);
hOsc.start(now);hOsc.stop(now + dur*0.75);
}
}

// 2. Warm Bass / Pad drone
const bassFreq=mel.bass[idx % mel.bass.length];
if (bassFreq>0) {
const bOsc=ac.createOscillator();
const bG=ac.createGain();
bOsc.type=(rid==="battle_drums")?"sawtooth" :"sine";
const filt=ac.createBiquadFilter();
filt.type="lowpass";
filt.frequency.setValueAtTime(rid==="battle_drums"?320 :460,now);
bOsc.frequency.setValueAtTime(bassFreq,now);
const bDur=(rid==="battle_drums")?0.42 :2.2;
bG.gain.setValueAtTime(0.0001,now);
bG.gain.linearRampToValueAtTime(rid==="battle_drums"?0.18 :0.16,now + 0.04);
bG.gain.exponentialRampToValueAtTime(0.0001,now + bDur);
bOsc.connect(filt);filt.connect(bG);bG.connect(this._masterGain);
bOsc.start(now);bOsc.stop(now + bDur + 0.05);
}

// 3. Battle Taiko Drums (battle_drums)
if (mel.drumPattern) {
const dHit=mel.drumPattern[idx % mel.drumPattern.length];
if (dHit>0) {
const dOsc=ac.createOscillator();
const dG=ac.createGain();
dOsc.type="sine";
const fStart=dHit===1?120 :190;
const fEnd=dHit===1?38 :65;
dOsc.frequency.setValueAtTime(fStart,now);
dOsc.frequency.exponentialRampToValueAtTime(fEnd,now + 0.16);
dG.gain.setValueAtTime(dHit===1?0.32 :0.16,now);
dG.gain.exponentialRampToValueAtTime(0.0001,now + 0.20);
dOsc.connect(dG);dG.connect(this._masterGain);
dOsc.start(now);dOsc.stop(now + 0.22);
}
}

// 4. Distant Temple Bell resonance (guqin_zen & immortal_wind)
if (mel.bellEvery&&(idx % mel.bellEvery===0)) {
const bell=ac.createOscillator();
const bellG=ac.createGain();
bell.type="sine";
bell.frequency.setValueAtTime(rid==="immortal_wind"?523.25 :440,now);
bellG.gain.setValueAtTime(0.0001,now);
bellG.gain.linearRampToValueAtTime(0.08,now + 0.02);
bellG.gain.exponentialRampToValueAtTime(0.0001,now + 2.4);
bell.connect(bellG);bellG.connect(this._masterGain);
bell.start(now);bell.stop(now + 2.45);
}
}
}

BgmManager.TRACK_INFO=TRACK_INFO;
const bgmInstance=new BgmManager();
global.BgmManager=BgmManager;
global.vanCoBgm=bgmInstance;
})(window);
