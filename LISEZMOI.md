# Handball — Preparation de seances

Application de preparation d'entrainements de handball : chaque exercice est une
fiche autonome, avec a terme un schema de terrain a gauche et le detail de
l'exercice a droite.

Elle fonctionne **entierement hors ligne**, sans installation et sans compte.

## Utiliser l'application

Le livrable est un fichier unique : `index.html` (produit dans le dossier
`dist/`).

1. Copiez ce fichier ou vous voulez (bureau, cle USB, dossier partage).
2. Double-cliquez dessus : il s'ouvre dans votre navigateur.
3. C'est tout. Aucune connexion internet n'est necessaire.

Pour le partager avec un autre entraineur, envoyez-lui simplement ce fichier.

### Recevoir une nouvelle version sans perdre son travail

Les seances deja creees ne contiennent aucune information d'apparence : elles
enregistrent le TYPE de chaque jeton et sa position, jamais son dessin. Une
nouvelle version du fichier redessine donc l'ancien travail avec le nouveau
dessin, sans conversion ni manipulation.

Concretement, sur le meme ordinateur et dans le meme navigateur, le travail est
retrouve que l'on ecrase l'ancien `index.html`, qu'on ouvre le nouveau depuis un
autre dossier, ou depuis une cle USB : les trois cas ont ete verifies.

Deux limites : changer de NAVIGATEUR revient a repartir de zero, le stockage
etant propre a chacun ; et ce comportement a ete constate sur Chrome, d'autres
navigateurs pouvant cloisonner differemment les fichiers ouverts depuis le
disque. Dans le doute, **Sauvegarder tout** avant, restaurer apres : cette route
fonctionne partout.

### Depuis une cle USB

Oui, et sans rien installer : posez `index.html` sur la cle, double-cliquez.
L'application demarre et la sauvegarde automatique fonctionne — sous une forme
allegee, annoncee en haut a droite par **Sauvegarde simplifiee**. Un ordinateur
n'accorde pas a un fichier ouvert depuis le disque le meme stockage qu'a un site
web ; l'application le detecte et prend le stockage de secours. Environ 240
seances y tiennent, soit plusieurs saisons.

**Mais le travail ne voyage pas avec la cle.** La cle transporte l'application ;
les seances, elles, restent dans le navigateur de l'ordinateur ou vous avez
travaille. Branchez la meme cle sur un autre poste : l'application s'ouvre,
vide.

Pour emporter votre travail, posez sur la cle, a cote de `index.html`, le
fichier produit par **Sauvegarder tout**. Sur l'autre poste, ouvrez
l'application et restaurez-le.

## Mettre son travail a l'abri

Le bouton **Sauvegarder tout**, sur la page d'accueil, enregistre dans un seul
fichier toutes vos seances **et** votre bibliotheque personnelle. C'est la seule
copie transportable de votre travail.

Le stockage du navigateur est lie a cette machine et a ce navigateur : un
nettoyage des donnees de navigation efface tout, sans recours. Conservez le
fichier de sauvegarde ailleurs — cle USB, courriel, dossier partage.

Restaurer une sauvegarde **ajoute** son contenu a ce qui est deja la : rien
n'est jamais ecrase. Restaurer sur une machine vierge redonne le classeur
complet ; restaurer par-dessus un travail en cours ne le detruit pas.

## Confirmations et sauvegarde

Aucune fenetre native du navigateur n'est utilisee. Les demandes de
confirmation sont des boites de l'application : memes couleurs, meme
vocabulaire, meme apparence quel que soit le navigateur.

Sur une action destructrice, le bouton par defaut est **Annuler** : une
validation au clavier par reflexe ne detruit rien. `Echap` ferme, un clic a
cote ferme, et le focus revient ensuite la ou il etait.

## Sauvegarde

Le travail est enregistre automatiquement dans le navigateur, sans rien cliquer.
L'indicateur en haut a droite affiche l'etat de l'enregistrement.

Quand l'onglet se ferme ou passe en arriere-plan, les modifications encore en
attente sont ecrites immediatement. L'application ne demande donc jamais
« voulez-vous vraiment quitter ? » : elle enregistre, ce qui vaut mieux que
prevenir.

Selon le navigateur et la maniere d'ouvrir le fichier, le stockage utilise est
IndexedDB, ou a defaut localStorage. Si aucun des deux n'est autorise, un
bandeau jaune previent que le travail sera perdu a la fermeture.

**Dans tous les cas, la sauvegarde de reference reste le fichier exporte.**
Le stockage du navigateur est lie a la machine et au navigateur utilises : il
n'est pas transportable et peut etre efface par un nettoyage du navigateur.

## Vue d'ensemble des seances
<!-- notice:capture accueil -->

L'application s'ouvre sur **Mes seances** : toutes les seances enregistrees,
chacune resumee sur une carte.

Le menu des seances, a gauche, se replie : le bouton `⟨⟨` en haut du menu le
referme, celui de l'entete `☰` le rouvre. Replie, il laisse toute la largeur au
terrain et a la fiche, ce qui est confortable sur un petit ecran ou lors d'un
long travail de trace.

Chaque carte donne, sans avoir a ouvrir la seance :

- la date en toutes lettres, situee dans le temps (« aujourd'hui », « dans 2
  semaines », « il y a 3 jours ») ;
- la duree, le nombre d'exercices et l'effectif prevu ;
- la **repartition du temps par categorie**, en barre proportionnelle : on voit
  d'un coup d'oeil une seance trop chargee en attaque ou sans echauffement ;
- la note moyenne des exercices evalues ;
- les signaux utiles : travail specifique des gardiens, exercices menes en
  parallele, et exercices demandant plus de monde que l'effectif annonce.

Les seances passees restent listees, sur un fond legerement different. La
recherche porte sur le titre, l'equipe, l'objectif et le **titre des exercices** :
retrouver « la seance ou on avait travaille le croise » fonctionne.

### Dupliquer une seance

Le bouton **Dupliquer** de chaque carte ouvre un formulaire pre-rempli : le
titre, la date proposee une semaine plus tard, l'equipe, la categorie et
l'effectif. C'est la maniere normale de rejouer une seance qui a bien marche.

