import { Injectable } from '@angular/core';
// import { TdLoadingService, LoadingMode, LoadingType } from '@covalent/core';
// import * as moment from 'moment'
// import { ToastsManager } from 'ng2-toastr/ng2-toastr';
// import * as _ from 'lodash';
// import { MatDialog } from '@angular/material';
// import { ConfirmDialog } from 'app/common/dialogs/confirm-dialog.component';

@Injectable()
export class StringService {
  public create(str, o) {
    let regexp = /{([^{]+)}/g;
    return str.replace(regexp, function (ignore, key) {
      return (key = o[key]) == null ? '' : key;
    });
  }

  public isEmpty(val) {
    // if (Array.isArray(val)) {
    //   return val.length === 0;
    // } else {
    //   val = val.trim();
    //   return val === undefined || val == null || val.length <= 0;
    // }

    if (val != undefined && val != null) {
      if (Array.isArray(val)) {
        return val.length === 0;
      } else if (typeof val == 'string') {
        val = val.trim();
        return val === undefined || val == '' || val.length <= 0;
      } else if (typeof val == 'number') {
        return false;
      } else if (typeof val == 'object') {
        for (let property in val) {
          if (val.property != undefined || val.property != null || val.property != '') {
            return false;
          }
        }
        return true;
      }
    }
    return true;
  }

  //check string input no space, special characters...
  private isNoSignString(str: string) {
    return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(str) && str.indexOf(' ') == -1;
  }
  private isValidPassword(password: string) {
    return password != '' && password.length >= 5 && password.length <= 100 && this.isNoSignString(password);
  }
  public getConfirmDelete(text: string) {
    if (text) {
      return text + ' will be deleted, are you sure?';
    } else {
      return 'Item will be deleted, are you sure?'
    }
  }
  public replaceAll(str, sourceText, replaceText) {
    let result = null;
    while (str.indexOf(sourceText) != -1) {
      result = str.replace(sourceText, replaceText);
    }
    return result;
  }
}