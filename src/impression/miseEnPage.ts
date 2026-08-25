/**
 * Choix automatique de la mise en page d'une fiche imprimee.
 *
 * La contrainte est absolue : une fiche tient sur UNE page A4 paysage. Sous
 * cette contrainte, on cherche la disposition qui donne le plus grand schema
 * possible, parce que c'est lui qu'on regarde au bord du terrain.
 *
 * Le bon choix depend surtout de la forme du schema :
 *
 *   terrain complet   ratio ~1.9   tres large et plat
 *   demi-terrain      ratio ~1.0   carre
 *   zone 6m / 9m      ratio ~0.78  plus haut que large
 *
 * Un terrain complet coince dans une colonne de 47 % de la page devient
 * minuscule : il n'utilise qu'un tiers de la hauteur disponible. Place en
 * banniere sur toute la largeur, il double de surface. Un schema carre ou
 * vertical, lui, est parfaitement a son aise en colonne.
 *
 * Plutot que de trancher a la main, on chiffre : pour chaque disposition
 * candidate on calcule la surface reellement obtenue par le schema, on verifie
 * que le texte tient dans ce qui reste, et on garde la meilleure.
 *
 * Ce module ne connait ni React ni le DOM : il ne fait que du calcul, ce qui le
 * rend verifiable par des tests.
 */

import { cadrage } from '../terrain/geometrie'
import type { Exercice } from '../domain/types'

/** Zone imprimable en millimetres, entete et pied de page deduits. */
export const ZONE = { largeur: 279, hauteur: 168 }

/** Espace entre le schema et le texte. */
const ECART = 6

/** Hauteur de la legende sous chaque schema d'etape. */
const LEGENDE = 4.5

/** Tailles de police essayees, de la plus confortable a la plus serree. */
const POLICES = [9.2, 8.6, 8, 7.4, 6.9]

export type Disposition = 'cote-a-cote' | 'dessus'

export interface Grille {
  colonnes: number
  lignes: number
}

export interface MiseEnPage {
  disposition: Disposition
  /** Part de la largeur (cote-a-cote) ou de la hauteur (dessus) reservee au schema. */
  partSchema: number
  colonnesTexte: number
  policePt: number
  grille: Grille
  /** Surface reellement occupee par le schema, en cm2 : sert a comparer et a tester. */
  surfaceSchemaCm2: number
  /** Faux si meme la police la plus serree ne suffit pas : le texte sera dense. */
  texteTient: boolean
}

// --------------------------------------------------------------- Mesures

interface Boite {
  largeur: number
  hauteur: number
}

/** Plus grand rectangle de rapport donne tenant dans une boite. */
function ajuster(ratio: number, boite: Boite): Boite {
  const parLaLargeur = { largeur: boite.largeur, hauteur: boite.largeur / ratio }
  if (parLaLargeur.hauteur <= boite.hauteur) return parLaLargeur
  return { largeur: boite.hauteur * ratio, hauteur: boite.hauteur }
}

const mm = (pt: number) => pt * 0.3528

/**
 * Hauteur estimee du texte de la fiche, en millimetres.
 *
 * L'estimation est volontairement un peu pessimiste : mieux vaut choisir une
 * disposition un peu trop prudente qu'une fiche dont la derniere ligne part sur
 * une deuxieme page.
 */
