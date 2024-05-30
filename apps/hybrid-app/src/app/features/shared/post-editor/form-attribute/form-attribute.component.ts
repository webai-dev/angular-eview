import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewContainerRef
} from '@angular/core';
import { FormAttributeType } from '@eview/core/domain/form/form-attribute';
import { GeocodingService } from '@eview/core/domain/geocoding/geocoding.service';
import { AppState } from '@eview/core/store/states/app.state';
import {
  EFormAttributeActions,
  FormAttributeBaseComponent,
  FormAttributeUnresolvedAddress
} from '@eview/features/ui/post-editor/form-attribute-base.component';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ToastType } from '../../../toast/toast.component';
import { ToastService } from '../../../toast/toast.service';
import {
  ETagSelectorActions,
  TagSelectorChange,
  TagSelectorSetById
} from '../tag-selector/tag-selector.component';
import { MediaService } from '@eview/core/domain/media/media.service';

@Component({
  selector: 'eview-form-attribute',
  templateUrl: 'form-attribute.component.html',
  styleUrls: ['form-attribute.component.scss']
})
export class FormAttributeComponent extends FormAttributeBaseComponent
  implements OnInit, OnDestroy {
  public model: any;
  public formatter = (result: any) => result.display_name;
  constructor(
    store: Store<AppState>,
    private actions$: Actions,
    geocodingService: GeocodingService,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
    private toast: ToastService,
    mediaService: MediaService
  ) {
    super(store, actions$, geocodingService, mediaService);

    this.toast.setViewContainerRef(this.viewContainerRef);

    this.subs = new Subscription();

  }

  ngOnInit() {
    super.ngOnInit();

    if (this.FormAttribute.type === FormAttributeType.Tags) {
      this.subs.add(
        this.actions$
          .pipe(ofType<TagSelectorChange>(ETagSelectorActions.Change))
          .subscribe(action => {
            this.selectedValues = [];
            if (action.payload && action.payload.id)
              this.selectedValues[action.payload.id] = true;
            super.onValueChange();
          })
      );

      if (this.FormAttribute.value && this.FormAttribute.value.length > 0) {
        setTimeout(() => {
          this.store.dispatch(
            new TagSelectorSetById(this.FormAttribute.value[0])
          );
        });
      }
    }

    this.subs.add(
      this.actions$
        .pipe(
          ofType<FormAttributeUnresolvedAddress>(
            EFormAttributeActions.UnresolvedAddress
          )
        )
        .subscribe(() => {
          this.toast.show(ToastType.Danger, 'TOAST_UNRESOLVED_ADDRESS');
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private subs: Subscription;
  showDeleteConfirmation: boolean = false;
}
