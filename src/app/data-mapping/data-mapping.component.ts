import * as _ from 'lodash';
import { Component, Inject, Input, OnInit, ViewChild, ElementRef, NgZone, HostListener, EventEmitter, Output } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn, IPageChangeEvent } from '@covalent/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromEvent';
import { MapsAPILoader } from '@agm/core';
import { } from '@types/googlemaps';
import { PAGES, VARIABLES, MESSAGE } from '../constant';
import { UtilitiesService } from '../services/utilities.service';
import { ValidateCustomService, ValidateService } from '../services/validate.service';
import { StringService } from '../services/string.service';
import { ChillerPlantService } from '../api-service/chiller-plant.service';
import { DataMappingService } from '../api-service/data-mapping.service';
import { DataConnectionService } from '../api-service/data-connection.service';
import { SharedService } from "../services/shared-service.service";
import {LocalMessages} from '../message';

declare var google;

@Component({
  selector: 'add-mapping-ct-dialog',
  templateUrl: 'add-mapping-ct-dialog.html',
  styleUrls: ['./data-mapping.component.scss']
})
export class DataMappingAddMCTDialog implements OnInit {
  model;
  tagNames = [];
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

  ngOnInit(): void {
    this.model = this.data["model"];
    this.tagNames = this.data["tagNames"];
  }

  validateCTName() {
    if (this.validateService.checkValidInputName(this.model.equipmentName, true)) {
      this.dialogRef.close(this.model);
    } else {
      this._UtilitiesService.showWarning(MESSAGE.ERROR.INVALID_EQUIPMENT_NAME);
    }
  }

  constructor(
    private _UtilitiesService: UtilitiesService,
    public dialogRef: MatDialogRef<DataMappingAddMCTDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private validateService: ValidateService
  ) { }
}

// component dialog add
@Component({
  selector: 'import-dialog',
  templateUrl: 'import-dialog.html',
  styleUrls: ['./data-mapping.component.scss']
})
export class DataMappingImportDialog implements OnInit {
  type;
  disabled;
  ngOnInit(): void {
    this.type = this.data["type"];
  }

  file = {
    fileName: 'No file selected yet.',
    fileSize: 'No file selected yet.',
    fileContent: ''
  }

