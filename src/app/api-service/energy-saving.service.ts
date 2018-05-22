import { API_CONFIGURATION } from 'app/constant';
import { CommonService } from './common.service';
import { Injectable, NgModule, Inject } from '@angular/core';

@Injectable()
export class EnergySavingService extends CommonService {

  getCustomerList() {
    return this.getRequest(API_CONFIGURATION.API_URLS.REPORT_CUSTOMER_LIST, null, null);
  }

  getBuilding(request) {
    return this.getRequest(API_CONFIGURATION.API_URLS.REPORT_BUILDING_LIST, null, request);
  }

  getChillerPlant(requestParam) {
    return this.getRequest(API_CONFIGURATION.API_URLS.REPORT_CHILLER_PLANT, null, requestParam);
  }
  
  showReport(data) {
    return this.postRequest(API_CONFIGURATION.API_URLS.ENERGY_SAVING_SHOW_REPORT, data);
  }

  exportReport(data) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.ENERGY_SAVING_EXPORT_REPORT, data);
  }
}
