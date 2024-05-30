import { Action } from '@ngrx/store';
import { ExportJobRequest, ExportJob } from '@eview/core/domain/export/export';

export enum EExportActions {
  CreateJob = '[Export] Create Job',
  CreateJobSuccess = '[Export] Create Job success',
  CreateJobFailure = '[Export] Create Job failure',
  CheckLastJobSuccess = '[Export] Check Last Job success',
  LastJobSuccess = '[Export] Last Job success',
  LastJobFailure = '[Export] Last Job failure'
}

export class CreateJob implements Action {
  readonly type = EExportActions.CreateJob;
  constructor(public payload: ExportJobRequest) {}
}

export class CreateJobSuccess implements Action {
  readonly type = EExportActions.CreateJobSuccess;
  constructor(public payload: ExportJob) {}
}

export class CreateJobFailure implements Action {
  readonly type = EExportActions.CreateJobFailure;
}

export class CheckLastJobSuccess implements Action {
  readonly type = EExportActions.CheckLastJobSuccess;
  constructor(public payload: number) {}
}

export class LastJobSuccess implements Action {
  readonly type = EExportActions.LastJobSuccess;
  constructor(public payload: ExportJob) {}
}

export class LastJobFailure implements Action {
  readonly type = EExportActions.LastJobFailure;
}

export type ExportActions =
  | CreateJob
  | CreateJobSuccess
  | CreateJobFailure
  | CheckLastJobSuccess
  | LastJobSuccess
  | LastJobFailure;
