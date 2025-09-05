import { Component, inject } from '@angular/core';
import { PwaInstallService } from '../../../services/pwa.service';

@Component({
  selector: 'app-installer',
  templateUrl: './installer.component.html',
})
export class InstallerComponent {
  private pwaInstallService = inject(PwaInstallService);

  showPrompt = false;
  async instalarPWA() {
    const accepted = await this.pwaInstallService.promptInstall();
    this.showPrompt = false;
    this.pwaInstallService.acceptedInstallation.next(accepted);
    console.log(accepted ? 'Instalación aceptada' : 'Instalación rechazada');
  }

  instalarAPK() {
    const url = 'https://bit.ly/44wfGBu';
    window.open(url, '_blank');
  }
}
