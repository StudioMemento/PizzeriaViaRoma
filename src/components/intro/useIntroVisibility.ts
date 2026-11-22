import { useEffect, useRef } from "react";

/** Pause the shared hero text effect outside this section and in hidden tabs. */
export function useIntroVisibility() {
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const sync = () => { el.dataset.fxState = visible && !document.hidden && !media.matches ? "running" : "paused"; };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    observer.observe(el);
    document.addEventListener("visibilitychange", sync); media.addEventListener("change", sync);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", sync); media.removeEventListener("change", sync); };
  }, []);
  return section;
}
