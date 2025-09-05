import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SwalService } from '../../../services/swal.service';

import { Functions } from '../../../shared/utils/functions';
import { BrowserQRCodeReader } from '@zxing/browser';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-operations',
  imports: [CommonModule, RouterModule],
  templateUrl: './operations.component.html',
})
export class OperationsComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Input() operations: any[] = [];
  @Input() accountId: number = 0;

  private router = inject(Router);
  private swal = inject(SwalService);

  onRedirect(item: any) {
    if (item.qr) {
      this.fileInput.nativeElement.click();
    }

    if (!item?.link) return;

    const queryParams = {
      id: this.accountId !== 0 ? this.accountId : null,
      servicio: item.servicio ?? null,
      yape: item.yape ?? null,
    };

    this.router.navigate([item.link], { queryParams });
  }

  reader = new BrowserQRCodeReader();
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
      img.onload = async () => {
        this.tryOcrFallback(img);
      };
    };

    reader.readAsDataURL(file);
  }

  async tryOcrFallback(img: HTMLImageElement) {
    try {
      if (img) {
        const result = await Tesseract.recognize(img.src, 'spa+eng');
        const text = result.data.text;
        this.procesarTexto(text);
      }
    } catch (err) {
      this.swal.onNotificarBCP('Ocurrió un error al procesar la imagen.');
    }
  }

  procesarTexto(texto: string) {
    const resultado = Functions.extractTextBCP(texto);

    if (!resultado) {
      console.log('sin resultados');
      return;
    }

    const billeteras = ['Yape', 'Plin', 'Bim', 'Tunki'];
    const queryParams = {
      scanner: true,
      id: this.accountId !== 0 ? this.accountId : null,
      titular: resultado.titular,
      nrocuenta: resultado.nrocuenta,
      destino: resultado.destino,
      servicio: false,
      yape: billeteras.includes(resultado.destino),
    };

    this.router.navigate(['/bcp/payment'], { queryParams });
  }
}
