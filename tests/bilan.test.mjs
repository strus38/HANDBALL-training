/**
 * Tests du bilan de saison.
 *
 * Lancement : npm test
 */

import {
  calculerBilan,
  saisonDe,
  toutesLesDates,
  pourcentage,
  nouvelExercice,
  nouvelleSeance,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

function seance(date, titre, exercices) {
  const s = nouvelleSeance(titre)
  s.date = date
  s.exercices = exercices.map((e) => ({
    ...nouvelExercice(e.titre),
    categorie: e.categorie ?? 'attaque',
    duree: e.duree ?? 20,
    enParallele: e.enParallele ?? false,
    formatGardiens: e.formatGardiens ?? 'avec-joueurs',
    evaluation: {
      note: e.note ?? 0, commentaire: '', nombreUtilisations: 0,
      derniereUtilisation: e.derniere ?? '',
    },
  }))
  return s
}

const saison = [
  seance('2025-09-16', 'Reprise', [
    { titre: 'Echauffement montee de balle', categorie: 'echauffement', duree: 15, note: 4 },
    { titre: 'Croise arriere-ailier', categorie: 'attaque', duree: 25, note: 5 },
  ]),
  seance('2025-10-14', 'Defense', [
    { titre: 'Echauffement montee de balle', categorie: 'echauffement', duree: 15, note: 4 },
    { titre: 'Glissement 6-0', categorie: 'defense', duree: 30, note: 3 },
    { titre: 'Gardiens seuls', categorie: 'gardien', duree: 20, enParallele: true,
      formatGardiens: 'gardiens-seuls' },
  ]),
  seance('2025-10-21', 'Attaque', [
    { titre: 'Croise arriere-ailier', categorie: 'attaque', duree: 25, note: 5 },
    { titre: 'Circuit intermittent', categorie: 'physique', duree: 20, note: 1 },
  ]),
  // Hors saison : ne doit jamais entrer dans le bilan 2025-2026.
  seance('2025-06-10', 'Saison precedente', [{ titre: 'Ancien exercice', duree: 60 }]),
]

console.log('')
console.log('1. Decoupage des saisons')
verifier('septembre ouvre la saison', saisonDe('2025-09-16').debut === '2025-09-01')
verifier('et elle se termine en aout', saisonDe('2025-09-16').fin === '2026-08-31')
verifier('janvier appartient a la saison commencee en septembre',
  saisonDe('2026-01-15').debut === '2025-09-01')
verifier('juin aussi', saisonDe('2026-06-30').debut === '2025-09-01')
verifier('aout encore', saisonDe('2026-08-30').debut === '2025-09-01')
verifier('septembre suivant ouvre la saison d apres',
  saisonDe('2026-09-01').debut === '2026-09-01')
verifier('le libelle porte les deux annees', saisonDe('2025-10-01').libelle === 'Saison 2025-2026')

console.log('')
console.log('2. Perimetre')
const bilan = calculerBilan(saison, saisonDe('2025-10-14'))
verifier('les seances hors periode sont ecartees', bilan.nombreSeances === 3,
  '(' + bilan.nombreSeances + ')')
verifier('l exercice de la saison precedente n apparait pas',
  !bilan.lesPlusUtilises.some((u) => u.titre === 'Ancien exercice'))
verifier('toutesLesDates couvre de la premiere a la derniere',
  toutesLesDates(saison).debut === '2025-06-10' && toutesLesDates(saison).fin === '2025-10-21')
verifier('historique vide : periode reduite a aujourd hui',
  toutesLesDates([]).debut === toutesLesDates([]).fin)

console.log('')
console.log('3. Volumes')
// 40 + 45 + 45 = 130 min (les 20 min de gardiens sont en parallele)
verifier('duree totale hors exercices en parallele', bilan.minutes === 130, '(' + bilan.minutes + ')')
verifier('nombre d exercices', bilan.nombreExercices === 7, '(' + bilan.nombreExercices + ')')
verifier('moyenne d exercices par seance',
  Math.abs(bilan.moyenneExercicesParSeance - 7 / 3) < 0.01)
verifier('moyenne de duree par seance',
  Math.abs(bilan.moyenneMinutesParSeance - 130 / 3) < 0.01)
verifier('seances avec travail specifique gardiens', bilan.seancesAvecGardiens === 1)

console.log('')
console.log('4. Repartition par categorie')
const parCategorie = Object.fromEntries(bilan.repartition.map((p) => [p.categorie, p.minutes]))
verifier('attaque cumulee sur deux seances', parCategorie.attaque === 50, JSON.stringify(parCategorie))
verifier('echauffement cumule', parCategorie.echauffement === 30)
verifier('defense', parCategorie.defense === 30)
verifier('physique', parCategorie.physique === 20)
verifier('la categorie gardien est presente mais sans minutes',
  parCategorie.gardien === 0, JSON.stringify(parCategorie))
verifier('classee par temps decroissant',
  bilan.repartition[0].minutes >= bilan.repartition[1].minutes)
verifier('le total des minutes correspond',
  bilan.repartition.reduce((t, p) => t + p.minutes, 0) === bilan.minutes)
verifier('les categories jamais abordees sont listees',
  bilan.categoriesAbsentes.includes('technique') && bilan.categoriesAbsentes.includes('transition'),
  JSON.stringify(bilan.categoriesAbsentes))
verifier('une categorie travaillee n est pas dite absente',
  !bilan.categoriesAbsentes.includes('attaque'))
verifier('pourcentage', pourcentage({ minutes: 50 }, 130) === 38)
verifier('pourcentage sans total', pourcentage({ minutes: 50 }, 0) === 0)

console.log('')
console.log('5. Mois')
verifier('deux mois travailles', bilan.parMois.length === 2, JSON.stringify(bilan.parMois))
verifier('septembre en premier', bilan.parMois[0].cle === '2025-09')
verifier('libelle lisible', bilan.parMois[0].libelle === 'septembre 2025', bilan.parMois[0].libelle)
verifier('octobre compte deux seances', bilan.parMois[1].seances === 2)
verifier('et cumule leurs minutes', bilan.parMois[1].minutes === 90, '(' + bilan.parMois[1].minutes + ')')

console.log('')
console.log('6. Exercices les plus utilises')
const top = bilan.lesPlusUtilises
verifier('regroupes par titre, pas par identifiant',
  top.find((u) => u.titre === 'Croise arriere-ailier').seances === 2)
verifier('l echauffement aussi',
  top.find((u) => u.titre === 'Echauffement montee de balle').seances === 2)
verifier('les minutes sont cumulees',
  top.find((u) => u.titre === 'Croise arriere-ailier').minutes === 50)
verifier('la note moyenne est calculee',
  top.find((u) => u.titre === 'Croise arriere-ailier').note === 5)
verifier('un exercice non evalue n a pas de note',
  top.find((u) => u.titre === 'Gardiens seuls').note === undefined)
verifier('classement du plus utilise au moins utilise',
  top[0].seances >= top[top.length - 1].seances)
verifier('la derniere utilisation est la plus recente',
  top.find((u) => u.titre === 'Croise arriere-ailier').derniereUtilisation === '2025-10-21')
verifier('un exercice en parallele ne compte pas ses minutes',
  top.find((u) => u.titre === 'Gardiens seuls').minutes === 0)

console.log('')
console.log('7. Exercices a revoir')
verifier('un exercice mal note remonte', bilan.aRevoir.length === 1, JSON.stringify(bilan.aRevoir))
verifier('c est le bon', bilan.aRevoir[0].titre === 'Circuit intermittent')
verifier('les bons exercices ne sont pas signales',
  !bilan.aRevoir.some((u) => u.titre === 'Croise arriere-ailier'))
verifier('un exercice non evalue non plus',
  !bilan.aRevoir.some((u) => u.titre === 'Gardiens seuls'))

console.log('')
console.log('8. Cas limites')
const vide = calculerBilan([], saisonDe('2025-10-01'))
verifier('aucune seance : bilan neutre',
  vide.nombreSeances === 0 && vide.minutes === 0 && vide.lesPlusUtilises.length === 0)
verifier('pas de division par zero', vide.moyenneMinutesParSeance === 0)
verifier('toutes les categories sont alors absentes', vide.categoriesAbsentes.length === 8)

const sansTitre = calculerBilan(
  [seance('2025-09-20', 'X', [{ titre: '   ' }])], saisonDe('2025-09-20'))
verifier('un exercice sans titre reste comptabilise',
  sansTitre.lesPlusUtilises[0].titre === 'Sans titre', JSON.stringify(sansTitre.lesPlusUtilises))

const casse = calculerBilan(
  [seance('2025-09-20', 'A', [{ titre: 'Croise Arriere-Ailier' }]),
   seance('2025-09-27', 'B', [{ titre: 'croise arriere-ailier' }])],
  saisonDe('2025-09-20'))
verifier('la casse et les accents ne separent pas un meme exercice',
  casse.lesPlusUtilises.length === 1 && casse.lesPlusUtilises[0].seances === 2,
  JSON.stringify(casse.lesPlusUtilises))

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
