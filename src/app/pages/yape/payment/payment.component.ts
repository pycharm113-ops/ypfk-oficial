import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';

import { VoucherComponent } from '../voucher/voucher.component';
import { ConstantesGenerales } from '../../../shared/utils/constants';
import { PrimeNGModule } from '../../../shared/prime-ng/prime-ng.module';
import { IMovimiento } from '../../../shared/interfaces/interfaces';
import { GeneralService } from '../../../services/general.service';
import { Functions as FX } from '../../../shared/utils/functions';
import { OnlyNumbersDirective } from '../../../shared/directives/only-numbers.directive';
import { TelfPipe } from '../../../shared/pipes/telf.pipe';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, PrimeNGModule, TelfPipe, OnlyNumbersDirective, VoucherComponent],
  providers: [DatePipe],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private generalService = inject(GeneralService);
  private readonly formatoFecha = inject(DatePipe);
  private deviceService = inject(DeviceDetectorService);
  private cdRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private subscription = new Subscription();

  titulares = ConstantesGenerales.ARRAY_TITULARES;
  operadoras = ConstantesGenerales.ARRAY_OPERADORAS;
  destinos = ConstantesGenerales.ARRAY_DESTINOS;
  montos = ConstantesGenerales.ARRAY_RECARGAS;

  loadTitular = true;
  isFocused = false;
  isRecharge = false;
  fromTouring = false;
  fromVistaHome = false;
  fromScanner = false;
  allowMore500 = false;
  allowChangeDate = false;
  autoPayment = false;

  titular: string = '';
  monto: number = 0;
  montoMask: string = '0.00';
  mensaje: string = '';
  celular: string = '';
  lastDigits: string = '';
  destino: string = 'Yape';
  operacion: string = '';
  showphone: boolean = true;

  ngOnInit(): void {
    this.titulares = [...this.titulares, ...this.generalService.titulares.getValue()];
    const params = this.route.snapshot.queryParamMap;
    this.destino = params.get('destino') || 'Yape';
    this.celular = params.get('number') || '***';
    this.lastDigits = this.celular.slice(-3);

    const titularFromParams = params.get('titular');
    this.fromVistaHome = !!titularFromParams;
    this.titular = titularFromParams || this.onSearch(this.celular);

    this.fromScanner = params.get('scanner') === 'true';
    this.fromTouring = params.get('touring') === 'true';
    this.isRecharge = params.get('recharge') === 'true';

    // Si es Scanner
    if (this.fromScanner) {
      if (this.titular === 'Yape') {
        this.lastDigits = '';
        this.destino = 'Yape';
      } else {
        if (this.destino === 'Yape') {
          this.titular = this.titular;
          this.lastDigits = this.celular.slice(-3);
        } else {
          this.titular = `Izi*${this.titular.toLowerCase()}`;
          this.destino = 'Izipay';
          this.celular = null;
          this.lastDigits = '';
        }
      }
    }

    // Si es Touring
    if (this.fromTouring) {
      this.titular = 'Nombre de la Persona';
      this.celular = '999999999';
      this.lastDigits = '999';
      this.monto = 100;
      this.amount.setValue(100);
    }

    // Si es Recarga
    if (this.isRecharge) {
      this.titular = this.titular !== '***' ? this.titular : 'Nuevo número';
      this.celular = this.celular !== '***' ? this.celular : '999999999';
    }

    // Configuración General
    const settings = this.generalService.settings;
    if (settings) {
      this.allowMore500 = settings.allowMore500;
      this.allowChangeDate = settings.allowChangeDate;
      this.autoPayment = settings.autoPayment;
    }

    // Suscripción Touring
    this.subscription = this.generalService.onDispatchTour.subscribe((value) => {
      if (value) {
        this.allowChangeDate = false;
        this.onYapear();
      }
    });

    setTimeout(() => {
      this.loadTitular = false;
    }, 500);
  }

  amount = new FormControl(0);
  ngAfterViewInit() {
    const inputEl = document.getElementById('montoInput') as HTMLInputElement;

    const ajustarAncho = (valor: string | number) => {
      const str = valor?.toString() || '0';
      const length = Math.max(str.length, 1);
      inputEl?.style.setProperty('width', `${length * 35}px`, 'important');
      this.monto = +str;
    };

    this.amount.valueChanges.subscribe(ajustarAncho);
    ajustarAncho(this.amount.value);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.generalService.onDispatchTour.next(false);
  }

  onSearch(number: string): string {
    const x = this.titulares.find((x) => x.celular === number);
    this.destino = x?.destino ?? 'Yape';
    return x ? x.titular : number;
  }

  decimalLocale = 'en-US';
  onDetectLocale() {
    const os = (this.deviceService.os || '').toLowerCase();
    const ua = (navigator.userAgent || '').toLowerCase();
    const isTouchMac = os.includes('mac') && 'ontouchend' in document;
    const isiOS = os.includes('ios') || /iphone|ipad|ipod/i.test(ua) || isTouchMac;

    if (isiOS && navigator.language.startsWith('es')) {
      this.decimalLocale = 'es-PE';
    }
  }

  data: IMovimiento = null;
  loading = false;
  showCaptura = false;

  modalChangeDate = false;
  newDate = new FormControl(null, Validators.required);
  disabledChangeDate = new FormControl(false);

  onPreYapear() {
    if (this.allowChangeDate) {
      this.newDate.setValue(new Date());
      this.disabledChangeDate.setValue(false);
      this.modalChangeDate = true;
    } else {
      this.onYapear();
    }
  }

  onYapear() {
    const fecha = this.allowChangeDate ? this.newDate.value : new Date();
    const numOperacion = this.fxGenerarNumOperacion();

    this.data = {
      titular: this.titular,
      celular: this.isRecharge ? this.celular : this.lastDigits ? this.fxGenerarCelular(this.lastDigits) : null,
      monto: this.monto,
      mensaje: this.mensaje,
      destino: this.destino,
      fecha: this.fxGenerarFecha(fecha),
      operacion: this.destino !== 'Izipay' ? numOperacion : numOperacion.padStart(20, '0'),
      recarga: this.isRecharge,
      payment: this.autoPayment,
      showphone: this.showphone,
    };

    if (!this.fromTouring) {
      this.onRefreshBehavior();
    }

    this.loading = true;
    this.modalOtrosBancos = false;
    this.modalChangeDate = false;
    this.onRefreshSettings();
    setTimeout(() => {
      this.loading = false;
      this.showCaptura = true;
    }, 1000);
  }

  onRefreshBehavior() {
    const { titular, saldo } = this.generalService.profile.getValue();
    const newProfile = { titular, saldo: Math.max(saldo - this.data.monto, 0) };
    this.generalService.profile.next(newProfile);
    localStorage.setItem('datos', JSON.stringify(newProfile));

    const newArray = [...this.generalService.movimientos.getValue(), this.data];
    this.generalService.movimientos.next(newArray);
    localStorage.setItem('movimientos', JSON.stringify(newArray));
  }

  onRefreshSettings(): void {
    if (this.allowChangeDate && this.disabledChangeDate.value) {
      const newSettings = { ...this.generalService.settings, allowChangeDate: false };
      localStorage.setItem('settings', JSON.stringify(newSettings));
      this.generalService.settings = newSettings;
    }
  }

  onRetornar() {
    this.showCaptura = false;
  }

  onCerrar() {
    if (this.isRecharge && this.isChooseOperator) {
      this.isChooseOperator = false;
      return;
    }

    if (this.isRecharge) {
      this.router.navigateByUrl('/config');
      return;
    }

    if (this.showOtrosBancos) {
      this.showOtrosBancos = false;
      this.destino = 'Yape';
      this.showphone = true;
      return;
    }

    const ruta = this.fromVistaHome ? '/home' : '/search';
    this.router.navigateByUrl(ruta);
  }

  modalOtrosBancos = false;
  showOtrosBancos = false;
  onOtrosBancos() {
    this.showOtrosBancos = true;
    this.montoMask = String(this.monto.toFixed(2));
  }

  onPagarOtroBancos(banco: string) {
    this.modalOtrosBancos = true;
    this.destino = banco === 'BBVA' ? 'BBVA Perú' : banco;
    this.showphone = this.generalService.esBilletera(banco);
  }

  isChooseOperator = false;
  onPagarOperadora(operadora: string) {
    this.isChooseOperator = true;
    this.destino = operadora;
  }

  onSelectAmount(monto: number) {
    this.monto = monto;
  }

  fxGenerarCelular(celular: string) {
    const filterPadded = celular.padStart(3, '0');
    if (this.celular.length < 3) return filterPadded;
    return this.celular.slice(0, -3) + filterPadded;
  }

  fxGenerarNumOperacion(): string {
    let numero: string;
    do {
      numero = (Math.floor(Math.random() * 90000000) + 10000000).toString();
    } while (numero.startsWith('9'));
    return numero;
  }

  fxGenerarFecha(fecha: Date): string | null {
    return this.formatoFecha.transform(fecha, ConstantesGenerales._FORMATO_FECHA_GRABAR);
  }

  updateAmount(event: Event) {
    const input = event.target as HTMLElement;
    const selection = window.getSelection();
    const range = selection && selection.getRangeAt(0);
    const cursorPosition = range?.startOffset ?? 0;

    const { valid, value } = FX.parseMontoInput(input.textContent, this.monto);

    if (!valid) {
      input.textContent = this.monto.toFixed(2);
      this.cdRef.detectChanges();
      FX.restoreCursor(input, cursorPosition);
      return;
    }

    const formattedValue = +value.toFixed(2);
    this.monto = formattedValue;
    input.textContent = formattedValue.toFixed(2);

    this.cdRef.detectChanges();
    FX.restoreCursor(input, cursorPosition);
  }

  updateTitular(event: Event) {
    this.titular = (event.target as HTMLElement).innerText || '';
  }

  updateMonto(event: Event) {
    const value = (event.target as HTMLElement).innerText || '0';
    this.monto = Number(value.replace(/[^0-9.]/g, '')); // solo números y punto decimal
  }

  updateDestino(event: Event) {
    this.destino = (event.target as HTMLElement).innerText || '';
  }

  autoGrow(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  get disabledButton() {
    if (this.allowMore500) {
      return this.monto === 0;
    } else {
      return this.monto === 0 || this.monto > 500;
    }
  }

  get dangerText() {
    if (this.allowMore500) {
      return this.monto === -1;
    } else {
      return this.monto > 500;
    }
  }
}
