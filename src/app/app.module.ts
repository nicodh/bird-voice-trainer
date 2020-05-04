import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './components/settings/settings.component';
import { TrainerComponent, ShowDialogComponent } from './components/trainer/trainer.component';
import { ImportComponent } from './components/import/import.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { SwUpdate } from '@angular/service-worker';
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
import { MatIconModule } from '@angular/material/icon';

import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  MessageDialogComponent,
  SpeciesInfoDialogComponent,
  ConfirmDialogComponent,
  HelpDialogComponent
} from './components/dialogs/';


@NgModule({
  declarations: [
    AppComponent,
    SettingsComponent,
    TrainerComponent,
    ImportComponent,
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
    swUpdate.available.subscribe(() => {
      if (confirm('New version available. Load now?')) {
        window.location.reload();
      }
    });
  }
}
