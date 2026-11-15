# Via Roma V22 — collaudo indipendente

## Vincolo del menù cartaceo

La V21 finale è la baseline immutabile. Il controllo non si limita ai nomi dei file: confronta SHA-256 di 164 file originali, inclusi Menu, Dialogs, i18n, dati, 19 fogli CSS preesistenti, font e immagini. Conserva anche l’ordine dei nove import CSS originali e un’istantanea dell’intero sottalbero HTML prerenderizzato `#menu` (47.860 caratteri). Il confronto del sottalbero intercetta cambiamenti indiretti introdotti da componenti condivisi come Photo o SectionAtmosphere.

Un controllo AST dei nuovi CSS richiede un ambito positivo esterno al menù. Rifiuta selettori globali, modifiche ereditabili su body/root, selettori che raggiungono il menù e ridefinizioni delle animazioni CSS precedenti. Sono consentiti gli ambiti espliciti delle sezioni non-menu e dei controlli di navigazione. Il codice condiviso GradualBlur e il blur locale del menù restano congelati.

## Controlli riproducibili

- `node scripts/verify-v22.mjs --source-only`: congelamento, isolamento CSS e controlli comportamentali senza richiedere una build.
- `npm run check`: TypeScript, build browser/SSR, prerender e verifica del pacchetto.
- `npm test`: controllo completo V22, incluso confronto del menù compilato e verifica degli asset finali.

Venti controlli positivi esercitano i verificatori reali: una copia temporanea di Menu viene modificata e respinta; varianti non autorizzate di titolo, prezzo, immagine e classe vengono respinte; CSS globali o rivolti al menù falliscono mentre selettori circoscritti passano. Il progetto effettivo non viene alterato da questi controlli.

## Audit di correttezza e risorse

| Area | Verifica indipendente |
| --- | --- |
| Navigazione condivisa | Il test esegue il controller reale con eventi e geometria deterministici. Un solo listener scroll per più sottoscrittori, un RAF per una raffica di eventi, nessuna nuova lettura di layout durante lo scroll, aggiornamento su resize, cancellazione a pagina nascosta, pulizia finale e protezione da completamento tardivo dei font. PASS. |
| Caroselli DOM | Il test esegue il vero hook useCarousel con slot React e clock simulati. Nessun RAF o caricamento immagini fuori vista; precaricamento limitato alle card vicine; autoplay a scadenza; hover, pausa esplicita e reduced motion eliminano i timer/RAF continui; pointercancel rilascia la cattura e lo scroll verticale non la acquisisce. Pulizia degli observer/listener verificata. PASS. |
| Circular Gallery | Audit del sorgente: attivazione differita, shader piatto a due triangoli per foto quando wave=0, upload limitato a una texture per frame visibile, stato di pausa realmente inattivo, cancellazione fuori vista/a pagina nascosta, fallback e ripristino del contesto. Verifica GPU reale demandata alla sessione del producer. |
| Accordion Gallery | Audit del sorgente: import GSAP differito, observer stabili tra selezioni, un solo aggiornamento del layout per selezione, sottoscrizione live a reduced motion, completamento/chiusura delle timeline fuori vista o a pagina nascosta. |
| Effetti | Il test del vero arbitro verifica un solo campo decorativo selezionato, scelta accorpata in un RAF, passaggio al candidato più visibile e riattivazione dello stesso Symbol prima del RAF. PASS. Community riservata alla gallery. Particles limita i disegni a 30/s e il buffer a circa 850.000 pixel: il callback RAF rimane alla frequenza del display e non viene descritto come un limite a 30 callback/s. |

I controlli di scheduler sono test deterministici del codice reale, non misurazioni di frame rate, browser completi o telefoni emulati. Il comportamento GPU e il risultato visivo richiedono la prova runtime separata.

## Build finale

`npm run check && npm test` completato dalla lane integrazione con esito positivo. La lane QA ha rieseguito indipendentemente `node scripts/verify-v22.mjs` e `node scripts/check-build.mjs` sul risultato finale: entrambi PASS. Il menù compilato coincide byte per byte con l’istantanea V21; i 164 file congelati, 74 fotografie, otto banner del menù, quattro lingue, asset compilati, link interni e contatti risultano integri.

