import { Component, ElementRef, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CompteursStore } from '../../compteurs.store';
import {
  EditJustificationRequest,
  IAttachment,
  ICompteurItem,
  ICompteursAddJustificationDialogData,
  IJustifieForAllRequest,
  ISearchCriteria,
  TypeCompteurAction,
} from '../../models';
import {
  AsyncPipe,
  DatePipe,
  KeyValue,
  KeyValuePipe,
  NgClass,
  NgForOf,
  NgIf,
} from '@angular/common';
import { filter, map, take, tap } from 'rxjs/operators';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompteurJustifiePipe } from '../../pipes';
import { CompteursDialogComponent } from '../compteurs-dialog/compteurs-dialog.component';
import { select, Store } from '@ngrx/store';
import * as AuthSelector from '../../../../../core/store/auth/auth.selectors';
import { PermissionType } from '@app/enums';
import { AppState } from '../../../../../core/store/app.state';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { NoDataSearchDirective } from '@app/directives';
import { Subscription } from 'rxjs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DownloadFilesComponent } from '../../../../../shared/components/download-files/download-files.component';
import { UploadFilesComponent } from '@app/components';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DANGER_LEVELS } from '../../helpers/compteurs.helper';
import { NoDataSearchComponent } from '../../../../../shared/components/no-data-search/no-data-search.component';
import { SharedService } from '@app/services';

@Component({
  selector: 'app-compteurs-search-table',
  standalone: true,
  templateUrl: './compteurs-search-table.component.html',
  imports: [
    AsyncPipe,
    TranslateModule,
    KeyValuePipe,
    CompteurJustifiePipe,
    DatePipe,
    NgForOf,
    NgIf,
    NgClass,
    CompteursDialogComponent,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    MatInputModule,
    MatExpansionModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    NoDataSearchDirective,
    MatTooltipModule,
    DownloadFilesComponent,
    UploadFilesComponent,
    ReactiveFormsModule,
    NoDataSearchComponent,
  ],
})
export class CompteursSearchTableComponent implements OnDestroy {
  DANGER_LEVELS = DANGER_LEVELS;
  TypeCompteurAction = TypeCompteurAction;
  isReadOnly$: Observable<boolean> = this.store.pipe(
    select(AuthSelector.AccessPermissionsSelector),
    map(
      (accessPermissions: PermissionType[]) =>
        !accessPermissions.includes(PermissionType.WRITE)
    )
  );

  subscription = new Subscription();
  //pour garder l'état des panneaux ouverts
  openedCompteur: string;
  openedControle: number;

  public searchClicked$: Observable<boolean> =
    this.compteursStore.SearchClickedSelector$;

  public isCompteursIntegres$: Observable<number> =
    this.compteursStore.IsCompteursIntegresSelector$;

  public searchCriteria$: Observable<ISearchCriteria> =
    this.compteursStore.SearchCriteriaSelector$;
  compteurs$: Observable<Record<number, Record<string, ICompteurItem[]>>> =
    this.compteursStore.CompteursSelector$;
  columns: string[] = ['nomControleur', 'agrementControleur', 'actions'];
  detailsColumns: string[] = [
    'date_controle',
    'immatriculation',
    'numero_rapport',
    'actions',
  ];

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private sharedService: SharedService,
    private compteursStore: CompteursStore,
    private matDialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  /**
   * pour trier les elements par key (niveau et code compteur)
   * @param {KeyValue<string, any>} a
   * @param {KeyValue<string, any>} b
   * @returns {number}
   */
  orderByKey(a: KeyValue<string, any>, b: KeyValue<string, any>): number {
    return a.key > a.key ? 1 : b.key > b.key ? -1 : 0;
  }

