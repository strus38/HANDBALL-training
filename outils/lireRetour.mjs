/**
 * Lit le fichier qu'un entraineur renvoie, et raconte ce qu'il en a fait.
 *
 * POURQUOI CET OUTIL EXISTE. L'application ne mesure rien : elle est hors
 * ligne, sans compte et sans mouchard, et c'est un choix. Mais livrer un outil
 * sans jamais savoir s'il sert, c'est developper a l'aveugle — et demander a
 * l'entraineur ce qu'il en pense ne le remplace pas : on repond gentiment aux
 * gens qui vous offrent quelque chose. Un « c'est tres bien » poli ne dit pas
 * si l'application a servi deux fois ou trente.
 *
 * Le fichier .hbt.json, lui, ne ment pas. C'est une sauvegarde ordinaire,
 * envoyee volontairement par l'entraineur, et elle porte deja tout : quand il a
 * prepare ses seances, s'il les a menees, s'il a ecrit ce qu'il en a pense,
 * d'ou viennent ses exercices, s'il a dessine ses schemas.
 *
 * CE QU'IL FAUT EN ATTENDRE. Des faits, pas un jugement. « Aucun retour ecrit
 * en quatorze seances » ne dit pas que la fonction est mauvaise : peut-etre
 * est-elle introuvable, peut-etre arrive-t-elle au mauvais moment, peut-etre
 * n'a-t-elle aucun interet. L'outil dit ou regarder ; la conversation avec
 * l'entraineur dit pourquoi.
 *
 * CE QU'IL NE FAIT PAS. Il ne modifie rien, n'ecrit rien, n'envoie rien. Il
 * lit un fichier et imprime un texte.
 *
 * Lancement :
 *   npm run lire-retour -- "chemin/vers/sauvegarde.hbt.json"
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { build as construire } from 'esbuild'

const BAC = '.build-tests'

/**
 * Bundle du domaine.
 *
 * On relit avec les fonctions de l'application elle-meme : un fichier ecrit par
 * une version anterieure passe alors par les memes valeurs par defaut, et ce
 * qu'on compte est exactement ce que l'entraineur voyait a l'ecran.
 *
 * normaliserSeance / normaliserExercice, et NON importerFichier : celui-ci
 * renouvelle les identifiants et, ce faisant, remet creeLe et modifieLe a
 * l'instant present. C'est ce qu'il faut pour une restauration, qui doit
 * pouvoir s'ajouter a l'existant sans rien ecraser ; ce serait ici effacer la
 * chronologie qu'on vient precisement lire.
 */
async function domaine() {
  mkdirSync(BAC, { recursive: true })
  const entree = join(BAC, 'entree-retour.ts')
  const bundle = join(BAC, 'retour-domaine.mjs')
  writeFileSync(
    entree,
    [
      "export { normaliserSeance, normaliserExercice } from '../src/domain/echange'",
      "export { resumerSeance } from '../src/domain/resume'",
      '',
    ].join('\n'),
  )
  // L'API JavaScript d'esbuild, et non son executable : voir la note detaillee
  // dans outils/importerCahier.mjs.
  await construire({
    entryPoints: [entree],
    bundle: true,
    format: 'esm',
    platform: 'neutral',
    outfile: bundle,
  })
  return import(pathToFileURL(resolve(bundle)).href)
}

// ------------------------------------------------------------- Presentation

const JOUR = 86_400_000

const pourcent = (part, total) => (total === 0 ? '—' : `${Math.round((part / total) * 100)} %`)

/** « 12 / 62    19 % », colonnes alignees. */
function proportion(intitule, part, total) {
  const fraction = `${String(part).padStart(3)} / ${String(total).padEnd(3)}`
  return `     ${intitule.padEnd(32)}${fraction}   ${pourcent(part, total).padStart(5)}`
}

function ligne(intitule, valeur) {
  return `     ${intitule.padEnd(32)}${String(valeur).padStart(3)}`
}

const enDate = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '—')

const joursEntre = (debut, fin) => Math.round((Date.parse(fin) - Date.parse(debut)) / JOUR)

const pluriel = (nombre, mot) => `${nombre} ${mot}${nombre > 1 ? 's' : ''}`

// ----------------------------------------------------------------- Comptage

/** Vrai si l'exercice porte un schema dessine, et non un terrain reste vide. */
const schemaDessine = (exercice) => exercice.schema.jetons.length > 0

/** Vrai si le mouvement est decoupe : plus d'une etape, donc des deplacements. */
const mouvementDecoupe = (exercice) => exercice.schema.etapes.length > 1

/**
 * D'ou vient l'exercice.
 *
 * Trois provenances. Une fiche issue de la bibliotheque livree porte sa
 * reference ; une fiche importee d'un cahier porte la mention de sa source
 * dans son texte ; une fiche ecrite de zero ne porte ni l'une ni l'autre.
 */
