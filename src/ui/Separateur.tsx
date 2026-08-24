/**
 * Separateur deplacable entre deux colonnes.
 *
 * L'entraineur n'a pas toujours le meme besoin : quand il place ses joueurs il
 * veut un grand terrain, quand il redige le deroulement il veut de la place
 * pour ecrire. La position choisie est donc retenue d'une seance a l'autre.
 *
 * Elle est enregistree dans localStorage et non dans le depot : c'est une
 * preference d'affichage liee au poste de travail, pas une donnee de la seance.
 * Elle n'a donc rien a faire dans un fichier .hbt.json exporte. Si le stockage
 * est refuse par le navigateur, le separateur fonctionne quand meme, il repart
 * simplement de sa position par defaut a chaque ouverture.
 */

import { useCallback, useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'

const PREFIXE = 'hbpsm.separateur.'

/**
 * Largeur minimale de chaque colonne, en pixels. En dessous, la barre d'outils
 * du terrain se replie sur trois lignes et les champs de texte deviennent
 * inutilisables : mieux vaut empecher le geste que laisser casser la mise en page.
 */
const MIN_GAUCHE = 380
const MIN_DROITE = 330

/**
 * Largeur de la poignee elle-meme, en pixels. Elle occupe une colonne de la
 * grille : sans la compter, la colonne de droite se retrouverait plus etroite
 * que son minimum. La valeur est passee au CSS pour que les deux ne divergent pas.
 */
const POIGNEE = 7

/** Pas du deplacement au clavier, en part de largeur. */
const PAS = 0.02

function lire(cle: string, parDefaut: number): number {
  try {
    const brut = localStorage.getItem(PREFIXE + cle)
    const valeur = brut === null ? Number.NaN : Number(brut)
    return Number.isFinite(valeur) && valeur > 0 && valeur < 1 ? valeur : parDefaut
  } catch {
    return parDefaut
  }
}

function ecrire(cle: string, valeur: number) {
  try {
    localStorage.setItem(PREFIXE + cle, String(valeur))
  } catch {
    // Stockage refuse : la position vaut pour la session, c'est tout.
  }
}

export interface Separation {
  /** Part de la largeur prise par la colonne de gauche, entre 0 et 1. */
  part: number
  /** A poser sur le conteneur en grille, pour mesurer la largeur disponible. */
  refConteneur: RefObject<HTMLDivElement>
  /** Style a poser sur ce meme conteneur : alimente la grille CSS. */
  style: CSSProperties
  /** Vrai pendant le glissement, pour neutraliser la selection de texte. */
  enDeplacement: boolean
  deplacer: (part: number) => void
  /** Decale la position, a partir de la valeur courante et non d'un rendu passe. */
  ajuster: (delta: number) => void
  terminer: () => void
  reinitialiser: () => void
  demarrer: () => void
}

export function useSeparation(cle: string, parDefaut: number): Separation {
  const refConteneur = useRef<HTMLDivElement>(null)
  const [part, setPart] = useState(() => lire(cle, parDefaut))
  const [enDeplacement, setEnDeplacement] = useState(false)

  const borner = useCallback((valeur: number) => {
    const largeur = refConteneur.current?.clientWidth ?? 0
    // Trop etroit pour deux colonnes : la mise en page s'empile, le separateur
    // est masque et la valeur n'a plus d'effet. Inutile de la contraindre.
    if (largeur < MIN_GAUCHE + MIN_DROITE + POIGNEE) return valeur
    return Math.min(
      1 - (MIN_DROITE + POIGNEE) / largeur,
      Math.max(MIN_GAUCHE / largeur, valeur),
    )
  }, [])

  // La valeur courante est aussi tenue dans une ref : l'enregistrement se fait
  // au relachement, hors de tout calcul d'etat, pour ne pas ecrire dans le
  // stockage depuis une fonction que React peut rejouer.
  const derniere = useRef(part)
  const poser = useCallback((valeur: number) => {
    derniere.current = valeur
    setPart(valeur)
  }, [])

  const deplacer = useCallback((valeur: number) => poser(borner(valeur)), [borner, poser])

  // Au clavier, les repetitions se suivent plus vite que les rendus : partir de
  // la valeur affichee ferait perdre des pas. On part donc de la ref.
  const ajuster = useCallback(
    (delta: number) => poser(borner(derniere.current + delta)),
    [borner, poser],
  )
  const terminer = useCallback(() => {
    setEnDeplacement(false)
    ecrire(cle, derniere.current)
  }, [cle])

  const reinitialiser = useCallback(() => {
    poser(borner(parDefaut))
    ecrire(cle, parDefaut)
  }, [borner, cle, parDefaut, poser])

  // La fenetre retrecit : une position gardee d'un grand ecran laisserait la
  // colonne de droite trop etroite. On la ramene dans les bornes du moment.
  useEffect(() => {
    const surRedimensionnement = () => poser(borner(derniere.current))
    window.addEventListener('resize', surRedimensionnement)
    return () => window.removeEventListener('resize', surRedimensionnement)
  }, [borner, poser])

  return {
    part,
    refConteneur,
    style: {
      '--part-terrain': `${(part * 100).toFixed(2)}%`,
      '--largeur-poignee': `${POIGNEE}px`,
    } as CSSProperties,
    enDeplacement,
    deplacer,
    ajuster,
    terminer,
    reinitialiser,
    demarrer: () => setEnDeplacement(true),
  }
}

interface Props {
  separation: Separation
  /** Nom des deux zones, pour les lecteurs d'ecran. */
  libelle: string
}

export function Separateur({ separation, libelle }: Props) {
  const { part, refConteneur, enDeplacement, deplacer, ajuster, terminer, reinitialiser, demarrer } =
    separation

  const positionner = (clientX: number) => {
    const cadre = refConteneur.current?.getBoundingClientRect()
    if (!cadre || cadre.width === 0) return
    deplacer((clientX - cadre.left) / cadre.width)
  }

  return (
    <div
      className={`separateur${enDeplacement ? ' actif' : ''}`}
      role="separator"
      aria-orientation="vertical"
      aria-label={libelle}
      aria-valuenow={Math.round(part * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      tabIndex={0}
      title="Glisser pour redimensionner · double-clic pour revenir à la position par défaut"
      onPointerDown={(e) => {
        // La capture garde le pointeur sur la poignee meme quand il passe
        // au-dessus du terrain, qui possede ses propres gestes.
        e.currentTarget.setPointerCapture(e.pointerId)
        e.preventDefault()
        demarrer()
      }}
      onPointerMove={(e) => {
        // La capture du pointeur est le seul temoin fiable d'un glissement en
        // cours : l'etat React, lui, peut ne pas encore avoir ete re-rendu.
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
        positionner(e.clientX)
      }}
      onPointerUp={(e) => {
        e.currentTarget.releasePointerCapture(e.pointerId)
        terminer()
      }}
      onPointerCancel={terminer}
      onDoubleClick={reinitialiser}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') ajuster(-PAS)
        else if (e.key === 'ArrowRight') ajuster(PAS)
        else if (e.key === 'Home' || e.key === 'Enter') reinitialiser()
        else return
        e.preventDefault()
      }}
      onKeyUp={terminer}
    />
  )
}
