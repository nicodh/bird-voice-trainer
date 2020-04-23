import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { TrainerComponent } from './components/trainer/trainer.component';
import { ImportComponent } from './components/import/import.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ApiService } from './services/apiService';
import { PersistenceService } from './services/persistenceService';
import { environment } from '../environments/environment';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';

import {MatCheckboxModule} from '@angular/material/checkbox';
import { AngularSvgIconModule } from 'angular-svg-icon';

// const dbConfig: DBConfig  = {
//   name: 'bird-trainer',
//   version: 1,
//   objectStoresMeta: [
//     {
//       store: 'recordings',
//       storeConfig: { keyPath: 'id', autoIncrement: true },
//       storeSchema: [
//         { name: 'species', keypath: 'species', options: { unique: false } },
//       ]
//     },
//     {
//       store: 'species',
//       storeConfig: { keyPath: 'id', autoIncrement: true },
//       storeSchema: [
//         { name: 'name', keypath: 'name', options: { unique: true } },
//         { name: 'latin_name', keypath: 'latin_name', options: { unique: true } },
//       ]
//     },
//     {
//       store: 'trainings',
//       storeConfig: { keyPath: 'id', autoIncrement: true },
//       storeSchema: [
//         { name: 'name', keypath: 'name', options: { unique: false } },
//       ]
//     },
//     {
//       store: 'trainingSpecies',
//       storeConfig: { keyPath: 'id', autoIncrement: true },
//       storeSchema: [
//         { name: 'training', keypath: 'training', options: { unique: false } },
//         { name: 'species', keypath: 'species', options: { unique: false } },
//       ]
//     }
//   ]
// };

@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    TrainerComponent,
    ImportComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NoopAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatButtonModule,
    HttpClientModule,
    AngularSvgIconModule.forRoot()
  ],
  providers: [
    ApiService,
    PersistenceService,
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
