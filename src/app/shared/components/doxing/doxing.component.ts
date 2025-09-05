import { Component } from '@angular/core';
import { ConstantesGenerales } from '../../utils/constants';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-doxing',
  templateUrl: './doxing.component.html',
  imports: [ButtonModule],
})
export class DoxingComponent {
  imgSrc = 'https://res.cloudinary.com/dmmwkdasz/image/upload/v1755797832/dox_t3zdpn.webp';
  linkSoporte = ConstantesGenerales.DOXING_SOPORTE;
}
