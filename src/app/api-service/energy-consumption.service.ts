import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';
@Injectable()
export class EnergyConsumptionService extends CommonService {

    getEnergyConsumptionData(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.ENERGY_CONSUMPTION, null, request);
    }

    getCustomers() {
        return this.getRequest(API_CONFIGURATION.API_URLS.ENERGY_CONSUMPTION + '/getcustomer');
    }

    // get list building by customer id
    getBuildings(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.ENERGY_CONSUMPTION + '/getbuilding', null, request);
    }

    // get list chiller plant by customer id & building id
    getChillerPlants(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.ENERGY_CONSUMPTION + '/getchillerplant', null, request);
    }

    searchReport(requestParam) {
        return this.postRequest(API_CONFIGURATION.API_URLS.ENERGY_CONSUMPTION_SEARCH, requestParam);
    }

    searchExecutionReport(requestParam) {
        return this.postRequest(API_CONFIGURATION.API_URLS.EXECUTION_REPORT_ADMIN_SEARCH, requestParam);
    }
}