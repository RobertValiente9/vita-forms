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
    /* el cambio de idioma arrastra los UTMs: la atribución no depende solo de localStorage */
    if(location.search)a.href=a.getAttribute('href')+location.search;
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

/* ---------- demo request flow (v2: endpoint propio, pasivos, parcial) ---------- */
(function(){

/* ---------- demo request flow (v2: Apps Script + pasivos) ---------- */
(function(){
  const root=document.getElementById('agenda');
  if(!root)return;

  /* En producción: const ENDPOINT='https://script.google.com/macros/s/XXXX/exec'; */
  const qs=new URLSearchParams(location.search);
  /* Link de agenda: fijo acá, o lo entrega el endpoint (GET → {calendar_url}). Vacío → "te llega por correo". */
  let CALENDAR_URL=new URL('agendar.html',document.currentScript?document.currentScript.src.replace(/assets\/vita\.js.*/,''):location.href).href;   /* COPIA DE PRUEBA v8: la agenda es la página con el embed */
  const endpointInput=document.getElementById('endpointInput');
  endpointInput.value='https://script.google.com/macros/s/AKfycby_aMb62oBjRwlhfjfzsQW9jaFzZqeNWh2qsF7_7MdirsqO4FR53CbbbN-GiYJfNYg9/exec';
  if(qs.has('endpoint'))endpointInput.value=qs.get('endpoint');
  const getEndpoint=()=>endpointInput.value.trim();
  let BOT_WA='';
  (async()=>{try{const ep=getEndpoint();if(!ep)return;const j=await (await fetch(ep)).json();if(j.calendar_url&&!CALENDAR_URL)CALENDAR_URL=j.calendar_url;if(j.bot_whatsapp)BOT_WA=j.bot_whatsapp;}catch(e){}})();

  const form=document.getElementById('dmForm');
  const steps=[...form.querySelectorAll('.dm-step')];
  const bar=document.getElementById('dmBar');
  const count=document.getElementById('dmCount');
  const nav=document.getElementById('dmNav');
  const back=document.getElementById('dmBack');
  const next=document.getElementById('dmNext');
  const isES=document.documentElement.lang.startsWith('es');
  const answers={};
  const last=steps.length-1;
  let i=Math.max(0,parseInt(qs.get('step')||'1',10)-1),sent=false,opener=null;
  /* volver donde lo dejó (link del mail M6): respuestas y contacto pre-llenados */
  (function(){
    const multi=k=>{const v=qs.get(k);if(!v)return;answers[k]=v.split('|').filter(Boolean);
      steps.forEach(s=>{if(s.dataset.key===k)s.querySelectorAll('.dm-opt').forEach(b=>{if(answers[k].includes(b.dataset.value))b.classList.add('on')})})};
    multi('dolores');multi('actual');
    if(qs.get('clientes')){answers.clientes=qs.get('clientes');steps.forEach(s=>{if(s.dataset.key==='clientes')s.querySelectorAll('.dm-opt').forEach(b=>b.classList.toggle('on',b.dataset.value===answers.clientes))})}
    ['email','whatsapp','nombre','centro'].forEach(n=>{const v=qs.get(n);const f=form.querySelector('[name="'+n+'"]');if(v&&f)f.value=v});
  })();
  const t=(es,en)=>isES?es:en;

  /* ---------- pasivos ---------- */
  const T0=Date.now();const stepT={};let backCount=0;
  const ls=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem(k));localStorage.setItem(k,JSON.stringify(v))}catch(e){return null}};
  const utmOf=url=>{const o={};try{new URL(url).searchParams.forEach((v,k)=>{if(/^(utm_|gclid|fbclid)/.test(k))o[k]=v})}catch(e){}return o};
  (function(){
    if(!ls('vita_ft'))ls('vita_ft',{...utmOf(location.href),referrer:document.referrer,landing:location.href,at:new Date().toISOString()});
    ls('vita_lt',{...utmOf(location.href),referrer:document.referrer,at:new Date().toISOString()});
    if(!ls('vita_sid'))ls('vita_sid',(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2)));
    ls('vita_visits',(ls('vita_visits')||0)+1);
  })();
  const track=(name,params)=>{if(window.gtag)gtag('event',name,params);console.debug('[track]',name,params)};

  function render(){
    steps.forEach((s,n)=>s.classList.toggle('on',n===i));
    const step=steps[i];
    const end=step.dataset.mode==='end';
    stepT[step.dataset.key]=stepT[step.dataset.key]||Date.now();
    if(!end)track('form_step_view',{step:i+1,key:step.dataset.key});
    nav.hidden=end;
    back.hidden=i===0||end;
    bar.style.width=(end?100:(i/last)*100)+'%';
    count.textContent=end?'':t('Paso ','Step ')+(i+1)+t(' de ',' of ')+last;
    next.classList.toggle('is-ready',ready());
    if(step.dataset.mode==='form')next.innerHTML=t('Enviar','Send');
    else next.innerHTML=t('Continuar','Continue')+' <span class="arr">&rarr;</span>';
    const focusable=step.querySelector('.dm-opt,input,textarea,button');
    if(focusable)setTimeout(()=>focusable.focus({preventScroll:true}),60);
    root.querySelector('.dm-panel').scrollTop=0;
  }
  function ready(){
    const step=steps[i];
    if(step.dataset.mode==='form'||step.dataset.mode==='end')return true;
    const v=answers[step.dataset.key];
    return Array.isArray(v)?v.length>0:!!v;
  }
  function validate(){
    const step=steps[i];
    if(step.dataset.mode!=='form'){
      if(!ready()){step.classList.add('shake');setTimeout(()=>step.classList.remove('shake'),400);return false}
      return true;
    }
    let ok=true;
    step.querySelectorAll('input[required]').forEach(inp=>{
      const v=inp.value.trim();
      const good=inp.type==='email'?/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)
        :inp.type==='tel'?v.replace(/\D/g,'').length>=8
        :v.length>1;
      inp.closest('.dm-field').classList.toggle('bad',!good);
      if(!good&&ok){inp.focus();ok=false}
    });
    return ok;
  }
  function collect(){
    const data={};
    steps.forEach(s=>{const k=s.dataset.key;if(answers[k]!=null)data[k]=answers[k]});
    form.querySelectorAll('input,textarea').forEach(f=>{if(f.value.trim())data[f.name]=f.value.trim()});
    data.idioma=isES?'es':'en';
    data.origen=location.href;
    Object.assign(data,{
      first_touch:ls('vita_ft')||{},last_touch:ls('vita_lt')||{},
      referrer:document.referrer,landing_page:(ls('vita_ft')||{}).landing||'',
      session_id:ls('vita_sid'),visitas_previas:ls('vita_visits')||1,
      device:/Mobi|Android/i.test(navigator.userAgent)?'mobile':'desktop',
      tiempo_total_seg:Math.round((Date.now()-T0)/1000),pasos_atras:backCount,
      tiempo_por_paso:Object.fromEntries(Object.entries(stepT).map(([k,v])=>[k,Math.round((v-T0)/1000)]))
    });
    /* event_id compartido con Meta (pixel hoy, CAPI después) para dedup por evento */
    data.event_id=(crypto.randomUUID?crypto.randomUUID():String(Math.random()).slice(2));
    return data;
  }

  /* Envío optimista: el form no usa nada de la respuesta, así que no hace esperar al lead los
     10-18 s de Apps Script. Va a /api/lead (Vercel: responde rápido y reintenta contra el script);
     si eso falla, directo al script. El payload queda en localStorage hasta confirmarse y se
     reintenta en la próxima visita. */
  const PEND='vita_lead_pendiente';
  async function deliver(data){
    const ENDPOINT=getEndpoint();if(!ENDPOINT)return false;
    const body=JSON.stringify(data);
    const post=async url=>{const r=await fetch(url,{method:'POST',body,keepalive:true});const j=JSON.parse(await r.text());if(!r.ok)throw new Error('http '+r.status);return j};
    const urls=qs.has('endpoint')?[ENDPOINT]:['/api/lead',ENDPOINT];
    for(const url of urls){
      try{const j=await post(url);document.getElementById('dbgResp').textContent=JSON.stringify(j);try{localStorage.removeItem(PEND)}catch(e){}return j.ok!==false}
      catch(e){document.getElementById('dbgResp').textContent='ERROR: '+e.message}
    }
    return false;
  }
  try{const p=JSON.parse(localStorage.getItem(PEND)||'null');if(p&&Date.now()-p.ts<7*24*3600e3)deliver(p.data);else if(p)localStorage.removeItem(PEND)}catch(e){}

  function submit(){
    if(sent)return;
    sent=true;
    const data=collect();
    document.getElementById('dbgPayload').textContent=JSON.stringify(data,null,2);
    const hasEndpoint=!!getEndpoint();
    if(!hasEndpoint)document.getElementById('dbgResp').textContent='(sin endpoint: no se envió)';
    try{if(hasEndpoint)localStorage.setItem(PEND,JSON.stringify({ts:Date.now(),data}))}catch(e){}
    if(hasEndpoint&&window.fbq)fbq('track','Lead',{},{eventID:data.event_id});
    doneScreen(true,data.email);
    i=last;render();
    if(hasEndpoint)deliver(data).then(delivered=>{
      track('form_submit',{delivered});
      if(!delivered&&!root.hidden)doneScreen(false,data.email);
    });
  }
  function doneScreen(ok,email){
    const title=document.getElementById('dmDoneTitle'),msg=document.getElementById('dmDoneMsg'),cta=document.getElementById('dmDoneCta');
    if(!ok){
      title.textContent=t('No pudimos enviar tu solicitud.','We could not send your request.');
      msg.textContent=t('Puede ser la conexión. Inténtalo de nuevo'+(BOT_WA?' o escríbenos por WhatsApp.':' o escríbenos a hola@vita.lat.'),'It may be the connection. Try again'+(BOT_WA?' or write to us on WhatsApp.':' or email hola@vita.lat.'));
      cta.hidden=false;cta.textContent=t('Intentar de nuevo','Try again');cta.href='#';cta.removeAttribute('target');
      cta.onclick=e=>{e.preventDefault();sent=false;submit()};
      const alt=BOT_WA||'mailto:hola@vita.lat';
      msg.innerHTML=msg.textContent.replace(t('escríbenos por WhatsApp','write to us on WhatsApp'),'<a href="'+alt+'" target="_blank" rel="noopener" style="color:#016075;font-weight:600">'+t('escríbenos por WhatsApp','write to us on WhatsApp')+'</a>');
      return;
    }
    cta.onclick=null;cta.hidden=false;cta.target='_blank';  /* por si venimos de la pantalla de error */
    if(CALENDAR_URL){
      msg.textContent=t('Elige ahora la hora de tu reunión. Te mandamos el link también a '+email+'.','Pick your meeting time now. We also sent the link to '+email+'.');
      cta.textContent=t('Agendar mi reunión →','Book my meeting →');cta.href=CALENDAR_URL+(CALENDAR_URL.includes('?')?'&':'?')+'email='+encodeURIComponent(email);
    }else{
      msg.textContent=t('Te mandamos a '+email+' el link para elegir la hora de tu reunión.','We sent the link to pick your meeting time to '+email+'.');
      cta.hidden=true;
    }
  }
  function go(n){
    if(n>i&&!validate())return;
    if(n<i)backCount++;
    i=Math.max(0,Math.min(last,n));
    if(steps[i].dataset.mode==='end'&&!sent){submit();return}
    render();
  }

  form.querySelectorAll('.dm-opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const step=btn.closest('.dm-step');const key=step.dataset.key;
      if(step.dataset.mode==='multi'){
        const set=answers[key]=answers[key]||[];const v=btn.dataset.value;const at=set.indexOf(v);
        if(at>-1)set.splice(at,1);else set.push(v);
        btn.classList.toggle('on',at===-1);next.classList.toggle('is-ready',ready());
      }else{
        answers[key]=btn.dataset.value;
        step.querySelectorAll('.dm-opt').forEach(o=>o.classList.toggle('on',o===btn));
        setTimeout(()=>go(i+1),190);
      }
    });
  });
  form.querySelectorAll('.dm-field input').forEach(inp=>inp.addEventListener('input',()=>inp.closest('.dm-field').classList.remove('bad')));
  form.addEventListener('submit',e=>{e.preventDefault();go(i+1)});
  form.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.tagName!=='TEXTAREA'){e.preventDefault();go(i+1)}});
  next.addEventListener('click',()=>go(i+1));
  back.addEventListener('click',()=>go(i-1));
  /* Abandono con contacto: si escribió email o WhatsApp válido y se va sin enviar, se guarda como parcial (→ Contactado) */
  let partialSent=false;
  function sendPartial(){
    if(sent||partialSent||root.hidden)return;
    const f=n=>(form.querySelector('[name="'+n+'"]')||{}).value||'';
    const okMail=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f('email').trim()), okTel=f('whatsapp').replace(/\D/g,'').length>=8;
    if(!okMail&&!okTel)return;
    try{const k='vita_parcial_'+(f('email')||f('whatsapp')).replace(/\W/g,'');const prev=+localStorage.getItem(k)||0;if(Date.now()-prev<24*3600e3)return;localStorage.setItem(k,Date.now())}catch(e){}
    partialSent=true;
    const ENDPOINT=getEndpoint();if(!ENDPOINT)return;
    const data=Object.assign(collect(),{form_id:'inbound-web-parcial',parcial:true,paso_abandono:steps[i].dataset.key});
    if(window.fbq)fbq('trackCustom','LeadPartial',{},{eventID:data.event_id});
    try{navigator.sendBeacon(ENDPOINT,JSON.stringify(data))}catch(e){}
  }
  window.addEventListener('beforeunload',()=>{if(!root.hidden&&!sent)track('form_abandon',{step:i+1,seconds:Math.round((Date.now()-T0)/1000)});sendPartial()});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')sendPartial()});

  function open(trigger){
    opener=trigger||null;root.hidden=false;document.body.classList.add('dm-open');
    requestAnimationFrame(()=>root.classList.add('in'));render();
  }
  function close(){sendPartial();
    root.classList.remove('in');document.body.classList.remove('dm-open');
    setTimeout(()=>{root.hidden=true},200);if(opener)opener.focus({preventScroll:true});
    if(location.hash==='#agenda')history.replaceState(null,'',location.pathname+location.search);
  }
  document.querySelectorAll('[data-demo]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();open(a)}));
  root.querySelectorAll('[data-dm-close]').forEach(b=>b.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!root.hidden)close()});
  if(location.hash==='#agenda')open(null);
})();

})();

