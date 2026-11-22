import { useI18n, type Language } from "../i18n";
import { photosUrl } from "../data/venue-links";
import { FeatureCard } from "./FeatureCard";

const copy: Record<Language, [string, string]> = {
  it: ["Ricordi condivisi dalla community!", "Apri le foto su Google Maps"],
  en: ["Memories shared by our community!", "Open photos on Google Maps"],
  de: ["Erinnerungen aus unserer Community!", "Fotos auf Google Maps öffnen"],
  fr: ["Les souvenirs de notre communauté !", "Voir les photos sur Google Maps"],
};

export function GuestPhotos() {
  const { language } = useI18n();
  const [heading, label] = copy[language];
  return <FeatureCard id="customer" titleId="guest-photos-title" heading={heading}
    imageBase="/assets/foto-ospiti/polaroid-interni" link={{ href: photosUrl, label }} />;
}
