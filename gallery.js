/* Three decoded display-sized slides. Original 4K files are opened only in the lightbox. */
(() => {
  'use strict';
  window.createViaRomaGallery = function createViaRomaGallery(items, caption, language) {
    const viewer = document.getElementById('gviewer');
    const stage = document.getElementById('gstage');
    const track = document.getElementById('gtrack');
    const thumbs = document.getElementById('gthumbs');
    const progress = document.getElementById('gprogress');
    const error = document.getElementById('gerror');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const thumbMotion = createDragRail(thumbs);
    const wrap = i => (i % items.length + items.length) % items.length;
    const asset = (i, type) => items[wrap(i)].src.replace('assets/gallery/', `assets/gallery/${type}/`);
    const displayType = innerWidth < 800 ? 'display-960' : 'display-1920';
    const panes = Array.from({length:3}, () => {
      const img = document.createElement('img');
      img.className = 'g-slide'; img.decoding = 'async'; img.draggable = false;
      img.width = 1920; img.height = 1220; track.append(img); return img;
    });
    let index = 0, requested = 0, started = false, starting = null, busy = false;
    let visible = false, near = false, hover = false, focus = false, lightbox = false;
    let width = 1, gesture = null, suppressUntil = 0, raf = 0, last = 0, elapsed = 0, finishTransition = null;
    const interval = 6500;
    function place(offset = 0) { track.style.transform = `translate3d(${-width + offset}px,0,0)`; }
    function imageReady(img, i) {
      i = wrap(i);
      if (img.dataset.index === String(i)) return img.ready;
      img.dataset.index = String(i); img.alt = caption(i);
      img.ready = new Promise((resolve, reject) => {
        img.onload = () => (img.decode ? img.decode() : Promise.resolve()).then(resolve, resolve);
        img.onerror = () => { delete img.dataset.index; reject(new Error('Photo unavailable')); };
        img.src = asset(i, displayType);
      });
      return img.ready;
    }
    function status(reveal = false) {
      thumbs.querySelectorAll('button').forEach((b, i) => {
        b.classList.toggle('on', i === index); b.setAttribute('aria-current', i === index ? 'true' : 'false');
        b.setAttribute('aria-label', `${caption(i)} · ${i + 1}`);
      });
      panes.forEach((img, i) => { img.alt = caption(Number(img.dataset.index) || 0); img.setAttribute('aria-hidden', i === 1 ? 'false' : 'true'); });
      const labels = {
        it:['Scorri per cambiare foto. Tocca per ingrandire.', 'Foto del locale'],
        en:['Swipe to change photo. Tap to enlarge.', 'Restaurant photos'],
        de:['Wischen zum Wechseln. Tippen zum Vergrößern.', 'Fotos des Lokals'],
        fr:['Glissez pour changer de photo. Touchez pour agrandir.', 'Photos du restaurant']
      }[language()];
      stage.setAttribute('aria-label', labels[0]); viewer.setAttribute('aria-label', labels[1]);
      if (reveal) thumbMotion.reveal(thumbs.children[index]);
    }
    function canAdvance() {
      return started && visible && !document.hidden && !reduced.matches && !navigator.connection?.saveData
        && !hover && !focus && !lightbox && !busy && !gesture;
    }
    function schedule() {
      if (canAdvance() && !raf) { last = 0; raf = requestAnimationFrame(tick); }
    }
    function pause() { cancelAnimationFrame(raf); raf = 0; last = 0; }
    function tick(now) {
      raf = 0;
      if (!canAdvance()) { last = 0; return; }
      elapsed += last ? Math.min(50, now - last) : 0; last = now;
      progress.style.transform = `scaleX(${Math.min(1, elapsed / interval)})`;
      if (elapsed >= interval) go(index + 1); else raf = requestAnimationFrame(tick);
    }
    function resetClock() { elapsed = 0; last = 0; progress.style.transform = 'scaleX(0)'; }
    function animate(offset, duration = 480) {
      if (reduced.matches) { track.style.transition = 'none'; place(offset); return Promise.resolve(); }
      return new Promise(resolve => {
        let done = false, timer;
        const finish = event => {
          if (event && (event.target !== track || event.propertyName !== 'transform')) return;
          if (done) return; done = true; clearTimeout(timer); track.removeEventListener('transitionend', finish);
          if (finishTransition === finish) finishTransition = null;
          resolve();
        };
        finishTransition = finish;
        track.addEventListener('transitionend', finish);
        track.style.transition = `transform ${duration}ms cubic-bezier(.22,.68,.25,1)`;
        place(offset); timer = setTimeout(finish, duration + 70);
      });
    }
    async function ensureStarted() {
      if (started) return true;
      if (starting) return starting;
      starting = (async () => {
        try {
          await Promise.all(panes.map((p, i) => imageReady(p, i - 1)));
          started = true; stage.classList.add('is-ready'); status(); schedule(); return true;
        } catch (_) { error.textContent = 'Foto non disponibile. Seleziona una miniatura per riprovare.'; return false; }
        finally { starting = null; }
      })();
      return starting;
    }
    async function go(next) {
      requested = wrap(next);
      if (busy) return;
      busy = true; pause();
      if (!await ensureStarted()) { busy = false; return; }
      if (requested === index) {
        await animate(0, 240); busy = false; resetClock();
        if (requested !== index) go(requested); else schedule();
        return;
      }
      const nextIndex = requested;
      const forward = wrap(nextIndex - index), backward = wrap(index - nextIndex);
      const direction = forward <= backward ? 1 : -1;
      try {
        await imageReady(panes[1 + direction], nextIndex);
        // This pane is already painted/decoded before the transform begins.
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        await animate(-direction * width);
        track.style.transition = 'none';
        if (direction > 0) { const old = panes.shift(); panes.push(old); track.append(old); }
        else { const old = panes.pop(); panes.unshift(old); track.prepend(old); }
        index = nextIndex; place(); status(true); error.textContent = '';
        // The visible node is preserved. Only offscreen neighbours get new image sources.
        await Promise.all([imageReady(panes[0], index - 1), imageReady(panes[2], index + 1)]);
      } catch (_) { track.style.transition = 'none'; place(); error.textContent = 'Foto non disponibile. Seleziona un’altra miniatura.'; }
      finally { busy = false; resetClock(); }
      if (requested !== nextIndex) go(requested); else schedule();
    }
    function render() {
      if (!thumbs.children.length) {
        thumbs.innerHTML = items.map((_, i) => `<button class="photo-thumb" type="button" data-gallery-index="${i}"><img src="${asset(i, 'thumbs')}" alt="" width="240" height="152" loading="lazy" decoding="async" draggable="false"></button>`).join('');
      }
      status(); if (near) ensureStarted();
    }
    thumbs.addEventListener('click', e => { const b = e.target.closest('[data-gallery-index]'); if (b) go(Number(b.dataset.galleryIndex)); });
    stage.addEventListener('dragstart', e => e.preventDefault());
    stage.addEventListener('pointerdown', e => {
      if (e.button !== 0 || busy || !started) return;
      if (e.pointerType === 'mouse') e.preventDefault();
      pause(); track.style.transition = 'none';
      gesture = {id:e.pointerId, x:e.clientX, y:e.clientY, lastX:e.clientX, lastT:performance.now(), velocity:0, axis:null};
    });
    stage.addEventListener('pointermove', e => {
      if (!gesture || gesture.id !== e.pointerId) return;
      const dx = e.clientX - gesture.x, dy = e.clientY - gesture.y;
      if (!gesture.axis && Math.hypot(dx, dy) > 6) {
        gesture.axis = Math.abs(dx) > Math.abs(dy) * 1.15 ? 'x' : 'y';
        if (gesture.axis === 'x') { stage.setPointerCapture(e.pointerId); stage.classList.add('dragging'); }
      }
      if (gesture.axis !== 'x') return;
      e.preventDefault();
      const now = performance.now(); gesture.velocity = (e.clientX - gesture.lastX) / Math.max(8, now - gesture.lastT);
      gesture.lastX = e.clientX; gesture.lastT = now;
      place(Math.max(-width * .96, Math.min(width * .96, dx)));
    });
    async function release(e, cancelled = false) {
      if (!gesture || e && gesture.id !== e.pointerId) return;
      const old = gesture; gesture = null; stage.classList.remove('dragging');
      if (stage.hasPointerCapture?.(old.id)) stage.releasePointerCapture(old.id);
      if (old.axis === 'x') {
        suppressUntil = performance.now() + 500;
        const dx = old.lastX - old.x, velocity = performance.now() - old.lastT < 90 ? old.velocity : 0;
        if (!cancelled && (Math.abs(dx) > Math.min(80, width * .18) || Math.abs(velocity) > .5 && Math.abs(dx) > 15)) {
          go(index + (dx < 0 ? 1 : -1)); return;
        }
        busy = true; await animate(0, 260); busy = false;
      }
      schedule();
    }
    stage.addEventListener('pointerup', e => release(e));
    stage.addEventListener('pointercancel', e => release(e, true));
    stage.addEventListener('lostpointercapture', e => release(e, true));
    addEventListener('pointerup', e => release(e));
    function open() {
      if (performance.now() < suppressUntil || !started || busy) return;
      window.__openGalleryLightbox?.(items.map(x => x.src), index, 'Via Roma');
    }
    stage.addEventListener('click', open);
    viewer.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); go(requested + (e.key === 'ArrowRight' ? 1 : -1)); }
      if (e.target === stage && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(); }
    });
    viewer.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hover = true; pause(); } });
    viewer.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { hover = false; schedule(); } });
    viewer.addEventListener('focusin', () => { focus = !!document.activeElement?.matches(':focus-visible'); if (focus) pause(); });
    viewer.addEventListener('focusout', e => { focus = viewer.contains(e.relatedTarget) && !!e.relatedTarget?.matches(':focus-visible'); schedule(); });
    addEventListener('lightbox:opened', () => { lightbox = true; pause(); });
    addEventListener('lightbox:closed', () => { lightbox = false; schedule(); });
    addEventListener('blur', () => { release(null, true); pause(); });
    addEventListener('focus', schedule);
    document.addEventListener('visibilitychange', () => document.hidden ? pause() : schedule());
    reduced.addEventListener('change', () => { resetClock(); reduced.matches ? pause() : schedule(); });
    new IntersectionObserver(([entry]) => { near = entry.isIntersecting; if (near) ensureStarted(); }, {rootMargin:'300px'}).observe(stage);
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; visible ? schedule() : pause(); }, {threshold:.35}).observe(stage);
    new ResizeObserver(() => {
      const nextWidth = stage.clientWidth || 1;
      if (nextWidth === width) return;
      width = nextWidth;
      if (gesture) { gesture = null; suppressUntil = performance.now() + 400; stage.classList.remove('dragging'); }
      track.style.transition = 'none'; finishTransition?.(); place(); schedule();
    }).observe(stage);
    width = stage.clientWidth || 1; place();
    return {render, go, getState:() => ({index, requested, busy, started, visible, elapsed, displayType})};
  };
})();
