import { Config, SiteConfigItem } from '../models/config';
import { Observable, of } from 'rxjs';
import { RoleItem, Roles } from '../models/roles';

import { AppState } from '../store/states/app.state';
import { ClearUserPermissions } from '../store/actions/auth.actions';
import { ConfigHelpers } from '../config/config.helpers';
import { Permission } from './permission';
import { Permissions } from '../models/permissions';
import { Store } from '@ngrx/store';
import { User } from '../models/user';
import { UserPermissions } from '../models/user-permissions';
import { map } from 'rxjs/operators';
import { selectUserPermissions } from '../store/selectors/user-permissions.selector';
import { AllowedPriviledge } from './auth';
import { BaseModel } from '../base/base-model';

const SUPER_ROLE = 'super';
const SYSTEM_ROLE = 'sysadmin';

const GetPermissionsVector = (permissions: Permissions): Permission[] =>
  permissions.results.map(p => p.name as Permission);

const GetRoleByName = (roles: Roles, name: string): RoleItem => {
  return roles.results.find(r => r.name === name) || null;
};

const GetRolePermissionsByName = (roles: Roles, name: string): Permission[] => {
  return (GetRoleByName(roles, name) || { permissions: [] }).permissions;
};

const GetUserPermissions = (
  user: User,
  config: Config,
  permissions: Permissions,
  roles: Roles
): UserPermissions => {
  const permissionsAsVector = GetPermissionsVector(permissions);
  const { role: userRoleName } = user;
  const isAdmin = false; //(userRoleName === SUPER_ROLE || userRoleName === SYSTEM_ROLE);
  const userPermissions = {
    isAdmin,
    permissions: isAdmin
      ? permissionsAsVector
      : GetRolePermissionsByName(roles, userRoleName)
  };
  userPermissions.permissions = [
    ...userPermissions.permissions,
    customPermissionsHelpers.SubmitPosts(user, config)
  ];
  userPermissions.permissions = removeUserPermissionsDupes(
    userPermissions.permissions
  );
  return userPermissions;
};

const customPermissionsHelpers = {
  SubmitPosts: (
    user: User,
    config: Config,
    permissions: Permissions = null,
    roles: Roles = null
  ): Permission => {
    const permission = Permission.SubmitPosts;
    if (user) return permission;
    const siteConfig = ConfigHelpers.GetConfigItem<SiteConfigItem>(
      SiteConfigItem,
      config
    );
    if (siteConfig.private) return null;
    return permission;
  }
};

const removeUserPermissionsDupes = (
  permissions: Permission[]
): Permission[] => [...new Set(permissions)];

const HasUserPermission = (
  store: Store<AppState>,
  permission: Permission
): Observable<boolean> => {
  return permission
    ? store
        .select(selectUserPermissions)
        .pipe(
          map(userPermissions =>
            userPermissions
              ? userPermissions.permissions.includes(permission)
              : false
          )
        )
    : of(true);
};

const HasPriviledgeOn = (
  object: BaseModel,
  priviledge: AllowedPriviledge
): boolean =>
  object.allowed_privileges
    ? object.allowed_privileges.includes(priviledge)
    : false;

export const AuthHelpers = {
  Permissions: { GetPermissionsVector },
  Roles: { GetRoleByName, GetRolePermissionsByName },
  User: {
    GetUserPermissions,
    HasUserPermission
  },
  Resources: {
    HasPriviledgeOn
  }
};
