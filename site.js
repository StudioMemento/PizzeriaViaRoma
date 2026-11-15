/* La landing deve aprirsi sempre dall'hero quando l'URL non contiene un anchor.
   Manteniamo invece intatti i link diretti come #menu e #dove. */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
if (!location.hash) window.scrollTo(0,0);
window.addEventListener("pageshow",()=>{
  if(!location.hash) requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
});

/* Keep the photographic experience clean: no context menu, callout or accidental selection. */
document.addEventListener("contextmenu",event=>event.preventDefault());
document.addEventListener("dragstart",event=>{if(event.target.closest?.("img,video"))event.preventDefault()});
document.addEventListener("selectstart",event=>{if(!event.target.closest?.("input,textarea,[contenteditable]"))event.preventDefault()});

/* Single source of truth for order, labels, copy and media mapping. */
const WALKTHROUGH_STEPS = Object.freeze([
  {id:"via-roma",index:"01",labelKey:"place_via_roma",copyType:"logo"},
  {id:"sala-sinistra",index:"02",labelKey:"place_sala_sinistra",eyebrowKey:"s2_eyebrow",titleKey:"s2_title",bodyKey:"s2_body"},
  {id:"sala-destra",index:"03",labelKey:"place_sala_destra",eyebrowKey:"s3_eyebrow",titleKey:"s3_title",bodyKey:"s3_body"},
  {id:"esperienza",index:"04",labelKey:"place_experienza",eyebrowKey:"s4_eyebrow",titleKey:"s4_title",bodyKey:"s4_body"}
]);
const WALKTHROUGH_FILM = Object.freeze({
  src:"assets/video/walkthrough/v18-walkthrough.mp4",
  mobileSrc:"assets/video/walkthrough/mobile/v18-walkthrough.mp4",
  poster:"assets/video/walkthrough/poster.webp",
  duration:12,
  copyWindows:Object.freeze([[2.38,2.72,3.28,3.68],[5.38,5.72,6.28,6.68],[8.38,8.72,9.28,9.68]])
});
const WALKTHROUGH_MOBILE=matchMedia("(max-width: 820px), (pointer: coarse)").matches;

/* =============== UI + narrative i18n =============== */
const T = {
it:{
  home_cta:"Scopri il menù", place_via_roma:"Via Roma", place_experienza:"Esperienza", s4_eyebrow:"Via Roma", s4_title:"Prenota la tua esperienza", s4_body:"",  sp_kicker:"Maniago - Friuli Venezia Giulia", place_bancone:"Bancone", place_entrata:"Entrata", place_sala_sinistra:"Sala sinistra", place_sala_destra:"Sala destra", tagline:"<span class=\"tagline-line\">La pizza di sempre,</span><span class=\"tagline-line\">con un tocco in più!</span>", scroll:"scorri",
  s1_eyebrow:"Maniago · Friuli Venezia Giulia", s1_title:"A Via Roma,<br> all'angolo di sempre",
  s1_body:"A due passi da Piazza Italia,<br>nel cuore della città delle coltellerie.",
  s2_eyebrow:"Sala sinistra", s2_title:"Luce calda,<br> tempo lento",
  s2_body:"Toni profondi, dettagli in ottone<br>ed un mood rilassante.",
  s3_eyebrow:"Sala destra", s3_title:"Materia, colore,<br> carattere",
  s3_body:"Accenti rossi, superfici scure<br>e un'atmosfera più decisa.",
  a_title:"Le Audaci", a_sub:"Per chi vuole farsi tentare un po'!",
  a_body:"Pizze dall'anima decisa, ingredienti di qualità, abbinamenti che sorprendono. Per chi non si accontenta.",
  t_title:"Il cornicione con qualcosa in più.", t_body:"Scegli il ripieno e rendi la tua pizza unica.",
  t_cta:"Scopri il menù", gorgo:"Gorgonzola dolce", strip_k:"Dal nostro forno",
  m_eyebrow:"La carta", m_title:"Il Menù",
  sel_cta:"Scopri la selezione",
  dolci_note:"Chiedi al personale la disponibilità del giorno!",
  g_eyebrow:"Gallery", g_title:"Dentro Via Roma",
  g_categories:{bancone:"Bancone",sala_sinistra:"Sala sinistra",sala_destra:"Sala destra",esterno:"Esterno",via_roma:"Via Roma"},
  cu_eyebrow:"La community", cu_title:"Racconta la tua esperienza",
  cu_lead:"Le vostre serate, viste da chi le vive.<br>Una raccolta aperta di scatti condivisi dalla community.",
  cu_cta:"Condividi il ricordo", cu_badge:"Cliente",
  cu_hint:"Inviaci la tua foto su WhatsApp:<br>la pubblicheremo dopo la tua conferma.",
  wa_msg:"Ciao Via Roma! Vorrei condividere una foto della mia serata da voi 🍕 (in allegato). Potete pubblicarla?",
  so_eyebrow:"Socials", so_title:"Social & Recensioni",
  r1:"Impasto leggero e digeribile, cornicione perfetto. La Burrata e Crudo è imperdibile.",
  r2:"Locale moderno e curato, personale gentile. Ottime anche le birre artigianali friulane.",
  r3:"La pizza di sempre, con un tocco in più, davvero. Torneremo di sicuro.",
  d_title:"Vi aspettiamo", d_dove:"Dove", d_maps:"Apri in Google Maps",
  d_orari:"Orari", d_orari_v:"Lunedì chiuso", d_contatti:"Contatti",
  tab_storia:"Via Roma", tab_menu:"Menù", tab_gallery:"Gallery", tab_chiama:"Chiama", tab_dove:"Info",
  cats:{
    classiche:["Le Classiche","Le nostre radici, intramontabili!"],
    audaci:["Le Audaci","Per chi vuole farsi tentare un po’!"],
    bianche:["Le Bianche","L’equilibrio perfetto tra gusto e leggerezza!"],
    calzoni:["I Calzoni","Amore ripieno!"],
    varianti:["Varianti","Crea la combinazione perfetta!"],
    cucina:["Dalla Cucina","Anche se incredibile... non si ha sempre voglia di pizza?"],
    stuzzicherie:["Stuzzicherie","Il miglior antidoto alla fame!"],
    dolci:["Dolci","La miglior conclusione!"],
    bevande:["Bevande",""]
  },
  varianti:"Aggiunte", coperto:"Coperto", impasti:"Impasto integrale", cornice:"Cornicione ripieno",
  variant_callout:"Hai già provato il nostro cornicione ripieno?<br>Il vero must della nostra pizza!", allergen_title:"Legenda allergeni",
  spina:"Birre alla spina", bottiglia:"Birre in bottiglia", vini:"Vini della casa", spritz:"Spritz & Co.",
  calice:"Calice", caraffa:"Caraffa", bott:"Bottiglia"
},
en:{
  home_cta:"Explore the menu", place_via_roma:"Via Roma", place_experienza:"Experience", s4_eyebrow:"Via Roma", s4_title:"Book your experience", s4_body:"",  sp_kicker:"Maniago - Friuli Venezia Giulia", place_bancone:"Counter", place_entrata:"Entrance", place_sala_sinistra:"Left room", place_sala_destra:"Right room", tagline:"<span class=\"tagline-line\">The pizza you know,</span><span class=\"tagline-line\">with a little something extra!</span>", scroll:"scroll",
  s1_eyebrow:"Maniago · Friuli Venezia Giulia, Italy", s1_title:"At Via Roma,<br> on the usual corner",
  s1_body:"Just steps from Piazza Italia,<br>in the heart of the town of knife-makers.",
  s2_eyebrow:"Left room", s2_title:"Warm light,<br> unhurried time",
  s2_body:"Deep tones, brass details<br>and a relaxed mood.",
  s3_eyebrow:"Right room", s3_title:"Texture, colour,<br> character",
  s3_body:"Red accents, dark surfaces<br>and a bolder atmosphere.",
  a_title:"Le Audaci", a_sub:"For those who like temptation!",
  a_body:"Bold-hearted pizzas, quality ingredients, surprising pairings. For those who never settle.",
  t_title:"The crust with something extra.", t_body:"Choose your filling and make your pizza unique.",
  t_cta:"Discover the menu", gorgo:"Sweet gorgonzola", strip_k:"From our oven",
  m_eyebrow:"The menu", m_title:"The Menu",
  sel_cta:"Discover the selection",
  dolci_note:"Ask our staff about today\u2019s selection.",
  g_eyebrow:"Gallery", g_title:"Inside Via Roma",
  g_categories:{bancone:"Counter",sala_sinistra:"Left room",sala_destra:"Right room",esterno:"Exterior",via_roma:"Via Roma"},
  cu_eyebrow:"The community", cu_title:"Share your experience",
  cu_lead:"Your evenings, seen by the people who live them.<br>An open collection of shots shared by our community.",
  cu_cta:"Share your memory", cu_badge:"Guest",
  cu_hint:"Send us your photo on WhatsApp:<br>we'll publish it once you confirm.",
  wa_msg:"Hi Via Roma! I'd love to share a photo from my evening with you 🍕 (attached). May you publish it?",
  so_eyebrow:"Socials", so_title:"Social & Reviews",
  r1:"Light, digestible dough and a perfect crust. The Burrata e Crudo is unmissable.",
  r2:"Modern, well-kept place, friendly staff. The Friulian craft beers are excellent too.",
  r3:"The pizza you know, with a little something more, truly. We'll be back for sure.",
  d_title:"We're waiting for you", d_dove:"Where", d_maps:"Open in Google Maps",
  d_orari:"Hours", d_orari_v:"Monday closed", d_contatti:"Contact",
  tab_storia:"Via Roma", tab_menu:"Menu", tab_gallery:"Gallery", tab_chiama:"Call", tab_dove:"Info",
  cats:{
    classiche:["Le Classiche","Our roots, timeless!"],
    audaci:["Le Audaci","For those who want to give in to temptation!"],
    bianche:["Le Bianche","The perfect balance of flavour and lightness!"],
    calzoni:["I Calzoni","Love, filled!"],
    varianti:["Extras","Create the perfect combination"],
    cucina:["From the Kitchen","Hard to believe... but you do not always feel like pizza, do you?"],
    stuzzicherie:["Starters","The best antidote to hunger!"],
    dolci:["Desserts","The best ending!"],
    bevande:["Drinks",""]
  },
  varianti:"Extras", coperto:"Cover charge", impasti:"Wholemeal dough", cornice:"Stuffed crust",
  variant_callout:"Have you tried our stuffed crust?<br>The true must of our pizza!", allergen_title:"Allergen guide",
  spina:"Beers on tap", bottiglia:"Bottled beers", vini:"House wines", spritz:"Spritz & Co.",
  calice:"Glass", caraffa:"Carafe", bott:"Bottle"
},
de:{
  home_cta:"Menü entdecken", place_via_roma:"Via Roma", place_experienza:"Erlebnis", s4_eyebrow:"Via Roma", s4_title:"Reserviere dein Erlebnis", s4_body:"",  sp_kicker:"Maniago - Friuli Venezia Giulia", place_bancone:"Theke", place_entrata:"Eingang", place_sala_sinistra:"Linker Saal", place_sala_destra:"Rechter Saal", tagline:"<span class=\"tagline-line\">Die Pizza von immer,</span><span class=\"tagline-line\">mit dem gewissen Etwas!</span>", scroll:"scrollen",
  s1_eyebrow:"Maniago · Friaul-Julisch Venetien, Italien", s1_title:"Bei Via Roma, an der<br> vertrauten Ecke",
  s1_body:"Wenige Schritte von der Piazza Italia,<br>im Herzen der Stadt der Messerschmiede.",
  s2_eyebrow:"Linker Saal", s2_title:"Warmes Licht,<br> Zeit ohne Eile",
  s2_body:"Tiefe Töne, Messingdetails<br>und eine entspannte Stimmung.",
  s3_eyebrow:"Rechter Saal", s3_title:"Material, Farbe,<br> Charakter",
  s3_body:"Rote Akzente, dunkle Flächen<br>und eine markantere Atmosphäre.",
  a_title:"Le Audaci", a_sub:"Für alle, die sich verführen lassen!",
  a_body:"Pizzen mit Charakter, hochwertige Zutaten, überraschende Kombinationen. Für alle, die mehr wollen.",
  t_title:"Der Rand mit dem gewissen Etwas.", t_body:"Wähle die Füllung und mach deine Pizza einzigartig.",
  t_cta:"Zur Speisekarte", gorgo:"Milder Gorgonzola", strip_k:"Aus unserem Ofen",
  m_eyebrow:"Die Karte", m_title:"Die Speisekarte",
  sel_cta:"Zur Auswahl",
  dolci_note:"Fragen Sie unser Personal nach der Auswahl des Tages.",
  g_eyebrow:"Galerie", g_title:"Bei Via Roma",
  g_categories:{bancone:"Theke",sala_sinistra:"Linker Saal",sala_destra:"Rechter Saal",esterno:"Außenbereich",via_roma:"Via Roma"},
  cu_eyebrow:"Die Community", cu_title:"Erzählen Sie Ihr Erlebnis",
  cu_lead:"Ihre Abende, gesehen von denen, die sie erleben.<br>Eine offene Sammlung von Fotos aus unserer Community.",
  cu_cta:"Erinnerung teilen", cu_badge:"Gast",
  cu_hint:"Senden Sie uns Ihr Foto per WhatsApp:<br>Wir veröffentlichen es nach Ihrer Bestätigung.",
  wa_msg:"Hallo Via Roma! Ich möchte gern ein Foto von meinem Abend bei euch teilen 🍕 (im Anhang). Dürft ihr es veröffentlichen?",
  so_eyebrow:"Socials", so_title:"Social & Bewertungen",
  r1:"Leichter, bekömmlicher Teig und ein perfekter Rand. Die Burrata e Crudo ist ein Muss.",
  r2:"Modernes, gepflegtes Lokal, freundliches Personal. Auch die friaulischen Craft-Biere sind ausgezeichnet.",
  r3:"Die Pizza von immer, mit dem gewissen Etwas, wirklich. Wir kommen sicher wieder.",
  d_title:"Wir erwarten Sie", d_dove:"Wo", d_maps:"In Google Maps öffnen",
  d_orari:"Öffnungszeiten", d_orari_v:"Montag Ruhetag", d_contatti:"Kontakt",
  tab_storia:"Via Roma", tab_menu:"Karte", tab_gallery:"Galerie", tab_chiama:"Anrufen", tab_dove:"Info",
  cats:{
    classiche:["Le Classiche","Unsere Wurzeln, zeitlos!"],
    audaci:["Le Audaci","Für alle, die sich ein wenig verführen lassen wollen!"],
    bianche:["Le Bianche","Das perfekte Gleichgewicht zwischen Geschmack und Leichtigkeit!"],
    calzoni:["I Calzoni","Liebe, gefüllt!"],
    varianti:["Extras","Die perfekte Kombination zusammenstellen"],
    cucina:["Aus der Küche","So unglaublich es klingt... man hat nicht immer Lust auf Pizza, oder?"],
    stuzzicherie:["Vorspeisen","Das beste Mittel gegen Hunger!"],
    dolci:["Desserts","Der beste Abschluss!"],
    bevande:["Getränke",""]
  },
  varianti:"Extras", coperto:"Gedeck", impasti:"Vollkornteig", cornice:"Gefüllter Rand",
  variant_callout:"Schon unseren gefüllten Rand probiert?<br>Das wahre Muss unserer Pizza!", allergen_title:"Allergenlegende",
  spina:"Biere vom Fass", bottiglia:"Flaschenbiere", vini:"Hausweine", spritz:"Spritz & Co.",
  calice:"Glas", caraffa:"Karaffe", bott:"Flasche"
},
fr:{
  home_cta:"Découvrir le menu", place_via_roma:"Via Roma", place_experienza:"Expérience", s4_eyebrow:"Via Roma", s4_title:"Réservez votre expérience", s4_body:"",  sp_kicker:"Maniago - Friuli Venezia Giulia", place_bancone:"Comptoir", place_entrata:"Entrée", place_sala_sinistra:"Salle gauche", place_sala_destra:"Salle droite", tagline:"<span class=\"tagline-line\">La pizza de toujours,</span><span class=\"tagline-line\">avec un petit plus !</span>", scroll:"défiler",
  s1_eyebrow:"Maniago · Frioul-Vénétie Julienne, Italie", s1_title:"Chez Via Roma,<br> au coin de toujours",
  s1_body:"À quelques pas de la Piazza Italia,<br>au cœur de la ville des couteliers.",
  s2_eyebrow:"Salle gauche", s2_title:"Lumière chaude,<br> temps suspendu",
  s2_body:"Des tons profonds, des détails en laiton<br>et une ambiance détendue.",
  s3_eyebrow:"Salle droite", s3_title:"Matière, couleur,<br> caractère",
  s3_body:"Des accents rouges, des surfaces sombres<br>et une atmosphère plus affirmée.",
  a_title:"Le Audaci", a_sub:"Pour ceux qui aiment se laisser tenter !",
  a_body:"Des pizzas au caractère affirmé, des ingrédients de qualité, des accords qui surprennent. Pour ceux qui ne se contentent pas.",
  t_title:"Le bord avec un petit plus.", t_body:"Choisissez la garniture et rendez votre pizza unique.",
  t_cta:"Découvrir le menu", gorgo:"Gorgonzola doux", strip_k:"De notre four",
  m_eyebrow:"La carte", m_title:"Le Menu",
  sel_cta:"Découvrir la sélection",
  dolci_note:"Demandez au personnel la disponibilité du jour !",
  g_eyebrow:"Galerie", g_title:"À l'intérieur de Via Roma",
  g_categories:{bancone:"Comptoir",sala_sinistra:"Salle gauche",sala_destra:"Salle droite",esterno:"Extérieur",via_roma:"Via Roma"},
  cu_eyebrow:"La communauté", cu_title:"Racontez votre expérience",
  cu_lead:"Vos soirées, vues par celles et ceux qui les vivent.<br>Une collection ouverte de photos partagées par notre communauté.",
  cu_cta:"Partager le souvenir", cu_badge:"Client",
  cu_hint:"Envoyez-nous votre photo sur WhatsApp :<br>nous la publierons après votre confirmation.",
  wa_msg:"Bonjour Via Roma ! J'aimerais partager une photo de ma soirée chez vous 🍕 (en pièce jointe). Pouvez-vous la publier ?",
  so_eyebrow:"Socials", so_title:"Réseaux & Avis",
  r1:"Pâte légère et digeste, bord parfait. La Burrata e Crudo est incontournable.",
  r2:"Lieu moderne et soigné, personnel aimable. Les bières artisanales frioulanes sont excellentes aussi.",
  r3:"La pizza de toujours, avec un petit plus, vraiment. Nous reviendrons sans faute.",
  d_title:"Nous vous attendons", d_dove:"Où", d_maps:"Ouvrir dans Google Maps",
  d_orari:"Horaires", d_orari_v:"Lundi fermé", d_contatti:"Contact",
  tab_storia:"Via Roma", tab_menu:"Menu", tab_gallery:"Galerie", tab_chiama:"Appeler", tab_dove:"Info",
  cats:{
    classiche:["Le Classiche","Nos racines, intemporelles !"],
    audaci:["Le Audaci","Pour celles et ceux qui veulent se laisser tenter !"],
    bianche:["Le Bianche","L’équilibre parfait entre goût et légèreté !"],
    calzoni:["I Calzoni","L’amour en version farcie !"],
    varianti:["Suppléments","Créez la combinaison parfaite"],
    cucina:["De la Cuisine","Même si cela paraît incroyable... on n’a pas toujours envie de pizza !"],
    stuzzicherie:["Amuse-bouche","Le meilleur antidote à la faim !"],
    dolci:["Desserts","La meilleure conclusion !"],
    bevande:["Boissons",""]
  },
  varianti:"Suppléments", coperto:"Couvert", impasti:"Pâte complète", cornice:"Bord farci",
  variant_callout:"Avez-vous déjà goûté notre bord farci ?<br>Le vrai must de notre pizza !", allergen_title:"Légende des allergènes",
  spina:"Bières pression", bottiglia:"Bières en bouteille", vini:"Vins de la maison", spritz:"Spritz & Co.",
  calice:"Verre", caraffa:"Carafe", bott:"Bouteille"
}
};

