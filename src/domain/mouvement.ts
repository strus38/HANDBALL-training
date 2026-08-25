/**
 * Les mouvements : une fleche decrit un deplacement, et ce deplacement EST la
 * position du jeton a l'etape suivante.
 *
 * Rien n'est stocke en double. Le depart d'une fleche liee est la position de
 * son jeton a l'etape courante, son arrivee la position du meme jeton a l'etape
 * suivante. Deplacer le joueur a l'etape suivante rallonge donc la fleche, et
 * tirer la fleche deplace le joueur : ce sont deux vues d'une seule donnee.
 *
 * Deux automatismes en decoulent :
 * - le ballon suit son porteur quand celui-ci court ou dribble ;
 * - l'orientation se deduit (on regarde ou l'on court, sinon on regarde le
 *   ballon), sauf si l'entraineur l'a fixee lui-meme.
 *
 * Module de calcul pur : ni React ni DOM, donc entierement testable.
 */

import { nouvelId, nouvelleEtape } from './fabrique'
import {
  ORIENTATION_PAR_DEFAUT,
  type Etape,
  type Fleche,
  type FlecheResolue,
  type Jeton,
  type Position,
  type Schema,
  type TypeFleche,
  type TypeJeton,
} from './types'

/** Distance en metres sous laquelle un joueur est considere porteur du ballon. */
export const DISTANCE_PORTEUR = 1.9

/** Distance a laquelle le ballon se pose devant son porteur. */
const RAYON_BALLON = 0.95

/** Decalage lateral du ballon : il se tient dans la main, pas au milieu du buste. */
const ANGLE_BALLON = 25

/** En deca de cette distance, une fleche n'a pas de sens : on ne la dessine pas. */
const LONGUEUR_MINIMALE = 0.35

/** Types de fleches qui deplacent un joueur. */
const DEPLACENT_LE_JOUEUR: TypeFleche[] = ['course', 'dribble', 'ecran']

/** Types de fleches qui deplacent le ballon seul. */
const DEPLACENT_LE_BALLON: TypeFleche[] = ['passe', 'tir']

const JOUEURS: TypeJeton[] = ['attaquant', 'defenseur', 'gardien']

export const estJoueur = (type: TypeJeton) => JOUEURS.includes(type)

// ------------------------------------------------------------- Geometrie

/** Angle en degres du centre vers un point : 0 vers le haut, 90 vers la droite. */
export function angleVers(centre: Position, point: Position): number {
  const angle = (Math.atan2(point.x - centre.x, point.y - centre.y) * 180) / Math.PI
  return (angle + 360) % 360
}

export function distance(a: Position, b: Position): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Ou se pose le ballon quand un joueur le porte : devant lui, cote main. */
export function positionBallonPres(joueur: Position, orientation: number): Position {
  const radians = ((orientation + ANGLE_BALLON) * Math.PI) / 180
  return {
    x: joueur.x + Math.sin(radians) * RAYON_BALLON,
    y: joueur.y + Math.cos(radians) * RAYON_BALLON,
  }
}

// --------------------------------------------------------------- Lectures

export function jetonBallon(schema: Schema): Jeton | undefined {
  return schema.jetons.find((j) => j.type === 'ballon')
}

export function positionDe(schema: Schema, index: number, jetonId: string): Position | undefined {
  return schema.etapes[index]?.positions[jetonId]
}

/**
 * Joueur qui porte le ballon a une etape donnee.
 *
 * Deduit de la proximite plutot que stocke : un entraineur qui pose le ballon
 * a cote d'un joueur exprime deja que ce joueur l'a en main, il n'a pas a le
 * declarer en plus.
 */
