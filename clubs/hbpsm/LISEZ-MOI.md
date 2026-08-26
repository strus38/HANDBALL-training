# Handball Pays de Saint-Marcellin

Le premier profil de club, et celui qui sert de reference aux autres.

| Fichier | Ce qu'il porte |
| --- | --- |
| `profil.json` | L'identite et la palette : identifiant, noms, nom du fichier livre, couleurs par role |
| `Ecusson.tsx` | L'ecusson, dessine en SVG |
| `fiches.ts` | Les six seances propres au club, ajoutees au fonds commun |
| `planning.ts` | Les equipes et leurs creneaux hebdomadaires |

Les couleurs sont declarees par ROLE — `accent`, `structure-900` — et jamais par
teinte : elles nomment ce qu'elles portent, pas ce qu'elles sont. Un test refuse
une palette dont le texte ne se lirait pas.

Rien d'autre du depot ne nomme ce club : tout ce qui s'affiche a son nom vient
d'ici. Ouvrir un nouveau club, c'est copier ce dossier, en changer le contenu, et
fabriquer avec `CLUB=<identifiant>`.

Un club sans fiches propres est le cas normal : `fiches.ts` exporte alors un
tableau vide. Saint-Marcellin est l'exception qui en a six.
