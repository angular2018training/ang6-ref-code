import * as _ from 'lodash';
import { Input, Output, Component, OnInit, OnDestroy, EventEmitter } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UtilitiesService } from 'app/services/utilities.service';
import { DataConnectionService } from '../api-service/data-connection.service';
import { ValidateCustomService } from '../services/validate.service';
import { StringService } from '../services/string.service';
import { Customer } from '../model/customer';
import { VARIABLES, MESSAGE } from '../constant';
import {LocalMessages} from '../message';
import {SharedService} from '../services/shared-service.service';

@Component({
  selector: 'data-connection',
  templateUrl: './data-connection.component.html',
  styleUrls: ['./data-connection.component.scss']
})

export class DataConnectionComponent implements OnInit {
  @Output('isChanged') isChanged = new EventEmitter<boolean>();
  
  emitChangeValue(value) {
    this.isChanged.emit(value);
  }

  @Input() chillerPlantID;

  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;

  listPartners = [];
  data = {
    id: null,
    chillerPlantId: null,
    dataCollectionDetail: {
      connectionType: 'JDBC',
      dataSourceName: '',
      databaseType: -1,
      host: '',
      port: '',
      database: '',
      userName: '',
      password: '',
      apiUrl: ''
    },
    dataSendingDetail: {
      connectionType: 'API',
      apiUrl: '',
      userName: '',
      password: ''
    },
    providerId: null
  };
  updateData = {
    id: null,
    chillerPlantId: null,
    dataCollectionDetail: {
      connectionType: 'JDBC',
      dataSourceName: '',
      databaseType: -1,
      host: '',
      port: '',
      database: '',
      userName: '',
      password: '',
      apiUrl: ''
    },
    dataSendingDetail: {
      connectionType: 'API',
      apiUrl: '',
      userName: '',
      password: ''
    },
    providerId: 1
  };
  databaseTypes = [
    {
      label: '-- Select an option --',
      value: -1
    },
    {
      label: 'MS SQL Server',
      value: 1
    },
    {
      label: 'Oracle',
      value: 2
    },
    {
      label: 'My SQL',
      value: 3
    },
    {
      label: 'Postgre SQL',
      value: 4
    }
  ];

  providerId: number = 1;
  constructor(
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private _UtilitiesService: UtilitiesService,
    private dataConnectionService: DataConnectionService,
    private _ValidateCustomService: ValidateCustomService,
    private _StringService: StringService,
  ) {
   }

  ngOnInit() {
    this.reload();
  }
  reload() {
    this._UtilitiesService.showLoading();
    this.getPartnerDetail().then(() => {
      this.getListPartner();
      this._UtilitiesService.stopLoading();
    });
  }
  getPartnerDetail() {
    let requestParam = {
      id: this.chillerPlantID,
    };
    return this.dataConnectionService.getConnectionDetail(requestParam).then(result => {
      if (result) {
        this.data = {
          id: result.id,
          chillerPlantId: result.chillerPlantId,
          dataCollectionDetail: JSON.parse(result.jsonDataCollectionDetail),
          dataSendingDetail: JSON.parse(result.jsonDataSendingDetail),
          providerId: result.providerId
        };
        this.providerId = this.data.providerId;
        this.updateData = _.cloneDeep(this.data);
      }
    }, error => {
      console.log(error);
    });
  }

