import { SIDE_SQUARES as preset } from "./preset";

export type Square = {
  x: number;
  y: number;
  size: number;
  peak: number;
  phase: number;
  rate: number;
};

/** Deterministic fields avoid random flashes on remount and on resize. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

const smoothstep = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

export function createSquares(width: number, height: number, seed: number) {
  const spread = Math.min(width, preset.maxFieldWidth);
  const chance = random(seed);
  const squares: Square[] = [];
  let candidates = 0;
  // Fixed row/column centers. Random occupancy and brightness provide the
  // falloff; the whole lattice travels together without disturbing its alignment.
  for (let y = preset.spacing / 2; y + preset.maxSize / 2 <= height; y += preset.spacing) {
    for (let x = preset.spacing / 2; x + preset.maxSize / 2 <= spread; x += preset.spacing) {
      const distance = x / spread;
      if (chance() > (1 - distance) ** preset.falloff) continue;
      candidates++;
      // Reservoir sampling caps large fields without truncating their bottom.
      const slot = squares.length < preset.maxSquaresPerSide
        ? squares.length : Math.floor(chance() * candidates);
      if (slot >= preset.maxSquaresPerSide) continue;
      const size = preset.minSize + (preset.maxSize - preset.minSize) * chance() ** 2;
      const innerFade = 1 - smoothstep((distance - preset.fadeStart) / (1 - preset.fadeStart));
      squares[slot] = {
        x: x - size / 2,
        y: y - size / 2,
        size,
        peak: (preset.minPeak + (preset.maxPeak - preset.minPeak) * chance() ** 1.5) * innerFade,
        phase: chance() * Math.PI * 2,
        rate: Math.PI * 2 / (preset.minCycle + (preset.maxCycle - preset.minCycle) * chance()),
      };
    }
  }
  return squares;
}

export function brightness(square: Square, seconds: number) {
  const wave = 0.5 + 0.5 * Math.sin(square.phase + seconds * square.rate);
  return square.peak * (.12 + .88 * wave * wave);
}

export function pixelRatio(width: number, height: number, deviceRatio: number) {
  return Math.min(deviceRatio || 1, preset.maxDpr, Math.sqrt(preset.maxPixels / (2 * width * height)));
}

/** Pixel-aligned geometry and reusable opacity buckets; no per-frame allocation. */
export function createPainter(context: CanvasRenderingContext2D, squares: Square[], width: number, height: number, mirrored: boolean, scaleX = 1, scaleY = scaleX) {
  const pixelsWide = Math.max(1, Math.round(width * scaleX));
  const pixelsHigh = Math.max(1, Math.round(height * scaleY));
  // Round once to backing pixels: a fine dot stays crisp instead of spreading
  // its light over four dim pixels. Wrap the tile at a whole number of rows.
  const rectangles = squares.map(square => {
    const w = Math.min(pixelsWide, Math.max(1, Math.round(square.size * scaleX)));
    const h = Math.min(pixelsHigh, Math.max(1, Math.round(square.size * scaleY)));
    const fromEdge = Math.round(square.x * scaleX);
    return {
      x: Math.max(0, Math.min(pixelsWide - w, mirrored ? pixelsWide - fromEdge - w : fromEdge)),
      y: Math.max(0, Math.min(pixelsHigh - h, Math.round(square.y * scaleY))),
      w, h,
    };
  });
  const counts = new Uint16Array(32);
  const indices = new Uint16Array(32 * squares.length);
  // Geometry is already in physical pixels. No fractional transform at paint time.
  context.setTransform(1, 0, 0, 1, 0, 0);
  return (seconds: number, offset = 0) => {
    const shift = Math.round(offset * scaleY) % pixelsHigh;
    context.clearRect(0, 0, pixelsWide, pixelsHigh);
    counts.fill(0);
    for (let i = 0; i < squares.length; i++) {
      const level = Math.round(brightness(squares[i], seconds) * 31);
      if (level) indices[level * squares.length + counts[level]++] = i;
    }
    context.fillStyle = preset.squareColor;
    for (let level = 1; level < counts.length; level++) {
      if (!counts[level]) continue;
      context.globalAlpha = level / 31;
      context.beginPath();
      for (let n = 0; n < counts[level]; n++) {
        const rect = rectangles[indices[level * squares.length + n]];
        const y = (rect.y - shift + pixelsHigh) % pixelsHigh;
        context.rect(rect.x, y, rect.w, rect.h);
      }
      context.fill();
    }
    context.globalAlpha = 1;
  };
}
