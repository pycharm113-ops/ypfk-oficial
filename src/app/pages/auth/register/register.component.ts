import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CodeInputModule } from 'angular-code-input';

import { GeneralService } from '../../../services/general.service';
import { SwalService } from '../../../services/swal.service';
import { ConstantesGenerales } from '../../../shared/utils/constants';
import { ITeclado } from '../../../shared/interfaces/interfaces';
import { TutorialComponent } from '../../../shared/components/tutorial/tutorial.component';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DialogModule, CarouselModule, ButtonModule, MessageModule, CodeInputModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() login: EventEmitter<string> = new EventEmitter<string>();

  private generalService = inject(GeneralService);
  private dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private swal = inject(SwalService);
  private fb = inject(FormBuilder);

  images = [
    {
      img: 'auth/1.webp',
      title: 'Instala la APP en segundos',
      description: 'Click a los tres puntos y selecciona<br><strong>“Agregar a pantalla de inicio”</strong>',
    },
    {
      img: 'auth/2.webp',
      title: 'Disponible para Android/iOS',
      description: 'Accede desde cualquier dispositivo<br> es totalmente compatible',
    },
    {
      img: 'auth/3.webp',
      title: 'Actualizaciones constantes',
      description: 'Siempre tendrás la última versión<br> sin tener que volver a instalar',
    },
  ];

  ngOnInit(): void {
    this.generarTeclado();
    this.onQueryParams();
  }

  Form = this.fb.group({
    titular: [null, Validators.required],
    email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.com$/)]],
    phone: [null, [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
  });

  pin = new FormControl(null, [Validators.required, Validators.pattern(/^[0-9]{6}$/)]);
  linkSoporte = ConstantesGenerales.YAPE_SOPORTE;
  isMigrate = false;

  slide = 0;
  onRegistrar() {
    this.slide = 1;
  }

  onQueryParams() {
    this.route.queryParams.subscribe((params) => {
      const email = params['email'];
      if (email) {
        this.slide = 2;
        this.isMigrate = true;
        this.Form.get('email').setValue(email);
      }
    });
  }

  loading = false;
  loadButton = false;
  onGrabar() {
    if (this.Form.invalid) {
      this.Form.markAllAsTouched();
      return;
    }

    const dataform = this.Form.getRawValue();
    this.loadButton = true;
    this.generalService.onRegister(dataform).subscribe({
      next: (resp) => {
        this.loadButton = false;
        if (resp.status) {
          this.phone = resp.phone;
          this.slide = 3;
        } else {
          this.swal.onNotificar(resp.msg);
        }
      },
      error: (err) => {
        this.loadButton = false;
        this.swal.onNotificar(err.error?.msg ?? 'Ocurrio un error de conexión.');
      },
    });
  }

  onIngresar() {
    if (this.userFree) {
      if (this.Form.get('email').invalid) {
        this.Form.get('email').markAsTouched();
        return;
      }

      this.verifyClient(this.email);
    } else {
      if (this.pin.invalid) {
        this.pin.markAsTouched();
        return;
      }

      localStorage.removeItem('email');
      this.login.emit(this.pin.value);
      this.pin.reset();
    }
  }

  phone = '';
  verifyClient(email: string) {
    this.loadButton = true;
    this.generalService.verifyClient(email).subscribe({
      next: (resp) => {
        this.loadButton = false;
        if (resp.status) {
          this.onSuccesClient();
        } else {
          this.phone = resp.phone;
          this.slide = 3;
        }
      },
      error: (err) => {
        this.loadButton = false;
        this.swal.onNotificar(err.error?.msg ?? 'Ocurrio un error de conexión.');
      },
    });
  }

  onVerifyCode(data: any) {
    this.loading = true;
    this.generalService.verifyCode(data).subscribe({
      next: (resp) => {
        setTimeout(() => {
          this.loading = false;
          if (resp.status) {
            this.slide = 4;
          } else {
            this.swal.onNotificar(resp.msg);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.swal.onNotificar(err.error?.msg ?? 'Ocurrio un error de conexión.');
      },
    });
  }

  onCrearPIN(data: any) {
    this.loading = true;
    this.generalService.onCrearPIN(data).subscribe({
      next: (resp) => {
        setTimeout(() => {
          this.loading = false;
          if (resp.status) {
            this.onSuccesClient();
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.swal.onNotificar(err.error?.msg ?? 'Ocurrio un error de conexión.');
      },
    });
  }

  onSuccesClient() {
    localStorage.setItem('email', this.email);
    localStorage.setItem('verify', 'true');
    location.reload();
  }

  get email() {
    return this.Form.get('email')?.value;
  }

  get phoneMask(): string {
    if (!this.phone || this.phone.length < 9) return this.phone;
    return '+51' + this.phone.substring(0, 3) + '***' + this.phone.substring(this.phone.length - 3);
  }

  get emailMask(): string {
    if (!this.email) return '';
    const [user, domain] = this.email.split('@');
    const visibleLength = Math.min(4, user.length);
    const visibleUser = user.substring(0, visibleLength);
    const maskedUser = visibleUser + '*'.repeat(Math.max(user.length - visibleLength, 1));
    return `${maskedUser}@${domain}`;
  }

  onBack() {
    this.Form.reset();
    this.pin.reset();
    this.userFree = true;
    this.slide = 0;
  }

  userFree = true;
  onChangeTypeUser() {
    this.userFree = !this.userFree;
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.Form.get(controlName);
    return !!(control && control.touched && control.hasError(error));
  }

  hasErrorPin(error: string): boolean {
    const control = this.pin;
    return !!(control && control.touched && control.hasError(error));
  }

  onlyNumbers(event: KeyboardEvent): void {
    const charCode = event.key;
    if (!/^\d$/.test(charCode)) {
      event.preventDefault();
    }
  }

  // CONDIGO VERIFICACION
  onCodeCompleted(code: string) {
    if (code) {
      this.loading = true;
      const dataform = { email: this.email, code };
      this.onVerifyCode(dataform);
    }
  }

  //TECLADO
  teclado: ITeclado[] = [];
  pinTeclado: number[] = [];

  generarTeclado() {
    const numeros = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
    this.teclado = new Array(12).fill(null);

    const posicionesNumeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
    posicionesNumeros.forEach((pos, i) => {
      this.teclado[pos] = { tipo: 'numero', valor: numeros[i] };
    });

    this.teclado[9] = { tipo: 'huella' };
    this.teclado[11] = { tipo: 'borrar' };
  }

  primerPIN: string | null = null;
  faseRepeticion: boolean = false;
  mensajeClave: string = 'Ingresa tu clave Yape';
  onClick(item: ITeclado) {
    if (item.tipo === 'numero') {
      if (this.pinTeclado.length < 6) {
        this.pinTeclado.push(item.valor);

        if (this.pinTeclado.length === 6) {
          const pinActual = this.pinTeclado.join('');

          if (pinActual === '000000') {
            this.pinTeclado = [];
            this.primerPIN = null;
            this.faseRepeticion = false;
            this.swal.onNotificar('No se permite usar "000000" como clave.');
            this.mensajeClave = 'Ingresa tu clave Yape';
            return;
          }

          if (!this.faseRepeticion) {
            // Guardar el primer PIN y pasar a la fase de repetición
            this.primerPIN = pinActual;
            this.faseRepeticion = true;
            setTimeout(() => {
              this.mensajeClave = 'Repite tu clave Yape';
              this.pinTeclado = [];
            }, 500);
          } else {
            // Comparar con el primer PIN
            if (this.primerPIN === pinActual) {
              this.onCrearPIN({ email: this.email, pin: pinActual });
            } else {
              // Reiniciar todo si no coinciden
              this.primerPIN = null;
              this.faseRepeticion = false;
              setTimeout(() => {
                this.swal.onNotificar('Los PIN no coinciden. Inténtalo de nuevo.');
                this.mensajeClave = 'Ingresa tu clave Yape';
                this.pinTeclado = [];
              }, 500);
            }
          }
        }
      }
    } else if (item.tipo === 'borrar') {
      this.pinTeclado.pop();
    }
  }

  onVerTutorial(tipo: string): void {
    this.dialogService.open(TutorialComponent, {
      modal: true,
      dismissableMask: true,
      focusOnShow: false,
      showHeader: false,
      styleClass: 'content-plyr',
      width: '17.5rem',
      data: tipo,
    });
  }
}
