/**
 * Controle des fiches livrees avec l'application.
 *
 * Ces fiches sont ecrites a la main : personne ne les relit a ma place, et une
 * erreur de coordonnee y est invisible tant qu'on ne dessine pas le terrain.
 * Ces tests jouent ce role de relecteur — notamment la regle qui interdit a un
 * joueur de champ de se tenir dans la surface de but.
 *
 * Lancement : npm test
 */

import {
  SENIORS_MASCULINS,
  GARDIENS,
  SANS_BALLON,
  HBPSM,
  construireExercice,
  distanceALaSurface,
  resoudreFleches,
  porteur,
  redigerDeroulement,
  TERRAIN,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

const CATALOGUE = [...SENIORS_MASCULINS, ...GARDIENS, ...SANS_BALLON, ...HBPSM]
const JOUEURS_DE_CHAMP = ['attaquant', 'defenseur']

console.log('')
console.log('1. Integrite des modeles')
verifier('le catalogue est complet', CATALOGUE.length === 59, '(' + CATALOGUE.length + ')')
verifier('chaque fiche a un titre', CATALOGUE.every((m) => m.titre.trim().length > 0))
verifier('chaque fiche a au moins un jeton', CATALOGUE.every((m) => m.jetons.length > 0))

// Les cles de mouvement doivent designer un jeton reellement present.
const refsManquantes = []
for (const modele of CATALOGUE) {
  const refs = new Set(modele.jetons.map((j) => j.ref).filter(Boolean))
  for (const etape of modele.etapes ?? []) {
    for (const mouvement of etape.mouvements) {
      if (!refs.has(mouvement.jeton)) refsManquantes.push(`${modele.titre} : ${mouvement.jeton}`)
      if (mouvement.cible && !refs.has(mouvement.cible)) {
        refsManquantes.push(`${modele.titre} : cible ${mouvement.cible}`)
      }
    }
  }
}
verifier('tous les mouvements designent un jeton existant', refsManquantes.length === 0,
  JSON.stringify(refsManquantes.slice(0, 4)))

console.log('')
console.log('2. References stables')
// Une reference identifie une fiche fournie pour toujours. Le titre, lui, peut
// etre corrige ; c'est justement pourquoi il ne peut pas jouer ce role.
const refs = CATALOGUE.map((m) => m.ref)
verifier('chaque fiche porte une reference', refs.every((r) => typeof r === 'string' && r.length > 0))
verifier(
  'les references sont uniques',
  new Set(refs).size === refs.length,
  '(' + refs.filter((r, i) => refs.indexOf(r) !== i).join(', ') + ')',
)
verifier(
  'les references sont des identifiants sobres',
  refs.every((r) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(r)),
  '(' + refs.filter((r) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(r)).join(', ') + ')',
)

// Le vrai garde-fou : l'inventaire versionne. Une reference qui disparait
// emporte avec elle les favoris et l'historique des entraineurs.
const { readFileSync: lireFichier } = await import('node:fs')
const connues = lireFichier(new URL('./references-connues.txt', import.meta.url), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
const disparues = connues.filter((r) => !refs.includes(r))
const nouvelles = refs.filter((r) => !connues.includes(r))
verifier(
  'aucune reference connue n a disparu',
  disparues.length === 0,
  [
    '',
    ...disparues.map((r) => '        ' + r),
    '        Si le retrait est voulu, retirez aussi sa ligne de tests/references-connues.txt.',
  ].join('\n'),
)
verifier('l inventaire est a jour', nouvelles.length === 0)

console.log('')
console.log('3. Regle du jeu : personne dans la surface de but')
// Un gardien y est chez lui ; un joueur de champ n'a pas le droit d'y etre.
// Dix centimetres de tolerance : se tenir SUR la ligne est autorise.
const dansLaSurface = []
for (const modele of CATALOGUE) {
  const exercice = construireExercice(modele)
  exercice.schema.etapes.forEach((etape, index) => {
    for (const jeton of exercice.schema.jetons) {
      if (!JOUEURS_DE_CHAMP.includes(jeton.type)) continue
      const position = etape.positions[jeton.id]
      if (!position) continue
      const marge = distanceALaSurface(position)
      if (marge < -0.1) {
        dansLaSurface.push(
          `${modele.titre} / etape ${index + 1} / ${jeton.etiquette || jeton.type} (${marge.toFixed(2)} m)`,
        )
      }
    }
  })
}
verifier('aucun joueur de champ dans la surface', dansLaSurface.length === 0,
  '\n        ' + dansLaSurface.slice(0, 8).join('\n        '))

console.log('')
console.log('4. Tout le monde reste sur le terrain')
const horsTerrain = []
for (const modele of CATALOGUE) {
  const exercice = construireExercice(modele)
  exercice.schema.etapes.forEach((etape, index) => {
    for (const [id, position] of Object.entries(etape.positions)) {
      if (position.x < -1.5 || position.x > TERRAIN.longueur + 1.5 ||
          position.y < -1.5 || position.y > TERRAIN.largeur + 1.5) {
        const jeton = exercice.schema.jetons.find((j) => j.id === id)
        horsTerrain.push(`${modele.titre} / etape ${index + 1} / ${jeton?.etiquette || '?'}`)
      }
    }
  })
}
verifier('aucune position hors du terrain', horsTerrain.length === 0,
  JSON.stringify(horsTerrain.slice(0, 4)))

console.log('')
console.log('5. Fiches chorégraphiées')
const avecEtapes = CATALOGUE.filter((m) => m.etapes && m.etapes.length > 0)
console.log(`        ${avecEtapes.length} fiches sur ${CATALOGUE.length} decrivent un enchainement`)
verifier('au moins une fiche est chorégraphiée', avecEtapes.length > 0)

const problemes = []
for (const modele of avecEtapes) {
  const exercice = construireExercice(modele)
  const etapes = exercice.schema.etapes
  if (etapes.length !== (modele.etapes?.length ?? 0) + 1) {
    problemes.push(`${modele.titre} : ${etapes.length} etapes construites`)
  }
  // Chaque etape declarant des mouvements doit produire au moins une fleche.
  modele.etapes.forEach((_, rang) => {
    if (resoudreFleches(exercice.schema, rang).length === 0) {
      problemes.push(`${modele.titre} : aucune fleche visible a l'etape ${rang + 1}`)
    }
  })
  // Les titres declares doivent etre repris.
  modele.etapes.forEach((etapeModele, rang) => {
    if (etapes[rang + 1]?.titre !== etapeModele.titre) {
      problemes.push(`${modele.titre} : titre d'etape perdu (${etapeModele.titre})`)
    }
  })
}
verifier('les enchainements se construisent correctement', problemes.length === 0,
  '\n        ' + problemes.slice(0, 6).join('\n        '))

console.log('')
console.log('5. Coherence du ballon')
const ballonIncoherent = []
for (const modele of avecEtapes) {
  const exercice = construireExercice(modele)
  const aUnBallon = exercice.schema.jetons.some((j) => j.type === 'ballon')
  if (!aUnBallon) continue
  // Une passe doit changer le porteur : sinon elle n'a rien transmis.
  modele.etapes.forEach((etapeModele, rang) => {
    for (const mouvement of etapeModele.mouvements) {
      if (mouvement.type !== 'passe' || !mouvement.cible) continue
      const avant = porteur(exercice.schema, rang)
      const apres = porteur(exercice.schema, rang + 1)
      if (avant && apres && avant === apres) {
        ballonIncoherent.push(`${modele.titre} / etape ${rang + 1} : la passe ne change pas de porteur`)
      }
    }
  })
}
verifier('une passe transmet bien le ballon', ballonIncoherent.length === 0,
  '\n        ' + ballonIncoherent.slice(0, 5).join('\n        '))

console.log('')
console.log('6. Aller-retour : le schema sait se raconter')
// Si les mouvements sont coherents, la redaction automatique doit produire un
// texte non vide et nommer les postes concernes.
const muettes = []
for (const modele of avecEtapes) {
  const exercice = construireExercice(modele)
  const texte = redigerDeroulement(exercice.schema)
  if (!texte.trim()) muettes.push(modele.titre)
}
verifier('chaque fiche chorégraphiée produit un deroulement', muettes.length === 0,
  JSON.stringify(muettes))

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
