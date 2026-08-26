/**
 * Ecusson du club, redessine en SVG : disque bleu marine cercle de blanc, but
 * en perspective, joueur en suspension, ballon jaune, et le millesime 1983 a
 * la verticale sur le bord gauche.
 *
 * C'est une REPRODUCTION du vrai ecusson, pas le fichier officiel du club : la
 * silhouette du joueur et les lettrages sont approches. Le trace vectoriel a
 * ete choisi pour rester net a l'impression et ne rien peser dans le fichier
 * unique. Le jour ou le club fournit son logo, deposer le fichier a cote de
 * celui-ci et remplacer le corps de ce composant par une balise <img> : c'est
 * le seul endroit a modifier, et assetsInlineLimit (vite.config.ts) est deja
 * regle pour l'embarquer en base64 dans le livrable hors ligne.
 *
 * L'application ne connait ce composant que sous le nom @club/Ecusson : chaque
 * club a le sien, aucun code ne nomme celui-ci.
 *
 * Deux precautions de trace :
 * - les couleurs sont ecrites en dur, ce sont celles de l'ecusson : elles ne
 *   suivent pas le theme de l'interface ;
 * - les trois lettrages portent un textLength, pour occuper exactement la
 *   largeur prevue quelle que soit la police disponible sur la machine. Sans
 *   cela, un poste sans Segoe UI ferait deborder le texte hors du disque.
 */

const BLEU = '#123a8c'
const JAUNE = '#ffd200'
const ROSE = '#e4577f'
const CIEL = '#7fb0e0'
const SANS = "'Segoe UI', 'Helvetica Neue', Arial, sans-serif"

export function Ecusson() {
  return (
    <svg
      className="logo"
      viewBox="0 0 100 100"
      role="img"
      aria-label="Handball Pays de Saint-Marcellin"
    >
      <defs>
        {/* Tout le decor est rogne au disque : rien ne deborde de l'ecusson. */}
        <clipPath id="hbpsm-disque">
          <circle cx="50" cy="50" r="43.5" />
        </clipPath>
      </defs>

      {/* Cerclage : blanc, un filet bleu, puis le disque bleu marine. */}
      <circle cx="50" cy="50" r="49" fill="#fff" />
      <circle cx="50" cy="50" r="47" fill="none" stroke={BLEU} strokeWidth="2" />
      <circle cx="50" cy="50" r="43.5" fill={BLEU} />

      <g clipPath="url(#hbpsm-disque)">
        {/* Ligne de terrain, en fond. */}
        <path d="M2 66 H98" stroke={CIEL} strokeWidth="1" opacity="0.32" />

        {/* But en perspective : montants roses, fond de but bleu clair. */}
        <path
          d="M19 85 V42 H81 V85"
          fill="none"
          stroke={ROSE}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M26 80 V46 H74 V80"
          fill="none"
          stroke={CIEL}
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <path
          d="M19 42 L26 46 M81 42 L74 46 M19 85 L26 80 M81 85 L74 80"
          stroke={CIEL}
          strokeWidth="1"
        />

        {/* Trajectoire jaune, sous le joueur. */}
        <path
          d="M15 72 Q19 85 43 88"
          fill="none"
          stroke={JAUNE}
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Millesime, a la verticale sur le bord gauche. */}
        <text
          x="15"
          y="60"
          transform="rotate(-90 15 60)"
          textAnchor="middle"
          fill={JAUNE}
          fontSize="8"
          fontWeight="700"
          fontFamily={SANS}
          textLength="18"
          lengthAdjust="spacingAndGlyphs"
        >
          1983
        </text>

        {/* Ballon. */}
        <circle cx="24" cy="48" r="5.4" fill={JAUNE} />
        <path
          d="M20.6 44.4 A5.4 5.4 0 0 1 27.3 44.2"
          fill="none"
          stroke="#fff"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.75"
        />

        {/* Joueur en suspension, bras arme vers l'arriere. */}
        <g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round">
          <path d="M47.5 51 L53 63" strokeWidth="11" />
          <path d="M50.5 51.5 L57.5 45 L57 35.5" strokeWidth="4.4" />
          <path d="M46 51.5 L37.5 50.5 L30.5 48" strokeWidth="4.4" />
          <path d="M49 64 L41 69.5 L37.5 78" strokeWidth="5.4" />
          <path d="M53.5 64 L62 72.5 L70 81" strokeWidth="5.4" />
        </g>
        <circle cx="47.5" cy="45" r="5" fill="#fff" />
      </g>

      {/* Lettrage. */}
      <text
        x="50"
        y="21.5"
        textAnchor="middle"
        fill="#fff"
        fontSize="11"
        fontWeight="800"
        fontFamily={SANS}
        textLength="56"
        lengthAdjust="spacingAndGlyphs"
      >
        HANDBALL
      </text>
      <text
        x="29"
        y="31"
        textAnchor="middle"
        fill={JAUNE}
        fontSize="7"
        fontStyle="italic"
        fontFamily="Georgia, 'Times New Roman', serif"
        textLength="16"
        lengthAdjust="spacingAndGlyphs"
      >
        Pays de
      </text>
      <text
        x="61"
        y="32"
        textAnchor="middle"
        fill="#fff"
        fontSize="9.5"
        fontWeight="800"
        fontFamily={SANS}
        textLength="42"
        lengthAdjust="spacingAndGlyphs"
      >
        St MARCELLIN
      </text>
    </svg>
  )
}
