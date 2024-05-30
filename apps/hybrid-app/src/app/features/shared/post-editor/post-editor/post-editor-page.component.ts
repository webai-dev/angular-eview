import { Component, Injector, Input, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment, LogService } from '@eview/core';
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
import { selectForms } from '@eview/core/store/selectors/forms.selector';
import { Form } from '@eview/core/domain/form/form';
import { ListFormAttributes } from '@eview/core/store/actions/form-attributes.actions';
import {
  ECustomActions, ShowPostDetail
} from '../../custom.store';

@Component({
  selector: 'eview-post-editor',
  templateUrl: 'post-editor-page.component.html',
  styleUrls: ['post-editor-page.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: ngbDateCustomFmt }]
})
export class PostEditorPageComponent extends PostEditorBaseComponent
  implements OnInit, OnDestroy {
  @Input() formId: number;
  @Output() modalCloseEvent = new EventEmitter<string>();
  private subs1: Subscription;
  FormAttributeType = FormAttributeType;
  formList: Form[];
  selectedFormId: number;

  constructor(
    injector: Injector,
    private logService: LogService,
    private router: Router,
    route: ActivatedRoute
  ) {
    super(injector, +route.snapshot.params.id);
    this.subs1 = new Subscription();
  }
  ngOnInit() {
    super.ngOnInit();
    this.selectedFormId = (this.formId) ? this.formId : environment.form.id
    this.store.dispatch(new UserClickedMap({ actual: null }));
    this.store.dispatch(new ListFormAttributes({ id: this.selectedFormId }));
    this.subs1.add(
      this.actions$
        .pipe(ofType<SubmitPostSuccess>(EPostsActions.SubmitPostSuccess))
        .subscribe(action => {
          this.closeModal('Cross click');
          if (action.payload && action.payload.isEditing) {
            this.store.dispatch({
              type: ECustomActions.UpdatedPost,
              payload: action.payload
            });
            this.store.dispatch(new ShowPostDetail(action.payload));
          } else {
            this.store.dispatch(new UserClickedMap({ actual: {lat: null, lon: null } }));
          }
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

    this.subs1.add(
        this.store
        .select(selectForms)
        .subscribe(
          forms => {
            this.formList = forms.results.filter(form => !form.disabled);
          }
      )
    );
  }

  onFormChange(selectedFormId: number) {
    this.selectedFormId = selectedFormId;
    this.store.dispatch(new ListFormAttributes({ id: this.selectedFormId }));
    this.onFormSelectedChange(this.selectedFormId);
  } 

  onCancelClick(param : string) {
    this.modalCloseEvent.emit(param);
  }

  closeModal(param : string){
    this.modalCloseEvent.emit(param);
  }

  ngOnDestroy() {
    this.subs1.unsubscribe();
  }
}
