/**
 * Trace des fleches de mouvement, dans la notation courante du handball.
 *
 *   course   trait plein          deplacement du joueur
 *   passe    trait pointille      trajectoire du ballon
 *   dribble  trait ondule         le porteur avance en dribblant
 *   tir      trait double epais   tir au but
 *   ecran    barre en T           ecran ou blocage, sans pointe de fleche
 *   rotation trait fin en tirets  « puis va au fond de la colonne »
 *
 * La rotation porte une pointe OUVERTE — deux traits, pas un triangle plein.
 * Elle ne raconte pas une action de l'exercice mais sa regle de fonctionnement,
 * et cette difference doit se voir d'un coup d'oeil sur un schema charge.
 *
 * Tout est calcule en coordonnees ECRAN : les fonctions recoivent des points
 * deja convertis par versEcran().
 */

import { versEcran } from './geometrie'
import type { FlecheResolue, Position } from '../domain/types'

export interface TraceFleche {
  /** Ligne principale. */
  corps: string
  /** Pointe de fleche, ou barre du T pour un ecran. */
  fin: string
  /** Deuxieme trait, uniquement pour le tir. */
  doublure?: string
  /** Milieu de la courbe : poignee de courbure quand la fleche est selectionnee. */
  milieu: Position
}

const arrondi = (v: number) => Math.round(v * 1000) / 1000

/** Point d'une courbe quadratique pour t entre 0 et 1. */
function pointCourbe(a: Position, c: Position, b: Position, t: number): Position {
  const u = 1 - t
  return {
    x: u * u * a.x + 2 * u * t * c.x + t * t * b.x,
    y: u * u * a.y + 2 * u * t * c.y + t * t * b.y,
  }
}

/** Tangente a la courbe, normalisee. */
function tangente(a: Position, c: Position, b: Position, t: number): Position {
  const dx = 2 * (1 - t) * (c.x - a.x) + 2 * t * (b.x - c.x)
  const dy = 2 * (1 - t) * (c.y - a.y) + 2 * t * (b.y - c.y)
  const norme = Math.hypot(dx, dy) || 1
  return { x: dx / norme, y: dy / norme }
}

/**
 * Trace complet d'une fleche.
 *
 * @param epaisseur largeur du trait, en metres, pour dimensionner la pointe.
 */
export function tracerFleche(fleche: FlecheResolue, epaisseur = 0.16): TraceFleche {
  const a = versEcran(fleche.depart)
  const b = versEcran(fleche.arrivee)
  // Sans point de controle, la courbe quadratique passe par le milieu du
  // segment : la fleche est alors une droite.
  const c = fleche.courbure
    ? versEcran(fleche.courbure)
    : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }

  const longueur = Math.hypot(b.x - a.x, b.y - a.y)
  const tailleFin = Math.max(0.45, epaisseur * 3.4)

  // La ligne s'arrete avant l'extremite pour laisser la place a la pointe.
  const tArret = longueur > 0 ? Math.max(0, 1 - tailleFin / longueur) : 1
  const arret = pointCourbe(a, c, b, tArret)
  const dir = tangente(a, c, b, 1)

  const corps =
    fleche.type === 'dribble'
      ? cheminOndule(a, c, arret, epaisseur)
      : `M ${arrondi(a.x)} ${arrondi(a.y)} Q ${arrondi(c.x)} ${arrondi(c.y)} ${arrondi(arret.x)} ${arrondi(arret.y)}`

  return {
    corps,
    fin:
      fleche.type === 'ecran'
        ? barreEcran(b, dir, tailleFin)
        : fleche.type === 'rotation'
          ? pointeOuverte(b, dir, tailleFin)
          : pointe(b, dir, tailleFin),
    doublure: fleche.type === 'tir' ? decaler(a, c, arret, epaisseur * 1.5) : undefined,
    milieu: pointCourbe(a, c, b, 0.5),
  }
}

/** Pointe de fleche triangulaire a l'extremite. */
function pointe(bout: Position, dir: Position, taille: number): string {
  const normal = { x: -dir.y, y: dir.x }
  const base = { x: bout.x - dir.x * taille, y: bout.y - dir.y * taille }
  const g = { x: base.x + normal.x * taille * 0.42, y: base.y + normal.y * taille * 0.42 }
  const d = { x: base.x - normal.x * taille * 0.42, y: base.y - normal.y * taille * 0.42 }
  return `M ${arrondi(bout.x)} ${arrondi(bout.y)} L ${arrondi(g.x)} ${arrondi(g.y)} L ${arrondi(d.x)} ${arrondi(d.y)} Z`
}