La copie est **totalement independante** : la modifier ne touche jamais
l'originale, qui garde la version avec laquelle elle a ete jouee.

Par defaut, la copie conserve vos notes et vos compteurs d'utilisation : ils
portent sur l'exercice, pas sur la date a laquelle il a ete mene. Une case
permet de repartir sans eux.

## Dessiner un exercice
<!-- notice:capture terrain -->

Le schema se construit a gauche de la fiche.

**Placer les joueurs.** Cliquez un element de la palette, puis faites-le glisser
sur le terrain. Les joueurs sont vus de dessus, epaules et bras vers l'avant :
on voit ou ils regardent et de quel cote ils peuvent recevoir. Le numero reste
toujours a l'endroit, meme quand le joueur regarde vers le bas du terrain.

**Le ballon suit son porteur.** L'application considere qu'un joueur a le ballon
des qu'il en est proche. Quand ce joueur court ou dribble, le ballon part avec
lui : vous n'avez plus a le replacer a chaque etape. Une passe le transmet au
joueur vise, qui devient porteur a son tour.

**L'orientation se deduit.** Un joueur qui court regarde ou il va ; les autres
regardent le ballon ; celui qui l'a en main regarde le but. Vous n'avez plus a
tourner personne a la main. La poignee jaune et le curseur restent disponibles
quand vous voulez decider vous-meme : l'orientation devient alors la votre, et
l'automatisme ne la reprend plus. Le bouton « ↺ auto » rend la main a
l'application.

**Tracer les mouvements.** Choisissez un type de trait dans la barre d'outils,
puis tirez du point de depart vers l'arrivee.

La fleche n'est pas un dessin : **elle EST le deplacement**. Tracer une course
depuis un joueur le place a l'etape suivante, au bout de la fleche — et cree
cette etape si elle n'existe pas encore. Vous ne decrivez jamais deux fois le
meme mouvement.

Le lien fonctionne dans les deux sens : deplacer le joueur a l'etape suivante
rallonge la fleche de l'etape courante. Ce ne sont pas deux donnees
synchronisees, c'est la meme donnee vue de deux facons — elles ne peuvent pas
se contredire. Effacer la fleche remet le joueur immobile.

| Ce que vous tracez | Qui se deplace | Ou il se retrouve a l'etape suivante |
| --- | --- | --- |
| Course | Le joueur | Au bout de la fleche |
| Dribble | Le joueur et le ballon | Au bout de la fleche, ballon en main |
| Passe | Le ballon seul | Chez le joueur vise, qui devient porteur |
| Tir | Le ballon seul | La ou vous l'avez lache ; personne ne bouge |
| Ecran | Le joueur qui bloque | Au bout de la fleche, et il y reste |

Une fleche tracee dans le vide, sans joueur au depart, reste une simple
illustration : elle garde ses extremites et ne deplace personne.

Une fois selectionnee, le point du milieu permet de courber le trace. Chaque
trace porte son numero d'ordre, repris dans le deroulement redige.

**Aimantation.** Le geste reste approximatif, l'application est precise. Un
joueur lache pres d'un repere connu s'y accroche, et le repere s'affiche
pendant le glisser :

- les six **postes d'attaque** (ailiers, arrieres, demi-centre, pivot) ;
- les lignes de **6 m** et de **9 m**, y compris sur leurs arcs ;
- l'**axe** du terrain.

Le bouton 🧲 la desactive, et la touche **Alt** la neutralise le temps d'un
geste quand vous voulez viser librement.

**Symetrie.** Le bouton ⇅ rejoue tout l'exercice de l'autre cote : positions,
orientations et traces sont reflechis, et les etiquettes de poste echangees
(un ailier gauche devient ailier droit). Le handball est symetrique, c'est la
moitie du travail en moins. L'operation s'annule par Ctrl+Z.

**Mouvements proposes depuis le texte.** Le bouton ⤳ fait le chemin inverse :
il lit le deroulement que vous avez ecrit et propose les mouvements
correspondants. Un ecran d'apercu montre chaque action lue, la phrase dont elle
vient, et **son niveau de confiance** avant que rien ne soit applique.

Sa justesse a ete mesuree sur les onze fiches dont la chorégraphie a ete ecrite
a la main, en lui donnant leur seul texte :

| Mesure | Resultat |
| --- | --- |
| Actions proposees avec le bon joueur | 100 % |
| Dont le bon type de trace | 64 % |
| Mouvements retrouves, textes exploitables | 28 % |
| Mouvements retrouves, sur les onze fiches | 15 % |
| Ecart moyen de la destination | 3 m |

Autrement dit : **il ne se trompe jamais de joueur, mais il en oublie beaucoup**,
et il place le point d'arrivee a trois metres pres. C'est un point de depart a
corriger, pas un schema fini.

Cinq des onze fiches ne donnent rien du tout, et c'est normal : leur texte
decrit une organisation (« series de trois attaques », « le bloc glisse en
restant groupe ») et non une chorégraphie. Le mouvement n'y est pas ecrit, aucun
analyseur ne pourrait l'y trouver. Pour qu'un texte soit lisible, il faut nommer
les postes et les actions : « l'arriere droit part en course a 9 metres, puis
passe a l'ailier droit ».

**Deroulement redige.** Le bouton ✎ ecrit le deroulement a partir du schema :
« ArD part en course a 9 m cote droit. ArD passe a AlD. AlD tire de l'aile. »
Chaque etape recoit aussi sa consigne. C'est une proposition, a relire et a
retoucher : un texte deja saisi n'est jamais remplace sans votre accord.

| Trait | Signification |
| --- | --- |
| Plein | Course du joueur |
| Pointille | Passe |
| Ondule | Dribble |
| Double, rouge | Tir |
| Barre en T | Ecran, blocage |

**Decomposer en etapes.** Le bouton « + Etape » cree une etape a partir des
positions de la precedente : il n'y a que ce qui bouge a deplacer. Les positions
de l'etape precedente restent visibles en transparence.

