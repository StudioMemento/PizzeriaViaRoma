# Via Roma 3.8 — griglia ordinata e popup compatto

18 novembre 2026. Base: ViaRoma_3.7_MENU. ZIP completo, senza deploy.

## Background

La reference usa righe e colonne riconoscibili, non una distribuzione libera dei punti. Il generatore ora visita celle regolari di 6px. La probabilità di occupazione scende dal bordo esterno con potenza 2,5; le celle presenti hanno dimensioni e luminosità diverse. Una dissolvenza morbida completa il falloff interno. I due lati mantengono semi diversi e riproducibili.

La posizione e la dimensione di ciascun quadrato non cambiano durante l'animazione. Varia soltanto la luminosità, con cicli sinusoidali indipendenti di 10–22s. Il limite di 3000 celle per lato usa campionamento a serbatoio sui viewport grandi, evitando di troncare il disegno in basso. Le geometrie sono allineate ai pixel del canvas prima del disegno.

Dimensioni 1–1,5px CSS; oro #c6ab70; fondo #090909. Fasce limitate al gutter e a 520px per lato, entro le proporzioni precedenti. Nessun elemento decorativo entra nella colonna di lettura. Nessun nuovo hover, glow o strato sulle immagini.

Il colore #090909 è esteso a html/body, superfici di foto e cornicioni, community/contatti, fallback della mappa, superfici dei dialog e pagine legali. I controlli satinati, le maschere alpha e i contenuti fotografici mantengono il proprio trattamento.

## Bevande e cucina

Tutti i 15 nomi di bevande sono testo semplice. Sono stati rimossi anche i trigger numerici dalle righe delle bevande: acqua/bibite, birre in bottiglia, birre alla spina e vini. L'apertura da nome o numero resta attiva per il cibo. Le 18 associazioni formato/prezzo di birre alla spina e vini non cambiano.

Il copy italiano della cucina ha un'interruzione esplicita dopo “Anche se incredibile...” sotto 768px. Da desktop viene mantenuto uno spazio. Altre traduzioni e copy non sono alterati.

## Allergeni

Rimossa l'etichetta “Allergeni” sotto il titolo del piatto. Ogni riga mantiene numero, nome e descrizione integrali: il nome è su una riga propria, la descrizione subito sotto e allineata allo stesso inizio. Tracking del nome 0,065em; descrizione leggermente più piccola. Presenti in oro, altri in grigio; nessun cerchio o separatore.

Il popup segue la larghezza e l’altezza dinamiche della finestra. Sui telefoni con più spazio, i nomi misurano 14,5 px e le descrizioni 13 px. Fino a 860 px di altezza, nomi e descrizioni variano rispettivamente tra 12,5–14 px e 11,75–12,5 px. I margini tengono conto delle aree di sicurezza. Fra 721 e 860 px un pixel sopra e sotto ogni voce separa gli allergeni.

La lista occupa una colonna in verticale sui formati ordinari. Fino a 560 px di altezza passa a due colonne. A partire da 460 px di larghezza e fino a 340 px di altezza, usa tre colonne. I numeri si leggono dall’alto verso il basso in ogni colonna. Ogni nome rimane insieme alla sua descrizione.

Chiusura con click ovunque, X o Escape e ripristino dello scroll invariati. Il popup conserva overflow accessibile per zoom, font ingranditi e viewport fuori dai campioni: nessun testo viene ritagliato per simulare l'assenza di scroll.

## Verifiche eseguite

- TypeScript, build client/SSR, prerender e controllo dei bundle.
- Confronto di 86 item con la carta approvata: nomi, descrizioni, prezzi e qualificatori conservati; codici allergeni del cibo conservati.
- Verifica dei 15 nomi di bevande senza pulsanti/dialog; verifica di tutte le 18 associazioni formato/prezzo.
- Esecuzione degli handler reali di item, popup e navigazione; 15 allergeni nelle quattro lingue, apertura del cibo, chiusura, scroll lock e cleanup.
- Geometria della griglia e budget sui breakpoint 320–7680px; righe/colonne fisse, falloff e limite di celle. Pause per offscreen, scheda nascosta, dialog e movimento ridotto.
- Painter reale rasterizzato a quattro formati e 0/3/6s; colonna centrale verificata pixel per pixel come #090909. Confronto visivo con lo screenshot fornito.

