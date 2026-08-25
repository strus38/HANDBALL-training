/**
 * Adaptateur d'entrees / sorties fichiers.
 *
 * OU VA LE FICHIER ? C'est toute la question, et elle n'est pas technique.
 *
 * Un lien de telechargement depose le fichier dans le dossier « Telechargements »
 * du navigateur, sans rien demander et sans le dire. Pour un entraineur qui
 * range son application sur une cle USB — c'est un usage courant, et l'une des
 * raisons d'etre du fichier unique — la sauvegarde atterrit donc sur
 * l'ordinateur du moment, pas sur sa cle. Il la croit a l'abri ; elle est
 * restee derriere lui.
 *
 * L'API File System Access ouvre au contraire la vraie boite « Enregistrer
 * sous » du systeme. L'entraineur voit ou il enregistre, et Chrome retient le
 * dernier dossier utilise pour cet usage : la fois suivante, la boite s'ouvre
 * deja sur sa cle.
 *
 * Verifie dans un vrai navigateur : l'API est disponible sur une page ouverte
 * en file://, contrairement a ce qu'on pourrait craindre d'une origine aussi
 * particuliere. Le temoin est une iframe sandbox, ou le meme appel rend
 * SecurityError la ou la page en file:// rend AbortError — la verification
 * d'origine passe donc bien, et c'est seulement la boite qui ne s'ouvre pas
 * dans un navigateur sans interface.
 *
 * La ou l'API manque (Firefox, Safari), on retombe sur le lien : le fichier
 * part dans les telechargements, et l'application le DIT plutot que de laisser
 * l'entraineur le chercher.
 */

/** Ce qui est reellement arrive au fichier. L'appelant doit savoir. */
export type ResultatEnregistrement =
  /** Ecrit la ou l'entraineur l'a demande. */
  | 'enregistre'
  /** L'entraineur a ferme la boite : rien n'a ete ecrit, et rien n'est promis. */
  | 'annule'
  /** Parti dans le dossier des telechargements, faute de mieux. */
  | 'telecharge'

export interface AdaptateurFichiers {
  enregistrer(
    nomFichier: string,
    contenu: string,
    typeMime?: string,
  ): Promise<ResultatEnregistrement>
  choisirFichier(accept: string): Promise<{ nom: string; texte: string } | undefined>
}

/**
 * Le peu de l'API File System Access dont on se sert.
 *
 * Decrite ici plutot qu'installee avec les types du navigateur : elle n'existe
 * pas partout, et une declaration locale dit exactement ce sur quoi on
 * s'appuie.
 */
interface Enregistreur {
  (options: {
    suggestedName?: string
    /** Chrome retient un dernier dossier PAR identifiant d'usage. */
    id?: string
    types?: { description: string; accept: Record<string, string[]> }[]
  }): Promise<{ createWritable(): Promise<{ write(d: string): Promise<void>; close(): Promise<void> }> }>
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

/** Depot dans le dossier des telechargements : la voie de repli. */
function telechargerParLien(nomFichier: string, contenu: string, typeMime: string): void {
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
}

export const fichiersNavigateur: AdaptateurFichiers = {
  async enregistrer(nomFichier, contenu, typeMime = 'application/json') {
    const choisir = (window as unknown as { showSaveFilePicker?: Enregistreur })
      .showSaveFilePicker
    if (typeof choisir === 'function') {
      try {
        const poignee = await choisir({
          suggestedName: nomFichier,
          // Un identifiant STABLE, et le meme pour toutes les sauvegardes de
          // l'application : c'est lui qui fait revenir la boite dans le dossier
          // choisi la derniere fois. En changer reviendrait a repartir du
          // dossier des telechargements a chaque version livree.
          id: 'hbpsm',
          types: [
            {
              description: 'Fichier HBPSM',
              accept: { 'application/json': ['.json'] },
            },
          ],
        })
        const flux = await poignee.createWritable()
        await flux.write(contenu)
        await flux.close()
        return 'enregistre'
      } catch (erreur) {
        // Fermer la boite n'est pas une panne : c'est une decision, et elle
        // doit remonter telle quelle. Confondre les deux ferait annoncer une
        // sauvegarde qui n'a pas eu lieu.
        if ((erreur as { name?: string })?.name === 'AbortError') return 'annule'
        // Toute autre panne : plutot que de laisser l'entraineur sans fichier,
        // on repasse par le telechargement.
      }
    }
    telechargerParLien(nomFichier, contenu, typeMime)
    return 'telecharge'
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
