/**
 * Tests de la lecture d'un retour d'entraineur.
 *
 * Cet outil sert a decider quoi construire ensuite. Un compte faux ne se voit
 * pas — il produit un tableau parfaitement presentable — et oriente le travail
 * de plusieurs semaines dans la mauvaise direction. C'est ce qui rend ces
 * tests necessaires alors qu'il ne s'agit « que » d'un outil interne.
 *
 * Quatre pieges gardes ici.
 *
 * 1. Les semaines sans rien PRODUISENT UNE LIGNE A ZERO. C'est le trou qu'on
 *    vient lire : un histogramme qui saute les semaines vides transforme un
 *    abandon d'un mois en courbe reguliere.
 *
 * 2. La provenance ne se devine pas au hasard : une fiche livree se reconnait
 *    a sa reference, une fiche de cahier a la mention de sa source. Se tromper
 *    ici, c'est conclure que la bibliotheque livree ne sert pas alors qu'elle
 *    est la seule utilisee.
 *
 * 3. Les signaux se declenchent sur des seuils, et un seuil qui glisse rend
 *    l'outil bavard — donc ignore.
 *
 * 4. Un fichier qui n'est pas une sauvegarde de l'application est refuse clairement,
 *    plutot que compte comme un classeur vide.
 *
 * Lancement : npm test
 */

import { compter, lireFichier, parSemaine, provenance, signaux } from '../outils/lireRetour.mjs'

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

const JOUR = 86_400_000
const DEBUT = Date.parse('2026-09-01T18:00:00.000Z')
const iso = (jours) => new Date(DEBUT + jours * JOUR).toISOString()

/** Un exercice reduit a ce que l'outil regarde. */
const exercice = (modifications = {}) => ({
  titre: 'Exercice',
  materiel: [],
  objectifs: '',
  misePlace: '',
  evaluation: { note: 0, commentaire: '', nombreUtilisations: 0, derniereUtilisation: '' },
  schema: { vue: 'demi', jetons: [], etapes: [], zones: [], annotations: [] },
  ...modifications,
})

const seance = (modifications = {}) => ({
  date: '2026-09-02',
  retour: '',
  effectifJoueurs: 0,
  espaceDisponible: '',
  creeLe: iso(0),
  modifieLe: iso(0),
  exercices: [],
  ...modifications,
})

console.log('')
console.log('1. La provenance des exercices')
verifier(
  'une reference de fiche livree se reconnait',
  provenance(exercice({ refModele: 'attaque-3' })) === 'livree',
)
verifier(
  'le drapeau de la bibliotheque suffit aussi',
  provenance(exercice({ issuDeLaBibliotheque: true })) === 'livree',
)
verifier(
  'une mention de source designe un cahier',
  provenance(exercice({ objectifs: 'Travail des ailiers. Source : Cahier 20 exercices' })) ===
    'cahier',
)
verifier(
  'la mention se cherche aussi dans la mise en place',
  provenance(exercice({ misePlace: "D'apres le cahier des ailiers" })) === 'cahier',
)
verifier(
  'l apostrophe typographique est reconnue comme la droite',
  provenance(exercice({ misePlace: 'D’apres le cahier' })) === 'cahier',
)
verifier('sans rien, la fiche est ecrite de zero', provenance(exercice()) === 'ecrite')
verifier(
  'la reference l emporte sur la mention de source',
  provenance(exercice({ refModele: 'a', objectifs: 'Source : ailleurs' })) === 'livree',
  '(sinon une fiche livree puis annotee changerait de camp)',
)

console.log('')
console.log('2. Les semaines, trous compris')
verifier('sans seance, aucune semaine', parSemaine([]).length === 0)
verifier(
  'deux seances le meme jour tombent dans la meme semaine',
  JSON.stringify(parSemaine([seance(), seance()])) === '[2]',
)
const trouee = parSemaine([
  seance({ creeLe: iso(0) }),
  seance({ creeLe: iso(3) }),
  seance({ creeLe: iso(28) }),
])
verifier('les semaines vides existent bel et bien', trouee.length === 5, JSON.stringify(trouee))
verifier('et valent zero, pas undefined', trouee[1] === 0 && trouee[2] === 0 && trouee[3] === 0)
verifier('la premiere semaine porte les deux premieres', trouee[0] === 2)
verifier('la derniere porte la troisieme', trouee[4] === 1)
verifier(
  'une date illisible ne fait pas exploser le calcul',
  JSON.stringify(parSemaine([seance({ creeLe: 'jamais' }), seance({ creeLe: iso(0) })])) === '[1]',
)

