/**
 * Tests du titre par defaut d'une seance : sa date.
 *
 * Quatre pieges que ces tests gardent.
 *
 * 1. Le titre automatique SUIT la date. Deplacer une seance du mardi au
 *    vendredi sans renommer laisserait une feuille imprimee qui ment.
 *
 * 2. Un titre ECRIT A LA MAIN ne bouge jamais. C'est la seule chose qui rend
 *    l'automatisme acceptable : « Reprise apres les vacances » doit survivre a
 *    tous les deplacements de date.
 *
 * 3. Le titre donne explicitement l'emporte sur la date — l'import s'en sert
 *    pour nommer ce qu'il fabrique.
 *
 * 4. Une seance dupliquee est prevue pour un AUTRE jour : elle ne peut pas
 *    garder le nom du jour d'origine.
 *
 * Lancement : npm test
 */

import {
  dateEnToutesLettres,
  dupliquerSeance,
  nouvelleSeance,
  redater,
  titreAutomatique,
  titreParDefaut,
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

const MARDI = '2026-09-01'
const VENDREDI = '2026-09-04'
const U13G = 'Moins de 13 garçons'

console.log('')
console.log('1. La date en toutes lettres, avec une majuscule')
verifier('un mardi de septembre', titreParDefaut(MARDI) === 'Mardi 1 septembre 2026')
verifier('les accents sont la', titreParDefaut('2026-08-25') === 'Mardi 25 août 2026')
verifier('la version en minuscules reste disponible',
  dateEnToutesLettres(MARDI) === 'mardi 1 septembre 2026')
verifier('une date illisible ne fabrique pas un titre absurde', titreParDefaut('') === '')

console.log('')
console.log('2. Une seance neuve porte sa date')
const seance = nouvelleSeance(undefined, { equipe: U13G, categorieAge: '-13 ans' })
verifier('le titre est la date de la seance', seance.titre === titreParDefaut(seance.date))
verifier('et il est reconnu comme automatique', titreAutomatique(seance) === true)
verifier(
  'un titre donne l emporte',
  nouvelleSeance('Import — Montée de balle').titre === 'Import — Montée de balle',
)

console.log('')
console.log('3. Le titre automatique suit la date')
const auMardi = { ...seance, date: MARDI, titre: titreParDefaut(MARDI) }
const auVendredi = redater(auMardi, VENDREDI)
verifier('la date change', auVendredi.date === VENDREDI)
verifier('le titre suit', auVendredi.titre === 'Vendredi 4 septembre 2026')
verifier('et reste automatique', titreAutomatique(auVendredi) === true)

// Le piege principal : ne jamais effacer les mots de l'entraineur.
const nomme = { ...auMardi, titre: 'Reprise après les vacances' }
verifier('un titre ecrit a la main n est pas automatique', titreAutomatique(nomme) === false)
verifier(
  'et il survit au deplacement',
  redater(nomme, VENDREDI).titre === 'Reprise après les vacances',
)
verifier('la date, elle, a bien change', redater(nomme, VENDREDI).date === VENDREDI)
// Un titre vide n'est pas un titre automatique : rien a reecrire.
verifier(
  'un titre efface reste efface',
  redater({ ...auMardi, titre: '' }, VENDREDI).titre === '',
)

console.log('')
console.log('4. La copie est prevue pour un autre jour')
const copie = dupliquerSeance(auMardi, { titre: titreParDefaut(VENDREDI), date: VENDREDI })
verifier('la copie porte sa propre date', copie.titre === 'Vendredi 4 septembre 2026')
verifier('et elle reste automatique', titreAutomatique(copie) === true)
const copieNommee = dupliquerSeance(nomme, { date: VENDREDI })
verifier(
  'une seance nommee garde son nom, suivi de « (copie) »',
  copieNommee.titre === 'Reprise après les vacances (copie)',
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
