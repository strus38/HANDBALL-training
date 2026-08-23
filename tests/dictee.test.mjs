/**
 * Tests de la reception d'un texte dicte.
 *
 * Le piege que ces tests gardent : deviner. Un paragraphe expedie dans
 * « Evolution » parce qu'il contenait le mot « ensuite » atterrit la ou
 * personne ne le cherche, et l'entraineur croit avoir perdu sa dictee. La
 * repartition ne doit donc se declencher que sur des intitules REELLEMENT
 * prononces, et tout envoyer dans le fonctionnement le reste du temps.
 *
 * Second piege : un intitule reconnu au milieu d'une phrase. « L'objectif est
 * atteint quand... » ne doit pas couper le texte en deux.
 *
 * Lancement : npm test
 */

import {
  repartirTexteDicte,
  champsReconnus,
  ajouterFragment,
  dicteeDisponible,
} from '../.build-tests/domaine.mjs'

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
console.log('1. Sans intitule, on ne devine pas')
const brut = repartirTexteDicte(
  "Le porteur part en un contre un vers l'exterieur pour fixer le defenseur numero 1, puis l'ailier croise dans son dos.",
)
verifier('tout part dans le fonctionnement', brut.fonctionnement?.startsWith('Le porteur part'))
verifier(
  'aucun autre champ n est touche',
  Object.keys(brut).length === 1,
  `(${Object.keys(brut).join(', ')})`,
)
verifier('un texte vide ne produit rien', Object.keys(repartirTexteDicte('   ')).length === 0)

console.log('')
console.log('2. Avec intitules, chacun sa place')
const dicte = [
  "Mise en place : deux colonnes a neuf metres, un plot par colonne.",
  'Deroulement : le demi-centre engage, passe a l arriere droit qui fixe.',
  'Points cles : la passe se donne a hauteur de hanche.',
  'Variantes : ajouter un defenseur flottant.',
].join('\n')
const r = repartirTexteDicte(dicte)
verifier('la mise en place est isolee', r.misePlace === 'deux colonnes a neuf metres, un plot par colonne.')
verifier('le deroulement va dans le fonctionnement', r.fonctionnement?.startsWith('le demi-centre engage'))
verifier('les points cles aussi', r.pointsCles === 'la passe se donne a hauteur de hanche.')
verifier('les variantes vont dans evolution', r.evolution === 'ajouter un defenseur flottant.')
verifier('les intitules eux-memes ne sont pas recopies', !JSON.stringify(r).includes('Mise en place'))
verifier(
  'les champs reconnus sont annonces avant d agir',
  champsReconnus(dicte).join() === 'misePlace,fonctionnement,pointsCles,evolution',
  champsReconnus(dicte).join(),
)

console.log('')
console.log('3. Un intitule au milieu d une phrase ne coupe rien')
const piege = repartirTexteDicte(
  "L'objectif est atteint quand la defense recule. On garde la meme organisation ensuite.",
)
verifier(
  'la phrase reste entiere dans le fonctionnement',
  piege.fonctionnement?.startsWith("L'objectif est atteint"),
  JSON.stringify(piege),
)
verifier('rien n a atterri dans objectifs', piege.objectifs === undefined)

// Le mot doit etre entier. « Reglementairement » commence bien une phrase et
// commence par « regle » : sans la garde, il declencherait la regulation.
const motTronque = repartirTexteDicte(
  'Reglementairement, on siffle le marcher a trois appuis.',
)
verifier(
  'un intitule ne se declenche pas sur un mot plus long',
  motTronque.regulation === undefined && motTronque.fonctionnement?.startsWith('Reglementairement'),
  JSON.stringify(motTronque),
)
verifier(
  'mais un intitule en debut de phrase compte bien',
  repartirTexteDicte('Regles : trois passes minimum.').regulation === 'trois passes minimum.',
  JSON.stringify(repartirTexteDicte('Regles : trois passes minimum.')),
)

console.log('')
console.log('4. Ce qui precede le premier intitule n est pas jete')
const preambule = repartirTexteDicte(
  'On travaille le croise arriere ailier. Mise en place : deux colonnes.',
)
verifier(
  'le preambule rejoint le fonctionnement',
  preambule.fonctionnement === 'On travaille le croise arriere ailier.',
  JSON.stringify(preambule),
)
verifier('et la suite est bien rangee', preambule.misePlace === 'deux colonnes.')

console.log('')
console.log('5. Un intitule prononce deux fois complete au lieu d ecraser')
const double = repartirTexteDicte(
  'Points cles : la passe a hauteur de hanche.\nPoints cles : le croise part tard.',
)
verifier(
  'les deux passages sont conserves',
  double.pointsCles?.includes('hanche') && double.pointsCles?.includes('tard'),
  JSON.stringify(double),
)
verifier('sur deux lignes', (double.pointsCles ?? '').split('\n').length === 2)

console.log('')
console.log('6. Ajout d une phrase dictee au micro')
verifier('sur un champ vide, la phrase est le texte', ajouterFragment('', 'Le pivot bloque.') === 'Le pivot bloque.')
verifier(
  'chaque phrase va sur sa ligne',
  ajouterFragment('Premier point.', 'Deuxieme point.') === 'Premier point.\nDeuxieme point.',
  "(c'est ainsi que l'application rend ces champs)",
)
verifier(
  'le texte existant n est jamais remplace',
  ajouterFragment('Un paragraphe entier.', 'x').startsWith('Un paragraphe entier.'),
  "(une phrase mal comprise ne doit pas pouvoir effacer un paragraphe)",
)
verifier('une phrase vide ne change rien', ajouterFragment('Deja la.', '   ') === 'Deja la.')
verifier(
  'les espaces en trop ne s accumulent pas',
  ajouterFragment('Deja la.  \n\n', 'Suite.') === 'Deja la.\nSuite.',
)

console.log('')
console.log('7. Pas de bouton mort')
// La branche qui compte est celle du navigateur qui NE SAIT PAS : c est elle
// qui garantit qu aucun micro ne s affiche la ou il ne servirait a rien. Un
// Chrome, lui, sait toujours transcrire - on ne peut donc pas l eprouver dans
// le test de fumee.
verifier(
  'un navigateur sans reconnaissance vocale n a pas de micro',
  dicteeDisponible({}) === false,
  '(un bouton mort a cote de chaque champ est un reproche permanent)',
)
verifier('le prefixe standard est reconnu', dicteeDisponible({ SpeechRecognition: function () {} }) === true)
verifier(
  'le prefixe webkit aussi',
  dicteeDisponible({ webkitSpeechRecognition: function () {} }) === true,
  '(Safari et les Chrome anciens ne connaissent que celui-la)',
)
verifier(
  'une propriete presente mais inutilisable ne compte pas',
  dicteeDisponible({ SpeechRecognition: undefined }) === false &&
    dicteeDisponible({ SpeechRecognition: true }) === false,
)
verifier('une portee absente ne fait pas tomber l application', dicteeDisponible(null) === false)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
