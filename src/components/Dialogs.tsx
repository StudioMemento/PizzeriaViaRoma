import { useLayoutEffect, useRef } from "react";
import { useDialog } from "./DialogContext";
import { useI18n, translateName } from "../i18n";
import allergens from "../data/allergens.json";
import { getAllergenInfo } from "../data/allergen-info";
import privacy from "../data/privacy.html?raw";
import cookies from "../data/cookie.html?raw";
import legal from "../data/note-legali.html?raw";
import { Chevron, Icon } from "./Icon";
import { Photo } from "./Photo";
import { useDrag, wrap } from "../hooks/useDrag";
const legalTexts = { privacy, cookie: cookies, "note-legali": legal };
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
  const step = (d: number) => {
    if (modal?.kind === "photo")
      update({ ...modal, index: wrap(modal.index + d, modal.photos.length) });
  };
  const drag = useDrag(step);
  if (!modal) return null;
  const title =
    modal.kind === "allergens"
      ? translateName(modal.name, language)
      : modal.kind === "photo"
        ? modal.photos[modal.index].caption
        : modal.slug === "privacy"
          ? copy.privacy
          : modal.slug === "cookie"
            ? copy.cookies
            : ui.legal_notes;
  const info =
    modal.kind === "allergens"
      ? getAllergenInfo(modal.name, modal.description, modal.codes)
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
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      onKeyDown={(e) => {
        if (
          modal.kind === "photo" &&
          !e.defaultPrevented &&
          (e.key === "ArrowLeft" || e.key === "ArrowRight")
        ) {
          e.preventDefault();
          step(e.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <section
        className={`modal-panel ${modal.kind === "allergens" ? "allergen-panel" : ""}`}
      >
        <header className="modal-header">
          <div>
            {modal.kind === "allergens" && (
              <p className="eyebrow">{copy.allergens}</p>
            )}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="modal-close"
            type="button"
            autoFocus
            aria-label={copy.close}
            onClick={close}
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
                  <strong className="allergen-name">
                    {name}
                    {info.codes.includes(i + 1) && <span className="sr-only"> — {copy.allergenIncluded}</span>}
                  </strong>
                  <small className="allergen-description">{description}</small>
                </li>
              ))}
              <li className={info.frozen ? "contains" : ""}>
                <b className="allergen-code">*</b>
                <strong className="allergen-name">
                  {copy.frozenTitle}
                  {info.frozen && <span className="sr-only"> — {copy.allergenIncluded}</span>}
                </strong>
                <small className="allergen-description">{copy.frozen}</small>
              </li>
            </ol>
            <p className="allergen-note">{copy.allergenNote}</p>
          </>
        )}
        {modal.kind === "legal" && (
          <article
            className="legal-body"
            lang="it"
            dangerouslySetInnerHTML={{ __html: legalTexts[modal.slug] }}
          />
        )}
        {modal.kind === "photo" && (
          <>
            <div className="lightbox-image" {...drag}>
              <Photo
                src={modal.photos[modal.index].src}
                alt={modal.photos[modal.index].caption}
                eager
                sizes="96vw"
              />
            </div>
            <div className="lightbox-controls">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={copy.previous}
              >
                <Chevron direction="left" />
              </button>
              <span aria-live="polite">
                {modal.index + 1} / {modal.photos.length}
              </span>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={copy.next}
              >
                <Chevron direction="right" />
              </button>
            </div>
          </>
        )}
      </section>
    </dialog>
  );
}
