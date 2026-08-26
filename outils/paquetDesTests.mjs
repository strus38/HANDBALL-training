/**
 * Le paquet du domaine, tel que les tests l'importent.
 *
 * C'etait une ligne d'esbuild dans package.json. Elle ne pouvait plus y rester :
 * le catalogue depend desormais du club fabrique, via « @club », et un alias
 * ecrit dans un script npm serait fige sur un club — les tests d'un deuxieme
 * club auraient verifie la bibliotheque du premier, sans rien signaler.
 *
 * Lancement : node outils/paquetDesTests.mjs (inclus dans npm test)
 */

import { build } from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RACINE_CLUB } from './club.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

await build({
  entryPoints: [join(racine, 'tests/entree.ts')],
  bundle: true,
  format: 'esm',
  // « neutral » : le domaine est pur, ni DOM ni Node. Ce reglage le prouve a
  // chaque fabrication du paquet — un import de React y echouerait.
  platform: 'neutral',
  alias: { '@club': RACINE_CLUB },
  outfile: join(racine, '.build-tests/domaine.mjs'),
})