const UI = {
  it:{
    tripadvisor_phrase:"Leggi. Salva. Condividi.", footer_place:"Maniago · Friuli Venezia Giulia", footer_credit:"Design &amp; development · <a href=\"https://mementostudio.it\" target=\"_blank\" rel=\"noopener\">Memento Studio</a>", depth:"Profondità",g_intro:"Ogni spazio è un album. Aprilo e lascialo scorrere.",g_autoplay:"Autoplay · 5 secondi",g_pause:"Pausa",g_play:"Riprendi",gallery_open:"Apri l'album",
    so_title:"La serata continua.",so_lead:"Vivi l'attimo.<br>Se ti va condividi il tuo ricordo.",so_instagram:"Apri il profilo",so_facebook:"Entra nella community",so_tripadvisor:"Scopri le recensioni",so_whatsapp:"Mandaci il tuo scatto",
    review_selection:"Selezione",review_live:"Feed live",all_reviews:"Tutte le recensioni",reviews_count:"recensioni",marquee:"TAGGACI · CONDIVIDI · TORNA · #VIAROMAMANIAGO · ",
    info_label:"Info",d_title:"Ci vediamo all'angolo di sempre",directions:"Indicazioni",call:"Chiama",open_now:"Aperto ora",closed_now:"Chiuso ora",opens_at:"Apre alle 18:00",closed_monday:"Chiuso il lunedì"
  },
  en:{
    tripadvisor_phrase:"Read. Save. Share.", footer_place:"Maniago · Friuli Venezia Giulia", footer_credit:"Design &amp; development · <a href=\"https://mementostudio.it\" target=\"_blank\" rel=\"noopener\">Memento Studio</a>", depth:"Depth",g_intro:"Every room is an album. Open it and let it play.",g_autoplay:"Autoplay · 5 seconds",g_pause:"Pause",g_play:"Play",gallery_open:"Open album",
    so_title:"The evening continues.",so_lead:"Live the moment.<br>If you feel like it, share your memory.",so_instagram:"Open profile",so_facebook:"Join the community",so_tripadvisor:"Read the reviews",so_whatsapp:"Send us your shot",
    review_selection:"Selection",review_live:"Live feed",all_reviews:"All reviews",reviews_count:"reviews",marquee:"TAG US · SHARE · COME BACK · #VIAROMAMANIAGO · ",
    info_label:"Info",d_title:"Meet us on the usual corner",directions:"Directions",call:"Call",open_now:"Open now",closed_now:"Closed now",opens_at:"Opens at 6 pm",closed_monday:"Closed on Monday"
  },
  de:{
    tripadvisor_phrase:"Lesen. Speichern. Teilen.", footer_place:"Maniago · Friuli Venezia Giulia", footer_credit:"Design &amp; Entwicklung · <a href=\"https://mementostudio.it\" target=\"_blank\" rel=\"noopener\">Memento Studio</a>", depth:"Tiefe",g_intro:"Jeder Raum ist ein Album. Öffnen und abspielen lassen.",g_autoplay:"Autoplay · 5 Sekunden",g_pause:"Pause",g_play:"Abspielen",gallery_open:"Album öffnen",
    so_title:"Der Abend geht weiter.",so_lead:"Lebt den Moment.<br>Wenn ihr mögt, teilt eure Erinnerung.",so_instagram:"Profil öffnen",so_facebook:"Community beitreten",so_tripadvisor:"Bewertungen lesen",so_whatsapp:"Foto senden",
    review_selection:"Auswahl",review_live:"Live-Feed",all_reviews:"Alle Bewertungen",reviews_count:"Bewertungen",marquee:"MARKIERT UNS · TEILEN · WIEDERKOMMEN · #VIAROMAMANIAGO · ",
    info_label:"Info",d_title:"Wir sehen uns an der vertrauten Ecke",directions:"Route",call:"Anrufen",open_now:"Jetzt geöffnet",closed_now:"Jetzt geschlossen",opens_at:"Öffnet um 18 Uhr",closed_monday:"Montags geschlossen"
  },
  fr:{
    tripadvisor_phrase:"Lire. Enregistrer. Partager.", footer_place:"Maniago · Friuli Venezia Giulia", footer_credit:"Design &amp; développement · <a href=\"https://mementostudio.it\" target=\"_blank\" rel=\"noopener\">Memento Studio</a>", depth:"Profondeur",g_intro:"Chaque espace est un album. Ouvrez-le et laissez-le défiler.",g_autoplay:"Lecture auto · 5 secondes",g_pause:"Pause",g_play:"Lecture",gallery_open:"Ouvrir l'album",
    so_title:"La soirée continue.",so_lead:"Vivez l'instant.<br>Si vous en avez envie, partagez votre souvenir.",so_instagram:"Ouvrir le profil",so_facebook:"Rejoindre la communauté",so_tripadvisor:"Lire les avis",so_whatsapp:"Envoyer votre photo",
    review_selection:"Sélection",review_live:"Flux en direct",all_reviews:"Tous les avis",reviews_count:"avis",marquee:"IDENTIFIEZ-NOUS · PARTAGEZ · REVENEZ · #VIAROMAMANIAGO · ",
    info_label:"Info",d_title:"Rendez-vous au coin de toujours",directions:"Itinéraire",call:"Appeler",open_now:"Ouvert maintenant",closed_now:"Fermé maintenant",opens_at:"Ouvre à 18 h",closed_monday:"Fermé le lundi"
  }
};
Object.assign(UI.it,{"so_restaurantguru": "Scopri le esperienze", "review_eyebrow": "Dalla community", "review_title": "Le vostre esperienze", "review_body": "Una pizza, una serata, un ricordo da condividere.", "opening_days": "Aperto da martedì a domenica", "closed_day": "Chiuso il lunedì", "legal_notes": "Note legali"});
Object.assign(UI.en,{"so_restaurantguru": "Explore the reviews", "review_eyebrow": "From our community", "review_title": "Your experiences", "review_body": "A pizza, an evening, a memory to share.", "opening_days": "Open Tuesday to Sunday", "closed_day": "Closed on Mondays", "legal_notes": "Legal notice"});
Object.assign(UI.de,{"so_restaurantguru": "Erfahrungen entdecken", "review_eyebrow": "Aus der Community", "review_title": "Eure Erfahrungen", "review_body": "Eine Pizza, ein Abend, eine gemeinsame Erinnerung.", "opening_days": "Geöffnet von Dienstag bis Sonntag", "closed_day": "Montags geschlossen", "legal_notes": "Rechtliche Hinweise"});
Object.assign(UI.fr,{"so_restaurantguru": "Découvrez les avis", "review_eyebrow": "La communauté", "review_title": "Vos expériences", "review_body": "Une pizza, une soirée, un souvenir à partager.", "opening_days": "Ouvert du mardi au dimanche", "closed_day": "Fermé le lundi", "legal_notes": "Mentions légales"});
function ui(key){return (UI[LANG]&&UI[LANG][key])||UI.it[key]||key}
function applyUiText(){
  document.querySelectorAll("[data-ui]").forEach(el=>{const value=ui(el.dataset.ui);if(value!==undefined)el.innerHTML=value});
  const marquee=document.getElementById("socialMarqueeText");
  if(marquee){const phrase=ui("marquee");marquee.textContent=(phrase.repeat(8));}
}

