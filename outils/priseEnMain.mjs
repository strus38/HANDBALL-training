/**
 * Fabrique la prise en main du club : de quoi mener sa premiere seance.
 *
 * C'EST LE SEUL DOCUMENT LIVRE AU COACH. Il y en avait trois — un manuel de
 * mille cinq cents lignes, une plaquette, et ce guide — et aucun n'etait relu.
 * C'est dans le manuel et la plaquette que les erreurs sont restees des mois :
 * une plaquette qui annoncait neuf exercices de moins qu'il n'y en a, des
 * captures montrant un bandeau d'alerte, des sections livrees sans image.
 *
 * Un document qu'on relit vaut mieux que trois qu'on ne relit pas. Tout ce que
 * l'entraineur doit savoir tient donc ici, et le reste — le pourquoi des choix —
 * vit dans les commentaires du code, qui sont la reference du projet.
 *
 * Deux sorties :
 * - la notice du club, autonome, a poser a cote de l'application ;
 * - docs/*.png, les memes captures en fichiers, pour le README de GitHub, qui
 *   ne sait pas afficher une image en base64.
 *
 * Lancement : npm run prise-en-main (ou npm run build, qui l'enchaine).
 */

import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { capturer } from './captures.mjs'
import { jetonsDeStyle, logo } from './marque.mjs'
import { ouvrirNavigateur } from './navigateur.mjs'
import { CHEMIN_LIVRABLE, CHEMIN_NOTICE, DOSSIER_SORTIE, NOM_LIVRABLE } from './livrable.mjs'
import { CLUB, CLUB_PAR_DEFAUT, PROFIL } from './club.mjs'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Captures reprises par le README de GitHub.
 *
 * Choisies parmi celles du guide, et pas d'autres : deux jeux de captures a
 * tenir a jour, c'est deux occasions de diverger. Le README montre ce que
 * l'entraineur verra, ni plus ni moins.
 */
const POUR_LE_README = ['fiche', 'bibliotheque', 'seance']

/**
 * Combien de fiches sont livrees ? On le demande au CATALOGUE, jamais a sa
 * memoire.
 *
 * La plaquette d'avant comptait les titres dans trois fichiers de bibliotheque
 * nommes a la main. Elle annoncait 53 exercices quand l'application en
 * affichait 62 — deux bibliotheques ajoutees depuis n'y figuraient pas. Le
 * chiffre est reste faux des mois, sur le document meme cense donner envie.
 *
 * Ni fichier d'entree ni fichier de sortie : tout passe par la memoire. Ecrire
 * le paquet sur le disque puis l'importer marchait presque toujours, et
 * echouait par intermittence quand Node lisait ce qu'esbuild finissait
 * d'ecrire — un module incomplet n'a pas d'export, et le destructurer rendait
 * « undefined » sans rien dire.
 */
async function nombreDeFiches() {
  const { build: empaqueter } = await import('esbuild')
  const resultat = await empaqueter({
    stdin: {
      contents: "export { CATALOGUE } from './src/bibliotheque/catalogue'",
      resolveDir: racine,
      loader: 'ts',
    },
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    write: false,
  })
  const code = resultat.outputFiles[0].text
  const module = await import(
    `data:text/javascript;base64,${Buffer.from(code, 'utf8').toString('base64')}`
  )
  if (!Array.isArray(module.CATALOGUE)) {
    throw new Error('CATALOGUE illisible : le guide ne peut pas annoncer un nombre de fiches.')
  }
  return module.CATALOGUE.length
}

const NOMBRE_DE_FICHES = await nombreDeFiches()

const CAPTURES = ['bibliotheque', 'seance', 'fiche', 'mode-terrain', 'bilan']

const captures = await capturer(CAPTURES)
const image = new Map(
  captures.map(({ nom, chemin }) => [nom, readFileSync(chemin).toString('base64')]),
)

/**
 * Le premier lancement, capture a part.
 *
 * Les captures du depot montrent l'application d'un entraineur installe :
 * trois seances, une equipe deja renseignee. C'est juste pour la presentation,
 * qui donne envie — et faux pour un guide de prise en main, qui doit montrer
 * ce que le lecteur a SOUS LES YEUX pendant qu'il lit. Une capture ou l'equipe
 * est deja saisie, sous un texte qui dit « cliquez sur Mon equipe », envoie
 * chercher un bouton qui n'est pas la.
 *
 * Aucun amorcage ici, et c'est tout l'interet : ouvrirNavigateur() cree un
 * profil neuf, donc un stockage vide.
 */
