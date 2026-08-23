/**
 * Terrain de handball dessine en SVG : jetons deplacables et orientables,
 * fleches de mouvement, rappel de l'etape precedente.
 *
 * Le composant ne stocke aucune donnee. Pendant un glisser, l'etat reste local
 * et n'est remonte qu'au relachement : l'historique annuler / retablir
 * enregistre un deplacement complet, et non chacun des pixels parcourus.
 */

import { useRef, useState, type PointerEvent as EvenementPointeur } from 'react'
import {
  bornes,
  but,
  cadrage,
  ligneConcentrique,
  ligneMediane,
  marque,
  versEcran,
  versMetres,
} from './geometrie'
import { APPARENCES, facteurTaille } from './jetons'
import { DessinJeton, RAYON_PASTILLE } from './formes'
import { distanceAFleche, tracerFleche } from './fleches'
import { aimanter, type Repere } from './aimantation'
import {
  TERRAIN,
  type Etape,
  type FlecheResolue,
  type Jeton,
  type Position,
  type Schema,
  type TypeFleche,
} from '../domain/types'
import { angleVers, orientationEffective, resoudreFleches } from '../domain/mouvement'

/** Outil actif : deplacement des jetons, ou trace d'un type de fleche. */
export type Outil = 'selection' | TypeFleche

/**
 * Trace acheve par l'entraineur.
 *
 * Le terrain rapporte ce qu'il a vu — d'ou part le geste, ou il finit, et sur
 * quels jetons il tombe — sans decider de ce que cela signifie. C'est le
 * modele de mouvement qui interprete.
 */
export interface TraceFleche {
  type: TypeFleche
  depart: Position
  arrivee: Position
  jetonDepart?: string
  jetonArrivee?: string
}

export interface Selection {
  type: 'jeton' | 'fleche'
  id: string
}

interface Props {
  schema: Schema
  etape: Etape
  /** Rang de l'etape affichee : sert a calculer les fleches et les orientations. */
  etapeIndex?: number
  outil?: Outil
  selection?: Selection
  onSelection?: (selection: Selection | undefined) => void
  onDeplacer?: (id: string, position: Position) => void
  /** Trace termine : l'application en deduit qui se deplace et jusqu'ou. */
  onCreerFleche?: (trace: TraceFleche) => void
  onCourber?: (id: string, courbure: Position) => void
  /** Positions de l'etape precedente, rappelees en transparence. */
  etapePrecedente?: Etape
  interactif?: boolean
  /** Aimantation sur les postes et les lignes. Alt la neutralise ponctuellement. */
  aimantation?: boolean
}

type Glisse =
  | { genre: 'jeton'; id: string; position: Position }
  | { genre: 'rotation'; id: string; angle: number }
  | { genre: 'fleche'; depart: Position; arrivee: Position; jetonId?: string }
  | { genre: 'courbure'; id: string; point: Position }

