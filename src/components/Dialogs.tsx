import "../styles/dialogs.css";
import { useLayoutEffect, useRef } from "react";
import { useDialog } from "./DialogContext";
import { useI18n, translateName } from "../i18n";
import allergens from "../data/allergens.json";
import { getAllergenInfo } from "../data/allergen-info";
import { LegalReader } from "./LegalReader";
import { Icon } from "./Icon";
/** Choose the roomiest layout that fits the actual title, language and safe area. */
function fitAllergens(dialog: HTMLDialogElement) {
  const short = dialog.clientHeight <= 560;
  const wide = dialog.clientWidth >= 460;
  const columns = short ? (wide && dialog.clientHeight <= 340 ? [3, 2] : [2, 1]) : [1, 2];
  let bestOverflow = Infinity, bestCount = columns[0], bestDensity = "minimum";
  for (const count of columns) {
    dialog.style.setProperty("--allergen-columns", String(count));
    for (const density of ["roomy", "regular", "compact", "minimum"]) {
      dialog.dataset.density = density;
      const overflow = Math.max(0, dialog.scrollHeight - dialog.clientHeight, dialog.scrollWidth - dialog.clientWidth);
      if (!overflow) return;
      if (overflow < bestOverflow) { bestOverflow = overflow; bestCount = count; bestDensity = density; }
    }
  }
  dialog.style.setProperty("--allergen-columns", String(bestCount));
  dialog.dataset.density = bestDensity;
}

function AllergenDescription({ text, language }: { text: string; language: string }) {
  const phrase = "noci del Brasile";
  const index = language === "it" ? text.indexOf(phrase) : -1;
  if (index < 0) return <>{text}</>;
  return <>{text.slice(0, index)}<br /><span className="nut-phrase">{phrase}</span>{text.slice(index + phrase.length)}</>;
}

export default function Dialogs() {
  const { modal, close, update } = useDialog();
  const { copy, language, ui } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.documentElement.style.overflow = previous;
    };
  }, []);
  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog || modal?.kind !== "allergens") return;
    let active = true;
    const fit = () => { if (active) fitAllergens(dialog); };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(dialog);
    void document.fonts.ready.then(fit);
    return () => { active = false; resize.disconnect(); };
  }, [modal, language]);
  if (!modal) return null;
  const title = modal.kind === "allergens" ? translateName(modal.name, language)
    : ({ privacy: copy.privacy, cookie: copy.cookies, "note-legali": ui.legal_notes })[modal.slug];
  const info =
    modal.kind === "allergens"
      ? getAllergenInfo(modal.codes)
      : null;
  return (
    <dialog
      ref={ref}
      className={`vr-dialog modal-${modal.kind}`}
      aria-labelledby="modal-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={close}
      onKeyDown={(e) => {
        if (modal.kind === "legal" && (e.target as HTMLElement).closest(".modal-header")) {
          const reader = ref.current?.querySelector<HTMLElement>(".legal-scroll");
          if (reader && reader.scrollHeight > reader.clientHeight) {
            const offsets: Record<string, number> = { ArrowDown: 40, ArrowUp: -40, PageDown: reader.clientHeight * .9, PageUp: -reader.clientHeight * .9, Home: -reader.scrollHeight, End: reader.scrollHeight };
            if (e.key in offsets) { e.preventDefault(); reader.scrollBy({ top: offsets[e.key], behavior: "instant" }); }
          }
        }
      }}
    >
      <section
        className={`modal-panel ${modal.kind === "allergens" ? "allergen-panel" : "legal-panel"}`}
      >
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            autoFocus
            aria-label={copy.close}
            onClick={(e) => { e.stopPropagation(); close(); }}
          >
            <Icon name="x" />
          </button>
        </header>
        {modal.kind === "allergens" && info && (
          <>
            <ol className="allergen-list">
              {allergens[language].map(([name, description], i) => (
                <li
                  key={i}
                  className={info.codes.includes(i + 1) ? "contains" : ""}
                >
                  <b className="allergen-code">{i + 1}</b>
                  <span className="allergen-text">
                    <strong className="allergen-name">
                      {name}
                      {info.codes.includes(i + 1) && <span className="sr-only"> — {copy.allergenIncluded}</span>}
                    </strong>
                    <span className="allergen-description"><AllergenDescription text={description} language={language} /></span>
                  </span>
                </li>
              ))}
              <li className={info.frozen ? "contains" : ""}>
                <b className="allergen-code"><span className="frozen-mark">*</span></b>
                <span className="allergen-text">
                  <strong className="allergen-name">
                    {copy.frozenTitle}
                    {info.frozen && <span className="sr-only"> — {copy.allergenIncluded}</span>}
                  </strong>
                  <span className="allergen-description">{copy.frozen}</span>
                </span>
              </li>
            </ol>
            <p className="allergen-note">{copy.allergenNote}</p>
          </>
        )}
        {modal.kind === "legal" && (
          <LegalReader key={`${language}/${modal.slug}`} slug={modal.slug} navigate={slug => {
            ref.current?.querySelector<HTMLButtonElement>(".modal-close")?.focus({ preventScroll: true });
            update({ kind: "legal", slug });
          }} />
        )}
      </section>
    </dialog>
  );
}
