/**
 * Chaque bouton de l'application porte une infobulle.
 *
 * Pourquoi ce test existe : un entraineur n'est pas un familier du vocabulaire
 * de l'application. « Vers la bibliotheque », « Mode terrain », « Dupliquer »
 * disent quelque chose a qui a ecrit le logiciel, rien a qui l'ouvre le mardi
 * soir. L'infobulle est le seul endroit ou l'on peut expliquer sans allonger le
 * bouton.
 *
 * La regle est simple et se verifie : AUCUN bouton sans title. Elle vaut aussi
 * pour les boutons a venir — c'est tout l'interet de la verifier ici plutot que
 * de compter sur la relecture.
 *
 * Deux exigences de plus, parce qu'une infobulle vide ou redondante ne vaut pas
 * mieux que pas d'infobulle :
 *
 *   - elle ne doit pas se contenter de repeter le libelle du bouton ;
 *   - elle doit etre ecrite en francais accentue, comme tout le reste de
 *     l'interface — un « Revenir a la liste » sans accent se voit.
 *
 * Lancement : npm test
 */

import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

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

const ANTISLASH = String.fromCharCode(92)

/** Tous les .tsx du dossier src. */
function fichiers(dossier) {
  const trouves = []
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, entree.name)
    if (entree.isDirectory()) trouves.push(...fichiers(chemin))
    else if (entree.name.endsWith('.tsx')) trouves.push(chemin)
  }
  return trouves
}

/**
 * Les balises <button ...> ouvrantes d'un fichier.
 *
 * On ne peut pas s'arreter au premier « > » : les fleches JSX en contiennent,
 * et « onClick={() => ...} » ferait croire a une balise terminee. On suit donc
 * la profondeur des accolades et l'etat des chaines.
 */
function balises(source) {
  const trouvees = []
  let i = 0
  while ((i = source.indexOf('<button', i)) >= 0) {
    let j = i + 7
    let profondeur = 0
    let chaine = null
    while (j < source.length) {
      const c = source[j]
      if (chaine) {
        if (c === chaine && source[j - 1] !== ANTISLASH) chaine = null
      } else if (c === '"' || c === "'" || c === '`') chaine = c
      else if (c === '{') profondeur++
      else if (c === '}') profondeur--
      else if (c === '>' && profondeur === 0) break
      j++
    }
    trouvees.push({
      attributs: source.slice(i + 7, j),
      ligne: source.slice(0, i).split(String.fromCharCode(10)).length,
      contenu: source.slice(j + 1, source.indexOf('</button>', j) + 1),
    })
    i = j
  }
  return trouvees
}

const sansAccent = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const tous = fichiers('src').flatMap((f) =>
  balises(readFileSync(f, 'utf8')).map((b) => ({ ...b, fichier: f.replace(/\\/g, '/') })),
)

console.log('')
console.log('1. Aucun bouton sans infobulle')
const muets = tous.filter((b) => !/\btitle=/.test(b.attributs))
verifier(
  `les ${tous.length} boutons portent un title`,
  muets.length === 0,
  muets.map((b) => `${b.fichier}:${b.ligne}`).join(', '),
)

console.log('')
console.log('2. Les infobulles sont ecrites pour un entraineur')
const litterales = tous
  .map((b) => ({ ...b, texte: /title="([^"]+)"/.exec(b.attributs)?.[1] }))
  .filter((b) => b.texte)

const courtes = litterales.filter((b) => b.texte.trim().length < 12)
verifier(
  'aucune infobulle ne se reduit a un mot',
  courtes.length === 0,
  courtes.map((b) => `${b.fichier}:${b.ligne} « ${b.texte} »`).join(', '),
)

// Une infobulle qui repete le libelle n'apprend rien. On compare au texte brut
// du bouton, debarrasse de son balisage.
const redondantes = litterales.filter((b) => {
  const libelle = sansAccent(b.contenu.replace(/<[^>]*>/g, ' ').replace(/[{}]/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
  if (libelle.length < 4) return false
  return sansAccent(b.texte).trim() === libelle
})
verifier(
  'aucune infobulle ne repete simplement le libelle',
  redondantes.length === 0,
  redondantes.map((b) => `${b.fichier}:${b.ligne}`).join(', '),
)

// L'interface est en francais accentue. Une infobulle qui ne l'est pas trahit
// une saisie faite a la va-vite, et se voit a l'ecran.
const MOTS_A_ACCENT = /\b(seance|seances|schema|schemas|deja|creer|cree|creneau|apres|definitivement|entraineur|entrainement|preparer|repartir|detail|modifiee?|reserve|element)\b/
const sansAccents = litterales.filter((b) => MOTS_A_ACCENT.test(b.texte.toLowerCase()))
verifier(
  'les infobulles sont accentuees',
  sansAccents.length === 0,
  sansAccents.map((b) => `${b.fichier}:${b.ligne} « ${b.texte} »`).join(' | '),
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
