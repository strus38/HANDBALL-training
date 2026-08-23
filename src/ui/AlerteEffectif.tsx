/**
 * Avertissement quand un exercice demande plus de monde que l'effectif annonce.
 *
 * L'alerte informe, elle ne bloque pas : un entraineur sait adapter un exercice
 * a deux joueurs pres, et c'est lui qui decide. Le but est seulement qu'il ne
 * le decouvre pas au gymnase.
 */

import type { Manque, Seance } from '../domain/types'

export function AlerteEffectif({ manque, seance }: { manque: Manque; seance: Seance }) {
  const morceaux: string[] = []
  if (manque.joueurs > 0) {
    morceaux.push(
      `${manque.joueurs} joueur${manque.joueurs > 1 ? 's' : ''} de champ (${seance.effectifJoueurs} present${seance.effectifJoueurs > 1 ? 's' : ''})`,
    )
  }
  if (manque.gardiens > 0) {
    morceaux.push(
      `${manque.gardiens} gardien${manque.gardiens > 1 ? 's' : ''} (${seance.effectifGardiens} present${seance.effectifGardiens > 1 ? 's' : ''})`,
    )
  }
  return (
    <div className="alerte-effectif">
      <strong>Effectif insuffisant</strong>
      Il manque {morceaux.join(' et ')} pour mener cet exercice tel qu'il est decrit. Adaptez le
      nombre de joueurs, ou prevoyez une rotation.
    </div>
  )
}
