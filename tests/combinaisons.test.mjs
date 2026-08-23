/**
 * Tests des combinaisons nommees.
 *
 * Trois pieges gardes ici.
 *
 * 1. Le NOM doit ouvrir le titre. « On joue l'Espagnole » se dit sur le
 *    terrain : si la fiche s'appelle « Croise central avec ecran du
 *    demi-centre », la recherche de la bibliotheque ne la trouve pas et
 *    l'entraineur croit qu'elle n'existe pas.
 *
 * 2. Les VARIANTES ne font pas des fiches. Une combinaison en a trois ou
 *    quatre ; en faire autant de fiches noierait la bibliotheque et
 *    disperserait les compteurs d'utilisation entre des quasi-doublons.
 *
 * 3. Le porteur du ballon doit rester VISIBLE. Pose exactement sur lui, le
 *    ballon le masque entierement, et l'on voit une passe partir d'un joueur
 *    absent du schema.
 *
 * Lancement : npm test
 */

import {
  COMBINAISONS,
  CATALOGUE,
  REFS_COMBINAISONS,
  construireExercice,
  porteur,
  DISTANCE_PORTEUR,
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
console.log('1. Le repertoire est bien la')
verifier('des combinaisons sont fournies', COMBINAISONS.length >= 3, `(${COMBINAISONS.length})`)
verifier(
  'elles sont toutes marquees comme telles',
  COMBINAISONS.every((m) => m.combinaison === true),
  "(sans le marqueur, la puce « Combinaisons » ne les voit pas)",
)
verifier(
  'la puce retrouve exactement ces fiches',
  REFS_COMBINAISONS.size === COMBINAISONS.length &&
    COMBINAISONS.every((m) => REFS_COMBINAISONS.has(m.ref)),
)
verifier(
  'elles font partie du catalogue',
  COMBINAISONS.every((m) => CATALOGUE.includes(m)),
  "(un fichier de fiches oublie de l'import reste invisible sans erreur)",
)

console.log('')
console.log('2. Le nom parle ouvre le titre')
for (const m of COMBINAISONS) {
  const nom = m.titre.split(' - ')[0].trim()
  verifier(
    `« ${m.titre} » commence par un nom`,
    nom.length > 0 && nom.length <= 24 && !/^[a-z]/.test(nom),
    `(« ${nom} »)`,
  )
}

console.log('')
console.log('3. Les variantes restent dans la fiche')
verifier(
  'aucune fiche « variante » ou « bis »',
  !COMBINAISONS.some((m) => /\b(variante|bis|[AB])\s*$/i.test(m.titre)),
  COMBINAISONS.map((m) => m.titre).join(' | '),
)
verifier(
  'chaque combinaison propose ses variantes',
  COMBINAISONS.every((m) => /variante/i.test(m.evolution)),
  "(c'est le champ Evolution qui les porte)",
)

console.log('')
console.log('4. Ce sont des enchainements, pas des mises en place')
for (const m of COMBINAISONS) {
  verifier(
    `« ${m.titre} » decrit un mouvement`,
    (m.etapes?.length ?? 0) >= 3,
    `(${m.etapes?.length ?? 0} temps : une combinaison sans etapes n'est qu'un dessin)`,
  )
}

console.log('')
console.log('5. Le porteur du ballon reste visible')
for (const m of COMBINAISONS) {
  const exercice = construireExercice(m)
  const id = porteur(exercice.schema, 0)
  const jetons = exercice.schema.jetons
  const positions = exercice.schema.etapes[0].positions
  const ballon = jetons.find((j) => j.type === 'ballon')
  const ecart = (j) =>
    Math.hypot(positions[j.id].x - positions[ballon.id].x, positions[j.id].y - positions[ballon.id].y)

  verifier(`« ${m.titre} » a un porteur identifie`, !!id, '(ballon trop loin de tout joueur ?)')
  const colle = jetons.filter((j) => j.type !== 'ballon' && positions[j.id] && ecart(j) < 0.6)
  verifier(
    `« ${m.titre} » ne cache pas son porteur sous le ballon`,
    colle.length === 0,
    `(${colle.map((j) => j.etiquette).join(', ')})`,
  )
  verifier(
    `« ${m.titre} » garde le ballon a portee`,
    !!id && ecart(jetons.find((j) => j.id === id)) <= DISTANCE_PORTEUR,
  )
}

console.log('')
console.log('6. Rien ne double une fiche deja presente')
// Le dedoublonnage ne peut pas etre automatique - « Croise arriere - ailier
// cote droit » et « Croise Arriere/Ailier » sont le meme mouvement sous deux
// noms - mais un titre identique, lui, est une erreur franche.
const titres = CATALOGUE.map((m) => m.titre.toLowerCase().trim())
const doublons = titres.filter((t, i) => titres.indexOf(t) !== i)
verifier('aucun titre en double dans le catalogue', doublons.length === 0, doublons.join(', '))

console.log('')
console.log('7. La source est creditee')
verifier(
  'chaque combinaison dit d ou vient le schema',
  COMBINAISONS.every((m) => /repertoire classique/i.test(m.fonctionnement)),
  "(les textes et les schemas sont ecrits ici, la provenance de l'idee se dit)",
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
