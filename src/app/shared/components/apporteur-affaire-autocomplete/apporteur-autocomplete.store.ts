import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { IApporteurAffaire, PaginatedApiResponse } from '@app/models';
import { TypeApporteurAffaire } from '@app/config';
import { switchMap, tap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ApporteurAffaireService } from '@app/services';

export interface ApporteurAutoCompleteState {
  apporteurNationalList: IApporteurAffaire[];
  apporteurLocalList: IApporteurAffaire[];
}

export const initialApporteurAutoCompleteState: ApporteurAutoCompleteState = {
  apporteurNationalList: [],
  apporteurLocalList: [],
};
@Injectable()
export class ApporteurAutoCompleteStore extends ComponentStore<ApporteurAutoCompleteState> {
  // SELECTORS
  apporteurNationalList$ = this.select(
    (state: ApporteurAutoCompleteState) => state.apporteurNationalList
  );
  apporteurLocalList$ = this.select(
    (state: ApporteurAutoCompleteState) => state.apporteurLocalList
  );
  constructor(
    private translateService: TranslateService,
    private apporteurAffaireService: ApporteurAffaireService
  ) {
    super(initialApporteurAutoCompleteState);
  }

  // EFFECTS

  getApporteurAffaire = this.effect((trigger$) =>
    trigger$.pipe(
      switchMap(() =>
        this.apporteurAffaireService
          .searchApporteurAffaire({ per_page: -1 }, TypeApporteurAffaire.local)
          .pipe(
            tap((response: PaginatedApiResponse<IApporteurAffaire>) => {
              this.patchState({
                apporteurLocalList: response?.data,
              });
            }),
            switchMap(() =>
              this.apporteurAffaireService
                .searchApporteurAffaire(
                  { per_page: -1 },
                  TypeApporteurAffaire.national
                )
                .pipe(
                  tap((response: PaginatedApiResponse<IApporteurAffaire>) => {
                    this.patchState({
                      apporteurNationalList: response?.data,
                    });
                  })
                )
            )
          )
      )
    )
  );
}
