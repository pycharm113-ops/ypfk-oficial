import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterModule],
  templateUrl: './navigation.component.html',
})
export class NavigationComponent {
  menu = [
    { icon: 'bcp/icons/house.svg', label: 'Inicio', color: 'bcp-primary', link: '/bcp' },
    { icon: 'bcp/icons/arrows.svg', label: 'Operaciones', color: 'bcp-gray', link: null },
    { icon: 'bcp/icons/cart.svg', label: 'Para ti', color: 'bcp-gray', link: null },
    { icon: 'bcp/icons/config.svg', label: 'Configuración', color: 'bcp-gray', link: '/bcp/config' },
  ];
}