  /**
   * ouverture du popup pour l'ajout de justification pour tous les controles ou un seul controle
   * @param {ICompteurItem} compteur
   */
  openAddJustification(compteur: ICompteurItem) {
    this.compteursStore.GetCompteurJustifications(compteur.code);
    const matDialogRef = this.matDialog.open(CompteursDialogComponent, {
      data: {
        compteur: null,
        justifications$: this.compteursStore.JustificationsSelector$,
      } as ICompteursAddJustificationDialogData,
      width: '100%',
      disableClose: true,
    });
    matDialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((addRequest: IJustifieForAllRequest) => !!addRequest),
        tap((addRequest: IJustifieForAllRequest) =>
          this.compteursStore.JustifieAll({
            addRequest,
            codeCompteur: compteur.code,
          })
        )
      )
      .subscribe();
  }

  /**
   * redirection vers la page de fiche de controle
   * @param {ICompteurItem} element
   */
  goToFicheControle(element: ICompteurItem) {
    this.sharedService.redirectToNewTab([
      `/p/activity/fiche/`,
      element.controle_id,
    ]);
  }

  /**
   * ouverture du popup pour la modification de justification
   * @param {ICompteurItem} compteur
   */
  openEditJustification(compteur: ICompteurItem) {
    this.compteursStore.GetCompteurJustifications(compteur.code);
    const matDialogRef = this.matDialog.open(CompteursDialogComponent, {
      data: {
        compteur,
        justifications$: this.compteursStore.JustificationsSelector$,
      } as ICompteursAddJustificationDialogData,
      width: '100%',
      disableClose: true,
    });

    matDialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((request: IJustifieForAllRequest) => !!request),
        tap((request: IJustifieForAllRequest) => {
          this.compteursStore.UpdateJustification({
            editJustificationRequest: new EditJustificationRequest(
              request.justification_id,
              request.justification_libelle
            ),
            compteurId: compteur.id,
          });
          this.compteursStore.AddActionToCompteur({
            addActionRequest: request.actions?.[0],
            compteurId: compteur.id,
          });
          if (!!request.fichiers) {
            this.compteursStore.UploadAttachment({
              fichiers: request.fichiers,
              compteurId: compteur.id,
            });
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * on recupere els noms des fichiers, cette liste sera envoyée comme input pour le composant de telechargement
   * @param {IAttachment[]} attachments
   * @return {string[]}
   */
  fileNamesFromAttachments(attachments: IAttachment[]): string[] {
    return attachments?.map((attachment: IAttachment) => attachment.fichier);
  }

  /**
   * téléchargement d'un fichier sélectionné
   * @param {IAttachment} attachment
   */
  downloadAttachment = (attachment: IAttachment): void => {
    this.compteursStore.DownloadAttachment(attachment);
  };

  /**
   * suppression d'un fichier sélectionné
   * @param {number} fichierId
   */
  deleteAttachment = (fichierId: number): void => {
    this.compteursStore.DeleteAttachment(fichierId);
  };

  /**
   * selectionner le panneau ouvert
   * @param {string} compteur
   * @param {number} controle
   */
  setOpenPanels(compteur: string, controle: number) {
    this.openedCompteur = compteur;
    this.openedControle = controle;
  }

  /**
   * la condition pour que le panneau de control soit ouvert
   * @param {boolean} firstControl
   * @param {ICompteurItem} compteurItem
   * @return {boolean}
   */
  isControlPanelExpanded(
    firstControl: boolean,
    compteurItem: ICompteurItem
  ): boolean {
    return !!this.openedControle
      ? this.openedCompteur === compteurItem.code &&
          this.openedControle === compteurItem.id
      : firstControl;
  }

  /**
   * la condition pour que le panneau de compteur soit ouvert
   * @param {boolean} firstControl
   * @param {string} niveau
   * @param {ICompteurItem} compteurItem
   * @return {boolean}
   */
  isCompteurPanelExpanded(
    firstControl: boolean,
    compteurItem: ICompteurItem
  ): boolean {
    return !!this.openedControle
      ? this.openedCompteur === compteurItem.code
      : firstControl;
  }

  /**
   * recuperer le message ainsi que l'image à afficher
   * @param {ISearchCriteria} searchCriteria
   * @param {boolean} searchClicked
   * @param {boolean} isCompteursIntegres
   * @return {string}
   */
  getMessage(
    searchCriteria: ISearchCriteria,
    searchClicked: boolean,
    isCompteursIntegres: number
  ): { message: string; image: string } {
    if (searchClicked) {
      if (searchCriteria.month !== -1) {
        switch (isCompteursIntegres) {
          case 1:
            return {
              message:
                'qualite.compteurs.errors.compteursIntegresFelicitations',
              image: 'assets/images/search.svg',
            };
          case 3:
            return {
              message: 'qualite.compteurs.errors.compteursNonIntegres',
              image: 'assets/images/not_found.svg',
            };
          default:
            return {
              message: 'commun.noResultsFound',
              image: 'assets/images/not_found.svg',
            };
        }
      } else {
        return {
          message: 'commun.searchQuestMessage',
          image: 'assets/images/search.svg',
        };
      }
    }
  }

  getActionLabel(compteurItem: ICompteurItem, type: TypeCompteurAction) {
    return compteurItem.actions?.find((a) => a?.type_action === type)?.libelle;
  }

  /**
   * Scrolls the page to the section corresponding to the specified level.
   * If no level is specified, the page will be scrolled to the main data section.
   * @param {number} [level] - The level of the section to scroll to (optional)
   * @returns {void}
   */
  scrollToLevelSection(level?: number): void {
    const section = level ? `#level-${level}` : '#data';
    const levelSection = this.elementRef.nativeElement.querySelector(section);
    if (levelSection) {
      levelSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  /**
   * return levelId
   * @param data
   * @param i index
   */
  getLevelId(
    data: Record<number, Record<string, ICompteurItem[]>>,
    i: number
  ): string {
    return `level-${Object.keys(data)[i]}`;
  }
}