async function premierLancement() {
  const navigateur = await ouvrirNavigateur()
  if (!navigateur) throw new Error('Chrome introuvable : impossible de capturer le premier lancement.')
  try {
    await navigateur.envoyer('Emulation.setDeviceMetricsOverride', {
      width: 1400,
      // Plus courte que les autres captures : une application vide ne remplit
      // pas un ecran, et montrer 300 pixels de gris sous le seul bouton a
      // cliquer noierait justement ce qu'on veut faire voir.
      height: 430,
      deviceScaleFactor: 1,
      mobile: false,
    })
    await navigateur.aller(pathToFileURL(join(racine, CHEMIN_LIVRABLE)).href)
    await navigateur.evaluer('return new Promise((r) => setTimeout(r, 1400));')
    const etat = await navigateur.evaluer(`
      const bouton = document.querySelector('.bouton-equipe');
      return {
        equipe: bouton ? bouton.textContent.trim() : null,
        seances: document.querySelectorAll('.carte-seance').length,
        boutons: [...document.querySelectorAll('.actions-vide button')].map((b) => b.textContent.trim()),
      };
    `)
    // On refuse de livrer une capture qui ne montre pas ce que le texte decrit.
    if (etat.equipe !== 'Mon équipe' || etat.seances !== 0) {
      throw new Error(`Etat inattendu au premier lancement : ${JSON.stringify(etat)}`)
    }
    console.log(`  premier lancement : « ${etat.equipe} », ${etat.boutons.join(' / ')}`)
    const cliche = await navigateur.envoyer('Page.captureScreenshot', { format: 'png' })
    return cliche.data
  } finally {
    await navigateur.fermer()
  }
}

image.set('premier-lancement', await premierLancement())

/**
 * Les etapes, dans l'ordre ou un entraineur les vit.
 *
 * `minutes` est un budget affiche : il dit a quelqu'un qui hesite combien de
 * temps il engage. Le total doit tenir sous dix minutes, sinon la promesse du
 * titre est fausse — et une promesse fausse en premiere page decredibilise
 * tout ce qui suit.
 */
