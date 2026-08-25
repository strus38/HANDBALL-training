/**
 * Modele de donnees de l'application.
 *
 * Regles importantes :
 * - Toutes les coordonnees du terrain sont exprimees en METRES (pas en pixels),
 *   origine en bas a gauche du terrain complet (40 m x 20 m). Un schema peut
 *   ainsi changer de vue (demi-terrain / terrain complet / zone) sans casser,
 *   et s'imprimer a n'importe quelle taille.
 * - Les jetons (joueurs, ballon, plots) sont des entites PERSISTANTES : chaque
 *   etape ne stocke que leurs nouvelles positions, pas de nouveaux objets. Le
 *   deplacement entre deux etapes peut donc etre trace et anime automatiquement.
 */

/**
 * Version 2 : la fiche adopte la trame de l'entraineur — forme d'intervention,
 * mise en place, fonctionnement, regulation, evolution. Les fichiers de
 * version 1 restent lisibles, leurs champs sont repris a la lecture.
 *
 * Version 3 : le schema gagne des zones coloriees et des annotations libres,
 * la palette un jeton « colonne », la notation une fleche de rotation, et la
 * fiche l'espace de jeu qu'elle demande. Les fichiers de version 1 et 2 se
 * lisent sans rien perdre — tout ce qui est nouveau est facultatif.
 */
export const SCHEMA_VERSION = 3

// ---------------------------------------------------------------- Terrain

/** Dimensions officielles d'un terrain de handball, en metres. */
export const TERRAIN = {
  longueur: 40,
  largeur: 20,
  rayonSurface: 6, // ligne de surface de but
  rayonJetFranc: 9, // ligne de jet franc (pointillee)
  distanceJet7m: 7,
  ligneGardien: 4,
  largeurBut: 3,
  hauteurBut: 2,
} as const

export type VueTerrain = 'demi' | 'complet' | 'zone'

export const LIBELLES_VUE: Record<VueTerrain, string> = {
  demi: 'Demi-terrain',
  complet: 'Terrain complet',
  zone: 'Zone 6m / 9m',
}

// ---------------------------------------------------------------- Jetons

export type TypeJeton =
  | 'attaquant'
  | 'defenseur'
  | 'gardien'
  | 'ballon'
  | 'plot'
  | 'but'
  | 'entraineur'
  | 'haie'
  /**
   * Une file d'attente : le groupe qui patiente et passe un par un.
   *
   * C'est l'organisation la plus frequente du handball — un exercice de tir se
   * mene presque toujours en colonnes — et elle ne se dessinait pas. Poser
   * douze jetons pour figurer une colonne encombrait le schema et faisait
   * croire a douze joueurs actifs simultanement.
   */
  | 'colonne'

/** Poste handball, optionnel, utilise pour l'etiquette automatique du jeton. */
export type Poste = 'AlG' | 'ArG' | 'DC' | 'ArD' | 'AlD' | 'PIV' | 'GB'

export interface Jeton {
  id: string
  type: TypeJeton
  /** Etiquette affichee dans le jeton (numero de maillot, poste, "1", ...). */
  etiquette: string
  poste?: Poste
  /**
   * Direction du regard du joueur, en degres : 0 vers le haut du terrain,
   * 90 vers le but de droite, 180 vers le bas, 270 vers le but de gauche.
   * L'orientation appartient a l'etape : un joueur qui pivote entre deux
   * etapes est une information tactique a part entiere. Elle est donc stockee
   * avec la position, ici seulement comme valeur de repli.
   */
  orientation?: number
}

export interface Position {
  /** Metres depuis le bord gauche du terrain complet. */
  x: number
  /** Metres depuis le bord bas du terrain complet. */
  y: number
  /**
   * Direction du regard en degres (0 = vers le haut du terrain).
   *
   * Absente, l'orientation est DEDUITE : un joueur qui court regarde ou il va,
   * les autres regardent le ballon. La renseigner revient a dire « je decide
   * moi-meme pour ce joueur », et l'automatisme ne s'applique plus.
   */
  orientation?: number
}

