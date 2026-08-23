/**
 * Deroulement reel d'une seance, en mode terrain.
 *
 * Le principe qui commande tout ce fichier : l'horaire est ancre sur l'heure
 * REELLE de debut, pas sur un compte a rebours qui repart a zero a chaque
 * exercice. Un minuteur par exercice ment - il affiche toujours quinze minutes
 * disponibles, meme quand la seance a vingt minutes de retard et qu'il faudra
 * sauter le dernier atelier. En calant chaque exercice sur un creneau absolu,
 * l'entraineur voit son retard s'accumuler pendant qu'il a encore le temps d'y
 * faire quelque chose.
 *
 * Les durees prevues ne sont jamais modifiees. Ce qui s'est reellement passe
 * est releve A COTE du plan, pour qu'on puisse comparer les deux apres coup.
 */

import type { Exercice } from './types'

export interface Creneau {
  /** Millisecondes depuis l'epoque : debut du creneau. */
  debut: number
  /** Millisecondes depuis l'epoque : fin prevue du creneau. */
  fin: number
  /** Duree prevue, en minutes. */
  dureePrevue: number
}

const MINUTE = 60_000

/**
 * Repartit les exercices en creneaux successifs a partir de l'heure de debut.
 *
 * Les creneaux s'enchainent sans trou : la fin de l'un est le debut du suivant.
 * On ne prevoit pas de pause, l'entraineur les met dans ses exercices.
 */
export function planifier(exercices: Exercice[], debut: number): Creneau[] {
  const creneaux: Creneau[] = []
  let curseur = debut
  for (const exercice of exercices) {
    const duree = Math.max(0, exercice.duree)
    const fin = curseur + duree * MINUTE
    creneaux.push({ debut: curseur, fin, dureePrevue: duree })
    curseur = fin
  }
  return creneaux
}

/**
 * Minutes restantes sur un creneau, negatives en cas de retard.
 *
 * Le signe est porteur : c'est lui qui distingue « il reste 4 minutes » de
 * « on a 4 minutes de retard ». Arrondir vers le haut en avance et vers le bas
 * en retard donnerait « 0 minute restante » pendant une minute entiere ; on
 * arrondit donc dans le meme sens des deux cotes.
 */
export function minutesRestantes(creneau: Creneau | undefined, maintenant: number): number {
  if (!creneau) return 0
  return Math.round((creneau.fin - maintenant) / MINUTE)
}

/**
 * Ecart entre l'heure qu'il est et l'heure ou l'on devrait en etre.
 *
 * Positif = en retard, negatif = en avance. On le mesure sur le DEBUT du
 * creneau en cours : si l'exercice 3 devait commencer a 19h40 et qu'il est
 * 19h47, la seance a sept minutes de retard, quoi qu'il arrive ensuite.
 */
export function derive(creneau: Creneau | undefined, maintenant: number): number {
  if (!creneau) return 0
  return Math.round((maintenant - creneau.debut) / MINUTE)
}

/** Heure de fin prevue de la seance entiere, ou l'heure de debut si elle est vide. */
export function finPrevue(creneaux: Creneau[], debut: number): number {
  return creneaux.length > 0 ? creneaux[creneaux.length - 1].fin : debut
}

/** HH:MM sur 24 heures, dans le fuseau de la machine. */
export function heure(instant: number): string {
  const date = new Date(instant)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

/**
 * Phrase courte decrivant le temps restant sur l'exercice en cours.
 *
 * Elle est ecrite pour etre lue d'un coup d'oeil, a bout de bras, dans un
 * gymnase : pas de decimales, pas de secondes, et le mot « retard » en clair
 * plutot qu'un nombre negatif qu'il faudrait interpreter.
 */
export function phraseReste(minutes: number): string {
  if (minutes > 1) return `${minutes} min restantes`
  if (minutes === 1) return '1 min restante'
  if (minutes === 0) return "c'est l'heure"
  if (minutes === -1) return '1 min de retard'
  return `${-minutes} min de retard`
}

/** Phrase decrivant l'avance ou le retard general de la seance. */
export function phraseDerive(minutes: number): string {
  if (minutes >= 2) return `${minutes} min de retard`
  if (minutes <= -2) return `${-minutes} min d'avance`
  return 'a l\u2019heure'
}

/**
 * Minutes reellement passees sur un exercice.
 *
 * Zero minute n'est pas une mesure : on ne retient rien en dessous de la
 * minute, pour ne pas remplir les fiches de « 0 min » quand l'entraineur
 * feuillette sa seance sans la mener.
 */
export function dureeMesuree(depuis: number, maintenant: number): number | undefined {
  const minutes = Math.round((maintenant - depuis) / MINUTE)
  return minutes >= 1 ? minutes : undefined
}
