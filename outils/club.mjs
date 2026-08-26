/**
 * Le club pour lequel les outils fabriquent, cote Node.
 *
 * Pendant du module `src/club.ts` : meme fichier lu, meme regle de choix, mais
 * de l'autre cote de la fabrication. L'application importe son profil ; les
 * outils — nom du livrable, notice, captures, lecture d'un retour — le lisent
 * sur le disque, parce qu'ils tournent avant que le bundle existe.
 *
 * Le club se choisit par la variable d'environnement CLUB, et a defaut par
 * `clubParDefaut` dans package.json. Le meme couple de regles vit dans
 * `vite.config.ts` : les deux lisent package.json et le profil, aucune valeur
 * n'est recopiee.
 *
 * Se tromper de club doit s'entendre tout de suite : un identifiant inconnu
 * arrete la fabrication en nommant les clubs disponibles, plutot que de livrer
 * un fichier a l'entete d'un autre.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const paquet = JSON.parse(readFileSync(join(racine, 'package.json'), 'utf8'))

/** Tous les clubs du depot, dans l'ordre du dossier. */
export const CLUBS = readdirSync(join(racine, 'clubs')).filter((n) =>
  existsSync(join(racine, 'clubs', n, 'profil.json')),
)

/** Celui pour lequel le depot fabrique quand on ne precise rien. */
export const CLUB_PAR_DEFAUT = paquet.clubParDefaut

/** Identifiant du club fabrique. */
export const CLUB = process.env.CLUB || CLUB_PAR_DEFAUT

/** Son dossier, depuis la racine du depot. */
export const DOSSIER_CLUB = `clubs/${CLUB}`

const chemin = join(racine, DOSSIER_CLUB, 'profil.json')
if (!existsSync(chemin)) {
  const dossier = join(racine, 'clubs')
  const connus = existsSync(dossier) ? readdirSync(dossier).join(', ') : 'aucun'
  throw new Error(
    `Club « ${CLUB} » inconnu : ${DOSSIER_CLUB}/profil.json est absent.\n` +
      `Clubs disponibles : ${connus}`,
  )
}

/** Son identite : identifiant, nomCourt, nom, nomLivrable. */
export const PROFIL = JSON.parse(readFileSync(chemin, 'utf8'))

/** Chemin absolu du dossier du club — ce que « @club » designe. */
export const RACINE_CLUB = join(racine, DOSSIER_CLUB)

/** Le profil de n'importe quel club, pour les outils qui les parcourent tous. */
export function profilDe(club) {
  return JSON.parse(readFileSync(join(racine, 'clubs', club, 'profil.json'), 'utf8'))
}