/* =============== traduzione ingredienti — [it, en, de, fr] (frasi lunghe prima) =============== */
const TERMS = [
["tagliere di prosciutto crudo di San Daniele","San Daniele cured-ham board","San-Daniele-Rohschinkenplatte","planche de jambon cru San Daniele"],
["Artigianale - Non filtrata, non pastorizzata","Craft - unfiltered, unpasteurised","Handwerklich - unfiltriert, nicht pasteurisiert","Artisanale - non filtrée, non pasteurisée"],
["bevande analcoliche","soft drinks","alkoholfreie Getränke","boissons sans alcool"],
["mezzaluna","half moon","Halbmond","demi-lune"],
["mozzarella di Bufala in cottura","buffalo mozzarella, baked in","Büffelmozzarella, mitgebacken","mozzarella de bufflonne, cuite"],
["mozzarella di Bufala fuori cottura","buffalo mozzarella, added fresh","Büffelmozzarella, frisch dazu","mozzarella de bufflonne, ajoutée à froid"],
["prosciutto crudo San Daniele","San Daniele cured ham","San-Daniele-Rohschinken","jambon cru San Daniele"],
["passata di pomodorino giallo","yellow cherry-tomato passata","gelbe Kirschtomaten-Passata","coulis de tomate cerise jaune"],
["passata di peperoni","sweet-pepper passata","Paprika-Passata","coulis de poivrons"],
["pomodorini semi dry","semi-dried cherry tomatoes","halbgetrocknete Kirschtomaten","tomates cerises mi-séchées"],
["pizzette fritte con pomodoro, mozzarella e grana","fried mini pizzas with tomato, mozzarella and Grana","frittierte Mini-Pizzen mit Tomate, Mozzarella und Grana","mini-pizzas frites tomate, mozzarella et Grana"],
["pane con impasto della pizza","bread from our pizza dough","Brot aus unserem Pizzateig","pain à base de pâte à pizza"],
["provola affumicata in cottura","smoked provola, baked in","geräucherte Provola, mitgebacken","provola fumée, cuite"],
["bufala affumicata fuori cottura","smoked buffalo mozzarella, added fresh","geräucherter Büffelmozzarella, frisch dazu","mozzarella de bufflonne fumée, à froid"],
["provola affumicata di bufala","smoked buffalo provola","geräucherte Büffel-Provola","provola de bufflonne fumée"],
["provola affumicata","smoked provola","geräucherte Provola","provola fumée"],
["ricotta affumicata","smoked ricotta","geräucherte Ricotta","ricotta fumée"],
["ricotta fresca","fresh ricotta","frische Ricotta","ricotta fraîche"],
["Grana Padano in scaglie","Grana Padano shavings","Grana-Padano-Späne","copeaux de Grana Padano"],
["Grana a scaglie","Grana shavings","Grana-Späne","copeaux de Grana"],
["grana a scaglie","Grana shavings","Grana-Späne","copeaux de Grana"],
["Grana in cottura","Grana, baked in","Grana, mitgebacken","Grana, cuit"],
["bordo ripieno di","crust stuffed with","Rand gefüllt mit","bord farci à la"],
["melanzane fritte","fried aubergine","frittierte Auberginen","aubergines frites"],
["patate al forno","oven-roasted potatoes","Ofenkartoffeln","pommes de terre au four"],
["fonduta di montasio","Montasio fondue","Montasio-Fondue","fondue de Montasio"],
["crema di olive nere","black-olive cream","Creme von schwarzen Oliven","crème d'olives noires"],
["formaggio di capra","goat's cheese","Ziegenkäse","fromage de chèvre"],
["formaggio salato","local salted cheese","regionaler Salzkäse","fromage salé local"],
["formaggi misti","mixed cheeses","gemischter Käse","fromages variés"],
["verdure miste","mixed vegetables","gemischtes Gemüse","légumes variés"],
["granella di pistacchio","chopped pistachios","gehackte Pistazien","éclats de pistache"],
["tuorlo d'uovo","egg yolk","Eigelb","jaune d'œuf"],
["lardo alle erbe","herbed lardo","Kräuter-Lardo","lardo aux herbes"],
["salame piccante","spicy salami","scharfe Salami","salami piquant"],
["salsa caesar","Caesar dressing","Caesar-Dressing","sauce César"],
["pollo fritto","crispy fried chicken","knuspriges Hähnchen","poulet frit"],
["misticanza","mixed leaves","Blattsalate","mesclun"],
["cipolla rossa","red onion","rote Zwiebel","oignon rouge"],
["peperoncino","chilli","Peperoncino","piment"],
["pepe nero","black pepper","schwarzer Pfeffer","poivre noir"],
["olive nere","black olives","schwarze Oliven","olives noires"],
["miele piccante","spicy honey","scharfer Honig","miel piquant"],
["radicchio","radicchio","Radicchio","radicchio"],
["mortadella","mortadella","Mortadella","mortadelle"],
["guanciale","guanciale","Guanciale","guanciale"],
["pecorino","pecorino","Pecorino","pecorino"],
["friarielli","friarielli greens","Friarielli","friarielli"],
["montasio","Montasio cheese","Montasio","Montasio"],
["speck","speck","Speck","speck"],
["feta","feta","Feta","feta"],
["brie","brie","Brie","brie"],
["gorgonzola","gorgonzola","Gorgonzola","gorgonzola"],
["mandorle","almonds","Mandeln","amandes"],
["naturale / frizzante","still / sparkling","still / sprudelnd","plate / gazeuse"],
["Non filtrata, non pastorizzata","Unfiltered, unpasteurised","Unfiltriert, nicht pasteurisiert","Non filtrée, non pasteurisée"],
["Artigianale Friulana","Friulian craft brewery","Friaulische Craft-Brauerei","brasserie artisanale frioulane"],
["Keller Pils, senza glutine","Keller Pils, gluten-free","Keller Pils, glutenfrei","Keller Pils, sans gluten"],
["Senza glutine","Gluten-free","Glutenfrei","Sans gluten"],
["American pale ale","American pale ale","American Pale Ale","American pale ale"],
["ripieno:","filling:","Füllung:","farce :"],
["base:","base:","Basis:","base :"],
["pomodorini","cherry tomatoes","Kirschtomaten","tomates cerises"],
["pomodoro","tomato","Tomate","tomate"],
["basilico","basil","Basilikum","basilic"],
["aglio","garlic","Knoblauch","ail"],
["olive","olives","Oliven","olives"],
["olio","oil","Öl","huile"],
["origano","oregano","Oregano","origan"],
["capperi","capers","Kapern","câpres"],
["acciughe","anchovies","Sardellen","anchois"],
["prosciutto","cooked ham","Kochschinken","jambon cuit"],
["porcini","porcini mushrooms","Steinpilze","cèpes"],
["funghi","mushrooms","Champignons","champignons"],
["carciofi","artichokes","Artischocken","artichauts"],
["tonno","tuna","Thunfisch","thon"],
["cipolla","onion","Zwiebel","oignon"],
["rucola","rocket","Rucola","roquette"],
["pesto genovese","Genoese pesto","Pesto Genovese","pesto génois"],
["bufala in cottura","buffalo mozzarella, baked in","Büffelmozzarella, mitgebacken","mozzarella de bufflonne, cuite"],
["bufala","buffalo mozzarella","Büffelmozzarella","mozzarella de bufflonne"],
["polenta","polenta","Polenta","polenta"],
["würstel","frankfurters","Würstel","saucisses"],
["wurstel","frankfurters","Würstel","saucisses"],
["pancetta","pancetta","Pancetta","pancetta"],
["salamino","salami","Salami","salami"],
["salame","salami","Salami","salami"],
["salsiccia","Italian sausage","Salsiccia","saucisse italienne"],
["bresaola","bresaola","Bresaola","bresaola"],
["zucchine","courgettes","Zucchini","courgettes"],
["pepe","pepper","Pfeffer","poivre"],
["noci","walnuts","Walnüsse","noix"],
["miele","honey","Honig","miel"],
["porro","leek","Lauch","poireau"],
["patate","potatoes","Kartoffeln","pommes de terre"],
["Bionda","Blonde","Hell","Blonde"],
["Ambrata","Amber","Bernstein","Ambrée"],
["Scura","Dark","Dunkel","Brune"],
["Lagher","Lager","Lager","Lager"],
["Bock","Bock","Bock","Bock"],
["Ipa","IPA","IPA","IPA"],
["Wieze","Wieze","Wieze","Wieze"],
];
function trDesc(s){
  if(LANG==="it"||!s) return s;
  const i = LANG==="en"?1:LANG==="de"?2:3;
  let out = s;
  for(const t of TERMS) out = out.split(t[0]).join(t[i]||t[0]);
  return out;
}
/* nomi generici tradotti (le pizze restano in italiano) — [en, de, fr] */
const NAME_TR = {
"Prosciutto Crudo":["Cured ham","Rohschinken","Jambon cru"],
"Prosciutto Crudo con Burrata":["Cured ham with burrata","Rohschinken mit Burrata","Jambon cru & burrata"],
"Prosciutto Crudo con Bufala":["Cured ham with buffalo mozzarella","Rohschinken mit Büffelmozzarella","Jambon cru & mozzarella de bufflonne"],
"Tagliere di Affettati Misti e Formaggi":["Mixed cured-meat & cheese board","Aufschnitt- & Käseplatte","Planche de charcuterie & fromages"],
"Caprese con Bufala e Pomodorini":["Caprese with buffalo mozzarella & cherry tomatoes","Caprese mit Büffelmozzarella & Kirschtomaten","Caprese à la bufflonne & tomates cerises"],
"Cotoletta e Patate Fritte":["Cutlet & fries","Schnitzel & Pommes","Escalope & frites"],
"Insalata Mista":["Mixed salad","Gemischter Salat","Salade mixte"],
"Panino Vegetariano e Patate Fritte":["Veggie sandwich & fries","Vegetarisches Sandwich & Pommes","Sandwich végétarien & frites"],
"Hot Dog e Patate Fritte":["Hot dog & fries","Hot Dog & Pommes","Hot-dog & frites"],
"Patatine Fritte":["French fries","Pommes frites","Frites"],
"Alette di Pollo (6 pz)":["Chicken wings (6 pcs)","Chicken Wings (6 Stk.)","Ailes de poulet (6 pcs)"],
"Anelli di Cipolla (6 pz)":["Onion rings (6 pcs)","Zwiebelringe (6 Stk.)","Rondelles d'oignon (6 pcs)"],
"Mini Frico (8 pz)":["Mini frico (8 pcs)","Mini-Frico (8 Stk.)","Mini frico (8 pcs)"],
"Pepite di Asiago (8 pz)":["Asiago nuggets (8 pcs)","Asiago-Nuggets (8 Stk.)","Nuggets d'Asiago (8 pcs)"],
"Montanare (4 pz)":["Montanare (4 pcs)","Montanare (4 Stk.)","Montanare (4 pcs)"],
"Stuzzica Mix":["Stuzzica mix","Stuzzica-Mix","Stuzzica mix"],
"Acqua 0,5 l · naturale / frizzante":["Water 0.5 l · still / sparkling","Wasser 0,5 l · still / sprudelnd","Eau 0,5 l · plate / gazeuse"],
"Bibite · bevande analcoliche 0,3 l":["Soft drinks · 0.3 l","Softdrinks · 0,3 l","Boissons sans alcool · 0,3 l"],
"Di Bufala":["Buffalo mozzarella","Büffelmozzarella","Mozzarella de bufflonne"],
"Crudo":["Cured ham","Rohschinken","Jambon cru"],
"Burrata":["Burrata","Burrata","Burrata"],
"Porcini":["Porcini","Steinpilze","Cèpes"],
"Pitina":["Pitina","Pitina","Pitina"],
"Ricotta":["Ricotta","Ricotta","Ricotta"],
"Brie":["Brie","Brie","Brie"],
"Gorgonzola dolce":["Sweet gorgonzola","Milder Gorgonzola","Gorgonzola doux"],
"Aggiunta di Bufala":["Add buffalo mozzarella","Büffelmozzarella extra","Supplément mozzarella de bufflonne"],
"Aggiunta di Burrata":["Add burrata","Burrata extra","Supplément burrata"],
"Aggiunta di Crudo":["Add cured ham","Rohschinken extra","Supplément jambon cru"],
"Aggiunta di Porcini":["Add porcini","Steinpilze extra","Supplément cèpes"],
"Aggiunta di Pitina":["Add pitina","Pitina extra","Supplément pitina"],
"Cornicione ripieno di Ricotta":["Ricotta-stuffed crust","Rand mit Ricotta","Bord farci à la ricotta"],
"Cornicione ripieno di Brie":["Brie-stuffed crust","Rand mit Brie","Bord farci au brie"],
"Cornicione ripieno di Gorgonzola dolce":["Sweet-gorgonzola stuffed crust","Rand mit mildem Gorgonzola","Bord farci au gorgonzola doux"],
"Impasto integrale":["Wholemeal dough","Vollkornteig","Pâte complète"],
"Coperto":["Cover charge","Gedeck","Couvert"],
"Alette di Pollo 6pz":["Chicken wings 6 pcs","Chicken Wings 6 Stk.","Ailes de poulet 6 pcs"],
"Anelli di Cipolla 6pz":["Onion rings 6 pcs","Zwiebelringe 6 Stk.","Rondelles d'oignon 6 pcs"],
"Mini Frico 8pz":["Mini frico 8 pcs","Mini-Frico 8 Stk.","Mini frico 8 pcs"],
"Pepite di Asiago 8pz":["Asiago nuggets 8 pcs","Asiago-Nuggets 8 Stk.","Nuggets d'Asiago 8 pcs"],
"Montanare 4pz":["Montanare 4 pcs","Montanare 4 Stk.","Montanare 4 pcs"],
"Acqua":["Water","Wasser","Eau"],
"Bibite":["Soft drinks","Softdrinks","Boissons sans alcool"],
};
function trName(n){
  if(LANG==="it") return n;
  const t = NAME_TR[n];
  const i = LANG==="en"?0:LANG==="de"?1:2;
  return t ? (t[i]||n) : n;
}

