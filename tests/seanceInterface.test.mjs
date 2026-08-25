/**
 * Les quatre ajouts de la seance, verifies dans un vrai navigateur.
 *
 * Les tests de domaine prouvent que le materiel se consolide, que le retour
 * remonte et que le rapprochement classe juste. Ils ne prouvent PAS ce qui
 * compte pour l entraineur : que le rappel s affiche a l ouverture de la
 * seance, que la mention de source est bien en italique, que la question de
 * l importation est posee et que le resume dit ce qui a ete fait. Ce sont
 * quatre choses qu aucune fonction pure ne peut voir — et les deux defauts
 * signales jusqu ici etaient exactement de cette nature.
 *
 * Le test passe si Chrome est introuvable. Il porte sur `dist/`, donc apres
 * `npm run build`.
 *
 * Lancement : npm run fumee
 */

import { ouvrirNavigateur } from '../outils/navigateur.mjs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { existsSync, writeFileSync, mkdirSync } from 'node:fs'

// --- Fabrique les donnees de depart avec le domaine lui-meme.
mkdirSync('.build-tests', { recursive: true })
writeFileSync(
  '.build-tests/entree-quatre.ts',
  [
    "export { nouvelExercice, nouvelleSeance } from '../src/domain/fabrique'",
    "export { exporterSauvegarde } from '../src/domain/echange'",
    '',
  ].join('\n'),
)
execFileSync(process.execPath, [
  'node_modules/esbuild/bin/esbuild',
  '.build-tests/entree-quatre.ts',
  '--bundle', '--format=esm', '--platform=neutral',
  '--outfile=.build-tests/quatre-domaine.mjs',
], { stdio: ['ignore', 'ignore', 'inherit'] })
const { nouvelExercice, nouvelleSeance, exporterSauvegarde } = await import(
  pathToFileURL(resolve('.build-tests/quatre-domaine.mjs')).href
)

const fiche = (titre, materiel, texte) => {
  const e = nouvelExercice(titre)
  e.materiel = materiel
  e.fonctionnement = texte
  return e
}

const mardi = nouvelleSeance('Mardi 1er septembre')
mardi.date = '2026-09-01'
mardi.retour = "Six absents, ambiance molle. On reprend la relance jeudi."

const jeudi = nouvelleSeance('Jeudi 3 septembre')
jeudi.date = '2026-09-03'
jeudi.exercices = [
  fiche('Circuit plots', ['12 plots', '4 haies'], 'On pose le circuit.'),
  fiche('Tirs', ['6 ballons', 'chasubles'], 'On tire.'),
]

// Une fiche de bibliotheque portant une mention de provenance.
const enBibliotheque = fiche(
  'Croisé arrière - ailier',
  ['1 ballon'],
  "L'arrière engage, l'ailier croise.\nSource : 20 exercices — Philippe Boeckler, exercice 11.",
)

// Le fichier a importer : une identique, une divergente, une inconnue.
const identique = JSON.parse(JSON.stringify(enBibliotheque))
identique.id = 'arrivante-identique'
// Meme titre que la fiche deja en bibliotheque, contenu different : c'est le
// seul cas qui appelle une decision.
const divergente = JSON.parse(JSON.stringify(enBibliotheque))
divergente.id = 'arrivante-divergente'
divergente.fonctionnement = 'Texte corrigé du cahier.'
const inconnue = fiche('Montée de balle rapide', ['2 ballons'], 'Nouvelle fiche.')
const aImporter = exporterSauvegarde([], [identique, divergente, inconnue])

if (!existsSync(resolve('dist/index.html'))) {
  console.log('  (dist/index.html absent : lancez npm run build)')
  process.exit(0)
}

const n = await ouvrirNavigateur()
if (!n) {
  console.log('  (Chrome introuvable : test ignore)')
  process.exit(0)
}

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

const livrable = pathToFileURL(resolve('dist/index.html')).href
await n.aller(livrable)

