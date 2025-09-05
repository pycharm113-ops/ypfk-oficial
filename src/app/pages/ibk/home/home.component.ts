import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselModule],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  tcCompra = '3.468';
  tcVenta = '3.603';

  products: any[] = [
    { img: 'ibk/pig.png', name: 'Cuenta Simple Soles', amount: 'S/ 10,000.00', subtitle: 'Saldo disponible' },
    { img: 'ibk/pig.png', name: 'Cuenta Intangible Soles ', amount: 'S/ 25,000.00', subtitle: 'Línea disponible' },
    { img: 'ibk/card.png', name: 'Visa', amount: 'S/ 50,000.00', subtitle: 'Saldo disponible', muted: true },
  ];

  items = [
    {
      type: 'plin',
      label: 'Plinear a Celular',
      icon: 'ibk/plin.png',
    },
    {
      type: 'add',
      label: 'Agregar contacto',
      icon: 'pi pi-plus',
    },
    {
      type: 'add',
      label: 'Agregar contacto',
      icon: 'pi pi-plus',
    },
    {
      type: 'add',
      label: 'Agregar contacto',
      icon: 'pi pi-plus',
    },
    {
      type: 'add',
      label: 'Agregar contacto',
      icon: 'pi pi-plus',
    },
    {
      type: 'add',
      label: 'Agregar contacto',
      icon: 'pi pi-plus',
    },
  ];
}
