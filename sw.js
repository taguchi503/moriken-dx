const CACHE='moriken-dx-portal-v0.7.0';
const CACHE_PREFIX='moriken-dx-portal-';
const STATIC=['./manifest.webmanifest','./assets/logo.png','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',event=>{self.skipWaiting();event.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)));});
self.addEventListener('activate',event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(CACHE_PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin) return;
  const metadata=url.pathname.endsWith('/portal-feed.json')||url.pathname.endsWith('/app-info.json')||url.pathname.endsWith('/version.json');
  if(metadata){event.respondWith(fetch(event.request,{cache:'no-store'}));return;}
  const dynamic=event.request.mode==='navigate'||url.pathname.endsWith('/index.html');
  if(dynamic){event.respondWith((async()=>{try{const fresh=await fetch(event.request,{cache:'no-store'});const c=await caches.open(CACHE);if(fresh.ok)c.put(event.request,fresh.clone());return fresh}catch(e){return (await caches.match(event.request))||(event.request.mode==='navigate'?(await caches.match('./index.html')):Response.error())}})());return;}
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return res;})));
});
