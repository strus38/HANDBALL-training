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
    titre: 'Échauffement en montée de balle, 3 couloirs',
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
      'Élever progressivement la température corporelle, remettre en place les repères de largeur et la qualité de passe en course.',
    fonctionnement:
      "Trois colonnes réparties sur la largeur, un ballon par vague. La vague part de la ligne de but, traverse le terrain en trois passes minimum sans que le ballon touche le sol, et termine par un tir en course.\n" +
      'Le porteur ne fait jamais plus de trois appuis. Les joueurs sans ballon courent en avance sur le porteur, jamais dans son dos.\n' +
      'Retour au trot par les côtés. 8 à 10 vagues, puis on ajoute une passe en retrait avant le tir.',
    pointsCles:
      "Largeur réelle : les couloirs extérieurs restent à moins de deux mètres de la ligne de touche.\n" +
      'Passe devant le joueur, dans sa course, jamais sur son épaule arrière.\n' +
      "Regarder le but avant de recevoir : la tête se lève avant que le ballon n'arrive.",
    evolution:
      "Simplifier : partir à deux joueurs, sans opposition ni contrainte de nombre de passes.\n" +
      'Complexifier : un défenseur passif recule dans le couloir central, obligeant à fixer avant de transmettre.',
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
      'Fiabiliser la passe à une main en mouvement et installer un rythme à trois appuis avant le tir.',
    fonctionnement:
      "Deux colonnes à 9 mètres, un passeur fixe à chaque poste arrière. Le joueur part, reçoit dans la course, enchaîne trois appuis et rend le ballon au passeur avant de reprendre sa place.\n" +
      'Trois séries de 90 secondes, en alternant le côté de départ. Sur la dernière série, le joueur termine par un tir.',
    pointsCles:
      "Le ballon se reçoit à deux mains, se protège près du corps, se lance à une main.\n" +
      "Appui gauche - droit - gauche pour un droitier : le rythme est le même sur toutes les répétitions.\n" +
      "Le bras armé haut dès la réception, pas au moment du tir.",
    evolution:
      'Complexifier : imposer une feinte de passe avant le dernier appui, puis un tir à la hanche.',
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
    titre: 'Croisé arrière - ailier côté droit',
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
      "Créer un décalage sur l'aile en fixant le défenseur extérieur, et libérer un tir à 6 mètres ou un tir de l'aile.",
    fonctionnement:
      "Attaque placée face à une défense 6-0 d'abord passive, puis semi-active.\n" +
      "L'arrière droit part en un contre un vers l'extérieur pour fixer le défenseur numéro 1. L'ailier droit démarre au moment où l'arrière engage son deuxième appui, croise dans son dos et reçoit dans l'intervalle.\n" +
      "Si le défenseur extérieur suit l'ailier, l'arrière garde le ballon et tire à 9 mètres. 6 répétitions par côté, puis on inverse.",
    pointsCles:
      "Le croisé part tard : trop tôt, le défenseur voit tout venir.\n" +
      "L'arrière doit réellement menacer le but, sinon la fixation n'existe pas.\n" +
      "La passe se donne à hauteur de hanche, dans le sens de la course de l'ailier.",
    evolution:
      "Simplifier : défense passive avec interdiction de suivre le croisé.\n" +
      'Complexifier : défense active, et ajout du pivot qui vient bloquer le défenseur numéro 2.',
    consigneInitiale:
      "Attaque placée face à une 6-0. Le ballon part de l'arrière droit.",
    etapes: [
      {
        titre: 'Fixation',
        consigne: "L'arrière droit attaque l'extérieur pour fixer le défenseur 1.",
        mouvements: [
          { jeton: 'ard', type: 'course', vers: { x: 33.4, y: 4.2 } },
          { jeton: 'd1', type: 'course', vers: { x: 34.4, y: 3.9 } },
        ],
      },
      {
        titre: 'Croisé',
        consigne: "L'ailier croise dans le dos de l'arrière et reçoit dans l'intervalle.",
        mouvements: [
          { jeton: 'ald', type: 'course', vers: { x: 34.2, y: 6.6 } },
          { jeton: 'ard', type: 'passe', cible: 'ald' },
        ],
      },
      {
        titre: 'Tir',
        consigne: "Tir à 6 mètres dans l'intervalle libéré.",
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
      'Utiliser le pivot comme point de fixation et exploiter immédiatement le décalage créé par la relation à deux.',
    fonctionnement:
      "Travail sur le secteur central. Le demi-centre donne au pivot qui se démarque dans l'intervalle 3-4, puis part immédiatement dans le dos de son défenseur.\n" +
      'Le pivot rend le ballon dans la course, ou tire lui-même si le bloc se referme sur le demi-centre.\n' +
      'Deux séries de 8 répétitions, une avec pivot côté gauche, une avec pivot côté droit.',
    pointsCles:
      "Le pivot demande le ballon main tendue, du côté opposé au défenseur.\n" +
      'Le demi-centre part sans ralentir après sa passe : la vitesse est ce qui crée le décalage.\n' +
      "La remise se fait à une main, sans se retourner complètement.",
    evolution:
      "Complexifier : interdire le tir au demi-centre, obliger à ressortir sur un arrière pour un tir à 9 mètres.",
    consigneInitiale: 'Secteur central, ballon au demi-centre.',
    etapes: [
      {
        titre: 'Le pivot se démarque',
        consigne: "Le pivot se montre dans l'intervalle 3-4, le demi-centre lui donne.",
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.4, y: 11.4 } },
          { jeton: 'dc', type: 'passe', cible: 'piv' },
        ],
      },
      {
        titre: 'Passe et va',
        consigne: 'Le demi-centre part aussitôt dans le dos de son défenseur.',
        mouvements: [
          { jeton: 'dc', type: 'course', vers: { x: 32.6, y: 8.6 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.4, y: 9.6 } },
        ],
      },
      {
        titre: 'Remise et tir',
        consigne: 'Le pivot rend le ballon dans la course, tir à 6 mètres.',
        mouvements: [
          { jeton: 'piv', type: 'passe', cible: 'dc' },
          { jeton: 'dc', type: 'tir', vers: { x: 40, y: 10.6 } },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 29.58, y: 10.92 }],
  },

  {
    titre: 'Écran du pivot pour le tir à 9 mètres',
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
      "Libérer un tir de loin en supprimant le défenseur direct de l'arrière, et lire la réaction du bloc.",
    fonctionnement:
      "Le pivot vient poser un écran sur le défenseur numéro 2, épaule contre épaule, sans le pousser.\n" +
      "L'arrière gauche attaque l'espace libéré et tire à 9 mètres.\n" +
      '10 répétitions, puis même travail de l autre côté.',
    pointsCles:
      "L'écran se pose avant l'arrivée de l'arrière, immobile au moment du contact : sinon c'est une faute.\n" +
      'Le tireur passe au contact de son pivot, pas à deux mètres.\n' +
      "Après l'écran, le pivot ne reste jamais spectateur : il se retourne systématiquement.",
    evolution:
      "Simplifier : sans gardien, tir sur but vide pour se concentrer sur le placement de l'écran.\n" +
      "Complexifier : la défense a le droit de changer d'adversaire. Les attaquants doivent voir le changement, et le pivot se retourne alors pour se démarquer vers le but et recevoir.",
    consigneInitiale: "Ballon à l'arrière gauche, pivot côté gauche.",
    etapes: [
      {
        titre: "Pose de l'écran",
        consigne: 'Le pivot vient bloquer le défenseur 5, épaule contre épaule.',
        mouvements: [{ jeton: 'piv', type: 'ecran', vers: { x: 33.4, y: 12.6 } }],
      },
      {
        titre: 'Sortie et tir à 9 mètres',
        consigne: "L'arrière gauche attaque l'espace libéré et tire par-dessus le bloc.",
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
      'Travailler la continuité : enchaîner deux intentions sans temps mort quand la première ne passe pas.',
    fonctionnement:
      "Trois attaquants (arrière, demi-centre, ailier) contre trois défenseurs sur une moitié de la surface. Le reste du groupe attend derrière la ligne des 9 mètres.\n" +
      'Obligation de tenter une première intention, puis, si elle échoue, un renversement immédiat vers le troisième joueur.\n' +
      'Un but marqué vaut un point, une attaque conclue sans perte de balle vaut un point. Séries de 3 minutes.',
    pointsCles:
      'Aucune passe en arrière après la première intention : le ballon avance ou se renverse, il ne recule pas.\n' +
      'Les non-porteurs se replacent en permanence à distance de passe.\n' +
      'La deuxième intention part avant que la défense ne soit replacée.',
    evolution:
      "Complexifier : limiter chaque attaque à 12 secondes.",
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
    titre: 'Défense 6-0 : glissement et aide sur le pivot',
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
      'Coordonner le glissement latéral du bloc et maintenir le contact permanent sur le pivot.',
    fonctionnement:
      "Attaque à six qui fait tourner le ballon d'une aile à l'autre, sans tir dans un premier temps.\n" +
      'Le bloc glisse en restant groupé : le défenseur côté ballon sort au contact, les autres se resserrent. Le défenseur central au contact du pivot ne le lâche jamais.\n' +
      "Après 4 tours de ballon, l'attaque a le droit de conclure. 6 séquences.",
    pointsCles:
      "Les épaules restent face au ballon, jamais de course de côté en croisant les appuis.\n" +
      'Un seul défenseur sort à la fois : deux sorties simultanées ouvrent un intervalle.\n' +
      "Le contact sur le pivot se garde avec l'avant-bras, sans ceinturer.",
    evolution:
      "Simplifier : l'attaque annonce à voix haute le sens de circulation.\n" +
      'Complexifier : ajouter un deuxième pivot pour saturer le secteur central.',
    consigneInitiale: "Ballon à l'aile gauche, bloc regroupé.",
    etapes: [
      {
        titre: 'Le ballon rentre',
        consigne: "Le défenseur 5 sort au contact, les autres se resserrent.",
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
        consigne: "Le défenseur 3 suit le pivot sans jamais rompre le contact.",
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.5, y: 11.6 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.7, y: 10.4 } },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 36.16, y: 17.04 }],
  },

  {
    titre: 'Défense 5-1 : le pointe et la relation avec les demi-centres',
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
      'Gêner la construction adverse en avançant sur le demi-centre, sans ouvrir le couloir central.',
    fonctionnement:
      "Mise en place du 5-1 face à une attaque placée. Le joueur à la pointe harcèle le demi-centre et oriente le jeu vers un côté.\n" +
      'Les deux défenseurs centraux couvrent son dos en permanence. Quand le ballon part sur une aile, la pointe décroche et vient aider sur le pivot.\n' +
      "Séquences de 90 secondes, l'attaque cherche à traverser le centre.",
    pointsCles:
      "La pointe avance sur la passe, pas sur le porteur déjà installé.\n" +
      "Le dos de la pointe est toujours couvert : si les deux centraux sortent, l'exercice est manqué.\n" +
      'Communiquer à voix haute à chaque changement de côté.',
    evolution:
      "Simplifier : commencer sans pivot, à cinq attaquants.\n" +
      'Complexifier : autoriser les attaquants à permuter arrière et demi-centre.',
    consigneInitiale: 'Ballon au demi-centre, la pointe face à lui.',
    etapes: [
      {
        titre: 'La pointe oriente le jeu',
        consigne: "Elle avance sur la passe et pousse le ballon vers un côté.",
        mouvements: [
          { jeton: 'dc', type: 'passe', cible: 'arg' },
          { jeton: 'dp', type: 'course', vers: { x: 31.6, y: 12.6 } },
        ],
      },
      {
        titre: 'Sortie et couverture',
        consigne: 'Le 4 sort au contact, le 3 couvre le dos de la pointe.',
        mouvements: [
          { jeton: 'd4', type: 'course', vers: { x: 32.6, y: 13.3 } },
          { jeton: 'd3', type: 'course', vers: { x: 33.6, y: 10.6 } },
        ],
      },
      {
        // Le point d'arrivee du pivot est regle pour que le ballon recu — pose
        // par le moteur entre lui et le passeur — reste lisible a cote du
        // defenseur 4, au lieu de recouvrir son jeton.
        titre: 'Le pivot dans le dos de la pointe',
        consigne: "C'est l'espace que la 5-1 laisse : il doit être couvert.",
        mouvements: [
          { jeton: 'piv', type: 'course', vers: { x: 33.6, y: 11.2 } },
          { jeton: 'arg', type: 'passe', cible: 'piv' },
        ],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_5_1, { type: 'ballon', x: 29.58, y: 10.92 }],
  },

  {
    titre: 'Contre-attaque directe après arrêt du gardien',
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
      'Enchaîner arrêt, relance longue et finition en moins de six secondes, en gardant la lucidité dans le tir.',
    fonctionnement:
      "Un tireur déclenche à 9 mètres. Dès l'arrêt, les deux ailiers partent sur les côtés et le gardien relance sur le premier disponible.\n" +
      'Course jusqu au but opposé, un contre zéro puis un contre un avec un défenseur qui part avec deux mètres de retard.\n' +
      '8 séries par joueur, récupération en marchant sur le retour.',
    pointsCles:
      "L'ailier part avant que le gardien n'ait le ballon en main, sur la trajectoire du tir.\n" +
      'La relance est tendue, devant le joueur, pas en cloche.\n' +
      'Finir en course sans se désunir : la vitesse ne doit pas coûter la précision.',
    evolution:
      "Complexifier : deux défenseurs de retard, obligeant à une passe en course.",
    consigneInitiale: "Un tireur à 9 mètres, les deux ailiers prêts à partir.",
    etapes: [
      {
        // Le tir s'arrete SUR le gardien (a un metre devant lui) : c'est
        // l'arret, pas un but. Le ballon reste ainsi visible a cote de lui au
        // lieu de recouvrir son jeton.
        titre: "Tir et départ des ailiers",
        consigne: "Les ailiers partent AVANT que le gardien n'ait le ballon en main.",
        mouvements: [
          { jeton: 'tireur', type: 'tir', vers: { x: 37.95, y: 10 } },
          { jeton: 'alg', type: 'course', vers: { x: 24, y: 18 } },
          { jeton: 'ald', type: 'course', vers: { x: 24, y: 1.7 } },
        ],
      },
      {
        // Les courses AVANT la passe : le moteur pose le ballon chez le
        // receveur a l'etape suivante, donc la ou l'ailier ARRIVE. Dans l'autre
        // ordre, la relance atterrissait la ou il n'etait deja plus.
        titre: 'Relance longue',
        consigne: "Le gardien relance tendu devant l'ailier, jamais en cloche.",
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 14, y: 18.3 } },
          { jeton: 'ald', type: 'course', vers: { x: 14, y: 1.7 } },
          { jeton: 'def', type: 'course', vers: { x: 12, y: 12 } },
          { jeton: 'gb', type: 'passe', cible: 'alg' },
        ],
      },
      {
        titre: 'Le défenseur revient',
        consigne: 'Le repli adverse rattrape : le un contre zéro devient un contre un.',
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 9, y: 17.6 } },
          { jeton: 'def', type: 'course', vers: { x: 7.6, y: 15.2 } },
        ],
      },
      {
        titre: "Tir en course à l'aile",
        consigne: "L'ailier entre dans la zone et tire avant d'être rejoint.",
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 5.6, y: 16.4 } },
          { jeton: 'alg', type: 'tir', vers: { x: 0.6, y: 10.6 } },
        ],
      },
    ],
    // La contre-attaque va du but de droite (l'arret) vers le but de gauche :
    // les ailiers partent donc de LEUR camp, pres de leur surface, et le
    // defenseur en repli part de la zone du tir. Les anciens departs (x = 4 et
    // x = 8) les placaient deja au bout du terrain, et la course leur faisait
    // traverser dans le mauvais sens.
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'T', ref: 'tireur', x: 31, y: 10 },
      { type: 'attaquant', etiquette: 'AlG', ref: 'alg', x: 34, y: 18.3 },
      { type: 'attaquant', etiquette: 'AlD', ref: 'ald', x: 34, y: 1.7 },
      { type: 'defenseur', etiquette: 'D', ref: 'def', x: 28, y: 10 },
      { type: 'ballon', x: 30.08, y: 10.92 },
    ],
  },

  {
    titre: 'Repli défensif : 2 contre 2 puis 3 contre 3',
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
      "Freiner la contre-attaque adverse en priorité sur l'axe, et reconstruire un bloc avant l'arrivée du troisième joueur.",
    fonctionnement:
      "Deux attaquants partent en contre-attaque contre deux défenseurs places au milieu de terrain. Au signal, un troisième attaquant et un troisième défenseur entrent en jeu.\n" +
      "Les défenseurs doivent d'abord protéger l'axe, puis se repartir les adversaires à voix haute.\n" +
      '10 séquences, rotation complète des rôles.',
    pointsCles:
      "Reculer face au jeu, jamais en tournant le dos au ballon.\n" +
      "Le premier défenseur prend le porteur, le second couvre l'espace, pas un adversaire.\n" +
      'Annoncer sa prise en charge : le silence est la principale cause de but encaisse.',
    evolution: 'Complexifier : passer à 4 contre 3, en désavantage numérique permanent.',
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
      "Quatre ateliers enchaînés : course avant-arrière entre deux plots, franchissement de haies basses, sprint sur 15 mètres avec ballon, tir en course.\n" +
      '30 secondes de travail, 30 secondes de récupération, 8 tours. La dernière série se fait en opposition par deux.',
    pointsCles:
      "La qualite du dernier tir compte autant que le temps : un tir rate annule le tour.\n" +
      'Poser le pied complet dans les changements de direction, genou dans l axe.\n' +
      'Respiration contrôlée pendant la récupération, rester debout plutôt que se plier.',
    evolution:
      'Simplifier : 20 secondes de travail pour 40 de récupération.\n' +
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
    titre: 'Match à thème : deux passes minimum après récupération',
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
      'Réinvestir le travail de la séance dans un jeu réel, en gardant une contrainte qui oriente le comportement collectif.',
    fonctionnement:
      "Match a effectif réduit sur tout le terrain. Après chaque récupération de balle, l'équipe doit réaliser au moins deux passes avant de pouvoir tirer.\n" +
      "Un but sur contre-attaque conclue en moins de huit secondes vaut double.\n" +
      'Deux mi-temps de 8 minutes, avec une minute de pause pour un retour collectif.',
    pointsCles:
      "La contrainte ne doit pas ralentir le jeu : les deux passes se font en avancant.\n" +
      "Observer si les intentions travaillées dans la séance réapparaissent sans consigne.\n" +
      "Laisser jouer : peu d'arrêts, les corrections se font à la pause.",
    evolution:
      "Complexifier : imposer que le pivot touche le ballon avant chaque tir.\n" +
      'Simplifier : supprimer la contrainte de passes sur les cinq dernières minutes.',
    jetons: [GARDIEN_GAUCHE, GARDIEN_DROITE, { type: 'ballon', x: 20, y: 10 }],
  },

  // --------------------------------------------------- Complements de reference

  {
    titre: 'Échauffement prophylactique : épaules, genoux, chevilles',
    ref: 'echauffement-prophylactique-epaules-genoux-chevilles',
    categorie: 'echauffement',
    duree: 12,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['1 élastique par joueur', '6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Préparer les trois zones qui concentrent les blessures en handball adulte - épaule, genou, cheville - avant toute mise en charge de la séance.",
    fonctionnement:
      "Trois ateliers de quatre minutes, tout le groupe en même temps, gardiens compris.\n" +
      "Épaules : rotations externes à l'élastique, 2 x 12 par bras, puis armes lents sans ballon, puis 20 passes progressives à deux en montant l'amplitude.\n" +
      "Genoux : fentes avant controlees, puis réception sur un pied après un petit saut, 8 par jambe, en tenant la position trois secondes.\n" +
      "Chevilles : montees sur pointes, puis appuis latéraux entre deux plots, puis courses en pas chasses avec changement de sens au signal.",
    pointsCles:
      "La qualite prime sur le nombre : une réception genou dans l'axe vaut mieux que dix répétitions rapides.\n" +
      "Aucun tir avant la fin de la séquence épaules : le bras se chauffe en montant l'amplitude, jamais d'entrée.\n" +
      "Même routine à chaque séance : c'est la répétition hebdomadaire qui protège, pas l'exercice isole.",
    evolution:
      "Sans élastique : rotations avec un ballon léger tenu a bout de bras.\n" +
      "Complexifier : ajouter un travail d'équilibre yeux fermes sur la partie genoux.",
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
      "Lancer la séance par un jeu qui force a lever la tête, a se démarquer et a changer de direction sans y penser.",
    fonctionnement:
      "Terrain réduit entre les deux lignes de 9 mètres. Deux chasseurs avec un ballon mousse doivent toucher les autres joueurs sous la ceinture.\n" +
      "Le porteur ne peut pas se déplacer avec le ballon : les chasseurs doivent se faire des passes pour avancer. Un joueur touche devient chasseur.\n" +
      "Trois manches de deux minutes. Les gardiens jouent avec le groupe.",
    pointsCles:
      "Les chasseurs gagnent en se coordonnant, pas en courant : c'est le ballon qui doit se déplacer le plus vite.\n" +
      "Les joueurs poursuivis regardent le ballon, pas le chasseur le plus proche.\n" +
      "Intensité libre mais continue : personne ne marche.",
    evolution:
      "Simplifier : un seul chasseur et un terrain plus grand.\n" +
      "Complexifier : deux ballons en jeu, et le joueur touche reste chasseur jusqu'à la fin de la manche.",
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
    titre: 'Duel un contre un à 9 mètres, départ décale',
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
      "Gagner son duel par la vitesse du premier appui et par le choix, pas par la force : tirer, passer ou déborder selon la réaction du défenseur.",
    fonctionnement:
      "Un attaquant à 11 mètres, un défenseur à 8 mètres, décale d'un mètre sur le côté. L'attaquant reçoit du passeur et attaque l'intervalle.\n" +
      "Le défenseur ne peut avancer qu'au moment de la passe : l'attaquant part donc avec un temps d'avance qu'il doit exploiter tout de suite.\n" +
      "Trois issues autorisees : tir à 9 mètres si le défenseur recule, débordement si le défenseur sort trop haut, remise à l'appui si le duel est perdu.\n" +
      "6 duels par joueur, on change de rôle à chaque tour.",
    pointsCles:
      "Le premier appui se pose dans l'intervalle, pas devant le défenseur.\n" +
      "Le regard reste sur les appuis du défenseur : c'est lui qui donne la solution.\n" +
      "Pas de dribble inutile : un seul dribble maximum avant de decider.",
    evolution:
      "Simplifier : défenseur passif, bras dans le dos, l'attaquant choisit librement.\n" +
      "Complexifier : ajouter un deuxième défenseur en couverture, l'attaquant doit alors trouver la remise.",
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
      "Deux colonnes, une à chaque aile. Le passeur sert l'ailier qui entre dans la zone en trois appuis et tire en suspension.\n" +
      "Première série : tir au premier poteau. Deuxième série : tir au deuxième poteau, par-dessus le bras du gardien. Troisième série : le gardien choisit sa sortie, l'ailier decide en l'air.\n" +
      "8 tirs par ailier et par série, en alternant les deux côtés.",
    pointsCles:
      "Entrer vers le but, pas le long de la ligne de zone : c'est la trajectoire qui ouvre l'angle.\n" +
      "Monter haut et rester en l'air : le tir se déclenche au sommet, pas à la retombee.\n" +
      "Regarder la position des appuis du gardien avant l'impulsion, plus le corps après.",
    evolution:
      "Simplifier : tir sans opposition, gardien qui laisse une moitié de cage ouverte.\n" +
      "Complexifier : ajouter un défenseur extérieur qui ferme le premier poteau, imposant le tir au deuxième.",
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
      "Disposer d'une solution quand le bras est ferme : feinter le tir, changer de main ou passer le ballon derrière la tête du défenseur.",
    fonctionnement:
      "Parcours à trois plots figurant trois défenseurs. Sur le premier, feinte de tir puis reprise d'appui du même côté. Sur le deuxième, changement de main devant le corps. Sur le troisième, feinte de passe puis tir.\n" +
      "Le joueur enchaîne les trois gestes sans s'arrêter, puis tire à 9 mètres.\n" +
      "Trois passages par joueur, le dernier avec un défenseur réel sur le troisième plot.",
    pointsCles:
      "Une feinte n'existe que si le geste est credible : le bras monte réellement en position de tir.\n" +
      "Le ballon reste protège pendant le changement de main, jamais tendu devant soi.\n" +
      "Le regard ne suit pas le ballon : il reste sur le but.",
    evolution:
      "Simplifier : un seul geste par passage, repete jusqu'a ce qu'il soit propre.\n" +
      "Complexifier : l'entraîneur annonce le geste au dernier moment, en levant un bras.",
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
      "Faire circuler le ballon plus vite que le bloc ne glisse, pour trouver le tir du côté faible de la défense.",
    fonctionnement:
      "Attaque placée face à une défense 6-0. Le ballon part de l'aile gauche et doit atteindre l'aile droite en trois passes maximum, sans dribble.\n" +
      "Chaque receveur menace le but avant de transmettre : un appui vers l'intervalle, puis la passe.\n" +
      "Le tir n'est autorise qu'après le renversement complet. 8 répétitions, puis on libere le tir des qu'un intervalle s'ouvre.",
    pointsCles:
      "La passe part avant que le défenseur n'arrive : on transmet sur la sortie, pas après le contact.\n" +
      "Chaque joueur reste à distance de passe, ni trop près ni hors de portee.\n" +
      "Le bloc glisse toujours moins vite que le ballon : la vitesse de circulation est la seule arme ici.",
    evolution:
      "Simplifier : défense passive qui glisse au ralenti, quatre passes autorisees.\n" +
      "Complexifier : imposer un renversement aller-retour avant de pouvoir tirer.",
    consigneInitiale: "Ballon à l'aile gauche, défense regroupee de ce côté.",
    etapes: [
      {
        titre: 'Première passe',
        consigne: "De l'aile vers l'arrière gauche, sans temps d'arrêt.",
        mouvements: [
          { jeton: 'alg', type: 'passe', cible: 'arg' },
          { jeton: 'd5', type: 'course', vers: { x: 33, y: 13.6 } },
        ],
      },
      {
        titre: 'Deuxième passe',
        consigne: 'Le demi-centre relaie dans le même temps.',
        mouvements: [
          { jeton: 'arg', type: 'passe', cible: 'dc' },
          { jeton: 'd4', type: 'course', vers: { x: 32.9, y: 10.8 } },
          { jeton: 'd5', type: 'course', vers: { x: 33.98, y: 13 } },
        ],
      },
      {
        titre: 'Troisième passe et tir',
        consigne: "L'arrière droit reçoit avant que le bloc n'ait glisse : tir à 9 mètres.",
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
    titre: 'Attaque à deux pivots contre défense étagée',
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
      "Desorganiser une défense étagée en occupant deux intervalles à l'intérieur du bloc, et exploiter les couvertures laissees ouvertes.",
    fonctionnement:
      "Un arrière descend en pivot : l'attaque joue à un arrière, un demi-centre, deux ailiers et deux pivots.\n" +
      "Les deux pivots occupent les intervalles 2-3 et 3-4, se relaient par un croise à l'intérieur du bloc et bloquent alternativement les défenseurs charges de la couverture.\n" +
      "Deux issues recherchees : la passe interieure sur un pivot démarque, ou le tir à 9 mètres si les deux défenseurs centraux plongent sur les pivots.\n" +
      "10 répétitions, puis inversion des rôles arrière et pivot.",
    pointsCles:
      "Les deux pivots ne restent jamais dans le même intervalle : sinon toute la défense se resserre au même endroit.\n" +
      "Le bloc se pose sur le défenseur, pas sur son espace : sans contact, il ne gêne personne.\n" +
      "L'arrière restant doit vraiment tirer, sinon la défense ignore la menace exterieure.",
    evolution:
      "Simplifier : défense 6-0 passive, un seul pivot mobile et un pivot fixe.\n" +
      "Complexifier : défense 5-1 ou 3-2-1 active, avec chronomètre de 25 secondes par attaque.",
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
        consigne: 'Ils echangent leur intervalle en bloquant au passage le défenseur de couverture.',
        mouvements: [
          { jeton: 'piv1', type: 'course', vers: { x: 33.6, y: 8.6 } },
          { jeton: 'piv2', type: 'course', vers: { x: 33.6, y: 11.4 } },
        ],
      },
      {
        titre: 'La pointe est fixee',
        consigne: 'Le demi-centre attaque la pointe puis ressort sur son arrière.',
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
    titre: 'Supériorité numérique : attaque à 6 contre 5',
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
      "Six attaquants face à cinq défenseurs, situation d'exclusion de deux minutes.\n" +
      "Consigne : aucune attaque ne se conclut avant 20 secondes de possession et au moins un renversement complet.\n" +
      "La défense à cinq se resserre au centre : le surnombre se trouve donc sur les ailes et par le pivot.\n" +
      "Séries de trois attaques consecutives, puis rotation des groupes.",
    pointsCles:
      "Le joueur libre est toujours à l'oppose du ballon : c'est la que le regard doit aller.\n" +
      "Patience : une attaque à 6 contre 5 se perd presque toujours par un tir trop tot.\n" +
      "Les ailiers restent larges, colles à la ligne de touche, sinon la supériorité disparait.",
    evolution:
      "Simplifier : défense passive, objectif de réussir cinq renversements de suite.\n" +
      "Complexifier : jeu à sept sans gardien, toute perte de balle donnant un but à la défense.",
    consigneInitiale: 'Six attaquants contre cinq défenseurs, ballon au demi-centre.',
    etapes: [
      {
        titre: 'Écarter le bloc',
        consigne: "Le ballon part vite sur un côté : à cinq, la défense ne peut pas tout couvrir.",
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
        consigne: "L'ailier droit monte : à cinq, le défenseur 1 doit choisir entre lui et l'arrière.",
        mouvements: [
          { jeton: 'ald', type: 'course', vers: { x: 34.6, y: 3.2 } },
          { jeton: 'd1', type: 'course', vers: { x: 34.9, y: 4.2 } },
        ],
      },
      {
        titre: 'Conclusion du côté libere',
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
      { type: 'defenseur', etiquette: '3', ref: 'd3', x: 33.9, y: 10 },
      { type: 'defenseur', etiquette: '4', ref: 'd4', x: 33.8, y: 12.6 },
      { type: 'defenseur', etiquette: '5', ref: 'd5', x: 35.18, y: 15.4 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Attaque en continu : trois vagues sans temps d arrêt',
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
      "Enchaîner les attaques sans reorganisation, pour installer les repères de placement sous fatigue et avec un temps de décision court.",
    fonctionnement:
      "Trois groupes de quatre attaquants se relaient face à une défense fixe de six joueurs.\n" +
      "Des que le tir est effectue ou que le ballon sort, la vague suivante entre immédiatement avec un nouveau ballon : la défense n'a jamais le temps de se replacer complètement.\n" +
      "Chaque attaque dure 15 secondes maximum. Séries de six minutes, puis on change le groupe défenseur.",
    pointsCles:
      "L'attaque commence des l'entrée sur le terrain : pas de mise en place, on joue sur ce qui est ouvert.\n" +
      "Les postes tournent à chaque vague : chacun doit savoir jouer au moins deux places.\n" +
      "La défense apprend ici a se réorganiser vite : c'est un exercice défensif autant qu'offensif.",
    evolution:
      "Simplifier : 20 secondes par attaque et une pause de cinq secondes entre deux vagues.\n" +
      "Complexifier : imposer une conclusion différente à chaque vague, annoncee par l'entraîneur.",
    jetons: [
      GARDIEN_DROITE,
      ...DEFENSE_6_0,
      { type: 'attaquant', etiquette: 'ArG', x: 31.5, y: 14.5 },
      { type: 'attaquant', etiquette: 'DC', x: 30.5, y: 10 },
      { type: 'attaquant', etiquette: 'ArD', x: 31.5, y: 5.5 },
      { type: 'attaquant', etiquette: 'PIV', x: 32.3, y: 10 },
      { type: 'attaquant', etiquette: '2', x: 27, y: 16 },
      { type: 'attaquant', etiquette: '2', x: 27, y: 4 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Défense 3-2-1 : étagement, sortie et couverture',
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
      "Mettre en place les trois lignes du 3-2-1 : le défenseur haut donne l'amplitude, les deux joueurs de la deuxième ligne coupent les lignes de passe, la troisième ligne tient le pivot et les ailes.",
    fonctionnement:
      "Mise en place à vide : le numéro 3 haut se place au-dela des 9 mètres face au demi-centre, les deux numéros 2 sur la ligne de jet franc, les numéros 1 et le numéro 3 bas sur la surface.\n" +
      "Première phase, l'attaque fait tourner le ballon sans tirer : le bloc glisse en gardant l'étagement, chacun se placant par rapport au défenseur haut.\n" +
      "Deuxième phase, l'attaque joue réellement : sur chaque sortie d'un défenseur, le joueur derrière lui assure immédiatement la couverture.\n" +
      "Trois séries de cinq attaques, avec un retour collectif entre chaque série.",
    pointsCles:
      "Le numéro 3 haut donne le signal : s'il ne sort pas, personne ne sort.\n" +
      "Une sortie sans couverture derrière est une faute, même si le ballon est récupère.\n" +
      "Le 3-2-1 est très efficace une vingtaine de secondes puis devient couteux : on l'utilise par séquences, pas toute la rencontre.\n" +
      "Point de rupture connu : l'attaque à deux pivots, qui isole la troisième ligne. Le repère est alors de faire redescendre le numéro 3 haut.",
    evolution:
      "Simplifier : partir d'une 5-1 déjà connue, puis avancer un seul numéro 2 pour passer au 3-2-1.\n" +
      "Complexifier : alterner 6-0 et 3-2-1 sur signal de l'entraîneur, en cours d'attaque.",
    consigneInitiale: 'Ballon au demi-centre, défense étagée sur trois lignes.',
    etapes: [
      {
        titre: 'Le haut avance',
        consigne: "Le défenseur haut sort sur le porteur et l'oblige à écarter.",
        mouvements: [
          { jeton: 'd3h', type: 'course', vers: { x: 30.6, y: 10 } },
          { jeton: 'dc', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Glissement de l etage intermediaire',
        consigne: 'Le 2 côté ballon sort, le haut decroche pour couvrir.',
        mouvements: [
          { jeton: 'd5', type: 'course', vers: { x: 31.8, y: 13.4 } },
          { jeton: 'd3h', type: 'course', vers: { x: 31.2, y: 11.4 } },
        ],
      },
      {
        titre: 'Aide sur le pivot',
        consigne: 'Le bas reste seul devant : il ne lâche jamais le pivot.',
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
      { type: 'ballon', x: 30.3, y: 11.2 },
    ],
  },

  {
    titre: 'Duel défensif : contest, contre et récupération',
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
      "Gagner le duel défensif sans faute : barrer la trajectoire avec les appuis, contrer avec le bras côté ballon, et enchaîner sur la récupération.",
    fonctionnement:
      "Un attaquant part de 11 mètres, un défenseur le prend en charge en un contre un dans un couloir de quatre mètres delimite par des plots.\n" +
      "Le défenseur doit d'abord contrarier l'appui d'appel, puis lever le bras côté ballon au moment de l'armee.\n" +
      "Un ballon contre ou intercepte déclenche immédiatement une contre-attaque vers le but oppose : le duel ne s'arrête pas au tir.\n" +
      "6 duels par joueur, rôles inverses à chaque passage.",
    pointsCles:
      "Les appuis avant les mains : on ferme la trajectoire en se placant, pas en poussant.\n" +
      "Le bras qui contre est celui du côté du ballon, tendu vers le haut, jamais en travers du corps de l'attaquant.\n" +
      "Rester en mouvement après le contre : le ballon appartient a celui qui repart le premier.",
    evolution:
      "Simplifier : couloir plus étroit et attaquant sans dribble.\n" +
      "Complexifier : deux attaquants contre deux défenseurs dans le même couloir.",
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
    titre: 'Infériorité numérique : defendre à 5 contre 6',
    ref: 'inferiorite-numerique-defendre-a-5-contre-6',
    categorie: 'defense',
    duree: 15,
    nombreJoueurs: 11,
    nombreGardiens: 1,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles', 'chronomètre'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Tenir deux minutes à cinq : protéger le centre, accepter le tir de l'aile, et sortir de l'exclusion sans encaisser plus d'un but.",
    fonctionnement:
      "Cinq défenseurs face à six attaquants, bloc resserre autour des deux intervalles centraux.\n" +
      "Le ballon à l'aile n'est pas suivi : le défenseur extérieur reste sur son intervalle intérieur et laisse le tir de l'aile, en comptant sur le gardien.\n" +
      "Sur chaque passe interieure, le défenseur central le plus proche prend le pivot, les autres resserrent aussitot.\n" +
      "Séquences de deux minutes chronometrees, comme une exclusion réelle, avec le score de la séquence annonce à la fin.",
    pointsCles:
      "Le centre d'abord : un but à 6 mètres coûte plus cher qu'un but de l'aile.\n" +
      "Communiquer à voix haute : à cinq, chaque changement de charge doit être annonce.\n" +
      "Ne pas courir après le ballon : le bloc glisse ensemble, il ne se disloque jamais.",
    evolution:
      "Simplifier : attaque interdite de tirer à 9 mètres, la défense se concentre sur le pivot.\n" +
      "Complexifier : quatre contre six pendant les trente dernières secondes de la séquence.",
    consigneInitiale: "Cinq défenseurs contre six attaquants, ballon à l'arrière gauche.",
    etapes: [
      {
        titre: 'Protéger l axe',
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
        consigne: "C'est le tir qu'on accepte : de face, à 9 mètres, gardien preveni.",
        mouvements: [{ jeton: 'dc', type: 'tir', vers: { x: 40, y: 10 } }],
      },
    ],
    jetons: [
      GARDIEN_DROITE,
      ...ATTAQUE_PLACEE,
      { type: 'defenseur', etiquette: '1', ref: 'd1', x: 34.33, y: 6 },
      { type: 'defenseur', etiquette: '2', ref: 'd2', x: 33.6, y: 8 },
      { type: 'defenseur', etiquette: '3', ref: 'd3', x: 33.9, y: 10 },
      { type: 'defenseur', etiquette: '4', ref: 'd4', x: 33.6, y: 12 },
      { type: 'defenseur', etiquette: '5', ref: 'd5', x: 34.33, y: 14 },
      { type: 'ballon', x: 30.58, y: 15.42 },
    ],
  },

  {
    titre: 'Contre-attaque soutenue : deuxième vague et engagement rapide',
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
      "Marquer avant que la défense adverse ne soit en place : ailiers en première vague, arrières lances en deuxième vague, engagement rapide après le but.",
    fonctionnement:
      "Le gardien arrête ou récupère, les deux ailiers partent immédiatement en première vague le long des lignes de touche.\n" +
      "Si le repli adverse ferme la première vague, le ballon est joue en retrait sur un arrière lance qui arrive en deuxième vague et tire à 9 mètres avant l'installation du bloc.\n" +
      "Après chaque but, engagement immédiat : le joueur au centre remet en jeu sans attendre.\n" +
      "Vagues continues pendant six minutes, puis inversion des rôles avec le groupe qui repliait.",
    pointsCles:
      "La deuxième vague part depuis les 9 mètres de son propre camp, sinon elle arrive en marchant.\n" +
      "Le ballon va toujours plus vite en avancant qu'en traversant : une passe longue vaut mieux que trois passes laterales.\n" +
      "L'engagement rapide se prépare avant le but : quelqu'un doit déjà être au centre.",
    evolution:
      "Simplifier : trois attaquants contre un seul défenseur qui replie.\n" +
      "Complexifier : le tir de première vague est interdit, seule la deuxième vague peut conclure.",
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
    titre: 'Montée de balle 4 contre 3 face au repli',
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
      "Conclure un surnombre en mouvement : occuper toute la largeur, fixer un défenseur par la course, et transmettre au dernier moment.",
    fonctionnement:
      "Quatre attaquants partent de leur ligne de 9 mètres contre trois défenseurs déjà replies à mi-terrain.\n" +
      "Règle unique : deux dribbles maximum par joueur. Le surnombre doit se conclure en moins de huit secondes.\n" +
      "Si les défenseurs recuperent, ils repartent immédiatement en contre-attaque à trois contre les quatre attaquants devenus défenseurs.\n" +
      "Rotation continue, chaque groupe alternant attaque et repli.",
    pointsCles:
      "Le porteur avance vers un défenseur, jamais vers un espace vide : sans fixation, pas de surnombre.\n" +
      "La passe part quand le défenseur a engage son appui, pas avant.\n" +
      "Les joueurs extérieurs restent larges jusqu'au dernier moment : c'est la largeur qui cree le décalage.",
    evolution:
      "Simplifier : 3 contre 2, sans limite de dribbles.\n" +
      "Complexifier : 4 contre 4 avec un défenseur qui entre en retard depuis la ligne de fond.",
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
      "Développer l'impulsion et la stabilite du tronc, deux qualites qui conditionnent le tir en suspension et la résistance au contact.",
    fonctionnement:
      "Cinq ateliers de 40 secondes, 20 secondes de passage d'un atelier à l'autre, trois tours.\n" +
      "1. Sauts pieds joints par-dessus quatre haies basses, réception amortie.\n" +
      "2. Gainage ventral avec touche d'épaule alternée.\n" +
      "3. Sprint de 15 mètres avec changement de direction sur plot, retour au trot.\n" +
      "4. Lancers de ballon leste à deux mains au-dessus de la tête, à deux.\n" +
      "5. Gainage latéral, une jambe levée, 20 secondes de chaque côté.\n" +
      "Placer ce circuit après l'échauffement complet et avant le travail avec ballon, jamais en fin de séance.",
    pointsCles:
      "Sur les sauts, c'est la qualite de réception qui compte : genou dans l'axe, pas de rebond mou.\n" +
      "Le bassin ne bouge pas sur les ateliers de gainage : mieux vaut 20 secondes propres que 40 secondes affaissees.\n" +
      "Récupération réellement respectee entre les tours, sinon l'exercice devient de l'endurance et perd son objet.",
    evolution:
      "Simplifier : deux tours, haies remplacees par des lignes au sol.\n" +
      "Complexifier : ajouter un tir à 9 mètres immédiatement après le troisième atelier, sous fatigue.",
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
    titre: 'Match à thème : dernières minutes, un but d écart',
    ref: 'match-a-theme-dernieres-minutes-un-but-d-ecart',
    categorie: 'jeu',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['3 ballons', 'chasubles', 'chronomètre'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Travailler la gestion de fin de match : un but d'avance a defendre, ou un but de retard a combler, avec le chronomètre comme adversaire.",
    fonctionnement:
      "Match sur tout le terrain, chronomètre à trois minutes, une équipe menant d'un but.\n" +
      "L'équipe qui mene doit conserver et user le temps sans faire de faute grossiere. L'équipe menee doit accélérer sans precipitation, avec la possibilite de sortir son gardien pour jouer à sept.\n" +
      "Un temps mort par équipe, a poser au bon moment : c'est aussi ce qui se travaille ici.\n" +
      "Trois séquences, en inversant à chaque fois le rôle de l'équipe qui mene.",
    pointsCles:
      "Mener ne veut pas dire reculer : l'équipe devant continue d'attaquer, elle prend seulement moins de risques.\n" +
      "L'équipe menee doit choisir son moment pour sortir le gardien, pas le faire des la première possession.\n" +
      "Observer qui prend la parole dans le groupe quand le score se resserre.",
    evolution:
      "Simplifier : deux buts d'écart et quatre minutes, la pression est moins forte.\n" +
      "Complexifier : ajouter une exclusion de deux minutes à l'équipe qui mene, des le debut de la séquence.",
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
      "Multiplier les prises de décision par joueur : sur un espace réduit, chacun touche le ballon bien plus souvent qu'en jeu à sept.",
    fonctionnement:
      "Trois équipes de quatre sur un demi-terrain, un seul but et un gardien.\n" +
      "L'équipe qui marque reste. L'équipe qui encaisse ou perd le ballon sort, et l'équipe en attente entre immédiatement en attaque depuis les 9 mètres.\n" +
      "Pas de pivot impose : les joueurs occupent les postes selon la circulation.\n" +
      "Séquences de cinq minutes, deux ou trois selon le temps restant.",
    pointsCles:
      "A quatre contre quatre, chaque joueur defend un espace et un homme : la responsabilité est individuelle.\n" +
      "Le décalage vient de la profondeur : sur un espace réduit, c'est la course vers le but qui ouvre.\n" +
      "Enchaînement immédiat : l'équipe qui entre joue sans mise en place.",
    evolution:
      "Simplifier : deux équipes seulement, avec relance à chaque perte de balle.\n" +
      "Complexifier : obliger un tir de 9 mètres ou une passe à un joueur entre dans la zone avant de conclure.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: '1', x: 31, y: 15 },
      { type: 'attaquant', etiquette: '2', x: 29.5, y: 10 },
      { type: 'attaquant', etiquette: '3', x: 31, y: 5 },
      { type: 'attaquant', etiquette: '4', x: 32, y: 10 },
      { type: 'defenseur', etiquette: 'D', x: 33.8, y: 13 },
      { type: 'defenseur', etiquette: 'D', x: 33.4, y: 10.5 },
      { type: 'defenseur', etiquette: 'D', x: 33.8, y: 7 },
      { type: 'defenseur', etiquette: 'D', x: 34.88, y: 15 },
      { type: 'ballon', x: 28.58, y: 10.92 },
    ],
  },
]
