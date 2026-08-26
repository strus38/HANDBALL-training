/**
 * Tests du planning du club.
 *
 * Six pieges que ces tests gardent.
 *
 * 1. Un nom d'equipe mal orthographie dans PLANNING ne casse rien de visible :
 *    l'equipe se retrouve simplement sans creneau, et toute l'automatisation
 *    se tait. Le premier test croise les deux listes pour que la faute de
 *    frappe echoue ici plutot que de passer inapercue six mois.
 *
 * 2. La duree se lit dans le creneau, pas dans une constante : les moins de 13
 *    ont 90 minutes le mardi et 75 le vendredi. Une seance deplacee doit
 *    changer de duree.
 *
 * 3. Un creneau partage vaut un DEMI-terrain. C'est la deduction qui declenche
 *    l'alerte d'espace sans que personne n'ait rien saisi.
 *
 * 4. Le prochain entrainement inclut AUJOURD'HUI : on prepare souvent la
 *    seance du soir meme.
 *
 * 5. La date d'une seance neuve tient compte de celles DEJA preparees : trois
 *    seances creees d'affilee doivent tomber sur trois entrainements
 *    differents. Mais une seance PASSEE ne retient rien — sans quoi une vieille
 *    seance de novembre ramenerait toutes les suivantes en arriere.
 *
 * 6. Une equipe hors planning ne doit rien declencher du tout. L'automatisme
 *    ne remplace pas la saisie libre, il s'ajoute quand il sait.
 *
 * 7. Un test ne doit pas dependre du JOUR OU ON LE LANCE. Les sections 7 et 8
 *    reposaient sur une seance nee sans date, donc calee sur le prochain
 *    entrainement a partir d'aujourd'hui : 90 minutes quand il tombait un
 *    mardi, 75 quand il tombait un vendredi. Les assertions etaient ecrites
 *    pour 90. Le test passait donc du lundi au mardi et echouait du mercredi
 *    au dimanche, sans que rien n'ait change dans le code — de quoi faire
 *    chercher un defaut la ou il n'y en avait pas, et de quoi bloquer la
 *    publication d'une version un jour sur deux. Toute seance dont la DUREE
 *    compte est desormais calee sur une date ecrite.
 *
 * Lancement : npm test
 */

