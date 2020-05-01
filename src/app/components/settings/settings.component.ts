import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { PersistenceService } from '../../services/persistenceService';
import { Training } from '../../../sharedTypes';
import { MessageDialogComponent, ConfirmDialogComponent } from '../dialogs';
import {MatDialog } from '@angular/material/dialog';


interface Species {
  id: number;
  name: string;
  taxonomicName: string;
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

  hideUnselected = false;

  importedFile = null;

  showImport = false;

  constructor(
    private persistenceService: PersistenceService,
    public dialog: MatDialog
    ) { }

  ngOnInit(): void {
    this.refreshTrainings();
    this.persistenceService.loadSpecies().then(
      (result: Species[]) => this.allSpecies = result
    );
  }

  refreshTrainings() {
    this.persistenceService.getTrainings().then(
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

  toggleSelectView() {
    this.hideUnselected = !this.hideUnselected;
  }

  saveTraining() {
    const name = this.trainingNameFieldControl.value;
    if (name.length < 1) {
      this.showDialog('Please enter a name');
      return;
    }
    if (this.selectedSpecies.length < 1) {
      this.showDialog('Please select at least one species');
      return;
    }
    if (!this.currentTraining) {
      const existing = this.trainings.find(training => training.name === name);
      if (existing) {
        this.showDialog('There is already a training with name "' + name + '". Please choose another name');
        return;
      }
    }
    const onSuccess = () => {
      this.cancel();
      this.refreshTrainings();
      this.showDialog('Training saved');
    }
    if (this.currentTraining) {
      this.persistenceService.updateTraining(
        {
          id: this.currentTraining.id,
          name: this.trainingNameFieldControl.value,
          speciesId: this.selectedSpecies
        }
      ).then(onSuccess);
    } else {
      this.persistenceService.saveTraining(
        {
          name: this.trainingNameFieldControl.value,
          species: this.selectedSpecies
        }
      ).then(onSuccess);
    }
  }

  async editTraining(training: Training) {
    this.persistenceService.loadSpeciesByTraining(training.id).then(
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

  showDialog(message: string, cb: () => void = null) {
    const dialogRef = this.dialog.open(MessageDialogComponent, {
      width: '350px',
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

  confirmDelete(training: Training) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        message: 'Do you really want to delete ' + training.name + '?'
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.persistenceService.deleteTraining(training.id).then(
          () => this.trainings = this.trainings.filter(s => s.id !== training.id),
          err => console.log('Species could not be deleted: ', err)
        );
      }
    });
  }

  exportDB() {
    this.persistenceService.exportDB().then(
      data => {
        const blob = new Blob([data], { type: 'application/json'});
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.download = 'bird-trainer-db.json';
        anchor.href = url;
        anchor.click();
      }
    );
  }

  selectFile(event) {
    console.log('importDB', event.target.files);
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;
      this.importedFile = file;
    }
  }

  unsetFile() {
    this.importedFile = null;
  }

  importDB() {
    if (this.importedFile) {
      try {
        this.persistenceService.importDB(this.importedFile);
      } catch(err) {
        this.showDialog('Import failed: ' + err.message);
      }
      this.importedFile = null;
    }
  }
}
