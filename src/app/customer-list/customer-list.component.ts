import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { PhoneNumberComponent } from '../phone-number/phone-number.component';

import { Observable } from 'rxjs/Observable';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';
import { CustomerService } from '../api-service/customer.service';
import { StringService } from '../services/string.service';
import { PAGES, MESSAGE, VARIABLES } from '../constant';
import * as _ from 'lodash';
import { LocalMessages } from '../message';
import * as moment from 'moment';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.scss']
})
export class CustomerListComponent implements OnInit {
  noResultMessage = LocalMessages.messages["22"];
  constructor
    (
    private customerService: CustomerService,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _PhoneNumberComponent: PhoneNumberComponent,
    private _StringService: StringService,
    private router: Router
    ) { }

  ngOnInit() {
    this._UtilitiesService.showLoading();

    this.getCustomerList().then(() => {
      this.filter();
      this._UtilitiesService.hideLoading();
    });

    // input search event
    Observable.fromEvent(this.filterEle.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        this.search(this.filterEle.nativeElement.value);
      });
  }

  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'Customer ID', sortable: true, width: 100 },
    { name: 'customerName', label: 'Customer Name', filter: true, sortable: true },
    { name: 'countryName', label: 'Country', sortable: true },
    { name: 'provinceName', label: 'Province', sortable: true },
    { name: 'address', label: 'Address', sortable: true },
    { name: 'email', label: 'Email', sortable: true },
    { name: 'phoneNumber', label: 'Phone Number', sortable: true },
    { name: 'action', label: 'Delete' },
  ];

  getCustomerList() {
    return this.customerService.getCustomerList().then(result => {
      if (result) {
        this.data = result.content;
        this.data.forEach(item => {
          item.phoneNumber = this._PhoneNumberComponent.getPhoneNumber(item.phoneNumber);
          if (!item.countryName) {
            item.countryName = '';
          }
          if (!item.provinceName) {
            item.provinceName = '';
          }
          if (!item.address) {
            item.address = '';
          }
        });
      } else {
        this.data = [];
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
      }
    });
  }

  deleteCustomer(customerID) {
    this._UtilitiesService.showLoading();
    return this.customerService.deleteCustomer(customerID).then(result => {
      this._UtilitiesService.showSuccess(LocalMessages.messages['9']);
      this.getCustomerList().then(() => {
        this.filter();
      });

      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
    });
  }

  data: any[] = [];
  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'id';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  @ViewChild('filter') filterEle: ElementRef;
  showConfirmDialog(event, row) {
    event.preventDefault();
    event.stopPropagation();
    this._UtilitiesService.showConfirmDialog(this._StringService.getConfirmDelete(row.customerName), (result) => {
      if (result) {
        this.deleteCustomer(row.id);
      }
    });
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
  configDataSearch(data) {
    let newData = [];
    _.forEach(this.data, (item) => {
      newData.push({
        id: item.id,
        customerName: item.customerName,
        address: item.address,
        provinceName: item.provinceName,
        countryName: item.countryName,
        phoneNumber: item.phoneNumber,
        email: item.email
      })
    });
    return newData;
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    let newData: any[] = this.data;
    let excludedColumns: string[] = this.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
          (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });
    newData = this._dataTableService.filterData(this.configDataSearch(newData), this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  onRowClick(row) {
    this.router.navigate(['/customer-management/customer-list/customer-detail'], { queryParams: { id: row.id } });
  }
}