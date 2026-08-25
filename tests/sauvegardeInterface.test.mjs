/**
 * Le rappel de sauvegarde : vérification dans un vrai navigateur.
 *
 * Pourquoi un test de navigateur et non un test de domaine : la règle est déjà
 * couverte par `tests/sauvegarde.test.mjs`, qui la vérifie sous tous les
 * angles. Ce que ce test ajoute est ailleurs — le rappel doit ARRIVER JUSQU'A
 * L'ECRAN. Une règle juste dont le bandeau ne s'affiche jamais protège
 * exactement personne, et rien dans les tests purs ne s'en apercevrait.
 *
 * Quatre choses à prouver ici, dans cet ordre :
 *
 * 1. le bandeau ne s'affiche pas sur un classeur qui vient de naître ;
 * 2. il apparaît à la troisième séance ;
 * 3. FERMER la fenêtre « Enregistrer sous » ne le fait PAS taire ;
 * 4. enregistrer pour de bon le fait taire, et il ne revient pas.
 *
 * Le troisième point est le plus important, et le moins évident. Rien n'a été
 * écrit : prétendre le contraire ferait croire à l'entraîneur que son travail
 * est à l'abri alors qu'il ne l'est pas — un rappel qui ment est pire que pas
 * de rappel du tout.
 *
 * Le quatrième prouve la boucle complète : la vue appelle bien
 * `marquerSauvegarde`, le dépôt écrit bien le repère, et le calcul le relit.
 *
 * UN PIEGE, PAYE UNE FOIS. Un clic déclenché depuis le pilote n'est pas un
 * geste de l'utilisateur, et le navigateur refuse alors d'ouvrir la fenêtre
 * « Enregistrer sous » — pour ce motif, et non pour celui qu'on éprouve.
 * L'application retombe sur le téléchargement, le bandeau disparaît, et le
 * test passe... en ayant vérifié la voie de repli à la place. Les deux voies
 * sont donc éprouvées ici, chacune nommée pour ce qu'elle est.
 *
 * Le test passe si Chrome est introuvable, pour ne pas bloquer une machine qui
 * n'en a pas. Il porte sur `dist/`, donc après `npm run build`.
 *
 * Lancement : node tests/sauvegardeInterface.test.mjs (inclus dans npm run fumee)
 */

import { ouvrirNavigateur } from '../outils/navigateur.mjs'
import { CHEMIN_LIVRABLE } from '../outils/livrable.mjs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'

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

const livrable = pathToFileURL(resolve(CHEMIN_LIVRABLE)).href
if (!existsSync(resolve(CHEMIN_LIVRABLE))) {
  console.log(`\n  (${CHEMIN_LIVRABLE} absent : lancez npm run build)`)
  process.exit(0)
}

const navigateur = await ouvrirNavigateur()
if (!navigateur) {
  console.log('\n  (Chrome introuvable : test ignore)')
  process.exit(0)
}

/** Outils communs a tous les scripts joues dans la page. */
const PRELUDE = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const btn = (t) => [...document.querySelectorAll('button')]
    .find((b) => b.textContent.trim() === t);
  const rappel = () => [...document.querySelectorAll('.bandeau.alerte')]
    .find((d) => (d.querySelector('strong')?.textContent || '').includes("n’existe que"));
`

/** Cree N seances depuis la page d'accueil, en revenant a la liste a chaque fois. */
const creer = (nombre) =>
  PRELUDE +
  `
  await pause(800);
  for (let i = 0; i < ${nombre}; i++) {
    btn('+ Nouvelle séance')?.click();
    await pause(500);
    document.querySelector('button[title="Revenir à la liste des séances"]')?.click();
    await pause(400);
  }
  await pause(400);
  const bandeau = rappel();
  return {
    seances: document.querySelectorAll('.carte-seance').length,
    visible: !!bandeau,
    texte: bandeau ? bandeau.textContent.replace(/\\s+/g, ' ').trim() : '',
  };
