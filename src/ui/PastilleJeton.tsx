/** Apercu d'un jeton, dans la palette et les listes. */

import { APPARENCES } from '../terrain/jetons'
import { DessinJeton } from '../terrain/formes'
import { ORIENTATION_PAR_DEFAUT, type TypeJeton } from '../domain/types'

export function PastilleJeton({ type }: { type: TypeJeton }) {
  const apparence = APPARENCES[type]
  return (
    <svg viewBox="-1.35 -1.35 2.7 2.7" className="pastille" aria-hidden="true">
      <g transform={`rotate(${ORIENTATION_PAR_DEFAUT[type] ?? 0})`}>
        <DessinJeton forme={apparence.forme} r={1} apparence={apparence} />
      </g>
    </svg>
  )
}
