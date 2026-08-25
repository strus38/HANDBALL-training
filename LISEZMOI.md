# Handball — Préparation de séances

Application de préparation d'entraînements de handball : chaque exercice est une
fiche autonome, avec à terme un schéma de terrain à gauche et le détail de
l'exercice à droite.

Elle fonctionne **entièrement hors ligne**, sans installation et sans compte.

## Utiliser l'application

Le livrable est un fichier unique : `index.html` (produit dans le dossier
`dist/`).

1. Copiez ce fichier où vous voulez (bureau, clé USB, dossier partagé).
2. Double-cliquez dessus : il s'ouvre dans votre navigateur.
3. C'est tout. Aucune connexion internet n'est nécessaire.

Pour le partager avec un autre entraîneur, envoyez-lui simplement ce fichier.

### Recevoir une nouvelle version sans perdre son travail

Les séances déjà créées ne contiennent aucune information d'apparence : elles
enregistrent le TYPE de chaque jeton et sa position, jamais son dessin. Une
nouvelle version du fichier redessine donc l'ancien travail avec le nouveau
dessin, sans conversion ni manipulation.

Concrètement, sur le même ordinateur et dans le même navigateur, le travail est
retrouvé que l'on écrase l'ancien `index.html`, qu'on ouvre le nouveau depuis un
autre dossier, ou depuis une clé USB : les trois cas ont été vérifiés.

Deux limites : changer de NAVIGATEUR revient à repartir de zéro, le stockage
étant propre à chacun ; et ce comportement a été constaté sur Chrome, d'autres
navigateurs pouvant cloisonner différemment les fichiers ouverts depuis le
disque. Dans le doute, **Sauvegarder tout** avant, restaurer après : cette route
fonctionne partout.

### Depuis une clé USB

Oui, et sans rien installer : posez `index.html` sur la clé, double-cliquez.
L'application démarre et la sauvegarde automatique fonctionne — sous une forme
allégée, annoncée en haut à droite par **Sauvegarde simplifiée**. Un ordinateur
n'accorde pas à un fichier ouvert depuis le disque le même stockage qu'à un site
web ; l'application le détecte et prend le stockage de secours. Environ 240
séances y tiennent, soit plusieurs saisons.

**Mais le travail ne voyage pas avec la clé.** La clé transporte l'application ;
les séances, elles, restent dans le navigateur de l'ordinateur où vous avez
travaillé. Branchez la même clé sur un autre poste : l'application s'ouvre,
vide.

Pour emporter votre travail, posez sur la clé, à côté de `index.html`, le
fichier produit par **Sauvegarder tout**. Sur l'autre poste, ouvrez
l'application et restaurez-le.

## Mettre son travail à l'abri

Le bouton **Sauvegarder tout**, sur la page d'accueil, enregistre dans un seul
fichier toutes vos séances **et** votre bibliothèque personnelle. C'est la seule
copie transportable de votre travail.

Le stockage du navigateur est lié à cette machine et à ce navigateur : un
nettoyage des données de navigation efface tout, sans recours. Conservez le
fichier de sauvegarde ailleurs — clé USB, courriel, dossier partagé.

Restaurer une sauvegarde **ajoute** son contenu à ce qui est déjà là : rien
n'est jamais écrasé. Restaurer sur une machine vierge redonne le classeur
complet ; restaurer par-dessus un travail en cours ne le détruit pas.

## Confirmations et sauvegarde

Aucune fenêtre native du navigateur n'est utilisée. Les demandes de
confirmation sont des boites de l'application : mêmes couleurs, même
vocabulaire, même apparence quel que soit le navigateur.

Sur une action destructrice, le bouton par défaut est **Annuler** : une
validation au clavier par réflexe ne détruit rien. `Echap` ferme, un clic à
côté ferme, et le focus revient ensuite là où il était.

## Sauvegarde

Le travail est enregistré automatiquement dans le navigateur, sans rien cliquer.
L'indicateur en haut à droite affiche l'état de l'enregistrement.

Quand l'onglet se ferme ou passe en arrière-plan, les modifications encore en
attente sont écrites immédiatement. L'application ne demande donc jamais
« voulez-vous vraiment quitter ? » : elle enregistre, ce qui vaut mieux que
prévenir.

Selon le navigateur et la manière d'ouvrir le fichier, le stockage utilisé est
IndexedDB, ou à défaut localStorage. Si aucun des deux n'est autorisé, un
bandeau jaune prévient que le travail sera perdu à la fermeture.

« Sauvegarder tout » emporte les séances, votre bibliothèque personnelle, vos
favoris, les fiches fournies que vous avez masquées et votre équipe : tout ce
qu'un nettoyage du navigateur effacerait. Restaurer **ajoute** ce contenu sans
rien écraser — et ne remplace votre équipe que si cette machine n'en a pas.

**Dans tous les cas, la sauvegarde de référence reste le fichier exporté.**
Le stockage du navigateur est lié à la machine et au navigateur utilisés : il
n'est pas transportable et peut être effacé par un nettoyage du navigateur.

## Vue d'ensemble des séances
<!-- notice:capture accueil -->

L'application s'ouvre sur **Mes séances** : toutes les séances enregistrées,
chacune résumée sur une carte.

Le menu des séances, à gauche, se replie : le bouton `⟨⟨` en haut du menu le
referme, celui de l'entête `☰` le rouvre. Replie, il laisse toute la largeur au
terrain et à la fiche, ce qui est confortable sur un petit écran ou lors d'un
long travail de tracé.

Chaque carte donne, sans avoir à ouvrir la séance :

- la date en toutes lettres, située dans le temps (« aujourd'hui », « dans 2
  semaines », « il y a 3 jours ») ;
- la durée, le nombre d'exercices et l'effectif prévu ;
- la **répartition du temps par catégorie**, en barre proportionnelle : on voit
  d'un coup d'oeil une séance trop chargée en attaque ou sans échauffement ;
- la note moyenne des exercices évalués ;
- les signaux utiles : travail spécifique des gardiens, exercices menés en
  parallèle, et exercices demandant plus de monde que l'effectif annoncé.

Les séances passées restent listées, sur un fond légèrement différent. La
recherche porte sur le titre, l'équipe, l'objectif et le **titre des exercices** :
retrouver « la séance où on avait travaillé le croisé » fonctionne.

### Dupliquer une séance

Le bouton **Dupliquer** de chaque carte ouvre un formulaire pré-rempli : le
titre, la date proposée une semaine plus tard, l'effectif et l'espace
disponible. C'est la manière normale de rejouer une séance qui a bien marché. L'équipe n'y est pas
redemandée : la copie reprend celle de l'originale.

La copie est **totalement indépendante** : la modifier ne touche jamais
l'originale, qui garde la version avec laquelle elle a été jouée.

Par défaut, la copie conserve vos notes et vos compteurs d'utilisation : ils
portent sur l'exercice, pas sur la date à laquelle il a été mené. Une case
permet de repartir sans eux.

## Dessiner un exercice
<!-- notice:capture terrain -->

Le schéma se construit à gauche de la fiche.

**Placer les joueurs.** Cliquez un élément de la palette, puis faites-le glisser
sur le terrain. Les joueurs sont vus de dessus, épaules et bras vers l'avant :
on voit ou ils regardent et de quel côté ils peuvent recevoir. Le numéro reste
toujours à l'endroit, même quand le joueur regarde vers le bas du terrain.

**Le ballon suit son porteur.** L'application considère qu'un joueur a le ballon
dès qu'il en est proche. Quand ce joueur court ou dribble, le ballon part avec
lui : vous n'avez plus à le replacer à chaque étape. Une passe le transmet au
joueur visé, qui devient porteur à son tour.

