import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class BaseLineService extends CommonService {
    
    getBaseLine(requestParam) {
        return this.getRequest(API_CONFIGURATION.API_URLS.BASE_LINE, null, requestParam);
    }

    updateBaseLine(requestData){
        return this.putRequest(API_CONFIGURATION.API_URLS.BASE_LINE_UPDATE, requestData);                
    }
}