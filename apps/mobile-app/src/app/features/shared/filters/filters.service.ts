import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private data: any[] = [];
  constructor() {

  }

  set filterOptions(data: any) {
    this.data = data;
  }

  get filterOptions() {
    return this.data;
  }
}