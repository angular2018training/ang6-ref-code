import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class DataConnectionService extends CommonService {
    
    getListPartner(){
        return this.getRequest(API_CONFIGURATION.API_URLS.LIST_PARTNER, null);
    }

    getConnectionDetail(requestParam){
        return this.getRequest(API_CONFIGURATION.API_URLS.CONNECTION_DETAIL, null, requestParam);
    }

    updateConnection(requestBody){
        return this.putRequest(API_CONFIGURATION.API_URLS.CONNECTION_UPDATE, requestBody, null);
    }

    testConnection(requestParam) {
        return this.postRequest(API_CONFIGURATION.API_URLS.TEST_CONNECTION, requestParam);
    }
}