/** Orientation par defaut d'un jeton selon son type. */
export const ORIENTATION_PAR_DEFAUT: Partial<Record<TypeJeton, number>> = {
  attaquant: 90,
  defenseur: 270,
  gardien: 270,
  entraineur: 90,
  // Une colonne attend face au but qu'elle attaque, comme les attaquants.
  // Sans cette valeur elle naissait tournee vers le haut du terrain, et sa file
  // s'etirait en travers au lieu de partir vers l'arriere.
  colonne: 90,
}

// ---------------------------------------------------------------- Fleches

export type TypeFleche =
  | 'course' // trait plein       : deplacement du joueur
  | 'passe' // trait pointille    : passe
  | 'dribble' // trait ondule     : dribble
  | 'tir' // trait epais          : tir
  | 'ecran' // trait barre en T   : ecran / blocage
  /**
   * Trait fin en tirets, pointe ouverte : « puis va au fond de la colonne ».
   *
   * Ce n'est pas un mouvement de l'exercice mais sa REGLE DE ROTATION, ce qui
   * se passe apres l'action. Elle ne deplace donc personne a l'etape suivante
   * et reste une fleche libre, purement illustrative.
   */
  | 'rotation'

export const LIBELLES_FLECHE: Record<TypeFleche, string> = {
  course: 'Course',
  passe: 'Passe',
  dribble: 'Dribble',
  tir: 'Tir',
  ecran: 'Écran',
  rotation: 'Rotation',
}

/** Ce que chaque trait raconte, en infobulle de la barre d'outils. */
export const AIDES_FLECHE: Record<TypeFleche, string> = {
  course: 'Déplacement du joueur',
  passe: 'Trajectoire du ballon',
  dribble: 'Le porteur avance en dribblant',
  tir: 'Tir au but',
  ecran: 'Écran ou blocage',
  rotation: 'Puis va au fond de la colonne',
}

/**
 * Fleche de mouvement.
 *
 * Une fleche liee a un jeton NE STOCKE PAS ses extremites : son depart est la
 * position du jeton a cette etape, son arrivee est sa position a l'etape
 * suivante. La fleche et le deplacement sont ainsi une seule et meme donnee,
 * vue de deux facons — impossible qu'elles se contredisent.
 *
 * Une fleche sans jetonId est une fleche libre, purement illustrative : elle
 * porte alors ses propres extremites.
 */
export interface Fleche {
  id: string
  type: TypeFleche
  /**
   * Jeton dont la fleche decrit le mouvement. Pour une passe ou un tir, c'est
   * le ballon : c'est lui qui se deplace, pas le passeur.
   */
  jetonId?: string
  /** Joueur vise par une passe : le ballon lui est remis a l'etape suivante. */
  cible?: string
  /** Extremites, uniquement pour les fleches libres. */
  depart?: Position
  arrivee?: Position
  /** Point de controle pour courber la fleche (quadratique). Absent = droite. */
  courbure?: Position
}

/** Fleche dont les extremites ont ete calculees, prete a etre dessinee. */
export interface FlecheResolue {
  id: string
  type: TypeFleche
  depart: Position
  arrivee: Position
  courbure?: Position
  jetonId?: string
}

// ---------------------------------------------------------------- Etapes

export interface Etape {
  id: string
  /** Titre court affiche sur la barre d'etapes ("Mise en place", "Croise"). */
  titre: string
  /** Consigne affichee sous le terrain pendant la lecture. */
  consigne: string
  /** Position de chaque jeton a cette etape, indexee par id de jeton. */
  positions: Record<string, Position>
  fleches: Fleche[]
}

// ------------------------------------------------------- Zones et textes

/**
 * Teintes disponibles pour une zone.
 *
 * Cinq couleurs nommees plutot qu'un choix libre : le nuancier libre produit
 * des schemas qui jurent d'une fiche a l'autre, et surtout des zones illisibles
 * une fois imprimees en noir et blanc. Chaque teinte est posee en transparence
 * et garde donc les lignes du terrain visibles au travers.
 */
