import { RouterModule, Routes } from '@angular/router';

import { MapPageComponent } from './components/map-page.component';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export const routes: Routes = [
  {
    path: '',
    component: MapPageComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    MapModule,
    FontAwesomeModule
  ],
  declarations: [MapPageComponent],
  exports: [MapPageComponent]
})
export class MapPageModule {}
