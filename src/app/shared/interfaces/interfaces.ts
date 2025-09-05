export interface ILogin {
  status: boolean;
  token: string;
  msg: string;
  reason?: string;
  retryAt?: number;
}

export interface IToken {
  sub: string;
  status: boolean;
  payment: boolean;
  bcp: boolean;
  ibk: boolean;
  pin: string;
  reseller: string;
  autocomplete: boolean;
  autoExpired: string;
  client: boolean;
  titular?: string;
  email?: string;
  expiresAt: number;
  iat: number;
  exp: number;
}

export interface IValidateToken {
  status: boolean;
  payment: boolean;
  bcp: boolean;
  expiresAt: number;
  msg: string;
}

export interface IProfile {
  titular: string;
  saldo: number;
}

export interface IVendedor {
  nombre: string;
  enlace: string;
  icon: string;
}

export interface IPersona {
  titular: string;
  celular: string;
  destino: string;
}

export interface IMovimiento {
  titular: string;
  celular: string;
  monto: number;
  mensaje: string;
  destino: string;
  fecha?: string;
  operacion: string;
  payment: boolean;
  recarga?: boolean;
  montoAgo?: number;
  fechaAgo?: string;
  celularMask?: string;
  date?: IDate;
  showphone?: boolean;
}

export interface IConfig {
  banner: string;
  confetti: number;
  autoPayment: boolean;
  showTitularsReal: boolean;
  showTitularsFake: boolean;
  showSearch: boolean;
  showBanner: boolean;
  showConfetti: boolean;
  allowMore500: boolean;
  allowChangeDate?: boolean;
  allowSwipe?: boolean;
}

export interface IDate {
  fecha: string;
  hora: string;
}

export interface ICuenta {
  id: number;
  nombre: string;
  nrocuenta: string;
  cci: string;
  saldo: number;
  moneda: string;
  order?: number | null;
  mask?: string;
}

export interface IMovimientoBcp {
  titular: string;
  empresa: string;
  monto: number;
  comision: number;
  moneda: string;
  destino: string;
  nrocuenta: string;
  fecha: string;
  operacion: string;
  esTransferencia: boolean;
  esServicio: boolean;
  esYape: boolean;
  selfTransaction: boolean;
  idCuenta: number;
  glosa: any;
  nameMask?: string;
  fechaMask?: string;
}

// UTILS
export interface ITeclado {
  tipo?: string;
  valor?: number;
}

export interface IResource {
  banners: IBanner[];
  publicitys: IBanner[];
}

export interface IBanner {
  id: string;
  title: string;
  img: string;
}

export interface IProduct {
  _id: string;
  name: string;
  code: string;
  price: number;
  status: boolean;
  features: string[];
}
