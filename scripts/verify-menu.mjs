import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
await import('../tests/v25/motion.mjs');
await import('../tests/v25/scheduler.mjs');
await import('../tests/hero/runtime.mjs');
await import('../tests/hero/chrome.mjs');
await import('../tests/intro/carousel.mjs');
await import('../tests/intro/tilt.mjs');
const hash=b=>createHash('sha256').update(b).digest('hex');
const baseline=JSON.parse(await readFile('tests/menu/immutable-baseline.json','utf8'));
assert.notEqual(hash(Buffer.from('same')),hash(Buffer.from('different')));
for(const [p,h] of Object.entries(baseline))assert.equal(hash(await readFile(p)),h,`Out-of-scope change: ${p}`);
// The closing gallery and dialog styles now live in their own stylesheets.
const normalizeLayout = source => source.replace(/\.album,\.vr-community[\s\S]*?(?=@media\(prefers-reduced-motion:reduce\))/,'');
assert.equal(await readFile('src/styles/clean.css','utf8'),normalizeLayout(await readFile('tests/menu/layout-approved.css','utf8')),'Layout outside allergens changed');
const approvedI18n = await readFile('tests/menu/i18n-approved.tsx','utf8');
assert.equal(await readFile('src/i18n.tsx','utf8'),approvedI18n,'Unrequested translation/copy changes');
const html=await readFile('dist/index.html','utf8');
const old=await readFile('tests/v25/menu-carta-v24.html','utf8');
function balanced(s,start,tag){let depth=0;for(const m of s.slice(start).matchAll(new RegExp(`<\\/?${tag}\\b[^>]*>`,'g'))){depth+=m[0].startsWith('</')?-1:1;if(!depth)return s.slice(start,start+m.index+m[0].length);}throw Error(`Unclosed ${tag}`)}
const text=s=>s.replace(/<br\s*\/?\s*>/g,'\n').replace(/<[^>]*>/g,'').replaceAll('<!-- -->','').trim();
function entries(s){return [...s.matchAll(/<div class="item\b[^>]*data-menu-item="([^"]*)"/g)].map(m=>{
 const entry=balanced(s,m.index,'div');
 const field=cls=>{const match=entry.match(new RegExp(`<(span|button|p)\\b[^>]*class="${cls}"[^>]*>`));return match?text(balanced(entry,match.index,match[1])):''};
 const grid=entry.match(/<div class="pricegrid">/);
 return [m[1],field('nome'),field('qualifier'),field('prezzo'),field('desc'),grid?text(balanced(entry,grid.index,'div')):''];
})}
const data=JSON.parse(await readFile('src/data/menu.json','utf8'));
const bottled=new Set(data.BOTTIGLIA.flatMap(group=>group[2].map(row=>row[0])));
const beverageNames=new Set([...data.ACQUA_BIBITE,...data.BOTTIGLIA.flatMap(group=>group[2]),...data.SPINA,...data.VINI].map(row=>row[0]));
const before=entries(old).map(row=>row.map((field,i)=>i===4&&bottled.has(row[0])?field.replaceAll('\n',' '):field));
const flag = before.find(row => row[0] === 'Flag');
assert.match(flag[4], /Keller Pils - Senza glutine/i);
flag[4] = flag[4].replace(/Keller Pils - Senza glutine/i, 'Keller Pils');
const after=entries(html);assert.ok(before.length>80);assert.equal(after.length,before.length);before.forEach((row,i)=>assert.deepEqual(after[i],row,`Menu item information changed: ${row[0]}`));
assert.equal(bottled.size,7);
for(const name of bottled){const item=html.match(new RegExp(`<div class="item" data-menu-item="${name}"`));assert.ok(item);const markup=balanced(html,item.index,'div');const description=markup.match(/<p class="desc">(.*?)<\/p>/)[1];assert.ok(!description.includes('<br'),'Bottle description still has a forced line break');}
assert.ok(html.includes('IPA 0,5 l'));
assert.match(html,/<p class="dolci-note">Chiedi al personale la disponibilità del giorno!<\/p>/);
// Prove the comparison can detect a changed price, not just a missing section.
const modified=html.replace(/(<span class="prezzo">)[^<]+/,'$1INVALID');assert.notDeepEqual(entries(modified),before);
const start=html.indexOf('<section id="home"');assert.ok(start>=0);
assert.equal(balanced(html,start,'section'),await readFile('tests/intro/hero-approved.html','utf8'));
assert.ok(html.includes('ViaRoma_V7.0 — preview'));assert.ok(html.includes('noindex,nofollow'));
const crustStart = html.lastIndexOf('<section',html.indexOf('id="cornicione"'));
const takeawayStart = html.lastIndexOf('<section',html.indexOf('id="asporto"'));
assert.equal((balanced(html,crustStart,'section').match(/class="crust-card"/g)||[]).length,3);
assert.equal((balanced(html,takeawayStart,'section').match(/class="crust-card"/g)||[]).length,1);
assert.ok(html.indexOf('id="bevande"') < takeawayStart && takeawayStart < html.indexOf('id="gallery"'));
assert.equal((html.match(/class="menu-dot-grid"/g)||[]).length,0);
const menuMarkup=balanced(html,html.indexOf('<div class="menu-atmosphere">'),'div');
assert.ok(menuMarkup.includes('id="cornicione"') && menuMarkup.includes('id="menu"'), 'The same particle field must cover crust and menu');
assert.equal((menuMarkup.match(/<canvas class="menu-side-band"/g)||[]).length,2);
assert.ok(menuMarkup.includes('class="menu-side-background" aria-hidden="true"'));
const css=await readFile('src/styles/menu.css','utf8');
assert.match(await readFile('src/styles/clean.css','utf8'),/--nero: #090909/);
assert.match(await readFile('src/styles/hero.css','utf8'),/--vr-carbon:\s*#090909/);
assert.match(css,/\.menu-atmosphere \{[^}]*background:#090909/);
assert.match(await readFile('src/styles/intro.css','utf8'),/#pizza-slider \{[^}]*background:var\(--vr-carbon\)/);
assert.ok(!(await readFile('src/styles/contact.css','utf8')).includes('background: #000;'));
assert.ok((await readFile('public/legal.css','utf8')).includes('background:#090909;'));
assert.equal((html.match(/class="finale-field-view"/g)||[]).length,2);
assert.match(html,/<h2 id="takeaway-title">Pizzata a casa\?<\/h2>/);
assert.match(html,/<p>Facciamo anche servizio da asporto!<\/p>/);
assert.match(html,/<h2 id="guest-photos-title">Ricordi condivisi dalla community!</);
assert.doesNotMatch(html,/I numeri indicano gli allergeni|Tocca il nome della bevanda/);
assert.doesNotMatch(html,/menu-allergen-guide|Per allergie o intolleranze|Verifica allergeni/);
const kitchen=balanced(html,html.indexOf('<section class="mcat fx on has-art" id="cucina"'),'section');
assert.match(kitchen,/Anche se incredibile\.\.\.<br class="mobile-break"\/><span class="desktop-separator"> <\/span>non si ha sempre voglia di pizza\?/);
assert.ok(!css.includes('.menu-art:hover'),'Obsolete artwork hover layers remain');
assert.match(css,/\.menu-art::before,\.menu-art::after \{[^}]*filetto\.svg/);
const filetto = await readFile('public/assets/menu/filetto.svg','utf8');
assert.match(filetto,/viewBox="0 0 1000 3" preserveAspectRatio="none"/);
assert.equal((filetto.match(/<path fill="url\(#/g) || []).length,3);
assert.ok(!html.includes('class="pizza-count"'));
const head=balanced(html,html.indexOf('<header class="menu-head"'),'header');
assert.equal(text(head),'Menù');assert.equal((head.match(/<h2/g)||[]).length,1);
for(const [id,title] of [['stuzzicherie','Le stuzzicherie'],['dolci','I dolci'],['bevande','Le bevande']]){
 const section=balanced(html,html.indexOf('<section class="mcat fx on has-art" id="'+id+'"'),'section');
 assert.ok(section.includes('<h3><span>'+title+'</span></h3>'),'Missing article on '+id);
}
const captions=balanced(html,html.indexOf('<div class="pizza-copy"'),'div');
const pizzas = ['classiche','audaci','bianche'].flatMap(category => data.MENU[category].map(row => row.slice(0,2)));
assert.equal(pizzas.length,40);
assert.deepEqual(data.FORNO.map(row => row.slice(1)),pizzas);
assert.equal(new Set(data.FORNO.map(row => row[0])).size,40);
const unescape = s => s.replaceAll('&#x27;',"'").replaceAll('&amp;','&').replaceAll('&quot;','"');
assert.deepEqual([...captions.matchAll(/<h3><button type="button" aria-haspopup="dialog">(.*?)<\/button><\/h3><ul>(.*?)<\/ul>/g)].map(([,name,list]) =>
  [unescape(name), [...list.matchAll(/<li>(.*?)<\/li>/g)].map(m => unescape(m[1])).join(', ')]), pizzas);
const images = JSON.parse(await readFile('src/data/images.json','utf8'));
const photos = JSON.parse(await readFile('src/data/photos.json','utf8'));
assert.equal(Object.keys(photos.GALLERY_ALBUMS).length, 5);
assert.ok(!('CUSTOMER' in photos));
assert.ok(!html.includes('/assets/community/') && !html.includes('photo-byline'));
const guestStart = html.lastIndexOf('<section', html.indexOf('id="customer"'));
const guestCard = balanced(html, guestStart, 'section');
assert.match(guestCard, /class="crust-card"/);
assert.match(guestCard, /class="feature-card-link" href="https:\/\/www.google.com\/maps\/place\/\/data=!4m3!3m2!1s0x477983a3cc4c3b4f:0x641962f142805885!10e5"/);
assert.equal((guestCard.match(/<img /g) || []).length, 1);
const foodRows = [...Object.values(data.MENU).flat(), ...data.VARIANTI, ...data.CORNICE];
const markers = new Map(foodRows.map(([name, , , codes]) => [name, codes]));
// Compare every production code with the published, page-by-page reconciliation.
const audit = await readFile('docs/Allergeni_5.9.md', 'utf8');
const expectedCodes = new Map(audit.split('\n').filter(line => /^\| [^|]+ \| \d+ \|/.test(line)).map(line => {
  const [, name, , , codes] = line.split('|').map(s => s.trim());
  return [name, codes === '—' ? '' : codes.replaceAll(' · ', ' - ').replace('✱', '*')];
}));
const drinkRows = [...data.ACQUA_BIBITE, ...data.BOTTIGLIA.flatMap(group => group[2]), ...data.SPINA, ...data.VINI];
for (const row of drinkRows) markers.set(row[0], row.at(-1));
assert.equal(expectedCodes.size, markers.size + 1);
for (const [name, codes] of markers) assert.equal(codes, expectedCodes.get(name), name);
assert.equal(expectedCodes.get('Dolci del giorno'), '');
for (const [name, , , tokens] of foodRows) {
  if (name === 'Coperto') continue;
  const escaped = name.replaceAll("'", '&#x27;').replaceAll('&', '&amp;').replaceAll('&amp;#x27;', '&#x27;');
  const start = html.indexOf('<div class="item" data-menu-item="'+escaped+'"');
  assert.ok(start >= 0, name);
  const item = balanced(html, start, 'div');
  const match = item.match(/<button class="allergen-trigger"[^>]*>(.*?)<\/button>/);
  if (!tokens) {
    assert.equal(match, null, name);
    assert.ok(item.includes('aria-haspopup="dialog"'), name);
    continue;
  }
  assert.ok(match, name);
  const groups = tokens.match(/\d+/g) || [];
  const expected = groups.join(' · ') + (tokens.includes('*') ? '*' : '');
  assert.equal(text(match[1]), expected, name);
}
for (const [src] of data.FORNO) {
  const meta = images[src];
  assert.deepEqual([meta.width,meta.height],[1100,1100]);
  assert.equal(hash(await readFile('public/'+src)),meta.sha256);
  assert.equal((await readFile('public/'+meta.small)).toString('ascii',8,12),'WEBP');
}
const rail=balanced(html,html.indexOf('<nav class="chips scrollable"'),'nav');
assert.deepEqual([...rail.matchAll(/<button[^>]+data-go="[^"]+"[^>]*>(.*?)<\/button>/g)].map(m=>text(m[1])),['Classiche','Audaci','Bianche','Calzoni','Cucina','Snack','Dolci','Bevande']);
const items=[...html.matchAll(/<div class="item\b[^>]*data-menu-item="([^"]*)"/g)];
const multiPriceNames=new Set([...data.SPINA,...data.VINI].map(row=>row[0]));
for(const m of items){
 const s=balanced(html,m.index,'div');
 if(m[1]==='Coperto') assert.match(s,/<span class="nome">/);
 else assert.match(s,/<button type="button" class="nome" aria-haspopup="dialog"/);
 if(beverageNames.has(m[1])) assert.ok(!s.includes('class="allergen-trigger"'),'Beverage rows use the name for allergen details');
 assert.ok(s.includes('class="dots" aria-hidden="true"'), 'Every price row needs a desktop leader');
 if(multiPriceNames.has(m[1])){
  const cells=[...s.matchAll(/<span class="drink-price-cell">/g)].map(c=>text(balanced(s,c.index,'span')));
  const draught=data.SPINA.find(row=>row[0]===m[1]);
  const sizes=draught?['0,3 l','0,5 l','Caraffa 1,5 l']:['Calice','Caraffa 0,5 l','Bottiglia 0,75 l'];
  const prices=draught?draught.slice(2,5):data.VINI.find(row=>row[0]===m[1]).slice(1,4);
  assert.deepEqual(cells,sizes.map((size,i)=>`${size}: ${prices[i]}`),`Incorrect format/price association: ${m[1]}`);
 }
}
assert.deepEqual(Object.keys(JSON.parse(await readFile('package.json','utf8')).dependencies).sort(),['react','react-dom']);
console.log(`MENU_SCOPE_OK — ${Object.keys(baseline).length} protected files match the approved baseline; ${before.length} entries checked against the printed menu and the Flag description update; reviewed ingredient codes and frozen marks checked; beverage names and price columns verified; all 18 draught/wine format-price pairs verified; global background and kitchen break checked.`);
