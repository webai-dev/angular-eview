import { Permissions } from '@eview/core/models/permissions';

export interface PermissionsState {
  permissions: Permissions;
}

export const initialPermissionsState: PermissionsState = {
  permissions: null
};
