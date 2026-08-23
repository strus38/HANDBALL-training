/**
 * Test de fumee de l'interface, dans un vrai navigateur.
 *
 * Pourquoi ce fichier existe : le plein ecran du terrain a disparu de la barre
 * d'outils lors d'un remaniement, et le menu deroulant s'ouvrait sous le
 * bandeau de l'application. Les sept autres fichiers de test n'ont rien vu, et
 * ne pouvaient rien voir : ils testent des fonctions pures. Aucun ne tombe si
 * une commande devient inatteignable.
 *
 * Ce test charge le LIVRABLE - dist/index.html, le fichier qu'on donne a
 * l'entraineur - dans le Chrome de la machine, cree une seance, ouvre une
 * fiche, et verifie que les commandes essentielles sont la et fonctionnent.
 * Il ne remplace pas un oeil humain, mais il attrape la disparition d'un bouton
 * et le rognage d'un menu, qui sont les deux pannes constatees.
 *
 * Il verifie AUSSI que l'application demarre : elle a deja pu rester bloquee
 * sur l'ecran d'attente quand indexedDB.open ne repondait ni succes ni erreur.
 *
 * Si Chrome est introuvable, le test le dit et passe : il ne doit pas bloquer
 * une machine qui n'en a pas.
 *
 * Lancement : npm test (apres npm run build, le test porte sur dist/)
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

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

/**
 * Un chemin fourni par l'environnement passe avant la liste : une machine
 * d'integration continue designe ainsi son navigateur au lieu qu'on le devine.
 */
const DEPUIS_ENV = [process.env.CHROME_PATH, process.env.CHROME_BIN].filter(Boolean)

const CHROMES_CONNUS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
]

const CHROMES = [...DEPUIS_ENV, ...CHROMES_CONNUS]

/**
 * Le scenario joue dans la page. Il progresse par etapes espacees : React rend
 * entre deux, et un clic pose avant le rendu precedent ne trouverait rien.
 */
const SCENARIO = `
<script>
const attendre = []
const pas = (f) => attendre.push(f)
const par = (sel) => document.querySelector(sel)
const tous = (sel) => [...document.querySelectorAll(sel)]
const parTexte = (texte) => tous('button').find((b) => b.textContent.trim() === texte)
const rect = (e) => (e ? e.getBoundingClientRect() : null)
const r = { etapes: [] }

pas(() => {
  const b = parTexte('+ Seance') || parTexte('+ Nouvelle seance')
  r.bouton_seance = !!b
  if (b) b.click()
})
pas(() => {
  const b = parTexte('+ Exercice')
  r.bouton_exercice = !!b
  if (b) b.click()
})
pas(() => {
  const lien = par('.lien-exercice')
  r.lien_exercice = !!lien
  if (lien) lien.click()
})
pas(() => {
  r.fiche_ouverte = !!par('.fiche-corps')
  r.separateur = !!par('.separateur')
  // La fiche est neuve, donc vide : on pose un gardien, seul jeton dont
  // l'etiquette par defaut n'est pas vide.
  const ajouter = parTexte('+ Ajouter')
  r.palette = !!ajouter
  if (ajouter) ajouter.click()
})
pas(() => {
  const gardien = tous('.panneau-flottant button').find((b) => /Gardien/.test(b.textContent))
  r.choix_gardien = !!gardien
  if (gardien) gardien.click()
})
pas(() => {
  // Le dessin du joueur : un corps, des bras, et une etiquette lisible dans sa
  // pastille. Un jeton qui perdrait son etiquette redeviendrait anonyme.
  r.jetons = tous('.cadre-terrain .jeton').length
  r.etiquettes = tous('.cadre-terrain .jeton-etiquette').length
  r.texte_etiquette = (par('.cadre-terrain .jeton-etiquette') || {}).textContent ?? null
  // Le bouton doit etre DANS la barre d'outils, pas dans un menu deroulant.
  const direct = tous('.colonne-terrain .barre-outils .bouton.plein-ecran').filter(
    (b) => !b.closest('.panneau-flottant'),
  )
  r.plein_ecran_terrain_direct = direct.length
  r.plein_ecran_detail = tous('.colonne-detail .bouton.plein-ecran').length
  if (direct[0]) direct[0].click()
})
pas(() => {
  const corps = par('.fiche-corps')
  r.classe_plein = corps ? corps.className.includes('plein-terrain') : false
  const detail = par('.colonne-detail')
  r.detail_masque = detail ? getComputedStyle(detail).display === 'none' : true
  const direct = tous('.colonne-terrain .barre-outils .bouton.plein-ecran')[0]
  if (direct) direct.click()
})
pas(() => {
  const corps = par('.fiche-corps')
  r.retour_deux_colonnes = corps ? !corps.className.includes('plein-') : false
  const menu = tous('.colonne-terrain .barre-outils button').find(
    (b) => b.getAttribute('aria-haspopup') === 'menu',
  )
  r.menu_present = !!menu
  if (menu) menu.click()
})
pas(() => {
  const panneau = par('.colonne-terrain .panneau-flottant')
  r.menu_ouvert = !!panneau
  if (panneau) {
    const p = rect(panneau)
    const colonne = rect(par('.colonne-terrain'))
    const entete = rect(par('.entete'))
    // Un panneau qui remonte au-dessus de sa colonne est rogne par le
    // defilement, et passe sous le bandeau de l'application.
    r.menu_sous_le_bandeau = entete ? p.top < entete.bottom - 1 : false
    r.menu_rogne_en_haut = colonne ? p.top < colonne.top - 1 : false
    r.menu_hors_ecran = p.top < 0 || p.left < 0 || p.right > window.innerWidth
    r.menu_hauteur = Math.round(p.height)
  }
})

// Le demarrage sonde le stockage : il n'est pas instantane. On attend qu'il
// aboutisse avant de jouer le scenario, sans quoi on mesurerait l'ecran de
// chargement plutot que l'application.
const DEBUT = Date.now()
const PATIENCE = 6000
let i = 0
let demarre = false

const suite = setInterval(() => {
  try {
    if (!demarre) {
      // On interroge l'ELEMENT d'attente, pas le texte de la page : ce script
      // vit lui aussi dans le body, et son propre code contiendrait le mot
      // cherche - le test se croirait alors eternellement en chargement.
      const charge = !par('.attente')
      if (charge) {
        demarre = true
        r.demarre = true
        r.demarre_en_ms = Date.now() - DEBUT
      } else if (Date.now() - DEBUT > PATIENCE) {
        demarre = true
        r.demarre = false
        r.demarre_en_ms = Date.now() - DEBUT
      }
      return
    }
    if (i < attendre.length) attendre[i++]()
    else {
      clearInterval(suite)
      document.title = 'RESULTAT ' + JSON.stringify(r)
    }
  } catch (e) {
    clearInterval(suite)
    r.erreur = 'etape ' + i + ' : ' + e.message
    document.title = 'RESULTAT ' + JSON.stringify(r)
  }
}, 220)
</script>
`

