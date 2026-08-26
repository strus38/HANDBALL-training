/**
 * Le planning du club : qui s'entraine quand, et avec qui sur le terrain.
 *
 * SOURCE ET DATE. Transcrit de la page « Les entraineurs, les horaires » du
 * site du club, qui annonce la saison 2022/2023. Le site ne repond plus ; la
 * page vient de son archive du 2 novembre 2024. Ces horaires ont donc trois
 * saisons, et le club lui-meme prevenait que « les horaires d'entrainement
 * peuvent etre modifies en fonction des equipes engagees ». A remplacer par le
 * tableau de la saison en cours des qu'il sera disponible : c'est la seule
 * donnee de ce dossier qui ne soit pas verifiee a la source.
 *
 * Tous les entrainements ont lieu a la halle des sports de Tournon.
 *
 * TROIS ECARTS AVEC LE MODELE, a confirmer avec le club :
 *
 * 1. Les creneaux ne se touchent pas et se CHEVAUCHENT parfois a moitie. Le
 *    lundi, les moins de 13 tiennent 17h30-19h00 pendant que les moins de 18
 *    garcons commencent a 18h15 ; le mardi, les seniors filles ont 19h00-20h30
 *    et les moins de 18 filles 19h30-20h30 ; le mercredi, les moins de 13
 *    finissent a 14h30 et les moins de 11 commencent a 14h00. L'application ne
 *    sait declarer un partage que sur un creneau IDENTIQUE : ces equipes-la
 *    s'affichent donc en terrain complet alors qu'elles se croisent. Les
 *    fusionner aurait donne a l'une la duree de l'autre — on a prefere
 *    transcrire ce que le club publie plutot que d'arbitrer a sa place.
 *
 * 2. Les moins de 13 n'ont qu'un seul creneau, alors que le club presente une
 *    equipe garcons et une equipe filles. Une seule equipe est donc declaree
 *    ici, faute de savoir si les deux s'entrainent ensemble.
 *
 * 3. Les seniors garcons 1 et 2 partagent les memes horaires et comptent pour
 *    une seule equipe : le club les nomme « Seniors garcons 1 et 2 » sur une
 *    meme ligne.
 *
 * Ce qui EST sur : les trois partages declares ci-dessous sont des horaires
 * strictement identiques, publies comme tels.
 */

import type { CreneauClub, EquipeClub } from '../../src/domain/planning'

export const EQUIPES_CLUB: EquipeClub[] = [
  { nom: 'Moins de 9', categorieAge: '-9 ans' },
  { nom: 'Moins de 11', categorieAge: '-11 ans' },
  { nom: 'Moins de 13', categorieAge: '-13 ans' },
  { nom: 'Moins de 15 garçons', categorieAge: '-15 ans' },
  { nom: 'Moins de 15 filles', categorieAge: '-15 ans' },
  { nom: 'Moins de 18 garçons', categorieAge: '-18 ans' },
  { nom: 'Moins de 18 filles', categorieAge: '-18 ans' },
  { nom: 'Seniors garçons', categorieAge: '+18 ans' },
  { nom: 'Seniors filles', categorieAge: '+18 ans' },
]

export const PLANNING: CreneauClub[] = [
  { jour: 1, debut: '17:30', fin: '19:00', equipes: ['Moins de 13'] },
  { jour: 1, debut: '18:15', fin: '19:30', equipes: ['Moins de 18 garçons'] },
  { jour: 2, debut: '17:30', fin: '19:00', equipes: ['Moins de 15 garçons', 'Moins de 15 filles'] },
  { jour: 2, debut: '19:00', fin: '20:30', equipes: ['Seniors filles'] },
  { jour: 2, debut: '19:30', fin: '20:30', equipes: ['Moins de 18 filles'] },
  { jour: 2, debut: '20:30', fin: '22:00', equipes: ['Seniors garçons'] },
  { jour: 3, debut: '13:00', fin: '14:30', equipes: ['Moins de 13'] },
  { jour: 3, debut: '14:00', fin: '16:30', equipes: ['Moins de 11'] },
  { jour: 4, debut: '17:30', fin: '19:00', equipes: ['Moins de 15 garçons', 'Moins de 15 filles'] },
  { jour: 4, debut: '20:30', fin: '22:00', equipes: ['Seniors filles'] },
  { jour: 5, debut: '18:30', fin: '20:00', equipes: ['Moins de 18 garçons', 'Moins de 18 filles'] },
  { jour: 5, debut: '19:30', fin: '22:30', equipes: ['Seniors garçons'] },
  { jour: 6, debut: '09:30', fin: '11:00', equipes: ['Moins de 9'] },
  { jour: 6, debut: '10:30', fin: '12:00', equipes: ['Moins de 11'] },
]
