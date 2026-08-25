/**
 * Tests des trois manques du dessin, et du controle d'espace.
 *
 * Ce que ces tests gardent, defaut par defaut.
 *
 * 1. Une ROTATION n'est pas un mouvement. « Puis va au fond de la colonne »
 *    decrit l'organisation, pas l'action : si elle deplacait son jeton, chaque
 *    consigne de rotation creerait une etape fantome ou tout le monde se
 *    retrouve au fond de la file.
 *
 * 2. Une ZONE est decrite par son coin BAS-gauche. Sa symetrie doit donc
 *    refleter y + hauteur, jamais y seul — sinon la zone glisse d'une hauteur
 *    entiere vers le bas, ce qui ne se voit pas sur un carre centre et saute
 *    aux yeux sur une bande.
 *
 * 3. Zones et annotations sont FACULTATIVES : les schemas ecrits avant la
 *    version 3 du format n'en ont pas, et rien ne doit s'en emouvoir.
 *
 * 4. L'ESPACE se deduit de la vue quand le champ manque. Sans cette regle, tout
 *    fichier ancien serait declare « demi-terrain » et une seance sur quart de
 *    salle n'alerterait sur rien.
 *
 * Lancement : npm test
 */

import {
  appliquerMouvement,
  construireExercice,
  espaceParDefaut,
  exerciceIncompatible,
  exporterExercice,
  importerFichier,
  manqueEffectif,
  manqueEspace,
  nouvelExercice,
  nouvelleSeance,
  refleterAnnotation,
  refleterSchema,
  refleterZone,
  redigerDeroulement,
  resoudreFleches,
  SENIORS_MASCULINS,
  TERRAIN,
} from '../.build-tests/domaine.mjs'

let ok = 0,
  ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) {
    ok++
    console.log('  OK    ' + nom)
  } else {
    ko++
    console.log('  ECHEC ' + nom + ' ' + detail)
  }
}

// ------------------------------------------------------------ 1. Rotation

console.log('')
console.log('1. La rotation dit la regle, elle ne deplace personne')

/** Schema minimal : un attaquant a l'etape 1, rien d'autre. */
function schemaAvecUnJoueur() {
  return {
    vue: 'demi',
    jetons: [{ id: 'a1', type: 'attaquant', etiquette: '1' }],
    etapes: [
      {
        id: 'e1',
        titre: 'Mise en place',
        consigne: '',
        positions: { a1: { x: 30, y: 10 } },
        fleches: [],
      },
    ],
  }
}

const apresCourse = appliquerMouvement(schemaAvecUnJoueur(), 0, {
  type: 'course',
  jetonDepart: 'a1',
  depart: { x: 30, y: 10 },
  arrivee: { x: 34, y: 14 },
})
verifier('une course cree bien l etape suivante', apresCourse.etapes.length === 2)
verifier('et y deplace son joueur', apresCourse.etapes[1].positions.a1.x === 34)

const apresRotation = appliquerMouvement(schemaAvecUnJoueur(), 0, {
  type: 'rotation',
  jetonDepart: 'a1',
  depart: { x: 30, y: 10 },
  arrivee: { x: 24, y: 4 },
})
verifier('une rotation ne cree AUCUNE etape', apresRotation.etapes.length === 1)
verifier('et laisse son joueur ou il est', apresRotation.etapes[0].positions.a1.x === 30)
verifier('mais la fleche est bien tracee', apresRotation.etapes[0].fleches.length === 1)
verifier(
  'elle reste une fleche libre, sans jeton',
  apresRotation.etapes[0].fleches[0].jetonId === undefined,
)
verifier('et elle se dessine, extremites comprises', resoudreFleches(apresRotation, 0).length === 1)

const texte = redigerDeroulement(apresRotation)
verifier(
  'le deroulement redige parle de la colonne',
  texte.toLowerCase().includes('fond de la colonne'),
  texte,
)

// --------------------------------------------------------------- 2. Zones

console.log('')
console.log('2. La zone se reflete par son bord oppose')

const bande = {
  id: 'z1',
  x: 20,
  y: 0,
  largeur: 10,
  hauteur: 4,
  teinte: 'jaune',
  libelle: 'Zone de marque',
}
const reflet = refleterZone(bande)
verifier('une bande collee en bas se retrouve collee en haut', reflet.y === TERRAIN.largeur - 4)
verifier('sa hauteur ne change pas', reflet.hauteur === 4)
verifier("l abscisse ne bouge pas : l axe est celui de la longueur", reflet.x === 20)
verifier('le reflet du reflet redonne l original', refleterZone(reflet).y === 0)
verifier(
  'la teinte et le libelle traversent',
  reflet.teinte === 'jaune' && reflet.libelle === 'Zone de marque',
)

const note = { id: 'n1', x: 30, y: 5, texte: 'Defense 6-0' }
verifier(
  'une annotation se reflete comme un point',
  refleterAnnotation(note).y === TERRAIN.largeur - 5,
)
verifier('son texte est intact', refleterAnnotation(note).texte === 'Defense 6-0')

const schemaOrne = { ...schemaAvecUnJoueur(), zones: [bande], annotations: [note] }
const miroir = refleterSchema(schemaOrne)
verifier('refleterSchema emmene les zones', miroir.zones?.[0].y === TERRAIN.largeur - 4)
verifier('et les annotations', miroir.annotations?.[0].y === TERRAIN.largeur - 5)