export type TeinteZone = 'jaune' | 'bleu' | 'vert' | 'rouge' | 'gris'

export const LIBELLES_TEINTE: Record<TeinteZone, string> = {
  jaune: 'Jaune',
  bleu: 'Bleu',
  vert: 'Vert',
  rouge: 'Rouge',
  gris: 'Gris',
}

/**
 * Zone coloriee posee sur le terrain : zone de marque, secteur interdit,
 * espace delimite.
 *
 * Elle appartient au SCHEMA et non a une etape, comme les jetons : c'est un
 * element de mise en place, il ne se deplace pas d'une etape a l'autre. Ce
 * choix la rend aussi impossible a oublier — une zone tracee a l'etape 1 reste
 * visible a l'etape 4, ou l'entraineur en a encore besoin.
 *
 * Le rectangle est decrit par son coin BAS-GAUCHE en repere metier, comme tout
 * le reste du modele : x vers la droite, y vers le haut.
 */
export interface Zone {
  id: string
  /** Metres depuis le bord gauche du terrain complet. */
  x: number
  /** Metres depuis le bord bas du terrain complet. */
  y: number
  largeur: number
  hauteur: number
  teinte: TeinteZone
  /** Libelle pose au centre. Vide : la zone parle par sa couleur seule. */
  libelle: string
}

/** Cote minimal d'une zone, en metres : en deca elle n'est plus saisissable. */
export const ZONE_MINIMALE = 1

/**
 * Annotation libre : un mot pose sur le terrain, la ou il se lit.
 *
 * « Defense 6-0 », « depart au signal », « 3 ballons ici » : des precisions qui
 * appartiennent a l'endroit du terrain qu'elles designent, et que la consigne
 * ecrite sous le schema ne peut pas viser.
 *
 * Appartient au schema pour la meme raison que les zones : c'est de la mise en
 * place, pas du mouvement.
 */
export interface Annotation {
  id: string
  /** Point d'ancrage du texte, en metres, repere metier. */
  x: number
  y: number
  texte: string
}

/** Longueur maximale d'une annotation : au-dela elle deborde du terrain. */
export const MAX_LONGUEUR_ANNOTATION = 40

export interface Schema {
  vue: VueTerrain
  jetons: Jeton[]
  etapes: Etape[]
  /**
   * Zones coloriees et annotations : facultatives, absentes des schemas ecrits
   * avant la version 3 du format. Le code les traite donc toujours comme
   * pouvant manquer, plutot que de reecrire tous les fichiers existants.
   */
  zones?: Zone[]
  annotations?: Annotation[]
}

// ---------------------------------------------------------------- Exercice

export type Categorie =
  | 'echauffement'
  | 'technique'
  | 'attaque'
  | 'defense'
  | 'gardien'
  | 'transition'
  | 'physique'
  | 'jeu'

export const LIBELLES_CATEGORIE: Record<Categorie, string> = {
  echauffement: 'Échauffement',
  technique: 'Technique individuelle',
  attaque: 'Attaque',
  defense: 'Défense',
  gardien: 'Gardien de but',
  transition: 'Montée de balle / transition',
  physique: 'Préparation physique',
  jeu: 'Jeu / situation',
}

export type Difficulte = 1 | 2 | 3

/**
 * Comment les gardiens interviennent dans l'exercice.
 *
 * Un exercice « gardiens seuls » se mene a l'ecart pendant que le reste du
 * groupe travaille autre chose : c'est le cas d'usage principal des seances ou
 * les gardiens ont besoin d'un contenu specifique.
 */
export type FormatGardiens = 'sans' | 'avec-joueurs' | 'gardiens-seuls'

export const LIBELLES_FORMAT_GARDIENS: Record<FormatGardiens, string> = {
  sans: 'Sans gardien',
  'avec-joueurs': 'Gardiens avec les joueurs',
  'gardiens-seuls': 'Gardiens seuls',
}

