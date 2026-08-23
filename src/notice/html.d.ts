/**
 * Import d'un fichier HTML comme chaine de caracteres, via le suffixe ?raw de
 * Vite. Le projet ne tire pas les types de vite/client : cette declaration
 * suffit, et evite d'ajouter une dependance pour une seule ligne.
 */
declare module '*.html?raw' {
  const contenu: string
  export default contenu
}
