import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ConfirmationService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class SwalService {
  private confirmationService = inject(ConfirmationService);
  private sanitizer = inject(DomSanitizer);

  onPreguntar(mensaje: string, header: string = 'Confirmación'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'confirmacion',
        message: mensaje,
        header: header,
        closable: false,
        defaultFocus: 'accept',
        rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
        acceptLabel: 'Sí',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  onNotificar(message: string) {
    this.confirmationService.confirm({
      key: 'notificacion',
      message,
      header: 'Aviso',
      closable: false,
      closeOnEscape: true,
      rejectVisible: false,
      acceptButtonStyleClass: 'p-button-text',
      acceptLabel: 'ENTENDIDO',
    });
  }

  onAlerta(title: string, message: string) {
    this.confirmationService.confirm({
      key: 'notificacion',
      message,
      header: title,
      closable: false,
      closeOnEscape: true,
      rejectVisible: false,
      acceptButtonStyleClass: 'p-button-text',
      acceptLabel: 'ENTENDIDO',
    });
  }

  onAlertaExpired(message: string): Promise<boolean> {
    const safeMessage: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(`
    <div style="text-align:center">
      <img src="/auth/yapito_sorprendido.png" width="120" style="margin-bottom: 1rem;" />
    </div>
    <div style="font-size: 1rem;">${message}</div>
  `);

    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'desconexion',
        header: 'Tu sesión ha finalizado',
        message: safeMessage as string,
        closable: false,
        rejectVisible: false,
        acceptButtonStyleClass: 'p-button-text',
        acceptButtonProps: {
          label: 'ENTENDIDO',
        },
        accept: () => resolve(true),
      });
    });
  }

  onPreguntarBCP(mensaje: string, header: string = 'Confirmación'): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        key: 'confirmacion',
        message: mensaje,
        header: header,
        closable: false,
        defaultFocus: 'accept',
        acceptButtonStyleClass: 'bcp-button-primary',
        rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
        acceptLabel: 'Sí',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  onNotificarBCP(message: string) {
    this.confirmationService.confirm({
      key: 'notificacion',
      message,
      header: 'Aviso',
      closable: false,
      closeOnEscape: true,
      rejectVisible: false,
      acceptButtonStyleClass: 'bcp-button-primary',
      acceptButtonProps: {
        label: 'ENTENDIDO',
      },
    });
  }
}