/* =============== dati menù — fedeli alla versione cartacea =============== */
const MENU = {
classiche:[
["Marinara Classica","pomodoro, aglio, olio, origano","6,50","1 - 7"],
["Marinara d'Oro","passata di pomodorino giallo, aglio, origano","8,00","1 - 7"],
["Margherita Classica","pomodoro, mozzarella, basilico","7,50","1 - 7"],
["Margherita Affumicata","pomodoro, provola affumicata in cottura, bufala affumicata fuori cottura, pepe, basilico","10,00","1 - 7"],
["Bufalina","pomodoro, mozzarella di Bufala in cottura, basilico","9,00","1 - 7"],
["Primo Amore","pomodoro, mozzarella di Bufala in cottura, pomodorini, basilico","9,50","1 - 7"],
["Siciliana","pomodoro, mozzarella, capperi, olive, acciughe, origano","9,00","1 - 7"],
["Diavola","pomodoro, mozzarella, salame piccante","8,50","1 - 7"],
["Prosciutto e Funghi","pomodoro, mozzarella, prosciutto, funghi","9,00","1 - 7"],
["Capricciosa","pomodoro, mozzarella, prosciutto, funghi, carciofi","10,00","1 - 7"],
["Tonno e Cipolla","pomodoro, mozzarella, tonno, cipolla","8,50","1 - 7"],
["Formaggi","pomodoro, mozzarella, formaggi misti","9,00","1 - 7"],
["Verdure","pomodoro, mozzarella, verdure miste","9,00","1 - 7"],
["Rucola, Grana e Pomodorini","pomodoro, mozzarella, rucola, pomodorini, Grana Padano in scaglie","9,50","1 - 7"]
],
audaci:[
["Burrata e Crudo","pomodoro, prosciutto crudo San Daniele, burrata","13,00","1 - 7"],
["Alpina","bordo ripieno di Gorgonzola, pomodoro, mozzarella, porcini, speck","13,00","1 - 7"],
["Parmigiana","pomodoro, mozzarella, provola affumicata, Grana in cottura, melanzane fritte, basilico","11,00","1 - 7"],
["Deliziosa","bordo ripieno di ricotta, pomodoro, mozzarella di Bufala in cottura, pomodorini, prosciutto crudo San Daniele","13,00","1 - 7"],
["Grassa","pomodoro, mozzarella, würstel, pancetta, salamino, salsiccia","11,00","1 - 7"],
["Maglio","pomodoro, mozzarella, cipolla rossa, salsiccia, patate al forno","10,00","1 - 7"],
["San Daniele","pomodoro, mozzarella, prosciutto crudo San Daniele","10,00","1 - 7"],
["Primavera","pomodoro, mozzarella di Bufala in cottura, rucola, pomodorini, Grana a scaglie, prosciutto crudo San Daniele","13,00","1 - 7"],
["Brie, Speck e Ricotta","pomodoro, mozzarella, ricotta affumicata, brie, speck","11,00","1 - 7"],
["Raf","pomodoro, mozzarella, salsiccia, Gorgonzola, porcini, mozzarella di Bufala fuori cottura, rucola","13,00","1 - 7"],
["Valtellina","pomodoro, mozzarella, bresaola, rucola, Grana Padano in scaglie","12,00","1 - 5 - 7"],
["Greca","pomodoro, olive, cipolla rossa, pomodorini, feta, rucola","11,00","1 - 5 - 7"],
["Saporita","pomodoro, mozzarella, porro, guanciale, formaggio salato, miele piccante","13,00","1 - 5 - 7"],
["Estiva","pomodoro, mozzarella, prosciutto crudo, pomodorini, pesto, burrata","13,00","1 - 7"],
["Tramontina","pomodoro, mozzarella, formaggio salato, polenta, pitina","13,00","1 - 7"],
["Friuli","pomodoro, mozzarella, salame, radicchio, montasio","12,00","1 - 7"],
["Genovese","passata di pomodorino giallo, bufala in cottura, pesto genovese, pomodorini semi dry","12,00","1 - 7 - 8"],
["Caprina","mozzarella, crema di olive nere, formaggio di capra, mandorle, pomodorini semi dry","12,00","1 - 7 - 8"],
["Sarah","pomodoro, mozzarella, patate al forno, brie, salamino","10,00","1 - 5 - 7"]
],
bianche:[
["Via Roma","mozzarella di Bufala in cottura, pomodorini semi dry, olive nere, ricotta affumicata","11,00","1 - 7"],
["Golosa","passata di peperoni, mozzarella, 'nduja, salsiccia, patate al forno","12,00","1 - 5 - 7"],
["Povera","mozzarella, mortadella, burrata, granella di pistacchio","12,00","1 - 7 - 8"],
["Carbonara","mozzarella, guanciale, tuorlo d'uovo, pecorino, pepe nero","12,00","1 - 3 - 7"],
["Frico","mozzarella, fonduta di montasio, cipolla, patate","12,00","1 - 7"],
["Friarielli e Salsiccia","mozzarella, friarielli, salsiccia, provola affumicata","11,00","1 - 7"],
["Delicata","mozzarella, lardo alle erbe, noci, miele, Gorgonzola","12,00","1 - 7 - 8"]
],
calzoni:[
["Classico","pomodoro, mozzarella, prosciutto, funghi","9,00","1 - 7"],
["Piccante","mozzarella, ricotta fresca, salame piccante, 'nduja, peperoncino","11,00","1 - 7"],
["Monte Jouf","ripieno: mozzarella, zucchine, pepe, ricotta · base: pomodoro, mozzarella, pancetta, patate","12,00","1 - 7","mezzaluna"]
],
cucina:[
["Prosciutto Crudo","tagliere di prosciutto crudo di San Daniele","10,00",""],
["Prosciutto Crudo con Burrata","","14,00","7"],
["Prosciutto Crudo con Bufala","","14,00","7"],
["Tagliere di Affettati Misti e Formaggi","","15,00","7 - 8"],
["Caprese con Bufala e Pomodorini","","10,00","7"],
["Cotoletta e Patate Fritte","","12,00","1 - 3 - 5 - 7 - 10 - *"],
["Caesar Salad","misticanza, pollo fritto, grana a scaglie, pomodorini, salsa caesar","12,00","1 - 3 - 5 - 7 - *"],
["Insalata Mista","rucola, radicchio, pomodorini","6,00",""],
["Insalata Bufalina","misticanza, pomodorini, olive, tonno, bufala","10,00","4 - 7"],
["Panino Vegetariano e Patate Fritte","pane con impasto della pizza, verdure miste e bufala","10,00","1 - 3 - 5 - 7 - 10"],
["Hot Dog e Patate Fritte","pane con impasto della pizza e wurstel","8,00","1 - 5 - 7 - 10"]
],
stuzzicherie:[
["Stuzzica Mix","","12,00","1 - 3 - 5 - 6 - 7 - 8 - 10 - *"],
["Patatine Fritte","","5,00","1 - 3 - 4 - 5 - 6 - 7 - 10 - *"],
["Alette di Pollo 6pz","","6,00","1 - 3 - 4 - 5 - 6 - 7 - 8 - 10 - *"],
["Anelli di Cipolla 6pz","","6,00","1 - 3 - 4 - 5 - 6 - 7 - 8 - 10 - *"],
["Mini Frico 8pz","","7,00","1 - 3 - 4 - 5 - 6 - 7 - 8 - 10 - *"],
["Pepite di Asiago 8pz","","7,00","1 - 3 - 4 - 5 - 6 - 7 - 8 - 10 - *"],
["Montanare 4pz","pizzette fritte con pomodoro, mozzarella e grana","12,00","1 - 3 - 4 - 5 - 7"]
]
};

const MENU_ART = {
  classiche:"assets/menu/classiche.webp",
  audaci:"assets/menu/audaci.webp",
  bianche:"assets/menu/bianche.webp",
  calzoni:"assets/menu/calzoni.webp",
  cucina:"assets/menu/cucina.webp",
  stuzzicherie:"assets/menu/stuzzicherie.webp",
  dolci:"assets/menu/dolci.webp",
  bevande:"assets/menu/bevande.webp"
};

