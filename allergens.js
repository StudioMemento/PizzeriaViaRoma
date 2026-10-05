/* Ingredient-derived additions never remove a declaration from the supplied menu.
   This is a review aid; composite ingredients and cross-contact require the kitchen. */
(() => {
  'use strict';
  const rules=[
    [1,/\b(farina|grano|frumento|orzo|avena|segale|farro|kamut|panatura|pangrattato|impasto|cornicione|montanare)\b/i],
    [2,/\b(gamber[io]|gamberett[io]|scampi|aragosta|granchio|crostacei)\b/i],
    [3,/\b(uova?|tuorl[io]|albume|maionese)\b/i],
    [4,/\b(tonno|acciughe|acciuga|alici|salmone|pesce|baccala|merluzzo)\b/i],
    [5,/\b(arachidi|arachide)\b/i], [6,/\b(soia|tofu|edamame)\b/i],
    [7,/\b(mozzarella|bufala|burrata|ricotta|brie|gorgonzola|formaggi[oa]?|grana|parmigiano|montasio|pecorino|feta|provola|frico|asiago|latte|panna|burro|mascarpone|stracchino)\b/i],
    [8,/\b(mandorl[ae]|nocciole|pistacchi[o]?|noci|anacardi|pecan|macadamia)\b/i],
    [9,/\bsedano\b/i],[10,/\bsenape\b/i],[11,/\bsesamo\b/i],
    [12,/\b(solfiti|anidride solforosa)\b/i],[13,/\blupini\b/i],
    [14,/\b(molluschi|cozze|vongole|calamari|polpo|seppie|ostriche|capesante)\b/i]
  ];
  window.getAllergenInfo=(name='',description='',original='')=>{
    const text=`${name} ${description}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    const declared=[...new Set((String(original).match(/\d+/g)||[]).map(Number).filter(n=>n>=1&&n<=14))];
    const inferred=rules.filter(([,pattern])=>pattern.test(text)).map(([code])=>code);
    const codes=[...new Set([...declared,...inferred])].sort((a,b)=>a-b);
    const checks=[];
    if(/pesto|grana|salsiccia|salame|prosciutto|pitina|wurstel|wurstel|salsa|crema|impanat|panat|mix|dolci|dessert|lager|bock|ipa|hirter|wieze|cabernet|friulano|prosecco/i.test(text))checks.push('Verificare ricetta ed etichetta dei prodotti composti');
    if(/grana/i.test(text))checks.push('Verificare eventuale lisozima da uovo nel formaggio');
    if(/marinara/i.test(text)&&declared.includes(7))checks.push('Latte già dichiarato nel menù ma non esplicito negli ingredienti: confermare');
    if(!codes.length)checks.push('Dati insufficienti: nessuna dichiarazione di assenza di allergeni');
    return{codes,declared,inferred,added:inferred.filter(n=>!declared.includes(n)),frozen:String(original).includes('*'),checks};
  };
  window.VIA_ROMA_ALLERGENS={
    it:[['Cereali con glutine','Grano, segale, orzo, avena, farro e derivati.'],['Crostacei','Crostacei e prodotti derivati.'],['Uova','Uova e prodotti derivati.'],['Pesce','Pesce e prodotti derivati.'],['Arachidi','Arachidi e prodotti derivati.'],['Soia','Soia e prodotti derivati.'],['Latte','Latte e derivati, incluso il lattosio.'],['Frutta a guscio','Mandorle, nocciole, noci, anacardi, pecan, noci del Brasile, pistacchi, macadamia.'],['Sedano','Sedano e prodotti derivati.'],['Senape','Senape e prodotti derivati.'],['Sesamo','Semi di sesamo e prodotti derivati.'],['Solfiti','Anidride solforosa e solfiti oltre 10 mg/kg o 10 mg/l.'],['Lupini','Lupini e prodotti derivati.'],['Molluschi','Molluschi e prodotti derivati.']],
    en:[['Cereals with gluten','Wheat, rye, barley, oats, spelt and derivatives.'],['Crustaceans','Crustaceans and derivatives.'],['Eggs','Eggs and derivatives.'],['Fish','Fish and derivatives.'],['Peanuts','Peanuts and derivatives.'],['Soy','Soybeans and derivatives.'],['Milk','Milk and derivatives, including lactose.'],['Nuts','Almonds, hazelnuts, walnuts, cashews, pecans, Brazil nuts, pistachios, macadamias.'],['Celery','Celery and derivatives.'],['Mustard','Mustard and derivatives.'],['Sesame','Sesame seeds and derivatives.'],['Sulphites','Sulphur dioxide and sulphites above 10 mg/kg or 10 mg/l.'],['Lupin','Lupin and derivatives.'],['Molluscs','Molluscs and derivatives.']],
    de:[['Glutenhaltiges Getreide','Weizen, Roggen, Gerste, Hafer, Dinkel und Erzeugnisse.'],['Krebstiere','Krebstiere und Erzeugnisse.'],['Eier','Eier und Erzeugnisse.'],['Fisch','Fisch und Erzeugnisse.'],['Erdnüsse','Erdnüsse und Erzeugnisse.'],['Soja','Sojabohnen und Erzeugnisse.'],['Milch','Milch und Erzeugnisse, einschließlich Laktose.'],['Schalenfrüchte','Mandeln, Haselnüsse, Walnüsse, Cashews, Pekannüsse, Paranüsse, Pistazien, Macadamia.'],['Sellerie','Sellerie und Erzeugnisse.'],['Senf','Senf und Erzeugnisse.'],['Sesam','Sesamsamen und Erzeugnisse.'],['Sulfite','Schwefeldioxid und Sulfite über 10 mg/kg oder 10 mg/l.'],['Lupinen','Lupinen und Erzeugnisse.'],['Weichtiere','Weichtiere und Erzeugnisse.']],
    fr:[['Céréales avec gluten','Blé, seigle, orge, avoine, épeautre et dérivés.'],['Crustacés','Crustacés et dérivés.'],['Œufs','Œufs et dérivés.'],['Poisson','Poisson et dérivés.'],['Arachides','Arachides et dérivés.'],['Soja','Soja et dérivés.'],['Lait','Lait et dérivés, y compris le lactose.'],['Fruits à coque','Amandes, noisettes, noix, cajou, pécan, noix du Brésil, pistaches, macadamia.'],['Céleri','Céleri et dérivés.'],['Moutarde','Moutarde et dérivés.'],['Sésame','Graines de sésame et dérivés.'],['Sulfites','Anhydride sulfureux et sulfites au-delà de 10 mg/kg ou 10 mg/l.'],['Lupins','Lupins et dérivés.'],['Mollusques','Mollusques et dérivés.']]
  };
})();
