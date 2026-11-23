import { useI18n, type Language } from "../i18n";
import { FeatureCard } from "./FeatureCard";

const copy: Record<Language, [string, string]> = {
  it: ["Pizzata a casa?", "Facciamo anche servizio da asporto!"],
  en: ["Pizza night at home?", "We do takeaway too!"],
  de: ["Pizzaabend zu Hause?", "Unsere Pizza gibt’s auch zum Mitnehmen!"],
  fr: ["Soirée pizza à la maison ?", "Nos pizzas sont aussi à emporter !"],
};

export function Takeaway() {
  const { language } = useI18n();
  const [heading, caption] = copy[language];
  return <FeatureCard id="asporto" titleId="takeaway-title" heading={heading} caption={caption}
    imageBase="/assets/asporto/via-roma-cartone-67">
    <img className="takeaway-mark" src="/assets/asporto/marchio-via-roma.webp" width="584" height="581"
      alt="Pizzeria Via Roma" loading="lazy" decoding="async" draggable={false} />
  </FeatureCard>;
}
