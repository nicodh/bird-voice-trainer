import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ImageInfo, Recording, RecordingsResponse } from '../../sharedTypes';

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

  imageSearchLimit = 150;
  imageThumbWidth = 350;
  imageThumbHeight = 350;

  getAutoSuggests(searchTerm: string = ''): Observable<AutoSuggestItem[]> {
    const options = {
      params: new HttpParams().set('query', searchTerm.trim())
    };
    if (searchTerm.length < 1) {
      return of([]);
    }
    const url = environment.apiUrl + '/api/internal/completion/species';
    return this.http.get(url, options).pipe(
      catchError(err => of([])),
      map((res: AutoSuggestResponse) => {
        return res.data.map((data, index) => {
          return {species: res.suggestions[index], ...data};
        });
      })
    );
  }

  getRecordsForSpecies(species: string): Promise<RecordingsResponse | null>{
    const options = {
      params: new HttpParams().set('query', species)
    };
    const url = environment.apiUrl + '/api/2/recordings';
    return this.http.get(url, options).pipe(
      catchError(err => of([])),
      map((res: RecordingsResponse) => {
        if(Array.isArray(res.recordings)) {
          res.recordings = res.recordings.filter(
            (recording: Recording) => Number(recording.length.replace(':', '.')) >= this.minimalRecordingLength
          );
          return res;
        } else {
          console.log('No records found!');
          return null;
        }
        
      })
    ).toPromise();
  }

  handleError() {

  }

  getImagesForSpecies(name: string, callback: (images: ImageInfo[]) => void, imageSearchLimit = 0) {
    if (imageSearchLimit === 0) {
      imageSearchLimit = this.imageSearchLimit;
    }
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
          const dynamicUrlPart = '&gimlimit=' + imageSearchLimit
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
                        {
                          if(imageinfo.url && imageinfo.url.indexOf('Wikispecies-logo') < 0){
                            images.push(imageinfo);
                          }
                        }
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

  getWikipediaLink(term) {
    return this.http.get(environment.wikipediaApiUrl + term);
    // https://de.wikipedia.org/wiki/
  }
}
