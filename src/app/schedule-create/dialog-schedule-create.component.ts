import * as _ from 'lodash';

import { Component, OnInit, Inject, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ValidateService } from "../services/validate.service";
import { UtilitiesService } from '../services/utilities.service';
import { StringService } from '../services/string.service';

import { RECURRENCE_PATTERNS_CATEGORY_REPORT_GENERATION, CATEGORIES, STATUS, RECURRENCE_PATTERNS, TYPES, DAYINWEEK, REPORT_GENERATION_START_TIME, ALERT_TIME } from "../schedule-list/schedule-data.component";
import { ScheduleService } from 'app/api-service/schedule.service';
import { MESSAGE, VARIABLES } from 'app/constant';
import { LocalMessages } from 'app/message';

@Component({
  selector: 'dialog-schedule-create',
  templateUrl: 'dialog-schedule-create.component.html',
  styleUrls: ['./dialog-schedule-create.component.scss']
})
export class DialogScheduleCreateComponent {
  hour: number = 0;
  hours = [];

  minute: number = 0;
  minutes = [];
  defaultTime: string = null;

  startTimes = [
    { startTime: this.defaultTime },
  ];
  dayInMonth = [
    { day: 0 },
  ];
  dayInYear = [
    { day: 0, month: 0 }
  ];
  statusList = [
    'Active',
    'InActive'
  ];
  days = [];
  months = [];
  listSchedule = [];
  textSelect: string = null;

  $inputAlertTime = null;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

  alertTime = ALERT_TIME;
  maxAlertTime = this.alertTime.MAX_TIME.toString().length;

  recurrence_patterns = RECURRENCE_PATTERNS;
  recurrence_patterns_category_report_generation = RECURRENCE_PATTERNS_CATEGORY_REPORT_GENERATION;
  status = STATUS;
  categories = CATEGORIES;
  reportGeneratationStartTime = REPORT_GENERATION_START_TIME;


  types = TYPES;
  dayInWeeks = DAYINWEEK;

