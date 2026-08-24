/**
 * Analyse de texte : tests unitaires, puis MESURE de justesse.
 *
 * La seconde partie confronte l'analyseur aux onze fiches dont j'ai ecrit la
 * chorégraphie a la main. Elle ne verifie pas qu'il a raison — il n'a pas
 * toujours raison — mais elle chiffre ce qu'il vaut, pour que la fonction soit
 * proposee a l'entraineur avec un avertissement honnete plutot qu'une promesse.
 *
 * Lancement : npm test
 */

import {
  proposerMouvements,
  decouperEnPhrases,
  decrireProposition,
  construireExercice,
  SENIORS_MASCULINS,
  GARDIENS,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

const CATALOGUE = [...SENIORS_MASCULINS, ...GARDIENS]

/**
 * Schema d'attaque placee, pour les tests unitaires.
 *
 * La fiche se retrouve par sa REFERENCE, jamais par son titre : le titre est
 * corrigible - il vient de gagner ses accents - et une recherche par titre
 * casse au premier remaniement, loin d'ici et sans rapport avec l'analyse.
 */
function schemaAttaque() {
  return construireExercice(
    CATALOGUE.find((m) => m.ref === 'croise-arriere-ailier-cote-droit'),
  ).schema
}

console.log('')
console.log('1. Decoupage')
verifier('une phrase par point',
  decouperEnPhrases('ArD part en course. AlD croise ensuite.').length === 2)
verifier('les lignes comptent aussi',
  decouperEnPhrases('Premiere action ici\nDeuxieme action la').length === 2)
verifier('les fragments trop courts sont ignores',
  decouperEnPhrases('Bon. Oui.').length === 0)

console.log('')
console.log('2. Reconnaissance')
const schema = schemaAttaque()
const propositions = proposerMouvements(schema,
  "L'arriere droit part en course vers l'exterieur. Il passe a l'ailier droit. " +
  "L'ailier droit tire a 6 metres.")
verifier('trois actions reconnues', propositions.length === 3,
  JSON.stringify(propositions.map((p) => p.actions[0].type)))
verifier('la course est identifiee', propositions[0].actions[0].type === 'course')
verifier('la passe aussi', propositions[1].actions[0].type === 'passe')
verifier('le tir aussi', propositions[2].actions[0].type === 'tir')
verifier('le receveur de la passe est trouve', propositions[1].actions[0].cible !== undefined)
verifier('une passe avec receveur est fiable', propositions[1].actions[0].confiance === 'haute')
verifier('un lieu explicite est fiable', propositions[2].actions[0].confiance === 'haute',
  propositions[2].actions[0].confiance)
verifier('la description est lisible',
  decrireProposition(schema, propositions[1].actions[0]).includes('passe à'),
  decrireProposition(schema, propositions[1].actions[0]))

const ecran = proposerMouvements(schema, 'Le pivot pose un ecran sur le defenseur 2.')
verifier("l'ecran est identifie", ecran[0]?.actions[0].type === 'ecran')

const rien = proposerMouvements(schema, 'Les joueurs se placent et attendent le signal du coach.')
verifier('une phrase sans action reconnue est ignoree', rien.length === 0,
  JSON.stringify(rien.map((p) => p.actions[0].phrase)))

const inconnu = proposerMouvements(schema, 'Le libero part en course vers la zone.')
verifier('un acteur inconnu est ignore plutot que devine', inconnu.length === 0)

console.log('')
console.log('3. Confiance')
const flou = proposerMouvements(schema, "L'arriere gauche part dans son dos.")
verifier('un lieu relationnel est signale peu fiable',
  flou[0]?.actions[0].confiance === 'faible', JSON.stringify(flou[0]?.actions[0]))
verifier("et l'indice l'explique",
  (flou[0]?.actions[0].indice ?? '').length > 10, flou[0]?.actions[0].indice)

console.log('')
console.log('4. MESURE sur les fiches ecrites a la main')
console.log('')

const chorégraphiées = CATALOGUE.filter((m) => m.etapes && m.etapes.length > 0)
let totalAttendu = 0, totalPropose = 0
let acteursJustes = 0, typesJustes = 0, apparies = 0
let sommeEcart = 0, ecartsMesures = 0
const detail = []

for (const modele of chorégraphiées) {
  const exercice = construireExercice(modele)
  const schema = exercice.schema
  const cles = new Map()
  modele.jetons.forEach((j) => { if (j.ref) cles.set(j.ref, j) })

  // Ce que j'ai ecrit a la main, mis a plat.
  const attendus = (modele.etapes ?? []).flatMap((etape, rang) =>
    etape.mouvements.map((m) => ({
      rang,
      type: m.type,
      etiquette: cles.get(m.jeton)?.etiquette ?? m.jeton,
      vers: m.vers,
    })),
  )
  // Ce que l'analyseur deduit du texte de la fiche.
  const proposees = proposerMouvements(schema, modele.fonctionnement).flatMap((e) => e.actions)

  totalAttendu += attendus.length
  totalPropose += proposees.length

  // Appariement simple : pour chaque proposition, le premier attendu de meme
  // acteur non encore utilise.
  const utilises = new Set()
  for (const proposee of proposees) {
    const nomActeur = schema.jetons.find((j) => j.id === proposee.acteur)?.etiquette
    const correspondance = attendus.findIndex(
      (a, i) => !utilises.has(i) && a.etiquette === nomActeur,
    )
    if (correspondance === -1) continue
    utilises.add(correspondance)
    apparies += 1
    acteursJustes += 1
    const attendu = attendus[correspondance]
    if (attendu.type === proposee.type) typesJustes += 1
    if (attendu.vers) {
      sommeEcart += Math.hypot(attendu.vers.x - proposee.destination.x,
                               attendu.vers.y - proposee.destination.y)
      ecartsMesures += 1
    }
  }

  detail.push({
    titre: modele.titre.slice(0, 42),
    attendus: attendus.length,
    proposees: proposees.length,
    apparies: utilises.size,
  })
}

for (const d of detail) {
  const verdict = d.proposees === 0 ? 'texte non exploitable' : ''
  console.log(`        ${d.titre.padEnd(44)} ecrit ${String(d.attendus).padStart(2)}  ` +
              `propose ${String(d.proposees).padStart(2)}  retrouve ${d.apparies}  ${verdict}`)
}
console.log('')

// Distinction essentielle : certaines fiches decrivent une organisation
// (« series de trois attaques », « le bloc glisse ») et non une chorégraphie.
// Leur texte ne CONTIENT pas le mouvement : aucun analyseur ne l en tirerait.
const exploitables = detail.filter((d) => d.proposees > 0)
const attendusExploitables = exploitables.reduce((t, d) => t + d.attendus, 0)
const rappel = totalAttendu > 0 ? (apparies / totalAttendu) * 100 : 0
const rappelExploitable =
  attendusExploitables > 0 ? (apparies / attendusExploitables) * 100 : 0
const precisionActeur = totalPropose > 0 ? (apparies / totalPropose) * 100 : 0
const precisionType = apparies > 0 ? (typesJustes / apparies) * 100 : 0
const ecartMoyen = ecartsMesures > 0 ? sommeEcart / ecartsMesures : 0

console.log(`        Fiches dont le texte decrit un mouvement . ${exploitables.length} sur ${detail.length}`)
console.log(`        Mouvements ecrits a la main ............. ${totalAttendu}`)
console.log(`        Mouvements proposes .................... ${totalPropose}`)
console.log(`        Acteur juste (precision) ............... ${apparies}/${totalPropose} (${precisionActeur.toFixed(0)} %)`)
console.log(`        Bon type de trace ...................... ${typesJustes}/${apparies} (${precisionType.toFixed(0)} %)`)
console.log(`        Rappel sur les 11 fiches ............... ${rappel.toFixed(0)} %`)
console.log(`        Rappel sur les textes exploitables ..... ${rappelExploitable.toFixed(0)} %`)
console.log(`        Ecart moyen de destination ............. ${ecartMoyen.toFixed(1)} m`)
console.log('')

// La propriete qui compte le plus : ne jamais attribuer une action au mauvais
// joueur. Un schema credible et faux serait pire qu'une absence de schema.
verifier('aucune action n est attribuee au mauvais joueur', precisionActeur === 100,
  `(${precisionActeur.toFixed(0)} %)`)
// Le rappel se compare a un denominateur MOUVANT : enrichir la chorégraphie
// d'une fiche augmente le nombre de mouvements attendus sans rien changer au
// texte, et fait donc mecaniquement baisser le pourcentage. Le seuil est bas a
// dessein — il signale un analyseur casse, pas un analyseur perfectible.
verifier('rappel conforme a la mesure de reference', rappel >= 12, `(${rappel.toFixed(0)} %)`)
verifier('type de trace juste dans la majorite des cas', precisionType >= 60,
  `(${precisionType.toFixed(0)} %)`)
verifier('l analyseur ne noie pas l entraineur sous les propositions',
  totalPropose <= totalAttendu, `(${totalPropose} pour ${totalAttendu})`)
verifier('la destination reste approximative, ce qui est assume', ecartMoyen > 1,
  `(${ecartMoyen.toFixed(1)} m)`)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
