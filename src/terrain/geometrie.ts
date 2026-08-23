/**
 * Geometrie du terrain de handball.
 *
 * Tout est calcule a partir des dimensions officielles declarees dans TERRAIN :
 * aucun trace n'est code en dur. Changer une dimension suffit a redessiner
 * correctement les deux surfaces.
 *
 * Deux reperes coexistent :
 * - le repere METIER, en metres, origine en bas a gauche, y vers le haut,
 *   c'est celui du modele de donnees et celui dans lequel raisonne un entraineur ;
 * - le repere ECRAN (SVG), meme echelle mais y vers le bas.
 * versEcran() et versMetres() sont les deux seuls points de passage entre eux.
 */

import { TERRAIN, type Position, type VueTerrain } from '../domain/types'

const { longueur, largeur, rayonSurface, rayonJetFranc, largeurBut } = TERRAIN

/** Ordonnee des poteaux : le but est centre sur la largeur du terrain. */
const POTEAU_BAS = largeur / 2 - largeurBut / 2
const POTEAU_HAUT = largeur / 2 + largeurBut / 2

export function versEcran(position: Position): Position {
  return { x: position.x, y: largeur - position.y }
}

export function versMetres(position: Position): Position {
  return { x: position.x, y: largeur - position.y }
}

// ------------------------------------------------------------------- Vues

export interface Cadrage {
  viewBox: string
  /** Rapport largeur / hauteur, pour reserver la place a l'ecran. */
  ratio: number
}

/**
 * Zone visible pour chaque vue, en metres, avec une marge autour des lignes.
 * La vue « demi » et la vue « zone » cadrent le but de droite : par convention
 * l'attaque se joue toujours vers la droite, comme sur un tableau blanc.
 */
export function cadrage(vue: VueTerrain): Cadrage {
  const marge = 1
  const boites: Record<VueTerrain, [number, number, number, number]> = {
    complet: [-marge, -marge, longueur + 2 * marge, largeur + 2 * marge],
    demi: [longueur / 2 - marge, -marge, longueur / 2 + 2 * marge, largeur + 2 * marge],
    zone: [longueur - 13, 1, 13 + marge, largeur - 2],
  }
  const [x, y, l, h] = boites[vue]
  return { viewBox: `${x} ${y} ${l} ${h}`, ratio: l / h }
}

/** Bornes de deplacement d'un jeton, en metres (repere metier). */
export function bornes(vue: VueTerrain): { xMin: number; xMax: number; yMin: number; yMax: number } {
  const marge = 1
  const xMin = vue === 'complet' ? -marge : vue === 'demi' ? longueur / 2 - marge : longueur - 13
  return { xMin, xMax: longueur + marge, yMin: -marge, yMax: largeur + marge }
}

// -------------------------------------------------------------- Tracés

/** Un but : 'droite' est celui vers lequel on attaque par convention. */
export type Cote = 'gauche' | 'droite'

/** Abscisse de la ligne de but, en metres. */
function ligneDeBut(cote: Cote): number {
  return cote === 'droite' ? longueur : 0
}

/** Signe de progression vers l'interieur du terrain depuis la ligne de but. */
function sens(cote: Cote): number {
  return cote === 'droite' ? -1 : 1
}

/**
 * Trace d'une ligne concentrique au but : deux quarts de cercle autour des
 * poteaux, relies par un segment droit. C'est la construction officielle de la
 * ligne de surface (6 m) comme de la ligne de jet franc (9 m).
 *
 * Quand le rayon est trop grand, l'arc sortirait du terrain par la ligne de
 * touche : il est alors coupe a l'endroit exact ou il la croise, comme sur les
 * plans officiels.
 */
