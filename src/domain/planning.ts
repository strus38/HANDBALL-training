/**
 * Ce que l'application sait lire dans le planning du club.
 *
 * Le planning lui-meme — les equipes et leurs creneaux — n'est PAS ici : c'est
 * une donnee de club, elle vit dans son profil (`clubs/<identifiant>/planning.ts`).
 * Ce fichier n'en contient que la mecanique, la meme pour tous les clubs.
 *
 * Trois choses se lisent dans un planning, qui n'existaient nulle part
 * ailleurs :
 *
 * - la DUREE du creneau. L'application savait additionner les exercices, elle
 *   ne savait pas combien de temps on a. Un plan de 95 minutes pose sur un
 *   creneau de 75 ne se decouvrait qu'au gymnase, en sautant le dernier
 *   atelier.
 * - le PARTAGE. Un creneau porte parfois deux equipes, chacune menee par son
 *   entraineur : le gymnase est alors coupe en deux, et un exercice prevu sur
 *   terrain complet n'y tient pas.
 * - le RYTHME. Une equipe s'entraine deux ou trois fois par semaine, toujours
 *   les memes jours. La date de la prochaine seance cesse d'etre une question.
 *
 * Le planning ne DECIDE rien : il pre-remplit. L'entraineur garde la main sur
 * chaque champ de la seance, exactement comme pour « Mon equipe ».
 */

import { EQUIPES_CLUB, PLANNING } from '@club/planning'
import type { Espace, Seance } from './types'

// Les deux tableaux appartiennent au club : ils sont fournis par son profil et
// simplement remis a disposition ici, la ou tout le code les cherche deja.
export { EQUIPES_CLUB, PLANNING }

// ---------------------------------------------------------------- Equipes

/** Une equipe du club, telle qu'elle s'ecrit sur les feuilles imprimees. */
export interface EquipeClub {
  /** Nom affiche, et cle de rapprochement avec le champ « equipe » d'une seance. */
  nom: string
  /**
   * Categorie d'age.
   *
   * DEDUITE du nom : elle ne figure pas sur le planning, qui ne donne que des
   * horaires. Les tranches suivent l'usage federal ; le club qui compte
   * autrement n'a que cette colonne a corriger.
   */
  categorieAge: string
}


// ---------------------------------------------------------------- Creneaux

/**
 * Un creneau du planning hebdomadaire.
 *
 * Homonyme volontaire du Creneau de deroulement.ts, qui decoupe une seance en
 * cours ; celui-ci decoupe la SEMAINE. D'ou le suffixe : les deux se croisent
 * le soir ou l'on mene la seance.
 */
export interface CreneauClub {
  /** Jour de la semaine, convention JavaScript : 1 = lundi ... 6 = samedi. */
  jour: number
  /** Heure de debut, « 17:15 ». */
  debut: string
  /** Heure de fin, « 18:45 ». */
  fin: string
  /**
   * Les equipes presentes sur ce creneau.
   *
   * Deux equipes signifient deux entraineurs, deux seances, un gymnase coupe
   * en deux — et non un groupe unique. C'est cette difference qui fait passer
   * l'espace disponible de « complet » a « demi ».
   */
  equipes: string[]
}


export const NOMS_JOUR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

// ---------------------------------------------------------------- Lectures

/** L'equipe du club portant ce nom, si le club en compte une. */
export function equipeDuClub(nom: string): EquipeClub | undefined {
  return EQUIPES_CLUB.find((e) => e.nom === nom)
}

/**
 * Les creneaux d'une equipe, dans l'ordre de la semaine.
 *
 * Une equipe inconnue du planning — un nom saisi a la main, une selection, une
 * equipe d'un autre club — n'en a aucun. Tout ce qui suit se tait alors, au
 * lieu de deviner : c'est la discipline deja suivie pour l'effectif et
 * l'espace laisses vides, qui ne declenchent aucune alerte.
 */
export function creneauxDe(nom: string): CreneauClub[] {
  if (!nom) return []
  return PLANNING.filter((c) => c.equipes.includes(nom))
}

