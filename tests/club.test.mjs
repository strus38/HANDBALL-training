/**
 * Un club, un profil — et rien de lui ailleurs.
 *
 * L'application est desormais fabriquee par club : `CLUB=xxx npm run build`
 * produit l'exemplaire de xxx, avec son nom, son ecusson et ses fiches. Tout
 * cela vit dans `clubs/xxx/`, et nulle part ailleurs.
 *
 * CE QUE CE TEST EMPECHE. Le nom du club etait ecrit a la main dans huit
 * fichiers : l'en-tete, le titre de l'onglet, le pied des feuilles imprimees,
 * la boite d'enregistrement, un message d'erreur, le nom du livrable, la
 * notice, les deux chaines d'assemblage. Rien ne signalait un oubli — un
 * exemplaire livre a un autre club aurait affiche « HBPSM » dans son en-tete,
 * et personne ne l'aurait vu avant l'entraineur qui l'ouvre.
 *
 * La liste des RESTES CONNUS ci-dessous est volontairement explicite. Chaque
 * ligne est une dette datee, pas une echappatoire : y ajouter une entree doit
 * etre un geste delibere. Les deux clefs de stockage attendent leur migration
 * (une clef renommee sans reprise fait perdre ses seances a un entraineur), et
 * les couleurs attendent d'etre nommees par role plutot que par teinte.
 *
 * Lancement : npm test
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { CATALOGUE, FONDS_COMMUN, FICHES_CLUB } from '../.build-tests/domaine.mjs'
import { PROFIL, DOSSIER_CLUB } from '../outils/club.mjs'

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
console.log('1. Le profil du club se tient')

for (const champ of ['identifiant', 'nomCourt', 'nom', 'nomLivrable']) {
  verifier(
    `le profil declare « ${champ} »`,
    typeof PROFIL[champ] === 'string' && PROFIL[champ].trim().length > 0,
  )
}
verifier(
  'le livrable est un fichier .html',
  PROFIL.nomLivrable.endsWith('.html'),
  `(${PROFIL.nomLivrable})`,
)
verifier(
  "l identifiant tient dans un nom de dossier",
  /^[a-z0-9-]+$/.test(PROFIL.identifiant),
  `(${PROFIL.identifiant})`,
)

console.log('')
console.log('2. Le fonds commun ne contient aucune fiche de club')
// Les six fiches de Saint-Marcellin ont ete transcrites de ses diaporamas :
// elles ne partent qu'avec son profil. Les melanger au fonds commun les
// enverrait a tous les clubs sans que personne ne l'ait decide.
const refsCommunes = new Set(FONDS_COMMUN.map((m) => m.ref))
const refsClub = new Set(FICHES_CLUB.map((m) => m.ref))
const debordement = [...refsClub].filter((r) => refsCommunes.has(r))
verifier('aucune fiche du club dans le fonds commun', debordement.length === 0, debordement.join(', '))
verifier(
  'le catalogue est bien la somme des deux',
  CATALOGUE.length === FONDS_COMMUN.length + FICHES_CLUB.length,
  `(${CATALOGUE.length} pour ${FONDS_COMMUN.length} + ${FICHES_CLUB.length})`,
)

console.log('')
console.log('3. Aucun nom de club hors de son dossier')

/** Ce qui nomme un club, en toutes lettres ou en sigle. */
const NOMS = [PROFIL.identifiant, PROFIL.nomCourt, PROFIL.nom]

/**
 * Les restes connus, chacun avec sa raison d'attendre.
 *
 * Format : `chemin` -> pourquoi il tient encore. Vider cette liste est le but ;
 * la rallonger demande une raison ecrite.
 */
const RESTES = {
  // Renommer une clef de stockage sans reprise ferait perdre a un entraineur
  // ses seances, ses favoris et son equipe. La migration est une etape a part.
  'src/ui/Separateur.tsx': 'clef de stockage, en attente de migration',
  'src/ui/FicheExercice.tsx': 'clef de stockage, en attente de migration',
  // Les couleurs sont encore nommees par teinte (--jaune, --bleu-900) : un
  // club en rouge et noir aurait un --jaune rouge. Elles passeront par roles.
  'src/ui/styles.css': 'couleurs du club, en attente de noms de role',
  // Le depot presente encore l'application sous le nom de son premier club.
  'README.md': 'presentation du depot',
}