**L'orientation se déduit.** Un joueur qui court regarde où il va ; les autres
regardent le ballon ; celui qui l'a en main regarde le but. Vous n'avez plus à
tourner personne à la main. La poignée jaune et le curseur restent disponibles
quand vous voulez décider vous-même : l'orientation devient alors la vôtre, et
l'automatisme ne la reprend plus. Le bouton « ↺ auto » rend la main à
l'application.

**Tracer les mouvements.** Choisissez un type de trait dans la barre d'outils,
puis tirez du point de départ vers l'arrivée.

La flèche n'est pas un dessin : **elle EST le déplacement**. Tracer une course
depuis un joueur le place à l'étape suivante, au bout de la flèche — et crée
cette étape si elle n'existe pas encore. Vous ne decrivez jamais deux fois le
même mouvement.

Le lien fonctionne dans les deux sens : déplacer le joueur à l'étape suivante
rallonge la flèche de l'étape courante. Ce ne sont pas deux données
synchronisées, c'est la même donnee vue de deux facons — elles ne peuvent pas
se contredire. Effacer la flèche remet le joueur immobile.

| Ce que vous tracez | Qui se déplace | Ou il se retrouve à l'étape suivante |
| --- | --- | --- |
| Course | Le joueur | Au bout de la flèche |
| Dribble | Le joueur et le ballon | Au bout de la flèche, ballon en main |
| Passe | Le ballon seul | Chez le joueur vise, qui devient porteur |
| Tir | Le ballon seul | La ou vous l'avez lâche ; personne ne bouge |
| Écran | Le joueur qui bloque | Au bout de la flèche, et il y reste |
| Rotation | **Personne** | Rien ne bouge : c'est une règle, pas une action |

Une flèche tracee dans le vide, sans joueur au départ, reste une simple
illustration : elle garde ses extrémités et ne déplace personne.

Une fois sélectionnée, le point du milieu permet de courber le trace. Chaque
trace porte son numéro d'ordre, repris dans le déroulement rédige.

**Aimantation.** Le geste reste approximatif, l'application est précise. Un
joueur lâche près d'un repère connu s'y accroche, et le repère s'affiche
pendant le glisser :

- les six **postes d'attaque** (ailiers, arrières, demi-centre, pivot) ;
- les lignes de **6 m** et de **9 m**, y compris sur leurs arcs ;
- l'**axe** du terrain.

Le bouton 🧲 la désactive, et la touche **Alt** la neutralise le temps d'un
geste quand vous voulez viser librement.

### Les colonnes, et ce qui se passe après le tir

L'organisation la plus fréquente du handball est la **file d'attente** : le
groupe attend, passe un par un, et le joueur qui vient de tirer repart au fond
de la colonne. Deux outils la dessinent.

**Le jeton « Colonne »** figure le groupe entier : le premier de la file est
plein, les suivants s'estompent derrière lui. Son étiquette dit combien ils
sont — « ×4 » par défaut, à corriger. C'est un jeton comme les autres : il se
déplace, il s'oriente, et il occupe au schéma la place qu'une colonne occupe au
sol. Douze jetons alignés faisaient croire à douze joueurs actifs en même temps.

**La flèche « Rotation »** dit ce qui se passe après : trait fin en tirets,
pointe ouverte, dans un gris qui la met au second plan. Elle ne décrit pas une
action de l'exercice mais sa **règle de fonctionnement**, et c'est pour cela
qu'elle est la seule flèche qui **ne déplace personne** et ne crée aucune
étape. Le déroulement rédigé la reprend en toutes lettres : « Chacun retourne
ensuite au fond de la colonne. »

### Zones coloriées

L'outil **Zone** délimite un rectangle : zone de marque, secteur interdit,
espace de jeu réduit. Tirez d'un coin à l'autre — dans le sens que vous voulez.

Une zone se pose **en transparence** : les lignes officielles du terrain restent
visibles au travers, et la surface des 6 m ne disparaît pas sous un aplat. Cinq
teintes sont proposées, pas un nuancier libre : le choix libre produit des
schémas qui jurent d'une fiche à l'autre, et des zones illisibles une fois
imprimées. Un libellé posé au centre nomme la zone quand la couleur ne suffit
pas.

Une fois sélectionnée, faites glisser la zone pour la déplacer, et le carré
jaune de son coin pour la redimensionner. Elle s'accroche aux mêmes repères que
les joueurs — une zone de marque commence presque toujours sur la ligne des 9 m.

### Textes posés sur le terrain

L'outil **Texte** écrit un mot là où il se lit : « Défense 6-0 », « départ au
signal », « 3 ballons ici ». Cliquez à l'endroit voulu, puis écrivez dans le
panneau de gauche. Le texte se déplace ensuite d'un glisser.

Ce sont des précisions qui **appartiennent à un endroit du terrain**, et que la
consigne écrite sous le schéma ne peut pas viser. Chaque texte est cerné d'un
halo à la couleur du terrain : il reste lisible par-dessus une zone coloriée
comme par-dessus une ligne.

**Zones et textes appartiennent au schéma, pas à l'étape.** C'est de la mise en
place : tracés à l'étape 1, ils sont encore là à l'étape 4, où l'on en a encore
besoin. La symétrie les emmène avec le reste, et l'export en image aussi.

**Symétrie.** Le bouton ⇅ rejoue tout l'exercice de l'autre côté : positions,
orientations et traces sont reflechis, et les étiquettes de poste echangees
(un ailier gauche devient ailier droit). Le handball est symétrique, c'est la
moitié du travail en moins. L'opération s'annule par Ctrl+Z.

**Mouvements proposes depuis le texte.** Le bouton ⤳ fait le chemin inverse :
il lit le déroulement que vous avez écrit et propose les mouvements
correspondants. Un écran d'aperçu montre chaque action lue, la phrase dont elle
vient, et **son niveau de confiance** avant que rien ne soit applique.

Sa justesse a été mesurée sur les onze fiches dont la chorégraphie a été écrite
à la main, en lui donnant leur seul texte :

| Mesure | Résultat |
| --- | --- |
| Actions proposées avec le bon joueur | 100 % |
| Dont le bon type de trace | 64 % |
| Mouvements retrouves, textes exploitables | 28 % |
| Mouvements retrouves, sur les onze fiches | 15 % |
| Écart moyen de la destination | 3 m |

Autrement dit : **il ne se trompe jamais de joueur, mais il en oublie beaucoup**,
et il place le point d'arrivée à trois mètres près. C'est un point de départ à
corriger, pas un schéma fini.

Cinq des onze fiches ne donnent rien du tout, et c'est normal : leur texte
décrit une organisation (« séries de trois attaques », « le bloc glisse en
restant groupe ») et non une chorégraphie. Le mouvement n'y est pas écrit, aucun
analyseur ne pourrait l'y trouver. Pour qu'un texte soit lisible, il faut nommer
les postes et les actions : « l'arrière droit part en course à 9 mètres, puis
passe à l'ailier droit ».

**Déroulement rédige.** Le bouton ✎ écrit le déroulement à partir du schéma :
« ArD part en course à 9 m côté droit. ArD passe à AlD. AlD tire de l'aile. »
Chaque étape reçoit aussi sa consigne. C'est une proposition, a relire et a
retoucher : un texte déjà saisi n'est jamais remplace sans votre accord.

| Trait | Signification |
| --- | --- |
| Plein | Course du joueur |
| Pointille | Passe |
| Ondule | Dribble |
| Double, rouge | Tir |
| Barre en T | Écran, blocage |

