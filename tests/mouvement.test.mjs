/**
 * Tests de l'orientation des joueurs, des fleches, de l'effectif et de la
 * lecture animee.
 *
 * Lancement : npm test
 */

import {
  exporterSeance,
  importerFichier,
  normaliserSeance,
  manqueEffectif,
  nouvelExercice,
  nouvelleSeance,
  interpolerAngle,
  interpolerEtape,
  avancement,
  tracerFleche,
  distanceAFleche,
  DUREE_TRANSITION,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}
const presque = (a, b, tolerance = 0.001) => Math.abs(a - b) <= tolerance

console.log('')
console.log('1. Orientation des joueurs')
verifier('rotation la plus courte en passant par zero',
  presque(interpolerAngle(350, 10, 0.5), 0), '(obtenu ' + interpolerAngle(350, 10, 0.5) + ')')
verifier('ne fait pas le tour dans le mauvais sens',
  presque(interpolerAngle(10, 350, 0.5), 0), '(obtenu ' + interpolerAngle(10, 350, 0.5) + ')')
verifier('demi-tour a mi-chemin',
  presque(interpolerAngle(0, 180, 0.5), 90) || presque(interpolerAngle(0, 180, 0.5), 270),
  '(obtenu ' + interpolerAngle(0, 180, 0.5) + ')')
verifier('depart conserve', presque(interpolerAngle(90, 270, 0), 90))
verifier('arrivee atteinte', presque(interpolerAngle(90, 270, 1), 270))
verifier('resultat toujours entre 0 et 360',
  [0, .25, .5, .75, 1].every((t) => { const a = interpolerAngle(300, 60, t); return a >= 0 && a < 360 }))

console.log('')
console.log('2. L orientation survit a l export')
const seance = nouvelleSeance('Test orientation')
const exercice = nouvelExercice('Croise')
exercice.schema.jetons = [{ id: 'j1', type: 'attaquant', etiquette: 'ArD', orientation: 90 }]
exercice.schema.etapes[0].positions = { j1: { x: 31, y: 6, orientation: 135 } }
seance.exercices = [exercice]
const relu = importerFichier(exporterSeance(seance)).seance.exercices[0]
verifier('orientation du placement conservee',
  relu.schema.etapes[0].positions[Object.keys(relu.schema.etapes[0].positions)[0]].orientation === 135)
verifier('orientation par defaut du jeton conservee', relu.schema.jetons[0].orientation === 90)

const ancien = JSON.parse(exporterSeance(seance))
delete ancien.contenu.seance.exercices[0].schema.jetons[0].orientation
delete ancien.contenu.seance.exercices[0].schema.etapes[0].positions.j1.orientation
const sansOrientation = importerFichier(JSON.stringify(ancien)).seance.exercices[0]
verifier('un fichier sans orientation reste lisible',
  sansOrientation.schema.jetons[0].orientation === undefined)
verifier('la position reste correcte',
  sansOrientation.schema.etapes[0].positions[Object.keys(sansOrientation.schema.etapes[0].positions)[0]].x === 31)

console.log('')
console.log('3. Effectif de la seance')
const seanceEffectif = nouvelleSeance('Mardi')
seanceEffectif.effectifJoueurs = 10
seanceEffectif.effectifGardiens = 1
const gros = { ...nouvelExercice('Match'), nombreJoueurs: 14, nombreGardiens: 2 }
const petit = { ...nouvelExercice('Duel'), nombreJoueurs: 4, nombreGardiens: 1 }
const manque = manqueEffectif(gros, seanceEffectif)
verifier('manque de joueurs detecte', manque && manque.joueurs === 4, JSON.stringify(manque))
verifier('manque de gardiens detecte', manque && manque.gardiens === 1)
verifier('aucune alerte si l effectif suffit', manqueEffectif(petit, seanceEffectif) === undefined)

const nonRenseigne = nouvelleSeance('Sans effectif')
verifier('effectif non renseigne = aucune alerte', manqueEffectif(gros, nonRenseigne) === undefined)
verifier('effectif par defaut a zero',
  nonRenseigne.effectifJoueurs === 0 && nonRenseigne.effectifGardiens === 0)
