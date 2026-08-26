/**
 * Verifie CHAQUE club du depot, l'un apres l'autre.
 *
 * `npm run verifier` ne connait qu'un club : celui que CLUB designe, et a
 * defaut celui du depot. C'etait suffisant tant qu'il n'y en avait qu'un ; ca
 * ne l'est plus. Un club dont le profil casse la fabrication, ou dont la
 * palette echoue au contraste, ne doit pas etre decouvert par l'entraineur qui
 * ouvre son fichier.
 *
 * On relance la verification complete plutot qu'une partie : le typage voit
 * tous les clubs d'un coup, mais le paquet des tests, les captures et la
 * notice, eux, sont propres a chaque exemplaire.
 *
 * Le premier echec arrete tout, et son club est nomme.
 *
 * Lancement : npm run verifier-tous
 */

import { spawnSync } from 'node:child_process'
import { CLUBS } from './club.mjs'

if (CLUBS.length === 0) throw new Error('Aucun club dans clubs/ : rien a fabriquer.')

for (const club of CLUBS) {
  console.log('')
  console.log('='.repeat(64))
  console.log(`  ${club}`)
  console.log('='.repeat(64))
  // La commande entiere en UNE chaine, et le shell pour l'interpreter. Sur
  // Windows, npm est un script « .cmd » que Node refuse de lancer sans shell ;
  // et lui passer des arguments a part est deconseille des lors qu'il y a un
  // shell, parce qu'ils y sont concatenes plutot qu'echappes.
  const resultat = spawnSync('npm run verifier', {
    stdio: 'inherit',
    env: { ...process.env, CLUB: club },
    shell: true,
  })
  // L'erreur de LANCEMENT doit se voir. La premiere version ne regardait que le
  // code de sortie : un npm introuvable donnait « Echec sur le club » sans une
  // ligne pour dire pourquoi, et la cause etait a chercher a l'aveugle.
  if (resultat.error) {
    console.error(`\nLancement impossible pour « ${club} » : ${resultat.error.message}`)
    process.exit(1)
  }
  if (resultat.status !== 0) {
    console.error(`\nEchec sur le club « ${club} », code ${resultat.status}.`)
    process.exit(resultat.status ?? 1)
  }
}

console.log('')
console.log(`Les ${CLUBS.length} clubs sont verifies.`)
