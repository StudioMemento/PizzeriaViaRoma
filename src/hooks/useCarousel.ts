import { useCallback, useEffect, useLayoutEffect, useRef, useState, type DragEvent, type FocusEvent, type KeyboardEvent, type PointerEvent } from "react";
import { useDialog } from "../components/DialogContext";
import { advance, captionOpacity, carouselWindow, createMotion, loopDistance, pizzaPose, releaseTarget, seek } from "./carouselMotion";
import { bindHorizontalDrag } from "./horizontalDrag";
import { wrap } from "./useDrag";

/** One RAF, only while visible and moving. No layout reads in the frame loop. */
export function useCarousel(count: number, language: string) {
  const rootRef = useRef<HTMLElement>(null), stageRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [renderCount, setRenderCount] = useState(count);
  const [preload, setPreload] = useState(1);
  const { modal } = useDialog();
  const model = useRef(createMotion());
  const state = useRef({ visible: false, hovered: false, focused: false, reduced: false, modal: false, step: 220, focusStep: 300, radius: 3, index: 0, frame: 0, last: 0 });
  const wake = useRef<() => void>(() => {}), paint = useRef<() => void>(() => {});
  const select = useCallback((logical: number) => {
    const m = model.current;
    seek(m, m.position + loopDistance(logical, m.position, count), state.current.reduced);
    paint.current(); wake.current();
  }, [count]);
  const move = useCallback((amount: number) => {
    const m = model.current;
    seek(m, Math.round(m.target?.to ?? m.position) + amount, state.current.reduced);
    paint.current(); wake.current();
  }, []);
  useLayoutEffect(() => {
    const root = rootRef.current, stage = stageRef.current;
    if (!root || !stage) return;
    const s = state.current, m = model.current;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-carousel-card]"));
    const captions = Array.from(root.querySelectorAll<HTMLElement>(".pizza-caption"));
    let previousBase = -1;
    let contact = false, dragging = false, speed = 0, stageVisible = false;
    const inputs = new AbortController();
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false, timer = 0;
    const render = () => {
      const selectedSlot = wrap(Math.round(m.position), cards.length);
      cards.forEach((card, i) => {
        const d = loopDistance(i, m.position, cards.length), visible = Math.abs(d) < s.radius;
        const visibility = visible ? "visible" : "hidden";
        if (card.style.visibility !== visibility) card.style.visibility = visibility;
        if (visible) {
          const pose = pizzaPose(d, s.step, s.focusStep);
          card.style.transform = `translate3d(calc(-50% + ${pose.x.toFixed(3)}px),0,0) scale(${pose.scale.toFixed(4)})`;
          card.style.opacity = pose.opacity.toFixed(3);
        }
        const active = i === selectedSlot;
        if (card.dataset.active !== String(active)) { card.dataset.active = String(active); card.ariaHidden = String(!active); }
      });
      const base = wrap(Math.floor(m.position), count);
      const nextBase = (base + 1) % count;
      if (previousBase !== base) {
        if (previousBase < 0) captions.forEach(caption => { caption.style.opacity = "0"; });
        else {
          captions[previousBase].style.opacity = "0";
          captions[(previousBase + 1) % count].style.opacity = "0";
        }
        previousBase = base;
      }
      const fraction = m.position - Math.floor(m.position);
      captions[base].style.opacity = captionOpacity(fraction).toFixed(4);
      captions[nextBase].style.opacity = captionOpacity(1 - fraction).toFixed(4);
      const next = wrap(Math.round(m.position), count);
      if (next !== s.index) { s.index = next; setIndex(next); }
    };
    const eligible = () => s.visible && !document.hidden && !s.modal;
    const autoplay = () => stageVisible && !s.reduced && !s.hovered && !s.focused && !contact;
    const tick = (now: number) => {
      s.frame = 0;
      if (!eligible()) return;
      const dt = Math.max(0, (now - (s.last || now)) / 1000);
      s.last = now;
      const moving = !dragging && advance(m, dt);
      render();
      if (moving) s.frame = requestAnimationFrame(tick);
      else {
        s.last = 0;
        if (autoplay()) timer = window.setTimeout(() => {
          if (!eligible() || !autoplay()) return;
          seek(m, Math.round(m.position) + 1);
          start();
        }, 5000);
      }
    };
    function start() {
      clearTimeout(timer); timer = 0;
      if (disposed || !eligible() || s.frame) return;
      s.frame = requestAnimationFrame(tick);
    }
    const stop = () => { cancelAnimationFrame(s.frame); clearTimeout(timer); s.frame = 0; s.last = 0; };
    const resize = () => {
      const cardWidth = cards[0]?.offsetWidth || 300;
      const layout = carouselWindow(stage.getBoundingClientRect().width, cardWidth, count);
      s.step = layout.step; s.focusStep = layout.focusStep; s.radius = layout.radius;
      setPreload(layout.preload);
      setRenderCount(layout.renderCount);
      render();
    };
    const visibility = () => { stop(); if (eligible()) start(); };
    const motion = () => { s.reduced = media.matches; if (s.reduced) { seek(m, Math.round(m.target?.to ?? m.position), true); render(); } visibility(); };
    const io = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === root) s.visible = entry.isIntersecting;
        if (entry.target === stage) stageVisible = entry.isIntersecting && entry.intersectionRatio >= 0.3;
      }
      visibility();
    }, { threshold: [0, 0.3] });
    const ro = new ResizeObserver(resize);
    io.observe(root); io.observe(stage); ro.observe(stage); if (cards[0]) ro.observe(cards[0]);
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    s.reduced = media.matches;
    paint.current = render;
    wake.current = () => { if (!eligible()) stop(); else start(); };
    bindHorizontalDrag(root, inputs.signal, {
      begin() { contact = true; speed = 0; start(); },
      move(pixels, seconds) {
        const change = pixels / s.focusStep;
        const measured = Math.max(-15, Math.min(15, change / seconds));
        const weight = dragging ? 1 - Math.exp(-seconds / .04) : 1;
        speed += (measured - speed) * weight;
        dragging = true;
        m.target = null; m.velocity = 0; m.position += change;
        start();
      },
      end(coast) {
        if (dragging) {
          const velocity = coast ? speed : 0;
          seek(m, releaseTarget(m.position, velocity), s.reduced, velocity);
          s.last = performance.now();
        }
        contact = dragging = false;
        start();
      },
    }, 0);
    resize();
    return () => {
      disposed = true; inputs.abort(); stop(); io.disconnect(); ro.disconnect();
      media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility);
      paint.current = () => {}; wake.current = () => {};
    };
  }, [count, language, renderCount]);
  useEffect(() => { state.current.modal = !!modal; wake.current(); }, [modal]);
  return {
    rootRef, stageRef, index, renderCount, select, move,
    // Keep only the visible belt and its overscan attached, even after a full tour.
    isLoaded: (i: number) => Math.abs(loopDistance(i, index, count)) <= preload,
    rootBind: {
      onPointerEnter(e: PointerEvent<HTMLElement>) { if (e.pointerType === "mouse") { state.current.hovered = true; wake.current(); } },
      onPointerLeave(e: PointerEvent<HTMLElement>) { if (e.pointerType === "mouse") { state.current.hovered = false; wake.current(); } },
      onFocusCapture(e: FocusEvent<HTMLElement>) { state.current.focused = (e.target as HTMLElement).matches(":focus-visible"); wake.current(); },
      onBlurCapture(e: FocusEvent<HTMLElement>) { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) { state.current.focused = false; wake.current(); } },
    },
    bind: {
      onDragStart(e: DragEvent<HTMLElement>) { e.preventDefault(); },
      onKeyDown(e: KeyboardEvent<HTMLElement>) {
        if (e.key === "Home" || e.key === "End") { e.preventDefault(); select(e.key === "Home" ? 0 : count - 1); }
        else if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); move(e.key === "ArrowLeft" ? -1 : 1); }
      },
    },
  };
}
