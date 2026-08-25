/**
 * Le champ « Matériel » et la palette : vérification dans un vrai navigateur.
 *
 * Pourquoi un test de navigateur et non un test de domaine : le défaut corrigé
 * ici n'existait QUE dans un champ contrôlé. La valeur affichée était recalculée
 * depuis la liste à chaque frappe, si bien que la virgule qu'on venait de taper
 * produisait un élément vide, aussitôt écarté par le filtre, et disparaissait
 * sous les doigts — suivie de l'espace, mangé par le trim. Aucune fonction pure
 * ne pouvait voir cela : `decouper('ballons,')` a toujours rendu la bonne
 * liste. C'est l'aller-retour avec le champ qui était cassé.
 *
 * Le test passe si Chrome est introuvable, pour ne pas bloquer une machine qui
 * n'en a pas. Il porte sur `dist/`, donc après `npm run build`.
 *
 * Lancement : node tests/materielInterface.test.mjs (inclus dans npm run fumee)
 */

import { ouvrirNavigateur } from '../outils/navigateur.mjs'
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

const livrable = pathToFileURL(resolve('dist/index.html')).href
if (!existsSync(resolve('dist/index.html'))) {
  console.log('\n  (dist/index.html absent : lancez npm run build)')
  process.exit(0)
}

const navigateur = await ouvrirNavigateur()
if (!navigateur) {
  console.log('\n  (Chrome introuvable : test ignore)')
  process.exit(0)
}

/** Ouvre une fiche neuve dans une seance neuve. */
const OUVRIR_FICHE = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const btn = (t) => [...document.querySelectorAll('button')]
    .find((b) => b.textContent.trim() === t);
  await pause(700);
  if (!document.querySelector('.carte-seance')) {
    (btn('Créer une séance') || btn('+ Nouvelle séance'))?.click(); await pause(500);
  } else {
    document.querySelector('.carte-seance .zone-ouverture').click(); await pause(500);
  }
  (btn('Créer une fiche') || btn('+ Exercice'))?.click(); await pause(700);
  const champ = [...document.querySelectorAll('label.champ')]
    .find((l) => l.querySelector('span')?.textContent === 'Matériel');
  return { fiche: !!document.querySelector('.fiche'), champMateriel: !!champ };
`

/**
 * Frappe caractere par caractere, comme un entraineur.
 *
 * Chaque frappe passe par le setter natif puis un evenement « input » : c'est
 * le seul moyen de reproduire ce que fait un vrai clavier face a React, et donc
 * le seul moyen de voir le defaut.
 */
const TAPER = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const champ = [...document.querySelectorAll('label.champ')]
    .find((l) => l.querySelector('span')?.textContent === 'Matériel')
    ?.querySelector('input');
  if (!champ) return { trouve: false };
  const poser = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  const etapes = [];
  const phrase = '3 ballons, 6 plots, chasubles rouges';
  for (const lettre of phrase) {
    poser.call(champ, champ.value + lettre);
    champ.dispatchEvent(new Event('input', { bubbles: true }));
    await pause(12);
    etapes.push(champ.value);
  }
  await pause(250);
  return {
    trouve: true,
    voulu: phrase,
    affiche: champ.value,
    // L'etat du champ juste apres la frappe de la premiere virgule.
    apresVirgule: etapes[phrase.indexOf(',')],
    apresEspace: etapes[phrase.indexOf(',') + 1],
  };
`

/** Relit la fiche apres un aller-retour vers la seance : le modele a-t-il pris ? */
const RELIRE = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const btn = (t) => [...document.querySelectorAll('button')]
    .find((b) => b.textContent.trim().includes(t));
  btn('← Séance')?.click(); await pause(600);
  document.querySelector('.ligne-exercice button')?.click(); await pause(700);
  const champ = [...document.querySelectorAll('label.champ')]
    .find((l) => l.querySelector('span')?.textContent === 'Matériel')
    ?.querySelector('input');
  return { relu: champ ? champ.value : null };
`

/** Contenu de la palette d'elements a poser sur le terrain. */
const PALETTE = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const ajouter = [...document.querySelectorAll('button')]
    .find((b) => b.title === 'Ajouter un joueur, un ballon, du matériel');
  if (!ajouter) return { ouverte: false };
  ajouter.click(); await pause(400);
  const items = [...document.querySelectorAll('.palette-item')].map((b) => b.textContent.trim());
  return { ouverte: true, items };
`

try {
  await navigateur.aller(livrable)

  console.log('')
  console.log('1. Une fiche, et son champ Materiel')
  const depart = await navigateur.evaluer(OUVRIR_FICHE)
  verifier('la fiche s ouvre', depart.fiche === true)
  verifier('le champ « Matériel » est la', depart.champMateriel === true)

  console.log('')
  console.log('2. On peut y taper des virgules et des espaces')
  const frappe = await navigateur.evaluer(TAPER)
  verifier('le champ a ete trouve', frappe.trouve === true)
  verifier(
    'la virgule survit a la frappe',
    (frappe.apresVirgule ?? '').endsWith(','),
    `(le champ affichait « ${frappe.apresVirgule} »)`,
  )
  verifier(
    'l espace qui la suit survit aussi',
    (frappe.apresEspace ?? '').endsWith(', '),
    `(le champ affichait « ${frappe.apresEspace} »)`,
  )
  verifier(
    'la phrase entiere s ecrit telle qu on la tape',
    frappe.affiche === frappe.voulu,
    `(« ${frappe.affiche} » au lieu de « ${frappe.voulu} »)`,
  )

  console.log('')
  console.log('3. Et le modele a bien enregistre les trois articles')
  const relu = await navigateur.evaluer(RELIRE)
  verifier(
    'la liste est relue en trois articles separes',
    relu.relu === '3 ballons, 6 plots, chasubles rouges',
    `(« ${relu.relu} »)`,
  )

  console.log('')
  console.log('4. La palette : le cerceau entre, le but mobile sort')
  const palette = await navigateur.evaluer(PALETTE)
  verifier('la palette s ouvre', palette.ouverte === true)
  verifier(
    'le cerceau est proposable',
    (palette.items ?? []).includes('Cerceau'),
    `(${(palette.items ?? []).join(', ')})`,
  )
  verifier(
    'le but mobile ne l est plus',
    !(palette.items ?? []).includes('But mobile'),
    `(${(palette.items ?? []).join(', ')})`,
  )
} finally {
  await navigateur.fermer()
}

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
