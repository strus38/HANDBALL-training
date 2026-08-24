/**
 * Depot de secours base sur localStorage.
 *
 * Certains navigateurs refusent IndexedDB quand la page est ouverte directement
 * depuis le disque (file://) mais acceptent localStorage. Ce depot prend alors
 * le relais : moins de capacite (environ 5 Mo), mais la sauvegarde automatique
 * continue de fonctionner et l'entraineur ne perd pas son travail.
 */

import type { Depot } from './depot'
import type { Exercice, Seance } from '../domain/types'
import { lireFavoris } from '../domain/favoris'
import { lireMasquees } from '../domain/masquees'
import { AUCUNE_EQUIPE, lireMonEquipe } from '../domain/equipe'

const CLE = 'handball-training:seances'
const CLE_MODELES = 'handball-training:modeles'
const CLE_FAVORIS = 'handball-training:favoris'
const CLE_MASQUEES = 'handball-training:fiches-masquees'
const CLE_EQUIPE = 'handball-training:mon-equipe'
const CLE_TEST = 'handball-training:test'

function lireListe<T>(cle: string): T[] {
  try {
    const brut = localStorage.getItem(cle)
    if (!brut) return []
    const valeur: unknown = JSON.parse(brut)
    return Array.isArray(valeur) ? (valeur as T[]) : []
  } catch {
    return []
  }
}

const lireTout = () => lireListe<Seance>(CLE)

function ecrireTout(seances: Seance[]): void {
  localStorage.setItem(CLE, JSON.stringify(seances))
}

export const depotLocalStorage: Depot = {
  async listerSeances() {
    return lireTout().sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
  },

  async lireSeance(id) {
    return lireTout().find((s) => s.id === id)
  },

  async enregistrerSeance(seance) {
    const seances = lireTout()
    const index = seances.findIndex((s) => s.id === seance.id)
    if (index >= 0) seances[index] = seance
    else seances.unshift(seance)
    // Une erreur de quota remonte telle quelle : l'interface affiche alors
    // « Echec de sauvegarde » plutot que de faire croire a un enregistrement.
    ecrireTout(seances)
  },

  async supprimerSeance(id) {
    ecrireTout(lireTout().filter((s) => s.id !== id))
  },

  async listerModeles() {
    return lireListe<Exercice>(CLE_MODELES).sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
  },

  async enregistrerModele(exercice) {
    const modeles = lireListe<Exercice>(CLE_MODELES)
    const index = modeles.findIndex((m) => m.id === exercice.id)
    if (index >= 0) modeles[index] = exercice
    else modeles.unshift(exercice)
    localStorage.setItem(CLE_MODELES, JSON.stringify(modeles))
  },

  async supprimerModele(id) {
    const restants = lireListe<Exercice>(CLE_MODELES).filter((m) => m.id !== id)
    localStorage.setItem(CLE_MODELES, JSON.stringify(restants))
  },

  async lireFavoris() {
    try {
      const brut = localStorage.getItem(CLE_FAVORIS)
      return brut ? lireFavoris(JSON.parse(brut)) : []
    } catch {
      return []
    }
  },

  async enregistrerFavoris(favoris) {
    localStorage.setItem(CLE_FAVORIS, JSON.stringify(favoris))
  },

  async lireMasquees() {
    try {
      const brut = localStorage.getItem(CLE_MASQUEES)
      return brut ? lireMasquees(JSON.parse(brut)) : []
    } catch {
      return []
    }
  },

  async enregistrerMasquees(masquees) {
    localStorage.setItem(CLE_MASQUEES, JSON.stringify(masquees))
  },

  async lireMonEquipe() {
    try {
      const brut = localStorage.getItem(CLE_EQUIPE)
      return brut ? lireMonEquipe(JSON.parse(brut)) : AUCUNE_EQUIPE
    } catch {
      return AUCUNE_EQUIPE
    }
  },

  async enregistrerMonEquipe(equipe) {
    localStorage.setItem(CLE_EQUIPE, JSON.stringify(equipe))
  },

  async verifierDisponibilite() {
    try {
      if (typeof localStorage === 'undefined') return false
      localStorage.setItem(CLE_TEST, '1')
      localStorage.removeItem(CLE_TEST)
      return true
    } catch {
      return false
    }
  },
}
