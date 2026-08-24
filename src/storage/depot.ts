/**
 * Couche de persistance.
 *
 * L'interface Depot isole le reste de l'application du moyen de stockage.
 * Aujourd'hui : IndexedDB (navigateur). Demain, dans une enveloppe Tauri :
 * des fichiers .json sur le disque. Seule une nouvelle implementation de cette
 * interface sera necessaire, aucun composant n'a besoin de changer.
 */

import type { Exercice, Seance } from '../domain/types'
import { lireFavoris } from '../domain/favoris'
import { lireMasquees } from '../domain/masquees'
import { AUCUNE_EQUIPE, lireMonEquipe, type MonEquipe } from '../domain/equipe'

export interface Depot {
  /** Toutes les seances, de la plus recemment modifiee a la plus ancienne. */
  listerSeances(): Promise<Seance[]>
  lireSeance(id: string): Promise<Seance | undefined>
  enregistrerSeance(seance: Seance): Promise<void>
  supprimerSeance(id: string): Promise<void>
  /**
   * Bibliotheque personnelle : les exercices crees par l'entraineur, conserves
   * independamment des seances pour etre reutilises de l'une a l'autre.
   */
  listerModeles(): Promise<Exercice[]>
  enregistrerModele(exercice: Exercice): Promise<void>
 supprimerModele(id: string): Promise<void>
  /**
   * Favoris : les cles des fiches que l entraineur veut retrouver vite.
   *
   * Une preference, pas une donnee de seance. Elle est rangee a part pour ne
   * pas alourdir chaque seance d une information qui ne la concerne pas.
   */
  lireFavoris(): Promise<string[]>
  enregistrerFavoris(favoris: string[]): Promise<void>
  /**
   * Fiches fournies masquees : references retirees de la bibliotheque de base.
   *
   * Meme nature que les favoris — une preference designant des fiches par leur
   * reference stable — et donc meme rangement, a part des seances.
   */
  lireMasquees(): Promise<string[]>
  enregistrerMasquees(masquees: string[]): Promise<void>
  /**
   * L equipe que l entraineur suit cette saison.
   *
   * Troisieme preference rangee ici, pour la meme raison que les deux autres :
   * elle appartient a l entraineur, pas a une seance, et n a donc rien a faire
   * repetee dans chacune d elles.
   */
  lireMonEquipe(): Promise<MonEquipe>
  enregistrerMonEquipe(equipe: MonEquipe): Promise<void>
  /** Verifie que le stockage est reellement utilisable (mode file://, navigation privee...). */
  verifierDisponibilite(): Promise<boolean>
}

const NOM_BASE = 'handball-training'
// Version 2 : ajout du magasin de la bibliotheque personnelle.
// Version 3 : ajout du magasin des preferences (favoris).
const VERSION_BASE = 3
const MAGASIN_SEANCES = 'seances'
const MAGASIN_MODELES = 'modeles'
const MAGASIN_PREFERENCES = 'preferences'
const CLE_FAVORIS = 'favoris'
const CLE_MASQUEES = 'fiches-masquees'
const CLE_EQUIPE = 'mon-equipe'
/**
 * Au-dela, on considere qu'IndexedDB ne repondra pas et on passe au depot
 * suivant. Mieux vaut une sauvegarde en localStorage qu'une application qui
 * ne demarre pas.
 */
const DELAI_SONDE = 1500

function ouvrir(): Promise<IDBDatabase> {
  return new Promise((resoudre, rejeter) => {
    const requete = indexedDB.open(NOM_BASE, VERSION_BASE)
    requete.onupgradeneeded = () => {
      const base = requete.result
      if (!base.objectStoreNames.contains(MAGASIN_SEANCES)) {
        const magasin = base.createObjectStore(MAGASIN_SEANCES, { keyPath: 'id' })
        magasin.createIndex('modifieLe', 'modifieLe')
      }
      // Ajoute sans toucher aux seances deja enregistrees : une base creee par
      // la version precedente se met a jour sans perte.
      if (!base.objectStoreNames.contains(MAGASIN_MODELES)) {
        base.createObjectStore(MAGASIN_MODELES, { keyPath: 'id' })
      }
      // Meme regle : la montee de version 2 vers 3 ajoute ce magasin sans
      // toucher aux seances ni aux modeles deja enregistres.
      if (!base.objectStoreNames.contains(MAGASIN_PREFERENCES)) {
        base.createObjectStore(MAGASIN_PREFERENCES, { keyPath: 'cle' })
      }
    }
    requete.onsuccess = () => resoudre(requete.result)
    requete.onerror = () => rejeter(requete.error ?? new Error('Ouverture IndexedDB impossible'))
    requete.onblocked = () => rejeter(new Error('Base bloquee par un autre onglet'))
  })
}

