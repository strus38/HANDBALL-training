/**
 * Dessin des jetons, centre sur l'origine et oriente vers le HAUT.
 *
 * Le composant ne se place pas lui-meme : l'appelant applique une translation
 * puis une rotation. Le meme dessin sert ainsi sur le terrain, dans la palette
 * et dans les apercus de la bibliotheque, sans risque de divergence.
 *
 * Le joueur est un disque a la couleur du camp, avec deux bras tendus vers
 * l'avant qui se rejoignent : c'est la seule chose qui tourne, donc la seule
 * qui dit ou il regarde. Le disque, lui, garde le meme contour quel que soit
 * l'angle, ce qu'une silhouette detaillee ne fait pas.
 *
 * Le corps est volontairement plus etroit que l'etiquette ne le suggere : a
 * 0,82 du rayon de reference, six defenseurs espaces de deux metres ne se
 * chevauchent plus, alors qu'ils se touchaient avec l'ancien dessin.
 *
 * La pastille et l'etiquette ne sont PAS dessinees ici : elles ne doivent pas
 * tourner avec le joueur. Terrain.tsx les pose par-dessus, sans rotation.
 */

import type { ApparenceJeton, Forme } from './jetons'

/** Rayon du corps du joueur, en fraction du rayon de reference. */
export const RAYON_CORPS = 0.82

/**
 * Rayon de la pastille qui porte l'etiquette. Le reste - 0,16 du rayon de
 * reference - forme le lisere colore qui fait lire le camp d'un coup d'oeil.
 */
export const RAYON_PASTILLE = 0.66

interface Props {
  forme: Forme
  /** Rayon de reference, en metres. */
  r: number
  apparence: ApparenceJeton
}

export function DessinJeton({ forme, r, apparence }: Props) {
  const remplissage = apparence.remplissage
  const contour = apparence.contour
  const trait = r * 0.15

  switch (forme) {
    case 'joueur':
      return (
        <g>
          {/* Bras tendus, convergents : ils tracent la direction du regard.
              Traces avant le corps, leur racine passe dessous. */}
          <line
            x1={0.66 * r}
            y1={-0.36 * r}
            x2={0.3 * r}
            y2={-1.28 * r}
            stroke={contour}
            strokeWidth={r * 0.21}
            strokeLinecap="round"
          />
          <line
            x1={-0.66 * r}
            y1={-0.36 * r}
            x2={-0.3 * r}
            y2={-1.28 * r}
            stroke={contour}
            strokeWidth={r * 0.21}
            strokeLinecap="round"
          />
          <circle
            cx={0}
            cy={0}
            r={RAYON_CORPS * r}
            fill={remplissage}
            stroke={contour}
            strokeWidth={r * 0.13}
          />
        </g>
      )

    /**
     * Colonne : le joueur de tete, et derriere lui la file qui attend.
     *
     * Trois disques degressifs plutot qu'un empilement realiste : la tete est
     * pleine et porte l'etiquette, les deux suivants s'estompent en profondeur.
     * L'oeil lit « il y en a d'autres derriere » sans compter les disques, et
     * le dessin garde le meme encombrement qu'un joueur seul — c'est justement
     * ce qu'une colonne occupe au sol.
     *
     * La file s'etire vers l'ARRIERE du jeton : elle tourne donc avec lui, et
     * l'orientation dit ou regarde le premier de la colonne.
     */
    case 'colonne':
      return (
        <g>
          <circle
            cx={0}
            cy={1.55 * r}
            r={0.62 * r}
            fill={remplissage}
            stroke={contour}
            strokeWidth={r * 0.11}
            opacity={0.42}
          />
          <circle
            cx={0}
            cy={0.85 * r}
            r={0.72 * r}
            fill={remplissage}
            stroke={contour}
            strokeWidth={r * 0.12}
            opacity={0.7}
          />
          <circle
            cx={0}
            cy={0}
            r={RAYON_CORPS * r}
            fill={remplissage}
            stroke={contour}
            strokeWidth={r * 0.13}
          />
        </g>
      )

    /**
     * Cerceau : un anneau, pas un disque.
     *
     * Le trou compte autant que le trait — on voit le terrain au travers, et
     * un joueur pose dessus reste visible. Un disque plein aurait masque le
     * pied qu'il sert justement a placer.
     */
    case 'anneau':
      return (
        <circle
          cx={0}
          cy={0}
          r={0.82 * r}
          fill="none"
          stroke={contour}
          strokeWidth={r * 0.3}
        />
      )

    case 'triangle':
      return (
        <polygon
          points={`0,${-r} ${0.95 * r},${0.75 * r} ${-0.95 * r},${0.75 * r}`}
          fill={remplissage}
          stroke={contour}
          strokeWidth={trait}
        />
      )

    case 'carre':
      return (
        <rect
          x={-0.9 * r}
          y={-0.9 * r}
          width={1.8 * r}
          height={1.8 * r}
          rx={0.18 * r}
          fill={remplissage}
          stroke={contour}
          strokeWidth={trait}
        />
      )

    case 'losange':
      return (
        <polygon
          points={`0,${-r} ${r},0 0,${r} ${-r},0`}
          fill={remplissage}
          stroke={contour}
          strokeWidth={trait}
        />
      )

    case 'rectangle':
      return (
        <rect
          x={-1.3 * r}
          y={-0.55 * r}
          width={2.6 * r}
          height={1.1 * r}
          rx={0.15 * r}
          fill={remplissage}
          stroke={contour}
          strokeWidth={trait}
        />
      )

    default:
      return (
        <circle cx={0} cy={0} r={r} fill={remplissage} stroke={contour} strokeWidth={trait} />
      )
  }
}
