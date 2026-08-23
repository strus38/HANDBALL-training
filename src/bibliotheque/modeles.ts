/**
 * Modeles d'exercices fournis avec l'application.
 *
 * Ce sont des donnees, pas des exercices : ils n'ont ni identifiant ni date.
 * construireExercice() en fabrique une fiche independante, que l'entraineur
 * peut ensuite modifier librement sans toucher au modele d'origine.
 *
 * Convention de placement : l'attaque se joue toujours vers le but de DROITE
 * (x = 40). Vu ainsi, l'aile gauche est en haut du terrain (y eleve) et l'aile
 * droite en bas, comme sur un tableau blanc pose face au groupe.
 */

import { nouvelId } from '../domain/fabrique'
import { appliquerMouvement } from '../domain/mouvement'
import {
  nouvelleEvaluation,
  ORIENTATION_PAR_DEFAUT,
  type Categorie,
  type Difficulte,
  type Exercice,
  type FormatGardiens,
  type Jeton,
  type Position,
  type TypeFleche,
  type TypeJeton,
  type VueTerrain,
} from '../domain/types'

export interface ModeleJeton {
  type: TypeJeton
  etiquette?: string
  /**
   * Cle stable pour designer ce jeton dans les mouvements.
   *
   * L'etiquette ne suffit pas : deux pivots portent le meme libelle, et deux
   * defenseurs peuvent etre numerotes pareil dans une defense etagee.
   */
  ref?: string
  x: number
  y: number
  /**
   * Direction du regard en degres. Absente, elle vaut l'orientation habituelle
   * du type : les attaquants regardent le but de droite, les defenseurs et le
   * gardien regardent l'attaque.
   */
  orientation?: number
}

/** Un deplacement declare par un modele d'exercice. */
export interface ModeleMouvement {
  /** Cle du jeton qui se deplace, ou du passeur pour une passe. */
  jeton: string
  type: TypeFleche
  /** Destination en metres. Inutile pour une passe qui vise un joueur. */
  vers?: { x: number; y: number }
  /** Cle du receveur, pour une passe. */
  cible?: string
}

/** Une etape d'un modele : les mouvements qui y menent depuis la precedente. */
export interface ModeleEtape {
  /** Titre de l'etape a laquelle ces mouvements aboutissent. */
  titre: string
  consigne?: string
  mouvements: ModeleMouvement[]
}

export interface ModeleExercice {
  titre: string
  /**
   * Identifiant STABLE de la fiche fournie, independant du titre.
   *
   * Le titre ne peut pas jouer ce role : il change - on corrige une faute, on
   * precise un intitule - et tout ce qui s'y accroche est alors perdu sans
   * bruit. Un favori pose sur « Croise arriere » disparaitrait au premier
   * renommage, et l'historique d'utilisation se scinderait en deux.
   *
   * La reference est derivee du titre A LA CREATION de la fiche, puis figee.
   * Elle ne doit JAMAIS etre modifiee ensuite, meme si le titre evolue.
   */
  ref: string
  categorie: Categorie
  /**
   * Vrai pour les combinaisons NOMMEES du repertoire : Espagnole, Pondus,
   * double croise...
   *
   * Ce n est pas une categorie de plus - une combinaison est un exercice
   * d attaque, et en faire une categorie obligerait l entraineur a deviner ou
   * chercher. C est un axe transverse, comme « avec animation » ou « sans
   * ballon » : la puce de la bibliotheque s ajoute aux filtres au lieu de les
   * remplacer.
   */
  combinaison?: boolean
  duree: number
  nombreJoueurs: number
  nombreGardiens: number
  difficulte: Difficulte
  materiel: string[]
  objectifs: string
  /** Rubriques de la trame de l'entraineur, facultatives dans un modele. */
  formeIntervention?: string
  misePlace?: string
  fonctionnement: string
  regulation?: string
  pointsCles: string
  evolution: string
  formatGardiens: FormatGardiens
  enParallele?: boolean
  vue: VueTerrain
  jetons: ModeleJeton[]
  /** Consigne de la mise en place, avant tout mouvement. */
  consigneInitiale?: string
  /**
   * Enchainement du mouvement, etape par etape.
   *
   * Absent, l'exercice reste une simple mise en place : c'est le cas des
   * circuits, des gammes et des matchs a theme, qui decrivent une organisation
   * ou une repetition, non une chorégraphie. Leur imposer une animation figee
   * donnerait une fausse idee de ce qu'ils sont.
   */
  etapes?: ModeleEtape[]
}

