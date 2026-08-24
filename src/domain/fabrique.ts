/** Creation des objets du modele avec leurs valeurs par defaut. */

import { nouvelleEvaluation, type Etape, type Exercice, type Seance, type Schema } from './types'

/** Identifiant unique, sans dependance externe et sans acces reseau. */
export function nouvelId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function maintenant(): string {
  return new Date().toISOString()
}

/** Date du jour au format AAAA-MM-JJ, en heure locale. */
export function dateDuJour(): string {
  const d = new Date()
  const mois = String(d.getMonth() + 1).padStart(2, '0')
  const jour = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mois}-${jour}`
}

export function nouvelleEtape(titre = 'Mise en place'): Etape {
  return { id: nouvelId(), titre, consigne: '', positions: {}, fleches: [] }
}

export function nouveauSchema(): Schema {
  return { vue: 'demi', jetons: [], etapes: [nouvelleEtape()] }
}

export function nouvelExercice(titre = 'Nouvel exercice'): Exercice {
  const date = maintenant()
  return {
    id: nouvelId(),
    titre,
    categorie: 'attaque',
    duree: 15,
    nombreJoueurs: 12,
    nombreGardiens: 1,
    difficulte: 2,
    materiel: [],
    objectifs: '',
    formeIntervention: '',
    misePlace: '',
    fonctionnement: '',
    regulation: '',
    pointsCles: '',
    evolution: '',
    formatGardiens: 'avec-joueurs',
    enParallele: false,
    evaluation: nouvelleEvaluation(),
    schema: nouveauSchema(),
    creeLe: date,
    modifieLe: date,
  }
}

export function nouvelleSeance(titre = 'Nouvelle séance'): Seance {
  const date = maintenant()
  return {
    id: nouvelId(),
    titre,
    date: dateDuJour(),
    equipe: '',
    categorieAge: '',
    objectifSeance: '',
    effectifJoueurs: 0,
    effectifGardiens: 0,
    exercices: [],
    creeLe: date,
    modifieLe: date,
  }
}

/** Copie d'un exercice avec de nouveaux identifiants (duplication, import). */
export function clonerExercice(exercice: Exercice, suffixeTitre = ' (copie)'): Exercice {
  const correspondanceJetons = new Map<string, string>()
  const jetons = exercice.schema.jetons.map((j) => {
    const id = nouvelId()
    correspondanceJetons.set(j.id, id)
    return { ...j, id }
  })
  const etapes = exercice.schema.etapes.map((etape) => {
    const positions: Record<string, { x: number; y: number }> = {}
    for (const [ancienId, position] of Object.entries(etape.positions)) {
      const nouveau = correspondanceJetons.get(ancienId)
      if (nouveau) positions[nouveau] = { ...position }
    }
    return {
      ...etape,
      id: nouvelId(),
      positions,
      fleches: etape.fleches.map((f) => ({
        ...f,
        id: nouvelId(),
        jetonId: f.jetonId ? correspondanceJetons.get(f.jetonId) : undefined,
        // La cible d'une passe designe elle aussi un jeton : sans ce report,
        // toute fiche ajoutee depuis la bibliotheque, importee ou dupliquee
        // perdait son receveur et se racontait « 1 passe a un joueur ».
        cible: f.cible ? correspondanceJetons.get(f.cible) : undefined,
      })),
    }
  })
  const date = maintenant()
  return {
    ...exercice,
    id: nouvelId(),
    titre: exercice.titre + suffixeTitre,
    materiel: [...exercice.materiel],
    // La note portait sur l'exercice d'origine : une copie destinee a etre
    // modifiee repart sans evaluation.
    evaluation: suffixeTitre ? nouvelleEvaluation() : { ...exercice.evaluation },
    schema: { ...exercice.schema, jetons, etapes },
    creeLe: date,
    modifieLe: date,
  }
}
