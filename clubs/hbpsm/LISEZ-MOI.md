# Handball Pays de Saint-Marcellin

Le premier profil de club, et celui qui sert de reference aux autres.

| Fichier | Ce qu'il porte |
| --- | --- |
| `profil.json` | L'identite : identifiant, nom court, nom complet, nom du fichier livre |
| `Ecusson.tsx` | L'ecusson, dessine en SVG |
| `fiches.ts` | Les six seances propres au club, ajoutees au fonds commun |

Rien d'autre du depot ne nomme ce club : tout ce qui s'affiche a son nom vient
d'ici. Ouvrir un nouveau club, c'est copier ce dossier, en changer le contenu, et
fabriquer avec `CLUB=<identifiant>`.

Un club sans fiches propres est le cas normal : `fiches.ts` exporte alors un
tableau vide. Saint-Marcellin est l'exception qui en a six.
