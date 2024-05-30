import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { MessagesComponent } from './components/messages.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    component: MessagesComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
  imports: [
    SharedModule,
    RouterModule.forChild(routes),
  ],
  declarations: [MessagesComponent],
  exports: [MessagesComponent]
})
export class MessagesModule {}
