/**
 * Ouverture de la notice dans une fenetre a part.
 *
 * Le document est EMBARQUE dans l'application, pas lu a cote d'elle : le
 * livrable est un fichier unique qu'on copie sur une cle ou qu'on envoie seul.
 * Un lien vers un fichier voisin serait casse des que l'application voyage
 * sans lui, ce qui est le cas normal ici.
 *
 * La fenetre est remplie par document.write plutot que par une URL blob :
 * ouvert depuis le disque (file://), un blob herite d'une origine nulle que
 * les navigateurs refusent d'afficher dans un nouvel onglet. Ecrire dans le
 * document de la fenetre fonctionne partout, y compris hors ligne.
 */

import contenu from './notice.genere.html?raw'

/** Faux si le navigateur a bloque la fenetre : a l'appelant de le dire. */
export function ouvrirNotice(): boolean {
  const fenetre = window.open('', 'hbpsm-notice', 'width=980,height=900,scrollbars=yes')
  if (!fenetre) return false

  // Une fenetre deja ouverte est reutilisee : on la reecrit et on la ramene
  // devant, plutot que d'en empiler une par clic.
  fenetre.document.open()
  fenetre.document.write(contenu)
  fenetre.document.close()
  fenetre.focus()
  return true
}
