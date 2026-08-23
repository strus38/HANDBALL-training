/**
 * Tests des favoris.
 *
 * Deux pieges que ces tests gardent.
 *
 * 1. Un favori n'est pas une note. La note juge APRES usage, le favori marque
 *    AVANT. Confondre les deux reviendrait a deduire les favoris des notes, et
 *    l'entraineur ne pourrait plus mettre de cote une fiche jamais menee.
 *
 * 2. Restaurer une sauvegarde AJOUTE son contenu et renouvelle pour cela les
 *    identifiants des fiches personnelles. Sans retracage, tous les favoris
 *    poses sur des fiches personnelles designeraient des identifiants morts :
 *    l'entraineur retrouverait ses seances et perdrait la moitie de ses
 *    etoiles, sans qu'on lui dise rien.
 *
 * Lancement : npm test
 */

import {
  basculerFavori,
  estFavori,
  fusionnerFavoris,
  lireFavoris,
  retracerFavoris,
  MAX_FAVORIS,
  exporterSauvegarde,
  importerFichier,
  nouvelExercice,
  nouvelleSeance,
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
console.log('1. Poser et retirer une etoile')
verifier('une cle absente est ajoutee', basculerFavori([], 'croise-arriere')[0] === 'croise-arriere')
verifier(
  'une cle presente est retiree',
  basculerFavori(['a', 'croise-arriere', 'b'], 'croise-arriere').join() === 'a,b',
)
verifier('la liste d origine n est pas modifiee', (() => {
  const depart = ['a']
  basculerFavori(depart, 'b')
  return depart.length === 1
})())
verifier('une cle vide ne cree rien', basculerFavori([], '').length === 0)
verifier('estFavori repond juste', estFavori(['a'], 'a') === true && estFavori(['a'], 'b') === false)

console.log('')
console.log('2. Relecture de ce qui vient du dehors')
verifier('une valeur qui n est pas une liste donne une liste vide', lireFavoris('nawak').length === 0)
verifier('les valeurs qui ne sont pas du texte sont ecartees', lireFavoris(['a', 3, null, {}, 'b']).join() === 'a,b')
verifier('les doublons sont retires', lireFavoris(['a', 'a', 'b']).join() === 'a,b')
verifier('les espaces sont retires', lireFavoris(['  a  ']).join() === 'a')
verifier('les chaines vides sont ecartees', lireFavoris(['', '   ']).length === 0)
verifier(
  'la liste est plafonnee',
  lireFavoris(Array.from({ length: MAX_FAVORIS + 50 }, (_, i) => 'f' + i)).length === MAX_FAVORIS,
  "(un fichier abime ne doit pas pouvoir remplir le stockage)",
)

console.log('')
console.log('3. Fusion')
verifier('la fusion ne cree pas de doublon', fusionnerFavoris(['a', 'b'], ['b', 'c']).join() === 'a,b,c')
verifier(
  'les etoiles deja posees sur cette machine survivent',
  fusionnerFavoris(['deja-la'], ['venu-du-fichier']).includes('deja-la'),
  '(restaurer ajoute, restaurer ne retire jamais)',
)

console.log('')
console.log('4. Retracage apres restauration')
const correspondances = new Map([['ancien-id', 'nouvel-id']])
verifier(
  'un favori sur une fiche personnelle suit son nouvel identifiant',
  retracerFavoris(['ancien-id'], correspondances).join() === 'nouvel-id',
)
verifier(
  'un favori sur une fiche fournie traverse intact',
  retracerFavoris(['croise-arriere'], correspondances).join() === 'croise-arriere',
  "(la reference des fiches fournies n'est jamais renouvelee)",
)

console.log('')
console.log('5. Aller-retour par le fichier de sauvegarde')
const modele = nouvelExercice()
modele.titre = 'Ma gamme a moi'
const seance = nouvelleSeance('Seance temoin')
const fichier = exporterSauvegarde([seance], [modele], [modele.id, 'croise-arriere'])
const relu = importerFichier(fichier)

verifier('la sauvegarde emporte bien les favoris', relu.favoris.length === 2, JSON.stringify(relu.favoris))
verifier(
  'le favori sur la fiche fournie est intact',
  relu.favoris.includes('croise-arriere'),
)
verifier(
  'le favori sur la fiche personnelle pointe la fiche restauree',
  relu.favoris.includes(relu.modeles[0].id),
  `(attendu ${relu.modeles[0].id}, recu ${JSON.stringify(relu.favoris)})`,
)
verifier(
  'il ne pointe plus l ancien identifiant',
  !relu.favoris.includes(modele.id) || relu.modeles[0].id === modele.id,
  "(l'import renouvelle les identifiants : le favori doit suivre)",
)

// Une sauvegarde ecrite par une version anterieure n'a pas ce champ. Elle doit
// se restaurer sans casser, avec zero favori plutot qu'une erreur.
const ancienne = JSON.parse(exporterSauvegarde([seance], [modele]))
delete ancienne.contenu.favoris
verifier(
  'une sauvegarde d une version anterieure se restaure quand meme',
  importerFichier(JSON.stringify(ancienne)).favoris.length === 0,
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
