import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { BcpService } from '../../../services/bcp.service';
import { SharedService } from '../../.././services/shared.service';
import { Functions as FX } from '../../../shared/utils/functions';
import { ICuenta, IMovimientoBcp } from '../../../shared/interfaces/interfaces';

@Component({
  selector: 'app-voucher',
  imports: [CommonModule],
  templateUrl: './voucher.component.html',
})
export class VoucherComponent implements OnInit {
  private bcpService = inject(BcpService);
  private sharedService = inject(SharedService);
  private router = inject(Router);

  @Input() data: IMovimientoBcp = null;
  @Input() isFromAccount: boolean = false;
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();
  account: ICuenta = null;
  circles = new Array(15);

  ngOnInit(): void {
    this.account = this.bcpService.accounts.getValue().find((x) => x.id === this.data.idCuenta);
    const img = new Image();
    img.src = 'bcp/logo-ligth.svg';
  }

  onNuevoPayment() {
    this.router.navigateByUrl('/bcp/payment?id=' + this.data.idCuenta);
  }

  onVolverInicio() {
    this.router.navigateByUrl('/bcp');
  }

  onCerrar() {
    this.cerrar.emit(true);
  }

  isCaptured = false;
  @ViewChild('captureRef', { static: false }) captureRef!: ElementRef<HTMLElement>;
  onCompartir() {
    this.isCaptured = true;
    setTimeout(() => {
      this.sharedService.onShared(this.captureRef.nativeElement);
      this.isCaptured = false;
    }, 10);
  }

  onDescargar() {
    this.isCaptured = true;
    setTimeout(() => {
      this.sharedService.onDownload(this.captureRef.nativeElement);
      this.isCaptured = false;
    }, 10);
  }

  get number() {
    return FX.formatMaskAccount(this.data.nrocuenta || '');
  }

  get date() {
    return FX.buildDateVoucher(this.data.fecha);
  }

  get title(): string {
    if (this.data.esTransferencia) {
      return '¡Transferencia exitosa!';
    } else {
      return '¡Operación exitosa!';
    }
  }

  get label(): string {
    if (this.data.esServicio) {
      return 'Realizar otro Pago';
    } else if (this.data.esYape) {
      return 'Yapear a otro celular';
    } else {
      return 'Realizar otra Transferencia';
    }
  }
}
