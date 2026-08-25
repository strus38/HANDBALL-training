/**
 * Le materiel d'une seance : ce qu'on charge dans le coffre.
 *
 * Chaque exercice declare le sien. La seance a besoin de la liste consolidee —
 * « 12 plots, 6 ballons, 4 haies, chasubles » — et c'est une addition moins
 * evidente qu'il n'y parait.
 *
 * ON NE FAIT PAS LA SOMME, ON PREND LE MAXIMUM. Les exercices se suivent : si
 * le troisieme demande 12 plots et le septieme 8, on en charge 12, pas 20. La
 * somme ferait porter a l'entraineur huit plots dont il n'aura jamais besoin en
 * meme temps — et sur une saison, c'est le genre de detail qui fait qu'on
 * cesse de regarder la liste.
 *
 * SAUF POUR CE QUI SE MENE EN PARALLELE. Un exercice marque « en parallele »
 * se deroule PENDANT un autre, typiquement les gardiens a l'ecart : son
 * materiel s'ajoute au plus gros des exercices sequentiels, puisqu'il faut les
 * deux sur le terrain au meme moment. C'est la meme regle que pour la duree
 * totale, et pour la meme raison.
 *
 * LES RATIOS NE SE COMPTENT PAS. « 1 ballon pour 2 joueurs » ne veut pas dire
 * un ballon : c'est une regle de repartition, et son « 1 » n'est pas un
 * nombre d'objets. Additionner ou maximiser ces articles-la produirait
 * « 5 ballons pour 2 joueurs », qui ne veut rien dire. Ils sont donc listes
 * tels quels, une seule fois.
 */

import type { Exercice } from './types'

export interface ArticleMateriel {
  /**
   * Quantite a emporter. Absente pour ce qui ne se compte pas — « chasubles »,
   * « 1 ballon pour 2 joueurs ».
   */
  nombre?: number
  /** Ce qui s'affiche : « plots », « ballon pour 2 joueurs ». */
  libelle: string
}

/**
 * Un article dont le nombre est une REGLE et non une quantite.
 *
 * « pour » et « par » introduisent une repartition : un ballon pour deux
 * joueurs, un ballon par arriere. Le nombre qui precede ne se totalise pas.
 */
const EST_RATIO = /\b(?:pour|par)\b/i

/** Cle de regroupement : sans accent, en minuscules, au singulier. */
function cle(libelle: string): string {
  return libelle
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/(?:s|x)$/, '')
}

/**
 * Accorde le libelle au nombre.
 *
 * Le cahier ecrit « 8 plots » et « 1 plot » : une fois regroupes, il faut
 * choisir. On repart du singulier et on remet la marque du pluriel, plutot que
 * de garder au hasard la forme du premier exercice rencontre.
 */
function accorder(libelle: string, nombre: number): string {
  const singulier = libelle.replace(/(?:s|x)$/, '')
  if (nombre <= 1) return singulier
  return /(?:s|x|z)$/.test(singulier) ? singulier : `${singulier}s`
}

interface Compte {
  /** Le plus gros besoin parmi les exercices qui se suivent. */
  maximum: number
  /** Ce que reclament, en plus, les exercices menes en meme temps. */
  parallele: number
  /** Libelle d'origine, pour l'affichage. */
  libelle: string
}

/** Decoupe « 12 plots » en nombre et libelle. Rend undefined pour un ratio. */
function lireArticle(brut: string): { nombre: number; libelle: string } | undefined {
  const m = /^(\d+)\s+(.+)$/.exec(brut.trim())
  if (!m) return undefined
  if (EST_RATIO.test(m[2])) return undefined
  return { nombre: Number(m[1]), libelle: m[2].trim() }
}

/**
 * Materiel consolide d'une liste d'exercices.
 *
 * Les articles comptables viennent d'abord, du plus nombreux au moins nombreux
 * — c'est l'ordre dans lequel on charge un coffre. Les articles sans nombre
 * ferment la liste, en ordre alphabetique.
 */
export function consoliderMateriel(exercices: Exercice[]): ArticleMateriel[] {
  const comptes = new Map<string, Compte>()
  const sansNombre = new Set<string>()

  for (const exercice of exercices) {
    // Un meme exercice peut citer deux fois le meme objet : on ne retient que
    // son plus gros besoin, sinon il se ferait concurrence a lui-meme.
    const besoins = new Map<string, { nombre: number; libelle: string }>()
    for (const brut of exercice.materiel) {
      const article = lireArticle(brut)
      if (!article) {
        const propre = brut.trim()
        if (propre) sansNombre.add(propre)
        continue
      }
      const k = cle(article.libelle)
      const deja = besoins.get(k)
      if (!deja || article.nombre > deja.nombre) besoins.set(k, article)
    }

    for (const [k, besoin] of besoins) {
      const compte = comptes.get(k) ?? { maximum: 0, parallele: 0, libelle: besoin.libelle }
      if (exercice.enParallele) compte.parallele += besoin.nombre
      else compte.maximum = Math.max(compte.maximum, besoin.nombre)
      comptes.set(k, compte)
    }
  }

  const comptables = [...comptes.values()]
    .map((c) => ({ nombre: c.maximum + c.parallele, libelle: c.libelle }))
    .filter((a) => a.nombre > 0)
    .map((a) => ({ nombre: a.nombre, libelle: accorder(a.libelle, a.nombre) }))
    .sort((a, b) => b.nombre - a.nombre || a.libelle.localeCompare(b.libelle, 'fr'))

  const autres = [...sansNombre]
    .sort((a, b) => a.localeCompare(b, 'fr'))
    .map((libelle) => ({ libelle }))

  return [...comptables, ...autres]
}

/** La liste en une ligne : « 12 plots, 6 ballons, chasubles ». */
export function libelleMateriel(articles: ArticleMateriel[]): string {
  return articles
    .map((a) => (a.nombre === undefined ? a.libelle : `${a.nombre} ${a.libelle}`))
    .join(', ')
}
