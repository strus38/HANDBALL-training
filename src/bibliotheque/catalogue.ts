/**
 * Le catalogue complet des fiches fournies.
 *
 * Ce module existe pour une raison precise : la liste vivait dans le composant
 * de la bibliotheque, et les tests, qui ne peuvent pas importer un composant
 * React, en RECOPIAIENT une seconde. Ajouter un fichier de fiches d'un cote
 * sans y penser de l'autre laissait donc des fiches entierement hors tests -
 * sans erreur, sans avertissement, et sans que rien ne le signale. C'est
 * exactement ce qui vient d'arriver aux combinaisons.
 *
 * Une seule liste, importee des deux cotes : le probleme ne peut plus se poser.
 */

import { SENIORS_MASCULINS } from './seniorsMasculins'
import { GARDIENS } from './gardiens'
import { SANS_BALLON } from './sansBallon'
import { FICHES_CLUB } from '@club/fiches'
import { COMBINAISONS } from './combinaisons'
import type { ModeleExercice } from './modeles'

/**
 * Le fonds commun : les fiches que tout club recoit.
 *
 * Separe des fiches du club parce que les deux n'ont pas la meme duree de vie.
 * Le fonds commun evolue avec l'application ; les fiches d'un club lui
 * appartiennent et ne partent qu'avec son profil.
 */
export const FONDS_COMMUN: ModeleExercice[] = [
  ...SENIORS_MASCULINS,
  ...GARDIENS,
  ...SANS_BALLON,
  ...COMBINAISONS,
]

/**
 * Ce que la bibliotheque affiche : le fonds commun, plus les fiches du club
 * pour lequel cet exemplaire a ete fabrique. La plupart des clubs n'en ont
 * aucune et voient donc le seul fonds commun.
 */
export const CATALOGUE: ModeleExercice[] = [...FONDS_COMMUN, ...FICHES_CLUB]

/**
 * References des combinaisons nommees.
 *
 * Un ensemble de references, et non un champ porte par chaque copie posee dans
 * une seance : le filtre ne vit que dans la bibliotheque, la ou les modeles
 * sont disponibles. Rien n'a donc a traverser le stockage ni la liste blanche
 * de relecture des fichiers.
 */
export const REFS_COMBINAISONS: ReadonlySet<string> = new Set(
  CATALOGUE.filter((m) => m.combinaison).map((m) => m.ref),
)
