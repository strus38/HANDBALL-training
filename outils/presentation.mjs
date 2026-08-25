/**
 * Fabrique dist/PRESENTATION.html : ce que fait le logiciel, en images.
 *
 * A qui ca sert : montrer l'application a un entraineur qui ne l'a jamais
 * ouverte, sans avoir a etre a cote de lui. Une page qu'on envoie, qui se lit
 * sur un telephone, et qu'on peut aussi projeter a une reunion de club.
 *
 * Les captures ne sont pas des maquettes : outils/captures.mjs conduit le vrai
 * livrable, avec de vraies fiches de la bibliotheque. Une page de presentation
 * qui montre autre chose que le logiciel serait un mensonge, et se verrait a la
 * premiere ouverture.
 *
 * Comme la notice, c'est un fichier UNIQUE : images, styles et ecusson dedans,
 * aucun appel a internet. Il pese environ un mega-octet, ce qui passe en piece
 * jointe.
 *
 * Lancement : npm run presentation
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { capturer } from './captures.mjs'
import { jetonsDeStyle, logo } from './marque.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Nombre de fiches livrees, compte a la source plutot qu'ecrit en dur. */
function nombreDeFiches() {
  const compter = (fichier) =>
    (readFileSync(join(racine, 'src', 'bibliotheque', fichier), 'utf8').match(/^ {4}titre: /gm) ?? [])
      .length
  return (
    compter('seniorsMasculins.ts') + compter('gardiens.ts') + compter('sansBallon.ts')
  )
}

/**
 * Les sections de la page. L'ordre suit le trajet d'un entraineur : ce qu'il
 * voit en ouvrant, puis ce qu'il fait, puis ce qu'il en retire.
 */
const SECTIONS = [
  {
    capture: 'accueil',
    titre: 'Toutes vos séances, sur une page',
    texte:
      "Chaque carte donne la date, la durée, l'effectif prévu et la répartition du temps par catégorie. On voit d'un coup d'oeil une séance trop chargée en attaque, ou sans échauffement.",
  },
  {
    capture: 'seance',
    titre: 'Une séance, exercice par exercice',
    texte:
      "L'ordre se change en montant ou descendant une ligne. Le total de temps se recalcule tout seul, et le travail des gardiens mené en parallèle ne s'y ajoute pas.",
  },
  {
    capture: 'seance-suivante',
    titre: 'Ce qu’on a noté mardi remonte vendredi',
    texte:
      "Le retour écrit après l’entraînement s’affiche en haut de la séance suivante : l’ambiance, les absents, ce qu’on avait dit de reprendre. Le créneau vient du planning du club — jour, horaire, durée, espace disponible — et la liste du matériel à emporter s’additionne toute seule à partir des exercices.",
  },
  {
    capture: 'bibliotheque',
    titre: 'FICHES exercices déjà écrits',
    texte:
      "Échauffement, attaque, défense, montée de balle, gardiens, préparation physique. Chaque fiche porte ses objectifs, ses points clés et ses variantes. Vous en prenez une, vous l'ajustez : la copie est à vous, le modèle reste intact.",
  },
  {
    capture: 'fiche',
    titre: 'Le schéma à gauche, le détail à droite',
    texte:
      "La barre entre les deux se déplace, et chaque côté peut occuper tout l'écran. Si l'exercice demande plus de joueurs que l'effectif annoncé, un bandeau le signale avant la séance, pas pendant.",
  },
  {
    capture: 'terrain',
    titre: 'Le mouvement se découpe en étapes',
    texte:
      "Vous posez les joueurs, vous tracez une flèche : la position suivante en découle, le ballon suit son porteur. Le bouton Lire rejoue l'enchaînement. Le terrain est aux cotes officielles, le schéma s'imprime à n'importe quelle taille sans se déformer.",
  },
  {
    capture: 'schema',
    titre: 'Une colonne, une zone, un mot posé sur le terrain',
    texte:
      "L’organisation la plus fréquente du handball — la file d’attente — se dessine d’un jeton, et la flèche de rotation dit ce qui se passe après le tir. Les zones coloriées délimitent un secteur interdit ou un espace de jeu sans masquer les lignes officielles, et un texte se pose là où il se lit.",
  },
  {
    capture: 'bilan',
    titre: 'Ce qui a marché, et ce qui revient trop souvent',
    texte:
      'Après la séance, une note de une à cinq étoiles et un commentaire. Sur la saison, le bilan montre le temps passé par catégorie et les exercices les mieux notés. On ne redémarre pas de zéro en septembre.',
  },
]

