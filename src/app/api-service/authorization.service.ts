import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';
// import { HttpClient } from '@angular/common/http';

import { API_CONFIGURATION } from '../constant';

import { CommonService } from './common.service';
import { StringService } from "../services/string.service";
import { UserService } from "../services/user.service";

@Injectable()
// export class AuthorizationService extends CommonService {
export class AuthorizationService {

  constructor(private http: Http, private _UserService: UserService, private _StringService: StringService) { }

  private extractData(res: Response) {
    let body = res.json();
    return body;
  }

  private handleErrorPromise(error: Response | any) {
    console.error(error);
    return Promise.reject(error);
  }

  //   userInfo(access_token: string): Promise<any> {
  //     let headers = new Headers({ 'Authorization': 'Bearer ' + access_token });
  //     return this.getRequest(API_Configuration.API_URLS.USER_INFO, headers);
  //   }

  //   isStillLog() {
  //     let headers = new Headers({ 'Authorization': 'Basic ' + btoa('gcsvn:gcsvn') });
  //     let options = new RequestOptions({ headers: headers });
  //     let body = new URLSearchParams();
  //     body.set('token', Tokens.getAccessToken());

  //     return this.http.post(API_Configuration.API_URLS.CHECK_TOKEN, body, options).toPromise()
  //       .then(this.extractData)
  //       .catch(this.handleErrorPromise);
  //   }

  //   isStillLog2(): Observable<any> {
  //     let headers = new Headers({ 'Authorization': 'Basic ' + btoa('gcsvn:gcsvn') });
  //     let options = new RequestOptions({ headers: headers });
  //     let body = new URLSearchParams();
  //     body.set('token', Tokens.getAccessToken());

  //     return this.http.post(API_Configuration.API_URLS.CHECK_TOKEN, body, options)
  //       .map((res: Response) => res.json())
  //       .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
  //   }
  //   isStillLog3(): Observable<any> {
  //     let headers = new Headers({ 'Authorization': 'Basic ' + btoa('gcsvn:gcsvn') });
  //     let options = new RequestOptions({ headers: headers });
  //     let body = new URLSearchParams();
  //     body.set('token', 'abc');

  //     return this.http.post(API_Configuration.API_URLS.CHECK_TOKEN, body, options)
  //   }
  //   isStillLog4() {
  //     let headers = new Headers({ 'Authorization': 'Basic ' + btoa('gcsvn:gcsvn') });
  //     let options = new RequestOptions({ headers: headers });
  //     let body = new URLSearchParams();
  //     // body.set('token', Tokens.getAccessToken());
  //     body.set('token', 'abc');

  //     return this.http.post(API_Configuration.API_URLS.CHECK_TOKEN, body, options).toPromise()
  //       .then(this.extractData)
  //       .catch(this.handleErrorPromise);
  //   }

  login(request): Promise<any> {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    headers.append('Authorization', 'Basic RVNOYXZpSnNDbGllbnQ6RVNOYXZpITIwMTc=');

    let options = new RequestOptions({ headers: headers });
    let body = new URLSearchParams();
    body.set('username', request.username);
    body.set('password', request.password);
    body.set('grant_type', 'password');
    body.set('client_id', 'ESNaviJsClient');

    return this.http.post(API_CONFIGURATION.API_URLS.LOGIN, body, options).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  logout() {
    return this.http.get(API_CONFIGURATION.API_URLS.LOGOUT, new RequestOptions({
      headers: new Headers(
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this._UserService.getAccessToken(),
        }),
    })).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }

  changePassword(request) {
    // return this.http.put(API_CONFIGURATION.API_URLS.CHANGE_PASSWORD, request, new RequestOptions({
    //   headers: new Headers(
    //     {
    //       'Content-Type': 'application/json',
    //       'Authorization': 'Bearer ' + this._UserService.getAccessToken(),
    //     }),
    // })).toPromise()
    //   .then(this.extractData)
    //   .catch(this.handleErrorPromise);

    return this.http.put(this._StringService.create(API_CONFIGURATION.API_URLS.CHANGE_PASSWORD, { userID: this._UserService.getAuthorization().userID }), request, new RequestOptions({
      headers: new Headers(
        {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this._UserService.getAccessToken(),
        }),
    })).toPromise()
      .then(this.extractData)
      .catch(this.handleErrorPromise);
  }
}