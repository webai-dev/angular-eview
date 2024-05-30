import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DataPageComponent } from './components/data-page.component';

const routes: Routes = [
  {
    path: '',
    component: DataPageComponent,
    outlet: 'dashboard'
  }
];

@NgModule({
   imports: [
    RouterModule.forChild(routes)
   ],
   exports: [
      RouterModule
   ],
   declarations: []
})
export class DataRoutingModule {}