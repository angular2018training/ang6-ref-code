import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class UnitPriceService extends CommonService {

    getCurrencyList() {
        return this.getRequest(API_CONFIGURATION.API_URLS.UNIT_PRICE_CURRENCY);
    }

    getUnitPriceList(requestParam) {
        return this.getRequest(API_CONFIGURATION.API_URLS.UNIT_PRICE_LIST, null, requestParam);
    }

    createUnitPrice(requestData) {
        return this.postRequest(API_CONFIGURATION.API_URLS.UNIT_PRICE_CREATE, requestData);        
    }

    unitPriceDetail(requestParam) {
        return this.getRequest(API_CONFIGURATION.API_URLS.UNIT_PRICE_DETAIL, null, requestParam);
    }

    unitPriceUpdate(requestData){
        return this.putRequest(API_CONFIGURATION.API_URLS.UNIT_PRICE_UPDATE, requestData);
    }

    unitPriceDelete(customerID) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.UNIT_PRICE_DELETE, null, customerID);
    }
}