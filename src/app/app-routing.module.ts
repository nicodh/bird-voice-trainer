import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrainerComponent } from './trainer/trainer.component';
import { SettingsComponent } from './settings/settings.component';
import { ImportComponent } from './import/import.component';


const routes: Routes = [
  { path: 'trainer', component: TrainerComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'import', component: ImportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
