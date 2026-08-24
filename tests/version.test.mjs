/**
 * Tests de la version affichée.
 *
 * Ce que ces tests gardent : l'application est livrée en UN FICHIER, copié sur
 * des clés et gardé des mois. Plusieurs versions cohabitent donc sur autant de
 * postes. Le numéro affiché est le seul moyen de savoir lequel corriger quand
 * un entraîneur signale un défaut.
 *
 * Le piège principal : hors build, aucune valeur n'est injectée. L'application
 * doit alors le DIRE, et surtout ne pas afficher un numéro inventé — un faux
 * « v0.0.0 » enverrait chercher un défaut là où il n'est pas.
 *
 * Lancement : npm test
 */

import {
  VERSION,
  DATE_BUILD,
  REVISION,
  EN_DEVELOPPEMENT,
  versionCourte,
  versionComplete,
  exporterSeance,
  exporterExercice,
  exporterSauvegarde,
  nouvelleSeance,
  nouvelExercice,
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
console.log('1. Hors build, rien n est invente')
// Les tests tournent sur le bundle esbuild : aucune valeur n'y est injectee.
verifier('la date de build est vide', DATE_BUILD === '', JSON.stringify(DATE_BUILD))
verifier('le mode developpement est detecte', EN_DEVELOPPEMENT === true)
verifier(
  'la version courte ne ment pas',
  versionCourte() === 'version de travail',
  "(afficher « v0.0.0 » ferait chercher un defaut la ou il n'est pas)",
)
verifier('la version complete le dit aussi', /travail/.test(versionComplete()), versionComplete())

console.log('')
console.log('2. Les valeurs sont des chaines, toujours')
// Un `define` absent ne doit jamais produire `undefined` dans l'interface.
verifier('VERSION est une chaine', typeof VERSION === 'string' && VERSION.length > 0)
verifier('DATE_BUILD est une chaine', typeof DATE_BUILD === 'string')
verifier('REVISION est une chaine', typeof REVISION === 'string')

console.log('')
console.log('3. La version part dans les fichiers exportes')
// Une seance envoyee a quelqu un porte la trace de la version qui l a produite :
// c est ce qui explique la plupart des differences d affichage d un poste a
// l autre, et cela ne se retrouve pas autrement.
const seance = nouvelleSeance('Seance temoin')
const exercice = nouvelExercice('Exercice temoin')
for (const [nom, contenu] of [
  ['une seance', exporterSeance(seance)],
  ['un exercice', exporterExercice(exercice)],
  ['une sauvegarde', exporterSauvegarde([seance], [exercice])],
]) {
  const relu = JSON.parse(contenu)
  verifier(
    `${nom} porte la version de l application`,
    typeof relu.application === 'string' && relu.application.length > 0,
    JSON.stringify(relu.application),
  )
}

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
