# Risorse e licenze — Via Roma 6.7

- React / React DOM, Vite e TypeScript: pacchetti npm, versioni fissate da `package-lock.json`, licenze nei pacchetti.
- Jost: font locale WOFF2, pesi 200/300/400/500. Licenza OFL inclusa in `licenses/Jost-OFL.txt`.
- Open Sans Light fornisce il glifo U+003F nel titolo asporto. Il sottoinsieme WOFF deriva dal font di Google distribuito con licenza Apache 2.0. Il testo della licenza è in `licenses/Open-Sans-Apache-2.0.txt`.
- Phosphor Icons: font thin, ridotto ai 13 glifi disponibili nel CSS locale conservandone le forme. Licenza MIT inclusa in `licenses/Phosphor-MIT.txt`.
- Logo, fotografie del locale, artwork del menù e mappa: materiali già forniti/serviti dal progetto Via Roma. Le 40 fotografie della gallery sono soltanto ridimensionate e ricodificate WebP, senza ritocco del contenuto.
- Tre immagini dei cornicioni: visual generati su richiesta nelle precedenti iterazioni, riutilizzati con ritaglio CSS. Testi e prezzi sono HTML.

La base V25 rimuoveva i componenti React Bits, i relativi shader/renderer e GSAP. Il controller del carosello e i layout sono implementati nei sorgenti di questa applicazione. Non vengono caricati font, script o immagini da CDN esterne.

La hero aggiunge implementazioni originali Canvas 2D, WebGL e CSS ispirate alle reference visive fornite. Il codice React Bits Pro non è incluso. Nessuna nuova libreria di animazione è stata aggiunta.

Le card dei cornicioni, dell’asporto e delle foto su Google Maps condividono inclinazione, ingrandimento e riflesso satinato. Il puntatore o un trascinamento orizzontale controllano l’intera card.

Il background 3.5–3.8 è un'implementazione originale Canvas 2D, autorizzata dall'utente, ispirata alla reference visiva Blinking Squares. Non include il sorgente React Bits Pro e non richiede la sua licenza o il registro shadcn. Dot Grid e tutto il relativo codice derivato sono stati rimossi. Nessuna nuova dipendenza npm.

Le gallerie e il bento della 4.1 riprendono i preset visivi Panorama, Flat e Magic Bento indicati dal committente. Il codice di proiezione e interazione è implementato nel progetto. I panorami usano le 40 foto del locale nelle risoluzioni previste dal progetto. Il wordmark Memento usa i tracciati del file fornito DEV_20_Typo.svg.

Le sei immagini in `public/assets/social` raffigurano i marchi delle piattaforme su fondo trasparente. Sono visual generati e ottimizzati in WebP. I marchi appartengono ai rispettivi titolari.

Le 40 immagini dello slider provengono dal pacchetto ViaRoma_40_Pizze_Slider. La pizza Via Roma deriva dal campione fotografico fornito, le altre 39 sono ricostruzioni generate. Nella 6.0, le immagini di Diavola, Tonno e Cipolla, Raf, Greca, Frico e delle due Marinare sono ritoccate sulle rispettive foto della 5.9 ed esportate in WebP a 768 e 1100 px.

La 5.9 rigenera la foto della pizza Brie, Speck e Ricotta e la foto per la card asporto. Nella composizione delle Polaroid, il piano di posa e le cornici sono generati. Le immagini nelle finestre quadrate sono ritagli delle fotografie originali del progetto `bancone-01.webp`, `sala-sinistra-02.webp` e `sala-destra-03.webp`.
Le tre risoluzioni WebP sono in `public/assets/asporto` e `public/assets/foto-ospiti`.
Il link della seconda card apre le foto degli ospiti su Google Maps.
Il wordmark nel footer conserva i tracciati Memento con una spaziatura ottica più compatta.

Per la 6.7 la fotografia della Via Roma del catalogo e la composizione della 6.6 sono i riferimenti per la nuova scena con il cartone da asporto. Il marchio sulla card proviene dal PNG originale fornito dallo studio. La versione WebP del marchio rimuove i soli margini trasparenti e conserva i pixel visibili senza perdita. Le tre versioni WebP della card 16:9 misurano 480 × 270, 960 × 540 e 1600 × 900 px.
