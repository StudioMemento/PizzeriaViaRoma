import { useEffect, useRef, useState } from "react";
import data from "../data/menu.json";
import { Copy, translateDescription, translateName, useI18n } from "../i18n";
import { getAllergenInfo } from "../data/allergen-info";
import { useDialog } from "./DialogContext";
import { Icon } from "./Icon";
import { Photo } from "./Photo";
import GradualBlur from "../vendor/react-bits/GradualBlur";
import SectionAtmosphere from "./effects/SectionAtmosphere";
export const categoryOrder = [
  "classiche",
  "audaci",
  "bianche",
  "calzoni",
  "cucina",
  "stuzzicherie",
  "dolci",
  "bevande",
] as const;
export function AllergenTrigger({
  name,
  codes = "",
  description = "",
}: {
  name: string;
  codes?: string;
  description?: string;
}) {
  const { copy, language } = useI18n();
  const { open } = useDialog();
  const info = getAllergenInfo(name, description, codes);
  if (name === "Coperto" || (!info.codes.length && !info.frozen)) return null;
  return (
    <button
      className="allergen-trigger"
      type="button"
      aria-haspopup="dialog"
      aria-label={`${copy.allergens}: ${translateName(name, language)}, ${info.codes.join(", ")}`}
      onClick={() => open({ kind: "allergens", name, description, codes })}
    >
      {info.codes.join(" · ")}
      {info.frozen && <span className="frozen-mark">*</span>}
    </button>
  );
}
function MenuItem({ row }: { row: string[] }) {
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
          <span className="nome">{translateName(name, language)}</span>
          {qualifier && (
            <span className="qualifier">
              {translateDescription(qualifier, language)}
            </span>
          )}
        </span>
        <span className="dots" />
        <span className="prezzo">{price}</span>
      </div>
      {description && (
        <p className="desc">
          {desc.map((s, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {s}
            </span>
          ))}
        </p>
      )}
      <AllergenTrigger name={name} codes={codes} description={description} />
    </div>
  );
}
function Rows({ rows }: { rows: string[][] }) {
  return (
    <>
      {rows.map((row, i) => (
        <MenuItem key={`${row[0]}-${i}`} row={row} />
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
  rows: { name: string; qualifier?: string; prices: string[] }[];
}) {
  const { language } = useI18n();
  return (
    <section className="drink-table" aria-labelledby={id}>
      <p className="groupline" id={id}>{title}</p>
      <div className="drink-table-head" aria-hidden="true">
        <span />
        <div className="drink-size-head">
          {sizes.map((size) => <span key={size}>{size}</span>)}
        </div>
      </div>
      {rows.map(({ name, qualifier = "", prices }) => (
        <div className="item multi drink-item drink-row" key={name} data-menu-item={name}>
          <div className="row">
            <span className="label">
              <span className="nome">{name}</span>
              {qualifier && <span className="qualifier">{translateDescription(qualifier, language)}</span>}
            </span>
            <span className="dots" aria-hidden="true" />
            <div className="pricegrid">
              {sizes.map((size, i) => (
                <span className="drink-price-cell" key={size}>
                  <span className="sr-only">{size}: </span>
                  <b>{prices[i]}</b>
                </span>
              ))}
            </div>
          </div>
          <AllergenTrigger name={name} description={qualifier} />
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
      <Rows rows={data.ACQUA_BIBITE} />
      <p className="groupline">{t.bottiglia}</p>
      {bottles.map(([name, desc, rows]) => (
        <div key={name} className="drink-bottle-group">
          <p className="groupsub">
            <strong>{name}</strong> · {translateDescription(desc, language)}
          </p>
          <Rows rows={rows} />
        </div>
      ))}
      <DrinkTable
        title={t.spina}
        id="drinks-draught"
        sizes={["0,3 l", "0,5 l", `${t.caraffa} 1,5 l`]}
        rows={data.SPINA.map((b) => ({ name: b[0], qualifier: b[1], prices: b.slice(2, 5) }))}
      />
      <DrinkTable
        title={t.vini}
        id="drinks-wines"
        sizes={[t.calice, `${t.caraffa} 0,5 l`, `${t.bott} 0,75 l`]}
        rows={data.VINI.map((v) => ({ name: v[0], prices: v.slice(1, 4) }))}
      />
    </>
  );
}
export default function Menu() {
  const { t, copy } = useI18n();
  const [active, setActive] = useState<string>("classiche");
  const chips = useRef<HTMLElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) setActive(e.target.id.replace("cat-", ""));
      },
      { rootMargin: "-150px 0px -55% 0px" },
    );
    document.querySelectorAll(".mcat").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const rail = chips.current;
    const selected = rail?.querySelector<HTMLElement>(`[data-go="${active}"]`);
    if (!rail || !selected) return;
    const x =
      selected.offsetLeft - (rail.clientWidth - selected.offsetWidth) / 2;
    rail.scrollTo({
      left: x,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }, [active]);
  useEffect(() => {
    const rail = chips.current;
    if (!rail) return;
    const check = () => {
      wrap.current?.classList.toggle("can-l", rail.scrollLeft > 5);
      wrap.current?.classList.toggle(
        "can-r",
        rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 5,
      );
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(rail);
    rail.addEventListener("scroll", check, { passive: true });
    return () => {
      ro.disconnect();
      rail.removeEventListener("scroll", check);
    };
  }, []);
  return (
    <section id="menu">
      <SectionAtmosphere variant="menu" />
      <div className="menu-head fx on">
        <p className="k-s">{t.m_eyebrow}</p>
        <h2>{t.m_title}</h2>
        <p className="menu-utility">{copy.menuHelp}</p>
      </div>
      <div className="chipbar">
        <GradualBlur
          position="top"
          height="150px"
          strength={1.1}
          layers={8}
          tint="#09090bb0"
          className="menu-edge-blur"
          zIndex={-1}
        />
        <div className="chipbar-inner" ref={wrap}>
          <button
            className="chipchev l"
            aria-label={copy.previous}
            onClick={() =>
              chips.current?.scrollBy({ left: -220, behavior: "smooth" })
            }
          >
            <Icon name="caret-left" />
          </button>
          <button
            className="chipchev r"
            aria-label={copy.next}
            onClick={() =>
              chips.current?.scrollBy({ left: 220, behavior: "smooth" })
            }
          >
            <Icon name="caret-right" />
          </button>
          <nav
            className="chips scrollable"
            id="chips"
            ref={chips}
            aria-label={t.m_title}
          >
            {categoryOrder.map((id) => (
              <button
                key={id}
                type="button"
                data-go={id}
                className={active === id ? "on" : ""}
                aria-current={active === id ? "location" : undefined}
                onClick={() => {
                  document
                    .getElementById(`cat-${id}`)
                    ?.scrollIntoView({
                      behavior: matchMedia("(prefers-reduced-motion: reduce)")
                        .matches
                        ? "instant"
                        : "smooth",
                    });
                  history.replaceState(null, "", `#cat-${id}`);
                  setActive(id);
                }}
              >
                {t.cats[id][0]}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div id="carta">
        {categoryOrder.map((id) => {
          const [title, tag] = t.cats[id];
          const rows = (data.MENU as Record<string, string[][]>)[id];
          return (
            <section className="mcat fx on has-art" id={`cat-${id}`} key={id}>
              <header className="mcat-head">
                <h3>{title}</h3>
                {tag && <p className="tag">{tag}</p>}
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
