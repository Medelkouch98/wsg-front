import { Component, Input } from '@angular/core';
import { DecimalPipe, NgIf } from '@angular/common';
import { ISortieCaisse } from '../../../models';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { DECIMAL_NUMBER_PIPE_FORMAT } from '@app/config';

@Component({
  selector: 'app-sortie-de-caisse',
  standalone: true,
  imports: [
    MatExpansionModule,
    TranslateModule,
    MatTableModule,
    DecimalPipe,
    NgIf,
  ],
  templateUrl: './sortie-de-caisse.component.html',
})
export class SortieDeCaisseComponent {
  @Input() sortiesCaisse: ISortieCaisse[];
  DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;

  public columns = ['usage', 'montant'];
}
