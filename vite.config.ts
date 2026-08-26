import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const paquet: { version?: string; clubParDefaut?: string } = JSON.parse(
  readFileSync('./package.json', 'utf8'),
)

/**
 * Pour quel club fabrique-t-on ?
 *
 * Une seule application, un exemplaire par club : `CLUB=xxx npm run build`.
 * Sans rien preciser, c'est le club par defaut du depot — celui pour lequel
 * l'application a ete ecrite — pour que `npm run dev` demarre sans ceremonie.
 *
 * Le profil est lu ICI et par `outils/club.mjs` la-bas : deux lecteurs, un seul
 * fichier. Aucune valeur n'est recopiee de l'un a l'autre.
 */
const CLUB = process.env.CLUB || paquet.clubParDefaut || ''
const DOSSIER_CLUB = `clubs/${CLUB}`

if (!existsSync(`./${DOSSIER_CLUB}/profil.json`)) {
  const connus = existsSync('./clubs') ? readdirSync('./clubs').join(', ') : 'aucun'
  throw new Error(
    `Club « ${CLUB} » inconnu : ${DOSSIER_CLUB}/profil.json est absent.
` +
      `Clubs disponibles : ${connus}`,
  )
}

const profil: { nomCourt: string } = JSON.parse(
  readFileSync(`./${DOSSIER_CLUB}/profil.json`, 'utf8'),
)

/**
 * Revision courte du depot, pour relier un fichier livre au code exact.
 *
 * Le depot peut etre absent - une archive .zip decompressee, une machine sans
 * git : la fabrication doit alors continuer sans revision plutot que d'echouer.
 */
function revision(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
  } catch {
    return ''
  }
}

// Le livrable est un fichier HTML unique et autonome, renomme juste apres
// la fabrication par outils/renommerLivrable.mjs :
// double-clic, aucun serveur, aucun acces internet.
// base: './' pour que le fichier fonctionne aussi en file://
export default defineConfig({
  base: './',
  plugins: [
    react(),
    viteSingleFile(),
    {
      // Le titre de l'onglet vit dans index.html, hors du bundle : c'est le
      // seul endroit ou le nom du club ne peut pas etre importe.
      name: 'titre-du-club',
      transformIndexHtml: (html: string) => html.replace(/\{\{CLUB_COURT\}\}/g, profil.nomCourt),
    },
  ],
  // « @club » designe le dossier du club fabrique : son profil, son ecusson,
  // ses fiches. Aucun fichier de src/ ne nomme donc un club.
  resolve: {
    alias: { '@club': fileURLToPath(new URL(`./${DOSSIER_CLUB}`, import.meta.url)) },
  },
  // Version, date et revision sont FIGEES dans le fichier au moment ou il est
  // fabrique. C'est ce qui permet, des mois plus tard, de savoir quel
  // exemplaire un entraineur a entre les mains - le fichier voyage seul, sans
  // mise a jour ni serveur pour le renseigner.
  define: {
    __VERSION__: JSON.stringify(paquet.version ?? '0.0.0'),
    __DATE_BUILD__: JSON.stringify(new Date().toISOString().slice(0, 10)),
    __REVISION__: JSON.stringify(revision()),
  },
  build: {
    // Un dossier par club : `vite build` vide le sien sans toucher aux autres.
    outDir: `dist/${CLUB}`,
    target: 'es2020',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
