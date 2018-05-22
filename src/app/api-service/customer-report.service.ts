import { API_CONFIGURATION } from 'app/constant';
import { CommonService } from './common.service';
import { Injectable, NgModule, Inject } from '@angular/core';

@Injectable()
export class CustomerReportService extends CommonService {

  getCustomerList() {
    return this.getRequest(API_CONFIGURATION.API_URLS.REPORT_CUSTOMER_LIST, null, null);
  }

  search(data) {
    return this.postRequest(API_CONFIGURATION.API_URLS.CUSTOMER_REPORT_VIEW, data);
  }

  downloadReport(data) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.CUSTOMER_REPORT_DOWNLOAD_REPORT, data);
  }

  deleteRevisedVersion(data) {
    return this.postRequest(API_CONFIGURATION.API_URLS.CUSTOMER_REPORT_DELETE_REVISED, data);
  }

  downloadRevisedVersion(data) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.CUSTOMER_REPORT_DOWNLOAD_REVISED, data);
  }

  uploadRevisedVersion(data) {
    return this.postFormRequest(API_CONFIGURATION.API_URLS.CUSTOMER_REPORT_UPLOAD_REVISED, data);
  }

}
