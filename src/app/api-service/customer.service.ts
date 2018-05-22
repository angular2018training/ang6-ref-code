import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class CustomerService extends CommonService {
    
    getCustomerList() {
        return this.getRequest(API_CONFIGURATION.API_URLS.CUSTOMER_LIST);
    }
    getTimeZone() {
        return this.getRequest(API_CONFIGURATION.API_URLS.TIME_ZONE);
    }

    createCustomer(requestData) {
        return this.postRequest(API_CONFIGURATION.API_URLS.CREATE_CUSTOMER, requestData);        
    }    

    deleteCustomer(customerID) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.DELETE_CUSTOMER + "/" + customerID);
    }

    searchCustomer(customerName){
        return this.getRequest(API_CONFIGURATION.API_URLS.SEARCH_CUSTOMER, null, customerName);
    }

    getCustomerDetail(customerID) {
        return this.getRequest(API_CONFIGURATION.API_URLS.CUSTOMER_DETAIL, null, customerID);
    }

    updateCustomer(requestData){
        return this.putRequest(API_CONFIGURATION.API_URLS.CREATE_CUSTOMER, requestData);                
    }
    changePassword(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.CHANGE_PASSWORD_CUSTOMER, request);        
    }

    getCountry() {
        return this.getRequest(API_CONFIGURATION.API_URLS.COUNTRY_PROVICE);
    }
}