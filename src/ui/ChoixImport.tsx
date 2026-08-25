/**
 * Que faire des fiches qui portent un titre deja present.
 *
 * La question ne se pose que pour celles-la : une fiche inconnue entre sans
 * rien demander, une fiche identique n'appelle aucune decision. Poser la
 * question pour tout aurait fait cliquer l'entraineur a chaque importation,
 * y compris quand il n'y a rien a arbitrer.
 */

import { useEffect, useRef, useState } from 'react'
import type { ChoixImport as Choix, Divergence } from '../domain/rapprochement'

interface Props {
  divergentes: Divergence[]
  /** Fiches qui entreront de toute facon, pour dire l'ampleur de l'importation. */
  nouvelles: number
  identiques: number
  onChoisir: (choix: Choix) => void
  onAnnuler: () => void
}

export function ChoixImport({ divergentes, nouvelles, identiques, onChoisir, onAnnuler }: Props) {
  const [choix, setChoix] = useState<Choix>('remplacer')
  const boite = useRef<HTMLFormElement>(null)
  const premier = useRef<HTMLInputElement>(null)

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
        return
      }
      if (evenement.key !== 'Tab') return
      const focalisables = boite.current?.querySelectorAll<HTMLElement>('input, button')
      if (!focalisables || focalisables.length === 0) return
      const debut = focalisables[0]
      const fin = focalisables[focalisables.length - 1]
      if (evenement.shiftKey && document.activeElement === debut) {
        evenement.preventDefault()
        fin.focus()
      } else if (!evenement.shiftKey && document.activeElement === fin) {
        evenement.preventDefault()
        debut.focus()
      }
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [onAnnuler])

  const nombre = divergentes.length

  return (
    <div className="voile voile-dialogue" onPointerDown={onAnnuler}>
      <form
        ref={boite}
        className="dialogue dialogue-large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-titre"
        onPointerDown={(evenement) => evenement.stopPropagation()}
        onSubmit={(evenement) => {
          evenement.preventDefault()
          onChoisir(choix)
        }}
      >
        <h2 id="import-titre">
          {nombre} fiche{nombre > 1 ? 's' : ''} déjà dans votre bibliothèque
        </h2>
        <p className="dialogue-message">
          {nombre > 1 ? 'Elles portent' : 'Elle porte'} un titre que vous avez déjà, avec un
          contenu différent. Que faut-il en faire ?
        </p>

        <ul className="liste-divergences">
          {divergentes.slice(0, 8).map((d) => (
            <li key={d.arrivante.id}>{d.arrivante.titre || 'Sans titre'}</li>
          ))}
          {divergentes.length > 8 && <li className="reste">et {divergentes.length - 8} autres…</li>}
        </ul>

        <div className="choix-import">
          <label className="case-a-cocher">
            <input
              ref={premier}
              type="radio"
              name="choix"
              checked={choix === 'remplacer'}
              onChange={() => setChoix('remplacer')}
            />
            <span>
              Remplacer par la nouvelle version
              <small>
                Le texte est mis à jour. Vos notes, vos commentaires et vos compteurs
                d'utilisation sont conservés : ils sont à vous, pas au fichier.
              </small>
            </span>
          </label>
          <label className="case-a-cocher">
            <input
              type="radio"
              name="choix"
              checked={choix === 'ajouter'}
              onChange={() => setChoix('ajouter')}
            />
            <span>
              Ajouter à côté
              <small>
                Vous gardez les deux versions et vous triez ensuite. C'est le comportement des
                versions précédentes.
              </small>
            </span>
          </label>
          <label className="case-a-cocher">
            <input
              type="radio"
              name="choix"
              checked={choix === 'ignorer'}
              onChange={() => setChoix('ignorer')}
            />
            <span>
              Laisser de côté
              <small>Votre version ne bouge pas, celle du fichier est écartée.</small>
            </span>
          </label>
        </div>

        <p className="dialogue-note">
          {nouvelles > 0 && (
            <>
              {nouvelles} fiche{nouvelles > 1 ? 's' : ''} inconnue{nouvelles > 1 ? 's' : ''}{' '}
              {nouvelles > 1 ? 'seront ajoutées' : 'sera ajoutée'} dans tous les cas.
            </>
          )}
          {identiques > 0 && (
            <>
              {nouvelles > 0 && ' '}
              {identiques} {identiques > 1 ? 'sont déjà présentes' : 'est déjà présente'} à
              l'identique.
            </>
          )}
        </p>

        <div className="dialogue-actions">
          <button type="button" className="bouton" onClick={onAnnuler}>
            Annuler l'import
          </button>
          <button type="submit" className="bouton principal">
            Importer
          </button>
        </div>
      </form>
    </div>
  )
}
