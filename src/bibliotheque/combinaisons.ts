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
    titre: 'Espagnole - croise central',
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
      "Liberer un tir de 9 metres en supprimant le defenseur direct du tireur : le demi-centre pose l'ecran lui-meme, au lieu de le demander au pivot.",
    fonctionnement:
      "Attaque placee face a une defense 6-0, puis 5-1. La combinaison est aussi appelee « Est-Allemande » selon les clubs.\n" +
      "Le demi-centre engage vers le bloc et vient bloquer le defenseur du couloir de l'arriere gauche. Il garde le ballon jusqu'au dernier moment.\n" +
      "L'ailier gauche rentre et croise dans le dos du demi-centre : c'est lui qui recoit.\n" +
      "L'arriere gauche part sur une course PARALLELE a celle de l'ailier, un temps derriere. Il recoit de l'ailier et tire en suspension par-dessus l'ecran.\n" +
      '6 repetitions par cote, puis on inverse.\n' +
      'Schema tactique du repertoire classique, recense notamment sur dragoerhb.dk.',
    pointsCles:
      "L'ecran se pose avant l'arrivee du tireur, et immobile au moment du contact : en mouvement, c'est une faute d'attaque.\n" +
      "Les deux courses sont paralleles, jamais convergentes : deux joueurs sur la meme ligne n'occupent qu'un defenseur.\n" +
      "L'ailier ne court pas a plat : s'il longe la ligne des 9 metres, il n'inquiete personne et la passe devient laterale.\n" +
      'Le tir part en suspension : un tir en appui derriere un ecran est contre.',
    evolution:
      "Simplifier : defense passive, sans changement d'adversaire. Le demi-centre annonce l'ecran a voix haute.\n" +
      "Variante A : le demi-centre passe directement a l'arriere gauche et saute l'ailier. Le rythme est plus rapide, mais le decalage plus petit.\n" +
      "Variante B : l'ailier garde le ballon et tire lui-meme au premier temps, quand le defenseur exterieur a suivi l'arriere.\n" +
      'Complexifier : defense 5-1, avec un pointe qui gene la premiere passe.',
    consigneInitiale: 'Attaque placee face a une 6-0. Ballon au demi-centre.',
    etapes: [
      {
        titre: 'Engagement et ecran du demi-centre',
        consigne: 'Le demi-centre entre dans le bloc et bloque le defenseur 5, epaule contre epaule.',
        mouvements: [{ jeton: 'dc', type: 'ecran', vers: { x: 32.2, y: 12.2 } }],
      },
      {
        titre: 'Deux courses paralleles',
        consigne:
          "L'ailier croise dans le dos du demi-centre et recoit ; l'arriere part sur la meme ligne, un temps derriere.",
        mouvements: [
          { jeton: 'alg', type: 'course', vers: { x: 31.2, y: 15.2 } },
          { jeton: 'arg', type: 'course', vers: { x: 30.0, y: 12.8 } },
          { jeton: 'dc', type: 'passe', cible: 'alg' },
        ],
      },
      {
        titre: 'La balle revient a l arriere',
        consigne: "L'ailier fixe, puis rend a l'arriere qui arrive lance derriere lui.",
        mouvements: [{ jeton: 'alg', type: 'passe', cible: 'arg' }],
      },
      {
        titre: 'Tir par-dessus l ecran',
        consigne: 'Tir en suspension a 9 metres, dans le couloir libere.',
        mouvements: [{ jeton: 'arg', type: 'tir', vers: { x: 40, y: 11 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 29.4, y: 9.4 }],
  },

  {
    titre: 'Double croise - arrieres et demi-centre',
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
      'Faire glisser le bloc deux fois de suite dans le meme sens, puis attaquer a contresens le couloir central libere par l ecran.',
    fonctionnement:
      "Attaque placee face a une defense 6-0. La circulation part de l'aile gauche et revient au demi-centre.\n" +
      "Le demi-centre entre dans la defense, bloque le defenseur central, et passe a l'arriere gauche qui croise dans son dos.\n" +
      "L'arriere droit croise a son tour derriere l'arriere gauche, recoit, et tire dans le couloir libere.\n" +
      "Le deuxieme croise est le vrai : le premier ne sert qu'a mettre le bloc en mouvement.\n" +
      '8 repetitions, puis on part de l aile droite.\n' +
      'Schema tactique du repertoire classique, recense notamment sur dragoerhb.dk.',
    pointsCles:
      "Le premier croise doit etre credible : si l'arriere gauche ne menace pas le but, le bloc ne glisse pas et le second croise ne trouve rien.\n" +
      "Le deuxieme croiseur passe DERRIERE le premier, jamais devant : devant, il lui prend son espace au lieu d'en creer.\n" +
      "La passe se donne dans le sens de la course, a hauteur de hanche.\n" +
      "L'ecran du demi-centre tient jusqu'au tir : relache trop tot, le defenseur central revient contrer.",
    evolution:
      "Simplifier : un seul croise, pour installer la mecanique du passage dans le dos.\n" +
      "Variante : l'arriere gauche tire lui-meme au lieu de passer, quand le bloc a trop glisse.\n" +
      "Variante : si le defenseur central monte, l'arriere droit sert le pivot dans son dos plutot que de tirer.\n" +
      'Complexifier : defense autorisee a changer d adversaire sur les croises.',
    consigneInitiale: "Attaque placee face a une 6-0. Ballon a l'ailier gauche.",
    etapes: [
      {
        titre: 'La balle revient au centre',
        consigne: "L'ailier gauche rend au demi-centre pour lancer la combinaison.",
        mouvements: [{ jeton: 'alg', type: 'passe', cible: 'dc' }],
      },
      {
        titre: 'Entree et ecran du demi-centre',
        consigne: 'Le demi-centre entre dans le bloc et bloque le defenseur central 3.',
        mouvements: [{ jeton: 'dc', type: 'ecran', vers: { x: 32.6, y: 8.6 } }],
      },
      {
        titre: 'Premier croise',
        consigne: "L'arriere gauche passe dans le dos du demi-centre et recoit.",
        mouvements: [
          { jeton: 'arg', type: 'course', vers: { x: 30.6, y: 10.9 } },
          { jeton: 'dc', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Deuxieme croise',
        consigne: "L'arriere droit croise derriere l'arriere gauche et recoit a son tour.",
        mouvements: [
          { jeton: 'ard', type: 'course', vers: { x: 29.8, y: 8.8 } },
          { jeton: 'arg', type: 'passe', cible: 'ard' },
        ],
      },
      {
        titre: 'Tir dans le couloir central',
        consigne: 'Tir a 9 metres dans le couloir libere par l ecran.',
        mouvements: [{ jeton: 'ard', type: 'tir', vers: { x: 40, y: 8.8 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 35.6, y: 17.4 }],
  },

  {
    titre: 'Pondus - renversement et entree d ailier',
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
      "Fixer la defense d'un cote par un croise et un renversement, puis conclure de l'autre cote par une entree d'ailier sur un bloc de pivot.",
    fonctionnement:
      "Attaque placee face a une defense 6-0. La combinaison est longue : elle vaut pour un temps fort, pas pour une possession pressee.\n" +
      "Le demi-centre sert l'arriere droit, qui s'engage vers le centre et croise avec l'arriere gauche.\n" +
      "L'arriere gauche donne a l'ailier droit et continue sa course jusqu'a l'aile opposee : les postes tournent.\n" +
      "L'ailier droit rend aussitot au demi-centre, qui part fixer du cote gauche pour emmener le bloc avec lui.\n" +
      "Le pivot bloque le defenseur 2. L'ailier droit s'engage dans l'intervalle libere, recoit du demi-centre et tire.\n" +
      'La combinaison se joue des deux cotes. 6 passages par cote.\n' +
      'Schema tactique du repertoire classique, recense notamment sur dragoerhb.dk.',
    pointsCles:
      "La fixation du demi-centre a gauche est le coeur de la combinaison : sans elle, le bloc n'a aucune raison de glisser et l'intervalle n'existe pas.\n" +
      "L'arriere gauche va vraiment jusqu'a l'aile : une course a mi-chemin laisse deux joueurs dans le meme couloir.\n" +
      "L'ailier entre au moment ou le bloc a fini de glisser, pas avant : trop tot, il arrive dans un defenseur.\n" +
      'La derniere passe traverse le terrain : elle se donne tendue, sinon le bloc a le temps de revenir.',
    evolution:
      "Simplifier : supprimer le renversement. On garde le croise arriere droit / arriere gauche, puis l'entree directe de l'ailier.\n" +
      "Variante : si le defenseur 2 ne suit pas le bloc, le pivot se retourne et recoit lui-meme a 6 metres.\n" +
      "Variante : l'arriere gauche tire directement apres le croise, si le bloc s'est ouvert au premier temps.\n" +
      'Complexifier : defense 5-1, dont la pointe gene le retour au demi-centre.',
    consigneInitiale: 'Attaque placee face a une 6-0. Ballon au demi-centre.',
    etapes: [
      {
        titre: "Engagement de l'arriere droit",
        consigne: "L'arriere droit recoit en s'engageant vers le centre.",
        mouvements: [
          { jeton: 'ard', type: 'course', vers: { x: 30.9, y: 7.6 } },
          { jeton: 'dc', type: 'passe', cible: 'ard' },
        ],
      },
      {
        titre: 'Croise entre les arrieres',
        consigne:
          "Le demi-centre s'ecarte, l'arriere gauche croise dans le dos de l'arriere droit et recoit.",
        mouvements: [
          { jeton: 'dc', type: 'course', vers: { x: 29.4, y: 11.6 } },
          { jeton: 'arg', type: 'course', vers: { x: 30.3, y: 9.4 } },
          { jeton: 'ard', type: 'passe', cible: 'arg' },
        ],
      },
      {
        titre: 'Renversement a l aile',
        consigne: "L'arriere gauche renverse vers l'ailier droit.",
        mouvements: [{ jeton: 'arg', type: 'passe', cible: 'ald' }],
      },
      {
        titre: 'Changement d aile et fixation',
        consigne:
          "L'arriere gauche poursuit jusqu'a l'aile opposee ; l'ailier rend au demi-centre, qui part fixer a gauche.",
        mouvements: [
          { jeton: 'arg', type: 'course', vers: { x: 34.2, y: 3.0 } },
          { jeton: 'dc', type: 'course', vers: { x: 30.3, y: 12.6 } },
          { jeton: 'ald', type: 'passe', cible: 'dc' },
        ],
      },
      {
        titre: "Bloc du pivot et entree de l'ailier",
        consigne: "Le pivot bloque le defenseur 2 ; l'ailier s'engage dans l'intervalle et recoit.",
        mouvements: [
          { jeton: 'piv', type: 'ecran', vers: { x: 33.5, y: 7.2 } },
          { jeton: 'ald', type: 'course', vers: { x: 32.6, y: 5.6 } },
          { jeton: 'dc', type: 'passe', cible: 'ald' },
        ],
      },
      {
        titre: 'Tir dans l intervalle',
        consigne: "Tir a 6 metres dans l'intervalle libere par le bloc.",
        mouvements: [{ jeton: 'ald', type: 'tir', vers: { x: 40, y: 8.8 } }],
      },
    ],
    jetons: [GARDIEN_DROITE, ...ATTAQUE_PLACEE, ...DEFENSE_6_0, { type: 'ballon', x: 29.4, y: 9.4 }],
  },
]
