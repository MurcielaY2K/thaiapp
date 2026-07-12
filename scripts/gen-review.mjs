// Generate a self-contained review page (public/review.html) so a native Thai
// speaker can check every word's romanization, translation, and AUDIO in a
// browser, flag problems, and export corrections back. Served from the site
// itself so audio (same origin) plays freely. Run: node scripts/gen-review.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const R = (p) => readFileSync(join(root, p), 'utf8');

const worlds = R('data/worlds.ts');
const lessonIds = new Set([...worlds.matchAll(/'([a-z]+\d+)'/g)].map((m) => m[1]));

const manifest = JSON.parse(R('public/audio/manifest.json'));

// Vocabulary words
const vocab = R('data/vocabulary.ts');
const vre = /\{\s*id:\s*'([^']+)',\s*th:\s*'([^']+)',\s*rom:\s*'([^']+)',\s*en:\s*'([^']+)',\s*category:\s*'([^']+)'/g;
const rows = [];
for (const m of vocab.matchAll(vre)) {
  rows.push({ id: m[1], th: m[2], rom: m[3], en: m[4], cat: m[5],
    lesson: lessonIds.has(m[1]), audio: manifest[m[2]] || null, kind: 'word' });
}
// Alphabet (audio keyed by thName)
const alpha = R('data/alphabet.ts');
const are = /\{\s*id:\s*'([^']+)',\s*char:\s*'([^']+)',\s*name:\s*'([^']+)',\s*thName:\s*'([^']+)',\s*meaning:\s*'([^']+)',\s*sound:\s*'([^']+)',\s*type:\s*'([^']+)'/g;
for (const m of alpha.matchAll(are)) {
  rows.push({ id: m[1], th: m[2], rom: m[3], en: `${m[3]} — “${m[5]}” (${m[6]})`, cat: m[7],
    lesson: true, audio: manifest[m[4]] || null, kind: 'letter', ttsKey: m[4] });
}
// Lesson words first, then by category
rows.sort((a, b) => Number(b.lesson) - Number(a.lesson) || a.cat.localeCompare(b.cat));

