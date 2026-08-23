# HBPSM — Preparation de seances de handball

Application de preparation d'entrainements pour le Handball Pays de
Saint-Marcellin. Le livrable est **un seul fichier HTML** : on le copie ou l'on
veut, on double-clique, il s'ouvre dans le navigateur. Pas d'installation, pas
de compte, pas de connexion internet — y compris dans un gymnase.

Chaque exercice est une fiche autonome : un schema de terrain aux cotes
officielles a gauche, le detail de l'exercice a droite. 59 fiches sont livrees
avec l'application, de l'echauffement au bilan de saison.

## Documentation

**[LISEZMOI.md](LISEZMOI.md) est la reference du projet** : usage, choix de
conception, organisation du code. Ce fichier-ci n'en est que la porte d'entree.

Deux documents en sont engendres automatiquement, destines aux entraineurs :

| Fichier | Pour qui |
| --- | --- |
| `dist/LISEZMOI.html` | Le mode d'emploi, illustre, a joindre a un courriel |
| `dist/PRESENTATION.html` | Ce que fait le logiciel, en images |

Les parties techniques de `LISEZMOI.md` sont retirees de ces deux documents :
ils s'adressent aux entraineurs, pas aux developpeurs.

## Developpement

```
npm install
npm run dev        # serveur de developpement
npm run build      # produit les trois livrables dans dist/
npm test           # la suite de tests
npm run verifier   # build + tests
```

`npm run build` enchaine le typage, le bundle en fichier unique, puis la
fabrication de la notice et de la presentation — captures d'ecran comprises,
prises en pilotant le livrable lui-meme.

## Ce qui structure le code

- **Les coordonnees du terrain sont en metres**, jamais en pixels : un schema
  change de vue et s'imprime a n'importe quelle taille sans se deformer.
- **Les jetons sont persistants entre les etapes** : une etape ne stocke que
  les nouvelles positions, ce qui rend le mouvement traçable et animable.
- **Les fiches fournies portent une reference stable**, independante de leur
  titre, pour que rien de ce qui s'y accroche ne se perde a un renommage.

Le detail de ces principes, et les raisons derriere, sont dans
[LISEZMOI.md](LISEZMOI.md).

## Licence

[MIT](LICENSE). Vous pouvez utiliser, modifier et redistribuer ce logiciel,
y compris pour votre propre club, a condition de conserver la mention de
copyright et la licence.
