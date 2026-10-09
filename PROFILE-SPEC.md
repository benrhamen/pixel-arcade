# Pixel Arcade shared character, spec v1

One device-only profile shared by the hub and every game on https://benrhamen.github.io (same origin, so one localStorage). No server, no tracking, no personal data. The nickname is free text (max 12, A-Z 0-9 space - ! . _), never a real name.

Key: `pa.profile.v1`. JSON object. Only the hub writes it. Games only READ it.

```
{ v:1, name:"NEON FOX",
  // legacy indexes (always present, always the NEAREST palette entry, so index-only games work)
  skin:0-8, hairColor:0-7, outfit:0-7,
  // exact colours, "#rrggbb" lowercase (use these if your game can draw any colour)
  skinHex, hairHex, outfitHex, accentHex, eyeHex,
  hairStyle:"short|spiky|long|bun|pigtails|ponytail|mohawk|bald|curly|afro|bob|sidepart|braids|buzz|topknot|messy|wavy|undercut|mullet|twinbuns",
  eyes:0-9 (dot,wide,sleepy,happy,wink,sparkle,heart,slit,round,cross),
  mouth:0-9 (smile,grin,open,neutral,smirk,tongue,oh,kitty,frown,braces),
  outfitStyle:0-9 (tee,hoodie,jacket,dress,robe,armor,overalls,suit,labcoat,stripes),
  accessory:"none|cap|glasses|headphones|crown|sunglasses|wizardHat|beanie|bow|headband|goggles|halo|horns|bunnyEars|catEars|eyepatch|mask|earrings",
  extras:{beard,cape,gloves,magicBoots,freckles,blush,scar,moustache,brows : true}, // missing = off
  updated:epoch-ms }
```
Palettes (index -> hex), append-only:
skin `#ffdbb5 #f5c28f #e0a370 #c68650 #9a5f34 #6b3f22 #5b8cff #5fd068 #a3a7b5`
hairColor `#1b1b2a #5a3215 #a8642a #f2c94c #ff5d8f #29e7ff #9b5cff #eeeeee`
outfit `#ff2e88 #29e7ff #3dff6e #ffd23f #8a3ffc #ff7a1a #f5f5f5 #5b8cff`

Compatibility rules
- Everything is optional for a reader. Missing key, bad JSON, blocked storage -> use your game's own default. Never crash.
- Unknown values (new styles, out-of-range index) -> map to your nearest, or default. Ignore unknown fields.
- New options are only ever appended. Existing meanings never change. A breaking change would use `pa.profile.v2` and the hub would migrate.
- Games with a smaller style list use this fallback for styles 8+: curly,afro,buzz,sidepart,undercut -> short; bob,braids,wavy,mullet -> long; topknot,twinbuns -> bun; messy -> spiky.
- Games with their own palette: prefer the index fields; if you draw free colours, use the Hex fields.
- Your game's own progress/saves stay in your own keys. Do not write pa.profile.*.

What each game must do
1. Read (snippet below) on start and when the page regains focus (or on the `storage` event) and show the nickname + look in your own art style. If a game already has its own avatar/name, seed it from the profile when the player has not customised in that game, or offer a "use my arcade character" choice.
2. Add a visible button "Change name & avatar" linking to the editor (snippet below). The hub shows "Back to game" when `?back=` is a same-origin benrhamen.github.io URL.
3. Shortcut: the hub provides `https://benrhamen.github.io/pixel-arcade/profile.js` (window.PAProfile: load(), clean(), sprite(), draw(canvas, profile, scale), baseStyle()). Optional; the inline snippet is enough and keeps your game working if the hub is unreachable.

Read snippet (paste, ~12 lines)
```js
function paProfile(){try{var o=JSON.parse(localStorage.getItem("pa.profile.v1"));if(!o||typeof o!=="object")return null;
 var h=function(v,d){return /^#[0-9a-fA-F]{6}$/.test(v)?v.toLowerCase():d};
 var base={curly:"short",afro:"short",buzz:"short",sidepart:"short",undercut:"short",bob:"long",braids:"long",wavy:"long",mullet:"long",topknot:"bun",twinbuns:"bun",messy:"spiky"};
 var st=String(o.hairStyle||"short");
 return {name:String(o.name||"").replace(/[^A-Za-z0-9 \-!._]/g,"").slice(0,12),
  skin:(o.skin|0),hairColor:(o.hairColor|0),outfit:(o.outfit|0),
  skinHex:h(o.skinHex,null),hairHex:h(o.hairHex,null),outfitHex:h(o.outfitHex,null),accentHex:h(o.accentHex,null),eyeHex:h(o.eyeHex,null),
  hairStyle:st,hairBase:base[st]||st,eyes:o.eyes|0,mouth:o.mouth|0,outfitStyle:o.outfitStyle|0,
  accessory:String(o.accessory||"none"),extras:(o.extras&&typeof o.extras==="object")?o.extras:{}}}catch(e){return null}}
```
Edit button
```js
var EDIT_URL="https://benrhamen.github.io/pixel-arcade/?back="+encodeURIComponent(location.href)+"#character";
// <a class="..." href=EDIT_URL>Change name &amp; avatar</a>
```
Test: save a character in the hub, open the game, check it appears; clear the key, check the game falls back; put garbage in the key, check no crash.