export function ligneConcentrique(rayon: number, cote: Cote): string {
  const bx = ligneDeBut(cote)
  const s = sens(cote)
  const xDroit = bx + s * rayon

  // Extremite basse : sur la ligne de but si l'arc y arrive, sinon sur la touche.
  const bas = extremite(rayon, POTEAU_BAS, bx, s, 'bas')
  const haut = extremite(rayon, POTEAU_HAUT, bx, s, 'haut')

  const p1 = versEcran(bas)
  const p2 = versEcran({ x: xDroit, y: POTEAU_BAS })
  const p3 = versEcran({ x: xDroit, y: POTEAU_HAUT })
  const p4 = versEcran(haut)

  // En repere ecran l'axe y est inverse : le sens de rotation l'est aussi.
  const balayage = cote === 'droite' ? 1 : 0

  return [
    `M ${f(p1.x)} ${f(p1.y)}`,
    `A ${rayon} ${rayon} 0 0 ${balayage} ${f(p2.x)} ${f(p2.y)}`,
    `L ${f(p3.x)} ${f(p3.y)}`,
    `A ${rayon} ${rayon} 0 0 ${balayage} ${f(p4.x)} ${f(p4.y)}`,
  ].join(' ')
}

/**
 * Point ou l'arc centre sur un poteau quitte le terrain : la ligne de but si
 * l'arc y parvient sans depasser la touche, la ligne de touche sinon.
 */
function extremite(
  rayon: number,
  yPoteau: number,
  xBut: number,
  s: number,
  vers: 'bas' | 'haut',
): Position {
  const yTouche = vers === 'bas' ? 0 : largeur
  const ecart = Math.abs(yPoteau - yTouche)
  if (rayon <= ecart) {
    // L'arc rejoint la ligne de but avant d'atteindre la touche.
    return { x: xBut, y: vers === 'bas' ? yPoteau - rayon : yPoteau + rayon }
  }
  // Intersection du cercle avec la ligne de touche.
  const dx = Math.sqrt(rayon * rayon - ecart * ecart)
  return { x: xBut + s * dx, y: yTouche }
}

/** Segment perpendiculaire a la ligne de but, centre sur le but (7 m, 4 m). */
export function marque(distance: number, cote: Cote, demiLongueur: number): string {
  const x = ligneDeBut(cote) + sens(cote) * distance
  const a = versEcran({ x, y: largeur / 2 - demiLongueur })
  const b = versEcran({ x, y: largeur / 2 + demiLongueur })
  return `M ${f(a.x)} ${f(a.y)} L ${f(b.x)} ${f(b.y)}`
}

/** Rectangle du but vu de dessus, legerement en retrait de la ligne. */
export function but(cote: Cote): { x: number; y: number; largeur: number; hauteur: number } {
  const profondeur = 1
  const xInterieur = cote === 'droite' ? longueur : 0 - profondeur
  const coin = versEcran({ x: xInterieur, y: POTEAU_HAUT })
  return { x: coin.x, y: coin.y, largeur: profondeur, hauteur: largeurBut }
}

/** Ligne mediane. */
export function ligneMediane(): string {
  const a = versEcran({ x: longueur / 2, y: 0 })
  const b = versEcran({ x: longueur / 2, y: largeur })
  return `M ${f(a.x)} ${f(a.y)} L ${f(b.x)} ${f(b.y)}`
}

/**
 * Distance d'un point a la surface de but la plus proche, en metres.
 *
 * Negative a l'interieur de la surface. La surface est l'ensemble des points
 * situes a moins de 6 m du segment de ligne de but compris entre les poteaux :
 * c'est sa definition officielle, et c'est ce qui donne sa forme en gelule.
 *
 * Sert a verifier qu'un joueur de champ n'est pas place dans la surface, ou il
 * n'a pas le droit de se trouver.
 */
export function distanceALaSurface(point: Position): number {
  let mini = Infinity
  for (const cote of ['gauche', 'droite'] as const) {
    const bx = ligneDeBut(cote)
    // Distance au segment vertical [POTEAU_BAS, POTEAU_HAUT] sur la ligne de but.
    const y = Math.min(POTEAU_HAUT, Math.max(POTEAU_BAS, point.y))
    mini = Math.min(mini, Math.hypot(point.x - bx, point.y - y))
  }
  return mini - rayonSurface
}

/** Vrai si le point est dans une surface de but. */
export function dansLaSurface(point: Position, tolerance = 0): boolean {
  return distanceALaSurface(point) < -tolerance
}

/** Arrondi court : les fichiers SVG restent lisibles et legers. */
function f(valeur: number): string {
  return (Math.round(valeur * 1000) / 1000).toString()
}

export const REPERES = { POTEAU_BAS, POTEAU_HAUT, rayonSurface, rayonJetFranc }
