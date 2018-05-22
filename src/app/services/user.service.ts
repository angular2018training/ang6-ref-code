import { Injectable, NgModule } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { VARIABLES, MESSAGE } from 'app/constant';

import * as CryptoJS from 'crypto-js';

export interface UserInfo {
  userID: number;
  username: string;
  password: string;
  passwordDisplay: string;
  isRemember: boolean;
  role: string;
}

@Injectable()
export class UserService {
  private userInfo: UserInfo;
  private token = {
    access_token: null,
    refresh_token: null,
  }
  public static subject = new Subject<any>();

  // constructor(private router: Router) { }
  public ngOnInit() {
    this.userInfo.isRemember = false;
  }

  //send and catch status
  public getStatus(): Observable<any> {
    return UserService.subject.asObservable();
  }
  public checkLogout(error) {
    if (error.error == MESSAGE.ERROR.INVALID_TOKEN) {
      UserService.subject.next({ isLogin: false });
    }
  }
  public changeUsername(userName: string) {
    if (userName != null && userName != '') {
      UserService.subject.next({ userName: userName });
    }
  }

  public setAuthorization(authorization) {
    // console.log(CryptoJS);
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(authorization), VARIABLES.SECRET_KEY);
    localStorage.setItem(VARIABLES.ACCOUNT_INFO, ciphertext.toString());
  }
  public getAuthorization(): UserInfo {
    let saveData = localStorage.getItem(VARIABLES.ACCOUNT_INFO);
    if (saveData) {
      let decryped = CryptoJS.AES.decrypt(saveData, VARIABLES.SECRET_KEY);
      // console.log(JSON.parse(decryped.toString(CryptoJS.enc.Utf8)));
      return JSON.parse(decryped.toString(CryptoJS.enc.Utf8));
    }
    return null;
  }
  public removeAuthorization() {
    localStorage.removeItem(VARIABLES.ACCOUNT_INFO);
  }

  public setToken(token) {
    let ciphertext = CryptoJS.AES.encrypt(JSON.stringify(token), VARIABLES.SECRET_KEY);
    localStorage.setItem(VARIABLES.TOKEN, ciphertext.toString());
  }
  public getAccessToken() {
    let saveData = localStorage.getItem(VARIABLES.TOKEN);
    if (saveData) {
      let decryped = CryptoJS.AES.decrypt(saveData, VARIABLES.SECRET_KEY);
      let temp = decryped.toString(CryptoJS.enc.Utf8);
      if (temp != '' && temp != null) {
        let token = JSON.parse(temp);
        if (token[VARIABLES.ACCESS_TOKEN] != undefined) {
          return JSON.parse(temp)[VARIABLES.ACCESS_TOKEN];
        }
      }
    }
    return null;
  }
  public removeToken() {
    localStorage.removeItem(VARIABLES.TOKEN);
  }

  public saveURL(url) {
    localStorage.setItem(VARIABLES.PAGE_SAVE, url);
  }
  public getCacheURL() {
    let saveData = localStorage.getItem(VARIABLES.PAGE_SAVE);
    if (saveData) {
      localStorage.removeItem(VARIABLES.PAGE_SAVE);
      return saveData;
    }
    return null;
    // return localStorage.getItem(VARIABLES.PAGE_SAVE);    
  }
}