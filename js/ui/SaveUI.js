(function (global) {
"use strict";
function _renderSettings() {
const d=this.dom;
if (!this.game) return;
if (d.settingsAutoSaveInfo&&typeof this.game.getAutoSaveSummary==="function") {
const autoSum=this.game.getAutoSaveSummary();
const saveVer=global.GameEngine&&global.GameEngine.SAVE_VERSION?`v${global.GameEngine.SAVE_VERSION}` :"v4";
d.settingsAutoSaveInfo.textContent=autoSum
?`Bản Auto-Save riêng (Save ${saveVer}): ${autoSum.label}${autoSum.savedAt?" | Lúc: " + autoSum.savedAt :""} (Tự sao lưu dự phòng xoay vòng, không tự ghi đè các Ô Lưu bên dưới).`
:`Chưa có dữ liệu Auto-Save (Chuẩn Save ${saveVer} tách biệt hoàn toàn với các Ô Lưu Thủ Công).`;
d.settingsAutoSaveInfo.style.color="";
}
if (!d.saveSlotsContainer) return;
const cardsHtml=[];
if (typeof this.game.checkSaveConsistency==="function") {
const diag=this.game.checkSaveConsistency();
const stg=diag.storage||{usedKB:0,gameKB:0,estimatedMaxKB:5120,percent:0};
const barColor=stg.percent>=80?"#ff5252" :(stg.percent>=60?"#ff9f43" :"#5cc995");
const issuesHtml=(diag.issues||[]).map(it=>{
const col=it.level==="danger"?"#ff8a8a" :(it.level==="warning"?"#ffd700" :"#85c1e9");
const icon=it.level==="danger"?"❌" :(it.level==="warning"?"⚠️" :"ℹ️");
return `<p style="font-size:11.5px;color:${col};margin:3px 0 0 0;">${icon} ${global.UIManager.escapeHtml(it.text)}</p>`;
}).join("");
const okBanner=diag.consistent&&(!diag.issues||diag.issues.length===0)
?`<p style="font-size:11.5px;color:#7ef7c4;margin:3px 0 0 0;">✅ Hệ thống lưu trữ ổn định, Auto-Save và các Ô Lưu Thủ Công đồng bộ an toàn.</p>`
:"";
const errBanner=this.game.lastSaveError
?`<p style="font-size:11.5px;color:#ff6b6b;margin:4px 0 0 0;">❌ Lỗi lưu gần nhất: ${global.UIManager.escapeHtml(this.game.lastSaveError.reason)}</p>`
:"";
cardsHtml.push(`
<div class="save-slot-card" style="flex-direction:column;align-items:stretch;border-color:${barColor};background:rgba(12,18,26,0.75);">
<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;">
<strong>🛡️ Sức Khỏe Lưu Trữ (Save v${global.GameEngine?global.GameEngine.SAVE_VERSION :4})</strong>
<span style="color:${barColor};">${stg.unavailable?"localStorage bị chặn" :`Bộ nhớ: ${stg.gameKB} KB / ~${stg.estimatedMaxKB} KB (${stg.percent}%)`}</span>
</div>
<div class="progress-bar" style="height:5px;margin-top:5px;">
<div class="progress-fill" style="width:${Math.max(2,stg.percent)}%;background:${barColor};"></div>
</div>
                        ${okBanner}${issuesHtml}${errBanner}
</div>
                `);
}
const totalSlots=typeof this.game.getSaveSlotCount==="function"?this.game.getSaveSlotCount() :3;
for (let slotNum=1;slotNum<=totalSlots;slotNum++) {
const summary=global.UIManager.escapeHtml(this.game.getSaveSlotSummary(slotNum));
const hasData=typeof this.game.hasSlotData==="function"?this.game.hasSlotData(slotNum) :false;
const backupLabelRaw=typeof this.game.hasSlotBackup==="function"?this.game.hasSlotBackup(slotNum) :null;
const backupLabel=backupLabelRaw?global.UIManager.escapeHtml(backupLabelRaw) :null;
const isActive=this.game.activeSaveSlot===slotNum;
const slotTag=slotNum>3?" (Mở rộng tự động)" :" (Độc lập)";
cardsHtml.push(`
<div class="save-slot-card" style="${isActive?"border-color:#5cc995;" :""}">
<div class="save-slot-meta">
<strong>🔒 Ô Lưu ${slotNum}${slotTag}${isActive?' <span class="badge" style="color:#7ef7c4">Đang chọn</span>' :""}</strong>
<p class="sub-text">${summary}</p>
</div>
<div class="save-actions">
<button class="btn-mini btn-save-style btn-save-slot" data-slot="${slotNum}">💾 Lưu</button>
<button class="btn-mini btn-load-style btn-load-slot" data-slot="${slotNum}" ${hasData?"" :"disabled"}>📂 Tải</button>
                            ${backupLabel?`<button class="btn-mini btn-restore-style btn-restore-slot" data-slot="${slotNum}" title="Khôi phục bản cũ: ${backupLabel}">↩️ Hoàn Tác</button>` :""}
                            ${hasData?`<button class="btn-mini btn-danger btn-delete-slot" data-slot="${slotNum}" title="Xóa Ô Lưu ${slotNum}">🗑️</button>` :""}
</div>
</div>
                `);
}
d.saveSlotsContainer.innerHTML=cardsHtml.join("");
}
class SaveUI {
constructor(uiManager) {this.ui=uiManager||null;}
render() {if (this.ui) _renderSettings.call(this.ui);}
}
global.SaveUI=SaveUI;
})(window);
