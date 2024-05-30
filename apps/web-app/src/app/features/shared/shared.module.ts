import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastComponent } from './toast/toast.component';
import { UIModule } from '@eview/web';
import { PostSubtitleComponent } from './post-viewers/post-subtitle.component';
import { PostComponent } from './post-viewers/post.component';
import { PostDetailComponent } from './post-viewers/post-detail.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MapModule } from '@eview/features/ui/map/map.module';
import { PostEditorPageComponent } from './post-editor/post-editor-page.component';
import { FormAttributeComponent } from './post-editor/form-attribute.component';

const MODULES = [UIModule];

@NgModule({
  imports: [...MODULES, NgbModule, FontAwesomeModule, MapModule],
  declarations: [
    ToastComponent,
    PostSubtitleComponent,
    PostComponent,
    PostDetailComponent,
    FormAttributeComponent,
    PostEditorPageComponent
  ],
  entryComponents: [ToastComponent],
  exports: [
    ...MODULES,
    PostSubtitleComponent,
    PostComponent,
    PostDetailComponent,
    FormAttributeComponent,
    PostEditorPageComponent
  ]
})
export class SharedModule {}
