# Via Roma V22 — luce e dettaglio sul nero

## Direzione

La V22 elimina dalla hero la luce diffusa marrone della V21. Il fondo torna quasi nero. Il marchio circolare originale è più grande; una distribuzione irregolare di grani dorati ne accompagna la sagoma, con due zone più dense e particelle libere. L'associazione è a farina illuminata e piccole braci, senza linee orbitali, griglie, costellazioni o colori estranei alla marca.

Il payoff e il logo originali ricevono un solo passaggio luminoso all'ingresso. A riposo rimangono nitidi. L'altezza resta pari al viewport; la posizione del campo segue il centro reale del logo quando cambia la finestra, senza letture di layout continue durante lo scroll.

## Sezioni

| Sezione | Composizione |
|---|---|
| Hero | Grani luminosi irregolari attorno al marchio, profondità lieve e parallasse contenuto |
| Pizze | Traccia bassa, ondulata e orizzontale |
| Cornicione | Piccoli gruppi laterali che lasciano libere le tre proposte |
| Categorie | Distribuzione diagonale, fine e distanziata |
| Ambienti | Particelle ai margini, posizione/rovesciamento diversi per i cinque album |
| Community | Traccia statica orizzontale; il budget GPU è riservato alla gallery fotografica |
| Social | Dettaglio verticale sul solo margine destro |
| Info | Luce granulare diagonale alta, lontana dai dati di contatto |
| Menù cartaceo | Output e stile V21 conservati esattamente, senza campi V22 |

## Componenti e provenienza

- [React Bits Particles](https://reactbits.dev/backgrounds/particles), [sorgente TypeScript ufficiale](https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/Particles/Particles.tsx), scaricato il 15 novembre 2026 insieme al CSS. È il renderer effettivamente usato, con quads instanziati WebGL2, glow e profondità. Adattamenti Via Roma: distribuzioni spaziali dedicate (`halo`, `horizon`, `diagonal`, `embers`, `edge`, `curtain`), ampiezza del moto controllata, colore senza modulazione cromatica, limite di rendering a 30 fps, limite di pixel, notifica di readiness e ripristino dopo perdita del contesto.
- [React Bits Shiny Text](https://reactbits.dev/text-animations/shiny-text): sorgente già presente, usato con trigger `view` per un passaggio singolo su marchio e payoff. Il marchio usa la propria maschera alpha originale.
- La grafica SVG deterministica di fallback e la regia delle distribuzioni sono adattamenti Via Roma, non componenti React Bits originali aggiuntivi.
- La sorgente Light Rays rimane disponibile nel pacchetto, ma la V22 non monta quel componente: la vecchia luce diffusa è eliminata dal render delle sezioni modificate.

Licenza: `licenses/react-bits-LICENSE.md`, conservata dal pacchetto originale. Nessun font, dato del menù o asset alimentare modificato dalla lane VFX.

## Budget e fallback

`useFieldBudget` concede la decorazione animata a una sola sezione visibile dominante per volta. Le altre sezioni mantengono il corrispondente SVG statico. La Community prende parte alla scelta ma non monta un canvas decorativo, lasciando il rendering alla gallery fotografica.

- Hero: 820 particelle desktop / 420 mobile; altre sezioni: 290 / 150.
- Massimo 30 disegni WebGL al secondo (il controllo leggero segue il refresh del browser), DPR configurato a 1–1.1 e cap di 850.000 pixel.
- Nessun gradiente volumetrico animato o filtro grande animato sull'intero schermo.
- Le sezioni fuori schermo e la scheda nascosta perdono il budget e smontano il canvas. Observer e listener hanno teardown esplicito.
- Movimento ridotto: nessun canvas decorativo, intro e riflessi fermi; marchio, testo e dettagli statici restano visibili.
- WebGL assente o contesto perso: SVG completo. Il fallback viene attenuato solo dopo che il renderer ha segnalato readiness; non basta che il componente sia montato.
- La readiness richiede un primo disegno senza errore e un contesto valido; il controllo GPU avviene una sola volta, non a ogni frame.
- SVG prerenderizzato memoizzato, con coordinate e raggi a due decimali e opacità a tre: stessa densità visiva, markup più compatto e nessuna rigenerazione durante i cambi di readiness.
- Nessuna dipendenza npm aggiunta.

## Protezione del menù

Il ramo `MenuAtmosphere` emette gli stessi attributi e figli V21: classi, `data-active`, `data-seed`, variabile `--atmosphere-turn`, wash, due haze, edge. Tutti i fogli CSS precedenti sono immutati. Le nuove regole sono circoscritte agli ID non-menù; i nuovi keyframes usano il prefisso `vr22-`.

## Verifica lane

TypeScript superato. I quattro passaggi della lane hanno coperto implementazione, composizione esperta, ricerca di difetti e rifinitura. Corretti il rinnovo del budget durante remount/HMR, la falsa attenuazione del fallback in assenza di WebGL e la sovrapposizione desktop delle particelle ai corridoi di testo. La compressione verticale del campo desktop lascia invariata la composizione mobile.

La QA indipendente ha verificato i 164 file congelati, l'isolamento dei nuovi CSS e la riattivazione del budget sul codice effettivo. Il producer ha osservato il fallback a 390×844, 320×740 e 1363×936: nero profondo, dettaglio dorato leggibile e hero mobile senza overflow. L'ambiente browser disponibile non fornisce WebGL; la verifica visiva riguarda quindi il fallback, non la qualità o il frame rate del percorso GPU su hardware. L'approvazione finale del producer resta nel gate di integrazione.
