/**
 * Mode terrain : la seance telle qu'on la mene, pas telle qu'on la prepare.
 *
 * Ce qui differencie cette vue de l'ecran d'edition n'est pas la taille des
 * caracteres, c'est le contexte : l'entraineur tient une tablette a bout de
 * bras, il a du bruit autour, les mains froides, et besoin de trois choses
 * seulement - quel exercice maintenant, combien de temps il reste, et cocher
 * que c'est fait.
 *
 * Deux partis pris.
 *
 * L'horaire est ancre sur l'heure REELLE de debut. Un compte a rebours qui
 * repart a zero a chaque exercice affiche toujours quinze minutes disponibles,
 * meme quand la seance a vingt minutes de retard : il ment au moment ou son
 * information servirait le plus. Ici le retard s'accumule et se voit.
 *
 * Le releve du terrain ne modifie JAMAIS le plan. La case cochee et le temps
 * reellement passe sont ecrits a COTE de la duree prevue, pas a sa place.
 * C'est la comparaison des deux qui apprend quelque chose pour la fois
 * suivante.
 */

import { useEffect, useRef, useState } from 'react'
import { Terrain } from '../terrain/Terrain'
import { LIBELLES_CATEGORIE, type Exercice, type Seance } from '../domain/types'
import {
  derive,
  dureeMesuree,
  finPrevue,
  heure,
  minutesRestantes,
  phraseDerive,
  phraseReste,
  planifier,
} from '../domain/deroulement'

interface Props {
  seance: Seance
  onModifier: (transformation: (seance: Seance) => Seance) => void
  onFermer: () => void
}

/**
 * Rythme du rafraichissement de l'horloge.
 *
 * Dix secondes plutot qu'une : l'affichage est a la minute, une horloge qui
 * bat a la seconde ne changerait rien a l'ecran et reveillerait la tablette
 * six fois plus souvent pour rien.
 */
const BATTEMENT_MS = 10_000

