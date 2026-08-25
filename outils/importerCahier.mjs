/**
 * Importe un cahier d'exercices PDF en fiches pour l'application.
 *
 * POURQUOI CET OUTIL EXISTE. Un entraineur possede des cahiers d'exercices
 * achetes, dont la trame est celle de la federation — donc celle de cette
 * application. Recopier vingt fiches a la main represente des heures de saisie
 * pour un texte qui existe deja, proprement structure, dans le PDF.
 *
 * CE QU'IL PRODUIT, ET CE QU'IL NE PRODUIT PAS. Il produit le TEXTE : titre,
 * objectif, mise en place, fonctionnement, regulation, points cles, duree,
 * effectif, materiel. Il ne produit PAS les schemas : dans le PDF ce sont des
 * images aplaties, dont on ne peut pas retrouver les jetons et les fleches.
 * Chaque fiche arrive donc avec un terrain vide, que l'entraineur redessine —
 * ce qui est de toute facon le seul moyen d'obtenir un schema animable,
 * symetrisable et adaptable a son effectif.
 *
 * DROITS. Ces cahiers sont des oeuvres commerciales. Le fichier produit est
 * destine au SEUL entraineur qui les a achetes : il n'entre pas dans le depot,
 * pas dans la bibliotheque livree, pas dans l'application distribuee. Le
 * dossier de sortie est ignore par git, et chaque fiche importee porte la
 * mention de sa source, qui la suit dans les exports et sur les feuilles
 * imprimees.
 *
 * Lancement :
 *   npm run importer -- "chemin/vers/Cahier.pdf"
 *   npm run importer -- "chemin/vers/Cahier.pdf" --sortie autre/dossier
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build as construire } from 'esbuild'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { accoler, recoller, reparerLigatures, SUITE_DE_LIGNE } from './texteCahier.mjs'

const BAC = '.build-tests'
const SORTIE_PAR_DEFAUT = 'import'

// ------------------------------------------------------------- Mise en page
//
// Le cahier est en A4 paysage : le schema occupe la moitie gauche, le texte
// deux colonnes a droite, et un bandeau de caracteristiques court en bas.
// Ces bornes sont en points PDF, mesurees sur le document.

/** Frontiere entre les deux colonnes de texte. */
const X_COLONNE_DROITE = 620
/** Debut de la colonne de texte : a gauche, c'est le schema. */
const X_TEXTE = 400
/** Deux fragments sur la meme ligne quand leurs ordonnees sont si proches. */
const TOLERANCE_LIGNE = 4
/** Ecart vertical retenu quand une ligne de sommaire n'a qu'une voisine. */
const ECART_LIGNE_PAR_DEFAUT = 40
/** Hauteur du bandeau sous ses intitules : au-dela commence le pied de page. */
const HAUTEUR_BANDEAU = 55

/** Intitules de rubrique reconnus, et le champ de la fiche qu'ils alimentent. */
const RUBRIQUES = {
  'MISE EN PLACE': 'misePlace',
  CONSIGNES: 'fonctionnement',
  'BUT DU JEU': 'fonctionnement',
  DÉROULEMENT: 'fonctionnement',
  RÉGULATIONS: 'regulation',
  RÉGULATION: 'regulation',
  VARIANTES: 'evolution',
  ÉVOLUTIONS: 'evolution',
  CONSEILS: 'pointsCles',
  'POINTS CLÉS': 'pointsCles',
}

/** Colonnes du bandeau du bas, dans l'ordre ou elles apparaissent. */
const COLONNES_BANDEAU = [
  'GARDIENS',
  'POSTES',
  'CATÉGORIES',
  'MATÉRIEL',
  'PARTICIPANTS',
  'TEMPS',
]

/**
 * Theme du cahier vers categorie de l'application.
 *
 * La correspondance se fait par mots-cles et non par egalite : les themes
 * changent d'un cahier a l'autre, les mots du handball non.
 */
