export enum TypeComptageEnum {
  TYPE_ESPECE = 1,
  TYPE_ESPECE_BILLET = 2,
  TYPE_ESPECE_PIECE = 3,
  TYPE_CHEQUE = 4,
  TYPE_CARTE_BANCAIRE = 5,
  TYPE_COUPON = 6,
  TYPE_SORTIE_CAISSE = 7,
  TYPE_VIREMENT = 8,
  TYPE_INTERNET = 9,
  TYPE_GRATUIT = 10,
  TYPE_SANS_REGLEMENT = 11,
}

export const mapTypeComptageEnumReglementCode: Map<TypeComptageEnum, string> =
  new Map<TypeComptageEnum, string>([
    [TypeComptageEnum.TYPE_ESPECE, 'E'],
    [TypeComptageEnum.TYPE_ESPECE_BILLET, 'E'],
    [TypeComptageEnum.TYPE_ESPECE_PIECE, 'E'],
    [TypeComptageEnum.TYPE_CHEQUE, 'C'],
    [TypeComptageEnum.TYPE_CARTE_BANCAIRE, 'CB'],
    [TypeComptageEnum.TYPE_COUPON, 'BC'],
    [TypeComptageEnum.TYPE_VIREMENT, 'V'],
    [TypeComptageEnum.TYPE_INTERNET, 'PI'],
    [TypeComptageEnum.TYPE_GRATUIT, 'G'],
    [TypeComptageEnum.TYPE_SANS_REGLEMENT, 'SR'],
  ]);
