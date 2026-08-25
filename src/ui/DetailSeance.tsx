import { useState } from 'react'
import {
  clonerExercice,
  dateDuJour,
  dateEnToutesLettres,
  nouvelExercice,
  redater,
} from '../domain/fabrique'
import { equipeInhabituelle, equipeRenseignee, libelleEquipe, type MonEquipe } from '../domain/equipe'
import {
  calerSurLePlanning,
  creneauDuJour,
  creneauSuivant,
  dureeCreneau,
  libelleCreneau,
  voisinesDe,
} from '../domain/planning'
import {
  depassementCreneau,
  dureeTotale,
  LIBELLES_CATEGORIE,
  LIBELLES_ESPACE,
  manqueEffectif,
  retourPrecedent,
  manqueEspace,
  type Espace,
  type Exercice,
  type Seance,
} from '../domain/types'
import { consoliderMateriel, libelleMateriel } from '../domain/materiel'
import { NoteEtoiles } from './NoteEtoiles'
import { useConfirmation } from './Dialogue'
import { EtiquetteAvecDictee } from './Dictee'
import { ajouterFragment } from '../domain/dictee'

interface Props {
  seance: Seance
  /**
   * Toutes les seances : sert a retrouver le retour a chaud de la precedente.
   * C'est ce rappel qui fait qu'un bilan ecrit le mardi soir est relu le jeudi.
   */
  seances: Seance[]
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
  seances,
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
  const materiel = consoliderMateriel(seance.exercices)
  const precedente = retourPrecedent(seance, seances)

  /**
   * Ce que le planning du club sait de ce soir-la.
   *
   * Relu a l'affichage plutot que stocke : c'est une information sur le
   * CRENEAU, pas sur la seance. Seules la duree et l'espace, dont depend une
   * alerte, sont recopies dans la seance — pour qu'un plan de 95 minutes reste
   * un plan trop long meme apres un changement de planning.
   */
  const creneau = creneauDuJour(seance.equipe, seance.date)
  const voisines = creneau ? voisinesDe(creneau, seance.equipe) : []
  const suivant = creneau ? creneauSuivant(creneau) : undefined
  const depassement = depassementCreneau(seance)

