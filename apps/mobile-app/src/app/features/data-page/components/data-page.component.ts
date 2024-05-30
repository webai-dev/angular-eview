import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from '@eview/core';
import {
  ListPostOptions,
  Posts,
  PostStatus,
  Post
} from '@eview/core/domain/post/post';
import { PostService } from '@eview/core/domain/post/post.service';
import { AppState } from '@eview/core/store/states/app.state';
import { AuthHelpers } from '@eview/core/auth';
import { Permission } from '@eview/core/auth/permission';
import { Store } from '@ngrx/store';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import {
  ECustomActions,
  DeletedPost,
  ShowPostDetail
} from '../../shared/custom.store';
import {
  EMapActions,
  UserClickedCommentMap
} from '@eview/core/store/actions/map.actions';
import { Actions, ofType } from '@ngrx/effects';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-data-page',
  templateUrl: 'data-page.component.html',
  styleUrls: ['data-page.component.scss']
})
export class DataPageComponent extends BaseComponent
  implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private postService: PostService,
    private modalService: NgbModal
  ) {
    super();
    this.subs = new Subscription();
    AuthHelpers.User.HasUserPermission(
      this.store,
      Permission.FilterPosts
    ).subscribe(can => {
      this.userCanFilterPosts = can;
    });
  }

  tagId: number = 0;
  openModal = new BehaviorSubject(false);
  selectedPost: Post;
  parentId: number;

  ngOnInit() {
    this.initializeRequestOptions();
    this.loadPosts();
    this.subs.add(
      this.actions$
        .pipe(ofType<ShowPostDetail>(ECustomActions.ShowPostDetail))
        .subscribe(action => {
          if (!action.payload) {
            this.showPostDetail = false;
            return;
          }
          this.scrollY = window.scrollY;
          this.showPostDetail = true;
          this.showChildPosts = false;
        })
    );

    this.subs.add(
      this.actions$
        .pipe(ofType<UserClickedCommentMap>(EMapActions.UserClickedCommentMap))
        .subscribe(action => {
          if (action.payload > 0) {
            this.requestOptions.post_id = action.payload;
            this.postService.read(action.payload).subscribe(post => {
              this.store.dispatch({
                type: ECustomActions.UpdatedPost,
                payload: post
              });
              this.store.dispatch({
                type: ECustomActions.ShowPostDetail,
                payload: post
              });
            });
            window.scrollTo(0, 0);
            this.loadPosts();
          }
        })
    );

    this.subs.add(
      this.actions$
        .pipe(ofType<DeletedPost>(ECustomActions.DeletedPost))
        .subscribe(action => {
          this.loadPosts();
          this.store.dispatch({
            type: ECustomActions.ShowPostDetail,
            payload: null
          });
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private offset = 0;
  private limit = PAGE_SIZE;
  private disableScrollDown = false;
  public filterActive: boolean = false;
  public showChildPosts: boolean = false;

  posts: Posts = { count: 0, results: [] };
  childPosts: Posts = { count: 0, results: [] };
  requestOptions: ListPostOptions;

  showPostDetail: boolean = false;

  private scrollY: number;

  private subs: Subscription;

  parentPostTitle: string = '';

  userCanFilterPosts: boolean = false;

  private getPosts(options: ListPostOptions): Observable<Posts> {
    return this.postService.list(options);
  }

  private initializeRequestOptions() {
    this.requestOptions = {
        status: PostStatus.All,
        offset: this.offset,
        limit: this.limit,
        parent: null
    };
  }

  private loadPosts() {
    this.getPosts(this.requestOptions).subscribe(posts => {
      if (this.showChildPosts && this.parentId !== null) {
        this.childPosts = posts;
      } else {
        this.posts = Object.assign({}, posts);
      }
    });
  }

  onApplyFilter(queryParams) {
    this.filterActive = true;
    this.offset = 0;
    this.initializeRequestOptions();
    if (queryParams) {
      for (const option in queryParams) {
        this.requestOptions[option] = queryParams[option];
      }
    }
    this.modalService.dismissAll();
    this.childPosts = null;
    this.onPostDetailClose();
    this.loadPosts();
  }

  onScrollDown() {
    this.offset += PAGE_SIZE;
    // if (this.posts.total_count < this.offset + this.limit) {
    //   this.disableScrollDown = true;
    // }
    //fix for showing all records, removed limit from below condition
    if (this.offset >= this.posts.total_count) {
      this.disableScrollDown = true;
    }
    if (this.disableScrollDown) return;
    this.getPosts({
      status: PostStatus.All,
      offset: this.offset,
      limit: this.limit,
      parent: this.parentId > 0 ? this.parentId : null
    }).subscribe(posts => {
      this.posts = {
        ...posts,
        results: [...this.posts.results, ...posts.results]
      };
    });
  }

  onRefreshClick(filterFlag?: boolean) {
    window.scrollTo(0, 0);
    this.disableScrollDown = false;
    this.offset = 0;
    this.tagId = 0;
    this.store.dispatch({
      type: ECustomActions.ShowPostDetail,
      payload: null
    });
    // check if clear button clicked, it will clears all filters set
    this.parentId = null;
    this.requestOptions.parent = this.parentId;
    if (filterFlag) {
      this.filterActive = false;
      this.initializeRequestOptions();
    }
    this.loadPosts();
  }

  onPostDetailClose() {
    this.showPostDetail = false;
    this.showChildPosts =
      this.childPosts && this.childPosts.results ? true : false;
    this.store.dispatch(new ShowPostDetail(null));
    setTimeout(() => window.scroll(0, this.scrollY));
  }

  onChildPostsClose() {
    this.childPosts.results = null;
    this.showChildPosts = false;
  }

  onShowChildPosts(postdata: any) {
    this.parentId = postdata.id;
    this.parentPostTitle = postdata.title;
    this.showChildPosts = true;
    if (this.parentId > 0) {
      window.scrollTo(0, 0);
      this.offset = 0;
      this.limit = PAGE_SIZE;
      this.initializeRequestOptions();
      this.requestOptions['parent'] = this.parentId.toString();
      this.loadPosts();
    }
  }

  onLinkPostClicked(data) {
    this.selectedPost = data.post;
    this.openModal.next(data.flag);
    if (!data.flag) {
      this.onApplyClick(data.flag);
    }
  }

  onCancelClick() {
    this.openModal.next(false);
  }

  onApplyClick(dataObj) {
    if (dataObj.flag) {
      const { status, id, mgmt_lev, priority } = dataObj.post;
      this.selectedPost.parent_id = id;
      this.selectedPost.status = status;
      this.selectedPost.priority = priority;
      this.selectedPost.mgmt_lev = mgmt_lev;
    } else {
      this.selectedPost.parent_id = null;
      this.requestOptions['parent'] = null;
    }
    this.postService.update(this.selectedPost).subscribe(post => {
      this.store.dispatch({
        type: ECustomActions.UpdatedPost,
        payload: post
      });
      this.store.dispatch({
        type: ECustomActions.ShowPostDetail,
        payload: post
      });
      this.loadPosts();
    });
    this.modalService.dismissAll();
  }

  onFiltersClick(content) {
    this.modalService.open(content, { centered: true, size: 'lg' });
  }
}
