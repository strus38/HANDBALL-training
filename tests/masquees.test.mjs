/**
 * Tests des fiches fournies masquees.
 *
 * Le principe garde ici : retirer une fiche fournie n'est pas la supprimer.
 * Elle est masquee, retrouvable, et se retablit d'un clic — l'entraineur peut
 * tailler la bibliotheque de base sans craindre le geste. Et ce tri fait
 * partie de « Sauvegarder tout » : le fichier de sauvegarde est le seul filet
 * contre un nettoyage du navigateur, qui efface aussi les preferences.
 *
 * Lancement : npm test
 */

import {
  basculerMasquee,
  estMasquee,
  fusionnerMasquees,
  lireMasquees,
  exporterSauvegarde,
  importerFichier,
  nouvelleSeance,
  CATALOGUE,
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
console.log('1. Masquer et retablir')
const ref = CATALOGUE[0].ref
verifier('masquer ajoute la reference', basculerMasquee([], ref).join() === ref)
verifier('retablir la retire', basculerMasquee([ref], ref).length === 0)
verifier('estMasquee repond juste', estMasquee([ref], ref) === true && estMasquee([], ref) === false)
verifier('la liste d origine n est pas modifiee', (() => {
  const depart = ['a']
  basculerMasquee(depart, 'b')
  return depart.length === 1
})())

console.log('')
console.log('2. Relecture et fusion')
verifier('une valeur inattendue donne une liste vide', lireMasquees('nawak').length === 0)
verifier('les doublons sont retires', lireMasquees(['a', 'a', 'b']).join() === 'a,b')
verifier(
  'la fusion ajoute sans retablir',
  fusionnerMasquees(['retiree-ici'], ['retiree-la-bas']).join() === 'retiree-ici,retiree-la-bas',
  '(restaurer ajoute, restaurer ne retablit jamais)',
)

console.log('')
console.log('3. Aller-retour par le fichier de sauvegarde')
const seance = nouvelleSeance('Seance temoin')
const fichier = exporterSauvegarde([seance], [], [], [ref])
const relu = importerFichier(fichier)
verifier('le tri de la bibliotheque part dans la sauvegarde', relu.masquees.join() === ref,
  JSON.stringify(relu.masquees))

// Une sauvegarde ecrite par une version anterieure n'a pas ce champ. Elle doit
// se restaurer sans casser, avec une liste vide plutot qu'une erreur.
const ancienne = JSON.parse(exporterSauvegarde([seance], []))
delete ancienne.contenu.masquees
const reluAncien = importerFichier(JSON.stringify(ancienne))
verifier('une sauvegarde ancienne se restaure sans le champ', reluAncien.masquees.length === 0)

const abimee = JSON.parse(fichier)
abimee.contenu.masquees = { pas: 'une liste' }
verifier(
  'une liste abimee ne fait pas echouer la restauration',
  importerFichier(JSON.stringify(abimee)).masquees.length === 0,
)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