export function Terrain({
  schema,
  etape,
  etapeIndex = 0,
  outil = 'selection',
  selection,
  onSelection,
  onDeplacer,
  onCreerFleche,
  onCourber,
  etapePrecedente,
  interactif = true,
  aimantation = true,
}: Props) {
  const svg = useRef<SVGSVGElement>(null)
  const [glisse, setGlisse] = useState<Glisse | undefined>()
  const [repere, setRepere] = useState<Repere | undefined>()
  const { viewBox } = cadrage(schema.vue)
  const taille = facteurTaille(schema.vue)
  const epaisseur = 0.16 * taille

  const pointeurEnMetres = (evenement: EvenementPointeur): Position | undefined => {
    const element = svg.current
    const matrice = element?.getScreenCTM()
    if (!element || !matrice) return undefined
    const point = new DOMPoint(evenement.clientX, evenement.clientY).matrixTransform(
      matrice.inverse(),
    )
    return versMetres({ x: point.x, y: point.y })
  }

  const limiter = (position: Position): Position => {
    const b = bornes(schema.vue)
    return {
      x: Math.min(b.xMax, Math.max(b.xMin, position.x)),
      y: Math.min(b.yMax, Math.max(b.yMin, position.y)),
    }
  }

  const placementDe = (jeton: Jeton): Position => {
    const base = etape.positions[jeton.id] ?? { x: 20, y: 10 }
    // L'orientation n'est pas toujours enregistree : elle se deduit du sens de
    // la course, ou de la position du ballon.
    return { ...base, orientation: orientationEffective(schema, etapeIndex, jeton.id) }
  }

  const positionAffichee = (jeton: Jeton): Position => {
    const base = placementDe(jeton)
    if (glisse?.genre === 'jeton' && glisse.id === jeton.id) {
      return { ...glisse.position, orientation: base.orientation }
    }
    if (glisse?.genre === 'rotation' && glisse.id === jeton.id) {
      return { ...base, orientation: glisse.angle }
    }
    return base
  }

  // ------------------------------------------------------------ Interactions

  const surPointeurBas = (evenement: EvenementPointeur) => {
    if (!interactif) return
    const position = pointeurEnMetres(evenement)
    if (!position) return

    if (outil !== 'selection') {
      // Un trace demarre sur le jeton le plus proche s'il y en a un : une passe
      // part d'un joueur, pas d'un point flottant a cote de lui.
      const proche = jetonLePlusProche(position, evenement.pointerType === 'touch')
      const depart = proche ? placementDe(proche) : position
      evenement.currentTarget.setPointerCapture(evenement.pointerId)
      setGlisse({
        genre: 'fleche',
        depart: { x: depart.x, y: depart.y },
        arrivee: position,
        jetonId: proche?.id,
      })
      return
    }

    // En mode selection, un clic dans le vide selectionne une fleche proche,
    // sinon il deselectionne.
    const fleche = flecheLaPlusProche(position)
    onSelection?.(fleche ? { type: 'fleche', id: fleche.id } : undefined)
  }

  const jetonLePlusProche = (position: Position, auDoigt = false): Jeton | undefined => {
    let meilleur: { jeton: Jeton; distance: number } | undefined
    // Un doigt est moins precis qu'un curseur : la zone de prise s'elargit,
    // le jeton le plus proche restant toujours celui qui l'emporte.
    const portee = auDoigt ? 2.1 : 1.4
    for (const jeton of schema.jetons) {
      const p = placementDe(jeton)
      const distance = Math.hypot(p.x - position.x, p.y - position.y)
      const rayon = APPARENCES[jeton.type].rayon * taille
      if (distance <= rayon * portee && (!meilleur || distance < meilleur.distance)) {
        meilleur = { jeton, distance }
      }
    }
    return meilleur?.jeton
  }

  const flecheLaPlusProche = (position: Position): FlecheResolue | undefined => {
    let meilleure: { fleche: FlecheResolue; distance: number } | undefined
    for (const fleche of resoudreFleches(schema, etapeIndex)) {
      const distance = distanceAFleche(fleche, position)
      if (distance <= 0.6 * taille && (!meilleure || distance < meilleure.distance)) {
        meilleure = { fleche, distance }
      }
    }
    return meilleure?.fleche
  }

  const commencerJeton = (evenement: EvenementPointeur, jeton: Jeton) => {
    if (!interactif) return
    if (outil !== 'selection') return // le trace de fleche est gere par le fond
    evenement.stopPropagation()
    onSelection?.({ type: 'jeton', id: jeton.id })
    const position = pointeurEnMetres(evenement)
    if (!position) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    setGlisse({ genre: 'jeton', id: jeton.id, position: limiter(position) })
  }

  const commencerRotation = (evenement: EvenementPointeur, jeton: Jeton) => {
    if (!interactif) return
    evenement.stopPropagation()
    const position = pointeurEnMetres(evenement)
    if (!position) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    setGlisse({ genre: 'rotation', id: jeton.id, angle: placementDe(jeton).orientation ?? 0 })
  }

  const commencerCourbure = (evenement: EvenementPointeur, fleche: FlecheResolue) => {
    if (!interactif) return
    evenement.stopPropagation()
    const position = pointeurEnMetres(evenement)
    if (!position) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    setGlisse({ genre: 'courbure', id: fleche.id, point: position })
  }

  /**
   * Accroche le point aux reperes du terrain, sauf si Alt est enfonce : le
   * geste reste toujours rattrapable quand on veut viser librement.
   */
  const accrocher = (position: Position, evenement: EvenementPointeur): Position => {
    const trouve = aimanter(position, { active: aimantation && !evenement.altKey })
    setRepere(trouve)
    return trouve?.position ?? position
  }

  const suivre = (evenement: EvenementPointeur) => {
    if (!glisse) return
    const position = pointeurEnMetres(evenement)
    if (!position) return
    switch (glisse.genre) {
      case 'jeton':
        setGlisse({ ...glisse, position: limiter(accrocher(position, evenement)) })
        break
      case 'rotation': {
        const jeton = schema.jetons.find((j) => j.id === glisse.id)
        if (!jeton) return
        const centre = placementDe(jeton)
        setGlisse({ ...glisse, angle: angleVers(centre, position) })
        break
      }
      case 'fleche':
        setGlisse({ ...glisse, arrivee: limiter(accrocher(position, evenement)) })
        break
      case 'courbure':
        // La courbure est un reglage visuel : rien ne justifie de l'aimanter.
        setGlisse({ ...glisse, point: limiter(position) })
        break
    }
  }

  const terminer = () => {
    setRepere(undefined)
    if (!glisse) return
    switch (glisse.genre) {
      case 'jeton': {
        // On ne recopie que l'orientation EXPLICITE. Ecrire ici la valeur
        // affichee — souvent deduite — revenait a figer le joueur au premier
        // glisser : l'orientation automatique mourait des qu'on touchait au
        // schema.
        const explicite = etape.positions[glisse.id]?.orientation
        onDeplacer?.(glisse.id, {
          x: arrondi(glisse.position.x),
          y: arrondi(glisse.position.y),
          ...(explicite === undefined ? {} : { orientation: explicite }),
        })
        break
      }
      case 'rotation': {
        const jeton = schema.jetons.find((j) => j.id === glisse.id)
        if (jeton) {
          const base = placementDe(jeton)
          onDeplacer?.(glisse.id, {
            x: base.x,
            y: base.y,
            orientation: Math.round(glisse.angle),
          })
        }
        break
      }
      case 'fleche': {
        const longueur = Math.hypot(
          glisse.arrivee.x - glisse.depart.x,
          glisse.arrivee.y - glisse.depart.y,
        )
        // Un simple clic ne doit pas creer une fleche de longueur nulle.
        if (longueur >= 0.8 && outil !== 'selection') {
          const cible = jetonLePlusProche(glisse.arrivee)
          onCreerFleche?.({
            type: outil,
            depart: { x: arrondi(glisse.depart.x), y: arrondi(glisse.depart.y) },
            arrivee: { x: arrondi(glisse.arrivee.x), y: arrondi(glisse.arrivee.y) },
            jetonDepart: glisse.jetonId,
            jetonArrivee: cible?.id,
          })
        }
        break
      }
      case 'courbure':
        onCourber?.(glisse.id, { x: arrondi(glisse.point.x), y: arrondi(glisse.point.y) })
        break
    }
    setGlisse(undefined)
  }

  // ----------------------------------------------------------------- Rendu

  const flechesAffichees: FlecheResolue[] =
    glisse?.genre === 'fleche' && outil !== 'selection'
      ? [
          ...resoudreFleches(schema, etapeIndex),
          { id: '__apercu', type: outil, depart: glisse.depart, arrivee: glisse.arrivee },
        ]
      : resoudreFleches(schema, etapeIndex)

  const jetonSelectionne =
    selection?.type === 'jeton' ? schema.jetons.find((j) => j.id === selection.id) : undefined

  return (
    <svg
      ref={svg}
      className={`terrain${outil !== 'selection' ? ' mode-trace' : ''}`}
      viewBox={viewBox}
      role="img"
      aria-label="Schema de l'exercice sur le terrain"
      onPointerDown={surPointeurBas}
      onPointerMove={suivre}
      onPointerUp={terminer}
      onPointerCancel={terminer}
    >
      <rect
        x={-2}
        y={-2}
        width={TERRAIN.longueur + 4}
        height={TERRAIN.largeur + 4}
        className="terrain-fond"
      />
      <rect x={0} y={0} width={TERRAIN.longueur} height={TERRAIN.largeur} className="terrain-aire" />

      {(['gauche', 'droite'] as const).map((cote) => (
        <g key={cote}>
          <path d={ligneConcentrique(TERRAIN.rayonSurface, cote)} className="terrain-surface" />
          <path d={ligneConcentrique(TERRAIN.rayonSurface, cote)} className="terrain-ligne" />
          <path
            d={ligneConcentrique(TERRAIN.rayonJetFranc, cote)}
            className="terrain-ligne pointillee"
          />
          <path d={marque(TERRAIN.distanceJet7m, cote, 0.5)} className="terrain-ligne" />
          <path d={marque(TERRAIN.ligneGardien, cote, 0.075)} className="terrain-ligne" />
          <rect {...dimensionsBut(cote)} className="terrain-but" />
        </g>
      ))}

      <rect
        x={0}
        y={0}
        width={TERRAIN.longueur}
        height={TERRAIN.largeur}
        className="terrain-ligne terrain-contour"
      />
      <path d={ligneMediane()} className="terrain-ligne" />

      {/* Rappel de l'etape precedente */}
      {etapePrecedente &&
        schema.jetons.map((jeton) => {
          const avant = etapePrecedente.positions[jeton.id]
          const courante = positionAffichee(jeton)
          if (!avant || (avant.x === courante.x && avant.y === courante.y)) return null
          const p = versEcran(avant)
          return (
            <g key={`fantome-${jeton.id}`} className="fantome" transform={`translate(${p.x} ${p.y})`}>
              <g transform={`rotate(${orientationEffective(schema, etapeIndex - 1, jeton.id)})`}>
                <DessinJeton
                  forme={APPARENCES[jeton.type].forme}
                  r={APPARENCES[jeton.type].rayon * taille}
                  apparence={APPARENCES[jeton.type]}
                />
              </g>
            </g>
          )
        })}

      {/* Fleches de mouvement */}
      {flechesAffichees.map((fleche, indexFleche) => (
        <FlecheSvg
          key={fleche.id}
          fleche={fleche}
          numero={fleche.id === '__apercu' ? undefined : indexFleche + 1}
          taille={taille}
          epaisseur={epaisseur}
          selectionnee={selection?.type === 'fleche' && selection.id === fleche.id}
          interactif={interactif && outil === 'selection'}
          onSelection={() => onSelection?.({ type: 'fleche', id: fleche.id })}
          onCourbure={(evenement) => commencerCourbure(evenement, fleche)}
        />
      ))}

      {/* Jetons */}
      {schema.jetons.map((jeton) => {
        const placement = positionAffichee(jeton)
        const p = versEcran(placement)
        const apparence = APPARENCES[jeton.type]
        const r = apparence.rayon * taille
        const estSelectionne = selection?.type === 'jeton' && selection.id === jeton.id
        return (
          <g
            key={jeton.id}
            className={`jeton${interactif && outil === 'selection' ? ' deplacable' : ''}${
              estSelectionne ? ' selectionne' : ''
            }`}
            transform={`translate(${p.x} ${p.y})`}
            onPointerDown={(evenement) => commencerJeton(evenement, jeton)}
          >
            {estSelectionne && <circle cx={0} cy={0} r={r + 0.35} className="jeton-halo" />}
            <g transform={`rotate(${placement.orientation ?? 0})`}>
              <DessinJeton forme={apparence.forme} r={r} apparence={apparence} />
            </g>
            {/* Ni la pastille ni le numero ne pivotent avec le joueur : ils
                resteraient illisibles des qu'il regarde vers le bas. */}
            {jeton.etiquette && (
              <>
                {apparence.pastel && (
                  <circle
                    cx={0}
                    cy={0}
                    r={RAYON_PASTILLE * r}
                    fill={apparence.pastel}
                    stroke={apparence.contour}
                    strokeWidth={r * 0.1}
                  />
                )}
                <text
                  className="jeton-etiquette"
                  x={0}
                  y={0}
                  fill={apparence.couleurTexte}
                  fontSize={r * (jeton.etiquette.length > 2 ? 0.57 : 0.71)}
                >
                  {jeton.etiquette}
                </text>
              </>
            )}
          </g>
        )
      })}

      {/* Repere d'aimantation, pendant le glisser */}
      {repere && glisse && (
        <g className="repere-aimant">
          <circle cx={versEcran(repere.position).x} cy={versEcran(repere.position).y} r={0.55} />
          <text
            x={versEcran(repere.position).x}
            y={versEcran(repere.position).y - 1.15}
            fontSize={0.85 * taille}
          >
            {repere.libelle}
          </text>
        </g>
      )}

      {/* Poignee de rotation du jeton selectionne */}
      {interactif && outil === 'selection' && jetonSelectionne && (
        <PoigneeRotation
          jeton={jetonSelectionne}
          placement={positionAffichee(jetonSelectionne)}
          rayon={APPARENCES[jetonSelectionne.type].rayon * taille}
          onCommencer={(evenement) => commencerRotation(evenement, jetonSelectionne)}
        />
      )}
    </svg>
  )
}

