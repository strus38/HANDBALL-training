/**
 * Page d'accueil : toutes les seances, avec leur resume.
 *
 * C'est la vue d'ensemble d'un classeur d'entraineur — ce qui a ete fait, ce
 * qui est prevu, et de quoi rejouer une seance qui a bien marche a une autre
 * date. La liste laterale sert a naviguer vite ; cette page sert a decider.
 */

import { useMemo, useState } from 'react'
import { NoteEtoiles } from './NoteEtoiles'
import { dateEnToutesLettres, resumerSeance, situerDansLeTemps } from '../domain/resume'
import { dateDuJour } from '../domain/fabrique'
import { LIBELLES_CATEGORIE, type Seance } from '../domain/types'

type Tri = 'date-desc' | 'date-asc' | 'titre'

interface Props {
  seances: Seance[]
  onOuvrir: (id: string) => void
  onNouvelle: () => void
  onImporter: () => void
  onSauvegarder: () => void
  onDupliquer: (seance: Seance) => void
  onExporter: (seance: Seance) => void
  onImprimer: (seance: Seance) => void
  onSupprimer: (seance: Seance) => void
}

export function TableauSeances({
  seances,
  onOuvrir,
  onNouvelle,
  onImporter,
  onSauvegarder,
  onDupliquer,
  onExporter,
  onImprimer,
  onSupprimer,
}: Props) {
  const [recherche, setRecherche] = useState('')
  const [tri, setTri] = useState<Tri>('date-desc')

  const sansAccent = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

  const affichees = useMemo(() => {
    const mots = sansAccent(recherche).split(/\s+/).filter(Boolean)
    const filtrees = seances.filter((seance) => {
      if (mots.length === 0) return true
      const texte = sansAccent(
        `${seance.titre} ${seance.equipe} ${seance.categorieAge} ${seance.objectifSeance} ` +
          seance.exercices.map((e) => e.titre).join(' '),
      )
      return mots.every((mot) => texte.includes(mot))
    })
    return [...filtrees].sort((a, b) => {
      if (tri === 'titre') return a.titre.localeCompare(b.titre, 'fr')
      const ordre = a.date.localeCompare(b.date)
      return tri === 'date-asc' ? ordre : -ordre
    })
  }, [seances, recherche, tri])

  const aujourdHui = dateDuJour()
  const minutesTotales = seances.reduce((total, s) => total + resumerSeance(s).minutes, 0)
  const exercicesTotaux = seances.reduce((total, s) => total + s.exercices.length, 0)

  return (
    <div className="panneau-principal">
      <div className="entete-tableau">
        <div>
          <h2>Mes seances</h2>
          <p className="resume-global">
            {seances.length === 0
              ? 'Aucune seance enregistree pour le moment.'
              : `${seances.length} seance${seances.length > 1 ? 's' : ''} · ${exercicesTotaux} exercice${exercicesTotaux > 1 ? 's' : ''} · ${Math.round(minutesTotales / 60)} h de contenu`}
          </p>
        </div>
        <div className="pousse">
          <button
            className="bouton"
            onClick={onSauvegarder}
            disabled={seances.length === 0}
            title="Enregistrer toutes les seances et votre bibliotheque dans un seul fichier"
          >
            Sauvegarder tout
          </button>
          <button className="bouton" onClick={onImporter}>
            Importer
          </button>
          <button className="bouton principal" onClick={onNouvelle}>
            + Nouvelle seance
          </button>
        </div>
      </div>

      {seances.length > 0 && (
        <div className="barre-tableau">
          <input
            type="text"
            className="recherche"
            placeholder="Rechercher une seance, une equipe, un exercice..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
          />
          <div className="groupe-vues">
            <button
              className={`bouton segment${tri === 'date-desc' ? ' actif' : ''}`}
              onClick={() => setTri('date-desc')}
            >
              Plus recentes
            </button>
            <button
              className={`bouton segment${tri === 'date-asc' ? ' actif' : ''}`}
              onClick={() => setTri('date-asc')}
            >
              Plus anciennes
            </button>
            <button
              className={`bouton segment${tri === 'titre' ? ' actif' : ''}`}
              onClick={() => setTri('titre')}
            >
              Par titre
            </button>
          </div>
        </div>
      )}

      {seances.length === 0 ? (
        <div className="vide">
          <p>Creez votre premiere seance, ou importez un fichier recu d'un autre entraineur.</p>
          <div className="actions-vide">
            <button className="bouton principal" onClick={onNouvelle}>
              Creer une seance
            </button>
            <button className="bouton" onClick={onImporter}>
              Importer un fichier
            </button>
          </div>
        </div>
      ) : affichees.length === 0 ? (
        <div className="vide">
          <p>Aucune seance ne correspond a cette recherche.</p>
        </div>
      ) : (
        <ul className="grille-seances">
          {affichees.map((seance) => (
            <CarteSeance
              key={seance.id}
              seance={seance}
              aujourdHui={aujourdHui}
              onOuvrir={() => onOuvrir(seance.id)}
              onDupliquer={() => onDupliquer(seance)}
              onExporter={() => onExporter(seance)}
              onImprimer={() => onImprimer(seance)}
              onSupprimer={() => onSupprimer(seance)}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

function CarteSeance({
  seance,
  aujourdHui,
  onOuvrir,
  onDupliquer,
  onExporter,
  onImprimer,
  onSupprimer,
}: {
  seance: Seance
  aujourdHui: string
  onOuvrir: () => void
  onDupliquer: () => void
  onExporter: () => void
  onImprimer: () => void
  onSupprimer: () => void
}) {
  const resume = resumerSeance(seance)
  const passee = seance.date < aujourdHui

  return (
    <li className={`carte-seance${passee ? ' passee' : ''}`}>
      <button className="zone-ouverture" onClick={onOuvrir}>
        <div className="entete-carte">
          <div>
            <h3>{seance.titre || 'Sans titre'}</h3>
            <p className="date-carte">
              {dateEnToutesLettres(seance.date)}
              <em>{situerDansLeTemps(seance.date, aujourdHui)}</em>
            </p>
          </div>
          {resume.noteMoyenne !== undefined && (
            <span
              className="note-moyenne"
              title={`Moyenne de ${resume.nombreEvalues} exercice${resume.nombreEvalues > 1 ? 's' : ''} evalue${resume.nombreEvalues > 1 ? 's' : ''}`}
            >
              <NoteEtoiles
                note={Math.round(resume.noteMoyenne) as 1 | 2 | 3 | 4 | 5}
                lectureSeule
                taille="compacte"
              />
              <em>{resume.noteMoyenne.toFixed(1)}</em>
            </span>
          )}
        </div>

        {(seance.equipe || seance.categorieAge) && (
          <p className="equipe-carte">
            {[seance.equipe, seance.categorieAge].filter(Boolean).join(' · ')}
          </p>
        )}

        <ul className="chiffres-carte">
          <li>
            <strong>{resume.minutes}</strong> min
          </li>
          <li>
            <strong>{resume.nombreExercices}</strong> exercice
            {resume.nombreExercices > 1 ? 's' : ''}
          </li>
          <li>
            <strong>
              {seance.effectifJoueurs || '—'}
              {seance.effectifGardiens > 0 && ` + ${seance.effectifGardiens} GB`}
            </strong>{' '}
            presents
          </li>
        </ul>

        {resume.repartition.length > 0 && (
          <>
            <div
              className="barre-repartition"
              role="img"
              aria-label={resume.repartition
                .map((p) => `${LIBELLES_CATEGORIE[p.categorie]} ${p.minutes} minutes`)
                .join(', ')}
            >
              {resume.repartition
                .filter((p) => p.minutes > 0)
                .map((p) => (
                  <span
                    key={p.categorie}
                    className={`part part-${p.categorie}`}
                    style={{ flexGrow: p.minutes }}
                    title={`${LIBELLES_CATEGORIE[p.categorie]} · ${p.minutes} min`}
                  />
                ))}
            </div>
            <p className="legende-repartition">
              {resume.repartition.slice(0, 3).map((p) => (
                <span key={p.categorie}>
                  <i className={`pastille-categorie part-${p.categorie}`} />
                  {LIBELLES_CATEGORIE[p.categorie]}
                  {p.minutes > 0 && ` ${p.minutes} min`}
                </span>
              ))}
            </p>
          </>
        )}

        {seance.objectifSeance && <p className="objectif-carte">{seance.objectifSeance}</p>}

        <p className="signaux-carte">
          {resume.travailGardiens && <em className="signal">Travail gardiens</em>}
          {resume.nombreEnParallele > 0 && (
            <em className="signal">{resume.nombreEnParallele} en parallele</em>
          )}
          {resume.nombreIncompatibles > 0 && (
            <em className="signal alerte" title="Exercices demandant plus de monde que l'effectif">
              {resume.nombreIncompatibles} au-dessus de l'effectif
            </em>
          )}
          {resume.nombreExercices === 0 && <em className="signal">Seance vide</em>}
        </p>
      </button>

      <div className="actions-carte">
        <button className="bouton principal" onClick={onDupliquer}>
          Dupliquer
        </button>
        <button className="bouton" onClick={onImprimer} disabled={resume.nombreExercices === 0}>
          Imprimer
        </button>
        <button className="bouton" onClick={onExporter}>
          Exporter
        </button>
        <button className="bouton discret" onClick={onSupprimer} title="Supprimer la seance">
          ✕
        </button>
      </div>
    </li>
  )
}
