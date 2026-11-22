# Layout V25

| Larghezza CSS | Margine sinistro | Contenuto | Margine destro |
| --- | ---: | ---: | ---: |
| Mobile <768 px | 10% | 80% | 10% |
| Tablet 768–1199 px | 15% | 70% | 15% |
| Desktop 1200–2399 px | 20% | 60% | 20% |
| Ultrawide ≥2400 px | 30% | 40% | 30% |

Unica fonte: `--vr-gutter` / `--vr-content` in `src/styles/clean.css`. Header, menù, testi, cornicioni, gallery e contatti usano questi valori. Lo slider fotografico è volutamente a tutta larghezza, con foto laterali ritagliate e una maschera di dissolvenza ai soli bordi verticali.

Su mobile il bordo esterno del primo e del quinto tasto navbar coincide con il bordo del contenuto. Da tablet il gruppo è centrato e largo al massimo 400 px; le icone non cambiano scala all'hover.

Hero: `100svh`, due righe di layout 72%/28%. La composizione termina al fondo della prima riga; il chevron è centrato nella seconda. Sotto 540 px di altezza le righe diventano 56%/44%, mantenendo il centro richiesto e lasciando spazio ai tasti inferiori.

Cornicioni mobile: altezza `100svh`, minimo 680 px, tre righe; riserva inferiore di 88 px per la navbar. Scroll target all'inizio della sezione, senza offset aggiuntivo. Il ripieno è visibile sul lato sinistro; testo e prezzo rimangono dentro la fotografia con sfumatura nera statica. Nessun filtro blur.

La verifica del 16 novembre comprende nove viewport. `RESPONSIVE_V25.json` registra le misure reali: nessun overflow orizzontale, zero filtri/canvas; errore massimo del centro chevron <0,02 px. Le barre di scorrimento desktop riducono l'area utile del contenuto nei test con iframe.
