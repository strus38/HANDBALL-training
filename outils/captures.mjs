/**
 * Captures d'ecran de l'application, pour la page de presentation.
 *
 * Le principe : on prend le LIVRABLE (dist/index.html), on lui ajoute un
 * script qui amorce des donnees realistes puis conduit l'interface jusqu'a
 * l'ecran voulu, et on laisse Chrome photographier le resultat.
 *
 * Deux details rendent la chose possible :
 * - le script ajoute est un script CLASSIQUE, donc execute pendant l'analyse
 *   du document, avant le script module de l'application qui est differe. Il
 *   peut ainsi remplir localStorage avant que l'application ne le lise.
 * - Chrome declenche --screenshot a la FIN du budget de temps virtuel : le
 *   scenario a donc le temps de se derouler avant la photo.
 *
 * Les donnees sont fabriquees ici, avec les vrais modeles de la bibliotheque :
 * les captures montrent de vrais exercices, pas des textes de remplissage.
 *
 * Lancement : npm run presentation (qui enchaine captures puis assemblage).
 */

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const BAC = join(racine, '.build-tests')
export const DOSSIER_CAPTURES = join(BAC, 'captures')

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

export const trouverChrome = () => CHROMES.find((c) => existsSync(c))

// --------------------------------------------------------------- Donnees

/** Quelques seances credibles, construites depuis la vraie bibliotheque. */
function donnees() {
  const bundle = join(BAC, 'catalogue.mjs')
  writeFileSync(
    join(BAC, 'entree-catalogue.ts'),
    [
      "export { SENIORS_MASCULINS } from '../src/bibliotheque/seniorsMasculins'",
      "export { GARDIENS } from '../src/bibliotheque/gardiens'",
      "export { SANS_BALLON } from '../src/bibliotheque/sansBallon'",
      "export { construireExercice } from '../src/bibliotheque/modeles'",
      "export { nouvelleSeance } from '../src/domain/fabrique'",
      '',
    ].join('\n'),
  )
  execFileSync(
    'npx',
    [
      'esbuild',
      join(BAC, 'entree-catalogue.ts'),
      '--bundle',
      '--format=esm',
      '--platform=neutral',
      `--outfile=${bundle}`,
    ],
    { cwd: racine, stdio: 'ignore', shell: true },
  )
  return import(`file:///${bundle.replace(/\\/g, '/')}`)
}

