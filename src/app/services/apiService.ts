import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Recording, RecordingsResponse, ImageInfo } from '../../sharedTypes';

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
        imageinfo: Array<ImageInfo>
      }
    }
  };
}



@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  minimalRecordingLength = 0.10;

  imageSearchLimit = 50;
  imageThumbWidth = 350;
  imageThumbHeight = 350;

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
      map((res: RecordingsResponse) => res.recordings.filter(
        (recording: Recording) => Number(recording.length.replace(':', '.')) >= this.minimalRecordingLength)
      )
    );
  }

  handleError() {

  }

  getImagesForSpecies(name: string, callback: (images: ImageInfo[]) => void) {
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
          const dynamicUrlPart = '&gimlimit=' + this.imageSearchLimit
             + '&iiurlwidth=' + this.imageThumbWidth
             + '&iiurlheight=' + this.imageThumbHeight;
          this.http.get(environment.imageApiUrl + dynamicUrlPart + '&pageids=' + matchingPageId).subscribe(
            (response: WikimediaResponse) => {
              const images = [];
              Object.values(response.query.pages).forEach(
                page => {
                  if (page.imageinfo) {
                    page.imageinfo.forEach(
                      imageinfo => {
                        images.push(imageinfo);
                      }
                    );
                  }
                }
              );
              callback(images);
            }
          );
        }
      }
    });
  }
}
