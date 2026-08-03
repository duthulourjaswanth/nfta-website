/* =========================================================
   NFTA — motion & interaction (multi-page safe)
   GSAP + ScrollTrigger
   ========================================================= */
document.documentElement.classList.remove('no-js');

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
gsap.registerPlugin(ScrollTrigger);

/* ---------- Reveals (CSS-transition, geometry-triggered) ----------
   Reveal = toggling an `.is-in` class, so the visible end-state is
   guaranteed by CSS regardless of GSAP/rAF. Headings clip-rise, body
   copy fades, cards stagger (delay set per grid position). A plain
   time-throttled scroll handler drives it — no observer, no rAF. */
function cards(){
  // set per-card stagger delay based on position within its grid
  const groups = new Map();
  document.querySelectorAll('[data-card]').forEach((el)=>{
    const p = el.parentElement;
    const i = (groups.get(p) || 0);
    el.style.transitionDelay = (i * 0.08) + 's';
    groups.set(p, i + 1);
  });
}

function revealAll(){
  let items = [...document.querySelectorAll('[data-reveal],[data-card]')];
  if(!items.length) return;
  if(reduce){ items.forEach(el=> el.classList.add('is-in')); return; }
  let last = 0;
  const check = ()=>{
    const line = window.innerHeight * 0.9;
    items = items.filter(el=>{
      if(el.getBoundingClientRect().top < line){ el.classList.add('is-in'); return false; }
      return true;
    });
    if(!items.length){
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };
  const onScroll = ()=>{ const n = Date.now(); if(n - last > 70){ last = n; check(); } };
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  check(); // reveal whatever is already in view at load
}

/* ---------- Intro: full on home, light on inner pages ---------- */
function intro(){
  const pre = document.getElementById('preloader');
  const heroWords = document.querySelectorAll('.hero__display .w');
  const isHome = pre && heroWords.length;

  if (reduce){
    if(pre) pre.style.display = 'none';
    gsap.set('.hero__display .w', { y:0 });
    document.body.classList.add('is-loaded');
    revealAll();
    return;
  }

  if (isHome){
    const tl = gsap.timeline({ onComplete(){ document.body.classList.add('is-loaded'); } });
    tl.to('.preloader__word span', { y:0, opacity:1, stagger:.08, duration:.5, ease:'power3.out' })
      .to('.preloader__bar i', { width:'100%', duration:.9, ease:'power2.inOut' }, '-=.2')
      .to('.preloader__word span', { y:'-110%', opacity:0, stagger:.04, duration:.4, ease:'power3.in' }, '+=.15')
      .to('#preloader', { yPercent:-100, duration:.7, ease:'power4.inOut' }, '-=.1')
      .set('#preloader', { display:'none' })
      .from('.hero__media img', { scale:1.18, duration:1.4, ease:'power3.out' }, '-=.6')
      .to('.hero__display .w', { y:0, duration:1, stagger:.12, ease:'power4.out' }, '-=1.1')
      .from('.hero__top > *', { y:24, opacity:0, stagger:.12, duration:.7, ease:'power3.out' }, '-=.8');
    revealAll();
  } else {
    document.body.classList.add('is-loaded');
    gsap.from('.page-hero__inner > *', { y:30, opacity:0, stagger:.1, duration:.85, ease:'power3.out', delay:.1 });
    revealAll();
  }
}

/* ---------- Marquee loop ---------- */
function marquee(){
  const group = document.querySelector('.marquee__group');
  if(!group) return;
  const w = group.getBoundingClientRect().width;
  gsap.to('.marquee__track', {
    x:-w, duration:18, ease:'none', repeat:-1,
    modifiers:{ x: gsap.utils.unitize(x => parseFloat(x) % w) }
  });
}

/* ---------- Parallax ---------- */
function parallax(){
  if(reduce || !document.querySelector('[data-parallax]')) return;
  gsap.utils.toArray('[data-parallax]').forEach((el)=>{
    const scope = el.closest('.forged') || el.parentElement;
    gsap.to(el, {
      yPercent: parseFloat(el.dataset.parallax) / 4,
      ease:'none',
      scrollTrigger:{ trigger:scope, start:'top bottom', end:'bottom top', scrub:true }
    });
  });
}

/* ---------- Hero parallax + scrub ---------- */
function heroDrift(){
  const hero = document.querySelector('.hero');
  if(reduce || !hero || !hero.querySelector('.hero__media img')) return;
  const tl = gsap.timeline({
    scrollTrigger:{ trigger:hero, start:'top top', end:'bottom top', scrub:true }
  });
  tl.to('.hero__media img', { yPercent:18, ease:'none' }, 0)
    .to('.hero__display',   { yPercent:-9, ease:'none' }, 0)
    .to('.hero__top',       { opacity:.1, y:-34, ease:'none' }, 0);
}

/* ---------- Count-up stat numbers ---------- */
function counters(){
  const els = [...document.querySelectorAll('.stat b')];
  if(!els.length) return;
  els.forEach((el)=>{
    const m = el.textContent.trim().match(/^(\D*)([\d,]+)(.*)$/);
    if(!m){ el.dataset.done = '1'; return; }
    el.dataset.prefix = m[1]; el.dataset.target = m[2].replace(/,/g,''); el.dataset.suffix = m[3];
    if(!reduce) el.textContent = m[1] + '0' + m[3];   // start at 0
  });
  const run = (el)=>{
    if(el.dataset.done) return; el.dataset.done = '1';
    const target = +el.dataset.target, pre = el.dataset.prefix, suf = el.dataset.suffix;
    const finish = ()=>{ el.textContent = pre + target + suf; };
    if(reduce){ finish(); return; }
    const o = { v:0 };
    gsap.to(o, { v:target, duration:1.7, ease:'power2.out',
      onUpdate(){ el.textContent = pre + Math.round(o.v) + suf; }, onComplete:finish });
    setTimeout(finish, 2200);   // guarantee final value even if the ticker is starved
  };
  let items = els.slice(), last = 0;
  const check = ()=>{
    const line = window.innerHeight * 0.9;
    items = items.filter(el=>{ if(el.getBoundingClientRect().top < line){ run(el); return false; } return true; });
    if(!items.length){ window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); }
  };
  const onScroll = ()=>{ const n = Date.now(); if(n - last > 70){ last = n; check(); } };
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll, { passive:true });
  check();
}

