import { Post } from '@eview/core/domain/post/post';
import { Action } from '@ngrx/store';

export enum ECustomActions {
  ShowPostDetail = '[Custom.ShowPostDetail] Show Post detail',
  UpdatedPost = '[Custom.UpdatedPost] Updated Post',
  DeletedPost = '[Custom.DeletedPost] Deleted Post'
}

export class ShowPostDetail implements Action {
  public readonly type = ECustomActions.ShowPostDetail;
  constructor(public payload: Post) {}
}

export class UpdatedPost implements Action {
  public readonly type = ECustomActions.UpdatedPost;
  constructor(public payload: Post) {}
}

export class DeletedPost implements Action {
  public readonly type = ECustomActions.UpdatedPost;
  constructor(public payload: Post) {}
}
