import * as _ from 'lodash';

import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, ViewChildren, Input } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { StringService } from '../services/string.service';

import { Observable } from 'rxjs/Observable';
import { MatDialog } from '@angular/material';
import { DialogScheduleCreateComponent } from '../schedule-create/dialog-schedule-create.component';
import { DialogScheduleUpdateComponent } from '../schedule-update/dialog-schedule-update.component';
import { ScheduleService } from 'app/api-service/schedule.service';
import { VARIABLES, MESSAGE } from '../constant';
import { CATEGORIES, STATUS, RECURRENCE_PATTERNS, TYPES, DAYINWEEK } from "./schedule-data.component";
import { LocalMessages } from '../message';

@Component({
  selector: 'schedule-list',
  templateUrl: './schedule-list.component.html',
  styleUrls: ['./schedule-list.component.scss']
})
export class ScheduleListComponent implements OnInit {
  @Input('idSelected') plantID: number;
  listState = ['schedule-list', 'schedule-create', 'schedule-detail'];
  currentState: string = this.listState[0];
  types = [
    { id: 1, label: 'Data Connection' },
    { id: 2, label: ' Optimization Execution' },
    { id: 3, label: 'Report Generation' },
  ];

  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'ID', hidden: true },
    { name: 'scheduleName', label: 'Schedule Name', sortable: true },
    { name: 'scheduleTypeName', label: 'Schedule Type', sortable: true },
    { name: 'recurrencePatternName', label: 'Recurrence', sortable: true },
    { name: 'days', label: 'Days', sortable: true, width: 200 },
    { name: 'time', label: 'Time', sortable: true },
    { name: 'activeStatus', label: 'Status', sortable: true },
    { name: 'delete', label: 'Delete' },
  ];

  data = [];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;
  noResultMessage = LocalMessages.messages["22"];
  searchTerm: string = '';

  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'scheduleName';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  // @ViewChild('filterL') filterEle: ElementRef;
  // @ViewChild('filter') filterEle;
  // @ViewChildren('filter', { read: ViewContainerRef }) viewContainerRefs;

  private filterEle: ElementRef;
  @ViewChild('filter') set content(content: ElementRef) {
    if (content != undefined) {
      this.filterEle = content;
      Observable.fromEvent(this.filterEle.nativeElement, 'keyup')
        .debounceTime(150)
        .distinctUntilChanged()
        .subscribe(() => {
          this.search(this.filterEle.nativeElement.value);
        });
    }
  }

  constructor(
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _ScheduleService: ScheduleService,
    private _StringService: StringService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this._UtilitiesService.showLoading();
    this.getListSchedule();

    // for (let i = 0; i < 400; i++) {
    //   this.data.push({
    //     activeStatus: true,
    //     category: 0,
    //     chillerPlantId: 186,
    //     id: 250,
    //     minutes: [60],
    //     recurrenceInterval: [6],
    //     recurrencePattern: 1,
    //     scheduleName: i,
    //     type: 0,
    //   });
    // }
    // this.filter();
  }
  // ngAfterViewInit() {
  // // ngDoChecked() {
  //   Observable.fromEvent(this.filterEle.nativeElement, 'keyup')
  //     .debounceTime(150)
  //     .distinctUntilChanged()
  //     .subscribe(() => {
  //       this.search(this.filterEle.nativeElement.value);
  //     });
  //   // console.log('abc');
  //   // this.viewContainerRefs.changes.subscribe(item => {
  //   //   if (this.viewContainerRefs.length > 0) {
  //   //     // this.viewContainerRefs.first.createComponent(this.contentFactory, 0);
  //   //   }
  //   // })
  // }

  toggleDefaultFullscreenDemo(): void {
    this._UtilitiesService.showLoading();
    setTimeout(() => {
      this._UtilitiesService.hideLoading();
    }, 500);
  }

  showError() {
    this._UtilitiesService.showError('Error message');
  }
  showSuccess(message: string) {
    this._UtilitiesService.showSuccess(message);
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    let newData: any[] = this.data;
    // let newData: any[] = this.filteredData;
    let excludedColumns: string[] = this.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
          (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  deleteAction(item) {
    let index = _.indexOf(this.data, item);
    this.data.splice(index, 1);
    this.filter();
  }

  //view
  showDeleteConfirm(item) {
    event.preventDefault();
    event.stopPropagation();
    this._UtilitiesService.showConfirmDialog(_.replace(LocalMessages.messages['23'], '%s', item.scheduleName), (result) => {
      if (result) {
        this._UtilitiesService.showLoading();
        let request = {
          plantID: this.plantID,
          scheduleID: item.id,
        }
        this._ScheduleService.delete(request).then(response => {
          this.getListSchedule();

          this._UtilitiesService.hideLoading();
          this._UtilitiesService.showSuccess(LocalMessages.messages['9']);
        }, error => {
          this._UtilitiesService.hideLoading();
          this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
        });
      }
    });
  }
  displaySchedule(id) {
    return this.types.filter(item => {
      return item.id == id;
    })[0].label;
  }
  onRowClick(row) {
    let dialogRef = this.dialog.open(DialogScheduleUpdateComponent, {
      width: '50%',
      disableClose: true,
      data: {
        schedule: _.cloneDeep(row),
        listSchedule: this.data
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // this._UtilitiesService.showLoading();
        this.getListSchedule('update');
      }
    });
  }
  getDayInMonth(arrNumber) {
    // let result = [];
    // if (arrNumber != undefined) {
    //   arrNumber = _.sortedUniq(arrNumber);
    //   arrNumber.forEach(item => {
    //     if (--item == 0) {
    //       item = 7;
    //     }
    //     result.push(DAYINWEEK.filter(itemDIM => {
    //       return itemDIM.id == item;
    //     })[0].label);
    //   });
    // }
    // return result;

    let result = [];
    if (arrNumber != undefined) {
      arrNumber = arrNumber.map(item => {
        if (--item == 0) {
          item = 7;
        }
        return item;
      }).sort();
      arrNumber.forEach(item => {
        result.push(DAYINWEEK.filter(itemDIM => {
          return itemDIM.id == item;
        })[0].label);
      });
    }
    return result;
  }
  getMonthYear(arrNumber) {
    let result = [];
    if (arrNumber != undefined) {
      arrNumber.forEach(item => {
        result.push(item % 32 + '/' + Math.floor(item / 32));
      });
    }
    return result;
  }

  formatMinuteHour(time) {
    return time < 10 ? '0' + time : time;
  }
  getMinuteHour(arrNumber) {
    let result = [];
    arrNumber.forEach(item => {
      result.push(this.formatMinuteHour(Math.floor(item / 60)) + ':' + this.formatMinuteHour(item % 60));
    });
    return result;
  }
  showAddDialog() {
    var dialogRef = this.dialog.open(DialogScheduleCreateComponent, {
      width: '50%',
      disableClose: true,
      data: {
        chillerPlantId: this.plantID,
        listSchedule: this.data
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getListSchedule('create');
      }
    });
  }
  getScheduleTypeName(category) {
    let findValue = _.filter(CATEGORIES, ['id', category]);
    if (findValue.length == 1) {
      return findValue[0].label;
    }
    return null;
  }
  getRecurrence(recurrencePattern) {
    let findValue = _.filter(RECURRENCE_PATTERNS, ['id', recurrencePattern]);
    if (findValue.length == 1) {
      return findValue[0].label;
    }
    return null;
  }
  // getNaturalTime(time) {
  //   if (Number(time) > 0) {
  //     if (time < 10) {
  //       return time.replace('0', '');
  //     }
  //     return time;
  //   }
  //   return '';
  // }

  //service
  getListSchedule(type: string = null) {
    this._ScheduleService.getAll(this.plantID).then(response => {
      if (response) {
        this.data = response.content;
        this.data.forEach(item => {
          item.scheduleTypeName = this.getScheduleTypeName(item.category);
          item.recurrencePatternName = this.getRecurrence(item.recurrencePattern);

          if (item.recurrencePattern == 0) {
            item.days = 'None';
          } else if (item.recurrencePattern == 1) {
            item.days = this.getDayInMonth(item.recurrenceInterval);
          } else if (item.recurrencePattern == 2) {
            item.days = item.recurrenceInterval;
          } else if (item.recurrencePattern == 3) {
            item.days = this.getMonthYear(item.recurrenceInterval);;
          }

          item.time = this.getMinuteHour(item.minutes);
          if (item.type == 1) {
            let time = item.time[0].split(':');
            item.time = 'Every ';
            if (Number(time[0]) > 0) {
              if (time[0] < 10) {
                time[0] = time[0].replace('0', '');
              }
              item.time += time[0] + ' hours';
            }
            if (Number(time[1]) > 0) {
              if (Number(time[0]) > 0) {
                item.time += ' ';
              }
              if (time[1] < 10) {
                time[1] = time[1].replace('0', '');
              }
              item.time += time[1] + ' minutes';
            }
          }
        });
      } else {
        this.data = [];
      }
      this.filter();

      if (type == 'create') {
        this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages['18'], '%s', 'Schedule'));
      } else if (type == 'update') {
        this._UtilitiesService.showSuccess(LocalMessages.messages['11']);
      }

      this._UtilitiesService.hideLoading();
    }, error => {
      this.data = [];
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

}