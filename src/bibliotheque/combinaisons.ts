/**
 * Combinaisons nommees du repertoire classique.
 *
 * Pourquoi un fichier a part : ces fiches ne decrivent pas un exercice a
 * repeter, mais un ENCHAINEMENT porteur d'un nom que les joueurs apprennent.
 * « On joue l'Espagnole » doit se retrouver dans la bibliotheque comme on le
 * dit sur le terrain, sans avoir a deviner sous quel intitule descriptif elle
 * a ete rangee. La puce « Combinaisons » de la bibliotheque les regroupe.
 *
 * Deux regles de redaction, tenues pour tout le repertoire.
 *
 * Le nom d'abord, la description ensuite : « Espagnole - croise central ». La
 * recherche de la bibliotheque trouve alors le nom parle, et la suite du titre
 * dit de quoi il s'agit a celui qui ne le connait pas.
 *
 * Les variantes ne font PAS des fiches separees. Une combinaison en a souvent
 * trois ou quatre ; en faire autant de fiches noierait la bibliotheque et
 * disperserait les compteurs d'utilisation. Elles vont dans « Evolution »,
 * champ prevu exactement pour cela.
 *
 * Le schema tactique lui-meme - qui court ou, qui passe a qui - est un fait de
 * handball, pas une oeuvre. Les positions, les etapes et les textes de ces
 * fiches sont ecrits ici ; rien n'est repris d'ailleurs.
 *
 * UNE CONTRAINTE DU MOTEUR, a connaitre avant d'ecrire la suivante : un
 * passeur ne doit pas se deplacer dans le meme temps que sa passe. Le ballon
 * suit alors le porteur au lieu d'aller au receveur, et l'enchainement se
 * casse sans bruit. Sa course va au temps suivant.
 */

import {
  ATTAQUE_PLACEE,
  DEFENSE_6_0,
  GARDIEN_DROITE,
  type ModeleExercice,
} from './modeles'

