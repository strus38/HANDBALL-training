/**
 * Proposition de mouvements a partir du deroulement ecrit.
 *
 * C'est le chemin inverse de redaction.ts : au lieu de raconter le schema, on
 * essaie de le deviner. L'exercice a une limite connue d'avance — le texte d'un
 * entraineur dit QUI fait QUOI de facon assez fiable, mais il dit OU de facon
 * relationnelle (« dans son dos », « dans l'intervalle »), ce qui ne se traduit
 * pas en metres sans interpretation.
 *
 * Le module assume cette limite : chaque action porte un niveau de confiance, et
 * la destination est toujours la partie la plus fragile. Rien n'est applique
 * sans que l'entraineur ait vu ce qui est propose.
 */

import { estJoueur, porteur, positionDe } from './mouvement'
import { TERRAIN, type Position, type Schema, type TypeFleche } from './types'

const sansAccent = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

// ------------------------------------------------------------- Lexiques

/** Designations d'un joueur, de la plus precise a la plus vague. */
const POSTES: { motifs: string[]; etiquette: string }[] = [
  { motifs: ['ailier gauche', 'aile gauche'], etiquette: 'AlG' },
  { motifs: ['ailier droit', 'aile droite'], etiquette: 'AlD' },
  { motifs: ['arriere gauche'], etiquette: 'ArG' },
  { motifs: ['arriere droit'], etiquette: 'ArD' },
  { motifs: ['demi-centre', 'demi centre'], etiquette: 'DC' },
  { motifs: ['pivot'], etiquette: 'PIV' },
  { motifs: ['gardien'], etiquette: 'GB' },
]

/** Verbes qui designent un type de trace. L'ordre compte : le plus specifique d'abord. */
const VERBES: { motifs: string[]; type: TypeFleche }[] = [
  { motifs: ['pose un ecran', 'ecran', 'bloque', 'barrage'], type: 'ecran' },
  { motifs: ['dribble', 'conduit le ballon', 'avance en dribble'], type: 'dribble' },
  {
    motifs: ['passe a', 'passe au', 'passe vers', 'donne a', 'donne au', 'sert', 'transmet',
             'rend le ballon', 'remise', 'relance sur', 'relance', 'adresse', 'ressort sur'],
    type: 'passe',
  },
  { motifs: ['tire', 'conclut', 'arme et', 'tir en suspension'], type: 'tir' },
  {
    motifs: ['part en course', 'part en', 'demarre', 'croise', 'enchaine', 'se demarque',
             'sort au contact', 'sort sur', 'glisse', 'decroche', 'monte', 'coupe', 'plonge',
             'attaque l', 'attaque le', 'attaque la', 'se replace', 'replie', 'entre dans',
             'part', 'court', 'se deplace', 'avance'],
    type: 'course',
  },
]

export type Confiance = 'haute' | 'moyenne' | 'faible'

export interface ActionDetectee {
  /** Phrase d'origine, affichee a l'entraineur pour qu'il juge. */
  phrase: string
  type: TypeFleche
  /** Jeton qui agit, deja resolu dans le schema. */
  acteur?: string
  /** Receveur d'une passe. */
  cible?: string
  destination: Position
  /**
   * Fiabilite de la proposition.
   * haute   : acteur nomme et destination explicite
   * moyenne : acteur nomme, destination deduite d'une zone
   * faible  : acteur ou destination devines
   */
  confiance: Confiance
  /** Ce qui a permis de situer la destination, pour l'expliquer. */
  indice: string
}

export interface EtapeProposee {
  titre: string
  actions: ActionDetectee[]
}

// -------------------------------------------------------- Reperage acteur

/**
 * Cherche le jeton qui agit, dans la portion de phrase precedant le verbe.
 *
 * Quand rien n'y figure — « il passe a », « le porteur ressort » — on remonte
 * au porteur du ballon, qui est presque toujours le sujet implicite.
 */