const VARIANTI = [
["Aggiunta di Bufala","","3,00",""],
["Aggiunta di Burrata","","4,00","1 - 7"],
["Aggiunta di Crudo","","3,00",""],
["Aggiunta di Porcini","","2,00","*"],
["Aggiunta di Pitina","","4,00",""]
];
const CORNICE = [
["Cornicione ripieno di Ricotta","","3,00","7"],
["Cornicione ripieno di Brie","","3,00","7"],
["Cornicione ripieno di Gorgonzola dolce","","3,00","7"],
["Impasto integrale","","3,00",""],
["Coperto","","1,50",""]
];
const ACQUA_BIBITE = [
["Acqua","naturale / frizzante · 0,5 l","2,00",""],
["Bibite","bevande analcoliche · 0,3 l","3,00",""]
];
const BOTTIGLIA = [
["Garlatti Costa","Artigianale Friulana - Non filtrata, non pastorizzata",[
  ["Rush More","American pale ale · 0,3 l","5,00",""],
  ["Flag","Keller Pils - Senza glutine · 0,3 l","5,00",""],
  ["Iron Bridge","Ambrata · 0,3 l","5,00",""],
  ["Liquidambra","Scura · 0,3 l","5,00",""]]],
["Theresianer","Artigianale - Non filtrata, non pastorizzata",[
  ["Guglielmo","Lager · 0,5 l","6,50",""],
  ["Amleto","Bock · 0,5 l","6,50",""],
  ["Cordelia","IPA · 0,5 l","6,50",""]]]
];
const SPINA = [
["Hirter Marzen","Bionda","3,50","5,50","16,50"],
["Hirter Morchl","Ambrata","4,00","6,50","18,50"],
["Wieze Blanche","","4,00","6,50","18,50"]
];
const VINI = [
["Cabernet Franc","2,00","7,00","12,00"],
["Friulano","2,00","7,00","12,00"],
["Prosecco DOC Treviso","3,00","8,00","15,00"]
];

/* =============== render =============== */
let LANG = "it";
const $ = s => document.querySelector(s);

function formatDesc(s){
  if(!s) return "";
  return trDesc(s).split(" · ").map(part=>part ? part.charAt(0).toUpperCase()+part.slice(1) : part).join("<br>");
}
function allergenButton(name,codes="",desc=""){
  if(name==="Coperto")return "";
  const info=getAllergenInfo(name,desc,codes),label={it:"Allergeni",en:"Allergens",de:"Allergene",fr:"Allergènes"}[LANG];
  if(!info.codes.length&&!info.frozen)return "";
  const nums=info.codes.join(" · ");
  return `<button class="allergen-trigger" type="button" data-allergen-key="${escapeHTML(name)}" data-item-name="${escapeHTML(trName(name))}" data-codes="${info.codes.join(',')}" data-original="${escapeHTML(codes)}" data-description="${escapeHTML(desc)}" aria-haspopup="dialog" aria-label="${label}: ${escapeHTML(trName(name))}, ${nums}">${nums}${info.frozen?' <span class="frozen-mark">*</span>':''}</button>`;
}
function item(n,d,p,a="",q=""){
  const qualifier=q?`<span class="qualifier">${trDesc(q)}</span>`:"";
  return `<div class="item"><div class="row"><span class="label"><span class="nome">${trName(n)}</span>${qualifier}</span><span class="dots"></span><span class="prezzo">${p}</span></div>${d?`<p class="desc">${formatDesc(d)}</p>`:""}${allergenButton(n,a,d)}</div>`;
}
const renderRows = rows => rows.map(r=>item(...r)).join("");
function renderMenu(){
  const t = T[LANG];
  const order = ["classiche","audaci","bianche","calzoni","cucina","stuzzicherie","dolci","bevande"];
  $("#chips").innerHTML = order.map((id,i)=>`<button data-go="${id}" class="${i===0?"on":""}">${t.cats[id][0]}</button>`).join("");

  let html = "";
  order.forEach(id=>{
    const [titolo,tag] = t.cats[id];
    const hasArt = Boolean(MENU_ART[id]);
    html += `<section class="mcat fx ${hasArt?"has-art":"no-art"}" id="cat-${id}"><header class="mcat-head"><h3>${titolo}</h3>${tag?`<p class="tag">${tag}</p>`:""}</header>`;
    if(hasArt) html += `<figure class="menu-art menu-art-${id}"><div class="menu-art-window"><img src="${MENU_ART[id]}" alt="${titolo}" loading="lazy" decoding="async"></div></figure>`;
    html += `<div class="mcat-body">`;

    if(MENU[id]) html += renderRows(MENU[id]);
    if(id==="calzoni"){
      html += `<p class="groupline">${t.varianti}</p>`;
      html += renderRows(VARIANTI);
      html += `<p class="variant-callout">${t.variant_callout}</p>`;
      html += renderRows(CORNICE);
    }
    if(id==="dolci"){
      html += `<p class="dolci-note">${t.dolci_note}</p>`;
      html += allergenButton(t.cats.dolci[0]);
    }
    if(id==="bevande"){
      html += renderRows(ACQUA_BIBITE);
      html += `<p class="groupline">${t.bottiglia}</p>`;
      for(const g of BOTTIGLIA){
        html += `<p class="groupsub"><strong>${g[0]}</strong> · ${trDesc(g[1])}</p>`;
        html += renderRows(g[2]);
      }
      html += `<p class="groupline">${t.spina}</p>`;
      html += SPINA.map(b=>`<div class="item multi drink-item"><div class="row"><span class="label"><span class="nome">${b[0]}</span>${b[1]?`<span class="qualifier">${trDesc(b[1])}</span>`:""}</span><span class="dots"></span><div class="pricegrid"><span><em>0,3 l</em><b>${b[2]}</b></span><span><em>0,5 l</em><b>${b[3]}</b></span><span><em>${t.caraffa} 1,5 l</em><b>${b[4]}</b></span></div></div>${allergenButton(b[0],"",b[1])}</div>`).join("");
      html += `<p class="groupline">${t.vini}</p>`;
      html += VINI.map(v=>`<div class="item multi drink-item"><div class="row"><span class="label"><span class="nome">${v[0]}</span></span><span class="dots"></span><div class="pricegrid"><span><em>${t.calice}</em><b>${v[1]}</b></span><span><em>${t.caraffa} 0,5 l</em><b>${v[2]}</b></span><span><em>${t.bott} 0,75 l</em><b>${v[3]}</b></span></div></div>${allergenButton(v[0])}</div>`).join("");
    }
    html += `</div></section>`;
  });
  $("#carta").innerHTML = html;
  bindChips(); observeAll();
  if(typeof chipScrollState==="function") requestAnimationFrame(chipScrollState);
}


/* =============== i18n apply =============== */
function applyLang(l){
  LANG = l;
  document.documentElement.lang = l;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.dataset.i18n;
    if(T[l][k] !== undefined) el.innerHTML = T[l][k];
  });
  document.querySelectorAll(".lang button").forEach(b=>b.classList.toggle("on", b.dataset.lang===l));
  applyUiText();
  renderShow();
  updateFornoCopy();
  requestAnimationFrame(()=>window.__viaRomaSliderMotion?.category.refreshGeometry());
  renderMenu();
  renderGallery();
  renderCustomer();
  renderSocialFallback();
  updateOpenState();
  applySentenceFlow();
  requestAnimationFrame(updatePrimaryNav);
  document.querySelectorAll("#showrail .bgimg, #forno .bgimg, #custgrid .bgimg").forEach(im=>imgObs.observe(im));
  if(window.__lbTag) window.__lbTag();
}
document.querySelectorAll(".lang button").forEach(b=>b.addEventListener("click",()=>applyLang(b.dataset.lang)));

