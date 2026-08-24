/**
 * Historique d'utilisation des exercices, agrege sur toutes les seances.
 *
 * Pourquoi ce module existe : l'historique ne vit pas sur la fiche, il vit sur
 * les COPIES. Ajouter une fiche de la bibliotheque a une seance en fabrique un
 * exemplaire independant, et c'est lui qu'on marque comme realise. Une fiche
 * fournie affiche donc toujours zero si on la regarde seule, alors que
 * l'entraineur l'a menee dix fois.
 *
 * On reconstitue le compte en parcourant les seances et en regroupant les
 * copies. La cle de regroupement est la REFERENCE de la fiche d'origine quand
 * elle existe - c'est ce qui resiste au renommage - et le titre normalise
 * sinon, pour les fiches creees de zero.
 */

import type { Exercice, Seance } from './types'

export interface Utilisation {
  /** Nombre total de fois que l'exercice a ete marque comme realise. */
  fois: number
  /** Date ISO courte de la derniere fois, vide si jamais realise. */
  derniere: string
}

/**
 * Cle de regroupement d'un exercice.
 *
 * La reference d'abord : un exercice issu de la bibliotheque reste le meme
 * exercice meme si l'entraineur le renomme dans sa seance. A defaut, le titre
 * normalise - sans casse ni accents - pour que « Croise arriere » et
 * « croisé arrière » comptent ensemble.
 */
export function cleUtilisation(exercice: Exercice): string {
  if (exercice.refModele) return exercice.refModele
  const titre = exercice.titre
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
  return 'titre:' + (titre || 'sans titre')
}

/** Index de toutes les utilisations, pret a etre interroge par cle. */
export function indexerUtilisations(seances: Seance[]): Map<string, Utilisation> {
  const index = new Map<string, Utilisation>()

  for (const seance of seances) {
    for (const exercice of seance.exercices) {
      // Deux sources disent qu un exercice a ete mene : le bouton
      // « Marquer comme realise » de la fiche, et la case cochee en mode
      // terrain. On prend le MAXIMUM, pas la somme : une copie posee dans
      // une seance est UNE occurrence, et cocher sur le terrain ce qu on
      // avait deja marque a la main la compterait deux fois.
      const fois = Math.max(exercice.evaluation.nombreUtilisations, exercice.deroule?.fait ? 1 : 0)
      if (fois <= 0) continue

      const cle = cleUtilisation(exercice)
      const deja = index.get(cle)
      // Une case cochee sur le terrain date de la SEANCE : c est ce jour-la
      // qu on l a menee, meme si on ouvre le releve le lendemain.
      const marquee = exercice.evaluation.derniereUtilisation
      const surLeTerrain = exercice.deroule?.fait ? seance.date || '' : ''
      const derniere = marquee > surLeTerrain ? marquee : surLeTerrain
      index.set(cle, {
        fois: (deja?.fois ?? 0) + fois,
        // Les dates sont au format AAAA-MM-JJ : l'ordre alphabetique est
        // l'ordre chronologique, pas besoin de les convertir.
        derniere: derniere > (deja?.derniere ?? '') ? derniere : (deja?.derniere ?? ''),
      })
    }
  }

  return index
}

/** AAAA-MM-JJ vers JJ/MM/AAAA, ou chaine vide si la date est absente. */
export function dateCourte(iso: string): string {
  const parties = iso.split('-')
  return parties.length === 3 ? `${parties[2]}/${parties[1]}/${parties[0]}` : ''
}

/**
 * Phrase courte a poser sous un exercice, ou undefined s'il n'a jamais servi.
 *
 * Volontairement muette dans ce cas : afficher « jamais utilise » sur les
 * dizaines de fiches qu'on n'a pas encore menees remplirait la liste d'un
 * bruit qui n'aide a rien.
 */
export function resumeUtilisation(utilisation: Utilisation | undefined): string | undefined {
  if (!utilisation || utilisation.fois <= 0) return undefined
  const fois = utilisation.fois === 1 ? 'Menée 1 fois' : `Menée ${utilisation.fois} fois`
  const date = dateCourte(utilisation.derniere)
  return date ? `${fois}, la dernière le ${date}` : fois
}
