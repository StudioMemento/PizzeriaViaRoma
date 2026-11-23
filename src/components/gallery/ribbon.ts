import { bindHorizontalDrag } from "../../hooks/horizontalDrag";
import { wrap } from "../../hooks/useDrag";

export type RibbonController = { focusCard(index: number): void; refresh(): void; destroy(): void };

const perspective = 1800;
const angularSpeed = 3.2 * Math.PI / 180;
const momentum = 0.5;
const scrollEase = 0.3;

/** Show each photo once. The wrapped distance moves a card across the seam only outside the frame. */
function distance(index: number, position: number, count: number) {
  return wrap(index - position + count / 2, count) - count / 2;
}

export function mountRibbon(stage: HTMLElement, announcement: HTMLElement): RibbonController {
  const track = stage.querySelector<HTMLElement>(".ribbon-track")!;
  const cards = Array.from(track.children) as HTMLElement[];
  const images = cards.map(card => card.querySelector("img")!);
  const measuredRoom = CSS.supports("opacity", "cos(0deg)")
    ? null : stage.closest<HTMLElement>(".venue-room");
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const listeners = new AbortController();
  const signal = listeners.signal;
  const options = { signal };
  let position = 0, goal: number | null = null, velocity = 0;
  let width = 1, cardWidth = 1, pitch = 1, focal = 1, stepAngle = 1, halfAngle = 0;
  let driftRate = 0, viewAngle = 0;
  let activeCard: HTMLElement | undefined;
  let visible = false, paused = false;
  let hovered = matchMedia("(hover: hover)").matches && stage.matches(":hover");
  let keyboard = stage.matches(":focus-visible");
  let interacting = false;
  let frame = 0, previous = 0;

  const nearest = (at: number) => wrap(Math.round(at), cards.length);

  function render() {
    const side = 2 * Math.sin(halfAngle) / cardWidth, depth = Math.cos(halfAngle);
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const delta = distance(i, position, cards.length);
      const angle = delta * stepAngle;
      const offset = Math.abs(angle);
      const within = offset < viewAngle + .015;
      if (offset < viewAngle + stepAngle && images[i].loading !== "eager") images[i].loading = "eager";
      card.style.visibility = within ? "visible" : "hidden";
      if (!within) continue;
      // Project the four corners of a tangent panel on the inside of a cylinder.
      const sin = Math.sin(angle), cos = Math.cos(angle);
      card.style.transform = `matrix3d(${focal * cos * side},0,0,${-sin * side},0,1,0,0,0,0,1,0,${focal * sin * depth},0,0,${cos * depth})`;
      card.style.opacity = String(1 - Math.min(1, Math.abs(2 * focal * Math.tan(angle) / width)) ** 1.6 * .45);
    }
    const index = nearest(position);
    if (activeCard !== cards[index]) {
      activeCard?.classList.remove("is-current");
      activeCard = cards[index];
      activeCard.classList.add("is-current");
      stage.dataset.active = String(index);
    }
  }

  function measure() {
    width = Math.max(1, stage.clientWidth);
    const layoutWidth = (card: HTMLElement) => parseFloat(getComputedStyle(card).width);
    cardWidth = Math.max(1, layoutWidth(cards[0]));
    const gap = parseFloat(getComputedStyle(track).columnGap);
    pitch = cardWidth + gap;
    focal = Math.min(perspective, cardWidth * 2.15, Math.max(cardWidth * 1.12, width * .54));
    // Older engines reserve the same projected height when they measure the panorama.
    measuredRoom?.style.setProperty("--aperture-height", `${Math.ceil(cardWidth * .75 * Math.hypot(1, width / (2 * focal)) + 2)}px`);
    // Keep the seven-photo rooms continuous even on shallow ultrawide screens.
    halfAngle = Math.atan(cardWidth / (2 * focal));
    // Place the next panel's near edge one CSS gap from the centered panel.
    stepAngle = halfAngle + Math.atan((cardWidth / 2 + gap) / focal);
    driftRate = angularSpeed / stepAngle;
    viewAngle = Math.atan(width / (2 * focal)) + halfAngle;
    // Trim the straight chords to one continuous, symmetrical aperture.
    const outline: string[] = [];
    const height = Math.max(1, stage.clientHeight);
    for (const edge of [-1, 1]) {
      for (let i = 0; i <= 32; i++) {
        const fraction = edge < 0 ? i / 32 : 1 - i / 32;
        const x = (fraction - .5) * width / focal;
        const halfHeight = cardWidth * .375 * Math.hypot(1, x) / height * 100;
        outline.push(`${fraction * 100}% ${50 + edge * halfHeight}%`);
      }
    }
    track.style.clipPath = `polygon(${outline.join(",")})`;
    render();
  }

  const canDrift = () => !motion.matches && !hovered && !keyboard && !paused;
  function refresh() {
    if (!visible || document.hidden || interacting || stage.hasAttribute("data-obscured") || (!canDrift() && goal === null && !velocity)) {
      cancelAnimationFrame(frame); frame = 0; previous = 0;
    } else if (!frame) frame = requestAnimationFrame(advance);
  }
  function advance(time: number) {
    frame = 0;
    const dt = previous ? Math.min(.04, (time - previous) / 1000) : 0;
    previous = time;
    if (goal !== null) {
      const diff = goal - position;
      position += diff * (1 - Math.pow(1 - scrollEase, dt * 40));
      if (Math.abs(diff) < .001 || motion.matches) { position = goal; goal = null; }
    } else if (velocity) {
      position += velocity * dt;
      velocity *= Math.exp(-5.7 * dt);
      if (Math.abs(velocity) < .012) velocity = 0;
    } else if (canDrift()) {
      position += dt * driftRate;
    }
    if (goal === null) position = wrap(position, cards.length);
    render(); refresh();
  }
  function focusCard(index: number) {
    velocity = 0;
    goal = position + distance(index, position, cards.length);
    resetMotion();
  }
  function resetMotion() {
    if (motion.matches) { velocity = 0; if (goal !== null) { position = goal; goal = null; render(); } }
    refresh();
  }
  bindHorizontalDrag(stage, signal, {
    begin() { interacting = true; keyboard = false; goal = null; velocity = 0; refresh(); },
    move(pixels, seconds) {
      const change = pixels / pitch;
      position = wrap(position + change, cards.length);
      velocity = .4 * velocity + .6 * Math.max(-9, Math.min(9, change / seconds));
      render();
    },
    end(coast) { interacting = false; velocity = coast && !motion.matches ? velocity * momentum : 0; refresh(); },
  });
  function hover(e: PointerEvent) {
    if (e.pointerType === "mouse") { hovered = e.type === "pointerenter"; refresh(); }
  }
  stage.addEventListener("pointerenter", hover, options);
  stage.addEventListener("pointerleave", hover, options);
  stage.addEventListener("focusin", e => { keyboard = (e.target as HTMLElement).matches(":focus-visible"); refresh(); }, options);
  stage.addEventListener("focusout", e => { if (!stage.contains(e.relatedTarget as Node | null)) { keyboard = false; refresh(); } }, options);
  stage.addEventListener("keydown", e => {
    const current = nearest(goal ?? position);
    if (e.key === " ") { e.preventDefault(); paused = !paused; keyboard = paused; hovered = false; refresh(); return; }
    if (e.key === "Enter" && e.target === stage) { e.preventDefault(); cards[current].click(); return; }
    const targets: Record<string, number> = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: cards.length - 1 };
    if (!(e.key in targets)) return;
    e.preventDefault(); keyboard = true;
    const index = wrap(targets[e.key], cards.length);
    focusCard(index); announcement.textContent = cards[index].getAttribute("aria-label");
  }, options);
  stage.addEventListener("wheel", e => {
    if (e.ctrlKey || (!e.shiftKey && Math.abs(e.deltaX) <= Math.abs(e.deltaY))) return;
    const amount = e.deltaX || e.deltaY;
    if (!amount) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? width : 1;
    goal = null; velocity = 0; position = wrap(position + amount * unit / pitch, cards.length);
    render(); refresh();
  }, { passive: false, signal });
  const resize = new ResizeObserver(measure);
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; refresh(); });
  stage.dataset.enhanced = "true";
  measure(); resize.observe(stage); observer.observe(stage);
  document.addEventListener("visibilitychange", refresh, options);
  motion.addEventListener("change", resetMotion, options);
  return { focusCard, refresh, destroy() {
    listeners.abort(); resize.disconnect(); observer.disconnect(); cancelAnimationFrame(frame);
    measuredRoom?.style.removeProperty("--aperture-height");
    delete stage.dataset.enhanced; delete stage.dataset.active;
    stage.classList.remove("is-dragging"); track.style.removeProperty("clip-path");
    activeCard?.classList.remove("is-current");
    for (const card of cards) {
      for (const key of ["transform", "visibility", "opacity"]) card.style.removeProperty(key);
    }
  } };
}
