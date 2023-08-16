import { Component, Inject } from '@angular/core';
import { NgForOf } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { ExportEtatEnum } from '../../../../../exports/enums/export-etat.enum';

@Component({
  selector: 'app-cloture-caisse-export-etat',
  standalone: true,
  imports: [
    TranslateModule,
    MatDialogModule,
    MatButtonModule,
    MatExpansionModule,
    NgForOf,
  ],
  templateUrl: './cloture-caisse-export-etat.component.html',
})
export class ClotureCaisseExportEtatComponent {
  ExportEtatEnum = ExportEtatEnum;
  exportEtatEnumKeys: string[] = Object.keys(ExportEtatEnum);

  constructor(
    private dialogRef: MatDialogRef<ClotureCaisseExportEtatComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      etatsFindDeJournee: ExportEtatEnum[];
      etatsFindDuMois: ExportEtatEnum[];
    }
  ) {}

  /**
   * gérer la selection d'état fin du mois
   * @param event
   */
  handleCheckboxChangeFinDuMois(event: any): void {
    const { value, checked } = event.target;
    if (checked) {
      this.data.etatsFindDuMois.push(value);
    } else {
      this.data.etatsFindDuMois = this.data.etatsFindDuMois.filter(
        (val) => val !== value
      );
    }
  }
  /**
   * gérer la selection d'état fin de journée
   * @param event
   */
  handleCheckboxChangeFinDeJournee(event: any): void {
    const { value, checked } = event.target;
    if (checked) {
      this.data.etatsFindDeJournee.push(value);
    } else {
      this.data.etatsFindDeJournee = this.data.etatsFindDeJournee.filter(
        (val) => val !== value
      );
    }
  }

  /**
   * enregistrer la configuration
   */
  savePreference() {
    //TODO: implement logic once the API is ready
    this.dialogRef.close(this.data);
  }
}
