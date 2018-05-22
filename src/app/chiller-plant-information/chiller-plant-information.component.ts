import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { UtilitiesService } from 'app/services/utilities.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ChillerPlantService } from '../api-service/chiller-plant.service';
import { MESSAGE, VARIABLES } from '../constant';
import { LocalMessages } from '../message';
import { ValidateService } from 'app/services/validate.service';
import { SharedService } from '../services/shared-service.service';

@Component({
  selector: 'app-chiller-plant-information',
  templateUrl: './chiller-plant-information.component.html',
  styleUrls: ['./chiller-plant-information.component.scss']
})

export class ChillerPlantInformationComponent implements OnInit {
  @Input('idSelected') plantID: number;
  @Output('isChanged') isChanged = new EventEmitter<boolean>();

  emitChangeValue(value) {
    this.isChanged.emit(value);
  }
  data: DataModel = {
    id: null,
    chillerPlantName: '',
    buildingName: '',
    provinceId: null,
    countryId: null,
    userId: null
  };
  updateData: DataModel = {
    id: null,
    chillerPlantName: '',
    buildingName: '',
    provinceId: null,
    countryId: null,
    userId: null
  };

  dataCountry = [];
  dataProvince = [];
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    private chillerPlantService: ChillerPlantService,
    private _ValidateService: ValidateService,
  ) {
  }

  ngOnInit() {
    this._UtilitiesService.stopLoading();
    this.reload();
  }

  reload() {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this.getCountry().then(() => {
        this._UtilitiesService.stopLoading();
      });
    }).catch((err) => {
      this._UtilitiesService.stopLoading();
    });;
  }
  reloadData() {
    const request = {
      id: this.plantID
    };
    return this.chillerPlantService.getChillerPlantInfo(request).then(result => {
      this.data = result;
      this.handleCountryProvince();
      this.updateData = _.clone(this.data);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  // handle data country & province
  handleCountryProvince() {
    if (!this.data.countryId) {
      this.data.countryId = 0;
      this.data.provinceId = 0;
    } else if (!this.data.provinceId) {
      this.data.provinceId = 0;
    }
  }
  // show massage
  showError(message) {
    this._UtilitiesService.showError(message);
  }
  showSuccess(message) {
    this._UtilitiesService.showSuccess(message);
  }
  // show save confirm
  showSaveConfirm() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    if (errorInput.length > 0) {
      this.validationErrorDisplay(errorInput);
    } else {
      this.saveAction(this.updateData);
    }
  }
  // execute save data
  saveAction(item) {
    const request = this.prepareUpdateData(item);
    return this.chillerPlantService.putChillerPlant(request).then(result => {
      if (result) {
        this.reload();
        this._UtilitiesService.showSuccess(LocalMessages.messages['13']);
      }
    }, error => {
      this._UtilitiesService.showError(LocalMessages.messages['12']);
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }
  prepareUpdateData(item) {
    let request = {
      id: item.id,
      chillerPlantName: item.chillerPlantName,
      buildingName: item.buildingName,
      provinceId: item.provinceId,
      countryId: item.countryId,
      userId: item.userId
    }
    if (request.countryId == 0) {
      request.countryId = null;
      request.provinceId = null;
    } else if (request.provinceId == 0) {
      request.provinceId = null;
    }
    return request
  }
  // get list country and province
  getCountry() {
    const request = {};
    return this.chillerPlantService.getCountry(request).then(result => {
      if (result) {
        this.dataCountry = result.content;
        if (this.data.countryId) {
          this.getProvince(this.data.countryId);
        }
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
      }
    });
  }
  // get data province
  getProvince(countryId) {
    this.dataProvince = this.dataCountry.filter((o) => {
      return o.id == countryId;
    })[0].provinces;
    // if(!this.data.provinceId) {
    //   this.data.provinceId = 0;
    // }
  }
  // execute change country
  changeCountry() {
    if (this.updateData.countryId > 0) {
      this.dataProvince = this.dataCountry.filter((o) => {
        return o.id == this.updateData.countryId;
      })[0].provinces;
      // init data
      this.updateData.provinceId = 0;
    }
    else {
      this.dataProvince = [];
      this.updateData.provinceId = 0;
    }
  }

  //display warning
  validationErrorDisplay(errorInput) {
    let errorMessage = '';
    _.forEach(_.uniq(errorInput), function (value) {
      errorMessage = errorMessage + value + '\n';
    });
    this._UtilitiesService.showWarning(errorMessage);
  }
  // check validate
  inputValidation(data) {
    let errorInput = [];
    data.chillerPlantName = _.trim(data.chillerPlantName);
    data.buildingName = _.trim(data.buildingName);
    if (!data.chillerPlantName) {
      errorInput.push(LocalMessages.messages["15"]);
    } else if (!this._ValidateService.checkValidInputName(data.chillerPlantName, true)) {
      errorInput.push(LocalMessages.messages["1"]);
    }

    if (!data.buildingName) {
      errorInput.push(LocalMessages.messages["15"]);
    } else if (!this._ValidateService.checkValidInputName(data.buildingName, true)) {
      errorInput.push(LocalMessages.messages["1"]);
    }
    return errorInput;
  }
  // compare data old vs data binding
  compareData() {
    if (_.isEqual(this.data, this.updateData)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    } else if (!this.updateData.chillerPlantName) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    } else if (!this.updateData.buildingName) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }
}

export interface DataModel {
  id: number,
  chillerPlantName: string,
  buildingName: string,
  provinceId: number,
  countryId: number,
  userId: number
}
