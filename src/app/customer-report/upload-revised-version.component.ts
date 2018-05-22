import { LocalMessages } from './../message';
import { MAT_DIALOG_DATA } from '@angular/material';
import { CustomerReportService } from './../api-service/customer-report.service';
import { UtilitiesService } from './../services/utilities.service';
import { ValidateService } from './../services/validate.service';
import { MatDialogRef } from '@angular/material';
import { VARIABLES } from 'app/constant';
import { OnInit, Inject } from '@angular/core';
import { Component } from '@angular/core';

@Component({
    selector: 'revised-version-upload',
    templateUrl: './upload-revised-version.dialog.html',
    styleUrls: ['./customer-report.component.scss']
})
export class RevisedVersionUploadDialog implements OnInit {
    fileUpload = {
        selectedFile: null,
        fileName: null
    };

    report;

    inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
    inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;

    constructor(
        public dialogRef: MatDialogRef<RevisedVersionUploadDialog>,
        public _ValidateService: ValidateService,
        public _UtilitiesService: UtilitiesService,
        private _CustomerReportService: CustomerReportService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
        this.report = this.data.report;
        this.report.customerId = this.data.customerId;
        this.report.reportType = this.data.reportType;
    }

    // prepare data for create new chiller palant
    prepareData() {
        let formData = new FormData();
        if (this.fileUpload.selectedFile) {
            formData.append("file", this.fileUpload.selectedFile, this.fileUpload.selectedFile.name);
        }
        formData.append("reporttype", this.report.reportType);
        formData.append("customerid", this.report.customerId);
        formData.append("reportid", this.report.id);

        return formData;
    }

    uploadRevisedVersion() {
        // if (this.report) {
        //     this.report.createDate = this.getDateTime(this.report.createDate);
        // }
        let data = this.prepareData()

        this._UtilitiesService.showLoading();
        this._CustomerReportService.uploadRevisedVersion(data).then(response => {
            this._UtilitiesService.hideLoading();
            this.dialogRef.close('true');
        }, error => {
            this._UtilitiesService.hideLoading();
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['91']);
        })
    }

    // selecte file
    selectEvent(file): void {
        if (!this._ValidateService.validatePerformanceFileSize(file.size)) {
            this._UtilitiesService.showWarning(LocalMessages.messages["108"]);
            this.fileUpload.fileName = '';
            this.cancelEvent();
            return
        }

        if (!this._ValidateService.validatePerformanceExcelFile(file.name)) {
            this._UtilitiesService.showWarning(LocalMessages.messages["132"]);
            this.fileUpload.fileName = '';
            this.cancelEvent();
            return;
        }

        // if (file.name.split('.')[0] !== this.report.reportName.split('.')[0]) {
        //     this._UtilitiesService.showError(LocalMessages.messages["132"]);
        //     this.fileUpload.fileName = '';
        //     this.cancelEvent();
        //     return;
        // }

        this.fileUpload.selectedFile = file;
        this.fileUpload.fileName = file.name;
    }

    cancelEvent(): void {
        this.fileUpload.selectedFile = null;
    }

}