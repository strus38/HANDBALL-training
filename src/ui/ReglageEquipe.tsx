/**
 * Reglage « Mon equipe », ouvert depuis l'en-tete.
 *
 * Une question posee une fois par saison, pas une fois par seance. Elle vit
 * dans l'en-tete et non dans un ecran de reglages : l'application n'en a pas,
 * et une seule preference n'en justifie pas un.
 *
 * Depuis que le planning du club est connu, la question se REPOND plutot
 * qu'elle ne se saisit : une liste de treize equipes, et non deux champs
 * libres ou « U13 G », « moins de 13 garcons » et « -13G » designaient la meme
 * equipe sans jamais se reconnaitre. Choisir dans la liste, c'est aussi
 * choisir des creneaux : la date, la duree et l'espace des seances a venir en
 * decoulent.
 *
 * Le champ libre survit derriere « Autre equipe » : un tournoi, une selection,
 * un remplacement dans un autre club. Il n'a alors pas de creneau, et rien ne
 * se pre-remplit — ce qui est le comportement juste, pas une regression.
 */

import { useEffect, useRef, useState } from 'react'
import { MAX_LONGUEUR_EQUIPE, type MonEquipe } from '../domain/equipe'
import {
  EQUIPES_CLUB,
  creneauxDe,
  dureeCreneau,
  equipeDuClub,
  libelleCreneau,
  voisinesDe,
} from '../domain/planning'

interface Props {
  monEquipe: MonEquipe
  onValider: (equipe: MonEquipe) => void
  onAnnuler: () => void
}

export function ReglageEquipe({ monEquipe, onValider, onAnnuler }: Props) {
  /**
   * Une equipe deja renseignee mais absente du planning n'est pas une erreur :
   * c'est le champ libre d'une version anterieure, ou un cas particulier. Le
   * dialogue s'ouvre alors directement sur les champs libres, avec le texte en
   * place, plutot que de faire disparaitre ce qui etait ecrit.
   */
  const duClub = equipeDuClub(monEquipe.equipe)
  const [autre, setAutre] = useState(() => monEquipe.equipe !== '' && duClub === undefined)
  const [choisie, setChoisie] = useState(duClub?.nom ?? '')
  const [equipe, setEquipe] = useState(monEquipe.equipe)
  const [categorieAge, setCategorieAge] = useState(monEquipe.categorieAge)

  const boite = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const origine = document.activeElement as HTMLElement | null
    // Le premier champ, liste ou saisie libre selon le mode d'ouverture.
    boite.current?.querySelector<HTMLElement>('input, select')?.focus()
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
      const focalisables = boite.current?.querySelectorAll<HTMLElement>('input, select, button')
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

  const creneaux = autre ? [] : creneauxDe(choisie)

  return (
    <div className="voile voile-dialogue" onPointerDown={onAnnuler}>
      <form
        ref={boite}
        className="dialogue"
        role="dialog"
        aria-modal="true"
        aria-labelledby="equipe-titre"
        onPointerDown={(evenement) => evenement.stopPropagation()}
        onSubmit={(evenement) => {
          evenement.preventDefault()
          if (autre) {
            onValider({
              equipe: equipe.trim().slice(0, MAX_LONGUEUR_EQUIPE),
              categorieAge: categorieAge.trim().slice(0, MAX_LONGUEUR_EQUIPE),
            })
            return
          }
          const club = equipeDuClub(choisie)
          onValider({
            equipe: club?.nom ?? '',
            categorieAge: club?.categorieAge ?? '',
          })
        }}
      >
        <h2 id="equipe-titre">Mon équipe</h2>
        <p className="dialogue-message">
          Renseignée une fois, elle est reprise sur chaque nouvelle séance et sur les feuilles
          imprimées. Les séances déjà créées gardent l'équipe avec laquelle elles ont été menées.
        </p>

        {autre ? (
          <div className="grille-equipe">
            <label className="champ">
              <span>Équipe</span>
              <input
                type="text"
                value={equipe}
                maxLength={MAX_LONGUEUR_EQUIPE}
                placeholder="Sélection départementale"
                onChange={(e) => setEquipe(e.target.value)}
              />
            </label>
            <label className="champ">
              <span>Catégorie</span>
              <input
                type="text"
                value={categorieAge}
                maxLength={MAX_LONGUEUR_EQUIPE}
                placeholder="+18 ans"
                onChange={(e) => setCategorieAge(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <label className="champ">
            <span>Équipe du club</span>
            <select value={choisie} onChange={(e) => setChoisie(e.target.value)}>
              <option value="">Aucune</option>
              {EQUIPES_CLUB.map((e) => (
                <option key={e.nom} value={e.nom}>
                  {e.categorieAge ? `${e.nom} · ${e.categorieAge}` : e.nom}
                </option>
              ))}
            </select>
          </label>
        )}

        {/*
          Les creneaux, affiches des le choix fait : c'est la preuve visible que
          la liste ne sert pas qu'a ecrire un nom. L'entraineur voit tout de
          suite ce que l'application saura de ses soirees — et repere du meme
          coup une ligne fausse dans le planning.
        */}
        {creneaux.length > 0 && (
          <ul className="creneaux-equipe">
            {creneaux.map((c) => {
              const voisines = voisinesDe(c, choisie)
              return (
                <li key={`${c.jour}-${c.debut}`}>
                  <strong>{libelleCreneau(c)}</strong> · {dureeCreneau(c)} min ·{' '}
                  {voisines.length > 0
                    ? `demi-terrain, avec ${voisines.join(' et ')}`
                    : 'terrain complet'}
                </li>
              )
            })}
          </ul>
        )}

        <button
          type="button"
          className="lien-discret"
          onClick={() => setAutre((valeur) => !valeur)}
          title="Saisir librement le nom d’une équipe qui ne figure pas au planning du club"
        >
          {autre ? 'Choisir dans les équipes du club' : 'Autre équipe (hors planning du club)'}
        </button>

        <div className="dialogue-actions">
          <button type="button" className="bouton" onClick={onAnnuler} title="Fermer sans rien changer">
            Annuler
          </button>
          <button type="submit" className="bouton principal" title="Retenir cette équipe : les nouvelles séances la reprendront">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
