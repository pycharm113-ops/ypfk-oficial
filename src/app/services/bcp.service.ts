import { Inject, Injectable, Renderer2, RendererFactory2, DOCUMENT } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ACCOUNTS } from '../shared/utils/constants';
import { ICuenta, IMovimientoBcp } from '../shared/interfaces/interfaces';
const accounts: ICuenta[] = JSON.parse(localStorage.getItem('accounts') || JSON.stringify(ACCOUNTS));
const movements: IMovimientoBcp[] = JSON.parse(localStorage.getItem('movements') || JSON.stringify([]));

@Injectable({
  providedIn: 'root',
})
export class BcpService {
  public accounts = new BehaviorSubject<ICuenta[]>(accounts);
  public movimientos = new BehaviorSubject<IMovimientoBcp[]>(movements);
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: Document) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  createAccount(data: ICuenta): void {
    const accounts = this.accounts.getValue();
    const maxId = Math.max(...accounts.map((acc) => acc.id || 0), 0);
    data.id = maxId + 1;
    const newAccounts = [...accounts, data];
    this.accounts.next(newAccounts);
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
  }

  updateAccount(index: number, data: ICuenta): void {
    const accounts = [...this.accounts.getValue()];

    const orderIndex = accounts.findIndex((acc, i) => acc.order === data.order && acc.id !== data.id);

    if (orderIndex !== -1) {
      accounts[orderIndex] = { ...accounts[orderIndex], order: null };
    }

    accounts[index] = data;
    localStorage.setItem('accounts', JSON.stringify(accounts));
    this.accounts.next(accounts);
  }

  updateMovements(array: IMovimientoBcp[], accountId: number) {
    const movimientos = this.movimientos.getValue();
    const otroMovimientos = movimientos.filter((x) => x.idCuenta !== accountId);
    const movimientosActualizados = otroMovimientos.concat(array);
    localStorage.setItem('movements', JSON.stringify(movimientosActualizados));
    this.movimientos.next(movimientosActualizados);
  }

  deleteAccount(data: ICuenta): void {
    const accounts = this.accounts.getValue();
    const newAccounts = accounts.filter((x) => x.id !== data.id);
    localStorage.setItem('accounts', JSON.stringify(newAccounts));
    this.accounts.next(newAccounts);
    this.deleteMovements(data.id);
  }

  deleteMovements(idCuenta: number) {
    const movimientos = this.movimientos.getValue();
    const movimientosActualizados = movimientos.filter((item) => item.idCuenta !== idCuenta);
    localStorage.setItem('movements', JSON.stringify(movimientosActualizados));
    this.movimientos.next(movimientosActualizados);
  }

  updateAccountMovements(data: IMovimientoBcp, accountId: number) {
    const accounts = this.accounts.getValue();
    const i = accounts.findIndex((x) => x.id === accountId);
    accounts[i].saldo = Math.max(accounts[i].saldo - data.monto - data.comision, 0);
    this.accounts.next(accounts);
    localStorage.setItem('accounts', JSON.stringify(accounts));

    const newArray = [...this.movimientos.getValue(), data];
    this.movimientos.next(newArray);
    localStorage.setItem('movements', JSON.stringify(newArray));
  }

  updateThemeColorBCP(flag: boolean): void {
    const color = flag ? '#002a8e' : '#732283';

    const metaTag = this.document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      this.renderer.setAttribute(metaTag, 'content', color);
    }

    window.postMessage(JSON.stringify({ themeColor: color }), '*');
  }
}
