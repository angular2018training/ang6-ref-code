import { Component, Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";
import { Router, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { CanActivateChild, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { VARIABLES, APP_URL, PAGES } from '../constant';
import { UtilitiesService } from '../services/utilities.service';
import { UserService } from "../services/user.service";
import { AuthorizationService } from '../api-service/authorization.service';
import { LocalMessages } from '../message';
import {SharedService} from '../services/shared-service.service';

@Injectable()
export class LoginService implements CanActivateChild {
  public static subject = new Subject<any>();

  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    private router: Router,
    private _UserService: UserService,
    private _AuthorizationService: AuthorizationService,
  ) { }

  public getStatus(): Observable<any> {
    return LoginService.subject.asObservable();
  }
  public login(isLogin: boolean) {
    LoginService.subject.next({ isLogin: isLogin });
  }
  public changePage(pageName: string) {
    LoginService.subject.next({ pageName: pageName });
  }
  public isLogin() {
    let accountInfo = localStorage.getItem(VARIABLES.ACCOUNT_INFO);
    if (this._UserService.getAccessToken() != null &&
      accountInfo != undefined
    ) {
      return true;
    }
    return false;
  }
  public getUserInfo() {
    return this._UserService.getAuthorization();
  }
  nextUrlAfterDiscardChange= '/';
  public canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.nextUrlAfterDiscardChange = state.url;
    if (this.sharedService.getData(VARIABLES.DATA_CHANGED)) {
      this._UtilitiesService.showConfirmDialog(LocalMessages.messages["3"], (result) => {
        if (result) {
          this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
          this.router.navigate([this.nextUrlAfterDiscardChange]);
        }
      });
      return false;
    } else {
      return this.checkGoToView(state) && this.checkPermission(state.url);
    }
  }

  public checkGoToView(state) {
    let isCommon = APP_URL.COMMON.includes(state.url);
    // check link reset-password from mail
    let isResetPassword = state.url.match('\/reset-password\\?email=\\S*&token=\\S*');
    if (isResetPassword) {
      isCommon = true;
      this.logout(true);
    }
    if (this.isLogin()) {
      if (isCommon && !isResetPassword) {
        let role = this.getUserInfo().role;
        if (role == VARIABLES.OPERATOR) {
          this.router.navigate([PAGES.OPERATOR.CUSTOMER_LIST]);
        } else if (role == VARIABLES.CUSTOMER) {
          this.router.navigate([PAGES.CUSTOMER.NAVIGATION_HISTORY]);
        }
        return false;
      }
      return true;
    } else {
      if (!isCommon) {
        if (this.isMatchRoute(state.url)) {
          this._UserService.saveURL(state.url);
        }
        this.router.navigate([PAGES.COMMON.LOGIN]);
        return false;
      }
      return true;
    }
  }

  public checkPermission(url) {
    let userInfo = this.getUserInfo();
    if (userInfo != undefined) {
      let role = userInfo.role;
      let result = false;
      let screenList = APP_URL.COMMON;
      if (role == VARIABLES.OPERATOR) {
        screenList = screenList.concat(APP_URL.OPERATOR);
      } else if (role == VARIABLES.CUSTOMER) {
        screenList = screenList.concat(APP_URL.CUSTOMER);
      }

      // let cacheURL = this._UserService.getCacheURL();
      // if (cacheURL) {
      //   this.router.navigate([cacheURL]);
      //   // this.router.navigate([PAGES.OPERATOR.CUSTOMER_DETAIL],{ queryParams: { id: 4 } });
      //   return true;
      // } else if (url.indexOf("?") > -1) {//remove param
      //   url = url.substring(0, url.indexOf("?"))
      // }
      if (url.indexOf("?") > -1) {//remove param
        url = url.substring(0, url.indexOf("?"))
      }

      screenList.forEach(element => {
        if (element === url) {
          return result = true;
        }
      });
      if (!result) {
        if (role == VARIABLES.OPERATOR) {
          this.router.navigate([PAGES.OPERATOR.CUSTOMER_LIST]);
        } else if (role == VARIABLES.CUSTOMER) {
          this.router.navigate([PAGES.CUSTOMER.NAVIGATION_HISTORY]);
        }
      }
      return result;
    // } else if (APP_URL.COMMON.includes(url)) {
    } else if (this.isCommon(url)) {
      return true;
    } else {
      this.router.navigate([PAGES.COMMON.LOGIN]);
      return true;
    }
  }

  public logoutExpire(status) {
    if (!status && status != undefined) {
      this._UserService.removeToken();
      if (!this._UserService.getAuthorization().isRemember) {
        this._UserService.removeAuthorization();
      }
      this.router.navigate([PAGES.COMMON.LOGIN]);
      this.login(false);
    }
  }

  public logout(noNavigateLogin = false) {
    this._AuthorizationService.logout();
    this._UserService.removeToken();

    let authorization = this._UserService.getAuthorization();
    if (authorization != null && !authorization.isRemember) {
      this._UserService.removeAuthorization();
    }
    if (!noNavigateLogin) {
      this.router.navigate([PAGES.COMMON.LOGIN]);
    }
    this.login(false);
  }

  private isMatchRoute(url) {
    return APP_URL.OPERATOR.concat(APP_URL.CUSTOMER).some(item => {
      return item == url;
    });

    // if (url.indexOf("?") > -1) {//remove param
    //   url = url.substring(0, url.indexOf("?"))
    // }
    // return APP_URL.OPERATOR.concat(APP_URL.CUSTOMER).some(item => {
    //   return item == url;
    // });
  }

  private isCommon(url){
    return APP_URL.COMMON.includes(url) || url.match('\/reset-password\\?email=\\S*&token=\\S*');
  }
}