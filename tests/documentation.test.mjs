/**
 * La documentation suit-elle l'application ?
 *
 * Un entraineur a signale que PRESENTATION.html ne montrait aucune des
 * fonctions ajoutees depuis des mois. Trois causes, toutes silencieuses :
 *
 * 1. Le cache des captures etait indexe sur la seule empreinte du livrable.
 *    Enrichir la seance de demonstration dans outils/captures.mjs ne
 *    rafraichissait donc rien, et les images restaient celles d'avant.
 *
 * 2. La liste des captures demandees par la notice etait ecrite a la main.
 *    Poser une marque « notice:capture » dans LISEZMOI.md sans completer cette
 *    liste ne produisait aucune image — et l'emplacement sortait vide, sans le
 *    moindre avertissement.
 *
 * 3. Une capture sans legende passait aussi, muette.
 *
 * Ces tests ne verifient pas que la documentation est BONNE — cela ne se
 * mesure pas. Ils verifient qu'elle ne peut plus se desynchroniser en silence.
 *
 * Lancement : npm test
 */

import { readFileSync } from 'node:fs'
import { CATALOGUE } from '../.build-tests/domaine.mjs'

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

const lire = (chemin) => readFileSync(chemin, 'utf8')
const lisezmoi = lire('LISEZMOI.md')
const captures = lire('outils/captures.mjs')
const notice = lire('outils/notice.mjs')
const presentation = lire('outils/presentation.mjs')

/** Les noms de scenario declares dans outils/captures.mjs. */
const scenarios = [...captures.matchAll(/^\s{4}nom: '([a-z-]+)',$/gm)].map((m) => m[1])

console.log('')
console.log('1. Toute capture demandee existe')
// Ancre en debut de ligne : LISEZMOI.md cite la syntaxe du marqueur dans sa
// section technique, et une reconnaissance laxiste y verrait une capture
// nommee « nom ».
const parLaNotice = [...lisezmoi.matchAll(/^<!-- notice:capture ([a-z-]+) -->$/gm)].map((m) => m[1])
const parLaPresentation = [...presentation.matchAll(/capture: '([a-z-]+)'/g)].map((m) => m[1])

verifier('des scenarios sont declares', scenarios.length >= 8, `(${scenarios.length})`)
const inconnuesNotice = parLaNotice.filter((n) => !scenarios.includes(n))
verifier(
  'la notice ne reclame que des captures qui existent',
  inconnuesNotice.length === 0,
  inconnuesNotice.join(', '),
)
const inconnuesPresentation = parLaPresentation.filter((n) => !scenarios.includes(n))
verifier(
  'la presentation ne reclame que des captures qui existent',
  inconnuesPresentation.length === 0,
  inconnuesPresentation.join(', '),
)

console.log('')
console.log('2. Toute capture demandee par la notice a une legende')
const legendes = notice.slice(notice.indexOf('const LEGENDES'), notice.indexOf('/** Remplit'))
const sansLegende = parLaNotice.filter(
  (n) => !legendes.includes(`${n}:`) && !legendes.includes(`'${n}':`),
)
verifier(
  'aucune capture muette dans la notice',
  sansLegende.length === 0,
  sansLegende.join(', '),
)

