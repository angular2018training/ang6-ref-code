import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';

@Injectable()
export class ScheduleService extends CommonService {
    getAll(plantID) {
        return this.getRequest(API_CONFIGURATION.API_URLS.SCHEDULE, null, {
            plantid: plantID
        });
    }
    getDetail(plantID) {
        return this.getRequest(API_CONFIGURATION.API_URLS.SCHEDULE, null, {
            plantid: plantID,
        });
    }

    create(request) {
        return this.postRequest(API_CONFIGURATION.API_URLS.SCHEDULE, request);
    }

    update(request) {
        return this.putRequest(API_CONFIGURATION.API_URLS.SCHEDULE + '?plantid=' + request.id, request);
    }
    delete(request) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.SCHEDULE + '/' + request.scheduleID, null, {
            plantid: request.plantID
        });
    }
}