// --- Depose les donnees dans IndexedDB, puis recharge.
await n.evaluer(`
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  await pause(1200);
  const base = await new Promise((ok2, ko2) => {
    const r = indexedDB.open('handball-training', 3);
    r.onsuccess = () => ok2(r.result); r.onerror = () => ko2(r.error);
  });
  await new Promise((ok2, ko2) => {
    const tx = base.transaction(['seances', 'modeles'], 'readwrite');
    for (const s of ${JSON.stringify([mardi, jeudi])}) tx.objectStore('seances').put(s);
    tx.objectStore('modeles').put(${JSON.stringify(enBibliotheque)});
    tx.oncomplete = ok2; tx.onerror = () => ko2(tx.error);
  });
  base.close();
  return 'ok';
`)
await n.aller(livrable)

try {
  console.log('')
  console.log('1. La seance du jeudi : rappel, materiel, retour a chaud')
  const seance = await n.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    await pause(1100);
    const carte = [...document.querySelectorAll('.carte-seance')]
      .find((c) => c.textContent.includes('Jeudi 3'));
    carte.querySelector('.zone-ouverture').click(); await pause(700);
    const rappel = document.querySelector('.rappel-retour');
    const materiel = document.querySelector('.materiel-seance');
    const champRetour = [...document.querySelectorAll('textarea')]
      .find((t) => /Ce qui s'est passé/.test(t.placeholder));
    return JSON.stringify({
      rappelPresent: !!rappel,
      rappelTexte: rappel ? rappel.textContent.replace(/\\s+/g, ' ').trim() : null,
      materiel: materiel ? materiel.textContent.replace(/\\s+/g, ' ').trim() : null,
      champRetour: !!champRetour,
    });
  `)
  const s = JSON.parse(seance)
  verifier('le retour du mardi est rappele', s.rappelPresent === true)
  verifier('il porte la date de la seance d origine',
    /1er septembre|septembre 2026/.test(s.rappelTexte ?? ''), s.rappelTexte)
  verifier('et son texte', (s.rappelTexte ?? '').includes('Six absents'), s.rappelTexte)
  verifier('le materiel est consolide et trie',
    s.materiel === 'À emporter : 12 plots, 6 ballons, 4 haies, chasubles', s.materiel)
  verifier('le champ de retour a chaud est offert', s.champRetour === true)

  console.log('')
  console.log('2. La provenance, en italique dans la bibliotheque')
  const biblio = await n.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const btn = (t) => [...document.querySelectorAll('button')]
      .find((b) => b.textContent.trim().includes(t));
    btn('Bibliothèque')?.click(); await pause(900);
    [...document.querySelectorAll('.bouton.segment')]
      .find((b) => b.textContent.includes('Ma bibliothèque'))?.click(); await pause(700);
    document.querySelector('.carte-modele')?.click(); await pause(600);
    const p = [...document.querySelectorAll('.apercu-modele p')]
      .find((x) => x.textContent.startsWith('Source :'));
    const autre = [...document.querySelectorAll('.apercu-modele p')]
      .find((x) => x.textContent.includes('arrière engage'));
    return JSON.stringify({
      trouvee: !!p,
      classe: p ? p.className : null,
      style: p ? getComputedStyle(p).fontStyle : null,
      styleVoisin: autre ? getComputedStyle(autre).fontStyle : null,
    });
  `)
  const b = JSON.parse(biblio)
  verifier('la ligne de source est reperee', b.trouvee === true)
  verifier('elle porte la classe provenance', b.classe === 'provenance', String(b.classe))
  verifier('et s affiche en italique', b.style === 'italic', String(b.style))
  verifier('le texte voisin reste droit', b.styleVoisin === 'normal', String(b.styleVoisin))

  console.log('')
  console.log('3. L importation rapproche, demande, puis resume')
  const importation = await n.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const btn = (t) => [...document.querySelectorAll('button')]
      .find((b) => b.textContent.trim().includes(t));
    btn('Fermer')?.click() || document.querySelector('.modale-fond')?.click();
    await pause(500);
    if (document.querySelector('.bibliotheque')) {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await pause(500);
    }
    btn('Importer')?.click(); await pause(500);
    const champ = document.querySelector('input[type=file]');
    if (!champ) return JSON.stringify({ champ: false });
    const dt = new DataTransfer();
    dt.items.add(new File([${JSON.stringify(aImporter)}], 'cahier.hbt.json', { type: 'application/json' }));
    champ.files = dt.files;
    champ.dispatchEvent(new Event('change', { bubbles: true }));
    await pause(1100);
    const dialogue = document.querySelector('.dialogue');
    return JSON.stringify({
      champ: true,
      dialoguePresent: !!dialogue,
      titre: dialogue ? dialogue.querySelector('h2')?.textContent.trim() : null,
      divergentes: dialogue ? [...dialogue.querySelectorAll('.liste-divergences li')].map((l) => l.textContent) : [],
      choix: dialogue ? [...dialogue.querySelectorAll('.choix-import span')].map((x) => x.childNodes[0].textContent.trim()) : [],
      note: dialogue ? dialogue.querySelector('.dialogue-note')?.textContent.replace(/\\s+/g, ' ').trim() : null,
    });
  `)
  const i = JSON.parse(importation)
  verifier('le fichier est bien pris', i.champ === true)
  verifier('la question est posee', i.dialoguePresent === true, i.titre ?? '')
  verifier('une seule fiche diverge', i.divergentes.length === 1, JSON.stringify(i.divergentes))
  verifier('c est bien la fiche deja presente',
    (i.divergentes[0] ?? '').startsWith('Croisé arrière'), JSON.stringify(i.divergentes))
  verifier('les trois options sont offertes', i.choix.length === 3, JSON.stringify(i.choix))
  verifier('la note annonce ce qui passera sans question',
    /1 fiche inconnue/.test(i.note ?? '') && /1 est déjà présente/.test(i.note ?? ''), i.note)

  const apres = await n.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    [...document.querySelectorAll('.dialogue button')]
      .find((b) => b.textContent.trim() === 'Importer')?.click();
    await pause(1200);
    const bandeau = document.querySelector('.bandeau.information');
    const btn = (t) => [...document.querySelectorAll('button')]
      .find((b) => b.textContent.trim().includes(t));
    return JSON.stringify({
      message: bandeau ? bandeau.textContent.replace(/\\s+/g, ' ').replace('✕', '').trim() : null,
    });
  `)
  const a = JSON.parse(apres)
  verifier('le resume dit ce qui a ete fait',
    /1 fiche ajoutée/.test(a.message ?? '') &&
    /1 fiche remplacée/.test(a.message ?? '') &&
    /1 fiche déjà présente/.test(a.message ?? ''),
    a.message)
  const fusion = await n.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const base = await new Promise((ok2, ko2) => {
      const r = indexedDB.open('handball-training', 3);
      r.onsuccess = () => ok2(r.result); r.onerror = () => ko2(r.error);
    });
    const fiches = await new Promise((ok2, ko2) => {
      const q = base.transaction('modeles', 'readonly').objectStore('modeles').getAll();
      q.onsuccess = () => ok2(q.result); q.onerror = () => ko2(q.error);
    });
    base.close();
    const croise = fiches.filter((f) => f.titre.startsWith('Croisé arrière'));
    return JSON.stringify({
      nombre: croise.length,
      texte: croise[0] ? croise[0].fonctionnement.split(String.fromCharCode(10))[0] : null,
      id: croise[0] ? croise[0].id : null,
    });
  `)
  const f = JSON.parse(fusion)
  verifier('la fiche remplacee ne fait pas doublon', f.nombre === 1, String(f.nombre))
  verifier('elle porte le texte corrige', f.texte === 'Texte corrigé du cahier.', String(f.texte))
  verifier('et garde l identifiant d origine',
    f.id === enBibliotheque.id, String(f.id))
} finally {
  await n.fermer()
}

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
