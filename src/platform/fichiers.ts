/**
 * Adaptateur d'entrees / sorties fichiers.
 *
 * Implementation navigateur : telechargement via un lien blob, lecture via un
 * champ <input type="file">. Une future enveloppe Tauri fournira la meme
 * interface avec les boites de dialogue natives du systeme.
 */

export interface AdaptateurFichiers {
  telecharger(nomFichier: string, contenu: string, typeMime?: string): void
  choisirFichier(accept: string): Promise<{ nom: string; texte: string } | undefined>
}

/** Rend un titre utilisable comme nom de fichier. */
export function nomDeFichierSur(titre: string, extension: string): string {
  const base =
    titre
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'sans-titre'
  return `${base}${extension}`
}

export const fichiersNavigateur: AdaptateurFichiers = {
  telecharger(nomFichier, contenu, typeMime = 'application/json') {
    const blob = new Blob([contenu], { type: `${typeMime};charset=utf-8` })
    const url = URL.createObjectURL(blob)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = nomFichier
    document.body.appendChild(lien)
    lien.click()
    document.body.removeChild(lien)
    // Laisse au navigateur le temps de demarrer le telechargement.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  },

  choisirFichier(accept) {
    return new Promise((resoudre) => {
      const champ = document.createElement('input')
      champ.type = 'file'
      champ.accept = accept
      champ.style.display = 'none'
      document.body.appendChild(champ)

      const terminer = (resultat: { nom: string; texte: string } | undefined) => {
        champ.remove()
        resoudre(resultat)
      }

      champ.onchange = async () => {
        const fichier = champ.files?.[0]
        if (!fichier) return terminer(undefined)
        terminer({ nom: fichier.name, texte: await fichier.text() })
      }
      // Si l'utilisateur annule, aucun evenement change n'est emis : on libere
      // le champ au retour du focus sur la fenetre.
      window.addEventListener(
        'focus',
        () => setTimeout(() => { if (!champ.files?.length) terminer(undefined) }, 500),
        { once: true },
      )
      champ.click()
    })
  },
}
