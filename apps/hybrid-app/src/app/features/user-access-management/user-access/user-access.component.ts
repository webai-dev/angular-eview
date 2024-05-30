import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { UserPermissions } from '@eview/core/models/user-permissions';
import { Roles, RoleItem } from '@eview/core/models/roles';
import { User } from '@eview/core/models/user';
import { selectUserPermissions } from '@eview/core/store/selectors/user-permissions.selector';
import { Permissions } from '@eview/core/models/permissions';
import { selectPermissions } from '@eview/core/store/selectors/permissions.selector';
import { selectRoles } from '@eview/core/store/selectors/roles.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { isEmpty } from 'lodash';
import { UserService } from '@eview/core/users/user.service';
import { GetRoles } from '@eview/core/store/actions/auth.actions';

@Component({
  selector: 'eview-user-access-management',
  templateUrl: 'user-access.component.html',
  styleUrls: ['user-access.component.scss'],
})
export class UserAccessComponent implements OnInit, OnDestroy {

  constructor(
    private store: Store<AppState>,
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
    this.subs.add(
      this.store.select(selectUser).subscribe((user) => {
        this.user = user;
        this.roles$.pipe(map((roles) => {
            const roleArr = roles.results
            return roleArr.filter((role) =>  {
              if (user.role === roleArr[0].name && role.name === roleArr[0].name) {
                return false;
              } else if (user.role === roleArr[1].name && (role.name === roleArr[0].name || role.name === roleArr[1].name)) {
                return false;
              } else {
                return true;
              }
            });
        }))
        .subscribe((res) => {
          this.roles = res;
        })
      })
    );
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

  user: User;
  
  permissions$: Observable<Permissions> = this.store.select(
    selectPermissions
  );
  userPermissions$: Observable<UserPermissions> = this.store.select(
    selectUserPermissions
  );
  permissions: string[][] = [];

  roles$: Observable<Roles> = this.store.select(
    selectRoles
  );
  roles: RoleItem[];
}