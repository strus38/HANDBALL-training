/**
 * Tests de l'aimantation, de la symetrie et de la redaction automatique.
 *
 * Lancement : npm test
 */

import {
  aimanter,
  positionAimantee,
  projeterSurLigne,
  refleterAngle,
  refleterPosition,
  refleterEtiquette,
  refleterSchema,
  decrireEtape,
  redigerDeroulement,
  redigerConsigne,
  redactionPossible,
  situer,
  nommer,
  appliquerMouvement,
  orientationEffective,
  resoudreFleches,
  TERRAIN,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}
const presque = (a, b, t = 0.02) => Math.abs(a - b) <= t

console.log('')
console.log('1. Projection sur les lignes')
// Entre les poteaux, la ligne des 6 m est droite, a x = 34.
verifier('projection droite entre les poteaux',
  presque(projeterSurLigne({ x: 36, y: 10 }, 6, 'droite').x, 34) &&
  presque(projeterSurLigne({ x: 36, y: 10 }, 6, 'droite').y, 10),
  JSON.stringify(projeterSurLigne({ x: 36, y: 10 }, 6, 'droite')))
// Au dela, elle est circulaire autour du poteau : la distance au poteau vaut le rayon.
const surArc = projeterSurLigne({ x: 37, y: 3 }, 6, 'droite')
verifier('projection circulaire au dela des poteaux',
  presque(Math.hypot(surArc.x - 40, surArc.y - 8.5), 6, 0.01),
  JSON.stringify(surArc))
verifier('la ligne des 9 m est plus loin du but',
  projeterSurLigne({ x: 33, y: 10 }, 9, 'droite').x === 31)
verifier('symetrie du cote gauche',
  presque(projeterSurLigne({ x: 4, y: 10 }, 6, 'gauche').x, 6))

console.log('')
console.log('2. Aimantation')
const posteAilier = aimanter({ x: 36.2, y: 18 })
verifier('un point lache pres d un poste s y accroche',
  posteAilier && posteAilier.position.x === 36.5 && posteAilier.position.y === 18.3,
  JSON.stringify(posteAilier))
verifier('et le poste est nomme', posteAilier.libelle.includes('ailier gauche'), posteAilier.libelle)

// Point choisi a l'ecart de tout poste, pour n'eprouver que la ligne : le
// poste de pivot est tout pres des 6 m dans l'axe, et l'emporterait.
const surLigne = aimanter({ x: 34.3, y: 13 })
verifier('un point pres des 6 m se pose dessus',
  surLigne && surLigne.libelle === '6 m' &&
  presque(Math.hypot(surLigne.position.x - 40, surLigne.position.y - 11.5), 6, 0.01),
  JSON.stringify(surLigne))
verifier('le poste de pivot couvre l axe des 6 m',
  aimanter({ x: 34.3, y: 10 }).libelle.includes('pivot'))

const surAxe = aimanter({ x: 25, y: 10.2 })
verifier('un point pres de l axe s y aligne',
  surAxe && surAxe.position.y === 10 && surAxe.libelle === 'axe du terrain',
  JSON.stringify(surAxe))

verifier('un point isole n est pas deplace', aimanter({ x: 24, y: 4 }) === undefined)
verifier('positionAimantee renvoie le point tel quel si rien n attire',
  positionAimantee({ x: 24, y: 4 }).x === 24)
verifier('aimantation desactivee : aucun effet',
  aimanter({ x: 36.2, y: 18 }, { active: false }) === undefined)
verifier('sans les postes, on retombe sur la ligne',
  aimanter({ x: 36.2, y: 18 }, { sansPostes: true }) === undefined ||
  aimanter({ x: 36.2, y: 18 }, { sansPostes: true }).libelle !== 'poste : ailier gauche')

// Le poste prime sur la ligne quand les deux sont a portee.
const pivot = aimanter({ x: 34.5, y: 10.2 })
verifier('un poste l emporte sur une ligne', pivot.libelle.includes('pivot'), pivot.libelle)

