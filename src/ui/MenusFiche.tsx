/**
 * Les deux menus deroulants de la fiche d'exercice.
 *
 * Ils existent pour rendre de la hauteur au terrain : sur un ecran de 13
 * pouces, la palette permanente et la seconde barre d'outils consommaient a
 * elles deux pres de 300 pixels, pour des commandes qu'on utilise quelques fois
 * par fiche. Elles s'ouvrent desormais a la demande.
 *
 * Les cibles restent grandes au doigt : c'est le NOMBRE de commandes visibles
 * qui diminue, pas leur taille.
 */

import { useEffect, useRef, useState } from 'react'
import { APPARENCES, PALETTE } from '../terrain/jetons'
import { PastilleJeton } from './PastilleJeton'
import type { TypeJeton } from '../domain/types'

/** Ferme le menu au clic exterieur et a la touche Echap. */
function useFermetureExterieure(ouvert: boolean, fermer: () => void) {
  const conteneur = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ouvert) return
    const auClic = (evenement: PointerEvent) => {
      if (!conteneur.current?.contains(evenement.target as Node)) fermer()
    }
    const auClavier = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        evenement.preventDefault()
        fermer()
      }
    }
    // En phase de capture : le menu se ferme avant que le terrain ne recoive
    // le clic, sinon on deplacerait un jeton en voulant seulement fermer.
    document.addEventListener('pointerdown', auClic, true)
    window.addEventListener('keydown', auClavier, true)
    return () => {
      document.removeEventListener('pointerdown', auClic, true)
      window.removeEventListener('keydown', auClavier, true)
    }
  }, [ouvert, fermer])

  return conteneur
}

/** Bouton « + Ajouter » et son choix d'elements a poser sur le terrain. */
export function SelecteurJeton({ onChoisir }: { onChoisir: (type: TypeJeton) => void }) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useFermetureExterieure(ouvert, () => setOuvert(false))

  return (
    <div className="menu-flottant" ref={conteneur}>
      <button
        className={`bouton${ouvert ? ' enfonce' : ''}`}
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="menu"
        title="Ajouter un joueur, un ballon, du matériel"
      >
        + Ajouter
      </button>
      {ouvert && (
        <div className="panneau-flottant palette-flottante" role="menu">
          {PALETTE.map((type) => (
            <button
              key={type}
              className="bouton palette-item"
              role="menuitem"
              onClick={() => {
                onChoisir(type)
                setOuvert(false)
              }}
              title={APPARENCES[type].aide}
            >
              <PastilleJeton type={type} />
              {APPARENCES[type].libelle}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

interface PropsMenuActions {
  aimantation: boolean
  onAimantation: () => void
  onSymetrie: () => void
  onImage: () => void
  onProposer: () => void
  proposerPossible: boolean
  onRediger: () => void
  redigerPossible: boolean
}

/**
 * Actions secondaires du schema.
 *
 * Elles etaient sept icones alignees en permanence, en concurrence visuelle
 * avec les outils de trace alors qu'on ne s'en sert qu'une fois la fiche
 * ecrite. Annuler et retablir restent dehors : ceux-la servent en continu.
 */
export function MenuActions({
  aimantation,
  onAimantation,
  onSymetrie,
  onImage,
  onProposer,
  proposerPossible,
  onRediger,
  redigerPossible,
}: PropsMenuActions) {
  const [ouvert, setOuvert] = useState(false)
  const conteneur = useFermetureExterieure(ouvert, () => setOuvert(false))

  const choisir = (action: () => void) => () => {
    action()
    setOuvert(false)
  }

  return (
    <div className="menu-flottant" ref={conteneur}>
      <button
        className={`bouton discret${ouvert ? ' enfonce' : ''}`}
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="menu"
        aria-label="Autres actions"
        title="Autres actions"
      >
        ⋯
      </button>
      {ouvert && (
        <div className="panneau-flottant vers-le-bas menu-actions" role="menu">
          <button
            className={`entree-menu${aimantation ? ' active' : ''}`}
            role="menuitemcheckbox"
            aria-checked={aimantation}
            onClick={choisir(onAimantation)}
          >
            <span className="icone-menu">🧲</span>
            Aimantation
            <em>{aimantation ? 'active' : 'désactivée'}</em>
          </button>
          <button className="entree-menu" role="menuitem" onClick={choisir(onSymetrie)}>
            <span className="icone-menu">⇅</span>
            Symétrie
            <em>refaire de l'autre côté</em>
          </button>
          <button className="entree-menu" role="menuitem" onClick={choisir(onImage)}>
            <span className="icone-menu">🖼</span>
            Exporter en image
            <em>PNG du schéma</em>
          </button>
          <button
            className="entree-menu"
            role="menuitem"
            onClick={choisir(onProposer)}
            disabled={!proposerPossible}
          >
            <span className="icone-menu">⤳</span>
            Proposer des mouvements
            <em>{proposerPossible ? "d'après le déroulement" : 'écrivez un déroulement'}</em>
          </button>
          <button
            className="entree-menu"
            role="menuitem"
            onClick={choisir(onRediger)}
            disabled={!redigerPossible}
          >
            <span className="icone-menu">✎</span>
            Rédiger le déroulement
            <em>{redigerPossible ? "d'après le schéma" : 'tracez des mouvements'}</em>
          </button>
        </div>
      )}
    </div>
  )
}
