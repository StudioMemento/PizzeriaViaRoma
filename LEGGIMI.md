# Via Roma V18 — HTML per revisione

5 ottobre 2026. Aggiornamento della V17 dalle nuove schermate e da `ViaRoma.mov`. Nessuna pubblicazione eseguita.

Estrai tutto lo ZIP e apri `index.html`, mantenendo CSS, JavaScript e cartella `assets` accanto all’HTML. Per una prova più fedele al sito pubblicato, con Node 18 o successivo:

```sh
npm run dev
```

Apri `http://localhost:4173`. `npm run build` prepara `dist` senza pubblicare. Non servono dipendenze da installare per questi comandi.

## Modifiche

- Frecce pizza ancorate ai due lati della foto, con misura condivisa fra foto e posizione dei pulsanti. Rimossi i pulsanti pausa dei due slider.
- Drag delle categorie anche sopra immagini e link, senza apertura involontaria al rilascio. Titolo abbreviato in “Dolci”.
- Popup allergeni: titoli maiuscoli, descrizioni più grandi, highlight continuo, quindicesima riga `*` per i surgelati. Rimossi introduzione, spunte e pulsanti senza codici o asterisco. Nota: “Chiedi al personale per ulteriori informazioni”.
- Nuovo video continuo, senza tagli delle scene: testi sulle tre transizioni interpolate.
- Player locale ricostruito: frame nel rapporto della foto, miniature integrate trascinabili, swipe, barra di avanzamento. Niente contatore, didascalia, frecce o play/pausa. Click/tap apre il fullscreen. Autoplay ogni 6,5 secondi, sospeso durante l’interazione, fuori vista, in background e con movimento ridotto.
- Foto a 960/1920 px per il player, miniature a 240 px; originali 4K solo nel fullscreen.
- Community: inerzia continua dalla velocità di rilascio, senza snap.
- Restaurant Guru nella sezione Social; restano i recapiti WhatsApp e l’invio foto Community.
- Quattro recensioni brevi complete in lingua originale: due Tripadvisor e due Google tramite Restaurant Guru. Date mostrate solo quando verificabili.
- Introduzione “Le vostre esperienze”, logo finale più grande, orari senza duplicazioni, pagine Privacy / Cookie / Note legali.
- HTML, stili e logica separati; rimossi 418 selettori dei componenti dismessi e i vecchi controller duplicati. Migliorata la navigazione da tastiera.

## Prima di pubblicare

Leggi `docs/Audit_V18.md` e `docs/Verifiche.md`. I controlli automatici riguardano codice, dati e stati delle interazioni: non certificano il rendering su dispositivi reali.

Le pagine legali sono bozze navigabili con campi da completare: ragione sociale, partita IVA, sede legale, contatto privacy, conservazione e servizi effettivi di hosting. Non è stato aggiunto un banner per tracker assenti nei sorgenti; verificare anche il dominio prima del deploy.

Gli asterischi dei surgelati sono quelli dei dati V17. Il cartaceo non è disponibile fra i materiali recuperati di questa revisione: resta il confronto con la stampa e la validazione della cucina. Un pulsante allergeni assente non significa assenza di allergeni.

Per recensioni esplicitamente da 3 e 4 stelle occorrono fonti con voto verificabile. Due attribuzioni fotografiche discordanti, già segnalate nella V17, restano fuori dalla Community pubblica.

## Sorgenti

| File | Funzione |
|---|---|
| `index.html` | Struttura della pagina |
| `site.js` | Menù, traduzioni, foto, recensioni, orari, sincronizzazione del film |
| `app.js` | Slider infiniti, particelle e popup allergeni |
| `motion.js` | Trascinamento e inerzia dei rail finiti |
| `gallery.js` | Player locale, miniature, swipe, avanzamento |
| `base.css`, `app.css`, `polish.css` | Stili conservati e ripuliti |
| `refine.css` | Componenti e correzioni V18 |
| `allergens.js` | Legenda e codici dedotti dagli ingredienti |
| `privacy.html`, `cookie.html`, `note-legali.html`, `legal.css` | Pagine legali da completare |

La build esclude `docs`, che contiene solo materiale di revisione. Font e icone sono locali e conservano le licenze.
