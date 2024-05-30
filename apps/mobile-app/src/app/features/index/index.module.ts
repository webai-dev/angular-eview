import { RouterModule, Routes } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IndexComponent } from './index.component';
import { MapPageModule } from '../map-page/map-page.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { MessagesModule } from '../messages/messages.module';
import { PrivateSiteGuard } from '@eview/core/guards/private-site.guard';
import { NotificationsComponent } from './notifications.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: IndexComponent,
    canActivate: [PrivateSiteGuard],
    children: [
      {
        path: 'map',
        loadChildren: '../map-page/map-page.module#MapPageModule'
      },
      {
        path: 'post/submit',
        loadChildren:
          '../post-editor-page/post-editor-page.module#PostEditorPageModule'
      },
      {
        path: 'post/edit/:id',
        loadChildren:
          '../post-editor-page/post-editor-page.module#PostEditorPageModule'
      },
      {
        path: 'posts',
        loadChildren: '../data-page/data-page.module#DataPageModule'
      },
      {
        path: 'post/attributes',
        loadChildren:
          '../post-attributes-editor-page/post-attributes-editor-page.module#PostAttributesEditorPageModule'
      },
      {
        path: 'tags',
        loadChildren: '../tags-page/tags-page.module#TagsPageModule'
      },
      {
        path: 'messages',
        loadChildren: '../messages/messages.module#MessagesModule'
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'map'
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'map'
      }
    ]
  },
  { path: '', redirectTo: '/dashboard/map', pathMatch: 'full' }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
    NgbModule,
    FontAwesomeModule,
    MapPageModule,
    MessagesModule
  ],
  declarations: [IndexComponent, NotificationsComponent],
  exports: [IndexComponent, NotificationsComponent]
})
export class IndexModule {}
