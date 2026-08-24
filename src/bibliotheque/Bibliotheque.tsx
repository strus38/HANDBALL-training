/**
 * Bibliotheque d'exercices : les fiches fournies avec l'application et celles
 * creees par l'entraineur.
 *
 * Choisir une fiche en ajoute une COPIE a la seance. L'adapter pour un soir ne
 * touche jamais au modele, et le modele reste disponible pour les seances
 * suivantes. Le bouton « Vers la bibliotheque » de la fiche fait le chemin
 * inverse quand une modification merite d'etre conservee.
 */

import { useEffect, useMemo, useState } from 'react'
import { Terrain } from '../terrain/Terrain'
import { construireExercice } from './modeles'
import { CATALOGUE, REFS_COMBINAISONS } from './catalogue'
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
import { estFavori } from '../domain/favoris'
import { estMasquee } from '../domain/masquees'

// Le catalogue et l ensemble des combinaisons vivent dans catalogue.ts : les
// tests ne peuvent pas importer ce composant, et en recopiaient une seconde
// liste qui derivait en silence.
export { CATALOGUE }

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
  /**
   * Cles des fiches mises en favori.
   *
   * Un favori n est pas une note : la note juge APRES coup ce qui a bien
   * marche, le favori marque AVANT ce qu on veut remonter souvent. Les deux
   * cohabitent sur la meme carte sans se remplacer.
   */
  favoris: string[]
  onBasculerFavori: (cle: string) => void
  /**
   * References des fiches fournies que l entraineur a retirees.
   *
   * Retirer n est pas supprimer : les fiches fournies font partie de
   * l application, et une nouvelle version les ramenerait. Elles sont donc
   * masquees, retrouvables derriere la puce « Masquees », et retablies d un
   * clic. C est ce qui permet de tailler la bibliotheque de base sans crainte.
   */
  masquees: string[]
  onBasculerMasquee: (ref: string) => void
  /**
   * Range une fiche dans la bibliotheque personnelle.
   *
   * C est ce qui fait de la bibliotheque de base un SOCLE et non un catalogue
   * fige : on reprend une fiche livree, on l ajuste a son groupe, et c est la
   * sienne qu on retrouve ensuite. Le detour existait deja - poser la fiche
   * dans une seance, la corriger, « Vers la bibliotheque » - mais il passait
   * par un objet qui n a rien a voir, et personne ne le devinait.
   */
  onEnregistrerModele: (exercice: Exercice) => void
  onAjouter: (exercice: Exercice) => void
  onSupprimerModele: (id: string) => void
  onFermer: () => void
}

