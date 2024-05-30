import { RouterModule, Routes } from '@angular/router';

import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TagsPageComponent } from './components/tags-page.component';
import { TagEditorComponent } from './components/tag-editor.component';

export const routes: Routes = [
  {
    path: '',
    component: TagsPageComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    MapModule,
    FontAwesomeModule
  ],
  declarations: [TagsPageComponent, TagEditorComponent],
  exports: [TagsPageComponent]
})
export class TagsPageModule {}
