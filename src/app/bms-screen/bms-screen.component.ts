import { Inject, Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { PAGES, API_CONFIGURATION } from 'app/constant';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { UtilitiesService } from 'app/services/utilities.service';
import { StringService } from '../services/string.service';
import { ValidateService } from '../services/validate.service';

import { RequestOptions, Headers, Http, ResponseContentType } from '@angular/http';
import { BMSService } from '../api-service/bms.service';
import { CommonService } from '../api-service/common.service';
import { MESSAGE, VARIABLES } from '../constant'
import { DomSanitizer } from '@angular/platform-browser';
import { element } from 'protractor';
import { LocalMessages } from 'app/message';
import * as _ from 'lodash';

@Component({
  selector: 'edit-bms-image-dialog',
  templateUrl: 'edit-bms-image-dialog.html',
  styleUrls: ['./bms-screen.component.scss']
})
export class EditBMSImageDialog implements OnInit {
  chillerPlantID;
  imageListData;
  selectedId;
  isDisabledUpdateButton = false;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  bmsData = {
    imageName: '',
    fileName: '',
    uploadedImage: '',
    note: ''
  }

  currentBMSData = {
    imageName: '',
    fileName: '',
    uploadedImage: '',
    note: '',
  };
  imageZoom = '';

  fileSelectMsg: string = 'No file selected yet.';
  fileUploadMsg: string = 'No file uploaded yet.';
  disabled: boolean = false;
  selectedFile;
  lensSize = 400;


  onSubmit(data) {
    this.updateImage();
  }

  ngOnInit(): void {
    this.chillerPlantID = this.data["chillerPlantID"];
    this.imageListData = this.data["data"];
    this.selectedId = this.data["currentRow"].id;
    this.reloadData();
  }
  reloadData() {
    this._UtilitiesService.showLoading();
    this.getBMSDetail().then(() => {
      setTimeout(() => {
        this._UtilitiesService.stopLoading();
      }, 500);
    });
  }

  getBMSDetail() {
    let requestParam = {
      plantid: this.chillerPlantID,
      id: this.selectedId
    }
    return this.bMSService.getBmsImageDetail(requestParam).then(result => {
      if (result) {
        this.bmsData.imageName = result.imageName;
        this.bmsData.fileName = result.fileName;
        this.bmsData.uploadedImage = result.base64;
        this.bmsData.note = result.note;

        this.currentBMSData.fileName = result.fileName
        this.currentBMSData.imageName = result.imageName
        this.currentBMSData.uploadedImage = result.base64
        this.currentBMSData.note = result.note

        this.imageZoom = _.cloneDeep(result.base64);

        var img = new Image();
        let vm = this;
        img.onload = function () {
          if (img.height < 400) {
            vm.lensSize = img.height;
          } else {
            vm.lensSize = 400;
          }
        };
        img.src = result.base64;
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  checkData() {
    if (!this.bmsData.imageName || !this.bmsData.fileName || !this.bmsData.uploadedImage) {
      return true
    }

    if (this.bmsData.imageName != this.currentBMSData.imageName) {
      return false
    } else if (this.bmsData.fileName != this.currentBMSData.fileName) {
      return false;
    } else if (this.bmsData.uploadedImage != this.currentBMSData.uploadedImage) {
      return false;
    } else if (this.bmsData.note != this.currentBMSData.note) {
      return false;
    }
    return true;
  }

  selectEvent(file): void {
    if (!this._ValidateService.validateBMSFileSize(file.size)) {
      // this._UtilitiesService.showError(MESSAGE.ERROR.INVALID_FILE_SIZE);
      this._UtilitiesService.showError(LocalMessages.messages['108']);
      this.bmsData.fileName = MESSAGE.ERROR.INVALID_FILE;
      return
    }

    if (!this._ValidateService.validateBMSFile(file.name)) {
      // this._UtilitiesService.showError(MESSAGE.ERROR.INVALID_FILE);
      this._UtilitiesService.showError(LocalMessages.messages['106']);
      this.bmsData.fileName = MESSAGE.ERROR.INVALID_FILE;
      this.cancelEvent();
      return;
    }
    this.selectedFile = file;
    this.fileSelectMsg = file.name;
    this.bmsData.fileName = file.name.length > 50 ? file.name.substring(0, 50) + file.name.substring(file.name.length - 4, file.name.length) : file.name;
    let self = this;
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
      self.bmsData.uploadedImage = reader.result;
      self.imageZoom = reader.result;

      var img = new Image();
      img.onload = function () {
        if (img.height < 400) {
          self.lensSize = img.height;
        } else {
          self.lensSize = 400;
        }
      };
      img.src = reader.result;
    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };

    this.fileUploadMsg = file.name;
  }

  changeItem(type) {
    let elementPos = this.imageListData.map(function (x) { return x.id; }).indexOf(this.selectedId);
    //find next
    let imageListSize = this.imageListData.length;
    let nextElementPos;
    if (type === 'next') {
      nextElementPos = elementPos + 1 >= imageListSize ? 0 : elementPos + 1
    } else if (type === 'previous') {
      nextElementPos = elementPos - 1 < 0 ? imageListSize - 1 : elementPos - 1
    }
    let nextObject = this.imageListData[nextElementPos];
    this.selectedId = nextObject.id;
    this.reloadData();
    this.selectedFile = null;
  }

  nextImage() {
    this.changeItem('next');
  }

  previousImage() {
    this.changeItem('previous');
  }

  updateImage() {
    this.isDisabledUpdateButton = true;
    let formData = new FormData();
    if (this.selectedFile) {
      formData.append("file", this.selectedFile, this.selectedFile.name);
    }
    formData.append("fileName", this.bmsData.fileName);
    formData.append("plantId", this.chillerPlantID);
    formData.append("imageName", this.bmsData.imageName);
    formData.append("note", this.bmsData.note);
    formData.append("id", this.selectedId);

    let headers = new Headers({
      'Authorization': 'Bearer ' + CommonService._UserService.getAccessToken(),
      'Accept': 'application/json',
    });

    let options = new RequestOptions({ headers: headers });

    this.http.post(API_CONFIGURATION.API_URLS.BMS_UPDATE, formData, options)
      .map(res => res.json())
      .subscribe(
      data => {
        this.isDisabledUpdateButton = false;
        this.dialogRef.close(true);
        this._UtilitiesService.showSuccess(LocalMessages.messages['11']);
      },
      error => {
        this.isDisabledUpdateButton = false;
        this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
      }
      )
  }

  cancelEvent(): void {
    this.bmsData.uploadedImage = '';
    this.fileSelectMsg = 'No file selected yet.';
    this.fileUploadMsg = 'No file uploaded yet.';
  }

  constructor(
    private _ValidateService: ValidateService,
    private _UtilitiesService: UtilitiesService,
    public http: Http,
    private bMSService: BMSService,
    public dialogRef: MatDialogRef<AddBMSImageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
}

@Component({
  selector: 'add-bms-image-dialog',
  templateUrl: 'add-bms-image-dialog.html',
  styleUrls: ['./bms-screen.component.scss']
})
export class AddBMSImageDialog implements OnInit {
  form;
  chillerPlantID;
  imageListData;
  selectedId;
  isDisabledSaveButton = false;
  imageName = '';
  fileName = '';
  uploadedImage = '';
  note = '';
  fileSelectMsg: string = 'No file selected yet.';
  fileUploadMsg: string = 'No file uploaded yet.';
  disabled: boolean = false;
  selectedFile;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  imageZoom = '';
  lensSize = 400;

  ngOnInit(): void {
    this.chillerPlantID = this.data["chillerPlantID"];
  }

  getBMSDetail() {
    let requestParam = {
      plantid: this.chillerPlantID,
      id: this.selectedId
    }
    return this.bMSService.getBmsImageDetail(requestParam).then(result => {
      if (result) {
        this.imageName = result.imageName;
        this.fileName = result.fileName;
        this.uploadedImage = result.base64;
        this.note = result.note;
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }


  selectEvent(file): void {
    if (!this._ValidateService.validateBMSFileSize(file.size)) {
      // this._UtilitiesService.showError(MESSAGE.ERROR.INVALID_FILE_SIZE);
      this._UtilitiesService.showError(LocalMessages.messages['108']);
      this.fileName = MESSAGE.ERROR.INVALID_FILE;
      return
    }

    if (!this._ValidateService.validateBMSFile(file.name)) {
      // this._UtilitiesService.showError(MESSAGE.ERROR.INVALID_FILE);
      this._UtilitiesService.showError(LocalMessages.messages['106']);
      this.fileName = MESSAGE.ERROR.INVALID_FILE;
      this.cancelEvent();
      return;
    }
    this.selectedFile = file;
    this.fileSelectMsg = file.name;
    this.fileName = file.name.length > 50 ? file.name.substring(0, 50) + file.name.substring(file.name.length - 4, file.name.length) : file.name;

    let self = this;
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
      self.uploadedImage = reader.result;
      self.imageZoom = _.cloneDeep(self.uploadedImage);

      var img = new Image();
      img.onload = function () {
        if (img.height < 400) {
          self.lensSize = img.height;
        } else {
          self.lensSize = 400;
        }
      };
      img.src = reader.result;

    };

    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
    this.fileUploadMsg = file.name;
  }

  checkData() {
    if (!this.uploadedImage || !this.fileName || !this.imageName) {
      return true
    }
    return false
  }

  saveImage() {
    this.isDisabledSaveButton = true;
    let formData = new FormData();
    formData.append("file", this.selectedFile, this.selectedFile.name);
    formData.append("fileName", this.fileName);
    formData.append("plantId", this.chillerPlantID);
    formData.append("imageName", this.imageName);
    formData.append("note", this.note);

    let headers = new Headers({
      'Authorization': 'Bearer ' + CommonService._UserService.getAccessToken(),
      'Accept': 'application/json',
    });

    let options = new RequestOptions({ headers: headers });
    this._UtilitiesService.showLoading();
    this.http.post(API_CONFIGURATION.API_URLS.BMS_UPLOAD, formData, options)
      .map(res => res.json())
      .subscribe(
      data => {
        this.isDisabledSaveButton = false;
        this.dialogRef.close(true);
        this._UtilitiesService.showSuccess(LocalMessages.messages['46']);
        this._UtilitiesService.stopLoading();
      },
      error => {
        this._UtilitiesService.stopLoading();
        this.isDisabledSaveButton = false;
        this._UtilitiesService.showErrorAPI(error, null);

      })
  }

  cancelEvent(): void {
    this.uploadedImage = '';
    this.fileSelectMsg = 'No file selected yet.';
    this.fileUploadMsg = 'No file uploaded yet.';
  }

  constructor(
    private _ValidateService: ValidateService,
    private _UtilitiesService: UtilitiesService,
    public http: Http,
    private bMSService: BMSService,
    public dialogRef: MatDialogRef<AddBMSImageDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

}


@Component({
  selector: 'bms-screen',
  templateUrl: './bms-screen.component.html',
  styleUrls: ['./bms-screen.component.scss']
})

export class BMSScreenComponent implements OnInit {
  data: any[] = [];
  @Input() chillerPlantID;

  constructor(
    private bMSService: BMSService,
    private _UtilitiesService: UtilitiesService,
    public dialog: MatDialog,
    private _StringService: StringService,
    private router: Router) { }

  getBMSList() {
    this._UtilitiesService.showLoading();
    let requestParam = { plantid: this.chillerPlantID }
    return this.bMSService.getListBMS(requestParam).then(result => {
      if (result) {
        this.data = result.content;
      } else {
        this.data = [];
      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    }).catch(function (error) {
      this._UtilitiesService.hideLoading();
    });;
  }

  deleteBMSImage(id) {
    return this.bMSService.deleteBMSImage(id).then(result => {
      if (result) {
        this._UtilitiesService.showSuccess(LocalMessages.messages['9']);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
    });
  }

  ngOnInit() {
    this.getBMSList();
  }

  openBMSImageDialog(): void {

    let dialogRef = this.dialog.open(AddBMSImageDialog, {
      width: '800px',
      disableClose: true,
      data: {
        chillerPlantID: this.chillerPlantID
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBMSList();
      }
    });
  }

  viewImageDetail(row) {
    let dialogRef = this.dialog.open(EditBMSImageDialog, {
      width: '800px',
      disableClose: true,
      data: {
        chillerPlantID: this.chillerPlantID,
        data: this.data,
        currentRow: row
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getBMSList();
      }
    });
  }

  showConfirmDialog(row) {
    this._UtilitiesService.showConfirmDialog(this._StringService.getConfirmDelete(row.imageName), (result) => {
      if (result) {
        this.deleteBMSImage(row.id).then(() => {
          this.getBMSList();
        });
      }
    });
  }
}