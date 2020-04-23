import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { PersistenceService } from '../../services/persistenceService';
import { Training } from '../../../sharedTypes';

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

  trainings: Array<Training>;

  currentTraining: Training;

  allSpecies: Species[];

  selectedSpecies: number[] = [];

  constructor(private dbService: PersistenceService) { }

  ngOnInit(): void {
    this.refreshTrainings();
    this.dbService.getSpecies().then(
      (result: Species[]) => this.allSpecies = result
    );
  }

  refreshTrainings() {
    this.dbService.getTrainings().then(
      (trainings: Array<Training>) => this.trainings = trainings
    );
  }

  createTraining() {
    this.showForm = true;
  }

  toggleSpecies(evt, species) {
    if (this.selectedSpecies.indexOf(species.id) < 0) {
      console.log('add', species);
      this.selectedSpecies.push(species.id);
      return false;
    } else {
      console.log('remove', species);
      this.selectedSpecies = this.selectedSpecies.filter(r => r !== species.id);
      return false;
    }
  }

  saveTraining() {
    if (this.currentTraining) {
      this.dbService.updateTraining(
        {
          id: this.currentTraining.id,
          name: this.trainingNameFieldControl.value,
          speciesId: this.selectedSpecies
        }
      ).then(() => {
        this.cancel();
        this.refreshTrainings();
      });
    } else {
      this.dbService.saveTraining(
        {
          name: this.trainingNameFieldControl.value,
          species: this.selectedSpecies
        }
      ).then(() => {
        this.cancel();
        this.refreshTrainings();
      });
    }
  }

  async editTraining(training: Training) {
    this.dbService.loadSpeciesByTraining(training.id).then(
      assignedItems => {
        this.selectedSpecies = assignedItems;
        this.showForm = true;
        this.trainingNameFieldControl.patchValue(training.name);
        console.log(assignedItems);
        this.currentTraining = training;
      }
    );
  }

  cancel() {
    this.showForm = false;
    this.trainingNameFieldControl.patchValue('');
    this.selectedSpecies = [];
    this.currentTraining = null;
  }

  isSelected(species) {
    return this.selectedSpecies.indexOf(species.id) > -1;
  }
}
