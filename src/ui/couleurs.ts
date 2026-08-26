/**
 * Pose la palette du club sur la racine du document.
 *
 * POURQUOI PAS DIRECTEMENT DANS LA FEUILLE DE STYLE. Les couleurs viennent du
 * profil, qui est du JSON ; une feuille de style ne sait pas l'importer. On a
 * donc le choix entre engendrer un bloc CSS a la fabrication — et se battre
 * avec l'ordre des declarations, qui decide laquelle gagne — ou poser les neuf
 * valeurs sur l'element racine, ou elles l'emportent toujours. La seconde
 * facon tient en six lignes et ne depend d'aucun ordre.
 *
 * Rien ne clignote au passage : l'application entiere est rendue par React, et
 * cet appel precede le premier rendu. Ce qui s'affiche a deja ses couleurs.
 *
 * C'est un module d'INTERFACE et non de domaine : il touche au DOM, il n'a
 * donc rien a faire du cote pur, que les tests empaquettent sans navigateur.
 */

import { CLUB } from '../club'

export function poserLesCouleursDuClub(): void {
  const racine = document.documentElement
  for (const [role, valeur] of Object.entries(CLUB.couleurs)) {
    racine.style.setProperty(`--${role}`, valeur)
  }
  racine.style.setProperty('--ombre-teinte', composantes(CLUB.couleurs['structure-900']))
}

/**
 * « #0b2a52 » devient « 11, 42, 82 ».
 *
 * Les ombres et les voiles ont besoin d'une opacite, donc de la forme
 * rgba(r, g, b, a) — et une variable CSS ne se coupe pas en trois. Plutot que
 * de demander au club une DEUXIEME ecriture de la meme couleur, qu'il faudrait
 * penser a corriger deux fois, on la decompose ici.
 */
function composantes(hex: string): string {
  return [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(', ')
}
