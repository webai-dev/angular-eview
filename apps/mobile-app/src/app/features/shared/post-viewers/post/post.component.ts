import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Post, PostPriority } from '@eview/core/domain/post/post';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ECustomActions,
  ShowPostDetail,
  UpdatedPost
} from '../../custom.store';

@Component({
  selector: 'eview-post',
  templateUrl: 'post.component.html',
  styleUrls: ['post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {
  constructor(private store: Store<AppState>, private actions$: Actions) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.subs.add(
      this.actions$
        .pipe(ofType<UpdatedPost>(ECustomActions.UpdatedPost))
        .subscribe(action => {
          this.post =
            action.payload.id === this.post.id ? action.payload : this.post;
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @Input() public post: Post;
  @Output() public onShowLinkedPostClick: EventEmitter<Object> = new EventEmitter();

  PostPriority = PostPriority;

  activePostId$: Observable<number> = this.actions$.pipe(
    ofType<ShowPostDetail>(ECustomActions.ShowPostDetail),
    map(action => (action.payload ? action.payload.id : null))
  );

  active$: Observable<boolean> = this.activePostId$.pipe(
    map(id => id === this.post.id)
  );

  private subs: Subscription;

  onClick() {
    this.store.dispatch({
      type: ECustomActions.ShowPostDetail,
      payload: this.post
    });
  }

  onShowLinkedClick(post: Post) {
    event.stopPropagation();
    this.onShowLinkedPostClick.emit({id : post.id, title: post.title});
  }
}
