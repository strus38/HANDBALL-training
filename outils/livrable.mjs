/**
 * Le nom du fichier livre a l'entraineur, en un seul endroit.
 *
 * POURQUOI PAS « index.html ». Ce nom ne veut rien dire pour un entraineur. Sur
 * une cle USB posee a cote de trois autres fichiers, ou dans un dossier de
 * telechargements, il ne designe rien : impossible de savoir lequel ouvrir, et
 * impossible de le retrouver six mois plus tard. « index » est un mot de
 * developpeur, herite du temps ou les serveurs cherchaient ce fichier par
 * defaut — l'application, elle, ne passe par aucun serveur.
 *
 * RENOMMER NE FAIT RIEN PERDRE. Verifie dans un vrai navigateur : le stockage
 * d'une page ouverte en file:// est range sous l'origine « file:// » tout
 * court, sans le chemin. Un entraineur qui recoit le fichier sous son nouveau
 * nom retrouve donc ses seances, ses fiches et ses preferences intactes — y
 * compris s'il l'ouvre depuis un autre dossier ou une cle USB.
 *
 * La contrepartie de cette meme regle merite d'etre connue : ce stockage
 * appartient a la MACHINE, pas au fichier. Emporter sa cle chez le voisin
 * n'emporte pas son travail — seul le fichier .hbt.json le fait.
 *
 * Ce module est la source unique du nom. Les outils et les tests l'importent ;
 * un test verifie qu'aucun d'eux n'a garde l'ancien en dur.
 *
 * LE NOM APPARTIENT AU CLUB. Depuis qu'un exemplaire est fabrique par club, il
 * est declare dans `clubs/<identifiant>/profil.json` et non calcule : c'est le
 * nom que l'entraineur lira sur sa cle USB, il merite d'etre ecrit noir sur
 * blanc dans le profil plutot que deduit d'une regle que personne ne relit.
 */

import { CLUB, profilDe } from './club.mjs'

/**
 * Les deux fichiers livres a un club, quel qu'il soit.
 *
 * Une seule fonction pour la regle de nommage : les outils qui parcourent tous
 * les clubs — le controle d'assemblage, les notes de version — la posent la
 * meme question que la fabrication d'un seul.
 */
export function fichiersDe(club) {
  const profil = profilDe(club)
  return {
    dossier: `dist/${club}`,
    livrable: `dist/${club}/${profil.nomLivrable}`,
    notice: `dist/${club}/${profil.nomCourt}-PRISE-EN-MAIN.html`,
  }
}

const miens = fichiersDe(CLUB)

/** Le fichier que l'entraineur double-clique. */
export const NOM_LIVRABLE = profilDe(CLUB).nomLivrable

/**
 * La notice, au nom du club elle aussi.
 *
 * Elle s'appelait « PRISE-EN-MAIN.html » pour tout le monde. Une Release
 * GitHub range ses fichiers a plat : deux clubs y auraient depose deux notices
 * du meme nom, et la seconde aurait ecrase la premiere sans un mot. Un
 * entraineur qui telecharge les deux fichiers de son club voit maintenant tout
 * de suite qu'ils vont ensemble.
 */
export const NOM_NOTICE = miens.notice.slice(miens.dossier.length + 1)

/**
 * Un dossier de sortie par club.
 *
 * `vite build` vide son dossier de sortie a chaque fabrication : dans un
 * « dist » commun, le deuxieme club effacait le premier, et seul le dernier
 * fabrique arrivait a la Release. Chacun le sien, et l'ordre n'a plus
 * d'importance.
 */
export const DOSSIER_SORTIE = miens.dossier

/** Chemins depuis la racine du depot. */
export const CHEMIN_LIVRABLE = miens.livrable
export const CHEMIN_NOTICE = miens.notice