/** Minutes entre le debut et la fin du creneau. */
export function dureeCreneau(creneau: CreneauClub): number {
  return enMinutes(creneau.fin) - enMinutes(creneau.debut)
}

/** Vrai quand deux equipes se partagent le sol sur ce creneau. */
export function creneauPartage(creneau: CreneauClub): boolean {
  return creneau.equipes.length > 1
}

/** Les autres equipes presentes sur le creneau, vues depuis l'une d'elles. */
export function voisinesDe(creneau: CreneauClub, nom: string): string[] {
  return creneau.equipes.filter((e) => e !== nom)
}

/**
 * L'espace qu'une equipe a reellement sur ce creneau.
 *
 * Seule ou a deux : c'est toute la deduction, et elle suffit. Le club qui
 * partagerait le gymnase avec une autre section corrigerait ici, ou dans le
 * champ de la seance, qui reste modifiable.
 */
export function espaceCreneau(creneau: CreneauClub): Espace {
  return creneauPartage(creneau) ? 'demi' : 'complet'
}

/**
 * Le groupe qui arrive derriere, s'il y en a un.
 *
 * Les creneaux se touchent sans trou : deborder, ce n'est pas prendre cinq
 * minutes de plus, c'est prendre le terrain des suivants. Trois creneaux n'ont
 * personne derriere — le dernier de chaque soiree — et la, le depassement ne
 * lese personne.
 */
export function creneauSuivant(creneau: CreneauClub): CreneauClub | undefined {
  return PLANNING.filter((c) => c.jour === creneau.jour && c.debut >= creneau.fin).sort((a, b) =>
    a.debut.localeCompare(b.debut),
  )[0]
}

/** « mardi 17h15 – 18h45 ». */
export function libelleCreneau(creneau: CreneauClub): string {
  return `${NOMS_JOUR[creneau.jour]} ${enHeure(creneau.debut)} – ${enHeure(creneau.fin)}`
}

/** Le creneau de cette equipe le jour de cette date, s'il y en a un. */
export function creneauDuJour(nom: string, dateISO: string): CreneauClub | undefined {
  const jour = jourDeLaSemaine(dateISO)
  if (jour === undefined) return undefined
  return creneauxDe(nom).find((c) => c.jour === jour)
}

/**
 * La date du prochain entrainement de l'equipe, a partir d'un jour donne.
 *
 * Le jour donne COMPTE : on prepare souvent la seance du soir meme, et la
 * renvoyer a la semaine suivante serait absurde. La recherche s'arrete au bout
 * de deux semaines — au-dela, c'est que l'equipe n'a pas de creneau, et mieux
 * vaut ne rien proposer qu'inventer une date.
 */
export function prochainEntrainement(nom: string, aPartirDe: string): string {
  const creneaux = creneauxDe(nom)
  if (creneaux.length === 0) return ''
  const depart = enDate(aPartirDe)
  if (!depart) return ''
  for (let decalage = 0; decalage < 14; decalage++) {
    const jour = new Date(depart.getFullYear(), depart.getMonth(), depart.getDate() + decalage)
    if (creneaux.some((c) => c.jour === jour.getDay())) return enISO(jour)
  }
  return ''
}

/**
 * La date que doit porter la prochaine seance a preparer.
 *
 * Deux reperes, et c'est le plus TARDIF qui gagne :
 *
 * - le calendrier — le prochain creneau a partir d'aujourd'hui ;
 * - le travail deja fait — le creneau qui SUIT la derniere seance ecrite pour
 *   cette equipe.
 *
 * Le second repere est celui qui manquait. Un entraineur prepare volontiers
 * deux ou trois seances d'affilee, un dimanche soir : sans lui, elles
 * naissaient toutes au meme mardi, et il fallait corriger la date a la main a
 * chaque fois — exactement la corvee que le planning devait supprimer.
 *
 * Une seance passee ne retient rien : si la derniere ecrite date de la semaine
 * derniere, c'est le calendrier qui commande, et la nouvelle seance tombe au
 * prochain entrainement. On ne repart jamais en arriere.
 *
 * Seules les seances de la MEME equipe comptent. Un depannage chez les seniors
 * ne doit pas decaler la preparation des moins de 13.
 */
