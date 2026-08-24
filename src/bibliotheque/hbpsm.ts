/**
 * Les seances du club, transcrites depuis les diaporamas de l'entraineur.
 *
 * Ces fiches ne sont pas des exercices « standards » : ce sont les situations
 * reellement animees a HBPSM, avec leurs baremes de points et leurs consignes
 * telles qu'elles ont ete ecrites. Le texte suit la trame d'origine sans y
 * ajouter d'interpretation.
 *
 * Deux choses meritent d'etre sues avant de s'en servir :
 *
 * - La rubrique « Points cles » est vide partout. La trame de l'entraineur ne
 *   la comporte pas ; plutot que d'inventer ce qu'il regarde, on la laisse a
 *   remplir. C'est le seul endroit ou ces fiches sont incompletes.
 * - Les durees marquees « TPS' » sans chiffre dans le diaporama ont ete
 *   estimees. Elles sont signalees dans la mise en place.
 *
 * Une seule fiche declare des etapes : la montee de balle, qui est le seul
 * enchainement decrit comme une suite. Les autres sont des jeux ou des
 * circuits — leur imposer une choregraphie donnerait une fausse idee de ce
 * qu'elles sont.
 *
 * Source : « Reprise hand ball d'avant saison », vendredi 21 aout 2026.
 */

import { GARDIEN_DROITE, GARDIEN_GAUCHE, ATTAQUE_PLACEE, DEFENSE_6_0 } from './modeles'
import type { ModeleExercice, ModeleJeton } from './modeles'

/**
 * Zone de jeu delimitee au milieu du terrain, pour les situations qui
 * n'utilisent pas les buts.
 */
const ZONE_DELIMITEE: ModeleJeton[] = [
  { type: 'plot', x: 10, y: 3 },
  { type: 'plot', x: 20, y: 3 },
  { type: 'plot', x: 30, y: 3 },
  { type: 'plot', x: 10, y: 17 },
  { type: 'plot', x: 20, y: 17 },
  { type: 'plot', x: 30, y: 17 },
]

