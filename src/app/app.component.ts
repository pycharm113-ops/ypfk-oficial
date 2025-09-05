import { Component, inject, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';

import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConstantesGenerales } from './shared/utils/constants';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, ConfirmDialog],
  templateUrl: './app.component.html',
})
export class AppComponent {
  private es = ConstantesGenerales.ES_CALENDARIO;
  private primengConfig = inject(PrimeNG);
  private renderer = inject(Renderer2);

  ngOnInit(): void {
    this.primengConfig.ripple.set(false);
    this.primengConfig.setTranslation(this.es);
    this.renderer.setAttribute(document.documentElement, 'data-theme', 'light');
    this.renderer.setStyle(document.documentElement, 'color-scheme', 'light');
  }
}
