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
  CATALOGUE,
  REFS_COMBINAISONS,
  DISTANCE_PORTEUR,
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

// La liste etait recopiee ici. Elle a derive : un fichier de fiches ajoute
// d un cote laissait ses fiches entierement hors tests, sans rien signaler.
// On importe desormais celle que l application utilise vraiment.
const JOUEURS_DE_CHAMP = ['attaquant', 'defenseur']

console.log('')
console.log('1. Integrite des modeles')
verifier('le catalogue est complet', CATALOGUE.length === 62, '(' + CATALOGUE.length + ')')
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
console.log('6. Les tirs finissent dans le but')
// Le but fait 3 metres, centre sur la largeur : un tir doit donc arriver entre
// 8,5 et 11,5. Rien ne l'imposait, et deux fiches neuves visaient a cote sans
// que rien ne le signale. Le schema montrait alors une fleche qui sort du
// cadre - et c'est ce schema qu'un entraineur projette a ses joueurs.
const DEMI_BUT = 1.5
let tirs = 0
const horsCadre = []
for (const modele of CATALOGUE) {
  for (const etape of modele.etapes ?? []) {
    for (const m of etape.mouvements) {
      if (m.type !== 'tir' || !m.vers) continue
      tirs++
      // On regarde l'ecart lateral, quel que soit le but vise : une fiche peut
      // attaquer d'un cote comme de l'autre.
      if (Math.abs(m.vers.y - 10) > DEMI_BUT) horsCadre.push(`${modele.ref} (y=${m.vers.y})`)
    }
  }
}
console.log(`        ${tirs} tirs decrits dans le catalogue`)
verifier('des tirs sont bien decrits', tirs > 0)
verifier('aucun tir ne sort du cadre', horsCadre.length === 0, '(' + horsCadre.join(', ') + ')')

console.log('')
console.log('7. Le ballon ne cache pas son porteur')
// Un ballon pose EXACTEMENT sur son porteur le masque entierement : on voyait
// une passe partir d'un joueur absent du schema. C'etait le cas de 28 fiches.
// Le moteur reconnait le porteur jusqu'a 1,9 m : un decalage d'un metre rend
// les deux visibles sans rien changer a l'enchainement.
const JOUEURS = ['attaquant', 'defenseur', 'gardien']
const MASQUE = 0.6
const caches = []
const orphelins = []
for (const modele of CATALOGUE) {
  for (const ballon of modele.jetons.filter((j) => j.type === 'ballon')) {
    const joueurs = modele.jetons
      .filter((j) => j !== ballon && JOUEURS.includes(j.type))
      .map((j) => ({ j, d: Math.hypot(j.x - ballon.x, j.y - ballon.y) }))
      .sort((a, b) => a.d - b.d)
    if (joueurs.length === 0) continue
    if (joueurs[0].d < MASQUE) caches.push(`${modele.ref} (${joueurs[0].j.etiquette})`)
    // Un ballon pose loin de tout le monde est un ballon au sol : c'est licite,
    // on ne le signale pas. Ce qu'on verifie, c'est qu'un porteur DESIGNE le
    // reste vraiment, sans ambiguite avec son voisin.
    if (joueurs[0].d <= DISTANCE_PORTEUR && joueurs[1] && joueurs[1].d - joueurs[0].d < 0.25) {
      orphelins.push(`${modele.ref} (${joueurs[0].j.etiquette} / ${joueurs[1].j.etiquette})`)
    }
  }
}
verifier('aucun ballon ne masque son porteur', caches.length === 0, '(' + caches.join(', ') + ')')
verifier(
  'aucun ballon a mi-chemin entre deux joueurs',
  orphelins.length === 0,
  '(' + orphelins.join(', ') + ')',
)

