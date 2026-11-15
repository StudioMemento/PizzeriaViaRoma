import { useEffect, useRef } from "react";
import { useI18n } from "../i18n";
import { Chevron } from "./Icon";
import ShinyText from "../vendor/react-bits/ShinyText";
import SectionAtmosphere from "./effects/SectionAtmosphere";
import { useEffectActivity } from "./effects/useEffectActivity";

export default function Hero() {
  const { t } = useI18n();
  const section = useRef<HTMLElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const { active, reduced } = useEffectActivity(section);
  const lines = t.tagline.replace(/<[^>]+>/g, "|").split("|").filter(Boolean);
  useEffect(() => {
    const root = section.current, emblem = logo.current;
    if (!root || !emblem) return;
    const measure = () => {
      const box = root.getBoundingClientRect(), mark = emblem.getBoundingClientRect();
      root.style.setProperty("--hero-orbit-y", `${mark.top - box.top + mark.height / 2}px`);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root); observer.observe(emblem); measure();
    return () => observer.disconnect();
  }, []);
  return <section id="home" ref={section} className="vr-hero vr-hero-v22" aria-label="Pizzeria Via Roma" data-fx-active={active}>
    <SectionAtmosphere variant="hero" />
    <div className="hero-composition">
      <p className="hero-location">{t.sp_kicker}</p>
      <div className="hero-logo-fx" ref={logo}
        onPointerMove={(e) => {
          if (reduced || e.pointerType !== "mouse" || !logo.current) return;
          const b = e.currentTarget.getBoundingClientRect();
          logo.current.style.setProperty("--logo-x", `${((e.clientX - b.left) / b.width - .5) * 3}deg`);
          logo.current.style.setProperty("--logo-y", `${-((e.clientY - b.top) / b.height - .5) * 3}deg`);
        }}
        onPointerLeave={() => { logo.current?.style.setProperty("--logo-x", "0deg"); logo.current?.style.setProperty("--logo-y", "0deg"); }}
      >
        <img className="hero-logo" src="/assets/logo.png" alt="Pizzeria Via Roma" width="851" height="851" fetchPriority="high" />
        <span className="hero-logo-sheen" aria-hidden="true">
          <ShinyText className="logo-glint" text=" " color="rgba(198,171,112,0)" shineColor="#f4d99b" trigger="view" speed={2.8} shineWidth={18} softness={.9} angle={125} direction="right" disabled={reduced} />
        </span>
      </div>
      <h1 className="hero-slogan">
        {lines.map((line, i) => <span className="hero-slogan-line" key={line} style={{ animationDelay: `${260 + i * 120}ms` }}>
          <ShinyText text={line} color="#f0ece3" shineColor="#fff6dc" trigger="view" speed={3.4} shineWidth={28} softness={.95} angle={120} direction="right" disabled={reduced} />
        </span>)}
      </h1>
      <a className="hero-cta text-link" href="#menu"><span>{t.home_cta}</span><Chevron /></a>
    </div>
  </section>;
}