export function Bibliotheque({
  mesModeles,
  seances,
  favoris,
  onBasculerFavori,
  masquees,
  onBasculerMasquee,
  onEnregistrerModele,
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
  /** Meme logique encore : la puce des favoris s ajoute aux autres filtres. */
  const [favorisSeuls, setFavorisSeuls] = useState(false)
  /** Meme logique : la puce des combinaisons s ajoute, elle ne remplace pas. */
  const [combinaisonsSeules, setCombinaisonsSeules] = useState(false)
  /**
   * Montre les fiches fournies RETIREES, au lieu des fiches en place.
   *
   * Contrairement aux autres puces, celle-ci inverse la liste plutot que de la
   * restreindre : c est la corbeille de la bibliotheque, la ou l on va
   * retablir une fiche retiree par erreur.
   */
  const [masqueesSeules, setMasqueesSeules] = useState(false)
  const [recherche, setRecherche] = useState('')
  const [choisi, setChoisi] = useState<string | undefined>()
  const confirmer = useConfirmation()

  /** Les references masquees encore presentes au catalogue. */
  const masqueesConnues = useMemo(
    () => CATALOGUE.filter((m) => estMasquee(masquees, m.ref)).length,
    [masquees],
  )

  // La derniere fiche retablie fait disparaitre la puce : la vue des masquees
  // n'a alors plus d'objet, on revient a la bibliotheque.
  useEffect(() => {
    if (masqueesSeules && masqueesConnues === 0) setMasqueesSeules(false)
  }, [masqueesSeules, masqueesConnues])

  const entrees = useMemo<Entree[]>(() => {
    if (source === 'personnelle') {
      return mesModeles.map((exercice) => ({ cle: exercice.id, exercice, personnelle: true }))
    }
    return CATALOGUE.filter((modele) => estMasquee(masquees, modele.ref) === masqueesSeules).map(
      (modele) => ({
        // La reference, pas le titre : une fiche renommee reste la meme fiche.
        cle: modele.ref,
        exercice: construireExercice(modele),
        personnelle: false,
      }),
    )
  }, [source, mesModeles, masquees, masqueesSeules])

  const resultats = useMemo(() => {
    const mots = sansAccent(recherche).split(/\s+/).filter(Boolean)
    return entrees.filter(({ exercice, cle }) => {
      if (combinaisonsSeules && !REFS_COMBINAISONS.has(cle)) return false
      if (favorisSeuls && !estFavori(favoris, cle)) return false
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
    // favoris ET favorisSeuls doivent figurer ici : sans la premiere, cocher
    // une etoile ne rafraichit pas la liste filtree, et la puce semble ne
    // rien faire.
  }, [
    animesSeuls,
    combinaisonsSeules,
    entrees,
    favoris,
    favorisSeuls,
    filtre,
    recherche,
    sansBallonSeuls,
  ])

  const apercu = resultats.find((e) => e.cle === choisi) ?? resultats[0]

  return (
    <div className="voile" onClick={onFermer}>
      <div
        className="modale bibliotheque"
        role="dialog"
        aria-label="Bibliothèque d'exercices"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modale-entete">
          <h2>Bibliothèque</h2>
          <div className="groupe-vues">
            <button
              className={`bouton segment${source === 'fournie' ? ' actif' : ''}`}
              onClick={() => {
                setSource('fournie')
                setChoisi(undefined)
              }}
            >
              Bibliothèque de base ({CATALOGUE.length - masqueesConnues})
            </button>
            <button
              className={`bouton segment${source === 'personnelle' ? ' actif' : ''}`}
              onClick={() => {
                setSource('personnelle')
                setChoisi(undefined)
              }}
            >
              Ma bibliothèque ({mesModeles.length})
            </button>
          </div>
          <input
            type="text"
            className="recherche"
            placeholder="Rechercher : croisé, pivot, relance..."
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
            title="Ne montrer que les fiches dont le mouvement se déroule en plusieurs étapes"
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
          <button
            className={`puce bascule${combinaisonsSeules ? ' active' : ''}`}
            aria-pressed={combinaisonsSeules}
            title="Ne montrer que les combinaisons nommées : Espagnole, Pondus, double croisé..."
            onClick={() => {
              setCombinaisonsSeules((actif) => !actif)
              setChoisi(undefined)
            }}
          >
            Combinaisons
          </button>
          <button
            className={`puce bascule${favorisSeuls ? ' active' : ''}`}
            aria-pressed={favorisSeuls}
            title="Ne montrer que les fiches que vous avez mises en favori"
            onClick={() => {
              setFavorisSeuls((actif) => !actif)
              setChoisi(undefined)
            }}
          >
            ★ Favoris
          </button>
          {source === 'fournie' && masqueesConnues > 0 && (
            <button
              className={`puce bascule${masqueesSeules ? ' active' : ''}`}
              aria-pressed={masqueesSeules}
              title="Voir les fiches fournies que vous avez retirées, pour les rétablir"
              onClick={() => {
                setMasqueesSeules((actif) => !actif)
                setChoisi(undefined)
              }}
            >
              Retirées ({masqueesConnues})
            </button>
          )}
        </div>

        <div className="corps-bibliotheque">
          <ul className="liste-modeles">
            {resultats.length === 0 && (
              <li className="aucun-resultat">
                {combinaisonsSeules && filtre !== 'tous' && filtre !== 'attaque'
                  ? "Les combinaisons nommées sont des exercices d attaque : levez le filtre de catégorie pour les voir."
                  : favorisSeuls
                  ? "Aucun favori ici. L étoile en haut à droite d une fiche la met de côté."
                  : source === 'personnelle' && mesModeles.length === 0
                  ? "Ma bibliothèque est vide. Deux façons de la remplir : créer une fiche, ou en reprendre une de la bibliothèque de base pour l'ajuster à votre groupe."
                  : animesSeuls && sansBallonSeuls
                    ? "Aucune fiche ne cumule les deux : les enchaînements animés se jouent tous avec un ballon."
                    : animesSeuls
                      ? "Aucune fiche animée ne correspond. Toutes les fiches n'ont pas de mouvement décrit étape par étape."
                      : sansBallonSeuls
                        ? 'Aucune fiche sans ballon ne correspond à ce filtre.'
                        : 'Aucune fiche ne correspond.'}
              </li>
            )}
            {resultats.map((entree) => (
              <li key={entree.cle} className="element-modele">
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
                        title="Le mouvement se déroule en plusieurs étapes, lisibles en animation"
                      >
                        ▶ {nombreEtapes(entree.exercice)} étapes
                      </em>
                    )}
                    {entree.exercice.enParallele && (
                      <em className="jeton-parallele">en parallèle</em>
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
                {/*
                  L'etoile est POSEE SUR la carte, pas dedans : la carte est
                  elle-meme un bouton, et un bouton dans un bouton n'est pas du
                  HTML valide - le navigateur defait l'imbrication et l'etoile
                  se retrouve hors de la carte, ou elle ne veut plus rien dire.
                */}
                <button
                  type="button"
                  className={`etoile-favori${estFavori(favoris, entree.cle) ? ' active' : ''}`}
                  aria-pressed={estFavori(favoris, entree.cle)}
                  title={
                    estFavori(favoris, entree.cle)
                      ? 'Retirer des favoris'
                      : 'Mettre en favori pour la retrouver vite'
                  }
                  onClick={() => onBasculerFavori(entree.cle)}
                >
                  {estFavori(favoris, entree.cle) ? '★' : '☆'}
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
                  <h4>Déroulement</h4>
                  {apercu.exercice.fonctionnement.split('\n').filter(Boolean).map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </>
              )}
              {apercu.exercice.pointsCles && (
                <>
                  <h4>Points clés</h4>
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
                <strong>Matériel :</strong> {apercu.exercice.materiel.join(', ') || 'aucun'}
              </p>
              {nombreEtapes(apercu.exercice) > 1 && (
                <p className="materiel-apercu">
                  <strong>Mouvement :</strong> {nombreEtapes(apercu.exercice)} étapes, lisibles en
                  animation une fois la fiche ouverte. Le schéma ci-dessus montre la mise en place.
                </p>
              )}
              <div className="actions-apercu">
                <button
                  className="bouton principal"
                  onClick={() => onAjouter(clonerExercice(apercu.exercice, ''))}
                >
                  Ajouter à la séance
                </button>
                {/*
                  Reprendre une fiche de base : c'est le geste qui fait de la
                  bibliotheque de base un socle. Il etait jusqu'ici impossible
                  autrement qu'en passant par une seance - un detour par un
                  objet sans rapport, que personne ne trouvait seul.
                */}
                {!apercu.personnelle && !masqueesSeules && (
                  <button
                    className="bouton"
                    title="En faire votre version, que vous pourrez ajuster à votre groupe"
                    onClick={async () => {
                      const copie = clonerExercice(apercu.exercice, '')
                      onEnregistrerModele(copie)
                      // On PROPOSE de retirer l'originale, on ne le decide pas :
                      // garder les deux est un choix legitime - la fiche livree
                      // comme reference, la sienne comme version du soir.
                      const retirer = await confirmer({
                        titre: "Retirer la fiche d'origine ?",
                        message: (
                          <>
                            <strong>{apercu.exercice.titre || 'Sans titre'}</strong> est maintenant
                            dans votre bibliothèque, où vous pouvez la modifier librement.
                            <em className="dialogue-note">
                              La version livrée reste dans la bibliothèque de base. La retirer
                              évite de voir deux fois la même fiche ; elle restera récupérable
                              derrière la puce « Retirées ».
                            </em>
                          </>
                        ),
                        libelleConfirmer: 'Retirer la version livrée',
                      })
                      if (retirer) onBasculerMasquee(apercu.cle)
                      setSource('personnelle')
                      setChoisi(copie.id)
                    }}
                  >
                    Reprendre dans ma bibliothèque
                  </button>
                )}
                <button
                  className={`bouton${estFavori(favoris, apercu.cle) ? ' actif' : ''}`}
                  aria-pressed={estFavori(favoris, apercu.cle)}
                  onClick={() => onBasculerFavori(apercu.cle)}
                >
                  {estFavori(favoris, apercu.cle) ? '★ En favori' : '☆ Mettre en favori'}
                </button>
                {apercu.personnelle && (
                  <button
                    className="bouton danger"
                    onClick={async () => {
                      const accepte = await confirmer({
                        titre: 'Retirer de ma bibliothèque ?',
                        message: (
                          <>
                            <strong>{apercu.exercice.titre || 'Sans titre'}</strong> ne sera plus
                            proposée pour vos prochaines séances.
                            <em className="dialogue-note">
                              Les séances qui utilisent déjà cette fiche la conservent : elles en
                              possèdent leur propre copie.
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
                    Retirer de ma bibliothèque
                  </button>
                )}
                {/*
                  Une fiche FOURNIE ne se supprime pas, elle se masque : elle
                  reste derriere la puce « Retirees » et se retablit d'un clic.
                  C'est ce qui permet de nettoyer la bibliotheque de base sans
                  craindre de perdre quoi que ce soit.
                */}
                {!apercu.personnelle && masqueesSeules && (
                  <button
                    className="bouton"
                    onClick={() => {
                      onBasculerMasquee(apercu.cle)
                      setChoisi(undefined)
                    }}
                  >
                    Remettre dans la base
                  </button>
                )}
                {!apercu.personnelle && !masqueesSeules && (
                  <button
                    className="bouton danger"
                    onClick={async () => {
                      const accepte = await confirmer({
                        titre: 'Retirer cette fiche de la base ?',
                        message: (
                          <>
                            <strong>{apercu.exercice.titre || 'Sans titre'}</strong> ne sera plus
                            proposée dans la bibliothèque.
                            <em className="dialogue-note">
                              Rien n'est perdu : la fiche reste derrière la puce « Retirées », d'où
                              un clic la rétablit. Les séances qui l'utilisent la conservent.
                            </em>
                          </>
                        ),
                        libelleConfirmer: 'Retirer',
                        danger: true,
                      })
                      if (accepte) {
                        onBasculerMasquee(apercu.cle)
                        setChoisi(undefined)
                      }
                    }}
                  >
                    Retirer de la base
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