console.log('')
console.log('3. Le comptage')
const classeur = [
  seance({
    retour: 'Trop de monde sur le demi-terrain.',
    effectifJoueurs: 12,
    dureeCreneau: 90,
    exercices: [
      exercice({
        refModele: 'a',
        deroule: { fait: true },
        evaluation: { note: 4, commentaire: 'bien', nombreUtilisations: 1, derniereUtilisation: '' },
        materiel: ['6 plots'],
        schema: {
          vue: 'demi',
          jetons: [{ id: 'j1', type: 'colonne' }, { id: 'j2', type: 'cerceau' }],
          etapes: [
            { id: 'e1', positions: {}, fleches: [] },
            { id: 'e2', positions: {}, fleches: [{ id: 'f1', type: 'rotation' }] },
          ],
          zones: [{ id: 'z1' }],
          annotations: [{ id: 'a1' }, { id: 'a2' }],
        },
      }),
      exercice({ objectifs: 'Source : cahier' }),
    ],
  }),
  seance({ exercices: [exercice()] }),
]
const c = compter(classeur, [exercice({ refModele: 'b' })])
verifier('les seances sont comptees', c.seances === 2)
verifier('les exercices de seance aussi', c.exercices === 3)
verifier('la bibliotheque personnelle est a part', c.modeles === 1)
verifier('elle rejoint le corpus complet', c.tous.length === 4)
verifier('un retour ecrit est vu', c.retours === 1)
verifier('un retour blanc ne compte pas', compter([seance({ retour: '   ' })], []).retours === 0)
verifier('une seance menee est vue', c.menees === 1)
verifier('les exercices faits sont comptes', c.faits === 1)
verifier('les notes ne portent que sur les seances', c.notes === 1)
verifier('mais le corpus entier est aussi mesure', c.notesPartout === 1)
verifier('les colonnes sont comptees', c.colonnes === 1)
verifier('les cerceaux aussi', c.cerceaux === 1)
verifier('les zones aussi', c.zones === 1)
verifier('les annotations aussi', c.annotations === 2)
verifier('les fleches de rotation aussi', c.rotations === 1)
verifier('un schema dessine est distingue du terrain vide', c.dessines === 1)
verifier('un mouvement de deux etapes est un mouvement', c.mouvements === 1)
verifier(
  'les trois provenances se repartissent',
  c.parProvenance.livree === 2 && c.parProvenance.cahier === 1 && c.parProvenance.ecrite === 1,
  JSON.stringify(c.parProvenance),
)
verifier(
  'un schema sans zones ni annotations ne casse rien',
  compter([seance({ exercices: [exercice({ schema: { vue: 'demi', jetons: [], etapes: [] } })] })], [])
    .zones === 0,
  '(les fichiers ecrits avant la version 3 du format n en ont pas)',
)

console.log('')
console.log('4. Les signaux')
const dits = (compte, seances = [], exporteLe = iso(10)) =>
  signaux({ ...compte, tous: compte.tous ?? [] }, seances, exporteLe).join(' | ')

verifier(
  'un classeur vide se signale seul',
  dits({ seances: 0 }) === "Le fichier ne contient aucune seance : il n'y a rien a lire ici.",
)
const dorment = dits(compter([seance({ creeLe: iso(0) })], []), [seance({ creeLe: iso(0) })], iso(60))
verifier('un long silence avant l export est signale', /Plus aucune seance preparee/.test(dorment))
verifier(
  'un silence de deux semaines ne l est pas',
  !/Plus aucune seance/.test(
    dits(compter([seance({ creeLe: iso(0) })], []), [seance({ creeLe: iso(0) })], iso(14)),
  ),
  '(preparer quinze jours a l avance est un usage, pas un abandon)',
)
verifier(
  'deux seances sans retour ne declenchent rien',
  !/Aucun retour/.test(dits(compter([seance(), seance()], []))),
  '(on ne reproche pas un retour manquant a qui essaie encore)',
)
verifier(
  'trois seances sans retour, si',
  /Aucun retour de seance ecrit/.test(dits(compter([seance(), seance(), seance()], []))),
)
verifier(
  'un seul retour suffit a faire taire le signal',
  !/Aucun retour/.test(dits(compter([seance({ retour: 'ok' }), seance(), seance()], []))),
)
verifier(
  'un classeur exemplaire ne dit rien d alarmant',
  /Rien d'alarmant/.test(
    dits(
      compter(
        [
          seance({
            creeLe: iso(9),
            retour: 'bien',
            exercices: [
              exercice({
                refModele: 'a',
                deroule: { fait: true },
                evaluation: { note: 5, commentaire: 'x', nombreUtilisations: 1, derniereUtilisation: '' },
                schema: {
                  vue: 'demi',
                  jetons: [{ id: 'j', type: 'joueur' }],
                  etapes: [
                    { id: 'e1', positions: {}, fleches: [] },
                    { id: 'e2', positions: {}, fleches: [] },
                  ],
                  zones: [{ id: 'z' }],
                  annotations: [],
                },
              }),
            ],
          }),
        ],
        [],
      ),
      [seance({ creeLe: iso(9) })],
    ),
  ),
)

console.log('')
console.log('5. Le refus de ce qui n est pas un fichier de l application')
const tel = (x) => x
const echoue = (valeur) => {
  try {
    lireFichier(valeur, tel, tel)
    return false
  } catch {
    return true
  }
}
verifier('un chemin inexistant echoue proprement', echoue('nulle-part.hbt.json'))

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