const ETAPES = [
  {
    minutes: 1,
    titre: 'Ouvrir l’application',
    capture: 'premier-lancement',
    corps: `
      <p>Double-cliquez sur <code>${NOM_LIVRABLE}</code> — il s’ouvre dans votre
      navigateur, comme une page internet — sauf qu’il n’y a <strong>rien à installer,
      aucun compte à créer et aucune connexion nécessaire</strong>.</p>
      <p>Posez le fichier où vous voulez : bureau, clé USB, dossier partagé. Vous
      arrivez sur la liste de vos séances. Elle est vide la première fois.</p>
      <p class="note"><strong>En haut à droite</strong>, le bouton <b>Mon équipe</b>.
      Cliquez-le une fois, indiquez qui vous entraînez, et vous n’y reviendrez plus de
      la saison : chaque nouvelle séance sera pré-remplie.</p>
    `,
  },
  {
    minutes: 1,
    titre: 'Créer votre première séance',
    capture: null,
    corps: `
      <p>Au milieu de la page vide, bouton <b>Créer une séance</b>. Plus tard, quand
      vous en aurez, ce sera <b>+ Nouvelle séance</b> en haut à droite.</p>
      <p>La date proposée est celle de votre prochain créneau libre — l’application
      connaît le planning du club et ne vous repropose pas un soir déjà occupé.
      Corrigez-la si besoin, mettez un objectif en une phrase, et c’est tout.</p>
      <p class="note">Un titre s’écrit tout seul à partir de la date et de l’objectif.
      Vous pouvez le remplacer, il ne se réécrira plus.</p>
    `,
  },
  {
    minutes: 3,
    titre: 'Prendre des exercices déjà écrits',
    capture: 'bibliotheque',
    imageEnTete: true,
    corps: `
      <p>C’est ici que vous gagnez votre soirée : <strong>${NOMBRE_DE_FICHES} exercices sont déjà
      écrits</strong>, avec leurs objectifs, leur déroulement et leurs points clés.
      Depuis votre séance, cliquez sur <b>Bibliothèque</b>.</p>

      <h3>Les deux onglets, en haut</h3>
      <p><b>Bibliothèque de base</b> contient les fiches livrées avec l’application —
      le nombre entre parenthèses vous dit combien il en reste.
      <b>Ma bibliothèque</b> est la vôtre : vide au début, elle se remplira des fiches
      que vous créerez ou que vous reprendrez.</p>

      <h3>Trouver une fiche : trois moyens</h3>
      <ul>
        <li><strong>Les pastilles de catégorie</strong> — <b>Tout</b>,
        <b>Joueurs de champ</b>, <b>Gardiens</b>, <b>Échauffement</b>, <b>Attaque</b>,
        <b>Défense</b>, <b>Montée de balle / transition</b>,
        <b>Technique individuelle</b>, <b>Préparation physique</b>,
        <b>Jeu / situation</b>. Une seule à la fois.</li>
        <li><strong>Quatre pastilles qui trient autrement</strong> —
        <b>▶ Avec animation</b> (le mouvement se déroule en plusieurs étapes),
        <b>Sans ballon</b>, <b>Combinaisons</b> (Espagnole, Pondus, double croisé…),
        <b>★ Favoris</b>. Elles se cumulent avec la catégorie.</li>
        <li><strong>La recherche</strong>, en haut à droite : tapez
        <i>croisé</i>, <i>pivot</i>, <i>relance</i>.</li>
      </ul>

      <h3>Lire une carte sans l’ouvrir</h3>
      <p>Chaque carte de la colonne de gauche donne le titre, puis la catégorie, la
      durée et l’effectif — <i>Attaque · 15 min · 12 joueurs</i>. En dessous, des
      étiquettes : la place des gardiens, <i>▶ 4 étapes</i> quand le mouvement s’anime,
      et trois points qui donnent la difficulté. Si vous l’avez déjà menée, la carte
      vous le rappelle avec la date.</p>

      <h3>Voir le détail, puis décider</h3>
      <p><strong>Cliquez sur une carte</strong> : tout s’affiche à droite — le schéma,
      l’objectif en une phrase, le <i>Déroulement</i>, les <i>Points clés</i>, les
      <i>Variantes</i> et le matériel nécessaire. Vous décidez en connaissance de cause,
      sans rien avoir ajouté.</p>
      <p>Quatre boutons en bas de ce détail :</p>
      <ul>
        <li><b>Ajouter à la séance</b> — <strong>c’est celui que vous cherchez.</strong>
        La fiche entre dans votre séance, et la bibliothèque reste ouverte pour la
        suivante.</li>
        <li><b>Reprendre dans ma bibliothèque</b> — pour en garder votre version,
        réutilisable d’une séance à l’autre.</li>
        <li><b>☆ Mettre en favori</b> — pour la retrouver vite, avec la pastille
        <b>★ Favoris</b>.</li>
        <li><b>Retirer de la base</b> — si elle ne vous servira jamais. Rien n’est
        effacé : vous pouvez la rétablir quand vous voulez.</li>
      </ul>

      <h3>Et on recommence</h3>
      <p>Trois ou quatre fois suffisent pour une séance complète : un échauffement, deux
      situations, un jeu pour finir. Puis fermez la bibliothèque avec la
      <b>✕</b> en haut à droite : vous retrouvez votre séance, garnie.</p>

      <p class="note">Ce que vous ajoutez est <strong>une copie qui vous appartient</strong>.
      Modifiez-la autant que vous voulez : la fiche d’origine reste intacte pour la
      prochaine fois.</p>
    `,
  },
  {
    minutes: 2,
    titre: 'Ajuster la séance',
    capture: 'seance',
    corps: `
      <p>Vos exercices s’empilent dans l’ordre. Les flèches <b>↑</b> et <b>↓</b> montent ou descendent
      une ligne, les durées se modifient au clavier, et <strong>le total se recalcule
      seul</strong>.</p>
      <p>Deux choses vous préviennent <em>avant</em> le gymnase plutôt que pendant :</p>
      <ul>
        <li>un exercice qui demande plus de joueurs que l’effectif annoncé ;</li>
        <li>un plan de 95 minutes posé sur un créneau de 75.</li>
      </ul>
      <p class="note">Le travail des gardiens mené <b>en parallèle</b> ne s’ajoute pas
      au temps total : cochez la case, le compte reste juste.</p>
    `,
  },
  {
    minutes: 1,
    titre: 'Regarder un exercice de plus près',
    capture: 'fiche',
    corps: `
      <p>Cliquez sur une ligne : le schéma à gauche, le détail à droite. La barre entre
      les deux se déplace.</p>
      <p>Vous pouvez tout laisser tel quel — les fiches livrées sont complètes. Si vous
      voulez dessiner : posez les joueurs, tirez une flèche, et la position suivante en
      découle. Le bouton <b>▶ Lire</b> rejoue l’enchaînement.</p>
      <p class="note">Le terrain est aux cotes officielles. Un schéma s’imprime à
      n’importe quelle taille sans se déformer.</p>
    `,
  },
  {
    minutes: 1,
    titre: 'Emporter la séance au gymnase',
    capture: 'mode-terrain',
    corps: `
      <p>Deux façons, au choix.</p>
      <p><b>Imprimer la séance</b> sort une feuille par exercice : le schéma, les
      consignes, les points clés. Vous partez avec du papier, qui ne tombe jamais en
      panne de batterie.</p>
      <p><b>▶ Mode terrain</b> affiche la séance en grand, un exercice à la fois, avec
      le temps qui reste. Lisible à bout de bras, sur un téléphone posé sur le banc.</p>
    `,
  },
  {
    minutes: 1,
    titre: 'Après l’entraînement',
    capture: 'bilan',
    corps: `
      <p>Une note de une à cinq étoiles sur les exercices qui ont marché, et surtout le
      <strong>retour de séance</strong> : l’ambiance, les absents, ce qui a capoté, ce
      qu’on reprend jeudi.</p>
      <p>Ce mot-là <strong>remonte tout seul en haut de la séance suivante</strong>.
      C’est ce qui distingue l’application d’un cahier : ce que vous notez vous revient
      au moment où il sert.</p>
      <p class="note">Sur la saison, le <b>Bilan de la saison</b> montre le temps passé par catégorie
      et les exercices les mieux notés. On ne redémarre pas de zéro en septembre.</p>
    `,
  },
]