/**
 * Deux fichiers ont le DROIT de nommer un club : ce sont eux qui le designent.
 *
 * package.json dit quel club se fabrique par defaut ; tsconfig.json dit ou
 * « @club » pointe quand TypeScript verifie les types. Les deux doivent
 * designer le MEME club : sinon `tsc` controlerait le profil d'un club pendant
 * que `vite` fabriquerait celui d'un autre, et l'ecart ne se verrait qu'a
 * l'execution. On ne leur interdit donc pas le nom : on verifie qu'ils le
 * disent une fois, au bon endroit, et qu'ils s'accordent.
 */
const DECLARANTS = ['package.json', 'tsconfig.json']

const paquet = JSON.parse(readFileSync('package.json', 'utf8'))
const tsconfig = readFileSync('tsconfig.json', 'utf8')
const viseParTsconfig = /"@club\/\*"\s*:\s*\[\s*"\.\/clubs\/([^/"]+)\/\*"\s*\]/.exec(tsconfig)

verifier(
  'package.json declare un club par defaut qui existe',
  typeof paquet.clubParDefaut === 'string' &&
    readdirSync('clubs').includes(paquet.clubParDefaut),
  `(${paquet.clubParDefaut})`,
)
verifier(
  'tsconfig fait pointer « @club » sur ce meme club',
  viseParTsconfig?.[1] === paquet.clubParDefaut,
  `(${viseParTsconfig?.[1]} au lieu de ${paquet.clubParDefaut})`,
)
// Une fois la declaration retiree, plus rien ne doit nommer de club : c'est ce
// qui distingue « designer le club par defaut » de « l'avoir ecrit en dur ».
for (const chemin of DECLARANTS) {
  const reste = readFileSync(chemin, 'utf8').split(paquet.clubParDefaut).join('')
  verifier(
    `${chemin} ne nomme le club qu'une fois`,
    !NOMS.some((n) => reste.toLowerCase().includes(n.toLowerCase())),
  )
}

/** Les fichiers a inspecter : le code, les outils, l'assemblage, les tests. */
function fichiers(depart) {
  if (statSync(depart).isFile()) return [depart]
  return readdirSync(depart).flatMap((n) => fichiers(join(depart, n)))
}

const inspectes = [
  ...fichiers('src'),
  ...fichiers('outils'),
  ...fichiers('tests'),
  ...fichiers('.github'),
  'index.html',
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
].map((c) => c.split('\\').join('/'))

const fautifs = []
for (const chemin of inspectes) {
  // Ce test-ci cite forcement les noms qu'il traque, et les declarants ont
  // deja ete controles plus haut, un a un.
  if (chemin.endsWith('tests/club.test.mjs')) continue
  if (DECLARANTS.includes(chemin)) continue
  const contenu = readFileSync(chemin, 'utf8')
  const trouves = NOMS.filter((n) => contenu.toLowerCase().includes(n.toLowerCase()))
  if (trouves.length === 0) continue
  if (chemin in RESTES) continue
  fautifs.push(`${chemin} (${trouves.join(', ')})`)
}

verifier(
  'aucun fichier ne nomme le club hors de son profil',
  fautifs.length === 0,
  '\n        ' + fautifs.join('\n        '),
)

// Un reste repare doit sortir de la liste, sinon elle se remplit de mensonges
// et cesse de dire ou en est le travail.
const perimes = Object.keys(RESTES).filter((chemin) => {
  const contenu = readFileSync(chemin, 'utf8').toLowerCase()
  return !NOMS.some((n) => contenu.includes(n.toLowerCase()))
})
verifier(
  'la liste des restes connus ne garde rien de deja repare',
  perimes.length === 0,
  perimes.join(', '),
)

console.log('')
console.log('4. Le dossier du club porte ce qu il faut')
for (const attendu of ['profil.json', 'Ecusson.tsx', 'fiches.ts']) {
  verifier(`${DOSSIER_CLUB}/${attendu} existe`, readdirSync(DOSSIER_CLUB).includes(attendu))
}

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
