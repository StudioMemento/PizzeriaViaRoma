import { useEffect, useRef } from "react";

type Enhancement = (element: HTMLDivElement) => () => void;

/** Load a progressive enhancement when its host approaches the viewport. */
export function useOnApproach(load: () => Promise<Enhancement>, rootMargin = "300px 0px") {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let active = true;
    let dispose: (() => void) | undefined;
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      near.disconnect();
      void load().then(mount => {
        if (active) dispose = mount(element);
      }).catch(() => { /* The underlying content remains interactive. */ });
    }, { rootMargin });
    near.observe(element);
    return () => { active = false; near.disconnect(); dispose?.(); };
  }, [load, rootMargin]);
  return ref;
}
