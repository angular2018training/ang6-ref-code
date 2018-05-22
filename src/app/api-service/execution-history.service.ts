import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class ExecutionHistoryService extends CommonService {
    
    searchExecutionList(requestParam) {
        return this.postRequest(API_CONFIGURATION.API_URLS.EXECUTION_HISTORY_LIST, requestParam);
    }

    getExecutionDetail(requestData){
        return this.getRequest(API_CONFIGURATION.API_URLS.EXECUTION_HISTORY_DETAIL, null, requestData);
    }
}