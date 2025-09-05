import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ICuenta } from '../../../../shared/interfaces/interfaces';
import { getErrorMessage } from '../../../../shared/utils/validator';

@Component({
  selector: 'app-update',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update.component.html',
})
export class UpdateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private config = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);

  Form = this.fb.group({
    id: new FormControl(0),
    nombre: new FormControl('', Validators.required),
    nrocuenta: new FormControl('', [Validators.required, Validators.minLength(4)]),
    cci: new FormControl(''),
    saldo: new FormControl(0),
    moneda: new FormControl('PEN'),
    order: new FormControl(null),
  });

  ngOnInit(): void {
    if (this.config.data) {
      this.Form.patchValue(this.config.data);
    }
  }

  onGuardar() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return;
    }

    const dataform = this.Form.getRawValue();

    const account: ICuenta = {
      id: dataform.id,
      saldo: dataform.saldo ?? 0,
      nombre: dataform.nombre?.trim() ?? '',
      nrocuenta: dataform.nrocuenta?.trim() ?? '',
      cci: dataform.cci.trim() ?? '',
      moneda: dataform.moneda,
      order: dataform.order,
    };

    this.dialogRef.close(account);
  }

  public message: { [key: string]: string } = {};
  onValidateForm(name: string) {
    const input = (this.Form.controls as any)[name];
    if (input?.errors && input?.touched) {
      this.message[name] = getErrorMessage(this.Form, name);
      return this.message[name];
    } else {
      this.message[name] = '';
      return '';
    }
  }
}