export function porteur(schema: Schema, index: number): string | undefined {
  const ballon = jetonBallon(schema)
  const positionBallon = ballon && positionDe(schema, index, ballon.id)
  if (!positionBallon) return undefined

  const candidats: { id: string; distance: number }[] = []
  for (const jeton of schema.jetons) {
    if (!estJoueur(jeton.type)) continue
    const position = positionDe(schema, index, jeton.id)
    if (!position) continue
    const ecart = distance(position, positionBallon)
    if (ecart <= DISTANCE_PORTEUR) candidats.push({ id: jeton.id, distance: ecart })
  }
  if (candidats.length === 0) return undefined
  candidats.sort((a, b) => a.distance - b.distance)

  /*
   * Intention declaree : une passe dit a QUI elle est adressee.
   *
   * C'est l'information la plus sure, et elle prime sur la geometrie — le
   * defenseur qui marque le receveur est souvent plus pres du ballon que le
   * receveur lui-meme, et le lui volait a l'arrivee. Quand l'etape enchaine
   * plusieurs passes (un renversement), seule la DERNIERE dit ou le ballon
   * finit : c'est elle qui designe le porteur.
   */
  if (index > 0) {
    const passes = (schema.etapes[index - 1]?.fleches ?? []).filter(
      (f) => f.type === 'passe' && f.cible !== undefined,
    )
    const recu = passes[passes.length - 1]?.cible
    if (recu && candidats.some((c) => c.id === recu)) return recu
  }

  /*
   * Hysteresis : celui qui avait le ballon le garde tant qu'il est a portee.
   *
   * Sans cela, le plus proche l'emporte a chaque etape — et au handball, le
   * joueur le plus proche du porteur est precisement le defenseur qui le
   * serre. Le ballon changeait donc d'equipe tout seul : seize fois dans les
   * fiches livrees, y compris sur le croise ou le defenseur 1 se retrouvait
   * porteur. Une passe, elle, eloigne le ballon de son ancien porteur : elle
   * n'est pas genee par cette regle.
   */
  if (index > 0) {
    const precedent = porteur(schema, index - 1)
    if (precedent && candidats.some((c) => c.id === precedent)) return precedent
  }

  return candidats[0].id
}

/** Jeton reellement deplace par une fleche : le joueur, ou le ballon. */
export function sujetDe(fleche: Fleche): string | undefined {
  return fleche.jetonId
}

/** Fleche de mouvement d'un jeton a une etape donnee, s'il en a une. */
function flecheDe(etape: Etape | undefined, jetonId: string): Fleche | undefined {
  return etape?.fleches.find((f) => f.jetonId === jetonId && DEPLACENT_LE_JOUEUR.includes(f.type))
}

/**
 * Orientation reellement affichee pour un jeton.
 *
 * Ordre des regles : ce que l'entraineur a fixe, sinon le sens de la course,
 * sinon le ballon, sinon l'orientation par defaut du poste.
 */
export function orientationEffective(schema: Schema, index: number, jetonId: string): number {
  const jeton = schema.jetons.find((j) => j.id === jetonId)
  const position = positionDe(schema, index, jetonId)
  if (!jeton || !position) return 0

  // 1. Choix explicite de l'entraineur : il prime toujours.
  if (position.orientation !== undefined) return position.orientation

  const defaut = jeton.orientation ?? ORIENTATION_PAR_DEFAUT[jeton.type] ?? 0
  if (!estJoueur(jeton.type)) return defaut

  // 2. Le joueur court : il regarde ou il va.
  if (flecheDe(schema.etapes[index], jetonId)) {
    const suivante = positionDe(schema, index + 1, jetonId)
    if (suivante && distance(position, suivante) > LONGUEUR_MINIMALE) {
      return angleVers(position, suivante)
    }
  }

  // 3. Sinon il regarde le ballon — sauf s'il l'a en main, auquel cas il
  //    regarde le but qu'il attaque.
  const ballon = jetonBallon(schema)
  const positionBallon = ballon && positionDe(schema, index, ballon.id)
  if (positionBallon) {
    // Le porteur regarde le but qu'il attaque — sauf le gardien, qui vient
    // d'arreter le ballon et regarde le terrain, pas sa propre cage.
    if (porteur(schema, index) === jetonId) return jeton.type === 'gardien' ? defaut : 90
    if (distance(position, positionBallon) > 0.4) return angleVers(position, positionBallon)
  }

  return defaut
}

