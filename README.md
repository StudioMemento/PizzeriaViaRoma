# Pizzeria Via Roma — V22

Revisione del sito con hero, slider, gallery, social e contatti rielaborati. La V21 è il riferimento immutabile per il menù cartaceo: componenti, testi, prezzi, allergeni, fotografie, artwork e tutti i fogli CSS preesistenti sono conservati. Il pacchetto include sorgenti, risorse locali e configurazione di build; non modifica i deploy esistenti.

## Avvio e verifica

Usa Node.js 24, indicato in `.nvmrc`. È supportato anche Node.js 22 dalla versione 22.13: il test del controller di navigazione usa l’API nativa `stripTypeScriptTypes` disponibile da quella versione.

```bash
npm ci
npm run dev
```

Per verificare e servire la build di produzione:

```bash
npm run check
npm test
npm run preview
```

`check` esegue TypeScript, build Vite, prerender e controllo di asset e dimensioni. `test` verifica il contratto V22, incluso il confronto esatto del menù HTML con V21. Per il solo controllo dei sorgenti, senza generare la build:

```bash
node scripts/verify-v22.mjs --source-only
```

Le prove del controller di navigazione usano il codice reale in un ambiente DOM simulato. I controlli di integrità includono modifiche intenzionali su copie temporanee per verificare che il test sappia rilevare regressioni. I vecchi verificatori sono riferimenti storici e non vengono eseguiti da `npm test`.

## Cosa cambia in V22

- Hero con logo e slogan originali, nero profondo e campo di luce oro; effetti React Bits attivati solo quando utili e con supporto al movimento ridotto.
- Caricamento progressivo delle immagini degli slider; motori delle gallery e GSAP caricati vicino alla rispettiva sezione, mantenendo lo spazio già riservato nella pagina.
- Un solo gestore passivo dello scroll per dock e indicatore di avanzamento, con letture della geometria memorizzate e aggiornate quando il layout cambia.
- Quattro livelli di sfocatura per ciascun bordo globale anziché otto. La barra locale delle categorie conserva i suoi otto livelli e il suo aspetto V21.
- Social e contatti rielaborati, senza recensioni. I contatti usano un layout HTML/CSS nativo, mantenendo mappa, orari, telefono, WhatsApp e dialoghi legali.

IT, EN, DE e FR restano disponibili. Il menù rimane presente nell’HTML generato, prima dell’avvio di JavaScript. Le nuove regole CSS riguardano esclusivamente le sezioni autorizzate; non ridefiniscono la tipografia, le righe o i banner del menù.

## Preparazione dello ZIP e deploy di prova

1. Estrai lo ZIP e copia il contenuto della cartella nella root della repository di prova: `package.json`, `vercel.json`, `src/` e `public/` devono trovarsi allo stesso livello.
2. Importa quella repository in un progetto Vercel di prova.
3. Framework **Vite**; installazione `npm ci`; build `npm run build`; output `dist`.
4. Non sono richieste variabili d’ambiente, chiavi API, backend o database.

`vercel.json` contiene già questi comandi. Non includere `node_modules`, `.ssr` o file `.env` nella repository o in uno ZIP dei sorgenti. `dist` è rigenerabile e non è necessario per la consegna dei sorgenti.

Il progetto mantiene `noindex, nofollow` e `Disallow: /` per lo staging. Prima di una pubblicazione definitiva, aggiorna l’indicizzazione e completa i campi originali ancora presenti nelle pagine legali. I collegamenti telefono, WhatsApp, social e Google Maps conservano i riferimenti esistenti. Nessun deploy viene effettuato automaticamente dai comandi di verifica.

## Struttura

| Ambito | Percorso |
|---|---|
| Menù e allergeni congelati | `src/components/Menu.tsx`, `src/components/Dialogs.tsx`, `src/data/` |
| Header, dock e avanzamento | `src/components/Navigation.tsx` |
| Immagini responsive | `src/components/Photo.tsx` |
| Slider e gallery | `src/components/IntroSliders.tsx`, `Gallery.tsx`, `Community.tsx` |
| Hero e atmosfere | `src/components/Hero.tsx`, `src/components/effects/` |
| Nuovi stili | `src/styles/effects-v22.css`, `interactions-v22.css`, `design-v22.css` |
| Verifica di integrità | `scripts/verify-v22.mjs`, `tests/v22/` |
| Integrazione e costi misurati | `docs/INTEGRATION_V22.md` |
| Evidenze visive e limiti del test | `docs/QA_V22.md` |

I fogli V22 vengono caricati dopo quelli V21 nell’ordine effetti → interazioni → design. Non modificare i file congelati per una correzione di una sezione V22: usa le classi specifiche della sezione. Le implementazioni React Bits e gli adattamenti sono documentati in `docs/VFX_V22.md` e `docs/INTERACTIONS_V22.md`, con attribuzioni in `licenses/`.
