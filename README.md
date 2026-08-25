# HBPSM — Préparation de séances de handball

Application de préparation d'entraînements pour le Handball Pays de
Saint-Marcellin. Le livrable est **un seul fichier HTML** : on le copie ou l'on
veut, on double-clique, il s'ouvre dans le navigateur. Pas d'installation, pas
de compte, pas de connexion internet — y compris dans un gymnase.

Chaque exercice est une fiche autonome : un schéma de terrain aux cotes
officielles à gauche, le détail de l'exercice à droite. 62 fiches sont livrées
avec l'application, de l'échauffement au bilan de saison, dont les combinaisons
nommées du repertoire classique.

## Ce que l'application sait faire

- **Préparer une séance** : ordonner les exercices, voir le temps se recalculer,
  et emporter la liste de matériel consolidée.
- **Dessiner le mouvement** : la flèche EST le déplacement. Joueurs, colonnes
  d'attente, zones coloriées, textes posés sur le terrain, et une lecture animée
  de l'enchaînement.
- **Imprimer** : une feuille A4 par exercice, un seul schéma portant tout
  l'enchaînement, la mise en page calculée pour le plus grand terrain lisible.
- **Suivre la saison** : notes, compteurs d'utilisation, bilan par catégorie —
  et un retour à chaud qui remonte à l'ouverture de la séance suivante.
- **S'appuyer sur le planning du club** : jour, horaire, durée du créneau et
  espace disponible pré-remplissent la séance, et signalent un plan trop long.
- **Mener l'entraînement** : le mode terrain affiche un exercice à la fois, avec
  le temps restant et le relevé de ce qui a vraiment été fait.

## Documentation

**[LISEZMOI.md](LISEZMOI.md) est la référence du projet** : usage, choix de
conception, organisation du code. Ce fichier-ci n'en est que la porte d'entrée.

Deux documents en sont engendres automatiquement, destines aux entraîneurs :

| Fichier | Pour qui |
| --- | --- |
| `dist/LISEZMOI.html` | Le mode d'emploi, illustre, a joindre à un courriel |
| `dist/PRESENTATION.html` | Ce que fait le logiciel, en images |

Les parties techniques de `LISEZMOI.md` sont retirees de ces deux documents :
ils s'adressent aux entraîneurs, pas aux developpeurs.

## Développement

```
npm install
npm run dev        # serveur de developpement
npm run build      # produit les trois livrables dans dist/
npm test           # la suite de tests
npm run verifier   # build + tests
```

`npm run build` enchaîne le typage, le bundle en fichier unique, puis la
fabrication de la notice et de la presentation — captures d'écran comprises,
prises en pilotant le livrable lui-même.

Un outil à part importe un cahier d'exercices PDF en fiches :

```
npm run importer -- "chemin/vers/Cahier.pdf"
```

Il produit un `.hbt.json` dans `import/`, dossier ignoré par git : ces cahiers
sont des oeuvres sous droits, et ce qui en sort appartient au seul entraîneur
qui les a achetés.

Un second outil lit une sauvegarde renvoyée par un entraîneur :

```
npm run lire-retour -- "chemin/vers/sauvegarde.hbt.json"
```

L'application ne mesure rien — pas de compte, pas de mouchard, et c'est un
choix. Mais un `.hbt.json` porte déjà tout ce qu'il faut savoir : quand les
séances ont été préparées, si elles ont été menées, si un retour a été écrit,
d'où viennent les exercices, si les schémas ont servi. L'outil en tire un
tableau et pointe les endroits où regarder.

Il ne conclut pas. « Aucun retour écrit en quatorze séances » peut vouloir dire
que la fonction est inutile, introuvable, ou qu'elle arrive au mauvais moment :
trois remèdes opposés, que seule une question à l'entraîneur départage. Il lit
un fichier, n'écrit rien et n'envoie rien.

## Ce qui structure le code

- **Les coordonnees du terrain sont en mètres**, jamais en pixels : un schéma
  change de vue et s'imprime a n'importe quelle taille sans se deformer.
- **Les jetons sont persistants entre les étapes** : une étape ne stocke que
  les nouvelles positions, ce qui rend le mouvement traçable et animable.
- **Les fiches fournies portent une référence stable**, indépendante de leur
  titre, pour que rien de ce qui s'y accroche ne se perde à un renommage.
- **Ce qui appartient à l'entraîneur est rangé à part des séances** : son
  équipe, ses favoris, les fiches qu'il a retirées. Ce sont des préférences,
  pas des données de séance.
- **Une alerte qui parle pour ne rien dire n'est plus lue.** Le rappel de
  sauvegarde se tait tant que rien n'a changé, et laisse passer les premières
  séances : il ne se dépense que là où il y a vraiment quelque chose à perdre.
- **Les automatismes pré-remplissent, ils ne décident pas.** Le planning, le
  titre par défaut, l'orientation d'un joueur : chacun se corrige à la main, et
  ce qui a été saisi n'est jamais écrasé.

Le détail de ces principes, et les raisons derrière, sont dans
[LISEZMOI.md](LISEZMOI.md).

## Licence

[MIT](LICENSE). Vous pouvez utiliser, modifier et redistribuer ce logiciel,
y compris pour votre propre club, a condition de conserver la mention de
copyright et la licence.
