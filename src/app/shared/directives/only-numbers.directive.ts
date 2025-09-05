import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[onlyNumbers]',
})
export class OnlyNumbersDirective {
  @HostListener('input', ['$event']) onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }
}
