/**
 * Fabrique dist/LISEZMOI.html : la notice, lisible dans un navigateur et
 * partageable par courriel.
 *
 * Comme l'application, c'est un fichier UNIQUE et autonome : styles et logo
 * sont dedans, il n'appelle rien depuis internet. On l'attache a un message et
 * le destinataire double-clique dessus, sans rien installer.
 *
 * Ce que le fichier reprend de l'application :
 * - les COULEURS et les rayons, extraits tels quels du bloc :root de
 *   src/ui/styles.css. C'est la source unique : changer le jaune du club dans
 *   la feuille de styles change aussi la notice, sans rien recopier ici.
 * - le LOGO, extrait de src/ui/LogoHbpsm.tsx.
 *
 * La notice s'adresse aux ENTRAINEURS : les sections de LISEZMOI.md marquees
 * <!-- notice:developpeur --> en sont retirees (voir pourLesCoachs). Le fichier
 * Markdown, lui, garde tout : c'est la reference du projet.
 *
 * Ce qu'il ne reprend pas : le reste de styles.css, qui habille une interface
 * (grilles, terrain, boutons, barres d'outils) et n'a rien a dire sur un
 * document. La mise en page du texte est donc ecrite ici, dans le meme langage
 * visuel : bleu profond pour la structure, jaune en accent.
 *
 * Deux destinations, une seule fabrication :
 * - src/notice/notice.genere.html, embarque dans l'application par un import
 *   ?raw, pour le bouton « Notice » qui ouvre le document dans une fenetre. Il
 *   doit donc exister AVANT le bundle, d'ou l'appel en tete de npm run build.
 * - dist/LISEZMOI.html, le fichier a joindre a un courriel, ecrit seulement
 *   avec l'option --dist. Vite vide dist/ au build : cette copie ne peut etre
 *   posee qu'apres, d'ou le second appel en fin de npm run build.
 *
 * Lancement : npm run notice (ou npm run build, qui enchaine les deux temps).
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pourLesCoachs, versHtml } from './marquage.mjs'
import { jetonsDeStyle, logo } from './marque.mjs'
import { capturer } from './captures.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const lire = (chemin) => readFileSync(join(racine, chemin), 'utf8')

/**
 * Captures inserees dans le fichier a joindre, et leur legende.
 *
 * Elles ne vont QUE dans dist/LISEZMOI.html. La notice embarquee dans
 * l'application s'en passe : celui qui la lit a l'application sous les yeux,
 * et l'illustrer doublerait le poids du fichier unique pour lui montrer ce
 * qu'il est en train de regarder.
 */
const LEGENDES = {
  accueil: 'La page d ouverture : toutes les séances, avec leur répartition du temps.',
  terrain: 'Le terrain en pleine largeur, à une étape du mouvement.',
  bibliotheque: 'La bibliothèque, filtrée sur les exercices d attaque.',
  bilan: 'Le bilan, ici sur tout l historique.',
  'mode-terrain': 'Le mode terrain : un exercice à la fois, avec le temps restant.',
  collage: 'Un texte dicté sur le téléphone, collé et réparti dans les champs.',
}

/** Remplit les emplacements de capture, ou les retire s'il n'y en a pas. */
function poserLesCaptures(corps, images) {
  return corps.replace(
    /<figure class="capture" data-capture="([a-z-]+)"><\/figure>/g,
    (tout, nom) => {
      const donnees = images?.get(nom)
      if (!donnees) return ''
      const legende = LEGENDES[nom] ?? ''
      return `<figure class="capture">
  <img src="data:image/png;base64,${donnees}" alt="${legende}">
  ${legende ? `<figcaption>${legende}</figcaption>` : ''}
</figure>`
    },
  )
}

