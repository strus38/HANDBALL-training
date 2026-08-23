/**
 * Test de l'aller-retour export / import des fichiers .hbt.json.
 *
 * Le format d'echange est la seule garantie de partage entre entraineurs : un
 * fichier ecrit par une version doit rester lisible, et un fichier abime ne
 * doit jamais faire planter l'application.
 *
 * Lancement : npm test
 */

import {
  exporterSeance,
  exporterExercice,
  importerFichier,
  ErreurImport,
  dureeTotale,
  nouvelExercice,
  nouvelleSeance,
  normaliserSeance,
  exporterSauvegarde,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log(`  OK    ${nom}`) }
  else { ko++; console.log(`  ECHEC ${nom} ${detail}`) }
}

// --- Construction d'une seance realiste (comme le ferait l'interface) -------
const seance = {
  id: 's1', titre: 'Seance du mardi', date: '2026-08-25', equipe: 'Seniors filles',
  categorieAge: '-18 ans', objectifSeance: 'Montee de balle rapide',
  creeLe: '2026-08-22T10:00:00.000Z', modifieLe: '2026-08-22T10:00:00.000Z',
  exercices: [{
    id: 'e1', titre: 'Croise arriere-ailier', categorie: 'attaque', duree: 20,
    nombreJoueurs: 12, nombreGardiens: 2, difficulte: 3,
    materiel: ['ballons', 'plots'], objectifs: 'Fixation puis croise',
    formatGardiens: 'avec-joueurs', enParallele: false,
    evaluation: { note: 4, commentaire: 'Bien passe, garder le rythme', nombreUtilisations: 3, derniereUtilisation: '2026-06-12' },
    // Volontairement laisse au format de la version 1 : ce jeu d'essai sert
    // aussi a verifier que « description » et « variantes » sont repris.
    description: 'Deux vagues.', pointsCles: 'Prise d’intervalle', variantes: 'Avec defenseur passif',
    creeLe: '2026-08-22T10:00:00.000Z', modifieLe: '2026-08-22T10:00:00.000Z',
    schema: {
      vue: 'demi',
      jetons: [
        { id: 'j1', type: 'attaquant', etiquette: 'ArD', poste: 'ArD' },
        { id: 'j2', type: 'attaquant', etiquette: 'AlD', poste: 'AlD' },
        { id: 'j3', type: 'ballon', etiquette: '' },
      ],
      etapes: [
        { id: 'et1', titre: 'Mise en place', consigne: 'Position de depart',
          positions: { j1: { x: 28, y: 13 }, j2: { x: 33, y: 18.5 }, j3: { x: 28, y: 13 } },
          fleches: [] },
        { id: 'et2', titre: 'Croise', consigne: 'ArD fixe puis passe',
          positions: { j1: { x: 31, y: 16 }, j2: { x: 30, y: 14 }, j3: { x: 30, y: 14 } },
          fleches: [
            { id: 'f1', type: 'course', depart: { x: 28, y: 13 }, arrivee: { x: 31, y: 16 }, jetonId: 'j1' },
            { id: 'f2', type: 'passe', depart: { x: 31, y: 16 }, arrivee: { x: 30, y: 14 },
              courbure: { x: 31, y: 15 } },
          ] },
      ],
    },
  }],
}

// --- 1. Aller-retour d'une seance complete ---------------------------------
console.log('\n1. Aller-retour seance')
const relu = importerFichier(exporterSeance(seance))
verifier('type detecte = seance', relu.type === 'seance')
verifier('titre conserve', relu.seance.titre === 'Seance du mardi')
verifier('equipe conservee', relu.seance.equipe === 'Seniors filles')
verifier('1 exercice', relu.seance.exercices.length === 1)

const ex = relu.seance.exercices[0]
verifier('duree conservee', ex.duree === 20)
verifier('difficulte conservee', ex.difficulte === 3)
verifier('materiel conserve', JSON.stringify(ex.materiel) === JSON.stringify(['ballons', 'plots']))
verifier('apostrophe typographique conservee', ex.pointsCles === 'Prise d’intervalle')
verifier('3 jetons', ex.schema.jetons.length === 3)
verifier('2 etapes', ex.schema.etapes.length === 2)
verifier('poste conserve', ex.schema.jetons[0].poste === 'ArD')
verifier('courbure conservee', ex.schema.etapes[1].fleches[1].courbure.x === 31)

