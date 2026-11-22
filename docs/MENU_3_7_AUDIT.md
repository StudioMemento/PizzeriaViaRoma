# Via Roma 3.7 — visibilità della grana laterale

Data: 17 novembre 2026. Base: ViaRoma_3.6_MENU, identificata anche nel metadato del deploy `https://mementodev.vercel.app/`. Audit mirato al menù, alle fasce decorative e al loro comportamento responsive. La 3.7 è consegnata come sorgente completo; non è stata pubblicata.

## Risultato dell'audit live

Il problema segnalato è riproducibile: il disegno 3.6 è troppo debole soprattutto nei margini stretti e sui viewport molto ampi. Le proporzioni del menù sono invece corrette nei campioni osservati.

| Classe | Larghezza CSS osservata | Fasce / contenuto | Osservazione |
| --- | ---: | --- | --- |
| Mobile | 340 e 545px | 10–80–10 | Grana molto tenue; nessun overflow orizzontale. A 340px la prima pillola resta nel suo binario e nome/prezzo dell'item campionato non si sovrappongono. |
| Tablet | 1090px | 15–70–15 | Colonna e margini corretti. Navbar con z-index 45, sopra il gradual blur a 40. |
| Desktop | 1363px | 20–60–20 | Fasce confinate correttamente, ma contrasto insufficiente rispetto alla reference. |
| Ultrawide | 2726px | 30–40–30 | Densità visiva troppo diluita nei margini grandi; nessun overflow orizzontale. |

Metodo: Chrome desktop, zoom 400%, 250%, 125%, 100% e 50%, con lettura del viewport e degli stili effettivi. L'emulazione dispositivo non era disponibile. I campioni verificano le quattro classi CSS, non l'hardware mobile, la reazione touch o gli FPS di un monitor ultrawide fisico. Non costituiscono un audit completo di ogni sezione o di ogni larghezza intermedia. Il browser è stato riportato al 100% al termine.

## Causa e correzione

La 3.6 combina quadrati prevalentemente inferiori a 1px CSS, coordinate frazionarie, risoluzione del canvas limitata e lunghi intervalli di luminosità molto bassa. La luce si distribuisce su più pixel meno luminosi. Il limite di 1200 punti per lato, distribuiti nell'intera fascia, riduce ulteriormente la densità su ultrawide.

La 3.7 interviene sullo stesso motore, senza aggiungere effetti o dipendenze:

- Dimensioni 1–1,5px CSS, prevalentemente piccole. Geometria allineata ai pixel del canvas una sola volta, durante il ridimensionamento.
- Picchi individuali fra 0,65 e 1, con dissolvenza sinusoidale semplice. Ritmo conservato: cicli indipendenti di 10–22 secondi; nessun movimento o cambio casuale di posizione durante l'animazione.
- Densità irregolare, decrescente dal bordo esterno; dissolvenza interna morbida. Le due fasce hanno semi diversi.
- Estensione massima 520px dal bordo esterno. Nei margini più grandi il disegno mantiene scala e densità, poi sfuma prima del contenuto. Il resto del margine resta #090909; la colonna centrale conserva tutte le proporzioni approvate.
- Anche la superficie del canvas termina a 520px. Non si allocano i pixel della parte vuota dei margini ultrawide.
- Budget massimo 6000 quadrati, 1,6 milioni di pixel di canvas complessivi, DPR massimo 2, 20 ridisegni/s e 62 riempimenti per fotogramma. Pause e stato statico per movimento ridotto conservati.

Non sono stati reintrodotti Dot Grid, hover sulle immagini o sui tracciati, glow aggiuntivi, listener del puntatore o letture del layout durante il disegno.

## Confronto con la reference

È stato rasterizzato il painter reale, non una ricostruzione separata. Per il confronto si usa un'inquadratura 540×780 e si esclude il bordo arrotondato della reference: campione x=16, y=32, 384×688px. Un pixel conta come oro visibile quando R>40, R>G+2 e G>B+2. Questa soglia è un indicatore di presenza/contrasto, non un punteggio di qualità visiva.

| Campione | Pixel oro visibili |
| --- | ---: |
| Screenshot fornito | 1913 |
| 3.6 a 0 / 3 / 6s | 227 / 191 / 187 |
| 3.7 a 0 / 3 / 6s | 1570 / 1562 / 1594 |

La grana 3.7 è nell'ordine di presenza della reference e varia gradualmente fra i tre istanti. Rimane irregolare e fine. Il controllo include un canvas vuoto come caso negativo: non può superare la verifica solo perché il colore di fondo è corretto.

Il painter è inoltre rasterizzato a 390×844, 768×1024, 1440×900 e 3440×1440, a 0, 3 e 6s. Ogni pixel della colonna centrale deve restare esattamente #090909. A 0s, con lo stesso criterio colore, le quattro immagini passano rispettivamente da 75/250/390/29 pixel oro nella 3.6 a 604/2251/4618/5243 nella 3.7. Le quantità dipendono dall'area del viewport e non vanno confrontate direttamente fra dispositivi diversi.

## Costo di disegno locale

Misura con Canvas 2D nativo: due superfici, 30 fotogrammi di riscaldamento e 200 misurati per formato. DPR richiesto 3, limitato dal budget del motore. Il tempo include il disegno dei due lati e non include compositing del browser, blur del sito o dispositivi reali.

| Formato | Punti totali | Pixel canvas totali | Media | P95 |
| --- | ---: | ---: | ---: | ---: |
| 390×844 | 522 | 263328 | 0,83ms | 1,53ms |
| 768×1024 | 1872 | 942080 | 2,92ms | 7,11ms |
| 1440×900 | 4114 | 1596810 | 5,18ms | 9,00ms |
| 3440×1440 | 6000 | 1598112 | 8,37ms | 16,99ms |

La maggiore presenza visiva costa più del disegno molto debole della 3.6. Il limite a 20Hz, il caricamento differito e la sospensione fuori vista ne contengono l'attività. I tempi dipendono dal carico dell'ambiente di misura: non sono una promessa di 60fps né una misura della pagina intera. La superficie limitata alla parte utile evita il raddoppio dei pixel vuoti osservato durante la prima taratura ultrawide della 3.7.

## Verifiche e perimetro

- TypeScript, build client/SSR, prerender e budget dei bundle verificabili con `npm run check`.
- Contenuti e asset approvati protetti da hash, inclusi gli 86 item e le 18 associazioni formato/prezzo di birre e vini: `npm test`.
- Geometria e budget del motore verificati anche presso le soglie 768, 1200 e 2400px e fino a 7680px. Non si tratta di una simulazione completa del layout del browser.
- Verificati il ritmo, il falloff, il seme stabile, le coordinate intere, l'assenza di input intercettati, la pausa fuori vista/scheda nascosta/dialog, il movimento ridotto e il cleanup.
- `tests/menu/render-squares.mjs` produce immagini e misure native; con `SQUARES_REFERENCE_IMAGE` ripete anche il confronto di contrasto.
- `tests/menu/browser.mjs` resta disponibile per una verifica della nuova build con Playwright, ma non è stato eseguito sulla 3.7 in questo ambiente.

Le modifiche applicative sono circoscritte a `MenuSideSquares.tsx` e ai tre file del motore `side-squares`. Stili di pagina, menu, immagini e altre sezioni restano invariati. I documenti precedenti sono mantenuti come cronologia, non come specifica dei parametri correnti.
