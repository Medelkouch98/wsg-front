export interface IMaterialSearch {
  materiel_categorie_id: number;
  materiel_type_id: number;
  materiel_sous_type_id: number;
  actif: number;
  type?: 'pdf' | 'xls';
}
export class MaterialSearch implements IMaterialSearch {
  constructor(
    public materiel_categorie_id = -1,
    public materiel_type_id = -1,
    public materiel_sous_type_id = -1,
    public actif = -1
  ) {}
}