const CATEGORIES = [
  [/gardien/, 'gardien'],
  [/echauffement/, 'echauffement'],
  [/montee de balle|contre-attaque|transition|relance/, 'transition'],
  [/physique|athletique/, 'physique'],
  [/match|jeu reduit|tournoi/, 'jeu'],
  [/defense|defensif|bloc|repli/, 'defense'],
  [/tir|passe|technique|1 contre 1|duel|lobe|savoir faire|individuel/, 'technique'],
  [/croise|decalage|jeu collectif|circulation|attaque|combinaison/, 'attaque'],
]

// --------------------------------------------------------------- Extraction

/** Fragments de texte d'une page, avec leur position, en ordre de lecture. */
async function fragmentsDe(page) {
  const vue = page.getViewport({ scale: 1 })
  const contenu = await page.getTextContent()
  return contenu.items
    .filter((i) => i.str.trim())
    .map((i) => ({
      x: i.transform[4],
      // L'origine PDF est en bas : on la retourne pour lire de haut en bas.
      y: vue.height - i.transform[5],
      hauteur: i.height,
      texte: reparerLigatures(i.str.replace(/\s+/g, ' ').trim()),
    }))
    .sort((a, b) => a.y - b.y || a.x - b.x)
}

/**
 * Regroupe les fragments en lignes.
 *
 * Un PDF ne connait pas les lignes : il pose des fragments a des coordonnees.
 * Deux fragments d'une meme ligne partagent leur ordonnee a un point pres —
 * mais deux COLONNES aussi, d'ou le regroupement par colonne en amont.
 */
function enLignes(fragments) {
  const lignes = []
  for (const f of fragments) {
    const derniere = lignes[lignes.length - 1]
    if (derniere && Math.abs(derniere.y - f.y) <= TOLERANCE_LIGNE) {
      derniere.texte += ' ' + f.texte
      continue
    }
    lignes.push({ y: f.y, x: f.x, texte: f.texte })
  }
  return lignes
}

/** Découpe une page de fiche en ses rubriques. */
function decouperFiche(fragments, yBandeau) {
  const titre = [...fragments]
    .filter((f) => f.y < 120)
    .sort((a, b) => b.hauteur - a.hauteur)[0]

  // Le bandeau court sous les deux colonnes de texte : sans cette borne, ses
  // intitules et ses valeurs venaient s'ajouter a la derniere rubrique de
  // chaque colonne — « ... (5) MATÉRIEL PARTICIPANTS 1 ballon ».
  const plafond = yBandeau ?? Infinity
  const texte = fragments.filter((f) => f.x >= X_TEXTE && f.y < plafond - TOLERANCE_LIGNE)
  const colonnes = [
    texte.filter((f) => f.x < X_COLONNE_DROITE),
    texte.filter((f) => f.x >= X_COLONNE_DROITE),
  ]

  const rubriques = {}
  let objectif = ''

  for (const colonne of colonnes) {
    const lignes = enLignes(colonne)
    let courante
    let tampon = []
    const vider = () => {
      if (!courante || tampon.length === 0) return
      const champ = RUBRIQUES[courante]
      const texteRecolle = recoller(tampon)
      rubriques[champ] = rubriques[champ] ? rubriques[champ] + '\n' + texteRecolle : texteRecolle
    }
    for (const ligne of lignes) {
      const intitule = Object.keys(RUBRIQUES).find((r) => ligne.texte.trim() === r)
      if (intitule) {
        vider()
        courante = intitule
        tampon = []
        continue
      }
      // Avant toute rubrique, dans la colonne de gauche : c'est l'objectif.
      if (!courante) {
        if (colonne === colonnes[0]) objectif += (objectif ? ' ' : '') + ligne.texte
        continue
      }
      tampon.push(ligne)
    }
    vider()
  }

  return { titre: titre?.texte ?? '', objectif: objectif.trim(), ...rubriques }
}

