(function (global) {
"use strict";
const {GU_ART_SPECS,PATH_FALLBACK_COLORS,_buildShapeMarkup,_buildDetailOverlay,_buildRankFrame}=global.VanCoGuArtData;
class GuArtRenderer {
constructor() {
this._uriCache=new Map();
this._imgCache=new Map();
}

_resolveSpec(guOrId) {
let id="";
let rank=1;
let path="";
if (typeof guOrId==="string") {
id=guOrId;
const db=global.GuSystem&&global.GuSystem.GU_DATABASE;
if (db&&db[id]) {
rank=db[id].defaultRank||db[id].minRank||1;
path=db[id].path||"";
}
} else if (guOrId&&typeof guOrId==="object") {
id=guOrId.id||guOrId.guId||"";
rank=guOrId.rank||guOrId.guRank||guOrId.defaultRank||guOrId.minRank||1;
path=guOrId.path||"";
if (!id&&Array.isArray(guOrId.requiredGuIds)&&guOrId.requiredGuIds[0]) {
id=guOrId.requiredGuIds[0];
}
}
if (GU_ART_SPECS[id]) {
return {id,rank,spec:GU_ART_SPECS[id]};
}
const pal=PATH_FALLBACK_COLORS[path]||["#a8f0ff","#38c992","#104234","#ffffff","#ffd700"];
return {
id:id||"default_gu",
rank,
spec:{shape:"armor_scarab",c1:pal[0],c2:pal[1],c3:pal[2],glow:pal[3],accent:pal[4],detail:"stars"}
};
}

getSvgString(guOrId,overrideRank=null) {
const resolved=this._resolveSpec(guOrId);
const rank=overrideRank!==null?overrideRank :resolved.rank;
const sp=resolved.spec;
const bodyMarkup=_buildShapeMarkup(sp);
const detailMarkup=_buildDetailOverlay(sp.detail,sp.glow,sp.accent);
const rankFrame=_buildRankFrame(rank);

return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
<defs>
  <radialGradient id="aura" cx="50%" cy="50%" r="50%">
    <stop offset="0%" stop-color="${sp.c2}" stop-opacity="0.45"/>
    <stop offset="65%" stop-color="${sp.c2}" stop-opacity="0.14"/>
    <stop offset="100%" stop-color="${sp.c3}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="body" x1="15%" y1="10%" x2="85%" y2="90%">
    <stop offset="0%" stop-color="${sp.c1}"/>
    <stop offset="52%" stop-color="${sp.c2}"/>
    <stop offset="100%" stop-color="${sp.c3}"/>
  </linearGradient>
  <linearGradient id="wing" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${sp.c1}" stop-opacity="0.92"/>
    <stop offset="60%" stop-color="${sp.c2}" stop-opacity="0.78"/>
    <stop offset="100%" stop-color="${sp.c3}" stop-opacity="0.88"/>
  </linearGradient>
  <radialGradient id="core" cx="38%" cy="35%" r="60%">
    <stop offset="0%" stop-color="#ffffff"/>
    <stop offset="45%" stop-color="${sp.glow}"/>
    <stop offset="100%" stop-color="${sp.c2}"/>
  </radialGradient>
</defs>
${rankFrame}
${bodyMarkup}
${detailMarkup}
</svg>`;
}

getDataUri(guOrId,overrideRank=null) {
const resolved=this._resolveSpec(guOrId);
const rank=overrideRank!==null?overrideRank :resolved.rank;
const tier=rank>=9?9 :(rank>=8?8 :(rank>=7?7 :(rank>=6?6 :1)));
const key=`${resolved.id}_${tier}`;
const cached=this._uriCache.get(key);
if (cached) return cached;
const svg=this.getSvgString(resolved.id,rank);
const uri="data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
this._uriCache.set(key,uri);
return uri;
}

renderImgHtml(guOrId,sizePx=36,extraClass="",overrideRank=null) {
const uri=this.getDataUri(guOrId,overrideRank);
const alt=(guOrId&&typeof guOrId==="object"&&guOrId.name)?String(guOrId.name).replace(/"/g,"") :"Cổ Trùng";
const cls=`gu-art-img ${extraClass}`.trim();
return `<img class="${cls}" src="${uri}" width="${sizePx}" height="${sizePx}" alt="${alt}" draggable="false">`;
}

drawOnCanvas(ctx,guOrId,x,y,sizePx=48,overrideRank=null) {
if (!ctx) return false;
const uri=this.getDataUri(guOrId,overrideRank);
let img=this._imgCache.get(uri);
if (!img) {
img=new Image();
img._loaded=false;
img.onload=()=>{img._loaded=true;};
img.src=uri;
this._imgCache.set(uri,img);
}
if (img._loaded&&img.complete) {
ctx.drawImage(img,x - sizePx/2,y - sizePx/2,sizePx,sizePx);
return true;
}
return false;
}
}

GuArtRenderer.SPECS=GU_ART_SPECS;
const instance=new GuArtRenderer();
global.GuArtRenderer=GuArtRenderer;
global.vanCoGuArt=instance;
})(window);
