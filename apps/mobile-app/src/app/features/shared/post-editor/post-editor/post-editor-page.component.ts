import { Location } from '@angular/common';
import { Component, Injector, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
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
import { ngbDateCustomFmt } from '../../ngb-date-custom-fmt';
import { Subscription } from 'rxjs';
import { FormAttributeType } from '@eview/core/domain/form/form-attribute';

const TARGET_URI_AFTER_SUBMISSION = '/dashboard/map';

@Component({
  selector: 'eview-post-editor',
  templateUrl: 'post-editor-page.component.html',
  styleUrls: ['post-editor-page.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: ngbDateCustomFmt }]
})
export class PostEditorPageComponent extends PostEditorBaseComponent
  implements OnInit, OnDestroy {
  @Output() modalCloseEvent = new EventEmitter<string>();
  constructor(
    injector: Injector,
    private logService: LogService,
    private router: Router,
    route: ActivatedRoute,
    private location: Location
  ) {
    super(injector, +route.snapshot.params.id);
    this.subs1 = new Subscription();
  }
  ngOnInit() {
    super.ngOnInit();
    this.store.dispatch(new UserClickedMap({ actual: null }));
    this.subs1.add(
      this.actions$
        .pipe(ofType<SubmitPostSuccess>(EPostsActions.SubmitPostSuccess))
        .subscribe(action => {
          /*if (this.isEditing) {
            this.location.back();
            return;
          }*/
          this.closeModal('Cross click');
          this.store.dispatch(new UserClickedMap({ actual: {lat: null, lon: null } }));
          this.router.navigateByUrl(TARGET_URI_AFTER_SUBMISSION);
        })
    );
    this.subs1.add(
      this.actions$
        .pipe(ofType<SubmitPostFailure>(EPostsActions.SubmitPostFailure))
        .subscribe(action => {
          this.logService.error(
            'An error occourred while submitting the post.'
          );
        })
    );
  }

  ngOnDestroy() {
    this.subs1.unsubscribe();
  }

  private subs1: Subscription;

  FormAttributeType = FormAttributeType;

  onCancelClick(param : string) {
    //this.location.back();
    this.modalCloseEvent.emit(param);
  }

  closeModal(param : string){
    this.modalCloseEvent.emit(param);
  }
}
