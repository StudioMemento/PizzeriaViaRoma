const rules: [number, RegExp][] = [
  [
    1,
    /\b(farina|grano|frumento|orzo|avena|segale|farro|kamut|panatura|pangrattato|impasto|cornicione|montanare)\b/i,
  ],
  [2, /\b(gamber[io]|gamberett[io]|scampi|aragosta|granchio|crostacei)\b/i],
  [3, /\b(uova?|tuorl[io]|albume|maionese)\b/i],
  [4, /\b(tonno|acciughe|acciuga|alici|salmone|pesce|baccala|merluzzo)\b/i],
  [5, /\b(arachidi|arachide)\b/i],
  [6, /\b(soia|tofu|edamame)\b/i],
  [
    7,
    /\b(mozzarella|bufala|burrata|ricotta|brie|gorgonzola|formaggi[oa]?|grana|parmigiano|montasio|pecorino|feta|provola|frico|asiago|latte|panna|burro|mascarpone|stracchino)\b/i,
  ],
  [
    8,
    /\b(mandorl[ae]|nocciole|pistacchi[o]?|noci|anacardi|pecan|macadamia)\b/i,
  ],
  [9, /\bsedano\b/i],
  [10, /\bsenape\b/i],
  [11, /\bsesamo\b/i],
  [12, /\b(solfiti|anidride solforosa)\b/i],
  [13, /\blupini\b/i],
  [
    14,
    /\b(molluschi|cozze|vongole|calamari|polpo|seppie|ostriche|capesante)\b/i,
  ],
];
// Preserved V18 declaration + ingredient rule behavior; no recipe data changes.
export const getAllergenInfo = (name = "", description = "", original = "") => {
  const text = `${name} ${description}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const declared = [
    ...new Set(
      (String(original).match(/\d+/g) || [])
        .map(Number)
        .filter((n) => n >= 1 && n <= 14),
    ),
  ];
  const inferred = rules
    .filter(([, pattern]) => pattern.test(text))
    .map(([code]) => code);
  const codes = [...new Set([...declared, ...inferred])].sort((a, b) => a - b);
  const checks = [];
  if (
    /pesto|grana|salsiccia|salame|prosciutto|pitina|wurstel|wurstel|salsa|crema|impanat|panat|mix|dolci|dessert|lager|bock|ipa|hirter|wieze|cabernet|friulano|prosecco/i.test(
      text,
    )
  )
    checks.push("Verificare ricetta ed etichetta dei prodotti composti");
  if (/grana/i.test(text))
    checks.push("Verificare eventuale lisozima da uovo nel formaggio");
  if (/marinara/i.test(text) && declared.includes(7))
    checks.push(
      "Latte già dichiarato nel menù ma non esplicito negli ingredienti: confermare",
    );
  if (!codes.length)
    checks.push(
      "Dati insufficienti: nessuna dichiarazione di assenza di allergeni",
    );
  return {
    codes,
    declared,
    inferred,
    added: inferred.filter((n) => !declared.includes(n)),
    frozen: String(original).includes("*"),
    checks,
  };
};
