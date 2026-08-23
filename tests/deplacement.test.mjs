/**
 * Tests du modele de mouvement : la fleche EST le deplacement.
 *
 * La propriete centrale verifiee ici est qu'il n'existe qu'une seule donnee :
 * deplacer le joueur a l'etape suivante doit changer la fleche de l'etape
 * courante, et inversement, sans aucune synchronisation explicite.
 *
 * Lancement : npm test
 */

import {
  appliquerMouvement,
  assurerEtapeSuivante,
  resoudreFleches,
  retirerFleche,
  orientationEffective,
  porteur,
  positionBallonPres,
  angleVers,
  migrerSchema,
  distance,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}
const presque = (a, b, t = 0.05) => Math.abs(a - b) <= t

/** Schema d'essai : un arriere, un ailier, un defenseur, un ballon. */
function schemaDeTest({ avecBallon = true, etapes = 1 } = {}) {
  const jetons = [
    { id: 'arg', type: 'attaquant', etiquette: 'ArG' },
    { id: 'alg', type: 'attaquant', etiquette: 'AlG' },
    { id: 'def', type: 'defenseur', etiquette: 'D' },
  ]
  const positions = {
    arg: { x: 31, y: 14 },
    alg: { x: 36.5, y: 18.3 },
    def: { x: 33.4, y: 12 },
  }
  if (avecBallon) {
    jetons.push({ id: 'ballon', type: 'ballon', etiquette: '' })
    positions.ballon = { x: 31.8, y: 14.4 }   // juste a cote de l'arriere
  }
  return {
    vue: 'demi',
    jetons,
    etapes: Array.from({ length: etapes }, (_, i) => ({
      id: 'e' + i,
      titre: 'Etape ' + (i + 1),
      consigne: '',
      positions: JSON.parse(JSON.stringify(positions)),
      fleches: [],
    })),
  }
}

console.log('')
console.log('1. Qui porte le ballon')
const base = schemaDeTest()
verifier('le joueur le plus proche est porteur', porteur(base, 0) === 'arg', porteur(base, 0))
const loin = schemaDeTest()
loin.etapes[0].positions.ballon = { x: 20, y: 5 }
verifier('un ballon isole n a pas de porteur', porteur(loin, 0) === undefined)
verifier('sans ballon, aucun porteur', porteur(schemaDeTest({ avecBallon: false }), 0) === undefined)

console.log('')
console.log('2. Tracer une course cree l etape suivante')
const apresCourse = appliquerMouvement(base, 0, {
  type: 'course', jetonDepart: 'arg', arrivee: { x: 33, y: 11 },
})
verifier('une deuxieme etape est apparue', apresCourse.etapes.length === 2)
verifier('le joueur est a l arrivee a l etape 2',
  apresCourse.etapes[1].positions.arg.x === 33 && apresCourse.etapes[1].positions.arg.y === 11)
verifier('il n a pas bouge a l etape 1', apresCourse.etapes[0].positions.arg.x === 31)
verifier('les autres joueurs sont recopies', apresCourse.etapes[1].positions.alg.x === 36.5)
verifier('la fleche ne stocke aucune arrivee',
  apresCourse.etapes[0].fleches[0].arrivee === undefined)
verifier('la fleche connait son jeton', apresCourse.etapes[0].fleches[0].jetonId === 'arg')
verifier('le schema d origine est intact', base.etapes.length === 1)

console.log('')
console.log('3. Une seule donnee : les deux vues restent d accord')
let resolue = resoudreFleches(apresCourse, 0)[0]
verifier('la fleche pointe vers l arrivee',
  resolue.arrivee.x === 33 && resolue.arrivee.y === 11, JSON.stringify(resolue.arrivee))
verifier('elle part de la position de l etape 1', resolue.depart.x === 31)

// On deplace le joueur a l'etape 2, comme le ferait un glisser sur le terrain.
const deplaceMain = JSON.parse(JSON.stringify(apresCourse))
deplaceMain.etapes[1].positions.arg = { x: 35, y: 9 }
resolue = resoudreFleches(deplaceMain, 0)[0]
verifier('deplacer le joueur rallonge la fleche, sans rien synchroniser',
  resolue.arrivee.x === 35 && resolue.arrivee.y === 9, JSON.stringify(resolue.arrivee))

