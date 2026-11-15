import { useCallback, useEffect, useRef, useState, type DragEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type FocusEvent } from "react";
import { wrap } from "./useDrag";

/** One persistent element per item. Recycling happens outside the viewport, never while an image is visible. */
export function useCarousel(count: number, interval = 7000, continuousSpeed = 0) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const loaded = useRef(new Set<number>());
  const [, setLoadVersion] = useState(0);
  const state = useRef({ position: 0, target: 0, step: 300, width: 0, near: false, frame: 0, last: 0, nextAuto: 0, visible: false, hovered: false, focused: false, paused: false, reduced: false, index: 0, suppress: false });
  const pointer = useRef<{ id: number; x: number; y: number; start: number; dx: number; active: boolean; lastX: number; time: number; velocity: number } | null>(null);
  const wakeRef = useRef<() => void>(() => {});
  const move = useCallback((amount: number) => {
    const s = state.current;
    s.target = Math.round(s.target) + amount;
    s.nextAuto = performance.now() + interval + 4000;
    wakeRef.current();
  }, [interval]);
  const select = useCallback((logical: number) => {
    const s = state.current;
    const current = wrap(Math.round(s.target), count);
    let delta = logical - current;
    if (delta > count / 2) delta -= count;
    if (delta < -count / 2) delta += count;
    move(delta);
  }, [count, move]);

  useEffect(() => {
    state.current.paused = paused;
    state.current.nextAuto = performance.now() + interval;
    wakeRef.current();
  }, [paused, interval]);

  useEffect(() => {
    const root = rootRef.current, stage = stageRef.current;
    if (!root || !stage) return;
    const s = state.current;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-carousel-card]"));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const render = () => {
      // Keep the DOM stable, but don't animate or promote cards beyond the clipped stage.
      const edge = s.width / Math.max(1, s.step) / 2 + .75;
      let newImages = false;
      cards.forEach((card, logical) => {
        const offset = wrap(logical - s.position + count / 2, count) - count / 2;
        const distance = Math.abs(offset);
        const visible = distance <= edge;
        const visibility = String(visible);
        if (card.dataset.carouselVisible !== visibility) card.dataset.carouselVisible = visibility;
        if (s.near && distance <= edge + 1.5 && !loaded.current.has(logical)) {
          loaded.current.add(logical);
          newImages = true;
        }
        if (!visible) return;
        card.style.setProperty("--slide-x", `${(offset * s.step).toFixed(2)}px`);
        card.style.setProperty("--slide-distance", distance.toFixed(4));
        const z = String(20 - Math.round(distance * 2));
        if (card.style.zIndex !== z) card.style.zIndex = z;
      });
      if (newImages) setLoadVersion(version => version + 1);
      const active = wrap(Math.round(s.position), count);
      if (active !== s.index) {
        s.index = active;
        setIndex(active);
      }
      if (stage.dataset.index !== String(active)) stage.dataset.index = String(active);
    };
    const updateMotion = () => {
      s.reduced = media.matches;
      setReduced(media.matches);
      wake();
    };
    const measure = () => {
      const card = cards[0];
      if (!card) return;
      const gap = Number.parseFloat(getComputedStyle(stage).getPropertyValue("--carousel-gap")) || 0;
      s.step = card.offsetWidth + gap;
      s.width = stage.clientWidth;
      render();
      wake();
    };
    let idleTimer = 0;
    const frame = (now: number) => {
      s.frame = 0;
      if (!s.visible || document.hidden) { s.last = 0; return; }
      const dt = s.last ? Math.min((now - s.last) / 1000, .05) : 1 / 60;
      s.last = now;
      const canAuto = !s.paused && !s.reduced && !s.hovered && !s.focused && !pointer.current && !root.contains(document.activeElement) && !document.querySelector('dialog[open], [aria-modal="true"]');
      if (canAuto && now >= s.nextAuto) {
        if (continuousSpeed > 0) s.target += continuousSpeed * .25 * dt;
        else { s.target = Math.round(s.target) + 1; s.nextAuto = now + interval; }
      }
      if (!pointer.current?.active) {
        const follow = s.reduced ? 1 : 1 - Math.exp(-dt / .19);
        s.position += (s.target - s.position) * follow;
        if (Math.abs(s.target - s.position) < .0005) s.position = s.target;
      }
      render();
      const moving = Math.abs(s.target - s.position) > .0005;
      const motion = String(moving || !!pointer.current?.active);
      if (stage.dataset.carouselMoving !== motion) stage.dataset.carouselMoving = motion;
      if (moving) s.frame = requestAnimationFrame(frame);
      else {
        s.last = 0;
        // No perpetual animation loop while still: wake at the next autoplay deadline.
        window.clearTimeout(idleTimer);
        if (canAuto) idleTimer = window.setTimeout(wake, Math.max(80, s.nextAuto - now));
      }
    };
    function wake() {
      window.clearTimeout(idleTimer);
      if (!s.frame && s.visible && !document.hidden) s.frame = requestAnimationFrame(frame);
    }
    wakeRef.current = wake;
    s.nextAuto = performance.now() + interval;
    const preload = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      s.near = true;
      render();
      preload.disconnect();
    }, { rootMargin: "360px 0px" });
    preload.observe(stage);
    const stop = () => {
      cancelAnimationFrame(s.frame); s.frame = 0; s.last = 0;
      window.clearTimeout(idleTimer);
      stage.dataset.carouselMoving = "false";
    };
    const observer = new IntersectionObserver(entries => {
      s.visible = entries.some(e => e.isIntersecting);
      if (s.visible) { s.nextAuto = performance.now() + interval; wake(); }
      else stop();
    }, { threshold: .01 });
    observer.observe(stage);
    const resize = new ResizeObserver(measure);
    resize.observe(stage);
    if (cards[0]) resize.observe(cards[0]);
    const visible = () => {
      s.last = 0; s.nextAuto = performance.now() + interval;
      if (document.hidden) stop(); else wake();
    };
    document.addEventListener("visibilitychange", visible);
    document.addEventListener("close", visible, true);
    media.addEventListener("change", updateMotion);
    updateMotion();
    measure();
    return () => {
      cancelAnimationFrame(s.frame); s.frame = 0;
      window.clearTimeout(idleTimer);
      observer.disconnect(); preload.disconnect(); resize.disconnect();
      document.removeEventListener("visibilitychange", visible);
      document.removeEventListener("close", visible, true);
      media.removeEventListener("change", updateMotion);
      wakeRef.current = () => {};
    };
  }, [count, interval, continuousSpeed]);

  const release = (element: HTMLElement, cancelled: boolean) => {
    const p = pointer.current;
    if (!p) return;
    const s = state.current;
    pointer.current = null;
    element.classList.remove("is-dragging");
    if (p.active) {
      s.suppress = !cancelled;
      const projected = cancelled ? s.position : s.position - Math.max(-.65, Math.min(.65, p.velocity * 180 / s.step));
      s.target = continuousSpeed > 0 ? projected : Math.round(projected);
    }
    if (!p.active) s.target = continuousSpeed > 0 ? s.position : Math.round(s.position);
    s.nextAuto = performance.now() + interval + 4000;
    if (element.hasPointerCapture(p.id)) element.releasePointerCapture(p.id);
    wakeRef.current();
  };
  const bind = {
    onDragStart(e: DragEvent<HTMLElement>) { e.preventDefault(); },
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0 || (e.target instanceof Element && e.target.closest('[data-no-drag]'))) return;
      const s = state.current;
      s.suppress = false;
      s.target = s.position;
      pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, start: s.position, dx: 0, active: false, lastX: e.clientX, time: performance.now(), velocity: 0 };
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const p = pointer.current;
      if (!p || p.id !== e.pointerId) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      if (!p.active && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { release(e.currentTarget, true); return; }
      if (!p.active && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy) * 1.1) {
        p.active = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        e.currentTarget.classList.add("is-dragging");
      }
      if (!p.active) return;
      const now = performance.now();
      p.velocity = (e.clientX - p.lastX) / Math.max(16, now - p.time);
      p.lastX = e.clientX; p.time = now; p.dx = dx;
      state.current.position = p.start - dx / state.current.step;
      state.current.target = state.current.position;
      wakeRef.current();
    },
    onPointerUp(e: PointerEvent<HTMLElement>) { release(e.currentTarget, false); },
    onPointerCancel(e: PointerEvent<HTMLElement>) { release(e.currentTarget, true); },
    onLostPointerCapture(e: PointerEvent<HTMLElement>) { if (e.target === e.currentTarget && pointer.current) release(e.currentTarget, true); },
    onClickCapture(e: MouseEvent<HTMLElement>) {
      if (!state.current.suppress) return;
      e.preventDefault(); e.stopPropagation(); state.current.suppress = false;
    },
    onKeyDown(e: KeyboardEvent<HTMLElement>) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault(); move(e.key === "ArrowLeft" ? -1 : 1);
    },
    onPointerEnter(e: PointerEvent<HTMLElement>) { if (e.pointerType === "mouse") { state.current.hovered = true; wakeRef.current(); } },
    onPointerLeave(e: PointerEvent<HTMLElement>) { if (e.pointerType === "mouse") { state.current.hovered = false; state.current.nextAuto = performance.now() + interval; wakeRef.current(); } },
    onFocusCapture() { state.current.focused = true; wakeRef.current(); },
    onBlurCapture(e: FocusEvent<HTMLElement>) {
      if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
      state.current.focused = false; state.current.nextAuto = performance.now() + interval; wakeRef.current();
    },
  };
  const { onPointerEnter, onPointerLeave, onFocusCapture, onBlurCapture, ...stageBind } = bind;
  const rootBind = { onPointerEnter, onPointerLeave, onFocusCapture, onBlurCapture };
  return { rootRef, stageRef, index, move, select, paused, setPaused, reduced, isLoaded: (logical: number) => loaded.current.has(logical), bind: stageBind, rootBind };
}
