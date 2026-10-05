/**
 * Le resume que publie le tableau de bord d'un club, tel que l'ecran « Tableau de bord » l'affiche.
 *
 * Le tableau de bord suit l'equipe semaine apres semaine : classements, feuilles de match,
 * chances de qualification, reperage des adversaires. Il publie en clair tout ce qui ne nomme
 * aucun joueur — les noms restent chiffres chez lui — et l'application le lit sans phrase. Les
 * joueurs adverses a surveiller n'y figurent que par leur numero.
 *
 * Le fichier vient d'un site : il est relu prudemment, et un champ manquant ne fait que vider la
 * partie de l'ecran qui en depend.
 */

export class ErreurResume extends Error {}

export interface MatchResume {
  journee: number | null
  /** Match de coupe : son nom et son tour (« 1ER TOUR ») ; il n'a pas de journee. */
  coupe?: string | null
  tour?: string | null
  date: string | null
  provisoire?: boolean
  adversaire: string
  domicile: boolean
  p_victoire?: number | null
  enjeu?: number | null
  cle?: boolean
  rang_adv?: number | null
  salle?: { nom: string; ville?: string | null } | null
}

export interface LigneClassement {
  rang: number
  equipe: string
  pts: number
  j: number
  v: number
  n: number
  d: number
  bp: number
  bc: number
  diff: number
  forme: string[]
}

export interface EquipeResume {
  equipe: string
  j: number
  bp_moy: number | null
  bc_moy: number | null
  forme: string[]
  deux_min_moy: number | null
  jaunes_moy: number | null
  rouges: number | null
  arrets_pct: number | null
  buteurs: { num: number | null; buts: number; m: number; tirs: number | null; reussite: number | null; pen: number }[]
  gardiens: { num: number | null; m: number; pct: number | null; estime: boolean }[]
  passe: {
    saison: string
    j: number
    v: number
    n: number
    d: number
    bp_moy: number
    bc_moy: number
    rangs: { poule: string; rang: number | null; equipes: number }[]
    face_a_face: { date: string | null; dom: boolean; score: string; res: string }[]
    continuite: { deja: number; sur: number } | null
  } | null
}

export interface ResumeTableau {
  genere: string
  club: string
  club_court: string
  saison: string
  feuilles: number
  prochain: MatchResume | null
  adversaire: EquipeResume | null
  objectif: {
    statut: string
    poule: string
    cible: number
    rang: number
    proba: number | null
    rangs?: number[]
    restants: number
    matchs: MatchResume[]
  } | null
  poules: Record<string, LigneClassement[]>
  resultats: { poule: string; journee: number | null; date: string | null; dom: string; ext: string; sd: number; se: number }[]
  axes: { titre: string; libelle: string; constat: string }[]
}

const estObjet = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)

/** Relit le resume : refuse ce qui n'en est pas un, complete ce qui manque par du vide. */
export function lireResume(texte: string): ResumeTableau {
  let brut: unknown
  try {
    brut = JSON.parse(texte)
  } catch {
    throw new ErreurResume('Le tableau de bord a renvoyé un fichier illisible.')
  }
  if (!estObjet(brut) || brut.v !== 1 || !estObjet(brut.poules)) {
    throw new ErreurResume('Le tableau de bord publie un format que cette version ne sait pas lire.')
  }
  const liste = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
  return {
    genere: String(brut.genere ?? ''),
    club: String(brut.club ?? ''),
    club_court: String(brut.club_court ?? ''),
    saison: String(brut.saison ?? ''),
    feuilles: Number(brut.feuilles ?? 0),
    prochain: estObjet(brut.prochain) ? (brut.prochain as unknown as MatchResume) : null,
    adversaire: estObjet(brut.adversaire) ? (brut.adversaire as unknown as EquipeResume) : null,
    objectif: estObjet(brut.objectif)
      ? { ...(brut.objectif as unknown as ResumeTableau['objectif'] & object), matchs: liste<MatchResume>(brut.objectif.matchs) }
      : null,
    poules: Object.fromEntries(
      Object.entries(brut.poules).map(([p, lignes]) => [p, liste<LigneClassement>(lignes)]),
    ),
    resultats: liste(brut.resultats),
    axes: liste(brut.axes),
  }
}

/** 1 -> « 1er », 3 -> « 3e ». */
export const ordinal = (n: number | null | undefined): string => (n == null ? '–' : n === 1 ? '1er' : `${n}e`)

/** L'objectif de la phase en clair : « finir 1er » ou « finir dans les 3 premiers ». */
export const libelleObjectif = (cible: number | null | undefined): string =>
  (cible ?? 1) > 1 ? `finir dans les ${cible} premiers` : 'finir 1er'

/** « P16M DIV- SABLONS RHODIA SAINT MAURICE » -> « Sablons Rhodia » : ce qui distingue l'equipe. */
export function nomCourtEquipe(nom: string): string {
  const mots = nom
    .replace(/^P\d+[MF]?\s*(DIV\d*)?\s*-?\s*/i, '')
    .split(/\s+/)
    .filter((m) => !/^(HB|HBC|HANDBALL|CLUB|RTE|ENTENTE|-)$/i.test(m))
  const court = (mots.slice(0, 2).join(' ') || nom).toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase())
  // le numero d'equipe distingue l'equipe 2 de l'equipe 1 du meme club : on le garde
  const numero = /[\s-](\d)\s*$/.exec(nom)?.[1]
  return numero && !court.endsWith(numero) ? `${court} ${numero}` : court
}

/** « J3 », ou pour un match de coupe « Coupe de France · 1er tour » (court : « Coupe »). */
export function manche(m: Pick<MatchResume, 'journee' | 'coupe' | 'tour'>, court = false): string {
  if (!m.coupe) return `J${m.journee ?? '?'}`
  if (court) return 'Coupe'
  const tour = (m.tour ?? '').toLowerCase().replace(/(\d+)\s*(?:eme|ème)\b/, '$1e')
  return tour ? `${m.coupe} · ${tour}` : m.coupe
}
