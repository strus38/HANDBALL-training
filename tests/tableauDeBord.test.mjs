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
import { importerFichier, lireResume, ErreurResume, libelleObjectif, manche, nomCourtEquipe, ordinal } from '../.build-tests/domaine.mjs'

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
verifier('et seul le tableau de bord l appelle (séance, écran)',
  appelants.sort().join() === 'src/App.tsx,src/ui/TableauDeBord.tsx', appelants.join())

console.log('\n3. Le profil d un club déclare son tableau de bord proprement')
for (const id of readdirSync('clubs')) {
  const tableau = JSON.parse(readFileSync(`clubs/${id}/profil.json`, 'utf8')).tableauDeBord
  if (!tableau) continue
  verifier(`${id} : un nom pour le bouton`, typeof tableau.nom === 'string' && tableau.nom.trim().length > 0)
  verifier(`${id} : une adresse https vers une séance .json`,
    /^https:\/\/[^\s]+\.json$/.test(tableau.donnees ?? ''), tableau.donnees)
  if (tableau.resume) verifier(`${id} : le résumé en https`, /^https:\/\/[^\s]+\.json$/.test(tableau.resume))
  if (tableau.page) verifier(`${id} : le tableau de bord complet en https`, /^https:\/\/\S+$/.test(tableau.page))
}

console.log('\n4. Le résumé du tableau de bord se relit prudemment')
const resume = lireResume(JSON.stringify({
  v: 1, genere: '2026-10-05 05:00', club: 'CLUB ALPHA', club_court: 'ALPHA', saison: '2026-2027', feuilles: 3,
  prochain: { journee: 2, date: '2026-10-10', provisoire: true, adversaire: 'P16M DIV- CLUB BRAVO SUD', domicile: false, p_victoire: 64 },
  objectif: { statut: 'en_cours', poule: '71', cible: 3, rang: 1, proba: 89, rangs: [47, 27, 16, 10], restants: 11, matchs: 'abîmé' },
  poules: { 71: [{ rang: 1, equipe: 'CLUB ALPHA', pts: 3, j: 1, v: 1, n: 0, d: 0, bp: 30, bc: 20, diff: 10, forme: ['V'] }] },
}))
verifier('le prochain match et le classement arrivent', resume.prochain.adversaire.endsWith('SUD') && resume.poules['71'][0].pts === 3)
verifier('un champ abîmé devient vide plutôt que de casser l écran', Array.isArray(resume.objectif.matchs) && resume.objectif.matchs.length === 0)
verifier('les parties absentes restent vides', resume.adversaire === null && resume.axes.length === 0)
const refuse = (t) => { try { lireResume(t); return false } catch (e) { return e instanceof ErreurResume } }
verifier('un fichier illisible est refusé', refuse('<html>'))
verifier('un autre format est refusé', refuse(JSON.stringify({ v: 2, poules: {} })))
verifier('l objectif se dit en clair', libelleObjectif(3) === 'finir dans les 3 premiers' && libelleObjectif(1) === 'finir 1er')
verifier('les rangs se disent en clair', ordinal(1) === '1er' && ordinal(3) === '3e' && ordinal(null) === '–')
verifier('le nom court garde ce qui distingue l équipe', nomCourtEquipe('P16M DIV- CLUB BRAVO SUD') === 'Bravo Sud')
verifier('et le numéro de l équipe', nomCourtEquipe('P16M DIV2 RTE CLUB BRAVO SUD 2') === 'Bravo Sud 2' && nomCourtEquipe('CLUB CHARLIE-2') === 'Charlie-2')
verifier('un match de coupe se dit par son tour', manche({ journee: null, coupe: 'Coupe de France', tour: '2EME TOUR' }) === 'Coupe de France · 2e tour'
  && manche({ journee: null, coupe: 'Coupe de France', tour: '1ER TOUR' }, true) === 'Coupe' && manche({ journee: 3 }) === 'J3')

console.log(`\n=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
