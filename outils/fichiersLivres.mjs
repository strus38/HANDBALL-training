/**
 * Ecrit les chemins de tout ce qui doit sortir de la fabrication, un par ligne.
 *
 * L'assemblage controlait deux chemins ecrits a la main dans un fichier YAML,
 * ceux du premier club servi. Ajouter un club n'y changeait rien : son
 * exemplaire pouvait manquer sans que le controle bronche. Il demande
 * desormais la liste au depot.
 *
 * Lancement : npm run --silent fichiers-livres
 */

import { CLUBS } from './club.mjs'
import { fichiersDe } from './livrable.mjs'

for (const club of CLUBS) {
  const { livrable, notice } = fichiersDe(club)
  console.log(livrable)
  console.log(notice)
}
