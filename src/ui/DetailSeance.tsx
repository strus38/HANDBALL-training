import { clonerExercice, nouvelExercice } from '../domain/fabrique'
import {
  dureeTotale,
  LIBELLES_CATEGORIE,
  manqueEffectif,
  type Exercice,
  type Seance,
} from '../domain/types'
import { NoteEtoiles } from './NoteEtoiles'
import { useConfirmation } from './Dialogue'

interface Props {
  seance: Seance
  onModifier: (transformation: (seance: Seance) => Seance) => void
  onSupprimerSeance: () => void
  onExporterSeance: () => void
  onExporterExercice: (exercice: Exercice) => void
  onOuvrirExercice: (id: string) => void
  onOuvrirBibliotheque: () => void
  onImprimerSeance: () => void
  onRetourAccueil: () => void
  onDupliquer: () => void
}

export function DetailSeance({
  seance,
  onModifier,
  onSupprimerSeance,
  onExporterSeance,
  onExporterExercice,
  onOuvrirExercice,
  onOuvrirBibliotheque,
  onImprimerSeance,
  onRetourAccueil,
  onDupliquer,
}: Props) {
  const confirmer = useConfirmation()

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
        ← Toutes les seances
      </button>

      <section className="carte">
        <h2>Informations de la seance</h2>
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
          <label className="champ">
            <span>Equipe</span>
            <input
              type="text"
              value={seance.equipe}
              placeholder="Seniors garcons"
              onChange={(e) => onModifier((s) => ({ ...s, equipe: e.target.value }))}
            />
          </label>
          <label className="champ">
            <span>Categorie</span>
            <input
              type="text"
              value={seance.categorieAge}
              placeholder="+18 ans"
              onChange={(e) => onModifier((s) => ({ ...s, categorieAge: e.target.value }))}
            />
          </label>
        </div>
        <div className="grille-effectif">
          <label className="champ">
            <span>Joueurs de champ presents</span>
            <input
              type="number"
              min={0}
              max={40}
              value={seance.effectifJoueurs || ''}
              placeholder="non renseigne"
              onChange={(e) =>
                onModifier((s) => ({ ...s, effectifJoueurs: Number(e.target.value) || 0 }))
              }
            />
          </label>
          <label className="champ">
            <span>Gardiens presents</span>
            <input
              type="number"
              min={0}
              max={6}
              value={seance.effectifGardiens || ''}
              placeholder="non renseigne"
              onChange={(e) =>
                onModifier((s) => ({ ...s, effectifGardiens: Number(e.target.value) || 0 }))
              }
            />
          </label>
          <p className="aide-effectif">
            Renseigne l'effectif du jour : les exercices qui demandent plus de monde sont alors
            signales.
          </p>
        </div>

        <label className="champ" style={{ marginTop: 14 }}>
          <span>Objectif de la seance</span>
          <textarea
            rows={2}
            value={seance.objectifSeance}
            placeholder="Ex : ameliorer la circulation de balle face a une defense 6-0"
            onChange={(e) => onModifier((s) => ({ ...s, objectifSeance: e.target.value }))}
          />
        </label>
      </section>

      <div className="entete-section">
        <h2>Exercices</h2>
        <span className="compteur">
          {seance.exercices.length} fiche{seance.exercices.length > 1 ? 's' : ''} ·{' '}
          {dureeTotale(seance)} min
          {enParallele > 0 && ` · ${enParallele} en parallele`}
        </span>
        <div className="pousse">
          <button className="bouton" onClick={onDupliquer}>
            Dupliquer
          </button>
          <button className="bouton" onClick={onImprimerSeance} disabled={seance.exercices.length === 0}>
            Imprimer la seance
          </button>
          <button className="bouton" onClick={onExporterSeance}>
            Exporter
          </button>
          <button className="bouton danger" onClick={onSupprimerSeance}>
            Supprimer la seance
          </button>
          <button className="bouton" onClick={onOuvrirBibliotheque}>
            Bibliotheque
          </button>
          <button className="bouton principal" onClick={ajouter}>
            + Exercice
          </button>
        </div>
      </div>

      {seance.exercices.length === 0 ? (
        <div className="vide">
          <p>Cette seance ne contient encore aucun exercice.</p>
          <div className="actions-vide">
            <button className="bouton principal" onClick={ajouter}>
              Creer une fiche
            </button>
            <button className="bouton" onClick={onOuvrirBibliotheque}>
              Choisir dans la bibliotheque
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
                  {exercice.enParallele && <em className="jeton-parallele">en parallele</em>}
                  {manqueEffectif(exercice, seance) && (
                    <em className="jeton-manque" title="Cet exercice demande plus de monde que l'effectif annonce">
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
                          <strong>{exercice.titre || 'Sans titre'}</strong> sera retire de la
                          seance, avec son schema. Cette action est definitive.
                          <em className="dialogue-note">
                            La fiche reste disponible dans votre bibliotheque si elle y a ete
                            enregistree.
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
