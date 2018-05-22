import { CustomerInfoComponent } from './customer-info/customer-info.component';
import { RevisedVersionUploadDialog } from './customer-report/upload-revised-version.component';
import { CustomerReportService } from './api-service/customer-report.service';
import { EnergySavingService } from './api-service/energy-saving.service';
import * as $ from 'jquery';
import * as _ from "lodash";

// modules
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <-- NgModel lives here
import { AppRoutingModule } from "./app.routing";
import { MatNativeDateModule, MatDatepickerModule, MatTabsModule, MatSidenavModule, MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatInputModule, MatTableModule, MatPaginatorModule, MatSortModule, MatSelectModule, MatDialogModule, MatCheckboxModule, MatRadioModule, MatGridListModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Ng2BreadcrumbModule } from 'ng2-breadcrumb/ng2-breadcrumb';
import { CovalentDataTableModule, CovalentPagingModule, CovalentLoadingModule, CovalentFileModule } from '@covalent/core';
import { MomentModule } from 'angular2-moment';
import { ToastModule } from 'ng2-toastr/ng2-toastr';
import { ToastOptions } from 'ng2-toastr/src/toast-options';
import { ChartsModule } from 'ng2-charts';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';
import { RecaptchaModule } from 'ng-recaptcha';
import { AgmCoreModule } from '@agm/core';
import { ImageZoomModule } from 'angular2-image-zoom';
import { DpDatePickerModule } from 'ng2-date-picker';

// services
import { UtilitiesService } from "./services/utilities.service";
import { UserService } from "./services/user.service";
import { StringService } from "./services/string.service";
import { ValidateService } from "./services/validate.service";
import { ValidateCustomService } from "./services/validate.service";
import { LoginService } from "./services/login.service";

// components
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeadingComponent } from './heading/heading.component';
import { NavigationComponent } from './navigation/navigation.component';
import { FooterComponent } from './footer/footer.component';
import { ChillerPlantsComponent } from './chiller-plants/chiller-plants.component';
import { CustomerListComponent } from './customer-list/customer-list.component';
import { CustomerManagementComponent } from './customer-management/customer-management.component';
import { ReportComponent } from './report/report.component';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { OperatorManagementComponent } from './operator-management/operator-management.component';
import { OperatorListComponent } from './operator-list/operator-list.component';
import { OperatorDetailComponent } from './operator-detail/operator-detail.component';
import { DialogOperatorEdit } from './operator-detail/dialog-operator-edit/dialog-operator-edit.component';
import { DialogCustomerEdit } from './customer-detail/dialog-customer-edit/dialog-customer-edit.component';
import { OperatorAddComponent } from './operator-add/operator-add.component';
import { PhoneNumberComponent } from './phone-number/phone-number.component';
import { DayInYearComponent } from './day-in-year/day-in-year.component';
import { ChillerPlantDetailComponent } from './chiller-plant-detail/chiller-plant-detail.component';
import { PlantModelComponent } from './plant-model/plant-model.component';
import { EditableInputComponent } from './common/components/editable-input.component';
import { CustomerDetailComponent } from './customer-detail/customer-detail.component';
import { CustomerCreateComponent } from './customer-create/customer-create.component';
import { WeatherServiceComponent } from './weather-service/weather-service.component';
import { ScheduleListComponent } from './schedule-list/schedule-list.component';
import { DialogScheduleCreateComponent } from './schedule-create/dialog-schedule-create.component';
import { DialogScheduleUpdateComponent } from './schedule-update/dialog-schedule-update.component';
import { DataConnectionComponent } from './data-connection/data-connection.component';
import { MonitoringComponent } from './monitoring/monitoring.component';
import { MonitoringExecutionHistoryComponent } from './monitoring-execution-history/monitoring-execution-history.component';
import { MonitoringExecutionDetailComponent } from './monitoring-execution-detail/monitoring-execution-detail.component';
import { NotificationSettingComponent } from './notification-setting/notification-setting.component';
import { NavigationHistoryComponent } from './navigation-history/navigation-history.component';
import { SystemConfigurationComponent } from './system-configuration/system-configuration.component';
import { SMSServiceComponent } from './sms-service/sms-service.component';
import { EmailServiceComponent } from './email-service/email-service.component';
import { SystemParameterComponent } from './system-parameter/system-parameter.component';
import { SystemDefaultParameterComponent } from './system-default-parameter/system-default-parameter.component';
import { PerformanceCurveComponent, PerformanceCurveAddDialog, PerformanceCurveDetailDialog } from './performance-curve/performance-curve.component';
import { ExecutionReportComponent } from './report/execution-report/execution-report.component';
import { EnergyReportComponent } from './report/energy-report/energy-report.component';
import { AnalysisToolComponent } from './analysis-tool/analysis-tool.component';
import { EnergySavingComponent } from './energy-saving/energy-saving.component';
import { BMSScreenComponent } from './bms-screen/bms-screen.component';
import { UnitPriceComponent } from './unit-price/unit-price.component'
import { BaseLineComponent } from './base-line/base-line.component';
import { ESExpectationComponent } from './es-expectation/es-expectation.component';