function trouverActeur(
  schema: Schema,
  index: number,
  phrase: string,
  avantLeVerbe?: string,
): string | undefined {
  const texte = sansAccent(avantLeVerbe ?? phrase)

  // 1. Une etiquette ecrite telle quelle : « ArD passe a AlD ».
  for (const jeton of schema.jetons) {
    if (!jeton.etiquette.trim()) continue
    const etiquette = sansAccent(jeton.etiquette)
    if (etiquette.length >= 2 && new RegExp(`\\b${etiquette}\\b`).test(texte)) return jeton.id
  }

  // 2. Un poste nomme en toutes lettres.
  for (const poste of POSTES) {
    if (!poste.motifs.some((m) => texte.includes(m))) continue
    const jeton = schema.jetons.find((j) => sansAccent(j.etiquette) === sansAccent(poste.etiquette))
    if (jeton) return jeton.id
  }

  // 3. Un defenseur numerote : « le defenseur 2 », « le defenseur numero 2 ».
  const numero = texte.match(/defenseur\s+(?:numero\s+)?(\d)/)
  if (numero) {
    const jeton = schema.jetons.find(
      (j) => j.type === 'defenseur' && j.etiquette.trim() === numero[1],
    )
    if (jeton) return jeton.id
  }

  // 4. Sujet implicite — « il », « puis », ou rien du tout avant le verbe.
  //    C'est alors le joueur qui a le ballon : dans un texte d'entraineur, le
  //    sujet sous-entendu est presque toujours le porteur.
  const pronom = /\b(le porteur|porteur de balle|il|elle|puis|ensuite|celui-ci)\b/.test(texte)
  if (pronom || texte.trim().length < 4) return porteur(schema, index)

  // Un sujet est bien present, mais on ne le reconnait pas. On prefere alors ne
  // rien proposer : attribuer l'action au porteur du ballon produirait un
  // schema credible et faux, ce qui est pire que pas de schema du tout.
  return undefined
}

/** Receveur d'une passe : cherche dans la portion de phrase suivant le verbe. */
function trouverCible(
  schema: Schema,
  phrase: string,
  acteur: string | undefined,
  apresLeVerbe?: string,
): string | undefined {
  const fin = sansAccent(apresLeVerbe ?? phrase)

  for (const poste of POSTES) {
    if (!poste.motifs.some((m) => fin.includes(m))) continue
    const jeton = schema.jetons.find((j) => sansAccent(j.etiquette) === sansAccent(poste.etiquette))
    if (jeton && jeton.id !== acteur) return jeton.id
  }
  for (const jeton of schema.jetons) {
    if (!jeton.etiquette.trim() || jeton.id === acteur) continue
    const etiquette = sansAccent(jeton.etiquette)
    if (etiquette.length >= 2 && new RegExp(`\\b${etiquette}\\b`).test(fin)) return jeton.id
  }
  return undefined
}

// ---------------------------------------------------- Reperage destination

/** Abscisse d'une ligne concentrique, du cote du but attaque. */
function surLaLigne(y: number, rayon: number): Position {
  const yBorne = Math.min(11.5, Math.max(8.5, y))
  const dy = Math.abs(y - yBorne)
  const dx = Math.sqrt(Math.max(0.25, rayon * rayon - dy * dy))
  return { x: TERRAIN.longueur - dx, y }
}

/**
 * Traduit une indication de lieu en coordonnees.
 *
 * C'est le maillon faible, et il est assume comme tel : « dans l'intervalle »
 * ou « dans son dos » n'ont de sens que par rapport au placement du moment.
 */
function trouverDestination(
  schema: Schema,
  index: number,
  acteur: string,
  phrase: string,
): { position: Position; confiance: Confiance; indice: string } {
  const texte = sansAccent(phrase)
  const depart = positionDe(schema, index, acteur) ?? { x: 30, y: 10 }
  const versLeHaut = depart.y > TERRAIN.largeur / 2

  if (/\bau but\b|dans le but|au fond/.test(texte)) {
    return { position: { x: TERRAIN.longueur, y: 10 }, confiance: 'haute', indice: 'le but' }
  }
  if (/\b9 ?m|9 metres|jet franc\b/.test(texte)) {
    return { position: surLaLigne(depart.y, 9), confiance: 'haute', indice: 'la ligne des 9 m' }
  }
  if (/\b6 ?m|6 metres|surface\b/.test(texte)) {
    return { position: surLaLigne(depart.y, 6.4), confiance: 'haute', indice: 'la ligne des 6 m' }
  }
  if (/\bl ?aile|sur l aile|angle\b/.test(texte)) {
    return {
      position: { x: 36.5, y: versLeHaut ? 18.3 : 1.7 },
      confiance: 'moyenne',
      indice: "l'aile",
    }
  }
  if (/\bintervalle\b/.test(texte)) {
    // Entre les deux defenseurs les plus proches, juste devant la surface.
    const defenseurs = schema.jetons
      .filter((j) => j.type === 'defenseur')
      .map((j) => positionDe(schema, index, j.id))
      .filter((p): p is Position => !!p)
      .sort((a, b) => Math.abs(a.y - depart.y) - Math.abs(b.y - depart.y))
    if (defenseurs.length >= 2) {
      const y = (defenseurs[0].y + defenseurs[1].y) / 2
      return { position: surLaLigne(y, 6.6), confiance: 'moyenne', indice: 'un intervalle defensif' }
    }
  }
  if (/dans son dos|derriere lui|dans le dos/.test(texte)) {
    return {
      position: { x: Math.min(33, depart.x + 2.5), y: depart.y + (versLeHaut ? -2.5 : 2.5) },
      confiance: 'faible',
      indice: 'un deplacement « dans le dos », place approximativement',
    }
  }
  if (/\bexterieur\b/.test(texte)) {
    return {
      position: { x: depart.x + 1.5, y: depart.y + (versLeHaut ? 2.5 : -2.5) },
      confiance: 'faible',
      indice: "un ecartement vers l'exterieur",
    }
  }
  if (/\baxe\b|au centre|central/.test(texte)) {
    return { position: { x: depart.x + 1.5, y: 10 }, confiance: 'moyenne', indice: "l'axe" }
  }

  // Faute d'indication, on avance de trois metres vers le but.
  return {
    position: { x: Math.min(33, depart.x + 3), y: depart.y },
    confiance: 'faible',
    indice: 'aucune indication de lieu : avancee de 3 m vers le but',
  }
}

