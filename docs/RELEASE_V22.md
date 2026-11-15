# Via Roma V22 — consegna

Polish pronto per il progetto di prova Vercel. Nessun deploy effettuato.

## Modifiche

- Hero a tutta altezza: logo e slogan originali, campo di particelle React Bits in oro su nero e ingresso luminoso discreto.
- Atmosfere differenti nelle sezioni di vetrina, con una sola animazione decorativa GPU dominante e una resa statica disponibile senza WebGL.
- Slider e gallery con caricamento progressivo, motori differiti, lavoro sospeso fuori vista e controlli di pausa.
- Social senza recensioni, contatti e mappa ricomposti; spazi corretti rispetto al blur su desktop e mobile.
- Menù cartaceo conservato integralmente: dati, prezzi, allergeni, otto banner, fotografie, font, componenti e CSS precedenti.

## Verifica

`npm run check && npm test` superato sulla build finale. La lane QA ha ripetuto in autonomia i verificatori. Controllati 164 file congelati, 20 casi di regressione intenzionale e i veri controller di scroll, caroselli e budget degli effetti.

Il confronto del menù renderizzato a 1440×900 coincide esattamente con lo staging V21: 47.782 caratteri HTML e tutti i dieci campioni di stile calcolato. Anche il sottalbero menù prerenderizzato della build è identico.

Viste desktop 1363×936 e 1440×900; viste responsive 390×844 e 320×740. Nella gallery del locale i comandi terminano a y732 prima del blur a y746. Nella community a 320×740 terminano a y536 prima del blur a y550. Apertura e chiusura del popup allergeni, navigazione da tastiera nella gallery e stato del pulsante pausa controllati.

## Dimensioni misurate

| Risorsa | V21 | V22 |
|---|---:|---:|
| JavaScript iniziale, gzip | 147.267 B | 104.128 B |
| Tutto il JavaScript, gzip | 158.910 B | 155.687 B |
| CSS, gzip | 28.819 B | 26.847 B |
| HTML, gzip | 13.763 B | 32.753 B |

Il JavaScript iniziale diminuisce del 29,3%. L'HTML cresce per fornire un fallback grafico già presente prima di JavaScript. Queste misure riguardano il peso delle risorse, non il frame rate.

## Limiti delle prove

Il browser locale non rende WebGL2: sono stati verificati direttamente il fallback, il layout e le interazioni DOM, mentre il percorso GPU è stato revisionato nel codice. Non sono state effettuate misure FPS su hardware reale né una prova fisica di drag/touch. Il comportamento dei relativi controller è coperto dai test deterministici; il cambio di stato del pulsante pausa è stato osservato nel browser, senza una misura finale del completo arresto dell'inerzia.

Le prove responsive usano viewport incorporati e non dispositivi fisici. Il dettaglio dei test e delle limitazioni è in `QA_V22.md`; audit e motivazione delle scelte in `AUDIT_V22.md`.

## Uso

Seguire `README.md`: Node 24, `npm ci`, `npm run check`, `npm test`. Per Vercel: framework Vite, comando build `npm run build`, output `dist`. Il pacchetto mantiene la configurazione staging con `noindex`.
