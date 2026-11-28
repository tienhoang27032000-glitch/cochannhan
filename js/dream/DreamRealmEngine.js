(function (global) {
"use strict";

class DreamRealmEngine {
constructor(game) {
this.game=game||null;
this._screen=null;
this._canvas=null;
this._ctx=null;
this._rafId=null;
this._lastTs=0;
this._audioCtx=null;
this.active=false;
this.currentDream=null;
this.currentCfg=null;
this.trial=null;
this.keys={};
this._ptrDown=false;
this._hudTick=0;
this._boundEvents=false;
}

playSfx(kind="star") {
const st=global.vanCoSettings;
if (st&& !st.get("soundEnabled")) return;
const vol=st?st.getVolumeMultiplier() :0.8;
if (vol<=0.01) return;
try {
const AudioCtx=window.AudioContext||window.webkitAudioContext;
if (!AudioCtx) return;
if (!this._audioCtx) this._audioCtx=new AudioCtx();
if (this._audioCtx.state==="suspended") this._audioCtx.resume();
const ac=this._audioCtx;
const now=ac.currentTime;
const tone=(f0,f1,dur,type,v,delay=0)=>{
const o=ac.createOscillator();const g=ac.createGain();
o.type=type;o.frequency.setValueAtTime(f0,now + delay);
if (f1) o.frequency.exponentialRampToValueAtTime(f1,now + delay + dur);
g.gain.setValueAtTime(0.0001,now + delay);
g.gain.linearRampToValueAtTime(Math.max(0.0001,v*vol),now + delay + 0.015);
g.gain.exponentialRampToValueAtTime(0.0001,now + delay + dur);
o.connect(g);g.connect(ac.destination);
o.start(now + delay);o.stop(now + delay + dur + 0.03);
};
if (kind==="star") {tone(587,880,0.14,"triangle",0.11);}
else if (kind==="chime") {tone(523,1046,0.28,"sine",0.13);tone(784,1174,0.24,"triangle",0.09,0.06);}
else if (kind==="dash") {tone(320,760,0.12,"sine",0.10);}
else if (kind==="hit") {tone(190,70,0.18,"sawtooth",0.14);}
else if (kind==="victory") {tone(523,523,0.18,"triangle",0.12,0);tone(659,659,0.18,"triangle",0.12,0.09);tone(784,1046,0.36,"triangle",0.14,0.18);}
else if (kind==="fail") {tone(320,160,0.32,"sawtooth",0.11);}
} catch (e) {}
}

_ensureDOM() {
if (this._screen) return this._screen;
let scr=document.getElementById("dream-realm-screen");
if (!scr) {
scr=document.createElement("div");
scr.id="dream-realm-screen";
scr.className="dream-realm-screen hidden";
scr.innerHTML=`
<div class="dream-topbar">
<div class="dream-top-title">
<strong id="dream-title-lbl" style="color:#ffd700;font-size:15px;">🌙 Mộng Cảnh</strong>
<span id="dream-sub-lbl" class="sub-text" style="color:#7ef7f0;"></span>
</div>
<div class="dream-top-stats">
<span id="dream-hud-left" class="badge" style="border-color:#7ef7c4;color:#7ef7c4;"></span>
<span id="dream-hud-right" class="badge" style="border-color:#ffd700;color:#ffd700;"></span>
<button id="dream-btn-exit" class="btn-danger" style="padding:5px 10px;font-size:11.5px;">🏃 Thoát Mộng</button>
</div>
</div>
<div class="dream-stage-wrap">
<canvas id="dreamRealmCanvas" width="860" height="540"></canvas>
<div id="dream-intro-overlay" class="dream-overlay-card">
<h2 id="dream-intro-title" style="color:#ffd700;margin:0 0 8px 0;"></h2>
<p id="dream-intro-quote" style="font-style:italic;color:#f2e9d8;line-height:1.5;margin-bottom:10px;"></p>
<p id="dream-intro-rule" class="sub-text" style="color:#7ef7f0;margin-bottom:14px;"></p>
<button id="dream-btn-begin" class="btn-primary" style="padding:9px 22px;font-size:14px;">🌙 Nhập Mộng Bắt Đầu!</button>
</div>
<div id="dream-result-overlay" class="dream-overlay-card hidden">
<h2 id="dream-res-title" style="margin:0 0 8px 0;"></h2>
<div id="dream-res-grade" style="font-size:24px;font-weight:bold;color:#ffd700;margin-bottom:6px;"></div>
<p id="dream-res-summary" style="color:#e6dfd5;margin-bottom:8px;"></p>
<p id="dream-res-reward" style="color:#7ef7c4;font-weight:bold;margin-bottom:14px;"></p>
<button id="dream-btn-return" class="btn-primary" style="padding:8px 22px;">↩️ Quay Về Đại Bản Doanh</button>
</div>
</div>
<div id="dream-action-bar" class="dream-action-bar"></div>
`;
document.body.appendChild(scr);
}
this._screen=scr;
this._canvas=scr.querySelector("#dreamRealmCanvas");
this._ctx=this._canvas.getContext("2d",{alpha:false})||this._canvas.getContext("2d");

if (!this._boundEvents) {
this._boundEvents=true;
scr.querySelector("#dream-btn-exit").addEventListener("click",()=>{
if (!this.active) return;
if (this.trial&& !this.trial.finished&&scr.querySelector("#dream-intro-overlay").classList.contains("hidden")) {
this.finishTrial({success:false,grade:"C",bonusMult:0.30,summary:"Chủ động rút hồn khỏi Mộng Cảnh sớm — giữ lại 30% cảm ngộ."});
} else {
this.close();
}
});
scr.querySelector("#dream-btn-begin").addEventListener("click",()=>{
scr.querySelector("#dream-intro-overlay").classList.add("hidden");
this._lastTs=performance.now();
this.playSfx("chime");
if (!this._rafId) this._rafId=requestAnimationFrame((ts)=>this._loop(ts));
});
scr.querySelector("#dream-btn-return").addEventListener("click",()=>this.close());

const toLogical=(e)=>{
const rect=this._canvas.getBoundingClientRect();
const cx=(e.touches&&e.touches[0])?e.touches[0].clientX :e.clientX;
const cy=(e.touches&&e.touches[0])?e.touches[0].clientY :e.clientY;
return {
x:((cx - rect.left) / Math.max(1,rect.width))*860,
y:((cy - rect.top) / Math.max(1,rect.height))*540
};
};
this._canvas.addEventListener("pointerdown",(e)=>{
if (!this.active|| !this.trial) return;
e.preventDefault();
this._ptrDown=true;
const pt=toLogical(e);
if (typeof this.trial.onPointerDown==="function") this.trial.onPointerDown(pt.x,pt.y);
});
this._canvas.addEventListener("pointermove",(e)=>{
if (!this.active|| !this.trial) return;
const pt=toLogical(e);
if (typeof this.trial.onPointerMove==="function") this.trial.onPointerMove(pt.x,pt.y,this._ptrDown);
});
const endPtr=()=>{
this._ptrDown=false;
if (this.trial&&typeof this.trial.onPointerUp==="function") this.trial.onPointerUp();
};
window.addEventListener("pointerup",endPtr);
window.addEventListener("pointercancel",endPtr);

window.addEventListener("keydown",(e)=>{
if (!this.active) return;
if (global.vanCoSettings&&global.vanCoSettings.isOpen()) return;
this.keys[e.code]=true;
if (e.code==="Escape") {
e.preventDefault();
this.close();
return;
}
if (this.trial&& !this.trial.finished&&typeof this.trial.onKeyDown==="function") {
if (["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) e.preventDefault();
this.trial.onKeyDown(e.code);
}
});
window.addEventListener("keyup",(e)=>{this.keys[e.code]=false;});
}
return scr;
}

open(dreamId) {
const g=this.game;
if (!g|| !g.player|| !g.aperture) return {success:false,message:"Hệ thống chưa sẵn sàng."};
const dreams=(global.PlayerManager&&global.PlayerManager.DREAM_REALMS)||[];
const dream=dreams.find(d=>d.id===dreamId);
if (!dream) return {success:false,message:"Không tìm thấy Mộng Cảnh này."};
const rank=g.aperture.rank||1;
if (rank<dream.reqRank) {
return {success:false,message:`Tu vi chưa đủ! Cần đạt tối thiểu ${dream.reqRank} Chuyển để tiến vào 【${dream.name}】.`};
}
if (g.player.mental<dream.mentalCost) {
return {success:false,message:`Tinh Thần Lực không đủ (${Math.floor(g.player.mental)}/${dream.mentalCost})! Hãy dùng Thanh Linh Thảo hoặc Đãng Hồn Thạch Đan để hồi phục.`};
}
// Deduct mental cost upon entering the playable dream!
g.player.mental=Math.max(0,g.player.mental - dream.mentalCost);
if (g.ui) g.ui.updateHubTopbar();

const cfg=global.VanCoDreamData.getDreamTrialConfig(dream.id);
this.currentDream=dream;
this.currentCfg=cfg;
this.keys={};
this._ptrDown=false;
this.active=true;

const triAtt=String((g.player.pathAttainment&&g.player.pathAttainment["Trí Đạo"])||"");
const honAtt=String((g.player.pathAttainment&&g.player.pathAttainment["Hồn Đạo"])||"");
const hasTriMaster=triAtt.includes("Đại Sư")||triAtt.includes("Tông Sư")||triAtt.includes("Vô Thượng");
const hasHonMaster=honAtt.includes("Đại Sư")||honAtt.includes("Tông Sư")||honAtt.includes("Vô Thượng");
let masteryBonusNote="";
if (cfg.mode==="star_chess") {
this.trial=new global.DreamTrialStarChess(this,dream,cfg);
if (hasTriMaster) {this.trial.hintsLeft +=1;this.trial.timeLeft +=12;masteryBonusNote=" • ✨ Trí Đạo Đại Sư: +1 Thôi Diễn & +12s!";}
} else if (cfg.mode==="lotus_duel") {
this.trial=new global.DreamTrialLotusDuel(this,dream,cfg);
if (hasHonMaster) {this.trial.pl.maxHp=125;this.trial.pl.hp=125;masteryBonusNote=" • ✨ Hồn Đạo Đại Sư: +25% Hồn Phách Hóa Thân!";}
} else {
this.trial=new global.DreamTrialSurvival(this,dream,cfg);
if (hasHonMaster) {this.trial.maxSoulHp=125;this.trial.soulHp=125;masteryBonusNote=" • ✨ Hồn Đạo Đại Sư: +25% Hồn Phách Sống Sót!";}
}

const scr=this._ensureDOM();
scr.querySelector("#dream-title-lbl").textContent=`🌙 ${dream.name}`;
scr.querySelector("#dream-sub-lbl").textContent=`${cfg.modeLabel} • Lưu phái: ${dream.useMainPath?g.player.mainPath :dream.paths.join(", ")}`;
scr.querySelector("#dream-intro-title").textContent=`${cfg.modeLabel}: ${dream.name}`;
scr.querySelector("#dream-intro-quote").textContent=cfg.introQuote||dream.desc;
const ruleTxt=cfg.mode==="star_chess"
?"Chạm các Tinh Tử để thắp sáng toàn bộ bàn cờ trước khi hết nước hoặc hết giờ. Hoàn thành nhanh đạt hạng SS (+45% thưởng)!"
:(cfg.mode==="lotus_duel"
?"Nhập vai Tôn Giả: Di chuyển bằng WASD / Kéo tay, dùng [1/Click], [2/Q], [3/E] (Quang Âm Nghịch Chuyển đóng băng thời gian!) và [SPACE] Thuấn Di để đánh bại Thủ Lĩnh Mộng Cảnh!"
:"Di chuyển bằng WASD / Kéo ngón tay né Sát Khí & Vòng Sóng, thu thập Hồn Hạch hồi phục Hồn Phách & tích 3 Hồn Hạch để tung [Q] Định Hồn Ấn!");
scr.querySelector("#dream-intro-rule").textContent=ruleTxt + masteryBonusNote;

scr.querySelector("#dream-intro-overlay").classList.remove("hidden");
scr.querySelector("#dream-result-overlay").classList.add("hidden");
scr.classList.remove("hidden");

if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") {
global.vanCoSettings.syncBgmForScreen("tk_story");
}
// Draw initial preview frame behind intro card
this._syncHud(true);
this.trial.render(this._ctx,0);
return {success:true,message:`🌙 Đã đưa Hồn Phách tiến vào 【${dream.name}】 (-${dream.mentalCost} Tinh Thần)!`};
}

_syncHud(force=false) {
if (!this._screen|| !this.trial) return;
const info=this.trial.getHudInfo();
this._screen.querySelector("#dream-hud-left").textContent=info.leftText||"";
this._screen.querySelector("#dream-hud-right").textContent=info.rightText||"";
const bar=this._screen.querySelector("#dream-action-bar");
const sig=(info.actionButtons||[]).map(b=>`${b.id}:${b.label}:${b.disabled?1 :0}`).join("|");
if (force||this._lastBarSig!==sig) {
this._lastBarSig=sig;
bar.innerHTML="";
for (const b of (info.actionButtons||[])) {
const el=document.createElement("button");
el.className=b.disabled?"btn-secondary dream-act-btn" :"btn-primary dream-act-btn";
el.textContent=b.label;
el.disabled=Boolean(b.disabled);
el.addEventListener("click",()=>b.onClick());
bar.appendChild(el);
}
}
}

_loop(ts) {
if (!this.active|| !this.trial) {this._rafId=null;return;}
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs) / 1000));
this._lastTs=ts;
this.trial.update(dt);
this.trial.render(this._ctx,ts*0.001);
this._hudTick +=dt;
if (this._hudTick>=0.12) {
this._hudTick=0;
this._syncHud(false);
}
if (this.active&& !this.trial.finished) {
this._rafId=requestAnimationFrame((nts)=>this._loop(nts));
} else {
this._rafId=null;
this._syncHud(true);
}
}

finishTrial(result) {
if (!this.active|| !this.currentDream|| !this.game) return;
if (this._rafId) {cancelAnimationFrame(this._rafId);this._rafId=null;}
const g=this.game;
const pl=g.player;
const dr=this.currentDream;
const isImmortal=pl.isImmortalCultivator();
const mult=Math.max(0.25,Number(result.bonusMult)||1.0);
const daoGain=Math.max(5,Math.round(dr.daoMarksReward*mult));
const qiGain=result.success?Math.max(2,Math.round(dr.humanQiReward*mult)) :Math.max(1,Math.round(dr.humanQiReward*0.35));
const targetPaths=dr.useMainPath?[pl.mainPath] :dr.paths.filter(p=>global.PlayerManager.DAO_PATHS[p]);

const beforeLabels={};
for (const p of targetPaths) beforeLabels[p]=pl.pathAttainment[p]||"Phàm Cấp";

if (result.success) {
pl.dreamClears[dr.id]=(pl.dreamClears[dr.id]||0) + 1;
}
for (const p of targetPaths) {
pl.addPathAttainmentExp(p,daoGain);
if (isImmortal) pl.addDaoMarks(p,daoGain);
}
if (g.aperture) g.aperture.humanQi +=qiGain;

const rankUpNotes=[];
for (const p of targetPaths) {
const afterLbl=pl.pathAttainment[p]||"Phàm Cấp";
if (afterLbl!==beforeLabels[p]) {
rankUpNotes.push(`⬆️ ${p}: ${beforeLabels[p]} → ${afterLbl}`);
}
}

const rewardText=isImmortal
?`+${daoGain.toLocaleString("vi-VN")} Đạo Ngân & Lĩnh Ngộ (${targetPaths.join(", ")}) • +${qiGain} Nhân Khí${rankUpNotes.length?` • ${rankUpNotes.join(" | ")}` :""}`
:`+${daoGain.toLocaleString("vi-VN")} Lĩnh Ngộ Lưu Phái (${targetPaths.join(", ")}) • +${qiGain} Nhân Khí${rankUpNotes.length?` • ${rankUpNotes.join(" | ")}` :""}`;

if (g.ui) {
g.ui.addLog(
`${result.success?"🌙 [PHÁ MỘNG THÀNH CÔNG]" :"🌫️ [RÚT KHỎI MỘNG CẢNH]"} 【${dr.name}】 (Hạng ${result.grade}): ${rewardText}`,
result.success?"cultivation" :"warning"
);
}
if (g.autoSaveNow) g.autoSaveNow("dream_trial");

// Show polished result card
const ov=this._screen.querySelector("#dream-result-overlay");
const tEl=this._screen.querySelector("#dream-res-title");
tEl.textContent=result.success?"🎉 PHÁ MỘNG THÀNH CÔNG — CHÂN Ý NHẬP TÂM!" :"🌫️ HỒN PHÁCH RÚT KHỎI MỘNG CẢNH";
tEl.style.color=result.success?"#7ef7c4" :"#ff9f43";
this._screen.querySelector("#dream-res-grade").textContent=`Đánh Giá: Hạng ${result.grade} (x${Math.round(mult*100)}% Thưởng)`;
this._screen.querySelector("#dream-res-summary").textContent=result.summary||"";
this._screen.querySelector("#dream-res-reward").textContent=`✨ Phần Thưởng: ${rewardText}`;
ov.classList.remove("hidden");
}

close() {
this.active=false;
if (this._rafId) {cancelAnimationFrame(this._rafId);this._rafId=null;}
this.trial=null;
this.keys={};
if (this._screen) this._screen.classList.add("hidden");
if (global.vanCoSettings&&typeof global.vanCoSettings.syncBgmForScreen==="function") {
global.vanCoSettings.syncBgmForScreen("hub");
}
if (this.game&&this.game.ui) {
this.game.ui.renderDaoAttainmentTab();
this.game.ui.updateHubTopbar();
}
}
}

global.DreamRealmEngine=DreamRealmEngine;
})(window);
