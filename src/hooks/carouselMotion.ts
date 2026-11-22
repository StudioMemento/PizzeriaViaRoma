export type Motion = { position: number; velocity: number; target: null | { from: number; to: number; elapsed: number; duration: number; tangent: number } };
export const createMotion = (): Motion => ({ position: 0, velocity: 0, target: null });
export const loopDistance = (item: number, position: number, count: number) => ((item - position + count / 2) % count + count) % count - count / 2;
export const smoothstep = (n: number) => { const x = Math.max(0, Math.min(1, n)); return x * x * (3 - 2 * x); };
export const captionOpacity = (distance: number) => 1 - smoothstep((Math.abs(distance) - .36) / .28);

export const sideScale = 0.68;
export const sideGap = 16;

/** The two central gaps accommodate the arrows. Outer plates follow a tighter pitch. */
export function carouselWindow(viewportWidth: number, cardWidth: number, count: number) {
  const width = Math.max(1, cardWidth);
  const lane = Math.max(48, Math.min(viewportWidth / 16, 104));
  const step = width * sideScale + sideGap;
  const focusStep = width * (1 + sideScale) / 2 + lane;
  const radius = (Math.max(1, viewportWidth) / 2 + width / 2) / step + 1;
  return { step, focusStep, radius, renderCount: Math.max(count, Math.ceil(radius * 2 / count) * count), preload: Math.ceil(radius) + 2 };
}

export function pizzaPose(distance: number, step: number, focusStep: number) {
  const u = Math.min(1, Math.abs(distance));
  const near = Math.sign(distance) * (u + u * u * (1 - u));
  const focus = 1 - smoothstep(Math.abs(distance));
  return {
    x: distance * step + near * (focusStep - step),
    scale: sideScale + (1 - sideScale) * focus,
    opacity: 0.7 + 0.3 * focus,
  };
}

/** Project recent finger speed in plates per second, then choose a whole pizza. */
export function releaseTarget(position: number, speed: number) {
  return Math.round(position + speed * .36);
}

export function seek(m: Motion, to: number, immediate = false, speed = m.velocity) {
  const distance = to - m.position;
  if (immediate || Math.abs(distance) < .0001) {
    m.position = to; m.velocity = 0; m.target = null; return;
  }
  const along = Math.max(0, speed * Math.sign(distance));
  const duration = along > .5
    ? Math.max(.26, Math.min(1.05, 2.4 * Math.abs(distance) / along))
    : Math.min(.95, .46 + Math.abs(distance) * .11);
  const tangent = Math.min(3, along * duration / Math.abs(distance));
  m.target = { from: m.position, to, elapsed: 0, duration, tangent };
}

/** A monotone Hermite curve inherits release speed and reaches its center at zero speed. */
export function advance(m: Motion, dt: number) {
  const t = m.target;
  if (!t) return false;
  t.elapsed += dt;
  const x = Math.min(1, t.elapsed / t.duration);
  const rest = 1 - x, distance = t.to - t.from;
  m.position = t.from + distance * (smoothstep(x) + t.tangent * x * rest * rest);
  m.velocity = distance / t.duration * rest * (6 * x + t.tangent * (1 - 3 * x));
  if (x === 1) { m.position = t.to; m.velocity = 0; m.target = null; }
  return !!m.target;
}
