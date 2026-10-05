/* Via Roma V18: one motion owner per rail. Touch scrolling stays native. */
(() => {
  'use strict';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const mod = (x, n) => ((x % n) + n) % n;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.body.classList.add('v14a-ready', 'v17-ready', 'v18-ready');
  document.documentElement.dataset.viaRomaBuild = '18.0.0';
  function mountRail(rail, selector, dotsId, speed) {
    let track, cards = [], centres = [], count = 0, band = 0, lower = 0, position = 0, lastWrite = 0;
    let initialized = false, active = -1, raf = 0, last = 0, visible = false, hover = false, focused = false;
    let held = false, drag = null, animation = null, pausedUntil = 0, suppressUntil = 0;
    let autoVelocity = 0, coastVelocity = 0, geometryRaf = 0;
    const dots = document.getElementById(dotsId);
    const pause = (ms = 1800) => { pausedUntil = performance.now() + ms; animation = null; autoVelocity = 0; coastVelocity = 0; };
    const schedule = () => { if (visible && !document.hidden && !raf) raf = requestAnimationFrame(tick); };
    const observer = new MutationObserver(() => { if (!rail.querySelector(':scope > .rail-track')) refreshGeometry(); });
    function geometry() {
      geometryRaf = 0;
      const phase = band ? mod(position - lower, band) / band : 0;
      observer.disconnect(); track = rail.querySelector(':scope > .rail-track');
      if (!track) {
        track = document.createElement('div'); track.className = 'rail-track';
        while (rail.firstChild) track.append(rail.firstChild);
        rail.append(track);
      }
      rail.querySelectorAll('a,img').forEach(el => el.draggable = false);
      observer.observe(rail, {childList:true});
      cards = [...track.querySelectorAll(selector)]; count = Math.floor(cards.length / 3);
      if (!count) return;
      const rect = track.getBoundingClientRect();
      centres = cards.map(c => { const r = c.getBoundingClientRect(); return r.left - rect.left + r.width / 2; });
      band = centres[count * 2] - centres[count]; lower = centres[count] - rail.clientWidth / 2;
      if (!Number.isFinite(band) || band <= 0) return;
      position = lower + (initialized ? phase * band : 0);
      initialized = true; active = -1; animation = null; paint(); schedule();
    }
    function refreshGeometry() { if (!geometryRaf) geometryRaf = requestAnimationFrame(geometry); }
    function nearest(x = position) {
      let k = 0, distance = Infinity;
      centres.forEach((c, i) => { const d = Math.abs(c - rail.clientWidth / 2 - x); if (d < distance) { distance = d; k = i; } });
      return k;
    }
    function normalize() { if (!held && band) position = lower + mod(position - lower, band); }
    function update() {
      const logical = mod(nearest() - count, count);
      if (logical === active) return;
      active = logical;
      cards.forEach((card, i) => { const on = i % count === logical; card.classList.toggle('is-active', on); card.classList.toggle('mid', on); });
      dots.querySelectorAll('button').forEach((dot, i) => { dot.classList.toggle('on', i === logical); dot.setAttribute('aria-current', i === logical ? 'true' : 'false'); });
    }
    function paint() {
      if (!band) return;
      rail.scrollLeft = Math.round(position); lastWrite = rail.scrollLeft;
      track.style.transform = `translate3d(${-(position - lastWrite)}px,0,0)`; update();
    }
    function tick(now) {
      raf = 0; const dt = last ? Math.min(40, now - last) : 0; last = now;
      if (animation) {
        const t = clamp((now - animation.start) / animation.duration, 0, 1);
        position = animation.from + (animation.to - animation.from) * (1 - Math.pow(1 - t, 4));
        paint(); if (t === 1) { animation = null; normalize(); paint(); }
      } else if (!held && Math.abs(coastVelocity) > .018) {
        const decay = Math.exp(-dt / 260);
        position += coastVelocity * 260 * (1 - decay); coastVelocity *= decay; normalize(); paint();
      } else if (!held && !hover && !focused && !reduced.matches && now > pausedUntil) {
        autoVelocity += (speed - autoVelocity) * (1 - Math.exp(-dt / 500));
        position += autoVelocity * dt / 1000; normalize(); paint();
      }
      schedule();
    }
    function moveTo(target) {
      pause(2500);
      if (reduced.matches) { position = target; normalize(); paint(); return; }
      animation = {from:position, to:target, start:performance.now(), duration:620}; schedule();
    }
    const moveBy = direction => { if (count) moveTo(centres[clamp(nearest() + direction, 0, centres.length - 1)] - rail.clientWidth / 2); };
    const moveToLogical = logical => {
      if (!count) return; logical = mod(logical, count);
      const targets = [logical, logical + count, logical + count * 2].map(i => centres[i] - rail.clientWidth / 2);
      moveTo(targets.reduce((best, x) => Math.abs(x - position) < Math.abs(best - position) ? x : best));
    };
    rail.addEventListener('scroll', () => {
      if (Math.abs(rail.scrollLeft - lastWrite) < 1) return;
      position = rail.scrollLeft; lastWrite = position; track.style.transform = ''; pause(); update(); schedule();
    }, {passive:true});
    rail.addEventListener('wheel', () => { pause(); schedule(); }, {passive:true});
    rail.addEventListener('dragstart', e => e.preventDefault());
    rail.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; autoVelocity = 0; } });
    rail.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; pausedUntil = performance.now() + 700; schedule(); } });
    rail.addEventListener('focusin', () => { focused = true; autoVelocity = 0; });
    rail.addEventListener('focusout', e => { focused = rail.contains(e.relatedTarget); pausedUntil = performance.now() + 700; schedule(); });
    rail.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      held = true; pause();
      if (e.pointerType === 'mouse') {
        e.preventDefault();
        drag = {id:e.pointerId, x:e.clientX, y:e.clientY, left:position, axis:null, lastX:e.clientX, lastT:performance.now(), velocity:0};
      }
    });
    rail.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.axis && Math.hypot(dx, dy) > 6) {
        drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (drag.axis === 'x') { rail.setPointerCapture(e.pointerId); rail.classList.add('dragging'); }
      }
      if (drag.axis !== 'x') return;
      e.preventDefault();
      const now = performance.now(), dt = Math.max(4, now - drag.lastT);
      drag.velocity += ((drag.lastX - e.clientX) / dt - drag.velocity) * (1 - Math.exp(-dt / 24));
      drag.lastX = e.clientX; drag.lastT = now;
      position = clamp(drag.left - dx, 0, rail.scrollWidth - rail.clientWidth); paint();
    });
    function release(e, cancelled = false) {
      if (!held || drag && e && e.pointerId !== drag.id) return;
      const old = drag; drag = null; held = false;
      rail.classList.remove('dragging'); pausedUntil = performance.now() + 2500;
      if (old && rail.hasPointerCapture?.(old.id)) rail.releasePointerCapture(old.id);
      if (old?.axis === 'x') {
        suppressUntil = performance.now() + 400;
        coastVelocity = !cancelled && !reduced.matches && performance.now() - old.lastT < 90 ? clamp(old.velocity, -2.5, 2.5) : 0;
      }
      schedule();
    }
    rail.addEventListener('pointerup', e => release(e));
    rail.addEventListener('pointercancel', e => release(e, true));
    rail.addEventListener('lostpointercapture', e => release(e, true));
    addEventListener('pointerup', e => release(e), {passive:true});
    addEventListener('blur', () => release(null, true));
    rail.addEventListener('click', e => { if (performance.now() < suppressUntil) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
    new ResizeObserver(refreshGeometry).observe(rail);
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; last = 0;
      if (visible) schedule(); else { cancelAnimationFrame(raf); raf = 0; }
    }, {rootMargin:'80px'}).observe(rail);
    document.addEventListener('visibilitychange', () => { last = 0; if (document.hidden) { cancelAnimationFrame(raf); raf = 0; } else schedule(); });
    reduced.addEventListener('change', () => { coastVelocity = 0; autoVelocity = 0; schedule(); });
    document.fonts?.ready.then(refreshGeometry); geometry();
    return {moveBy, moveToLogical, refreshGeometry, getState:() => ({position, band, lower, active, count})};
  }
  window.__viaRomaSliderMotion = {
    category: mountRail(document.getElementById('showrail'), '.slide', 'showdots', 14),
    pizza: mountRail(document.getElementById('forno'), 'figure', 'fornodots', 18)
  };

  class GridField {
    constructor(canvas){
      this.canvas=canvas;this.section=canvas.parentElement;this.ctx=canvas.getContext('2d');if(!this.ctx)return;
      this.hero=canvas.dataset.v14aParticles==='home';this.points=[];this.ripples=[];this.pointer=null;this.raf=0;this.visible=false;this.last=0;
      this.resize=()=>{const rect=this.section.getBoundingClientRect();this.w=rect.width;this.h=Math.min(rect.height,1600);const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(this.w*dpr);canvas.height=Math.round(this.h*dpr);this.ctx.setTransform(dpr,0,0,dpr,0,0);const step=Math.max(32,Math.sqrt(this.w*this.h/1300));this.points=[];for(let y=step/2;y<this.h;y+=step)for(let x=step/2;x<this.w;x+=step)this.points.push({x,y,dx:0,dy:0});this.draw(performance.now(),true);this.schedule()};
      const point=e=>{const r=this.section.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}};
      this.section.addEventListener('pointermove',e=>{this.pointer=point(e);this.schedule()},{passive:true});
      this.section.addEventListener('pointerdown',e=>{this.pointer=point(e);this.ripples.push({...this.pointer,start:performance.now()});this.ripples=this.ripples.slice(-4);this.schedule()},{passive:true});
      ['pointerleave','pointercancel'].forEach(type=>this.section.addEventListener(type,()=>{this.pointer=null}));this.section.addEventListener('pointerup',e=>{if(e.pointerType==='touch')this.pointer=null},{passive:true});
      new ResizeObserver(this.resize).observe(this.section);
      new IntersectionObserver(([e])=>{this.visible=e.isIntersecting;this.last=0;if(this.visible)this.schedule();else{cancelAnimationFrame(this.raf);this.raf=0}}).observe(this.section);
      document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(this.raf);this.raf=0}else this.schedule()});reduced.addEventListener('change',()=>{this.draw(performance.now(),true);this.schedule()});this.resize();
    }
    schedule(){if(this.visible&&!document.hidden&&!reduced.matches&&!this.raf)this.raf=requestAnimationFrame(now=>{this.raf=0;this.draw(now);this.schedule()})}
    draw(now,staticFrame=false){
      const c=this.ctx;c.clearRect(0,0,this.w,this.h);const dt=this.last?Math.min(40,now-this.last):16;this.last=now;this.ripples=this.ripples.filter(r=>now-r.start<950);
      for(const p of this.points){let force=0,tx=0,ty=0;if(this.pointer&&!reduced.matches){const dx=p.x-this.pointer.x,dy=p.y-this.pointer.y,d=Math.hypot(dx,dy)||1;force=Math.pow(Math.max(0,1-d/185),1.5);tx=dx/d*force*35;ty=dy/d*force*35}for(const r of this.ripples){const age=(now-r.start)/950,d=Math.hypot(p.x-r.x,p.y-r.y),wave=Math.max(0,1-Math.abs(d-age*260)/38)*(1-age);force=Math.max(force,wave)}const spring=staticFrame?1:1-Math.exp(-dt/100);p.dx+=(tx-p.dx)*spring;p.dy+=(ty-p.dy)*spring;const base=this.hero?.12:.065,alpha=clamp(base+force*.72,0,.9),radius=.85+force*1.75;c.fillStyle=`rgba(211,176,106,${alpha})`;c.beginPath();c.arc(p.x+p.dx,p.y+p.dy,radius,0,Math.PI*2);c.fill();if(force>.3){c.fillStyle=`rgba(211,176,106,${force*.065})`;c.beginPath();c.arc(p.x+p.dx,p.y+p.dy,radius*4,0,Math.PI*2);c.fill()}}
    }
  }
  document.querySelectorAll('[data-v14a-particles]').forEach(c=>new GridField(c));

  const dialog=document.createElement('dialog');dialog.className='allergen-dialog';dialog.setAttribute('aria-labelledby','allergen-heading');document.body.append(dialog);let opener=null;
  const dictionaries={
    it:{frozenTitle:"Prodotti surgelati",title:'Allergeni',close:'Chiudi',note:'Chiedi al personale per ulteriori informazioni',frozen:'Prodotto surgelato all’origine o in mancanza del fresco.'},
    en:{frozenTitle:"Frozen products",title:'Allergens',close:'Close',note:'Ask our staff for further information',frozen:'Frozen at origin or when fresh products are unavailable.'},
    de:{frozenTitle:"Tiefkühlprodukte",title:'Allergene',close:'Schließen',note:'Für weitere Informationen wenden Sie sich an unser Personal',frozen:'Tiefgekühlt oder bei fehlender Frischware tiefgekühlt.'},
    fr:{frozenTitle:"Produits surgelés",title:'Allergènes',close:'Fermer',note:'Demandez au personnel pour plus d’informations',frozen:'Surgelé à l’origine ou en l’absence de produit frais.'}
  };
  document.addEventListener('click',e=>{
    const button=e.target.closest('.allergen-trigger');if(!button)return;opener=button;
    const lang=document.documentElement.lang||'it',t=dictionaries[lang]||dictionaries.it,info=window.getAllergenInfo(button.dataset.allergenKey,button.dataset.description,button.dataset.original),rows=window.VIA_ROMA_ALLERGENS[lang]||window.VIA_ROMA_ALLERGENS.it;
    const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    dialog.innerHTML=`<header><div><p>${t.title}</p><h2 id="allergen-heading">${esc(button.dataset.itemName)}</h2></div><button type="button" class="allergen-close" aria-label="${t.close}" autofocus>×</button></header><ol>${rows.map(([name,description],i)=>`<li class="${info.codes.includes(i+1)?'contains':''}"${info.codes.includes(i+1)?' aria-label="'+esc(name)+': '+({it:'presente',en:'present',de:'enthalten',fr:'présent'}[lang]||'presente')+'"':''}><b class="allergen-number">${i+1}</b><span><strong>${esc(name)}</strong><small>${esc(description)}</small></span></li>`).join('')}<li class="${info.frozen?'contains':''}"><b class="allergen-number">*</b><span><strong>${esc(t.frozenTitle)}</strong><small>${esc(t.frozen)}</small></span></li></ol><p class="allergen-note">${t.note}</p>`;
    dialog.querySelector('.allergen-close').addEventListener('click',()=>dialog.close());dialog.showModal();document.documentElement.classList.add('allergen-open');
  });
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
  dialog.addEventListener('close',()=>{document.documentElement.classList.remove('allergen-open');opener?.focus({preventScroll:true})});
})();
