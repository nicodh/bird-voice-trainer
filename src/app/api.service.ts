import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

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

export interface RecordingsResponse {
  numRecordings: number;
  numSpecies: number;
  page: number;
  numPages: number;
  recordings: Recording[];
}

export interface Recording {
  id: number;
  gen: string;
  sp: string;
  ssp: string;
  en: string;
  rec: string;
  cnt: string;
  loc: string;
  lat: number;
  lng: number;
  alt: number;
  type: string;
  url: string;
  file: string;
  'file-name': string; // mp3
  sono: {
      small: string;
      med: string;
      large: string;
      full: string;
  },
  lic: string;
  q: string;
  length: string;
  time: string;
  date: string;
  uploaded: string;
  also: Array<string>,
  rmk: string;
  'bird-seen': string;
  'playback-used': string;
};

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

}