export function ModeTerrain({ seance, onModifier, onFermer }: Props) {
  const [index, setIndex] = useState(0)
  const [maintenant, setMaintenant] = useState(() => Date.now())

  /**
   * Instant ou l'exercice affiche a ete mis a l'ecran, pour mesurer le temps
   * reellement passe dessus. Une reference et non un etat : cette mesure ne
   * doit provoquer aucun rendu.
   */
  const afficheDepuis = useRef(Date.now())

  const exercices = seance.exercices
  const exercice: Exercice | undefined = exercices[index]

  /*
    L'heure de debut est enregistree DANS la seance, pas dans cet ecran : si
    l'entraineur ferme l'application au milieu de la seance - tablette
    verrouillee, navigateur recharge - il doit retrouver son horaire, et non un
    chronometre qui repart de zero en effacant le retard deja pris.
  */
  useEffect(() => {
    if (seance.demarreLe) return
    const debut = new Date().toISOString()
    onModifier((s) => ({ ...s, demarreLe: debut }))
  }, [seance.demarreLe, onModifier])

  useEffect(() => {
    const battement = setInterval(() => setMaintenant(Date.now()), BATTEMENT_MS)
    return () => clearInterval(battement)
  }, [])

  useEffect(() => {
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onFermer()
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, exercices.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0))
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  }, [onFermer, exercices.length])

  const debut = seance.demarreLe ? new Date(seance.demarreLe).getTime() : maintenant
  const creneaux = planifier(exercices, debut)
  const creneau = creneaux[index]
  const reste = minutesRestantes(creneau, maintenant)
  const ecart = derive(creneau, maintenant)

  /**
   * Ecrit le temps passe sur l'exercice qu'on quitte, puis affiche l'autre.
   *
   * La mesure est prise au changement plutot qu'a la fermeture : un entraineur
   * qui ferme brutalement l'application ne perd que le dernier exercice.
   */
  const allerA = (suivant: number) => {
    if (suivant === index || !exercices[suivant]) return
    const passees = dureeMesuree(afficheDepuis.current, Date.now())
    const quitte = exercices[index]
    if (passees && quitte) {
      onModifier((s) => ({
        ...s,
        exercices: s.exercices.map((e) =>
          e.id === quitte.id
            ? { ...e, deroule: { fait: e.deroule?.fait === true, dureeReelle: passees } }
            : e,
        ),
      }))
    }
    afficheDepuis.current = Date.now()
    setIndex(suivant)
  }

  const basculerFait = () => {
    if (!exercice) return
    onModifier((s) => ({
      ...s,
      exercices: s.exercices.map((e) =>
        e.id === exercice.id
          ? { ...e, deroule: { ...e.deroule, fait: !(e.deroule?.fait === true) } }
          : e,
      ),
    }))
  }

  if (!exercice) {
    return (
      <div className="mode-terrain vide">
        <p>Cette séance ne contient aucun exercice.</p>
        <button
          className="bouton principal geant"
          onClick={onFermer}
          title="Quitter le mode terrain et revenir à la préparation"
        >
          Revenir à la séance
        </button>
      </div>
    )
  }

  const fait = exercice.deroule?.fait === true
  const menes = exercices.filter((e) => e.deroule?.fait).length
  const etape = exercice.schema.etapes[0]

  return (
    <div className="mode-terrain">
      <header className="terrain-entete">
        <button className="bouton discret geant" onClick={onFermer} title="Quitter le mode terrain">
          ✕
        </button>
        <div className="terrain-horaire">
          <strong className={reste < 0 ? 'en-retard' : undefined}>{phraseReste(reste)}</strong>
          <span>
            Fin prévue {heure(finPrevue(creneaux, debut))} · {phraseDerive(ecart)}
          </span>
        </div>
        <div className="terrain-position">
          <strong>
            {index + 1} / {exercices.length}
          </strong>
          <span>{menes} mené{menes > 1 ? 's' : ''} sur {exercices.length}</span>
        </div>
      </header>

      <div className="terrain-corps">
        <div className="terrain-schema">
          <Terrain schema={exercice.schema} etape={etape} etapeIndex={0} interactif={false} />
        </div>

        <div className="terrain-texte">
          <h1>{exercice.titre || 'Sans titre'}</h1>
          <p className="terrain-meta">
            {LIBELLES_CATEGORIE[exercice.categorie]} · {exercice.duree} min prévues
            {exercice.deroule?.dureeReelle ? ` · ${exercice.deroule.dureeReelle} min passées` : ''}
          </p>
          {exercice.objectifs && <p className="terrain-objectif">{exercice.objectifs}</p>}
          {exercice.misePlace && (
            <section>
              <h2>Mise en place</h2>
              {exercice.misePlace
                .split('\n')
                .filter(Boolean)
                .map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
            </section>
          )}
          {exercice.fonctionnement && (
            <section>
              <h2>Déroulement</h2>
              {exercice.fonctionnement
                .split('\n')
                .filter(Boolean)
                .map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
            </section>
          )}
          {exercice.pointsCles && (
            <section>
              <h2>Points clés</h2>
              <ul>
                {exercice.pointsCles
                  .split('\n')
                  .filter(Boolean)
                  .map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
              </ul>
            </section>
          )}
          {exercice.materiel.length > 0 && (
            <p className="terrain-materiel">
              <strong>Matériel :</strong> {exercice.materiel.join(', ')}
            </p>
          )}
        </div>
      </div>

      <footer className="terrain-pied">
        <button
          className="bouton geant"
          onClick={() => allerA(index - 1)}
          disabled={index === 0}
          title="Exercice précédent"
        >
          ← Précédent
        </button>
        <button
          className={`bouton geant marquer-mene${fait ? ' actif' : ''}`}
          aria-pressed={fait}
          onClick={basculerFait}
          title="Cocher l’exercice une fois mené : le temps réellement passé est relevé"
        >
          {fait ? '☑ Mené' : '☐ Marquer mené'}
        </button>
        <button
          className="bouton principal geant"
          onClick={() => allerA(index + 1)}
          disabled={index === exercices.length - 1}
          title="Exercice suivant"
        >
          Suivant →
        </button>
      </footer>
    </div>
  )
}