console.log('')
console.log('3. Symetrie')
verifier('un point du haut passe en bas', refleterPosition({ x: 31, y: 15 }).y === 5)
verifier('l abscisse ne change pas', refleterPosition({ x: 31, y: 15 }).x === 31)
verifier('un point sur l axe ne bouge pas', refleterPosition({ x: 31, y: 10 }).y === 10)
verifier('regarder a droite reste regarder a droite', refleterAngle(90) === 90)
verifier('regarder a gauche reste a gauche', refleterAngle(270) === 270)
verifier('le haut devient le bas', refleterAngle(0) === 180)
verifier('le bas devient le haut', refleterAngle(180) === 0)
verifier('angle quelconque', refleterAngle(45) === 135)
verifier('deux symetries reviennent au point de depart', refleterAngle(refleterAngle(37)) === 37)
verifier('l ailier gauche devient ailier droit', refleterEtiquette('AlG') === 'AlD')
verifier('et reciproquement', refleterEtiquette('AlD') === 'AlG')
verifier('un numero de maillot ne change pas', refleterEtiquette('7') === '7')

function schemaCroise() {
  const schema = {
    vue: 'demi',
    jetons: [
      { id: 'ard', type: 'attaquant', etiquette: 'ArD' },
      { id: 'ald', type: 'attaquant', etiquette: 'AlD' },
      { id: 'def', type: 'defenseur', etiquette: '1' },
      { id: 'ballon', type: 'ballon', etiquette: '' },
    ],
    etapes: [{
      id: 'e0', titre: 'Mise en place', consigne: '',
      positions: {
        ard: { x: 31.5, y: 5.5 }, ald: { x: 36.5, y: 1.7 },
        def: { x: 35.6, y: 4.6 }, ballon: { x: 32.3, y: 5.9 },
      },
      fleches: [],
    }],
  }
  return schema
}

const croise = schemaCroise()
const reflete = refleterSchema(croise)
verifier('toutes les positions sont reflechies',
  reflete.etapes[0].positions.ard.y === 14.5 && reflete.etapes[0].positions.ald.y === 18.3,
  JSON.stringify(reflete.etapes[0].positions.ard))
verifier('les etiquettes de poste suivent', reflete.jetons[0].etiquette === 'ArG')
verifier('le numero du defenseur est conserve', reflete.jetons[2].etiquette === '1')
verifier('le schema d origine est intact', croise.etapes[0].positions.ard.y === 5.5)
verifier('deux symetries redonnent l original',
  refleterSchema(reflete).etapes[0].positions.ard.y === 5.5)

// Une orientation imposee est reflechie ; une orientation deduite reste deduite.
const avecOrientation = schemaCroise()
avecOrientation.etapes[0].positions.def.orientation = 250
const refleteOrientation = refleterSchema(avecOrientation)
verifier('une orientation imposee est reflechie',
  refleteOrientation.etapes[0].positions.def.orientation === refleterAngle(250),
  '(' + refleteOrientation.etapes[0].positions.def.orientation + ')')
verifier('une orientation deduite le reste',
  refleteOrientation.etapes[0].positions.ard.orientation === undefined)

// Une fleche liee n'a rien a refleter : ses extremites sont les positions.
const avecCourse = appliquerMouvement(schemaCroise(), 0, {
  type: 'course', jetonDepart: 'ard', arrivee: { x: 34.5, y: 8 },
})
const courseReflete = refleterSchema(avecCourse)
verifier('la fleche liee suit la symetrie sans etre modifiee',
  presque(resoudreFleches(courseReflete, 0)[0].arrivee.y, 12),
  JSON.stringify(resoudreFleches(courseReflete, 0)[0].arrivee))
verifier('le sens de la course est bien inverse',
  presque(orientationEffective(courseReflete, 0, 'ard'),
          refleterAngle(orientationEffective(avecCourse, 0, 'ard')), 0.3))

