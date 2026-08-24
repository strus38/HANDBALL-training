/**
 * Aperçu des mouvements proposes a partir du deroulement ecrit.
 *
 * L'analyseur se trompe souvent : sur les fiches de reference, il retrouve
 * environ un mouvement sur trois quand le texte decrit vraiment une action, et
 * place la destination a trois metres pres en moyenne. Cet ecran existe pour
 * que ce soit visible AVANT d'appliquer quoi que ce soit — chaque proposition
 * affiche son niveau de confiance et ce qui a permis de la situer.
 */

import { useEffect, useRef } from 'react'
import { decrireProposition, type EtapeProposee } from '../domain/analyseTexte'
import type { Schema } from '../domain/types'

interface Props {
  schema: Schema
  propositions: EtapeProposee[]
  onAppliquer: () => void
  onAnnuler: () => void
}

const LIBELLES_CONFIANCE = {
  haute: 'sûr',
  moyenne: 'à vérifier',
  faible: 'approximatif',
} as const

export function PropositionMouvements({ schema, propositions, onAppliquer, onAnnuler }: Props) {
  const boite = useRef<HTMLDivElement>(null)
  const premier = useRef<HTMLButtonElement>(null)
  const actions = propositions.flatMap((p) => p.actions)

  useEffect(() => {
    const origine = document.activeElement as HTMLElement | null
    premier.current?.focus()
    return () => origine?.focus?.()
  }, [])

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        evenement.preventDefault()
        onAnnuler()
      }
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [onAnnuler])

  const approximatives = actions.filter((a) => a.confiance === 'faible').length

  return (
    <div className="voile voile-dialogue" onPointerDown={onAnnuler}>
      <div
        ref={boite}
        className="dialogue dialogue-large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="proposition-titre"
        onPointerDown={(evenement) => evenement.stopPropagation()}
      >
        <h2 id="proposition-titre">Mouvements proposés</h2>

        {actions.length === 0 ? (
          <p className="dialogue-message">
            Rien n'a pu être déduit de ce déroulement. C'est fréquent : un texte qui décrit une
            organisation (« séries de trois attaques », « le bloc glisse ») ne contient pas le
            mouvement lui-même. Nommez les postes et les actions — « l'arrière droit part en
            course, puis passe à l'ailier droit » — pour que la lecture soit possible.
          </p>
        ) : (
          <>
            <p className="dialogue-message">
              {actions.length} action{actions.length > 1 ? 's' : ''} lue
              {actions.length > 1 ? 's' : ''} dans votre texte. Elles seront ajoutées comme
              nouvelles étapes, à corriger ensuite sur le terrain — et Ctrl+Z annule tout.
            </p>

            <ol className="liste-propositions">
              {actions.map((action, rang) => (
                <li key={rang} className={`proposition confiance-${action.confiance}`}>
                  <span className="rang-proposition">{rang + 1}</span>
                  <span className="corps-proposition">
                    <strong>{decrireProposition(schema, action)}</strong>
                    <em className="source-proposition">« {action.phrase} »</em>
                    <em className="indice-proposition">Situé d'après : {action.indice}</em>
                  </span>
                  <span className={`etiquette-confiance ${action.confiance}`}>
                    {LIBELLES_CONFIANCE[action.confiance]}
                  </span>
                </li>
              ))}
            </ol>

            {approximatives > 0 && (
              <p className="avertissement-proposition">
                {approximatives} destination{approximatives > 1 ? 's sont' : ' est'} placée
                {approximatives > 1 ? 's' : ''} approximativement : le texte dit « dans le dos »
                ou « vers l'extérieur », ce qui ne se traduit pas en mètres. Vérifiez-les sur le
                terrain.
              </p>
            )}
          </>
        )}

        <div className="dialogue-actions">
          <button ref={actions.length === 0 ? premier : undefined} className="bouton" onClick={onAnnuler}>
            {actions.length === 0 ? 'Fermer' : 'Annuler'}
          </button>
          {actions.length > 0 && (
            <button ref={premier} className="bouton principal" onClick={onAppliquer}>
              Ajouter ces mouvements
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
