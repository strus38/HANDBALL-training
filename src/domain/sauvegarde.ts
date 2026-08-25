/**
 * Le filet : savoir quand le travail n'est plus a l'abri.
 *
 * Tout ce que l'entraineur prepare vit dans le stockage de SON navigateur, sur
 * SA machine. Un nettoyage des donnees de navigation, un changement
 * d'ordinateur, une eviction decidee par le navigateur lui-meme, et une saison
 * de preparation disparait. « Sauvegarder tout » ecrit le seul fichier qui
 * survive a cela — encore faut-il y penser, et personne n'y pense.
 *
 * Ce module ne sauvegarde rien. Il repond a une seule question : est-ce que du
 * travail existe aujourd'hui QUI N'EXISTE NULLE PART AILLEURS ?
 *
 * Trois regles, pour que le rappel reste croyable :
 *
 * - on ne rappelle rien quand rien n'a bouge depuis la derniere sauvegarde.
 *   Un bandeau qui s'affiche alors qu'il n'y a rien a perdre apprend a
 *   l'entraineur a ne plus le lire, et le jour ou il compte il sera ignore ;
 * - on laisse passer les deux premieres seances. Au debut on essaie
 *   l'application, on ne lui confie pas encore une saison : reclamer une
 *   sauvegarde des le premier soir, c'est se faire fermer ;
 * - ensuite, on compte en jours ET en travail. Quinze jours sans filet, c'est
 *   deja trois ou quatre entrainements prepares.
 *
 * Le repere enregistre est l'instant ou TOUT le contenu de l'application a ete
 * ecrit dans un fichier. Une restauration ne l'avance donc pas : le fichier
 * relu ne contient pas ce qui etait deja la avant lui.
 */

import type { Seance } from './types'

export interface DerniereSauvegarde {
  /** Instant ISO de la derniere sauvegarde complete. Vide = jamais. */
  faiteLe: string
}

/** L'etat au premier lancement. */
export const JAMAIS_SAUVEGARDE: DerniereSauvegarde = { faiteLe: '' }

/**
 * Nombre de seances a partir duquel on demande une premiere sauvegarde.
 *
 * Deux seances, c'est un essai. Trois, c'est un debut de saison : le travail
 * commence a valoir plus cher que le derangement du rappel.
 */
export const SEANCES_AVANT_PREMIER_RAPPEL = 3

/** Age, en jours, a partir duquel une sauvegarde ne protege plus grand-chose. */
export const DELAI_RAPPEL_JOURS = 14

export type Rappel =
  | { besoin: false }
  | {
      besoin: true
      /** « jamais » : aucun fichier n'existe. « ancienne » : il date trop. */
      motif: 'jamais' | 'ancienne'
      /** Seances modifiees depuis la derniere sauvegarde — ce qui serait perdu. */
      seancesEnJeu: number
      /** Jours ecoules depuis la derniere sauvegarde. 0 si elle n'a jamais eu lieu. */
      jours: number
    }

/**
 * Relit le repere depuis le stockage.
 *
 * Meme discipline que les autres preferences : ce qui vient du stockage n'est
 * pas suppose valide. Une valeur abimee vaut « jamais sauvegarde » — l'etat
 * prudent, celui qui rappelle plutot que celui qui se tait.
 */
export function lireDerniereSauvegarde(brut: unknown): DerniereSauvegarde {
  if (typeof brut !== 'object' || brut === null || Array.isArray(brut)) return JAMAIS_SAUVEGARDE
  const faiteLe = (brut as Record<string, unknown>).faiteLe
  if (typeof faiteLe !== 'string') return JAMAIS_SAUVEGARDE
  const instant = Date.parse(faiteLe)
  return Number.isNaN(instant) ? JAMAIS_SAUVEGARDE : { faiteLe }
}

/** Jours entiers ecoules entre deux instants ISO. */
function joursEntre(debut: string, fin: string): number {
  const millisecondes = Date.parse(fin) - Date.parse(debut)
  if (Number.isNaN(millisecondes) || millisecondes < 0) return 0
  return Math.floor(millisecondes / 86_400_000)
}

/**
 * Faut-il rappeler a l'entraineur de sauvegarder ?
 *
 * `maintenant` est passe en parametre plutot que lu ici : le domaine reste pur,
 * et le test peut se placer a n'importe quelle date sans attendre quinze jours.
 */
export function evaluerSauvegarde(
  derniere: DerniereSauvegarde,
  seances: Seance[],
  maintenant: string,
): Rappel {
  // Une seance modifiee APRES la derniere sauvegarde n'est dans aucun fichier.
  // Comparaison de chaines : les instants ISO se rangent dans l'ordre du temps.
  const seancesEnJeu = seances.filter((seance) => seance.modifieLe > derniere.faiteLe).length
  if (seancesEnJeu === 0) return { besoin: false }

  if (derniere.faiteLe === '') {
    if (seances.length < SEANCES_AVANT_PREMIER_RAPPEL) return { besoin: false }
    return { besoin: true, motif: 'jamais', seancesEnJeu, jours: 0 }
  }

  const jours = joursEntre(derniere.faiteLe, maintenant)
  if (jours < DELAI_RAPPEL_JOURS) return { besoin: false }
  return { besoin: true, motif: 'ancienne', seancesEnJeu, jours }
}

/**
 * Ce que le bandeau raconte.
 *
 * Le message dit ce qui serait perdu, pas ce que l'entraineur aurait du faire.
 * On l'informe, on ne le gronde pas.
 */
export function libelleRappel(rappel: Rappel): string {
  if (!rappel.besoin) return ''
  const seances = `${rappel.seancesEnJeu} séance${rappel.seancesEnJeu > 1 ? 's' : ''}`
  if (rappel.motif === 'jamais') {
    return (
      `Vos ${seances} n’existent que dans ce navigateur. Un nettoyage des données de ` +
      `navigation, un autre ordinateur, et elles sont perdues.`
    )
  }
  return (
    `Votre dernière sauvegarde date de ${rappel.jours} jours, et ${seances} ont changé depuis. ` +
    `Ces modifications n’existent que dans ce navigateur.`
  )
}
