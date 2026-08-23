/**
 * Exercices utiles au handball dans lesquels le ballon ne sert a rien.
 *
 * Echauffement, renforcement, prevention, evaluation, reflexes du gardien :
 * tout ce qui se travaille en salle, dans un couloir, sur un demi-terrain
 * occupe par un autre groupe, ou le jour ou le materiel manque.
 *
 * Aucune de ces fiches ne declare d'etapes : elles decrivent une organisation
 * ou une repetition, pas un enchainement a animer. Le schema n'y sert qu'a
 * poser le materiel et les postes de travail.
 *
 * Les charges et les durees valent pour un groupe seniors. Les protocoles de
 * prevention (excentrique, proprioception, epaule) ne produisent d'effet qu'en
 * repetition hebdomadaire : une seance isolee ne protege personne.
 */

import { GARDIEN_DROITE, type ModeleExercice } from './modeles'

export const SANS_BALLON: ModeleExercice[] = [
  // ------------------------------------------------------- Echauffement

  {
    titre: 'Protocole d echauffement en quatre temps',
    ref: 'protocole-d-echauffement-en-quatre-temps',
    categorie: 'echauffement',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['8 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Disposer d'une routine identique a chaque seance, tenable sans materiel et sans ballon, qui amene le groupe pret a jouer et non simplement essouffle.",
    fonctionnement:
      "Quatre temps qui s'enchainent sans pause, du general vers le specifique.\n" +
      '1. Monter en temperature (4 min) : course souple sur tout le terrain, en variant les appuis - talons-fesses, montees de genoux, pas chasses, course arriere.\n' +
      '2. Mobiliser (4 min) : cercles de bras, rotations du tronc, fentes avec rotation, balancements de jambe, ouverture de hanche. En mouvement, jamais assis.\n' +
      '3. Activer (4 min) : gainage court, fentes sautees, appuis rapides entre deux plots, deux series de chaque.\n' +
      '4. Lancer la machine (3 min) : trois accelerations progressives sur 20 metres, puis deux departs vifs sur signal.\n' +
      "L'ordre compte : etirer a froid ou sprinter avant d'avoir chauffe sont les deux erreurs classiques.",
    pointsCles:
      "Aucun etirement tenu avant le temps 4 : maintenir un muscle froid en position longue le rend moins disponible, pas plus souple.\n" +
      "L'intensite monte par paliers. Si le groupe parle normalement au temps 3, c'est trop lent.\n" +
      "Meme routine a chaque seance : les joueurs doivent pouvoir la mener seuls quand l'entraineur est retenu.",
    evolution:
      "Par temps froid ou en exterieur : allonger le temps 1 de deux minutes et raccourcir le temps 2.\n" +
      'Avant un match : ajouter deux departs sur signal, et terminer par des appuis a haute frequence.',
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 10, y: 16 },
      { type: 'plot', x: 20, y: 16 },
      { type: 'plot', x: 30, y: 16 },
      { type: 'plot', x: 10, y: 4 },
      { type: 'plot', x: 20, y: 4 },
      { type: 'plot', x: 30, y: 4 },
    ],
  },

  {
    titre: 'Reveil neuromusculaire : appuis et changements de direction',
    ref: 'reveil-neuromusculaire-appuis-et-changements-de-dire',
    categorie: 'echauffement',
    duree: 10,
    nombreJoueurs: 12,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['1 echelle de rythme', '8 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Reveiller la coordination et la vitesse de pose d'appui avant le travail avec ballon, et preparer les chevilles aux changements de direction du jeu.",
    fonctionnement:
      "Deux ateliers en parallele, deux colonnes chacun, rotation toutes les 90 secondes.\n" +
      "Atelier 1 - echelle de rythme : un appui par case, puis deux appuis par case, puis pas chasses lateraux, puis entrees-sorties. Retour au trot par l'exterieur.\n" +
      'Atelier 2 - carre de plots de 5 metres : course avant, pas chasses, course arriere, sprint sur la diagonale. Le sens change au signal.\n' +
      "Quatre tours. L'effort est court, la qualite prime sur la vitesse pure.",
    pointsCles:
      "Regard devant, jamais sur les pieds : c'est ce qui rend le travail transferable au jeu.\n" +
      "Appuis sur l'avant du pied, genoux flechis, buste legerement en avant.\n" +
      "Sur le changement de direction, le pied se pose LARGE, en dehors de l'axe du corps : c'est ce placement qui protege le genou.",
    evolution:
      "Sans echelle : un couloir de plots espaces de 50 cm produit le meme travail.\n" +
      "Complexifier : le signal designe une couleur de plot, le joueur doit lire et decider en courant.",
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 14, y: 14 },
      { type: 'plot', x: 19, y: 14 },
      { type: 'plot', x: 19, y: 9 },
      { type: 'plot', x: 14, y: 9 },
      { type: 'plot', x: 26, y: 14 },
      { type: 'plot', x: 31, y: 14 },
      { type: 'plot', x: 31, y: 9 },
      { type: 'plot', x: 26, y: 9 },
    ],
  },

  // -------------------------------------------------------- Renforcement

  {
    titre: 'Gainage handball : les trois chaines en circuit',
    ref: 'gainage-handball-les-trois-chaines-en-circuit',
    categorie: 'physique',
    duree: 12,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['tapis si le sol est dur'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Tenir le bassin et le tronc sous contrainte : c'est ce qui permet d'armer un tir en suspension, de resister a un contact et de ne pas compenser par le dos.",
    fonctionnement:
      'Six ateliers de 30 secondes, 15 secondes de transition, deux tours.\n' +
      '1. Gainage ventral, avant-bras au sol, bassin fixe.\n' +
      '2. Gainage lateral droit, hanche haute.\n' +
      '3. Gainage lateral gauche.\n' +
      '4. Gainage dorsal en pont, une jambe tendue en alternance.\n' +
      '5. Ventral avec touche d epaule alternee, sans que le bassin ne tourne.\n' +
      '6. Ventral avec avancee de bras opposee a la jambe.\n' +
      'A placer apres l echauffement, ou en fin de seance si la seance a ete technique.',
    pointsCles:
      "Trente secondes propres valent mieux qu'une minute affaissee : des que le bassin tombe, l'atelier est fini.\n" +
      'La respiration reste continue. Un joueur en apnee est un joueur en compensation.\n' +
      "Le regard vers le sol sur les ateliers ventraux : lever la tete creuse la nuque.",
    evolution:
      'Simplifier : appui sur les genoux pour le ventral, un tour seulement.\n' +
      "Complexifier : poser les pieds sur un banc, ou faire tenir la position 45 secondes.",
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 12, y: 13 },
      { type: 'plot', x: 18, y: 13 },
      { type: 'plot', x: 24, y: 13 },
      { type: 'plot', x: 12, y: 7 },
      { type: 'plot', x: 18, y: 7 },
      { type: 'plot', x: 24, y: 7 },
    ],
  },

  {
    titre: 'Renforcement excentrique : ischio-jambiers et adducteurs',
    ref: 'renforcement-excentrique-ischio-jambiers-et-adducteu',
    categorie: 'physique',
    duree: 12,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['tapis', '1 banc ou 1 partenaire par joueur'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Renforcer en excentrique les deux groupes musculaires qui lachent le plus souvent en handball adulte : ischio-jambiers et adducteurs.",
    fonctionnement:
      "Travail par deux, un joueur travaille, l'autre maintient.\n" +
      "Ischio-jambiers, exercice nordique : a genoux, chevilles bloquees par le partenaire, le joueur se laisse descendre vers l'avant le plus lentement possible, puis se rattrape aux mains et remonte en poussant. 3 series de 5 repetitions.\n" +
      'Adducteurs, exercice de Copenhague : en gainage lateral, la jambe superieure posee sur le banc ou tenue par le partenaire, monter et descendre le bassin. 3 series de 6 par cote.\n' +
      "Recuperation reelle d'une minute entre les series.",
    pointsCles:
      "C'est la phase de DESCENTE qui protege : elle doit durer le plus longtemps possible, sans a-coup.\n" +
      'Le corps reste aligne des genoux aux epaules sur le nordique, sans casser aux hanches.\n' +
      "Ce travail donne des courbatures les premieres semaines : le programmer en debut de semaine, jamais la veille d'un match.\n" +
      "L'effet vient de la repetition hebdomadaire, une seance isolee ne protege de rien.",
    evolution:
      "Simplifier : nordique avec les mains posees tot sur le sol pour reduire l'amplitude ; Copenhague genou flechi plutot que jambe tendue.\n" +
      'Complexifier : ralentir encore la descente, ou ajouter une serie.',
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 14, y: 13 },
      { type: 'plot', x: 20, y: 13 },
      { type: 'plot', x: 26, y: 13 },
      { type: 'plot', x: 14, y: 7 },
      { type: 'plot', x: 20, y: 7 },
      { type: 'plot', x: 26, y: 7 },
    ],
  },

  {
    titre: 'Renforcement du bras lanceur et de l epaule',
    ref: 'renforcement-du-bras-lanceur-et-de-l-epaule',
    categorie: 'physique',
    duree: 12,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['1 elastique par joueur'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Entretenir les rotateurs et les stabilisateurs de l'omoplate, que le tir sollicite fortement mais ne renforce pas : c'est la premiere prevention de l'epaule du handballeur.",
    fonctionnement:
      "Elastique fixe a hauteur d'epaule sur une espalier, un poteau ou tenu par un partenaire.\n" +
      '1. Rotation externe, coude au corps flechi a 90 degres : 2 x 15 par bras.\n' +
      '2. Rotation externe bras a 90 degres d abduction, position d arme : 2 x 12 par bras.\n' +
      '3. Tirage vers le bas, omoplates serrees et basses : 2 x 15.\n' +
      '4. Rotation interne freinee, retour lent : 2 x 12 par bras.\n' +
      '5. Gainage en appui sur une main, epaule verrouillee : 3 x 20 secondes par cote.\n' +
      'Deux fois par semaine, apres la seance ou a distance de celle-ci.',
    pointsCles:
      "Elastique LEGER : l'objectif est le controle, pas la force. Si l'epaule remonte vers l'oreille, la resistance est trop forte.\n" +
      "Le coude reste colle au corps sur l'exercice 1 : une serviette roulee sous le bras sert de repere.\n" +
      "Le retour est toujours plus lent que l'aller : c'est la phase freinee qui renforce.\n" +
      "Ne jamais faire ce travail juste avant une serie de tirs : l'epaule fatiguee tire moins bien et se blesse plus.",
    evolution:
      "Sans elastique : les memes gestes avec une petite bouteille d'eau, ou en resistance manuelle a deux.\n" +
      "Gardiens : ajouter des rotations rapides sur les dernieres series, le geste d'arret etant plus explosif que le tir.",
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 13, y: 12 },
      { type: 'plot', x: 19, y: 12 },
      { type: 'plot', x: 25, y: 12 },
      { type: 'plot', x: 13, y: 8 },
      { type: 'plot', x: 19, y: 8 },
      { type: 'plot', x: 25, y: 8 },
    ],
  },

  {
    titre: 'Force des membres inferieurs au poids de corps',
    ref: 'force-des-membres-inferieurs-au-poids-de-corps',
    categorie: 'physique',
    duree: 15,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['2 bancs', '8 plots'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Construire la force des jambes sans salle ni charges : c'est elle qui porte l'impulsion du tir en suspension et la stabilite du duel.",
    fonctionnement:
      'Cinq ateliers de 40 secondes, 20 secondes de transition, trois tours.\n' +
      '1. Squat au poids de corps, descente controlee jusqu a la cuisse parallele.\n' +
      '2. Fentes avant alternees, genou arriere frolant le sol.\n' +
      '3. Montees sur banc, une jambe puis l autre, sans elan du bras.\n' +
      '4. Fentes bulgares, pied arriere sur le banc.\n' +
      '5. Chaise contre le mur, position tenue.\n' +
      "Un tour supplementaire pour les joueurs a l'aise, plutot qu'un allongement des series.",
    pointsCles:
      "Genou dans l'axe du pied sur tous les ateliers : un genou qui rentre vers l'interieur est le signal d'arret de la serie.\n" +
      'Descente lente, remontee franche. La vitesse se travaille ailleurs.\n' +
      'Le buste reste droit sur les fentes : se pencher reporte tout le travail sur le dos.',
    evolution:
      'Simplifier : deux tours, squats a demi-amplitude, sans fentes bulgares.\n' +
      "Complexifier : ajouter un temps d'arret de deux secondes en bas de chaque mouvement.",
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 12, y: 14 },
      { type: 'plot', x: 18, y: 14 },
      { type: 'plot', x: 24, y: 14 },
      { type: 'plot', x: 30, y: 14 },
      { type: 'plot', x: 12, y: 6 },
      { type: 'plot', x: 18, y: 6 },
      { type: 'plot', x: 24, y: 6 },
      { type: 'plot', x: 30, y: 6 },
    ],
  },

  {
    titre: 'Proprioception de la cheville et du genou',
    ref: 'proprioception-de-la-cheville-et-du-genou',
    categorie: 'physique',
    duree: 10,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 1,
    materiel: ['6 plots', 'coussins ou tapis plies'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Reapprendre a l'articulation a se rattraper seule : la cheville et le genou concentrent, avec l'epaule, l'essentiel des blessures du handball amateur.",
    fonctionnement:
      'Quatre ateliers de 45 secondes par jambe, un tour, deux si le groupe revient de blessure.\n' +
      '1. Equilibre sur un pied, sol dur, 45 secondes, puis les yeux fermes.\n' +
      '2. Equilibre sur un pied sur coussin ou tapis plie.\n' +
      '3. Sur un pied, aller toucher du doigt quatre plots disposes en etoile autour de soi.\n' +
      '4. Reception d un saut sur un pied, position tenue trois secondes sans bouger.\n' +
      "Travail silencieux et concentre : c'est un exercice de controle, pas de depense.",
    pointsCles:
      "Genou legerement flechi, jamais verrouille en extension.\n" +
      "Sur la reception, la position doit etre STABLE d'emblee : un rattrapage en deux temps signifie que le saut etait trop haut.\n" +
      'Yeux fermes uniquement quand la position est tenue sans oscillation les yeux ouverts.\n' +
      'A maintenir toute la saison, et pas seulement au retour de blessure.',
    evolution:
      "Sans coussin : le tapis plie en quatre, ou l'herbe, suffisent.\n" +
      "Complexifier : un partenaire envoie de legeres poussees imprevisibles pendant l'equilibre.",
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 16, y: 12 },
      { type: 'plot', x: 20, y: 13 },
      { type: 'plot', x: 24, y: 12 },
      { type: 'plot', x: 16, y: 8 },
      { type: 'plot', x: 20, y: 7 },
      { type: 'plot', x: 24, y: 8 },
    ],
  },

  // ------------------------------------------------------- Evaluation

  {
    titre: 'Test de VMA : demi-Cooper',
    ref: 'test-de-vma-demi-cooper',
    categorie: 'physique',
    duree: 20,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['chronometre', '14 plots', 'fiche de releve'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Mesurer la vitesse maximale aerobie de chaque joueur - la vitesse a laquelle il consomme le plus d'oxygene - pour calibrer ensuite le travail intermittent sur des vitesses individuelles et non sur une moyenne de groupe.",
    fonctionnement:
      'Six minutes de course, le plus loin possible. La distance parcourue donne la VMA.\n' +
      "Circuit : le tour du terrain par l'exterieur des lignes fait 120 metres. Poser un plot tous les 10 metres sur le dernier cote pour lire la distance a l'arret du chronometre.\n" +
      'Formule : VMA en km/h = distance en metres / 100. 1300 m = 13 km/h. 1400 m = 14 km/h. 1500 m = 15 km/h.\n' +
      'Les joueurs partent par deux : un court, un compte les tours et note le plot atteint au signal de fin.\n' +
      "Ordre de grandeur en seniors amateurs : 1300 a 1500 metres. Au-dela de 1600 m, le joueur a un vrai fond. Le chiffre ne sert qu'a se comparer a soi-meme d'un test a l'autre.\n" +
      'Refaire le test en debut de saison, apres la treve, et en fin de saison.',
    pointsCles:
      "L'erreur qui fausse tout est de partir trop vite : le test se court a allure reguliere, l'acceleration se garde pour la derniere minute.\n" +
      "Test maximal : a programmer en debut de seance, sur des joueurs frais et prevenus la semaine d'avant.\n" +
      'Annoncer le temps restant a chaque minute, puis les trente dernieres secondes.\n' +
      "Au signal de fin, chacun s'arrete SUR PLACE : c'est le plot le plus proche qui donne la distance.\n" +
      'Noter les resultats : un test sans releve ecrit ne sert a rien.',
    evolution:
      'Test de Cooper complet : douze minutes, VMA = distance / 200. Plus fiable, mais plus dur a faire accepter.\n' +
      "Avec une bande sonore : navette 20 metres (Luc Leger), depart a 8,5 km/h et 0,5 km/h de plus par palier. Plus precis, et plus proche des demarrages-arrets du handball.\n" +
      'Joueur blesse ou en reprise : il tient le chronometre et la fiche de releve, il reste dans le groupe.',
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      // Les quatre coins balisent le tour de 120 metres...
      { type: 'plot', x: 0.6, y: 0.6 },
      { type: 'plot', x: 39.4, y: 0.6 },
      { type: 'plot', x: 39.4, y: 19.4 },
      { type: 'plot', x: 0.6, y: 19.4 },
      // ... et le dernier cote se lit de dix en dix metres.
      { type: 'plot', x: 10, y: 0.6 },
      { type: 'plot', x: 20, y: 0.6 },
      { type: 'plot', x: 30, y: 0.6 },
    ],
  },

  {
    titre: 'Intermittent 30-30 a partir de la VMA',
    ref: 'intermittent-30-30-a-partir-de-la-vma',
    categorie: 'physique',
    duree: 20,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['chronometre', '16 plots', 'fiche des VMA du groupe'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Developper la capacite a repeter les efforts intenses, chacun a sa propre vitesse : c'est ce qui distingue un travail utile d'une course collective ou les uns coulent et les autres se promenent.",
    fonctionnement:
      "Chaque joueur a un couloir balise a SA distance, calculee depuis sa VMA : distance en metres = VMA x 8,33 pour 30 secondes a 100 %.\n" +
      'Reperes : VMA 13 km/h = 108 m. VMA 14 = 117 m. VMA 15 = 125 m. VMA 16 = 133 m.\n' +
      '30 secondes de course a cette distance, 30 secondes de marche, en aller-retour entre deux plots.\n' +
      'Deux series de 8 repetitions, trois minutes de recuperation entre les series.\n' +
      "Le but est d'arriver au plot en meme temps que le signal, ni avant ni apres : un joueur qui arrive largement en avance a une VMA sous-estimee.",
    pointsCles:
      "Chacun sa distance : c'est toute la difference avec un intermittent collectif.\n" +
      'La recuperation se fait en marchant, jamais assis : le retour a la position debout coute plus cher que la marche.\n' +
      "Arreter un joueur qui ne tient plus la distance plutot que de le laisser finir en marchant : la serie a alors perdu son objet.\n" +
      "A programmer a distance d'un match, ce travail laisse des traces 48 heures.",
    evolution:
      'Simplifier : 30-30 a 95 % de VMA, une seule serie de 8.\n' +
      'Complexifier : 15-15 a 110 % de VMA, ou ajouter un changement de direction a mi-parcours.\n' +
      'Sans VMA mesuree : partir sur 110 metres pour tout le monde, en sachant que le travail sera approximatif.',
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 20, y: 10 },
      { type: 'plot', x: 4, y: 18 },
      { type: 'plot', x: 4, y: 14 },
      { type: 'plot', x: 4, y: 10 },
      { type: 'plot', x: 4, y: 6 },
      { type: 'plot', x: 4, y: 2 },
      { type: 'plot', x: 36, y: 18 },
      { type: 'plot', x: 36, y: 14 },
      { type: 'plot', x: 36, y: 10 },
      { type: 'plot', x: 36, y: 6 },
      { type: 'plot', x: 36, y: 2 },
    ],
  },

  {
    titre: 'Test de vitesse et de detente',
    ref: 'test-de-vitesse-et-de-detente',
    categorie: 'physique',
    duree: 20,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['chronometre', '6 plots', 'metre ruban', 'craie'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Mesurer les deux qualites explosives qui comptent le plus au poste : la vitesse sur les premiers metres, et la detente verticale.",
    fonctionnement:
      'Trois mesures, apres un echauffement complet.\n' +
      '1. Sprint 20 metres depart arrete, deux essais, on garde le meilleur. Chronometre au passage du plot.\n' +
      '2. Detente verticale : le joueur marque au mur la hauteur atteinte bras tendu debout, puis la hauteur atteinte en saut. La difference est la detente.\n' +
      '3. Detente laterale, pour les gardiens : distance couverte par un pas chasse plonge depuis la position de garde.\n' +
      "Ordre de grandeur en seniors amateurs : 3 s 00 a 3 s 40 sur 20 metres, 45 a 60 cm de detente.\n" +
      "Consigner les resultats et refaire le test tous les trois mois. C'est l'evolution qui parle, pas la valeur absolue.",
    pointsCles:
      "Test maximal : deux essais suffisent, un troisieme ne sert qu'a mesurer la fatigue.\n" +
      'Recuperation complete entre les essais, deux minutes au minimum.\n' +
      "Meme protocole a chaque fois - meme chaussures, meme surface, meme moment de la seance - sinon les mesures ne sont pas comparables.\n" +
      "Ne pas afficher un classement : le test sert au joueur, pas a le comparer aux autres.",
    evolution:
      "Sans metre ruban : marquer les hauteurs a la craie sur le mur et mesurer une fois pour tous.\n" +
      'Ajouter un 10 metres chronometre : la difference entre 10 et 20 metres distingue le demarrage de la vitesse lancee.',
    jetons: [
      { type: 'entraineur', etiquette: 'E', x: 24, y: 10 },
      { type: 'plot', x: 8, y: 14 },
      { type: 'plot', x: 28, y: 14 },
      { type: 'plot', x: 8, y: 6 },
      { type: 'plot', x: 28, y: 6 },
    ],
  },

  // ---------------------------------------------------------- Gardiens

  {
    titre: 'Gardiens seuls : temps de reaction sur signal',
    ref: 'gardiens-seuls-temps-de-reaction-sur-signal',
    categorie: 'gardien',
    duree: 10,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 plots de couleurs differentes'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      "Raccourcir le delai entre l'information et la mise en action, sans ballon : c'est la moitie de l'arret, et elle se travaille a l'ecart pendant que le groupe joue.",
    fonctionnement:
      "Les deux gardiens alternent, un travaille et l'autre donne les signaux.\n" +
      "1. Depart sur signal visuel : le partenaire leve la main droite ou gauche, le gardien pousse dans cette direction et revient en position de garde. 10 repetitions.\n" +
      '2. Signal sonore : le partenaire annonce haut ou bas, le gardien repond du bras et du pied du bon cote. 10 repetitions.\n' +
      '3. Signal contradictoire : le partenaire montre un cote et annonce l autre. Le gardien suit la consigne donnee au debut de la serie, et pas ce qui l attire. 10 repetitions.\n' +
      '4. Quatre plots de couleurs autour du gardien : le partenaire annonce une couleur, le gardien la touche du pied et revient. 45 secondes.\n' +
      'Series courtes, recuperation complete : des que le temps de reaction se degrade, la serie ne sert plus a rien.',
    pointsCles:
      "Le retour en position de garde fait partie de la repetition : un gardien qui reste ouvert apres une parade est battu sur le second ballon.\n" +
      "Sur le signal contradictoire, on travaille l'inhibition : voir sans reagir a ce qu'on voit. C'est exactement la feinte de tir.\n" +
      "Les appuis restent sous le bassin. Un gardien qui s'ecarte trop ne peut plus repousser.",
    evolution:
      "Sans deuxieme gardien : l'entraineur ou un joueur blesse tient le role du partenaire.\n" +
      "Complexifier : ajouter un pas chasse impose avant le signal, pour que la reaction se fasse en mouvement.",
    jetons: [
      { type: 'gardien', etiquette: 'GB1', x: 31, y: 10 },
      { type: 'gardien', etiquette: 'GB2', x: 29, y: 10 },
      { type: 'plot', x: 31, y: 12.5 },
      { type: 'plot', x: 33.5, y: 10 },
      { type: 'plot', x: 31, y: 7.5 },
      { type: 'plot', x: 28.5, y: 10 },
    ],
  },

  {
    titre: 'Gardien : detente laterale et retour d appui',
    ref: 'gardien-detente-laterale-et-retour-d-appui',
    categorie: 'gardien',
    duree: 12,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['2 haies basses', '6 plots', 'tapis'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      "Gagner en amplitude laterale et en vitesse de retour : le gardien couvre une cage de trois metres, sa detente laterale vaut plus que sa detente verticale.",
    fonctionnement:
      'Circuit sur la ligne de but, cinq ateliers de 30 secondes, deux tours.\n' +
      "1. Pas chasses d'un poteau a l'autre, position de garde tenue, sans croiser les appuis.\n" +
      '2. Franchissement lateral de deux haies basses, reception amortie sur un pied.\n' +
      '3. Fentes laterales profondes avec retour immediat au centre.\n' +
      '4. Depuis la position de garde, extension jambe-bras du meme cote, tenue une seconde, retour.\n' +
      "5. Sauts groupes puis ouverture bras et jambes en l'air, retombee en position de garde.\n" +
      'A programmer en debut de seance, jamais apres une longue serie de tirs.',
    pointsCles:
      "L'appui exterieur pousse, il ne se contente pas de recevoir : c'est lui qui donne l'amplitude.\n" +
      "Le buste reste face au tireur pendant tout le deplacement lateral.\n" +
      'Retour en position de garde apres CHAQUE repetition : le travail porte autant sur le retour que sur la sortie.\n' +
      "Qualite avant nombre : un gardien qui traine les pieds sur le deuxieme tour a fini sa seance.",
    evolution:
      'Sans haies : deux plots poses au sol produisent le meme travail, avec moins de contrainte.\n' +
      'Complexifier : le partenaire annonce le cote au dernier moment, la sortie se fait alors sans anticipation.',
    jetons: [
      GARDIEN_DROITE,
      { type: 'gardien', etiquette: 'GB2', x: 31, y: 10 },
      { type: 'haie', x: 37.5, y: 12 },
      { type: 'haie', x: 37.5, y: 8 },
      { type: 'plot', x: 35, y: 13 },
      { type: 'plot', x: 35, y: 7 },
      { type: 'plot', x: 32, y: 10 },
    ],
  },
]