/**
 * Pointe ouverte : deux traits en V, sans remplissage.
 *
 * C'est la notation habituelle pour ce qui n'est pas une action du jeu — ici la
 * consigne de rotation. Le contraste avec la pointe pleine des courses et des
 * passes se lit sans legende.
 */
function pointeOuverte(bout: Position, dir: Position, taille: number): string {
  const normal = { x: -dir.y, y: dir.x }
  const base = { x: bout.x - dir.x * taille, y: bout.y - dir.y * taille }
  const g = { x: base.x + normal.x * taille * 0.5, y: base.y + normal.y * taille * 0.5 }
  const d = { x: base.x - normal.x * taille * 0.5, y: base.y - normal.y * taille * 0.5 }
  return `M ${arrondi(g.x)} ${arrondi(g.y)} L ${arrondi(bout.x)} ${arrondi(bout.y)} L ${arrondi(d.x)} ${arrondi(d.y)}`
}

/** Barre perpendiculaire : l'ecran arrete la course, il ne la prolonge pas. */
function barreEcran(bout: Position, dir: Position, taille: number): string {
  const normal = { x: -dir.y, y: dir.x }
  const g = { x: bout.x + normal.x * taille * 0.7, y: bout.y + normal.y * taille * 0.7 }
  const d = { x: bout.x - normal.x * taille * 0.7, y: bout.y - normal.y * taille * 0.7 }
  return `M ${arrondi(g.x)} ${arrondi(g.y)} L ${arrondi(d.x)} ${arrondi(d.y)}`
}

/** Trait paralle a la courbe, decale : donne l'aspect double du tir. */
function decaler(a: Position, c: Position, b: Position, ecart: number): string {
  const points: string[] = []
  const pas = 12
  for (let i = 0; i <= pas; i++) {
    const t = i / pas
    const p = pointCourbe(a, c, b, t)
    const d = tangente(a, c, b, t)
    const n = { x: -d.y, y: d.x }
    points.push(`${arrondi(p.x + n.x * ecart)} ${arrondi(p.y + n.y * ecart)}`)
  }
  return `M ${points.join(' L ')}`
}

/** Ondulation reguliere le long de la courbe, pour le dribble. */
function cheminOndule(a: Position, c: Position, b: Position, epaisseur: number): string {
  const longueur = Math.hypot(b.x - a.x, b.y - a.y)
  const amplitude = Math.max(0.22, epaisseur * 1.6)
  // Une ondulation tous les 45 cm environ, avec assez de points pour rester
  // lisse meme sur une fleche courte.
  const ondulations = Math.max(2, Math.round(longueur / 0.45))
  const pas = ondulations * 6
  const points: string[] = []
  for (let i = 0; i <= pas; i++) {
    const t = i / pas
    const p = pointCourbe(a, c, b, t)
    const d = tangente(a, c, b, t)
    const n = { x: -d.y, y: d.x }
    // L'ondulation s'eteint aux deux extremites : depart et arrivee restent nets.
    const attenuation = Math.sin(Math.PI * t)
    const ecart = Math.sin(t * ondulations * Math.PI * 2) * amplitude * attenuation
    points.push(`${arrondi(p.x + n.x * ecart)} ${arrondi(p.y + n.y * ecart)}`)
  }
  return `M ${points.join(' L ')}`
}

/** Distance d'un point a une fleche, en metres : sert a la selectionner au clic. */
export function distanceAFleche(fleche: FlecheResolue, point: Position): number {
  const a = versEcran(fleche.depart)
  const b = versEcran(fleche.arrivee)
  const c = fleche.courbure
    ? versEcran(fleche.courbure)
    : { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
  const cible = versEcran(point)
  let mini = Infinity
  for (let i = 0; i <= 24; i++) {
    const p = pointCourbe(a, c, b, i / 24)
    mini = Math.min(mini, Math.hypot(p.x - cible.x, p.y - cible.y))
  }
  return mini
}
