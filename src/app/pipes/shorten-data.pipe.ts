import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ShortenData'
})
export class ShortenDataPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    if(value) {
      if (value.length > 20) {
        return value.substr(0, 20) + '...';
      } else {
        return value;
      }
    }
  }
}