/**
 * Lit le bandeau de caracteristiques du bas de page.
 *
 * Les valeurs ne suivent PAS l'ordre des intitules dans le flux du PDF : c'est
 * leur ABSCISSE qui dit a quelle colonne chacune appartient. Lire le texte
 * lineairement donnait « Au moins 6 joueur(se)s 10 min1 ballon » en un bloc,
 * impossible a repartir sans deviner.
 */
function repererColonnes(fragments, intitules) {
  return intitules
    .map((nom) => ({ nom, fragment: fragments.find((f) => f.texte.trim() === nom) }))
    .filter((c) => c.fragment)
}

/** Colonne dont l'intitule est le plus proche en abscisse, si elle est assez proche. */
function colonneDe(fragment, colonnes, ecartMaximal = 90) {
  let meilleure
  for (const c of colonnes) {
    const ecart = Math.abs(c.fragment.x - fragment.x)
    if (!meilleure || ecart < meilleure.ecart) meilleure = { nom: c.nom, ecart }
  }
  return meilleure && meilleure.ecart <= ecartMaximal ? meilleure.nom : undefined
}

function lireBandeau(fragments) {
  const colonnes = repererColonnes(fragments, COLONNES_BANDEAU)
  if (colonnes.length === 0) return {}
  const yBandeau = Math.min(...colonnes.map((c) => c.fragment.y))
  const valeurs = {}
  const articles = {}
  const lignes = {}
  for (const f of fragments) {
    // Sous le bandeau vient le pied de page — mentions legales, adresse du
    // site, numero de page. Sans cette borne, « 1 ballon » devenait
    // « 1 ballon 7 » et la phrase des gardiens emportait le copyright.
    if (f.y <= yBandeau + TOLERANCE_LIGNE || f.y > yBandeau + HAUTEUR_BANDEAU) continue
    const nom = colonneDe(f, colonnes)
    if (!nom) continue
    ;(lignes[nom] ??= []).push(f)
  }
  for (const [nom, fragments] of Object.entries(lignes)) {
    fragments.sort((a, b) => a.y - b.y || a.x - b.x)
    // Une cellule du bandeau tient parfois sur plusieurs lignes. Pour le
    // materiel, chaque ligne est un ARTICLE distinct — « 1 ballon pour 3 » et
    // « 1 plot » — et les coller donnait un seul article illisible dans le
    // recapitulatif de materiel de la seance.
    const parLigne = []
    for (const f of fragments) {
      const derniere = parLigne[parLigne.length - 1]
      const memeLigne = derniere && Math.abs(derniere.y - f.y) <= TOLERANCE_LIGNE
      if (memeLigne || (derniere && SUITE_DE_LIGNE.test(f.texte))) {
        derniere.texte = accoler(derniere.texte, f.texte)
        derniere.y = f.y
      } else parLigne.push({ y: f.y, texte: f.texte })
    }
    articles[nom] = parLigne.map((l) => l.texte.trim()).filter(Boolean)
    valeurs[nom] = parLigne.reduce((acc, l) => accoler(acc, l.texte), '')
  }
  // L'ordonnee du bandeau sert aussi a borner les rubriques, plus haut sur la
  // page : elle voyage avec les valeurs plutot que d'etre recalculee.
  return { ...valeurs, __articles: articles, __y: yBandeau }
}

// ----------------------------------------------------------------- Sommaire

const sansAccent = (t) =>
  t
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .toLowerCase()

/** Intitules du tableau de sommaire. « Difficulté » est une icone, jamais du texte. */
const COLONNES_SOMMAIRE = ['Durée', 'Thème', 'Nom du jeu', 'Difficulté', 'page']

/**
 * Lit le sommaire, colonne par colonne.
 *
 * C'est le seul endroit du cahier ou les titres sont correctement casses : sur
 * la fiche, le titre est en CAPITALES, et le remettre en casse normale
 * demanderait de deviner les noms propres du handball — « Ailier »,
 * « Demi-Centre », « Kung-Fu ».
 *
 * La lecture se fait par ABSCISSE et non dans l'ordre du flux : le PDF pose les
 * cellules d'une meme ligne dans un ordre quelconque, et un theme ou un nom
 * qui tient sur deux lignes ne se distingue de son voisin que par sa colonne.
 * Lire lineairement collait le theme au nom, sans separateur.
 */
