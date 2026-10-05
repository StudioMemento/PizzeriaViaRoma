/* Finite rails: native touch inertia, one velocity-preserving mouse controller. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  window.createDragRail = function createDragRail(rail) {
    let drag = null, raf = 0, position = 0, velocity = 0, last = 0, suppressUntil = 0;
    const max = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
    const clamp = x => Math.max(0, Math.min(max(), x));
    function stop() {
      cancelAnimationFrame(raf); raf = 0; velocity = 0;
      position = rail.scrollLeft;
    }
    function coast(now) {
      const dt = Math.min(32, now - last); last = now;
      const decay = Math.exp(-dt / 260);
      const next = clamp(position + velocity * 260 * (1 - decay));
      velocity *= decay;
      const reachedEdge = next === 0 || next === max();
      position = next; rail.scrollLeft = position;
      raf = Math.abs(velocity) > .018 && !reachedEdge ? requestAnimationFrame(coast) : 0;
    }
    rail.addEventListener('dragstart', e => e.preventDefault());
    rail.addEventListener('pointerdown', e => {
      stop();
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      e.preventDefault();
      drag = {id:e.pointerId, x:e.clientX, y:e.clientY, left:position, moved:false,
        lastX:e.clientX, lastT:performance.now(), velocity:0};
    });
    rail.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.abs(dx) > 5 && Math.abs(dx) > Math.abs(dy)) {
        drag.moved = true; rail.setPointerCapture(e.pointerId); rail.classList.add('dragging');
      }
      if (!drag.moved) return;
      e.preventDefault();
      const now = performance.now(), dt = Math.max(4, now - drag.lastT);
      const sample = (drag.lastX - e.clientX) / dt;
      const blend = 1 - Math.exp(-dt / 24);
      drag.velocity += (sample - drag.velocity) * blend;
      drag.lastX = e.clientX; drag.lastT = now;
      position = clamp(drag.left - dx); rail.scrollLeft = position;
    });
    function release(e, cancelled = false) {
      if (!drag || e && e.pointerId !== drag.id) return;
      const previous = drag; drag = null;
      rail.classList.remove('dragging');
      if (rail.hasPointerCapture?.(previous.id)) rail.releasePointerCapture(previous.id);
      if (!previous.moved) return;
      suppressUntil = performance.now() + 400;
      velocity = !cancelled && !reduced.matches && performance.now() - previous.lastT < 90
        ? Math.max(-2.5, Math.min(2.5, previous.velocity)) : 0;
      // No snapping or CSS-mode switch on release: the first frame continues this velocity.
      last = performance.now();
      if (Math.abs(velocity) > .018) raf = requestAnimationFrame(coast);
    }
    rail.addEventListener('pointerup', release);
    rail.addEventListener('pointercancel', e => release(e, true));
    rail.addEventListener('lostpointercapture', e => release(e, true));
    addEventListener('pointerup', e => release(e));
    addEventListener('blur', () => { release(null, true); stop(); });
    rail.addEventListener('wheel', stop, {passive:true});
    rail.addEventListener('click', e => {
      if (performance.now() < suppressUntil) { e.preventDefault(); e.stopImmediatePropagation(); }
    }, true);
    return {
      stop,
      reveal(element) {
        if (!element || drag) return;
        const left = element.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft;
        const pad = 16;
        if (left >= rail.scrollLeft + pad && left + element.offsetWidth <= rail.scrollLeft + rail.clientWidth - pad) return;
        stop();
        const from = rail.scrollLeft, to = clamp(left - (rail.clientWidth - element.offsetWidth) / 2);
        if (reduced.matches) { rail.scrollLeft = to; return; }
        const start = performance.now();
        function frame(now) {
          const t = Math.min(1, (now - start) / 420);
          position = from + (to - from) * (1 - Math.pow(1 - t, 3));
          rail.scrollLeft = position;
          raf = t < 1 ? requestAnimationFrame(frame) : 0;
        }
        raf = requestAnimationFrame(frame);
      },
      getState: () => ({dragging:!!drag, coasting:!!raf, position:rail.scrollLeft, velocity})
    };
  };
})();
