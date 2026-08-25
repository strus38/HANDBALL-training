import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

const paquet: { version?: string } = JSON.parse(readFileSync('./package.json', 'utf8'))

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
  plugins: [react(), viteSingleFile()],
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
    target: 'es2020',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
