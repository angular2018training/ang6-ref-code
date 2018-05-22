import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';

@Injectable()
export class DataMappingService extends CommonService {
    // getWeatherData(id, status) {
    getWeatherData(id) {
        return this.getRequest(API_CONFIGURATION.API_URLS.WEATHER_DATA_GET, null, {
            id: id,
            // status: status,
        });
    }

    save(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.WEATHER_DATA_SAVE, request);
    }

    collectTagName(chillerPlantId, requestBody) {
        return this.postRequest(API_CONFIGURATION.API_URLS.COLLECT_TAG_NAME + "/" + chillerPlantId + "/tag-name-from-en-trak", requestBody);
    }
}