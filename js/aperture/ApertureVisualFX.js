(function (global) {
"use strict";
function _esc(v) {
if (v===null||v===undefined) return "";
return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
const SEA_COLORS_BY_RANK={
1:{top:"#38e8a8",bottom:"#0e4d37",glow:"rgba(56, 232, 168, 0.45)",name:"Thanh Đồng Biển Nguyên"},
2:{top:"#ff5c52",bottom:"#5c110d",glow:"rgba(255, 92, 82, 0.45)",name:"Xích Thiết Biển Nguyên"},
3:{top:"#eef7fc",bottom:"#51646e",glow:"rgba(225, 240, 250, 0.50)",name:"Bạch Ngân Biển Nguyên"},
4:{top:"#ffe066",bottom:"#7d5509",glow:"rgba(255, 215, 0, 0.50)",name:"Hoàng Kim Biển Nguyên"},
5:{top:"#cc7aff",bottom:"#3e116e",glow:"rgba(195, 110, 255, 0.50)",name:"Tử Tinh Biển Nguyên"}
};
class ApertureVisualFX {
constructor(gameEngine) {
this.game=gameEngine||null;
this._rafId=null;
this._mode=null;
this._state=null;
this._canvas=null;
this._ctx=null;
this._lastTs=0;
}
stop() {
if (this._rafId) {
cancelAnimationFrame(this._rafId);
this._rafId=null;
}
this._mode=null;
this._state=null;
}
openInnerApertureRefinement(guInstanceId,suppressorId="auto") {
const g=this.game;
if (!g|| !g.guSystem|| !g.player|| !g.aperture) return;
const gu=g.guSystem.getGuByInstanceId(guInstanceId);
if (!gu||gu.isRefined) {
if (g.ui) g.ui.addLog("Cổ Trùng này đã được luyện hóa hoàn toàn!","system");
return;
}
const wInfo=g.guSystem.getWildGuRefinementInfo(guInstanceId,g.player,g.aperture,suppressorId);
if (!wInfo|| !wInfo.valid) {
if (g.ui) g.ui.addLog(wInfo?wInfo.reason :"Không thể nhập khiếu luyện hóa!","warning");
return;
}
this.stop();
const modal=this._ensureModal("inner-aperture-modal","🧠 Hóa Niệm Nhập Khiếu — Luyện Hóa Dã Cổ",620);
const body=modal.querySelector(".afx-modal-body");
const G=global.GuSystem;
const fullGuName=G&&G.formatGuNameWithRank?G.formatGuNameWithRank(gu) :gu.name;
const discountedStone=Math.max(1,Math.round(wInfo.stoneCost*0.75));
const supName=wInfo.suppressor&&G?G.formatGuNameWithRank(wInfo.suppressor) :null;
body.innerHTML=`
<div class="afx-canvas-frame">
<canvas id="afx-refine-canvas" width="540" height="260"></canvas>
<div class="afx-hud-badge-tl" id="afx-ref-status">Ý Chí Hoang Dã: 100%</div>
<div class="afx-hud-badge-tr" id="afx-ref-prog">Luyện Hóa: ${Math.round(gu.refinementProgress||0)}%</div>
</div>
<div class="recipe-preview-box mt-10" style="margin-bottom:8px;">
<p style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><strong style="color:#ffd700;">🪲 Mục tiêu trong Không Khiếu:</strong> ${global.vanCoGuArt?global.vanCoGuArt.renderImgHtml(gu,24,"gu-inline-art") :_esc(gu.icon)} <strong>${_esc(fullGuName)}</strong> (Lưu phái: ${_esc(gu.path)})</p>
<p class="sub-text" id="afx-ref-hint">👉 Chạm/di chuột lên Dã Cổ trong Không Khiếu để dẫn luồng <strong>Ý Niệm (Tinh Thần)</strong> khóa mục tiêu! Dùng <strong>Áp Chế Khí Tức</strong> làm choáng Dã Cổ rồi <strong>Luyện Hóa Ý Niệm</strong> (-25% Nguyên Thạch so với luyện nhanh!).</p>
<p style="font-size:12px;">
                        💎 Nguyên Thạch: <strong id="afx-ref-stones">${g.player.primevalStones}</strong> (Tốn ${discountedStone}💎/đợt) |
                        🧠 Tinh Thần: <strong id="afx-ref-mental">${Math.floor(g.player.mental)}/${g.player.maxMental}</strong> |
                        🐉 Áp Chế: <strong style="color:${supName?"#7ef7c4" :"#b3aa9c"}">${supName?_esc(supName) :"Ý Niệm Bản Thân"}</strong>
</p>
</div>
<div class="action-grid-2">
<button id="afx-btn-suppress" class="btn-accent">🐉 Phóng Khí Tức Áp Chế (Choáng Dã Cổ)</button>
<button id="afx-btn-channel" class="btn-primary">🧠 Dẫn Ý Niệm Luyện Hóa (-${discountedStone}💎)</button>
</div>
<div class="action-row mt-5" style="justify-content:space-between;">
<span class="sub-text" id="afx-ref-log">Đã hóa một luồng Tinh Thần tiến vào Không Khiếu...</span>
<button id="afx-btn-exit" class="btn-secondary">↩️ Thu Hồi Thần Niệm</button>
</div>
            `;
const canvas=body.querySelector("#afx-refine-canvas");
this._canvas=canvas;
this._ctx=canvas.getContext("2d");
this._mode="wild_refine";
const st={
gu,
wInfo,
discountedStone,
suppressorId,
wildWill:Math.max(25,100 - (gu.refinementProgress||0)*0.6),
guX:270,
guY:120,
guVx:85 + gu.rank*12,
guVy:62 + gu.rank*9,
stunTimer:0,
suppressCd:0,
willX:270,
willY:210,
pointerDown:false,
lockedOn:false,
pulseWaves:[],
particles:[],
completed:false,
t:0
};
this._state=st;
const updatePointer=(ev)=>{
const rect=canvas.getBoundingClientRect();
const sx=canvas.width / Math.max(1,rect.width);
const sy=canvas.height / Math.max(1,rect.height);
st.willX=Math.max(30,Math.min(canvas.width - 30,(ev.clientX - rect.left)*sx));
st.willY=Math.max(30,Math.min(canvas.height - 30,(ev.clientY - rect.top)*sy));
};
canvas.addEventListener("pointerdown",(e)=>{st.pointerDown=true;updatePointer(e);});
canvas.addEventListener("pointermove",(e)=>{updatePointer(e);});
canvas.addEventListener("pointerup",()=>{st.pointerDown=false;});
const setLog=(msg,col="#7ef7f0")=>{
const el=body.querySelector("#afx-ref-log");
if (el) {el.textContent=msg;el.style.color=col;}
};
body.querySelector("#afx-btn-suppress").addEventListener("click",()=>{
if (st.completed) return;
if (st.suppressCd>0) {
setLog(`⏳ Khí tức áp chế đang hồi (${st.suppressCd.toFixed(1)}s)...`,"#ffd700");
return;
}
const mCost=Math.max(5,Math.round(wInfo.mentalCost*0.45));
if (g.player.mental<mCost) {
setLog(`Không đủ Tinh Thần (${Math.floor(g.player.mental)}/${mCost}) để phóng khí tức áp chế!`,"#ff8a8a");
return;
}
g.player.mental=Math.max(0,g.player.mental - mCost);
const rankDiff=wInfo.rankDiff||0;
st.stunTimer=2.8 + rankDiff*1.1;
st.suppressCd=4.2;
const willDrop=26 + rankDiff*18;
st.wildWill=Math.max(0,st.wildWill - willDrop);
st.pulseWaves.push({x:st.guX,y:st.guY,r:10,maxR:155,color:"#ffd700",life:0.65,maxLife:0.65});
this._burst(st.particles,st.guX,st.guY,"#ffd700",18);
setLog(
supName
?`🐉 【${supName}】 phát ra uy áp trấn nhiếp! Ý Chí Hoang Dã -${willDrop}%, Dã Cổ bị định thân ${st.stunTimer.toFixed(1)}s!`
:`🧠 Ý Niệm bản thân ngưng tụ áp chế! Ý Chí Hoang Dã -${willDrop}%, Dã Cổ chậm lại!`,
"#ffd700"
);
this._refreshRefineHud(body,st);
});
body.querySelector("#afx-btn-channel").addEventListener("click",()=>{
if (st.completed) return;
const pl=g.player;
const ap=g.aperture;
if (pl.primevalStones<st.discountedStone) {
setLog(`Không đủ Nguyên Thạch (Cần ${st.discountedStone}💎)!`,"#ff8a8a");
return;
}
const mCost=Math.max(4,Math.round(wInfo.mentalCost*0.75));
if (pl.mental<mCost) {
setLog(`Không đủ Tinh Thần Lực (${Math.floor(pl.mental)}/${mCost})!`,"#ff8a8a");
return;
}
pl.primevalStones -=st.discountedStone;
pl.mental=Math.max(0,pl.mental - mCost);
const lockBonus=st.lockedOn?0.16 :0;
const stunBonus=st.stunTimer>0?0.18 :0;
const willBonus=(100 - st.wildWill)*0.0025;
const chance=wInfo.instantRefine?1.0 :Math.min(0.99,wInfo.successChance + 0.15 + lockBonus + stunBonus + willBonus);
st.pulseWaves.push({x:st.willX,y:st.willY,r:8,maxR:130,color:"#5cc995",life:0.55,maxLife:0.55});
if (Math.random()<=chance) {
const mult=(st.stunTimer>0?1.35 :1.0)*(st.lockedOn?1.20 :1.0);
const rawGain=wInfo.instantRefine
?100
:Math.round((wInfo.minGain + Math.random()*(wInfo.maxGain - wInfo.minGain + 1))*mult);
gu.refinementProgress=Math.min(100,(gu.refinementProgress||0) + rawGain);
st.wildWill=Math.max(0,st.wildWill - Math.round(rawGain*0.7));
this._burst(st.particles,st.guX,st.guY,"#5cc995",22);
if (gu.refinementProgress>=100) {
st.completed=true;
gu.isRefined=true;
gu.refinementProgress=100;
const isImm=typeof pl.isImmortalCultivator==="function"&&pl.isImmortalCultivator();
pl.addPathAttainmentExp("Luyện Đạo",3*gu.rank);
if (isImm) pl.addDaoMarks("Luyện Đạo",3*gu.rank);
ap.humanQi +=Math.max(1,gu.rank);
const emptySlot=g.guSystem.equippedGuSlots.findIndex(s=>s===null);
if (emptySlot!== -1) g.guSystem.equipGuToSlot(gu.instanceId,emptySlot);
g.guSystem._recalculateSavedKillerMoves();
g.autoSaveNow("refine_wild_gu");
this._burst(st.particles,st.guX,st.guY,"#ffd700",42);
setLog(`✨ LUYỆN HÓA ĐẠI THÀNH 100%! 【${fullGuName}】 đã quy thuận thần phục!`,"#7ef7c4");
if (g.ui) {
g.ui.addLog(`🧠 [Hóa Niệm Nhập Khiếu] Luyện hóa hoàn tất 【${fullGuName}】!`,"loot");
g.ui.renderGuStorageTab();
g.ui.updateHubTopbar();
}
} else {
setLog(`✨ Luồng Ý Niệm quấn chặt Dã Cổ: +${rawGain}% (Đạt ${gu.refinementProgress}%${st.lockedOn?" • Khóa chuẩn!" :""})`,"#7ef7c4");
}
} else {
st.wildWill=Math.min(100,st.wildWill + 8);
this._burst(st.particles,st.guX,st.guY,"#ff5252",14);
setLog(`💥 Ý Chí Hoang Dã vùng vẫy đánh bật thần niệm! Hãy dùng Áp Chế trước rồi khóa tâm!`,"#ff8a8a");
}
this._refreshRefineHud(body,st);
if (g.ui) g.ui.updateHubTopbar();
});
body.querySelector("#afx-btn-exit").addEventListener("click",()=>{
this.stop();
modal.classList.add("hidden");
if (g.ui) {g.ui.renderGuStorageTab();g.ui.updateHubTopbar();}
});
modal.classList.remove("hidden");
this._lastTs=performance.now();
this._loop(this._lastTs);
}
_refreshRefineHud(body,st) {
const g=this.game;
const sEl=body.querySelector("#afx-ref-status");
const pEl=body.querySelector("#afx-ref-prog");
const stEl=body.querySelector("#afx-ref-stones");
const mEl=body.querySelector("#afx-ref-mental");
if (sEl) sEl.textContent=st.completed?"✅ Đã Khuất Phục" :(st.stunTimer>0?`⚡ Bị Áp Chế (${st.stunTimer.toFixed(1)}s)` :`Ý Chí Hoang Dã: ${Math.round(st.wildWill)}%`);
if (pEl) pEl.textContent=`Luyện Hóa: ${Math.round(st.gu.refinementProgress||0)}%`;
if (stEl&&g.player) stEl.textContent=g.player.primevalStones;
if (mEl&&g.player) mEl.textContent=`${Math.floor(g.player.mental)}/${g.player.maxMental}`;
}
openMortalBreakthroughTrial() {
const g=this.game;
if (!g|| !g.aperture|| !g.player) return;
const ap=g.aperture;
if (ap.isImmortal) {
if (g.ui) g.ui.addLog("Cổ Tiên đột phá cảnh giới bằng Độ Tai Kiếp!","warning");
return;
}
if (ap.wallProgress<ap.maxWallProgress) {
if (g.ui) g.ui.addLog(`Khiếu Bích chưa ôn dưỡng viên mãn (${Math.floor(ap.wallProgress)}/${ap.maxWallProgress})!`,"warning");
return;
}
if (ap.rank===5&&ap.subStage===3) {
this.openImmortalAscensionCinema();
return;
}
this.stop();
const isMajor=ap.subStage===3;
const modal=this._ensureModal(
"inner-aperture-modal",
isMajor?`⚡ Xung Kích Đại Cảnh Giới — Phá Khiếu Lên ${ap.rank + 1} Chuyển!` :`🌊 Xung Kích Khiếu Bích — Đột Phá Tiểu Cảnh Giới`,
620
);
const body=modal.querySelector(".afx-modal-body");
body.innerHTML=`
<div class="afx-canvas-frame">
<canvas id="afx-break-canvas" width="540" height="260"></canvas>
<div class="afx-hud-badge-tl" id="afx-brk-wall">Độ Nứt Khiếu Bích: 0%</div>
<div class="afx-hud-badge-tr" id="afx-brk-ess">Chân Nguyên: ${ap.currentEssence.toFixed(1)}%</div>
</div>
<div class="recipe-preview-box mt-10" style="margin-bottom:8px;">
<p><strong style="color:#ffd700;">☯️ ${ap.getRealmDisplayName()}</strong> → Khiếu Bích: <strong>${ap.getApertureWallName()}</strong></p>
<p class="sub-text">👉 Theo đúng nguyên tác: Dẫn sóng <strong>Biển Nguyên</strong> đập vào Khiếu Bích tạo vết nứt, đồng thời <strong>Hóa Niệm</strong> đâm thẳng vào điểm nứt sáng vàng (hoặc chạm trực tiếp lên vết nứt trên màn hình) để phá vách đột phá!</p>
</div>
<div class="action-grid-2">
<button id="afx-btn-wave" class="btn-primary">🌊 Đẩy Sóng Chân Nguyên (-9% CN)</button>
<button id="afx-btn-will-pierce" class="btn-accent">🧠 Hóa Niệm Xuyên Vết Nứt (-12 Tinh Thần)</button>
</div>
<div class="action-row mt-5" style="justify-content:space-between;">
<button id="afx-btn-stone-refill" class="btn-secondary">💎 Hấp Thu 1 Nguyên Thạch (Có: ${g.player.primevalStones})</button>
<button id="afx-btn-brk-exit" class="btn-secondary">↩️ Ngừng Xung Kích</button>
</div>
<p id="afx-brk-log" class="sub-text mt-5" style="color:#7ef7f0;">Biển Nguyên đang dâng trào! Hãy điều khiển sóng xung kích phá vỡ Khiếu Bích!</p>
            `;
const canvas=body.querySelector("#afx-break-canvas");
this._canvas=canvas;
this._ctx=canvas.getContext("2d");
this._mode="mortal_breakthrough";
const st={
isMajor,
crackPct:0,
waveAmp:6,
flashAlpha:0,
weakSpotAngle:-Math.PI*0.35,
weakSpotSpeed:isMajor?1.45 :1.05,
particles:[],
shattered:false,
shatterTimer:0,
t:0
};
this._state=st;
const setLog=(msg,col="#7ef7f0")=>{
const el=body.querySelector("#afx-brk-log");
if (el) {el.textContent=msg;el.style.color=col;}
};
const updateHud=()=>{
const wEl=body.querySelector("#afx-brk-wall");
const eEl=body.querySelector("#afx-brk-ess");
const sBtn=body.querySelector("#afx-btn-stone-refill");
if (wEl) wEl.textContent=st.shattered?"✨ KHIẾU BÍCH ĐÃ TÁI TẠO!" :`Độ Nứt Khiếu Bích: ${Math.min(100,Math.round(st.crackPct))}%`;
if (eEl) eEl.textContent=`Chân Nguyên: ${ap.currentEssence.toFixed(1)}% / ${ap.aptitude.maxSeaPercent}%`;
if (sBtn) sBtn.textContent=`💎 Hấp Thu 1 Nguyên Thạch (Có: ${g.player.primevalStones})`;
};
const finalizeBreakthroughSuccess=()=>{
if (st.shattered) return;
st.shattered=true;
st.crackPct=100;
st.flashAlpha=1.0;
this._burst(st.particles,270,130,"#ffd700",55);
if (st.isMajor) {
ap.rank +=1;
ap.subStage=0;
ap.humanQi +=6*ap.rank;
} else {
ap.subStage +=1;
ap.humanQi +=2*ap.rank;
}
if (ap.aptitude&&ap.aptitude.physique) {
if (st.isMajor) {ap.wallPressure=0;ap._pressureWarned=false;}
} else {
ap.wallPressure=Math.max(5,ap.wallPressure - (st.isMajor?80 :55));
}
ap.wallProgress=0;
ap.maxWallProgress=Math.round(
global.ApertureSystem.MORTAL_RANKS[ap.rank].baseWallReq*
global.ApertureSystem.MORTAL_SUBSTAGES[ap.subStage].statMult
);
g.player.recalculateStats();
g.player.hp=g.player.maxHp;
if (g.questManager) g.questManager.recordEvent("reach_rank",String(ap.rank),1);
g.autoSaveNow("breakthrough");
const msg=`🎉 OANH!! Khiếu Bích vỡ tan rồi ngưng tụ tầng mới! Đột phá thành công lên 【${ap.getRealmDisplayName()}】 (${ap.getApertureWallName()})!`;
setLog(msg,"#ffd700");
if (g.ui) {
g.ui.addLog(msg,"loot");
g.ui.renderApertureTab();
g.ui.updateHubTopbar();
}
updateHud();
};
const doSurgeWave=(extraMult=1.0)=>{
if (st.shattered) return;
const cost=9;
if (ap.currentEssence<cost) {
setLog("⚠️ Biển Nguyên đã cạn (<9%)! Hãy bấm '💎 Hấp Thu 1 Nguyên Thạch' ngay!","#ff8a8a");
return;
}
ap.currentEssence=Math.max(0,Number((ap.currentEssence - cost).toFixed(1)));
st.waveAmp=24;
const baseGain=(st.isMajor?18 :26)*(0.9 + (ap.aptitude.cultivateMult||1)*0.12)*extraMult;
st.crackPct=Math.min(100,st.crackPct + baseGain);
const cx=270 + Math.cos(st.weakSpotAngle)*105;
const cy=130 + Math.sin(st.weakSpotAngle)*105;
this._burst(st.particles,cx,cy,(SEA_COLORS_BY_RANK[ap.rank]||SEA_COLORS_BY_RANK[1]).top,20);
setLog(`🌊 Sóng Biển Nguyên đập mạnh vào Khiếu Bích! Độ nứt +${Math.round(baseGain)}% (${Math.round(st.crackPct)}%)`,"#7ef7f0");
updateHud();
if (st.crackPct>=100) finalizeBreakthroughSuccess();
};
const doWillPierce=()=>{
if (st.shattered) return;
if (g.player.mental<12) {
setLog("⚠️ Tinh Thần Lực không đủ (<12) để Hóa Niệm xuyên vết nứt!","#ff8a8a");
return;
}
g.player.mental=Math.max(0,g.player.mental - 12);
const gain=st.isMajor?24 :34;
st.crackPct=Math.min(100,st.crackPct + gain);
st.waveAmp=20;
const cx=270 + Math.cos(st.weakSpotAngle)*105;
const cy=130 + Math.sin(st.weakSpotAngle)*105;
this._burst(st.particles,cx,cy,"#ffd700",26);
setLog(`🧠 Hóa Niệm thành thương ánh vàng đâm trúng điểm yếu Khiếu Bích! Độ nứt +${gain}%!`,"#ffd700");
updateHud();
if (st.crackPct>=100) finalizeBreakthroughSuccess();
};
canvas.addEventListener("pointerdown",(e)=>{
if (st.shattered) return;
const rect=canvas.getBoundingClientRect();
const x=(e.clientX - rect.left)*(canvas.width / Math.max(1,rect.width));
const y=(e.clientY - rect.top)*(canvas.height / Math.max(1,rect.height));
const wx=270 + Math.cos(st.weakSpotAngle)*105;
const wy=130 + Math.sin(st.weakSpotAngle)*105;
if (Math.hypot(x - wx,y - wy)<=38) {
doWillPierce();
} else {
doSurgeWave(1.0);
}
});
body.querySelector("#afx-btn-wave").addEventListener("click",()=>doSurgeWave(1.0));
body.querySelector("#afx-btn-will-pierce").addEventListener("click",()=>doWillPierce());
body.querySelector("#afx-btn-stone-refill").addEventListener("click",()=>{
if (g.player.primevalStones<=0) {
setLog("Không còn Nguyên Thạch!","#ff8a8a");
return;
}
const r=ap.absorbPrimevalStone(1);
if (r.success) {
g.player.primevalStones -=1;
setLog(`💎 ${r.message}`,"#5cc995");
updateHud();
} else {
setLog(r.message,"#ffd700");
}
});
body.querySelector("#afx-btn-brk-exit").addEventListener("click",()=>{
this.stop();
modal.classList.add("hidden");
if (g.ui) {g.ui.renderApertureTab();g.ui.updateHubTopbar();}
});
modal.classList.remove("hidden");
this._lastTs=performance.now();
this._loop(this._lastTs);
}
attachTribulationCanvas(canvasEl,tribulationType="Thiên Kiếp",waveIndex=0) {
this.stop();
if (!canvasEl) return;
this._canvas=canvasEl;
this._ctx=canvasEl.getContext("2d");
this._mode="tribulation";
this._state={
tribulationType,
waveIndex,
integrity:60,
barrierFlash:0,
barrierColor:"#7ef7f0",
bolts:[],
meteors:[],
particles:[],
boltTimer:0.3,
climaxMode:false,
climaxTimer:0,
shake:0,
t:0
};
this._lastTs=performance.now();
this._loop(this._lastTs);
}
triggerTribulationStrikeEffect(choiceId,integrity,waveIndex) {
if (this._mode!=="tribulation"|| !this._state) return;
const st=this._state;
st.integrity=integrity;
st.waveIndex=waveIndex;
st.shake=10;
st.barrierFlash=1.0;
if (choiceId==="shield"||choiceId==="defend_all"||choiceId==="stabilize") {
st.barrierColor="#4ce6ff";
} else if (choiceId==="counter"||choiceId==="all_out"||choiceId==="vital_gu") {
st.barrierColor="#ffd700";
} else {
st.barrierColor="#ff5733";
}
for (let i=0;i<3;i++) {
this._spawnTribulationBolt(st,170 + i*100);
}
this._burst(st.particles,270,150,st.barrierColor,32);
}
playTribulationVictoryClimax(onDone) {
if (this._mode!=="tribulation"|| !this._state) {
if (typeof onDone==="function") onDone();
return;
}
const st=this._state;
st.climaxMode=true;
st.climaxTimer=1.65;
st.barrierColor="#ffd700";
this._burst(st.particles,270,140,"#ffd700",55);
setTimeout(()=>{
this.stop();
if (typeof onDone==="function") onDone();
},1550);
}
openImmortalAscensionCinema() {
const g=this.game;
if (!g|| !g.aperture) return;
const ap=g.aperture;
const modal=this._ensureModal("inner-aperture-modal","🌌 Phá Khiếu Thăng Tiên — Tam Khí Hợp Nhất!",600);
const body=modal.querySelector(".afx-modal-body");
const renderStep=()=>{
const st=ap.ascensionState;
const stageLabels={
0:"Chuẩn bị đập vỡ Tinh Mạc Ngũ Chuyển Đỉnh Phong",
1:"Giai Đoạn 1/4: Phá Khiếu — Dẫn Động Thiên Địa Nhị Khí",
2:"Giai Đoạn 2/4: Tam Khí Hội Tụ — Độ Thiên Kiếp Địa Tai",
3:"Giai Đoạn 3/4: Đánh Tan Kiếp Vân — Nổ Khiếu Hóa Phúc Địa!"
};
body.innerHTML=`
<div class="afx-canvas-frame">
<canvas id="afx-asc-canvas" width="540" height="240"></canvas>
<div class="afx-hud-badge-tl">${_esc(stageLabels[st.stage]||"Thành Tiên Đại Điển")}</div>
<div class="afx-hud-badge-tr">Dung Hợp Tam Khí: ${st.balanceScore||85}%</div>
</div>
<div class="recipe-preview-box mt-10">
<p>Thiên Khí: <strong>${st.heavenQi||150}</strong> | Địa Khí: <strong>${st.earthQi||150}</strong> | Nhân Khí: <strong>${st.humanQiCommitted||Math.floor(ap.humanQi)}</strong></p>
<p class="sub-text mt-5">${_esc((st.logs&&st.logs[st.logs.length - 1])||"Nhấn tiến hành để đập vỡ Phàm Khiếu, bước vào Lục Chuyển Cổ Tiên!")}</p>
</div>
<div class="action-row mt-10" style="justify-content:space-between;">
<button id="afx-asc-next" class="btn-primary" style="flex:1;">⚡ ${st.inProgress?"Tiến Hành Giai Đoạn Tiếp Theo" :"Bắt Đầu Phá Khiếu Thăng Tiên!"}</button>
<button id="afx-asc-close" class="btn-secondary">Đóng</button>
</div>
                `;
this.attachTribulationCanvas(body.querySelector("#afx-asc-canvas"),"Thăng Tiên Thiên Kiếp",st.stage||0);
body.querySelector("#afx-asc-next").addEventListener("click",()=>{
if (!ap.ascensionState.inProgress) {
const r=ap.startImmortalAscension({heaven:160,earth:160});
if (!r.success) {
if (g.ui) g.ui.addLog(r.message,"warning");
this.stop();
modal.classList.add("hidden");
return;
}
this.triggerTribulationStrikeEffect("counter",80,1);
renderStep();
} else {
const stepRes=ap.advanceAscensionStage(g.player);
this.triggerTribulationStrikeEffect("all_out",95,stepRes.stage||2);
if (stepRes.completed) {
g.player.recalculateStats();
g.player.hp=g.player.maxHp;
if (g.questManager) g.questManager.recordEvent("reach_rank",String(ap.rank),1);
g.autoSaveNow("ascend");
this.playTribulationVictoryClimax(()=>{
modal.classList.add("hidden");
if (g.ui) {
g.ui.addLog(`🌌 ĐẮC ĐẠO THÀNH TIÊN! Mở ra 【${ap.immortalAperture.gradeName}】!`,"loot");
g.ui.renderApertureTab();
g.ui.updateHubTopbar();
}
});
} else {
renderStep();
}
}
});
body.querySelector("#afx-asc-close").addEventListener("click",()=>{
this.stop();
modal.classList.add("hidden");
if (g.ui) {g.ui.renderApertureTab();g.ui.updateHubTopbar();}
});
};
renderStep();
modal.classList.remove("hidden");
}
_loop(ts) {
if (!this._mode|| !this._ctx|| !this._canvas) return;
const dt=Math.min(0.05,Math.max(0.001,(ts - this._lastTs) / 1000));
this._lastTs=ts;
if (this._mode==="wild_refine") this._tickAndRenderWildRefine(dt);
else if (this._mode==="mortal_breakthrough") this._tickAndRenderMortalBreakthrough(dt);
else if (this._mode==="tribulation") this._tickAndRenderTribulation(dt);
this._rafId=requestAnimationFrame((nextTs)=>this._loop(nextTs));
}
_tickAndRenderWildRefine(dt) {
const st=this._state;
const ctx=this._ctx;
const w=this._canvas.width;
const h=this._canvas.height;
const ap=this.game&&this.game.aperture;
const seaCfg=SEA_COLORS_BY_RANK[Math.min(5,(ap&&ap.rank)||1)]||SEA_COLORS_BY_RANK[1];
st.t +=dt;
if (st.suppressCd>0) st.suppressCd=Math.max(0,st.suppressCd - dt);
if (st.stunTimer>0) st.stunTimer=Math.max(0,st.stunTimer - dt);
if (!st.completed&&st.stunTimer<=0) {
const spdMult=0.7 + (st.wildWill / 100)*0.7;
st.guX +=st.guVx*spdMult*dt;
st.guY +=st.guVy*spdMult*dt;
const dCenter=Math.hypot(st.guX - w / 2,st.guY - h / 2);
if (dCenter>96) {
const ang=Math.atan2(h / 2 - st.guY,w / 2 - st.guX) + (Math.random() - 0.5)*0.9;
const spd=Math.hypot(st.guVx,st.guVy);
st.guVx=Math.cos(ang)*spd;
st.guVy=Math.sin(ang)*spd;
st.guX=w / 2 - Math.cos(ang)*94;
st.guY=h / 2 - Math.sin(ang)*94;
}
}
const distLock=Math.hypot(st.willX - st.guX,st.willY - st.guY);
st.lockedOn=distLock<=44;
ctx.fillStyle="#05080f";
ctx.fillRect(0,0,w,h);
const cx=w / 2;
const cy=h / 2;
const rad=116;
ctx.save();
ctx.beginPath();
ctx.arc(cx,cy,rad,0,Math.PI*2);
ctx.clip();
const bg=ctx.createRadialGradient(cx,cy,10,cx,cy,rad);
bg.addColorStop(0,"#122132");
bg.addColorStop(1,"#060a12");
ctx.fillStyle=bg;
ctx.fillRect(cx - rad,cy - rad,rad*2,rad*2);
const seaTop=cy + 36;
const seaGrad=ctx.createLinearGradient(0,seaTop,0,cy + rad);
seaGrad.addColorStop(0,seaCfg.top);
seaGrad.addColorStop(1,seaCfg.bottom);
ctx.fillStyle=seaGrad;
ctx.beginPath();
ctx.moveTo(cx - rad,cy + rad);
for (let x= -rad;x<=rad;x +=10) {
ctx.lineTo(cx + x,seaTop + Math.sin(x*0.05 + st.t*3.5)*5);
}
ctx.lineTo(cx + rad,cy + rad);
ctx.closePath();
ctx.fill();
if (st.lockedOn||st.stunTimer>0||st.completed) {
ctx.save();
ctx.strokeStyle=st.completed?"#ffd700" :(st.stunTimer>0?"#ffd700" :"#7ef7f0");
ctx.lineWidth=st.lockedOn?3 :1.8;
ctx.beginPath();
ctx.moveTo(st.willX,st.willY);
ctx.quadraticCurveTo(cx,cy - 25,st.guX,st.guY);
ctx.stroke();
ctx.restore();
}
for (let i=st.pulseWaves.length - 1;i>=0;i--) {
const pw=st.pulseWaves[i];
pw.life -=dt;
if (pw.life<=0) {st.pulseWaves.splice(i,1);continue;}
const p=1 - pw.life / pw.maxLife;
ctx.save();
ctx.globalAlpha=pw.life / pw.maxLife;
ctx.strokeStyle=pw.color;
ctx.lineWidth=3;
ctx.beginPath();
ctx.arc(pw.x,pw.y,pw.r + p*pw.maxR,0,Math.PI*2);
ctx.stroke();
ctx.restore();
}
const guRad=22;
ctx.beginPath();
ctx.arc(st.guX,st.guY,guRad + 6 + Math.sin(st.t*6)*2,0,Math.PI*2);
ctx.fillStyle=st.completed?"rgba(255,215,0,0.32)" :(st.stunTimer>0?"rgba(255,215,0,0.22)" :"rgba(224,82,82,0.24)");
ctx.fill();
ctx.strokeStyle=st.completed?"#ffd700" :(st.stunTimer>0?"#ffd700" :"#ff6b6b");
ctx.lineWidth=2.5;
ctx.stroke();
const progAngle=((st.gu.refinementProgress||0) / 100)*Math.PI*2;
ctx.beginPath();
ctx.arc(st.guX,st.guY,guRad + 11,-Math.PI / 2,-Math.PI / 2 + progAngle);
ctx.strokeStyle="#5cc995";
ctx.lineWidth=4;
ctx.stroke();
const drawnArt=global.vanCoGuArt&&global.vanCoGuArt.drawOnCanvas(ctx,st.gu,st.guX,st.guY,42);
if (!drawnArt) {
ctx.font="22px sans-serif";
ctx.textAlign="center";
ctx.textBaseline="middle";
ctx.fillText(st.gu.icon||"🪲",st.guX,st.guY);
}
ctx.beginPath();
ctx.arc(st.willX,st.willY,st.lockedOn?24 :18,0,Math.PI*2);
ctx.strokeStyle=st.lockedOn?"#7ef7c4" :"rgba(126, 247, 240, 0.65)";
ctx.lineWidth=2;
ctx.setLineDash([5,4]);
ctx.stroke();
ctx.setLineDash([]);
ctx.beginPath();
ctx.arc(st.willX,st.willY,6,0,Math.PI*2);
ctx.fillStyle="#ffffff";
ctx.fill();
this._updateAndDrawParticles(ctx,st.particles,dt);
ctx.restore();
ctx.beginPath();
ctx.arc(cx,cy,rad,0,Math.PI*2);
ctx.strokeStyle=st.completed?"#ffd700" :"#b89758";
ctx.lineWidth=4;
ctx.stroke();
}
_tickAndRenderMortalBreakthrough(dt) {
const st=this._state;
const ctx=this._ctx;
const w=this._canvas.width;
const h=this._canvas.height;
const ap=this.game&&this.game.aperture;
const seaCfg=SEA_COLORS_BY_RANK[Math.min(5,(ap&&ap.rank)||1)]||SEA_COLORS_BY_RANK[1];
st.t +=dt;
st.waveAmp=Math.max(5,st.waveAmp - dt*18);
st.flashAlpha=Math.max(0,st.flashAlpha - dt*1.4);
st.weakSpotAngle +=st.weakSpotSpeed*dt;
ctx.fillStyle="#05070c";
ctx.fillRect(0,0,w,h);
const cx=w / 2;
const cy=h / 2;
const rad=112;
ctx.save();
ctx.beginPath();
ctx.arc(cx,cy,rad,0,Math.PI*2);
ctx.clip();
ctx.fillStyle="#080f18";
ctx.fillRect(cx - rad,cy - rad,rad*2,rad*2);
const essRatio=ap?Math.max(0.15,Math.min(0.95,ap.currentEssence / 100)) :0.6;
const seaTop=cy + rad - rad*2*essRatio;
const seaGrad=ctx.createLinearGradient(0,seaTop,0,cy + rad);
seaGrad.addColorStop(0,seaCfg.top);
seaGrad.addColorStop(1,seaCfg.bottom);
ctx.fillStyle=seaGrad;
ctx.beginPath();
ctx.moveTo(cx - rad,cy + rad);
for (let x= -rad;x<=rad;x +=8) {
const wave=Math.sin(x*0.055 + st.t*6)*st.waveAmp;
ctx.lineTo(cx + x,seaTop + wave);
}
ctx.lineTo(cx + rad,cy + rad);
ctx.closePath();
ctx.fill();
ctx.beginPath();
ctx.arc(cx,cy - 18 + Math.sin(st.t*3)*5,13,0,Math.PI*2);
ctx.fillStyle="#ffd700";
ctx.fill();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=2;
ctx.stroke();
this._updateAndDrawParticles(ctx,st.particles,dt);
ctx.restore();
ctx.beginPath();
ctx.arc(cx,cy,rad,0,Math.PI*2);
ctx.strokeStyle=st.shattered?"#ffd700" :seaCfg.top;
ctx.lineWidth=st.shattered?6 :(4 + (ap?ap.subStage :0));
ctx.stroke();
const crackLines=Math.floor(st.crackPct / 12);
ctx.strokeStyle="#fff4cc";
ctx.lineWidth=2;
for (let i=0;i<crackLines;i++) {
const a=(i*0.82) - 1.1;
const x1=cx + Math.cos(a)*rad;
const y1=cy + Math.sin(a)*rad;
const x2=cx + Math.cos(a + 0.08)*(rad - 18);
const y2=cy + Math.sin(a + 0.08)*(rad - 18);
ctx.beginPath();
ctx.moveTo(x1,y1);
ctx.lineTo(x2,y2);
ctx.stroke();
}
if (!st.shattered) {
const wx=cx + Math.cos(st.weakSpotAngle)*(rad - 4);
const wy=cy + Math.sin(st.weakSpotAngle)*(rad - 4);
ctx.beginPath();
ctx.arc(wx,wy,14 + Math.sin(st.t*9)*3,0,Math.PI*2);
ctx.fillStyle="rgba(255, 215, 0, 0.35)";
ctx.fill();
ctx.strokeStyle="#ffd700";
ctx.lineWidth=2.5;
ctx.stroke();
ctx.font="bold 11px Georgia";
ctx.textAlign="center";
ctx.fillStyle="#ffd700";
ctx.fillText("🎯 Điểm Nứt",wx,wy - 18);
}
if (st.flashAlpha>0.01) {
ctx.fillStyle=`rgba(255, 245, 200, ${st.flashAlpha*0.65})`;
ctx.fillRect(0,0,w,h);
}
}
_spawnTribulationBolt(st,xStart) {
const segs=[];
let cx=xStart||(90 + Math.random()*360);
let cy=32;
segs.push({x:cx,y:cy});
while (cy<170) {
cx +=(Math.random() - 0.5)*36;
cy +=18 + Math.random()*16;
segs.push({x:cx,y:cy});
}
const isMyriad=String(st.tribulationType||"").includes("Vạn Kiếp");
st.bolts.push({
segs,
color:isMyriad?"#ffd700" :(st.waveIndex>=2?"#ff4d4d" :"#b75cff"),
life:0.38,
maxLife:0.38
});
}
_tickAndRenderTribulation(dt) {
const st=this._state;
const ctx=this._ctx;
const w=this._canvas.width;
const h=this._canvas.height;
st.t +=dt;
st.shake=Math.max(0,st.shake - dt*22);
st.barrierFlash=Math.max(0,st.barrierFlash - dt*1.8);
const sx=st.shake>0?(Math.random() - 0.5)*st.shake :0;
const sy=st.shake>0?(Math.random() - 0.5)*st.shake :0;
ctx.save();
ctx.translate(sx,sy);
const skyGrad=ctx.createLinearGradient(0,0,0,h);
if (st.climaxMode) {
skyGrad.addColorStop(0,"#3b2c0a");
skyGrad.addColorStop(0.55,"#1a2b36");
skyGrad.addColorStop(1,"#0b1a14");
} else {
skyGrad.addColorStop(0,st.waveIndex>=2?"#260818" :"#110b26");
skyGrad.addColorStop(0.65,"#101828");
skyGrad.addColorStop(1,"#0a1210");
}
ctx.fillStyle=skyGrad;
ctx.fillRect(-12,-12,w + 24,h + 24);
if (!st.climaxMode) {
for (let i=0;i<8;i++) {
const cloudX=((i*85 + st.t*(18 + (i % 3)*8)) % (w + 120)) - 60;
const cloudY=24 + Math.sin(st.t*1.5 + i)*7;
ctx.beginPath();
ctx.ellipse(cloudX,cloudY,58,22,0,0,Math.PI*2);
ctx.fillStyle=st.waveIndex>=2?"rgba(92, 18, 38, 0.72)" :"rgba(42, 24, 78, 0.72)";
ctx.fill();
}
st.boltTimer -=dt;
if (st.boltTimer<=0) {
st.boltTimer=0.45 + Math.random()*0.65;
this._spawnTribulationBolt(st);
}
} else {
const beamGrad=ctx.createLinearGradient(w / 2 - 70,0,w / 2 + 70,0);
beamGrad.addColorStop(0,"rgba(255,215,0,0)");
beamGrad.addColorStop(0.5,"rgba(255,225,115,0.45)");
beamGrad.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=beamGrad;
ctx.fillRect(w / 2 - 70,0,140,h);
}
ctx.beginPath();
ctx.ellipse(w / 2,h - 30,145,34,0,0,Math.PI*2);
ctx.fillStyle="#173d2b";
ctx.fill();
ctx.strokeStyle="#b89758";
ctx.lineWidth=2;
ctx.stroke();
ctx.fillStyle="#225c40";
ctx.beginPath();
ctx.moveTo(w / 2 - 80,h - 34);
ctx.lineTo(w / 2 - 42,h - 78);
ctx.lineTo(w / 2 - 5,h - 34);
ctx.moveTo(w / 2 - 10,h - 34);
ctx.lineTo(w / 2 + 34,h - 86);
ctx.lineTo(w / 2 + 78,h - 34);
ctx.fill();
const domeR=112;
ctx.beginPath();
ctx.arc(w / 2,h - 22,domeR,Math.PI,0,false);
ctx.fillStyle=st.barrierFlash>0?"rgba(255, 225, 120, 0.24)" :"rgba(76, 230, 255, 0.12)";
ctx.fill();
ctx.strokeStyle=st.climaxMode?"#ffd700" :st.barrierColor;
ctx.lineWidth=2.5 + st.barrierFlash*3;
ctx.stroke();
for (let i=st.bolts.length - 1;i>=0;i--) {
const b=st.bolts[i];
b.life -=dt;
if (b.life<=0) {st.bolts.splice(i,1);continue;}
ctx.save();
ctx.globalAlpha=b.life / b.maxLife;
ctx.strokeStyle=b.color;
ctx.lineWidth=4;
ctx.beginPath();
b.segs.forEach((pt,idx)=>idx===0?ctx.moveTo(pt.x,pt.y) :ctx.lineTo(pt.x,pt.y));
ctx.stroke();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=1.6;
ctx.stroke();
ctx.restore();
}
this._updateAndDrawParticles(ctx,st.particles,dt);
if (st.climaxMode) {
ctx.font="bold 18px Georgia";
ctx.textAlign="center";
ctx.fillStyle="#ffd700";
ctx.fillText("✨ ĐỘ KIẾP ĐẠI THÀNH — ĐẠO NGÂN GIÁNG LÂM! ✨",w / 2,54);
}
ctx.restore();
}
_burst(arr,x,y,color,count) {
for (let i=0;i<count;i++) {
const a=Math.random()*Math.PI*2;
const s=40 + Math.random()*145;
arr.push({
x,y,
vx:Math.cos(a)*s,
vy:Math.sin(a)*s,
size:2.5 + Math.random()*3.5,
color,
life:0.35 + Math.random()*0.45,
maxLife:0.8
});
}
}
_updateAndDrawParticles(ctx,arr,dt) {
for (let i=arr.length - 1;i>=0;i--) {
const p=arr[i];
p.x +=p.vx*dt;
p.y +=p.vy*dt;
p.life -=dt;
if (p.life<=0) {arr.splice(i,1);continue;}
ctx.save();
ctx.globalAlpha=Math.max(0,p.life / p.maxLife);
ctx.fillStyle=p.color;
ctx.fillRect(p.x,p.y,p.size,p.size);
ctx.restore();
}
}
_ensureModal(id,titleText,maxWidth=600) {
let modal=document.getElementById(id);
if (!modal) {
modal=document.createElement("div");
modal.id=id;
modal.className="modal-backdrop hidden";
modal.style.zIndex="110";
modal.innerHTML=`
<div class="modal-window" style="max-width:${maxWidth}px;">
<div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
<h2 class="afx-modal-title"></h2>
<button class="btn-mini afx-modal-close">✕</button>
</div>
<div class="modal-body afx-modal-body"></div>
</div>
                `;
document.body.appendChild(modal);
modal.querySelector(".afx-modal-close").addEventListener("click",()=>{
this.stop();
modal.classList.add("hidden");
});
}
const tEl=modal.querySelector(".afx-modal-title");
if (tEl) tEl.textContent=titleText;
return modal;
}
}
global.ApertureVisualFX=ApertureVisualFX;
})(window);
