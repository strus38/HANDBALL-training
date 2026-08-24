/**
 * Version de l'application, affichée dans l'en-tête et jointe aux exports.
 *
 * À quoi elle sert : l'application est livrée en UN FICHIER que l'on copie sur
 * une clé, que l'on s'envoie par courriel et que l'on garde des mois. Plusieurs
 * exemplaires cohabitent donc sur autant de postes, sans mise à jour
 * automatique. Quand un entraîneur signale un défaut, la première question est
 * « quelle version ? » — et sans repère affiché, personne ne peut y répondre :
 * ni lui, qui voit une page web, ni celui qui corrige, qui ignore si le défaut
 * est déjà réparé.
 *
 * Les trois valeurs viennent du BUILD (voir `vite.config.ts`), pas d'une
 * constante recopiée à la main : une version écrite à la main finit toujours
 * par mentir. En développement, elles n'existent pas et l'application le dit
 * franchement plutôt que d'afficher un numéro faux.
 */

declare const __VERSION__: string
declare const __DATE_BUILD__: string
declare const __REVISION__: string

/** Valeur injectée au build, ou repli si l'on tourne hors build. */
function injectee(valeur: unknown, defaut: string): string {
  return typeof valeur === 'string' && valeur.length > 0 ? valeur : defaut
}

/** Numéro de version, repris de `package.json`. */
export const VERSION = injectee(typeof __VERSION__ !== 'undefined' ? __VERSION__ : undefined, '0.0.0')

/** Jour de fabrication du fichier, au format AAAA-MM-JJ. */
export const DATE_BUILD = injectee(
  typeof __DATE_BUILD__ !== 'undefined' ? __DATE_BUILD__ : undefined,
  '',
)

/** Révision courte du dépôt : c'est elle qui désigne le code exact à corriger. */
export const REVISION = injectee(
  typeof __REVISION__ !== 'undefined' ? __REVISION__ : undefined,
  '',
)

/** Vrai quand l'application ne tourne pas depuis un fichier fabriqué. */
export const EN_DEVELOPPEMENT = DATE_BUILD === ''

/**
 * Version courte, telle qu'affichée dans l'en-tête : « v1.1.0 ».
 *
 * Hors build, on annonce « version de travail » : afficher « v0.0.0 » ferait
 * croire à une vraie version et enverrait chercher un défaut là où il n'est pas.
 */
export function versionCourte(): string {
  return EN_DEVELOPPEMENT ? 'version de travail' : `v${VERSION}`
}

/**
 * Version complète, à recopier dans un signalement de défaut.
 *
 * Tout y est sur une ligne, sélectionnable d'un geste : le numéro pour situer,
 * la date pour dater, la révision pour retrouver le code exact.
 */
export function versionComplete(): string {
  if (EN_DEVELOPPEMENT) return 'Version de travail (fichier non fabriqué)'
  const morceaux = [`v${VERSION}`, DATE_BUILD]
  if (REVISION) morceaux.push(REVISION)
  return morceaux.join(' · ')
}
