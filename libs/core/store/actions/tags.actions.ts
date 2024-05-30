import { Action } from '@ngrx/store';
import { Tags } from '@eview/core/domain/tags/tag';

export enum ETagsActions {
  ListTags = '[Tags] List',
  ListTagsSuccess = '[Tags] List success',
  ListTagsFailure = '[Tags] List failure'
}

export class ListTags implements Action {
  readonly type = ETagsActions.ListTags;
}

export class ListTagsSuccess implements Action {
  readonly type = ETagsActions.ListTagsSuccess;
  constructor(public payload: Tags) {}
}

export class ListTagsFailure implements Action {
  readonly type = ETagsActions.ListTagsFailure;
}

export type TagsActions = ListTags | ListTagsSuccess | ListTagsFailure;
