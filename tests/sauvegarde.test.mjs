/**
 * Tests du filet de sauvegarde.
 *
 * Le travail de l'entraineur vit dans le stockage de son navigateur. Rien ne
 * lui disait jamais d'en faire une copie ; un nettoyage des donnees de
 * navigation effacait une saison sans un mot. Le rappel comble ce trou.
 *
 * Un rappel n'a qu'une seule facon d'echouer, et elle est silencieuse : etre
 * ignore. Ces tests gardent donc surtout ce qui le rendrait ignorable.
 *
 * 1. Il se tait quand il n'y a rien a perdre. Un bandeau qui s'affiche alors
 *    que tout est deja dans un fichier apprend a ne plus le lire.
 *
 * 2. Il laisse passer les premieres seances. Reclamer une sauvegarde le
 *    premier soir, avant que l'entraineur ait confie quoi que ce soit a
 *    l'application, c'est se faire fermer.
 *
 * 3. Il compte le travail EN JEU, pas le travail total. Ce qui est deja dans
 *    un fichier n'est pas menace, et l'annoncer comme tel serait faux.
 *
 * 4. Une preference abimee rappelle plutot que de se taire. Se taire par
 *    erreur coute une saison ; rappeler pour rien coute un clic.
 *
 * Lancement : npm test
 */

