/**
 * Bilan de saison : ce qui a ete travaille, et dans quelles proportions.
 *
 * La page repond a une question qu'on ne se pose jamais en preparant une seance
 * isolee : « depuis septembre, ai-je assez travaille la defense ? ». Elle ne
 * juge pas — elle montre, et laisse l'entraineur decider.
 */

import { useMemo, useState } from 'react'
import { calculerBilan, pourcentage, saisonDe, toutesLesDates } from '../domain/bilan'
import { dateDuJour } from '../domain/fabrique'
import { NoteEtoiles } from './NoteEtoiles'
import { LIBELLES_CATEGORIE, type Seance } from '../domain/types'

interface Props {
  seances: Seance[]
}

export function Bilan({ seances }: Props) {
  const [surLaSaison, setSurLaSaison] = useState(true)

  const bilan = useMemo(() => {
    const periode = surLaSaison ? saisonDe(dateDuJour()) : toutesLesDates(seances)
    return calculerBilan(seances, periode)
  }, [seances, surLaSaison])

  const maximumMois = Math.max(1, ...bilan.parMois.map((m) => m.minutes))

  return (
    <div className="panneau-principal">
      <div className="entete-tableau">
        <div>
          <h2>Bilan</h2>
          <p className="resume-global">{bilan.periode.libelle}</p>
        </div>
        <div className="pousse">
          <div className="groupe-vues">
            <button
              className={`bouton segment${surLaSaison ? ' actif' : ''}`}
              onClick={() => setSurLaSaison(true)}
              title="Ne compter que les séances de la saison en cours"
            >
              Saison en cours
            </button>
            <button
              className={`bouton segment${!surLaSaison ? ' actif' : ''}`}
              onClick={() => setSurLaSaison(false)}
              title="Compter toutes les séances enregistrées, saisons précédentes comprises"
            >
              Tout l'historique
            </button>
          </div>
        </div>
      </div>

      {bilan.nombreSeances === 0 ? (
        <div className="vide">
          <p>
            Aucune séance sur cette période. Le bilan se remplit tout seul à mesure que vous
            préparez vos séances.
          </p>
        </div>
      ) : (
        <>
          <ul className="chiffres-cles">
            <li>
              <strong>{bilan.nombreSeances}</strong>
              <span>séance{bilan.nombreSeances > 1 ? 's' : ''}</span>
            </li>
            <li>
              <strong>{Math.round(bilan.minutes / 60)} h</strong>
              <span>de travail</span>
            </li>
            <li>
              <strong>{bilan.nombreExercices}</strong>
              <span>exercices menés</span>
            </li>
            <li>
              <strong>{Math.round(bilan.moyenneMinutesParSeance)} min</strong>
              <span>par séance en moyenne</span>
            </li>
            <li>
              <strong>{bilan.seancesAvecGardiens}</strong>
              <span>avec travail gardiens</span>
            </li>
          </ul>

          <section className="carte">
            <h2>Répartition du temps</h2>
            <div className="barre-repartition grande">
              {bilan.repartition
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
            <ul className="tableau-categories">
              {bilan.repartition.map((p) => (
                <li key={p.categorie}>
                  <i className={`pastille-categorie part-${p.categorie}`} />
                  <span className="nom-categorie">{LIBELLES_CATEGORIE[p.categorie]}</span>
                  <span className="minutes-categorie">{p.minutes} min</span>
                  <span className="part-categorie">{pourcentage(p, bilan.minutes)} %</span>
                  <span className="nombre-categorie">
                    {p.nombre} exercice{p.nombre > 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ul>
            {bilan.categoriesAbsentes.length > 0 && (
              <p className="categories-absentes">
                <strong>Jamais abordé sur la période :</strong>{' '}
                {bilan.categoriesAbsentes.map((c) => LIBELLES_CATEGORIE[c]).join(', ')}.
              </p>
            )}
          </section>

          <section className="carte">
            <h2>Rythme</h2>
            <ol className="histogramme">
              {bilan.parMois.map((mois) => (
                <li key={mois.cle}>
                  <span
                    className="colonne-mois"
                    style={{ height: `${Math.round((mois.minutes / maximumMois) * 100)}%` }}
                    title={`${mois.minutes} min`}
                  />
                  <span className="valeur-mois">{Math.round(mois.minutes / 60)} h</span>
                  <span className="libelle-mois">{mois.libelle}</span>
                  <span className="seances-mois">
                    {mois.seances} séance{mois.seances > 1 ? 's' : ''}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section className="carte">
            <h2>Exercices les plus programmés</h2>
            <table className="tableau-usage">
              <thead>
                <tr>
                  <th>Exercice</th>
                  <th>Catégorie</th>
                  <th>Séances</th>
                  <th>Temps</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {bilan.lesPlusUtilises.map((usage) => (
                  <tr key={usage.titre}>
                    <td>{usage.titre}</td>
                    <td className="discret">{LIBELLES_CATEGORIE[usage.categorie]}</td>
                    <td>{usage.seances}</td>
                    <td className="discret">{usage.minutes} min</td>
                    <td>
                      {usage.note === undefined ? (
                        <span className="non-evalue">Non évalué</span>
                      ) : (
                        <NoteEtoiles
                          note={Math.round(usage.note) as 1 | 2 | 3 | 4 | 5}
                          lectureSeule
                          taille="compacte"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {bilan.aRevoir.length > 0 && (
            <section className="carte carte-alerte">
              <h2>À revoir</h2>
              <p className="chapeau-carte">
                Ces exercices sont programmés malgré une note basse. Les retoucher, ou les
                remplacer.
              </p>
              <ul className="liste-a-revoir">
                {bilan.aRevoir.map((usage) => (
                  <li key={usage.titre}>
                    <NoteEtoiles
                      note={Math.round(usage.note ?? 1) as 1 | 2}
                      lectureSeule
                      taille="compacte"
                    />
                    <span className="nom-a-revoir">{usage.titre}</span>
                    <span className="discret">
                      {usage.seances} séance{usage.seances > 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}
