import { useEffect, useState, type RefObject } from "react";

/** VFX activity is independent from scroll/navigation state. SSR remains static. */
export function useEffectActivity(ref: RefObject<HTMLElement | null>) {
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const update = () => {
      setReduced(media.matches);
      setActive(inView && document.visibilityState !== "hidden" && !media.matches);
    };
    const observer = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      update();
    }, { threshold: 0 });
    observer.observe(node);
    media.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    update();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, [ref]);
  return { active, reduced };
}
