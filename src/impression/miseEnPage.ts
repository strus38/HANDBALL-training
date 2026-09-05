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

export interface Zone {
  largeur: number
  hauteur: number
}

/**
 * Zone imprimable en millimetres, entete et pied de page deduits.
 *
 * UNE SEULE zone, celle du paysage que @page demande et que Chrome respecte —
 * y compris quand les options d'impression reclament le portrait.
 *
 * Il y en a eu deux, la seconde taillee pour le portrait, choisie a
 * l'impression par une requete de media sur l'orientation. Cette requete ne
 * dit pas ce qu'on croyait : a l'impression, Chrome l'evalue contre la page A4
 * DEBOUT, quelle que soit l'orientation reelle. La zone portrait gagnait donc
 * a chaque impression, la fiche etait calculee pour 192 mm de large et rendue
 * dans 279, et le schema sortait tranche au bas de la page.
 *
 * A4 paysage : 297 x 210 ; 9 mm de marges de chaque cote ; 24 mm pour l'entete
 * et le pied de page.
 */
export const ZONE_PAYSAGE: Zone = { largeur: 279, hauteur: 168 }

/** Zone par defaut : celle que la fiche demande. */
export const ZONE = ZONE_PAYSAGE

/** Espace entre le schema et le texte. */
const ECART = 6

/** Hauteur de la legende sous chaque schema d'etape. */
const LEGENDE = 4.5

/**
 * Tailles de police essayees, de la plus confortable a la plus serree.
 *
 * La liste commence plus haut qu'avant. Tant que la feuille portait jusqu'a
 * quatre vignettes, la place manquait et 9,2 pt etait deja un luxe. Depuis
 * qu'un SEUL schema est imprime, il occupe la moitie de la page sans effort :
 * ce qui reste peut nourrir un texte qu'on lit debout, au bord du terrain, et
 * non plus penche dessus.
 */
const POLICES = [11, 10.2, 9.6, 9.2, 8.6, 8, 7.4, 6.9]

/**
 * De combien le schema peut retrecir pour gagner une taille de police.
 *
 * L'ancienne valeur etait de 8 % : un terrain complet passait donc a 7,4 pt
 * pour gagner 10 % de surface, alors qu'il occupait deja 277 cm2 sur une page
 * qui en compte 536. On payait en lisibilite un agrandissement qu'on ne voyait
 * pas. Un quart de surface est un prix acceptable pour un texte lisible ; le
 * schema reste, de loin, l'element le plus grand de la feuille.
 */
const TOLERANCE_SURFACE = 0.25

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

export function choisirMiseEnPage(exercice: Exercice, zone: Zone = ZONE_PAYSAGE): MiseEnPage {
  const ratioUnitaire = cadrage(exercice.schema.vue).ratio
  const grilles = grillesPossibles(nombreSchemas(exercice))
  const candidats: Candidat[] = []

  for (const [rangPolice, policePt] of POLICES.entries()) {
    for (const grille of grilles) {
      const ratio = ratioGrille(ratioUnitaire, grille)

      // --- Disposition 1 : schema a gauche, texte a droite -----------------
      for (const partSchema of [0.42, 0.47, 0.52, 0.58, 0.64]) {
        const largeurUtile = zone.largeur - ECART
        const largeurTexte = largeurUtile * (1 - partSchema)
        const besoin = hauteurTexte(exercice, largeurTexte, policePt, 1)
        if (besoin > zone.hauteur) continue
        const rendu = ajuster(ratio, {
          largeur: largeurUtile * partSchema,
          hauteur: zone.hauteur,
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
        const largeurColonne = (zone.largeur - ECART * (colonnesTexte - 1)) / colonnesTexte
        const besoin = hauteurTexte(exercice, largeurColonne, policePt, colonnesTexte)
        const hauteurDisponible = zone.hauteur - besoin - ECART
        if (hauteurDisponible <= 20) continue
        const rendu = ajuster(ratio, { largeur: zone.largeur, hauteur: hauteurDisponible })
        candidats.push({
          disposition: 'dessus',
          partSchema: rendu.hauteur / zone.hauteur,
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

  if (candidats.length === 0) return miseEnPageDeSecours(ratioUnitaire, grilles, zone)

  const { rangPolice: _, ...retenu } = choisirParmi(candidats)
  return retenu
}

/**
 * Retient le meilleur candidat.
 *
 * La selection est GLOBALE, et non un tri par comparaisons deux a deux. Une
 * tolerance appliquee par paires n'est pas transitive : A bat B, B bat C, et C
 * peut battre A. Le resultat dependait alors de l'ordre dans lequel le tri
 * comparait les candidats — un terrain complet perdait ainsi 36 % de surface
 * alors que la tolerance etait de 25 %.
 *
 * On calcule donc d'abord la meilleure surface possible, on ecarte ce qui perd
 * plus que la tolerance, et on choisit parmi le reste : d'abord la police la
 * plus lisible, puis la disposition qui reprend celle de l'ecran, puis la plus
 * grande surface.
 */
function choisirParmi(candidats: Candidat[]): Candidat {
  const meilleure = Math.max(...candidats.map((c) => c.surfaceSchemaCm2))
  const seuil = meilleure * (1 - TOLERANCE_SURFACE)
  // Le meilleur candidat est toujours accepte : il sert de point de depart et
  // garantit que la reduction ne porte jamais sur une liste vide, quoi qu'aient
  // valu les surfaces.
  const reference = candidats.find((c) => c.surfaceSchemaCm2 === meilleure) ?? candidats[0]
  const acceptables = candidats.filter((c) => c.surfaceSchemaCm2 >= seuil)
  return acceptables.reduce((retenu, candidat) => {
    if (candidat.rangPolice !== retenu.rangPolice) {
      return candidat.rangPolice < retenu.rangPolice ? candidat : retenu
    }
    if (candidat.disposition !== retenu.disposition) {
      return candidat.disposition === 'cote-a-cote' ? candidat : retenu
    }
    return candidat.surfaceSchemaCm2 > retenu.surfaceSchemaCm2 ? candidat : retenu
  }, reference)
}


/**
 * Aucune disposition ne laisse tenir le texte : la fiche est exceptionnellement
 * bavarde. On garde la page unique, avec la police la plus serree et le texte
 * sur trois colonnes, et on signale que ce sera dense.
 */
function miseEnPageDeSecours(
  ratioUnitaire: number,
  grilles: Grille[],
  zone: Zone = ZONE_PAYSAGE,
): MiseEnPage {
  const policePt = POLICES[POLICES.length - 1]
  const grille = grilles[0]
  const partSchema = 0.3
  const rendu = ajuster(ratioGrille(ratioUnitaire, grille), {
    largeur: zone.largeur,
    hauteur: zone.hauteur * partSchema,
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
