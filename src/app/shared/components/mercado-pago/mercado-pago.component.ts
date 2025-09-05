import { Component, inject, OnInit } from '@angular/core';
import { PaymentService } from '../../../services/payment.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CommonModule } from '@angular/common';

import { PrimeNGModule } from '../../prime-ng/prime-ng.module';
import { SwalService } from '../../../services/swal.service';
import { ConstantesGenerales } from '../../utils/constants';
import { GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-mercado-pago',
  imports: [CommonModule, PrimeNGModule],
  templateUrl: './mercado-pago.component.html',
})
export class MercadoPagoComponent implements OnInit {
  private generalService = inject(GeneralService);
  private paymentService = inject(PaymentService);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private swal = inject(SwalService);

  productos: any[] = [];
  bancos = ConstantesGenerales.IMG_BANCOS;
  linkSoporte = ConstantesGenerales.YAPE_SOPORTE;
  logoPagoEfectivo = ConstantesGenerales.LOGO_PAGOEFECTIVO;

  tituloPlan: string = '';
  paymentUrl: string | null = null;
  paymentStatus: 'NONE' | 'PENDING' | 'PAID' = 'NONE';
  loading: boolean = false;
  loadingMsg: string = 'Cargando información de tu pago';

  cip: string = '';
  amount: number = 0;
  transactionCode: string | null = null;
  expiresAt: string | null = null;

  ngOnInit(): void {
    if (this.config.data) {
      this.loading = true;
      setTimeout(() => {
        this.verificarEstado(this.config.data);
      }, 1000);
    }

    this.generalService.products.subscribe((resp) => {
      this.productos = resp?.length ? resp : ConstantesGenerales.PRODUCTS;
    });
  }

  verificarEstado(code: string): void {
    this.loading = true;

    this.paymentService.consultarEstado(code).subscribe({
      next: (resp) => {
        this.loading = false;
        this.paymentStatus = resp.status;
        const plan = this.productos.find((p) => p.code === code);
        this.tituloPlan = code != 'BCP' ? plan.name : 'Activación ' + plan.name;

        if (resp.status === 'NONE') {
          this.generarOrdenPago(code);
        }

        if (resp.status === 'PENDING') {
          this.cip = resp.cip;
          this.transactionCode = resp.transactionCode;
          this.expiresAt = resp.expiresAt;
          this.amount = resp.amount;
        }

        if (resp.status === 'PAID') {
          this.dialogRef.close(resp.status);
        }
      },
      error: (err) => {
        this.swal.onNotificar('Error al consultar orden de pago.');
        this.dialogRef.close(true);
        this.loading = false;
      },
    });
  }

  generarOrdenPago(code: string): void {
    this.loading = true;
    this.loadingMsg = 'Creando orden de pago';
    this.paymentService.crearPago(code).subscribe({
      next: (resp) => {
        this.paymentStatus = 'PENDING';
        this.cip = resp.cip;
        this.amount = resp.amount;
        this.loading = false;
      },
      error: (err) => {
        this.swal.onNotificar('Error creando orden de pago.');
        this.dialogRef.close(true);
        this.loading = false;
      },
    });
  }

  copiado = false;
  onCopiarPortapapeles() {
    navigator.clipboard.writeText(this.cip).then(() => {
      this.copiado = true;
      setTimeout(() => {
        this.copiado = false;
      }, 1500);
    });
  }

  onClose() {
    this.dialogRef.close(null);
  }
}