function lireSommaire(pages) {
  const entrees = []
  for (const fragments of pages) {
    const colonnes = repererColonnes(fragments, COLONNES_SOMMAIRE)
    if (colonnes.length < 3) continue

    const ancres = fragments
      .filter((f) => /^Exercice\s+\d+$/.test(f.texte.trim()))
      .sort((a, b) => a.y - b.y)
    if (ancres.length === 0) continue

    ancres.forEach((ancre, rang) => {
      // Les cellules sont CENTREES sur leur ancre, pas alignees dessus : un nom
      // sur trois lignes en pose une au-dessus et une en dessous. La bande d'une
      // ligne va donc d'un demi-ecart avant son ancre a un demi-ecart apres.
      //
      // Une bande ouverte vers le bas ramassait le numero de page imprime en
      // pied de sommaire, qui venait se coller au titre du dernier exercice.
      const avant = ancres[rang - 1]
      const apres = ancres[rang + 1]
      const ecartAvant = avant ? ancre.y - avant.y : undefined
      const ecartApres = apres ? apres.y - ancre.y : undefined
      const haut = ancre.y - (ecartAvant ?? ecartApres ?? ECART_LIGNE_PAR_DEFAUT) / 2
      const bas = ancre.y + (ecartApres ?? ecartAvant ?? ECART_LIGNE_PAR_DEFAUT) / 2
      const cellules = {}
      for (const f of fragments) {
        if (f.y < haut || f.y >= bas || f === ancre) continue
        const nom = colonneDe(f, colonnes, 70)
        if (!nom) continue
        cellules[nom] = accoler(cellules[nom] ?? '', f.texte)
      }
      const page = Number(/(\d+)/.exec(cellules.page ?? '')?.[1])
      if (!page) return
      entrees.push({
        numero: Number(/(\d+)/.exec(ancre.texte)[1]),
        duree: Number(/(\d+)/.exec(cellules['Durée'] ?? '')?.[1] ?? 0),
        theme: (cellules['Thème'] ?? '').trim(),
        nom: (cellules['Nom du jeu'] ?? '').trim(),
        page,
      })
    })
  }
  return entrees.sort((a, b) => a.numero - b.numero)
}

// ------------------------------------------------------------- Conversion

const nombreDans = (texte, defaut = 0) => {
  const m = /(\d+)/.exec(texte ?? '')
  return m ? Number(m[1]) : defaut
}

/**
 * Categorie de l'exercice.
 *
 * Le THEME du cahier est essaye en premier, et le titre seulement s'il ne dit
 * rien. C'est le classement de l'auteur, et il vaut mieux que le notre : sur le
 * titre seul, « Tir de l'Ailier sur decalage avec defenseur » tombait en
 * « defense » a cause du mot « defenseur », alors que l'exercice travaille le
 * tir et que l'auteur l'a range sous « Le tir de l'Ailier ».
 */
function trouverCategorie(texte) {
  const cible = sansAccent(texte ?? '')
  if (!cible.trim()) return undefined
  for (const [motif, categorie] of CATEGORIES) if (motif.test(cible)) return categorie
  return undefined
}

function categorieDe(theme, titre) {
  return trouverCategorie(theme) ?? trouverCategorie(titre) ?? 'attaque'
}

/**
 * Role des gardiens, deduit de la phrase du bandeau.
 *
 * « Les gardiens peuvent se faire des passes de relances sur l'autre
 * demi-terrain » ne veut pas dire que l'exercice les mobilise : il veut dire
 * qu'ils sont AILLEURS. Du point de vue de la fiche, c'est donc « sans
 * gardien » — et zero gardien a l'effectif, sans quoi l'alerte d'effectif se
 * declencherait pour des gardiens dont l'exercice n'a pas besoin.
 */
