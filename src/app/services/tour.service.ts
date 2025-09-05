import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { TourStep, Orientation, GuidedTour } from 'ngx-guided-tour';
import { GeneralService } from './general.service';

@Injectable({
  providedIn: 'root',
})
export class TourService {
  constructor(private router: Router, private generalService: GeneralService) {}

  private steps: TourStep[] = [
    {
      title: 'Configuración',
      selector: '.tourid-0',
      content: 'Accede a las opciones generales de configuración de la aplicación, donde podrás personalizar tu experiencia de uso.',
      orientation: Orientation.Right,
      useHighlightPadding: true,
    },
    {
      title: 'Mis Datos',
      selector: '.tourid-1',
      content: 'Desde aquí puedes actualizar tu titular yape y modificar tu saldo.',
      action: () => this.router.navigateByUrl('/config'),
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Mis Contactos',
      selector: '.tourid-2',
      content: 'Gestiona tus contactos. Puedes guardar de forma ilimitada contactos para el autocompletado.',
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Configuraciones Generales',
      selector: '.tourid-3',
      content: 'Accede a opciones adicionales para personalizar el funcionamiento general de la APP.',
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Vaciar movimientos',
      selector: '.tourid-4',
      content: 'Borra todos los movimientos almacenados localmente en tu dispositivo.',
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Mostrar Saldo',
      selector: '.tourid-7',
      content: 'En esta sección podrás ver tu saldo disponible, el cual se actualizará automáticamente con cada yapeo.',
      orientation: Orientation.Top,
      action: () => this.router.navigateByUrl('/'),
      useHighlightPadding: true,
    },
    {
      title: 'Mostrar Movimientos',
      selector: '.tourid-8',
      content: 'En esta sección podrás ver los movimientos realizados, la información que se muestra aquí esta guardado de forma local.',
      orientation: Orientation.Top,
      useHighlightPadding: true,
    },
    {
      title: 'Escanear QR',
      selector: '.tourid-9',
      content: 'El escaneo QR solo funciona con de negocios Izipay, para todo lo demas es texto.',
      orientation: Orientation.Top,
      skipStep: true,
    },
    {
      title: 'Yapear',
      selector: '.tourid-10',
      content: 'Este es el botón principal, aquí podras empezar a realizar los yapeos.',
      orientation: Orientation.Top,
    },
    {
      title: 'Contactos',
      selector: '.tourid-11',
      content:
        'Ingresa un celular o busca un contacto, luego dale click para seleccionar. El autocompletado solo funcionará si has registrado previamente un contacto en la sección de configuración.',
      action: () => this.router.navigateByUrl('/search'),
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Titular',
      selector: '.tourid-12',
      content: 'Aquí podrás editar el titular del yape y editar los ultimos 3 dítigos.',
      action: () => this.router.navigateByUrl('/payment?touring=true'),
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Monto',
      selector: '.tourid-13',
      content: 'Aquí podras ingresar el monto, si necesitas ingresar montos mayores a 500, deberias habilitar el check en configuraciones.',
      orientation: Orientation.Bottom,
      useHighlightPadding: true,
    },
    {
      title: 'Otros Bancos',
      selector: '.tourid-14',
      content:
        'En esta sección puedes elegir otros bancos para modificar el destino. A diferencia de las billeteras, los bancos no revelan el número de origen.',
      orientation: Orientation.Top,
      useHighlightPadding: true,
    },
    {
      title: 'Yapear',
      selector: '.tourid-15',
      content: 'Al finalizar el ingreso de datos, haz clic en Yapear para generar el comprobante.',
      orientation: Orientation.Top,
      closeAction: () => this.generalService.onDispatchTour.next(true),
      useHighlightPadding: true,
    },
  ];

  public stepItems: GuidedTour = {
    tourId: 'purchases-tour',
    useOrb: false,
    steps: this.steps,
  };

  public stepShare: GuidedTour = {
    tourId: 'purchases-tour',
    useOrb: false,
    steps: [
      {
        title: 'Compartir',
        selector: '.tourid-16',
        content: 'Finalmente puedes compartir la captura.',
        orientation: Orientation.Left,
        useHighlightPadding: true,
      },
    ],
  };
}
