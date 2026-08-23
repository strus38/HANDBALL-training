/**
 * Conversion du sous-ensemble de Markdown utilise par LISEZMOI.md.
 *
 * Volontairement limite a ce que le document contient reellement : titres,
 * paragraphes, listes (a puces, numerotees, a cases a cocher), tableaux, blocs
 * de code, et en ligne le gras, le code et les liens. Ecrire ces quelques
 * regles coute moins cher qu'ajouter une dependance a un projet qui tient a
 * fonctionner hors ligne et a s'installer sans rien telecharger.
 *
 * Toute construction non prevue traverse comme du texte : rien ne casse, mais
 * le rendu sera plat. En ajouter une se fait ici, et se teste dans
 * tests/notice.test.mjs.
 */

/**
 * Marque posee sous un titre, dans LISEZMOI.md, pour retirer sa section de la
 * notice HTML : celle-ci est destinee aux entraineurs, pas aux developpeurs.
 * Le commentaire HTML est invisible dans le Markdown rendu, LISEZMOI.md reste
 * donc complet et lisible tel quel.
 */
const MARQUE = /^<!--\s*notice:developpeur\s*-->$/

/**
 * Retire les sections reservees au developpement.
 *
 * Une section marquee disparait avec tout ce qu'elle contient jusqu'au titre
 * suivant de meme niveau ou de niveau superieur : marquer un `##` emporte donc
 * ses `###`, sans avoir a les marquer un par un.
 */
export function pourLesCoachs(markdown) {
  const lignes = markdown.replace(/\r\n/g, '\n').split('\n')
  const gardees = []
  let niveauIgnore = 0

  for (let i = 0; i < lignes.length; i++) {
    const titre = lignes[i].match(/^(#{1,6})\s/)
    if (titre) {
      const niveau = titre[1].length
      // Un titre de meme niveau ou plus haut referme la section ignoree.
      if (niveauIgnore && niveau <= niveauIgnore) niveauIgnore = 0
      if (!niveauIgnore && MARQUE.test((lignes[i + 1] ?? '').trim())) {
        niveauIgnore = niveau
        continue
      }
    }
    if (niveauIgnore) continue
    // Marque orpheline : elle ne doit pas ressortir dans le document.
    if (MARQUE.test(lignes[i].trim())) continue
    gardees.push(lignes[i])
  }

  return gardees.join('\n')
}

/**
 * Marque qui demande l'insertion d'une capture d'ecran a cet endroit :
 * <!-- notice:capture accueil -->. Comme la precedente, c'est un commentaire
 * HTML, donc invisible dans le Markdown rendu.
 *
 * La conversion ne fait que poser un emplacement vide. C'est l'appelant qui
 * decide de le remplir ou de le retirer : la notice embarquee dans
 * l'application s'en passe, le fichier a joindre les affiche.
 */
const CAPTURE = /^<!--\s*notice:capture\s+([a-z-]+)\s*-->$/

const echapper = (texte) =>
  texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Rendu du texte a l'interieur d'une ligne.
 *
 * Le code entre accents graves est mis de cote avant tout le reste : sans
 * cela, `**` ecrit dans un exemple de code deviendrait du gras.
 *
 * Le repere de remplacement est un caractere nul : il ne peut pas figurer
 * dans le document. Un numero entoure d'espaces, lui, se confondrait avec un
 * nombre du texte (« de 1 a 5 etoiles ») et ferait disparaitre des mots.
 */
export function enLigne(texte) {
  const codes = []
  let sortie = echapper(texte).replace(/`([^`]+)`/g, (_, contenu) => {
    codes.push(contenu)
    return `\u0000${codes.length - 1}\u0000`
  })

  sortie = sortie
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  return sortie.replace(/\u0000(\d+)\u0000/g, (_, index) => `<code>${codes[Number(index)]}</code>`)
}

const TITRE = /^(#{1,6})\s+(.*)$/
const PUCE = /^[-*]\s+(.*)$/
const NUMERO = /^\d+\.\s+(.*)$/
const CASE_COCHEE = /^\[([ xX])\]\s+(.*)$/

/** Une ligne qui ouvre un bloc ne peut pas etre la suite du bloc precedent. */
const ouvreUnBloc = (ligne) =>
  ligne.trim() === '' ||
  TITRE.test(ligne) ||
  PUCE.test(ligne) ||
  NUMERO.test(ligne) ||
  ligne.startsWith('```') ||
  ligne.startsWith('|') ||
  /^---+$/.test(ligne.trim())

/** Les lignes indentees prolongent l'element en cours, elles ne l'ouvrent pas. */
const estSuite = (ligne) => ligne.trim() !== '' && /^\s/.test(ligne)

function cellules(ligne) {
  return ligne
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cellule) => cellule.trim())
}

