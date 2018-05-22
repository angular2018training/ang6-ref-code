import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class ESExpectationService extends CommonService {
    
    getESExpectationList(requestParam) {
        return this.getRequest(API_CONFIGURATION.API_URLS.ES_EXPECTATION_LIST, null, requestParam);
    }

    updateESExpectation(requestData){
        return this.putRequest(API_CONFIGURATION.API_URLS.ES_EXPECTATION_UPDATE, requestData);                
    }
}