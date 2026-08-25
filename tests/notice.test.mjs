/**
 * Tests de la conversion Markdown de la notice.
 *
 * Le convertisseur ne couvre qu'un sous-ensemble : ces tests fixent ce qu'il
 * doit savoir faire, et surtout les deux pieges ou une regle trop large abime
 * le document — le code confondu avec du gras, et un nombre du texte pris pour
 * un repere interne.
 *
 * Lancement : npm test
 */

import { enLigne, pourLesCoachs, versHtml } from '../outils/marquage.mjs'

let ok = 0,
  ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) {
    ok++
    console.log('  OK    ' + nom)
  } else {
    ko++
    console.log('  ECHEC ' + nom + ' ' + detail)
  }
}

console.log('')
console.log('1. Texte en ligne')
verifier('le gras devient strong', enLigne('tout **hors ligne**') === 'tout <strong>hors ligne</strong>')
verifier('le code devient code', enLigne('voir `dist/index.html`') === 'voir <code>dist/index.html</code>')
verifier('un lien devient a', enLigne('[la fiche](src/x.ts)') === '<a href="src/x.ts">la fiche</a>')
verifier(
  'les chevrons sont echappes',
  enLigne('une balise <img> brute') === 'une balise &lt;img&gt; brute',
)
verifier(
  'les etoiles dans du code ne font pas de gras',
  enLigne('`**` reste tel quel') === '<code>**</code> reste tel quel',
)
verifier(
  'un nombre du texte survit au remontage du code',
  enLigne('de 1 a 5 etoiles, voir `x`') === 'de 1 a 5 etoiles, voir <code>x</code>',
  '(le repere interne ne doit pas se confondre avec un nombre)',
)

console.log('')
console.log('2. Blocs')
verifier('un titre de niveau 2', versHtml('## Sauvegarde') === '<h2>Sauvegarde</h2>')
verifier(
  'les lignes suivantes forment un seul paragraphe',
  versHtml('Une phrase\ncoupee en deux.') === '<p>Une phrase coupee en deux.</p>',
)
verifier(
  'une liste a puces',
  versHtml('- un\n- deux') === '<ul><li>un</li><li>deux</li></ul>',
)
verifier(
  'une ligne indentee prolonge l element de liste',
  versHtml('- debut\n  suite') === '<ul><li>debut suite</li></ul>',
)
verifier('une liste numerotee', versHtml('1. un\n2. deux') === '<ol><li>un</li><li>deux</li></ol>')
verifier(
  'un bloc de code garde ses retours a la ligne',
  versHtml('```\nnpm test\nnpm run build\n```') === '<pre><code>npm test\nnpm run build</code></pre>',
)

console.log('')
console.log('3. Cases a cocher')
const taches = versHtml('- [x] fait\n- [ ] a faire')
verifier('la liste est marquee', taches.startsWith('<ul class="taches">'))
verifier('une case cochee', taches.includes('<li class="tache faite">'))
verifier('une case vide', taches.includes('<li class="tache">'))
verifier('le texte de la tache est conserve', taches.includes('a faire'))

console.log('')
console.log('4. Tableaux')
const tableau = versHtml('| Touche | Effet |\n| --- | --- |\n| `Echap` | Deselectionner |')
verifier('un en-tete', tableau.includes('<thead><tr><th>Touche</th><th>Effet</th></tr></thead>'))
verifier('une ligne de corps', tableau.includes('<td><code>Echap</code></td>'))
verifier(
  'une barre verticale sans ligne de separation reste du texte',
  versHtml('| pas un tableau').startsWith('<p>'),
)

console.log('')
console.log('5. Sections reservees au developpement')
const MARQUE = '<!-- notice:developpeur -->'
const exemple = [
  '# Titre',
  '',
  '## Usage',
  '',
  'a garder',
  '',
  '## Interne',
  MARQUE,
  '',
  'a retirer',
  '',
  '### Detail interne',
  '',
  'a retirer aussi',
  '',
  '## Suite',
  '',
  'a garder',
].join('\n')
const filtre = pourLesCoachs(exemple)
verifier('la section marquee disparait', !filtre.includes('## Interne'))
verifier('son contenu disparait', !filtre.includes('a retirer'))
verifier(
  'ses sous-sections disparaissent aussi',
  !filtre.includes('Detail interne') && !filtre.includes('a retirer aussi'),
  '(marquer un ## doit emporter ses ###)',
)
verifier('la section suivante revient', filtre.includes('## Suite'))
verifier('les sections non marquees sont intactes', filtre.includes('## Usage'))
verifier('la marque elle-meme ne ressort pas', !filtre.includes(MARQUE))
verifier(
  'un document sans marque n est pas touche',
  pourLesCoachs('## A\n\ntexte\n') === '## A\n\ntexte\n',
)