verifier('effectif conserve a la relecture',
  normaliserSeance(JSON.parse(JSON.stringify(seanceEffectif))).effectifJoueurs === 10)

console.log('')
console.log('4. Lecture animee')
const depart = { id: 'a', titre: 'Depart', consigne: '', fleches: [{ id: 'f' }],
  positions: { j1: { x: 30, y: 10, orientation: 0 }, j2: { x: 20, y: 5 } } }
const arrivee = { id: 'b', titre: 'Arrivee', consigne: '', fleches: [],
  positions: { j1: { x: 34, y: 14, orientation: 90 }, j2: { x: 20, y: 5 } } }

const milieu = interpolerEtape(depart, arrivee, 0.5)
verifier('position a mi-parcours', presque(milieu.positions.j1.x, 32) && presque(milieu.positions.j1.y, 12),
  JSON.stringify(milieu.positions.j1))
verifier('orientation a mi-parcours', presque(milieu.positions.j1.orientation, 45))
verifier('un jeton immobile ne bouge pas', milieu.positions.j2.x === 20)
verifier('les fleches du depart restent affichees', milieu.fleches.length === 1)

const debut = interpolerEtape(depart, arrivee, 0)
verifier('a t=0 on est sur l etape de depart', debut.positions.j1.x === 30)
const fin = interpolerEtape(depart, arrivee, 1)
verifier('a t=1 on est sur l etape d arrivee', fin.positions.j1.x === 34)
verifier('les fleches basculent en fin de transition', fin.fleches.length === 0)

const disparu = interpolerEtape(depart, { ...arrivee, positions: { j1: arrivee.positions.j1 } }, 0.5)
verifier('un jeton absent de l etape suivante reste en place', disparu.positions.j2.x === 20)
const apparu = interpolerEtape({ ...depart, positions: { j1: depart.positions.j1 } }, arrivee, 0.5)
verifier('un jeton apparu est place directement', apparu.positions.j2.x === 20)

verifier('la lecture commence a la premiere etape', avancement(0, 3).index === 0)
verifier('progression a mi-transition', presque(avancement(DUREE_TRANSITION / 2, 3).progression, 0.5))
verifier('transition terminee avant la pause', avancement(DUREE_TRANSITION, 3).progression === 1)
verifier('la lecture se termine apres la derniere etape', avancement(1e6, 3).termine === true)
verifier('une seule etape = rien a animer', avancement(0, 1).termine === true)

console.log('')
console.log('5. Trace des fleches')
const fleche = { id: 'f1', type: 'course', depart: { x: 30, y: 10 }, arrivee: { x: 36, y: 10 } }
const trace = tracerFleche(fleche)
verifier('le corps part du point de depart', trace.corps.startsWith('M 30 10'), trace.corps)
verifier('une pointe est tracee', trace.fin.length > 0)
verifier('milieu au centre du segment', presque(trace.milieu.x, 33) && presque(trace.milieu.y, 10),
  JSON.stringify(trace.milieu))
verifier('la course n a pas de doublure', trace.doublure === undefined)
verifier('le tir est double', tracerFleche({ ...fleche, type: 'tir' }).doublure !== undefined)
verifier('l ecran se termine par une barre, pas une pointe',
  !tracerFleche({ ...fleche, type: 'ecran' }).fin.includes('Z'))
verifier('le dribble ondule',
  (tracerFleche({ ...fleche, type: 'dribble' }).corps.match(/L /g) || []).length > 10)

const courbe = tracerFleche({ ...fleche, courbure: { x: 33, y: 15 } })
verifier('la courbure deplace le milieu', courbe.milieu.y < 10,
  '(ecran y=' + courbe.milieu.y + ', le haut du terrain a un y ecran plus petit)')

verifier('un point sur la fleche est a distance nulle',
  distanceAFleche(fleche, { x: 33, y: 10 }) < 0.01)
verifier('un point eloigne est bien loin', distanceAFleche(fleche, { x: 33, y: 16 }) > 5)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
