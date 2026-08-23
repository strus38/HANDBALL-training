/**
 * Export et import des fichiers .hbt.json.
 *
 * Un fichier importe vient d'un autre entraineur : son contenu n'est jamais
 * suppose valide. Tout est verifie champ par champ et les valeurs manquantes
 * sont remplacees par des valeurs par defaut, plutot que de faire confiance a
 * un simple cast TypeScript.
 */

import { clonerExercice, nouvelExercice, nouvelId, nouvelleSeance } from './fabrique'
import { migrerSchema } from './mouvement'
import { lireFavoris, retracerFavoris } from './favoris'
import {
  nouvelleEvaluation,
  SCHEMA_VERSION,
  type Position,
  type Deroule,
  type Evaluation,
  type Exercice,
  type FichierExport,
  type Seance,
} from './types'

export const EXTENSION = '.hbt.json'

export function exporterSeance(seance: Seance): string {
  const fichier: FichierExport = {
    format: 'handball-training',
    version: SCHEMA_VERSION,
    exporteLe: new Date().toISOString(),
    contenu: { type: 'seance', seance },
  }
  return JSON.stringify(fichier, null, 2)
}

/**
 * Sauvegarde complete : les seances, la bibliotheque personnelle, et les
 * favoris.
 *
 * Les favoris sont une preference de l'entraineur, pas une donnee de seance :
 * on pourrait juger qu'ils n'ont rien a faire dans ce fichier. C'est le
 * contraire. « Sauvegarder tout » est le seul filet contre un nettoyage du
 * navigateur, qui efface aussi les preferences. Les omettre reviendrait a
 * promettre de tout sauver en laissant tomber une partie.
 */
export function exporterSauvegarde(
  seances: Seance[],
  modeles: Exercice[],
  favoris: string[] = [],
): string {
  const fichier: FichierExport = {
    format: 'handball-training',
    version: SCHEMA_VERSION,
    exporteLe: new Date().toISOString(),
    contenu: { type: 'sauvegarde', seances, modeles, favoris },
  }
  return JSON.stringify(fichier, null, 2)
}

export function exporterExercice(exercice: Exercice): string {
  const fichier: FichierExport = {
    format: 'handball-training',
    version: SCHEMA_VERSION,
    exporteLe: new Date().toISOString(),
    contenu: { type: 'exercice', exercice },
  }
  return JSON.stringify(fichier, null, 2)
}

export class ErreurImport extends Error {}

/**
 * Donne de nouveaux identifiants a une seance importee et a ses exercices.
 * Importer deux fois le meme fichier cree ainsi deux copies independantes,
 * sans jamais ecraser une fiche deja presente chez l'entraineur.
 */
function renouvelerIdentifiants(seance: Seance): Seance {
  return {
    ...seance,
    id: nouvelId(),
    exercices: seance.exercices.map((exercice) => clonerExercice(exercice, '')),
  }
}

type Objet = Record<string, unknown>

const estObjet = (v: unknown): v is Objet => typeof v === 'object' && v !== null && !Array.isArray(v)

const texte = (v: unknown, defaut = ''): string => (typeof v === 'string' ? v : defaut)

