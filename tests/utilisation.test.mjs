/**
 * Tests de l'historique d'utilisation.
 *
 * Le piege que ces tests gardent : l'historique vit sur les COPIES posees dans
 * les seances, jamais sur la fiche de la bibliotheque. Un regroupement fait sur
 * le titre plutot que sur la reference se casserait au premier renommage, et
 * l'entraineur verrait son compteur retomber a zero sans comprendre pourquoi.
 *
 * Lancement : npm test
 */

import { cleUtilisation, indexerUtilisations, resumeUtilisation } from '../.build-tests/domaine.mjs'

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

/** Un exercice reduit a ce que l'index regarde. */
const exercice = (titre, { ref, fois = 0, derniere = '' } = {}) => ({
  titre,
  refModele: ref,
  evaluation: { note: 0, commentaire: '', nombreUtilisations: fois, derniereUtilisation: derniere },
})

const seance = (...exercices) => ({ exercices })

console.log('')
console.log('1. Cle de regroupement')
verifier(
  'la reference prime sur le titre',
  cleUtilisation(exercice('Peu importe', { ref: 'croise-arriere' })) === 'croise-arriere',
)
verifier(
  'sans reference, le titre normalise sert de cle',
  cleUtilisation(exercice('  Croisé ARRIÈRE  ')) === cleUtilisation(exercice('croise arriere')),
  '(la casse et les accents ne doivent pas separer un meme exercice)',
)
verifier(
  'une fiche sans titre a tout de meme une cle',
  cleUtilisation(exercice('   ')) === 'titre:sans titre',
)
verifier(
  'une reference ne se confond pas avec un titre identique',
  cleUtilisation(exercice('x', { ref: 'abc' })) !== cleUtilisation(exercice('abc')),
  "(le prefixe evite qu'un titre usurpe une reference)",
)

console.log('')
console.log('2. Agregation sur les seances')
const index = indexerUtilisations([
  seance(
    exercice('Croise arriere', { ref: 'croise-arriere', fois: 1, derniere: '2026-09-15' }),
    exercice('Jamais mene', { ref: 'jamais', fois: 0 }),
  ),
  seance(
    // Meme fiche, RENOMMEE par l'entraineur dans sa seance : la reference tient.
    exercice('Mon croise a moi', { ref: 'croise-arriere', fois: 2, derniere: '2026-09-22' }),
  ),
  seance(exercice('Fiche perso', { fois: 1, derniere: '2026-09-08' })),
])

verifier('les copies d une meme fiche sont additionnees', index.get('croise-arriere')?.fois === 3)
verifier(
  'le renommage dans une seance ne casse pas le compte',
  index.get('croise-arriere')?.fois === 3,
  "(c'est tout l'interet de la reference stable)",
)
verifier(
  'la date retenue est la plus recente',
  index.get('croise-arriere')?.derniere === '2026-09-22',
)
verifier('un exercice jamais mene n entre pas dans l index', index.get('jamais') === undefined)
verifier('une fiche personnelle est comptee sous son titre', index.get('titre:fiche perso')?.fois === 1)
verifier('aucune entree parasite', index.size === 2, `(${index.size} entrees)`)

console.log('')
console.log('3. Phrase affichee')
verifier('le singulier est respecte', resumeUtilisation({ fois: 1, derniere: '2026-09-15' }) === 'Menee 1 fois, la derniere le 15/09/2026')
verifier('le pluriel aussi', resumeUtilisation({ fois: 3, derniere: '2026-09-22' })?.startsWith('Menee 3 fois'))
verifier(
  'sans date, la phrase reste correcte',
  resumeUtilisation({ fois: 2, derniere: '' }) === 'Menee 2 fois',
)
verifier(
  'un exercice jamais mene ne dit rien',
  resumeUtilisation(undefined) === undefined && resumeUtilisation({ fois: 0, derniere: '' }) === undefined,
  "(afficher « jamais utilise » sur des dizaines de fiches serait du bruit)",
)

console.log('')
console.log('4. Ce qui est coche en mode terrain')
// Deux sources disent qu'un exercice a ete mene : le bouton « Marquer comme
// realise » de la fiche, et la case cochee sur le terrain. Les additionner
// compterait deux fois la meme seance ; les ignorer l'une ou l'autre ferait
// mentir le compteur. On prend donc le maximum par copie.
const surLeTerrain = (titre, { ref, fait = false, fois = 0, derniere = '' } = {}) => ({
  ...exercice(titre, { ref, fois, derniere }),
  deroule: { fait },
})

const menees = indexerUtilisations([
  { date: '2026-10-01', exercices: [surLeTerrain('Croise', { ref: 'croise', fait: true })] },
  { date: '2026-10-08', exercices: [surLeTerrain('Croise', { ref: 'croise', fait: true })] },
])
verifier('une case cochee suffit a compter une utilisation', menees.get('croise')?.fois === 2)
verifier(
  'la date retenue est celle de la seance',
  menees.get('croise')?.derniere === '2026-10-08',
  "(c'est ce jour-la qu'on l'a menee, meme si on ouvre le releve le lendemain)",
)

const pasCoche = indexerUtilisations([
  { date: '2026-10-01', exercices: [surLeTerrain('Croise', { ref: 'croise', fait: false })] },
])
verifier('une case decochee ne compte rien', pasCoche.get('croise') === undefined)

const lesDeux = indexerUtilisations([
  {
    date: '2026-10-01',
    exercices: [surLeTerrain('Croise', { ref: 'croise', fait: true, fois: 1, derniere: '2026-10-01' })],
  },
])
verifier(
  'cocher ce qui etait deja marque a la main ne compte pas double',
  lesDeux.get('croise')?.fois === 1,
  `(${lesDeux.get('croise')?.fois} : une copie posee dans une seance est UNE occurrence)`,
)

const marqueePlusieursFois = indexerUtilisations([
  {
    date: '2026-10-01',
    exercices: [surLeTerrain('Croise', { ref: 'croise', fait: true, fois: 3, derniere: '2026-10-01' })],
  },
])
verifier(
  'un compteur manuel plus eleve n est pas ecrase par la case',
  marqueePlusieursFois.get('croise')?.fois === 3,
)
console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
