import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { ApiService, AutoSuggestItem } from '../../services/apiService';
import { AudioService } from '../../services/audioService';
import { PersistenceService } from '../../services/persistenceService';
import { StreamState } from '../../services/streamState';
import { ConfirmDialogComponent, HelpDialogComponent, MessageDialogComponent, SpeciesInfoDialogComponent } from '../dialogs/';

import { Recording, RecordingsResponse, Species } from '../../../sharedTypes';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit, OnDestroy {

  isLoading = false;

  loadingRecords = false;

  showSpeciesList = true;

  searchFieldControl = new UntypedFormControl('');

  suggestions$: Observable<AutoSuggestItem[]>;

  selectedOption: AutoSuggestItem;

  currentSpecies: Species;

  // recordings$: Observable<RecordingsResponse>;

  recordings: Recording[] = [];

  currentIndex: number;

  state: StreamState;

  selectedRecordings: Recording[] = [];

  hideUnselected = false;

  importedSpecies: Species[] = [];

  selectedImageUrl: string;

  viewMode = 'default';

  startFrom = 0;
  limitTo = 10;

  constructor(
    private apiService: ApiService,
    private audioService: AudioService,
    private persistenceService: PersistenceService,
    public dialog: MatDialog
    ) {
      this.audioService.getState()
      .subscribe(state => {
        this.state = state;
      });
    }

  public reset() {
    this.selectedRecordings = [];
    this.recordings = [];
    this.searchFieldControl.patchValue('');
    // this.recordings$ = from([]);
    this.selectedOption = null;
    this.currentSpecies = null;
    this.currentIndex= -1;
    this.viewMode = 'default';
    this.loadingRecords = false;
    this.isLoading = false;
    this.audioService.stop();
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
    this.persistenceService.loadSpecies().then(
      species => this.importedSpecies = species
    );
  }

  ngOnDestroy() {
    this.audioService.stop();
  }

  editSpecies(species: Species) {
    console.log(species);
    this.viewMode = 'edit';
    this.loadingRecords = true;
    this.searchFieldControl.patchValue(species.name);
    this.currentSpecies = species;
    this.apiService.getRecordsForSpecies(species.taxonomicName).then(
      (res: RecordingsResponse) => this.recordings = res.recordings
    );
    this.persistenceService.getRecordsBySpecies(species.id).toArray().then(
      recordings => {
        console.log('Recordings loaded!: ' + recordings.length);
        this.selectedRecordings = recordings;
      }
    );
    this.apiService.getWikipediaLink(this.currentSpecies.name).subscribe(
      (res: any) => {
        if (res.query.search.length && res.query.search[0].title) {
          this.currentSpecies.wikipediaLink = 'https://de.wikipedia.org/wiki/' + res.query.search[0].title;
        }
      }
    );
  }

  onOptionSelected(selectedOption: AutoSuggestItem) {
    console.log(selectedOption);
    this.loadingRecords = true;
    this.selectedOption = selectedOption;
    const existing = this.importedSpecies.find(species => species.taxonomicName === selectedOption.species);
    if (existing) {
      this.editSpecies(existing);
      return;
    } else {
      this.currentSpecies = {
        id: 0,
        name: selectedOption.common_name,
        taxonomicName: selectedOption.species,
        image: '',
        recordings: Number(selectedOption.recordings)
      };
    }
    this.searchFieldControl.patchValue(selectedOption.common_name);
    this.apiService.getRecordsForSpecies(selectedOption.species).then(
      (res: RecordingsResponse) => {
        this.recordings = res.recordings;
      }
    );
    // remove focus from input field to hide keyboard
    document.getElementById('searchfield').blur();
  }

  toggleSelectView() {
    this.hideUnselected = !this.hideUnselected;
  }

  showMore() {
    this.limitTo += 10;
  }

  async saveRecordings() {
    this.audioService.stop();
    console.log(this.selectedRecordings);
    const speciesId = await this.saveSpecies();
    const preparedRecordings = this.selectedRecordings.map(recording => {
      return {species: speciesId, ...recording};
    });
    this.persistenceService.addRecordings(preparedRecordings).then(
      () => {
        this.showDialog(preparedRecordings.length + ' recordings saved!');
      },
      err => console.log(err)
    );
    this.reset();
  }

  async saveSpecies(): Promise<number> {
    let speciesId = 0;
    if (this.currentSpecies.id) {
      speciesId = this.currentSpecies.id;
      this.persistenceService.updateSpeciesImage(
        speciesId,
        this.currentSpecies.image
      );
    } else {
      speciesId = await this.persistenceService.addSpecies(
        {
          name: this.selectedOption.common_name,
          taxonomicName: this.selectedOption.species,
        }
      );
      this.currentSpecies.id = speciesId;
    }
    this.persistenceService.loadSpecies().then(
      species => this.importedSpecies = species
    );
    return speciesId;
  }

  isSelected(recording: Recording) {
    return this.selectedRecordings.find(selectedRecording => selectedRecording.id === recording.id );
  }

  toggleRecord(evt, recording: Recording) {
    if (this.isSelected(recording)) {
      console.log('remove', recording);
      this.selectedRecordings = this.selectedRecordings.filter(r => r.id !== recording.id);
    } else {
      console.log('add', recording);
      this.selectedRecordings.push(recording);
    }
    evt.stopPropagation();
  }

  playStream(url: string, index: number) {
    this.currentIndex = index;
    this.audioService.stop();
    this.audioService.playStream(url).subscribe(events => {});
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

  showInfoDialog($event = null) {
    if ($event) {
      $event.stopPropagation();
    }
    const species = this.currentSpecies ? this.currentSpecies : this.selectedOption;
    const dialogRef = this.dialog.open(SpeciesInfoDialogComponent, {
      width: '550px',
      data: {
        type: 'speciesInfo',
        species,
        updated: false
      }
    });
    dialogRef.afterClosed().subscribe((updated: boolean) => {
      if(updated) {
        this.saveSpecies();
      }
    });
  }

  showHelpDialog($event = null) {
    if ($event) {
      $event.stopPropagation();
    }
    this.dialog.open(HelpDialogComponent, {
      width: '550px',
    });
  }

  confirmDelete(species: Species) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Do you really want to delete ' + species.name + ' and all recordings?'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.persistenceService.deleteSpecies(species.id).then(
          () => this.importedSpecies = this.importedSpecies.filter(s => s.id !== species.id),
          err => console.log('Species could not be deleted: ', err)
        );
      }
    });
  }

  showDialog(message: string, cb: () => void = null, width = '250px') {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: width,
      data: {
        type: 'message',
        message
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      if (cb) {
        cb();
      }
    });
  }
}
