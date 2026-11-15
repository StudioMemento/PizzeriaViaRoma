# Pizzeria Via Roma — audit V18

5 ottobre 2026 · revisione dei sorgenti V17, delle dieci schermate e del nuovo video. Nessun deploy eseguito.

## Valutazione generale

L’ordine funziona: hero → pizze → cornicione → categorie → menù → film → locale → Community → esperienze → contatti. Porta rapidamente al prodotto e al menù, poi approfondisce atmosfera e prova sociale. Non aggiungerei altre sezioni. Conserverei nero/oro, fotografie reali e particelle nei punti previsti, evitando altri canvas pesanti in ogni sezione.

Il problema principale era la sovrapposizione di revisioni: più regole per lo stesso player e comportamenti nativi del browser in conflitto con il trascinamento. La V18 separa i componenti modificati, elimina controlli e controller dismessi e riduce il peso delle immagini decodificate.

## Correzioni

| Area | Causa | Intervento |
|---|---|---|
| Frecce pizza | Una regola tardiva rendeva relativi i contenitori; un limite mobile alla larghezza della foto falsava l’allineamento | Contenitore dedicato, pulsanti assoluti sinistra/destra, misura condivisa con la foto |
| Drag categorie | Il browser trascinava il link dell’immagine prima della cattura del gesto | Drag nativo disabilitato, gestione orizzontale esplicita, click soppresso dopo trascinamento |
| Titolo Dolci | Testo troppo lungo | “Dolci” e limiti tipografici adattivi |
| Allergeni | Caratteri piccoli, riquadri e testi ridondanti | Righe più leggibili, highlight continuo, riga `*`, nota breve, niente trigger vuoti |
| Player locale | Foto 4K anche nelle miniature; formato del contenitore diverso dalla foto | Frame 192:122, tre immagini ridimensionate e decodificate, riuso del nodo visibile, miniature e barra |
| Community | Snap riattivato al rilascio e inerzia basata sull’intero gesto | Nessuno snap; decadimento dalla velocità recente con arresto ai bordi |
| Film | Testi legati al vecchio montaggio | Nuovo master continuo, tre finestre nelle transizioni interpolate |
| Social | Contatto duplicato, sintesi e introduzione legata a una sola fonte | Restaurant Guru, “Le vostre esperienze”, brevi testi originali completi |
| Contatti | Margine trasparente nel logo, orari duplicati | Logo più grande senza pannello, orari raccolti in una card |
| Codice | HTML monolitico e vecchie regole sovrapposte | Stili e logica separati; rimossi 418 selettori ritirati e controller non utilizzati |

## Prestazioni e video

Le 40 foto originali sono quasi tutte 3840×2440: una sola immagine può occupare circa 37,5 MB decodificata in RGBA, indipendentemente dal peso compresso. Usarle nelle miniature aumentava il consumo di memoria.

Il player usa tre immagini a 960 px sui viewport piccoli o 1920 px sugli altri; le miniature sono a 240 px. Gli originali restano nel fullscreen senza precaricare tutta la sequenza. Le varianti aggiungono circa 9 MB al pacchetto su disco, ma non vengono caricate tutte all’apertura. Miniature lazy, inizializzazione del player vicino al viewport, pausa fuori vista/in background e preferenza di movimento ridotto contengono il lavoro del dispositivo.

Il film conserva 288 fotogrammi, 12 secondi e 24 fps. Le versioni 1080p e 720p hanno un fotogramma chiave ogni quattro, senza audio, per agevolare il seeking. Montaggio e frame interpolati sono quelli del nuovo master.

| Transizione | Comparsa | Piena visibilità | Scomparsa |
|---|---:|---:|---:|
| 1 | 2,38 s | 2,72–3,28 s | 3,68 s |
| 2 | 5,38 s | 5,72–6,28 s | 6,68 s |
| 3 | 8,38 s | 8,72–9,28 s | 9,68 s |

## Responsive e accessibilità

Il modello dei rail è stato verificato a 320, 375, 390, 520, 768, 799, 800, 1080, 1440 e 1920 px, compreso il passaggio 799/800. Il frame conserva il rapporto della foto; sotto 800 px le esperienze passano a una colonna. Titoli adattivi, larghezze flessibili e frecce con superficie di almeno 44×44 px riducono i rischi nei layout stretti.

Mantenuti focus visibile e comandi da tastiera. Il popup usa `dialog` e restituisce il focus al pulsante di apertura in chiusura; il fullscreen trattiene il focus nei comandi e lo ripristina in chiusura. Aggiunto un accesso rapido al menù da tastiera.

**Limite:** il browser locale è bloccato nell’ambiente di lavoro. I test DOM usano geometria simulata, non un motore di layout. Non sono stati misurati FPS, rendering, overflow effettivi, Lighthouse o comportamento su iPhone/Android/Safari. Non vengono dichiarati collaudi visuali su dispositivi non provati.

Selezione e menu contestuale restano bloccati sulla landing come richiesto in precedenza. Questo non protegge i file dal download e limita alcune funzioni del browser; le pagine legali restano selezionabili.

## Da chiudere

1. **Cartaceo e allergeni.** Dati originari e prezzi invariati. Conservati nove asterischi V17: Cotoletta e Patate Fritte, Caesar Salad, Stuzzica Mix, Patatine Fritte, Alette di Pollo, Anelli di Cipolla, Mini Frico, Pepite di Asiago, Aggiunta di Porcini. Il cartaceo non è fra i materiali recuperati: serve ancora il confronto con la stampa e la verifica della cucina, in particolare per composti, bevande, dolci e contaminazioni. Il CSV esistente documenta i dubbi. Trigger assente non significa “senza allergeni”.
2. **Recensioni.** Due Tripadvisor su pagine individuali e due Google riportate da Restaurant Guru. Le date Google sono solo relative e vengono omesse. I voti non verificabili non sono mostrati: la richiesta precedente di contributi da 3 e 4 stelle richiede fonti con punteggio visibile. La selezione attuale non rappresenta tutte le opinioni. Vedi `Recensioni_fonti.md`.
3. **Dati legali.** Tre pagine integrate, ancora in bozza: completare ragione sociale, partita IVA, sede legale, email privacy, conservazione, hosting e fornitori. Confermare diritti e autorizzazioni Community. Nessun banner simulato per tracker assenti nei sorgenti; controllare anche la configurazione del dominio.
4. **Community.** Mantenute 51 foto uniche e nomi ripetuti distanziati. Le due attribuzioni discordanti della V17 restano escluse: Erika/Giovanni e Giovanni/Pablo.
5. **Orari.** Conservati quelli indicati dal committente: martedì–domenica 18:00–23:00, lunedì chiuso, fuso Europe/Rome. Le schede online non sono tutte coerenti: andranno uniformate dal gestore.

## Prossimo controllo

Aprire lo ZIP e provare prima 390 px e il monitor verticale: drag sull’immagine categoria, rilascio Community, swipe e cambio rapido di miniatura; poi film avanti/indietro sulle tre transizioni. Completare i dati legali e confrontare gli asterischi prima del deploy.

La futura selezione di meno foto e gli HDR programmati miglioreranno il ritmo editoriale. Non servono nuove sezioni: conviene consolidare le interazioni e selezionare le immagini più forti.