// La meme exigence vaut pour les etapes CONSTRUITES : le moteur pose le ballon,
// mais il le pose la ou les donnees le menent. Une passe declaree avant la
// course de son receveur laissait le ballon au milieu du terrain, et la fiche
// montrait ensuite un tir partir de personne — c'est arrive sur la
// contre-attaque directe, sans que rien ne le signale.
const machesEnEtape = []
const abandonnes = []
const passesPerdues = []
for (const modele of avecEtapes) {
  const exercice = construireExercice(modele)
  const schema = exercice.schema
  const ballon = schema.jetons.find((j) => j.type === 'ballon')
  if (!ballon) continue

  schema.etapes.forEach((etape, index) => {
    const positionBallon = etape.positions[ballon.id]
    if (!positionBallon) return
    const distances = schema.jetons
      .filter((j) => JOUEURS.includes(j.type) && etape.positions[j.id])
      .map((j) => ({
        j,
        d: Math.hypot(etape.positions[j.id].x - positionBallon.x, etape.positions[j.id].y - positionBallon.y),
      }))
      .sort((a, b) => a.d - b.d)
    if (distances[0] && distances[0].d < MASQUE) {
      machesEnEtape.push(
        `${modele.ref} / etape ${index + 1} : ${distances[0].j.etiquette} (${distances[0].d.toFixed(2)} m)`,
      )
    }
    // A partir de la deuxieme etape, le ballon doit etre chez quelqu'un — sauf
    // s'il vient d'etre tire : il repose alors au but, et c'est normal.
    const tirVientDEtrePorte = schema.etapes[index - 1]?.fleches.some((f) => f.type === 'tir')
    if (index > 0 && !tirVientDEtrePorte && !porteur(schema, index)) {
      abandonnes.push(
        `${modele.ref} / etape ${index + 1} : ballon a ${distances[0]?.d.toFixed(1)} m de tout joueur`,
      )
    }
  })

  // Une passe declaree doit remettre le ballon a sa cible — sauf si un autre
  // mouvement du ballon suit dans la meme etape (remise puis tir, ou deux
  // passes d'un renversement) : c'est alors le dernier qui decide.
  const cles = new Map()
  modele.jetons.forEach((mj, i) => {
    if (mj.ref) cles.set(mj.ref, schema.jetons[i].id)
  })
  modele.etapes.forEach((etapeModele, rang) => {
    const mouvementsBallon = etapeModele.mouvements.filter(
      (m) => m.type === 'passe' || m.type === 'tir',
    )
    const dernier = mouvementsBallon[mouvementsBallon.length - 1]
    if (!dernier || dernier.type !== 'passe' || !dernier.cible) return
    if (porteur(schema, rang + 1) !== cles.get(dernier.cible)) {
      passesPerdues.push(`${modele.ref} / etape ${rang + 1} : la passe n'atteint pas ${dernier.cible}`)
    }
  })
}
verifier(
  'aucun ballon ne masque un joueur dans les etapes construites',
  machesEnEtape.length === 0,
  '\n        ' + machesEnEtape.slice(0, 6).join('\n        '),
)
verifier(
  'le ballon est toujours chez quelqu un, ou au but apres un tir',
  abandonnes.length === 0,
  '\n        ' + abandonnes.slice(0, 6).join('\n        '),
)
verifier(
  'chaque passe declaree remet le ballon a sa cible',
  passesPerdues.length === 0,
  '\n        ' + passesPerdues.slice(0, 6).join('\n        '),
)

console.log('')
console.log('8. Personne n en cache un autre')
// Le pivot etait dessine SOUS les defenseurs 3 et 4, a un metre de chacun, et
// disparaissait : treize paires de jetons se recouvraient ainsi dans les
// placements de depart, certaines a dix centimetres. La pastille d un jeton
// fait 0,66 m de rayon : en dessous de 1,30 m entre deux centres, les
// etiquettes se chevauchent et l on ne lit plus qui est qui.
//
// La regle ne vaut QUE pour le placement de depart : un ecran, lui, est un
// contact, et se joue dans les etapes.
const ECART_LISIBLE = 1.3
const JOUEURS_JETON = ['attaquant', 'defenseur', 'gardien']
const chevauchements = []
for (const modele of CATALOGUE) {
  const js = modele.jetons.filter((j) => JOUEURS_JETON.includes(j.type))
  for (let a = 0; a < js.length; a++) {
    for (let b = a + 1; b < js.length; b++) {
      const d = Math.hypot(js[a].x - js[b].x, js[a].y - js[b].y)
      if (d < ECART_LISIBLE) {
        chevauchements.push(`${modele.ref} : ${js[a].etiquette} et ${js[b].etiquette} a ${d.toFixed(2)} m`)
      }
    }
  }
}
verifier(
  'aucun jeton n en recouvre un autre au depart',
  chevauchements.length === 0,
  '(' + chevauchements.join(' ; ') + ')',
)
console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