/** Transforme un modele en fiche autonome, prete a etre ajoutee a une seance. */
export function construireExercice(modele: ModeleExercice): Exercice {
  const date = new Date().toISOString()
  const jetons: Jeton[] = []
  const positions: Record<string, Position> = {}
  /** Cle du modele vers identifiant reellement attribue. */
  const cles = new Map<string, string>()

  for (const modeleJeton of modele.jetons) {
    const id = nouvelId()
    jetons.push({
      id,
      type: modeleJeton.type,
      etiquette: modeleJeton.etiquette ?? '',
      orientation: ORIENTATION_PAR_DEFAUT[modeleJeton.type] ?? 0,
    })
    // L'orientation n'est posee que si le modele l'impose : laissee libre, elle
    // se deduit (les joueurs regardent le ballon, le porteur regarde le but).
    if (modeleJeton.ref) cles.set(modeleJeton.ref, id)
    positions[id] =
      modeleJeton.orientation === undefined
        ? { x: modeleJeton.x, y: modeleJeton.y }
        : { x: modeleJeton.x, y: modeleJeton.y, orientation: modeleJeton.orientation }
  }

  let schema: Exercice['schema'] = {
    vue: modele.vue,
    jetons,
    etapes: [
      {
        id: nouvelId(),
        titre: 'Mise en place',
        consigne: modele.consigneInitiale ?? '',
        positions,
        fleches: [],
      },
    ],
  }

  // Les mouvements declares sont appliques par le meme moteur que celui d'un
  // trace fait a la souris : positions, ballon qui suit et orientations en
  // decoulent, au lieu d'etre recopies a la main dans les donnees.
  modele.etapes?.forEach((etapeModele, rang) => {
    for (const mouvement of etapeModele.mouvements) {
      const depart = cles.get(mouvement.jeton)
      const cible = mouvement.cible ? cles.get(mouvement.cible) : undefined
      if (!depart) continue
      const arrivee =
        mouvement.vers ??
        (cible ? schema.etapes[rang].positions[cible] : undefined) ??
        schema.etapes[rang].positions[depart]
      schema = appliquerMouvement(schema, rang, {
        type: mouvement.type,
        jetonDepart: depart,
        jetonArrivee: cible,
        arrivee,
      })
    }
    const suivante = schema.etapes[rang + 1]
    if (suivante) {
      suivante.titre = etapeModele.titre
      suivante.consigne = etapeModele.consigne ?? ''
    }
  })

  return {
    id: nouvelId(),
    titre: modele.titre,
    categorie: modele.categorie,
    duree: modele.duree,
    nombreJoueurs: modele.nombreJoueurs,
    nombreGardiens: modele.nombreGardiens,
    difficulte: modele.difficulte,
    materiel: [...modele.materiel],
    objectifs: modele.objectifs,
    formeIntervention: modele.formeIntervention ?? '',
    misePlace: modele.misePlace ?? '',
    fonctionnement: modele.fonctionnement,
    regulation: modele.regulation ?? '',
    pointsCles: modele.pointsCles,
    evolution: modele.evolution,
    formatGardiens: modele.formatGardiens,
    enParallele: modele.enParallele ?? false,
    evaluation: nouvelleEvaluation(),
    issuDeLaBibliotheque: true,
    // La copie garde le lien vers la fiche d'origine : c'est ce qui permettra
    // de la reconnaitre malgre les modifications de l'entraineur.
    refModele: modele.ref,
    schema,
    creeLe: date,
    modifieLe: date,
  }
}

// --------------------------------------------------------- Postes de reference

