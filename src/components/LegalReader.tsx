import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "../i18n";
import { closingCopy } from "../data/closing-copy";
import { legalPath, type LegalSlug } from "../data/legal-path";

const documents = new Map<string, string>();

/** The standalone page is the source of truth for both reading modes. */
export function LegalReader({ slug, navigate }: { slug: LegalSlug; navigate: (slug: LegalSlug) => void }) {
  const { language } = useI18n();
  const path = legalPath(language, slug);
  const [html, setHtml] = useState(() => documents.get(path));
  const [failed, setFailed] = useState(false);
  const reader = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const strings = closingCopy[language];
  useEffect(() => {
    if (documents.has(path)) return;
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(path, { signal: controller.signal });
        if (!response.ok) throw new Error();
        const page = new DOMParser().parseFromString(await response.text(), "text/html");
        const content = page.querySelector("article.legal-text");
        if (!content) throw new Error();
        if (!controller.signal.aborted) { documents.set(path, content.innerHTML); setHtml(content.innerHTML); }
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [path]);

  useLayoutEffect(() => {
    const viewport = reader.current, rail = progress.current;
    const fill = rail?.firstElementChild as HTMLElement | null;
    if (!viewport || !rail || !fill) return;
    let range = 0;
    const paint = () => { fill.style.transform = `scaleY(${range > 1 ? Math.min(1, Math.max(0, viewport.scrollTop / range)) : 0})`; };
    const measure = () => {
      range = viewport.scrollHeight - viewport.clientHeight;
      rail.hidden = range <= 1;
      viewport.tabIndex = range > 1 ? 0 : -1;
      paint();
    };
    const size = new ResizeObserver(measure);
    size.observe(viewport); if (viewport.firstElementChild) size.observe(viewport.firstElementChild);
    measure(); viewport.addEventListener("scroll", paint, { passive: true });
    return () => { size.disconnect(); viewport.removeEventListener("scroll", paint); };
  }, [html, failed]);

  return <>
    <div className="legal-scroll" ref={reader} role="region" aria-labelledby="modal-title">
      {html ? <article className="legal-text" data-document={slug} lang={language} dangerouslySetInnerHTML={{ __html: html }} onClick={event => {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
        const anchor = (event.target as Element).closest<HTMLAnchorElement>("a[data-legal]");
        const next = anchor?.dataset.legal;
        if (next === "privacy" || next === "cookie" || next === "note-legali") { event.preventDefault(); event.stopPropagation(); navigate(next); }
      }} /> : failed ? <a href={path}>{strings.openPage}</a> : <p role="status">{strings.loading}</p>}
    </div>
    <div ref={progress} className="vr-scroll-progress" hidden aria-hidden="true"><span /></div>
  </>;
}
