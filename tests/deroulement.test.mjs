/**
 * Tests du deroulement reel d'une seance (mode terrain).
 *
 * Le piege principal que ces tests gardent : l'horaire doit rester ancre sur
 * l'heure REELLE de debut. Un minuteur qui repart a zero a chaque exercice
 * afficherait toujours « 15 minutes disponibles », y compris quand la seance
 * a vingt minutes de retard et qu'il faudra sauter un atelier. Le retard doit
 * s'accumuler et se voir pendant qu'on peut encore y faire quelque chose.
 *
 * Second piege : le releve du terrain ne doit jamais ecraser le plan. Les
 * durees prevues restent les durees prevues, la mesure se pose a cote.
 *
 * Lancement : npm test
 */

import {
  planifier,
  minutesRestantes,
  derive,
  finPrevue,
  heure,
  phraseReste,
  phraseDerive,
  dureeMesuree,
  nouvelExercice,
  nouvelleSeance,
  exporterSeance,
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

const MINUTE = 60_000
/** Un instant fixe, pour que les tests ne dependent pas de l'heure qu'il est. */
const DEBUT = new Date('2026-09-15T19:00:00').getTime()
const exercice = (duree) => ({ ...nouvelExercice(), duree })

console.log('')
console.log('1. Decoupage en creneaux')
const creneaux = planifier([exercice(15), exercice(20), exercice(10)], DEBUT)
verifier('un creneau par exercice', creneaux.length === 3)
verifier('le premier commence a l heure de debut', creneaux[0].debut === DEBUT)
verifier('sa fin suit la duree prevue', creneaux[0].fin === DEBUT + 15 * MINUTE)
verifier(
  'les creneaux s enchainent sans trou',
  creneaux[1].debut === creneaux[0].fin && creneaux[2].debut === creneaux[1].fin,
)
verifier('la duree prevue est conservee telle quelle', creneaux[1].dureePrevue === 20)
verifier('une seance vide ne produit aucun creneau', planifier([], DEBUT).length === 0)
verifier(
  'une duree negative ne recule pas l horaire',
  planifier([exercice(-5), exercice(10)], DEBUT)[1].debut === DEBUT,
  "(une saisie aberrante ne doit pas faire commencer la seance avant l'heure)",
)

console.log('')
console.log('2. Temps restant sur le creneau en cours')
verifier(
  'au demarrage, il reste la duree entiere',
  minutesRestantes(creneaux[0], DEBUT) === 15,
)
verifier(
  'a mi-parcours, il reste la moitie',
  minutesRestantes(creneaux[0], DEBUT + 7 * MINUTE) === 8,
)
verifier(
  'depasser le creneau donne un reste NEGATIF',
  minutesRestantes(creneaux[0], DEBUT + 19 * MINUTE) === -4,
  "(c'est le signe qui distingue « il reste 4 min » de « 4 min de retard »)",
)
verifier('sans creneau, aucun temps restant', minutesRestantes(undefined, DEBUT) === 0)

console.log('')
console.log('3. Le retard s accumule, il ne se remet pas a zero')
// LE test qui compte. On arrive sur l'exercice 2 avec dix minutes de retard :
// son creneau ne doit pas repartir de sa duree pleine.
const enRetard = DEBUT + 25 * MINUTE
verifier(
  'un exercice aborde en retard n offre pas sa duree pleine',
  minutesRestantes(creneaux[1], enRetard) === 10,
  `(recu ${minutesRestantes(creneaux[1], enRetard)}, un minuteur remis a zero aurait dit 20)`,
)
verifier(
  'le retard se mesure sur le debut du creneau',
  derive(creneaux[1], enRetard) === 10,
)
verifier('etre en avance donne une derive negative', derive(creneaux[1], DEBUT + 12 * MINUTE) === -3)
verifier('sans creneau, aucune derive', derive(undefined, DEBUT) === 0)

console.log('')
console.log('4. Heure de fin')
verifier(
  'la fin prevue est celle du dernier creneau',
  finPrevue(creneaux, DEBUT) === DEBUT + 45 * MINUTE,
)
verifier(
  'une seance vide finit quand elle commence',
  finPrevue([], DEBUT) === DEBUT,
  '(et non a une date absurde)',
)
verifier('l heure est ecrite sur deux chiffres', heure(DEBUT) === '19:00')
verifier('minuit ne devient pas 24:00', heure(new Date('2026-09-15T00:05:00').getTime()) === '00:05')

console.log('')
console.log('5. Phrases lues a bout de bras')
verifier('pluriel', phraseReste(12) === '12 min restantes')
verifier('singulier', phraseReste(1) === '1 min restante')
verifier("l'heure pile est dite en clair", phraseReste(0) === "c'est l'heure")
verifier(
  'le retard est ecrit en mots, pas en negatif',
  phraseReste(-4) === '4 min de retard',
  "(« -4 min » ne se lit pas en courant)",
)
verifier('un retard d une minute reste au singulier', phraseReste(-1) === '1 min de retard')
verifier('la derive dit le retard', phraseDerive(7) === '7 min de retard')
verifier("la derive dit l avance", phraseDerive(-6) === "6 min d'avance")
verifier(
  'une minute d ecart vaut « a l heure »',
  phraseDerive(1).includes('heure') && phraseDerive(-1).includes('heure'),
  "(afficher « 1 min de retard » a chaque exercice serait du bruit)",
)

console.log('')
console.log('6. Mesure du temps reellement passe')
verifier('une mesure normale est arrondie a la minute', dureeMesuree(DEBUT, DEBUT + 13.4 * MINUTE) === 13)
verifier(
  'moins d une minute ne compte pas',
  dureeMesuree(DEBUT, DEBUT + 20_000) === undefined,
  "(feuilleter une seance ne doit pas remplir les fiches de « 0 min »)",
)

console.log('')
console.log('7. Le releve survit a un aller-retour par fichier')
// Rappel du piege maison : lireExercice est une LISTE BLANCHE. Un champ absent
// de cette fonction est efface a chaque relecture, sans erreur ni message.
const seance = nouvelleSeance('Seance menee')
seance.demarreLe = '2026-09-15T19:00:00.000Z'
const mene = nouvelExercice()
mene.duree = 15
mene.deroule = { fait: true, dureeReelle: 22 }
seance.exercices = [mene]

const relu = importerFichier(exporterSeance(seance)).seance
verifier("l heure de demarrage traverse le fichier", relu.demarreLe === seance.demarreLe)
verifier('la case cochee traverse le fichier', relu.exercices[0].deroule?.fait === true)
verifier('la duree reelle traverse le fichier', relu.exercices[0].deroule?.dureeReelle === 22)
verifier(
  'la duree PREVUE n a pas ete ecrasee par la duree reelle',
  relu.exercices[0].duree === 15,
  "(le releve se pose a cote du plan, jamais a sa place)",
)

const jamaisMene = nouvelleSeance('Seance preparee')
jamaisMene.exercices = [nouvelExercice()]
const reluNeuf = importerFichier(exporterSeance(jamaisMene)).seance
verifier(
  'une seance jamais menee n a pas de releve fabrique',
  reluNeuf.exercices[0].deroule === undefined,
  "(un deroule vide ferait croire a un exercice « non fait » qu'on n'a jamais prevu de mener)",
)
verifier("ni d heure de demarrage", reluNeuf.demarreLe === undefined)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
