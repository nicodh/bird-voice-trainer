import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';

interface Species {
  id: number;
  name: string;
  latin_name: string;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  showForm = false;

  trainingNameFieldControl = new FormControl('');

  trainings: Array<{ name: string; }>;

  allSpecies: Species[];

  selectedSpecies: Species[] = [];

  constructor(private dbService: NgxIndexedDBService) { }

  ngOnInit(): void {
    this.dbService.getAll('trainings').then(
      (trainings: Array<{ name: string; }>) => this.trainings = trainings
    );
  }

  createTraining() {
    this.showForm = true;
    this.dbService.getAll('species').then(
      (result: Species[]) => this.allSpecies = result
    );
  }

  toggleSpecies(evt, species) {
    if (!evt.target.checked) {
      console.log('add', species);
      this.selectedSpecies.push(species);
    } else {
      console.log('remove', species);
      this.selectedSpecies = this.selectedSpecies.filter(r => r !== species);
    }
  }

  saveTraining() {
    this.dbService.add(
      'trainings',
      {name: this.trainingNameFieldControl.value}
    ).then(
      insertId => {
        this.selectedSpecies.forEach(species => {
          this.dbService.add(
            'trainingSpecies',
            {training: insertId, species: species.id}
          );
        });
      },
      err => console.log(err)
    );
  }

  editTraining(training) {
    console.log(training);
  }

  cancel() {
    this.showForm = false;
    this.selectedSpecies = [];
  }
}
