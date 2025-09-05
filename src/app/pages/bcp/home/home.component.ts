import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

import { ConfigComponent } from '../config/config.component';
import { GeneralService } from '../../../services/general.service';
import { OperationsComponent } from '../../../shared/components/operations/operations.component';
import { NavigationComponent } from '../../../shared/components/navigation/navigation.component';
import { OPERATIONS_HOME } from '../../../shared/utils/constants';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ConfigComponent, DialogModule, OperationsComponent, NavigationComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private generalService = inject(GeneralService);
  operations: any[] = OPERATIONS_HOME;

  showSaldos = false;
  profile = { titular: '', saldo: 0 };

  ngOnInit(): void {
    this.generalService.profile.subscribe((value) => {
      this.profile = value;
    });
  }

  showAccounts = false;
  onCrearCuentas() {
    this.showAccounts = true;
  }
}
