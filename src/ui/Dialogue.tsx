/**
 * Boites de dialogue de l'application.
 *
 * Les fenetres natives du navigateur (confirm) sont volontairement bannies :
 * elles ne portent ni les couleurs ni le vocabulaire de l'application, leur
 * apparence change d'un navigateur a l'autre, et elles bloquent toute la page.
 *
 * useConfirmation() rend une promesse, ce qui garde les appels aussi lisibles
 * qu'un confirm() :
 *
 *   if (await confirmer({ titre: 'Supprimer ?', danger: true })) { ... }
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export interface DemandeConfirmation {
  titre: string
  /** Precision affichee sous le titre. */
  message?: ReactNode
  libelleConfirmer?: string
  libelleAnnuler?: string
  /** Action destructrice : bouton rouge, et c'est « Annuler » qui a le focus. */
  danger?: boolean
}

type Confirmer = (demande: DemandeConfirmation) => Promise<boolean>

const Contexte = createContext<Confirmer | undefined>(undefined)

export function useConfirmation(): Confirmer {
  const confirmer = useContext(Contexte)
  if (!confirmer) throw new Error('useConfirmation exige un FournisseurDeDialogues')
  return confirmer
}

interface EnCours {
  demande: DemandeConfirmation
  repondre: (accepte: boolean) => void
}

export function FournisseurDeDialogues({ children }: { children: ReactNode }) {
  const [enCours, setEnCours] = useState<EnCours | undefined>()

  const confirmer = useCallback<Confirmer>(
    (demande) =>
      new Promise<boolean>((resoudre) => {
        setEnCours({
          demande,
          repondre: (accepte) => {
            setEnCours(undefined)
            resoudre(accepte)
          },
        })
      }),
    [],
  )

  return (
    <Contexte.Provider value={confirmer}>
      {children}
      {enCours && (
        <BoiteConfirmation
          demande={enCours.demande}
          onRepondre={enCours.repondre}
        />
      )}
    </Contexte.Provider>
  )
}

function BoiteConfirmation({
  demande,
  onRepondre,
}: {
  demande: DemandeConfirmation
  onRepondre: (accepte: boolean) => void
}) {
  const boite = useRef<HTMLDivElement>(null)
  const premierBouton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // Rend le focus a l'element qui a ouvert la boite : on repart d'ou l'on
    // etait, au clavier comme au lecteur d'ecran.
    const origine = document.activeElement as HTMLElement | null
    premierBouton.current?.focus()
    return () => origine?.focus?.()
  }, [])

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        evenement.preventDefault()
        onRepondre(false)
        return
      }
      if (evenement.key !== 'Tab') return
      // Le focus tourne en boucle dans la boite tant qu'elle est ouverte.
      const focalisables = boite.current?.querySelectorAll<HTMLElement>('button')
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
    // En capture : le raccourci passe avant ceux de la fiche d'exercice, qui
    // ecoute aussi Echap et Suppr.
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [onRepondre])

  const {
    titre,
    message,
    libelleConfirmer = 'Confirmer',
    libelleAnnuler = 'Annuler',
    danger = false,
  } = demande

  return (
    <div className="voile voile-dialogue" onPointerDown={() => onRepondre(false)}>
      <div
        ref={boite}
        className={`dialogue${danger ? ' dialogue-danger' : ''}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialogue-titre"
        aria-describedby={message ? 'dialogue-message' : undefined}
        onPointerDown={(evenement) => evenement.stopPropagation()}
      >
        <h2 id="dialogue-titre">{titre}</h2>
        {message && (
          <div id="dialogue-message" className="dialogue-message">
            {message}
          </div>
        )}
        <div className="dialogue-actions">
          {/* Sur une action destructrice, c'est « Annuler » qui prend le focus :
              une validation au clavier par reflexe ne detruit rien. */}
          <button
            ref={danger ? premierBouton : undefined}
            className="bouton"
            onClick={() => onRepondre(false)}
          >
            {libelleAnnuler}
          </button>
          <button
            ref={danger ? undefined : premierBouton}
            className={`bouton ${danger ? 'danger-plein' : 'principal'}`}
            onClick={() => onRepondre(true)}
          >
            {libelleConfirmer}
          </button>
        </div>
      </div>
    </div>
  )
}
