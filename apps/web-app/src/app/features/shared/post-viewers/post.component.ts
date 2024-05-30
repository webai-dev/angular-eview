import { Component, Input, OnInit } from '@angular/core';
import { Post } from '@eview/core/domain/post/post';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ECustomActions, ShowPostDetail, UpdatedPost } from '../custom.store';

@Component({
  selector: 'eview-post',
  templateUrl: 'post.component.html',
  styleUrls: ['post.component.scss']
})
export class PostComponent implements OnInit {
  constructor(private store: Store<AppState>, private actions$: Actions) {}

  ngOnInit() {
    this.actions$
      .pipe(ofType<UpdatedPost>(ECustomActions.UpdatedPost))
      .subscribe(action => {
        this.post =
          action.payload.id === this.post.id ? action.payload : this.post;
      });
  }

  @Input() public post: Post;

  public activePostId$: Observable<number> = this.actions$.pipe(
    ofType<ShowPostDetail>(ECustomActions.ShowPostDetail),
    map(action => (action.payload ? action.payload.id : null))
  );

  public active$: Observable<boolean> = this.activePostId$.pipe(
    map(id => id === this.post.id)
  );

  onClick() {
    this.store.dispatch({
      type: ECustomActions.ShowPostDetail,
      payload: this.post
    });
  }
}
