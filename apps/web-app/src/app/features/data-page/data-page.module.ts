import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { DataPageComponent } from './components/data-page.component';

export const routes: Routes = [
  {
    path: '',
    component: DataPageComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    MapModule,
    NgbModule,
    FontAwesomeModule,
    InfiniteScrollModule
  ],
  declarations: [DataPageComponent],
  exports: [DataPageComponent]
})
export class DataPageModule {}
