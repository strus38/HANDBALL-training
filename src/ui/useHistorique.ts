/**
 * Historique annuler / retablir.
 *
 * L'historique porte sur le schema d'un seul exercice et vit le temps de son
 * edition : ouvrir une autre fiche repart d'un historique vierge, ce qui evite
 * qu'un Ctrl+Z annule une modification faite sur un exercice qu'on ne regarde
 * plus.
 *
 * Les trois piles sont dans un seul etat : passe, present et futur changent
 * toujours ensemble, les separer ouvrirait la porte a des etats incoherents.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

const PROFONDEUR_MAX = 60

interface Piles<T> {
  passe: T[]
  present: T
  futur: T[]
}

export interface Historique<T> {
  present: T
  /**
   * Enregistre un nouvel etat et le rend courant.
   *
   * La transformation recoit l'etat courant plutot qu'une valeur deja calculee :
   * deux actions declenchees dans le meme cycle de rendu s'enchainent alors
   * correctement, au lieu de partir toutes les deux du meme etat et de se
   * remplacer l'une l'autre.
   */
  pousser: (transformation: (precedent: T) => T) => void
  annuler: () => void
  retablir: () => void
  peutAnnuler: boolean
  peutRetablir: boolean
}

export function useHistorique<T>(initial: T, onChangement?: (valeur: T) => void): Historique<T> {
  const [piles, setPiles] = useState<Piles<T>>({ passe: [], present: initial, futur: [] })

  // Reference toujours a jour, sans reconstruire les fonctions a chaque rendu.
  const rappel = useRef(onChangement)
  rappel.current = onChangement

  // Le rappel est declenche par un effet, et non depuis les fonctions de mise a
  // jour : React peut les rejouer (mode strict), ce qui enregistrerait deux fois
  // la meme modification.
  const dernierNotifie = useRef(initial)
  useEffect(() => {
    if (piles.present === dernierNotifie.current) return
    dernierNotifie.current = piles.present
    rappel.current?.(piles.present)
  }, [piles.present])

  const pousser = useCallback((transformation: (precedent: T) => T) => {
    setPiles((p) => ({
      passe: [...p.passe, p.present].slice(-PROFONDEUR_MAX),
      present: transformation(p.present),
      futur: [],
    }))
  }, [])

  const annuler = useCallback(() => {
    setPiles((p) =>
      p.passe.length === 0
        ? p
        : {
            passe: p.passe.slice(0, -1),
            present: p.passe[p.passe.length - 1],
            futur: [p.present, ...p.futur],
          },
    )
  }, [])

  const retablir = useCallback(() => {
    setPiles((p) =>
      p.futur.length === 0
        ? p
        : {
            passe: [...p.passe, p.present],
            present: p.futur[0],
            futur: p.futur.slice(1),
          },
    )
  }, [])

  return {
    present: piles.present,
    pousser,
    annuler,
    retablir,
    peutAnnuler: piles.passe.length > 0,
    peutRetablir: piles.futur.length > 0,
  }
}
