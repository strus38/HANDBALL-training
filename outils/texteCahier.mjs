/**
 * Les regles de texte de l'importation de cahiers, isolees et testables.
 *
 * Pourquoi ce fichier existe a part : ces quatre regles sont de pures fonctions
 * de chaine, et ce sont elles qui se sont trompees. La ligature protegeant
 * « défi » laissait passer « défi nir » ; la puce du cahier recopiee dans le
 * texte en faisait apparaitre deux a l'ecran ; le trait d'union de fin de ligne
 * donnait « Interne- Externe ». Chacune se prouve en trois lignes de test, a
 * condition de pouvoir l'appeler sans ouvrir un PDF.
 *
 * Le reste de l'importation — positions, colonnes, bandeau — reste dans
 * importerCahier.mjs : il ne se teste qu'avec un vrai document.
 */

/**
 * Mots francais qui se terminent vraiment par une ligature.
 *
 * Le cahier encode « ﬁ » suivi d'une espace : le PDF contient reellement
 * « enfi n », « fi xer », « profi tant ». On recolle donc systematiquement —
 * sauf derriere ces mots-la, ou l'espace est legitime.
 *
 * « défi » N'Y FIGURE PAS, volontairement : dans ce corpus il n'apparait qu'en
 * tete de « défi nir » et « défi cile ». L'y mettre laissait passer les deux.
 * Le nom « un défi » suivi d'un mot en minuscule serait mal recolle — c'est le
 * compromis assume, dans le sens ou il se trompe le moins souvent.
 */
export const MOTS_EN_LIGATURE = /(?:^|[^a-zàâäéèêëîïôöùûüç])(bluff|off|surf)$/i

/**
 * Mots qui ne peuvent pas ouvrir un article de materiel.
 *
 * Une cellule du bandeau tient sur plusieurs lignes, et rien ne dit si une
 * ligne commence un nouvel article ou continue le precedent. « 8 plots » puis
 * « réserve de ballons » sont deux articles ; « 1 réserve de ballon près »
 * puis « du Demi-Centre passeur » n'en font qu'un. Ce sont les mots
 * grammaticaux qui les separent : aucun article ne commence par « du ».
 */
export const SUITE_DE_LIGNE =
  /^(?:du|de|des|d[’']|par|pour|près|pres|et|à|a|au|aux|en|le|la|les|sur)\b/i

/**
 * Recolle les mots coupes par une ligature.
 *
 * Le PDF n'est pas mal extrait : il contient REELLEMENT « Et enfi n ». Le
 * glyphe ﬁ y est suivi d'une espace, et l'artefact traverse toute la collection
 * de cahiers du meme editeur. On le repare une fois ici plutot que vingt fois a
 * la main dans chaque fiche.
 */
export function reparerLigatures(texte) {
  return texte.replace(
    /([a-zàâäéèêëîïôöùûüç]*(?:ffi|ff|fi|fl)) ([a-zàâäéèêëîïôöùûüç])/g,
    (tout, avant, apres, position, source) => {
      const debut = source.slice(0, position + avant.length)
      return MOTS_EN_LIGATURE.test(debut) ? tout : avant + apres
    },
  )
}

/**
 * Ajoute un fragment a une cellule deja commencee.
 *
 * Un mot coupe en fin de ligne laisse un trait d'union : « Interne- » puis
 * « Externe ». Les recoller avec une espace donnait « Interne- Externe ».
 */
export function accoler(deja, ajout) {
  if (!deja) return ajout
  return deja.endsWith('-') ? deja + ajout : `${deja} ${ajout}`
}

/**
 * Recolle les lignes d'un paragraphe en elements.
 *
 * Une puce « • » ouvre un element ; les lignes suivantes le continuent. Sans ce
 * recollage, chaque retour a la ligne du PDF devenait un retour a la ligne dans
 * la fiche, et une regulation de trois points en comptait douze.
 *
 * La puce du cahier sert a DECOUPER, elle ne se recopie pas. Le texte d'une
 * fiche ne porte aucune decoration, ici comme dans les 62 fiches livrees : un
 * element par ligne, et c'est l'application qui pose la puce a l'affichage.
 * Recopier celle du cahier en faisait apparaitre deux dans l'apercu de la
 * bibliotheque, ou les points cles sont rendus en liste, et une puce en toutes
 * lettres sur la feuille imprimee.
 */
export function recoller(lignes) {
  const sorties = []
  for (const ligne of lignes) {
    const t = (typeof ligne === 'string' ? ligne : ligne.texte).trim()
    if (!t) continue
    const commence = /^[•\-–—]/.test(t) || sorties.length === 0
    if (commence) sorties.push(t.replace(/^[•\-–—]\s*/, ''))
    else sorties[sorties.length - 1] += ' ' + t
  }
  return sorties.join('\n')
}