  return (
    <div className="panneau-principal">
      <button className="fil-ariane" onClick={onRetourAccueil}>
        ← Toutes les séances
      </button>

      {/*
        Le retour de la seance precedente, rappele AVANT tout le reste.
        Un bilan qu'il faut aller chercher n'est jamais relu ; celui-ci se pose
        sur le chemin, la ou l'entraineur arrive quand il prepare le prochain
        entrainement.
      */}
      {precedente && (
        <section className="rappel-retour">
          <span className="etiquette-groupe">
            Retour du {dateEnToutesLettres(precedente.date)}
          </span>
          {precedente.retour
            .split('\n')
            .filter(Boolean)
            .map((ligne, i) => (
              <p key={i}>{ligne}</p>
            ))}
        </section>
      )}

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
              /*
                Changer la date, c'est changer de creneau : le mardi des moins
                de 13 dure 90 minutes, leur vendredi 75. Sans ce recalage, la
                seance deplacee garderait l'ancienne duree et l'ancien espace,
                et l'alerte de depassement porterait sur un soir revolu.

                redater emmene aussi le titre, tant qu'il est celui pose par
                l'application. Un titre ecrit a la main, lui, ne bouge pas.
              */
              onChange={(e) => onModifier((s) => calerSurLePlanning(redater(s, e.target.value)))}
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
        {/*
          Le creneau, sous l'equipe et la date dont il decoule. Il dit trois
          choses que l'entraineur n'a plus a saisir : combien de temps il a,
          avec qui il partage le sol, et qui attend derriere la porte.
        */}
        {creneau && (
          <p className="creneau-seance">
            <strong>{libelleCreneau(creneau)}</strong> · {dureeCreneau(creneau)} min ·{' '}
            {voisines.length > 0
              ? `demi-terrain, ${voisines.join(' et ')} sur l'autre moitié`
              : 'terrain complet'}
            {suivant && ` · ${suivant.equipes.join(' et ')} enchaîne ensuite`}
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
          <label className="champ">
            <span>Espace disponible</span>
            <select
              value={seance.espaceDisponible}
              onChange={(e) =>
                onModifier((s) => ({
                  ...s,
                  espaceDisponible: e.target.value as Espace | '',
                }))
              }
            >
              <option value="">non renseigné</option>
              {Object.entries(LIBELLES_ESPACE).map(([valeur, libelle]) => (
                <option key={valeur} value={valeur}>
                  {libelle}
                </option>
              ))}
            </select>
          </label>
          <p className="aide-effectif">
            Renseigne l'effectif et l'espace du jour : les exercices qui demandent plus de monde, ou
            plus de place, sont alors signalés.
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

        {/*
          Le materiel de toute la seance, additionne : c'est la liste qu'on
          charge dans le coffre, et elle n'existait nulle part alors que chaque
          fiche portait deja la sienne.
        */}
        {materiel.length > 0 && (
          <p className="materiel-seance">
            <strong>À emporter :</strong> {libelleMateriel(materiel)}
          </p>
        )}
      </section>

      {/*
        Le retour a chaud, en bas de la carte d'informations : on l'ecrit APRES
        la seance, pas en la preparant. C'est aussi ce qui remontera tout seul a
        l'ouverture de la suivante.
      */}
      <section className="carte carte-retour">
        <label className="champ">
          <EtiquetteAvecDictee
            libelle="Retour à chaud"
            quoi="le retour sur la séance"
            onTexte={(f) =>
              onModifier((s) => ({
                ...s,
                retour: ajouterFragment(s.retour, f),
                retourEcritLe: dateDuJour(),
              }))
            }
          />
          <textarea
            rows={3}
            value={seance.retour}
            placeholder="Ce qui s'est passé ce soir : l'ambiance, les absents, ce qu'on reprend jeudi"
            onChange={(e) =>
              onModifier((s) => ({
                ...s,
                retour: e.target.value,
                retourEcritLe: e.target.value.trim() ? dateDuJour() : '',
              }))
            }
          />
          <span className="aide-effectif">
            Il vous sera rappelé à l'ouverture de la séance suivante.
          </span>
        </label>
      </section>

      <div className="entete-section">
        <h2>Exercices</h2>
        <span className="compteur">
          {seance.exercices.length} fiche{seance.exercices.length > 1 ? 's' : ''} ·{' '}
          {dureeTotale(seance)} min
          {/*
            « 95 min sur 90 » : le total seul ne disait rien tant qu'il fallait
            se rappeler la longueur du creneau. Le rapport, lui, se lit d'un
            coup d'oeil — et le depassement se voit avant le gymnase, pas
            pendant, en sautant le dernier atelier.
          */}
          {seance.dureeCreneau ? ` sur ${seance.dureeCreneau}` : ''}
          {enParallele > 0 && ` · ${enParallele} en parallèle`}
        </span>
        {depassement > 0 && (
          <em
            className="jeton-manque"
            title={
              suivant
                ? `La séance déborde du créneau : ${suivant.equipes.join(' et ')} attend le terrain`
                : 'La séance déborde du créneau'
            }
          >
            {depassement} min de trop
          </em>
        )}
        <div className="pousse">
          {/*
            L'ordre suit la VIE d'une seance, lue depuis la droite : on ajoute
            des exercices, on va en chercher dans la bibliotheque, on mene la
            seance, on l'imprime, on la duplique pour la semaine suivante, on
            l'exporte, et un jour on la supprime. Cette lecture met aussi les
            commandes les plus utilisees au plus pres du bouton principal, la
            ou la main revient.

            La suppression est a l'autre bout, derriere un separateur. Elle
            etait auparavant coincee entre « Sauvegarder » et « Bibliotheque »,
            deux commandes anodines : la seule action irreversible de la rangee
            se trouvait a un pixel des plus frequentes.
          */}

          <button className="bouton danger" onClick={onSupprimerSeance}>
            Supprimer la séance
          </button>
          <span className="separateur-actions" aria-hidden="true" />
          {/*
            « Sauvegarder » et non « Exporter » : le mot ne parlait pas aux
            entraineurs. Il fait paire avec « Sauvegarder tout » de l'accueil —
            meme verbe, deux portees.

            L'infobulle dit ce que le bouton PRODUIT. Sans elle, le mot pourrait
            laisser croire qu'il faut cliquer pour ne pas perdre son travail,
            alors que l'enregistrement est automatique et que l'indicateur de
            l'entete l'annonce deja.
          */}
          <button
            className="bouton"
            onClick={onExporterSeance}
            title="Enregistrer cette séance dans un fichier, pour l'envoyer ou la garder ailleurs"
          >
            Sauvegarder
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
                  {manqueEspace(exercice, seance) && (
                    <em
                      className="jeton-manque"
                      title="Cet exercice demande plus de place que l'espace annoncé"
                    >
                      espace insuffisant
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
                  title="Sauvegarder cette fiche dans un fichier"
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
