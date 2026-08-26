/**
 * La documentation suit-elle l'application ?
 *
 * Il y avait trois documents pour l'entraineur : un manuel de mille cinq cents
 * lignes, une plaquette, et un guide de prise en main. Aucun n'etait relu, et
 * c'est dans les deux premiers que les erreurs sont restees des mois. Il n'en
 * reste qu'un — mais reduire le nombre de documents ne suffit pas a les tenir
 * a jour, et l'histoire de ce projet le prouve trois fois.
 *
 * TROIS DERIVES, TOUTES DE LA MEME FORME : un calcul qui se croyait deduit, et
 * qui l'etait, mais du mauvais endroit.
 *
 * 1. Le cache des captures s'indexait sur la seule empreinte du livrable.
 *    Enrichir la seance de demonstration ne rafraichissait donc aucune image.
 *
 * 2. La liste des captures a produire etait ecrite a la main. En reclamer une
 *    de plus sans completer la liste laissait un emplacement vide, sans le
 *    moindre avertissement.
 *
 * 3. Le nombre de fiches livrees se comptait dans trois fichiers nommes a la
 *    main. Deux bibliotheques ajoutees depuis n'y figuraient pas : la plaquette
 *    promettait 53 exercices quand l'application en affichait 62, et personne
 *    ne recompte une bibliotheque pour verifier une plaquette.
 *
 * Ces tests ne verifient pas que la documentation est BONNE — cela ne se mesure
 * pas, et c'est un lecteur, pas un test, qui a trouve le 53. Ils verifient
 * qu'elle ne peut plus se desynchroniser EN SILENCE.
 *
 * Lancement : npm test
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { CATALOGUE, FONDS_COMMUN } from '../.build-tests/domaine.mjs'

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

const lire = (chemin) => readFileSync(chemin, 'utf8')
const guide = lire('outils/priseEnMain.mjs')
const captures = lire('outils/captures.mjs')
const readme = lire('README.md')

/** Les noms de scenario declares dans outils/captures.mjs. */
const scenarios = [...captures.matchAll(/^\s{4}nom: '([a-z-]+)',$/gm)].map((m) => m[1])

console.log('')
console.log('1. Toute capture reclamee existe')
const reclamees = [
  ...(guide.match(/const CAPTURES = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g),
].map((m) => m[1])
const pourReadme = [
  ...(guide.match(/const POUR_LE_README = \[([^\]]*)\]/)?.[1] ?? '').matchAll(/'([a-z-]+)'/g),
].map((m) => m[1])

verifier('des scenarios sont declares', scenarios.length >= 8, `(${scenarios.length})`)
verifier('le guide en reclame', reclamees.length >= 4, `(${reclamees.length})`)
const inconnues = reclamees.filter((n) => !scenarios.includes(n))
verifier('le guide ne reclame que des captures qui existent', inconnues.length === 0, inconnues.join(', '))
const inconnuesReadme = pourReadme.filter((n) => !reclamees.includes(n))
verifier(
  'le README ne reprend que des captures du guide',
  inconnuesReadme.length === 0,
  `${inconnuesReadme.join(', ')} (deux jeux de captures = deux occasions de diverger)`,
)

console.log('')
console.log('2. Le cache des captures suit le fichier des scenarios')
verifier(
  'l empreinte couvre outils/captures.mjs lui-meme',
  /import\.meta\.url/.test(
    captures.slice(captures.indexOf('const empreinteActuelle'), captures.indexOf('const empreinteActuelle') + 200),
  ),
  '(modifier un scenario ne rafraichirait pas les captures)',
)
verifier(
  'la seance de demonstration est marquee comme sauvegardee',
  captures.includes('derniere-sauvegarde'),
  '(sinon le bandeau jaune de rappel barre toutes les captures)',
)
verifier(
  'et son equipe est renseignee',
  captures.includes('mon-equipe'),
  '(sinon l en-tete affiche le bouton « Mon equipe » a renseigner)',
)

