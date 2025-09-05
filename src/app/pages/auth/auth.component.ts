import { CommonModule } from '@angular/common';
import { BehaviorSubject, delay, interval, map, Subscription, take, takeWhile } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Component, inject, isDevMode, NgZone, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { Router } from '@angular/router';

import { PwaInstallService } from '../../services/pwa.service';
import { GeneralService } from '../../services/general.service';
import { ITeclado } from '../../shared/interfaces/interfaces';
import { ConstantesGenerales } from '../../shared/utils/constants';
import { PrimeNGModule } from '../../shared/prime-ng/prime-ng.module';

import { RegisterComponent } from './register/register.component';
import { InstallerComponent } from '../../shared/components/installer/installer.component';
import { IncompatibleComponent } from '../../shared/components/incompatible/incompatible.component';
import { SuggestionComponent } from '../../shared/components/suggestion/suggestion.component';
import { ResellersComponent } from '../../shared/components/resellers/resellers.component';
import { TutorialComponent } from '../../shared/components/tutorial/tutorial.component';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, PrimeNGModule, RegisterComponent, InstallerComponent, IncompatibleComponent, SuggestionComponent, ResellersComponent],
  templateUrl: './auth.component.html',
})
export class AuthComponent implements OnInit {
  private pwaInstallService = inject(PwaInstallService);
  private generalService = inject(GeneralService);
  private dialogService = inject(DialogService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  teclado: ITeclado[] = [];
  pin: number[] = [];

  loading = false;
  loadingFailed = false;

  showPrompt = false;
  showLogin = false;
  showRecover = false;
  showIncompatibleBrowser = false;
  showInstallSuggestion = false;
  currentUrl = window.location.href;

  linkSoporte = ConstantesGenerales.YAPE_INFO;
  message = ConstantesGenerales.MENSAJE;
  videoUrl: SafeResourceUrl;

  ngOnInit() {
    this.onObtenerVideo();
    this.generarTeclado();

    if (this.pwaInstallService.isInAppBrowser()) {
      this.showIncompatibleBrowser = true;
      return;
    }

    const isStandalone = this.pwaInstallService.isStandaloneMode();

    if (isStandalone) {
      if (!this.verify) {
        this.onMostrarAlerta(false);
      }
    } else {
      this.pwaInstallService.waitForInstallPrompt().subscribe((available) => {
        this.ngZone.run(() => {
          this.showPrompt = available;
          this.showInstallSuggestion = !available && !isDevMode();
        });
      });
    }

    if (this.verify) {
      this.showLogin = true;
    } else {
      localStorage.removeItem('advertencia');
    }

    if (this.advertencia) {
      this.entendidoTimer = 0;
      clearInterval(this.entendidoInterval);
    }

    this.pwaInstallService.acceptedInstallation.subscribe((resp) => {
      if (resp) {
        window.location.reload();
      }
    });
  }

  entendidoTimer = 0;
  entendidoInterval: any;
  onMostrarAlerta(available: boolean) {
    if (!available) {
      this.showAyuda = true;
      this.startEntendidoTimer();
    }
  }

  startEntendidoTimer() {
    this.entendidoTimer = 10;
    this.entendidoInterval = setInterval(() => {
      this.entendidoTimer--;
      if (this.entendidoTimer === 0) {
        clearInterval(this.entendidoInterval);
      }
    }, 1000);
  }

  onEntendido() {
    this.showAyuda = false;
    localStorage.setItem('advertencia', 'true');
    clearInterval(this.entendidoInterval);
  }

  onObtenerVideo() {
    const shortId = 'U3MjtQ7i2Gg';
    const urlYT = 'https://www.youtube.com';
    this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${urlYT}/embed/${shortId}?playlist=${shortId}&loop=1&autoplay=1&mute=1`);
  }

  generarTeclado() {
    const numeros = this.shuffleArray(Array.from({ length: 10 }, (_, i) => i));
    this.teclado = new Array(12).fill(null);

    const posicionesNumeros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
    posicionesNumeros.forEach((item, i) => {
      this.teclado[item] = { tipo: 'numero', valor: numeros[i] };
    });

    this.teclado[9] = { tipo: 'huella' };
    this.teclado[11] = { tipo: 'borrar' };
  }

  shuffleArray<T>(array: T[]): T[] {
    return array
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  onClick(item: ITeclado) {
    if (item.tipo === 'numero') {
      if (this.pin.length < 6) {
        this.pin.push(item.valor);
        if (this.pin.length === 6) {
          const pin = this.pin.join('');

          if (pin === '000000') {
            localStorage.removeItem('verify');
            localStorage.removeItem('email');
            this.showLogin = false;
            return;
          }

          this.onLogin(pin);
        }
      }
    } else if (item.tipo === 'borrar') {
      this.pin.pop();
    }
  }

  retryAt = 0;
  errorMsg = '';
  errorCode = '';
  onLogin(pin: string) {
    this.loading = true;

    const obs = this.email ? this.generalService.onLoginClient({ pin, email: this.email }) : this.generalService.onLogin(pin);

    obs.subscribe({
      next: (resp) => {
        this.loading = false;
        if (resp.status) {
          localStorage.removeItem('UserBanned');
          localStorage.setItem('verify', 'true');
          localStorage.setItem('token', resp.token);
          this.generalService.setValuesProfile();
          this.router.navigateByUrl('/home');
        }
      },
      error: (err) => {
        this.pin = [];
        this.loading = false;
        this.loadingFailed = true;

        this.errorMsg = err.error?.msg ?? '!Ocurrio un error con la conexión!';
        this.errorCode = err?.error?.code || 'SERVER_ERROR';
        this.retryAt = err?.error?.retryAt ?? null;

        if (this.errorCode === 'SESSION_ACTIVE' && this.retryAt) {
          this.iniciarCountdown(this.retryAt);
        }
      },
    });
  }

  get advertencia() {
    return JSON.parse(localStorage.getItem('advertencia') || 'false');
  }

  get verify() {
    return JSON.parse(localStorage.getItem('verify') || 'false');
  }

  get email(): string {
    return localStorage.getItem('email') ?? null;
  }

  get datos(): any {
    return localStorage.getItem('datos') ?? null;
  }

  showAyuda = false;
  onAyuda() {
    this.showAyuda = true;
  }

  recover = new FormControl(this.email, [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@(gmail|hotmail|outlook)\.com$/)]);
  onRecover() {
    this.showRecover = true;
  }

  loadButton = false;
  onSendRecover() {
    if (this.recover.invalid) {
      this.recover.markAsTouched();
      return;
    }

    this.loadButton = true;
    this.generalService
      .recoverPin({ email: this.recover.value })
      .pipe(delay(1000))
      .subscribe({
        next: (res) => {
          this.loadButton = false;
          this.loadingFailed = true;
          this.showRecover = false;
          this.errorMsg = res.msg;
        },
        error: (err) => {
          this.loadButton = false;
          this.loadingFailed = true;
          this.errorMsg = err.error?.msg;
        },
      });
  }

  hasError(error: string): boolean {
    const control = this.recover;
    return !!(control && control.touched && control.hasError(error));
  }

  onRegister() {
    this.showLogin = false;
    this.showRecover = false;
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

  getButtonStyles(tipo: string) {
    return {
      'background-color': tipo === 'numero' ? '#EDECF2' : 'transparent',
      color: tipo === 'numero' ? '#2C2044' : '#6C6C6C',
    };
  }

  countdown$ = new BehaviorSubject<string>('00:00');
  private countdownSub?: Subscription;

  iniciarCountdown(retryTimestamp: number) {
    const msInicial = retryTimestamp - Date.now();
    const totalSec = Math.floor(msInicial / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    this.countdown$.next(`${this.pad(min)}:${this.pad(sec)}`);

    this.countdownSub?.unsubscribe();
    this.countdownSub = interval(1000)
      .pipe(
        map(() => retryTimestamp - Date.now()),
        takeWhile((ms) => ms > 0),
        map((ms) => {
          const totalSec = Math.floor(ms / 1000);
          const min = Math.floor(totalSec / 60);
          const sec = totalSec % 60;
          return `${this.pad(min)}:${this.pad(sec)}`;
        })
      )
      .subscribe(this.countdown$);
  }

  pad(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
  }

  onCloseDialog() {
    this.countdownSub?.unsubscribe();
    this.countdown$.next('00:00');
  }
}
