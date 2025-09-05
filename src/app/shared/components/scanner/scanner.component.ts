import { Component, EventEmitter, inject, Output, OnDestroy } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';

import { Functions } from '../../utils/functions';
import { TutorialComponent } from '../tutorial/tutorial.component';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BrowserQRCodeReader } from '@zxing/browser';
import Tesseract from 'tesseract.js';

@Component({
  selector: 'app-scanner',
  imports: [ZXingScannerModule, DialogModule],
  templateUrl: './scanner.component.html',
})
export class ScannerComponent implements OnDestroy {
  @Output() cerrar: EventEmitter<boolean> = new EventEmitter<boolean>();
  private dialogService = inject(DialogService);
  private router = inject(Router);

  reader = new BrowserQRCodeReader();
  selectedDevice: MediaDeviceInfo;
  image: HTMLImageElement = null;

  ngOnDestroy(): void {
    if (this.image) {
      this.image.src = '';
      this.image.onload = null;
      this.image = null;
    }
  }

  handleQrCodeResult(result: string) {
    const { celular, titular } = this.parseQRData(result);

    if (celular && titular) {
      this.onYapearDenuevo(celular, titular, 'Izipay');
    } else {
      this.tryOcrFallback(this.image);
    }
  }

  parseQRData(result: string): { celular: string | null; titular: string | null } {
    let celular: string | null = null;
    let titular: string | null = null;

    const celularMatch = result.match(/;(\d{9});/);
    if (celularMatch) {
      celular = celularMatch[1];
    }

    const titularMatch = result.match(/IZI\*([^0-9;]+)/);
    if (titularMatch) {
      titular = titularMatch[1].trim();
    }

    return { celular, titular };
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result as string;
      this.image = img;
      img.onload = async () => {
        try {
          const result = await this.reader.decodeFromImageElement(img);
          this.handleQrCodeResult(result.getText());
        } catch (err) {
          this.tryOcrFallback(img);
        }
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
      } else {
        this.onYapearDenuevo('000000000', 'Yape', 'Yape');
      }
    } catch (err) {
      this.onYapearDenuevo('000000000', 'Yape', 'Yape');
    }
  }

  procesarTexto(texto: string) {
    const resultado = Functions.extractText(texto);
    this.onYapearDenuevo(resultado.numero, resultado.nombre, resultado.metodo);
  }

  onYapearDenuevo(celular: string, titular: string, destino: string) {
    this.router.navigate(['/payment'], {
      queryParams: {
        number: celular,
        titular: titular,
        scanner: true,
        destino,
      },
    });
  }

  onVerTutorial(): void {
    this.dialogService.open(TutorialComponent, {
      modal: true,
      dismissableMask: true,
      focusOnShow: false,
      showHeader: false,
      styleClass: 'content-plyr',
      width: '17.5rem',
      data: 'scanner',
    });
  }

  onCerrar() {
    this.cerrar.emit(true);
  }
}
