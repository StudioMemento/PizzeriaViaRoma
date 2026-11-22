# ViaRoma_3.6_MENU — grana fine, ritmo calmo

La 3.6 corregge il solo effetto originale delle fasce del menù. Il video allegato e i tre screenshot, distanziati di circa tre secondi, sono il riferimento visivo. Le proporzioni, il fondo #090909 e la colonna di lettura libera rimangono quelli approvati.

## Correzione alla radice

Nella 3.5 la dimensione derivava dall'asse maggiore del viewport: su un ultrawide da 3440px un quadrato arrivava a circa 5,7px. La frequenza era 1,3–2 oscillazioni al secondo. Inoltre il campo occupava celle regolari con dimensioni identiche.

Nella 3.6 il lato di ogni quadrato è compreso fra 0,6 e 1,2 pixel CSS. La distribuzione favorisce i più piccoli; la media teorica è 0,8px. Un ciclo completo di dissolvenza dura 10–22 secondi, con durata e fase indipendenti per ogni punto. I quadrati rimangono fermi: cambia soltanto l'opacità, lungo una curva continua con transizioni morbide.

Le posizioni sono campionate direttamente dalla curva di densità, senza una griglia visibile. Un generatore deterministico distribuisce posizione, dimensione, luminosità e durata al montaggio/ridimensionamento; non viene estratto alcun numero casuale durante i frame. La destra mantiene una sequenza distinta e la direzione di caduta speculare.

## Configurazione unica

`src/components/menu/side-squares/preset.ts` contiene soltanto controlli usati dal motore originale:

| Controllo | Valore | Effetto |
| --- | --- | --- |
| spacing | 6.5px | Densità di partenza, poi soggetta al limite di punti |
| minSize / maxSize | 0.6 / 1.2px CSS | Scala invariata fra mobile e ultrawide |
| minCycle / maxCycle | 10 / 22 secondi | Dissolvenze lente e asincrone |
| minPeak / maxPeak | 0.3 / 0.95 | Picchi differenti; ogni punto può sfumare fino a zero |
| falloff | 2.5 | Densità proporzionale a `(1 − distanza)^2.5` |
| fadeStart | 0.55 | Attenua anche la luminosità nell'ultimo 45% della fascia |
| squareColor | #C6AB70 | Oro desaturo |
| backgroundColor | #090909 | Fondo menù |

La distribuzione viene calcolata direttamente dalla curva di falloff, con un numero di iterazioni limitato a 1200 per fascia. Non vengono più enumerate tutte le celle del viewport né eseguito un campionamento di riserva. Anche il lavoro al resize rimane limitato. Eliminato il parametro della larghezza del viewport dal generatore: non serve più e non può ingrandire accidentalmente i quadrati.

## Layout e contenuto

| Viewport CSS | Sinistra | Lettura | Destra |
| --- | ---: | ---: | ---: |
| < 768px | 10% | 80% | 10% |
| 768–1199px | 15% | 70% | 15% |
| 1200–2399px | 20% | 60% | 20% |
| ≥ 2400px | 30% | 40% | 30% |

Riutilizzati gli stessi token del layout. Nessuna modifica al CSS, alla navbar, agli artwork o ai tracciati. Preservati i 185 file protetti, le 86 voci menù e i 18 abbinamenti formato/prezzo di birre e vini, verificati dai controlli di regressione.

## Limiti prestazionali

- Due Canvas 2D alti una schermata; nessuna superficie dietro il testo.
- Un solo clock, massimo 30 ridisegni/s; non è un obiettivo FPS per l'intera pagina.
- Massimo 1200 punti per lato, 1.000.000 pixel complessivi, DPR massimo 1.25.
- 32 livelli di opacità, fino a 62 fill per frame; buffer riutilizzati e nessuna allocazione o lettura del layout nel ciclo di disegno.
- Pausa fuori vista, con tab nascosta o dialogo aperto; tempo ripreso senza recuperi accelerati. Movimento ridotto: un solo stato statico.
- Import dinamico vicino al menù, nessuna nuova dipendenza. Fallback al fondo uniforme se Canvas o il caricamento opzionale non sono disponibili.

## Misure locali

Painter reale su Canvas 2D nativo, rasterizzazione inclusa, 30 frame di riscaldamento e 200 campioni. Queste misure escludono compositing del browser, blur della pagina e dispositivi fisici; non sono un benchmark FPS del sito.

| Formato | Quadrati totali | Pixel totali | Media/frame | P95/frame |
| --- | ---: | ---: | ---: | ---: |
| 390×844 | 444 | 101.280 | 0,51ms | 1,02ms |
| 768×1024 | 1594 | 368.640 | 1,42ms | 1,98ms |
| 1440×900 | 2400 | 810.000 | 1,81ms | 2,64ms |
| 3440×1440 | 2400 | 998.660 | 1,85ms | 2,94ms |

I limiti di memoria e disegno non sono aumentati rispetto alla 3.5. Il campo più fine usa più punti su alcuni formati, rimanendo entro lo stesso tetto. Il test di produzione mantiene i budget del JavaScript iniziale e del motore differito.

## Verifiche

Controllati: dimensioni in pixel CSS a 320–7680px, cicli lenti, varietà di dimensioni/durate, assenza di righe regolari, falloff, variazione per frame limitata e geometria immutata durante l'animazione. I controlli includono esempi deliberatamente troppo grandi e troppo veloci per provare che tali regressioni vengono rilevate. Restano attivi i test di pause, ripresa, movimento ridotto, cleanup, fallback e limiti di disegno.

Rasterizzazioni a 0, 3 e 6 secondi su quattro formati; lettura di ogni pixel della colonna centrale per verificarne il colore #090909. Ispezionati i campi mobile/desktop e il confronto temporale con le reference fornite.

**Verifica browser/dispositivi da completare sul deploy di sviluppo.** Chromium locale termina perché la creazione del socket del processo è vietata dall'ambiente. Il controllo `tests/menu/browser.mjs` resta disponibile tramite `TEST_URL` e, facoltativamente, `CHROMIUM_PATH`. Non è stato eseguito alcun deploy automatico.

Per ripetere il controllo raster facoltativo: `node tests/menu/render-squares.mjs`, con `SQUARES_CANVAS_MODULE` impostato al modulo @napi-rs/canvas locale. Tale modulo non è una dipendenza del sito. I test ordinari usano Node e le dipendenze già previste dal progetto.