/**
 * Le modele : ou vit un exercice, et ce qui le relie aux deux bibliotheques.
 *
 * C'est la question que les entraineurs posent le plus, et ce n'est pas une
 * question de mode d'emploi : les gestes sont simples, c'est le MODELE qui
 * manque. Tant qu'on ignore qu'une fiche ajoutee est une copie, on n'ose pas la
 * modifier ; tant qu'on ignore qu'elle rejoint sa bibliotheque toute seule, on
 * ne comprend pas d'ou sortent des exercices qu'on n'a pas crees.
 *
 * Le schema est pose juste apres l'etape de la bibliotheque, la ou la question
 * se pose, et hors de la numerotation : il ne coute pas de minutes, il en fait
 * gagner.
 */
const LIENS = String.raw`  <div class="liens">
    <h2>Les trois endroits où vit un exercice</h2>
    <p>C’est la question que les entraîneurs posent le plus. Une fois ce schéma en
    tête, le reste devient évident.</p>

    <svg viewBox="0 0 780 400" role="img" aria-labelledby="titre-liens">
      <title id="titre-liens">La bibliothèque de base alimente votre bibliothèque et vos séances ; une fiche ouverte dans une séance rejoint votre bibliothèque</title>
      <defs>
        <marker id="fleche" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#1b3a63"/>
        </marker>
        <marker id="fleche-auto" viewBox="0 0 10 10" refX="9" refY="5"
                markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8a5a00"/>
        </marker>
      </defs>

      <!-- Les trois boites -->
      <g>
        <rect x="20" y="150" width="200" height="104" rx="8" fill="#eef3f9" stroke="#c6d5e6" stroke-width="1.5"/>
        <text x="120" y="180" text-anchor="middle" font-size="15" font-weight="700" fill="#1b3a63">Bibliothèque de base</text>
        <text x="120" y="203" text-anchor="middle" font-size="13" fill="#4a5f78">${NOMBRE_DE_FICHES} fiches livrées</text>
        <text x="120" y="224" text-anchor="middle" font-size="12.5" fill="#4a5f78">Ne change jamais.</text>
        <text x="120" y="241" text-anchor="middle" font-size="12.5" fill="#4a5f78">Rien ne s’y efface.</text>
      </g>

      <g>
        <rect x="290" y="150" width="200" height="104" rx="8" fill="#fff" stroke="#1b3a63" stroke-width="2"/>
        <text x="390" y="180" text-anchor="middle" font-size="15" font-weight="700" fill="#1b3a63">Ma bibliothèque</text>
        <text x="390" y="203" text-anchor="middle" font-size="13" fill="#4a5f78">Vos fiches à vous</text>
        <text x="390" y="224" text-anchor="middle" font-size="12.5" fill="#4a5f78">Réutilisables d’une</text>
        <text x="390" y="241" text-anchor="middle" font-size="12.5" fill="#4a5f78">séance à l’autre.</text>
      </g>

      <g>
        <rect x="560" y="150" width="200" height="104" rx="8" fill="#fff6de" stroke="#eddaa8" stroke-width="2"/>
        <text x="660" y="180" text-anchor="middle" font-size="15" font-weight="700" fill="#1b3a63">Vos séances</text>
        <text x="660" y="203" text-anchor="middle" font-size="13" fill="#4a5f78">Le mardi 15, le vendredi 18…</text>
        <text x="660" y="224" text-anchor="middle" font-size="12.5" fill="#4a5f78">Chaque exercice y est</text>
        <text x="660" y="241" text-anchor="middle" font-size="12.5" fill="#4a5f78">une copie indépendante.</text>
      </g>

      <!-- Base -> Ma bibliotheque -->
      <line x1="222" y1="202" x2="286" y2="202" stroke="#1b3a63" stroke-width="2" marker-end="url(#fleche)"/>
      <text x="254" y="192" text-anchor="middle" font-size="11.5" fill="#1b3a63">copie</text>

      <!-- Ma bibliotheque -> Seance -->
      <line x1="492" y1="202" x2="556" y2="202" stroke="#1b3a63" stroke-width="2" marker-end="url(#fleche)"/>
      <text x="524" y="192" text-anchor="middle" font-size="11.5" fill="#1b3a63">copie</text>

      <!-- Base -> Seance, en passant par-dessus -->
      <path d="M 120 148 C 120 60, 660 60, 660 146" fill="none" stroke="#1b3a63" stroke-width="2" marker-end="url(#fleche)"/>
      <text x="390" y="42" text-anchor="middle" font-size="13" font-weight="600" fill="#1b3a63">« Ajouter à la séance » — sans passer par la vôtre</text>
      <text x="390" y="61" text-anchor="middle" font-size="12" fill="#4a5f78">c’est le geste courant</text>

      <!-- Seance -> Ma bibliotheque : l'automatisme -->
      <path d="M 660 258 C 660 350, 390 350, 390 258" fill="none" stroke="#8a5a00" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#fleche-auto)"/>
      <text x="525" y="378" text-anchor="middle" font-size="12.5" font-weight="600" fill="#8a5a00">tout seul, la première fois que vous fermez la fiche</text>
    </svg>

    <h3>Trois règles, et vous avez tout compris</h3>
    <ol>
      <li><strong>Ce qui sort d’une bibliothèque est toujours une copie.</strong>
      Vous raccourcissez un exercice pour le mardi, vous changez son schéma : la fiche
      d’origine ne bouge pas d’un millimètre. Rien de ce que vous faites dans une
      séance ne peut abîmer une bibliothèque.</li>

      <li><strong>La bibliothèque de base ne change jamais.</strong> Vous ne pouvez ni
      la modifier ni en effacer une fiche — seulement <b>Retirer de la base</b> celles
      qui ne vous serviront pas, ce qui les masque sans les détruire. Le bouton
      <b>Remettre dans la base</b> les fait revenir.</li>

      <li><strong>Ma bibliothèque se remplit toute seule, mais ne se met à jour que si
      vous le demandez.</strong> C’est le point qui surprend, et il vaut la peine d’être
      lu deux fois — voir juste en dessous.</li>
    </ol>

    <div class="surprise">
      <h3>Le point qui surprend tout le monde</h3>
      <p><strong>Une fiche rejoint « Ma bibliothèque » toute seule</strong> la première
      fois que vous l’ouvrez dans une séance puis que vous en ressortez. Vous ne l’avez
      pas demandé : c’est voulu, pour que le travail d’un soir ne se perde pas.</p>
      <p><strong>Mais ensuite, elle n’y bouge plus.</strong> Si vous retouchez l’exercice
      dans votre séance — la durée, les consignes, le schéma — votre bibliothèque garde
      la version d’avant. C’est délibéré : adapter un exercice à un groupe un soir donné
      ne doit pas réécrire votre référence.</p>
      <p>Pour que votre bibliothèque prenne la nouvelle version, un seul geste :
      le bouton <b>Vers la bibliothèque</b>, dans la fiche.</p>
    </div>

    <h3>En cas de doute</h3>
    <ul>
      <li><em>« D’où vient cet exercice que je n’ai jamais créé ? »</em> — d’une fiche de
      base que vous avez ouverte une fois. Elle est à vous, vous pouvez la modifier ou la
      retirer de votre bibliothèque sans rien casser.</li>
      <li><em>« J’ai modifié mon exercice, ma bibliothèque n’a pas suivi. »</em> — normal.
      Bouton <b>Vers la bibliothèque</b>.</li>
      <li><em>« J’ai retiré une fiche de base par erreur. »</em> — rien n’est perdu. Dans
      la bibliothèque de base, la pastille des fiches retirées les affiche, et
      <b>Remettre dans la base</b> les rétablit.</li>
      <li><em>« Si je reçois une nouvelle version de l’application, je perds tout ? »</em>
      — non. Vos séances, votre bibliothèque et vos réglages restent en place.</li>
    </ul>
  </div>
`

