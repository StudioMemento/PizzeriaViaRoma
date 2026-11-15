import { useEffect, type CSSProperties } from "react";
import data from "../data/menu.json";
import { useI18n, translateDescription, translateName, type Language } from "../i18n";
import { useCarousel } from "../hooks/useCarousel";
import { Chevron } from "./Icon";
import { Photo } from "./Photo";
import { categoryOrder } from "./Menu";
import SectionAtmosphere from "./effects/SectionAtmosphere";

export const interactionCopy: Record<Language, { drag: string; pause: string; play: string; crustKicker: string; crustTitle: string; crustBody: string; ricotta: string; brie: string; gorgonzola: string; filling: string; perPizza: string; discover: string }> = {
  it: { drag: "Trascina, scegli, lasciati tentare.", pause: "Pausa scorrimento", play: "Riprendi scorrimento", crustKicker: "FINO ALL’ULTIMO MORSO", crustTitle: "Il gusto arriva fino al bordo.", crustBody: "Scegli il tuo ripieno preferito e aggiungi qualcosa in più alla tua pizza.", ricotta: "Morbida e delicata", brie: "Cremoso e avvolgente", gorgonzola: "Dolce, dal gusto deciso", filling: "Cornicione ripieno", perPizza: "alla tua pizza", discover: "Esplora il menù" },
  en: { drag: "Drag, choose, give in to temptation.", pause: "Pause autoplay", play: "Resume autoplay", crustKicker: "TO THE VERY LAST BITE", crustTitle: "Good taste, right to the edge.", crustBody: "Choose your favourite filling and add something extra to your pizza.", ricotta: "Soft and delicate", brie: "Rich and creamy", gorgonzola: "Sweet, with a bold character", filling: "Stuffed crust", perPizza: "per pizza", discover: "Explore the menu" },
  de: { drag: "Ziehen, wählen, genießen.", pause: "Automatik pausieren", play: "Automatik fortsetzen", crustKicker: "BIS ZUM LETZTEN BISSEN", crustTitle: "Genuss bis zum Rand.", crustBody: "Wähle deine Lieblingsfüllung und gib deiner Pizza das gewisse Extra.", ricotta: "Weich und mild", brie: "Vollmundig und cremig", gorgonzola: "Mild, mit kräftigem Charakter", filling: "Gefüllter Rand", perPizza: "pro Pizza", discover: "Speisekarte entdecken" },
  fr: { drag: "Faites glisser, choisissez, savourez.", pause: "Mettre le défilement en pause", play: "Reprendre le défilement", crustKicker: "JUSQU’À LA DERNIÈRE BOUCHÉE", crustTitle: "Du goût, jusqu’au bord.", crustBody: "Choisissez votre garniture préférée pour apporter un petit plus à votre pizza.", ricotta: "Douce et délicate", brie: "Fondant et crémeux", gorgonzola: "Doux, au caractère affirmé", filling: "Bordure farcie", perPizza: "par pizza", discover: "Découvrir la carte" },
};

