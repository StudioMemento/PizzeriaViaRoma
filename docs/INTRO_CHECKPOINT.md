# STEP 2 — INTRO

ViaRoma_2_INTRO, 2.0.0. Base approvata: ViaRoma_1_HERO 1.1. 17 novembre 2026.

## Carosello

Il precedente renderer nascondeva le card a una distanza fissa di 2.6 posizioni. Con pizze da 500px e gap 16px, il cutoff cadeva a circa 1342px dal centro: dentro una viewport ultrawide da 3440px.

Il nuovo limite usa metà viewport, metà card e un intero passo di margine. Quando il nastro non è abbastanza lungo per riciclare fuori schermo, il numero di elementi fisici cresce per multipli delle 10 pizze logiche. Dots, didascalie e selezione restano dieci. Le copie condividono gli stessi asset e solo l'istanza centrale è esposta come attiva.

Le misure vengono raccolte su ResizeObserver. Il layout effect posiziona le nuove copie prima del paint React; il ciclo di movimento aggiorna soltanto transform/visibility. Il caricamento considera il raggio visibile e viene invalidato anche dal resize. Nessun aumento della velocità automatica.

## Cornicione

Il titolo h2 usa `hero-slogan`: stessa tipografia e stesso gradiente della hero. È stata rimossa la vecchia regola h2 che applicava font-size, tracking e interlinea differenti. La nuova sezione gestisce autonomamente pausa/ripresa del gradiente.

Nome e prezzo condividono un contenitore flex sul fondo. Il nome può andare a capo; il prezzo rimane intero e allineato a destra. La dicitura aggiuntiva è rimossa nelle quattro lingue.

La sfumatura è sempre diretta verso il basso; eliminato l'override mobile orizzontale. La foto resta l'asset originale. Con object-position 50% 42%, il centro del ripieno della fotografia portrait ricade vicino alla metà della card orizzontale.

Mobile portrait: 100svh, padding superiore/inferiore 96/108px più safe area, gap titolo 18px e gap tra card 12px, tre righe flessibili. Eliminata la vecchia altezza minima 680px. Landscape compatto: tre colonne, un'unica riga, testo dimensionato per lo spazio disponibile. Lo spazio inferiore consente alla navbar di restare separata dalle card.

## Preset Holo Card

Riferimento: https://reactbits.dev/c/components/holo-card?intensity=0&frame=0&hoverScale=1.1&glare=0&radius=0&edgeSparkle=0&tiltMax=15

| Parametro | Valore |
| --- | --- |
| Tilt massimo | 15° per asse |
| Scala attiva | 1.1 |
| Intensity / frame / glare / edgeSparkle | 0 |
| Radius | 0 |
| Perspective | 900px |
| Ritorno a riposo | 650ms |
| Inseguimento puntatore | 180ms |

Implementazione dedicata del preset senza foil: non incorpora il renderer o lo shader della libreria. Nessuna dipendenza aggiunta. I bordi della superficie di interazione restano fermi, così il tilt non altera le coordinate usate per calcolarlo.

Mouse: hover e movimento. Touch: pressione e drag; una partenza verticale lascia lo scroll alla pagina. Dopo l'aggancio orizzontale il movimento modula entrambi gli assi. Rilascio, pointercancel, perdita capture, scroll, resize e scheda nascosta azzerano lo stato. Con reduced motion tilt e scale sono disattivati. Nessun RAF permanente in idle.

## QA e checkpoint

6 criteri verificati sul codice e sul pacchetto; 1 verifica browser/visiva da completare. Non si dichiara una verifica su dispositivi reali.

Test numerici: 36.009 posizioni, viewport 320/390/768/1440/2560/3440/3840/5120/7680, 360 ricicli controllati. Test del gestore con 10→20→10 elementi e immagini visibili precaricate. Test tilt con mouse e touch, annullamento, scroll e reduced motion. Regressioni hero, menù e 173 file protetti.

Il browser collegato restituisce un errore di accesso; il browser locale non è disponibile. Il download ufficiale del pacchetto headless non ha restituito un archivio valido. Il test browser è incluso per essere eseguito su un ambiente con Chromium disponibile. Nessun deploy è stato effettuato.

Da controllare sul deploy di sviluppo:

- 3440/5120px: le pizze proseguono oltre entrambi i bordi durante autoplay e drag.
- 390×844, 360×800, 320×568, 430×932: titolo e tre card dentro la sezione; nomi/prezzi sul fondo, ripieno centrato, navbar separata.
- 667×375 e 844×390: layout landscape a tre colonne.
- IT/EN/DE/FR: titoli e nomi senza collisioni con il prezzo.
- Mouse e touch: tilt morbido e ritorno a riposo; scroll verticale fluido.
- Safari iOS / Chrome Android reali: rotazione, safe area, reduced motion e rendering del gradiente.

L'intro è implementata nel pacchetto; l'accettazione visiva finale resta sul deploy di sviluppo.
