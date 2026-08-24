/**
 * Retirer une fiche fournie : vérification dans un vrai navigateur.
 *
 * Les tests de domaine prouvent que la liste des fiches masquées se tient
 * (bascule, relecture, fusion, sauvegarde). Ils ne prouvent PAS ce qui compte
 * pour l'entraîneur : que le bouton existe, que la fiche disparaît vraiment de
 * la liste, que le compteur suit, et qu'un chemin de retour est offert. Ce sont
 * quatre choses qu'aucune fonction pure ne peut voir.
 *
 * Le test passe si Chrome est introuvable, pour ne pas bloquer une machine qui
 * n'en a pas. Il porte sur `dist/`, donc après `npm run build`.
 *
 * Lancement : node tests/masqueesInterface.test.mjs (inclus dans npm run verifier)
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

/** Ouvre la bibliotheque sur une seance neuve. */
const OUVRIR = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const btn = (t) => [...document.querySelectorAll('.bouton')]
    .find((b) => b.textContent.trim().includes(t));
  await pause(600);
  if (!document.querySelector('.carte-seance')) {
    btn('Nouvelle séance')?.click(); await pause(500);
  } else {
    document.querySelector('.carte-seance .zone-ouverture').click(); await pause(500);
  }
  btn('Bibliothèque')?.click(); await pause(700);
  const compteur = [...document.querySelectorAll('.bouton.segment')]
    .find((b) => b.textContent.includes('Fiches fournies'));
  return {
    ouverte: !!document.querySelector('.bibliotheque'),
    cartes: document.querySelectorAll('.carte-modele').length,
    libelleCompteur: compteur ? compteur.textContent.trim() : null,
    puceRetirees: [...document.querySelectorAll('.filtres .puce')]
      .some((p) => p.textContent.includes('Retirées')),
  };
`

/** Retire la fiche affichee en apercu, en confirmant la boite de dialogue. */
const RETIRER = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const titreAvant = document.querySelector('.apercu-modele h3')?.textContent ?? null;
  const retirer = [...document.querySelectorAll('.actions-apercu .bouton')]
    .find((b) => b.textContent.includes('Retirer de la bibliothèque'));
  if (!retirer) return { bouton: false };
  retirer.click(); await pause(400);
  const dialogue = document.querySelector('.dialogue, .modale-confirmation');
  const confirmer = [...document.querySelectorAll('.dialogue button, .actions-dialogue button')]
    .find((b) => /Retirer/.test(b.textContent));
  const texteDialogue = dialogue ? dialogue.textContent : '';
  if (confirmer) confirmer.click();
  await pause(700);
  const compteur = [...document.querySelectorAll('.bouton.segment')]
    .find((b) => b.textContent.includes('Fiches fournies'));
  return {
    bouton: true,
    titreRetire: titreAvant,
    dialoguePropose: /Retirées|reste/.test(texteDialogue),
    cartes: document.querySelectorAll('.carte-modele').length,
    libelleCompteur: compteur ? compteur.textContent.trim() : null,
    puceRetirees: [...document.querySelectorAll('.filtres .puce')]
      .some((p) => p.textContent.includes('Retirées')),
    presenteEncore: [...document.querySelectorAll('.carte-modele')]
      .some((c) => c.textContent.includes(titreAvant ?? '@@')),
  };
`

/** Ouvre la vue des fiches retirees et remet la fiche en place. */
const RETABLIR = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const puce = [...document.querySelectorAll('.filtres .puce')]
    .find((p) => p.textContent.includes('Retirées'));
  if (!puce) return { puce: false };
  puce.click(); await pause(600);
  const listee = document.querySelectorAll('.carte-modele').length;
  const remettre = [...document.querySelectorAll('.actions-apercu .bouton')]
    .find((b) => b.textContent.includes('Remettre dans la bibliothèque'));
  const trouve = !!remettre;
  if (remettre) remettre.click();
  await pause(700);
  const compteur = [...document.querySelectorAll('.bouton.segment')]
    .find((b) => b.textContent.includes('Fiches fournies'));
  return {
    puce: true,
    listee,
    boutonRemettre: trouve,
    libelleCompteur: compteur ? compteur.textContent.trim() : null,
    puceEncoreLa: [...document.querySelectorAll('.filtres .puce')]
      .some((p) => p.textContent.includes('Retirées')),
  };
`

try {
  await navigateur.aller(livrable)

  console.log('')
  console.log('1. La bibliotheque s ouvre')
  const depart = await navigateur.evaluer(OUVRIR)
  verifier('la bibliotheque est affichee', depart.ouverte === true)
  verifier('des fiches sont listees', depart.cartes > 0, `(${depart.cartes} cartes)`)
  verifier(
    'aucune puce « Retirées » au depart',
    depart.puceRetirees === false,
    "(tant que rien n'est retire, la puce n'a pas lieu d'etre)",
  )
  const compteurDepart = Number((depart.libelleCompteur ?? '').replace(/\D+/g, '')) || 0
  verifier('le compteur annonce les fiches fournies', compteurDepart > 0, depart.libelleCompteur)

  console.log('')
  console.log('2. Retirer une fiche')
  const retire = await navigateur.evaluer(RETIRER)
  verifier('le bouton « Retirer » existe sur une fiche fournie', retire.bouton === true)
  verifier(
    'la confirmation annonce que rien n est perdu',
    retire.dialoguePropose === true,
    "(retirer n'est pas supprimer : la boite doit le dire)",
  )
  verifier(
    'la fiche quitte la liste',
    retire.presenteEncore === false,
    `(« ${retire.titreRetire} » y figure encore)`,
  )
  const compteurApres = Number((retire.libelleCompteur ?? '').replace(/\D+/g, '')) || 0
  verifier(
    'le compteur des fiches fournies diminue',
    compteurApres === compteurDepart - 1,
    `(${compteurDepart} -> ${compteurApres})`,
  )
  verifier('la puce « Retirées » apparait', retire.puceRetirees === true)

  console.log('')
  console.log('3. La remettre')
  const remis = await navigateur.evaluer(RETABLIR)
  verifier('la puce ouvre la liste des fiches retirees', remis.puce === true)
  verifier('la fiche retiree y est listee', remis.listee === 1, `(${remis.listee} fiche(s))`)
  verifier('le bouton « Remettre » est offert', remis.boutonRemettre === true)
  const compteurFinal = Number((remis.libelleCompteur ?? '').replace(/\D+/g, '')) || 0
  verifier(
    'le compteur revient a son point de depart',
    compteurFinal === compteurDepart,
    `(${compteurFinal} au lieu de ${compteurDepart})`,
  )
  verifier(
    'la puce « Retirées » disparait une fois la derniere fiche remise',
    remis.puceEncoreLa === false,
    "(elle n'a plus d'objet : la bibliotheque est complete)",
  )
} finally {
  await navigateur.fermer()
}

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