function provenance(exercice) {
  if (exercice.refModele || exercice.issuDeLaBibliotheque) return 'livree'
  const texte = `${exercice.objectifs} ${exercice.misePlace}`
  if (/Source\s*:|D['’]apres/i.test(texte)) return 'cahier'
  return 'ecrite'
}

function compter(seances, modeles) {
  const exercices = seances.flatMap((s) => s.exercices)
  const tous = [...exercices, ...modeles]
  const parProvenance = { livree: 0, cahier: 0, ecrite: 0 }
  for (const exercice of tous) parProvenance[provenance(exercice)]++

  let zones = 0
  let annotations = 0
  let colonnes = 0
  let cerceaux = 0
  let rotations = 0
  for (const exercice of tous) {
    zones += (exercice.schema.zones ?? []).length
    annotations += (exercice.schema.annotations ?? []).length
    colonnes += exercice.schema.jetons.filter((j) => j.type === 'colonne').length
    cerceaux += exercice.schema.jetons.filter((j) => j.type === 'cerceau').length
    for (const etape of exercice.schema.etapes) {
      rotations += etape.fleches.filter((f) => f.type === 'rotation').length
    }
  }

  return {
    seances: seances.length,
    exercices: exercices.length,
    modeles: modeles.length,
    tous,
    retours: seances.filter((s) => s.retour.trim() !== '').length,
    effectif: seances.filter((s) => s.effectifJoueurs > 0).length,
    espace: seances.filter((s) => s.espaceDisponible !== '').length,
    creneau: seances.filter((s) => typeof s.dureeCreneau === 'number' && s.dureeCreneau > 0).length,
    menees: seances.filter((s) => s.exercices.some((e) => e.deroule?.fait)).length,
    faits: exercices.filter((e) => e.deroule?.fait).length,
    // Deux mesures pour la note et le commentaire : sur les exercices de
    // seance, qui disent si la boucle se referme apres un entrainement ; sur
    // tout le corpus, bibliotheque personnelle comprise, quand la question est
    // « ces champs servent-ils ». Melanger les deux dans un meme tableau
    // donnerait des pourcentages incomparables entre deux lignes voisines.
    notes: exercices.filter((e) => e.evaluation.note > 0).length,
    commentaires: exercices.filter((e) => e.evaluation.commentaire.trim() !== '').length,
    notesPartout: tous.filter((e) => e.evaluation.note > 0).length,
    materiel: tous.filter((e) => e.materiel.length > 0).length,
    dessines: tous.filter(schemaDessine).length,
    mouvements: tous.filter(mouvementDecoupe).length,
    parProvenance,
    zones,
    annotations,
    colonnes,
    cerceaux,
    rotations,
  }
}

/**
 * Histogramme des seances preparees, semaine par semaine.
 *
 * C'est la courbe qui compte le plus : elle montre la falaise. Un entraineur
 * qui prepare six seances la premiere semaine puis plus rien pendant un mois
 * n'a pas adopte l'application, quoi qu'il en dise par politesse.
 *
 * On compte sur creeLe — le jour ou la seance a ete PREPAREE — et non sur sa
 * date d'entrainement : preparer douze seances d'avance en une soiree est un
 * usage a part entiere, et le lisser sur douze semaines l'effacerait.
 */
function parSemaine(seances) {
  const dates = seances.map((s) => Date.parse(s.creeLe)).filter((d) => !Number.isNaN(d))
  if (dates.length === 0) return []
  const debut = Math.min(...dates)
  const semaines = []
  for (const date of dates) {
    const rang = Math.floor((date - debut) / (7 * JOUR))
    semaines[rang] = (semaines[rang] ?? 0) + 1
  }
  for (let i = 0; i < semaines.length; i++) semaines[i] = semaines[i] ?? 0
  return semaines
}

// ------------------------------------------------------------------ Lecture

function lireFichier(chemin, normaliserSeance, normaliserExercice) {
  let brut
  try {
    brut = JSON.parse(readFileSync(chemin, 'utf8'))
  } catch (erreur) {
    throw new Error(`Ce fichier n'est pas un JSON lisible : ${erreur.message}`)
  }
  if (!brut || typeof brut !== 'object' || brut.format !== 'handball-training') {
    throw new Error("Ce fichier n'a pas ete ecrit par HBPSM (champ « format » absent ou different).")
  }
  const contenu = brut.contenu ?? {}
  const seances = Array.isArray(contenu.seances)
    ? contenu.seances.map(normaliserSeance)
    : contenu.seance
      ? [normaliserSeance(contenu.seance)]
      : []
  const modeles = Array.isArray(contenu.modeles)
    ? contenu.modeles.map(normaliserExercice)
    : contenu.exercice
      ? [normaliserExercice(contenu.exercice)]
      : []
  return {
    exporteLe: typeof brut.exporteLe === 'string' ? brut.exporteLe : '',
    application: typeof brut.application === 'string' ? brut.application : 'inconnue',
    type: typeof contenu.type === 'string' ? contenu.type : 'inconnu',
    favoris: Array.isArray(contenu.favoris) ? contenu.favoris.length : 0,
    masquees: Array.isArray(contenu.masquees) ? contenu.masquees.length : 0,
    monEquipe: contenu.monEquipe ?? { equipe: '', categorieAge: '' },
    seances,
    modeles,
  }
}

// ------------------------------------------------------------ Ce que ca dit

/**
 * Les signaux, et rien de plus.
 *
 * Chacun designe un endroit ou regarder, jamais une conclusion. La difference
 * n'est pas affaire de politesse : conclure a partir d'un seul fichier, c'est
 * se tromper avec assurance. « Aucun retour ecrit » peut vouloir dire que la
 * fonction est inutile, introuvable, ou arrive au mauvais moment — trois
 * remedes opposes, que seule une question a l'entraineur departage.
 */
export function signaux(compte, seances, exporteLe) {
  const dits = []
  if (compte.seances === 0) {
    dits.push("Le fichier ne contient aucune seance : il n'y a rien a lire ici.")
    return dits
  }

  const derniere = seances
    .map((s) => s.creeLe)
    .filter(Boolean)
    .sort()
    .at(-1)
  if (derniere && exporteLe) {
    const jours = joursEntre(derniere, exporteLe)
    if (jours > 21) {
      dits.push(
        `Plus aucune seance preparee pendant les ${jours} jours precedant l'export. ` +
          'Demander ce qui a change a ce moment-la.',
      )
    }
  }
  if (compte.seances >= 3 && compte.retours === 0) {
    dits.push(
      "Aucun retour de seance ecrit. C'est ce qui distingue cette application " +
        "d'un traitement de texte : verifier qu'il est trouvable, et qu'il " +
        'arrive au bon moment.',
    )
  }
  if (compte.faits === 0 && compte.exercices > 0) {
    dits.push(
      "Aucun exercice coche « fait ». L'application sert donc a preparer, pas " +
        "a mener : le mode terrain n'a peut-etre jamais ete ouvert au gymnase.",
    )
  }
  if (compte.notesPartout === 0 && compte.tous.length >= 5) {
    dits.push("Aucun exercice note : le bilan n'a aucune matiere a exploiter.")
  }
  if (compte.parProvenance.livree === 0 && compte.tous.length >= 5) {
    dits.push(
      "La bibliotheque livree n'a jamais servi. Soit les fiches ne correspondent " +
        'pas a son equipe, soit elles sont difficiles a trouver.',
    )
  }
  if (compte.dessines === 0 && compte.tous.length >= 5) {
    dits.push(
      "Aucun schema dessine : l'editeur de terrain, qui represente la moitie du " +
        "travail, n'a pas trouve son usage.",
    )
  } else if (compte.mouvements === 0 && compte.dessines >= 3) {
    dits.push(
      'Des schemas dessines, mais aucun decoupe en etapes : les positions ' +
        'servent, le mouvement non.',
    )
  }
  if (compte.zones + compte.annotations + compte.colonnes + compte.rotations === 0) {
    dits.push(
      'Zones, annotations, colonnes et rotations : aucune utilisation. Ces ' +
        'outils sont recents — verifier au moins qu ils sont visibles.',
    )
  }
  if (dits.length === 0) {
    dits.push("Rien d'alarmant : les seances sont preparees, menees et commentees.")
  }
  return dits
}

/** Assemble le rapport. Rendu separement du calcul, pour etre testable. */
export function rapport(fichier, nomFichier, resumerSeance) {
  const compte = compter(fichier.seances, fichier.modeles)
  const semaines = parSemaine(fichier.seances)
  const datesEntrainement = fichier.seances
    .map((s) => s.date)
    .filter(Boolean)
    .sort()
  const minutes = fichier.seances.reduce((total, s) => total + resumerSeance(s).minutes, 0)

  const L = []
  L.push('')
  L.push('  ' + '='.repeat(64))
  L.push("  HBPSM — lecture d'un retour d'entraineur")
  L.push(`  ${nomFichier}`)
  L.push(
    `  exporte le ${enDate(fichier.exporteLe)} par la version ${fichier.application}` +
      ` (${fichier.type})`,
  )
  L.push('  ' + '='.repeat(64))

  L.push('')
  L.push('  1. LE CLASSEUR')
  L.push(
    `     ${pluriel(compte.seances, 'seance')} · ${pluriel(compte.exercices, 'exercice')}` +
      ` · bibliotheque personnelle : ${compte.modeles}`,
  )
  if (datesEntrainement.length > 0) {
    L.push(
      `     entrainements du ${enDate(datesEntrainement[0])} au` +
        ` ${enDate(datesEntrainement.at(-1))} · ${Math.round(minutes / 60)} h preparees`,
    )
  }
  const equipe = [fichier.monEquipe.equipe, fichier.monEquipe.categorieAge]
    .filter(Boolean)
    .join(' · ')
  L.push(`     equipe : ${equipe || 'non renseignee'}`)
  L.push(`     favoris : ${fichier.favoris} · fiches livrees masquees : ${fichier.masquees}`)

  L.push('')
  L.push('  2. A-T-IL CONTINUE ?')
  L.push('     (seances preparees, par semaine depuis la premiere)')
  if (semaines.length === 0) {
    L.push('     aucune date de creation exploitable')
  } else {
    // Largeur bornee par le maximum lui-meme : sans cela, une semaine a deux
    // seances remplirait toute la ligne et une semaine a une seule en
    // occuperait la moitie — un graphique impressionnant qui ne dit rien.
    const maximum = Math.max(...semaines)
    const largeur = Math.min(28, maximum)
    semaines.forEach((nombre, rang) => {
      const barre = '#'.repeat(Math.round((nombre / maximum) * largeur))
      // Le zero s'ecrit. Une semaine vide est precisement ce qu'on vient lire.
      L.push(`     semaine ${String(rang + 1).padStart(2)}  ${barre.padEnd(largeur)}  ${nombre}`)
    })
    const derniere = fichier.seances
      .map((s) => s.creeLe)
      .filter(Boolean)
      .sort()
      .at(-1)
    if (derniere && fichier.exporteLe) {
      L.push('')
      L.push(
        `     derniere seance preparee le ${enDate(derniere)}, soit` +
          ` ${joursEntre(derniere, fichier.exporteLe)} jours avant l'export`,
      )
    }
  }

  L.push('')
  L.push('  3. LA BOUCLE SE REFERME-T-ELLE ?')
  L.push("     (preparer est facile a adopter ; revenir sur ce qu on a fait, non)")
  L.push(proportion('retour de seance ecrit', compte.retours, compte.seances))
  L.push(proportion('seances effectivement menees', compte.menees, compte.seances))
  L.push(proportion('exercices coches « fait »', compte.faits, compte.exercices))
  L.push(proportion('exercices notes', compte.notes, compte.exercices))
  L.push(proportion("commentaires d'exercice", compte.commentaires, compte.exercices))

  L.push('')
  L.push("  4. D'OU VIENNENT LES EXERCICES ?")
  L.push(proportion('bibliotheque livree', compte.parProvenance.livree, compte.tous.length))
  L.push(proportion('cahiers importes', compte.parProvenance.cahier, compte.tous.length))
  L.push(proportion('ecrits de zero', compte.parProvenance.ecrite, compte.tous.length))

  L.push('')
  L.push('  5. LE TERRAIN SERT-IL ?')
  L.push(proportion('schema dessine', compte.dessines, compte.tous.length))
  L.push(proportion('mouvement en 2 etapes ou plus', compte.mouvements, compte.tous.length))
  L.push(ligne('zones coloriees', compte.zones))
  L.push(ligne('annotations posees', compte.annotations))
  L.push(ligne("colonnes d'attente", compte.colonnes))
  L.push(ligne('cerceaux', compte.cerceaux))
  L.push(ligne('fleches de rotation', compte.rotations))

  L.push('')
  L.push('  6. LES CHAMPS RECENTS SONT-ILS REMPLIS ?')
  L.push(proportion('effectif de la seance', compte.effectif, compte.seances))
  L.push(proportion('espace disponible', compte.espace, compte.seances))
  L.push(proportion('duree de creneau', compte.creneau, compte.seances))
  L.push(proportion("materiel de l'exercice", compte.materiel, compte.tous.length))

  L.push('')
  L.push('  7. OU REGARDER')
  for (const dit of signaux(compte, fichier.seances, fichier.exporteLe)) {
    L.push(`     - ${dit}`)
  }
  L.push('')

  return L.join('\n')
}

export { compter, parSemaine, provenance, lireFichier }

// --------------------------------------------------------------------- Main
//
// Sous import.meta.main uniquement : les tests importent ce fichier pour ses
// fonctions, sans declencher la lecture d'un fichier ni un process.exit.

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  const chemin = process.argv[2]
  if (!chemin) {
    console.error('Usage : npm run lire-retour -- "chemin/vers/sauvegarde.hbt.json"')
    process.exit(1)
  }

  const { normaliserSeance, normaliserExercice, resumerSeance } = await domaine()

  try {
    const fichier = lireFichier(chemin, normaliserSeance, normaliserExercice)
    console.log(rapport(fichier, basename(chemin), resumerSeance))
  } catch (erreur) {
    console.error(erreur.message)
    process.exit(1)
  }
}
