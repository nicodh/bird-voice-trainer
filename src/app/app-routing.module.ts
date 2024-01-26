import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImportComponent } from './components/import/import.component';
import { IntroComponent } from './components/intro/intro.component';
import { SettingsComponent } from './components/settings/settings.component';
import { TrainerComponent } from './components/trainer/trainer.component';


const routes: Routes = [
  { path: '', component: IntroComponent },
  { path: 'trainer', component: TrainerComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'import', component: ImportComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
