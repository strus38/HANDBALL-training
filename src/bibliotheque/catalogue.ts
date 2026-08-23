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
import { HBPSM } from './hbpsm'
import { COMBINAISONS } from './combinaisons'
import type { ModeleExercice } from './modeles'

export const CATALOGUE: ModeleExercice[] = [
  ...SENIORS_MASCULINS,
  ...GARDIENS,
  ...SANS_BALLON,
  ...HBPSM,
  ...COMBINAISONS,
]

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
