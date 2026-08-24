# HBPSM — Préparation de séances de handball

Application de préparation d'entraînements pour le Handball Pays de
Saint-Marcellin. Le livrable est **un seul fichier HTML** : on le copie ou l'on
veut, on double-clique, il s'ouvre dans le navigateur. Pas d'installation, pas
de compte, pas de connexion internet — y compris dans un gymnase.

Chaque exercice est une fiche autonome : un schéma de terrain aux cotes
officielles à gauche, le détail de l'exercice à droite. 62 fiches sont livrées
avec l'application, de l'échauffement au bilan de saison, dont les combinaisons
nommées du repertoire classique.

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

## Ce qui structure le code

- **Les coordonnees du terrain sont en mètres**, jamais en pixels : un schéma
  change de vue et s'imprime a n'importe quelle taille sans se deformer.
- **Les jetons sont persistants entre les étapes** : une étape ne stocke que
  les nouvelles positions, ce qui rend le mouvement traçable et animable.
- **Les fiches fournies portent une référence stable**, indépendante de leur
  titre, pour que rien de ce qui s'y accroche ne se perde à un renommage.

Le détail de ces principes, et les raisons derrière, sont dans
[LISEZMOI.md](LISEZMOI.md).

## Licence

[MIT](LICENSE). Vous pouvez utiliser, modifier et redistribuer ce logiciel,
y compris pour votre propre club, a condition de conserver la mention de
copyright et la licence.
