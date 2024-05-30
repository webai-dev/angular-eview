import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapModule } from '@eview/features/ui/map/map.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DragulaModule } from 'ng2-dragula';
import { SharedModule } from '../shared/shared.module';
import { TagEditorComponent } from './components/tag-editor.component';
import { TagsPageComponent } from './components/tags-page.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { IconPickerModule } from 'ngx-icon-picker';

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
    FontAwesomeModule,
    DragulaModule.forRoot(),
    ColorPickerModule,
    IconPickerModule
  ],
  declarations: [TagsPageComponent, TagEditorComponent],
  exports: [TagsPageComponent]
})
export class TagsPageModule {}
