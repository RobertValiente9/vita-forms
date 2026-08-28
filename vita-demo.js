/* ---------- dominio: vita.lat y getvita.ai sirven la misma página ---------- */
(function(){
  var h=location.hostname||'';
  var apex=h.endsWith('getvita.ai')?'getvita.ai':'vita.lat';
  if(apex==='vita.lat')return;
  document.querySelectorAll('a[href*="app.vita.lat"]').forEach(function(a){
    a.href=a.getAttribute('href').replace('app.vita.lat','app.'+apex);
  });
})();

/* ---------- nav scroll ---------- */
(function(){
  const nav=document.getElementById('nav');
  if(!nav)return;
  const onScroll=()=>nav.classList.toggle('scrolled',window.scrollY>20);
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
})();

/* ---------- mobile menu ---------- */
(function(){
  const btn=document.getElementById('menuBtn');
  if(!btn)return;
  const close=()=>{document.body.classList.remove('menu-open');btn.setAttribute('aria-expanded','false');};
  btn.addEventListener('click',()=>{
    const open=document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded',open?'true':'false');
  });
  document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();});
})();

/* ---------- remember the chosen language ---------- */
(function(){
  document.querySelectorAll('.lang a[hreflang]').forEach(a=>{
    a.addEventListener('click',()=>{try{localStorage.setItem('vita-lang',a.getAttribute('hreflang'));}catch(e){}});
  });
})();

/* ---------- count up ---------- */
function countUp(el){
  if(el.dataset.done)return;el.dataset.done='1';
  const to=parseFloat(el.dataset.countTo);const suf=el.dataset.suffix||'';
  const dur=1300;const t0=performance.now();
  function tick(t){
    const p=Math.min(1,(t-t0)/dur);const e=1-Math.pow(1-p,3);
    el.textContent=Math.round(to*e)+suf;
    if(p<1)requestAnimationFrame(tick);else el.textContent=to+suf;
  }
  requestAnimationFrame(tick);
}

/* ---------- reveal + cycle draw + counters ---------- */
(function(){
  const items=[...document.querySelectorAll('.reveal')];
  const rail=document.getElementById('cycleRail');
  const counters=[...document.querySelectorAll('.countup')];
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(el){
    if(el.classList.contains('in'))return;
    const sibs=[...el.parentElement.querySelectorAll(':scope > .reveal')];
    const idx=Math.max(0,sibs.indexOf(el));
    el.style.transitionDelay=(idx*55)+'ms';
    el.classList.add('in');
  }
  if(reduce){
    items.forEach(el=>el.classList.add('in'));
    if(rail)rail.classList.add('drawn');
    counters.forEach(el=>{el.textContent=el.dataset.countTo+(el.dataset.suffix||'');});
    document.body.classList.add('reveal-done');
    return;
  }
  function check(){
    const vh=window.innerHeight||document.documentElement.clientHeight;
    items.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<vh*0.9&&r.bottom>0)show(el);});
    if(rail){const r=rail.getBoundingClientRect();if(r.top<vh*0.82&&r.bottom>0)rail.classList.add('drawn');}
    counters.forEach(el=>{const r=el.getBoundingClientRect();if(r.top<vh*0.92&&r.bottom>0)countUp(el);});
  }
  check();
  window.addEventListener('scroll',check,{passive:true});
  window.addEventListener('resize',check);
  window.addEventListener('load',check);
  setTimeout(()=>{items.forEach(show);if(rail)rail.classList.add('drawn');counters.forEach(countUp);document.body.classList.add('reveal-done');},2400);
})();

/* ---------- FAQ accordion ---------- */
(function(){
  const items=[...document.querySelectorAll('.faq-item')];
  function set(it,open){
    it.classList.toggle('open',open);
    const q=it.querySelector('.faq-q');
    if(q)q.setAttribute('aria-expanded',open?'true':'false');
  }
  items.forEach(it=>{
    const q=it.querySelector('.faq-q');
    if(!q)return;
    q.addEventListener('click',()=>{
      const open=it.classList.contains('open');
      items.forEach(o=>set(o,false));
      if(!open)set(it,true);
    });
  });
  if(items[0])set(items[0],true);
})();

