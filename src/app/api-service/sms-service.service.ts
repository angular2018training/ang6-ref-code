import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';

@Injectable()
export class SmsServiceService extends CommonService {

  getSMSServiceDetail(requestParam) {
    return this.getRequest(API_CONFIGURATION.API_URLS. SMS_SERVICE_DETAIL, null, requestParam);
  }

  updateSMSService(requestBody) {
    return this.putRequest(API_CONFIGURATION.API_URLS.SMS_SERVICE_UPDATE, requestBody, null);
  }

  testSMSService(requestParam) {
    return this.postRequest(API_CONFIGURATION.API_URLS.TEST_SMS_SERVICE, requestParam);
  }

}
