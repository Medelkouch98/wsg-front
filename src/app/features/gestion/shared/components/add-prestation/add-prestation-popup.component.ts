import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { IPrestation, ITva } from '@app/models';
import { AsyncPipe, KeyValuePipe, NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { select, Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { FormControlErrorPipe } from '@app/pipes';
import * as resourcesSelector from '../../../../../core/store/resources/resources.selector';
import { AppState } from '../../../../../core/store/app.state';

@Component({
  selector: 'app-add-prestation-popup',
  standalone: true,
  imports: [
    MatButtonModule,
    NgFor,
    NgIf,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    TranslateModule,
    KeyValuePipe,
    AsyncPipe,
    FormControlErrorPipe,
  ],
  templateUrl: './add-prestation-popup.component.html',
})
export class AddPrestationPopupComponent implements OnInit, OnDestroy {
  prestationControl = new FormControl<IPrestation | null>(
    null,
    Validators.required
  );
  prestationList$: Observable<IPrestation[]>;
  subs: Subscription = new Subscription();

  constructor(
    private store: Store<AppState>,
    private dialogRef: MatDialogRef<AddPrestationPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { code: string; add: boolean }
  ) {}

  ngOnInit(): void {
    // filtrer les prestations en fonction du code de prestation, en s'assurant
    // que le code diffère de celui de la prestation que l'on souhaite modifier.
    this.prestationList$ = this.store
      .select(resourcesSelector.PrestationsSelector)
      .pipe(
        map((prestations: IPrestation[]) =>
          prestations.filter(
            (prestation: IPrestation) =>
              prestation.code.substring(0, 2) ===
                this.data.code.substring(0, 2) && // Include prestations with matching code prefix
              (!!this.data.add || prestation.code !== this.data.code)
          )
        )
      );
  }

  emitAction(action: IPrestation): void {
    this.subs.add(
      this.store
        .pipe(select(resourcesSelector.TVAByIdSelector(action.tva_id)))
        .pipe(
          tap((tva: ITva) =>
            this.dialogRef.close({ newPrestation: action, tauxTva: tva.taux })
          )
        )
        .subscribe()
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
