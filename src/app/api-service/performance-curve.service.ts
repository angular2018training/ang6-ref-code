import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';

@Injectable()
export class PerformanceCurveService extends CommonService {

  getPerformanceCurveList(request) {
    return this.getRequest(API_CONFIGURATION.API_URLS.PERFORMANCE_CURVE_LIST, null, request);
  }
  deletePerformanceCurve(request) {
    return this.deleteRequest(API_CONFIGURATION.API_URLS.PERFORMANCE_CURVE_DELETE, null, request);
  }
  postPerformanceCurve(request) {
    return this.postFormRequest(API_CONFIGURATION.API_URLS.PERFORMANCE_CURVE_ADD, request);
  }
  putPerformanceCurve(request) {
    return this.postFormRequest(API_CONFIGURATION.API_URLS.PERFORMANCE_CURVE_UPDATE, request);
  }
  downPerformanceCurve(request) {
    return this.downloadRequest(API_CONFIGURATION.API_URLS.PERFORMANCE_CURVE_DOWN, request);
  }

}