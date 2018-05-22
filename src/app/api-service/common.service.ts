import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs';
import { Observer } from 'rxjs/Observer';
import { Subject } from "rxjs/Subject";
import { Injectable, ErrorHandler } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Http, Response, Headers, RequestOptions, URLSearchParams, ResponseContentType } from '@angular/http';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import { VARIABLES, APP_URL, PAGES } from 'app/constant';

import { UserService } from "../services/user.service";
import { StringService } from "../services/string.service";
import { LoginService } from "../services/login.service";
import { AuthorizationService } from '../api-service/authorization.service'

@Injectable()
export class CommonService {
    static _UserService = new UserService();

    constructor(protected http: Http, protected _StringService: StringService) { }

    protected extractData(res: Response) {
        let body = res.json();
        return body;
    }

    protected handleErrorPromise(error: Response | any) {
        if (error && error.json()) {
            CommonService._UserService.checkLogout(error.json());
        }
        return Promise.reject(error);
    }

    protected getHeaderDefault() {
        return new Headers(
            {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // 'Authorization': 'bearer ' + this._UserService.getAccessToken(),
                'Authorization': 'bearer ' + CommonService._UserService.getAccessToken(),
                // 'Authorization': 'bearer ' + CommonService._UserService.getAccessToken() + 'a',
            }
        );
    }
    protected getHeaderFormData() {
        return new Headers({
            'Authorization': 'Bearer ' + CommonService._UserService.getAccessToken(),
            'Accept': 'application/json',
        });
    }

    protected getRequest(url, headers = null, params = null) {
        if (!headers) {
            headers = this.getHeaderDefault();
        }
        let urlParams = new URLSearchParams();
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                urlParams.set(prop, params[prop]);
            }
        }

        return this.http.get(url, new RequestOptions({ headers: headers, params: urlParams })).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }
    protected deleteRequest(url, headers = null, params = null) {
        if (!headers) {
            headers = this.getHeaderDefault();
        }

        let urlParams = new URLSearchParams();
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                urlParams.set(prop, params[prop]);
            }
        }

        return this.http.delete(url, new RequestOptions({ headers: headers, params: urlParams })).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }

    protected postRequest(url, body = null, headers = null) {
        if (!headers) {
            headers = this.getHeaderDefault();
        }
        return this.http.post(url, body, new RequestOptions({ headers: headers })).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }

    protected putRequest(url, body = null, headers = null, params = null) {
        if (!headers) {
            headers = this.getHeaderDefault();
        }
        let urlParams = new URLSearchParams();
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                urlParams.set(prop, params[prop]);
            }
        }
        return this.http.put(url, body, new RequestOptions({ headers: headers, params: urlParams })).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }

    protected downloadRequest(url, body = null) {
        let headers = new Headers(
            {
                'Authorization': 'bearer ' + CommonService._UserService.getAccessToken(),
            }
        );

        let requestOptions = new RequestOptions({
            headers: headers,
            responseType: ResponseContentType.Blob
        });


        return this.http.post(url, body, requestOptions).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }

    protected getRequestWithDownLoadFile(url, params = null) {
        let headers = new Headers(
            {
                'Authorization': 'bearer ' + CommonService._UserService.getAccessToken(),
            }
        );
        let urlParams = new URLSearchParams();
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                urlParams.set(prop, params[prop]);
            }
        }
        let requestOptions = new RequestOptions({
            headers: headers,
            params: urlParams
        });

        requestOptions.responseType = ResponseContentType.Blob;

        return this.http.get(url, requestOptions).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }

    protected postFormRequest(url, body = null, headers = null) {
        if (!headers) {
            headers = this.getHeaderFormData();
        }
        let options = new RequestOptions({ headers: headers });
        return this.http.post(url, body, options).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }
}