import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class BMSService extends CommonService {
    
    getListBMS(requestParam){
        return this.getRequest(API_CONFIGURATION.API_URLS.BMS_LIST, null, requestParam);
    }

    deleteBMSImage(id) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.BMS_DELETE + "/" + id);
    }

    getBmsImageDetail(requestParam) {
        return this.getRequest(API_CONFIGURATION.API_URLS.BMS_DETAIL, null, requestParam);
    }
}