/**
 * Formulaire de duplication d'une seance.
 *
 * Dupliquer sert surtout a rejouer une seance qui a bien marche, a une autre
 * date, souvent avec un autre effectif et dans un autre gymnase : ces champs
 * sont donc au premier plan, deja pre-remplis avec des valeurs plausibles.
 *
 * L'equipe et la categorie ne sont pas redemandees : la copie reprend celles de
 * l'originale, qui sont presque toujours celles de l'entraineur. Le cas rare —
 * rejouer la seance avec un autre groupe — se regle dans la seance elle-meme,
 * ou les deux champs restent accessibles.
 */

import { useEffect, useRef, useState } from 'react'
import { dateDuJour, titreAutomatique, titreParDefaut } from '../domain/fabrique'
import { resumerSeance, type OptionsDuplication } from '../domain/resume'
import { prochaineDateLibre } from '../domain/planning'
import { LIBELLES_ESPACE, type Espace, type Seance } from '../domain/types'

interface Props {
  seance: Seance
  /**
   * Toutes les seances : la date proposee doit tomber sur un soir LIBRE.
   * Sans elles, la copie atterrissait sur une seance deja preparee.
   */
  seances: Seance[]
  onValider: (options: OptionsDuplication) => void
  onAnnuler: () => void
}

/**
 * Le prochain soir d'entrainement encore LIBRE.
 *
 * On proposait la meme date une semaine plus tard, sans regarder ce qui
 * existait : dupliquer la seance du 4 septembre proposait le 11, ou une seance
 * etait deja preparee, et il fallait corriger a la main.
 *
 * Le planning du club sait quels soirs l'equipe s'entraine ; les seances deja
 * ecrites disent lesquels sont pris. Faute de planning — equipe hors club,
 * date illisible — on retombe sur la semaine suivante, qui reste le rythme
 * habituel.
 */
function dateProposee(seance: Seance, seances: Seance[]): string {
  const libre = prochaineDateLibre(seance.equipe, seances, seance.date)
  if (libre) return libre
  const [a, m, j] = seance.date.split('-').map(Number)
  if (!a || !m || !j) return dateDuJour()
  const date = new Date(a, m - 1, j + 7)
  const suivant = new Date(Math.max(date.getTime(), Date.now()))
  const mois = String(suivant.getMonth() + 1).padStart(2, '0')
  const jour = String(suivant.getDate()).padStart(2, '0')
  return `${suivant.getFullYear()}-${mois}-${jour}`
}

export function DupliquerSeance({ seance, seances, onValider, onAnnuler }: Props) {
  const [date, setDate] = useState(() => dateProposee(seance, seances))
  /*
    Une seance nommee par sa date ne peut pas se dupliquer sous ce nom-la : la
    copie est prevue pour un autre jour. Son titre prend donc la date proposee,
    et suit ensuite celle que l'entraineur choisit. Un titre ecrit a la main,
    lui, se recopie tel quel — c'est le meme partage qu'ailleurs.
  */
  const [titre, setTitre] = useState(() =>
    titreAutomatique(seance) ? titreParDefaut(date) : seance.titre,
  )
  const [effectifJoueurs, setEffectifJoueurs] = useState(seance.effectifJoueurs)
  const [effectifGardiens, setEffectifGardiens] = useState(seance.effectifGardiens)
  const [espaceDisponible, setEspace] = useState<Espace | ''>(seance.espaceDisponible)
  const [reinitialiserEvaluations, setReinitialiser] = useState(false)

  const boite = useRef<HTMLFormElement>(null)
  const premierChamp = useRef<HTMLInputElement>(null)
  const resume = resumerSeance(seance)

  useEffect(() => {
    const origine = document.activeElement as HTMLElement | null
    premierChamp.current?.focus()
    premierChamp.current?.select()
    return () => origine?.focus?.()
  }, [])

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') {
        evenement.preventDefault()
        onAnnuler()
        return
      }
      if (evenement.key !== 'Tab') return
      const focalisables = boite.current?.querySelectorAll<HTMLElement>(
        'input, select, textarea, button',
      )
      if (!focalisables || focalisables.length === 0) return
      const premier = focalisables[0]
      const dernier = focalisables[focalisables.length - 1]
      if (evenement.shiftKey && document.activeElement === premier) {
        evenement.preventDefault()
        dernier.focus()
      } else if (!evenement.shiftKey && document.activeElement === dernier) {
        evenement.preventDefault()
        premier.focus()
      }
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  }, [onAnnuler])

  return (
    <div className="voile voile-dialogue" onPointerDown={onAnnuler}>
      <form
        ref={boite}
        className="dialogue dialogue-large"
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplication-titre"
        onPointerDown={(evenement) => evenement.stopPropagation()}
        onSubmit={(evenement) => {
          evenement.preventDefault()
          onValider({
            titre: titre.trim() || seance.titre,
            date,
            effectifJoueurs,
            effectifGardiens,
            espaceDisponible,
            reinitialiserEvaluations,
          })
        }}
      >
        <h2 id="duplication-titre">Dupliquer la séance</h2>
        <p className="dialogue-message">
          {resume.nombreExercices} exercice{resume.nombreExercices > 1 ? 's' : ''} et{' '}
          {resume.minutes} minutes seront recopiés dans une nouvelle séance, indépendante de
          l'originale.
        </p>

        <div className="grille-duplication">
          <label className="champ champ-large">
            <span>Titre</span>
            <input
              ref={premierChamp}
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
            />
          </label>
          <label className="champ">
            <span>Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                const choisie = e.target.value
                setTitre((actuel) => (actuel === titreParDefaut(date) ? titreParDefaut(choisie) : actuel))
                setDate(choisie)
              }}
            />
          </label>
          <label className="champ">
            <span>Joueurs présents</span>
            <input
              type="number"
              min={0}
              max={40}
              value={effectifJoueurs || ''}
              placeholder="non renseigné"
              onChange={(e) => setEffectifJoueurs(Number(e.target.value) || 0)}
            />
          </label>
          <label className="champ">
            <span>Gardiens présents</span>
            <input
              type="number"
              min={0}
              max={6}
              value={effectifGardiens || ''}
              placeholder="non renseigné"
              onChange={(e) => setEffectifGardiens(Number(e.target.value) || 0)}
            />
          </label>
          <label className="champ">
            <span>Espace disponible</span>
            <select
              value={espaceDisponible}
              onChange={(e) => setEspace(e.target.value as Espace | '')}
            >
              <option value="">non renseigné</option>
              {Object.entries(LIBELLES_ESPACE).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="case-a-cocher">
          <input
            type="checkbox"
            checked={reinitialiserEvaluations}
            onChange={(e) => setReinitialiser(e.target.checked)}
          />
          <span>
            Repartir sans les notes
            <small>
              Par défaut la copie garde vos notes et vos compteurs d'utilisation : ils portent sur
              l'exercice, pas sur la date.
            </small>
          </span>
        </label>

        <div className="dialogue-actions">
          <button type="button" className="bouton" onClick={onAnnuler}>
            Annuler
          </button>
          <button type="submit" className="bouton principal">
            Créer la copie
          </button>
        </div>
      </form>
    </div>
  )
}
