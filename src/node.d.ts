/**
 * Le peu de Node dont la CONFIGURATION DE BUILD a besoin.
 *
 * `vite.config.ts` lit `package.json` et interroge git pour estampiller le
 * fichier livre avec sa version. Ces deux appels tournent sur la machine qui
 * fabrique, jamais dans le navigateur.
 *
 * Pourquoi ces quelques lignes plutot que `@types/node` : le paquet complet
 * pese des milliers de declarations et ferait entrer tout l'univers Node dans
 * un projet qui n'en utilise pas une ligne cote application. Ici, la surface
 * declaree est exactement celle qui est employee - si le build se met a
 * appeler autre chose, TypeScript le signalera au lieu de le laisser passer.
 */

declare module 'node:child_process' {
  export function execSync(
    commande: string,
    options?: { stdio?: readonly ('ignore' | 'pipe' | 'inherit')[] },
  ): { toString(): string }
}

declare module 'node:fs' {
  export function readFileSync(chemin: string, encodage: 'utf8'): string
}
