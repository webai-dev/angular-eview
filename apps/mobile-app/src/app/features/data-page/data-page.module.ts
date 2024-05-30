import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { DataPageComponent } from './components/data-page.component';
import { DataRoutingModule } from './data.routing.module';
import { FlexmonsterPivotModule } from 'ng-flexmonster';

@NgModule({
  imports: [
    SharedModule,
    MapModule,
    NgbModule,
    FontAwesomeModule,
    InfiniteScrollModule,
    FlexmonsterPivotModule,
    DataRoutingModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [DataPageComponent],
  exports: [DataPageComponent]
})
export class DataPageModule {}