const arrondi = (v: number) => Math.round(v * 100) / 100

function dimensionsBut(cote: 'gauche' | 'droite') {
  const b = but(cote)
  return { x: b.x, y: b.y, width: b.largeur, height: b.hauteur }
}

function PoigneeRotation({
  placement,
  rayon,
  onCommencer,
}: {
  jeton: Jeton
  placement: Position
  rayon: number
  onCommencer: (evenement: EvenementPointeur) => void
}) {
  const centre = versEcran(placement)
  const angle = placement.orientation ?? 0
  const distance = rayon + 0.75
  const radians = ((angle - 90) * Math.PI) / 180
  const x = centre.x + Math.cos(radians) * distance
  const y = centre.y + Math.sin(radians) * distance
  return (
    <g className="poignee-rotation" onPointerDown={onCommencer}>
      <line x1={centre.x} y1={centre.y} x2={x} y2={y} className="tige-rotation" />
      <circle cx={x} cy={y} r={0.42} className="bouton-rotation" />
      {/* Zone de saisie elargie : la poignee reste attrapable au doigt. */}
      <circle cx={x} cy={y} r={0.85} fill="transparent" />
    </g>
  )
}

function FlecheSvg({
  fleche,
  numero,
  taille,
  epaisseur,
  selectionnee,
  interactif,
  onSelection,
  onCourbure,
}: {
  fleche: FlecheResolue
  /** Rang de l'action dans l'etape, repris dans le deroulement redige. */
  numero?: number
  taille: number
  epaisseur: number
  selectionnee: boolean
  interactif: boolean
  onSelection: () => void
  onCourbure: (evenement: EvenementPointeur) => void
}) {
  const trace = tracerFleche(fleche, epaisseur)
  const classe = `fleche fleche-${fleche.type}${selectionnee ? ' selectionnee' : ''}`
  return (
    <g className={classe}>
      {/* Trait invisible et large : rend la fleche facile a designer au clic. */}
      {interactif && (
        <path
          d={trace.corps}
          className="zone-clic"
          onPointerDown={(evenement) => {
            evenement.stopPropagation()
            onSelection()
          }}
        />
      )}
      <path d={trace.corps} className="trait" strokeWidth={epaisseur} />
      {trace.doublure && <path d={trace.doublure} className="trait" strokeWidth={epaisseur} />}
      <path
        d={trace.fin}
        className={fleche.type === 'ecran' ? 'trait' : 'pointe'}
        strokeWidth={epaisseur}
      />
      {/* Numero de l'action, pose au depart du trace */}
      {numero !== undefined && (
        <g className="numero-action">
          <circle
            cx={versEcran(fleche.depart).x}
            cy={versEcran(fleche.depart).y}
            r={0.5 * taille}
          />
          <text
            x={versEcran(fleche.depart).x}
            y={versEcran(fleche.depart).y}
            fontSize={0.7 * taille}
          >
            {numero}
          </text>
        </g>
      )}
      {selectionnee && interactif && (
        <g className="poignee-courbure" onPointerDown={onCourbure}>
          <circle cx={trace.milieu.x} cy={trace.milieu.y} r={0.32} className="bouton-rotation" />
          <circle cx={trace.milieu.x} cy={trace.milieu.y} r={0.8} fill="transparent" />
        </g>
      )}
    </g>
  )
}
