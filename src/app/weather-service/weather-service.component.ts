import { LocalMessages } from 'app/message';
import * as _ from 'lodash';

import { Component, OnInit } from '@angular/core';
import { WeatherServiceService } from '../api-service/weather-service.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { ValidateCustomService } from "../services/validate.service";
import { StringService } from "../services/string.service";

import { MESSAGE, VARIABLES } from '../constant';

@Component({
  selector: 'weather-service',
  templateUrl: './weather-service.component.html',
  styleUrls: ['./weather-service.component.scss']
})
export class WeatherServiceComponent implements OnInit {

  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  invalidURL: string = MESSAGE.ERROR.INVALID_URL;
  required: string = MESSAGE.ERROR.REQUIRED;
  updateData;

  public dataCollector = {
    id: '',
    apiUrl: '',
    userName: '',
    password: ''
  }

  constructor(
    private _UtilitiesService: UtilitiesService,
    private weatherServiceService: WeatherServiceService,
    private _ValidateCustomService: ValidateCustomService,
    private _StringService: StringService,
  ) { }

  ngOnInit() {
    this._UtilitiesService.showLoading();
    this.getWeatherService().then(() => {
      this._UtilitiesService.hideLoading();
      this.updateData = _.cloneDeep(this.dataCollector);
    }, error => {
      this._UtilitiesService.hideLoading();
    });
  }

  getWeatherService() {
    return this.weatherServiceService.getWeatherService().then(result => {
      if (result) {
        this.dataCollector.id = result.id;
        this.dataCollector.apiUrl = result.apiUrl;
        this.dataCollector.userName = result.userName;
        this.dataCollector.password = result.password;
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  updateWeatherService() {
    if (!this._ValidateCustomService.isURL(this.dataCollector.apiUrl)) {
      this._UtilitiesService.showWarning(this.invalidURL);
    } else if (!this.dataCollector.userName || !this.dataCollector.password) {
      this._UtilitiesService.showWarning(MESSAGE.ERROR.FILL_ON_REQUIRED_FIELD);
    } else if (!this.dataCollector.apiUrl.startsWith("http://") && !this.dataCollector.apiUrl.startsWith("https://")) {
      this._UtilitiesService.showWarning(MESSAGE.ERROR.INVALID_REST_API_URL);
    } else {
      this._UtilitiesService.showLoading();
      return this.weatherServiceService.updateWeatherService(this.dataCollector).then(result => {
        this.updateData = _.cloneDeep(this.dataCollector);
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showSuccess(MESSAGE.SUCCESS.UPDATE_SUCCESS);
      }, error => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
      });
    }
  }

  testConnection() {
    if (!this.dataCollector.apiUrl || !this.dataCollector.userName || !this.dataCollector.password) {
      this._UtilitiesService.showWarning(MESSAGE.ERROR.FILL_ON_REQUIRED_FIELD);
    } else if (!this.dataCollector.apiUrl.startsWith("http://") && !this.dataCollector.apiUrl.startsWith("https://")) {
      this._UtilitiesService.showWarning(MESSAGE.ERROR.INVALID_REST_API_URL);
    } else {
      this._UtilitiesService.showLoading();
      return this.weatherServiceService.testConnection(this.dataCollector).then(response => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showSuccess(response.message);
      }, error => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showErrorAPI(error, MESSAGE.ERROR.CONNECTION_FAILURE);
      });
    }
  }

  checkData() {
    return !this._ValidateCustomService.isURL(this.dataCollector.apiUrl) || this._StringService.isEmpty(this.dataCollector.userName) || this._StringService.isEmpty(this.dataCollector.password);
  }

  compareData() {
    return _.isEqual(this.dataCollector, this.updateData) || this.checkData();
  }
}