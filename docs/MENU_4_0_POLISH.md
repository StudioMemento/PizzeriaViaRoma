# Via Roma 4.0

Checkpoint del 18 novembre 2026, dalla versione 3.9.

## Stacchi tra le sezioni

Un bordo oro pieno di 1 px, colore `#766644`, segna entrambi i lati dello slider e il passaggio dal menù alla galleria. Il nero dello slider arriva direttamente alla linea. Le fasce di particelle occupano lo spazio tra il cornicione e la fine del menù e terminano sul bordo.

Nelle catture a 390 × 844 e a 1.440 × 900 px, una lettura dei pixel nella zona centrale di ciascuno stacco ha rilevato una sola riga oro. I fondi adiacenti dello slider sono `#000000` e `#090909`. All’uscita dal menù il bordo separa due superfici `#090909`.

## Spaziatura della carta

| Spazio misurato | Telefono 390 × 844 | Desktop 1.440 × 900 |
| --- | ---: | ---: |
| Ultima birra Garlatti Costa → intestazione Theresianer | 49 px | 52 px |
| Ultima voce di un gruppo → intestazione del gruppo bevande seguente | 68 px | 72 px |
| Fine contenuto di una categoria → intestazione della successiva | 127 px | 150 px |

Il nome del produttore precede subito la sua prima birra. Le sette transizioni tra categorie ricevono uno spazio aggiuntivo prima dell’intestazione. I titoli “Le stuzzicherie”, “I dolci” e “Le bevande” entrano su una riga anche a 320 px.

## Navigazione dello slider

La didascalia di Monte Jouf va a capo prima della base. Il separatore viene applicato alla descrizione prima di tradurre le due parti, così funziona in italiano, inglese, tedesco e francese. Gli ingredienti possono andare a capo naturalmente anche all’interno di ciascuna parte.

Il pulsante di ogni freccia misura da 52 × 52 a 64 × 64 px. Il disegno e il tratto del chevron crescono insieme. Entrambi i controlli puntano alla regione del carosello e affiancano i dieci punti di selezione. Invio o Spazio attivano il pulsante che ha il focus. Le frecce della tastiera spostano la selezione quando il focus è sullo slider.

## Verifica del pacchetto

`npm run check` esegue TypeScript, build client e server, prerender e controllo dimensioni. `npm test` verifica anche le 86 voci della carta, i 18 abbinamenti formato/prezzo e le interazioni. Il controllo in `tests/menu/browser.mjs` misura bordi, spaziature, dimensioni delle frecce e interruzioni di riga e prova la navigazione ciclica in Chromium.
