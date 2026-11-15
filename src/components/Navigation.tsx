import { useEffect, useRef, useState } from "react";
import { languages, useI18n } from "../i18n";
import { Icon } from "./Icon";
import GradualBlur from "../vendor/react-bits/GradualBlur";

type PagePosition = { active: string; progress: number; minimumProgress: number };
type PositionListener = (position: PagePosition) => void;
const positionListeners = new Set<PositionListener>();
let stopPositionSignal: (() => void) | undefined;
let latestPosition: PagePosition | undefined;

/** One passive scroll subscription for shared chrome. Layout is measured only
 * when page geometry changes; scrolling itself reads scrollY, then writes UI.
 * No continuous frame loop runs while the page is still or hidden.
 */
function subscribePagePosition(listener: PositionListener) {
  positionListeners.add(listener);
  if (!stopPositionSignal) {
    let frame = 0;
    let dirty = true;
    let disposed = false;
    let viewportHeight = 1;
    let scrollRange = 1;
    let landmarks: { id: string; top: number }[] = [];
    const flush = () => {
      frame = 0;
      if (disposed || document.hidden) return;
      const y = window.scrollY;
      if (dirty) {
        viewportHeight = Math.max(1, window.innerHeight);
        scrollRange = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
        landmarks = ["menu", "gallery", "dove"].flatMap((id) => {
          const element = document.getElementById(id);
          return element ? [{ id, top: element.getBoundingClientRect().top + y }] : [];
        });
        dirty = false;
      }
      let active = "home";
      const marker = y + viewportHeight * 0.45;
      for (const landmark of landmarks) if (landmark.top <= marker) active = landmark.id;
      const position = {
        active,
        progress: scrollRange > 0 ? Math.max(0, Math.min(1, y / scrollRange)) : 0,
        minimumProgress: Math.min(1, 24 / viewportHeight),
      };
      latestPosition = position;
      for (const notify of positionListeners) notify(position);
    };
    const queue = () => {
      if (!disposed && !document.hidden && !frame) frame = requestAnimationFrame(flush);
    };
    const measure = () => { dirty = true; queue(); };
    const visibility = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      if (!document.hidden) measure();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    for (const id of ["menu", "gallery", "dove"]) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure, { once: true });
    document.addEventListener("visibilitychange", visibility);
    void document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();
    stopPositionSignal = () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
      document.removeEventListener("visibilitychange", visibility);
    };
  }
  if (latestPosition) listener(latestPosition);
  return () => {
    positionListeners.delete(listener);
    if (!positionListeners.size) {
      stopPositionSignal?.();
      stopPositionSignal = undefined;
      latestPosition = undefined;
    }
  };
}

export function Header() {
  const { language, setLanguage, copy } = useI18n();
  return (
    <>
      <GradualBlur
        position="top"
        target="page"
        height="144px"
        strength={1.1}
        layers={4}
        tint="#09090b90"
        zIndex={40}
        className="page-edge-blur top-edge"
      />
      <header className="site-top">
        <a
          className="site-brand"
          href="#home"
          aria-label="Pizzeria Via Roma — home"
        >
          <img
            src="/assets/flame.png"
            width="42"
            height="46"
            alt="Pizzeria Via Roma"
          />
        </a>
        <div className="lang" role="group" aria-label={copy.changeLanguage}>
          {languages.map((l) => (
            <button
              key={l}
              type="button"
              data-lang={l}
              className={language === l ? "on" : ""}
              onClick={() => setLanguage(l)}
              aria-pressed={language === l}
              lang={l}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </header>
    </>
  );
}
export function Dock() {
  const { t, copy } = useI18n();
  const [active, setActive] = useState("home");
  const activeRef = useRef("home");
  useEffect(() => {
    return subscribePagePosition(({ active: next }) => {
      if (next !== activeRef.current) { activeRef.current = next; setActive(next); }
    });
  }, []);
  return (
    <>
      <GradualBlur
        position="bottom"
        target="page"
        height="190px"
        strength={1.3}
        layers={4}
        tint="#09090b90"
        zIndex={40}
        className="page-edge-blur bottom-edge"
      />
      <nav className="vr-dock" aria-label={copy.navigation}>
        {[
          { id: "menu", icon: "fork-knife", label: t.tab_menu },
          { id: "gallery", icon: "fire", label: t.tab_storia },
          { id: "dove", icon: "info", label: t.tab_dove },
          { id: "call", icon: "phone", label: t.tab_chiama },
        ].map((x) => (
          <a
            key={x.id}
            href={x.id === "call" ? "tel:+390427541232" : `#${x.id}`}
            aria-current={active === x.id ? "location" : undefined}
          >
            <span className="dock-tile">
              <Icon name={x.icon} />
            </span>
            <span className="dock-label">{x.label}</span>
          </a>
        ))}
      </nav>
    </>
  );
}
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let previous = "";
    return subscribePagePosition(({ progress, minimumProgress }) => {
      const element = ref.current;
      if (!element) return;
      const scale = Math.max(minimumProgress, progress).toFixed(5);
      if (scale === previous) return;
      previous = scale;
      element.style.transform = `scaleY(${scale})`;
      element.dataset.progress = progress.toFixed(4);
    });
  }, []);
  return <div className="scroll-progress" ref={ref} aria-hidden="true" />;
}
