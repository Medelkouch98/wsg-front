import { Injectable } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { IWsError, QueryParam, WsErrorClass } from '../models';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  constructor(
    private translateService: TranslateService,
    private router: Router,
    private toaster: ToastrService
  ) {}

  /**
   * gérer la pagination et le tri pour l'envoi dans les requêtes de recherche
   * @returns QueryParam
   */
  public getPageAndSortURL(
    page: number,
    per_page: number,
    sort: Sort
  ): QueryParam {
    let params: QueryParam = { page, per_page };
    if (sort?.direction) {
      params = { ...params, sort: sort.active, order: sort.direction };
    }
    return params;
  }

  /**
   * recuperation de chaîne de filtre pour l'envoi dans les requêtes de recherche
   * @returns QueryParam
   */
  public getSearchQuery(data: any): QueryParam {
    if (!data) return {};
    // remove empty values from the filter object
    return Object.keys(data).reduce((acc, key) => {
      const val = data[key];
      const nonEmpty = val != null && val !== '' && val !== -1;
      return { ...acc, ...(nonEmpty && { [key]: val }) };
    }, {});
  }

  /**
   * create query
   * @param data any
   * @param page number
   * @param page_size number
   * @param sort Sort
   * @returns QueryParam
   */
  public getQuery(
    data: any,
    page?: number,
    page_size?: number,
    sort?: Sort
  ): QueryParam {
    return {
      ...this.getSearchQuery(data),
      ...(page && this.getPageAndSortURL(page, page_size, sort)),
    };
  }

  /**
   *
   * @param value string
   * @param minlength string
   * return string
   */
  public getAutocompleteSearchMsg(value: string, minlength: number): string {
    return this.translateService.instant('validators.atLeast', {
      value: minlength - (value?.length ?? 0),
    });
  }

  /**
   * Ouvre une route dans une nouvelle fenêtre.
   * @param commands La route ou le lien à ouvrir dans la nouvelle fenêtre.
   * @param queryParams Les paramètres du lien.
   */
  redirectToNewTab(commands: any[], queryParams?: {[key: string]: any}): void {
    const url = this.router.createUrlTree(commands, { queryParams }).toString();
    window.open(url, '_blank');
  }

  /**
   * Créer et retourner l'erreur IWsError
   * @param {HttpErrorResponse} error
   * @param {string} errorMessage
   * @param {boolean} showToaster
   * @param {boolean} byTranslate
   */
  public getWsError(
    error: HttpErrorResponse,
    errorMessage?: string,
    showToaster: boolean = false,
    byTranslate: boolean = true
  ): IWsError {
    const iWsError: IWsError = new WsErrorClass(error);
    const messageToShow = byTranslate
      ? this.translateService.instant(errorMessage)
      : errorMessage;
    showToaster && this.toaster.error(messageToShow);
    return {
      ...iWsError,
      messageToShow,
    };
  }
}