const MISE_EN_PAGE = `
*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0 20px 80px;
  background: var(--fond);
  color: var(--texte);
  font: 16px/1.6 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
}

.page { max-width: 1000px; margin: 0 auto; }

.tete {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 -20px 34px;
  padding: 26px 28px;
  background: var(--bleu-900);
}

.tete svg { width: 66px; height: 66px; flex-shrink: 0; }
.tete h1 { margin: 0; color: #fff; font-size: 25px; line-height: 1.2; }
.tete p { margin: 4px 0 0; color: #9fb6d4; font-size: 14px; }

.resume {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
  margin-bottom: 40px;
}

.fait {
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-left: 4px solid var(--jaune);
  border-radius: var(--rayon);
  padding: 14px 16px;
}

.fait strong { display: block; color: var(--bleu-900); font-size: 15px; margin-bottom: 3px; }
.fait span { font-size: 14px; color: var(--texte-doux); }

section { margin-bottom: 44px; }

section h2 {
  font-size: 21px;
  color: var(--bleu-900);
  margin: 0 0 8px;
  padding-bottom: 7px;
  border-bottom: 2px solid var(--jaune);
}

section p { margin: 0 0 16px; color: var(--texte); }

/* La capture est le sujet : elle prend toute la largeur, sans fioriture. */
section img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  box-shadow: var(--ombre);
}

.limites {
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  padding: 20px 24px;
}

.limites h2 { border: none; margin-bottom: 6px; padding: 0; font-size: 19px; }
.limites ul { margin: 0; padding-left: 20px; }
.limites li { margin-bottom: 7px; color: var(--texte-doux); }
.limites li strong { color: var(--texte); }

.demarrer {
  margin-top: 28px;
  background: var(--bleu-050);
  border: 1px solid var(--bleu-100);
  border-radius: var(--rayon);
  padding: 20px 24px;
}

.demarrer h2 { border: none; margin-bottom: 8px; padding: 0; font-size: 19px; }
.demarrer ol { margin: 0; padding-left: 20px; }
.demarrer li { margin-bottom: 6px; }

code {
  font-family: 'Cascadia Mono', Consolas, 'Courier New', monospace;
  font-size: 0.9em;
  background: var(--bleu-050);
  border: 1px solid var(--bleu-100);
  border-radius: var(--rayon-petit);
  padding: 1px 5px;
  color: var(--bleu-800);
}

.pied {
  margin-top: 34px;
  color: var(--texte-faible);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 640px) {
  body { padding: 0 0 40px; }
  .page { padding: 0 14px; }
  .tete { margin: 0 0 26px; padding: 18px 14px; gap: 12px; }
  .tete svg { width: 48px; height: 48px; }
  .tete h1 { font-size: 20px; }
  section h2 { font-size: 18px; }
}

@media print {
  @page { size: A4; margin: 12mm; }
  body { background: #fff; padding: 0; }
  section { break-inside: avoid; }
  section img { box-shadow: none; }
}
`

async function construire() {
  const captures = await capturer()
  const enBase64 = new Map(
    captures.map(({ nom, chemin }) => [nom, readFileSync(chemin).toString('base64')]),
  )

  const fiches = nombreDeFiches()

  const sections = SECTIONS.map(
    ({ capture, titre, texte }) => `
  <section>
    <h2>${titre.replace('FICHES', String(fiches))}</h2>
    <p>${texte}</p>
    <img src="data:image/png;base64,${enBase64.get(capture)}" alt="${titre}">
  </section>`,
  ).join('\n')

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>HBPSM — Préparation de séances</title>
<style>
${jetonsDeStyle()}
${MISE_EN_PAGE}</style>
</head>
<body>
<header class="tete">
  ${logo('logo-presentation')}
  <div>
    <h1>Préparer ses séances de handball</h1>
    <p>Handball Pays de Saint-Marcellin — ce que fait le logiciel</p>
  </div>
</header>

<div class="page">
  <div class="resume">
    <div class="fait"><strong>Un seul fichier</strong><span>Rien à installer, aucun compte, aucun mot de passe.</span></div>
    <div class="fait"><strong>Hors ligne</strong><span>Fonctionne dans le gymnase, sans réseau.</span></div>
    <div class="fait"><strong>${fiches} exercices fournis</strong><span>Utilisables tels quels, ou à modifier.</span></div>
    <div class="fait"><strong>Impression A4</strong><span>La séance dans la main, au bord du terrain.</span></div>
  </div>

${sections}

  <div class="limites">
    <h2>Ce qu'il ne fait pas</h2>
    <ul>
      <li><strong>Pas de compte, donc pas de synchronisation.</strong> Votre travail reste sur votre machine. On échange des séances en s'envoyant un fichier.</li>
      <li><strong>Pas de vidéo, pas de statistiques de match.</strong> Il prépare l'entraînement, rien d'autre.</li>
      <li><strong>Le stockage du navigateur n'est pas transportable.</strong> Changer de machine demande d'exporter puis d'importer.</li>
    </ul>
  </div>

  <div class="demarrer">
    <h2>Pour l'essayer</h2>
    <ol>
      <li>Enregistrez le fichier <code>HBPSM-entrainements.html</code> où vous voulez : bureau, clé USB, dossier partagé.</li>
      <li>Double-cliquez dessus. Il s'ouvre dans votre navigateur.</li>
      <li>Ouvrez la bibliothèque, prenez trois exercices, imprimez. Vous avez une séance.</li>
    </ol>
    <p style="margin:12px 0 0">Le mode d'emploi complet est dans le fichier <code>LISEZMOI.html</code>, et le bouton <strong>Notice</strong> l'ouvre depuis l'application.</p>
  </div>

  <p class="pied">Captures prises dans l'application elle-même. Fichier autonome, aucune connexion requise.</p>
</div>
</body>
</html>
`
}

const html = await construire()
mkdirSync(join(racine, 'dist'), { recursive: true })
const sortie = join(racine, 'dist', 'PRESENTATION.html')
writeFileSync(sortie, html)
console.log(`Presentation ecrite : dist/PRESENTATION.html (${Math.round(html.length / 1024)} ko)`)
