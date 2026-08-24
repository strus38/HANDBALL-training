import { useState } from 'react'
import { clonerExercice, nouvelExercice } from '../domain/fabrique'
import { equipeInhabituelle, equipeRenseignee, libelleEquipe, type MonEquipe } from '../domain/equipe'
import {
  dureeTotale,
  LIBELLES_CATEGORIE,
  manqueEffectif,
  type Exercice,
  type Seance,
} from '../domain/types'
import { NoteEtoiles } from './NoteEtoiles'
import { useConfirmation } from './Dialogue'
import { EtiquetteAvecDictee } from './Dictee'
import { ajouterFragment } from '../domain/dictee'

interface Props {
  seance: Seance
  /** L'equipe de l'entraineur, pour signaler quand la seance en porte une autre. */
  monEquipe: MonEquipe
  onModifier: (transformation: (seance: Seance) => Seance) => void
  onSupprimerSeance: () => void
  onExporterSeance: () => void
  onExporterExercice: (exercice: Exercice) => void
  onOuvrirExercice: (id: string) => void
  onOuvrirBibliotheque: () => void
  onImprimerSeance: () => void
  onRetourAccueil: () => void
  onDupliquer: () => void
  onModeTerrain: () => void
}

export function DetailSeance({
  seance,
  monEquipe,
  onModifier,
  onSupprimerSeance,
  onExporterSeance,
  onExporterExercice,
  onOuvrirExercice,
  onOuvrirBibliotheque,
  onImprimerSeance,
  onRetourAccueil,
  onDupliquer,
  onModeTerrain,
}: Props) {
  const confirmer = useConfirmation()
  /**
   * Les champs d'equipe sont replies par defaut.
   *
   * Un entraineur suit une equipe : la question est reglee une fois pour toutes
   * dans l'en-tete. Le cas contraire existe — un tournoi, un collegue remplace
   * — mais il est rare, et le rare se paie d'un clic, pas d'un champ permanent.
   * Ils s'ouvrent d'emblee si la seance porte une equipe inattendue : c'est
   * alors qu'il y a quelque chose a voir.
   */
  const [equipeDepliee, setEquipeDepliee] = useState(() =>
    equipeInhabituelle(seance, monEquipe),
  )

  const majExercices = (transformation: (exercices: Exercice[]) => Exercice[]) =>
    onModifier((s) => ({ ...s, exercices: transformation(s.exercices) }))

  const ajouter = () => {
    const exercice = nouvelExercice()
    majExercices((liste) => [...liste, exercice])
    onOuvrirExercice(exercice.id)
  }

  const deplacer = (index: number, delta: number) =>
    majExercices((exercices) => {
      const cible = index + delta
      if (cible < 0 || cible >= exercices.length) return exercices
      const copie = [...exercices]
      const [element] = copie.splice(index, 1)
      copie.splice(cible, 0, element)
      return copie
    })

  const enParallele = seance.exercices.filter((ex) => ex.enParallele).length

  return (
    <div className="panneau-principal">
      <button className="fil-ariane" onClick={onRetourAccueil}>
        ← Toutes les séances
      </button>

      <section className="carte">
        <h2>Informations de la séance</h2>
        <div className="grille-seance">
          <label className="champ">
            <span>Titre</span>
            <input
              type="text"
              value={seance.titre}
              onChange={(e) => onModifier((s) => ({ ...s, titre: e.target.value }))}
            />
          </label>
          <label className="champ">
            <span>Date</span>
            <input
              type="date"
              value={seance.date}
              onChange={(e) => onModifier((s) => ({ ...s, date: e.target.value }))}
            />
          </label>
        </div>

        {equipeDepliee ? (
          <div className="grille-equipe-seance">
            <label className="champ">
              <span>Équipe</span>
              <input
                type="text"
                value={seance.equipe}
                placeholder="Seniors garçons"
                onChange={(e) => onModifier((s) => ({ ...s, equipe: e.target.value }))}
              />
            </label>
            <label className="champ">
              <span>Catégorie</span>
              <input
                type="text"
                value={seance.categorieAge}
                placeholder="+18 ans"
                onChange={(e) => onModifier((s) => ({ ...s, categorieAge: e.target.value }))}
              />
            </label>
            {equipeInhabituelle(seance, monEquipe) && equipeRenseignee(monEquipe) && (
              <button
                type="button"
                className="bouton discret"
                onClick={() =>
                  onModifier((s) => ({
                    ...s,
                    equipe: monEquipe.equipe,
                    categorieAge: monEquipe.categorieAge,
                  }))
                }
                title="Reprendre l'équipe indiquée dans l'en-tête"
              >
                Reprendre {libelleEquipe(monEquipe)}
              </button>
            )}
          </div>
        ) : (
          <p className="equipe-seance">
            <span>{libelleEquipe(seance) || 'Aucune équipe indiquée'}</span>
            <button type="button" className="lien-discret" onClick={() => setEquipeDepliee(true)}>
              Autre équipe pour cette séance
            </button>
          </p>
        )}
        <div className="grille-effectif">
          <label className="champ">
            <span>Joueurs de champ présents</span>
            <input
              type="number"
              min={0}
              max={40}
              value={seance.effectifJoueurs || ''}
              placeholder="non renseigné"
              onChange={(e) =>
                onModifier((s) => ({ ...s, effectifJoueurs: Number(e.target.value) || 0 }))
              }
            />
          </label>
          <label className="champ">
            <span>Gardiens présents</span>
            <input
              type="number"
              min={0}
              max={6}
              value={seance.effectifGardiens || ''}
              placeholder="non renseigné"
              onChange={(e) =>
                onModifier((s) => ({ ...s, effectifGardiens: Number(e.target.value) || 0 }))
              }
            />
          </label>
          <p className="aide-effectif">
            Renseigne l'effectif du jour : les exercices qui demandent plus de monde sont alors
            signalés.
          </p>
        </div>

        <label className="champ" style={{ marginTop: 14 }}>
          <EtiquetteAvecDictee
            libelle="Objectif de la séance"
            quoi="l'objectif de la séance"
            onTexte={(f) =>
              onModifier((s) => ({ ...s, objectifSeance: ajouterFragment(s.objectifSeance, f) }))
            }
          />
          <textarea
            rows={2}
            value={seance.objectifSeance}
            placeholder="Ex : améliorer la circulation de balle face à une défense 6-0"
            onChange={(e) => onModifier((s) => ({ ...s, objectifSeance: e.target.value }))}
          />
        </label>
      </section>

      <div className="entete-section">
        <h2>Exercices</h2>
        <span className="compteur">
          {seance.exercices.length} fiche{seance.exercices.length > 1 ? 's' : ''} ·{' '}
          {dureeTotale(seance)} min
          {enParallele > 0 && ` · ${enParallele} en parallèle`}
        </span>
        <div className="pousse">
          {/*
            L'ordre suit la VIE d'une seance, lue depuis la droite : on ajoute
            des exercices, on va en chercher dans la bibliotheque, on mene la
            seance, on l'imprime, on la duplique pour la semaine suivante, on
            l'exporte, et un jour on la supprime. Cette lecture met aussi les
            commandes les plus utilisees au plus pres du bouton principal, la
            ou la main revient.

            La suppression est a l'autre bout, derriere un separateur. Elle
            etait auparavant coincee entre « Exporter » et « Bibliotheque »,
            deux commandes anodines : la seule action irreversible de la rangee
            se trouvait a un pixel des plus frequentes.
          */}

          <button className="bouton danger" onClick={onSupprimerSeance}>
            Supprimer la séance
          </button>
          <span className="separateur-actions" aria-hidden="true" />
          <button className="bouton" onClick={onExporterSeance}>
            Exporter
          </button>
          <button className="bouton" onClick={onDupliquer}>
            Dupliquer
          </button>
          <button className="bouton" onClick={onImprimerSeance} disabled={seance.exercices.length === 0}>
            Imprimer la séance
          </button>
          <button
            className="bouton mode-terrain-ouvrir"
            onClick={onModeTerrain}
            disabled={seance.exercices.length === 0}
            title="Afficher la séance en grand, un exercice à la fois, pour la mener"
          >
            ▶ Mode terrain
          </button>
          <button className="bouton" onClick={onOuvrirBibliotheque}>
            Bibliothèque
          </button>
          <button className="bouton principal" onClick={ajouter}>
            + Exercice
          </button>
        </div>
      </div>

      {seance.exercices.length === 0 ? (
        <div className="vide">
          <p>Cette séance ne contient encore aucun exercice.</p>
          <div className="actions-vide">
            <button className="bouton principal" onClick={ajouter}>
              Créer une fiche
            </button>
            <button className="bouton" onClick={onOuvrirBibliotheque}>
              Choisir dans la bibliothèque
            </button>
          </div>
        </div>
      ) : (
        <ol className="liste-exercices">
          {seance.exercices.map((exercice, index) => (
            <li className="ligne-exercice" key={exercice.id}>
              <span className="rang">{index + 1}</span>
              <button className="lien-exercice" onClick={() => onOuvrirExercice(exercice.id)}>
                <span className="titre-exercice">{exercice.titre || 'Sans titre'}</span>
                <span className="meta-exercice">
                  <span>
                    {LIBELLES_CATEGORIE[exercice.categorie]} · {exercice.duree} min ·{' '}
                    {/* Une fiche menee par les seuls gardiens n'a pas de joueurs
                        de champ : afficher « 0 joueurs » n'apprendrait rien. */}
                    {exercice.nombreJoueurs > 0
                      ? `${exercice.nombreJoueurs} joueurs`
                      : `${exercice.nombreGardiens} gardien${exercice.nombreGardiens > 1 ? 's' : ''}`}
                  </span>
                  {exercice.enParallele && <em className="jeton-parallele">en parallèle</em>}
                  {manqueEffectif(exercice, seance) && (
                    <em className="jeton-manque" title="Cet exercice demande plus de monde que l'effectif annoncé">
                      effectif insuffisant
                    </em>
                  )}
                </span>
              </button>
              <NoteEtoiles note={exercice.evaluation.note} lectureSeule taille="compacte" />
              <div className="actions">
                <button
                  className="bouton discret"
                  title="Monter"
                  disabled={index === 0}
                  onClick={() => deplacer(index, -1)}
                >
                  ↑
                </button>
                <button
                  className="bouton discret"
                  title="Descendre"
                  disabled={index === seance.exercices.length - 1}
                  onClick={() => deplacer(index, 1)}
                >
                  ↓
                </button>
                <button
                  className="bouton discret"
                  title="Dupliquer"
                  onClick={() =>
                    majExercices((liste) => [
                      ...liste.slice(0, index + 1),
                      clonerExercice(exercice),
                      ...liste.slice(index + 1),
                    ])
                  }
                >
                  ⧉
                </button>
                <button
                  className="bouton discret"
                  title="Exporter cette fiche"
                  onClick={() => onExporterExercice(exercice)}
                >
                  ⇩
                </button>
                <button
                  className="bouton discret"
                  title="Supprimer"
                  onClick={async () => {
                    const accepte = await confirmer({
                      titre: 'Supprimer cet exercice ?',
                      message: (
                        <>
                          <strong>{exercice.titre || 'Sans titre'}</strong> sera retiré de la
                          séance, avec son schéma. Cette action est définitive.
                          <em className="dialogue-note">
                            La fiche reste disponible dans votre bibliothèque si elle y a été
                            enregistrée.
                          </em>
                        </>
                      ),
                      libelleConfirmer: 'Supprimer',
                      danger: true,
                    })
                    if (accepte) majExercices((liste) => liste.filter((e) => e.id !== exercice.id))
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