/* =============== chips + spy =============== */
function scrollToMenuCategory(id,{updateHash=true}={}){
  const el=document.getElementById("cat-"+id);
  if(!el)return false;
  // Sticky top UI + chip index: keep the printed category heading fully visible.
  const cb=document.querySelector(".chipbar");
  const off=64+(cb?cb.offsetHeight:60)+12;
  const y=Math.max(0,el.getBoundingClientRect().top+scrollY-off);
  document.querySelectorAll("#chips button").forEach(button=>button.classList.toggle("on",button.dataset.go===id));
  if(updateHash&&history.pushState){try{history.pushState(null,"",`#cat-${id}`)}catch(_){}}
  scrollTo({top:y,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
  return true;
}
let spyCat;
function bindChips(){
  document.querySelectorAll("#chips button").forEach(b=>{
    b.addEventListener("click",()=>scrollToMenuCategory(b.dataset.go));
  });
  if(spyCat) spyCat.disconnect();
  spyCat = new IntersectionObserver(es=>{
    es.forEach(e=>{
      if(e.isIntersecting){
        const id = e.target.id.replace("cat-","");
        document.querySelectorAll("#chips button").forEach(b=>{
          const on = b.dataset.go===id;
          b.classList.toggle("on",on);
          if(on) b.parentElement.scrollTo({left:b.offsetLeft-(b.parentElement.clientWidth-b.offsetWidth)/2,behavior:"smooth"});
        });
      }
    });
  },{rootMargin:"-25% 0px -65% 0px"});
  document.querySelectorAll(".mcat").forEach(s=>spyCat.observe(s));
}


/* =============== carosello categorie (catshow) =============== */
const SHOW_ORDER = ["classiche","audaci","bianche","calzoni","cucina","stuzzicherie","dolci","bevande"];
const SHOW = SHOW_ORDER.map(id=>[id,MENU_ART[id]||null]);
const SHOW_CLONES = SHOW.length;
function renderShow(){
  const t = T[LANG];
  const slide = ([id,img],clone=false) => {
    const description=t.cats[id][1]||"";
    return `<div class="slide" data-cat="${id}"${clone?' data-clone="1" aria-hidden="true"':''}>
    <article class="preview-card">
      <header class="preview-head"><h2>${t.cats[id][0]}</h2></header>
      <a draggable="false" class="preview-window ${img?"":"is-abstract"}" href="#cat-${id}" data-cat-go="${id}" aria-label="${escapeHTML(t.cats[id][0])}"${clone?' tabindex="-1"':''}>
        <span class="preview-trace t1"></span><span class="preview-trace t2"></span>
        ${img?`<img class="preview-cutout bgimg" data-src="${img}" alt="${clone?'':escapeHTML(t.cats[id][0])}">`:`<span class="preview-dust" aria-hidden="true"></span>`}
      </a>
      <p class="sub${description?'':' is-empty'}"${description?'':' aria-hidden="true"'}>${description||'&nbsp;'}</p>
    </article>
  </div>`;
  };
  const head=SHOW.map(d=>slide(d,true)).join("");
  const real=SHOW.map(d=>slide(d,false)).join("");
  const tail=SHOW.map(d=>slide(d,true)).join("");
  document.getElementById("showrail").innerHTML=head+real+tail;
  document.getElementById("showdots").innerHTML=SHOW.map((_,i)=>`<button type="button" data-showdot="${i}" aria-label="${t.cats[SHOW[i][0]][0]}"></button>`).join("");

}

/* =============== carosello categorie: buffered infinite loop =============== */
const rail = document.getElementById("showrail");
document.querySelectorAll("[data-show]").forEach(b=>b.addEventListener("click",()=>{
  const direction=Number(b.dataset.show),motion=window.__viaRomaSliderMotion?.category;
  motion?.moveBy(direction);
}));
document.getElementById("showdots").addEventListener("click",e=>{const d=e.target.closest("[data-showdot]");if(!d)return;const logical=Number(d.dataset.showdot),motion=window.__viaRomaSliderMotion?.category;motion?.moveToLogical(logical)});
rail.addEventListener("click",e=>{
  const target=e.target.closest("[data-cat-go]");
  if(!target)return;
  e.preventDefault();
  scrollToMenuCategory(target.dataset.catGo);
});

/* =============== carosello forno: nomi, loop, dots, drag =============== */
const FORNO = [
["assets/pizze/margherita.webp","Margherita Classica","pomodoro, mozzarella, basilico"],
["assets/pizze/bufalina.webp","Bufalina","pomodoro, mozzarella di Bufala in cottura, basilico"],
["assets/pizze/burrata-e-crudo.webp","Burrata e Crudo","pomodoro, prosciutto crudo San Daniele, burrata"],
["assets/pizze/alpina.webp","Alpina","bordo ripieno di Gorgonzola, pomodoro, mozzarella, porcini, speck"],
["assets/pizze/deliziosa.webp","Deliziosa","bordo ripieno di ricotta, pomodoro, mozzarella di Bufala in cottura, pomodorini, prosciutto crudo San Daniele"],
["assets/pizze/saporita.webp","Saporita","pomodoro, mozzarella, porro, guanciale, formaggio salato, miele piccante"],
["assets/pizze/via-roma.webp","Via Roma","mozzarella di Bufala in cottura, pomodorini semi dry, olive nere, ricotta affumicata"],
["assets/pizze/friarielli-e-salsiccia.webp","Friarielli e Salsiccia","mozzarella, friarielli, salsiccia, provola affumicata"],
["assets/pizze/povera.webp","Povera","mozzarella, mortadella, burrata, granella di pistacchio"],
["assets/pizze/monte-jouf.webp","Monte Jouf","ripieno: mozzarella, zucchine, pepe, ricotta · base: pomodoro, mozzarella, pancetta, patate"],
];
const forno = document.getElementById("forno");
const N = FORNO.length;
function formatFornoIngredients(value){
  const translated=trDesc(value||"");
  return translated ? translated.charAt(0).toUpperCase()+translated.slice(1) : "";
}
function fig(d,clone){
  const logicalIndex=FORNO.indexOf(d);
  return `<figure data-forno-index="${logicalIndex}"${clone?' data-clone="1" aria-hidden="true"':''}><div class="shot"><img class="pizza bgimg" style="position:static" data-src="${d[0]}" alt="${clone?'':d[1]}"></div><figcaption><span>${d[1]}</span></figcaption><p class="forno-ingredients">${escapeHTML(formatFornoIngredients(d[2]))}</p></figure>`
}
function updateFornoCopy(){
  document.querySelectorAll("#forno figure[data-forno-index]").forEach(figure=>{
    const data=FORNO[Number(figure.dataset.fornoIndex)];
    const copy=figure.querySelector(".forno-ingredients");
    if(data&&copy) copy.textContent=formatFornoIngredients(data[2]);
  });
}
/* loop infinito: buffer di cloni su entrambi i lati, ampio abbastanza
   da coprire il viewport più largo. CLONES = N garantisce copertura totale. */
const CLONES = N;
(function buildForno(){
  let head="", tail="";
  for(let i=0;i<CLONES;i++){
    head += fig(FORNO[(N - CLONES + i)%N], true);   // ultimi CLONES elementi
    tail += fig(FORNO[i%N], true);                    // primi CLONES elementi
  }
  forno.innerHTML = head + FORNO.map(d=>fig(d,false)).join("") + tail;
})();
document.getElementById("fornodots").innerHTML = FORNO.map((_,i)=>`<button type="button" data-d="${i}" aria-label="${escapeHTML(FORNO[i][1])}"></button>`).join("");

document.querySelectorAll("[data-forno]").forEach(b=>b.addEventListener("click",()=>{
  const direction=Number(b.dataset.forno),motion=window.__viaRomaSliderMotion?.pizza;
  motion?.moveBy(direction);
}));
document.querySelectorAll("#fornodots button").forEach(d=>d.addEventListener("click",()=>{
  const logical=Number(d.dataset.d),motion=window.__viaRomaSliderMotion?.pizza;
  motion?.moveToLogical(logical);
}));

/* Finite community rail: preserve release velocity; no snap-back. */
window.__communityMotion=createDragRail(document.getElementById("custgrid"));

/* =============== gallery fotografica: album / reel player =============== */
const GALLERY_ALBUMS={
  bancone:["assets/gallery/bancone-01.webp","assets/gallery/bancone-02.webp","assets/gallery/bancone-03.webp","assets/gallery/bancone-04.webp","assets/gallery/bancone-05.webp","assets/gallery/bancone-06.webp","assets/gallery/bancone-07.webp"],
  sala_sinistra:["assets/gallery/sala-sinistra-01.webp","assets/gallery/sala-sinistra-02.webp","assets/gallery/sala-sinistra-03.webp","assets/gallery/sala-sinistra-04.webp","assets/gallery/sala-sinistra-05.webp","assets/gallery/sala-sinistra-06.webp","assets/gallery/sala-sinistra-07.webp","assets/gallery/sala-sinistra-08.webp","assets/gallery/sala-sinistra-09.webp"],
  sala_destra:["assets/gallery/sala-destra-01.webp","assets/gallery/sala-destra-02.webp","assets/gallery/sala-destra-03.webp","assets/gallery/sala-destra-04.webp","assets/gallery/sala-destra-05.webp","assets/gallery/sala-destra-06.webp","assets/gallery/sala-destra-07.webp","assets/gallery/sala-destra-08.webp"],
  esterno:["assets/gallery/esterno-01.webp","assets/gallery/esterno-02.webp","assets/gallery/esterno-03.webp","assets/gallery/esterno-04.webp","assets/gallery/esterno-05.webp","assets/gallery/esterno-06.webp","assets/gallery/esterno-07.webp"],
  via_roma:["assets/gallery/via-roma-01.webp","assets/gallery/via-roma-02.webp","assets/gallery/via-roma-03.webp","assets/gallery/via-roma-04.webp","assets/gallery/via-roma-05.webp","assets/gallery/via-roma-06.webp","assets/gallery/via-roma-07.webp","assets/gallery/via-roma-08.webp","assets/gallery/via-roma-09.webp"]
};
const GALLERY_ITEMS=Object.entries(GALLERY_ALBUMS).flatMap(([place,sources])=>sources.map(src=>({src,place})));
const galleryController=createViaRomaGallery(GALLERY_ITEMS,i=>`${T[LANG].g_categories[GALLERY_ITEMS[i].place]} · Via Roma`,()=>LANG);
function renderGallery(){galleryController.render()}
window.__viaRomaGallery=galleryController;

/* =============== customer gallery =============== */
const WA_NUMBER = "393802453757";
const CUSTOMER = [
  {
    "src": "assets/community/stefano-55cc3122.webp",
    "name": "Stefano",
    "ratio": "1360 / 1020"
  },
  {
    "src": "assets/community/paola-bcc3ede8.webp",
    "name": "Paola",
    "ratio": "459 / 1020"
  },
  {
    "src": "assets/community/tomaz-96f3508e.webp",
    "name": "Tomaz",
    "ratio": "1360 / 765"
  },
  {
    "src": "assets/community/david-a1ea9444.webp",
    "name": "David",
    "ratio": "1020 / 1020"
  },
  {
    "src": "assets/community/giovanni-f9dc1207.webp",
    "name": "Giovanni",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/erika-7f3209a1.webp",
    "name": "Erika",
    "ratio": "1360 / 1020"
  },
  {
    "src": "assets/community/gretabeta-663170c5.webp",
    "name": "Gretabeta",
    "ratio": "1360 / 613"
  },
  {
    "src": "assets/community/carina-30dddd1c.webp",
    "name": "Carina",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/fabio-9e64d53d.webp",
    "name": "Fabio",
    "ratio": "1360 / 1017"
  },
  {
    "src": "assets/community/silvia-85ad0cf5.webp",
    "name": "Silvia",
    "ratio": "1080 / 720"
  },
  {
    "src": "assets/community/matteo-4f4e3cd9.webp",
    "name": "Matteo",
    "ratio": "1360 / 1020"
  },
  {
    "src": "assets/community/marcella-66be12e8.webp",
    "name": "Marcella",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/stefano-8bafe209.webp",
    "name": "Stefano",
    "ratio": "460 / 1020"
  },
  {
    "src": "assets/community/jordan-6ba8df12.webp",
    "name": "Jordan",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/spyros-cf8d8220.webp",
    "name": "Spyros",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/dominik-4804d9ab.webp",
    "name": "Dominik",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/cicilia-493c6ab4.webp",
    "name": "Cicilia",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/paola-500461c8.webp",
    "name": "Paola",
    "ratio": "460 / 1020"
  },
  {
    "src": "assets/community/gennaro-a4bad54c.webp",
    "name": "Gennaro",
    "ratio": "574 / 1020"
  },
  {
    "src": "assets/community/fabiosa-41a7f900.webp",
    "name": "Fabiosa",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/stefano-60f3a69e.webp",
    "name": "Stefano",
    "ratio": "1360 / 613"
  },
  {
    "src": "assets/community/fabrizio-fe24ce2a.webp",
    "name": "Fabrizio",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/richard-a0bd5019.webp",
    "name": "Richard",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/zoxer-e070b464.webp",
    "name": "ZoXer",
    "ratio": "496 / 1020"
  },
  {
    "src": "assets/community/pietro-82612084.webp",
    "name": "Pietro",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/tomaz-420fe57f.webp",
    "name": "Tomaz",
    "ratio": "574 / 1020"
  },
  {
    "src": "assets/community/david-96d7b77b.webp",
    "name": "David",
    "ratio": "1020 / 1020"
  },
  {
    "src": "assets/community/giovanni-0869e547.webp",
    "name": "Giovanni",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/erika-c356f761.webp",
    "name": "Erika",
    "ratio": "1360 / 1020"
  },
  {
    "src": "assets/community/gretabeta-b63bd6a1.webp",
    "name": "Gretabeta",
    "ratio": "1360 / 613"
  },
  {
    "src": "assets/community/carina-326a5b44.webp",
    "name": "Carina",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/stefano-fb4407ec.webp",
    "name": "Stefano",
    "ratio": "1232 / 1020"
  },
  {
    "src": "assets/community/steven-bff0f36c.webp",
    "name": "Steven",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/alan-47cd32c8.webp",
    "name": "Alan",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/paola-035fc484.webp",
    "name": "Paola",
    "ratio": "460 / 1020"
  },
  {
    "src": "assets/community/bostjan-e488dc29.webp",
    "name": "Bostjan",
    "ratio": "945 / 1020"
  },
  {
    "src": "assets/community/carla-999174d9.webp",
    "name": "Carla",
    "ratio": "574 / 1020"
  },
  {
    "src": "assets/community/raffaele-a8267454.webp",
    "name": "Raffaele",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/stefano-bd6a2c19.webp",
    "name": "Stefano",
    "ratio": "1360 / 613"
  },
  {
    "src": "assets/community/fabio-d55c6bde.webp",
    "name": "Fabio",
    "ratio": "1360 / 1020"
  },
  {
    "src": "assets/community/silvia-d839414b.webp",
    "name": "Silvia",
    "ratio": "800 / 640"
  },
  {
    "src": "assets/community/matteo-68330e6d.webp",
    "name": "Matteo",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/marcella-8781a883.webp",
    "name": "Marcella",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/tomaz-a3e72513.webp",
    "name": "Tomaz",
    "ratio": "574 / 1020"
  },
  {
    "src": "assets/community/david-59ffcd7a.webp",
    "name": "David",
    "ratio": "1020 / 1020"
  },
  {
    "src": "assets/community/giovanni-e848855a.webp",
    "name": "Giovanni",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/erika-5f6313c1.webp",
    "name": "Erika",
    "ratio": "1360 / 1020"
  },
  {
    "src": "assets/community/gretabeta-45a37be8.webp",
    "name": "Gretabeta",
    "ratio": "1360 / 613"
  },
  {
    "src": "assets/community/carina-5a23f980.webp",
    "name": "Carina",
    "ratio": "765 / 1020"
  },
  {
    "src": "assets/community/paola-4db29589.webp",
    "name": "Paola",
    "ratio": "460 / 1020"
  },
  {
    "src": "assets/community/stefano-8f10684a.webp",
    "name": "Stefano",
    "ratio": "1360 / 613"
  }
];
function renderCustomer(){
  const t=T[LANG];
  document.getElementById("custgrid").innerHTML=CUSTOMER.map(c=>{
    const bits=String(c.ratio||"4 / 3").split("/").map(Number),r=(bits[0]||4)/(bits[1]||3);
    const shape=r>1.45?"wide":r<.9?"tall":"regular";
    return `<figure class="cust-cell ${shape}" style="--ratio:${c.ratio||'4 / 3'}"><span class="cust-badge">${escapeHTML(c.name)}</span><img class="bgimg" data-src="${c.src}" alt="${t.cu_eyebrow} · ${escapeHTML(c.name)}"><figcaption><span>${escapeHTML(c.name)}</span><i>@pizzeriaviaromamaniago</i></figcaption></figure>`;
  }).join("");
  const cta=document.getElementById("custcta");cta.href=`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t.wa_msg)}`;
  requestAnimationFrame(()=>window.__updateCustomerMeter?.());
}

/* =============== lightbox: foto a schermo intero =============== */
(function(){
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lb-img");
  const lbCap = document.getElementById("lb-cap");
  const lbDesc = document.getElementById("lb-desc");
  const navL = lb.querySelector(".lb-nav.l");
  const navR = lb.querySelector(".lb-nav.r");
  // gruppi di immagini apribili: contenitore cliccabile → immagine + caption
  const GROUPS = [
    {tap:"#forno figure:not([data-clone])", img:"img", all:"#forno figure:not([data-clone]) img",
     capFrom:im=>im.closest("figure").querySelector("figcaption span")?.textContent||"",
     descFrom:im=>im.closest("figure").querySelector(".forno-ingredients")?.textContent||""},
    {tap:"#custgrid .cust-cell", img:"img", all:"#custgrid .cust-cell img",
     capFrom:im=>im.closest("figure").querySelector("figcaption span")?.textContent||""}
  ];
  let group=[], idx=0, scrollY=0, previousFocus=null;
  // src piena risoluzione: usa data-src (lazy) se presente, altrimenti src
  const fullSrc = im => im.getAttribute("data-src") || im.currentSrc || im.src;

  function show(i){
    idx = (i+group.length)%group.length;
    const im = group[idx];
    lbImg.src = fullSrc(im);
    lbImg.alt = im.alt||"";
    const cap = im.__cap ? im.__cap() : "";
    const desc = im.__desc ? im.__desc() : "";
    lbCap.textContent = cap;
    lbCap.style.display = cap ? "" : "none";
    lbDesc.textContent = desc;
    lbDesc.classList.toggle("on",!!desc);
    const multi = group.length>1;
    navL.style.display = navR.style.display = multi ? "" : "none";
  }
  function open(im, list){
    group = list; scrollY = window.scrollY; previousFocus=document.activeElement;
    // blocca lo scroll di fondo SENZA spostare la pagina (niente position:fixed):
    // overflow hidden mantiene la posizione corrente intatta.
    document.documentElement.style.overflow="hidden";
    document.body.style.overflow="hidden";
    show(list.indexOf(im));
    lb.classList.add("on");
    document.getElementById("lb-close").focus({preventScroll:true});
    window.dispatchEvent(new Event("lightbox:opened"));
  }
  function close(){
    lb.classList.remove("on");
    previousFocus?.focus({preventScroll:true});
    document.documentElement.style.overflow="";
    document.body.style.overflow="";
    // ripristina la posizione dopo che il layout si è ristabilito
    const y = scrollY;
    requestAnimationFrame(()=>window.scrollTo(0, y));
    window.dispatchEvent(new Event("lightbox:closed"));
  }

  window.__openGalleryLightbox = (sources,start=0,label="")=>{
    if(!Array.isArray(sources)||!sources.length) return;
    const list=sources.map((src,i)=>{
      const im=new Image();
      im.setAttribute("data-src",src);
      im.alt=`${label} · ${String(i+1).padStart(2,"0")}`;
      im.__cap=()=>im.alt;
      return im;
    });
    open(list[Math.max(0,Math.min(start,list.length-1))],list);
  };

  // delegazione: un solo listener per tutti (anche immagini caricate dopo)
  document.addEventListener("click", e=>{
    if(lb.classList.contains("on")) return;
    const clone=e.target.closest('#forno figure[data-clone]');
    if(clone){const originals=[...document.querySelectorAll('#forno figure:not([data-clone]) img')];originals.forEach(x=>{x.__cap=()=>x.closest('figure').querySelector('figcaption span')?.textContent||'';x.__desc=()=>x.closest('figure').querySelector('.forno-ingredients')?.textContent||''});const im=originals[Number(clone.dataset.fornoIndex)];if(im)open(im,originals);return}               // già aperto → gestito altrove
    for(const g of GROUPS){
      const cell = e.target.closest(g.tap);
      if(cell){
        const im = cell.querySelector(g.img);
        if(!im) return;
        const list=[...document.querySelectorAll(g.all)];
        list.forEach(x=>{x.__cap=()=>g.capFrom(x);x.__desc=()=>g.descFrom?g.descFrom(x):""});
        open(im, list);
        return;
      }
    }
  });
  // marca il cursore zoom-in sulle celle apribili (estetica)
  function tagZoom(){ GROUPS.forEach(g=>document.querySelectorAll(g.tap).forEach(c=>c.setAttribute("data-zoom",""))); }
  tagZoom(); addEventListener("resize", tagZoom);
  window.__lbTag = tagZoom;   // richiamabile dopo i re-render

  lb.addEventListener('keydown',e=>{
    if(e.key!=='Tab'||!lb.classList.contains('on'))return;
    const buttons=[...lb.querySelectorAll('button')].filter(b=>b.style.display!=='none');
    const first=buttons[0],last=buttons[buttons.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
  });

  // chiusura: click fuori (sfull'overlay/vuoto), bottone X, Esc.
  // Non chiude cliccando sull'immagine, sulle frecce o sulla X, né dopo un drag.
  let suppressClick=false;
  lb.addEventListener("click", e=>{
    if(suppressClick){ suppressClick=false; return; }
    if(e.target.closest("#lb-img, .lb-nav, #lb-close")) return;
    close();
  });
  document.getElementById("lb-close").addEventListener("click", e=>{ e.stopPropagation(); close(); });
  navL.addEventListener("click", e=>{ e.stopPropagation(); show(idx-1); });
  navR.addEventListener("click", e=>{ e.stopPropagation(); show(idx+1); });
  addEventListener("keydown", e=>{
    if(!lb.classList.contains("on")) return;
    if(e.key==="Escape") close();
    else if(e.key==="ArrowLeft" && group.length>1) show(idx-1);
    else if(e.key==="ArrowRight" && group.length>1) show(idx+1);
  });

  /* drag / swipe per cambiare foto (mouse + touch).
     L'immagine segue il dito; oltre la soglia si passa alla foto prec/succ,
     altrimenti torna al centro. */
  let dragging=false, sx=0, sy=0, dx=0, decided=null;
  const fig = lb.querySelector("figure");
  function dragStart(e){
    if(group.length<2) return;
    if(e.target.closest(".lb-nav, #lb-close")) return;
    dragging=true; decided=null; dx=0;
    sx=e.clientX; sy=e.clientY;
    fig.style.transition="none";
    try{ lb.setPointerCapture(e.pointerId); }catch(_){}
  }
  function dragMove(e){
    if(!dragging) return;
    const mx=e.clientX-sx, my=e.clientY-sy;
    // decide una sola volta se il gesto è orizzontale (swipe) o verticale (ignora)
    if(decided===null && (Math.abs(mx)>6 || Math.abs(my)>6)){
      decided = Math.abs(mx) > Math.abs(my) ? "h" : "v";
    }
    if(decided!=="h") return;
    e.preventDefault();
    dx=mx;
    fig.style.transform=`translateX(${dx}px)`;
    fig.style.opacity = String(Math.max(.4, 1 - Math.abs(dx)/600));
  }
  function dragEnd(){
    if(!dragging) return;
    dragging=false;
    if(decided==="h" && Math.abs(dx)>4) suppressClick=true;
    fig.style.transition="";
    const threshold = Math.min(120, innerWidth*0.18);
    if(decided==="h" && Math.abs(dx)>threshold){
      const dir = dx<0 ? 1 : -1;   // trascina a sinistra → foto successiva
      // esci nella direzione del drag, poi mostra e rientra dal lato opposto
      fig.style.transition="transform .2s ease, opacity .2s ease";
      fig.style.transform=`translateX(${dx<0?-innerWidth:innerWidth}px)`;
      fig.style.opacity="0";
      setTimeout(()=>{
        show(idx+dir);
        fig.style.transition="none";
        fig.style.transform=`translateX(${dx<0?innerWidth:-innerWidth}px)`;
        fig.style.opacity="0";
        requestAnimationFrame(()=>{
          fig.style.transition="transform .32s cubic-bezier(.22,1,.36,1), opacity .32s ease";
          fig.style.transform="translateX(0)";
          fig.style.opacity="1";
        });
      },180);
    } else {
      // torna al centro
      fig.style.transform="translateX(0)";
      fig.style.opacity="1";
    }
    dx=0; decided=null;
  }
  lb.addEventListener("pointerdown", dragStart);
  lb.addEventListener("pointermove", dragMove);
  addEventListener("pointerup", dragEnd);
  addEventListener("pointercancel", dragEnd);
})();

/* chevron chips + rilevamento scroll (fade laterali) */
const chipsEl = document.getElementById("chips");
const chipInner = document.querySelector(".chipbar-inner");
document.querySelectorAll("[data-chip]").forEach(b=>b.addEventListener("click",()=>{
  chipsEl.scrollBy({left: Number(b.dataset.chip)*180, behavior:"smooth"});
}));
function chipScrollState(){
  const overflow = chipsEl.scrollWidth - chipsEl.clientWidth;
  const scrollable = overflow > 2;
  chipsEl.classList.toggle("scrollable", scrollable);
  if(!scrollable){ chipInner.classList.remove("can-l","can-r"); return; }
  chipInner.classList.toggle("can-l", chipsEl.scrollLeft > 4);
  chipInner.classList.toggle("can-r", chipsEl.scrollLeft < overflow - 4);
}
chipsEl.addEventListener("scroll", chipScrollState, {passive:true});
addEventListener("resize", chipScrollState);




/* =============== experiential helpers =============== */
function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
function sentenceMarkup(value=""){
  const clean=String(value).replace(/\s+/g," ").trim();
  const parts=clean.match(/[^.!?]+(?:[.!?]+|$)/g)||[clean];
  return parts.filter(Boolean).map(part=>`<span class="sentence-unit">${escapeHTML(part.trim())}</span>`).join("");
}
function applySentenceFlow(){
  document.querySelectorAll(".sentence-flow").forEach(el=>{
    if(el.dataset.sentenceLang===LANG&&el.querySelector(".sentence-unit"))return;
    const source=el.textContent.trim();el.innerHTML=sentenceMarkup(source);el.dataset.sentenceLang=LANG;
  });
}

/* Complete short original review bodies. Dates/stars are never inferred. */
const REVIEW_LIBRARY=[
  {
    "author": "Massimo",
    "source": "Tripadvisor",
    "date": "2024-08-04",
    "url": "https://www.tripadvisor.it/ShowUserReviews-g790406-d20931745-r963185522-Pizzeria_Via_Roma-Maniago_Province_of_Pordenone_Friuli_Venezia_Giulia.html",
    "text": "Pizzeria via Roma Maniago pizza molto buona, camerieri top, la consiglio. Location accettabile, le bibite in questo caso la birra, molto buona."
  },
  {
    "author": "Fabrizio",
    "source": "Google · Restaurant Guru",
    "date": null,
    "url": "https://restaurantguru.it/Pizzeria-Via-Roma-Maniago",
    "text": "Abbiamo mangiato in questa pizzeria al ritorno delle nostre vacanze in moto, pizza e birra ottime , personale gentilissimo e cordiale."
  },
  {
    "author": "FeMi07",
    "source": "Tripadvisor",
    "date": "2024-07-30",
    "url": "https://www.tripadvisor.it/ShowUserReviews-g790406-d20931745-r962441073-Pizzeria_Via_Roma-Maniago_Province_of_Pordenone_Friuli_Venezia_Giulia.html",
    "text": "Pizza molto ricca con prodotti di qualità!!! Personale gentile e rapido…si può cenare anche all’aperto. Prezzo nella norma\nSicuramente ci tornerò!!!"
  },
  {
    "author": "Edoardo",
    "source": "Google · Restaurant Guru",
    "date": null,
    "url": "https://restaurantguru.it/Pizzeria-Via-Roma-Maniago/reviews?bylang=1",
    "text": "Personale gentilissimo e pizza spettacolare, leggera e molto digeribile con ingredienti di qualità"
  }
];
function renderReviewCards(reviews){
 const track=document.getElementById('reviewTrack');if(!track)return;
 const card=(r,clone=false)=>{
   const date=r.date?`<time datetime="${r.date}">${new Intl.DateTimeFormat(LANG,{month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.date))}</time>`:'';
   return `<article class="rev"${clone?' aria-hidden="true"':''}><blockquote lang="it"><p>${escapeHTML(r.text)}</p></blockquote><div class="src"><span class="review-author"><b>${escapeHTML(r.author)}</b></span><span class="review-meta"><a href="${r.url}" target="_blank" rel="noopener"${clone?' tabindex="-1"':''}>${escapeHTML(r.source)}</a>${date}</span></div></article>`;
 };
 track.innerHTML=`<div class="review-runner" id="reviewRunner">${reviews.map(r=>card(r)).join('')}${reviews.map(r=>card(r,true)).join('')}</div>`;track.dataset.reviewCount=String(reviews.length);window.__refreshReviewTicker?.();
}
function renderSocialFallback(){renderReviewCards(REVIEW_LIBRARY)}
(function enableReviewTicker(){
  const viewport=document.getElementById("reviewTrack");if(!viewport)return;
  const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let pos=0,half=0,last=0,paused=false,drag=null,raf=0,resumeTimer=0,visible=false,suppressUntil=0;
  const schedule=()=>{if(!reduced&&visible&&!document.hidden&&!raf)raf=requestAnimationFrame(tick)};
  const runner=()=>viewport.querySelector(".review-runner");
  const normalize=()=>{if(half>0){pos%=half;if(pos<0)pos+=half}};
  const paint=()=>{const r=runner();if(r)r.style.transform=`translate3d(${-pos.toFixed(3)}px,0,0)`};
  const refresh=()=>requestAnimationFrame(()=>{
    const r=runner();if(!r)return;
    const n=Math.max(1,Number(viewport.dataset.reviewCount)||Math.floor(r.children.length/2));
    half=r.children[n]?.offsetLeft||r.scrollWidth/2;
    normalize();paint();
  });
  window.__refreshReviewTicker=()=>{pos=0;last=0;refresh()};
  const pause=()=>{paused=true;clearTimeout(resumeTimer)};
  const resume=(delay=0)=>{clearTimeout(resumeTimer);resumeTimer=setTimeout(()=>{paused=false;last=0;schedule()},delay)};
  function tick(ts){
    raf=0;
    if(!last)last=ts;const dt=Math.min(40,ts-last);last=ts;
    if(!reduced&&!paused&&!drag&&!document.hidden&&visible&&half){pos+=dt*.034;normalize();paint()}
    schedule();
  }
  viewport.addEventListener("mouseenter",pause);viewport.addEventListener("mouseleave",()=>resume(180));
  viewport.addEventListener("focusin",pause);viewport.addEventListener("focusout",()=>resume(420));
  viewport.addEventListener("pointerdown",e=>{
    pause();drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:pos,axis:null,moved:false};

  });
  viewport.addEventListener("pointermove",e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.axis&&(Math.abs(dx)>5||Math.abs(dy)>5))drag.axis=Math.abs(dx)>Math.abs(dy)?"x":"y";
    if(drag.axis!=="x")return;
    if(!drag.moved){try{viewport.setPointerCapture(e.pointerId)}catch(_){}}
    drag.moved=true;e.preventDefault();pos=drag.start-dx;normalize();paint();viewport.classList.add("dragging");
  });
  const end=e=>{if(!drag||e&&e.pointerId!==drag.id)return;if(drag.moved)suppressUntil=performance.now()+350;drag=null;viewport.classList.remove("dragging");resume(900)};
  viewport.addEventListener("click",e=>{if(performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation()}},true);
  viewport.addEventListener("pointerup",end);viewport.addEventListener("pointercancel",end);viewport.addEventListener("lostpointercapture",()=>end());
  document.addEventListener("visibilitychange",()=>{last=0;if(document.hidden)pause();else resume(250)});
  window.addEventListener("resize",refresh,{passive:true});
  if("ResizeObserver" in window)new ResizeObserver(refresh).observe(viewport);
  if("IntersectionObserver" in window)new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting;last=0;
    if(visible)schedule();else if(raf){cancelAnimationFrame(raf);raf=0}
  },{rootMargin:"20% 0px 20%",threshold:.01}).observe(viewport);
  else{visible=true;schedule()}
  refresh();
})();

