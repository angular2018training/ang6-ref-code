import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';
@Injectable()
export class UserReportService extends CommonService {
  searchEnergyReport(requestData) {
    return this.postRequest(API_CONFIGURATION.API_URLS.ENERGY_REPORT_SEARCH, requestData);
  }

  searchExecutionReport(requestData) {
    return this.postRequest(API_CONFIGURATION.API_URLS.EXECUTION_REPORT_SEARCH, requestData);
  }

  downloadEnergyReportHistory(requestData) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.DOWNLOAD_ENERGY_REPORT_HISTORY, requestData);
  }

  downloadExecutionReportHistory(requestData) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.DOWNLOAD_EXECUTION_REPORT_HISTORY, requestData);
  }

  downloadExcutionConsumptionReportHistory(requestData) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.DOWNLOAD_ENERGY_CONSUMPTION_REPORT_HISTORY, requestData);
  }

  dowloadOperatorExecutionReport(requestData) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.DOWNLOAD_OPERATOR_EXECUTION_REPORT_HISTORY, requestData);
  }
}