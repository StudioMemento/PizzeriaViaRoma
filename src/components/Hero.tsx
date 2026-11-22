import { useRef } from "react";
import { useI18n } from "../i18n";
import { Chevron } from "./Icon";
import { useHeroEffects } from "./hero/useHeroEffects";
export default function Hero() {
  const { t } = useI18n();
  const section = useRef<HTMLElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const particles = useRef<HTMLCanvasElement>(null);
  const liquid = useRef<HTMLCanvasElement>(null);
  useHeroEffects(section, logo, particles, liquid);
  const lines = t.tagline.replace(/<[^>]+>/g, "|").split("|").filter(Boolean);
  return <section ref={section} id="home" className="vr-hero" aria-label="Pizzeria Via Roma" data-fx-state="static">
    <canvas ref={particles} className="hero-glimmer" aria-hidden="true" />
    <div className="hero-composition">
      <div ref={logo} className="hero-logo">
        <img src="/assets/logo.png" alt="Pizzeria Via Roma" width="851" height="851" fetchPriority="high" />
        <canvas ref={liquid} className="hero-liquid" aria-hidden="true" />
      </div>
      <h1 className="hero-slogan">{lines.map(line => <span key={line}>{line}</span>)}</h1>
    </div>
    <div className="hero-cue-space"><a className="hero-down" href="#pizza-slider" aria-label={t.strip_k}><Chevron /></a></div>
  </section>;
}
