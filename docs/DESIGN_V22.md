# Via Roma · Design V22

## Direzione

La base torna nera, con testo avorio e oro limitato a dettagli, filetti e indicazioni. Il colore delle fotografie e della pizza rimane il punto di maggiore intensità. I nuovi stili interessano soltanto cornicione, gallery, community, social e info; nessuna regola modifica hero, menù cartaceo, popup, dati o navigazione.

## Modifiche concrete

- **Social:** composizione editoriale in due colonne. Titolo e invito a sinistra; due link ampi, distinti da un filetto, a destra. Instagram e Facebook restano le sole destinazioni. La gerarchia platform → profilo → azione è leggibile anche a 320px. Nessuna recensione né card ripetuta.
- **Info:** orari, stato di apertura e contatti formano una colonna pratica; la mappa fotografica occupa l’altra. Il contenuto sostituisce il precedente gruppo di box. Su schermi piccoli le informazioni precedono la mappa. L’intero link della mappa è cliccabile; indirizzo e invito all’apertura sono protetti da un gradiente locale sulla fotografia.
- **Prestazioni info:** eliminato il componente interattivo MagicBento dal footer. La composizione usa HTML/CSS nativi, senza listener del puntatore o animazioni per le card. L’unico aggiornamento periodico è lo stato di apertura, una volta al minuto; non aggiorna lo stato quando il documento è nascosto.
- **Community:** ridotta la dimensione del titolo e recuperati i margini vuoti interni al canvas. L’altezza del reel e i margini della sezione cambiano, mentre impostazioni, quadratura, velocità, foto e comportamento della Circular Gallery restano di competenza Interactions.
- **Gallery locale:** ancoraggio a inizio sezione senza la porzione residua del menù precedente; il primo titolo conserva 150px di spazio dalla sommità per la navigazione. Titoli avorio, centrati fra gli stessi margini delle fotografie. Su desktop l’altezza dell’immagine usa `clamp(320px, 100svh - 580px, 520px)` per lasciare i controlli sopra la fascia di blur; 208px di padding finale permettono di leggerli anche su viewport bassi. Nessuna modifica ai parametri dell’Accordion o al layout mobile.
- **Cornicione:** superfici alleggerite, un filetto oro al posto della cornice completa, titoli più nitidi. Illustrazioni, scelte e prezzi restano quelli già approvati nella fonte.

## Spazi di lettura

Social e info hanno `min-height:100svh`; crescono naturalmente quando il testo o lo schermo lo richiedono. Il titolo info parte dopo 156px e il contenuto termina 208px prima del fondo: il footer può scorrere sopra la fascia di blur inferiore da 190px. Non si comprime la tipografia per far entrare informazioni troppo lunghe in un solo viewport. I margini orizzontali riusano `--vr-gutter` senza ridefinirlo.

## Integrazione

- `src/components/Social.tsx`
- `src/components/Contacts.tsx`
- `src/styles/design-v22.css`, dopo gli stili V21 e dopo effetti/interazioni V22.

Gli ID di sezione e le classi radice esistenti rimangono, così le atmosfere, la navigazione e i link funzionano. Le nuove classi interne `v22-social-*` e `v22-visit-*` evitano i vecchi override delle card. Tutti i testi localizzati, gli orari, i numeri di telefono e le destinazioni derivano dalle stesse fonti V21. `isRestaurantOpen` mantiene la logica nel fuso Europe/Rome.

## Quattro passaggi

1. **Implementazione:** nuova struttura social/info, gerarchie, layout responsive e componenti semantici.
2. **Revisione esperta:** lettura delle regole legacy e isolamento con nuove classi interne; nessuna modifica a file congelati; verifica di link, testi e logica di apertura.
3. **Difetti:** corretti gli ancoraggi che lasciavano il menù sopra la gallery e gli spazi che nascondevano titoli/footer sotto il blur. Recuperato il vuoto del renderer community senza alterarne il preset.
4. **Polish:** filetti sottili, avorio più leggibile, titoli controllati, microstati dei link senza animazioni continue e priorità delle informazioni su mobile.

## Evidenza e limiti

PostCSS ha analizzato 123 regole, tutte ancorate agli ID delle cinque sezioni consentite; nessun selettore globale, hero, menù o dialog. Il producer ha approvato social, info, community desktop e la versione tedesca a 320px senza overflow. Il footer info a 390px termina a y636 su viewport da 844px, sopra la fascia di blur inferiore. Verifiche TypeScript complete, build, integrità del menù e controllo finale dei comandi gallery sono responsabilità di Integration/Playtesting e del producer.
