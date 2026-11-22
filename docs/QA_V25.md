# Verifica V25 — 16 novembre 2026

## Controlli automatici superati

`npm run check`: TypeScript, build Vite client/SSR, prerender, esistenza degli asset serviti, budget gzip, pagine legali/font locali e protezione noindex.

`npm test`:
- hash di dati/traduzioni/allergeni/asset del menù e logo invariati;
- confronto esatto dell'intero markup `#carta` con il contratto precedente;
- integrità delle 40 immagini ridotte e dimensioni entro FHD;
- assenza di canvas/blur/animazioni decorative/scroll snap;
- soltanto React e React DOM come dipendenze runtime;
- simulazione temporale del controller: inerzia indipendente dal frame rate, rilascio frazionario senza snap, easing su selezione esplicita, opacità continua e caption mai sovrapposte;
- esecuzione del vero hook con clock e observer controllati: sospensione fuori viewport, scheda nascosta, hover, dialog e movimento ridotto; nessuna lettura di layout durante i frame; cleanup; scroll verticale non catturato.

## Controlli nel browser di produzione

Anteprima della build prerenderizzata con Chromium, tramite harness responsive locale (escluso dallo ZIP): 320×740, 360×800, 390×844, 768×1024, 1024×1366, 1363×936, 1920×1080, 2560×1080, 844×390.

Tutti i viewport: overflow orizzontale 0 px, canvas 0, filtri attivi 0, nessuna immagine caricata risultata rotta. Header/navbar allineati; chevron centrato; tre card impilate nei telefoni e tre colonne nei formati maggiori. Corretti un overflow della mappa a 320 px e l'interferenza tra chevron e dock in landscape.

Verificati: link al menù, chevron hero, dot pizza, trascinamento reale con mouse e inerzia senza ritorno al centro, caption fissa, quattro lingue, categorie/bevande, popup allergeni (14 + surgelati, evidenziati 1/7 sulla Margherita), chiusura dialog, frecce gallery, lightbox e avanzamento foto, apertura privacy. Nessun errore JavaScript dell'applicazione nel log letto. I messaggi dell'estensione del browser non appartengono all'app.

## Campione prestazioni

Slider visibile in viewport 390×844: 5.016 secondi, 300 intervalli, media 59,81 fps, p95 16,7 ms, massimo 33,3 ms, zero intervalli oltre 34 ms, zero long task osservati. Dati in `PERFORMANCE_V25.json`.

È un campione nel browser remoto, non una misura su uno smartphone fisico né una garanzia di frame rate su tutti i dispositivi. I gesti sono verificati con mouse reale e handler/controller simulati; non è stata eseguita una sessione su iOS/Android fisici. Non sono stati rilevati Lighthouse/Core Web Vitals di produzione. Il confronto V24/V25 sui byte è oggettivo; attribuire il lag precedente a una singola causa richiederà il confronto nello stesso dispositivo/browser.

Le pagine legali restano quelle già presenti nel progetto. Nessun contenuto commerciale è stato riscritto.
