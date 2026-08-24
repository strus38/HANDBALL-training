/**
 * Fiches fournies masquees : la bibliotheque de base, nettoyee par l'entraineur.
 *
 * Les fiches fournies ne s'effacent pas — elles font partie de l'application,
 * et une nouvelle version du fichier les ramenerait de toute facon. Masquer est
 * donc le bon geste : la fiche disparait de la liste, mais reste retrouvable et
 * se retablit d'un clic. Rien n'est perdu, et l'entraineur peut tailler la
 * bibliotheque a la mesure de son groupe sans craindre le geste.
 *
 * Une fiche masquee est designee par sa REFERENCE stable, jamais par son titre :
 * c'est la meme cle que les favoris et l'historique d'utilisation, et elle
 * survit aux nouvelles versions de l'application.
 *
 * La forme des donnees est exactement celle des favoris — une liste de cles
 * stables, a assainir, plafonner et fusionner de la meme facon. Les fonctions
 * sont donc les memes ; seul le sens differe, et c'est le nom qui le porte.
 */

import { basculerFavori, fusionnerFavoris, lireFavoris } from './favoris'

/** Masque la reference si elle est visible, la retablit si elle est masquee. */
export function basculerMasquee(masquees: string[], ref: string): string[] {
  return basculerFavori(masquees, ref)
}

export function estMasquee(masquees: string[], ref: string): boolean {
  return masquees.includes(ref)
}

/** Relit une liste de provenance inconnue : chaines non vides, sans doublon. */
export function lireMasquees(brut: unknown): string[] {
  return lireFavoris(brut)
}

/** Fusionne deux listes sans doublon — la restauration AJOUTE, comme partout. */
export function fusionnerMasquees(actuelles: string[], ajoutees: string[]): string[] {
  return fusionnerFavoris(actuelles, ajoutees)
}
