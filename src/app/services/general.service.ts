import { Inject, Injectable, Renderer2, RendererFactory2, DOCUMENT } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

import {
  IBanner,
  IConfig,
  ILogin,
  IMovimiento,
  IPersona,
  IProduct,
  IProfile,
  IResource,
  IToken,
  IValidateToken,
} from '../shared/interfaces/interfaces';
import { ConstantesGenerales } from '../shared/utils/constants';
import { environment } from '../../environments/environment';
const settings = ConstantesGenerales.SETTINGS;
const base_url = environment.apiBackend;

@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  public settings: IConfig = JSON.parse(localStorage.getItem('settings') || JSON.stringify(settings));
  private numbers: IPersona[] = JSON.parse(localStorage.getItem('titulares') || JSON.stringify([]));
  private movements: IMovimiento[] = JSON.parse(localStorage.getItem('movimientos') || JSON.stringify([]));
  private renderer: Renderer2;

  public profile = new BehaviorSubject<IProfile>(null);
  public titulares = new BehaviorSubject<IPersona[]>(this.numbers);
  public movimientos = new BehaviorSubject<IMovimiento[]>(this.movements);
  public onRefreshToken = new BehaviorSubject<boolean>(null);
  public onDispatchTour = new BehaviorSubject<boolean>(false);

  public banners = new BehaviorSubject<IBanner[]>([]);
  public publicitys = new BehaviorSubject<IBanner[]>([]);

  constructor(private http: HttpClient, private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.setValuesProfile();
  }

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get decodedToken(): IToken {
    return jwtDecode(this.token);
  }

  get email(): string {
    return this.decodedToken.email;
  }

  get reseller(): string {
    return this.decodedToken?.reseller;
  }

  get superadmin(): boolean {
    return ConstantesGenerales.DEVELOPS.includes(this.decodedToken.sub);
  }

  get resellers(): boolean {
    return ConstantesGenerales.RESELLERS.includes(this.decodedToken.sub);
  }

  get userfreeAdmin(): boolean {
    return !this.decodedToken.payment && !this.decodedToken.client;
  }

  get userfreeClient(): boolean {
    return !this.decodedToken.payment && this.decodedToken.client;
  }

  get isAutocompleteActive(): boolean {
    const autoExpired = this.decodedToken.autoExpired;
    if (!autoExpired) return false;
    const now = new Date();
    const expiry = new Date(autoExpired);
    return expiry.getTime() > now.getTime();
  }

  get headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' });
  }

  get linkSoporte(): string {
    const soporte = ConstantesGenerales.SOPORTE.find((s) => s._id === this.reseller);
    return soporte?.link ?? ConstantesGenerales.SOPORTE[0].link;
  }

  setValuesProfile() {
    const local = localStorage.getItem('datos');
    const defaultProfile = { titular: 'Usuario', saldo: 10000 };
    let datos: IProfile;

    if (local) {
      datos = JSON.parse(local);
    } else {
      try {
        const decoded = this.decodedToken;
        datos = { titular: decoded?.titular || defaultProfile.titular, saldo: defaultProfile.saldo };
        localStorage.setItem('datos', JSON.stringify(datos));
      } catch {
        datos = defaultProfile;
      }
    }

    this.profile = new BehaviorSubject<IProfile>(datos);
  }

  esBilletera(destino: string): boolean {
    const bancos = ['Yape', 'Plin', 'Bim', 'Tunki', 'Agora / Oh!'];
    return bancos.includes(destino);
  }

  onRegister(data: any): Observable<any> {
    const url = `${base_url}/auth/register`;
    return this.http.post<any>(url, data);
  }

  verifyClient(email: string): Observable<any> {
    const url = `${base_url}/auth/verifyClient`;
    return this.http.post<any>(url, { email });
  }

  verifyCode(data: any): Observable<any> {
    const url = `${base_url}/auth/verifyCode`;
    return this.http.post<any>(url, data);
  }

  onCrearPIN(data: any): Observable<ILogin> {
    const url = `${base_url}/auth/create_pin`;
    return this.http.post<ILogin>(url, data);
  }

  verifySend(data: any): Observable<any> {
    const url = `${base_url}/auth/verifySend`;
    return this.http.post<any>(url, data, { headers: this.headers });
  }

  verifyEmail(data: any): Observable<any> {
    const url = `${base_url}/auth/verifyEmail`;
    return this.http.post<any>(url, data, { headers: this.headers });
  }

  verifyToken(): Observable<any> {
    const url = `${base_url}/auth/verifyToken`;
    return this.http.get<any>(url, { headers: this.headers });
  }

  migrateUser(data: any): Observable<any> {
    const url = `${base_url}/auth/migrateUser`;
    return this.http.post<any>(url, data, { headers: this.headers });
  }

  recoverPin(data: any): Observable<any> {
    const url = `${base_url}/auth/recoverPin`;
    return this.http.post<any>(url, data, { headers: this.headers });
  }

  onLoginClient(data: any): Observable<ILogin> {
    const url = `${base_url}/auth/access`;
    return this.http.post<ILogin>(url, data);
  }

  logoutClient(): Observable<any> {
    const url = `${base_url}/auth/logoutClient`;
    return this.http.post<any>(url, null, { headers: this.headers });
  }

  logoutUser(): Observable<any> {
    const url = `${base_url}/auth/logoutUser`;
    return this.http.post<any>(url, null, { headers: this.headers });
  }

  onLogin(pin: string): Observable<ILogin> {
    const url = `${base_url}/auth/login`;
    return this.http.post<ILogin>(url, { pin });
  }

  onValidarSesion(): Observable<IValidateToken> {
    const url = `${base_url}/auth/refresh`;
    return this.http.get<IValidateToken>(url, { headers: this.headers });
  }

  onActualizarPIN(pin: string): Observable<ILogin> {
    const url = `${base_url}/auth/update_pin`;
    return this.http.post<ILogin>(url, { pin }, { headers: this.headers });
  }

  private resourcesCache$: Observable<IResource> | null = null;
  onGetResources(): Observable<IResource> {
    if (this.resourcesCache$) {
      return this.resourcesCache$;
    }

    const url = `${base_url}/resources/get_resources`;
    this.resourcesCache$ = this.http.get<IResource>(url, { headers: this.headers }).pipe(
      tap((resp) => {
        this.banners.next(resp.banners);
        this.publicitys.next(resp.publicitys);
      }),
      shareReplay(1)
    );

    return this.resourcesCache$;
  }

  public products = new BehaviorSubject<IProduct[]>([]);
  private productsCache$: Observable<IProduct[]> | null = null;
  getProducts(): Observable<IProduct[]> {
    if (this.productsCache$) return this.productsCache$;

    const url = `${base_url}/products/get_products`;
    this.productsCache$ = this.http.get<IProduct[]>(url, { headers: this.headers }).pipe(
      tap((resp) => {
        this.products.next(resp);
      }),
      shareReplay(1)
    );
    return this.productsCache$;
  }

  refreshProducts(): void {
    this.productsCache$ = null;
  }

  getOsiptelData(number: string): Observable<any> {
    return this.http.get<any>(`${base_url}/auth/verifyNumber?number=${number}`, { headers: this.headers });
  }

  removeMovimientoByOperacion(operacion: string) {
    const raw = localStorage.getItem('movimientos');
    let array: IMovimiento[] = [];

    try {
      array = raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error parsing localStorage:', e);
    }

    const updatedArray = array.filter((item) => item.operacion !== operacion);

    localStorage.setItem('movimientos', JSON.stringify(updatedArray));
    this.movimientos.next(updatedArray);
  }

  updateThemeColorYape(flag: boolean): void {
    const color = flag ? '#4A1972' : '#732283';

    const metaTag = this.document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      this.renderer.setAttribute(metaTag, 'content', color);
    }

    window.postMessage(JSON.stringify({ themeColor: color }), '*');
  }

  loadIcon() {
    const img = new Image();
    img.src = 'yape.png';
  }
}
