/**
 * Choix du depot au demarrage.
 *
 * On essaie dans l'ordre : IndexedDB (capacite illimitee en pratique), puis
 * localStorage (environ 5 Mo), puis rien du tout. Le comportement des
 * navigateurs varie selon la maniere dont le fichier est ouvert (http, file://,
 * navigation privee) : plutot que de le supposer, on le teste a l'execution.
 */

import { depotIndexedDB, type Depot } from './depot'
import { depotLocalStorage } from './depotLocal'

export type MoyenStockage = 'indexeddb' | 'localstorage' | 'aucun'

export interface DepotChoisi {
  depot: Depot | undefined
  moyen: MoyenStockage
}

export const LIBELLES_STOCKAGE: Record<MoyenStockage, string> = {
  indexeddb: 'Sauvegarde automatique active',
  localstorage: 'Sauvegarde automatique active (capacite reduite)',
  aucun: 'Sauvegarde automatique indisponible',
}

export async function choisirDepot(): Promise<DepotChoisi> {
  if (await depotIndexedDB.verifierDisponibilite()) {
    return { depot: depotIndexedDB, moyen: 'indexeddb' }
  }
  if (await depotLocalStorage.verifierDisponibilite()) {
    return { depot: depotLocalStorage, moyen: 'localstorage' }
  }
  return { depot: undefined, moyen: 'aucun' }
}
