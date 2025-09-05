import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConstantesGenerales } from '../../utils/constants';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-resellers',
  imports: [CommonModule, ButtonModule],
  templateUrl: './resellers.component.html',
})
export class ResellersComponent {
  linkSoporte = ConstantesGenerales.YAPE_INFO;
  linkWhatsApp = ConstantesGenerales.YAPE_INFO2;
  linkTelegram = ConstantesGenerales.TELEGRAM_INFO;
  linkInstagram = ConstantesGenerales.INSTAGRAM_INFO;

  abrirEnlace(url: string) {
    window.open(url, '_blank');
  }
}
