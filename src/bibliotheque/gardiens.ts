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
    titre: 'Echauffement gardien : appuis, mains et prise de balle',
    ref: 'echauffement-gardien-appuis-mains-et-prise-de-balle',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['4 ballons', '2 ballons lestes'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      'Preparer les epaules, les hanches et les mains avant les tirs, et retrouver les reperes de placement sur la ligne.',
    fonctionnement:
      "Les deux gardiens travaillent face a face, a six metres, pendant que le groupe s'echauffe de son cote.\n" +
      'Sequence : mobilisation des hanches et des epaules, puis passes a deux mains, puis un gardien envoie des ballons a mi-hauteur que l autre bloque en position de garde.\n' +
      'Terminer par 20 ballons au sol et 20 ballons a hauteur de tete, en alternance gauche - droite.',
    pointsCles:
      "Rester en appui sur l'avant des pieds, genoux flechis, mains a hauteur des epaules.\n" +
      "Aller chercher le ballon, ne jamais l'attendre bras colles au corps.\n" +
      'Le regard reste sur le ballon jusqu au contact avec les mains.',
    evolution:
      'Complexifier : ajouter un ballon leste sur la derniere serie pour renforcer les epaules.\n' +
      'Sans deuxieme gardien : un joueur ou un entraineur peut servir les ballons.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'gardien', etiquette: 'GB2', x: 33, y: 10 },
      { type: 'ballon', x: 32.08, y: 10.92 },
    ],
  },

  {
    titre: 'Deplacements et reactivite sur la ligne',
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
      'Automatiser le deplacement lateral en arc de cercle et raccourcir le temps de reaction sur un tir proche.',
    fonctionnement:
      "A mener pendant que le groupe travaille la preparation physique ou un atelier sans but.\n" +
      "Le gardien se deplace d'un poteau a l'autre en suivant un arc, en pas chasses, sans croiser les appuis. A chaque arret, un ballon est envoye au hasard d'un cote.\n" +
      'Series de 30 secondes, 6 repetitions, avec 30 secondes de recuperation. Les deux gardiens alternent servant et travaillant.',
    pointsCles:
      "Le buste reste face au ballon, les epaules ne tournent pas dans le deplacement.\n" +
      "Toujours revenir au centre de l'angle apres chaque intervention.\n" +
      'Un seul appui de replacement, pas trois petits pas.',
    evolution:
      'Complexifier : annoncer le cote au dernier moment, ou envoyer deux ballons de suite.\n' +
      'Simplifier : rythme impose plus lent, ballons annonces a l avance.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'entraineur', etiquette: 'S', x: 33, y: 10 },
      { type: 'plot', x: 36.5, y: 7 },
      { type: 'plot', x: 36.5, y: 13 },
      { type: 'ballon', x: 33, y: 10 },
    ],
  },

  {
    titre: 'Duels croises entre gardiens',
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
      'Travailler la lecture du tir et la relance, en autonomie complete, sans mobiliser de joueur de champ.',
    fonctionnement:
      "Les deux gardiens occupent chacun un but et se tirent dessus a tour de role depuis la ligne des 9 metres.\n" +
      'Le gardien qui vient d arreter relance immediatement en course vers l autre but, ce qui enchaine arret et premiere passe.\n' +
      'Match en 10 points : un but marque vaut un point, un arret suivi d une relance precise vaut un point.',
    pointsCles:
      "Se placer avant l'armé du tireur, pas pendant.\n" +
      "Ne pas anticiper systematiquement : lire l'epaule et la hanche du tireur.\n" +
      'La relance part des la recuperation du ballon, sans temps mort.',
    evolution:
      "Complexifier : interdire de tirer deux fois de suite au meme endroit.\n" +
      "Avec un seul gardien : l'entraineur remplace le second poste.",
    jetons: [
      GARDIEN_GAUCHE,
      GARDIEN_DROITE,
      { type: 'ballon', x: 31, y: 10 },
      { type: 'ballon', x: 9, y: 10 },
    ],
  },

  {
    titre: 'Gardien face aux tirs a 9 metres',
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
      "Installer le placement sur l'angle et la lecture des tirs longs, en situation reelle de tir en suspension.",
    fonctionnement:
      "Trois postes de tir : arriere gauche, demi-centre, arriere droit. Les tireurs alternent, un ballon toutes les cinq secondes.\n" +
      'Serie 1 : tirs annonces, le gardien travaille son placement. Serie 2 : tirs libres. Serie 3 : avec un defenseur qui ferme un cote, obligeant le gardien a couvrir l autre.\n' +
      "Trois series de 12 ballons, avec une pause entre chaque.",
    pointsCles:
      "Le gardien avance d'un pas sur l'angle a chaque changement de poste de tir.\n" +
      'Sur un tir avec defenseur, le gardien couvre le cote laisse libre par la defense : le placement se decide a deux.\n' +
      'Rester grand : les bras montent avant le tir, pas apres.',
    evolution:
      "Simplifier : sans defenseur, tirs a cadence lente.\n" +
      'Complexifier : ajouter un rebond au sol impose sur un tir sur trois.',
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
      "Alternance de tirs venant de l'aile gauche et de l'aile droite. Le gardien sort a la rencontre du tireur pour fermer le premier poteau, sans se coucher trop tot.\n" +
      'Deuxieme partie : un contre un depuis 9 metres, le gardien doit tenir jusqu au dernier moment.\n' +
      '10 ballons par aile, puis 10 duels.',
    pointsCles:
      "Sortir en ligne droite vers le ballon, pas en arc : chaque metre gagne ferme l'angle.\n" +
      'Le premier poteau se protege en priorite, le gardien ne le laisse jamais ouvert.\n' +
      'Sur le duel, rester debout : se coucher tot donne la lucarne au tireur.',
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
    titre: 'Jets de 7 metres',
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
      'Travailler la prise de decision sur le penalty et installer une routine avant le tir.',
    fonctionnement:
      "Chaque joueur tire trois jets de 7 metres. Le gardien annonce a l'entraineur, avant chaque tir, le cote qu'il a choisi de proteger.\n" +
      'On comptabilise arrets et buts pour identifier les tendances de chaque tireur.\n' +
      'Deuxieme tour : les tireurs connaissent leurs statistiques et doivent varier.',
    pointsCles:
      "Prendre une information sur la course d'elan et l'appui d'impulsion du tireur.\n" +
      "Ne pas partir avant l'armé : un gardien immobile arrete plus qu'un gardien lance trop tot.\n" +
      "Assumer un choix : l'indecision couvre les deux cotes a moitie.",
    evolution:
      "Complexifier : le tireur a le droit a une feinte.\n" +
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
    titre: 'Relance et premiere passe de contre-attaque',
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
      'Faire du gardien le premier relanceur : voir avant de recevoir, et transmettre juste sur 20 a 30 metres.',
    fonctionnement:
      "Le gardien arrete ou recupere un ballon, puis relance immediatement sur un ailier parti en course.\n" +
      "Trois cibles possibles : ailier gauche, ailier droit, ou joueur au centre en appui. L'entraineur designe la cible au dernier moment, apres l'arret.\n" +
      '15 relances par gardien, en alternant les cibles.',
    pointsCles:
      "Prendre l'information sur le terrain pendant que le ballon arrive, pas apres l'avoir bloque.\n" +
      'Relance tendue devant le joueur, jamais dans son dos ni en cloche.\n' +
      "Se replacer immediatement apres la relance : le ballon peut revenir.",
    evolution:
      "Simplifier : cible annoncee a l'avance.\n" +
      "Complexifier : ajouter un defenseur sur la ligne de passe de la cible principale.",
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
    titre: 'Gardien face au pivot et aux ballons a rebond',
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
      "Traiter les tirs les plus proches : sortir vite sur le pivot pour reduire l'angle, et rester sur ses appuis sur les ballons a rebond.",
    fonctionnement:
      "Deux passeurs a 9 metres servent un pivot qui recoit dos au but, se retourne et tire immediatement a 6 metres.\n" +
      "Une serie sur deux, le pivot a consigne de tirer a rebond, devant la ligne de surface.\n" +
      "Le gardien alterne : sortie franche a un metre de la ligne sur le tir direct, position basse et jambes fermees sur le ballon a rebond.\n" +
      "12 tirs par gardien et par serie, en variant le cote de la remise.",
    pointsCles:
      "Sur le pivot, la sortie doit etre finie avant le tir : un gardien qui avance encore au moment du tir n'a plus de base.\n" +
      "Sur le rebond, ne pas plonger : les jambes se ferment et le corps reste haut, sinon le ballon passe dessous.\n" +
      "Lire l'epaule du pivot des sa rotation : elle indique le cote avant le bras.",
    evolution:
      "Simplifier : le pivot annonce a l'avance direct ou rebond.\n" +
      "Complexifier : ajouter un defenseur dans le dos du pivot, ce qui masque le depart du tir.",
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
      "Decider a partir d'indices, pas au hasard : position des appuis, hauteur du coude, orientation des hanches du tireur.",
    fonctionnement:
      "Les tireurs se succedent depuis les trois postes arriere, sans consigne de zone imposee.\n" +
      "Le gardien annonce a voix haute, juste apres chaque tir, l'indice sur lequel il a decide : appui, epaule, coude ou hanche.\n" +
      "L'entraineur note les tirs ou l'indice etait juste, meme si le ballon est entre : c'est la lecture qui est evaluee, pas le resultat.\n" +
      "Trois series de 10 tirs, avec un point d'etape entre chaque serie.",
    pointsCles:
      "Un gardien qui devine part avant le tir ; un gardien qui lit part avec le tir. La difference se voit sur le premier appui.\n" +
      "L'appui d'impulsion du tireur donne le cote bien avant le bras.\n" +
      "Verbaliser l'indice apres coup fixe l'apprentissage : sans cela, le gardien reproduit ses reflexes sans les corriger.",
    evolution:
      "Simplifier : les tireurs ne visent que deux zones, annoncees a l'avance au gardien.\n" +
      "Complexifier : ajouter un defenseur qui masque partiellement, obligeant a lire uniquement les appuis.",
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
    titre: 'Gardien : sortie et duel face au joueur lance',
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
      "Traiter la contre-attaque : choisir entre rester sur la ligne et sortir a la rencontre du joueur lance, puis tenir le duel sans reculer.",
    fonctionnement:
      "Un joueur part de mi-terrain en dribble, seul face au gardien, avec un angle different a chaque passage : central, cote aile gauche, cote aile droite.\n" +
      "Le gardien avance a la rencontre du joueur des que celui-ci franchit les 12 metres, puis se stabilise avant le tir.\n" +
      "Sur un passage sur trois, un deuxieme attaquant suit en soutien : le gardien doit alors couvrir le tir sans se jeter, pour ne pas offrir la passe.\n" +
      "10 duels par gardien.",
    pointsCles:
      "Sortir tot et s'arreter, plutot que sortir tard en courant : un gardien en mouvement est un gardien battu.\n" +
      "Rester grand, bras ecartes, le plus longtemps possible : c'est la surface qui gene, pas le plongeon.\n" +
      "Face a deux attaquants, jouer le porteur et laisser la passe : c'est la solution la plus lente pour eux.",
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
    titre: 'Gardiens seuls : reactivite et coordination oeil-main',
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
      "Accelerer le temps de reaction et la dissociation des deux mains, pendant que le groupe travaille un exercice sans but.",
    fonctionnement:
      "Les deux gardiens travaillent a l'ecart, en alternant les roles toutes les 45 secondes.\n" +
      "1. Le partenaire tient une balle de tennis dans chaque main, bras ecartes, et en lache une sans prevenir : le gardien la rattrape avant le deuxieme rebond.\n" +
      "2. Le partenaire montre une balle a droite ou a gauche, a hauteur d'epaule : le gardien touche la balle de la main et du pied du meme cote, simultanement.\n" +
      "3. Renvois au mur a une main, alternance droite - gauche, 30 secondes par main.\n" +
      "Trois tours complets. Effort court et intense, recuperation reelle entre les tours.",
    pointsCles:
      "Main et pied partent ensemble : c'est cette coordination qui fait l'arret du bas, pas la vitesse du bras seul.\n" +
      "Le regard reste fixe devant, ce sont les mains qui vont chercher, pas la tete qui suit.\n" +
      "Series courtes : des que le temps de reaction se degrade, l'atelier ne sert plus a rien.",
    evolution:
      "Sans balles de tennis : un ballon montre a droite ou a gauche produit le meme travail, en moins exigeant.\n" +
      "Avec un seul gardien : l'entraineur ou un joueur blesse peut tenir le role du partenaire.",
    jetons: [
      { type: 'gardien', etiquette: 'GB1', x: 31, y: 13 },
      { type: 'gardien', etiquette: 'GB2', x: 33, y: 13 },
      { type: 'ballon', x: 32.5, y: 11.8 },
    ],
  },

  {
    titre: 'Gardiens seuls : appuis, hanches et prevention epaule',
    ref: 'gardiens-seuls-appuis-hanches-et-prevention-epaule',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['2 elastiques', '4 plots', '2 ballons'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      "Entretenir ce que le poste sollicite le plus - amplitude de hanche, gainage lateral, stabilite d'epaule - pendant que le groupe travaille sans but.",
    fonctionnement:
      "Circuit de quatre ateliers, 45 secondes chacun, deux tours, les deux gardiens en meme temps.\n" +
      "1. Ecarts lateraux controles sur une jambe, retour en position de garde, 8 par cote.\n" +
      "2. Deplacements en pas chasses entre quatre plots, sans croiser les appuis.\n" +
      "3. Rotations externes d'epaule a l'elastique, coude au corps, 2 x 12 par bras.\n" +
      "4. Gainage lateral avec bras tendu vers le plafond, 30 secondes par cote.\n" +
      "A placer en debut de seance ou juste apres l'echauffement, jamais apres une longue serie de tirs.",
    pointsCles:
      "Amplitude d'abord, vitesse ensuite : un ecart mal controle fatigue l'adducteur sans rien gagner.\n" +
      "Les appuis ne se croisent jamais en pas chasses, sinon le gardien est en retard sur le tir suivant.\n" +
      "L'elastique doit rester leger : l'objectif est la stabilite de l'epaule, pas la force du bras.",
    evolution:
      "Sans elastique : rotations avec un ballon tenu a bout de bras, plus court.\n" +
      "Complexifier : enchainer chaque atelier avec deux arrets reels servis par le partenaire.",
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
