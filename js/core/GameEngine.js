(function (global) {
"use strict";
const SAVE_VERSION=(global.SaveManager&&global.SaveManager.SAVE_VERSION)||5;
const _SM_KEYS=(global.SaveManager&&global.SaveManager.KEYS)||{};
const SAVE_KEY_PREFIX=_SM_KEYS.SAVE_KEY_PREFIX||"van_co_tien_do_v2_slot_";
const BACKUP_KEY_PREFIX=_SM_KEYS.BACKUP_KEY_PREFIX||"van_co_tien_do_v2_backup_slot_";
const AUTO_SAVE_KEY=_SM_KEYS.AUTO_SAVE_KEY||"van_co_tien_do_v2_autosave";
const AUTO_SAVE_BACKUP_KEY=_SM_KEYS.AUTO_SAVE_BACKUP_KEY||"van_co_tien_do_v2_autosave_backup";
const MAX_SAVE_SLOTS=_SM_KEYS.MAX_SAVE_SLOTS||10;
const MARKET_RESET_INTERVAL_MS=5*60*1000;
const _sanitizeSaveString=(global.SaveManager&&global.SaveManager.sanitizeString)||((v,fb="")=>String(v||fb));
const STAGE_CATALOG=global.VanCoStageCatalog||[];
class GameEngine {
constructor() {
this.aperture=new global.ApertureSystem();
this.player=new global.PlayerManager(this.aperture);
this.map=new global.MapManager();
this.guSystem=new global.GuSystem();
this.combat=new global.CombatSystem();
this.enemies=new global.EnemyManager();
this.ui=new global.UIManager();
this.saveManager=global.SaveManager?new global.SaveManager(this) :null;
this.questManager=global.QuestManager?new global.QuestManager(this) :null;
this.eventManager=global.EventManager?new global.EventManager(this) :null;
this.stageManager=global.StageManager?new global.StageManager(this) :null;
this.apertureFX=global.ApertureVisualFX?new global.ApertureVisualFX(this) :null;
this.threeKingsStory=global.ThreeKingsStory?new global.ThreeKingsStory(this) :null;
this.beastArmy=global.BeastArmySystem?new global.BeastArmySystem(this) :null;
this.dreamRealmEngine=global.DreamRealmEngine?new global.DreamRealmEngine(this) :null;
this.stoneGambling=global.StoneGamblingSystem?new global.StoneGamblingSystem(this) :null;
this.guHouse=global.GuHouseSystem?new global.GuHouseSystem(this) :null;
this.bountySystem=global.BountySystem?new global.BountySystem(this) :null;
this.blessedLand=global.BlessedLandSystem?new global.BlessedLandSystem(this) :null;
this.reverseFlow=global.ReverseFlowSystem?new global.ReverseFlowSystem(this) :null;
this.canvas=null;
this.ctx=null;
this.ritualCanvas=null;
this.ritualCtx=null;
this.minimapCanvas=null;
this.minimapCtx=null;
this.isRunning=false;
this.currentScreen="creation";
this.lastFrameTime=performance.now();
this.hudRefreshTimer=0;
this.autoSaveTimer=8;
this.reinforcementTimer=14;
this.lastAutoSaveLabel="";
this.characterUid=null;
this.activeSaveSlot=null;
this.isPermadead=false;
this.isBattlePaused=false;
this.hasUserSetZoom=false;
this.marketRotation=null;
this._marketTimerTick=0;
this.lastSaveError=null;
this.crashRecoveryNotice=null;
this._lastQuotaAlertAt=0;
this.stageClears={};
this.claimedInheritances=[];
this.activeStage=null;
if (this.questManager) this.questManager.reset();
if (this.beastArmy) this.beastArmy.reset();
if (this.stoneGambling) this.stoneGambling.reset();
if (this.guHouse) this.guHouse.reset();
if (this.bountySystem) this.bountySystem.reset();
if (this.blessedLand) this.blessedLand.reset();
if (this.reverseFlow) this.reverseFlow.reset();
if (this.eventManager) this.eventManager.resetBattleEvents();
if (this.stageManager) this.stageManager.reset();
this.input={
up:false,
down:false,
left:false,
right:false,
sprint:false,
mouseX:0,
mouseY:0,
mouseWorldX:4000,
mouseWorldY:4000
};
this.nearestInteractTarget=null;
}
init() {
this.canvas=document.getElementById("gameCanvas");
if (this.canvas) this.ctx=this.canvas.getContext("2d",{alpha:false})||this.canvas.getContext("2d");
this.ritualCanvas=document.getElementById("ritualCanvas");
if (this.ritualCanvas) this.ritualCtx=this.ritualCanvas.getContext("2d");
this.minimapCanvas=document.getElementById("minimapCanvas");
if (this.minimapCanvas) this.minimapCtx=this.minimapCanvas.getContext("2d");
const systemsBundle={
game:this,
aperture:this.aperture,
player:this.player,
map:this.map,
guSystem:this.guSystem,
combat:this.combat,
enemies:this.enemies,
ui:this.ui
};
if (typeof this.aperture.init==="function") {
this.aperture.init(systemsBundle);
}
if (this.combat&&typeof this.combat.init==="function") this.combat.init(systemsBundle);
if (this.enemies&&typeof this.enemies.init==="function") this.enemies.init(systemsBundle);
if (this.ui&&typeof this.ui.init==="function") this.ui.init(systemsBundle);
this._hookEnemyDeathForStageProgression();
this._handleResize();
window.addEventListener("resize",()=>this._handleResize());
this._bindKeyboardAndMouseEvents();
this._bindBrowserAutoSaveEvents();
this.ensureMarketRotation(false);
this._checkCrashRecoveryOnBoot();
if (this.ui&&typeof this.ui.refreshStartScreenContinueButton==="function") {
this.ui.refreshStartScreenContinueButton();
}
this.isRunning=true;
this.lastFrameTime=performance.now();
requestAnimationFrame((ts)=>this._gameLoop(ts));
}
_handleResize() {
if (!this.canvas) return;
this.canvas.width=window.innerWidth;
this.canvas.height=window.innerHeight;
if (this.map) {
const z=this.map.camera.zoom||1.0;
this.map.camera.screenWidth=this.canvas.width;
this.map.camera.screenHeight=this.canvas.height;
this.map.camera.width=this.canvas.width / z;
this.map.camera.height=this.canvas.height / z;
}
}
setBattleZoom(newZoom,isUserAction=true) {
if (!this.map) return 1.0;
if (isUserAction) this.hasUserSetZoom=true;
const z=this.map.setZoom(newZoom);
if (this.ui&&typeof this.ui.updateZoomDisplay==="function") {
this.ui.updateZoomDisplay(z);
}
return z;
}
adjustBattleZoom(delta) {
if (!this.map) return 1.0;
this.hasUserSetZoom=true;
const z=this.map.adjustZoom(delta);
if (this.ui&&typeof this.ui.updateZoomDisplay==="function") {
this.ui.updateZoomDisplay(z);
}
return z;
}
resetAllInputs() {
if (!this.input) return;
this.input.up=false;
this.input.down=false;
this.input.left=false;
this.input.right=false;
this.input.sprint=false;
this.input.analogX=0;
this.input.analogY=0;
}
_bindBrowserAutoSaveEvents() {
const flushSave=(isCleanExit=false)=>{
if (this.currentScreen!=="creation"&& !this.isPermadead&&this.aperture&&this.aperture.isAwakened) {
const ok=this.autoSaveNow(isCleanExit?"browser_exit" :"visibility_hidden");
if (isCleanExit&&ok) {
this._updateSessionMarker(false,true);
}
}
};
window.addEventListener("beforeunload",()=>flushSave(true));
window.addEventListener("pagehide",()=>{
this.resetAllInputs();
flushSave(true);
});
window.addEventListener("blur",()=>{
this.resetAllInputs();
});
document.addEventListener("visibilitychange",()=>{
if (document.visibilityState==="hidden") {
this.resetAllInputs();
flushSave(false);
}
});
}
startNewGameFromRitual(playerName,originKey="righteous_clan",regionKey="nam_cuong",skinKey="phuong_nguyen") {
if (!this.aperture.isAwakened) {
this.aperture.finalizeAwakening();
}
this.characterUid=`char_${Date.now()}_${Math.random().toString(36).slice(2,10)}`;
this.activeSaveSlot=null;
this.isPermadead=false;
this.isBattlePaused=false;
this.stageClears={};
this.claimedInheritances=[];
this.activeStage=null;
this.marketRotation=null;
if (this.questManager) this.questManager.reset();
if (this.beastArmy) this.beastArmy.reset();
if (this.stoneGambling) this.stoneGambling.reset();
if (this.guHouse) this.guHouse.reset();
if (this.bountySystem) this.bountySystem.reset();
if (this.blessedLand) this.blessedLand.reset();
if (this.reverseFlow) this.reverseFlow.reset();
if (this.enemies) this.enemies.reset();
if (this.combat) this.combat.reset();
if (this.eventManager) this.eventManager.resetBattleEvents();
if (this.stageManager) this.stageManager.reset();
this.ensureMarketRotation(false);
this.player.initializeNewCharacter(playerName,originKey,regionKey,skinKey);
this.player.primevalStones=Math.max(24,Math.round(this.player.primevalStones*0.60));
this.guSystem.initializeStartingGu(this.aperture.vitalGuId,originKey);
this.currentScreen="hub";
this.ui.showScreen("hub");
this.ui.addLog(
`🎉 Khai Khiếu hoàn tất! Đạo hiệu: ${this.player.name} [${this.player.getRegionName()} - ${this.player.getFactionOriginName()}], Tư chất: ${this.aperture.aptitude.gradeName} (${this.aperture.aptitude.maxSeaPercent}% Biển Nguyên).`,
"cultivation"
);
if (this.aperture.aptitude&&this.aperture.aptitude.physique) {
this.ui.addLog(
"☯️ [THẬP TUYỆT THỂ CỨU MỆNH] Áp lực Không Khiếu tăng +1%/45s và chỉ reset khi tăng Đại Cảnh Giới. Ngươi được tặng sẵn 1x 🪨 Thạch Khiếu Cổ (-50% áp lực) và có thể mua ☯️ Âm Dương Chuyển Thân Cổ (Phòng Đấu Giá / Gia Tộc Khố Phòng) để phong ấn xuống 90% Giáp Đẳng sống an toàn chuẩn nguyên tác!",
"warning"
);
}
this.ui.addLog(
"💡 Lưu ý tu luyện: Hoàn thành mỗi Bản Đồ chính thưởng 0–2 Cổ Trùng ngẫu nhiên đúng bậc Chuyển (Xá Lợi Cổ rơi 1%). Để lên Cửu Chuyển Tôn Giả, cần lên Á Tiên Tôn rồi đạt đủ 30 Vạn Đạo Ngân + Đột Phá Phong Tỏa Thiên Đạo + Độ 3 Vạn Kiếp!",
"system"
);
this.autoSaveNow("new_character");
}
getStageCatalog() {
return STAGE_CATALOG;
}
getStageClearCount(stageId) {
return this.stageClears[stageId]||0;
}
getStageRepeatFactor(stageId) {
const st=STAGE_CATALOG.find(s=>s.id===stageId);
if (st&&st.isSpecialResourceStage) return 1.0;
const prevClears=this.getStageClearCount(stageId);
if (prevClears<=0) return 1.0;
return Math.max(0.08,Number((0.22 / (1 + (prevClears - 1)*0.15)).toFixed(2)));
}
isStageUnlocked(stageId) {
const st=STAGE_CATALOG.find(s=>s.id===stageId);
if (!st) return {unlocked:false,reason:"Không tồn tại"};
if (st.prevStageId&&this.getStageClearCount(st.prevStageId)<=0) {
const prev=STAGE_CATALOG.find(s=>s.id===st.prevStageId);
return {
unlocked:false,
reason:`Cần vượt qua [${prev?prev.name :"Ải trước"}]`
};
}
if (this.aperture.rank<st.reqRank) {
const rankLabel=global.GuSystem&&global.GuSystem.getRankName
?global.GuSystem.getRankName(st.reqRank)
:`${st.reqRank} Chuyển`;
const suffix=st.reqRank>=9?" Tôn Giả" :(st.reqRank>=6?" Cổ Tiên" :"");
return {
unlocked:false,
reason:`Yêu cầu đạt Cảnh giới ${rankLabel}${suffix}`
};
}
return {unlocked:true};
}
getStageBossConfigs(stage) {
if (!stage||stage.noBoss||stage.isSpecialResourceStage) return [];
if (Array.isArray(stage.venerableBosses)&&stage.venerableBosses.length>0) {
return stage.venerableBosses;
}
if (Array.isArray(stage.stageBosses)&&stage.stageBosses.length>0) {
return stage.stageBosses;
}
return [];
}
getStageBossDisplayNames(stage) {
const cfgs=this.getStageBossConfigs(stage);
if (cfgs.length>0) return cfgs.map(c=>c.name).join(", ");
return stage&&stage.bossName?stage.bossName :"Thủ Lĩnh";
}
enterStageBattle(stageId) {
const st=STAGE_CATALOG.find(s=>s.id===stageId);
if (!st) return;
const check=this.isStageUnlocked(stageId);
if (!check.unlocked) {
this.ui.addLog(`Không thể vào bản đồ: ${check.reason}!`,"warning");
return;
}
if (st.isStoryStage) {
if (st.id==="story_tam_vuong_dinh_tien_du"&&this.threeKingsStory) {
this.threeKingsStory.open();
}
return;
}
const isNoBoss=Boolean(st.noBoss||st.isSpecialResourceStage);
const bossConfigs=this.getStageBossConfigs(st);
const totalBossCount=isNoBoss?0 :(bossConfigs.length>0?bossConfigs.length :1);
this.activeStage={
...st,
kills:0,
harvests:0,
bossSpawned:false,
bossDefeated:false,
bossTotalCount:totalBossCount,
bossesRemaining:totalBossCount,
bossEntityIds:[]
};
if (this.map&&typeof this.map.applyStageTheme==="function") {
this.map.applyStageTheme(this.activeStage);
}
this.player.x=st.arenaCenterX;
this.player.y=st.arenaCenterY;
this.reinforcementTimer=14;
this.combat.reset();
this._spawnStageMonsters(this.activeStage);
if (this.beastArmy) this.beastArmy.deploySquadForBattle();
if (this.guHouse) this.guHouse.prepareForBattle();
if (this.bountySystem) this.bountySystem.onEnterBattle(this.activeStage);
if (this.stageManager) {
this.stageManager.setupStageMechanics(this.activeStage,this.map,this.player);
}
if (this.eventManager) {
this.eventManager.resetBattleEvents();
}
this.isBattlePaused=false;
this.currentScreen="battle";
if (!this.hasUserSetZoom) {
const _prefZoom=global.vanCoSettings?(Number(global.vanCoSettings.get("defaultBattleZoom"))||1.0) :1.0;
const _effZoom=(document.body&&document.body.classList.contains("mobile-ui")&&Math.abs(_prefZoom - 1.0)<0.02)?0.78 :_prefZoom;
this.setBattleZoom(_effZoom,false);
} else if (this.ui&&typeof this.ui.updateZoomDisplay==="function") {
this.ui.updateZoomDisplay(this.map?this.map.camera.zoom :1.0);
}
this._handleResize();
this.ui.showScreen("battle");
if (st.isSpecialResourceStage||st.noBoss) {
this.reinforcementTimer=24;
this.ui.addLog(
`🌾 Đã tiến vào Bí Cảnh Tài Nguyên 【${st.name}】! Không có Boss — hãy tự do farm Quái và 10 Mỏ Cổ Tài, sau đó bấm 'Rút Lui Về Đại Bản Doanh' bất cứ lúc nào!`,
"loot"
);
} else {
const bossLabel=this.getStageBossDisplayNames(st);
const bossTypeTag=st.reqRank>=9
?"Song Tôn Cửu Chuyển"
:(totalBossCount>1?`${totalBossCount} Thủ Lĩnh` :"Thủ Lĩnh");
this.ui.addLog(
`⚔️ Đã tiến vào chiến trường 【${st.name}】! Hãy tiêu diệt ${st.targetKills} mục tiêu để dẫn dụ ${bossTypeTag} 【${bossLabel}】 xuất hiện!`,
"combat"
);
}
}
_spawnStageMonsters(stage) {
if (!this.enemies) return;
this.enemies.beasts=[];
if (!Array.isArray(this.enemies.npcs)||this.enemies.npcs.length===0) {
this.enemies._spawnInitialNpcs();
}
const livingNpcs=this.enemies.npcs.filter(n=> !n.isDead);
livingNpcs.forEach((npc)=>{
const pt=this.map
?this.map.getRandomWalkablePoint(stage.arenaCenterX,stage.arenaCenterY,260,1350)
:{x:stage.arenaCenterX + 320,y:stage.arenaCenterY + 320};
npc.x=pt.x;
npc.y=pt.y;
npc.homeX=pt.x;
npc.homeY=pt.y;
npc.targetX=pt.x;
npc.targetY=pt.y;
npc.isHostile=false;
npc.lethalCombat=false;
});
const pool=Array.isArray(stage.mobPool)&&stage.mobPool.length>0?stage.mobPool :null;
const totalNormalMobs=stage.isSpecialResourceStage?9 :(stage.targetKills + 12);
for (let i=0;i<totalNormalMobs;i++) {
const pt=this.map
?this.map.getRandomWalkablePoint(stage.arenaCenterX,stage.arenaCenterY,280,2480)
:{x:stage.arenaCenterX + 300,y:stage.arenaCenterY + 300};
const mobCfg=pool?pool[i % pool.length] :null;
this._createStageEnemy(stage,pt.x,pt.y,false,false,null,mobCfg);
}
const eliteCount=stage.isSpecialResourceStage?2 :5;
for (let e=0;e<eliteCount;e++) {
const pt=this.map
?this.map.getRandomWalkablePoint(stage.arenaCenterX,stage.arenaCenterY,480,2420)
:{x:stage.arenaCenterX - 380,y:stage.arenaCenterY + 380};
const mobCfg=pool?pool[e % pool.length] :null;
this._createStageEnemy(stage,pt.x,pt.y,false,true,null,mobCfg);
}
}
_createStageEnemy(stage,x,y,isStageBoss=false,isElite=false,customBossConfig=null,mobVariantConfig=null) {
const stageRank=stage.reqRank||1;
const stageOrder=stage.order||1;
const isVenerableBoss=Boolean(isStageBoss&&stageRank>=9);
const entityRank=isVenerableBoss?9 :Math.min(8,stageRank);
const hpByRank={
1:125,
2:245,
3:460,
4:860,
5:1620,
6:7400,
7:21000,
8:56000,
9:340000
};
const atkByRank={
1:16,
2:29,
3:51,
4:92,
5:165,
6:1050,
7:2850,
8:7200,
9:38000
};
const defByRank={
1:10,
2:20,
3:40,
4:76,
5:145,
6:780,
7:2350,
8:6800,
9:28000
};
const pool=Array.isArray(stage.mobPool)&&stage.mobPool.length>0?stage.mobPool :null;
const chosenMob=(!isStageBoss&&mobVariantConfig)
?mobVariantConfig
:((!isStageBoss&&pool)?pool[Math.floor(Math.random()*pool.length)] :null);
const isSpecialFarm=Boolean(stage.isSpecialResourceStage);
const subOrderOffset=isSpecialFarm?0 :Math.max(0,(stageOrder - 1) % 3);
const stageStepMult=isSpecialFarm?0.90 :(1 + subOrderOffset*0.12);
let hpMult=1.0;
if (isStageBoss) {
hpMult=isVenerableBoss?4.4 :(entityRank>=6?3.4 :3.0);
} else if (isElite) {
hpMult=1.80;
}
const atkMult=isStageBoss
?(isVenerableBoss?1.60 :(entityRank>=6?1.42 :1.35))
:(isElite?1.20 :1.0);
const defMult=isStageBoss
?(isVenerableBoss?1.35 :(entityRank>=6?1.22 :1.18))
:(isElite?1.12 :1.0);
const bossPowerScale=isStageBoss?(stage.bossPowerScale||1.0) :1.0;
const customHpScale=(customBossConfig&&typeof customBossConfig.hpScale==="number")?customBossConfig.hpScale :1.0;
const isPseudoVenBoss=Boolean(isStageBoss&&stage.isPseudoVenerableBoss);
const baseHp=Math.round((hpByRank[entityRank]||155)*stageStepMult*hpMult*bossPowerScale*customHpScale);
const baseAtk=Math.round((atkByRank[entityRank]||24)*stageStepMult*atkMult*Math.sqrt(bossPowerScale));
const baseDef=Math.round((defByRank[entityRank]||8)*stageStepMult*defMult*Math.sqrt(bossPowerScale));
const isHumanEntity=isStageBoss
?Boolean(customBossConfig?(customBossConfig.isHuman!==false) :stage.bossIsHuman)
:(chosenMob?Boolean(chosenMob.isHuman) :Boolean(stage.mobIsHuman));
const rawMobName=chosenMob?chosenMob.name :stage.mobName;
const customName=customBossConfig
?customBossConfig.name
:(isStageBoss
?stage.bossName
:(isElite?(stage.eliteName?`[Tinh Anh] ${stage.eliteName}` :`[Tinh Anh] ${rawMobName}`) :rawMobName));
const icons={1:"🐺",2:"🐗",3:"🦅",4:"🐍",5:"🦣",6:"🐉",7:"⚔️",8:"👑",9:"👑"};
const skinPool=["phuong_nguyen","bach_ngung_bang","phuong_cuu_ca","hac_lau_lan","hong_lien","u_hon","tinh_tu"];
const initialShield=isVenerableBoss
?Math.round(baseHp*0.25)
:(isStageBoss
?Math.round(baseHp*(entityRank>=6?0.18 :(entityRank>=2?0.14 :0.10)))
:(isElite&&entityRank>=2?Math.round(baseHp*0.12) :0));
const resolvedTypeId=isStageBoss
?((customBossConfig&&customBossConfig.templateId)||stage.bossTemplateId)
:((chosenMob&&chosenMob.templateId)||stage.mobTemplateId);
const resolvedColor=(customBossConfig&&(customBossConfig.projectileColor||customBossConfig.color))
||(isStageBoss?(stage.bossColor||"#ff4d4d") :(chosenMob&&chosenMob.color?chosenMob.color :(isElite?"#c278ff" :"#e0be77")));
const resolvedProjColor=(customBossConfig&&customBossConfig.projectileColor)
||(isStageBoss?"#ff5733" :(chosenMob&&chosenMob.color?chosenMob.color :(isElite?"#c278ff" :"#5cc995")));
const spdBoost=(chosenMob&&chosenMob.spdScale)?chosenMob.spdScale :1.0;
const entity={
id:`stage_mob_${Date.now()}_${Math.floor(Math.random()*100000)}`,
entityType:"beast",
typeId:resolvedTypeId,
name:customName,
title:isVenerableBoss
?"Cửu Chuyển Vô Địch Tôn Giả"
:(isStageBoss
?`Thủ Lĩnh ${entityRank} Chuyển`
:(isElite?`Tinh Anh ${entityRank} Chuyển` :`Quái ${entityRank} Chuyển`)),
icon:isStageBoss?(isVenerableBoss?"👑" :"👹") :(isElite?"⚡" :(icons[entityRank]||"🐺")),
rank:entityRank,
isBoss:isStageBoss,
isStageBoss:isStageBoss,
isPseudoVenerable:isPseudoVenBoss,
isVenerable:isVenerableBoss,
rankBadge:(customBossConfig&&customBossConfig.rankBadge)
?customBossConfig.rankBadge
:(isStageBoss&&stage.bossRankBadge
?stage.bossRankBadge
:`${entityRank} Chuyển`),
hasRevivedOnce:false,
enraged:false,
isElite:isElite,
isHuman:isHumanEntity,
skinKey:customBossConfig&&customBossConfig.skinKey
?customBossConfig.skinKey
:(isStageBoss
?(stage.bossSkinKey||skinPool[stageOrder % skinPool.length])
:((chosenMob&&chosenMob.skinKey)||skinPool[(stageOrder + Math.floor(Math.random()*5)) % skinPool.length])),
killerMoveName:customBossConfig&&customBossConfig.killerMoveList
?customBossConfig.killerMoveList[0]
:((customBossConfig&&customBossConfig.killerMoveName)||stage.bossKillerMove||`Sát Chiêu ${entityRank} Chuyển`),
killerMoveList:customBossConfig&&Array.isArray(customBossConfig.killerMoveList)
?customBossConfig.killerMoveList
:null,
guLoadout:customBossConfig&&Array.isArray(customBossConfig.guLoadout)
?customBossConfig.guLoadout
:null,
attackGuName:customBossConfig&&customBossConfig.guLoadout
?customBossConfig.guLoadout[0]
:((customBossConfig&&customBossConfig.attackGuName)||stage.bossAttackGu||`Cổ Thuật ${entityRank} Chuyển`),
defGuName:customBossConfig&&customBossConfig.defGuName
?customBossConfig.defGuName
:(stage.bossDefGu||`Hộ Thân Cổ ${entityRank} Chuyển`),
moveGuName:customBossConfig&&customBossConfig.moveGuName
?customBossConfig.moveGuName
:(entityRank>=6?"Định Tiên Du" :"Thanh Phong Luân Cổ"),
x:x,
y:y,
spawnX:x,
spawnY:y,
radius:isVenerableBoss?26 :(isStageBoss?22 :(isElite?17 :14)),
hp:baseHp,
maxHp:baseHp,
shieldHp:initialShield,
maxShieldHp:initialShield,
atk:baseAtk,
def:baseDef,
spd:Math.round((isVenerableBoss?196 :(isStageBoss?(142 + entityRank*6) :(isElite?(132 + entityRank*5) :(122 + entityRank*4))))*spdBoost),
aggroRange:isVenerableBoss?1150 :(isStageBoss?760 :(isElite?490 :410)),
attackRange:(isStageBoss||isHumanEntity||isElite)?(340 + entityRank*18) :48,
rangedGuId:(isStageBoss||isHumanEntity||isElite)?"phong_nhan_gu" :null,
projectileColor:resolvedProjColor,
color:resolvedColor,
drops:(stage.isSpecialResourceStage&&Array.isArray(stage.mobDrops))
?stage.mobDrops.map(d=>{
const isRelic=String(d.itemId||"").endsWith("_relic_gu");
return {
itemId:d.itemId,
chance:isRelic?0.01 :Math.min(0.95,isElite?d.chance*1.35 :d.chance),
min:isRelic?1 :(isElite?Math.max(1,Math.round((d.min||1)*1.5)) :(d.min||1)),
max:isRelic?1 :(isElite?Math.max(1,Math.round((d.max||1)*1.6)) :(d.max||1))
};
})
:[
{
itemId:"primeval_stone",
chance:isStageBoss?0.85 :(isElite?0.45 :0.18),
min:1,
max:isStageBoss?Math.max(2,entityRank*3) :(isElite?Math.max(1,entityRank) :1)
},
{
itemId:"ration_meat",
chance:isStageBoss?0.50 :0.18,
min:1,
max:1
}
],
aiState:isStageBoss?"chase" :"patrol",
patrolTargetX:x,
patrolTargetY:y,
patrolTimer:1.5 + Math.random()*3,
attackCooldown:0,
guSkillCooldown:1.0,
defGuCooldown:3.0,
moveGuCooldown:2.5,
healGuCooldown:5.0,
killerMoveCooldown:isVenerableBoss?1.8 :4.5,
dashSkillCooldown:4.0,
slowTimer:0,
slowFactor:1.0,
calledAllies:false,
isHostile:true,
isDead:false,
respawnTimer:9999
};
this.enemies.beasts.push(entity);
return entity;
}
_hookEnemyDeathForStageProgression() {
const origHandleDeath=this.enemies._handleEntityDeath.bind(this.enemies);
this.enemies._handleEntityDeath=(target,player,combatSystem)=>{
origHandleDeath(target,player,combatSystem);
if (this.currentScreen!=="battle"|| !this.activeStage) return;
if (this.bountySystem&&(target.isBountyTarget||target.isAmbushEnforcer)) {
this.bountySystem.onEntityKilled(target);
this.ui.updateBattleHUD();
return;
}
const st=this.activeStage;
if (target.isStageBoss) {
st.bossesRemaining=Math.max(0,(st.bossesRemaining||1) - 1);
if (st.bossesRemaining<=0) {
st.bossDefeated=true;
this._completeActiveStage();
} else {
const survivingBosses=(this.enemies.beasts||[]).filter(b=>b.isStageBoss&& !b.isDead);
if (target.isVenerable) {
for (const surv of survivingBosses) {
surv.enraged=true;
surv.hp=Math.min(surv.maxHp,surv.hp + Math.round(surv.maxHp*0.20));
surv.shieldHp=Math.round(surv.maxHp*0.25);
surv.maxShieldHp=surv.shieldHp;
this.combat.spawnFloatingText(
surv.x,
surv.y - 46,
`👑 THÔN PHỆ ĐẠO NGÂN — CUỒNG BẠO CỰC HẠN!`,
"#ff3b30"
);
}
this.combat.spawnFloatingText(
this.player.x,
this.player.y - 42,
`🔥 Đã đánh bại ${target.name}! Tôn Giả còn lại hóa Cuồng Bạo!`,
"#ffd700"
);
this.ui.addLog(
`🔥 Ngươi đã đánh bại 【${target.name}】! Nhưng vị Tôn Giả còn lại vừa thôn phệ đạo ngân Hỗn Độn, khôi phục 20% Sinh Mệnh + 25% Hộ Thuẫn và tiến vào trạng thái CUỒNG BẠO CỰC HẠN!`,
"danger"
);
} else {
this.combat.spawnFloatingText(
this.player.x,
this.player.y - 40,
`⚔️ Đã trảm sát ${target.name}! Còn ${st.bossesRemaining} Thủ Lĩnh!`,
"#ffd700"
);
this.ui.addLog(
`⚔️ Đã đánh bại Thủ Lĩnh 【${target.name}】! Còn lại ${st.bossesRemaining} Thủ Lĩnh trên chiến trường (${survivingBosses.map(b=>b.name).join(", ")})!`,
"combat"
);
}
this.ui.updateBattleHUD();
}
return;
}
if (target.entityType!=="beast") {
this.ui.updateBattleHUD();
return;
}
if (st.isSpecialResourceStage||st.noBoss) {
st.kills +=1;
const mult=target.isElite?2 :1;
if (st.mobMeritReward) {
this.player.meritPoints=(this.player.meritPoints||0) + (st.mobMeritReward*mult);
}
if (st.mobHumanQiReward) {
this.aperture.humanQi +=(st.mobHumanQiReward*mult);
} else if (st.mobHumanQiChance&&Math.random()<=st.mobHumanQiChance*mult) {
this.aperture.humanQi +=1;
}
if (st.kills % 10===0) {
this.combat.spawnFloatingText(
this.player.x,
this.player.y - 36,
`🌾 Đã farm ${st.kills} quái! (Tự động lưu)`,
"#7ef7c4"
);
this.autoSaveNow("farm_milestone");
}
this.ui.updateBattleHUD();
return;
}
if (this.questManager) {
this.questManager.recordEvent("kill_any",target.typeId||"mob",1);
}
st.kills +=target.isElite?2 :1;
const isArenaDuel=Boolean(
this.stageManager&&
this.stageManager.activeMechanic&&
this.stageManager.activeMechanic.mode==="arena_duel"&&
!this.stageManager.mechanicCompleted
);
if (!isArenaDuel&& !st.bossSpawned&&st.kills>=st.targetKills) {
this.spawnStageBossNow();
}
this.ui.updateBattleHUD();
};
}
spawnStageBossNow() {
const st=this.activeStage;
if (!st||st.bossSpawned||st.noBoss||st.isSpecialResourceStage) return;
st.bossSpawned=true;
st.bossEntityIds=[];
const multiBosses=this.getStageBossConfigs(st);
if (multiBosses.length>0) {
st.bossTotalCount=multiBosses.length;
st.bossesRemaining=multiBosses.length;
const isVenStage=Array.isArray(st.venerableBosses)&&st.venerableBosses.length>0;
multiBosses.forEach((bCfg,idx)=>{
const angle=(Math.PI*2*idx)/multiBosses.length - Math.PI/4;
const spawnDist=isVenStage?280 :250;
const maxW=(this.map&&this.map.worldWidth)?this.map.worldWidth - 260 :7740;
const maxH=(this.map&&this.map.worldHeight)?this.map.worldHeight - 260 :7740;
const bx=Math.max(260,Math.min(maxW,Math.round(this.player.x + Math.cos(angle)*spawnDist)));
const by=Math.max(260,Math.min(maxH,Math.round(this.player.y + Math.sin(angle)*spawnDist)));
const bossEnt=this._createStageEnemy(st,bx,by,true,false,bCfg);
st.bossEntityIds.push(bossEnt.id);
});
const namesStr=multiBosses.map(b=>b.name).join(", ");
if (isVenStage) {
this.combat.spawnFloatingText(this.player.x,this.player.y - 46,`👑 SONG TÔN CỬU CHUYỂN GIÁNG LÂM!`,"#00e5ff");
this.ui.addLog(
`👑 Uy áp Cửu Chuyển chấn động Vô Cực Hỗn Độn Đại Trận! 【${namesStr}】 kết thành Song Tôn Liên Thủ Đại Trận vây công ngươi!`,
"danger"
);
} else {
this.combat.spawnFloatingText(this.player.x,this.player.y - 44,`⚠️ ${multiBosses.length} THỦ LĨNH XUẤT TRẬN!`,"#ff4d4d");
this.ui.addLog(
`⚠️ ${multiBosses.length} Thủ Lĩnh 【${namesStr}】 đã đồng loạt xuất hiện vây công ngươi!`,
"danger"
);
}
} else {
st.bossTotalCount=1;
st.bossesRemaining=1;
const spawnAngle=Math.random()*Math.PI*2;
const maxW2=(this.map&&this.map.worldWidth)?this.map.worldWidth - 240 :7760;
const maxH2=(this.map&&this.map.worldHeight)?this.map.worldHeight - 240 :7760;
const bx=Math.max(240,Math.min(maxW2,Math.round(this.player.x + Math.cos(spawnAngle)*240)));
const by=Math.max(240,Math.min(maxH2,Math.round(this.player.y + Math.sin(spawnAngle)*240)));
const boss=this._createStageEnemy(st,bx,by,true,false);
st.bossEntityIds.push(boss.id);
this.combat.spawnFloatingText(this.player.x,this.player.y - 40,`⚠️ ${st.bossName} Giáng Lâm!`,"#ff4d4d");
this.ui.addLog(
`⚠️ Thủ lĩnh 【${st.bossName}】 (${boss.isHuman?"Tinh thông Cổ Thuật & Sát Chiêu" :"Hung Thú Bá Chủ"}) đã xuất hiện cách ngươi không xa!`,
"danger"
);
}
if (this.ui) this.ui.updateBattleHUD();
}
_completeActiveStage() {
const st=this.activeStage;
if (!st) return;
const prevClears=this.stageClears[st.id]||0;
const isFirstClear=prevClears===0;
const repeatFactor=this.getStageRepeatFactor(st.id);
this.stageClears[st.id]=prevClears + 1;
const actualStones=isFirstClear
?st.rewardStones
:Math.max(1,Math.round(st.rewardStones*repeatFactor));
const actualMerit=isFirstClear
?st.rewardMerit
:Math.max(1,Math.round(st.rewardMerit*repeatFactor));
const actualHumanQi=(isFirstClear||st.isSpecialResourceStage)
?st.rewardHumanQi
:(Math.random()<0.20?1 :0);
const stoneBonusMult=(this.questManager&&typeof this.questManager.getPassiveBonuses==="function")
?(1 + (this.questManager.getPassiveBonuses().stoneDropPct||0))
:1.0;
const boostedStones=Math.round(actualStones*stoneBonusMult);
this.player.primevalStones +=boostedStones;
this.player.meritPoints=(this.player.meritPoints||0) + actualMerit;
this.aperture.humanQi +=actualHumanQi;
if (this.questManager) {
const regKey=(this.map&&this.map.worldMap)
?this.map.worldMap.resolveRegionKey(st.regionName)
:"nam_cuong";
const repGain=isFirstClear?(15 + (st.reqRank||1)*8) :(4 + (st.reqRank||1)*2);
this.questManager.addReputation(regKey,repGain);
this.questManager.recordEvent("clear_stage",st.id,1);
}
const obtainedItems=[];
if (Array.isArray(st.drops)) {
for (const d of st.drops) {
const isRelic=String(d.itemId||"").endsWith("_relic_gu");
const effectiveChance=isRelic
?0.01
:((isFirstClear||st.isSpecialResourceStage)?d.chance :d.chance*0.35);
if (Math.random()<=effectiveChance) {
this.player.addItem(d.itemId,d.count||1);
const meta=global.PlayerManager.ITEM_DATABASE[d.itemId]||{name:d.itemId,icon:"📦"};
obtainedItems.push(`${d.count||1}x ${meta.icon} ${meta.name}`);
}
}
}
const stageRank=st.reqRank||1;
const guDropCount=Math.floor(Math.random()*3);
const obtainedGus=[];
if (guDropCount>0&&global.GuSystem&&global.GuSystem.GU_DATABASE) {
let candidates=Object.values(global.GuSystem.GU_DATABASE).filter(
tpl=>tpl.minRank<=stageRank&&tpl.maxRank>=stageRank
);
if (stageRank>=6) {
candidates=candidates.filter(tpl=> !this.guSystem.hasImmortalGu(tpl.id));
}
for (let g=0;g<guDropCount;g++) {
if (candidates.length===0) {
if (stageRank>=6) {
const compStones=2*(stageRank - 5);
this.player.addItem("immortal_stone",compStones);
obtainedGus.push(`🌟 +${compStones} Tiên Thạch (đã đủ Tiên Cổ ${stageRank} Chuyển)`);
}
break;
}
const pickIdx=Math.floor(Math.random()*candidates.length);
const pickedTpl=candidates[pickIdx];
const added=this.guSystem.addGuToStorage(pickedTpl.id,{
rank:stageRank,
isRefined:false,
refinementProgress:0,
isVital:false
});
if (added) {
const fullGuLabel=global.GuSystem.formatGuNameWithRank
?global.GuSystem.formatGuNameWithRank(added)
:`${added.name} ${stageRank} Chuyển`;
obtainedGus.push(`${added.icon} ${fullGuLabel} [Chưa Luyện Hóa]`);
if (stageRank>=6) {
candidates.splice(pickIdx,1);
}
}
}
}
this.player.heal(Math.round(this.player.maxHp*0.45));
const clearTypeText=st.isSpecialResourceStage
?"[Bí Cảnh Tài Nguyên — Luôn 100% Thưởng]"
:(isFirstClear
?"[Thưởng Vượt Ải Lần Đầu 100%]"
:`[Thưởng Cày Lại Lần ${prevClears + 1} (${Math.round(repeatFactor*100)}%)]`);
const clearTypeColor=st.isSpecialResourceStage?"#5cc995" :(isFirstClear?"#ffd700" :"#b3aa9c");
const guRewardText=obtainedGus.length>0
?obtainedGus.join(", ")
:`0 con (Chưa gặp duyên Cổ Trùng ${stageRank} Chuyển lần này)`;
const stoneBonusPct=Math.round((stoneBonusMult - 1)*100);
const rewardData={
bossName:this.getStageBossDisplayNames(st),
stageName:st.name,
clearTypeText:clearTypeText,
clearTypeColor:clearTypeColor,
actualStones:boostedStones,
baseStones:actualStones,
stoneBonusPct:stoneBonusPct,
actualMerit:actualMerit,
actualHumanQi:actualHumanQi,
stageRank:stageRank,
guRewardText:guRewardText,
itemsText:obtainedItems.length?obtainedItems.join(", ") :"Không rơi thêm bảo vật hiếm"
};
const stoneBonusNote=stoneBonusPct>0?` (gồm +${stoneBonusPct}% thưởng Danh Vọng)` :"";
this.ui.addLog(
`🏆 Vượt ải 【${st.name}】 (${isFirstClear?"Lần đầu" :"Cày lại"}): +${boostedStones.toLocaleString("vi-VN")} Nguyên Thạch${stoneBonusNote}, +${actualMerit.toLocaleString("vi-VN")} Cống Hiến, +${actualHumanQi} Nhân Khí | Cổ Trùng (${guDropCount}/2): ${guRewardText}.`,
"loot"
);
this.autoSaveNow("stage_clear");
this.ui.updateBattleHUD();
if (global.vanCoSfx) global.vanCoSfx.play("victory");
this.ui.showStageVictoryModal(st,rewardData);
}
retreatToHub() {
if (this.beastArmy) this.beastArmy.recallSquadAfterBattle();
if (this.guHouse) this.guHouse.cleanupAfterBattle();
if (this.bountySystem) {this.bountySystem.alertBannerTimer=0;this.bountySystem.alertBannerText="";}
const prevStage=this.activeStage;
if (prevStage&&(prevStage.isSpecialResourceStage||prevStage.noBoss)) {
if ((prevStage.kills||0)>0||(prevStage.harvests||0)>0) {
this.ui.addLog(
`🌾 Kết thúc chuyến farm tại 【${prevStage.name}】: Đã diệt ${prevStage.kills||0} quái & khai thác ${prevStage.harvests||0} mỏ cổ tài! Toàn bộ tài nguyên đã được giữ nguyên.`,
"loot"
);
}
this.autoSaveNow("farm_return");
}
this.activeStage=null;
this.isBattlePaused=false;
this.combat.reset();
if (this.stageManager) this.stageManager.reset();
if (this.eventManager) this.eventManager.resetBattleEvents();
this.currentScreen="hub";
if (this.ui.dom.stageVictoryModal) {
this.ui.dom.stageVictoryModal.classList.add("hidden");
}
if (typeof this.ui.closeNpcInteractionModal==="function") {
this.ui.closeNpcInteractionModal();
}
this.ui.showScreen("hub");
}
isInheritanceClaimed(inhId) {
return this.claimedInheritances.includes(inhId);
}
claimInheritance(inh) {
if (!inh||this.isInheritanceClaimed(inh.id)) return;
this.claimedInheritances.push(inh.id);
const stoneGrant=Math.max(15,Math.round((inh.rewardStones||40)*0.45));
this.player.primevalStones +=stoneGrant;
if (inh.rewardItemId) {
this.player.addItem(inh.rewardItemId,1);
}
let guRewardNote="Cổ Trùng truyền thừa";
if (inh.rewardGuId) {
const targetRank=inh.rewardGuRank||inh.reqRank||1;
if (targetRank>=6&&this.guSystem.hasImmortalGu(inh.rewardGuId)) {
this.player.addItem("immortal_stone",30);
guRewardNote="+30 Tiên Nguyên Thạch (bồi thường vì Tiên Cổ là duy nhất và ngươi đã sở hữu)";
} else {
this.guSystem.addGuToStorage(inh.rewardGuId,{
rank:targetRank,
isRefined:false,
refinementProgress:0,
isVital:false
});
guRewardNote="Cổ Trùng truyền thừa (Chưa Luyện Hóa — cần Luyện Hóa tại Kho Cổ)";
}
}
const isImm=this.aperture&&this.aperture.isImmortal;
let daoRewardNote="";
if (inh.rewardDaoPath&&inh.rewardDaoMarks) {
this.player.addPathAttainmentExp(inh.rewardDaoPath,inh.rewardDaoMarks);
if (isImm) {
this.player.addDaoMarks(inh.rewardDaoPath,inh.rewardDaoMarks);
daoRewardNote=` và +${inh.rewardDaoMarks} Đạo Ngân ${inh.rewardDaoPath}`;
} else {
daoRewardNote=` và +${inh.rewardDaoMarks} Lĩnh Ngộ ${inh.rewardDaoPath} (Phàm nhân chưa có Đạo Ngân)`;
}
}
this.ui.addLog(
`🕯️ Đã kế thừa 【${inh.name}】! Nhận ${guRewardNote}, +${stoneGrant} Nguyên Thạch${daoRewardNote}!`,
"cultivation"
);
this.autoSaveNow("claim_inheritance");
}
_bindKeyboardAndMouseEvents() {
window.addEventListener("mousemove",(e)=>{
this.input.mouseX=e.clientX;
this.input.mouseY=e.clientY;
if (this.map) {
const pt=this.map.screenToWorld(e.clientX,e.clientY);
this.input.mouseWorldX=pt.x;
this.input.mouseWorldY=pt.y;
}
});
if (this.canvas) {
this.canvas.addEventListener("mousedown",(e)=>{
if (this.currentScreen!=="battle") return;
if (e.button===0&&this.map) {
const pt=this.map.screenToWorld(e.clientX,e.clientY);
this.input.mouseWorldX=pt.x;
this.input.mouseWorldY=pt.y;
}
});
this.canvas.addEventListener("wheel",(e)=>{
if (this.currentScreen!=="battle"||this.isBattlePaused) return;
e.preventDefault();
const delta=e.deltaY<0?0.10 :-0.10;
this.adjustBattleZoom(delta);
},{passive:false});
}
window.addEventListener("keydown",(e)=>{
const tag=document.activeElement?document.activeElement.tagName.toLowerCase() :"";
if (tag==="input"||tag==="select"||tag==="textarea") return;
const _st=global.vanCoSettings;
if (_st&&(_st.isListeningKey()||_st.isOpen())) return;
if (global.vanCoQuickBag&&global.vanCoQuickBag.isOpen()) return;
if (this.currentScreen!=="battle") return;
const code=e.code;
if (this.isBattlePaused||this.isPermadead) return;
if (code==="Equal"||code==="NumpadAdd") {
e.preventDefault();
this.adjustBattleZoom(0.10);
return;
}
if (code==="Minus"||code==="NumpadSubtract") {
e.preventDefault();
this.adjustBattleZoom(-0.10);
return;
}
if (code==="Digit0"||code==="Numpad0") {
e.preventDefault();
this.setBattleZoom(1.0,true);
return;
}
if (code==="Escape") {
e.preventDefault();
if (this.ui&&this.ui.activeInteractingNpc) {
this.ui.closeNpcInteractionModal();
return;
}
this.retreatToHub();
return;
}
const isKey=(act,fallback)=>_st?_st.isActionKey(act,code) :(code===fallback);
if (isKey("moveUp","KeyW")||code==="ArrowUp") this.input.up=true;
if (isKey("moveDown","KeyS")||code==="ArrowDown") this.input.down=true;
if (isKey("moveLeft","KeyA")||code==="ArrowLeft") this.input.left=true;
if (isKey("moveRight","KeyD")||code==="ArrowRight") this.input.right=true;
if (isKey("sprint","ShiftLeft")||code==="ShiftRight") this.input.sprint=true;
if (isKey("interact","KeyE")&& !e.repeat) {
e.preventDefault();
this._handleInteractKeyInBattle();
return;
}
if (isKey("enslave","KeyH")&& !e.repeat) {
e.preventDefault();
if (this.beastArmy) this.beastArmy.attemptEnslaveNearestBeast();
return;
}
if (isKey("formationCycle","KeyY")&& !e.repeat) {
e.preventDefault();
if (this.beastArmy) this.beastArmy.cycleFormation();
return;
}
if (isKey("guHouseBoard","KeyN")&& !e.repeat) {
e.preventDefault();
if (this.guHouse) this.guHouse.toggleBoard(true);
return;
}
if (isKey("guHouseUlt","KeyU")&& !e.repeat) {
e.preventDefault();
if (this.guHouse) this.guHouse.triggerUltimate();
return;
}
if (!e.repeat) {
for (let slotIdx=0;slotIdx<8;slotIdx++) {
if (isKey(`gu${slotIdx}`,`Digit${slotIdx + 1}`)) {
this.combat.activateGuSlot(slotIdx,this.input.mouseWorldX,this.input.mouseWorldY);
return;
}
}
for (let kIdx=0;kIdx<4;kIdx++) {
const kDef=["KeyZ","KeyX","KeyC","KeyV"][kIdx];
if (isKey(`killer${kIdx}`,kDef)) {
this.combat.activateKillerMoveSlot(kIdx,this.input.mouseWorldX,this.input.mouseWorldY);
return;
}
}
if (this.ui.keybindMode==="hybrid") {
if (code==="KeyQ") this.combat.activateGuSlot(0,this.input.mouseWorldX,this.input.mouseWorldY);
if (code==="KeyR") this.combat.activateGuSlot(2,this.input.mouseWorldX,this.input.mouseWorldY);
if (code==="KeyT") this.combat.activateGuSlot(3,this.input.mouseWorldX,this.input.mouseWorldY);
if (code==="KeyF") this.combat.activateGuSlot(7,this.input.mouseWorldX,this.input.mouseWorldY);
}
}
});
window.addEventListener("keyup",(e)=>{
const code=e.code;
const _st=global.vanCoSettings;
const isKey=(act,fallback)=>_st?_st.isActionKey(act,code) :(code===fallback);
if (isKey("moveUp","KeyW")||code==="ArrowUp") this.input.up=false;
if (isKey("moveDown","KeyS")||code==="ArrowDown") this.input.down=false;
if (isKey("moveLeft","KeyA")||code==="ArrowLeft") this.input.left=false;
if (isKey("moveRight","KeyD")||code==="ArrowRight") this.input.right=false;
if (isKey("sprint","ShiftLeft")||code==="ShiftRight") this.input.sprint=false;
});
}
_handleInteractKeyInBattle() {
if (this.eventManager) {
const nearEvent=this.eventManager.getNearestBattleEvent(this.player.x,this.player.y,68);
if (nearEvent) {
this.eventManager.interactWithBattleEvent(this.player,this.aperture,this.guSystem,this.combat);
this.ui.updateBattleHUD();
return;
}
}
if (this.stageManager) {
const nearProp=this.stageManager.getNearestInteractableProp(this.player.x,this.player.y,74);
if (nearProp) {
this.stageManager.interactWithProp(nearProp,this.activeStage,this.player,this.combat);
this.ui.updateBattleHUD();
return;
}
}
const nearNpc=this.enemies
?this.enemies.getNearestInteractableNpc(this.player.x,this.player.y,58)
:null;
const nearNode=this.map
?this.map.getNearestInteractableNode(this.player.x,this.player.y,58)
:null;
const distNpc=nearNpc?Math.hypot(nearNpc.x - this.player.x,nearNpc.y - this.player.y) :Infinity;
const distNode=nearNode?Math.hypot(nearNode.x - this.player.x,nearNode.y - this.player.y) :Infinity;
if (nearNpc&&distNpc<=distNode) {
if (this.ui&&typeof this.ui.openNpcInteractionModal==="function") {
this.ui.openNpcInteractionModal(nearNpc);
}
return;
}
if (!nearNode) return;
const res=this.map.harvestNode(nearNode.id,this.player,this.guSystem);
this.ui.addLog(res.message,res.success?"loot" :"warning");
if (res.success) {
if (this.activeStage) {
this.activeStage.harvests=(this.activeStage.harvests||0) + 1;
}
const floatLabel=res.floatingText
||(nearNode.isWildGu?"Bắt Cổ Hoang Dã!" :`+${res.amount} Cổ Tài`);
this.combat.spawnFloatingText(
nearNode.x,
nearNode.y - 20,
floatLabel,
"#5cc995"
);
if (!nearNode.isWildGu&&this.enemies) {
this.enemies.notifyQuestProgress("harvest_node",1);
}
if (this.bountySystem) {
this.bountySystem.tryTriggerAmbush("harvest");
}
}
this.ui.updateBattleHUD();
}
_gameLoop(timestamp) {
if (!this.isRunning) return;
if (document.hidden) {
this.lastFrameTime=timestamp;
setTimeout(()=>requestAnimationFrame((ts)=>this._gameLoop(ts)),350);
return;
}
const rawDt=(timestamp - this.lastFrameTime) / 1000;
if (this.currentScreen==="battle") {
const dt=Math.min(0.1,Math.max(0.001,rawDt));
this.lastFrameTime=timestamp;
this._updateBattleState(dt);
this._renderBattleArena();
requestAnimationFrame((ts)=>this._gameLoop(ts));
return;
}
if (this.currentScreen==="creation") {
const ritualVisible=this.ui&&this.ui.dom&&this.ui.dom.stepRitual&& !this.ui.dom.stepRitual.classList.contains("hidden");
if (ritualVisible&&rawDt>=0.048) {
const dt=Math.min(0.1,rawDt);
this.lastFrameTime=timestamp;
this.aperture.ritualState.animTick +=dt;
if (this.ritualCtx) this.aperture.renderRitualCanvas(this.ritualCtx);
} else if (!ritualVisible) {
this.lastFrameTime=timestamp;
}
setTimeout(()=>requestAnimationFrame((ts)=>this._gameLoop(ts)),ritualVisible?45 :220);
return;
}
if (this.currentScreen==="hub") {
if (rawDt>=0.14) {
const dt=Math.min(0.5,rawDt);
this.lastFrameTime=timestamp;
this._updateHubState(dt);
}
setTimeout(()=>requestAnimationFrame((ts)=>this._gameLoop(ts)),140);
return;
}
this.lastFrameTime=timestamp;
requestAnimationFrame((ts)=>this._gameLoop(ts));
}
_updateHubState(dt) {
if (this.isPermadead) return;
this.aperture.update(dt,this.player);
if (this.isPermadead) return;
if (this.player.hp<this.player.maxHp) {
const hubHpRegen=Math.max(2.5,this.player.maxHp*0.025);
this.player.hp=Math.min(this.player.maxHp,this.player.hp + hubHpRegen*dt);
}
if (this.player.mental<this.player.maxMental) {
const hubMentalRegen=Math.max(2.0,this.player.maxMental*0.02);
this.player.mental=Math.min(this.player.maxMental,this.player.mental + hubMentalRegen*dt);
}
this._tickMarketRotation(dt);
if (this.blessedLand) this.blessedLand.update(dt);
this.hudRefreshTimer +=dt;
if (this.hudRefreshTimer>=0.28) {
this.hudRefreshTimer=0;
this.ui.updateHubTopbar();
if (this.ui.activeHubTab==="tab-aperture"&&this.ui.dom.apertureCanvas) {
this.aperture.renderApertureCanvas(this.ui.dom.apertureCanvas.getContext("2d"));
}
}
const _asEnabled=global.vanCoSettings?global.vanCoSettings.get("autoSaveEnabled") :true;
if (_asEnabled) {
this.autoSaveTimer -=dt;
if (this.autoSaveTimer<=0) {
this.autoSaveTimer=global.vanCoSettings?(Number(global.vanCoSettings.get("autoSaveInterval"))||8) :8;
this.autoSaveNow("periodic_hub");
}
}
}
_updateBattleState(dt) {
if (this.isPermadead||this.isBattlePaused) return;
if (this.map) {
const pt=this.map.screenToWorld(this.input.mouseX,this.input.mouseY);
this.input.mouseWorldX=pt.x;
this.input.mouseWorldY=pt.y;
}
this.aperture.update(dt,this.player);
if (this.isPermadead) return;
this.player.update(dt,this.input,this.map);
if (this.player.hp<=0) {
this._handleBattleDefeat();
return;
}
this._tickMarketRotation(dt);
if (this.blessedLand) this.blessedLand.update(dt);
const _asBatEnabled=global.vanCoSettings?global.vanCoSettings.get("autoSaveEnabled") :true;
if (_asBatEnabled) {
this.autoSaveTimer -=dt;
if (this.autoSaveTimer<=0) {
this.autoSaveTimer=global.vanCoSettings?(Number(global.vanCoSettings.get("autoSaveInterval"))||8) :8;
this.autoSaveNow("periodic_battle");
}
}
this.guSystem.update(dt);
this.map.update(dt,this.player,this.canvas.width,this.canvas.height);
this.enemies.update(dt,this.player,this.map,this.combat);
if (this.beastArmy) this.beastArmy.update(dt);
if (this.guHouse) this.guHouse.update(dt);
if (this.bountySystem) this.bountySystem.update(dt);
this.combat.update(dt);
if (this.stageManager&&this.activeStage) {
this.stageManager.update(dt,this.activeStage,this.player,this.map,this.enemies,this.combat);
}
if (this.eventManager&&this.activeStage) {
this.eventManager.updateBattleEvents(dt,this.activeStage,this.player,this.map,this.enemies,this.combat);
}
const isArenaDuelActive=Boolean(
this.stageManager&&
this.stageManager.activeMechanic&&
this.stageManager.activeMechanic.mode==="arena_duel"
);
if (this.activeStage&& !this.activeStage.bossDefeated&& !isArenaDuelActive) {
const isSpecialFarm=Boolean(this.activeStage.isSpecialResourceStage||this.activeStage.noBoss);
this.reinforcementTimer -=dt;
if (this.reinforcementTimer<=0) {
this.reinforcementTimer=isSpecialFarm?24 :14;
const livingMobs=(this.enemies.beasts||[]).filter(b=> !b.isDead&& !b.isStageBoss).length;
const minMobs=isSpecialFarm?5 :10;
const spawnBatch=isSpecialFarm?1 :3;
if (livingMobs<minMobs) {
for (let i=0;i<spawnBatch;i++) {
const pt=this.map.getRandomWalkablePoint(
this.activeStage.arenaCenterX,
this.activeStage.arenaCenterY,
360,
2420
);
this._createStageEnemy(this.activeStage,pt.x,pt.y,false,i===0);
}
}
}
}
const nearNpc=this.enemies
?this.enemies.getNearestInteractableNpc(this.player.x,this.player.y,58)
:null;
const nearNode=this.map
?this.map.getNearestInteractableNode(this.player.x,this.player.y,58)
:null;
const distNpc=nearNpc?Math.hypot(nearNpc.x - this.player.x,nearNpc.y - this.player.y) :Infinity;
const distNode=nearNode?Math.hypot(nearNode.x - this.player.x,nearNode.y - this.player.y) :Infinity;
const nearEvent=this.eventManager?this.eventManager.getNearestBattleEvent(this.player.x,this.player.y,68) :null;
const nearProp=this.stageManager?this.stageManager.getNearestInteractableProp(this.player.x,this.player.y,74) :null;
if (nearEvent) {
this.ui.updateInteractionBanner({
action:"kích hoạt Cơ Duyên",
target:`${nearEvent.icon} ${nearEvent.name}`
});
} else if (nearProp) {
this.ui.updateInteractionBanner({
action:"kích hoạt / phá giải",
target:`${nearProp.icon} ${nearProp.name}`
});
} else if (nearNpc&&distNpc<=distNode) {
this.ui.updateInteractionBanner({
action:"giao lưu với Cổ Sư",
target:`🤝 ${nearNpc.name} (${nearNpc.rank} Chuyển)`
});
} else if (nearNode) {
this.ui.updateInteractionBanner({
action:"thu thập",
target:`${nearNode.icon||"📦"} ${nearNode.name}`
});
} else {
this.ui.updateInteractionBanner(null);
}
this.hudRefreshTimer +=dt;
const _hudInterval=(document.body&&document.body.classList.contains("mobile-ui"))?0.22 :0.15;
if (this.hudRefreshTimer>=_hudInterval) {
this.hudRefreshTimer=0;
this.ui.updateBattleHUD();
}
}
_renderBattleArena() {
if (!this.ctx|| !this.canvas) return;
const zoom=(this.map&&this.map.camera&&this.map.camera.zoom)?this.map.camera.zoom :1.0;
const isMob=document.body&&document.body.classList.contains("mobile-ui");
if (this.map&&(this.map.camera.width>this.map.worldWidth||this.map.camera.height>this.map.worldHeight)) {
this.ctx.fillStyle="#05070d";
this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
}
this.ctx.save();
this.ctx.scale(zoom,zoom);
this.map.renderWorld(this.ctx);
if (this.activeStage) {
const ax=this.activeStage.arenaCenterX - this.map.camera.x;
const ay=this.activeStage.arenaCenterY - this.map.camera.y;
const borderRadius=(this.map&&this.map.arenaRadius)?this.map.arenaRadius :2750;
const viewCx=this.map.camera.width*0.5;
const viewCy=this.map.camera.height*0.5;
const viewHalfDiag=Math.hypot(viewCx,viewCy) + 40;
const distToCenter=Math.hypot(viewCx - ax,viewCy - ay);
if (Math.abs(distToCenter - borderRadius)<=viewHalfDiag) {
this.ctx.save();
this.ctx.beginPath();
this.ctx.arc(ax,ay,borderRadius,0,Math.PI*2);
this.ctx.strokeStyle=this.activeStage.arenaBorderColor||"#b89758";
this.ctx.globalAlpha=0.72;
this.ctx.lineWidth=3.0;
this.ctx.stroke();
this.ctx.restore();
}
}
if (this.stageManager) {
this.stageManager.render(this.ctx,this.map.camera);
}
if (this.eventManager) {
this.eventManager.renderBattleEvents(this.ctx,this.map.camera);
}
this.enemies.render(this.ctx,this.map.camera);
if (this.beastArmy&&global.BeastArmyRenderer) global.BeastArmyRenderer.renderBeastArmy(this.ctx,this.beastArmy,this.enemies,this.map.camera);
if (this.guHouse&&global.GuHouseRenderer) global.GuHouseRenderer.renderGuHouseBack(this.ctx,this.guHouse,this.player,this.map.camera);
this.player.render(this.ctx,this.map.camera);
if (this.guHouse&&global.GuHouseRenderer) global.GuHouseRenderer.renderGuHouseFront(this.ctx,this.guHouse,this.player,this.map.camera);
if (this.map&&typeof this.map.renderDynamicPropsForeground==="function") this.map.renderDynamicPropsForeground(this.ctx,this.player);
this.combat.render(this.ctx,this.map.camera);
this.ctx.restore();
// 1:1 Screen-Space Overlays (zero extra cost when zoomed out!)
if (this.activeStage&&this.activeStage.themeTint) {
const _wOn=global.vanCoSettings?global.vanCoSettings.get("weatherEffects") :true;
if (_wOn) {
this.ctx.fillStyle=this.activeStage.themeTint;
this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
}
}
this.map.renderLightingAndWeather(this.ctx,this.player);
if (this.minimapCtx&& !(global.vanCoSettings&& !global.vanCoSettings.get("showMinimap"))) {
const mmMod=isMob?10 :6;
this._mmTick=((this._mmTick||0) + 1) % mmMod;
if (this._mmTick===0) {
this.map.renderMinimap(this.minimapCtx,this.player,this.enemies.beasts,this.enemies.npcs,this.stageManager,this.eventManager);
}
}
}
_handleBattleDefeat() {
if (this.isBattlePaused||this.isPermadead) return;
this.isBattlePaused=true;
this.player.hp=0;
const stageName=this.activeStage?this.activeStage.name :"Chiến Trường";
const penalty=this.aperture.applyDeathCultivationPenalty(this.player);
this.ui.addLog(
`💀 Ngươi đã tử vong khi cạn kiệt Sinh Mệnh tại 【${stageName}】! ${penalty.summary}`,
"danger"
);
this.autoSaveNow("combat_death");
this.ui.updateBattleHUD();
if (this.ui&&typeof this.ui.showBattleDefeatModal==="function") {
this.ui.showBattleDefeatModal(stageName,penalty);
} else {
this.respawnAfterCombatDeath();
}
}
respawnAfterCombatDeath() {
this.player.hp=Math.max(10,Math.round(this.player.maxHp*0.5));
this.player.mental=Math.max(10,Math.round(this.player.maxMental*0.5));
this.isBattlePaused=false;
this.retreatToHub();
this.autoSaveNow("respawn_hub");
}
triggerPermadeath(reason="Không Khiếu Thập Tuyệt Thể bạo tạc tan xác!") {
if (this.isPermadead) return;
this.isPermadead=true;
this.isBattlePaused=true;
this.player.hp=0;
const uid=this.characterUid||`dead_${Date.now()}`;
this._markUidPermadead(uid);
const tombstonePayload={
gameTitle:"VAN_CO_TIEN_DO",
version:"3.1.0",
saveVersion:SAVE_VERSION,
isPermadead:true,
characterUid:uid,
savedAt:new Date().toLocaleString("vi-VN"),
savedTimestamp:Date.now(),
playerName:_sanitizeSaveString(this.player.name,"Cổ Sư",32),
realmName:_sanitizeSaveString(this.aperture.getRealmDisplayName(),"---",80),
deathReason:_sanitizeSaveString(reason,"Không Khiếu bạo tạc",160)
};
const tombstoneStr=JSON.stringify(tombstonePayload);
try {
const rawAuto=this._safeStorageGet(AUTO_SAVE_KEY);
if (rawAuto) {
const parsedAuto=JSON.parse(rawAuto);
if (!parsedAuto.characterUid||parsedAuto.characterUid===uid) {
this._safeStorageSet(AUTO_SAVE_KEY,tombstoneStr);
this._safeStorageSet(AUTO_SAVE_BACKUP_KEY,tombstoneStr);
}
} else {
this._safeStorageSet(AUTO_SAVE_KEY,tombstoneStr);
}
for (let slot=1;slot<=MAX_SAVE_SLOTS;slot++) {
const key=`${SAVE_KEY_PREFIX}${slot}`;
const raw=this._safeStorageGet(key);
if (!raw) continue;
try {
const parsed=JSON.parse(raw);
if (parsed&&parsed.characterUid===uid) {
this._safeStorageSet(key,tombstoneStr);
this._safeStorageSet(`${BACKUP_KEY_PREFIX}${slot}`,tombstoneStr);
}
} catch (e) {}
}
this._updateSessionMarker(false,true);
} catch (e) {
console.error("Lỗi khi niêm phong file lưu đã tử vong:",e);
}
if (this.ui) {
this.ui.addLog(`💀 [BẠO TẠC KHÔNG KHIẾU — CHẾT HẲN] ${reason}`,"danger");
if (typeof this.ui.showPermadeathModal==="function") {
this.ui.showPermadeathModal(reason);
}
}
}
returnToCharacterCreationAfterPermadeath() {
this.activeStage=null;
this.isBattlePaused=false;
this.isPermadead=false;
this.characterUid=null;
this.combat.reset();
this.aperture.reset();
this.player.reset();
this.guSystem.reset();
this.currentScreen="creation";
if (this.ui) {
this.ui.resetCreationScreenToForm();
this.ui.showScreen("creation");
this.ui.refreshStartScreenContinueButton();
}
}
_tickMarketRotation(dt) {
this._marketTimerTick=(this._marketTimerTick||0) + dt;
if (this._marketTimerTick<0.5) return;
this._marketTimerTick=0;
const refreshed=this.ensureMarketRotation(true);
if (this.ui) {
if (typeof this.ui.updateMarketCountdownText==="function") {
this.ui.updateMarketCountdownText();
}
if (refreshed&&this.currentScreen==="hub") {
if (this.ui.activeHubTab==="tab-market") this.ui.renderMarketTab();
else if (this.ui.activeHubTab==="tab-faction") this.ui.renderFactionTab();
}
}
}
ensureMarketRotation(notifyOnRefresh=false) {
const now=Date.now();
if (
!this.marketRotation||
typeof this.marketRotation.nextResetAt!=="number"||
!this.marketRotation.stocks||
now>=this.marketRotation.nextResetAt
) {
this._rollNewMarketWave(now,notifyOnRefresh);
return true;
}
const catalogs=(global.UIManager&&typeof global.UIManager.getMarketCatalogs==="function")
?global.UIManager.getMarketCatalogs()
:null;
if (catalogs) {
for (const [marketKey,list] of Object.entries(catalogs)) {
if (!this.marketRotation.stocks[marketKey]) {
this.marketRotation.stocks[marketKey]={};
}
const stockMap=this.marketRotation.stocks[marketKey];
list.forEach((entry,idx)=>{
const key=entry.stockKey||`${entry.type}_${entry.id}_${entry.guRank||0}_${idx}`;
if (stockMap[key]!==undefined) return;
if (entry.unlimited) {
stockMap[key]=9999;
} else {
const chance=typeof entry.spawnChance==="number"?entry.spawnChance :0.5;
const minS=entry.minStock!==undefined?entry.minStock :1;
const maxS=entry.maxStock!==undefined?entry.maxStock :1;
stockMap[key]=Math.random()<=chance
?Math.max(1,minS + Math.floor(Math.random()*Math.max(1,maxS - minS + 1)))
:0;
}
});
}
}
return false;
}
_rollNewMarketWave(nowTs=Date.now(),notify=false) {
const catalogs=(global.UIManager&&typeof global.UIManager.getMarketCatalogs==="function")
?global.UIManager.getMarketCatalogs()
:null;
if (!catalogs) return;
const prevCycle=(this.marketRotation&&this.marketRotation.cycleId)?this.marketRotation.cycleId :0;
const newStocks={};
for (const [marketKey,list] of Object.entries(catalogs)) {
newStocks[marketKey]={};
let spawnedCount=0;
list.forEach((entry,idx)=>{
const key=entry.stockKey||`${entry.type}_${entry.id}_${entry.guRank||0}_${idx}`;
const chance=typeof entry.spawnChance==="number"?entry.spawnChance :0.5;
const minS=entry.minStock!==undefined?entry.minStock :1;
const maxS=entry.maxStock!==undefined?entry.maxStock :1;
if (entry.unlimited) {
newStocks[marketKey][key]=9999;
return;
}
if (Math.random()<=chance) {
const qty=minS + Math.floor(Math.random()*Math.max(1,maxS - minS + 1));
newStocks[marketKey][key]=Math.max(1,qty);
spawnedCount +=1;
} else {
newStocks[marketKey][key]=0;
}
});
if (spawnedCount===0&&list.length>0) {
const firstCommon=list.find(e=>(e.spawnChance||0)>=0.30)||list[0];
const idx0=list.indexOf(firstCommon);
const k0=firstCommon.stockKey||`${firstCommon.type}_${firstCommon.id}_${firstCommon.guRank||0}_${idx0}`;
newStocks[marketKey][k0]=1;
}
}
this.marketRotation={
cycleId:prevCycle + 1,
lastResetAt:nowTs,
nextResetAt:nowTs + MARKET_RESET_INTERVAL_MS,
stocks:newStocks
};
if (notify&&this.ui&&this.currentScreen!=="creation") {
this.ui.addLog(
`🔔 [Đợt Hàng Mới #${this.marketRotation.cycleId}] Thương Đội, Phòng Đấu Giá, Bảo Hoàng Thiên & Khố Phòng vừa làm mới hàng hóa! (Đợt tiếp theo sau 5 phút)`,
"system"
);
}
}
getMarketRemainingSeconds() {
this.ensureMarketRotation(false);
if (!this.marketRotation) return 300;
return Math.max(0,Math.ceil((this.marketRotation.nextResetAt - Date.now()) / 1000));
}
getMarketItemStock(marketKey,itemKey) {
this.ensureMarketRotation(false);
if (!this.marketRotation|| !this.marketRotation.stocks|| !this.marketRotation.stocks[marketKey]) {
return 0;
}
const val=this.marketRotation.stocks[marketKey][itemKey];
return typeof val==="number"?val :0;
}
consumeMarketItemStock(marketKey,itemKey,qty=1) {
this.ensureMarketRotation(false);
if (!this.marketRotation|| !this.marketRotation.stocks|| !this.marketRotation.stocks[marketKey]) {
return false;
}
const cur=this.marketRotation.stocks[marketKey][itemKey]||0;
if (cur>=9999) return true;
if (cur<qty) return false;
this.marketRotation.stocks[marketKey][itemKey]=cur - qty;
return true;
}
}
if (global.SaveManager&&typeof global.SaveManager.attachDelegates==="function") {
global.SaveManager.attachDelegates(GameEngine.prototype);
}
GameEngine.SAVE_VERSION=SAVE_VERSION;
GameEngine.sanitizeString=_sanitizeSaveString;
global.GameEngine=GameEngine;
window.addEventListener("DOMContentLoaded",()=>{
const engine=new GameEngine();
engine.init();
global.vanCoTienDoGame=engine;
if (global.vanCoSettings) global.vanCoSettings.applyAll();
});
})(window);
