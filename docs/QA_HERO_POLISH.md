# QA — ViaRoma_1_HERO 1.1

17 novembre 2026. Esito: **6 criteri verificati; 3 verifiche browser/visive da completare**. Non è dichiarata accettazione visiva della nuova build.

| Criterio | Esito | Evidenza |
| --- | --- | --- |
| Hollow e moto | Passato | Runtime reale: geometria rispetto al PNG, particelle vicine al bordo, DPR e clock 0.25 |
| Logo e palette | Revisionato | PNG/UV invariati, shader oro, hover graduale testato, CSS tipografico originale |
| Aspetto blur/satinato | Da verificare | Codice completato; nuova anteprima non raggiungibile |
| Browser: progress e navigazione | Da verificare | Chromium locale non si avvia; test browser fornito |
| Produzione | Passato | TypeScript, client/SSR, prerender, asset e budget gzip |
| Regressioni | Passato | Menù identico, 166 file invariati, test slider |
| Archivio | Passato | Byte dei file nel pacchetto confrontati con il sorgente |
| Resa desktop/mobile | Da verificare | Nessuno screenshot della nuova build o test su device reale |
| Progress e input | Passato | Gestori reali: range, resize, overscroll, blocchi selettivi e cleanup |

## Riscontro sul deploy precedente

Il browser collegato supporta backdrop-filter ma segnala prefers-reduced-transparency: reduce. La regola precedente nascondeva completamente il gradual blur (display:none e rettangoli 0×0). La correzione elimina quel blocco. Confermati anche il fondo opaco della navbar e il raggio hollow maggiorato.

## Limite dell'ambiente

Il browser collegato restituisce ERR_CONNECTION_REFUSED sul server locale. Chromium nel runner termina con socket Operation not permitted. Nessuna pubblicazione è stata eseguita per aggirare questi limiti. Verifica visiva e Safari/iOS–Chrome/Android restano da completare sul nuovo deploy di sviluppo.