const MISE_EN_PAGE = `
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0 20px 72px;
  background: var(--fond);
  color: var(--texte);
  font: 15px/1.65 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
}

.notice {
  max-width: 820px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  box-shadow: var(--ombre);
  padding: 8px 40px 44px;
}

/* Bandeau de tete, aux couleurs du club. */
.tete {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 -40px 30px;
  padding: 20px 40px;
  background: var(--bleu-900);
  border-radius: var(--rayon) var(--rayon) 0 0;
}

.tete svg { width: 54px; height: 54px; flex-shrink: 0; }
.tete p { margin: 0; color: #fff; font-size: 18px; font-weight: 650; }
.tete small { display: block; color: #9fb6d4; font-size: 12.5px; font-weight: 400; }

h1 {
  font-size: 25px;
  line-height: 1.25;
  color: var(--bleu-900);
  margin: 0 0 18px;
}

h2 {
  font-size: 19px;
  color: var(--bleu-900);
  margin: 38px 0 12px;
  padding-bottom: 7px;
  border-bottom: 2px solid var(--jaune);
}

h3 {
  font-size: 15.5px;
  color: var(--bleu-700);
  margin: 26px 0 8px;
}

p { margin: 0 0 13px; }
strong { color: var(--bleu-900); font-weight: 650; }
a { color: var(--bleu-500); }

code {
  font-family: 'Cascadia Mono', Consolas, 'Courier New', monospace;
  font-size: 0.88em;
  background: var(--bleu-050);
  border: 1px solid var(--bleu-100);
  border-radius: var(--rayon-petit);
  padding: 1px 5px;
  color: var(--bleu-800);
}

pre {
  background: var(--bleu-900);
  border-radius: var(--rayon);
  padding: 15px 18px;
  overflow-x: auto;
  margin: 0 0 16px;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  color: #dce8f6;
  font-size: 13px;
  line-height: 1.6;
}

ul, ol { margin: 0 0 14px; padding-left: 22px; }
li { margin-bottom: 6px; }

/* Cases a cocher de l'etat d'avancement : le carre est dessine, pas saisi. */
ul.taches { list-style: none; padding-left: 0; }

li.tache { display: flex; gap: 10px; align-items: baseline; }

li.tache .case {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  border: 1.5px solid var(--bordure-forte);
  border-radius: 4px;
  font-size: 12px;
  line-height: 15px;
  text-align: center;
  color: transparent;
}

li.tache.faite .case {
  background: var(--jaune);
  border-color: var(--jaune-fonce);
  color: var(--bleu-900);
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 0 0 18px;
  font-size: 14px;
}

th, td {
  border: 1px solid var(--bordure);
  padding: 8px 11px;
  text-align: left;
  vertical-align: top;
}

th { background: var(--bleu-050); color: var(--bleu-900); font-weight: 650; }
tbody tr:nth-child(even) { background: var(--surface-2); }

hr { border: none; border-top: 1px solid var(--bordure); margin: 28px 0; }

figure.capture { margin: 4px 0 22px; }

figure.capture img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  box-shadow: var(--ombre);
}

figure.capture figcaption {
  margin-top: 7px;
  font-size: 12.5px;
  color: var(--texte-doux);
}

.pied {
  max-width: 820px;
  margin: 16px auto 0;
  color: var(--texte-faible);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 640px) {
  body { padding: 0 0 40px; }
  .notice { border: none; border-radius: 0; padding: 8px 18px 32px; }
  .tete { margin: 0 -18px 24px; padding: 16px 18px; border-radius: 0; }
}

/* Imprime, le document sert de notice papier : pas d'ombres ni de cadres. */
@media print {
  @page { size: A4; margin: 14mm; }
  body { background: #fff; padding: 0; }
  .notice { border: none; box-shadow: none; max-width: none; padding: 0; }
  .tete { margin: 0 0 20px; border-radius: 0; }
  h2, h3 { break-after: avoid; }
  pre, table, li { break-inside: avoid; }
  .pied { display: none; }
}
`

function construire(images) {
  // La notice est lue par des entraineurs : les sections de developpement de
  // LISEZMOI.md sont retirees ici, le fichier Markdown, lui, reste complet.
  const corps = poserLesCaptures(versHtml(pourLesCoachs(lire('LISEZMOI.md'))), images)

  // Le premier titre de niveau 1 donne aussi le titre de l'onglet et du fichier
  // enregistre ; il reste dans le document, ou il est a sa place.
  const premierTitre = corps.match(/<h1>([\s\S]*?)<\/h1>/)
  const titre = premierTitre ? premierTitre[1].replace(/<[^>]+>/g, '') : 'HBPSM'

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titre}</title>
<style>
${jetonsDeStyle()}
${MISE_EN_PAGE}</style>
</head>
<body>
<article class="notice">
  <header class="tete">
    ${logo('logo-notice')}
    <p>HBPSM<small>Handball Pays de Saint-Marcellin</small></p>
  </header>
${corps}
</article>
<p class="pied">HBPSM · notice d'utilisation — fichier autonome, aucune connexion requise.</p>
</body>
</html>
`
}

const versDist = process.argv.includes('--dist')

// La notice embarquee dans l'application n'a pas de captures : le lecteur a
// l'application sous les yeux. Le fichier a joindre, lui, en a besoin.
const html = construire()
mkdirSync(join(racine, 'src', 'notice'), { recursive: true })
writeFileSync(join(racine, 'src', 'notice', 'notice.genere.html'), html)
console.log('Notice ecrite : src/notice/notice.genere.html')

if (versDist) {
  const captures = await capturer(['accueil', 'terrain', 'bibliotheque', 'bilan', 'mode-terrain', 'collage'])
  const images = new Map(
    captures.map(({ nom, chemin }) => [nom, readFileSync(chemin).toString('base64')]),
  )
  const illustree = construire(images)
  mkdirSync(join(racine, 'dist'), { recursive: true })
  writeFileSync(join(racine, 'dist', 'LISEZMOI.html'), illustree)
  console.log(
    `Notice ecrite : dist/LISEZMOI.html (${Math.round(illustree.length / 1024)} ko, ${images.size} captures)`,
  )
}