**Décomposer en étapes.** Le bouton « + Étape » crée une étape à partir des
positions de la précédente : il n'y a que ce qui bouge a déplacer. Les positions
de l'étape précédente restent visibles en transparence.

**Montrer le mouvement.** « Lire » anime le passage d'une étape à l'autre :
les joueurs glissent et pivotent vers leur position suivante. C'est ce qui rend
les étapes utiles devant un groupe — au lieu de décrire le mouvement, on le
montre.

Pendant la lecture, la **puce de l'étape s'allume au rythme de l'animation** :
elle reste sur l'étape de départ tant que les joueurs se deplacent, et passe à
la suivante des qu'ils s'y posent. On sait donc toujours quel temps de jeu on
regarde.

« **Pause** » fige l'image sans perdre l'endroit, et « Reprendre » repart
exactement de la. C'est ce qui permet d'arrêter le mouvement au moment précis
ou l'on veut commenter un placement, puis de laisser filer la suite. « ■ »
arrête la lecture et rend la main à l'edition.

### Fiches chorégraphiées

Quinze des 62 fiches livrées decrivent un **enchaînement complet**, étape par
étape : croise arrière-ailier, passe et va, écran du pivot, renversement en
trois passes, attaque à deux pivots, supériorité et infériorité numérique,
glissement 6-0, 5-1, 3-2-1, contre-attaque directe. Sur celles-la, le bouton
« Lire » anime réellement le mouvement et l'impression sort plusieurs schémas.

Les quarante-sept autres — circuits, gammes, matchs à thème, jeu en continu, fiches
gardien — restent volontairement à une seule mise en place. Elles decrivent une
**organisation ou une répétition**, pas une chorégraphie : leur imposer une
animation figee donnerait une fausse idée de ce qu'elles sont.

