import { Component, OnInit, OnDestroy, Inject, ViewContainerRef, } from '@angular/core';
import { BaseComponent } from '@eview/core';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { selectForms } from '@eview/core/store/selectors/forms.selector';
import { ListForms } from '@eview/core/store/actions/forms.actions'
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormService } from '@eview/core/domain/form/form.service';
import { Forms, Form } from '@eview/core/domain/form/form';
import { ToastType } from '../../toast/toast.component';
import { ToastService } from '../../toast/toast.service';
import { Router } from '@angular/router';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-forms-page',
  templateUrl: 'forms-page.component.html',
  styleUrls: ['forms-page.component.scss']
})
export class FormsPageComponent extends BaseComponent
  implements OnInit, OnDestroy {
  private subs: Subscription;
  tagId: number = 0;
  openModal = new BehaviorSubject(false);
  forms: Forms;
  surveyForm: FormGroup;
  isEditing: boolean = false;
  editId: number = 0;
  selectedId: number = -1;
  showDeleteConfirmation: boolean = false;
  forms$: Observable<Forms> = this.store.select(selectForms);

  constructor(
    private store: Store<AppState>,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    public toast: ToastService,
    private formService: FormService,
    private router: Router,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
  ) {
    super();
    this.subs = new Subscription();
    toast.setViewContainerRef(viewContainerRef);
  }

  ngOnInit() {
    this.loadForms();
    this.createForm();
  }

  loadForms() {
    this.store
      .select(selectForms)
      .subscribe(
        forms =>
          (this.forms = forms)
    );
  }

  onAddFormClick(content) {
    this.surveyForm.reset();
    this.modalService.open(content, { centered: true });
  }

  onFormEditClick(content, id) {
    this.isEditing = true;
    this.forms$.pipe(
      map(data => data.results),
      ).subscribe((item) => {
      const form = item[id];
      if (form) {
        this.editId = form.id;
        this.surveyForm.patchValue({
            name: form.name,
            description: form.description,
            type: form.type
        });
      }
    });
    this.modalService.dismissAll();
    this.modalService.open(content, { centered: true });
  }

  createForm() {
    this.surveyForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', [Validators.required]],
      type: ['', [Validators.required]],
    });
  }

  onSubmitClick() {
    const reqBody = this.surveyForm.value;
    if (!this.isEditing) {
      this.formService.createForm(reqBody).subscribe(results => {
        this.toast.show(ToastType.Success, 'TOAST_FORM_ADD_SAVED');
        this.store.dispatch(new ListForms());
      });
    } else {
      this.formService.updateForm(this.editId, reqBody).subscribe(results => {
        this.isEditing = false;
        this.toast.show(ToastType.Success, 'TOAST_FORM_UPDATE_SAVED');
        this.store.dispatch(new ListForms());
      });
    }
    this.surveyForm.reset();
    this.modalService.dismissAll();
  }

  onEnableDisableClick(form: Form, value: boolean) {
    const reqBody = form;
    reqBody.disabled = (value) ? false : true;
    this.formService.updateForm(form.id, reqBody).subscribe(results => {
        this.isEditing = false;
        this.store.dispatch(new ListForms());
        this.toast.show(ToastType.Success, (!value) ? 'TOAST_FORM_UPDATE_DISABLED' : 'TOAST_FORM_UPDATE_ENABLED');
      });
    console.log("value:" + value);
  }

  onCancelClick() {
    this.isEditing = false;
    this.showDeleteConfirmation = false;
    this.surveyForm.reset();
  }

  onDeleteClick(index: number) {
    this.selectedId = index;
    this.showDeleteConfirmation = true;
  }

  onAddFieldsClick(formId: number) {
    this.router.navigate(['/dashboard/post/attributes/', formId])
  }

  onDeleteConfirmationClick(formId: number) {
    if (formId) {
      this.formService.deleteForm(formId).subscribe(() => {
        this.selectedId = -1;
        this.store.dispatch(new ListForms());
        this.toast.show(ToastType.Success, 'TOAST_FORM_DELETED');
      });
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