/* ---------- Pointer tilt ---------- */
function tilt(){
  if(reduce) return;
  gsap.utils.toArray('[data-tilt]').forEach((el)=>{
    const strength = 7;
    el.addEventListener('pointermove', (e)=>{
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      gsap.to(el, { rotateY:px*strength, rotateX:-py*strength, transformPerspective:900, transformOrigin:'center', duration:.5, ease:'power2.out' });
    });
    el.addEventListener('pointerleave', ()=> gsap.to(el, { rotateX:0, rotateY:0, duration:.6, ease:'power3.out' }));
  });
}

/* ---------- Nav sticky + mobile ---------- */
function nav(){
  const el = document.getElementById('nav');
  if(!el) return;
  ScrollTrigger.create({
    start:'top -60',
    onUpdate:(self)=> el.classList.toggle('is-stuck', self.scroll() > 60),
    onRefresh:(self)=> el.classList.toggle('is-stuck', self.scroll() > 60)
  });
  const burger = document.getElementById('burger');
  burger?.addEventListener('click', ()=>{
    const open = el.classList.toggle('mobile-open');
    burger.setAttribute('aria-expanded', open);
  });
  el.querySelectorAll('.nav__links a').forEach(a =>
    a.addEventListener('click', ()=> el.classList.remove('mobile-open')));
}

/* ---------- Contact form (front-end only) ---------- */
function form(){
  const f = document.querySelector('.contact__form');
  if(!f) return;
  const note = f.querySelector('.form-note');
  f.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!f.checkValidity()){ f.reportValidity(); return; }
    if(note) note.hidden = false;
    f.reset();
    if(note) gsap.fromTo(note, { opacity:0, y:8 }, { opacity:1, y:0, duration:.4 });
  });
}

/* ---------- FAQ accordion (GSAP height, no layout-thrash CSS) ---------- */
function faq(){
  document.querySelectorAll('.faq__item').forEach((item)=>{
    const btn = item.querySelector('.faq__q');
    const panel = item.querySelector('.faq__a');
    if(!btn || !panel) return;
    btn.addEventListener('click', ()=>{
      const open = !item.classList.contains('is-open');
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open);
      if(reduce){ panel.style.height = open ? 'auto' : '0px'; return; }
      gsap.killTweensOf(panel);
      if(open){
        gsap.set(panel, { height:'auto' });
        const h = panel.offsetHeight;            // measured px
        gsap.fromTo(panel, { height:0 }, {
          height:h, duration:.42, ease:'power2.out',
          onComplete(){ panel.style.height = 'auto'; }   // reflow-safe when open
        });
      } else {
        const h = panel.offsetHeight;            // lock current px before collapsing
        gsap.fromTo(panel, { height:h }, { height:0, duration:.32, ease:'power2.in' });
      }
    });
  });
}