/** Placement type d'une attaque a six joueurs face au but de droite. */
export const ATTAQUE_PLACEE: ModeleJeton[] = [
  { type: 'attaquant', etiquette: 'AlG', ref: 'alg', x: 36.5, y: 18.3 },
  { type: 'attaquant', etiquette: 'ArG', ref: 'arg', x: 31.5, y: 14.5 },
  { type: 'attaquant', etiquette: 'DC', ref: 'dc', x: 30.5, y: 10 },
  { type: 'attaquant', etiquette: 'ArD', ref: 'ard', x: 31.5, y: 5.5 },
  { type: 'attaquant', etiquette: 'AlD', ref: 'ald', x: 36.5, y: 1.7 },
  { type: 'attaquant', etiquette: 'PIV', ref: 'piv', x: 32.3, y: 10 },
]

/** Bloc defensif 6-0 aligne sur la ligne de surface. */
export const DEFENSE_6_0: ModeleJeton[] = [
  { type: 'defenseur', etiquette: '1', ref: 'd1', x: 35.18, y: 4.6 },
  { type: 'defenseur', etiquette: '2', ref: 'd2', x: 33.98, y: 7 },
  { type: 'defenseur', etiquette: '3', ref: 'd3', x: 33.8, y: 9 },
  { type: 'defenseur', etiquette: '4', ref: 'd4', x: 33.8, y: 11 },
  { type: 'defenseur', etiquette: '5', ref: 'd5', x: 33.98, y: 13 },
  { type: 'defenseur', etiquette: '6', ref: 'd6', x: 35.18, y: 15.4 },
]

/** Bloc defensif 5-1 : un joueur avance a la pointe sur le demi-centre. */
export const DEFENSE_5_1: ModeleJeton[] = [
  { type: 'defenseur', etiquette: '1', ref: 'd1', x: 35.18, y: 4.6 },
  { type: 'defenseur', etiquette: '2', ref: 'd2', x: 33.9, y: 7.4 },
  { type: 'defenseur', etiquette: '3', ref: 'd3', x: 33.8, y: 10 },
  { type: 'defenseur', etiquette: '4', ref: 'd4', x: 33.9, y: 12.6 },
  { type: 'defenseur', etiquette: '5', ref: 'd5', x: 35.18, y: 15.4 },
  { type: 'defenseur', etiquette: 'P', ref: 'dp', x: 31.6, y: 11.3 },
]

export const GARDIEN_DROITE: ModeleJeton = { type: 'gardien', etiquette: 'GB', ref: 'gb', x: 38.9, y: 10 }
export const GARDIEN_GAUCHE: ModeleJeton = { type: 'gardien', etiquette: 'GB', ref: 'gbg', x: 1.1, y: 10 }

/**
 * Bloc defensif 3-2-1 : trois lignes etagees, le defenseur haut au sommet.
 * Il donne l'amplitude et la profondeur, les autres se placent par rapport a lui.
 */
export const DEFENSE_3_2_1: ModeleJeton[] = [
  { type: 'defenseur', etiquette: '1', ref: 'd1', x: 35.18, y: 4.6 },
  { type: 'defenseur', etiquette: '2', ref: 'd2', x: 32.2, y: 7 },
  { type: 'defenseur', etiquette: '3b', ref: 'd3b', x: 33.8, y: 10 },
  { type: 'defenseur', etiquette: '2', ref: 'd5', x: 32.2, y: 13 },
  { type: 'defenseur', etiquette: '1', ref: 'd6', x: 35.18, y: 15.4 },
  { type: 'defenseur', etiquette: '3h', ref: 'd3h', x: 28.9, y: 10 },
]

/** Attaque a deux pivots : un arriere descend dans le bloc adverse. */
export const ATTAQUE_DEUX_PIVOTS: ModeleJeton[] = [
  { type: 'attaquant', etiquette: 'AlG', ref: 'alg', x: 36.5, y: 18.3 },
  { type: 'attaquant', etiquette: 'ArG', ref: 'arg', x: 31.5, y: 14.5 },
  { type: 'attaquant', etiquette: 'DC', ref: 'dc', x: 30.5, y: 10 },
  { type: 'attaquant', etiquette: 'AlD', ref: 'ald', x: 36.5, y: 1.7 },
  { type: 'attaquant', etiquette: 'PIV', ref: 'piv1', x: 32.5, y: 12.9 },
  { type: 'attaquant', etiquette: 'PIV', ref: 'piv2', x: 32.5, y: 7.1 },
]
