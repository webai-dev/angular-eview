import { UserPermissions } from '@eview/core/models/user-permissions';

export interface UserPermissionsState {
  userPermissions: UserPermissions;
}

export const initialUserPermissionsState: UserPermissionsState = {
  userPermissions: null
};
