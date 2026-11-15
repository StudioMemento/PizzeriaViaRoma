import { useEffect, type CSSProperties } from "react";
import { useCarousel } from "../../hooks/useCarousel";
import type { GalleryItem } from "./CircularGallery";

/** Functional DOM fallback for React Bits' flat (bend=0, wave=0) gallery preset. */
export default function FlatGalleryFallback({ items, autoScroll, showTitles, onItemClick, onActiveChange, label, enabled = true }: {
  items: GalleryItem[]; enabled?: boolean; autoScroll: number; showTitles: boolean; label?: string;
  onItemClick?: (item: GalleryItem, index: number) => void;
  onActiveChange?: (index: number) => void;
}) {
  const carousel = useCarousel(items.length, 700, .5);
  useEffect(() => { carousel.setPaused(autoScroll === 0); }, [autoScroll, carousel.setPaused]);
  useEffect(() => { onActiveChange?.(carousel.index); }, [carousel.index, onActiveChange]);
  useEffect(() => {
    const stage = carousel.stageRef.current;
    const focused = document.activeElement;
    if (!stage || focused === stage || !stage.contains(focused)) return;
    stage.querySelectorAll<HTMLButtonElement>('[data-carousel-card]')[carousel.index]?.focus({ preventScroll: true });
  }, [carousel.index, carousel.stageRef]);
  return <section ref={carousel.rootRef} {...carousel.rootBind} className="vr-flat-gallery" aria-label={label}>
    <div className="vr-flat-stage" ref={carousel.stageRef} {...carousel.bind} tabIndex={0} role="group" aria-label={label}>
      {items.map((item, logical) => {
        const offset = ((logical + items.length / 2) % items.length) - items.length / 2;
        return <button key={item.image} className={`vr-flat-card${logical === carousel.index ? " is-current" : ""}`} type="button" data-carousel-card tabIndex={logical === carousel.index ? 0 : -1} aria-label={`${item.text || item.alt} · ${logical + 1} / ${items.length}`} style={{ "--slide-x": `${offset * 300}px`, "--slide-distance": Math.abs(offset) } as CSSProperties} onClick={() => onItemClick?.(item, logical)}>
          <img src={enabled && carousel.isLoaded(logical) ? item.image : undefined} alt={item.alt || item.text || ""} draggable={false} loading="lazy" decoding="async" />
          {showTitles && <span>{item.text}</span>}
        </button>;
      })}
    </div>
  </section>;
}
