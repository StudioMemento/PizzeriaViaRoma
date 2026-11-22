# ViaRoma_3.3_MENU

Ambito: hover delle immagini, contrasto del puntinato e layout delle bevande con tre formati. Base approvata: ViaRoma_3.2_MENU.

## Tratti e fotografia

I due tratti condividono gradiente, altezza di 1px, opacità e transizione. Il tratto superiore permette al glow di estendersi sopra il bordo, quello inferiore sotto: due clip complementari escludono l’interno della fotografia. In hover l’opacità sale da 0.85 a 1 e compare un drop-shadow oro morbido da 6px con alpha 0.4.

Rimossi filtro e transizione dall’immagine, così come la precedente regola hover sul tag img. Il contenitore della fotografia mantiene esattamente la maschera sfumata della 3.2. Nessuna animazione continua o handler JavaScript aggiunto. Hover attivo soltanto sui dispositivi che lo supportano; transizioni disattivate con movimento ridotto.

## Puntinato

Nelle voci con un prezzo restano i segmenti 1×1px ripetuti ogni 8px. Cambia soltanto il colore effettivo: #252524, senza moltiplicatore di opacità. Gli ingombri restano invariati.

## Birre alla spina e vini della casa

Il layout precedente riservava al puntinato una colonna fissa di 20px su desktop e 12–16px su mobile, producendo piccoli frammenti isolati. Questa colonna e il relativo elemento sono stati rimossi soltanto dalle sei voci con più prezzi.

Da 768px: colonna del nome e blocco prezzi separati da 24px; il blocco occupa almeno 260px e comprende tre colonne uguali. I formati in intestazione e i prezzi condividono la stessa griglia. La descrizione Bionda/Ambrata appare sotto il nome.

Sotto 768px: il nome usa l’intera larghezza. Sotto seguono tre colonne con formato visibile e prezzo in oro. La prima si allinea a sinistra, la seconda al centro, la terza a destra. I prezzi condividono il bordo inferiore anche se un’etichetta occupa più righe. Rimossi i precedenti ridimensionamenti a 14px dei nomi e 15–17px dei prezzi: ora ereditano rispettivamente 16px e 19px dal menù mobile.

Ogni prezzo mantiene la propria etichetta accessibile. Nessun cambiamento a prezzi, nomi, volumi, descrizioni, codici allergeni o traduzioni. Le birre in bottiglia conservano il testo senza ritorno a capo forzato della 3.2.

## QA e consegna

La verifica delle 86 voci confronta il contenuto prerenderizzato con il menù approvato. Un controllo dedicato confronta tutte le 18 associazioni formato/prezzo con i dati originali. Sono preservati gli altri controlli di build, integrità dei 185 file protetti e interazioni.

Il test browser verifica stabilità di fotografia/maschera in hover, tratti da 1px con glow esterno, puntinato grigio, assenza di frammenti nelle bevande e layout responsive in quattro lingue. L’esecuzione si arresta prima del rendering perché manca l’eseguibile headless. La resa ottica va quindi confermata sull’anteprima di sviluppo, soprattutto per la delicatezza del glow e del puntinato.

Il pacchetto contiene l’intero sito, esclusi dipendenze installate, build e output temporanei. Nessun deploy eseguito.
