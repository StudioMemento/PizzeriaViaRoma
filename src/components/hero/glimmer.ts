import { HERO_PRESET } from "./preset";
import { LOGO_MARK } from "./logoGeometry";

export type HeroGeometry = { width: number; height: number; x: number; y: number; logoWidth: number };

/** Project a seeded ring of gold dust around the visible mark. */
export function createGlimmer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;
  const p = HERO_PRESET.glimmer;
  let seed = 23451;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
  const points = Array.from({ length: p.count }, () => ({
    angle: random() * Math.PI * 2, start: random(), phase: random() * Math.PI * 2,
    size: .65 + random() ** 2 * p.sizeVariance, rate: .75 + random() * .5,
    color: random() < .55 ? 0 : 1,
  }));
  const sprites = p.colors.map(color => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 24;
    const c = sprite.getContext("2d")!;
    const glow = c.createRadialGradient(12, 12, 0, 12, 12, 12);
    glow.addColorStop(0, color); glow.addColorStop(.36, color + "ee");
    glow.addColorStop(.7, color + "67"); glow.addColorStop(1, color + "00");
    c.fillStyle = glow; c.fillRect(0, 0, 24, 24);
    return sprite;
  });
  let g: HeroGeometry = { width: 1, height: 1, x: 0, y: 0, logoWidth: 1 };
  let hollow = 1, extent = 1, travel = 0, lastTime = 0, speed = 1;
  let held = false, waveAt = -10, waveX = 0, waveY = 0;
  const resize = (next: HeroGeometry) => {
    g = next;
    const dpr = Math.min(window.devicePixelRatio || 1, HERO_PRESET.maxPixelRatio);
    canvas.width = Math.round(g.width * dpr); canvas.height = Math.round(g.height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    hollow = g.logoWidth * LOGO_MARK.radius * (p.hollow * 2);
    extent = Math.max(1, Math.hypot(Math.max(g.x, g.width - g.x), Math.max(g.y, g.height - g.y)) * (1 + p.spread * .25) - hollow);
    canvas.dataset.centerX = g.x.toFixed(2); canvas.dataset.centerY = g.y.toFixed(2);
    canvas.dataset.hollowRadius = hollow.toFixed(2);
  };
  const draw = (seconds: number) => {
    const dt = Math.max(0, seconds - lastTime);
    lastTime = seconds;
    speed += ((held ? p.boost : 1) - speed) * (1 - Math.exp(-dt * 8));
    travel += dt * speed * p.speed * .085;
    const waveAge = seconds - waveAt;
    const waveRadius = waveAge >= 0 && waveAge < 1.15 ? waveAge * (extent + hollow) * 1.65 : -1;
    ctx.clearRect(0, 0, g.width, g.height);
    for (const dot of points) {
      const z = (dot.start + travel * dot.rate) % 1;
      const perspective = z * z * p.perspective;
      const distance = extent * (.22 * z + .78 * perspective);
      const bend = Math.sin(dot.phase + 6 * z + seconds * .22);
      const angle = dot.angle + p.twist * (.44 * z + p.turbulence * .12 * bend);
      const cos = Math.cos(angle), sin = Math.sin(angle);
      const radius = hollow + 2 + distance;
      const x = g.x + cos * radius, y = g.y + sin * radius;
      if (x < -6 || x > g.width + 6 || y < -6 || y > g.height + 6) continue;
      const twinkle = 1 - p.twinkle * (.33 + .33 * Math.sin(dot.phase + seconds * (1.2 + dot.rate) + z * 4));
      const edge = Math.min(1, distance / 9, (1 - z) * 14);
      const wave = waveRadius < 0 ? 0 : Math.max(0, 1 - Math.abs(Math.hypot(x - waveX, y - waveY) - waveRadius) / 47);
      const alpha = Math.min(1, (.46 + .33 * z) * twinkle * p.brightness + wave * .42) * edge;
      const core = p.size * dot.size * (.88 + 2.2 * perspective);
      const size = core * (1.6 + Math.abs(z - p.focus) * p.aperture * 9);
      const sprite = sprites[dot.color];
      if (z > .52) {
        const tail = core * p.trail * 5 * speed;
        ctx.globalAlpha = alpha * .28;
        ctx.drawImage(sprite, x - cos * tail - size / 2, y - sin * tail - size / 2, size, size);
      }
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;
  };
  return { resize, draw,
    press(x: number, y: number) {
      held = true;
      if (p.waves) { waveAt = lastTime; waveX = x; waveY = y; }
    },
    release() { held = false; },
  };
}
