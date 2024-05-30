import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PostEditorPageComponent } from '../shared/post-editor/post-editor/post-editor-page.component';
import { SharedModule } from '../shared/shared.module';

export const routes: Routes = [
  {
    path: '',
    component: PostEditorPageComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    MapModule,
    NgbModule,
    FontAwesomeModule,
    SharedModule
  ],
  declarations: [],
  exports: []
})
export class PostEditorPageModule {}
