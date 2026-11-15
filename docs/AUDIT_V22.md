# Via Roma — audit e polish V22

Confronto del 15 novembre 2026: `https://mementodev.vercel.app/` (V21) e `https://pizzeriaviaroma.vercel.app/` (live). Ispezione diretta delle pagine, confronto del codice V21/V22 e verifica locale della nuova implementazione. Obiettivo: una vetrina più incisiva e scorrevole conservando integralmente le sezioni del menù cartaceo.

## Riscontri e interventi

| Passaggio | Riscontro verificato | Intervento V22 |
|---|---|---|
| 1. Home | La V21 diffonde una velatura marrone sull'intero centro; il live conserva neri profondi e oro puntuale. Il logo occupa poco spazio e manca una composizione luminosa riconoscibile. | Marchio originale più presente, nero profondo, particelle React Bits distribuite attorno alla sua forma, ingresso luminoso singolo e testo nitido. Grafica statica curata per WebGL assente o movimento ridotto. |
| 2. Pizze e categorie | Le immagini dei due slider partivano tutte eager. Il movimento doveva competere con risorse già avviate nelle sezioni lontane. | Caricamento vicino al viewport e delle carte vicine; aggiornamenti limitati alle carte visibili; pausa esplicita, hover, focus e rispetto del movimento ridotto. |
| 3. Menù cartaceo | Il linguaggio del cartaceo è il vincolo principale: immagini, contenuti, impaginazione e componenti non devono essere reinterpretati. | Componente, dialoghi, dati, fogli preesistenti e asset congelati. Confronto dell'intero HTML del menù prodotto dalla build, oltre ai checksum dei file. Le nuove regole CSS sono circoscritte alle altre sezioni. |
| 4. Gallery del locale | La composizione Accordion è già coerente con la richiesta. Restavano costi evitabili di inizializzazione, observer duplicati e layer promossi fuori schermo. Il salto al locale lasciava visibili i chip del menù sul bordo superiore. | Conservato Accordion React Bits; inizializzazione per album, aggiornamenti sospesi fuori schermo, ancoraggio del solo blocco gallery corretto. |
| 5. Community | A 1440×900 la V21 occupava 1034px, con foto che iniziavano circa a y565 e comandi sotto il viewport. Il renderer partiva molto prima dell'ingresso nella sezione. | Ritmo verticale ricomposto; gallery attivata vicino alla sezione, mesh piatta semplificata, caricamento progressivo delle texture, pausa reale e fallback DOM completo. |
| 6. Social e info | La dominante marrone appiattiva le sezioni. Nei contatti la fascia alta sfocava il kicker e quella bassa i collegamenti finali. | Social tipografico con due collegamenti diretti, senza recensioni. Info con dati e mappa in due colonne, margini utili rispetto al blur e crescita verticale su schermi piccoli. |
| 7. Navigazione e fondi | 24 livelli di progressive blur complessivi; logica di scroll condivisa non ancora centralizzata. I fondi risultavano simili soprattutto per la stessa velatura. | 16 livelli complessivi: ridotti solo quelli globali, locale menù invariato. Un listener di scroll con aggiornamento accorpato; fondi distinti per distribuzione e posizione dei grani dorati. Un solo campo decorativo WebGL dominante. |

## Identità conservata

Logo e slogan originali, carattere Jost, nero/avorio/oro, fotografie reali, otto artwork del cartaceo, dati e prezzi. Le tre proposte di cornicione mantengono illustrazioni e supplemento di €3. La navigation conserva quattro elementi indipendenti. Le gallery conservano i preset React Bits richiesti.

## Verifiche e limiti

Le misure definitive della build e i controlli riproducibili sono in `INTEGRATION_V22.md` e `QA_V22.md`. La riduzione di codice iniziale, layer e lavoro fuori schermo è misurabile; non equivale a una promessa di 60fps su ogni telefono. Il browser locale di verifica usa il fallback grafico quando WebGL2 non è disponibile: tale percorso viene verificato direttamente e distinto dal renderer GPU. Le prove responsive usano viewport incorporati, non dispositivi fisici.

Le pagine legali ereditate contengono ancora campi del gestore da completare; non sono oggetto di questo intervento visivo e non vengono sostituite. Nessuna pubblicazione effettuata.
