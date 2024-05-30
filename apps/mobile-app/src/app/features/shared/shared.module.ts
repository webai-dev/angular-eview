import { NgModule } from '@angular/core';
import { MapModule } from '@eview/features/ui/map/map.module';
import { UIModule } from '@eview/web';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormAttributeComponent } from './post-editor/form-attribute/form-attribute.component';
import { PostEditorPageComponent } from './post-editor/post-editor/post-editor-page.component';
import { PostSearchComponent } from './post-search/post-search.component';
import { TagSelectorComponent } from './post-editor/tag-selector/tag-selector.component';
import { PostCommentComponent } from './post-viewers/post-comments/post-comment.component';
import { PostCommentsComponent } from './post-viewers/post-comments/post-comments.component';
import { PostDetailComponent } from './post-viewers/post-detail/post-detail.component';
import { PostSubtitleComponent } from './post-viewers/post-subtitle/post-subtitle.component';
import { PostComponent } from './post-viewers/post/post.component';
import { FiltersComponent } from './filters/filters.component';
import { ToastModule } from '../toast/toast.module';
import { ArrayTostringJoinPipe } from './pipes/array-to-string-pipe';
import { FileSaverModule } from 'ngx-filesaver';
import { UiSwitchModule } from 'ngx-toggle-switch';
import { NgxPaginationModule } from 'ngx-pagination';

const MODULES = [UIModule];

@NgModule({
  imports: [...MODULES, NgbModule, UiSwitchModule, FontAwesomeModule, MapModule, ToastModule, FileSaverModule,
    NgxPaginationModule],
  declarations: [
    PostSubtitleComponent,
    PostComponent,
    PostDetailComponent,
    PostCommentComponent,
    PostCommentsComponent,
    TagSelectorComponent,
    FormAttributeComponent,
    PostEditorPageComponent,
    PostSearchComponent,
    FiltersComponent,
    ArrayTostringJoinPipe
  ],
  entryComponents: [
    PostEditorPageComponent
  ],
  exports: [
    ...MODULES,
    PostSubtitleComponent,
    PostComponent,
    PostDetailComponent,
    PostCommentComponent,
    PostCommentsComponent,
    TagSelectorComponent,
    FormAttributeComponent,
    PostEditorPageComponent,
    PostSearchComponent,
    FiltersComponent,
    ArrayTostringJoinPipe,
    NgxPaginationModule
  ]
})
export class SharedModule {}