console.log('')
console.log('6. Emplacements de capture')
const avecCapture = versHtml('## Titre\n<!-- notice:capture accueil -->\n\nDu texte.')
verifier(
  'la marque devient un emplacement',
  avecCapture.includes('<figure class="capture" data-capture="accueil"></figure>'),
)
verifier('le titre et le texte restent', avecCapture.includes('<h2>Titre</h2>') && avecCapture.includes('<p>Du texte.</p>'))
verifier(
  'la marque ne ressort jamais telle quelle',
  !avecCapture.includes('notice:capture accueil -->'),
)
verifier(
  'une marque inconnue reste du texte',
  versHtml('<!-- notice:autre chose -->').startsWith('<p>'),
  "(seules les marques prevues sont interpretees)",
)

console.log('')
console.log('7. Le document reel')
const { readFileSync } = await import('node:fs')
const source = readFileSync(new URL('../LISEZMOI.md', import.meta.url), 'utf8')
const notice = versHtml(pourLesCoachs(source))
verifier(
  'LISEZMOI.md garde ses sections de developpement',
  source.includes('## Développement') && source.includes("## État d'avancement"),
  '(le Markdown est la reference du projet, il reste complet)',
)
verifier(
  'la notice des coachs ne les reprend pas',
  !notice.includes('Développement') && !notice.includes("État d'avancement"),
)
verifier(
  'aucune commande de developpement ne subsiste',
  !/npm run|npm install|npm test/.test(notice),
)
verifier('les sections d usage sont bien la', notice.includes('Raccourcis clavier'))
// Compter un nombre fixe rendait ce test faux des qu on illustrait une
// section de plus. Ce qui compte vraiment est qu AUCUNE marque ne se perde en
// chemin : chaque <!-- notice:capture X --> doit devenir un emplacement.
// Sur le texte DESTINE aux coachs : le Markdown complet mentionne aussi la
// syntaxe de la marque dans sa partie developpeur, qui n est pas une demande.
const marques = (pourLesCoachs(source).match(/<!-- notice:capture /g) || []).length
const emplacements = (notice.match(/data-capture=/g) || []).length
verifier(
  'le document demande bien des captures',
  marques >= 4,
  `(${marques} marques dans le Markdown)`,
)
verifier(
  'aucune marque de capture ne se perd a la conversion',
  emplacements === marques,
  `(${marques} demandees, ${emplacements} posees)`,
)

// Une capture nommee dans le Markdown doit AUSSI avoir une legende.
//
// Elle devait autrefois figurer, en plus, dans une liste ecrite a la main au
// bas de outils/notice.mjs. Cette liste n'existe plus : elle se deduisait mal
// — illustrer une section de plus sans y penser laissait un emplacement vide,
// sans erreur ni message, et c'est ainsi que deux sections ajoutees sont
// restees sans image. La liste vient desormais du document lui-meme, et ce
// test verifie que ce soit toujours le cas.
const outil = readFileSync(new URL('../outils/notice.mjs', import.meta.url), 'utf8')
const noms = [...pourLesCoachs(source).matchAll(/<!-- notice:capture ([a-z-]+) -->/g)].map(
  (m) => m[1],
)
verifier(
  'la notice deduit ses captures du document',
  /matchAll\(\/\^<!-- notice:capture/.test(outil),
  '(la liste des captures semble a nouveau ecrite en dur dans outils/notice.mjs)',
)
for (const nom of noms) {
  verifier(
    `la capture « ${nom} » a une legende`,
    outil.includes(`${nom}:`) || outil.includes(`'${nom}':`),
    '(a ajouter dans LEGENDES de outils/notice.mjs)',
  )
}
verifier('un seul titre de niveau 1', (notice.match(/<h1>/g) || []).length === 1)
verifier('des tableaux sont produits', (notice.match(/<table>/g) || []).length >= 3)
verifier('les tableaux de raccourcis passent', notice.includes('<td><code>Ctrl+Z</code></td>'))
verifier(
  'plus aucune marque Markdown dans le texte rendu',
  !/\*\*|^\s*[-|#]\s/m.test(notice.replace(/<[^>]*>/g, '')),
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