  request = {
    scheduleName: '',
    activeStatus: true,
    recurrencePattern: 0,
    type: 0,
    category: -1,
    chillerPlantId: null,
    listSchedule: null,
    minutes: [],
    recurrenceInterval: [],
    alert: false,
    alertMinutes: null,
  }

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _UtilitiesService: UtilitiesService,
    public _ValidateService: ValidateService,
    private _ScheduleService: ScheduleService,
    private _StringService: StringService,
  ) { }
  ngOnInit() {
    this.request.chillerPlantId = this.data.chillerPlantId;

    // Get list schedule
    // this.listSchedule = this.data.listSchedule;

    this.createTime();

    if (CATEGORIES && CATEGORIES.length > 0) {
      this.request.category = 1;
    }
  }
  // ngDoCheck(){
  //   if (this.request.alertMinutes > this.alertTime.MAX_TIME) {
  //     this.request.alertMinutes = this.alertTime.MAX_TIME;
  //     // return false;
  //   } else if (this.request.alertMinutes < this.alertTime.MIN_TIME) {
  //     this.request.alertMinutes = this.alertTime.MIN_TIME;
  //     // return false;
  //   }
  // }

  createTime() {
    for (let i = 0; i < 24; i++) {
      this.hours.push(i);
    }
    for (let i = 1; i < 60; i++) {
      this.minutes.push(i);
    }
    for (let i = 1; i <= 31; i++) {
      this.days.push(i);
    }
    for (let i = 1; i <= 12; i++) {
      this.months.push(i);
    }
    this.dayInWeeks.forEach(item => {
      item['isCheck'] = false;
    });
  }

  addStartTime(index) {
    // this.startTimes.splice(index + 1, 0, Math.max(...this.startTimes) + 1);
    this.startTimes.splice(index + 1, 0, { startTime: this.defaultTime });
  }
  removeStartTime(index) {
    if (this.startTimes.length > 1) {
      this.startTimes.splice(index, 1);
    }
  }
  addItem(arr, index) {
    if (arr[0].month != undefined) {
      arr.splice(index + 1, 0, { day: 0, month: 0 });
    } else {
      arr.splice(index + 1, 0, { day: 0 });
    }
  }
  removeItem(arr, index) {
    if (arr.length > 1) {
      arr.splice(index, 1);
    }
  }


  chooseRecurrence(e) {
    if (e.value == 1) {
      this.textSelect = 'Every';
    } else if (e.value == 2) {
      this.textSelect = 'Days';
    } else if (e.value == 3) {
      this.textSelect = 'Dates';
    }
  }
  convertStringToTime(str) {
    let arrNum = str.split(':');
    if (arrNum.length == 2) {
      let hour = arrNum[0];
      let minute = arrNum[1];
      return Number(hour) * 60 + Number(minute);
    }
    return null;
  }

  validateData() {
    // if (this._StringService.isEmpty(this.request.scheduleName)) {
    if (!this._ValidateService.checkValidInputName(this.request.scheduleName, true)) {
      this._UtilitiesService.showWarning('Please input Schedule Name');
      return false;
    } else if (this._StringService.isEmpty(this.request.activeStatus.toString())) {
      this._UtilitiesService.showWarning('Please select Status');
      return false;
    } else if (this.request.category == -1) {
      this._UtilitiesService.showWarning('Please select Schedule Type');
      return false;
    } else if (this.request.recurrencePattern == -1) {
      this._UtilitiesService.showWarning('Please select Recurrence Pattern');
      return false;
    } else if (this.request.type == -1) {
      this._UtilitiesService.showWarning('Please select Type');
      return false;
    } else if (this._ValidateService.checkDuplicate('scheduleName', this.request.scheduleName, this.data.listSchedule)) {
      this._UtilitiesService.showWarning(LocalMessages.messages['48']);
      return false;
    } else if (
      !this._StringService.isEmpty(this.request.alertMinutes) &&
      (
        this.request.alertMinutes < this.alertTime.MIN_TIME ||
        this.request.alertMinutes > this.alertTime.MAX_TIME
      )
    ) {
      this._UtilitiesService.showWarning(this._StringService.create(LocalMessages.messages["97"], {
        min: this.alertTime.MIN_TIME,
        max: this.alertTime.MAX_TIME
      }));
      return false;
    }

    return true;
  }
  validTime(isShowMessage: boolean = true) {
    if (this.startTimes.some(item => {
      return item.startTime == null || item.startTime == '';
    })) {
      if (isShowMessage) {
        this._UtilitiesService.showWarning('Please fill for Start time');
      }
      return false;
    } else if (_.uniqBy(this.startTimes, 'startTime').length != this.startTimes.length) {
      if (isShowMessage) {
        this._UtilitiesService.showWarning('Start time do not duplicate');
      }
      return false;
    }
    return true;
  }
  validRepeatingInterval(isShowMessage: boolean = true) {
    if ((this.hour * 60 + this.minute) === 0) {
      if (isShowMessage) {
        this._UtilitiesService.showWarning('Please fill for Repeating Interval');
      }
      return false;
    }
    return true;
  }
  validDayInMonth(isShowMessage: boolean = true) {
    if (this.dayInMonth.some(item => {
      return item.day == null || item.day == 0;
    })) {
      if (isShowMessage) {
        this._UtilitiesService.showWarning('Please select Day In Month');
      }
      return false;
    } else if (_.uniqBy(this.dayInMonth, 'day').length != this.dayInMonth.length) {
      if (isShowMessage) {
        this._UtilitiesService.showWarning('Day In Month do not duplicate');
      }
      return false;
    }
    return true;
  }
  validDayInYear(isShowMessage: boolean = true) {
    // if (isShowMessage) {
    //   if (this.dayInYear.some(item => {
    //     return (item.day == null && item.month == null) || (item.day == 0 && item.month == 0);
    //   })) {
    //     this._UtilitiesService.showWarning('Please select Day In Year');
    //     return false;
    //   } else if (_.uniqBy(this.dayInYear, 'day').length != this.dayInYear.length && _.uniqBy(this.dayInYear, 'month').length != this.dayInYear.length) {
    //     this._UtilitiesService.showWarning('Day In Year do not duplicate');
    //     return false;
    //   } else if (this.dayInYear.some(item => {
    //     return !this.isValidDayInYear(item);
    //   })) {
    //     this._UtilitiesService.showWarning('Invalid Day In Year');
    //     return false;
    //   }
    //   return true;
    // } else {
    //   if (this.dayInYear.some(item => {
    //     return (item.day == null && item.month == null) || (item.day == 0 && item.month == 0);
    //   })) {
    //     return false;
    //   } else if (_.uniqBy(this.dayInYear, 'day').length != this.dayInYear.length && _.uniqBy(this.dayInYear, 'month').length != this.dayInYear.length) {
    //     return false;
    //   }
    //   return true;
    // }
    if (isShowMessage) {
      if (this.dayInYear.some(item => {
        return item.day == null || item.month == null || item.day == 0 || item.month == 0;
      })) {
        this._UtilitiesService.showWarning('Please select Day In Year');
        return false;
      } else if (_.uniqBy(this.dayInYear, 'day').length != this.dayInYear.length && _.uniqBy(this.dayInYear, 'month').length != this.dayInYear.length) {
        this._UtilitiesService.showWarning('Day In Year do not duplicate');
        return false;
      } else if (this.dayInYear.some(item => {
        return !this.isValidDayInYear(item);
      })) {
        this._UtilitiesService.showWarning('Invalid Day In Year');
        return false;
      }
      return true;
    } else {
      if (this.dayInYear.some(item => {
        return item.day == null || item.month == null || item.day == 0 || item.month == 0;
      })) {
        return false;
      }
      return true;
    }
  }


  isValidDayInWeek() {
    // let validDayInWeek = this.dayInWeeks.filter(item => {
    //   return item['isCheck'];
    // }).map(item => {
    //   return item.id;
    // });
    // return {
    //   validDayInWeek: validDayInWeek,
    //   isValid: validDayInWeek.length > 0,
    // };
    let validDayInWeek = this.dayInWeeks.filter(item => {
      return item['isCheck'];
    }).map(item => {
      return item.id;
    });
    return {
      validDayInWeek: this.getDayInWeek(validDayInWeek),
      isValid: validDayInWeek.length > 0,
    };
  }
  getDayInWeek(arrDayInWeek) {
    return arrDayInWeek.map(item => {
      ++item;
      if (item == 8) {
        item = 1;
      }
      return item;
    });
  }

  prepareData() {
    if (this.request.recurrencePattern == 0) {
      this.request.recurrenceInterval = [];
    } else if (this.request.recurrencePattern == 1) {
      let dayInWeek = this.isValidDayInWeek();
      if (dayInWeek.isValid) {
        this.request.recurrenceInterval = _.sortBy(_.uniq(dayInWeek.validDayInWeek));
      } else {
        this._UtilitiesService.showWarning('Please select Day In Week');
        return false;
      }
    } else if (this.request.recurrencePattern == 2) {
      let validDayInMonths = this.dayInMonth.filter(item => {
        return item.day;
      });
      if (validDayInMonths.length == 0) {
        this._UtilitiesService.showWarning('Please select Day In Month');
        return false;
      } else {
        if (this.validDayInMonth()) {
          this.request.recurrenceInterval = _.sortBy(_.uniqBy(validDayInMonths, 'day').map(item => {
            return item.day;
          }));
        }
        else {
          return false;
        }
      }
    } else if (this.request.recurrencePattern == 3) {
      let validdayInYears = this.dayInYear.filter(item => {
        return item.day && item.month;
      });
      if (validdayInYears.length == 0) {
        this._UtilitiesService.showWarning('Please select Day In Year');
        return false;
      } else {
        if (this.validDayInYear()) {
          this.request.recurrenceInterval = _.uniq(validdayInYears.map(item => {
            return item.day + item.month * 32;
          }));
        }
        else {
          return false;
        }
      }
    }

    if (this.request.type == 0) {
      if (this.validTime()) {
        this.request.minutes = _.sortBy(_.uniqBy(this.startTimes, 'startTime').map(item => {
          return this.convertStringToTime(item.startTime);
        }));
      } else {
        return false;
      }
    } else if (this.request.type == 1) {
      if (this.validRepeatingInterval()) {
        this.request.minutes = [this.hour * 60 + this.minute];
      } else {
        return false;
      }
    }
    return true;
  }

  arrMonth30 = [4, 6, 9, 11];
  isValidDayInYear(item) {
    return !((item.day > 28 && item.month == 2) || (item.day > 30 && this.arrMonth30.includes(item.month)));
  }

  //view
  save() {
    if (!this.validateData()) {
      return;
    }

    let isValid = false;
    if (this.request.category == 1) {
      isValid = this.prepareData();
    } else if (this.request.category == 2) {
      isValid = this.prepareData();
    } else if (this.request.category == 3) {
      this.request.minutes = [this.convertStringToTime(this.reportGeneratationStartTime)];
      if (this.request.recurrencePattern == 1) {
        this.request.recurrenceInterval = [];
      } else if (this.request.recurrencePattern == 2) {
        this.request.recurrenceInterval = [1];
      } else if (this.request.recurrencePattern == 3) {
        this.request.recurrenceInterval = [1 + 1 * 32];
      }
      isValid = true;
    }

    if (!isValid) {
      return;
    }

    this._UtilitiesService.showLoading();
    if (!this.request.alert) {
      this.request.alertMinutes = null;
    }

    this._ScheduleService.create(this.request).then(response => {
      this.dialogRef.close(true);
    }, error => {
      this.dialogRef.close(true);
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  isDisabledSave() {
    return (
      !this._ValidateService.checkValidInputName(this.request.scheduleName, true) ||
      (
        this.request.category == 1 &&
        (
          (this.request.recurrencePattern == 1 && !this.isValidDayInWeek().isValid) ||
          (this.request.recurrencePattern == 2 && !this.validDayInMonth(false)) ||
          (this.request.recurrencePattern == 3 && !this.validDayInYear(false)) ||
          (this.request.type == 0 && !this.validTime(false)) ||
          (this.request.type == 1 && !this.validRepeatingInterval(false))
        )
      ) ||
      (
        this.request.category == 2 &&
        (
          (this.request.recurrencePattern == 1 && !this.isValidDayInWeek().isValid) ||
          (this.request.recurrencePattern == 2 && !this.validDayInMonth(false)) ||
          (this.request.recurrencePattern == 3 && !this.validDayInYear(false)) ||
          (this.request.type == 0 && !this.validTime(false)) ||
          (this.request.type == 1 && !this.validRepeatingInterval(false))
        )
      ) ||
      (this.request.alert == true && (this.request.alertMinutes == 0 || this.request.alertMinutes == null))
    );
  }

  changeScheduleType(e) {
    if (this.request.category == 3) {
      if (this.request.recurrencePattern == 1) {
        this.request.recurrencePattern = 0;
      }
      this.request.type = 0;
    }
  }

  changeDay(e, item) {
    // this.formatDayMonth(item);
  }
  changeMonth(e, item) {
    // this.formatDayMonth(item);
  }

  isSelect() {
    if (this.$inputAlertTime == null) {
      this.$inputAlertTime = $('.schedule-alert-time')[0];
    }
    if (typeof this.$inputAlertTime.selectionStart == "number") {
      return this.$inputAlertTime.selectionStart != this.$inputAlertTime.selectionEnd;
    }
    return false;
  }
  inputTime(event) {
    return event.charCode >= 48 && event.charCode <= 57;
  }
}