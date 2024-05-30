import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseComponent } from '@eview/core';
import {
  FormAttributes,
  FormAttributeType
} from '@eview/core/domain/form/form-attribute';
import { ListFormAttributes } from '@eview/core/store/actions/form-attributes.actions';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { DragulaService } from 'ng2-dragula';
import { Subscription } from 'rxjs';
import {
  EPostAttributeEditorActions,
  PostAttributeDeleted,
  PostAttributeSave
} from './post-attribute-editor.component';
import { DragulaHelpers } from '../../shared/dragula.helpers';
import { FormHelpers } from '@eview/core/domain/form/form.helpers';
import { Router, ActivationStart, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'eview-post-attributes-page',
  templateUrl: 'post-attributes-page.component.html',
  styleUrls: ['post-attributes-page.component.scss']
})
export class PostAttributesEditorPageComponent extends BaseComponent
  implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private dragulaService: DragulaService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
    this.formId = route.snapshot.params.id;
    this.subs = new Subscription();
  }

  ngOnInit() {

    this.store
      .select(selectFormAttributes)
      .subscribe(
        formAttributes =>
          (this.formAttributes = FormHelpers.SortFormAttributes(formAttributes))
      );
    this.store.dispatch(new ListFormAttributes({ id: this.formId }));

    this.subs.add(
      this.actions$
        .pipe(ofType<PostAttributeDeleted>(EPostAttributeEditorActions.Deleted))
        .subscribe(action => {
          this.formAttributes.results = this.formAttributes.results.filter(
            fa => fa.id !== action.payload
          );
        })
    );

    this.dragulaService.createGroup(this.dragula, {
      moves: (el, container, handle) => {
        return DragulaHelpers.CanMove(handle, 'handle');
      }
    });

    this.subs.add(
      this.dragulaService.drop(this.dragula).subscribe(() => {
        const title = this.formAttributes.results.find(
          fa => fa.type === FormAttributeType.Title
        );
        const description = this.formAttributes.results.find(
          fa => fa.type === FormAttributeType.Description
        );
        title.priority = 1;
        description.priority = 2;
        this.formAttributes.results = [
          title,
          description,
          ...this.formAttributes.results
            .filter(
              fa =>
                fa.type !== FormAttributeType.Title &&
                fa.type !== FormAttributeType.Description
            )
            .map((fa, index) => ({
              ...fa,
              priority: index + 3
            }))
        ];
      })
    );

    this.subs.add(
      this.router.events.subscribe(event => {
        if (!(event instanceof ActivationStart)) return;
        this.store.dispatch(new ListFormAttributes({ id: this.formId }));
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.dragulaService.remove(this.dragula);
  }

  private formId: number =  -1;

  formAttributes: FormAttributes;

  private subs: Subscription;

  dragula: string = DragulaHelpers.RandomDragula();

  onAddClick() {
    const stageId = (this.formAttributes) ? this.formAttributes.results[0].form_stage_id : this.formId;
    this.formAttributes.results.push({
      id: 0,
      form_stage_id: stageId,
      label: null,
      input: null,
      type: null,
      priority: this.formAttributes.results.length + 1,
      required: false
    });
    setTimeout(() => {
      const section = document.getElementsByClassName('container-fluid')[0];
      window.scrollTo(
        0,
        (section)? section.scrollHeight: 0
      );
    });
  }

  onRefreshClick() {
    this.store.dispatch(new ListFormAttributes({ id: this.formId }));
  }

  onSaveClick() {
    this.formAttributes.results = this.formAttributes.results.filter(
      fa => fa.label && fa.input && fa.type
    );
    setTimeout(() => {
      this.store.dispatch(new PostAttributeSave());
    });
  }
}
