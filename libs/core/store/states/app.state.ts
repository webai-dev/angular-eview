import { ConfigState, initialConfigState } from './config.state';
import { MapState, initialMapState } from './map.state';
import { PermissionsState, initialPermissionsState } from './permissions.state';
import { RolesState, initialRolesState } from './roles.state';
import {
  UserPermissionsState,
  initialUserPermissionsState
} from './user-permissions.state';
import { UserState, initialUserState } from './user.state';
import { RouterReducerState } from '@ngrx/router-store';
import { TagsState, initialTagsState } from './tags.state';
import { UsersState, initialUsersState } from './users.state';
import { UserExtraState, initialUserExtraState } from './user-extra.state';
import {
  FormAttributesState,
  initialFormAttributesState
} from './form-attributes.state';
import { ErrorState, initialErrorState } from './error.state';
import {
  NotificationsState,
  initialNotificationsState
} from './notifications.state';
import {
  NetworkStatusState,
  initialNetworkStatusState
} from './network-status.state';
import { ExportState, initialExportState } from './export.state';
import { FormsState, initialFormsState } from './forms.state';

export interface AppState {
  router?: RouterReducerState;
  user: UserState;
  userPermissions: UserPermissionsState;
  config: ConfigState;
  roles: RolesState;
  permissions: PermissionsState;
  map: MapState;
  tags: TagsState;
  users: UsersState;
  formAttributes: FormAttributesState;
  apiError: ErrorState;
  notifications: NotificationsState;
  userExtra: UserExtraState;
  networkStatus: NetworkStatusState;
  export: ExportState;
  forms: FormsState;
}

export const initialAppState: AppState = {
  user: initialUserState,
  userPermissions: initialUserPermissionsState,
  config: initialConfigState,
  roles: initialRolesState,
  permissions: initialPermissionsState,
  map: initialMapState,
  tags: initialTagsState,
  users: initialUsersState,
  formAttributes: initialFormAttributesState,
  apiError: initialErrorState,
  notifications: initialNotificationsState,
  userExtra: initialUserExtraState,
  networkStatus: initialNetworkStatusState,
  export: initialExportState,
  forms: initialFormsState
};

export function getInitialState(): AppState {
  return initialAppState;
}
