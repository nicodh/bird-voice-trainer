import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { ApiService, AutoSuggestItem, Recording } from '../../api.service';
import { AudioService } from '../../services/audioService';
import { StreamState } from '../../services/streamState';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, tap, finalize } from 'rxjs/operators';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  isLoading = false;

  loadingRecords = false;

  searchFieldControl = new FormControl('');

  suggestions$: Observable<AutoSuggestItem[]>;

  selectedSpecies: AutoSuggestItem;

  recordings$: Observable<Recording[]>;

  currentIndex: number;

  state: StreamState;

  selectedRecordings: Recording[] = [];

  hideUnselected = false;

  constructor(
    private apiService: ApiService,
    private audioService: AudioService,
    private dbService: NgxIndexedDBService
    ) {
      this.audioService.getState()
      .subscribe(state => {
        this.state = state;
      });
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
  }

  onOptionSelected(selectedOption: AutoSuggestItem) {
    this.loadingRecords = true;
    this.selectedSpecies = selectedOption;
    this.searchFieldControl.patchValue(selectedOption.common_name);
    this.recordings$ = this.apiService.getRecordsForSpecies(selectedOption.species);
  }

  toggleSelectView() {
    this.hideUnselected = !this.hideUnselected;
  }

  saveRecordings() {
    this.audioService.stop();
    console.log(this.selectedRecordings);
    let savedRecords = 0;
    this.dbService.add(
      'species',
      {name: this.selectedSpecies.common_name, latin_name: this.selectedSpecies.species, }
    ).then(
      insertId => {
        this.selectedRecordings.forEach(recording => {
          const {id, cnt, file, type, gen, sp, ssp} = recording;
          this.dbService.add(
            'recordings',
            {id, species: insertId, name: this.selectedSpecies.common_name, cnt, file, type, gen, sp, ssp}
          ).then(
            () => savedRecords++,
            err => console.log(err)
          );
        });
      },
      err => console.log(err)
    );
  }

  isSelected(recording) {
    return this.selectedRecordings.indexOf(recording) > -1;
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
