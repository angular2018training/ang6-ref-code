import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';
@Injectable()
export class ChillerPlantService extends CommonService {

    getChillerPlantList(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT, null, request);
    }
    getChillerPlantInfo(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT, null, request);
    }
    postChillerPlant(request) {
        return this.postRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT, request);
    }
    postChillerPlantImport(request) {
        return this.postFormRequest(API_CONFIGURATION.API_URLS.IMPORT_PLANT_MODEL, request);
      }
    deleteChillerPlant(request) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT + '/delete', null, request);
    }
    getCountry(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.COUNTRY_PROVICE, null, request);
    }
    putChillerPlant(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT, request);
    }
    getChillerPlantDetail(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT + '/details', null, request);
    }
    putChillerPlantDetail(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.CHILLER_PLANT + '/details', request);
    }
    getDataMapping(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.DATA_MAPPING + '/get', null, request);
    }
    saveDataMapping(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.DATA_MAPPING + '/save', request);
    }
    exportChillerPlantModel(request) {
        return this.getRequestWithDownLoadFile(API_CONFIGURATION.API_URLS.EXPORT_PLANT_MODEL, request);
    }
    getDefaultValue(request) {
        return this.getRequest(API_CONFIGURATION.API_URLS.DEFAULT_TABLE, null, request);
    }
}