# ViaRoma_3_MENU — checkpoint

Base: ViaRoma_2_INTRO 2.0.0. Ambito: menù e presentazione del popup allergeni. Contenuti, ricette, indicazioni allergeni, prezzi, foto e traduzioni editoriali originali conservati.

## Struttura

- `src/components/Menu.tsx`: etichette delle pillole e nomi apribili come trigger allergeni.
- `src/components/menu/MenuTitle.tsx`: misura della tipografia reale; nessuno stretch, ciclo continuo o dipendenza aggiunta. Refit dopo font load, resize e traduzione.
- `src/components/menu/useMenuNavigation.ts`: selezione da scroll con IntersectionObserver, centratura della categoria attiva, segnali di overflow e frecce sensibili al movimento ridotto.
- `src/styles/menu.css`: layout, satinato, highlight oro e presentazione allergeni. Barra z-index 45; gradual blur 40; controlli globali 50. Mask dei bordi senza aggiungere una tinta alla barra.
- `src/components/Dialogs.tsx`: solo gli allergeni si chiudono al click interno; fotografie e testi legali mantengono i propri gesti. X senza riquadro, con feedback di focus a luminosità.
- `src/styles/clean.css`: rimosse solo le vecchie regole del layout allergeni, ora consolidate in menu.css.

Il riflesso del titolo e dei tratti usa oro #C6AB70, oro desaturo #A89B7B e highlight #DAC18B, con un picco chiaro #F1DFB5. È un effetto CSS leggero coerente con il logo, senza aggiungere un altro canvas o shader. Le immagini non vengono ricolorate.

## Esito verifiche

- TypeScript, prerender e build production: passati.
- 86 voci: informazioni renderizzate confrontate con il menù approvato; controllo negativo con un prezzo volutamente alterato rilevato correttamente.
- 181 file immutabili: checksum coerenti; hero HTML e layout non interessati conservati.
- Titolo: misura, font load, resize, traduzione lunga, nodo a dimensione zero e cleanup verificati sul gestore reale.
- Navbar: 8 categorie, overflow iniziale/finale, selezione da scroll/click, resize, lingua e cleanup verificati.
- Popup: apertura da nome/numeri, 14 allergeni + surgelati, quattro lingue, tap interno/esterno, X, Escape, ripristino dello scroll e isolamento del dialogo legale verificati sui gestori reali. Focus restoration è mantenuto nel provider originale; la prova browser è ancora richiesta.
- Regressioni intro/hero: motion, scheduler, particelle/liquid lifecycle, scroll cue, cintura ultrawide e Holo Card verificati.

## Prova visiva ancora richiesta

Il browser collegato ha restituito un errore di accesso aprendo la preview. Il browser headless necessario non è installato nell’ambiente; il test browser termina prima di avviare la pagina. Non sono state prodotte nuove schermate né attestati test su dispositivi reali.

`tests/menu/browser.mjs` copre 320×568, 390×844, 430×932, 768×1024, 1440×900 e 3440×1440, quattro lingue, ingombri del titolo, livelli della navbar, chevron mobili, voci e popup. Da eseguire contro il deploy di sviluppo prima dell’approvazione visiva.

Controllare su Safari iOS / Chrome Android la trasparenza delle pillole, lo scorrimento orizzontale, la sfumatura ai bordi, i testi lunghi e il popup aperto da un nome. Su desktop verificare il riflesso oro del titolo e dei tratti. Le descrizioni non sono troncate: sui telefoni stretti, quelle lunghe possono superare due righe.

Nessuna pubblicazione effettuata. Lo ZIP contiene l’intero sito e non include node_modules, dist, output temporanei o test-results.
