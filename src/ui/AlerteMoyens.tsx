/**
 * Avertissement quand un exercice demande plus que la seance n'offre.
 *
 * Deux manques, un seul bandeau : l'effectif et l'espace. Ce sont les deux
 * moyens qui font ou defont une seance, ils se decouvrent au meme moment — en
 * arrivant au gymnase — et les separer en deux bandeaux empiles ferait deux
 * fois plus de bruit pour la meme information.
 *
 * L'alerte informe, elle ne bloque pas : un entraineur sait adapter un exercice
 * a deux joueurs pres ou le resserrer sur un demi-terrain, et c'est lui qui
 * decide. Le but est seulement qu'il ne le decouvre pas sur place.
 */

import { LIBELLES_ESPACE, type Espace, type Manque, type Seance } from '../domain/types'

interface Props {
  /** Manque d'effectif, absent s'il n'y en a pas. */
  manque?: Manque
  /** Espace reclame par l'exercice quand il depasse celui du jour. */
  espaceManquant?: Espace
  seance: Seance
}

/**
 * « qu'un quart de salle », et non « que un quart de salle ».
 *
 * Les trois libelles d'espace commencent par « un » ou par « le » : les uns
 * elident, les autres non. Une phrase construite par concatenation doit donc
 * choisir, sinon l'application ecrit un francais fautif dans le bandeau que
 * l'entraineur lira le plus souvent.
 */
function avecElision(libelle: string): string {
  return /^[aeiouyéèêà]/i.test(libelle) ? `qu'${libelle}` : `que ${libelle}`
}

export function AlerteMoyens({ manque, espaceManquant, seance }: Props) {
  const morceaux: string[] = []
  if (manque && manque.joueurs > 0) {
    morceaux.push(
      `${manque.joueurs} joueur${manque.joueurs > 1 ? 's' : ''} de champ (${seance.effectifJoueurs} présent${seance.effectifJoueurs > 1 ? 's' : ''})`,
    )
  }
  if (manque && manque.gardiens > 0) {
    morceaux.push(
      `${manque.gardiens} gardien${manque.gardiens > 1 ? 's' : ''} (${seance.effectifGardiens} présent${seance.effectifGardiens > 1 ? 's' : ''})`,
    )
  }

  return (
    <div className="alerte-effectif">
      <strong>
        {morceaux.length > 0 && espaceManquant
          ? 'Effectif et espace insuffisants'
          : morceaux.length > 0
            ? 'Effectif insuffisant'
            : 'Espace insuffisant'}
      </strong>
      {morceaux.length > 0 && (
        <>
          Il manque {morceaux.join(' et ')} pour mener cet exercice tel qu'il est décrit. Adaptez le
          nombre de joueurs, ou prévoyez une rotation.
        </>
      )}
      {espaceManquant && (
        <>
          {morceaux.length > 0 && ' '}
          Cet exercice demande {LIBELLES_ESPACE[espaceManquant].toLowerCase()}, et vous n'avez{' '}
          {seance.espaceDisponible
            ? avecElision(LIBELLES_ESPACE[seance.espaceDisponible].toLowerCase())
            : "que l'espace annoncé"}{' '}
          ce jour-là. Resserrez la situation, ou remplacez-la.
        </>
      )}
    </div>
  )
}