const cats = [...new Set(rows.map((r) => r.cat))].sort();
const data = JSON.stringify(rows);
const catOpts = cats.map((c) => `<option value="${c}">${c}</option>`).join('');

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sanuk Thai — Content Review</title>
<style>
 :root{--paper:#f0eee7;--ink:#17150f;--dim:#6e6a5d;--ember:#ff5c1e;--line:#d9d5c9;--ok:#0f9d51;--bad:#d81e34;--card:#fbfaf7}
 *{box-sizing:border-box} body{margin:0;background:var(--paper);color:var(--ink);font-family:-apple-system,system-ui,'Sarabun',sans-serif;padding:0 0 120px}
 header{position:sticky;top:0;background:var(--paper);border-bottom:2px solid var(--ink);padding:12px 16px;z-index:5}
 h1{font-size:18px;margin:0 0 8px} .sub{color:var(--dim);font-size:12px;margin:0 0 10px}
 .controls{display:flex;gap:8px;flex-wrap:wrap} input,select{font-size:14px;padding:8px 10px;border:2px solid var(--ink);border-radius:8px;background:var(--card);color:var(--ink)}
 input[type=search]{flex:1;min-width:140px}
 .stats{font-size:12px;color:var(--dim);margin-top:8px}
 .list{padding:8px 12px;max-width:760px;margin:0 auto}
 .row{display:flex;align-items:center;gap:12px;background:var(--card);border:2px solid var(--line);border-radius:12px;padding:10px 12px;margin:8px 0}
 .row.wrong{border-color:var(--bad);background:#fff1f2} .row.ok{border-color:var(--ok)}
 .th{font-size:30px;min-width:78px;line-height:1.15} .meta{flex:1;min-width:0}
 .rom{font-size:15px;font-weight:700} .en{font-size:13px;color:var(--dim)} .cat{font-size:10px;color:var(--dim);text-transform:uppercase;letter-spacing:.5px}
 .badge{display:inline-block;font-size:9px;background:var(--ember);color:#17150f;border-radius:6px;padding:1px 5px;margin-left:6px;font-weight:700;vertical-align:middle}
 .play{font-size:22px;width:46px;height:46px;border-radius:50%;border:2px solid var(--ink);background:var(--card);cursor:pointer;flex-shrink:0}
 .play:active{background:var(--ember)} .play.noaudio{opacity:.3}
 .mark{border:2px solid var(--ink);background:var(--card);border-radius:8px;padding:8px 10px;font-size:13px;cursor:pointer;flex-shrink:0}
 .mark.on{background:var(--bad);color:#fff;border-color:var(--bad)}
 .note{width:100%;margin-top:8px;font-size:13px;padding:6px 8px;border:1.5px solid var(--line);border-radius:8px;display:none}
 .row.wrong .note{display:block}
 footer{position:fixed;bottom:0;left:0;right:0;background:var(--ink);color:#fff;padding:10px 14px;display:flex;gap:10px;align-items:center;justify-content:space-between}
 footer button{background:var(--ember);color:#17150f;border:none;border-radius:8px;padding:10px 14px;font-weight:700;font-size:13px;cursor:pointer}
 .flagged{font-size:12px}
 dialog{border:2px solid var(--ink);border-radius:12px;max-width:560px;width:92%;padding:16px}
 textarea{width:100%;height:200px;font-family:monospace;font-size:12px;border:1.5px solid var(--line);border-radius:8px;padding:8px}
</style></head><body>
<header>
 <h1>🐘 Sanuk Thai — Content Review</h1>
 <p class="sub">Tap ▶️ to hear the audio. If a word's <b>romanization, translation, or pronunciation</b> is wrong, tap <b>Flag</b> and type the correction. Lesson words are shown first. Your flags are saved on this device automatically — finish anytime, then tap <b>Export</b> and send the result back.</p>
 <div class="controls">
  <input type="search" id="q" placeholder="Search Thai / romanization / English…">
  <select id="filter">
   <option value="all">All words</option>
   <option value="lesson">Lesson words only</option>
   <option value="flagged">Flagged only</option>
  </select>
  <select id="cat"><option value="">All categories</option>${catOpts}</select>
 </div>
 <div class="stats" id="stats"></div>
</header>
<div class="list" id="list"></div>
<footer>
 <span class="flagged" id="flaggedCount">0 flagged</span>
 <span>
  <button id="exportBtn">Export corrections</button>
 </span>
</footer>
<dialog id="dlg">
 <h3 style="margin:0 0 8px">Corrections to send back</h3>
 <p style="font-size:12px;color:#6e6a5d;margin:0 0 8px">Copy everything below and send it to the developer (paste into chat or email).</p>
 <textarea id="exportText" readonly></textarea>
 <div style="margin-top:10px;display:flex;gap:8px;justify-content:flex-end">
  <button onclick="navigator.clipboard.writeText(document.getElementById('exportText').value)" style="background:#ff5c1e;color:#17150f;border:none;border-radius:8px;padding:10px 14px;font-weight:700">Copy</button>
  <button onclick="document.getElementById('dlg').close()" style="background:#e7e4db;border:none;border-radius:8px;padding:10px 14px">Close</button>
 </div>
</dialog>
<script>
const DATA = ${data};
const AUDIO_BASE = location.pathname.replace(/\\/review\\.html?$/, '') + '/audio/';
const KEY='sanuk_review_v1';
let marks = {}; try{ marks = JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){}
let audio = null;
function play(file){ if(!file)return; try{ if(audio)audio.pause(); audio=new Audio(AUDIO_BASE+file); audio.play(); }catch(e){} }
function save(){ localStorage.setItem(KEY, JSON.stringify(marks)); updateCount(); }
function updateCount(){ const n=Object.keys(marks).filter(k=>marks[k]&&marks[k].wrong).length; document.getElementById('flaggedCount').textContent=n+' flagged'; }
function esc(s){ return String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

function render(){
 const q=document.getElementById('q').value.trim().toLowerCase();
 const f=document.getElementById('filter').value;
 const cat=document.getElementById('cat').value;
 const list=document.getElementById('list'); list.innerHTML='';
 let shown=0;
 for(const r of DATA){
  if(cat && r.cat!==cat) continue;
  if(f==='lesson' && !r.lesson) continue;
  if(f==='flagged' && !(marks[r.id]&&marks[r.id].wrong)) continue;
  if(q && !(r.th.toLowerCase().includes(q)||r.rom.toLowerCase().includes(q)||r.en.toLowerCase().includes(q))) continue;
  shown++;
  const m=marks[r.id]||{};
  const div=document.createElement('div');
  div.className='row'+(m.wrong?' wrong':'');
  div.innerHTML=
   '<button class="play'+(r.audio?'':' noaudio')+'" title="Play">▶️</button>'+
   '<div class="th">'+esc(r.th)+'</div>'+
   '<div class="meta"><div class="rom">'+esc(r.rom)+(r.lesson?'<span class="badge">LESSON</span>':'')+'</div>'+
   '<div class="en">'+esc(r.en)+'</div><div class="cat">'+esc(r.cat)+(r.audio?'':' · ⚠️ no audio')+'</div>'+
   '<input class="note" placeholder="What is wrong / correct version?" value="'+esc(m.note||'')+'"></div>'+
   '<button class="mark'+(m.wrong?' on':'')+'">'+(m.wrong?'Flagged':'Flag')+'</button>';
  div.querySelector('.play').onclick=()=>play(r.audio);
  div.querySelector('.mark').onclick=()=>{ marks[r.id]=marks[r.id]||{}; marks[r.id].wrong=!marks[r.id].wrong; save(); render(); };
  const note=div.querySelector('.note');
  note.oninput=()=>{ marks[r.id]=marks[r.id]||{}; marks[r.id].note=note.value; save(); };
  list.appendChild(div);
 }
 document.getElementById('stats').textContent=shown+' shown · '+DATA.length+' total · '+DATA.filter(r=>r.lesson).length+' lesson words';
}
document.getElementById('q').oninput=render;
document.getElementById('filter').onchange=render;
document.getElementById('cat').onchange=render;
document.getElementById('exportBtn').onclick=()=>{
 const out=['id\\tthai\\tcurrent_romanization\\tcurrent_english\\tcategory\\tcorrection'];
 for(const r of DATA){ const m=marks[r.id]; if(m&&m.wrong){ out.push([r.id,r.th,r.rom,r.en,r.cat,(m.note||'').replace(/\\t/g,' ')].join('\\t')); } }
 document.getElementById('exportText').value = out.length>1 ? out.join('\\n') : 'No words flagged yet.';
 document.getElementById('dlg').showModal();
};
updateCount(); render();
</script></body></html>`;

writeFileSync(join(root, 'public/review.html'), html);
console.log(`Wrote public/review.html — ${rows.length} entries (${rows.filter((r) => r.lesson).length} lesson), ${rows.filter((r) => !r.audio).length} without audio.`);
