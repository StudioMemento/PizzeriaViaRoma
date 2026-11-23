import { Fragment } from "react";
import { useI18n } from "../i18n";
import { closingCopy } from "../data/closing-copy";
import { legalPath } from "../data/legal-path";
import { mapUrl, phoneHref, phoneNumber } from "../data/venue-links";
import { useDialog } from "./DialogContext";
import { BentoGrid } from "./BentoGrid";
import { SpreadLetters, SpreadTitle } from "./SpreadTitle";

function MapPin({ kind, label }: { kind: "venue" | "square"; label: string }) {
  return <span className={`map-pin ${kind}-pin`}>
    <span>{label}</span>
  </span>;
}

function Footer() {
  const { ui, copy, language } = useI18n();
  const { open } = useDialog();
  return <footer className="visit-footer" role="contentinfo">
    <div className="footer-row">
      <div className="footer-brand">
        <p>© 2026 PIZZERIA VIA ROMA</p>
        <small className="footer-vat">{closingCopy[language].vat} 01956350936</small>
      </div>
      <a className="studio-credit" href="https://mementostudio.it" target="_blank" rel="noopener noreferrer">
        <span lang="en">powered by</span>
        <img src="/assets/memento-wordmark.svg?v=56" width="824" height="64" loading="lazy" alt="MEMENTO" />
      </a>
      <nav aria-label={ui.legal_notes}>
        {([["cookie", copy.cookies], ["privacy", copy.privacy], ["note-legali", ui.legal_notes]] as const).map(([slug, label], index) =>
          <Fragment key={slug}>
            {index > 0 && <span aria-hidden="true">·</span>}
            <a href={legalPath(language, slug)} aria-haspopup="dialog" onClick={event => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              open({ kind: "legal", slug });
            }}>{label}</a>
          </Fragment>)}
      </nav>
    </div>
  </footer>;
}

export default function Contacts() {
  const { t, ui, language } = useI18n();
  return <>
    <section id="info" className="screen-section closing-section visit-section" aria-labelledby="visit-title">
      <SpreadTitle id="visit-title" text={closingCopy[language].visit} />
      <BentoGrid className="visit-bento">
        <a className="bento-tile map-tile" href={mapUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t.d_maps} · Pizzeria Via Roma, Via Roma 47, 33085 Maniago (PN) · Piazza Italia`}>
          <span className="map-photo" aria-hidden="true">
            <img className="tile-art" src="/assets/maniago.webp" srcSet="/assets/maniago-640.webp 640w, /assets/maniago.webp 1254w"
              sizes="(max-width: 700px) 80vw, (min-width: 2400px) 24vw, (min-width: 1200px) 36vw, (min-width: 768px) 42vw, 48vw" width="1254" height="1254" alt="" loading="lazy" decoding="async" />
            <MapPin kind="venue" label="Pizzeria Via Roma" />
            <MapPin kind="square" label="Piazza Italia" />
          </span>
          <span className="tile-bottom">
            <span><strong>Via Roma 47</strong><small>33085 Maniago (PN)</small></span>
            <svg className="map-direction" viewBox="0 0 16 28" width="16" height="28" fill="none" aria-hidden="true">
              <path d="m2 2 12 12-12 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
        <div className="bento-tile hours-tile" role="group" aria-label={t.d_orari}>
          <span className="sign-mark"><img src="/assets/logo.png" width="851" height="851" alt="Pizzeria Via Roma" loading="lazy" decoding="async" /></span>
          <div className="hours-copy visit-copy">
            <strong className="opening-time visit-digits">18:00 - 23:00</strong>
            <p className="visit-note"><span className="sr-only">{ui.closed_day}</span><span className="hours-note spread-line" aria-hidden="true"><SpreadLetters text={ui.closed_day.toLocaleUpperCase(language)} /></span></p>
          </div>
        </div>
        <a className="bento-tile phone-tile" href={phoneHref} aria-label={`${closingCopy[language].orders} · ${phoneNumber}`}>
          <span className="visit-copy" aria-hidden="true">
            <span className="phone-number visit-digits">{phoneNumber}</span>
            <span className="visit-note"><span className="hours-note phone-note spread-line"><SpreadLetters text={closingCopy[language].orders.toLocaleUpperCase(language)} /></span></span>
          </span>
        </a>
      </BentoGrid>
    </section>
    <Footer />
  </>;
}
