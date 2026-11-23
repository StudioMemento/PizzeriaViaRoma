# Via Roma V7.0

La V7.0 parte dalla 6.7. I link della Privacy sono senza sottolineatura. Nelle Note legali il CAP apre la seconda riga della sede legale. Nella scheda Solfiti la seconda parte della descrizione inizia con «di SO₂ totale». L’impaginazione segue lo stesso criterio nelle quattro lingue. Il checkpoint di riferimento per il ripristino è la 5.3.

Build di sviluppo per Pizzeria Via Roma a Maniago. La Diavola mostra fette larghe di spianata tonda, Tonno e Cipolla e Frico usano cipolla rossa, Raf e Greca hanno più rucola. Sulle due Marinare l’aglio è presente nell’olio e non compare a fette. Le sette foto hanno due risoluzioni WebP. I prezzi, gli ingredienti in carta e le schede allergeni seguono la 5.9.

Sui telefoni il selettore conserva le quattro lingue a vista e un’area di tocco alta 44 px. Il marchio orizzontale in testata usa i tracciati originali ingranditi. Le cinque icone della navbar condividono la stessa griglia e lo stesso spessore di tratto. La lingua e la categoria attive conservano il bordo e il glow dorato. Le particelle appaiono soltanto sul controllo sotto il puntatore. Un piccolo indicatore dorato segnala il focus da tastiera. Con il mouse la freccia bianca misura 13 × 15 px e mantiene la sagoma del riferimento anche su link, slider e finestre aperte.

La sezione «Dal nostro forno» usa due filetti oro e lo sfondo animato delle gallerie. La sua altezza utilizza il viewport stabile durante lo scroll su telefono. La pizza selezionata resta al centro della fila per cinque secondi prima di passare alla successiva. Le due frecce occupano lo spazio tra il piatto centrale e quelli laterali. Il titolo si estende tra i margini della sua riga. Nome e ingredienti partono dal bordo sinistro della seconda icona della navbar inferiore. Uno swipe veloce può superare più pizze e rallenta fino al nuovo centro. Lo scroll verticale e il pinch sono gestiti dal browser. Il trascinamento orizzontale funziona su tutta la sezione, compresi titolo, ingredienti e spazi vuoti. Il nome della pizza apre la relativa scheda allergeni. Le frecce e la tastiera permettono di sfogliare le 40 pizze. Con movimento ridotto la selezione è manuale e immediata.

Le otto immagini di categoria hanno un filetto dorato di tre pixel, più sottile alle estremità. Ogni filetto occupa una fascia propria. Dopo le bevande, un riquadro 16:9 accosta «Pizzata a casa? Facciamo anche servizio da asporto!» alla pizza Via Roma sulla destra, nel cartone con il coperchio aperto dietro al cornicione. La fotografia riempie la card e il browser sceglie tra tre risoluzioni WebP. La foto riprende la Via Roma del menù in primo piano su un fondo antracite. Il cartone lascia spazio attorno al cornicione. Il marchio originale in alto a sinistra condivide il margine interno del testo. Il punto interrogativo del titolo usa Open Sans Light. Le lettere usano Jost Light. Una sfumatura scurisce il fondo dietro al testo in basso a sinistra.

## Avvio e deploy

Lo ZIP contiene `package.json`, `vercel.json` e i sorgenti direttamente alla radice. Per il progetto Vercel di sviluppo, estrarre il contenuto nella radice della repository. Il preset è Vite. La configurazione usa `npm ci`, `npm run build` e la directory di output `dist`. L’anteprima mantiene `noindex,nofollow`.

Usare Node 24 o Node 22 dalla versione 22.13.

```sh
npm ci
npm run dev
```

## Sezioni finali

Lo spazio sopra e sotto le card dell’asporto e della community cresce con la loro larghezza per lasciare liberi i bordi durante il tilt. I blocchi social e contatti hanno un margine verticale che si adatta all’altezza dello schermo.

