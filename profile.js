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
