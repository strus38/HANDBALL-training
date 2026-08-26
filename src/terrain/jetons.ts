/**
 * Apparence des jetons sur le terrain.
 *
 * LES DEUX CAMPS PORTENT LE MAILLOT DU CLUB. L'attaque prend son accent, la
 * defense sa couleur profonde — partout, bibliotheque comprise : une fiche ne
 * change pas d'aspect en entrant dans une seance, sinon l'entraineur croit
 * avoir modifie quelque chose en la prenant.
 *
 * CE QUI SE JOUE VRAIMENT ICI. Les trois joueurs ont la MEME FORME et le meme
 * rayon : rien ne les distingue que la couleur, et sur une feuille imprimee en
 * noir et blanc, rien que le niveau de gris. Une palette dont les deux
 * couleurs se ressemblent rend donc les deux camps indiscernables — et cela ne
 * se decouvre qu'au gymnase, sur du papier. `tests/club.test.mjs` mesure cet
 * ecart et refuse la palette qui ne le tient pas.
 *
 * D'ou le choix du mappage : la defense prend la couleur PROFONDE du club, pas
 * sa seconde couleur. Un club aux deux verts proches donnerait un ecart de 1.6
 * entre attaque et defense ; le meme club, defense en profond, donne 10.
 *
 * LE GARDIEN GARDE SON VERT, pour tous les clubs. Une palette n'offre que deux
 * couleurs et il en faudrait une troisieme ; et c'est de toute facon son
 * etiquette « GB » qui le distingue, non sa teinte — elle est proche de celle
 * de la defense depuis toujours.
 *
 * Le ballon, les plots, les haies et l'entraineur restent ce qu'ils sont :
 * du materiel, pas un camp. Ils ne portent aucun maillot.
 *
 * Les joueurs sont un disque a la couleur du camp, deux bras tendus vers
 * l'avant, et une pastille centrale qui porte l'etiquette. Le disque a ete
 * prefere a une silhouette detaillee : il tourne sans changer de contour, il
 * laisse toute sa place au texte, et il occupe moins de largeur - assez pour
 * qu'un bloc defensif de six joueurs ne se chevauche plus.
 */

import { CLUB } from '../club'
import type { TypeJeton, VueTerrain } from '../domain/types'

// Le maillot du club, tel que les jetons s'en servent. Les valeurs sont figees
// a la fabrication : un schema exporte en PNG sort de la page et n'a plus de
// feuille de style pour lui dire de quelle couleur il est.
const ATTAQUE = CLUB.couleurs.accent
const ATTAQUE_PASTEL = CLUB.couleurs['accent-clair']
const ATTAQUE_PROFOND = CLUB.couleurs['accent-fonce']
const DEFENSE = CLUB.couleurs['structure-700']
const DEFENSE_PASTEL = CLUB.couleurs['structure-100']
/** Le trait et le texte : la couleur la plus profonde du club. */
const TRAIT = CLUB.couleurs['structure-900']

export type Forme =
  | 'joueur'
  | 'cercle'
  | 'triangle'
  | 'carre'
  | 'losange'
  | 'rectangle'
  | 'colonne'
  | 'anneau'

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
  /**
   * Le nom du jeton est feminin.
   *
   * « Haie selectionne » et « Colonne selectionne » trainaient dans le panneau
   * lateral : le libelle et son accord viennent d'ici, pas d'une regle devinee
   * a la derniere lettre du mot.
   */
  feminin?: boolean
}

export const APPARENCES: Record<TypeJeton, ApparenceJeton> = {
  attaquant: {
    libelle: 'Attaquant',
    aide: 'Joueur en possession ou en soutien',
    forme: 'joueur',
    remplissage: ATTAQUE,
    contour: TRAIT,
    couleurTexte: TRAIT,
    pastel: ATTAQUE_PASTEL,
    rayon: 0.95,
    etiquetteParDefaut: '',
  },
  defenseur: {
    libelle: 'Défenseur',
    aide: 'Joueur du bloc défensif',
    forme: 'joueur',
    remplissage: DEFENSE,
    contour: TRAIT,
    couleurTexte: TRAIT,
    pastel: DEFENSE_PASTEL,
    rayon: 0.95,
    etiquetteParDefaut: '',
  },
  gardien: {
    libelle: 'Gardien',
    aide: 'Gardien de but',
    forme: 'joueur',
    remplissage: '#1f7a5c',
    contour: '#0d3d2d',
    couleurTexte: TRAIT,
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
    aide: 'But supplémentaire ou cible',
    forme: 'rectangle',
    remplissage: '#ffffff',
    contour: TRAIT,
    couleurTexte: TRAIT,
    rayon: 0.6,
    etiquetteParDefaut: '',
  },
  entraineur: {
    libelle: 'Entraîneur',
    aide: 'Entraîneur, passeur ou relanceur',
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
    feminin: true,
  },
  colonne: {
    libelle: 'Colonne',
    aide: "File d'attente : le groupe qui passe un par un",
    forme: 'colonne',
    // Le jaune de l'attaque, en plus sourd : une colonne est faite de joueurs,
    // mais elle n'est pas un joueur — la nuance doit se voir sans se lire.
    remplissage: ATTAQUE_PROFOND,
    contour: TRAIT,
    couleurTexte: TRAIT,
    pastel: ATTAQUE_PASTEL,
    rayon: 0.85,
    etiquetteParDefaut: '×4',
    feminin: true,
  },
  cerceau: {
    libelle: 'Cerceau',
    aide: 'Cerceau posé au sol : appui, cible, zone de réception',
    forme: 'anneau',
    // Un anneau ne se remplit pas : c'est le contour qui porte la couleur, et
    // le terrain se voit par le trou. Le violet ne sert nulle part ailleurs
    // dans la palette, et reste franc une fois imprime en gris.
    remplissage: 'none',
    contour: '#7048e8',
    couleurTexte: '#3b1f96',
    rayon: 0.5,
    etiquetteParDefaut: '',
  },
}

/** Ordre d'affichage dans la palette. */
/**
 * Ordre d'affichage dans la palette.
 *
 * « But mobile » n'y figure plus : aucun club de la taille du notre n'en sort
 * un a l'entrainement, et il occupait une place dans une liste qu'on parcourt
 * a chaque fiche. Le TYPE, lui, existe toujours : les fiches ou un entraineur
 * en avait pose un continuent de s'afficher et de s'imprimer telles quelles.
 * Retirer le type aurait efface un jeton de leurs schemas sans prevenir.
 */
export const PALETTE: TypeJeton[] = [
  'attaquant',
  'defenseur',
  'colonne',
  'gardien',
  'ballon',
  'plot',
  'cerceau',
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
