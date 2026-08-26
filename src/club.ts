/**
 * Le club pour lequel cet exemplaire a ete fabrique.
 *
 * L'application est la meme pour tous les clubs ; ce qui change d'un exemplaire
 * a l'autre tient dans un dossier, `clubs/<identifiant>/`, choisi au moment de
 * la fabrication (`CLUB=<identifiant> npm run build`). Le code, lui, ne nomme
 * jamais un club : il passe par ici.
 *
 * POURQUOI UN SEUL POINT DE PASSAGE. Le nom du club etait ecrit a la main dans
 * l'en-tete, dans le pied des feuilles imprimees, dans la boite d'enregistrement
 * et dans un message d'erreur. Quatre endroits, quatre occasions d'en oublier
 * un, et un exemplaire livre a un autre club qui affiche encore le nom du
 * premier. Le profil est importe, jamais recopie — et `tests/club.test.mjs`
 * refuse desormais qu'un nom de club reapparaisse hors de son dossier.
 *
 * POURQUOI LE NOM DU FICHIER EST DECLARE ET NON CALCULE. `nomLivrable` aurait
 * pu se deduire du nom court, mais c'est le nom que l'entraineur voit sur sa
 * cle USB et qu'il cherchera six mois plus tard : il merite d'etre ecrit, lu et
 * relu dans le profil plutot que fabrique par une regle invisible. Les outils
 * de fabrication lisent la meme valeur dans le meme fichier (voir
 * `outils/club.mjs`) : une seule source, deux lecteurs.
 */

import profil from '@club/profil.json'

/**
 * La palette du club, par ROLE et jamais par teinte.
 *
 * Chaque clef est le nom d'une variable CSS, sans les deux tirets : le profil
 * declare donc directement ce que la feuille de style consomme, sans table de
 * correspondance a tenir entre les deux.
 *
 * STRUCTURE, du plus fonce au plus clair : l'ossature de l'interface — entete,
 * boutons d'action, titres, fonds doux. `structure-900` doit rester lisible sur
 * fond clair.
 *
 * ACCENT : les elements actifs et les reperes. Il porte TOUJOURS du texte
 * fonce ; un accent trop sombre rend son propre texte illisible, et c'est un
 * test, pas un oeil, qui doit le dire — voir tests/club.test.mjs.
 */
export interface PaletteClub {
  accent: string
  'accent-clair': string
  'accent-fonce': string
  'structure-900': string
  'structure-800': string
  'structure-700': string
  'structure-500': string
  'structure-100': string
  'structure-050': string
}

export interface ProfilClub {
  /** Identifiant court et technique : dossier, prefixes, noms de sauvegarde. */
  identifiant: string
  /** Sigle affiche partout ou la place manque, dans l'en-tete et au pied des feuilles. */
  nomCourt: string
  /** Nom complet, tel que le club l'ecrit lui-meme. */
  nom: string
  /** Le fichier que l'entraineur double-clique. */
  nomLivrable: string
  /** Ses couleurs. Le type les rend obligatoires : un profil incomplet ne compile pas. */
  couleurs: PaletteClub
}

/**
 * Le profil du club, fige dans le livrable au moment de la fabrication.
 *
 * Le type est verifie ici, a la compilation : un profil auquel il manque un
 * champ fait echouer `tsc`, pas la premiere seance d'un entraineur.
 */
export const CLUB: ProfilClub = profil
