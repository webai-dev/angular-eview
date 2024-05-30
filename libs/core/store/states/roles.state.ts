import { Roles } from '@eview/core/models/roles';

export interface RolesState {
  roles: Roles;
}

export const initialRolesState: RolesState = {
  roles: null
};
