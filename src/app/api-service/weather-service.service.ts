import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import {API_CONFIGURATION} from '../constant';
@Injectable()
export class WeatherServiceService extends CommonService {
    
    getWeatherService() {
        return this.getRequest(API_CONFIGURATION.API_URLS.WEATHER_SERVICE_GET);
    }

    updateWeatherService(requestData){
        return this.putRequest(API_CONFIGURATION.API_URLS.WEATHER_SERVICE_UPDATE, requestData);                
    }

    testConnection(requestData){
        return this.postRequest(API_CONFIGURATION.API_URLS.WEATHER_SERVICE_TEST, requestData);                
    }
}