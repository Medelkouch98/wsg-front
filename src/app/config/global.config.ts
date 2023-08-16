import { Breakpoints } from '@angular/cdk/layout';
import { IResource, RedevanceOTC } from '@app/models';
import { IDisplayOptions } from '../features/activity/models';
import { FileSizeUnits } from '../shared/components/upload-file/pipes';

export const CRYPT_KEY = 'SomeRondomKey';
export const LOCAL_STORAGE_KEYS = {
  settings: 'WS-SETTINGS',
  auth: 'WS-AUTH',
  webSocket: 'WS-WEBSOCKET',
  sessionId: 'WS-SESSIONID',
};
/**
 * Utiliser pour configurer le nombre d'agendas à afficher selon la taille/type d'ecran
 */
export const CALENDAR_AGENDA_SIZE_CONFIG = new Map<string, number>([
  [Breakpoints.Web, 3],
  [Breakpoints.TabletLandscape, 2],
  [Breakpoints.TabletPortrait, 1],
  [Breakpoints.Handset, 1],
]);

export const SUPPORTED_LANGUAGES: any = {
  fr: {
    language: 'Français',
    code: 'fr',
    icon: 'fr',
  },
};

export const PAGE_SIZE_OPTIONS: number[] = [
  10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
];
// Prendre par défaut la valeur minimal
export const MIN_PAGE_SIZE_OPTIONS = PAGE_SIZE_OPTIONS.sort(
  (a: number, b: number) => (a >= b ? 1 : -1)
)[0];
export const DEFAULT_PAGE_SIZE = 20;

export const TYPE_CLIENT = [
  { code: -1, libelle: 'Tous' },
  { code: 2, libelle: 'Client en compte' },
  { code: 1, libelle: 'Client de passage' },
];

export enum TypeApporteurAffaire {
  local = 'local',
  national = 'national',
}

export const TYPE_APPORTEURS = [
  TypeApporteurAffaire.local,
  TypeApporteurAffaire.national,
];

export const DEFAULT_CHOICES: IResource[] = [
  { code: -1, libelle: 'all' },
  { code: 1, libelle: 'yes' },
  { code: 0, libelle: 'no' },
];

export const TYPE_PRESTATION: IResource[] = [
  { code: -1, libelle: 'Tous' },
  { code: 1, libelle: 'soumisOTC' },
  { code: 0, libelle: 'nonSoumisOTC' },
];
export const DEFAULT_TYPE_APPORTEUR = TypeApporteurAffaire.national;
export const ETAT: IResource[] = [
  { code: -1, libelle: 'Tous' },
  { code: 1, libelle: 'Actif' },
  { code: 0, libelle: 'Inactif' },
];

export const ETAT_FACTURE: IResource[] = [
  { code: -1, libelle: 'Tous' },
  { code: 1, libelle: 'Soldée' },
  { code: 2, libelle: 'Non Soldée' },
];

export const REDEVANCE_OTC = new RedevanceOTC(
  'Redevance OTC  (Arrêté du 04/10/1991)',
  'REOTC',
  0.34,
  0.28,
  20,
  0.34
);

export const apiUrl4 = 'https://srv-rd.secta.fr:3000/';
export const apiUrl2 = 'https://websur-gestion-api-qa.secta.fr/api/';

export const ALL_DATA_PAGINATION = `page=0&per_page=-1`;
// Récupérer les années de l'année donnée en param à l'année en cours.
export const yearsFrom = (year: number) =>
  [...Array(new Date().getFullYear() - (year - 1)).keys()].map(
    (e: number) => e + year
  );

export const DEFAULT_AGENDA_COLOR = '#ffff00';

export const DEFAULT_SEARCH_OPTIONS: IDisplayOptions[] = [
  { labelname: 'Centre', bddname: 't_agrement', visible: 1 },
  { labelname: 'Date', bddname: 'date_saisie', visible: 1 },
  {
    labelname: 'Nom du proprietaire',
    bddname: 'nom_proprietaire',
    visible: 1,
  },
  { labelname: 'Nom du client', bddname: 'nom_client', visible: 1 },
  { labelname: 'Type VHL', bddname: 'categorie_code', visible: 1 },
  { labelname: 'Immatriculation', bddname: 'immatriculation', visible: 1 },
  { labelname: 'Marque', bddname: 'marque', visible: 1 },
  { labelname: 'Modèle', bddname: 'modele', visible: 1 },
  { labelname: 'Catégorie', bddname: 'categorie_libelle', visible: 1 },
  { labelname: 'Contrôleur', bddname: 'controleur_id', visible: 1 },
  { labelname: "Type d'activité", bddname: 'type_controle', visible: 1 },
  { labelname: 'actions', bddname: 'actions', visible: 1 },
];
export const MAX_FILE_UPLOAD_SIZE = 100 * FileSizeUnits.MEGABYTE; //in bytes
export const DECIMAL_NUMBER_PIPE_FORMAT = '1.2-2'; //at least 1 digit before . and exactly 2 after
export const NUMBER_FORMAT_TREE_DECIMALS = '1.3-3'; //at least 1 digit before . and exactly 2 after