// Et dans l'autre sens : deplacer le joueur a l'etape 1 change le depart.
const deplaceDepart = JSON.parse(JSON.stringify(apresCourse))
deplaceDepart.etapes[0].positions.arg = { x: 29, y: 16 }
verifier('deplacer le joueur a l etape 1 deplace le depart de la fleche',
  resoudreFleches(deplaceDepart, 0)[0].depart.x === 29)

console.log('')
console.log('4. Le ballon suit son porteur')
verifier('le ballon a suivi la course',
  distance(apresCourse.etapes[1].positions.ballon, { x: 33, y: 11 }) < 1.3,
  JSON.stringify(apresCourse.etapes[1].positions.ballon))
verifier('le porteur reste le meme a l etape 2', porteur(apresCourse, 1) === 'arg')

const sansBallon = schemaDeTest()
sansBallon.etapes[0].positions.ballon = { x: 20, y: 5 }
const courseSansBallon = appliquerMouvement(sansBallon, 0, {
  type: 'course', jetonDepart: 'arg', arrivee: { x: 33, y: 11 },
})
verifier('un joueur sans ballon ne l emmene pas',
  courseSansBallon.etapes[1].positions.ballon.x === 20)

const apresEcran = appliquerMouvement(base, 0, {
  type: 'ecran', jetonDepart: 'alg', arrivee: { x: 34, y: 13 },
})
verifier('un ecran deplace bien le joueur', apresEcran.etapes[1].positions.alg.x === 34)
verifier('un ecran pose par un non-porteur n emmene pas le ballon',
  apresEcran.etapes[1].positions.ballon.x === 31.8)

console.log('')
console.log('5. La passe transmet le ballon')
const apresPasse = appliquerMouvement(base, 0, {
  type: 'passe', jetonDepart: 'arg', jetonArrivee: 'alg', arrivee: { x: 36, y: 18 },
})
verifier('c est le ballon qui est le sujet de la passe',
  apresPasse.etapes[0].fleches[0].jetonId === 'ballon')
verifier('la cible est enregistree', apresPasse.etapes[0].fleches[0].cible === 'alg')
verifier('le passeur ne bouge pas', apresPasse.etapes[1].positions.arg.x === 31)
verifier('le ballon arrive dans les mains du receveur',
  distance(apresPasse.etapes[1].positions.ballon, apresPasse.etapes[1].positions.alg) < 1.3,
  JSON.stringify(apresPasse.etapes[1].positions.ballon))
verifier('le receveur devient porteur', porteur(apresPasse, 1) === 'alg', porteur(apresPasse, 1))

// Une passe lachee dans le vide reste une passe, sans receveur.
const passeVide = appliquerMouvement(base, 0, {
  type: 'passe', jetonDepart: 'arg', arrivee: { x: 25, y: 3 },
})
verifier('une passe sans receveur pose le ballon la ou on l a lachee',
  passeVide.etapes[1].positions.ballon.x === 25)
verifier('et personne ne la recupere', porteur(passeVide, 1) === undefined)

const apresTir = appliquerMouvement(base, 0, {
  type: 'tir', jetonDepart: 'arg', arrivee: { x: 40, y: 10 },
})
verifier('le tir envoie le ballon au but', apresTir.etapes[1].positions.ballon.x === 40)
verifier('le tireur reste sur place', apresTir.etapes[1].positions.arg.x === 31)

console.log('')
console.log('6. L orientation se deduit')
verifier('celui qui court regarde ou il va',
  presque(orientationEffective(apresCourse, 0, 'arg'), angleVers({ x: 31, y: 14 }, { x: 33, y: 11 })),
  '(' + orientationEffective(apresCourse, 0, 'arg').toFixed(1) + ')')
verifier('le defenseur regarde le ballon',
  presque(orientationEffective(base, 0, 'def'), angleVers({ x: 33.4, y: 12 }, { x: 31.8, y: 14.4 })),
  '(' + orientationEffective(base, 0, 'def').toFixed(1) + ')')
verifier('le porteur regarde le but', orientationEffective(base, 0, 'arg') === 90)
verifier('l ailier sans ballon regarde le ballon',
  presque(orientationEffective(base, 0, 'alg'), angleVers({ x: 36.5, y: 18.3 }, { x: 31.8, y: 14.4 })))

const impose = JSON.parse(JSON.stringify(base))
impose.etapes[0].positions.def.orientation = 200
verifier('un choix explicite de l entraineur prime', orientationEffective(impose, 0, 'def') === 200)

