/**
 * Tests du trace du terrain.
 *
 * Les lignes sont calculees, pas dessinees a la main : ces tests verifient que
 * le calcul redonne bien les cotes officielles du handball.
 *
 * Lancement : npm test
 */

import {
  ligneConcentrique,
  marque,
  cadrage,
  bornes,
  versEcran,
  versMetres,
  TERRAIN,
} from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}
const nombres = (chaine) => (chaine.match(/-?\d+(\.\d+)?/g) || []).map(Number)
/** Points reellement traces : les deux derniers nombres de chaque commande. */
const points = (chemin) =>
  chemin
    .split(/(?=[MLA])/)
    .map((commande) => nombres(commande))
    .filter((valeurs) => valeurs.length >= 2)
    .map((valeurs) => ({ x: valeurs[valeurs.length - 2], y: valeurs[valeurs.length - 1] }))

console.log('')
console.log('1. Reperes et conversions')
verifier('terrain 40 m x 20 m', TERRAIN.longueur === 40 && TERRAIN.largeur === 20)
verifier('conversion aller-retour', (() => {
  const p = { x: 31.5, y: 13.25 }
  const r = versMetres(versEcran(p))
  return r.x === p.x && r.y === p.y
})())
verifier('le bas du terrain devient le haut de l ecran', versEcran({ x: 0, y: 0 }).y === 20)
verifier('le centre reste au centre', versEcran({ x: 20, y: 10 }).y === 10)

console.log('')
console.log('2. Ligne de surface (6 m)')
const surface = ligneConcentrique(TERRAIN.rayonSurface, 'droite')
verifier('segment droit a 6 m de la ligne de but', surface.includes('L 34 8.5'),
  '(' + surface + ')')
verifier('rejoint la ligne de but a 2,5 m et 17,5 m',
  surface.startsWith('M 40 17.5') && surface.endsWith('40 2.5'), '(' + surface + ')')
verifier('deux arcs de rayon 6', (surface.match(/A 6 6/g) || []).length === 2)

console.log('')
console.log('3. Ligne de jet franc (9 m)')
const jetFranc = ligneConcentrique(TERRAIN.rayonJetFranc, 'droite')
verifier('segment droit a 9 m de la ligne de but', jetFranc.includes('L 31 8.5'),
  '(' + jetFranc + ')')
verifier('deux arcs de rayon 9', (jetFranc.match(/A 9 9/g) || []).length === 2)
// L'arc de 9 m centre sur un poteau sortirait du terrain : il doit etre coupe
// exactement sur la ligne de touche, a 40 - racine(81 - 8.5 au carre).
const attendu = Math.round((40 - Math.sqrt(81 - 8.5 * 8.5)) * 1000) / 1000
const debut = nombres(jetFranc.split('A')[0])
verifier('arc coupe sur la ligne de touche, pas hors du terrain',
  debut[0] === attendu && debut[1] === 20, '(attendu ' + attendu + ', obtenu ' + debut + ')')
verifier('aucun point trace hors du terrain',
  points(jetFranc).every((p) => p.y >= -0.001 && p.y <= 20.001 && p.x >= -0.001 && p.x <= 40.001),
  '(' + JSON.stringify(points(jetFranc)) + ')')

console.log('')
console.log('4. Symetrie des deux buts')
const gauche = ligneConcentrique(TERRAIN.rayonSurface, 'gauche')
verifier('surface gauche a 6 m de la ligne de but', gauche.includes('L 6 8.5'), '(' + gauche + ')')
verifier('sens de rotation inverse a gauche',
  gauche.includes('A 6 6 0 0 0') && surface.includes('A 6 6 0 0 1'))

console.log('')
console.log('5. Marques et cadrages')
const septMetres = nombres(marque(7, 'droite', 0.5))
verifier('marque des 7 m a 33 m de l origine', septMetres[0] === 33 && septMetres[2] === 33)
// Le trace part du haut de l'ecran : l'ordre des ordonnees est inverse par
// rapport au repere metier, seule compte la paire obtenue.
verifier('marque des 7 m centree sur le but',
  [septMetres[1], septMetres[3]].sort().join() === '10.5,9.5'.split(',').sort().join(),
  '(' + septMetres + ')')
const quatreMetres = nombres(marque(4, 'droite', 0.075))
verifier('marque du gardien a 4 m', quatreMetres[0] === 36)

verifier('vue complete cadre tout le terrain', cadrage('complet').viewBox === '-1 -1 42 22')
verifier('vue demi cadre la moitie droite', cadrage('demi').viewBox === '19 -1 22 22')
verifier('la vue demi contient bien le but de droite',
  bornes('demi').xMax >= 40 && bornes('demi').xMin >= 19)
verifier('la vue complete autorise tout le terrain', bornes('complet').xMin <= 0)

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
