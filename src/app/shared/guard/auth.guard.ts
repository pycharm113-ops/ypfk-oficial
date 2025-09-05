import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IToken } from '../interfaces/interfaces';
import { jwtDecode } from 'jwt-decode';
import { SwalService } from '../../services/swal.service';

export const loggedGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  if (token) {
    router.navigateByUrl('/home');
    return false;
  }
  return true;
};

export const tokenGuard: CanActivateFn = (route, state) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const swalService = inject(SwalService);

  if (token) {
    try {
      const tokenData = jwtDecode(token) as IToken;
      const isTokenValid = tokenData.exp > Math.floor(Date.now() / 1000);
      const statusToken = tokenData.status;

      if (isTokenValid && statusToken) {
        return true;
      } else {
        localStorage.removeItem('token');
        router.navigateByUrl('/login');
        swalService.onAlerta('Sesión Expirado.', 'Por favor, inicia sesión nuevamente.');
        return false;
      }
    } catch (e) {
      localStorage.removeItem('token');
      router.navigateByUrl('/login');
      swalService.onAlerta('Token inválido.', 'Por favor, inicia sesión nuevamente.');
      return false;
    }
  } else {
    router.navigateByUrl('/login');
    return false;
  }
};

export const bcpGuard: CanActivateFn = () => {
  const token = localStorage.getItem('token');
  const router = inject(Router);

  if (token) {
    const tokenData = jwtDecode(token) as IToken;

    if (tokenData.bcp) {
      return true;
    }
  }

  router.navigateByUrl('/');
  return false;
};
