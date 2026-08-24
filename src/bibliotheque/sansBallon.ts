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
    titre: 'Protocole d échauffement en quatre temps',
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
      "Disposer d'une routine identique à chaque séance, tenable sans matériel et sans ballon, qui amene le groupe prêt à jouer et non simplement essouffle.",
    fonctionnement:
      "Quatre temps qui s'enchaînent sans pause, du général vers le spécifique.\n" +
      '1. Monter en temperature (4 min) : course souple sur tout le terrain, en variant les appuis - talons-fesses, montees de genoux, pas chasses, course arrière.\n' +
      '2. Mobiliser (4 min) : cercles de bras, rotations du tronc, fentes avec rotation, balancements de jambe, ouverture de hanche. En mouvement, jamais assis.\n' +
      '3. Activer (4 min) : gainage court, fentes sautees, appuis rapides entre deux plots, deux séries de chaque.\n' +
      '4. Lancer la machine (3 min) : trois accelerations progressives sur 20 mètres, puis deux départs vifs sur signal.\n' +
      "L'ordre compte : etirer a froid ou sprinter avant d'avoir chauffe sont les deux erreurs classiques.",
    pointsCles:
      "Aucun étirement tenu avant le temps 4 : maintenir un muscle froid en position longue le rend moins disponible, pas plus souple.\n" +
      "L'intensité monte par paliers. Si le groupe parle normalement au temps 3, c'est trop lent.\n" +
      "Même routine à chaque séance : les joueurs doivent pouvoir la mener seuls quand l'entraîneur est retenu.",
    evolution:
      "Par temps froid ou en extérieur : allonger le temps 1 de deux minutes et raccourcir le temps 2.\n" +
      'Avant un match : ajouter deux départs sur signal, et terminer par des appuis a haute fréquence.',
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
      "Reveiller la coordination et la vitesse de pose d'appui avant le travail avec ballon, et préparer les chevilles aux changements de direction du jeu.",
    fonctionnement:
      "Deux ateliers en parallele, deux colonnes chacun, rotation toutes les 90 secondes.\n" +
      "Atelier 1 - echelle de rythme : un appui par case, puis deux appuis par case, puis pas chasses latéraux, puis entrées-sorties. Retour au trot par l'extérieur.\n" +
      'Atelier 2 - carre de plots de 5 mètres : course avant, pas chasses, course arrière, sprint sur la diagonale. Le sens change au signal.\n' +
      "Quatre tours. L'effort est court, la qualite prime sur la vitesse pure.",
    pointsCles:
      "Regard devant, jamais sur les pieds : c'est ce qui rend le travail transferable au jeu.\n" +
      "Appuis sur l'avant du pied, genoux flechis, buste légèrement en avant.\n" +
      "Sur le changement de direction, le pied se pose LARGE, en dehors de l'axe du corps : c'est ce placement qui protège le genou.",
    evolution:
      "Sans echelle : un couloir de plots espaces de 50 cm produit le même travail.\n" +
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
    titre: 'Gainage handball : les trois chaînes en circuit',
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
      "Tenir le bassin et le tronc sous contrainte : c'est ce qui permet d'armer un tir en suspension, de resister à un contact et de ne pas compenser par le dos.",
    fonctionnement:
      'Six ateliers de 30 secondes, 15 secondes de transition, deux tours.\n' +
      '1. Gainage ventral, avant-bras au sol, bassin fixe.\n' +
      '2. Gainage latéral droit, hanche haute.\n' +
      '3. Gainage latéral gauche.\n' +
      '4. Gainage dorsal en pont, une jambe tendue en alternance.\n' +
      '5. Ventral avec touche d épaule alternée, sans que le bassin ne tourne.\n' +
      '6. Ventral avec avancee de bras opposée à la jambe.\n' +
      'A placer après l échauffement, ou en fin de séance si la séance a été technique.',
    pointsCles:
      "Trente secondes propres valent mieux qu'une minute affaissee : des que le bassin tombe, l'atelier est fini.\n" +
      'La respiration reste continue. Un joueur en apnee est un joueur en compensation.\n' +
      "Le regard vers le sol sur les ateliers ventraux : lever la tête creuse la nuque.",
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
      "Ischio-jambiers, exercice nordique : à genoux, chevilles bloquees par le partenaire, le joueur se laisse descendre vers l'avant le plus lentement possible, puis se rattrape aux mains et remonte en poussant. 3 séries de 5 répétitions.\n" +
      'Adducteurs, exercice de Copenhague : en gainage latéral, la jambe supérieure posée sur le banc ou tenue par le partenaire, monter et descendre le bassin. 3 séries de 6 par côté.\n' +
      "Récupération réelle d'une minute entre les séries.",
    pointsCles:
      "C'est la phase de DESCENTE qui protège : elle doit durer le plus longtemps possible, sans a-coup.\n" +
      'Le corps reste aligne des genoux aux épaules sur le nordique, sans casser aux hanches.\n' +
      "Ce travail donne des courbatures les premières semaines : le programmer en debut de semaine, jamais la veille d'un match.\n" +
      "L'effet vient de la répétition hebdomadaire, une séance isolee ne protège de rien.",
    evolution:
      "Simplifier : nordique avec les mains posées tot sur le sol pour réduire l'amplitude ; Copenhague genou flechi plutôt que jambe tendue.\n" +
      'Complexifier : ralentir encore la descente, ou ajouter une série.',
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
    titre: 'Renforcement du bras lanceur et de l épaule',
    ref: 'renforcement-du-bras-lanceur-et-de-l-epaule',
    categorie: 'physique',
    duree: 12,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['1 élastique par joueur'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Entretenir les rotateurs et les stabilisateurs de l'omoplate, que le tir sollicite fortement mais ne renforce pas : c'est la première prévention de l'épaule du handballeur.",
    fonctionnement:
      "Élastique fixe à hauteur d'épaule sur une espalier, un poteau ou tenu par un partenaire.\n" +
      '1. Rotation externe, coude au corps flechi à 90 degres : 2 x 15 par bras.\n' +
      '2. Rotation externe bras à 90 degres d abduction, position d arme : 2 x 12 par bras.\n' +
      '3. Tirage vers le bas, omoplates serrees et basses : 2 x 15.\n' +
      '4. Rotation interne freinee, retour lent : 2 x 12 par bras.\n' +
      '5. Gainage en appui sur une main, épaule verrouillee : 3 x 20 secondes par côté.\n' +
      'Deux fois par semaine, après la séance ou à distance de celle-ci.',
    pointsCles:
      "Élastique LÉGER : l'objectif est le contrôle, pas la force. Si l'épaule remonte vers l'oreille, la résistance est trop forte.\n" +
      "Le coude reste colle au corps sur l'exercice 1 : une serviette roulee sous le bras sert de repère.\n" +
      "Le retour est toujours plus lent que l'aller : c'est la phase freinee qui renforce.\n" +
      "Ne jamais faire ce travail juste avant une série de tirs : l'épaule fatiguée tire moins bien et se blesse plus.",
    evolution:
      "Sans élastique : les mêmes gestes avec une petite bouteille d'eau, ou en résistance manuelle à deux.\n" +
      "Gardiens : ajouter des rotations rapides sur les dernières séries, le geste d'arrêt etant plus explosif que le tir.",
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
      '1. Squat au poids de corps, descente contrôlée jusqu à la cuisse parallele.\n' +
      '2. Fentes avant alternees, genou arrière frolant le sol.\n' +
      '3. Montees sur banc, une jambe puis l autre, sans élan du bras.\n' +
      '4. Fentes bulgares, pied arrière sur le banc.\n' +
      '5. Chaise contre le mur, position tenue.\n' +
      "Un tour supplementaire pour les joueurs à l'aise, plutôt qu'un allongement des séries.",
    pointsCles:
      "Genou dans l'axe du pied sur tous les ateliers : un genou qui rentre vers l'intérieur est le signal d'arrêt de la série.\n" +
      'Descente lente, remontee franche. La vitesse se travaille ailleurs.\n' +
      'Le buste reste droit sur les fentes : se pencher reporte tout le travail sur le dos.',
    evolution:
      'Simplifier : deux tours, squats a demi-amplitude, sans fentes bulgares.\n' +
      "Complexifier : ajouter un temps d'arrêt de deux secondes en bas de chaque mouvement.",
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
      "Reapprendre à l'articulation a se rattraper seule : la cheville et le genou concentrent, avec l'épaule, l'essentiel des blessures du handball amateur.",
    fonctionnement:
      'Quatre ateliers de 45 secondes par jambe, un tour, deux si le groupe revient de blessure.\n' +
      '1. Équilibre sur un pied, sol dur, 45 secondes, puis les yeux fermes.\n' +
      '2. Équilibre sur un pied sur coussin ou tapis plie.\n' +
      '3. Sur un pied, aller toucher du doigt quatre plots disposes en étoile autour de soi.\n' +
      '4. Réception d un saut sur un pied, position tenue trois secondes sans bouger.\n' +
      "Travail silencieux et concentre : c'est un exercice de contrôle, pas de depense.",
    pointsCles:
      "Genou légèrement flechi, jamais verrouille en extension.\n" +
      "Sur la réception, la position doit être STABLE d'emblee : un rattrapage en deux temps signifie que le saut etait trop haut.\n" +
      'Yeux fermes uniquement quand la position est tenue sans oscillation les yeux ouverts.\n' +
      'A maintenir toute la saison, et pas seulement au retour de blessure.',
    evolution:
      "Sans coussin : le tapis plie en quatre, ou l'herbe, suffisent.\n" +
      "Complexifier : un partenaire envoie de legeres poussees imprevisibles pendant l'équilibre.",
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
    materiel: ['chronomètre', '14 plots', 'fiche de releve'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Mesurer la vitesse maximale aerobie de chaque joueur - la vitesse a laquelle il consomme le plus d'oxygene - pour calibrer ensuite le travail intermittent sur des vitesses individuelles et non sur une moyenne de groupe.",
    fonctionnement:
      'Six minutes de course, le plus loin possible. La distance parcourue donne la VMA.\n' +
      "Circuit : le tour du terrain par l'extérieur des lignes fait 120 mètres. Poser un plot tous les 10 mètres sur le dernier cote pour lire la distance à l'arrêt du chronomètre.\n" +
      'Formule : VMA en km/h = distance en mètres / 100. 1300 m = 13 km/h. 1400 m = 14 km/h. 1500 m = 15 km/h.\n' +
      'Les joueurs partent par deux : un court, un compte les tours et note le plot atteint au signal de fin.\n' +
      "Ordre de grandeur en seniors amateurs : 1300 à 1500 mètres. Au-dela de 1600 m, le joueur a un vrai fond. Le chiffre ne sert qu'à se comparer à soi-même d'un test à l'autre.\n" +
      'Refaire le test en debut de saison, après la treve, et en fin de saison.',
    pointsCles:
      "L'erreur qui fausse tout est de partir trop vite : le test se court a allure régulière, l'accélération se garde pour la dernière minute.\n" +
      "Test maximal : a programmer en debut de séance, sur des joueurs frais et prevenus la semaine d'avant.\n" +
      'Annoncer le temps restant à chaque minute, puis les trente dernières secondes.\n' +
      "Au signal de fin, chacun s'arrête SUR PLACE : c'est le plot le plus proche qui donne la distance.\n" +
      'Noter les résultats : un test sans releve écrit ne sert à rien.',
    evolution:
      'Test de Cooper complet : douze minutes, VMA = distance / 200. Plus fiable, mais plus dur a faire accepter.\n' +
      "Avec une bande sonore : navette 20 mètres (Luc Léger), départ à 8,5 km/h et 0,5 km/h de plus par palier. Plus précis, et plus proche des demarrages-arrêts du handball.\n" +
      'Joueur blesse ou en reprise : il tient le chronomètre et la fiche de releve, il reste dans le groupe.',
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
    titre: 'Intermittent 30-30 à partir de la VMA',
    ref: 'intermittent-30-30-a-partir-de-la-vma',
    categorie: 'physique',
    duree: 20,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 3,
    materiel: ['chronomètre', '16 plots', 'fiche des VMA du groupe'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Développer la capacite a repeter les efforts intenses, chacun a sa propre vitesse : c'est ce qui distingue un travail utile d'une course collective ou les uns coulent et les autres se promenent.",
    fonctionnement:
      "Chaque joueur a un couloir balisé à SA distance, calculée depuis sa VMA : distance en mètres = VMA x 8,33 pour 30 secondes à 100 %.\n" +
      'Repères : VMA 13 km/h = 108 m. VMA 14 = 117 m. VMA 15 = 125 m. VMA 16 = 133 m.\n' +
      '30 secondes de course a cette distance, 30 secondes de marche, en aller-retour entre deux plots.\n' +
      'Deux séries de 8 répétitions, trois minutes de récupération entre les séries.\n' +
      "Le but est d'arriver au plot en même temps que le signal, ni avant ni après : un joueur qui arrive largement en avance a une VMA sous-estimée.",
    pointsCles:
      "Chacun sa distance : c'est toute la difference avec un intermittent collectif.\n" +
      'La récupération se fait en marchant, jamais assis : le retour à la position debout coûte plus cher que la marche.\n' +
      "Arrêter un joueur qui ne tient plus la distance plutôt que de le laisser finir en marchant : la série a alors perdu son objet.\n" +
      "A programmer à distance d'un match, ce travail laisse des traces 48 heures.",
    evolution:
      'Simplifier : 30-30 à 95 % de VMA, une seule série de 8.\n' +
      'Complexifier : 15-15 à 110 % de VMA, ou ajouter un changement de direction à mi-parcours.\n' +
      'Sans VMA mesurée : partir sur 110 mètres pour tout le monde, en sachant que le travail sera approximatif.',
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
    titre: 'Test de vitesse et de détente',
    ref: 'test-de-vitesse-et-de-detente',
    categorie: 'physique',
    duree: 20,
    nombreJoueurs: 14,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['chronomètre', '6 plots', 'mètre ruban', 'craie'],
    formatGardiens: 'avec-joueurs',
    vue: 'complet',
    objectifs:
      "Mesurer les deux qualites explosives qui comptent le plus au poste : la vitesse sur les premiers mètres, et la détente verticale.",
    fonctionnement:
      'Trois mesures, après un échauffement complet.\n' +
      '1. Sprint 20 mètres départ arrête, deux essais, on garde le meilleur. Chronomètre au passage du plot.\n' +
      '2. Détente verticale : le joueur marque au mur la hauteur atteinte bras tendu debout, puis la hauteur atteinte en saut. La difference est la détente.\n' +
      '3. Détente latérale, pour les gardiens : distance couverte par un pas chasse plonge depuis la position de garde.\n' +
      "Ordre de grandeur en seniors amateurs : 3 s 00 à 3 s 40 sur 20 mètres, 45 à 60 cm de détente.\n" +
      "Consigner les résultats et refaire le test tous les trois mois. C'est l'évolution qui parle, pas la valeur absolue.",
    pointsCles:
      "Test maximal : deux essais suffisent, un troisième ne sert qu'a mesurer la fatigue.\n" +
      'Récupération complète entre les essais, deux minutes au minimum.\n' +
      "Même protocole à chaque fois - même chaussures, même surface, même moment de la séance - sinon les mesures ne sont pas comparables.\n" +
      "Ne pas afficher un classement : le test sert au joueur, pas a le comparer aux autres.",
    evolution:
      "Sans mètre ruban : marquer les hauteurs à la craie sur le mur et mesurer une fois pour tous.\n" +
      'Ajouter un 10 mètres chronomètre : la difference entre 10 et 20 mètres distingue le démarrage de la vitesse lancee.',
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
    titre: 'Gardiens seuls : temps de réaction sur signal',
    ref: 'gardiens-seuls-temps-de-reaction-sur-signal',
    categorie: 'gardien',
    duree: 10,
    nombreJoueurs: 0,
    nombreGardiens: 2,
    difficulte: 2,
    materiel: ['4 plots de couleurs différentes'],
    formatGardiens: 'gardiens-seuls',
    enParallele: true,
    vue: 'zone',
    objectifs:
      "Raccourcir le delai entre l'information et la mise en action, sans ballon : c'est la moitié de l'arrêt, et elle se travaille à l'écart pendant que le groupe joue.",
    fonctionnement:
      "Les deux gardiens alternent, un travaille et l'autre donne les signaux.\n" +
      "1. Départ sur signal visuel : le partenaire leve la main droite ou gauche, le gardien pousse dans cette direction et revient en position de garde. 10 répétitions.\n" +
      '2. Signal sonore : le partenaire annonce haut ou bas, le gardien répond du bras et du pied du bon côté. 10 répétitions.\n' +
      '3. Signal contradictoire : le partenaire montre un côté et annonce l autre. Le gardien suit la consigne donnee au debut de la série, et pas ce qui l attire. 10 répétitions.\n' +
      '4. Quatre plots de couleurs autour du gardien : le partenaire annonce une couleur, le gardien la touche du pied et revient. 45 secondes.\n' +
      'Séries courtes, récupération complète : des que le temps de réaction se degrade, la série ne sert plus a rien.',
    pointsCles:
      "Le retour en position de garde fait partie de la répétition : un gardien qui reste ouvert après une parade est battu sur le second ballon.\n" +
      "Sur le signal contradictoire, on travaille l'inhibition : voir sans reagir a ce qu'on voit. C'est exactement la feinte de tir.\n" +
      "Les appuis restent sous le bassin. Un gardien qui s'ecarte trop ne peut plus repousser.",
    evolution:
      "Sans deuxième gardien : l'entraîneur ou un joueur blesse tient le rôle du partenaire.\n" +
      "Complexifier : ajouter un pas chasse impose avant le signal, pour que la réaction se fasse en mouvement.",
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
    titre: 'Gardien : détente latérale et retour d appui',
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
      "Gagner en amplitude latérale et en vitesse de retour : le gardien couvre une cage de trois mètres, sa détente latérale vaut plus que sa détente verticale.",
    fonctionnement:
      'Circuit sur la ligne de but, cinq ateliers de 30 secondes, deux tours.\n' +
      "1. Pas chasses d'un poteau à l'autre, position de garde tenue, sans croiser les appuis.\n" +
      '2. Franchissement latéral de deux haies basses, réception amortie sur un pied.\n' +
      '3. Fentes laterales profondes avec retour immédiat au centre.\n' +
      '4. Depuis la position de garde, extension jambe-bras du même côté, tenue une seconde, retour.\n' +
      "5. Sauts groupes puis ouverture bras et jambes en l'air, retombee en position de garde.\n" +
      'A programmer en debut de séance, jamais après une longue série de tirs.',
    pointsCles:
      "L'appui extérieur pousse, il ne se contente pas de recevoir : c'est lui qui donne l'amplitude.\n" +
      "Le buste reste face au tireur pendant tout le déplacement latéral.\n" +
      'Retour en position de garde après CHAQUE répétition : le travail porte autant sur le retour que sur la sortie.\n' +
      "Qualite avant nombre : un gardien qui traine les pieds sur le deuxième tour a fini sa séance.",
    evolution:
      'Sans haies : deux plots poses au sol produisent le même travail, avec moins de contrainte.\n' +
      'Complexifier : le partenaire annonce le côté au dernier moment, la sortie se fait alors sans anticipation.',
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
