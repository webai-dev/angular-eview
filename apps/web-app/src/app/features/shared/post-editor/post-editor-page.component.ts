import { Location } from '@angular/common';
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LogService } from '@eview/core';
import { UserClickedMap } from '@eview/core/store/actions/map.actions';
import {
  EPostsActions,
  SubmitPostFailure,
  SubmitPostSuccess
} from '@eview/core/store/actions/posts.actions';
import { PostEditorBaseComponent } from '@eview/features/ui/post-editor/post-editor-base.component';
import { ofType } from '@ngrx/effects';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ngbDateCustomFmt } from '../ngb-date-custom-fmt';

const TARGET_URI_AFTER_SUBMISSION = '/dashboard/map';

@Component({
  selector: 'eview-submit-page',
  templateUrl: 'post-editor-page.component.html',
  providers: [{ provide: NgbDateParserFormatter, useClass: ngbDateCustomFmt }]
})
export class PostEditorPageComponent extends PostEditorBaseComponent
  implements OnInit {
  constructor(
    public injector: Injector,
    private logService: LogService,
    private router: Router,
    route: ActivatedRoute,
    private location: Location
  ) {
    super(injector, +route.snapshot.params.id);
  }

  ngOnInit() {
    super.ngOnInit();

    this.actions$
      .pipe(ofType<SubmitPostSuccess>(EPostsActions.SubmitPostSuccess))
      .subscribe(action => {
        this.store.dispatch(new UserClickedMap({ actual: null }));
        this.router.navigateByUrl(TARGET_URI_AFTER_SUBMISSION);
      });
    this.actions$
      .pipe(ofType<SubmitPostFailure>(EPostsActions.SubmitPostFailure))
      .subscribe(action => {
        // TODO: Error handling.
        this.logService.error('An error occourred while submitting the post.');
      });
  }

  onCancelClick() {
    this.location.back();
  }
}
