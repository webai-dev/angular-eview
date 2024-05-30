import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent, environment } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { Permission } from '@eview/core/auth/permission';
import { FeatureHelpers } from '@eview/core/domain/post/feature.helpers';
import { GeoJsonObject } from '@eview/core/domain/post/geo-json';
import {
  PostStatus,
  ListPostOptions,
  Post
} from '@eview/core/domain/post/post';
import { PostService } from '@eview/core/domain/post/post.service';
import {
  EMapActions,
  SetMapMarkers,
  UserClickedMap,
  UserClickedMarker
} from '@eview/core/store/actions/map.actions';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { ShowPostDetail } from '../../shared/custom.store';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TagSelectorSetById } from '../../shared/post-editor/tag-selector/tag-selector.component';
import { ECustomActions } from '../../../features/shared/custom.store';
import { EFormsActions, GetSelectedForm } from '@eview/core/store/actions/forms.actions';
import { PostEditorPageComponent } from '../../../features/shared/post-editor/post-editor/post-editor-page.component';
import { ListFormAttributes } from '@eview/core/store//actions/form-attributes.actions';

@Component({
  selector: 'eview-map-page',
  templateUrl: 'map-page.component.html',
  styleUrls: ['map-page.component.scss']
})
export class MapPageComponent extends BaseComponent
  implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router,
    private postService: PostService,
    private modalService: NgbModal
  ) {
    super();
    this.subs = new Subscription();
  }
  filterActive: boolean = false;
  tagId: number = 0;
  openModal = new BehaviorSubject(false);
  formId: number = environment.form.id;
  requestOptions: ListPostOptions = {
    status: PostStatus.All,
    has_location: 'mapped',
    parent: 'none',
    form: this.formId
  };

  ngOnInit() {
    document.body.style.alignItems = 'center';
    this.store.dispatch(new ListFormAttributes({ id: this.formId }));

    AuthHelpers.User.HasUserPermission(
      this.store,
      Permission.CreatePost
    ).subscribe(can => {
      this.userCanSubmitPosts = can;
    });

    AuthHelpers.User.HasUserPermission(
      this.store,
      Permission.FilterPosts
    ).subscribe(can => {
      this.userCanFilterPosts = can;
    });

    this.subs.add(
      this.router.events.subscribe(() => {
        document.body.style.alignItems = 'unset';
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
      this.actions$
        .pipe(
          ofType<UserClickedMarker>(EMapActions.UserClickedMarker),
          switchMap(action => this.postService.read(action.payload.parent.id))
        )
        .subscribe(post => {
          this.showPostDetail = true;
          this.store.dispatch(new ShowPostDetail(post));
        })
    );
    this.loadMarkers();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  geoJsons: GeoJsonObject;

  mainPost: Post;

  tagName: string;

  selectedPost: Post;

  isLoadAllReport: boolean = false;

  applyDisabled: boolean = true;

  isErrorReport: boolean = false;

  loadAllParentReport: boolean = false;

  userCanSubmitPosts: boolean = false;

  userCanFilterPosts: boolean = false;

  showPostDetail: boolean = false;

  private subs: Subscription;

  private loadMarkers(queryParams?: string[]) {

    if (queryParams) {
      for (const option in queryParams) {
        this.requestOptions[option] = queryParams[option];
      }
    }
    if (queryParams) {
      this.filterActive = true;
      this.requestOptions['parent'] = 'none';
    }
    this.postService
      .geoJson(this.requestOptions)
      .subscribe(featureCollection => {
        this.geoJsons = featureCollection;
        this.store.dispatch(
          new SetMapMarkers({
            markers: FeatureHelpers.ToMarkers(featureCollection)
          })
        );
      });
  }

  onSubmitClick() {
    const createIncidentModalRef = this.modalService.open(PostEditorPageComponent, {ariaLabelledBy: 'modal-basic-title', windowClass : "customModalWindowClass" });
    createIncidentModalRef.componentInstance.modalCloseEvent.subscribe(($e) => {
      createIncidentModalRef.dismiss();
    });
  }

  onRefreshClick(filterFlag?: boolean) {
    if (filterFlag) {
      this.filterActive = false;
      this.requestOptions = {
        status: PostStatus.All,
        has_location: 'mapped',
        parent: 'none',
        form: this.formId
      }
    }
    this.modalService.dismissAll();
    this.loadMarkers();
  }

  onPostDeleted() {
    this.showPostDetail = false;
    this.postService
      .geoJson({ status: PostStatus.All, has_location: 'mapped' })
      .subscribe(featureCollection => {
        this.geoJsons = featureCollection;
        this.store.dispatch(
          new SetMapMarkers({
            markers: FeatureHelpers.ToMarkers(featureCollection)
          })
        );
      });
  }

  onFiltersClick(content) {
    this.modalService.open(content, { centered: true, size: 'lg' });
    if (this.tagId > 0) {
      setTimeout(() => {
        this.store.dispatch(new TagSelectorSetById(this.tagId));
      });
    }
  }

  onPostDetailClose() {
    this.showPostDetail = false;
    this.store.dispatch(new ShowPostDetail(null));
  }

  onShowChildPosts(parentId: number) {
    if (parentId) {
      this.requestOptions['parent'] = parentId.toString();
      this.showPostDetail = false;
      this.loadMarkers();
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
    });
    this.modalService.dismissAll();
  }

  onFormChange(selectedFormId: number) {
    this.formId = selectedFormId;
    this.requestOptions['form'] = this.formId;
    this.onRefreshClick();
  }
}
