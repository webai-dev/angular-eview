import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PostAnalysisComponent } from './components/post-analysis.component';
import { FlexmonsterPivotModule } from 'ng-flexmonster';

export const routes: Routes = [
  {
    path: '',
    component: PostAnalysisComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    NgbModule,
    FlexmonsterPivotModule,
    RouterModule.forChild(routes),
    FontAwesomeModule
  ],
  declarations: [PostAnalysisComponent],
  exports: [PostAnalysisComponent]
})
export class PostAnalysisModule {}
