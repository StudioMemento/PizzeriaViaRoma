type Speck = {
  birth: number; life: number; x: number; y: number; phase: number; radius: number; size: number;
  released?: number; exitAlpha?: number;
};
type Field = {
  tile: HTMLElement; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D;
  specks: Speck[]; sources: Set<string>; next: number; pointer?: PointerEvent;
};
const exitTime = 3000;

function opacity(p: Speck, now: number) {
  if (p.released !== undefined) return p.exitAlpha! * Math.max(0, 1 - (now - p.released) / exitTime);
  const age = now - p.birth;
  return Math.max(0, Math.min(1, age / 700, (p.life - age) / 1100));
}

/** Paint only the cards under interaction and their individual three-second tails. */
export function bindParticles(grid: HTMLElement) {
  const fields = new Map<HTMLElement, Field>();
  const abort = new AbortController();
  const options = { signal: abort.signal };
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let last = 0;
  let inView = true;
  function retire(f: Field) {
    f.canvas.remove();
    f.tile.style.removeProperty("--satin-x");
    f.tile.style.removeProperty("--satin-y");
    fields.delete(f.tile);
  }
  function clear() {
    cancelAnimationFrame(frame); frame = 0;
    for (const f of fields.values()) retire(f);
  }
  function change(tile: HTMLElement | null, source: string, on: boolean) {
    if (!tile || motion.matches || document.hidden || !inView) return;
    let f = fields.get(tile);
    const now = performance.now();
    if (!f && on) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.className = "tile-particles";
      canvas.setAttribute("aria-hidden", "true");
      tile.append(canvas);
      f = { tile, canvas, ctx, sources: new Set(), specks: [], next: now };
      fields.set(tile, f);
    }
    if (!f || f.sources.has(source) === on) return;
    if (on) {
      if (!f.sources.size) f.next = now + 90;
      f.sources.add(source);
    } else {
      f.sources.delete(source);
      if (!f.sources.size) for (const p of f.specks) {
        if (p.released !== undefined) continue;
        // Start the tail at the position and opacity that were actually painted.
        // Input can arrive midway through a long frame on mobile.
        p.birth += Math.max(0, now - last);
        p.exitAlpha = opacity(p, now);
        p.released = now;
      }
    }
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function draw(now: number) {
    frame = 0;
    if (now - last >= 30) {
      last = now;
      for (const f of fields.values()) {
        const { tile, canvas, ctx } = f;
        const w = tile.clientWidth, h = tile.clientHeight;
        if (f.pointer) {
          const box = tile.getBoundingClientRect();
          tile.style.setProperty("--satin-x", `${Math.round((f.pointer.clientX - box.left) * 100 / box.width)}%`);
          tile.style.setProperty("--satin-y", `${Math.round((f.pointer.clientY - box.top) * 100 / box.height)}%`);
          f.pointer = undefined;
        }
        const dpr = Math.min(devicePixelRatio, 1.5);
        const cw = Math.round(w * dpr), ch = Math.round(h * dpr);
        if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        if (f.sources.size && now >= f.next && f.specks.length < 48) {
          const rand = Math.random;
          f.specks.push({ birth: now, life: 4800 + rand() * 2800, x: .06 + rand() * .88, y: .32 + rand() * .65,
            phase: rand() * Math.PI * 2, radius: .016 + rand() * .043, size: .52 + rand() * .8 });
          f.next = now + Math.max(105, 255 - Math.min(w, 550) / 4) + rand() * 65;
        }
        f.specks = f.specks.filter(p => now < (p.released === undefined ? p.birth + p.life : p.released + exitTime));
        ctx.fillStyle = "#f6d993";
        for (const p of f.specks) {
          const t = (now - p.birth) / 1000;
          const a = p.phase + t * 1.18;
          const x = w * (p.x + p.radius * (Math.sin(a) - Math.sin(p.phase)));
          const y = h * (p.y - t * .052 + p.radius * .35 * (Math.cos(a) - Math.cos(p.phase)));
          ctx.globalAlpha = .79 * opacity(p, now) * (.88 + .12 * Math.cos(a));
          ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI * 2); ctx.fill();
        }
        if (!f.sources.size && !f.specks.length) retire(f);
      }
    }
    if (fields.size) frame = requestAnimationFrame(draw);
  }
  const tileOf = (node: EventTarget | null) => node instanceof Element ? node.closest<HTMLElement>(".bento-tile") : null;
  function hover(event: PointerEvent) {
    if (event.pointerType === "touch") return;
    const tile = tileOf(event.target);
    if (tile !== tileOf(event.relatedTarget)) change(tile, "hover", event.type === "pointerover");
  }
  grid.addEventListener("pointerover", hover, options);
  grid.addEventListener("pointerout", hover, options);
  grid.addEventListener("pointermove", e => {
    const tile = tileOf(e.target);
    const field = tile && fields.get(tile);
    if (field && field.sources.has("hover")) field.pointer = e;
  }, { ...options, passive: true });
  grid.addEventListener("focusin", e => {
    const tile = tileOf(e.target);
    if (tile?.matches(":focus-visible")) change(tile, "focus", true);
  }, options);
  grid.addEventListener("focusout", e => change(tileOf(e.target), "focus", false), options);
  grid.addEventListener("pointerdown", e => { if (e.pointerType === "touch") change(tileOf(e.target), "touch", true); }, options);
  const endTouch = () => { for (const tile of fields.keys()) change(tile, "touch", false); };
  window.addEventListener("pointerup", endTouch, options);
  window.addEventListener("pointercancel", endTouch, options);
  function sync() {
    if (document.hidden || motion.matches || !inView) { clear(); return; }
    if (matchMedia("(hover: hover)").matches) change(grid.querySelector(".bento-tile:hover"), "hover", true);
    change(grid.querySelector(".bento-tile:focus-visible"), "focus", true);
  }
  document.addEventListener("visibilitychange", sync, options);
  motion.addEventListener("change", sync, options);
  const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
  observer.observe(grid);
  return () => { abort.abort(); observer.disconnect(); clear(); };
}