Dimensioni misurate indipendentemente sui due pacchetti, gzip per risorsa:

| Risorsa | V21 | V22 | Variazione |
| --- | ---: | ---: | ---: |
| JavaScript iniziale | 147.267 B | 104.128 B | −29,3% |
| Tutti i chunk JavaScript | 158.910 B | 155.687 B | −2,0% |
| CSS | 28.819 B | 26.847 B | −6,8% |
| HTML | 13.763 B | 32.753 B | +138,0% |

L’HTML cresce per contenere gli effetti SVG di fallback, disponibili anche senza WebGL. I checksum archivistici delle foto rimangono nel JSON sorgente congelato ma vengono esclusi dal bundle, insieme al campo bytes inutilizzato; dimensioni, URL e metadati necessari al rendering rimangono presenti. La riduzione del JavaScript iniziale è una misura del peso trasferito, non una dichiarazione di incremento del frame rate. I valori grezzi e il metodo sono salvati in `qa-v22/build-metrics.json`.

## Riscontri runtime

La sessione browser è gestita dal producer; la lane QA mantiene separati i risultati deterministici sopra dalle sue osservazioni runtime. Su produzione, a 1440 × 900, il producer ha acquisito il menù renderizzato V22 e lo ha confrontato con lo staging V21. La lane QA ha letto entrambe le acquisizioni e verificato indipendentemente l’uguaglianza esatta dell’intero innerHTML (47.782 caratteri) e di tutti i dieci campioni di stile calcolato. Esito PASS; hash e campioni sono conservati in `qa-v22/menu-runtime-comparison.json`.

| Prova su produzione | Riscontro |
| --- | --- |
| Hero desktop | A 1363 × 936, altezza esatta 936 px e nessun overflow orizzontale. La QA ha rivisto la schermata: logo originale e claim leggibili, campo oro contenuto intorno al logo. |
| Galleria locale desktop | A 1363 × 936, controlli tra y=688 e y=732; il blur inferiore inizia a y=746. Titolo, foto e controlli visibili nella schermata rivista dalla QA. |
| Allergeni | A 1440 × 900, apertura del dialogo, colonne codice/nome/descrizione allineate e leggibili; Escape chiude il popup, con zero dialoghi aperti dopo la chiusura. Schermata rivista dalla QA. |
| Community responsive | A 320 × 740, nessun overflow orizzontale; controlli tra y=498 e y=536, sopra il blur che inizia a y=550. A 390 × 844 i controlli rimangono visibili. La QA ha rivisto la schermata affiancata di entrambe le larghezze. |
| Comando pausa | A 320 × 740, il click cambia l’etichetta accessibile in «Riprendi scorrimento». Questo verifica lo stato del comando; non è stata acquisita una seconda misura finale delle trasformazioni dopo l’inerzia, quindi non si dichiara una prova runtime della completa stabilizzazione. Il test deterministico dello scheduler resta separato e positivo. |
| Caricamento finale | Reload della produzione con il bundle finale `index-DSPCHwXA.js`; nessun errore o warning relativo al caricamento di asset e script nei log controllati dal producer. |

Nella sessione del preview sono stati inoltre osservati: hero 390 × 844 alto esattamente 844 px; layout 320 × 740 senza overflow; apertura e chiusura del lightbox sulla terza foto community; spostamento del roving tabindex dell’accordion con ArrowRight; footer info a 390 px sopra il blur, dialogo legale apribile e richiudibile; titolo tedesco info a 320 px contenuto nella larghezza. Questi controlli UI non sostituiscono i limiti di dispositivo riportati sotto.

Il browser di prova ha utilizzato il fallback degli effetti; la resa GPU della V22 non è certificata da queste schermate. Le verifiche a larghezze mobili sono prove CSS nel browser, non prove su dispositivi touch fisici. Non sono dichiarati un frame rate misurato, una sessione Safari o un collaudo drag su hardware touch.
