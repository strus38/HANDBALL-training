/**
 * Export d'un schema en image PNG.
 *
 * Le schema est un SVG dont l'apparence vient de la feuille de style : sorti de
 * la page, il perdrait toutes ses couleurs. On recopie donc les styles calcules
 * sur chaque element avant de le serialiser — plutot que de dupliquer les
 * regles CSS ici, qui finiraient par diverger de styles.css.
 *
 * Le PNG sert a coller un schema dans un message, un document ou un groupe de
 * discussion : c'est le format que tout le monde sait ouvrir.
 */

/** Proprietes qui portent l'apparence d'un SVG. Le reste est inutile. */
const PROPRIETES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'text-anchor',
  'dominant-baseline',
  'paint-order',
] as const

/** Largeur de l'image produite, en pixels. */
const LARGEUR_IMAGE = 1800

/** Marge blanche autour du terrain, en pixels. */
const MARGE = 24

/**
 * Copie recursive des styles calcules vers des attributs de style en ligne.
 *
 * Les elements masques ou purement interactifs (poignees, zones de clic) sont
 * retires : ils n'ont aucun sens sur une image.
 */
function figerLesStyles(source: SVGSVGElement): SVGSVGElement {
  const copie = source.cloneNode(true) as SVGSVGElement

  const originaux = [source, ...Array.from(source.querySelectorAll('*'))]
  const copies = [copie, ...Array.from(copie.querySelectorAll('*'))]

  originaux.forEach((element, index) => {
    const cible = copies[index]
    if (!(cible instanceof SVGElement) && !(cible instanceof HTMLElement)) return
    const calcule = window.getComputedStyle(element)
    const declarations: string[] = []
    for (const propriete of PROPRIETES) {
      const valeur = calcule.getPropertyValue(propriete)
      if (valeur && valeur !== 'none' && valeur !== 'normal') {
        declarations.push(`${propriete}:${valeur}`)
      }
    }
    if (declarations.length > 0) cible.setAttribute('style', declarations.join(';'))
  })

  // Elements d'edition : ils n'appartiennent pas au schema lui-meme.
  for (const inutile of copie.querySelectorAll(
    '.zone-clic, .poignee-rotation, .poignee-courbure, .poignee-zone, .jeton-halo, .repere-aimant',
  )) {
    inutile.remove()
  }

  return copie
}

/** SVG autonome, pret a etre rasterise ou enregistre tel quel. */
export function serialiserSchema(source: SVGSVGElement): string {
  const copie = figerLesStyles(source)
  copie.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  copie.removeAttribute('class')
  return new XMLSerializer().serializeToString(copie)
}

/**
 * Rasterise le schema et renvoie un PNG.
 *
 * Le SVG est passe a une image par une URL de donnees : aucune ressource
 * externe n'etant referencee, le canevas n'est pas « teinte » et peut donc
 * etre exporte.
 */
export function schemaEnPng(source: SVGSVGElement): Promise<Blob> {
  const viewBox = (source.getAttribute('viewBox') ?? '0 0 40 20').split(/\s+/).map(Number)
  const rapport = viewBox[2] / viewBox[3] || 2
  const largeur = LARGEUR_IMAGE
  const hauteur = Math.round(largeur / rapport)

  const svg = serialiserSchema(source)
  const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  return new Promise((resoudre, rejeter) => {
    const image = new Image()
    image.onload = () => {
      const canevas = document.createElement('canvas')
      canevas.width = largeur + MARGE * 2
      canevas.height = hauteur + MARGE * 2
      const contexte = canevas.getContext('2d')
      if (!contexte) return rejeter(new Error('Canevas indisponible'))
      // Fond blanc : un PNG transparent devient illisible dans un document ou
      // une discussion sur fond sombre.
      contexte.fillStyle = '#ffffff'
      contexte.fillRect(0, 0, canevas.width, canevas.height)
      contexte.drawImage(image, MARGE, MARGE, largeur, hauteur)
      canevas.toBlob((blob) => {
        if (blob) resoudre(blob)
        else rejeter(new Error('Conversion en PNG impossible'))
      }, 'image/png')
    }
    image.onerror = () => rejeter(new Error('Le schéma n a pas pu être rastérisé'))
    image.src = url
  })
}