**Montrer le mouvement.** « Lire » anime le passage d'une etape a l'autre :
les joueurs glissent et pivotent vers leur position suivante. C'est ce qui rend
les etapes utiles devant un groupe — au lieu de decrire le mouvement, on le
montre.

Pendant la lecture, la **puce de l'etape s'allume au rythme de l'animation** :
elle reste sur l'etape de depart tant que les joueurs se deplacent, et passe a
la suivante des qu'ils s'y posent. On sait donc toujours quel temps de jeu on
regarde.

« **Pause** » fige l'image sans perdre l'endroit, et « Reprendre » repart
exactement de la. C'est ce qui permet d'arreter le mouvement au moment precis
ou l'on veut commenter un placement, puis de laisser filer la suite. « ■ »
arrete la lecture et rend la main a l'edition.

### Fiches chorégraphiées

Onze des 41 fiches fournies decrivent un **enchainement complet**, etape par
etape : croise arriere-ailier, passe et va, ecran du pivot, renversement en
trois passes, attaque a deux pivots, superiorite et inferiorite numerique,
glissement 6-0, 5-1, 3-2-1, contre-attaque directe. Sur celles-la, le bouton
« Lire » anime reellement le mouvement et l'impression sort plusieurs schemas.

Les trente autres — circuits, gammes, matchs a theme, jeu en continu, fiches
gardien — restent volontairement a une seule mise en place. Elles decrivent une
**organisation ou une repetition**, pas une chorégraphie : leur imposer une
animation figee donnerait une fausse idee de ce qu'elles sont.