export const COMBINAISONS: ModeleExercice[] = [
  {
    titre: 'Espagnole - croisé central',
    ref: 'espagnole-croise-central',
    combinaison: true,
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Libérer un tir de 9 mètres en supprimant le défenseur direct du tireur : le demi-centre pose l'écran lui-même, au lieu de le demander au pivot.",
    fonctionnement:
      "Attaque placée face à une défense 6-0, puis 5-1. La combinaison est aussi appelée « Est-Allemande » selon les clubs.\n" +
      "Le demi-centre engage vers le bloc et vient bloquer le défenseur du couloir de l'arrière gauche. Il garde le ballon jusqu'au dernier moment.\n" +
      "L'ailier gauche rentre et croise dans le dos du demi-centre : c'est lui qui reçoit.\n" +
      "L'arrière gauche part sur une course PARALLÈLE à celle de l'ailier, un temps derrière. Il reçoit de l'ailier et tire en suspension par-dessus l'écran.\n" +
      '6 répétitions par côté, puis on inverse.\n' +
      'Schéma tactique du répertoire classique, recensé notamment sur dragoerhb.dk.',
    pointsCles:
      "L'écran se pose avant l'arrivée du tireur, et immobile au moment du contact : en mouvement, c'est une faute d'attaque.\n" +
      "Les deux courses sont parallèles, jamais convergentes : deux joueurs sur la même ligne n'occupent qu'un défenseur.\n" +
      "L'ailier ne court pas à plat : s'il longe la ligne des 9 mètres, il n'inquiète personne et la passe devient latérale.\n" +
      'Le tir part en suspension : un tir en appui derrière un écran est contré.',
    evolution:
      "Simplifier : défense passive, sans changement d'adversaire. Le demi-centre annonce l'écran à voix haute.\n" +
      "Variante A : le demi-centre passe directement à l'arrière gauche et saute l'ailier. Le rythme est plus rapide, mais le décalage plus petit.\n" +
      "Variante B : l'ailier garde le ballon et tire lui-même au premier temps, quand le défenseur extérieur a suivi l'arrière.\n" +
      'Complexifier : défense 5-1, avec un pointe qui gêne la première passe.',
    consigneInitiale: 'Attaque placée face à une 6-0. Ballon au demi-centre.',
    etapes: [
      {
        titre: 'Engagement et écran du demi-centre',
        consigne: 'Le demi-centre entre dans le bloc et bloque le défenseur 5, épaule contre épaule.',
        mouvements: [{ jeton: 'dc', type: 'ecran', vers: { x: 32.2, y: 12.2 } }],
      },
      {
        titre: 'Deux courses parallèles',
        consigne:
          "L'ailier croise dans le dos du demi-centre et reçoit ; l'arrière part sur la même ligne, un temps derrière.",
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 31.2, y: 15.2 } },
          { jeton: 'arg', type: 'course', vers: { x: 30.0, y: 12.8 } },
          { jeton: 'dc', type: 'passe', cible: 'alg' },
        ],
      },
      {
        titre: 'La balle revient à l arrière',
        consigne: "L'ailier fixe, puis rend à l'arrière qui arrive lancé derrière lui.",
        mouvements: [{ jeton: 'alg', type: 'passe', cible: 'arg' }],
      },
      {
        titre: 'Tir par-dessus l écran',
        consigne: 'Tir en suspension à 9 mètres, dans le couloir libéré.',
        mouvements: [{ jeton: 'arg', type: 'tir', vers: { x: 40, y: 11 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 29.4, y: 9.4 }],
  },

  {
    titre: 'Double croisé - arrières et demi-centre',
    ref: 'double-croise-arrieres-et-demi-centre',
    combinaison: true,
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      'Faire glisser le bloc deux fois de suite dans le même sens, puis attaquer à contresens le couloir central libéré par l écran.',
    fonctionnement:
      "Attaque placée face à une défense 6-0. La circulation part de l'aile gauche et revient au demi-centre.\n" +
      "Le demi-centre entre dans la défense, bloque le défenseur central, et passe à l'arrière gauche qui croise dans son dos.\n" +
      "L'arrière droit croise à son tour derrière l'arrière gauche, reçoit, et tire dans le couloir libéré.\n" +
      "Le deuxième croisé est le vrai : le premier ne sert qu'à mettre le bloc en mouvement.\n" +
      '8 répétitions, puis on part de l aile droite.\n' +
      'Schéma tactique du répertoire classique, recensé notamment sur dragoerhb.dk.',
    pointsCles:
      "Le premier croisé doit être crédible : si l'arrière gauche ne menace pas le but, le bloc ne glisse pas et le second croisé ne trouve rien.\n" +
      "Le deuxième croiseur passe DERRIÈRE le premier, jamais devant : devant, il lui prend son espace au lieu d'en créer.\n" +
      "La passe se donne dans le sens de la course, à hauteur de hanche.\n" +
      "L'écran du demi-centre tient jusqu'au tir : relâché trop tôt, le défenseur central revient contrer.",
    evolution:
      "Simplifier : un seul croisé, pour installer la mécanique du passage dans le dos.\n" +
      "Variante : l'arrière gauche tire lui-même au lieu de passer, quand le bloc a trop glissé.\n" +
      "Variante : si le défenseur central monte, l'arrière droit sert le pivot dans son dos plutôt que de tirer.\n" +
      'Complexifier : défense autorisée à changer d adversaire sur les croisés.',
    consigneInitiale: "Attaque placée face à une 6-0. Ballon à l'ailier gauche.",
    etapes: [
      {
        titre: 'La balle revient au centre',
        consigne: "L'ailier gauche rend au demi-centre pour lancer la combinaison.",
        mouvements: [{ jeton: 'alg', type: 'passe', cible: 'dc' }],
      },
      {
        titre: 'Entrée et écran du demi-centre',
        consigne: 'Le demi-centre entre dans le bloc et bloque le défenseur central 3.',
        mouvements: [{ jeton: 'dc', type: 'ecran', vers: { x: 32.6, y: 8.6 } }],
      },
      {
        titre: 'Premier croisé',
        consigne: "L'arrière gauche passe dans le dos du demi-centre et reçoit.",
        mouvements: [
          { jeton: 'arg', type: 'course', vers: { x: 30.6, y: 10.9 } },
          { jeton: 'dc', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Deuxième croisé',
        consigne: "L'arrière droit croise derrière l'arrière gauche et reçoit à son tour.",
        mouvements: [
          { jeton: 'ard', type: 'course', vers: { x: 29.8, y: 8.8 } },
          { jeton: 'arg', type: 'passe', cible: 'ard' },
        ],
      },
      {
        titre: 'Tir dans le couloir central',
        consigne: 'Tir à 9 mètres dans le couloir libéré par l écran.',
        mouvements: [{ jeton: 'ard', type: 'tir', vers: { x: 40, y: 8.8 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 35.6, y: 17.4 }],
  },

  {
    titre: 'Pondus - renversement et entrée d ailier',
    ref: 'pondus-renversement-et-entree-d-ailier',
    combinaison: true,
    categorie: 'attaque',
    duree: 20,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['4 ballons', 'chasubles'],
    formatGardiens: 'avec-joueurs',
    vue: 'demi',
    objectifs:
      "Fixer la défense d'un côté par un croisé et un renversement, puis conclure de l'autre côté par une entrée d'ailier sur un bloc de pivot.",
    fonctionnement:
      "Attaque placée face à une défense 6-0. La combinaison est longue : elle vaut pour un temps fort, pas pour une possession pressée.\n" +
      "Le demi-centre sert l'arrière droit, qui s'engage vers le centre et croise avec l'arrière gauche.\n" +
      "L'arrière gauche donne à l'ailier droit et continue sa course jusqu'à l'aile opposée : les postes tournent.\n" +
      "L'ailier droit rend aussitôt au demi-centre, qui part fixer du côté gauche pour emmener le bloc avec lui.\n" +
      "Le pivot bloque le défenseur 2. L'ailier droit s'engage dans l'intervalle libéré, reçoit du demi-centre et tire.\n" +
      'La combinaison se joue des deux côtés. 6 passages par côté.\n' +
      'Schéma tactique du répertoire classique, recensé notamment sur dragoerhb.dk.',
    pointsCles:
      "La fixation du demi-centre à gauche est le coeur de la combinaison : sans elle, le bloc n'a aucune raison de glisser et l'intervalle n'existe pas.\n" +
      "L'arrière gauche va vraiment jusqu'à l'aile : une course à mi-chemin laisse deux joueurs dans le même couloir.\n" +
      "L'ailier entre au moment où le bloc a fini de glisser, pas avant : trop tôt, il arrive dans un défenseur.\n" +
      'La dernière passe traverse le terrain : elle se donne tendue, sinon le bloc a le temps de revenir.',
    evolution:
      "Simplifier : supprimer le renversement. On garde le croisé arrière droit / arrière gauche, puis l'entrée directe de l'ailier.\n" +
      "Variante : si le défenseur 2 ne suit pas le bloc, le pivot se retourne et reçoit lui-même à 6 mètres.\n" +
      "Variante : l'arrière gauche tire directement après le croisé, si le bloc s'est ouvert au premier temps.\n" +
      'Complexifier : défense 5-1, dont la pointe gêne le retour au demi-centre.',
    consigneInitiale: 'Attaque placée face à une 6-0. Ballon au demi-centre.',
    etapes: [
      {
        titre: "Engagement de l'arrière droit",
        consigne: "L'arrière droit reçoit en s'engageant vers le centre.",
        mouvements: [
          { jeton: 'ard', type: 'course', vers: { x: 30.9, y: 7.6 } },
          { jeton: 'dc', type: 'passe', cible: 'ard' },
        ],
      },
      {
        titre: 'Croisé entre les arrières',
        consigne:
          "Le demi-centre s'écarte, l'arrière gauche croise dans le dos de l'arrière droit et reçoit.",
        mouvements: [
          { jeton: 'dc', type: 'course', vers: { x: 29.4, y: 11.6 } },
          { jeton: 'arg', type: 'course', vers: { x: 30.3, y: 9.4 } },
          { jeton: 'ard', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Renversement à l aile',
        consigne: "L'arrière gauche renverse vers l'ailier droit.",
        mouvements: [{ jeton: 'arg', type: 'passe', cible: 'ald' }],
      },
      {
        titre: 'Changement d aile et fixation',
        consigne:
          "L'arrière gauche poursuit jusqu'à l'aile opposée ; l'ailier rend au demi-centre, qui part fixer à gauche.",
        mouvements: [
          { jeton: 'arg', type: 'course', vers: { x: 34.2, y: 3.0 } },
          { jeton: 'dc', type: 'course', vers: { x: 30.3, y: 12.6 } },
          { jeton: 'ald', type: 'passe', cible: 'dc' },
        ],
      },
      {
        titre: "Bloc du pivot et entrée de l'ailier",
        consigne: "Le pivot bloque le défenseur 2 ; l'ailier s'engage dans l'intervalle et reçoit.",
        mouvements: [
          { jeton: 'piv', type: 'ecran', vers: { x: 33.5, y: 7.2 } },
          { jeton: 'ald', type: 'course', vers: { x: 32.6, y: 5.6 } },
          { jeton: 'dc', type: 'passe', cible: 'ald' },
        ],
      },
      {
        titre: 'Tir dans l intervalle',
        consigne: "Tir à 6 mètres dans l'intervalle libéré par le bloc.",
        mouvements: [{ jeton: 'ald', type: 'tir', vers: { x: 40, y: 8.8 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 29.4, y: 9.4 }],
  },
]
