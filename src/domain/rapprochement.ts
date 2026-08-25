/**
 * Rapprocher des fiches qui arrivent de celles qui sont deja la.
 *
 * Importer un fichier AJOUTAIT, toujours. C'est la bonne regle par defaut —
 * rien ne doit disparaitre en silence — mais elle a un revers : reimporter un
 * cahier corrige, ou le meme fichier deux fois, laissait la bibliotheque pleine
 * de doublons que l'entraineur devait ensuite trier a la main.
 *
 * Le rapprochement se fait par le TITRE, et non par le contenu. Deux fiches de
 * meme titre sont la meme fiche aux yeux de l'entraineur, meme si un mot a
 * change entre deux versions du cahier — et c'est justement ce cas-la, le
 * cahier corrige, ou l'on veut remplacer plutot qu'accumuler. Rapprocher par
 * contenu ferait exactement l'inverse : la moindre virgule corrigee produirait
 * un doublon.
 *
 * Trois sorts possibles, et un seul appelle une decision :
 * - un titre inconnu : la fiche entre, sans rien demander ;
 * - un titre connu ET un contenu identique : il n'y a rien a faire ;
 * - un titre connu, un contenu different : c'est la seule vraie question.
 */

import type { Exercice } from './types'

/** Titre compare sans casse, sans accent, ni espaces superflus. */
export function cleTitre(titre: string): string {
  return titre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Ce qui fait le CONTENU d'une fiche.
 *
 * L'evaluation, le releve du terrain et les dates en sont exclus : ce sont les
 * annotations de l'entraineur, pas la fiche. Deux fiches identiques dont l'une
 * porte quatre etoiles restent identiques — sans quoi noter un exercice
 * suffirait a le faire passer pour different a la prochaine importation.
 */
export function signature(exercice: Exercice): string {
  return JSON.stringify([
    exercice.titre.trim(),
    exercice.categorie,
    exercice.duree,
    exercice.nombreJoueurs,
    exercice.nombreGardiens,
    exercice.difficulte,
    exercice.formatGardiens,
    exercice.espace,
    exercice.enParallele,
    [...exercice.materiel].sort(),
    exercice.objectifs.trim(),
    exercice.formeIntervention.trim(),
    exercice.misePlace.trim(),
    exercice.fonctionnement.trim(),
    exercice.regulation.trim(),
    exercice.pointsCles.trim(),
    exercice.evolution.trim(),
    exercice.schema.vue,
    exercice.schema.jetons.length,
    exercice.schema.etapes.length,
  ])
}

export interface Divergence {
  arrivante: Exercice
  existante: Exercice
}

export interface Rapprochement {
  /** Titres inconnus : elles entrent sans question. */
  nouvelles: Exercice[]
  /** Deja presentes a l'identique : il n'y a rien a faire. */
  identiques: Exercice[]
  /** Meme titre, contenu different : c'est la seule vraie question. */
  divergentes: Divergence[]
}

export function rapprocher(arrivantes: Exercice[], existantes: Exercice[]): Rapprochement {
  const parTitre = new Map<string, Exercice>()
  for (const e of existantes) {
    const k = cleTitre(e.titre)
    // Si la bibliotheque contient deja deux fois le meme titre, c'est la
    // premiere qui fait foi : remplacer les deux ferait disparaitre un travail
    // que l'entraineur a peut-etre volontairement dedouble.
    if (!parTitre.has(k)) parTitre.set(k, e)
  }

  const rapprochement: Rapprochement = { nouvelles: [], identiques: [], divergentes: [] }
  for (const arrivante of arrivantes) {
    const existante = parTitre.get(cleTitre(arrivante.titre))
    if (!existante) rapprochement.nouvelles.push(arrivante)
    else if (signature(existante) === signature(arrivante)) rapprochement.identiques.push(arrivante)
    else rapprochement.divergentes.push({ arrivante, existante })
  }
  return rapprochement
}

/** Ce que l'entraineur decide pour les fiches divergentes. */
export type ChoixImport = 'remplacer' | 'ajouter' | 'ignorer'

/**
 * Fiche remplacee : le texte de la nouvelle, les annotations de l'ancienne.
 *
 * C'est le point delicat du remplacement. Le cahier apporte le texte ; la note,
 * le commentaire et le compteur d'utilisations appartiennent a l'entraineur et
 * n'ont aucune raison de disparaitre parce qu'une virgule a change dans la
 * mise en place. L'identifiant est celui de l'existante, sans quoi les favoris
 * et l'historique poses dessus pointeraient dans le vide.
 */
export function fusionner(divergence: Divergence): Exercice {
  return {
    ...divergence.arrivante,
    id: divergence.existante.id,
    evaluation: divergence.existante.evaluation,
    deroule: divergence.existante.deroule,
    creeLe: divergence.existante.creeLe,
    modifieLe: new Date().toISOString(),
  }
}

/** Ce qui a reellement ete fait, pour le dire a l'entraineur. */
export interface BilanImport {
  ajoutees: number
  remplacees: number
  inchangees: number
  ignorees: number
}

/**
 * Le resume de l'importation, en une phrase.
 *
 * Une importation qui ne dit rien laisse l'entraineur verifier a la main ce
 * qu'elle a fait de ses fiches. Les postes vides sont tus : « 20 fiches
 * ajoutees » se lit mieux que « 20 ajoutees, 0 remplacees, 0 inchangees ».
 */
export function resumerImport(bilan: BilanImport): string {
  const morceaux: string[] = []
  const fiche = (n: number) => `${n} fiche${n > 1 ? 's' : ''}`
  if (bilan.ajoutees > 0) morceaux.push(`${fiche(bilan.ajoutees)} ajoutée${bilan.ajoutees > 1 ? 's' : ''}`)
  if (bilan.remplacees > 0)
    morceaux.push(`${fiche(bilan.remplacees)} remplacée${bilan.remplacees > 1 ? 's' : ''}`)
  if (bilan.inchangees > 0)
    morceaux.push(`${fiche(bilan.inchangees)} déjà présente${bilan.inchangees > 1 ? 's' : ''}`)
  if (bilan.ignorees > 0) morceaux.push(`${fiche(bilan.ignorees)} laissée${bilan.ignorees > 1 ? 's' : ''} de côté`)
  if (morceaux.length === 0) return 'Aucune fiche à importer.'
  if (morceaux.length === 1) return `${morceaux[0]}.`
  return `${morceaux.slice(0, -1).join(', ')} et ${morceaux[morceaux.length - 1]}.`
}
