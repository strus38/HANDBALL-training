/**
 * Le tableau de bord du club, dans l'application : le prochain match, les chances de
 * qualification, le classement, le reperage de l'adversaire et les axes de travail.
 *
 * C'est, avec la seance de la semaine, la seule partie de l'application qui passe par internet :
 * le resume est telecharge a l'ouverture de cet ecran, puis garde sur ce poste pour etre relu
 * sans reseau. Il ne nomme aucun joueur ; la planification des matchs, la convocation et les
 * fiches des joueurs restent dans le tableau de bord complet, que le bouton ouvre (il demande
 * la phrase secrete du club, une fois par ordinateur).
 */

import { useEffect, useState } from 'react'
import { CLUB, type TableauDeBordClub } from '../club'
import {
  ErreurResume,
  initialesEquipe,
  lireResume,
  libelleObjectif,
  manche,
  nomCourtEquipe,
  ordinal,
  type MatchResume,
  type ResumeTableau,
} from '../domain/resumeTableau'
import { ErreurReseau, telechargerTexte } from '../platform/reseau'

const CLEF_COPIE = `${CLUB.identifiant}:tableau-de-bord:resume`

interface Props {
  tableau: TableauDeBordClub
  recuperation: boolean
  onCreerSeance: () => void
}

function dateCourte(iso: string | null, provisoire?: boolean): string {
  if (!iso) return 'date à confirmer'
  const d = new Date(iso.length <= 10 ? `${iso}T12:00` : iso)
  if (Number.isNaN(d.getTime())) return iso
  const jour = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  if (provisoire) return `week-end du ${jour} (à confirmer)`
  return iso.length > 10 ? `${jour} à ${iso.slice(11, 16).replace(':', 'h')}` : jour
}

const signe = (n: number | null | undefined) => (n == null ? '–' : `${n > 0 ? '+' : ''}${n}`)
const virgule = (n: number | null | undefined) => (n == null ? '–' : String(n).replace('.', ','))

function Forme({ forme }: { forme: string[] }) {
  return (
    <span className="forme-equipe" aria-label={`Forme : ${forme.join(' ')}`}>
      {forme.map((r, i) => (
        <i key={i} className={`resultat-${r}`}>
          {r}
        </i>
      ))}
    </span>
  )
}

/** Le logo de l'equipe, venu dans le resume ; a defaut, ses initiales. */
function Logo({ logos, equipe, grand }: { logos: Record<string, string>; equipe: string; grand?: boolean }) {
  const image = logos[equipe]
  return (
    <span className={grand ? 'logo-equipe grand' : 'logo-equipe'} aria-hidden="true">
      {image ? <img src={image} alt="" /> : initialesEquipe(equipe)}
    </span>
  )
}