/**
 * Fleches d'une etape, extremites calculees, pretes a etre dessinees.
 *
 * Les fleches devenues sans objet — un jeton supprime, ou un deplacement nul —
 * sont ecartees ici plutot que laissees a l'affichage.
 *
 * Le ballon demande un soin particulier : une etape peut lui declarer PLUSIEURS
 * trajets — une remise puis un tir, ou les deux passes d'un renversement. Il
 * n'a pourtant qu'une position par etape : seul le dernier trajet y aboutit.
 * Sans traitement, tous les trajets se dessinaient l'un sur l'autre, du depart
 * commun a l'arrivee finale — la remise au pivot ressemblait a un tir. Chaque
 * trajet intermediaire pointe donc sur son receveur, et le trajet suivant
 * repart de la.
 */
export function resoudreFleches(schema: Schema, index: number): FlecheResolue[] {
  const resolues: FlecheResolue[] = []
  const fleches = schema.etapes[index]?.fleches ?? []
  const ballon = jetonBallon(schema)
  const flechesBallon = ballon ? fleches.filter((f) => sujetDe(f) === ballon.id) : []
  let relaisBallon: Position | undefined

  for (const fleche of fleches) {
    const sujet = sujetDe(fleche)

    if (!sujet) {
      // Fleche libre : elle porte ses propres extremites.
      if (fleche.depart && fleche.arrivee) {
        resolues.push({
          id: fleche.id,
          type: fleche.type,
          depart: fleche.depart,
          arrivee: fleche.arrivee,
          courbure: fleche.courbure,
        })
      }
      continue
    }

    let depart = positionDe(schema, index, sujet)
    let arrivee = positionDe(schema, index + 1, sujet) ?? fleche.arrivee

    if (ballon && sujet === ballon.id && flechesBallon.length > 1) {
      depart = relaisBallon ?? depart
      if (fleche !== flechesBallon[flechesBallon.length - 1]) {
        // Trajet intermediaire : il s'arrete chez son receveur, pas a la
        // position finale du ballon.
        const receveur = fleche.cible ? positionDe(schema, index + 1, fleche.cible) : undefined
        arrivee = receveur ?? arrivee
      }
      relaisBallon = arrivee
    }

    if (!depart || !arrivee) continue
    if (distance(depart, arrivee) < LONGUEUR_MINIMALE) continue

    resolues.push({
      id: fleche.id,
      type: fleche.type,
      depart,
      arrivee,
      courbure: fleche.courbure,
      jetonId: sujet,
    })
  }

  return resolues
}

// ------------------------------------------------------------- Ecritures

const copier = (schema: Schema): Schema => ({
  ...schema,
  etapes: schema.etapes.map((e) => ({
    ...e,
    positions: Object.fromEntries(Object.entries(e.positions).map(([k, v]) => [k, { ...v }])),
    fleches: [...e.fleches],
  })),
})

/**
 * Garantit qu'une etape suivante existe, en recopiant les positions courantes.
 *
 * C'est ce qui permet de tracer une course depuis la derniere etape : l'etape
 * d'arrivee se cree toute seule.
 */
export function assurerEtapeSuivante(schema: Schema, index: number): Schema {
  if (schema.etapes[index + 1]) return schema
  const courante = schema.etapes[index]
  if (!courante) return schema
  const suivante: Etape = {
    ...nouvelleEtape(`Étape ${schema.etapes.length + 1}`),
    positions: Object.fromEntries(
      Object.entries(courante.positions).map(([k, v]) => [k, { ...v }]),
    ),
  }
  return { ...schema, etapes: [...schema.etapes, suivante] }
}

export interface DemandeMouvement {
  type: TypeFleche
  /** Point ou l'entraineur a lache la fleche. */
  arrivee: Position
  /** Jeton trouve au depart du trace, s'il y en a un. */
  jetonDepart?: string
  /** Jeton trouve a l'arrivee du trace : receveur d'une passe. */
  jetonArrivee?: string
  /** Extremite de depart, pour une fleche libre. */
  depart?: Position
  courbure?: Position
}

