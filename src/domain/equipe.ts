/**
 * Mon equipe : celle que l'entraineur suit toute la saison.
 *
 * Un entraineur n'a qu'une equipe. Lui redemander laquelle a chaque seance,
 * c'est lui faire remplir trente fois la meme reponse — et, en pratique, lui
 * faire laisser le champ vide, ce qui vide de son sens l'en-tete des feuilles
 * imprimees. La question se pose donc UNE FOIS, et la reponse se range ici.
 *
 * Meme nature que les favoris et les fiches masquees : une preference de
 * l'entraineur, pas une donnee de seance. Meme rangement, donc, dans le
 * magasin des preferences, a part des seances.
 *
 * Mais la preference ne REMPLACE pas les champs de la seance : elle les
 * PRE-REMPLIT a la creation. Trois raisons de garder la copie sur la seance :
 *
 * - une seance exportee reste auto-descriptive, celui qui la recoit sait pour
 *   qui elle avait ete ecrite ;
 * - une seance de novembre garde son « U15 » si l'entraineur change d'equipe en
 *   janvier — une preference relue a l'affichage reecrirait l'histoire ;
 * - aucun fichier .hbt.json existant ne change de forme.
 */

export interface MonEquipe {
  /** Nom de l'equipe — « Seniors garcons ». */
  equipe: string
  /** Categorie d'age — « +18 ans ». */
  categorieAge: string
}

/** Aucune equipe renseignee : l'etat au premier lancement. */
export const AUCUNE_EQUIPE: MonEquipe = { equipe: '', categorieAge: '' }

/**
 * Longueur maximale de chaque champ.
 *
 * Ces deux chaines s'affichent dans l'en-tete de l'application et sur chaque
 * feuille imprimee : au-dela, elles debordent. Le plafond protege aussi le
 * stockage d'un fichier abime.
 */
export const MAX_LONGUEUR_EQUIPE = 60

/**
 * Relit une equipe de provenance inconnue.
 *
 * Meme discipline que partout ailleurs : ce qui vient d'un fichier ou du
 * stockage n'est pas suppose valide.
 */
export function lireMonEquipe(brut: unknown): MonEquipe {
  if (typeof brut !== 'object' || brut === null || Array.isArray(brut)) return AUCUNE_EQUIPE
  const objet = brut as Record<string, unknown>
  const champ = (valeur: unknown) =>
    typeof valeur === 'string' ? valeur.trim().slice(0, MAX_LONGUEUR_EQUIPE) : ''
  return { equipe: champ(objet.equipe), categorieAge: champ(objet.categorieAge) }
}

/** Vrai des qu'un des deux champs porte quelque chose. */
export function equipeRenseignee(equipe: MonEquipe): boolean {
  return equipe.equipe !== '' || equipe.categorieAge !== ''
}

/**
 * Libelle d'affichage : « Seniors garcons · +18 ans », ou l'un des deux seul.
 *
 * Prend aussi bien une preference qu'une seance : les deux portent les memes
 * champs, et c'est justement ce qui permet a la seance de garder sa copie.
 */
export function libelleEquipe(equipe: MonEquipe): string {
  return [equipe.equipe, equipe.categorieAge].filter(Boolean).join(' · ')
}

/** Vrai si la seance porte une autre equipe que celle de l'entraineur. */
export function equipeInhabituelle(seance: MonEquipe, mienne: MonEquipe): boolean {
  if (!equipeRenseignee(seance)) return false
  return seance.equipe !== mienne.equipe || seance.categorieAge !== mienne.categorieAge
}
