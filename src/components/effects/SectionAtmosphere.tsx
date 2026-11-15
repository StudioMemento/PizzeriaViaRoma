import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from "react";
import { useEffectActivity } from "./useEffectActivity";
import { useFieldBudget } from "./useFieldBudget";
import { useMedia } from "../../hooks/useMedia";
import ParticleStill from "./ParticleStill";
import type { ParticlesLayout } from "../../vendor/react-bits/Particles";

const Particles = lazy(() => import("../../vendor/react-bits/Particles"));
export type AtmosphereVariant = "hero" | "oven" | "crust" | "categories" | "menu" | "gallery" | "community" | "social" | "info";

// Frozen V21 menu output. No V22 classes, fields, canvas, or style attributes.
function MenuAtmosphere({ seed }: { seed: number }) {
  const root = useRef<HTMLDivElement>(null);
  const { active } = useEffectActivity(root);
  return <div ref={root} className="vr-atmosphere vr-atmosphere--menu" data-active={active ? "true" : "false"} data-seed={seed % 5} style={{ "--atmosphere-turn": `${seed * 23}deg` } as CSSProperties} aria-hidden="true">
    <div className="atmosphere-wash" />
    <div className="atmosphere-haze haze-a" />
    <div className="atmosphere-haze haze-b" />
    <div className="atmosphere-edge" />
  </div>;
}
const layouts: Record<Exclude<AtmosphereVariant, "menu">, ParticlesLayout> = {
  hero: "halo", oven: "horizon", crust: "embers", categories: "diagonal", gallery: "edge", community: "horizon", social: "curtain", info: "diagonal",
};
function NewAtmosphere({ variant, seed }: { variant: Exclude<AtmosphereVariant, "menu">; seed: number }) {
  const root = useRef<HTMLDivElement>(null);
  const { active } = useEffectActivity(root);
  const selected = useFieldBudget(root, active);
  const mobile = useMedia("(max-width:700px)");
  // The image carousel gets GPU priority in the Community chapter.
  const live = selected && variant !== "community";
  const [gpuReady, setGpuReady] = useState(false);
  const entered = useRef(false);
  useEffect(() => {
    if (live) return () => { entered.current = true; };
  }, [live]);
  const hero = variant === "hero";
  return <div ref={root} className={`vr-atmosphere vr-atmosphere--${variant} vr-atmosphere-v22 vr22-${variant}`} data-active={active ? "true" : "false"} data-live={live && gpuReady ? "true" : "false"} data-budget-selected={selected ? "true" : "false"} data-seed={seed % 5} aria-hidden="true">
    <div className="vr22-field-stage">
      <ParticleStill variant={variant} seed={seed} />
      {live && <Suspense fallback={null}>
        <Particles
          className="vr22-particles"
          onReady={setGpuReady}
          layout={layouts[variant]}
          particleCount={hero ? (mobile ? 420 : 820) : mobile ? 150 : 290}
          particleColors={["#92743b", "#bd9b54", "#dec17e", "#fae7b5"]}
          particleSpread={mobile ? 2.2 : 3}
          cameraDistance={22}
          particleBaseSize={hero ? 42 : 28}
          sizeRandomness={1.4}
          speed={hero ? .11 : .07}
          wobble={hero ? .055 : .07}
          glow={.48}
          twinkle={.16}
          depthOfField={.035}
          disableRotation
          moveParticlesOnHover={hero && !mobile}
          particleHoverFactor={.07}
          connections={false}
          clickBurst={false}
          opacity={hero ? .92 : .4}
          pixelRatio={mobile ? 1 : 1.1}
          maxFps={30}
          variation={seed + 22}
          intro={hero && !entered.current}
        />
      </Suspense>}
    </div>
    <div className="vr22-edge-fade" />
  </div>;
}
export default function SectionAtmosphere({ variant, seed = 0 }: { variant: AtmosphereVariant; seed?: number }) {
  return variant === "menu" ? <MenuAtmosphere seed={seed} /> : <NewAtmosphere variant={variant} seed={seed} />;
}
