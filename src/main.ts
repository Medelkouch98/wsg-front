import {
  APP_INITIALIZER,
  enableProdMode,
  ErrorHandler,
  importProvidersFrom,
  Injector,
} from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication, BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { RouterModule } from '@angular/router';
import { AppRoutes } from './app/app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpClientModule,
} from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { WithCredentialsInterceptor } from './app/core/interceptors/withCredentials.interceptor';
import { JwtInterceptor } from './app/core/interceptors/jwt.interceptor';
import { LoadingScreenInterceptor } from './app/core/interceptors/loading.interceptor';
import {
  DEFAULT_TIMEOUT,
  TimeoutHttpInterceptor,
} from './app/core/interceptors/timeout.interceptor';
import { TenantInterceptor } from './app/core/interceptors/tenant.interceptor';
import { ExtractDataInterceptor } from './app/core/interceptors/extract-data.interceptor';
import { WsErrorsHandlerService } from './app/core/error-handler/ws-error-handler.service';
import {
  DateAdapter,
  ErrorStateMatcher,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import { StoreModule } from '@ngrx/store';
import { metaReducers, reducers } from './app/core/store/app.state';
import { EffectsModule } from '@ngrx/effects';
import { SettingsEffects } from './app/core/store/settings/settings.effects';
import { AuthEffects } from './app/core/store/auth/auth.effects';
import { ResourcesEffects } from './app/core/store/resources/resources.effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { CustomRouterSerializer } from './app/core/store/router/custom-ruter-serliazer.service';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { LOCATION_INITIALIZED, registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  MAT_PAGINATOR_DEFAULT_OPTIONS,
  MatPaginatorIntl,
} from '@angular/material/paginator';
import { CustomPaginatorIntl, FR_DATE_FORMATS } from '@app/helpers';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { NG_SCROLLBAR_OPTIONS } from 'ngx-scrollbar';
import { MAT_RADIO_DEFAULT_OPTIONS } from '@angular/material/radio';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@app/config';
import { WebSocketEffects } from './app/core/store/websocket/websocket.effects';
import { SessionInterceptor } from './app/core/interceptors/session.interceptor';

if (environment.production) {
  enableProdMode();
}

registerLocaleData(localeFr, 'fr');

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

export function appInitializerFactory(
  translate: TranslateService,
  injector: Injector
): any {
  return () =>
    new Promise<any>((resolve: any) => {
      const locationInitialized = injector.get(
        LOCATION_INITIALIZED,
        Promise.resolve(null)
      );
      locationInitialized.then(() => {
        translate.setDefaultLang(environment.defaultLanguage);
        const lang = environment.defaultLanguage;
        translate
          .use('fr')
          .pipe(
            catchError((err) => {
              console.error(`Problem with '${lang}' language initialization.'`);
              return of(err);
            }),
            finalize(() => resolve(null))
          )
          .subscribe();
      });
    });
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom([
      BrowserModule,
      BrowserAnimationsModule,
      HttpClientModule,
      RouterModule.forRoot(AppRoutes),
      MatSnackBarModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
      ToastrModule.forRoot({ preventDuplicates: true }),
      StoreModule.forRoot(reducers, {
        metaReducers,
        runtimeChecks: {
          strictStateImmutability: true,
          strictActionImmutability: true,
        },
      }),
      EffectsModule.forRoot([
        SettingsEffects,
        AuthEffects,
        ResourcesEffects,
        WebSocketEffects,
      ]),
      StoreRouterConnectingModule.forRoot({
        serializer: CustomRouterSerializer,
      }),
      StoreDevtoolsModule.instrument({
        maxAge: 25,
        logOnly: environment.production,
        name: environment.appName,
      }),
      MatNativeDateModule,
    ]),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SessionInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: WithCredentialsInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoadingScreenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TimeoutHttpInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TenantInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ExtractDataInterceptor,
      multi: true,
    },
    { provide: ErrorHandler, useClass: WsErrorsHandlerService },
    { provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher },
    { provide: DEFAULT_TIMEOUT, useValue: 3000 },
    { provide: NG_SCROLLBAR_OPTIONS, useValue: { visibility: 'hover' } },
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', floatLabel: 'always' },
    },
    {
      provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
      useValue: {
        pageSize: DEFAULT_PAGE_SIZE,
        pageSizeOptions: PAGE_SIZE_OPTIONS,
        showFirstLastButtons: true,
      },
    },
    { provide: MAT_RADIO_DEFAULT_OPTIONS, useValue: { color: 'primary' } },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: MAT_DATE_FORMATS, useValue: FR_DATE_FORMATS },
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: false },
    },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
  ],
}).catch((err) => console.error(err));
