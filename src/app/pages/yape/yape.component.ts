import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { GuidedTourModule, GuidedTourService } from 'ngx-guided-tour';

import { CooldownService } from '../../services/cooldown.service';
import { GeneralService } from '../../services/general.service';
import { SwalService } from '../../services/swal.service';
import { MigrateEmailComponent } from '../../shared/components/migrate-email/migrate-email.component';

@Component({
  selector: 'app-yape',
  imports: [RouterOutlet, CommonModule, DialogModule, GuidedTourModule, ButtonModule],
  providers: [GuidedTourService],
  templateUrl: './yape.component.html',
})
export class YapeComponent implements OnInit, OnDestroy {
  private cooldownService = inject(CooldownService);
  private generalService = inject(GeneralService);
  private dialogService = inject(DialogService);
  private swal = inject(SwalService);
  public token = this.generalService.decodedToken;
  public showPrompt = false;

  ngOnInit(): void {
    this.generalService.onGetResources().subscribe();

    if (!this.generalService.decodedToken?.payment || !this.generalService.decodedToken?.bcp) {
      this.generalService.getProducts().subscribe();
    }

    this.onVerifySession();

    if (!this.token.client && this.token.payment) {
      this.showPrompt = true;
    }
  }

  ngOnDestroy(): void {
    this.generalService.onRefreshToken.next(null);
  }

  onVerifySession() {
    if (this.token && !this.generalService.superadmin) {
      if (this.token.payment) {
        this.generalService.verifyToken().subscribe((resp) => {
          if (!resp.status) {
            this.swal.onAlertaExpired(resp.msg).then((response) => {
              if (response) {
                this.cooldownService.onLogout();
              }
            });
          }
        });
      }
    }
  }

  showModal = false;
  onLogout() {
    this.showModal = false;
    this.cooldownService.onLogout();
  }

  onVincularEmail() {
    const ref = this.dialogService.open(MigrateEmailComponent, {
      header: 'Vincular Correo',
      width: '300px',
      modal: true,
      dismissableMask: false,
      closable: true,
    });

    ref.onClose.subscribe((value) => {
      if (value) {
        this.cooldownService.onLogoutWithEmail(value);
      }
    });
  }
}
