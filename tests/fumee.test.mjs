/**
 * Test de fumee : le livrable, dans un vrai navigateur, en file://.
 *
 * Les tests de domaine verifient des fonctions pures et les ont toutes
 * declarees justes — pendant que le cablage etait faux. L'impression ignorait
 * la mise en page calculee, les vignettes d'etapes affichaient toutes l'etape
 * 1, la lecture animee ne faisait pivoter personne, et en tablette verticale le
 * terrain etait peint SOUS la colonne de detail, donc inatteignable.
 *
 * Ce fichier existe pour que ces quatre defauts ne puissent plus passer.
 *
 * Lancement : npm run fumee (apres npm run build)
 */

import { ouvrirNavigateur } from '../outils/navigateur.mjs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'

let ok = 0, ko = 0
const verifier = (nom, condition, detail = '') => {
  if (condition) { ok++; console.log('  OK    ' + nom) }
  else { ko++; console.log('  ECHEC ' + nom + ' ' + detail) }
}

const navigateur = await ouvrirNavigateur()
if (!navigateur) {
  console.log('')
  console.log('  IGNORE : aucun navigateur Chromium trouve sur cette machine.')
  console.log('  Le test de fumee a besoin de Chrome ou Edge.')
  process.exit(0)
}

const livrable = pathToFileURL(resolve('dist/index.html')).href

/**
 * Seance de demonstration, volontairement variee.
 *
 * Une seule fiche ne prouve rien pour l'impression : il faut les trois vues de
 * terrain, une fiche a plusieurs etapes, et une fiche au texte abondant — c'est
 * la combinaison qui met la mise en page en difficulte.
 */
const FICHES_TEMOINS = [
  'Croisé arrière',        // demi-terrain, quatre etapes, texte moyen
  'Échauffement en montée', // terrain complet, tres large
  'Circuit intermittent',   // beaucoup de texte, beaucoup de plots
  'Duels croisés entre gardiens', // terrain complet, fiche gardien
  'Échauffement gardien : appuis', // vue zone, plus haute que large
  // Les deux fiches du club les plus exposees : l'une pour son bareme de
  // points, qui fait le texte le plus long du catalogue, l'autre pour sa
  // choregraphie en quatre temps sur terrain complet.
  'Jeu grand espace',
  'Projet de jeu en transition',
]

const PREPARER = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const btn = (t) => [...document.querySelectorAll('.bouton')]
    .find((b) => b.textContent.trim().includes(t));
  await pause(400);
  if (!document.querySelector('.carte-seance')) {
    btn('Nouvelle séance')?.click(); await pause(500);
  } else {
    document.querySelector('.carte-seance .zone-ouverture').click(); await pause(500);
  }
  const voulues = ${JSON.stringify(FICHES_TEMOINS)};
  for (const voulue of voulues) {
    const deja = [...document.querySelectorAll('.titre-exercice')]
      .some((t) => t.textContent.includes(voulue));
    if (deja) continue;
    btn('Bibliothèque')?.click(); await pause(500);
    const carte = [...document.querySelectorAll('.carte-modele')]
      .find((c) => c.textContent.includes(voulue));
    if (!carte) { document.querySelector('.voile')?.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true })); await pause(300); continue; }
    carte.click(); await pause(250);
    btn('Ajouter à la séance')?.click(); await pause(500);
  }
  return document.querySelectorAll('.ligne-exercice').length;
`

/**
 * Ouvre la fiche chorégraphiée de la seance temoin.
 *
 * Il faut viser explicitement : la derniere fiche ajoutee est une mise en place
 * a une seule etape, sur laquelle la lecture animee n'a rien a montrer.
 */
const OUVRIR_FICHE = `
  const pause = (ms) => new Promise((r) => setTimeout(r, ms));
  const liens = [...document.querySelectorAll('.lien-exercice')];
  const cible = liens.find((l) => l.textContent.includes('Croisé arrière')) ?? liens[0];
  cible.click();
  await pause(800);
  return document.querySelectorAll('.puce-etape').length;
