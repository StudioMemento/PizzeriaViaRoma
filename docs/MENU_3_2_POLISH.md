# ViaRoma_3.2_MENU

Ambito: quattro ritocchi visivi al menù della 3.1. Contenuti e prezzi originali conservati.

## Tratti delle immagini

Nella 3.1 i due pseudo-elementi usavano già le stesse regole. Lo spessore frazionario di 1.5px e il diverso contrasto della fotografia potevano contribuire a una percezione differente: è una spiegazione plausibile, non una diagnosi misurata sul dispositivo dell’utente.

La 3.2 usa un solo pseudo-elemento con bordi superiore e inferiore da 1px, senza bordi laterali. Il gradiente è comune ai due tratti. In hover cambiano soltanto opacità e glow; non cambiano dimensioni, distribuzione della sfumatura o geometria. Il glow dell’immagine rimane separato.

## Puntinato

Il precedente gradiente radiale aveva nucleo di raggio 0.4px e terminava a 0.65px: a densità standard il campionamento poteva rendere i punti praticamente invisibili. La nuova trama usa micro-segmenti quadrati da 1×1 CSS px, ripetuti ogni 8px, colore #C6AB70 con opacità 0.7. Gli ingombri desktop/mobile e il posizionamento tra nome e prezzo restano quelli precedenti.

## Birre e nota dolci

`inlineDescription` è attivo soltanto per le righe delle birre in bottiglia. Si elimina il break tra descrizione e volume conservando il testo, le informazioni originali e i prezzi. Acqua/bibite e le altre voci mantengono la formattazione precedente. La descrizione delle birre può usare tutta la larghezza disponibile e resta libera di andare a capo se richiesto dall’ingrandimento del testo.

La nota dei dolci mantiene esattamente il testo approvato, centrato con font 22–28px e highlight #DAC18B.

## QA

Build e controlli automatici inclusi: 86 voci, 7 descrizioni unite, 185 file protetti, dati allergeni, hero/intro e interazioni della navbar/popup. Il confronto dei dati mantiene un controllo negativo che rileva un prezzo alterato.

`tests/menu/browser.mjs` è aggiornato per verificare trama, spessore comune dei tratti e stabilità della geometria in hover, descrizioni delle birre e nota dolci. Non è stato eseguito fino al rendering perché il browser headless non è presente nell’ambiente. Confermare sul deploy: visibilità dei punti a zoom 100% su schermo standard e mobile, glow simultaneo sopra/sotto e descrizioni delle birre.

Nessun deploy effettuato. Il pacchetto contiene il sito completo, senza node_modules, dist o output temporanei.