/* Open / closed state in the restaurant's local time. */
function updateOpenState(){
  const el=document.getElementById("openState");if(!el)return;
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/Rome",weekday:"short",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).formatToParts(new Date());
  const get=t=>parts.find(p=>p.type===t)?.value||"";const day=get("weekday"),hour=Number(get("hour")),minute=Number(get("minute"));
  const monday=day==="Mon",open=!monday&&hour>=18&&hour<23;
  const label=open?ui("open_now"):ui("closed_now");
  el.classList.toggle("open",open);el.classList.toggle("closed",!open);el.querySelector("[data-status-label]").textContent=label;
}
setInterval(updateOpenState,60000);

/* The info section uses a restrained touch/cursor particle field. */

/* The original master is played in its encoded order. Only playback time follows scroll. */
(function initContinuousFilm(){
  const section=document.getElementById('storia'),scenes=section.querySelector('[data-walkthrough-scenes]'),copyLayer=section.querySelector('[data-walkthrough-copies]');
  const poster=document.createElement('img');poster.className='walkthrough-poster';poster.src=WALKTHROUGH_FILM.poster;poster.alt='';poster.loading='lazy';scenes.append(poster);
  const video=document.createElement('video');video.className='walkthrough-video';video.muted=true;video.playsInline=true;video.preload='metadata';video.setAttribute('aria-hidden','true');video.setAttribute('disablepictureinpicture','');scenes.append(video);
  copyLayer.innerHTML=WALKTHROUGH_STEPS.slice(1).map(step=>`<div class="film-copy" aria-hidden="true"><p class="k-s" data-i18n="${step.eyebrowKey}">${T[LANG][step.eyebrowKey]}</p><h2 data-i18n="${step.titleKey}">${T[LANG][step.titleKey]}</h2><p data-i18n="${step.bodyKey}">${T[LANG][step.bodyKey]}</p></div>`).join('');
  const copies=[...copyLayer.children],reduced=matchMedia('(prefers-reduced-motion: reduce)'),clamp=x=>Math.max(0,Math.min(1,x));
  let raf=0,last=0,visible=false,loaded=false,metadata=false,top=0,span=1,progress=0,target=0,pending=null;
  function copyOpacity(time){return WALKTHROUGH_FILM.copyWindows.map(([a,holdStart,holdEnd,b])=>time<=a||time>=b?0:time<holdStart?(time-a)/(holdStart-a):time<=holdEnd?1:(b-time)/(b-holdEnd))}
  function paintCopies(time){copyOpacity(time).forEach((opacity,i)=>{copies[i].style.opacity=String(opacity);copies[i].setAttribute('aria-hidden',opacity>.05?'false':'true')})}
  function staticMode(){return reduced.matches||Boolean(navigator.connection?.saveData)}
  function measure(){top=section.getBoundingClientRect().top+scrollY;span=Math.max(1,section.offsetHeight-innerHeight);target=clamp((scrollY-top)/span);schedule()}
  function ensureMedia(){if(loaded||staticMode())return;loaded=true;video.src=WALKTHROUGH_MOBILE?WALKTHROUGH_FILM.mobileSrc:WALKTHROUGH_FILM.src;video.load()}
  function schedule(){if(visible&&!document.hidden&&!staticMode()&&!raf)raf=requestAnimationFrame(tick)}
  function seek(time){if(!metadata||video.seeking){pending=time;return}pending=null;if(Math.abs(video.currentTime-time)>=1/48)video.currentTime=time;else paintCopies(video.currentTime)}
  function tick(now){
    raf=0;const dt=last?Math.min(45,now-last):16;last=now;target=clamp((scrollY-top)/span);
    progress+=(target-progress)*(1-Math.exp(-dt/75));if(Math.abs(target-progress)<.00015)progress=target;
    const duration=Number.isFinite(video.duration)?video.duration:WALKTHROUGH_FILM.duration;
    const time=Math.min(Math.max(0,duration-1/24),Math.round(progress*duration*24)/24);seek(time);
    if(Math.abs(target-progress)>.0001)schedule();
  }
  video.addEventListener('loadedmetadata',()=>{metadata=true;schedule()});
  video.addEventListener('loadeddata',()=>{video.classList.add('is-ready');schedule()});
  video.addEventListener('seeked',()=>{paintCopies(video.currentTime);if(pending!==null){const time=pending;pending=null;seek(time)}});
  video.addEventListener('error',()=>{video.classList.remove('is-ready');section.classList.add('is-static');copies.forEach(c=>c.style.opacity='0')});
  function setMode(){section.classList.toggle('is-static',staticMode());if(staticMode()){cancelAnimationFrame(raf);raf=0;video.pause();copies.forEach(c=>c.style.opacity='0')}else{ensureMedia();measure()}}
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;last=0;if(visible){ensureMedia();measure()}else{cancelAnimationFrame(raf);raf=0}},{rootMargin:'500px 0px'}).observe(section);
  new ResizeObserver(measure).observe(document.body);addEventListener('resize',measure,{passive:true});addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){cancelAnimationFrame(raf);raf=0}else schedule()});reduced.addEventListener('change',setMode);navigator.connection?.addEventListener?.('change',setMode);document.fonts?.ready.then(measure);
  section.classList.toggle('is-static',staticMode());measure();
  window.__viaRomaFilm={copyOpacity,getState:()=>({progress,target,time:video.currentTime,source:video.getAttribute('src'),seeking:video.seeking})};
})();