const nombre = (v: unknown, defaut: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? v : defaut

const liste = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

/**
 * Analyse un fichier .hbt.json et renvoie toujours une seance.
 * Un fichier ne contenant qu'un exercice est enveloppe dans une seance d'accueil.
 */
/** Ce qu'un fichier .hbt.json peut contenir, une fois relu et verifie. */
export type ContenuImporte =
  | { type: 'seance'; seance: Seance }
  | { type: 'exercice'; seance: Seance }
  | { type: 'sauvegarde'; seances: Seance[]; modeles: Exercice[]; favoris: string[] }

export function importerFichier(contenuTexte: string): ContenuImporte {
  let brut: unknown
  try {
    brut = JSON.parse(contenuTexte)
  } catch {
    throw new ErreurImport("Ce fichier n'est pas un JSON valide.")
  }

  if (!estObjet(brut) || brut.format !== 'handball-training') {
    throw new ErreurImport(
      "Ce fichier n'a pas ete cree par l'application (champ « format » absent ou incorrect).",
    )
  }
  if (nombre(brut.version, 0) > SCHEMA_VERSION) {
    throw new ErreurImport(
      'Ce fichier a ete cree avec une version plus recente de l\'application. Mettez a jour votre fichier index.html.',
    )
  }
  if (!estObjet(brut.contenu)) throw new ErreurImport('Contenu du fichier illisible.')

  const contenu = brut.contenu

  if (contenu.type === 'sauvegarde') {
    // Les identifiants sont renouveles ici aussi : restaurer une sauvegarde
    // AJOUTE son contenu, sans jamais ecraser ce qui est deja en place.
    //
    // Les fiches personnelles changent donc d'identifiant, et les favoris qui
    // les designaient pointeraient dans le vide. On garde la correspondance
    // pour les retracer.
    const correspondances = new Map<string, string>()
    const modeles = liste(contenu.modeles)
      .filter(estObjet)
      .map((e) => {
        const ancien = lireExercice(e)
        const nouveau = clonerExercice(ancien, '')
        if (ancien.id) correspondances.set(ancien.id, nouveau.id)
        return nouveau
      })
    return {
      type: 'sauvegarde',
      seances: liste(contenu.seances)
        .filter(estObjet)
        .map((s) => renouvelerIdentifiants(lireSeance(s))),
      modeles,
      favoris: retracerFavoris(lireFavoris(contenu.favoris), correspondances),
    }
  }

  if (contenu.type === 'seance' && estObjet(contenu.seance)) {
    return { seance: renouvelerIdentifiants(lireSeance(contenu.seance)), type: 'seance' }
  }
  if (contenu.type === 'exercice' && estObjet(contenu.exercice)) {
    const exercice = clonerExercice(lireExercice(contenu.exercice), '')
    const seance = nouvelleSeance(`Import — ${exercice.titre}`)
    seance.exercices = [exercice]
    return { seance, type: 'exercice' }
  }
  throw new ErreurImport('Le fichier ne contient ni seance, ni exercice, ni sauvegarde.')
}

/**
 * Relit une seance de provenance inconnue et garantit qu'elle est complete.
 *
 * Utilisee a l'import, mais aussi a la lecture du stockage local : une seance
 * enregistree par une version anterieure de l'application n'a pas les champs
 * ajoutes depuis, et planterait l'affichage sans ce passage.
 * Les identifiants existants sont conserves.
 */
export function normaliserSeance(brut: unknown): Seance {
  return lireSeance(estObjet(brut) ? brut : {})
}

/** Meme role que normaliserSeance, pour une fiche isolee. */
export function normaliserExercice(brut: unknown): Exercice {
  return lireExercice(estObjet(brut) ? brut : {})
}

function lireSeance(brut: Objet): Seance {
  const modele = nouvelleSeance()
  const exercices = liste(brut.exercices).filter(estObjet).map(lireExercice)
  return {
    ...modele,
    id: texte(brut.id) || modele.id,
    creeLe: texte(brut.creeLe, modele.creeLe),
    modifieLe: texte(brut.modifieLe, modele.modifieLe),
    titre: texte(brut.titre, modele.titre),
    date: texte(brut.date, modele.date),
    equipe: texte(brut.equipe),
    categorieAge: texte(brut.categorieAge),
    objectifSeance: texte(brut.objectifSeance),
    effectifJoueurs: Math.max(0, nombre(brut.effectifJoueurs, 0)),
    effectifGardiens: Math.max(0, nombre(brut.effectifGardiens, 0)),
    demarreLe: brut.demarreLe ? texte(brut.demarreLe) : undefined,
    exercices,
  }
}

function lireExercice(brut: Objet): Exercice {
  const modele = nouvelExercice()
  const schemaBrut = estObjet(brut.schema) ? brut.schema : {}
  const jetons = liste(schemaBrut.jetons)
    .filter(estObjet)
    .map((j) => ({
      id: texte(j.id) || modele.id,
      type: (texte(j.type, 'attaquant') as Exercice['schema']['jetons'][number]['type']),
      etiquette: texte(j.etiquette),
      poste: j.poste ? (texte(j.poste) as never) : undefined,
      orientation: typeof j.orientation === 'number' ? j.orientation : undefined,
    }))

  const etapes = liste(schemaBrut.etapes)
    .filter(estObjet)
    .map((e) => {
      const positions: Record<string, Position> = {}
      if (estObjet(e.positions)) {
        for (const [id, p] of Object.entries(e.positions)) {
          if (estObjet(p)) {
            positions[id] = {
              x: nombre(p.x, 0),
              y: nombre(p.y, 0),
              orientation: typeof p.orientation === 'number' ? p.orientation : undefined,
            }
          }
        }
      }
      return {
        id: texte(e.id) || `etape-${Math.random().toString(36).slice(2, 10)}`,
        titre: texte(e.titre, 'Etape'),
        consigne: texte(e.consigne),
        positions,
        // Une fleche liee a un jeton ne stocke plus ses extremites : elles se
        // deduisent des positions. Un fichier ancien les porte encore, elles
        // sont relues telles quelles puis reprises par migrerSchema().
        fleches: liste(e.fleches)
          .filter(estObjet)
          .map((f) => ({
            id: texte(f.id) || `fleche-${Math.random().toString(36).slice(2, 10)}`,
            type: texte(f.type, 'course') as never,
            jetonId: f.jetonId ? texte(f.jetonId) : undefined,
            cible: f.cible ? texte(f.cible) : undefined,
            depart: estObjet(f.depart)
              ? { x: nombre(f.depart.x, 0), y: nombre(f.depart.y, 0) }
              : undefined,
            arrivee: estObjet(f.arrivee)
              ? { x: nombre(f.arrivee.x, 0), y: nombre(f.arrivee.y, 0) }
              : undefined,
            courbure: estObjet(f.courbure)
              ? { x: nombre(f.courbure.x, 0), y: nombre(f.courbure.y, 0) }
              : undefined,
          })),
      }
    })

  const exercice: Exercice = {
    ...modele,
    id: texte(brut.id) || modele.id,
    creeLe: texte(brut.creeLe, modele.creeLe),
    modifieLe: texte(brut.modifieLe, modele.modifieLe),
    titre: texte(brut.titre, modele.titre),
    categorie: texte(brut.categorie, modele.categorie) as Exercice['categorie'],
    duree: Math.max(0, nombre(brut.duree, modele.duree)),
    nombreJoueurs: Math.max(0, nombre(brut.nombreJoueurs, modele.nombreJoueurs)),
    nombreGardiens: Math.max(0, nombre(brut.nombreGardiens, modele.nombreGardiens)),
    difficulte: ([1, 2, 3].includes(nombre(brut.difficulte, 2))
      ? nombre(brut.difficulte, 2)
      : 2) as Exercice['difficulte'],
    materiel: liste(brut.materiel).filter((m): m is string => typeof m === 'string'),
    objectifs: texte(brut.objectifs),
    formeIntervention: texte(brut.formeIntervention),
    misePlace: texte(brut.misePlace),
    // Reprise des fichiers de version 1 : « description » et « variantes » sont
    // devenus « fonctionnement » et « evolution ».
    fonctionnement: texte(brut.fonctionnement, texte(brut.description)),
    regulation: texte(brut.regulation),
    pointsCles: texte(brut.pointsCles),
    evolution: texte(brut.evolution, texte(brut.variantes)),
    // Champs apparus apres la premiere version du format : un fichier ancien
    // n'en contient pas, on retombe sur les valeurs par defaut.
    formatGardiens: (['sans', 'avec-joueurs', 'gardiens-seuls'].includes(texte(brut.formatGardiens))
      ? texte(brut.formatGardiens)
      : 'avec-joueurs') as Exercice['formatGardiens'],
    enParallele: brut.enParallele === true,
    // Lien vers la fiche fournie d'origine, s'il en vient. Cette lecture est
    // une LISTE BLANCHE : un champ absent d'ici est efface a chaque relecture,
    // meme s'il est present dans le fichier. Tout nouveau champ d'Exercice doit
    // donc etre ajoute ici, sous peine de disparaitre sans bruit.
    refModele: brut.refModele ? texte(brut.refModele) : undefined,
    evaluation: lireEvaluation(brut.evaluation),
    deroule: lireDeroule(brut.deroule),
    schema: migrerSchema({
      vue: (['demi', 'complet', 'zone'].includes(texte(schemaBrut.vue))
        ? texte(schemaBrut.vue)
        : 'demi') as Exercice['schema']['vue'],
      jetons,
      etapes: etapes.length > 0 ? etapes : modele.schema.etapes,
    }),
  }
  return exercice
}

/**
 * Releve du terrain. Absent tant que la seance n a pas ete menee : on ne
 * fabrique pas un deroule vide, qui ferait croire a un exercice non fait
 * alors qu il n a simplement jamais ete question de le mener.
 */
function lireDeroule(brut: unknown): Deroule | undefined {
  if (!estObjet(brut)) return undefined
  const fait = brut.fait === true
  const mesure = Math.round(nombre(brut.dureeReelle, 0))
  return { fait, dureeReelle: mesure > 0 ? mesure : undefined }
}

function lireEvaluation(brut: unknown): Evaluation {
  const defaut = nouvelleEvaluation()
  if (!estObjet(brut)) return defaut
  const note = Math.round(nombre(brut.note, 0))
  return {
    note: (note >= 0 && note <= 5 ? note : 0) as Evaluation['note'],
    commentaire: texte(brut.commentaire),
    nombreUtilisations: Math.max(0, Math.round(nombre(brut.nombreUtilisations, 0))),
    derniereUtilisation: texte(brut.derniereUtilisation),
  }
}
