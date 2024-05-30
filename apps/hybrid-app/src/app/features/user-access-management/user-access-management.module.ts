import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserAccessComponent } from './user-access/user-access.component';

export const routes: Routes = [
  {
    path: '',
    component: UserAccessComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    NgbModule,
    RouterModule.forChild(routes),
    FontAwesomeModule
  ],
  declarations: [UserAccessComponent],
  exports: [UserAccessComponent]
})
export class UserAccessManagementModule {}
