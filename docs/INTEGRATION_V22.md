# Integrazione V22

## Contratto

La directory V21 rimane il riferimento immutabile. Questa integrazione non modifica `Menu.tsx`, `Dialogs.tsx`, i18n, dati, artwork o fogli CSS preesistenti. `App.tsx` mantiene i contenitori delle sezioni nel primo HTML: la separazione del codice avviene nei motori grafici, senza spostare ancore o creare salti di geometria tra sezioni.

Il corpo riceve la classe statica `v22-ready` prima della prima renderizzazione. `main.tsx` mantiene tutti gli import storici e aggiunge, in questo ordine, `effects-v22.css`, `interactions-v22.css`, `design-v22.css`. Il prerender conserva le classi applicate dai motori tramite una safelist esplicita; il test CSS indipendente vieta nuove regole che possano alterare il menù.

## Caricamento e navigazione

`Photo` accetta `enabled`, con valore predefinito `true`. Quando è falso mantiene nodo, dimensioni e testo alternativo, ma non emette URL di immagine. I chiamanti originali, incluso il menù, producono lo stesso markup V21. Gli slider autorizzati possono quindi avviare il download solo quando si avvicinano alla viewport.

Il plugin Vite `render-image-metadata` elimina soltanto `sha256` e `bytes` dalla copia in memoria di `images.json` destinata ai moduli runtime. Questi campi archivistici non sono letti dalla UI. Il file sorgente conserva tutti i valori originali per le verifiche; dimensioni e URL responsive rimangono disponibili a `Photo`, menù e gallery. Il confronto esatto dell’HTML del menù verifica anche questo passaggio.

Dock e indicatore di avanzamento condividono un unico listener passivo dello scroll. Il controller raggruppa gli eventi in un frame e riusa le posizioni dei tre punti di riferimento. Le letture della geometria avvengono all’inizializzazione e dopo resize, variazioni di dimensioni, caricamento dei font o ritorno della pagina visibile. Durante lo scroll ordinario legge `scrollY`, senza nuove misurazioni delle sezioni. L’ultimo subscriber rimuove listener, observer e frame; un callback dei font risolto dopo il cleanup non può riattivarlo.

La sfocatura globale usa quattro livelli sopra e quattro sotto; quella locale del menù resta a otto. Il totale passa quindi da 24 a 16 superfici progressive, con altezze e massima intensità dei bordi globali invariate. È una riduzione strutturale dei livelli da comporre, non una misura del frame rate.

## Misure riproducibili

La build Vite genera `.vite/manifest.json`. `scripts/check-build.mjs` segue solo `imports` statici a partire dagli entry point e somma le dimensioni gzip dei file unici. I `dynamicImports` restano esclusi dall’insieme iniziale, ma vengono inclusi nel limite totale. Il confronto V21 è ricavato dal suo HTML e bundle di produzione già esistenti, senza ricostruire o modificare la baseline.

| Misura | V21 | V22 release finale |
|---|---:|---:|
| JavaScript del grafo statico iniziale, byte gzip | 147267 | 104128 |
| Tutti i chunk JavaScript, byte gzip | 158910 | 155687 |
| CSS prodotto dopo pruning, byte gzip | 28819 | 26847 |
| HTML prerenderizzato, byte gzip | 13763 | 32753 |
| HTML prerenderizzato, byte non compressi | 127682 | 241193 |
| Livelli progressive blur globali | 16 | 8 |
| Livelli progressive blur del menù | 8 | 8 |
| Listener scroll condivisi di dock/avanzamento | 2 | 1 |
| Letture di posizione per evento scroll ordinario | Fino a 3 | 0 |

Il grafo JavaScript statico iniziale diminuisce del 29,3%. L’HTML aumenta perché include i fallback SVG deterministici delle atmosfere; l’arrotondamento sub-pixel delle coordinate ha ridotto il primo risultato V22 da 314538 a 241193 byte non compressi, mantenendo la densità. La somma HTML + CSS + JavaScript statico passa da 189849 a 163728 byte gzip.

Il conteggio non equivale ai byte totali scaricati su rete: il browser carica anche il chunk particelle quando la hero diventa attiva, e quelli delle gallery vicino alle rispettive sezioni. Non sono state dedotte prestazioni su dispositivi mobili da questi numeri. Le evidenze browser appartengono al report QA.

## Verifica e revisione

1. Implementazione: dipendenze installate con `npm ci`, nessuna nuova dipendenza; versioni di progetto e lockfile aggiornate a 22.0.0; Node 22 da 22.13 oppure Node 24+, `.nvmrc` 24.
2. Revisione dei difetti: cleanup del controller, remount, navigazione tardiva, cancellazione a pagina nascosta, comportamento predefinito di `Photo`, import e safelist verificati.
3. Ottimizzazione: listener unico, layout memorizzato, superfici di blur ridotte, immagine e motori grafici differiti; niente differimento dell’intera sezione menù.
4. Controllo finale: `npm run check && npm test` completato con codice 0 il 15 novembre 2026. TypeScript, client/SSR build, prerender, budget originali (<160000 byte JS e <35000 byte CSS gzip), 164 file V21, HTML esatto del menù, 20 controlli positivi e harness dei controller reali superati. Verificati inoltre asset, categorie, cinque album, link, quattro lingue e assenza di recensioni.

`tests/v22/chrome-signal.mjs` usa il controller estratto dal sorgente per verificare listener, aggregazione dei frame, numero di misurazioni, resize, pagina nascosta, subscriber tardivi, cleanup/remount e risoluzione dei font dopo il cleanup. `tests/v22/frozen-v21.json` e `menu-v21.html` costituiscono la baseline verificabile per file e HTML del menù.

Misure della release finale, ricontrollate dopo l’ultima correzione CSS per gli schermi mobili bassi e registrate in `qa-v22/build-metrics.json`:

```json
{"initialJsGzipBytes":104128,"allJsGzipBytes":155687,"cssGzipBytes":26847,"htmlGzipBytes":32753,"htmlBytes":241193,"initialJsFiles":2,"totalJsFiles":6}
```

La verifica include 74 fotografie originali, 8 banner cartacei, 40 immagini del locale e 12 della community. I warning di npm sulla configurazione proxy del runtime e quello sperimentale dell’API Node per il test non impediscono l’esecuzione e non sono errori dell’applicazione.

G1 e G2 sono completati. Il producer ha accettato la build finale e la verifica runtime: `innerHTML` del menù identico allo staging per tutti i 47782 caratteri e 10 campioni di stili calcolati coincidenti. La QA indipendente conferma i controlli di produzione e le misure della release. Nessuna pubblicazione è stata effettuata da questa lane.