`

try {
  await navigateur.aller(livrable)

  console.log('')
  console.log('1. Le livrable s ouvre en file://')
  const demarrage = await navigateur.evaluer(`
    await new Promise((r) => setTimeout(r, 1200));
    return {
      rendu: !!document.querySelector('.application'),
      sansStockage: !!document.querySelector('.bandeau.alerte'),
      erreurs: window.__erreurs ?? [],
    };
  `)
  verifier('l application se rend', demarrage.rendu === true)
  verifier('le stockage local est disponible', demarrage.sansStockage === false,
    '(bandeau « sauvegarde indisponible » affiche)')

  const exercices = await navigateur.evaluer(PREPARER)
  verifier('la seance temoin couvre plusieurs types de fiches', exercices >= 4,
    `(${exercices} exercices)`)
  const etapes = await navigateur.evaluer(OUVRIR_FICHE)
  verifier('la fiche a plusieurs etapes', etapes >= 3, `(${etapes} etapes)`)

  console.log('')
  console.log('2. Tablette verticale : le terrain doit rester atteignable')
  await navigateur.dimensionner(834, 1194)
  const portrait = await navigateur.evaluer(`
    await new Promise((r) => setTimeout(r, 500));
    const svg = document.querySelector('svg.terrain');
    const detail = document.querySelector('.colonne-detail');
    const rS = svg.getBoundingClientRect(), rD = detail.getBoundingClientRect();
    // Test decisif : qui recoit reellement le clic au centre du terrain ?
    const dessus = document.elementFromPoint(rS.left + rS.width / 2, rS.top + rS.height / 2);
    return {
      chevauchement: Math.round(rS.bottom - rD.top),
      auCentre: dessus ? (dessus.closest('svg.terrain') ? 'terrain' : 'autre chose') : 'rien',
      hauteurTerrain: Math.round(rS.height),
    };
  `)
  verifier('le terrain n est pas recouvert par le detail', portrait.chevauchement <= 2,
    `(${portrait.chevauchement} px de chevauchement)`)
  verifier('un clic au centre du terrain atteint le terrain', portrait.auCentre === 'terrain',
    `(atteint : ${portrait.auCentre})`)
  verifier('le terrain garde une taille utile', portrait.hauteurTerrain >= 250,
    `(${portrait.hauteurTerrain} px)`)

  console.log('')
  console.log('3. Lecture animee : les joueurs pivotent et les fleches suivent')
  await navigateur.dimensionner(1440, 900)
  const lecture = await navigateur.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    await pause(400);
    const angles = () => [...document.querySelectorAll('svg.terrain .jeton g[transform^="rotate"]')]
      .map((g) => Math.round(+g.getAttribute('transform').match(/rotate\\(([-\\d.]+)\\)/)[1]));
    const fleches = () => [...document.querySelectorAll('svg.terrain .fleche')]
      .map((f) => f.getAttribute('class').replace('fleche fleche-', '')).join(',');
    document.querySelectorAll('.puce-etape')[0].click();
    await pause(400);
    const avant = { angles: angles(), fleches: fleches() };
    const lire = [...document.querySelectorAll('.barre-etapes .bouton')]
      .find((b) => b.textContent.includes('Lire'));
    lire.click();
    await pause(1400);
    const pendant = { angles: angles(), fleches: fleches() };
    // Arrete la lecture pour ne pas laisser tourner l'animation.
    const stop = [...document.querySelectorAll('.barre-etapes .bouton')]
      .find((b) => b.textContent.includes('Arreter'));
    stop?.click();
    await pause(300);
    return {
      anglesChanges: JSON.stringify(avant.angles) !== JSON.stringify(pendant.angles),
      flechesChangees: avant.fleches !== pendant.fleches,
      avant, pendant,
    };
  `)
  verifier('les joueurs pivotent pendant la lecture', lecture.anglesChanges === true,
    `(angles figes : ${JSON.stringify(lecture.avant.angles).slice(0, 60)})`)
  verifier('les fleches suivent l etape en cours', lecture.flechesChangees === true,
    `(« ${lecture.avant.fleches} » inchange)`)

  console.log('')
  console.log('4. Impression : mesuree pendant que les feuilles existent')
  // Les feuilles d'impression sont ephemeres : l'application les retire 60 ms
  // apres avoir appele window.print(). On mesure donc DANS cet appel.
  await navigateur.modeImpression(true)
  const papier = await navigateur.evaluer(`
    const pause = (ms) => new Promise((r) => setTimeout(r, ms));
    const retour = document.querySelector('.fiche-entete .bouton.discret');
    if (retour) { retour.click(); await pause(600); }
    const btn = (t) => [...document.querySelectorAll('.bouton')]
      .find((b) => b.textContent.trim().includes(t));

    let capture = null;
    window.print = () => {
      const feuilles = [...document.querySelectorAll('.feuille')];
      // A4 paysage moins 9 mm de marges : environ 726 px a 96 ppp.
      const HAUTEUR_PAGE = 726;
      capture = {
        nbFeuilles: feuilles.length,
        pagesEstimees: feuilles.reduce(
          (t, f) => t + Math.max(1, Math.ceil(f.getBoundingClientRect().height / HAUTEUR_PAGE)), 0),
        detail: feuilles.map((f) => {
          const corps = f.querySelector('.feuille-corps');
          const style = getComputedStyle(corps);
          const texte = f.querySelector('.feuille-texte');
          const terrains = [...f.querySelectorAll('.feuille-schema svg.terrain')];
          return {
            titre: f.querySelector('h1').textContent.trim().slice(0, 34),
            hauteur: Math.round(f.getBoundingClientRect().height),
            lignes: style.gridTemplateRows,
            colonnes: style.gridTemplateColumns,
            texteCache: texte ? texte.scrollHeight - texte.clientHeight : 0,
            nbTerrains: terrains.length,
            nbFleches: terrains[0] ? terrains[0].querySelectorAll('.fleche').length : 0,
            nbEtapesListees: f.querySelectorAll('.liste-etapes-impression li').length,
          };
        }),
      };
    };
    btn('Imprimer la séance')?.click();
    await pause(700);
    return { capture, exercices: document.querySelectorAll('.ligne-exercice').length };
  `)
  await navigateur.modeImpression(false)

  const feuilles = papier.capture?.detail ?? []
  verifier('les feuilles sont produites', feuilles.length === papier.exercices,
    `(${feuilles.length} feuilles pour ${papier.exercices} exercices)`)

  for (const f of feuilles) {
    verifier(`« ${f.titre} » tient sur une page`, f.hauteur <= 760,
      `(${f.hauteur} px pour ~726 disponibles)`)
    verifier(`« ${f.titre} » applique la repartition calculee`,
      !/auto/.test(f.lignes) && !/auto/.test(f.colonnes),
      `(lignes: ${f.lignes} / colonnes: ${f.colonnes})`)
    verifier(`« ${f.titre} » n a pas de texte tronque`, f.texteCache <= 2,
      `(${f.texteCache} px caches)`)
  }

  verifier('une page par exercice', papier.capture?.pagesEstimees === papier.exercices,
    `(${papier.capture?.pagesEstimees} pages pour ${papier.exercices} exercices)`)

  console.log('')
  console.log('5. Un seul terrain par feuille, portant tout l enchainement')
  //
  // Le piege que garde cette section : les fleches du schema de synthese sont
  // recopiees en fleches LIBRES, avec leurs deux extremites. Si l'une d'elles
  // restait liee a son jeton, elle chercherait sa position a une etape suivante
  // qui n'existe plus dans le schema synthetise — et disparaitrait sans bruit.
  // La feuille sortirait alors avec un terrain muet, ce qui ne se decouvrirait
  // qu'au gymnase, l'exercice en main.
  for (const f of feuilles) {
    verifier(`« ${f.titre} » : un seul terrain`, f.nbTerrains === 1,
      `(${f.nbTerrains} terrains)`)
  }
  const enchainements = feuilles.filter((f) => f.nbEtapesListees > 1)
  if (enchainements.length === 0) {
    console.log('        (aucune fiche a plusieurs etapes dans cette seance)')
  } else {
    for (const f of enchainements) {
      verifier(`« ${f.titre} » : ses ${f.nbEtapesListees} etapes laissent des fleches`,
        f.nbFleches > 0, '(le terrain imprime est muet)')
    }
  }

  console.log('')
  console.log('6. Aucune erreur pendant tout le parcours')
  const erreurs = await navigateur.evaluer(`
    return (window.__erreursCapturees ?? []).length;
  `)
  verifier('aucune exception non rattrapee', erreurs === 0, `(${erreurs})`)
} finally {
  await navigateur.fermer()
}

console.log('')
console.log('=== ' + ok + ' reussis, ' + ko + ' echoues ===')
process.exit(ko === 0 ? 0 : 1)
