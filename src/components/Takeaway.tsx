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
    imageBase="/assets/asporto/asporto-serale" />;
}
