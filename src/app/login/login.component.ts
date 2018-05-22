import * as _ from 'lodash';

import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Injectable, HostBinding } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { ValidateService } from "../services/validate.service";
import { Md5 } from 'ts-md5/dist/md5';
import { VARIABLES, APP_URL, PAGES, MESSAGE } from 'app/constant';

import { RecaptchaComponent } from 'ng-recaptcha';
import { UserService, UserInfo } from "../services/user.service";
import { LoginService } from "../services/login.service";
import { AuthorizationService } from '../api-service/authorization.service';
import { StringService } from '../services/string.service';

export interface FormModel {
  captcha?: string;
}

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild(RecaptchaComponent) captcha: RecaptchaComponent;
  @Output() checkLogin = new EventEmitter();

  isEqual = _.isEqual;
  sourceData;
  rootData;

  isEmpty: boolean = false;
  isRemember: boolean = false;
  isSigning: boolean = false;
  isValidCaptcha: boolean = true;
  isShowCaptcha: boolean = false;
  numTimeShowCap: number = 3;
  timeLoginFail: number = 0;
  timeLogin: number = 0;

  public formModel: FormModel = {};

  toastError = [];

  account: UserInfo = {
    userID: null,
    username: null,
    password: null,
    passwordDisplay: null,
    isRemember: false,
    role: null,
  }
  // account: UserInfo;
  constructor(
    public _LoginService: LoginService,
    private _UtilitiesService: UtilitiesService,
    private _StringService: StringService,
    private router: Router,
    private _AuthorizationService: AuthorizationService,
    private _UserService: UserService,
    public _ValidateService: ValidateService,
    private _md5: Md5,
  ) { }
  ngOnInit() {
    this._LoginService.login(false);
    let accountInfo = this._UserService.getAuthorization();
    if (accountInfo && accountInfo.isRemember) {
      this.account = accountInfo;
      this.isRemember = this.account.isRemember;
    }

    // this.rootData = {
    //   username
    // }
    // this.sourceData = _.cloneDeep(this.account);
  }
  ngOnDestroy() {
    if (this.toastError.length > 0) {
      this._UtilitiesService.hideToast(this.toastError);
    }
    this._UtilitiesService.stopLoading();
  }

  //excute
  isDisabled() {
    // return !this.account.username || !this.account.passwordDisplay;
    return !this.account.username || !this.account.passwordDisplay;
  }
  public showError(errorText: string) {
    this._UtilitiesService.showError2(errorText).then((toast) => {
      this.toastError.push(toast);
    });
  }

  //view
  signIn() {
    // if (this._ValidateService.checkContent(['.login_username'])) {
    //   this._UtilitiesService.showError2(MESSAGE.ERROR.LOST_USERNAME).then((toast) => {
    //     this.toastError.push(toast);
    //   });
    //   return;
    // }
    // if (this._ValidateService.checkContent(['.login_password'])) {
    //   this._UtilitiesService.showError2(MESSAGE.ERROR.LOST_PASSWORD).then((toast) => {
    //     this.toastError.push(toast);
    //   });
    //   return;
    // }

    if (!this.account.username) {
      this._UtilitiesService.showError2(MESSAGE.ERROR.LOST_USERNAME)
      return;
    }

    if (!this.account.passwordDisplay) {
      this._UtilitiesService.showError2(MESSAGE.ERROR.LOST_PASSWORD)
      return;
    }

    // console.log(this.isValidCaptcha);
    if (this.isSigning || !this.isValidCaptcha || this._UtilitiesService.isLoading()) {
      return;
    }
    if (this.timeLoginFail >= this.numTimeShowCap) {
      this.isValidCaptcha = false;
    }
    this._UtilitiesService.showLoading();
    // this.timeLogin++;
    this.isSigning = true;

    if (this.account.username != '' && this.account.password != '') {
      this.account.password = Md5.hashStr(this.account.passwordDisplay).toString();
      this._AuthorizationService.login(this.account).then(result => {

        //save to local storage
        this.account.isRemember = this.isRemember;
        this.account.userID = Number(result.id);
        if (result.roleId === 1) {
          this.account.role = VARIABLES.OPERATOR;
        } else if (result.roleId === 2) {
          this.account.role = VARIABLES.CUSTOMER;
        }

        this._UserService.setAuthorization(this.account);
        this._UserService.setToken({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });

        if (this.account.role == VARIABLES.OPERATOR) {
          this.router.navigate([PAGES.OPERATOR.CUSTOMER_LIST]);
        } else if (this.account.role == VARIABLES.CUSTOMER) {
          this.router.navigate([PAGES.CUSTOMER.NAVIGATION_HISTORY]);
        }
        this._LoginService.login(true);
      }, error => {
        this.timeLoginFail++;
        this.isSigning = false;

        if (this.timeLoginFail == this.numTimeShowCap) {
          this.isValidCaptcha = false;
          this.isShowCaptcha = true;
        } else if (this.isShowCaptcha && this.timeLoginFail > this.numTimeShowCap) {
          this.captcha.reset();
          this.isValidCaptcha = false;
          // console.log(this.isValidCaptcha);
        }
        if (error.status == 400) {
          this.showError(MESSAGE.ERROR.WRONG_USERNAME_PASSWORD);
        } else if (error.status == 500) {
          this.showError(MESSAGE.ERROR.CONNECT_SERVER);
        }
        this._UtilitiesService.hideLoading();
      });
    }
  }

  forgotPassword() {
    this._LoginService.changePage(VARIABLES.PAGE_NOT_LOGIN.CHANGE_PASSWORD);
  }

  // enter to login
  keyDownFunction(event) {
    if (event.keyCode == 13) {
      this.signIn();
    }
  }
}