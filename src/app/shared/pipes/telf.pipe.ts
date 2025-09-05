import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telf',
})
export class TelfPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';
    const str = value.toString();

    if (str.length === 9 && /^\d+$/.test(str)) {
      return str.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    return str;
  }
}
