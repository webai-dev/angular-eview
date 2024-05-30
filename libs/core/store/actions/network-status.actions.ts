import { Action } from '@ngrx/store';

export enum ENetworkStatusActions {
  CheckNetworkStatus = '[Check Network] status',
  CheckNetworkStatusSuccess = '[Check Network Success] status',
  UpdateNetworkStatus = '[Update Network] status',
  CheckNetworkStatusFailure = '[Check Network Failure] status'
}

export class CheckNetworkStatus implements Action {
  readonly type = ENetworkStatusActions.CheckNetworkStatus;
}

export class CheckNetworkStatusSuccess implements Action {
  readonly type = ENetworkStatusActions.CheckNetworkStatusSuccess;
  constructor(public payload: any) {}
}

export class UpdateNetworkStatus implements Action {
  readonly type = ENetworkStatusActions.UpdateNetworkStatus;
  constructor(public payload: any) {}
}

export class CheckNetworkStatusFailure implements Action {
  readonly type = ENetworkStatusActions.CheckNetworkStatusFailure;
}

export type NetworkStatusActions =
  | CheckNetworkStatus
  | CheckNetworkStatusSuccess
  | CheckNetworkStatusFailure
  | UpdateNetworkStatus;
