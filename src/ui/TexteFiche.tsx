/**
 * Rendu du texte d'une fiche : une ligne, un paragraphe.
 *
 * Une seule regle de presentation s'y ajoute : la ligne de PROVENANCE se met en
 * italique. Le projet n'a pas de champ « source » — la provenance se dit dans
 * le texte, comme les combinaisons du repertoire classique le font depuis
 * toujours. C'est un choix qui tient, mais il a une consequence : rien ne
 * distingue alors la mention de son voisinage, et « Source : 20 exercices —
 * Philippe Boeckler, exercice 11. » se lit comme une consigne de plus au milieu
 * du deroulement.
 *
 * L'italique remet chaque chose a sa place sans rien ajouter aux donnees : le
 * texte reste ce que l'entraineur a ecrit, c'est l'affichage qui le nuance.
 */

import type { ReactNode } from 'react'

/**
 * Ce qui ouvre une ligne de provenance.
 *
 * Deux formes plutot qu'une : l'importation de cahiers ecrit « Source : », et
 * un entraineur qui cite un collegue ecrit spontanement « D'apres ».
 */
const PROVENANCE = /^\s*(?:source\s*:|d[’']après\b|d[’']apres\b)/i

export function estProvenance(ligne: string): boolean {
  return PROVENANCE.test(ligne)
}

/** Les lignes non vides d'un texte, chacune dans son paragraphe. */
export function TexteFiche({ texte }: { texte: string }): ReactNode {
  return texte
    .split('\n')
    .filter(Boolean)
    .map((ligne, i) =>
      estProvenance(ligne) ? (
        <p key={i} className="provenance">
          {ligne}
        </p>
      ) : (
        <p key={i}>{ligne}</p>
      ),
    )
}

/** Meme regle, pour un texte rendu en liste a puces. */
export function ElementsFiche({ texte }: { texte: string }): ReactNode {
  return texte
    .split('\n')
    .filter(Boolean)
    .map((ligne, i) => (
      <li key={i} className={estProvenance(ligne) ? 'provenance' : undefined}>
        {ligne}
      </li>
    ))
}
