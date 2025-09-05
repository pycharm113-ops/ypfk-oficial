export class ConstantesGenerales {
  public static _FORMATO_DDMMYYYY_HHMMSS = 'dd/MM/yy hh:mm a';
  public static _FORMATO_FECHA_GRABAR = 'yyyy-MM-dd HH:mm';
  public static _FORMATO_FECHA_BUSQUEDA = 'yyyy-MM-dd';
  public static _FORMATO_FECHA_VISTA = 'dd/MM/yyyy';

  public static ES_CALENDARIO = {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
    dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Borrar',
    dateFormat: 'dd/mm/yy',
    weekHeader: 'Sem',
    emptyFilterMessage: 'No se encontraron resultados',
    emptySearchMessage: 'No se encontraron resultados',
    emptyMessage: 'No se encontraron resultados',
  };

  public static ARRAY_FUENTES = [
    { valor1: 'Roboto', id: '"Roboto", serif' },
    { valor1: 'Arial', id: 'Arial, sans-serif' },
    { valor1: 'Verdana', id: 'Verdana, sans-serif' },
    { valor1: 'Helvetica', id: 'Helvetica, sans-serif' },
    { valor1: 'Tahoma', id: 'Tahoma, sans-serif' },
    { valor1: 'Trebuchet MS', id: '"Trebuchet MS", sans-serif' },
    { valor1: 'Times New Roman', id: '"Times New Roman", serif' },
    { valor1: 'Georgia', id: 'Georgia, serif' },
    { valor1: 'Courier New', id: '"Courier New", monospace' },
    { valor1: 'Brush Script MT', id: '"Brush Script MT", cursive' },
    { valor1: 'Comic Sans MS', id: '"Comic Sans MS", cursive' },
    { valor1: 'Impact', id: 'Impact, sans-serif' },
    { valor1: 'Lucida Sans Unicode', id: '"Lucida Sans Unicode", sans-serif' },
    { valor1: 'Palatino Linotype', id: '"Palatino Linotype", serif' },
    { valor1: 'Garamond', id: 'Garamond, serif' },
  ];

  public static ARRAY_RECARGAS = [{ valor: 6 }, { valor: 7 }, { valor: 10 }];
  public static ARRAY_DESTINOS = ['Plin', 'Bim', 'Tunki', 'Agora / Oh!', 'BCP', 'BBVA', 'Interbank', 'Financiera Efectiva', 'Izipay'];
  public static ARRAY_OPERADORAS = [
    { valor1: 'Entel', img: 'operadoras/entel.png' },
    { valor1: 'Movistar', img: 'operadoras/movistar.svg' },
    { valor1: 'Claro', img: 'operadoras/claro.png' },
    { valor1: 'Bitel', img: 'operadoras/bitel.svg' },
  ];

  private static NOMBRES_MASCULINOS = [
    'Juan',
    'Carlos',
    'Luis',
    'Pedro',
    'José',
    'Miguel',
    'Jorge',
    'Fernando',
    'Ricardo',
    'Alejandro',
    'Roberto',
    'Diego',
    'Manuel',
    'Francisco',
    'Raúl',
    'Héctor',
  ];

  private static NOMBRES_FEMENINOS = [
    'María',
    'Ana',
    'Laura',
    'Sofía',
    'Lucía',
    'Valeria',
    'Camila',
    'Daniela',
    'Gabriela',
    'Paula',
    'Mariana',
    'Andrea',
    'Beatriz',
    'Elena',
    'Isabel',
    'Patricia',
  ];

  private static APELLIDOS_PATERNOS = [
    'García',
    'Rodríguez',
    'González',
    'Martínez',
    'Anaya',
    'Broncano',
    'Sánchez',
    'Ramírez',
    'Torres',
    'Flores',
    'Vargas',
    'Rojas',
    'Díaz',
    'Herrera',
    'Castro',
    'Romero',
  ];

  private static APELLIDOS_MATERNOS = [
    'Álvarez',
    'Bravo',
    'Castillo',
    'Delgado',
    'Espinoza',
    'Fuentes',
    'Guerrero',
    'Hernández',
    'Iglesias',
    'Jiménez',
    'León',
    'Mendoza',
    'Navarro',
    'Ortega',
    'Paredes',
    'Quispe',
  ];

  private static generarCelular(): string {
    return '9' + Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  private static generarParContactoTitular() {
    // 1. Elegir género aleatorio (50% masculino, 50% femenino)
    const esMasculino = Math.random() > 0.5;
    const listaNombres = esMasculino ? this.NOMBRES_MASCULINOS : this.NOMBRES_FEMENINOS;
    const listaSegundosNombres = esMasculino ? this.NOMBRES_MASCULINOS : this.NOMBRES_FEMENINOS;

    // 2. Generar nombres
    const primerNombre = listaNombres[Math.floor(Math.random() * listaNombres.length)];
    const tieneSegundoNombre = Math.random() > 0.5;
    const segundoNombre = tieneSegundoNombre ? listaSegundosNombres[Math.floor(Math.random() * listaSegundosNombres.length)] : null;

    // 3. Generar apellidos
    const apellidoPaterno = this.APELLIDOS_PATERNOS[Math.floor(Math.random() * this.APELLIDOS_PATERNOS.length)];
    const apellidoMaterno = this.APELLIDOS_MATERNOS[Math.floor(Math.random() * this.APELLIDOS_MATERNOS.length)];

    // 4. Formatear según reglas
    const nombreCompleto = segundoNombre ? `${primerNombre} ${apellidoPaterno}` : `${primerNombre} ${apellidoPaterno} `;

    const nombreTitular = segundoNombre
      ? `${primerNombre} ${segundoNombre.charAt(0)}. ${apellidoPaterno} ${apellidoMaterno.charAt(0)}.`
      : `${primerNombre} ${apellidoPaterno} ${apellidoMaterno.charAt(0)}.`;

    const celular = this.generarCelular();

    return {
      contacto: { titular: nombreCompleto, celular, destino: 'Yape' },
      titular: { titular: nombreTitular, celular, destino: 'Yape' },
    };
  }

  // Arrays finales
  public static ARRAY_CONTACTOS: { titular: string; celular: string; destino: string }[] = [];
  public static ARRAY_TITULARES: { titular: string; celular: string; destino: string }[] = [];

  static {
    const cantidad = 15; // Número de registros
    for (let i = 0; i < cantidad; i++) {
      const par = this.generarParContactoTitular();
      this.ARRAY_CONTACTOS.push(par.contacto);
      this.ARRAY_TITULARES.push(par.titular);
    }
  }

  public static IMG_SERVICIOS = [
    { img: 'servicios/1.svg', text: 'Recargar celular', visible: true },
    { img: 'servicios/2.svg', text: 'Yapear servicios', visible: true },
    { img: 'servicios/3.svg', text: 'Promos', visible: true },
    { img: 'servicios/4.svg', text: 'Aprobar compras', visible: true },
    { img: 'servicios/5.svg', text: 'Créditos', visible: true },
    { img: 'servicios/6.svg', text: 'Tienda', visible: true },
    { img: 'servicios/7.svg', text: 'Dólares', visible: true },
    { img: 'servicios/8.svg', text: 'Remesas', visible: true },
    { img: 'servicios/9.svg', text: 'SOAT', visible: true },
    { img: 'servicios/10.svg', text: 'Viajar en bus', visible: true },
    { img: 'servicios/11.svg', text: 'Entradas', visible: false },
    { img: 'servicios/12.svg', text: 'Gaming', visible: true },
    { img: 'servicios/13.svg', text: 'Yapear dólares', visible: false },
    { img: 'servicios/all.svg', text: 'Ver todo', visible: true, badge: '' },
  ];

  public static IMG_BANCOS = [
    {
      name: 'BBVA',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/5/5/csm_bbva_c548f90821.webp',
    },
    {
      name: 'BCP',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/6/0/csm_bcp_e5cce0fe3a.webp',
    },
    {
      name: 'Interbank',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/1/4/csm_interbank_b6215f9835.webp',
    },
    {
      name: 'Yape',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/2/4/csm_yape_18c3e8669d.webp',
    },
    {
      name: 'Caja Arequipa',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/e/9/csm_caja-arequipa_0a7a6fa1e6.webp',
    },
    {
      name: 'Scotiabank',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/8/7/csm_scotiabank_933b6f800f.webp',
    },
    {
      name: 'Banbif',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/a/0/csm_banbif_fc872e583e.webp',
    },
    {
      name: 'Pichincha',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/8/4/csm_pichincha_51a43ced85.webp',
    },
    {
      name: 'Tambo',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/1/f/csm_tambo_7ab1030b83.webp',
    },

    {
      name: 'WesternUnion',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/0/1/csm_western-union_2669cce80b.webp',
    },
    {
      name: 'Dale',
      img: 'https://www.pagoefectivo.la/fileadmin/_processed_/a/a/csm_dale_c36f456805.webp',
    },
    {
      name: 'Kasnet',
      img: 'https://www.pagoefectivo.la/fileadmin/content/LOGOS_PERU/kasnet.svg',
    },
  ];

  public static LOGO_PAGOEFECTIVO = 'https://www.pagoefectivo.la/_assets/04e34e93cc563bf473e989ab645174d0/images/pago-logo.svg';

  public static YAPE_INFO = 'https://wa.link/bo9ewv';
  public static YAPE_INFO2 = 'https://wa.link/qdz2f0';
  public static TELEGRAM_INFO = 'https://t.me/dev_lguss';
  public static INSTAGRAM_INFO = 'https://www.instagram.com/dev.lguss';
  public static YAPE_SOPORTE = 'https://wa.link/3n4770';
  public static BCP_SOPORTE = 'https://wa.link/ynqb6n';
  public static IBK_SOPORTE = 'https://wa.link/hh19xd';
  public static DOXING_SOPORTE = 'https://wa.link/prxffd';

  public static SOPORTE = [
    {
      _id: '67fe4a30309c353c24682129',
      username: 'LGUSS',
      link: 'https://wa.link/3n4770',
    },
    {
      _id: '685b815bc2dbf6c376c2f23b',
      username: 'CHUCKY',
      link: 'https://t.me/chucky_net_x_oficial',
    },
    {
      _id: '68996b8773ec75bb8d5b573d',
      username: 'MATT',
      link: 'https://t.me/gust_100cia1',
    },
  ];

  public static TUTORIALES = {
    demo: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/Demo_vz8tvr.mp4',
    register: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/Registrarse_hv2thf.mp4',
    installer: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/Instalacion_jpdjog.mp4',
    payment: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/Comprar_pcshr1.mp4',
    scanner: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/Escanear_czfdmk.mp4',
    autocompleted: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/Autocompletado_uvrtvn.mp4',
    bcp: 'https://res.cloudinary.com/dxn4w2nxq/video/upload/BCP_z9z8gu.mp4',
  };

  public static MENSAJE = {
    titulo: 'Yape Fake Online',
    descripcion: 'Realiza yapeos, consulta movimientos, edita tu saldo, comparte captura y mucho más.',
    advertencia: 'La compra se realiza dentro de la misma aplicación, nadie más esta autorizado.',
    recomendacion: 'Adquiere el acceso permanente con distribuidores autorizados para garantía y soporte.',
    copyright: 'Desarrollado por Lguss - Yape Fake Online',
  };

  public static PROFILE = { titular: 'Usuario', saldo: 10000 };

  public static DEVELOPS = ['686204952f3e159952e7d52d'];
  public static RESELLERS = ['6866e856f5d3477d80c771fa'];

  public static PRODUCTS = [
    {
      name: 'Paquete Básico (YAPE)',
      code: 'YAPE',
      price: 30,
      description: 'Podrás realizar múltiples yapeos',
      previous: 30,
      details: ['Contactos ilimitados', 'Escáner QR (texto)', 'Almacenamiento local'],
    },
    {
      name: 'Paquete Completo (YAPE + BCP)',
      code: 'YAPEBCP',
      price: 35,
      description: 'Dos aplicaciones en uno, podrás realizar múltiples yapeos e incluye acceso directo al BCP',
      previous: 35,
      details: ['Contactos ilimitados', 'Escáner QR (texto)', 'Almacenamiento local', 'Acceso directo al BCP'],
    },
    {
      name: 'Activación BCP',
      code: 'BCP',
      price: 10,
      description: 'Podrás realizar transferencias bancarias e interbancarias, pago de servicios y billeteras.',
      previous: 15,
      details: ['Autocompletado Osiptel', 'Gestión de cuentas', 'Gestión de movimientos', 'Almacenamiento local', 'Acceso directo desde tu Yape'],
    },
  ];

  public static SETTINGS = {
    banner: 'random',
    confetti: 1,
    autoPayment: false,
    showTitularsReal: false,
    showTitularsFake: true,
    showSearch: true,
    showBanner: true,
    showConfetti: true,
    allowMore500: false,
    allowChangeDate: false,
    allowSwipe: false,
  };

  public static CONFETTIS = [
    { id: 1, valor1: 'Animación 1' },
    { id: 2, valor1: 'Animación 2' },
    { id: 3, valor1: 'Animación 3' },
  ];
}

export const ACCOUNTS = [
  {
    id: 1,
    nombre: 'Cuenta Digital',
    nrocuenta: '1912058951088',
    cci: '20519120589510450',
    moneda: 'PEN',
    saldo: 1000,
    order: 1,
  },
  {
    id: 2,
    nombre: 'Cuenta Corriente',
    nrocuenta: '1912058956625',
    cci: '20519120589566250',
    moneda: 'PEN',
    saldo: 2500,
    order: 2,
  },
  {
    id: 3,
    nombre: 'Cuenta Ilimitada',
    nrocuenta: '1912058953891',
    cci: '20519120589538910',
    moneda: 'PEN',
    saldo: 50000,
    order: 3,
  },
];

export const OPERATIONS_HOME: any[] = [
  { icon: 'pi pi-eye', label: 'Transferir dinero', img: 'bcp/arrows.svg', link: 'bcp/payment' },
  { icon: 'pi pi-eye', label: 'Pagar Servicios', img: 'bcp/aqua.svg', link: 'bcp/payment', servicio: true },
  { icon: 'pi pi-send', label: 'Yapear a celular', img: null, link: 'bcp/payment', yape: true },
  { icon: 'pi pi-qrcode', label: 'Pagar con QR', img: null, link: null, qr: true },
];

export const OPERATIONS_ACCOUNT: any[] = [
  { icon: 'pi pi-eye', label: 'Transferir dinero', img: 'bcp/arrows.svg', link: '/bcp/payment' },
  { icon: 'pi pi-eye', label: 'Pagar Servicios', img: 'bcp/aqua.svg', link: '/bcp/payment', servicio: true },
  { icon: 'pi pi-ellipsis-h', label: 'Más', img: null, link: null },
];

import { animate, state, style, transition, trigger } from '@angular/animations';
export const ANIMATION_DELETE = [
  trigger('fadeOut', [
    state('visible', style({ opacity: 1, height: '*', padding: '*', margin: '*', transform: 'translateX(0)' })),
    state('hidden', style({ opacity: 0, height: 0, padding: 0, margin: 0, transform: 'translateX(100%)' })),
    transition('visible => hidden', animate('300ms ease-in')),
  ]),
];

export const pathSVG =
  'M94.936,66.98c-1.539-5.498-2.32-11.342-2.32-17.369c0-6.073,0.793-11.959,2.355-17.493  c0.059-0.208-0.023-0.432-0.203-0.552c-2.777-1.85-6.066-2.75-10.057-2.75c-4.975,0-10.438,1.369-16.223,2.818  c-6.453,1.617-13.125,3.289-19.881,3.289c-6.877,0-13.17-1.716-19.256-3.375c-5.153-1.405-10.021-2.732-14.534-2.732  c-3.688,0-6.83,0.899-9.605,2.75c-0.18,0.12-0.263,0.343-0.204,0.552c1.562,5.54,2.355,11.426,2.355,17.493  c0,6.068-0.792,11.955-2.355,17.496c-0.057,0.201,0.018,0.416,0.188,0.539s0.397,0.127,0.571,0.012  c2.607-1.738,5.568-2.582,9.053-2.582c4.379,0,9.183,1.311,14.27,2.697c5.862,1.598,12.507,3.41,19.518,3.41  c6.878,0,13.613-1.689,20.125-3.318c5.723-1.436,11.129-2.789,15.979-2.789c3.787,0,6.895,0.844,9.504,2.582  c0.084,0.057,0.18,0.084,0.275,0.084c0.008,0,0.016,0,0.021,0c0.275,0,0.5-0.223,0.5-0.5C95.01,67.146,94.982,67.057,94.936,66.98z';
