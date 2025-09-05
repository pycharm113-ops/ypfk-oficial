import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SwalService } from './swal.service';

@Injectable({
  providedIn: 'root',
})
export class CooldownService {
  constructor(private router: Router, private swalService: SwalService) {}

  private expiresAtSubject = new BehaviorSubject<number | null>(null);
  private countdownSub?: Subscription;
  expiresAt$ = this.expiresAtSubject.asObservable();

  iniciarContador(expiresAt: number) {
    const now = Date.now();
    const timeLeft = expiresAt - now;

    if (timeLeft <= 0) {
      this.onLogoutCooldown();
      return;
    }

    this.expiresAtSubject.next(timeLeft);
    this.countdownSub?.unsubscribe();

    this.countdownSub = interval(1000).subscribe(() => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        this.expiresAtSubject.next(0);
        this.countdownSub?.unsubscribe();
        this.onLogoutCooldown();
      } else {
        this.expiresAtSubject.next(remaining);
      }
    });
  }

  onIniciarContador(expiresAt: number) {
    this.iniciarContador(expiresAt);
  }

  onDetenerContador() {
    this.countdownSub?.unsubscribe();
    this.countdownSub = undefined;
    this.expiresAtSubject.next(null);
  }

  onLogoutCooldown() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
    this.swalService.onNotificar('Su sesión de prueba ha expirado.');
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigateByUrl('/login');
    this.onDetenerContador();
  }

  onLogoutWithEmail(email: string) {
    localStorage.removeItem('datos');
    localStorage.removeItem('token');
    localStorage.removeItem('verify');
    this.router.navigateByUrl(`/login?email=${encodeURIComponent(email)}`);
    this.onDetenerContador();
  }

  formatTimeCooldown(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const hh = h.toString().padStart(2, '0');
    const mm = m.toString().padStart(2, '0');
    const ss = s.toString().padStart(2, '0');

    return days > 0 ? `${days} días y ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
  }
}
