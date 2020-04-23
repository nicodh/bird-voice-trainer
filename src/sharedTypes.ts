export interface Training {
  id?: number;
  name: string;
  species?: Species[];
  speciesId?: number[];
}

export interface RecordingsResponse {
  numRecordings: number;
  numSpecies: number;
  page: number;
  numPages: number;
  recordings: Recording[];
}

export interface Species {
  id: number;
  name: string;
  latin_name: string;
}

export interface Recording {
  id: number;
  species: number;
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
};