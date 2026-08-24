/**
 * Dictee vocale, la ou le navigateur sait la faire.
 *
 * Ce que ce module N'EST PAS : une promesse generale. La reconnaissance vocale
 * du navigateur (API Web Speech) envoie l'audio a un service en ligne. Elle ne
 * fonctionne donc PAS dans un gymnase sans reseau, et pas du tout sur certains
 * navigateurs. C'est une aide pour preparer sa seance chez soi, rien de plus,
 * et l'application le dit au lieu de le laisser deviner.
 *
 * Trois consequences dans le code.
 *
 * Le bouton n'existe pas quand le navigateur ne sait pas faire. Il ne s'affiche
 * pas grise avec une explication : un bouton mort a cote de chaque champ est un
 * reproche permanent. Absent, il ne coute rien a personne.
 *
 * L'absence de reseau est annoncee AVANT d'ecouter. Laisser l'entraineur parler
 * trente secondes pour ne rien obtenir serait la pire des reponses.
 *
 * Le texte reconnu s'AJOUTE a ce qui est deja ecrit, jamais a la place. Une
 * dictee mal comprise ne doit pas pouvoir effacer un paragraphe.
 *
 * Pour dicter sans reseau, la voie est ailleurs : la dictee du telephone, qui
 * tourne sur l'appareil, et le bouton « Coller » de l'application.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { dicteeDisponible } from '../domain/dictee'

export { dicteeDisponible }

/**
 * Le peu de l'API Web Speech dont on se sert.
 *
 * On la decrit ici plutot que d'installer les types du navigateur : elle n'est
 * pas standardisee partout, et une declaration locale dit exactement ce sur
 * quoi on s'appuie.
 */
interface Reconnaissance {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  abort(): void
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>; resultIndex: number }) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
}

type Fabrique = new () => Reconnaissance

function fabrique(): Fabrique | undefined {
  if (typeof window === 'undefined') return undefined
  const f = window as unknown as { SpeechRecognition?: Fabrique; webkitSpeechRecognition?: Fabrique }
  return f.SpeechRecognition ?? f.webkitSpeechRecognition
}


/**
 * Message clair pour chaque panne, plutot que le code brut de l'API.
 *
 * « network » est le cas frequent et le plus mal compris : l'entraineur croit
 * que le micro est casse alors que c'est la connexion qui manque.
 */
function expliquer(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return "Le micro a été refusé. Autorisez-le dans la barre d'adresse du navigateur."
    case 'no-speech':
      return "Rien n'a été entendu."
    case 'audio-capture':
      return 'Aucun micro trouvé sur cet ordinateur.'
    case 'network':
      return 'La dictée passe par internet et la connexion a manqué.'
    case 'aborted':
      return ''
    default:
      return 'La dictée a échoué (' + code + ').'
  }
}

interface Props {
  /** Appele avec chaque phrase reconnue, a AJOUTER au texte existant. */
  onTexte: (fragment: string) => void
  /** Ce qu'on dicte, pour l'infobulle : « Dicter le fonctionnement ». */
  quoi: string
}

export function BoutonDictee({ onTexte, quoi }: Props) {
  const [ecoute, setEcoute] = useState(false)
  const [message, setMessage] = useState('')
  const moteur = useRef<Reconnaissance | undefined>(undefined)

  // Le texte arrive par petits morceaux : on garde la derniere fonction de
  // depot dans une reference, sinon le moteur, cree une seule fois, ecrirait
  // dans un exercice perime.
  const depot = useRef(onTexte)
  depot.current = onTexte

  const arreter = useCallback(() => {
    moteur.current?.stop()
    setEcoute(false)
  }, [])

  // Quitter la fiche pendant une dictee laisserait le micro ouvert.
  useEffect(() => () => moteur.current?.abort(), [])

  const demarrer = () => {
    const Moteur = fabrique()
    if (!Moteur) return

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setMessage(
        'La dictée du navigateur passe par internet. Sans connexion, dictez sur votre téléphone et collez le texte.',
      )
      return
    }

    setMessage('')
    const m = new Moteur()
    m.lang = 'fr-FR'
    // On dicte des paragraphes, pas des mots : sans « continuous », le moteur
    // s'arrete a la premiere respiration.
    m.continuous = true
    // Les resultats provisoires changent a chaque syllabe. Les ecrire dans le
    // champ ferait clignoter le texte et casserait l'annulation.
    m.interimResults = false

    m.onresult = (e) => {
      let fragment = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const resultat = e.results[i]
        if (resultat.isFinal) fragment += resultat[0].transcript
      }
      const propre = fragment.trim()
      if (propre) depot.current(propre)
    }

    m.onerror = (e) => {
      const explication = expliquer(e.error)
      if (explication) setMessage(explication)
      setEcoute(false)
    }

    // Le moteur se coupe seul apres un silence : l'etat du bouton doit suivre,
    // sans quoi il resterait rouge alors que plus rien n'est ecoute.
    m.onend = () => setEcoute(false)

    moteur.current = m
    try {
      m.start()
      setEcoute(true)
    } catch {
      setMessage("La dictée n'a pas pu démarrer.")
    }
  }

  return (
    <>
      <button
        type="button"
        className={`bouton-dictee${ecoute ? ' ecoute' : ''}`}
        aria-pressed={ecoute}
        onClick={(e) => {
          // Le bouton vit dans un <label> : sans cela, le clic serait renvoye
          // au champ et declencherait le bouton deux fois.
          e.preventDefault()
          ecoute ? arreter() : demarrer()
        }}
        title={ecoute ? 'Arrêter la dictée' : `Dicter ${quoi} (nécessite internet)`}
      >
        {ecoute ? '⏹' : '🎤'}
      </button>
      {message && <em className="dictee-message">{message}</em>}
    </>
  )
}

/**
 * Etiquette d un champ, avec le micro a droite quand il est disponible.
 *
 * Sans support du navigateur, elle rend une etiquette ordinaire : rien ne
 * signale qu une commande manque, et la fiche reste identique a ce qu elle a
 * toujours ete.
 */
export function EtiquetteAvecDictee({
  libelle,
  quoi,
  onTexte,
}: {
  libelle: string
  quoi: string
  onTexte: (fragment: string) => void
}) {
  if (!dicteeDisponible()) return <span>{libelle}</span>
  return (
    <span className="avec-dictee">
      {libelle}
      <BoutonDictee quoi={quoi} onTexte={onTexte} />
    </span>
  )
}
