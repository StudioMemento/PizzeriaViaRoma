import { useMemo, useState } from "react";
import data from "../data/photos.json";
import imageData from "../data/images.json";
import { useI18n } from "../i18n";
import { wrap } from "../hooks/useDrag";
import { Chevron, ExpandIcon } from "./Icon";
import { useDialog } from "./DialogContext";
import AccordionGallery from "../vendor/galleries/AccordionGallery";
import SectionAtmosphere from "./effects/SectionAtmosphere";
const albumOrder = ["esterno", "bancone", "sala_sinistra", "sala_destra", "via_roma"] as const;

function Album({ album, seed }: { album: (typeof albumOrder)[number]; seed: number }) {
  const { t, copy } = useI18n();
  const { open } = useDialog();
  const photos = data.GALLERY_ALBUMS[album];
  const title = t.g_categories[album];
  const [index, setIndex] = useState(0);
  const items = useMemo(() => photos.map((src, i) => {
    const meta = (imageData as Record<string, { small?: string; width: number }>)[src];
    return { image: `/${src}`, srcSet: meta?.small ? `/${meta.small} 768w, /${src} ${meta.width}w` : undefined, sizes: "(max-width: 700px) 70vw, 60vw", label: `${title} · ${i + 1} / ${photos.length}`, alt: `${title} · Via Roma · ${i + 1}` };
  }), [photos, title]);
  const show = (at: number) => open({ kind: "photo", photos: photos.map((src, i) => ({ src, caption: `${title} · ${i + 1} / ${photos.length}` })), index: at });
  return <section className="album vr-album" id={`album-${album}`} aria-labelledby={`title-${album}`}>
    <SectionAtmosphere variant="gallery" seed={seed} />
    <header className="album-heading"><p className="k-s">{String(seed + 1).padStart(2, "0")} / 05</p><h2 id={`title-${album}`}>{title}</h2></header>
    <div className="vr-album-frame" data-album={album} data-index={index}>
      <AccordionGallery items={items} activeIndex={index} onActiveChange={setIndex} onItemClick={(_, at) => show(at)} ariaLabel={title} radius={0} tilt={20} ease="power4.out" parallax={1} expandRatio={.6} gap={12} showLabels={false} grayscale height={460} className="vr-accordion" />
    </div>
    <div className="vr-album-controls">
      <div className="vr-carousel-controls">
        <button className="vr-carousel-arrow" type="button" aria-label={`${copy.previous} — ${title}`} onClick={() => setIndex(i => wrap(i - 1, photos.length))}><Chevron direction="left" /></button>
        <span className="vr-carousel-count" aria-live="polite">{String(index + 1).padStart(2, "0")}<span>/</span>{String(photos.length).padStart(2, "0")}</span>
        <button className="vr-carousel-arrow" type="button" aria-label={`${copy.next} — ${title}`} onClick={() => setIndex(i => wrap(i + 1, photos.length))}><Chevron direction="right" /></button>
      </div>
      <button className="vr-album-expand" type="button" aria-label={`${copy.expand}: ${title}`} onClick={() => show(index)}><ExpandIcon /><span>{copy.expand}</span></button>
    </div>
  </section>;
}
export default function Gallery() {
  const { copy } = useI18n();
  return <section id="gallery" className="room-gallery" aria-label={copy.gallery}>{albumOrder.map((album, seed) => <Album key={album} album={album} seed={seed} />)}</section>;
}
