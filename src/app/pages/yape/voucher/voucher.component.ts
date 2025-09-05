import { Component, ElementRef, ViewChild, Input, Output, EventEmitter, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

import { ConfettiComponent } from '../../../shared/components/confetti/confetti.component';
import { ConstantesGenerales } from '../../../shared/utils/constants';
import { GeneralService } from '../../../services/general.service';
import { SharedService } from '../../../services/shared.service';
import { IMovimiento } from '../../../shared/interfaces/interfaces';
import { Functions as FX } from '../../../shared/utils/functions';

@Component({
  selector: 'app-voucher',
  imports: [CommonModule, RouterModule, ButtonModule, BadgeModule, ConfettiComponent],
  templateUrl: './voucher.component.html',
})
export class VoucherComponent implements OnInit, OnDestroy {
  @ViewChild(ConfettiComponent) confettiComp!: ConfettiComponent;
  @ViewChild('captureRef', { static: false }) captureRef!: ElementRef<HTMLElement>;
  @ViewChild('captureRef2', { static: false }) captureRef2!: ElementRef<HTMLElement>;
  private generalService = inject(GeneralService);
  private sharedService = inject(SharedService);
  private router = inject(Router);

  @Input() data: IMovimiento = null;
  @Input() isMovimiento = false;
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();
  userfreeClient = this.generalService.userfreeClient;
  linkSoporte = this.generalService.linkSoporte;
  linkImage = 'banner.webp';
  yape: IMovimiento = null;
  showConfetti = false;
  showBanner = true;
  autoPayment = false;

  ngOnInit(): void {
    this.generalService.loadIcon();
    this.generalService.updateThemeColorYape(true);

    this.yape = {
      titular: this.data.titular,
      celular: this.data.celular,
      monto: this.data.monto,
      mensaje: this.data.mensaje,
      destino: this.data.destino ?? 'Yape',
      operacion: this.data.operacion,
      recarga: this.data.recarga,
      date: FX.buildDateYape(this.data.fecha),
      payment: this.data.payment,
      showphone: this.data.showphone,
    };

    this.generalService.banners.subscribe((array) => {
      if (array && array.length > 0) {
        const bannerId = this.generalService.settings?.banner;
        const index = Math.floor(Math.random() * array.length);
        const select = bannerId ? array.find((b) => b.id === bannerId) : array[index];
        this.linkImage = select?.img || array[index].img;
      }
    });

    if (this.data?.payment) {
      this.autoPayment = true;
    }

    if (!this.isMovimiento) {
      this.showYapeAnimate = true;
    }

    if (this.generalService.settings) {
      const { showConfetti, showBanner, confetti } = this.generalService.settings;

      this.showConfetti = showConfetti;
      this.showBanner = showBanner;

      setTimeout(() => {
        if (this.confettiComp) {
          this.confettiComp.numConfetti = confetti ?? 1;
          this.confettiComp.onDispatch();
        }
      }, 100);
    }
  }

  ngOnDestroy(): void {
    this.generalService.updateThemeColorYape(false);
  }

  hiddenElements = false;
  showYapeAnimate = false;
  onCompartir() {
    const divElement = this.isMovimiento ? this.captureRef2.nativeElement : this.captureRef.nativeElement;

    if (this.isMovimiento) {
      this.hiddenElements = true;
      setTimeout(() => {
        this.sharedService.onShared(divElement);
        this.hiddenElements = false;
      }, 10);
    } else {
      this.showYapeAnimate = false;
      setTimeout(() => {
        this.sharedService.onShared(divElement);
        this.showYapeAnimate = true;
      }, 10);
    }
  }

  onYapearDenuevo() {
    const newYape = {
      celular: this.yape.celular,
      titular: this.yape.titular,
      recarga: this.yape.recarga,
      destino: this.yape.destino,
    };

    this.router.navigate(['/payment'], {
      queryParams: {
        number: newYape.celular,
        titular: newYape.titular,
        recharge: newYape.recarga,
        destino: newYape.destino,
      },
    });
  }

  onCerrar() {
    if (this.isMovimiento) {
      this.cerrar.emit(true);
      return;
    }

    this.router.navigateByUrl('/home');
  }

  get mostrarCelular(): boolean {
    return this.yape.showphone !== undefined ? this.yape.showphone : this.esBilletera;
  }

  get celular(): string | null {
    if (!this.yape.celular) return null;

    if (this.esRecarga) {
      return this.yape.celular.replace(/(\d{3})(?=\d)/g, '$1 ');
    }

    const last3 = this.yape.celular.slice(-3);
    return /^\d{3}$/.test(last3) ? `*** *** ${last3}` : null;
  }

  get monto(): string {
    return FX.formatPrice(this.yape.monto);
  }

  get codigo(): string[] {
    if (!this.yape?.operacion || this.yape.operacion.length < 3) {
      return ['0', '0', '0'];
    }
    return this.yape.operacion.slice(-3).split('');
  }

  get operacion(): string {
    const { destino, operacion } = this.yape;
    return destino != 'Izipay' ? operacion : operacion.padStart(20, '0');
  }

  get esBilletera(): boolean {
    return this.generalService.esBilletera(this.yape.destino);
  }

  get esRecarga(): boolean {
    return this.yape.recarga ?? false;
  }
}
