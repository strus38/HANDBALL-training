/**
 * Le planning du club : qui s'entraine quand, et avec qui sur le terrain.
 *
 * Une DONNEE, pas une regle : le tableau affiche au gymnase, recopie une fois
 * pour toutes. Tout ce que l'application en tire — la date de la prochaine
 * seance, la duree du creneau, l'espace disponible, l'alerte de depassement —
 * se deduit de ces lignes, et se corrige en les modifiant.
 *
 * IL APPARTIENT AU CLUB, et c'est pourquoi il vit ici plutot que dans le
 * domaine. Il y est reste longtemps sans que cela se voie : il ne contient
 * aucun nom de club, seulement des noms d'equipes et des horaires. Un
 * exemplaire livre ailleurs aurait donc propose des seances le mardi a 17h15
 * avec des equipes qui n'existent pas dans ce club-la, et l'entraineur aurait
 * corrige la date a la main sans comprendre d'ou elle sortait.
 *
 * Deux choses meritent d'etre sues avant d'y toucher :
 *
 * - les creneaux se TOUCHENT sans trou. C'est ce qui permet de dire a qui l'on
 *   prend le terrain en debordant ; laisser un blanc entre deux creneaux fait
 *   croire que le dernier de la soiree n'a personne derriere lui.
 * - deux equipes sur un MEME creneau valent un demi-terrain chacune. C'est la
 *   seule facon de declarer un partage : deux creneaux qui se chevauchent a
 *   moitie ne sont pas compris comme un partage.
 *
 * Le planning ne DECIDE rien : il pre-remplit. L'entraineur garde la main sur
 * chaque champ de la seance, exactement comme pour « Mon equipe ».
 */

import type { CreneauClub, EquipeClub } from '../../src/domain/planning'

export const EQUIPES_CLUB: EquipeClub[] = [
  { nom: 'Moins de 11', categorieAge: '-11 ans' },
  { nom: 'Moins de 13 garçons', categorieAge: '-13 ans' },
  { nom: 'Moins de 13 filles', categorieAge: '-13 ans' },
  { nom: 'Moins de 15 garçons', categorieAge: '-15 ans' },
  { nom: 'Moins de 16 filles', categorieAge: '-16 ans' },
  { nom: 'Moins de 18 garçons', categorieAge: '-18 ans' },
  { nom: 'Moins de 18 filles', categorieAge: '-18 ans' },
  { nom: 'Seniors garçons', categorieAge: '+18 ans' },
  { nom: 'Seniors filles', categorieAge: '+18 ans' },
  { nom: 'Seniors loisir', categorieAge: '+18 ans' },
  { nom: 'Baby hand', categorieAge: '3-5 ans' },
  { nom: 'Mini hand', categorieAge: '6-9 ans' },
  { nom: 'Hand ensemble', categorieAge: '' },
]

export const PLANNING: CreneauClub[] = [
  { jour: 1, debut: '18:30', fin: '20:00', equipes: ['Moins de 16 filles', 'Moins de 18 filles'] },
  { jour: 1, debut: '20:00', fin: '22:00', equipes: ['Seniors loisir'] },
  { jour: 2, debut: '17:15', fin: '18:45', equipes: ['Moins de 13 garçons', 'Moins de 13 filles'] },
  { jour: 2, debut: '18:45', fin: '20:00', equipes: ['Moins de 15 garçons'] },
  { jour: 2, debut: '20:00', fin: '21:30', equipes: ['Moins de 18 garçons', 'Seniors garçons'] },
  { jour: 3, debut: '17:00', fin: '18:30', equipes: ['Moins de 11'] },
  { jour: 3, debut: '18:30', fin: '20:00', equipes: ['Moins de 16 filles'] },
  { jour: 3, debut: '20:00', fin: '21:30', equipes: ['Moins de 18 filles', 'Seniors filles'] },
  { jour: 4, debut: '17:15', fin: '18:45', equipes: ['Moins de 15 garçons'] },
  { jour: 4, debut: '18:45', fin: '20:15', equipes: ['Moins de 16 filles'] },
  { jour: 5, debut: '17:15', fin: '18:30', equipes: ['Moins de 13 garçons', 'Moins de 13 filles'] },
  { jour: 5, debut: '18:30', fin: '19:45', equipes: ['Moins de 18 garçons'] },
  { jour: 5, debut: '19:45', fin: '21:00', equipes: ['Moins de 18 filles', 'Seniors filles'] },
  { jour: 5, debut: '21:00', fin: '22:30', equipes: ['Seniors garçons'] },
  { jour: 6, debut: '09:00', fin: '10:00', equipes: ['Baby hand'] },
  { jour: 6, debut: '10:00', fin: '11:15', equipes: ['Mini hand'] },
  { jour: 6, debut: '11:15', fin: '12:30', equipes: ['Hand ensemble'] },
]
