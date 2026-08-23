/**
 * Etat global de l'application et sauvegarde automatique.
 *
 * Toute modification passe par majSeance() : l'etat est mis a jour
 * immediatement (interface reactive) puis ecrit dans le depot apres une courte
 * temporisation, pour ne pas ecrire a chaque frappe au clavier.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { choisirDepot, type MoyenStockage } from '../storage/choisirDepot'
import type { Depot } from '../storage/depot'
import { nouvelleSeance } from '../domain/fabrique'
import { normaliserExercice, normaliserSeance } from '../domain/echange'
import type { Exercice, Seance } from '../domain/types'
import { basculerFavori, fusionnerFavoris } from '../domain/favoris'

const DELAI_SAUVEGARDE_MS = 600

export type EtatSauvegarde = 'inactif' | 'en-cours' | 'enregistre' | 'erreur'

export function useAtelier() {
  const [seances, setSeances] = useState<Seance[]>([])
  const [seanceCouranteId, setSeanceCouranteId] = useState<string | undefined>()
  const [chargement, setChargement] = useState(true)
  const [moyenStockage, setMoyenStockage] = useState<MoyenStockage>('indexeddb')
  const [mesModeles, setMesModeles] = useState<Exercice[]>([])
  const [favoris, setFavoris] = useState<string[]>([])
  const [etatSauvegarde, setEtatSauvegarde] = useState<EtatSauvegarde>('inactif')

  const minuteries = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const depot = useRef<Depot | undefined>(undefined)
  // Copie synchrone des seances : au moment ou la page se ferme, il n'y a plus
  // le temps d'attendre un rendu pour retrouver la derniere version.
  const dernieresSeances = useRef<Seance[]>([])
  dernieresSeances.current = seances

  // Chargement initial : choix du moyen de stockage puis lecture des seances.
  useEffect(() => {
    let annule = false
    void (async () => {
      const choix = await choisirDepot()
      if (annule) return
      depot.current = choix.depot
      setMoyenStockage(choix.moyen)
      if (choix.depot) {
        try {
          // Les seances relues peuvent avoir ete ecrites par une version
          // anterieure : on les complete avant de les afficher, sinon un champ
          // ajoute depuis manquerait a l'appel.
          const existantes = (await choix.depot.listerSeances()).map(normaliserSeance)
          const modeles = (await choix.depot.listerModeles()).map(normaliserExercice)
          const etoiles = await choix.depot.lireFavoris()
          if (annule) return
          setSeances(existantes)
          setMesModeles(modeles)
          setFavoris(etoiles)
          setSeanceCouranteId(existantes[0]?.id)
        } catch {
          if (!annule) {
            depot.current = undefined
            setMoyenStockage('aucun')
          }
        }
      }
      if (!annule) setChargement(false)
    })()
    return () => {
      annule = true
    }
  }, [])

  /**
   * Ecrit immediatement les sauvegardes encore en attente.
   *
   * Appele des que la page passe en arriere-plan ou se ferme. Ecrire vaut mieux
   * que prevenir : l'ancienne version affichait ici l'avertissement natif du
   * navigateur (« quitter le site ? »), qui ne sauvegardait rien et ne pouvait
   * pas etre mis aux couleurs de l'application.
   */
  const ecrireEnAttente = useCallback(() => {
    for (const [id, minuterie] of minuteries.current) {
      clearTimeout(minuterie)
      const seance = dernieresSeances.current.find((s) => s.id === id)
      if (seance) void depot.current?.enregistrerSeance(seance)
    }
    minuteries.current.clear()
  }, [])

  useEffect(() => {
    const surMasquage = () => {
      if (document.visibilityState === 'hidden') ecrireEnAttente()
    }
    // pagehide couvre la fermeture et la navigation ; visibilitychange couvre
    // le passage en arriere-plan, seul evenement fiable sur mobile.
    document.addEventListener('visibilitychange', surMasquage)
    window.addEventListener('pagehide', ecrireEnAttente)
    return () => {
      document.removeEventListener('visibilitychange', surMasquage)
      window.removeEventListener('pagehide', ecrireEnAttente)
    }
  }, [ecrireEnAttente])

  const planifierSauvegarde = useCallback((seance: Seance) => {
    const cible = depot.current
    if (!cible) return
    const existante = minuteries.current.get(seance.id)
    if (existante) clearTimeout(existante)
    setEtatSauvegarde('en-cours')
    const minuterie = setTimeout(async () => {
      minuteries.current.delete(seance.id)
      try {
        await cible.enregistrerSeance(seance)
        setEtatSauvegarde('enregistre')
      } catch {
        // Quota depasse, base fermee par un autre onglet... l'entraineur doit
        // le voir : on n'affiche jamais « enregistre » a tort.
        setEtatSauvegarde('erreur')
      }
    }, DELAI_SAUVEGARDE_MS)
    minuteries.current.set(seance.id, minuterie)
  }, [])

  /** Applique une transformation a une seance et declenche la sauvegarde. */
  const majSeance = useCallback(
    (id: string, transformation: (seance: Seance) => Seance) => {
      setSeances((precedentes) =>
        precedentes.map((s) => {
          if (s.id !== id) return s
          const modifiee = { ...transformation(s), modifieLe: new Date().toISOString() }
          planifierSauvegarde(modifiee)
          return modifiee
        }),
      )
    },
    [planifierSauvegarde],
  )

  const ajouterSeance = useCallback(
    (seance: Seance = nouvelleSeance()) => {
      setSeances((precedentes) => [seance, ...precedentes])
      setSeanceCouranteId(seance.id)
      planifierSauvegarde(seance)
      return seance
    },
    [planifierSauvegarde],
  )

  const supprimerSeance = useCallback(async (id: string) => {
    const minuterie = minuteries.current.get(id)
    if (minuterie) {
      clearTimeout(minuterie)
      minuteries.current.delete(id)
    }
    setSeances((precedentes) => {
      const restantes = precedentes.filter((s) => s.id !== id)
      setSeanceCouranteId((courante) => (courante === id ? restantes[0]?.id : courante))
      return restantes
    })
    try {
      await depot.current?.supprimerSeance(id)
    } catch {
      setEtatSauvegarde('erreur')
    }
  }, [])

  /**
   * Ajoute ou met a jour une fiche dans la bibliotheque personnelle.
   *
   * La bibliotheque conserve une COPIE : adapter l'exercice pour une seance
   * donnee ne modifie pas le modele, et inversement. C'est ce qui permet de
   * retoucher une fiche pour un soir sans abimer la reference.
   */
  const enregistrerModele = useCallback(async (exercice: Exercice) => {
    const copie: Exercice = JSON.parse(JSON.stringify(exercice))
    copie.modifieLe = new Date().toISOString()
    setMesModeles((precedents) => {
      const index = precedents.findIndex((m) => m.id === copie.id)
      if (index < 0) return [copie, ...precedents]
      const suivants = [...precedents]
      suivants[index] = copie
      return suivants
    })
    try {
      await depot.current?.enregistrerModele(copie)
    } catch {
      setEtatSauvegarde('erreur')
    }
  }, [])

  const supprimerModele = useCallback(async (id: string) => {
    setMesModeles((precedents) => precedents.filter((m) => m.id !== id))
    try {
      await depot.current?.supprimerModele(id)
    } catch {
      setEtatSauvegarde('erreur')
    }
  }, [])

  /**
   * Met une fiche de la bibliotheque en favori, ou l'en retire.
   *
   * L'ecriture est immediate, sans la temporisation des seances : cocher une
   * etoile est un geste isole, pas une frappe au clavier repetee.
   */
  const basculerFavoriDe = useCallback(async (cle: string) => {
    let suivants: string[] = []
    setFavoris((precedents) => {
      suivants = basculerFavori(precedents, cle)
      return suivants
    })
    try {
      await depot.current?.enregistrerFavoris(suivants)
    } catch {
      setEtatSauvegarde('erreur')
    }
  }, [])
  /**
   * Restaure une sauvegarde complete.
   *
   * Le contenu est AJOUTE a l'existant : les identifiants ont ete renouveles a
   * la lecture du fichier, donc rien n'est ecrase. Restaurer sur une machine
   * vierge redonne exactement le classeur ; restaurer par-dessus un travail en
   * cours ne le detruit pas.
   */
  const restaurer = useCallback(
    async (nouvelles: Seance[], modeles: Exercice[], etoiles: string[] = []) => {
      setSeances((precedentes) => [...nouvelles, ...precedentes])
      setMesModeles((precedents) => [...modeles, ...precedents])
      setSeanceCouranteId(nouvelles[0]?.id)
      // Les favoris se FUSIONNENT, comme le reste : restaurer ajoute, et ne
      // doit pas retirer une etoile posee depuis sur cette machine.
      let fusionnes: string[] = []
      setFavoris((precedents) => {
        fusionnes = fusionnerFavoris(precedents, etoiles)
        return fusionnes
      })
      try {
        for (const seance of nouvelles) await depot.current?.enregistrerSeance(seance)
        for (const modele of modeles) await depot.current?.enregistrerModele(modele)
        await depot.current?.enregistrerFavoris(fusionnes)
        setEtatSauvegarde('enregistre')
      } catch {
        setEtatSauvegarde('erreur')
      }
    },
    [],
  )

  const seanceCourante = seances.find((s) => s.id === seanceCouranteId)

  return {
    seances,
    seanceCourante,
    seanceCouranteId,
    setSeanceCouranteId,
    chargement,
    moyenStockage,
    etatSauvegarde,
    majSeance,
    ajouterSeance,
    supprimerSeance,
    mesModeles,
    favoris,
    basculerFavori: basculerFavoriDe,
    restaurer,
    enregistrerModele,
    supprimerModele,
  }
}
