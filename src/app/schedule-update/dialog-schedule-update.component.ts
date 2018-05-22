import { ViewChild } from '@angular/core';
import * as _ from 'lodash';

import { Component, OnInit, Inject, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { ValidateService } from "../services/validate.service";
import { UtilitiesService } from 'app/services/utilities.service';

import { RECURRENCE_PATTERNS_CATEGORY_REPORT_GENERATION, CATEGORIES, STATUS, RECURRENCE_PATTERNS, TYPES, DAYINWEEK, REPORT_GENERATION_START_TIME, ALERT_TIME } from "../schedule-list/schedule-data.component";

import { ScheduleService } from 'app/api-service/schedule.service';
import { StringService } from '../services/string.service';
import { MESSAGE, VARIABLES } from 'app/constant';
import { LocalMessages } from 'app/message';

@Component({
  selector: 'dialog-schedule-update',
  templateUrl: 'dialog-schedule-update.component.html',
  styleUrls: ['./dialog-schedule-update.component.scss', '../schedule-create/dialog-schedule-create.component.scss']
})
export class DialogScheduleUpdateComponent implements OnInit {
  @ViewChild('updateScheduleForm') updateScheduleForm;

  listSchedule = this.dataRef.listSchedule;
  data;
  item;

  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  alertTime = ALERT_TIME;
  reportGeneratationStartTime = REPORT_GENERATION_START_TIME;
  recurrence_patterns_category_report_generation = RECURRENCE_PATTERNS_CATEGORY_REPORT_GENERATION;

  hour: number = 0;
  hours = [];

  minute: number = 0;
  minutes = [];

  defaultTime: string = null;

  startTimes = [
    { startTime: this.defaultTime },
  ];
  startTimeBackup;

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
  textSelect: string = null;

  recurrence_patterns = RECURRENCE_PATTERNS;
  status = STATUS;
  categories = CATEGORIES;
  types = TYPES;
  dayInWeeks = _.cloneDeep(DAYINWEEK);

  public compareData = this._ValidateService.compareData;

  sourceData;

  // Watch change on form
  valueChange = false;

  constructor(
    public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public dataRef: any,
    private _UtilitiesService: UtilitiesService,
    public _ValidateService: ValidateService,
    private _ScheduleService: ScheduleService,
    private _StringService: StringService,
  ) {
    this.data = this.dataRef.schedule;

    this.item = {
      type: this.data.scheduleType,
    }
  }
  ngOnInit() {
    this.createTime();
    this.chooseRecurrence({ value: this.data.recurrencePattern });

    if (this.data.recurrencePattern == 1) {
      this.data.recurrenceInterval = this.data.recurrenceInterval.map(item => {
        if (--item == 0) {
          item = 7;
        }
        return item;
      });
      this.dayInWeeks.forEach(item => {
        item['isCheck'] = this.data.recurrenceInterval.includes(item.id);
      });
    } else if (this.data.recurrencePattern == 2) {
      this.dayInMonth = this.data.recurrenceInterval.map(item => {
        return {
          day: item
        }
      });
    } else if (this.data.recurrencePattern == 3) {
      this.dayInYear = this.data.recurrenceInterval.map(item => {
        return {
          day: item % 32,
          month: Math.floor(item / 32),
        }
      });
    }

    if (this.data.type == 0) {
      this.startTimes = this.data.time.map(item => {
        return {
          startTime: item
        };
      });

      this.startTimeBackup = _.cloneDeep(this.startTimes);

    } else if (this.data.type == 1) {
      this.hour = Math.floor(this.data.minutes[0] / 60);
      this.minute = this.data.minutes[0] % 60;
    }
  }

  // watch on change value of form
  ngAfterViewInit() {
    this.sourceData = _.cloneDeep(this.data);
    this.updateScheduleForm.valueChanges.subscribe(values => this.changeFormValue());
  }

  changeFormValue() {
    if (!this.compareData(this.sourceData, this.data)) {
      this.valueChange = true;
    } else {
      this.valueChange = false;
    }
  }

  changeStartTime(item) {
    for (let i in this.startTimes) {
      if (this.startTimes[i].startTime === this.data.time[i]) {
        this.valueChange = false;
      } else {
        this.valueChange = true;
      }
    }
  }

  checkDayInWeek(item) {
    if (item.isCheck) {
      this.data.recurrenceInterval.push(item.id)
    } else {
      let index = _.indexOf(this.data.recurrenceInterval, item.id);
      if (index !== -1) {
        this.data.recurrenceInterval.splice(index, 1);
      }
    }

    this.changeFormValue();
  }


  ngDoCheck() {
    // if (this.data.recurrencePattern == 0) {
    //   this.data.recurrenceInterval = [];
    // } else if (this.data.recurrencePattern == 1) {
    //   let validDayInWeeks = this.dayInWeeks.filter(item => {
    //     return item['isCheck'];
    //   }).map(item => {
    //     return item.id;
    //   });
    //   if (validDayInWeeks.length == 0) {
    //     return;
    //   } else {
    //     this.data.recurrenceInterval = _.sortBy(_.uniq(validDayInWeeks));
    //   }
    // } else if (this.data.recurrencePattern == 2) {
    //   let validDayInMonths = this.dayInMonth.filter(item => {
    //     return item.day;
    //   });
    //   if (validDayInMonths.length == 0) {
    //     return;
    //   } else {
    //     this.data.recurrenceInterval = _.sortBy(_.uniqBy(validDayInMonths, 'day').map(item => {
    //       return item.day;
    //     }));
    //   }
    // } else if (this.data.recurrencePattern == 3) {
    //   let validdayInYears = this.dayInYear.filter(item => {
    //     return item.day && item.month;
    //   });
    //   if (validdayInYears.length == 0) {
    //     return;
    //   } else {
    //     this.data.recurrenceInterval = _.sortBy(_.uniq(validdayInYears.map(item => {
    //       return item.day + item.month * 32;
    //     })));
    //   }
    // }

    if (this.data.recurrencePattern == 0) {
      this.data.recurrenceInterval = [];
    } else if (this.data.recurrencePattern == 1) {
      let dayInWeek = this.isValidDayInWeek();
      if (dayInWeek.isValid) {
        this.data.recurrenceInterval = _.sortBy(_.uniq(dayInWeek.validDayInWeek));
      } else {
        return;
      }
    } else if (this.data.recurrencePattern == 2) {
      let validDayInMonths = this.dayInMonth.filter(item => {
        return item.day;
      });
      if (validDayInMonths.length == 0) {
        return;
      } else {
        if (this.validDayInMonth(false)) {
          this.data.recurrenceInterval = _.sortBy(_.uniqBy(validDayInMonths, 'day').map(item => {
            return item.day;
          }));
        }
        else {
          return;
        }
      }
    } else if (this.data.recurrencePattern == 3) {
      let validdayInYears = this.dayInYear.filter(item => {
        return item.day && item.month;
      });
      if (validdayInYears.length == 0) {
        return;
      } else {
        if (this.validDayInYear(false)) {
          this.data.recurrenceInterval = _.uniq(validdayInYears.map(item => {
            return item.day + item.month * 32;
          }));
        }
        else {
          return;
        }
      }
    }

    if (this.data.type == 0) {
      if (this.validTime(false)) {
        this.data.minutes = _.sortBy(_.uniqBy(this.startTimes, 'startTime').map(item => {
          return this.convertStringToTime(item.startTime);
        }));
      } else {
        return;
      }
    } else if (this.data.type == 1) {
      if (this.validRepeatingInterval(false)) {
        this.data.minutes = [this.hour * 60 + this.minute];
      } else {
        return;
      }
    }
  }

  changeValue(newValue, item) {
    item['isCheck'] = newValue;
  }

  validateData() {
    if (this._StringService.isEmpty(this.data.scheduleName)) {
      this._UtilitiesService.showWarning('Please input Schedule Name');
      return false;
    } else if (this._StringService.isEmpty(this.data.activeStatus.toString())) {
      this._UtilitiesService.showWarning('Please select Status');
      return false;
    } else if (this.data.category == -1) {
      this._UtilitiesService.showWarning('Please select Schedule Type');
      return false;
    } else if (this.data.recurrencePattern == -1) {
      this._UtilitiesService.showWarning('Please select Recurrence Pattern');
      return false;
    } else if (this.data.type == -1) {
      this._UtilitiesService.showWarning('Please select Type');
      return false;
    } else if (this.checkDuplicate()) {
      this._UtilitiesService.showWarning(LocalMessages.messages['48']);
      return false;
    } else if (
      !this._StringService.isEmpty(this.data.alertMinutes) &&
      (
        this.data.alertMinutes < this.alertTime.MIN_TIME ||
        this.data.alertMinutes > this.alertTime.MAX_TIME
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

  createTime() {
    for (let i = 0; i < 24; i++) {
      this.hours.push(i);
    }
    for (let i = 0; i < 60; i++) {
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
    this.startTimes.push({ startTime: this.defaultTime });
    this.data.time.push(this.defaultTime);
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

  convertStringToTime(str) {
    let arrNum = str.split(':');
    if (arrNum.length == 2) {
      let hour = arrNum[0];
      let minute = arrNum[1];
      return Number(hour) * 60 + Number(minute);
    }
    return null;
  }
  // validTime() {
  //   if (this.startTimes.some(item => {
  //     return item.startTime == null || item.startTime == '';
  //   })) {
  //     this._UtilitiesService.showWarning('Please fill for Start time');
  //     return false;
  //   } else if (_.uniqBy(this.startTimes, 'startTime').length != this.startTimes.length) {
  //     this._UtilitiesService.showWarning('Start time do not duplicate');
  //     return false;
  //   }
  //   return true;
  // }
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
  isValidDayInWeek() {
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
    // if (this.dayInYear.some(item => {
    //   return (item.day == null && item.month == null) || (item.day == 0 && item.month == 0);
    // })) {
    //   if (isShowMessage) {
    //     this._UtilitiesService.showWarning('Please select Day In Year');
    //   }
    //   return false;
    // } else if (
    //   _.uniq(this.dayInYear.map(item => {
    //     return item.day + item.month * 32;
    //   })).length != this.dayInYear.length
    // ) {
    //   if (isShowMessage) {
    //     this._UtilitiesService.showWarning('Day In Year do not duplicate');
    //   }
    //   return false;
    // }
    // return true;

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
  validRepeatingInterval(isShowMessage: boolean = true) {
    if ((this.hour * 60 + this.minute) === 0) {
      if (isShowMessage) {
        this._UtilitiesService.showWarning('Please fill for Repeating Interval');
      }
      return false;
    }
    return true;
  }
  checkDuplicate() {
    return this.listSchedule.length > 0 && this.listSchedule.some(item => {
      return item.scheduleName == this.data.scheduleName && item.id != this.data.id;
    });
  }
  prepareData() {
    if (this.data.recurrencePattern == 0) {
      this.data.recurrenceInterval = [];
    } else if (this.data.recurrencePattern == 1) {
      let dayInWeek = this.isValidDayInWeek();
      if (dayInWeek.isValid) {
        this.data.recurrenceInterval = _.sortBy(_.uniq(dayInWeek.validDayInWeek));
      } else {
        this._UtilitiesService.showWarning('Please select Day In Week');
        return false;
      }
    } else if (this.data.recurrencePattern == 2) {
      let validDayInMonths = this.dayInMonth.filter(item => {
        return item.day;
      });
      if (validDayInMonths.length == 0) {
        this._UtilitiesService.showWarning('Please select Day In Month');
        return false;
      } else {
        if (this.validDayInMonth()) {
          this.data.recurrenceInterval = _.sortBy(_.uniqBy(validDayInMonths, 'day').map(item => {
            return item.day;
          }));
        }
        else {
          return false;
        }
      }
    } else if (this.data.recurrencePattern == 3) {
      let validdayInYears = this.dayInYear.filter(item => {
        return item.day && item.month;
      });
      if (validdayInYears.length == 0) {
        this._UtilitiesService.showWarning('Please select Day In Year');
        return false;
      } else {
        if (this.validDayInYear()) {
          this.data.recurrenceInterval = _.uniq(validdayInYears.map(item => {
            return item.day + item.month * 32;
          }));
        }
        else {
          return false;
        }
      }
    }

    if (this.data.type == 0) {
      if (this.validTime()) {
        this.data.minutes = _.sortBy(_.uniqBy(this.startTimes, 'startTime').map(item => {
          return this.convertStringToTime(item.startTime);
        }));
      } else {
        return false;
      }
    } else if (this.data.type == 1) {
      if (this.validRepeatingInterval()) {
        this.data.minutes = [this.hour * 60 + this.minute];
      } else {
        return false;
      }
    }
    return true;
  }
  getTimeInterval() {
    return this.hour * 60 + this.minute;
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
    if (this.data.category == 1) {
      isValid = this.prepareData();
    } else if (this.data.category == 2) {
      isValid = this.prepareData();
    } else if (this.data.category == 3) {
      this.data.minutes = [this.convertStringToTime(this.reportGeneratationStartTime)];
      if (this.data.recurrencePattern == 1) {
        this.data.recurrenceInterval = [];
      } else if (this.data.recurrencePattern == 2) {
        this.data.recurrenceInterval = [1];
      } else if (this.data.recurrencePattern == 3) {
        this.data.recurrenceInterval = [1 + 1 * 32];
      }
      isValid = true;
    }

    if (!isValid) {
      return;
    }

    this._UtilitiesService.showLoading();
    if (!this.data.alert) {
      this.data.alertMinutes = null;
    }

    this._ScheduleService.update(this.data).then(response => {
      this.dialogRef.close(true);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
      this.dialogRef.close(true);
    });
  }
  close() {
    this.data = _.clone(this.sourceData);
    this.dialogRef.close(false);
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
  // selectMonth(e) {
  //   // console.log(e);
  // }
  changeScheduleType(e) {
    // if (this.data.category == 2 && this.data.recurrencePattern == 1) {
    //   this.data.recurrencePattern = 0;
    // }
    // if (this.data.category == 2) {
    //   if (this.data.recurrencePattern == 1) {
    //     this.data.recurrencePattern = 0;
    //   }
    //   this.data.type = 0;
    // }
    if (this.data.category == 3) {
      if (this.data.recurrencePattern == 1) {
        this.data.recurrencePattern = 0;
      }
      this.data.type = 0;
    }
  }
  isDisabledSave() {
    return (
      _.isEqual(this.sourceData, this.data) ||
      !this._ValidateService.checkValidInputName(this.data.scheduleName, true) ||
      (
        this.data.category == 0 &&
        (
          (this.data.recurrencePattern == 1 && !this.isValidDayInWeek().isValid) ||
          (this.data.recurrencePattern == 2 && !this.validDayInMonth(false)) ||
          (this.data.recurrencePattern == 3 && !this.validDayInYear(false)) ||
          (this.data.type == 0 && !this.validTime(false)) ||
          (this.data.type == 1 && !this.validRepeatingInterval(false))
        )
      ) ||
      (
        this.data.category == 1 &&
        (
          (this.data.recurrencePattern == 1 && !this.isValidDayInWeek().isValid) ||
          (this.data.recurrencePattern == 2 && !this.validDayInMonth(false)) ||
          (this.data.recurrencePattern == 3 && !this.validDayInYear(false)) ||
          (this.data.type == 0 && !this.validTime(false)) ||
          (this.data.type == 1 && !this.validRepeatingInterval(false))
        )
      ) ||
      (this.data.alert == true && (this.data.alertMinutes == 0 || this.data.alertMinutes == null)) ||
      (this.data.type == 1 && this.getTimeInterval() <= 0)
    );
  }
  inputTime(event) {
    return event.charCode >= 48 && event.charCode <= 57;
  }
}