// --- 2. Les identifiants sont regeneres, les liens restent coherents --------
console.log('\n2. Coherence des identifiants apres import')
verifier('ids de jetons regeneres', ex.schema.jetons.every((j) => !['j1', 'j2', 'j3'].includes(j.id)))
const idsJetons = new Set(ex.schema.jetons.map((j) => j.id))
const idsPositions = Object.keys(ex.schema.etapes[0].positions)
verifier('positions rattachees aux nouveaux jetons',
  idsPositions.length === 3 && idsPositions.every((id) => idsJetons.has(id)))
verifier('fleche rattachee au bon jeton', idsJetons.has(ex.schema.etapes[1].fleches[0].jetonId))
const idArD = ex.schema.jetons[0].id
verifier('deplacement entre etapes preserve',
  ex.schema.etapes[0].positions[idArD].x === 28 && ex.schema.etapes[1].positions[idArD].x === 31)

// --- 3. Aller-retour d'un exercice seul ------------------------------------
console.log('\n3. Aller-retour exercice seul')
const reluEx = importerFichier(exporterExercice(seance.exercices[0]))
verifier('type detecte = exercice', reluEx.type === 'exercice')
verifier('enveloppe dans une seance', reluEx.seance.exercices.length === 1)
verifier('titre exercice conserve', reluEx.seance.exercices[0].titre === 'Croise arriere-ailier')

// --- 4. Fichiers invalides -------------------------------------------------
console.log('\n4. Refus des fichiers invalides')
const refuse = (nom, texte) => {
  try { importerFichier(texte); verifier(nom, false, '(aucune erreur levee)') }
  catch (e) { verifier(nom, e instanceof ErreurImport, `(${e.constructor.name})`) }
}
refuse('JSON casse', '{ ceci nest pas du json')
refuse('autre format', JSON.stringify({ format: 'autre-appli', contenu: {} }))
refuse('version future', JSON.stringify({ format: 'handball-training', version: 99, contenu: { type: 'seance', seance: {} } }))
refuse('contenu inconnu', JSON.stringify({ format: 'handball-training', version: 1, contenu: { type: 'inconnu' } }))

// --- 5. Fichier partiel : valeurs par defaut, pas de plantage ---------------
console.log('\n5. Fichier incomplet ou corrompu')
const partiel = importerFichier(JSON.stringify({
  format: 'handball-training', version: 1,
  contenu: { type: 'seance', seance: {
    titre: 'Seance minimale',
    exercices: [{ titre: 'Exo sans rien' }, 'pas un objet', null],
  } },
}))
verifier('seance partielle lue', partiel.seance.titre === 'Seance minimale')
verifier('entrees non-objet ignorees', partiel.seance.exercices.length === 1)
verifier('duree par defaut', partiel.seance.exercices[0].duree === 15)
verifier('au moins une etape', partiel.seance.exercices[0].schema.etapes.length === 1)
verifier('vue par defaut', partiel.seance.exercices[0].schema.vue === 'demi')

const champsPourris = importerFichier(JSON.stringify({
  format: 'handball-training', version: 1,
  contenu: { type: 'seance', seance: { titre: 42, exercices: [{
    titre: 'Champs de mauvais type', duree: 'beaucoup', difficulte: 9,
    nombreJoueurs: -5, materiel: ['ok', 12, null], categorie: 'inexistante',
    schema: { vue: 'martienne', jetons: 'pas une liste', etapes: [{ positions: { j: 'nope' } }] },
  }] } },
}))
const pourri = champsPourris.seance.exercices[0]
verifier('titre non-texte remplace', typeof champsPourris.seance.titre === 'string')
verifier('duree non-numerique remplacee', pourri.duree === 15)
verifier('difficulte hors bornes ramenee', pourri.difficulte === 2)
verifier('nombre negatif ramene a 0', pourri.nombreJoueurs === 0)
verifier('materiel filtre aux textes', JSON.stringify(pourri.materiel) === JSON.stringify(['ok']))
verifier('vue inconnue remplacee', pourri.schema.vue === 'demi')
verifier('jetons non-liste remplaces', Array.isArray(pourri.schema.jetons))
verifier('position invalide ignoree', Object.keys(pourri.schema.etapes[0].positions).length === 0)

