/**
 * Ecrit les notes de la Release, en Markdown.
 *
 * Elles etaient trois lignes d'echo dans le fichier d'assemblage, qui nommaient
 * un fichier en dur. Une Release porte maintenant les exemplaires de plusieurs
 * clubs : l'entraineur doit trouver le SIEN du premier coup d'oeil, sans lire
 * les autres.
 *
 * Lancement : npm run --silent notes-de-version
 */

import { CLUBS, profilDe } from './club.mjs'
import { fichiersDe } from './livrable.mjs'

const lignes = [
  "Telechargez le fichier de votre club et double-cliquez dessus : l'application",
  "s'ouvre dans votre navigateur, sans installation et sans connexion.",
  '',
]

for (const club of CLUBS) {
  const profil = profilDe(club)
  const { livrable, notice } = fichiersDe(club)
  const nom = (chemin) => chemin.slice(chemin.lastIndexOf('/') + 1)
  lignes.push(`### ${profil.nom}`)
  lignes.push('')
  lignes.push(`- **${nom(livrable)}** : l'application`)
  lignes.push(`- **${nom(notice)}** : de quoi mener sa premiere seance, en dix minutes`)
  lignes.push('')
}

console.log(lignes.join('\n'))
