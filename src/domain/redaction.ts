/**
 * Redaction du deroulement a partir du schema.
 *
 * Une fois que les fleches portent un sens — qui se deplace, vers ou, avec le
 * ballon ou non — le texte peut s'ecrire tout seul. C'est exactement ce qu'il
 * faut sur la feuille imprimee, et c'est du temps de saisie en moins.
 *
 * Le texte produit est une PROPOSITION : l'entraineur le relit et le retouche.
 * Il vaut mieux une phrase un peu plate qu'il corrige qu'une page blanche.
 */

import { jetonBallon, porteur, resoudreFleches } from './mouvement'
import { TERRAIN, type Position, type Schema, type TypeFleche } from './types'

/** Nom lisible d'un jeton : son etiquette, sinon son role. */
export function nommer(schema: Schema, jetonId: string | undefined): string {
  const jeton = schema.jetons.find((j) => j.id === jetonId)
  if (!jeton) return 'un joueur'
  if (jeton.etiquette.trim()) return jeton.etiquette.trim()
  const roles: Record<string, string> = {
    attaquant: 'un attaquant',
    defenseur: 'un defenseur',
    gardien: 'le gardien',
    ballon: 'le ballon',
    entraineur: "l'entraineur",
    plot: 'un plot',
    but: 'le but',
    haie: 'une haie',
  }
  return roles[jeton.type] ?? 'un joueur'
}

/**
 * Situe un point sur le terrain, en vocabulaire de handball.
 *
 * L'attaque se jouant vers le but de droite, le haut du terrain est le cote
 * gauche de l'attaque : c'est ainsi qu'un entraineur place face a son tableau
 * decrit ce qu'il montre.
 */
export function situer(point: Position): string {
  const centre = TERRAIN.largeur / 2
  const versLeButDroit = point.x > TERRAIN.longueur / 2
  const distanceAuBut = versLeButDroit ? TERRAIN.longueur - point.x : point.x

  const cote =
    point.y > centre + 4.5 ? " cote gauche" : point.y < centre - 4.5 ? ' cote droit' : " dans l'axe"

  if (distanceAuBut <= 6.5) return `pres du but${cote}`
  if (distanceAuBut <= 9.5) return `a 9 m${cote}`
  if (distanceAuBut <= 15) return `en peripherie${cote}`
  return 'au milieu de terrain'
}

/** Une action, telle qu'elle sera lue. */
export interface Action {
  /** Rang de l'action dans l'etape, affiche aussi sur le schema. */
  numero: number
  phrase: string
  type: TypeFleche
}

/**
 * Actions d'une etape, dans l'ordre ou elles ont ete tracees.
 *
 * Pour une passe ou un tir, le sujet de la fleche est le ballon : l'auteur est
 * celui qui le portait au debut de l'etape.
 */
export function decrireEtape(schema: Schema, index: number): Action[] {
  const fleches = resoudreFleches(schema, index)
  const ballon = jetonBallon(schema)
  const porteurCourant = porteur(schema, index)
  const actions: Action[] = []

  for (const fleche of fleches) {
    const estBallon = ballon && fleche.jetonId === ballon.id
    const acteur = estBallon ? porteurCourant : fleche.jetonId
    const nom = fleche.jetonId ? nommer(schema, acteur) : 'Le mouvement'
    const ou = situer(fleche.arrivee)
    let phrase: string

    switch (fleche.type) {
      case 'course':
        phrase = `${nom} part en course ${ou}.`
        break
      case 'dribble':
        phrase = `${nom} avance en dribble ${ou}.`
        break
      case 'passe': {
        const receveur = trouverReceveur(schema, index, fleche.id)
        phrase = receveur
          ? `${nom} passe a ${nommer(schema, receveur)}.`
          : `${nom} transmet le ballon ${ou}.`
        break
      }
      case 'tir':
        phrase = `${nom} tire ${ou.startsWith('pres') ? 'a 6 m' : ou}.`
        break
      case 'ecran':
        phrase = `${nom} pose un ecran ${ou}.`
        break
      default:
        phrase = `${nom} se deplace ${ou}.`
    }

    actions.push({ numero: actions.length + 1, phrase, type: fleche.type })
  }

  return actions
}

function trouverReceveur(schema: Schema, index: number, flecheId: string): string | undefined {
  return schema.etapes[index]?.fleches.find((f) => f.id === flecheId)?.cible
}

/** Le deroulement complet, une ligne par etape. */
export function redigerDeroulement(schema: Schema): string {
  const lignes: string[] = []

  schema.etapes.forEach((etape, index) => {
    const actions = decrireEtape(schema, index)
    if (actions.length === 0) {
      // Une etape sans mouvement decrit une mise en place : on la mentionne
      // seulement si l'entraineur lui a donne une consigne.
      if (etape.consigne.trim()) lignes.push(`${etape.titre} : ${etape.consigne.trim()}`)
      return
    }
    const suite = actions.map((a) => a.phrase).join(' ')
    lignes.push(`${etape.titre} : ${suite}`)
  })

  return lignes.join('\n')
}

/** Consigne proposee pour une etape, sans son titre. */
export function redigerConsigne(schema: Schema, index: number): string {
  return decrireEtape(schema, index)
    .map((a) => a.phrase)
    .join(' ')
}

/** Vrai si le schema comporte assez de matiere pour rediger quelque chose. */
export function redactionPossible(schema: Schema): boolean {
  return schema.etapes.some((_, index) => decrireEtape(schema, index).length > 0)
}
