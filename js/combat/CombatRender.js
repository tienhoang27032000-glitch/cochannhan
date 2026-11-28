(function (global) {
"use strict";
Object.assign(global.CombatSystem.prototype, {
update(dt) {
this._fxFrameId +=1;
this._fxBurstThisFrame=0;
this._fxTextThisFrame=0;
if (this.overdriveTimer>0) {
this.overdriveTimer=Math.max(0,this.overdriveTimer - dt);
}
if (this.skillSystem) {
this.skillSystem.tickCooldowns(dt);
}
this._updateEnemyStatusEffects(dt);
this._updateProjectiles(dt);
this._updateBeastPhantoms(dt);
this._updateOrbiters(dt);
this._updateGroundZones(dt);
this._updateFallingStrikes(dt);
this._updateSummons(dt);
for (let i=this.aoeEffects.length - 1;i>=0;i--) {
this.aoeEffects[i].duration -=dt;
if (this.aoeEffects[i].duration<=0) this.aoeEffects.splice(i,1);
}
for (let i=this.beams.length - 1;i>=0;i--) {
this.beams[i].life -=dt;
if (this.beams[i].life<=0) this.beams.splice(i,1);
}
for (let i=this.lightningArcs.length - 1;i>=0;i--) {
this.lightningArcs[i].life -=dt;
if (this.lightningArcs[i].life<=0) this.lightningArcs.splice(i,1);
}
for (let i=this.afterimages.length - 1;i>=0;i--) {
this.afterimages[i].life -=dt;
this.afterimages[i].alpha=Math.max(0,this.afterimages[i].life*2);
if (this.afterimages[i].life<=0) this.afterimages.splice(i,1);
}
for (let i=this.particles.length - 1;i>=0;i--) {
const pt=this.particles[i];
pt.x +=pt.vx*dt;
pt.y +=pt.vy*dt;
pt.life -=dt;
pt.alpha=Math.max(0,pt.life*2.5);
if (pt.life<=0) this.particles.splice(i,1);
}
for (let i=this.floatingTexts.length - 1;i>=0;i--) {
const ft=this.floatingTexts[i];
ft.y +=ft.vy*dt;
ft.life -=dt;
ft.alpha=Math.max(0,ft.life);
if (ft.life<=0) this.floatingTexts.splice(i,1);
}
},
_updateEnemyStatusEffects(dt) {this.buffSystem.updateEnemyStatuses(dt);},
_updateProjectiles(dt) {
for (let i=this.projectiles.length - 1;i>=0;i--) {
const p=this.projectiles[i];
p.trail.push({x:p.x,y:p.y});
if (p.trail.length>6) p.trail.shift();
if (p.spinning) {
p.spinAngle +=dt*18;
}
if (p.homing) {
if (p.owner==="player"&&this.enemies) {
let bestT=null;let bestD2=280*280;
const beasts=this.enemies.beasts;
if (beasts) {
for (let bi=0;bi<beasts.length;bi++) {
const bt=beasts[bi];
if (bt.isDead||p.hitTargets.has(bt.id)) continue;
const dx=bt.x - p.x;const dy=bt.y - p.y;const d2=dx*dx + dy*dy;
if (d2<bestD2) {bestD2=d2;bestT=bt;}
}
}
if (bestT) {
const targetAngle=Math.atan2(bestT.y - p.y,bestT.x - p.x);
let diff=targetAngle - p.angle;
while (diff>Math.PI) diff -=Math.PI*2;
while (diff< -Math.PI) diff +=Math.PI*2;
p.angle +=Math.sign(diff)*Math.min(Math.abs(diff),dt*6.5);
p.vx=Math.cos(p.angle)*p.speed;
p.vy=Math.sin(p.angle)*p.speed;
}
} else if (p.owner!=="player"&&this.player&&this.player.hp>0) {
const targetAngle=Math.atan2(this.player.y - p.y,this.player.x - p.x);
let diff=targetAngle - p.angle;
while (diff>Math.PI) diff -=Math.PI*2;
while (diff< -Math.PI) diff +=Math.PI*2;
p.angle +=Math.sign(diff)*Math.min(Math.abs(diff),dt*3.8);
p.vx=Math.cos(p.angle)*p.speed;
p.vy=Math.sin(p.angle)*p.speed;
}
}
p.x +=p.vx*dt;
p.y +=p.vy*dt;
const traveled=Math.hypot(p.x - p.startX,p.y - p.startY);
const hitWall=this.map&& !this.map.isWalkable(p.x,p.y,4);
if (traveled>=p.maxRange||hitWall) {
if (hitWall) this._spawnParticleBurst(p.x,p.y,p.color,6);
this.projectiles.splice(i,1);
continue;
}
if (p.owner==="player"&&this.enemies) {
const hitTarget=this.enemies.findCollidingHostile(p.x,p.y,p.radius,p.hitTargets);
if (hitTarget) {
p.hitTargets.add(hitTarget.id);
this._applyPlayerDamageToTarget(hitTarget,p.damage,p);
if (p.ricochet>0) {
p.ricochet -=1;
const nextTargets=this.enemies.getHostileTargetsInRadius(p.x,p.y,240)
.filter(t=> !p.hitTargets.has(t.id));
if (nextTargets.length>0) {
p.angle=Math.atan2(nextTargets[0].y - p.y,nextTargets[0].x - p.x);
p.vx=Math.cos(p.angle)*p.speed;
p.vy=Math.sin(p.angle)*p.speed;
p.startX=p.x;
p.startY=p.y;
continue;
}
}
p.pierce -=1;
if (p.pierce<=0) {
this.projectiles.splice(i,1);
}
}
} else if (p.owner!=="player"&&this.player&&this.player.hp>0) {
const distToPlayer=Math.hypot(this.player.x - p.x,this.player.y - p.y);
if (distToPlayer<=this.player.radius + p.radius*0.7) {
const dmgRes=this.player.takeDamage(p.damage,p.name,p.skillRank||(p.attackerRef&&p.attackerRef.rank)||null,p.attackerRef||null);
if (!dmgRes.dodged&& !dmgRes.blocked&&dmgRes.damageTaken>0) {
this.spawnFloatingText(this.player.x,this.player.y - 20,`-${dmgRes.damageTaken}`,"#ff4d4d");
this._spawnParticleBurst(this.player.x,this.player.y,p.color,8);
}
this.projectiles.splice(i,1);
}
}
}
},
_updateBeastPhantoms(dt) {
for (let i=this.beastPhantoms.length - 1;i>=0;i--) {
const bp=this.beastPhantoms[i];
bp.x +=bp.vx*dt;
bp.y +=bp.vy*dt;
if (this.enemies) {
const targets=this.enemies.getHostileTargetsInRadius(bp.x,bp.y,bp.radius);
for (const t of targets) {
if (bp.hitTargets.has(t.id)) continue;
bp.hitTargets.add(t.id);
const didPenetrate=this._applyPlayerDamageToTarget(t,bp.damage,{
skillRank:bp.skillRank||1,
isKillerMove:Boolean(bp.isKillerMove),
color:bp.color,
statusEffect:"stun"
});
if (didPenetrate!==false) {
this._knockbackTarget(t,bp.x - Math.cos(bp.angle)*20,bp.y - Math.sin(bp.angle)*20,bp.knockbackForce);
}
}
}
const dist=Math.hypot(bp.x - bp.startX,bp.y - bp.startY);
if (dist>=bp.maxDistance) {
this._spawnParticleBurst(bp.x,bp.y,bp.color,14);
this.beastPhantoms.splice(i,1);
}
}
},
_updateOrbiters(dt) {
if (!this.player) return;
for (let i=this.orbiters.length - 1;i>=0;i--) {
const orb=this.orbiters[i];
orb.duration -=dt;
orb.angle +=orb.speed*dt;
if (orb.duration<=0) {
this.orbiters.splice(i,1);
continue;
}
const ox=this.player.x + Math.cos(orb.angle)*orb.radius;
const oy=this.player.y + Math.sin(orb.angle)*orb.radius;
for (const tid of Object.keys(orb.hitCooldowns)) {
orb.hitCooldowns[tid] -=dt;
if (orb.hitCooldowns[tid]<=0) delete orb.hitCooldowns[tid];
}
if (this.enemies) {
const targets=this.enemies.getHostileTargetsInRadius(ox,oy,24);
for (const t of targets) {
if (orb.hitCooldowns[t.id]) continue;
orb.hitCooldowns[t.id]=0.45;
this._applyPlayerDamageToTarget(t,orb.damage,{
skillRank:orb.skillRank||1,
isKillerMove:Boolean(orb.isKillerMove),
color:orb.color,
statusEffect:"bleed"
});
}
}
}
},
_updateGroundZones(dt) {
for (let i=this.groundZones.length - 1;i>=0;i--) {
const gz=this.groundZones[i];
gz.duration -=dt;
gz.tickTimer -=dt;
if (gz.duration<=0) {
this.groundZones.splice(i,1);
continue;
}
if (gz.pullForce>0&&this.enemies) {
const targets=this.enemies.getHostileTargetsInRadius(gz.x,gz.y,gz.radius*1.3);
for (const t of targets) {
const d=Math.hypot(gz.x - t.x,gz.y - t.y);
if (d>14) {
const ang=Math.atan2(gz.y - t.y,gz.x - t.x);
t.x +=Math.cos(ang)*gz.pullForce*dt;
t.y +=Math.sin(ang)*gz.pullForce*dt;
}
}
}
if (gz.tickTimer<=0) {
gz.tickTimer=0.55;
if (this.enemies) {
const targets=this.enemies.getHostileTargetsInRadius(gz.x,gz.y,gz.radius);
for (const t of targets) {
this._applyPlayerDamageToTarget(t,gz.damagePerTick,{
skillRank:gz.skillRank||1,
isKillerMove:Boolean(gz.isKillerMove),
color:gz.color,
statusEffect:gz.statusEffect
});
}
}
}
}
},
_updateFallingStrikes(dt) {
for (let i=this.fallingStrikes.length - 1;i>=0;i--) {
const fs=this.fallingStrikes[i];
fs.currentYOffset -=fs.fallSpeed*dt;
if (fs.currentYOffset<=0) {
this.spawnAoEEffect({
owner:"player",
isKillerMove:Boolean(fs.isKillerMove),
name:"Thiên Phạt",
skillRank:fs.skillRank||1,
x:fs.targetX,
y:fs.targetY,
radius:fs.radius,
damage:fs.damage,
color:fs.color,
duration:0.3,
statusEffect:fs.statusEffect
});
this.fallingStrikes.splice(i,1);
}
}
},
_updateSummons(dt) {
for (let i=this.summons.length - 1;i>=0;i--) {
const sum=this.summons[i];
sum.duration -=dt;
if (sum.attackCooldown>0) sum.attackCooldown -=dt;
if (sum.duration<=0||sum.hp<=0) {
this._spawnParticleBurst(sum.x,sum.y,sum.color,10);
this.summons.splice(i,1);
continue;
}
if (this.enemies) {
const near=this.enemies.getHostileTargetsInRadius(sum.x,sum.y,450);
if (near.length>0) {
near.sort((a,b)=>Math.hypot(a.x - sum.x,a.y - sum.y) - Math.hypot(b.x - sum.x,b.y - sum.y));
const target=near[0];
const dist=Math.hypot(target.x - sum.x,target.y - sum.y);
if (dist>28) {
const ang=Math.atan2(target.y - sum.y,target.x - sum.x);
sum.x +=Math.cos(ang)*sum.spd*dt;
sum.y +=Math.sin(ang)*sum.spd*dt;
} else if (sum.attackCooldown<=0) {
sum.attackCooldown=0.85;
this._applyPlayerDamageToTarget(target,sum.atk,{
skillRank:sum.skillRank||1,
color:sum.color,
lifesteal:0.15,
statusEffect:"bleed"
});
}
} else if (this.player) {
const dPlayer=Math.hypot(this.player.x - sum.x,this.player.y - sum.y);
if (dPlayer>60) {
const ang=Math.atan2(this.player.y - sum.y,this.player.x - sum.x);
sum.x +=Math.cos(ang)*sum.spd*0.8*dt;
sum.y +=Math.sin(ang)*sum.spd*0.8*dt;
}
}
}
}
},
_getCachedIconSprite(icon,sizePx=32) {
if (!this._iconSpriteCache) this._iconSpriteCache=new Map();
const key=`${icon}_${sizePx}`;
let c=this._iconSpriteCache.get(key);
if (c) return c;
c=document.createElement("canvas");
const dim=sizePx + 12;
c.width=dim;c.height=dim;
const ictx=c.getContext("2d");
ictx.font=`${sizePx}px sans-serif`;
ictx.textAlign="center";
ictx.textBaseline="middle";
ictx.fillText(icon||"🐗",dim/2,dim/2);
if (this._iconSpriteCache.size>64) this._iconSpriteCache.clear();
this._iconSpriteCache.set(key,c);
return c;
},
_drawSegmentedRing(ctx,x,y,r,rot,segments=4) {
const step=(Math.PI*2)/segments;
const span=step*0.62;
ctx.beginPath();
for (let i=0;i<segments;i++) {
const a=rot + i*step;
ctx.moveTo(x + Math.cos(a)*r,y + Math.sin(a)*r);
ctx.arc(x,y,r,a,a + span);
}
ctx.stroke();
},
render(ctx,camera) {
if (!ctx) return;
const _shOn=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
let shakeX=0;
let shakeY=0;
if (_shOn&&this.screenShakeTime>0) {
shakeX=(Math.random() - 0.5)*this.screenShakeMagnitude*2;
shakeY=(Math.random() - 0.5)*this.screenShakeMagnitude*2;
}
const camX=(camera?camera.x :0) - shakeX;
const camY=(camera?camera.y :0) - shakeY;
const viewW=camera?camera.width :1400;
const viewH=camera?camera.height :900;
const t=performance.now()*0.005;

ctx.save();

// 1. Ground Zones (ZERO setLineDash! Viewport-culled + fast segmented solid arcs)
for (let i=0;i<this.groundZones.length;i++) {
const gz=this.groundZones[i];
const sx=gz.x - camX;
const sy=gz.y - camY;
if (sx + gz.radius< -20||sy + gz.radius< -20||sx - gz.radius>viewW + 20||sy - gz.radius>viewH + 20) continue;
ctx.globalAlpha=Math.min(0.36,gz.duration*0.2);
ctx.fillStyle=gz.color;
ctx.beginPath();ctx.arc(sx,sy,gz.radius,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=Math.min(0.68,gz.duration*0.35);
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.5;
this._drawSegmentedRing(ctx,sx,sy,gz.radius,t*0.7 + i,6);
}

// 2. Dash Afterimages
for (let i=0;i<this.afterimages.length;i++) {
const ai=this.afterimages[i];
const sx=ai.x - camX;const sy=ai.y - camY;
if (sx< -30||sy< -30||sx>viewW + 30||sy>viewH + 30) continue;
ctx.globalAlpha=ai.alpha;
ctx.fillStyle=ai.color;
ctx.fillRect(sx - 8,sy - 14,16,26);
}
ctx.globalAlpha=1;

// 3. Summons (cached offscreen icon sprite — zero per-frame emoji rasterization!)
for (let i=0;i<this.summons.length;i++) {
const sum=this.summons[i];
const sx=sum.x - camX;const sy=sum.y - camY;
if (sx< -40||sy< -40||sx>viewW + 40||sy>viewH + 40) continue;
ctx.beginPath();ctx.arc(sx,sy,15,0,Math.PI*2);
ctx.fillStyle="rgba(20, 10, 10, 0.85)";ctx.fill();
ctx.lineWidth=2;ctx.strokeStyle=sum.color;ctx.stroke();
const spr=this._getCachedIconSprite(sum.icon,16);
ctx.drawImage(spr,sx - spr.width/2,sy - spr.height/2);
}

// 4. Enemy Status Overlays (pure geometric vector gems — zero emoji fillText!)
this._renderEnemyStatusOverlays(ctx,camX,camY,viewW,viewH);

// 5. AoE Effects (ZERO setLineDash! Viewport-culled + fast solid inner/outer arcs)
for (let i=0;i<this.aoeEffects.length;i++) {
const aoe=this.aoeEffects[i];
const sx=aoe.x - camX;const sy=aoe.y - camY;
if (sx + aoe.radius< -20||sy + aoe.radius< -20||sx - aoe.radius>viewW + 20||sy - aoe.radius>viewH + 20) continue;
const progress=1 - aoe.duration / aoe.maxDuration;
const currentRadius=aoe.radius*(0.35 + progress*0.65);
const alpha=Math.max(0.12,aoe.duration / aoe.maxDuration);
ctx.globalAlpha=alpha*0.52;
ctx.fillStyle=aoe.color;
ctx.beginPath();ctx.arc(sx,sy,currentRadius,0,Math.PI*2);ctx.fill();
ctx.globalAlpha=alpha;
ctx.lineWidth=2.4;ctx.strokeStyle="#ffffff";
ctx.beginPath();ctx.arc(sx,sy,currentRadius,0,Math.PI*2);ctx.stroke();
ctx.strokeStyle="rgba(255, 225, 130, 0.78)";ctx.lineWidth=1.5;
this._drawSegmentedRing(ctx,sx,sy,currentRadius*0.68,-t*1.2 + i,4);
}
ctx.globalAlpha=1;

// 6. Orbiters (inline trigonometry — zero save/restore!)
if (this.player&&this.orbiters.length>0) {
const px=this.player.x - camX;const py=this.player.y - camY;
ctx.lineWidth=1;ctx.strokeStyle="#ffffff";
for (let i=0;i<this.orbiters.length;i++) {
const orb=this.orbiters[i];
const ox=px + Math.cos(orb.angle)*orb.radius;
const oy=py + Math.sin(orb.angle)*orb.radius;
const a=orb.angle + Math.PI / 2;
const ca=Math.cos(a);const sa=Math.sin(a);
ctx.fillStyle=orb.color;
ctx.beginPath();
ctx.moveTo(ox + sa*12,oy - ca*12);
ctx.lineTo(ox + ca*7 - sa*8,oy + sa*7 + ca*8);
ctx.lineTo(ox - ca*7 - sa*8,oy - sa*7 + ca*8);
ctx.closePath();ctx.fill();ctx.stroke();
}
}

// 7. Beast Phantoms (cached offscreen icon sprite — zero 30px emoji fillText!)
for (let i=0;i<this.beastPhantoms.length;i++) {
const bp=this.beastPhantoms[i];
const sx=bp.x - camX;const sy=bp.y - camY;
if (sx + bp.radius< -30||sy + bp.radius< -30||sx - bp.radius>viewW + 30||sy - bp.radius>viewH + 30) continue;
ctx.beginPath();ctx.arc(sx,sy,bp.radius,0,Math.PI*2);
ctx.fillStyle="rgba(224, 122, 69, 0.28)";ctx.fill();
ctx.lineWidth=2.5;ctx.strokeStyle=bp.color;ctx.stroke();
const spr=this._getCachedIconSprite(bp.icon,30);
ctx.drawImage(spr,sx - spr.width/2,sy - spr.height/2);
}

// 8. Laser Beams
if (this.beams.length>0) {
ctx.lineCap="round";
for (let i=0;i<this.beams.length;i++) {
const b=this.beams[i];
const ratio=Math.max(0.1,b.life / b.maxLife);
ctx.globalAlpha=ratio;
ctx.strokeStyle=b.color;
ctx.lineWidth=b.width*ratio;
ctx.beginPath();ctx.moveTo(b.x1 - camX,b.y1 - camY);ctx.lineTo(b.x2 - camX,b.y2 - camY);ctx.stroke();
ctx.strokeStyle="#ffffff";
ctx.lineWidth=Math.max(2,b.width*0.35);
ctx.stroke();
}
ctx.globalAlpha=1;
}

// 9. Lightning Arcs
if (this.lightningArcs.length>0) {
ctx.lineWidth=2.4;
for (let i=0;i<this.lightningArcs.length;i++) {
const arc=this.lightningArcs[i];
const x1=arc.x1 - camX;const y1=arc.y1 - camY;
const x2=arc.x2 - camX;const y2=arc.y2 - camY;
ctx.strokeStyle=arc.color;
ctx.beginPath();
ctx.moveTo(x1,y1);
ctx.lineTo((x1 + x2)*0.5 + (Math.random() - 0.5)*22,(y1 + y2)*0.5 + (Math.random() - 0.5)*22);
ctx.lineTo(x2,y2);
ctx.stroke();
}
}

// 10. Falling Strikes
for (let i=0;i<this.fallingStrikes.length;i++) {
const fs=this.fallingStrikes[i];
const tx=fs.targetX - camX;const ty=fs.targetY - camY;
if (tx< -80||ty< -260||tx>viewW + 80||ty>viewH + 80) continue;
ctx.strokeStyle=fs.color;ctx.lineWidth=1.8;ctx.globalAlpha=0.45;
ctx.beginPath();ctx.arc(tx,ty,fs.radius*0.7,0,Math.PI*2);ctx.stroke();
ctx.globalAlpha=0.95;ctx.fillStyle=fs.color;
ctx.beginPath();ctx.arc(tx,ty - fs.currentYOffset,10,0,Math.PI*2);ctx.fill();
}
ctx.globalAlpha=1;

// 11. Projectiles (viewport-culled, single batched trail pass + fast crescent)
const pLen=this.projectiles.length;
if (pLen>0) {
ctx.lineWidth=3.6;ctx.globalAlpha=0.32;
for (let i=0;i<pLen;i++) {
const p=this.projectiles[i];
const sx=p.x - camX;const sy=p.y - camY;
if (sx< -60||sy< -60||sx>viewW + 60||sy>viewH + 60) continue;
if (p.trail.length>1) {
ctx.strokeStyle=p.color;
ctx.beginPath();
ctx.moveTo(p.trail[0].x - camX,p.trail[0].y - camY);
for (let idx=1;idx<p.trail.length;idx++) {
ctx.lineTo(p.trail[idx].x - camX,p.trail[idx].y - camY);
}
ctx.stroke();
}
}
ctx.globalAlpha=1;
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.2;
for (let i=0;i<pLen;i++) {
const p=this.projectiles[i];
const sx=p.x - camX;const sy=p.y - camY;
if (sx< -60||sy< -60||sx>viewW + 60||sy>viewH + 60) continue;
const ang=p.spinning?p.spinAngle :p.angle;
ctx.save();
ctx.translate(sx,sy);ctx.rotate(ang);
ctx.fillStyle=p.color;
ctx.beginPath();
ctx.arc(0,0,p.radius*0.78,-Math.PI*0.45,Math.PI*0.45,false);
ctx.arc(-6,0,p.radius*0.60,Math.PI*0.35,-Math.PI*0.35,true);
ctx.closePath();ctx.fill();ctx.stroke();
ctx.restore();
}
}

// 12. Particles (ZERO per-particle save/restore! Viewport-culled!)
for (let i=0;i<this.particles.length;i++) {
const pt=this.particles[i];
const px=pt.x - camX;const py=pt.y - camY;
if (px< -16||py< -16||px>viewW + 16||py>viewH + 16) continue;
ctx.globalAlpha=pt.alpha;
ctx.fillStyle=pt.color;
ctx.fillRect(px,py,pt.size,pt.size);
}
ctx.globalAlpha=1;

// 13. Floating Texts (font-batched, zero per-item save/restore, viewport-culled!)
const ftCount=this.floatingTexts.length;
if (ftCount>0) {
ctx.textAlign="center";
let lastBig=null;
const drawShadow=(ftCount<=9);
for (let i=0;i<ftCount;i++) {
const ft=this.floatingTexts[i];
const fx=ft.x - camX;const fy=ft.y - camY;
if (fx< -120||fy< -40||fx>viewW + 120||fy>viewH + 40) continue;
const isBig=Boolean(ft.isBig);
if (isBig!==lastBig) {
ctx.font=isBig?"bold 15px Georgia" :"bold 13px Georgia";
lastBig=isBig;
}
ctx.globalAlpha=ft.alpha;
if (drawShadow) {
ctx.fillStyle="#000000";
ctx.fillText(ft.text,fx + 1,fy + 1);
}
ctx.fillStyle=ft.color;
ctx.fillText(ft.text,fx,fy);
}
ctx.globalAlpha=1;
}

ctx.restore();
this._renderComboAndDashUI(ctx,t);
},
_renderEnemyStatusOverlays(ctx,camX,camY,viewW=1400,viewH=900) {
if (!this.enemies) return;
const lists=[this.enemies.beasts,this.enemies.npcs];
for (let li=0;li<lists.length;li++) {
const arr=lists[li];
if (!arr) continue;
for (let ei=0;ei<arr.length;ei++) {
const ent=arr[ei];
if (ent.isDead) continue;
const sx=ent.x - camX;const sy=ent.y - camY;
if (sx< -60||sy< -60||sx>viewW + 60||sy>viewH + 60) continue;
if (ent.hitFlashTimer&&ent.hitFlashTimer>0) {
ctx.fillStyle="rgba(255, 255, 255, 0.50)";
ctx.beginPath();ctx.arc(sx,sy,ent.radius + 3,0,Math.PI*2);ctx.fill();
}
if (ent.freezeTimer&&ent.freezeTimer>0) {
const sz=(ent.radius + 2)*2;
ctx.fillStyle="rgba(133, 193, 233, 0.45)";
ctx.fillRect(sx - ent.radius - 2,sy - ent.radius - 2,sz,sz);
ctx.strokeStyle="#ffffff";ctx.lineWidth=1.4;
ctx.strokeRect(sx - ent.radius - 2,sy - ent.radius - 2,sz,sz);
}
// Pure Vector Status Gems (0 emoji fillText calls — crisp & 20x faster!)
const dots=[];
if (ent.burnTimer>0) dots.push("#ff6b35");
if (ent.bleedTimer>0) dots.push("#e02424");
if (ent.freezeTimer>0) dots.push("#74eaff");
else if (ent.slowTimer>0) dots.push("#85c1e9");
if (ent.stunTimer>0) dots.push("#ffd700");
if (ent.poisonTimer>0) dots.push("#9b59b6");
if (dots.length>0) {
const startX=sx - ((dots.length - 1)*10)*0.5;
const dy=sy - ent.radius - 32;
for (let di=0;di<dots.length;di++) {
const dx=startX + di*10;
ctx.fillStyle=dots[di];
ctx.beginPath();ctx.arc(dx,dy,3.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle="#ffffff";ctx.lineWidth=0.9;ctx.stroke();
}
}
}
}
},
_renderComboAndDashUI(ctx) {
const isMobile=document.body&&document.body.classList.contains("mobile-ui");
ctx.save();
ctx.setTransform(1,0,0,1,0,0);
if (this.comboCount>=2) {
const bonusPct=Math.min(30,Math.round(this.comboCount*1.0));
const boxX=isMobile?10 :16;
const boxY=isMobile?116 :175;
const boxW=isMobile?156 :195;
const boxH=isMobile?38 :52;
ctx.save();
ctx.fillStyle="rgba(14, 18, 26, 0.85)";
ctx.strokeStyle="#e2bf75";
ctx.lineWidth=1.5;
ctx.fillRect(boxX,boxY,boxW,boxH);
ctx.strokeRect(boxX,boxY,boxW,boxH);
ctx.fillStyle="#ffd700";
ctx.font=isMobile?"bold 13px Georgia" :"bold 18px Georgia";
ctx.textAlign="left";
ctx.fillText(`🔥 ${this.comboCount} LIÊN KÍCH!`,boxX + 8,boxY + (isMobile?16 :25));
ctx.fillStyle="#5cc995";
ctx.font=isMobile?"10px Georgia" :"12px Georgia";
ctx.fillText(`Khuếch đại: +${bonusPct}%`,boxX + 8,boxY + (isMobile?31 :43));
ctx.restore();
}
if (isMobile) {ctx.restore();return;}
const _stUi=global.vanCoSettings;
const _jKey=_stUi?_stUi.getKeyLabel("jump") :"SPACE";
const _dKey=_stUi?_stUi.getKeyLabel("dash") :"G";
const inAir=Boolean(this.player&&this.player.z>2);
ctx.save();
ctx.fillStyle="rgba(14, 18, 26, 0.85)";
ctx.strokeStyle=inAir?"#7ef7f0" :"#6ce6b8";
ctx.fillRect(16,234,218,26);
ctx.strokeRect(16,234,218,26);
ctx.fillStyle=inAir?"#7ef7f0" :"#ffd700";
ctx.font="11.5px Georgia";
ctx.textAlign="left";
ctx.fillText(
inAir
?`🦘 Khinh Công (${(this.player.maxJumps||2) - (this.player.jumpCount||0)} lần còn lại)`
:`🦘 [${_jKey}]: Nhảy / Khinh Công (x2)`,
24,
251
);
ctx.fillStyle="rgba(14, 18, 26, 0.85)";
ctx.strokeStyle=this.dashCooldown<=0?"#6ce6b8" :"#5e4f38";
ctx.fillRect(16,264,218,26);
ctx.strokeRect(16,264,218,26);
ctx.fillStyle=this.dashCooldown<=0?"#6ce6b8" :"#948d81";
ctx.fillText(
this.dashCooldown<=0
?`💨 [${_dKey} / Chuột Phải]: Lướt Sẵn Sàng`
:`💨 Hồi Thân Pháp: ${this.dashCooldown.toFixed(1)}s`,
24,
281
);
ctx.restore();
ctx.restore();
}
});
})(window);
