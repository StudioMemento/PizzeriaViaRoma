/** ViaRoma_1_HERO: all motion/color controls in one place. */
export const HERO_PRESET = {
  glimmer: {
    colors: ["#c6ab70", "#dac18b"], count: 1500, size: 1, sizeVariance: 1,
    brightness: 1, spread: .5, hollow: .5, perspective: 1, speed: .25,
    twist: 1, turbulence: .5, trail: .1, twinkle: 1, focus: .5, aperture: .25,
    boost: 4, waves: true,
  },
  liquid: { density: 2.6, softness: 1, distortion: 0.22, angle: 70, speed: 1,
    // Chromatic dispersion / edge bending intentionally zero: preserve the mark.
    minimumGrey: 0.62, maximumWhite: 1, pointerInfluence: 0.08,
    gold: [198 / 255, 171 / 255, 112 / 255],
    highlight: [218 / 255, 193 / 255, 139 / 255] },
  desktopFps: 40, mobileFps: 30, maxPixelRatio: 1.5,
} as const;