function transaction<T>(
  magasin: string,
  mode: IDBTransactionMode,
  action: (magasin: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return ouvrir().then(
    (base) =>
      new Promise<T>((resoudre, rejeter) => {
        const tx = base.transaction(magasin, mode)
        const requete = action(tx.objectStore(magasin))
        requete.onsuccess = () => resoudre(requete.result)
        requete.onerror = () => rejeter(requete.error ?? new Error('Operation IndexedDB echouee'))
        tx.oncomplete = () => base.close()
      }),
  )
}

export const depotIndexedDB: Depot = {
  async listerSeances() {
    const seances = await transaction<Seance[]>(MAGASIN_SEANCES, 'readonly', (m) => m.getAll())
    return seances.sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
  },

  lireSeance(id) {
    return transaction<Seance | undefined>(MAGASIN_SEANCES, 'readonly', (m) => m.get(id))
  },

  async enregistrerSeance(seance) {
    await transaction(MAGASIN_SEANCES, 'readwrite', (m) => m.put(seance))
  },

  async supprimerSeance(id) {
    await transaction(MAGASIN_SEANCES, 'readwrite', (m) => m.delete(id))
  },

  async listerModeles() {
    const modeles = await transaction<Exercice[]>(MAGASIN_MODELES, 'readonly', (m) => m.getAll())
    return modeles.sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
  },

  async enregistrerModele(exercice) {
    await transaction(MAGASIN_MODELES, 'readwrite', (m) => m.put(exercice))
  },

  async supprimerModele(id) {
    await transaction(MAGASIN_MODELES, 'readwrite', (m) => m.delete(id))
  },

  async lireFavoris() {
    // Une base creee par la version 2 n'a pas ce magasin tant qu'elle n'a pas
    // ete rouverte en version 3 ; et une lecture qui echoue ne doit jamais
    // empecher l'application de demarrer. Sans favoris vaut mieux que rien.
    try {
      const enregistrement = await transaction<{ cle: string; valeur: unknown } | undefined>(
        MAGASIN_PREFERENCES,
        'readonly',
        (m) => m.get(CLE_FAVORIS),
      )
      return lireFavoris(enregistrement?.valeur)
    } catch {
      return []
    }
  },

  async enregistrerFavoris(favoris) {
    await transaction(MAGASIN_PREFERENCES, 'readwrite', (m) =>
      m.put({ cle: CLE_FAVORIS, valeur: favoris }),
    )
  },

  async lireMasquees() {
    // Meme tolerance que les favoris : une lecture qui echoue ne doit jamais
    // empecher l'application de demarrer. Sans liste vaut mieux que rien.
    try {
      const enregistrement = await transaction<{ cle: string; valeur: unknown } | undefined>(
        MAGASIN_PREFERENCES,
        'readonly',
        (m) => m.get(CLE_MASQUEES),
      )
      return lireMasquees(enregistrement?.valeur)
    } catch {
      return []
    }
  },

  async enregistrerMasquees(masquees) {
    await transaction(MAGASIN_PREFERENCES, 'readwrite', (m) =>
      m.put({ cle: CLE_MASQUEES, valeur: masquees }),
    )
  },

  async lireMonEquipe() {
    // Meme tolerance que les favoris : une lecture qui echoue ne doit jamais
    // empecher l'application de demarrer. Sans equipe vaut mieux que rien.
    try {
      const enregistrement = await transaction<{ cle: string; valeur: unknown } | undefined>(
        MAGASIN_PREFERENCES,
        'readonly',
        (m) => m.get(CLE_EQUIPE),
      )
      return lireMonEquipe(enregistrement?.valeur)
    } catch {
      return AUCUNE_EQUIPE
    }
  },

  async enregistrerMonEquipe(equipe) {
    await transaction(MAGASIN_PREFERENCES, 'readwrite', (m) =>
      m.put({ cle: CLE_EQUIPE, valeur: equipe }),
    )
  },

  async verifierDisponibilite() {
    try {
      if (typeof indexedDB === 'undefined') return false
      // Certains contextes laissent open() en attente INDEFINIE : ni succes,
      // ni erreur, ni blocked. Sans delai maximum, choisirDepot() ne rend
      // jamais la main et l'application reste bloquee sur « Chargement... ».
      // Le cas se produit reellement, notamment dans un navigateur pilote.
      const base = await Promise.race([
        ouvrir(),
        new Promise<undefined>((resoudre) => setTimeout(() => resoudre(undefined), DELAI_SONDE)),
      ])
      if (!base) return false
      base.close()
      return true
    } catch {
      return false
    }
  },
}
