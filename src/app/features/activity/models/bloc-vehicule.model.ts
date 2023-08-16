export interface IBlocVehicule {
  categorie_libelle: string;
  genre_code: string;
  marque: string;
  modele: string;
  carrosserie_code: string;
  categorie_internationale_code: string;
  energie_code: string;
  puissance_fiscale: number;
  nb_place_assises: number;
  ptac: number;
  poid_a_vide: string;
}
export class BlocVehicule implements IBlocVehicule {
  categorie_libelle: string;
  genre_code: string;
  marque: string;
  modele: string;
  carrosserie_code: string;
  categorie_internationale_code: string;
  energie_code: string;
  puissance_fiscale: number;
  nb_place_assises: number;
  ptac: number;
  poid_a_vide: string;

  constructor() {
    this.categorie_libelle = '';
    this.genre_code = '';
    this.marque = '';
    this.modele = '';
    this.carrosserie_code = '';
    this.categorie_internationale_code = '';
    this.energie_code = '';
    this.puissance_fiscale = null;
    this.nb_place_assises = null;
    this.ptac = null;
    this.poid_a_vide = '';
  }
}
