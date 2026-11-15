import { useEffect, useRef, useState, type RefObject } from "react";

type Candidate = { area: number; set: (value: boolean) => void };
const candidates = new Map<symbol, Candidate>();
let pending = 0;
function choose() {
  pending = 0;
  let best: symbol | null = null;
  let largest = 0;
  for (const [id, c] of candidates) {
    if (c.area > largest) { largest = c.area; best = id; }
  }
  // Always notify: a StrictMode/HMR remount may replace the setter for the
  // same selected key while its local React state has reset.
  for (const [id, c] of candidates) c.set(id === best);
}
function schedule() { if (!pending) pending = requestAnimationFrame(choose); }
/** One dominant visible decorative field may own a WebGL canvas at a time. */
export function useFieldBudget(ref: RefObject<HTMLElement | null>, enabled: boolean) {
  const id = useRef(Symbol("via-roma-field"));
  const [selected, setSelected] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) { setSelected(false); return; }
    const key = id.current;
    candidates.set(key, { area: 0, set: setSelected });
    schedule();
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      const item = candidates.get(key);
      if (item) item.area = entry.isIntersecting ? entry.intersectionRect.width * entry.intersectionRect.height : 0;
      schedule();
    }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] });
    observer.observe(element);
    return () => { observer.disconnect(); candidates.delete(key); schedule(); };
  }, [enabled, ref]);
  return selected && enabled;
}