  getListPartner() {
    let requestParam = {};
    return this.dataConnectionService.getListPartner().then(result => {
      if (result) {
        this.listPartners = result;
      }
    }, error => {
        this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  testConnection(type) {
    let errorInput = [];
    if (type === 'dataSender') {
      // if(!this.updateData.dataSendingDetail.apiUrl) {
      if (!this._ValidateCustomService.isURL(this.updateData.dataSendingDetail.apiUrl)) {
        errorInput.push("API Url is missing or invalid");
      }
      if (!this.updateData.dataSendingDetail.userName) {
        errorInput.push("User Name is missing");
      }
      if (!this.updateData.dataSendingDetail.password) {
        errorInput.push("Password is missing");
      }
    } else if (type === 'dataCollector') {
      if (this.updateData.providerId === 1) {
        if (!this.updateData.dataCollectionDetail.dataSourceName) {
          errorInput.push("Data Source Name is missing");
        }
        if (this.updateData.dataCollectionDetail.databaseType == -1) {
          errorInput.push("Database Type is missing");
        }
        if (!this.updateData.dataCollectionDetail.host) {
          errorInput.push("Host is missing");
        }
        if (!this.updateData.dataCollectionDetail.port) {
          errorInput.push("Port is missing");
        }
        if (!this.updateData.dataCollectionDetail.database) {
          errorInput.push("Database is missing");
        }
        if (!this.updateData.dataCollectionDetail.userName) {
          errorInput.push("User Name is missing");
        }
        if (!this.updateData.dataCollectionDetail.password) {
          errorInput.push("Password is missing");
        }
      } else if (this.updateData.providerId === 2) {
        if (!this.updateData.dataCollectionDetail.userName) {
          errorInput.push("User Name is missing");
        }
        if (!this.updateData.dataCollectionDetail.password) {
          errorInput.push("Password is missing");
        }
        if (!this._ValidateCustomService.isURL(this.updateData.dataCollectionDetail.apiUrl)) {
          errorInput.push("API Url is missing or invalid");
        }
      }
    }

    if (errorInput.length > 0) {
      this.validationErrorDisplay(errorInput);
    } else {
      this._UtilitiesService.showLoading();
      let requestParam = {
        plaId: this.chillerPlantID,
      };
      return this.dataConnectionService.testConnection(requestParam).then(response => {
        // if (result.message === "FAILED!") {
        //   this._UtilitiesService.showError(result.message);
        // } else if (result.message === "GOOD!") {
        //   this._UtilitiesService.showSuccess(result.message);
        // }
        this._UtilitiesService.hideLoading();
        if (response.message === "Connection failed") {
          this._UtilitiesService.showError(response.message);
        } else {
          this._UtilitiesService.showSuccess(response.message);
        }
      }, error => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showErrorAPI(error, null);
        console.log(error);
      });
    }
  }
  changePartner(e) {
    if (this.providerId == e.value) {
      this.getPartnerDetail();
    } else {
      this.updateData.dataCollectionDetail = {
        connectionType: e.value == 1 ? 'JDBC' : 'API',
        apiUrl: '',
        userName: '',
        password: '',
        dataSourceName: '',
        databaseType: -1,
        host: '',
        port: '',
        database: '',
      };
      this.updateData.dataSendingDetail = {
        connectionType: 'API',
        apiUrl: '',
        userName: '',
        password: ''
      };
      this.data = _.cloneDeep(this.updateData);
    }
  }
  // execute save
  saveAction() {
    let prepareData = {
      id: this.updateData.id,
      chillerPlantId: this.chillerPlantID,
      providerId: this.updateData.providerId,
      jsonDataCollectionDetail: JSON.stringify(this.prepareDataCollection(this.updateData)),
      jsonDataSendingDetail: JSON.stringify(this.prepareDataSending(this.updateData)),
    }
    return this.dataConnectionService.updateConnection(prepareData).then(result => {
      if (result) {
        this._UtilitiesService.showSuccess(LocalMessages.messages['13']);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }

  // show confirm
  showSaveConfirm() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this.validationErrorDisplay(errorInput);
    } else {
      this.saveAction().then(() => {
        this.reload();
      });
    }
  }
  // validation detail
  inputValidation(data) {
    let errorInput = [];
    if (data.providerId == 1) {
      if (!data.dataCollectionDetail.dataSourceName) {
        errorInput.push("Data Source Name is missing");
      }
      if (data.dataCollectionDetail.databaseType == -1) {
        errorInput.push("Database Type is missing");
      }
      if (!data.dataCollectionDetail.host) {
        errorInput.push("Host is missing");
      }
      if (!data.dataCollectionDetail.port) {
        errorInput.push("Port is missing");
      }
      if (!data.dataCollectionDetail.database) {
        errorInput.push("Database is missing");
      }
      if (!data.dataCollectionDetail.userName) {
        errorInput.push("User Name is missing");
      }
      if (!data.dataCollectionDetail.password) {
        errorInput.push("Password is missing");
      }
    } else if (data.providerId == 2) {
      if (!data.dataCollectionDetail.userName) {
        errorInput.push("User Name is missing");
      }
      if (!data.dataCollectionDetail.password) {
        errorInput.push("Password is missing");
      }
      // if (!data.dataCollectionDetail.apiUrl) {
      if (!this._ValidateCustomService.isURL(data.dataCollectionDetail.apiUrl)) {
        errorInput.push("API Url is missing or invalid");
      }
    }

    // if (!data.dataSendingDetail.apiUrl) {
    if (!this._ValidateCustomService.isURL(data.dataSendingDetail.apiUrl)) {
      errorInput.push("API Url is missing or invalid");
    }
    if (!data.dataSendingDetail.userName) {
      errorInput.push("User Name is missing");
    }
    if (!data.dataSendingDetail.password) {
      errorInput.push("Password is missing");
    }

    return errorInput;
  }
  prepareDataCollection(data) {
    let dataPrepare = {};
    if (data.providerId == 1) {
      dataPrepare = {
        connectionType: data.dataCollectionDetail.connectionType,
        dataSourceName: data.dataCollectionDetail.dataSourceName,
        databaseType: data.dataCollectionDetail.databaseType,
        host: data.dataCollectionDetail.host,
        port: data.dataCollectionDetail.port,
        database: data.dataCollectionDetail.database,
        userName: data.dataCollectionDetail.userName,
        password: data.dataCollectionDetail.password
      }
    } else if (data.providerId == 2) {
      dataPrepare = {
        connectionType: data.dataCollectionDetail.connectionType,
        apiUrl: data.dataCollectionDetail.apiUrl,
        userName: data.dataCollectionDetail.userName,
        password: data.dataCollectionDetail.password
      }
    }
    return dataPrepare;
  }
  prepareDataSending(data) {
    let dataPrepare = {
      connectionType: data.dataSendingDetail.connectionType,
      apiUrl: data.dataSendingDetail.apiUrl,
      userName: data.dataSendingDetail.userName,
      password: data.dataSendingDetail.password
    }
    return dataPrepare;
  }
  //display warning
  validationErrorDisplay(errorInput) {
    let errorMessage = '';
    _.forEach(errorInput, function (value) {
      errorMessage = errorMessage + value + '\n';
    });
    this._UtilitiesService.showWarning(errorMessage);
  }

  //view
  isDisabledTestConnection(type: string) {
    // if (type == 'dataCollectorGreen') {
    //   return !this.updateData.dataCollectionDetail.dataSourceName ||
    //     this.updateData.dataCollectionDetail.databaseType == -1 ||
    //     !this.updateData.dataCollectionDetail.host ||
    //     !this.updateData.dataCollectionDetail.port ||
    //     !this.updateData.dataCollectionDetail.database ||
    //     !this.updateData.dataCollectionDetail.userName ||
    //     !this.updateData.dataCollectionDetail.password;
    // } else if (type == 'dataCollectorEntrak') {
    //   return !this._ValidateCustomService.isURL(this.updateData.dataCollectionDetail.apiUrl) ||
    //     !this.updateData.dataCollectionDetail.userName ||
    //     !this.updateData.dataCollectionDetail.password;
    // } else if (type == 'dataSender') {
    //   return !this._ValidateCustomService.isURL(this.updateData.dataSendingDetail.apiUrl) ||
    //     !this.updateData.dataSendingDetail.userName ||
    //     !this.updateData.dataSendingDetail.password;
    // }

    if (type == 'dataCollectorGreen') {
      return this._StringService.isEmpty(this.updateData.dataCollectionDetail.dataSourceName) ||
        this.updateData.dataCollectionDetail.databaseType == -1 ||
        this._StringService.isEmpty(this.updateData.dataCollectionDetail.host) ||
        isNaN(Number(this.updateData.dataCollectionDetail.port)) ||
        Math.floor(Number(this.updateData.dataCollectionDetail.port)) <= 0 ||
        this._StringService.isEmpty(this.updateData.dataCollectionDetail.database) ||
        this._StringService.isEmpty(this.updateData.dataCollectionDetail.userName) ||
        !this.updateData.dataCollectionDetail.password;
    } else if (type == 'dataCollectorEntrak') {
      return !this._ValidateCustomService.isURL(this.updateData.dataCollectionDetail.apiUrl) ||
        this._StringService.isEmpty(this.updateData.dataCollectionDetail.userName) ||
        !this.updateData.dataCollectionDetail.password;
    } else if (type == 'dataSender') {
      return !this._ValidateCustomService.isURL(this.updateData.dataSendingDetail.apiUrl) ||
        this._StringService.isEmpty(this.updateData.dataSendingDetail.userName) ||
        !this.updateData.dataSendingDetail.password;
    }
  }
  checkMissingField() {
    if (this.updateData.providerId == 1) {
      if (
        !this.updateData.dataCollectionDetail.dataSourceName ||
        (this.updateData.dataCollectionDetail.databaseType == -1) ||
        !this.updateData.dataCollectionDetail.host ||
        !this.updateData.dataCollectionDetail.port ||
        (this.updateData.dataCollectionDetail.port && Number(this.updateData.dataCollectionDetail.port) < 0) ||
        !this.updateData.dataCollectionDetail.database ||
        !this.updateData.dataCollectionDetail.userName ||
        !this.updateData.dataCollectionDetail.password ||
        !this._ValidateCustomService.isURL(this.updateData.dataSendingDetail.apiUrl) ||
        !this.updateData.dataSendingDetail.userName ||
        !this.updateData.dataSendingDetail.password ||
        _.isEqual(this.data, this.updateData)
      ) {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        return true;
      } else {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
        return false;
      }
    } else {
      if (
        !this._ValidateCustomService.isURL(this.updateData.dataCollectionDetail.apiUrl) ||
        !this.updateData.dataCollectionDetail.userName ||
        !this.updateData.dataCollectionDetail.password ||
        !this.updateData.dataSendingDetail.apiUrl ||
        !this.updateData.dataSendingDetail.userName ||
        !this.updateData.dataSendingDetail.password ||
        _.isEqual(this.data, this.updateData)
      ) {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        return true;
      } else {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
        return false;
      }
    }
  }
  inputPort(e) {
    if (
      e.keyCode == 187 ||
      e.keyCode == 189 ||
      e.keyCode == 190
    ) {
      return false;
    }
  }
}