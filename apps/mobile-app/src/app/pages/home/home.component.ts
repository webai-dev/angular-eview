import { Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';

import { AppState } from '@eview/core/store/states/app.state';
import { BaseComponent } from '@eview/core';
import { Login } from '@eview/core/store/actions/auth.actions';

@Component({
  selector: 'page-home',
  templateUrl: 'home.component.html'
})
export class HomeComponent extends BaseComponent implements OnInit {
  constructor(private store: Store<AppState>) {
    super();
  }

  ngOnInit() {
    this.store.dispatch(
      new Login({ username: 'admin@admin.org', password: 'admin' })
    );
  }
}