/* ---------- rotadores de escenas ([data-rotate]): una escena a la vez, pausa fuera de vista y con la pestaña oculta ---------- */
(function(){
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const HOLD=reduce?3500:6200, FADE=reduce?320:480;
  document.querySelectorAll('[data-rotate]').forEach(root=>{
    const scenes=[...root.querySelectorAll(':scope > .scene')];if(!scenes.length)return;
    const asks=root.id==='agentStory'?[...document.querySelectorAll('#agentAsks .ask')]:[];
    let i=0,t1=null,t2=null,visible=false;
    function clear(){clearTimeout(t1);clearTimeout(t2);t1=t2=null;}
    function reset(){clear();scenes.forEach(s=>s.classList.remove('on','out'));asks.forEach(a=>a.classList.remove('active'));}
    function show(){
      reset();
      const cur=scenes[i];cur.classList.add('on');if(asks[i])asks[i].classList.add('active');
      t1=setTimeout(()=>{cur.classList.add('out');
        t2=setTimeout(()=>{cur.classList.remove('on','out');i=(i+1)%scenes.length;if(visible&&!document.hidden)show();},FADE+60);
      },HOLD);
    }
    asks.forEach((a,k)=>{a.setAttribute('role','button');a.tabIndex=0;
      const go=()=>{i=k;visible=true;show();};
      a.addEventListener('click',go);
      a.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();go();}});
    });
    const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>{es.forEach(e=>{
      visible=e.isIntersecting;
      if(visible&&!document.hidden){if(!t1)show();}else reset();
    })},{threshold:.25}):null;
    if(io)io.observe(root);else{visible=true;show();}
    document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();else if(visible)show();});
  });
})();

