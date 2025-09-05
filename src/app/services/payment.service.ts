import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
const base_url = environment.apiBackend;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  get token(): string {
    return localStorage.getItem('token') || '';
  }

  get headers() {
    return new HttpHeaders({ Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' });
  }

  crearPago(product: string) {
    const url = `${base_url}/payments/create-payment`;
    return this.http.post<any>(url, { product }, { headers: this.headers });
  }

  consultarEstado(product: string) {
    const url = `${base_url}/payments/status/${product}`;
    return this.http.get<any>(url, { headers: this.headers });
  }
}
