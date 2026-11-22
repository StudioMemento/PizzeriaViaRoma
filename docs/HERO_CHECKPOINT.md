# STEP 1 HERO — polish 1.1

Output: **ViaRoma_1_HERO**. 17 novembre 2026. Nessun deploy eseguito.

## Geometria e moto

Il PNG originale è 851×851. Bounds alpha misurati: x=133…716, y=134…714. Centro normalizzato `(425/851,424.5/851)`, raggio del perimetro esterno `292/851 × larghezza CSS del logo`.
La misura del logo viene aggiornata su resize e caricamento font. Il centro non dipende da 50vh. Rimossi il margine aggiuntivo e l'allargamento ellittico della versione precedente. Hollow e hover usano la stessa geometria.

Particelle: 1500 desktop / 750 sotto 768px; colori `#DAC18B` e `#A89B7B`; size 0.4, spread 0.75, speed **0.25**, turbulence **0.48**, twinkle 1, focus 0.5, aperture 1, glint size 2.5, boost 14.
Due oscillazioni lente aggiungono deriva radiale e tangenziale; la deriva tangenziale è limitata in pixel, così non accelera le particelle lontane. La forza scende a zero al bordo del logo. La densità e il fade iniziale consentono alle particelle di comparire vicino al perimetro.

## Liquid e tipografia

Liquid: density 2.6, softness 1, distortion 0.22, angle 70°, speed 1, grigio 0.62–1, pointer influence 0.08. Il termine distortion modifica il campo luminoso; le UV e l'alpha del logo non vengono deformati.
Hover oro sul cerchio visibile, con attenuazione esponenziale; uscita al movimento fuori dal logo o allo scroll. Su touch l'oro segue la pressione e viene rilasciato su pointerup/cancel. Non ci sono hover persistenti dopo il tap.
Glow CSS: drop shadow 9px, highlight al 23%. Il fallback senza WebGL usa la maschera del PNG originale.
Testo: `#A89B7B → #C6AB70 → #DAC18B → #C6AB70 → #A89B7B`; 90°, scala 250%, 5s alternato. La tipografia proviene ancora da clean.css.

## Blur e materiali

Sul browser del deploy, `CSS.supports(backdrop-filter)` era true ma `prefers-reduced-transparency:reduce` era anch'esso true. La precedente regola CSS impostava `display:none` su entrambe le fasce: tutti gli strati avevano bounding box 0×0. Questa regola è stata rimossa per mantenere il risultato richiesto, senza cambiare impostazioni del dispositivo.

Otto strati ottici da 0.25 a 32px. Background e tinta trasparenti. Top `clamp(6rem,14vh,9rem)`; bottom `clamp(7rem,16vh,10rem)` più safe area. Maschere alfa continue, nessun riempimento colorato.
Nav e lingue condividono grigio `#252524` con alpha 44–66% e blur 12px. Nessun blend mode, saturazione aggiunta o rifrazione. Highlight `#DAC18B` dal basso: opacità massima 25%, fade morbido. Icone e testo restano opachi.

## Scroll e input

Barra fissa destra di 2px, altezza 100dvh con fallback 100vh. Fill tramite scaleY, senza transizione ritardata. Progress = scrollY / (scrollHeight − innerHeight), limitato a [0,1]. Un solo listener scroll passivo condiviso con la navbar; nessun loop continuo in idle. ResizeObserver e font ready invalidano le misure.
La pagina nasconde solo il proprio scrollbar nativo. Blocca contextmenu, mousedown/auxclick centrali, selectstart e dragstart nativi. Non intercetta wheel, touchmove, pointerdown, click primari o tasti. Gli input testuali conservano selezione e modifica. Si tratta di comportamento dell'interfaccia, non di protezione degli asset.

## Verifica

`npm run check` e `npm test` passati. I test eseguono i renderer e i gestori reali con piattaforma deterministica; non sostituiscono il rendering di un browser. Menù e 166 file originali invariati. Nessuna dipendenza runtime aggiunta.

La nuova build deve ancora essere verificata visivamente: l'anteprima locale non è raggiungibile dal browser collegato e Chromium locale termina per una restrizione sui socket. Nessun pass browser o dispositivo reale dichiarato.

Con Playwright e i relativi browser disponibili:

```sh
npm run build
npm run preview
# In un altro terminale, dalla stessa cartella:
node tests/hero/browser.mjs
```

`HERO_BROWSERS=chromium` limita il test a Chromium; `TEST_URL` può puntare al nuovo deploy di sviluppo.

Controllare a 1440×900, 390×844, 360×800, 844×390 e 768×1024:

- Hollow adiacente al perimetro e turbolenza discreta senza aumento del clock.
- Logo argento; oro/glow su hover o pressione; sagoma originale.
- Gradiente oro e typo invariata.
- Blur visibile facendo passare una fotografia sotto header e dock, senza fascia colorata.
- Fotografia percepibile attraverso nav e language selector.
- Progress a 0%, 50% e 100%; nessun scrollbar nativo della pagina.
- Click normale, swipe slider, rotella e tastiera operativi; nessun menu contestuale/click centrale/selezione.
- Cambio lingua, rotazione, reduced motion e ritorno alla scheda su Safari iOS e Chrome Android reali.

Le prossime sezioni rimangono fuori da questo checkpoint.
