import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  FormAttribute,
  FormAttributeConfigs,
  FormAttributeInput,
  FormAttributes,
  FormAttributeType,
  FormAttributeConfigActions
} from '@eview/core/domain/form/form-attribute';
import { FormService } from '@eview/core/domain/form/form.service';
import { Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { cloneDeep } from 'lodash';
import { DragulaService } from 'ng2-dragula';
import { Subscription, of, Observable } from 'rxjs';
import { DragulaHelpers } from '../../shared/dragula.helpers';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { map } from 'rxjs/operators';
import { AppState } from '@eview/core/store/states/app.state';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'eview-post-attribute-editor',
  templateUrl: 'post-attribute-editor.component.html',
  styleUrls: ['post-attribute-editor.component.scss']
})
export class PostAttributeEditorComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private formService: FormService,
    private dragulaService: DragulaService,
    private route: ActivatedRoute
  ) {
    this.dragulaService.remove(this.dragula);
    this.dragulaService.createGroup(this.dragula, {
      moves: (el, container, handle) => {
        return DragulaHelpers.CanMove(handle, 'handle-option');
      }
    });
    this.formId = route.snapshot.params.id;
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.formAttribute = this.formAttributes.results[this.formAttributeIndex];
    if (this.alwaysRequired) this.formAttribute.required = true;
    this.formAttribute.options = this.formAttribute.options || [];
    this.formAttributeOptions = this.formAttribute.options.map(
      (text, index) => ({ index, text })
    );
    this.formAttribute.config = this.formAttribute.config || [];

    this._formAttribute = cloneDeep(this.formAttribute);

    this.subs.add(
      this.actions$
        .pipe(ofType(EPostAttributeEditorActions.Save))
        .subscribe(() => {
          this.onSaveClick();
        })
    );

    this.subs.add(
      this.store
        .select(selectTags)
        .pipe(
          map(tags =>
            tags.results.map(t => ({ value: t.id.toString(), text: t.tag }))
          )
        )
        .subscribe(tags => (this.tagsTargetOptions = tags))
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private subs: Subscription;

  private formId = 1;

  @Input() public formAttributes: FormAttributes;
  @Input() public formAttributeIndex: number;

  formAttribute: FormAttribute;
  private _formAttribute: FormAttribute;

  FormAttributeConfigs = FormAttributeConfigs.sort((a, b) =>
    a.text.localeCompare(b.text)
  );

  get formAttributeConfig(): {
    input: FormAttributeInput;
    type: FormAttributeType;
    text: string;
  } {
    return FormAttributeConfigs.find(
      c =>
        c.input === this.formAttribute.input &&
        c.type === this.formAttribute.type
    );
  }

  set formAttributeConfig(value: {
    input: FormAttributeInput;
    type: FormAttributeType;
    text: string;
  }) {
    if (!value || !value.input || !value.type) {
      value = { input: null, type: null, text: null };
    }
    this.formAttribute.input = value.input;
    this.formAttribute.type = value.type;
    if (!this.showOptionConfig) this.formAttribute.options = [];
  }

  get configDisabled() {
    if (!this.formAttributeConfig) return false;
    return (
      ['POST_ATTRIBUTE_TYPE_LOCATION'].includes(
        this.formAttributeConfig.text
      ) && this.formAttribute.id
    );
  }

  get disabled() {
    if (!this.formAttributeConfig) return false;
    return [
      'POST_ATTRIBUTE_TYPE_TITLE',
      'POST_ATTRIBUTE_TYPE_DESCRIPTION'
    ].includes(this.formAttributeConfig.text);
  }

  get alwaysRequired() {
    if (!this.formAttributeConfig) return false;
    return ['POST_ATTRIBUTE_TYPE_TITLE'].includes(
      this.formAttributeConfig.text
    );
  }

  get locationIsAlreadyConfigured() {
    return this.formAttributes.results.find(
      fa => fa.type === FormAttributeType.Point
    );
  }

  get tagsIsAlreadyConfigured() {
    return this.formAttributes.results.find(
      fa => fa.type === FormAttributeType.Tags
    );
  }

  get showOptionConfig() {
    if (!this.formAttributeConfig) return false;
    return [
      'POST_ATTRIBUTE_TYPE_SELECT',
      'POST_ATTRIBUTE_TYPE_RADIOBUTTONS',
      'POST_ATTRIBUTE_TYPE_CHECKBOXES'
    ].includes(this.formAttributeConfig.text);
  }

  get showConfig() {
    if (!this.formAttributeConfig) return false;
    return (
      ![
        'POST_ATTRIBUTE_TYPE_TITLE',
        'POST_ATTRIBUTE_TYPE_LOCATION',
        'POST_ATTRIBUTE_TYPE_TAGS'
      ].includes(this.formAttributeConfig.text) && !this.formAttribute.required
    );
  }

  showAdvanced: boolean = false;

  showDeleteConfirmation: boolean;

  showOptionDeleteConfirmation: number;

  showConfigDeleteConfirmation: number;

  get attributeIsInvalid(): boolean {
    return (
      !this.formAttribute.label ||
      !this.formAttribute.input ||
      !this.formAttribute.type
    );
  }

  formAttributeOptions: { index: number; text: string }[] = [];

  dragula: string = DragulaHelpers.RandomDragula();

  FormAttributeConfigActions = FormAttributeConfigActions;

  tagsTargetOptions: { value: string; text: string }[] = [];

  get configTargets(): { key: string; text: string }[] {
    return this.formAttributes.results
      .filter(
        fa =>
          fa.key !== this.formAttribute.key &&
          ((Array.isArray(fa.options) && fa.options.length > 0) ||
            fa.input === FormAttributeInput.Tags)
      )
      .map(fa => ({ key: fa.key, text: fa.label }));
  }

  getTargetOptions(key: string): { value: string; text: string }[] {
    if (!key) return [];
    const target = this.formAttributes.results.find(fa => fa.key === key);
    if (target.input === FormAttributeInput.Tags) return this.tagsTargetOptions;
    return target.options.map(o => ({ value: o, text: o }));
  }

  onAddOption() {
    this.formAttributeOptions.push({
      index: this.formAttributeOptions.length,
      text: ''
    });
  }

  onDeleteOption(index: number) {
    this.formAttribute.options.splice(index, 1);
  }

  onAddConfig() {
    this.formAttribute.config = this.formAttribute.config || [];
    this.formAttribute.config.push({
      id: this.formAttribute.config.length + 1,
      action: null,
      target: {
        key: null,
        value: null
      }
    });
    this.showConfigDeleteConfirmation = null;
    this.formAttribute.required = false;
  }

  onDeleteConfig(index: number) {
    this.formAttribute.config.splice(index, 1);
  }

  onDeleteClick() {
    this.showDeleteConfirmation = true;
  }

  onDeleteConfirmationClick() {
    if (!this.formAttribute.id) {
      this.formAttribute.id = -1;
      return;
    }
    this.formService
      .deleteAttribute(this.formId, this.formAttribute)
      .subscribe(() => {
        this.store.dispatch(new PostAttributeDeleted(this.formAttribute.id));
      });
  }

  onSaveClick() {
    this.formAttributeOptions = this.formAttributeOptions.filter(o => o.text);
    this.formAttribute.options = this.formAttributeOptions.map(
      option => option.text
    );
    this.formAttribute.config = this.formAttribute.config.filter(
      config =>
        config.action &&
        config.target &&
        (config.target && config.target.key && config.target.value)
    );
    if (this.formAttributeConfig.input === FormAttributeInput.Checkbox)
      this.formAttribute.cardinality = this.formAttribute.options.length;
    (this.formAttribute.id
      ? this.formService.updateAttribute(this.formId, this.formAttribute)
      : this.formService.createAttribute(this.formId, this.formAttribute)
    ).subscribe(formAttribute => {
      this.formAttribute.id = formAttribute.id;
      this._formAttribute = cloneDeep(this.formAttribute);
    });
  }

  onCancelClick() {
    if (this.showDeleteConfirmation) {
      this.showDeleteConfirmation = false;
      return;
    }
    if (!this.formAttribute.id) {
      this.formAttribute.id = -1;
      return;
    }
    this.formAttribute = cloneDeep(this._formAttribute);
  }
}

export enum EPostAttributeEditorActions {
  Save = '[PostAttributeEditor] Save',
  Deleted = '[PostAttributeEditor] Deleted'
}

export class PostAttributeSave implements Action {
  readonly type = EPostAttributeEditorActions.Save;
}

export class PostAttributeDeleted implements Action {
  readonly type = EPostAttributeEditorActions.Deleted;
  constructor(public payload: number) {}
}
