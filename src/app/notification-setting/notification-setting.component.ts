import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, ViewChildren } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { Observable } from 'rxjs/Observable';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { NotificationSettingService } from '../api-service/notification-setting.service'
import { LoginService } from 'app/services/login.service';
import { LocalMessages } from 'app/message';
import { NotificationAddDialog } from '../notification-add/notification-add.component';
import { NotificationUpdateDialog } from '../notification-update/notification-update.component'
import { PhoneNumberComponent } from '../phone-number/phone-number.component';
import * as _ from 'lodash';
import * as moment from "moment";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { VARIABLES } from "../constant";

@Component({
  selector: 'notification-setting',
  templateUrl: './notification-setting.component.html',
  styleUrls: ['./notification-setting.component.scss'],
})
export class NotificationSettingComponent implements OnInit {
  listState = ['schedule-list', 'schedule-create', 'schedule-detail'];
  currentState: string = this.listState[0];

  columns: ITdDataTableColumn[] = [
    // { name: 'no', label: 'No', sortable: true },
    { name: 'id', label: 'ID', sortable: true },
    { name: 'type', label: 'Type', sortable: true },
    { name: 'phoneEmail', label: 'Phone Number/Email', sortable: true },
    { name: 'setPointNotification', label: 'Set Points Notification', sortable: true },
    { name: 'reportNotification', label: 'Report Notification', sortable: true },
    { name: 'action', label: 'Delete' },
  ];

  data = [];
  types = [
    { id: 0, label: 'SMS' },
    { id: 1, label: 'Email' },
  ];
  ischeck: boolean = true;
  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  currentUser;

  createModel = {
    phoneEmail: null,
    setPointNotification: false,
    reportNotification: false,
    type: 0,
    userId: -1
  }

  noResultFound: string = LocalMessages.messages['22'];
  messageDeleteSucces: string = LocalMessages.messages['9'];

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  // sortBy: string = 'no';
  sortBy: string = 'id';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

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

  constructor(private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _LoginService: LoginService,
    private _NotificationSettingService: NotificationSettingService,
    private _PhoneNumberComponent: PhoneNumberComponent,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this._UtilitiesService.showLoading();
    this.currentUser = this._LoginService.getUserInfo();
    this.getNotificationSettingList().then(() => {
      this.filter();
      this._UtilitiesService.hideLoading();
    });
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

  filter(isSort: boolean = true): void {
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
    if (isSort) {
      newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    }
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  // Delete record
  showDeleteConfirm(item) {
    event.preventDefault();
    event.stopPropagation();
    this._UtilitiesService.showConfirmDialog(_.replace(LocalMessages.messages["61"], '%s', item.phoneEmail), (result) => {
      if (result) {
        this.deleteAction(item);
      }
    });
  }
  deleteAction(item) {
    let notificationid = item.id;
    this._NotificationSettingService.deleteNotificationSetting(notificationid).then(result => {
      if (result) {
        this.getNotificationSettingList();
        this.showSuccess(this.messageDeleteSucces);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
    });
  }

  getNotificationSettingList() {
    let userId = this.currentUser.userID;
    return this._NotificationSettingService.getNotificationSettingList(userId).then(result => {
      if (result) {
        this.data = result.content;
        let no: number = 0;
        _.forEach(this.data, item => {
          // item['no'] = no;
          // no++;
          item.phoneEmail = this._PhoneNumberComponent.getPhoneNumber(item.phoneEmail);
        })
        this.filter();
      } else {
        this.data = [];
        this.filter();
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  // show add dialog
  showAddDialog() {
    const dialogRef = this.dialog.open(NotificationAddDialog, {
      width: '400px',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getNotificationSettingList();
    })
  }

  // show update dialog
  showUpdateDialog(item) {
    const updateDialogData = _.cloneDeep(item);
    const dialogRef = this.dialog.open(NotificationUpdateDialog, {
      width: '400px',
      disableClose: true,
      data: updateDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getNotificationSettingList();
    })
  }
}
