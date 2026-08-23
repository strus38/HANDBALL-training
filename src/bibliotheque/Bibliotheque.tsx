/**
 * Bibliotheque d'exercices : les fiches fournies avec l'application et celles
 * creees par l'entraineur.
 *
 * Choisir une fiche en ajoute une COPIE a la seance. L'adapter pour un soir ne
 * touche jamais au modele, et le modele reste disponible pour les seances
 * suivantes. Le bouton « Vers la bibliotheque » de la fiche fait le chemin
 * inverse quand une modification merite d'etre conservee.
 */

import { useMemo, useState } from 'react'
import { Terrain } from '../terrain/Terrain'
import { construireExercice, type ModeleExercice } from './modeles'
import { SENIORS_MASCULINS } from './seniorsMasculins'
import { GARDIENS } from './gardiens'
import { SANS_BALLON } from './sansBallon'
import { HBPSM } from './hbpsm'
import { clonerExercice } from '../domain/fabrique'
import { NoteEtoiles } from '../ui/NoteEtoiles'
import { useConfirmation } from '../ui/Dialogue'
import {
  LIBELLES_CATEGORIE,
  LIBELLES_FORMAT_GARDIENS,
  type Categorie,
  type Exercice,
  type Seance,
} from '../domain/types'
import { cleUtilisation, indexerUtilisations, resumeUtilisation } from '../domain/utilisation'

export const CATALOGUE: ModeleExercice[] = [...SENIORS_MASCULINS, ...GARDIENS, ...SANS_BALLON, ...HBPSM]

/** Fiche affichee dans la liste, quelle que soit son origine. */
interface Entree {
  cle: string
  exercice: Exercice
  /** Vrai pour les fiches creees par l'entraineur (supprimables). */
  personnelle: boolean
}

type Source = 'fournie' | 'personnelle'
type Filtre = 'tous' | 'joueurs' | 'gardiens' | Categorie

const FILTRES: { cle: Filtre; libelle: string }[] = [
  { cle: 'tous', libelle: 'Tout' },
  { cle: 'joueurs', libelle: 'Joueurs de champ' },
  { cle: 'gardiens', libelle: 'Gardiens' },
  { cle: 'echauffement', libelle: LIBELLES_CATEGORIE.echauffement },
  { cle: 'attaque', libelle: LIBELLES_CATEGORIE.attaque },
  { cle: 'defense', libelle: LIBELLES_CATEGORIE.defense },
  { cle: 'transition', libelle: LIBELLES_CATEGORIE.transition },
  { cle: 'technique', libelle: LIBELLES_CATEGORIE.technique },
  { cle: 'physique', libelle: LIBELLES_CATEGORIE.physique },
  { cle: 'jeu', libelle: LIBELLES_CATEGORIE.jeu },
]

/**
 * Nombre d'etapes d'un exercice, au-dela de la mise en place.
 *
 * Un schema a toujours une premiere etape : c'est le placement de depart. Seuls
 * les exercices qui en ont d'autres decrivent un mouvement, et sont donc
 * lisibles en animation. La regle vaut aussi pour les fiches de l'entraineur,
 * sans distinguer leur origine.
 */
const nombreEtapes = (exercice: Exercice) => exercice.schema.etapes.length

/**
 * L'exercice se mene-t-il sans aucun ballon ?
 *
 * Deux indices, exiges tous les deux : aucun ballon sur le schema, et aucun
 * ballon dans le materiel. Le materiel seul ne suffirait pas - il est ecrit a
 * la main - et le schema seul non plus, une gamme de passes pouvant se decrire
 * sans poser le ballon sur le terrain.
 *
 * La regle est litterale : une fiche qui demande des ballons lestes ou des
 * ballons mousse n'est pas « sans ballon », meme si le ballon de hand n'y sert
 * a rien. L'entraineur qui coche cette puce cherche ce qu'il peut mener les
 * mains vides.
 */
const sansAucunBallon = (exercice: Exercice) =>
  !exercice.schema.jetons.some((jeton) => jeton.type === 'ballon') &&
  !exercice.materiel.some((article) => /ballon/i.test(article))

const sansAccent = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

interface Props {
  mesModeles: Exercice[]
  /**
   * Toutes les seances, pour reconstituer l'historique d'utilisation.
   *
   * Cet historique vit sur les COPIES posees dans les seances, pas sur les
   * fiches : sans cette liste, une fiche menee dix fois afficherait zero.
   */
  seances: Seance[]
  onAjouter: (exercice: Exercice) => void
  onSupprimerModele: (id: string) => void
  onFermer: () => void
}

