/**
 * Recevoir du texte dicte, du micro ou du presse-papiers.
 *
 * La voie qui marche partout, y compris dans un gymnase sans reseau, n'est pas
 * la reconnaissance vocale du navigateur : c'est celle du TELEPHONE, qui tourne
 * sur l'appareil. L'entraineur dicte dans ses notes, puis colle le bloc ici.
 * Ce module s'occupe de ce qui arrive ensuite.
 *
 * Le parti pris qui commande tout le fichier : ON NE DEVINE PAS. Un texte dicte
 * n'est reparti dans les champs que si l'entraineur a prononce les intitules -
 * « mise en place », « deroulement », « points cles ». Sans intitule, tout va
 * dans le fonctionnement, d'un bloc.
 *
 * Repartir au jugement serait pire que ne rien faire : un paragraphe expedie
 * dans « Evolution » parce qu'il contenait le mot « ensuite » se retrouve la ou
 * personne ne le cherche, et l'entraineur croit avoir perdu sa dictee. Le bloc
 * entier dans un seul champ est toujours rattrapable d'un copier-coller.
 */

const sansAccent = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Les champs de la fiche qu'une dictee peut remplir. */
export type ChampDicte =
  | 'objectifs'
  | 'misePlace'
  | 'fonctionnement'
  | 'regulation'
  | 'pointsCles'
  | 'evolution'

export type TexteReparti = Partial<Record<ChampDicte, string>>

/**
 * Intitules reconnus, et le champ vers lequel ils envoient.
 *
 * Ce sont les mots qu'un entraineur prononce naturellement en decrivant une
 * situation, pas un vocabulaire a apprendre. Les plus longs d'abord : « points
 * cles » doit gagner sur « points », « mise en place » sur « place ».
 */
const INTITULES: { mots: string[]; champ: ChampDicte }[] = [
  { mots: ['objectif de l exercice', 'objectifs', 'objectif', 'but de l exercice'], champ: 'objectifs' },
  { mots: ['mise en place', 'installation', 'dispositif', 'organisation'], champ: 'misePlace' },
  { mots: ['deroulement', 'fonctionnement', 'consignes', 'consigne'], champ: 'fonctionnement' },
  { mots: ['regulation', 'regles', 'bareme', 'contraintes'], champ: 'regulation' },
  {
    mots: ['points cles', 'point cle', 'criteres de reussite', 'ce que j observe'],
    champ: 'pointsCles',
  },
  { mots: ['evolution', 'evolutions', 'variantes', 'variante', 'complexification'], champ: 'evolution' },
]

/**
 * Un intitule ne compte que s'il OUVRE une phrase.
 *
 * Sans cette regle, « l'objectif est atteint quand... » couperait le texte en
 * deux au milieu d'une explication. On exige donc un debut de texte, un retour
 * a la ligne, ou une fin de phrase juste avant.
 */
function ouvreUnePhrase(texte: string, position: number): boolean {
  if (position === 0) return true
  const avant = texte.slice(0, position).trimEnd()
  if (avant.length === 0) return true
  if (texte.slice(0, position).includes('\n') && /\n\s*$/.test(texte.slice(0, position))) return true
  return /[.!?:;]$/.test(avant)
}

interface Marque {
  position: number
  longueur: number
  champ: ChampDicte
}

/** Toutes les coupures reperees dans le texte, dans l'ordre. */
function reperer(texte: string): Marque[] {
  const plat = sansAccent(texte)
  const marques: Marque[] = []

  for (const { mots, champ } of INTITULES) {
    for (const mot of mots) {
      const cible = sansAccent(mot)
      let depuis = 0
      for (;;) {
        const position = plat.indexOf(cible, depuis)
        if (position < 0) break
        depuis = position + 1
        if (!ouvreUnePhrase(texte, position)) continue

        // Le mot doit etre entier : « regles » ne doit pas se declencher sur
        // « reglementaire ».
        const suite = plat.slice(position + cible.length)
        if (/^[a-z0-9]/.test(suite)) continue

        // On avale le deux-points ou le tiret qui suit souvent l'intitule.
        const separateur = suite.match(/^\s*[:\-—]?\s*/)
        marques.push({
          position,
          longueur: cible.length + (separateur ? separateur[0].length : 0),
          champ,
        })
      }
    }
  }

  marques.sort((a, b) => a.position - b.position)

  // Deux intitules au meme endroit : on garde le plus long, c'est le plus
  // precis (« points cles » plutot que « points »).
  return marques.filter((m, i) => i === 0 || m.position >= marques[i - 1].position + marques[i - 1].longueur)
}

/** Les champs qu'une repartition remplirait, pour l'annoncer avant d'agir. */
export function champsReconnus(texte: string): ChampDicte[] {
  return [...new Set(reperer(texte).map((m) => m.champ))]
}

/**
 * Repartit un bloc dicte dans les champs de la fiche.
 *
 * Sans aucun intitule reconnu, tout part dans le fonctionnement : c'est le
 * champ qui decrit la situation, et le seul qui alimente la proposition de
 * mouvements sur le terrain.
 */
export function repartirTexteDicte(texte: string): TexteReparti {
  const propre = texte.trim()
  if (!propre) return {}

  const marques = reperer(propre)
  if (marques.length === 0) return { fonctionnement: propre }

  const reparti: TexteReparti = {}

  // Ce qui precede le premier intitule n'a pas d'etiquette : plutot que de le
  // jeter, on le met dans le fonctionnement.
  const preambule = propre.slice(0, marques[0].position).trim()
  if (preambule) reparti.fonctionnement = preambule

  marques.forEach((marque, i) => {
    const debut = marque.position + marque.longueur
    const fin = i + 1 < marques.length ? marques[i + 1].position : propre.length
    const contenu = propre.slice(debut, fin).trim()
    if (!contenu) return
    // Un intitule prononce deux fois complete le champ au lieu de l'ecraser.
    reparti[marque.champ] = reparti[marque.champ]
      ? `${reparti[marque.champ]}\n${contenu}`
      : contenu
  })

  return reparti
}

/**
 * Ajoute une phrase dictee au texte deja present.
 *
 * Chaque phrase va sur SA ligne : c'est ainsi que l'application rend ces
 * champs - une ligne, un paragraphe ou une puce - et c'est ainsi qu'un
 * entraineur enonce ses points cles. Les coller bout a bout produirait un pave
 * qu'il faudrait redecouper a la main.
 *
 * Le texte existant n'est jamais remplace : une phrase mal comprise ne doit
 * pas pouvoir effacer un paragraphe.
 */
export function ajouterFragment(actuel: string, fragment: string): string {
  const ajout = fragment.trim()
  if (!ajout) return actuel
  if (!actuel.trim()) return ajout
  return `${actuel.replace(/\s+$/, '')}\n${ajout}`
}

/**
 * Le navigateur sait-il transcrire la parole ?
 *
 * La portee est un parametre pour que la regle soit eprouvable des DEUX cotes :
 * un navigateur qui sait, et un navigateur qui ne sait pas. C est cette seconde
 * branche qui compte - elle garantit qu aucun bouton mort ne s affiche la ou la
 * commande n existe pas, et on ne peut pas la verifier dans un Chrome qui, lui,
 * sait toujours transcrire.
 */
export function dicteeDisponible(portee: unknown = globalThis): boolean {
  if (!portee || typeof portee !== 'object') return false
  const p = portee as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }
  return typeof (p.SpeechRecognition ?? p.webkitSpeechRecognition) === 'function'
}
