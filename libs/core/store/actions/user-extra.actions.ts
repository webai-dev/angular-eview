import { Action } from '@ngrx/store';
import { UserExtras } from '@eview/core/models/user-extra';

export enum EUserExtraActions {
  UserExtraSaved = '[User Extra] saved',
  UserExtraSavedSuccess = '[User Extra] saved success',
  UserExtraSavedFailure = '[User Extra] saved failure',
  GetUserExtra = '[User Extra] Read',
  GetUserExtraSuccess = '[User Extra] read success',
  GetUserExtraFailure = '[User Extra] read failure'
}

export class UserExtraSaved implements Action {
  readonly type = EUserExtraActions.UserExtraSaved;
  constructor(public payload: any) {}
}

export class UserExtraSavedSuccess implements Action {
  readonly type = EUserExtraActions.UserExtraSavedSuccess;
}

export class UserExtraSavedFailure implements Action {
  readonly type = EUserExtraActions.UserExtraSavedFailure;
}

export class GetUserExtra implements Action {
  readonly type = EUserExtraActions.GetUserExtra;
}

export class GetUserExtraSuccess implements Action {
  readonly type = EUserExtraActions.GetUserExtraSuccess;
  constructor(public payload: any) {}
}

export class GetUserExtraFailure implements Action {
  readonly type = EUserExtraActions.GetUserExtraFailure;
}

export type UserExtraActions =
  | UserExtraSaved
  | UserExtraSavedSuccess
  | UserExtraSavedFailure
  | GetUserExtra
  | GetUserExtraSuccess
  | GetUserExtraFailure;