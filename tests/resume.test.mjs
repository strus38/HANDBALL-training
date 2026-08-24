/**
 * Tests du resume d'une seance et de sa duplication.
 *
 * Lancement : npm test
 */

import {
  resumerSeance,
  dupliquerSeance,
  dateEnToutesLettres,
  ecartEnJours,
  situerDansLeTemps,
  nouvelExercice,
  nouvelleSeance,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

function seanceDeTest() {
  const s = nouvelleSeance('Seance du mardi')
  s.date = '2026-08-25'
  s.equipe = 'Seniors garcons'
  s.categorieAge = '+18 ans'
  s.effectifJoueurs = 10
  s.effectifGardiens = 1
  s.exercices = [
    { ...nouvelExercice('Echauffement'), categorie: 'echauffement', duree: 15,
      nombreJoueurs: 8, materiel: ['ballons', 'plots'],
      evaluation: { note: 4, commentaire: 'bien', nombreUtilisations: 3, derniereUtilisation: '2026-06-01' } },
    { ...nouvelExercice('Croise'), categorie: 'attaque', duree: 20,
      nombreJoueurs: 12, materiel: ['ballons', 'chasubles'],
      evaluation: { note: 2, commentaire: '', nombreUtilisations: 1, derniereUtilisation: '' } },
    { ...nouvelExercice('Gardiens'), categorie: 'gardien', duree: 30,
      nombreJoueurs: 0, nombreGardiens: 2, enParallele: true,
      formatGardiens: 'gardiens-seuls', materiel: ['  ballons  '],
      evaluation: { note: 0, commentaire: '', nombreUtilisations: 0, derniereUtilisation: '' } },
    { ...nouvelExercice('Match'), categorie: 'attaque', duree: 10, nombreJoueurs: 10, materiel: [] },
  ]
  return s
}

console.log('')
console.log('1. Resume d une seance')
const r = resumerSeance(seanceDeTest())
verifier('quatre exercices comptes', r.nombreExercices === 4)
verifier('duree hors exercice en parallele', r.minutes === 45, '(' + r.minutes + ')')
verifier('exercice en parallele signale', r.nombreEnParallele === 1)
verifier('categories regroupees', r.repartition.length === 3, JSON.stringify(r.repartition.map(p => p.categorie)))
verifier('attaque en tete car la plus longue',
  r.repartition[0].categorie === 'attaque' && r.repartition[0].minutes === 30,
  JSON.stringify(r.repartition[0]))
verifier('les deux exercices d attaque sont comptes', r.repartition[0].nombre === 2)
verifier('la categorie gardien ne compte aucune minute',
  r.repartition.find((p) => p.categorie === 'gardien').minutes === 0)
verifier('note moyenne sur les seuls exercices evalues', r.noteMoyenne === 3, '(' + r.noteMoyenne + ')')
verifier('nombre d evalues correct', r.nombreEvalues === 2)
verifier('materiel dedoublonne et nettoye',
  JSON.stringify(r.materiel) === JSON.stringify(['ballons', 'chasubles', 'plots']),
  JSON.stringify(r.materiel))
verifier('travail specifique gardiens detecte', r.travailGardiens === true)
verifier('exercice trop gourmand signale', r.nombreIncompatibles === 2,
  '(' + r.nombreIncompatibles + ' : le croise a 12 joueurs et les 2 gardiens)')

const vide = resumerSeance(nouvelleSeance('Vide'))
verifier('seance vide : aucune note moyenne', vide.noteMoyenne === undefined)
verifier('seance vide : zero minute', vide.minutes === 0)
verifier('seance vide : aucun materiel', vide.materiel.length === 0)

console.log('')
console.log('2. Duplication')
const origine = seanceDeTest()
const copie = dupliquerSeance(origine, {
  titre: 'Seance du jeudi',
  date: '2026-08-27',
  effectifJoueurs: 14,
  effectifGardiens: 2,
})
verifier('nouvel identifiant de seance', copie.id !== origine.id)
verifier('titre remplace', copie.titre === 'Seance du jeudi')
verifier('date remplacee', copie.date === '2026-08-27')
verifier('effectif remplace', copie.effectifJoueurs === 14 && copie.effectifGardiens === 2)
verifier('equipe conservee faute de remplacement', copie.equipe === 'Seniors garcons')
verifier('tous les exercices copies', copie.exercices.length === 4)
verifier('identifiants d exercices renouveles',
  copie.exercices.every((e, i) => e.id !== origine.exercices[i].id))
verifier('contenu des exercices conserve', copie.exercices[1].titre === 'Croise')
verifier('les notes suivent la copie', copie.exercices[0].evaluation.note === 4)
verifier('le compteur d utilisations suit', copie.exercices[0].evaluation.nombreUtilisations === 3)

const neuve = dupliquerSeance(origine, { reinitialiserEvaluations: true })
verifier('option de remise a zero des notes', neuve.exercices[0].evaluation.note === 0)
verifier('option de remise a zero des compteurs',
  neuve.exercices[0].evaluation.nombreUtilisations === 0)
verifier('titre par defaut suffixe', neuve.titre === 'Seance du mardi (copie)')

// L'independance est le point critique : modifier la copie ne doit rien changer.
copie.exercices[0].titre = 'Modifie dans la copie'
copie.exercices[0].schema.jetons.push({ id: 'x', type: 'plot', etiquette: '' })
copie.effectifJoueurs = 99
verifier('la seance d origine est intacte', origine.exercices[0].titre === 'Echauffement')
verifier('l effectif d origine est intact', origine.effectifJoueurs === 10)
verifier('les schemas ne sont pas partages',
  origine.exercices[0].schema.jetons.length !== copie.exercices[0].schema.jetons.length)

const avecJetons = nouvelleSeance('Avec schema')
const exercice = nouvelExercice('Schema')
exercice.schema.jetons = [{ id: 'j1', type: 'attaquant', etiquette: '1', orientation: 90 }]
exercice.schema.etapes[0].positions = { j1: { x: 30, y: 10, orientation: 90 } }
avecJetons.exercices = [exercice]
const copieSchema = dupliquerSeance(avecJetons)
const nouveauJeton = copieSchema.exercices[0].schema.jetons[0]
verifier('les jetons recoivent de nouveaux identifiants', nouveauJeton.id !== 'j1')
verifier('les positions suivent les nouveaux jetons',
  copieSchema.exercices[0].schema.etapes[0].positions[nouveauJeton.id].x === 30)
verifier('l orientation est conservee',
  copieSchema.exercices[0].schema.etapes[0].positions[nouveauJeton.id].orientation === 90)

console.log('')
console.log('3. Dates')
verifier('date en toutes lettres',
  dateEnToutesLettres('2026-08-25') === 'mardi 25 août 2026',
  '(' + dateEnToutesLettres('2026-08-25') + ')')
verifier('date invalide renvoyee telle quelle', dateEnToutesLettres('') === '')
verifier('ecart nul le jour meme', ecartEnJours('2026-08-25', '2026-08-25') === 0)
verifier('ecart positif dans le futur', ecartEnJours('2026-08-27', '2026-08-25') === 2)
verifier('ecart negatif dans le passe', ecartEnJours('2026-08-20', '2026-08-25') === -5)
verifier('ecart correct a cheval sur un mois',
  ecartEnJours('2026-09-01', '2026-08-25') === 7,
  '(' + ecartEnJours('2026-09-01', '2026-08-25') + ')')
verifier('aujourd hui', situerDansLeTemps('2026-08-25', '2026-08-25') === "aujourd'hui")
verifier('demain', situerDansLeTemps('2026-08-26', '2026-08-25') === 'demain')
verifier('hier', situerDansLeTemps('2026-08-24', '2026-08-25') === 'hier')
verifier('dans quelques jours', situerDansLeTemps('2026-08-28', '2026-08-25') === 'dans 3 jours')
verifier('il y a quelques jours', situerDansLeTemps('2026-08-21', '2026-08-25') === 'il y a 4 jours')
verifier('en semaines au dela', situerDansLeTemps('2026-09-15', '2026-08-25').includes('semaines'),
  situerDansLeTemps('2026-09-15', '2026-08-25'))

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