const TOTAL = ETAPES.reduce((t, e) => t + e.minutes, 0)

const sections = ETAPES.map(({ minutes, titre, capture, corps, imageEnTete }, i) => {
  // L'image passe DEVANT le texte quand l'etape est longue : on ne decrit pas
  // dix elements d'un ecran a quelqu'un qui ne l'a pas encore vu. Ailleurs elle
  // reste apres, en illustration de ce qui vient d'etre dit.
  const img = capture
    ? `<img src="data:image/png;base64,${image.get(capture)}" alt="${titre}" loading="lazy">`
    : ''
  return `
  <section class="etape">
    <div class="tete-etape">
      <span class="numero">${i + 1}</span>
      <h2>${titre}</h2>
      <span class="duree">${minutes} min</span>
    </div>
    ${imageEnTete ? img : ''}
    <div class="corps">${corps}</div>
    ${imageEnTete ? '' : img}
  </section>`
})
  .reduce((sortie, section, i) => sortie + section + (i === 2 ? LIENS : ''), '')

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${PROFIL.nomCourt} — Prise en main en ${TOTAL} minutes</title>
<style>
${jetonsDeStyle()}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  padding: 0 20px 70px;
  background: var(--fond);
  color: var(--texte);
  font: 16px/1.65 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
  -webkit-text-size-adjust: 100%;
}

