import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { SharedModule } from './features/shared/shared.module';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/dashboard/map'
  }
];

@NgModule({
  imports: [SharedModule, RouterModule.forRoot(routes)]
})
export class AppRoutingModule {}