Campione reference: x=16, y=32, 384×688px, escluso il bordo arrotondato. Con criterio R>40, R>G+2, G>B+2, la reference contiene 1913 pixel oro visibili; la 3.8 ne contiene 1608 / 1614 / 1607 a 0 / 3 / 6s. È un indicatore di presenza/contrasto, non un punteggio di qualità.

## Costo di disegno

Canvas 2D nativo: due fasce, 30 fotogrammi di riscaldamento e 200 misurati. Non include compositing del browser, blur della pagina, GPU o dispositivi fisici.

| Formato | Celle totali | Pixel canvas totali | Media | P95 |
| --- | ---: | ---: | ---: | ---: |
| 390×844 | 524 | 263328 | 0,55ms | 0,77ms |
| 768×1024 | 1904 | 942080 | 1,60ms | 2,00ms |
| 1440×900 | 4121 | 1596810 | 3,29ms | 3,88ms |
| 3440×1440 | 6000 | 1598112 | 5,11ms | 6,92ms |

Il motore resta differito, sotto 4KB gzip, con massimo 20 ridisegni/s e 62 riempimenti per frame. Nessuna dipendenza aggiunta. Questi tempi variano con il carico dell'ambiente e non dimostrano miglioramenti di FPS rispetto alle build precedenti.

La build finale misura 99.627 byte gzip di JavaScript iniziale, 107.574 byte per tutti i chunk JavaScript, 8.658 byte di CSS e 9.509 byte di HTML. Il controllo del progetto fissa il limite CSS a 8.700 byte.

## Riscontri nel browser

L’archivio recuperato richiedeva fino a 56 px di scorrimento a 375×736 con titoli tradotti lunghi e 180 px a 568×320. Su schermi stretti e molto alti la larghezza della pagina poteva spostare la chiusura oltre il bordo destro. Il layout aggiornato usa la larghezza del viewport, adatta lo spazio alle traduzioni e distribuisce le righe su più colonne quando serve.

Sulla build di produzione locale, Chromium 153 ha aperto ciascuno dei 70 piatti nelle quattro lingue su 36 risoluzioni distinte. Includendo i profili con aree di sicurezza, i casi di layout sono 39 e le aperture sono 10.920. In ogni apertura sono stati controllati il titolo corrispondente al piatto, tutte le 15 voci, la nota finale e i limiti della finestra visibile. Nessun caso ha richiesto di scorrere a dimensione testo predefinita.

Il margine riportato è la distanza minima dal bordo superiore del titolo o dal bordo inferiore della nota, considerando tutti i piatti e le lingue.

| Finestra CSS | Condizione | Margine minimo |
| --- | --- | ---: |
| 320×480 | Verticale | 16,2 px |
| 320×568 | Verticale | 15,7 px |
| 375×736 | Verticale | 66,6 px |
| 390×844 | Aree di sicurezza emulate | 121,3 px |
| 393×852 | Aree di sicurezza emulate | 119,3 px |
| 568×280 | Orizzontale | 13,9 px |
| 480×320 | Orizzontale | 6,4 px |
| 844×390 | Aree di sicurezza emulate | 39,0 px |
| 768×1024 | Verticale | 128,4 px |
| 1440×900 | Orizzontale | 63,3 px |

Durante il cambio alla preferenza di movimento ridotto, un fotogramma già programmato può leggere il nuovo valore prima dell’evento del browser. Il motore ora aggiorna subito lo stato della griglia e arresta il ridisegno. Un test riproduce questo ordine degli eventi.

Le prove di interazione hanno verificato il tap e il clic su tutte le 15 bevande nelle quattro lingue, l’apertura sui piatti, la chiusura con X, clic o Escape e il ritorno del focus. Con testo di prova ingrandito, lo scorrimento interno consente di raggiungere la nota finale mentre la pagina rimane ferma. Sono verifiche su viewport emulati in Chromium.

`node tests/menu/browser.mjs` controlla interazioni, navigazione fra categorie, griglia, preferenze di movimento, prezzi e copy. `node tests/menu/dialog-viewport.mjs` misura tutti i piatti e salva il risultato per formato e lingua. Entrambi usano l’anteprima sulla porta 4175. `tests/menu/estimate-dialog.mjs` resta disponibile per una stima basata sulle metriche dei font.