// dialogs
import { ConfirmDialog } from './common/dialogs/confirm-dialog.component';
import { AddChillerPlantDialog } from './chiller-plants/chiller-plants.component';
import { UpdateCoolingDialog } from './plant-model/plant-model.component';
import { UpdateChillerDialog } from './plant-model/plant-model.component';
import { AddBMSImageDialog } from './bms-screen/bms-screen.component';
import { EditBMSImageDialog } from './bms-screen/bms-screen.component';
import { CreateUnitPriceDialog } from './unit-price/unit-price-create/unit-price-create.component';
import { ErrorMessageMonitoringDialog } from './monitoring-execution-history/monitoring-execution-history.component';
import { DataMappingAddMCTDialog, DataMappingImportDialog } from './data-mapping/data-mapping.component';
import { UpdateCHWPDialog } from './plant-model/plant-model.component';
import { UpdateCDWPDialog, BackupCDWPDialog, BackupCHWPDialog, BackupCCTDialog } from './plant-model/plant-model.component';
import { AddCctDialog } from './plant-model/plant-model.component';
import { UpdateUnitPriceDialog } from './unit-price/unit-price-detail/unit-price-detail.component';

// remove later
export class CustomToastOption extends ToastOptions { // can create separate .ts file for class
  positionClass = 'toast-bottom-right';
}

import * as html2canvas from "html2canvas";
import { EnergyConsumptionComponent } from './energy-consumption/energy-consumption.component';
import { ExportPDFComponent } from './export-pdf/export-pdf.component';
import { NotificationAddDialog } from './notification-add/notification-add.component';
import { NotificationUpdateDialog } from './notification-update/notification-update.component';
import { DataMappingComponent } from './data-mapping/data-mapping.component';

