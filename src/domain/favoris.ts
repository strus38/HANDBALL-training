/**
 * Favoris : les fiches que l'entraineur veut retrouver vite.
 *
 * Un favori n'est pas une note. La note est un JUGEMENT PORTE APRES USAGE -
 * « cet exercice a bien marche jeudi » - alors que le favori est une INTENTION
 * AVANT USAGE : « celui-la, je le remonterai souvent cette saison ». Les deux
 * repondent a des questions differentes et ne doivent pas etre confondus : on
 * peut mettre en favori une fiche jamais menee, et ne jamais mettre en favori
 * une fiche notee cinq etoiles parce qu'elle ne sert qu'une fois par an.
 *
 * Un favori ne se pose donc pas sur la copie posee dans une seance, mais sur la
 * FICHE DE LA BIBLIOTHEQUE : c'est la qu'on choisit, c'est la qu'il sert. Il
 * est identifie par la meme cle que la liste - la reference stable pour les
 * fiches fournies, l'identifiant pour les fiches de l'entraineur.
 */

/**
 * Nombre maximum de favoris conserves.
 *
 * Un fichier abime, ou une boucle dans une version future, ne doit pas pouvoir
 * remplir le stockage. La limite est haute : elle depasse le catalogue entier,
 * aucun entraineur ne l'atteindra en cochant des etoiles.
 */
export const MAX_FAVORIS = 2000

/** Ajoute la cle si elle est absente, la retire si elle est presente. */
export function basculerFavori(favoris: string[], cle: string): string[] {
  if (!cle) return favoris
  return favoris.includes(cle)
    ? favoris.filter((f) => f !== cle)
    : [...favoris, cle].slice(0, MAX_FAVORIS)
}

export function estFavori(favoris: string[], cle: string): boolean {
  return favoris.includes(cle)
}

/**
 * Relit une liste de favoris de provenance inconnue.
 *
 * Meme discipline que la lecture des seances : ce qui vient d'un fichier ou du
 * stockage n'est pas suppose valide. On garde les chaines non vides, on retire
 * les doublons, et on plafonne.
 */
export function lireFavoris(brut: unknown): string[] {
  if (!Array.isArray(brut)) return []
  const vus = new Set<string>()
  for (const valeur of brut) {
    if (typeof valeur !== 'string') continue
    const cle = valeur.trim()
    if (cle) vus.add(cle)
    if (vus.size >= MAX_FAVORIS) break
  }
  return [...vus]
}

/**
 * Traduit des favoris apres une restauration de sauvegarde.
 *
 * Le piege que cette fonction desamorce : restaurer une sauvegarde ne remplace
 * rien, elle AJOUTE son contenu, et donne pour cela de nouveaux identifiants
 * aux fiches personnelles. Un favori pose sur une fiche personnelle designerait
 * donc, apres restauration, un identifiant qui n'existe plus - et l'entraineur
 * retrouverait ses seances mais perdrait la moitie de ses etoiles sans qu'on
 * lui dise rien.
 *
 * Les favoris poses sur les fiches FOURNIES n'ont pas ce probleme : leur
 * reference est stable, elle n'est pas renouvelee. Ils traversent tels quels.
 */
export function retracerFavoris(
  favoris: string[],
  correspondances: Map<string, string>,
): string[] {
  return favoris.map((cle) => correspondances.get(cle) ?? cle)
}

/** Fusionne deux listes de favoris sans doublon, dans l'ordre d'apparition. */
export function fusionnerFavoris(actuels: string[], ajoutes: string[]): string[] {
  return lireFavoris([...actuels, ...ajoutes])
}
