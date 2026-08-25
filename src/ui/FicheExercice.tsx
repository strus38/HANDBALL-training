/**
 * Fiche d'un exercice : le schema de terrain a gauche, le detail a droite.
 *
 * Le schema passe par un historique annuler / retablir local, remis a zero a
 * chaque changement d'exercice (le composant est monte avec la cle de
 * l'exercice). Chaque etat valide est immediatement remonte pour etre
 * enregistre.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Terrain,
  type Outil,
  type Selection,
  type TraceFleche,
  type TraceZone,
} from '../terrain/Terrain'
import { APPARENCES, positionInitiale } from '../terrain/jetons'
import { avancement, etapeMiseEnAvant, interpolerEtape } from '../terrain/animation'
import { nouvelId, nouvelleEtape } from '../domain/fabrique'
import {
  AIDES_FLECHE,
  LIBELLES_CATEGORIE,
  LIBELLES_ESPACE,
  LIBELLES_ESPACE_COURTS,
  LIBELLES_FLECHE,
  LIBELLES_FORMAT_GARDIENS_COURTS,
  LIBELLES_TEINTE,
  LIBELLES_VUE,
  manqueEffectif,
  manqueEspace,
  MAX_LONGUEUR_ANNOTATION,
  ORIENTATION_PAR_DEFAUT,
  type Annotation,
  type Categorie,
  type Espace,
  type Etape,
  type Exercice,
  type FormatGardiens,
  type Jeton,
  type Position,
  type Schema,
  type Seance,
  type TeinteZone,
  type TypeFleche,
  type TypeJeton,
  type VueTerrain,
  type Zone,
} from '../domain/types'
import {
  appliquerMouvement,
  orientationEffective,
  resoudreFleches,
  retirerFleche,
} from '../domain/mouvement'
import { schemaEnPng } from '../terrain/exportImage'
import { nomDeFichierSur } from '../platform/fichiers'
import { refleterSchema } from '../domain/symetrie'
import { proposerMouvements, type EtapeProposee } from '../domain/analyseTexte'
import { PropositionMouvements } from './PropositionMouvements'
import { EtiquetteAvecDictee } from './Dictee'
import { CollerDictee } from './CollerDictee'
import {
  ajouterFragment,
  ajouterFragmentEnLigne,
  type ChampDicte,
  type TexteReparti,
} from '../domain/dictee'
import { redactionPossible, redigerConsigne, redigerDeroulement } from '../domain/redaction'
import { useConfirmation } from './Dialogue'
import { useHistorique } from './useHistorique'
import { NoteEtoiles } from './NoteEtoiles'
import { MenuActions, SelecteurJeton } from './MenusFiche'
import { AlerteMoyens } from './AlerteMoyens'
import { Separateur, useSeparation } from './Separateur'

interface Props {
  exercice: Exercice
  seance: Seance
  onModifier: (modifications: Partial<Exercice>) => void
  onRetour: () => void
  onEnregistrerDansBibliotheque: () => void
  onImprimer: () => void
}

const OUTILS_FLECHE: TypeFleche[] = ['course', 'passe', 'dribble', 'tir', 'ecran', 'rotation']

/** Libelles abreges des vues : le libelle complet reste en infobulle. */
const LIBELLES_VUE_COURTS: Record<VueTerrain, string> = {
  demi: 'Demi',
  complet: 'Complet',
  zone: 'Zone',
}

