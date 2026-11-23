import { useEffect, useRef, useState } from "react";

export const categoryOrder = ["classiche", "audaci", "bianche", "calzoni", "cucina", "stuzzicherie", "dolci", "bevande"] as const;

export const categoryLabels = {
  it: ["Classiche", "Audaci", "Bianche", "Calzoni", "Cucina", "Snack", "Dolci", "Bevande"],
  en: ["Classiche", "Audaci", "Bianche", "Calzoni", "Kitchen", "Snacks", "Desserts", "Drinks"],
  de: ["Classiche", "Audaci", "Bianche", "Calzoni", "Küche", "Snacks", "Desserts", "Getränke"],
  fr: ["Classiche", "Audaci", "Bianche", "Calzoni", "Cuisine", "Snacks", "Desserts", "Boissons"],
};

const behavior = () => matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" as const : "smooth" as const;

/** Fade the clipped pill itself: masking the rail also isolates its backdrop blur. */
export function chipEdgeMask(left: number, width: number, railWidth: number, canLeft: boolean, canRight: boolean) {
  if (left + width <= 0 || left >= railWidth) return "none";
  const fade = 20;
  const atLeft = canLeft && left < fade;
  const atRight = canRight && left + width > railWidth - fade;
  if (!atLeft && !atRight) return "none";
  const start = atLeft ? `transparent ${-left}px, #000 ${fade - left}px` : "#000 0%";
  const end = atRight ? `#000 ${railWidth - fade - left}px, transparent ${railWidth - left}px` : "#000 100%";
  return `linear-gradient(90deg, ${start}, ${end})`;
}

export function useMenuNavigation(language: string) {
  const [active, setActive] = useState<string>("classiche");
  const chips = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const top = Math.min(150, window.innerHeight / 3);
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting)
          setActive(entry.target.id);
      }, { rootMargin: `-${top}px 0px -${Math.max(0, window.innerHeight - top - 2)}px 0px` });
      document.querySelectorAll(".mcat").forEach(el => observer.observe(el));
    };
    observe();
    window.addEventListener("resize", observe, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener("resize", observe); };
  }, []);
  useEffect(() => {
    const rail = chips.current;
    if (!rail) return;
    const selected = rail.querySelector<HTMLElement>(`[data-go="${active}"]`);
    let railWidth = 0;
    let maxScroll = 0;
    let geometry: { el: HTMLElement; left: number; width: number; mask: string }[] = [];
    const check = () => {
      // Clamp Safari rubber-band values and fractional rounding at either end.
      const x = Math.max(0, Math.min(rail.scrollLeft, maxScroll));
      const canLeft = x > 1;
      const canRight = x < maxScroll - 1;
      wrap.current?.classList.toggle("can-l", canLeft);
      wrap.current?.classList.toggle("can-r", canRight);
      for (const item of geometry) {
        const mask = chipEdgeMask(item.left - x, item.width, railWidth, canLeft, canRight);
        if (mask !== item.mask) {
          item.el.style.setProperty("--chip-edge", mask);
          item.mask = mask;
        }
      }
    };
    const measure = () => {
      railWidth = rail.clientWidth;
      maxScroll = Math.max(0, rail.scrollWidth - railWidth);
      geometry = Array.from(rail.children, el => {
        const button = el as HTMLElement;
        return { el: button, left: button.offsetLeft, width: button.offsetWidth, mask: "" };
      });
      const item = geometry.find(item => item.el === selected);
      if (item) {
        const x = Math.max(0, Math.min(item.left - (railWidth - item.width) / 2, maxScroll));
        // Endpoints must land exactly at zero/max; do not retain a fractional clip.
        rail.scrollTo({ left: x, behavior: behavior() });
      }
      check();
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(rail);
    // Translations and font loading also change overflow when rail width is fixed.
    Array.from(rail.children).forEach(el => observer.observe(el));
    rail.addEventListener("scroll", check, { passive: true });
    return () => {
      observer.disconnect(); rail.removeEventListener("scroll", check);
      for (const item of geometry) item.el.style.removeProperty("--chip-edge");
    };
  }, [active, language]);
  const select = (id: string) => {
    if (location.hash !== `#${id}`) history.pushState(null, "", `#${id}`);
    document.getElementById(id)?.scrollIntoView({ behavior: behavior() });
    setActive(id);
  };
  const nudge = (direction: number) => chips.current?.scrollBy({ left: direction * Math.max(160, chips.current.clientWidth * .65), behavior: behavior() });
  return { active, chips, wrap, select, nudge };
}
