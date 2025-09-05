import { Directive, HostListener, ElementRef } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[copyPaste]',
})
export class CopyPasteDirective {
  constructor(private el: ElementRef, private control: NgControl) {}

  private sanitizePhone(value: string): string {
    let onlyNumbers = value.replace(/[^0-9]/g, '');

    if (onlyNumbers.startsWith('51') && onlyNumbers.length > 9) {
      onlyNumbers = onlyNumbers.substring(2);
    }

    return onlyNumbers;
  }

  @HostListener('input', ['$event']) onInputChange(event: Event) {
    const initialValue = this.el.nativeElement.value;
    const numericValue = this.sanitizePhone(initialValue);

    if (initialValue !== numericValue) {
      this.control.control?.setValue(numericValue, { emitEvent: false });
      event.stopPropagation();
    }
  }

  @HostListener('paste', ['$event']) onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData;
    const pastedText = clipboardData?.getData('text/plain') || '';
    const sanitized = this.sanitizePhone(pastedText);

    const currentValue = this.el.nativeElement.value;
    const selectionStart = this.el.nativeElement.selectionStart;
    const selectionEnd = this.el.nativeElement.selectionEnd;

    const newValue = currentValue.substring(0, selectionStart) + sanitized + currentValue.substring(selectionEnd);

    this.control.control?.setValue(newValue, { emitEvent: true });
  }

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    // Permitir teclas de control: backspace, delete, tab, escape, enter, flechas
    if (
      [46, 8, 9, 27, 13, 110, 190].indexOf(event.keyCode) !== -1 ||
      (event.keyCode === 65 && event.ctrlKey === true) || // Ctrl+A
      (event.keyCode === 67 && event.ctrlKey === true) || // Ctrl+C
      (event.keyCode === 86 && event.ctrlKey === true) || // Ctrl+V
      (event.keyCode === 88 && event.ctrlKey === true) || // Ctrl+X
      (event.keyCode >= 35 && event.keyCode <= 39)
    ) {
      return;
    }

    // Asegurar que es un número
    if ((event.shiftKey || event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }
  }
}
