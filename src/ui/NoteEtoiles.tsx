/**
 * Note de l'exercice, de 1 (a eviter) a 5 (incontournable).
 *
 * Cliquer sur l'etoile deja active remet la note a zero : un exercice peut
 * redevenir « non evalue » sans passer par un bouton supplementaire.
 */

import { LIBELLES_NOTE, type Evaluation } from '../domain/types'

interface Props {
  note: Evaluation['note']
  onChanger?: (note: Evaluation['note']) => void
  /** Affichage seul, sans interaction (listes, bibliotheque). */
  lectureSeule?: boolean
  taille?: 'normale' | 'compacte'
}

const VALEURS: Evaluation['note'][] = [1, 2, 3, 4, 5]

export function NoteEtoiles({ note, onChanger, lectureSeule = false, taille = 'normale' }: Props) {
  const classeNote = note === 0 ? 'sans-note' : note <= 2 ? 'note-basse' : note >= 4 ? 'note-haute' : 'note-moyenne'

  if (lectureSeule) {
    return (
      <span className={`etoiles lecture ${taille} ${classeNote}`} title={LIBELLES_NOTE[note]}>
        {note === 0 ? <span className="non-evalue">Non évalué</span> : '★'.repeat(note)}
      </span>
    )
  }

  return (
    <span
      className={`etoiles ${taille} ${classeNote}`}
      role="radiogroup"
      aria-label="Note de l'exercice"
    >
      {VALEURS.map((valeur) => (
        <button
          key={valeur}
          type="button"
          className={`etoile${valeur <= note ? ' pleine' : ''}`}
          role="radio"
          aria-checked={valeur === note}
          aria-label={`${valeur} sur 5 — ${LIBELLES_NOTE[valeur]}`}
          title={LIBELLES_NOTE[valeur]}
          onClick={() => onChanger?.(valeur === note ? 0 : valeur)}
        >
          ★
        </button>
      ))}
      <span className="libelle-note">{LIBELLES_NOTE[note]}</span>
    </span>
  )
}
