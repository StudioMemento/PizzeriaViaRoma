import { SIDE_SQUARES as preset } from "./preset";
import { createSquares, createPainter, pixelRatio } from "./field";

export interface SideSquaresController {
  setPaused(value: boolean): void;
  dispose(): void;
  stats(): { frames: number; squares: number; pixels: number; state: string };
}

/** Translate two small, overscanned canvases on scroll. Repaint only for a new
 * strip or a twinkle frame. The reading column has no canvas backing store. */
export function mountSideSquares(section: HTMLElement, viewport: HTMLElement, initiallyPaused = false): SideSquaresController {
  const canvases = Array.from(viewport.querySelectorAll("canvas"));
  const contexts = canvases.map(canvas => canvas.getContext("2d"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const failed = contexts.some(context => !context) || canvases.length !== 2;
  let painters: Array<ReturnType<typeof createPainter>> = [];
  let visible = false, paused = initiallyPaused, disposed = false;
  let frame = 0, measureFrame = 0, last = 0, seconds = 0;
  let frames = 0, squares = 0, state = "paused";
  let width = 0, height = 0, ratio = 0, top = 0, limit = 0;
  let strip = -1, shift = -1;

  const eligible = () => !disposed && !failed && visible && !paused && !document.hidden;
  const draw = (now: number) => {
    frame = 0;
    if (!eligible()) return;
    const distance = Math.max(0, Math.min(limit, window.scrollY - top));
    const offset = distance * (reduced.matches ? 1 : preset.scrollFactor);
    const origin = Math.floor(offset / preset.overscan) * preset.overscan;
    const residual = offset - origin;
    if (residual !== shift) {
      shift = residual;
      for (const canvas of canvases) canvas.style.transform = 'translateY(' + (-shift) + 'px)';
    }
    const twinkle = !reduced.matches && (!last || now - last >= 1000 / preset.fps - .5);
    if (twinkle && last) seconds += Math.min(.1, (now - last) / 1000);
    if (twinkle) last = now;
    if (twinkle || strip !== origin) {
      strip = origin;
      for (const paint of painters) paint(seconds, strip);
      frames++;
    }
    if (reduced.matches) viewport.dataset.state = state = "static";
    else frame = requestAnimationFrame(draw);
  };
  const sync = () => {
    cancelAnimationFrame(frame); frame = 0; last = 0;
    state = !eligible() ? (failed ? "unavailable" : "paused") : reduced.matches ? "static" : "running";
    viewport.dataset.state = state;
    if (state === "static") { strip = -1; draw(0); }
    if (state === "running") frame = requestAnimationFrame(draw);
  };
  const onScroll = () => {
    if (reduced.matches && eligible() && !frame) frame = requestAnimationFrame(draw);
  };
  const measure = () => {
    measureFrame = 0;
    if (disposed || failed) return;
    const bounds = section.getBoundingClientRect();
    top = bounds.top + window.scrollY;
    limit = Math.max(0, bounds.height - viewport.clientHeight);
    const nextWidth = Math.max(1, canvases[0].clientWidth);
    const nextHeight = Math.ceil((viewport.clientHeight + preset.overscan) / preset.spacing) * preset.spacing;
    const nextRatio = pixelRatio(nextWidth, nextHeight, window.devicePixelRatio);
    if (width === nextWidth && height === nextHeight && ratio === nextRatio) { onScroll(); return; }
    width = nextWidth; height = nextHeight; ratio = nextRatio;
    squares = 0; strip = shift = -1;
    painters = contexts.map((context, index) => {
      const canvas = canvases[index];
      canvas.style.height = height + 'px';
      canvas.width = Math.max(1, Math.floor(width * ratio));
      canvas.height = Math.max(1, Math.floor(height * ratio));
      const field = createSquares(width, height, 120 + index * 913);
      squares += field.length;
      return createPainter(context!, field, width, height, index === 1, canvas.width / width, canvas.height / height);
    });
    sync();
  };
  const queueMeasure = () => {
    if (!disposed && !measureFrame) measureFrame = requestAnimationFrame(measure);
  };
  const resize = new ResizeObserver(queueMeasure);
  resize.observe(viewport); resize.observe(section);
  const visibility = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting !== visible) { visible = entry.isIntersecting; sync(); }
  });
  visibility.observe(section);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", queueMeasure, { passive: true });
  reduced.addEventListener("change", sync);
  measure();
  if (failed) sync();
  return {
    setPaused(value) { if (paused !== value) { paused = value; sync(); } },
    stats: () => ({ frames, squares, pixels: canvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0), state }),
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame); cancelAnimationFrame(measureFrame);
      resize.disconnect(); visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", queueMeasure); window.removeEventListener("scroll", onScroll);
      reduced.removeEventListener("change", sync);
      painters = [];
      for (const canvas of canvases) canvas.width = canvas.height = 1;
    },
  };
}