  selectEvent(file: File): void {
    this.file.fileName = file.name;
    this.file.fileSize = (file.size / 1024).toFixed(2) + ' KB';

    let self = this;
    var reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = function () {
      self.file.fileContent = reader.result;
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
  }

  uploadEvent(file: File): void {
  }

  cancelEvent(): void {
    this.file.fileContent = '';
    this.file.fileName = 'No file selected yet.';
    this.file.fileSize = 'No file selected yet.';
  }

  constructor(
    public dialogRef: MatDialogRef<DataMappingImportDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

}

@Component({
  selector: 'data-mapping',
  templateUrl: './data-mapping.component.html',
  styleUrls: ['./data-mapping.component.scss']
})
export class DataMappingComponent implements OnInit {
  @Output('isChanged') isChanged = new EventEmitter<boolean>();

  emitChangeValue(value) {
    this.isChanged.emit(value);
  }
  @Input('chillerPlantID') chillerPlantID: number;

  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  isDisabledCollect: boolean = true;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

  lat: number = 51.6;
  lng: number = 7.8;

  mappingType = 1;
  listMappingType = [{ name: 'Data Collector', value: 1 }, { name: 'Weather Data', value: 2 }];
  outdoorTemperatures = [{ name: 'Temperature', value: 1 }];
  outdoorHumidities = [{ name: 'Humidity', value: 1 }];
  weatherServices = [{ name: 'Weather Service 1', value: 1 }, { name: 'Weather Service 2', value: 2 }, { name: 'Weather Service 3', value: 3 }];
  locations = [{ name: 'Tokyo, Japan', value: 1 }, { name: 'Seoul, Korea', value: 2 }, { name: 'New York, USA', value: 3 }];
  konceptsTagNames = [];

  weatherModel = {
    usingType: 1,
    temperature: 1,
    humidity: 1,
    weatherService: 1,
    location: 1
  }
  tagNamePrefix = {
    providerId: null,
    providerName: 'Green Koncepts tag name prefix',
    prefix: ' tag name prefix',
  }

  //table
  columns: ITdDataTableColumn[] = [
    { name: 'categoryName', label: 'Category', filter: true, sortable: false },
    { name: 'typeName', label: 'Type', sortable: false },
    { name: 'simulatorIndex', label: 'Simulator Index', sortable: false },
    { name: 'equipmentName', label: 'Customer\'s equipment name', sortable: false },
    // { name: 'tagNamePrefix', label: this.tagNamePrefix.providerName, sortable: false },
  ];

  isDisableSaveMappingData() {
    if (_.isEqual(this.sourceData, this.data)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }

  isEqual() {
    if (_.isEqual(this.sourceData, this.data)) {
      return true;
    }
    return false;
  }
  sourceData: any[] = [];
  data: any[] = [];
  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = 1000;
  sortBy: string = 'categoryName';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  sourceDataMapping;
  dataMapping = {
    id: null,
    chillerPlantId: this.chillerPlantID,
    status: 0,
    tempCustomerTagName: '',
    tempPartnerTagName: '',
    humidityCustomerTagName: '',
    humidityPartnerTagName: '',
  }

  private dummyCatetory = ['Chiller', 'Chiller', 'Chiller', 'Chiller', 'Pump', 'Pump', 'Pump', 'Pump', 'Pump', 'Pump', 'Pump', 'Pump', 'Pump', 'Pump', 'Cooling Tower', 'Cooling Tower', 'Cooling Tower', 'Cooling Tower', 'Cooling Tower'];
  private dummyType = ['-', '-', '-', '-', 'CHWP', 'CHWP', 'CHWP', 'CHWP', 'CDWP', 'CDWP', 'CDWP', 'CDWP', 'Backup-CHWP', 'Backup-CDWP', 'CCT', 'CCT', 'CT', 'CT', 'Backup-CT'];
  private dummySimulatorIndex = [1, 2, 3, 4, 1, 3, 5, 7, 2, 4, 6, 8, 9, 10, 1, 2, 1, 2, 3];
  private dummyEquipmentName = ['Chiller 1', 'Chiller 2', 'Chiller 3', 'Chiller 4', 'CHWP-1', 'CHWP-2', 'CHWP-3', 'CHWP-4', 'CWP-1', 'CWP-2', 'CWP-3', 'CWP-4', 'CHWP-5', 'CWP-5', 'CT-Header-1', 'CT-Header-2', 'CT5-1', 'CT6-1', 'CT7-1'];
  private dummyTagName = ['CH-1', 'CH-2', 'CH-3', 'CH-4', 'CHWP-1 ', 'CHWP-2', 'CHWP-3', 'CHWP-4', 'CDWP-1', 'CDWP-2', 'CDWP-3', 'CDWP-4', 'CHWP-5', 'CDWP-5', 'HDR-1', 'HDR-2', 'CT-1', 'CT-3', 'CT-5'];
  private listTagNamePrefix = ['CT-1', 'CT-2', 'CT-3', 'CT-4', 'CT-5', 'CT-6', 'CT-7', 'CT-8', 'CT-9'];

  listDeletedBms = [];

  isDisabled = true;
  toolBox = {
    isShow: false,
    mousePos: {
      left: null,
      top: null,
    },
    mapPos: {
      lat: null,
      lng: null,
    }
  }
  // isShowToolbox: boolean = false;
  mousePos = {
    left: null,
    top: null,
  }

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _ValidateCustomService: ValidateCustomService,
    private _ChillerPlantService: ChillerPlantService,
    private _DataMappingService: DataMappingService,
    private _StringService: StringService,
    private dataConnectionService: DataConnectionService,
    private sharedService: SharedService,
    private validateService: ValidateService,
  ) { 
  }

  ngOnInit() {
    // console.log(this.chillerPlantID);
    this._UtilitiesService.showLoading();
    this.getPartnerDetail();

    Observable.fromEvent(document.body, 'mousemove').subscribe(e => {
      // console.log(e.pageX, e.pageY);
      // console.log(e);
      this.mousePos.left = e['clientX'];
      this.mousePos.top = e['clientY'];
    });
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }

  ngDoCheck() {
    // this.is_.isEqual(this.sourceData,this.data);
    // console.log('docheck');
  }

  // typeName = 'CT' & have ctId  => Bms object
  // typeName = 'CT' & don't have ctId => CT object
  getDataMapping() {
    // this._UtilitiesService.showLoading();
    this.data = [];
    this._ChillerPlantService.getDataMapping({ id: this.chillerPlantID }).then((res) => {
      if (res && res.content) {
        _.forEach(res.content, (item: any) => {
          let tmp = {
            'id': item.id,
            'tableName': item.tableName,
            'categoryName': item.categoryName,
            'typeName': item.typeName,
            'simulatorIndex': item.simulatorIndex,
            'equipmentName': item.equipmentName,
            // 'action': item.action,
            // 'tagNamePrefix': item.tagNamePrefix
          };
          if (item.typeName === 'CT' || item.typeName === 'Backup-CT') {
            if (_.isUndefined(item.ctId)) {
              tmp['bmsData'] = [{
                'equipmentName': item.equipmentName || '',
                'tagNamePrefix': '',
                'typeName': item.typeName,
                'action': -1
              }];
            } else {
              let ctIndex = _.findIndex(this.data, { id: item.ctId, typeName: item.typeName }),
                bmsModel = {
                  'equipmentName': item.equipmentName || '',
                  'tagNamePrefix': item.tagNamePrefix || '',
                  'tableName': item.tableName,
                  'action': item.action,
                  'id': item.id
                };

              if (ctIndex === -1) {
                tmp['id'] = item.ctId;
                tmp['bmsData'] = [bmsModel];
              } else {
                this.data[ctIndex]['bmsData'].push(bmsModel);
                return;
              }
            }
          } else {
            tmp['action'] = item.action;
            tmp['equipmentName'] = item.equipmentName || '';
            tmp['tagNamePrefix'] = item.tagNamePrefix || '';
          }
          this.data.push(tmp);
        });
        this.sourceData = _.cloneDeep(this.data);
        this.filter();
      }
      // this._UtilitiesService.stopLoading();
      this._UtilitiesService.hideLoading();
    }).catch((err) => {
      this._UtilitiesService.hideLoading();
    });
  }

  buildDummyData() {
    // create dummy data
    for (let i = 0; i < this.dummyCatetory.length; i++) {
      this.data.push({
        'category': this.dummyCatetory[i],
        'type': this.dummyType[i],
        'simulatorIndex': this.dummySimulatorIndex[i],
        'equipmentName': [this.dummyEquipmentName[i]],
        'tagName': [this.dummyTagName[i]],
      });
    }
    // this.filter();
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
    // newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    // newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    // newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  collectTagname() {
    let equipmentList = [];
    this.filteredData.forEach(element => {
      if (element.typeName !== 'CT') {
        equipmentList.push(element.equipmentName)
      }
      if (element.bmsData && element.bmsData.length > 0) {
        let bmsData = element.bmsData;
        bmsData.forEach(elementBMSChild => {
          equipmentList.push(element.equipmentName);
        });
      }
    });

    return this._DataMappingService.collectTagName(this.chillerPlantID, equipmentList).then(result => {
      if (result) {
        this.filteredData.forEach(element => {
          if (element.typeName !== 'CT') {
            element.tagNamePrefix = element.equipmentName;
          }
          if (element.bmsData && element.bmsData.length > 0) {
            let bmsData = element.bmsData;
            bmsData.forEach(elementBMSChild => {
              result.forEach(resultChild => {
                if (resultChild.equipmentName == elementBMSChild.equipmentName) {
                  elementBMSChild.tagNamePrefix = resultChild.tagName
                }
              });
            });
          }
        });
    
        this._UtilitiesService.showSuccess(LocalMessages.messages['130']);
      } else {
        this.data = [];
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  changeMappingType(e) {
    // console.log(e);
    if (e.value == 2) {
      if (this.dataMapping.id == null) {
        this._UtilitiesService.showLoading();
        this.getWeatherData();
        this.toolBox.isShow = false;
      }
    }
  }

  clearHandler() {
    let msg = 'Do you want to clear data table?';
    this._UtilitiesService.showConfirmDialog(msg, (result) => {
      if (result) {
        // handle here
        this.data = [];
        this.filter();
      }
    });
  }

  importHandler() {
    let type = _.find(this.listMappingType, { value: this.mappingType });
    let dialogRef = this.dialog.open(DataMappingImportDialog, {
      width: '400px',
      disableClose: true,
      data: { type: type.name }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // handle here
        this.data = [];
        this.buildDummyData();
      }
    });
  }

  exportHandler() {
    let csvContent = '',
      columnDelimiter = ',',
      lineDelimiter = '\n';

    csvContent += 'Category,Type,Simulator Index,Customer\'s equiment name,Green Koncepts tag name prefix' + lineDelimiter;
    this.data.forEach((row) => {
      csvContent += _.values(row).join(columnDelimiter) + lineDelimiter;
    });

    this.downloadCSV('export_data.csv', csvContent);
  }

  /**
       * export csv file handler
       * @param {string} filename [[Description]]
       * @param {Array} data     [[Description]]
       */
  downloadCSV(filename, data) {
    if (!data)
      return;

    filename = filename || 'filename.csv';

    let blob = new Blob([data], {
      type: "text/csv;charset=utf-8;"
    });

    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename)
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {

        // feature detection, Browsers that support HTML5 download attribute
        let url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        // link.style = "visibility:hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  showMCTDialog(item) {
    // get list non-added tag name
    let existTagNames = [],
      existEquipmentNames = [];
    this.data.forEach((row) => {
      if (existEquipmentNames.indexOf(row.equipmentName) == -1) {
        existEquipmentNames.push(row.equipmentName);
      }
      if (row.bmsData) {
        row.bmsData.forEach((element) => {
          if (existEquipmentNames.indexOf(element.equipmentName) == -1) {
            existEquipmentNames.push(element.equipmentName);
          }
        });
      }
    });

    let tagNamePrefixes = _.difference(this.listTagNamePrefix, existTagNames);

    // if have any non-added tag name => show dialog
    if (tagNamePrefixes.length > 0) {
      let dialogRef = this.dialog.open(DataMappingAddMCTDialog, {
        width: '400px',
        disableClose: true,
        data: {
          model: {
            simulatorIndex: item.simulatorIndex,
            equipmentName: '',
            tagNamePrefix: tagNamePrefixes[0]
          },
          tagNames: tagNamePrefixes,
          existEquipmentNames: existEquipmentNames
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (existEquipmentNames.indexOf(result.equipmentName) === -1) {
            item.bmsData.push({
              ctId: item.id,
              equipmentName: result.equipmentName,
              tableName: "bms_cooling_tower",
              action: 0
            });
            // this._UtilitiesService.showSuccess('Add successfully.');
          } else {
            this._UtilitiesService.showError('Customer\'s equiment name is existent: ' + result.equipmentName);
          }
        }
      });
    } else {
      this._UtilitiesService.showInfo('There is no tag name to add.');
    }
  }

  deleteMCT(item, index) {
    if (item) {
      if (!_.isUndefined(item.bmsData[index].id)) {
        // field equipmentname of ct
        item.bmsData[index].action = 2;
        this.listDeletedBms.push(_.cloneDeep(item.bmsData[index]));
      }
      item.bmsData.splice(index, 1);
      if (index === 0 && item.bmsData[0]) {
        item.bmsData[0].action = 3;
        item.bmsData[0].ctId = item.id;
      }
    }
    // this._UtilitiesService.showConfirmDialog('Do you want to delete this mapping cooling tower ?', (result) => {
    //   if (result && item) {
    //     if (!_.isUndefined(item.bmsData[index].id)) {
    //       item.bmsData[index].action = 2;
    //       this.listDeletedBms.push(_.cloneDeep(item.bmsData[index]));
    //     }
    //     item.bmsData.splice(index, 1);
    //     this._UtilitiesService.showSuccess('Delete successfully.');
    //   }
    // });
  }

  conditionCheck(tmpText) {
    let validText = true;
    if (this.validateService.checkValidInputName(tmpText, true)) {
      let existEquipmentNames = [];
      this.data.forEach((row) => {
        if (existEquipmentNames.indexOf(row.equipmentName) == -1) {
          existEquipmentNames.push(row.equipmentName);
        }
        if (row.bmsData) {
          row.bmsData.forEach((element) => {
            if (existEquipmentNames.indexOf(element.equipmentName) == -1) {
              existEquipmentNames.push(element.equipmentName);
            }
          });
        }
      });

      if (existEquipmentNames.indexOf(tmpText) != -1) {
        this._UtilitiesService.showError('Customer\'s equiment name is existent: ' + tmpText);
        validText = false;
      }
    } else {
      this._UtilitiesService.showWarning(MESSAGE.ERROR.INVALID_EQUIPMENT_NAME);
      validText = false;
    }
    this.sharedService.setData("validText", validText)
  }

  editEquipmentName(newValue, item) {
    item.equipmentName = newValue;
    item.action = 1;
    if (!_.isEqual(item.equipmentName, newValue)) {
      item.action = 1;
    }
  }

  saveDataMapping() {
    setTimeout(() => {
      let arr = [];
      this.filteredData.forEach((item) => {
        if (item.action !== -1) {
          if (item.typeName === 'CT' || item.typeName === 'Backup-CT') {
            item.bmsData.forEach((bmsModel) => {
              if (bmsModel.action !== -1) {
                if (bmsModel.typeName === 'CT' || bmsModel.typeName === 'Backup-CT') {
                  item.equipmentName = bmsModel.equipmentName;
                  item.action = 1;
                  arr.push(_.cloneDeep(item));
                } else {
                  arr.push(_.cloneDeep(bmsModel));
                }
              }
            });
          } else {
            arr.push(_.cloneDeep(item));
          }
        }
      });

      arr = arr.concat(this.listDeletedBms);

      if (arr.length > 0) {
        this._UtilitiesService.showLoading();
        this._ChillerPlantService.saveDataMapping(arr).then((res) => {
          this._UtilitiesService.showSuccess(LocalMessages.messages['13']);
          this.listDeletedBms = [];
          this.getDataMapping();
          // this._UtilitiesService.stopLoading();
        }).catch((err) => {
          // this._UtilitiesService.stopLoading();
          this._UtilitiesService.hideLoading();
        });
      } else {
        this._UtilitiesService.showWarning('No change to update.')
      }
    });
  }

  //view
  save() {
    if (this.weatherModel.usingType == 1) {
      if (this._ValidateCustomService.checkContent([
        { name: '.tempCustomerTagName', message: 'Please input all field' },
        { name: '.humidityCustomerTagName', message: 'Please input all field' },
        { name: '.tempPartnerTagName', message: 'Please input all field' },
        { name: '.humidityPartnerTagName', message: 'Please input all field' },
      ])) {
        return;
      }

      this._UtilitiesService.showLoading();
      let request = null;
      if (this.dataMapping.id != null) {//update
        request = this.dataMapping;
      } else {//create
        request = {
          chillerPlantId: this.chillerPlantID,
          status: 0,
          tempCustomerTagName: this.dataMapping.tempCustomerTagName,
          tempPartnerTagName: this.dataMapping.tempPartnerTagName,
          humidityCustomerTagName: this.dataMapping.humidityCustomerTagName,
          humidityPartnerTagName: this.dataMapping.humidityPartnerTagName,
        }
      }

      this._DataMappingService.save(request).then(response => {
        this._UtilitiesService.hideLoading();
        this.sourceDataMapping = _.cloneDeep(this.dataMapping);
        this._UtilitiesService.showSuccess(LocalMessages.messages['13']);
      }, error => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showErrorAPI(error, null);
      });
    } else if (this.weatherModel.usingType == 2) {
      this._UtilitiesService.showLoading();
      let request = {
        chillerPlantId: this.chillerPlantID,
        status: 1,
        latitude: this.latitude,
        longitude: this.longitude,
      }
      this._DataMappingService.save(request).then(response => {
        this.chillerPlantLocation.lat = this.latitude;
        this.chillerPlantLocation.lon = this.longitude;
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showSuccess(LocalMessages.messages['13']);
      }, error => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showErrorAPI(error, LocalMessages["14"]);
      })
    }
  }
  changeKoncepts(e, numType) {
    if (numType == 1) {
      if (e.value == this.konceptsTagNames[0]) {
        this.dataMapping.humidityPartnerTagName = this.konceptsTagNames[1];
      } else if (e.value == this.konceptsTagNames[1]) {
        this.dataMapping.humidityPartnerTagName = this.konceptsTagNames[0];
      }
    } else if (numType == 2) {
      if (e.value == this.konceptsTagNames[0]) {
        this.dataMapping.tempPartnerTagName = this.konceptsTagNames[1];
      } else if (e.value == this.konceptsTagNames[1]) {
        this.dataMapping.tempPartnerTagName = this.konceptsTagNames[0];
      }
    }
  }

  configInput = null;
  configForInput() {
    this.configInput = setInterval(() => {
      if (this.searchElementRef != undefined) {
        this.initialGoogleMap();
        clearInterval(this.configInput);
      }
    }, 1000);
  }
  changeTypeWeather(e) {
    if (e.value == 2) {
      this.initialGoogleMap();
      this.toolBox.isShow = false;
    }
  }
  isNotFullValue() {
    return this._StringService.isEmpty(this.dataMapping.tempCustomerTagName) ||
      this._StringService.isEmpty(this.dataMapping.tempPartnerTagName) ||
      this._StringService.isEmpty(this.dataMapping.humidityCustomerTagName) ||
      this._StringService.isEmpty(this.dataMapping.humidityPartnerTagName);
  }

  isDisableDataCollectorBtn() {
    if (_.isEqual(this.sourceDataMapping, this.dataMapping) || this.isNotFullValue()) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }

  isDisableWeatherServiceBtn() {
    if (this.latitude != this.chillerPlantLocation.lat || this.longitude != this.chillerPlantLocation.lon) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
    return true
  }


  //service
  public getWeatherData() {
    this._DataMappingService.getWeatherData(this.chillerPlantID).then(response => {
      if (response.status == 0) {
        if (response.Message == undefined) {
          this.dataMapping = response;

          this.konceptsTagNames.push(this.dataMapping.tempPartnerTagName);
          if (this.dataMapping.tempPartnerTagName != this.dataMapping.humidityPartnerTagName) {
            this.konceptsTagNames.push(this.dataMapping.humidityPartnerTagName);
          }
          this.sourceDataMapping = _.cloneDeep(this.dataMapping);
        }
      } else if (response.status == 1) {
        this.configForInput();
        this.initialGoogleMap();
      }
      this.weatherModel.usingType = response.status + 1;
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  //google map
  public latitude: number;
  public longitude: number;
  public searchControl: FormControl;
  public zoom: number;
  public chillerPlantLocation = {
    lat: null,
    lon: null,
  }

  // @ViewChild("search")
  // public searchElementRef: ElementRef;
  @ViewChild('search') searchElementRef: ElementRef;

  // private searchElementRef: ElementRef;
  // @ViewChild('search') set content(content: ElementRef) {
  //   if (content != undefined) {
  //     console.log(content);
  //   }
  // }

  // constructor(
  //   private mapsAPILoader: MapsAPILoader,
  //   private ngZone: NgZone
  // ) {}
  // ngAfterViewInit() {
  //   console.log("afterinit");
  //   setTimeout(() => {
  //     console.log(this.searchElementRef.nativeElement.innerText);
  //   }, 1000);
  // }

  initialGoogleMap() {
    //set google maps defaults
    this.zoom = 12;
    this.latitude = 39.8282;
    this.longitude = -98.5795;

    //create search FormControl
    this.searchControl = new FormControl();

    //set current position
    this.setCurrentPosition();

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address", "location"]
        // types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });

    //get chillerPlant location
    this._DataMappingService.getWeatherData(this.chillerPlantID).then(response => {
      this.chillerPlantLocation.lat = response.latitude;
      this.chillerPlantLocation.lon = response.longitude;
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null)
    });
  }

  private setCurrentPosition() {
    // if ("geolocation" in navigator) {
    //   navigator.geolocation.getCurrentPosition((position) => {
    //     this.latitude = position.coords.latitude;
    //     this.longitude = position.coords.longitude;
    //     this.zoom = 12;
    //     console.log(this.latitude);
    //     console.log(this.longitude);
    //   });
    // }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        // console.log(position.coords.longitude);
        this.zoom = 12;
        this.gotoLocation(null);
      });
    }
  }
  gotoLocation(e) {
    if (this.chillerPlantLocation.lat != null) {
      this.latitude = 100;
      this.longitude = 100;
      setTimeout(()=>{
        this.latitude = this.chillerPlantLocation.lat;
        this.longitude = this.chillerPlantLocation.lon;
      },100)
    }
  }

  collectTagNameWeatherCollector() {
    // this.dataMapping.humidityPartnerTagName = this.dataMapping.humidityCustomerTagName;
    // this.dataMapping.tempPartnerTagName = this.dataMapping.tempCustomerTagName;

    let requestData = [];
    requestData.push(this.dataMapping.humidityCustomerTagName);
    requestData.push(this.dataMapping.tempCustomerTagName);

    return this._DataMappingService.collectTagName(this.chillerPlantID, requestData).then(result => {
      if (result) {
        result.forEach(resultChild => {
          if (resultChild.equipmentName == this.dataMapping.humidityCustomerTagName) {
            this.dataMapping.humidityPartnerTagName = resultChild.tagName
          }
          if (resultChild.equipmentName == this.dataMapping.tempCustomerTagName) {
            this.dataMapping.tempPartnerTagName = resultChild.tagName
          }
        });

        this._UtilitiesService.showSuccess(LocalMessages.messages['130']);
      } else {
        this.data = [];
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  mapRightClick(e) {
    this.toolBox.isShow = true;
    this.toolBox.mousePos.top = _.cloneDeep(this.mousePos.top);
    this.toolBox.mousePos.left = _.cloneDeep(this.mousePos.left);

    this.toolBox.mapPos.lat = e.coords.lat;
    this.toolBox.mapPos.lng = e.coords.lng;
  }
  mapClick(e) {
    this.toolBox.isShow = false;
  }
  setLocation(e) {
    this.latitude = this.toolBox.mapPos.lat;
    this.longitude = this.toolBox.mapPos.lng;
    this.toolBox.isShow = false;
  }

  //custom google map
  map: any;
  searchBox: any;

  mapReady(event: any) {
    this.map = event;
    const input = document.getElementById('Map-Search');
    this.searchBox = new google.maps.places.SearchBox(input);
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('Settings'));
    // this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(document.getElementById('Profile'));
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push($('.data-mapping-google-map-search')[0]);
    // this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(document.getElementById('Logout'));
    this.searchBox.addListener('places_changed', () => this.goToSearchedPlace());

    // this.setCurrentPosition();
  }

  goToSearchedPlace() {
    const places = this.searchBox.getPlaces();
    if (places.length === 0) {
      return;
    }
    const bounds = new google.maps.LatLngBounds();
    places.forEach((place) => {
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
        // console.log('lat func',place.geometry.location.lat());
        // this.setCurrentPosition();
        this.latitude = place.geometry.location.lat();
        this.longitude = place.geometry.location.lng();
        this.isDisabled = false;
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    this.map.fitBounds(bounds);
  }

  isDisabledCollectTagName() {
    return this._StringService.isEmpty(this.dataMapping.tempCustomerTagName) || this._StringService.isEmpty(this.dataMapping.humidityCustomerTagName);
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    this.toolBox.isShow = false;
  }

  //api service
  getPartnerDetail() {
    return this.dataConnectionService.getConnectionDetail({ id: this.chillerPlantID }).then(response => {
      if (response) {
        this.tagNamePrefix.providerId = response.providerId;
        this.getListPartner();
        this.isDisabledCollect = false;
      } else {
        this.columns.push({ name: 'tagNamePrefix', label: this.tagNamePrefix.providerName, sortable: false });
        this.getDataMapping();
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null)
    });
  }
  getListPartner() {
    this.dataConnectionService.getListPartner().then(response => {
      if (response) {
        let findValue = _.find(response, { 'id': this.tagNamePrefix.providerId });
        if (findValue != undefined) {
          this.tagNamePrefix.providerName = findValue['providerName'];
        }

        // console.log(this.tagNamePrefix.providerName);
        // this.columns[4].label = this.tagNamePrefix.providerName + this.tagNamePrefix.prefix;
        // this.filter();

        this.columns.push({ name: 'tagNamePrefix', label: this.tagNamePrefix.providerName + this.tagNamePrefix.prefix, sortable: false });
        this.getDataMapping();
      }
    }, error => {
      this.columns.push({ name: 'tagNamePrefix', label: this.tagNamePrefix.providerName, sortable: false });
      this.getDataMapping();
      if (error) {
        if (error.status == 404) {
          this._UtilitiesService.showError(MESSAGE.ERROR.CONNECT_SERVER);
        } else {
          this._UtilitiesService.showErrorAPI(error, null)
        }
      }
    });
  }
}