/**
 * Memes valeurs, sans repeter le mot « gardiens ».
 *
 * Dans un formulaire dont le champ s'intitule deja « Role des gardiens », le
 * repeter dans chaque option allonge le texte sans rien apprendre — et cela
 * suffisait a faire deborder la liste deroulante.
 */
export const LIBELLES_FORMAT_GARDIENS_COURTS: Record<FormatGardiens, string> = {
  sans: 'Aucun',
  'avec-joueurs': 'Avec les joueurs',
  'gardiens-seuls': 'Entre eux, à part',
}

/**
 * Espace de jeu qu'un exercice reclame.
 *
 * Jumeau de l'effectif : l'entraineur ne decouvre pas au gymnase qu'il ne
 * pourra pas mener ce qu'il avait prepare. Un mardi sur deux, le gymnase est
 * partage avec le basket ou une autre categorie, et la moitie de la seance
 * preparee sur terrain complet tombe a l'eau.
 *
 * Trois paliers, et non une surface en metres carres : c'est ainsi qu'un
 * gymnase se partage — tout, la moitie dans la longueur, ou un quart de la
 * salle pour un atelier.
 */
export type Espace = 'quart' | 'demi' | 'complet'

export const LIBELLES_ESPACE: Record<Espace, string> = {
  quart: 'Un quart de salle',
  demi: 'Un demi-terrain',
  complet: 'Le terrain complet',
}

/** Memes valeurs en court, pour les listes et les pastilles. */
export const LIBELLES_ESPACE_COURTS: Record<Espace, string> = {
  quart: 'Quart',
  demi: 'Demi',
  complet: 'Complet',
}

/**
 * Ordre croissant des paliers : c'est la comparaison de ces rangs, et non
 * l'ordre alphabetique, qui dit si l'espace disponible suffit.
 */
export const RANG_ESPACE: Record<Espace, number> = { quart: 1, demi: 2, complet: 3 }

/**
 * Espace deduit de la vue du schema.
 *
 * Sert de valeur de repli pour tout ce qui a ete ecrit avant que le champ
 * n'existe : les 62 fiches livrees comme les fichiers des entraineurs. La
 * deduction est juste dans l'immense majorite des cas — on ne dessine pas sur
 * terrain complet un exercice qui tient sur un demi — et elle vaut infiniment
 * mieux que de tout declarer « complet » et de noyer l'alerte sous les
 * faux positifs.
 */
export function espaceParDefaut(vue: VueTerrain): Espace {
  return vue === 'complet' ? 'complet' : vue === 'zone' ? 'quart' : 'demi'
}

/**
 * Retour de l'entraineur sur l'exercice, une fois mene sur le terrain.
 *
 * La note sert a trier la bibliotheque : on retrouve vite les exercices qui
 * fonctionnent et on ecarte ceux qui tombent a plat. 0 = pas encore evalue,
 * l'exercice n'est alors ni recommande ni deconseille.
 */
export interface Evaluation {
  /** 0 = non evalue, 1 (a eviter) a 5 (excellent). */
  note: 0 | 1 | 2 | 3 | 4 | 5
  /** Ce qui a marche ou non, a relire avant de reprogrammer l'exercice. */
  commentaire: string
  /** Nombre de fois que l'exercice a ete marque comme realise. */
  nombreUtilisations: number
  /** Date ISO courte de la derniere utilisation, vide si jamais utilise. */
  derniereUtilisation: string
}

export const LIBELLES_NOTE: Record<number, string> = {
  0: 'Non évalué',
  1: 'À éviter',
  2: 'Décevant',
  3: 'Correct',
  4: 'Très bon',
  5: 'Incontournable',
}

export function nouvelleEvaluation(): Evaluation {
  return { note: 0, commentaire: '', nombreUtilisations: 0, derniereUtilisation: '' }
}

/**
 * Ce qui s'est reellement passe pendant la seance, releve en mode terrain.
 *
 * Pose A COTE du plan, jamais a sa place : la duree prevue reste la duree
 * prevue. C'est la comparaison des deux qui a de la valeur - « j'avais prevu
 * 15 minutes, j'en ai passe 22 » est une lecon pour la seance suivante, alors
 * qu'ecraser le plan par la realite l'effacerait.
 */
