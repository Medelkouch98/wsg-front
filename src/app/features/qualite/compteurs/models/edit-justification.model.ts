export interface IEditJustificationRequest {
  justification_id: number;
  justification_libelle: string;
}

export class EditJustificationRequest implements IEditJustificationRequest {
  justification_id: number;
  justification_libelle: string;

  constructor(justification_id: number, justification_libelle: string) {
    this.justification_id = justification_id;
    this.justification_libelle = justification_libelle;
  }
}

export interface IEditJustificationData {
  compteurId: number;
  editJustificationRequest: IEditJustificationRequest;
}