export function hauteurTexte(
  exercice: Exercice,
  largeurColonne: number,
  policePt: number,
  colonnes: number,
): number {
  const hauteurLigne = mm(policePt) * 1.34
  const largeurCaractere = mm(policePt) * 0.475
  const parLigne = Math.max(12, Math.floor(largeurColonne / largeurCaractere))

  // Hauteur d'un titre de section, avec sa marge et son filet.
  const titre = mm(policePt * 0.9) * 1.3 + 3.4

  let total = 0
  const section = (contenu: string) => {
    if (!contenu.trim()) return
    total += titre
    for (const paragraphe of contenu.split('\n').filter((l) => l.trim())) {
      total += Math.max(1, Math.ceil(paragraphe.length / parLigne)) * hauteurLigne + 0.7
    }
  }

  section(exercice.objectifs)
  section(exercice.formeIntervention)
  section(exercice.misePlace)
  section(exercice.fonctionnement)

  if (exercice.schema.etapes.length > 1) {
    total += titre
    for (const etape of exercice.schema.etapes) {
      const ligne = `${etape.titre} — ${etape.consigne}`
      total += Math.max(1, Math.ceil(ligne.length / parLigne)) * hauteurLigne + 0.7
    }
  }

  section(exercice.regulation)
  section(exercice.pointsCles)
  section(exercice.evolution)

  // Ligne de materiel, toujours presente.
  total += hauteurLigne * 2 + 3

  // Les colonnes ne s'equilibrent jamais parfaitement : on prevoit une ligne
  // de plus par colonne supplementaire.
  return total / colonnes + (colonnes - 1) * hauteurLigne
}

/**
 * Rapport largeur / hauteur du bloc de schemas, une fois les etapes disposees
 * en grille. La legende de chaque ligne est comptee dans la hauteur.
 */
export function ratioGrille(ratioUnitaire: number, grille: Grille, hauteurUnitaire = 1): number {
  const largeur = grille.colonnes * ratioUnitaire * hauteurUnitaire
  const hauteur = grille.lignes * (hauteurUnitaire + LEGENDE / 40)
  return largeur / hauteur
}

/** Dispositions de grille envisageables pour un nombre d'etapes donne. */
export function grillesPossibles(nombreSchemas: number): Grille[] {
  switch (nombreSchemas) {
    case 1:
      return [{ colonnes: 1, lignes: 1 }]
    case 2:
      // Deux schemas larges gagnent a etre empiles ; deux schemas verticaux
      // gagnent a etre cote a cote. Les deux sont proposes, le calcul tranche.
      return [
        { colonnes: 2, lignes: 1 },
        { colonnes: 1, lignes: 2 },
      ]
    case 3:
      return [
        { colonnes: 3, lignes: 1 },
        { colonnes: 2, lignes: 2 },
        { colonnes: 1, lignes: 3 },
      ]
    default:
      return [
        { colonnes: 2, lignes: 2 },
        { colonnes: 4, lignes: 1 },
      ]
  }
}

// ------------------------------------------------------- Choix de la page

/**
 * Nombre de schemas reellement dessines sur la fiche : un seul, toujours.
 *
 * La feuille imprimee ne montre plus une vignette par etape mais un schema de
 * SYNTHESE, ou l'enchainement se lit en suivant les fleches numerotees. La
 * mise en page n'a donc plus qu'un rectangle a placer, et il peut prendre
 * toute la hauteur — la ou quatre vignettes reduisaient chaque terrain au
 * quart de la page.
 *
 * La fonction est conservee plutot qu'effacee : c'est elle qui dit a
 * choisirMiseEnPage() combien de cases prevoir, et une fiche pourrait un jour
 * en demander plusieurs a nouveau.
 */
export function nombreSchemas(_exercice: Exercice): number {
  return 1
}

interface Candidat extends MiseEnPage {
  /** Sert au classement : une police confortable vaut mieux, a surface egale. */
  rangPolice: number
}

