/**
 * Apparence des jetons sur le terrain.
 *
 * Les couleurs reprennent celles du club (jaune et bleu) : l'attaque porte le
 * jaune, la defense le bleu, comme sur un maillot. Le contraste est calcule
 * pour rester lisible a l'ecran comme sur une feuille imprimee en noir et
 * blanc, ou seule la forme distingue alors les jetons.
 *
 * Les joueurs sont un disque a la couleur du camp, deux bras tendus vers
 * l'avant, et une pastille centrale qui porte l'etiquette. Le disque a ete
 * prefere a une silhouette detaillee : il tourne sans changer de contour, il
 * laisse toute sa place au texte, et il occupe moins de largeur - assez pour
 * qu'un bloc defensif de six joueurs ne se chevauche plus.
 */

import type { TypeJeton, VueTerrain } from '../domain/types'

export type Forme = 'joueur' | 'cercle' | 'triangle' | 'carre' | 'losange' | 'rectangle'

export interface ApparenceJeton {
  libelle: string
  /** Description courte affichee en infobulle dans la palette. */
  aide: string
  forme: Forme
  remplissage: string
  contour: string
  couleurTexte: string
  /**
   * Fond de la pastille qui porte l'etiquette, pour les jetons de forme
   * « joueur ». Une teinte claire du maillot plutot que du blanc : le camp
   * reste lisible jusque dans la pastille, au lieu de couper le jeton en deux.
   */
  pastel?: string
  /** Rayon de reference en metres, a la vue demi-terrain. */
  rayon: number
  /** Etiquette proposee a la creation. */
  etiquetteParDefaut: string
}

export const APPARENCES: Record<TypeJeton, ApparenceJeton> = {
  attaquant: {
    libelle: 'Attaquant',
    aide: 'Joueur en possession ou en soutien',
    forme: 'joueur',
    remplissage: '#ffc72c',
    contour: '#0b2a52',
    couleurTexte: '#0b2a52',
    pastel: '#fff0c2',
    rayon: 0.95,
    etiquetteParDefaut: '',
  },
  defenseur: {
    libelle: 'Defenseur',
    aide: 'Joueur du bloc defensif',
    forme: 'joueur',
    remplissage: '#12467f',
    contour: '#06182f',
    couleurTexte: '#0b2a52',
    pastel: '#cfdcee',
    rayon: 0.95,
    etiquetteParDefaut: '',
  },
  gardien: {
    libelle: 'Gardien',
    aide: 'Gardien de but',
    forme: 'joueur',
    remplissage: '#1f7a5c',
    contour: '#0d3d2d',
    couleurTexte: '#0b2a52',
    pastel: '#cfe7dd',
    rayon: 0.9,
    etiquetteParDefaut: 'GB',
  },
  ballon: {
    libelle: 'Ballon',
    aide: 'Ballon',
    forme: 'cercle',
    remplissage: '#e8590c',
    contour: '#7a2e04',
    couleurTexte: '#ffffff',
    rayon: 0.42,
    etiquetteParDefaut: '',
  },
  plot: {
    libelle: 'Plot',
    aide: 'Plot ou coupelle',
    forme: 'triangle',
    remplissage: '#f59f00',
    contour: '#8a5a00',
    couleurTexte: '#4a3000',
    rayon: 0.45,
    etiquetteParDefaut: '',
  },
  but: {
    libelle: 'But mobile',
    aide: 'But supplementaire ou cible',
    forme: 'rectangle',
    remplissage: '#ffffff',
    contour: '#0b2a52',
    couleurTexte: '#0b2a52',
    rayon: 0.6,
    etiquetteParDefaut: '',
  },
  entraineur: {
    libelle: 'Entraineur',
    aide: 'Entraineur, passeur ou relanceur',
    forme: 'losange',
    remplissage: '#495867',
    contour: '#1f2933',
    couleurTexte: '#ffffff',
    rayon: 0.7,
    etiquetteParDefaut: 'E',
  },
  haie: {
    libelle: 'Haie',
    aide: 'Haie, banc ou obstacle',
    forme: 'rectangle',
    remplissage: '#adb5bd',
    contour: '#495057',
    couleurTexte: '#212529',
    rayon: 0.5,
    etiquetteParDefaut: '',
  },
}

/** Ordre d'affichage dans la palette. */
export const PALETTE: TypeJeton[] = [
  'attaquant',
  'defenseur',
  'gardien',
  'ballon',
  'plot',
  'but',
  'entraineur',
  'haie',
]

/**
 * Les jetons gardent une taille lisible quelle que soit la vue : sur le terrain
 * complet, deux fois plus large a l'ecran, ils seraient deux fois plus petits.
 */
export function facteurTaille(vue: VueTerrain): number {
  return vue === 'complet' ? 1.25 : vue === 'zone' ? 0.8 : 1
}

/** Position de depart d'un nouveau jeton, au centre de la zone visible. */
export function positionInitiale(vue: VueTerrain, deja: number): { x: number; y: number } {
  const centre = vue === 'complet' ? { x: 20, y: 10 } : vue === 'zone' ? { x: 33, y: 10 } : { x: 30, y: 10 }
  // Les jetons ajoutes a la suite sont decales en escalier pour ne pas se
  // superposer sous le curseur.
  const rang = deja % 8
  return {
    x: centre.x - 3 + (rang % 4) * 2,
    y: centre.y + 4 - Math.floor(rang / 4) * 2.5,
  }
}
