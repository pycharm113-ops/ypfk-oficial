import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

import { BcpService } from '../../../services/bcp.service';
import { VoucherComponent } from '../voucher/voucher.component';
import { NavigationComponent } from '../../../shared/components/navigation/navigation.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { PrimeNGModule } from '../../../shared/prime-ng/prime-ng.module';
import { ConstantesGenerales } from '../../../shared/utils/constants';
import { ICuenta } from '../../../shared/interfaces/interfaces';
import { GeneralService } from '../../../services/general.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, PrimeNGModule, NavigationComponent, VoucherComponent, LoadingComponent],
  providers: [DatePipe],
  templateUrl: './payment.component.html',
})
export class PaymentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private generalService = inject(GeneralService);
  private bcpService = inject(BcpService);
  private location = inject(Location);
  private router = inject(Router);
  private readonly formatoFecha = inject(DatePipe);

  public account: ICuenta = null;
  public accounts: ICuenta[] = [];
  public accountId: number = 0;

  public esTransferencia: boolean = false;
  public esServicio: boolean = false;
  public esYape: boolean = false;
  public esDolar: boolean = false;
  public esScanner: boolean = false;
  public loading: boolean = false;

  monto: number = 0;
  comision: number = 0;
  titular: string = 'Nombre del Titular';
  empresa: string = 'Nombre Empresa';
  nrocuenta: string = '1045';
  destino: string = 'YAPE';
  selfTransaction: boolean = false;

  glosa1: string = 'Texto 1';
  glosa2: string = 'Texto 2';
  amount = new FormControl(0);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.accounts = this.bcpService.accounts.getValue();
      const accountId = +params['id'];
      this.account = this.accounts.find((acc) => acc.id === accountId) || this.accounts[0];
      this.accountId = this.account.id;

      // Flags según query params
      this.esServicio = params['servicio'] === 'true';
      this.esYape = params['yape'] === 'true';
      this.esScanner = params['scanner'] === 'true';
      this.esDolar = this.account.moneda !== 'PEN';
      this.esTransferencia = !this.esServicio && !this.esYape;

      // Datos según tipo (scanner o no)
      if (this.esScanner) {
        this.titular = params['titular'];
        this.nrocuenta = params['nrocuenta'];
        this.destino = params['destino'];
      } else {
        this.titular = this.esServicio ? 'Nombre del Servicio' : 'Nombre del Titular';
        this.nrocuenta = this.esYape ? '999' : '1045';
        this.destino = this.esYape ? 'Yape' : 'BCP';
      }
    });

    this.amount.valueChanges.subscribe((value) => {
      this.monto = value ?? 0;
    });
  }

  modalAccount = false;
  onChangeAccount() {
    this.modalAccount = true;
  }

  onChangeMoneda() {
    this.esDolar = !this.esDolar;
  }

  onSelectAccount(account: ICuenta) {
    if (this.accountId === account.id) {
      return;
    }

    const queryParams: any = { id: account.id, servicio: this.esServicio, yape: this.esYape };

    Object.keys(queryParams).forEach((key) => {
      if (!queryParams[key]) {
        delete queryParams[key];
      }
    });

    this.router.navigate([], { queryParams, replaceUrl: true });
    this.modalAccount = false;
  }

  data: any = null;
  showCaptura = false;
  onPayment() {
    const data = {
      titular: this.titular,
      empresa: this.esServicio ? this.empresa : null,
      glosa: this.esServicio ? { text1: this.glosasVisibles[0] ? this.glosa1 : null, text2: this.glosasVisibles[1] ? this.glosa2 : null } : null,
      monto: this.monto,
      comision: Number(this.comision),
      moneda: !this.esDolar ? 'PEN' : 'USD',
      destino: this.destino,
      nrocuenta: this.nrocuenta,
      fecha: this.fxGenerarFecha(new Date()),
      operacion: this.fxGenerarNumOperacion(),
      idCuenta: this.accountId,
      esTransferencia: this.esTransferencia,
      esServicio: this.esServicio,
      esYape: this.esYape,
      selfTransaction: this.selfTransaction,
    };

    this.data = data;
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.showCaptura = true;
      this.bcpService.updateAccountMovements(this.data, this.accountId);
      this.onResetValues();
    }, 1000);
  }

  onResetValues() {
    this.monto = 0;
    this.comision = 0;
    this.esDolar = false;
  }

  glosasVisibles = [false, false];
  onAgregarGlosa() {
    if (!this.glosasVisibles[0]) {
      this.glosasVisibles[0] = true;
    } else if (!this.glosasVisibles[1]) {
      this.glosasVisibles[1] = true;
    }
  }

  onEliminarGlosa(index: number) {
    this.glosasVisibles[index] = false;
  }

  autoGrow(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  fxGenerarFecha(fecha: Date): string | null {
    return this.formatoFecha.transform(fecha, ConstantesGenerales._FORMATO_FECHA_GRABAR);
  }

  fxGenerarNumOperacion(): string {
    const numero = Math.floor(Math.random() * 90000000) + 10000000;
    return numero.toString();
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigateByUrl('/bcp');
  }

  onRetornar() {
    this.showCaptura = false;
  }

  get firstLetter() {
    return this.titular && this.titular.length > 0 ? this.titular[0] : '?';
  }

  get label(): string {
    if (this.esServicio) {
      return 'Realizar Pago';
    } else if (this.esYape) {
      return 'Realizar Yapeo';
    } else {
      return 'Realizar Transferencia';
    }
  }

  autocomplete = this.generalService.decodedToken.autocomplete;
  isAutocompleteActive = this.generalService.isAutocompleteActive;

  onEnterPressed() {
    if (this.esYape) {
      if (this.nrocuenta.length === 9 && this.isAutocompleteActive && this.autocomplete) {
        this.onSearchNumber(this.nrocuenta);
      }
    }
  }

  onSearchNumber(number: string) {
    this.generalService.getOsiptelData(number).subscribe({
      next: (resp) => {
        this.titular = resp?.titular ?? 'Desconocido';
      },
      error: (err) => {
        console.error('Error al consultar OSIPTEL', err);
        this.titular = 'Desconocido';
      },
    });
  }
}