//service
import { SharedService } from './services/shared-service.service';
import { AuthorizationService } from './api-service/authorization.service';
import { ChillerPlantService } from './api-service/chiller-plant.service';
import { NavigationHistoryService } from './api-service/navigation-history.service';
import { NotificationSettingService } from './api-service/notification-setting.service';
import { CustomerService } from './api-service/customer.service';
import { OperatorService } from './api-service/operator.service';
import { DataMappingService } from './api-service/data-mapping.service';
import { ScheduleService } from './api-service/schedule.service';
import { DataConnectionService } from './api-service/data-connection.service';
import { BMSService } from './api-service/bms.service';
import { BaseLineService } from './api-service/base-line.service';
import { UnitPriceService } from './api-service/unit-price.service';
import { WeatherServiceService } from './api-service/weather-service.service';
import { ChillerPlantInformationComponent } from './chiller-plant-information/chiller-plant-information.component';
import { VARIABLES } from './constant';
import { ShortenDataPipe } from './pipes/shorten-data.pipe';
import { ExportXlsxComponent } from './export-xlsx/export-xlsx.component';
import { EnergyConsumptionService } from './api-service/energy-consumption.service';
import { ESExpectationService } from './api-service/es-expectation.service';
import { ExecutionHistoryService } from './api-service/execution-history.service';
import { UserReportService } from './api-service/user-report.service';
import { SmsServiceService } from './api-service/sms-service.service';
import { EmailServiceService } from './api-service/email-service.service';
import { PerformanceCurveService } from './api-service/performance-curve.service';
import { ExecutionReportPageComponent } from './execution-report/execution-report.component';
import { CustomerReportComponent } from './customer-report/customer-report.component';
import { SystemDefaultParameterService } from './api-service/system-default-parameter.service';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DashboardComponent,
    HeadingComponent,
    NavigationComponent,
    FooterComponent,
    ChillerPlantsComponent,
    CustomerListComponent,
    ConfirmDialog,
    AddChillerPlantDialog,
    PerformanceCurveAddDialog,
    PerformanceCurveDetailDialog,

    LoginComponent,
    ResetPasswordComponent,
    ChangePasswordComponent,

    OperatorManagementComponent,
    OperatorListComponent,
    OperatorDetailComponent,
    OperatorAddComponent,
    PhoneNumberComponent, DayInYearComponent,
    DialogOperatorEdit,
    DialogCustomerEdit,

    ChillerPlantDetailComponent,
    EditableInputComponent,
    WeatherServiceComponent,

    ScheduleListComponent,
    DialogScheduleCreateComponent,
    DialogScheduleUpdateComponent,

    CustomerDetailComponent,
    MonitoringExecutionHistoryComponent,
    MonitoringExecutionDetailComponent,
    // ChillerPlantEquipmentComponent,
    PlantModelComponent,
    NotificationSettingComponent,
    NavigationHistoryComponent,
    EnergyReportComponent,
    ExecutionReportComponent,
    // AddChillerComponent,
    // AddChillerDialog,
    // AddCoolingTowerComponent,
    // AddCoolingDialog,
    // UpdateCoolingTowerComponent,
    UpdateCoolingDialog,
    // UpdateChillerComponent,
    UpdateChillerDialog,
    SMSServiceComponent,
    // AddCctComponent,
    AddCctDialog,
    CustomerManagementComponent,
    MonitoringComponent,
    SystemConfigurationComponent,
    EmailServiceComponent,
    SystemParameterComponent,
    PerformanceCurveComponent,
    EnergyConsumptionComponent,
    AnalysisToolComponent,
    EnergySavingComponent,
    ExportPDFComponent,
    NotificationAddDialog,
    NotificationUpdateDialog,
    BMSScreenComponent,
    AddBMSImageDialog,
    EditBMSImageDialog,
    BaseLineComponent,
    ErrorMessageMonitoringDialog,
    DataMappingComponent,
    DataMappingAddMCTDialog,
    DataMappingImportDialog,
    UnitPriceComponent,
    CreateUnitPriceDialog,
    UpdateCHWPDialog,
    UpdateCDWPDialog,
    BackupCDWPDialog,
    BackupCHWPDialog,
    BackupCCTDialog,
    UpdateUnitPriceDialog,
    CustomerCreateComponent,
    DataConnectionComponent,
    ChillerPlantInformationComponent,
    ShortenDataPipe,
    ExportXlsxComponent,
    ESExpectationComponent,
    ExecutionReportPageComponent,
    CustomerReportComponent,
    CustomerInfoComponent,
    RevisedVersionUploadDialog,
    SystemDefaultParameterComponent,
    ReportComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    CommonModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatTabsModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    MatInputModule,
    MatTableModule, MatPaginatorModule,
    MatSortModule, MatSelectModule,
    MatDialogModule, MatCheckboxModule,
    MatRadioModule,
    FlexLayoutModule,
    // BreadcrumbsModule,
    Ng2BreadcrumbModule.forRoot(),
    CovalentDataTableModule, CovalentPagingModule, CovalentLoadingModule,
    MomentModule,
    ChartsModule,
    ToastModule.forRoot(),
    HttpModule,
    HttpClientModule,
    CovalentFileModule,
    RecaptchaModule.forRoot(),
    MatGridListModule,
    ImageZoomModule,
    AgmCoreModule.forRoot({
      apiKey: VARIABLES.API_KEY,
      libraries: ["places"]
    }),
    DpDatePickerModule
  ],
  providers: [
    UtilitiesService, {
      provide: ToastOptions,
      useClass: CustomToastOption
    },
    Md5,
    LoginService,
    UserService,
    StringService, ValidateService, ValidateCustomService,
    AuthorizationService,
    ChillerPlantService,
    NavigationHistoryService,
    NotificationSettingService,
    CustomerService,
    OperatorService,
    DataMappingService,
    ScheduleService,
    DataConnectionService,
    BMSService,
    PhoneNumberComponent,
    BaseLineService,
    UnitPriceService,
    WeatherServiceService,
    SharedService,
    EnergyConsumptionService,
    EnergySavingService,
    CustomerReportService,
    ESExpectationService,
    ExecutionHistoryService,
    UserReportService,
    SmsServiceService,
    EmailServiceService,
    PerformanceCurveService,
    SystemDefaultParameterService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    ConfirmDialog,
    AddChillerPlantDialog,
    DialogOperatorEdit,
    DialogCustomerEdit,
    // AddChillerDialog,
    // AddCoolingDialog,
    UpdateCoolingDialog,
    UpdateChillerDialog,
    AddCctDialog,
    NotificationAddDialog,
    NotificationUpdateDialog,
    AddBMSImageDialog,
    EditBMSImageDialog,
    ErrorMessageMonitoringDialog,
    DataMappingAddMCTDialog,
    DataMappingImportDialog,
    CreateUnitPriceDialog,
    UpdateCHWPDialog,
    UpdateCDWPDialog,
    BackupCDWPDialog,
    BackupCHWPDialog,
    BackupCCTDialog,
    UpdateUnitPriceDialog,
    RevisedVersionUploadDialog,
    DialogScheduleCreateComponent,
    DialogScheduleUpdateComponent,

    PerformanceCurveAddDialog, PerformanceCurveDetailDialog,
  ]
})
export class AppModule { }