import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import { StringService } from './string.service';
import { UtilitiesService } from '../services/utilities.service';
import { isEmpty } from 'rxjs/operator/isEmpty';

@Injectable()
export class ValidateService {
  private classBoundRadioBtn: string = 'bound-radio-btn';

  public lengthText = 100;

  //regex
  // private regexEmail: string = '^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$';
  public regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

  // public regexURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
  // public regexURL = /@^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$@iS/;
  // public regexURL = /@^(https?|ftp):\/\/[a-zA-Z]/;
  // public regexURL = /@(https?|ftp):\/\/(-\.)?([^\s/?\.#-]+\.?)+(\/[^\s]*)?$@iS/;
  // public regexURL = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  // public regexURL = /^(https?:\/\/)?([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  // public regexURL = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;
  // public regexURL = /@^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$@iS/;
  public regexURL = /https?:\/\/.+/;

  public regexPhoneNumber: string = 'bound-radio-btn';
  public regexPassword = /[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g;//do not have special character
  public regexhostName = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/;

  //message
  MESSAGE = {
    INPUT_EMAIL: 'Please enter email',
    INVALID_EMAIL: 'Invalid email',
  }

  constructor(
    public _StringService: StringService,
    public _UtilitiesService: UtilitiesService,
  ) { }

  public validateEmail(val) {
    if (val.indexOf("@") === -1 || val.indexOf(".") === -1) {
      return false;
    }
    let atpos = val.indexOf("@");
    let dotpos = val.lastIndexOf(".");

    if (val.length - dotpos > 10) {
      return false;
    }
    if (atpos < 1 || dotpos < atpos+2 || dotpos +2 >= val.length) {
        return false;
    }
    return true;
  }

  public validateHostName(val){
    return this.regexhostName.test(val);
  }
  public validatePhoneNumber(val) {
    var re = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
    return re.test(val);
  }
  public validatePassword(val) {
    // return !/[~`!#$%\^&*+=\-\[\]\\';,/{}|\\":<>\?]/g.test(val) && val.indexOf(' ') == -1 && val.length > 8;
    return val.length > 7;
  }
  public isURL(val) {
    if (!this._StringService.isEmpty(val)) {
      // let exceptStr = ['..', '///', '/.', '/!', '/@', '/#', '/$', '/^', '/&', '/*', '/(', '/)', '/[', '/]', '/\\', '/<', '/>', '/?', '/;', '/:', '/', '/"', '/{', '/}', '/|', '/_', '/-', '/+', '/=', '/`', '/~'];
      let exceptStr = ['..', '///', '/.', '/!', '/@', '/#', '/$', '/%', '/^', '/&', '/*', '/(', '/)', '/[', '/]', '/\\', '/<', '/>', '/?', '/;', '/:', '/"', '/{', '/}', '/|', '/_', '/-', '/+', '/=', '/`', '/~'];
      if (val.indexOf(' ') == -1 &&
        this.regexURL.test(val.toLowerCase()) &&
        // /https?:\/\/[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]+$/g.test(val.toLowerCase())
        // /https?:\/\/[-\/\\^$*+?.()|[\]{}]/g.test(val.toLowerCase())
        // !/https?:\/\/[!@#%&-\/\\^$*+?.()|[\]{}]/g.test(val.toLowerCase())
        !this.isIn(exceptStr, val.toLowerCase()) &&
        val.split('//').length <= 2
      ) {
        return true;
      }
    }
    return false;
  }
  isIn(arr, val) {
    let result = false;
    arr.forEach(item => {
      if (val.indexOf(item) != -1) {
        result = true;
        return true;
      }
    });
    return result;
  }

  validateBMSFileSize(size) {
    return size < 5000000;
  }

  validateBMSFile(fileName) {
    //accept file type *.png, *.jpg
    let extension = fileName.toLowerCase().substring(fileName.length - 4, fileName.length)
    if (extension === ".png" || extension === ".jpg") {
      return true;
    }
    return false;
  }

  validatePerformanceFileSize(size) {
    return size < 5000000;
  }

  validatePerformanceFile(fileName) {
    let extension = _.split(fileName, '.', 2)[1];
    if (extension === "csv" && fileName.length <= 100) {
      return true;
    }
    return false;
  }

  validatePerformanceExcelFile(fileName) {
    let extension = _.split(fileName, '.', 2)[1];
    if (extension === "xlsx" && fileName.length <= 100) {
      return true;
    }
    return false;
  }

  //radio button
  private isGroupRadioBtn($element) {
    return $element.find('input[type="radio"]').length > 0;
  }
  private getRadioBtns($element) {
    return $element.find('input[type="radio"]');
  }
  public checkRadioBtns($element) {
    let result = false;
    this.getRadioBtns($element).each((index, item) => {
      if (item.checked) {
        result = true;
        return false;
      }
    });
    return result;
  }

  public checkContent(arrClass) {
    return arrClass.some(item => {
      if ($(item).length != 0) {
        let $element = $(item.name || item);
        let tagName = $element.prop('tagName');
        if (tagName != undefined) {
          if (tagName.toLowerCase().indexOf('input') != -1) {
            if (
              this._StringService.isEmpty($element.val().toString()) ||
              (item.isNumber && isNaN(Number($element.val()))) ||
              (item.isEmail && !this.validateEmail($element.val())) ||
              (item.isPhoneNumber && !this.validatePhoneNumber($element.val())) ||
              (item.isPassword && !this.validatePassword($element.val()))
            ) {
              $element.focus();
              return true;
            }
          } else if (tagName.toLowerCase() == 'mat-select') {
            if (this._StringService.isEmpty($element.text())) {
              $element.focus();
              return true;
            }
          } else if (this.isGroupRadioBtn($element)) {
            // console.log('radiogroupo');
            if (!this.checkRadioBtns($element)) {

              if (!$element.hasClass(this.classBoundRadioBtn)) {
                $element.addClass(this.classBoundRadioBtn);
                setTimeout(() => {
                  $element.removeClass(this.classBoundRadioBtn);
                }, 1000);
              }
              return true;
            }
          }
        }
      }
    });
  }

  public compareData(sourceData, newData) {
    if (_.isEqual(sourceData, newData)) {
      return true;
    }
    return false;
  }

  public checkDuplicate(key: string, value: string, array: any[]) {
    let duplicate = false;

    if (array && array.length > 0) {
      for (let item in array) {
        if (array[item][key].toLowerCase() === value.toLowerCase()) {
          duplicate = true;
          break;
        }
      }
    }
    return duplicate;
  }

  /**
   * Check valid for input name
   * @param text 
   * @param required required or not
   */
  checkValidInputName(text, required) {
    //don't accept space
    text = text.trim();
    if (!required) {
      return true;
    } else if (text.length > 0) {
      let regex = /^[a-zA-Z0-9 ".-]+$/;
      return regex.test(text);
    }
    return false;
  }

  /**
   * Check password is valid or not
   * @param text 
   */
  checkValidPassword(text) {
    // text = text.trim();
    //don't accept any space character
    if (text.indexOf(" ") != -1) {
      return false
    }
    //min length 8
    if (text.length > 7) {
      let regex = /^[a-zA-Z0-9 "! @ # $ % ^ & ()]+$/;
      return regex.test(text);
    }
    return false;
  }

  checkKeyInputNumber(configKey) {
    if (
      configKey.keyCode == 187 ||
      configKey.keyCode == 189 ||
      configKey.keyCode == 190
    ) {
      return false;
    }
    return true;
  }
}

@Injectable()
export class ValidateCustomService extends ValidateService {
  public validateEmail(val) {
    // if (this._StringService.isEmpty(val)) {
    //   this._UtilitiesService.showWarning(this.MESSAGE.INPUT_EMAIL);
    //   return false;
    // } else if (!this.regexEmail.test(val)) {
    //   this._UtilitiesService.showWarning(this.MESSAGE.INVALID_EMAIL);
    //   return false;
    // }
    // return true;

    if (this._StringService.isEmpty(val)) {
      this._UtilitiesService.showWarning(this.MESSAGE.INPUT_EMAIL);
      return false;
    } else if (val.indexOf(' ') != -1 || val.indexOf('@') == -1 || val.indexOf('.') == -1 || val[val.lastIndexOf('.') + 1] == undefined) {
      // } else if (!val.match('\\S*\@\\S*\.\\S*')) {
      this._UtilitiesService.showWarning(this.MESSAGE.INVALID_EMAIL);
      return false;
    }
    return true;
  }

  public checkContent(arrClass) {
    return arrClass.some(item => {
      if ($(item).length != 0) {
        let $element = $(item.name || item);
        let tagName = $element.prop('tagName');
        if (tagName != undefined) {
          if (tagName.toLowerCase().indexOf('input') != -1) {
            let val = $element.val().toString();
            if (
              (item.isEmail && !this.validateEmail(val)) ||
              this._StringService.isEmpty(val) ||
              (item.isNumber && isNaN(Number(val))) ||
              (item.isPhoneNumber && !this.validatePhoneNumber(val)) ||
              (item.isPassword && !this.validatePassword(val))
            ) {
              if (item.message != undefined) {
                this._UtilitiesService.showWarning(item.message)
              }
              $element.focus();
              return true;
            }
            //  else {
            //   $element.val(val.trim());
            // }
          } else if (tagName.toLowerCase() == 'mat-select') {
            if (this._StringService.isEmpty($element.text())) {
              $element.focus();
              return true;
            }
          }
        }
      }
    });
  }
}