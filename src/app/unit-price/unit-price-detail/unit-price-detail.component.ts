import { Component, OnInit, Input, Inject, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as _ from 'lodash';
import { UnitPriceService } from '../../api-service/unit-price.service';
import { ValidateService } from 'app/services/validate.service';
import { UtilitiesService } from '../../services/utilities.service';
import * as moment from "moment";
import { LocalMessages } from '../../message';
import { VARIABLES } from '../../constant';

//component for Dialog
@Component({
    selector: 'app-unit-price-dialog',
    templateUrl: './unit-price-dialog.component.html',
    styleUrls: ['./unit-price-detail.component.scss']
})

export class UpdateUnitPriceDialog implements OnInit {

    updateData = {
        id: null,
        priceId: '',
        fromDate: null,
        toDate: null,
        type: null,
        currencyId: null,
        status: null,
        createDate: '',
        unitPriceValuesDto: [{
            fromDate: null,
            toDate: null,
            value: null,
        }]
    }
    dataTemp: any;
    status = [
        { id: 0, label: 'Active' },
        { id: 1, label: 'Inactive' },
    ];

    types = [
        { id: 0, label: 'All day' },
        { id: 1, label: 'From Time - To Time' },
    ];
    disabled: boolean = false;
    unitPriceValues = [];
    notifyRemove = false;
    currencys: any;
    unitPriceValuesTemp: any;
    inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

    constructor(
        public dialogRef: MatDialogRef<UpdateUnitPriceDialog>,
        private _ValidateService: ValidateService,
        private unitPriceService: UnitPriceService,
        private _UtilitiesService: UtilitiesService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
        this._UtilitiesService.showLoading();
        this.reloadData().then(() => {
            this.initListUnitPrice();
            this.dataTemp = _.cloneDeep(this.updateData);
            this.unitPriceValuesTemp = _.cloneDeep(this.unitPriceValues);
            this.dataTemp.unitPriceValuesDto = this.unitPriceValuesTemp;

            this._UtilitiesService.stopLoading();
        });
        this.getCurrencyList();
    }

    ngDoCheck() {
    }

    // get data detail
    reloadData() {
        let requestParam = {
            plantid: this.data.chillerPlantId,
            id: this.data.id
        };
        return this.unitPriceService.unitPriceDetail(requestParam).then(result => {
            if (result) {
                this.updateData = result;
                this.updateData.fromDate = new Date(this.updateData.fromDate);

                this.updateData.toDate = new Date(this.updateData.toDate);
                this.handleUnitPriceValue();
            }
            this._UtilitiesService.hideLoading();
        }, error => {
            this._UtilitiesService.hideLoading();
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    // handle unit price value\
    handleUnitPriceValue() {
        this.updateData.unitPriceValuesDto.forEach((element) => {
            let unitPriceValue = {
                fromTime: this.timeToStr(element.fromDate),
                toTime: this.timeToStr(element.toDate),
                value: element.value,
            }
            this.unitPriceValues.push(unitPriceValue);
        });
    }
    // get list currency
    getCurrencyList() {
        return this.unitPriceService.getCurrencyList().then(result => {
            if (result) {
                this.currencys = result.content;
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }
    // convert time to string
    timeToStr(time) {
        return _.padStart(_.toString(_.toInteger(time / 60)), 2, '0') + ':' + _.padStart(_.toString(_.toInteger(time % 60)), 2, '0')
    }
    // convert string to time
    strToTime(strTime) {
        let time = strTime.split(':');
        return Number(time[0]) * 60 + Number(time[1]);
    }
    //view
    changeType(e) {
        if (this.dataTemp.type == 1) {
            if (this.updateData.type == 0) {
                this.unitPriceValues = [
                    {
                        value: 0,
                        fromTime: '00:00',
                        toTime: '23:59',
                    }
                ]
            } else {
                this.unitPriceValues = this.unitPriceValuesTemp;
            }
        } else {
            if (this.updateData.type == 1) {
                this.unitPriceValues = [
                    {
                        value: 0,
                        fromTime: '',
                        toTime: '',
                    }
                ]
            } else {
                this.unitPriceValues = this.unitPriceValuesTemp;
            }
        }
    }
    disableSaveButton() {
        if (this.dataTemp) {
            if (_.isEqual(this.dataTemp.priceId, this.updateData.priceId)
                && _.isEqual(this.dataTemp.status, this.updateData.status)
                && _.isEqual(this.dataTemp.type, this.updateData.type)
                && _.isEqual(this.dataTemp.fromDate, this.updateData.fromDate)
                && _.isEqual(this.dataTemp.toDate, this.updateData.toDate)
                && _.isEqual(this.dataTemp.currencyId, this.updateData.currencyId)
                && _.isEqual(this.dataTemp.unitPriceValuesDto, this.unitPriceValues)
            ) {
                return true;
            } else if (
                !this.updateData.priceId ||
                !this.isValidUnitPrice() ||
                this.data.fromDate == '' ||
                this.data.toDate == '' ||
                this.updateData.status == -1 ||
                this.updateData.type == -1 ||
                this.updateData.currencyId == -1
            ) {
                return true;
            } else {
                return false;
            }
        }
    }
    isValidUnitPrice() {
        if (this.updateData.type == 0) {
            // return !this._StringService.isEmpty(this.data.unitPriceValue[0].unitValue);
            let unitPrice = this.unitPriceValues[0].value;
            if ((isNaN(unitPrice) || Number(unitPrice) <= 0)) {
                return false;
            } else {
                return true;
            }
        } else if (this.updateData.type == 1) {
            let isValid = false;
            this.unitPriceValues.forEach((item) => {
                // return this._StringService.isEmpty(item.unitValue);
                let unitPrice = item.value;
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
    parseUnitPriceValue() {
        let unitPriceValues = [];
        this.unitPriceValues.forEach(element => {
            let fromTimeSplitted = element.fromTime.split(':');
            let toTimeSplitted = element.toTime.split(':');

            let fromTimeHours = Number(fromTimeSplitted[0]);
            let fromTimeminutes = Number(fromTimeSplitted[1]);

            let toTimeHours = Number(toTimeSplitted[0]);
            let toTimeminutes = Number(toTimeSplitted[1]);

            let unitPriceValue = {
                fromDate: fromTimeHours * 60 + fromTimeminutes,
                toDate: toTimeHours * 60 + toTimeminutes,
                value: element.value,
            }
            unitPriceValues.push(unitPriceValue);
        });
        return unitPriceValues;
    }
    removeUnit(index) {
        if (this.unitPriceValues.length > 1) {
            this.unitPriceValues.splice(index, 1);
        } else {
            // this.notifyRemove = true;
        }
    }
    addUnit() {
        let unitPriceValue = {
            fromTime: '',
            toTime: '',
            value: null,
        }
        this.unitPriceValues.push(unitPriceValue);
    };
    updateUnitPrice() {
        const fromDate = this._UtilitiesService.formatTime(this.updateData.fromDate);
        const toDate = this._UtilitiesService.formatTime(this.updateData.toDate);
        const errorList = this.checkValidUnitPriceValue();
        if (errorList.length > 0) {
            this._UtilitiesService.validationErrorDisplay(errorList);
        } else {
            this._UtilitiesService.showLoading();
            let requestData = {
                id: this.updateData.id,
                priceId: this.updateData.priceId,
                chillerPlantId: this.data.chillerPlantId,
                fromDate: fromDate,
                toDate: toDate,
                type: this.updateData.type,
                currencyId: this.updateData.currencyId,
                status: this.updateData.status,
                unitPriceValuesDto: this.parseUnitPriceValue(),
            };

            return this.unitPriceService.unitPriceUpdate(requestData).then(result => {
                this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages['18'], '%s', 'Unit Price'));
                this._UtilitiesService.stopLoading();
                this.dialogRef.close(true);
            }, error => {
                this._UtilitiesService.stopLoading();
                this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
            });
        }
    }
    checkValidUnitPriceValue() {
        // format date
        const fromDate = this._UtilitiesService.formatTime(this.updateData.fromDate);
        const toDate = this._UtilitiesService.formatTime(this.updateData.toDate);

        let errorList = [];
        if (!this._ValidateService.checkValidInputName(this.updateData.priceId, true)) {
            errorList.push(LocalMessages.messages['1']);
        }
        if (this.isDuplicate()) {
            errorList.push(LocalMessages.messages['99']);
        }
        if (this.validationDate(fromDate, toDate, this.data.id) == false) {
            errorList.push(LocalMessages.messages['51']);
        } else if (fromDate > toDate) {
            errorList.push(LocalMessages.messages['51']);
        }
        if (this.data.currencyId && (this.updateData.currencyId != this.data.currencyId)) {
            errorList.push(LocalMessages.messages['96']);
        }

        this.unitPriceValues.forEach((element, index) => {
            if (isNaN(element.value)) {
                errorList.push(LocalMessages.messages['15']);
            } else if (Number(element.value) <= 0) {
                errorList.push(LocalMessages.messages['103']);
            }
            if (this.updateData.type == 1) {
                if (element.fromTime == '' || element.toTime == '') {
                    errorList.push(LocalMessages.messages['15']);
                }
                let fromTime = this.strToTime(element.fromTime);
                let toTime = this.strToTime(element.toTime);
                if (fromTime >= toTime) {
                    errorList.push(LocalMessages.messages['53']);
                }

                const listTimes = _.cloneDeep(this.unitPriceValues);
                listTimes.splice(index, 1);
                listTimes.forEach((item) => {
                    if ((fromTime < this.strToTime(item.fromTime) && toTime < this.strToTime(item.fromTime))
                        || (fromTime > this.strToTime(item.toTime) && toTime > this.strToTime(item.toTime))) {

                    } else {
                        errorList.push(LocalMessages.messages['53']);
                    }
                });
            }

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

    isDuplicate() {
        return this.data.unitPrices.some((item) => {
            return item.priceId == this.updateData.priceId;
        });
    }
    initListUnitPrice() {
        let indexPriceCur = _.findIndex(this.data.unitPrices, (item) => {
            return item['priceId'] == this.updateData.priceId;
        });
        this.data.unitPrices.splice(indexPriceCur, 1);
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