Les mouvements de ces fiches sont declares comme des intentions (« l'arrière
droit court vers tel point, puis passe à l'ailier ») et construits par le même
moteur que le trace d'un entraîneur à la souris. Positions, ballon qui suit et
orientations en decoulent, au lieu d'être recopies à la main dans les données.

## Dicter plutôt qu'écrire

Remplir un « Déroulement » de dix lignes au clavier decourage. Deux chemins
existent, et ils ne se valent pas.

### Coller un texte dicte sur son téléphone — la voie fiable

<!-- notice:capture collage -->

Le bouton **« Coller un texte dicte »**, en haut du détail de l'exercice.

Dictez dans les notes de votre téléphone, puis collez le texte avec Ctrl+V.
C'est la meilleure option et de loin : la dictee d'un téléphone tourne **sur
l'appareil**, elle fonctionne **sans connexion** — donc dans un gymnase — elle
est gratuite, et elle connait le français bien mieux que ce qu'un navigateur
saurait faire tourner hors ligne.

Si vous dictez les intitules — « mise en place », « déroulement », « points
clés », « variantes » — le texte se range tout seul dans les bons champs. La
fenêtre annonce **avant d'appliquer** ou chaque partie va atterrir.

Sans intitule reconnu, tout part dans le fonctionnement, d'un bloc.
**L'application ne devine pas** : un paragraphe range au jugement se retrouve
là où personne ne le cherche, et l'on croit avoir perdu sa dictee. Un bloc dans
un seul champ se recoupe d'un copier-coller ; un texte eparpille, non.

Le texte colle **s'ajoute** a ce qui est déjà écrit, il ne le remplace jamais.

### Le micro à côté des champs — un complément, là où il marche

Un bouton 🎤 apparait à droite de l'étiquette des champs de texte : ceux de la
fiche, l'**objectif de la séance**, et le retour d'après-séance. Il dicte
directement dans le champ, phrase par phrase, chacune sur sa ligne.

Deux champs tiennent sur **une seule ligne** — la **consigne d'une étape** et la
**forme d'intervention**. Les phrases dictees s'y suivent séparées d'une espace :
un retour à la ligne y serait invisible à l'écran, mais ressortirait a
l'impression et en mode terrain comme une coupure au milieu d'une phrase.

**Il exige une connexion internet.** La reconnaissance vocale du navigateur
envoie l'audio à un service en ligne : elle ne fonctionne pas dans un gymnase
sans reseau. C'est une aide pour préparer sa séance chez soi, pas davantage, et
l'application le dit plutôt que de vous laisser parler trente secondes pour
rien.

Le bouton **n'apparait pas du tout** sur un navigateur qui ne sait pas
transcrire — Firefox, notamment. Un bouton grise à côté de chaque champ serait
un reproche permanent ; absent, il ne coûte rien.

La aussi, ce qui est reconnu **s'ajoute** au texte existant : une phrase mal
comprise ne peut pas effacer un paragraphe.

### Et après

Le fonctionnement n'est pas un champ comme les autres : c'est le seul que
l'application sache relire pour **proposer les déplacements sur le terrain**.
Une fois le déroulement en place, le menu ⋯ du terrain propose ce qu'il y
reconnaît. Dicter alimente donc directement le dessin.

## Mener la séance : le mode terrain

<!-- notice:capture mode-terrain -->

Le bouton **▶ Mode terrain**, au-dessus de la liste des exercices, affiche la
séance telle qu'on la mene : un exercice à la fois, en grand, sur toute la
largeur de l'écran. Les flèches ← et → du clavier changent d'exercice, la
touche Echap ferme.

**Le temps restant est calcule sur l'heure réelle.** L'horaire s'ancre au
moment ou vous ouvrez le mode terrain : chaque exercice reçoit un creneau, et
l'écran annonce ce qu'il reste sur celui en cours, l'heure de fin prévue, et
l'avance ou le retard.

C'est le point important : un minuteur qui repartirait a zéro à chaque exercice
afficherait toujours « 15 minutes disponibles », y compris quand la séance a
vingt minutes de retard et qu'il faudra sauter un atelier. Ici le retard
s'accumule et se voit **pendant que vous pouvez encore y faire quelque chose**.

L'heure de debut est retenue dans la séance : si la tablette se verrouille ou
que le navigateur se recharge au milieu de l'entraînement, vous retrouvez votre
horaire et non un chronomètre remis a zéro.

**Cocher « Marquer mene »** enregistre que l'exercice a bien été fait. Cette
case alimente les compteurs d'utilisation de la bibliothèque : ce que vous
cochez au gymnase se retrouve sous les fiches quand vous preparez la séance
suivante. Un exercice déjà marque à la main depuis sa fiche n'est pas compte
deux fois.

**Le temps réellement passe est mesure** et note à côté de la durée prévue,
quand vous passez à l'exercice suivant. Le plan n'est jamais modifie : la fiche
continue d'afficher « 15 min prévues » et ajoute « 22 min passees ». C'est la
comparaison des deux qui apprend quelque chose pour la fois d'après — écraser
le plan par la réalité l'effacerait.

### L'ordre des commandes d'une séance

La rangee au-dessus des exercices se lit **depuis la droite**, et suit la vie
d'une séance : on ajoute des exercices, on va en chercher dans la bibliothèque,
on mene la séance, on l'imprime, on la duplique pour la semaine suivante, on
l'exporte, et un jour on la supprime. Les commandes les plus utilisées se
trouvent ainsi au plus près du bouton principal, là où la main revient.

**Supprimer la séance** est à l'autre bout, derrière un separateur. Elle etait
auparavant coincee entre « Exporter » et « Bibliothèque » : la seule action
irréversible de la rangee se trouvait à un pixel des plus frequentes.

## Mon équipe

Un entraîneur suit **une** équipe. La question n'est donc posée qu'**une fois** :
le bouton de l'en-tête, à droite du numéro de version, ouvre « Mon équipe » et
demande le nom de l'équipe et la catégorie d'âge. Tant qu'elle n'est pas
renseignée, ce bouton est jaune.

Ensuite, chaque nouvelle séance naît avec cette équipe déjà inscrite, et chaque
feuille imprimée la porte dans son en-tête. Elle n'est **jamais redemandée** —
ni à la création d'une séance, ni à la duplication.

Les séances déjà écrites ne sont pas retouchées : elles gardent l'équipe avec
laquelle elles ont été menées. Changer d'équipe en janvier ne réécrit pas les
séances de novembre.

Le cas rare — un tournoi, un collègue remplacé — se règle dans la séance :
sous le titre et la date, le lien **« Autre équipe pour cette séance »** rouvre
les deux champs. Une séance qui porte alors une équipe différente de la vôtre
est signalée sur sa carte, et ses champs s'ouvrent d'emblée quand on l'ouvre —
c'est justement là qu'il y a quelque chose à voir. Un bouton **« Reprendre… »**
la ramène à votre équipe habituelle.

## Effectif de la séance

L'effectif, lui, **reste demandé à chaque séance** : il change réellement d'une
fois à l'autre. Le pré-remplir affirmerait une présence que personne n'a
comptée, et éteindrait des alertes à tort.

La séance porte le nombre de joueurs de champ et de gardiens presents ce
jour-la. Tout exercice qui demande plus de monde est alors signale, dans la
liste comme dans la fiche.

L'alerte informe, elle ne bloque pas : un entraîneur sait adapter un exercice a
deux joueurs près. Un effectif laisse vide ne déclenche aucune alerte, et un
exercice qui mobilise moins de monde que le groupe present n'est jamais signale.

## Espace de la séance

Jumeau de l'effectif, et bâti sur le même principe. Un mardi sur deux le gymnase
est partagé — avec le basket, avec une autre catégorie — et la moitié d'une
séance préparée sur terrain complet tombe à l'eau une fois sur place.

Chaque fiche déclare l'**espace nécessaire** : un quart de salle, un demi-terrain
ou le terrain complet. Chaque séance déclare l'**espace disponible** ce soir-là.
Les exercices qui demandent plus de place sont alors signalés, dans la liste de
la séance comme dans la fiche, exactement comme un manque d'effectif — et dans
le même bandeau quand les deux manquent à la fois.

Trois paliers plutôt qu'une surface en mètres carrés : c'est ainsi qu'un gymnase
se partage, et c'est la seule question à laquelle un entraîneur peut répondre
sans sortir un mètre.

Les 62 fiches livrées savent déjà la place qu'elles demandent, et **vos fiches
existantes aussi** : quand le champ manque, l'espace se déduit de la vue sur
laquelle le schéma est dessiné. Un exercice tracé sur terrain complet en demande
un ; un exercice tracé sur la zone 6 m / 9 m tient sur un quart de salle. Tout
déclarer « terrain complet » aurait noyé l'alerte sous les faux positifs.

## Imprimer

Une fiche tient sur une **page A4 en paysage**.

- Depuis une fiche, « Imprimer » sort cette fiche seule.
- Depuis la séance, « Imprimer la séance » sort une page par exercice, dans
  l'ordre de la séance.

### La disposition est calculée, pas fixee

La place du schéma depend de sa forme, et elle change d'un exercice à l'autre.

| Vue du schéma | Rapport | Disposition retenue |
| --- | --- | --- |
| Terrain complet | 1,9 — large et plat | Banniere en haut, texte en colonnes dessous |
| Demi-terrain | 1,0 — carre | Schéma à gauche, texte à droite |
| Zone 6m / 9m | 0,78 — vertical | Schéma à gauche, texte à droite |

Un terrain complet coince dans une colonne étroite n'utiliserait qu'un tiers de
la hauteur de la page. En banniere sur toute la largeur, il gagne près du double
de surface — d'ou le choix. Un schéma carre ou vertical, lui, n'a rien a y
gagner : il reste en colonne, et le texte garde des lignes confortables.

Le calcul essaie toutes les combinaisons de disposition, de répartition, de
nombre de colonnes et de taille de police, ecarte celles ou le texte déborde, et
retient celle qui donne le **plus grand schéma**. A surface comparable, il
préfère la police la plus lisible. Une fiche très bavarde fait donc reculer le
schéma et resserrer le texte, jamais déborder sur une deuxième page.

Un exercice a plusieurs étapes voit ses schémas imprimes en grille, jusqu'a
quatre. L'arrangement suit la même logique : deux terrains complets sont
empiles, deux vues de zone sont mises côte à côte. Au dela de quatre étapes, les
suivantes restent décrites en texte.

Pensez a activer les **couleurs d'arrière-plan** dans la boite de dialogue
d'impression du navigateur si le terrain sort en blanc.

### Exporter un schéma en image

Le bouton 🖼 de la fiche enregistre le schéma de l'étape affichée en **PNG**,
sur fond blanc et en pleine resolution — de quoi le coller dans un message, un
document ou le groupe de discussion de l'équipe. Les poignees d'edition et les
repères d'aimantation n'y figurent pas : seul le schéma est exporte.

## Bilan de la saison
<!-- notice:capture bilan -->

La page **Bilan** répond à une question qu'on ne se pose jamais en preparant une
séance isolee : depuis septembre, qu'a-t-on réellement travaille ?

- volume total, moyenne par séance, nombre de séances comportant un travail
  spécifique des gardiens ;
- **répartition du temps par catégorie**, en barre et en pourcentages, avec la
  liste des catégories jamais abordees sur la période ;
- **rythme mensuel** : le volume mois par mois, pour repérer un creux ;
- **exercices les plus programmes**, avec leur note ;
- **a revoir** : les exercices notes 1 ou 2 que l'on continue pourtant de
  programmer. C'est le seul signal vraiment actionnable de la page.

La saison va de septembre a aout : une séance de juin appartient à la saison
commencee en septembre précédent. Un bouton permet de basculer sur tout
l'historique.

Les exercices sont regroupes par **titre** et non par identifiant : dupliquer
une séance crée des copies indépendantes, qui doivent malgré tout compter comme
un seul et même exercice dans un bilan.

## Savoir ce qu'on a déjà mene

Sous chaque fiche de la bibliothèque, une ligne rappelle **combien de fois vous
l'avez menee et quand pour la dernière fois**. Elle apparait là où l'on choisit,
pas une fois la fiche ouverte.

Rien ne s'affiche tant qu'une fiche n'a jamais servi : « jamais utilise » sur
des dizaines de lignes serait du bruit.

Ce compte est reconstitue en parcourant toutes vos séances. L'historique ne vit
pas sur la fiche mais sur les **copies** qu'elle a produites : ajouter une fiche
à une séance en fabrique un exemplaire indépendant, et c'est lui qu'on marque
comme réalise. Le regroupement se fait sur la référence de la fiche d'origine,
donc **renommer un exercice dans une séance ne casse pas son compteur**.

## Mettre des fiches en favori

Une **étoile** en haut à droite de chaque fiche de la bibliothèque la met de
côté. La puce **★ Favoris**, en bas de la rangee des filtres, ne montre plus
qu'elles. Elle se combine avec les autres : « les favoris de défense », « les
favoris sans ballon ».

**Un favori n'est pas une note.** La note est un jugement porte *après* la
séance : cet exercice a bien marche jeudi. Le favori est une intention prise
*avant* : celui-la, je le remonterai souvent cette saison. On peut donc mettre
en favori une fiche jamais menee, et ne jamais mettre en favori une fiche notee
cinq étoiles parce qu'elle ne sert qu'une fois par an. Les deux vivent côte à
côte sur la même carte sans se remplacer.

L'étoile se pose sur la **fiche de la bibliothèque**, pas sur la copie posée
dans une séance : c'est dans la bibliothèque qu'on choisit, c'est la qu'elle
sert.

Les favoris partent dans « Sauvegarder tout », comme le reste. Ce sont des
préférences et non des données de séance, mais ce fichier est le seul filet
contre un nettoyage du navigateur — qui efface aussi les préférences. Les
omettre reviendrait a promettre de tout sauver en laissant tomber une partie.

Une précision sur la restauration : elle **ajoute**, elle ne remplace jamais,
et donne pour cela de nouveaux identifiants aux fiches que vous avez créées
vous-même. Les favoris qui les designaient sont retraces au passage, sans quoi
vous retrouveriez vos séances en perdant la moitié de vos étoiles sans qu'on
vous dise rien. Les favoris poses sur les fiches fournies, eux, traversent tels
quels : leur référence est stable.
## Noter les exercices

Chaque fiche porte une note de 1 à 5 étoiles, donnee après la séance :

| Note | Sens |
| --- | --- |
| Aucune | Pas encore evalue |
| 1 - 2 | A éviter, ou decevant |
| 3 | Correct |
| 4 - 5 | Très bon, incontournable |

Le bouton « Marquer comme réalise » incremente un compteur d'utilisations et
retient la date. Avec le commentaire libre, l'entraîneur retrouve d'une séance a
l'autre ce qui a fonctionne et ce qu'il vaut mieux ne pas reprogrammer.

## Bibliothèque fournie
<!-- notice:capture bibliotheque -->

62 fiches sont livrées avec l'application : 29 pour un groupe seniors masculins
(+18 ans), 12 spécifiques aux gardiens de but, 12 qui se passent de ballon, 6
transcrites des séances du club, et 3 combinaisons nommées du repertoire
classique.

Les fiches joueurs de champ couvrent toutes les catégories de la séance :
échauffement et prévention, technique individuelle, attaque placée (croise,
pivot, écran, renversement, deux pivots, supériorité numérique), défense (6-0,
5-1, 3-2-1, duels, infériorité numérique), montée de balle et contre-attaque,
préparation physique, et matchs à thème.

### Les séances du club

Six fiches viennent des diaporamas de l'entraîneur, transcrites telles quelles :
l'échauffement motricite ballon, l'échauffement gardien à trois colonnes, le
cardio PMA, le 3 contre 3 contre une 0-6, la montée de balle, et le 6 contre 6
grand espace. Leurs barèmes de points sont ceux du club, pas des exemples.

Deux reserves les concernent :

- **« Points clés » y est vide.** La trame d'origine ne comporte pas cette
  rubrique. Plutôt que d'inventer ce que l'entraîneur regarde, on l'a laissee a
  remplir : c'est le seul endroit ou ces fiches sont incompletes.
- **Deux durées ont été estimees.** Le diaporama laisse « TPS' » sans chiffre
  pour le 3 contre 3 et pour la montée de balle. La fiche retient 20 et 15
  minutes, et le dit dans sa mise en place.

Une seule de ces six declare des étapes, la montée de balle : c'est la seule
décrite comme un enchaînement. Les autres sont des jeux ou des circuits.

Une étiquette **▶ N étapes** signale, dans la liste, les fiches dont le
mouvement est décrit étape par étape : celles-la se lisent en animation une fois
ouvertes. Les autres — circuits, gammes, matchs à thème — decrivent une
organisation ou une répétition, pas une chorégraphie : leur imposer une
animation figee donnerait une fausse idée de ce qu'elles sont. L'étiquette vaut
aussi pour vos propres fiches, des qu'elles comptent plus d'une étape.

Deux puces à droite des filtres restreignent la liste sans remplacer le filtre
de catégorie : on peut donc demander les attaques animees, ou la préparation
physique sans ballon.

La puce **Sans ballon** ne garde que les fiches qui ne demandent aucun ballon :
ni sur le schéma, ni dans le matériel. La règle est litterale - une fiche qui
demande des ballons lestes ou des ballons mousse n'y figure pas, même si le
ballon de hand n'y sert à rien. Elle répond à la question « qu'est-ce que je
peux mener ce soir sans sortir un ballon ».

La puce **▶ Avec animation** ne montre que ces fiches.
Elle se combine avec le filtre de catégorie au lieu de le remplacer : on peut
Les deux s'allument en jaune plutôt qu'en bleu, et sont ecartees des autres
puces, parce qu'elles ne jouent pas le même rôle : les puces de catégorie
s'excluent, celles-ci s'ajoutent.

Douze fiches ne demandent aucun ballon : protocoles d'échauffement, gainage,
renforcement excentrique de prévention, travail de l'épaule à l'élastique, force
des jambes au poids de corps, proprioception, test de VMA en demi-Cooper,
intermittent calibre sur la VMA de chaque joueur, test de vitesse et de détente,
et deux fiches de réflexes pour les gardiens. Elles servent les jours ou le
gymnase est partage, ou le matériel manque, ou le travail vise le physique et
non le jeu.

Les fiches gardiens se repartissent en deux familles :

- **Gardiens avec les joueurs** : les tireurs font partie de l'exercice.
- **Gardiens seuls** : les gardiens travaillent à l'écart pendant que le groupe
  mene un exercice qui ne demande pas de but. Ces fiches sont marquees
  « en parallele », et leur durée ne s'ajoute pas au temps total de la séance :
  le decompte de la séance reste juste.

Choisir une fiche en ajoute une **copie indépendante** à la séance. L'adapter
pour un soir ne touche jamais au modèle, et les séances passées gardent la
version avec laquelle elles ont été jouées. Quand une modification mérite d'être
conservée, le bouton « Vers la bibliothèque » met le modèle à jour.

## Deux bibliothèques : la base et la vôtre

La fenêtre **Bibliothèque** a deux onglets, et ce ne sont pas un catalogue et
un fourre-tout : ce sont deux bibliothèques.

**Bibliothèque de base** rassemble les fiches livrées avec l'application.
Elles sont identiques chez tous les entraîneurs, ce qui permet d'en parler
entre soi, et une nouvelle version du fichier les corrige pour tout le monde à
la fois.

**Ma bibliothèque** est la vôtre : les fiches que vous créez, et celles que
vous avez reprises de la base pour les ajuster à votre groupe. Elle vous suit
d'une saison à l'autre et part dans « Sauvegarder tout ».

### Reprendre une fiche de base

Le bouton **Reprendre dans ma bibliothèque**, sur chaque fiche de base, en
dépose une copie de votre côté et vous y emmène. À partir de là, elle est à
vous : changez les consignes, déplacez les joueurs, ajoutez des étapes. La
version livrée n'en sait rien et ne bougera jamais.

C'est le geste qui fait de la bibliothèque de base **un point de départ plutôt
qu'un catalogue figé**. Il existait déjà, mais il fallait poser la fiche dans
une séance, la corriger là, puis la renvoyer par « Vers la bibliothèque » — un
détour par un objet qui n'avait rien à y voir, et que personne ne trouvait
seul.

L'application propose ensuite de retirer la version livrée, pour ne pas voir
deux fois la même fiche. Elle le **propose** : garder les deux est un choix
légitime — la version livrée comme référence, la vôtre comme celle du soir.

Une fiche reprise garde le lien vers son modèle d'origine : son **compteur
d'utilisation ne repart pas de zéro**, et le bilan de saison continue de la
compter avec les séances où vous aviez mené la version livrée.

### Retirer des fiches fournies

Toutes les fiches livrées ne conviennent pas à tous les groupes. Le bouton
**Retirer de la base**, sur chaque fiche de base, la fait disparaître
de la liste : la bibliothèque de base se taille ainsi à la mesure de l'équipe,
et son compteur ne compte plus que ce qui reste.

Retirer n'est pas supprimer. Les fiches fournies font partie de l'application,
et une nouvelle version du fichier les ramenerait de toute façon. Une fiche
retiree est donc **masquee** : la puce **Retirees (N)**, en bas des filtres,
les montre toutes, et « Remettre dans la bibliothèque » en retablit une d'un
clic. La puce n'apparait que si au moins une fiche a été retiree — tant que la
bibliothèque est complète, rien ne la mentionne.

Les séances qui utilisaient une fiche retiree la conservent : elles possedent
leur propre copie. Les favoris et l'historique d'utilisation d'une fiche
rétablie sont intacts, puisqu'ils sont accroches a sa référence et non a sa
présence dans la liste.

Ce tri part dans **Sauvegarder tout** et se restaure avec le reste. La
restauration **ajoute**, la aussi : le tri fait sur une autre machine s'ajoute
a celui d'ici, il ne retablit jamais une fiche retiree depuis.

## Les combinaisons nommées

Certaines fiches ne decrivent pas un exercice a repeter, mais un
**enchaînement qui porte un nom** : l'Espagnole, le double croise, le Pondus.
Sur le terrain on dit « on joue l'Espagnole », et la bibliothèque doit donc la
retrouver sous ce nom-la.

La puce **Combinaisons**, en bas des filtres, ne montre plus qu'elles. Comme
« Avec animation » et « Sans ballon », elle s'ajoute aux autres au lieu de les
remplacer.

Trois règles tiennent ces fiches :

- **Le nom ouvre le titre**, la description suit : « Espagnole — croise
  central ». La recherche trouve alors le nom parle, et la suite du titre
  explique de quoi il s'agit a celui qui ne le connait pas.
- **Les variantes ne font pas des fiches.** Une combinaison en a souvent trois
  ou quatre. Elles vont dans « Évolution » : autant de fiches quasi identiques
  noieraient la bibliothèque et scinderaient les compteurs d'utilisation.
- **Le schéma est refait ici.** Un enchaînement tactique — qui court ou, qui
  passe à qui — est un fait de handball, pas une oeuvre. Les positions, les
  temps de jeu et les textes sont écrits pour cette application ; la provenance
  de l'idée est citee dans la fiche.

## Partager des séances et des exercices

- `Exporter la séance` produit un fichier `.hbt.json` contenant toute la séance.
- L'icone ⇩ sur une ligne d'exercice exporte cet exercice seul.
- `Importer` relit un fichier `.hbt.json`, qu'il contienne une séance ou un
  exercice isole.

A l'import, tous les identifiants sont régénérés : importer deux fois le même
fichier crée deux copies indépendantes, sans jamais écraser un exercice existant.

## Quelle version ai-je entre les mains ?

La version du fichier est affichée **en haut à droite**, à gauche du bouton
Notice : `v1.1.0`. Un clic dessus copie la ligne complète — numéro, date de
fabrication et révision du code, par exemple
`v1.1.0 · 2026-08-24 · d5dc31b`.

C'est le renseignement à joindre à tout signalement de défaut. L'application
voyage en un seul fichier, sans mise à jour automatique : plusieurs versions
cohabitent donc sur autant de postes, et deux entraîneurs n'ont presque jamais
la même. Sans ce repère, « le bouton ne marche pas » ne dit pas s'il s'agit
d'un défaut déjà corrigé ou d'un défaut à corriger.

La même ligne est **inscrite dans chaque fichier exporté** (`.hbt.json`), sous
la clé `application`. Une séance envoyée à quelqu'un porte ainsi la trace de la
version qui l'a produite, ce qui suffit à expliquer la plupart des différences
d'affichage d'un poste à l'autre.

Ouverte depuis le code source plutôt que depuis un fichier fabriqué,
l'application affiche « version de travail » : un numéro y serait faux, et
enverrait chercher un défaut là où il n'est pas.

## Partager cette notice

Le bouton **Notice**, en haut à droite de l'application, ouvre ce document dans
une fenêtre a part : on garde la séance sous les yeux d'un côté, la notice de
l'autre. La notice est embarquée dans l'application, pas lue à côté d'elle :
elle fonctionne donc même si le fichier a été copie seul sur une clé USB. Si le
navigateur bloque les fenêtres surgissantes, un bandeau le signale.

Le même document existe aussi en fichier séparé, `LISEZMOI.html`, livré à côté
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

La page est refabriquee à partir de ce fichier `LISEZMOI.md` à chaque
`npm run build`, ou seule avec `npm run notice` : les deux ne peuvent donc pas
diverger. Le build l'appelle en deux temps — avant le bundle pour la version
embarquée, après pour la copie a joindre, parce que Vite vide `dist/` au
passage.

La version HTML ne reprend que les sections d'utilisation : les parties
marquees `<!-- notice:developpeur -->` en sont retirees.

Une marque `<!-- notice:capture nom -->` posée sous un titre y insere la capture
d'écran correspondante, prise dans l'application elle-même. Ces captures ne vont
QUE dans le fichier a joindre : la notice ouverte depuis l'application s'en
passe, celui qui la lit ayant l'application sous les yeux. Cela évite aussi de
faire grossir le fichier unique de plusieurs centaines de kilo-octets pour lui
montrer ce qu'il est en train de regarder.

Les captures sont mises en cache : elles ne sont refaites que si
`dist/index.html` est plus recent qu'elles.

## Raccourcis clavier

| Touche | Effet |
| --- | --- |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` ou `Ctrl+Maj+Z` | Rétablir |
| `Suppr` | Retirer le jeton ou le trace sélectionne |
| `Echap` | Deselectionner, puis quitter le plein écran |
| `←` `→` | Déplacer le separateur, une fois qu'il a le focus |
| `Origine` | Remettre le separateur a sa position par défaut |

## Largeur du schéma

La barre verticale qui séparé le schéma de terrain du texte de l'exercice se
déplace à la souris. Un double-clic dessus revient à la position par défaut.

La position choisie est retenue d'une séance à l'autre. Elle est enregistrée a
part du reste, dans le navigateur : c'est une préférence d'affichage liee au
poste de travail, elle ne part donc pas dans les fichiers `.hbt.json` exportes.

Chaque colonne porte aussi un bouton d'agrandissement, en haut à droite : le
terrain, ou le texte, occupe alors toute la largeur. Pratique pour tracer au
large, ou pour rédiger un déroulement sans un terrain qui prend la moitié de
l'écran. `Echap` revient à deux colonnes, comme le même bouton. Ce mode n'est
volontairement pas mémorise : c'est une façon de travailler sur le moment, pas
un réglage.

Chaque colonne garde une largeur minimale, et sous 1240 pixels de large les
deux colonnes s'empilent : le separateur disparait alors, il n'a plus d'objet.

## La trame de la fiche

La fiche reprend la trame utilisée par l'entraîneur, dans son ordre :

| Rubrique | Ce qu'on y met |
| --- | --- |
| Objectifs | Ce que les joueurs doivent progresser |
| **Forme d'intervention** | Approche inductive, consigne directe, couverture d'un poste... |
| **Mise en place** | Espaces a delimiter, colonnes, matériel a poser |
| **Fonctionnement** | Comment la situation se déroule une fois lancee |
| **Régulation** | Les règles et contraintes imposees et ajustees en cours, barèmes de points compris |
| Points clés | Ce que l'entraîneur observe et corrige |
| **Évolution** | Simplifier, complexifier, faire évoluer |

« Régulation » et « Points clés » sont bien deux choses différentes : la
première releve de la règle, la seconde de l'observation. Une rubrique laissee
vide ne s'imprime pas.

Les fichiers écrits avant cette trame restent lisibles : « Déroulement » devient
« Fonctionnement », « Variantes » devient « Évolution », et les trois nouvelles
rubriques naissent vides. Le format d'echange passe en **version 2**.

Le format est ensuite passe en **version 3** : le schéma y gagne des zones
coloriées et des textes libres, la palette un jeton « colonne », la notation une
flèche de rotation, et la fiche l'espace de jeu qu'elle demande. Un fichier de
version 1 ou 2 se lit sans rien perdre — tout ce qui est nouveau est facultatif,
et l'espace se déduit de la vue. En sens inverse, un fichier de version 3 ouvert
dans un exemplaire plus ancien de l'application est refusé, avec un message qui
dit lequel des deux mettre à jour.

## La fiche signaletique

Catégorie, durée, effectif, difficulte, espace nécessaire et rôle des gardiens
forment un petit bloc en haut du détail. Ces valeurs se reglent à la création de l'exercice et se
consultent ensuite : le titre **Détail de l'exercice** est un bouton qui les
replie.

Repliees, elles laissent un résumé d'une seule ligne — « Attaque · 20 min ·
12 joueurs + 2 GB » — et rendent plus de deux cents pixels à la zone de
rédaction, qui est le vrai espace de travail. Le choix est mémorise.

Les trois nombres sont regroupes et portent leur unité au lieu d'une étiquette
en capitales, et les intitules du rôle des gardiens ne repetent plus le mot
« gardiens » : ils debordaient de la liste deroulante.

## Petits écrans

L'application est conçue pour rester confortable sur un portable de 13 pouces
et sur une tablette de 11 ou 13 pouces.

**Le terrain est l'élément élastique.** Les commandes prennent la hauteur qu'il
leur faut, le schéma occupe tout le reste, avec un plancher en dessous duquel il
ne descend pas. Changer de vue ne bouscule donc plus la mise en page : le
schéma se centre dans sa boite au lieu d'imposer sa hauteur.

**Une seule barre d'outils**, qui ne se replie jamais : les vues, les outils de
trace en bande defilante, puis annuler / rétablir et un menu ⋯ regroupant les
actions secondaires (aimantation, symétrie, export image, propositions,
rédaction, plein écran).

**La palette est un bouton « + Ajouter »** qui ouvre le choix des éléments, au
lieu d'occuper deux rangees en permanence pour un geste qu'on fait quelques fois
par fiche.

**Le côte à côte tient jusqu'à 900 pixels.** En dessous seulement, la fiche
s'empile.

Mesures avant et après, sur la colonne du schéma :

| | Avant | Après |
| --- | --- | --- |
| Hauteur nécessaire sur un écran de 720 px | 840 px | **649 px** |
| Part de la colonne occupee par le terrain | 31 % | **50 %** |
| Barre d'étapes sur un 13 pouces | hors écran | **visible** |
| Tablette 11 pouces en paysage | une colonne, texte a y=1011 | **deux colonnes, 500 / 419** |

Les cibles tactiles restent à 44 pixels minimum : c'est le NOMBRE de commandes
affichées en permanence qui a diminue, pas leur taille. Au bord d'un terrain,
avec les mains froides, un bouton trop petit est une erreur de manipulation.

## Sur tablette

L'application est utilisable au doigt. Sur un écran tactile, les commandes
passent à 44 pixels au minimum, les champs à 16 pixels de texte — en deca, iOS
zoome à chaque saisie — et la zone de prise d'un jeton s'élargit, un doigt etant
moins précis qu'un curseur.

Le terrain ne fait jamais defiler la page pendant un glisser, et le double tape
ne déclenche pas de zoom. La fiche passe en une seule colonne des que la largeur
descend sous 1240 pixels.

## Développement
<!-- notice:developpeur -->

### La page de presentation

`npm run presentation` produit `dist/PRESENTATION.html` : ce que fait le
logiciel, en images, pour un entraîneur qui ne l'a jamais ouvert. Fichier
unique d'environ un mega-octet, qui passe en piece jointe.

Les captures ne sont pas des maquettes. `outils/captures.mjs` amorce des
séances realistes dans localStorage, conduit le vrai `dist/index.html` jusqu'a
l'écran voulu, et laisse Chrome photographier. Une presentation qui montrerait
autre chose que le logiciel se ferait demasquer à la première ouverture.

Deux détails rendent la chose possible : le script amorce est un script
CLASSIQUE, donc execute avant le script module de l'application, qui est
differe ; et `--run-all-compositor-stages-before-draw` force le repeint, sans
quoi Chrome photographie parfois l'image précédente.

A relancer APRÈS `npm run build` : Vite vide `dist/` et emporte la page avec.

### Test de l'interface

`tests/interface.test.mjs` charge `dist/index.html` dans le Chrome de la
machine, crée une séance, ouvre une fiche, et vérifie que les commandes
essentielles répondent : plein écran des deux colonnes, separateur, menu
deroulant entièrement visible.

Il existe parce que les autres tests ne pouvaient pas voir la panne qui l'a
motive : le plein écran du terrain avait été déplace dans un menu deroulant
lui-même rogné par le défilement de sa colonne, et `npm run verifier` restait
vert. Des fonctions pures ne disent rien de l'atteignabilite d'un bouton.

Le test passe si Chrome est introuvable, pour ne pas bloquer une machine qui
n'en a pas. Il porte sur `dist/`, donc après `npm run build` - ce que
`npm run verifier` enchaîne.

### Retirer une fiche fournie : le parcours entier

`tests/masqueesInterface.test.mjs` suit le même principe pour la bibliothèque
nettoyée : il retire une fiche fournie, vérifie qu'elle quitte la liste, que le
compteur « Fiches fournies » diminue, que la puce **Retirées** apparaît, puis
la remet en place et vérifie que tout revient à son état de départ.

`tests/masquees.test.mjs` prouve que la LISTE des références masquées se tient
— bascule, relecture d'un fichier abîmé, fusion à la restauration. Il ne prouve
pas que le bouton existe, ni que la fiche disparaît réellement, ni qu'un chemin
de retour est offert. C'est la différence entre une règle juste et une
fonctionnalité utilisable, et seul un vrai navigateur peut en juger.

```
npm install
npm run dev        # serveur de developpement
npm run build      # produit le fichier unique dist/index.html
npm test           # test de l'aller-retour export / import
npm run verifier   # build + tests
```

### Référence des fiches fournies

Chaque fiche livrée porte une `ref` : un identifiant en minuscules, derive du
titre a sa création puis **fige**. Le titre, lui, peut être corrige.

C'est la ref, jamais le titre, qui identifie une fiche. Un favori, un historique
d'utilisation ou un bilan accroches à un titre disparaitraient silencieusement
au premier renommage - et un titre finit toujours par être renomme.

`tests/references-connues.txt` inventorie les références existantes, et
`tests/catalogue.test.mjs` échoue si l'une d'elles disparait. Retirer une fiche
reste possible : il faut alors retirer aussi sa ligne de l'inventaire, ce qui
rend la décision explicite dans la revue plutôt qu'invisible dans un diff.

### Deux jetons ne doivent pas se recouvrir

La pastille qui porte l'étiquette d'un jeton fait 0,66 mètre de rayon. En
dessous de **1,30 mètre entre deux centres**, les étiquettes se chevauchent et
l'on ne lit plus qui est qui. Treize paires etaient dans ce cas, dont certaines
à dix centimètres : le pivot était purement invisible sous les défenseurs.

`tests/catalogue.test.mjs` échoue désormais si deux jetons de joueur se
retrouvent a moins de 1,30 mètre **dans le placement de départ**. La règle ne
vaut que la : un écran est un contact, et se joue dans les étapes.

Un compromis assume : le pivot est dessine **juste devant la ligne défensive**
et non entre deux défenseurs. A cette echelle, un jeton mesure plus d'un mètre
et demi de diamètre alors qu'une défense 6-0 espace ses joueurs de deux mètres
— dessiner le pivot dans l'intervalle le rend illisible. Il est visible et
légèrement en avant, plutôt qu'exact et cache. L'entraîneur le déplace d'un
glisser s'il veut le montrer autrement.

### Ou poser le ballon sur un schéma

Le moteur reconnaît comme porteur **tout joueur a moins de 1,9 mètre du
ballon**, le plus proche l'emportant. Poser le ballon exactement sur son
porteur fonctionne donc — mais le **masque entièrement** : le jeton du ballon
recouvre celui du joueur, et l'on voit une passe partir de personne. Vingt-huit
fiches livrées etaient dans ce cas.

La règle est désormais : le ballon se pose **a environ un mètre** de son
porteur, du côté opposé au but, et `tests/catalogue.test.mjs` échoue si un
ballon revient sur un joueur, ou s'il se retrouve à mi-chemin entre deux
joueurs — auquel cas le voisin peut lui voler la balle à la relecture.

### La lecture des fichiers est une liste blanche

`lireExercice`, dans `src/domain/echange.ts`, reconstruit chaque exercice champ
par champ. Un champ absent de cette fonction **est efface à chaque relecture**,
sans erreur ni message, même s'il figure dans le fichier.

C'est une bonne chose - un fichier venu de l'extérieur ne peut pas injecter ce
qu'il veut - mais c'est un piège pour qui ajoute un champ. `refModele` est
tombe dedans : pose à la construction, il disparaissait au premier rechargement,
et les compteurs d'utilisation retombaient a zéro sans raison apparente.

**Tout nouveau champ d'`Exercice` ou de `Seance` doit donc être ajoute la**, et
un test de `tests/echange.test.mjs` vérifie qu'il survit à l'aller-retour.

### Organisation

| Dossier | Rôle |
| --- | --- |
| `src/domain` | Modèle de données, mouvements, format d'echange. Aucune dependance a React. |
| `src/terrain` | Géométrie du terrain et rendu SVG des schémas. |
| `src/bibliotheque` | Fiches fournies avec l'application et leur sélection. |
| `src/impression` | Calcul de la mise en page des fiches imprimées. |
| `src/storage` | Depots de persistance et choix du depot au démarrage. |
| `src/platform` | Acces fichiers, isole derrière une interface. |
| `src/ui` | Composants React et état de l'application. |

### Ecusson

Le logo affiche dans l'entete est une **reproduction vectorielle** de l'ecusson
du club, redessinee à la main (`src/ui/LogoHbpsm.tsx`) : disque bleu marine,
but, joueur en suspension, ballon et le millesime 1983. La silhouette et les
lettrages sont approches, ce n'est pas le fichier officiel.

Pour le remplacer par le vrai ecusson : deposer le fichier dans `src/ui/` et
echanger le corps de ce composant contre une balise `<img>`. C'est le seul
endroit a modifier, et `assetsInlineLimit` (dans `vite.config.ts`) est déjà
règle pour embarquer l'image en base64 dans le fichier unique hors ligne.

### Couleurs

L'interface reprend les couleurs du club, le jaune et le bleu. Le bleu profond
porte la structure (entete, boutons d'action, titres) parce qu'il garde un
contraste suffisant sur fond clair ; le jaune sert d'accent, sur les éléments
actifs et les repères, toujours associe a du texte bleu fonce. Du texte clair
sur jaune serait illisible, et n'est utilise nulle part.

Sur le terrain, la même logique s'applique aux jetons : l'attaque porte le
jaune, la défense le bleu, le gardien le vert, comme sur un maillot. Les formes
différent aussi (rond, triangle, carre) pour que le schéma reste lisible
imprime en noir et blanc.

Un joueur est un **disque à la couleur du camp, avec deux bras tendus vers
l'avant** qui disent ou il regarde, et une **pastille centrale** qui porte son
étiquette. Trois raisons a ce dessin plutôt qu'à une silhouette detaillee :

- le disque garde le même contour quel que soit l'angle, alors qu'une
  silhouette change de forme en tournant ;
- la pastille occupe presque tout le corps, donc une étiquette de trois lettres
  (`AlG`, `PIV`) reste lisible - ce qui n'etait pas le cas avant ;
- le corps ne fait que 0,82 du rayon de référence, assez étroit pour que six
  défenseurs espaces de deux mètres ne se chevauchent plus.

Le fond de la pastille est une teinte CLAIRE du maillot, pas du blanc : le camp
se lit jusque dans la pastille au lieu que celle-ci coupe le jeton en deux. Le
texte y est toujours bleu fonce, mesure entre 10,3 et 12,6 de contraste selon
la couleur.

Deux principes structurent le code :

- **Les coordonnees du terrain sont en mètres**, pas en pixels, avec pour origine
  le coin bas gauche d'un terrain de 40 m x 20 m. Un schéma peut ainsi changer de
  vue (demi-terrain, terrain complet, zone) et s'imprimer a n'importe quelle
  taille sans deformation.
- **Les jetons sont des entites persistantes entre les étapes.** Une étape ne
  stocke que les nouvelles positions des mêmes jetons. Le déplacement d'un joueur
  d'une étape à l'autre peut donc être trace et anime automatiquement.
- **Une flèche liee à un jeton ne stocke pas ses extrémités.** Son départ est la
  position du jeton à l'étape, son arrivée sa position à l'étape suivante
  (`src/domain/mouvement.ts`). C'est ce qui rend le lien bidirectionnel gratuit :
  il n'y a qu'une donnee, donc rien a synchroniser. De même, l'orientation n'est
  enregistrée que si l'entraîneur l'impose ; sinon elle se calcule.

`src/storage` et `src/platform` passent par des interfaces (`Depot`,
`AdaptateurFichiers`) afin qu'une future version bureau (Tauri) n'ait qu'a
fournir de nouvelles implementations, sans toucher aux composants.

## État d'avancement
<!-- notice:developpeur -->

- [x] **Étape 1** — socle : fichier unique, sauvegarde automatique, liste des
      séances et des exercices, export / import `.hbt.json`.
- [x] **Étape 2** — terrain SVG aux cotes officielles, trois vues, jetons
      deplaçables, annuler / rétablir, fiche detaillee, notation des exercices,
      bibliothèque fournie.
- [x] **Étape 3** — joueurs vus de dessus et orientables à 360°, flèches de
      mouvement, étapes successives, lecture animee, impression A4 paysage,
      effectif de la séance, bibliothèque personnelle, menu repliable.
- [ ] **Étape 4** — export PNG d'un schéma, usage tablette au doigt.
- [x] **Étape 5** — page d'accueil listant toutes les séances avec leur résumé,
      recherche, tri, et duplication vers une autre date et un autre effectif.
- [x] **Étape 6** — la flèche definit la position suivante, le ballon suit son
      porteur, l'orientation se deduit.
- [x] **Étape 7** — aimantation sur les postes et les lignes, symétrie d'un
      exercice, déroulement rédige automatiquement à partir du schéma.
- [x] **Étape 8** — bilan de la saison, export PNG d'un schéma, usage tablette
      au doigt.
- [x] **Étape 9** — les trois manques du dessin comblés (colonnes et rotation,
      zones coloriées, textes posés sur le terrain) et le contrôle de l'espace
      disponible, jumeau de celui de l'effectif.
