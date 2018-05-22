import { Component, OnInit, Inject, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { StringService } from 'app/services/string.service';

import { ValidateService } from 'app/services/validate.service';
import { VARIABLES } from 'app/constant';
import * as _ from 'lodash';
import { UnitPriceService } from 'app/api-service/unit-price.service';
import * as moment from "moment";
import { LocalMessages } from '../../message';

@Component({
    selector: 'unit-price-create',
    templateUrl: 'unit-price-create.component.html',
    styleUrls: ['./unit-price-create.component.scss']
})
export class CreateUnitPriceDialog implements OnInit {
    notifyRemove = false;

    currencys = [];
    fromTimeTemp = '';
    toTimeTemp = '';
    selectedCurrency = -1;
    selectedStatus = -1;
    selectedType = -1;

    disabled: boolean = false;

    status = [
        { id: 0, label: 'Active' },
        { id: 1, label: 'Inactive' },
    ];

    types = [
        { id: 0, label: 'All day' },
        { id: 1, label: 'From Time - To Time' },
    ];

    unitPriceValueTemp = [
        {
            unitValue: null,
            fromTime: '',
            toTime: '',
        }
    ];
    inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

    constructor(
        private _UtilitiesService: UtilitiesService,
        private _ValidateService: ValidateService,
        private _StringService: StringService,
        private unitPriceService: UnitPriceService,
        public dialogRef: MatDialogRef<any>,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) { }

    ngOnInit() {
        this._UtilitiesService.showLoading();
        this.getCurrencyList().then(() => {
            if (this.data.currencyId) {
                this.selectedCurrency = this.data.currencyId;
            } else {
                this.selectedCurrency = this.currencys[0].id;
            }
            this._UtilitiesService.stopLoading();
        }).catch(() => {
            this._UtilitiesService.stopLoading();
        });
        this.selectedStatus = this.status[0].id;
        this.selectedType = this.types[0].id;
    }
    // unit price schedule
    parseUnitPriceValue() {
        let unitPriceValues = [];
        if (this.selectedType === 0) {
            let fromTimeSplitted = this.data.unitPriceValue[0].fromTime.split(':');
            let toTimeSplitted = this.data.unitPriceValue[0].toTime.split(':');

            let fromTimeHours = Number(fromTimeSplitted[0]);
            let fromTimeminutes = Number(fromTimeSplitted[1]);

            let toTimeHours = Number(toTimeSplitted[0]);
            let toTimeminutes = Number(toTimeSplitted[1]);

            let unitPriceValue = {
                fromDate: fromTimeHours * 60 + fromTimeminutes,
                toDate: toTimeHours * 60 + toTimeminutes,
                value: this.data.unitPriceValue[0].unitValue,
            }
            unitPriceValues.push(unitPriceValue);
            return unitPriceValues;
        } else {
            this.unitPriceValueTemp.forEach(element => {
                let fromTimeSplitted = element.fromTime.split(':');
                let toTimeSplitted = element.toTime.split(':');

                let fromTimeHours = Number(fromTimeSplitted[0]);
                let fromTimeminutes = Number(fromTimeSplitted[1]);

                let toTimeHours = Number(toTimeSplitted[0]);
                let toTimeminutes = Number(toTimeSplitted[1]);

                let unitPriceValue = {
                    fromDate: fromTimeHours * 60 + fromTimeminutes,
                    toDate: toTimeHours * 60 + toTimeminutes,
                    value: element.unitValue,
                }
                unitPriceValues.push(unitPriceValue);
            });
        }
        return unitPriceValues;
    }
    // check invalid Price
    checkValidUnitPriceValue() {
        // format date
        const fromDate = this._UtilitiesService.formatTime(this.data.fromDate);
        const toDate = this._UtilitiesService.formatTime(this.data.toDate);

        let errorList = [];
        if (!this._ValidateService.checkValidInputName(this.data.priceId, true)) {
            errorList.push(LocalMessages.messages['1']);
        }
        if (this.isDuplicate()) {
            errorList.push(LocalMessages.messages['99']);
        }
        if (this.validationDate(fromDate, toDate) == false) {
            errorList.push(LocalMessages.messages['51']);
        } else if (fromDate > toDate) {
            errorList.push(LocalMessages.messages['51']);
        }


        if ((this.data.currencyId) && (this.selectedCurrency != this.data.currencyId)) {
            errorList.push(LocalMessages.messages['96']);
        }
        let times = null;
        if (this.selectedType == 0) {
            times = this.data.unitPriceValue;
        } else if (this.selectedType == 1) {
            times = this.unitPriceValueTemp;
        }
        times.some((element, index) => {
            if (isNaN(element.unitValue)) {
                errorList.push(LocalMessages.messages['15']);
            } else if (Number(element.unitValue) <= 0) {
                errorList.push(LocalMessages.messages['103']);
            }
            if (element.fromTime == '' || element.toTime == '') {
                errorList.push(LocalMessages.messages['15']);
            }
            let fromTime = this.strToTime(element.fromTime);
            let toTime = this.strToTime(element.toTime);
            if (fromTime >= toTime) {
                errorList.push(LocalMessages.messages['53']);
            }
            const listTimes = _.cloneDeep(times);
            listTimes.splice(index, 1);
            listTimes.forEach((item) => {
                if ((fromTime < this.strToTime(item.fromTime) && toTime < this.strToTime(item.fromTime))
                    || (fromTime > this.strToTime(item.toTime) && toTime > this.strToTime(item.toTime))) {

                } else {
                    errorList.push(LocalMessages.messages['53']);
                }
            });
        });
        return errorList;
    }
    // validate date 
    validationDate(fromDate, toDate, id = null) {
        let isValid = true;
        const temp = {
            fromDate: new Date(fromDate).getTime(),
            toDate: new Date(toDate).getTime()
        }
        this.data.unitPrices.forEach((item) => {
            const old = {
                fromDate: new Date(item.fromDate).getTime(),
                toDate: new Date(item.toDate).getTime(),
            }
            if (item.id != id) {
                if (temp.fromDate < old.fromDate && temp.toDate < old.fromDate) {

                } else if (temp.fromDate > old.toDate && temp.toDate > old.toDate) {

                } else {
                    isValid = false;
                }
            }
        });
        return isValid;
    }
    // create action
    createUnitPrice() {
        // format date
        const fromDate = this._UtilitiesService.formatTime(this.data.fromDate);
        const toDate = this._UtilitiesService.formatTime(this.data.toDate);

        const errorList = this.checkValidUnitPriceValue();
        if (errorList.length > 0) {
            this._UtilitiesService.validationErrorDisplay(errorList);
        } else {
            let requestData = {
                priceId: this.data.priceId,
                chillerPlantId: this.data.chillerPlantID,
                fromDate: fromDate,
                toDate: toDate,
                type: this.selectedType,
                currencyId: this.selectedCurrency,
                status: this.selectedStatus,
                unitPriceValuesDto: this.parseUnitPriceValue(),
            };
            return this.unitPriceService.createUnitPrice(requestData).then(result => {
                this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages['18'], '%s', 'Unit Price'));
                this.dialogRef.close(true);
            }, error => {
                this._UtilitiesService.showErrorAPI(error, null);
            });
        }
    }

    isValidUnitPrice() {
        if (this.selectedType == 0) {
            // return !this._StringService.isEmpty(this.data.unitPriceValue[0].unitValue);
            let unitPrice = this.data.unitPriceValue[0].unitValue;
            if ((isNaN(unitPrice) || Number(unitPrice) <= 0)) {
                return false;
            } else {
                return true;
            }
        } else if (this.selectedType == 1) {
            let isValid = false;
            this.unitPriceValueTemp.forEach((item) => {
                let unitPrice = item.unitValue;
                if ((isNaN(unitPrice) || Number(unitPrice) <= 0)) {
                    isValid = false;
                } else if (!item.fromTime) {
                    isValid = false;
                } else if (!item.toTime) {
                    isValid = false;
                } else {
                    isValid = true;
                }
            });
            return isValid;
        }
    }

    disableSaveButton() {
        if (
            !this.data.priceId ||
            !this.isValidUnitPrice() ||
            this.data.fromDate == '' ||
            this.data.toDate == '' ||
            this.selectedStatus == -1 ||
            this.selectedType == -1 ||
            this.selectedCurrency == -1
        ) {
            return true;
        } else {
            return false;
        }
    }


    getCurrencyList() {
        return this.unitPriceService.getCurrencyList().then(result => {
            if (result) {
                this.currencys = result.content;
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    addUnit() {
        this.unitPriceValueTemp.push({
            unitValue: null,
            fromTime: '',
            toTime: '',
        });
    };


    removeUnit(index) {
        if (this.unitPriceValueTemp.length > 1) {
            this.unitPriceValueTemp.splice(index, 1);
        }
    }

    //excute
    isDuplicate() {
        return this.data.unitPrices.some(item => {
            return item.priceId == this.data.priceId;
        });
    }

    strToTime(strTime) {
        let time = strTime.split(':');
        return Number(time[0]) * 60 + Number(time[1]);
    }
    timeToStr(time) {
        return Math.floor(time / 60) + ':' + time % 60;
    }

    checkInputUnitPrice(e) {
        if (
            e.keyCode == 187 ||
            e.keyCode == 189 ||
            e.keyCode == 69
        ) {
            return false;
        }
        return true;
    }
}