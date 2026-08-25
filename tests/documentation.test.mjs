/**
 * La documentation suit-elle l'application ?
 *
 * Un entraineur a signale que PRESENTATION.html ne montrait aucune des
 * fonctions ajoutees depuis des mois. Trois causes, toutes silencieuses :
 *
 * 1. Le cache des captures etait indexe sur la seule empreinte du livrable.
 *    Enrichir la seance de demonstration dans outils/captures.mjs ne
 *    rafraichissait donc rien, et les images restaient celles d'avant.
 *
 * 2. La liste des captures demandees par la notice etait ecrite a la main.
 *    Poser une marque « notice:capture » dans LISEZMOI.md sans completer cette
 *    liste ne produisait aucune image — et l'emplacement sortait vide, sans le
 *    moindre avertissement.
 *
 * 3. Une capture sans legende passait aussi, muette.
 *
 * Ces tests ne verifient pas que la documentation est BONNE — cela ne se
 * mesure pas. Ils verifient qu'elle ne peut plus se desynchroniser en silence.
 *
 * Lancement : npm test
 */

import { readFileSync } from 'node:fs'

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
const lisezmoi = lire('LISEZMOI.md')
const captures = lire('outils/captures.mjs')
const notice = lire('outils/notice.mjs')
const presentation = lire('outils/presentation.mjs')

/** Les noms de scenario declares dans outils/captures.mjs. */
const scenarios = [...captures.matchAll(/^\s{4}nom: '([a-z-]+)',$/gm)].map((m) => m[1])

console.log('')
console.log('1. Toute capture demandee existe')
// Ancre en debut de ligne : LISEZMOI.md cite la syntaxe du marqueur dans sa
// section technique, et une reconnaissance laxiste y verrait une capture
// nommee « nom ».
const parLaNotice = [...lisezmoi.matchAll(/^<!-- notice:capture ([a-z-]+) -->$/gm)].map((m) => m[1])
const parLaPresentation = [...presentation.matchAll(/capture: '([a-z-]+)'/g)].map((m) => m[1])

verifier('des scenarios sont declares', scenarios.length >= 8, `(${scenarios.length})`)
const inconnuesNotice = parLaNotice.filter((n) => !scenarios.includes(n))
verifier(
  'la notice ne reclame que des captures qui existent',
  inconnuesNotice.length === 0,
  inconnuesNotice.join(', '),
)
const inconnuesPresentation = parLaPresentation.filter((n) => !scenarios.includes(n))
verifier(
  'la presentation ne reclame que des captures qui existent',
  inconnuesPresentation.length === 0,
  inconnuesPresentation.join(', '),
)

console.log('')
console.log('2. Toute capture demandee par la notice a une legende')
const legendes = notice.slice(notice.indexOf('const LEGENDES'), notice.indexOf('/** Remplit'))
const sansLegende = parLaNotice.filter(
  (n) => !legendes.includes(`${n}:`) && !legendes.includes(`'${n}':`),
)
verifier(
  'aucune capture muette dans la notice',
  sansLegende.length === 0,
  sansLegende.join(', '),
)

console.log('')
console.log('3. La notice deduit sa liste du document')
// Une liste ecrite a la main se desynchronise : c'est ce qui est arrive.
verifier(
  'la notice lit les marques de LISEZMOI.md plutot qu une liste figee',
  /matchAll\(\/\^<!-- notice:capture/.test(notice),
  '(la liste des captures semble a nouveau ecrite en dur)',
)

console.log('')
console.log('4. Le cache des captures suit le fichier des scenarios')
verifier(
  'l empreinte couvre outils/captures.mjs lui-meme',
  /import\.meta\.url/.test(captures.slice(captures.indexOf('const empreinteActuelle'), captures.indexOf('const empreinteActuelle') + 200)),
  '(modifier un scenario ne rafraichirait pas les captures)',
)

console.log('')
console.log('5. Les fonctions livrees sont documentees')
// Chaque version a ajoute quelque chose : la reference du projet doit en
// parler, sans quoi personne ne saura que cela existe.
const SECTIONS_ATTENDUES = [
  'Mon équipe',
  'Le planning du club',
  'Le retour à chaud',
  'Le matériel à emporter',
  'Espace de la séance',
  'Importer sans faire de doublons',
  'Chaque bouton s’explique',
]
for (const titre of SECTIONS_ATTENDUES) {
  const cherche = titre.replace('’', "'")
  const present = lisezmoi.includes(`## ${titre}`) || lisezmoi.includes(`## ${cherche}`)
  verifier(`LISEZMOI.md documente « ${titre} »`, present)
}

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
