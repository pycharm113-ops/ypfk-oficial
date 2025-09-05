import { Component, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { delay } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';

import { ConstantesGenerales } from '../../utils/constants';
import { GeneralService } from '../../../services/general.service';
import { TutorialComponent } from '../tutorial/tutorial.component';
import { MercadoPagoComponent } from '../mercado-pago/mercado-pago.component';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-paquetes',
  imports: [CommonModule, ButtonModule, DialogModule, ProgressSpinner],
  templateUrl: './paquetes.component.html',
})
export class PaquetesComponent implements OnInit {
  private dialogService = inject(DialogService);
  private generalService = inject(GeneralService);
  private router = inject(Router);

  public productos: any[] = [];
  public token = this.generalService.decodedToken;
  public email = this.generalService.email;
  public loadingPago: boolean = false;
  public linkSoporteBCP = ConstantesGenerales.BCP_SOPORTE;
  public linkSoporteIBK = ConstantesGenerales.IBK_SOPORTE;

  ngOnInit(): void {
    this.generalService.products.subscribe((resp) => {
      this.productos = resp?.length ? resp : ConstantesGenerales.PRODUCTS;
    });
  }

  @ViewChild('customHeader') customHeader!: TemplateRef<any>;
  onGenerarOrden(code: string) {
    if (!this.token?.client && (code === 'BCP' || code === 'IBK')) {
      const link = code === 'BCP' ? this.linkSoporteBCP : this.linkSoporteIBK;
      window.open(link, '_blank');
      return;
    }
    const ref = this.dialogService.open(MercadoPagoComponent, {
      width: '100%',
      modal: true,
      dismissableMask: true,
      focusOnShow: false,
      showHeader: false,
      styleClass: 'p-dialog-menu p-dialog-padding-0',
      data: code,
    });

    ref.onClose.subscribe((resp) => {
      if (resp === 'PAID') {
        this.loadingPago = true;
        const pin = this.token.pin;
        const obs = this.email ? this.generalService.onLoginClient({ pin, email: this.email, reload: true }) : this.generalService.onLogin(pin);
        obs.pipe(delay(2000)).subscribe((resp) => {
          this.loadingPago = false;
          localStorage.setItem('token', resp.token);
          this.router.navigateByUrl('/');
          this.generalService.onRefreshToken.next(true);
        });
      }
    });
  }

  onIngresarBCP(): void {
    this.router.navigateByUrl('/bcp');
  }

  onIngresarIBK(): void {
    this.router.navigateByUrl('/ibk');
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
