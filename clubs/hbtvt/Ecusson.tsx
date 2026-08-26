/**
 * Ecusson du club, redessine en SVG : disque noir, joueur vert en suspension,
 * ballon a la main levee, et deux croissants — anis et vert — qui enlacent le
 * disque, avec un troisieme, noir, sur le bord gauche.
 *
 * C'est une REPRODUCTION, pas le fichier officiel du club : la silhouette du
 * joueur et le trace des croissants sont approches d'apres son logo. Le jour ou
 * le club fournit le sien, deposer le fichier a cote de celui-ci et remplacer
 * le corps de ce composant par une balise <img> : c'est le seul endroit a
 * modifier, et assetsInlineLimit (vite.config.ts) est deja regle pour
 * l'embarquer en base64 dans le livrable hors ligne.
 *
 * UN AJOUT AU LOGO D'ORIGINE : le cerclage blanc. L'entete de l'application
 * porte la couleur la plus profonde du club, ici un noir tres legerement vert ;
 * un disque noir pose dessus s'y fondrait, et l'ecusson disparaitrait de sa
 * propre application. Le filet blanc le detache. Saint-Marcellin a le meme,
 * pour la meme raison.
 *
 * Les couleurs sont ecrites en dur, ce sont celles de l'ecusson : elles ne
 * suivent pas le theme de l'interface. Ce sont les valeurs relevees sur le
 * logo du club, pixel par pixel — le vert #4bad33 se retrouve d'ailleurs tel
 * quel dans la feuille de style de son site.
 */

const NOIR = '#000000'
const VERT = '#4bad33'
const ANIS = '#b0cb12'

export function Ecusson() {
  return (
    <svg className="logo" viewBox="0 0 100 100" role="img" aria-label="Handball Tain Vion Tournon">
      {/* Cerclage blanc : ce qui detache l'ecusson d'une entete sombre. */}
      <circle cx="50" cy="50" r="49" fill="#fff" />

      {/*
        Les trois croissants qui tournent autour du disque.

        Chacun sur son propre rayon, et se recouvrant en partie : c'est ce
        decalage qui donne la spirale, la ou trois arcs concentriques n'auraient
        fait qu'un anneau. Le creux du bas, entre cinq et huit heures, est
        laisse ouvert comme sur le logo du club.
      */}
      <path
        d="M26.50 90.70 A47 47 0 0 1 26.50 9.30"
        fill="none"
        stroke={NOIR}
        strokeWidth="4.4"
        strokeLinecap="round"
      />
      <path
        d="M10.16 27.00 A46 46 0 0 1 89.84 27.00"
        fill="none"
        stroke={ANIS}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M70.50 14.49 A41 41 0 0 1 70.50 85.51"
        fill="none"
        stroke={VERT}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Le disque, et tout ce qu'il porte. */}
      <circle cx="50" cy="50" r="34" fill={NOIR} />

      <g clipPath="url(#ecusson-disque)">
        {/* Joueur en suspension, ballon a la main levee. */}
        <g fill="none" stroke={VERT} strokeLinecap="round" strokeLinejoin="round">
          {/* Tronc, bras arme, bras d'equilibre, puis les deux jambes. */}
          <path d="M47.5 46.5 L53 59" strokeWidth="10.5" />
          <path d="M47.5 45 L39.5 39.5 L33.5 36.5" strokeWidth="4.2" />
          <path d="M52.5 47 L62 48.5 L70.5 46" strokeWidth="4" />
          <path d="M50 60 L41.5 65 L36.5 72.5" strokeWidth="5.2" />
          <path d="M54 60 L62.5 67 L69 75" strokeWidth="5.2" />
        </g>
        <circle cx="46.5" cy="39.5" r="5" fill={VERT} />
        {/* Le ballon, detache de la main : sans l'ecart il devient un moignon. */}
        <circle cx="27.5" cy="32.5" r="4.4" fill={VERT} />
      </g>

      <defs>
        {/* Rien de la silhouette ne deborde du disque. */}
        <clipPath id="ecusson-disque">
          <circle cx="50" cy="50" r="34" />
        </clipPath>
      </defs>
    </svg>
  )
}
