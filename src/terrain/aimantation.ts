/**
 * Aimantation : le geste reste approximatif, l'application est precise.
 *
 * Un entraineur pose un joueur « sur les 9 metres » ou « au poste d'ailier ».
 * Il n'a pas a viser au centimetre : le point lache pres d'un repere connu s'y
 * accroche. Les reperes sont ceux du handball — les deux lignes de surface, les
 * postes d'attaque, l'axe du terrain — et non une grille arbitraire.
 */

import { REPERES } from './geometrie'
import { TERRAIN, type Position } from '../domain/types'

/** Distance d'attraction d'un poste, en metres. */
const PORTEE_POSTE = 0.95

/** Distance d'attraction d'une ligne. */
const PORTEE_LIGNE = 0.6

/** Distance d'attraction de l'axe median. */
const PORTEE_AXE = 0.4

export interface Repere {
  position: Position
  /** Libelle affiche pendant le glisser : « 9 m », « poste de pivot »... */
  libelle: string
}

/** Poste d'attaque de reference, face au but de droite. */
interface Poste {
  nom: string
  x: number
  y: number
}

const POSTES_DROITE: Poste[] = [
  { nom: 'ailier gauche', x: 36.5, y: 18.3 },
  { nom: 'arriere gauche', x: 31.5, y: 14.5 },
  { nom: 'demi-centre', x: 30.5, y: 10 },
  { nom: 'arriere droit', x: 31.5, y: 5.5 },
  { nom: 'ailier droit', x: 36.5, y: 1.7 },
  { nom: 'pivot', x: 34.6, y: 10 },
]

/** Les memes postes face au but de gauche, obtenus par symetrie. */
const POSTES_GAUCHE: Poste[] = POSTES_DROITE.map((p) => ({
  nom: p.nom,
  x: TERRAIN.longueur - p.x,
  y: p.y,
}))

const TOUS_LES_POSTES = [...POSTES_DROITE, ...POSTES_GAUCHE]

const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.y - b.y)

/**
 * Projette un point sur une ligne concentrique au but (surface ou jet franc).
 *
 * Entre les deux poteaux, la ligne est droite : la projection est horizontale.
 * Au dela, elle est circulaire autour du poteau le plus proche.
 */
export function projeterSurLigne(point: Position, rayon: number, cote: 'gauche' | 'droite'): Position {
  const xBut = cote === 'droite' ? TERRAIN.longueur : 0
  const sens = cote === 'droite' ? -1 : 1

  if (point.y >= REPERES.POTEAU_BAS && point.y <= REPERES.POTEAU_HAUT) {
    return { x: xBut + sens * rayon, y: point.y }
  }

  const poteau = {
    x: xBut,
    y: point.y < REPERES.POTEAU_BAS ? REPERES.POTEAU_BAS : REPERES.POTEAU_HAUT,
  }
  const dx = point.x - poteau.x
  const dy = point.y - poteau.y
  const norme = Math.hypot(dx, dy) || 1
  return { x: poteau.x + (dx / norme) * rayon, y: poteau.y + (dy / norme) * rayon }
}

export interface OptionsAimantation {
  /** Aimantation desactivee : le point est rendu tel quel. */
  active?: boolean
  /** Postes ignores : utile pour placer librement plots et materiel. */
  sansPostes?: boolean
}

/**
 * Accroche un point au repere le plus proche, s'il y en a un a portee.
 *
 * Les postes l'emportent sur les lignes, et les lignes sur l'axe : un poste est
 * un endroit precis, une ligne seulement une contrainte, l'axe un simple
 * confort de mise au propre.
 */
export function aimanter(point: Position, options: OptionsAimantation = {}): Repere | undefined {
  if (options.active === false) return undefined

  if (!options.sansPostes) {
    let meilleur: { poste: Poste; ecart: number } | undefined
    for (const poste of TOUS_LES_POSTES) {
      const ecart = distance(point, poste)
      if (ecart <= PORTEE_POSTE && (!meilleur || ecart < meilleur.ecart)) {
        meilleur = { poste, ecart }
      }
    }
    if (meilleur) {
      return {
        position: { x: meilleur.poste.x, y: meilleur.poste.y },
        libelle: `poste : ${meilleur.poste.nom}`,
      }
    }
  }

  let ligne: { position: Position; libelle: string; ecart: number } | undefined
  for (const cote of ['droite', 'gauche'] as const) {
    for (const [rayon, libelle] of [
      [REPERES.rayonSurface, '6 m'],
      [REPERES.rayonJetFranc, '9 m'],
    ] as const) {
      const projete = projeterSurLigne(point, rayon, cote)
      const ecart = distance(point, projete)
      if (ecart <= PORTEE_LIGNE && (!ligne || ecart < ligne.ecart)) {
        ligne = { position: projete, libelle, ecart }
      }
    }
  }
  if (ligne) return { position: ligne.position, libelle: ligne.libelle }

  const axe = TERRAIN.largeur / 2
  if (Math.abs(point.y - axe) <= PORTEE_AXE) {
    return { position: { x: point.x, y: axe }, libelle: 'axe du terrain' }
  }

  return undefined
}

/** Point aimante, ou le point d'origine si rien n'est a portee. */
export function positionAimantee(point: Position, options?: OptionsAimantation): Position {
  return aimanter(point, options)?.position ?? point
}