function roleGardiens(phrase) {
  const t = sansAccent(phrase ?? '')
  if (/autre demi-terrain|autre moitie|a l'ecart|pas concernes|ne participent pas/.test(t)) {
    return { formatGardiens: 'sans', nombreGardiens: 0 }
  }
  if (/participent|dans son but|dans leur but|dans les buts/.test(t)) {
    return { formatGardiens: 'avec-joueurs', nombreGardiens: 1 }
  }
  return { formatGardiens: 'avec-joueurs', nombreGardiens: 1 }
}

/** Un exercice qui traverse le terrain en demande la totalite. */
function espaceDe(textes) {
  const t = sansAccent(textes.join(' '))
  return /montee de balle|contre-attaque|toute la longueur|terrain entier|terrain complet|d'un but a l'autre/.test(
    t,
  )
    ? 'complet'
    : 'demi'
}

// ---------------------------------------------------------------- Domaine

/**
 * Bundle du domaine, pour fabriquer de VRAIS objets du modele.
 *
 * Ecrire le JSON a la main marcherait aujourd'hui et casserait au premier champ
 * ajoute au modele. En passant par nouvelExercice() et exporterSauvegarde(), le
 * fichier produit est exactement celui qu'ecrirait l'application.
 */
async function domaine() {
  mkdirSync(BAC, { recursive: true })
  const entree = join(BAC, 'entree-import.ts')
  const bundle = join(BAC, 'import-domaine.mjs')
  writeFileSync(
    entree,
    [
      "export { nouvelExercice } from '../src/domain/fabrique'",
      "export { exporterSauvegarde } from '../src/domain/echange'",
      '',
    ].join('\n'),
  )
  // L'API JavaScript d'esbuild, et non son executable.
  //
  // « npx esbuild » n'est pas un binaire sur Windows et demande un shell ;
  // « node node_modules/esbuild/bin/esbuild » ne vaut pas mieux : le script
  // d'installation d'esbuild REMPLACE ce fichier par le binaire natif de la
  // plateforme. Sur Windows il reste un script Node et tout marche ; sur Linux
  // c'est un executable, que node ne sait pas lire — l'appel echoue alors sur
  // une machine et pas sur l'autre.
  //
  // L'API n'a ni chemin a deviner ni shell a traverser.
  await construire({
    entryPoints: [entree],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: bundle,
  })
  return import(pathToFileURL(resolve(bundle)).href)
}

// ------------------------------------------------------------------- Main

const chemin = process.argv[2]
if (!chemin) {
  console.error('Usage : npm run importer -- "chemin/vers/Cahier.pdf" [--sortie dossier]')
  process.exit(1)
}
const iSortie = process.argv.indexOf('--sortie')
const dossierSortie = iSortie > 0 ? process.argv[iSortie + 1] : SORTIE_PAR_DEFAUT

const { nouvelExercice, exporterSauvegarde } = await domaine()

const doc = await getDocument({
  data: new Uint8Array(readFileSync(chemin)),
  useSystemFonts: true,
}).promise

const pages = []
for (let n = 1; n <= doc.numPages; n++) {
  const page = await doc.getPage(n)
  pages.push(await fragmentsDe(page))
}
const pagesTexte = pages.map((f) => enLignes(f).map((l) => l.texte).join('\n'))

// Titre du cahier : la premiere page, son plus gros texte.
const titreCahier =
  [...pages[0]].sort((a, b) => b.hauteur - a.hauteur)[0]?.texte ?? basename(chemin, '.pdf')
const auteur = /Par\s*\n?\s*(.+)/.exec(pagesTexte[0])?.[1]?.trim() ?? ''
const source = [titreCahier, auteur].filter(Boolean).join(' — ')

const sommaire = lireSommaire(pages)
console.log(`\nCahier : ${titreCahier}${auteur ? ` (${auteur})` : ''}`)
console.log(`${doc.numPages} pages, ${sommaire.length} entrées au sommaire\n`)