console.log('')
console.log('3. Aucun nombre de fiches ecrit a la main')
// Le compte doit venir du CATALOGUE, celui que l'application affiche.
verifier(
  'le guide compte sur le catalogue',
  guide.includes('${NOMBRE_DE_FICHES}') || guide.includes('NOMBRE_DE_FICHES'),
  '(un nombre tape a la main ment des qu une bibliotheque est ajoutee)',
)
// Le README presente le DEPOT, pas l'exemplaire d'un club : il annonce donc le
// fonds commun, ce que tout club recoit. Le total, lui, depend des fiches que
// le club a ecrites — et un README qui aurait annonce les 62 de Saint-Marcellin
// aurait promis six exercices de plus a tous les autres.
const annoncesReadme = [...readme.matchAll(/(\d+)\s+exercices/g)].map((m) => Number(m[1]))
const fauxReadme = annoncesReadme.filter((n) => n !== FONDS_COMMUN.length)
verifier(
  `le README annonce ${FONDS_COMMUN.length} exercices`,
  fauxReadme.length === 0,
  `(${[...new Set(fauxReadme)].join(', ')} au lieu de ${FONDS_COMMUN.length})`,
)
verifier(
  'le guide annonce ce que ce club-ci livre',
  CATALOGUE.length >= FONDS_COMMUN.length,
  `(${CATALOGUE.length} pour un fonds commun de ${FONDS_COMMUN.length})`,
)

console.log('')
console.log('4. Les images du README existent sur le disque')
// GitHub ne sait pas afficher une image en base64 : le README pointe des
// fichiers, et un lien casse ne se voit que sur la page du depot.
const imagesReadme = [...readme.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
verifier('le README montre au moins une capture', imagesReadme.length >= 1)
for (const chemin of imagesReadme) {
  verifier(`l image ${chemin} est versionnee`, existsSync(chemin))
}
verifier(
  'aucune image en base64 dans le README',
  !readme.includes('data:image'),
  '(GitHub ne les affiche pas)',
)

console.log('')
console.log('5. Tout bouton cite par le guide existe dans l application')
// C'est le controle le plus rentable de tous : un bouton renomme fait mentir
// le guide immediatement, et l'entraineur cherche une commande introuvable.
// Deux libelles etaient deja faux — « Lire » pour « ▶ Lire », « Bilan » pour
// « Bilan de la saison ».
const sources = ['src/App.tsx', 'src/domain/types.ts', 'src/ui', 'src/bibliotheque']
  .flatMap((c) => {
    if (c.endsWith('.tsx') || c.endsWith('.ts')) return [lire(c)]
    return readdirSync(c)
      .filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
      .map((f) => lire(`${c}/${f}`))
  })
  .join('\n')

/** Ce que le guide presente comme un libelle d'interface : <b>...</b>. */
const cites = [...new Set([...guide.matchAll(/<b>([^<]{2,40})<\/b>/g)].map((m) => m[1].trim()))]
// Quelques-uns ne sont pas des boutons mais des mots mis en avant : on ne
// verifie que ce qui ressemble a une commande, et la liste des exceptions est
// courte et explicite.
// Ce ne sont pas des commandes mais des reperes visuels ou des mots mis en
// avant. La liste reste courte et explicite : y ajouter une ligne doit etre un
// geste delibere, jamais une echappatoire pour faire taire le test.
const PAS_DES_BOUTONS = ['en parallèle', '↑', '↓', '✕']
const introuvables = cites
  .filter((t) => !PAS_DES_BOUTONS.includes(t))
  .filter((t) => !sources.includes(t))

verifier('le guide cite des libelles', cites.length >= 15, `(${cites.length})`)
verifier(
  'tous existent dans le code de l application',
  introuvables.length === 0,
  `introuvables : ${introuvables.join(' | ')}`,
)

console.log('')
console.log('6. L ancienne chaine ne laisse pas de restes')
// Un document que plus rien ne fabrique et que personne ne lit pourrit
// immanquablement. Ces fichiers ont ete supprimes : rien ne doit les rappeler.
for (const disparu of ['LISEZMOI.md', 'outils/notice.mjs', 'outils/presentation.mjs', 'src/notice']) {
  verifier(`${disparu} a bien disparu`, !existsSync(disparu))
}
const paquet = JSON.parse(lire('package.json'))
verifier(
  'la fabrication produit la prise en main',
  paquet.scripts.build.includes('prise-en-main'),
  '(sans quoi dist/ sortirait sans documentation)',
)
verifier(
  'aucun script ne survit a la notice supprimee',
  !('notice' in paquet.scripts) && !('presentation' in paquet.scripts),
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
