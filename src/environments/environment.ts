// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  defaultLanguage: 'fr',
  appName: 'Websur Gestion',
  apiUrl: 'https://websur-gestion-api-sprint.secta.fr/api/',
  websocketUrl: 'wss://websur-gestion-api-sprint.secta.fr/app/',
  // websocketUrl: 'ws://websur-gestion-api-sprint.secta.fr:6001/app/',
  // apiUrl: 'http://api.secta.local/api/',
  // websocketUrl: 'ws://api.secta.local:6001/app/',
  appVersion: '2.00',
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
