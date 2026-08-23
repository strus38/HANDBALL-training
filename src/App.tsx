import { useEffect, useState } from 'react'
import { ListeSeances } from './ui/ListeSeances'
import { ouvrirNotice } from './notice/notice'
import { DetailSeance } from './ui/DetailSeance'
import { FicheExercice } from './ui/FicheExercice'
import { FeuillesImpression } from './ui/FeuillesImpression'
import { LogoHbpsm } from './ui/LogoHbpsm'
import { TableauSeances } from './ui/TableauSeances'
import { Bilan } from './ui/Bilan'
import { DupliquerSeance } from './ui/DupliquerSeance'
import { useConfirmation } from './ui/Dialogue'
import { dupliquerSeance, type OptionsDuplication } from './domain/resume'
import { Bibliotheque } from './bibliotheque/Bibliotheque'
import { useAtelier, type EtatSauvegarde } from './ui/useAtelier'
import { fichiersNavigateur, nomDeFichierSur } from './platform/fichiers'
import {
  EXTENSION,
  ErreurImport,
  exporterExercice,
  exporterSauvegarde,
  exporterSeance,
  importerFichier,
} from './domain/echange'
import type { Exercice, Seance } from './domain/types'
import type { MoyenStockage } from './storage/choisirDepot'

export function App() {
  const atelier = useAtelier()
  const confirmer = useConfirmation()
  const [messageImport, setMessageImport] = useState<string | undefined>()
  const [exerciceOuvertId, setExerciceOuvertId] = useState<string | undefined>()
  const [bibliothequeOuverte, setBibliothequeOuverte] = useState(false)
  const [colonneRepliee, setColonneRepliee] = useState(false)
  /** Vrai quand le navigateur a bloque la fenetre de la notice. */
  const [messageNotice, setMessageNotice] = useState(false)
  const [aImprimer, setAImprimer] = useState<Exercice[]>([])
  // Vue courante : la page d'accueil listant toutes les seances, ou une seance
  // ouverte. L'exercice ouvert forme un troisieme niveau a l'interieur.
  const [vue, setVue] = useState<'accueil' | 'bilan' | 'seance'>('accueil')
  const surAccueil = vue === 'accueil'
  const [aDupliquer, setADupliquer] = useState<Seance | undefined>()
  // La seance a imprimer n'est pas forcement celle qui est ouverte : depuis
  // l'accueil, on imprime une seance sans y entrer.
  const [seanceImprimee, setSeanceImprimee] = useState<Seance | undefined>()

  const seance = atelier.seanceCourante
  const exerciceOuvert = seance?.exercices.find((ex) => ex.id === exerciceOuvertId)

  const modifierSeance = (transformation: (seance: Seance) => Seance) => {
    if (seance) atelier.majSeance(seance.id, transformation)
  }

  const modifierExercice = (id: string, modifications: Partial<Exercice>) =>
    modifierSeance((s) => ({
      ...s,
      exercices: s.exercices.map((ex) =>
        ex.id === id ? { ...ex, ...modifications, modifieLe: new Date().toISOString() } : ex,
      ),
    }))

  // L'impression se declenche une fois les feuilles rendues, sinon le
  // navigateur imprimerait la page telle qu'elle etait avant.
  //
  // Un minuteur plutot qu'une image d'animation : requestAnimationFrame ne se
  // declenche pas quand la fenetre n'est pas affichee (onglet en arriere-plan),
  // et l'impression ne partirait alors jamais.
  useEffect(() => {
    if (aImprimer.length === 0) return
    const minuterie = setTimeout(() => {
      window.print()
      setAImprimer([])
      setSeanceImprimee(undefined)
    }, 60)
    return () => clearTimeout(minuterie)
  }, [aImprimer])

  const demanderSuppression = async (cible: Seance) => {
    const accepte = await confirmer({
      titre: 'Supprimer cette seance ?',
      message: (
        <>
          <strong>{cible.titre || 'Sans titre'}</strong> et ses {cible.exercices.length} exercice
          {cible.exercices.length > 1 ? 's' : ''} seront supprimes definitivement.
          <em className="dialogue-note">
            Pour en garder une trace, fermez cette fenetre et utilisez « Exporter ».
          </em>
        </>
      ),
      libelleConfirmer: 'Supprimer la seance',
      danger: true,
    })
    if (!accepte) return
    void atelier.supprimerSeance(cible.id)
    setExerciceOuvertId(undefined)
  }

  const validerDuplication = (options: OptionsDuplication) => {
    if (!aDupliquer) return
    const copie = dupliquerSeance(aDupliquer, options)
    atelier.ajouterSeance(copie)
    setADupliquer(undefined)
    setExerciceOuvertId(undefined)
    setVue('seance')
    setMessageImport(
      `Seance « ${copie.titre} » creee pour le ${copie.date.split('-').reverse().join('/')}.`,
    )
  }

  const imprimerSeance = (cible: Seance) => {
    setSeanceImprimee(cible)
    setAImprimer(cible.exercices)
  }

  const importer = async () => {
    setMessageImport(undefined)
    const fichier = await fichiersNavigateur.choisirFichier('.json,application/json')
    if (!fichier) return
    try {
      const contenu = importerFichier(fichier.texte)
      setExerciceOuvertId(undefined)

      if (contenu.type === 'sauvegarde') {
        // Une restauration AJOUTE : elle n'ecrase jamais le travail en place.
        await atelier.restaurer(contenu.seances, contenu.modeles, contenu.favoris)
        setVue('accueil')
        setMessageImport(
          `Sauvegarde restauree : ${contenu.seances.length} seance` +
            `${contenu.seances.length > 1 ? 's' : ''} et ${contenu.modeles.length} exercice` +
            `${contenu.modeles.length > 1 ? 's' : ''} ajoutes a ce qui etait deja la.`,
        )
        return
      }

      atelier.ajouterSeance(contenu.seance)
      setVue('seance')
      setMessageImport(
        contenu.type === 'seance'
          ? `Seance « ${contenu.seance.titre} » importee.`
          : 'Exercice importe dans une nouvelle seance.',
      )
    } catch (erreur) {
      setMessageImport(
        erreur instanceof ErreurImport ? erreur.message : 'Import impossible : fichier illisible.',
      )
    }
  }

  const exporterUneSeance = (cible: Seance) =>
    fichiersNavigateur.telecharger(nomDeFichierSur(cible.titre, EXTENSION), exporterSeance(cible))

  /**
   * Sauvegarde de tout le travail : seances, bibliotheque personnelle, favoris.
   *
   * Le stockage du navigateur est lie a une machine et disparait avec un
   * nettoyage des donnees de navigation. Ce fichier est la seule copie
   * transportable, et le seul moyen d'emporter la bibliotheque personnelle.
   */
  const sauvegarderTout = () => {
    const jour = new Date().toISOString().slice(0, 10)
    fichiersNavigateur.telecharger(
      `hbpsm-sauvegarde-${jour}${EXTENSION}`,
      exporterSauvegarde(atelier.seances, atelier.mesModeles, atelier.favoris),
    )
    setMessageImport(
      `Sauvegarde de ${atelier.seances.length} seance${atelier.seances.length > 1 ? 's' : ''} ` +
        `et ${atelier.mesModeles.length} exercice${atelier.mesModeles.length > 1 ? 's' : ''} ` +
        `de votre bibliotheque, avec vos ${atelier.favoris.length} favori` +
        `${atelier.favoris.length > 1 ? 's' : ''}. Conservez ce fichier ailleurs que sur cette machine.`,
    )
  }

  const exporterUneFiche = (exercice: Exercice) =>
    fichiersNavigateur.telecharger(
      nomDeFichierSur(exercice.titre, EXTENSION),
      exporterExercice(exercice),
    )

  return (
    <div className="application">
      <header className="entete">
        <button
          className="bouton discret replier"
          onClick={() => setColonneRepliee((r) => !r)}
          title={colonneRepliee ? 'Afficher le menu des seances' : 'Replier le menu des seances'}
          aria-expanded={!colonneRepliee}
        >
          {colonneRepliee ? '☰' : '⟨'}
        </button>
        <button
          className="marque"
          onClick={() => {
            setVue('accueil')
            setExerciceOuvertId(undefined)
          }}
          title="Revenir a la liste des seances"
        >
          <LogoHbpsm />
        </button>
        <div className="identite">
          <h1>HBPSM · Preparation de seances</h1>
          <span className="sous-titre">
            Handball Pays de Saint-Marcellin · fonctionne hors ligne
          </span>
        </div>
        <div className="pousse" />
        <button
          className="bouton discret"
          onClick={() => {
            if (!ouvrirNotice()) setMessageNotice(true)
          }}
          title="Ouvrir la notice dans une fenetre a part"
        >
          Notice
        </button>
        <IndicateurSauvegarde etat={atelier.etatSauvegarde} moyen={atelier.moyenStockage} />
      </header>

      {atelier.moyenStockage === 'aucun' && !atelier.chargement && (
        <div className="bandeau alerte">
          <div>
            <strong>Sauvegarde automatique indisponible</strong>
            Votre navigateur n'autorise aucun stockage local pour ce fichier (navigation privee, ou
            ouverture directe depuis le disque). Le travail en cours reste utilisable, mais il sera
            perdu a la fermeture : exportez vos seances en fichier .hbt.json avant de quitter.
          </div>
        </div>
      )}

      {messageImport && (
        <div className="bandeau information">
          <div>{messageImport}</div>
          <button className="bouton discret" onClick={() => setMessageImport(undefined)}>
            ✕
          </button>
        </div>
      )}

      {messageNotice && (
        <div className="bandeau information">
          <div>
            <strong>Notice bloquee par le navigateur</strong>
            La fenetre n'a pas pu s'ouvrir : autorisez les fenetres surgissantes pour cette page,
            ou ouvrez le fichier <code>LISEZMOI.html</code> livre a cote de l'application.
          </div>
          <button className="bouton discret" onClick={() => setMessageNotice(false)}>
            ✕
          </button>
        </div>
      )}

      <div className="corps">
        {!colonneRepliee && (
          <ListeSeances
            seances={atelier.seances}
            seanceCouranteId={atelier.seanceCouranteId}
            onSelectionner={(id) => {
              atelier.setSeanceCouranteId(id)
              setExerciceOuvertId(undefined)
              setVue('seance')
            }}
            onNouvelle={() => {
              atelier.ajouterSeance()
              setExerciceOuvertId(undefined)
              setVue('seance')
            }}
            onReplier={() => setColonneRepliee(true)}
            onAccueil={() => {
              setVue('accueil')
              setExerciceOuvertId(undefined)
            }}
            onBilan={() => {
              setVue('bilan')
              setExerciceOuvertId(undefined)
            }}
            vue={vue}
            onImporter={importer}
          />
        )}

        {atelier.chargement ? (
          <div className="panneau-principal">
            <p className="attente">Chargement…</p>
          </div>
        ) : vue === 'bilan' ? (
          <Bilan seances={atelier.seances} />
        ) : surAccueil || !seance ? (
          <TableauSeances
            seances={atelier.seances}
            onOuvrir={(id) => {
              atelier.setSeanceCouranteId(id)
              setExerciceOuvertId(undefined)
              setVue('seance')
            }}
            onNouvelle={() => {
              atelier.ajouterSeance()
              setExerciceOuvertId(undefined)
              setVue('seance')
            }}
            onImporter={importer}
            onSauvegarder={sauvegarderTout}
            onDupliquer={setADupliquer}
            onExporter={exporterUneSeance}
            onImprimer={imprimerSeance}
            onSupprimer={(cible) => void demanderSuppression(cible)}
          />
        ) : exerciceOuvert ? (
          <FicheExercice
            key={exerciceOuvert.id}
            exercice={exerciceOuvert}
            seance={seance}
            onModifier={(modifications) => modifierExercice(exerciceOuvert.id, modifications)}
            onRetour={() => {
              // Une fiche rejoint la bibliotheque la premiere fois qu'on la
              // quitte : elle est alors ecrite, et non plus vide. Ensuite, seul
              // le bouton « Vers la bibliotheque » met le modele a jour, pour
              // qu'adapter un exercice a une seance ne modifie pas la reference.
              const dejaConnue = atelier.mesModeles.some((m) => m.id === exerciceOuvert.id)
              if (!dejaConnue) void atelier.enregistrerModele(exerciceOuvert)
              setExerciceOuvertId(undefined)
            }}
            onEnregistrerDansBibliotheque={() => {
              void atelier.enregistrerModele(exerciceOuvert)
              setMessageImport(
                `« ${exerciceOuvert.titre} » est enregistre dans votre bibliotheque.`,
              )
            }}
            onImprimer={() => setAImprimer([exerciceOuvert])}
          />
        ) : (
          <DetailSeance
            seance={seance}
            onModifier={modifierSeance}
            onSupprimerSeance={() => void demanderSuppression(seance)}
            onExporterSeance={() => exporterUneSeance(seance)}
            onRetourAccueil={() => setVue('accueil')}
            onDupliquer={() => setADupliquer(seance)}
            onExporterExercice={exporterUneFiche}
            onOuvrirExercice={setExerciceOuvertId}
            onOuvrirBibliotheque={() => setBibliothequeOuverte(true)}
            onImprimerSeance={() => imprimerSeance(seance)}
          />
        )}
      </div>

      {bibliothequeOuverte && (
        <Bibliotheque
          mesModeles={atelier.mesModeles}
          seances={atelier.seances}
          favoris={atelier.favoris}
          onBasculerFavori={(cle) => void atelier.basculerFavori(cle)}
          onFermer={() => setBibliothequeOuverte(false)}
          onSupprimerModele={(id) => void atelier.supprimerModele(id)}
          onAjouter={(exercice) => {
            modifierSeance((s) => ({ ...s, exercices: [...s.exercices, exercice] }))
            setBibliothequeOuverte(false)
          }}
        />
      )}

      {aDupliquer && (
        <DupliquerSeance
          seance={aDupliquer}
          onAnnuler={() => setADupliquer(undefined)}
          onValider={validerDuplication}
        />
      )}

      {aImprimer.length > 0 && (seanceImprimee ?? seance) && (
        <FeuillesImpression seance={(seanceImprimee ?? seance)!} exercices={aImprimer} />
      )}
    </div>
  )
}

function IndicateurSauvegarde({ etat, moyen }: { etat: EtatSauvegarde; moyen: MoyenStockage }) {
  if (moyen === 'aucun') return <span className="indicateur erreur">Non sauvegarde</span>
  const libelles: Record<EtatSauvegarde, string> = {
    inactif: moyen === 'localstorage' ? 'Sauvegarde simplifiee' : '',
    'en-cours': 'Enregistrement…',
    enregistre: 'Enregistre',
    erreur: 'Echec de sauvegarde',
  }
  const classe = etat === 'erreur' ? 'erreur' : etat === 'enregistre' ? 'enregistre' : ''
  return (
    <span
      className={`indicateur ${classe}`}
      title={
        moyen === 'localstorage'
          ? 'Stockage de secours du navigateur : capacite limitee, exportez regulierement.'
          : 'Sauvegarde automatique dans le navigateur.'
      }
    >
      {libelles[etat]}
    </span>
  )
}
