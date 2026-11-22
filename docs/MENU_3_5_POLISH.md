# ViaRoma_3.5_MENU — fasce laterali originali

Il nuovo effetto è scritto per Via Roma in Canvas 2D, dopo la scelta esplicita dell'utente di usare una versione originale della reference Blinking Squares. Nessun sorgente React Bits Pro è stato copiato o installato. Nessuna nuova dipendenza.

## Risultato e layout

Il fondo dell'intera sezione menù è #090909. Due superfici decorative sono limitate ai gutter esistenti; la colonna centrale non contiene canvas, overlay di particelle o aree interattive. La densità diminuisce avvicinandosi al contenuto e la fascia destra è speculare nella direzione della sfumatura, con una sequenza di pulsazioni indipendente.

| Viewport CSS | Fascia sinistra | Contenuto | Fascia destra |
| --- | ---: | ---: | ---: |
| < 768px | 10% | 80% | 10% |
| 768–1199px | 15% | 70% | 15% |
| 1200–2399px | 20% | 60% | 20% |
| ≥ 2400px | 30% | 40% | 30% |

Gli stessi token `--vr-gutter` e `--vr-content` governano contenuto e fasce: non esiste un secondo insieme di breakpoint da tenere sincronizzato. Il layer non crea un contesto che abbassi la navbar sotto il gradual blur.

## Parametri

| Parametro | Valore |
| --- | --- |
| Direction | left, specchiata a destra |
| Grid size | 120 |
| Falloff | 2.5 |
| Fade start | 0.8 |
| Square size | 0.2 |
| Min brightness | 0 |
| Twinkle speed / strength | 2 / 1 |
| Square color | #C6AB70 |
| Background | #090909 |

La configurazione mantiene i valori richiesti, con una dinamica originale: il passo della griglia deriva dall'asse più lungo del viewport; squareSize è la frazione occupata dal quadrato. Falloff controlla la diminuzione della densità verso il menù. FadeStart ammorbidisce l'ultimo 20% della fascia verso il contenuto. Le pulsazioni sinusoidali hanno fasi e frequenze distribuite per evitare lampeggi sincronizzati; i punti restano fermi.

## Prestazioni e ciclo di vita

- Motore caricato con import dinamico, solo entro 200px dal menù.
- Due Canvas 2D, alti una schermata: nessun bitmap alto quanto l'intero menù.
- Un solo clock; massimo 30 ridisegni/s. Nessuna simulazione fisica, shader o WebGL.
- Massimo 1200 quadrati per lato; DPR ≤ 1.25 e 1.000.000 pixel totali.
- Opacità raggruppate in 32 livelli: massimo 62 operazioni fill complessive per frame. Bucket riutilizzati, nessuna allocazione o lettura del layout nel ciclo di animazione.
- Pausa fuori dal menù, con scheda nascosta o popup aperto. Il tempo riparte senza salti. Con movimento ridotto viene disegnato un solo stato statico.
- Nessun listener mouse, touch o scroll. Decorazione aria-hidden e pointer-events:none.
- Osservatori, listener, frame pendenti e memoria dei canvas rilasciati allo smontaggio. In assenza di Canvas o del chunk opzionale il menù resta pienamente utilizzabile sul fondo uniforme.

## Misure locali

Misurato il painter reale su Canvas 2D nativo, inclusa la rasterizzazione locale delle due fasce, dopo 30 frame di riscaldamento e su 200 campioni. Non include browser, compositing, blur della pagina o dispositivi reali.

| Formato | Quadrati totali | Pixel totali | Media/frame | P95/frame |
| --- | ---: | ---: | ---: | ---: |
| 390×844 | 375 | 101.280 | 0.55ms | 1.44ms |
| 768×1024 | 913 | 368.640 | 1.09ms | 2.22ms |
| 1440×900 | 1033 | 810.000 | 1.44ms | 3.32ms |
| 3440×1440 | 1074 | 998.660 | 0.99ms | 1.61ms |

Motore differito: circa 1.75KB gzip. JavaScript iniziale: 99.332 byte gzip; tutti i chunk JS: 107.376 byte; CSS: 8.452 byte. Il solo motore 3.4 precedente pesava 4.697 byte gzip. Le misure CPU delle due versioni non sono direttamente confrontabili, perché quella precedente escludeva la rasterizzazione.

## Verifica

I test controllano i valori di configurazione, limiti di disegno, geometria 320–7680px, diminuzione della densità, stabilità del pattern, pause, ripresa, movimento ridotto, fallback e cleanup. Un secondo controllo raster legge ogni pixel della colonna centrale e verifica che rimanga esattamente #090909. Preview interne del solo campo sono state ispezionate a 390px e 1440px.

185 file protetti, tutte le 86 voci e i 18 abbinamenti formato/prezzo rimangono invariati. Nessun effetto viene aggiunto a immagini e tracciati. Tutto il vecchio runtime Dot Grid, i suoi test dedicati e la licenza non più usata sono rimossi.

Il controllo completo nel browser rimane da eseguire sul deploy di sviluppo: Chromium locale termina all'avvio. Non sono stati misurati FPS reali su desktop, Safari iOS o Chrome Android. `tests/menu/browser.mjs` controlla anche confinamento delle fasce, riduzione movimento e pause; usa `TEST_URL` per l'anteprima e, facoltativamente, `CHROMIUM_PATH` per un eseguibile locale.

Per ripetere il solo controllo raster opzionale, `tests/menu/render-squares.mjs` richiede un'installazione locale di @napi-rs/canvas indicata con `SQUARES_CANVAS_MODULE`. Tale pacchetto non è una dipendenza del sito. Il test ordinario `npm test` usa soltanto Node e le dipendenze del progetto.

Nessun deploy automatico eseguito.
