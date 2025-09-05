import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConstantesGenerales } from '../../utils/constants';
import { DeviceDetectorService } from 'ngx-device-detector';

@Component({
  selector: 'app-suggestion',
  imports: [ButtonModule],
  templateUrl: './suggestion.component.html',
})
export class SuggestionComponent {
  linkSoporte = ConstantesGenerales.YAPE_SOPORTE;

  imgIos = 'auth/pwa_add_ios.webp';
  imgAndroid = 'auth/pwa_add.webp';
  description = '';
  imgSrc = '';
  browser = '';
  sistema = '';

  constructor(private deviceService: DeviceDetectorService) {}

  ngOnInit() {
    const os = (this.deviceService.os || '').toLowerCase();
    const ua = (navigator.userAgent || '').toLowerCase();
    const isTouchMac = os.includes('mac') && 'ontouchend' in document;
    const isiOS = os.includes('ios') || /iphone|ipad|ipod/i.test(ua) || isTouchMac;

    if (isiOS) {
      this.imgSrc = this.imgIos;
      this.description = `click en el ícono de <strong>compartir</strong> y luego selecciona:<br>
      <strong>"Agregar a pantalla de inicio"</strong>`;
    } else {
      this.imgSrc = this.imgAndroid;
      this.description = `click en los <strong>tres puntos</strong> y luego selecciona:<br>
      <strong>"Agregar a pantalla principal"</strong>`;
    }

    this.browser = this.deviceService.browser;
    this.sistema = this.deviceService.os;

    //console.log('Es móvil:', this.deviceService.isMobile());
    //console.log('Es tablet:', this.deviceService.isTablet());
    //console.log('Es desktop:', this.deviceService.isDesktop());
  }
}