/**
 * Applique un trace : cree l'etape suivante si besoin, y place le jeton
 * concerne, fait suivre le ballon, et enregistre la fleche.
 */
export function appliquerMouvement(
  schemaInitial: Schema,
  index: number,
  demande: DemandeMouvement,
): Schema {
  const ballon = jetonBallon(schemaInitial)
  const deplaceLeJoueur = DEPLACENT_LE_JOUEUR.includes(demande.type)
  const deplaceLeBallon = DEPLACENT_LE_BALLON.includes(demande.type)

  // Qui bouge reellement ? Le joueur pour une course, le ballon pour une passe.
  const sujet = deplaceLeJoueur ? demande.jetonDepart : deplaceLeBallon ? ballon?.id : undefined

  // Faute de sujet identifiable, la fleche reste une simple illustration.
  if (!sujet) {
    const depart = demande.depart
    if (!depart) return schemaInitial
    const schema = copier(schemaInitial)
    schema.etapes[index].fleches.push({
      id: nouvelId(),
      type: demande.type,
      depart,
      arrivee: demande.arrivee,
      courbure: demande.courbure,
    })
    return schema
  }

  const avecEtape = assurerEtapeSuivante(schemaInitial, index)
  const schema = copier(avecEtape)
  const etape = schema.etapes[index]
  const suivante = schema.etapes[index + 1]
  // L'etape visee peut ne pas exister : index hors bornes, ou schema incomplet.
  // Mieux vaut ignorer le mouvement que faire tomber toute l'application.
  if (!etape || !suivante) return schemaInitial
  const porteurCourant = porteur(schemaInitial, index)

  if (deplaceLeJoueur) {
    const depart = etape.positions[sujet]
    suivante.positions[sujet] = {
      ...suivante.positions[sujet],
      x: demande.arrivee.x,
      y: demande.arrivee.y,
    }
    // Le ballon suit son porteur : courir avec, ou dribbler, l'emmene.
    if (ballon && porteurCourant === sujet && depart) {
      const orientation = angleVers(depart, demande.arrivee)
      suivante.positions[ballon.id] = {
        ...suivante.positions[ballon.id],
        ...positionBallonPres(demande.arrivee, orientation),
      }
    }
  } else if (deplaceLeBallon && ballon) {
    // Une passe qui atteint un joueur lui remet le ballon en main : le point
    // exact du lacher importe peu, c'est le receveur qui compte.
    const receveur = demande.type === 'passe' ? demande.jetonArrivee : undefined
    const positionReceveur = receveur ? suivante.positions[receveur] : undefined
    const arrivee = positionReceveur
      ? positionBallonPres(
          positionReceveur,
          orientationEffective(avecEtape, index + 1, receveur as string),
        )
      : demande.arrivee
    suivante.positions[ballon.id] = { ...suivante.positions[ballon.id], ...arrivee }
  }

  etape.fleches.push({
    id: nouvelId(),
    type: demande.type,
    jetonId: sujet,
    cible: demande.type === 'passe' ? demande.jetonArrivee : undefined,
    courbure: demande.courbure,
  })

  return schema
}

/**
 * Retire une fleche.
 *
 * Effacer un mouvement remet son jeton immobile : sans cela, il resterait a
 * l'arrivee d'une fleche qui n'existe plus, sans que rien ne l'explique.
 */
export function retirerFleche(schemaInitial: Schema, index: number, flecheId: string): Schema {
  const fleche = schemaInitial.etapes[index]?.fleches.find((f) => f.id === flecheId)
  if (!fleche) return schemaInitial

  const schema = copier(schemaInitial)
  const etape = schema.etapes[index]
  const suivante = schema.etapes[index + 1]
  const sujet = sujetDe(fleche)

  if (sujet && suivante) {
    const depart = etape.positions[sujet]
    if (depart) {
      suivante.positions[sujet] = { ...suivante.positions[sujet], x: depart.x, y: depart.y }
      // Le ballon repart aussi avec son porteur.
      const ballon = jetonBallon(schema)
      if (ballon && DEPLACENT_LE_JOUEUR.includes(fleche.type) && porteur(schemaInitial, index) === sujet) {
        const ballonDepart = etape.positions[ballon.id]
        if (ballonDepart) {
          suivante.positions[ballon.id] = {
            ...suivante.positions[ballon.id],
            x: ballonDepart.x,
            y: ballonDepart.y,
          }
        }
      }
    }
  }

  etape.fleches = etape.fleches.filter((f) => f.id !== flecheId)
  return schema
}