/* Community: a finite horizontal composition, never a long raw-image wall. */
(function initCustomerReel(){
  const reel=document.getElementById("custgrid"),meter=document.getElementById("custMeter");if(!reel||!meter)return;let raf=0;
  function update(){raf=0;const max=Math.max(1,reel.scrollWidth-reel.clientWidth),p=Math.max(0,Math.min(1,reel.scrollLeft/max));meter.style.transform=`scaleX(${p.toFixed(4)})`;}
  window.__updateCustomerMeter=update;
  reel.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});addEventListener("resize",update,{passive:true});
  if("ResizeObserver" in window)new ResizeObserver(update).observe(reel);requestAnimationFrame(update);
})();

/* Particle fields are initialized by app.js. */
/* =============== reveal + lazy =============== */
let fxObs;
function observeAll(){
  if(fxObs) fxObs.disconnect();
  fxObs = new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add("vis"); fxObs.unobserve(e.target); }
  }),{threshold:.1});
  document.querySelectorAll(".fx").forEach(el=>fxObs.observe(el));
}
const imgObs = new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    const im = e.target;
    if(im.dataset.src){
      const reveal=()=>im.classList.add("vis");
      im.onload=reveal; im.onerror=reveal; im.src=im.dataset.src;
      if(im.complete) reveal();
    }
    imgObs.unobserve(im);
  }
}),{rootMargin:"250px"});
document.querySelectorAll(".bgimg").forEach(im=>imgObs.observe(im));

/* =============== top bar + tab spy =============== */
const sent = document.createElement("div");
sent.style.cssText = "position:absolute;top:60px;height:1px;width:1px;pointer-events:none";
document.body.prepend(sent);
new IntersectionObserver(([e])=>{$("#topbar").classList.toggle("solid",!e.isIntersecting)},{rootMargin:"0px"}).observe(sent);
const primaryNavStops=[
  {id:"home",tab:""},
  {id:"catshow",tab:"menu"},
  {id:"storia",tab:"storia"},
  {id:"dove",tab:"dove"}
];
let navTick=0;
function updatePrimaryNav(){
  navTick=0;
  const probe=scrollY+innerHeight*.5;
  let active=primaryNavStops[0].tab;
  primaryNavStops.forEach(stop=>{const el=document.getElementById(stop.id);if(el&&probe>=el.offsetTop)active=stop.tab});
  document.querySelectorAll(".tabbar a[data-tab]").forEach(a=>a.classList.toggle("on",a.dataset.tab===active));
  const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
  document.querySelector(".tabbar")?.style.setProperty("--scroll-progress",Math.max(0,Math.min(1,scrollY/max)).toFixed(4));
}
function queuePrimaryNav(){if(navTick)return;navTick=requestAnimationFrame(updatePrimaryNav)}
addEventListener("scroll",queuePrimaryNav,{passive:true});
addEventListener("resize",queuePrimaryNav,{passive:true});
updatePrimaryNav();

applyUiText();
renderShow();
renderMenu();
renderGallery();
renderCustomer();
renderSocialFallback();
updateOpenState();
applySentenceFlow();
updatePrimaryNav();
observeAll();
document.querySelectorAll("#showrail .bgimg, #forno .bgimg, #custgrid .bgimg").forEach(im=>imgObs.observe(im));
requestAnimationFrame(chipScrollState);
