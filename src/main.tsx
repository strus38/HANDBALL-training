import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { FournisseurDeDialogues } from './ui/Dialogue'
import { poserLesCouleursDuClub } from './ui/couleurs'
import './ui/styles.css'

// Avant tout rendu : l'interface se peint deja aux couleurs du club.
poserLesCouleursDuClub()

const racine = document.getElementById('root')
if (!racine) throw new Error('Élément #root introuvable')

createRoot(racine).render(
  <StrictMode>
    <FournisseurDeDialogues>
      <App />
    </FournisseurDeDialogues>
  </StrictMode>,
)
