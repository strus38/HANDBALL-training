/**
 * Bilan d'une saison : ce qui a reellement ete travaille, et dans quelles
 * proportions.
 *
 * Un entraineur prepare ses seances une par une et perd de vue l'ensemble. Au
 * bout de trois mois, la question n'est plus « que faire mardi » mais « ai-je
 * assez travaille la defense depuis septembre ». Ce module repond a celle-la.
 *
 * Les exercices sont regroupes par TITRE et non par identifiant : dupliquer une
 * seance cree des copies independantes, qui doivent malgre tout compter comme
 * le meme exercice dans un bilan.
 */

import { dateDuJour } from './fabrique'
import { resumerSeance, type PartCategorie } from './resume'
import { LIBELLES_CATEGORIE, type Categorie, type Seance } from './types'

export interface Periode {
  /** Date ISO incluse. */
  debut: string
  /** Date ISO incluse. */
  fin: string
  libelle: string
}

export interface UsageExercice {
  titre: string
  categorie: Categorie
  /** Nombre de seances qui le contiennent sur la periode. */
  seances: number
  minutes: number
  /** Moyenne des notes attribuees, si l'exercice a ete evalue. */
  note?: number
  derniereUtilisation?: string
}

export interface MoisTravaille {
  /** Cle ISO « AAAA-MM », pour trier. */
  cle: string
  libelle: string
  seances: number
  minutes: number
}

export interface Bilan {
  periode: Periode
  nombreSeances: number
  minutes: number
  nombreExercices: number
  repartition: PartCategorie[]
  parMois: MoisTravaille[]
  /** Les exercices les plus programmes, du plus frequent au moins frequent. */
  lesPlusUtilises: UsageExercice[]
  /** Exercices notes 1 ou 2 mais tout de meme programmes : a revoir. */
  aRevoir: UsageExercice[]
  /** Categories jamais abordees sur la periode. */
  categoriesAbsentes: Categorie[]
  /** Seances comportant un travail specifique des gardiens. */
  seancesAvecGardiens: number
  moyenneExercicesParSeance: number
  moyenneMinutesParSeance: number
}

const MOIS = [
  'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'aout', 'septembre', 'octobre', 'novembre', 'decembre',
]

/**
 * Saison sportive contenant une date donnee.
 *
 * En France une saison de handball va de septembre a aout : une seance de juin
 * appartient a la saison commencee en septembre precedent.
 */
export function saisonDe(date: string = dateDuJour()): Periode {
  const [annee, mois] = date.split('-').map(Number)
  const debut = mois >= 9 ? annee : annee - 1
  return {
    debut: `${debut}-09-01`,
    fin: `${debut + 1}-08-31`,
    libelle: `Saison ${debut}-${debut + 1}`,
  }
}

/** Periode couvrant toutes les seances enregistrees. */
export function toutesLesDates(seances: Seance[]): Periode {
  if (seances.length === 0) {
    const jour = dateDuJour()
    return { debut: jour, fin: jour, libelle: 'Tout l historique' }
  }
  const dates = seances.map((s) => s.date).sort()
  return { debut: dates[0], fin: dates[dates.length - 1], libelle: 'Tout l historique' }
}

const cleTitre = (titre: string) =>
  titre.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '') || 'sans titre'

export function calculerBilan(seances: Seance[], periode: Periode): Bilan {
  const retenues = seances.filter((s) => s.date >= periode.debut && s.date <= periode.fin)

  const parCategorie = new Map<Categorie, PartCategorie>()
  const parExercice = new Map<string, UsageExercice & { sommeNotes: number; evalues: number }>()
  const parMois = new Map<string, MoisTravaille>()
  let minutes = 0
  let nombreExercices = 0
  let seancesAvecGardiens = 0

  for (const seance of retenues) {
    const resume = resumerSeance(seance)
    minutes += resume.minutes
    nombreExercices += resume.nombreExercices
    if (resume.travailGardiens) seancesAvecGardiens += 1

    const cleMois = seance.date.slice(0, 7)
    const mois = parMois.get(cleMois) ?? {
      cle: cleMois,
      libelle: libelleMois(cleMois),
      seances: 0,
      minutes: 0,
    }
    mois.seances += 1
    mois.minutes += resume.minutes
    parMois.set(cleMois, mois)

    for (const part of resume.repartition) {
      const cumul = parCategorie.get(part.categorie) ?? {
        categorie: part.categorie,
        nombre: 0,
        minutes: 0,
      }
      cumul.nombre += part.nombre
      cumul.minutes += part.minutes
      parCategorie.set(part.categorie, cumul)
    }

    for (const exercice of seance.exercices) {
      const cle = cleTitre(exercice.titre)
      const usage = parExercice.get(cle) ?? {
        titre: exercice.titre.trim() || 'Sans titre',
        categorie: exercice.categorie,
        seances: 0,
        minutes: 0,
        sommeNotes: 0,
        evalues: 0,
      }
      usage.seances += 1
      if (!exercice.enParallele) usage.minutes += exercice.duree
      if (exercice.evaluation.note > 0) {
        usage.sommeNotes += exercice.evaluation.note
        usage.evalues += 1
      }
      // On retient la date la plus recente, celle de la seance ou celle saisie
      // par l'entraineur apres coup.
      const candidates = [seance.date, exercice.evaluation.derniereUtilisation].filter(Boolean)
      const plusRecente = candidates.sort().pop()
      if (plusRecente && (!usage.derniereUtilisation || plusRecente > usage.derniereUtilisation)) {
        usage.derniereUtilisation = plusRecente
      }
      parExercice.set(cle, usage)
    }
  }

  const usages: UsageExercice[] = [...parExercice.values()].map((u) => ({
    titre: u.titre,
    categorie: u.categorie,
    seances: u.seances,
    minutes: u.minutes,
    note: u.evalues > 0 ? u.sommeNotes / u.evalues : undefined,
    derniereUtilisation: u.derniereUtilisation,
  }))

  const repartition = [...parCategorie.values()].sort(
    (a, b) => b.minutes - a.minutes || b.nombre - a.nombre,
  )

  return {
    periode,
    nombreSeances: retenues.length,
    minutes,
    nombreExercices,
    repartition,
    parMois: [...parMois.values()].sort((a, b) => a.cle.localeCompare(b.cle)),
    lesPlusUtilises: [...usages]
      .sort((a, b) => b.seances - a.seances || b.minutes - a.minutes)
      .slice(0, 8),
    // Un exercice mal note qu'on continue de programmer merite d'etre revu ou
    // remplace : c'est le seul signal vraiment actionnable du bilan.
    aRevoir: usages
      .filter((u) => u.note !== undefined && u.note <= 2)
      .sort((a, b) => (a.note ?? 0) - (b.note ?? 0) || b.seances - a.seances),
    categoriesAbsentes: (Object.keys(LIBELLES_CATEGORIE) as Categorie[]).filter(
      (categorie) => !parCategorie.has(categorie),
    ),
    seancesAvecGardiens,
    moyenneExercicesParSeance: retenues.length > 0 ? nombreExercices / retenues.length : 0,
    moyenneMinutesParSeance: retenues.length > 0 ? minutes / retenues.length : 0,
  }
}

function libelleMois(cle: string): string {
  const [annee, mois] = cle.split('-').map(Number)
  return `${MOIS[(mois || 1) - 1]} ${annee}`
}

/** Part d'une categorie dans le temps total, en pourcentage arrondi. */
export function pourcentage(part: PartCategorie, total: number): number {
  return total > 0 ? Math.round((part.minutes / total) * 100) : 0
}
