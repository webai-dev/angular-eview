import { Component, OnDestroy, OnInit, Inject, ViewContainerRef, ViewChild } from '@angular/core';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { environment } from '@eview/core/environments/environment';
import { UserPermissions } from '@eview/core/models/user-permissions';
import { Roles, RoleItem } from '@eview/core/models/roles';
import { User } from '@eview/core/models/user';
import { selectUserPermissions } from '@eview/core/store/selectors/user-permissions.selector';
import { selectRoles } from '@eview/core/store/selectors/roles.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { isEmpty } from 'lodash';
import { UserService } from '@eview/core/users/user.service';
import { GetRoles } from '@eview/core/store/actions/auth.actions';

@Component({
  selector: 'eview-user-management',
  templateUrl: 'index.component.html',
  styleUrls: ['index.component.scss'],
})
export class UserManagementComponent implements OnInit, OnDestroy {

  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private userService: UserService
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.roles$.pipe(map(data => data.results)).subscribe((data) => {
      if (data) {
        data.forEach((val) => {
          let temp = [];
          if (val && !isEmpty(val.permissions)) {
              val.permissions.forEach((permission) => {
                temp[permission] = true;
              });
          }
          this.permissions[val.name] = temp;
        });
      }
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onValueChange(role: RoleItem) {

    let selectValues = this.permissions[role.name];
    let permission = [];
    Object.keys(selectValues).forEach((item) => {
      if (selectValues[item]) {
        permission.push(item);
      }
    });
    let reqBody =  role;
    reqBody.permissions =  permission;
    this.userService.updateRoles(reqBody, role.id).subscribe((results) => {
      this.store.dispatch(new GetRoles());
    });
  }

  subs: Subscription;

  currentJustify = 'justified';

  user$: Observable<User> = this.store.select(selectUser);

  userPermissions$: Observable<UserPermissions> = this.store.select(
    selectUserPermissions
  );
  permissions: string[][] = [];

  roles$: Observable<Roles> = this.store.select(
    selectRoles
  );
}