console.log('')
console.log('3. La notice deduit sa liste du document')
// Une liste ecrite a la main se desynchronise : c'est ce qui est arrive.
verifier(
  'la notice lit les marques de LISEZMOI.md plutot qu une liste figee',
  /matchAll\(\/\^<!-- notice:capture/.test(notice),
  '(la liste des captures semble a nouveau ecrite en dur)',
)

console.log('')
console.log('4. Le cache des captures suit le fichier des scenarios')
verifier(
  'l empreinte couvre outils/captures.mjs lui-meme',
  /import\.meta\.url/.test(captures.slice(captures.indexOf('const empreinteActuelle'), captures.indexOf('const empreinteActuelle') + 200)),
  '(modifier un scenario ne rafraichirait pas les captures)',
)

console.log('')
console.log('5. L etat de demonstration ne declenche aucune alerte')
// Une alerte legitime dans l'application devient un defaut dans la
// documentation : elle barre le haut de chaque capture, et le produit y a
// l'air en panne. Le rappel de sauvegarde s'est invite ainsi dans les huit
// images sans qu'aucun test ne bronche.
verifier(
  'la seance de demonstration est marquee comme sauvegardee',
  captures.includes('derniere-sauvegarde'),
  '(sinon le bandeau jaune de rappel barre toutes les captures)',
)
verifier(
  'et son equipe est renseignee',
  captures.includes('mon-equipe'),
  '(sinon l en-tete affiche le bouton « Mon equipe » a renseigner)',
)

console.log('')
console.log('6. Le nom du livrable a une source unique')
// Le livrable a change de nom : « index.html » ne designe rien pour un
// entraineur qui range l'application sur une cle. Le nom vit desormais dans
// outils/livrable.mjs, et un outil qui le reecrirait en dur se remettrait a
// chercher un fichier qui n'existe plus — sans que rien ne le signale avant
// l'echec, loin de la cause.
const OUTILS_ET_TESTS = [
  'outils/captures.mjs',
  'tests/fumee.test.mjs',
  'tests/interface.test.mjs',
  'tests/materielInterface.test.mjs',
  'tests/masqueesInterface.test.mjs',
  'tests/seanceInterface.test.mjs',
  'tests/sauvegardeInterface.test.mjs',
]
for (const chemin of OUTILS_ET_TESTS) {
  const source = lire(chemin)
  verifier(
    `${chemin} passe par la source unique`,
    !/['\`]dist\/index\.html['\`]|'dist', 'index\.html'/.test(source),
    '(le nom du livrable y est ecrit en dur)',
  )
}
verifier(
  'la fabrication renomme le livrable',
  JSON.parse(lire('package.json')).scripts.build.includes('renommerLivrable'),
  '(vite ecrirait index.html et plus rien ne le trouverait)',
)

console.log('')
console.log('7. Le nombre de fiches annonce est le vrai')
// La presentation promettait 53 exercices quand l'application en affichait 62.
// Elle comptait les titres de trois fichiers de bibliotheque nommes a la main,
// et deux bibliotheques ajoutees depuis n'y figuraient pas : un calcul qui se
// croyait deduit, mais deduit du mauvais endroit.
//
// Personne ne recompte une bibliotheque a la main pour verifier une plaquette.
// Le chiffre etait donc faux depuis des mois, sur le document meme qu'on envoie
// aux entraineurs pour leur donner envie.
verifier(
  'la presentation compte sur le CATALOGUE',
  /CATALOGUE\.length/.test(presentation),
  '(un comptage par nom de fichier oublie la prochaine bibliotheque ajoutee)',
)
for (const [nom, source] of [
  ['LISEZMOI.md', lisezmoi],
  ['README.md', lire('README.md')],
]) {
  // Tout nombre suivi de « fiches livrees » ou « exercices » se lit comme une
  // promesse faite a l'entraineur : elle doit valoir le catalogue.
  const annonces = [...source.matchAll(/(\d+)\s+(?:fiches livrées|exercices sont livrés)/g)].map(
    (m) => Number(m[1]),
  )
  const faux = annonces.filter((n) => n !== CATALOGUE.length)
  verifier(
    `${nom} annonce ${CATALOGUE.length} fiches partout`,
    faux.length === 0,
    `(${[...new Set(faux)].join(', ')} au lieu de ${CATALOGUE.length})`,
  )
}

console.log('')
console.log('8. Les fonctions livrees sont documentees')
// Chaque version a ajoute quelque chose : la reference du projet doit en
// parler, sans quoi personne ne saura que cela existe.
const SECTIONS_ATTENDUES = [
  'Mon équipe',
  'Le planning du club',
  'Le retour à chaud',
  'Le matériel à emporter',
  'Espace de la séance',
  'Importer sans faire de doublons',
  'Chaque bouton s’explique',
  'Dicter plutôt qu’écrire',
  'Mettre son travail à l’abri',
]
for (const titre of SECTIONS_ATTENDUES) {
  const cherche = titre.replace('’', "'")
  const present = lisezmoi.includes(`## ${titre}`) || lisezmoi.includes(`## ${cherche}`)
  verifier(`LISEZMOI.md documente « ${titre} »`, present)
}

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