console.log('')
console.log("1. Interface, dans un vrai navigateur")

const chrome = CHROMES.find((c) => existsSync(c))
const livrable = join(racine, 'dist', 'index.html')

if (!chrome) {
  console.log('        Chrome introuvable sur cette machine : test ignore.')
  console.log('')
  console.log(`=== ${ok} reussis, ${ko} echoues ===`)
  process.exit(0)
}

if (!existsSync(livrable)) {
  console.log('  ECHEC dist/index.html absent : lancez npm run build avant npm test')
  process.exit(1)
}

const bac = join(racine, '.build-tests')
mkdirSync(bac, { recursive: true })
const sonde = join(bac, 'sonde-interface.html')
writeFileSync(sonde, readFileSync(livrable, 'utf8') + SCENARIO)

let dom = ''
try {
  dom = execFileSync(
    chrome,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=20000',
      '--window-size=1400,900',
      '--dump-dom',
      sonde,
    ],
    { encoding: 'utf8', timeout: 60000, stdio: ['ignore', 'pipe', 'ignore'] },
  )
} catch (erreur) {
  // Chrome rend parfois un code de sortie non nul apres --dump-dom : le DOM
  // recupere reste exploitable, c'est lui qui tranche.
  dom = erreur.stdout ?? ''
}

const trouve = dom.match(/RESULTAT (\{.*?\})</)
if (!trouve) {
  console.log("  ECHEC le scenario n'a pas rendu de resultat (page non chargee ?)")
  process.exit(1)
}

const r = JSON.parse(trouve[1])
if (r.erreur) console.log('        ' + r.erreur)

console.log(`        Demarrage en ${r.demarre_en_ms ?? '?'} ms`)
verifier(
  "l application demarre",
  r.demarre === true,
  "(bloquee sur l'ecran d'attente : voir le delai de sonde d IndexedDB)",
)
verifier('une seance peut etre creee', r.bouton_seance === true)
verifier('un exercice peut etre ajoute', r.bouton_exercice === true)
verifier('la fiche s ouvre', r.fiche_ouverte === true)
verifier('le separateur est present', r.separateur === true)
verifier('la palette s ouvre', r.palette === true && r.choix_gardien === true)
verifier(
  'un jeton pose porte son etiquette',
  r.jetons === 1 && r.etiquettes === 1 && r.texte_etiquette === 'GB',
  `(${r.jetons} jeton, ${r.etiquettes} etiquette, texte ${JSON.stringify(r.texte_etiquette)})`,
)
verifier(
  'le plein ecran du terrain est dans la barre d outils',
  r.plein_ecran_terrain_direct === 1,
  `(${r.plein_ecran_terrain_direct} trouve, hors menu deroulant)`,
)
verifier('le plein ecran du detail est present', r.plein_ecran_detail === 1)
verifier('le plein ecran masque l autre colonne', r.classe_plein === true && r.detail_masque === true)
verifier('un second clic revient a deux colonnes', r.retour_deux_colonnes === true)
verifier('le menu deroulant du terrain existe', r.menu_present === true)
verifier('le menu s ouvre', r.menu_ouvert === true)
verifier(
  'le menu ne passe pas sous le bandeau',
  r.menu_sous_le_bandeau === false,
  '(panneau ouvert vers le haut ?)',
)
verifier('le menu n est pas rogne par le defilement', r.menu_rogne_en_haut === false)
verifier('le menu reste dans la fenetre', r.menu_hors_ecran === false)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
