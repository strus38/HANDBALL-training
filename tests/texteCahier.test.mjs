/**
 * Les regles de texte de l'importation de cahiers.
 *
 * Quatre regles, et chacune s'est deja trompee une fois — c'est pour cela
 * qu'elles sont ici plutot que noyees dans l'outil.
 *
 * 1. La PUCE du cahier sert a decouper, elle ne se recopie pas. Le texte d'une
 *    fiche ne porte aucune decoration, comme les 62 fiches livrees : c'est
 *    l'application qui pose la puce a l'affichage. La recopier en faisait
 *    apparaitre DEUX dans l'apercu de la bibliotheque.
 *
 * 2. La LIGATURE « ﬁ » est encodee suivie d'une espace : le PDF contient
 *    reellement « enfi n » et « fi xer ». Proteger « défi » pour sauver le nom
 *    laissait passer « défi nir » et « défi cile », bien plus frequents.
 *
 * 3. Le TRAIT D'UNION de fin de ligne se recolle sans espace, sinon les titres
 *    sortent en « Interne- Externe ».
 *
 * 4. Une ligne de materiel qui commence par un mot grammatical CONTINUE la
 *    precedente : « 1 réserve de ballon près » + « du Demi-Centre passeur »
 *    font un article, « 8 plots » + « réserve de ballons » en font deux.
 *
 * Lancement : npm test
 */

import {
  accoler,
  recoller,
  reparerLigatures,
  SUITE_DE_LIGNE,
} from '../outils/texteCahier.mjs'

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
console.log('1. La puce decoupe, elle ne se recopie pas')
const points = recoller([
  { texte: '• Changer de côté : à gauche, à droite' },
  { texte: '• Varier les types de passes : directes,' },
  { texte: 'à rebond, à une main' },
])
verifier('deux puces donnent deux elements', points.split('\n').length === 2, JSON.stringify(points))
verifier('aucune puce ne survit dans le texte', !points.includes('•'), points)
verifier(
  'la ligne sans puce continue la precedente',
  points.split('\n')[1] === 'Varier les types de passes : directes, à rebond, à une main',
  JSON.stringify(points.split('\n')[1]),
)
verifier(
  'un paragraphe sans puce reste d un seul tenant',
  recoller([{ texte: 'On positionne :' }, { texte: '1 joueur à chaque poste' }]) ===
    'On positionne : 1 joueur à chaque poste',
)
verifier('les tirets valent aussi comme puces', recoller([{ texte: '- Un point' }]) === 'Un point')
verifier('les lignes vides sont ecartees', recoller([{ texte: '  ' }, { texte: 'A' }]) === 'A')
verifier('une chaine nue est acceptee', recoller(['• Un point']) === 'Un point')

console.log('')
console.log('2. La ligature du cahier se recolle')
verifier('« enfi n » devient « enfin »', reparerLigatures('Et enfi n, il tire') === 'Et enfin, il tire')
verifier('« fi xer » devient « fixer »', reparerLigatures('va fi xer entre les 2') === 'va fixer entre les 2')
verifier(
  '« profi tant » devient « profitant »',
  reparerLigatures('en profi tant du travail') === 'en profitant du travail',
)
verifier(
  '« défi nir » devient « définir » — le piege',
  reparerLigatures('pour défi nir la zone') === 'pour définir la zone',
  reparerLigatures('pour défi nir la zone'),
)
verifier(
  'un texte sain n est pas abime',
  reparerLigatures('la finition est fine') === 'la finition est fine',
)
verifier(
  'une majuscule apres la coupure n est pas recollee',
  reparerLigatures('un off Ensuite') === 'un off Ensuite',
)

console.log('')
console.log('3. Le trait d union de fin de ligne')
verifier('« Interne- » + « Externe »', accoler('Interne-', 'Externe') === 'Interne-Externe')
verifier('deux mots ordinaires prennent une espace', accoler('Le tir', 'de l’Ailier') === 'Le tir de l’Ailier')
verifier('le premier fragment part seul', accoler('', 'Premier') === 'Premier')

console.log('')
console.log('4. Ce qui continue une ligne de materiel')
verifier('« du Demi-Centre passeur » continue', SUITE_DE_LIGNE.test('du Demi-Centre passeur'))
verifier('« réserve de ballons » ouvre un article', !SUITE_DE_LIGNE.test('réserve de ballons'))
verifier('« 1 plot » ouvre un article', !SUITE_DE_LIGNE.test('1 plot'))
verifier('« pour 4 joueurs » continue', SUITE_DE_LIGNE.test('pour 4 joueurs'))
// Sans la frontiere de mot, « demi-terrain » et « description » seraient pris
// pour des suites de ligne : « de » et « des » sont leurs premieres lettres.
verifier('« demi-terrain » ouvre un article', !SUITE_DE_LIGNE.test('demi-terrain'))
verifier('« description » ouvre un article', !SUITE_DE_LIGNE.test('description'))

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