export interface Deroule {
  /** Coche sur le terrain : l'exercice a ete mene. */
  fait: boolean
  /** Minutes reellement passees, absentes si l'exercice n'a pas ete mene. */
  dureeReelle?: number
}
export interface Exercice {
  id: string
  titre: string
  categorie: Categorie
  /** Duree en minutes. */
  duree: number
  nombreJoueurs: number
  nombreGardiens: number
  difficulte: Difficulte
  materiel: string[]
  /** Ce que les joueurs doivent progresser. */
  objectifs: string
  /**
   * Maniere de conduire la situation : approche inductive, consigne directe,
   * couverture d'un poste... C'est une rubrique de la trame federale, absente
   * des applications generalistes et pourtant systematiquement renseignee.
   */
  formeIntervention: string
  /** Ce qu'il faut installer avant de commencer : espaces, colonnes, materiel. */
  misePlace: string
  /** Comment la situation se deroule une fois lancee. */
  fonctionnement: string
  /**
   * Les regles et contraintes que l'entraineur impose et ajuste en cours de
   * situation, y compris les baremes de points. A distinguer des points cles,
   * qui relevent de l'observation et non de la regle.
   */
  regulation: string
  /** Ce que l'entraineur observe et corrige. */
  pointsCles: string
  /** Comment faire evoluer la situation : simplifier, complexifier. */
  evolution: string
  formatGardiens: FormatGardiens
  /**
   * Espace necessaire pour mener l'exercice tel qu'il est decrit.
   *
   * Par defaut un demi-terrain : c'est l'espace de la grande majorite des
   * situations, et la vue sur laquelle un schema neuf s'ouvre.
   */
  espace: Espace
  /**
   * L'exercice peut se derouler en meme temps qu'un autre, sur une autre partie
   * du terrain (typiquement le travail specifique des gardiens). Sa duree ne
   * s'ajoute alors pas au temps total de la seance.
   */
  enParallele: boolean
  evaluation: Evaluation
  /** Releve du terrain, absent tant que la seance n a pas ete menee. */
  deroule?: Deroule
  /** Vrai pour les fiches issues de la bibliotheque fournie avec l'application. */
  issuDeLaBibliotheque?: boolean
  /**
   * Reference de la fiche fournie dont cet exercice est issu, s'il en vient.
   *
   * Elle survit aux modifications de l'entraineur, y compris au renommage :
   * c'est par elle qu'on relie une copie a son modele, et non par le titre.
   * Absente sur les fiches creees de zero.
   */
  refModele?: string
  schema: Schema
  creeLe: string
  modifieLe: string
}

// ---------------------------------------------------------------- Seance

export interface Seance {
  id: string
  titre: string
  /** Date au format ISO court AAAA-MM-JJ. */
  date: string
  equipe: string
  categorieAge: string
  objectifSeance: string
  /** Joueurs de champ presents ce jour-la. 0 = non renseigne. */
  effectifJoueurs: number
  /** Gardiens presents ce jour-la. 0 = non renseigne. */
  effectifGardiens: number
  /**
   * Espace reellement disponible ce soir-la. Chaine vide = non renseigne.
   *
   * Meme convention que l'effectif : tant que rien n'est dit, aucune alerte
   * n'est levee. On ne reproche pas a l'entraineur de ne pas avoir repondu a
   * une question qu'on ne lui a pas posee.
   */
  espaceDisponible: Espace | ''
  exercices: Exercice[]
  /**
   * Instant ISO ou le mode terrain a ete lance, absent sinon.
   *
   * C est l ancre de tout l horaire : les creneaux se calculent a partir
   * de la, et non d un compte a rebours qui repartirait a zero a chaque
   * exercice. Le conserver permet de rouvrir l application en cours de
   * seance sans perdre le retard deja pris.
   */
  demarreLe?: string
  creeLe: string
  modifieLe: string
}

