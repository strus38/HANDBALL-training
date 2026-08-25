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
  ZONE_MINIMALE,
  type Annotation,
  type Etape,
  type FlecheResolue,
  type Jeton,
  type Position,
  type Schema,
  type TypeFleche,
  type Zone,
} from '../domain/types'
import { angleVers, orientationEffective, resoudreFleches } from '../domain/mouvement'

/**
 * Outil actif : deplacer, tracer un type de fleche, delimiter une zone, ou
 * poser un texte.
 *
 * « zone » et « texte » se comportent comme les outils de trace : ils arment le
 * geste suivant, puis la barre d'outils revient a la selection. Un outil qui
 * reste arme fait poser trois zones a qui n'en voulait qu'une.
 */
export type Outil = 'selection' | TypeFleche | 'zone' | 'texte'

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
  type: 'jeton' | 'fleche' | 'zone' | 'annotation'
  id: string
}

/**
 * Vrai quand l'outil arme le trace d'une fleche.
 *
 * « zone » et « texte » partagent la barre d'outils avec les fleches sans etre
 * des fleches : sans ce garde, un rectangle finirait enregistre comme une passe.
 */
export function estOutilFleche(outil: Outil): outil is TypeFleche {
  return outil !== 'selection' && outil !== 'zone' && outil !== 'texte'
}

/** Rectangle demande par l'entraineur, en metres, repere metier. */
export interface TraceZone {
  x: number
  y: number
  largeur: number
  hauteur: number
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
  /** Rectangle acheve : l'application en fait une zone. */
  onCreerZone?: (trace: TraceZone) => void
  /** Deplacement ou redimensionnement d'une zone existante. */
  onModifierZone?: (id: string, modifications: Partial<TraceZone>) => void
  /** Clic avec l'outil texte : un mot a poser a cet endroit. */
  onCreerAnnotation?: (point: Position) => void
  onDeplacerAnnotation?: (id: string, point: Position) => void
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
  /** Trace d'une zone neuve : deux coins opposes, dans l'ordre du geste. */
  | { genre: 'zone-nouvelle'; depart: Position; point: Position }
  /** Deplacement d'une zone : l'ecart au coin est fige a la prise, sinon la
      zone sauterait sous le curseur au premier pixel parcouru. */
  | { genre: 'zone'; id: string; ecart: { dx: number; dy: number }; point: Position }
  | { genre: 'zone-taille'; id: string; point: Position }
  | { genre: 'annotation'; id: string; position: Position }

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
  onCreerZone,
  onModifierZone,
  onCreerAnnotation,
  onDeplacerAnnotation,
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
  // Absentes des schemas ecrits avant la version 3 du format : partout ailleurs
  // le code peut alors les traiter comme de simples listes.
  const zones = schema.zones ?? []
  const annotations = schema.annotations ?? []

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

    // L'outil texte pose son annotation au clic : il n'y a rien a faire glisser,
    // le mot est ecrit ensuite dans le panneau lateral.
    if (outil === 'texte') {
      onCreerAnnotation?.({ x: arrondi(position.x), y: arrondi(position.y) })
      return
    }

    if (outil === 'zone') {
      evenement.currentTarget.setPointerCapture(evenement.pointerId)
      setGlisse({ genre: 'zone-nouvelle', depart: limiter(position), point: limiter(position) })
      return
    }

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

  const commencerZone = (evenement: EvenementPointeur, zone: Zone) => {
    if (!interactif || outil !== 'selection') return
    evenement.stopPropagation()
    onSelection?.({ type: 'zone', id: zone.id })
    const position = pointeurEnMetres(evenement)
    if (!position) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    setGlisse({
      genre: 'zone',
      id: zone.id,
      ecart: { dx: position.x - zone.x, dy: position.y - zone.y },
      point: position,
    })
  }

  const commencerTailleZone = (evenement: EvenementPointeur, zone: Zone) => {
    if (!interactif) return
    evenement.stopPropagation()
    const position = pointeurEnMetres(evenement)
    if (!position) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    setGlisse({ genre: 'zone-taille', id: zone.id, point: position })
  }