/* ---------- calculadora: sueldos por cargo + trabajo sin hacer, un solo resumen ---------- */
(function(){
  const root=document.getElementById('calc');if(!root)return;
  const isES=document.documentElement.lang.startsWith('es');
  const fmt=n=>'$'+Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g,isES?'.':',');
  const f=id=>document.getElementById(id);
  const state={pay:0,lose:0};
  function grand(){f('calcGrand').textContent=fmt(state.pay+state.lose);}

  /* pestañas */
  const tabs=[...document.querySelectorAll('.calc-tab')],panes=[...root.querySelectorAll('.calc-pane')];
  tabs.forEach(t=>t.addEventListener('click',()=>{
    tabs.forEach(x=>{const on=x===t;x.classList.toggle('on',on);x.setAttribute('aria-selected',on?'true':'false');});
    panes.forEach(p=>{p.hidden=p.dataset.pane!==t.dataset.tab;});
  }));

  /* sueldos */
  const cards=[...root.querySelectorAll('.role-card')],bars=[...root.querySelectorAll('.calc-bar span')];
  const label=c=>{const t=c.querySelector('.rb-label').textContent.trim().split(',')[0];return t.charAt(0).toLowerCase()+t.slice(1);};
  const price=c=>+c.dataset.value;
  const joinList=xs=>xs.length<=1?xs.join(''):xs.slice(0,-1).join(', ')+(isES?' y ':' and ')+xs[xs.length-1];
  function renderPay(){
    let sum=0,count=0;const missing=[];
    cards.forEach(c=>{const on=c.classList.contains('on');if(on){sum+=price(c);count++;}else missing.push(label(c));});
    bars.forEach(b=>{const c=cards.find(x=>x.dataset.id===b.dataset.id);b.style.flexGrow=c&&c.classList.contains('on')?price(c):0;});
    f('calcToday').textContent=fmt(sum);
    f('calcNote').textContent=isES?count+' de 6 cargos cubiertos':count+' of 6 roles covered';
    f('calcGaps').innerHTML=missing.length?('<b>'+(isES?'Sin cubrir:':'Not covered:')+'</b> '+joinList(missing)+'.'):(isES?'Tienes los seis cargos cubiertos.':'You have all six roles covered.');
    state.pay=sum;grand();
  }
  cards.forEach(c=>{
    const inp=c.querySelector('.rb-input'),btn=c.querySelector('.rb-toggle');
    c.dataset.value=isES?c.dataset.clp:c.dataset.usd;
    const size=()=>{inp.style.width=Math.max(5,inp.value.length+0.5)+'ch';};
    inp.value=fmt(price(c));size();
    btn.addEventListener('click',()=>{c.classList.toggle('on');btn.setAttribute('aria-pressed',c.classList.contains('on')?'true':'false');renderPay();});
    inp.addEventListener('focus',()=>inp.select());
    inp.addEventListener('input',()=>{c.dataset.value=(inp.value.replace(/\D/g,'')||'0');size();renderPay();});
    inp.addEventListener('blur',()=>{inp.value=fmt(price(c));size();});
  });

  /* trabajo sin hacer */
  const CLOSE=0.25,CHURN=0.08,BACK=0.30,WEEKS=4.33;
  const inputs={clients:f('lzClients'),leads:f('lzLeads'),missed:f('lzMissed'),price:f('lzPrice')};
  const val=inp=>+(inp.value.replace(/\D/g,'')||0);
  function renderLose(){
    const clients=val(inputs.clients),leads=val(inputs.leads),missed=Math.min(100,val(inputs.missed))/100,pr=val(inputs.price);
    const leadsLoss=leads*WEEKS*missed*CLOSE*pr,churnLoss=clients*CHURN*BACK*pr;
    const people=Math.round(leads*WEEKS*missed+clients*CHURN);
    f('lzLeadsLoss').textContent=fmt(leadsLoss);f('lzChurnLoss').textContent=fmt(churnLoss);
    f('lzTotal').textContent=fmt(leadsLoss+churnLoss);
    f('lzNote').textContent=isES?people+' personas a las que nadie escribió':people+' people nobody wrote to';
    state.lose=leadsLoss+churnLoss;grand();
  }
  Object.entries(inputs).forEach(([k,inp])=>{
    inp.value=isES?inp.dataset.clp:inp.dataset.usd;if(k==='price')inp.value=fmt(+inp.value);
    inp.addEventListener('focus',()=>inp.select());inp.addEventListener('input',renderLose);
    if(k==='price')inp.addEventListener('blur',()=>{inp.value=fmt(val(inp));});
  });
  renderPay();renderLose();
})();
