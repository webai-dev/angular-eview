import { RouterModule, Routes } from '@angular/router';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IndexComponent } from './index.component';
import { MapPageModule } from '../map-page/map-page.module';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from '../shared/shared.module';
import { UserAccessManagementModule } from '../user-access-management/user-access-management.module';
import { MessagesModule } from '../messages/messages.module';
import { FormsPageModule } from '../forms-page/forms-page.module'
import { PrivateSiteGuard } from '@eview/core/guards/private-site.guard';
import { NotificationsComponent } from './notifications.component';


// Lazy loading disabled - SCALA Luca, scala@unicc.org - 02/04/2020.
// Use this approach to disable the lazy loading.
// import { PostEditorPageModule } from '../post-editor-page/post-editor-page.module';
// import { DataPageModule } from '../data-page/data-page.module';
// import { PostAttributesEditorPageModule } from '../post-attributes-editor-page/post-attributes-editor-page.module';
// import { TagsPageModule } from '../tags-page/tags-page.module';
//
// export const routes: Routes = [
//   {
//     path: 'dashboard',
//     component: IndexComponent,
//     canActivate: [PrivateSiteGuard],
//     children: [
//       {
//         path: 'map',
//         loadChildren: () => MapPageModule
//       },
//       {
//         path: 'post/submit',
//         loadChildren: () => PostEditorPageModule
//       },
//       {
//         path: 'post/edit/:id',
//         loadChildren: () => PostEditorPageModule
//       },
//       {
//         path: 'posts',
//         loadChildren: () => DataPageModule
//       },
//       {
//         path: 'post/attributes',
//         loadChildren: () => PostAttributesEditorPageModule
//       },
//       {
//         path: 'tags',
//         loadChildren: () => TagsPageModule
//       },
//       {
//         path: '',
//         pathMatch: 'full',
//         redirectTo: 'map'
//       },
//       {
//         path: '**',
//         pathMatch: 'full',
//         redirectTo: 'map'
//       }
//     ]
//   },
//   { path: '', redirectTo: '/dashboard/map', pathMatch: 'full' }
// ];

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
        path: 'analysis',
        loadChildren:
          '../post-filters/post-filters.module#PostFiltersModule'        
      },
      {
        path: 'analysis-templates',
        loadChildren:
          '../post-analysis/post-analysis.module#PostAnalysisModule'
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
        path: 'post/attributes/:id',
        loadChildren:
          '../post-attributes-editor-page/post-attributes-editor-page.module#PostAttributesEditorPageModule'
      },
      {
        path: 'tags',
        loadChildren: '../tags-page/tags-page.module#TagsPageModule'
      },
      {
        path: 'user-access-management',
        loadChildren: '../user-access-management/user-access-management.module#UserAccessManagementModule'
      },
      {
        path: 'user-management',
        loadChildren: '../user-management/user-management.module#UserManagementModule'
      },
      {
        path: 'messages',
        loadChildren: '../messages/messages.module#MessagesModule'
      },
      {
        path: 'forms-management',
        loadChildren: '../forms-page/forms-page.module#FormsPageModule'
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
    UserAccessManagementModule,
    MessagesModule,
    FormsPageModule
  ],
  declarations: [IndexComponent, NotificationsComponent],
  exports: [IndexComponent, NotificationsComponent]
})
export class IndexModule {}
