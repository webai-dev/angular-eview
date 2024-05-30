import {
  Component,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
  Input
} from '@angular/core';

import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { environment } from '@eview/core/environments/environment';
import { Form } from '@eview/core/domain/form/form';
import { selectForms } from '@eview/core/store/selectors/forms.selector';
// import { GetSelectedForm } from '@eview/core/store/actions/forms.actions';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eview-forms',
  templateUrl: 'forms.component.html',
  styleUrls: ['forms.component.scss']
})
export class FormsComponent implements OnInit, OnDestroy {

  private subs: Subscription;
  public userCanAccessImportExport: boolean;
  formList: Form[] = [];
  selectedFormId: number;
  @Input() formId: number;
  @Output() onFormSelect: EventEmitter<Number> = new EventEmitter();

  constructor(
    private store: Store<AppState>
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.selectedFormId = (this.formId)? this.formId : environment.form.id;
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

  onFormChange() {
    this.selectedFormId = this.selectedFormId || 0;
    // this.store.dispatch(new GetSelectedForm(this.selectedFormId));
    this.onFormSelect.next(this.selectedFormId);
  }

}