const estSeparateurDeTableau = (ligne) =>
  !!ligne && /^\|?[\s:|-]+\|[\s:|-]*$/.test(ligne) && ligne.includes('-')

export function versHtml(markdown) {
  const lignes = markdown.replace(/\r\n/g, '\n').split('\n')
  const html = []
  let i = 0

  while (i < lignes.length) {
    const ligne = lignes[i]

    if (ligne.trim() === '') {
      i++
      continue
    }

    // ------------------------------------------------------------ Code
    if (ligne.startsWith('```')) {
      const contenu = []
      i++
      while (i < lignes.length && !lignes[i].startsWith('```')) contenu.push(lignes[i++])
      i++ // la ligne de fermeture
      html.push(`<pre><code>${echapper(contenu.join('\n'))}</code></pre>`)
      continue
    }

    // -------------------------------------------------------- Captures
    const capture = ligne.trim().match(CAPTURE)
    if (capture) {
      html.push(`<figure class="capture" data-capture="${capture[1]}"></figure>`)
      i++
      continue
    }

    // ---------------------------------------------------------- Titres
    const titre = ligne.match(TITRE)
    if (titre) {
      const niveau = titre[1].length
      html.push(`<h${niveau}>${enLigne(titre[2])}</h${niveau}>`)
      i++
      continue
    }

    // -------------------------------------------------------- Tableaux
    if (ligne.startsWith('|') && estSeparateurDeTableau(lignes[i + 1])) {
      const entetes = cellules(ligne)
      i += 2
      const corps = []
      while (i < lignes.length && lignes[i].startsWith('|')) corps.push(cellules(lignes[i++]))
      const th = entetes.map((c) => `<th>${enLigne(c)}</th>`).join('')
      const trs = corps
        .map((rang) => `<tr>${rang.map((c) => `<td>${enLigne(c)}</td>`).join('')}</tr>`)
        .join('')
      html.push(`<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`)
      continue
    }

    // ---------------------------------------------------------- Listes
    const numerotee = NUMERO.test(ligne)
    if (PUCE.test(ligne) || numerotee) {
      const motif = numerotee ? NUMERO : PUCE
      const elements = []
      let cochable = false

      while (i < lignes.length && motif.test(lignes[i])) {
        let texte = lignes[i++].match(motif)[1]
        // Les lignes indentees qui suivent appartiennent au meme element.
        while (i < lignes.length && estSuite(lignes[i])) texte += ' ' + lignes[i++].trim()

        const coche = texte.match(CASE_COCHEE)
        if (coche) {
          cochable = true
          const fait = coche[1].toLowerCase() === 'x'
          elements.push(
            `<li class="tache${fait ? ' faite' : ''}">` +
              `<span class="case" aria-hidden="true">${fait ? '✔' : ''}</span>` +
              `<span>${enLigne(coche[2])}</span></li>`,
          )
        } else {
          elements.push(`<li>${enLigne(texte)}</li>`)
        }
      }

      const balise = numerotee ? 'ol' : 'ul'
      const classe = cochable ? ' class="taches"' : ''
      html.push(`<${balise}${classe}>${elements.join('')}</${balise}>`)
      continue
    }

    // ------------------------------------------------------------ Trait
    if (/^---+$/.test(ligne.trim())) {
      html.push('<hr>')
      i++
      continue
    }

    // ------------------------------------------------------- Paragraphe
    const morceaux = [ligne.trim()]
    i++
    while (i < lignes.length && !ouvreUnBloc(lignes[i])) morceaux.push(lignes[i++].trim())
    html.push(`<p>${enLigne(morceaux.join(' '))}</p>`)
  }

  return html.join('\n')
}
