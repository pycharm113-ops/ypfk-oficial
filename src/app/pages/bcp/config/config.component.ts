import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';

import { ICuenta } from '../../../shared/interfaces/interfaces';
import { BcpService } from '../../../services/bcp.service';
import { SwalService } from '../../../services/swal.service';
import { Functions as FX } from '../../../shared/utils/functions';
import { UpdateComponent } from '../../../pages/bcp/account/update/update.component';

@Component({
  selector: 'app-config',
  imports: [CommonModule, RouterModule],
  templateUrl: './config.component.html',
})
export class ConfigComponent {
  private bcpService = inject(BcpService);
  private dialogService = inject(DialogService);
  private swalService = inject(SwalService);
  private router = inject(Router);

  @Output() cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() showSaldos = false;
  @Input() isConfig = false;

  accounts: ICuenta[] = [];
  accountsHome: ICuenta[] = [];

  ngOnInit(): void {
    this.bcpService.accounts.subscribe((value) => {
      this.accounts = value.map((x) => ({ ...x, mask: FX.formatNumberAccount(x.nrocuenta) }));
      this.selectedAccounts = this.accounts.filter((acc) => acc.order).sort((a, b) => a.order! - b.order!);
      this.accountsHome = [...this.selectedAccounts];
    });
  }

  onEditarCuenta(item: ICuenta, index: number) {
    const ref = this.dialogService.open(UpdateComponent, {
      header: item ? 'Editar Cuenta' : 'Agregar Cuenta',
      styleClass: 'bcp-dialog',
      width: '300px',
      modal: true,
      dismissableMask: false,
      focusOnShow: false,
      closable: true,
      data: item,
    });

    ref.onClose.subscribe((data: ICuenta) => {
      if (data) {
        if (data.id === 0) {
          this.bcpService.createAccount(data);
        } else {
          this.bcpService.updateAccount(index, data);
        }
      }
    });
  }

  onEliminarCuenta(item: ICuenta) {
    if (this.accounts.length <= 1) {
      this.swalService.onNotificarBCP('No puedes eliminar la única cuenta existente.');
      return;
    }

    this.swalService.onPreguntarBCP('¿Desea eliminar esta cuenta?').then((response) => {
      if (response) {
        this.bcpService.deleteAccount(item);
      }
    });
  }

  selectedAccounts: ICuenta[] = [];
  toggleAccountSelection(account: ICuenta): void {
    const index = this.selectedAccounts.findIndex((a) => a.id === account.id);

    if (index > -1) {
      if (this.selectedAccounts.length === 1) return;
      this.selectedAccounts.splice(index, 1);
    } else {
      if (this.selectedAccounts.length < 3) {
        this.selectedAccounts.push(account);
      }
    }

    this.accounts = this.accounts.map((item) => ({
      ...item,
      order: this.selectedAccounts.findIndex((x) => x.id === item.id) + 1 || null,
    }));

    this.hasChanges = !FX.arraysAreEqualByIdAndOrder(this.selectedAccounts, this.accountsHome);
  }

  hasChanges = false;
  onGuardar() {
    const update = this.accounts.map(({ mask, ...rest }) => rest);
    this.bcpService.accounts.next(update);
    localStorage.setItem('accounts', JSON.stringify(update));
    this.hasChanges = false;
  }

  onBack() {
    this.router.navigateByUrl('/bcp');
    this.cerrar.emit(true);
  }
}