// ------------------------------------------------------------- Synthese

/**
 * Schema « tout en un » : la mise en place, et tout l'enchainement dessus.
 *
 * A l'ecran, une fiche se lit etape par etape et s'anime. Sur le PAPIER, non :
 * quatre terrains cote a cote reduisent chaque schema au quart d'une page A4,
 * et l'entraineur doit reconstituer mentalement le mouvement en passant de
 * l'un a l'autre. Un tableau blanc ne fonctionne pas comme ca — on y dessine
 * une fois le terrain, et les fleches numerotees racontent la suite.
 *
 * Les jetons sont poses a leur position de DEPART, et rien qu'elle : ce sont
 * les fleches qui disent la suite. Comme le depart d'une fleche est la position
 * de son jeton a son etape, et son arrivee celle de l'etape suivante, un joueur
 * qui bouge a l'etape 1 puis a l'etape 3 produit deux fleches qui s'enchainent
 * d'elles-memes, bout a bout.
 *
 * Les fleches deviennent LIBRES — elles portent leurs deux extremites au lieu
 * de les deduire d'un jeton. Sans cela, le schema synthetise n'ayant qu'une
 * seule etape, chaque fleche aurait cherche la position de son jeton a une
 * etape suivante qui n'existe plus, et aurait disparu.
 */
export function synthetiser(schema: Schema): Schema {
  const fleches: Fleche[] = []
  schema.etapes.forEach((_, index) => {
    for (const resolue of resoudreFleches(schema, index)) {
      fleches.push({
        id: resolue.id,
        type: resolue.type,
        depart: resolue.depart,
        arrivee: resolue.arrivee,
        courbure: resolue.courbure,
      })
    }
  })
  const premiere = schema.etapes[0] ?? nouvelleEtape()
  return { ...schema, etapes: [{ ...premiere, fleches }] }
}

// ------------------------------------------------------------- Migration

/**
 * Convertit un schema ecrit avant ce modele.
 *
 * Les anciennes fleches portaient leurs deux extremites et ignoraient les
 * positions des etapes. On les rattache a un jeton quand le trace correspond
 * bien a son deplacement ; sinon on les conserve telles quelles, en fleches
 * libres. Aucun joueur n'est jamais deplace par la conversion.
 */
export function migrerSchema(schema: Schema): Schema {
  const ballon = jetonBallon(schema)
  let modifie = false

  const etapes = schema.etapes.map((etape, index) => {
    const fleches = etape.fleches.map((fleche) => {
      if (fleche.jetonId && fleche.arrivee === undefined) return fleche
      if (!fleche.depart || !fleche.arrivee) return fleche

      const candidats = DEPLACENT_LE_BALLON.includes(fleche.type)
        ? ballon
          ? [ballon.id]
          : []
        : schema.jetons.filter((j) => estJoueur(j.type)).map((j) => j.id)

      for (const id of candidats) {
        const depart = etape.positions[id]
        const arrivee = schema.etapes[index + 1]?.positions[id]
        if (!depart || !arrivee) continue
        const partDeLa = distance(depart, fleche.depart) <= 1.6
        const arriveLa = distance(arrivee, fleche.arrivee) <= 1.6
        if (partDeLa && arriveLa) {
          modifie = true
          return {
            id: fleche.id,
            type: fleche.type,
            jetonId: id,
            courbure: fleche.courbure,
          }
        }
      }
      return fleche
    })
    return { ...etape, fleches }
  })

  return modifie ? { ...schema, etapes } : schema
}
