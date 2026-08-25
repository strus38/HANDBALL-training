/** Creation des objets du modele avec leurs valeurs par defaut. */

import { AUCUNE_EQUIPE, type MonEquipe } from './equipe'
import { calerSurLePlanning, dateProchaineSeance } from './planning'
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

/**
 * Date lisible : « mardi 25 août 2026 ».
 *
 * Rangee ici, aupres de dateDuJour, et non dans le resume : le titre par
 * defaut d'une seance s'en sert, et la fabrique ne peut pas dependre du
 * resume, qui depend deja d'elle.
 */
export function dateEnToutesLettres(iso: string): string {
  const [annee, mois, jour] = iso.split('-').map(Number)
  if (!annee || !mois || !jour) return iso
  const jours = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const moisNoms = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ]
  const date = new Date(annee, mois - 1, jour)
  return `${jours[date.getDay()]} ${jour} ${moisNoms[mois - 1]} ${annee}`
}

/**
 * Titre par defaut d'une seance : sa date, « Mardi 1 septembre 2026 ».
 *
 * « Nouvelle seance » ne disait rien, et le restait : personne ne renomme
 * trente seances a la main. La liste finissait par aligner trente lignes
 * identiques, ou seule la date en petits caracteres distinguait le mardi du
 * vendredi. La date EST le nom d'une seance d'entrainement.
 */
export function titreParDefaut(date: string): string {
  const lettres = dateEnToutesLettres(date)
  return lettres.charAt(0).toUpperCase() + lettres.slice(1)
}

/**
 * Vrai tant que le titre est celui que l'application a pose toute seule.
 *
 * Sert a savoir ce qu'on a le droit de reecrire : un titre automatique suit sa
 * date, un titre ecrit par l'entraineur — « Reprise apres les vacances » — ne
 * bouge jamais. C'est la seule maniere de rendre le titre automatique sans
 * risquer d'effacer les mots de quelqu'un.
 */
export function titreAutomatique(seance: { titre: string; date: string }): boolean {
  return seance.titre === titreParDefaut(seance.date)
}

/** Deplace une seance a une autre date, en emmenant son titre s'il est automatique. */
export function redater(seance: Seance, date: string): Seance {
  return {
    ...seance,
    date,
    titre: titreAutomatique(seance) ? titreParDefaut(date) : seance.titre,
  }
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
    // Un demi-terrain : l'espace de la grande majorite des situations, et la
    // vue sur laquelle un schema neuf s'ouvre.
    espace: 'demi',
    enParallele: false,
    evaluation: nouvelleEvaluation(),
    schema: nouveauSchema(),
    creeLe: date,
    modifieLe: date,
  }
}

/**
 * Nouvelle seance, pre-remplie avec l'equipe de l'entraineur et son creneau.
 *
 * L'equipe est une preference, passee ici plutot que lue depuis le stockage :
 * la fabrique reste pure, et les tests n'ont pas besoin d'un depot pour
 * fabriquer une seance.
 *
 * La date n'est plus celle du jour mais celle du PROCHAIN ENTRAINEMENT a
 * preparer — un mercredi, une seance de moins de 13 se date au vendredi. On
 * prepare une seance a venir, jamais celle d'hier.
 *
 * Les seances DEJA ECRITES entrent dans le calcul : preparer trois seances
 * d'affilee un dimanche soir doit donner mardi, vendredi, mardi, et non trois
 * fois le meme mardi. D'ou la liste passee ici — vide par defaut, ce qui
 * ramene au simple prochain creneau.
 *
 * Faute de planning pour l'equipe, on retombe sur aujourd'hui, comme avant.
 */
export function nouvelleSeance(
  titre?: string,
  mienne: MonEquipe = AUCUNE_EQUIPE,
  existantes: Seance[] = [],
): Seance {
  const horodatage = maintenant()
  const date = dateProchaineSeance(mienne.equipe, existantes, dateDuJour()) || dateDuJour()
  return calerSurLePlanning({
    id: nouvelId(),
    // Sans titre donne, c'est la date qui nomme la seance.
    titre: titre ?? titreParDefaut(date),
    date,
    equipe: mienne.equipe,
    categorieAge: mienne.categorieAge,
    objectifSeance: '',
    effectifJoueurs: 0,
    effectifGardiens: 0,
    espaceDisponible: '',
    retour: '',
    retourEcritLe: '',
    exercices: [],
    creeLe: horodatage,
    modifieLe: horodatage,
  })
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
