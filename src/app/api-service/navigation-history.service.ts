import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';

@Injectable()
export class NavigationHistoryService extends CommonService {

    searchNavigationHistory(requestParam) {
        return this.postRequest(API_CONFIGURATION.API_URLS.NAVIGATION_HISTORY_SEARCH, requestParam);
    }

    navigationHistoryChillerPlantList(requestParam) {
        return this.postRequest(API_CONFIGURATION.API_URLS.NAVIGATION_HISTORY_CHILLER_PLANT_LIST, requestParam);
    }
}