  const commencerAnnotation = (evenement: EvenementPointeur, annotation: Annotation) => {
    if (!interactif || outil !== 'selection') return
    evenement.stopPropagation()
    onSelection?.({ type: 'annotation', id: annotation.id })
    const position = pointeurEnMetres(evenement)
    if (!position) return
    evenement.currentTarget.setPointerCapture(evenement.pointerId)
    setGlisse({ genre: 'annotation', id: annotation.id, position: limiter(position) })
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
      // Les zones se calent sur les lignes du terrain comme les jetons : une
      // zone de marque commence presque toujours sur la ligne des 9 m.
      case 'zone-nouvelle':
      case 'zone-taille':
        setGlisse({ ...glisse, point: limiter(accrocher(position, evenement)) })
        break
      case 'zone':
        setGlisse({ ...glisse, point: limiter(position) })
        break
      case 'annotation':
        setGlisse({ ...glisse, position: limiter(position) })
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
        if (longueur >= 0.8 && estOutilFleche(outil)) {
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
      case 'zone-nouvelle': {
        // Le geste va dans n'importe quel sens : on garde les deux coins, pas
        // l'ordre dans lequel ils ont ete designes.
        const trace = rectangleEntre(glisse.depart, glisse.point)
        // Un clic sec ne doit pas poser une zone invisible qu'on ne pourra
        // plus attraper pour la supprimer.
        if (trace.largeur >= ZONE_MINIMALE && trace.hauteur >= ZONE_MINIMALE) onCreerZone?.(trace)
        break
      }
      case 'zone': {
        onModifierZone?.(glisse.id, {
          x: arrondi(glisse.point.x - glisse.ecart.dx),
          y: arrondi(glisse.point.y - glisse.ecart.dy),
        })
        break
      }
      case 'zone-taille': {
        const zone = zones.find((z) => z.id === glisse.id)
        if (zone) {
          onModifierZone?.(glisse.id, {
            largeur: arrondi(Math.max(ZONE_MINIMALE, glisse.point.x - zone.x)),
            hauteur: arrondi(Math.max(ZONE_MINIMALE, glisse.point.y - zone.y)),
          })
        }
        break
      }
      case 'annotation':
        onDeplacerAnnotation?.(glisse.id, {
          x: arrondi(glisse.position.x),
          y: arrondi(glisse.position.y),
        })
        break
    }
    setGlisse(undefined)
  }

  // ----------------------------------------------------------------- Rendu

  const flechesAffichees: FlecheResolue[] =
    glisse?.genre === 'fleche' && estOutilFleche(outil)
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
      aria-label="Schéma de l'exercice sur le terrain"
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

      {/*
        Zones coloriees : posees SUR l'aire et SOUS tout le reste.
        Elles sont du decor de mise en place, pas des acteurs — les faire passer
        devant les joueurs cacherait ce qui compte, et les mettre sous les
        lignes du terrain effacerait les reperes officiels.
      */}
      {zones.map((zone) => {
        const enCours =
          glisse?.genre === 'zone' && glisse.id === zone.id
            ? { ...zone, x: glisse.point.x - glisse.ecart.dx, y: glisse.point.y - glisse.ecart.dy }
            : glisse?.genre === 'zone-taille' && glisse.id === zone.id
              ? {
                  ...zone,
                  largeur: Math.max(ZONE_MINIMALE, glisse.point.x - zone.x),
                  hauteur: Math.max(ZONE_MINIMALE, glisse.point.y - zone.y),
                }
              : zone
        return (
          <ZoneSvg
            key={zone.id}
            zone={enCours}
            taille={taille}
            selectionnee={selection?.type === 'zone' && selection.id === zone.id}
            interactif={interactif && outil === 'selection'}
            onPrise={(evenement) => commencerZone(evenement, zone)}
            onTaille={(evenement) => commencerTailleZone(evenement, enCours)}
          />
        )
      })}

      {/* Apercu de la zone en cours de trace */}
      {glisse?.genre === 'zone-nouvelle' && (
        <ZoneSvg
          zone={{
            id: '__apercu',
            teinte: 'jaune',
            libelle: '',
            ...rectangleEntre(glisse.depart, glisse.point),
          }}
          taille={taille}
          selectionnee
          interactif={false}
          onPrise={() => {}}
          onTaille={() => {}}
        />
      )}

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

