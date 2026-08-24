/**
 * Resume d'une seance et duplication.
 *
 * Tout ici est du calcul pur, sans React : ce sont les chiffres qu'un
 * entraineur lit d'un coup d'oeil avant de choisir une seance a rejouer.
 */

import { clonerExercice, dateDuJour, nouvelId } from './fabrique'
import {
  dureeTotale,
  manqueEffectif,
  nouvelleEvaluation,
  type Categorie,
  type Seance,
} from './types'

export interface PartCategorie {
  categorie: Categorie
  nombre: number
  /** Minutes cumulees, hors exercices menes en parallele. */
  minutes: number
}

export interface ResumeSeance {
  nombreExercices: number
  /** Duree de la seance, exercices en parallele exclus. */
  minutes: number
  nombreEnParallele: number
  /** Repartition par categorie, de la plus longue a la plus courte. */
  repartition: PartCategorie[]
  /** Note moyenne des exercices evalues, ou undefined si aucun ne l'est. */
  noteMoyenne?: number
  nombreEvalues: number
  /** Exercices demandant plus de monde que l'effectif annonce. */
  nombreIncompatibles: number
  /** Materiel de toute la seance, sans doublon, en ordre alphabetique. */
  materiel: string[]
  /** Vrai si au moins un exercice mobilise les gardiens a part. */
  travailGardiens: boolean
}

export function resumerSeance(seance: Seance): ResumeSeance {
  const parCategorie = new Map<Categorie, PartCategorie>()
  const materiel = new Set<string>()
  let sommeNotes = 0
  let nombreEvalues = 0
  let nombreIncompatibles = 0

  for (const exercice of seance.exercices) {
    const part = parCategorie.get(exercice.categorie) ?? {
      categorie: exercice.categorie,
      nombre: 0,
      minutes: 0,
    }
    part.nombre += 1
    // Un exercice en parallele n'allonge pas la seance : sa duree ne compte pas
    // dans la repartition non plus, sinon les totaux ne coincideraient plus.
    if (!exercice.enParallele) part.minutes += exercice.duree
    parCategorie.set(exercice.categorie, part)

    for (const article of exercice.materiel) {
      const propre = article.trim()
      if (propre) materiel.add(propre)
    }

    if (exercice.evaluation.note > 0) {
      sommeNotes += exercice.evaluation.note
      nombreEvalues += 1
    }
    if (manqueEffectif(exercice, seance)) nombreIncompatibles += 1
  }

  return {
    nombreExercices: seance.exercices.length,
    minutes: dureeTotale(seance),
    nombreEnParallele: seance.exercices.filter((e) => e.enParallele).length,
    repartition: [...parCategorie.values()].sort(
      (a, b) => b.minutes - a.minutes || b.nombre - a.nombre,
    ),
    noteMoyenne: nombreEvalues > 0 ? sommeNotes / nombreEvalues : undefined,
    nombreEvalues,
    nombreIncompatibles,
    materiel: [...materiel].sort((a, b) => a.localeCompare(b, 'fr')),
    travailGardiens: seance.exercices.some((e) => e.formatGardiens === 'gardiens-seuls'),
  }
}

/** Ce que l'entraineur peut changer en dupliquant une seance. */
export interface OptionsDuplication {
  titre?: string
  date?: string
  equipe?: string
  categorieAge?: string
  effectifJoueurs?: number
  effectifGardiens?: number
  objectifSeance?: string
  /**
   * Efface les notes et les compteurs d'utilisation de la copie.
   *
   * Par defaut ils sont conserves : la note porte sur l'exercice lui-meme, et
   * l'avis de l'entraineur reste valable d'une seance a l'autre.
   */
  reinitialiserEvaluations?: boolean
}

/**
 * Copie complete d'une seance, avec de nouveaux identifiants partout.
 *
 * La copie est totalement independante : modifier l'une ne touche jamais
 * l'autre, et la seance d'origine garde la version avec laquelle elle a ete
 * jouee.
 */
export function dupliquerSeance(seance: Seance, options: OptionsDuplication = {}): Seance {
  const maintenant = new Date().toISOString()
  return {
    ...seance,
    id: nouvelId(),
    titre: options.titre ?? `${seance.titre} (copie)`,
    date: options.date ?? dateDuJour(),
    equipe: options.equipe ?? seance.equipe,
    categorieAge: options.categorieAge ?? seance.categorieAge,
    objectifSeance: options.objectifSeance ?? seance.objectifSeance,
    effectifJoueurs: options.effectifJoueurs ?? seance.effectifJoueurs,
    effectifGardiens: options.effectifGardiens ?? seance.effectifGardiens,
    exercices: seance.exercices.map((exercice) => {
      const copie = clonerExercice(exercice, '')
      return options.reinitialiserEvaluations
        ? { ...copie, evaluation: nouvelleEvaluation() }
        : copie
    }),
    creeLe: maintenant,
    modifieLe: maintenant,
  }
}

/** Date lisible : « mardi 25 aout 2026 ». */
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

/** Distance en jours entre une date de seance et aujourd'hui. */
export function ecartEnJours(iso: string, aujourdHui = dateDuJour()): number {
  const enJours = (valeur: string) => {
    const [a, m, j] = valeur.split('-').map(Number)
    return Math.floor(Date.UTC(a, (m || 1) - 1, j || 1) / 86_400_000)
  }
  return enJours(iso) - enJours(aujourdHui)
}

/** Formule courte situant la seance dans le temps. */
export function situerDansLeTemps(iso: string, aujourdHui = dateDuJour()): string {
  const ecart = ecartEnJours(iso, aujourdHui)
  if (ecart === 0) return "aujourd'hui"
  if (ecart === 1) return 'demain'
  if (ecart === -1) return 'hier'
  if (ecart > 1 && ecart <= 7) return `dans ${ecart} jours`
  if (ecart < -1 && ecart >= -7) return `il y a ${-ecart} jours`
  if (ecart > 7) return `dans ${Math.round(ecart / 7)} semaines`
  return `il y a ${Math.round(-ecart / 7)} semaines`
}
