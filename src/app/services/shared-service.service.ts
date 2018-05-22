import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
@Injectable()
export class SharedService {

  sharedData = new Object();

  constructor() { }

  getData(key) {
    return this.sharedData[key];
  }

  setData(key, value) {
    this.sharedData[key] = value;
  }

}