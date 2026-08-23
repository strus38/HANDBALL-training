/**
 * Pilote de navigateur minimal, par le protocole DevTools.
 *
 * Sert au test de fumee : ouvrir le livrable `dist/index.html` dans un vrai
 * navigateur, et verifier ce que les tests de domaine ne peuvent pas voir —
 * la mise en page imprimee, la superposition des colonnes, l'animation.
 *
 * Aucune dependance : Edge est present sur toute machine Windows, Node fournit
 * WebSocket depuis la version 22. Ajouter Playwright pour cela couterait
 * plusieurs centaines de megaoctets a un projet qui tient en un fichier.
 */

import { spawn } from 'node:child_process'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const EXECUTABLES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
]

async function trouverExecutable() {
  const { access } = await import('node:fs/promises')
  for (const chemin of EXECUTABLES) {
    try {
      await access(chemin)
      return chemin
    } catch {
      // Executable absent : on essaie le suivant.
    }
  }
  return undefined
}

/**
 * Lance un navigateur sans interface et s'y connecte.
 *
 * Renvoie `undefined` si aucun navigateur n'est installe : le test de fumee se
 * signale alors comme ignore, plutot que de faire echouer toute la
 * verification sur une machine qui n'en a pas.
 */
export async function ouvrirNavigateur() {
  const executable = await trouverExecutable()
  if (!executable) return undefined

  const profil = await mkdtemp(join(tmpdir(), 'hbpsm-'))
  const processus = spawn(executable, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    // Indispensable : le livrable est ouvert en file://, comme le fera
    // l'entraineur en double-cliquant dessus.
    '--allow-file-access-from-files',
    `--user-data-dir=${profil}`,
    '--remote-debugging-port=0',
    'about:blank',
  ])

  const adresse = await attendreAdresse(processus)
  const ws = new WebSocket(adresse)
  await new Promise((ok, ko) => {
    ws.addEventListener('open', ok, { once: true })
    ws.addEventListener('error', () => ko(new Error('Connexion DevTools impossible')), { once: true })
  })

  let numero = 0
  const attentes = new Map()
  let session

  ws.addEventListener('message', (evenement) => {
    const message = JSON.parse(evenement.data)
    // Les reponses d'une session arrivent enveloppees dans Target.receivedMessageFromTarget
    // sur les vieux protocoles ; ici on utilise les sessions plates.
    const attente = attentes.get(message.id)
    if (!attente) return
    attentes.delete(message.id)
    if (message.error) attente.ko(new Error(message.error.message))
    else attente.ok(message.result)
  })

  const envoyer = (methode, parametres = {}, avecSession = true) =>
    new Promise((ok, ko) => {
      const id = ++numero
      attentes.set(id, { ok, ko })
      const message = { id, method: methode, params: parametres }
      if (avecSession && session) message.sessionId = session
      ws.send(JSON.stringify(message))
      setTimeout(() => {
        if (attentes.delete(id)) ko(new Error(`Delai depasse : ${methode}`))
      }, 30_000)
    })

  // Une cible = un onglet. On s'y attache en session plate.
  const cible = await envoyer('Target.createTarget', { url: 'about:blank' }, false)
  const attache = await envoyer(
    'Target.attachToTarget',
    { targetId: cible.targetId, flatten: true },
    false,
  )
  session = attache.sessionId
  await envoyer('Page.enable')
  await envoyer('Runtime.enable')

  return {
    envoyer,

    /** Charge une URL et attend que la page soit prete. */
    async aller(url) {
      await envoyer('Page.navigate', { url })
      await new Promise((r) => setTimeout(r, 900))
    },

    /** Evalue une expression dans la page et renvoie sa valeur. */
    async evaluer(expression) {
      const reponse = await envoyer('Runtime.evaluate', {
        expression: `(async () => { ${expression} })()`,
        awaitPromise: true,
        returnByValue: true,
      })
      if (reponse.exceptionDetails) {
        throw new Error(
          reponse.exceptionDetails.exception?.description ??
            reponse.exceptionDetails.text ??
            'Erreur dans la page',
        )
      }
      return reponse.result.value
    },

    /** Change la taille de la fenetre simulee. */
    async dimensionner(largeur, hauteur, tactile = false) {
      await envoyer('Emulation.setDeviceMetricsOverride', {
        width: largeur,
        height: hauteur,
        deviceScaleFactor: 1,
        mobile: tactile,
      })
      await new Promise((r) => setTimeout(r, 350))
    },

    /** Bascule la page en media d'impression, pour mesurer ce que verra le papier. */
    async modeImpression(actif) {
      await envoyer('Emulation.setEmulatedMedia', { media: actif ? 'print' : '' })
      await new Promise((r) => setTimeout(r, 350))
    },

    /** Imprime en PDF et renvoie le nombre de pages produites. */
    async nombreDePages() {
      const { data } = await envoyer('Page.printToPDF', {
        landscape: true,
        printBackground: true,
        paperWidth: 11.69,
        paperHeight: 8.27,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 0,
        marginRight: 0,
        preferCSSPageSize: true,
      })
      const pdf = Buffer.from(data, 'base64').toString('latin1')
      // Le catalogue du PDF porte le compte des pages ; a defaut on compte les
      // objets de type Page.
      const compte = [...pdf.matchAll(/\/Count\s+(\d+)/g)].map((m) => Number(m[1]))
      if (compte.length > 0) return Math.max(...compte)
      return (pdf.match(/\/Type\s*\/Page[^s]/g) ?? []).length
    },

    async fermer() {
      try {
        ws.close()
        processus.kill()
      } catch {
        // Le processus a deja pu s'arreter.
      }
      await rm(profil, { recursive: true, force: true }).catch(() => {})
    },
  }
}

/** Lit sur la sortie d'erreur l'adresse DevTools annoncee au demarrage. */
function attendreAdresse(processus) {
  return new Promise((ok, ko) => {
    let tampon = ''
    const minuterie = setTimeout(
      () => ko(new Error('Le navigateur n a pas annonce son adresse DevTools')),
      20_000,
    )
    processus.stderr.on('data', (morceau) => {
      tampon += morceau.toString()
      const trouve = tampon.match(/ws:\/\/[^\s]+/)
      if (trouve) {
        clearTimeout(minuterie)
        ok(trouve[0])
      }
    })
    processus.on('error', ko)
  })
}
