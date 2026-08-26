/**
 * Donne au livrable son nom d'entraineur, juste apres vite build.
 *
 * Vite ecrit « dist/index.html » — c'est le nom de son fichier d'entree, et le
 * changer a la source obligerait a configurer aussi le serveur de
 * developpement, qui attend index.html a la racine. Un renommage apres coup
 * coute deux lignes et ne touche a rien d'autre.
 *
 * Idempotent : relancer la fabrication sans rebatir ne fait pas echouer l'etape.
 *
 * Lancement : node outils/renommerLivrable.mjs (inclus dans npm run build)
 */

import { existsSync, renameSync, rmSync } from 'node:fs'
import { NOM_LIVRABLE, CHEMIN_LIVRABLE, DOSSIER_SORTIE } from './livrable.mjs'

const SORTIE_VITE = `${DOSSIER_SORTIE}/index.html`

if (existsSync(SORTIE_VITE)) {
  // Un livrable deja renomme traine peut-etre d'une fabrication precedente :
  // on l'ecarte, sinon renameSync echouerait sur certaines plateformes.
  if (existsSync(CHEMIN_LIVRABLE)) rmSync(CHEMIN_LIVRABLE)
  renameSync(SORTIE_VITE, CHEMIN_LIVRABLE)
  console.log(`Livrable renomme : ${NOM_LIVRABLE}`)
} else if (existsSync(CHEMIN_LIVRABLE)) {
  console.log(`Livrable deja nomme ${NOM_LIVRABLE}`)
} else {
  console.error('Aucun livrable a renommer : lancez vite build.')
  process.exit(1)
}
