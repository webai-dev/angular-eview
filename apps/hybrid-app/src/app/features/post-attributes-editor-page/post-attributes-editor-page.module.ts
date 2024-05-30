import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DragulaModule } from 'ng2-dragula';
import { SharedModule } from '../shared/shared.module';
import { PostAttributeEditorComponent } from './components/post-attribute-editor.component';
import { PostAttributesEditorPageComponent } from './components/post-attributes-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PostAttributesEditorPageComponent,
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
    DragulaModule.forRoot()
  ],
  declarations: [
    PostAttributesEditorPageComponent,
    PostAttributeEditorComponent
  ],
  exports: [PostAttributesEditorPageComponent, PostAttributeEditorComponent]
})
export class PostAttributesEditorPageModule {}
