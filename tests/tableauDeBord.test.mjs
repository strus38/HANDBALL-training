/**
 * Test de la seance recuperee en ligne aupres du tableau de bord d'un club.
 *
 * Deux promesses : la seance que publie le tableau de bord entre par l'import
 * ordinaire ; et l'application ne touche au reseau qu'a un seul endroit, le
 * temps de ce telechargement — tout le reste doit continuer de marcher au
 * gymnase.
 *
 * Lancement : npm test
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { importerFichier } from '../.build-tests/domaine.mjs'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log(`  OK    ${nom}`) }
  else { ko++; console.log(`  ECHEC ${nom} ${detail}`) }
}

console.log('1. La séance du tableau de bord entre par l import ordinaire')
// Telle que la publie un tableau de bord : sans exercice, sans nom de joueur.
const publiee = {
  format: 'handball-training', version: 3, exporteLe: '2026-10-05T05:00:12.000Z', application: 'tableau de bord',
  contenu: {
    type: 'seance',
    seance: {
      id: 'tableau-de-bord-2026-10-05', titre: 'Préparer Club Bravo', date: '2026-10-06',
      equipe: 'Seniors garçons', categorieAge: '+18 ans',
      objectifSeance: 'Avant Club Bravo (journée 2). Adversaire : 21,0 buts marqués ; à surveiller : n° 12.',
      effectifJoueurs: 0, effectifGardiens: 0, espaceDisponible: '', retour: '', retourEcritLe: '',
      exercices: [], creeLe: '2026-10-05T05:00:12.000Z', modifieLe: '2026-10-05T05:00:12.000Z',
    },
  },
}
const contenu = importerFichier(JSON.stringify(publiee))
verifier("c'est une séance", contenu.type === 'seance')
verifier('titre, date et objectif arrivent', contenu.seance.titre === 'Préparer Club Bravo' &&
  contenu.seance.date === '2026-10-06' && contenu.seance.objectifSeance.includes('n° 12'))
verifier('sans exercice : l entraîneur les choisit', contenu.seance.exercices.length === 0)
verifier('elle reçoit un identifiant neuf', contenu.seance.id !== publiee.contenu.seance.id)

console.log('\n2. Un seul endroit de l application touche au réseau')
const fichiers = (d) => statSync(d).isFile() ? [d] : readdirSync(d).flatMap((n) => fichiers(join(d, n)))
const sources = fichiers('src').map((c) => c.split('\\').join('/'))
const reseau = /\bfetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon/
const fautifs = sources.filter((c) => c !== 'src/platform/reseau.ts' && reseau.test(readFileSync(c, 'utf8')))
verifier('seul src/platform/reseau.ts accède au réseau', fautifs.length === 0, fautifs.join(', '))
const appelants = sources.filter((c) => /platform\/reseau/.test(readFileSync(c, 'utf8')))
verifier('et seule la récupération du tableau de bord l appelle', appelants.join() === 'src/App.tsx', appelants.join())

console.log('\n3. Le profil d un club déclare son tableau de bord proprement')
for (const id of readdirSync('clubs')) {
  const tableau = JSON.parse(readFileSync(`clubs/${id}/profil.json`, 'utf8')).tableauDeBord
  if (!tableau) continue
  verifier(`${id} : un nom pour le bouton`, typeof tableau.nom === 'string' && tableau.nom.trim().length > 0)
  verifier(`${id} : une adresse https vers une séance .json`,
    /^https:\/\/[^\s]+\.json$/.test(tableau.donnees ?? ''), tableau.donnees)
}

console.log(`\n=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