export function TableauDeBord({ tableau, recuperation, onCreerSeance }: Props) {
  const [resume, setResume] = useState<ResumeTableau | undefined>()
  const [etat, setEtat] = useState<string>('Chargement du tableau de bord…')

  useEffect(() => {
    let actif = true
    const copie = () => {
      try {
        const texte = localStorage.getItem(CLEF_COPIE)
        return texte ? lireResume(texte) : undefined
      } catch {
        return undefined
      }
    }
    if (!tableau.resume) {
      setEtat("Ce club n'a pas encore publié de résumé.")
      return
    }
    telechargerTexte(tableau.resume)
      .then((texte) => {
        const lu = lireResume(texte)
        try {
          localStorage.setItem(CLEF_COPIE, texte)
        } catch {
          // stockage refusé : l'écran marche, sans copie hors connexion
        }
        if (actif) {
          setResume(lu)
          setEtat('')
        }
      })
      .catch((erreur) => {
        if (!actif) return
        const garde = copie()
        const pourquoi = erreur instanceof ErreurReseau || erreur instanceof ErreurResume ? erreur.message : 'Tableau de bord injoignable.'
        setResume(garde)
        setEtat(garde ? `${pourquoi} Voici la dernière copie reçue sur cet ordinateur.` : pourquoi)
      })
    return () => {
      actif = false
    }
  }, [tableau.resume])

  const r = resume
  const prochain = r?.prochain
  const adv = r?.adversaire
  const obj = r?.objectif
  const poule = obj?.poule && r?.poules[obj.poule] ? obj.poule : Object.keys(r?.poules ?? {})[0]
  const classement = (poule && r?.poules[poule]) || []
  const maxRang = Math.max(1, ...(obj?.rangs ?? [1]))
  const face = (equipe: string) =>
    r && (
      <span className="equipe-face">
        <Logo logos={r.logos} equipe={equipe} grand />
        <span>{equipe === r.club ? r.club_court : nomCourtEquipe(equipe)}</span>
      </span>
    )

  return (
    <div className="panneau-principal tableau-club">
      <div className="entete-tableau">
        <div>
          <h2>{tableau.nom}</h2>
          <p className="resume-global">
            {r ? `Données du ${new Date(r.genere.replace(' ', 'T')).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}` : ' '}
            {r && r.feuilles > 0 && ` · ${r.feuilles} feuille${r.feuilles > 1 ? 's' : ''} de match du club lue${r.feuilles > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="pousse">
          <button
            className="bouton"
            onClick={onCreerSeance}
            disabled={recuperation}
            title="Ajouter à vos séances celle que le tableau de bord prépare pour le prochain entraînement"
          >
            {recuperation ? 'Récupération…' : 'Créer la séance de la semaine'}
          </button>
          {tableau.page && (
            <a
              className="bouton principal"
              href={tableau.page}
              target="_blank"
              rel="noopener noreferrer"
              title="Planification des matchs, convocation et fiches des joueurs, en mode entraîneur : vous seul pouvez y modifier la feuille. La phrase secrète du club est demandée une fois par ordinateur"
            >
              Ouvrir le tableau de bord complet ↗
            </a>
          )}
        </div>
      </div>

      {etat && <p className={r ? 'bandeau-tableau' : 'attente'}>{etat}</p>}

      {r && prochain && (
        <section className="carte carte-match">
          <p className="chapeau-carte">
            Prochain match · {manche(prochain)} · {dateCourte(prochain.date, prochain.provisoire)} ·{' '}
            {prochain.domicile ? 'à domicile' : "à l'extérieur"}
            {prochain.salle?.nom ? ` · ${prochain.salle.nom}${prochain.salle.ville ? `, ${prochain.salle.ville}` : ''}` : ''}
            {prochain.cle && (
              <>
                {' '}
                <span className="match-cle">Match clé</span>
              </>
            )}
          </p>
          <h2 className="face-a-face" title={prochain.adversaire}>
            {face(prochain.domicile ? r.club : prochain.adversaire)}
            <span className="contre">contre</span>
            {face(prochain.domicile ? prochain.adversaire : r.club)}
          </h2>
          <ul className="chiffres-cles">
            <li>
              <strong>{ordinal(prochain.rang_adv)}</strong>
              <span>rang de l'adversaire</span>
            </li>
            <li>
              <strong>{prochain.p_victoire != null ? `${prochain.p_victoire} %` : '–'}</strong>
              <span>victoire estimée, équipe au complet</span>
            </li>
            <li>
              <strong>{prochain.coupe ? '–' : signe(prochain.enjeu)}</strong>
              <span>{prochain.coupe ? 'match de coupe : hors classement' : `points de chance de ${libelleObjectif(obj?.cible)} en jeu`}</span>
            </li>
            {adv?.passe && adv.passe.face_a_face.length > 0 && (
              <li>
                <strong>
                  {adv.passe.face_a_face
                    .map((f) => (f.res === 'V' ? 'D' : f.res === 'D' ? 'V' : 'N'))
                    .join(' ')}
                </strong>
                <span>contre eux en {adv.passe.saison}</span>
              </li>
            )}
          </ul>
        </section>
      )}

      {r && obj && obj.statut === 'en_cours' && (
        <section className="carte">
          <h2>
            Objectif : {libelleObjectif(obj.cible)} — {obj.proba != null ? `${obj.proba} % de chances` : '–'}
          </h2>
          {obj.rangs && (
            <ol className="rangs-finaux" aria-label="Chances de chaque rang final">
              {obj.rangs.map((v, i) => (
                <li key={i} className={i < obj.cible ? 'objectif' : undefined}>
                  <span className="valeur-rang">{Math.round(v)} %</span>
                  <span className="colonne-rang" style={{ height: `${Math.max(2, Math.round((v / maxRang) * 100))}%` }} />
                  <span className="libelle-rang">{ordinal(i + 1)}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="note-tableau">
            Rang final de la première phase sur 10 000 saisons simulées ({obj.restants} matchs restants). Deux montées par
            secteur, au terme d'une deuxième phase dont la formule n'est pas encore publiée.
          </p>
        </section>
      )}

      {r && classement.length > 0 && (
        <section className="carte">
          <h2>Classement · poule {poule}</h2>
          <table className="tableau-usage tableau-classement">
            <thead>
              <tr>
                <th>#</th>
                <th>Équipe</th>
                <th>Pts</th>
                <th>J</th>
                <th>V</th>
                <th>N</th>
                <th>D</th>
                <th>Diff</th>
                <th>Forme</th>
              </tr>
            </thead>
            <tbody>
              {classement.map((l) => (
                <tr
                  key={l.equipe}
                  className={l.equipe === r.club ? 'notre-equipe' : l.forfait ? 'forfait' : undefined}
                  title={l.forfait ? 'Forfait général : ses matchs ne comptent pas cette saison' : undefined}
                >
                  <td>{l.rang ?? '–'}</td>
                  <td>
                    <span className="equipe-ligne">
                      <Logo logos={r.logos} equipe={l.equipe} />
                      {l.equipe}
                      {l.forfait && <span className="etiquette-forfait">forfait</span>}
                    </span>
                  </td>
                  <td>
                    <strong>{l.pts}</strong>
                  </td>
                  <td>{l.j}</td>
                  <td>{l.v}</td>
                  <td>{l.n}</td>
                  <td>{l.d}</td>
                  <td>{signe(l.diff)}</td>
                  <td>
                    <Forme forme={l.forme ?? []} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {r && adv && (
        <section className="carte">
          <h2 className="equipe-ligne" title={adv.equipe}>
            <Logo logos={r.logos} equipe={adv.equipe} />
            Repérage · {nomCourtEquipe(adv.equipe)}
          </h2>
          <ul className="chiffres-cles">
            <li>
              <strong>{virgule(adv.bp_moy)}</strong>
              <span>buts marqués par match</span>
            </li>
            <li>
              <strong>{virgule(adv.bc_moy)}</strong>
              <span>buts encaissés par match</span>
            </li>
            <li>
              <strong>{adv.arrets_pct != null ? `${adv.arrets_pct} %` : '–'}</strong>
              <span>arrêts de leurs gardiens</span>
            </li>
            <li>
              <strong>{virgule(adv.deux_min_moy)}</strong>
              <span>exclusions de 2 min par match</span>
            </li>
            <li>
              <strong>{virgule(adv.jaunes_moy)}</strong>
              <span>cartons jaunes par match</span>
            </li>
          </ul>
          {adv.buteurs.length > 0 && (
            <p>
              <strong>À surveiller :</strong>{' '}
              {adv.buteurs
                .map((b) => `n° ${b.num ?? '?'}, ${b.buts} buts en ${b.m} match${b.m > 1 ? 's' : ''}${b.reussite != null ? ` (${b.reussite} % au tir)` : ''}`)
                .join(' ; ')}
              .
            </p>
          )}
          {(adv.niveau ?? 0) > 0 && (
            <p className="bandeau-tableau">
              Joue cette saison une division au-dessus de la nôtre{adv.poule_libelle ? ` (${adv.poule_libelle})` : ''} : niveau
              potentiellement supérieur, compté dans la victoire estimée.
            </p>
          )}
          {((adv.passe?.niveau ?? 0) > 0 || adv.dessus) && (
            <p className="bandeau-tableau">
              La saison passée, en {(adv.dessus ?? adv.passe)?.division ?? 'division au-dessus'} :{' '}
              {(adv.dessus ?? adv.passe)?.rangs.map((x) => `${ordinal(x.rang)} sur ${x.equipes}`).join(', ')}
              {(adv.dessus ?? adv.passe)?.continuite
                ? ` ; ${(adv.dessus ?? adv.passe)?.continuite?.deja} de leurs ${(adv.dessus ?? adv.passe)?.continuite?.sur} joueurs de cette saison y jouaient`
                : ''}
              . Niveau potentiellement supérieur au nôtre.
            </p>
          )}
          {adv.passe && (
            <p className="note-tableau">
              {adv.passe.saison}
              {(adv.passe.niveau ?? 0) > 0 ? ` (${adv.passe.division ?? 'division au-dessus'})` : ''} : {adv.passe.v}-{adv.passe.n}-{adv.passe.d},{' '}
              {adv.passe.rangs.map((x) => `${ordinal(x.rang)} de la poule ${x.poule}`).join(', ')}
              {adv.passe.continuite
                ? ` ; ${adv.passe.continuite.deja} de leurs ${adv.passe.continuite.sur} joueurs de cette saison étaient déjà là.`
                : '.'}
            </p>
          )}
        </section>
      )}

      {r && obj && obj.matchs.length > 1 && (
        <section className="carte">
          <h2>Les matchs suivants</h2>
          <table className="tableau-usage">
            <thead>
              <tr>
                <th>Journée</th>
                <th>Adversaire</th>
                <th>Date</th>
                <th>Victoire estimée</th>
                <th>Enjeu</th>
              </tr>
            </thead>
            <tbody>
              {obj.matchs.slice(1, 7).map((m: MatchResume) => (
                <tr key={`${m.journee}-${m.adversaire}`}>
                  <td title={manche(m)}>{manche(m, true)}</td>
                  <td title={m.adversaire}>
                    <span className="equipe-ligne">
                      <Logo logos={r.logos} equipe={m.adversaire} />
                      <span>
                        {nomCourtEquipe(m.adversaire)} {m.domicile ? '(dom.)' : '(ext.)'}{' '}
                        {m.cle && <span className="match-cle">Match clé</span>}
                      </span>
                    </span>
                  </td>
                  <td>{dateCourte(m.date, m.provisoire)}</td>
                  <td>{m.p_victoire != null ? `${m.p_victoire} %` : '–'}</td>
                  <td>{signe(m.enjeu)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {r && (
        <section className="carte">
          <h2>À travailler à l'entraînement</h2>
          {r.axes.length ? (
            <ul className="axes-tableau">
              {r.axes.map((a) => (
                <li key={a.titre}>
                  <strong>{a.titre}</strong> <span className="etiquette-axe">{a.libelle}</span>
                  <br />
                  <span className="note-tableau">{a.constat}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="note-tableau">
              Pas encore d'écart marqué par rapport aux autres équipes : les axes apparaîtront après quelques matchs.
            </p>
          )}
        </section>
      )}
    </div>
  )
}
