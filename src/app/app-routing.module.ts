import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TrainerComponent } from './components/trainer/trainer.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ImportComponent } from './components/import/import.component';


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
