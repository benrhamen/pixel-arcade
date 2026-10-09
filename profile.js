/* Pixel Arcade shared character profile, schema v1. Device-only (localStorage), no personal data.
   Key: "pa.profile.v1". Values are INDEXES into the append-only lists below: add new entries at the END only. */
(function(root){
"use strict";
var KEY="pa.profile.v1", NICK_MAX=12;
var SKINS=["#ffdbb5","#f5c28f","#e0a370","#c68650","#9a5f34","#6b3f22","#5b8cff","#5fd068","#a3a7b5"];
var HAIR_COLORS=["#1b1b2a","#5a3215","#a8642a","#f2c94c","#ff5d8f","#29e7ff","#9b5cff","#eeeeee"];
var OUTFITS=["#ff2e88","#29e7ff","#3dff6e","#ffd23f","#8a3ffc","#ff7a1a","#f5f5f5","#5b8cff"];
var HAIR_STYLES=["short","spiky","long","bun","pigtails","ponytail","mohawk","bald","curly","afro","bob","sidepart","braids","buzz","topknot","messy","wavy","undercut","mullet","twinbuns"];
/* styles 8+ map to a base style (index 0-7) for games that only know the first 8 */
var STYLE_BASE={curly:"short",afro:"short",bob:"long",sidepart:"short",braids:"long",buzz:"short",topknot:"bun",messy:"spiky",wavy:"long",undercut:"short",mullet:"long",twinbuns:"bun"};
var ACCESSORIES=["none","cap","glasses","headphones","crown","sunglasses","wizardHat","beanie","bow","headband","goggles","halo","horns","bunnyEars","catEars","eyepatch","mask","earrings"];
var EYES=["dot","wide","sleepy","happy","wink","sparkle","heart","slit","round","cross"];
var MOUTHS=["smile","grin","open","neutral","smirk","tongue","oh","kitty","frown","braces"];
var OUTFIT_STYLES=["tee","hoodie","jacket","dress","robe","armor","overalls","suit","labcoat","stripes"];
var EXTRAS=["beard","cape","gloves","magicBoots","freckles","blush","scar","moustache","brows"];
var BLOCK=["FUCK","FUK","FCK","SHIT","BITCH","CUNT","DICK","COCK","PUSSY","ASSHOLE","BASTARD","WANK","TWAT","SLUT","WHORE","PISS","BOLLOCK","PENIS","VAGINA","SEX","PORN","NAZI","HITLER","RAPE","NIGG","NIGA","FAGG","RETARD","SPAZ","IDIOT","STUPID"];
var ALLOW=["SUSSEX","ESSEX","SEXTON","COCKATOO","COCKATIEL","DICKENS","HANCOCK","PEACOCK","GRAPE","DRAPE","SCRAPE","TRAPE"];
function defaults(){return {v:1,name:"",skin:1,hairStyle:"short",hairColor:0,outfit:1,accessory:"none",extras:{},
 skinHex:SKINS[1],hairHex:HAIR_COLORS[0],outfitHex:OUTFITS[1],accentHex:"#ffd23f",eyeHex:"#14102c",eyes:0,mouth:0,outfitStyle:0,updated:0}}
function hex(v,d){return (typeof v==="string"&&/^#[0-9a-fA-F]{6}$/.test(v))?v.toLowerCase():d}
function rgb(h){return [parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]}
function nearest(h,list){var a=rgb(h),b=0,bd=1e9;list.forEach(function(c,i){var x=rgb(c),d=0;for(var k=0;k<3;k++)d+=(a[k]-x[k])*(a[k]-x[k]);if(d<bd){bd=d;b=i}});return b}
function baseStyle(st){return STYLE_BASE[st]||st}
function cleanNickname(s){return String(s||"").toUpperCase().replace(/[^A-Z0-9 \-!._]/g,"").replace(/\s+/g," ").trim().slice(0,NICK_MAX)}
function nicknameProblem(raw){var n=cleanNickname(raw);if(!n)return null;
 var q=n.replace(/0/g,"O").replace(/[1!]/g,"I").replace(/3/g,"E").replace(/4/g,"A").replace(/5/g,"S").replace(/7/g,"T").replace(/[^A-Z]/g,"");
 ALLOW.forEach(function(w){q=q.split(w).join("#")});
 return BLOCK.some(function(w){return q.indexOf(w)>=0})?"Pick a friendlier nickname":null}
function idx(v,len,d){return (typeof v==="number"&&isFinite(v)&&v>=0&&v<len)?Math.floor(v):d}
function pick(v,list,d){return list.indexOf(v)>=0?v:d}
/* Validate anything into a safe profile. Unknown fields are kept in .rest so writers can preserve them. */
function clean(o){var d=defaults();if(!o||typeof o!=="object")return d;
 var r={v:1,name:cleanNickname(o.name),hairStyle:pick(o.hairStyle,HAIR_STYLES,d.hairStyle),accessory:pick(o.accessory,ACCESSORIES,d.accessory),
  eyes:idx(o.eyes,EYES.length,0),mouth:idx(o.mouth,MOUTHS.length,0),outfitStyle:idx(o.outfitStyle,OUTFIT_STYLES.length,0),
  extras:{},updated:typeof o.updated==="number"?o.updated:0};
 /* hex colours are the truth when present; the index fields are always the nearest palette entry so index-only readers keep working */
 r.skinHex=hex(o.skinHex,null)||SKINS[idx(o.skin,SKINS.length,d.skin)];
 r.hairHex=hex(o.hairHex,null)||HAIR_COLORS[idx(o.hairColor,HAIR_COLORS.length,d.hairColor)];
 r.outfitHex=hex(o.outfitHex,null)||OUTFITS[idx(o.outfit,OUTFITS.length,d.outfit)];
 r.accentHex=hex(o.accentHex,d.accentHex);r.eyeHex=hex(o.eyeHex,d.eyeHex);
 r.skin=nearest(r.skinHex,SKINS);r.hairColor=nearest(r.hairHex,HAIR_COLORS);r.outfit=nearest(r.outfitHex,OUTFITS);
 EXTRAS.forEach(function(k){if(o.extras&&o.extras[k]===true)r.extras[k]=true});
 if(nicknameProblem(r.name))r.name="";
 return r}
function migrate(o){return o} /* v1 is the first version. A future v2 reads pa.profile.v1 here and converts. */
function raw(){try{return JSON.parse(root.localStorage.getItem(KEY))}catch(e){return null}}
function load(){return clean(migrate(raw()))}
function exists(){return !!raw()}
function save(p){var c=clean(p),old=raw()||{},out={};
 for(var k in old)out[k]=old[k]; /* preserve unknown fields */
 for(var j in c)out[j]=c[j]; c.updated=out.updated=Date.now();
 try{root.localStorage.setItem(KEY,JSON.stringify(out));return true}catch(e){return false}}
function onChange(cb){root.addEventListener("storage",function(e){if(e.key===KEY||e.key===null)cb(load())})}
/* 16x16 pixel renderer, used by the hub; games may use it or draw the profile in their own style. */
function shade(h,f){var c=rgb(h).map(function(v){return Math.max(0,Math.min(255,Math.round(v*f)))});return "#"+c.map(function(v){return ("0"+v.toString(16)).slice(-2)}).join("")}
function sprite(p){p=clean(p);var g=[],i,j;for(i=0;i<16;i++){g.push([]);for(j=0;j<16;j++)g[i].push(null)}
 function s(x,y,c){if(x>=0&&x<16&&y>=0&&y<16)g[y][x]=c}
 function r(x0,y0,x1,y1,c){for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)s(x,y,c)}
 var sk=p.skinHex,hc=p.hairHex,oc=p.outfitHex,ac=p.accentHex,ec=p.eyeHex,ex=p.extras,ink="#14102c",mc="#b0453a";
 if(ex.cape)r(2,11,13,15,"#7a1fa2");
 r(3,11,12,15,oc);r(2,11,2,13,oc);r(13,11,13,13,oc);r(2,14,2,14,ex.gloves?"#ffffff":sk);r(13,14,13,14,ex.gloves?"#ffffff":sk);
 var os=p.outfitStyle;
 if(os===1){r(5,11,10,11,shade(oc,0.7));s(7,13,ac);s(8,13,ac)}
 if(os===2)r(7,12,7,15,ac);
 if(os===3){r(2,13,13,15,oc);r(2,15,13,15,ac)}
 if(os===4){r(3,15,12,15,ac);r(7,11,8,15,ac)}
 if(os===5){r(3,11,12,12,"#9aa7c7");r(6,13,9,15,ac)}
 if(os===6)r(5,13,10,15,ac);
 if(os===7){r(6,11,9,12,"#ffffff");r(7,12,8,15,ac)}
 if(os===8){r(3,11,12,15,"#f5f5f5");r(6,11,9,15,oc)}
 if(os===9){r(3,12,12,12,ac);r(3,14,12,14,ac)}
 if(os===0||os===1||os===2||os===6||os===7||os===8||os===9)r(3,15,12,15,ac);
 s(2,13,ac);s(13,13,ac);r(5,11,6,11,ac);r(9,11,10,11,ac);
 r(7,11,8,11,sk);
 if(ex.magicBoots){r(4,15,5,15,"#ffd23f");r(10,15,11,15,"#ffd23f")}
 r(4,4,11,10,sk);s(4,4,null);s(11,4,null);s(4,10,null);s(11,10,null);
 var e=p.eyes;
 if(e===0){s(6,7,ec);s(9,7,ec)}
 if(e===1){r(6,7,6,8,ec);r(9,7,9,8,ec)}
 if(e===2){r(5,7,6,7,ec);r(9,7,10,7,ec)}
 if(e===3){s(5,8,ec);s(6,7,ec);s(9,7,ec);s(10,8,ec)}
 if(e===4){s(6,7,ec);r(9,7,10,7,ec)}
 if(e===5){s(6,6,ec);s(5,7,ec);s(6,7,ec);s(7,7,ec);s(6,8,ec);s(9,6,ec);s(8,7,ec);s(9,7,ec);s(10,7,ec);s(9,8,ec)}
 if(e===6){[[5,6],[7,6],[5,7],[6,7],[7,7],[6,8]].forEach(function(q){s(q[0],q[1],"#ff3fa4");s(q[0]+3,q[1],"#ff3fa4")})}
 if(e===7){r(6,6,6,8,ec);r(9,6,9,8,ec)}
 if(e===8){r(5,7,6,8,ec);r(9,7,10,8,ec);s(5,7,"#ffffff");s(9,7,"#ffffff")}
 if(e===9){[[5,6],[7,6],[6,7],[5,8],[7,8]].forEach(function(q){s(q[0],q[1],ec);s(q[0]+3,q[1],ec)})}
 var m=p.mouth;
 if(m===0){s(6,9,mc);s(7,10,mc);s(8,10,mc);s(9,9,mc)}
 if(m===1){r(6,9,9,9,"#ffffff");s(5,9,mc);s(10,9,mc);r(6,10,9,10,mc)}
 if(m===2)r(7,9,8,10,"#5a1f1f");
 if(m===3)r(7,9,8,9,mc);
 if(m===4){r(7,9,8,9,mc);s(9,8,mc)}
 if(m===5){r(7,9,8,9,mc);s(8,10,"#ff6b8a")}
 if(m===6)r(7,9,8,10,"#7a2a2a");
 if(m===7){s(6,9,mc);s(7,10,mc);s(8,9,mc);s(9,10,mc)}
 if(m===8){s(6,10,mc);s(7,9,mc);s(8,9,mc);s(9,10,mc)}
 if(m===9){r(6,9,9,9,"#ffffff");s(7,9,"#9aa7c7");s(9,9,"#9aa7c7")}
 if(ex.freckles){var fk=shade(sk,0.72);[[5,8],[6,9],[9,9],[10,8]].forEach(function(q){if(!(m===1&&q[1]===9))s(q[0],q[1],fk)})}
 if(ex.blush){s(5,8,"#ff8fa8");s(10,8,"#ff8fa8")}
 if(ex.scar){s(10,5,"#c04a4a");s(10,6,"#c04a4a")}
 if(ex.moustache)r(6,8,9,8,hc);
 if(ex.brows){r(5,6,6,6,shade(hc,0.8));r(9,6,10,6,shade(hc,0.8))}
 if(ex.beard){r(5,9,10,10,hc);if(m===0)r(7,9,8,9,mc);else r(7,9,8,9,mc)}
 var h=p.hairStyle;
 if(h!=="bald"&&h!=="mohawk"&&h!=="buzz"){r(5,3,10,3,hc);r(4,4,11,4,hc);s(4,5,hc);s(11,5,hc)}
 if(h==="buzz"){r(5,3,10,3,shade(hc,0.8));r(4,4,11,4,shade(hc,0.8))}
 if(h==="spiky"||h==="messy"){[5,6,8,9,10].forEach(function(x){s(x,2,hc)});s(7,1,hc);if(h==="messy"){s(9,1,hc);s(4,3,hc);s(11,3,hc)}}
 if(h==="long"){r(3,5,4,12,hc);r(11,5,12,12,hc)}
 if(h==="bun"){r(7,1,8,2,hc)}
 if(h==="topknot"){r(7,0,8,2,hc)}
 if(h==="twinbuns"){r(4,1,5,2,hc);r(10,1,11,2,hc)}
 if(h==="pigtails"){r(3,6,3,9,hc);r(12,6,12,9,hc);s(4,5,hc);s(11,5,hc)}
 if(h==="ponytail"){r(12,5,12,10,hc);s(13,10,hc)}
 if(h==="mohawk"){r(7,0,8,4,hc);r(6,3,9,3,hc)}
 if(h==="curly"){r(4,2,11,3,hc);s(3,4,hc);s(12,4,hc);s(3,6,hc);s(12,6,hc)}
 if(h==="afro"){r(3,1,12,3,hc);r(2,3,3,8,hc);r(12,3,13,8,hc);r(3,2,12,2,hc)}
 if(h==="bob"){r(3,5,4,8,hc);r(11,5,12,8,hc)}
 if(h==="sidepart"){r(5,3,10,3,hc);r(4,4,11,4,hc);s(4,5,hc);s(5,5,hc);s(11,5,hc)}
 if(h==="braids"){r(3,5,3,12,hc);r(12,5,12,12,hc);s(3,8,shade(hc,0.7));s(12,8,shade(hc,0.7));s(3,11,shade(hc,0.7));s(12,11,shade(hc,0.7))}
 if(h==="wavy"){r(3,5,4,11,hc);r(11,5,12,11,hc);s(2,7,hc);s(13,9,hc)}
 if(h==="undercut"){r(5,2,10,3,hc);r(4,4,11,4,shade(hc,0.8))}
 if(h==="mullet"){r(5,2,10,3,hc);r(3,5,4,5,hc);r(11,5,12,5,hc);r(4,9,11,11,hc)}
 if(h!=="bald"&&h!=="buzz"&&h!=="mohawk"){s(10,4,ac);s(10,5,shade(ac,0.8))}
 var a=p.accessory;
 if(a==="cap"){r(4,3,11,4,"#e84a4a");r(3,5,7,5,"#b83030")}
 if(a==="glasses"){r(5,7,6,7,ink);r(9,7,10,7,ink);r(7,7,8,7,ink);s(6,7,"#ffffff");s(9,7,"#ffffff")}
 if(a==="sunglasses")r(5,7,10,8,"#14102c");
 if(a==="goggles"){r(5,6,10,6,"#8a6a3a");r(5,7,6,8,"#29e7ff");r(9,7,10,8,"#29e7ff")}
 if(a==="headphones"){r(4,3,11,3,"#9aa7c7");r(3,6,3,8,"#29e7ff");r(12,6,12,8,"#29e7ff")}
 if(a==="crown"){r(5,2,10,3,"#ffd23f");s(5,1,"#ffd23f");s(7,1,"#ffd23f");s(9,1,"#ffd23f");s(10,1,"#ffd23f");s(6,1,null);s(8,1,null)}
 if(a==="wizardHat"){r(3,4,12,4,"#5b3fd0");r(5,3,10,3,"#5b3fd0");r(6,2,9,2,"#5b3fd0");r(7,1,8,1,"#5b3fd0");s(8,0,"#5b3fd0");r(5,3,10,3,ac)}
 if(a==="beanie"){r(4,2,11,4,ac);r(4,4,11,4,shade(ac,0.7));s(7,1,"#ffffff");s(8,1,"#ffffff")}
 if(a==="bow"){r(9,2,11,3,ac);s(10,3,shade(ac,0.6))}
 if(a==="headband"){r(4,4,11,4,ac)}
 if(a==="halo"){r(5,0,10,0,"#ffd23f");s(4,1,"#ffd23f");s(11,1,"#ffd23f");r(5,2,10,2,null)}
 if(a==="horns"){s(4,2,"#ff4d4d");s(4,3,"#ff4d4d");s(11,2,"#ff4d4d");s(11,3,"#ff4d4d");s(3,1,"#ff4d4d");s(12,1,"#ff4d4d")}
 if(a==="bunnyEars"){r(5,0,5,3,"#ffffff");r(10,0,10,3,"#ffffff");r(6,1,6,2,"#ffb3d1")}
 if(a==="catEars"){s(4,2,hc);s(5,3,hc);s(5,2,hc);s(11,2,hc);s(10,3,hc);s(10,2,hc);s(4,1,hc);s(11,1,hc)}
 if(a==="eyepatch"){r(5,7,6,8,"#14102c");r(4,5,11,5,"#14102c")}
 if(a==="mask"){r(4,8,11,10,"#f5f5f5");r(4,8,11,8,"#f5f5f5")}
 if(a==="earrings"){s(3,8,"#ffd23f");s(12,8,"#ffd23f")}
 return g}
/* opts: {outline:true} adds a 1px dark outline (kawaii look); {crop:[x,y,w,h]} draws only part of the 16x16 grid. */
function draw(canvas,p,scale,opts){scale=scale||8;opts=opts||{};var g=sprite(p),c=canvas.getContext("2d"),cr=opts.crop||[0,0,16,16],ol=opts.outline?1:0;
 var W=(cr[2]+2*ol)*scale,H=(cr[3]+2*ol)*scale;canvas.width=W;canvas.height=H;c.clearRect(0,0,W,H);
 function at(x,y){return (x>=0&&x<16&&y>=0&&y<16)?g[y][x]:null}
 if(ol){c.fillStyle=opts.outlineColor||"#5b3a6b";for(var y=cr[1]-1;y<=cr[1]+cr[3];y++)for(var x=cr[0]-1;x<=cr[0]+cr[2];x++){
  if(at(x,y))continue;if(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))c.fillRect((x-cr[0]+ol)*scale,(y-cr[1]+ol)*scale,scale,scale)}}
 for(var y2=cr[1];y2<cr[1]+cr[3];y2++)for(var x2=cr[0];x2<cr[0]+cr[2];x2++){var v=at(x2,y2);if(v){c.fillStyle=v;c.fillRect((x2-cr[0]+ol)*scale,(y2-cr[1]+ol)*scale,scale,scale)}}}
root.PAProfile={KEY:KEY,SKINS:SKINS,HAIR_COLORS:HAIR_COLORS,OUTFITS:OUTFITS,HAIR_STYLES:HAIR_STYLES,ACCESSORIES:ACCESSORIES,EXTRAS:EXTRAS,EYES:EYES,MOUTHS:MOUTHS,OUTFIT_STYLES:OUTFIT_STYLES,STYLE_BASE:STYLE_BASE,baseStyle:baseStyle,nearest:nearest,hex:hex,
 NICK_MAX:NICK_MAX,defaults:defaults,clean:clean,cleanNickname:cleanNickname,nicknameProblem:nicknameProblem,load:load,save:save,exists:exists,onChange:onChange,sprite:sprite,draw:draw};
})(typeof window!=="undefined"?window:this);