export const HBPSM: ModeleExercice[] = [
  {
    titre: 'Échauffement collectif - motricité ballon',
    ref: 'echauffement-collectif-motricite-ballon',
    categorie: 'echauffement',
    duree: 5,
    nombreJoueurs: 12,
    nombreGardiens: 0,
    difficulte: 1,
    materiel: ['un ballon par joueur', 'plots de délimitation'],
    formatGardiens: 'sans',
    vue: 'complet',
    objectifs:
      'Élever la température en retrouvant la manipulation du ballon. Type de situation : échauffement général.',
    formeIntervention: 'Approche inductive',
    misePlace: 'Délimiter un terrain. Un ballon par joueur.',
    fonctionnement:
      'Trottiner en jouant avec la balle sans la faire tomber : autour de la tête, autour de la taille, entre les jambes.',
    regulation: 'Dribbler main forte, main faible, puis en alternance.',
    pointsCles: '',
    evolution:
      'Échanger la balle sur le dribble.\n' +
      "Tout en dribblant, faire perdre le contrôle du ballon à l'adversaire.\n" +
      "Qui perd le contrôle de son ballon sort de l'espace et va toucher le poteau du but le plus éloigné.",
    jetons: [
      ...ZONE_DELIMITEE,
      { type: 'attaquant', x: 13, y: 6 },
      { type: 'ballon', x: 13.8, y: 6 },
      { type: 'attaquant', x: 18, y: 13 },
      { type: 'ballon', x: 18.8, y: 13 },
      { type: 'attaquant', x: 20.5, y: 9.5 },
      { type: 'ballon', x: 21.3, y: 9.5 },
      { type: 'attaquant', x: 23, y: 5 },
      { type: 'ballon', x: 23.8, y: 5 },
      { type: 'attaquant', x: 26, y: 15 },
      { type: 'ballon', x: 26.8, y: 15 },
    ],
  },

  {
    titre: 'Échauffement gardien - trois colonnes et travail intermittent',
    ref: 'echauffement-gardien-trois-colonnes-et-travail-inter',
    categorie: 'gardien',
    duree: 15,
    nombreJoueurs: 9,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: ['2 haies', '1 petite haie', 'échelle de corde', 'un ballon par joueur'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Échauffer le gardien sur des impacts variés tout en faisant travailler les joueurs en intermittent.',
    formeIntervention: 'Couverture PIVOT',
    misePlace:
      '03 colonnes, un ballon chacun.\n' +
      'Colonne 1 : haie + débordement gauche ou droit.\n' +
      'Colonne 2 : échelle de corde, figurée sur le schéma par la série de haies rapprochées.\n' +
      'Colonne 3 : petite haie.',
    fonctionnement: 'Passer sur toutes les colonnes.',
    regulation:
      'Colonne 1 : tir coin court en haut.\n' +
      'Colonne 2 : tir en bas.\n' +
      'Colonne 3 : tir coin court en haut.',
    pointsCles: '',
    evolution:
      'Varier la forme des tirs et leur impact.\n' +
      'Pour le gardien : aller chercher les tirs hauts à deux mains, les tirs bas avec les mains et les pieds.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'haie', x: 26, y: 4 },
      { type: 'attaquant', etiquette: '1', x: 20, y: 4 },
      { type: 'ballon', x: 20.8, y: 4 },
      { type: 'attaquant', etiquette: '1', x: 18.5, y: 4 },
      { type: 'attaquant', etiquette: '1', x: 17, y: 4 },
      { type: 'haie', x: 25, y: 10 },
      { type: 'haie', x: 26, y: 10 },
      { type: 'haie', x: 27, y: 10 },
      { type: 'haie', x: 28, y: 10 },
      { type: 'attaquant', etiquette: '2', x: 20, y: 10 },
      { type: 'attaquant', etiquette: '2', x: 18.5, y: 10 },
      { type: 'attaquant', etiquette: '2', x: 17, y: 10 },
      { type: 'haie', x: 26, y: 16 },
      { type: 'attaquant', etiquette: '3', x: 20, y: 16 },
      { type: 'attaquant', etiquette: '3', x: 18.5, y: 16 },
      { type: 'attaquant', etiquette: '3', x: 17, y: 16 },
    ],
  },

  {
    titre: 'Cardio - PMA avec ballon',
    ref: 'cardio-pma-avec-ballon',
    categorie: 'physique',
    duree: 12,
    nombreJoueurs: 16,
    nombreGardiens: 0,
    difficulte: 2,
    materiel: ['ballons', 'chasubles de quatre couleurs'],
    formatGardiens: 'sans',
    vue: 'complet',
    objectifs:
      'Travailler la puissance maximale aérobie avec ballon, par séquences de trois minutes. Type de situation : PMA avec ballon.',
    misePlace:
      'Faire des équipes de 04.\n' +
      'Durée annoncée dans le diaporama : de 10 à 15 minutes ; la fiche retient 12.',
    fonctionnement:
      'Jouer sur tout le terrain pendant 3 minutes.\n' +
      'À trois équipes : A-B, A-C, B-C.\n' +
      'À quatre équipes : A-B, C-D, A-C, B-D, A-D, B-C.',
    regulation: 'Règles du handball.\nDribble interdit dans sa propre moitié de terrain.',
    pointsCles: '',
    evolution:
      "Dribble interdit sur l'ensemble du terrain.\n" +
      "Puis dribble autorisé sur l'ensemble du terrain.",
    jetons: [
      { type: 'attaquant', etiquette: 'A', x: 10, y: 10 },
      { type: 'ballon', x: 10.8, y: 10 },
      { type: 'attaquant', etiquette: 'A', x: 15, y: 5 },
      { type: 'attaquant', etiquette: 'A', x: 15, y: 15 },
      { type: 'attaquant', etiquette: 'A', x: 20, y: 10 },
      { type: 'defenseur', etiquette: 'B', x: 24, y: 10 },
      { type: 'defenseur', etiquette: 'B', x: 28, y: 5 },
      { type: 'defenseur', etiquette: 'B', x: 28, y: 15 },
      { type: 'defenseur', etiquette: 'B', x: 33, y: 10 },
      { type: 'entraineur', x: 20, y: 19 },
    ],
  },

  {
    titre: 'Attaquer une défense 0-6 - deux 3 contre 3',
    ref: 'attaquer-une-defense-0-6-deux-3-contre-3',
    categorie: 'attaque',
    duree: 20,
    nombreJoueurs: 12,
    nombreGardiens: 1,
    difficulte: 3,
    materiel: ['2 ballons', 'chasubles', '3 plots pour couper le demi-terrain'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Attaquer une défense 0-6 en amenant le tir du côté favorable. Type de situation : jouer une situation de 3 x 3.',
    misePlace:
      '2 équipes de 6.\n' +
      'Couper le demi-terrain en 2.\n' +
      'Durée laissée vide dans le diaporama ; la fiche retient 20 minutes.',
    fonctionnement:
      "Jouer un 3 x 3 : sur une partie un ailier, un arrière et le demi-centre ; sur l'autre un ailier, un arrière et le pivot.\n" +
      'Défense en 0-6 mixte.',
    regulation:
      'La défense ne doit pas se faire passer du côté du bras porteur de balle.\n' +
      "Pour la défense : +01 point si le tir est amené du côté du bras non porteur de balle ou de l'ailier ; -2 si le tir est pris du côté du bras porteur de balle ou du pivot.",
    pointsCles: '',
    evolution:
      "Les arrières ne peuvent mettre qu'un pied dans les 9 m.\nInterdire le dribble.",
    jetons: [
      GARDIEN_DROITE,
      // Bloc defensif releve sur le schema de l'entraineur : six defenseurs,
      // trois par demi-espace, plus avances que la 0-6 de reference.
      { type: 'defenseur', etiquette: '6', x: 35.5, y: 18.3 },
      { type: 'defenseur', etiquette: '5', x: 34.1, y: 15.4 },
      { type: 'defenseur', etiquette: '4', x: 32.8, y: 11.4 },
      { type: 'defenseur', etiquette: '3', x: 32.4, y: 7.7 },
      { type: 'defenseur', etiquette: '2', x: 32.5, y: 4.2 },
      { type: 'defenseur', etiquette: '1', x: 35.5, y: 1.3 },
      // Demi-espace haut : ailier, arriere, demi-centre.
      { type: 'attaquant', etiquette: 'AlG', x: 37, y: 18.8 },
      { type: 'attaquant', etiquette: 'ArG', x: 31.5, y: 14.5 },
      { type: 'attaquant', etiquette: 'DC', x: 30.5, y: 12 },
      { type: 'ballon', x: 30.8, y: 14.1 },
      // Demi-espace bas : ailier, arriere, pivot.
      { type: 'attaquant', etiquette: 'AlD', x: 37, y: 1.2 },
      { type: 'attaquant', etiquette: 'ArD', x: 31.5, y: 5.5 },
      { type: 'attaquant', etiquette: 'PIV', x: 34, y: 6.8 },
      { type: 'ballon', x: 30.8, y: 5.9 },
      // Ligne de partage du demi-terrain.
      { type: 'plot', x: 24, y: 10 },
      { type: 'plot', x: 28, y: 10 },
      { type: 'plot', x: 32, y: 10 },
    ],
  },

  {
    titre: 'Projet de jeu en transition - montée de balle',
    ref: 'projet-de-jeu-en-transition-montee-de-balle',
    categorie: 'transition',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      'Monter la balle vite et large dès la récupération du gardien, en se désalignant du porteur. Type de situation : jeu de transition.',
    formeIntervention: 'Montée de balle',
    misePlace:
      'Des trinômes avec ballon répartis sur les ailes droites.\n' +
      'Couper le terrain sur la longueur.\n' +
      'Durée laissée vide dans le diaporama ; la fiche retient 15 minutes.',
    fonctionnement:
      'Ballon au gardien = départ.\nMonter la balle.\nLe tireur ne replie pas.',
    regulation: 'Jouer en fonction des défenseurs.\nSe désaligner du porteur de balle.',
    pointsCles: '',
    evolution: "Relance possible sur l'ailier.",
    consigneInitiale:
      "Le trinôme attend sur l'aile droite. Le ballon est au gardien : c'est lui qui déclenche.",
    etapes: [
      {
        titre: 'Départ',
        consigne:
          "Le gardien relève la balle. L'axe vient à la rencontre, les deux autres s'écartent.",
        mouvements: [
          { jeton: 'axe', type: 'course', vers: { x: 10, y: 6 } },
          { jeton: 'gbg', type: 'passe', cible: 'axe' },
          { jeton: 'aild', type: 'course', vers: { x: 13, y: 2 } },
          { jeton: 'ailg', type: 'course', vers: { x: 13, y: 10 } },
        ],
      },
      {
        titre: 'Montée de balle',
        consigne:
          'Les trois montent en occupant la largeur. Le porteur cherche le joueur désaligné, côté opposé au repli.',
        mouvements: [
          { jeton: 'axe', type: 'course', vers: { x: 20, y: 8 } },
          { jeton: 'aild', type: 'course', vers: { x: 24, y: 2.5 } },
          { jeton: 'ailg', type: 'course', vers: { x: 22, y: 15 } },
          { jeton: 'r1', type: 'course', vers: { x: 28, y: 7 } },
          { jeton: 'r2', type: 'course', vers: { x: 30, y: 13 } },
          { jeton: 'axe', type: 'passe', cible: 'ailg' },
        ],
      },
      {
        titre: 'Fixation',
        consigne:
          "Le receveur enchaîne sans temps mort et attaque l'intervalle laissé par le repli.",
        mouvements: [
          { jeton: 'ailg', type: 'course', vers: { x: 31, y: 16.5 } },
          { jeton: 'aild', type: 'course', vers: { x: 33, y: 3 } },
          { jeton: 'r2', type: 'course', vers: { x: 32.5, y: 14 } },
        ],
      },
      {
        titre: 'Tir, et pas de repli',
        consigne: "Tir. Le tireur reste devant : c'est la consigne de la situation.",
        mouvements: [{ jeton: 'ailg', type: 'tir', vers: { x: 40, y: 11.2 } }],
      },
    ],
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'ballon', x: 2, y: 10 },
      { type: 'attaquant', etiquette: 'AlD', ref: 'aild', x: 5, y: 2 },
      { type: 'attaquant', etiquette: 'DC', ref: 'axe', x: 7, y: 3.5 },
      { type: 'attaquant', etiquette: 'AlG', ref: 'ailg', x: 9, y: 2 },
      { type: 'defenseur', etiquette: 'R1', ref: 'r1', x: 24, y: 8 },
      { type: 'defenseur', etiquette: 'R2', ref: 'r2', x: 27, y: 13 },
    ],
  },

  {
    titre: 'Jeu grand espace - 6 contre 6',
    ref: 'jeu-grand-espace-6-contre-6',
    categorie: 'jeu',
    duree: 20,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Réinvestir la montée de balle et l'attaque du côté favorable dans le jeu complet, sous un barème qui récompense la transition et le pivot.",
    misePlace: '06 défenseurs contre 06 attaquants.',
    fonctionnement: 'Jouer un 6x6.',
    regulation:
      '15 minutes.\n' +
      'Si but sur jeu de transition ou sur engagement rapide : 2 attaques placées, sinon 1 attaque placée.\n' +
      '02 points sur but du pivot.\n' +
      "Pour la défense : 01 point par récupération de balle, ou par tir pris du côté du bras non porteur de balle par l'arrière côté pivot.",
    pointsCles: '',
    evolution: '5 minutes de jeu libre.',
    jetons: [
      GARDIEN_DROITE,
      GARDIEN_GAUCHE,
      ...ATTAQUE_PLACEE,
      ...DEFENSE_6_0,
      { type: 'ballon', x: 29.7, y: 10 },
    ],
  },
]
