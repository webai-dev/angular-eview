import { Action } from '@ngrx/store';
import { FormAttributes } from '@eview/core/domain/form/form-attribute';

export enum EFormAttributesActions {
  ListFormAttributes = '[Form Attributes] List',
  ListFormAttributesSuccess = '[Form Attributes] List success',
  ListFormAttributesFailure = '[Form Attributes] List failure'
}

export class ListFormAttributes implements Action {
  readonly type = EFormAttributesActions.ListFormAttributes;
  constructor(public payload: { id: number }) {}
}

export class ListFormAttributesSuccess implements Action {
  readonly type = EFormAttributesActions.ListFormAttributesSuccess;
  constructor(public payload: FormAttributes) {}
}

export class ListFormAttributesFailure implements Action {
  readonly type = EFormAttributesActions.ListFormAttributesFailure;
}

export type FormAttributesActions =
  | ListFormAttributes
  | ListFormAttributesSuccess
  | ListFormAttributesFailure;