const fiches = []
const alertes = []

for (const entree of sommaire) {
  const index = entree.page - 1
  if (!pages[index]) {
    alertes.push(`Exercice ${entree.numero} : page ${entree.page} absente du PDF`)
    continue
  }
  const bandeau = lireBandeau(pages[index])
  const decoupe = decouperFiche(pages[index], bandeau.__y)
  const { theme, nom } = entree

  if (!decoupe.fonctionnement) {
    alertes.push(`Exercice ${entree.numero} (« ${nom} ») : aucune rubrique « Consignes » trouvée`)
  }

  const fiche = nouvelExercice(nom || decoupe.titre)
  const gardiens = roleGardiens(bandeau.GARDIENS)

  fiche.categorie = categorieDe(theme, nom)
  fiche.duree = entree.duree || nombreDans(bandeau.TEMPS, 15)
  fiche.nombreJoueurs = nombreDans(bandeau.PARTICIPANTS, 12)
  fiche.nombreGardiens = gardiens.nombreGardiens
  fiche.formatGardiens = gardiens.formatGardiens
  fiche.materiel = bandeau.__articles?.MATÉRIEL ?? []
  fiche.objectifs = decoupe.objectif ?? ''
  fiche.misePlace = decoupe.misePlace ?? ''
  fiche.fonctionnement = decoupe.fonctionnement ?? ''
  fiche.regulation = decoupe.regulation ?? ''
  fiche.pointsCles = decoupe.pointsCles ?? ''
  fiche.evolution = decoupe.evolution ?? ''
  fiche.espace = espaceDe([nom, decoupe.fonctionnement ?? '', decoupe.misePlace ?? ''])

  // Les postes et la categorie d'age n'ont pas de champ dans le modele : plutot
  // que de les perdre, ils rejoignent la mise en place, ou un entraineur les
  // cherchera naturellement.
  const precisions = []
  if (bandeau.POSTES) precisions.push(`Postes : ${bandeau.POSTES.trim()}`)
  if (bandeau.CATÉGORIES) precisions.push(`Catégories : ${bandeau.CATÉGORIES.trim()}`)
  if (bandeau.GARDIENS) precisions.push(`Gardiens : ${bandeau.GARDIENS.trim()}`)
  if (precisions.length > 0) {
    fiche.misePlace = [fiche.misePlace, precisions.join('\n')].filter(Boolean).join('\n')
  }

  // La source suit la fiche partout : a l'ecran, a l'export, a l'impression.
  // C'est la convention du projet — la provenance se dit dans le texte, faute
  // d'un champ pour elle.
  fiche.fonctionnement = [fiche.fonctionnement, `Source : ${source}, exercice ${entree.numero}.`]
    .filter(Boolean)
    .join('\n')

  fiches.push(fiche)
  const manques = ['objectifs', 'misePlace', 'fonctionnement'].filter((c) => !fiche[c])
  const etat = manques.length ? `⚠ sans ${manques.join(', ')}` : 'complet'
  console.log(
    `  ${String(entree.numero).padStart(2)}. ${nom.padEnd(52).slice(0, 52)} ${String(fiche.duree).padStart(2)} min  ${fiche.categorie.padEnd(11)} ${etat}`,
  )
}

mkdirSync(dossierSortie, { recursive: true })
const slug = basename(chemin, '.pdf')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .replace(/[^A-Za-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .toLowerCase()
const fichier = join(dossierSortie, `${slug}.hbt.json`)
writeFileSync(fichier, exporterSauvegarde([], fiches), 'utf8')

console.log('')
for (const a of alertes) console.log(`  ⚠ ${a}`)
console.log(`\n${fiches.length} fiche(s) écrite(s) dans ${fichier}`)
console.log('À restaurer dans l\'application par « Importer ».')
console.log(
  'Ce fichier contient une oeuvre sous droits : il ne va ni dans git, ni dans la bibliothèque livrée.\n',
)
