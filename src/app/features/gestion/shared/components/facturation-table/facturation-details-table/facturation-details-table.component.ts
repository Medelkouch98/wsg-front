import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import {
  MatCheckboxChange,
  MatCheckboxModule,
} from '@angular/material/checkbox';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IDetailPrestation, IPrestation } from '@app/models';
import { FacturationStore } from '../../../facturation.store';
import { Subscription } from 'rxjs';
import {
  DECIMAL_NUMBER_PIPE_FORMAT,
  NUMBER_FORMAT_TREE_DECIMALS,
} from '@app/config';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FormControlErrorPipe } from '@app/pipes';
import { ToastrService } from 'ngx-toastr';
import { MatDialog } from '@angular/material/dialog';
import { AddPrestationPopupComponent } from '../../add-prestation/add-prestation-popup.component';
import { filter, map, take, tap } from 'rxjs/operators';
import { ReotcPipe } from './pipes/reotc.pipe';
import { FacturationValidator } from '../../../validators/facturation.validator';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../../core/store/auth/auth.selectors';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../../core/store/app.state';
import { FactureTypeEnum } from '../../../enums';
import { IPrestationRowsForm, IDetailsRowsForm } from '../../../models';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-facturation-details-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormControlErrorPipe,
    AddPrestationPopupComponent,
    ReotcPipe,
  ],
  providers: [FacturationValidator],
  templateUrl: './facturation-details-table.component.html',
})
export class FacturationDetailsTableComponent implements OnInit, OnDestroy {
  @Input() prestationFormGroup: FormGroup<IPrestationRowsForm>;

  public columns: string[] = [
    'select',
    'numero_bl',
    'libelle',
    'baseHt',
    'remiseeuro',
    'remisepourcentage',
    'tauxtva',
    'montantHtOtc',
    'montantTtcOtc',
    'actions',
  ];
  public detailSelection: Map<string, Map<number, IDetailPrestation>> =
    new Map();
  public DECIMAL_NUMBER_PIPE_FORMAT = DECIMAL_NUMBER_PIPE_FORMAT;
  public NUMBER_FORMAT_TREE_DECIMALS = NUMBER_FORMAT_TREE_DECIMALS;

  private subs: Subscription = new Subscription();

  constructor(
    private facturationStore: FacturationStore,
    private fb: FormBuilder,
    private toasterService: ToastrService,
    private translateService: TranslateService,
    private matDialog: MatDialog,
    private facturationValidator: FacturationValidator,
    private store: Store<AppState>,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.subs.add(
      this.facturationStore.detailsSelection$.subscribe(
        (detailsSelection: Map<string, Map<number, IDetailPrestation>>) => {
          this.detailSelection = detailsSelection;
          this.facturationStore.calculateTotalFacture();
        }
      )
    );
    this.subs.add(
      this.store
        .pipe(
          select(AuthSelector.AccessPermissionsSelector),
          map(
            (accessPermissions: PermissionType[]) =>
              !accessPermissions.includes(PermissionType.WRITE)
          )
        )
        .subscribe((isReadOnly: boolean) => {
          if (isReadOnly) {
            this.prestationFormGroup.controls.details.disable();
            this.columns.pop();
          }
        })
    );
    this.subs.add(
      this.facturationStore.factureType$.subscribe(
        (factureType: FactureTypeEnum) => {
          if (factureType === FactureTypeEnum.FACTURE_DIVERSE)
            this.columns = this.columns.filter(
              (row: string) => row !== 'actions'
            );
        }
      )
    );
  }

  /**
   * sélectionner our de-sélectionner les lignes
   * @param event MatCheckboxChange
   * @param detail FormGroup<IDetailsRowsForm>
   * @param index number
   */
  toggleChildSelection(
    event: MatCheckboxChange,
    detail: FormGroup<IDetailsRowsForm>,
    index: number
  ) {
    this.facturationStore.selectOrUnSelectDetailPrestation({
      detailsPrestation: [detail.getRawValue()],
      isChecked: event.checked,
      index,
    });
  }

  /**
   * check if the row is selected
   * @param codePrestation string
   * @param index number
   * @return boolean
   */
  checkIsSelectedRow(codePrestation: string, index: number): boolean {
    return !!(
      this.detailSelection.has(codePrestation) &&
      this.detailSelection.get(codePrestation).get(index)
    );
  }

  /**
   * Modifier les remises
   * @param element FormGroup<IDetailsRowsForm>
   * @param typeRemise string
   * @param index number
   */
  updateRemise(
    element: FormGroup<IDetailsRowsForm>,
    typeRemise: string,
    index: number
  ) {
    const { remise_euro, remise_pourcentage } = element.controls;
    if (typeRemise === 'remise_euro') {
      remise_pourcentage.setValue(0);
      if (remise_euro.valid)
        this.facturationStore.calculateRemisePrestationDetail({
          detailPrestation: element.getRawValue(),
          index,
        });
    }
    if (typeRemise === 'remise_pourcentage') {
      remise_euro.setValue(0);
      if (remise_pourcentage.valid)
        this.facturationStore.calculateRemisePrestationDetail({
          detailPrestation: element.getRawValue(),
          index,
        });
    }
  }

  /**
   * Afficher la popup addPrestation pour modifier la prestation du detail choisi
   * @param detailPrestation IDetailPrestation
   * @param index number
   */
  updatePrestation(detailPrestation: IDetailPrestation, index: number) {
    const dialogRef = this.matDialog.open(AddPrestationPopupComponent, {
      data: { code: detailPrestation.code_prestation },
      disableClose: true,
      minWidth: this.breakpointObserver.isMatched('(max-width: 1024px)')
        ? '75%'
        : '50%',
    });
    this.subs.add(
      dialogRef
        .afterClosed()
        .pipe(
          take(1),
          filter(
            (result: { newPrestation: IPrestation; tauxTva: string }) =>
              !!result.newPrestation
          ),
          tap((result: { newPrestation: IPrestation; tauxTva: string }) =>
            this.facturationStore.changePrestationDetail({
              detailPrestation,
              newPrestation: result.newPrestation,
              tauxTva: result.tauxTva,
              index,
            })
          )
        )
        .subscribe()
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
