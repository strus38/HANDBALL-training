/**
 * Le materiel consolide, le retour a chaud, et le rapprochement a l'import.
 *
 * Quatre pieges que ces tests gardent.
 *
 * 1. Le materiel d'une seance n'est pas la SOMME de celui des exercices. Ils se
 *    suivent : si le troisieme demande 12 plots et le septieme 8, on en charge
 *    12, pas 20. Additionner ferait porter huit plots inutiles — et une liste
 *    fausse cesse vite d'etre regardee.
 *
 * 2. Sauf pour ce qui se mene EN PARALLELE : ces exercices-la se deroulent
 *    pendant un autre, il faut les deux sur le terrain au meme moment.
 *
 * 3. Le retour a chaud ne vaut que s'il REMONTE. Il est rappele a l'ouverture
 *    de la seance suivante, en cherchant la derniere seance AVANT celle-ci qui
 *    en porte un — pas la derniere creee, car on prepare souvent deux seances
 *    d'avance.
 *
 * 4. A l'import, une fiche noteee par l'entraineur ne doit pas passer pour
 *    differente. La signature ignore l'evaluation : sans cela, mettre quatre
 *    etoiles suffirait a faire poser la question a chaque reimportation.
 *
 * Lancement : npm test
 */

import {
  consoliderMateriel,
  libelleMateriel,
  nouvelExercice,
  nouvelleSeance,
  retourPrecedent,
  dupliquerSeance,
  rapprocher,
  fusionner,
  signature,
  cleTitre,
  resumerImport,
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

/** Exercice minimal, avec son materiel. */
const ex = (titre, materiel, enParallele = false) => {
  const e = nouvelExercice(titre)
  e.materiel = materiel
  e.enParallele = enParallele
  return e
}

// -------------------------------------------------- 1. Materiel consolide

console.log('')
console.log('1. Le materiel se maximise, il ne s additionne pas')

const plots = consoliderMateriel([ex('A', ['12 plots']), ex('B', ['8 plots'])])
verifier('deux exercices qui se suivent : on prend le plus gros besoin',
  plots.length === 1 && plots[0].nombre === 12, JSON.stringify(plots))
verifier('le libelle reste au pluriel', plots[0].libelle === 'plots', plots[0].libelle)

const singulier = consoliderMateriel([ex('A', ['1 plot'])])
verifier('un seul objet reste au singulier',
  singulier[0].nombre === 1 && singulier[0].libelle === 'plot', JSON.stringify(singulier))

const accord = consoliderMateriel([ex('A', ['1 plot']), ex('B', ['6 plots'])])
verifier('« 1 plot » et « 6 plots » sont le meme objet',
  accord.length === 1 && accord[0].nombre === 6 && accord[0].libelle === 'plots',
  JSON.stringify(accord))

console.log('')
console.log('2. Ce qui se mene en parallele s ajoute')
const parallele = consoliderMateriel([
  ex('Joueurs', ['6 ballons']),
  ex('Gardiens a part', ['3 ballons'], true),
])
verifier('le materiel du parallele s ajoute au plus gros',
  parallele[0].nombre === 9, JSON.stringify(parallele))

console.log('')
console.log('3. Les ratios ne se comptent pas')
const ratio = consoliderMateriel([
  ex('A', ['1 ballon pour 2 joueurs']),
  ex('B', ['1 ballon pour 2 joueurs']),
  ex('C', ['1 ballon par Arrière']),
])
verifier('« 1 ballon pour 2 joueurs » n est pas additionne',
  ratio.every((a) => a.nombre === undefined), JSON.stringify(ratio))
verifier('et n apparait qu une fois', ratio.length === 2, JSON.stringify(ratio))

const sansNombre = consoliderMateriel([ex('A', ['chasubles']), ex('B', ['chasubles'])])
verifier('un article sans nombre passe tel quel, une seule fois',
  sansNombre.length === 1 && sansNombre[0].nombre === undefined && sansNombre[0].libelle === 'chasubles',
  JSON.stringify(sansNombre))

console.log('')
console.log('4. La liste telle qu on la lit')
const complet = consoliderMateriel([
  ex('A', ['12 plots', '4 haies']),
  ex('B', ['6 ballons', 'chasubles']),
])
verifier('les objets comptables viennent en tete, du plus nombreux au moins',
  libelleMateriel(complet) === '12 plots, 6 ballons, 4 haies, chasubles',
  libelleMateriel(complet))
verifier('une seance sans materiel rend une liste vide',
  consoliderMateriel([nouvelExercice('X')]).length === 0)
// Un exercice qui cite deux fois le meme objet ne se fait pas concurrence.
const doublon = consoliderMateriel([ex('A', ['2 ballons', '6 ballons'])])
verifier('un exercice qui se repete ne compte que son plus gros besoin',
  doublon.length === 1 && doublon[0].nombre === 6, JSON.stringify(doublon))

// ---------------------------------------------------- 5. Retour a chaud

console.log('')
console.log('5. Le retour a chaud remonte tout seul')

const faire = (titre, date, retour = '') => {
  const s = nouvelleSeance(titre)
  s.date = date
  s.retour = retour
  return s
}

const mardi = faire('Mardi', '2026-09-01', 'Six absents, on reprend la relance jeudi.')
const jeudi = faire('Jeudi', '2026-09-03')
const mardiSuivant = faire('Mardi suivant', '2026-09-08')
const toutes = [mardiSuivant, jeudi, mardi]

verifier('la seance du jeudi rappelle celle du mardi',
  retourPrecedent(jeudi, toutes)?.id === mardi.id)
verifier('une seance sans precedente ne rappelle rien',
  retourPrecedent(mardi, toutes) === undefined)
// Le jeudi n'a pas de retour : on remonte au mardi, qui a quelque chose a dire.
verifier('une seance sans retour est enjambee',
  retourPrecedent(mardiSuivant, toutes)?.id === mardi.id)
verifier('une seance ne se rappelle pas elle-meme',
  retourPrecedent(mardi, [mardi]) === undefined)

jeudi.retour = 'Mieux, le groupe a joué le jeu.'
verifier('c est bien la PLUS RECENTE des precedentes qui remonte',
  retourPrecedent(mardiSuivant, toutes)?.id === jeudi.id)

const copie = dupliquerSeance(mardi, { date: '2026-09-15' })
verifier('une seance dupliquee part sans retour', copie.retour === '')
verifier('et sans heure de demarrage', copie.demarreLe === undefined)

// -------------------------------------------- 6. Rapprochement a l import

console.log('')
console.log('6. Ce qui arrive et ce qui est deja la')

const existante = nouvelExercice('Croisé arrière - ailier')
existante.fonctionnement = 'Le texte d origine.'
existante.evaluation = { note: 4, commentaire: 'a bien marché', nombreUtilisations: 3, derniereUtilisation: '2026-09-01' }

const identique = JSON.parse(JSON.stringify(existante))
identique.id = 'autre-id'
const divergente = JSON.parse(JSON.stringify(existante))
divergente.id = 'encore-un'
divergente.fonctionnement = 'Le texte corrigé.'
const inconnue = nouvelExercice('Montée de balle')

const r = rapprocher([identique, divergente, inconnue], [existante])
verifier('un titre inconnu entre sans question', r.nouvelles.length === 1)
verifier('un contenu identique n appelle aucune decision', r.identiques.length === 1)
verifier('un titre connu au contenu different est la seule question',
  r.divergentes.length === 1 && r.divergentes[0].existante.id === existante.id)

// Le piege : noter une fiche ne doit pas la faire passer pour differente.
const notee = JSON.parse(JSON.stringify(existante))
notee.evaluation = { note: 1, commentaire: 'bof', nombreUtilisations: 9, derniereUtilisation: '2026-10-01' }
verifier('la note de l entraineur ne change pas la signature',
  signature(notee) === signature(existante))

verifier('le titre se compare sans accent ni casse',
  cleTitre('Croisé Arrière') === cleTitre('croise arriere'))

const fusionnee = fusionner(r.divergentes[0])
verifier('la fusion prend le texte de la nouvelle',
  fusionnee.fonctionnement === 'Le texte corrigé.')
verifier('elle garde l identifiant de l ancienne', fusionnee.id === existante.id)
verifier('et surtout la note de l entraineur',
  fusionnee.evaluation.note === 4 && fusionnee.evaluation.nombreUtilisations === 3)

console.log('')
console.log('7. Le resume dit ce qui a ete fait')
verifier('un seul poste',
  resumerImport({ ajoutees: 20, remplacees: 0, inchangees: 0, ignorees: 0 }) === '20 fiches ajoutées.',
  resumerImport({ ajoutees: 20, remplacees: 0, inchangees: 0, ignorees: 0 }))
verifier('deux postes sont relies par « et »',
  resumerImport({ ajoutees: 14, remplacees: 6, inchangees: 0, ignorees: 0 }) ===
    '14 fiches ajoutées et 6 fiches remplacées.',
  resumerImport({ ajoutees: 14, remplacees: 6, inchangees: 0, ignorees: 0 }))
verifier('le singulier est respecte',
  resumerImport({ ajoutees: 1, remplacees: 0, inchangees: 0, ignorees: 0 }) === '1 fiche ajoutée.',
  resumerImport({ ajoutees: 1, remplacees: 0, inchangees: 0, ignorees: 0 }))
verifier('les postes vides sont tus',
  !resumerImport({ ajoutees: 3, remplacees: 0, inchangees: 2, ignorees: 0 }).includes('0 '),
  resumerImport({ ajoutees: 3, remplacees: 0, inchangees: 2, ignorees: 0 }))
verifier('une importation vide le dit',
  resumerImport({ ajoutees: 0, remplacees: 0, inchangees: 0, ignorees: 0 }) === 'Aucune fiche à importer.')

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