const rien = schemaDeTest({ avecBallon: false })
verifier('sans ballon, on retombe sur l orientation du poste',
  orientationEffective(rien, 0, 'def') === 270, '(' + orientationEffective(rien, 0, 'def') + ')')
verifier('un plot n a pas d orientation deduite',
  orientationEffective({ ...rien, jetons: [{ id: 'p', type: 'plot', etiquette: '' }],
    etapes: [{ id: 'x', titre: '', consigne: '', positions: { p: { x: 30, y: 10 } }, fleches: [] }] },
    0, 'p') === 0)

console.log('')
console.log('7. Effacer une fleche remet le joueur immobile')
const sansFleche = retirerFleche(apresCourse, 0, apresCourse.etapes[0].fleches[0].id)
verifier('la fleche a disparu', sansFleche.etapes[0].fleches.length === 0)
verifier('le joueur est revenu a sa position de depart',
  sansFleche.etapes[1].positions.arg.x === 31 && sansFleche.etapes[1].positions.arg.y === 14)
verifier('le ballon est revenu avec lui',
  sansFleche.etapes[1].positions.ballon.x === 31.8)
verifier('l etape suivante existe toujours', sansFleche.etapes.length === 2)

console.log('')
console.log('8. Fleches degenerees et fleches libres')
const immobile = appliquerMouvement(base, 0, {
  type: 'course', jetonDepart: 'arg', arrivee: { x: 31.05, y: 14.02 },
})
verifier('un deplacement nul ne dessine pas de fleche', resoudreFleches(immobile, 0).length === 0)

const libre = appliquerMouvement(base, 0, {
  type: 'course', depart: { x: 22, y: 4 }, arrivee: { x: 26, y: 8 },
})
verifier('une fleche sans jeton reste libre', libre.etapes[0].fleches[0].jetonId === undefined)
verifier('elle garde ses propres extremites',
  resoudreFleches(libre, 0)[0].arrivee.x === 26)
verifier('elle ne cree pas d etape', libre.etapes.length === 1)

const jetonDisparu = JSON.parse(JSON.stringify(apresCourse))
jetonDisparu.jetons = jetonDisparu.jetons.filter((j) => j.id !== 'arg')
delete jetonDisparu.etapes[0].positions.arg
delete jetonDisparu.etapes[1].positions.arg
verifier('une fleche orpheline n est plus dessinee',
  resoudreFleches(jetonDisparu, 0).length === 0)

console.log('')
console.log('9. Etape suivante')
const uneSeule = schemaDeTest()
verifier('assurerEtapeSuivante en cree une', assurerEtapeSuivante(uneSeule, 0).etapes.length === 2)
const deja = schemaDeTest({ etapes: 2 })
verifier('elle n en cree pas une deuxieme', assurerEtapeSuivante(deja, 0).etapes.length === 2)
verifier('les positions sont recopiees, pas partagees', (() => {
  const s = assurerEtapeSuivante(uneSeule, 0)
  s.etapes[1].positions.arg.x = 99
  return s.etapes[0].positions.arg.x === 31
})())

console.log('')
console.log('10. Reprise des anciens schemas')
const ancien = schemaDeTest({ etapes: 2 })
ancien.etapes[1].positions.arg = { x: 33, y: 11 }
ancien.etapes[0].fleches = [
  // Ancienne forme : les deux extremites etaient stockees.
  { id: 'f1', type: 'course', depart: { x: 31, y: 14 }, arrivee: { x: 33, y: 11 } },
  // Celle-ci ne correspond a aucun deplacement : elle doit rester libre.
  { id: 'f2', type: 'course', depart: { x: 22, y: 3 }, arrivee: { x: 26, y: 7 } },
]
const migre = migrerSchema(ancien)
verifier('une ancienne fleche est rattachee a son joueur',
  migre.etapes[0].fleches[0].jetonId === 'arg')
verifier('elle ne stocke plus son arrivee', migre.etapes[0].fleches[0].arrivee === undefined)
verifier('une fleche sans correspondance reste libre',
  migre.etapes[0].fleches[1].jetonId === undefined)
verifier('la reprise ne deplace personne',
  migre.etapes[1].positions.arg.x === 33 && migre.etapes[0].positions.arg.x === 31)
verifier('le trace reste identique apres reprise',
  resoudreFleches(migre, 0)[0].arrivee.x === 33)

const dejaNeuf = appliquerMouvement(base, 0, { type: 'course', jetonDepart: 'arg', arrivee: { x: 33, y: 11 } })
verifier('un schema deja au nouveau format est laisse tel quel',
  migrerSchema(dejaNeuf) === dejaNeuf)