console.log('')
console.log('3. Un schema sans zone ni annotation reste un schema valide')
const nu = refleterSchema(schemaAvecUnJoueur())
verifier('la symetrie ne fabrique pas de listes vides', nu.zones === undefined)
verifier(
  'les jetons sont quand meme reflechis',
  nu.etapes[0].positions.a1.y === TERRAIN.largeur - 10,
)

// ------------------------------------------------- 4. Aller-retour fichier

console.log('')
console.log('4. Zones et annotations traversent un fichier')

const fiche = nouvelExercice('Tir en colonnes')
fiche.schema = { ...schemaOrne }
fiche.espace = 'complet'
const relu = importerFichier(exporterExercice(fiche))
const relue = relu.seance.exercices[0]
verifier('la zone est relue', relue.schema.zones?.length === 1)
verifier('avec ses cotes', relue.schema.zones?.[0].largeur === 10)
verifier('et sa teinte', relue.schema.zones?.[0].teinte === 'jaune')
verifier("l annotation est relue", relue.schema.annotations?.[0].texte === 'Defense 6-0')
verifier("l espace demande est relu", relue.espace === 'complet')

// Un fichier abime : teinte inconnue, cotes absurdes, annotation vide.
const abime = JSON.parse(exporterExercice(fiche))
abime.contenu.exercice.schema.zones = [
  { id: 'z9', x: 1, y: 1, largeur: 9999, hauteur: -5, teinte: 'fuchsia', libelle: 'x'.repeat(300) },
]
abime.contenu.exercice.schema.annotations = [{ id: 'n9', x: 1, y: 1, texte: '   ' }]
const survivant = importerFichier(JSON.stringify(abime)).seance.exercices[0]
const zoneSurvivante = survivant.schema.zones?.[0]
verifier('une teinte inconnue devient grise', zoneSurvivante?.teinte === 'gris')
verifier('une largeur absurde est ramenee au terrain', zoneSurvivante?.largeur === TERRAIN.longueur)
verifier('une hauteur negative est ramenee au minimum', zoneSurvivante?.hauteur === 1)
verifier('un libelle interminable est coupe', (zoneSurvivante?.libelle.length ?? 0) <= 40)
verifier('une annotation vide est ecartee', survivant.schema.annotations?.length === 0)

// Un fichier ecrit avant la version 3 : ni zones, ni annotations, ni espace.
const ancien = JSON.parse(exporterExercice(fiche))
delete ancien.contenu.exercice.schema.zones
delete ancien.contenu.exercice.schema.annotations
delete ancien.contenu.exercice.espace
ancien.contenu.exercice.schema.vue = 'complet'
const reluAncien = importerFichier(JSON.stringify(ancien)).seance.exercices[0]
verifier('un fichier ancien se lit sans zones', reluAncien.schema.zones?.length === 0)
verifier(
  "et son espace se deduit de la vue plutot que d etre invente",
  reluAncien.espace === 'complet',
)

// --------------------------------------------------------------- 5. Espace

console.log('')
console.log('5. Le controle d espace, jumeau de celui de l effectif')

verifier('la vue complete demande le terrain complet', espaceParDefaut('complet') === 'complet')
verifier('la vue zone tient sur un quart', espaceParDefaut('zone') === 'quart')
verifier('la vue demi demande un demi', espaceParDefaut('demi') === 'demi')

const seance = nouvelleSeance('Mardi')
const exigeant = nouvelExercice('Montee de balle')
exigeant.espace = 'complet'
exigeant.nombreJoueurs = 0
exigeant.nombreGardiens = 0

verifier('sans espace annonce, aucune alerte', manqueEspace(exigeant, seance) === undefined)

seance.espaceDisponible = 'demi'
verifier('un demi ne suffit pas a un exercice complet', manqueEspace(exigeant, seance) === 'complet')

seance.espaceDisponible = 'complet'
verifier('le terrain complet suffit', manqueEspace(exigeant, seance) === undefined)

const modeste = nouvelExercice('Gammes')
modeste.espace = 'quart'
modeste.nombreJoueurs = 0
modeste.nombreGardiens = 0
seance.espaceDisponible = 'demi'
verifier(
  'un exercice qui tient dans moins n est jamais signale',
  manqueEspace(modeste, seance) === undefined,
)

// Le jumelage : une seule question pour les deux moyens.
seance.espaceDisponible = 'quart'
seance.effectifJoueurs = 0
verifier(
  'exerciceIncompatible attrape le manque d espace',
  exerciceIncompatible(exigeant, seance) === true,
)
seance.espaceDisponible = 'complet'
seance.effectifJoueurs = 2
exigeant.nombreJoueurs = 12
verifier(
  'et le manque d effectif',
  exerciceIncompatible(exigeant, seance) === true && manqueEffectif(exigeant, seance) !== undefined,
)
seance.effectifJoueurs = 14
verifier('et se tait quand les deux vont', exerciceIncompatible(exigeant, seance) === false)

// ------------------------------------------------- 6. Bibliotheque livree

console.log('')
console.log('6. Les fiches livrees savent la place qu elles demandent')

const livrees = SENIORS_MASCULINS.map(construireExercice)
const sansEspace = livrees.filter((e) => !e.espace)
verifier('aucune fiche livree sans espace', sansEspace.length === 0, `${sansEspace.length} sans espace`)
verifier(
  'une fiche dessinee sur terrain complet en demande un',
  livrees.filter((e) => e.schema.vue === 'complet').every((e) => e.espace === 'complet'),
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
