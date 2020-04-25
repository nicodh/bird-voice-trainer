import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Recording, RecordingsResponse } from '../../sharedTypes';

export interface AutoSuggestResponse {
  data: AutoSuggestItem[];
  suggestions: string[];
}

export interface AutoSuggestItem {
  common_name: string;
  recordings: string;
  species_nr: string;
  species?: string;
}

interface WikimediaResponse {
  query: {
    pages: {
      [id: number]: {
        pageid: number;
        title: string;
        imageinfo: [{
          height: number;
          width: number;
          url: string;
          thumbheight: number;
          thumbwidth: number;
          thumburl: string;
        }]
      }
    }
  };
}



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  getAutoSuggests(searchTerm: string = ''): Observable<AutoSuggestItem[]> {
    const options = {
      params: new HttpParams().set('query', searchTerm.trim())
    };
    if (searchTerm.length < 1) {
      return of([]);
    }
    return this.http.get(environment.apiUrl + '/api/internal/completion/species', options).pipe(
      catchError(err => of([])),
      map((res: AutoSuggestResponse) => {
        return res.data.map((data, index) => {
          return {species: res.suggestions[index], ...data};
        });
      })
    );
  }

  getRecordsForSpecies(species: string): Observable<Recording[]> {
    const options = {
      params: new HttpParams().set('query', species)
    };
    return this.http.get(environment.apiUrl + '/api/2/recordings', options).pipe(
      catchError(err => of([])),
      map((res: RecordingsResponse) => res.recordings)
    );
  }

  handleError() {

  }

  getImagesForSpecies(name: string, callback: (imageUrls: string[]) => void) {
    const limit = 50;
    const thumbWidth = 350;
    const thumbHeight = 350;
    this.http.get(environment.pageApiUrl + name).subscribe(
      (data: WikimediaResponse) => {
      {
        const pages = data?.query?.pages;
        console.log('pages: ', pages);
        let matchingPageId = 0;
        if (pages) {
          const pageIds = Object.keys(pages);
          pageIds.forEach(
            pageId => {
            if (Number(pageId) > 0 && pages[pageId].title === name) {
              matchingPageId = Number(pageId);
            }
          });
        }
        if (matchingPageId) {
          const dynamicUrlPart = '&gimlimit=' + limit + '&iiurlwidth=' + thumbWidth + '&iiurlheight=' + thumbHeight;
          this.http.get(environment.imageApiUrl + dynamicUrlPart + '&pageids=' + matchingPageId).subscribe(
            (response: WikimediaResponse) => {
              const imageUrls = [];
              Object.values(response.query.pages).forEach(
                page => {
                  if (page.imageinfo) {
                    page.imageinfo.forEach(
                      imageinfo => {
                        imageUrls.push(imageinfo.thumburl);
                      }
                    );
                  }
                }
              );
              callback(imageUrls);
            }
          );
        }
      }
    });
  }

  // https://commons.wikimedia.org/w/api.php?format=json&action=query&list=search&srprop=size&srlimit=30&srsearch=morelike%3AKohlmeise

}
