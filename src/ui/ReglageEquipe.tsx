/**
 * Reglage « Mon equipe », ouvert depuis l'en-tete.
 *
 * Une question posee une fois par saison, pas une fois par seance. Elle vit
 * dans l'en-tete et non dans un ecran de reglages : l'application n'en a pas,
 * et une seule preference n'en justifie pas un.
 */

import { useEffect, useRef, useState } from 'react'
import { MAX_LONGUEUR_EQUIPE, type MonEquipe } from '../domain/equipe'

interface Props {
  monEquipe: MonEquipe
  onValider: (equipe: MonEquipe) => void
  onAnnuler: () => void
}

export function ReglageEquipe({ monEquipe, onValider, onAnnuler }: Props) {
  const [equipe, setEquipe] = useState(monEquipe.equipe)
  const [categorieAge, setCategorieAge] = useState(monEquipe.categorieAge)

  const boite = useRef<HTMLFormElement>(null)
  const premierChamp = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const origine = document.activeElement as HTMLElement | null
    premierChamp.current?.focus()
    premierChamp.current?.select()
    return () => origine?.focus?.()
  }, [])

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        evenement.preventDefault()
        onAnnuler()
        return
      }
      if (evenement.key !== 'Tab') return
      const focalisables = boite.current?.querySelectorAll<HTMLElement>('input, button')
      if (!focalisables || focalisables.length === 0) return
      const premier = focalisables[0]
      const dernier = focalisables[focalisables.length - 1]
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault()
        dernier.focus()
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault()
        premier.focus()
      }
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [onAnnuler])

  return (
    <div className="voile voile-dialogue" onPointerDown={onAnnuler}>
      <form
        ref={boite}
        className="dialogue"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipe-titre"
        onPointerDown={(evenement) => evenement.stopPropagation()}
        onSubmit={(evenement) => {
          evenement.preventDefault()
          onValider({
            equipe: equipe.trim().slice(0, MAX_LONGUEUR_EQUIPE),
            categorieAge: categorieAge.trim().slice(0, MAX_LONGUEUR_EQUIPE),
          })
        }}
      >
        <h2 id="equipe-titre">Mon équipe</h2>
        <p className="dialogue-message">
          Renseignée une fois, elle est reprise sur chaque nouvelle séance et sur les feuilles
          imprimées. Les séances déjà créées gardent l'équipe avec laquelle elles ont été menées.
        </p>

        <div className="grille-equipe">
          <label className="champ">
            <span>Équipe</span>
            <input
              ref={premierChamp}
              type="text"
              value={equipe}
              maxLength={MAX_LONGUEUR_EQUIPE}
              placeholder="Seniors garçons"
              onChange={(e) => setEquipe(e.target.value)}
            />
          </label>
          <label className="champ">
            <span>Catégorie</span>
            <input
              type="text"
              value={categorieAge}
              maxLength={MAX_LONGUEUR_EQUIPE}
              placeholder="+18 ans"
              onChange={(e) => setCategorieAge(e.target.value)}
            />
          </label>
        </div>

        <div className="dialogue-actions">
          <button type="button" className="bouton" onClick={onAnnuler}>
            Annuler
          </button>
          <button type="submit" className="bouton principal">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