console.log('')
console.log('4. Situer un point')
verifier('pres du but', situer({ x: 38, y: 10 }).startsWith('pres du but'))
verifier('a 9 m', situer({ x: 31, y: 10 }).startsWith('a 9 m'), situer({ x: 31, y: 10 }))
verifier('cote gauche pour un y eleve', situer({ x: 31, y: 17 }).includes('cote gauche'))
verifier('cote droit pour un y faible', situer({ x: 31, y: 3 }).includes('cote droit'))
verifier('dans l axe au centre', situer({ x: 31, y: 10 }).includes("dans l'axe"))
verifier('milieu de terrain au loin', situer({ x: 20, y: 10 }) === 'au milieu de terrain')
verifier('symetrique pour le but de gauche', situer({ x: 2, y: 10 }).startsWith('pres du but'))

console.log('')
console.log('5. Redaction du deroulement')
const base = schemaCroise()
verifier('un schema sans fleche ne produit rien', redactionPossible(base) === false)
verifier('et son deroulement est vide', redigerDeroulement(base) === '')

let scenario = appliquerMouvement(base, 0, {
  type: 'course', jetonDepart: 'ard', arrivee: { x: 34.5, y: 8 },
})
scenario = appliquerMouvement(scenario, 0, {
  type: 'passe', jetonDepart: 'ard', jetonArrivee: 'ald', arrivee: { x: 36.5, y: 1.7 },
})
const actions = decrireEtape(scenario, 0)
verifier('deux actions decrites', actions.length === 2, JSON.stringify(actions))
verifier('les actions sont numerotees', actions[0].numero === 1 && actions[1].numero === 2)
verifier('la course nomme le joueur', actions[0].phrase.startsWith('ArD part en course'),
  actions[0].phrase)
verifier('la passe nomme le passeur et le receveur',
  actions[1].phrase === 'ArD passe a AlD.', actions[1].phrase)
verifier('la redaction devient possible', redactionPossible(scenario) === true)

const deroulement = redigerDeroulement(scenario)
verifier('le deroulement porte le titre de l etape',
  deroulement.startsWith('Mise en place :'), deroulement)
verifier('il enchaine les deux phrases',
  deroulement.includes('part en course') && deroulement.includes('passe a AlD'))
verifier('redigerConsigne donne les phrases sans le titre',
  redigerConsigne(scenario, 0).startsWith('ArD part en course'))

// Un tir apres la passe : l'auteur est le nouveau porteur.
const avecTir = appliquerMouvement(scenario, 1, {
  type: 'tir', jetonDepart: 'ald', arrivee: { x: 40, y: 10 },
})
verifier('le tireur est celui qui a recu le ballon',
  decrireEtape(avecTir, 1)[0].phrase.startsWith('AlD tire'),
  decrireEtape(avecTir, 1)[0].phrase)

const ecran = appliquerMouvement(base, 0, {
  type: 'ecran', jetonDepart: 'ald', arrivee: { x: 34, y: 6 },
})
verifier('un ecran est decrit comme tel',
  decrireEtape(ecran, 0)[0].phrase.includes('pose un ecran'),
  decrireEtape(ecran, 0)[0].phrase)

console.log('')
console.log('6. Nommer les jetons')
verifier('l etiquette sert de nom', nommer(base, 'ard') === 'ArD')
const sansEtiquette = { ...base, jetons: base.jetons.map((j) => ({ ...j, etiquette: '' })) }
verifier('sans etiquette, on nomme le role', nommer(sansEtiquette, 'def') === 'un defenseur')
verifier('un jeton inconnu reste generique', nommer(base, 'inexistant') === 'un joueur')

console.log('')
console.log('7. Coherence avec le terrain')
verifier('les postes sont dans le terrain',
  aimanter({ x: 36.4, y: 18.2 }).position.x < TERRAIN.longueur)
verifier('un poste aimante hors surface reste hors surface',
  Math.hypot(aimanter({ x: 34.5, y: 10.2 }).position.x - 40, 0) > 5)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
