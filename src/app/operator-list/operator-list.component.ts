import * as _ from 'lodash';
import * as moment from "moment";

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn, IPageChangeEvent } from '@covalent/core';
import { Observable } from 'rxjs/Observable';

import { PAGES, VARIABLES, MESSAGE } from '../constant';

import { UserService } from "../services/user.service";

import { UtilitiesService } from 'app/services/utilities.service';
import { OperatorService } from 'app/api-service/operator.service';
import { StringService } from '../services/string.service';
import { LocalMessages } from '../message';

const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

@Component({
  selector: 'operator-list',
  templateUrl: './operator-list.component.html',
  styleUrls: ['./operator-list.component.scss']
})
export class OperatorListComponent implements OnInit {
  noResultMessage = LocalMessages.messages["22"];
  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'Operator ID', sortable: true },
    { name: 'userName', label: 'Username', sortable: true },
    { name: 'firstName', label: 'First Name', sortable: true },
    { name: 'lastName', label: 'Last Name', sortable: true },
    { name: 'accountStatus', label: 'Status', sortable: true },
    { name: 'lastLogin', label: 'Last Login', sortable: true },
    { name: 'createDate', label: 'Created Date', sortable: true },
    { name: 'phoneNumber', label: 'Phone Number', sortable: true },
    { name: 'email', label: 'Email', sortable: true },
    { name: 'action', label: 'Delete' },
  ];

  data = [];
  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  userID: number = 0;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'id';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  @ViewChild('filter') filterEle: ElementRef;

  constructor(
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _OperatorService: OperatorService,
    private _StringService: StringService,
    private _UserService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {

    this._UtilitiesService.showLoading();
    this.userID = this._UserService.getAuthorization().userID;
    this.getAllOperator();

    // input search event
    Observable.fromEvent(this.filterEle.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        this.search(this.filterEle.nativeElement.value);
      });
  }

  toggleDefaultFullscreenDemo(): void {
    this._UtilitiesService.showLoading();
    setTimeout(() => {
      this._UtilitiesService.hideLoading();
    }, 500);
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

  allColumns = [];
  filterColumn() {
    if (this.allColumns.length == 0) {
      for (let item in this.data[0]) {
        this.allColumns.push(item);
      }
    }
    return _.difference(this.allColumns, this.columns.map(item => { return item.name }));
  }
  filter(): void {
    let newData: any[] = this.data;
    let excludedColumns: string[] = this.filterColumn();
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  //excute
  getPhoneNumber(phoneNumber) {
    if (!this._StringService.isEmpty(phoneNumber)) {
      let arrPhone = phoneNumber.split('/');
      if (arrPhone.length == 2) {
        return arrPhone[0] + ' ' + arrPhone[1];
      }
    }
    return phoneNumber;
  }

  //view
  showDeleteConfirm(event, row) {
    event.preventDefault();
    event.stopPropagation();
    this._UtilitiesService.showConfirmDialog(this._StringService.getConfirmDelete(row.userName), (result) => {
      if (result) {
        this.deleteOperator(row.id);
      }
    });
  }
  onRowClick(row) {
    // this.router.navigate(['/customer-management/customer-list/customer-detail'], { queryParams: { id: row.id } });
    this.router.navigate([PAGES.OPERATOR.OPERATOR_DETAIL], { queryParams: { id: row.id } });
  }

  //service
  getAllOperator() {
    this._OperatorService.getAllOperator().then(response => {
      if (response != null) {
        this.data = response.content.filter(item => {
          return item.id != this.userID;
        });
        this.data.forEach(item => {
          item.phoneNumber = this.getPhoneNumber(item.phoneNumber);
          item.lastLogin = item.lastLogin != undefined ? new Date(item.lastLogin) : '';
          item.createDate = item.createDate != undefined ? new Date(item.createDate) : '';
        });
        this.filter();
      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
      this._UtilitiesService.hideLoading();
    })
  }
  deleteOperator(id) {
    this._OperatorService.deleteOperator(id).then(response => {
      this.getAllOperator();
      this._UtilitiesService.showSuccess(LocalMessages.messages['9']);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
    });
  }
}