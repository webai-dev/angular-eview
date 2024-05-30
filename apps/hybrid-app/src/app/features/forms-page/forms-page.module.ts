import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../shared/shared.module';
import { FormsPageComponent } from './components/forms-page.component';
import { RouterModule, Routes } from '@angular/router';
import { UiSwitchModule } from 'ngx-toggle-switch';

export const routes: Routes = [
  {
    path: '',
    component: FormsPageComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    NgbModule,
    FontAwesomeModule,
    RouterModule.forChild(routes),
    InfiniteScrollModule,
    UiSwitchModule
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA],
  declarations: [FormsPageComponent],
  exports: [FormsPageComponent]
})
export class FormsPageModule {}
