import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PostFiltersComponent } from './components/post-filters.component';
import { FlexmonsterPivotModule } from 'ng-flexmonster';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FlexmonsterComponent } from './components/flexmonster.component'

export const routes: Routes = [
  {
    path: '',
    component: PostFiltersComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    NgbModule,
    RouterModule.forChild(routes),
    MapModule,
    FontAwesomeModule,
    FlexmonsterPivotModule,
    InfiniteScrollModule
  ],
  declarations: [PostFiltersComponent, FlexmonsterComponent],
  entryComponents: [FlexmonsterComponent],
  exports: [PostFiltersComponent]
})
export class PostFiltersModule {}
