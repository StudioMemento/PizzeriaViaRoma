# V25 — clean performance baseline

Rimozione completa degli effetti decorativi e dei renderer recenti per stabilire una base semplice e confrontabile. Nessun deploy remoto effettuato.

| Misura | V24 | V25 | Riduzione |
| --- | ---: | ---: | ---: |
| JavaScript iniziale gzip | 103,447 | 93,110 | 10.0% |
| JavaScript totale gzip | 175,252 | 99,374 | 43.3% |
| CSS gzip | 29,935 | 6,215 | 79.2% |
| HTML gzip | 20,618 | 8,501 | 58.8% |
| 40 foto gallery (byte) | 15,312,312 | 5,269,396 | 65.6% |
| Font icone (byte) | 153,660 | 2,232 | 98.5% |

Sorgenti CSS attivi: da 13 fogli storici a 3 fogli coerenti (`clean`, `menu`, `contact`). Chunk JavaScript: da 9 a 2, con dialog differiti. Rimosse dipendenze GSAP, Playwright e PurgeCSS dal progetto consegnato; i test sono Node senza browser scaricati.

La gallery monta una sola foto per album (5) e una per community; tutte le 52 fotografie restano raggiungibili. Gli originali del locale sono entro 1920×1080, senza alterazione del rapporto; le varianti da 768 px restano disponibili. Un URL versionato impedisce il riuso della precedente immagine 4K dalla cache.

Nessun background animato, metallic paint, gradient text animato, holo, particles, accordion/circular gallery WebGL, gradual blur o scroll progress. Restano soltanto il movimento richiesto delle pizze, le dissolvenze delle caption e lo scroll nativo verso le ancore.

Il rilascio dello slider non arrotonda mai la posizione. Frecce/dot hanno un easing esplicito; l'autoplay è continuo a velocità contenuta e rispetta visibilità, interazioni e movimento ridotto. I testi non traslano con le immagini e non si sovrappongono durante il fade.

Misure di layout e limiti della verifica in `QA_V25.md`. Il pacchetto V24 precedente conserva la versione di partenza, comprese le immagini 4K; V25 contiene solo gli asset necessari alla nuova base.
