import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { Permission } from '@eview/core/auth/permission';
import { FeatureHelpers } from '@eview/core/domain/post/feature.helpers';
import { GeoJsonObject } from '@eview/core/domain/post/geo-json';
import { PostStatus, Post } from '@eview/core/domain/post/post';
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
import { switchMap } from 'rxjs/operators';
import { ShowPostDetail } from '../../shared/custom.store';
import { Subscription } from 'rxjs';

const SUBMIT_PAGE_URI = '/dashboard/post/submit';

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
    private postService: PostService
  ) {
    super();
  }

  ngOnInit() {
    document.body.style.alignItems = 'center';

    AuthHelpers.User.HasUserPermission(
      this.store,
      Permission.SubmitPosts
    ).subscribe(can => {
      this.userCanSubmitPosts = can;
    });

    this.router.events.subscribe(() => {
      document.body.style.alignItems = 'unset';
    });

    this.actions$
      .pipe(ofType<UserClickedMap>(EMapActions.UserClickedMap))
      .subscribe(action => (this.showPostDetail = false));

    this.postClickSubscription = this.actions$
      .pipe(
        ofType<UserClickedMarker>(EMapActions.UserClickedMarker),
        switchMap(action => this.postService.read(action.payload.parent.id))
      )
      .subscribe(post => {
        this.showPostDetail = true;
        this.store.dispatch(new ShowPostDetail(post));
      });

    this.loadMarkers();
  }

  ngOnDestroy() {
    this.postClickSubscription.unsubscribe();
  }

  public geoJsons: GeoJsonObject;

  public userCanSubmitPosts: boolean = false;

  public showPostDetail: boolean = false;

  public postClickSubscription: Subscription;

  private loadMarkers() {
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

  onSubmitClick() {
    this.router.navigateByUrl(SUBMIT_PAGE_URI);
  }

  onRefreshClick() {
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
}
