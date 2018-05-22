import { Injectable } from '@angular/core';
import { CommonService } from './common.service';
import { API_CONFIGURATION } from '../constant';

@Injectable()
export class NotificationSettingService extends CommonService {
    getNotificationSettingList(userID) {
        return this.getRequest(API_CONFIGURATION.API_URLS.NOTIFICATION_SETTING_LIST, null, {
            userid: userID
        });
    }

    createNotificationSetting(requestData) {
        return this.postRequest(API_CONFIGURATION.API_URLS.NOTIFICATION_SETTING_LIST, requestData);
    }

    updateNotificationSetting(requestData) {
        return this.putRequest(API_CONFIGURATION.API_URLS.NOTIFICATION_SETTING_LIST, requestData);
    }

    deleteNotificationSetting(notificationSettingID) {
        return this.deleteRequest(API_CONFIGURATION.API_URLS.NOTIFICATION_SETTING_DELETE + notificationSettingID);
    }
}