export function choisirMiseEnPage(exercice: Exercice): MiseEnPage {
  const ratioUnitaire = cadrage(exercice.schema.vue).ratio
  const grilles = grillesPossibles(nombreSchemas(exercice))
  const candidats: Candidat[] = []

  for (const [rangPolice, policePt] of POLICES.entries()) {
    for (const grille of grilles) {
      const ratio = ratioGrille(ratioUnitaire, grille)

      // --- Disposition 1 : schema a gauche, texte a droite -----------------
      for (const partSchema of [0.42, 0.47, 0.52, 0.58, 0.64]) {
        const largeurUtile = ZONE.largeur - ECART
        const largeurTexte = largeurUtile * (1 - partSchema)
        const besoin = hauteurTexte(exercice, largeurTexte, policePt, 1)
        if (besoin > ZONE.hauteur) continue
        const rendu = ajuster(ratio, {
          largeur: largeurUtile * partSchema,
          hauteur: ZONE.hauteur,
        })
        candidats.push({
          disposition: 'cote-a-cote',
          partSchema,
          colonnesTexte: 1,
          policePt,
          grille,
          surfaceSchemaCm2: (rendu.largeur * rendu.hauteur) / 100,
          texteTient: true,
          rangPolice,
        })
      }

      // --- Disposition 2 : schema en banniere, texte dessous ---------------
      // Le texte occupe alors toute la largeur : il lui faut plusieurs colonnes,
      // sinon les lignes font 28 cm de long et deviennent penibles a lire.
      for (const colonnesTexte of [2, 3]) {
        const largeurColonne = (ZONE.largeur - ECART * (colonnesTexte - 1)) / colonnesTexte
        const besoin = hauteurTexte(exercice, largeurColonne, policePt, colonnesTexte)
        const hauteurDisponible = ZONE.hauteur - besoin - ECART
        if (hauteurDisponible <= 20) continue
        const rendu = ajuster(ratio, { largeur: ZONE.largeur, hauteur: hauteurDisponible })
        candidats.push({
          disposition: 'dessus',
          partSchema: rendu.hauteur / ZONE.hauteur,
          colonnesTexte,
          policePt,
          grille,
          surfaceSchemaCm2: (rendu.largeur * rendu.hauteur) / 100,
          texteTient: true,
          rangPolice,
        })
      }
    }
  }

  if (candidats.length === 0) return miseEnPageDeSecours(ratioUnitaire, grilles)

  candidats.sort(comparer)
  const { rangPolice: _, ...retenu } = candidats[0]
  return retenu
}

/**
 * Classement des candidats.
 *
 * La surface du schema decide, mais un ecart de moins de 8 % ne justifie pas de
 * rapetisser le texte : a surface comparable, on garde la police la plus
 * lisible, puis la disposition cote a cote, qui reprend celle de l'ecran.
 */
function comparer(a: Candidat, b: Candidat): number {
  const meilleure = Math.max(a.surfaceSchemaCm2, b.surfaceSchemaCm2)
  const ecart = Math.abs(a.surfaceSchemaCm2 - b.surfaceSchemaCm2) / (meilleure || 1)
  if (ecart > 0.08) return b.surfaceSchemaCm2 - a.surfaceSchemaCm2
  if (a.rangPolice !== b.rangPolice) return a.rangPolice - b.rangPolice
  if (a.disposition !== b.disposition) return a.disposition === 'cote-a-cote' ? -1 : 1
  return b.surfaceSchemaCm2 - a.surfaceSchemaCm2
}

/**
 * Aucune disposition ne laisse tenir le texte : la fiche est exceptionnellement
 * bavarde. On garde la page unique, avec la police la plus serree et le texte
 * sur trois colonnes, et on signale que ce sera dense.
 */
function miseEnPageDeSecours(ratioUnitaire: number, grilles: Grille[]): MiseEnPage {
  const policePt = POLICES[POLICES.length - 1]
  const grille = grilles[0]
  const partSchema = 0.3
  const rendu = ajuster(ratioGrille(ratioUnitaire, grille), {
    largeur: ZONE.largeur,
    hauteur: ZONE.hauteur * partSchema,
  })
  return {
    disposition: 'dessus',
    partSchema,
    colonnesTexte: 3,
    policePt,
    grille,
    surfaceSchemaCm2: (rendu.largeur * rendu.hauteur) / 100,
    texteTient: false,
  }
}
