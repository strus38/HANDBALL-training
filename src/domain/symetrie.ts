/**
 * Symetrie d'un exercice : refaire le meme mouvement de l'autre cote.
 *
 * Le handball est symetrique. Un croise arriere-ailier travaille cote droit
 * puis cote gauche, un ecran se pose d'un cote comme de l'autre. Redessiner le
 * miroir a la main represente la moitie du travail — et introduit des ecarts
 * la ou il ne devrait pas y en avoir.
 *
 * L'axe est celui de la longueur du terrain : on echange le haut et le bas,
 * jamais les deux buts. L'attaque continue de se jouer dans le meme sens.
 */

import { TERRAIN, type Jeton, type Position, type Schema } from './types'

/** Image d'un point par la symetrie d'axe median. */
export function refleterPosition(position: Position): Position {
  const reflete: Position = { ...position, y: TERRAIN.largeur - position.y }
  if (position.orientation !== undefined) {
    reflete.orientation = refleterAngle(position.orientation)
  }
  return reflete
}

/**
 * Image d'une direction par la meme symetrie.
 *
 * L'angle se mesure depuis le haut du terrain : echanger haut et bas revient a
 * prendre le supplement. Regarder vers la droite (90°) reste regarder vers la
 * droite ; regarder vers le haut (0°) devient regarder vers le bas (180°).
 */
export function refleterAngle(angle: number): number {
  return (((180 - angle) % 360) + 360) % 360
}

/**
 * Etiquette symetrique : un ailier gauche devient ailier droit.
 *
 * Seuls les libelles de poste connus sont retournes. Un numero de maillot ou
 * une etiquette libre reste inchange : le joueur change de cote, pas de nom.
 */
export function refleterEtiquette(etiquette: string): string {
  const postes: Record<string, string> = {
    AlG: 'AlD',
    AlD: 'AlG',
    ArG: 'ArD',
    ArD: 'ArG',
    DG: 'DD',
    DD: 'DG',
  }
  return postes[etiquette] ?? etiquette
}

/**
 * Symetrique complet d'un schema : toutes les etapes, toutes les positions,
 * les orientations imposees, les fleches libres et les courbures.
 *
 * Les fleches liees a un jeton n'ont rien a refleter : leurs extremites sont
 * les positions des jetons, qui viennent d'etre reflechies.
 */
export function refleterSchema(schema: Schema): Schema {
  return {
    ...schema,
    jetons: schema.jetons.map(
      (jeton): Jeton => ({
        ...jeton,
        etiquette: refleterEtiquette(jeton.etiquette),
        orientation: jeton.orientation === undefined ? undefined : refleterAngle(jeton.orientation),
      }),
    ),
    etapes: schema.etapes.map((etape) => ({
      ...etape,
      positions: Object.fromEntries(
        Object.entries(etape.positions).map(([id, position]) => [id, refleterPosition(position)]),
      ),
      fleches: etape.fleches.map((fleche) => ({
        ...fleche,
        depart: fleche.depart ? refleterPosition(fleche.depart) : undefined,
        arrivee: fleche.arrivee ? refleterPosition(fleche.arrivee) : undefined,
        courbure: fleche.courbure ? refleterPosition(fleche.courbure) : undefined,
      })),
    })),
  }
}
