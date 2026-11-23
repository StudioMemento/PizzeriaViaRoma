import { useMemo, type CSSProperties } from "react";
import data from "../data/menu.json";
import { useI18n, translateDescription, translateName, type Language } from "../i18n";
import { useCarousel } from "../hooks/useCarousel";
import { FinaleAtmosphere } from "./FinaleAtmosphere";
import { Chevron } from "./Icon";
import { Photo } from "./Photo";
import { SpreadLetters } from "./SpreadTitle";
import { HoloCard } from "./intro/HoloCard";
import { useIntroVisibility } from "./intro/useIntroVisibility";
import { useDialog } from "./DialogContext";

const pizzaAllergens = new Map(
  [...data.MENU.classiche, ...data.MENU.audaci, ...data.MENU.bianche].map(([name, , , codes]) => [name, codes]),
);

export function PizzaSlider() {
  const { open } = useDialog();
  const { t, language, copy } = useI18n();
  const slides = useMemo(() => data.FORNO.map(([src, name, description]) => ({
    src, originalName: name,
    name: translateName(name, language),
    ingredients: description.split(", ").map(item => translateDescription(item, language)),
  })), [language]);
  const carousel = useCarousel(slides.length, language);
  return <section className="vr-pizza-carousel pizza-clean" id="pizza-slider" ref={carousel.rootRef} {...carousel.rootBind} aria-label={t.strip_k}>
    <FinaleAtmosphere />
    <div className="pizza-frame">
      <header className="oven-header">
        <h2 className="oven-heading" aria-label={t.strip_k}>
          <span className="spread-line" aria-hidden="true"><SpreadLetters text={t.strip_k} /></span>
        </h2>
      </header>
      <div className="vr-pizza-viewport">
        <div className="vr-pizza-stage" id="forno" ref={carousel.stageRef} {...carousel.bind} tabIndex={0} role="region" aria-roledescription="carousel" aria-label={t.strip_k}>
          {Array.from({ length: carousel.renderCount }, (_, slot) => {
            const logical = slot % slides.length;
            const { src, name } = slides[logical];
            const offset = slot < carousel.renderCount / 2 ? slot : slot - carousel.renderCount;
            return <figure key={slot} className="vr-pizza-card" data-carousel-card data-forno-index={logical}
              data-active={slot === 0} aria-hidden={slot !== 0}
              style={{ "--slot": offset, "--side": Math.sign(offset) } as CSSProperties}>
              <div className="vr-pizza-image">
                <Photo src={src} alt={name} enabled={carousel.isLoaded(logical)} eager
                  sizes="(max-width: 700px) 62vw, min(52svh, 640px)" />
              </div>
            </figure>;
          })}
        </div>
        <div className="pizza-controls" role="group" aria-label={copy.navigation}>
          <button className="pizza-arrow previous" type="button" aria-controls="forno pizza-copy" aria-label={copy.previous} onClick={() => carousel.move(-1)}><Chevron direction="left" /></button>
          <button className="pizza-arrow next" type="button" aria-controls="forno pizza-copy" aria-label={copy.next} onClick={() => carousel.move(1)}><Chevron direction="right" /></button>
        </div>
      </div>
      <div className="pizza-copy" id="pizza-copy">
        {slides.map(({ name, originalName, ingredients }, i) => <div className="pizza-caption" key={originalName} aria-hidden={i !== carousel.index} inert={i !== carousel.index}>
          <h3><button type="button" aria-haspopup="dialog" onClick={event => {
            event.currentTarget.focus({ preventScroll: true });
            open({ kind: "allergens", name: originalName, codes: pizzaAllergens.get(originalName)! });
          }}>{name}</button></h3>
          <ul>{ingredients.map((item, part) => <li key={part}>{item}</li>)}</ul>
        </div>)}
      </div>
    </div>
  </section>;
}

const crustHeadings: Record<Language, [string, string]> = {
  it: ["Il cornicione,", "con qualcosa in più!"],
  en: ["A crust,", "with something extra!"],
  de: ["Ein Pizzarand,", "mit dem gewissen Extra!"],
  fr: ["Une bordure,", "avec un petit plus !"],
};
export function Cornicione() {
  const { t, language } = useI18n();
  const [line1, line2] = crustHeadings[language];
  const section = useIntroVisibility();
  const options = [{ id: "ricotta", name: "Ricotta" }, { id: "brie", name: "Brie" }, { id: "gorgonzola", name: t.gorgo }];
  return <section ref={section} className="vr-crust-intro" id="cornicione" data-fx-state="paused">
    <header className="crust-heading"><h2 className="hero-slogan"><span>{line1}</span><span>{line2}</span></h2></header>
    <div className="crust-grid">
      {options.map((option, i) => <HoloCard key={option.id}>
        <img className="crust-photo" src={`/assets/cornicione/${option.id}-portrait-768.webp`}
          srcSet={`/assets/cornicione/${option.id}-portrait-384.webp 384w, /assets/cornicione/${option.id}-portrait-768.webp 768w`}
          sizes="(max-width: 767px) 80vw, (max-width: 1199px) 23vw, (max-width: 2399px) 20vw, 13vw"
          width="768" height="1152" loading="lazy" decoding="async" draggable={false} alt={`${line1} ${option.name}`} />
        <div className="crust-card-shade" aria-hidden="true" />
        <div className="crust-card-copy"><h3>{option.name}</h3><p className="crust-price">€ {data.CORNICE[i][2]}</p></div>
      </HoloCard>)}
    </div>
  </section>;
}
