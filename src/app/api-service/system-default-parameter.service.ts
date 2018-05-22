import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class SystemDefaultParameterService extends CommonService {
    
    getDefaultParameter() {
        return this.getRequest(API_CONFIGURATION.API_URLS.GET_DEFAULT_PARAMETER);
    }

    updateDefaultParameter(requestData) {
        return this.putRequest(API_CONFIGURATION.API_URLS.UPDATE_DEFAULT_PARAMETER, requestData);
    }

}