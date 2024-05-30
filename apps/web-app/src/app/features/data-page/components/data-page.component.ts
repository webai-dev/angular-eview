import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@eview/core';
import {
  ListPostOptions,
  Posts,
  PostStatus
} from '@eview/core/domain/post/post';
import { PostService } from '@eview/core/domain/post/post.service';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import {
  ECustomActions,
  DeletedPost,
  ShowPostDetail
} from '../../shared/custom.store';
import { Actions, ofType } from '@ngrx/effects';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-data-page',
  templateUrl: 'data-page.component.html',
  styleUrls: ['data-page.component.scss']
})
export class DataPageComponent extends BaseComponent implements OnInit {

  private offset = 0;
  private limit = PAGE_SIZE;
  private disableScrollDown = false;
  public posts: Posts = { count: 0, results: [] };
  public showPostDetail: boolean = false;
  private scrollY: number;

  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private postService: PostService
  ) {
    super();
  }

  ngOnInit() {
    this.getPosts({
      status: PostStatus.All,
      offset: this.offset,
      limit: this.limit
    }).subscribe(posts => {
      this.posts = posts;
    });

    this.actions$
      .pipe(ofType<ShowPostDetail>(ECustomActions.ShowPostDetail))
      .subscribe(action => {
        if (!action.payload) {
          this.showPostDetail = false;
          return;
        }
        this.scrollY = window.scrollY;
        this.showPostDetail = true;
      });

    this.actions$
      .pipe(ofType<DeletedPost>(ECustomActions.DeletedPost))
      .subscribe(action => {
        this.posts.results = this.posts.results.filter(
          p => p.id !== action.payload.id
        );
        this.posts.total_count = this.posts.results.length;
        this.store.dispatch({
          type: ECustomActions.ShowPostDetail,
          payload: null
        });
      });
  }

  private getPosts(options: ListPostOptions): Observable<Posts> {
    return this.postService.list(options);
  }

  onScrollDown() {
    if (this.disableScrollDown) return;
    this.offset += PAGE_SIZE;
    if (this.posts.total_count < this.offset + this.limit)
      this.disableScrollDown = true;
    this.getPosts({
      status: PostStatus.All,
      offset: this.offset,
      limit: this.limit
    }).subscribe(posts => {
      this.posts = {
        ...posts,
        results: [...this.posts.results, ...posts.results]
      };
    });
  }

  onRefreshClick() {
    window.scrollTo(0, 0);
    this.disableScrollDown = false;
    this.offset = 0;
    this.store.dispatch({
      type: ECustomActions.ShowPostDetail,
      payload: null
    });
    this.getPosts({
      status: PostStatus.All,
      offset: this.offset,
      limit: this.limit
    }).subscribe(posts => {
      this.posts = posts;
    });
  }

  onPostDetailClose() {
    this.store.dispatch(new ShowPostDetail(null));
    setTimeout(() => window.scroll(0, this.scrollY));
  }
}
