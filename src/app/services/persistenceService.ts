import { Injectable } from '@angular/core';
import { Training, Species, Recording } from '../../sharedTypes';
import Dexie from 'dexie';
import { importDB, exportDB } from 'dexie-export-import';

interface TrainingSpecies {
  training: number;
  species: number;
}

class BirdVoiceTrainer extends Dexie {
  species: Dexie.Table<Species, number>;
  recordings: Dexie.Table<Recording, number>;
  trainings: Dexie.Table<Training, number>;
  trainingSpecies: Dexie.Table<TrainingSpecies, number>;

  constructor() {
    super('BirdVoiceTrainer');
    this.version(1).stores({
      species: '++id, taxonomicName',
      recordings: '++id, species',
      trainings: '++id',
      trainingSpecies: '++id, training'
    });
    this.version(2).stores({
      trainingSpecies: '++id, training, species'
    });
    this.version(3).stores({
      species: '++id, taxonomicName, name',
    });
    this.species = this.table('species');
    this.recordings = this.table('recordings');
    this.trainings = this.table('trainings');
    this.trainingSpecies = this.table('trainingSpecies');
  }
}

@Injectable({
  providedIn: 'root'
})
export class PersistenceService {

  db: BirdVoiceTrainer;

  constructor() {
    this.db = new BirdVoiceTrainer();
  }

  addSpecies(species) {
    return this.db.species.add(species);
  }

  updateSpeciesImage(speciesId: number, image: string) {
    return this.db.species.update(speciesId, {image});
  }

  deleteSpecies(speciesId: number) {
    this.db.recordings.where('species').equals(speciesId).delete().then(
      deleted => console.log('deleted recordings: ' + deleted),
      err => console.log('error deleting record', err)
    );
    this.db.trainingSpecies.where('species').equals(speciesId).delete().then(
      deleted => console.log('deleted trainings: ' + deleted),
      err => console.log('error deleting trainings', err)
    );
    return this.db.species.delete(speciesId);
  }

  deleteTraining(trainingsId: number) {
    this.db.trainingSpecies.where('training').equals(trainingsId).delete().then(
      deleted => console.log('deleted trainings: ' + deleted),
      err => console.log('error deleting trainings', err)
    );
    return this.db.trainings.delete(trainingsId);
  }

  addRecordings(recordings: Recording[]) {
    return this.db.recordings.bulkAdd(recordings);
  }

  async loadSpeciesByTraining(id: number): Promise<number[]> {
    return this.db
      .trainingSpecies
      .where('training')
      .equals(id)
      .toArray()
      .then(i => i.map(r => r.species)
    );
  }

  async loadTraining(id: number) {
    const training: Training = await this.db.trainings.get(id);
    const ids = await this.db
      .trainingSpecies
      .where('training')
      .equals(id)
      .toArray();
    console.log(ids);
    const species = await this.db
      .species
      .where('id')
      .anyOf(ids.map(items => items.species))
      .toArray();
    return {species, ...training};
  }

  loadSpecies(): Promise<Species[]> {
    return this.db.species.orderBy('name').toArray();
  }

  getTrainings(): Promise<Training[]> {
    return this.db.trainings.toArray();
  }

  async updateTraining(training: Training) {
    this.db.trainings.update(training.id, training);
    const relations = training.speciesIds.map(
      id => {
        return {training: training.id, species: id};
      }
    );
    this.db.trainingSpecies
      .where('training')
      .equals(training.id)
      .delete()
      .then(() => {
        this.db.trainingSpecies.bulkAdd(relations);
      });
  }

  getSpecies(taxonomicName) {
    return this.db.species.where('taxonomicName').equals(taxonomicName);
  }

  getRecordsBySpecies(speciesId: number) {
    return this.db.recordings.where('species').equals(speciesId);
  }

  saveTraining(training: Training) {
    const promises = [];
    this.db.trainings.add(
      {name: training.name}
    ).then(
      insertId => {
        const relations = training.speciesIds.map(
          (id: number) => {
            return {training: insertId, species: id};
          }
        );
        this.db.trainingSpecies.bulkAdd(relations);
      },
      err => console.log(err)
    );
    return Promise.all(promises);
  }


  async updateRecordings(speciesId: number, recordings: Recording[]) {
    this.db.recordings
    .where('species')
    .equals(speciesId)
    .delete()
    .then(() => {
      this.db.recordings.bulkAdd(recordings);
    });
  }

  exportDB() {
    return exportDB(this.db, {prettyJson: true});
  }

  async importDB(file) {
    await this.db.delete();
    const db = await importDB(file);
    console.log('Import complete', db);
  }
}
