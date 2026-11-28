(function (global) {
"use strict";
const FIVE_REGION_ATLAS={
nam_cuong:{id:"nam_cuong",name:"Nam Cương",icon:"⛰️",color:"#4cd964",desc:"Thập vạn đại sơn, Cổ Nguyệt Sơn Trại, Bạch Cốt Sơn, Thương Gia Thành, Tam Vương Sơn."},
bac_nguyen:{id:"bac_nguyen",name:"Bắc Nguyên",icon:"🌾",color:"#ffd700",desc:"Thảo nguyên Hoàng Kim, Vương Đình Phúc Địa, Lang Gia, Nghịch Lưu Hà, Phong Ma Quật."},
trung_chau:{id:"trung_chau",name:"Trung Châu",icon:"⚔️",color:"#67b7d1",desc:"Thập Đại Cổ Phái, Thiên Thê Sơn, Hồ Tiên Phúc Địa, Thiên Đình Bạch Ngọc Kinh."},
dong_hai:{id:"dong_hai",name:"Đông Hải",icon:"🌊",color:"#3b8beb",desc:"Vạn đảo linh uyên, Đông Hải Long Cung, tài nguyên hải vực phong phú bậc nhất."},
tay_mac:{id:"tay_mac",name:"Tây Mạc",icon:"🏜️",color:"#e6a84c",desc:"Sa mạc vô tận, thương đội liên thành, ốc đảo linh tuyền."}
};
class WorldMap {
constructor(mapManager) {
this.mapManager=mapManager||null;
}
getRegionAtlas() {
return FIVE_REGION_ATLAS;
}
resolveRegionKey(regionNameStr) {
const s=String(regionNameStr||"").toLowerCase();
if (s.includes("bắc nguyên")) return "bac_nguyen";
if (s.includes("trung châu")||s.includes("thiên đình")||s.includes("quang âm")) return "trung_chau";
if (s.includes("đông hải")) return "dong_hai";
if (s.includes("tây mạc")) return "tay_mac";
return "nam_cuong";
}
}
WorldMap.FIVE_REGION_ATLAS=FIVE_REGION_ATLAS;
global.WorldMap=WorldMap;
})(window);
