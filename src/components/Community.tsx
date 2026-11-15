import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import data from "../data/photos.json";
import imageData from "../data/images.json";
import { useI18n } from "../i18n";
import { useDialog } from "./DialogContext";
import { useMedia } from "../hooks/useMedia";
const CircularGallery = lazy(() => import("../vendor/galleries/CircularGallery"));
import SectionAtmosphere from "./effects/SectionAtmosphere";
import { interactionCopy } from "./IntroSliders";
export default function Community() {
  const { t, copy, language } = useI18n();
  const { open, modal } = useDialog();
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const reelRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const reel = reelRef.current;
    if (!reel) return;
    const near = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      setReady(true); near.disconnect();
    }, { rootMargin: "600px 0px" });
    near.observe(reel);
    return () => near.disconnect();
  }, []);
  const items = useMemo(() => data.CUSTOMER.map(c => ({ image: `/${(imageData as Record<string, { small?: string }>)[c.src]?.small || c.src}`, text: c.name, alt: `${t.cu_eyebrow} · ${c.name}` })), [t.cu_eyebrow]);
  const photos = useMemo(() => data.CUSTOMER.map(c => ({ src: c.src, caption: c.name })), []);
  const text = interactionCopy[language];
  return <section id="customer" className="vr-community">
    <SectionAtmosphere variant="community" />
    <header className="vr-community-heading"><p className="k-s">{t.cu_eyebrow}</p><h2>{t.cu_title}</h2><p className="lead">{copy.communityLead}</p></header>
    <div className="vr-community-reel" ref={reelRef}>
      {ready && <Suspense fallback={null}><CircularGallery items={items} bend={0} gap={0} fadeEdges={.2} scrollEase={.3} borderRadius={0} shadow={1} itemAspect={1} wave={0} snap={false} autoScroll={paused || reduce || modal ? 0 : .5} itemSize={1} scrollSpeed={2} openOnClick={false} onItemClick={(_, index) => open({ kind: "photo", photos, index })} onActiveChange={setActive} textColor="#dfd2b7" font="400 25px Jost" dpr={1.5} intro={!reduce} className="vr-circular-gallery" tabIndex={0} aria-label={t.cu_title} /></Suspense>}
    </div>
    <div className="vr-community-footer"><p className="vr-drag-cue"><span aria-hidden="true">↔</span>{text.drag}</p>
      <div className="vr-carousel-controls"><span className="vr-carousel-count">{String(active + 1).padStart(2, "0")}<span>/</span>{String(items.length).padStart(2, "0")}</span>
        {!reduce && <button type="button" className="vr-autoplay" aria-label={paused ? text.play : text.pause} aria-pressed={paused} onClick={() => setPaused(p => !p)}>{paused ? <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="m4 2 8 5-8 5V2Z" fill="currentColor" /></svg> : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4 2v10M10 2v10" stroke="currentColor" strokeWidth="1.5" /></svg>}</button>}
      </div>
    </div>
  </section>;
}
