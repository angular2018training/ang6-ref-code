import { ActivatedRoute, Params } from '@angular/router';
import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { LoginService } from 'app/services/login.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { ChillerPlantService } from 'app/api-service/chiller-plant.service';
import * as _ from 'lodash';
import * as moment from "moment";
import { UserReportService } from 'app/api-service/user-report.service';
import * as FileSaver from 'file-saver';
import { VARIABLES } from "app/constant";
import { LocalMessages } from 'app/message';

@Component({
  selector: 'energy-report',
  templateUrl: './energy-report.component.html',
  styleUrls: ['./energy-report.component.scss']
})

export class EnergyReportComponent implements OnInit {

  newData: any[] = [];
  columns: ITdDataTableColumn[] = [
    { name: 'timestamp', label: 'Report Creation Date', filter: true, sortable: true },
    { name: 'chillerPlantName', label: 'Chiller Plant Name', sortable: true },
    { name: 'buildingName', label: 'Building Name', sortable: true },
    { name: 'reportName', label: 'Report Name', hidden: false, sortable: true },
    { name: 'revisedVersion', label: 'Revised Version', hidden: false, sortable: true },
  ];

  data: any[] = [
  ];


  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  noResultFound: string = LocalMessages.messages['22'];

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy = 'timestamp';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  currentUser;
  chillerPlants = [];
  chillerPlantId = -1;
  chillerPlantName = null;
  fromDate = new Date();
  toDate = new Date();

  private filterEle: ElementRef;
  @ViewChild('filter') set content(content: ElementRef) {
    if (content !== undefined) {
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
    private router: Router,
    private _dataTableService: TdDataTableService,
    private _LoginService: LoginService,
    private _UtilitiesService: UtilitiesService,
    private _ChillerPlantService: ChillerPlantService,
    private _UserReportService: UserReportService
  ) {

  }

  ngOnInit() {
    this.currentUser = this._LoginService.getUserInfo();
    this.loadData();
  }

  loadData() {
    this._UtilitiesService.showLoading();
    this.getChillerPlant().then(() => {
      this._UtilitiesService.stopLoading();
    }).catch(() => {
      this._UtilitiesService.stopLoading();
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
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  getChillerPlant() {
    const request = {
      userid: this.currentUser.userID
    };
    return this._ChillerPlantService.getChillerPlantList(request).then(result => {
      if (result) {
        this.chillerPlants = result.content;
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
      }
    });
  }

  onSearchClick() {
    const errorInput = this.checkValidationSeach();
    let chiller = _.find(this.chillerPlants, { id: this.chillerPlantId });

    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      let chillerPlantId = null;
      let chillerPlantName = null;
      if (chiller) {
        chillerPlantId = chiller.id;
        chillerPlantName = chiller.chillerPlantName;
      } else {
        chillerPlantId = null;
        chillerPlantName = null;
      }

      let requestBody = {
        chillerPlantId: chillerPlantId,
        chillerPlantName: chillerPlantName,
        fromDate: this._UtilitiesService.formatTime(this.fromDate),
        toDate: this._UtilitiesService.formatTime(this.toDate),
        userId: this.currentUser.userID
      }
      this._UtilitiesService.showLoading();
      this.searchAction(requestBody).then(() => {
        this._UtilitiesService.stopLoading();
      });
    }
  }

  searchAction(requestBody) {
    return this._UserReportService.searchEnergyReport(requestBody).then(res => {
      if (res) {
        this.data = res.content;
        this.data.forEach((element) => {
          element.timestamp = new Date(element.timestamp);
        });
      }
      this.filter();
    }).catch(error => {
      this.filter();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }


  downloadFile(filename) {
    let request = {
      "userId": this.currentUser.userID,
      "reportName": filename
    }

    return this._UserReportService.downloadEnergyReportHistory(request).then(result => {
      if (result) {
        let blob = new Blob([result], {
          type: 'application/pdf'
        });
        FileSaver.saveAs(blob, filename);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['64']);
    }).catch(() => {
      this._UtilitiesService.showError(LocalMessages.messages['64']);
    });;
  }

  checkValidationSeach() {
    let errorList = [];
    const fromDate = this.fromDate.getTime();
    const toDate = this.toDate.getTime();
    if (fromDate > toDate) {
      errorList.push(LocalMessages.messages['51']);
    }
    return errorList;
  }

}