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


// --------------------------------------------------------- Lecture des etapes
// Deux pannes signalees par l'entraineur : pendant la lecture aucune puce ne
// s'allumait, on ne savait donc plus quelle etape on regardait ; et rien ne
// permettait de figer l'image pour commenter un placement.
const boutonLecture = () =>
  tous('.barre-etapes button').find((b) => /Pause|Lire|Reprendre/.test(b.textContent))

pas(() => {
  // Le menu deroulant est reste ouvert et recouvre la barre : on le referme.
  const menu = tous('.colonne-terrain .barre-outils button').find(
    (b) => b.getAttribute('aria-haspopup') === 'menu',
  )
  if (menu) menu.click()
})
pas(() => {
  r.menu_referme = !par('.colonne-terrain .panneau-flottant')
  const ajouter = parTexte('+ Etape')
  r.bouton_etape = !!ajouter
  if (ajouter) ajouter.click()
})
pas(() => {
  r.puces = tous('.puce-etape').length
  const lire = boutonLecture()
  r.libelle_au_repos = lire ? lire.textContent.trim() : null
  r.lire_actif = lire ? !lire.disabled : false
  if (lire) lire.click()
})
pas(() => {
  const b = boutonLecture()
  r.libelle_en_lecture = b ? b.textContent.trim() : null
  // Le defaut signale : pendant la lecture, plus aucune puce n'etait jaune.
  r.puce_active_en_lecture = tous('.puce-etape.active').length
  r.puce_marquee_lecture = tous('.puce-etape.en-lecture').length
  r.arret_present = tous('.barre-etapes button').filter((x) => x.textContent.trim() === '■').length
  if (b) b.click()
})
pas(() => {
  const b = boutonLecture()
  r.libelle_en_pause = b ? b.textContent.trim() : null
})
// Une fiche a deux etapes se lit en 2,1 s. On patiente plus longtemps que cela :
// si la pause ne tenait pas, la lecture serait finie et le bouton serait revenu
// a « Lire ». C'est ce qui rend ce test capable d'echouer.
for (let k = 0; k < 12; k++) pas(() => {})
pas(() => {
  const b = boutonLecture()
  r.libelle_apres_attente = b ? b.textContent.trim() : null
  r.puce_active_en_pause = tous('.puce-etape.active').length
  if (b) b.click()
})
pas(() => {
  const b = boutonLecture()
  r.libelle_apres_reprise = b ? b.textContent.trim() : null
})

// ------------------------------------------------------------------- Favoris
// L'etoile est posee SUR la carte, qui est elle-meme un bouton : un bouton
// dans un bouton n'est pas du HTML valide et le navigateur defait
// l'imbrication. On verifie donc que l'etoile est bien restee dans sa carte,
// qu'elle bascule, et que la puce « Favoris » filtre reellement.
pas(() => {
  const retour = parTexte('← Seance')
  r.retour_seance = !!retour
  if (retour) retour.click()
})
pas(() => {
  const b = parTexte('Bibliotheque')
  r.bouton_bibliotheque = !!b
  if (b) b.click()
})
pas(() => {
  r.cartes = tous('.liste-modeles .carte-modele').length
  const etoiles = tous('.etoile-favori')
  r.etoiles = etoiles.length
  // Chaque etoile doit vivre dans la meme case de liste que sa carte.
  r.etoiles_bien_placees = etoiles.every((e) => !!e.closest('.element-modele'))
  r.etoiles_hors_carte = etoiles.filter((e) => e.closest('.carte-modele')).length
  r.favoris_avant = tous('.etoile-favori.active').length
  if (etoiles[0]) etoiles[0].click()
})
pas(() => {
  r.favoris_apres = tous('.etoile-favori.active').length
  const puce = tous('.filtres button').find((b) => /Favoris/.test(b.textContent))
  r.puce_favoris = !!puce
  if (puce) puce.click()
})
pas(() => {
  r.cartes_filtrees = tous('.liste-modeles .carte-modele').length
  const puce = tous('.filtres button').find((b) => /Favoris/.test(b.textContent))
  r.puce_favoris_active = puce ? puce.getAttribute('aria-pressed') === 'true' : false
  // On retire l'etoile : la liste filtree doit se vider.
  const etoile = tous('.etoile-favori.active')[0]
  if (etoile) etoile.click()
})
pas(() => {
  r.cartes_apres_retrait = tous('.liste-modeles .carte-modele').length
  r.message_vide = (par('.aucun-resultat') || {}).textContent ?? null
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
console.log('2. Lecture des etapes')
verifier('une deuxieme etape peut etre ajoutee', r.bouton_etape === true && r.puces === 2)
verifier('la lecture est proposee des deux etapes', r.lire_actif === true)
verifier(
  'une puce reste allumee pendant la lecture',
  r.puce_active_en_lecture === 1,
  `(${r.puce_active_en_lecture} puce(s) : sans cela on ne sait plus quelle etape on regarde)`,
)
verifier('les puces sont marquees comme pilotees par la lecture', r.puce_marquee_lecture === 2)
verifier('la lecture propose de mettre en pause', /Pause/.test(r.libelle_en_lecture ?? ''), r.libelle_en_lecture)
verifier('un arret separe est offert', r.arret_present === 1)
verifier('la pause propose de reprendre', /Reprendre/.test(r.libelle_en_pause ?? ''), r.libelle_en_pause)
verifier(
  'la pause tient dans la duree',
  /Reprendre/.test(r.libelle_apres_attente ?? ''),
  `(${r.libelle_apres_attente} : la lecture a repris toute seule)`,
)
verifier('la puce reste allumee pendant la pause', r.puce_active_en_pause === 1)
verifier('reprendre relance la lecture', /Pause/.test(r.libelle_apres_reprise ?? ''), r.libelle_apres_reprise)

console.log('')
console.log('3. Favoris')
verifier('on revient a la seance depuis la fiche', r.retour_seance === true)
verifier('la bibliotheque s ouvre', r.bouton_bibliotheque === true && r.cartes > 0, `(${r.cartes} cartes)`)
verifier('chaque carte porte une etoile', r.etoiles === r.cartes, `(${r.etoiles} etoiles pour ${r.cartes} cartes)`)
verifier(
  'l etoile est restee dans sa carte',
  r.etoiles_bien_placees === true,
  "(un bouton dans un bouton : le navigateur defait l'imbrication)",
)
verifier('aucune etoile imbriquee dans le bouton de la carte', r.etoiles_hors_carte === 0)
verifier(
  'un clic pose une etoile',
  r.favoris_avant === 0 && r.favoris_apres === 1,
  `(${r.favoris_avant} avant, ${r.favoris_apres} apres)`,
)
verifier('la puce Favoris existe', r.puce_favoris === true)
verifier('la puce Favoris est bien une bascule', r.puce_favoris_active === true)
verifier(
  'la puce Favoris ne montre que la fiche etoilee',
  r.cartes_filtrees === 1,
  `(${r.cartes_filtrees} carte(s) sur ${r.cartes})`,
)
verifier(
  'retirer l etoile vide la liste filtree',
  r.cartes_apres_retrait === 0,
  `(${r.cartes_apres_retrait} carte(s) restante(s))`,
)
verifier(
  'et la liste vide explique quoi faire',
  /etoile/i.test(r.message_vide ?? ''),
  JSON.stringify(r.message_vide),
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