.page { max-width: 940px; margin: 0 auto; }

.tete {
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0 -20px 30px;
  padding: 26px 28px;
  background: var(--structure-900);
}
.tete svg { width: 62px; height: 62px; flex-shrink: 0; }
.tete h1 { margin: 0; color: #fff; font-size: 24px; line-height: 1.2; }
.tete p { margin: 5px 0 0; color: #9fb6d4; font-size: 14px; }

/* Les trois choses a retenir, avant meme la premiere etape : un entraineur
   qui n'irait pas plus loin doit deja pouvoir se debrouiller. */
.essentiel {
  background: var(--structure-050);
  border: 1px solid var(--structure-100);
  border-left: 5px solid var(--accent);
  border-radius: var(--rayon);
  padding: 18px 22px;
  margin-bottom: 34px;
}
.essentiel h2 { margin: 0 0 10px; font-size: 17px; color: var(--structure-900); }
.essentiel ol { margin: 0; padding-left: 22px; }
.essentiel li { margin-bottom: 6px; }

.etape { margin-bottom: 40px; }

.tete-etape {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--accent);
}

.numero {
  flex: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--structure-900);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tete-etape h2 { margin: 0; font-size: 20px; color: var(--structure-900); flex: 1; }

.duree {
  flex: none;
  font-size: 13px;
  color: var(--texte-doux);
  white-space: nowrap;
}

.corps h3 {
  margin: 20px 0 8px;
  font-size: 15.5px;
  color: var(--structure-900);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.corps h3:first-child { margin-top: 0; }

.corps p { margin: 0 0 12px; }
.corps ul { margin: 0 0 12px; padding-left: 22px; }
.corps li { margin-bottom: 5px; }

.corps b, .corps code {
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 600;
  font-size: 0.94em;
  white-space: nowrap;
}
.corps code { font-family: Consolas, 'SF Mono', monospace; }

.note {
  background: var(--surface);
  border-left: 3px solid var(--structure-100);
  border-radius: 0 var(--rayon) var(--rayon) 0;
  padding: 10px 14px;
  color: var(--texte-doux);
  font-size: 15px;
}

.etape img {
  display: block;
  width: 100%;
  height: auto;
  margin: 14px 0;
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  box-shadow: var(--ombre);
}

/* Le bloc du modele : encadre comme un aparte, pas comme une etape. */
.liens {
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-top: 4px solid var(--structure-900);
  border-radius: var(--rayon);
  padding: 22px 26px;
  margin: 6px 0 40px;
}
.liens h2 { margin: 0 0 8px; font-size: 20px; color: var(--structure-900); }
.liens h3 {
  margin: 22px 0 8px;
  font-size: 15.5px;
  color: var(--structure-900);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.liens svg {
  display: block;
  width: 100%;
  height: auto;
  margin: 18px 0 4px;
}
.liens ol, .liens ul { margin: 0; padding-left: 22px; }
.liens li { margin-bottom: 9px; }
.liens b {
  background: #fff;
  border: 1px solid var(--bordure);
  border-radius: 4px;
  padding: 1px 6px;
  font-weight: 600;
  font-size: 0.94em;
  white-space: nowrap;
}

/* Le point qui surprend : mis en evidence, parce que c'est lui qu'on vient
   chercher quand on relit ce guide trois semaines plus tard. */
.surprise {
  background: #fff6de;
  border: 1px solid #eddaa8;
  border-radius: var(--rayon);
  padding: 16px 20px;
  margin: 18px 0;
}
.surprise h3 { margin: 0 0 8px; color: #8a5a00; }
.surprise p { margin: 0 0 10px; color: #6b4a10; }
.surprise p:last-child { margin-bottom: 0; }

.filet {
  background: #fff6de;
  border: 1px solid #eddaa8;
  border-radius: var(--rayon);
  padding: 20px 24px;
  margin-top: 44px;
}
.filet h2 { margin: 0 0 8px; font-size: 19px; color: #8a5a00; }
.filet p { margin: 0 0 10px; color: #6b4a10; }
.filet p:last-child { margin-bottom: 0; }

.suite {
  margin-top: 26px;
  background: var(--surface);
  border: 1px solid var(--bordure);
  border-radius: var(--rayon);
  padding: 20px 24px;
}
.suite h2 { margin: 0 0 8px; font-size: 19px; color: var(--structure-900); }
.suite ul { margin: 0; padding-left: 22px; }
.suite li { margin-bottom: 6px; color: var(--texte-doux); }
.suite li strong { color: var(--texte); }

.pied {
  margin-top: 40px;
  text-align: center;
  font-size: 13px;
  color: var(--texte-doux);
}

@media (max-width: 620px) {
  .tete { flex-direction: column; text-align: center; gap: 12px; }
  .tete-etape { flex-wrap: wrap; }
  .duree { width: 100%; padding-left: 42px; }
}
</style>
</head>
<body>
<div class="page">

  <div class="tete">
    ${logo('logo-prise-en-main')}
    <div>
      <h1>Prise en main en ${TOTAL} minutes</h1>
      <p>${PROFIL.nomCourt} · Préparation de séances — ${PROFIL.nom}</p>
    </div>
  </div>

  <div class="essentiel">
    <h2>Si vous ne retenez que trois choses</h2>
    <ol>
      <li>Vous n’avez <strong>rien à installer et rien à créer de zéro</strong> : ${NOMBRE_DE_FICHES} exercices sont déjà écrits, prenez-les.</li>
      <li>Votre travail s’enregistre tout seul, mais <strong>il ne vit que sur cet ordinateur</strong>. Le bouton <b>Sauvegarder tout</b> est votre seule copie transportable.</li>
      <li>Le mot que vous écrivez après la séance <strong>vous revient à la séance suivante</strong>. C’est là que l’application devient utile.</li>
    </ol>
  </div>

${sections}

  <div class="filet">
    <h2>Une minute qui vous évitera de tout perdre</h2>
    <p>Vos séances sont enregistrées <strong>dans le navigateur de cet ordinateur</strong>.
    Un nettoyage des données de navigation, un changement de machine, et tout disparaît.</p>
    <p>Cliquez sur <b>Sauvegarder tout</b>, sur la page d’accueil. Une fenêtre
    « Enregistrer sous » s’ouvre : posez le fichier <strong>à côté de l’application</strong>,
    sur votre clé. Les fois suivantes, la fenêtre s’ouvrira déjà au bon endroit.</p>
    <p>Si vous oubliez, un bandeau jaune vous le rappellera — mais seulement quand
    vous avez réellement quelque chose à perdre.</p>
  </div>

  <div class="suite">
    <h2>Quand vous voudrez aller plus loin</h2>
    <ul>
      <li><strong>Dicter au lieu de taper</strong> : dictez dans les notes de votre téléphone, puis <b>Coller un texte dicté</b>. Les intitulés se rangent tout seuls dans les bons champs.</li>
      <li><strong>Dupliquer une séance qui a marché</strong> pour un autre jour, sans toucher à l’originale.</li>
      <li><strong>Échanger avec un collègue</strong> : une séance s’envoie en un fichier, il l’ouvre avec <b>Importer</b>.</li>
      <li><strong>Retirer les fiches qui ne vous servent pas</strong> de la bibliothèque de base. Elles se rétablissent quand vous voulez.</li>
    </ul>
    <p style="margin:12px 0 0;color:var(--texte-doux)">Gardez ce document à côté de
    l’application : c’est le seul, et il est à jour de la version que vous avez entre
    les mains. Chaque bouton porte aussi son explication : laissez le pointeur dessus
    une seconde.</p>
  </div>

  <p class="pied">Captures prises dans l’application elle-même. Fichier autonome, aucune connexion requise.</p>

</div>
</body>
</html>
`

mkdirSync(join(racine, DOSSIER_SORTIE), { recursive: true })
writeFileSync(join(racine, CHEMIN_NOTICE), html)
console.log(`Prise en main ecrite : ${CHEMIN_NOTICE} (${Math.round(html.length / 1024)} ko, ${TOTAL} min)`)

/*
 * Les memes captures, en fichiers, pour le README — mais du SEUL club par
 * defaut.
 *
 * Le README presente le depot, pas un exemplaire : ses images doivent montrer
 * toujours le meme. Sans cette reserve, fabriquer les clubs l'un apres l'autre
 * laissait le README aux couleurs du DERNIER fabrique, au hasard de l'ordre du
 * dossier — et la modification passait inapercue dans un `git status` ou les
 * trois images changent a chaque fabrication de toute facon.
 */
if (CLUB === CLUB_PAR_DEFAUT) {
  mkdirSync(join(racine, 'docs'), { recursive: true })
  for (const nom of POUR_LE_README) {
    const source = captures.find((c) => c.nom === nom)
    if (!source) throw new Error(`Capture « ${nom} » absente : le README la reclame.`)
    copyFileSync(source.chemin, join(racine, 'docs', `${nom}.png`))
  }
  console.log(`Captures du README : docs/${POUR_LE_README.join('.png, docs/')}.png`)
}
