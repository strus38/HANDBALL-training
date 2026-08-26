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
import { CATALOGUE, FONDS_COMMUN, FICHES_CLUB, EQUIPES_CLUB, PLANNING } from '../.build-tests/domaine.mjs'
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

/**
 * Ce qui nomme un club — et ce sont TOUS les clubs qu'on traque, pas seulement
 * celui qu'on fabrique.
 *
 * La difference n'est pas theorique : une clef de stockage ecrite « hbpsm: »
 * en dur reste dans le livrable de n'importe quel club. En ne cherchant que le
 * nom du club fabrique, le test l'aurait declaree propre des qu'on fabriquait
 * ailleurs — c'est-a-dire exactement quand la fuite compte.
 *
 * Le nom est cherche comme un MOT : « essais » ne compte pas pour « essai ».
 * Un tiret, lui, ne coupe pas — sans quoi « HBPSM-entrainements.html » passerait
 * a travers, alors que c'est precisement ce genre de reste qu'on cherche. Cela
 * suppose qu'un identifiant de club soit un sigle et non un mot courant : un
 * club nomme « essai » ferait sonner ce test a chaque phrase qui en parle.
 */
const TOUS_LES_CLUBS = readdirSync('clubs').map((id) =>
  JSON.parse(readFileSync(`clubs/${id}/profil.json`, 'utf8')),
)
const NOMS = [
  ...new Set(TOUS_LES_CLUBS.flatMap((p) => [p.identifiant, p.nomCourt, p.nom])),
]
const nomme = (texte, nom) =>
  new RegExp(`(?<![\\w])${nom.replace(/[.*+?^$()[\]{}|]/g, '\\$&')}(?![\\w])`, 'i').test(texte)

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
    !NOMS.some((n) => nomme(reste, n)),
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
  const trouves = NOMS.filter((n) => nomme(contenu, n))
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
  const contenu = readFileSync(chemin, 'utf8')
  return !NOMS.some((n) => nomme(contenu, n))
})
verifier(
  'la liste des restes connus ne garde rien de deja repare',
  perimes.length === 0,
  perimes.join(', '),
)

console.log('')
console.log('4. Le dossier du club porte ce qu il faut')
for (const attendu of ['profil.json', 'Ecusson.tsx', 'fiches.ts', 'planning.ts']) {
  verifier(`${DOSSIER_CLUB}/${attendu} existe`, readdirSync(DOSSIER_CLUB).includes(attendu))
}

console.log('')
console.log('5. La palette se lit')

/**
 * Contraste WCAG entre deux couleurs, de 1 (identiques) a 21 (noir sur blanc).
 *
 * Un club choisit ses couleurs pour son maillot, pas pour un ecran. Le vert
 * d'un ecusson peut etre superbe et rendre illisible le texte qu'on pose
 * dessus ; personne ne s'en apercoit avant qu'un entraineur ne plisse les yeux
 * sur le banc, dans un gymnase mal eclaire. Le seuil de 4.5 est celui du texte
 * courant ; 3 suffit a un trait, qu'on distingue sans le lire.
 */
const canal = (v) => {
  const x = v / 255
  return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
}
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)
}
const contraste = (a, b) => {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (clair + 0.05) / (sombre + 0.05)
}

const ROLES = [
  'accent',
  'accent-clair',
  'accent-fonce',
  'structure-900',
  'structure-800',
  'structure-700',
  'structure-500',
  'structure-100',
  'structure-050',
]
const couleurs = PROFIL.couleurs ?? {}
for (const role of ROLES) {
  verifier(
    `« ${role} » est une couleur ecrite en toutes lettres`,
    /^#[0-9a-f]{6}$/i.test(couleurs[role] ?? ''),
    `(${couleurs[role]})`,
  )
}
verifier(
  'aucun role en trop dans la palette',
  Object.keys(couleurs).every((r) => ROLES.includes(r)),
  Object.keys(couleurs).filter((r) => !ROLES.includes(r)).join(', '),
)

const BLANC = '#ffffff'

/** Chaque regle dit QUI porte QUOI, et pourquoi le seuil est celui-la. */
const LISIBILITE = [
  // La regle ecrite en tete de la feuille de style : l'accent porte du texte
  // de structure, jamais du texte clair.
  ['accent', 'structure-900', 4.5, "l'accent porte le texte de structure"],
  ['accent-clair', 'structure-900', 4.5, "le fond d'accent doux aussi"],
  ['accent-fonce', 'structure-900', 4.5, "l'accent survole aussi"],
  // Ces trois-la servent de FOND a du texte clair : entete, boutons d'action.
  ['structure-900', BLANC, 4.5, 'la structure profonde porte du texte clair'],
  ['structure-800', BLANC, 4.5, 'la structure intermediaire aussi'],
  ['structure-700', BLANC, 4.5, 'la structure des boutons aussi'],
  // Fonds doux : c'est du texte de structure qu'on pose dessus.
  ['structure-050', 'structure-900', 4.5, 'le fond doux se laisse lire'],
  ['structure-100', 'structure-900', 4.5, 'le fond doux fonce aussi'],
  // Un trait, pas un texte : on doit le distinguer, pas le lire.
  ['structure-500', BLANC, 3, 'le trait de bordure se distingue du blanc'],
]
for (const [a, b, seuil, quoi] of LISIBILITE) {
  const x = couleurs[a]
  const y = b === BLANC ? BLANC : couleurs[b]
  const rapport = /^#[0-9a-f]{6}$/i.test(x ?? '') && /^#[0-9a-f]{6}$/i.test(y ?? '')
    ? contraste(x, y)
    : 0
  verifier(`${quoi} (${a})`, rapport >= seuil, `(contraste ${rapport.toFixed(2)} pour ${seuil})`)
}

console.log('')
console.log('6. Le planning est celui du club')
// Son contenu se verifie dans tests/planning.test.mjs, qui le croise avec la
// mecanique. Ici, on verifie seulement qu'il EXISTE et qu'il est fourni par le
// profil : un club livre avec un planning vide ne proposerait plus aucune date.
verifier('le club declare des equipes', Array.isArray(EQUIPES_CLUB) && EQUIPES_CLUB.length > 0)
verifier('et des creneaux', Array.isArray(PLANNING) && PLANNING.length > 0)
verifier(
  'le planning ne vit plus dans le domaine',
  !readFileSync('src/domain/planning.ts', 'utf8').includes('{ jour: '),
  "(un creneau ecrit en dur dans src/ rendrait le profil du club decoratif)",
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
