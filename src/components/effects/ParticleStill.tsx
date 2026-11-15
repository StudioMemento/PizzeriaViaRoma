import { memo, useId } from "react";
import type { AtmosphereVariant } from "./SectionAtmosphere";

/** Deterministic, still gold geometry also remains available without WebGL. */
export default memo(function ParticleStill({ variant, seed }: { variant: AtmosphereVariant; seed: number }) {
  const hero = variant === "hero";
  const gradient = `vr22-spark-${useId().replace(/:/g, "")}`;
  const total = hero ? 420 : 92;
  let state = 241 + seed * 37;
  const rand = () => { state = (state * 1664525 + 1013904223) >>> 0; return state / 4294967296; };
  const points = Array.from({ length: total }, (_, i) => {
    const a = hero && i % 5 < 3 ? rand() * 1.7 + (i % 2 ? .15 : 3.3) : rand() * Math.PI * 2;
    let x = 0, y = 0;
    if (hero) {
      const r = 1 + (rand() + rand() - 1) * .1;
      x = 500 + Math.cos(a) * 455 * r;
      y = 350 + Math.sin(a) * 275 * r + (x - 500) * .13;
    } else if (variant === "oven" || variant === "community") {
      x = rand() * 1000; y = 530 + Math.sin(x / 150) * 14 + (rand() - .5) * 15;
    } else if (variant === "social") {
      x = 700 + rand() * 300; y = rand() * 700;
    } else if (variant === "crust" || variant === "gallery") {
      x = i % 2 ? rand() * 100 : 900 + rand() * 100; y = rand() * 700;
    } else {
      x = rand() * 1000; y = 520 - x * .35 + (rand() - .5) * 22;
    }
    const radius = hero ? (i % 19 === 0 ? 3.2 : .8 + rand() * 1.1) : .7 + rand() * .9;
    // Sub-pixel SVG precision is invisible at this viewBox; keep prerender compact.
    const cx = Math.round(x * 100) / 100, cy = Math.round(y * 100) / 100;
    const r = Math.round(radius * 100) / 100;
    const opacity = Math.round((.4 + rand() * .6) * 1000) / 1000;
    return <g key={i}>
      {hero && i % 7 === 0 && <circle cx={cx} cy={cy} r={Math.round(radius * 500) / 100} fill={`url(#${gradient})`} opacity={.55} />}
      <circle cx={cx} cy={cy} r={r} fill={i % 6 === 0 ? "#f8dfaa" : "#c8a65e"} opacity={opacity} />
    </g>;
  });
  return <svg className="vr22-still-field" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs><radialGradient id={gradient}><stop offset="0" stopColor="#e5c276" stopOpacity=".6" /><stop offset=".38" stopColor="#d7ae58" stopOpacity=".18" /><stop offset="1" stopColor="#c5a05b" stopOpacity="0" /></radialGradient></defs>
    {points}
  </svg>;
});
