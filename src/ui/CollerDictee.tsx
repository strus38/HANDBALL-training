/**
 * Recevoir un bloc de texte dicte sur le telephone.
 *
 * C'est la voie qui marche vraiment partout, y compris dans un gymnase sans
 * reseau : la dictee d'un telephone tourne SUR L'APPAREIL, elle est gratuite,
 * et elle connait mieux le francais que ce qu'un navigateur peut faire tourner
 * hors ligne. L'entraineur dicte dans ses notes, puis colle ici.
 *
 * La fenetre ne lit pas le presse-papiers toute seule. Elle ouvre un champ ou
 * l'on colle a la main : demander la permission de lire le presse-papiers pour
 * un geste que Ctrl+V fait deja serait une demande de plus a comprendre, pour
 * rien - et cette permission est refusee quand la page est ouverte depuis un
 * fichier, c'est-a-dire dans le mode de livraison de l'application.
 *
 * Ce qui est montre AVANT d'agir : la repartition proposee. L'entraineur voit
 * ou son texte va atterrir, et peut choisir de tout mettre dans un seul champ.
 */

import { useState } from 'react'
import {
  champsReconnus,
  repartirTexteDicte,
  type ChampDicte,
  type TexteReparti,
} from '../domain/dictee'

const NOMS: Record<ChampDicte, string> = {
  objectifs: 'Objectifs',
  misePlace: 'Mise en place',
  fonctionnement: 'Fonctionnement',
  regulation: 'Régulation',
  pointsCles: 'Points clés',
  evolution: 'Évolution',
}

interface Props {
  onAppliquer: (reparti: TexteReparti) => void
  onFermer: () => void
}

export function CollerDictee({ onAppliquer, onFermer }: Props) {
  const [texte, setTexte] = useState('')

  const propre = texte.trim()
  const reparti = repartirTexteDicte(texte)
  const reconnus = champsReconnus(texte)

  return (
    <div className="voile" onClick={onFermer}>
      <div
        className="modale coller-dictee"
        role="dialog"
        aria-label="Coller un texte dicté"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modale-entete">
          <h2>Coller un texte dicté</h2>
          <button className="bouton discret" onClick={onFermer} title="Fermer">
            ✕
          </button>
        </header>

        <div className="corps-coller">
          <p className="explication-dictee">
            Dictez dans les notes de votre téléphone — cette dictée-là fonctionne{' '}
            <strong>sans connexion</strong> et connaît le français — puis collez le texte ici
            avec Ctrl+V.
          </p>

          <textarea
            className="zone-collage"
            rows={10}
            autoFocus
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            placeholder={
              'Collez ici.\n\n' +
              'Astuce : si vous dictez « mise en place », « déroulement » ou « points clés »' +
              ' avant chaque partie, le texte se range tout seul dans les bons champs.'
            }
          />

          {propre && (
            <p className="apercu-repartition">
              {reconnus.length > 0 ? (
                <>
                  <strong>Sera réparti dans :</strong>{' '}
                  {reconnus.map((c) => NOMS[c]).join(', ')}.
                </>
              ) : (
                <>
                  <strong>Aucun intitulé reconnu :</strong> tout ira dans le fonctionnement, d'un
                  bloc. On ne devine pas — un paragraphe rangé au jugement se retrouve là où
                  personne ne le cherche.
                </>
              )}
            </p>
          )}

          {/*
            Le fonctionnement n est pas un champ comme les autres : c est le
            seul que l application sache relire pour proposer les deplacements
            sur le terrain. On le dit ici, la ou le texte vient d arriver.
          */}
          {propre && (reparti.fonctionnement ?? '') !== '' && (
            <p className="suite-collage">
              Une fois le déroulement en place, le menu <strong>⋯</strong> du terrain propose
              les déplacements qu il y reconnaît.
            </p>
          )}
        </div>

        <div className="actions-modale">
          <button className="bouton" onClick={onFermer}>
            Annuler
          </button>
          <button
            className="bouton"
            disabled={!propre || reconnus.length === 0}
            onClick={() => onAppliquer({ fonctionnement: propre })}
            title="Ignorer les intitulés et tout mettre dans le fonctionnement"
          >
            Tout dans le fonctionnement
          </button>
          <button
            className="bouton principal"
            disabled={!propre}
            onClick={() => onAppliquer(reparti)}
          >
            {reconnus.length > 0 ? 'Répartir dans les champs' : 'Ajouter au fonctionnement'}
          </button>
        </div>
      </div>
    </div>
  )
}
