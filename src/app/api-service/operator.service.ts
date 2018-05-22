import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';
import { Http, Response, Headers, RequestOptions, URLSearchParams } from '@angular/http';

@Injectable()
export class OperatorService extends CommonService {
    getAllOperator() {
        return this.getRequest(API_CONFIGURATION.API_URLS.OPERATOR);
    }
    getDetailOperator(id) {
        return this.getRequest(API_CONFIGURATION.API_URLS.OPERATOR_DETAIL, null, {
            id: id,
        });
    }

    createOperator(request) {
        return this.postRequest(API_CONFIGURATION.API_URLS.OPERATOR_CREATE, request);
    }

    updateOperator(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.OPERATOR_UPDATE + '?id=' + request.id, request);
    }
    resetPassword(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.OPERATOR_RESET, request);
    }

    deleteOperator(id) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.OPERATOR_DELETE, null, {
            id: id,
        });
    }
    forgotPassword(email) {
        return this.getRequest(API_CONFIGURATION.API_URLS.FORGOT_PASSWORD, null, email);
    }

    resetForgotPassword(request) {
        // return this.putRequest(API_CONFIGURATION.API_URLS.RESET_PASSWORD, body);

        return this.http.put(API_CONFIGURATION.API_URLS.RESET_PASSWORD, request, new RequestOptions({
            headers: new Headers(
                {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'bearer ' + request.token,
                }
            )
        })).toPromise()
            .then(this.extractData)
            .catch(this.handleErrorPromise);
    }
}