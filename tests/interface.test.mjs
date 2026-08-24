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
  const b = parTexte('+ Séance') || parTexte('+ Nouvelle séance')
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
  const ajouter = parTexte('+ Étape')
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
  const retour = parTexte('← Séance')
  r.retour_seance = !!retour
  if (retour) retour.click()
})
pas(() => {
  const b = parTexte('Bibliothèque')
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

// -------------------------------------------------------------- Mode terrain
// L'entraineur avait signale ne pas trouver comment l'activer : le premier
// point verifie ici est donc que la commande EXISTE et est atteignable depuis
// la seance, avant meme ce qu'elle affiche.
pas(() => {
  // Refermer la bibliotheque, restee ouverte par la section precedente.
  const fermer = tous('.modale-entete button').find((b) => b.textContent.trim() === '✕')
  if (fermer) fermer.click()
})
pas(() => {
  r.bibliotheque_fermee = !par('.modale.bibliotheque')
  // Une seconde fiche : sans elle, « Suivant » est desactive et l on ne peut
  // pas verifier que la case cochee suit bien l exercice affiche.
  const ajouter = parTexte('+ Exercice')
  if (ajouter) ajouter.click()
})
pas(() => {
  // Ajouter un exercice ouvre sa fiche : on revient a la seance, c est de
  // la que part le mode terrain.
  const retour = parTexte('← Séance')
  if (retour) retour.click()
})
pas(() => {
  const b = tous('button').find((x) => /Mode terrain/.test(x.textContent))
  r.commande_mode_terrain = !!b
  r.mode_terrain_atteignable = b ? !b.disabled : false
  if (b) b.click()
})
pas(() => {
  const vue = par('.mode-terrain')
  r.mode_terrain_ouvert = !!vue
  if (vue) {
    const p = rect(vue)
    // Plein ecran : sinon l'interface d'edition reste visible autour et invite
    // a modifier la seance pendant qu'on la mene.
    r.mode_terrain_plein_ecran = p.width >= window.innerWidth - 2 && p.height >= window.innerHeight - 2
  }
  r.terrain_titre = (par('.terrain-texte h1') || {}).textContent ?? null
  r.terrain_taille_titre = par('.terrain-texte h1')
    ? Math.round(parseFloat(getComputedStyle(par('.terrain-texte h1')).fontSize))
    : 0
  r.terrain_horaire = (par('.terrain-horaire strong') || {}).textContent ?? null
  r.terrain_position = (par('.terrain-position strong') || {}).textContent ?? null
  r.terrain_schema = !!par('.terrain-schema svg')
  const cocher = tous('.terrain-pied button').find((x) => /Marquer mené/.test(x.textContent))
  r.terrain_case = !!cocher
  if (cocher) cocher.click()
})
pas(() => {
  const cocher = tous('.terrain-pied button').find((x) => /Mené|Marquer/.test(x.textContent))
  r.terrain_coche = cocher ? cocher.getAttribute('aria-pressed') === 'true' : false
  r.terrain_libelle_coche = cocher ? cocher.textContent.trim() : null
  const suivant = tous('.terrain-pied button').find((x) => /Suivant/.test(x.textContent))
  r.terrain_suivant = !!suivant
  if (suivant) suivant.click()
})
pas(() => {
  r.terrain_position_2 = (par('.terrain-position strong') || {}).textContent ?? null
  const cocher = tous('.terrain-pied button').find((x) => /Mené|Marquer/.test(x.textContent))
  // L'exercice suivant n'est pas coche : la case suit l'exercice affiche, elle
  // n'est pas un reglage global.
  r.terrain_coche_2 = cocher ? cocher.getAttribute('aria-pressed') === 'true' : null
  const fermer = par('.terrain-entete button')
  if (fermer) fermer.click()
})
pas(() => {
  r.mode_terrain_ferme = !par('.mode-terrain')
  // De retour dans la seance, le plan doit etre intact : la duree prevue du
  // premier exercice ne doit pas avoir ete remplacee par un temps mesure.
  r.seance_retrouvee = !!par('.liste-exercices, .lien-exercice')
  // La rangee d actions : on releve son ordre pour verifier que la seule
  // commande irreversible ne touche pas les plus frequentes.
  // L objectif de la seance se dicte aussi : il vit dans DetailSeance, pas
  // dans la fiche, et pourrait donc etre oublie d un remaniement a l autre.
  const champObjectif = tous('label.champ').find((l) => /Objectif de la séance/i.test(l.textContent))
  r.micro_objectif_seance = champObjectif ? !!champObjectif.querySelector('.bouton-dictee') : false
  const rangee = par('.entete-section .pousse')
  r.actions = rangee
    ? [...rangee.children].map((e) =>
        e.className.includes('separateur-actions') ? '|' : e.textContent.trim(),
      )
    : null
})

// ------------------------------------------------------------------ Dictee
// Deux chemins distincts, et le second doit marcher sans reseau :
//  - le micro a cote des champs longs, qui passe par internet ;
//  - « Coller un texte dicte », pour la dictee du telephone.
pas(() => {
  const lien = par('.lien-exercice')
  r.retour_fiche = !!lien
  if (lien) lien.click()
})
pas(() => {
  r.fiche_rouverte = !!par('.colonne-detail')
  // Le micro n'existe QUE si le navigateur sait transcrire. On mesure les deux
  // ensemble : un bouton present sans support serait un bouton mort.
  r.moteur_vocal = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  r.micros = tous('.bouton-dictee').length
  const microSur = (etiquette) => {
    const champ = tous('label').find((l) => new RegExp(etiquette, 'i').test(l.textContent))
    return champ ? !!champ.querySelector('.bouton-dictee') : false
  }
  r.micro_consigne = microSur('^Consigne')
  r.micro_forme = microSur('Forme d')
  const micro = par('.bouton-dictee')
  r.micro_dans_etiquette = micro ? !!micro.closest('.champ > span, span.avec-dictee') : false
  // Un micro dans un <label> ne doit pas emporter le clic vers le champ.
  r.micro_est_bouton = micro ? micro.tagName === 'BUTTON' && micro.type === 'button' : false
  const posValeur = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    'value',
  ).set
  const champFonc = tous('.colonne-detail label.champ').find((l) =>
    /Fonctionnement/i.test(l.textContent),
  )
  const zoneFonc = champFonc && champFonc.querySelector('textarea')
  r.temoin_pose = !!zoneFonc
  if (zoneFonc) {
    posValeur.call(zoneFonc, 'TEMOIN A PRESERVER')
    zoneFonc.dispatchEvent(new Event('input', { bubbles: true }))
  }
  const coller = tous('button').find((b) => /Coller un texte dicté/.test(b.textContent))
  r.bouton_coller = !!coller
  r.coller_differe = true
})
pas(() => {
  const coller = tous('button').find((b) => /Coller un texte dicté/.test(b.textContent))
  if (coller) coller.click()
})
pas(() => {
  const zone = par('.zone-collage')
  r.fenetre_collage = !!zone
  if (zone) {
    // On simule un collage : React ecoute onChange, pas la propriete brute.
    const poseur = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      'value',
    ).set
    poseur.call(
      zone,
      'Mise en place : deux colonnes a neuf metres.\\n' +
        'Deroulement : le demi-centre engage puis passe a l arriere droit.\\n' +
        'Points cles : la passe se donne a hauteur de hanche.',
    )
    zone.dispatchEvent(new Event('input', { bubbles: true }))
  }
})
pas(() => {
  const apercu = par('.apercu-repartition')
  r.apercu_annonce = apercu ? apercu.textContent.trim() : null
  const appliquer = tous('.actions-modale button').find((b) => /Répartir/.test(b.textContent))
  r.bouton_repartir = !!appliquer
  if (appliquer) appliquer.click()
})
pas(() => {
  r.collage_ferme = !par('.zone-collage')
  const valeur = (etiquette) => {
    const champ = tous('.colonne-detail label.champ').find((l) =>
      new RegExp(etiquette, 'i').test(l.textContent),
    )
    const zone = champ && champ.querySelector('textarea')
    return zone ? zone.value : null
  }
  r.mise_en_place = valeur('Mise en place')
  r.fonctionnement = valeur('Fonctionnement')
  r.points_cles = valeur('Points clés')
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
  /étoile/i.test(r.message_vide ?? ''),
  JSON.stringify(r.message_vide),
)

console.log('')
console.log('4. Mode terrain')
verifier('la bibliotheque se referme', r.bibliotheque_fermee === true)
verifier(
  'la commande « Mode terrain » existe dans la seance',
  r.commande_mode_terrain === true,
  "(elle etait introuvable : c'est le premier point a garder)",
)
verifier('elle est active quand la seance a des exercices', r.mode_terrain_atteignable === true)
verifier('le mode terrain s ouvre', r.mode_terrain_ouvert === true)
verifier(
  'il occupe tout l ecran',
  r.mode_terrain_plein_ecran === true,
  "(sinon l'interface d'edition reste visible autour)",
)
verifier('un titre d exercice est affiche', !!r.terrain_titre, JSON.stringify(r.terrain_titre))
verifier(
  'il est ecrit en grand',
  r.terrain_taille_titre >= 24,
  `(${r.terrain_taille_titre} px : on lit cet ecran a bout de bras)`,
)
verifier('le schema est affiche', r.terrain_schema === true)
verifier(
  'le temps restant est annonce',
  /min|heure/.test(r.terrain_horaire ?? ''),
  JSON.stringify(r.terrain_horaire),
)
verifier('la position dans la seance est annoncee', /1 \/ \d/.test(r.terrain_position ?? ''), JSON.stringify(r.terrain_position))
verifier('la case a cocher est presente', r.terrain_case === true)
verifier('cocher change son etat', r.terrain_coche === true, JSON.stringify(r.terrain_libelle_coche))
verifier('on passe a l exercice suivant', /2 \/ \d/.test(r.terrain_position_2 ?? ''), JSON.stringify(r.terrain_position_2))
verifier(
  'la case suit l exercice affiche',
  r.terrain_coche_2 === false,
  "(sinon elle serait un reglage global et non un releve par exercice)",
)
verifier('on peut quitter le mode terrain', r.mode_terrain_ferme === true)
verifier('et l on retrouve la seance', r.seance_retrouvee === true)

// L ordre exact des commandes est un choix de conception, il peut changer.
// Ce qui ne doit pas changer, c est que la seule action IRREVERSIBLE de la
// rangee ne soit pas collee aux plus frequentes : elle etait auparavant
// coincee entre « Exporter » et « Bibliotheque ».
const actions = r.actions ?? []
const rangSupprimer = actions.findIndex((t) => /Supprimer/.test(t))
const rangPrincipal = actions.findIndex((t) => /\+ Exercice/.test(t))
if (r.moteur_vocal) {
  verifier('l objectif de la seance se dicte', r.micro_objectif_seance === true)
}
verifier('la rangee d actions est lisible', actions.length >= 6, JSON.stringify(actions))
verifier(
  'la commande principale ferme la rangee',
  rangPrincipal === actions.length - 1,
  JSON.stringify(actions),
)
verifier(
  'la suppression est isolee par un separateur',
  actions[rangSupprimer + 1] === '|' || actions[rangSupprimer - 1] === '|',
  JSON.stringify(actions),
)
verifier(
  'la suppression ne touche pas la commande principale',
  rangSupprimer >= 0 && Math.abs(rangPrincipal - rangSupprimer) >= 3,
  `(rangs ${rangSupprimer} et ${rangPrincipal} : la seule action irreversible etait a un pixel des plus frequentes)`,
)

console.log('')
console.log('5. Dictee')
verifier('on rouvre une fiche', r.fiche_rouverte === true)
verifier(
  'le micro apparait exactement quand le navigateur sait transcrire',
  r.moteur_vocal ? r.micros >= 6 : r.micros === 0,
  `(moteur ${r.moteur_vocal}, ${r.micros} micros : un bouton mort serait pire qu'aucun bouton)`,
)
if (r.moteur_vocal) {
  verifier('le micro est dans l etiquette du champ', r.micro_dans_etiquette === true)
  verifier(
    'et c est un bouton de type button',
    r.micro_est_bouton === true,
    "(sinon il envoie le formulaire ou double le clic depuis son <label>)",
  )
}
if (r.moteur_vocal) {
  verifier(
    'la consigne d une etape se dicte',
    r.micro_consigne === true,
    '(champ d une ligne : le micro doit y etre aussi)',
  )
  verifier('la forme d intervention se dicte', r.micro_forme === true)
}
verifier('« Coller un texte dicte » est atteignable', r.bouton_coller === true)
verifier('la fenetre de collage s ouvre', r.fenetre_collage === true)
verifier(
  'la repartition est annoncee AVANT d agir',
  /Mise en place/.test(r.apercu_annonce ?? '') && /Points clés/.test(r.apercu_annonce ?? ''),
  JSON.stringify(r.apercu_annonce),
)
verifier('le bouton de repartition est propose', r.bouton_repartir === true)
verifier('la fenetre se referme apres application', r.collage_ferme === true)
verifier(
  'la mise en place a bien atterri',
  /deux colonnes a neuf metres/.test(r.mise_en_place ?? ''),
  JSON.stringify(r.mise_en_place),
)
verifier(
  'le deroulement est alle dans le fonctionnement',
  /le demi-centre engage/.test(r.fonctionnement ?? ''),
  JSON.stringify(r.fonctionnement),
)
verifier(
  'les points cles aussi',
  /hauteur de hanche/.test(r.points_cles ?? ''),
  JSON.stringify(r.points_cles),
)
verifier('un temoin a bien ete pose avant le collage', r.temoin_pose === true)
verifier(
  'le texte deja present n a pas ete efface',
  /TEMOIN A PRESERVER/.test(r.fonctionnement ?? ''),
  "(le collage AJOUTE : il ne doit pas ecraser ce qui etait ecrit)",
)

console.log('')
console.log(`=== ${ok} reussis, ${ko} echoues ===`)
process.exit(ko === 0 ? 0 : 1)
