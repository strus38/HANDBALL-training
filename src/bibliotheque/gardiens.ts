/**
 * Fiches specifiques aux gardiens de but.
 *
 * Deux familles, selon ce que fait le reste du groupe :
 * - « Gardiens seuls » : les gardiens travaillent a l'ecart, pendant que le
 *   groupe mene un exercice qui ne demande pas de but. Ces fiches sont marquees
 *   « en parallele » : leur duree ne s'ajoute pas au temps total de la seance.
 * - « Avec les joueurs » : les tireurs font partie de l'exercice, le gardien y
 *   travaille en situation reelle.
 */

import { GARDIEN_DROITE, GARDIEN_GAUCHE, type ModeleExercice } from './modeles'

export const GARDIENS: ModeleExercice[] = [
  {
    titre: 'Échauffement gardien : appuis, mains et prise de balle',
    ref: 'echauffement-gardien-appuis-mains-et-prise-de-balle',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['4 ballons', '2 ballons lestés'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      'Préparer les épaules, les hanches et les mains avant les tirs, et retrouver les repères de placement sur la ligne.',
    fonctionnement:
      "Les deux gardiens travaillent face à face, à six mètres, pendant que le groupe s'échauffe de son côté.\n" +
      'Séquence : mobilisation des hanches et des épaules, puis passes à deux mains, puis un gardien envoie des ballons à mi-hauteur que l autre bloque en position de garde.\n' +
      'Terminer par 20 ballons au sol et 20 ballons à hauteur de tête, en alternance gauche - droite.',
    pointsCles:
      "Rester en appui sur l'avant des pieds, genoux fléchis, mains à hauteur des épaules.\n" +
      "Aller chercher le ballon, ne jamais l'attendre bras collés au corps.\n" +
      'Le regard reste sur le ballon jusqu au contact avec les mains.',
    evolution:
      'Complexifier : ajouter un ballon lesté sur la dernière série pour renforcer les épaules.\n' +
      'Sans deuxième gardien : un joueur ou un entraîneur peut servir les ballons.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'gardien', etiquette: 'GB2', x: 33, y: 10 },
      { type: 'ballon', x: 32.08, y: 10.92 },
    ],
  },

  {
    titre: 'Déplacements et réactivité sur la ligne',
    ref: 'deplacements-et-reactivite-sur-la-ligne',
    categorie: 'gardien',
    duree: 10,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 ballons', '2 plots'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      'Automatiser le déplacement latéral en arc de cercle et raccourcir le temps de réaction sur un tir proche.',
    fonctionnement:
      "À mener pendant que le groupe travaille la préparation physique ou un atelier sans but.\n" +
      "Le gardien se déplace d'un poteau à l'autre en suivant un arc, en pas chassés, sans croiser les appuis. À chaque arrêt, un ballon est envoyé au hasard d'un côté.\n" +
      'Séries de 30 secondes, 6 répétitions, avec 30 secondes de récupération. Les deux gardiens alternent servant et travaillant.',
    pointsCles:
      "Le buste reste face au ballon, les épaules ne tournent pas dans le déplacement.\n" +
      "Toujours revenir au centre de l'angle après chaque intervention.\n" +
      'Un seul appui de replacement, pas trois petits pas.',
    evolution:
      'Complexifier : annoncer le côté au dernier moment, ou envoyer deux ballons de suite.\n' +
      'Simplifier : rythme imposé plus lent, ballons annoncés à l avance.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'entraineur', etiquette: 'S', x: 33, y: 10 },
      { type: 'plot', x: 36.5, y: 7 },
      { type: 'plot', x: 36.5, y: 13 },
      { type: 'ballon', x: 33, y: 10 },
    ],
  },

  {
    titre: 'Duels croisés entre gardiens',
    ref: 'duels-croises-entre-gardiens',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'complet',
    objectifs:
      'Travailler la lecture du tir et la relance, en autonomie complète, sans mobiliser de joueur de champ.',
    fonctionnement:
      "Les deux gardiens occupent chacun un but et se tirent dessus à tour de rôle depuis la ligne des 9 mètres.\n" +
      'Le gardien qui vient d arrêter relance immédiatement en course vers l autre but, ce qui enchaîne arrêt et première passe.\n' +
      'Match en 10 points : un but marqué vaut un point, un arrêt suivi d une relance précise vaut un point.',
    pointsCles:
      "Se placer avant l'armé du tireur, pas pendant.\n" +
      "Ne pas anticiper systématiquement : lire l'épaule et la hanche du tireur.\n" +
      'La relance part dès la récupération du ballon, sans temps mort.',
    evolution:
      "Complexifier : interdire de tirer deux fois de suite au même endroit.\n" +
      "Avec un seul gardien : l'entraîneur remplace le second poste.",
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'ballon', x: 31, y: 10 },
      { type: 'ballon', x: 9, y: 10 },
    ],
  },

  {
    titre: 'Gardien face aux tirs à 9 mètres',
    ref: 'gardien-face-aux-tirs-a-9-metres',
    categorie: 'gardien',
    duree: 15,
    nombreJoueurs: 6,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Installer le placement sur l'angle et la lecture des tirs longs, en situation réelle de tir en suspension.",
    fonctionnement:
      "Trois postes de tir : arrière gauche, demi-centre, arrière droit. Les tireurs alternent, un ballon toutes les cinq secondes.\n" +
      'Série 1 : tirs annoncés, le gardien travaille son placement. Série 2 : tirs libres. Série 3 : avec un défenseur qui ferme un côté, obligeant le gardien à couvrir l autre.\n' +
      "Trois séries de 12 ballons, avec une pause entre chaque.",
    pointsCles:
      "Le gardien avance d'un pas sur l'angle à chaque changement de poste de tir.\n" +
      'Sur un tir avec défenseur, le gardien couvre le côté laissé libre par la défense : le placement se décide à deux.\n' +
      'Rester grand : les bras montent avant le tir, pas après.',
    evolution:
      "Simplifier : sans défenseur, tirs à cadence lente.\n" +
      'Complexifier : ajouter un rebond au sol imposé sur un tir sur trois.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'ArG', x: 31, y: 14.5 },
      { type: 'attaquant', etiquette: 'DC', x: 30.5, y: 10 },
      { type: 'attaquant', etiquette: 'ArD', x: 31, y: 5.5 },
      { type: 'defenseur', etiquette: 'D', x: 33.4, y: 10 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Tirs des ailes et un contre un',
    ref: 'tirs-des-ailes-et-un-contre-un',
    categorie: 'gardien',
    duree: 15,
    nombreJoueurs: 6,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['6 ballons', '2 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Fermer l'angle court sur les tirs d'aile et tenir la position sur le un contre un.",
    fonctionnement:
      "Alternance de tirs venant de l'aile gauche et de l'aile droite. Le gardien sort à la rencontre du tireur pour fermer le premier poteau, sans se coucher trop tôt.\n" +
      'Deuxième partie : un contre un depuis 9 mètres, le gardien doit tenir jusqu au dernier moment.\n' +
      '10 ballons par aile, puis 10 duels.',
    pointsCles:
      "Sortir en ligne droite vers le ballon, pas en arc : chaque mètre gagné ferme l'angle.\n" +
      'Le premier poteau se protège en priorité, le gardien ne le laisse jamais ouvert.\n' +
      'Sur le duel, rester debout : se coucher tôt donne la lucarne au tireur.',
    evolution:
      "Simplifier : tirs d'aile seuls, sans la partie duel.\n" +
      "Complexifier : le tireur d'aile a le droit de faire une passe au pivot.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'AlG', x: 36.5, y: 18.3 },
      { type: 'attaquant', etiquette: 'AlD', x: 36.5, y: 1.7 },
      { type: 'attaquant', etiquette: '1', x: 30.5, y: 10 },
      { type: 'ballon', x: 36.16, y: 17.04 },
      { type: 'plot', x: 34, y: 16 },
      { type: 'plot', x: 34, y: 4 },
    ],
  },

  {
    titre: 'Jets de 7 mètres',
    ref: 'jets-de-7-metres',
    categorie: 'gardien',
    duree: 10,
    nombreJoueurs: 6,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'zone',
    objectifs:
      'Travailler la prise de décision sur le penalty et installer une routine avant le tir.',
    fonctionnement:
      "Chaque joueur tire trois jets de 7 mètres. Le gardien annonce à l'entraîneur, avant chaque tir, le côté qu'il a choisi de protéger.\n" +
      'On comptabilise arrêts et buts pour identifier les tendances de chaque tireur.\n' +
      'Deuxième tour : les tireurs connaissent leurs statistiques et doivent varier.',
    pointsCles:
      "Prendre une information sur la course d'élan et l'appui d'impulsion du tireur.\n" +
      "Ne pas partir avant l'armé : un gardien immobile arrête plus qu'un gardien lancé trop tôt.\n" +
      "Assumer un choix : l'indécision couvre les deux côtés à moitié.",
    evolution:
      "Complexifier : le tireur a le droit à une feinte.\n" +
      'Mettre un enjeu : le perdant du duel gardien - tireur fait un gage collectif.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'T', x: 33, y: 10 },
      { type: 'ballon', x: 32.08, y: 10.92 },
      { type: 'attaquant', etiquette: '2', x: 30, y: 12 },
      { type: 'attaquant', etiquette: '3', x: 30, y: 8 },
    ],
  },

  {
    titre: 'Relance et première passe de contre-attaque',
    ref: 'relance-et-premiere-passe-de-contre-attaque',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 4,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      'Faire du gardien le premier relanceur : voir avant de recevoir, et transmettre juste sur 20 à 30 mètres.',
    fonctionnement:
      "Le gardien arrête ou récupère un ballon, puis relance immédiatement sur un ailier parti en course.\n" +
      "Trois cibles possibles : ailier gauche, ailier droit, ou joueur au centre en appui. L'entraîneur désigne la cible au dernier moment, après l'arrêt.\n" +
      '15 relances par gardien, en alternant les cibles.',
    pointsCles:
      "Prendre l'information sur le terrain pendant que le ballon arrive, pas après l'avoir bloqué.\n" +
      'Relance tendue devant le joueur, jamais dans son dos ni en cloche.\n' +
      "Se replacer immédiatement après la relance : le ballon peut revenir.",
    evolution:
      "Simplifier : cible annoncée à l'avance.\n" +
      "Complexifier : ajouter un défenseur sur la ligne de passe de la cible principale.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'AlG', x: 24, y: 18.3 },
      { type: 'attaquant', etiquette: 'AlD', x: 24, y: 1.7 },
      { type: 'attaquant', etiquette: 'A', x: 22, y: 10 },
      { type: 'entraineur', etiquette: 'E', x: 31, y: 10 },
      { type: 'ballon', x: 31, y: 10 },
    ],
  },

  // --------------------------------------------------- Complements de reference

  {
    titre: 'Gardien face au pivot et aux ballons à rebond',
    ref: 'gardien-face-au-pivot-et-aux-ballons-a-rebond',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 4,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['6 ballons'],
    formatGardiens: 'avec-joueurs',
    vue: 'zone',
    objectifs:
      "Traiter les tirs les plus proches : sortir vite sur le pivot pour réduire l'angle, et rester sur ses appuis sur les ballons à rebond.",
    fonctionnement:
      "Deux passeurs à 9 mètres servent un pivot qui reçoit dos au but, se retourne et tire immédiatement à 6 mètres.\n" +
      "Une série sur deux, le pivot a consigne de tirer à rebond, devant la ligne de surface.\n" +
      "Le gardien alterne : sortie franche à un mètre de la ligne sur le tir direct, position basse et jambes fermées sur le ballon à rebond.\n" +
      "12 tirs par gardien et par série, en variant le côté de la remise.",
    pointsCles:
      "Sur le pivot, la sortie doit être finie avant le tir : un gardien qui avance encore au moment du tir n'a plus de base.\n" +
      "Sur le rebond, ne pas plonger : les jambes se ferment et le corps reste haut, sinon le ballon passe dessous.\n" +
      "Lire l'épaule du pivot dès sa rotation : elle indique le côté avant le bras.",
    evolution:
      "Simplifier : le pivot annonce à l'avance direct ou rebond.\n" +
      "Complexifier : ajouter un défenseur dans le dos du pivot, ce qui masque le départ du tir.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'PIV', x: 33.8, y: 10 },
      { type: 'entraineur', etiquette: 'P', x: 31, y: 13.5 },
      { type: 'entraineur', etiquette: 'P', x: 31, y: 6.5 },
      { type: 'ballon', x: 31, y: 13.5 },
    ],
  },

  {
    titre: 'Lecture du tireur : prise d information et anticipation',
    ref: 'lecture-du-tireur-prise-d-information-et-anticipatio',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 6,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['6 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Decider à partir d'indices, pas au hasard : position des appuis, hauteur du coude, orientation des hanches du tireur.",
    fonctionnement:
      "Les tireurs se succedent depuis les trois postes arrière, sans consigne de zone imposee.\n" +
      "Le gardien annonce à voix haute, juste après chaque tir, l'indice sur lequel il a decide : appui, épaule, coude ou hanche.\n" +
      "L'entraîneur note les tirs ou l'indice etait juste, même si le ballon est entre : c'est la lecture qui est evaluee, pas le résultat.\n" +
      "Trois séries de 10 tirs, avec un point d'étape entre chaque série.",
    pointsCles:
      "Un gardien qui devine part avant le tir ; un gardien qui lit part avec le tir. La difference se voit sur le premier appui.\n" +
      "L'appui d'impulsion du tireur donne le côté bien avant le bras.\n" +
      "Verbaliser l'indice après coup fixe l'apprentissage : sans cela, le gardien reproduit ses réflexes sans les corriger.",
    evolution:
      "Simplifier : les tireurs ne visent que deux zones, annoncees à l'avance au gardien.\n" +
      "Complexifier : ajouter un défenseur qui masque partiellement, obligeant a lire uniquement les appuis.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'ArG', x: 31.5, y: 14.5 },
      { type: 'attaquant', etiquette: 'DC', x: 30.5, y: 10 },
      { type: 'attaquant', etiquette: 'ArD', x: 31.5, y: 5.5 },
      { type: 'entraineur', etiquette: 'E', x: 28, y: 10 },
      { type: 'ballon', x: 29.58, y: 10.92 },
    ],
  },

  {
    titre: 'Gardien : sortie et duel face au joueur lancé',
    ref: 'gardien-sortie-et-duel-face-au-joueur-lance',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 6,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 ballons', '4 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Traiter la contre-attaque : choisir entre rester sur la ligne et sortir à la rencontre du joueur lance, puis tenir le duel sans reculer.",
    fonctionnement:
      "Un joueur part de mi-terrain en dribble, seul face au gardien, avec un angle différent à chaque passage : central, cote aile gauche, cote aile droite.\n" +
      "Le gardien avance à la rencontre du joueur des que celui-ci franchit les 12 mètres, puis se stabilise avant le tir.\n" +
      "Sur un passage sur trois, un deuxième attaquant suit en soutien : le gardien doit alors couvrir le tir sans se jeter, pour ne pas offrir la passe.\n" +
      "10 duels par gardien.",
    pointsCles:
      "Sortir tot et s'arrêter, plutôt que sortir tard en courant : un gardien en mouvement est un gardien battu.\n" +
      "Rester grand, bras ecartes, le plus longtemps possible : c'est la surface qui gêne, pas le plongeon.\n" +
      "Face à deux attaquants, jouer le porteur et laisser la passe : c'est la solution la plus lente pour eux.",
    evolution:
      "Simplifier : angle central uniquement, sans soutien.\n" +
      "Complexifier : le joueur lance a le droit de feinter le tir une fois avant de conclure.",
    jetons: [
      GARDIEN_DROITE,
      { type: 'attaquant', etiquette: 'A', x: 20, y: 10 },
      { type: 'attaquant', etiquette: 'S', x: 18, y: 15 },
      { type: 'ballon', x: 21.26, y: 10.34 },
      { type: 'plot', x: 28, y: 16 },
      { type: 'plot', x: 28, y: 4 },
    ],
  },

  {
    titre: 'Gardiens seuls : réactivité et coordination oeil-main',
    ref: 'gardiens-seuls-reactivite-et-coordination-oeil-main',
    categorie: 'gardien',
    duree: 10,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['6 balles de tennis', '2 ballons', '1 mur ou 1 panneau'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      "Accélérer le temps de réaction et la dissociation des deux mains, pendant que le groupe travaille un exercice sans but.",
    fonctionnement:
      "Les deux gardiens travaillent à l'écart, en alternant les rôles toutes les 45 secondes.\n" +
      "1. Le partenaire tient une balle de tennis dans chaque main, bras ecartes, et en lâche une sans prevenir : le gardien la rattrape avant le deuxième rebond.\n" +
      "2. Le partenaire montre une balle à droite ou à gauche, à hauteur d'épaule : le gardien touche la balle de la main et du pied du même côté, simultanement.\n" +
      "3. Renvois au mur à une main, alternance droite - gauche, 30 secondes par main.\n" +
      "Trois tours complets. Effort court et intense, récupération réelle entre les tours.",
    pointsCles:
      "Main et pied partent ensemble : c'est cette coordination qui fait l'arrêt du bas, pas la vitesse du bras seul.\n" +
      "Le regard reste fixe devant, ce sont les mains qui vont chercher, pas la tête qui suit.\n" +
      "Séries courtes : des que le temps de réaction se degrade, l'atelier ne sert plus a rien.",
    evolution:
      "Sans balles de tennis : un ballon montre à droite ou à gauche produit le même travail, en moins exigeant.\n" +
      "Avec un seul gardien : l'entraîneur ou un joueur blesse peut tenir le rôle du partenaire.",
    jetons: [
      { type: 'gardien', etiquette: 'GB1', x: 31, y: 13 },
      { type: 'gardien', etiquette: 'GB2', x: 33, y: 13 },
      { type: 'ballon', x: 32.5, y: 11.8 },
    ],
  },

  {
    titre: 'Gardiens seuls : appuis, hanches et prévention épaule',
    ref: 'gardiens-seuls-appuis-hanches-et-prevention-epaule',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['2 élastiques', '4 plots', '2 ballons'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      "Entretenir ce que le poste sollicite le plus - amplitude de hanche, gainage latéral, stabilite d'épaule - pendant que le groupe travaille sans but.",
    fonctionnement:
      "Circuit de quatre ateliers, 45 secondes chacun, deux tours, les deux gardiens en même temps.\n" +
      "1. Écarts latéraux contrôles sur une jambe, retour en position de garde, 8 par côté.\n" +
      "2. Déplacements en pas chasses entre quatre plots, sans croiser les appuis.\n" +
      "3. Rotations externes d'épaule à l'élastique, coude au corps, 2 x 12 par bras.\n" +
      "4. Gainage latéral avec bras tendu vers le plafond, 30 secondes par côté.\n" +
      "A placer en debut de séance ou juste après l'échauffement, jamais après une longue série de tirs.",
    pointsCles:
      "Amplitude d'abord, vitesse ensuite : un écart mal contrôle fatigue l'adducteur sans rien gagner.\n" +
      "Les appuis ne se croisent jamais en pas chasses, sinon le gardien est en retard sur le tir suivant.\n" +
      "L'élastique doit rester léger : l'objectif est la stabilite de l'épaule, pas la force du bras.",
    evolution:
      "Sans élastique : rotations avec un ballon tenu a bout de bras, plus court.\n" +
      "Complexifier : enchaîner chaque atelier avec deux arrêts réels servis par le partenaire.",
    jetons: [
      { type: 'gardien', etiquette: 'GB1', x: 31, y: 13 },
      { type: 'gardien', etiquette: 'GB2', x: 31, y: 7 },
      { type: 'plot', x: 29, y: 10 },
      { type: 'plot', x: 33, y: 10 },
      { type: 'plot', x: 31, y: 12 },
      { type: 'plot', x: 31, y: 8 },
    ],
  },
]
