import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { BcpService } from '../../services/bcp.service';
import { GeneralService } from '../../services/general.service';

@Component({
  selector: 'app-bcp',
  imports: [RouterOutlet, CommonModule, LoadingComponent],
  templateUrl: './bcp.component.html',
})
export class BcpComponent {
  private generalService = inject(GeneralService);
  private bcpService = inject(BcpService);

  public loading = false;
  public token = this.generalService.decodedToken;

  ngOnInit(): void {
    this.bcpService.updateThemeColorBCP(true);

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  ngOnDestroy(): void {
    this.bcpService.updateThemeColorBCP(false);
  }
}
