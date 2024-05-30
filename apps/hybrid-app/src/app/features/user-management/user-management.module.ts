import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { UserManagementComponent } from './components/index.component';
import { UsersComponent } from './components/users/users.component';
import { RolesComponent } from './components/roles/roles.component';
import { PermissionsComponent } from './components/permissions/permissions.component';
import { RegisterUserComponent } from '../register-user/register.component';

export const routes: Routes = [
  {
    path: '',
    component: UserManagementComponent,
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
  declarations: [UserManagementComponent, UsersComponent, RolesComponent, PermissionsComponent, RegisterUserComponent],
  exports: [UserManagementComponent, UsersComponent, RolesComponent, PermissionsComponent]
})
export class UserManagementModule {}