// --- 6. Evaluation et gardiens ---------------------------------------------
console.log('')
console.log('6. Evaluation et gardiens')
const avecNote = importerFichier(exporterSeance(seance)).seance.exercices[0]
verifier('note conservee', avecNote.evaluation.note === 4)
verifier('commentaire conserve', avecNote.evaluation.commentaire === 'Bien passe, garder le rythme')
verifier('compteur d utilisations conserve', avecNote.evaluation.nombreUtilisations === 3)
verifier('derniere utilisation conservee', avecNote.evaluation.derniereUtilisation === '2026-06-12')
verifier('format gardiens conserve', avecNote.formatGardiens === 'avec-joueurs')

const noteAberrante = importerFichier(JSON.stringify({
  format: 'handball-training', version: 1,
  contenu: { type: 'seance', seance: { titre: 'X', exercices: [
    { titre: 'Note trop haute', evaluation: { note: 12, nombreUtilisations: -4 } },
    { titre: 'Evaluation absurde', evaluation: 'excellente', formatGardiens: 'peut-etre' },
  ] } },
})).seance.exercices
verifier('note hors bornes ramenee a 0', noteAberrante[0].evaluation.note === 0)
verifier('compteur negatif ramene a 0', noteAberrante[0].evaluation.nombreUtilisations === 0)
verifier('evaluation non-objet remplacee', noteAberrante[1].evaluation.note === 0)
verifier('format gardiens inconnu remplace', noteAberrante[1].formatGardiens === 'avec-joueurs')

// --- 7. Compatibilite avec les fichiers de la version precedente ------------
console.log('')
console.log('7. Fichier ecrit avant l ajout des notes')
const ancienFichier = JSON.parse(exporterSeance(seance))
for (const exercice of ancienFichier.contenu.seance.exercices) {
  delete exercice.evaluation
  delete exercice.formatGardiens
  delete exercice.enParallele
}
const relu2 = importerFichier(JSON.stringify(ancienFichier)).seance.exercices[0]
verifier('ancien fichier toujours lisible', relu2.titre === 'Croise arriere-ailier')
verifier('evaluation par defaut ajoutee', relu2.evaluation.note === 0)
verifier('format gardiens par defaut', relu2.formatGardiens === 'avec-joueurs')
verifier('non parallele par defaut', relu2.enParallele === false)

// --- 8. Duree totale et exercices menes en parallele ------------------------
console.log('')
console.log('8. Duree totale')
const seanceMixte = nouvelleSeance('Test duree')
seanceMixte.exercices = [
  { ...nouvelExercice('Attaque'), duree: 30 },
  { ...nouvelExercice('Gardiens'), duree: 30, enParallele: true, formatGardiens: 'gardiens-seuls' },
  { ...nouvelExercice('Match'), duree: 20 },
]
verifier('exercice en parallele exclu du total', dureeTotale(seanceMixte) === 50,
  '(obtenu ' + dureeTotale(seanceMixte) + ')')
verifier('seance vide = 0 min', dureeTotale(nouvelleSeance()) === 0)

// --- 9. Relecture du stockage local -----------------------------------------
// Une seance enregistree par une version anterieure n'a pas les champs ajoutes
// depuis. Elle doit se completer toute seule, sans changer d'identite.
console.log('')
console.log('9. Relecture d une seance deja enregistree')
const stockee = JSON.parse(JSON.stringify(seance))
for (const exercice of stockee.exercices) {
  delete exercice.evaluation
  delete exercice.formatGardiens
  delete exercice.enParallele
}
const rechargee = normaliserSeance(stockee)
verifier('champs manquants completes', rechargee.exercices[0].evaluation.note === 0)
verifier('format gardiens complete', rechargee.exercices[0].formatGardiens === 'avec-joueurs')
verifier('identifiant de seance conserve', rechargee.id === seance.id)
verifier('identifiant d exercice conserve', rechargee.exercices[0].id === seance.exercices[0].id)
verifier('identifiants de jetons conserves',
  rechargee.exercices[0].schema.jetons[0].id === 'j1')
verifier('positions toujours rattachees aux jetons',
  rechargee.exercices[0].schema.etapes[0].positions.j1.x === 28)
