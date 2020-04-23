import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { ApiService, AutoSuggestItem } from '../../services/apiService';
import { AudioService } from '../../services/audioService';
import { PersistenceService } from '../../services/persistenceService';
import { StreamState } from '../../services/streamState';
import { Observable, from } from 'rxjs';
import { debounceTime, switchMap, tap, finalize } from 'rxjs/operators';

import { Recording, Species } from '../../../sharedTypes';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  isLoading = false;

  loadingRecords = false;

  showSpeciesList = true;

  searchFieldControl = new FormControl('');

  suggestions$: Observable<AutoSuggestItem[]>;

  selectedSpecies: AutoSuggestItem;

  editedSpecies: Species;

  recordings$: Observable<Recording[]>;

  currentIndex: number;

  state: StreamState;

  selectedRecordings: Recording[] = [];

  hideUnselected = false;

  species$: Observable<Species[]>;

  viewMode = 'import';

  constructor(
    private apiService: ApiService,
    private audioService: AudioService,
    private persistenceService: PersistenceService
    ) {
      this.audioService.getState()
      .subscribe(state => {
        this.state = state;
      });
    }

  private reset() {
    this.selectedRecordings = [];
    this.searchFieldControl.patchValue('');
    this.recordings$ = from([]);
    this.selectedSpecies = null;
    this.viewMode = 'import';
    this.isLoading = false;
  }

  ngOnInit(): void {
    this.suggestions$ = this.searchFieldControl.valueChanges.pipe(
      debounceTime(500),
      tap(() => this.isLoading = true),
      switchMap(value => this.apiService.getAutoSuggests(value)
      .pipe(
        finalize(() => this.isLoading = false),
      )
      )
    );
    this.species$ = from(this.persistenceService.loadSpecies());
  }

  editSpecies(species: Species) {
    console.log(species);
    this.viewMode = 'edit';
    this.loadingRecords = true;
    this.searchFieldControl.patchValue(species.name);
    this.editedSpecies = species;
    this.recordings$ = this.apiService.getRecordsForSpecies(species.latin_name);
    this.persistenceService.getRecordsBySpecies(species.id).toArray().then(
      recordings => this.selectedRecordings = recordings
    );
  }

  onOptionSelected(selectedOption: AutoSuggestItem) {
    console.log(selectedOption);
    this.loadingRecords = true;
    this.selectedSpecies = selectedOption;
    this.searchFieldControl.patchValue(selectedOption.common_name);
    this.recordings$ = this.apiService.getRecordsForSpecies(selectedOption.species);
  }

  toggleSelectView() {
    this.hideUnselected = !this.hideUnselected;
  }

  async saveRecordings() {
    this.audioService.stop();
    console.log(this.selectedRecordings);
    let speciesId = 0;
    if (this.editedSpecies) {
      speciesId = this.editedSpecies.id;
    } else {
      speciesId = await this.persistenceService.addSpecies(
        {name: this.selectedSpecies.common_name, latin_name: this.selectedSpecies.species, }
      );
    }
    const preparedRecordings = this.selectedRecordings.map(recording => {
      return {species: speciesId, ...recording};
    });
    this.persistenceService.addRecordings(preparedRecordings).then(
      count => console.log(count),
      err => console.log(err)
    );
    this.reset();
  }

  isSelected(recording) {
    return this.selectedRecordings.find(selectedRecording => selectedRecording.id === recording.id );
  }

  toggleRecord(evt, recording: Recording) {
    if (!evt.target.checked) {
      console.log('add', recording);
      this.selectedRecordings.push(recording);
    } else {
      console.log('remove', recording);
      this.selectedRecordings = this.selectedRecordings.filter(r => r !== recording);
    }
  }

  playStream(url, index) {
    this.currentIndex = index;
    this.audioService.stop();
    this.audioService.playStream('https:' + url)
    .subscribe(events => {
      // listening for fun here
      // console.log(events);
    });
  }

  pause() {
    this.audioService.pause();
  }

  play() {
    this.audioService.play();
  }

  stop() {
    this.currentIndex = -1;
    this.audioService.stop();
  }

}
