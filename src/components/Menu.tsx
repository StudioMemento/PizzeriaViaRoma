import data from "../data/menu.json";
import { Copy, translateDescription, translateName, useI18n } from "../i18n";
import { getAllergenInfo } from "../data/allergen-info";
import { useDialog } from "./DialogContext";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import { MenuTitle } from "./menu/MenuTitle";
import { categoryOrder, categoryLabels, useMenuNavigation } from "./menu/useMenuNavigation";
export { categoryOrder } from "./menu/useMenuNavigation";

function ItemName({ name, codes = "", translate = true }: {
  name: string; codes?: string; translate?: boolean;
}) {
  const { language, copy } = useI18n();
  const { open } = useDialog();
  const label = translate ? translateName(name, language) : name;
  if (name === "Coperto") return <span className="nome">{label}</span>;
  return <button type="button" className="nome" aria-haspopup="dialog"
    aria-label={`${label}: ${copy.allergens}`}
    onClick={() => open({ kind: "allergens", name, codes })}>{label}</button>;
}

export function AllergenTrigger({
  name,
  codes = "",
}: {
  name: string;
  codes?: string;
}) {
  const { copy, language } = useI18n();
  const { open } = useDialog();
  const info = getAllergenInfo(codes);
  if (!info.codes.length && !info.frozen) return null;
  const label = info.codes.join(" · ");
  return (
    <button
      className="allergen-trigger"
      type="button"
      aria-haspopup="dialog"
      aria-label={[`${copy.allergens}: ${translateName(name, language)}`, label, info.frozen && copy.frozenTitle].filter(Boolean).join(", ")}
      onClick={() => open({ kind: "allergens", name, codes })}
    >
      {label && <span>{label}</span>}
      {info.frozen && <span className="frozen-mark" aria-hidden="true">*</span>}
    </button>
  );
}
function MenuItem({ row, inlineDescription = false, showCodes = true }: { row: string[]; inlineDescription?: boolean; showCodes?: boolean }) {
  const [name, description, price, codes = "", qualifier = ""] = row;
  const { language } = useI18n();
  const desc = translateDescription(description, language)
    .split(" · ")
    .map((part) =>
      part ? part.charAt(0).toUpperCase() + part.slice(1) : part,
    );
  return (
    <div className="item" data-menu-item={name}>
      <div className="row">
        <span className="label">
          <ItemName name={name} codes={codes} />
          {qualifier && (
            <span className="qualifier">
              {translateDescription(qualifier, language)}
            </span>
          )}
        </span>
        <span className="dots" aria-hidden="true" />
        <span className="prezzo">{price}</span>
      </div>
      {description && (
        <p className="desc">
          {inlineDescription ? desc.join(" ") : desc.map((s, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {s}
            </span>
          ))}
        </p>
      )}
      {showCodes && <AllergenTrigger name={name} codes={codes} />}
    </div>
  );
}
function Rows({ rows, inlineDescription = false, showCodes = true }: { rows: string[][]; inlineDescription?: boolean; showCodes?: boolean }) {
  return (
    <>
      {rows.map((row, i) => (
        <MenuItem key={`${row[0]}-${i}`} row={row} inlineDescription={inlineDescription} showCodes={showCodes} />
      ))}
    </>
  );
}
function DrinkTable({
  title,
  id,
  sizes,
  rows,
}: {
  title: string;
  id: string;
  sizes: string[];
  rows: { name: string; qualifier?: string; prices: string[]; codes: string }[];
}) {
  const { language } = useI18n();
  return (
    <section className="drink-table" aria-labelledby={id}>
      <div className="drink-table-head">
        <h4 className="groupline" id={id}>{title}</h4>
        <div className="drink-size-head" aria-hidden="true">
          {sizes.map((size) => <span key={size}>{size.replace(/(\d) l$/, "$1\u00a0l")}</span>)}
        </div>
      </div>
      {rows.map(({ name, qualifier = "", prices, codes }) => (
        <div className="item multi drink-item drink-row" key={name} data-menu-item={name}>
          <div className="row">
            <div className="drink-product">
              <div className="drink-leader">
                <span className="label"><ItemName name={name} translate={false} codes={codes} /></span>
                <span className="dots" aria-hidden="true" />
              </div>
              {qualifier && <span className="qualifier">{translateDescription(qualifier, language)}</span>}
            </div>
            <div className="pricegrid">
              {sizes.map((size, i) => (
                <span className="drink-price-cell" key={size}>
                  <span className="sr-only drink-size-label">{size}<span className="sr-only">: </span></span>
                  <b>{prices[i]}</b>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
function Drinks() {
  const { t, language } = useI18n();
  const bottles = data.BOTTIGLIA as [string, string, string[][]][];
  return (
    <>
      <Rows rows={data.ACQUA_BIBITE} showCodes={false} />
      <p className="groupline">{t.bottiglia}</p>
      {bottles.map(([name, desc, rows]) => {
        const [origin, ...details] = translateDescription(desc, language).split(" - ");
        return (
          <div key={name} className="drink-bottle-group">
            <p className="groupsub">
              <strong>{name}</strong>{" · "}{origin}
              {details.length > 0 && <><br className="mobile-break" /><span className="desktop-separator"> - </span>{details.join(" - ")}</>}
            </p>
            <Rows rows={rows} inlineDescription showCodes={false} />
          </div>
        );
      })}
      <DrinkTable
        title={t.spina}
        id="drinks-draught"
        sizes={["0,3 l", "0,5 l", `${t.caraffa} 1,5 l`]}
        rows={data.SPINA.map((b) => ({ name: b[0], qualifier: b[1], prices: b.slice(2, 5), codes: b[5] }))}
      />
      <DrinkTable
        title={t.vini}
        id="drinks-wines"
        sizes={[t.calice, `${t.caraffa} 0,5 l`, `${t.bott} 0,75 l`]}
        rows={data.VINI.map((v) => ({ name: v[0], prices: v.slice(1, 4), codes: v[4] }))}
      />
    </>
  );
}
export default function Menu() {
  const { t, copy, language } = useI18n();
  const { active, chips, wrap, select, nudge } = useMenuNavigation(language);
  return (
    <section id="menu">
      <MenuTitle text={copy.menu} />
      <div className="chipbar">
        <div className="chipbar-inner" ref={wrap}>
          <button
            className="chipchev l"
            aria-label={copy.previous}
            type="button"
            onClick={() => nudge(-1)}
          >
            <Icon name="caret-left" />
          </button>
          <button
            className="chipchev r"
            aria-label={copy.next}
            type="button"
            onClick={() => nudge(1)}
          >
            <Icon name="caret-right" />
          </button>
          <nav
            className="chips scrollable"
            id="chips"
            ref={chips}
            aria-label={copy.menu}
          >
            {categoryOrder.map((id, index) => (
              <button
                key={id}
                type="button"
                data-go={id}
                className={active === id ? "on" : ""}
                aria-current={active === id ? "location" : undefined}
                onClick={() => select(id)}
              >
                {categoryLabels[language][index]}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div id="carta">
        {categoryOrder.map((id) => {
          const [title, tag] = t.cats[id];
          const kitchenBreak = id === "cucina" && language === "it" ? tag.indexOf("...") + 3 : 0;
          const rows = (data.MENU as Record<string, string[][]>)[id];
          return (
            <section className="mcat fx on has-art" id={`cat-${id}`} key={id}>
              <header className="mcat-head">
                <h3><span>{title}</span></h3>
                {tag && <p className="tag">{kitchenBreak > 2
                  ? <>{tag.slice(0, kitchenBreak)}<br className="mobile-break" /><span className="desktop-separator"> </span>{tag.slice(kitchenBreak).trimStart()}</>
                  : tag}</p>}
              </header>
              <figure className={`menu-art menu-art-${id}`}>
                <div className="menu-art-window">
                  <Photo src={data.MENU_ART[id]} alt={title} />
                </div>
              </figure>
              <div className="mcat-body">
                {rows && <Rows rows={rows} />}{" "}
                {id === "calzoni" && (
                  <>
                    <p className="groupline">{t.varianti}</p>
                    <Rows rows={data.VARIANTI} />
                    <p className="variant-callout">
                      <Copy value={t.variant_callout} />
                    </p>
                    <Rows rows={data.CORNICE} />
                  </>
                )}
                {id === "dolci" && <p className="dolci-note">{t.dolci_note}</p>}
                {id === "bevande" && <Drinks />}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
