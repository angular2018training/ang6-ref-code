import { Injectable, NgModule } from '@angular/core';
import { TdLoadingService, LoadingMode, LoadingType } from '@covalent/core';
import * as moment from 'moment'
import { ToastsManager, Toast } from 'ng2-toastr/ng2-toastr';
import * as _ from 'lodash';
import { MatDialog } from '@angular/material';
import { ConfirmDialog } from 'app/common/dialogs/confirm-dialog.component';
import { MESSAGE } from '../constant';
import { LocalMessages } from '../message';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class UtilitiesService {
  private loadingCount = 0;
  private toastOpts = {
    toastLife: 2000,
    maxShown: 7,
    showCloseButton: true,
    enableHTML: true
  };
  constructor(
    private _loadingService: TdLoadingService,
    private toastr: ToastsManager,
    private dialog: MatDialog
  ) { }

  public formatTime(time) {
    return moment(time).format("YYYY-MM-DD") + " 00:00:00";
  };
  public formatDay(time) {
    return moment(time).format("YYYY-MM-DD");
  }

  public formatDateTime(time, format) {
    return moment(time).format(format);
  };

  public showLoading() {
    this.loadingCount++;
    this._loadingService.register();
  }
  public isLoading() {
    return this.loadingCount > 0;
  }

  public hideLoading() {
    setTimeout(() => {
      this.loadingCount--;
      if (this.loadingCount <= 0) {
        this._loadingService.resolve();
      }
    }, 100);
  }

  public showSuccess(message) {
    this.toastr.success(message, undefined, this.toastOpts);
  }

  public showError(message) {
    let opts = _.cloneDeep(this.toastOpts);
    opts.toastLife = 7000;
    this.toastr.error(message, undefined, opts);
  }

  public stopLoading() {
    this.loadingCount = 0;
    this._loadingService.resolve();
  }
  public showError2(message) {
    return this.toastr.error(message, undefined, this.toastOpts);
  }
  public hideToast(toasts: Array<Toast>) {
    toasts.forEach(item => {
      this.toastr.dismissToast(item);
    });
  }

  public showWarning(message) {
    let opts = _.cloneDeep(this.toastOpts);
    opts.toastLife = 7000;
    this.toastr.warning(message, undefined, opts);
  }

  public showInfo(message) {
    let opts = _.cloneDeep(this.toastOpts);
    opts.toastLife = 4000;
    this.toastr.info(message, undefined, opts);
  }

  public showConfirmDialog(message, callback) {
    let dialogRef = this.dialog.open(ConfirmDialog, {
      width: '350px',
      data: {
        title: 'Confirmation',
        message: message
      }
    });
    dialogRef.afterClosed().subscribe(callback);
  }

  public showErrorAPI(error, subMessage = null) {
    if (subMessage === null || subMessage === '') {
      subMessage = 'Internal Server Error';
    }
    if (error) {
      if (error.status == 0) {
        this.showError(LocalMessages.messages['135']);
        return;
      }else if (error.status === 404){
        this.showError(MESSAGE.ERROR.CONNECT_SERVER);
      } else {
        if (error._body) {
          let jsonError = JSON.parse(error._body);
          if (jsonError && jsonError.errors) {
            jsonError.errors.forEach(element => {
              this.showError(element.message);
            });
            return;
          } else if (jsonError.message) {
            this.showError(jsonError.message);
            return;
          }
        } else {
          this.showError(subMessage);
          return;
        }
      }
    }
    this.showError(subMessage);
    return;
  }
  
  validationErrorDisplay(errorInput) {
    let errorMessage = '';
    _.forEach(_.uniq(errorInput), function (value) {
      errorMessage = errorMessage + value + '\n';
    });
    this.showWarning(errorMessage);
  }

  roundDecimal(value, digit) {
    if (digit == 1) {
      return Math.round(value * 10) / 10
    } else if (digit == 2) {
      return Math.round(value * 100) / 100
    } else if (digit == 3) {
      return Math.round(value * 1000) / 1000
    } else if (digit == 4) {
      return Math.round(value * 10000) / 10000
    } else if (digit == 5) {
      return Math.round(value * 100000) / 100000
    }
    return Math.round(value);
  }
}
