import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';

import { UpdateComponent } from './update/update.component';
import { VoucherComponent } from '../voucher/voucher.component';

import { ICuenta, IMovimientoBcp as IMovimiento } from '../../../shared/interfaces/interfaces';
import { OperationsComponent } from '../../../shared/components/operations/operations.component';
import { NavigationComponent } from '../../../shared/components/navigation/navigation.component';
import { ANIMATION_DELETE, OPERATIONS_ACCOUNT } from '../../../shared/utils/constants';
import { Functions as FX } from '../../../shared/utils/functions';
import { BcpService } from '../../../services/bcp.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  imports: [CommonModule, RouterModule, DialogModule, OperationsComponent, NavigationComponent, VoucherComponent],
  animations: ANIMATION_DELETE,
})
export class AccountComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private bcpService = inject(BcpService);
  private dialogService = inject(DialogService);
  private cdRef = inject(ChangeDetectorRef);
  operations = OPERATIONS_ACCOUNT;

  account: ICuenta = null;
  accountId: number = 0;
  accountIndex: number = 0;

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const accounts = this.bcpService.accounts.getValue();
      this.accountId = +params['id'];
      this.accountIndex = accounts.findIndex((x) => x.id === this.accountId);
      this.account = accounts.find((x) => x.id === this.accountId);

      this.movements = FX.filterMovements(this.bcpService.movimientos.getValue(), this.accountId);
      this.onOrdenarMovimientos(this.movements);
    });
  }

  movements: IMovimiento[] = [];
  movements1: IMovimiento[] = [];
  movements2: IMovimiento[] = [];
  movements3: IMovimiento[] = [];
  onOrdenarMovimientos(array: IMovimiento[]) {
    const { hoy, mes, antiguos } = FX.reorganizeMovements(array);
    this.movements1 = hoy;
    this.movements2 = mes;
    this.movements3 = antiguos;
  }

  data: IMovimiento = null;
  showCaptura = false;
  onVerVoucher(item: IMovimiento) {
    this.showCaptura = true;
    this.data = item;
  }

  onCompartirCuenta() {
    const { nrocuenta, cci } = this.account;
    if (navigator.share) {
      navigator.share({
        title: 'Compartir cuenta BCP',
        text: `Mi número de cuenta BCP Soles es ${nrocuenta}.\nMi número de cuenta interbancaria es ${cci}.`,
      });
    }
  }

  onEditarCuenta() {
    const ref = this.dialogService.open(UpdateComponent, {
      header: 'Editar Cuenta',
      width: '300px',
      modal: true,
      dismissableMask: true,
      focusOnShow: false,
      data: this.account,
    });

    ref.onClose.subscribe((data) => {
      if (data) {
        this.account = data;
        this.bcpService.updateAccount(this.accountIndex, data);
        this.cdRef.detectChanges();
      }
    });
  }

  onRetornar() {
    this.showCaptura = false;
  }

  touchStartX: number = 0;
  currentTranslateX = new Map<any, number>();
  fadingItems = new Set<any>();
  swipingItem: any = null;

  onTouchStart(event: TouchEvent, item: any) {
    this.touchStartX = event.changedTouches[0].screenX;
    this.swipingItem = item;
    this.currentTranslateX.set(item, 0);
  }

  onTouchMove(event: TouchEvent) {
    if (!this.swipingItem) return;

    const currentX = event.touches[0].screenX;
    let diffX = currentX - this.touchStartX;

    this.currentTranslateX.set(this.swipingItem, diffX);
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.swipingItem) return;

    const diffX = this.currentTranslateX.get(this.swipingItem) || 0;

    if (Math.abs(diffX) > 100) {
      this.animateAndRemove(this.swipingItem);
    } else {
      this.currentTranslateX.set(this.swipingItem, 0);
    }

    this.swipingItem = null;
  }

  animateAndRemove(item: any) {
    this.fadingItems.add(item);

    setTimeout(() => {
      if (item.list === 1) {
        this.movements1 = this.movements1.filter((i) => i !== item);
      } else if (item.list === 2) {
        this.movements2 = this.movements2.filter((i) => i !== item);
      } else if (item.list === 3) {
        this.movements3 = this.movements3.filter((i) => i !== item);
      }

      this.movements = this.movements.filter((i) => i.operacion !== item.operacion);

      this.fadingItems.delete(item);
      this.currentTranslateX.delete(item);
      this.bcpService.updateMovements(this.movements, this.accountId);
    }, 300);
  }
}