// --------------------------------------------------------------- Analyse

/** Decoupe un texte en phrases, en gardant leur ordre. */
export function decouperEnPhrases(texte: string): string[] {
  return texte
    .split(/\n+/)
    .flatMap((ligne) => ligne.split(/(?<=[.!?])\s+/))
    .map((p) => p.trim())
    .filter((p) => p.length > 8)
}

/**
 * Type de trace evoque par une phrase, et position du verbe.
 *
 * La position compte autant que le type : dans « il passe a l'ailier droit »,
 * l'ailier est le RECEVEUR, pas l'auteur. Sans cette coupure, l'analyseur
 * attribue l'action au mauvais joueur — l'erreur la plus couteuse possible,
 * puisqu'elle produit un schema credible et faux.
 */
function trouverType(phrase: string): { type: TypeFleche; position: number } | undefined {
  const texte = sansAccent(phrase)
  for (const verbe of VERBES) {
    for (const motif of verbe.motifs) {
      const position = texte.indexOf(motif)
      if (position >= 0) return { type: verbe.type, position }
    }
  }
  return undefined
}

/**
 * Propose un enchainement a partir d'un texte libre.
 *
 * Une phrase donne une etape : c'est l'unite dans laquelle un entraineur decrit
 * un moment du jeu. Les phrases ou rien n'est reconnu sont ignorees plutot que
 * devinees — mieux vaut proposer moins et juste.
 */
export function proposerMouvements(schema: Schema, texte: string): EtapeProposee[] {
  const etapes: EtapeProposee[] = []
  let index = 0

  for (const phrase of decouperEnPhrases(texte)) {
    const verbe = trouverType(phrase)
    if (!verbe) continue
    const type = verbe.type
    const normalisee = sansAccent(phrase)
    const avant = normalisee.slice(0, verbe.position)
    const apres = normalisee.slice(verbe.position)

    const acteur = trouverActeur(schema, index, phrase, avant)
    if (!acteur) continue

    const jeton = schema.jetons.find((j) => j.id === acteur)
    if (!jeton || !estJoueur(jeton.type)) continue

    const cible = type === 'passe' ? trouverCible(schema, phrase, acteur, apres) : undefined
    const lieu = trouverDestination(schema, index, acteur, phrase)

    // Une passe qui a trouve son receveur est fiable : le point d'arrivee est
    // le joueur vise, pas une zone devinee.
    const destination = cible ? positionDe(schema, index, cible) ?? lieu.position : lieu.position
    const confiance: Confiance = cible ? 'haute' : lieu.confiance

    etapes.push({
      titre: `Etape ${etapes.length + 2}`,
      actions: [
        {
          phrase,
          type,
          acteur,
          cible,
          destination,
          confiance,
          indice: cible ? 'le joueur vise' : lieu.indice,
        },
      ],
    })
    index += 1
  }

  return etapes
}

/** Resume lisible d'une proposition, pour la faire valider. */
export function decrireProposition(schema: Schema, action: ActionDetectee): string {
  const nom = schema.jetons.find((j) => j.id === action.acteur)?.etiquette || 'un joueur'
  const cible = schema.jetons.find((j) => j.id === action.cible)?.etiquette
  const verbes: Record<TypeFleche, string> = {
    course: 'court',
    dribble: 'dribble',
    passe: cible ? `passe a ${cible}` : 'transmet le ballon',
    tir: 'tire',
    ecran: 'pose un ecran',
  }
  return `${nom} ${verbes[action.type]}`
}