      {/*
        Annotations : au-dessus des fleches, sous les jetons.
        Un mot cache par un trait ne se lit pas ; un joueur cache par un mot ne
        se deplace plus. C'est le mot qui cede, il se deplace d'un glisser.
      */}
      {annotations.map((annotation) => {
        const enCours =
          glisse?.genre === 'annotation' && glisse.id === annotation.id
            ? { ...annotation, ...glisse.position }
            : annotation
        const p = versEcran(enCours)
        const estSelectionnee =
          selection?.type === 'annotation' && selection.id === annotation.id
        return (
          <g
            key={annotation.id}
            className={`annotation${interactif && outil === 'selection' ? ' deplacable' : ''}${
              estSelectionnee ? ' selectionnee' : ''
            }`}
            transform={`translate(${p.x} ${p.y})`}
            onPointerDown={(evenement) => commencerAnnotation(evenement, annotation)}
          >
            {/* Le texte est ecrit deux fois : une passe epaisse a la couleur du
                terrain sert de halo, et le rend lisible par-dessus une zone
                coloriee comme par-dessus une ligne. */}
            <text className="annotation-halo" x={0} y={0} fontSize={0.95 * taille}>
              {enCours.texte}
            </text>
            <text className="annotation-texte" x={0} y={0} fontSize={0.95 * taille}>
              {enCours.texte}
            </text>
          </g>
        )
      })}

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

/**
 * Rectangle defini par deux coins opposes, quel que soit l'ordre du geste.
 *
 * On dessine une zone du coin qu'on veut vers le coin qu'on veut : le modele,
 * lui, n'accepte qu'un coin bas-gauche et des cotes positifs.
 */
function rectangleEntre(a: Position, b: Position): TraceZone {
  return {
    x: arrondi(Math.min(a.x, b.x)),
    y: arrondi(Math.min(a.y, b.y)),
    largeur: arrondi(Math.abs(b.x - a.x)),
    hauteur: arrondi(Math.abs(b.y - a.y)),
  }
}

/**
 * Une zone coloriee.
 *
 * Le rectangle est decrit en repere METIER — coin bas-gauche, y vers le haut —
 * et converti ici seulement : c'est le coin HAUT-gauche que SVG attend.
 */
function ZoneSvg({
  zone,
  taille,
  selectionnee,
  interactif,
  onPrise,
  onTaille,
}: {
  zone: Zone
  taille: number
  selectionnee: boolean
  interactif: boolean
  onPrise: (evenement: EvenementPointeur) => void
  onTaille: (evenement: EvenementPointeur) => void
}) {
  const coin = versEcran({ x: zone.x, y: zone.y + zone.hauteur })
  const centre = versEcran({ x: zone.x + zone.largeur / 2, y: zone.y + zone.hauteur / 2 })
  const poignee = versEcran({ x: zone.x + zone.largeur, y: zone.y + zone.hauteur })
  return (
    <g className={`zone-terrain zone-${zone.teinte}${selectionnee ? ' selectionnee' : ''}`}>
      <rect
        x={coin.x}
        y={coin.y}
        width={zone.largeur}
        height={zone.hauteur}
        className={`zone-fond${interactif ? ' deplacable' : ''}`}
        onPointerDown={interactif ? onPrise : undefined}
      />
      {zone.libelle && (
        <text className="zone-libelle" x={centre.x} y={centre.y} fontSize={0.9 * taille}>
          {zone.libelle}
        </text>
      )}
      {selectionnee && interactif && (
        <g className="poignee-zone" onPointerDown={onTaille}>
          <rect x={poignee.x - 0.3} y={poignee.y - 0.3} width={0.6} height={0.6} />
          {/* Zone de saisie elargie : la poignee reste attrapable au doigt. */}
          <circle cx={poignee.x} cy={poignee.y} r={0.85} fill="transparent" />
        </g>
      )}
    </g>
  )
}

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