- **Il locale.** Ogni ambiente occupa almeno una schermata. Il titolo precede il proprio panorama e la pagina scorre liberamente tra i cinque ambienti. Le foto conservano il taglio 4:3. Sui monitor ultrawide la scala segue il riferimento live e il riquadro ha spazio per entrambe le estremità della curva. La proiezione e la maschera disegnano un arco continuo, più alto ai lati. Il browser sceglie la risoluzione in base alle dimensioni dello schermo. Il trascinamento orizzontale sullo slider lascia libero lo scorrimento verticale della pagina. Le 40 foto arrivano ai bordi dello schermo. Trascinamento, frecce e click per centrare una foto funzionano anche con il movimento automatico in pausa.
- **Ricordi condivisi dalla community.** Una card 16:9 usa lo stesso componente, i margini, il riflesso e il tilt dell’asporto. La card mostra tre Polaroid con i ritagli quadrati delle fotografie originali del bancone, della sala sinistra e della sala destra su fondo scuro, con il titolo in basso a sinistra e la freccia al margine destro. Il link apre la raccolta Foto della scheda di Pizzeria Via Roma Maniago su Google Maps.
- **Social e recensioni.** Instagram e Facebook sono affiancati in formato 2×1 su desktop e 1×1 su telefono. Le quattro recensioni quadrate seguono su una o due righe. I collegamenti sono in `src/data/venue-links.ts`.
- **Contatti.** La veduta con i riferimenti a Via Roma e Piazza Italia apre Maps. Indirizzo e località sono in basso a sinistra, con la freccia sullo stesso margine interno in basso a destra. Accanto alla mappa, il riquadro di logo e orari precede la card 2×1 con il numero 0427 541 232 e la dicitura «PER ORDINI & PRENOTAZIONI». Il numero è centrato e usa la stessa tipografia e lo stesso margine interno degli orari. Tutta la card attiva la chiamata. Sui telefoni in verticale la mappa, gli orari e il telefono occupano tre righe a tutta larghezza, anche quando la barra del browser riduce lo spazio disponibile.
- **Fondo della galleria e dei contatti.** Le particelle si concentrano lungo i bordi, seguono orbite lente e risalgono in una corrente che richiama dolcemente le particelle vicine al puntatore o al tocco. Con movimento ridotto restano ferme.
- **Cookie, Privacy e Note legali.** La Privacy comprende la nota sulle immagini illustrative. Le Note legali riportano i dati dell’attività. Il popup carica la pagina nella lingua selezionata. La stessa pagina è raggiungibile direttamente, anche con JavaScript disattivato. I testi italiani si trovano in `public` e quelli tradotti in `public/en`, `public/de` e `public/fr`. Il lettore mantiene il titolo e il pulsante di chiusura in vista durante lo scorrimento. Il copyright e il credito Memento sono affiancati e hanno due righe ciascuno. La partita IVA compare sotto il nome della pizzeria.
La navbar apre la categoria con un indirizzo come `#classiche`. Gli orari e i contatti si raggiungono da `#info`. I collegamenti delle versioni precedenti continuano ad aprire la relativa sezione. Su telefono i tre collegamenti legali sono centrati sotto i crediti.
Un clic o un tocco sul testo, sul titolo o sullo sfondo chiude il popup. I collegamenti interni aprono il documento scelto.
Lo scorrimento permette di leggere il documento per intero.

## Ingredienti e allergeni

Il [confronto voce per voce](docs/Allergeni_5.9.md) indica la pagina del menù stampato, i codici sulla carta e i codici presentati sul sito.
La quarta voce di ogni riga alimentare in `src/data/menu.json` comprende le indicazioni della carta, degli ingredienti espliciti e della base di pizza o calzone. L’asterisco conserva l’indicazione di prodotto surgelato. Per le voci alimentari prive di codici, il nome apre la scheda. Il nome delle bevande apre la relativa scheda. Per le birre alla spina e i vini i codici sono nell’ultima colonna, dopo i tre prezzi.

Prima dell’uso con il pubblico, il gestore deve confrontare le indicazioni con le ricette e le schede effettivamente in uso, in particolare per impasti, lisozima nel grana, pesto, salumi, salse, panature e olio di frittura. Per i dolci del giorno, i vini e le bevande generiche serve la scheda del prodotto effettivamente servito. I dati del gestore nelle note legali provengono dal modulo compilato dal locale.

Le quattro lingue usano la stessa legenda di 14 gruppi e l’asterisco. Le categorie evidenziate dipendono dai codici della voce. Le dieci birre evidenziano il gruppo 1. Marinara Classica e Marinara d’Oro evidenziano i gruppi 1 e 7 per la presenza di latte nell’impasto confermata dal locale.

## Verifiche

I test controllano le 40 pizze in quattro lingue, lo spazio per le didascalie, la card asporto, il cambio lingua, il movimento ridotto e gli input touch, mouse e tastiera. Il test dei popup apre le 70 voci alimentari e le 15 bevande in 39 combinazioni di viewport e area sicura per ciascuna lingua. Il titolo del menù segue la larghezza della pagina anche durante la rotazione. La hero risponde al cambio di preferenza di movimento mentre la pagina è aperta.

```sh
npm run check
npm test
npm run preview -- --host 127.0.0.1 --port 4175
```

Con l’anteprima avviata, Playwright e Chromium disponibili nell’ambiente di test, eseguire da un secondo terminale:

```sh
node tests/intro/catalog-browser.mjs
node tests/intro/viewport.mjs
node tests/finale/browser.mjs
node tests/finale/navigation.mjs
node tests/menu/browser.mjs
node tests/menu/dialog-viewport.mjs
```

`TEST_URL`, `PLAYWRIGHT_MODULE` e `CHROMIUM_PATH` permettono di indicare URL di anteprima, modulo Playwright e browser. Il controllo del pacchetto si avvia con `DEPLOY_ZIP=/percorso/V7.0.zip node scripts/verify-package.mjs`. I documenti in `docs` descrivono i checkpoint precedenti.