console.log('')
console.log('11. Le ballon se pose dans la main')
const devant = positionBallonPres({ x: 30, y: 10 }, 90)
verifier('le ballon est devant un joueur tourne vers la droite',
  devant.x > 30.5 && Math.abs(devant.y - 10) < 0.6, JSON.stringify(devant))
verifier('a bonne distance', presque(distance(devant, { x: 30, y: 10 }), 0.95))
const derriere = positionBallonPres({ x: 30, y: 10 }, 270)
verifier('et de l autre cote si le joueur se retourne', derriere.x < 29.5, JSON.stringify(derriere))

// --- 12. Regressions relevees par la revue contradictoire ------------------
console.log('')
console.log('12. Le porteur ne change pas d equipe tout seul')
// Marquage realiste : le defenseur est au contact du JOUEUR, donc un peu plus
// loin du ballon que le porteur, qui le tient devant lui.
const serre = schemaDeTest()
serre.jetons.push({ id: 'garde', type: 'defenseur', etiquette: 'D2' })
serre.etapes[0].positions.garde = { x: 32.8, y: 15.4 }
verifier('le porteur reste l attaquant malgre le marquage', porteur(serre, 0) === 'arg',
  '(' + porteur(serre, 0) + ')')

// Le porteur court, le defenseur le suit et se retrouve PLUS PRES du ballon
// que lui : sans hysteresis, la proximite seule lui donnait la balle.
const apresCourseSerree = appliquerMouvement(serre, 0, {
  type: 'course', jetonDepart: 'arg', arrivee: { x: 33, y: 11 },
})
const ballonApres = apresCourseSerree.etapes[1].positions.ballon
apresCourseSerree.etapes[1].positions.garde = { x: ballonApres.x + 0.2, y: ballonApres.y + 0.2 }
verifier('un defenseur colle au ballon ne le vole pas',
  porteur(apresCourseSerree, 1) === 'arg', '(' + porteur(apresCourseSerree, 1) + ')')

// Une passe, elle, doit bel et bien changer de porteur.
const passeMalgreContact = appliquerMouvement(serre, 0, {
  type: 'passe', jetonDepart: 'arg', jetonArrivee: 'alg', arrivee: { x: 36.5, y: 18.3 },
})
verifier('une passe transmet quand meme le ballon',
  porteur(passeMalgreContact, 1) === 'alg', '(' + porteur(passeMalgreContact, 1) + ')')

// La cible declaree prime sur la geometrie : le defenseur qui marque le
// receveur est souvent plus pres du ballon que le receveur lui-meme.
const marque = schemaDeTest()
marque.jetons.push({ id: 'garde', type: 'defenseur', etiquette: 'D2' })
const versAilier = appliquerMouvement(marque, 0, {
  type: 'passe', jetonDepart: 'arg', jetonArrivee: 'alg', arrivee: { x: 36.5, y: 18.3 },
})
const ballonRecu = versAilier.etapes[1].positions.ballon
versAilier.etapes[1].positions.garde = { x: ballonRecu.x - 0.2, y: ballonRecu.y - 0.2 }
verifier('le receveur declare recoit, pas son defenseur',
  porteur(versAilier, 1) === 'alg', '(' + porteur(versAilier, 1) + ')')

console.log('')
console.log('13. L orientation deduite survit aux gestes')
// Un jeton pose puis deplace doit rester en orientation deduite : ecrire
// l orientation affichee dans la position revenait a la figer au premier
// glisser, et l automatisme ne servait plus a rien.
const deduite = schemaDeTest()
verifier('aucune orientation stockee au depart',
  deduite.etapes[0].positions.arg.orientation === undefined)
const deplace = appliquerMouvement(deduite, 0, {
  type: 'course', jetonDepart: 'arg', arrivee: { x: 33, y: 11 },
})
verifier('un mouvement n ecrit pas d orientation',
  deplace.etapes[1].positions.arg.orientation === undefined,
  '(' + deplace.etapes[1].positions.arg.orientation + ')')
verifier('elle reste pourtant calculee', orientationEffective(deplace, 0, 'arg') !== 0)

// A l inverse, un choix explicite doit etre respecte et conserve.
const imposee = JSON.parse(JSON.stringify(deduite))
imposee.etapes[0].positions.arg.orientation = 200
verifier('un choix explicite est respecte', orientationEffective(imposee, 0, 'arg') === 200)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
