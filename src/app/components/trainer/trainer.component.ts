import { Component, OnInit } from '@angular/core';
import { PersistenceService } from '../../services/persistenceService';
import { Training, Species, Recording } from 'src/sharedTypes';
import { AudioService } from '../../services/audioService';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit {

  trainings: Array<{ name: string; }>;

  constructor(
    private dbService: PersistenceService,
    private audioService: AudioService
    ) { }

  viewMode: 'default';

  currentTraining: Training;

  currentSpecies: Species;

  currentRecordings: Recording[];

  currentRecording: Recording;

  playing = false;

  lastSpecies: Species;

  ngOnInit(): void {
    this.dbService.getTrainings().then(
      (trainings: Array<{ name: string; }>) => this.trainings = trainings
    );
  }

  loadTraining(training) {
    console.log(training);
    this.dbService.loadTraining(training.id).then(
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
    this.currentSpecies = this.getRandom(this.currentTraining.species);
    this.dbService.getRecordsBySpecies(this.currentSpecies.id).toArray().then(
      recordings => {
        this.currentRecordings = recordings;
        this.currentRecording = this.getRandom(recordings, false);
        this.playStream(this.currentRecording.file);
      }
    );
  }

  getRandom(arr, checkNotLast: boolean = true) {
    const item = arr[Math.floor(Math.random() * arr.length)];
    if (checkNotLast) {
      if (item === this.lastSpecies) {
        return this.getRandom(arr, true);
      }
    }
    return item;
  }

  playStream(url: string) {
    this.audioService.stop();
    this.audioService.playStream('https:' + url);
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
}
