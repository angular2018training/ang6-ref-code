import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class EmailServiceService extends CommonService {

  getEmailServiceDetail(requestParam) {
    return this.getRequest(API_CONFIGURATION.API_URLS. EMAIL_SERVICE_DETAIL, null, requestParam);
  }

  updateEmailService(requestBody) {
    return this.putRequest(API_CONFIGURATION.API_URLS.EMAIL_SERVICE_UPDATE, requestBody, null);
  }

  testSESService(requestParam) {
    return this.postRequest(API_CONFIGURATION.API_URLS.SES_TEST_EMAIL_SERVICE, requestParam);
  }
  testSMPTService(requestParam) {
    return this.postRequest(API_CONFIGURATION.API_URLS.SMTP_TEST_EMAIL_SERVICE, requestParam);
  }

}