import {
  DELAI_RAPPEL_JOURS,
  JAMAIS_SAUVEGARDE,
  SEANCES_AVANT_PREMIER_RAPPEL,
  evaluerSauvegarde,
  libelleRappel,
  lireDerniereSauvegarde,
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

/** Une seance reduite a ce que le rappel regarde : sa date de modification. */
const seance = (modifieLe) => ({ id: modifieLe, modifieLe })

const JOUR = 86_400_000
const decaler = (depuis, jours) => new Date(Date.parse(depuis) + jours * JOUR).toISOString()

const LE_1ER = '2026-01-01T18:00:00.000Z'
const TROIS = [seance('2026-01-01T19:00:00.000Z'), seance('2026-01-02T19:00:00.000Z'), seance('2026-01-03T19:00:00.000Z')]

console.log('')
console.log('1. Relecture de ce qui vient du stockage')
verifier('un repere valide est relu', lireDerniereSauvegarde({ faiteLe: LE_1ER }).faiteLe === LE_1ER)
verifier('null vaut jamais sauvegarde', lireDerniereSauvegarde(null).faiteLe === '')
verifier('une liste n est pas un repere', lireDerniereSauvegarde(['a']).faiteLe === '')
verifier('un champ non textuel est refuse', lireDerniereSauvegarde({ faiteLe: 42 }).faiteLe === '')
verifier(
  'une date illisible est refusee',
  lireDerniereSauvegarde({ faiteLe: 'mardi soir' }).faiteLe === '',
)
verifier(
  'un repere abime rappelle plutot que de se taire',
  evaluerSauvegarde(lireDerniereSauvegarde({ faiteLe: 'mardi soir' }), TROIS, LE_1ER).besoin === true,
)

console.log('')
console.log('2. Le silence quand il n y a rien a perdre')
verifier(
  'aucune seance, aucun rappel',
  evaluerSauvegarde(JAMAIS_SAUVEGARDE, [], LE_1ER).besoin === false,
)
verifier(
  'tout est deja dans un fichier : silence',
  evaluerSauvegarde(
    { faiteLe: '2026-01-04T00:00:00.000Z' },
    TROIS,
    decaler('2026-01-04T00:00:00.000Z', 90),
  ).besoin === false,
  '(90 jours plus tard, mais rien n a bouge)',
)
verifier(
  'une sauvegarde recente et du travail depuis : silence',
  evaluerSauvegarde({ faiteLe: LE_1ER }, TROIS, decaler(LE_1ER, 2)).besoin === false,
)

console.log('')
console.log('3. Les premieres seances passent sans rappel')
for (let nombre = 0; nombre < SEANCES_AVANT_PREMIER_RAPPEL; nombre++) {
  verifier(
    `${nombre} seance${nombre > 1 ? 's' : ''} et jamais sauvegarde : silence`,
    evaluerSauvegarde(JAMAIS_SAUVEGARDE, TROIS.slice(0, nombre), LE_1ER).besoin === false,
  )
}
const premier = evaluerSauvegarde(JAMAIS_SAUVEGARDE, TROIS, LE_1ER)
verifier(`a ${SEANCES_AVANT_PREMIER_RAPPEL} seances, le rappel arrive`, premier.besoin === true)
verifier('et son motif est « jamais »', premier.motif === 'jamais')
verifier('les trois seances sont en jeu', premier.seancesEnJeu === 3)

console.log('')
console.log('4. L age de la sauvegarde')
const veille = decaler(LE_1ER, DELAI_RAPPEL_JOURS - 1)
const jourDit = decaler(LE_1ER, DELAI_RAPPEL_JOURS)
const apres = [seance(decaler(LE_1ER, 1))]
verifier(
  'la veille du delai, rien',
  evaluerSauvegarde({ faiteLe: LE_1ER }, apres, veille).besoin === false,
)
const vieille = evaluerSauvegarde({ faiteLe: LE_1ER }, apres, jourDit)
verifier('au jour dit, le rappel arrive', vieille.besoin === true)
verifier('et son motif est « ancienne »', vieille.motif === 'ancienne')
verifier('il compte les jours', vieille.jours === DELAI_RAPPEL_JOURS)
verifier(
  'le seuil des trois seances ne s applique qu au premier rappel',
  evaluerSauvegarde({ faiteLe: LE_1ER }, apres, jourDit).seancesEnJeu === 1,
  '(une seule seance modifiee suffit quand un fichier existe deja mais date)',
)

console.log('')
console.log('5. On ne compte que ce qui est vraiment menace')
const melange = [
  seance('2025-12-30T19:00:00.000Z'),
  seance('2025-12-31T19:00:00.000Z'),
  seance(decaler(LE_1ER, 1)),
  seance(decaler(LE_1ER, 2)),
]
const partiel = evaluerSauvegarde({ faiteLe: LE_1ER }, melange, decaler(LE_1ER, 30))
verifier('les seances anterieures a la sauvegarde ne comptent pas', partiel.seancesEnJeu === 2)
verifier(
  'une seance modifiee a la seconde pres apres la sauvegarde compte',
  evaluerSauvegarde(
    { faiteLe: LE_1ER },
    [seance('2026-01-01T18:00:01.000Z')],
    decaler(LE_1ER, 30),
  ).seancesEnJeu === 1,
)
verifier(
  'une seance modifiee juste avant ne compte pas',
  evaluerSauvegarde(
    { faiteLe: LE_1ER },
    [seance('2026-01-01T17:59:59.000Z')],
    decaler(LE_1ER, 30),
  ).besoin === false,
)

console.log('')
console.log('6. Ce que le bandeau raconte')
verifier('sans rappel, aucun texte', libelleRappel({ besoin: false }) === '')
const texteJamais = libelleRappel(premier)
verifier('le texte « jamais » nomme le nombre de seances', texteJamais.includes('3 séances'))
verifier('il dit ou vit le travail', texteJamais.includes('navigateur'))
const texteVieux = libelleRappel(vieille)
verifier('le texte « ancienne » donne l age', texteVieux.includes(`${DELAI_RAPPEL_JOURS} jours`))
verifier('il accorde le singulier', texteVieux.includes('1 séance '))
verifier(
  'aucun reproche adresse a l entraineur',
  !/oubli|auriez|deviez|negligen/i.test(texteJamais + texteVieux),
)
verifier(
  'les textes sont accentues',
  /[éèêàùôç]/.test(texteJamais) && /[éèêàùôç]/.test(texteVieux),
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