Les mouvements de ces fiches sont declares comme des intentions (« l'arriere
droit court vers tel point, puis passe a l'ailier ») et construits par le meme
moteur que le trace d'un entraineur a la souris. Positions, ballon qui suit et
orientations en decoulent, au lieu d'etre recopies a la main dans les donnees.

## Dicter plutot qu'ecrire

Remplir un « Deroulement » de dix lignes au clavier decourage. Deux chemins
existent, et ils ne se valent pas.

### Coller un texte dicte sur son telephone — la voie fiable

<!-- notice:capture collage -->

Le bouton **« Coller un texte dicte »**, en haut du detail de l'exercice.

Dictez dans les notes de votre telephone, puis collez le texte avec Ctrl+V.
C'est la meilleure option et de loin : la dictee d'un telephone tourne **sur
l'appareil**, elle fonctionne **sans connexion** — donc dans un gymnase — elle
est gratuite, et elle connait le francais bien mieux que ce qu'un navigateur
saurait faire tourner hors ligne.

Si vous dictez les intitules — « mise en place », « deroulement », « points
cles », « variantes » — le texte se range tout seul dans les bons champs. La
fenetre annonce **avant d'appliquer** ou chaque partie va atterrir.

Sans intitule reconnu, tout part dans le fonctionnement, d'un bloc.
**L'application ne devine pas** : un paragraphe range au jugement se retrouve
la ou personne ne le cherche, et l'on croit avoir perdu sa dictee. Un bloc dans
un seul champ se recoupe d'un copier-coller ; un texte eparpille, non.

Le texte colle **s'ajoute** a ce qui est deja ecrit, il ne le remplace jamais.

### Le micro a cote des champs — un complement, la ou il marche

Un bouton 🎤 apparait a droite de l'etiquette des champs de texte : ceux de la
fiche, l'**objectif de la seance**, et le retour d'apres-seance. Il dicte
directement dans le champ, phrase par phrase, chacune sur sa ligne.

Deux champs tiennent sur **une seule ligne** — la **consigne d'une etape** et la
**forme d'intervention**. Les phrases dictees s'y suivent separees d'une espace :
un retour a la ligne y serait invisible a l'ecran, mais ressortirait a
l'impression et en mode terrain comme une coupure au milieu d'une phrase.

**Il exige une connexion internet.** La reconnaissance vocale du navigateur
envoie l'audio a un service en ligne : elle ne fonctionne pas dans un gymnase
sans reseau. C'est une aide pour preparer sa seance chez soi, pas davantage, et
l'application le dit plutot que de vous laisser parler trente secondes pour
rien.

Le bouton **n'apparait pas du tout** sur un navigateur qui ne sait pas
transcrire — Firefox, notamment. Un bouton grise a cote de chaque champ serait
un reproche permanent ; absent, il ne coute rien.

La aussi, ce qui est reconnu **s'ajoute** au texte existant : une phrase mal
comprise ne peut pas effacer un paragraphe.

### Et apres

Le fonctionnement n'est pas un champ comme les autres : c'est le seul que
l'application sache relire pour **proposer les deplacements sur le terrain**.
Une fois le deroulement en place, le menu ⋯ du terrain propose ce qu'il y
reconnait. Dicter alimente donc directement le dessin.

## Mener la seance : le mode terrain

<!-- notice:capture mode-terrain -->

Le bouton **▶ Mode terrain**, au-dessus de la liste des exercices, affiche la
seance telle qu'on la mene : un exercice a la fois, en grand, sur toute la
largeur de l'ecran. Les fleches ← et → du clavier changent d'exercice, la
touche Echap ferme.

**Le temps restant est calcule sur l'heure reelle.** L'horaire s'ancre au
moment ou vous ouvrez le mode terrain : chaque exercice recoit un creneau, et
l'ecran annonce ce qu'il reste sur celui en cours, l'heure de fin prevue, et
l'avance ou le retard.

C'est le point important : un minuteur qui repartirait a zero a chaque exercice
afficherait toujours « 15 minutes disponibles », y compris quand la seance a
vingt minutes de retard et qu'il faudra sauter un atelier. Ici le retard
s'accumule et se voit **pendant que vous pouvez encore y faire quelque chose**.

L'heure de debut est retenue dans la seance : si la tablette se verrouille ou
que le navigateur se recharge au milieu de l'entrainement, vous retrouvez votre
horaire et non un chronometre remis a zero.

**Cocher « Marquer mene »** enregistre que l'exercice a bien ete fait. Cette
case alimente les compteurs d'utilisation de la bibliotheque : ce que vous
cochez au gymnase se retrouve sous les fiches quand vous preparez la seance
suivante. Un exercice deja marque a la main depuis sa fiche n'est pas compte
deux fois.

**Le temps reellement passe est mesure** et note a cote de la duree prevue,
quand vous passez a l'exercice suivant. Le plan n'est jamais modifie : la fiche
continue d'afficher « 15 min prevues » et ajoute « 22 min passees ». C'est la
comparaison des deux qui apprend quelque chose pour la fois d'apres — ecraser
le plan par la realite l'effacerait.

### L'ordre des commandes d'une seance

La rangee au-dessus des exercices se lit **depuis la droite**, et suit la vie
d'une seance : on ajoute des exercices, on va en chercher dans la bibliotheque,
on mene la seance, on l'imprime, on la duplique pour la semaine suivante, on
l'exporte, et un jour on la supprime. Les commandes les plus utilisees se
trouvent ainsi au plus pres du bouton principal, la ou la main revient.

**Supprimer la seance** est a l'autre bout, derriere un separateur. Elle etait
auparavant coincee entre « Exporter » et « Bibliotheque » : la seule action
irreversible de la rangee se trouvait a un pixel des plus frequentes.

## Effectif de la seance

La seance porte le nombre de joueurs de champ et de gardiens presents ce
jour-la. Tout exercice qui demande plus de monde est alors signale, dans la
liste comme dans la fiche.

L'alerte informe, elle ne bloque pas : un entraineur sait adapter un exercice a
deux joueurs pres. Un effectif laisse vide ne declenche aucune alerte, et un
exercice qui mobilise moins de monde que le groupe present n'est jamais signale.

## Imprimer

Une fiche tient sur une **page A4 en paysage**.

- Depuis une fiche, « Imprimer » sort cette fiche seule.
- Depuis la seance, « Imprimer la seance » sort une page par exercice, dans
  l'ordre de la seance.

### La disposition est calculee, pas fixee

La place du schema depend de sa forme, et elle change d'un exercice a l'autre.

| Vue du schema | Rapport | Disposition retenue |
| --- | --- | --- |
| Terrain complet | 1,9 — large et plat | Banniere en haut, texte en colonnes dessous |
| Demi-terrain | 1,0 — carre | Schema a gauche, texte a droite |
| Zone 6m / 9m | 0,78 — vertical | Schema a gauche, texte a droite |

Un terrain complet coince dans une colonne etroite n'utiliserait qu'un tiers de
la hauteur de la page. En banniere sur toute la largeur, il gagne pres du double
de surface — d'ou le choix. Un schema carre ou vertical, lui, n'a rien a y
gagner : il reste en colonne, et le texte garde des lignes confortables.

Le calcul essaie toutes les combinaisons de disposition, de repartition, de
nombre de colonnes et de taille de police, ecarte celles ou le texte deborde, et
retient celle qui donne le **plus grand schema**. A surface comparable, il
prefere la police la plus lisible. Une fiche tres bavarde fait donc reculer le
schema et resserrer le texte, jamais deborder sur une deuxieme page.

Un exercice a plusieurs etapes voit ses schemas imprimes en grille, jusqu'a
quatre. L'arrangement suit la meme logique : deux terrains complets sont
empiles, deux vues de zone sont mises cote a cote. Au dela de quatre etapes, les
suivantes restent decrites en texte.

Pensez a activer les **couleurs d'arriere-plan** dans la boite de dialogue
d'impression du navigateur si le terrain sort en blanc.

### Exporter un schema en image

Le bouton 🖼 de la fiche enregistre le schema de l'etape affichee en **PNG**,
sur fond blanc et en pleine resolution — de quoi le coller dans un message, un
document ou le groupe de discussion de l'equipe. Les poignees d'edition et les
reperes d'aimantation n'y figurent pas : seul le schema est exporte.

## Bilan de la saison
<!-- notice:capture bilan -->

La page **Bilan** repond a une question qu'on ne se pose jamais en preparant une
seance isolee : depuis septembre, qu'a-t-on reellement travaille ?

- volume total, moyenne par seance, nombre de seances comportant un travail
  specifique des gardiens ;
- **repartition du temps par categorie**, en barre et en pourcentages, avec la
  liste des categories jamais abordees sur la periode ;
- **rythme mensuel** : le volume mois par mois, pour reperer un creux ;
- **exercices les plus programmes**, avec leur note ;
- **a revoir** : les exercices notes 1 ou 2 que l'on continue pourtant de
  programmer. C'est le seul signal vraiment actionnable de la page.

La saison va de septembre a aout : une seance de juin appartient a la saison
commencee en septembre precedent. Un bouton permet de basculer sur tout
l'historique.

Les exercices sont regroupes par **titre** et non par identifiant : dupliquer
une seance cree des copies independantes, qui doivent malgre tout compter comme
un seul et meme exercice dans un bilan.

## Savoir ce qu'on a deja mene

Sous chaque fiche de la bibliotheque, une ligne rappelle **combien de fois vous
l'avez menee et quand pour la derniere fois**. Elle apparait la ou l'on choisit,
pas une fois la fiche ouverte.

Rien ne s'affiche tant qu'une fiche n'a jamais servi : « jamais utilise » sur
des dizaines de lignes serait du bruit.

Ce compte est reconstitue en parcourant toutes vos seances. L'historique ne vit
pas sur la fiche mais sur les **copies** qu'elle a produites : ajouter une fiche
a une seance en fabrique un exemplaire independant, et c'est lui qu'on marque
comme realise. Le regroupement se fait sur la reference de la fiche d'origine,
donc **renommer un exercice dans une seance ne casse pas son compteur**.

## Mettre des fiches en favori

Une **etoile** en haut a droite de chaque fiche de la bibliotheque la met de
cote. La puce **★ Favoris**, en bas de la rangee des filtres, ne montre plus
qu'elles. Elle se combine avec les autres : « les favoris de defense », « les
favoris sans ballon ».

**Un favori n'est pas une note.** La note est un jugement porte *apres* la
seance : cet exercice a bien marche jeudi. Le favori est une intention prise
*avant* : celui-la, je le remonterai souvent cette saison. On peut donc mettre
en favori une fiche jamais menee, et ne jamais mettre en favori une fiche notee
cinq etoiles parce qu'elle ne sert qu'une fois par an. Les deux vivent cote a
cote sur la meme carte sans se remplacer.

L'etoile se pose sur la **fiche de la bibliotheque**, pas sur la copie posee
dans une seance : c'est dans la bibliotheque qu'on choisit, c'est la qu'elle
sert.

Les favoris partent dans « Sauvegarder tout », comme le reste. Ce sont des
preferences et non des donnees de seance, mais ce fichier est le seul filet
contre un nettoyage du navigateur — qui efface aussi les preferences. Les
omettre reviendrait a promettre de tout sauver en laissant tomber une partie.

Une precision sur la restauration : elle **ajoute**, elle ne remplace jamais,
et donne pour cela de nouveaux identifiants aux fiches que vous avez creees
vous-meme. Les favoris qui les designaient sont retraces au passage, sans quoi
vous retrouveriez vos seances en perdant la moitie de vos etoiles sans qu'on
vous dise rien. Les favoris poses sur les fiches fournies, eux, traversent tels
quels : leur reference est stable.
## Noter les exercices

Chaque fiche porte une note de 1 a 5 etoiles, donnee apres la seance :

| Note | Sens |
| --- | --- |
| Aucune | Pas encore evalue |
| 1 - 2 | A eviter, ou decevant |
| 3 | Correct |
| 4 - 5 | Tres bon, incontournable |

Le bouton « Marquer comme realise » incremente un compteur d'utilisations et
retient la date. Avec le commentaire libre, l'entraineur retrouve d'une seance a
l'autre ce qui a fonctionne et ce qu'il vaut mieux ne pas reprogrammer.

## Bibliotheque fournie
<!-- notice:capture bibliotheque -->

62 fiches sont livrees avec l'application : 29 pour un groupe seniors masculins
(+18 ans), 12 specifiques aux gardiens de but, 12 qui se passent de ballon, 6
transcrites des seances du club, et 3 combinaisons nommees du repertoire
classique.

Les fiches joueurs de champ couvrent toutes les categories de la seance :
echauffement et prevention, technique individuelle, attaque placee (croise,
pivot, ecran, renversement, deux pivots, superiorite numerique), defense (6-0,
5-1, 3-2-1, duels, inferiorite numerique), montee de balle et contre-attaque,
preparation physique, et matchs a theme.

### Les seances du club

Six fiches viennent des diaporamas de l'entraineur, transcrites telles quelles :
l'echauffement motricite ballon, l'echauffement gardien a trois colonnes, le
cardio PMA, le 3 contre 3 contre une 0-6, la montee de balle, et le 6 contre 6
grand espace. Leurs baremes de points sont ceux du club, pas des exemples.

Deux reserves les concernent :

- **« Points cles » y est vide.** La trame d'origine ne comporte pas cette
  rubrique. Plutot que d'inventer ce que l'entraineur regarde, on l'a laissee a
  remplir : c'est le seul endroit ou ces fiches sont incompletes.
- **Deux durees ont ete estimees.** Le diaporama laisse « TPS' » sans chiffre
  pour le 3 contre 3 et pour la montee de balle. La fiche retient 20 et 15
  minutes, et le dit dans sa mise en place.

Une seule de ces six declare des etapes, la montee de balle : c'est la seule
decrite comme un enchainement. Les autres sont des jeux ou des circuits.

Une etiquette **▶ N etapes** signale, dans la liste, les fiches dont le
mouvement est decrit etape par etape : celles-la se lisent en animation une fois
ouvertes. Les autres — circuits, gammes, matchs a theme — decrivent une
organisation ou une repetition, pas une chorégraphie : leur imposer une
animation figee donnerait une fausse idee de ce qu'elles sont. L'etiquette vaut
aussi pour vos propres fiches, des qu'elles comptent plus d'une etape.

Deux puces a droite des filtres restreignent la liste sans remplacer le filtre
de categorie : on peut donc demander les attaques animees, ou la preparation
physique sans ballon.

La puce **Sans ballon** ne garde que les fiches qui ne demandent aucun ballon :
ni sur le schema, ni dans le materiel. La regle est litterale - une fiche qui
demande des ballons lestes ou des ballons mousse n'y figure pas, meme si le
ballon de hand n'y sert a rien. Elle repond a la question « qu'est-ce que je
peux mener ce soir sans sortir un ballon ».

La puce **▶ Avec animation** ne montre que ces fiches.
Elle se combine avec le filtre de categorie au lieu de le remplacer : on peut
Les deux s'allument en jaune plutot qu'en bleu, et sont ecartees des autres
puces, parce qu'elles ne jouent pas le meme role : les puces de categorie
s'excluent, celles-ci s'ajoutent.

Douze fiches ne demandent aucun ballon : protocoles d'echauffement, gainage,
renforcement excentrique de prevention, travail de l'epaule a l'elastique, force
des jambes au poids de corps, proprioception, test de VMA en demi-Cooper,
intermittent calibre sur la VMA de chaque joueur, test de vitesse et de detente,
et deux fiches de reflexes pour les gardiens. Elles servent les jours ou le
gymnase est partage, ou le materiel manque, ou le travail vise le physique et
non le jeu.

Les fiches gardiens se repartissent en deux familles :

- **Gardiens avec les joueurs** : les tireurs font partie de l'exercice.
- **Gardiens seuls** : les gardiens travaillent a l'ecart pendant que le groupe
  mene un exercice qui ne demande pas de but. Ces fiches sont marquees
  « en parallele », et leur duree ne s'ajoute pas au temps total de la seance :
  le decompte de la seance reste juste.

Choisir une fiche en ajoute une **copie independante** a la seance. L'adapter
pour un soir ne touche jamais au modele, et les seances passees gardent la
version avec laquelle elles ont ete jouees. Quand une modification merite d'etre
conservee, le bouton « Vers la bibliotheque » met le modele a jour.

## Les combinaisons nommees

Certaines fiches ne decrivent pas un exercice a repeter, mais un
**enchainement qui porte un nom** : l'Espagnole, le double croise, le Pondus.
Sur le terrain on dit « on joue l'Espagnole », et la bibliotheque doit donc la
retrouver sous ce nom-la.

La puce **Combinaisons**, en bas des filtres, ne montre plus qu'elles. Comme
« Avec animation » et « Sans ballon », elle s'ajoute aux autres au lieu de les
remplacer.

Trois regles tiennent ces fiches :

- **Le nom ouvre le titre**, la description suit : « Espagnole — croise
  central ». La recherche trouve alors le nom parle, et la suite du titre
  explique de quoi il s'agit a celui qui ne le connait pas.
- **Les variantes ne font pas des fiches.** Une combinaison en a souvent trois
  ou quatre. Elles vont dans « Evolution » : autant de fiches quasi identiques
  noieraient la bibliotheque et scinderaient les compteurs d'utilisation.
- **Le schema est refait ici.** Un enchainement tactique — qui court ou, qui
  passe a qui — est un fait de handball, pas une oeuvre. Les positions, les
  temps de jeu et les textes sont ecrits pour cette application ; la provenance
  de l'idee est citee dans la fiche.

## Partager des seances et des exercices

- `Exporter la seance` produit un fichier `.hbt.json` contenant toute la seance.
- L'icone ⇩ sur une ligne d'exercice exporte cet exercice seul.
- `Importer` relit un fichier `.hbt.json`, qu'il contienne une seance ou un
  exercice isole.

A l'import, tous les identifiants sont regeneres : importer deux fois le meme
fichier cree deux copies independantes, sans jamais ecraser un exercice existant.

## Partager cette notice

Le bouton **Notice**, en haut a droite de l'application, ouvre ce document dans
une fenetre a part : on garde la seance sous les yeux d'un cote, la notice de
l'autre. La notice est embarquee dans l'application, pas lue a cote d'elle :
elle fonctionne donc meme si le fichier a ete copie seul sur une cle USB. Si le
navigateur bloque les fenetres surgissantes, un bandeau le signale.

Le meme document existe aussi en fichier separe, `LISEZMOI.html`, livre a cote
de l'application.

C'est un fichier unique et autonome, comme l'application : styles et ecusson
sont dedans, il n'appelle rien depuis internet. **Joignez-le a votre message**
et le destinataire double-clique dessus, sans rien installer.

Ne collez pas son contenu dans le corps d'un courriel : beaucoup de messageries
suppriment la feuille de styles et il ne resterait que du texte brut. Le fichier
en piece jointe, lui, garde sa mise en page partout. Il s'imprime aussi
proprement en A4, si une notice papier est plus commode.

### Refabriquer la notice
<!-- notice:developpeur -->

La page est refabriquee a partir de ce fichier `LISEZMOI.md` a chaque
`npm run build`, ou seule avec `npm run notice` : les deux ne peuvent donc pas
diverger. Le build l'appelle en deux temps — avant le bundle pour la version
embarquee, apres pour la copie a joindre, parce que Vite vide `dist/` au
passage.

La version HTML ne reprend que les sections d'utilisation : les parties
marquees `<!-- notice:developpeur -->` en sont retirees.

Une marque `<!-- notice:capture nom -->` posee sous un titre y insere la capture
d'ecran correspondante, prise dans l'application elle-meme. Ces captures ne vont
QUE dans le fichier a joindre : la notice ouverte depuis l'application s'en
passe, celui qui la lit ayant l'application sous les yeux. Cela evite aussi de
faire grossir le fichier unique de plusieurs centaines de kilo-octets pour lui
montrer ce qu'il est en train de regarder.

Les captures sont mises en cache : elles ne sont refaites que si
`dist/index.html` est plus recent qu'elles.

## Raccourcis clavier

| Touche | Effet |
| --- | --- |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` ou `Ctrl+Maj+Z` | Retablir |
| `Suppr` | Retirer le jeton ou le trace selectionne |
| `Echap` | Deselectionner, puis quitter le plein ecran |
| `←` `→` | Deplacer le separateur, une fois qu'il a le focus |
| `Origine` | Remettre le separateur a sa position par defaut |

## Largeur du schema

La barre verticale qui separe le schema de terrain du texte de l'exercice se
deplace a la souris. Un double-clic dessus revient a la position par defaut.

La position choisie est retenue d'une seance a l'autre. Elle est enregistree a
part du reste, dans le navigateur : c'est une preference d'affichage liee au
poste de travail, elle ne part donc pas dans les fichiers `.hbt.json` exportes.

Chaque colonne porte aussi un bouton d'agrandissement, en haut a droite : le
terrain, ou le texte, occupe alors toute la largeur. Pratique pour tracer au
large, ou pour rediger un deroulement sans un terrain qui prend la moitie de
l'ecran. `Echap` revient a deux colonnes, comme le meme bouton. Ce mode n'est
volontairement pas memorise : c'est une facon de travailler sur le moment, pas
un reglage.

Chaque colonne garde une largeur minimale, et sous 1240 pixels de large les
deux colonnes s'empilent : le separateur disparait alors, il n'a plus d'objet.

## La trame de la fiche

La fiche reprend la trame utilisee par l'entraineur, dans son ordre :

| Rubrique | Ce qu'on y met |
| --- | --- |
| Objectifs | Ce que les joueurs doivent progresser |
| **Forme d'intervention** | Approche inductive, consigne directe, couverture d'un poste... |
| **Mise en place** | Espaces a delimiter, colonnes, materiel a poser |
| **Fonctionnement** | Comment la situation se deroule une fois lancee |
| **Regulation** | Les regles et contraintes imposees et ajustees en cours, baremes de points compris |
| Points cles | Ce que l'entraineur observe et corrige |
| **Evolution** | Simplifier, complexifier, faire evoluer |

« Regulation » et « Points cles » sont bien deux choses differentes : la
premiere releve de la regle, la seconde de l'observation. Une rubrique laissee
vide ne s'imprime pas.

Les fichiers ecrits avant cette trame restent lisibles : « Deroulement » devient
« Fonctionnement », « Variantes » devient « Evolution », et les trois nouvelles
rubriques naissent vides. Le format d'echange passe en **version 2**.

## La fiche signaletique

Categorie, duree, effectif, difficulte et role des gardiens forment un petit
bloc en haut du detail. Ces valeurs se reglent a la creation de l'exercice et se
consultent ensuite : le titre **Detail de l'exercice** est un bouton qui les
replie.

Repliees, elles laissent un resume d'une seule ligne — « Attaque · 20 min ·
12 joueurs + 2 GB » — et rendent plus de deux cents pixels a la zone de
redaction, qui est le vrai espace de travail. Le choix est memorise.

Les trois nombres sont regroupes et portent leur unite au lieu d'une etiquette
en capitales, et les intitules du role des gardiens ne repetent plus le mot
« gardiens » : ils debordaient de la liste deroulante.

## Petits ecrans

L'application est concue pour rester confortable sur un portable de 13 pouces
et sur une tablette de 11 ou 13 pouces.

**Le terrain est l'element elastique.** Les commandes prennent la hauteur qu'il
leur faut, le schema occupe tout le reste, avec un plancher en dessous duquel il
ne descend pas. Changer de vue ne bouscule donc plus la mise en page : le
schema se centre dans sa boite au lieu d'imposer sa hauteur.

**Une seule barre d'outils**, qui ne se replie jamais : les vues, les outils de
trace en bande defilante, puis annuler / retablir et un menu ⋯ regroupant les
actions secondaires (aimantation, symetrie, export image, propositions,
redaction, plein ecran).

**La palette est un bouton « + Ajouter »** qui ouvre le choix des elements, au
lieu d'occuper deux rangees en permanence pour un geste qu'on fait quelques fois
par fiche.

**Le cote a cote tient jusqu'a 900 pixels.** En dessous seulement, la fiche
s'empile.

Mesures avant et apres, sur la colonne du schema :

| | Avant | Apres |
| --- | --- | --- |
| Hauteur necessaire sur un ecran de 720 px | 840 px | **649 px** |
| Part de la colonne occupee par le terrain | 31 % | **50 %** |
| Barre d'etapes sur un 13 pouces | hors ecran | **visible** |
| Tablette 11 pouces en paysage | une colonne, texte a y=1011 | **deux colonnes, 500 / 419** |

Les cibles tactiles restent a 44 pixels minimum : c'est le NOMBRE de commandes
affichees en permanence qui a diminue, pas leur taille. Au bord d'un terrain,
avec les mains froides, un bouton trop petit est une erreur de manipulation.

## Sur tablette

L'application est utilisable au doigt. Sur un ecran tactile, les commandes
passent a 44 pixels au minimum, les champs a 16 pixels de texte — en deca, iOS
zoome a chaque saisie — et la zone de prise d'un jeton s'elargit, un doigt etant
moins precis qu'un curseur.

Le terrain ne fait jamais defiler la page pendant un glisser, et le double tape
ne declenche pas de zoom. La fiche passe en une seule colonne des que la largeur
descend sous 1240 pixels.

## Developpement
<!-- notice:developpeur -->

### La page de presentation

`npm run presentation` produit `dist/PRESENTATION.html` : ce que fait le
logiciel, en images, pour un entraineur qui ne l'a jamais ouvert. Fichier
unique d'environ un mega-octet, qui passe en piece jointe.

Les captures ne sont pas des maquettes. `outils/captures.mjs` amorce des
seances realistes dans localStorage, conduit le vrai `dist/index.html` jusqu'a
l'ecran voulu, et laisse Chrome photographier. Une presentation qui montrerait
autre chose que le logiciel se ferait demasquer a la premiere ouverture.

Deux details rendent la chose possible : le script amorce est un script
CLASSIQUE, donc execute avant le script module de l'application, qui est
differe ; et `--run-all-compositor-stages-before-draw` force le repeint, sans
quoi Chrome photographie parfois l'image precedente.

A relancer APRES `npm run build` : Vite vide `dist/` et emporte la page avec.

### Test de l'interface

`tests/interface.test.mjs` charge `dist/index.html` dans le Chrome de la
machine, cree une seance, ouvre une fiche, et verifie que les commandes
essentielles repondent : plein ecran des deux colonnes, separateur, menu
deroulant entierement visible.

Il existe parce que les autres tests ne pouvaient pas voir la panne qui l'a
motive : le plein ecran du terrain avait ete deplace dans un menu deroulant
lui-meme rogne par le defilement de sa colonne, et `npm run verifier` restait
vert. Des fonctions pures ne disent rien de l'atteignabilite d'un bouton.

Le test passe si Chrome est introuvable, pour ne pas bloquer une machine qui
n'en a pas. Il porte sur `dist/`, donc apres `npm run build` - ce que
`npm run verifier` enchaine.


```
npm install
npm run dev        # serveur de developpement
npm run build      # produit le fichier unique dist/index.html
npm test           # test de l'aller-retour export / import
npm run verifier   # build + tests
```

### Reference des fiches fournies

Chaque fiche livree porte une `ref` : un identifiant en minuscules, derive du
titre a sa creation puis **fige**. Le titre, lui, peut etre corrige.

C'est la ref, jamais le titre, qui identifie une fiche. Un favori, un historique
d'utilisation ou un bilan accroches a un titre disparaitraient silencieusement
au premier renommage - et un titre finit toujours par etre renomme.

`tests/references-connues.txt` inventorie les references existantes, et
`tests/catalogue.test.mjs` echoue si l'une d'elles disparait. Retirer une fiche
reste possible : il faut alors retirer aussi sa ligne de l'inventaire, ce qui
rend la decision explicite dans la revue plutot qu'invisible dans un diff.

### La lecture des fichiers est une liste blanche

`lireExercice`, dans `src/domain/echange.ts`, reconstruit chaque exercice champ
par champ. Un champ absent de cette fonction **est efface a chaque relecture**,
sans erreur ni message, meme s'il figure dans le fichier.

C'est une bonne chose - un fichier venu de l'exterieur ne peut pas injecter ce
qu'il veut - mais c'est un piege pour qui ajoute un champ. `refModele` est
tombe dedans : pose a la construction, il disparaissait au premier rechargement,
et les compteurs d'utilisation retombaient a zero sans raison apparente.

**Tout nouveau champ d'`Exercice` ou de `Seance` doit donc etre ajoute la**, et
un test de `tests/echange.test.mjs` verifie qu'il survit a l'aller-retour.

### Organisation

| Dossier | Role |
| --- | --- |
| `src/domain` | Modele de donnees, mouvements, format d'echange. Aucune dependance a React. |
| `src/terrain` | Geometrie du terrain et rendu SVG des schemas. |
| `src/bibliotheque` | Fiches fournies avec l'application et leur selection. |
| `src/impression` | Calcul de la mise en page des fiches imprimees. |
| `src/storage` | Depots de persistance et choix du depot au demarrage. |
| `src/platform` | Acces fichiers, isole derriere une interface. |
| `src/ui` | Composants React et etat de l'application. |

### Ecusson

Le logo affiche dans l'entete est une **reproduction vectorielle** de l'ecusson
du club, redessinee a la main (`src/ui/LogoHbpsm.tsx`) : disque bleu marine,
but, joueur en suspension, ballon et le millesime 1983. La silhouette et les
lettrages sont approches, ce n'est pas le fichier officiel.

Pour le remplacer par le vrai ecusson : deposer le fichier dans `src/ui/` et
echanger le corps de ce composant contre une balise `<img>`. C'est le seul
endroit a modifier, et `assetsInlineLimit` (dans `vite.config.ts`) est deja
regle pour embarquer l'image en base64 dans le fichier unique hors ligne.

### Couleurs

L'interface reprend les couleurs du club, le jaune et le bleu. Le bleu profond
porte la structure (entete, boutons d'action, titres) parce qu'il garde un
contraste suffisant sur fond clair ; le jaune sert d'accent, sur les elements
actifs et les reperes, toujours associe a du texte bleu fonce. Du texte clair
sur jaune serait illisible, et n'est utilise nulle part.

Sur le terrain, la meme logique s'applique aux jetons : l'attaque porte le
jaune, la defense le bleu, le gardien le vert, comme sur un maillot. Les formes
different aussi (rond, triangle, carre) pour que le schema reste lisible
imprime en noir et blanc.

Un joueur est un **disque a la couleur du camp, avec deux bras tendus vers
l'avant** qui disent ou il regarde, et une **pastille centrale** qui porte son
etiquette. Trois raisons a ce dessin plutot qu'a une silhouette detaillee :

- le disque garde le meme contour quel que soit l'angle, alors qu'une
  silhouette change de forme en tournant ;
- la pastille occupe presque tout le corps, donc une etiquette de trois lettres
  (`AlG`, `PIV`) reste lisible - ce qui n'etait pas le cas avant ;
- le corps ne fait que 0,82 du rayon de reference, assez etroit pour que six
  defenseurs espaces de deux metres ne se chevauchent plus.

Le fond de la pastille est une teinte CLAIRE du maillot, pas du blanc : le camp
se lit jusque dans la pastille au lieu que celle-ci coupe le jeton en deux. Le
texte y est toujours bleu fonce, mesure entre 10,3 et 12,6 de contraste selon
la couleur.

Deux principes structurent le code :

- **Les coordonnees du terrain sont en metres**, pas en pixels, avec pour origine
  le coin bas gauche d'un terrain de 40 m x 20 m. Un schema peut ainsi changer de
  vue (demi-terrain, terrain complet, zone) et s'imprimer a n'importe quelle
  taille sans deformation.
- **Les jetons sont des entites persistantes entre les etapes.** Une etape ne
  stocke que les nouvelles positions des memes jetons. Le deplacement d'un joueur
  d'une etape a l'autre peut donc etre trace et anime automatiquement.
- **Une fleche liee a un jeton ne stocke pas ses extremites.** Son depart est la
  position du jeton a l'etape, son arrivee sa position a l'etape suivante
  (`src/domain/mouvement.ts`). C'est ce qui rend le lien bidirectionnel gratuit :
  il n'y a qu'une donnee, donc rien a synchroniser. De meme, l'orientation n'est
  enregistree que si l'entraineur l'impose ; sinon elle se calcule.

`src/storage` et `src/platform` passent par des interfaces (`Depot`,
`AdaptateurFichiers`) afin qu'une future version bureau (Tauri) n'ait qu'a
fournir de nouvelles implementations, sans toucher aux composants.

## Etat d'avancement
<!-- notice:developpeur -->

- [x] **Etape 1** — socle : fichier unique, sauvegarde automatique, liste des
      seances et des exercices, export / import `.hbt.json`.
- [x] **Etape 2** — terrain SVG aux cotes officielles, trois vues, jetons
      deplaçables, annuler / retablir, fiche detaillee, notation des exercices,
      bibliotheque fournie.
- [x] **Etape 3** — joueurs vus de dessus et orientables a 360°, fleches de
      mouvement, etapes successives, lecture animee, impression A4 paysage,
      effectif de la seance, bibliotheque personnelle, menu repliable.
- [ ] **Etape 4** — export PNG d'un schema, usage tablette au doigt.
- [x] **Etape 5** — page d'accueil listant toutes les seances avec leur resume,
      recherche, tri, et duplication vers une autre date et un autre effectif.
- [x] **Etape 6** — la fleche definit la position suivante, le ballon suit son
      porteur, l'orientation se deduit.
- [x] **Etape 7** — aimantation sur les postes et les lignes, symetrie d'un
      exercice, deroulement redige automatiquement a partir du schema.
- [x] **Etape 8** — bilan de la saison, export PNG d'un schema, usage tablette
      au doigt.
