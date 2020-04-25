import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { TrainerComponent, ShowDialogComponent } from './components/trainer/trainer.component';
import { ImportComponent, ImportDialogComponent } from './components/import/import.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ApiService } from './services/apiService';
import { PersistenceService } from './services/persistenceService';
import { environment } from '../environments/environment';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import {MatCheckboxModule} from '@angular/material/checkbox';
import { AngularSvgIconModule } from 'angular-svg-icon';


@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    TrainerComponent,
    ImportComponent,
    ShowDialogComponent,
    ImportDialogComponent
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
    MatDialogModule,
    HttpClientModule,
    HttpClientJsonpModule,
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
