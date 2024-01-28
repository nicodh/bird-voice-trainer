import { HttpClientJsonpModule, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule, SwUpdate } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ImportComponent } from './components/import/import.component';
import { IntroComponent } from './components/intro/intro.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ShowDialogComponent, TrainerComponent } from './components/trainer/trainer.component';
import { ApiService } from './services/apiService';
import { PersistenceService } from './services/persistenceService';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';

import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  ConfirmDialogComponent,
  HelpDialogComponent,
  MessageDialogComponent,
  SpeciesInfoDialogComponent
} from './components/dialogs/';


@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    TrainerComponent,
    ImportComponent,
    IntroComponent,
    ShowDialogComponent,
    MessageDialogComponent,
    SpeciesInfoDialogComponent,
    ConfirmDialogComponent,
    HelpDialogComponent
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
    MatIconModule,
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
export class AppModule {
  constructor(swUpdate: SwUpdate) {
    swUpdate.versionUpdates.subscribe(() => {
      if (confirm('New version available. Load now?')) {
        window.location.reload();
      }
    });
  }
}