export function Bibliotheque({
  mesModeles,
  seances,
  onAjouter,
  onSupprimerModele,
  onFermer,
}: Props) {
  const utilisations = useMemo(() => indexerUtilisations(seances), [seances])
  const usage = (exercice: Exercice) => resumeUtilisation(utilisations.get(cleUtilisation(exercice)))

  const [source, setSource] = useState<Source>('fournie')
  const [filtre, setFiltre] = useState<Filtre>('tous')
  /**
   * « Avec animation » se combine avec le filtre de categorie au lieu de le
   * remplacer : la question d'un entraineur est « les attaques animees », pas
   * « les attaques OU les animees ». C'est donc une bascule a part, et non une
   * puce de plus dans le groupe exclusif.
   */
  const [animesSeuls, setAnimesSeuls] = useState(false)
  /** Meme logique que la bascule precedente : elle s'ajoute, elle ne remplace pas. */
  const [sansBallonSeuls, setSansBallonSeuls] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [choisi, setChoisi] = useState<string | undefined>()
  const confirmer = useConfirmation()

  const entrees = useMemo<Entree[]>(() => {
    if (source === 'personnelle') {
      return mesModeles.map((exercice) => ({ cle: exercice.id, exercice, personnelle: true }))
    }
    return CATALOGUE.map((modele) => ({
      // La reference, pas le titre : une fiche renommee reste la meme fiche.
      cle: modele.ref,
      exercice: construireExercice(modele),
      personnelle: false,
    }))
  }, [source, mesModeles])

  const resultats = useMemo(() => {
    const mots = sansAccent(recherche).split(/\s+/).filter(Boolean)
    return entrees.filter(({ exercice }) => {
      if (animesSeuls && nombreEtapes(exercice) <= 1) return false
      if (sansBallonSeuls && !sansAucunBallon(exercice)) return false
      if (filtre === 'gardiens' && exercice.categorie !== 'gardien') return false
      if (filtre === 'joueurs' && exercice.categorie === 'gardien') return false
      if (filtre !== 'tous' && filtre !== 'gardiens' && filtre !== 'joueurs') {
        if (exercice.categorie !== filtre) return false
      }
      if (mots.length === 0) return true
      const texte = sansAccent(
        `${exercice.titre} ${exercice.objectifs} ${exercice.fonctionnement} ${exercice.pointsCles}`,
      )
      return mots.every((mot) => texte.includes(mot))
    })
  }, [animesSeuls, entrees, filtre, recherche, sansBallonSeuls])

  const apercu = resultats.find((e) => e.cle === choisi) ?? resultats[0]

  return (
    <div className="voile" onClick={onFermer}>
      <div
        className="modale bibliotheque"
        role="dialog"
        aria-label="Bibliotheque d'exercices"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modale-entete">
          <h2>Bibliotheque</h2>
          <div className="groupe-vues">
            <button
              className={`bouton segment${source === 'fournie' ? ' actif' : ''}`}
              onClick={() => {
                setSource('fournie')
                setChoisi(undefined)
              }}
            >
              Fiches fournies ({CATALOGUE.length})
            </button>
            <button
              className={`bouton segment${source === 'personnelle' ? ' actif' : ''}`}
              onClick={() => {
                setSource('personnelle')
                setChoisi(undefined)
              }}
            >
              Mes exercices ({mesModeles.length})
            </button>
          </div>
          <input
            type="text"
            className="recherche"
            placeholder="Rechercher : croise, pivot, relance..."
            value={recherche}
            onChange={(e) => {
              setRecherche(e.target.value)
              setChoisi(undefined)
            }}
          />
          <button className="bouton discret" onClick={onFermer} title="Fermer">
            ✕
          </button>
        </header>

        <div className="filtres">
          {FILTRES.map((f) => (
            <button
              key={f.cle}
              className={`puce${filtre === f.cle ? ' active' : ''}`}
              onClick={() => {
                setFiltre(f.cle)
                setChoisi(undefined)
              }}
            >
              {f.libelle}
            </button>
          ))}
          <button
            className={`puce bascule${animesSeuls ? ' active' : ''}`}
            aria-pressed={animesSeuls}
            title="Ne montrer que les fiches dont le mouvement se deroule en plusieurs etapes"
            onClick={() => {
              setAnimesSeuls((actif) => !actif)
              setChoisi(undefined)
            }}
          >
            ▶ Avec animation
          </button>
          <button
            className={`puce bascule${sansBallonSeuls ? ' active' : ''}`}
            aria-pressed={sansBallonSeuls}
            title="Ne montrer que les fiches qui ne demandent aucun ballon"
            onClick={() => {
              setSansBallonSeuls((actif) => !actif)
              setChoisi(undefined)
            }}
          >
            Sans ballon
          </button>
        </div>

        <div className="corps-bibliotheque">
          <ul className="liste-modeles">
            {resultats.length === 0 && (
              <li className="aucun-resultat">
                {source === 'personnelle' && mesModeles.length === 0
                  ? "Vos exercices apparaitront ici : chaque fiche que vous creez rejoint automatiquement la bibliotheque."
                  : animesSeuls && sansBallonSeuls
                    ? "Aucune fiche ne cumule les deux : les enchainements animes se jouent tous avec un ballon."
                    : animesSeuls
                      ? "Aucune fiche animee ne correspond. Toutes les fiches n'ont pas de mouvement decrit etape par etape."
                      : sansBallonSeuls
                        ? 'Aucune fiche sans ballon ne correspond a ce filtre.'
                        : 'Aucune fiche ne correspond.'}
              </li>
            )}
            {resultats.map((entree) => (
              <li key={entree.cle}>
                <button
                  className={`carte-modele${entree.cle === apercu?.cle ? ' active' : ''}`}
                  onClick={() => setChoisi(entree.cle)}
                >
                  <span className="titre-modele">{entree.exercice.titre || 'Sans titre'}</span>
                  <span className="meta-modele">
                    {LIBELLES_CATEGORIE[entree.exercice.categorie]} · {entree.exercice.duree} min ·{' '}
                    {entree.exercice.nombreJoueurs > 0
                      ? `${entree.exercice.nombreJoueurs} joueurs`
                      : `${entree.exercice.nombreGardiens} gardiens`}
                  </span>
                  {usage(entree.exercice) && (
                    <span className="usage-modele">{usage(entree.exercice)}</span>
                  )}
                  <span className="etiquettes">
                    <em className={`etiquette-format ${entree.exercice.formatGardiens}`}>
                      {LIBELLES_FORMAT_GARDIENS[entree.exercice.formatGardiens]}
                    </em>
                    {nombreEtapes(entree.exercice) > 1 && (
                      <em
                        className="etiquette-etapes"
                        title="Le mouvement se deroule en plusieurs etapes, lisibles en animation"
                      >
                        ▶ {nombreEtapes(entree.exercice)} etapes
                      </em>
                    )}
                    {entree.exercice.enParallele && (
                      <em className="jeton-parallele">en parallele</em>
                    )}
                    {entree.exercice.evaluation.note > 0 && (
                      <NoteEtoiles note={entree.exercice.evaluation.note} lectureSeule taille="compacte" />
                    )}
                    <em className="etiquette-difficulte">
                      {'●'.repeat(entree.exercice.difficulte)}
                      <span className="creux">{'●'.repeat(3 - entree.exercice.difficulte)}</span>
                    </em>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {apercu && (
            <div className="apercu-modele">
              <div className="cadre-terrain">
                <Terrain
                  schema={apercu.exercice.schema}
                  etape={apercu.exercice.schema.etapes[0]}
                  interactif={false}
                />
              </div>
              <h3>{apercu.exercice.titre || 'Sans titre'}</h3>
              {apercu.exercice.objectifs && (
                <p className="objectifs-apercu">{apercu.exercice.objectifs}</p>
              )}
              {apercu.exercice.fonctionnement && (
                <>
                  <h4>Deroulement</h4>
                  {apercu.exercice.fonctionnement.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </>
              )}
              {apercu.exercice.pointsCles && (
                <>
                  <h4>Points cles</h4>
                  <ul>
                    {apercu.exercice.pointsCles.split('\n').filter(Boolean).map((l, i) => (
                      <li key={i}>{l}</li>
                    ))}
                  </ul>
                </>
              )}
              {apercu.exercice.evolution && (
                <>
                  <h4>Variantes</h4>
                  {apercu.exercice.evolution.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </>
              )}
              {usage(apercu.exercice) && (
                <p className="materiel-apercu">
                  <strong>Historique :</strong> {usage(apercu.exercice)}
                </p>
              )}
              <p className="materiel-apercu">
                <strong>Materiel :</strong> {apercu.exercice.materiel.join(', ') || 'aucun'}
              </p>
              {nombreEtapes(apercu.exercice) > 1 && (
                <p className="materiel-apercu">
                  <strong>Mouvement :</strong> {nombreEtapes(apercu.exercice)} etapes, lisibles en
                  animation une fois la fiche ouverte. Le schema ci-dessus montre la mise en place.
                </p>
              )}
              <div className="actions-apercu">
                <button
                  className="bouton principal"
                  onClick={() => onAjouter(clonerExercice(apercu.exercice, ''))}
                >
                  Ajouter a la seance
                </button>
                {apercu.personnelle && (
                  <button
                    className="bouton danger"
                    onClick={async () => {
                      const accepte = await confirmer({
                        titre: 'Retirer de la bibliotheque ?',
                        message: (
                          <>
                            <strong>{apercu.exercice.titre || 'Sans titre'}</strong> ne sera plus
                            proposee pour vos prochaines seances.
                            <em className="dialogue-note">
                              Les seances qui utilisent deja cette fiche la conservent : elles en
                              possedent leur propre copie.
                            </em>
                          </>
                        ),
                        libelleConfirmer: 'Retirer',
                        danger: true,
                      })
                      if (accepte) {
                        onSupprimerModele(apercu.exercice.id)
                        setChoisi(undefined)
                      }
                    }}
                  >
                    Retirer de la bibliotheque
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
