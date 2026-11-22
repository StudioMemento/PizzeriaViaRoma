# ViaRoma_3.1_MENU — note del polish

Base: ViaRoma_3_MENU 3.0.0. Versione corrente: 3.1.0. Contenuti alimentari e prezzi conservati; nessun deploy eseguito.

## Parametri

| Elemento | Desktop | Mobile |
| --- | --- | --- |
| Titolo MENÙ | Fit alla larghezza utile, tracking 0.26em | Identico criterio |
| Nome voce | Tracking 0.11em | Tracking 0.095em |
| Ingredienti | 18px, interlinea 1.45 | 16.5px, interlinea 1.45 |
| Leader puntinato | Passo 8px, nucleo 0.4px, sfumatura 0.65px | Identico criterio |
| Nome nel popup | 32–42px | Minimo 32px |
| Testo allergeni | 16.5px, interlinea 1.55 | 15.5px, interlinea 1.55 |
| Rientro allergeni | Colonna numero 1.3em + spazio 0.6em | Identico criterio |
| Satinatura pillole | Blur 22px, fondo #252524 con alpha 0.62–0.80 | Identico criterio |

Etichetta ALLERGENI sotto il nome: #7C7A73. Inattivi grigio scuro; presenti #DAC18B. Pillole inattive #FFFFFF, attiva #DAC18B.

## Correzione del bordo della navbar

La maschera non è più sul contenitore scorrevole: ogni pillola riceve una sfumatura solo quando attraversa un bordo della viewport del rail. Le pillole interamente visibili restano senza maschera. Questo permette anche al loro backdrop blur di campionare lo sfondo. Gli estremi di scorrimento sono limitati esplicitamente a zero e al massimo; i valori di overscroll vengono normalizzati.

Le geometrie delle otto pillole vengono aggiornate al resize/cambio lingua/caricamento del font tramite ResizeObserver. Durante lo scorrimento si leggono solo scrollLeft e i valori già memorizzati, aggiornando soltanto le maschere cambiate. Nessun ciclo di animazione continuo aggiunto.

## Hover e immagini

Il titolo di categoria usa il riflesso CSS oro e un glow contenuto, coerente con la palette del logo. Le immagini originali RGBA ricevono un drop-shadow oro sulla propria sagoma: non viene generata una cornice rettangolare. I due tratti mantengono gradienti, dimensioni e opacità fissi anche in hover. La maschera superiore/inferiore dell’immagine usa più passaggi intermedi per una transizione morbida.

## Allergeni

Numero e testo hanno due sole colonne; nome allergene e spiegazione scorrono nello stesso blocco. La seconda riga riparte quindi dalla posizione del nome, senza tornare sotto il numero e senza creare una colonna separata per la descrizione.

L’aumento delle dimensioni può richiedere lo scorrimento del popup sui telefoni piccoli: non si riduce il font per forzare tutte le informazioni in una schermata. Testo finale italiano: “Per ulteriori informazioni, chiedi al personale.” Le altre traduzioni restano quelle approvate.

## Verifica

La suite controlla contenuti e prezzi, codice precedente protetto, adattamento del titolo con tracking, ricentratura delle pillole, overscroll, assenza di maschera sulle pillole agli estremi, apertura e chiusura del popup, 15 righe in quattro lingue, heading e struttura del rientro. Sono mantenuti i controlli delle animazioni della hero/intro.

Il controllo visivo resta aperto: `tests/menu/browser.mjs` termina prima dell’apertura perché il browser headless richiesto non è disponibile. Il test aggiornato include 320–3440px, quattro lingue, pillola iniziale intera, bianchi inattivi, satinatura, stabilità geometrica dei tratti in hover e popup. Eseguirlo sul deploy di sviluppo, poi confermare Safari iOS / Chrome Android per satinatura, scroll e leggibilità. Non sono incluse nuove schermate di rendering.
