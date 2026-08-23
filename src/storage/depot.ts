/**
 * Couche de persistance.
 *
 * L'interface Depot isole le reste de l'application du moyen de stockage.
 * Aujourd'hui : IndexedDB (navigateur). Demain, dans une enveloppe Tauri :
 * des fichiers .json sur le disque. Seule une nouvelle implementation de cette
 * interface sera necessaire, aucun composant n'a besoin de changer.
 */

import type { Exercice, Seance } from '../domain/types'

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
  /** Verifie que le stockage est reellement utilisable (mode file://, navigation privee...). */
  verifierDisponibilite(): Promise<boolean>
}

const NOM_BASE = 'handball-training'
// Version 2 : ajout du magasin de la bibliotheque personnelle.
const VERSION_BASE = 2
const MAGASIN_SEANCES = 'seances'
const MAGASIN_MODELES = 'modeles'
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
