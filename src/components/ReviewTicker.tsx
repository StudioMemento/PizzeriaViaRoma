import { useEffect, useRef, useState } from "react";
import data from "../data/reviews.json";
import { useI18n } from "../i18n";
import { Chevron } from "./Icon";

/** Native scroll + manual controls: review copy never moves by itself. */
export default function Reviews() {
  const { language, copy } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ id: number; x: number; y: number; left: number; active: boolean } | null>(null);
  const suppress = useRef(false);
  const [edges, setEdges] = useState({ first: true, last: false });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setEdges({ first: el.scrollLeft < 3, last: el.scrollLeft >= el.scrollWidth - el.clientWidth - 3 });
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    measure();
    return () => { ro.disconnect(); el.removeEventListener("scroll", measure); };
  }, []);
  const step = (direction: number) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".rev");
    el.scrollBy({ left: direction * ((card?.offsetWidth || el.clientWidth) + 18), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  };
  return (
    <div className="reviews-reader">
      <div className="review-track" id="reviewTrack" ref={ref} role="region" aria-label={copy.reviews} tabIndex={0}
        onKeyDown={e => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); step(e.key === "ArrowLeft" ? -1 : 1); } }}
        onPointerDown={e => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          suppress.current = false;
          pointer.current = { id: e.pointerId, x: e.clientX, y: e.clientY, left: e.currentTarget.scrollLeft, active: false };
        }}
        onPointerMove={e => {
          const p = pointer.current;
          if (!p || p.id !== e.pointerId) return;
          const dx = e.clientX - p.x, dy = e.clientY - p.y;
          if (!p.active && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { pointer.current = null; return; }
          if (!p.active && Math.abs(dx) > 8) { p.active = true; e.currentTarget.setPointerCapture(e.pointerId); e.currentTarget.classList.add("dragging"); }
          if (p.active) { e.preventDefault(); e.currentTarget.scrollLeft = p.left - dx; }
        }}
        onPointerUp={e => {
          const p = pointer.current;
          suppress.current = !!p?.active;
          pointer.current = null;
          e.currentTarget.classList.remove("dragging");
          if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
          if (p?.active && Math.abs(e.clientX - p.x) > 30) {
            const width = e.currentTarget.querySelector<HTMLElement>(".rev")?.offsetWidth || e.currentTarget.clientWidth;
            e.currentTarget.scrollTo({ left: p.left + (e.clientX < p.x ? 1 : -1) * (width + 18), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
          }
        }}
        onPointerCancel={e => { pointer.current = null; e.currentTarget.classList.remove("dragging"); }}
        onLostPointerCapture={e => { if (e.target === e.currentTarget) { pointer.current = null; e.currentTarget.classList.remove("dragging"); } }}
        onClickCapture={e => { if (suppress.current) { e.preventDefault(); e.stopPropagation(); suppress.current = false; } }}
        onDragStart={e => e.preventDefault()}>
        <div className="review-runner" id="reviewRunner">
          {data.REVIEW_LIBRARY.map((r, i) => (
            <article className="rev" key={i}>
              <blockquote lang="it"><p>{r.text}</p></blockquote>
              <div className="src">
                <span className="review-author"><b>{r.author}</b></span>
                <span className="review-meta">
                  <a href={r.url} target="_blank" rel="noopener">{r.source}</a>
                  {r.date && <time dateTime={r.date}>{new Intl.DateTimeFormat(language, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(r.date))}</time>}
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="review-controls">
        <button type="button" aria-label={`${copy.previous} — ${copy.reviews}`} disabled={edges.first} onClick={() => step(-1)}><Chevron direction="left" /></button>
        <button type="button" aria-label={`${copy.next} — ${copy.reviews}`} disabled={edges.last} onClick={() => step(1)}><Chevron direction="right" /></button>
      </div>
    </div>
  );
}
