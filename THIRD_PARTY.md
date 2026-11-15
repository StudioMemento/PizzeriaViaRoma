# Componenti e risorse

## Aggiornamento V21 — 15 novembre 2026

Alla base V20 si aggiungono i componenti ufficiali React Bits **Light Rays**, **Shiny Text**, **Accordion Gallery** e **Circular Gallery**. Gradual Blur è adattato con rampe più morbide. Fonti, parametri e modifiche sono documentati in `docs/VFX_V21.md` e `docs/INTERACTIONS_V21.md`; resta inclusa la licenza completa React Bits. Dot Grid e ReviewTicker sono conservati nei sorgenti storici, ma non compongono più la pagina corrente.

La gallery Accordion usa **GSAP**, installato da npm con versione risolta in `package-lock.json`, distribuito secondo la [licenza ufficiale GSAP](https://gsap.com/standard-license/) dal [repository ufficiale](https://github.com/greensock/GSAP). Le tre illustrazioni SVG dei cornicioni sono state create per Via Roma; non sostituiscono o alterano fotografie e artwork originali.

## React Bits

Sorgenti ufficiali acquisiti il 14 novembre 2026 dal repository [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits), varianti TypeScript + CSS:

- [Magic Bento](https://reactbits.dev/components/magic-bento?radius=0): `src/ts-default/Components/MagicBento/`.
- [Gradual Blur](https://reactbits.dev/animations/gradual-blur): `src/ts-default/Animations/GradualBlur/`.
- [Dot Grid](https://reactbits.dev/backgrounds/dot-grid): `src/ts-default/Backgrounds/DotGrid/`.

La licenza acquisita è **MIT + Commons Clause**, integralmente inclusa in `licenses/react-bits-LICENSE.md`. I componenti sono parte di questa applicazione; non costituiscono una libreria o un pacchetto di componenti destinato alla rivendita.

Adattamenti locali: Magic Bento usa contenuti del ristorante; eliminati le illustrazioni dimostrative e l'importazione di icone Hugeicons. Raggio zero, colori Via Roma e opzioni di movimento ridotte. Aggiunta sospensione con scheda nascosta e aggiornamento della preferenza di movimento. Dot Grid rispetta scheda nascosta e preferenza di movimento; risoluzione canvas limitata a DPR 1. Gradual Blur mantiene l'algoritmo originale con parametri conservativi. Nessuna dipendenza runtime da React Bits via CDN.

## Font e icone

- **Jost**: font della V18, conversione locale TTF → WOFF2 dei pesi 200/300/400/500. [Fonte della licenza OFL](https://github.com/google/fonts/tree/main/ofl/jost), copia in `licenses/Jost-OFL.txt`.
- **Phosphor Icons**: font thin e soli selettori CSS utilizzati dalla V18. [Repository ufficiale](https://github.com/phosphor-icons/web), licenza MIT in `licenses/Phosphor-MIT.txt`.

## Applicazione

React, React DOM, Vite, TypeScript, PurgeCSS e strumenti di verifica sono installati da npm con versioni risolte in `package-lock.json`. I relativi pacchetti includono le rispettive licenze.

Logo, fotografie, immagini del menù e mappa derivano dai materiali già serviti dal sito Via Roma V18. Le immagini del menù e gli originali conservati non sono stati rigenerati o ritoccati. Nessuna immagine generata per le tavole è inclusa nel sito.
