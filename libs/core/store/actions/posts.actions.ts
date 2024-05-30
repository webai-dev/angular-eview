import { Action } from '@ngrx/store';
import { Post } from '@eview/core/domain/post/post';

export enum EPostsActions {
  SubmitPostSuccess = '[Posts] Submit success',
  SubmitPostFailure = '[Posts] Submit failure'
}

export class SubmitPostSuccess implements Action {
  readonly type = EPostsActions.SubmitPostSuccess;
  constructor(public payload: Post) {}
}

export class SubmitPostFailure implements Action {
  readonly type = EPostsActions.SubmitPostFailure;
}

export type PostActions = SubmitPostSuccess | SubmitPostFailure;
