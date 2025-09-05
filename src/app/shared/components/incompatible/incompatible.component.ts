import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputGroup } from 'primeng/inputgroup';
import { InputTextModule } from 'primeng/inputtext';
import { ResellersComponent } from '../resellers/resellers.component';

@Component({
  selector: 'app-incompatible',
  imports: [InputTextModule, InputGroup, ButtonModule, ResellersComponent],
  templateUrl: './incompatible.component.html',
})
export class IncompatibleComponent {
  @Input() currentUrl = '';

  copiarEnlace() {
    navigator.clipboard.writeText(this.currentUrl).then(() => {
      console.log('Enlace copiado al portapapeles.');
    });
  }
}
