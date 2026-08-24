/**
 * Tests de « Mon equipe ».
 *
 * Quatre pieges que ces tests gardent.
 *
 * 1. La preference PRE-REMPLIT, elle ne remplace pas. Une seance garde sa
 *    propre copie de l'equipe : celle de novembre doit rester « U15 » meme si
 *    l'entraineur change d'equipe en janvier. Lire la preference a l'affichage
 *    reecrirait l'histoire de toutes les seances passees.
 *
 * 2. Une sauvegarde restauree n'ecrase jamais l'equipe en place : elle ne la
 *    fournit que si cette machine n'en a pas. Sinon, une sauvegarde rapportee
 *    d'un ancien poste renommerait l'equipe en cours.
 *
 * 3. Un fichier ecrit avant que la preference n'existe n'en contient pas : la
 *    restauration doit retomber sur « aucune equipe », pas planter.
 *
 * 4. Une seance ne signale son equipe que si elle SORT de l'ordinaire. Sans
 *    cette regle, chaque carte repeterait la meme mention.
 *
 * Lancement : npm test
 */

import {
  AUCUNE_EQUIPE,
  MAX_LONGUEUR_EQUIPE,
  equipeInhabituelle,
  equipeRenseignee,
  libelleEquipe,
  lireMonEquipe,
  nouvelleSeance,
  exporterSauvegarde,
  importerFichier,
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

const MIENNE = { equipe: 'Seniors garcons', categorieAge: '+18 ans' }

console.log('')
console.log('1. Relecture de ce qui vient du dehors')
verifier('un objet complet est relu', lireMonEquipe(MIENNE).equipe === 'Seniors garcons')
verifier('null ne casse rien', lireMonEquipe(null).equipe === '')
verifier('une liste n est pas une equipe', lireMonEquipe(['a']).categorieAge === '')
verifier('un champ non textuel est ignore', lireMonEquipe({ equipe: 42 }).equipe === '')
verifier(
  'les espaces sont retires',
  lireMonEquipe({ equipe: '  U15  ' }).equipe === 'U15',
)
verifier(
  'un champ trop long est plafonne',
  lireMonEquipe({ equipe: 'x'.repeat(500) }).equipe.length === MAX_LONGUEUR_EQUIPE,
)

console.log('')
console.log('2. Renseignee ou non')
verifier('aucune equipe au depart', equipeRenseignee(AUCUNE_EQUIPE) === false)
verifier('la categorie seule suffit', equipeRenseignee({ equipe: '', categorieAge: 'U15' }))
verifier('libelle des deux champs', libelleEquipe(MIENNE) === 'Seniors garcons · +18 ans')
verifier('libelle d un seul champ', libelleEquipe({ equipe: 'U15', categorieAge: '' }) === 'U15')
verifier('libelle vide', libelleEquipe(AUCUNE_EQUIPE) === '')

console.log('')
console.log('3. La preference pre-remplit la seance, sans la gouverner')
const neuve = nouvelleSeance('Mardi', MIENNE)
verifier('une seance neuve nait avec l equipe', neuve.equipe === 'Seniors garcons')
verifier('et avec la categorie', neuve.categorieAge === '+18 ans')
verifier('sans preference, les champs restent vides', nouvelleSeance('Mardi').equipe === '')
// Le piege principal : changer d'equipe ne doit RIEN faire aux seances ecrites.
const ancienne = nouvelleSeance('Novembre', { equipe: 'U15', categorieAge: '-15 ans' })
verifier(
  'une seance ecrite garde son equipe apres un changement',
  nouvelleSeance('Janvier', MIENNE) && ancienne.equipe === 'U15',
)

console.log('')
console.log('4. Ce qui sort de l ordinaire')
verifier('meme equipe : rien a signaler', equipeInhabituelle(neuve, MIENNE) === false)
verifier('autre equipe : signalee', equipeInhabituelle(ancienne, MIENNE) === true)
verifier(
  'une seance sans equipe ne signale rien',
  equipeInhabituelle(AUCUNE_EQUIPE, MIENNE) === false,
)
verifier(
  'sans preference, toute equipe est inhabituelle',
  equipeInhabituelle(neuve, AUCUNE_EQUIPE) === true,
)

console.log('')
console.log('5. La sauvegarde emporte la preference')
const fichier = exporterSauvegarde([neuve], [], [], [], MIENNE)
const relu = importerFichier(fichier)
verifier('l equipe traverse la sauvegarde', relu.monEquipe.equipe === 'Seniors garcons')
verifier('et la categorie aussi', relu.monEquipe.categorieAge === '+18 ans')
verifier('la seance garde la sienne', relu.seances[0].equipe === 'Seniors garcons')

// Un fichier ecrit par la version precedente : le champ n'existait pas.
const ancienFichier = JSON.parse(exporterSauvegarde([neuve], []))
delete ancienFichier.contenu.monEquipe
const reluAncien = importerFichier(JSON.stringify(ancienFichier))
verifier(
  'un fichier sans equipe se relit quand meme',
  reluAncien.monEquipe.equipe === '' && reluAncien.seances.length === 1,
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
