import { Component, OnInit, ViewChild, ElementRef, Inject, HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IPageChangeEvent } from '@covalent/core';
import * as moment from 'moment';
import { PAGES } from 'app/constant';
import { StringService } from '../services/string.service';
import { ValidateService } from 'app/services/validate.service';
import {
  TdDataTableService,
  TdDataTableSortingOrder,
  ITdDataTableSortChangeEvent,
  ITdDataTableColumn
} from '@covalent/core';

import { Observable } from 'rxjs/Observable';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { UtilitiesService } from 'app/services/utilities.service';
import { ChillerPlantService } from '../api-service/chiller-plant.service'
import * as _ from 'lodash';
import { MESSAGE, VARIABLES } from '../constant';
import { LocalMessages } from '../message';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  selector: 'app-chiller-plants',
  templateUrl: './chiller-plants.component.html',
  styleUrls: ['./chiller-plants.component.scss']
})
export class ChillerPlantsComponent implements OnInit {
  noResultMessage = LocalMessages.messages['22'];
  // column name
  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'Chiller Plant ID', sortable: true },
    { name: 'buildingName', label: 'Building Name', sortable: true },
    { name: 'chillerPlantName', label: 'Chiller Plant Name', sortable: true },
    { name: 'numOfChillers', label: 'Number of Chillers', sortable: true },
    { name: 'numOfCCTs', label: 'Number of CTTs', sortable: true },
    { name: 'numOfCTs', label: 'Number of CTs', sortable: true },
    { name: 'completeStatus', label: 'Status', sortable: true },
    // { name: 'createdDate', label: 'Created Time', sortable: true },
    { name: 'modifiedDate', label: 'Modified Time', sortable: true },
    { name: 'action', label: 'Delete', sortable: false }
  ];
  // data table
  data: any[] = []; y

  filteredData = this.data;
  filteredTotal = this.data.length;

  searchTerm = '';
  fromRow = 1;
  currentPage = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize = this.pageSizes[0];
  sortBy = 'id';
  selectedRows = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  // createData
  createData: any = {
    nameCP: '',
    nameBuilding: '',
    numOfChillers: '',
    numOfCCTs: '',
  }
  // id of chiller Plant secleted
  selectedID: number;
  isDetail = false;
  customerId = null;
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
    private _StringService: StringService,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    public dialog: MatDialog,
    private router: Router,
    private chillerPlantService: ChillerPlantService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.customerId = Number(this.activatedRoute.snapshot.queryParams['id']);
    this.reload();
  }
  reload() {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this.filter();
      this._UtilitiesService.stopLoading();
    }).catch((err) => {
      this._UtilitiesService.stopLoading();
    });
  }

  reloadData() {
    const request = {
      userid: this.customerId
    };
    return this.chillerPlantService.getChillerPlantList(request).then(result => {
      if (result) {
        this.data = result.content;
        this.handleDate();
      } else {
        this.data = [];
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  handleDate() {
    _.forEach(this.data, (item) => {
      item.modifiedDate = new Date(item.modifiedDate);
      item.completeStatus = item.completeStatus === true ? 'Completed' : 'Incompleted';
    })
  }

  // toggleDefaultFullscreenDemo(): void {
  //   this._UtilitiesService.showLoading();
  //   setTimeout(() => {
  //     this._UtilitiesService.hideLoading();
  //   }, 500);
  // }

  // show massage
  showError(message) {
    this._UtilitiesService.showError(message);
  }
  showSuccess(message) {
    this._UtilitiesService.showSuccess(message);
  }
  // sort data Table
  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }
  // search data table
  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }
  configDataSearch(data) {
    let newData = [];
    _.forEach(this.data, (item) => {
      newData.push({
        id: item.id,
        chillerPlantName: item.chillerPlantName,
        buildingName: item.buildingName,
        numOfChillers: item.numOfChillers,
        numOfCCTs: item.numOfCCTs,
        numOfCTs: item.numOfCTs,
        // createdDate: item.createdDate,
        modifiedDate: item.modifiedDate,
        completeStatus: item.completeStatus
      })
    });
    return newData;
  }
  // page loading
  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  // reload data
  filter(): void {
    let newData: any[] = this.data;
    const excludedColumns: string[] = this.columns
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
  // show confirm
  showDeleteConfirm(event, item) {
    event.preventDefault();
    event.stopPropagation();
    this._UtilitiesService.showConfirmDialog(this._StringService.getConfirmDelete(item.chillerPlantName), (result) => {
      if (result) {
        this.deleteAction(item);
      }
    });
  }
  // action delete
  deleteAction(item) {
    const request = {
      id: item.id
    };
    return this.chillerPlantService.deleteChillerPlant(request).then(result => {
      if (result) {
        this.reload();
        this.showSuccess(LocalMessages.messages['9']);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
    });
  }

  // show add dialog
  showAddDialog(type) {
    let isImportFile: boolean;
    if (type === 'import') {
      isImportFile = true;
    } else {
      isImportFile = false;
    }
    const dialogRef = this.dialog.open(AddChillerPlantDialog, {
      width: '30%',
      disableClose: true,
      data: {
        isImport: isImportFile,
        countryId: -1,
        provinceId: -1,
        chillerPlantName: '',
        buildingName: '',
        numOfCCTs: null,
        numOfChillers: null,
        customerId: this.customerId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reloadData().then(() => {
          this.showDetail(result);
        });
      } else {
        this.reloadData();
      }
    });
  }

  // show detail of chiller plant selected
  showDetail(itemID) {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      if (_.findIndex(this.data, ['id', itemID]) >= 0) {
        this.selectedID = itemID;
        this.isDetail = true;
      } else {
        this.reload();
        this._UtilitiesService.showError('Chiller Plant does not exist ');
      }
    });
  }
  // output cancel
  updateIsDetail(e) {
    this.reload();
    this.isDetail = e;
  }
}

// component dialog add
@Component({
  selector: 'add-chiller-plant-dialog',
  templateUrl: 'add-chiller-plant-dialog.html',
  styleUrls: ['./chiller-plants.component.scss']
})
export class AddChillerPlantDialog implements OnInit {
  listFiles = [];
  files: any;
  disabled = false;
  dataCountry = [];
  dataProvince = [];
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;


  constructor(
    public dialogRef: MatDialogRef<AddChillerPlantDialog>,
    private chillerPlantService: ChillerPlantService,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {

  }
  toggleDisabled(): void {
    this.disabled = !this.disabled;
  }
  // get data country
  getCountry() {
    const request = {};
    return this.chillerPlantService.getCountry(request).then(result => {
      if (result) {
        this.dataCountry = result.content;
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
      }
    });
  }
  // get data province
  changeCountry(itemId) {
    this.data.provinceId = -1;
    if (itemId > 0) {
      this.dataProvince = _.find(this.dataCountry, (o) => {
        return o.id == itemId;
      }).provinces;
      // init data
    }
    else {
      this.dataProvince = [];
    }
  }


  createAction() {
    if (!this.data.isImport) {
      const request = this.prepareCreateDataWithPlantModel();
      return this.chillerPlantService.postChillerPlant(request).then(result => {
        if (result) {
          this.dialogRef.close(result.id);
          this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages['18'], '%s', 'Chiller Plant'));
        }
      }, error => {
        if (error) {
          this._UtilitiesService.showErrorAPI(error, null);
        }
      });
    } else {
      const request = this.prepareCreateDataWithImport();
      return this.chillerPlantService.postChillerPlantImport(request).then(result => {
        if (result) {
          this.dialogRef.close(result.id);
          this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages['18'], '%s', 'Chiller Plant'));
        }
      }, error => {
        if (error) {
          this._UtilitiesService.showErrorAPI(error, null);
        }
      });
    }
  }

  prepareCreateDataWithPlantModel() {
    const data = {
      chillerPlantName: this.data.chillerPlantName,
      buildingName: this.data.buildingName,
      provinceId: this.data.provinceId,
      countryId: this.data.countryId,
      userId: this.data.customerId,
      numOfChillers: this.data.numOfChillers,
      numOfCCTs: this.data.numOfCCTs
    }
    if (data.countryId == -1) {
      data.countryId = null;
    }
    if (data.provinceId == -1) {
      data.provinceId = null;
    }
    return data;
  }
  prepareCreateDataWithImport() {
    let formData = new FormData();
    if (this.listFiles.length !== 0) {
      this.listFiles.forEach((item) => {
        formData.append('files', item, item.name);
      });
    }

    // formData.append('files', this.files);
    if (this.data.countryId == -1) {
      formData.append('countryId', '');
    }
    if (this.data.provinceId == -1) {
      formData.append('provinceId', '');
    }

    formData.append('chillerPlantName', this.data.chillerPlantName);
    formData.append('buildingName', this.data.buildingName);
    formData.append('userId', this.data.customerId);

    return formData;
  }

  createChillerPlant() {

    let errorInput = [];
    errorInput = this.inputValidation(this.data);
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this._UtilitiesService.showLoading();

      this.createAction().then(() => {
        this._UtilitiesService.stopLoading();
      });
    }
  }

  inputValidation(data) {

    let errorInput = [];
    data.chillerPlantName = _.trim(data.chillerPlantName);
    data.buildingName = _.trim(data.buildingName);
    if (!data.chillerPlantName) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(data.chillerPlantName, true)) {
      errorInput.push(LocalMessages.messages['1']);
    }
    if (!data.buildingName) {
      errorInput.push(LocalMessages.messages['15']);
    } else if (!this._ValidateService.checkValidInputName(data.buildingName, true)) {
      errorInput.push(LocalMessages.messages['1']);
    }
    // validate create chiller plant  by inport file
    if (this.data.isImport) {
      if (this.listFiles.length == 0) {
        errorInput.push(LocalMessages.messages['15']);
      }
    } else {
      // validate create chiller plant  by plant model
      if (data.numOfChillers === '') {
        errorInput.push(LocalMessages.messages['15']);
      } else {
        data.numOfChillers = this.checkInvalid(data.numOfChillers, errorInput, LocalMessages.messages['1']);
        if (data.numOfChillers > 10) {
          errorInput.push(LocalMessages.messages['30']);
        } else if (data.numOfChillers < 0) {
          errorInput.push(LocalMessages.messages['1']);
        }
      }
      if (data.numOfCCTs === '') {
        errorInput.push(LocalMessages.messages['15']);
      } else {
        data.numOfCCTs = this.checkInvalid(data.numOfCCTs, errorInput, LocalMessages.messages['1']);
        if (data.numOfCCTs > 10) {
          errorInput.push(LocalMessages.messages['105']);
        } else if (data.numOfCCTs < 0) {
          errorInput.push(LocalMessages.messages['1']);
        }
      }
    }
    return errorInput;
  }
  showError(message) {
    this._UtilitiesService.showError(message);
  }
  // disable buttom save
  checkMissingField() {
    if (this.data.isImport) {
      if (!this.data.chillerPlantName || !this.data.buildingName || (this.listFiles.length == 0)) {
        return true;
      } else {
        return false;
      }
    } else {
      if (!this.data.chillerPlantName || !this.data.buildingName || !this.data.numOfCCTs || !this.data.numOfChillers) {
        return true;
      } else {
        return false;
      }
    }
  }
  floatInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57
  }
  checkInvalid(item, errorList, message) {
    if (_.isNaN(Number(item)) == true) {
      errorList.push(message);
      return item;
    } else {
      return Number(item);
    }
  }
  showOption(event) {
    this._UtilitiesService.showLoading();
    this.getCountry().then(() => {
      this.changeCountry(this.data.countryId);
      // init data
      this.data.countryId = -1;
      this.data.provinceId = -1;
      this._UtilitiesService.stopLoading();
    }).catch(() => {
      this._UtilitiesService.stopLoading();
    });
  }
  // event when selected file
  selectEvent(files): void {
    let errorList = [];
    if (!files.length) {
      if (this.checkFileType(files)) {
        errorList.push(LocalMessages.messages['107']);
      } else if (this.checkFileSize(files)) {
        errorList.push(LocalMessages.messages['108']);
      } else if (this.checkFileExist(files)) {
        errorList.push(files.name + ' existed');
      } else if (this.listFiles.length >= 10) {
        errorList.push('maximum files is 10');
      } else {
        this.listFiles.push(files);
      }
    } else {
      _.forEach(files, (file) => {
        if (this.checkFileType(file)) {
          errorList.push(LocalMessages.messages['107']);
        } else if (this.checkFileSize(file)) {
          errorList.push(LocalMessages.messages['108']);
        } else if (this.checkFileExist(file)) {
          errorList.push(file['name'] + ' existed');
        } else if (this.listFiles.length >= 10) {
          errorList.push('maximum files is 10');
        } else {
          this.listFiles.push(file);
        }
      });
    }
    this.files = files;
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    }
  }
  // check file .csv
  checkFileType(files) {
    if (!this._ValidateService.validatePerformanceFile(files.name)) {
      return true; // is not file .csv
    }
  }
  // check size file 5mb
  checkFileSize(files) {
    if (!this._ValidateService.validatePerformanceFileSize(files.size)) {
      return true // file > 5mb
    }
  }

  // check file existed on list
  checkFileExist(file) {
    let exist = false;
    this.listFiles.forEach((item) => {
      if (item.name == file.name) {
        exist = true;
      }
    });
    return exist;
  }
  // remove
  removeFile(file) {
    let foundIndex = -1;
    this.listFiles.forEach((item, index) => {
      if (item.name == file.name) {
        foundIndex = index;
        return true;
      }
    });
    this.listFiles.splice(foundIndex, 1);
  }
}