verifier('donnees vides tolerees', normaliserSeance(undefined).exercices.length === 0)
verifier('date de creation conservee', rechargee.creeLe === seance.creeLe)

// L'import, lui, doit au contraire donner de nouveaux identifiants.
const importee = importerFichier(exporterSeance(seance)).seance
verifier('l import renouvelle l identifiant de seance', importee.id !== seance.id)
verifier('l import renouvelle l identifiant d exercice',
  importee.exercices[0].id !== seance.exercices[0].id)

// --- 10. Sauvegarde complete ------------------------------------------------
// Le stockage du navigateur disparait avec un nettoyage des donnees. Ce
// fichier est la seule copie transportable, et le seul moyen d emporter la
// bibliotheque personnelle, qu aucun autre export ne couvrait.
console.log('')
// --- 11. Reprise de la trame de la version 1 --------------------------------
console.log('')
console.log('11. Reprise des fiches de version 1')
// Le jeu d'essai porte encore « description » et « variantes » : la lecture
// doit les reverser dans « fonctionnement » et « evolution », sans rien perdre.
const v1 = importerFichier(exporterSeance(seance)).seance.exercices[0]
verifier('description devient fonctionnement', v1.fonctionnement === 'Deux vagues.',
  '(' + v1.fonctionnement + ')')
verifier('variantes devient evolution', v1.evolution === 'Avec defenseur passif',
  '(' + v1.evolution + ')')
verifier('les points cles ne bougent pas', v1.pointsCles === 'Prise d’intervalle')
verifier('les nouvelles rubriques naissent vides',
  v1.formeIntervention === '' && v1.misePlace === '' && v1.regulation === '')

// Et une fiche ecrite dans la nouvelle trame fait l aller-retour intacte.
const complete = { ...nouvelExercice('Trame complete'),
  formeIntervention: 'Approche inductive', misePlace: 'Trois colonnes',
  fonctionnement: 'Passer sur toutes les colonnes', regulation: 'Tir coin court en haut',
  pointsCles: 'Rester grand', evolution: 'Varier la forme de tirs' }
const seanceTrame = nouvelleSeance('Trame')
seanceTrame.exercices = [complete]
const relueTrame = importerFichier(exporterSeance(seanceTrame)).seance.exercices[0]
for (const cle of ['formeIntervention','misePlace','fonctionnement','regulation','pointsCles','evolution']) {
  verifier('la rubrique ' + cle + ' survit', relueTrame[cle] === complete[cle],
    '(' + relueTrame[cle] + ')')
}

console.log('10. Sauvegarde complete')
const modelePerso = { ...nouvelExercice('Mon exercice a moi'), duree: 25 }
const sauvegarde = exporterSauvegarde([seance], [modelePerso])
const restauree = importerFichier(sauvegarde)
verifier('le type est reconnu', restauree.type === 'sauvegarde')
verifier('les seances sont restaurees', restauree.seances.length === 1)
verifier('la bibliotheque personnelle aussi', restauree.modeles.length === 1)
verifier('le titre de la seance survit', restauree.seances[0].titre === 'Seance du mardi')
verifier('le modele personnel survit',
  restauree.modeles[0].titre === 'Mon exercice a moi' && restauree.modeles[0].duree === 25)
verifier('les exercices de la seance survivent',
  restauree.seances[0].exercices[0].titre === 'Croise arriere-ailier')
// Restaurer AJOUTE : les identifiants sont renouveles, rien n est ecrase.
verifier('l identifiant de seance est renouvele', restauree.seances[0].id !== seance.id)
verifier('celui du modele aussi', restauree.modeles[0].id !== modelePerso.id)

const videSauvegarde = importerFichier(exporterSauvegarde([], []))
verifier('une sauvegarde vide reste lisible',
  videSauvegarde.type === 'sauvegarde' && videSauvegarde.seances.length === 0)

const abimee = JSON.parse(exporterSauvegarde([seance], [modelePerso]))
abimee.contenu.seances = 'pas une liste'
abimee.contenu.modeles = [null, 'ni celle-ci']
const reparee = importerFichier(JSON.stringify(abimee))
verifier('une sauvegarde abimee ne fait pas tout perdre',
  reparee.seances.length === 0 && reparee.modeles.length === 0)

console.log(`\n=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