const jour = (decalage) => {
  const d = new Date(2026, 8, 15 + decalage)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function seances() {
  const { SENIORS_MASCULINS, GARDIENS, SANS_BALLON, construireExercice, nouvelleSeance } =
    await donnees()
  const tous = [...SENIORS_MASCULINS, ...GARDIENS, ...SANS_BALLON]
  // Par la REFERENCE, jamais par le titre : le titre se corrige - il vient de
  // gagner ses accents - et une recherche par titre rend alors `undefined`,
  // ce qui fait tomber toute la fabrication des captures loin d'ici.
  const parRef = (ref) => tous.find((m) => m.ref === ref)

  const composer = (titre, decalage, objectif, refsModeles, notes) => {
    const seance = nouvelleSeance(titre)
    seance.date = jour(decalage)
    seance.equipe = 'Seniors garçons'
    seance.categorieAge = '+18 ans'
    seance.objectifSeance = objectif
    seance.effectifJoueurs = 12
    seance.effectifGardiens = 2
    seance.exercices = refsModeles.map((ref, rang) => {
      const exercice = construireExercice(parRef(ref))
      const note = notes?.[rang]
      if (note) {
        exercice.evaluation = {
          ...exercice.evaluation,
          note,
          nombreUtilisations: 3,
          derniereUtilisation: jour(decalage - 14),
        }
      }
      return exercice
    })
    return seance
  }

  return [
    composer(
      'Mardi 15 septembre - attaque placée',
      0,
      "Trouver le décalage sans forcer le tir : croisé, pivot, renversement.",
      [
        'echauffement-prophylactique-epaules-genoux-chevilles',
        'croise-arriere-ailier-cote-droit',
        'passe-et-va-avec-le-pivot',
        'renversement-en-trois-passes',
        'gardien-face-aux-tirs-a-9-metres',
        'match-a-theme-deux-passes-minimum-apres-recuperation',
      ],
      [4, 5, 4, 5, 0, 4],
    ),
    composer(
      'Jeudi 17 septembre - défense et transition',
      2,
      'Tenir le bloc, puis repartir vite dès la récupération.',
      [
        'protocole-d-echauffement-en-quatre-temps',
        'defense-6-0-glissement-et-aide-sur-le-pivot',
        'duel-defensif-contest-contre-et-recuperation',
        'contre-attaque-soutenue-deuxieme-vague-et-engagement',
        'gardiens-seuls-temps-de-reaction-sur-signal',
      ],
      [0, 5, 3, 4, 0],
    ),
    composer(
      'Samedi 19 septembre - physique et tests',
      4,
      'Point de forme de début de saison.',
      [
        'reveil-neuromusculaire-appuis-et-changements-de-dire',
        'test-de-vma-demi-cooper',
        'gainage-handball-les-trois-chaines-en-circuit',
        'renforcement-excentrique-ischio-jambiers-et-adducteu',
      ],
      [4, 5, 4, 0],
    ),
  ]
}

// --------------------------------------------------------------- Scenarios

/**
 * Chaque capture : un nom de fichier, la taille de fenetre, et le scenario
 * joue dans la page. `pas()` empile des etapes espacees, le temps que React
 * rende entre deux.
 */
const SCENARIOS = [
  {
    nom: 'accueil',
    taille: '1400,650',
    etapes: `
      pas(() => clic('Toutes les séances'))
    `,
  },
  {
    nom: 'seance',
    taille: '1400,900',
    etapes: `
      pas(() => clicContenant('.liste-seances button', 'attaque placée'))
    `,
  },
  {
    nom: 'bibliotheque',
    taille: '1400,900',
    etapes: `
      pas(() => clicContenant('.liste-seances button', 'attaque placée'))
      pas(() => clic('Bibliothèque'))
      pas(() => {
        const p = tous('.filtres .puce').find((x) => x.textContent.trim() === 'Attaque')
        if (p) p.click()
      })
      pas(() => {
        const c = tous('.carte-modele').find((x) => x.querySelector('.etiquette-etapes'))
        if (c) c.click()
      })
    `,
  },
  {
    nom: 'fiche',
    taille: '1500,950',
    etapes: `
      pas(() => clicContenant('.liste-seances button', 'attaque placée'))
      pas(() => clicContenant('.lien-exercice', 'Croisé arrière'))
    `,
  },
  {
    nom: 'terrain',
    taille: '1500,950',
    etapes: `
      pas(() => clicContenant('.liste-seances button', 'attaque placée'))
      pas(() => clicContenant('.lien-exercice', 'Croisé arrière'))
      pas(() => {
        const b = tous('.colonne-terrain .barre-outils .bouton.plein-ecran')[0]
        if (b) b.click()
      })
      pas(() => {
        // Une etape intermediaire : elle porte les fleches du mouvement.
        const puces = tous('.puce-etape')
        if (puces[1]) puces[1].click()
      })
    `,
  },
  {
    nom: 'collage',
    taille: '1400,860',
    etapes: `
      pas(() => clicContenant('.liste-seances button', 'attaque placée'))
      pas(() => clicContenant('.lien-exercice', 'Croisé arrière'))
      pas(() => clic('Coller un texte dicté'))
      pas(() => {
        const zone = par('.zone-collage')
        if (!zone) return
        const poseur = Object.getOwnPropertyDescriptor(
          window.HTMLTextAreaElement.prototype,
          'value',
        ).set
        poseur.call(
          zone,
          'Mise en place : deux colonnes à neuf mètres, un plot devant chacune.' +
            String.fromCharCode(10) +
            'Déroulement : le demi-centre engage, passe à l arrière droit qui fixe son défenseur, puis croise avec l ailier.' +
            String.fromCharCode(10) +
            'Points clés : la passe se donne à hauteur de hanche, dans le sens de la course.' +
            String.fromCharCode(10) +
            'Variantes : ajouter un défenseur flottant sur l intervalle.',
        )
        zone.dispatchEvent(new Event('input', { bubbles: true }))
      })
    `,
  },
  {
    nom: 'mode-terrain',
    taille: '1500,950',
    etapes: `
      pas(() => clicContenant('.liste-seances button', 'attaque placée'))
      pas(() => clic('▶ Mode terrain'))
      pas(() => {
        // Un exercice deja mene : la case cochee doit se voir sur la capture.
        const b = tous('.terrain-pied button').find((x) => /Marquer mené/.test(x.textContent))
        if (b) b.click()
      })
    `,
  },
  {
    nom: 'bilan',
    taille: '1400,655',
    etapes: `
      pas(() => clic('Bilan de la saison'))
      // Les seances de demonstration sont datees de la saison suivante :
      // l'onglet « saison en cours » serait vide.
      pas(() => clic("Tout l'historique"))
    `,
  },
]

const CADRE = (etapes) => `
<script>
try {
  localStorage.setItem('handball-training:seances', DONNEES)
} catch (e) {}
</script>
<script>
const par = (s) => document.querySelector(s)
const tous = (s) => [...document.querySelectorAll(s)]
const clic = (texte) => {
  const b = tous('button').find((x) => x.textContent.trim() === texte)
  if (b) b.click()
  return !!b
}
/** Vise par le texte : une capture doit montrer un contenu choisi. */
const clicContenant = (selecteur, motif) => {
  const e = tous(selecteur).find((x) => x.textContent.includes(motif))
  if (e) e.click()
  return !!e
}
const attendre = []
const pas = (f) => attendre.push(f)
${etapes}
let demarre = false
let i = 0
const debut = Date.now()
const suite = setInterval(() => {
  try {
    if (!demarre) {
      if (!par('.attente')) demarre = true
      else if (Date.now() - debut > 6000) demarre = true
      return
    }
    if (i < attendre.length) attendre[i++]()
    else clearInterval(suite)
  } catch (e) {
    clearInterval(suite)
  }
}, 200)
</script>
`

// --------------------------------------------------------------- Execution

/**
 * Une capture reste valable tant que le livrable n'a pas change.
 *
 * On compare le CONTENU, pas les dates : vite build reecrit dist/index.html a
 * chaque fois, meme quand rien n'a bouge, et une comparaison de dates
 * relancerait donc six navigateurs a chaque build pour rien.
 */
function empreinte(contenu) {
  return createHash('sha1').update(contenu).digest('hex')
}

/**
 * L'empreinte est retenue POUR CHAQUE capture, pas une fois pour toutes.
 *
 * Deux appelants ne demandent pas les memes vues - la notice en veut quatre, la
 * presentation six. Une empreinte globale, ecrite apres une capture partielle,
 * ferait croire au suivant que tout est a jour et lui rendrait des images
 * perimees.
 */
const fichierEmpreintes = () => join(DOSSIER_CAPTURES, 'empreintes.json')

function empreintesConnues() {
  try {
    return JSON.parse(readFileSync(fichierEmpreintes(), 'utf8'))
  } catch {
    return {}
  }
}

export async function capturer(noms) {
  const chrome = trouverChrome()
  if (!chrome) throw new Error('Chrome introuvable : impossible de produire les captures.')

  const livrable = join(racine, 'dist', 'index.html')
  if (!existsSync(livrable)) throw new Error('dist/index.html absent : lancez npm run build.')

  mkdirSync(DOSSIER_CAPTURES, { recursive: true })
  const base = readFileSync(livrable, 'utf8')
  const empreinteActuelle = empreinte(base)
  const empreintes = empreintesConnues()
  const voulus = noms ? SCENARIOS.filter((s) => noms.includes(s.nom)) : SCENARIOS
  const aJour = (nom) =>
    empreintes[nom] === empreinteActuelle && existsSync(join(DOSSIER_CAPTURES, `${nom}.png`))

  // Tout est deja en cache : on sort avant de fabriquer le jeu de donnees, qui
  // demande un bundle esbuild dont on n'a alors aucun besoin.
  if (voulus.every(({ nom }) => aJour(nom))) {
    return voulus.map(({ nom }) => ({ nom, chemin: join(DOSSIER_CAPTURES, `${nom}.png`) }))
  }

  const jeu = JSON.stringify(JSON.stringify(await seances()))
  const produites = []
  for (const scenario of voulus) {
    if (aJour(scenario.nom)) {
      produites.push({ nom: scenario.nom, chemin: join(DOSSIER_CAPTURES, `${scenario.nom}.png`) })
      continue
    }
    const page = join(BAC, `capture-${scenario.nom}.html`)
    writeFileSync(page, base + CADRE(scenario.etapes).replace('DONNEES', jeu))
    const image = join(DOSSIER_CAPTURES, `${scenario.nom}.png`)
    try {
      execFileSync(
        chrome,
        [
          '--headless',
          '--disable-gpu',
          '--no-sandbox',
          '--hide-scrollbars',
          // Sans cela, Chrome photographie parfois l'image PRECEDENTE : le DOM
          // est a jour mais le compositeur n'a pas repeint. On l'a vu sur la
          // barre d'etapes, ou la pastille active semblait en retard d'un cran.
          '--run-all-compositor-stages-before-draw',
          '--force-device-scale-factor=1',
          '--virtual-time-budget=9000',
          `--window-size=${scenario.taille}`,
          `--screenshot=${image}`,
          page,
        ],
        { timeout: 90000, stdio: 'ignore' },
      )
    } catch {
      // Chrome rend parfois un code non nul apres --screenshot : c'est
      // l'existence du fichier qui tranche.
    }
    if (!existsSync(image)) throw new Error(`Capture manquante : ${scenario.nom}`)
    produites.push({ nom: scenario.nom, chemin: image })
    empreintes[scenario.nom] = empreinteActuelle
    console.log(`  capture ${scenario.nom}`)
  }
  writeFileSync(fichierEmpreintes(), JSON.stringify(empreintes, null, 1))
  return produites
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  await capturer()
}
