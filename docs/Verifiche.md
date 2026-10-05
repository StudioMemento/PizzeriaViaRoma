# Verifiche V18

5 ottobre 2026. Nessun deploy o test visuale su dispositivo reale.

| Controllo | Esito |
|---|---|
| Sintassi JS, parsing CSS con PostCSS/css-tree e build | Superati |
| Confronto dati V17: menù, varianti, ripieni, bibite, birre, vini, prezzi, codici e asterischi | Invariati |
| Avvio DOM, cambio lingua IT/EN/DE/FR, errori runtime | Superato, nessun errore rilevato |
| Controlli rimossi, Dolci, card Restaurant Guru, footer | Superato |
| Popup: nome, 14 allergeni + `*`, evidenziazioni, nota e ritorno del focus | Superato |
| Drag sul link della foto categoria e soppressione del click successivo | Superato |
| Frecce pizza avanti/indietro | Superato nel modello DOM |
| Geometria rail a dieci larghezze 320–1920 px | Valori validi nel modello |
| Inerzia Community senza snap o inversione al rilascio | Superato nel modello temporale |
| Player: tre pannelli, miniatura, swipe, tastiera, autoplay e barra | Superato nel modello DOM/temporale |
| Tre finestre testo, assenza fra transizioni, opacità 0–1 | Superato |
| Due video | H.264, 288 frame, 24 fps, 12 s, solo video, 72 keyframe, distanza massima 4 frame |
| Asset locali di gallery, miniature, Community, pizze, DOM e stili | Tutti presenti |
| Community: file unici, nomi uguali non consecutivi | Superato |
| Recensioni: entrambe le fonti, corpi brevi completi | Dataset e fonti registrati |
| API cookie/storage/analytics nei sorgenti applicativi | Nessuna rilevata |

I test simulano geometria, caricamento immagini e tempo. Individuano regressioni della logica, ma non misurano rendering, compositing, decodifica video o gesti fisici.

L’anteprima browser locale è bloccata. Restano da provare iOS Safari, Android Chrome, desktop orizzontale e verticale, zoom al 200%, rotazione e movimento ridotto. La verifica dei sorgenti non include script/cookie aggiunti dall’infrastruttura in produzione. Pagine legali e matrice allergeni richiedono i completamenti dell’audit.
