import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CodeInputModule } from 'angular-code-input';
import { ButtonModule } from 'primeng/button';
import { delay } from 'rxjs';

import { GeneralService } from '../../../services/general.service';
import { SwalService } from '../../../services/swal.service';

@Component({
  selector: 'app-migrate-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CodeInputModule, ProgressSpinnerModule],
  templateUrl: './migrate-email.component.html',
})
export class MigrateEmailComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private generalService = inject(GeneralService);
  private swal = inject(SwalService);
  private profile = this.generalService.profile.getValue();

  // Formulario de verificación de email
  Form: FormGroup = this.fb.group({
    titular: [this.profile.titular, Validators.required],
    email: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.com$/)]],
  });

  // Estados de flujo
  verifyEmail = true;
  verifyCode = false;
  codeValidated = false;
  pinSetup = false;
  finalizando = false;
  finalizado = false;

  // Carga y código
  loading = false;
  loadVerify = false;

  // Control de PIN
  pin: string = '';
  repeat: string = '';
  resetRepeat = false;
  pasoPin: 'primero' | 'repite' = 'primero';

  verificarEmail() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const dataform = this.Form.getRawValue();
    this.generalService.verifySend(dataform).subscribe({
      next: (resp) => {
        this.loading = false;
        if (!resp.status) {
          this.swal.onNotificar(resp.msg);
          return;
        }

        this.verifyEmail = false;
        this.verifyCode = true;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  codeError = false;
  resetCodeInput = false;
  onCodeCompleted(code: string) {
    this.loadVerify = true;
    this.codeError = false;

    const email = this.Form.get('email')?.value;

    this.generalService
      .verifyEmail({ email, code })
      .pipe(delay(1000))
      .subscribe({
        next: (resp) => {
          this.loadVerify = false;

          if (!resp.status) {
            this.codeError = true;
            this.resetCodeInput = true;

            setTimeout(() => {
              this.resetCodeInput = false;
            }, 0);

            return;
          }

          this.verifyCode = false;
          this.codeValidated = true;

          setTimeout(() => {
            this.codeValidated = false;
            this.pinSetup = true;
          }, 1500);
        },
        error: () => {
          this.loadVerify = false;
          this.codeError = true;
        },
      });
  }

  onPinEntered(pin: string) {
    this.pin = pin;
    this.pasoPin = 'repite';
  }

  pinError = false;
  onRepeatPinEntered(repeat: string) {
    this.repeat = repeat;

    if (this.pin !== this.repeat) {
      this.pinError = true;

      setTimeout(() => {
        this.pinError = false;
        this.pin = '';
        this.repeat = '';
        this.pasoPin = 'primero';
      }, 2000);

      return;
    }

    this.pinSetup = false;
    this.finalizando = true;
    const { email, titular } = this.Form.getRawValue();
    this.generalService
      .migrateUser({ email, titular, pin: this.pin })
      .pipe(delay(1000))
      .subscribe({
        next: (resp) => {
          this.finalizando = false;
          this.finalizado = resp.status;
        },
        error: () => {
          this.pinError = true;
          this.dialogRef.close(false);
        },
      });
  }

  cerrarProceso() {
    this.dialogRef.close(this.email);
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.Form.get(controlName);
    return !!(control && control.touched && control.hasError(error));
  }

  get email() {
    return this.Form.get('email')?.value;
  }
}
