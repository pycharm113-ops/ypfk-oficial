import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  onShared(divElement: HTMLElement) {
    html2canvas(divElement, { scale: 3, useCORS: true }).then((canvas) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Error al generar la imagen.');
          return;
        }

        const fileName = `Voucher.png`;
        if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName)] })) {
          const file = new File([blob], fileName, { type: 'image/png' });

          navigator
            .share({
              title: 'Voucher',
              files: [file],
            })
            .then(() => console.log('Compartido exitosamente'))
            .catch((error) => console.error('Error al compartir:', error));
        } else {
          console.warn('La API de compartir archivos no está soportada en este navegador.');
        }
      }, 'image/png');
    });
  }

  onDownload(divElement: HTMLElement) {
    html2canvas(divElement, { scale: 3, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `Voucher_Yape`;
      link.click();
    });
  }
}
