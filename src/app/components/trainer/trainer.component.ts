import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Recording, Species, Training } from 'src/sharedTypes';
import { AudioService } from '../../services/audioService';
import { PersistenceService } from '../../services/persistenceService';
import { MessageDialogComponent } from '../dialogs/messageDialog.component';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit, OnDestroy {

  trainings: Array<{ name: string; }>;

  constructor(
    private persistenceService: PersistenceService,
    private audioService: AudioService,
    public dialog: MatDialog,
    ) { }

  resultFieldControl: UntypedFormControl;

  viewMode: 'default';

  currentTraining: Training;

  currentSpecies: Species;

  currentRecordings: Recording[];

  currentRecording: Recording;

  playing = false;

  lastSpecies: Species;

  playedSpecies: number[] = [];

  playedRecordings: number[] = [];

  matches = 0;
  wrongGuesses = 0;

  ngOnInit(): void {
    document.onkeydown = (evt) => {
      if (this.currentTraining && evt.code === 'Space') {
        this.playing ? this.pause() : this.play();
      }
    };
    this.resultFieldControl = new UntypedFormControl('');
    this.persistenceService.getTrainings().then(
      (trainings: Array<{ name: string; }>) => this.trainings = trainings
    );
  }

  ngOnDestroy() {
    if (this.playing) {
      this.stop();
    }
  }

  loadTraining(training: Training) {
    this.persistenceService.loadTraining(training.id).then(
      loadedTraining => {
        this.currentTraining = loadedTraining;
      }
    );
  }

  start() {
    if (this.currentRecording) {
      this.play();
      return;
    }
    this.nextSpecies();
  }

  reset() {
    this.currentTraining = null;
    this.currentSpecies = null;
    this.currentRecordings = [];
    this.playedRecordings = [];
    this.playedSpecies = [];
    this.matches = 0;
    this.wrongGuesses = 0;
  }

  finishTraining() {
    this.stop();
    this.reset();
  }

  nextSpecies() {
    this.audioService.stop();
    this.playedRecordings = [];
    if (this.playedSpecies.length === this.currentTraining?.species?.length - 1) {
      this.playedSpecies = [];
    } else if (this.currentSpecies) {
      this.playedSpecies.push(this.currentSpecies.id);
    }
    this.currentSpecies = this.getRandom(this.currentTraining.species, this.playedSpecies);
    console.log(this.currentSpecies);
    this.persistenceService.getRecordsBySpecies(this.currentSpecies.id).toArray().then(
      recordings => {
        this.currentRecordings = recordings;
        this.currentRecording = this.getRandom(recordings, this.playedRecordings);
        this.playStream(this.currentRecording.file);
      }
    );
  }

  nextRecording() {
    this.audioService.stop();
    if (this.playedRecordings.length === this.currentRecordings?.length) {
      this.playedRecordings = [];
    }
    if (this.currentRecording) {
      this.playedRecordings.push(this.currentRecording.id);
    }
    this.currentRecording = this.getRandom(this.currentRecordings, this.playedRecordings);
    this.playStream(this.currentRecording.file);
  }

  getRandom(arr, playedItems: number[]) {
    const item = arr[Math.floor(Math.random() * arr.length)];
    if (playedItems.includes(item.id)) {
      return this.getRandom(arr, playedItems);
    }
    return item;
  }

  getResultSuggestions() {
    return this.currentTraining.species.filter(
      species => species.name.indexOf(this.resultFieldControl.value) === 0
    );
  }

  onOptionSelected(species: Species) {
    if (species.id === this.currentSpecies.id) {
      console.log('Success');
      this.matches++;
      this.showCurrentBird('result', () => this.nextSpecies());
      this.audioService.stop();
    } else {
      this.wrongGuesses++;
      this.showDialog('Not correct :-(');
    }
  }

  playStream(url: string) {
    this.audioService.stop();
    url = url.indexOf('http')===0 ? url : 'https:';
    this.audioService.playStream(url).subscribe((evt: Event) => {
      console.log((evt.timeStamp / 1000).toFixed(0) + ' of ' + this.currentRecording.length);
      if (evt.type === 'ended') {
        this.nextRecording();
      }
    });
    this.playing = true;
  }

  pause() {
    this.audioService.pause();
    this.playing = false;
  }

  play() {
    this.audioService.play();
    this.playing = true;
  }

  stop() {
    this.audioService.stop();
    this.playing = false;
  }

  deleteTraining(trainingsId: number) {

  }

  showCurrentBird(type: string, cb: () => void = null) {
    const dialogRef = this.dialog.open(ShowDialogComponent, {
      width: '550px',
      data: {
        type,
        result: this.currentSpecies
      }
    });
    dialogRef.afterClosed().subscribe(() => {
      if (cb) {
        cb();
      }
    });
  }

  showDialog(message: string, cb: () => void = null) {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '250px',
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

@Component({
  selector: 'app-showbird-dialog',
  templateUrl: './dialog.html',
})
export class ShowDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<ShowDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {type: string, result?: Species}) {}

  close(): void {
    this.dialogRef.close();
  }
}
