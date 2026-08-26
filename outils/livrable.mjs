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

import { PROFIL } from './club.mjs'

/** Le fichier que l'entraineur double-clique. */
export const NOM_LIVRABLE = PROFIL.nomLivrable

/** Son chemin depuis la racine du depot. */
export const CHEMIN_LIVRABLE = `dist/${NOM_LIVRABLE}`
