import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import original from "./data/translations.json";
export type Language = "it" | "en" | "de" | "fr";
export const languages: Language[] = ["it", "en", "de", "fr"];
const additions = {
  it: {
    previous: "Precedente",
    next: "Successiva",
    close: "Chiudi",
    expand: "Ingrandisci la foto",
    photo: "Foto",
    menu: "Menù",
    gallery: "Foto del locale",
    communityLead: "Pizze, tavole e dettagli fotografati da voi.",
    infoTitle: "Vieni a trovarci.",
    whatsapp: "Scrivici su WhatsApp",
    skip: "Vai al menù",
    allergens: "Allergeni",
    allergenIncluded: "Presente in questo piatto",
    allergenNote: "Chiedi al personale per ulteriori informazioni",
    frozenTitle: "Prodotti surgelati",
    frozen: "Surgelato all’origine o in assenza del fresco.",
    changeLanguage: "Scegli la lingua",
    navigation: "Navigazione",
    photoSelection: "Altri scatti",
    privacy: "Privacy",
    cookies: "Cookie",
    menuHelp: "Prezzi in euro · Tocca i numeri per consultare gli allergeni.",
    reviews: "Recensioni",
  },
  en: {
    previous: "Previous",
    next: "Next",
    close: "Close",
    expand: "Enlarge photo",
    photo: "Photo",
    menu: "Menu",
    gallery: "Photos of the restaurant",
    communityLead: "Pizzas, tables and details photographed by you.",
    infoTitle: "Come and visit us.",
    whatsapp: "Message us on WhatsApp",
    skip: "Skip to the menu",
    allergens: "Allergens",
    allergenIncluded: "Present in this dish",
    allergenNote: "Ask our staff for more information",
    frozenTitle: "Frozen products",
    frozen: "Frozen at source or when fresh ingredients are unavailable.",
    changeLanguage: "Choose language",
    navigation: "Navigation",
    photoSelection: "More photos",
    privacy: "Privacy",
    cookies: "Cookies",
    menuHelp: "Prices in euros · Tap the numbers for allergen information.",
    reviews: "Reviews",
  },
  de: {
    previous: "Zurück",
    next: "Weiter",
    close: "Schließen",
    expand: "Foto vergrößern",
    photo: "Foto",
    menu: "Menü",
    gallery: "Fotos des Lokals",
    communityLead: "Pizzen, Tische und Details, von euch fotografiert.",
    infoTitle: "Kommt uns besuchen.",
    whatsapp: "Schreib uns auf WhatsApp",
    skip: "Zum Menü springen",
    allergens: "Allergene",
    allergenIncluded: "In diesem Gericht enthalten",
    allergenNote: "Für weitere Informationen fragt unser Personal",
    frozenTitle: "Tiefkühlprodukte",
    frozen: "Tiefgekühlt oder bei fehlender Frischware tiefgekühlt.",
    changeLanguage: "Sprache wählen",
    navigation: "Navigation",
    photoSelection: "Weitere Fotos",
    privacy: "Datenschutz",
    cookies: "Cookies",
    menuHelp: "Preise in Euro · Die Zahlen öffnen die Allergeninformationen.",
    reviews: "Bewertungen",
  },
  fr: {
    previous: "Précédente",
    next: "Suivante",
    close: "Fermer",
    expand: "Agrandir la photo",
    photo: "Photo",
    menu: "Menu",
    gallery: "Photos du restaurant",
    communityLead: "Pizzas, tables et détails photographiés par vous.",
    infoTitle: "Venez nous voir.",
    whatsapp: "Écrivez-nous sur WhatsApp",
    skip: "Aller au menu",
    allergens: "Allergènes",
    allergenIncluded: "Présent dans ce plat",
    allergenNote: "Demandez au personnel pour plus d’informations",
    frozenTitle: "Produits surgelés",
    frozen: "Surgelé à l’origine ou en l’absence de produit frais.",
    changeLanguage: "Choisir la langue",
    navigation: "Navigation",
    photoSelection: "Autres photos",
    privacy: "Confidentialité",
    cookies: "Cookies",
    menuHelp: "Prix en euros · Touchez les numéros pour consulter les allergènes.",
    reviews: "Avis",
  },
};
const LanguageContext = createContext({
  language: "it" as Language,
  setLanguage: (_: Language) => {},
});
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("it");
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useI18n() {
  const { language, setLanguage } = useContext(LanguageContext);
  return {
    language,
    setLanguage,
    t: original.T[language],
    ui: original.UI[language],
    copy: additions[language],
  };
}
export function translateDescription(value: string, language: Language) {
  if (language === "it" || !value) return value;
  const index = language === "en" ? 1 : language === "de" ? 2 : 3;
  return original.TERMS.reduce(
    (text, term) => text.split(term[0]).join(term[index] || term[0]),
    value,
  );
}
export function translateName(value: string, language: Language) {
  const names = original.NAME_TR as Record<string, string[]>;
  return language === "it"
    ? value
    : names[value]?.[language === "en" ? 0 : language === "de" ? 1 : 2] ||
        value;
}
/** Trusted, bundled editorial copy only. Never use for user-provided HTML. */
export function Copy({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span className={className} dangerouslySetInnerHTML={{ __html: value }} />
  );
}
