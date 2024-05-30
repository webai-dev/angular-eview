import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs';


@Component({
  selector: 'eview-user-registration',
  templateUrl: 'register.component.html',
  styleUrls: ['register.component.scss'],
})
export class RegisterUserComponent implements OnInit, OnDestroy {


  private subs: Subscription;

  constructor() {
    
  }

  ngOnInit() {

  }

  ngOnDestroy() {

  }

}