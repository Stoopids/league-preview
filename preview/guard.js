/* PREVIEW guard (league-preview-s28i, after preview-kit/preview-guard.js). Injected first in <head>, before any app script.
   - Store: textdb GETs are answered locally from preview/league-kv.json (a bundled MOCK league); nothing is ever sent to textdb.
   - Network: only GET/HEAD leave the page, same-origin only (ESPN refresh off: bundled static scores). POST/PUT/PATCH/DELETE are blocked here and logged (console.warn).
   - View-only: ?view=1 (the app's own League view mode) is forced, except the bet-form deep links (?pvme=1), which show the form as manager Ana with every write blocked.
   - Service worker off; red banner "PREVIEW s28i · view-only" on every page. */
(function(){
 var C={label:'s28i',main:'7MMR2DG4T78XTJG3',me:'1510edfe18d7',seen:'1793590128025'};
 var BASE=new URL('./',document.currentScript&&document.currentScript.src?new URL('..',document.currentScript.src):location.href).href;
 window.__previewBlocked=[];
 function note(m,x,why){window.__previewBlocked.push(m+' '+x+' ('+why+')');console.warn('[PREVIEW view-only] blocked',m,String(x),why);toast()}
 function toast(){try{var t=document.getElementById('pv-toast');if(!t){t=document.createElement('div');t.id='pv-toast';t.style.cssText='position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;background:#c62828;color:#fff;font:600 13px system-ui,sans-serif;padding:8px 12px;border-radius:10px';document.body.appendChild(t)}t.textContent='Preview only, nothing was saved';clearTimeout(t.__h);t.style.display='block';t.__h=setTimeout(function(){t.style.display='none'},2500)}catch(e){}}
 /* identity / view mode (league page) */
 var Q=new URLSearchParams(location.search),PVME=Q.get('pvme')==='1',GO=Q.get('pvgo')||'';
 try{['k','key','admin','token','secret','as','cm'].forEach(function(n){Q.delete(n)});Q.delete('pvme');Q.delete('pvgo');
  if(!PVME&&Q.get('view')!=='1')Q.set('view','1');if(PVME)Q.delete('view');
  var qs=Q.toString();history.replaceState(null,'',location.pathname+(qs?'?'+qs:'')+location.hash)}catch(e){}
 try{if(PVME){sessionStorage.removeItem('fbn.view');var l=(Q.get('l')||'');if(l)[l,l.toUpperCase(),l.toLowerCase()].forEach(function(x){localStorage.setItem('fbn.me.'+x,JSON.stringify({mid:C.me,k:'preview-only'}))})}else sessionStorage.setItem('fbn.view','1');
  if(!sessionStorage.getItem('pv.badge')){sessionStorage.setItem('pv.badge','1');localStorage.setItem('fbn.betsSeen.'+C.main,C.seen);localStorage.setItem('fbn.betsSeen.'+C.main.toLowerCase(),C.seen)}}catch(e){}
 /* bet-form deep links: the preview manager (Ana, mock league) is accepted without a real manager link; every write is still blocked below */
 if(PVME){var FB;try{Object.defineProperty(window,'FBN',{configurable:true,get:function(){return FB},set:function(v){FB=v;try{var ck=v.checkMgrSecret;v.checkMgrSecret=function(c,k){if(c&&c.mid===C.me&&k==='preview-only')return Promise.resolve(true);return ck.apply(this,arguments)}}catch(e){}}})}catch(e){}}
 /* service worker off */
 try{if(navigator.serviceWorker){navigator.serviceWorker.register=function(){console.info('[PREVIEW] service worker disabled');return Promise.resolve(null)}}}catch(e){}
 /* network */
 var KV=null,KVP=null,F0=window.fetch.bind(window);
 function kv(){return KVP||(KVP=F0(BASE+'preview/league-kv.json',{cache:'no-cache'}).then(function(r){return r.json()}).then(function(j){KV=j;return j}))}
 var ESPN=/^https:\/\/site\.api\.espn\.com\//,EL=null;
 function espnName(U){return (U.pathname.replace(/^\/apis\/site\/v2\/sports\/basketball\/mens-college-basketball\//,'')+U.search).replace(/[^A-Za-z0-9]+/g,'_')+'.json'}
 function espn(){return EL||(EL=F0(BASE+'preview/espn/index.json',{cache:'no-cache'}).then(function(r){return r.json()}))}
 window.__pvEspnName=espnName;
 function abs(x){try{return new URL(String(x&&x.url||x),location.href)}catch(e){return null}}
 var TDB=/^https?:\/\/(?:[a-z0-9-]+\.)?textdb\.dev\/api\/data\/([^?#]*)/i;
 window.fetch=function(i,o){var m=String((o&&o.method)||(i&&typeof i==='object'&&i.method)||'GET').toUpperCase(),U=abs(i);
  if(!U){note(m,i,'bad url');return Promise.reject(new TypeError('PREVIEW: bad url'))}
  if(m!=='GET'&&m!=='HEAD'){note(m,U.href,'non-GET');return Promise.reject(new TypeError('PREVIEW view-only: '+m+' blocked'))}
  var t=TDB.exec(U.href);if(t){var key=decodeURIComponent(t[1]);return kv().then(function(j){return new Response(j[key]||'',{status:200,headers:{'Content-Type':'text/plain'}})})}
  if(ESPN.test(U.href)){var fn=espnName(U);return espn().then(function(L){if(L.indexOf(fn)<0){note(m,U.href,'not in static snapshot');return Promise.reject(new TypeError('PREVIEW: no static copy'))}return F0(BASE+'preview/espn/'+fn,{cache:'no-cache'})})}
  if(U.origin!==location.origin){note(m,U.href,'cross-origin (static preview)');return Promise.reject(new TypeError('PREVIEW: cross-origin off'))}
  return F0(i,o)};
 var X=XMLHttpRequest.prototype,xo=X.open,xs=X.send;
 X.open=function(m,u){var U=abs(u);this.__pe=(String(m).toUpperCase()!=='GET'&&String(m).toUpperCase()!=='HEAD')?'non-GET':(U&&U.origin!==location.origin)?'cross-origin':null;this.__pm=m;this.__pu=u;var a=[].slice.call(arguments);if(this.__pe){a[0]='GET';a[1]='data:,'}return xo.apply(this,a)};
 X.send=function(){if(this.__pe){note(this.__pm,this.__pu,this.__pe);var x=this;setTimeout(function(){try{x.dispatchEvent(new Event('error'))}catch(e){}},0);return}return xs.apply(this,arguments)};
 try{navigator.sendBeacon=function(u){note('BEACON',u,'beacon');return false}}catch(e){}
 /* deep-link helpers (UI only, never a write) */
 function when(sel,fn,ms){var t0=Date.now();(function tick(){var e=document.querySelector(sel);if(e)return fn(e);if(Date.now()-t0<(ms||20000))setTimeout(tick,150)})()}
 function sc(e){try{var y=e.getBoundingClientRect().top+window.scrollY-60;window.scrollTo(0,Math.max(0,y))}catch(x){}}
 function go(){window.__pvGo='pending';var done=function(){window.__pvGo='done'};
  when('#lapp[data-ready]',function(){setTimeout(function(){
   if(GO==='upcoming'){when('[data-a=gmode][data-v=upcoming]',function(b){b.click();setTimeout(done,600)})}
   else if(GO==='form'){when('#b27Form',function(f){sc(f);done()})}
   else if(GO==='autonote'){when('#b27Text',function(i){var o=document.querySelector('#b27Form [data-lb=opp]');if(o)o.click();setTimeout(function(){var t=document.getElementById('b27Text');t.focus();t.value='Kansas -4 beats Fordham';t.dispatchEvent(new Event('input',{bubbles:true}));setTimeout(function(){var a=document.querySelector('#b27Form [data-lb=amt][data-v="10"]');if(a)a.click();setTimeout(function(){var t2=document.getElementById('b27Text');t2.dispatchEvent(new Event('input',{bubbles:true}));when('#b27Form [data-s29-auto]',function(n){sc(document.getElementById('b27Sum')||n);done()},8000);setTimeout(done,8500)},1200)},500)},300)})}
   else if(GO==='kansas'){when('#b27Text',function(i){var c=[].slice.call(document.querySelectorAll('.b27-read')).find(function(x){return /by more than 4/.test(x.textContent)});sc(i);done()})}
   else if(GO==='bottom'){window.scrollTo(0,document.body.scrollHeight);done()}
   else if(GO==='share'){when('#lapp [data-a]',function(){var c=[].slice.call(document.querySelectorAll('button')).find(function(b){return /^\s*Copy/.test(b.textContent)});if(c)sc(c);done()})}
   else if(GO&&GO.charAt(0)==='#'){when(GO,function(e){sc(e);done()})}
   else done()},400)},25000)}
 document.addEventListener('DOMContentLoaded',function(){var st=document.createElement('style');st.textContent='#chatbar,#chatpanel,.chat-t,[aria-controls=chatpanel]{display:none!important}';document.head.appendChild(st);var cb=document.getElementById('chatbar');if(GO)go();else window.__pvGo='done'});
 document.addEventListener('DOMContentLoaded',function(){var b=document.createElement('div');b.id='preview-banner';b.textContent='PREVIEW '+C.label+' \u00b7 view-only';b.style.cssText='position:fixed;left:50%;top:4px;transform:translateX(-50%);z-index:2147483647;background:#c62828;color:#fff;font:600 11px/1 system-ui,sans-serif;padding:5px 9px;border-radius:10px;opacity:.92;pointer-events:none;letter-spacing:.3px';document.body.appendChild(b)});
})();
