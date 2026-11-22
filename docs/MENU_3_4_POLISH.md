# ViaRoma_3.4_MENU

Checkpoint del 17 novembre 2026, basato sulla 3.3. Nessuna pubblicazione automatica.

## Pulizia dei tratti

Eliminati i due pseudo-elementi con glow, clip complementari, filtri e transizioni hover. Resta un solo elemento statico con bordi superiore e inferiore da 1px e lo stesso gradiente. La fotografia e la sua maschera sfumata non ricevono effetti hover. Non sono presenti regole correttive sovrapposte agli effetti precedenti: quelle regole sono state rimosse.

## Dot Grid

Deriva dal componente TypeScript/CSS ufficiale React Bits di David Haz, sorgente identificato dal blob `47c3c28ae805d84a83e663030f4187185196d0fb`. Shader e dinamica elastica sono adattati al sito; la licenza completa è in `licenses/ReactBits.txt`.

Fonte: https://github.com/DavidHDev/react-bits/blob/main/src/ts-default/Backgrounds/DotGrid/DotGrid.tsx

Parametri controllati in `src/components/menu/dot-grid/preset.ts`:

| Parametro | Valore |
| --- | --- |
| Base / attivo | #252524 / #A89B7B |
| Dimensione / gap | 2px / 48px |
| Prossimità / forza | 180px / 1 |
| Bounce / tension | 0.5 / 0.5 |
| Return duration | 1.5s |
| Stretch / glow / fade | 2 / 0.5 / 0.5 |
| Swell / shock strength | 0 / 0 |
| Click shock / intro | disattivati |

L’intro è disattivata per evitare un’animazione aggiuntiva all’ingresso. I rami shock/intro inutilizzati sono rimossi dal motore. Non vengono aggiunte dipendenze npm, CDN, timer continui o nodi DOM per ogni punto.

Un solo canvas segue la parte visibile del menù con posizione sticky nativa. La sua altezza è una schermata, non l’intera altezza del menù. Il motore viene caricato in un chunk separato soltanto avvicinandosi al menù; il contesto WebGL viene creato quando la sezione entra in vista. La navbar delle categorie mantiene il suo livello sopra il gradual blur.

Il cursore attiva la dinamica desktop. Su touch gli eventi passivi seguono il dito anche durante lo scroll nativo, senza preventDefault, cattura del puntatore o touch-action:none. Sollevare il dito rilascia l’effetto; il multitouch lo interrompe per lasciare il pinch zoom disponibile.

## Limiti di lavoro e fallback

- Massimo 2400 punti; passo adattivo soltanto alle risoluzioni estreme.
- Risoluzione massima 3 milioni di pixel e DPR massimo 1.5.
- Limite di ridisegno: 60Hz desktop, 30Hz mobile. Non è una promessa di FPS misurati.
- Un solo frame d’animazione accodato, più una misura di layout accorpata quando cambiano le dimensioni.
- Nessuna lettura di layout durante input o simulazione; gli input usano geometria memorizzata.
- Nessun clock continuo quando il sistema è fermo. Pausa fuori vista, con scheda nascosta o popup aperto.
- Con movimento ridotto, WebGL indisponibile o contesto perso, resta una griglia CSS statica. Risorse, osservatori e listener vengono rilasciati allo smontaggio.

## Misura CPU locale

Misura della simulazione reale e della preparazione dei dati dei punti, dopo riscaldamento, su 780 aggiornamenti per formato. Eseguita in Node/VM nell’ambiente di sviluppo: non include invio dei comandi WebGL, rasterizzazione GPU, compositing, blur della pagina o prestazioni di telefoni reali.

| Viewport | Punti | Media CPU / aggiornamento | P95 CPU |
| --- | ---: | ---: | ---: |
| 390×844 | 136 | 0.22ms | 0.38ms |
| 1440×900 | 522 | 0.87ms | 2.05ms |
| 3440×1440 | 2001 | 2.87ms | 4.61ms |
| 7680×2160 | 2250 | 3.14ms | 4.56ms |

La prima build aggiunge circa 246 byte gzip all’entry iniziale; il motore differito pesa circa 4.7KB gzip. Rimangono i budget precedenti di 101KB per il JavaScript iniziale e 8.5KB per il CSS. Il totale dei chunk JS ha un limite di 112KB, e il solo motore Dot Grid un limite di 6KB.

Questi dati giustificano mantenere Dot Grid per il checkpoint: il carico è limitato e termina a riposo. La decisione definitiva sulla fluidità va presa dopo il controllo GPU su desktop e mobile reali. Il fallback statico è già disponibile per movimento ridotto o WebGL assente.

## Diagnosi Chrome

La scheda Chrome del profilo normale mostra l’HTML 3.3 senza stili. Tutti e tre i link CSS risultano non caricati. Aprendo direttamente il CSS esatto `/assets/index-B429sNq_.css`, Chrome restituisce `net::ERR_BLOCKED_BY_CLIENT`. Ricaricamento normale e completo non risolvono.

Dal server, HTML, CSS, font CSS e JavaScript correnti rispondono HTTP 200 con MIME corretti. L’HTML usa già `Cache-Control: public, max-age=0, must-revalidate`; il riferimento all’asset non è obsoleto. Il blocco è lato client. L’estensione o regola specifica non è stata identificata; il fatto che l’incognito funzioni è compatibile con una differenza nel profilo.

Va verificato il filtro locale applicato a `mementodev.vercel.app`. Non sono state modificate impostazioni di sicurezza, cancellati dati del browser o aggiunte scappatoie ai percorsi degli asset. Nessun sistema di retry, service worker o ricaricamento automatico viene aggiunto al sito.

## Verifica e consegna

Test automatici: integrità delle 86 voci e dei 18 abbinamenti formato/prezzo, 185 file protetti, interazioni precedenti, ciclo di vita completo del nuovo motore, preset, limiti di memoria, ritorno a riposo, mouse/touch, resize, riduzione movimento, perdita/ripristino WebGL e rilascio delle risorse.

La verifica grafica della 3.4 resta aperta: il browser headless non è disponibile e il tentativo di installazione ufficiale restituisce un archivio vuoto/invalido. Il test `tests/menu/browser.mjs` è aggiornato per controllare la nuova build da un ambiente con Playwright/Chromium, impostando `TEST_URL` al deploy di sviluppo. Non si dichiarano FPS GPU, un passaggio visivo della nuova build o test su Safari iOS/Chrome Android reali.

Prezzi, contenuti, fotografie e checkpoint precedenti restano invariati. Il pacchetto contiene tutti i sorgenti e asset, esclusi dipendenze installate, build e output temporanei.