export function dateProchaineSeance(equipe: string, seances: Seance[], aujourdHui: string): string {
  const derniere = seances
    .filter((s) => s.equipe === equipe && s.date)
    .map((s) => s.date)
    .sort()
    .pop()
  const depart = derniere && derniere >= aujourdHui ? lendemainDe(derniere) : aujourdHui
  return prochainEntrainement(equipe, depart)
}

/**
 * Le premier entrainement APRES cette date qui n'a pas encore de seance.
 *
 * Dupliquer proposait la meme date une semaine plus tard, sans regarder ce qui
 * existait deja. Un entraineur qui rejouait la seance du 4 septembre se
 * voyait proposer le 11 — le jour ou il avait deja prepare autre chose — et
 * devait corriger a la main a chaque fois.
 *
 * On avance donc de creneau en creneau jusqu'a en trouver un de libre. Les
 * TROUS comptent : si le 11 est pris et le 18 libre, c'est le 18 qui est
 * propose, et non la date qui suit la derniere seance ecrite. « La prochaine
 * seance non definie » veut bien dire la premiere place vide, pas la fin de la
 * file.
 *
 * La recherche s'arrete au bout d'une saison : au-dela, c'est que l'equipe n'a
 * pas de creneau, et mieux vaut ne rien proposer qu'inventer une date.
 */
export function prochaineDateLibre(equipe: string, seances: Seance[], apresLe: string): string {
  const prises = new Set(seances.filter((s) => s.equipe === equipe).map((s) => s.date))
  let jour = lendemainDe(apresLe)
  for (let essai = 0; essai < 60; essai++) {
    const creneau = prochainEntrainement(equipe, jour)
    if (!creneau) return ''
    if (!prises.has(creneau)) return creneau
    jour = lendemainDe(creneau)
  }
  return ''
}

// ---------------------------------------------------------------- Calage

/**
 * Reporte sur une seance ce que le planning sait de son soir : la duree du
 * creneau et l'espace disponible.
 *
 * Appele a la creation, et a chaque fois que la DATE change — un entrainement
 * deplace du mardi au vendredi ne dure plus 90 minutes mais 75, et la seance
 * afficherait sinon un creneau qui n'est plus le sien.
 *
 * Une equipe hors planning, ou un jour sans creneau, laisse la seance intacte :
 * le calage ajoute ce qu'il sait, il n'efface jamais ce qui a ete saisi a la
 * main. C'est ce qui rend l'automatisme sans danger — au pire il ne fait rien.
 */
export function calerSurLePlanning(seance: Seance): Seance {
  const creneau = creneauDuJour(seance.equipe, seance.date)
  if (!creneau) return seance
  return {
    ...seance,
    dureeCreneau: dureeCreneau(creneau),
    espaceDisponible: espaceCreneau(creneau),
  }
}

// ---------------------------------------------------------------- Outils

function enMinutes(heure: string): number {
  const [h, m] = heure.split(':').map(Number)
  return h * 60 + m
}

/** « 17:15 » devient « 17h15 », « 20:00 » devient « 20h ». */
function enHeure(heure: string): string {
  const [h, m] = heure.split(':')
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`
}

function enDate(iso: string): Date | undefined {
  const [annee, mois, jour] = iso.split('-').map(Number)
  if (!annee || !mois || !jour) return undefined
  return new Date(annee, mois - 1, jour)
}

function enISO(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

function jourDeLaSemaine(iso: string): number | undefined {
  return enDate(iso)?.getDay()
}

/** Le jour d'apres, en passant par une vraie date : fins de mois et annees bissextiles. */
function lendemainDe(iso: string): string {
  const date = enDate(iso)
  if (!date) return iso
  return enISO(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1))
}
