const C='quiz-v7';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','app.js','manifest.json','icon.svg','icon-192.png','icon-512.png','data/science.js','data/social.js','data/math.js','data/arabic.js','data/english.js','data/french.js','data/islamic.js'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||r.url.includes('firestore.googleapis.com'))return;
e.respondWith(fetch(r).then(res=>{if(res.ok||res.type==='opaque'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r)))});
