import { Component, OnInit, OnDestroy, Inject, ViewContainerRef} from '@angular/core';
import { BaseComponent } from '@eview/core';
import { environment }  from '@eview/core/environments/environment';
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
  UserClickedMap,
  UserClickedCommentMap
} from '@eview/core/store/actions/map.actions';
import { ExportEntityType } from '@eview/core/domain/export/export';
import { Form } from '@eview/core/domain/form/form';
import {
  CreateJob
} from '@eview/core/store/actions/export.actions';
import { merge } from 'lodash';
import { selectForms } from '@eview/core/store/selectors/forms.selector';
import { ToastService } from '../../toast/toast.service';
import { ToastType } from '../../toast/toast.component';
import { ImportComponent } from '../../import/components/import.component';
import { Actions, ofType } from '@ngrx/effects';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ListFormAttributes } from '@eview/core/store//actions/form-attributes.actions';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-data-page',
  templateUrl: 'data-page.component.html',
  styleUrls: ['data-page.component.scss']
})
export class DataPageComponent extends BaseComponent implements OnInit, OnDestroy {
  tagId: number = 0;
  openModal = new BehaviorSubject({flag: false, postId: 0});
  selectedPost: Post;
  parentId: number;

  private offset = 0;
  private limit = PAGE_SIZE;
  private disableScrollDown = false;
  public filterActive: boolean = false;
  public showChildPosts: boolean = false;
  public userCanAccessTemplate: boolean;
  public userCanAccessImportExport: boolean;
  resetFilters = new BehaviorSubject(false);
  posts: Posts = { count: 0, results: [] };
  childPosts: Posts = { count: 0, results: [] };
  requestOptions: ListPostOptions;

  showPostDetail: boolean = false;

  private scrollY: number;

  private subs: Subscription;

  parentPostTitle: string = '';

  userCanFilterPosts: boolean = false;
  formId: number = environment.form.id;
  formList: Form[] = [];

  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private postService: PostService,
    private modalService: NgbModal,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
    public toast: ToastService
  ) {
    super();
    this.subs = new Subscription();
    toast.setViewContainerRef(viewContainerRef);
    this.subs.add(
      AuthHelpers.User.HasUserPermission(
        this.store,
        Permission.FilterPosts
      ).subscribe(can => {
        this.userCanFilterPosts = can;
      })
    );

    this.subs.add(
      AuthHelpers.User.HasUserPermission(
        this.store,
        Permission.ManageCollectionsAndSavedSearches
      ).subscribe(can => {
        this.userCanAccessTemplate = can;
      })
    );

    this.subs.add(
      AuthHelpers.User.HasUserPermission(
        this.store,
        Permission.BulkDataImportAndExport
      ).subscribe(can => {
        this.userCanAccessImportExport = can;
      })
    );
  }

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
        .pipe(ofType<UserClickedMap>(EMapActions.UserClickedMap))
        .subscribe(action => {
          if (action.payload.actual && action.payload.actual.lat == null) {
            this.onRefreshClick();
          }
        })
    );

    this.subs.add(
      AuthHelpers.User.HasUserPermission(
        this.store,
        Permission.ManageCollectionsAndSavedSearches
      ).subscribe(can => {
        this.userCanAccessTemplate = can;
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
        .pipe(ofType<UserClickedMap>(EMapActions.UserClickedMap))
        .subscribe(action => {
          if (action.payload.actual && action.payload.actual.lat == null) {
            this.onRefreshClick();
          }
        })
    );

    this.subs.add(
      AuthHelpers.User.HasUserPermission(
        this.store,
        Permission.ManageCollectionsAndSavedSearches
      ).subscribe(can => {
        this.userCanAccessTemplate = can;
      })
    );

    this.subs.add(
      AuthHelpers.User.HasUserPermission(
        this.store,
        Permission.BulkDataImportAndExport
      ).subscribe(can => {
        this.userCanAccessImportExport = can;
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

    this.subs.add(
        this.store
        .select(selectForms)
        .subscribe(
          forms => {
            this.formList = forms.results.filter(form => !form.disabled);
          }
      )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private getPosts(options: ListPostOptions): Observable<Posts> {
    return this.postService.list(options);
  }

  private initializeRequestOptions() {
    this.requestOptions = {
        status: PostStatus.All,
        offset: this.offset,
        limit: this.limit,
        parent: null,
        form: this.formId
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

  onFormChange(selectedFormId: number) {
    this.offset = 0;
    this.formId = selectedFormId;
    this.resetFilters.next(true);
    this.store.dispatch(new ListFormAttributes({ id: selectedFormId }));
    this.onPostDetailClose();
    this.initializeRequestOptions();
    this.loadPosts();
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
    //fix for showing all records, removed limit from below condition
    if (this.offset >= this.posts.total_count) {
      this.disableScrollDown = true;
    }
    if (this.disableScrollDown) return;
    this.requestOptions.offset = this.offset;
    this.requestOptions.limit = this.limit;
    this.requestOptions.parent = this.parentId > 0 ? this.parentId : null;
    this.getPosts(this.requestOptions).subscribe(posts => {
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
      this.childPosts && this.childPosts.count > 0 ? true : false;
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
    this.openModal.next({flag: data.flag, postId: this.selectedPost.id});
    if (!data.flag) {
      this.onApplyClick(data.flag);
    }
  }

  onCancelClick() {
    this.openModal.next({flag: false, postId: 0});
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

  onExportClick() {
    this.store.dispatch(
      new CreateJob({
        entity_type: ExportEntityType.Post,
        filters: { status: [this.requestOptions.status] }
      })
    );
  }

  onUploadClick() {
    const uploadFileModalRef = this.modalService.open(ImportComponent, {ariaLabelledBy: 'modal-basic-title', windowClass : "customModalWindowClass", centered: true });
    uploadFileModalRef.componentInstance.modalFileUploadCloseEvent.subscribe(($e) => {
      if ($e === true) {
        this.toast.show(ToastType.Success, 'TOAST_IMPORT_JOB_SUCCESS');
      }
      uploadFileModalRef.dismiss();
    });
 
  }
}
