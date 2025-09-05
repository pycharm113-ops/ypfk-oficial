import { Injectable } from '@angular/core';
import { AsyncSubject, BehaviorSubject, filter, mapTo, Observable, race, ReplaySubject, take, takeUntil, timer } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt: any;

  private beforeInstall$ = new AsyncSubject<void>();
  private installAvailable = new ReplaySubject<boolean>(1);
  private installAvailable$ = this.installAvailable.asObservable();
  public acceptedInstallation = new BehaviorSubject(false);

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.installAvailable.next(true);
      this.beforeInstall$.next();
    });
  }

  waitForInstallPrompt(timeoutMs = 1000): Observable<boolean> {
    return race(
      this.installAvailable$.pipe(filter(Boolean), take(1), mapTo(true)),
      timer(timeoutMs).pipe(takeUntil(this.beforeInstall$), mapTo(false))
    );
  }

  async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;

    this.deferredPrompt.prompt();
    const choiceResult = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.installAvailable.next(false);

    return choiceResult.outcome === 'accepted';
  }

  isInAppBrowser(): boolean {
    const ua = navigator.userAgent || navigator.vendor;
    return /FBAN|FBAV|FB_IAB|Instagram|Line|Messenger|Snapchat|Telegram|TikTok/i.test(ua);
  }

  isStandaloneMode(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
  }
}