import {
  EQUIPES_CLUB,
  PLANNING,
  calerSurLePlanning,
  creneauDuJour,
  creneauPartage,
  creneauSuivant,
  creneauxDe,
  dateProchaineSeance,
  depassementCreneau,
  dureeCreneau,
  equipeDuClub,
  espaceCreneau,
  exporterSeance,
  importerFichier,
  libelleCreneau,
  nouvelExercice,
  nouvelleSeance,
  prochainEntrainement,
  prochaineDateLibre,
  voisinesDe,
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

// Reperes de calendrier : 2026-09-01 est un mardi.
const MARDI = '2026-09-01'
const MERCREDI = '2026-09-02'
const VENDREDI = '2026-09-04'
const SAMEDI = '2026-09-05'

const U13G = 'Moins de 13 garçons'
const U16F = 'Moins de 16 filles'

console.log('')
console.log('1. Le planning et le referentiel se repondent')
const nommees = new Set(EQUIPES_CLUB.map((e) => e.nom))
const surLeTerrain = new Set(PLANNING.flatMap((c) => c.equipes))
verifier(
  'toute equipe du planning est au referentiel',
  [...surLeTerrain].every((nom) => nommees.has(nom)),
  [...surLeTerrain].filter((nom) => !nommees.has(nom)).join(', '),
)
verifier(
  'toute equipe du referentiel a au moins un creneau',
  [...nommees].every((nom) => surLeTerrain.has(nom)),
  [...nommees].filter((nom) => !surLeTerrain.has(nom)).join(', '),
)
verifier('la categorie d age suit le nom', equipeDuClub(U13G).categorieAge === '-13 ans')
verifier('une equipe inconnue ne se trouve pas', equipeDuClub('Selection U15') === undefined)
verifier('chaque creneau finit apres son debut', PLANNING.every((c) => dureeCreneau(c) > 0))

console.log('')
console.log('2. La duree se lit dans le creneau')
const mardi13 = creneauDuJour(U13G, MARDI)
const vendredi13 = creneauDuJour(U13G, VENDREDI)
verifier('mardi, les moins de 13 ont 90 minutes', dureeCreneau(mardi13) === 90)
verifier('vendredi, ils n en ont plus que 75', dureeCreneau(vendredi13) === 75)
verifier('et rien le mercredi', creneauDuJour(U13G, MERCREDI) === undefined)
verifier('les moins de 16 filles s entrainent trois fois', creneauxDe(U16F).length === 3)
verifier('libelle lisible', libelleCreneau(mardi13) === 'mardi 17h15 – 18h45')

console.log('')
console.log('3. Un creneau partage vaut un demi-terrain')
verifier('mardi 17h15 est partage', creneauPartage(mardi13) === true)
verifier('et vaut un demi-terrain', espaceCreneau(mardi13) === 'demi')
verifier(
  'la voisine est nommee',
  voisinesDe(mardi13, U13G).join('') === 'Moins de 13 filles',
)
const mercredi16 = creneauDuJour(U16F, MERCREDI)
verifier('mercredi, les moins de 16 filles sont seules', creneauPartage(mercredi16) === false)
verifier('et ont tout le terrain', espaceCreneau(mercredi16) === 'complet')
verifier('un groupe enchaine derriere elles', creneauSuivant(mercredi16).debut === '20:00')
verifier(
  'le dernier creneau du soir n a personne derriere',
  creneauSuivant(creneauDuJour('Seniors garçons', VENDREDI)) === undefined,
)

console.log('')
console.log('4. Le prochain entrainement')
verifier('depuis un mercredi, on va au vendredi', prochainEntrainement(U13G, MERCREDI) === VENDREDI)
verifier('le jour meme compte', prochainEntrainement(U13G, MARDI) === MARDI)
verifier('un samedi renvoie a la semaine suivante', prochainEntrainement(U13G, SAMEDI) === '2026-09-08')
verifier('une equipe hors planning ne propose rien', prochainEntrainement('Selection U15', MARDI) === '')
verifier('aucune equipe ne propose rien', prochainEntrainement('', MARDI) === '')

console.log('')
console.log('5. Une seance neuve nait calee sur le creneau')
const seance = nouvelleSeance('Séance', { equipe: U13G, categorieAge: '-13 ans' })
const creneauDeLaSeance = creneauDuJour(U13G, seance.date)
verifier('sa date tombe un jour d entrainement', creneauDeLaSeance !== undefined, seance.date)
verifier('elle connait la duree de son creneau', seance.dureeCreneau === dureeCreneau(creneauDeLaSeance))
verifier('et son espace disponible', seance.espaceDisponible === espaceCreneau(creneauDeLaSeance))

// Le cas qui doit rester exactement comme avant l'existence du planning.
const libre = nouvelleSeance('Séance', { equipe: 'Selection U15', categorieAge: '-15 ans' })
verifier('hors planning, aucune duree de creneau', libre.dureeCreneau === undefined)
verifier('hors planning, aucun espace impose', libre.espaceDisponible === '')
verifier('hors planning, le calage ne touche a rien', calerSurLePlanning(libre) === libre)

// Deplacer la seance change le creneau, donc la duree et l'espace.
const deplacee = calerSurLePlanning({ ...seance, date: VENDREDI })
verifier('deplacee au vendredi, elle ne dure plus que 75 minutes', deplacee.dureeCreneau === 75)
const seule = calerSurLePlanning({ ...seance, equipe: U16F, date: MERCREDI })
verifier('seule sur le terrain, elle recupere tout l espace', seule.espaceDisponible === 'complet')

console.log('')
console.log('6. La date suit les seances deja preparees')
const seanceLe = (date, equipe = U13G) => ({ ...nouvelleSeance('Séance', { equipe }), date })

verifier(
  'sans rien de prepare, c est le calendrier qui commande',
  dateProchaineSeance(U13G, [], MERCREDI) === VENDREDI,
)
verifier(
  'apres une seance au mardi, la suivante tombe au vendredi',
  dateProchaineSeance(U13G, [seanceLe(MARDI)], MARDI) === VENDREDI,
)
verifier(
  'apres le vendredi, on passe au mardi suivant',
  dateProchaineSeance(U13G, [seanceLe(MARDI), seanceLe(VENDREDI)], MARDI) === '2026-09-08',
)
// Le piege : une seance passee ne doit pas ramener la nouvelle en arriere.
verifier(
  'une seance de la semaine derniere ne retient rien',
  dateProchaineSeance(U13G, [seanceLe('2026-08-25')], MERCREDI) === VENDREDI,
)
verifier(
  'seule la derniere compte, meme mal rangee',
  dateProchaineSeance(U13G, [seanceLe(VENDREDI), seanceLe(MARDI)], MARDI) === '2026-09-08',
)
// Une equipe depannee un soir ne doit pas decaler la preparation de la sienne.
verifier(
  'les seances d une autre equipe sont ignorees',
  dateProchaineSeance(U13G, [seanceLe(MARDI, U16F)], MARDI) === MARDI,
)
verifier(
  'hors planning, aucune date proposee',
  dateProchaineSeance('Selection U15', [], MARDI) === '',
)

// La regle telle qu'elle se vit : trois seances preparees d'affilee.
const preparees = []
for (let i = 0; i < 3; i++) {
  preparees.unshift(nouvelleSeance('Séance', { equipe: U13G, categorieAge: '-13 ans' }, preparees))
}
const dates = preparees.map((s) => s.date)
verifier('trois seances d affilee tombent trois jours differents', new Set(dates).size === 3, dates.join(', '))
verifier(
  'et chacune sur un jour d entrainement',
  dates.every((d) => creneauDuJour(U13G, d) !== undefined),
  dates.join(', '),
)
verifier(
  'sans equipe au planning, elles gardent la date du jour',
  new Set([nouvelleSeance('A'), nouvelleSeance('B')].map((s) => s.date)).size === 1,
)

console.log('')
console.log('7. Le depassement de creneau')
const avec = (minutes, enParallele = false) => ({
  ...nouvelExercice('Atelier'),
  duree: minutes,
  enParallele,
})

/**
 * La seance sur laquelle se mesure un depassement : posee un mardi, donc 90
 * minutes, aujourd'hui comme dans six mois. La seance de la section 5 garde
 * sa date automatique — c'est elle qu'on y verifie — mais elle ne peut pas
 * servir ici, ou c'est la DUREE qui est en jeu.
 */
const seanceDuMardi = calerSurLePlanning({ ...seance, date: MARDI })
verifier('le creneau du mardi dure bien 90 minutes', seanceDuMardi.dureeCreneau === 90)
verifier('une seance vide ne depasse rien', depassementCreneau(seanceDuMardi) === 0)
verifier(
  'un plan qui tient ne dit rien',
  depassementCreneau({ ...seanceDuMardi, exercices: [avec(40), avec(45)] }) === 0,
)
verifier(
  'cinq minutes de trop sont signalees',
  depassementCreneau({ ...seanceDuMardi, exercices: [avec(50), avec(45)] }) === 5,
)
verifier(
  'un exercice en parallele n allonge pas la seance',
  depassementCreneau({ ...seanceDuMardi, exercices: [avec(50), avec(40), avec(30, true)] }) === 0,
)
verifier(
  'sans creneau connu, aucun depassement',
  depassementCreneau({ ...libre, exercices: [avec(200)] }) === 0,
)

console.log('')
console.log('8. La duree du creneau traverse les fichiers')
const relu = importerFichier(
  exporterSeance({ ...seanceDuMardi, exercices: [avec(50), avec(45)] }),
)
verifier('elle survit a l export', relu.seance.dureeCreneau === 90)
verifier('et l alerte se recalcule a l identique', depassementCreneau(relu.seance) === 5)

const ancien = JSON.parse(exporterSeance(seanceDuMardi))
delete ancien.contenu.seance.dureeCreneau
const reluAncien = importerFichier(JSON.stringify(ancien))
verifier(
  'un fichier ecrit avant le planning se relit sans creneau',
  reluAncien.seance.dureeCreneau === undefined,
)

console.log('')
console.log('Dupliquer tombe sur un soir LIBRE')
//
// Le defaut signale : dupliquer la seance du vendredi 4 septembre proposait le
// vendredi 11, ou une seance etait deja preparee. « Une semaine plus tard » ne
// regardait pas ce qui existait, et il fallait corriger la date a la main a
// chaque duplication — exactement la corvee que le planning doit supprimer.
{
  const equipe = 'Seniors garçons' // mardi et vendredi, comme dans le cas signale
  const seance = (date) => ({ ...nouvelleSeance('x', { equipe, categorieAge: '' }), date, equipe })
  const prises = (dates) => dates.map(seance)

  verifier(
    'sans rien apres, on prend le creneau suivant',
    prochaineDateLibre(equipe, prises(['2026-09-04']), '2026-09-04') === '2026-09-08',
  )
  verifier(
    'le cas signale : le 11 etant pris, on passe au 15',
    prochaineDateLibre(
      equipe,
      prises(['2026-09-01', '2026-09-04', '2026-09-08', '2026-09-11']),
      '2026-09-04',
    ) === '2026-09-15',
  )
  // Les TROUS comptent : on cherche la premiere place vide, pas la fin de la file.
  verifier(
    'un creneau libre au milieu est propose avant les suivants',
    prochaineDateLibre(equipe, prises(['2026-09-04', '2026-09-08']), '2026-09-04') ===
      '2026-09-11',
  )
  verifier(
    'plusieurs soirs pris d affilee sont enjambes',
    prochaineDateLibre(
      equipe,
      prises(['2026-09-04', '2026-09-08', '2026-09-11', '2026-09-15', '2026-09-18']),
      '2026-09-04',
    ) === '2026-09-22',
  )
  // Une seance d'une autre equipe n'occupe pas le creneau de celle-ci.
  const ailleurs = [
    { ...nouvelleSeance('x', { equipe: 'Moins de 11', categorieAge: '' }), date: '2026-09-08', equipe: 'Moins de 11' },
  ]
  verifier(
    'une autre equipe ne bloque pas le soir',
    prochaineDateLibre(equipe, ailleurs, '2026-09-04') === '2026-09-08',
  )
  verifier(
    'une equipe hors planning ne propose rien',
    prochaineDateLibre('Equipe inconnue', [], '2026-09-04') === '',
  )
  verifier(
    'la date de depart elle-meme n est jamais reproposee',
    prochaineDateLibre(equipe, [], '2026-09-08') !== '2026-09-08',
  )
}

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
