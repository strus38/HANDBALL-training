/**
 * Le seul acces a internet de l'application.
 *
 * L'application fonctionne au gymnase, sans reseau, et doit continuer : rien
 * d'autre que ce module ne telecharge quoi que ce soit, et il ne sert qu'au
 * tableau de bord du club, quand l'entraineur clique sur son bouton. Un club
 * sans tableau de bord ne l'appelle jamais.
 *
 * L'absence de reseau est annoncee AVANT d'essayer, comme pour la dictee :
 * un « erreur de chargement » ne dirait pas a l'entraineur que c'est la
 * connexion qui manque.
 */

export class ErreurReseau extends Error {}

export async function telechargerTexte(adresse: string): Promise<string> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new ErreurReseau(
      'Pas de connexion internet. Le reste de l’application fonctionne sans réseau ; ' +
        'seule la récupération de la séance du tableau de bord en a besoin.',
    )
  }
  let reponse: Response
  try {
    // Sans cache : la seance de la semaine remplace celle de la semaine passee.
    reponse = await fetch(adresse, { cache: 'no-store' })
  } catch {
    throw new ErreurReseau('Le tableau de bord est injoignable : vérifiez la connexion internet.')
  }
  if (!reponse.ok) {
    throw new ErreurReseau(`Le tableau de bord n’a pas répondu (erreur ${reponse.status}).`)
  }
  return reponse.text()
}
