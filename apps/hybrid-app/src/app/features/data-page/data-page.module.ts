import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedModule } from '../shared/shared.module';
import { DataPageComponent } from './components/data-page.component';
import { DataRoutingModule } from './data.routing.module';
import { FlexmonsterPivotModule } from 'ng-flexmonster';
import { PostAnalysisModule } from '../post-analysis/post-analysis.module';


@NgModule({
  imports: [
    SharedModule,
    MapModule,
    NgbModule,
    FontAwesomeModule,
    InfiniteScrollModule,
    FlexmonsterPivotModule,
    DataRoutingModule,
    PostAnalysisModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [DataPageComponent],
  exports: [DataPageComponent]
})
export class DataPageModule {}
