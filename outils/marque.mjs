/**
 * Ce que la marque du club fournit aux documents engendres : l'ecusson et les
 * couleurs, pris a la source plutot que recopies.
 *
 * La notice s'en sert. Changer le jaune du club dans src/ui/styles.css, ou
 * redessiner l'ecusson dans `clubs/<identifiant>/Ecusson.tsx`, met le document
 * a jour sans rien retoucher ici.
 *
 * L'ecusson est pris dans le profil du club fabrique : ce module ne sait pas
 * quel club il sert, et c'est ce qui lui permet de les servir tous.
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { RACINE_CLUB } from './club.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const lire = (chemin) => readFileSync(join(racine, chemin), 'utf8')

/** Attributs SVG qui restent en camelCase : les convertir les casserait. */
const GARDER_CAMEL = new Set([
  'viewBox',
  'textLength',
  'lengthAdjust',
  'preserveAspectRatio',
  'clipPathUnits',
  'gradientUnits',
  'gradientTransform',
  'startOffset',
  'stdDeviation',
])

/**
 * Recupere le SVG du composant du logo et le rend valide hors de React :
 * les constantes de couleur sont resolues, les attributs repassent en
 * minuscules-tirets, et les commentaires JSX disparaissent.
 */
export function logo(identifiant = 'logo-document') {
  const source = readFileSync(join(RACINE_CLUB, 'Ecusson.tsx'), 'utf8')

  const couleurs = {}
  for (const trouve of source.matchAll(/^const (\w+) = (?:'([^']*)'|"([^"]*)")$/gm)) {
    couleurs[trouve[1]] = trouve[2] ?? trouve[3]
  }

  let svg = source.slice(source.indexOf('<svg'), source.lastIndexOf('</svg>') + 6)

  svg = svg
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/=\{([A-Z_]+)\}/g, (tout, nom) => (nom in couleurs ? `="${couleurs[nom]}"` : tout))
    .replace(/=\{"([^"]*)"\}/g, '="$1"')
    .replace(/=\{'([^']*)'\}/g, '="$1"')
    .replace(/\bclassName=/g, 'class=')
    .replace(/\b([a-z]+)([A-Z])([a-zA-Z]*)=/g, (tout, a, b, c) =>
      GARDER_CAMEL.has(`${a}${b}${c}`) ? tout : `${a}-${b.toLowerCase()}${c}=`,
    )
    // Seuls les ATTRIBUTS passent en tirets : les noms d'elements SVG, eux,
    // sont bel et bien en camelCase.
    .replace(/<(\/?)clip-path/g, '<$1clipPath')

  if (!svg.includes('viewBox')) throw new Error('Logo : viewBox perdu a la conversion')

  // Les identifiants internes du SVG sont prefixes, quels qu'ils soient : le
  // logo cotoie ici d'autres contenus, et deux documents peuvent porter deux
  // ecussons. Ecrire en dur le nom d'un identifiant reviendrait a supposer le
  // dessin d'un club particulier — c'est exactement ce qu'on vient de defaire.
  for (const trouve of svg.matchAll(/\sid="([^"]+)"/g)) {
    const ancien = trouve[1]
    const nouveau = `${identifiant}-${ancien}`
    svg = svg
      .replaceAll(`id="${ancien}"`, `id="${nouveau}"`)
      .replaceAll(`url(#${ancien})`, `url(#${nouveau})`)
  }
  return svg
}

/** Bloc :root de la feuille de styles : la seule source des couleurs. */
export function jetonsDeStyle() {
  const styles = lire('src/ui/styles.css')
  const debut = styles.indexOf(':root {')
  const fin = styles.indexOf('\n}', debut)
  if (debut === -1 || fin === -1) throw new Error('Bloc :root introuvable dans styles.css')
  return styles.slice(debut, fin + 2)
}

