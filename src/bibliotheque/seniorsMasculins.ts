/**
 * Exercices de reference pour un groupe seniors masculins (+18 ans).
 *
 * Volume et intensite calibres pour une seance de 90 minutes en semaine :
 * echauffement, travail technique, secteur de jeu, puis situation de match.
 */

import {
  ATTAQUE_DEUX_PIVOTS,
  ATTAQUE_PLACEE,
  DEFENSE_3_2_1,
  DEFENSE_5_1,
  DEFENSE_6_0,
  GARDIEN_DROITE,
  GARDIEN_GAUCHE,
  type ModeleExercice,
} from './modeles'

export const SENIORS_MASCULINS: ModeleExercice[] = [
  {
    titre: 'Echauffement en montee de balle, 3 couloirs',
    ref: 'echauffement-en-montee-de-balle-3-couloirs',
    categorie: 'echauffement',
    duree: 12,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      'Elever progressivement la temperature corporelle, remettre en place les repères de largeur et la qualite de passe en course.',
    fonctionnement:
      "Trois colonnes reparties sur la largeur, un ballon par vague. La vague part de la ligne de but, traverse le terrain en trois passes minimum sans que le ballon touche le sol, et termine par un tir en course.\n" +
      'Le porteur ne fait jamais plus de trois appuis. Les joueurs sans ballon courent en avance sur le porteur, jamais dans son dos.\n' +
      'Retour au trot par les cotes. 8 a 10 vagues, puis on ajoute une passe en retrait avant le tir.',
    pointsCles:
      "Largeur reelle : les couloirs exterieurs restent a moins de deux metres de la ligne de touche.\n" +
      'Passe devant le joueur, dans sa course, jamais sur son epaule arriere.\n' +
      "Regarder le but avant de recevoir : la tete se leve avant que le ballon n'arrive.",
    evolution:
      "Simplifier : partir a deux joueurs, sans opposition ni contrainte de nombre de passes.\n" +
      'Complexifier : un defenseur passif recule dans le couloir central, obligeant a fixer avant de transmettre.',
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: '1', x: 6, y: 17 },
      { type: 'attaquant', etiquette: '2', x: 6, y: 10 },
      { type: 'attaquant', etiquette: '3', x: 6, y: 3 },
      { type: 'ballon', x: 7.26, y: 10.34 },
      { type: 'plot', x: 20, y: 17 },
      { type: 'plot', x: 20, y: 3 },
    ],
  },

  {
    titre: 'Gammes de passes et appuis face au but',
    ref: 'gammes-de-passes-et-appuis-face-au-but',
    categorie: 'technique',
    duree: 10,
    nombreJoueurs: 10,
    nombreGardiens: 1,
    difficulte: 1,
    materiel: ['3 ballons', '6 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Fiabiliser la passe a une main en mouvement et installer un rythme a trois appuis avant le tir.',
    fonctionnement:
      "Deux colonnes a 9 metres, un passeur fixe a chaque poste arriere. Le joueur part, recoit dans la course, enchaine trois appuis et rend le ballon au passeur avant de reprendre sa place.\n" +
      'Trois series de 90 secondes, en alternant le cote de depart. Sur la derniere serie, le joueur termine par un tir.',
    pointsCles:
      "Le ballon se recoit a deux mains, se protege pres du corps, se lance a une main.\n" +
      "Appui gauche - droit - gauche pour un droitier : le rythme est le meme sur toutes les repetitions.\n" +
      "Le bras armé haut des la reception, pas au moment du tir.",
    evolution:
      'Complexifier : imposer une feinte de passe avant le dernier appui, puis un tir a la hanche.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'entraineur', etiquette: 'P', x: 31, y: 14.5 },
      { type: 'entraineur', etiquette: 'P', x: 31, y: 5.5 },
      { type: 'attaquant', etiquette: '1', x: 26, y: 15 },
      { type: 'attaquant', etiquette: '2', x: 26, y: 5 },
      { type: 'ballon', x: 31, y: 14.5 },
      { type: 'plot', x: 30, y: 12 },
      { type: 'plot', x: 30, y: 8 },
    ],
  },

  {
    titre: 'Croise arriere - ailier cote droit',
    ref: 'croise-arriere-ailier-cote-droit',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Creer un decalage sur l'aile en fixant le defenseur exterieur, et liberer un tir a 6 metres ou un tir de l'aile.",
    fonctionnement:
      "Attaque placee face a une defense 6-0 d'abord passive, puis semi-active.\n" +
      "L'arriere droit part en un contre un vers l'exterieur pour fixer le defenseur numero 1. L'ailier droit demarre au moment ou l'arriere engage son deuxieme appui, croise dans son dos et recoit dans l'intervalle.\n" +
      "Si le defenseur exterieur suit l'ailier, l'arriere garde le ballon et tire a 9 metres. 6 repetitions par cote, puis on inverse.",
    pointsCles:
      "Le croise part tard : trop tot, le defenseur voit tout venir.\n" +
      "L'arriere doit reellement menacer le but, sinon la fixation n'existe pas.\n" +
      "La passe se donne a hauteur de hanche, dans le sens de la course de l'ailier.",
    evolution:
      "Simplifier : defense passive avec interdiction de suivre le croise.\n" +
      'Complexifier : defense active, et ajout du pivot qui vient bloquer le defenseur numero 2.',
    consigneInitiale:
      "Attaque placee face a une 6-0. Le ballon part de l'arriere droit.",
    etapes: [
      {
        titre: 'Fixation',
        consigne: "L'arriere droit attaque l'exterieur pour fixer le defenseur 1.",
        mouvements: [
          { jeton: 'ard', type: 'course', vers: { x: 33.4, y: 4.2 } },
          { jeton: 'd1', type: 'course', vers: { x: 34.4, y: 3.9 } },
        ],
      },
      {
        titre: 'Croise',
        consigne: "L'ailier croise dans le dos de l'arriere et recoit dans l'intervalle.",
        mouvements: [
          { jeton: 'ald', type: 'course', vers: { x: 34.2, y: 6.6 } },
          { jeton: 'ard', type: 'passe', cible: 'ald' },
        ],
      },
      {
        titre: 'Tir',
        consigne: "Tir a 6 metres dans l'intervalle libere.",
        mouvements: [{ jeton: 'ald', type: 'tir', vers: { x: 40, y: 9.4 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 30.58, y: 6.42 }],
  },

  {
    titre: 'Passe et va avec le pivot',
    ref: 'passe-et-va-avec-le-pivot',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 10,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['3 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Utiliser le pivot comme point de fixation et exploiter immediatement le decalage cree par la relation a deux.',
    fonctionnement:
      "Travail sur le secteur central. Le demi-centre donne au pivot qui se demarque dans l'intervalle 3-4, puis part immediatement dans le dos de son defenseur.\n" +
      'Le pivot rend le ballon dans la course, ou tire lui-meme si le bloc se referme sur le demi-centre.\n' +
      'Deux series de 8 repetitions, une avec pivot cote gauche, une avec pivot cote droit.',
    pointsCles:
      "Le pivot demande le ballon main tendue, du cote oppose au defenseur.\n" +
      'Le demi-centre part sans ralentir apres sa passe : la vitesse est ce qui cree le decalage.\n' +
      "La remise se fait a une main, sans se retourner completement.",
    evolution:
      "Complexifier : interdire le tir au demi-centre, obliger a ressortir sur un arriere pour un tir a 9 metres.",
    consigneInitiale: 'Secteur central, ballon au demi-centre.',
    etapes: [
      {
        titre: 'Le pivot se demarque',
        consigne: "Le pivot se montre dans l'intervalle 3-4, le demi-centre lui donne.",
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.4, y: 11.4 } },
          { jeton: 'dc', type: 'passe', cible: 'piv' },
        ],
      },
      {
        titre: 'Passe et va',
        consigne: 'Le demi-centre part aussitot dans le dos de son defenseur.',
        mouvements: [
          { jeton: 'dc', type: 'course', vers: { x: 32.6, y: 8.6 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.4, y: 9.6 } },
        ],
      },
      {
        titre: 'Remise et tir',
        consigne: 'Le pivot rend le ballon dans la course, tir a 6 metres.',
        mouvements: [
          { jeton: 'piv', type: 'passe', cible: 'dc' },
          { jeton: 'dc', type: 'tir', vers: { x: 40, y: 10.6 } },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 29.58, y: 10.92 }],
  },

  {
    titre: 'Ecran du pivot pour le tir a 9 metres',
    ref: 'ecran-du-pivot-pour-le-tir-a-9-metres',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Liberer un tir de loin en supprimant le defenseur direct de l'arriere, et lire la reaction du bloc.",
    fonctionnement:
      "Le pivot vient poser un ecran sur le defenseur numero 2, epaule contre epaule, sans le pousser.\n" +
      "L'arriere gauche attaque l'espace libere et tire a 9 metres.\n" +
      '10 repetitions, puis meme travail de l autre cote.',
    pointsCles:
      "L'ecran se pose avant l'arrivee de l'arriere, immobile au moment du contact : sinon c'est une faute.\n" +
      'Le tireur passe au contact de son pivot, pas a deux metres.\n' +
      "Apres l'ecran, le pivot ne reste jamais spectateur : il se retourne systematiquement.",
    evolution:
      "Simplifier : sans gardien, tir sur but vide pour se concentrer sur le placement de l'ecran.\n" +
      "Complexifier : la defense a le droit de changer d'adversaire. Les attaquants doivent voir le changement, et le pivot se retourne alors pour se demarquer vers le but et recevoir.",
    consigneInitiale: "Ballon a l'arriere gauche, pivot cote gauche.",
    etapes: [
      {
        titre: "Pose de l'ecran",
        consigne: 'Le pivot vient bloquer le defenseur 5, epaule contre epaule.',
        mouvements: [{ jeton: 'piv', type: 'ecran', vers: { x: 33.4, y: 12.6 } }],
      },
      {
        titre: 'Sortie et tir a 9 metres',
        consigne: "L'arriere gauche attaque l'espace libere et tire par-dessus le bloc.",
        mouvements: [
          { jeton: 'arg', type: 'course', vers: { x: 31.6, y: 12.4 } },
          { jeton: 'arg', type: 'tir', vers: { x: 40, y: 11 } },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 30.58, y: 15.42 }],
  },

  {
    titre: 'Circulation 3 contre 3 sur un demi-espace',
    ref: 'circulation-3-contre-3-sur-un-demi-espace',
    categorie: 'attaque',
    duree: 12,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'zone',
    objectifs:
      'Travailler la continuite : enchainer deux intentions sans temps mort quand la premiere ne passe pas.',
    fonctionnement:
      "Trois attaquants (arriere, demi-centre, ailier) contre trois defenseurs sur une moitie de la surface. Le reste du groupe attend derriere la ligne des 9 metres.\n" +
      'Obligation de tenter une premiere intention, puis, si elle echoue, un renversement immediat vers le troisieme joueur.\n' +
      'Un but marque vaut un point, une attaque conclue sans perte de balle vaut un point. Series de 3 minutes.',
    pointsCles:
      'Aucune passe en arriere apres la premiere intention : le ballon avance ou se renverse, il ne recule pas.\n' +
      'Les non-porteurs se replacent en permanence a distance de passe.\n' +
      'La deuxieme intention part avant que la defense ne soit replacee.',
    evolution:
      "Complexifier : limiter chaque attaque a 12 secondes.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'ArG', x: 31.5, y: 14.5 },
      { type: 'attaquant', etiquette: 'DC', x: 30.5, y: 10 },
      { type: 'attaquant', etiquette: 'AlG', x: 36.5, y: 18.3 },
      { type: 'defenseur', etiquette: '4', x: 33.4, y: 11 },
      { type: 'defenseur', etiquette: '5', x: 33.9, y: 13 },
      { type: 'defenseur', etiquette: '6', x: 35.18, y: 15.4 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Defense 6-0 : glissement et aide sur le pivot',
    ref: 'defense-6-0-glissement-et-aide-sur-le-pivot',
    categorie: 'defense',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Coordonner le glissement lateral du bloc et maintenir le contact permanent sur le pivot.',
    fonctionnement:
      "Attaque a six qui fait tourner le ballon d'une aile a l'autre, sans tir dans un premier temps.\n" +
      'Le bloc glisse en restant groupe : le defenseur cote ballon sort au contact, les autres se resserrent. Le defenseur central au contact du pivot ne le lache jamais.\n' +
      "Apres 4 tours de ballon, l'attaque a le droit de conclure. 6 sequences.",
    pointsCles:
      "Les epaules restent face au ballon, jamais de course de cote en croisant les appuis.\n" +
      'Un seul defenseur sort a la fois : deux sorties simultanees ouvrent un intervalle.\n' +
      "Le contact sur le pivot se garde avec l'avant-bras, sans ceinturer.",
    evolution:
      "Simplifier : l'attaque annonce a voix haute le sens de circulation.\n" +
      'Complexifier : ajouter un deuxieme pivot pour saturer le secteur central.',
    consigneInitiale: "Ballon a l'aile gauche, bloc regroupe.",
    etapes: [
      {
        titre: 'Le ballon rentre',
        consigne: "Le defenseur 5 sort au contact, les autres se resserrent.",
        mouvements: [
          { jeton: 'alg', type: 'passe', cible: 'arg' },
          { jeton: 'd5', type: 'course', vers: { x: 33, y: 13.6 } },
          { jeton: 'd4', type: 'course', vers: { x: 33.6, y: 11.6 } },
        ],
      },
      {
        titre: 'Renversement au centre',
        consigne: 'Le bloc glisse : le 4 sort, le 5 rentre, le 3 garde le pivot.',
        mouvements: [
          { jeton: 'arg', type: 'passe', cible: 'dc' },
          { jeton: 'd4', type: 'course', vers: { x: 32.9, y: 10.8 } },
          { jeton: 'd5', type: 'course', vers: { x: 33.98, y: 13 } },
        ],
      },
      {
        titre: 'Le pivot cherche l intervalle',
        consigne: "Le defenseur 3 suit le pivot sans jamais rompre le contact.",
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.5, y: 11.6 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.7, y: 10.4 } },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 36.16, y: 17.04 }],
  },

  {
    titre: 'Defense 5-1 : le pointe et la relation avec les demi-centres',
    ref: 'defense-5-1-le-pointe-et-la-relation-avec-les-demi-c',
    categorie: 'defense',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 1,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Gener la construction adverse en avancant sur le demi-centre, sans ouvrir le couloir central.',
    fonctionnement:
      "Mise en place du 5-1 face a une attaque placee. Le joueur a la pointe harcele le demi-centre et oriente le jeu vers un cote.\n" +
      'Les deux defenseurs centraux couvrent son dos en permanence. Quand le ballon part sur une aile, la pointe decroche et vient aider sur le pivot.\n' +
      "Sequences de 90 secondes, l'attaque cherche a traverser le centre.",
    pointsCles:
      "La pointe avance sur la passe, pas sur le porteur deja installe.\n" +
      "Le dos de la pointe est toujours couvert : si les deux centraux sortent, l'exercice est manque.\n" +
      'Communiquer a voix haute a chaque changement de cote.',
    evolution:
      "Simplifier : commencer sans pivot, a cinq attaquants.\n" +
      'Complexifier : autoriser les attaquants a permuter arriere et demi-centre.',
    consigneInitiale: 'Ballon au demi-centre, la pointe face a lui.',
    etapes: [
      {
        titre: 'La pointe oriente le jeu',
        consigne: "Elle avance sur la passe et pousse le ballon vers un cote.",
        mouvements: [
          { jeton: 'dc', type: 'passe', cible: 'arg' },
          { jeton: 'dp', type: 'course', vers: { x: 31.6, y: 12.6 } },
        ],
      },
      {
        titre: 'Sortie et couverture',
        consigne: 'Le 4 sort au contact, le 3 couvre le dos de la pointe.',
        mouvements: [
          { jeton: 'd4', type: 'course', vers: { x: 32.9, y: 12.8 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.6, y: 10.6 } },
        ],
      },
      {
        titre: 'Le pivot dans le dos de la pointe',
        consigne: "C'est l'espace que la 5-1 laisse : il doit etre couvert.",
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.5, y: 11.4 } },
          { jeton: 'arg', type: 'passe', cible: 'piv' },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_5_1, { type: 'ballon', x: 29.58, y: 10.92 }],
  },

  {
    titre: 'Contre-attaque directe apres arret du gardien',
    ref: 'contre-attaque-directe-apres-arret-du-gardien',
    categorie: 'transition',
    duree: 12,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      'Enchainer arret, relance longue et finition en moins de six secondes, en gardant la lucidite dans le tir.',
    fonctionnement:
      "Un tireur declenche a 9 metres. Des l'arret, les deux ailiers partent sur les cotes et le gardien relance sur le premier disponible.\n" +
      'Course jusqu au but oppose, un contre zero puis un contre un avec un defenseur qui part avec deux metres de retard.\n' +
      '8 series par joueur, recuperation en marchant sur le retour.',
    pointsCles:
      "L'ailier part avant que le gardien n'ait le ballon en main, sur la trajectoire du tir.\n" +
      'La relance est tendue, devant le joueur, pas en cloche.\n' +
      'Finir en course sans se desunir : la vitesse ne doit pas couter la precision.',
    evolution:
      "Complexifier : deux defenseurs de retard, obligeant a une passe en course.",
    consigneInitiale: "Un tireur a 9 metres, les deux ailiers prets a partir.",
    etapes: [
      {
        titre: "Tir et depart des ailiers",
        consigne: "Les ailiers partent AVANT que le gardien n'ait le ballon en main.",
        mouvements: [
          { jeton: 'tireur', type: 'tir', vers: { x: 39.4, y: 10 } },
          { jeton: 'alg', type: 'course', vers: { x: 14, y: 18.3 } },
          { jeton: 'ald', type: 'course', vers: { x: 14, y: 1.7 } },
        ],
      },
      {
        titre: 'Relance longue',
        consigne: "Le gardien relance tendu devant l'ailier, jamais en cloche.",
        mouvements: [
          { jeton: 'gb', type: 'passe', cible: 'alg' },
          { jeton: 'alg', type: 'course', vers: { x: 24, y: 18 } },
          { jeton: 'def', type: 'course', vers: { x: 12, y: 12 } },
        ],
      },
      {
        titre: 'Le defenseur revient',
        consigne: 'Le repli adverse rattrape : le un contre zero devient un contre un.',
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 9, y: 17.6 } },
          { jeton: 'def', type: 'course', vers: { x: 7.6, y: 15.2 } },
        ],
      },
      {
        titre: "Tir en course a l'aile",
        consigne: "L'ailier entre dans la zone et tire avant d'etre rejoint.",
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 5.6, y: 16.4 } },
          { jeton: 'alg', type: 'tir', vers: { x: 0.6, y: 10.6 } },
        ],
      },
    ],
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'T', ref: 'tireur', x: 31, y: 10 },
      { type: 'attaquant', etiquette: 'AlG', ref: 'alg', x: 4, y: 18.3 },
      { type: 'attaquant', etiquette: 'AlD', ref: 'ald', x: 4, y: 1.7 },
      { type: 'defenseur', etiquette: 'D', ref: 'def', x: 8, y: 10 },
      { type: 'ballon', x: 30.08, y: 10.92 },
    ],
  },

  {
    titre: 'Repli defensif : 2 contre 2 puis 3 contre 3',
    ref: 'repli-defensif-2-contre-2-puis-3-contre-3',
    categorie: 'transition',
    duree: 12,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Freiner la contre-attaque adverse en priorite sur l'axe, et reconstruire un bloc avant l'arrivee du troisieme joueur.",
    fonctionnement:
      "Deux attaquants partent en contre-attaque contre deux defenseurs places au milieu de terrain. Au signal, un troisieme attaquant et un troisieme defenseur entrent en jeu.\n" +
      "Les defenseurs doivent d'abord proteger l'axe, puis se repartir les adversaires a voix haute.\n" +
      '10 sequences, rotation complete des roles.',
    pointsCles:
      "Reculer face au jeu, jamais en tournant le dos au ballon.\n" +
      "Le premier defenseur prend le porteur, le second couvre l'espace, pas un adversaire.\n" +
      'Annoncer sa prise en charge : le silence est la principale cause de but encaisse.',
    evolution: 'Complexifier : passer a 4 contre 3, en desavantage numerique permanent.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: '1', x: 16, y: 13 },
      { type: 'attaquant', etiquette: '2', x: 16, y: 7 },
      { type: 'attaquant', etiquette: '3', x: 11, y: 10 },
      { type: 'defenseur', etiquette: 'A', x: 22, y: 12 },
      { type: 'defenseur', etiquette: 'B', x: 22, y: 8 },
      { type: 'ballon', x: 17.26, y: 13.34 },
    ],
  },

  {
    titre: 'Circuit intermittent avec ballon',
    ref: 'circuit-intermittent-avec-ballon',
    categorie: 'physique',
    duree: 12,
    nombreJoueurs: 12,
    nombreGardiens: 0,
    difficulte: 2,
    materiel: ['8 plots', '4 haies basses', '4 ballons'],
    formatGardiens: 'sans',
    vue: 'complet',
    objectifs:
      'Maintenir la qualite technique sous fatigue, sur des efforts courts proches de ceux du match.',
    fonctionnement:
      "Quatre ateliers enchaines : course avant-arriere entre deux plots, franchissement de haies basses, sprint sur 15 metres avec ballon, tir en course.\n" +
      '30 secondes de travail, 30 secondes de recuperation, 8 tours. La derniere serie se fait en opposition par deux.',
    pointsCles:
      "La qualite du dernier tir compte autant que le temps : un tir rate annule le tour.\n" +
      'Poser le pied complet dans les changements de direction, genou dans l axe.\n' +
      'Respiration controlee pendant la recuperation, rester debout plutot que se plier.',
    evolution:
      'Simplifier : 20 secondes de travail pour 40 de recuperation.\n' +
      'Complexifier : ajouter une opposition sur le dernier atelier.',
    jetons: [
      { type: 'plot', x: 8, y: 15 },
      { type: 'plot', x: 14, y: 15 },
      { type: 'haie', x: 18, y: 10 },
      { type: 'haie', x: 21, y: 10 },
      { type: 'plot', x: 26, y: 5 },
      { type: 'plot', x: 32, y: 5 },
      { type: 'ballon', x: 26, y: 5 },
    ],
  },

  {
    titre: 'Match a theme : deux passes minimum apres recuperation',
    ref: 'match-a-theme-deux-passes-minimum-apres-recuperation',
    categorie: 'jeu',
    duree: 20,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      'Reinvestir le travail de la seance dans un jeu reel, en gardant une contrainte qui oriente le comportement collectif.',
    fonctionnement:
      "Match a effectif reduit sur tout le terrain. Apres chaque recuperation de balle, l'equipe doit realiser au moins deux passes avant de pouvoir tirer.\n" +
      "Un but sur contre-attaque conclue en moins de huit secondes vaut double.\n" +
      'Deux mi-temps de 8 minutes, avec une minute de pause pour un retour collectif.',
    pointsCles:
      "La contrainte ne doit pas ralentir le jeu : les deux passes se font en avancant.\n" +
      "Observer si les intentions travaillees dans la seance reapparaissent sans consigne.\n" +
      "Laisser jouer : peu d'arrets, les corrections se font a la pause.",
    evolution:
      "Complexifier : imposer que le pivot touche le ballon avant chaque tir.\n" +
      'Simplifier : supprimer la contrainte de passes sur les cinq dernieres minutes.',
    jetons: [GARDIEN_GAUCHE, GARDIEN_DROITE, { type: 'ballon', x: 20, y: 10 }],
  },

  // --------------------------------------------------- Complements de reference

  {
    titre: 'Echauffement prophylactique : epaules, genoux, chevilles',
    ref: 'echauffement-prophylactique-epaules-genoux-chevilles',
    categorie: 'echauffement',
    duree: 12,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['1 elastique par joueur', '6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Preparer les trois zones qui concentrent les blessures en handball adulte - epaule, genou, cheville - avant toute mise en charge de la seance.",
    fonctionnement:
      "Trois ateliers de quatre minutes, tout le groupe en meme temps, gardiens compris.\n" +
      "Epaules : rotations externes a l'elastique, 2 x 12 par bras, puis armes lents sans ballon, puis 20 passes progressives a deux en montant l'amplitude.\n" +
      "Genoux : fentes avant controlees, puis reception sur un pied apres un petit saut, 8 par jambe, en tenant la position trois secondes.\n" +
      "Chevilles : montees sur pointes, puis appuis lateraux entre deux plots, puis courses en pas chasses avec changement de sens au signal.",
    pointsCles:
      "La qualite prime sur le nombre : une reception genou dans l'axe vaut mieux que dix repetitions rapides.\n" +
      "Aucun tir avant la fin de la sequence epaules : le bras se chauffe en montant l'amplitude, jamais d'entree.\n" +
      "Meme routine a chaque seance : c'est la repetition hebdomadaire qui protege, pas l'exercice isole.",
    evolution:
      "Sans elastique : rotations avec un ballon leger tenu a bout de bras.\n" +
      "Complexifier : ajouter un travail d'equilibre yeux fermes sur la partie genoux.",
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: '1', x: 12, y: 14 },
      { type: 'attaquant', etiquette: '2', x: 12, y: 6 },
      { type: 'attaquant', etiquette: '3', x: 20, y: 14 },
      { type: 'attaquant', etiquette: '4', x: 20, y: 6 },
      { type: 'plot', x: 16, y: 10 },
      { type: 'plot', x: 24, y: 10 },
    ],
  },

  {
    titre: 'Ballon chasseur en zone : reveil et prise d information',
    ref: 'ballon-chasseur-en-zone-reveil-et-prise-d-informatio',
    categorie: 'echauffement',
    duree: 8,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['2 ballons mousse', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Lancer la seance par un jeu qui force a lever la tete, a se demarquer et a changer de direction sans y penser.",
    fonctionnement:
      "Terrain reduit entre les deux lignes de 9 metres. Deux chasseurs avec un ballon mousse doivent toucher les autres joueurs sous la ceinture.\n" +
      "Le porteur ne peut pas se deplacer avec le ballon : les chasseurs doivent se faire des passes pour avancer. Un joueur touche devient chasseur.\n" +
      "Trois manches de deux minutes. Les gardiens jouent avec le groupe.",
    pointsCles:
      "Les chasseurs gagnent en se coordonnant, pas en courant : c'est le ballon qui doit se deplacer le plus vite.\n" +
      "Les joueurs poursuivis regardent le ballon, pas le chasseur le plus proche.\n" +
      "Intensite libre mais continue : personne ne marche.",
    evolution:
      "Simplifier : un seul chasseur et un terrain plus grand.\n" +
      "Complexifier : deux ballons en jeu, et le joueur touche reste chasseur jusqu'a la fin de la manche.",
    jetons: [
      { type: 'attaquant', etiquette: 'C', x: 16, y: 13 },
      { type: 'attaquant', etiquette: 'C', x: 24, y: 7 },
      { type: 'defenseur', etiquette: '1', x: 14, y: 6 },
      { type: 'defenseur', etiquette: '2', x: 20, y: 15 },
      { type: 'defenseur', etiquette: '3', x: 26, y: 11 },
      { type: 'ballon', x: 17.26, y: 13.34 },
    ],
  },

  {
    titre: 'Duel un contre un a 9 metres, depart decale',
    ref: 'duel-un-contre-un-a-9-metres-depart-decale',
    categorie: 'technique',
    duree: 12,
    nombreJoueurs: 10,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: ['4 ballons', '4 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Gagner son duel par la vitesse du premier appui et par le choix, pas par la force : tirer, passer ou deborder selon la reaction du defenseur.",
    fonctionnement:
      "Un attaquant a 11 metres, un defenseur a 8 metres, decale d'un metre sur le cote. L'attaquant recoit du passeur et attaque l'intervalle.\n" +
      "Le defenseur ne peut avancer qu'au moment de la passe : l'attaquant part donc avec un temps d'avance qu'il doit exploiter tout de suite.\n" +
      "Trois issues autorisees : tir a 9 metres si le defenseur recule, debordement si le defenseur sort trop haut, remise a l'appui si le duel est perdu.\n" +
      "6 duels par joueur, on change de role a chaque tour.",
    pointsCles:
      "Le premier appui se pose dans l'intervalle, pas devant le defenseur.\n" +
      "Le regard reste sur les appuis du defenseur : c'est lui qui donne la solution.\n" +
      "Pas de dribble inutile : un seul dribble maximum avant de decider.",
    evolution:
      "Simplifier : defenseur passif, bras dans le dos, l'attaquant choisit librement.\n" +
      "Complexifier : ajouter un deuxieme defenseur en couverture, l'attaquant doit alors trouver la remise.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'entraineur', etiquette: 'P', x: 28, y: 14 },
      { type: 'attaquant', etiquette: 'A', x: 29, y: 10 },
      { type: 'defenseur', etiquette: 'D', x: 32, y: 11 },
      { type: 'ballon', x: 28, y: 14 },
      { type: 'plot', x: 29, y: 6 },
      { type: 'plot', x: 29, y: 14 },
    ],
  },

  {
    titre: 'Tirs de l aile : angle, appuis et suspension',
    ref: 'tirs-de-l-aile-angle-appuis-et-suspension',
    categorie: 'technique',
    duree: 12,
    nombreJoueurs: 8,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'zone',
    objectifs:
      "Ouvrir l'angle de tir depuis l'aile : entrer dans la zone au bon moment, monter haut, et choisir sa cible selon la sortie du gardien.",
    fonctionnement:
      "Deux colonnes, une a chaque aile. Le passeur sert l'ailier qui entre dans la zone en trois appuis et tire en suspension.\n" +
      "Premiere serie : tir au premier poteau. Deuxieme serie : tir au deuxieme poteau, par-dessus le bras du gardien. Troisieme serie : le gardien choisit sa sortie, l'ailier decide en l'air.\n" +
      "8 tirs par ailier et par serie, en alternant les deux cotes.",
    pointsCles:
      "Entrer vers le but, pas le long de la ligne de zone : c'est la trajectoire qui ouvre l'angle.\n" +
      "Monter haut et rester en l'air : le tir se declenche au sommet, pas a la retombee.\n" +
      "Regarder la position des appuis du gardien avant l'impulsion, plus le corps apres.",
    evolution:
      "Simplifier : tir sans opposition, gardien qui laisse une moitie de cage ouverte.\n" +
      "Complexifier : ajouter un defenseur exterieur qui ferme le premier poteau, imposant le tir au deuxieme.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'AlG', x: 33, y: 18.3 },
      { type: 'attaquant', etiquette: 'AlD', x: 33, y: 1.7 },
      { type: 'entraineur', etiquette: 'P', x: 31, y: 14.5 },
      { type: 'entraineur', etiquette: 'P', x: 31, y: 5.5 },
      { type: 'ballon', x: 31, y: 14.5 },
    ],
  },

  {
    titre: 'Feinte de tir et changement de main dans l intervalle',
    ref: 'feinte-de-tir-et-changement-de-main-dans-l-intervall',
    categorie: 'technique',
    duree: 10,
    nombreJoueurs: 10,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: ['4 ballons', '6 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Disposer d'une solution quand le bras est ferme : feinter le tir, changer de main ou passer le ballon derriere la tete du defenseur.",
    fonctionnement:
      "Parcours a trois plots figurant trois defenseurs. Sur le premier, feinte de tir puis reprise d'appui du meme cote. Sur le deuxieme, changement de main devant le corps. Sur le troisieme, feinte de passe puis tir.\n" +
      "Le joueur enchaine les trois gestes sans s'arreter, puis tire a 9 metres.\n" +
      "Trois passages par joueur, le dernier avec un defenseur reel sur le troisieme plot.",
    pointsCles:
      "Une feinte n'existe que si le geste est credible : le bras monte reellement en position de tir.\n" +
      "Le ballon reste protege pendant le changement de main, jamais tendu devant soi.\n" +
      "Le regard ne suit pas le ballon : il reste sur le but.",
    evolution:
      "Simplifier : un seul geste par passage, repete jusqu'a ce qu'il soit propre.\n" +
      "Complexifier : l'entraineur annonce le geste au dernier moment, en levant un bras.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'A', x: 26, y: 10 },
      { type: 'plot', x: 29, y: 10 },
      { type: 'plot', x: 31, y: 11.5 },
      { type: 'plot', x: 32.5, y: 9 },
      { type: 'ballon', x: 25.08, y: 10.92 },
    ],
  },

  {
    titre: 'Renversement en trois passes',
    ref: 'renversement-en-trois-passes',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Faire circuler le ballon plus vite que le bloc ne glisse, pour trouver le tir du cote faible de la defense.",
    fonctionnement:
      "Attaque placee face a une defense 6-0. Le ballon part de l'aile gauche et doit atteindre l'aile droite en trois passes maximum, sans dribble.\n" +
      "Chaque receveur menace le but avant de transmettre : un appui vers l'intervalle, puis la passe.\n" +
      "Le tir n'est autorise qu'apres le renversement complet. 8 repetitions, puis on libere le tir des qu'un intervalle s'ouvre.",
    pointsCles:
      "La passe part avant que le defenseur n'arrive : on transmet sur la sortie, pas apres le contact.\n" +
      "Chaque joueur reste a distance de passe, ni trop pres ni hors de portee.\n" +
      "Le bloc glisse toujours moins vite que le ballon : la vitesse de circulation est la seule arme ici.",
    evolution:
      "Simplifier : defense passive qui glisse au ralenti, quatre passes autorisees.\n" +
      "Complexifier : imposer un renversement aller-retour avant de pouvoir tirer.",
    consigneInitiale: "Ballon a l'aile gauche, defense regroupee de ce cote.",
    etapes: [
      {
        titre: 'Premiere passe',
        consigne: "De l'aile vers l'arriere gauche, sans temps d'arret.",
        mouvements: [
          { jeton: 'alg', type: 'passe', cible: 'arg' },
          { jeton: 'd5', type: 'course', vers: { x: 33, y: 13.6 } },
        ],
      },
      {
        titre: 'Deuxieme passe',
        consigne: 'Le demi-centre relaie dans le meme temps.',
        mouvements: [
          { jeton: 'arg', type: 'passe', cible: 'dc' },
          { jeton: 'd4', type: 'course', vers: { x: 32.9, y: 10.8 } },
          { jeton: 'd5', type: 'course', vers: { x: 33.98, y: 13 } },
        ],
      },
      {
        titre: 'Troisieme passe et tir',
        consigne: "L'arriere droit recoit avant que le bloc n'ait glisse : tir a 9 metres.",
        mouvements: [
          { jeton: 'dc', type: 'passe', cible: 'ard' },
          { jeton: 'ard', type: 'tir', vers: { x: 40, y: 9 } },
        ],
      },
    ],
    jetons: [
      GARDIEN_DROITE,
      ...ATTAQUE_PLACEE,
      ...DEFENSE_6_0,
      { type: 'ballon', x: 36.16, y: 17.04 },
    ],
  },

  {
    titre: 'Attaque a deux pivots contre defense etagee',
    ref: 'attaque-a-deux-pivots-contre-defense-etagee',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Desorganiser une defense etagee en occupant deux intervalles a l'interieur du bloc, et exploiter les couvertures laissees ouvertes.",
    fonctionnement:
      "Un arriere descend en pivot : l'attaque joue a un arriere, un demi-centre, deux ailiers et deux pivots.\n" +
      "Les deux pivots occupent les intervalles 2-3 et 3-4, se relaient par un croise a l'interieur du bloc et bloquent alternativement les defenseurs charges de la couverture.\n" +
      "Deux issues recherchees : la passe interieure sur un pivot demarque, ou le tir a 9 metres si les deux defenseurs centraux plongent sur les pivots.\n" +
      "10 repetitions, puis inversion des roles arriere et pivot.",
    pointsCles:
      "Les deux pivots ne restent jamais dans le meme intervalle : sinon toute la defense se resserre au meme endroit.\n" +
      "Le bloc se pose sur le defenseur, pas sur son espace : sans contact, il ne gene personne.\n" +
      "L'arriere restant doit vraiment tirer, sinon la defense ignore la menace exterieure.",
    evolution:
      "Simplifier : defense 6-0 passive, un seul pivot mobile et un pivot fixe.\n" +
      "Complexifier : defense 5-1 ou 3-2-1 active, avec chronometre de 25 secondes par attaque.",
    consigneInitiale: 'Deux pivots dans le bloc, ballon au demi-centre.',
    etapes: [
      {
        titre: 'Saturation du secteur central',
        consigne: 'Les deux pivots occupent les intervalles de part et d autre du 3.',
        mouvements: [
          { jeton: 'piv1', type: 'course', vers: { x: 33.6, y: 11.4 } },
          { jeton: 'piv2', type: 'course', vers: { x: 33.6, y: 8.6 } },
        ],
      },
      {
        titre: 'Croise des pivots',
        consigne: 'Ils echangent leur intervalle en bloquant au passage le defenseur de couverture.',
        mouvements: [
          { jeton: 'piv1', type: 'course', vers: { x: 33.6, y: 8.6 } },
          { jeton: 'piv2', type: 'course', vers: { x: 33.6, y: 11.4 } },
        ],
      },
      {
        titre: 'La pointe est fixee',
        consigne: 'Le demi-centre attaque la pointe puis ressort sur son arriere.',
        mouvements: [
          { jeton: 'dc', type: 'course', vers: { x: 31.6, y: 10.6 } },
          { jeton: 'dc', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Ballon au pivot haut',
        consigne: 'Le 4 ne peut pas suivre les deux : celui qui monte est servi.',
        mouvements: [
          { jeton: 'arg', type: 'passe', cible: 'piv2' },
          { jeton: 'piv2', type: 'tir', vers: { x: 40, y: 11 } },
        ],
      },
    ],
    jetons: [
      GARDIEN_DROITE,
      ...ATTAQUE_DEUX_PIVOTS,
      ...DEFENSE_5_1,
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Superiorite numerique : attaque a 6 contre 5',
    ref: 'superiorite-numerique-attaque-a-6-contre-5',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 11,
    nombreGardiens: 1,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Utiliser un joueur de plus sans precipitation : trouver ou se situe le surnombre et le faire durer jusqu'au tir facile.",
    fonctionnement:
      "Six attaquants face a cinq defenseurs, situation d'exclusion de deux minutes.\n" +
      "Consigne : aucune attaque ne se conclut avant 20 secondes de possession et au moins un renversement complet.\n" +
      "La defense a cinq se resserre au centre : le surnombre se trouve donc sur les ailes et par le pivot.\n" +
      "Series de trois attaques consecutives, puis rotation des groupes.",
    pointsCles:
      "Le joueur libre est toujours a l'oppose du ballon : c'est la que le regard doit aller.\n" +
      "Patience : une attaque a 6 contre 5 se perd presque toujours par un tir trop tot.\n" +
      "Les ailiers restent larges, colles a la ligne de touche, sinon la superiorite disparait.",
    evolution:
      "Simplifier : defense passive, objectif de reussir cinq renversements de suite.\n" +
      "Complexifier : jeu a sept sans gardien, toute perte de balle donnant un but a la defense.",
    consigneInitiale: 'Six attaquants contre cinq defenseurs, ballon au demi-centre.',
    etapes: [
      {
        titre: 'Ecarter le bloc',
        consigne: "Le ballon part vite sur un cote : a cinq, la defense ne peut pas tout couvrir.",
        mouvements: [
          { jeton: 'dc', type: 'passe', cible: 'arg' },
          { jeton: 'd4', type: 'course', vers: { x: 32.9, y: 12.8 } },
        ],
      },
      {
        titre: 'Renversement complet',
        consigne: "Aucune attaque ne se conclut avant d'avoir traverse tout le front.",
        mouvements: [
          { jeton: 'arg', type: 'passe', cible: 'dc' },
          { jeton: 'dc', type: 'passe', cible: 'ard' },
          { jeton: 'd3', type: 'course', vers: { x: 33.2, y: 9.4 } },
          { jeton: 'd2', type: 'course', vers: { x: 33.6, y: 7.6 } },
        ],
      },
      {
        titre: 'Le surnombre apparait',
        consigne: "L'ailier droit monte : a cinq, le defenseur 1 doit choisir entre lui et l'arriere.",
        mouvements: [
          { jeton: 'ald', type: 'course', vers: { x: 34.6, y: 3.2 } },
          { jeton: 'd1', type: 'course', vers: { x: 34.9, y: 4.2 } },
        ],
      },
      {
        titre: 'Conclusion du cote libere',
        consigne: 'Le pivot est seul dans le secteur central abandonne.',
        mouvements: [
          { jeton: 'ard', type: 'passe', cible: 'piv' },
          { jeton: 'piv', type: 'tir', vers: { x: 40, y: 10.4 } },
        ],
      },
    ],
    jetons: [
      GARDIEN_DROITE,
      ...ATTAQUE_PLACEE,
      { type: 'defenseur', etiquette: '1', ref: 'd1', x: 35.18, y: 4.6 },
      { type: 'defenseur', etiquette: '2', ref: 'd2', x: 33.8, y: 7.4 },
      { type: 'defenseur', etiquette: '3', ref: 'd3', x: 33.4, y: 10 },
      { type: 'defenseur', etiquette: '4', ref: 'd4', x: 33.8, y: 12.6 },
      { type: 'defenseur', etiquette: '5', ref: 'd5', x: 35.18, y: 15.4 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Attaque en continu : trois vagues sans temps d arret',
    ref: 'attaque-en-continu-trois-vagues-sans-temps-d-arret',
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Enchainer les attaques sans reorganisation, pour installer les reperes de placement sous fatigue et avec un temps de decision court.",
    fonctionnement:
      "Trois groupes de quatre attaquants se relaient face a une defense fixe de six joueurs.\n" +
      "Des que le tir est effectue ou que le ballon sort, la vague suivante entre immediatement avec un nouveau ballon : la defense n'a jamais le temps de se replacer completement.\n" +
      "Chaque attaque dure 15 secondes maximum. Series de six minutes, puis on change le groupe defenseur.",
    pointsCles:
      "L'attaque commence des l'entree sur le terrain : pas de mise en place, on joue sur ce qui est ouvert.\n" +
      "Les postes tournent a chaque vague : chacun doit savoir jouer au moins deux places.\n" +
      "La defense apprend ici a se reorganiser vite : c'est un exercice defensif autant qu'offensif.",
    evolution:
      "Simplifier : 20 secondes par attaque et une pause de cinq secondes entre deux vagues.\n" +
      "Complexifier : imposer une conclusion differente a chaque vague, annoncee par l'entraineur.",
    jetons: [
      GARDIEN_DROITE,
      ...DEFENSE_6_0,
      { type: 'attaquant', etiquette: 'ArG', x: 31.5, y: 14.5 },
      { type: 'attaquant', etiquette: 'DC', x: 30.5, y: 10 },
      { type: 'attaquant', etiquette: 'ArD', x: 31.5, y: 5.5 },
      { type: 'attaquant', etiquette: 'PIV', x: 33.8, y: 10 },
      { type: 'attaquant', etiquette: '2', x: 27, y: 16 },
      { type: 'attaquant', etiquette: '2', x: 27, y: 4 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Defense 3-2-1 : etagement, sortie et couverture',
    ref: 'defense-3-2-1-etagement-sortie-et-couverture',
    categorie: 'defense',
    duree: 18,
    nombreJoueurs: 12,
    nombreGardiens: 1,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Mettre en place les trois lignes du 3-2-1 : le defenseur haut donne l'amplitude, les deux joueurs de la deuxieme ligne coupent les lignes de passe, la troisieme ligne tient le pivot et les ailes.",
    fonctionnement:
      "Mise en place a vide : le numero 3 haut se place au-dela des 9 metres face au demi-centre, les deux numeros 2 sur la ligne de jet franc, les numeros 1 et le numero 3 bas sur la surface.\n" +
      "Premiere phase, l'attaque fait tourner le ballon sans tirer : le bloc glisse en gardant l'etagement, chacun se placant par rapport au defenseur haut.\n" +
      "Deuxieme phase, l'attaque joue reellement : sur chaque sortie d'un defenseur, le joueur derriere lui assure immediatement la couverture.\n" +
      "Trois series de cinq attaques, avec un retour collectif entre chaque serie.",
    pointsCles:
      "Le numero 3 haut donne le signal : s'il ne sort pas, personne ne sort.\n" +
      "Une sortie sans couverture derriere est une faute, meme si le ballon est recupere.\n" +
      "Le 3-2-1 est tres efficace une vingtaine de secondes puis devient couteux : on l'utilise par sequences, pas toute la rencontre.\n" +
      "Point de rupture connu : l'attaque a deux pivots, qui isole la troisieme ligne. Le repere est alors de faire redescendre le numero 3 haut.",
    evolution:
      "Simplifier : partir d'une 5-1 deja connue, puis avancer un seul numero 2 pour passer au 3-2-1.\n" +
      "Complexifier : alterner 6-0 et 3-2-1 sur signal de l'entraineur, en cours d'attaque.",
    consigneInitiale: 'Ballon au demi-centre, defense etagee sur trois lignes.',
    etapes: [
      {
        titre: 'Le haut avance',
        consigne: "Le defenseur haut sort sur le porteur et l'oblige a ecarter.",
        mouvements: [
          { jeton: 'd3h', type: 'course', vers: { x: 30.6, y: 10 } },
          { jeton: 'dc', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Glissement de l etage intermediaire',
        consigne: 'Le 2 cote ballon sort, le haut decroche pour couvrir.',
        mouvements: [
          { jeton: 'd5', type: 'course', vers: { x: 31.8, y: 13.4 } },
          { jeton: 'd3h', type: 'course', vers: { x: 31.2, y: 11.4 } },
        ],
      },
      {
        titre: 'Aide sur le pivot',
        consigne: 'Le bas reste seul devant : il ne lache jamais le pivot.',
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.5, y: 11.4 } },
          { jeton: 'd3b', type: 'course', vers: { x: 33.7, y: 10.6 } },
        ],
      },
    ],
    jetons: [
      GARDIEN_DROITE,
      ...ATTAQUE_PLACEE,
      ...DEFENSE_3_2_1,
      { type: 'ballon', x: 31.53, y: 10.79 },
    ],
  },

  {
    titre: 'Duel defensif : contest, contre et recuperation',
    ref: 'duel-defensif-contest-contre-et-recuperation',
    categorie: 'defense',
    duree: 12,
    nombreJoueurs: 10,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: ['4 ballons', '4 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Gagner le duel defensif sans faute : barrer la trajectoire avec les appuis, contrer avec le bras cote ballon, et enchainer sur la recuperation.",
    fonctionnement:
      "Un attaquant part de 11 metres, un defenseur le prend en charge en un contre un dans un couloir de quatre metres delimite par des plots.\n" +
      "Le defenseur doit d'abord contrarier l'appui d'appel, puis lever le bras cote ballon au moment de l'armee.\n" +
      "Un ballon contre ou intercepte declenche immediatement une contre-attaque vers le but oppose : le duel ne s'arrete pas au tir.\n" +
      "6 duels par joueur, roles inverses a chaque passage.",
    pointsCles:
      "Les appuis avant les mains : on ferme la trajectoire en se placant, pas en poussant.\n" +
      "Le bras qui contre est celui du cote du ballon, tendu vers le haut, jamais en travers du corps de l'attaquant.\n" +
      "Rester en mouvement apres le contre : le ballon appartient a celui qui repart le premier.",
    evolution:
      "Simplifier : couloir plus etroit et attaquant sans dribble.\n" +
      "Complexifier : deux attaquants contre deux defenseurs dans le meme couloir.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'A', x: 29, y: 10 },
      { type: 'defenseur', etiquette: 'D', x: 32.5, y: 10 },
      { type: 'ballon', x: 28.08, y: 10.92 },
      { type: 'plot', x: 29, y: 12 },
      { type: 'plot', x: 29, y: 8 },
      { type: 'plot', x: 34, y: 12 },
      { type: 'plot', x: 34, y: 8 },
    ],
  },

  {
    titre: 'Inferiorite numerique : defendre a 5 contre 6',
    ref: 'inferiorite-numerique-defendre-a-5-contre-6',
    categorie: 'defense',
    duree: 15,
    nombreJoueurs: 11,
    nombreGardiens: 1,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles', 'chronometre'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Tenir deux minutes a cinq : proteger le centre, accepter le tir de l'aile, et sortir de l'exclusion sans encaisser plus d'un but.",
    fonctionnement:
      "Cinq defenseurs face a six attaquants, bloc resserre autour des deux intervalles centraux.\n" +
      "Le ballon a l'aile n'est pas suivi : le defenseur exterieur reste sur son intervalle interieur et laisse le tir de l'aile, en comptant sur le gardien.\n" +
      "Sur chaque passe interieure, le defenseur central le plus proche prend le pivot, les autres resserrent aussitot.\n" +
      "Sequences de deux minutes chronometrees, comme une exclusion reelle, avec le score de la sequence annonce a la fin.",
    pointsCles:
      "Le centre d'abord : un but a 6 metres coute plus cher qu'un but de l'aile.\n" +
      "Communiquer a voix haute : a cinq, chaque changement de charge doit etre annonce.\n" +
      "Ne pas courir apres le ballon : le bloc glisse ensemble, il ne se disloque jamais.",
    evolution:
      "Simplifier : attaque interdite de tirer a 9 metres, la defense se concentre sur le pivot.\n" +
      "Complexifier : quatre contre six pendant les trente dernieres secondes de la sequence.",
    consigneInitiale: "Cinq defenseurs contre six attaquants, ballon a l'arriere gauche.",
    etapes: [
      {
        titre: 'Proteger l axe',
        consigne: "A cinq, on ne sort pas : on reste groupe et on ferme le centre.",
        mouvements: [
          { jeton: 'd4', type: 'course', vers: { x: 33.4, y: 11.4 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.2, y: 10 } },
        ],
      },
      {
        titre: 'Glissement sur le renversement',
        consigne: 'Le bloc glisse ensemble, personne ne part seul au contact.',
        mouvements: [
          { jeton: 'arg', type: 'passe', cible: 'dc' },
          { jeton: 'd3', type: 'course', vers: { x: 32.9, y: 10 } },
          { jeton: 'd4', type: 'course', vers: { x: 33.6, y: 12 } },
        ],
      },
      {
        titre: 'Le tir de loin est concede',
        consigne: "C'est le tir qu'on accepte : de face, a 9 metres, gardien preveni.",
        mouvements: [{ jeton: 'dc', type: 'tir', vers: { x: 40, y: 10 } }],
      },
    ],
    jetons: [
      GARDIEN_DROITE,
      ...ATTAQUE_PLACEE,
      { type: 'defenseur', etiquette: '1', ref: 'd1', x: 34.33, y: 6 },
      { type: 'defenseur', etiquette: '2', ref: 'd2', x: 33.6, y: 8 },
      { type: 'defenseur', etiquette: '3', ref: 'd3', x: 33.4, y: 10 },
      { type: 'defenseur', etiquette: '4', ref: 'd4', x: 33.6, y: 12 },
      { type: 'defenseur', etiquette: '5', ref: 'd5', x: 34.33, y: 14 },
      { type: 'ballon', x: 30.58, y: 15.42 },
    ],
  },

  {
    titre: 'Contre-attaque soutenue : deuxieme vague et engagement rapide',
    ref: 'contre-attaque-soutenue-deuxieme-vague-et-engagement',
    categorie: 'transition',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Marquer avant que la defense adverse ne soit en place : ailiers en premiere vague, arrieres lances en deuxieme vague, engagement rapide apres le but.",
    fonctionnement:
      "Le gardien arrete ou recupere, les deux ailiers partent immediatement en premiere vague le long des lignes de touche.\n" +
      "Si le repli adverse ferme la premiere vague, le ballon est joue en retrait sur un arriere lance qui arrive en deuxieme vague et tire a 9 metres avant l'installation du bloc.\n" +
      "Apres chaque but, engagement immediat : le joueur au centre remet en jeu sans attendre.\n" +
      "Vagues continues pendant six minutes, puis inversion des roles avec le groupe qui repliait.",
    pointsCles:
      "La deuxieme vague part depuis les 9 metres de son propre camp, sinon elle arrive en marchant.\n" +
      "Le ballon va toujours plus vite en avancant qu'en traversant : une passe longue vaut mieux que trois passes laterales.\n" +
      "L'engagement rapide se prepare avant le but : quelqu'un doit deja etre au centre.",
    evolution:
      "Simplifier : trois attaquants contre un seul defenseur qui replie.\n" +
      "Complexifier : le tir de premiere vague est interdit, seule la deuxieme vague peut conclure.",
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'AlG', x: 8, y: 18.3 },
      { type: 'attaquant', etiquette: 'AlD', x: 8, y: 1.7 },
      { type: 'attaquant', etiquette: 'ArG', x: 6.02, y: 13 },
      { type: 'attaquant', etiquette: 'ArD', x: 6.02, y: 7 },
      { type: 'defenseur', etiquette: '1', x: 26, y: 12 },
      { type: 'defenseur', etiquette: '2', x: 26, y: 8 },
      { type: 'ballon', x: 2.4, y: 10 },
    ],
  },

  {
    titre: 'Montee de balle 4 contre 3 face au repli',
    ref: 'montee-de-balle-4-contre-3-face-au-repli',
    categorie: 'transition',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Conclure un surnombre en mouvement : occuper toute la largeur, fixer un defenseur par la course, et transmettre au dernier moment.",
    fonctionnement:
      "Quatre attaquants partent de leur ligne de 9 metres contre trois defenseurs deja replies a mi-terrain.\n" +
      "Regle unique : deux dribbles maximum par joueur. Le surnombre doit se conclure en moins de huit secondes.\n" +
      "Si les defenseurs recuperent, ils repartent immediatement en contre-attaque a trois contre les quatre attaquants devenus defenseurs.\n" +
      "Rotation continue, chaque groupe alternant attaque et repli.",
    pointsCles:
      "Le porteur avance vers un defenseur, jamais vers un espace vide : sans fixation, pas de surnombre.\n" +
      "La passe part quand le defenseur a engage son appui, pas avant.\n" +
      "Les joueurs exterieurs restent larges jusqu'au dernier moment : c'est la largeur qui cree le decalage.",
    evolution:
      "Simplifier : 3 contre 2, sans limite de dribbles.\n" +
      "Complexifier : 4 contre 4 avec un defenseur qui entre en retard depuis la ligne de fond.",
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: '1', x: 11, y: 18 },
      { type: 'attaquant', etiquette: '2', x: 10, y: 12 },
      { type: 'attaquant', etiquette: '3', x: 10, y: 8 },
      { type: 'attaquant', etiquette: '4', x: 11, y: 2 },
      { type: 'defenseur', etiquette: 'D', x: 22, y: 14 },
      { type: 'defenseur', etiquette: 'D', x: 22, y: 10 },
      { type: 'defenseur', etiquette: 'D', x: 22, y: 6 },
      { type: 'ballon', x: 11.13, y: 12.65 },
    ],
  },

  {
    titre: 'Circuit force-vitesse : pliometrie, gainage et sprints',
    ref: 'circuit-force-vitesse-pliometrie-gainage-et-sprints',
    categorie: 'physique',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 haies basses', '8 plots', '2 ballons lestes'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Developper l'impulsion et la stabilite du tronc, deux qualites qui conditionnent le tir en suspension et la resistance au contact.",
    fonctionnement:
      "Cinq ateliers de 40 secondes, 20 secondes de passage d'un atelier a l'autre, trois tours.\n" +
      "1. Sauts pieds joints par-dessus quatre haies basses, reception amortie.\n" +
      "2. Gainage ventral avec touche d'epaule alternee.\n" +
      "3. Sprint de 15 metres avec changement de direction sur plot, retour au trot.\n" +
      "4. Lancers de ballon leste a deux mains au-dessus de la tete, a deux.\n" +
      "5. Gainage lateral, une jambe levee, 20 secondes de chaque cote.\n" +
      "Placer ce circuit apres l'echauffement complet et avant le travail avec ballon, jamais en fin de seance.",
    pointsCles:
      "Sur les sauts, c'est la qualite de reception qui compte : genou dans l'axe, pas de rebond mou.\n" +
      "Le bassin ne bouge pas sur les ateliers de gainage : mieux vaut 20 secondes propres que 40 secondes affaissees.\n" +
      "Recuperation reellement respectee entre les tours, sinon l'exercice devient de l'endurance et perd son objet.",
    evolution:
      "Simplifier : deux tours, haies remplacees par des lignes au sol.\n" +
      "Complexifier : ajouter un tir a 9 metres immediatement apres le troisieme atelier, sous fatigue.",
    jetons: [
      { type: 'haie', x: 10, y: 15 },
      { type: 'haie', x: 12, y: 15 },
      { type: 'haie', x: 14, y: 15 },
      { type: 'haie', x: 16, y: 15 },
      { type: 'plot', x: 12, y: 10 },
      { type: 'plot', x: 20, y: 10 },
      { type: 'plot', x: 12, y: 5 },
      { type: 'plot', x: 20, y: 5 },
      { type: 'entraineur', etiquette: 'E', x: 16, y: 10 },
    ],
  },

  {
    titre: 'Match a theme : dernieres minutes, un but d ecart',
    ref: 'match-a-theme-dernieres-minutes-un-but-d-ecart',
    categorie: 'jeu',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles', 'chronometre'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Travailler la gestion de fin de match : un but d'avance a defendre, ou un but de retard a combler, avec le chronometre comme adversaire.",
    fonctionnement:
      "Match sur tout le terrain, chronometre a trois minutes, une equipe menant d'un but.\n" +
      "L'equipe qui mene doit conserver et user le temps sans faire de faute grossiere. L'equipe menee doit accelerer sans precipitation, avec la possibilite de sortir son gardien pour jouer a sept.\n" +
      "Un temps mort par equipe, a poser au bon moment : c'est aussi ce qui se travaille ici.\n" +
      "Trois sequences, en inversant a chaque fois le role de l'equipe qui mene.",
    pointsCles:
      "Mener ne veut pas dire reculer : l'equipe devant continue d'attaquer, elle prend seulement moins de risques.\n" +
      "L'equipe menee doit choisir son moment pour sortir le gardien, pas le faire des la premiere possession.\n" +
      "Observer qui prend la parole dans le groupe quand le score se resserre.",
    evolution:
      "Simplifier : deux buts d'ecart et quatre minutes, la pression est moins forte.\n" +
      "Complexifier : ajouter une exclusion de deux minutes a l'equipe qui mene, des le debut de la sequence.",
    jetons: [GARDIEN_GAUCHE, GARDIEN_DROITE, { type: 'ballon', x: 20, y: 10 }],
  },

  {
    titre: '4 contre 4 en continu sur demi-terrain',
    ref: '4-contre-4-en-continu-sur-demi-terrain',
    categorie: 'jeu',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: ['3 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Multiplier les prises de decision par joueur : sur un espace reduit, chacun touche le ballon bien plus souvent qu'en jeu a sept.",
    fonctionnement:
      "Trois equipes de quatre sur un demi-terrain, un seul but et un gardien.\n" +
      "L'equipe qui marque reste. L'equipe qui encaisse ou perd le ballon sort, et l'equipe en attente entre immediatement en attaque depuis les 9 metres.\n" +
      "Pas de pivot impose : les joueurs occupent les postes selon la circulation.\n" +
      "Sequences de cinq minutes, deux ou trois selon le temps restant.",
    pointsCles:
      "A quatre contre quatre, chaque joueur defend un espace et un homme : la responsabilite est individuelle.\n" +
      "Le decalage vient de la profondeur : sur un espace reduit, c'est la course vers le but qui ouvre.\n" +
      "Enchainement immediat : l'equipe qui entre joue sans mise en place.",
    evolution:
      "Simplifier : deux equipes seulement, avec relance a chaque perte de balle.\n" +
      "Complexifier : obliger un tir de 9 metres ou une passe a un joueur entre dans la zone avant de conclure.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: '1', x: 31, y: 15 },
      { type: 'attaquant', etiquette: '2', x: 29.5, y: 10 },
      { type: 'attaquant', etiquette: '3', x: 31, y: 5 },
      { type: 'attaquant', etiquette: '4', x: 33.8, y: 10 },
      { type: 'defenseur', etiquette: 'D', x: 33.8, y: 13 },
      { type: 'defenseur', etiquette: 'D', x: 33.4, y: 10.5 },
      { type: 'defenseur', etiquette: 'D', x: 33.8, y: 7 },
      { type: 'defenseur', etiquette: 'D', x: 34.88, y: 15 },
      { type: 'ballon', x: 28.58, y: 10.92 },
    ],
  },
]
