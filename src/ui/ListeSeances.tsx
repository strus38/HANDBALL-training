import { dureeTotale, type Seance } from '../domain/types'

interface Props {
  seances: Seance[]
  seanceCouranteId: string | undefined
  onSelectionner: (id: string) => void
  onNouvelle: () => void
  onImporter: () => void
  onAccueil: () => void
  onBilan: () => void
  /** Vue affichee dans le panneau principal, pour marquer le lien actif. */
  vue: 'accueil' | 'bilan' | 'seance'
  /**
   * Replie le menu. Le bouton vit ici, sur le panneau qu'il commande : dans
   * l'entete de l'application, detache de la liste, personne ne le trouvait.
   */
  onReplier: () => void
}

export function ListeSeances({
  seances,
  seanceCouranteId,
  onSelectionner,
  onNouvelle,
  onImporter,
  onAccueil,
  onBilan,
  vue,
  onReplier,
}: Props) {
  return (
    <aside className="colonne-seances">
      <div className="tete-seances">
        <span className="etiquette-groupe">Séances</span>
        <button
          className="bouton discret replier-menu"
          onClick={onReplier}
          title="Replier le menu des séances"
          aria-label="Replier le menu des séances"
        >
          ⟨⟨
        </button>
      </div>
      <div className="barre">
        <button className="bouton principal" onClick={onNouvelle}>
          + Séance
        </button>
        <button className="bouton" onClick={onImporter} title="Ouvrir un fichier .hbt.json">
          Importer
        </button>
      </div>
      <button
        className={`lien-accueil${vue === 'accueil' ? ' actif' : ''}`}
        onClick={onAccueil}
        title="Vue d'ensemble de toutes les séances"
      >
        Toutes les séances
      </button>
      <button
        className={`lien-accueil${vue === 'bilan' ? ' actif' : ''}`}
        onClick={onBilan}
        title="Ce qui a été travaillé sur la saison"
      >
        Bilan de la saison
      </button>
      {seances.length === 0 ? (
        <p style={{ padding: '16px', color: 'var(--texte-doux)', fontSize: 13 }}>
          Aucune séance enregistrée.
        </p>
      ) : (
        <ul className="liste-seances">
          {seances.map((seance) => (
            <li key={seance.id}>
              <button
                className={seance.id === seanceCouranteId ? 'active' : undefined}
                onClick={() => onSelectionner(seance.id)}
              >
                <span className="titre-seance">{seance.titre || 'Sans titre'}</span>
                <span className="meta-seance">
                  {formaterDate(seance.date)} · {seance.exercices.length} exercice
                  {seance.exercices.length > 1 ? 's' : ''} · {dureeTotale(seance)} min
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

/** AAAA-MM-JJ vers JJ/MM/AAAA. */
export function formaterDate(iso: string): string {
  const parties = iso.split('-')
  if (parties.length !== 3) return iso
  return `${parties[2]}/${parties[1]}/${parties[0]}`
}
