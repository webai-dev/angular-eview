import { Action } from '@ngrx/store';
import { Forms, Form } from '@eview/core/domain/form/form';

export enum EFormsActions {
  ListForms = '[Forms] List',
  ListFormsSuccess = '[Forms] List success',
  ListFormsFailure = '[Forms] List failure',
  GetSelectedForm = '[Forms] Get selected Form'
}

export class ListForms implements Action {
  readonly type = EFormsActions.ListForms;
}

export class GetSelectedForm implements Action {
  readonly type = EFormsActions.GetSelectedForm;
  constructor(public payload: number) {}
}

export class ListFormsSuccess implements Action {
  readonly type = EFormsActions.ListFormsSuccess;
  constructor(public payload: Forms) {}
}

export class ListFormsFailure implements Action {
  readonly type = EFormsActions.ListFormsFailure;
}

export type FormsActions =
  | ListForms
  | ListFormsSuccess
  | ListFormsFailure
  | GetSelectedForm;
