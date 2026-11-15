import { useEffect, useState } from "react";
import { useI18n, Copy } from "../i18n";
import { useDialog } from "./DialogContext";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import SectionAtmosphere from "./effects/SectionAtmosphere";

export function isRestaurantOpen(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(date);
  const day = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value);
  return day !== "Mon" && hour >= 18 && hour < 23;
}

export default function Contacts() {
  const { t, ui, copy } = useI18n();
  const { open } = useDialog();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const update = () => { if (!document.hidden) setNow(new Date()); };
    update();
    const id = setInterval(update, 60000);
    document.addEventListener("visibilitychange", update);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", update); };
  }, []);
  const isOpen = now ? isRestaurantOpen(now) : null;
  return (
    <section id="dove" className="vr-contacts v22-contacts" aria-labelledby="visit-title">
      <SectionAtmosphere variant="info" />
      <div className="v22-visit-shell">
        <div className="v22-visit-layout">
          <div className="v22-visit-details">
            <header className="v22-visit-heading">
              <p className="v22-eyebrow">{ui.info_label}</p>
              <h2 id="visit-title">{copy.infoTitle}</h2>
            </header>
            <div className="v22-visit-hours">
              <div className="v22-hours-label">
                <span className="v22-eyebrow">{t.d_orari}</span>
                <span className={`v22-open-state ${isOpen === null ? "pending" : isOpen ? "open" : "closed"}`} id="openState" role="status">
                  <span className="v22-status-dot" aria-hidden="true" />
                  <span data-status-label>{isOpen === null ? "—" : isOpen ? ui.open_now : ui.closed_now}</span>
                </span>
              </div>
              <strong className="v22-hours-time">18:00 — 23:00</strong>
              <p>{ui.opening_days}<span>{ui.closed_day}</span></p>
            </div>
            <div className="v22-contact-actions">
              <a className="v22-contact-link" href="tel:+390427541232">
                <span className="v22-contact-label"><Icon name="phone" />{ui.call}</span>
                <strong>0427 541232</strong><span className="v22-contact-note">{t.d_contatti}</span>
                <Icon name="arrow-up-right" className="v22-contact-arrow" />
              </a>
              <a className="v22-contact-link" href="https://wa.me/393802453757" target="_blank" rel="noopener noreferrer">
                <span className="v22-contact-label"><Icon name="whatsapp-logo" />WhatsApp</span>
                <strong>380 2453 757</strong><span className="v22-contact-note">{copy.whatsapp}</span>
                <Icon name="arrow-up-right" className="v22-contact-arrow" />
              </a>
            </div>
          </div>
          <a className="v22-visit-map" href="https://maps.google.com/?cid=7212905066552907909" target="_blank" rel="noopener noreferrer">
            <Photo className="v22-visit-map-image" src="assets/maniago.webp" alt="Vista aerea artistica di Maniago" sizes="(max-width: 800px) 90vw, 52vw" />
            <span className="v22-map-caption">
              <span><small>Maniago · Friuli Venezia Giulia</small><strong>Via Roma 47</strong><em>{t.d_maps}</em></span>
              <span className="v22-link-arrow" aria-hidden="true"><Icon name="arrow-up-right" /></span>
            </span>
          </a>
        </div>
        <footer className="v22-visit-footer">
          <p>© 2026 Pizzeria Via Roma</p>
          <nav aria-label={ui.legal_notes}>
            {([
              { slug: "privacy", label: copy.privacy },
              { slug: "cookie", label: copy.cookies },
              { slug: "note-legali", label: ui.legal_notes },
            ] as const).map((x) => (
              <a key={x.slug} href={`${x.slug}.html`} onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault(); open({ kind: "legal", slug: x.slug });
              }}>{x.label}</a>
            ))}
          </nav>
          <p><Copy value={ui.footer_credit} /></p>
        </footer>
      </div>
    </section>
  );
}
