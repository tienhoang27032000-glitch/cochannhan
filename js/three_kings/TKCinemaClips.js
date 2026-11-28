(function (global) {
"use strict";
const {_clamp,_lerp,_easeOutCubic,_easeInCubic,_easeInOutSine,_fmtSec}=global.ThreeKingsCinema._math;
Object.assign(global.ThreeKingsCinema.prototype, {
_renderThienBocQuangHaVideo(ctx,vw,vh) {
const t=this.t;
const cx=vw/2;
const cy=vh/2;

// ---------------- SHOT 1 (0.0s – 2.0s): TIÊU MANG RISES INTO THE DARKENED SKY ----------------
if (t<2.0) {
const u=t / 2.0;
const sky=ctx.createLinearGradient(0,0,0,vh);
sky.addColorStop(0,"#0c1020");sky.addColorStop(0.55,"#261420");sky.addColorStop(1,"#3b1a14");
ctx.fillStyle=sky;ctx.fillRect(0,0,vw,vh);

// Storm clouds whipping diagonally as camera tilts up
ctx.fillStyle="rgba(255,155,80,0.10)";
for (let i=0;i<7;i++) {
const ox=((i*260 - t*160) % (vw + 320)) + 160;
const oy=vh*0.18 + i*48 + u*65;
ctx.beginPath();ctx.ellipse(ox,oy,180,26,0,0,Math.PI*2);ctx.fill();
}

// Vertical upward speedlines
ctx.strokeStyle="rgba(255,235,160,0.22)";ctx.lineWidth=1.8;
for (let i=0;i<24;i++) {
const lx=(i/23)*vw;const ly=((t*480 + i*97) % vh);
ctx.beginPath();ctx.moveTo(lx,ly);ctx.lineTo(lx,ly + 55);ctx.stroke();
}

// Receding silhouette of Khuyển Hoàng Anh Minh lunging below!
const dogY=vh*0.80 + u*110;
ctx.save();ctx.translate(cx - 85,dogY);ctx.scale(2.2,2.2);
ctx.fillStyle="#121824";ctx.strokeStyle="#5aa9e6";ctx.lineWidth=1.5;
ctx.beginPath();ctx.ellipse(0,0,28,16,-0.25,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.beginPath();ctx.arc(24,-12,12,0,Math.PI*2);ctx.fill();ctx.stroke();
ctx.fillStyle="#ffe600";ctx.beginPath();ctx.arc(28,-14,2.5,0,Math.PI*2);ctx.fill();
ctx.restore();

// Tiêu Mang soaring smoothly into center-top frame!
const xmY=_lerp(vh*0.64,vh*0.44,_easeOutCubic(u));
const xmScale=_lerp(1.15,1.52,_easeOutCubic(u));
this._drawXiaoMangHeroic(ctx,cx + 15,xmY,xmScale,t,u*0.45,u*0.45);

this._setSubtitle("Tiêu Mang","\"Con Khuyển Hoàng đáng chết này cứ quấn lấy ta! Đã vậy — để tất cả các ngươi nhìn rõ uy lực Ngũ Chuyển Quang Đạo!\"");
return;
}

// ---------------- SHOT 2 (2.0s – 4.3s): 3-GU CONVERGENCE & THÁI CỔ CHI QUANG IGNITION ----------------
if (t<4.3) {
const lt=t - 2.0;
const u=lt / 2.3;
const shake=(u>0.55)?(Math.random()-0.5)*7*u :0;
ctx.save();ctx.translate(shake,shake*0.6);

// Sky darkens intensely around a blinding golden sun core!
const bg=ctx.createRadialGradient(cx,cy*0.88,20,cx,cy*0.88,Math.max(vw,vh)*0.75);
bg.addColorStop(0,`rgba(255,250,210,${0.25 + u*0.68})`);
bg.addColorStop(0.32,`rgba(255,195,60,${0.18 + u*0.35})`);
bg.addColorStop(0.68,"#150e1c");
bg.addColorStop(1,"#05060b");
ctx.fillStyle=bg;ctx.fillRect(-20,-20,vw + 40,vh + 40);

this._drawSpeedlines(ctx,cx,cy*0.88,vw,vh,t,`rgba(255,240,165,${0.18 + u*0.42})`,52);

// Tiêu Mang heroic close-up raising both arms!
this._drawXiaoMangHeroic(ctx,cx,cy*1.04,1.72 + u*0.18,t,_lerp(0.45,1.0,_easeOutCubic(u)),0.45 + u*0.55);

// 3 Orbiting Gu Worms igniting sequentially with calligraphy banners!
const gus=[
{start:0.0,name:"TỨ CHUYỂN • CỔ TỤ QUANG",col:"#7ef7f0",ang:-Math.PI*0.78},
{start:0.75,name:"NGŨ CHUYỂN • CỔ THÁI QUANG (THÁI CỔ CHI QUANG)",col:"#fff2a6",ang:-Math.PI*0.50},
{start:1.45,name:"NGŨ CHUYỂN • CỔ GIANG HÀ NHẬT HẠ",col:"#ffd700",ang:-Math.PI*0.22}
];
const orbR=Math.min(vw*0.28,205);
for (const g of gus) {
if (lt<g.start) continue;
const p=_easeOutCubic((lt - g.start)/0.45);
const a=g.ang + Math.sin(t*3)*0.05;
const gx=cx + Math.cos(a)*orbR*(1.4 - p*0.4);
const gy=cy*0.92 + Math.sin(a)*orbR*0.72;
const og=ctx.createRadialGradient(gx,gy,3,gx,gy,42*p);
og.addColorStop(0,"#ffffff");og.addColorStop(0.45,g.col);og.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=og;ctx.beginPath();ctx.arc(gx,gy,44*p,0,Math.PI*2);ctx.fill();
// Spinning Dao Rune Ring around each Gu
ctx.save();ctx.translate(gx,gy);ctx.rotate(t*4);
ctx.strokeStyle=g.col;ctx.lineWidth=2;ctx.setLineDash([7,4]);
ctx.beginPath();ctx.arc(0,0,22*p,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
// Label
ctx.font="bold 12px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(g.name,gx + 1,gy - 30);
ctx.fillStyle=g.col;ctx.fillText(g.name,gx,gy - 31);
}

// White-gold pre-discharge blinding flash right at 4.15s – 4.30s
if (lt>2.05) {
ctx.fillStyle=`rgba(255,255,235,${_clamp((lt - 2.05)/0.25,0,1)*0.92})`;
ctx.fillRect(-20,-20,vw + 40,vh + 40);
}
ctx.restore();

const sub2=lt<0.75?"\"Tứ chuyển — CỔ TỤ QUANG!!\"" :(lt<1.45?"\"Ngũ chuyển — CỔ THÁI QUANG!! Ánh sáng Thái Cổ hội tụ!!\"" :"\"Ngũ chuyển — CỔ GIANG HÀ NHẬT HẠ!! Sát chiêu dung hợp!!\"");
this._setSubtitle("Tiêu Mang",sub2);
return;
}

// ---------------- SHOT 3 (4.3s – 6.25s): HEAVENS TEAR OPEN & THIÊN BỘC QUANG HÀ DESCENDS! ----------------
if (t<6.25) {
const lt=t - 4.3;
const u=lt / 1.95;
const shake=(Math.random()-0.5)*14;
ctx.save();ctx.translate(shake,shake*0.7);

// Darkened Stormy Heaven & Vast Mountain Valley Below
const sky=ctx.createLinearGradient(0,0,0,vh);
sky.addColorStop(0,"#080c18");sky.addColorStop(0.6,"#1b1420");sky.addColorStop(1,"#261910");
ctx.fillStyle=sky;ctx.fillRect(-20,-20,vw + 40,vh + 40);

// Swirling Golden Sky Portal tearing open at top
const portalY=vh*0.18;
const pG=ctx.createRadialGradient(cx,portalY,15,cx,portalY,240);
pG.addColorStop(0,"#ffffff");pG.addColorStop(0.35,"#fff2a6");pG.addColorStop(0.7,"rgba(255,195,50,0.35)");pG.addColorStop(1,"rgba(0,0,0,0)");
ctx.fillStyle=pG;ctx.beginPath();ctx.ellipse(cx,portalY,260,72,0,0,Math.PI*2);ctx.fill();

// Colossal Volumetric Waterfall of Immemorial Light shooting downward across full screen!
const beamBot=_lerp(portalY,vh + 40,_easeInCubic(Math.min(1,lt/0.48)));
const beamHalfW=Math.min(vw*0.21,155)*(0.85 + Math.sin(t*18)*0.08);
this._drawVolumetricLightBeam(ctx,cx,portalY - 25,beamBot,beamHalfW,t,1.0);
this._drawSpeedlines(ctx,cx,cy,vw,vh,t,"rgba(255,248,200,0.32)",42);

// Dramatic Anime Calligraphy Title Slam (0.05s – 1.3s)
if (lt<1.35) {
const pop=_easeOutCubic(Math.min(1,lt/0.22));
const fade=lt>1.05?(1 - (lt - 1.05)/0.3) :1;
ctx.save();
ctx.globalAlpha=fade;
ctx.translate(cx,cy*0.92);
ctx.scale(1.35 - pop*0.35,1.35 - pop*0.35);
ctx.fillStyle="rgba(8,10,16,0.78)";
ctx.fillRect(-255,-42,510,84);
ctx.strokeStyle="#ffd700";ctx.lineWidth=2.6;
ctx.strokeRect(-255,-42,510,84);
ctx.font="bold 14px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7f0";
ctx.fillText("NGŨ CHUYỂN QUANG ĐẠO SÁT CHIÊU",0,-15);
ctx.font="bold 30px Georgia";ctx.fillStyle="#fff2a6";
ctx.fillText("THIÊN BỘC QUANG HÀ",0,22);
ctx.restore();
}

// Side Anime Cut-In Panel: Thiết Bạch Kỳ (Third Eye wide open!) reacting at 1.05s – 1.95s
if (lt>1.0) {
const cp=_easeOutCubic((lt - 1.0)/0.22);
const cw=Math.min(340,vw*0.44);
const ch=94;
const bx=vw - cw*cp - 14;
const by=vh*0.22;
ctx.save();
ctx.fillStyle="rgba(16,18,28,0.94)";ctx.strokeStyle="#ffd700";ctx.lineWidth=2.4;
ctx.fillRect(bx,by,cw,ch);ctx.strokeRect(bx,by,cw,ch);
// Third Eye icon + name
ctx.fillStyle="#fff2a6";ctx.beginPath();ctx.ellipse(bx + 42,by + 47,20,10,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#ffd700";ctx.beginPath();ctx.arc(bx + 42,by + 47,6,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#12141c";ctx.beginPath();ctx.arc(bx + 42,by + 47,2.5,0,Math.PI*2);ctx.fill();
ctx.font="bold 13px Georgia";ctx.textAlign="left";ctx.fillStyle="#ffd700";
ctx.fillText("Thiết Bạch Kỳ (Kinh Hãi!)",bx + 76,by + 34);
ctx.font="12px Georgia";ctx.fillStyle="#f0ebe1";
ctx.fillText("\"Không ổn!! Thiếu chủ vẫn ở",bx + 76,by + 56);
ctx.fillText("bên trong Thanh Đồng Đại Điện!!\"",bx + 76,by + 74);
ctx.restore();
}

ctx.restore();
this._setSubtitle(lt>1.0?"Thiết Bạch Kỳ" :"Tiêu Mang",lt>1.0?"\"Không ổn!! Sức mạnh Quang Hà quá khủng khiếp, không thể cản hết được!\"" :"\"SÁT CHIÊU — THIÊN BỘC QUANG HÀ!! Sông trời ánh sáng Thái Cổ giáng xuống!!\"");
return;
}

// ---------------- SHOT 4 (6.25s – 8.25s): EXTERIOR BRONZE HALL ROOF SHATTERS + ANIME IMPACT FRAME! ----------------
if (t<8.25) {
const lt=t - 6.25;
const hitTime=0.14;
const isImpactFrame=(lt>=hitTime&&lt<hitTime + 0.085);

// Classic Sakuga High-Contrast Black & White Impact Frame!!
if (isImpactFrame) {
ctx.fillStyle="#050608";ctx.fillRect(0,0,vw,vh);
ctx.fillStyle="#ffffff";
ctx.fillRect(cx - 115,0,230,vh*0.66);
this._drawSpeedlines(ctx,cx,vh*0.62,vw,vh,t,"#ffffff",64);
ctx.strokeStyle="#ffffff";ctx.lineWidth=8;
ctx.beginPath();ctx.arc(cx,vh*0.62,190,0,Math.PI*2);ctx.stroke();
this._setSubtitle("","OANH — RẮC!! NÓC THANH ĐỒNG ĐẠI ĐIỆN VỠ TAN THÀNH NGÀN MẢNH!!");
return;
}

const afterHit=Math.max(0,lt - hitTime);
const shakeAmp=afterHit>0?(Math.max(2,22*(1 - afterHit/1.6))) :6;
ctx.save();
const _cs1=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
if (_cs1) ctx.translate((Math.random()-0.5)*shakeAmp,(Math.random()-0.5)*shakeAmp);

// Fiery-gold sky behind Bronze Mound
const sky=ctx.createLinearGradient(0,0,0,vh);
sky.addColorStop(0,"#1c1610");sky.addColorStop(0.62,"#3d2b15");sky.addColorStop(1,"#17110b");
ctx.fillStyle=sky;ctx.fillRect(-30,-30,vw + 60,vh + 60);

const hallY=vh*0.72;
const hallScale=Math.min(1.25,vw/740);
const craterOpen=_easeOutCubic(Math.min(1,afterHit/0.45));

// Side-Elevation Grand Bronze Hall getting obliterated dead-center!
this._drawBronzeHallSideElevation(ctx,cx,hallY,hallScale,t,craterOpen);

// Giant Thiên Bộc Quang Hà crashing straight through the roof!
const bBot=lt<hitTime?_lerp(0,hallY - 120*hallScale,lt/hitTime) :(hallY - 15*hallScale);
this._drawVolumetricLightBeam(ctx,cx,0,bBot,Math.min(vw*0.17,125),t,1.0);

// Expanding Ground Shockwave & Flying 3D-Tumbling Bronze Roof Debris!
if (afterHit>0) {
const swR=afterHit*440;
ctx.save();
ctx.globalAlpha=_clamp(1 - afterHit/0.95,0,1);
ctx.strokeStyle="#fff2a6";ctx.lineWidth=7;
ctx.beginPath();ctx.ellipse(cx,hallY - 95*hallScale,swR,swR*0.38,0,0,Math.PI*2);ctx.stroke();
ctx.restore();

// Slow-motion tumbling bronze tiles & timber beams!
const simT=afterHit*0.72;
for (const d of this.debris) {
const dx=cx + d.x + d.vx*simT;
const dy=(hallY - 125*hallScale) + d.y + d.vy*simT + 0.5*540*simT*simT;
ctx.save();
ctx.translate(dx,dy);
ctx.rotate(d.rot + d.vrot*simT);
ctx.fillStyle=d.col;ctx.strokeStyle="#1a120a";ctx.lineWidth=1;
ctx.fillRect(-d.w/2,-d.h/2,d.w,d.h);ctx.strokeRect(-d.w/2,-d.h/2,d.w,d.h);
ctx.restore();
}
}

ctx.restore();
this._setSubtitle("","OANH!! Thác ánh sáng Thiên Bộc Quang Hà đánh vỡ nóc Thanh Đồng Đại Điện, lộ ra lỗ thủng khổng lồ dội thẳng xuống giữa đại điện!!");
return;
}

// ---------------- SHOT 5 (8.25s – 10.15s): INTERIOR HALL FLOODED & PHƯƠNG NGUYÊN STEPS INTO THE LIGHT! ----------------
if (t<10.15) {
const lt=t - 8.25;
const u=lt / 1.9;
const {mcSkin,mcName}=this._getPlayerSkinAndName();
ctx.save();
ctx.translate((Math.random()-0.5)*5,(Math.random()-0.5)*5);

// Bronze Hall Interior bathed in blinding white-gold light
const bg=ctx.createLinearGradient(0,0,0,vh);
bg.addColorStop(0,"#3a2e1a");bg.addColorStop(0.65,"#241c11");bg.addColorStop(1,"#120e09");
ctx.fillStyle=bg;ctx.fillRect(-16,-16,vw + 32,vh + 32);

for (const side of [-1,1]) {
const px=cx + side*Math.min(vw*0.34,280);
ctx.fillStyle="#523f24";ctx.strokeStyle="#ffd700";ctx.lineWidth=2;
ctx.fillRect(px - 22,0,44,vh*0.80);ctx.strokeRect(px - 22,0,44,vh*0.80);
}
ctx.fillStyle="#2e2315";ctx.fillRect(0,vh*0.74,vw,vh*0.26);
ctx.strokeStyle="#d4af37";ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,vh*0.74);ctx.lineTo(vw,vh*0.74);ctx.stroke();

// Central Blinding Waterfall Pillar pouring straight onto the dais!
this._drawVolumetricLightBeam(ctx,cx,0,vh*0.78,Math.min(vw*0.17,130),t,1.0);

const W=global.ThreeKingsWorlds;
const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function"&&W) {
const watchers=[
{x:cx - Math.min(vw*0.29,225),y:vh*0.71,sk:pSkins.bach_ngung_bang||W.TK_SKINS.bach_ngung_bang,name:"Bạch Ngưng Băng",col:"#74eaff",f:"right"},
{x:cx + Math.min(vw*0.24,185),y:vh*0.72,sk:W.TK_SKINS.thiet_nhuoc_nam,name:"Thiết Nhược Nam",col:"#ffd700",f:"left"},
{x:cx + Math.min(vw*0.35,270),y:vh*0.73,sk:W.TK_SKINS.viem_quan,name:"Viêm Quân",col:"#ff9f43",f:"left"}
];
for (const wt of watchers) {
ctx.save();ctx.translate(wt.x,wt.y);ctx.scale(1.5,1.5);
global.PlayerManager.drawSkinPixelSprite(ctx,wt.sk,{bobY:Math.sin(t*12)*1.2,facing:wt.f});
ctx.restore();
ctx.font="bold 11.5px Georgia";ctx.textAlign="center";ctx.fillStyle=wt.col;
ctx.fillText(wt.name,wt.x,wt.y - 44);
}
W.Arch.drawTortoiseLandSpirit(ctx,cx - Math.min(vw*0.18,140),vh*0.74,t);

// PLAYER CHARACTER (PHƯƠNG NGUYÊN) stepping calmly right into the center beneath the roaring light column!
const fyX=_lerp(cx - 58,cx,_easeOutCubic(Math.min(1,u*1.3)));
const fyY=vh*0.72;
ctx.save();ctx.translate(fyX,fyY);ctx.scale(1.75,1.75);
global.PlayerManager.drawSkinPixelSprite(ctx,mcSkin,{bobY:Math.sin(t*8)*1.5,legOffset:u<0.7?Math.sin(t*12)*3 :0,facing:"up",isMoving:u<0.7});
ctx.restore();
ctx.font="bold 12px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(mcName,fyX + 1,fyY - 51);
ctx.fillStyle="#7ef7c4";ctx.fillText(mcName,fyX,fyY - 52);
}

ctx.restore();
this._setSubtitle(lt<1.05?"Địa Linh Bá Quy" :mcName,lt<1.05?"\"ÁNH SÁNG VINH QUANG THÁI CỔ!! Ngươi thật sự tính chuẩn đến mức này sao?!\"" :"\"Đợi đúng khoảnh khắc này! Để ta mượn Thiên Bộc Quang Hà của Tiêu Mang làm lò luyện Tiên Cổ!\"");
return;
}

// ---------------- SHOT 6 (10.15s – 12.65s): CLOSE-UP — PHƯƠNG NGUYÊN ACTIVATES CỔ CỐT DỰC, CỔ KIM THANG & CỔ KIM HÀ! ----------------
if (t<12.65) {
const lt=t - 10.15;
const u=lt / 2.5;
const {mcName}=this._getPlayerSkinAndName();
const shake=(u>0.35)?(Math.random()-0.5)*8 :0;
ctx.save();ctx.translate(shake,shake*0.6);

const bg=ctx.createRadialGradient(cx,cy,18,cx,cy,Math.max(vw,vh)*0.72);
bg.addColorStop(0,`rgba(255,248,200,${0.32 + u*0.58})`);
bg.addColorStop(0.4,`rgba(215,165,40,${0.24 + u*0.30})`);
bg.addColorStop(0.75,"#1a140f");
bg.addColorStop(1,"#08070a");
ctx.fillStyle=bg;ctx.fillRect(-20,-20,vw + 40,vh + 40);

this._drawVolumetricLightBeam(ctx,cx,0,vh,Math.min(vw*0.24,180),t,0.75);
this._drawSpeedlines(ctx,cx,cy,vw,vh,t,`rgba(255,242,166,${0.2 + u*0.42})`,52);

const wingOpen=_easeOutCubic(_clamp((lt - 0.1)/0.65,0,1));
const goldCoat=_easeOutCubic(_clamp((lt - 0.85)/0.75,0,1));
const jetPower=_easeOutCubic(_clamp((lt - 1.60)/0.65,0,1));

// Heroic Close-Up of Player Character transforming into the Golden Winged Warrior!
this._drawPlayerWingedHero(ctx,cx,cy*1.02,1.65 + u*0.18,t,wingOpen,goldCoat,"down",jetPower);

// Sequential Gu Activation Badges (Cổ Cốt Dực -> Cổ Kim Thang -> Cổ Kim Hà)
const guBanners=[
{start:0.10,end:2.5,y:vh*0.22,text:"TỨ CHUYỂN • CỔ CỐT DỰC (ĐÔI CÁNH XƯƠNG ĐEN)",col:"#c8d6e5"},
{start:0.90,end:2.5,y:vh*0.29,text:"NGŨ CHUYỂN • CỔ KIM THANG (HOÀNG KIM HỘ THỂ)",col:"#ffd700"},
{start:1.65,end:2.5,y:vh*0.36,text:"NGŨ CHUYỂN • CỔ KIM HÀ (NGƯỢC DÒNG XUNG THIÊN)",col:"#fff2a6"}
];
for (const gb of guBanners) {
if (lt<gb.start) continue;
const pop=_easeOutCubic(_clamp((lt - gb.start)/0.25,0,1));
ctx.save();
ctx.globalAlpha=pop;
ctx.fillStyle="rgba(8,10,16,0.78)";
ctx.strokeStyle=gb.col;ctx.lineWidth=1.6;
const bw=Math.min(430,vw*0.84);
ctx.fillRect(cx - bw/2,gb.y - 16,bw,28);
ctx.strokeRect(cx - bw/2,gb.y - 16,bw,28);
ctx.font="bold 12px Georgia";ctx.textAlign="center";ctx.fillStyle=gb.col;
ctx.fillText(gb.text,cx,gb.y + 3);
ctx.restore();
}

// Shocked Anime Cut-In Panel on Left: Bạch Ngưng Băng & Thiết Nhược Nam
if (lt>1.25) {
const cp=_easeOutCubic(_clamp((lt - 1.25)/0.25,0,1));
const cw=Math.min(315,vw*0.42);const ch=86;
const bx=-cw*(1 - cp) + 14;const by=vh*0.56;
ctx.save();
ctx.fillStyle="rgba(12,18,28,0.94)";ctx.strokeStyle="#74eaff";ctx.lineWidth=2.2;
ctx.fillRect(bx,by,cw,ch);ctx.strokeRect(bx,by,cw,ch);
ctx.font="bold 12.5px Georgia";ctx.textAlign="left";ctx.fillStyle="#74eaff";
ctx.fillText("Bạch Ngưng Băng (Kinh Hãi!)",bx + 12,by + 28);
ctx.font="11.5px Georgia";ctx.fillStyle="#f0ebe1";
ctx.fillText("\"Hắn... Hắn muốn bay thẳng vào",bx + 12,by + 50);
ctx.fillText("sát chiêu Ngũ Chuyển sao?! Phương Nguyên!!\"",bx + 12,by + 68);
ctx.restore();
}

// Blinding pre-launch flash
if (lt>2.28) {
ctx.fillStyle=`rgba(255,252,225,${_clamp((lt - 2.28)/0.22,0,1)*0.88})`;
ctx.fillRect(-20,-20,vw + 40,vh + 40);
}
ctx.restore();

const sub6=lt<0.9?"\"Cổ Cốt Dực (Tứ Chuyển) — Mở Cánh!!\"" :(lt<1.65?"\"Cổ Kim Thang (Ngũ Chuyển) — Hoàng Kim Hộ Thể!!\"" :"\"Cổ Kim Hà — Bay Ngược Thiên Bộc Quang Hà Lên Trời!!\"");
this._setSubtitle(mcName,sub6);
return;
}

// ---------------- SHOT 7 (12.65s – 15.15s): WIDE EXTERIOR — PHƯƠNG NGUYÊN SHOOTS OUT OF BRONZE HALL INTO THE LIGHT RIVER! ----------------
if (t<15.15) {
const lt=t - 12.65;
const u=lt / 2.5;
const {mcName}=this._getPlayerSkinAndName();

// Brief impact flash right when bursting out of the shattered roof!
const burstT=0.42;
const sh=(Math.abs(lt - burstT)<0.35)?12 :4;
ctx.save();
const _cs2=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
if (_cs2) ctx.translate((Math.random()-0.5)*sh,(Math.random()-0.5)*sh);

// Dramatic golden-storm sky & wide panoramic view of Bronze Mound + outer battlefield
const sky=ctx.createLinearGradient(0,0,0,vh);
sky.addColorStop(0,"#141c30");sky.addColorStop(0.55,"#382818");sky.addColorStop(1,"#140f0a");
ctx.fillStyle=sky;ctx.fillRect(-20,-20,vw + 40,vh + 40);

// Camera smoothly pans upward following Phương Nguyên as he pierces out of the Bronze Hall roof!
const camPanY=_lerp(0,vh*0.24,_easeInOutSine(u));
const hallY=vh*0.76 + camPanY;
const hallScale=Math.min(1.12,vw/780);

// Exterior Shattered Bronze Hall below
this._drawBronzeHallSideElevation(ctx,cx,hallY,hallScale,t,1.0);

// Roaring Thiên Bộc Quang Hà pouring straight into the shattered roof!
this._drawVolumetricLightBeam(ctx,cx,0,hallY - 15*hallScale,Math.min(vw*0.18,132),t,1.0);

// Crowd silhouettes on left & right of mound gazing straight UP in total shock!
const W=global.ThreeKingsWorlds;
const pSkins=(global.PlayerManager&&global.PlayerManager.CHARACTER_SKINS)||{};
if (global.PlayerManager&&typeof global.PlayerManager.drawSkinPixelSprite==="function"&&W) {
const onlookers=[
{x:cx - Math.min(vw*0.38,310),y:hallY + 26,sk:W.TK_SKINS.ma_vo_thien,name:"Ma Vô Thiên",col:"#c56cf0"},
{x:cx - Math.min(vw*0.28,225),y:hallY + 34,sk:W.TK_SKINS.dich_hoa,name:"Dịch Hỏa",col:"#ff6b35"},
{x:cx + Math.min(vw*0.28,225),y:hallY + 34,sk:W.TK_SKINS.phong_thien_ngu,name:"Phong Thiên Ngữ",col:"#7ef7f0"},
{x:cx + Math.min(vw*0.38,310),y:hallY + 26,sk:W.TK_SKINS.duc_trung,name:"Dực Trùng",col:"#4ce6ff"}
];
for (const onl of onlookers) {
if (onl.x<24||onl.x>vw - 24) continue;
ctx.save();ctx.translate(onl.x,onl.y);ctx.scale(1.1,1.1);
global.PlayerManager.drawSkinPixelSprite(ctx,onl.sk,{bobY:0,facing:"up"});
ctx.restore();
ctx.font="bold 10px Georgia";ctx.textAlign="center";ctx.fillStyle=onl.col;
ctx.fillText(onl.name,onl.x,onl.y + 26);
}
}

// PLAYER CHARACTER (PHƯƠNG NGUYÊN) shooting straight out from inside the hall through the roof crater UP into the light river!
const startY=hallY - 45*hallScale;
const endY=vh*0.24;
const flyProgress=_easeOutCubic(u);
const heroY=_lerp(startY,endY,flyProgress);

// Blazing golden meteor trail behind Phương Nguyên
const trailLen=185*Math.sin(Math.min(Math.PI,u*Math.PI));
if (trailLen>10) {
const trG=ctx.createLinearGradient(cx,heroY,cx,heroY + trailLen);
trG.addColorStop(0,"rgba(255,255,240,0.95)");
trG.addColorStop(0.4,"rgba(255,215,0,0.68)");
trG.addColorStop(1,"rgba(255,165,0,0)");
ctx.fillStyle=trG;
ctx.beginPath();ctx.moveTo(cx - 26,heroY);ctx.lineTo(cx + 26,heroY);ctx.lineTo(cx,heroY + trailLen);ctx.closePath();ctx.fill();
}

// Twin Sonic Shockwave Rings when bursting out of the Bronze Hall roof!
if (lt>burstT) {
const bt=lt - burstT;
for (let r=0;r<2;r++) {
const rt=bt - r*0.18;
if (rt<=0||rt>1.1) continue;
ctx.save();
ctx.globalAlpha=_clamp(1 - rt/1.1,0,1);
ctx.strokeStyle=r===0?"#ffffff" :"#ffd700";
ctx.lineWidth=5 - r*1.5;
ctx.beginPath();ctx.ellipse(cx,hallY - 120*hallScale - r*45,38 + rt*290,14 + rt*95,0,0,Math.PI*2);ctx.stroke();
ctx.restore();
}
}

// Draw the Golden Winged Player Character flying right inside the center of Thiên Bộc Quang Hà!
this._drawPlayerWingedHero(ctx,cx,heroY,1.18,t,1.0,1.0,"up",1.0);
ctx.font="bold 12px Georgia";ctx.textAlign="center";
ctx.fillStyle="rgba(0,0,0,0.85)";ctx.fillText(`🦅 ${mcName}`,cx + 1,heroY - 45);
ctx.fillStyle="#7ef7c4";ctx.fillText(`🦅 ${mcName}`,cx,heroY - 46);

// Tiêu Mang looking down from upper-right sky in total disbelief!
this._drawXiaoMangHeroic(ctx,cx + Math.min(vw*0.33,265),vh*0.26,0.75,t,0.3,0.45);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#fff2a6";
ctx.fillText("Tiêu Mang (Kinh Ngạc!)",cx + Math.min(vw*0.33,265),vh*0.26 + 58);

ctx.restore();
this._setSubtitle(lt<1.25?"Quần Hùng Chiến Trường" :"Tiêu Mang",lt<1.25?"\"Đó là vật gì vậy?! Kim quang chói lọi từ trong Thanh Đồng Đại Điện bay vọt lên trời — như một con chim hoàng kim khổng lồ!!\"" :"\"Hả?! Tại sao lại có tên quái nhân bay thẳng vào đỡ lấy sát chiêu Thiên Bộc Quang Hà của ta?!\"");
return;
}

// ---------------- SHOT 8 (15.15s – 17.6s): TRACKING SHOT INSIDE THE ROARING LIGHT WATERFALL! ----------------
const lt=t - 15.15;
const u=lt / 2.45;
const {mcName}=this._getPlayerSkinAndName();

ctx.save();
ctx.translate((Math.random()-0.5)*7,(Math.random()-0.5)*7);

// Inside the blinding roaring sea of white-gold Immemorial Light!
const bg=ctx.createLinearGradient(0,0,0,vh);
bg.addColorStop(0,"#fffce6");bg.addColorStop(0.45,"#f0c860");bg.addColorStop(1,"#523914");
ctx.fillStyle=bg;ctx.fillRect(-20,-20,vw + 40,vh + 40);

this._drawVolumetricLightBeam(ctx,cx,0,vh,Math.min(vw*0.34,250),t,1.0);
this._drawSpeedlines(ctx,cx,cy,vw,vh,t,"rgba(255,255,255,0.48)",60);

// Golden armor sparks shearing off Phương Nguyên as he battles upward against the Rank 5 killer move!
ctx.fillStyle="#fff2a6";
for (const sp of this.sparks) {
const sx0=cx + (sp.x - 0.5)*Math.min(vw*0.5,380);
const sy0=((sp.y*vh + t*720*sp.spd) % vh);
ctx.fillRect(sx0,sy0,sp.sz,sp.sz*5);
}

// Tracking Close-Medium Shot: Phương Nguyên soaring fiercely upward like a golden eagle!
const heroY=_lerp(vh*0.58,vh*0.42,_easeInOutSine(u)) + Math.sin(t*10)*6;
this._drawPlayerWingedHero(ctx,cx,heroY,1.62,t,1.0,1.0,"up",1.0);

// Glowing Cổ Thần Du (left) & Cổ Bích Không (right) beginning to respond to Phương Nguyên's call!
if (lt>1.05) {
const rp=_easeOutCubic(_clamp((lt - 1.05)/0.55,0,1));
// Emerald bamboo Cổ Bích Không on right hand
ctx.save();ctx.translate(cx + 84*rp,heroY - 8);ctx.globalAlpha=rp;
const bg2=ctx.createRadialGradient(0,0,2,0,0,28);
bg2.addColorStop(0,"#ffffff");bg2.addColorStop(0.5,"#38e8a8");bg2.addColorStop(1,"rgba(56,232,168,0)");
ctx.fillStyle=bg2;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
ctx.fillStyle="#188c5c";ctx.strokeStyle="#7ef7c4";ctx.lineWidth=1.5;
ctx.fillRect(-6,-16,12,32);ctx.strokeRect(-6,-16,12,32);
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#7ef7c4";
ctx.fillText("🎋 Cổ Bích Không",0,-24);
ctx.restore();

// Radiant Golden Orb Cổ Thần Du on left hand
ctx.save();ctx.translate(cx - 84*rp,heroY - 8);ctx.globalAlpha=rp;
const tg2=ctx.createRadialGradient(0,0,2,0,0,28);
tg2.addColorStop(0,"#ffffff");tg2.addColorStop(0.5,"#7ef7f0");tg2.addColorStop(1,"rgba(126,247,240,0)");
ctx.fillStyle=tg2;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();
ctx.font="bold 11px Georgia";ctx.textAlign="center";ctx.fillStyle="#fff2a6";
ctx.fillText("✨ Tiên Cổ Thần Du",0,-24);
ctx.restore();
}

// Final White-Gold Seamless Transition Flash straight into playable Sky Flight!
if (lt>1.92) {
ctx.fillStyle=`rgba(255,255,245,${_clamp((lt - 1.92)/0.52,0,1)})`;
ctx.fillRect(-20,-20,vw + 40,vh + 40);
}
ctx.restore();

this._setSubtitle(lt<1.05?"Quần Hùng Dưới Gò" :mcName,lt<1.05?"\"Không, kia là người! Chiến sĩ Hoàng Kim Kiêu Trúc đang ngược dòng Thiên Bộc Quang Hà bay lên trời!!\"" :"\"Lúc này ta cần trợ giúp — Địa Linh Bá Quy, Cổ Thần Du!! Cổ Bích Không!!\"");
},

// ==============================================================================
// CLIP 2: VIDEO-STYLE MINI CINEMA — THÁI CỔ QUANG QUYỀN (6.2s)
// ==============================================================================
_renderThaiCoQuangQuyenVideo(ctx,vw,vh) {
const t=this.t;
const cx=vw/2;const cy=vh/2;

if (t<2.9) {
// Shot 1: Tiêu Mang standing atop San Cha Mountain Peak igniting Thái Cổ Quang Quyền!
const u=t / 2.9;
const bg=ctx.createLinearGradient(0,0,0,vh);
bg.addColorStop(0,"#0d1224");bg.addColorStop(0.6,"#2b1e16");bg.addColorStop(1,"#120c08");
ctx.fillStyle=bg;ctx.fillRect(0,0,vw,vh);
this._drawSpeedlines(ctx,cx,cy*0.9,vw,vh,t,`rgba(255,240,160,${0.15 + u*0.35})`,44);
this._drawXiaoMangHeroic(ctx,cx,cy*1.05,1.62,t,_easeOutCubic(u),0.3 + u*0.7);
// Expanding Mountain-Sized Fist Silhouette forming in the sky above!
if (t>1.4) {
const fp=_easeOutCubic((t - 1.4)/1.4);
const r=60 + fp*115;
const fg=ctx.createRadialGradient(cx,vh*0.26,10,cx,vh*0.26,r);
fg.addColorStop(0,"#ffffff");fg.addColorStop(0.45,"#fff2a6");fg.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=fg;ctx.beginPath();ctx.arc(cx,vh*0.26,r,0,Math.PI*2);ctx.fill();
}
this._setSubtitle("Tiêu Mang",t<1.4?"\"Phúc địa này đã gần đến diệt vong... Xem ta mở rộng cánh cửa cho toàn bộ quần hùng!\"" :"\"Cổ Thái Quang! Cổ Thiên Ý! Cổ Không Quyền — SÁT CHIÊU: THÁI CỔ QUANG QUYỀN!!\"");
return;
}

// Shot 2 (2.9s – 6.2s): Colossal Mountain-Sized Golden Light Fist Smashing Blessed Land Membrane!
const lt=t - 2.9;
const hitT=1.22;
const isImpact=(lt>=hitT&&lt<hitT + 0.08);
if (isImpact) {
ctx.fillStyle="#06070a";ctx.fillRect(0,0,vw,vh);
ctx.fillStyle="#ffffff";ctx.beginPath();ctx.arc(cx,vh*0.64,175,0,Math.PI*2);ctx.fill();
this._drawSpeedlines(ctx,cx,vh*0.64,vw,vh,t,"#ffffff",60);
return;
}

const after=Math.max(0,lt - hitT);
const sh=after>0?Math.max(0,18*(1 - after/1.4)) :5;
ctx.save();const _cs2=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
if (_cs2) ctx.translate((Math.random()-0.5)*sh,(Math.random()-0.5)*sh);
const bg=ctx.createLinearGradient(0,0,0,vh);
bg.addColorStop(0,"#090d1a");bg.addColorStop(0.6,"#261c12");bg.addColorStop(1,"#140d0a");
ctx.fillStyle=bg;ctx.fillRect(-20,-20,vw + 40,vh + 40);

// Blessed Land Translucent Dome Membrane at vh*0.68
const domeY=vh*0.68;
ctx.strokeStyle=after>0?"#fff2a6" :"rgba(255,220,130,0.65)";
ctx.lineWidth=5;
ctx.beginPath();
if (after>0) {
ctx.moveTo(0,domeY + 35);ctx.lineTo(cx - 125,domeY - 6);
ctx.moveTo(cx + 125,domeY - 6);ctx.lineTo(vw,domeY + 35);
} else {
ctx.moveTo(0,domeY + 35);ctx.quadraticCurveTo(cx,domeY - 45,vw,domeY + 35);
}
ctx.stroke();

// Giant Descending Light Fist
const fy=lt<hitT?_lerp(-90,domeY - 20,_easeInCubic(lt/hitT)) :(domeY - 12);
const fg=ctx.createRadialGradient(cx,fy,18,cx,fy,175);
fg.addColorStop(0,"#ffffff");fg.addColorStop(0.45,"#fff2a6");fg.addColorStop(1,"rgba(255,215,0,0)");
ctx.fillStyle=fg;ctx.beginPath();ctx.arc(cx,fy,175,0,Math.PI*2);ctx.fill();
this._drawVolumetricLightBeam(ctx,cx,0,fy + 25,85,t,after>0?Math.max(0.25,1 - after/1.9) :0.85);

if (after>0) {
const rr=after*360;
ctx.strokeStyle=`rgba(255,245,185,${_clamp(1 - after/1.1,0,1)})`;ctx.lineWidth=6;
ctx.beginPath();ctx.ellipse(cx,domeY,rr,rr*0.36,0,0,Math.PI*2);ctx.stroke();
}
ctx.restore();
this._setSubtitle(after>0?"Quần Hùng Tam Xoa Sơn" :"Tiêu Mang",after>0?"\"OANH!! Màng thai Phúc Địa đã thủng một lỗ khổng lồ! Xông lên đoạt truyền thừa!!\"" :"\"QUANG MANG THÀNH QUYỀN — XUYÊN THỦNG MÀNG THAI PHÚC ĐỊA!!\"");
},

// ==============================================================================
// CLIP 3: VIDEO-STYLE MINI CINEMA — VINH DIỆU NGÔ THƯƠNG (6.0s)
// ==============================================================================
_renderVinhDieuNgoThuongVideo(ctx,vw,vh) {
const t=this.t;
const cx=vw/2;const cy=vh/2;

if (t<2.75) {
const u=t / 2.75;
const bg=ctx.createLinearGradient(0,0,0,vh);
bg.addColorStop(0,"#0c1220");bg.addColorStop(0.6,"#241c14");bg.addColorStop(1,"#0e0b09");
ctx.fillStyle=bg;ctx.fillRect(0,0,vw,vh);
this._drawSpeedlines(ctx,cx,cy,vw,vh,t,`rgba(255,245,180,${0.16 + u*0.35})`,42);
this._drawXiaoMangHeroic(ctx,cx,cy*1.02,1.58,t,_easeOutCubic(u),0.35 + u*0.65);

// 6-Zhang Golden Light Spear materializing diagonally across Tiêu Mang's hands!
if (t>1.1) {
const sp=_easeOutCubic((t - 1.1)/1.1);
ctx.save();ctx.translate(cx,cy*0.72);ctx.rotate(-0.22);
ctx.strokeStyle="#fff2a6";ctx.lineWidth=22*sp;ctx.lineCap="round";
ctx.beginPath();ctx.moveTo(-210*sp,0);ctx.lineTo(220*sp,0);ctx.stroke();
ctx.strokeStyle="#ffffff";ctx.lineWidth=8*sp;
ctx.beginPath();ctx.moveTo(-195*sp,0);ctx.lineTo(215*sp,0);ctx.stroke();
ctx.restore();
}
this._setSubtitle("Tiêu Mang",t<1.2?"\"Sương mù dày đặc thế này định ngăn bước Chính Đạo ta sao?!\"" :"\"Cổ Thái Quang! Cổ Ngã Ý! Cổ Minh Thương — SÁT CHIÊU: VINH DIỆU NGÔ THƯƠNG!!\"");
return;
}

// Shot 2 (2.75s – 6.0s): Giant 6-Zhang Spear of Light blasts down onto the Misty Mound & Blows Away ALL Fog!
const lt=t - 2.75;
const hitT=0.95;
const isImpact=(lt>=hitT&&lt<hitT + 0.08);
if (isImpact) {
ctx.fillStyle="#06080c";ctx.fillRect(0,0,vw,vh);
ctx.fillStyle="#ffffff";ctx.fillRect(cx - 85,0,170,vh*0.74);
this._drawSpeedlines(ctx,cx,vh*0.72,vw,vh,t,"#ffffff",58);
return;
}

const after=Math.max(0,lt - hitT);
const sh=after>0?Math.max(0,16*(1 - after/1.3)) :4;
ctx.save();const _cs2=global.vanCoSettings?global.vanCoSettings.get("screenShakeEnabled") :true;
if (_cs2) ctx.translate((Math.random()-0.5)*sh,(Math.random()-0.5)*sh);
const bg=ctx.createLinearGradient(0,0,0,vh);
bg.addColorStop(0,"#141926");bg.addColorStop(0.6,"#292218");bg.addColorStop(1,"#120e0a");
ctx.fillStyle=bg;ctx.fillRect(-20,-20,vw + 40,vh + 40);

// Bronze Hall revealed behind dispersing fog!
const hallY=vh*0.74;
this._drawBronzeHallSideElevation(ctx,cx,hallY,Math.min(1.15,vw/780),t,0);

// Thick fog clouds blowing violently outward to left & right once spear lands!
const fogAlpha=_clamp(1 - after/1.5,0,1);
if (fogAlpha>0.02) {
for (let i=0;i<14;i++) {
const side=(i % 2===0)? -1 :1;
const fx0=cx + (i - 6.5)*58 + side*after*340;
const fy0=hallY - 55 - (i % 3)*34;
const fg=ctx.createRadialGradient(fx0,fy0,14,fx0,fy0,115);
fg.addColorStop(0,`rgba(220,235,230,${0.62*fogAlpha})`);
fg.addColorStop(1,"rgba(220,235,230,0)");
ctx.fillStyle=fg;ctx.beginPath();ctx.arc(fx0,fy0,115,0,Math.PI*2);ctx.fill();
}
}

// Blazing Spear descending & shockwave!
if (lt<hitT + 0.55) {
const spY=lt<hitT?_lerp(-60,hallY - 25,_easeInCubic(lt/hitT)) :(hallY - 25);
const spA=lt<hitT?1 :_clamp(1 - (lt - hitT)/0.55,0,1);
this._drawVolumetricLightBeam(ctx,cx,0,spY,72,t,spA);
}
if (after>0) {
const rr=after*420;
ctx.strokeStyle=`rgba(255,248,200,${_clamp(1 - after/1.05,0,1)})`;ctx.lineWidth=6;
ctx.beginPath();ctx.ellipse(cx,hallY - 20,rr,rr*0.32,0,0,Math.PI*2);ctx.stroke();
}

ctx.restore();
this._setSubtitle(after>0.2?"Quần Hùng Chính Ma" :"Tiêu Mang",after>0.2?"\"Sương mù tan sạch rồi!! Trời đất ơi — gần mười vạn khuyển thú vây quanh Thanh Đồng Đại Điện!!\"" :"\"VINH DIỆU NGÔ THƯƠNG — QUÉT SẠCH MÊ VỤ GÒ NÚI!!\"");
}
});
})(window);
