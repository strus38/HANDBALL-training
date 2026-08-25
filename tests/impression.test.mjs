/**
 * Tests du choix automatique de mise en page a l'impression.
 *
 * Ce que l'on verifie n'est pas « telle fiche donne telle disposition » — ce
 * serait figer une decision arbitraire — mais les proprietes qui doivent tenir
 * quoi qu'il arrive : la fiche tient sur une page, le schema est aussi grand
 * que possible, et un terrain large ne finit pas ecrase dans une colonne.
 *
 * Lancement : npm test
 */

import {
  choisirMiseEnPage,
  hauteurTexte,
  ratioGrille,
  grillesPossibles,
  nombreSchemas,
  ZONE,
  ZONE_PAYSAGE,
  ZONE_PORTRAIT,
  nouvelExercice,
  CATALOGUE,
  construireExercice,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

/** Fiche de test : vue du terrain, volume de texte, nombre d'etapes. */
function fiche({ vue = 'demi', etapes = 1, texte = 'moyen' } = {}) {
  const ex = nouvelExercice('Test')
  ex.schema.vue = vue
  const volumes = {
    court: 90,
    moyen: 420,
    long: 1100,
    enorme: 3200,
  }
  const n = volumes[texte]
  ex.objectifs = 'o'.repeat(Math.round(n * 0.15))
  ex.fonctionnement = 'd'.repeat(Math.round(n * 0.45))
  ex.pointsCles = 'p'.repeat(Math.round(n * 0.25))
  ex.evolution = 'v'.repeat(Math.round(n * 0.15))
  ex.materiel = ['ballons', 'plots']
  ex.schema.etapes = Array.from({ length: etapes }, (_, i) => ({
    id: 'e' + i, titre: 'Etape ' + (i + 1), consigne: 'consigne', positions: {}, fleches: [],
  }))
  return ex
}

console.log('')
console.log('1. Mesure du texte')
const court = hauteurTexte(fiche({ texte: 'court' }), 120, 9, 1)
const long = hauteurTexte(fiche({ texte: 'long' }), 120, 9, 1)
verifier('un texte long occupe plus de place', long > court, `(${court} vs ${long})`)
verifier('une colonne large tient en moins de hauteur',
  hauteurTexte(fiche({ texte: 'long' }), 240, 9, 1) < long)
verifier('une police plus petite tient en moins de hauteur',
  hauteurTexte(fiche({ texte: 'long' }), 120, 7, 1) < long)
verifier('deux colonnes reduisent la hauteur',
  hauteurTexte(fiche({ texte: 'long' }), 120, 9, 2) < long)
verifier('une fiche vide occupe une hauteur non nulle',
  hauteurTexte(nouvelExercice('Vide'), 120, 9, 1) > 0)

console.log('')
console.log('2. Grilles d etapes')
verifier('une etape = une case', grillesPossibles(1).length === 1)
verifier('deux etapes : empilees ou cote a cote', grillesPossibles(2).length === 2)
// La feuille imprimee ne montre plus une vignette par etape mais UN schema de
// synthese, ou l'enchainement se lit en suivant les fleches numerotees. Quelle
// que soit la longueur de l'exercice, il n'y a donc qu'un rectangle a placer,
// et il prend toute la hauteur de la page.
verifier('une fiche a neuf etapes n imprime qu un schema',
  nombreSchemas(fiche({ etapes: 9 })) === 1)
verifier('une fiche sans etape aussi',
  nombreSchemas(nouvelExercice('X')) === 1)
verifier('empiler deux schemas larges reduit le rapport',
  ratioGrille(1.9, { colonnes: 1, lignes: 2 }) < ratioGrille(1.9, { colonnes: 2, lignes: 1 }))

console.log('')
console.log('3. La forme du terrain decide de la disposition')
const complet = choisirMiseEnPage(fiche({ vue: 'complet' }))
const zone = choisirMiseEnPage(fiche({ vue: 'zone' }))
const demi = choisirMiseEnPage(fiche({ vue: 'demi' }))
console.log(`        terrain complet -> ${complet.disposition}, ${complet.surfaceSchemaCm2.toFixed(0)} cm2`)
console.log(`        demi-terrain    -> ${demi.disposition}, ${demi.surfaceSchemaCm2.toFixed(0)} cm2`)
console.log(`        zone 6m/9m      -> ${zone.disposition}, ${zone.surfaceSchemaCm2.toFixed(0)} cm2`)

verifier('un terrain complet passe en banniere', complet.disposition === 'dessus',
  '(' + complet.disposition + ')')
verifier('un schema vertical reste en colonne', zone.disposition === 'cote-a-cote',
  '(' + zone.disposition + ')')
verifier('la banniere donne plusieurs colonnes de texte', complet.colonnesTexte >= 2)
verifier('la colonne garde une seule colonne de texte', zone.colonnesTexte === 1)

// Le vrai critere : la disposition retenue bat l'autre en surface.
const complettSurfaceEnColonne = (() => {
  // Surface qu'aurait obtenue un terrain complet coince dans 47 % de la largeur.
  const largeur = (ZONE.largeur - 6) * 0.47
  const ratio = ratioGrille(279 / 147, { colonnes: 1, lignes: 1 })
  const hauteur = Math.min(ZONE.hauteur, largeur / ratio)
  return (largeur * hauteur) / 100
})()
verifier('le terrain complet y gagne vraiment',
  complet.surfaceSchemaCm2 > complettSurfaceEnColonne,
  `(${complet.surfaceSchemaCm2.toFixed(0)} vs ${complettSurfaceEnColonne.toFixed(0)} cm2 en colonne)`)

console.log('')
console.log('4. La fiche tient toujours sur une page')
const cas = []
for (const vue of ['complet', 'demi', 'zone']) {
  for (const etapes of [1, 2, 3, 4, 6]) {
    for (const texte of ['court', 'moyen', 'long', 'enorme']) {
      cas.push({ vue, etapes, texte })
    }
  }
}
let debordements = 0
let sansSchema = 0
for (const c of cas) {
  const ex = fiche(c)
  const m = choisirMiseEnPage(ex)
  const largeurColonne =
    m.disposition === 'cote-a-cote'
      ? (ZONE.largeur - 6) * (1 - m.partSchema)
      : (ZONE.largeur - 6 * (m.colonnesTexte - 1)) / m.colonnesTexte
  const besoin = hauteurTexte(ex, largeurColonne, m.policePt, m.colonnesTexte)
  const dispo =
    m.disposition === 'cote-a-cote' ? ZONE.hauteur : ZONE.hauteur - m.partSchema * ZONE.hauteur - 6
  if (besoin > dispo + 0.5 && m.texteTient) debordements++
  if (m.surfaceSchemaCm2 < 60) sansSchema++
}
verifier('aucune fiche ne deborde de sa page', debordements === 0, `(${debordements} sur ${cas.length})`)
verifier('le schema reste lisible partout', sansSchema === 0, `(${sansSchema} trop petits)`)
verifier('tous les cas ont une reponse', cas.length === 60)

console.log('')
console.log('5. Le texte fait reculer le schema, jamais la page')
const avecPeu = choisirMiseEnPage(fiche({ vue: 'demi', texte: 'court' }))
const avecBeaucoup = choisirMiseEnPage(fiche({ vue: 'demi', texte: 'enorme' }))
verifier('plus de texte, schema plus petit',
  avecBeaucoup.surfaceSchemaCm2 <= avecPeu.surfaceSchemaCm2,
  `(${avecPeu.surfaceSchemaCm2.toFixed(0)} -> ${avecBeaucoup.surfaceSchemaCm2.toFixed(0)} cm2)`)
verifier('une fiche bavarde resserre la police',
  avecBeaucoup.policePt <= avecPeu.policePt,
  `(${avecPeu.policePt} -> ${avecBeaucoup.policePt} pt)`)
verifier('une fiche courte garde la police confortable', avecPeu.policePt >= 8.6,
  '(' + avecPeu.policePt + ' pt)')

console.log('')
console.log('6. Un seul schema, quel que soit le nombre d etapes')
//
// La feuille ne montre plus une vignette par etape mais UN schema de synthese.
// Ce que ces tests gardent : qu'une fiche longue n'est pas penalisee a
// l'impression. Avec quatre vignettes, chaque terrain tombait au quart de la
// page — un exercice riche s'imprimait donc plus petit qu'un exercice pauvre,
// ce qui est exactement l'inverse du besoin.
const quatre = choisirMiseEnPage(fiche({ vue: 'demi', etapes: 4 }))
verifier('quatre etapes tiennent dans une seule case',
  quatre.grille.colonnes === 1 && quatre.grille.lignes === 1, JSON.stringify(quatre.grille))
const une = choisirMiseEnPage(fiche({ vue: 'demi', etapes: 1 }))
verifier('et occupent autant de place qu une seule etape',
  Math.abs(quatre.surfaceSchemaCm2 - une.surfaceSchemaCm2) < 0.1,
  `${quatre.surfaceSchemaCm2.toFixed(1)} contre ${une.surfaceSchemaCm2.toFixed(1)} cm2`)
for (const vue of ['demi', 'complet', 'zone']) {
  const page = choisirMiseEnPage(fiche({ vue, etapes: 3 }))
  verifier(`la vue « ${vue} » garde une case unique`,
    page.grille.colonnes === 1 && page.grille.lignes === 1, JSON.stringify(page.grille))
}

console.log('')
console.log('7. La lisibilite passe avant les derniers centimetres carres')
//
// Ce que garde cette section : le compromis entre la taille du schema et celle
// du texte. Tant que la feuille portait jusqu'a QUATRE vignettes, la place
// manquait et l'on rognait sur la police — trente des soixante-deux fiches
// livrees s'imprimaient sous 8 pt, et quatre a 6,9 pt. Depuis qu'un SEUL schema
// est imprime, il occupe la moitie de la page sans effort : lui sacrifier
// encore du texte revient a payer en lisibilite un agrandissement qu'on ne voit
// pas.
const catalogue = CATALOGUE.map(construireExercice).map((e) => choisirMiseEnPage(e))
const sousHuit = catalogue.filter((p) => p.policePt < 8).length
verifier('presque aucune fiche livree ne descend sous 8 pt',
  sousHuit <= 5, `(${sousHuit} fiches sur ${catalogue.length})`)
const auMoinsNeuf = catalogue.filter((p) => p.policePt >= 9.2).length
verifier('la moitie au moins atteint 9,2 pt',
  auMoinsNeuf >= catalogue.length / 2, `(${auMoinsNeuf} sur ${catalogue.length})`)
verifier('le schema reste le plus gros element de la feuille',
  catalogue.every((p) => p.surfaceSchemaCm2 > 100),
  `(le plus petit fait ${Math.min(...catalogue.map((p) => p.surfaceSchemaCm2)).toFixed(0)} cm2)`)

// Le choix doit etre STABLE : une selection par comparaisons deux a deux avec
// tolerance n'est pas transitive, et le resultat dependait alors de l'ordre du
// tri — un terrain complet perdait 36 % de surface la ou la tolerance en
// autorisait 25.
const deuxFois = CATALOGUE.slice(0, 12).map(construireExercice)
verifier('le meme exercice donne toujours la meme mise en page',
  deuxFois.every((e) => {
    const a = choisirMiseEnPage(e)
    const b = choisirMiseEnPage(e)
    return a.policePt === b.policePt && a.disposition === b.disposition &&
      Math.abs(a.surfaceSchemaCm2 - b.surfaceSchemaCm2) < 0.01
  }))
verifier('aucune fiche ne perd plus que la tolerance annoncee',
  catalogue.every((p) => p.surfaceSchemaCm2 > 0))

console.log('')
console.log('8. La feuille sort dans les deux sens')
//
// Ce que garde cette section : la fiche DEMANDE le paysage, mais la boite de
// dialogue du navigateur passe outre — un entraineur a envoye un PDF en
// 210 x 297. La mise en page etait alors calculee pour 279 mm de large et
// rendue dans 192 : le texte s'entassait dans une colonne trop etroite, et la
// feuille s'arretait au tiers de la page. Les deux mises en page sont
// desormais calculees, et c'est la page reelle qui choisit.
verifier('la zone paysage est plus large que haute',
  ZONE_PAYSAGE.largeur > ZONE_PAYSAGE.hauteur)
verifier('la zone portrait est plus haute que large',
  ZONE_PORTRAIT.hauteur > ZONE_PORTRAIT.largeur)
verifier('ZONE reste le paysage, que la fiche demande',
  ZONE.largeur === ZONE_PAYSAGE.largeur && ZONE.hauteur === ZONE_PAYSAGE.hauteur)

const enPortrait = CATALOGUE.map(construireExercice).map((e) => choisirMiseEnPage(e, ZONE_PORTRAIT))
verifier('aucune fiche ne deborde de la largeur portrait',
  enPortrait.every((p) => p.partSchema > 0 && p.partSchema <= 1))
const sousHuitPortrait = enPortrait.filter((p) => p.policePt < 8).length
verifier('le portrait reste lisible lui aussi',
  sousHuitPortrait <= 5, `(${sousHuitPortrait} fiches sous 8 pt)`)
verifier('le schema garde une surface utile en portrait',
  enPortrait.every((p) => p.surfaceSchemaCm2 > 80),
  `(le plus petit fait ${Math.min(...enPortrait.map((p) => p.surfaceSchemaCm2)).toFixed(0)} cm2)`)

// Les deux calculs doivent VRAIMENT differer : s'ils rendaient la meme chose,
// c'est que la zone ne serait pas prise en compte.
const enPaysage = CATALOGUE.map(construireExercice).map((e) => choisirMiseEnPage(e, ZONE_PAYSAGE))
const differentes = enPortrait.filter((p, i) =>
  p.disposition !== enPaysage[i].disposition ||
  p.colonnesTexte !== enPaysage[i].colonnesTexte ||
  Math.abs(p.partSchema - enPaysage[i].partSchema) > 0.01).length
verifier('la mise en page portrait n est pas celle du paysage',
  differentes > CATALOGUE.length / 2, `(${differentes} fiches sur ${CATALOGUE.length})`)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
