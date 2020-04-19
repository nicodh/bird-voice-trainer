import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { ApiService, AutoSuggestItem, Recording } from '../api.service';
import { AudioService } from '../services/audioService';
import { StreamState } from '../services/streamState';
import { Observable } from 'rxjs';
import { debounceTime, switchMap, tap, finalize } from 'rxjs/operators';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  isLoading = false;

  searchFieldControl = new FormControl('');

  suggestions$: Observable<AutoSuggestItem[]>;

  recordings$: Observable<Recording[]>;

  currentIndex: number;

  state: StreamState;

  selectedRecords: Recording[] = [];

  constructor(
    private apiService: ApiService,
    private audioService: AudioService
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
    this.isLoading = true;
    this.searchFieldControl.patchValue(selectedOption.common_name);
    this.recordings$ = this.apiService.getRecordsForSpecies(selectedOption.species).pipe(
      finalize(() => this.isLoading = false)
    );
    this.recordings$.subscribe(records => console.log(records));
  }

  toggleRecord(evt, recording: Recording) {
    if (!evt.target.checked) {
      console.log('add', recording);
      this.selectedRecords.push(recording);
    } else {
      console.log('remove', recording);
      this.selectedRecords = this.selectedRecords.filter(r => r !== recording);
    }
    console.log(this.selectedRecords);
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
