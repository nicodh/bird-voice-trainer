// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  debug: true,
  apiUrl: 'http://localhost:3000',
  pageApiUrl: 'https://commons.wikimedia.org/w/api.php?format=json&action=query&origin=*&redirects=&titles=',
  imageApiUrl: 'https://commons.wikimedia.org/w/api.php?format=json&action=query&generator=images&prop=imageinfo&redirects=resolve&iiprop=extmetadata%7Ctimestamp%7Ccomment%7Ccanonicaltitle%7Curl%7Csize%7Cdimensions%7Csha1%7Cmime%7Cthumbmime%7Cmediatype%7Cbitdepth&origin=*',
  wikipediaApiUrl: 'https://de.wikipedia.org/w/api.php?action=query&origin=*&format=json&list=search&srsearch=intitle:',
  wikipediaBaseUrl: 'https://de.wikipedia.org/wiki/'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
