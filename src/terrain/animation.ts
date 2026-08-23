/**
 * Lecture animee d'un exercice : les jetons glissent d'une etape a la suivante.
 *
 * C'est ce qui rend les etapes utiles devant un groupe : au lieu de decrire le
 * mouvement, l'entraineur le montre.
 */

import type { Etape, Position } from '../domain/types'

/** Duree d'une transition entre deux etapes, en millisecondes. */
export const DUREE_TRANSITION = 1400

/** Temps d'arret sur chaque etape avant de repartir. */
export const DUREE_PAUSE = 700

/**
 * Interpolation angulaire par le plus court chemin.
 *
 * Un joueur qui passe de 350 a 10 degres doit tourner de 20 degres vers la
 * droite, pas de 340 degres vers la gauche.
 */
export function interpolerAngle(depart: number, arrivee: number, t: number): number {
  let ecart = ((arrivee - depart + 540) % 360) - 180
  return (depart + ecart * t + 360) % 360
}

/** Adoucit le depart et l'arrivee : le mouvement parait naturel. */
export function adoucir(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

/**
 * Etape intermediaire entre deux etapes, pour une progression t de 0 a 1.
 *
 * Les fleches affichees restent celles de l'etape de depart : ce sont elles qui
 * annoncent le mouvement en cours.
 */
export function interpolerEtape(depart: Etape, arrivee: Etape, t: number): Etape {
  const progression = adoucir(Math.min(1, Math.max(0, t)))
  const positions: Record<string, Position> = {}

  for (const [id, avant] of Object.entries(depart.positions)) {
    const apres = arrivee.positions[id]
    if (!apres) {
      // Le jeton n'existe plus a l'etape suivante : il reste ou il etait.
      positions[id] = avant
      continue
    }
    positions[id] = {
      x: avant.x + (apres.x - avant.x) * progression,
      y: avant.y + (apres.y - avant.y) * progression,
      orientation:
        avant.orientation === undefined && apres.orientation === undefined
          ? undefined
          : interpolerAngle(avant.orientation ?? 0, apres.orientation ?? 0, progression),
    }
  }

  // Un jeton apparu a l'etape suivante est place directement a sa position.
  for (const [id, apres] of Object.entries(arrivee.positions)) {
    if (!(id in positions)) positions[id] = apres
  }

  return { ...depart, positions, fleches: progression < 0.98 ? depart.fleches : arrivee.fleches }
}

/**
 * Position dans la lecture a un instant donne.
 *
 * Renvoie l'indice de l'etape de depart et la progression vers la suivante.
 * Au dela de la derniere etape, la lecture est terminee.
 */
export function avancement(
  temps: number,
  nombreEtapes: number,
): { index: number; progression: number; termine: boolean } {
  const cycle = DUREE_TRANSITION + DUREE_PAUSE
  const index = Math.floor(temps / cycle)
  if (index >= nombreEtapes - 1) return { index: nombreEtapes - 1, progression: 1, termine: true }
  const dansLeCycle = temps - index * cycle
  return {
    index,
    progression: Math.min(1, dansLeCycle / DUREE_TRANSITION),
    termine: false,
  }
}

/**
 * Etape que la barre de puces doit mettre en avant pendant la lecture.
 *
 * Ce n'est pas toujours `avancement().index`. Un cycle vaut une transition
 * PUIS une pause : pendant la pause, les jetons sont deja arrives sur l'etape
 * suivante alors que l'indice, lui, n'a pas encore change. Suivre l'indice brut
 * afficherait « 1 » en jaune alors que le terrain montre l'etape 2, immobile.
 *
 * On met donc en avant l'etape de DEPART tant que les jetons se deplacent, et
 * l'etape d'ARRIVEE des qu'ils s'y posent. La puce raconte alors exactement ce
 * que le terrain montre.
 */
export function etapeMiseEnAvant(
  etat: { index: number; progression: number },
  nombreEtapes: number,
): number {
  if (etat.progression < 1) return etat.index
  return Math.min(etat.index + 1, nombreEtapes - 1)
}
