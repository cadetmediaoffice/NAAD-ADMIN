// NAAD STUDENT app only. Registered with scope "student_" so it never touches the admin or agency pages.
var C='naad-student-v1';
var A=['student_login.html','login_art.jpg','naad-student-192.png','naad-student-512.png','naad-student.webmanifest','logo_naad.png','boot_logo.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(C).then(function(c){return Promise.all(A.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x.indexOf('naad-student-')===0&&x!==C}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}));
});
self.addEventListener('fetch',function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin) return;   // never touch the Apps Script server calls
  if(r.mode==='navigate'){
    e.respondWith(fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)});return res}).catch(function(){return caches.match(r).then(function(m){return m||caches.match('student_login.html')})}));
    return;
  }
  e.respondWith(caches.match(r).then(function(m){return m||fetch(r).then(function(res){var cp=res.clone();caches.open(C).then(function(c){c.put(r,cp)});return res})}));
});