`

/** Clique « Sauvegarder maintenant », puis regarde si le rappel a disparu. */
const SAUVEGARDER =
  PRELUDE +
  `
  const bandeau = rappel();
  if (!bandeau) return { clique: false };
  [...bandeau.querySelectorAll('button')]
    .find((b) => b.textContent.trim() === 'Sauvegarder maintenant')?.click();
  await pause(900);
  const info = document.querySelector('.bandeau.information');
  return {
    clique: true,
    visible: !!rappel(),
    message: info ? info.textContent.replace(/\\s+/g, ' ').trim() : '',
  };
`

/** L'API « Enregistrer sous » est-elle seulement proposee par ce navigateur ? */
const API_PRESENTE = `return typeof window.showSaveFilePicker === 'function';`

/** Recharge la page : le repere a-t-il survecu au stockage ? */
const APRES_RECHARGEMENT =
  PRELUDE +
  `
  await pause(1100);
  return {
    seances: document.querySelectorAll('.carte-seance').length,
    visible: !!rappel(),
  };
`

try {
  await navigateur.aller(livrable)

  console.log('')
  console.log('1. Un classeur qui commence ne se fait pas rappeler a l ordre')
  const deux = await navigateur.evaluer(creer(2))
  verifier('deux seances ont ete creees', deux.seances === 2, `(${deux.seances})`)
  verifier(
    'aucun rappel a deux seances',
    deux.visible === false,
    '(reclamer une sauvegarde des le premier soir, c est se faire fermer)',
  )

  console.log('')
  console.log('2. A la troisieme, le rappel arrive')
  const trois = await navigateur.evaluer(creer(1))
  verifier('la troisieme seance est la', trois.seances === 3, `(${trois.seances})`)
  verifier('le bandeau s affiche', trois.visible === true)
  verifier(
    'il dit combien de seances sont en jeu',
    /3 séances/.test(trois.texte),
    `(« ${trois.texte.slice(0, 120)} »)`,
  )
  verifier(
    'il propose de sauvegarder tout de suite',
    /Sauvegarder maintenant/.test(trois.texte),
    `(« ${trois.texte.slice(0, 120)} »)`,
  )

  console.log('')
  console.log('3. Fermer la fenetre « Enregistrer sous » ne fait PAS taire le rappel')
  // Avec un vrai geste, le navigateur accepte d'ouvrir la fenetre — mais sans
  // interface il ne peut pas l'afficher et l'abandonne aussitot. C'est
  // exactement ce que produit un entraineur qui clique « Annuler », et rien
  // n'a alors ete ecrit.
  const apiLa = await navigateur.evaluer(API_PRESENTE)
  verifier('le navigateur propose « Enregistrer sous »', apiLa === true)
  const annule = await navigateur.evaluer(SAUVEGARDER, true)
  verifier('le bouton du bandeau a ete trouve', annule.clique === true)
  verifier(
    'le rappel reste affiche',
    annule.visible === true,
    '(rien n a ete ecrit : le faire taire serait un mensonge)',
  )
  verifier(
    'et aucune sauvegarde n est annoncee',
    !/Sauvegarde de/.test(annule.message),
    `(« ${annule.message.slice(0, 90)} »)`,
  )

  console.log('')
  console.log('4. La voie de repli enregistre pour de bon')
  // Sans geste, la fenetre est refusee et l'application retombe sur le
  // telechargement — la meme voie que sur un navigateur qui ne connait pas
  // l'API. Le fichier part, et le rappel doit alors se taire.
  const sauve = await navigateur.evaluer(SAUVEGARDER)
  verifier('le rappel disparait', sauve.visible === false)
  verifier(
    'et l application dit ou le fichier est parti',
    /Téléchargements/.test(sauve.message),
    `(« ${sauve.message.slice(0, 90)} »)`,
  )

  console.log('')
  console.log('5. Et il ne revient pas au rechargement')
  // C'est ici que se joue la boucle complete : sans ecriture du repere dans le
  // depot, le rappel reapparaitrait a l'ouverture suivante alors que le
  // fichier existe — et le bandeau perdrait toute credibilite.
  await navigateur.aller(livrable)
  const apres = await navigateur.evaluer(APRES_RECHARGEMENT)
  verifier('les trois seances sont relues', apres.seances === 3, `(${apres.seances})`)
  verifier(
    'le rappel reste silencieux',
    apres.visible === false,
    '(le repere de sauvegarde n a pas survecu au stockage)',
  )
} finally {
  await navigateur.fermer()
}

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