export function FicheExercice({
  exercice,
  seance,
  onModifier,
  onRetour,
  onEnregistrerDansBibliotheque,
  onImprimer,
}: Props) {
  const [selection, setSelection] = useState<Selection | undefined>()
  const [outil, setOutil] = useState<Outil>('selection')
  const [etapeIndex, setEtapeIndex] = useState(0)
  /**
   * Etat de la lecture.
   *
   * temps est la position dans l animation, en millisecondes ; debut est
   * l instant ou cette position valait zero. Mettre en pause revient donc a
   * arreter la boucle en gardant temps, et reprendre a recaler debut derriere
   * lui : aucune position n est perdue au passage.
   */
  const [lecture, setLecture] = useState<
    { debut: number; temps: number; pause: boolean } | undefined
  >()
  const [aimantation, setAimantation] = useState(true)
  const cadre = useRef<HTMLDivElement>(null)
  const [propositions, setPropositions] = useState<EtapeProposee[] | undefined>()
  const [collageOuvert, setCollageOuvert] = useState(false)
  const confirmer = useConfirmation()
  const separation = useSeparation('fiche', 0.54)
  /**
   * Colonne occupant toute la largeur, le cas echeant. Volontairement non
   * memorise : c'est un mode de travail du moment (tracer, ou rediger), pas
   * une preference d'affichage comme la position du separateur.
   */
  const [plein, setPlein] = useState<'terrain' | 'detail' | undefined>()
  /**
   * Fiche signaletique repliee ou non.
   *
   * Ces six valeurs se reglent a la creation de l'exercice et se consultent
   * ensuite : repliees, elles rendent plus de deux cents pixels a la zone de
   * redaction, qui est le vrai espace de travail. Le choix est memorise, comme
   * la position du separateur.
   */
  const [signaletiqueRepliee, setSignaletiqueRepliee] = useState(
    () => localStorage.getItem('hbpsm:signaletique') === 'repliee',
  )
  const basculerSignaletique = () => {
    setSignaletiqueRepliee((replie) => {
      const suivant = !replie
      try {
        localStorage.setItem('hbpsm:signaletique', suivant ? 'repliee' : 'ouverte')
      } catch {
        // Stockage refuse : le repli reste valable pour la session.
      }
      return suivant
    })
  }
  const basculer = (zone: 'terrain' | 'detail') =>
    setPlein((actuel) => (actuel === zone ? undefined : zone))

  const enregistrerSchema = useCallback((schema: Schema) => onModifier({ schema }), [onModifier])
  const historique = useHistorique<Schema>(exercice.schema, enregistrerSchema)
  const schema = historique.present

  const index = Math.min(etapeIndex, schema.etapes.length - 1)
  const etape = schema.etapes[index]
  const etapePrecedente = index > 0 ? schema.etapes[index - 1] : undefined

  const modifierSchema = (transformation: (schema: Schema) => Schema) =>
    historique.pousser(transformation)

  const modifierEtape = (transformation: (etape: Etape) => Etape) =>
    modifierSchema((s) => ({
      ...s,
      etapes: s.etapes.map((e, i) => (i === index ? transformation(e) : e)),
    }))

  // ------------------------------------------------------------- Lecture

  const image = useRef<number>()
  useEffect(() => {
    if (!lecture || lecture.pause) return
    const boucle = () => {
      const temps = performance.now() - lecture.debut
      const etat = avancement(temps, schema.etapes.length)
      if (etat.termine) {
        setLecture(undefined)
        setEtapeIndex(schema.etapes.length - 1)
        return
      }
      setLecture((precedent) => (precedent ? { ...precedent, temps } : undefined))
      image.current = requestAnimationFrame(boucle)
    }
    image.current = requestAnimationFrame(boucle)
    return () => {
      if (image.current) cancelAnimationFrame(image.current)
    }
    // La boucle ne depend que du demarrage : relancer a chaque image la couperait.
  }, [lecture?.debut, lecture?.pause, schema.etapes.length])

  /**
   * Lire, mettre en pause, reprendre.
   *
   * Reprendre recale debut derriere le temps deja ecoule. Sans ce recalage,
   * l'animation sauterait d'un coup a l'endroit ou elle serait si l'on ne
   * s'etait jamais arrete : la pause ferait perdre le passage qu'on voulait
   * justement regarder.
   */
  const basculerLecture = () =>
    setLecture((p) => {
      if (!p) return { debut: performance.now(), temps: 0, pause: false }
      if (p.pause) return { ...p, debut: performance.now() - p.temps, pause: false }
      return { ...p, pause: true }
    })

  const etatLecture =
    lecture && schema.etapes.length >= 2 ? avancement(lecture.temps, schema.etapes.length) : undefined

  const etapeAffichee: Etape = etatLecture
    ? interpolerEtape(
        schema.etapes[etatLecture.index],
        schema.etapes[Math.min(etatLecture.index + 1, schema.etapes.length - 1)],
        etatLecture.progression,
      )
    : etape

  /**
   * Schema tel qu'il doit etre AFFICHE.
   *
   * Le terrain ne se contente pas des positions : il en deduit les orientations
   * et resout les fleches, en lisant le schema a l'etape indiquee. Pendant la
   * lecture, lui passer le schema d'origine gelait donc les fleches et les
   * orientations sur l'etape selectionnee — les joueurs glissaient sans jamais
   * pivoter. On lui donne un schema dont l'etape courante EST l'etape
   * interpolee : tout le reste en decoule.
   */
  const indexAffiche = etatLecture ? etatLecture.index : index
  const schemaAffiche: Schema = etatLecture
    ? {
        ...schema,
        etapes: schema.etapes.map((e, i) => (i === indexAffiche ? etapeAffichee : e)),
      }
    : schema

  /**
   * Puce a mettre en jaune. Pendant la lecture elle suit l animation ; sinon
   * elle marque l etape en cours d edition.
   */
  const puceActive = etatLecture
    ? etapeMiseEnAvant(etatLecture, schema.etapes.length)
    : index

  // -------------------------------------------------------------- Jetons

  const ajouterJeton = (type: TypeJeton) => {
    const id = nouvelId()
    modifierSchema((s) => {
      const memeType = s.jetons.filter((j) => j.type === type).length
      const etiquette =
        type === 'attaquant' || type === 'defenseur'
          ? String(memeType + 1)
          : APPARENCES[type].etiquetteParDefaut
      const jeton: Jeton = { id, type, etiquette, orientation: ORIENTATION_PAR_DEFAUT[type] ?? 0 }
      const depart = positionInitiale(s.vue, s.jetons.length)
      // La position ne porte PAS d'orientation : la renseigner signifie « choix
      // manuel de l'entraineur » et desactive la deduction. Un jeton fraichement
      // pose naissait donc fige, et l'orientation automatique ne servait plus a
      // rien sur les fiches construites dans l'application.
      const position: Position = { ...depart }
      return {
        ...s,
        jetons: [...s.jetons, jeton],
        // Un jeton ajoute existe des la premiere etape : sinon il apparaitrait
        // au milieu de l'exercice sans explication.
        etapes: s.etapes.map((e) => ({ ...e, positions: { ...e.positions, [id]: position } })),
      }
    })
    setSelection({ type: 'jeton', id })
  }

  const supprimerJeton = (id: string) => {
    modifierSchema((s) => ({
      ...s,
      jetons: s.jetons.filter((j) => j.id !== id),
      etapes: s.etapes.map((e) => {
        const positions = { ...e.positions }
        delete positions[id]
        return { ...e, positions, fleches: e.fleches.filter((f) => f.jetonId !== id) }
      }),
    }))
    setSelection(undefined)
  }

  /** Deplacement ou rotation : ne touche que l'etape affichee. */
  const deplacerJeton = (id: string, position: Position) =>
    modifierEtape((e) => ({ ...e, positions: { ...e.positions, [id]: position } }))

  const modifierJeton = (id: string, modifications: Partial<Jeton>) =>
    modifierSchema((s) => ({
      ...s,
      jetons: s.jetons.map((j) => (j.id === id ? { ...j, ...modifications } : j)),
    }))

  /**
   * Fixer l'orientation a la main desactive la deduction pour ce jeton, a cette
   * etape : l'entraineur reprend la main, l'application ne la lui repren pas.
   */
  const orienterJeton = (id: string, orientation: number) =>
    modifierEtape((e) => ({
      ...e,
      positions: { ...e.positions, [id]: { ...e.positions[id], orientation } },
    }))

  const libererOrientation = (id: string) =>
    modifierEtape((e) => {
      const position = { ...e.positions[id] }
      delete position.orientation
      return { ...e, positions: { ...e.positions, [id]: position } }
    })

  // ------------------------------------------------------------- Fleches

  /**
   * Un trace acheve devient un deplacement : le jeton concerne est place a
   * l'etape suivante, qui est creee si besoin, et le ballon suit son porteur.
   */
  const creerFleche = (trace: TraceFleche) => {
    modifierSchema((s) => appliquerMouvement(s, index, trace))
    setSelection(undefined)
    setOutil('selection')
    // On reste sur l'etape courante : une etape comporte souvent plusieurs
    // mouvements (un croise en compte deux), et la fleche qui vient d'etre
    // tracee y est deja visible.
  }

  const supprimerFleche = (id: string) => {
    modifierSchema((s) => retirerFleche(s, index, id))
    setSelection(undefined)
  }

  const courberFleche = (id: string, courbure: Position) =>
    modifierEtape((e) => ({
      ...e,
      fleches: e.fleches.map((f) => (f.id === id ? { ...f, courbure } : f)),
    }))

  // ------------------------------------------------- Zones et annotations
  //
  // Zones et annotations appartiennent au SCHEMA, pas a l'etape : ce sont des
  // elements de mise en place. Une zone de marque tracee a l'etape 1 sert
  // encore a l'etape 4, et personne n'a envie de la redessiner quatre fois.

  const creerZone = (trace: TraceZone) => {
    const id = nouvelId()
    modifierSchema((sc) => ({
      ...sc,
      zones: [...(sc.zones ?? []), { id, ...trace, teinte: 'jaune' as TeinteZone, libelle: '' }],
    }))
    setSelection({ type: 'zone', id })
    setOutil('selection')
  }

  const modifierZone = (id: string, modifications: Partial<Zone>) =>
    modifierSchema((sc) => ({
      ...sc,
      zones: (sc.zones ?? []).map((z) => (z.id === id ? { ...z, ...modifications } : z)),
    }))

  const supprimerZone = (id: string) => {
    modifierSchema((sc) => ({ ...sc, zones: (sc.zones ?? []).filter((z) => z.id !== id) }))
    setSelection(undefined)
  }

  const creerAnnotation = (point: Position) => {
    const id = nouvelId()
    modifierSchema((sc) => ({
      ...sc,
      // Un texte de depart plutot qu'une annotation vide : vide, elle serait
      // invisible sur le terrain et l'entraineur ne saurait pas qu'il vient
      // d'en poser une.
      annotations: [...(sc.annotations ?? []), { id, x: point.x, y: point.y, texte: 'Texte' }],
    }))
    setSelection({ type: 'annotation', id })
    setOutil('selection')
  }

  const modifierAnnotation = (id: string, modifications: Partial<Annotation>) =>
    modifierSchema((sc) => ({
      ...sc,
      annotations: (sc.annotations ?? []).map((a) => (a.id === id ? { ...a, ...modifications } : a)),
    }))

  const supprimerAnnotation = (id: string) => {
    modifierSchema((sc) => ({
      ...sc,
      annotations: (sc.annotations ?? []).filter((a) => a.id !== id),
    }))
    setSelection(undefined)
  }

  // -------------------------------------------------------------- Etapes

  const ajouterEtape = () => {
    modifierSchema((s) => {
      const modele = s.etapes[Math.min(index, s.etapes.length - 1)]
      // La nouvelle etape repart des positions de la precedente : on ne
      // deplace que ce qui bouge, au lieu de tout replacer.
      const suivante: Etape = {
        ...nouvelleEtape(`Etape ${s.etapes.length + 1}`),
        positions: JSON.parse(JSON.stringify(modele.positions)),
      }
      const etapes = [...s.etapes]
      etapes.splice(index + 1, 0, suivante)
      return { ...s, etapes }
    })
    setEtapeIndex(index + 1)
    setSelection(undefined)
  }

  const supprimerEtape = () => {
    if (schema.etapes.length <= 1) return
    modifierSchema((s) => ({ ...s, etapes: s.etapes.filter((_, i) => i !== index) }))
    setEtapeIndex(Math.max(0, index - 1))
    setSelection(undefined)
  }

  /** Enregistre le schema de l'etape affichee en image PNG. */
  const exporterImage = async () => {
    const svg = cadre.current?.querySelector('svg.terrain')
    if (!(svg instanceof SVGSVGElement)) return
    const blob = await schemaEnPng(svg)
    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nomDeFichierSur(
      `${exercice.titre || 'schema'}-etape-${index + 1}`,
      '.png',
    )
    document.body.appendChild(lien)
    lien.click()
    lien.remove()
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }

  /**
   * Applique les mouvements lus dans le deroulement.
   *
   * Chaque action devient une etape, appliquee par le meme moteur qu'un trace a
   * la main : le resultat est donc modifiable et annulable comme le reste.
   */
  const appliquerPropositions = () => {
    if (!propositions) return
    modifierSchema((s) => {
      let resultat = s
      propositions.forEach((etape, rang) => {
        for (const action of etape.actions) {
          if (!action.acteur) continue
          resultat = appliquerMouvement(resultat, index + rang, {
            type: action.type,
            jetonDepart: action.acteur,
            jetonArrivee: action.cible,
            arrivee: action.destination,
          })
        }
        const creee = resultat.etapes[index + rang + 1]
        if (creee) {
          creee.titre = `Etape ${index + rang + 2}`
          creee.consigne = etape.actions[0]?.phrase ?? ''
        }
      })
      return resultat
    })
    setPropositions(undefined)
    setSelection(undefined)
  }

  // ------------------------------------------------- Symetrie et redaction

  const appliquerSymetrie = () => {
    modifierSchema(refleterSchema)
    setSelection(undefined)
  }

  /**
   * Ecrit le deroulement a partir du schema.
   *
   * Le texte deja saisi n'est jamais ecrase sans accord : c'est du travail de
   * l'entraineur, la proposition automatique ne vaut pas mieux que lui.
   */
  const rediger = async () => {
    const texte = redigerDeroulement(schema)
    if (!texte) return
    if (exercice.fonctionnement.trim()) {
      const accepte = await confirmer({
        titre: 'Remplacer le déroulement ?',
        message: (
          <>
            Le déroulement rédigé à partir du schéma remplacera le texte actuel.
            <em className="dialogue-note">{premiereLigne(texte)}</em>
          </>
        ),
        libelleConfirmer: 'Remplacer',
      })
      if (!accepte) return
    }
    onModifier({ fonctionnement: texte })
    // Chaque etape recoit aussi sa consigne, si elle n'en avait pas.
    modifierSchema((s) => ({
      ...s,
      etapes: s.etapes.map((etape, i) =>
        etape.consigne.trim() ? etape : { ...etape, consigne: redigerConsigne(s, i) },
      ),
    }))
  }

  // ------------------------------------------------------------ Raccourcis

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      const cible = evenement.target as HTMLElement | null
      if (
        cible instanceof HTMLInputElement ||
        cible instanceof HTMLTextAreaElement ||
        cible instanceof HTMLSelectElement
      ) {
        return
      }
      const commande = evenement.ctrlKey || evenement.metaKey
      if (commande && evenement.key.toLowerCase() === 'z') {
        evenement.preventDefault()
        if (evenement.shiftKey) historique.retablir()
        else historique.annuler()
        return
      }
      if (commande && evenement.key.toLowerCase() === 'y') {
        evenement.preventDefault()
        historique.retablir()
        return
      }
      if ((evenement.key === 'Delete' || evenement.key === 'Backspace') && selection) {
        evenement.preventDefault()
        if (selection.type === 'jeton') supprimerJeton(selection.id)
        else if (selection.type === 'zone') supprimerZone(selection.id)
        else if (selection.type === 'annotation') supprimerAnnotation(selection.id)
        else supprimerFleche(selection.id)
        return
      }
      if (evenement.key === 'Escape') {
        // Echap deroule un cran a la fois : d'abord ce qui est selectionne,
        // ensuite seulement on quitte le plein ecran.
        if (selection) setSelection(undefined)
        else if (plein) setPlein(undefined)
        setOutil('selection')
      }
    }
    window.addEventListener('keydown', surTouche)
    return () => window.removeEventListener('keydown', surTouche)
  })

  /*
   * Rubriques de la fiche, dans l'ordre de la trame de l'entraineur :
   * forme d'intervention, mise en place, fonctionnement, regulation, evolution.
   * « Objectifs » et « Points cles » s'y ajoutent ; une rubrique laissee vide
   * ne s'imprime pas.
   */
  /**
   * Depose une phrase dictee dans un champ.
   *
   * Elle s AJOUTE au texte deja present, sur sa propre ligne. Remplacer
   * laisserait une phrase mal comprise effacer un paragraphe entier.
   */
  const dicter = (cle: ChampDicte, fragment: string) =>
    onModifier({ [cle]: ajouterFragment(exercice[cle], fragment) })

  /**
   * Applique un bloc colle : chaque champ vise est complete, pas remplace.
   */
  const appliquerCollage = (reparti: TexteReparti) => {
    const maj: Partial<Exercice> = {}
    for (const [cle, texte] of Object.entries(reparti) as [ChampDicte, string][]) {
      maj[cle] = ajouterFragment(exercice[cle], texte)
    }
    onModifier(maj)
    setCollageOuvert(false)
  }

  const champ = (
    cle:
      | 'objectifs'
      | 'formeIntervention'
      | 'misePlace'
      | 'fonctionnement'
      | 'regulation'
      | 'pointsCles'
      | 'evolution',
  ) => ({
    value: exercice[cle],
    onChange: (e: { target: { value: string } }) => onModifier({ [cle]: e.target.value }),
  })

  const jetonSelectionne =
    selection?.type === 'jeton' ? schema.jetons.find((j) => j.id === selection.id) : undefined
  const flecheSelectionnee =
    selection?.type === 'fleche'
      ? resoudreFleches(schema, index).find((f) => f.id === selection.id)
      : undefined
  const zoneSelectionnee =
    selection?.type === 'zone' ? schema.zones?.find((z) => z.id === selection.id) : undefined
  const annotationSelectionnee =
    selection?.type === 'annotation'
      ? schema.annotations?.find((a) => a.id === selection.id)
      : undefined
  const manque = manqueEffectif(exercice, seance)
  const espaceManquant = manqueEspace(exercice, seance)

  return (
    <div className="fiche">
      {collageOuvert && (
        <CollerDictee onAppliquer={appliquerCollage} onFermer={() => setCollageOuvert(false)} />
      )}

      {propositions && (
        <PropositionMouvements
          schema={schema}
          propositions={propositions}
          onAppliquer={appliquerPropositions}
          onAnnuler={() => setPropositions(undefined)}
        />
      )}
      <div className="fiche-entete">
        <button className="bouton discret" onClick={onRetour} title="Revenir à la séance">
          ← Séance
        </button>
        <input
          className="titre-fiche"
          value={exercice.titre}
          onChange={(e) => onModifier({ titre: e.target.value })}
          placeholder="Titre de l'exercice"
        />
        <div className="pousse">
          <NoteEtoiles
            note={exercice.evaluation.note}
            onChanger={(note) => onModifier({ evaluation: { ...exercice.evaluation, note } })}
          />
          <button className="bouton" onClick={onEnregistrerDansBibliotheque}>
            Vers la bibliothèque
          </button>
          <button className="bouton" onClick={onImprimer}>
            Imprimer
          </button>
        </div>
      </div>

      <div
        className={`fiche-corps${separation.enDeplacement ? ' en-deplacement' : ''}${
          plein ? ` plein-${plein}` : ''
        }`}
        ref={separation.refConteneur}
        style={separation.style}
      >
        {/* ------------------------------------------------- Colonne terrain */}
        <section className="colonne-terrain">
          {/*
            Une seule barre, sur une seule ligne.
            Deux barres qui passaient a la ligne coutaient 166 pixels de hauteur
            sur un ecran de 13 pouces, au detriment du terrain lui-meme. Les
            outils de trace tiennent dans une bande qui defile plutot que de se
            replier, et les actions secondaires passent dans un menu.
          */}
          <div className="barre-outils">
            <div className="groupe-vues compact">
              {(Object.keys(LIBELLES_VUE) as VueTerrain[]).map((vue) => (
                <button
                  key={vue}
                  className={`bouton segment${schema.vue === vue ? ' actif' : ''}`}
                  onClick={() => modifierSchema((s) => ({ ...s, vue }))}
                  title={LIBELLES_VUE[vue]}
                >
                  {LIBELLES_VUE_COURTS[vue]}
                </button>
              ))}
            </div>

            <div className="bande-outils">
              <button
                className={`bouton segment${outil === 'selection' ? ' actif' : ''}`}
                onClick={() => setOutil('selection')}
                title="Déplacer et orienter les joueurs"
                aria-label="Placer"
              >
                ✥
              </button>
              {OUTILS_FLECHE.map((type) => (
                <button
                  key={type}
                  className={`bouton segment outil-${type}${outil === type ? ' actif' : ''}`}
                  onClick={() => {
                    setOutil(type)
                    setSelection(undefined)
                  }}
                  title={`${LIBELLES_FLECHE[type]} — ${AIDES_FLECHE[type].toLowerCase()}`}
                  aria-label={LIBELLES_FLECHE[type]}
                >
                  <ApercuFleche type={type} />
                </button>
              ))}
              {/* Zone et texte ferment la bande : ce ne sont pas des mouvements,
                  mais ils s'arment et se relachent de la meme facon. */}
              <button
                className={`bouton segment outil-zone${outil === 'zone' ? ' actif' : ''}`}
                onClick={() => {
                  setOutil('zone')
                  setSelection(undefined)
                }}
                title="Délimiter une zone : zone de marque, secteur interdit, espace de jeu"
                aria-label="Zone"
              >
                <ApercuZone />
              </button>
              <button
                className={`bouton segment outil-texte${outil === 'texte' ? ' actif' : ''}`}
                onClick={() => {
                  setOutil('texte')
                  setSelection(undefined)
                }}
                title="Poser un texte sur le terrain, là où il se lit"
                aria-label="Texte"
              >
                <span className="apercu-texte">A</span>
              </button>
            </div>

            <div className="pousse">
              <button
                className="bouton discret"
                onClick={historique.annuler}
                disabled={!historique.peutAnnuler}
                title="Annuler (Ctrl+Z)"
              >
                ↶
              </button>
              <button
                className="bouton discret"
                onClick={historique.retablir}
                disabled={!historique.peutRetablir}
                title="Rétablir (Ctrl+Y)"
              >
                ↷
              </button>
              <MenuActions
                aimantation={aimantation}
                onAimantation={() => setAimantation((a) => !a)}
                onSymetrie={appliquerSymetrie}
                onImage={() => void exporterImage()}
                onProposer={() =>
                  setPropositions(proposerMouvements(schema, exercice.fonctionnement))
                }
                proposerPossible={exercice.fonctionnement.trim().length > 0}
                onRediger={() => void rediger()}
                redigerPossible={redactionPossible(schema)}
              />
              {/* Hors du menu deroulant : c'est la commande la plus utilisee de
                  la barre, elle doit rester atteignable en un clic. */}
              <BoutonPleinEcran
                actif={plein === 'terrain'}
                zone="Le terrain"
                onBasculer={() => basculer('terrain')}
              />
            </div>
          </div>

          <div className="cadre-terrain" ref={cadre}>
            <Terrain
              schema={schemaAffiche}
              etape={etapeAffichee}
              etapeIndex={indexAffiche}
              outil={lecture ? 'selection' : outil}
              selection={lecture ? undefined : selection}
              onSelection={setSelection}
              onDeplacer={deplacerJeton}
              onCreerFleche={creerFleche}
              onCourber={courberFleche}
              onCreerZone={creerZone}
              onModifierZone={modifierZone}
              onCreerAnnotation={creerAnnotation}
              onDeplacerAnnotation={(id, point) => modifierAnnotation(id, point)}
              aimantation={aimantation}
              etapePrecedente={lecture ? undefined : etapePrecedente}
              interactif={!lecture}
            />
          </div>

          {/* ------------------------------------------------ Barre d'etapes */}
          <div className="barre-etapes">
            {schema.etapes.map((e, i) => (
              <button
                key={e.id}
                className={`puce-etape${i === puceActive ? ' active' : ''}${lecture ? ' en-lecture' : ''}`}
                onClick={() => {
                  setLecture(undefined)
                  setEtapeIndex(i)
                  setSelection(undefined)
                }}
                title={e.titre}
              >
                {i + 1}
              </button>
            ))}
            <button className="bouton discret" onClick={ajouterEtape} title="Ajouter une étape">
              + Étape
            </button>
            <button
              className="bouton discret"
              onClick={supprimerEtape}
              disabled={schema.etapes.length <= 1}
              title="Supprimer cette étape"
            >
              ✕
            </button>
            <div className="pousse">
              {/*
                La palette occupait deux rangees en permanence, soit 132 pixels,
                pour un geste qu'on fait quelques fois par fiche. Elle devient un
                bouton qui ouvre un choix, et rend cette hauteur au terrain.
              */}
              <SelecteurJeton onChoisir={ajouterJeton} />
              <button
                className="bouton"
                onClick={basculerLecture}
                disabled={schema.etapes.length < 2}
                title={
                  schema.etapes.length < 2
                    ? 'Ajoutez une deuxième étape pour animer le mouvement'
                    : lecture?.pause
                      ? "Reprendre la lecture où on l'a laissée"
                      : lecture
                        ? "Figer l'image sans perdre l'endroit"
                        : 'Lire le mouvement'
                }
              >
                {!lecture ? '▶ Lire' : lecture.pause ? '▶ Reprendre' : '❚❚ Pause'}
              </button>
              {lecture && (
                <button
                  className="bouton discret"
                  onClick={() => setLecture(undefined)}
                  title="Arrêter la lecture et revenir à l'édition"
                >
                  ■
                </button>
              )}
            </div>
          </div>

          <div className="detail-etape">
            <label className="champ-en-ligne large">
              <span>Titre de l'étape {index + 1}</span>
              <input
                type="text"
                value={etape.titre}
                onChange={(e) => modifierEtape((et) => ({ ...et, titre: e.target.value }))}
              />
            </label>
            <label className="champ-en-ligne large">
              <EtiquetteAvecDictee
                libelle="Consigne"
                quoi="la consigne de cette étape"
                onTexte={(f) =>
                  modifierEtape((et) => ({
                    ...et,
                    consigne: ajouterFragmentEnLigne(et.consigne, f),
                  }))
                }
              />
              <input
                type="text"
                value={etape.consigne}
                placeholder="Ce que fait le groupe à ce moment"
                onChange={(e) => modifierEtape((et) => ({ ...et, consigne: e.target.value }))}
              />
            </label>
          </div>


          {jetonSelectionne ? (
            <div className="editeur-jeton">
              <span className="etiquette-groupe">
                {APPARENCES[jetonSelectionne.type].libelle} sélectionné
                {APPARENCES[jetonSelectionne.type].feminin ? 'e' : ''}
              </span>
              <label className="champ-en-ligne">
                <span>Étiquette</span>
                <input
                  type="text"
                  maxLength={4}
                  value={jetonSelectionne.etiquette}
                  placeholder="7, AlG..."
                  onChange={(e) => modifierJeton(jetonSelectionne.id, { etiquette: e.target.value })}
                />
              </label>
              <label className="champ-en-ligne">
                <span>
                  Orientation
                  {etape.positions[jetonSelectionne.id]?.orientation === undefined && (
                    <em className="mention-auto">auto</em>
                  )}
                </span>
                <input
                  type="range"
                  min={0}
                  max={355}
                  step={5}
                  value={Math.round(orientationEffective(schema, index, jetonSelectionne.id))}
                  onChange={(e) => orienterJeton(jetonSelectionne.id, Number(e.target.value))}
                />
              </label>
              {etape.positions[jetonSelectionne.id]?.orientation !== undefined && (
                <button
                  className="bouton discret"
                  onClick={() => libererOrientation(jetonSelectionne.id)}
                  title="Laisser l'application orienter ce joueur"
                >
                  ↺ auto
                </button>
              )}
              <button
                className="bouton danger"
                onClick={() => supprimerJeton(jetonSelectionne.id)}
                title="Supprimer (Suppr)"
              >
                Retirer du terrain
              </button>
            </div>
          ) : flecheSelectionnee ? (
            <div className="editeur-jeton">
              <span className="etiquette-groupe">
                {LIBELLES_FLECHE[flecheSelectionnee.type]} sélectionné
              </span>
              <span className="aide-terrain sans-marge">
                Faites glisser le point du milieu pour courber le tracé.
              </span>
              <button
                className="bouton danger"
                onClick={() => supprimerFleche(flecheSelectionnee.id)}
              >
                Effacer le tracé
              </button>
            </div>
          ) : zoneSelectionnee ? (
            <div className="editeur-jeton">
              <span className="etiquette-groupe">Zone sélectionnée</span>
              <label className="champ-en-ligne">
                <span>Libellé</span>
                <input
                  type="text"
                  maxLength={MAX_LONGUEUR_ANNOTATION}
                  value={zoneSelectionnee.libelle}
                  placeholder="Zone de marque..."
                  onChange={(e) => modifierZone(zoneSelectionnee.id, { libelle: e.target.value })}
                />
              </label>
              <div className="nuancier" role="group" aria-label="Couleur de la zone">
                {(Object.keys(LIBELLES_TEINTE) as TeinteZone[]).map((teinte) => (
                  <button
                    key={teinte}
                    className={`pastille-teinte teinte-${teinte}${
                      zoneSelectionnee.teinte === teinte ? ' actif' : ''
                    }`}
                    onClick={() => modifierZone(zoneSelectionnee.id, { teinte })}
                    title={LIBELLES_TEINTE[teinte]}
                    aria-label={LIBELLES_TEINTE[teinte]}
                    aria-pressed={zoneSelectionnee.teinte === teinte}
                  />
                ))}
              </div>
              <span className="aide-terrain sans-marge">
                Faites glisser la zone pour la déplacer, le carré du coin pour la redimensionner.
              </span>
              <button className="bouton danger" onClick={() => supprimerZone(zoneSelectionnee.id)}>
                Effacer la zone
              </button>
            </div>
          ) : annotationSelectionnee ? (
            <div className="editeur-jeton">
              <span className="etiquette-groupe">Texte sélectionné</span>
              <label className="champ-en-ligne large">
                <span>Texte</span>
                <input
                  type="text"
                  maxLength={MAX_LONGUEUR_ANNOTATION}
                  value={annotationSelectionnee.texte}
                  placeholder="Défense 6-0, départ au signal..."
                  onChange={(e) =>
                    modifierAnnotation(annotationSelectionnee.id, { texte: e.target.value })
                  }
                />
              </label>
              <button
                className="bouton danger"
                onClick={() => supprimerAnnotation(annotationSelectionnee.id)}
              >
                Effacer le texte
              </button>
            </div>
          ) : (
            <p className="aide-terrain">
              Ajoutez un élément de la palette, puis faites-le glisser sur le terrain. La poignée
              jaune fait pivoter le joueur sur 360°. Choisissez un type de mouvement ci-dessus pour
              tracer une flèche, délimiter une zone ou poser un texte.
            </p>
          )}
        </section>

        <Separateur separation={separation} libelle="Largeur du schéma de terrain" />

        {/* -------------------------------------------------- Colonne detail */}
        <section className="colonne-detail">
          <div className="barre-detail">
            <button
              className="repli-signaletique"
              onClick={basculerSignaletique}
              aria-expanded={!signaletiqueRepliee}
              title={
                signaletiqueRepliee
                  ? 'Afficher catégorie, durée, effectif et difficulté'
                  : 'Replier : le résumé reste visible'
              }
            >
              <span className={`chevron${signaletiqueRepliee ? ' replie' : ''}`}>⌄</span>
              <span className="etiquette-groupe">Détail de l'exercice</span>
            </button>
            {signaletiqueRepliee && (
              <span className="resume-signaletique">
                {LIBELLES_CATEGORIE[exercice.categorie]} · {exercice.duree} min ·{' '}
                {exercice.nombreJoueurs} joueurs
                {exercice.nombreGardiens > 0 && ` + ${exercice.nombreGardiens} GB`}
                {` · ${LIBELLES_ESPACE_COURTS[exercice.espace]}`}
                {exercice.enParallele && ' · en parallèle'}
              </span>
            )}
            <div className="pousse">
              {/*
                La dictee du telephone tourne SUR L APPAREIL : elle marche sans
                reseau, dans un gymnase, et connait le francais. C est la voie
                fiable ; le micro des champs n est qu un complement pour ceux
                qui preparent leur seance connectes.
              */}
              <button
                className="bouton discret"
                onClick={() => setCollageOuvert(true)}
                title="Coller un texte dicté sur votre téléphone, et le répartir dans les champs"
              >
                Coller un texte dicté
              </button>
              <BoutonPleinEcran
                actif={plein === 'detail'}
                zone="Le détail"
                onBasculer={() => basculer('detail')}
              />
            </div>
          </div>

          {(manque || espaceManquant) && (
            <AlerteMoyens manque={manque} espaceManquant={espaceManquant} seance={seance} />
          )}

          {/*
            Fiche signaletique : six valeurs courtes, consultees souvent et
            modifiees rarement. Elles occupaient trois rangees de champs pleine
            largeur avec une etiquette en capitales au-dessus de chacune — 203
            pixels pris sur la zone de redaction, qui est le vrai espace de
            travail. Les nombres sont regroupes et leur unite sert d'etiquette.
          */}
          <div className={`grille-detail${signaletiqueRepliee ? ' repliee' : ''}`}>
            <label className="champ etendu">
              <span>Catégorie</span>
              <select
                value={exercice.categorie}
                onChange={(e) => onModifier({ categorie: e.target.value as Categorie })}
              >
                {Object.entries(LIBELLES_CATEGORIE).map(([valeur, libelle]) => (
                  <option key={valeur} value={valeur}>
                    {libelle}
                  </option>
                ))}
              </select>
            </label>
            <label className="champ">
              <span>Difficulté</span>
              <select
                value={exercice.difficulte}
                onChange={(e) =>
                  onModifier({ difficulte: Number(e.target.value) as Exercice['difficulte'] })
                }
              >
                <option value={1}>Facile</option>
                <option value={2}>Intermédiaire</option>
                <option value={3}>Difficile</option>
              </select>
            </label>

            <div className="groupe-nombres" role="group" aria-label="Volume de l'exercice">
              <label className="nombre">
                <input
                  type="number"
                  min={0}
                  max={180}
                  value={exercice.duree}
                  aria-label="Durée en minutes"
                  onChange={(e) => onModifier({ duree: Number(e.target.value) || 0 })}
                />
                <span>min</span>
              </label>
              <label className="nombre">
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={exercice.nombreJoueurs}
                  aria-label="Nombre de joueurs de champ"
                  onChange={(e) => onModifier({ nombreJoueurs: Number(e.target.value) || 0 })}
                />
                <span>joueurs</span>
              </label>
              <label className="nombre">
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={exercice.nombreGardiens}
                  aria-label="Nombre de gardiens"
                  onChange={(e) => onModifier({ nombreGardiens: Number(e.target.value) || 0 })}
                />
                <span>gardiens</span>
              </label>
            </div>

            {/*
              L'espace de jeu, jumeau de l'effectif : declare ici, il permet a
              la seance de signaler les exercices qui ne tiendront pas dans le
              gymnase disponible ce soir-la.
            */}
            <label className="champ etendu">
              <span>Espace nécessaire</span>
              <select
                value={exercice.espace}
                onChange={(e) => onModifier({ espace: e.target.value as Espace })}
              >
                {Object.entries(LIBELLES_ESPACE).map(([valeur, libelle]) => (
                  <option key={valeur} value={valeur}>
                    {libelle}
                  </option>
                ))}
              </select>
            </label>

            {/* Pleine largeur : les intitules debordaient de la liste. */}
            <label className="champ etendu">
              <span>Rôle des gardiens</span>
              <select
                value={exercice.formatGardiens}
                onChange={(e) => onModifier({ formatGardiens: e.target.value as FormatGardiens })}
              >
                {Object.entries(LIBELLES_FORMAT_GARDIENS_COURTS).map(([valeur, libelle]) => (
                  <option key={valeur} value={valeur}>
                    {libelle}
                  </option>
                ))}
              </select>
            </label>

            <label
              className="case-a-cocher compacte"
              title="Un exercice mené en parallèle se déroule pendant un autre : sa durée ne s'ajoute pas au temps total de la séance."
            >
              <input
                type="checkbox"
                checked={exercice.enParallele}
                onChange={(e) => onModifier({ enParallele: e.target.checked })}
              />
              <span>En parallèle d'un autre exercice</span>
            </label>
          </div>

          {/*
            Les champs longs portent un micro a droite de leur etiquette, la ou
            le navigateur sait transcrire. Ailleurs, l'etiquette est celle
            d'avant : on ne montre pas une commande morte.
          */}
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Objectifs"
              quoi="les objectifs"
              onTexte={(f) => dicter('objectifs', f)}
            />
            <textarea rows={2} placeholder="Ce que les joueurs doivent progresser" {...champ('objectifs')} />
          </label>
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Forme d'intervention"
              quoi="la forme d'intervention"
              onTexte={(f) =>
                onModifier({
                  formeIntervention: ajouterFragmentEnLigne(exercice.formeIntervention, f),
                })
              }
            />
            <input
              type="text"
              placeholder="Approche inductive, consigne directe, couverture pivot..."
              {...champ('formeIntervention')}
            />
          </label>
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Mise en place"
              quoi="la mise en place"
              onTexte={(f) => dicter('misePlace', f)}
            />
            <textarea
              rows={3}
              placeholder="Espaces à délimiter, colonnes, matériel à poser"
              {...champ('misePlace')}
            />
          </label>
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Fonctionnement"
              quoi="le fonctionnement"
              onTexte={(f) => dicter('fonctionnement', f)}
            />
            <textarea
              rows={5}
              placeholder="Comment la situation se déroule une fois lancée"
              {...champ('fonctionnement')}
            />
          </label>
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Régulation"
              quoi="la régulation"
              onTexte={(f) => dicter('regulation', f)}
            />
            <textarea
              rows={3}
              placeholder="Règles, contraintes, barème de points"
              {...champ('regulation')}
            />
          </label>
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Points clés"
              quoi="les points clés"
              onTexte={(f) => dicter('pointsCles', f)}
            />
            <textarea rows={3} placeholder="Ce que l'entraîneur observe et corrige" {...champ('pointsCles')} />
          </label>
          <label className="champ">
            <EtiquetteAvecDictee
              libelle="Évolution"
              quoi="les évolutions"
              onTexte={(f) => dicter('evolution', f)}
            />
            <textarea rows={3} placeholder="Simplifier, complexifier, faire évoluer" {...champ('evolution')} />
          </label>
          <label className="champ">
            <span>Matériel</span>
            <input
              type="text"
              placeholder="ballons, plots, chasubles (séparés par des virgules)"
              value={exercice.materiel.join(', ')}
              onChange={(e) =>
                onModifier({
                  materiel: e.target.value
                    .split(',')
                    .map((m) => m.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>

          <div className="bloc-evaluation">
            <div className="entete-evaluation">
              <span className="etiquette-groupe">Retour après séance</span>
              <button
                className="bouton"
                onClick={() =>
                  onModifier({
                    evaluation: {
                      ...exercice.evaluation,
                      nombreUtilisations: exercice.evaluation.nombreUtilisations + 1,
                      derniereUtilisation: new Date().toISOString().slice(0, 10),
                    },
                  })
                }
              >
                Marquer comme réalisé
              </button>
            </div>
            <p className="compteur-utilisations">
              {exercice.evaluation.nombreUtilisations === 0
                ? 'Jamais utilisé'
                : `Utilisé ${exercice.evaluation.nombreUtilisations} fois` +
                  (exercice.evaluation.derniereUtilisation
                    ? `, la dernière fois le ${exercice.evaluation.derniereUtilisation
                        .split('-')
                        .reverse()
                        .join('/')}`
                    : '')}
            </p>
            {/* Le retour d apres-seance se dicte aussi bien qu il s ecrit. */}
            <label className="champ">
              <EtiquetteAvecDictee
                libelle="Ce qui a marché"
                quoi="votre retour"
                onTexte={(f) =>
                  onModifier({
                    evaluation: {
                      ...exercice.evaluation,
                      commentaire: ajouterFragment(exercice.evaluation.commentaire, f),
                    },
                  })
                }
              />
            <textarea
              rows={3}
              placeholder="Ce qui a marché ou non, à relire avant de le reprogrammer"
              value={exercice.evaluation.commentaire}
              onChange={(e) =>
                onModifier({ evaluation: { ...exercice.evaluation, commentaire: e.target.value } })
              }
            />
            </label>
          </div>
        </section>
      </div>
    </div>
  )
}

/**
 * Bouton d'agrandissement d'une colonne.
 *
 * Le pictogramme est trace en SVG plutot qu'ecrit avec un caractere : les
 * fleches d'agrandissement d'Unicode manquent dans beaucoup de polices, et un
 * carre vide a la place d'une icone n'aide personne.
 */
function BoutonPleinEcran({
  actif,
  zone,
  onBasculer,
}: {
  actif: boolean
  zone: string
  onBasculer: () => void
}) {
  return (
    <button
      className={`bouton discret plein-ecran${actif ? ' actif' : ''}`}
      onClick={onBasculer}
      aria-pressed={actif}
      title={
        actif
          ? `${zone} occupe toute la largeur : revenir à deux colonnes (Échap)`
          : `${zone} occupe toute la largeur`
      }
    >
      <svg className="icone-plein-ecran" viewBox="0 0 16 16" aria-hidden="true">
        <path
          d={
            actif
              ? 'M7 2 V7 H2 M9 14 V9 H14'
              : 'M2 6 V2 H6 M14 6 V2 H10 M2 10 V14 H6 M14 10 V14 H10'
          }
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

/** Petit apercu de l'outil zone : un rectangle plein en tirets. */
function ApercuZone() {
  return (
    <svg viewBox="0 0 16 16" className="apercu-fleche" aria-hidden="true">
      <rect
        x={2}
        y={3.5}
        width={12}
        height={9}
        fill="currentColor"
        fillOpacity={0.28}
        stroke="currentColor"
        strokeWidth={1.3}
        strokeDasharray="2.6 2"
      />
    </svg>
  )
}

/** Petit apercu du style de trait, dans la barre d'outils. */
function ApercuFleche({ type }: { type: TypeFleche }) {
  const traits: Record<TypeFleche, string> = {
    course: 'M 1 8 L 15 8',
    passe: 'M 1 8 L 15 8',
    dribble: 'M 1 8 Q 3.5 3, 6 8 T 11 8 T 15 8',
    tir: 'M 1 6 L 15 6 M 1 10 L 15 10',
    ecran: 'M 1 8 L 13 8 M 13 3 L 13 13',
    // La rotation revient en arriere : l'apercu la montre courbe, comme sur le
    // terrain, ou elle ramene le joueur au fond de sa colonne.
    rotation: 'M 1 11 Q 8 2, 14 10',
  }
  const tirets: Partial<Record<TypeFleche, string>> = { passe: '3 2.2', rotation: '2.4 2' }
  return (
    <svg viewBox="0 0 16 16" className="apercu-fleche" aria-hidden="true">
      <path
        d={traits[type]}
        fill="none"
        stroke="currentColor"
        strokeWidth={type === 'tir' ? 1.4 : type === 'rotation' ? 1.2 : 1.6}
        strokeDasharray={tirets[type]}
        strokeLinecap="round"
      />
      {/* Pointe pleine pour les actions du jeu, ouverte pour la rotation :
          la meme distinction que sur le terrain. */}
      {type === 'rotation' ? (
        <path
          d="M 10.5 6.5 L 14.6 9.8 L 10 11"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        type !== 'ecran' && <polygon points="16,8 12,10 12,6" fill="currentColor" />
      )}
    </svg>
  )
}

/** Premiere ligne d un texte : sert d apercu dans la demande de confirmation. */
function premiereLigne(texte: string): string {
  const fin = texte.indexOf(String.fromCharCode(10))
  return fin === -1 ? texte : texte.slice(0, fin)
}