/* PAProfile.drawPixel(canvas, profile, scale, opts): 24x28 pixel kawaii chibi, same pa.profile.v1 fields. opts.view=[x,y,w,h] crops to a region of the grid. */
(function(root){
"use strict";
var P=root.PAProfile,GW=24,GH=28,INK="#3d2250";
function rgb(h){return [parseInt(h.substr(1,2),16),parseInt(h.substr(3,2),16),parseInt(h.substr(5,2),16)]}
function sh(h,f){var c=rgb(h).map(function(v){return Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)))});return "#"+c.map(function(v){return ("0"+v.toString(16)).slice(-2)}).join("")}
function grid(p){
 p=P.clean(p);var g=[],x,y;for(y=0;y<GH;y++){g.push([]);for(x=0;x<GW;x++)g[y].push(null)}
 var sk=p.skinHex,hc=p.hairHex,oc=p.outfitHex,ac=p.accentHex,ec=p.eyeHex,ex=p.extras||{};
 var st=p.hairStyle,acc=p.accessory,skL=sh(sk,1.12),skD=sh(sk,.84),hL=sh(hc,1.4),hD=sh(hc,.7),oL=sh(oc,1.3),oD=sh(oc,.72);
 function s(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&x<GW&&y>=0&&y<GH)g[y][x]=c}
 function r(x0,y0,x1,y1,c){for(var y=y0;y<=y1;y++)for(var x=x0;x<=x1;x++)s(x,y,c)}
 function ell(cx,cy,rx,ry,c,clip){for(var y=0;y<GH;y++)for(var x=0;x<GW;x++){var dx=(x+.5-cx)/rx,dy=(y+.5-cy)/ry;if(dx*dx+dy*dy<=1&&(!clip||clip(x,y)))g[y][x]=c}}
 function row(y,xs,c){xs.forEach(function(x){s(x,y,c)})}
 /* cape */
 if(ex.cape){r(5,19,18,27,"#7a1fa2");r(5,25,18,27,"#5d1580")}
 /* back hair */
 if(st==="long"||st==="wavy"||st==="mullet"){ell(12,15,10.2,9.5,hc,function(x,y){return y<=23});r(5,20,18,23,hD);if(st==="wavy"){row(22,[3,5,7,16,18,20],hc);row(23,[4,6,17,19],hD)}}
 if(st==="braids"){r(3,10,6,25,hc);r(17,10,20,25,hc);for(var i=11;i<25;i+=3){row(i,[3,4,5,6,17,18,19,20],hD)}}
 if(st==="bob"){ell(12,12.5,10,6.5,hc);ell(12,16,9,2.6,hD)}
 if(st==="pigtails"){ell(3.5,17,2.8,6,hc);ell(20.5,17,2.8,6,hc)}
 if(st==="ponytail"){ell(20.5,11,2.6,6,hc);r(19,5,20,7,hc)}
 if(st==="bun"){ell(12,2.5,4,3,hc);ell(12,2.5,2.5,1.5,hL)}
 if(st==="topknot"){ell(12,2,3,2.5,hc)}
 if(st==="twinbuns"){ell(5,3.5,3.2,3,hc);ell(19,3.5,3.2,3,hc)}
 if(st==="afro"||st==="curly"){ell(12,8.5,11,8.5,hc);ell(12,8.5,11,8.5,hc)}
 if(acc==="bunnyEars"){ell(8,0,2.2,5,"#ffffff");ell(8,1,1,3,"#ffb3cf");ell(16,0,2.2,5,"#ffffff");ell(16,1,1,3,"#ffb3cf")}
 /* body */
 r(7,20,16,27,oc);r(6,21,17,27,oc);r(5,22,18,27,oc);
 r(6,25,17,27,oD);r(5,26,18,27,oD);
 r(9,20,14,21,oL);
 var os=p.outfitStyle;
 if(os===1){r(9,20,14,21,oD);row(20,[10,13],ac);r(11,22,12,25,oD);s(10,22,ac);s(13,22,ac)}
 if(os===2){r(11,20,12,27,ac);row(23,[10,13],oD);}
 if(os===3){r(5,24,18,27,oc);r(5,27,18,27,ac);r(6,26,17,26,oL)}
 if(os===4){r(10,20,13,21,ac);s(11,22,ac);s(12,22,ac)}
 if(os===5){r(5,20,18,22,"#aab6d4");r(5,20,18,20,"#d4def2");r(10,23,13,25,ac)}
 if(os===6){r(8,23,15,27,ac);r(8,23,15,23,sh(ac,1.3));row(21,[8,15],ac);row(22,[8,15],ac)}
 if(os===7){r(10,20,13,21,"#ffffff");s(11,22,ac);s(12,22,ac);r(11,23,12,27,ac)}
 if(os===8){r(6,21,17,27,"#f4f8ff");r(6,26,17,27,"#cfd8ea");s(9,22,oc);s(14,22,oc)}
 if(os===9){for(var yy=22;yy<=26;yy+=2)r(5,yy,18,yy,ac)}
 /* hands */
 r(3,22,4,25,ex.gloves?"#ffffff":sk);r(19,22,20,25,ex.gloves?"#ffffff":sk);row(25,[3,4,19,20],ex.gloves?"#d4def2":skD);
 r(4,21,5,21,oc);r(18,21,19,21,oc);
 /* neck */
 r(10,18,13,20,skD);
 /* head */
 ell(12,11.5,9,7.7,sk);
 for(var qy=15;qy<=19;qy++)for(var qx=3;qx<=21;qx++)if(g[qy][qx]===sk&&(!g[qy+1]||g[qy+1][qx]!==sk))g[qy][qx]=skD;
 /* shadow underside */
 
 /* ears */
 r(2,11,3,14,sk);r(20,11,21,14,sk);r(2,13,2,14,skD);r(21,13,21,14,skD);
 /* front hair */
 var top=function(c1,c2){ /* hair cap over upper head */
  ell(12,10,10,8,c1,function(x,y){return y<=9||(y<=11&&(x<5||x>18))});
  r(4,10,5,13,c1);r(18,10,19,13,c1);
  ell(11,7.5,6.2,3.6,c2,function(x,y){return y<=8});
  row(5,[8,9,10],hL);s(7,6,hL);
 };
 if(st!=="bald"){
  if(st==="spiky"||st==="messy"){top(hc,hc);[[5,5],[8,2],[11,1],[14,2],[17,4],[19,7],[6,3],[9,3],[12,3],[15,3]].forEach(function(q){s(q[0],q[1],hc);s(q[0],q[1]+1,hc)});row(10,[6,8,11,13,15,17],hc);row(9,[8,11,15],hc)}
  else if(st==="mohawk"){top(hc,hc);r(10,0,13,6,hc);r(11,0,12,2,hL);r(5,5,7,9,sk);r(16,5,18,9,sk)}
  else if(st==="buzz"||st==="undercut"){ell(12,9.5,9,6.6,hD,function(x,y){return y<=8});row(8,[6,7,8,9,10,11,12,13,14,15,16,17],hc);row(7,[8,9,10,13,14,15],hL)}
  else if(st==="sidepart"){top(hc,hc);r(11,7,12,10,hD);r(6,10,10,10,hc);row(10,[7,8],hc);row(10,[15,16,17],hc)}
  else{top(hc,hc);
   /* fringe pieces */
   row(10,[6,7,8,9,11,12,14,15,16,17],hc);
   if(st==="long"||st==="wavy"||st==="bob"||st==="mullet"||st==="braids"){r(4,10,5,16,hc);r(18,10,19,16,hc)}
   if(st==="curly"||st==="afro"){[[4,8],[7,3],[12,1],[17,3],[20,8]].forEach(function(q){ell(q[0],q[1],3,2.6,hc)})}
  }
  /* dark parting line under fringe */
  for(var xi=6;xi<=17;xi++){if(g[10][xi]===hc&&g[11][xi]!==hc&&g[11][xi])g[10][xi]=hD}
 }
 /* blush */
 var bc=ex.blush?"#ff6f95":"#ff9db8";row(14,[6,7,16,17],bc);if(ex.blush)row(15,[7,16],bc);
 /* eyes: pixel big shiny */
 function eye(x0,i){var e=P.EYES[p.eyes]||"dot";
  if(e==="happy"||(e==="wink"&&i===1)){row(12,[x0+1,x0+2],INK);row(13,[x0,x0+3],INK);return}
  if(e==="sleepy"){row(13,[x0,x0+1,x0+2,x0+3],INK);row(14,[x0+1,x0+2],sk);return}
  if(e==="cross"){row(11,[x0,x0+3],INK);row(12,[x0+1,x0+2],INK);row(13,[x0,x0+3],INK);return}
  var tall=e==="round"||e==="wide";
  r(x0,11,x0+2,11,INK);r(x0,12,x0+2,14,sh(ec,.85));row(14,[x0,x0+1,x0+2],sh(ec,1.5));s(i?x0+3:x0-1,11,INK);s(x0+1,12,INK);s(x0+1,13,INK);

  if(tall){row(10,[x0+1,x0+2],INK)}
  s(x0,12,"#ffffff");s(x0+2,13,"#ffffff");
  s(x0,12,"#ffffff");s(x0+2,13,"#ffffff");                       /* highlight */

  if(e==="heart"){s(x0+1,13,"#ff3d6e");s(x0+2,13,"#ff3d6e");s(x0+1,12,"#ff7a9c");s(x0+2,12,"#ff7a9c");s(x0+1,14,"#ff3d6e");s(x0+2,14,"#ff3d6e")}
  if(e==="slit"){r(x0+1,12,x0+2,14,ec);s(x0+1,13,INK);s(x0+2,13,INK);s(x0+1,12,"#ffffff")}
  if(e==="sparkle"){s(x0+2,12,"#ffffff");s(x0+1,14,"#ffe9a8")}
  if(e==="dot"){r(x0,11,x0+3,14,sk);r(x0+1,12,x0+2,14,INK);s(x0+1,12,"#ffffff")}}
 eye(7,0);eye(14,1);
 /* mouth */
 var m=P.MOUTHS[p.mouth]||"smile",mc="#b0453a";
 if(m==="smile"){row(16,[11,12],INK);row(15,[10,13],INK)}
 else if(m==="grin"){r(10,15,13,15,INK);r(11,16,12,16,"#ffffff");row(17,[11,12],INK)}
 else if(m==="open"){r(11,15,12,16,INK);row(16,[11,12],"#e2506e")}
 else if(m==="neutral"){row(16,[10,11,12,13],INK)}
 else if(m==="smirk"){row(16,[10,11,12],INK);s(13,15,INK)}
 else if(m==="tongue"){row(15,[10,11,12,13],INK);row(16,[11,12],"#ff7a9c")}
 else if(m==="oh"){r(11,15,12,16,INK)}
 else if(m==="kitty"){row(15,[10,12,13],INK);row(16,[11,12],INK);s(11,15,INK)}
 else if(m==="frown"){row(15,[11,12],INK);row(16,[10,13],INK)}
 else if(m==="braces"){r(10,15,13,16,"#ffffff");row(15,[10,13],INK);row(16,[10,11,12,13],INK);row(15,[11,12],"#9aa7c7")}
 if(ex.freckles){row(13,[7,9,15,17].map(function(q){return q}),null);[[6,13],[8,14],[15,14],[17,13]].forEach(function(q){s(q[0],q[1],sh(sk,.7))})}
 if(ex.scar){row(8,[17],"#b0453a");row(9,[16],"#b0453a");row(10,[15],"#b0453a")}
 if(ex.moustache){row(15,[8,9,10,13,14,15],hD)}
 if(ex.beard){r(6,16,17,18,hc);r(9,15,14,15,sk);r(10,16,13,16,sk);row(16,[10,13],hc);r(10,17,13,17,hD)}
 if(ex.brows){row(9,[7,8,9,14,15,16],hD)}
 /* accessories */
 var a=acc;
 if(a==="cap"){r(5,4,18,8,"#e23b5a");r(6,3,17,3,"#e23b5a");r(5,9,20,9,sh("#e23b5a",.7));r(8,5,10,5,sh("#e23b5a",1.4))}
 if(a==="beanie"){r(5,4,18,8,"#4aa3ff");r(6,3,17,3,"#4aa3ff");r(5,9,18,9,"#2d7fd6");ell(12,2,1.6,1.6,"#ffffff");row(5,[8,9],sh("#4aa3ff",1.4))}
 if(a==="crown"){r(6,3,17,5,"#ffd23f");row(2,[6,9,12,15,17],"#ffd23f");row(1,[12],"#ffd23f");row(4,[8,12,16],"#ff3355");row(3,[7,10,13,16],"#fff2a8")}
 if(a==="wizardHat"){r(3,7,20,8,"#5a3aa8");r(7,4,16,6,"#7a52d6");r(9,2,14,3,"#7a52d6");r(11,0,13,1,"#7a52d6");s(12,5,"#ffd23f");r(7,6,16,6,"#5a3aa8")}
 if(a==="halo"){row(0,[8,9,10,11,12,13,14,15],"#ffd23f");row(1,[7,16],"#ffd23f");row(2,[8,9,10,11,12,13,14,15],"#ffd23f")}
 if(a==="horns"){r(5,2,6,6,"#ff4466");s(5,1,"#ff4466");r(17,2,18,6,"#ff4466");s(18,1,"#ff4466")}
 if(a==="catEars"){r(5,3,8,6,hc);r(6,3,7,4,"#ffb3cf");s(5,2,hc);r(15,3,18,6,hc);r(16,3,17,4,"#ffb3cf");s(18,2,hc)}
 if(a==="bow"){r(16,4,17,7,"#ff5d8f");r(19,4,20,7,"#ff5d8f");r(18,5,18,6,"#ff2e88");s(16,4,sh("#ff5d8f",1.4))}
 if(a==="headband"){r(5,7,18,8,ac);row(7,[8,9],sh(ac,1.4))}
 if(a==="goggles"){r(5,7,18,7,"#444");r(6,5,10,8,"#8fe6ff");r(13,5,17,8,"#8fe6ff");row(5,[6,10,13,17],"#444");row(8,[6,10,13,17],"#444");s(7,6,"#ffffff");s(14,6,"#ffffff")}
 if(a==="headphones"){r(4,4,5,13,"#333");r(18,4,19,13,"#333");r(5,3,18,3,"#333");r(2,10,4,14,ac);r(19,10,21,14,ac);r(2,10,2,14,"#333");r(21,10,21,14,"#333")}
 if(a==="glasses"){r(6,10,10,15,"#2a2a2a");r(13,10,17,15,"#2a2a2a");r(7,11,9,14,null);r(14,11,17,14,null);row(12,[11,12],"#2a2a2a");eye(7,0);eye(14,1);s(7,11,"#d8f4ff");s(14,11,"#d8f4ff")}
 if(a==="sunglasses"){r(6,11,10,14,"#14102c");r(13,11,17,14,"#14102c");row(12,[11,12],"#14102c");row(12,[7,8,14,15],"#4a3a7a")}
 if(a==="eyepatch"){r(6,10,10,15,"#222");row(8,[7,8,9,10,11,12,13,14,15,16,17],"#222")}
 if(a==="mask"){r(5,14,18,19,"#f5f5f5");r(5,19,18,19,"#cfd8ea")}
 if(a==="earrings"){s(3,14,"#ffd23f");s(20,14,"#ffd23f")}
 return g}
function drawPixel(canvas,p,scale,opts){opts=opts||{};scale=scale||6;var g=grid(p),V=opts.view||[0,0,GW,GH],ol=opts.outline===false?0:1;
 var W=(V[2]+2*ol)*scale,H=(V[3]+2*ol)*scale,c=canvas.getContext("2d");canvas.width=W;canvas.height=H;c.clearRect(0,0,W,H);
 function at(x,y){return (x>=0&&x<GW&&y>=0&&y<GH)?g[y][x]:null}
 var oc=opts.outlineColor||INK;
 for(var y=V[1]-ol;y<V[1]+V[3]+ol;y++)for(var x=V[0]-ol;x<V[0]+V[2]+ol;x++){var v=at(x,y);
  if(v){c.fillStyle=v}else if(ol&&(at(x-1,y)||at(x+1,y)||at(x,y-1)||at(x,y+1))){c.fillStyle=oc}else continue;
  c.fillRect((x-V[0]+ol)*scale,(y-V[1]+ol)*scale,scale,scale)}
 return canvas}
P.drawPixel=drawPixel;P.shade=P.shade||sh;P.GRID=[GW,GH];
})(typeof window!=="undefined"?window:this);