/* ---------- Custom cursor + magnetic buttons ----------
   Signature interaction. Skipped on touch / coarse pointers and
   for reduced-motion, where the native cursor stays. */
function customCursor(){
  if(reduce) return;
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const dot = document.createElement('div'); dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(dot, ring);
  document.documentElement.classList.add('has-cursor');
  gsap.set([dot, ring], { xPercent:-50, yPercent:-50 });

  const dx = gsap.quickTo(dot,'x',{duration:.12,ease:'power3'});
  const dy = gsap.quickTo(dot,'y',{duration:.12,ease:'power3'});
  const rx = gsap.quickTo(ring,'x',{duration:.42,ease:'power3'});
  const ry = gsap.quickTo(ring,'y',{duration:.42,ease:'power3'});

  let seen = false;
  window.addEventListener('pointermove', (e)=>{
    if(!seen){ seen = true; document.documentElement.classList.add('cursor-ready'); }
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
  });
  document.addEventListener('mouseleave', ()=> document.documentElement.classList.remove('cursor-ready'));
  document.addEventListener('mouseenter', ()=> seen && document.documentElement.classList.add('cursor-ready'));
  window.addEventListener('pointerdown', ()=> ring.classList.add('is-down'));
  window.addEventListener('pointerup',   ()=> ring.classList.remove('is-down'));

  // ring grows over interactive targets
  document.querySelectorAll('a, button, .prog, .plan, .member, [data-cursor]').forEach((el)=>{
    el.addEventListener('pointerenter', ()=>{ ring.classList.add('is-active'); dot.classList.add('is-active'); });
    el.addEventListener('pointerleave', ()=>{ ring.classList.remove('is-active'); dot.classList.remove('is-active'); });
  });

  // magnetic pull on buttons
  document.querySelectorAll('.btn').forEach((btn)=>{
    const strength = 0.35;
    btn.addEventListener('pointermove', (e)=>{
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x:(e.clientX - (r.left + r.width/2)) * strength,
        y:(e.clientY - (r.top + r.height/2)) * strength,
        duration:.4, ease:'power3.out'
      });
    });
    btn.addEventListener('pointerleave', ()=> gsap.to(btn, { x:0, y:0, duration:.55, ease:'elastic.out(1,0.4)' }));
  });
}

/* ---------- Failsafe ----------
   Last-resort guarantee: reveal anything still hidden and near the
   viewport, even if the scroll handler never ran. */
function revealFailsafe(){
  setTimeout(()=>{
    const vh = window.innerHeight;
    document.querySelectorAll('[data-reveal]:not(.is-in),[data-card]:not(.is-in)').forEach((el)=>{
      if(el.getBoundingClientRect().top < vh * 1.15) el.classList.add('is-in');
    });
  }, 2000);
}

/* ---------- Blog category filter ---------- */
function blogFilter(){
  const cats = [...document.querySelectorAll('.blog-cat')];
  const posts = [...document.querySelectorAll('.post')];
  if(!cats.length || !posts.length) return;
  cats.forEach((btn)=>{
    btn.addEventListener('click', ()=>{
      cats.forEach(b=> b.classList.toggle('is-active', b === btn));
      const cat = btn.dataset.cat;
      posts.forEach((p)=>{
        const show = cat === 'all' || p.dataset.cat === cat;
        p.style.display = show ? '' : 'none';
        if(show && !reduce){ gsap.fromTo(p, { opacity:0, y:16 }, { opacity:1, y:0, duration:.45, ease:'power2.out' }); }
      });
    });
  });
}

/* ---------- Boot ---------- */
window.addEventListener('load', ()=>{
  cards();          // set card stagger delays before any reveal
  intro();          // intro() triggers revealAll()
  marquee();
  parallax();
  heroDrift();
  counters();
  tilt();
  nav();
  form();
  faq();
  blogFilter();
  customCursor();
  ScrollTrigger.refresh();
  revealFailsafe();
});
