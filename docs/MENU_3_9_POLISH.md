# Via Roma 3.9

## Hero e passaggi fra le sezioni

La referenza visiva è il filmato BKG_Logo fornito con il preset Gold Dust. La scena usa 1.500 particelle in due ori, #c6ab70 e #dac18b, su #090909. Il centro dell’emissione coincide con il marchio visibile nel PNG. I punti vicini al marchio sono fitti e minuti. Nella corsa verso i bordi aumentano dimensioni, sfocatura e lunghezza della scia. Il tap illumina i punti attraversati dall’onda. Tenendo premuto si raggiunge gradualmente una velocità quattro volte superiore. Il logo e le particelle condividono un solo ciclo di animazione.

Il tracciato delle immagini della carta è definito una sola volta nel CSS. In apertura e chiusura dello slider si combina con una breve sfumatura verso il fondo #000. La stessa riga chiude la sezione bevande prima della galleria.

## Dal cornicione alle bevande

Una coppia di canvas affianca sia il cornicione sia il menù. Ogni fascia si sposta di 78 px per ogni 100 px percorsi nel menù, con la griglia di 6 px allineata in entrambe le direzioni di scroll. I singoli quadrati variano di luminosità con periodi indipendenti fra 2,6 e 6,5 secondi. Il disegno sfuma all’ingresso nel cornicione e all’uscita dal menù.

I canvas comprendono una piccola zona oltre i bordi visibili. Durante lo scroll si spostano per trasformazione e preparano il tratto seguente quando serve. A pagina ferma il ridisegno è limitato a 20 volte al secondo. Il limite complessivo è di 6.000 quadrati e 1,6 milioni di pixel. Con movimento ridotto la trama segue la pagina alla sua velocità naturale e resta ferma a riposo. Con un dialog aperto o la sezione fuori vista il disegno si sospende.

## Tipografia e carta

Il popup misura lo spazio disponibile all’apertura, al cambio di dimensione e dopo il caricamento del font. Riserva lo stesso padding ai quattro bordi, adattandolo alle aree di sicurezza. Sui telefoni verticali privilegia una colonna. Per le finestre molto basse distribuisce le 15 voci in colonne lette dall’alto verso il basso. Le descrizioni mantengono l’allineamento con i rispettivi nomi. In caso di forte ingrandimento del testo la nota finale resta raggiungibile con lo scroll.

Nei gruppi di bevande l’oro scuro identifica il titolo e il produttore. Il grigio distingue descrizioni e formati, mentre i prezzi mantengono l’oro chiaro della carta. Intestazioni e importi usano le stesse colonne, anche dopo il cambio lingua. La descrizione del produttore prosegue sulla sua stessa riga e può andare a capo sui display stretti. Ogni prezzo mantiene anche l’etichetta del formato per i lettori di schermo.

## Misure di produzione

| Risorsa | Dimensione gzip |
| --- | ---: |
| JavaScript iniziale | 99.921 B |
| JavaScript complessivo, inclusi i moduli differiti | 108.536 B |
| CSS | 9.190 B |
| HTML prerenderizzato | 9.556 B |

I controlli automatici confrontano le 86 voci della carta con i dati approvati, verificano i 18 abbinamenti fra formato e prezzo e controllano gli handler delle bevande e dei piatti. Il controllo dei viewport apre ciascuno dei 70 piatti nelle quattro lingue e misura posizione e ingombro delle 15 voci, del titolo e della nota.

Su Chromium 153 sono state eseguite 10.920 aperture del popup in 39 configurazioni di viewport, comprese cinque configurazioni con aree di sicurezza emulate. Lo scorrimento verticale misurato è stato zero in ciascuna combinazione di piatto e lingua. A 390 × 844 px la scheda Caprina ha un titolo di 38,8 px, un intervallo di 6,3 px tra le voci e 22,8 px di spazio prima e dopo l’elenco. Con testo ingrandito nella prova il dialog permette di raggiungere la nota finale.

I controlli di integrazione hanno coperto 18 combinazioni di larghezza e altezza, da 320 a 3.440 px di larghezza. Nella verifica dei canvas a 390 × 844 e 1.440 × 900 px il confronto dei fotogrammi ha rilevato il twinkle a riposo in entrambi i casi. Uno scroll di 12 px ha spostato la trama di 9,36 px, e lo scroll inverso l’ha riportata alla posizione di partenza.