function AutoControl({ paused, onClick, disabled = false }: { paused: boolean; onClick: () => void; disabled?: boolean }) {
  const { language } = useI18n();
  const text = interactionCopy[language];
  if (disabled) return null;
  return <button className="vr-autoplay" type="button" aria-label={paused ? text.play : text.pause} aria-pressed={paused} onClick={onClick}>
    {paused ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="m4 2 8 5-8 5V2Z" fill="currentColor" /></svg> : <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M4 2v10M10 2v10" stroke="currentColor" strokeWidth="1.5" /></svg>}
  </button>;
}

function Controls({ labels, carousel }: { labels: string[]; carousel: ReturnType<typeof useCarousel> }) {
  const { copy, language } = useI18n();
  return <div className="vr-carousel-footer">
    <p className="vr-drag-cue"><span aria-hidden="true">↔</span>{interactionCopy[language].drag}</p>
    <div className="vr-carousel-controls">
      <button className="vr-carousel-arrow" type="button" aria-label={copy.previous} onClick={() => carousel.move(-1)}><Chevron direction="left" /></button>
      <span className="vr-carousel-count" aria-live={carousel.paused ? "polite" : "off"}>{String(carousel.index + 1).padStart(2, "0")}<span>/</span>{String(labels.length).padStart(2, "0")}</span>
      <button className="vr-carousel-arrow" type="button" aria-label={copy.next} onClick={() => carousel.move(1)}><Chevron direction="right" /></button>
      <AutoControl paused={carousel.paused} onClick={() => carousel.setPaused(p => !p)} disabled={carousel.reduced} />
    </div>
  </div>;
}

function Oven() {
  const { t, language } = useI18n();
  const carousel = useCarousel(data.FORNO.length, 7200);
  return <section className="vr-pizza-carousel" id="pizza-slider" ref={carousel.rootRef} {...carousel.rootBind} aria-label={t.strip_k}>
    <SectionAtmosphere variant="oven" />
    <header className="vr-carousel-heading"><p className="k-s">{t.strip_k}</p></header>
    <div className="vr-pizza-viewport">
      <div className="vr-pizza-stage" id="forno" ref={carousel.stageRef} {...carousel.bind} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={t.strip_k}>
        {data.FORNO.map(([src, name, description], logical) => {
          const offset = ((logical + data.FORNO.length / 2) % data.FORNO.length) - data.FORNO.length / 2;
          return <figure key={src} className={`vr-pizza-card${logical === carousel.index ? " is-current" : ""}`} data-carousel-card data-forno-index={logical} aria-hidden={logical !== carousel.index} style={{ "--slide-x": `${offset * 340}px`, "--slide-distance": Math.abs(offset) } as CSSProperties}>
            <div className="vr-pizza-image"><Photo src={src} alt={logical === carousel.index ? translateName(name, language) : ""} enabled={carousel.isLoaded(logical)} eager sizes="(max-width: 700px) 74vw, 25vw" /></div>
            <figcaption>{translateName(name, language)}</figcaption>
            <p className="vr-pizza-ingredients">{translateDescription(description, language)}</p>
          </figure>;
        })}
      </div>
    </div>
    <Controls labels={data.FORNO.map(r => r[1])} carousel={carousel} />
  </section>;
}

function Cornicione() {
  const { t, language } = useI18n();
  const text = interactionCopy[language];
  const options = [
    { id: "ricotta", name: "Ricotta", body: text.ricotta },
    { id: "brie", name: "Brie", body: text.brie },
    { id: "gorgonzola", name: t.gorgo, body: text.gorgonzola },
  ];
  return <section className="vr-crust-intro" id="cornicione">
    <SectionAtmosphere variant="crust" />
    <header className="crust-heading">
      <p className="k-s">{text.crustKicker}</p>
      <h2>{text.crustTitle}</h2>
      <p>{text.crustBody}</p>
    </header>
    <div className="crust-options crust-grid">
      {options.map((option, i) => <article className="crust-option crust-card" key={option.id}>
        <img className="crust-illustration" src={`/assets/cornicione/${option.id}.svg`} width="540" height="300" loading="lazy" alt={`${text.filling} · ${option.name}`} />
        <div className="crust-option-copy crust-card-copy">
          <h3>{option.name}</h3>
          <p>{option.body}</p>
          <div className="crust-price"><strong>+ € {data.CORNICE[i][2]}</strong><span>{text.perPizza}</span></div>
        </div>
      </article>)}
    </div>
    <a className="text-link crust-link" href="#menu">{t.t_cta}<Chevron direction="right" /></a>
  </section>;
}

function Categories() {
  const { t, copy, language } = useI18n();
  const carousel = useCarousel(categoryOrder.length, 8200);
  useEffect(() => {
    const stage = carousel.stageRef.current;
    const focused = document.activeElement;
    if (!stage || focused === stage || !stage.contains(focused)) return;
    stage.querySelectorAll<HTMLElement>('[data-carousel-card]')[carousel.index]?.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
  }, [carousel.index, carousel.stageRef]);
  return <section id="catshow" className="vr-category-carousel" ref={carousel.rootRef} {...carousel.rootBind} aria-label={t.m_title}>
    <SectionAtmosphere variant="categories" />
    <div className="vr-category-stage" id="showrail" ref={carousel.stageRef} {...carousel.bind} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={t.m_title}>
      {categoryOrder.map((id, logical) => {
        const offset = ((logical + categoryOrder.length / 2) % categoryOrder.length) - categoryOrder.length / 2;
        const active = logical === carousel.index;
        return <article className={`vr-category-slide${active ? " is-current" : ""}`} key={id} data-cat={id} data-carousel-card aria-hidden={!active} style={{ "--slide-x": `${offset * 1000}px`, "--slide-distance": Math.abs(offset) } as CSSProperties}>
          <header className="vr-category-heading"><h2>{t.cats[id][0]}</h2></header>
          <a className="vr-category-image" href={`#cat-${id}`} draggable={false} tabIndex={active ? 0 : -1} aria-label={`${copy.menu}: ${t.cats[id][0]}`}>
            <Photo src={data.MENU_ART[id]} alt={active ? t.cats[id][0] : ""} enabled={carousel.isLoaded(logical)} eager sizes="(max-width: 700px) 90vw, 64vw" />
            <span className="vr-category-link">{interactionCopy[language].discover}<Chevron direction="right" /></span>
          </a>
          <p className="vr-category-description">{t.cats[id][1] || "\u00a0"}</p>
        </article>;
      })}
    </div>
    <Controls labels={categoryOrder.map(id => t.cats[id][0])} carousel={carousel} />
  </section>;
}

export function IntroSliders() { return <><Oven /><Cornicione /><Categories /></>; }
