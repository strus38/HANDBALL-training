/**
 * Feuilles d'exercice destinees au papier.
 *
 * Une fiche tient sur une page A4 paysage. La disposition n'est PAS fixee :
 * elle est calculee fiche par fiche par choisirMiseEnPage(), qui cherche le
 * plus grand schema possible sans faire deborder le texte. Un terrain complet,
 * large et plat, part en banniere sur toute la largeur ; un demi-terrain ou une
 * vue de zone restent en colonne a gauche, comme a l'ecran.
 *
 * Ce bloc n'est visible qu'a l'impression (voir styles.css).
 */

import { Terrain } from '../terrain/Terrain'
import { choisirMiseEnPage, type MiseEnPage } from '../impression/miseEnPage'
import { synthetiser } from '../domain/mouvement'
import { TexteFiche } from './TexteFiche'
import {
  dureeTotale,
  LIBELLES_CATEGORIE,
  LIBELLES_FORMAT_GARDIENS,
  type Exercice,
  type Seance,
} from '../domain/types'

interface Props {
  seance: Seance
  /** Exercices a imprimer : la seance entiere, ou une seule fiche. */
  exercices: Exercice[]
}

export function FeuillesImpression({ seance, exercices }: Props) {
  return (
    <div className="impression" aria-hidden="true">
      {exercices.map((exercice, index) => (
        <Feuille
          key={exercice.id}
          exercice={exercice}
          seance={seance}
          index={index}
          total={exercices.length}
        />
      ))}
    </div>
  )
}

function Feuille({
  exercice,
  seance,
  index,
  total,
}: {
  exercice: Exercice
  seance: Seance
  index: number
  total: number
}) {
  const page = choisirMiseEnPage(exercice)
  /*
    Un SEUL schema sur la feuille, portant tout l'enchainement.
    Quatre vignettes reduisaient chaque terrain au quart de la page et
    obligeaient a reconstituer le mouvement en passant de l'une a l'autre. Les
    titres et consignes des etapes restent listes dans la colonne de texte :
    ils servent de legende aux fleches numerotees.
  */
  const schemaSynthetise = synthetiser(exercice.schema)

  return (
    <article
      className="feuille"
      data-disposition={page.disposition}
      data-police={page.policePt}
    >
      <header className="feuille-entete">
        <div>
          <h1>
            {total > 1 && <span className="numero">{index + 1}.</span>}
            {exercice.titre || 'Sans titre'}
          </h1>
          <p className="feuille-seance">
            {seance.titre} · {formaterDate(seance.date)}
            {seance.equipe && ` · ${seance.equipe}`}
            {seance.categorieAge && ` · ${seance.categorieAge}`}
          </p>
        </div>
        <ul className="feuille-reperes">
          <li>
            <span>Durée</span>
            <strong>
              {exercice.duree} min{exercice.enParallele && ' (parallèle)'}
            </strong>
          </li>
          <li>
            <span>Joueurs</span>
            <strong>
              {exercice.nombreJoueurs} + {exercice.nombreGardiens} GB
            </strong>
          </li>
          <li>
            <span>Catégorie</span>
            <strong>{LIBELLES_CATEGORIE[exercice.categorie]}</strong>
          </li>
        </ul>
      </header>

      <div className="feuille-corps" style={styleCorps(page)}>
        <div className="feuille-schema">
          <Terrain
            schema={schemaSynthetise}
            etape={schemaSynthetise.etapes[0]}
            etapeIndex={0}
            interactif={false}
          />
        </div>

        <div className="feuille-texte" style={styleTexte(page)}>
          {exercice.objectifs && (
            <section>
              <h2>Objectifs</h2>
              <p>{exercice.objectifs}</p>
            </section>
          )}
          {exercice.formeIntervention && (
            <section>
              <h2>Forme d'intervention</h2>
              <p>{exercice.formeIntervention}</p>
            </section>
          )}
          {exercice.misePlace && (
            <section>
              <h2>Mise en place</h2>
              {lignes(exercice.misePlace)}
            </section>
          )}
          {exercice.fonctionnement && (
            <section>
              <h2>Fonctionnement</h2>
              {lignes(exercice.fonctionnement)}
            </section>
          )}
          {exercice.regulation && (
            <section>
              <h2>Régulation</h2>
              {lignes(exercice.regulation)}
            </section>
          )}
          {exercice.schema.etapes.length > 1 && (
            <section>
              <h2>Étapes</h2>
              <ol className="liste-etapes-impression">
                {exercice.schema.etapes.map((etape) => (
                  <li key={etape.id}>
                    <strong>{etape.titre}</strong>
                    {etape.consigne && ` — ${etape.consigne}`}
                  </li>
                ))}
              </ol>
            </section>
          )}
          {exercice.pointsCles && (
            <section>
              <h2>Points clés</h2>
              {lignes(exercice.pointsCles)}
            </section>
          )}
          {exercice.evolution && (
            <section>
              <h2>Évolution</h2>
              {lignes(exercice.evolution)}
            </section>
          )}
          <section className="feuille-pied">
            <p>
              <strong>Matériel :</strong> {exercice.materiel.join(', ') || 'aucun'} ·{' '}
              <strong>Gardiens :</strong> {LIBELLES_FORMAT_GARDIENS[exercice.formatGardiens]}
            </p>
          </section>
        </div>
      </div>

      <footer className="feuille-bas">
        <span>HBPSM · {seance.titre}</span>
        <span>
          {total > 1
            ? `Exercice ${index + 1} sur ${total} · séance de ${dureeTotale(seance)} min`
            : `${exercice.duree} min`}
        </span>
      </footer>
    </article>
  )
}

/**
 * Repartition schema / texte, en pourcentages calcules.
 *
 * Cote a cote : deux colonnes. En banniere : deux lignes, le schema recevant
 * exactement la hauteur que le texte lui laisse.
 */
function styleCorps(page: MiseEnPage): React.CSSProperties {
  const part = `${(page.partSchema * 100).toFixed(1)}%`
  return page.disposition === 'cote-a-cote'
    ? { gridTemplateColumns: `${part} 1fr`, gridTemplateRows: '1fr' }
    : { gridTemplateColumns: '1fr', gridTemplateRows: `${part} 1fr` }
}

function styleTexte(page: MiseEnPage): React.CSSProperties {
  return {
    fontSize: `${page.policePt}pt`,
    columnCount: page.colonnesTexte > 1 ? page.colonnesTexte : undefined,
    columnGap: page.colonnesTexte > 1 ? '6mm' : undefined,
  }
}

function lignes(texte: string) {
  return <TexteFiche texte={texte} />
}

function formaterDate(iso: string): string {
  const parties = iso.split('-')
  return parties.length === 3 ? `${parties[2]}/${parties[1]}/${parties[0]}` : iso
}
