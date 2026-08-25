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
import { dateDuJour } from '../domain/fabrique'
import { resumerSeance, type OptionsDuplication } from '../domain/resume'
import { LIBELLES_ESPACE, type Espace, type Seance } from '../domain/types'

interface Props {
  seance: Seance
  onValider: (options: OptionsDuplication) => void
  onAnnuler: () => void
}

/** Propose la meme date une semaine plus tard : le rythme habituel d'un club. */
function dateProposee(iso: string): string {
  const [a, m, j] = iso.split('-').map(Number)
  if (!a || !m || !j) return dateDuJour()
  const date = new Date(a, m - 1, j + 7)
  const suivant = new Date(Math.max(date.getTime(), Date.now()))
  const mois = String(suivant.getMonth() + 1).padStart(2, '0')
  const jour = String(suivant.getDate()).padStart(2, '0')
  return `${suivant.getFullYear()}-${mois}-${jour}`
}

export function DupliquerSeance({ seance, onValider, onAnnuler }: Props) {
  const [titre, setTitre] = useState(seance.titre)
  const [date, setDate] = useState(() => dateProposee(seance.date))
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
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
