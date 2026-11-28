(function (global) {
"use strict";
class SfxManager {
constructor() {this._ctx=null;this._lastPlayed={};}
_getCtx() {
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return null;
if (!this._ctx) this._ctx=new AudioCtx();
if (this._ctx.state==="suspended") this._ctx.resume();
return this._ctx;
} catch (e) {return null;}
}
play(kind="click") {
const st=global.vanCoSettings;
if (st&& !st.get("soundEnabled")) return;
const vol=st?st.getVolumeMultiplier() :0.75;
if (vol<=0.01) return;
const nowMs=performance.now();
if (this._lastPlayed[kind]&&nowMs - this._lastPlayed[kind]<55) return;
this._lastPlayed[kind]=nowMs;
const ac=this._getCtx();
if (!ac) return;
const now=ac.currentTime;
const tone=(f0,f1,dur,type="sine",v=0.09,delay=0)=>{
try {
const o=ac.createOscillator();const g=ac.createGain();
o.type=type;o.frequency.setValueAtTime(f0,now + delay);
if (f1) o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),now + delay + dur);
g.gain.setValueAtTime(0.0001,now + delay);
g.gain.linearRampToValueAtTime(Math.max(0.0001,v*vol),now + delay + 0.012);
g.gain.exponentialRampToValueAtTime(0.0001,now + delay + dur);
o.connect(g);g.connect(ac.destination);
o.start(now + delay);o.stop(now + delay + dur + 0.03);
} catch (e) {}
};
if (kind==="click") {tone(560,720,0.05,"triangle",0.05);}
else if (kind==="tab") {tone(420,580,0.06,"sine",0.05);}
else if (kind==="jump") {tone(310,640,0.11,"sine",0.08);}
else if (kind==="dash") {tone(260,820,0.13,"triangle",0.09);}
else if (kind==="reaction") {tone(520,1040,0.18,"triangle",0.11,0);tone(780,1320,0.20,"sine",0.09,0.05);}
else if (kind==="breakthrough") {tone(440,554,0.16,"triangle",0.11,0);tone(554,659,0.16,"triangle",0.11,0.08);tone(659,880,0.34,"sine",0.13,0.16);}
else if (kind==="refine_ok") {tone(523,659,0.14,"triangle",0.11,0);tone(784,1046,0.28,"sine",0.12,0.08);}
else if (kind==="refine_fail") {tone(240,120,0.24,"sawtooth",0.09);}
else if (kind==="victory") {tone(523,523,0.15,"triangle",0.12,0);tone(659,659,0.15,"triangle",0.12,0.08);tone(784,1046,0.38,"triangle",0.14,0.16);}
}
}
global.SfxManager=SfxManager;
global.vanCoSfx=new SfxManager();
})(window);