/**
 * Un exercice demande-t-il plus de monde que l'effectif annonce ?
 *
 * Un exercice peut tres bien mobiliser moins de joueurs que le groupe present :
 * seul le manque est signale, jamais le surplus. Un effectif laisse a zero
 * signifie « non renseigne » et ne declenche aucune alerte.
 */
export interface Manque {
  joueurs: number
  gardiens: number
}

export function manqueEffectif(exercice: Exercice, seance: Seance): Manque | undefined {
  const joueurs = seance.effectifJoueurs > 0 ? exercice.nombreJoueurs - seance.effectifJoueurs : 0
  const gardiens =
    seance.effectifGardiens > 0 ? exercice.nombreGardiens - seance.effectifGardiens : 0
  if (joueurs <= 0 && gardiens <= 0) return undefined
  return { joueurs: Math.max(0, joueurs), gardiens: Math.max(0, gardiens) }
}

/**
 * L'exercice demande-t-il plus de place que la seance n'en a ?
 *
 * Renvoie l'espace RECLAME quand il depasse le disponible, et rien sinon.
 * Exactement le motif de manqueEffectif : un espace non renseigne ne declenche
 * aucune alerte, et un exercice qui tient dans moins de place que disponible
 * n'est jamais signale.
 */
export function manqueEspace(exercice: Exercice, seance: Seance): Espace | undefined {
  if (!seance.espaceDisponible) return undefined
  const requis = RANG_ESPACE[exercice.espace] ?? RANG_ESPACE.demi
  if (requis <= RANG_ESPACE[seance.espaceDisponible]) return undefined
  return exercice.espace
}

/** Vrai des qu'un exercice se heurte a l'effectif OU a l'espace du jour. */
export function exerciceIncompatible(exercice: Exercice, seance: Seance): boolean {
  return manqueEffectif(exercice, seance) !== undefined || manqueEspace(exercice, seance) !== undefined
}

/**
 * Duree totale d'une seance, en minutes.
 *
 * Les exercices marques « en parallele » n'allongent pas la seance : ils se
 * deroulent pendant un autre exercice (par exemple les gardiens a l'ecart).
 */
export function dureeTotale(seance: Seance): number {
  return seance.exercices
    .filter((ex) => !ex.enParallele)
    .reduce((total, ex) => total + (ex.duree || 0), 0)
}

// ---------------------------------------------------------------- Fichiers

/** Enveloppe des fichiers .hbt.json exportes / importes. */
export interface FichierExport {
  format: 'handball-training'
  version: number
  exporteLe: string
  /**
   * Version de l'application qui a produit ce fichier - « v1.1.0 · 2026-08-24 ·
   * d5dc31b ».
   *
   * Une trace de provenance, pas une donnee : rien ne la relit. Elle sert le
   * jour ou un fichier arrive avec un contenu inattendu, et ou la seule
   * question utile est « fabrique par quel exemplaire ? ». Absente des fichiers
   * ecrits avant qu'elle n'existe.
   */
  application?: string
  contenu:
    | { type: 'seance'; seance: Seance }
    | { type: 'exercice'; exercice: Exercice }
    /**
     * Sauvegarde complete : toutes les seances et toute la bibliotheque
     * personnelle. C'est le seul moyen de mettre l'ensemble du travail a l'abri
     * d'un nettoyage du navigateur, qui effacerait tout sans recours.
     *
     * Les fiches fournies masquees y figurent pour la meme raison que les
     * favoris : ce sont des preferences, mais ce fichier est le seul filet, et
     * les omettre reviendrait a promettre de tout sauver en laissant tomber le
     * tri fait dans la bibliotheque.
     */
    | {
        type: 'sauvegarde'
        seances: Seance[]
        modeles: Exercice[]
        favoris: string[]
        masquees?: string[]
        /**
         * L'equipe de l'entraineur. Absente des fichiers ecrits avant que la
         * preference n'existe : la restauration retombe alors sur « aucune ».
         */
        monEquipe?: { equipe: string; categorieAge: string }
      }
}
